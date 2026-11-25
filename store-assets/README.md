# store-assets — dossier de publication Chrome Web Store

Tout ce qu'il faut coller/téléverser dans le dashboard CWS
(https://chrome.google.com/webstore/devconsole), champ par champ.

## Zipper la 1.3.0

PixelLens 1.3.0 est gratuite et open source (MIT) : aucun identifiant de
paiement à renseigner. Construire depuis un `dist/` propre, pour ne pas
embarquer de fichiers d'une ancienne version :

```bash
rm -rf dist && npm ci && npm run build
cd dist && zip -r ../pixellens-1.3.0.zip . && cd ..
```

Le zip à téléverser est `pixellens-1.3.0.zip` (à la racine du projet, non
versionné). Vérifier dedans : `version` = 1.3.0, pas de `host_permissions`, pas
de chaîne `extensionpay` (`unzip -p pixellens-1.3.0.zip manifest.json`).
Détail de la mise à jour : `cws-update-1.3.0.md`.

## Onglet « Store listing »

| Champ | Source |
|---|---|
| Name | `PixelLens — Page to Markdown for AI & Design System Extractor` |
| Short description | `listing-short-description.txt` (113 caractères, limite 132) |
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

Aucun achat : ne pas déclarer « Contains in-app purchases » (retirer la
déclaration si elle existait pour la 1.2.x).

## Checklist finale avant « Submit for review »

- [ ] `dist/` reconstruit proprement, zip 1.3.0 contrôlé (voir plus haut)
- [ ] Les 4 commandes vertes : `npm run typecheck && npm run lint && npm test -- --run && npm run build`
- [ ] Descriptions et captures 1.3.0 collées dans le dashboard
- [ ] Déclaration d'achats intégrés retirée, justification extensionpay supprimée
- [ ] Page akselai.fr/outils/pixellens et sa politique de confidentialité à jour

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

Les captures « panneau seul » (`*-narrow.png`, 800×1420) se rendent depuis la
même page HTML avec `--window-size=400,710 --force-device-scale-factor=2`, en
forçant `.panel` en `position:fixed;top:0;left:0;height:710px`.
