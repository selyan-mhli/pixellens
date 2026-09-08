/**
 * Tests du pont, centrés sur ce qui protège les onglets de l'utilisateur.
 * Runner natif Node : aucune dépendance, donc aucune CVE de runner.
 */
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import WebSocket from 'ws'
import { Bridge, generateToken } from '../dist/bridge.js'

const PORT = 8799
const TOKEN = generateToken()
const URL = `ws://127.0.0.1:${PORT}`
const EXT_ORIGIN = 'chrome-extension://abcdefghijklmnopabcdefghijklmnop'

let bridge

before(async () => {
  bridge = new Bridge(TOKEN, PORT)
  await bridge.listen()
})

after(async () => {
  await bridge.close()
})

/** Attend que le pont n'ait plus aucune extension branchee. */
async function waitDisconnected(timeoutMs = 2000) {
  const start = Date.now()
  while (bridge.connected) {
    if (Date.now() - start > timeoutMs) throw new Error('bridge still connected')
    await new Promise((r) => setTimeout(r, 20))
  }
}

/** Ouvre une connexion et rend soit 'open', soit le code de fermeture. */
function connect(options) {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL, options)
    ws.on('open', () => resolve({ outcome: 'open', ws }))
    ws.on('error', () => resolve({ outcome: 'rejected' }))
    ws.on('close', (code) => resolve({ outcome: 'closed', code }))
  })
}

describe('handshake', () => {
  test('refuse une page web (origine http)', async () => {
    const r = await connect({ origin: 'https://evil.example' })
    assert.notEqual(r.outcome, 'open', 'une origine web ne doit jamais passer le handshake')
  })

  test('refuse une connexion sans origine', async () => {
    const r = await connect({})
    assert.notEqual(r.outcome, 'open', 'une connexion anonyme ne doit pas passer')
  })

  test('laisse entrer une extension', async () => {
    const r = await connect({ origin: EXT_ORIGIN })
    assert.equal(r.outcome, 'open')
    r.ws.close()
  })
})

describe('authentification', () => {
  test('ferme la connexion sur un mauvais jeton', async () => {
    const { ws } = await connect({ origin: EXT_ORIGIN })
    const code = await new Promise((resolve) => {
      ws.on('close', resolve)
      ws.send(JSON.stringify({ type: 'hello', protocol: 1, token: 'wrong', client: 'test' }))
    })
    assert.equal(code, 4005, 'un mauvais jeton doit fermer avec 4005')
  })

  test('ferme la connexion sur une mauvaise version de protocole', async () => {
    const { ws } = await connect({ origin: EXT_ORIGIN })
    const code = await new Promise((resolve) => {
      ws.on('close', resolve)
      ws.send(JSON.stringify({ type: 'hello', protocol: 99, token: TOKEN, client: 'test' }))
    })
    assert.equal(code, 4004)
  })

  test('souhaite la bienvenue avec le bon jeton', async () => {
    const { ws } = await connect({ origin: EXT_ORIGIN })
    const msg = await new Promise((resolve) => {
      ws.on('message', (raw) => resolve(JSON.parse(String(raw))))
      ws.send(JSON.stringify({ type: 'hello', protocol: 1, token: TOKEN, client: 'test' }))
    })
    assert.equal(msg.type, 'welcome')
    ws.close()
  })
})

describe('appels', () => {
  test('echoue clairement quand aucun navigateur n est connecte', async () => {
    // Les tests de handshake ont pu laisser une socket en cours de fermeture.
    await waitDisconnected()
    await assert.rejects(() => bridge.call('read_page'), /No browser connected/)
  })

  test('fait l aller-retour avec l extension', async () => {
    const { ws } = await connect({ origin: EXT_ORIGIN })
    await new Promise((resolve) => {
      ws.on('message', (raw) => {
        const msg = JSON.parse(String(raw))
        if (msg.type === 'welcome') return resolve()
      })
      ws.send(JSON.stringify({ type: 'hello', protocol: 1, token: TOKEN, client: 'test' }))
    })

    // L'extension repond a la requete du serveur.
    ws.on('message', (raw) => {
      const msg = JSON.parse(String(raw))
      if (msg.method === 'read_page') {
        ws.send(JSON.stringify({ id: msg.id, ok: true, result: '# Hello' }))
      }
    })

    const result = await bridge.call('read_page')
    assert.equal(result, '# Hello')
    ws.close()
  })

  test('remonte l erreur renvoyee par l extension', async () => {
    const { ws } = await connect({ origin: EXT_ORIGIN })
    await new Promise((resolve) => {
      ws.on('message', (raw) => {
        const msg = JSON.parse(String(raw))
        if (msg.type === 'welcome') return resolve()
      })
      ws.send(JSON.stringify({ type: 'hello', protocol: 1, token: TOKEN, client: 'test' }))
    })
    ws.on('message', (raw) => {
      const msg = JSON.parse(String(raw))
      if (msg.method === 'read_page') {
        ws.send(JSON.stringify({ id: msg.id, ok: false, error: 'Page not supported' }))
      }
    })

    await assert.rejects(() => bridge.call('read_page'), /Page not supported/)
    ws.close()
  })
})
