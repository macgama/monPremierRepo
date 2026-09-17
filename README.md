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
jeux/fonderie/          une machine
jeux/quitte/            une machine
jeux/ricochet/          une machine
jeux/intrus/            une machine
jeux/cadence/           une machine
jeux/fonte/             une machine
jeux/bascule/           une machine
jeux/reseau/            une machine
jeux/trace/             une machine
jeux/contraire/         une machine
jeux/balance/           une machine
jeux/filature/          une machine
jeux/pont/              une machine
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

### Fonderie · habillage en acier

Le client commande un alliage de **quatre doses** tirées d'un jeu de métaux. On
coule un essai, le laboratoire rend son rapport : combien de doses sont du bon
métal **à la bonne place**, combien sont du bon métal **mal placé**. On
recommence jusqu'à trouver la recette, ou jusqu'à épuiser les huit essais.

- C'est un Mastermind, et le décor n'est pas un habillage : **un rapport
  d'essai est littéralement ce retour-là**, quand des pions colorés n'en sont
  qu'une convention.
- Le cœur du jeu est le calcul du rapport, et c'est là que le genre se casse :
  sur les doses en double. Il se fait en **deux passes** — les doses à leur
  place d'abord, les autres piochent dans ce qui reste. Sans ça, un essai à
  deux doses de cuivre contre une cible qui n'en a qu'une en compterait deux.
- Points d'une commande : `(9 − essais utilisés) × 10`. Trouver en quatre
  essais vaut 50, en huit vaut 10.
- Le vivier s'élargit : cinq métaux à la première commande, six à la deuxième,
  sept ensuite. Manquer une commande termine la série.
- Chaque métal porte un **glyphe** (▲ ● ■ ◆ ★ ✚ ⬢) et un nom : la teinte n'est
  jamais le seul moyen de distinguer deux doses.
- Comme Tri, cette machine n'a **pas de couleur à elle** — Tri prend le registre
  chaud (os), Fonderie le registre froid (acier) — pour que les seules teintes
  franches de l'écran soient celles des métaux qu'on doit deviner.
- Le record est le **meilleur score** d'une série.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Ajouter une dose | `1` à `7` | toucher un métal |
| Retirer une dose | `Retour arrière` | toucher la dose dans le creuset |
| Couler l'essai | `Entrée` | bouton « Couler l'essai » |
| Recommencer | `R` | bouton « Nouvelle série » |
| Couper le son | `M` | bouton « Son » |

### Quitte · accent rouge braise

Cinq descentes. À chaque palier on tire une carte du puits : un **filon**
grossit la sacoche, un **grondement** arme son danger. Le **deuxième**
grondement d'un même danger fait s'effondrer la galerie — et met fin à la
**série entière**. Remonter met la sacoche à l'abri et ouvre la descente
suivante.

Le paquet compte 15 filons (de 1 à 17) et 4 dangers en 3 exemplaires. Le risque
affiché est **exact** : c'est le nombre de cartes mortelles restantes divisé par
le nombre de cartes restantes, et le tableau de bord montre les deux.

#### Le réglage vient d'une simulation faite avant l'interface

Deux versions ont été écrites, mesurées et **jetées** :

| Version | Ce que rapporte la lecture du puits |
| --- | --- |
| Effondrement = sacoche perdue, cinq descentes indépendantes | **+3 %** sur une règle aveugle |
| Idem, mais paquet persistant sur la série | **+6 %**, et *en retrait* au 99ᵉ centile |
| **Effondrement = série perdue** | **+15 %**, et +34 points d'écart avec la lecture naïve |

Les deux premières étaient des machines à sous : un joueur qui remonte
mécaniquement au palier 6, sans jamais regarder le puits, jouait à 3 % du
joueur attentif. La cause est structurelle — un effondrement ne coûtait que la
sacoche du moment, trop peu face au total d'une série.

La troisième version tient parce que le coût du risque devient **ce qu'on
sacrifie des descentes à venir**, donc un coût qui fond à mesure que la série
avance : prudent au début, gourmand à la fin. Trois faits mesurés :

- Les règles aveugles imposent un vrai dilemme : « palier 4 partout » donne la
  meilleure moyenne (55,9) mais « palier 7 partout » donne une **médiane de 0**
  et le meilleur 99ᵉ centile (197). Consistance contre record.
- **Ne lire que le risque immédiat est un piège actif : −19 %.** Le joueur qui
  oublie les descentes restantes joue moins bien qu'un automate.
