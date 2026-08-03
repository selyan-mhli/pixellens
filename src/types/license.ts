// PixelLens — License Types
//
// Contrat de la couche licence (gratuit / Pro à vie via ExtensionPay). Le gating
// est côté client et assumé comme tel : ces types décrivent un ÉTAT, pas une preuve.
// L'utilisateur paye sur extensionpay.com (Stripe) — aucune clé à saisir : le
// statut « payé » est lu depuis leur API et mis en cache localement (fail-open).

export type LicenseTier = 'free' | 'pro'

export type LicenseState = {
  tier: LicenseTier
  /** Email du compte ExtensionPay ayant payé, si connu. null sinon. */
  email: string | null
  /** ISO 8601 de la dernière vérification réussie. null si jamais vérifiée. */
  verifiedAt: string | null
  /** Dernière erreur lisible par un humain, pour l'afficher dans les Réglages. */
  lastError: string | null
}

export type VerifyOutcome =
  /** ExtensionPay confirme un paiement pour ce navigateur. */
  | { status: 'paid'; verifiedAt: string; email: string | null }
  /** ExtensionPay a répondu clairement : aucun paiement (jamais payé, remboursé…). */
  | { status: 'unpaid' }
  /** On n'a pas pu savoir : réseau coupé, API en panne, réponse illisible. */
  | { status: 'unreachable'; reason: string }
