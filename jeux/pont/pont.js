/* Pont — Hashiwokakero. Des îles numérotées, des ponts droits entre elles.

   Règles : le nombre d'une île est le nombre de ponts qui s'y rattachent ; deux
   ponts au plus entre deux îles ; aucun croisement ; et tout doit tenir en un
   seul réseau.

   La grille est bâtie à l'envers, comme dans Réseau et Tracé : on construit le
   réseau d'abord — donc connexe et sans croisement par construction — et les
   numéros s'en déduisent. Une solution existe donc toujours.

   Reste l'unicité, et là une remarque évite tout un solveur. Les règles de
   propagation appliquées ici sont des conséquences des contraintes du jeu :
   bornes arithmétiques sur chaque île, et interdiction de croiser un pont posé.
   Elles ne retirent donc que des valeurs qu'aucune solution ne porte. Si elles
   déterminent TOUTES les arêtes, l'assignation obtenue est la seule à satisfaire
   les degrés et les croisements — et comme une solution existe, c'est elle.

   « Résoluble sans deviner » implique donc « solution unique ». Vérifié contre un
   solveur exhaustif (scratchpad/pont-mesure2.mjs) : sur 323 grilles résolues par
   déduction seule, 323 n'avaient qu'une solution, et c'était bien celle
   construite — aucun contre-exemple. La fabrication n'a donc besoin que de la
   propagation, et une grille coûte moins d'une milliseconde.

   Le corollaire fait le jeu : on n'a JAMAIS besoin de deviner. C'est ce qui
   autorise la réserve de fautes comme unique ressource — un joueur méthodique
   n'en dépense aucune, mesuré sur 800 grilles, et un joueur qui pose au jugé en
   dépense de 1 à 6 par grille selon la taille. */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const CAP = 2;
  const U = 100, MARGE = 52;

  /* ---------- l'échelle ---------- */

  const PALIERS = [
    { jusqu: 3,        w: 7,  h: 7, iles: 6 },
    { jusqu: 7,        w: 9,  h: 7, iles: 9 },
    { jusqu: 12,       w: 9,  h: 9, iles: 13 },
    { jusqu: 18,       w: 11, h: 9, iles: 18 },
    { jusqu: Infinity, w: 11, h: 9, iles: 22 },
  ];
  const palierDe = (n) => PALIERS.find((p) => n <= p.jusqu);
  const DEPART = 6, PRIME = 2, PLAFOND = 10;

  /* ---------- géométrie ---------- */

  /* Les voisines en ligne droite. Le balayage doit être borné par la largeur ET
     la hauteur : sans la borne sur x, l'index y*w + x déborde sur la rangée
     suivante et fabrique des travées en diagonale — 828 sur 3 962 avant
     correction. Deux solveurs peuvent s'accorder sur une liste d'arêtes fausse
     s'ils la partagent ; c'est une capture d'écran qui l'a montré. */
  function aretesDe(iles, w, h) {
    const parCase = new Map();
    iles.forEach((il, i) => parCase.set(il.y * w + il.x, i));
    const aretes = [], vues = new Set();
    iles.forEach((il, i) => {
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        let x = il.x + dx, y = il.y + dy;
        while (x >= 0 && x < w && y >= 0 && y < h) {
          const j = parCase.get(y * w + x);
          if (j !== undefined) {
            const cle = Math.min(i, j) + '-' + Math.max(i, j);
            if (!vues.has(cle)) { vues.add(cle); aretes.push({ a: i, b: j, dx, dy }); }
            break;
          }
          x += dx; y += dy;
        }
      }
    });
    return aretes;
  }

  function croisementsDe(iles, aretes) {
    const out = aretes.map(() => []);
    for (let i = 0; i < aretes.length; i++) {
      for (let j = i + 1; j < aretes.length; j++) {
        const A = aretes[i], B = aretes[j];
        if (A.dy === B.dy) continue;
        const H = A.dx ? A : B, V = A.dx ? B : A;
        const hy = iles[H.a].y;
        const hx1 = Math.min(iles[H.a].x, iles[H.b].x), hx2 = Math.max(iles[H.a].x, iles[H.b].x);
        const vx = iles[V.a].x;
        const vy1 = Math.min(iles[V.a].y, iles[V.b].y), vy2 = Math.max(iles[V.a].y, iles[V.b].y);
        if (vx > hx1 && vx < hx2 && hy > vy1 && hy < vy2) { out[i].push(j); out[j].push(i); }
      }
    }
    return out;
  }

  function connexe(n, aretes, valeurs) {
    const adj = Array.from({ length: n }, () => []);
    aretes.forEach((a, i) => { if (valeurs[i] > 0) { adj[a.a].push(a.b); adj[a.b].push(a.a); } });
    const vus = new Uint8Array(n);
    const pile = [0];
    vus[0] = 1;
    let compte = 1;
    while (pile.length) {
      const c = pile.pop();
      for (const v of adj[c]) if (!vus[v]) { vus[v] = 1; compte++; pile.push(v); }
    }
    return compte === n;
  }

  /* ---------- propagation ---------- */

  /* N'applique que des déductions locales, jamais d'hypothèse. Si elle termine,
     la grille se résout sans deviner — et sa solution est unique. */
  function propager(g) {
    const { iles, degres, aretes, croise } = g;
    const n = iles.length, m = aretes.length;
    const parIle = Array.from({ length: n }, () => []);
    aretes.forEach((a, i) => { parIle[a.a].push(i); parIle[a.b].push(i); });
    const lo = new Array(m).fill(0), hi = new Array(m).fill(CAP);
    let deductions = 0, tours = 0, bouge = true;
    while (bouge && tours++ < 400) {
      bouge = false;
      for (let e = 0; e < m; e++) {
        if (lo[e] > 0) for (const f of croise[e]) if (hi[f] > 0) { hi[f] = 0; bouge = true; }
        if (hi[e] < lo[e]) return { fini: false, deductions };
      }
      for (let il = 0; il < n; il++) {
        const es = parIle[il];
        let sLo = 0, sHi = 0;
        for (const e of es) { sLo += lo[e]; sHi += hi[e]; }
        if (sLo > degres[il] || sHi < degres[il]) return { fini: false, deductions };
        for (const e of es) {
          const nLo = Math.max(lo[e], degres[il] - (sHi - hi[e]));
          const nHi = Math.min(hi[e], degres[il] - (sLo - lo[e]));
          if (nLo > lo[e]) { sLo += nLo - lo[e]; lo[e] = nLo; bouge = true; deductions++; }
          if (nHi < hi[e]) { sHi -= hi[e] - nHi; hi[e] = nHi; bouge = true; deductions++; }
        }
      }
    }
    let decides = 0;
    for (let e = 0; e < m; e++) if (lo[e] === hi[e]) decides++;
    return { fini: decides === m, deductions, valeurs: lo.map((v, i) => (v === hi[i] ? v : -1)) };
  }

  /* ---------- fabrique ---------- */

  function unePasse(w, h, nbIles) {
    const occupe = new Uint8Array(w * h);
    const iles = [{ x: Math.floor(Math.random() * w), y: Math.floor(Math.random() * h) }];
    occupe[iles[0].y * w + iles[0].x] = 1;
    const ponts = new Map();
    const segments = new Set();

    const traverse = (x1, y1, x2, y2) => {
      const out = [];
      const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
      let x = x1 + dx, y = y1 + dy;
      while (x !== x2 || y !== y2) { out.push(y * w + x); x += dx; y += dy; }
      return out;
    };
    /* Deux îles collées rendraient la lecture ambiguë : on garde une case. */
    const colle = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => {
      const nx = x + a, ny = y + b;
      return nx >= 0 && nx < w && ny >= 0 && ny < h && occupe[ny * w + nx];
    });

    let garde = 0;
    while (iles.length < nbIles && garde++ < 900) {
      const src = Math.floor(Math.random() * iles.length);
      const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)];
      const d = 2 + Math.floor(Math.random() * 3);
      const x = iles[src].x + dx * d, y = iles[src].y + dy * d;
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      if (occupe[y * w + x] || colle(x, y)) continue;
      const cases = traverse(iles[src].x, iles[src].y, x, y);
      if (cases.some((c) => occupe[c] || segments.has(c))) continue;
      iles.push({ x, y });
      occupe[y * w + x] = 1;
      for (const c of cases) segments.add(c);
      ponts.set(src + '-' + (iles.length - 1), 1 + (Math.random() < 0.45 ? 1 : 0));
    }
    if (iles.length < nbIles) return null;

    const aretes = aretesDe(iles, w, h);
    const croise = croisementsDe(iles, aretes);
    const solution = aretes.map(() => 0);
    for (const [cle, v] of ponts) {
      const [i, j] = cle.split('-').map(Number);
      const k = aretes.findIndex((a) => (a.a === i && a.b === j) || (a.a === j && a.b === i));
      if (k >= 0) solution[k] = v;
    }
    /* Quelques ponts en plus : sans eux le réseau est un arbre, et un arbre se
       lit trop vite. */
    const ordre = aretes.map((_, i) => i);
    for (let i = ordre.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
    }
    for (const i of ordre) {
      if (solution[i] >= CAP) continue;
      if (croise[i].some((j) => solution[j] > 0)) continue;
      if (Math.random() < 0.45) solution[i] += 1;
    }

    const degres = new Array(iles.length).fill(0);
    aretes.forEach((a, i) => { degres[a.a] += solution[i]; degres[a.b] += solution[i]; });
    if (degres.some((d) => d === 0)) return null;
    if (!connexe(iles.length, aretes, solution)) return null;
    return { w, h, iles, degres, aretes, croise, solution };
  }

  function fabriquer(niveau) {
    const p = palierDe(niveau);
    for (let essai = 0; essai < 600; essai++) {
      const g = unePasse(p.w, p.h, p.iles);
      if (!g) continue;
      const prop = propager(g);
      if (!prop.fini) continue;
      return Object.assign(g, { deductions: prop.deductions });
    }
    return null;
  }

  /* ---------- la partie ---------- */

  const jeu = { niveau: 1, g: null, val: [], choix: -1, fautes: DEPART,
    fautesIci: 0, score: 0, fini: false, gele: true };
  let record = Arcade.record('pont');
  const noeuds = { iles: [], ponts: [] };

  const px = (il) => ({ x: il.x * U + MARGE, y: il.y * U + MARGE });

  function poser(niv) {
    const g = fabriquer(niv);
    if (!g) return;
    jeu.niveau = niv;
    jeu.g = g;
    jeu.val = g.aretes.map(() => 0);
    jeu.choix = -1;
    jeu.fautesIci = 0;
    dessiner();
    rendre();
  }

  const NS = 'http://www.w3.org/2000/svg';

  function dessiner() {
    const svg = $('carte');
    const { w, h, iles, aretes, degres } = jeu.g;
    svg.setAttribute('viewBox', '0 0 ' + ((w - 1) * U + MARGE * 2) + ' ' + ((h - 1) * U + MARGE * 2));
    svg.innerHTML = '';
    noeuds.iles.length = 0;
    noeuds.ponts.length = 0;

    /* Les ponts d'abord, pour qu'ils passent sous les îles. */
    aretes.forEach((a, i) => {
      const pa = px(iles[a.a]), pb = px(iles[a.b]);
      const grp = document.createElementNS(NS, 'g');
      grp.setAttribute('class', 'pont');
      /* Trois rails : celui du milieu pour un pont simple, les deux écartés pour
         un pont double. Réutiliser un rail décalé pour le pont simple le ferait
         passer à côté de l'axe. */
      for (const [d, nom] of [[0, 't0'], [-1, 't1'], [1, 't2']]) {
        const l = document.createElementNS(NS, 'line');
        const ox = a.dy ? d * 13 : 0, oy = a.dx ? d * 13 : 0;
        l.setAttribute('x1', pa.x + ox); l.setAttribute('y1', pa.y + oy);
        l.setAttribute('x2', pb.x + ox); l.setAttribute('y2', pb.y + oy);
        l.setAttribute('class', 'trait ' + nom);
        grp.appendChild(l);
      }
      /* Une ligne large et transparente : de quoi viser le pont au doigt. */
      const zone = document.createElementNS(NS, 'line');
      zone.setAttribute('x1', pa.x); zone.setAttribute('y1', pa.y);
      zone.setAttribute('x2', pb.x); zone.setAttribute('y2', pb.y);
      zone.setAttribute('class', 'prise');
      zone.addEventListener('click', () => cycler(i));
      grp.appendChild(zone);
      svg.appendChild(grp);
      noeuds.ponts.push(grp);
    });

    iles.forEach((il, i) => {
      const p = px(il);
      const grp = document.createElementNS(NS, 'g');
      grp.setAttribute('class', 'ile');
      grp.setAttribute('tabindex', '0');
      grp.setAttribute('role', 'button');
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 33);
      grp.appendChild(c);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', p.x); t.setAttribute('y', p.y);
      t.textContent = String(degres[i]);
      grp.appendChild(t);
      grp.addEventListener('click', () => toucher(i));
      grp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toucher(i); }
      });
      svg.appendChild(grp);
      noeuds.iles.push(grp);
    });
  }

  /* ---------- les coups ---------- */

  const areteEntre = (i, j) => jeu.g.aretes.findIndex((a) =>
    (a.a === i && a.b === j) || (a.a === j && a.b === i));

  function toucher(i) {
    if (jeu.gele || jeu.fini) return;
    Arcade.boot();
    if (jeu.choix === -1) { jeu.choix = i; Arcade.sfx.tick(); rendre(); return; }
    if (jeu.choix === i) { jeu.choix = -1; rendre(); return; }
    const e = areteEntre(jeu.choix, i);
    if (e === -1) { jeu.choix = i; Arcade.sfx.tick(); rendre(); return; }
    cycler(e);
  }

  function degreActuel(il) {
    let s = 0;
    jeu.g.aretes.forEach((a, i) => { if (a.a === il || a.b === il) s += jeu.val[i]; });
    return s;
  }

  function cycler(e) {
    if (jeu.gele || jeu.fini) return;
    Arcade.boot();
    const { aretes, croise, degres, solution } = jeu.g;
    const suivant = (jeu.val[e] + 1) % (CAP + 1);
    jeu.choix = -1;

    if (suivant > jeu.val[e]) {
      /* Deux refus francs : croiser un pont posé, ou dépasser le nombre d'une île.
         Ce ne sont pas des fautes, ce sont des coups impossibles. */
      if (croise[e].some((f) => jeu.val[f] > 0)) return refus('Ce pont croiserait un autre.');
      const { a, b } = aretes[e];
      const delta = suivant - jeu.val[e];
      if (degreActuel(a) + delta > degres[a] || degreActuel(b) + delta > degres[b])
        return refus('Une île serait dépassée.');
    }

    jeu.val[e] = suivant;
    if (suivant > solution[e]) {
      jeu.fautes--;
      jeu.fautesIci++;
      Arcade.sfx.deny();
      Arcade.shake($('stage'), 3);
      if (jeu.fautes < 0) return perdre('Ce pont-là n\'y était pas.');
      annoncer('Ce pont n\'est pas dans la solution. Réserve : ' + jeu.fautes);
    } else {
      Arcade.tone({ freq: 300 + suivant * 120, dur: 0.06, type: 'sine', vol: 0.08 });
    }
    rendre();
    verifier();
  }

  function refus(pourquoi) {
    Arcade.sfx.deny();
    annoncer(pourquoi);
    rendre();
  }

  function verifier() {
    const { iles, degres, aretes } = jeu.g;
    for (let i = 0; i < iles.length; i++) if (degreActuel(i) !== degres[i]) return;
    if (!connexe(iles.length, aretes, jeu.val)) {
      annoncer('Tous les comptes sont bons, mais le réseau est en deux morceaux.');
      return;
    }
    reussi();
  }

  function reussi() {
    jeu.gele = true;
    const propre = jeu.fautesIci === 0;
    const points = jeu.g.iles.length * 10 + (propre ? 40 : 0);
    jeu.score += points;
    if (jeu.score > record) { record = jeu.score; Arcade.setRecord('pont', record); }
    jeu.fautes = Math.min(PLAFOND, jeu.fautes + PRIME);
    for (const g of noeuds.iles) g.classList.add('boucle');
    Arcade.sfx.chain(Math.min(10, jeu.niveau));
    annoncer(propre ? 'Sans une faute. +' + points + ' points, +' + PRIME + ' de réserve'
                    : 'Réseau bouclé. +' + points + ' points, +' + PRIME + ' de réserve');
    rendre();
    setTimeout(() => {
      if (jeu.fini) return;
      jeu.gele = false;
      poser(jeu.niveau + 1);
    }, Arcade.ms(950));
  }

  function perdre(pourquoi) {
    jeu.fini = true;
    jeu.gele = true;
    jeu.fautes = 0;
    if (jeu.score > record) { record = jeu.score; Arcade.setRecord('pont', record); }
    $('overScore').textContent = String(jeu.score);
    $('overNote').innerHTML = 'points · niveau ' + jeu.niveau + '<br>' + pourquoi +
      ' La solution est derrière, en clair.';
    $('over').hidden = false;
    Arcade.sfx.over();
    /* On montre la solution : cette grille était résoluble sans deviner, et c'est
       en la voyant qu'on comprend par où il fallait commencer. */
    jeu.val = jeu.g.solution.slice();
    rendre();
    for (const g of noeuds.ponts) g.classList.add('montre');
  }

  /* ---------- affichage ---------- */

  function rendre() {
    const { iles, degres, aretes } = jeu.g;
    for (let i = 0; i < aretes.length; i++) {
      const g = noeuds.ponts[i];
      g.classList.remove('un', 'deux', 'montre');
      if (jeu.val[i] === 1) g.classList.add('un');
      if (jeu.val[i] === 2) g.classList.add('deux');
    }
    for (let i = 0; i < iles.length; i++) {
      const g = noeuds.iles[i];
      const d = degreActuel(i);
      g.classList.toggle('pleine', d === degres[i]);
      g.classList.toggle('choisie', i === jeu.choix);
      g.classList.remove('voisine');
    }
    if (jeu.choix >= 0) {
      for (const a of aretes) {
        if (a.a === jeu.choix) noeuds.iles[a.b].classList.add('voisine');
        if (a.b === jeu.choix) noeuds.iles[a.a].classList.add('voisine');
      }
    }
    $('score').textContent = String(jeu.score);
    $('best').textContent = String(record);
    $('fautes').textContent = String(Math.max(0, jeu.fautes));
    $('fautesStat').classList.toggle('maigre', jeu.fautes <= 1);
    const restants = degres.reduce((s, d, i) => s + (d - degreActuel(i)), 0) / 2;
    $('meterLab').textContent = 'Niveau ' + jeu.niveau + ' · ' + iles.length + ' îles';
    $('restants').textContent = restants + ' pont' + (restants > 1 ? 's' : '') + ' à poser';
    const total = degres.reduce((s, d) => s + d, 0) / 2;
    $('jauge').style.width = (100 * (total - restants) / total).toFixed(1) + '%';
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
    jeu.fautes = DEPART;
    jeu.score = 0;
    jeu.fini = false;
    jeu.gele = false;
    $('over').hidden = true;
    $('pret').hidden = true;
    $('annonce').hidden = true;
    poser(1);
  }

  function effacerTout() {
    if (jeu.gele || jeu.fini) return;
    jeu.val = jeu.g.aretes.map(() => 0);
    jeu.choix = -1;
    Arcade.sfx.tick();
    rendre();
  }

  $('pret').addEventListener('click', () => { Arcade.boot(); commencer(); });
  $('rejouer').addEventListener('click', commencer);
  $('restart').addEventListener('click', commencer);
  $('vider').addEventListener('click', effacerTout);
  Arcade.bindMute($('mute'));
  addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') commencer();
    if (e.key === 'm' || e.key === 'M') $('mute').click();
    if (e.key === 'Escape') { jeu.choix = -1; rendre(); }
  });

  poser(1);
  jeu.gele = true;

  /* Banc d'essai : la vérification joue contre ce code-ci, pas contre une copie. */
  window.Pont = { jeu, fabriquer, unePasse, propager, connexe, aretesDe, croisementsDe,
    palierDe, cycler, toucher, degreActuel, areteEntre, noeuds, CAP, DEPART, PRIME, PLAFOND };
})();
