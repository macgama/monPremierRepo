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
jeux/tri/               une machine
jeux/anagrammes/        une machine
jeux/sillage/           une machine
jeux/echo/              une machine
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

### Tri · habillage en os

Des billes de couleur réparties dans des tubes. On verse la série du dessus d'un
tube vers un autre, si celui-ci est vide ou montre la même couleur. Gagné quand
chaque tube est vide, ou plein d'une seule couleur.

- **Chaque niveau est vérifié solvable avant d'être servi.** Le tirage est
  entièrement aléatoire, puis un parcours en profondeur avec mémoire des
  positions déjà vues confirme qu'une solution existe ; sinon on retire. Le
  joueur ne peut jamais s'acharner sur un mélange impossible.
- La première tentative mélangeait *à l'envers* depuis l'état résolu, ce qui
  garantit la solvabilité sans solveur. Mesuré, c'était nettement moins bon :
  un tube était déjà pur au départ une fois sur deux (0,52 contre 0,01) et les
  solutions étaient 40 % plus courtes (13 coups contre 22, à sept couleurs).
  Le tirage plein filtré par le solveur a remplacé cette approche.
- Le solveur coûte **204 nœuds au pire sur 2 400 tirages**, soit 2 ms : assez
  peu pour tourner à chaque génération de niveau.
- Deux paliers : jusqu'au niveau 12, le nombre de couleurs monte de 3 à 7 avec
  **deux tubes libres** ; à partir du niveau 13, il n'y en a plus qu'**un** et le
  nombre de couleurs repart de 5. Un tirage à un seul tube libre n'est solvable
  qu'une fois sur onze environ — d'où l'insistance de la boucle de génération,
  qui desserre d'un tube en dernier recours.
- **Annuler** est illimité : une erreur ne doit pas coûter le niveau entier.
- Chaque couleur porte un **glyphe** (● ▲ ■ ◆ ★ ✚ ⬢) : la teinte n'est jamais le
  seul moyen de distinguer deux billes. Et cette machine n'a pas de couleur
  d'accent à elle — son habillage est en os, pour que les seules couleurs
  saturées de l'écran soient celles qu'on doit ranger.
- Le record est le **niveau le plus haut rangé**.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Prendre / verser | `Entrée` sur un tube | toucher un tube, puis un autre |
| Annuler | — | bouton « Annuler » |
| Recommencer le niveau | — | bouton « Recommencer » |
| Couper le son | `M` | bouton « Son » |

### Anagrammes · accent violet

Sept lettres tirées d'un mot, quatre-vingt-dix secondes, le plus de mots
français possible. Chaque lettre du tirage ne sert qu'une fois par mot.

- Points : 3 lettres → 1, 4 → 2, 5 → 4, 6 → 7, 7 → 12. La courbe est
  volontairement raide : chercher un mot long paie plus que de ratisser les
  petits.
- Le tirage vient toujours d'un **vrai mot de sept lettres**, ce qui garantit
  un tirage riche — et donne au joueur quelque chose à viser.
- **Les solutions sont précalculées, grille par grille.** Le jeu n'embarque
  aucun dictionnaire complet : valider un mot revient à interroger un ensemble
  de quelques dizaines d'entrées. C'est ce qui ramène les données à 46 Ko au
  lieu des centaines de kilo-octets qu'aurait coûté un dictionnaire de 3 à 7
  lettres.
- Le record est le **meilleur score**.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Composer | les lettres | toucher les jetons |
| Valider | `Entrée` | bouton « Valider » |
| Effacer | `Retour arrière` | bouton « ⌫ » |
| Vider la ligne | `Échap` | — |
| Mélanger le tirage | `Espace` | bouton « ⇄ » |

#### Les grilles

`jeux/anagrammes/grilles.js` contient 230 tirages. Chaque ligne est une grille :
le premier mot est celui de sept lettres, les suivants sont tous les mots de
trois à sept lettres qu'on peut en tirer, du plus long au plus court.

- Vivier de 5 990 formes françaises retenues par fréquence, **plus sévèrement
  sur les mots courts** : les mots de trois lettres sont les plus bruités dans
  les sources (`BEU`, `KOI`, `ZEB`), donc seuls les 150 plus fréquents sont
  gardés, relus un à un pour en retirer prénoms, anglicismes et vulgarités.
- Deux mots de base anagrammes l'un de l'autre donneraient le même tirage :
  `SERPENT` et `PRESENT`, `TRAINER` et `TERRAIN`… 25 doublons ont été retirés.
- Score maximal médian d'une grille : 107 points, pour 34 mots trouvables.

Sources : mêmes que Le Mot du Jour.

### Sillage · accent or

On part de son territoire, on trace un sillage dans le vide, on revient : ce
qu'on referme devient à soi. Des rôdeurs patrouillent le vide ; s'ils touchent
le sillage avant le retour, une vie est perdue.

- **La règle de remplissage tient en une phrase :** après un retour, toute
  région du vide où ne se trouve aucun rôdeur est conquise. C'est elle qui rend
  les grandes boucles payantes, et qui interdit d'enfermer un rôdeur pour rien.
  Elle est vérifiée par un test sur des terrains construits à la main : rôdeur
  à droite, à gauche, un de chaque côté, et un rôdeur pile sur le sillage.
- Une prise d'au moins 60 cases en une seule boucle **vaut double** : c'est le
  pari du jeu, sortir loin plutôt que grignoter.
