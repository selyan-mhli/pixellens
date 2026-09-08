# PixelLens — Fiche Chrome Web Store

> Texte exact à coller dans le dashboard CWS. Dérivé du code réel (v1.2.0).
> Les justifications de permissions décrivent ce que le code fait, fichier à l'appui.

## Nom

**PixelLens — Page to Markdown for AI & Design System Extractor**

(33 caractères max pour le nom court : `PixelLens`)

## Description courte (≤ 132 caractères)

```
Turn any web page into clean Markdown for AI, and extract its full design system: colors, type, spacing, tokens. Local, no API key.
```

## Catégorie

**Developer Tools**

## Single purpose statement

```
PixelLens converts web pages into clean Markdown for use with AI assistants, and
extracts the visual design system (colors, typography, spacing, shadows, radii)
of the page being viewed. All processing happens locally in the browser.
```

## Description longue — EN

```
Feed your AI real pages, not screenshots.

PixelLens turns any web page (or an entire site) into clean, structured
Markdown your AI assistant can actually use, and extracts the page's full
design system while it's at it. Everything runs locally in your browser: no
server, no account, no API key, and your data never leaves your machine.

■ PAGE → MARKDOWN (free)
Convert the current page into clean GFM Markdown with YAML frontmatter
(title, URL, capture date, word count): copy it or download the .md file.
Headings, links, images, tables and code blocks are preserved.

■ CRAWL A WHOLE SITE (free: 3 pages · Pro: up to 100)
One click crawls every same-site page (sitemap-first, falling back to link
crawling) and concatenates them into a single Markdown document with a table
of contents, ready to paste into an AI's context window. Two render modes:
Fast (server HTML) or Full (each page rendered in a real background tab, so
JavaScript-heavy SPAs convert too). Download as one .md or a multi-file ZIP.
Respects robots.txt by default.

■ COPY FOR LLM (Pro)
One button copies a single self-describing bundle: the page as Markdown + the
extracted design system + page metadata. Paste it into Claude, ChatGPT or any
assistant and it understands the page end to end.

■ DESIGN SYSTEM EXTRACTOR (free)
Scan any page and get its palette (clustered and auto-classified), type scale,
spacing scale, shadows and border radii. Check WCAG contrast ratios. Inspect
any element: box model, computed CSS, one-click copy of any value. Grid
overlay and distance measurement included.

■ EXPORT YOUR TOKENS (Pro)
Ship the extracted design system as CSS variables, a Tailwind config, JSON
tokens (Style Dictionary compatible) or a PNG palette. Rename and prune
tokens before exporting. Keep your full scan history.

■ PRIVACY, FOR REAL
No analytics, no telemetry, no account, no remote server. The only service
PixelLens ever talks to is ExtensionPay (extensionpay.com), and only when you
buy, restore or verify the optional Pro upgrade. Site crawling happens from
your own browser, on the site you chose, with your own session.

■ LOCAL AI BRIDGE (Pro, off by default)
Run the companion server on your own machine (npx pixellens-mcp) and your
assistant can ask for the page you are on, or open a URL in your browser and
read it back, without you copying anything. Unlike hosted page readers, which
fetch URLs from their own servers, this reads from your browser and your
session: pages behind a login and JavaScript-heavy apps work. The bridge only
ever talks to 127.0.0.1, is off until you turn it on, and asks for the
localhost permission only at that moment.

Free forever for inspecting, scanning, contrast checking, token estimation and
single-page Markdown. Pro is a one-time 19 € in-app purchase (Stripe via
ExtensionPay): lifetime, no subscription, no license key to manage.
```

## Description longue — FR