- Lire le risque **et** ce qu'un effondrement ferait perdre : +15 %, et robuste
  (diviser ou doubler l'estimation ne coûte que 5 %).

C'est pourquoi le tableau de bord affiche le risque **et** les descentes
restantes : sans la seconde information, la première induit en erreur.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Descendre d'un palier | `↓`, `Espace` | bouton « Descendre » |
| Remonter et encaisser | `↑`, `Entrée` | bouton « Remonter » |
| Recommencer | `R` | bouton « Nouvelle série » |
| Couper le son | `M` | bouton « Son » |

### Ricochet · accent anis

On tire la bille en fronde ; elle rebondit sur les parois et les blocs, et
**traverse les cibles sans dévier** — un seul tir bien placé peut en ramasser
plusieurs. Autant de tirs que de cibles, un de moins passé le niveau 10, et
chaque tir épargné vaut 60 points.

- **La simulation tourne en unités fixes (320 × 430) et au pas fixe de 1/60 s**,
  quelle que soit la taille de l'écran. La trajectoire jouée est donc exactement
  celle qui a servi à vérifier le niveau — sans quoi la garantie ne vaudrait
  rien. La toile est mise à l'échelle au rendu, jamais la physique.
- **Un niveau n'est servi qu'une fois vérifié.** Chaque cible doit être
  atteignable par au moins un tir d'un balayage de 630 tirs. Et quand les tirs
  sont moins nombreux que les cibles, il faut en plus qu'un tir en ramasse deux :
  ce tir, plus un par cible restante, tient alors dans le budget. C'est ce qui
  rend la faisabilité **démontrable** plutôt que probable.
- Que les cibles ne dévient pas la bille n'est pas qu'un choix de confort :
  c'est ce qui rend la vérification décidable, puisque la trajectoire d'un tir
  ne dépend pas des cibles déjà ramassées.
- Mesuré : un niveau servi par tirage, en 20 ms environ, et **un tir au hasard
  touche une cible donnée 10 % du temps** — la visée compte sans que la cible
  soit une aiguille. Rebonds moyens : 1,8 au niveau 1, 3,1 au niveau 14.
- L'aperçu s'arrête au **premier rebond**. Au-delà, c'est au joueur de voir
  venir.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Viser et tirer | — | tirer en arrière puis relâcher |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Intrus · accent fuchsia

Une grille de pastilles identiques, sauf une. La trouver avant le sablier.

- **La différence change de nature d'une manche à l'autre** : teinte, clarté,
  pivot, taille, décalage. Ce n'est pas un caprice — une différence seulement
  colorée exclurait du jeu ceux qui distinguent mal les teintes. Ici la couleur
  n'est qu'une possibilité sur cinq.
- L'écart fond d'environ 9 % par manche jusqu'à un **plancher atteint vers la
  manche 15** ; au-delà, seuls le sablier et la taille de la grille se
  resserrent. Le jeu durcit sans fin mais ne devient jamais imperceptible.
- Les natures géométriques sont exprimées **en pixels rendus**, pas en
  pourcentage de la pastille. Une première version les exprimait en
  pourcentage : mesurée sur le rendu, elle descendait à **0,6 px de décalage**
  en grille 6 × 6, c'est-à-dire invisible, sans que le réglage l'annonce. La
  grille est donc bâtie en deux passes : toutes les pastilles identiques, on
  mesure celle qui est rendue, puis on applique l'écart dans la bonne unité.
- Le pivot lui-même est ramené au **déplacement d'un coin en pixels**, puis
  reconverti en degrés selon la taille réelle de la pastille.
- Après une erreur, l'intrus est désigné et sa nature annoncée : c'est comme ça
  que l'œil apprend.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Désigner | — | toucher la pastille |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Cadence · accent sarcelle

Quatre voies, des notes qui descendent, une ligne de frappe. La batterie donne
le pouls ; la mélodie, c'est le joueur qui la joue — chaque voie a sa note.

- **Une seule horloge, celle du son.** La position d'une note à l'écran et le
  jugement d'une frappe se calculent tous deux depuis
  `AudioContext.currentTime`. L'horloge des images ne sert qu'à décider quand
  redessiner, jamais à dater quoi que ce soit. Mesurée en conditions de test,
  la dérive entre les deux horloges allait de **−0,9 ms à −21 ms sur six
  secondes** selon la charge : de quoi transformer une frappe juste en frappe
  ratée si on datait sur la mauvaise.
- La batterie est **planifiée en avance à des instants absolus** du contexte
  audio, et les notes portent ces mêmes instants : ce qu'on entend et ce qu'on
  voit descendent du même nombre.
- Fenêtres de jugement : 45 ms pour un parfait, 90 ms pour un bien, 150 ms pour
  un passable.
- Le seuil de survie se lit dans les nombres : à −5 de justesse par note
  manquée et +2 par parfaite, il faut en toucher **un peu plus de sept sur
  dix** pour se maintenir. Un premier réglage à −9 en exigeait plus de huit sur
  dix, ce qui ne laissait pas le temps d'apprendre les voies.
- Frapper dans le vide coûte de la justesse : le martèlement ne paie pas.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Frapper une voie | `D` `F` `J` `K`, ou les flèches | toucher la voie |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Fonte · accent ambre

Une fonderie qu'on lance à la main et qui finit par tourner seule. On pioche du
minerai, on le fond, on vend le lingot ; puis on achète les bâtiments qui le
feront à votre place, du mineur à l'aciérie. Et quand la courbe s'essouffle, on
refond tout pour repartir plus vite.

- **L'équilibrage est le jeu.** Une chaîne qui s'étrangle ou une courbe qui
  plafonne, et il n'y a rien à sauver. Les nombres ne sont donc pas devinés :
  ils sortent d'une simulation qui fait tourner une heure d'usine en quelques
  millisecondes, avec de vrais stocks et une politique d'achat qui comprend la
  chaîne (les écus d'abord, sinon les lingots, sinon le minerai).
- Ce que cette simulation a écarté : une première table où le premier
  convertisseur ne tombait qu'à la **43ᵉ minute** et la première aciérie à la
  **52ᵉ** — trente minutes sans rien de neuf à regarder. Puis, à l'autre bout,
  des tables assez généreuses pour ouvrir la chaîne en dix minutes mais qui
  finissaient à 10¹⁷ écus par seconde, avec trois cent cinquante exemplaires de
  chaque bâtiment.
- La table retenue : coûts en **1,12ⁿ**, production d'un type **doublée tous
  les neuf exemplaires**. Elle ouvre les cinq étages en dix-huit minutes et ne
  s'emballe pas.

  | | mesuré |
  | --- | --- |
  | premier four | 1,9 min |
  | premier lamineur | 4,0 min |
  | premier convertisseur | 13,2 min |
  | première aciérie | 17,6 min |
  | un million d'écus | 17,1 min |
  | cent millions | 21,6 min |
  | revenu après une heure | 4,5 milliards/s |
  | bâtiments après une heure | 198 / 180 / 179 / 153 / 123 |

- **L'or d'une refonte suit un logarithme**, pas une racine : les gains d'un jeu
  de ce genre montent plus vite que n'importe quelle puissance, et avec une
  racine carrée la troisième refonte était gratuite — la simulation donnait
  7 156 puis 7 879 339 d'or. Avec `15 × log₁₀(gagné / 10⁸)`, la boucle converge :
  +30, +24, +15, +6, +2, et le bonus se stabilise vers ×4.
- **Le banc d'essai joue contre le code livré**, pas contre une copie : la
  politique d'achat de la simulation pilote le vrai `tourner()` du jeu par
  `window.Fonte`. Les neuf jalons du tableau ci-dessus retombent au dixième de
  minute près. Sans cela, une table réglée hors ligne ne prouverait rien sur le
  jeu réellement servi.
- L'usine **continue sans vous**, à mi-régime et pour quatre heures au plus. Le
  rattrapage n'est pas une formule : c'est la même boucle de production,
  rejouée seconde par seconde au retour.
- La consigne d'accueil se déclenche sur une **usine à laquelle personne n'a
  touché**, pas sur l'absence de sauvegarde : ouvrir la page puis la fermer en
  crée une, et le conseil d'ouverture disparaissait avant d'avoir servi.
- La durée d'affichage d'un message ne passe pas par `Arcade.ms()`. Cette
  fonction écrase les durées à une frame quand le mouvement réduit est demandé,
  ce qui convient à une animation et jamais à un texte qu'il faut lire.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Piocher | `Espace` | le carreau de mine |
| Acheter un bâtiment | — | son bouton, par 1, 10 ou au maximum |
| Couper le son | — | bouton « Son » |

### Bascule · accent indigo

Toucher une case retourne cette case et ses quatre voisines. Tout éteindre, et
si possible au par.

- **Le jeu est un système linéaire sur GF(2)**, le corps à deux éléments où
  1 + 1 = 0. Chaque coup est un vecteur : jouer deux fois la même case ne change
  rien, et l'ordre des coups est sans importance. Trois conséquences, et ce sont
  elles qui font le jeu.
- **Une grille fabriquée en jouant des coups sur une grille éteinte est soluble
  par construction.** Inutile de vérifier : c'est un théorème, pas un test.
- **Le par se calcule.** On résout `Ax = b` par élimination de Gauss, puis on
  parcourt le noyau de `A` et on garde la solution la plus légère. Ce n'est pas
  une estimation ni le nombre de coups de mélange : c'est le minimum.
- **L'échelle ne retient que les formes à noyau nul** — 3×3, 4×3, 5×4, 6×5,
  6×6 — parce que la solution y est unique et que le par vaut alors exactement
  le nombre de cases mêlées : on choisit la difficulté au lieu de la subir. La
  4×4 et la 5×5 en sont exclues pour la raison inverse : leur noyau vaut 4 et 2,
  et quel que soit le mélange leur par **plafonne à 7 et 15**.
- **La chasse aux lumières retombe sur le par.** Descendre rangée par rangée en
  éteignant celle du dessus, pour chacune des 2^largeur amorces possibles de la
  rangée du haut, et garder la meilleure : sur 2 200 grilles, ce parcours donne
  exactement le même nombre que l'élimination de Gauss. Deux méthodes
  indépendantes qui s'accordent, c'est une vérification, pas une coïncidence.
- **La réserve de coups est commune à toute la partie**, et non à chaque grille.
  Un budget par grille punirait d'un coup le joueur qui a mal amorcé sa chasse ;
  une réserve laisse une grille propre financer la suivante. Chaque grille
  éteinte recrédite du par plus une prime.
- **La prime sort de la mesure**, pas du doigt mouillé : le surcoût du chasseur
  naïf vaut 2,1 · 3,3 · 5,4 · 9,2 · 11,5 coups selon la forme, et la prime vaut
  ce surcoût plus quatre. Simulé sur 400 parties par profil, avec 40 coups au
  départ : le joueur qui vise le par ne meurt pas, le chasseur méthodique tient
  **une quarantaine de grilles**, le joueur brouillon **une douzaine**.
- Le tâtonnement pur, lui, ne mène nulle part : sur une 5×5, taper au hasard une
  case allumée ne résout la grille que **2 fois sur 300** en deux cents coups.
  C'est pourquoi la ligne d'aide donne la méthode au lieu de la faire deviner.
- À la fin, la grille se redessine **en miniature** dans l'écran de fin, avec les
  coups qu'il restait à jouer. Les marquer sur le vrai plateau ne servait à
  rien : le voile de fin le recouvre.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Retourner une case | — | toucher la case |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Réseau · accent émeraude

Des tuyaux en morceaux, chacun pivotant d'un quart de tour ; relier la source à
toutes les bouches avant le chrono.

- **La grille est fabriquée à l'envers**, depuis un arbre couvrant obtenu par
  parcours en profondeur aléatoire : toutes les cases sont reliées, il n'y a
  aucune boucle, et le nombre de raccords vaut exactement cases − 1. Puis chaque
  tuile pivote au hasard. Vérifié sur 288 grilles servies par le jeu lui-même.
- **Se raccorder n'est pas être relié**, et c'est le piège de ce jeu. Une grille
  où chaque sortie tombe sur une sortie qui la lui rend peut parfaitement être
  coupée en deux : un morceau détaché plus une boucle donne le même compte
  d'arêtes qu'un arbre. Un solveur qui ne vérifie que les raccords compte donc
  des solutions qui n'en sont pas. Celui-ci filtre sur « tout est relié à la
  source », et c'est seulement après ce filtre que l'unicité veut dire quelque
  chose.
- **La solution est unique, et c'est vérifié grille par grille** avant de vous la
  servir : le solveur énumère les configurations valides et s'arrête à la
  deuxième. Mesuré : le générateur en profondeur donne **100 %** de grilles à
  solution unique, contre 93 à 98 % pour un Kruskal aléatoire — d'où le choix du
  premier. Le contrôle reste en place malgré tout, avec quarante essais.
- **Le chrono se règle sur les quarts de tour qu'il faut vraiment jouer**, et non
  sur ceux du brouillage. La différence n'est pas un détail : une tuile droite
  retournée de deux quarts de tour est déjà en place, une croix l'est toujours,
  et compter le brouillage surestimait le travail de 20 % — le temps accordé
  était d'autant trop large. Le coût est compté **dans le seul sens horaire**,
  celui que paie un joueur qui se contente de toucher l'écran ; le clic droit,
  qui tourne dans l'autre sens, est un bonus, pas une obligation.
- **Ce jeu contient la seule valeur de la collection que je n'aie pas pu
  mesurer** : combien de secondes vaut un quart de tour pour une main humaine.
  Elle est posée large — 1,7 s au premier niveau, resserrée jusqu'à 1,0 s — et
  c'est le score, non la survie, qui récompense la vitesse.
- Un temps écoulé coûte une vie et sert une **grille neuve au même niveau** :
  rester bloqué sur une grille qu'on n'arrive pas à lire n'apprend rien.
- À la fin de la partie, la grille **se remet d'elle-même en place** derrière le
  voile, qui est translucide pour cette seule raison.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Pivoter dans le sens des aiguilles | — | toucher la tuile |
| Pivoter dans l'autre sens | — | clic droit sur la tuile |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Tracé · accent rose poudré

Parcourir toute la figure d'un seul geste, sans repasser deux fois sur le même
trait.

- **C'est le problème des ponts de Königsberg**, et Euler l'a réglé en 1736 : un
  tel parcours fermé existe si et seulement si la figure est connexe et que tous
  ses sommets sont de degré pair. La fabrique s'appuie là-dessus au lieu de tirer
  au hasard puis d'espérer : une figure est une **réunion de cycles sans arête
  commune, collés entre eux par des sommets**. Chaque cycle laisse tous les
  degrés pairs, le collage garde la connexité — donc le parcours existe par
  construction. Mesuré sur 4 800 figures hors ligne puis 240 servies par le jeu
  lui-même : 100 % sont eulériennes.
- Un cycle s'obtient comme le **bord d'un groupe de cases** : les arêtes vues une
  seule fois quand on fait le tour du groupe. C'est ce qui donne aux figures leur
  air dessiné plutôt que tiré au sort.
- **La difficulté, c'est le degré 4.** Aux sommets où quatre traits se croisent,
  il faut choisir, et on peut parfaitement s'enfermer dans une figure
  parcourable. La marche au hasard le montre, et sert d'échelle : elle réussit
  **83 % du temps sur une figure de dix arêtes, et 36 % sur une de
  vingt-quatre**. Les paliers suivent cette chute.
- **La méthode, elle, ne se trompe jamais** : ne jamais emprunter le dernier
  trait qui relie deux morceaux de la figure. C'est la règle de Fleury, et sur
  toutes les figures mesurées elle réussit 100 % du temps — le banc d'essai la
  joue contre le vrai gestionnaire de clic, niveau après niveau. Elle est donnée
  dans la ligne d'aide, parce qu'un jeu dont la méthode reste secrète n'est pas
  difficile, il est fermé.
- Se coincer coûte une vie et **redonne la même figure**, contrairement à Réseau
  qui en sert une neuve. La différence est voulue : ici on vient d'apprendre où
  était le piège, et le rejouer est le seul moment où cette connaissance sert.
- C'est la seule machine dessinée en **SVG** : des lignes et des cercles, dont
  l'épaisseur et la couleur se règlent en CSS comme n'importe quel élément.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Poser le crayon, avancer | `Entrée` sur un point | toucher un point, ou glisser |
| Effacer le tracé | `Échap` | bouton « Effacer » |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Contraire · accent violet

Le mot ROUGE écrit en bleu : répondre bleu. C'est l'effet Stroop — lire est
automatique, nommer une couleur ne l'est pas, et les deux se contrarient.

- **La palette n'a pas été choisie à l'œil, et c'est le cœur de cette machine.**
  Un jeu où l'on nomme des couleurs est injouable pour un daltonien si deux
  couleurs se confondent, et faussement : le joueur croira se tromper. Chaque
  candidate est donc passée dans les trois dichromaties courantes par les
  matrices de Viénot-Brettel, convertie en Lab, et toutes les paires sont
  mesurées en ΔE (CIE76).

  | palette | ΔE minimal | où il tombe |
  | --- | --- | --- |
  | rouge · bleu · jaune · blanc | **46,1** | deutéranopie, rouge/jaune |
  | + vert | 30,2 | deutéranopie, rouge/vert |
  | + violet | **1,6** | protanopie, bleu/violet |

- **Le violet est donc exclu de la palette jouable** : sur un écran en vision
  normale il paraît idéal — c'est celui que j'aurais choisi — et il est
  littéralement indiscernable du bleu pour un protanope. Aucune relecture à l'œil
  ne l'aurait trouvé. Il sert au châssis, où il n'est jamais une réponse.
- **On s'arrête à quatre couleurs.** Le vert passerait (ΔE 30 reste une
  différence franche), mais la difficulté de ce jeu vient du temps et du
  changement de consigne, pas d'un cinquième nom qui fragiliserait la palette.
- Le banc d'essai **refait ce calcul sur les couleurs réellement livrées**, lues
  dans le code du jeu : si une teinte change un jour, le test tombe avant le
  joueur.
- **La consigne s'inverse** de temps en temps — tantôt l'encre, tantôt le mot —
  et ce changement coûte plus cher que le conflit lui-même. Il n'arrive jamais
  avant la neuvième épreuve, puis tous les six à dix coups.
- **La pause qui suit un changement de consigne, ou une erreur, ne consomme pas
  le chrono.** Le surcoût du changement est déjà la difficulté ; le facturer une
  deuxième fois en temps serait le compter deux fois.
- **Le plancher de temps est la seule valeur de cette machine qui vienne de la
  littérature et non d'une mesure faite ici** : le temps de réaction sur une
  épreuve incongruente tourne autour de 800 ms chez l'adulte, choix de la réponse
  compris, donc on ne descend pas sous 950 ms. La rampe part de 2,4 s et met une
  quarantaine d'épreuves à y arriver.
- Les pastilles **ne changent jamais de place**. Les mélanger ajouterait un coût
  de recherche qui n'a rien à voir avec le conflit qu'on mesure ; les apprendre
  fait partie du jeu.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Répondre | `1` à `4`, dans l'ordre affiché | toucher une pastille |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Balance · accent terre cuite

Vingt planches au bord d'une table, et le vide. Aller le plus loin possible.

- **Le critère de stabilité est exact, et il ne porte pas que sur le sol.** À
  chaque contact, le centre de masse de tout ce qui se trouve au-dessus doit
  tomber dans la zone de recouvrement des deux planches en contact. Un seul
  contact qui manque fait pivoter toute la partie supérieure — c'est pourquoi
  une tour peut verser en son milieu.
- **Ce critère a un juge indépendant, et c'est lui qui donne son objectif au
  jeu** : le porte-à-faux maximal de n planches au bord d'une table vaut ½·Hₙ,
  la moitié de la somme harmonique. Le banc d'essai le vérifie dans les deux
  sens, sur le code livré : la pile optimale est acceptée à la précision de la
  virgule flottante près pour n de 1 à 20, et refusée dès qu'on la pousse d'un
  millième. Pour vingt planches, ½·H₂₀ = 1,7989 — les **180 centièmes** affichés
  comme cible ne sont pas un chiffre rond choisi par moi.
- **La pile optimale est exactement critique** : sa marge vaut zéro à chaque
  contact. Un test écrit « la tour tient si la marge est positive » la déclare
  donc effondrée, et la cible annoncée devient inatteignable — c'était le cas
  jusqu'à ce que le banc d'essai le montre. On tient debout à la limite.
- **La fenêtre de pose se calcule, elle ne se cherche pas.** Chaque contrainte
  est linéaire en l'abscisse de la nouvelle planche : à son propre contact son
  centre doit tomber sur la planche du dessous, et à chaque contact plus bas le
  centre de masse devient (S + x·l)/(M + l), qui doit rester entre les bords de
  l'appui. L'intersection de ces intervalles est la fenêtre exacte, en un seul
  passage. Confrontée au critère de stabilité sur 7 000 poses tirées au hasard :
  **7 000 accords**.
- **Ce qui fait le jeu tient en une phrase mesurée : la punition est différée.**
  À chaque pose, la fenêtre stable est large — on peut presque toujours pousser
  la planche d'une demi-longueur. Mais pousser tôt verrouille tout ce qui vient
  après. Les trois façons de jouer les vingt planches, mesurées contre le code
  livré :

  | façon de jouer | score | ce qui arrive |
  | --- | --- | --- |
  | pousser au maximum | **50** | la tour verse à la deuxième planche |
  | ne jamais dépasser | **0** | vingt planches posées, aucun porte-à-faux |
  | décalages harmoniques | **180** | l'optimum, atteint exactement |

  Il faut de tout petits décalages en bas et de grands en haut — donc deviner
  combien de planches il reste. Aucune fraction fixe n'approche la borne : entre
  0,50 pour le gourmand et 0,94 pour le très prudent, contre 2,14 à quarante
  planches.
- Le basculement à l'écran est **une image, pas une simulation** : ce qui décide
  est le critère, et l'animation fait pivoter ce qui est au-dessus du contact
  fautif autour du bord de son appui. Le jeu ne contient aucun moteur physique.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Viser | `←` `→` (fin : `Maj`) | glisser sur le plateau |
| Poser | `Espace` | relâcher |
| Recommencer | `R` | bouton « Nouvelle tentative » |
| Couper le son | `M` | bouton « Son » |

### Filature · accent bleu projecteur

Un plan vu de dessus, des veilleurs dont le cône tourne d'un quart de tour par
tour, une sortie. Au tour par tour : rien n'est laissé au réflexe.

- **Un tour, c'est le joueur qui avance d'une case — ou attend — puis les cônes
  qui tournent.** L'ordre compte : il faut donc prévoir où sera la lumière après
  son pas, pas où elle est pendant. La flèche dit où regarde un veilleur, un
  petit rond dans quel sens il tourne ; toute l'information est à l'écran, et
  c'est l'anticipation qui est le travail.
- **L'état complet du plan est (case du joueur, phase mod 4)** — quatre fois le
  nombre de cases, pas plus, puisque tous les veilleurs tournent d'un quart par
  tour. Un parcours en largeur sur cet état dit donc exactement si un plan est
  franchissable et en combien de tours au minimum. Aucun plan impossible n'est
  servi, et ce n'est pas une espérance : c'est une vérification avant service.
- **Le minimum est confirmé par un second solveur**, écrit autrement — file
  d'attente sur des chaînes, ensembles au lieu de tableaux typés, aucun code
  partagé avec celui du jeu. Sur 150 plans servis, les deux s'accordent à chaque
  fois. Le banc vérifie aussi que le chemin rendu est **jouable pas à pas** :
  chaque case voisine de la précédente, libre, et non éclairée à la phase où on
  y arrive.
- **L'échelle vient de la mesure, pas de l'intuition.** La marche au hasard —
  celle qui prend chaque tour un coup sûr tiré au hasard — réussit **23 % du
  temps sur le premier palier et 2 % sur le dernier**. Les paliers suivent cette
  chute : 7×7 avec deux veilleurs, jusqu'à 11×9 avec sept.
- Le budget de tours vaut le minimum doublé plus six : assez pour hésiter, pas
  assez pour attendre que les cônes s'alignent tout seuls.
- **Se faire voir redonne le même plan**, comme dans Tracé et contrairement à
  Réseau. La règle est la même partout dans la collection : on resserre le même
  problème quand on vient d'apprendre quelque chose sur lui (ici le rythme des
  cônes), et on en change quand y rester bloqué n'apprend rien.
