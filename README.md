# Chute

Un jeu web de fusion par gravité. On vise une colonne, on lâche une tuile,
elle tombe. Toute tuile de même valeur qu'elle touche fusionne, la gravité
reprend, et les cascades s'enchaînent.

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

## Règles

- La grille fait **5 colonnes sur 8 rangées**.
- Une tuile posée fusionne avec toutes les tuiles **orthogonalement adjacentes
  de même valeur** : le groupe devient une seule tuile de valeur doublée.
- Après chaque fusion, la gravité tasse les colonnes, ce qui peut déclencher une
  nouvelle fusion. Chaque maillon de la cascade augmente le **combo**, qui
  multiplie les points.
- Points d'une fusion : `valeur obtenue × (taille du groupe − 1) × combo`.
  Fusionner trois tuiles d'un coup rapporte plus que deux.
- La pioche monte avec la partie : le sommet des valeurs tirées suit votre plus
  haute tuile, plafonné à 32.
- La partie s'arrête quand **les cinq colonnes touchent le haut**. Le liseré de
  la bouche passe au rouge dès qu'une colonne est pleine.

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
- `prefers-reduced-motion` réduit toutes les durées à une frame.
