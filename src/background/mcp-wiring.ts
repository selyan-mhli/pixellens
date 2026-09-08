// PixelLens — Branchement du pont MCP sur les capacités réelles de l'extension
//
// Le client (lib/mcp-bridge) ne sait rien de chrome.* : il reçoit ici des
// fonctions déjà câblées. C'est ce qui rend le protocole testable sans navigateur.

import { MessageType } from '@/types/messages'
import type { MarkdownResult } from '@/types/markdown'
import type { DesignSystem } from '@/types/design-system'
import { buildLlmBundle } from '@/lib/llm-bundle'
import { renderPageInTab, type TabRenderDeps } from '@/lib/tab-render'
import {
  McpBridgeClient,
  DEFAULT_BRIDGE_SETTINGS,
  type BridgeSettings,
  type BridgeStatus,
} from '@/lib/mcp-bridge'

export const BRIDGE_SETTINGS_KEY = 'mcpBridge'
export const BRIDGE_STATUS_KEY = 'mcpBridgeStatus'

const SCAN_TIMEOUT_MS = 20_000

/** Message clair plutôt qu'un `undefined` que l'assistant ne saurait pas lire. */
const UNSUPPORTED =
  'This page cannot be read: PixelLens has no access to it (chrome:// pages, the Web Store and the PDF viewer are off limits).'

async function activeTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) throw new Error('No active tab.')
  return tab.id
}

async function extractMarkdown(): Promise<MarkdownResult> {
  const tabId = await activeTabId()
  let result: MarkdownResult | undefined
  try {
    result = await chrome.tabs.sendMessage(tabId, {
      type: MessageType.EXTRACT_MARKDOWN,
      payload: undefined,
    })
  } catch {
    throw new Error(UNSUPPORTED)
  }
  if (!result) throw new Error(UNSUPPORTED)
  return result
}

/**
 * Le scan répond par diffusion (SCAN_COMPLETE), pas en retour d'appel : on écoute
 * cette diffusion, avec un garde-fou de temps pour ne jamais laisser l'assistant
 * attendre indéfiniment.
 */
async function scanDesignSystem(): Promise<DesignSystem> {
  const tabId = await activeTabId()

  const waitForScan = new Promise<DesignSystem>((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.runtime.onMessage.removeListener(listener)
      reject(new Error('The page did not finish scanning in time.'))
    }, SCAN_TIMEOUT_MS)

    function listener(message: { type?: MessageType; payload?: unknown }) {
      if (message?.type !== MessageType.SCAN_COMPLETE) return
      clearTimeout(timer)
      chrome.runtime.onMessage.removeListener(listener)
      resolve((message.payload as { designSystem: DesignSystem }).designSystem)
    }
    chrome.runtime.onMessage.addListener(listener)
  })

  try {
    await chrome.tabs.sendMessage(tabId, { type: MessageType.SCAN_PAGE, payload: undefined })
  } catch {
    throw new Error(UNSUPPORTED)
  }
  return waitForScan
}

export function createBridgeHandlers(deps: TabRenderDeps) {
  return {
    read_page: async () => (await extractMarkdown()).fullDocument,

    read_url: async (url: string) => {
      const outcome = await renderPageInTab(url, deps)
      if (!('markdown' in outcome) || !outcome.markdown) {
        const reason = (outcome as { reason?: string }).reason ?? 'unknown'
        throw new Error(`Could not read ${url} (${reason}).`)
      }
      return (outcome.markdown as MarkdownResult).fullDocument
    },

    design_system: async () => await scanDesignSystem(),

    bundle: async () => {
      const markdown = await extractMarkdown()
      // Le design system est un bonus : une page qui refuse le scan doit
      // quand même rendre son contenu plutôt que de faire échouer l'appel.
      let designSystem: DesignSystem | null = null
      try {
        designSystem = await scanDesignSystem()
      } catch {
        designSystem = null
      }
      return buildLlmBundle({ markdown, designSystem })
    },
  }
}

export async function readBridgeSettings(): Promise<BridgeSettings> {
  const stored = await chrome.storage.local.get(BRIDGE_SETTINGS_KEY)
  return { ...DEFAULT_BRIDGE_SETTINGS, ...(stored[BRIDGE_SETTINGS_KEY] ?? {}) }
}

/**
 * Démarre le pont et le garde aligné sur les réglages, sans redémarrage.
 *
 * Ne jette jamais : ce code s'exécute au chargement du service worker, et une
 * exception ici emporterait TOUTE l'extension, pont ou pas. Une fonctionnalité
 * facultative n'a pas le droit de casser l'inspecteur et le scan.
 */
export function installBridge(deps: TabRenderDeps): McpBridgeClient | null {
  if (typeof chrome === 'undefined' || !chrome.storage?.local || !chrome.storage.onChanged) {
    return null
  }

  try {
    const client = new McpBridgeClient(
      createBridgeHandlers(deps),
      (status: BridgeStatus, detail) => {
        void chrome.storage.local.set({ [BRIDGE_STATUS_KEY]: { status, detail, at: Date.now() } })
      },
    )

    void readBridgeSettings()
      .then((settings) => client.start(settings))
      .catch(() => {})

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[BRIDGE_SETTINGS_KEY]) return
      void readBridgeSettings()
        .then((settings) => client.start(settings))
        .catch(() => {})
    })

    return client
  } catch {
    return null
  }
}
