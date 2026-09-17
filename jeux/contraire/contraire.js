/* Contraire — le mot ROUGE écrit en bleu : répondre bleu, pas rouge.

   C'est l'effet Stroop : lire est automatique, nommer une couleur ne l'est pas,
   et les deux se contrarient. Le jeu ajoute le changement de consigne — tantôt
   la couleur, tantôt le mot — qui coûte encore plus cher que le conflit lui-même.

   La palette n'a pas été choisie à l'œil. Un jeu où l'on nomme des couleurs est
   injouable pour un daltonien si deux couleurs se confondent, et faussement :
   le joueur croira se tromper. Chaque candidate est donc passée dans les trois
   dichromaties courantes (protanopie, deutéranopie, tritanopie) par les matrices
   de Viénot-Brettel, convertie en Lab, et toutes les paires sont mesurées en ΔE.
   Résultat (scratchpad/contraire-palette*.mjs) :

     rouge · bleu · jaune · blanc      ΔE minimal 46,1  (deutéranopie, rouge/jaune)
     + vert                            ΔE minimal 30,2  (deutéranopie, rouge/vert)
     + violet                          ΔE minimal  1,6  (protanopie, bleu/violet)

   Le violet est donc exclu : sur un écran en vision normale il paraît idéal, et
   il est indiscernable du bleu pour un protanope. Le vert passerait, mais on
   s'arrête à quatre : la difficulté vient du temps et de la consigne, pas d'un
   cinquième nom qui fragiliserait la palette. Le violet sert au châssis, où il
   n'est jamais une réponse. */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const COULEURS = [
    { nom: 'ROUGE', hex: '#d6342a' },
    { nom: 'BLEU',  hex: '#3d7dff' },
    { nom: 'JAUNE', hex: '#f5d018' },
    { nom: 'BLANC', hex: '#f2ece0' },
  ];

  const CONGRUENT = 0.25;        // un quart d'épreuves où le mot dit sa propre couleur
  /* Plancher de temps : le temps de réaction sur une épreuve de Stroop
     incongruente tourne autour de 800 ms chez l'adulte, choix de la réponse
     compris. On ne descend donc pas sous 950 ms — c'est la seule valeur de ce
     jeu qui vienne de la littérature et non d'une mesure faite ici. */
  const T_MIN = 0.95, T_MAX = 2.4;
  const tempsDe = (n) => Math.max(T_MIN, T_MAX - n * 0.032);
  const AVANT_CONSIGNE = 9;      // la consigne ne change pas avant la neuvième
  const PAUSE = 1.25;            // temps offert à l'annonce d'un changement

  const jeu = {
    epreuve: 0, regle: 'couleur', encre: null, mot: null,
    vies: 3, score: 0, serie: 0, meilleureSerie: 0,
    reste: 0, total: 0, pause: 0, fini: false, gele: true,
    prochainChangement: AVANT_CONSIGNE,
  };
  let record = Arcade.record('contraire');
  let horloge = null;

  /* ---------- une épreuve ---------- */

  function tirer() {
    const encre = COULEURS[Math.floor(Math.random() * COULEURS.length)];
    let mot = encre;
    if (Math.random() > CONGRUENT) {
      const autres = COULEURS.filter((c) => c !== encre);
      mot = autres[Math.floor(Math.random() * autres.length)];
    }
    return { encre, mot };
  }

  const bonne = () => (jeu.regle === 'couleur' ? jeu.encre : jeu.mot);

  function servir() {
    jeu.epreuve++;
    if (jeu.epreuve >= jeu.prochainChangement) {
      jeu.regle = jeu.regle === 'couleur' ? 'mot' : 'couleur';
      jeu.prochainChangement = jeu.epreuve + 6 + Math.floor(Math.random() * 5);
      jeu.pause = PAUSE;
      annoncer(jeu.regle === 'couleur' ? 'Désormais : la COULEUR de l\'encre'
                                       : 'Désormais : le MOT écrit');
    }
    const t = tirer();
    jeu.encre = t.encre;
    jeu.mot = t.mot;
    jeu.total = tempsDe(jeu.epreuve);
    jeu.reste = jeu.total;
    rendre();
  }

  function repondre(couleur) {
    if (jeu.gele || jeu.fini || jeu.pause > 0) return;
    Arcade.boot();
    if (couleur === bonne()) {
      jeu.serie++;
      if (jeu.serie > jeu.meilleureSerie) jeu.meilleureSerie = jeu.serie;
      const points = 10 + Math.min(20, Math.floor(jeu.serie / 3) * 5);
      jeu.score += points;
      Arcade.sfx.chain(Math.min(10, 1 + Math.floor(jeu.serie / 3)));
      marquer('juste');
      servir();
      return;
    }
    jeu.serie = 0;
    rater(couleur === jeu.mot && jeu.regle === 'couleur'
      ? 'Vous avez lu le mot.'
      : couleur === jeu.encre && jeu.regle === 'mot'
        ? 'Vous avez nommé l\'encre.'
        : 'Ce n\'était ni l\'un ni l\'autre.');
  }

  function tempsEcoule() { jeu.serie = 0; rater('Trop tard.'); }

  function rater(pourquoi) {
    jeu.vies--;
    Arcade.sfx.deny();
    Arcade.shake($('stage'), 4);
    marquer('faux');
    if (jeu.vies <= 0) return perdre(pourquoi);
    jeu.pause = PAUSE;
    annoncer(pourquoi + ' Il fallait ' + bonne().nom + '.');
    servir();
  }

  function perdre(pourquoi) {
    jeu.fini = true;
    jeu.gele = true;
    clearInterval(horloge);
    if (jeu.score > record) { record = jeu.score; Arcade.setRecord('contraire', record); }
    $('overScore').textContent = String(jeu.score);
    $('overNote').innerHTML = 'points · ' + jeu.epreuve + ' épreuves<br>' + pourquoi +
      ' Meilleure série : <b>' + jeu.meilleureSerie + '</b>.';
    $('over').hidden = false;
    Arcade.sfx.over();
    rendre();
  }

  /* ---------- affichage ---------- */

  function rendre() {
    const cible = $('cible');
    cible.textContent = jeu.mot ? jeu.mot.nom : '';
    cible.style.color = jeu.encre ? jeu.encre.hex : 'inherit';
    $('consigne').textContent = jeu.regle === 'couleur' ? 'la couleur de l\'encre' : 'le mot écrit';
    $('consigne').classList.toggle('mot', jeu.regle === 'mot');
    $('score').textContent = String(jeu.score);
    $('best').textContent = String(record);
    $('serie').textContent = String(jeu.serie);
    const pips = $('vies');
    pips.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const p = document.createElement('i');
      if (i >= jeu.vies) p.className = 'perdue';
      pips.appendChild(p);
    }
    const part = jeu.total ? Math.max(0, jeu.reste) / jeu.total : 0;
    $('jauge').style.width = (part * 100).toFixed(1) + '%';
    $('meter').classList.toggle('hot', part < 0.3 && jeu.pause <= 0);
    $('chrono').textContent = jeu.pause > 0 ? 'attendez' : Math.max(0, jeu.reste).toFixed(1).replace('.', ',') + ' s';
  }

  function marquer(classe) {
    const n = $('cible');
    Arcade.replay(n, 'juste', 'faux', classe);
  }

  let effacer = null;
  function annoncer(texte) {
    const n = $('annonce');
    n.textContent = texte;
    n.hidden = false;
    clearTimeout(effacer);
    effacer = setTimeout(() => { n.hidden = true; }, 2200);
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
      /* La pause d'un changement de consigne ne coûte pas de temps : le surcoût
         du changement est déjà la difficulté, l'ajouter au chrono serait double. */
      if (jeu.pause > 0) { jeu.pause -= dt; rendre(); return; }
      jeu.reste -= dt;
      if (jeu.reste <= 0) { jeu.reste = 0; rendre(); tempsEcoule(); return; }
      rendre();
    }, 60);
  }

  /* ---------- commandes ---------- */

  function batirPalette() {
    const rangee = $('palette');
    rangee.innerHTML = '';
    for (const c of COULEURS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pastille';
      b.style.setProperty('--teinte', c.hex);
      b.setAttribute('aria-label', c.nom.toLowerCase());
      b.addEventListener('click', () => repondre(c));
      rangee.appendChild(b);
    }
  }

  function commencer() {
    clearTimeout(effacer);
    jeu.epreuve = 0;
    jeu.regle = 'couleur';
    jeu.prochainChangement = AVANT_CONSIGNE;
    jeu.vies = 3;
    jeu.score = 0;
    jeu.serie = 0;
    jeu.meilleureSerie = 0;
    jeu.pause = 0;
    jeu.fini = false;
    jeu.gele = false;
    $('over').hidden = true;
    $('pret').hidden = true;
    $('annonce').hidden = true;
    servir();
    lancerHorloge();
  }

  batirPalette();
  $('pret').addEventListener('click', () => { Arcade.boot(); commencer(); });
  $('rejouer').addEventListener('click', commencer);
  $('restart').addEventListener('click', commencer);
  Arcade.bindMute($('mute'));

  /* Les quatre pastilles sont aussi sous les touches 1 à 4, dans leur ordre
     d'affichage : leur position ne change jamais, et l'apprendre fait partie du
     jeu. */
  addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') return commencer();
    if (e.key === 'm' || e.key === 'M') return $('mute').click();
    const i = '1234'.indexOf(e.key);
    if (i >= 0) repondre(COULEURS[i]);
  });

  jeu.encre = COULEURS[1];
  jeu.mot = COULEURS[0];
  jeu.total = tempsDe(1);
  jeu.reste = jeu.total;
  rendre();

  /* Banc d'essai : la vérification joue contre ce code-ci, pas contre une copie. */
  window.Contraire = { jeu, COULEURS, CONGRUENT, tirer, bonne, servir, repondre,
    tempsDe, T_MIN, T_MAX, AVANT_CONSIGNE };
})();
