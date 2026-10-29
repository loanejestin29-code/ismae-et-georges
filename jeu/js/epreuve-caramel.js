// =====================================================================
//  epreuve-caramel.js — ÉPREUVE 5 : « Le caramel raté » (Montaigu)
//
//  État (Scenes.quete.caramel) : 'aVenir' → 'rencontre' (Ismae a rencontré Rémy) → 'gagne'
//  · Dans les rues de Montaigu, les habitants parlent d'une odeur de caramel et d'un chef
//    « tout petit ». Le restaurant du chef Gusteau est sur la place, à côté de l'église.
//  · Dans la cuisine, Rémy (le rat cuisinier) cherche quelqu'un pour préparer un caramel.
//  · Le mini-jeu (caramel.js) : doser le sucre, mélanger, surveiller la cuisson.
//  · La victoire : le cinquième indice, puis Ismae peut ressortir et se promener.
//  Tous les textes sont dans config.js → caramel.
// =====================================================================
'use strict';

const EpreuveCaramel = (() => {
  const Q = Scenes.quete, K = () => CONFIG.caramel;
  let salleVue = false;

  function init() { if (!Q.caramel) Q.caramel = 'aVenir'; Entites.portraits.remy = Resto.portraitRemy(); }
  // les répliques des habitants et des gens du restaurant, avant et après le caramel
  function repliques(id) {
    const p = K().pnj[id];
    if (!p) return null;
    return Q.caramel === 'gagne' ? p.apres : p.avant;
  }

  // la musique du restaurant n'est pas étouffée : on est dedans
  function musiqueResto() { Musique.morceau('resto'); Musique.etouffer(false); }

  function entreeSalle(J) {
    musiqueResto();
    if (salleVue || Q.caramel === 'gagne') return;
    salleVue = true;
    J.jouerScript([{ attendre: 0.3 }, { dire: K().salle }]);
  }

  // la rencontre avec Rémy, la première fois qu'Ismae entre dans la cuisine
  function entreeCuisine(J) {
    musiqueResto();
    const C = J.carte, remy = C.remy, p = J.joueur;
    if (Q.caramel !== 'aVenir') { remy.visible = true; return; }
    remy.visible = false;
    J.cinematique = true;
    J.jouerScript([
      { attendre: 0.4 },
      { dire: K().rencontre.debut },
      { faire: () => { remy.visible = true; remy.saut = 0.4; Musique.couic(); p.allerVers([{ x: remy.x - 2, y: remy.y + 16 }], 46); } },
      { jusqua: () => !p.chemin },
      { faire: () => { p.dir = 'up'; remy.pose = 'parle'; } },
      { dire: K().rencontre.remy },
      { faire: () => { remy.regarder(J.georges.x); remy.pose = null; } },
      { dire: K().rencontre.georges },
      { faire: () => { remy.dir = 'down'; remy.pose = 'parle'; Q.caramel = 'rencontre'; } },
      { dire: K().rencontre.pret },
    ], () => { J.cinematique = false; remy.pose = null; lancerJeu(J); });
  }
  function parlerRemy(J) {
    const remy = J.carte.remy;
    if (Q.caramel === 'gagne') return K().apres;
    if (Q.caramel === 'rencontre') { J.jouerScript([{ dire: [['remy', 'On s\'y remet ? Allez, chef !']] }], () => lancerJeu(J)); return null; }
    remy.saut = 0.3;
    return null;
  }

  function lancerJeu(J) {
    J.carte.remy.pose = null;
    Caramel.lancer(J, { fin: (gagne) => { if (gagne) victoire(J); } });
  }

  // la victoire : Rémy saute de joie, Linguini arrive en patins, puis le cinquième indice
  function victoire(J) {
    const C = J.carte, remy = C.remy, lin = C.linguiniCuisine;
    J.cinematique = true;
    remy.pose = 'joie'; remy.saut = 0.35;
    for (let k = 0; k < 6; k++) J.particule('coeur', remy.x + (k - 2.5) * 5, remy.y - remy.h - 16, { vy: -12 - k * 3, max: 1.6 });
    J.jouerScript([
      { attendre: 0.4 },
      { dire: K().victoire.slice(0, 2) },
      { faire: () => { if (lin) { lin.visible = true; lin.x = 176; lin.y = 236; lin.allerVers([{ x: 210, y: 176 }], 80); } } },
      { jusqua: () => !lin || !lin.chemin },
      { dire: K().victoire.slice(2) },
      { faire: () => { remy.pose = null; Musique.victoire(); Indices.gagner(4, () => apres(J)); } },
    ]);
  }
  function apres(J) {
    Q.caramel = 'gagne';
    J.cinematique = false;
    const lin = J.carte.linguiniCuisine;
    J.dire(K().apres, () => { if (lin) lin.allerVers([{ x: 176, y: 250 }], 80, () => { lin.visible = false; }); Indices.suite(K().suite); });
  }

  return { init, repliques, entreeSalle, entreeCuisine, parlerRemy, lancerJeu, dev: { victoire } };
})();
