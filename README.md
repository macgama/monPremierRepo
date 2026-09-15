# Chute

Un jeu web de fusion par gravité. On vise une colonne, on lâche une tuile,
elle tombe. Toute tuile de même valeur qu'elle touche fusionne, la gravité
reprend, et les cascades s'enchaînent. Tous les quelques coups, une rangée
pousse par le bas : c'est l'horloge de la partie.

## Jouer

Ouvrez `index.html` dans un navigateur. Aucune dépendance, aucune étape de
build : trois fichiers statiques.

```
index.html      la page
css/chute.css   l'habillage
js/chute.js     le moteur de jeu
```

## Commandes

| Action | Clavier | Tactile / souris |
| --- | --- | --- |
| Viser | `←` `→`, `A` / `D` | glisser sur la grille |
| Lâcher | `Espace`, `↓`, `Entrée` | relâcher sur la colonne |
| Recommencer | `R` | bouton « Nouvelle partie » |
| Couper le son | `M` | bouton « Son » |

## Règles

- La grille fait **5 colonnes sur 7 rangées**.
- Une tuile posée fusionne avec toutes les tuiles **orthogonalement adjacentes
  de même valeur** : le groupe devient une seule tuile de valeur doublée.
- Après chaque fusion, la gravité tasse les colonnes, ce qui peut déclencher une
  nouvelle fusion. Chaque maillon de la cascade augmente le **combo**, qui
  multiplie les points.
- Points d'une fusion : `valeur obtenue × (taille du groupe − 1) × combo`.
  Fusionner trois tuiles d'un coup rapporte plus que deux.
- **La montée** : tous les `max(8, 14 − palier)` coups, une rangée entière
  pousse par le bas et tout remonte d'un cran. La jauge sous le tableau de bord
  annonce le compte à rebours et vire à l'orange deux coups avant.
- La pioche est une **fenêtre glissante** : le plafond suit votre plus haute
  tuile (jusqu'à 64) et le plancher finit par retirer les petites valeurs, qui
  sinon encombreraient le plateau jusqu'à la fin.
- La partie s'arrête quand **les cinq colonnes touchent le haut**, ou quand une
  montée écrase une colonne déjà au plafond. Le liseré de la bouche passe au
  rouge dès qu'une colonne est pleine.

Le record est conservé dans le `localStorage` du navigateur.

## Notes d'implémentation

- Les tuiles sont des `div` positionnés en `transform: translate()` dans une
  couche unique ; les déplacements sont des transitions CSS dont la durée est
  calculée selon la distance de chute.
- Les fusions sont trouvées par un remplissage par diffusion sur les valeurs
  identiques, ce qui gère les groupes de trois tuiles et plus.
- La géométrie (`--cell`, `--grid-w`, `--pad-top`) est recalculée en JavaScript
  au chargement et au redimensionnement ; le reste de la mise en page découle de
  ces variables CSS.
- Les sons sont **synthétisés à la volée** avec l'API Web Audio : aucun fichier
  à charger. Chaque maillon d'une cascade monte d'un degré sur une échelle
  majeure, ce qui rend les chaînes longues audibles avant d'être lisibles. Le
  contexte audio n'est créé qu'à la première interaction, comme l'exigent les
  navigateurs.
- Les effets de fusion (onde de choc, étincelles, halo blanc, secousse) sont des
  éléments jetables ajoutés à la couche des tuiles puis retirés par minuterie.
- `prefers-reduced-motion` réduit toutes les durées à une frame et supprime
  étincelles, ondes et secousses.
