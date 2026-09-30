# Chrome Web Store — mise à jour PixelLens 1.2.0

## Fichiers prêts

- Package à téléverser : `pixellens-1.2.0-final.zip`
- SHA-256 : `5bf73bf67165d12178d5c5b294a341da56171d379550b28d42703e30b2be7dc1`
- Description anglaise : `store-assets/listing-description-en.txt`
- Description française : `store-assets/listing-description-fr.txt`
- Justifications détaillées des permissions : `docs/STORE_LISTING.md`

Le package contient `version: 1.2.0`, déclare
`optional_host_permissions: ["http://127.0.0.1/*"]` et ne déclare aucune
`host_permissions` permanente.

## Preuves techniques

- Extension : TypeScript, ESLint et build validés.
- Extension : 20 fichiers de tests, 267 tests réussis.
- Serveur compagnon : build validé, 9 tests réussis.
- Contenu npm contrôlé avec `npm pack --dry-run` : 8 fichiers, 24 802 octets
  décompressés, exécutable `pixellens-mcp` fourni par `dist/index.js`.
- Archive Chrome contrôlée avec `unzip -t` : aucune erreur.
- Smoke test Markdown : 5 pages sur 5 converties, dont une SPA rendue par
  Google Chrome. Détails dans `store-assets/reddit-launch/smoke-tests-2026-09-20.md`.

## Ordre des actions externes

1. Publier `pixellens-mcp@0.1.0` sur npm.
2. Vérifier que `npx pixellens-mcp` installe et démarre bien la version publiée.
3. Dans la fiche Chrome Web Store existante
   (`mdjbknfjgpehbcdohjejobngijmhnfmm`), téléverser
   `pixellens-1.2.0-final.zip`.
4. Remplacer les descriptions longues EN et FR avec les deux fichiers prêts.
5. Ajouter la justification de la permission optionnelle localhost depuis
   `docs/STORE_LISTING.md`, sans modifier les autres justifications.
6. Dans le canal de test CWS, vérifier achat Pro, restauration Pro, activation
   du pont local et refus de la permission localhost.
7. Soumettre la version 1.2.0 à Google.
8. Après approbation, mettre à jour la landing avec le pont MCP.

Ces actions écrivent sur npm et Chrome Web Store : elles restent à déclencher
par Selyan. Aucune publication externe n'a été effectuée pendant la préparation.

## Reddit

Le post et la vidéo peuvent promouvoir dès maintenant le parcours gratuit déjà
public : page vers Markdown et extraction du design system. Ne pas annoncer le
pont MCP avant l'approbation de la version 1.2.0.

- Texte : `store-assets/reddit-launch/post-reddit-en.md`
- Vidéo : `store-assets/reddit-launch/video/pixellens-reddit-demo.mp4`
- Communauté prévue : `r/chrome_extensions`
- Flair prévu : `Self Promotion`

