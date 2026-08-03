import { useEffect, useRef, useState } from 'react'
import { Palette, SealCheck, CircleNotch, Key } from '@phosphor-icons/react'
import { usePanelStore } from '../store'
import { getPreferences, setPreferences } from '@/lib/storage'
import { verifyLicense, writeLicense, DEFAULT_LICENSE } from '@/lib/license'
import { GUMROAD_PRODUCT_URL } from '@/lib/constants'
import ColorSwatch from '../components/ColorSwatch'
import type { LicenseState } from '@/types/license'

type ColorFormat = 'hex' | 'rgb' | 'hsl'

const COLOR_FORMATS: { id: ColorFormat; label: string }[] = [
  { id: 'hex', label: 'HEX' },
  { id: 'rgb', label: 'RGB' },
  { id: 'hsl', label: 'HSL' },
]

// Brand accent — gives the live preview an on-page sample to format.
const PREVIEW_COLOR = '#6366F1'

/** Masque une clé pour l'affichage : `XXXX-…-1234` (on ne montre que la fin). */
function maskKey(key: string): string {
  if (key.length <= 4) return 'XXXX'
  return `XXXX-…-${key.slice(-4)}`
}

/** Formulations humaines, jamais alarmistes, des issues d'activation. */
const VERIFY_ERRORS: Record<'invalid' | 'revoked' | 'unreachable', string> = {
  invalid: 'Cette clé n’est pas reconnue. Vérifiez l’email de confirmation Gumroad.',
  revoked: 'Cette licence n’est plus active (remboursement ou annulation).',
  unreachable: 'Impossible de joindre le serveur de licence. Réessayez plus tard.',
}

