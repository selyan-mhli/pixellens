// PixelLens — ProGate
//
// LE composant de gating, réutilisé partout. Principe d'UX : on ne montre jamais
// une porte fermée, on montre LE RÉSULTAT, dégradé — le rendu réel est derrière
// un voile flouté, et la carte par-dessus propose de l'emporter (Pro).
//
// Accessibilité (non négociable) : le contenu flouté est aria-hidden ET `inert`
// (le focus clavier ne peut pas y entrer) ; la carte est le seul contenu atteignable.

import { LockSimple, Key } from '@phosphor-icons/react'
import { usePanelStore } from '../store'
import { extpay } from '@/lib/extpay'

type ProGateProps = {
  /** Ce qu'on débloque, en une phrase courte, à la 2ᵉ personne. */
  title: string
  /** Pourquoi c'est utile, une phrase. */
  body: string
  /** Le rendu réel, affiché derrière le voile quand l'utilisateur est gratuit. */
  children: React.ReactNode
}

/**
 * Carte d'appel à l'action Pro, seule (sans voile). Utilisée par ProGate, et
 * directement là où le pattern « contenu flouté » ne s'applique pas (actions
 * inline, ex. édition de tokens dans DesignSystemView).
 */
export function ProGateCard({ title, body }: { title: string; body: string }) {
  // Paiement in-app via ExtensionPay : openPaymentPage ouvre l'onglet de paiement
  // (Stripe) ; au retour, onPaid (App.tsx + service worker) débloque sans rechargement.
  const handleUpgrade = () => {
    extpay.openPaymentPage().catch((err) => console.error('[PixelLens]', err))
  }

  // Achat déjà effectué sur un autre navigateur/profil : lien magique par email.
  const handleRestore = () => {
    extpay.openLoginPage().catch((err) => console.error('[PixelLens]', err))
  }

  return (
    <div className="flex flex-col items-center gap-2.5 px-4 py-4 rounded-xl bg-panel-bg/95 border border-panel-border shadow-xl text-center max-w-[240px]">
      <div className="w-8 h-8 rounded-lg bg-panel-accent/15 flex items-center justify-center">
        <LockSimple size={16} weight="bold" className="text-panel-accent" />
      </div>
      <div>
        <p className="text-[12px] font-semibold text-panel-text mb-0.5">{title}</p>
        <p className="text-[11px] text-panel-text-dim leading-relaxed">{body}</p>
      </div>
      <button
        onClick={handleUpgrade}
        className="w-full px-3 py-2 rounded-lg bg-panel-accent text-white text-[12px] font-medium hover:bg-panel-accent-hover transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel-bg"
      >
        Passer en Pro — 19 € à vie
      </button>
      <button
        onClick={handleRestore}
        className="flex items-center gap-1 text-[11px] text-panel-text-dim hover:text-panel-text transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-accent rounded"
      >
        <Key size={11} />
        J’ai déjà payé
      </button>
    </div>
  )
}

function ProGate({ title, body, children }: ProGateProps) {
  const isPro = usePanelStore((s) => s.isPro)

  // Pro → le rendu réel, tel quel : aucun wrapper, aucun coût visuel.
  if (isPro) return <>{children}</>

  // Empilement en grid (les deux couches dans la même cellule) : le conteneur prend
  // la hauteur du plus grand des deux — la carte ne déborde jamais d'un enfant plus
  // petit qu'elle (ex. un simple bouton), et reste centrée sur un enfant plus grand.
  return (
    <div className="grid">
      {/* Le résultat réel, visible mais flouté : il prouve que ça marche.
          inert + aria-hidden : invisible aux lecteurs d'écran ET infranchissable
          au clavier — la carte est le seul contenu atteignable. */}
      <div
        className="col-start-1 row-start-1 min-w-0 overflow-hidden blur-[6px] select-none pointer-events-none"
        aria-hidden="true"
        inert
      >
        {children}
      </div>
      <div className="col-start-1 row-start-1 z-10 flex items-center justify-center p-3">
        <ProGateCard title={title} body={body} />
      </div>
    </div>
  )
}

export default ProGate
