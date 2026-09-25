# Smoke tests PixelLens — 20 septembre 2026

## Résultat

Les cinq pages publiques produisent un document Markdown avec frontmatter, titre et contenu exploitable.

| Type | Page | Mode | Mots | Titres | Liens | Images | Tableaux | Taille Markdown |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Article | Paul Graham, « How to Do Great Work » | HTML | 11 834 | 0 | 30 | 4 | 3 | 74 986 caractères |
| Documentation | MDN, HTML | HTML | 2 194 | 10 | 455 | 0 | 0 | 51 242 caractères |
| E-commerce | Books to Scrape, produit | HTML | 283 | 3 | 4 | 1 | 1 | 3 175 caractères |
| Application JavaScript | Vercel Templates | DOM rendu par Chrome | 1 067 | 42 | 220 | 23 | 0 | 20 284 caractères |
| Page longue | Wikipédia, Markdown | HTML | 6 002 | 15 | 642 | 8 | 7 | 99 644 caractères |

## Observation SPA

Le HTML initial de `vercel.com/templates` contient 0 mot utile. Après exécution du JavaScript dans Google Chrome, le DOM contient 4 013 caractères visibles et produit 1 067 mots en Markdown. Cela confirme que le mode Full est nécessaire pour ce type de page et que le signal de sortie vide du mode Fast est pertinent.

## Méthode

- Les quatre pages non SPA ont été téléchargées puis converties avec `htmlDocumentToMarkdown`.
- Vercel a été rendu dans Google Chrome 153 en mode headless, puis son DOM final a été converti avec le même moteur.
- Le parcours manuel **Copy as Markdown** avait déjà été validé dans Chrome sur la page publique PixelLens.
- Ces tests valident le moteur et le DOM rendu. Ils ne remplacent pas un test manuel complet du popup sur chaque page.
