# Politique de confidentialité de PixelLens

*Dernière mise à jour : 3 août 2026. S'applique à PixelLens v1.1.0 et ultérieures.*

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
| Statut Pro (cache) | `chrome.storage.local` | Votre statut gratuit/Pro, l'email du compte de paiement le cas échéant, la date de dernière vérification (ce cache permet de rester Pro hors ligne) |
| Cache ExtensionPay | `chrome.storage.sync` | Données techniques de la bibliothèque de paiement (statut utilisateur, date d'installation) |

**Tout effacer** : supprimez l'extension (clic droit sur l'icône → « Retirer de
Chrome ») : Chrome efface alors l'intégralité de ce stockage. Vous pouvez aussi
vider l'historique depuis le panneau (Historique → « Clear History »).

## Les seuls échanges réseau : le paiement Pro (ExtensionPay)

PixelLens n'émet aucune requête vers ses propres serveurs, car elle n'en a pas.
Les seuls échanges réseau de l'extension elle-même concernent l'option Pro,
via le service ExtensionPay (`extensionpay.com`) :

- **quand ils ont lieu** : uniquement lorsque vous cliquez « Passer en Pro »
  (ouverture de la page de paiement), « J'ai déjà payé » (restauration par
  email), « Vérifier mon paiement », puis, pour un utilisateur Pro, au plus
  **une fois tous les 30 jours** pour confirmer le statut. Si vous n'utilisez
  jamais l'option Pro, **aucune requête n'est émise** ;
- **ce qui transite** : l'identifiant du produit PixelLens et un identifiant
  technique d'installation généré par la bibliothèque de paiement ; votre
  email uniquement si vous le saisissez vous-même sur la page de paiement ou
  de restauration. Jamais votre navigation, jamais le contenu des pages ;
- **hors ligne** : si le serveur est injoignable, PixelLens **conserve votre
  statut Pro** et n'envoie rien d'autre ;
- le paiement par carte est traité par **Stripe** sur la page d'ExtensionPay :
  votre numéro de carte ne passe jamais par l'extension.

Politiques des prestataires : https://extensionpay.com/privacy ·
https://stripe.com/privacy

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
