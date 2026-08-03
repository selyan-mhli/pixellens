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
| Privacy policy URL | héberger `docs/PRIVACY_POLICY.md` (page publique) et coller l'URL |

## Onglet « Payments »

Déclarer que l'extension propose des achats **hors** CWS : « Contains in-app
purchases » — le paiement passe par ExtensionPay/Stripe, pas par Google.

## Checklist finale avant « Submit for review »

- [ ] `EXTPAY_EXTENSION_ID` réel dans `src/lib/constants.ts`, build + zip refaits
- [ ] Achat de test réussi (mode test Stripe d'ExtensionPay) : payer → panneau
      débloqué sans rechargement ; « J'ai déjà payé » → restauration OK
- [ ] Politique de confidentialité en ligne, URL renseignée
- [ ] Page https://akselai.fr/outils/pixellens existante (ou retirer homepage_url)
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