```
Donnez à votre IA de vraies pages, pas des captures d'écran.

PixelLens transforme n'importe quelle page web (ou un site entier) en
Markdown propre et structuré, directement exploitable par votre assistant IA,
et en profite pour extraire le design system complet de la page. Tout tourne
localement dans votre navigateur : pas de serveur, pas de compte, pas de clé
API, et vos données ne quittent jamais votre machine.

■ PAGE → MARKDOWN (gratuit)
Convertissez la page courante en Markdown GFM propre avec frontmatter YAML
(titre, URL, date de capture, nombre de mots) : copiez-le ou téléchargez le
fichier .md. Titres, liens, images, tableaux et blocs de code sont préservés.

■ CRAWLEZ UN SITE ENTIER (gratuit : 3 pages · Pro : jusqu'à 100)
Un clic parcourt toutes les pages du site (sitemap d'abord, puis suivi de
liens) et les concatène en un seul document Markdown avec table des
matières, prêt à coller dans le contexte d'une IA. Deux modes de rendu :
Fast (HTML serveur) ou Full (chaque page rendue dans un vrai onglet en
arrière-plan, pour convertir aussi les SPA). Téléchargement en un .md unique
ou en ZIP multi-fichiers. Respecte robots.txt par défaut.

■ COPY FOR LLM (Pro)
Un bouton copie un bundle unique et auto-descriptif : la page en Markdown +
le design system extrait + les métadonnées. Collez-le dans Claude, ChatGPT ou
n'importe quel assistant : il comprend la page de bout en bout.

■ EXTRACTEUR DE DESIGN SYSTEM (gratuit)
Scannez une page et obtenez sa palette (clusterisée et auto-classée), son
échelle typographique, ses spacings, ombres et border-radius. Vérifiez les
contrastes WCAG. Inspectez chaque élément : box model, CSS calculé, copie en
un clic. Grille et mesure de distances incluses.

■ EXPORTEZ VOS TOKENS (Pro)
Emportez le design system en variables CSS, config Tailwind, tokens JSON
(compatibles Style Dictionary) ou palette PNG. Renommez et nettoyez les
tokens avant export. Gardez tout votre historique de scans.

■ CONFIDENTIALITÉ, POUR DE VRAI
Aucun analytics, aucune télémétrie, aucun compte, aucun serveur distant. Le
seul service que PixelLens contacte est ExtensionPay (extensionpay.com), et
uniquement quand vous achetez, restaurez ou vérifiez l'option Pro. Le crawl
s'effectue depuis votre propre navigateur, sur le site que vous avez choisi,
avec votre propre session.

■ PONT LOCAL POUR ASSISTANTS (Pro, éteint par défaut)
Lancez le serveur compagnon sur votre machine (npx pixellens-mcp) et votre
assistant peut réclamer la page que vous avez sous les yeux, ou ouvrir une URL
dans votre navigateur et la lire, sans que vous copiiez quoi que ce soit. Les
lecteurs de pages hébergés récupèrent l'URL depuis leurs serveurs : ils ne
voient rien derrière une connexion. Ici c'est votre navigateur qui lit, avec
votre session. Le pont ne parle qu'à 127.0.0.1, reste éteint tant que vous ne
l'allumez pas, et ne demande la permission localhost qu'à ce moment-là.

Gratuit à vie pour l'inspection, le scan, le contraste, l'estimation du nombre
de tokens et le Markdown d'une page. Pro : achat intégré unique de 19 €
(Stripe via ExtensionPay), à vie, sans abonnement, sans clé de licence à gérer.
```

## Justifications des permissions

> Chaque justification décrit ce que le code fait réellement — première cause de
> rejet CWS quand c'est vague ou faux.

### `activeTab`

Utilisée pour lire l'URL de l'onglet actif quand l'utilisateur ouvre le panneau
(`src/sidepanel/App.tsx` : `chrome.tabs.query({active: true})`) afin de signaler
qu'un scan ou une conversion affichés proviennent d'un autre site que celui à
l'écran (bannière « stale »), et pour cibler l'onglet où déclencher inspection,
scan, conversion ou crawl. L'accès au contenu n'a lieu qu'à la suite d'une action
explicite de l'utilisateur (clic sur l'icône, raccourci, bouton du panneau).

### `scripting`

Le service worker ré-injecte le content script (`chrome.scripting.executeScript`,
`src/background/service-worker.ts`) sur les onglets où l'injection déclarative
n'a jamais tourné — typiquement les onglets restaurés après un redémarrage de
Chrome — avant de transmettre une demande de scan/conversion. En mode de rendu
« Full » du crawl, elle sert aussi à collecter les liens `<a href>` du DOM rendu
d'un onglet d'arrière-plan. Aucun code distant n'est jamais injecté.

### `tabs`

Trois usages dans le code : (1) retrouver l'onglet actif pour lui adresser les
messages (scan, conversion, crawl) ; (2) suivre les changements d'URL de
l'onglet actif pour la détection de résultats périmés (`tabs.onActivated` /
`tabs.onUpdated`, `src/sidepanel/App.tsx`) ; (3) en mode crawl « Full »,
ouvrir chaque page dans un onglet d'arrière-plan (`tabs.create({active:false})`),
attendre son chargement, puis le fermer (`tabs.remove`) —
`src/background/service-worker.ts`, `src/lib/tab-render.ts`.

### `sidePanel`

L'interface principale de PixelLens (inspection, scan, design system, exports,
Markdown, crawl, réglages) est une application React rendue dans le Side Panel
de Chrome (`src/sidepanel/`). Le panneau est ouvert par le service worker quand
l'utilisateur active l'inspection ou sélectionne un élément.

### `storage`

