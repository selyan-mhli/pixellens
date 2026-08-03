// PixelLens — License Types
//
// Contrat de la couche licence (gratuit / Pro à vie via Gumroad). Le gating est
// côté client et assumé comme tel : ces types décrivent un ÉTAT, pas une preuve.

export type LicenseTier = 'free' | 'pro'

export type LicenseState = {
  tier: LicenseTier
  /** Clé saisie par l'utilisateur, telle quelle. null si aucune. */
  key: string | null
  /** ISO 8601 de la dernière vérification réussie. null si jamais vérifiée. */
  verifiedAt: string | null
  /** Dernière erreur lisible par un humain, pour l'afficher dans les Réglages. */
  lastError: string | null
}

export type VerifyOutcome =
  | { status: 'valid'; verifiedAt: string }
  /** La clé existe mais n'ouvre plus de droits : remboursée, contestée, annulée. */
  | { status: 'revoked'; reason: string }
  /** La clé est inconnue de Gumroad. */
  | { status: 'invalid'; reason: string }
  /** On n'a pas pu savoir : réseau coupé, API en panne, réponse illisible. */
  | { status: 'unreachable'; reason: string }
