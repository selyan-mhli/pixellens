import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  checkPaidStatus,
  refreshLicenseIfStale,
  applyOutcome,
  CHECK_TIMEOUT_MS,
  UNPAID_DEGRADE_MESSAGE,
  type LicenseDeps,
  type ExtPayUserLike,
} from '../license'
import type { LicenseState } from '@/types/license'

const NOW = '2026-08-03T12:00:00.000Z'

const paidUser: ExtPayUserLike = { paid: true, email: 'buyer@example.com' }
const unpaidUser: ExtPayUserLike = { paid: false, email: null }

function makeDeps(getUser: LicenseDeps['getUser']): LicenseDeps {
  return { getUser, now: () => NOW }
}

function proState(verifiedAt: string): LicenseState {
  return { tier: 'pro', email: 'buyer@example.com', verifiedAt, lastError: null }
}

/** ISO d'il y a `days` jours par rapport à NOW. */
function daysAgo(days: number): string {
  return new Date(Date.parse(NOW) - days * 24 * 60 * 60 * 1000).toISOString()
}

afterEach(() => {
  vi.useRealTimers()
})

describe('checkPaidStatus', () => {
  it('utilisateur payé → paid, verifiedAt = now(), email repris', async () => {
    const outcome = await checkPaidStatus(makeDeps(async () => paidUser))
    expect(outcome).toEqual({ status: 'paid', verifiedAt: NOW, email: 'buyer@example.com' })
  })

  it('jamais payé (ou remboursé) → unpaid', async () => {
    const outcome = await checkPaidStatus(makeDeps(async () => unpaidUser))
    expect(outcome).toEqual({ status: 'unpaid' })
  })

  it('getUser qui rejette (hors ligne) → unreachable, jamais unpaid', async () => {
    const outcome = await checkPaidStatus(
      makeDeps(async () => {
        throw new Error('network down')
      }),
    )
    expect(outcome.status).toBe('unreachable')
  })

  it('getUser qui ne répond jamais (timeout 10 s) → unreachable', async () => {
    vi.useFakeTimers()
    const promise = checkPaidStatus(makeDeps(() => new Promise<ExtPayUserLike>(() => {})))
    await vi.advanceTimersByTimeAsync(CHECK_TIMEOUT_MS + 1)
    const outcome = await promise
    expect(outcome.status).toBe('unreachable')
  })

  it('réponse difforme (paid manquant) → unreachable, pas un crash', async () => {
    const outcome = await checkPaidStatus(
      makeDeps(async () => ({}) as unknown as ExtPayUserLike),
    )
    expect(outcome.status).toBe('unreachable')
  })
})

describe('applyOutcome', () => {
  it('paid sur un état free → passe pro, efface lastError', () => {
    const free: LicenseState = { tier: 'free', email: null, verifiedAt: null, lastError: 'x' }
    const next = applyOutcome(free, { status: 'paid', verifiedAt: NOW, email: 'a@b.c' })
    expect(next).toEqual({ tier: 'pro', email: 'a@b.c', verifiedAt: NOW, lastError: null })
  })

  it('unpaid sur un état pro → dégrade en free avec message', () => {
    const next = applyOutcome(proState(daysAgo(40)), { status: 'unpaid' })
    expect(next.tier).toBe('free')
    expect(next.lastError).toBe(UNPAID_DEGRADE_MESSAGE)
  })

  it('unpaid sur un état free → reste free, sans nouveau message', () => {
    const free: LicenseState = { tier: 'free', email: null, verifiedAt: null, lastError: null }
    const next = applyOutcome(free, { status: 'unpaid' })
    expect(next.tier).toBe('free')
    expect(next.lastError).toBeNull()
  })

  it('unreachable → état strictement inchangé (fail-open)', () => {
    const state = proState(daysAgo(40))
    const next = applyOutcome(state, { status: 'unreachable', reason: 'offline' })
    expect(next).toBe(state)
  })
})

describe('refreshLicenseIfStale', () => {
  it('Pro vérifié il y a 5 jours → aucun appel réseau, état inchangé', async () => {
    const getUser = vi.fn<LicenseDeps['getUser']>()
    const state = proState(daysAgo(5))
    const next = await refreshLicenseIfStale(state, makeDeps(getUser))
    expect(getUser).not.toHaveBeenCalled()
    expect(next).toEqual(state)
  })

  it('Pro vérifié il y a 40 jours avec réseau en panne → RESTE Pro (fail-open)', async () => {
    const state = proState(daysAgo(40))
    const next = await refreshLicenseIfStale(
      state,
      makeDeps(async () => {
        throw new Error('network down')
      }),
    )
    expect(next.tier).toBe('pro')
    // verifiedAt intact : on ne « rafraîchit » pas sur une vérification impossible.
    expect(next.verifiedAt).toBe(state.verifiedAt)
  })

  it('Pro vérifié il y a 40 jours, toujours payé → verifiedAt mis à jour', async () => {
    const next = await refreshLicenseIfStale(proState(daysAgo(40)), makeDeps(async () => paidUser))
    expect(next.tier).toBe('pro')
    expect(next.verifiedAt).toBe(NOW)
  })

  it('Pro vérifié il y a 40 jours, paiement disparu (remboursé) → free + lastError', async () => {
    const next = await refreshLicenseIfStale(
      proState(daysAgo(40)),
      makeDeps(async () => unpaidUser),
    )
    expect(next.tier).toBe('free')
    expect(next.lastError).toBeTruthy()
  })

  it('utilisateur free → aucun appel réseau, jamais', async () => {
    const getUser = vi.fn<LicenseDeps['getUser']>()
    const state: LicenseState = { tier: 'free', email: null, verifiedAt: null, lastError: null }
    const next = await refreshLicenseIfStale(state, makeDeps(getUser))
    expect(getUser).not.toHaveBeenCalled()
    expect(next).toEqual(state)
  })
})