- Le marquage du passage minimal, à la fin, se pose **après** le rendu et non
  avant : le rendu réécrit la classe de chaque case, et les marques s'effaçaient
  aussitôt posées. Le banc d'essai l'a trouvé, pas l'œil.
- Les murs sont dessinés en relief franc, pas d'une nuance : un mur bloque le pas
  **et** le regard, il ne doit pas se confondre avec le sol. Les cases
  atteignables sont marquées d'un liseré et non d'un fond clair, pour la même
  raison — un fond clair les rendait confusables avec les murs.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Avancer | flèches | toucher une case voisine |
| Attendre un tour | `Espace` | bouton « Attendre un tour » |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

### Pont · accent orchidée

Hashiwokakero. Le nombre d'une île est le nombre de ponts qui s'y rattachent ;
deux ponts au plus entre deux îles ; aucun croisement ; et tout doit tenir en un
seul réseau.

- **La grille est bâtie à l'envers**, comme Réseau et Tracé : on construit le
  réseau d'abord — donc connexe et sans croisement par construction — et les
  numéros s'en déduisent. Une solution existe toujours.
- **Une remarque évite tout un solveur.** Les règles de propagation employées
  ici — bornes arithmétiques sur chaque île, interdiction de croiser un pont
  posé — sont des conséquences des contraintes du jeu : elles ne retirent que
  des valeurs qu'aucune solution ne porte. Si elles déterminent **toutes** les
  travées, l'assignation obtenue est donc la seule possible ; et comme une
  solution existe, c'est elle. Autrement dit, *résoluble sans deviner* implique
  *solution unique*.
