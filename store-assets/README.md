# store-assets — dossier de publication Chrome Web Store

Tout ce qu'il faut coller/téléverser dans le dashboard CWS
(https://chrome.google.com/webstore/devconsole), champ par champ.

## ⚠️ Avant de zipper : l'identifiant ExtensionPay

Le paiement Pro ne marchera pas tant que `EXTPAY_EXTENSION_ID` vaut `TODO_…`.

1. Créer le compte sur https://extensionpay.com, enregistrer l'extension
   (choisir un identifiant, ex. `pixellens`), fixer le prix (19 €, one-time),
   connecter Stripe.
2. Reporter cet identifiant dans `src/lib/constants.ts`.
3. Regénérer le paquet :
   ```bash
   npm run build && cd dist && zip -r ../pixellens-1.1.0.zip . && cd ..
   ```

Le zip à téléverser est `pixellens-1.1.0.zip` (à la racine du projet, non versionné).

## Onglet « Store listing »

| Champ | Source |
|---|---|
| Name | `PixelLens — Page to Markdown for AI & Design System Extractor` |
| Short description | `listing-short-description.txt` (131 caractères) |
| Description (English) | `listing-description-en.txt` |
| Description (Français) | `listing-description-fr.txt` |
| Category | Developer Tools |
| Language | English (US) par défaut + French |
| Screenshots | `screenshots/01…05.png` (1280×800, DANS CET ORDRE) |
| Homepage URL | https://akselai.fr/outils/pixellens |

Les captures sont des reconstitutions fidèles de l'UI (générées depuis les
tokens du code, sites d'arrière-plan fictifs — aucune marque réelle). Pour les
remplacer par de vraies captures : suivre `docs/SCREENSHOTS.md`.

## Onglet « Privacy »

| Champ | Valeur |
|---|---|
| Single purpose | voir `docs/STORE_LISTING.md` § Single purpose statement |
| Permission justifications | voir `docs/STORE_LISTING.md` § Justifications (une par permission — copier tel quel) |
| Data usage | cocher « This item does not collect or use user data » (aucune collecte) |
| Privacy policy URL | `https://akselai.fr/outils/pixellens/confidentialite` (page du site akselai.fr, synchrone avec `docs/PRIVACY_POLICY.md`) |

## Onglet « Payments »

Déclarer que l'extension propose des achats **hors** CWS : « Contains in-app
purchases » — le paiement passe par ExtensionPay/Stripe, pas par Google.

## Checklist finale avant « Submit for review »

- [ ] `EXTPAY_EXTENSION_ID` réel dans `src/lib/constants.ts`, build + zip refaits
- [ ] Achat de test réussi (mode test Stripe d'ExtensionPay) : payer → panneau
      débloqué sans rechargement ; « J'ai déjà payé » → restauration OK
- [ ] Site akselai.fr déployé avec la page /outils/pixellens et sa politique de
      confidentialité (faites — reste le déploiement de la branche suivie par Dokploy)
- [ ] Les 4 commandes vertes : `npm run typecheck && npm run lint && npm test -- --run && npm run build`

## Regénérer / retoucher les captures

Les mockups sont générés par `screenshots-src/build-shots.mjs` (HTML 1280×800
fidèle aux tokens du panneau), rendus par Chrome headless :

```bash
cd store-assets/screenshots-src && node build-shots.mjs
for f in 01-copy-for-llm 02-crawl 03-design-system 04-export-tailwind 05-inspect; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
    --hide-scrollbars --window-size=1280,800 \
    --screenshot="../screenshots/$f.png" "file://$PWD/$f.html"
done
```

---

## Mise à jour 1.1.0 → 1.2.0 (08/09/2026)

Ce n'est pas une nouvelle fiche : on téléverse une nouvelle version sur la fiche
existante (`mdjbknfjgpehbcdohjejobngijmhnfmm`). Ce qui change dans le dashboard :

| Onglet | Action |
|---|---|
| Package | Téléverser `pixellens-1.2.0.zip` (racine du projet, non versionné) |
| Store listing | Remplacer les descriptions longues EN et FR par celles de `docs/STORE_LISTING.md` (elles gagnent la section « pont local ») |
| Privacy practices | **Ajouter la justification de `optional_host_permissions`** — texte prêt dans `docs/STORE_LISTING.md` |
| Privacy practices | Les autres justifications sont inchangées, ne pas les réécrire |

### Pourquoi cette version repasse en revue

L'ajout d'une permission, même optionnelle, et une communication vers un serveur
local sont deux motifs d'examen manuel. Google regarde en priorité les
extensions qui parlent à `localhost` : c'est un vecteur de malware classique.

Ce qui joue en notre faveur, et qu'il faut savoir défendre si un reviewer écrit :

- la permission est **optionnelle**, pas demandée à l'installation ; une
  installation neuve n'a toujours aucune permission d'hôte
- l'adresse est codée en dur sur la boucle locale (`ws://127.0.0.1`), seul le
  port est configurable ; aucun hôte distant n'est joignable
- le serveur compagnon est publié en source ouverte (`pixellens-mcp` sur npm),
  donc auditable
- le pont est éteint par défaut et exige un jeton généré localement

### Avant de téléverser

- [ ] `npm test` (267 tests) et `npm run build` verts
- [ ] `cd mcp && npm test` (9 tests) vert
- [ ] Vérifier dans le zip : `version` = 1.2.0, `optional_host_permissions`
      présente, `host_permissions` absente
- [ ] Publier `pixellens-mcp` sur npm **avant** l'extension : la fiche mentionne
      la commande `npx pixellens-mcp`, un utilisateur qui la lance dans le vide
      laisse un avis à une étoile
- [ ] Ne mettre la landing en ligne qu'une fois la version approuvée
