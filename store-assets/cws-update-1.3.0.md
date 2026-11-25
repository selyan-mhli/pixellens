# Chrome Web Store — mise à jour PixelLens 1.3.0

PixelLens passe 100 % gratuite et open source (MIT,
https://github.com/selyan-mhli/pixellens). Auteur : Adam Hnaien
(https://adamhnaien.fr).

## Ce qui change dans cette version

- Palier Pro supprimé : toutes les fonctionnalités sont gratuites (Copy for LLM,
  exports de tokens, pont local, historique complet).
- Crawl de site jusqu'à 100 pages pour tout le monde (l'ancienne limite à
  3 pages en gratuit disparaît).
- Plus aucune requête vers `extensionpay.com` : ExtensionPay et Stripe sont
  retirés du code. L'extension ne contacte plus aucun service tiers.
- Permission d'hôte `extensionpay.com` retirée du manifest, avec son content
  script de relais. Le manifest ne garde que `optional_host_permissions`
  (`http://127.0.0.1/*`, demandée seulement à l'activation du pont local).
- Politique de confidentialité mise à jour (`docs/PRIVACY_POLICY.md`, du
  25 novembre 2026) : plus de paiement, de compte ni de vérification de licence.

## Fichiers prêts

- Package à téléverser : `pixellens-1.3.0.zip`, construit depuis un `dist/` propre
  (voir `store-assets/README.md`, section « Zipper la 1.3.0 »)
- Descriptions : `listing-description-en.txt`, `listing-description-fr.txt`,
  `listing-short-description.txt`
- Justifications de permissions : `docs/STORE_LISTING.md` (la section ExtensionPay
  a été supprimée)
- Captures : `store-assets/screenshots/01…05.png` (v1.3.0, sans mention Pro)

## Ordre des actions externes

1. Reconstruire et zipper depuis un `dist/` propre, puis vérifier dans le zip :
   `version` = 1.3.0, aucune `host_permissions`, aucune chaîne `extensionpay`.
2. Dans la fiche existante (`mdjbknfjgpehbcdohjejobngijmhnfmm`), téléverser
   `pixellens-1.3.0.zip`.
3. Remplacer les descriptions courte et longues EN/FR par les fichiers prêts,
   et remplacer les 5 captures.
4. Onglet « Payments » : retirer la déclaration d'achats intégrés.
5. Onglet « Privacy practices » : supprimer la justification du content script
   `extensionpay.com`, conserver les autres, vérifier l'URL de la politique de
   confidentialité (page du site synchronisée avec `docs/PRIVACY_POLICY.md`).
6. Soumettre la version 1.3.0 à Google.

Ces actions écrivent sur le Chrome Web Store : elles restent à déclencher par
Selyan. Aucune publication externe n'a été effectuée pendant la préparation.

Point d'attention : la description courte affichée par le store vient du champ
`description` du manifest, qui n'est pas modifié ici. Elle peut différer du
fichier `listing-short-description.txt`.