- Cela ne se démontre pas en l'écrivant : **c'est vérifié**. Sur 323 grilles que
  la propagation résout seule, le solveur exhaustif en trouve 323 à solution
  unique, et c'est chaque fois celle construite — aucun contre-exemple. La
  fabrication n'a donc besoin que de la propagation, et une grille coûte **moins
  d'une milliseconde**. (Au passage : 23 grilles avaient une solution unique sans
  être résolubles par déduction. Celles-là demandent de deviner, et sont rejetées.)
- **Le corollaire fait le jeu.** Puisqu'on n'a jamais besoin de deviner, la seule
  ressource peut être une **réserve de fautes** — un pont posé que la solution ne
  porte pas. Mesuré sur 800 grilles : le joueur méthodique, qui ne pose que ce
  que la propagation a déterminé, en dépense **zéro, toujours** ; le joueur qui
  pose au jugé en dépense de **1 sur six îles à 6 sur dix-huit**, jusqu'à 12. La
  réserve part de six et chaque grille résolue en rend deux.
- Croiser un pont posé et dépasser le nombre d'une île sont **refusés, pas
  facturés** : ce ne sont pas des erreurs de raisonnement, ce sont des coups
  impossibles.
- **Le défaut le plus instructif de toute la collection est ici.** Le balayage
  qui cherche les îles voisines en ligne droite n'était pas borné par la largeur
  de la grille : en dépassant le bord droit, l'index `y*w + x` retombait sur la
  rangée suivante et fabriquait des travées **en diagonale** — 828 sur 3 962.
  Ni le solveur du jeu ni le solveur exhaustif de contrôle ne pouvaient le voir :
  **ils partageaient la même liste d'arêtes fausse**, et s'accordaient donc
  parfaitement sur un plateau impossible. C'est une capture d'écran qui l'a
  montré, en une seconde. Deux vérifications indépendantes ne le sont que si
  elles ne partagent pas leurs prémisses — et une image reste le seul juge de ce
  qu'on n'a pas pensé à tester. Le banc vérifie désormais que toute travée est
  droite et ne saute aucune île.

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Poser, doubler, enlever | `Entrée` sur deux îles | toucher deux îles voisines, ou la travée |
| Annuler la sélection | `Échap` | toucher l'île à nouveau |
| Tout enlever | — | bouton « Tout enlever » |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

