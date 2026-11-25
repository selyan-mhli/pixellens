# PixelLens : plan de distribution Reddit + X

> Écrit le 07/09/2026. Produit fini et publié. Le seul problème est que
> personne ne le connaît.

## Baseline mesurée le 07/09/2026

| Fait | Valeur | Source |
|---|---|---|
| Fiche Chrome Web Store | publiée le 09/08/2026 | `lib/jsonld.ts` (aksel-ai) |
| Utilisateurs | **2** | page CWS publique |
| Note | aucune | page CWS publique |
| Modèle | gratuit, open source (MIT) depuis la 1.3.0 | https://github.com/selyan-mhli/pixellens |
| Landing | akselai.fr/outils/pixellens (HTTP 200) | curl |

Un mois en ligne, 2 utilisateurs. Ce n'est pas un problème de produit, c'est un
problème de distribution. Tout ce qui suit ne sert qu'à ça.

## Révision du 08/09 : l'angle a changé

L'analyse concurrentielle a montré que « page vers Markdown » est un marché
saturé et largement gratuit (LLMFeeder est open source et compte déjà les
tokens, Copy as Markdown fait le frontmatter YAML), et que côté design system
MiroMiro exporte déjà des tokens Tailwind avec un vérificateur de contraste.
Poster sur cet angle, c'est arriver dixième.

**Le nouvel angle est le pont MCP.** Les lecteurs de pages hébergés (Jina,
Firecrawl) récupèrent l'URL depuis leurs serveurs : ils ne voient jamais ce qui
est derrière un login et rendent mal les applications JavaScript. PixelLens fait
lire l'assistant depuis le navigateur de l'utilisateur, avec sa session. Cette
limite des concurrents est structurelle, pas un retard de fonctionnalité : ils ne
peuvent pas la corriger sans devenir, eux aussi, une extension.

Phrase de tête : **« Your AI reads the page you are on. Login and all. »**

Conséquences sur ce plan :

- Subreddits prioritaires : r/mcp, r/ClaudeAI, r/ChatGPTCoding, r/cursor.
  r/webdev et r/web_design reculent en second rideau, ils servaient l'ancien angle.
- Le post qui a une chance n'est pas « j'ai fait une extension », c'est le
  problème résolu : « mon assistant ne pouvait pas lire mes pages authentifiées,
  voilà ce que j'ai construit », méthode entière donnée, sans lien.
- Prérequis absolu : le pont doit être publié avant le premier post. Poster sur
  une fonctionnalité qui n'est pas dans la version du store est le meilleur moyen
  de brûler l'angle et le compte en même temps.

## Le pitch, en une phrase

> Feed your AI real pages, not screenshots.

Ce que ça veut dire pour l'utilisateur : il colle une vraie page dans le contexte de
Claude ou ChatGPT au lieu d'une capture d'écran ou d'un copier-coller sale, et il
récupère au passage le design system de la page. Tout en local, aucune clé API.

Trois publics, trois douleurs différentes. Ne jamais mélanger les trois dans un
même post.

1. **Devs qui codent avec une IA** : le contexte qu'ils donnent à leur LLM est
   sale. Argument : Markdown propre, bundle « Copy for LLM ».
2. **Devs frontend et designers** : reproduire le style d'un site prend une heure
   d'inspecteur. Argument : scan, tokens, export Tailwind et CSS.
3. **Gens qui refusent le cloud** : tout est local, aucun compte, aucune clé.
   Argument : privacy. C'est le différenciateur le plus fort face aux concurrents
   SaaS, et le plus facile à prouver.

## Bios

### Reddit, version courte (sous 100 caractères)

```
I build local-first Chrome tools for devs who work with AI. Currently: PixelLens.
```

### Reddit, version principale (250 caractères, entity footer inclus)

```
I build small local-first browser tools for people who work with AI every day.
PixelLens turns any web page into clean Markdown for your LLM and extracts its
design system. No server, no API key. Selyan Mouhali / Aksel AI / France /
AI dev tools / Chrome extension, TypeScript, React
```

### X, bio (160 caractères)

