# Brouillon Reddit : lancement (gratuit et open source)

Statut : relu le 2026-09-30, mis à jour le 2026-11-25 pour la 1.3.0 (gratuite, open source), non publié.
Vidéo à joindre : `video/pixellens-reddit-demo.mp4` (19 s, 1920 × 1080, H.264).

Règle d'écriture : n'annoncer que ce que la version **publique** fait déjà. Publier ce post seulement après
l'approbation Google de la 1.3.0, et ne pas annoncer le pont MCP tant que sa disponibilité publique n'est pas confirmée.

## Title (r/chrome_extensions, flair « Self Promotion »)

I got tired of pasting messy web pages into ChatGPT, so I built a free extension that turns any page into clean Markdown (runs locally)

## Body

Copy-pasting a web page into an AI assistant usually gives you nav menus, cookie banners and broken tables. I built PixelLens to fix that for myself.

What it does:

- Converts the page you're on into clean Markdown: headings, links, images, tables and code blocks are kept
- Adds a small YAML header (title, URL, capture date, word count) so the AI knows where the text comes from
- Copy to clipboard or download a `.md` file
- Bonus for front-end folks: scan any page for its colors, type scale, spacing, shadows and radii, and check contrast

Everything runs in your browser. No account, no API key, no analytics, no server of mine in the loop.

It's 100% free and open source (MIT): design-token exports, the combined content + design-system bundle and site crawls up to 100 pages are all included, no paid tier. Code: https://github.com/selyan-mhli/pixellens

Chrome Web Store: https://chromewebstore.google.com/detail/pixellens/mdjbknfjgpehbcdohjejobngijmhnfmm

What I'd really like to know: which pages come out badly? Docs sites, SPAs, paywalled blogs, weird tables… Drop a URL and I'll check it.

## Variante r/SideProject

Même corps. Titre :

Built a Chrome extension that turns any web page into clean Markdown for AI, free and 100% local. Looking for pages that break it

## Checklist de publication (Selyan)

1. Poster un mardi, mercredi ou jeudi entre 15 h et 17 h (heure de Paris), c'est-à-dire le matin côte Est des États-Unis.
2. r/chrome_extensions d'abord, avec la vidéo en pièce jointe et le flair « Self Promotion ». Relire les règles du jour avant de poster.
3. r/SideProject le lendemain, pas le même jour (éviter l'effet de spam croisé).
4. r/webdev seulement un samedi (« Showoff Saturday »), sinon suppression.
5. Rester disponible 2 h après la publication et répondre à chaque commentaire, surtout aux URL qui cassent.
6. Noter chaque URL signalée : c'est la liste de bugs de la 1.2.x.

## Note de préparation

- Joindre `video/pixellens-reddit-demo.mp4`, dont la scène de résultat reprend le Markdown effectivement copié.
- Le pont MCP ne fait pas partie de cette première annonce : disponibilité publique non confirmée.
- Ne citer aucun chiffre (étoiles, installations) qui n'a pas été relevé le jour du post.
- Règles de r/chrome_extensions consultées le 19/09/2026 : catégorie Self Promotion, spam interdit (https://www.reddit.com/r/chrome_extensions/).
