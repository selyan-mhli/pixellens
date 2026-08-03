# PixelLens — Free/Pro (Gumroad) + soumission CWS — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un modèle gratuit + Pro 19 € à vie (licence Gumroad) et produire les documents de soumission Chrome Web Store, sans casser l'existant.

**Architecture:** Une couche licence pure et testable (`lib/license.ts`, deps injectées comme `CrawlDeps`), un état licence dans le store Zustand hydraté hors du chemin de rendu, un composant `ProGate` réutilisé dans 5 vues, la limite crawl passée via `CrawlOptions.maxPages` (déjà supporté) depuis l'orchestration UI.

**Tech Stack:** React 19, TypeScript strict, Zustand 5, Vitest, chrome.storage.local, fetch natif. Aucune dépendance ajoutée.

## Global Constraints

- Aucune dépendance npm ajoutée.
- Aucune permission manifest ajoutée sauf `host_permissions: ["https://api.gumroad.com/*"]`.
- Aucun analytics/télémétrie/ping.
- Pas de DRM durci (gating client assumé).
- Jamais de fonctionnalité gratuite bloquée par une erreur réseau (fail-open).
- TypeScript strict : aucun `any`, aucun `@ts-ignore`.
- Aucun test existant modifié.
- Commits en français, préfixés (`feat:`, `test:`, `docs:`, `chore:`).
- Une branche par phase : `feat/license-layer` → `feat/pro-gating` → `chore/store-submission`.
- Après chaque phase : `npm run typecheck && npm run lint && npm test -- --run && npm run build`.
- `InspectorView`, `ScanView`, `ContrastCheckerView`, `crawler.ts` : intouchés.

## Écarts prompt ↔ code (suivre le code)

1. Tests dans `src/lib/__tests__/license.test.ts` (convention repo), pas `src/lib/license.test.ts`.
2. « 3 pages sur 41 » : le crawler ne remonte pas le total découvert quand `maxPages=3` → message « First 3 pages (free) — … » sans le total. `maxPages: 3` passé par CrawlView dans le payload `CRAWL_SITE` (CrawlOptions le supporte déjà).
3. `DesignSystemView` : bouton Export du header (copie/PNG) non listé dans le prompt → « emporte » donc Pro : en gratuit, il route vers la vue Export.
4. Édition de tokens : le blur ProGate ne convient pas à des actions inline → gratuit = labels en lecture seule + carte `ProGateCard` compacte dans la section Palette.

---

### Task 1 (Phase 1) — Types + constantes

**Files:**
- Create: `src/types/license.ts` (types exacts du prompt §4.1)
- Create: `src/lib/constants.ts`

**Interfaces produites:**
```ts
// src/lib/constants.ts
export const GUMROAD_PRODUCT_ID = 'TODO_GUMROAD_PRODUCT_ID'
export const GUMROAD_PRODUCT_URL = 'https://TODO.gumroad.com/l/TODO'
export const GUMROAD_VERIFY_ENDPOINT = 'https://api.gumroad.com/v2/licenses/verify'
```

- [x] Écrire les deux fichiers (copie conforme §4.1 pour les types).

### Task 2 (Phase 1) — Storage licence

**Files:**
- Modify: `src/lib/storage.ts`

**Interfaces produites:**
```ts
export const LICENSE_STORAGE_KEY = 'pixellens:license'
export async function getStoredLicense(): Promise<LicenseState | null>
export async function setStoredLicense(state: LicenseState): Promise<void>
```
Implémentation : `chrome.storage.local.get/set` direct (même pattern que SCANS_KEY).

- [x] Ajouter les helpers dans storage.ts.

### Task 3 (Phase 1) — `src/lib/license.ts` + tests (TDD)

**Files:**
- Create: `src/lib/__tests__/license.test.ts` (8 cas du prompt §4.3)
- Create: `src/lib/license.ts`

**Interfaces produites:**
```ts
export interface LicenseDeps { fetch: typeof globalThis.fetch; now: () => string }
export const VERIFY_TIMEOUT_MS = 10_000
export const REFRESH_AFTER_DAYS = 30
export const DEFAULT_LICENSE: LicenseState
export function verifyLicense(key: string, deps?: LicenseDeps): Promise<VerifyOutcome>
export function readLicense(): Promise<LicenseState>
export function writeLicense(state: LicenseState): Promise<void>
export function refreshLicenseIfStale(state: LicenseState, deps?: LicenseDeps): Promise<LicenseState>
```

