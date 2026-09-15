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
jeux/mot/               une machine
jeux/rebond/            une machine
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

### Le Mot du Jour · accent vert

Un mot français de cinq lettres, six essais. Le même pour tout le monde, un seul
par jour : le mot se déduit de la date, sans serveur ni synchronisation.

- **Les accents ne comptent pas.** Tout est normalisé en majuscules sans
  diacritiques, à la saisie comme dans les listes : on tape `E` pour `É`.
- Les lettres en double sont jugées en **deux passes** : les bien placées
  d'abord, les autres piochent dans ce qu'il reste. Sans ça, `ELLES` contre un
  mot à un seul `E` afficherait deux `E` présents.
- La partie du jour, les statistiques et les réglages survivent au rechargement.
  La grille se partage en carrés emoji, par le presse-papiers ou, s'il est
  refusé, dans une zone de texte à copier.
- Le record de cette machine est la **meilleure série de jours consécutifs**.
- Clavier **AZERTY** à l'écran, et le clavier physique marche aussi.
- Un bouton **Contraste** remplace le couple vert / ambre par bleu / orange,
  lisible pour les daltonismes rouge-vert. L'état « présent » porte en plus un
  losange, pour que la couleur ne soit jamais seule à porter l'information.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Écrire | les lettres | clavier à l'écran |
| Valider | `Entrée` | touche « Entrée » |
| Effacer | `Retour arrière` | touche « ⌫ » |
| Couper le son | `M` | bouton « Son » |

#### Les listes de mots

`jeux/mot/mots.js` contient deux listes, en majuscules sans accent, concaténées
sans séparateur pour tenir en peu de place :

- **581 solutions**, soit 1,6 an de mots quotidiens, choisies à la main depuis un
  vivier classé par fréquence : uniquement des noms, adjectifs et infinitifs
  courants. Ni formes conjuguées, ni mots-outils, ni noms propres, ni
  vulgarités. L'ordre est mélangé pour qu'un jour ne trahisse pas le suivant.
- **6 721 formes acceptées** en proposition, formes conjuguées comprises, pour
  qu'un mot français valide ne soit jamais refusé.

Sources : [hbenbel/French-Dictionary](https://github.com/hbenbel/French-Dictionary)
et [Taknok/French-Wordlist](https://github.com/Taknok/French-Wordlist) pour les
formes, [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
(OpenSubtitles 2018) pour le classement par fréquence.

### Rebond · accent magenta

Une chute libre dans un puits. La bille tombe seule et rebondit sur les parois ;
le seul pouvoir du joueur est d'inverser son sens horizontal. Il faut être en
face du trou au moment d'atteindre la barre.

- Le réglage qui décide de tout est la **vitesse latérale**. À 1,55 fois la
  vitesse de chute, la bille traversait tout le puits entre deux barres : le
  joueur ne pouvait que subir les rebonds. À **0,62 fois**, elle parcourt six
  dixièmes de l'écart entre deux barres, de quoi viser sans pouvoir flâner.
- Les trous se décalent d'au plus **0,45 fois l'écart** d'une barre à l'autre,
  soit moins que le déplacement possible dans l'intervalle : aucun passage
  n'est impossible, et il reste de la marge pour se raviser. La première barre
  est toujours en face du départ.
- La difficulté ne vient donc jamais d'un tirage injouable, mais du trou qui
  rétrécit (118 px → 54) et du temps de réaction qui fond (la chute passe de
  190 à 430 px/s).
- Le record est la **profondeur en mètres**, un mètre valant dix pixels.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Inverser le sens | `Espace`, `Entrée`, `←` `→` | toucher le puits, ou « Inverser » |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

La partie ne démarre qu'au premier appui : on a le temps de lire le puits avant
de tomber.

## Ce que le socle fournit

- **Le son**, entièrement synthétisé avec l'API Web Audio : aucun fichier audio
  dans le dépôt. Le contexte audio n'est créé qu'à la première interaction,
  comme l'exigent les navigateurs. Sa signature : chaque maillon d'un
  enchaînement monte d'un degré sur une échelle majeure, si bien qu'une longue
  série s'entend avant de se lire — les cascades dans Chute, les poses
  parfaites dans Stack.
- **Les records**, sous `arcade.record.<jeu>` dans le `localStorage`, lus par le
  hall pour afficher le meilleur de chaque machine, et **un état libre** par jeu
  (`Arcade.read` / `Arcade.write`) pour les parties en cours et les
  statistiques. Chaque accès est protégé : un navigateur qui refuse le stockage
  fait perdre la sauvegarde, pas la partie.
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
- **Le Mot du Jour** n'anime que des classes CSS : la révélation d'une ligne est
  une suite de retournements décalés, déclenchés par minuterie.
- **Rebond** dessine lui aussi sur une toile, et borne le pas de temps à 33 ms :
  au-delà, la bille pourrait franchir une barre sans que la collision soit vue.
- **Stack** dessine sur une toile `canvas` : le ciel, les étoiles, la tour et
  les débris y sont peints à chaque frame. La tour est stockée en pixels et
  remise à l'échelle au redimensionnement.
- Les scripts sont des **scripts classiques, pas des modules ES** : c'est ce qui
  permet d'ouvrir le dossier par double-clic, les modules étant bloqués sur
  `file://`.
