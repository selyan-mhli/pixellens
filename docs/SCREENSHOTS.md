# PixelLens — Captures d'écran Chrome Web Store

5 captures **1280 × 800** (PNG, sans coins arrondis ni ombre ajoutée), dans cet
ordre — la première est celle que 90 % des visiteurs verront.

Réglage commun : fenêtre Chrome à 1280×800 exactement (macOS :
`open -na "Google Chrome" --args --window-size=1280,800`), thème sombre du
panneau (défaut), side panel ouvert à droite. Incruster la légende en bandeau
sobre (fond `#0C0C0E`, texte blanc, 32–40 px de haut) en bas de l'image.

---

## ① Copy for LLM sur un article réel

- **Vue** : panneau → onglet **Markdown** (icône M dans le footer).
- **URL de démo** : https://en.wikipedia.org/wiki/Design_system (article riche :
  titres, liens, tableaux, images).
- **État à obtenir** : cliquer « Convert to Markdown » ; attendre le résultat —
  header avec titre + chips (words/headings/links/images/tables/code blocks),
  aperçu Markdown rempli, bouton violet **« Copy for LLM »** bien visible en bas.
  Compte Pro actif (aucun voile). Survoler le bouton pour son état hover.
- **Légende** : `One click: the whole page as clean Markdown, ready for your AI.`

## ② Crawl en cours sur un vrai site

- **Vue** : panneau → onglet **Crawl site** (icône globe).
- **URL de démo** : https://tailwindcss.com/docs (sitemap présent, dizaines de
  pages same-site).
- **État à obtenir** : lancer « Crawl entire site » et capturer PENDANT le
  crawl : barre de progression partiellement remplie (idéalement 20–60 %),
  compteur `N/M pages`, URL courante en monospace sous la barre, bouton Stop.
- **Légende** : `Crawl a whole site into one Markdown document — sitemap-first.`

## ③ Design system généré

- **Vue** : panneau → onglet **Design System**.
- **URL de démo** : https://stripe.com (palette et typo distinctives).
- **État à obtenir** : scanner la page (onglet Scan → Scan page), puis ouvrir
  Design System : sections Palette (swatches + noms + hex), Type Scale,
  Spacing, Border Radius, Shadows visibles. Scroller pour cadrer Palette +
  Type Scale à l'écran. Compte Pro actif.
- **Légende** : `Scan any page. Get its palette, type scale, spacing and shadows.`

## ④ Vue Export en Tailwind

- **Vue** : panneau → onglet **Export** (icône flèche).
- **URL de démo** : même scan Stripe que la capture ③.
- **État à obtenir** : sélectionner l'onglet **Tailwind** dans le sélecteur de
  format ; le bloc de code `theme.extend` (colors/fontFamily/spacing…) rempli et
  net (compte Pro — pas de flou), boutons « Copy to Clipboard » et download
  actifs en bas.
- **Légende** : `Export your tokens: CSS variables, Tailwind config, JSON, PNG.`

## ⑤ Mode inspection avec box model

- **Vue** : page web au premier plan + panneau **Inspect** ouvert.
- **URL de démo** : https://github.com (composants nets, boutons bien espacés).
- **État à obtenir** : activer l'inspection (⌘⇧L), survoler le bouton principal
  (« Sign up for GitHub ») pour montrer les calques padding/margin colorés et le
  badge de dimensions sur la page ; cliquer pour remplir le panneau : box model
  visualisé + CSS calculé avec boutons de copie.
- **Légende** : `Hover any element: box model, computed CSS, one-click copy.`

---

### Après export

Vérifier chaque PNG : 1280×800 exact, aucun favicon d'onglet personnel, aucune
donnée perso dans la barre d'URL (utiliser une fenêtre de navigation privée avec
l'extension autorisée en incognito, ou un profil Chrome vierge).