Contrat Gumroad (doc vérifiée) : POST form-encodé `product_id`, `license_key`, `increment_uses_count: 'false'` (toujours false → jamais d'inflation du compteur). 200 + `success:true` + `purchase` → contrôle révocation : `refunded`, `chargebacked`, `disputed && !dispute_won`, `subscription_ended_at/cancelled_at/failed_at` non-null → `revoked`. 404 + `success:false` → `invalid`. Autres statuts / corps illisible / champs manquants / rejet fetch / timeout (AbortController 10 s) → `unreachable`. `refreshLicenseIfStale` : ne fait rien si tier ≠ pro, pas de clé, ou `verifiedAt` < 30 jours ; `unreachable` → état inchangé (fail-open) ; `invalid`/`revoked` → tier `free` + `lastError`.

- [x] Écrire les 8 tests (fetch injecté, `vi.useFakeTimers` pour le timeout), vérifier qu'ils échouent.
- [x] Implémenter license.ts, vérifier qu'ils passent.
- [x] `npm run typecheck && npm run lint && npm test -- --run && npm run build` → commit `feat: couche licence Gumroad (vérification, stockage, fail-open)`.

### Task 4 (Phase 2) — Store + hydratation

**Files:**
- Modify: `src/sidepanel/store.ts` — `license: LicenseState`, `isPro: boolean`, `setLicense(next)` (met les deux à jour), `settingsFocusLicense: boolean` + setter (transient, non persisté).
- Modify: `src/sidepanel/App.tsx` — effet post-hydratation : `readLicense()` → `setLicense`, puis `refreshLicenseIfStale` en arrière-plan ; si l'état change → `writeLicense` + `setLicense`. Jamais bloquant pour le rendu.

- [x] Implémenter, typecheck.

### Task 5 (Phase 2) — `ProGate.tsx`

**Files:**
- Create: `src/sidepanel/components/ProGate.tsx`

Props du §5.2. Pro → children tels quels. Gratuit → wrapper relative : children `blur-[6px] select-none pointer-events-none aria-hidden` + `inert`, carte centrée (title, body, bouton « Passer en Pro — 19 € à vie » → `GUMROAD_PRODUCT_URL` nouvel onglet, lien « J'ai déjà une clé » → `setMode('settings')` + `settingsFocusLicense`). Export nommé `ProGateCard` (la carte seule) pour DesignSystemView.

- [x] Implémenter.

### Task 6 (Phase 2) — Gating vue par vue

**Files:**
- Modify: `src/sidepanel/views/ExportView.tsx` — gratuit : sélecteur actif, `CSSBlock` sous ProGate (flouté), Copier/Télécharger `disabled`.
- Modify: `src/sidepanel/views/CrawlView.tsx` — gratuit : payload `CRAWL_SITE` avec `maxPages: 3` ; à l'écran résultat, bandeau « First 3 pages (free) — Go Pro to crawl the whole site (up to 100 pages) » ; copie/download des 3 pages actifs.
- Modify: `src/sidepanel/views/MarkdownView.tsx` — seul le bouton « Copy for LLM » sous ProGate.
- Modify: `src/sidepanel/views/DesignSystemView.tsx` — gratuit : labels lecture seule, pas de Trash, `ProGateCard` compacte dans Palette, bouton Export du header → `setMode('export')`.
- Modify: `src/sidepanel/views/HistoryView.tsx` — gratuit : 3 premières entrées normales, le reste grisé/désactivé sous ProGate.

- [x] Implémenter les 5 vues.

### Task 7 (Phase 2) — SettingsView licence

**Files:**
- Modify: `src/sidepanel/views/SettingsView.tsx`

Section « Licence » en haut : états gratuit / vérification / Pro (§5.4), masque de clé `XXXX-…-1234`, erreurs humaines (invalid/revoked/unreachable — unreachable sur un Pro existant ne change RIEN à l'état), retrait avec confirmation deux temps, focus auto via `settingsFocusLicense`. Activation : `verifyLicense` → écrire + setLicense selon l'issue.

- [x] Implémenter.
- [x] Vérifs complètes → commit `feat: gating Pro dans le panneau (ProGate, limites, réglages licence)`.

### Task 8 (Phase 3) — Manifest + docs

**Files:**
- Modify: `manifest.json` — `host_permissions`, `homepage_url`, version 1.1.0, description (≤132 chars, vérifiée par script).
- Modify: `package.json` — version 1.1.0.
- Modify: `src/sidepanel/App.tsx` — footer « v1.1.0 ».
- Create: `docs/STORE_LISTING.md`, `docs/PRIVACY_POLICY.md`, `docs/SCREENSHOTS.md`.
- Modify: `README.md` — features réelles (crawl, markdown, bundle LLM) + tableau gratuit/Pro.

- [x] Implémenter, vérifs complètes → commit `docs: dossiers de soumission Chrome Web Store` + `chore: manifest v1.1.0 (host_permissions Gumroad, homepage)`.

### Task 9 — Compte-rendu final (§8 du prompt)
- [x] Écarts, fichiers, résultats des commandes, parcours de test manuel, reste à charge, avis critiques.
