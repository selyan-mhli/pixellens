// PixelLens — Gumroad License Layer
//
// SEUL module du projet qui parle à Gumroad. Vérifie une clé de licence contre
// l'endpoint officiel `POST /v2/licenses/verify` et gère l'état local (free/pro).
//
// Règles produit (figées) :
//  - `increment_uses_count` est TOUJOURS `false` : une (re)vérification ou une
//    réinstallation ne doit jamais faire grimper le compteur d'utilisations Gumroad.
//  - Remboursée / contestée / annulée → `revoked` (Gumroad a répondu : plus de droits).
//  - Réseau coupé / API en panne / réponse illisible → `unreachable`, JAMAIS `invalid`.
//  - FAIL-OPEN : un Pro dont la re-vérification est `unreachable` RESTE Pro.
//    Quelqu'un qui a payé et qui prend l'avion reste Pro.
//
// Comme lib/crawler (CrawlDeps), tout l'I/O est injecté via `LicenseDeps` :
// le module se teste sans réseau ni horloge.

import type { LicenseState, VerifyOutcome } from '@/types/license'
import { GUMROAD_PRODUCT_ID, GUMROAD_VERIFY_ENDPOINT } from './constants'
import { getStoredLicense, setStoredLicense } from './storage'

/** I/O injecté — permet de tester la vérification sans réseau ni horloge. */
export interface LicenseDeps {
  fetch: typeof globalThis.fetch
  now: () => string
}

const defaultDeps: LicenseDeps = {
  fetch: (...args) => globalThis.fetch(...args),
  now: () => new Date().toISOString(),
}

/** Timeout dur d'une vérification (AbortController). */
export const VERIFY_TIMEOUT_MS = 10_000

/** Une licence Pro n'est re-vérifiée que si sa dernière vérification a plus de 30 jours. */
export const REFRESH_AFTER_DAYS = 30

export const DEFAULT_LICENSE: LicenseState = {
  tier: 'free',
  key: null,
  verifiedAt: null,
  lastError: null,
}

// Forme (partielle) de la réponse Gumroad. Tous les champs sont optionnels : une
// réponse qui n'a pas la forme attendue est traitée comme illisible (unreachable).
interface GumroadPurchase {
  refunded?: boolean
  chargebacked?: boolean
  disputed?: boolean
  dispute_won?: boolean
  subscription_ended_at?: string | null
  subscription_cancelled_at?: string | null
  subscription_failed_at?: string | null
}

interface GumroadVerifyBody {
  success?: boolean
  message?: string
  purchase?: GumroadPurchase
}

/** Raison de révocation lisible, ou null si l'achat ouvre toujours des droits. */
function revocationReason(purchase: GumroadPurchase): string | null {
  if (purchase.refunded) return 'Achat remboursé'
  if (purchase.chargebacked) return 'Paiement contesté (chargeback)'
  if (purchase.disputed && !purchase.dispute_won) return 'Paiement en litige'
  // Champs d'abonnement : null pour un achat unique, renseignés si un produit
  // membership a été arrêté — traités par prudence comme une fin de droits.
  if (purchase.subscription_ended_at) return 'Abonnement terminé'
  if (purchase.subscription_cancelled_at) return 'Abonnement annulé'
  if (purchase.subscription_failed_at) return 'Paiement d’abonnement échoué'
  return null
}

/**
 * Vérifie une clé auprès de Gumroad. Ne lève jamais : toute impossibilité de
 * conclure (réseau, timeout, réponse illisible) devient `unreachable`.
 */
export async function verifyLicense(
  key: string,
  deps: LicenseDeps = defaultDeps,
): Promise<VerifyOutcome> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS)

  let response: Response
  try {
    response = await deps.fetch(GUMROAD_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: key,
        // Jamais true : réinstaller ou re-vérifier ne doit pas gonfler le compteur.
        increment_uses_count: 'false',
      }).toString(),
      signal: controller.signal,
    })
  } catch {
    // Réseau coupé, DNS, timeout (abort) — on n'a pas pu savoir.
    return { status: 'unreachable', reason: 'Réseau indisponible ou délai dépassé' }
  } finally {
    clearTimeout(timer)
  }

  let body: GumroadVerifyBody
  try {
    body = (await response.json()) as GumroadVerifyBody
  } catch {
    return { status: 'unreachable', reason: `Réponse illisible (HTTP ${response.status})` }
  }

  // Clé inconnue : Gumroad répond 404 avec { success: false, message }.
  if (response.status === 404 && body.success === false) {
    return { status: 'invalid', reason: body.message ?? 'Clé inconnue de Gumroad' }
  }

  // Tout autre statut non-OK (5xx, 401…) : l'API n'a pas conclu sur la clé.
  if (!response.ok) {
    return { status: 'unreachable', reason: `Gumroad a répondu HTTP ${response.status}` }
  }

  // 200 : la réponse doit avoir la forme attendue, sinon on ne conclut pas.
  if (body.success !== true || typeof body.purchase !== 'object' || body.purchase === null) {
    return { status: 'unreachable', reason: 'Réponse Gumroad inattendue (champs manquants)' }
  }

  const revoked = revocationReason(body.purchase)
  if (revoked) return { status: 'revoked', reason: revoked }

  return { status: 'valid', verifiedAt: deps.now() }
}

/** Lit l'état de licence stocké (chrome.storage.local), ou l'état gratuit par défaut. */
export async function readLicense(): Promise<LicenseState> {
  const stored = await getStoredLicense()
  return stored ?? { ...DEFAULT_LICENSE }
}

/** Persiste l'état de licence (chrome.storage.local, clé `pixellens:license`). */
export async function writeLicense(state: LicenseState): Promise<void> {
  await setStoredLicense(state)
}

/** `true` si `verifiedAt` est absent ou plus vieux que REFRESH_AFTER_DAYS jours. */
function isStale(verifiedAt: string | null, nowIso: string): boolean {
  if (!verifiedAt) return true
  const verified = Date.parse(verifiedAt)
  if (Number.isNaN(verified)) return true
  return Date.parse(nowIso) - verified > REFRESH_AFTER_DAYS * 24 * 60 * 60 * 1000
}

/**
 * Re-vérifie une licence Pro si sa dernière vérification date de plus de 30 jours.
 * Pur vis-à-vis du stockage : renvoie le nouvel état, c'est l'appelant qui persiste.
 *
 * FAIL-OPEN (la règle la plus importante du module) : sur `unreachable` on renvoie
 * l'état INCHANGÉ — tier Pro conservé, `verifiedAt` intact. On ne dégrade en free
 * que sur `invalid` ou `revoked`, quand Gumroad a répondu clairement.
 */
export async function refreshLicenseIfStale(
  state: LicenseState,
  deps: LicenseDeps = defaultDeps,
): Promise<LicenseState> {
  if (state.tier !== 'pro' || !state.key) return state
  if (!isStale(state.verifiedAt, deps.now())) return state

  const outcome = await verifyLicense(state.key, deps)
  switch (outcome.status) {
    case 'valid':
      return { ...state, tier: 'pro', verifiedAt: outcome.verifiedAt, lastError: null }
    case 'revoked':
    case 'invalid':
      return { ...state, tier: 'free', lastError: outcome.reason }
    case 'unreachable':
      return state
  }
}