```
I build local-first tools for devs who work with AI. PixelLens: any web page to
clean Markdown + design tokens, no API key. Building in public from France.
```

Règle commune : ces bios contiennent les mots que les gens tapent réellement dans
ChatGPT et Perplexity (« web page to markdown for LLM », « extract design system
from website », « local chrome extension no API key »). C'est ce qui fait que le
profil ressort dans les réponses IA, pas seulement dans la recherche Reddit.

## Où poster (à valider par le script avant d'écrire quoi que ce soit)

Candidats, par ordre de pertinence supposée. Les chiffres de membres et surtout
les règles d'auto-promotion changent souvent : passer chaque sub au script
`~/.claude/scripts/reddit-recon.py subs` avant de s'en approcher.

| Subreddit | Public | Angle à utiliser |
|---|---|---|
| r/SideProject | makers | l'histoire de construction, lien autorisé |
| r/ClaudeAI | devs IA | contexte propre pour Claude |
| r/ChatGPTCoding | devs IA | même angle |
| r/webdev | devs front | design system, très strict sur la promo |
| r/Frontend | devs front | tokens, export Tailwind |
| r/chrome_extensions | early adopters | technique, MV3, local |
| r/web_design | designers | extraction de palette |

Hacker News (Show HN) est un canal à part, à garder pour quand l'extension aura
ses premiers avis. Un Show HN à 2 utilisateurs et zéro review se noie.

## Les trois règles qui font bannir

1. **Ne jamais poster un lien avant d'avoir du karma.** Un compte neuf qui poste
   un lien vers son produit est filtré automatiquement, souvent sans notification.
2. **Ratio 9 pour 1.** Neuf contributions qui ne parlent pas de toi pour une qui
   en parle. Ce n'est pas de la morale, c'est ce que les modérateurs vérifient
   dans l'historique avant de supprimer un post.
3. **Ne jamais mettre le lien dans un commentaire d'aide.** On répond
   utilement, sans lien. Le lien est dans la bio, c'est exactement pour ça
   qu'elle est écrite au-dessus.

## Calendrier 30 jours

### Semaine 1 : reconnaissance, zéro publication

- Créer l'app Reddit (2 min) et lancer les trois commandes de recon.
- Lire 3 threads par sub dans la liste sortie par le script.
- Poser les deux bios sur Reddit et X.
- X : commencer tout de suite, X n'a pas le problème de karma de Reddit. Un post
  par jour sur ce que tu construis vraiment.

### Semaine 2 : contribution seule

- 3 commentaires utiles par jour sur Reddit, aucun lien, aucune mention du
  produit. Cible : les threads sortis par la commande `pain`, où quelqu'un
  cherche exactement ce que PixelLens fait.
- Objectif chiffré : 50 de karma commentaire. En dessous, la plupart des subs
  filtrent encore.

### Semaine 3 : premier post

- r/SideProject en premier, c'est le sub le plus tolérant. Format qui marche :
  ce que tu as construit, pourquoi tu en avais besoin, ce que ça t'a coûté, ce
  qui ne marche pas encore. Le lien en fin de post, une seule fois.
- Rester dans les commentaires pendant les 4 heures qui suivent. Un post dont
  l'auteur répond à tout monte, un post abandonné meurt.
- Ne pas enchaîner sur un deuxième sub le même jour.

### Semaine 4 : mesure et décision

- Relever les utilisateurs CWS, les étoiles GitHub, le trafic de la landing.
- Décision franche : si moins de 50 installs sur le mois, le problème n'est pas
  le canal mais le pitch, et on réécrit le pitch avant de continuer. Si plus de
  50, on répète sur le sub suivant.

## Ce qu'on mesure

Trois chiffres, relevés chaque lundi, rien d'autre :

1. utilisateurs sur la fiche CWS (baseline : 2 le 07/09)
2. étoiles GitHub (baseline : à relever le jour de la bascule open source)
3. karma Reddit (baseline : 0)

Le reste (impressions X, upvotes) est du bruit tant que le premier chiffre ne
bouge pas.
