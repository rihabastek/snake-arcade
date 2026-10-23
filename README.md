# Snake Arcade

Jeu Snake néon jouable au clavier et au tactile, sans installation ni build.

## Lancer le jeu

Double-clique simplement sur `index.html`, ou ouvre-le dans un navigateur moderne.
Aucun serveur, aucune dépendance, aucun accès réseau n'est nécessaire.

> Les scripts sont volontairement classiques (pas de modules ES) pour que le jeu
> fonctionne depuis `file://` par double-clic.

## Règles

- Mange les pommes rouges : chaque pomme fait grandir le serpent d'une case.
- Les bords du plateau sont **traversants** : sors à droite, reviens à gauche.
- Les blocs gris sont mortels. Ton propre corps aussi.
- La vitesse augmente à chaque pomme, jusqu'à un plafond.
- Le meilleur score est conservé dans le navigateur (`localStorage`).

## Commandes

| Action | Clavier | Tactile |
| --- | --- | --- |
| Tourner | Flèches, ZQSD ou WASD | Swipe sur le plateau ou croix directionnelle |
| Pause / reprendre | Espace ou bouton Pause | Bouton Pause |
| Démarrer / rejouer | Espace, Entrée ou bouton | Bouton |

## Réglages

Tout est centralisé dans `src/config.js` :

- `cols`, `rows` : dimensions de la grille (20 × 20 par défaut).
- `tickStartMs`, `tickMinMs`, `tickStepMs` : vitesse initiale, vitesse maximale,
  accélération par pomme.
- `obstacles` : disposition des blocs (quatre blocs de 2 × 2).
- `colors`, `cellSize`, `restartLockMs` : rendu et ressenti.

Après une modification, recharge avec `Ctrl+F5`.

## Structure

```
index.html               page et chargement ordonné des scripts
styles.css               thème arcade, responsive, accessibilité
src/config.js            constantes et palette
src/core/direction.js    validation des virages, file d'intentions
src/core/food.js         tirage de la pomme sur une case libre
src/core/game.js         état, pas de jeu, collisions, score
src/platform/storage.js  record persistant, tolérant aux erreurs
src/ui/renderer.js       rendu Canvas 2D et HiDPI
src/ui/input.js          clavier, swipe, croix directionnelle
src/ui/hud.js            score, écrans superposés, annonces
src/main.js              boucle à pas fixe et transitions d'état
```

## Accessibilité

- Jeu entièrement jouable au clavier.
- Score et changements d'état annoncés via `aria-live`.
- Focus visible, contrastes élevés.
- Animations et texture CRT désactivées avec `prefers-reduced-motion`.

## Limites connues

- Pas de son (hors périmètre du MVP).
- Pas de sauvegarde de partie en cours, uniquement le record.
- Pas de tests automatisés : la logique de `src/core/` reste volontairement pure
  pour pouvoir en ajouter plus tard.

## Déploiement

Le dossier est 100 % statique : il peut être publié tel quel sur GitHub Pages ou
Netlify sans étape de build.
