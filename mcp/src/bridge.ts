/**
 * Le pont : un serveur WebSocket local que l'extension rejoint.
 *
 * Pourquoi ce sens de connexion : une extension Chrome ne peut pas écouter sur
 * un port, seul un processus Node le peut. C'est donc le serveur MCP qui écoute
 * et l'extension qui vient s'y brancher.
 *
 * Ce pont donne accès au contenu des onglets de l'utilisateur : c'est une
 * surface d'attaque réelle, traitée comme telle.
 *
 *   1. écoute sur 127.0.0.1 seulement, jamais sur 0.0.0.0
 *   2. n'accepte que des origines chrome-extension:// (une page web qui
 *      tenterait ws://127.0.0.1 enverrait http(s)://…, elle est refusée)
 *   3. exige un jeton partagé, comparé à temps constant
 *   4. une seule extension connectée à la fois
 */

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { WebSocketServer, type WebSocket } from 'ws'
import {
  BRIDGE_PROTOCOL,
  isBridgeHello,
  isBridgeResponse,
  type BridgeMethod,
  type BridgeRequest,
} from './protocol.js'

const CALL_TIMEOUT_MS = 30_000

/** Comparaison à temps constant sur des empreintes de taille fixe. */
function sameToken(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function generateToken(): string {
  return randomBytes(24).toString('base64url')
}

interface Pending {
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
  timer: NodeJS.Timeout
}

export class Bridge {
  private wss: WebSocketServer | null = null
  private client: WebSocket | null = null
  private pending = new Map<string, Pending>()
  private seq = 0

  constructor(
    private readonly token: string,
    private readonly port: number,
  ) {}

  get connected(): boolean {
    return this.client !== null && this.client.readyState === 1
  }

  listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wss = new WebSocketServer({
        host: '127.0.0.1',
        port: this.port,
        // Le handshake est refusé avant même d'ouvrir la socket si l'origine
        // n'est pas une extension : une page web ne passe pas cette ligne.
        verifyClient: ({ origin }, done) => {
          if (origin && origin.startsWith('chrome-extension://')) return done(true)
          done(false, 403, 'Only browser extensions may connect')
        },
      })

      wss.on('error', reject)
      wss.on('listening', () => {
        this.wss = wss
        resolve()
      })
      wss.on('connection', (socket) => this.onConnection(socket))
    })
  }

  private onConnection(socket: WebSocket): void {
    let authed = false

    // Une connexion qui ne se présente pas dans les 5 secondes est larguée.
    const helloTimer = setTimeout(() => {
      if (!authed) socket.close(4001, 'No hello')
    }, 5_000)

    socket.on('message', (raw) => {
      let msg: unknown
      try {
        msg = JSON.parse(String(raw))
      } catch {
        socket.close(4002, 'Malformed frame')
        return
      }

      if (!authed) {
        if (!isBridgeHello(msg)) {
          socket.close(4003, 'Expected hello')
          return
        }
        if (msg.protocol !== BRIDGE_PROTOCOL) {
          socket.close(4004, `Protocol ${BRIDGE_PROTOCOL} required`)
          return
        }
        if (!sameToken(msg.token, this.token)) {
          socket.close(4005, 'Bad token')
          return
        }
        authed = true
        clearTimeout(helloTimer)

        // Le dernier arrivé remplace le précédent : rebrancher un navigateur
        // ne doit pas obliger à redémarrer le serveur.
        this.client?.close(4006, 'Replaced by a newer connection')
        this.client = socket
        socket.send(JSON.stringify({ type: 'welcome' }))
        return
      }

      if (typeof msg === 'object' && msg !== null && (msg as { type?: string }).type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }))
        return
      }

      if (!isBridgeResponse(msg)) return
      const waiting = this.pending.get(msg.id)
      if (!waiting) return
      this.pending.delete(msg.id)
      clearTimeout(waiting.timer)
      if (msg.ok) waiting.resolve(msg.result)
      else waiting.reject(new Error(msg.error))
    })

    socket.on('close', () => {
      clearTimeout(helloTimer)
      if (this.client === socket) this.client = null
    })
  }

  /** Envoie une requête à l'extension et attend sa réponse. */
  call(method: BridgeMethod, params: Record<string, unknown> = {}): Promise<unknown> {
    const socket = this.client
    if (!socket || socket.readyState !== 1) {
      return Promise.reject(
        new Error(
          'No browser connected. Open Chrome, then turn on the local AI bridge in the PixelLens side panel (Settings).',
        ),
      )
    }

    const id = `r${++this.seq}`
    const request: BridgeRequest = { id, method, params }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`The browser did not answer within ${CALL_TIMEOUT_MS / 1000}s.`))
      }, CALL_TIMEOUT_MS)

      this.pending.set(id, { resolve, reject, timer })
      socket.send(JSON.stringify(request))
    })
  }

  async close(): Promise<void> {
    for (const [, p] of this.pending) {
      clearTimeout(p.timer)
      p.reject(new Error('Bridge closing'))
    }
    this.pending.clear()
    this.client?.close()
    await new Promise<void>((resolve) => {
      if (!this.wss) return resolve()
      this.wss.close(() => resolve())
    })
  }
}
