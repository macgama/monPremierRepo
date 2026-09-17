/* Balance — vingt planches, un bord de table, et le vide.

   Le critère de stabilité est exact, et il ne porte pas que sur le sol : à
   CHAQUE contact, le centre de masse de tout ce qui se trouve au-dessus doit
   tomber dans la zone de recouvrement des deux planches en contact. Un seul
   contact qui manque fait pivoter toute la partie supérieure.

   Ce critère a un juge indépendant, et c'est ce qui donne au jeu son objectif :
   le porte-à-faux maximal de n planches au bord d'une table vaut ½·Hₙ, la
   moitié de la somme harmonique. Vérifié dans les deux sens (scratchpad/
   balance-mesure*.mjs) : le code accepte la pile optimale à la précision de la
   virgule flottante près, pour n de 1 à 40, et la refuse dès qu'on pousse la
   pile d'un millième. Pour vingt planches, ½·H₂₀ = 1,799 — soit 180 points,
   la cible affichée.

   Ce qui fait le jeu tient en une phrase mesurée : la punition est toujours
   différée. À chaque pose, la fenêtre stable est large — on peut presque
   toujours pousser la planche d'une demi-longueur. Mais pousser tôt verrouille
   tout ce qui vient après, et aucune politique à fraction fixe n'approche la
   borne : pousser au maximum donne 0,50, une fraction prudente 0,94, l'optimum
   2,14 à quarante planches. Il faut de tout petits décalages en bas et de
   grands en haut, donc deviner combien il en reste. */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const BLOCS = 20;              // planches par tentative
  const BORD = 0;                // bord de la table, en largeurs de planche
  const TABLE = -2.6;            // extrémité gauche de la table
  const L = 1;                   // toutes les planches ont la même longueur
  const PX = 66;                 // une planche à l'écran
  const EP = 13;                 // son épaisseur

  const harmonique = (n) => { let s = 0; for (let i = 1; i <= n; i++) s += 1 / i; return s; };
  const CIBLE = harmonique(BLOCS) / 2;

  /* ---------- la physique ---------- */

  const centreDeMasse = (blocs) => {
    let m = 0, mx = 0;
    for (const b of blocs) { m += b.l; mx += b.l * b.x; }
    return m ? mx / m : 0;
  };

  /* Appui sous la planche k : recouvrement avec la planche du dessous, ou avec
     la table pour la planche du bas. */
  function appui(blocs, k) {
    if (k === 0) {
      return { lo: Math.max(blocs[0].x - blocs[0].l / 2, TABLE),
               hi: Math.min(blocs[0].x + blocs[0].l / 2, BORD) };
    }
    const d = blocs[k - 1], h = blocs[k];
    return { lo: Math.max(h.x - h.l / 2, d.x - d.l / 2),
             hi: Math.min(h.x + h.l / 2, d.x + d.l / 2) };
  }

  /* Marge de stabilité : la plus petite distance, sur tous les contacts, entre le
     centre de masse de ce qui est au-dessus et le bord de son appui. Négative =
     la tour verse, et l'indice dit à quel étage elle casse. */
  function marge(blocs) {
    let pire = Infinity, ou = -1;
    for (let k = 0; k < blocs.length; k++) {
      const { lo, hi } = appui(blocs, k);
      if (hi <= lo) return { marge: -Infinity, ou: k };
      const c = centreDeMasse(blocs.slice(k));
      const m = Math.min(c - lo, hi - c);
      if (m < pire) { pire = m; ou = k; }
    }
    return { marge: pire, ou };
  }

  /* Fenêtre de pose exacte. Chaque contrainte est linéaire en la position x de la
     nouvelle planche : au nouveau contact son centre doit tomber sur la planche du
     dessous, et à chaque contact plus bas le centre de masse devient
     (S_k + x·l)/(M_k + l), qui doit rester entre les bords de l'appui. On
     intersecte, en un seul passage. */
  function fenetre(blocs, l = L) {
    let lo = TABLE, hi = BORD;
    if (blocs.length) {
      const d = blocs[blocs.length - 1];
      lo = d.x - d.l / 2;
      hi = d.x + d.l / 2;
    }
    const n = blocs.length;
    const S = new Array(n + 1).fill(0), M = new Array(n + 1).fill(0);
    for (let k = n - 1; k >= 0; k--) {
      S[k] = S[k + 1] + blocs[k].l * blocs[k].x;
      M[k] = M[k + 1] + blocs[k].l;
    }
    for (let k = 0; k < n; k++) {
      const { lo: a, hi: b } = appui(blocs, k);
      if (b <= a) return null;
      const Mk = M[k] + l;
      lo = Math.max(lo, (a * Mk - S[k]) / l);
      hi = Math.min(hi, (b * Mk - S[k]) / l);
    }
    return hi > lo ? { lo, hi } : null;
  }

  /* Ce qu'on peut physiquement tenter : la planche doit reposer sur ce qui est
     dessous, stable ou non. C'est plus large que la fenêtre — et c'est exprès.
     Pour la première planche, son centre doit rester au-dessus de la table :
     au-delà, elle ne reposerait sur rien et tomberait tout droit. */
  function pose(blocs, l = L) {
    if (!blocs.length) return { lo: TABLE + l / 2, hi: BORD };
    const d = blocs[blocs.length - 1];
    return { lo: d.x - d.l / 2, hi: d.x + d.l / 2 };
  }

  /* La pile optimale est EXACTEMENT critique : sa marge vaut zéro à chaque
     contact. Un test strict sur « marge > 0 » la déclarerait donc effondrée, et
     la cible affichée serait inatteignable. On tient debout à la limite. */
  const TOLERANCE = 1e-9;

  const portee = (blocs) => (blocs.length ? Math.max(...blocs.map((b) => b.x + b.l / 2)) - BORD : 0);

  /* ---------- la partie ---------- */

  const jeu = { blocs: [], reste: BLOCS, x: 0, fini: false, gele: true, cause: '' };
  let record = Arcade.record('balance');
  const noeuds = [];

  function nouvelle() {
    jeu.blocs = [];
    jeu.reste = BLOCS;
    jeu.fini = false;
    jeu.gele = false;
    jeu.cause = '';
    const p = pose(jeu.blocs);
    jeu.x = Math.min(p.hi, -L / 2);          // à ras du bord, sans dépasser
    $('over').hidden = true;
    $('pret').hidden = true;
    $('annonce').hidden = true;
    for (const n of noeuds) n.remove();
    noeuds.length = 0;
    rendre();
  }

  function bouger(dx) {
    if (jeu.gele || jeu.fini) return;
    const p = pose(jeu.blocs);
    jeu.x = Math.max(p.lo, Math.min(p.hi, jeu.x + dx));
    rendre();
  }

  function poser() {
    if (jeu.gele || jeu.fini) return;
    Arcade.boot();
    const avant = portee(jeu.blocs);
    const essai = [...jeu.blocs, { x: jeu.x, l: L }];
    const m = marge(essai);

    if (m.marge < -TOLERANCE) {
      /* Elle verse. On pose quand même la planche, puis tout ce qui est au-dessus
         du contact fautif basculé — on doit voir ce qu'on a cassé. */
      jeu.blocs = essai;
      jeu.reste--;
      dessiner();
      Arcade.sfx.over();
      Arcade.shake($('stage'), 5);
      verser(m.ou);
      const rang = (m.ou + 1) + (m.ou === 0 ? 'ᵉʳ' : 'ᵉ');
      return finir(avant, 'La tour a versé au ' + rang + ' contact.');
    }

    jeu.blocs = essai;
    jeu.reste--;
    Arcade.sfx.thud();
    dessiner();

    const gain = portee(jeu.blocs) - avant;
    if (gain > 0.001) Arcade.sfx.chain(Math.min(10, 1 + Math.round(portee(jeu.blocs) * 5)));

    if (jeu.reste === 0) return finir(portee(jeu.blocs), 'Vingt planches posées.');

    const suite = fenetre(jeu.blocs);
    if (!suite) return finir(portee(jeu.blocs), 'Plus aucune pose ne tient : la tour est verrouillée.');

    const p = pose(jeu.blocs);
    jeu.x = Math.max(p.lo, Math.min(p.hi, jeu.blocs[jeu.blocs.length - 1].x));
    rendre();
  }

  function finir(score, cause) {
    jeu.fini = true;
    jeu.gele = true;
    jeu.cause = cause;
    const points = Math.round(score * 100);
    if (points > record) { record = points; Arcade.setRecord('balance', record); }
    $('overScore').textContent = String(points);
    $('overNote').innerHTML = 'centièmes de planche · ' + cause +
      '<br>L\'optimum de vingt planches est <b>' + Math.round(CIBLE * 100) + '</b>.';
    $('over').hidden = false;
    rendre();
  }

  /* ---------- basculement ---------- */

  /* Tout ce qui est au-dessus du contact fautif pivote autour du bord de l'appui.
     C'est une image, pas une simulation : le calcul du jeu est le critère, pas
     un moteur physique. */
  function verser(ou) {
    const { lo, hi } = appui(jeu.blocs, ou);
    const c = centreDeMasse(jeu.blocs.slice(ou));
    const sens = c > hi ? 1 : -1;
    const pivot = sens > 0 ? hi : lo;
    for (let k = ou; k < jeu.blocs.length; k++) {
      const n = noeuds[k];
      if (!n) continue;
      const dx = (jeu.blocs[k].x - pivot) * PX;
      n.style.transformOrigin = (PX / 2 - dx) + 'px ' + EP + 'px';
      n.classList.add('verse');
      n.style.setProperty('--sens', String(sens));
      n.style.setProperty('--retard', ((k - ou) * 40) + 'ms');
    }
  }

  /* ---------- affichage ---------- */

  const ecran = () => $('pile');
  const versPx = (x) => (x - TABLE) * PX;

  function dessiner() {
    const zone = ecran();
    for (let k = noeuds.length; k < jeu.blocs.length; k++) {
      const n = document.createElement('i');
      n.className = 'planche';
      zone.appendChild(n);
      noeuds.push(n);
    }
    /* La position passe par des variables CSS, pour que l'animation de
       basculement puisse composer avec elle au lieu de l'écraser. */
    for (let k = 0; k < jeu.blocs.length; k++) {
      const b = jeu.blocs[k];
      noeuds[k].style.setProperty('--tx', (versPx(b.x) - PX / 2) + 'px');
      noeuds[k].style.setProperty('--ty', (-k * EP) + 'px');
    }
    rendre();
  }

  function rendre() {
    const zone = ecran();
    zone.style.setProperty('--haut', (jeu.blocs.length * EP + 40) + 'px');

    /* La planche en main. */
    const main = $('main');
    main.hidden = jeu.fini || jeu.gele;
    if (!main.hidden) {
      main.style.setProperty('--tx', (versPx(jeu.x) - PX / 2) + 'px');
      main.style.setProperty('--ty', (-jeu.blocs.length * EP - 20) + 'px');
    }

    /* Le centre de masse de toute la tour, et le bord de table. */
    const cm = $('cdm');
    if (jeu.blocs.length) {
      cm.hidden = false;
      cm.style.transform = 'translateX(' + versPx(centreDeMasse(jeu.blocs)) + 'px)';
    } else cm.hidden = true;

    const m = jeu.blocs.length ? marge(jeu.blocs) : { marge: 0.5, ou: -1 };
    const part = Math.max(0, Math.min(1, m.marge / 0.25));
    $('jauge').style.width = (part * 100).toFixed(1) + '%';
    $('meter').classList.toggle('hot', part < 0.3);
    $('margeTxt').textContent = jeu.blocs.length ? m.marge.toFixed(3).replace('.', ',') : '—';

    $('portee').textContent = String(Math.round(portee(jeu.blocs) * 100));
    $('best').textContent = String(record);
    $('reste').textContent = String(jeu.reste);
    $('cible').textContent = String(Math.round(CIBLE * 100));
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

  const zone = $('stage');
  let glisse = false;
  const abscisse = (e) => {
    const r = ecran().getBoundingClientRect();
    return (e.clientX - r.left) / PX + TABLE;
  };
  const viser = (e) => {
    if (jeu.gele || jeu.fini) return;
    const p = pose(jeu.blocs);
    jeu.x = Math.max(p.lo, Math.min(p.hi, abscisse(e)));
    rendre();
  };
  zone.addEventListener('pointerdown', (e) => { glisse = true; viser(e); });
  zone.addEventListener('pointermove', (e) => { if (glisse) viser(e); });
  zone.addEventListener('pointerup', () => { if (glisse) { glisse = false; poser(); } });
  zone.addEventListener('pointercancel', () => { glisse = false; });

  $('pret').addEventListener('click', () => { Arcade.boot(); nouvelle(); });
  $('rejouer').addEventListener('click', nouvelle);
  $('restart').addEventListener('click', nouvelle);
  Arcade.bindMute($('mute'));
  addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') return nouvelle();
    if (e.key === 'm' || e.key === 'M') return $('mute').click();
    if (e.key === 'ArrowLeft') { e.preventDefault(); bouger(e.shiftKey ? -0.005 : -0.03); }
    if (e.key === 'ArrowRight') { e.preventDefault(); bouger(e.shiftKey ? 0.005 : 0.03); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); poser(); }
  });

  rendre();

  /* Banc d'essai : la vérification joue contre ce code-ci, pas contre une copie. */
  window.Balance = { jeu, marge, fenetre, pose, portee, centreDeMasse, appui, TOLERANCE,
    harmonique, CIBLE, BLOCS, BORD, TABLE, L, poser, bouger, nouvelle,
    viserX: (x) => { jeu.x = x; rendre(); } };
})();
