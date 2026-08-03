// Stub de `extpay` pour les TESTS uniquement (aliasé dans vitest.config.ts).
//
// Le vrai module s'auto-exécute à l'import (webextension-polyfill, écouteurs,
// écritures storage) et exige les API WebExtension — absentes sous jsdom. Ce stub
// inerte permet aux tests qui importent le service worker (ou tout module touchant
// lib/extpay) de tourner sans elles. La logique licence, elle, est testée via
// l'injection de LicenseDeps dans lib/license — jamais à travers ce stub.

interface StubUser {
  paid: boolean
  paidAt: Date | null
  email: string | null
  installedAt: Date
  trialStartedAt: Date | null
  plan: null
}

const stubUser = (): StubUser => ({
  paid: false,
  paidAt: null,
  email: null,
  installedAt: new Date(0),
  trialStartedAt: null,
  plan: null,
})

export default function ExtPay(_extensionId: string) {
  return {
    getUser: async (): Promise<StubUser> => stubUser(),
    getPlans: async (): Promise<never[]> => [],
    onPaid: { addListener: (_cb: (user: StubUser) => void): void => undefined },
    onTrialStarted: { addListener: (_cb: (user: StubUser) => void): void => undefined },
    openPaymentPage: async (): Promise<void> => undefined,
    openLoginPage: async (): Promise<void> => undefined,
    openTrialPage: async (): Promise<void> => undefined,
    startBackground: (): void => undefined,
  }
}
