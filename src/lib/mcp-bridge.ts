// PixelLens — Client du pont local pour les assistants (MCP)
//
// Une extension ne peut pas écouter sur un port : c'est donc le serveur
// `pixellens-mcp` qui écoute, et nous qui venons nous y brancher.
//
// Ce pont donne à un programme local le contenu des onglets de l'utilisateur.
// Il est donc éteint par défaut, s'active explicitement, et n'envoie jamais
// rien tant que le jeton n'a pas été accepté.
//
// Manifest V3 : le service worker meurt après 30 s d'inactivité. Le trafic
// WebSocket compte comme activité (Chrome 116+), d'où le ping périodique.

import {
  BRIDGE_PROTOCOL,
  DEFAULT_PORT,
  type BridgeRequest,
  type BridgeResponse,
} from './mcp-protocol'

const PING_MS = 20_000
const RETRY_MS = 5_000

export interface BridgeSettings {
  enabled: boolean
  token: string
  port: number
}

export const DEFAULT_BRIDGE_SETTINGS: BridgeSettings = {
  enabled: false,
  token: '',
  port: DEFAULT_PORT,
}

/** Ce que le pont sait exécuter. Injecté pour rester testable sans chrome.*. */
export interface BridgeHandlers {
  read_page: () => Promise<unknown>
  read_url: (url: string) => Promise<unknown>
  design_system: () => Promise<unknown>
  bundle: () => Promise<unknown>
}

export type BridgeStatus = 'off' | 'connecting' | 'connected' | 'refused' | 'unreachable'

export class McpBridgeClient {
  private socket: WebSocket | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private stopped = true
  private onStatus: (status: BridgeStatus, detail?: string) => void

  constructor(
    private readonly handlers: BridgeHandlers,
    onStatus: (status: BridgeStatus, detail?: string) => void = () => {},
  ) {
    this.onStatus = onStatus
  }

  start(settings: BridgeSettings): void {
    this.stop()
    if (!settings.enabled || !settings.token) {
      this.onStatus('off')
      return
    }
    this.stopped = false
    this.connect(settings)
  }

  stop(): void {
    this.stopped = true
    if (this.pingTimer) clearInterval(this.pingTimer)
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.pingTimer = null
    this.retryTimer = null
    this.socket?.close()
    this.socket = null
  }

  private connect(settings: BridgeSettings): void {
    if (this.stopped) return
    this.onStatus('connecting')

    let socket: WebSocket
    try {
      socket = new WebSocket(`ws://127.0.0.1:${settings.port}`)
    } catch {
      this.scheduleRetry(settings)
      return
    }
    this.socket = socket

    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          type: 'hello',
          protocol: BRIDGE_PROTOCOL,
          token: settings.token,
          client: 'PixelLens extension',
        }),
      )
    })

    socket.addEventListener('message', (event) => {
      let msg: unknown
      try {
        msg = JSON.parse(String(event.data))
      } catch {
        return
      }
      const tagged = msg as { type?: string }
      if (tagged.type === 'welcome') {
        this.onStatus('connected')
        // Le trafic garde le service worker en vie.
        this.pingTimer = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }))
          }
        }, PING_MS)
        return
      }
      if (tagged.type === 'pong') return
      void this.handle(socket, msg as BridgeRequest)
    })

    socket.addEventListener('close', (event) => {
      if (this.pingTimer) clearInterval(this.pingTimer)
      this.pingTimer = null
      // 4005 = jeton refusé. Réessayer en boucle serait inutile et bruyant.
      if (event.code === 4005) {
        this.stopped = true
        this.onStatus('refused', 'The server rejected this token.')
        return
      }
      if (event.code === 4004) {
        this.stopped = true
        this.onStatus('refused', 'Server and extension speak different protocol versions.')
        return
      }
      this.scheduleRetry(settings)
    })

    socket.addEventListener('error', () => {
      // « error » précède toujours « close » : le retry est géré là-bas.
      this.onStatus('unreachable')
    })
  }

  private scheduleRetry(settings: BridgeSettings): void {
    if (this.stopped) return
    this.onStatus('unreachable')
    this.retryTimer = setTimeout(() => this.connect(settings), RETRY_MS)
  }

  private async handle(socket: WebSocket, request: BridgeRequest): Promise<void> {
    if (!request?.id || !request.method) return

    const reply = (response: BridgeResponse) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(response))
    }

    try {
      let result: unknown
      switch (request.method) {
        case 'read_page':
          result = await this.handlers.read_page()
          break
        case 'read_url': {
          const url = String(request.params?.url ?? '')
          if (!/^https?:\/\//i.test(url)) throw new Error('Only http(s) URLs can be opened.')
          result = await this.handlers.read_url(url)
          break
        }
        case 'design_system':
          result = await this.handlers.design_system()
          break
        case 'bundle':
          result = await this.handlers.bundle()
          break
        default:
          throw new Error(`Unknown method: ${String(request.method)}`)
      }
      reply({ id: request.id, ok: true, result })
    } catch (error) {
      reply({ id: request.id, ok: false, error: (error as Error).message })
    }
  }
}
