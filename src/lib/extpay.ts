// PixelLens — Singleton ExtensionPay (côté pages d'extension : side panel, popup)
//
// SEUL point de contact avec la lib `extpay` dans l'UI. Le service worker crée sa
// propre instance (contexte JS séparé, voir background/service-worker.ts) ; le
// relais sur extensionpay.com est un content script dédié (content/extpay-relay.ts).
//
// `lib/license.ts` reste PUR (aucun import extpay) : il reçoit `getUser` via
// `LicenseDeps` — ce module fournit les deps réelles.

import ExtPay from 'extpay'
import { EXTPAY_EXTENSION_ID } from './constants'
import type { LicenseDeps } from './license'

export const extpay = ExtPay(EXTPAY_EXTENSION_ID)

/** Deps réelles injectées dans lib/license (les tests injectent les leurs). */
export const realLicenseDeps: LicenseDeps = {
  getUser: () => extpay.getUser(),
  now: () => new Date().toISOString(),
}
