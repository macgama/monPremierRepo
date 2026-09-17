/* Bascule — toucher une case retourne cette case et ses quatre voisines.

   Le jeu est un système linéaire sur GF(2), le corps à deux éléments où 1+1 = 0.
   Chaque coup est un vecteur ; jouer deux fois la même case ne change rien ;
   l'ordre des coups est sans importance. Trois conséquences, et ce sont elles
   qui font le jeu :

     1. une grille fabriquée en jouant des coups sur une grille éteinte est
        soluble par construction ;
     2. le nombre minimal de coups se calcule — on résout Ax = b, puis on parcourt
        le noyau de A et on garde la solution la plus légère. C'est le par ;
     3. sur les formes dont le noyau est nul (3×3, 4×3, 5×4, 6×5, 6×6), la
        solution est unique : le par vaut exactement le nombre de cases mêlées.
        Toute l'échelle de difficulté tient sur ces formes-là, parce qu'on y
        choisit le par au lieu de le subir. La 4×4 et la 5×5 en sont exclues :
        leur noyau les fait plafonner à 7 et 15 coups.

   L'économie a été simulée avant d'écrire une ligne d'interface
   (scratchpad/bascule-econo*.mjs) : le chasseur méthodique tient une quarantaine
   de grilles, le joueur brouillon une douzaine. */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  /* ---------- l'échelle ---------- */

  const FORMES = [[3, 3], [4, 3], [5, 4], [6, 5], [6, 6]];
  /* Prime rendue à chaque grille éteinte, par forme : le surcoût mesuré du
     chasseur naïf (2,1 · 3,3 · 5,4 · 9,2 · 11,5 coups) plus quatre de marge. */
  const PRIME = [7, 8, 10, 14, 16];
  const DEPART = 40;
  const PAR_MAX = 16;

  const formeDe = (n) => FORMES[Math.min(FORMES.length - 1, Math.floor((n - 1) / 3))];
  const primeDe = (n) => PRIME[Math.min(PRIME.length - 1, Math.floor((n - 1) / 3))];
  const parDe = (n, w, h) => Math.min(PAR_MAX, w * h - 1, 3 + Math.round((n - 1) * 0.8));

  /* ---------- l'algèbre ---------- */

  const cache = new Map();

  /* A[i] : masque des cases retournées par un appui sur la case i. */
  function matrice(w, h) {
    const cle = w + 'x' + h;
    if (cache.has(cle)) return cache.get(cle);
    const A = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let m = 0n;
        const met = (xx, yy) => {
          if (xx >= 0 && xx < w && yy >= 0 && yy < h) m |= 1n << BigInt(yy * w + xx);
        };
        met(x, y); met(x - 1, y); met(x + 1, y); met(x, y - 1); met(x, y + 1);
        A.push(m);
      }
    }
    cache.set(cle, A);
    return A;
  }

  const bit = (v, i) => (v >> BigInt(i)) & 1n;
  const poids = (v) => { let c = 0; while (v) { c += Number(v & 1n); v >>= 1n; } return c; };

  /* Élimination de Gauss sur GF(2). Une ligne est un entier : les bits 0..N−1
     portent les inconnues, le bit N le second membre. */
  function resoudre(w, h, b) {
    const N = w * h, A = matrice(w, h), lignes = [];
    for (let i = 0; i < N; i++) {
      let L = 0n;
      for (let j = 0; j < N; j++) if (bit(A[j], i)) L |= 1n << BigInt(j);
      if (bit(b, i)) L |= 1n << BigInt(N);
      lignes.push(L);
    }
    const pivotDe = new Array(N).fill(-1);
    let r = 0;
    for (let c = 0; c < N && r < N; c++) {
      let p = -1;
      for (let i = r; i < N; i++) if (bit(lignes[i], c)) { p = i; break; }
      if (p < 0) continue;
      const t = lignes[r]; lignes[r] = lignes[p]; lignes[p] = t;
      for (let i = 0; i < N; i++) if (i !== r && bit(lignes[i], c)) lignes[i] ^= lignes[r];
      pivotDe[c] = r; r++;
    }
    for (let i = r; i < N; i++) if (lignes[i] === (1n << BigInt(N))) return null;   // 0 = 1
    let x0 = 0n;
    for (let c = 0; c < N; c++) {
      const li = pivotDe[c];
      if (li >= 0 && bit(lignes[li], N)) x0 |= 1n << BigInt(c);
    }
    const noyau = [];
    for (let f = 0; f < N; f++) {
      if (pivotDe[f] >= 0) continue;
      let v = 1n << BigInt(f);
      for (let c = 0; c < N; c++) {
        const li = pivotDe[c];
        if (li >= 0 && bit(lignes[li], f)) v |= 1n << BigInt(c);
      }
      noyau.push(v);
    }
    return { x0, noyau };
  }

  /* Le par : la plus légère des solutions de x0 + noyau. */
  function par(w, h, b) {
    const s = resoudre(w, h, b);
    if (!s) return null;
    let best = s.x0, bp = poids(s.x0);
    for (let m = 1; m < (1 << s.noyau.length); m++) {
      let v = s.x0;
      for (let i = 0; i < s.noyau.length; i++) if (m & (1 << i)) v ^= s.noyau[i];
      const p = poids(v);
      if (p < bp) { bp = p; best = v; }
    }
    return { coups: bp, solution: best };
  }

  /* Grille de départ : des coups joués sur une grille éteinte. Sur une forme à
     noyau nul, la solution étant unique, le par vaut le nombre de cases mêlées. */
  function melanger(w, h, k) {
    const A = matrice(w, h);
    const vus = new Set();
    let b = 0n;
    while (vus.size < k) {
      const i = Math.floor(Math.random() * w * h);
      if (vus.has(i)) continue;
      vus.add(i);
      b ^= A[i];
    }
    return b;
  }

  /* ---------- la partie ---------- */

  const jeu = {
    niveau: 1, w: 3, h: 3, etat: 0n, depart: 0n,
    coups: 0, par: 0, prime: 0, reserve: DEPART, score: 0,
    fini: false, gele: true,
  };
  let record = Arcade.record('bascule');

  const cases = [];

  function poser(n) {
    const [w, h] = formeDe(n);
    jeu.niveau = n; jeu.w = w; jeu.h = h;
    jeu.par = parDe(n, w, h);
    jeu.prime = primeDe(n);
    jeu.etat = melanger(w, h, jeu.par);
    jeu.depart = jeu.etat;
    jeu.coups = 0;
    batirPlateau();
    rendre();
  }

  function batirPlateau() {
    const plateau = $('plateau');
    plateau.innerHTML = '';
    plateau.style.setProperty('--cols', jeu.w);
    plateau.style.setProperty('--rows', jeu.h);
    cases.length = 0;
    for (let i = 0; i < jeu.w * jeu.h; i++) {
      const b = document.createElement('button');
      b.className = 'case';
      b.type = 'button';
      b.dataset.i = String(i);
      b.setAttribute('aria-label', 'case ' + ((i % jeu.w) + 1) + ', rangée ' + (Math.floor(i / jeu.w) + 1));
      b.addEventListener('click', () => toucher(i));
      plateau.appendChild(b);
      cases.push(b);
    }
  }

  function toucher(i) {
    if (jeu.gele || jeu.fini) return;
    Arcade.boot();
    jeu.etat ^= matrice(jeu.w, jeu.h)[i];
    jeu.coups++;
    jeu.reserve--;
    Arcade.replay(cases[i], 'appui');

    /* La hauteur du son suit ce qui reste allumé : la grille s'entend se vider. */
    const reste = poids(jeu.etat);
    const total = jeu.w * jeu.h;
    Arcade.tone({
      freq: 300 + (1 - reste / total) * 520,
      dur: 0.06, type: 'sine', vol: 0.09,
    });

    if (jeu.etat === 0n) return gagner();
    if (jeu.reserve <= 0) return perdre();
    rendre();
  }

  function gagner() {
    jeu.gele = true;
    jeu.reserve += jeu.par + jeu.prime;
    const auPar = jeu.coups === jeu.par;
    jeu.score += jeu.par * 10 + (auPar ? 50 : 0);
    rendre();
    for (const c of cases) c.classList.add('eteinte');
    Arcade.sfx.chain(Math.min(10, jeu.niveau));
    annoncer(auPar
      ? 'Au par, en ' + jeu.coups + ' coups. +' + (jeu.par * 10 + 50) + ' points'
      : 'Éteinte en ' + jeu.coups + ' coups. +' + (jeu.par + jeu.prime) + ' coups de réserve');
    setTimeout(() => {
      if (jeu.fini) return;
      jeu.gele = false;
      poser(jeu.niveau + 1);
    }, Arcade.ms(820));
  }

  function perdre() {
    jeu.fini = true;
    jeu.gele = true;
    $('annonce').hidden = true;
    clearTimeout(effacer);
    rendre();
    /* La solution depuis l'état où le joueur s'est arrêté — c'est comme ça qu'on
       apprend la méthode, pas en revoyant la grille de départ. Elle se dessine
       en miniature dans l'écran de fin : le voile recouvre le plateau, marquer
       les vraies cases reviendrait à montrer la réponse derrière un rideau. */
    const s = par(jeu.w, jeu.h, jeu.etat);
    if (jeu.score > record) { record = jeu.score; Arcade.setRecord('bascule', record); }
    $('overScore').textContent = String(jeu.score);
    $('overNote').innerHTML = 'points · niveau ' + jeu.niveau +
      (s ? '<br>Il restait <b>' + s.coups + '</b> coup' + (s.coups > 1 ? 's' : '') + ' à jouer :' : '');
    miniature(s);
    $('over').hidden = false;
    Arcade.sfx.over();
    Arcade.shake($('stage'), 4);
  }

  /* La grille de fin, en petit : ce qui restait allumé, et les cases à jouer. */
  function miniature(s) {
    const n = $('overGrille');
    n.innerHTML = '';
    n.hidden = !s;
    if (!s) return;
    n.style.setProperty('--cols', jeu.w);
    for (let i = 0; i < jeu.w * jeu.h; i++) {
      const c = document.createElement('i');
      if (bit(jeu.etat, i)) c.className = 'on';
      if (bit(s.solution, i)) c.className += ' coup';
      n.appendChild(c);
    }
  }

  /* ---------- affichage ---------- */

  function rendre() {
    for (let i = 0; i < cases.length; i++) {
      cases[i].classList.toggle('on', bit(jeu.etat, i) === 1n);
      cases[i].classList.remove('eteinte');
    }
    $('score').textContent = String(jeu.score);
    $('reserve').textContent = String(Math.max(0, jeu.reserve));
    $('best').textContent = String(record);
    $('meterLab').textContent = 'Niveau ' + jeu.niveau + ' · par ' + jeu.par;
    $('coups').textContent = jeu.coups + ' coup' + (jeu.coups > 1 ? 's' : '');
    const part = jeu.par ? Math.min(1, jeu.coups / jeu.par) : 0;
    $('jauge').style.width = (part * 100).toFixed(1) + '%';
    $('meter').classList.toggle('hot', jeu.coups > jeu.par);
    $('reserveStat').classList.toggle('maigre', jeu.reserve <= jeu.par);
  }

  let effacer = null;
  function annoncer(texte) {
    const n = $('annonce');
    n.textContent = texte;
    n.hidden = false;
    clearTimeout(effacer);
    effacer = setTimeout(() => { n.hidden = true; }, 2600);
  }

  /* ---------- commandes ---------- */

  function commencer() {
    jeu.reserve = DEPART;
    jeu.score = 0;
    jeu.fini = false;
    jeu.gele = false;
    $('over').hidden = true;
    $('pret').hidden = true;
    $('annonce').hidden = true;
    poser(1);
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
  window.Bascule = { jeu, matrice, resoudre, par, melanger, poids, poser, toucher,
    formeDe, parDe, primeDe, DEPART };
})();