- Le premier niveau ne compte **qu'un seul rôdeur** : il doit enseigner la
  règle, pas la faire subir. Ensuite, un rôdeur de plus tous les deux niveaux
  jusqu'à cinq, et tout le monde accélère.
- Objectif : 70 % du terrain. Trois vies pour la partie entière ; mourir efface
  le sillage en cours mais garde le territoire.
- Quand une zone refermée contient un rôdeur, **le jeu le dit**. Sans ce
  message, ne rien gagner passe pour une panne.
- Le record est le **meilleur score**.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Diriger | flèches, `ZQSD` | glisser sur le terrain, ou la croix |
| Démarrer | `Espace` | toucher le terrain |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

Le demi-tour est interdit tant qu'on est dehors : on se couperait son propre
sillage.

### Écho · accent bleu

La machine joue une suite de touches et de notes. Il faut la rejouer **à
l'envers**.

- C'est toute la différence avec un Simon : à l'endroit, on peut répondre au
  fur et à mesure et la mémoire n'est jamais sollicitée d'un bloc. À l'envers,
  il faut avoir retenu la suite entière avant de poser le premier doigt.
- Chaque réussite ajoute une touche **à la fin** de la suite montrée, donc au
  **début** de la réponse. La difficulté monte là où la mémoire est la plus
  fraîche, ce qui rend la progression plus douce qu'il n'y paraît.
- Les neuf touches vont du grave, en bas à gauche, à l'aigu, en haut à droite.
  La hauteur se lit surtout à la clarté ; la teinte ne bouge que de 24 degrés
  (229° → 204°), pour que les neuf touches restent visiblement le même
  instrument. Les notes suivent une **pentatonique majeure** : n'importe quelle
  suite sonne juste.
- La cadence se resserre avec la longueur, de 640 ms à 300 ms par touche.
- Une erreur coûte une vie et **la même suite est rejouée** : on n'est jamais
  renvoyé au début pour un doigt qui a glissé. Trois vies.
- Une suite complète est rejouée à l'endroit, vite, en récompense — c'est
  l'écho qui revient.
- Le record est la **plus longue suite rejouée à l'envers**.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Jouer une touche | pavé numérique `1`-`9` | toucher la case |
| Commencer | `Espace` | toucher l'écran |
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
  hall pour afficher le meilleur de chaque machine, et **un état libre** par jeu
  (`Arcade.read` / `Arcade.write`) pour les parties en cours et les
  statistiques. Chaque accès est protégé : un navigateur qui refuse le stockage
  fait perdre la sauvegarde, pas la partie.
- **Le réglage du son**, commun à toute la collection : coupé ici, coupé partout.
- **Le châssis** : rails, tableau de bord, jauge, pastilles de vies, écran de
  fin, boutons. Un composant remonte dans le socle dès qu'une deuxième machine
  s'en sert — les pastilles de vies y sont passées quand Écho a rejoint
  Sillage.

`prefers-reduced-motion` est respecté partout : les durées tombent à une frame
et les effets décoratifs (étincelles, ondes, secousses, débris) disparaissent.

## Notes d'implémentation

- **Chute** dessine en DOM : les tuiles sont des `div` positionnés en
  `transform: translate()` dans une couche unique, et les déplacements sont des
  transitions CSS dont la durée est calculée selon la distance de chute. Les
  fusions sont trouvées par remplissage par diffusion sur les valeurs
  identiques, ce qui gère les groupes de trois tuiles et plus.
- **Écho** fait démarrer la partie depuis son **voile d'attente**, pas depuis
  la grille : le voile recouvre les touches et capte les clics, si bien que
  « touchez une case pour commencer » ne déclenchait rien. Les machines à toile
  n'ont pas ce piège, leur écouteur étant posé sur le conteneur que le voile
  recouvre.
- **Sillage** nomme sa bulle de message `.annonce` et surtout pas `.flash` :
  le socle réserve cette classe à l'animation du score, et les deux se sont
  effectivement écrasées — le score disparaissait de sa tuile pour aller
  flotter en haut de la page. Une feuille de jeu ne réutilise jamais un nom de
  classe du socle pour autre chose.
- **Sillage** garde le terrain dans un `Uint8Array` de trois états (vide, terre,
  sillage) et le redessine case par case à chaque image. Le remplissage est un
  parcours en largeur amorcé depuis chaque rôdeur ; si la case d'un rôdeur est
  devenue terre au pixel près, l'amorce se reporte sur ses voisines, sans quoi
  il serait emmuré et sa région absorbée.
- **Anagrammes** vide la ligne de saisie **immédiatement** quand un mot est
  refusé, jamais après une temporisation : un vidage programmé pour plus tard
  avalait les lettres tapées entre-temps, et on tape vite dans ce jeu. Ses
  messages s'affichent dans la ligne de saisie et non à la place du chrono,
  qu'il ne faut jamais masquer.
- **Tri** dessine en DOM, comme Chute : une bille est un `div` positionné en
  `transform: translate()`, et un versement est une suite de trois transitions
  enchaînées (monter, franchir, descendre) décalées de 55 ms d'une bille à
  l'autre. Le diamètre est **mesuré sur une bille rendue**, jamais relu dans la
  feuille de style : `--bille` vaut `clamp(27px, 8.4vw, 36px)` et
  `getPropertyValue` rend la formule telle quelle, pas la valeur résolue.
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
