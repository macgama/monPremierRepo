# Machines

Une collection de petites machines à jouer. Trois fichiers statiques par jeu,
aucune dépendance, aucune étape de build : ouvrez `index.html` dans un
navigateur, ou servez le dossier tel quel.

```
index.html              le hall : la vitrine des machines
css/arcade.css          le socle : palette, typographie, châssis, commandes
css/accueil.css         le hall
js/arcade.js            le socle : son, records, préférences
js/accueil.js           le hall
jeux/chute/             une machine
jeux/stack/             une machine
```

Chaque jeu charge `css/arcade.css` puis sa propre feuille, qui redéfinit
`--signal` (son accent), `--signal-deep` et `--panel-w` (la largeur de son
plateau). Même chose côté script : `js/arcade.js` d'abord, le jeu ensuite.

## Les machines

### Chute · accent orange

Grille 5 × 7. On vise une colonne, on lâche une tuile, elle tombe. Toute tuile
de même valeur qu'elle touche fusionne en une tuile doublée, la gravité tasse la
colonne, et les cascades s'enchaînent.

- Points d'une fusion : `valeur obtenue × (taille du groupe − 1) × combo`.
  Fusionner trois tuiles d'un coup rapporte plus que deux paires.
- **La montée** : tous les `max(8, 14 − palier)` coups, une rangée entière
  pousse par le bas et tout remonte d'un cran. C'est l'horloge de la partie. La
  jauge annonce le compte à rebours et vire à l'orange deux coups avant.
- La pioche est une **fenêtre glissante** : le plafond suit votre plus haute
  tuile (jusqu'à 64) et le plancher finit par retirer les petites valeurs, qui
  sinon encombreraient le plateau jusqu'à la fin.
- Fin de partie quand les cinq colonnes touchent le haut, ou quand une montée
  écrase une colonne déjà au plafond.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Viser | `←` `→`, `A` / `D` | glisser sur la grille |
| Lâcher | `Espace`, `↓`, `Entrée` | relâcher sur la colonne |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Stack · accent cyan

Une barre glisse au-dessus de la tour. Un appui la pose : ce qui dépasse du bloc
d'en dessous est coupé et tombe, et la barre repart de la largeur restante.

- Poser **pile-poil** (à 3,5 px près) ne coûte aucune largeur. À partir de la
  troisième pose parfaite d'affilée, la barre **regagne** 6 px par pose, sans
  jamais dépasser sa largeur de départ.
- La barre accélère avec l'altitude : `min(470, 130 + hauteur × 7)` px/s.
- Le ciel s'assombrit et les étoiles apparaissent à mesure que la tour monte.
- Fin de partie quand il ne reste plus rien à poser.
- Le record est la **hauteur**, pas un score : c'est ce que le jeu mesure.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Poser | `Espace`, `↓`, `Entrée` | toucher la tour, ou « Poser » |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

## Ce que le socle fournit

- **Le son**, entièrement synthétisé avec l'API Web Audio : aucun fichier audio
  dans le dépôt. Le contexte audio n'est créé qu'à la première interaction,
  comme l'exigent les navigateurs. Sa signature : chaque maillon d'un
  enchaînement monte d'un degré sur une échelle majeure, si bien qu'une longue
  série s'entend avant de se lire — les cascades dans Chute, les poses
  parfaites dans Stack.
- **Les records**, sous `arcade.record.<jeu>` dans le `localStorage`, lus par le
  hall pour afficher le meilleur de chaque machine. Chaque accès est protégé :
  un navigateur qui refuse le stockage fait perdre le record, pas la partie.
- **Le réglage du son**, commun à toute la collection : coupé ici, coupé partout.
- **Le châssis** : rails, tableau de bord, jauge, écran de fin, boutons.

`prefers-reduced-motion` est respecté partout : les durées tombent à une frame
et les effets décoratifs (étincelles, ondes, secousses, débris) disparaissent.

## Notes d'implémentation

- **Chute** dessine en DOM : les tuiles sont des `div` positionnés en
  `transform: translate()` dans une couche unique, et les déplacements sont des
  transitions CSS dont la durée est calculée selon la distance de chute. Les
  fusions sont trouvées par remplissage par diffusion sur les valeurs
  identiques, ce qui gère les groupes de trois tuiles et plus.
- **Stack** dessine sur une toile `canvas` : le ciel, les étoiles, la tour et
  les débris y sont peints à chaque frame. La tour est stockée en pixels et
  remise à l'échelle au redimensionnement.
- Les scripts sont des **scripts classiques, pas des modules ES** : c'est ce qui
  permet d'ouvrir le dossier par double-clic, les modules étant bloqués sur
  `file://`.