`chrome.storage.local` conserve : l'historique des design systems scannés
(20 max, `pixellens_scans`), l'état durable de l'interface du panneau
(`pixellens_panel_state` : vue active, format de couleur, dernier Markdown) et
le statut Pro mis en cache (`pixellens:license` : tier, email du compte de
paiement le cas échéant, date de dernière vérification — ce cache permet à un
utilisateur Pro de le rester hors ligne). `chrome.storage.sync` conserve les
préférences d'affichage (`pixellens_preferences`) et le cache technique de la
bibliothèque ExtensionPay (`extensionpay_user`, `extensionpay_installed_at`).
Aucune de ces données ne quitte le navigateur en dehors des échanges de
paiement décrits ci-dessous.

### `clipboardWrite`

Toutes les actions « Copier » du panneau (valeur CSS individuelle, tokens
exportés, Markdown de page, document de crawl, bundle LLM) passent par
`navigator.clipboard.writeText` (`src/lib/export.ts`). C'est le geste central
du produit : copier pour coller dans un éditeur ou un assistant IA.

### `optional_host_permissions` : `http://127.0.0.1/*` (nouveau en 1.2.0)

**Non demandée à l'installation.** L'extension ne la réclame qu'au moment précis
où l'utilisateur active « Local AI bridge » dans les réglages
(`chrome.permissions.request`, `src/sidepanel/components/BridgeSection.tsx`).
Tant que le pont est éteint, l'extension n'a aucune permission réseau.

À quoi elle sert : ouvrir une connexion WebSocket vers un serveur que
l'utilisateur a lui-même lancé sur SA machine (`ws://127.0.0.1:8787`,
`src/lib/mcp-bridge.ts`), afin qu'un assistant local puisse demander la page
active convertie en Markdown. Le serveur est distribué séparément, en source
ouverte, sous le nom `pixellens-mcp`.

Ce qui ne se produit jamais : aucune connexion vers un hôte distant, aucune
donnée envoyée hors de la machine. L'adresse est codée en dur sur la boucle
locale, seul le port est configurable. Le pont exige un jeton partagé, généré
par le serveur de l'utilisateur, et le serveur refuse au handshake toute
connexion dont l'origine n'est pas `chrome-extension://`.

L'ensemble est éteint par défaut : `DEFAULT_BRIDGE_SETTINGS.enabled === false`
(`src/lib/mcp-bridge.ts`), et le service worker vérifie en plus la licence avant
d'ouvrir quoi que ce soit (`bridgeAllowed`, `src/background/mcp-wiring.ts`).

### Content script sur `https://extensionpay.com/*`

Second content script du manifest (`src/content/extpay-relay.ts`), limité au
seul domaine extensionpay.com : c'est le relais officiel de la bibliothèque
ExtensionPay qui permet à la page de paiement/restauration d'informer
l'extension qu'un paiement a abouti (déblocage Pro instantané). Il ne tourne
sur aucun autre site et ne lit rien d'autre. Les échanges réseau avec
`extensionpay.com` (statut de paiement) ne se produisent que lorsque
l'utilisateur achète, restaure ou vérifie l'option Pro — puis au plus une fois
tous les 30 jours pour un utilisateur Pro ; leur échec ne retire jamais de
fonctionnalités (fail-open). Aucune host permission supplémentaire n'est
requise. Aucun analytics, aucun autre endpoint.

### Content scripts sur `<all_urls>`

Le content script (`src/content/index.ts`) doit pouvoir tourner sur la page que
l'utilisateur inspecte, quelle qu'elle soit — c'est le principe même d'un
inspecteur de design : surlignage au survol, box model, scan des styles
calculés, conversion DOM → Markdown, et fetch same-origin pendant un crawl
(exécutés dans le content script précisément pour ne PAS exiger de permission
d'hôte sur les sites visités). Il est passif tant que l'utilisateur ne
déclenche pas une action, ne lit rien d'autre que la page où il tourne et
n'émet aucune requête vers des tiers.

## Captures d'écran

Voir `docs/SCREENSHOTS.md` (5 captures 1280×800, ordre imposé).

## Divers dashboard

- **Langue par défaut** : English (US), traduction FR fournie.
- **Site** : https://akselai.fr/outils/pixellens (aussi `homepage_url` du manifest).
- **Politique de confidentialité** : `https://akselai.fr/outils/pixellens/confidentialite`
  (page du site, synchrone avec `docs/PRIVACY_POLICY.md`) — à renseigner dans
  l'onglet « Privacy » du dashboard.
- **Data usage (onglet Privacy)** : cocher « This item does not collect user
  data » — aucune donnée collectée ni transmise (voir politique).