## Une machine écartée : Mèche

Le projet ne garde pas tout ce qu'il commence. **Mèche** — une grille de charges,
un seul départ, une cascade qui se propage de charge en charge — a été mesurée
puis abandonnée, et la raison vaut d'être écrite.

Une cascade est une **accessibilité dans un graphe fixe** : faire sauter un
groupe de charges n'empêche jamais un autre groupe de sauter plus tard. La
relation est monotone, et il en découle qu'aucun objectif de comptage ne peut
créer de décision. Quatre objectifs ont été essayés, et mesurés :

| Objectif | Ce que fait le joueur glouton |
| --- | --- |
| Emporter le plus de charges possible | atteint l'optimum **100 %** du temps (1 000 plateaux, de 6×6 à 8×7, de une à trois mèches) |
| Vider le plateau en *m* mèches | **200 plateaux sur 200** vidés sans réfléchir |
| Tout emporter sans toucher un baril | gagne **240 fois sur 240** — les barils, posés hors de l'onde du départ voulu, ne gênaient personne |
| Emporter au moins *k* charges sans toucher un baril | piégé **1 à 9 %** du temps seulement, et les plateaux retombent à cinq départs gagnants ou plus |

Le troisième cas est le plus instructif : la fabrique construisait le plateau à
l'envers depuis le départ voulu, donc ce départ emportait forcément **toutes**
les charges — c'était donc forcément lui la plus grosse cascade. Les barils
étaient décoratifs. Et le quatrième montre pourquoi on ne s'en sort pas : pour
que la grosse cascade soit un piège, il faut qu'un baril soit sur son chemin
alors qu'une cascade plus petite atteint encore le seuil, et cette conjonction ne
se produit presque jamais.

Une mécanique spectaculaire à regarder, sans décision dedans. Ce qui la sauverait
est un changement de nature, pas de barème : que les charges aient une **capacité**
et ne sautent qu'au deuxième coup reçu. L'ordre compterait alors vraiment, et la
monotonie tomberait. C'est un autre jeu, à mesurer depuis le début.

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
- **La règle `[hidden] { display: none !important; }`**, posée une fois pour
  toutes. Sans elle, tout `display: flex` ou `grid` d'une feuille de jeu
  l'emporte sur le `display: none` par défaut du navigateur et l'élément reste
  visible. Le piège avait été rustiné douze fois, machine par machine, avant
  d'être corrigé à sa racine.
- **La règle `.over .btn { flex: 0 0 auto; }`**, posée elle aussi une fois pour
  toutes. `.btn--main` porte `flex: 1` pour occuper la rangée du pavé de
  commandes ; l'écran de fin étant une colonne, ce même `flex: 1` y réclamait
  toute la hauteur libre. Le bouton « Rejouer » mesurait **396 px de haut dans
  Chute, 380 dans Rebond, 352 dans Stack** — huit machines touchées. Une
  direction de flex change le sens d'une propriété : ce qui se règle dans une
  rangée se dérègle dans une colonne.
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
