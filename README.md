# 🔍 PixelLens

> *Turn any web page into clean Markdown for your AI — and extract its design system.*

Extension Chrome pour développeurs et designers : conversion de n'importe quelle page (ou d'un site entier) en Markdown propre pour une IA, bundle « Copy for LLM », et extraction complète du design system — couleurs, typographies, spacings, ombres, radius — le tout **100 % local** (aucun serveur, aucune clé API).

## ✨ Features

### 📝 Page → Markdown
- Conversion de la page courante en Markdown GFM propre (turndown + plugin GFM)
- Frontmatter YAML : titre, URL, date de capture, nombre de mots
- Stats : headings, liens, images, tableaux, blocs de code
- Copie ou téléchargement `.md`

### 🌐 Crawl de site → un seul document
- Crawl de toutes les pages same-site : sitemap d'abord, sinon BFS de liens (max 100 pages, profondeur 3)
- Deux modes de rendu : **Fast** (HTML serveur) ou **Full** (chaque page rendue dans un vrai onglet d'arrière-plan — les SPA passent aussi)
- Respect de robots.txt (désactivable), raisons de skip détaillées (403, timeout, robots…)
- Export : un `.md` concaténé avec table des matières, ou ZIP multi-fichiers

### 🤖 Copy for LLM
- Un bouton copie un bundle unique : contenu de la page en Markdown + design system extrait + métadonnées
- Auto-descriptif, prêt à coller dans le contexte de Claude / ChatGPT

### 🎯 Mode Inspection
- Hover highlight avec box model visuel (padding vert, margin orange, content bleu)
- Clic sur un élément → panel avec toutes les infos CSS
- Copie en un clic de n'importe quelle valeur

### 📊 Mode Scan
- Analyse la page entière automatiquement
- Extraction : couleurs, typographies, spacings, shadows, border-radius
- Clustering intelligent des couleurs (deltaE)
- Classification auto : Primary, Secondary, Neutrals, Background, Text

### 🎨 Design System Generator
- Génération automatique d'un design system structuré
- Tokens éditables (renommer, supprimer)
- Export multi-format :
  - **CSS Variables** — `:root { --color-primary: ... }`
  - **Tailwind Config** — `theme.extend` prêt à coller
  - **JSON Tokens** — Compatible Style Dictionary / Figma
  - **PNG Palette** — Image partageable

### 🛠️ Outils
- ♿ Vérificateur de contraste WCAG
- 📏 Mesure de distances entre éléments
- 📐 Grid overlay configurable (4/8/12/16px)
- 🎯 Floating toolbar draggable
- ⌘K Command palette

## 💎 Gratuit vs Pro

Pro : **19 € une fois, à vie** — achat intégré via ExtensionPay (paiement Stripe),
aucune clé à saisir : on clique « Passer en Pro », on paye, c'est débloqué.
Règle produit : *ce qui regarde est gratuit, ce qui emporte est Pro.*

| Fonctionnalité | Gratuit | Pro |
|---|:--:|:--:|
| Mode inspection (hover, box model, CSS calculé) | ✅ | ✅ |
| Copie d'une valeur CSS individuelle | ✅ | ✅ |
| Scan de page (couleurs, typo, spacings, ombres, radius) | ✅ | ✅ |
| Consultation du design system généré | ✅ | ✅ |
| Vérificateur de contraste WCAG | ✅ | ✅ |
| Grid overlay + mesure de distances | ✅ | ✅ |
| Page courante → Markdown (copie et téléchargement) | ✅ | ✅ |
| Édition des tokens (renommer, supprimer) | ❌ | ✅ |
| Exports : CSS Variables, Tailwind, JSON, palette PNG | ❌ | ✅ |
| « Copy for LLM » (contenu + design system + métadonnées) | ❌ | ✅ |
| Crawl de site au-delà de 3 pages (jusqu'à 100) | ❌ | ✅ |
| Historique des scans au-delà des 3 derniers | ❌ | ✅ |

Les échanges avec `extensionpay.com` (achat / restauration / vérification du
statut Pro) sont les **seules** requêtes réseau émises par l'extension
elle-même — fail-open : un Pro hors ligne reste Pro.
Politique de confidentialité : [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md).

## 🏗️ Tech Stack

| Technologie | Usage |
|---|---|
| React 19 | UI Side Panel + Popup |
| TypeScript (strict) | Type safety partout |
| Tailwind CSS v4 | Styling avec design tokens |
| Vite + CRXJS | Build + HMR Chrome Extension |
| Zustand v5 | State management |
| Chroma.js | Color manipulation + clustering |
| Phosphor Icons | Iconographie |
| Chrome Extension MV3 | Manifest V3 + Side Panel API |

## 📦 Installation

### Prérequis
- Node.js 20+
- npm 9+
- Chrome 114+ (pour la Side Panel API)

### Développement
```bash
# Cloner le repo
git clone https://github.com/selyan-mhli/pixellens.git
cd pixellens

# Installer les dépendances
npm install

# Lancer en mode dev (avec HMR)
npm run dev
```

### Charger l'extension dans Chrome
1. Ouvrir `chrome://extensions/`
2. Activer **Mode développeur** (toggle en haut à droite)
3. Cliquer **"Charger l'extension non empaquetée"**
4. Sélectionner le dossier `dist/` du projet
5. L'icône 🔍 PixelLens apparaît dans la toolbar Chrome
6. **Important** : après chaque modification en dev, cliquer le bouton 🔄 sur la carte de l'extension dans `chrome://extensions/`

### Utilisation rapide
| Action | Comment |
|---|---|
| Toggle inspection | `Ctrl+Shift+L` (ou `Cmd+Shift+L` sur Mac) |
| Inspecter un élément | Mode Inspect activé → clic sur l'élément |
| Scanner une page | Clic "Scan" dans la floating toolbar |
| Voir le Side Panel | Se ouvre auto quand on inspecte |

## 🏛️ Architecture

```
src/
├── types/          # Types partagés (DesignSystem, Inspection, Messages, Crawl, License)
├── lib/            # Utilitaires (colors, CSS parser, tokens, markdown, crawler, license, export, storage)
├── background/     # Service worker (routing messages, commands, badge)
├── popup/          # Popup compact (quick actions)
├── content/        # Content scripts injectés dans les pages
│   ├── inspector/  # ElementHighlighter, ElementSelector, DistanceMeasurer, GridOverlay
│   ├── scanner/    # PageScanner, ColorExtractor, TypographyExtractor, SpacingExtractor
│   └── ui/         # FloatingToolbar, InspectorTooltip, ContentApp (Shadow DOM)
└── sidepanel/      # Side Panel React app
    ├── views/      # InspectorView, ScanView, DesignSystemView, ExportView, HistoryView
    └── components/ # ColorSwatch, ColorPalette, TypeSpecimen, SpacingScale, BoxModelViz...
```

```
Content Script ←→ Background Service Worker ←→ Side Panel
   (DOM)              (routing, storage)         (React UI)
```

## 📋 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev avec Hot Module Replacement |
| `npm run build` | Build production dans `dist/` |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint sur `src/` |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:coverage` | Tests avec couverture |

## 🚀 Build Production

```bash
npm run build
```

Le dossier `dist/` contient l'extension prête. Pour le Chrome Web Store :
```bash
cd dist && zip -r ../pixellens.zip .
```

## 🧪 Tests

```bash
npm run test           # Run une fois
npm run test -- --watch  # Watch mode
npm run test:coverage  # Avec rapport de couverture
```

## 📄 License

MIT

## 👤 Author

**Adam Hnaien** — [@vgtray](https://github.com/vgtray)
