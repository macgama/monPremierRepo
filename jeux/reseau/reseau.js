/* Réseau — des tuyaux en morceaux, chacun pivotant d'un quart de tour ; relier
   la source à toutes les bouches.

   La grille est fabriquée à l'envers, depuis un arbre couvrant obtenu par
   parcours en profondeur aléatoire : toutes les cases sont reliées, il n'y a
   aucune boucle, et le nombre de raccords vaut exactement cases − 1. Puis on
   fait pivoter chaque tuile au hasard.

   Une grille brouillée peut se raccorder de plusieurs façons, et une grille où
   tout se raccorde n'est pas forcément reliée — le compte d'arêtes est le même
   qu'on ait un arbre ou un morceau détaché plus une boucle. La génération vérifie
   donc les deux : elle énumère les configurations dont les sorties se répondent,
   ne garde que celles reliées à la source, et n'accepte la grille que s'il n'en
   reste qu'une. Mesuré sur ce générateur : 100 % des grilles passent du premier
   coup (scratchpad/reseau-mesure2.mjs). */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const N = 1, E = 2, S = 4, O = 8;
  const DIRS = [N, E, S, O];
  const DX = { 1: 0, 2: 1, 4: 0, 8: -1 };
  const DY = { 1: -1, 2: 0, 4: 1, 8: 0 };
  const OPPOSE = { 1: 4, 2: 8, 4: 1, 8: 2 };
  const NOM = { 1: 'n', 2: 'e', 4: 's', 8: 'o' };

  const tourne = (f, k) => {
    let v = f;
    for (let i = 0; i < ((k % 4) + 4) % 4; i++) v = ((v << 1) | (v >> 3)) & 15;
    return v;
  };
  const degre = (f) => (f & 1) + ((f >> 1) & 1) + ((f >> 2) & 1) + ((f >> 3) & 1);

  /* ---------- l'échelle ---------- */

  const FORMES = [[3, 3], [4, 3], [4, 4], [5, 4], [5, 5], [6, 5], [6, 6]];
  const formeDe = (n) => FORMES[Math.min(FORMES.length - 1, Math.floor((n - 1) / 2))];
  /* Le seul nombre de ce jeu qui ne sorte pas d'une mesure : combien de secondes
     vaut un quart de tour pour une main humaine. On part large — 1,7 s au premier
     niveau — et on resserre jusqu'à 1,15 s. */
  const facteur = (n) => Math.max(1.0, 1.7 - n * 0.03);
  const tempsDe = (n, cases, coups) => 8 + cases * 0.3 + coups * facteur(n);

  /* ---------- fabrique ---------- */

  function arbre(w, h) {
    const formes = new Array(w * h).fill(0);
    const vus = new Array(w * h).fill(false);
    const depart = Math.floor(Math.random() * w * h);
    const pile = [depart];
    vus[depart] = true;
    while (pile.length) {
      const c = pile[pile.length - 1];
      const x = c % w, y = (c / w) | 0;
      const libres = DIRS.filter((d) => {
        const nx = x + DX[d], ny = y + DY[d];
        return nx >= 0 && nx < w && ny >= 0 && ny < h && !vus[ny * w + nx];
      });
      if (!libres.length) { pile.pop(); continue; }
      const d = libres[Math.floor(Math.random() * libres.length)];
      const n = (y + DY[d]) * w + (x + DX[d]);
      formes[c] |= d;
      formes[n] |= OPPOSE[d];
      vus[n] = true;
      pile.push(n);
    }
    return formes;
  }

  /* Cases reliées à la source, en ne suivant que les sorties qui se répondent. */
  function reliees(w, h, formes, source) {
    const vu = new Array(w * h).fill(false);
    const pile = [source];
    vu[source] = true;
    while (pile.length) {
      const c = pile.pop();
      const x = c % w, y = (c / w) | 0;
      for (const d of DIRS) {
        if (!(formes[c] & d)) continue;
        const nx = x + DX[d], ny = y + DY[d];
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const n = ny * w + nx;
        if (vu[n] || !(formes[n] & OPPOSE[d])) continue;
        vu[n] = true;
        pile.push(n);
      }
    }
    return vu;
  }

  /* Énumère les configurations valides, case par case en ligne, en ne vérifiant
     que les voisins déjà posés. On s'arrête à deux : l'unicité suffit. */
  function combienDeSolutions(w, h, bases, source, max = 2) {
    const n = w * h;
    const choix = bases.map((f) => {
      const vues = [];
      for (let k = 0; k < 4; k++) { const v = tourne(f, k); if (!vues.includes(v)) vues.push(v); }
      return vues;
    });
    const pose = new Array(n).fill(0);
    let compte = 0;
    (function aller(i) {
      if (compte >= max) return;
      if (i === n) {
        if (reliees(w, h, pose, source).every(Boolean)) compte++;
        return;
      }
      const x = i % w, y = (i / w) | 0;
      for (const f of choix[i]) {
        if (y === 0 && (f & N)) continue;
        if (x === 0 && (f & O)) continue;
        if (x === w - 1 && (f & E)) continue;
        if (y === h - 1 && (f & S)) continue;
        if (x > 0 && Boolean(f & O) !== Boolean(pose[i - 1] & E)) continue;
        if (y > 0 && Boolean(f & N) !== Boolean(pose[i - w] & S)) continue;
        pose[i] = f;
        aller(i + 1);
        if (compte >= max) return;
      }
      pose[i] = 0;
    })(0);
    return compte;
  }

  /* Quarts de tour à jouer, dans le seul sens horaire, pour amener une tuile de
     sa forme brouillée à sa forme cible. La symétrie de la tuile compte. */
  function horaire(base, cible) {
    for (let k = 0; k < 4; k++) if (tourne(base, k) === cible) return k;
    return 0;
  }

  /* Une grille jouable : arbre, brouillage, et vérification d'unicité. */
  function fabriquer(w, h) {
    for (let essai = 0; essai < 40; essai++) {
      const cible = arbre(w, h);
      const tours = cible.map(() => Math.floor(Math.random() * 4));
      const bases = cible.map((f, i) => tourne(f, -tours[i]));
      /* Coût réel en ne tournant que dans un sens : c'est ce que paie un joueur
         qui se contente de toucher l'écran, et c'est donc lui qui règle le
         chrono. Ce n'est pas la somme des quarts de tour du brouillage : une
         tuile droite retournée de deux quarts de tour est déjà en place, et une
         croix l'est toujours. Compter le brouillage gonflait le temps donné. */
      const coups = bases.reduce((a, b, i) => a + horaire(b, cible[i]), 0);
      if (coups === 0) continue;
      const source = sourceDe(w, h, cible);
      if (combienDeSolutions(w, h, bases, source) !== 1) continue;
      return { w, h, bases, tours, cible, coups, source };
    }
    return null;
  }

  /* La source au centre, sur la case la mieux raccordée du voisinage. */
  function sourceDe(w, h, cible) {
    const cx = (w - 1) / 2, cy = (h - 1) / 2;
    let best = 0, score = -1;
    for (let i = 0; i < w * h; i++) {
      const d = Math.abs((i % w) - cx) + Math.abs(((i / w) | 0) - cy);
      const s = degre(cible[i]) * 2 - d;
      if (s > score) { score = s; best = i; }
    }
    return best;
  }

  /* ---------- la partie ---------- */

  const jeu = {
    niveau: 1, grille: null, tours: [], vies: 3, score: 0,
    reste: 0, total: 0, fini: false, gele: true, coups: 0,
  };
  let record = Arcade.record('reseau');
  const tuiles = [];
  let horloge = null;

  const forme = (i) => tourne(jeu.grille.bases[i], jeu.tours[i]);

  function poser(n) {
    const [w, h] = formeDe(n);
    const g = fabriquer(w, h);
    if (!g) return;                      // ne peut pas arriver : 100 % de réussite mesurée
    jeu.niveau = n;
    jeu.grille = g;
    jeu.tours = g.bases.map(() => 0);
    jeu.coups = 0;
    jeu.total = tempsDe(n, w * h, g.coups);
    jeu.reste = jeu.total;
    batir();
    rendre();
  }

  function batir() {
    const { w, h, bases, source } = jeu.grille;
    const plateau = $('plateau');
    plateau.innerHTML = '';
    plateau.style.setProperty('--cols', w);
    plateau.style.setProperty('--rows', h);
    tuiles.length = 0;
    for (let i = 0; i < w * h; i++) {
      const b = document.createElement('button');
      b.className = 'tuile' + (degre(bases[i]) === 1 ? ' bouche' : '') + (i === source ? ' source' : '');
      b.type = 'button';
      const tuyau = document.createElement('span');
      tuyau.className = 'tuyau';
      for (const d of DIRS) {
        if (!(bases[i] & d)) continue;
        const bras = document.createElement('i');
        bras.className = 'bras ' + NOM[d];
        tuyau.appendChild(bras);
      }
      const moyeu = document.createElement('i');
      moyeu.className = 'moyeu';
      tuyau.appendChild(moyeu);
      b.appendChild(tuyau);
      b.addEventListener('click', () => pivoter(i, 1));
      b.addEventListener('contextmenu', (e) => { e.preventDefault(); pivoter(i, -1); });
      plateau.appendChild(b);
      tuiles.push({ noeud: b, tuyau });
    }
  }

  function pivoter(i, sens) {
    if (jeu.gele || jeu.fini) return;
    Arcade.boot();
    jeu.tours[i] += sens;
    jeu.coups++;
    tuiles[i].tuyau.style.transform = 'rotate(' + (jeu.tours[i] * 90) + 'deg)';
    const vu = rendre();
    const part = vu / (jeu.grille.w * jeu.grille.h);
    Arcade.tone({ freq: 260 + part * 460, dur: 0.05, type: 'sine', vol: 0.08 });
    if (vu === jeu.grille.w * jeu.grille.h) gagner();
  }

  function gagner() {
    jeu.gele = true;
    clearInterval(horloge);
    const points = Math.round(jeu.grille.w * jeu.grille.h * 4 + Math.max(0, jeu.reste) * 3);
    jeu.score += points;
    for (const t of tuiles) t.noeud.classList.add('boucle');
    Arcade.sfx.chain(Math.min(10, jeu.niveau));
    annoncer('Relié en ' + jeu.coups + ' quarts de tour. +' + points + ' points');
    rendre();
    setTimeout(() => {
      if (jeu.fini) return;
      jeu.gele = false;
      poser(jeu.niveau + 1);
      lancerHorloge();
    }, Arcade.ms(760));
  }

  function tempsEcoule() {
    jeu.vies--;
    clearInterval(horloge);
    Arcade.sfx.deny();
    Arcade.shake($('stage'), 4);
    if (jeu.vies <= 0) return perdre();
    jeu.gele = true;
    annoncer('Temps écoulé. Une nouvelle grille, même niveau.');
    rendre();
    setTimeout(() => {
      if (jeu.fini) return;
      jeu.gele = false;
      poser(jeu.niveau);
      lancerHorloge();
    }, Arcade.ms(900));
  }

  function perdre() {
    jeu.fini = true;
    jeu.gele = true;
    clearInterval(horloge);
    if (jeu.score > record) { record = jeu.score; Arcade.setRecord('reseau', record); }
    montrerSolution();
    $('overScore').textContent = String(jeu.score);
    $('overNote').innerHTML = 'points · niveau ' + jeu.niveau +
      '<br>La grille résolue est derrière, en filigrane.';
    $('over').hidden = false;
    Arcade.sfx.over();
    rendre();
  }

  /* À la fin, la grille se remet d'elle-même : on voit ce qu'il fallait faire. */
  function montrerSolution() {
    for (let i = 0; i < tuiles.length; i++) {
      const cible = jeu.grille.cible[i];
      let k = jeu.tours[i];
      while (tourne(jeu.grille.bases[i], k) !== cible) k++;
      jeu.tours[i] = k;
      tuiles[i].tuyau.style.transform = 'rotate(' + (k * 90) + 'deg)';
    }
  }

  /* ---------- affichage ---------- */

  function rendre() {
    const { w, h, source } = jeu.grille;
    const formes = jeu.tours.map((_, i) => forme(i));
    const vu = reliees(w, h, formes, source);
    let compte = 0;
    for (let i = 0; i < tuiles.length; i++) {
      tuiles[i].noeud.classList.toggle('relie', vu[i]);
      if (vu[i]) compte++;
    }
    $('score').textContent = String(jeu.score);
    $('best').textContent = String(record);
    const pips = $('vies');
    pips.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const p = document.createElement('i');
      if (i >= jeu.vies) p.className = 'perdue';
      pips.appendChild(p);
    }
    $('meterLab').textContent = 'Niveau ' + jeu.niveau + ' · ' + w + '×' + h +
      ' · ' + compte + '/' + (w * h);
    $('chrono').textContent = Math.max(0, jeu.reste).toFixed(1).replace('.', ',') + ' s';
    const part = jeu.total ? Math.max(0, jeu.reste) / jeu.total : 0;
    $('jauge').style.width = (part * 100).toFixed(1) + '%';
    $('meter').classList.toggle('hot', part < 0.25);
    return compte;
  }

  let effacer = null;
  function annoncer(texte) {
    const n = $('annonce');
    n.textContent = texte;
    n.hidden = false;
    clearTimeout(effacer);
    effacer = setTimeout(() => { n.hidden = true; }, 2400);
  }

  /* ---------- horloge ---------- */

  function lancerHorloge() {
    clearInterval(horloge);
    let dernier = performance.now();
    horloge = setInterval(() => {
      const t = performance.now();
      const dt = (t - dernier) / 1000;
      dernier = t;
      if (jeu.gele || jeu.fini) return;
      jeu.reste -= dt;
      if (jeu.reste <= 0) { jeu.reste = 0; rendre(); tempsEcoule(); return; }
      rendre();
    }, 100);
  }

  /* ---------- commandes ---------- */

  function commencer() {
    clearInterval(horloge);
    clearTimeout(effacer);
    jeu.vies = 3;
    jeu.score = 0;
    jeu.fini = false;
    jeu.gele = false;
    $('over').hidden = true;
    $('pret').hidden = true;
    $('annonce').hidden = true;
    poser(1);
    lancerHorloge();
  }

  $('pret').addEventListener('click', () => { Arcade.boot(); commencer(); });
  $('rejouer').addEventListener('click', commencer);
  $('restart').addEventListener('click', commencer);
  Arcade.bindMute($('mute'));
  addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') commencer();
    if (e.key === 'm' || e.key === 'M') $('mute').click();
  });

  poser(1);
  jeu.gele = true;

  /* Banc d'essai : la vérification joue contre ce code-ci, pas contre une copie. */
  window.Reseau = { jeu, tourne, degre, horaire, reliees, combienDeSolutions, fabriquer,
    formeDe, tempsDe, pivoter, forme, tuiles };
})();
