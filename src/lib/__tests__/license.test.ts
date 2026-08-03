import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  verifyLicense,
  refreshLicenseIfStale,
  VERIFY_TIMEOUT_MS,
  type LicenseDeps,
} from '../license'
import type { LicenseState } from '@/types/license'

// Réponse Gumroad minimale d'un achat SAIN (ni remboursé, ni contesté, ni annulé).
const validPurchaseBody = {
  success: true,
  uses: 3,
  purchase: {
    id: 'purchase-id',
    product_name: 'PixelLens Pro',
    email: 'buyer@example.com',
    refunded: false,
    chargebacked: false,
    subscription_ended_at: null,
    subscription_cancelled_at: null,
    subscription_failed_at: null,
  },
}

const NOW = '2026-08-03T12:00:00.000Z'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeDeps(fetchImpl: typeof globalThis.fetch): LicenseDeps {
  return { fetch: fetchImpl, now: () => NOW }
}

function proState(verifiedAt: string): LicenseState {
  return { tier: 'pro', key: 'ABCD-1234', verifiedAt, lastError: null }
}

/** ISO d'il y a `days` jours par rapport à NOW. */
function daysAgo(days: number): string {
  return new Date(Date.parse(NOW) - days * 24 * 60 * 60 * 1000).toISOString()
}

afterEach(() => {
  vi.useRealTimers()
})

describe('verifyLicense', () => {
  it('réponse valide → valid, verifiedAt = now()', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(validPurchaseBody))
    const outcome = await verifyLicense('ABCD-1234', makeDeps(fetchMock))
    expect(outcome).toEqual({ status: 'valid', verifiedAt: NOW })
    // Le compteur d'utilisations Gumroad ne doit JAMAIS être incrémenté.
    const body = String((fetchMock.mock.calls[0] as unknown[])[1]
      ? (((fetchMock.mock.calls[0] as unknown[])[1]) as RequestInit).body
      : '')
    expect(body).toContain('increment_uses_count=false')
  })

  it('clé inconnue (404 + success:false) → invalid', async () => {
    const outcome = await verifyLicense(
      'UNKNOWN-KEY',
      makeDeps(async () =>
        jsonResponse(
          { success: false, message: 'That license does not exist for the provided product.' },
          404,
        ),
      ),
    )
    expect(outcome.status).toBe('invalid')
  })

  it('achat remboursé → revoked', async () => {
    const outcome = await verifyLicense(
      'ABCD-1234',
      makeDeps(async () =>
        jsonResponse({
          ...validPurchaseBody,
          purchase: { ...validPurchaseBody.purchase, refunded: true },
        }),
      ),
    )
    expect(outcome.status).toBe('revoked')
  })

  it('paiement contesté (chargeback) → revoked', async () => {
    const outcome = await verifyLicense(
      'ABCD-1234',
      makeDeps(async () =>
        jsonResponse({
          ...validPurchaseBody,
          purchase: { ...validPurchaseBody.purchase, chargebacked: true },
        }),
      ),
    )
    expect(outcome.status).toBe('revoked')
  })

  it('abonnement annulé → revoked', async () => {
    const outcome = await verifyLicense(
      'ABCD-1234',
      makeDeps(async () =>
        jsonResponse({
          ...validPurchaseBody,
          purchase: {
            ...validPurchaseBody.purchase,
            subscription_cancelled_at: '2026-01-01T00:00:00Z',
          },
        }),
      ),
    )
    expect(outcome.status).toBe('revoked')
  })

  it('fetch qui rejette → unreachable, jamais invalid', async () => {
    const outcome = await verifyLicense(
      'ABCD-1234',
      makeDeps(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    expect(outcome.status).toBe('unreachable')
  })

  it('fetch qui ne répond jamais (timeout 10 s) → unreachable', async () => {
    vi.useFakeTimers()
    // fetch pendu : ne se résout que si le signal d'abort le rejette.
    const hangingFetch: typeof globalThis.fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('The operation was aborted.', 'AbortError')),
        )
      })
    const promise = verifyLicense('ABCD-1234', makeDeps(hangingFetch))
    await vi.advanceTimersByTimeAsync(VERIFY_TIMEOUT_MS + 1)
    const outcome = await promise
    expect(outcome.status).toBe('unreachable')
  })

  it('HTTP 200 mais corps illisible → unreachable, pas un crash', async () => {
    const outcome = await verifyLicense(
      'ABCD-1234',
      makeDeps(async () => new Response('<html>not json</html>', { status: 200 })),
    )
    expect(outcome.status).toBe('unreachable')
  })

  it('HTTP 200 mais champs manquants (success:true sans purchase) → unreachable', async () => {
    const outcome = await verifyLicense(
      'ABCD-1234',
      makeDeps(async () => jsonResponse({ success: true })),
    )
    expect(outcome.status).toBe('unreachable')
  })

  it('HTTP 500 → unreachable, jamais invalid', async () => {
    const outcome = await verifyLicense(
      'ABCD-1234',
      makeDeps(async () => jsonResponse({ success: false, message: 'oops' }, 500)),
    )
    expect(outcome.status).toBe('unreachable')
  })
})

describe('refreshLicenseIfStale', () => {
  it('Pro vérifié il y a 5 jours → aucun appel réseau, état inchangé', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>()
    const state = proState(daysAgo(5))
    const next = await refreshLicenseIfStale(state, makeDeps(fetchMock))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(next).toEqual(state)
  })

  it('Pro vérifié il y a 40 jours avec fetch en panne → RESTE Pro (fail-open)', async () => {
    const state = proState(daysAgo(40))
    const next = await refreshLicenseIfStale(
      state,
      makeDeps(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    expect(next.tier).toBe('pro')
    // verifiedAt intact : on ne « rafraîchit » pas sur une vérification impossible.
    expect(next.verifiedAt).toBe(state.verifiedAt)
  })

  it('Pro vérifié il y a 40 jours, clé toujours valide → verifiedAt mis à jour', async () => {
    const next = await refreshLicenseIfStale(
      proState(daysAgo(40)),
      makeDeps(async () => jsonResponse(validPurchaseBody)),
    )
    expect(next.tier).toBe('pro')
    expect(next.verifiedAt).toBe(NOW)
  })

  it('Pro vérifié il y a 40 jours, achat remboursé → dégradé en free avec lastError', async () => {
    const next = await refreshLicenseIfStale(
      proState(daysAgo(40)),
      makeDeps(async () =>
        jsonResponse({
          ...validPurchaseBody,
          purchase: { ...validPurchaseBody.purchase, refunded: true },
        }),
      ),
    )
    expect(next.tier).toBe('free')
    expect(next.lastError).toBeTruthy()
  })

  it('utilisateur free → aucun appel réseau', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>()
    const state: LicenseState = { tier: 'free', key: null, verifiedAt: null, lastError: null }
    const next = await refreshLicenseIfStale(state, makeDeps(fetchMock))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(next).toEqual(state)
  })
})
