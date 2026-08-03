// PixelLens — Relais ExtensionPay
//
// Content script chargé UNIQUEMENT sur https://extensionpay.com/* (voir manifest).
// L'import exécute le code d'ExtPay qui, sur ce domaine, relaie les événements de
// la page de paiement/login vers l'extension (chrome.runtime.sendMessage) — c'est
// ce qui permet le déblocage Pro instantané après paiement (onPaid). Il ne touche
// à rien d'autre et ne tourne sur aucun autre site.

import 'extpay'
