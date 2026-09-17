/* Filature — un plan vu de dessus, des veilleurs dont le cône tourne d'un quart
   de tour par tour, une sortie.

   Le jeu est au tour par tour : rien n'est laissé au réflexe, tout est lecture.
   Un tour, c'est le joueur qui avance d'une case (ou attend), puis les cônes qui
   tournent. Si le joueur se trouve alors dans un cône, il est vu.

   Comme tous les veilleurs tournent d'un quart par tour, l'état complet du plan
   est (case du joueur, phase mod 4) — quatre fois le nombre de cases, pas plus.
   Un parcours en largeur sur cet état dit donc exactement si un niveau est
   résoluble et en combien de tours au minimum, et c'est ce qui garantit qu'aucun
   plan impossible n'est servi. Le minimum sert aussi de par : il est affiché.

   L'échelle vient de la mesure (scratchpad/filature-mesure.mjs). La marche au
   hasard — celle qui prend chaque tour un coup sûr pris au hasard — réussit
   23 % du temps sur le premier palier et 2 % sur le dernier ; c'est cette chute
   qui règle la difficulté, pas mon intuition. */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];      // N E S O
  const FLECHE = ['▲', '▶', '▼', '◀'];
  const PHASES = 4;

  /* ---------- l'échelle ---------- */

  const PALIERS = [
    { jusqu: 2,        w: 7,  h: 7, murs: 0.12, veilleurs: 2, portee: 3 },
    { jusqu: 5,        w: 9,  h: 7, murs: 0.18, veilleurs: 3, portee: 4 },
    { jusqu: 9,        w: 9,  h: 9, murs: 0.22, veilleurs: 5, portee: 4 },
    { jusqu: 14,       w: 11, h: 9, murs: 0.22, veilleurs: 5, portee: 4 },
    { jusqu: Infinity, w: 11, h: 9, murs: 0.22, veilleurs: 7, portee: 5 },
  ];
  const palierDe = (n) => PALIERS.find((p) => n <= p.jusqu);
  /* Budget de tours : le minimum, doublé, plus six. Assez pour hésiter, pas
     assez pour attendre indéfiniment que les cônes s'alignent tout seuls. */
  const budgetDe = (tours) => tours * 2 + 6;

  /* ---------- le plan ---------- */

  function eclairage(plan, veilleurs, p) {
    const { w, h, murs } = plan;
    const vu = new Uint8Array(w * h);
    for (const v of veilleurs) {
      const d = (((v.dir + v.sens * p) % PHASES) + PHASES) % PHASES;
      const [dx, dy] = DIRS[d];
      let x = v.c % w, y = (v.c / w) | 0;
      for (let k = 1; k <= v.portee; k++) {
        x += dx; y += dy;
        if (x < 0 || x >= w || y < 0 || y >= h) break;
        const n = y * w + x;
        if (murs[n]) break;
        vu[n] = 1;
      }
    }
    return vu;
  }

  const tousLesEclairages = (plan, veilleurs) =>
    Array.from({ length: PHASES }, (_, p) => eclairage(plan, veilleurs, p));

  const libre = (plan, veilleurs, c) => !plan.murs[c] && !veilleurs.some((v) => v.c === c);

  /* Parcours en largeur sur (case, phase) : le minimum de tours, et le chemin. */
  function resoudre(plan, veilleurs) {
    const { w, h, depart, sortie } = plan;
    const lum = tousLesEclairages(plan, veilleurs);
    if (lum[0][depart]) return null;
    const N = w * h * PHASES;
    const vus = new Int32Array(N).fill(-1);
    const pere = new Int32Array(N).fill(-1);
    const dep = depart * PHASES;
    const file = [dep];
    vus[dep] = 0;
    for (let tete = 0; tete < file.length; tete++) {
      const etat = file[tete];
      const c = (etat / PHASES) | 0, p = etat % PHASES;
      if (c === sortie) {
        const chemin = [];
        let e = etat;
        while (e !== -1) { chemin.push((e / PHASES) | 0); e = pere[e]; }
        return { tours: vus[etat], chemin: chemin.reverse() };
      }
      const x = c % w, y = (c / w) | 0;
      const suivante = (p + 1) % PHASES;
      const candidats = [c];
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) candidats.push(ny * w + nx);
      }
      for (const n of candidats) {
        if (!libre(plan, veilleurs, n)) continue;
        if (lum[suivante][n]) continue;
        const k = n * PHASES + suivante;
        if (vus[k] !== -1) continue;
        vus[k] = vus[etat] + 1;
        pere[k] = etat;
        file.push(k);
      }
    }
    return null;
  }

  /* ---------- la fabrique ---------- */

  function planBrut(w, h, densite) {
    const murs = new Uint8Array(w * h);
    let poses = 0;
    const cible = Math.round(w * h * densite);
    let garde = 0;
    while (poses < cible && garde++ < 300) {
      const lw = 1 + Math.floor(Math.random() * 2), lh = 1 + Math.floor(Math.random() * 2);
      const x = Math.floor(Math.random() * (w - lw)), y = Math.floor(Math.random() * (h - lh));
      for (let a = 0; a < lw; a++) for (let b = 0; b < lh; b++) {
        const n = (y + b) * w + (x + a);
        if (!murs[n]) { murs[n] = 1; poses++; }
      }
    }
    /* On ne garde que la plus grande zone libre connexe : un recoin séparé du
       reste ne servirait qu'à cacher une sortie inatteignable. */
    const zone = new Int32Array(w * h).fill(-1);
    let meilleure = [], id = 0;
    for (let i = 0; i < w * h; i++) {
      if (murs[i] || zone[i] !== -1) continue;
      const pile = [i];
      zone[i] = id;
      for (let t = 0; t < pile.length; t++) {
        const c = pile[t], x = c % w, y = (c / w) | 0;
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const n = ny * w + nx;
          if (murs[n] || zone[n] !== -1) continue;
          zone[n] = id; pile.push(n);
        }
      }
      if (pile.length > meilleure.length) meilleure = pile;
      id++;
    }
    const dedans = new Set(meilleure);
    for (let i = 0; i < w * h; i++) if (!murs[i] && !dedans.has(i)) murs[i] = 1;
    return { w, h, murs, zone: meilleure };
  }

  function fabriquer(n) {
    const p = palierDe(n);
    for (let essai = 0; essai < 300; essai++) {
      const brut = planBrut(p.w, p.h, p.murs);
      if (brut.zone.length < p.veilleurs + 10) continue;
      const libres = brut.zone.slice();
      for (let i = libres.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [libres[i], libres[j]] = [libres[j], libres[i]];
      }
      /* Départ et sortie le plus loin possible l'un de l'autre, parmi un
         échantillon : la traversée doit valoir le détour. */
      let depart = libres[0], sortie = libres[1], best = -1;
      for (const a of libres.slice(0, 16)) for (const b of libres.slice(0, 16)) {
        const d = Math.abs((a % p.w) - (b % p.w)) + Math.abs(((a / p.w) | 0) - ((b / p.w) | 0));
        if (d > best) { best = d; depart = a; sortie = b; }
      }
      const pris = new Set([depart, sortie]);
      const veilleurs = [];
      for (const c of libres) {
        if (veilleurs.length >= p.veilleurs) break;
        if (pris.has(c)) continue;
        pris.add(c);
        veilleurs.push({ c, dir: Math.floor(Math.random() * PHASES),
          sens: Math.random() < 0.5 ? 1 : -1, portee: p.portee });
      }
      if (veilleurs.length < p.veilleurs) continue;
      const plan = { w: p.w, h: p.h, murs: brut.murs, depart, sortie };
      const r = resoudre(plan, veilleurs);
      if (!r || r.tours < 6) continue;
      return { plan, veilleurs, minimum: r.tours, lum: tousLesEclairages(plan, veilleurs) };
    }
    return null;
  }

  /* ---------- la partie ---------- */

  const jeu = { niveau: 1, n: null, ou: -1, phase: 0, tours: 0, budget: 0,
    vies: 3, score: 0, fini: false, gele: true };
  let record = Arcade.record('filature');
  const cases = [];

  function poser(niv, memePlan) {
    if (!memePlan) {
      const n = fabriquer(niv);
      if (!n) return;
      jeu.n = n;
    }
    jeu.niveau = niv;
    jeu.ou = jeu.n.plan.depart;
    jeu.phase = 0;
    jeu.tours = 0;
    jeu.budget = budgetDe(jeu.n.minimum);
    batir();
    rendre();
  }

  function batir() {
    const { w, h } = jeu.n.plan;
    const plateau = $('plateau');
    plateau.innerHTML = '';
    plateau.style.setProperty('--cols', w);
    plateau.style.setProperty('--rows', h);
    cases.length = 0;
    for (let i = 0; i < w * h; i++) {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'case';
      d.dataset.i = String(i);
      d.addEventListener('click', () => versLa(i));
      plateau.appendChild(d);
      cases.push(d);
    }
  }

  /* Un coup : on avance d'une case voisine (ou on reste), puis les cônes tournent. */
  function versLa(c) {
    if (jeu.gele || jeu.fini) return;
    Arcade.boot();
    const { w, h } = jeu.n.plan;
    const x = jeu.ou % w, y = (jeu.ou / w) | 0;
    const cx = c % w, cy = (c / w) | 0;
    const d = Math.abs(cx - x) + Math.abs(cy - y);
    if (d > 1) { Arcade.sfx.deny(); return; }
    if (!libre(jeu.n.plan, jeu.n.veilleurs, c)) { Arcade.sfx.deny(); return; }
    jouer(c);
  }

  function jouer(c) {
    jeu.ou = c;
    jeu.phase = (jeu.phase + 1) % PHASES;
    jeu.tours++;

    if (c === jeu.n.plan.sortie) return reussi();

    if (jeu.n.lum[jeu.phase][c]) return repere('Vu.');
    if (jeu.tours >= jeu.budget) return repere('L\'alerte est donnée : trop de tours.');

    Arcade.sfx.tick();
    rendre();
  }

  function reussi() {
    jeu.gele = true;
    const auPar = jeu.tours === jeu.n.minimum;
    const points = jeu.n.minimum * 10 + (auPar ? 50 : 0);
    jeu.score += points;
    if (jeu.score > record) { record = jeu.score; Arcade.setRecord('filature', record); }
    Arcade.sfx.chain(Math.min(10, jeu.niveau));
    annoncer(auPar ? 'Sorti au minimum, en ' + jeu.tours + ' tours. +' + points + ' points'
                   : 'Sorti en ' + jeu.tours + ' tours (minimum ' + jeu.n.minimum + '). +' + points + ' points');
    rendre();
    setTimeout(() => {
      if (jeu.fini) return;
      jeu.gele = false;
      poser(jeu.niveau + 1, false);
    }, Arcade.ms(950));
  }

  function repere(pourquoi) {
    jeu.vies--;
    Arcade.sfx.deny();
    Arcade.shake($('stage'), 4);
    if (jeu.vies <= 0) return perdre(pourquoi);
    jeu.gele = true;
    rendre();
    /* Le MÊME plan est resservi : on vient d'apprendre le rythme des cônes, et
       c'est le seul moment où cette connaissance sert. Réseau fait l'inverse,
       parce qu'y rester bloqué n'apprend rien. */
    annoncer(pourquoi + ' Le même plan, encore.');
    setTimeout(() => {
      if (jeu.fini) return;
      jeu.gele = false;
      poser(jeu.niveau, true);
    }, Arcade.ms(1100));
  }

  function perdre(pourquoi) {
    jeu.fini = true;
    jeu.gele = true;
    if (jeu.score > record) { record = jeu.score; Arcade.setRecord('filature', record); }
    const r = resoudre(jeu.n.plan, jeu.n.veilleurs);
    $('overScore').textContent = String(jeu.score);
    $('overNote').innerHTML = 'points · niveau ' + jeu.niveau + '<br>' + pourquoi +
      (r ? ' Le passage en <b>' + r.tours + '</b> tours est marqué.' : '');
    $('over').hidden = false;
    Arcade.sfx.over();
    /* Le rendu d'abord, le marquage ensuite : rendre() réécrit la classe de
       chaque case, et poser les marques avant lui les effaçait aussitôt. */
    rendre();
    if (r) for (const c of r.chemin) cases[c].classList.add('montre');
  }

  /* ---------- affichage ---------- */

  function rendre() {
    const { w, h, murs, depart, sortie } = jeu.n.plan;
    const lum = jeu.n.lum[jeu.phase];
    const voisines = new Set();
    if (!jeu.gele && !jeu.fini) {
      const x = jeu.ou % w, y = (jeu.ou / w) | 0;
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const n = ny * w + nx;
        if (libre(jeu.n.plan, jeu.n.veilleurs, n)) voisines.add(n);
      }
    }
    for (let i = 0; i < cases.length; i++) {
      const n = cases[i];
      n.className = 'case';
      n.textContent = '';
      if (murs[i]) { n.classList.add('mur'); n.disabled = true; continue; }
      n.disabled = false;
      if (lum[i]) n.classList.add('vu');
      if (i === sortie) n.classList.add('sortie');
      if (i === depart) n.classList.add('depart');
      if (voisines.has(i)) n.classList.add('offerte');
      const v = jeu.n.veilleurs.find((g) => g.c === i);
      if (v) {
        n.classList.add('veilleur');
        const d = (((v.dir + v.sens * jeu.phase) % PHASES) + PHASES) % PHASES;
        n.innerHTML = '<b class="regard">' + FLECHE[d] + '</b>' +
          '<b class="sens">' + (v.sens > 0 ? '↻' : '↺') + '</b>';
        n.disabled = true;
      }
      if (i === jeu.ou) n.classList.add('moi');
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
    $('meterLab').textContent = 'Niveau ' + jeu.niveau + ' · minimum ' + jeu.n.minimum + ' tours';
    $('tours').textContent = jeu.tours + ' / ' + jeu.budget;
    const part = jeu.budget ? Math.min(1, jeu.tours / jeu.budget) : 0;
    $('jauge').style.width = (part * 100).toFixed(1) + '%';
    $('meter').classList.toggle('hot', jeu.tours > jeu.n.minimum);
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
    clearTimeout(effacer);
    jeu.vies = 3;
    jeu.score = 0;
    jeu.fini = false;
    jeu.gele = false;
    $('over').hidden = true;
    $('pret').hidden = true;
    $('annonce').hidden = true;
    poser(1, false);
  }

  $('pret').addEventListener('click', () => { Arcade.boot(); commencer(); });
  $('rejouer').addEventListener('click', commencer);
  $('restart').addEventListener('click', commencer);
  $('attendre').addEventListener('click', () => { if (!jeu.gele && !jeu.fini) jouer(jeu.ou); });
  Arcade.bindMute($('mute'));
  addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') return commencer();
    if (e.key === 'm' || e.key === 'M') return $('mute').click();
    if (jeu.gele || jeu.fini) return;
    const { w } = jeu.n.plan;
    const pas = { ArrowUp: -w, ArrowRight: 1, ArrowDown: w, ArrowLeft: -1 }[e.key];
    if (pas !== undefined) {
      e.preventDefault();
      const x = jeu.ou % w;
      if ((e.key === 'ArrowLeft' && x === 0) || (e.key === 'ArrowRight' && x === w - 1)) return;
      const c = jeu.ou + pas;
      if (c < 0 || c >= w * jeu.n.plan.h) return;
      versLa(c);
    }
    if (e.key === ' ') { e.preventDefault(); jouer(jeu.ou); }
  });

  poser(1, false);
  jeu.gele = true;

  /* Banc d'essai : la vérification joue contre ce code-ci, pas contre une copie. */
  window.Filature = { jeu, fabriquer, resoudre, eclairage, tousLesEclairages, libre,
    palierDe, budgetDe, versLa, jouer, cases, PHASES, DIRS };
})();
