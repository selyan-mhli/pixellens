import { useState } from 'react'
import { useEffect } from 'react'
import { Palette, SealCheck, CircleNotch, Key, ArrowsClockwise } from '@phosphor-icons/react'
import { usePanelStore } from '../store'
import { getPreferences, setPreferences } from '@/lib/storage'
import { checkPaidStatus, applyOutcome, writeLicense } from '@/lib/license'
import { extpay, realLicenseDeps } from '@/lib/extpay'
import ColorSwatch from '../components/ColorSwatch'

type ColorFormat = 'hex' | 'rgb' | 'hsl'

const COLOR_FORMATS: { id: ColorFormat; label: string }[] = [
  { id: 'hex', label: 'HEX' },
  { id: 'rgb', label: 'RGB' },
  { id: 'hsl', label: 'HSL' },
]

// Brand accent — gives the live preview an on-page sample to format.
const PREVIEW_COLOR = '#6366F1'

// Section « Licence » — paiement in-app via ExtensionPay, aucune clé à saisir.
// Règle : `unreachable` sur un utilisateur DÉJÀ Pro ne change rien à son état.
function LicenseSection() {
  const license = usePanelStore((s) => s.license)
  const isPro = usePanelStore((s) => s.isPro)
  const setLicense = usePanelStore((s) => s.setLicense)

  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Vérification manuelle (« Vérifier mon paiement » / « Re-vérifier ») : consulte
  // ExtensionPay et applique l'issue. Fail-open : `unreachable` n'altère jamais
  // l'état — un Pro hors ligne reste Pro, seul un message informatif s'affiche.
  const handleCheck = async () => {
    if (checking) return
    setChecking(true)
    setMessage(null)
    try {
      const outcome = await checkPaidStatus(realLicenseDeps)
      if (outcome.status === 'unreachable') {
        setMessage('Impossible de joindre le serveur de paiement. Réessayez plus tard.')
        return
      }
      if (outcome.status === 'unpaid' && !isPro) {
        setMessage(
          'Aucun paiement trouvé pour ce navigateur. Déjà payé ailleurs ? Utilisez « J’ai déjà payé ».',
        )
      }
      const next = applyOutcome(license, outcome)
      if (next !== license) {
        await writeLicense(next)
        setLicense(next)
      }
    } finally {
      setChecking(false)
    }
  }

  const handleUpgrade = () => {
    extpay.openPaymentPage().catch((err) => console.error('[PixelLens]', err))
  }

  const handleRestore = () => {
    extpay.openLoginPage().catch((err) => console.error('[PixelLens]', err))
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

      {isPro ? (
        <div className="p-3 rounded-lg bg-panel-surface border border-panel-border">
          <div className="flex items-center gap-1.5 mb-1">
            <SealCheck size={14} weight="fill" className="text-success" />
            <p className="text-[12px] font-semibold text-panel-text">PixelLens Pro ✓</p>
          </div>
          {license.email && (
            <p className="text-[11px] text-panel-text-dim font-mono">{license.email}</p>
          )}
          {verifiedLabel && (
            <p className="text-[10px] text-panel-text-dim mt-0.5">Vérifiée le {verifiedLabel}</p>
          )}
          {message && (
            <p className="text-[11px] text-panel-text-dim leading-relaxed mt-2">{message}</p>
          )}
          <button
            onClick={() => void handleCheck()}
            disabled={checking}
            className="mt-2.5 flex items-center gap-1 text-[10px] text-panel-text-dim hover:text-panel-text transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent rounded"
          >
            {checking ? (
              <CircleNotch size={10} className="animate-spin" />
            ) : (
              <ArrowsClockwise size={10} />
            )}
            {checking ? 'Vérification…' : 'Re-vérifier mon paiement'}
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-panel-surface border border-panel-border">
          <p className="text-[11px] text-panel-text-dim mb-2.5">Version gratuite</p>
          <button
            onClick={handleUpgrade}
            className="w-full px-3 py-2 rounded-lg bg-panel-accent text-white text-[12px] font-medium hover:bg-panel-accent-hover transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel-bg"
          >
            Passer en Pro — 19 € à vie
          </button>
          <div className="flex items-center justify-between mt-2.5">
            <button
              onClick={handleRestore}
              className="text-[11px] text-panel-text-dim hover:text-panel-text transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent rounded"
            >
              J’ai déjà payé
            </button>
            <button
              onClick={() => void handleCheck()}
              disabled={checking}
              className="flex items-center gap-1 text-[11px] text-panel-text-dim hover:text-panel-text transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent rounded"
            >
              {checking && <CircleNotch size={10} className="animate-spin" />}
              {checking ? 'Vérification…' : 'Vérifier mon paiement'}
            </button>
          </div>
          {/* Message local, sinon la dernière erreur persistée (ex. un statut Pro
              dégradé par la re-vérification des 30 jours). */}
          {(message || license.lastError) && (
            <p className="text-[11px] text-panel-text-dim leading-relaxed mt-2">
              {message ?? license.lastError}
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