// Section « Licence » — seule UI de gestion de la clé Gumroad.
// Règle : `unreachable` sur un utilisateur DÉJÀ Pro ne change rien à son état.
function LicenseSection() {
  const license = usePanelStore((s) => s.license)
  const isPro = usePanelStore((s) => s.isPro)
  const setLicense = usePanelStore((s) => s.setLicense)
  const focusRequested = usePanelStore((s) => s.settingsFocusLicense)
  const setSettingsFocusLicense = usePanelStore((s) => s.setSettingsFocusLicense)

  const [keyInput, setKeyInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus one-shot demandé par « J'ai déjà une clé » (ProGate) — puis consommé.
  useEffect(() => {
    if (!focusRequested) return
    inputRef.current?.focus()
    setSettingsFocusLicense(false)
  }, [focusRequested, setSettingsFocusLicense])

  const handleActivate = async () => {
    const key = keyInput.trim()
    if (!key || verifying) return
    setVerifying(true)
    setError(null)
    try {
      const outcome = await verifyLicense(key)
      if (outcome.status === 'valid') {
        const next: LicenseState = {
          tier: 'pro',
          key,
          verifiedAt: outcome.verifiedAt,
          lastError: null,
        }
        await writeLicense(next)
        setLicense(next)
        setKeyInput('')
      } else {
        // invalid / revoked / unreachable : on affiche l'erreur SANS toucher à
        // l'état existant — un Pro qui re-teste une clé hors ligne reste Pro.
        setError(VERIFY_ERRORS[outcome.status])
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleRemove = async () => {
    if (!confirmRemove) {
      setConfirmRemove(true)
      return
    }
    const next: LicenseState = { ...DEFAULT_LICENSE }
    await writeLicense(next)
    setLicense(next)
    setConfirmRemove(false)
    setError(null)
  }

  let verifiedLabel: string | null = null
  if (license.verifiedAt) {
    try {
      verifiedLabel = new Date(license.verifiedAt).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      })
    } catch {
      verifiedLabel = license.verifiedAt
    }
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-1.5">
        <Key size={14} weight="bold" className="text-panel-accent" />
        <h2 className="text-[12px] font-semibold text-panel-text">Licence</h2>
      </div>

      {isPro && license.key ? (
        <div className="p-3 rounded-lg bg-panel-surface border border-panel-border">
          <div className="flex items-center gap-1.5 mb-1">
            <SealCheck size={14} weight="fill" className="text-success" />
            <p className="text-[12px] font-semibold text-panel-text">PixelLens Pro ✓</p>
          </div>
          <p className="text-[11px] text-panel-text-dim font-mono">{maskKey(license.key)}</p>
          {verifiedLabel && (
            <p className="text-[10px] text-panel-text-dim mt-0.5">Vérifiée le {verifiedLabel}</p>
          )}
          {error && (
            <p className="text-[11px] text-panel-text-dim leading-relaxed mt-2">{error}</p>
          )}
          <button
            onClick={handleRemove}
            onBlur={() => setConfirmRemove(false)}
            className={`mt-2.5 text-[10px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent rounded ${
              confirmRemove
                ? 'text-red-400 font-medium'
                : 'text-panel-text-dim hover:text-panel-text'
            }`}
          >
            {confirmRemove ? 'Confirmer le retrait ? (clic pour retirer)' : 'Retirer la licence'}
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-panel-surface border border-panel-border">
          <p className="text-[11px] text-panel-text-dim mb-2.5">Version gratuite</p>
          <button
            onClick={() => window.open(GUMROAD_PRODUCT_URL, '_blank', 'noopener,noreferrer')}
            className="w-full px-3 py-2 rounded-lg bg-panel-accent text-white text-[12px] font-medium hover:bg-panel-accent-hover transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel-bg"
          >
            Passer en Pro — 19 € à vie
          </button>
          <label className="block mt-3">
            <span className="text-[10px] uppercase tracking-wide text-panel-text-dim">
              Clé de licence
            </span>
            <div className="flex gap-2 mt-1">
              <input
                ref={inputRef}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleActivate()
                }}
                disabled={verifying}
                placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                spellCheck={false}
                className="flex-1 min-w-0 text-[11px] font-mono text-panel-text bg-panel-bg border border-panel-border rounded-lg px-2 py-1.5 placeholder:text-panel-text-dim/50 focus:outline-none focus:border-panel-accent disabled:opacity-50"
              />
              <button
                onClick={() => void handleActivate()}
                disabled={verifying || !keyInput.trim()}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-panel-border text-panel-text text-[11px] font-medium hover:bg-panel-bg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent focus-visible:ring-offset-1 focus-visible:ring-offset-panel-bg"
              >
                {verifying && <CircleNotch size={12} className="animate-spin" />}
                {verifying ? 'Vérification…' : 'Activer'}
              </button>
            </div>
          </label>
          {/* Erreur locale d'activation, sinon la dernière erreur persistée (ex. une
              licence dégradée par la re-vérification des 30 jours). */}
          {(error || license.lastError) && (
            <p className="text-[11px] text-panel-text-dim leading-relaxed mt-2">
              {error ?? license.lastError}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function SettingsView() {
  // The store's colorFormat is the single source of truth the colour displays
  // (ColorSwatch in Inspect / Scan / Design System) read from, so driving the
  // control off it keeps this setting and every rendered colour in lockstep.
  const colorFormat = usePanelStore((s) => s.colorFormat)
  const setColorFormat = usePanelStore((s) => s.setColorFormat)

  // On open, adopt the canonical preference (chrome.storage.sync, where setPreferences
  // writes) into the panel store, so a value set elsewhere (popup / another device)
  // wins over the locally persisted panel envelope before we start editing.
  useEffect(() => {
    let cancelled = false
    getPreferences()
      .then((prefs) => {
        if (!cancelled) setColorFormat(prefs.colorFormat)
      })
      .catch((err) => console.error('[PixelLens]', err))
    return () => {
      cancelled = true
    }
  }, [setColorFormat])

  const handleColorFormat = (format: ColorFormat) => {
    // setColorFormat = immediate effect (re-renders every ColorSwatch) and persists
    // to the panel envelope. setPreferences mirrors it into the canonical sync prefs.
    setColorFormat(format)
    setPreferences({ colorFormat: format }).catch((err) => console.error('[PixelLens]', err))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        <LicenseSection />

        <section>
          <div className="flex items-center gap-2 mb-1.5">
            <Palette size={14} weight="bold" className="text-panel-accent" />
            <h2 className="text-[12px] font-semibold text-panel-text">Color format</h2>
          </div>
          <p className="text-[11px] text-panel-text-dim leading-relaxed mb-3">
            How colours are shown across Inspect, Scan and Design System.
          </p>

          <div className="flex gap-1 p-0.5 bg-panel-surface rounded-lg">
            {COLOR_FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => handleColorFormat(f.id)}
                aria-pressed={colorFormat === f.id}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel-bg ${
                  colorFormat === f.id
                    ? 'bg-panel-accent text-white shadow-sm'
                    : 'text-panel-text-dim hover:text-panel-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Live preview — reads the same store value as every colour display,
              so it updates the instant the format changes (proof the control is live). */}
          <div className="mt-3 flex items-center gap-3 p-2.5 rounded-lg bg-panel-surface border border-panel-border">
            <span className="text-[10px] uppercase tracking-wide text-panel-text-dim shrink-0">
              Preview
            </span>
            <ColorSwatch color={PREVIEW_COLOR} size={22} showLabel />
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsView
