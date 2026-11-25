# Politique de confidentialité de PixelLens

*Dernière mise à jour : 25 novembre 2026. S'applique à PixelLens v1.3.0 et ultérieures.*

PixelLens est une extension Chrome gratuite et open source (licence MIT) qui convertit des pages web en Markdown et
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

**Tout effacer** : supprimez l'extension (clic droit sur l'icône → « Retirer de
Chrome ») : Chrome efface alors l'intégralité de ce stockage. Vous pouvez aussi
vider l'historique depuis le panneau (Historique → « Clear History »).

## Aucun échange réseau avec un tiers

PixelLens n'émet aucune requête vers ses propres serveurs, car elle n'en a pas,
ni vers un service tiers : pas de paiement, pas de compte, pas de vérification
de licence. Toutes les fonctionnalités sont gratuites. Les seules requêtes sont
celles que vous déclenchez vous-même vers le site que vous convertissez ou
crawlez (voir ci-dessous).

Les versions 1.1 et 1.2 proposaient une option Pro payante via ExtensionPay
(paiement Stripe). Elle a été retirée en v1.3.0 : l'extension ne contacte plus
`extensionpay.com`.

## Le crawl de site

La fonction « Crawl site » télécharge des pages du site **que vous avez
vous-même choisi** (celui de l'onglet actif), **depuis votre navigateur**, avec
votre session, exactement comme si vous ouvriez ces pages vous-même. Aucun
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
