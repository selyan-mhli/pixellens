#!/usr/bin/env node
/**
 * pixellens-mcp — donne à un assistant l'accès aux pages telles que VOUS les
 * voyez : dans votre navigateur, avec votre session, vos onglets, vos
 * applications authentifiées.
 *
 * La différence avec les lecteurs de pages hébergés (Jina, Firecrawl et
 * consorts) tient en une phrase : ils récupèrent l'URL depuis leurs serveurs,
 * donc ils ne voient jamais ce qui est derrière une connexion et rendent mal
 * les applications JavaScript. Ici, c'est votre Chrome qui lit.
 *
 * stdout est réservé au protocole MCP. Tout message humain part sur stderr.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { McpServer } from '@modelcontextprotocol/server'
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'
import { z } from 'zod'
import { Bridge, generateToken } from './bridge.js'
import { DEFAULT_PORT } from './protocol.js'

const TOKEN_FILE = join(homedir(), '.pixellens-mcp', 'token')

/** Le jeton vit dans un fichier pour rester stable entre deux lancements. */
function loadOrCreateToken(): { token: string; created: boolean } {
  const fromEnv = process.env.PIXELLENS_TOKEN?.trim()
  if (fromEnv) return { token: fromEnv, created: false }

  try {
    const existing = readFileSync(TOKEN_FILE, 'utf8').trim()
    if (existing) return { token: existing, created: false }
  } catch {
    // premier lancement
  }

  const token = generateToken()
  mkdirSync(dirname(TOKEN_FILE), { recursive: true, mode: 0o700 })
  writeFileSync(TOKEN_FILE, token, { mode: 0o600 })
  return { token, created: true }
}

/** Les réponses de l'extension sont du JSON ; on les rend telles quelles. */
function asText(value: unknown): string {
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

async function main(): Promise<void> {
  const port = Number(process.env.PIXELLENS_PORT ?? DEFAULT_PORT)
  const { token, created } = loadOrCreateToken()
  const bridge = new Bridge(token, port)

  await bridge.listen()

  process.stderr.write(`pixellens-mcp listening on 127.0.0.1:${port}\n`)
  if (created) {
    process.stderr.write(
      `\n  Pairing token (paste it once into PixelLens > Settings > Local AI bridge):\n\n    ${token}\n\n` +
        `  Stored in ${TOKEN_FILE}\n\n`,
    )
  }

  const server = new McpServer({ name: 'pixellens', version: '0.1.0' })

  server.registerTool(
    'pixellens_read_page',
    {
      title: 'Read the active browser tab',
      description:
        'Convert the page currently open in the user browser into clean Markdown, ' +
        'including pages behind a login and JavaScript-heavy apps, because the ' +
        'conversion happens in their own browser session. Use this when the user ' +
        'refers to "this page", "the page I am on", or "what I am looking at".',
      inputSchema: {},
    },
    async () => ({
      content: [{ type: 'text' as const, text: asText(await bridge.call('read_page')) }],
    }),
  )

  server.registerTool(
    'pixellens_read_url',
    {
      title: 'Read a URL in the user browser',
      description:
        'Open a URL in a background tab of the user browser, let it render, then ' +
        'return clean Markdown. Prefer this over fetching the URL yourself when the ' +
        'page needs JavaScript or the user session to render correctly.',
      inputSchema: {
        url: z.string().url().describe('Absolute URL to open and convert'),
      },
    },
    async ({ url }) => ({
      content: [{ type: 'text' as const, text: asText(await bridge.call('read_url', { url })) }],
    }),
  )

  server.registerTool(
    'pixellens_design_system',
    {
      title: 'Extract the design system of the active tab',
      description:
        'Return the visual system of the page currently open: colour palette ' +
        '(clustered and classified), type scale, spacing scale, shadows and radii. ' +
        'Use it when asked to match, rebuild or audit the look of a page.',
      inputSchema: {},
    },
    async () => ({
      content: [{ type: 'text' as const, text: asText(await bridge.call('design_system')) }],
    }),
  )

  server.registerTool(
    'pixellens_bundle',
    {
      title: 'Read the active tab, content and design system together',
      description:
        'Return one self-describing bundle for the active tab: the page as Markdown, ' +
        'its extracted design system, and its metadata. Use it when you need both ' +
        'what the page says and how it looks.',
      inputSchema: {},
    },
    async () => ({
      content: [{ type: 'text' as const, text: asText(await bridge.call('bundle')) }],
    }),
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)

  const shutdown = async () => {
    await bridge.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error: unknown) => {
  process.stderr.write(`pixellens-mcp failed to start: ${String(error)}\n`)
  process.exit(1)
})
