import { useEffect, useState } from 'react'
import { PlugsConnected, CheckCircle, WarningCircle, CircleNotch, Lock } from '@phosphor-icons/react'
import { BRIDGE_SETTINGS_KEY, BRIDGE_STATUS_KEY } from '@/background/mcp-wiring'
import { usePanelStore } from '../store'
import { DEFAULT_BRIDGE_SETTINGS, type BridgeSettings, type BridgeStatus } from '@/lib/mcp-bridge'

/**
 * Réglage du pont local pour les assistants.
 *
 * Éteint par défaut, et il doit le rester : allumé, il permet à un programme de
 * votre machine de lire le contenu de vos onglets. L'écran le dit franchement
 * plutôt que de le cacher derrière un interrupteur anodin.
 */

const STATUS_LABEL: Record<BridgeStatus, string> = {
  off: 'Off',
  connecting: 'Connecting…',
  connected: 'Connected',
  refused: 'Token refused',
  unreachable: 'Server not running',
}

function BridgeSection() {
  const isPro = usePanelStore((s) => s.isPro)
  const [settings, setSettings] = useState<BridgeSettings>(DEFAULT_BRIDGE_SETTINGS)
  const [status, setStatus] = useState<BridgeStatus>('off')
  const [detail, setDetail] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    chrome.storage.local.get([BRIDGE_SETTINGS_KEY, BRIDGE_STATUS_KEY]).then((stored) => {
      setSettings({ ...DEFAULT_BRIDGE_SETTINGS, ...(stored[BRIDGE_SETTINGS_KEY] ?? {}) })
      const s = stored[BRIDGE_STATUS_KEY] as { status?: BridgeStatus; detail?: string } | undefined
      if (s?.status) setStatus(s.status)
      if (s?.detail) setDetail(s.detail)
      setLoaded(true)
    })

    const onChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local' || !changes[BRIDGE_STATUS_KEY]) return
      const next = changes[BRIDGE_STATUS_KEY].newValue as { status: BridgeStatus; detail?: string }
      setStatus(next.status)
      setDetail(next.detail ?? null)
    }
    chrome.storage.onChanged.addListener(onChange)
    return () => chrome.storage.onChanged.removeListener(onChange)
  }, [])

  const persist = (next: BridgeSettings) => {
    setSettings(next)
    void chrome.storage.local.set({ [BRIDGE_SETTINGS_KEY]: next })
  }

  const toggle = async () => {
    const next = { ...settings, enabled: !settings.enabled }
    // La permission n'est demandée qu'au moment de l'allumage : tant que le pont
    // est éteint, l'extension n'a aucun accès réseau supplémentaire.
    if (next.enabled) {
      const granted = await chrome.permissions.request({ origins: ['http://127.0.0.1/*'] })
      if (!granted) return
    }
    persist(next)
  }

  if (!loaded) return null

  // Fonctionnalité Pro. L'interface le dit avant que l'utilisateur essaie,
  // plutôt que de laisser un interrupteur qui ne ferait rien.
  if (!isPro) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-1.5">
          <PlugsConnected size={14} weight="bold" className="text-panel-accent" />
          <h2 className="text-[12px] font-semibold text-panel-text">Local AI bridge</h2>
          <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wide text-panel-accent">
            <Lock size={10} weight="bold" />
            Pro
          </span>
        </div>
        <p className="text-[11px] text-panel-text-dim leading-relaxed">
          Lets an assistant on this machine read the page you are on, through
          PixelLens, with your own session. Included in Pro, along with Copy for
          LLM, token exports and the full crawl.
        </p>
      </section>
    )
  }

  const Icon =
    status === 'connected' ? CheckCircle : status === 'connecting' ? CircleNotch : WarningCircle
  const tone =
    status === 'connected'
      ? 'text-emerald-400'
      : status === 'refused'
        ? 'text-red-400'
        : 'text-panel-text-dim'

  return (
    <section>
      <div className="flex items-center gap-2 mb-1.5">
        <PlugsConnected size={14} weight="bold" className="text-panel-accent" />
        <h2 className="text-[12px] font-semibold text-panel-text">Local AI bridge</h2>
      </div>
      <p className="text-[11px] text-panel-text-dim leading-relaxed mb-3">
        Lets an assistant on this machine read the page you are on, through
        PixelLens. Nothing is sent anywhere: the bridge only talks to a server
        running on your own computer.
      </p>

      <label className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-panel-surface border border-panel-border cursor-pointer">
        <span className="text-[11px] text-panel-text">
          {settings.enabled ? 'Bridge is on' : 'Bridge is off'}
        </span>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={toggle}
          className="accent-panel-accent w-4 h-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent"
        />
      </label>

      {settings.enabled && (
        <div className="mt-2 space-y-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-panel-text-dim">
              Pairing token
            </span>
            <input
              type="text"
              spellCheck={false}
              autoComplete="off"
              value={settings.token}
              onChange={(e) => persist({ ...settings, token: e.target.value.trim() })}
              placeholder="Paste the token printed by pixellens-mcp"
              className="mt-1 w-full px-2 py-1.5 rounded-md bg-panel-bg border border-panel-border text-[11px] font-mono text-panel-text placeholder:text-panel-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent"
            />
          </label>

          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-panel-surface border border-panel-border">
            <Icon size={13} className={tone} />
            <span className={`text-[11px] ${tone}`}>{STATUS_LABEL[status]}</span>
          </div>
          {detail && <p className="text-[10px] text-panel-text-dim leading-relaxed">{detail}</p>}

          {status !== 'connected' && (
            <p className="text-[10px] text-panel-text-dim leading-relaxed">
              Start the server in a terminal with{' '}
              <code className="font-mono text-panel-text">npx pixellens-mcp</code>, then paste the
              token it prints.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export default BridgeSection
