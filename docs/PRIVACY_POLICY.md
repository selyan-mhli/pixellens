# Politique de confidentialité — PixelLens

*Dernière mise à jour : 3 août 2026 — s'applique à PixelLens v1.1.0 et ultérieures.*

PixelLens est une extension Chrome qui convertit des pages web en Markdown et
extrait le design system des pages que vous consultez. Elle a été conçue pour
fonctionner **entièrement en local, dans votre navigateur**.

## Ce que PixelLens ne fait pas

- **Aucune donnée collectée.** PixelLens ne collecte, ne transmet et ne vend
  aucune donnée personnelle, aucun historique de navigation, aucun contenu de
  page.
- **Aucun serveur.** PixelLens n'a pas de backend. Les conversions Markdown,
  les scans de design system, les vérifications de contraste et les exports
  sont calculés localement par votre navigateur.
- **Aucun analytics, aucune télémétrie.** Pas de mesure d'audience, pas de
  rapport d'erreur distant, pas de « ping » au démarrage.
- **Aucun compte.** PixelLens ne demande ni inscription ni identifiant.

## Ce qui est stocké sur votre machine

PixelLens utilise le stockage local de Chrome (`chrome.storage`), qui reste
dans votre profil de navigateur :

| Donnée | Emplacement | Contenu |
|---|---|---|
| Préférences d'affichage | `chrome.storage.sync` | Format de couleur (HEX/RGB/HSL), taille de grille, thème |
| Historique de scans | `chrome.storage.local` | Les 20 derniers design systems extraits (couleurs, typo, spacings, URL et titre de la page scannée) |
| État de l'interface | `chrome.storage.local` | Vue active du panneau, dernière conversion Markdown |
| Licence Pro | `chrome.storage.local` | La clé de licence que vous avez saisie et la date de sa dernière vérification |

**Tout effacer** : supprimez l'extension (clic droit sur l'icône → « Retirer de
Chrome ») — Chrome efface alors l'intégralité de ce stockage. Vous pouvez aussi
vider l'historique depuis le panneau (Historique → « Clear History ») et retirer
la licence depuis les Réglages (« Retirer la licence »).

## La seule requête sortante : la vérification de licence

Si — et seulement si — vous activez une licence Pro, PixelLens contacte
l'API de Gumroad (`https://api.gumroad.com/v2/licenses/verify`) pour vérifier
votre clé :

- la requête ne transporte que **votre clé de licence** et **l'identifiant du
  produit PixelLens** — rien d'autre ;
- elle est émise à l'activation, puis au plus **une fois tous les 30 jours** ;
- si le serveur est injoignable (hors ligne, panne), PixelLens **conserve votre
  statut Pro** et n'envoie rien d'autre ;
- sans licence saisie, cette requête n'est **jamais** émise.

Le traitement de votre achat (paiement, email de confirmation) est réalisé par
Gumroad et régi par sa propre politique de confidentialité :
https://gumroad.com/privacy

## Le crawl de site

La fonction « Crawl site » télécharge des pages du site **que vous avez
vous-même choisi** (celui de l'onglet actif), **depuis votre navigateur**, avec
votre session — exactement comme si vous ouvriez ces pages vous-même. Aucun
intermédiaire : les requêtes vont directement de votre navigateur au site
concerné. Le résultat (le document Markdown) reste dans votre navigateur tant
que vous ne le copiez ou ne le téléchargez pas. Le crawl respecte le fichier
robots.txt du site par défaut.

## Modifications

Toute évolution de cette politique sera publiée à cette adresse et datée. Une
version de PixelLens qui changerait la nature des données traitées verrait sa
politique mise à jour **avant** publication.

## Contact

Pour toute question : claudeselyanlakh@gmail.com
