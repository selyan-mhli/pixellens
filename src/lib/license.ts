// PixelLens — License Layer (ExtensionPay)
//
// Décide du tier (free/pro) à partir du statut de paiement ExtensionPay et le met
// en cache localement. AUCUN import de la lib `extpay` ici : l'accès réseau est
// injecté via `LicenseDeps` (même pattern que CrawlDeps dans lib/crawler), ce qui
// rend le module testable sans réseau ni horloge — et le garde utilisable depuis
// n'importe quel contexte (panel, service worker, tests).
//
// Règles produit (figées) :
//  - `unpaid` = ExtensionPay a répondu clairement (jamais payé, remboursé) →
//    on peut dégrader en free.
//  - Réseau coupé / API en panne / réponse illisible → `unreachable`, JAMAIS `unpaid`.
//  - FAIL-OPEN : un Pro dont la re-vérification est `unreachable` RESTE Pro.
//    Quelqu'un qui a payé et qui prend l'avion reste Pro.

import type { LicenseState, VerifyOutcome } from '@/types/license'
import { getStoredLicense, setStoredLicense } from './storage'

/** Sous-ensemble de l'objet user d'ExtensionPay dont la couche licence a besoin. */
export interface ExtPayUserLike {
  paid: boolean
  email: string | null
}

/** I/O injecté — permet de tester la vérification sans réseau ni horloge. */
export interface LicenseDeps {
  /** `extpay.getUser()` en prod (voir lib/extpay.ts) — REJETTE si hors ligne. */
  getUser: () => Promise<ExtPayUserLike>
  now: () => string
}

/** Timeout dur d'une vérification (getUser d'ExtPay n'en a pas). */
export const CHECK_TIMEOUT_MS = 10_000

/** Un statut Pro n'est re-vérifié que si sa dernière vérification a plus de 30 jours. */
export const REFRESH_AFTER_DAYS = 30

export const DEFAULT_LICENSE: LicenseState = {
  tier: 'free',
  email: null,
  verifiedAt: null,
  lastError: null,
}

/** Message quand un Pro est dégradé : ExtensionPay n'a pas retrouvé le paiement. */
export const UNPAID_DEGRADE_MESSAGE =
  'Votre paiement n’a pas été retrouvé (remboursement ou session expirée). ' +
  'Utilisez « J’ai déjà payé » pour le restaurer.'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err instanceof Error ? err : new Error(String(err)))
      },
    )
  })
}

/**
 * Interroge ExtensionPay sur le statut de paiement. Ne lève jamais : toute
 * impossibilité de conclure (réseau, timeout, réponse difforme) → `unreachable`.
 */
export async function checkPaidStatus(deps: LicenseDeps): Promise<VerifyOutcome> {
  let user: ExtPayUserLike
  try {
    user = await withTimeout(deps.getUser(), CHECK_TIMEOUT_MS)
  } catch {
    return { status: 'unreachable', reason: 'Réseau indisponible ou délai dépassé' }
  }

  // Réponse difforme (API changée, corps inattendu) : on ne conclut pas.
  if (typeof user !== 'object' || user === null || typeof user.paid !== 'boolean') {
    return { status: 'unreachable', reason: 'Réponse ExtensionPay inattendue' }
  }

  if (!user.paid) return { status: 'unpaid' }
  return { status: 'paid', verifiedAt: deps.now(), email: user.email ?? null }
}

/**
 * Applique une issue de vérification à un état : mapping PUR, partagé par la
 * re-vérification périodique, le listener onPaid et le bouton des Réglages.
 */
export function applyOutcome(state: LicenseState, outcome: VerifyOutcome): LicenseState {
  switch (outcome.status) {
    case 'paid':
      return {
        tier: 'pro',
        email: outcome.email ?? state.email,
        verifiedAt: outcome.verifiedAt,
        lastError: null,
      }
    case 'unpaid':
      // Réponse claire : pas de droits. On ne garde un message que si on DÉGRADE
      // un Pro — un gratuit qui vérifie reste simplement gratuit, sans erreur.
      return {
        ...state,
        tier: 'free',
        lastError: state.tier === 'pro' ? UNPAID_DEGRADE_MESSAGE : state.lastError,
      }
    case 'unreachable':
      // FAIL-OPEN : état inchangé — verifiedAt intact, tier conservé.
      return state
  }
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
 * Re-vérifie un statut Pro si sa dernière vérification date de plus de 30 jours.
 * Pur vis-à-vis du stockage : renvoie le nouvel état, c'est l'appelant qui persiste.
 * Les gratuits ne déclenchent JAMAIS d'appel réseau ici : ils passent Pro via le
 * paiement (onPaid), la restauration (openLoginPage) ou le bouton des Réglages.
 *
 * FAIL-OPEN (la règle la plus importante du module) : sur `unreachable` l'état
 * revient INCHANGÉ — tier Pro conservé, `verifiedAt` intact. On ne dégrade en
 * free que sur `unpaid`, quand ExtensionPay a répondu clairement.
 */
export async function refreshLicenseIfStale(
  state: LicenseState,
  deps: LicenseDeps,
): Promise<LicenseState> {
  if (state.tier !== 'pro') return state
  if (!isStale(state.verifiedAt, deps.now())) return state
  return applyOutcome(state, await checkPaidStatus(deps))
}
