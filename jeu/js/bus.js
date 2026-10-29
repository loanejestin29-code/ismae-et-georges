// =====================================================================
//  bus.js — ÉPREUVE 4 : « En route vers Montaigu »
//
//  1. À l'arrêt de bus d'Arendelle, le bus arrive ; Ismae et Georges montent.
//     Le chauffeur annonce : « Prochain arrêt : Montaigu ! »
//  2. Le trajet (vue du dessus, rétro) : le bus avance tout seul ; on change de file
//     (flèches ou A / D au clavier ; sur iPhone, glisser le doigt vers la gauche ou vers la droite :
//     sans glisser, le bus reste dans sa file). Des voitures déboîtent en clignotant.
//     Voitures, camions, tracteurs, travaux, chasse-neige, rennes, vaches… à éviter.
//     Trois vies ; la vitesse augmente. En panne (plus de vies), on repart aussitôt du début
//     du paysage en cours. Des cadeaux à ramasser, et un cœur de temps en temps.
//     Les paysages défilent : montagnes enneigées, forêt, campagne (bocage, moulins),
//     petites villes illuminées pour Noël, puis Montaigu.
//     Clins d'œil : une voiture de course rouge n° 95 qui double à toute allure (« Ka-chow ! »),
//     une vieille dépanneuse rouillée sur le bas-côté, la station-service « Radiator Springs ».
//  3. Arrivée : le bus ralentit et s'arrête à Montaigu, puis l'écran de victoire et le quatrième indice.
//  4. Ismae et Georges descendent du bus à Montaigu (carte-montaigu.js, zone à venir).
// =====================================================================
'use strict';

const Bus = (() => {
  const Q = Scenes.quete;
  Q.bus = 'aVenir'; // 'aVenir' → 'depart' → 'route' → 'victoire' → 'gagne'
  const $ = (id) => document.getElementById(id);
  const LONGUEUR = 18000, KM = 128; // longueur du trajet (pixels) et distance affichée (km)
  const PAYSAGES = [
    { id: 'montagne', debut: 0, nom: 'les montagnes' }, { id: 'foret', debut: 0.18, nom: 'la forêt' },
    { id: 'campagne', debut: 0.38, nom: 'la campagne' }, { id: 'ville', debut: 0.65, nom: 'les petites villes' },
    { id: 'arrivee', debut: 0.9, nom: 'Montaigu' },
  ];
  const paysage = (f) => { let p = PAYSAGES[0]; for (const q of PAYSAGES) if (f >= q.debut) p = q; return p; };
  const LANE = 26, NL = 3;
  let E = null;

  // ------------------------------------------------------------ les sprites (vue du dessus, l'avant vers le haut)
  const SP = {};
  function mk(w, h, f) { const c = PX.canvas(w, h); f(PX.painter(c), c); return PX.outline(c, '#1d1626'); }
  function voiture(col, toit) {
    return mk(14, 24, (P) => {
      for (const [x, y] of [[0, 4], [12, 4], [0, 17], [12, 17]]) P.rect(x, y, 2, 4, '#1d1a22');
      P.rect(1, 1, 12, 22, col); P.rect(2, 0, 10, 1, col); P.rect(2, 23, 10, 1, col);
      P.rect(2, 5, 10, 4, '#9ac8e8'); P.hline(3, 5, 8, '#d8f0ff'); P.rect(3, 9, 8, 8, toit || PX.shade(col, 0.18)); P.rect(2, 17, 10, 3, '#5a7aa0');
      P.px(2, 1, '#fff6c0'); P.px(11, 1, '#fff6c0'); P.px(2, 22, '#d8323a'); P.px(11, 22, '#d8323a'); P.vline(1, 3, 18, PX.shade(col, 0.3));
    });
  }
  function init() {
    if (SP.bus) return;
    SP.bus = mk(20, 46, (P) => {
      for (const y of [8, 34]) { P.rect(0, y, 2, 6, '#1d1a22'); P.rect(18, y, 2, 6, '#1d1a22'); }
      P.rect(1, 1, 18, 44, '#f2f2f6'); P.rect(2, 0, 16, 1, '#f2f2f6');
      P.rect(2, 2, 16, 5, '#3a4a6a'); P.hline(3, 2, 14, '#8ab0d8'); P.px(1, 3, '#1d1a22'); P.px(18, 3, '#1d1a22');
      for (let y = 9; y < 41; y += 5) { P.rect(1, y, 2, 3, '#3a4a6a'); P.rect(17, y, 2, 3, '#3a4a6a'); }
      P.vline(1, 8, 34, '#2f8a5a'); P.vline(18, 8, 34, '#2f8a5a');
      P.rect(6, 12, 8, 6, '#d8d8e0'); P.rect(6, 28, 8, 6, '#d8d8e0'); P.hline(6, 12, 8, '#ffffff'); P.hline(6, 28, 8, '#ffffff');
      P.rect(4, 42, 12, 3, '#3a4a6a'); P.px(2, 44, '#d8323a'); P.px(17, 44, '#d8323a'); P.px(3, 0, '#fff6c0'); P.px(16, 0, '#fff6c0');
      P.rect(8, 21, 4, 4, '#2f8a5a'); P.px(9, 22, '#ffffff'); P.px(10, 23, '#ffffff');
    });
    SP.voitures = [['#c8343a'], ['#3a6aa8'], ['#e8c040'], ['#4f8a5a'], ['#e8e8ec', '#c8c8d0'], ['#8a4a8a'], ['#2a2a32', '#4a4a58'], ['#e86a2a']].map(([c, t]) => voiture(c, t));
    SP.camion = mk(16, 40, (P) => {
      for (const y of [4, 28, 34]) { P.rect(0, y, 2, 4, '#1d1a22'); P.rect(14, y, 2, 4, '#1d1a22'); }
      P.rect(1, 1, 14, 10, '#c8343a'); P.rect(2, 3, 12, 3, '#9ac8e8'); P.rect(1, 12, 14, 27, '#e8e8ec'); P.hline(1, 12, 14, '#ffffff');
      for (let y = 15; y < 38; y += 4) P.hline(2, y, 12, '#c8c8d0'); P.rect(4, 20, 8, 8, '#3a6aa8'); P.px(7, 23, '#ffffff'); P.px(8, 24, '#ffffff');
    });
    SP.tracteur = mk(16, 22, (P) => {
      P.rect(0, 12, 4, 9, '#1d1a22'); P.rect(12, 12, 4, 9, '#1d1a22'); P.rect(1, 2, 3, 5, '#1d1a22'); P.rect(12, 2, 3, 5, '#1d1a22');
      P.rect(4, 1, 8, 12, '#3f8a3a'); P.hline(4, 1, 8, '#6aaa4a'); P.rect(4, 12, 8, 8, '#2f6a2a'); P.rect(5, 14, 6, 4, '#9ac8e8'); P.px(9, 3, '#3a3646'); P.px(9, 2, '#8a8a9a');
    });
    SP.chasseNeige = mk(20, 30, (P) => {
      P.rect(0, 0, 20, 5, '#f2c230'); for (let x = 1; x < 20; x += 3) P.px(x, 2, '#1d1a22');
      for (const y of [8, 20]) { P.rect(1, y, 2, 6, '#1d1a22'); P.rect(17, y, 2, 6, '#1d1a22'); }
      P.rect(2, 5, 16, 24, '#e86a2a'); P.rect(4, 7, 12, 4, '#9ac8e8'); P.rect(8, 14, 4, 4, '#f2c230'); P.px(9, 15, '#ffffff');
    });
    SP.travaux = mk(30, 22, (P) => {
      for (let x = 0; x < 30; x++) P.rect(x, 6, 1, 5, Math.floor(x / 4) % 2 ? '#d8323a' : '#f4f4f8');
      P.rect(1, 11, 2, 6, '#2a2632'); P.rect(27, 11, 2, 6, '#2a2632');
      for (const x of [3, 13, 23]) { P.rect(x + 1, 15, 3, 6, '#f08a24'); P.hline(x + 1, 17, 3, '#ffffff'); P.rect(x, 20, 5, 2, '#2a2632'); }
      P.rect(9, 0, 12, 6, '#f2c230'); P.rect(10, 1, 10, 4, '#2a2632'); P.px(12, 2, '#f2c230'); P.px(15, 2, '#f2c230'); P.px(18, 2, '#f2c230');
    });
    SP.nid = mk(16, 9, (P) => { P.ellipse(8, 4, 7, 3, '#2a2a34'); P.ellipse(8, 4, 5, 2, '#1a1a22'); P.px(4, 2, '#6a6a78'); });
    SP.cerf = mk(14, 20, (P) => {
      P.rect(4, 6, 6, 12, '#8a6a4a'); P.rect(5, 16, 4, 3, '#f4ecdc'); P.rect(5, 2, 4, 5, '#8a6a4a'); P.px(6, 1, '#2a1a14'); P.px(7, 1, '#2a1a14');
      Objets.line(P, 5, 2, 1, -3, '#d8c49c'); Objets.line(P, 8, 2, 12, -3, '#d8c49c'); P.px(2, 0, '#d8c49c'); P.px(11, 0, '#d8c49c');
      P.px(4, 8, '#5a3a26'); P.px(9, 12, '#5a3a26');
    });
    SP.vache = mk(14, 22, (P) => {
      P.rect(2, 5, 10, 15, '#f4f4f8'); P.rect(3, 1, 8, 5, '#f4f4f8'); P.rect(4, 0, 6, 2, '#e8a0a8');
      P.rect(3, 8, 4, 4, '#1d1a22'); P.rect(8, 13, 3, 5, '#1d1a22'); P.px(2, 2, '#c8b890'); P.px(11, 2, '#c8b890'); P.px(7, 20, '#1d1a22');
    });
    SP.mcqueen = mk(14, 28, (P) => {
      for (const [x, y] of [[0, 4], [12, 4], [0, 19], [12, 19]]) P.rect(x, y, 2, 5, '#1d1a22');
      P.rect(1, 1, 12, 24, '#d8202a'); P.rect(0, 25, 14, 3, '#d8202a'); P.rect(2, 7, 10, 4, '#1d1a22'); P.hline(3, 7, 8, '#4a6a9a');
      P.rect(3, 12, 8, 6, '#e8303a'); Objets.line(P, 3, 20, 10, 14, '#f2c230'); P.px(5, 13, '#f2c230'); P.px(8, 13, '#f2c230');
      P.px(6, 15, '#ffffff'); P.px(7, 16, '#ffffff'); P.px(2, 1, '#fff6c0'); P.px(11, 1, '#fff6c0');
    });
    SP.martin = mk(18, 34, (P) => {
      for (const y of [6, 24]) { P.rect(0, y, 2, 5, '#1d1a22'); P.rect(16, y, 2, 5, '#1d1a22'); }
      P.rect(1, 2, 16, 12, '#8a5a3a'); P.rect(3, 4, 12, 4, '#9ac8e8'); P.px(5, 10, '#5a7a8a'); P.px(12, 11, '#5a7a8a'); P.rect(2, 9, 3, 3, '#6a4428');
      P.rect(2, 14, 14, 16, '#7a5034'); P.dither(2, 14, 14, 16, '#a86a3a', 5); P.rect(7, 16, 4, 14, '#3a3646'); P.vline(9, 30, 3, '#3a3646'); P.rect(8, 32, 3, 2, '#c9cfda');
    });
    SP.cadeau = mk(10, 10, (P) => { P.rect(0, 2, 10, 8, '#c8343a'); P.hline(0, 2, 10, '#e85a50'); P.vline(4, 2, 8, '#f2c230'); P.hline(0, 5, 10, '#f2c230'); P.px(3, 1, '#f2c230'); P.px(5, 1, '#f2c230'); P.px(2, 0, '#f2c230'); P.px(6, 0, '#f2c230'); });
    SP.coeur = PX.outline(PX.fromRows(['.rr.rr.', 'rRrrrrr', 'rRrrrrr', '.rrrrr.', '..rrr..', '...r...'], { r: '#ff4a6a', R: '#ffc4d0' }), '#3a1426');
    // le décor des bas-côtés
    SP.sapin = [0, 1, 2].map((k) => mk(16, 22, (P) => {
      P.rect(7, 18, 2, 4, '#4a3020');
      for (let j = 0; j < 18; j++) { const w = 1 + Math.floor(j * 0.42) + (j % 6 > 3 ? 1 : 0); P.rect(8 - w, j + 1, w * 2, 1, j % 6 > 3 ? '#1e4834' : '#27563e'); if (j % 6 === 0 && k > 0) P.rect(8 - w, j + 1, w * 2, 1, '#eef3fb'); }
      P.px(8, 0, k ? '#ffffff' : '#27563e');
    }));
    SP.sapinNoel = mk(16, 22, (P) => {
      P.rect(7, 18, 2, 4, '#4a3020'); for (let j = 0; j < 18; j++) { const w = 1 + Math.floor(j * 0.42); P.rect(8 - w, j + 1, w * 2, 1, '#27563e'); }
      for (const [x, y, c] of [[6, 6, '#d8323a'], [10, 9, '#f2c230'], [5, 12, '#3a6ad8'], [9, 15, '#d8323a'], [11, 14, '#f2c230'], [7, 16, '#f4f4f8']]) P.px(x, y, c);
      P.px(8, 0, '#f2c230'); P.rect(7, 1, 3, 1, '#f2c230');
    });
    SP.arbre = [0, 1].map((k) => mk(26, 26, (P) => {
      const r = PX.rng(40 + k);
      Foret.feuillage(P, r, 13, 12, 7, 6, 6, { bmin: 5, bvar: 3, automne: 0.3 });
      for (let x = 6; x < 20; x++) P.px(x, 6 + Math.round(Math.abs(Math.sin(x)) * 2), '#eef3fb');
    }));
    SP.chalet = mk(32, 28, (P) => {
      P.rect(2, 2, 28, 22, '#eef3fb'); P.hline(2, 2, 28, '#ffffff'); P.hline(2, 13, 28, '#c8d6ea'); P.dither(2, 14, 28, 10, '#d8e4f4', 6);
      P.rect(2, 24, 28, 4, '#7a4a2a'); P.rect(6, 24, 4, 3, '#ffcf72'); P.rect(20, 24, 4, 3, '#ffcf72'); P.rect(22, 0, 4, 6, '#8a7a6a');
    });
    SP.ferme = mk(36, 30, (P) => {
      P.rect(2, 2, 32, 22, '#b8584a'); for (let y = 4; y < 24; y += 3) P.hline(2, y, 32, '#9a4a3c'); P.hline(2, 12, 32, '#7a3a2c');
      for (let x = 2; x < 34; x += 2) P.px(x, 2 + (x % 4 ? 0 : 1), '#eef3fb');
      P.rect(2, 24, 32, 6, '#f0e8d8'); P.rect(8, 25, 4, 4, '#3a6aa8'); P.rect(24, 25, 4, 4, '#3a6aa8'); P.rect(16, 25, 4, 5, '#6a4428');
    });
    SP.maison = ['#b8584a', '#7a6a78', '#9a4a3c'].map((toit) => mk(30, 30, (P) => {
      P.rect(1, 1, 28, 20, toit); for (let y = 3; y < 21; y += 3) P.hline(1, y, 28, PX.shade(toit, -0.2)); P.hline(1, 10, 28, PX.shade(toit, -0.4));
      for (let x = 1; x < 29; x += 3) P.px(x, 1, '#eef3fb'); P.rect(20, 0, 4, 5, '#8a7a6a');
      P.rect(1, 21, 28, 9, '#f0e8d8'); P.rect(5, 23, 5, 5, '#ffcf72'); P.rect(20, 23, 5, 5, '#ffcf72'); P.rect(13, 23, 4, 7, '#3a4a8a');
      for (let x = 2; x < 29; x += 3) P.px(x, 21, ['#d8323a', '#f2c230', '#3a6ad8', '#4fc860'][x % 4]);
    }));
    SP.eglise = mk(34, 54, (P) => {
      P.rect(4, 22, 26, 30, '#e8e0cc'); P.rect(4, 22, 26, 4, '#7a6a78'); P.rect(12, 2, 10, 22, '#d8d0bc'); P.trap(12, 10, 10, 14, -2, 8, '#5a5068');
      P.rect(15, 8, 4, 6, '#ffcf72'); P.vline(17, -2, 4, '#e8b54a'); P.rect(14, 40, 6, 12, '#5a3a24'); P.rect(7, 30, 4, 8, '#ffcf72'); P.rect(23, 30, 4, 8, '#ffcf72');
    });
    SP.moulin = [0, 1, 2, 3].map((f) => mk(34, 40, (P) => {
      P.trap(12, 10, 8, 18, 14, 24, '#f0e8d8'); P.trap(10, 14, 10, 14, 10, 5, '#5a4a3a'); P.rect(15, 30, 4, 8, '#6a4428');
      const a = (f / 4) * Math.PI / 2;
      for (let k = 0; k < 4; k++) { const t = a + (k * Math.PI) / 2; Objets.line(P, 17, 13, 17 + Math.cos(t) * 15, 13 + Math.sin(t) * 12, '#6a4428', 2); Objets.line(P, 17 + Math.cos(t) * 5, 13 + Math.sin(t) * 4, 17 + Math.cos(t) * 15, 13 + Math.sin(t) * 12, '#f4efe6', 1); }
      P.ellipse(17, 13, 2, 2, '#3a2618');
    }));
    SP.rocher = mk(20, 14, (P) => { P.ellipse(10, 8, 9, 5, '#6a6a7a'); P.ellipse(9, 7, 7, 4, '#8a8a9a'); P.ellipse(8, 5, 6, 2, '#eef3fb'); P.px(14, 9, '#5a5a6a'); });
    SP.bonhomme = mk(12, 18, (P) => { P.ellipse(6, 13, 5, 4, '#f4f8ff'); P.ellipse(6, 6, 4, 3, '#f4f8ff'); P.px(5, 5, '#1d1626'); P.px(7, 5, '#1d1626'); P.px(6, 7, '#f08a24'); P.rect(3, 9, 6, 1, '#c8343a'); P.rect(4, 0, 4, 3, '#2a2632'); P.hline(3, 3, 6, '#2a2632'); });
    SP.botte = mk(18, 12, (P) => { P.ellipse(9, 6, 8, 5, '#d8b860'); P.ellipse(9, 6, 5, 3, '#c8a048'); P.ellipse(9, 6, 2, 1, '#b08838'); P.hline(3, 2, 12, '#eef3fb'); });
    SP.station = mk(60, 42, (P) => {
      P.rect(0, 0, 60, 18, '#e8e0cc'); P.rect(0, 0, 60, 3, '#d8323a'); P.hline(0, 3, 60, '#f2c230');
      Arendelle.texte(P, 'RADIATOR', 2, 5, '#3a6aa8'); Arendelle.texte(P, 'SPRINGS', 2, 11, '#3a6aa8'); P.rect(36, 5, 20, 10, '#ffcf72'); P.vline(46, 5, 10, '#e8e0cc');
      P.rect(4, 20, 52, 14, '#c8c8d0'); P.dither(4, 20, 52, 14, '#d8d8e0', 6); P.rect(4, 18, 52, 3, '#d8323a');
      for (const x of [12, 28, 44]) { P.rect(x, 24, 5, 8, '#d8323a'); P.rect(x + 1, 25, 3, 3, '#f4f4f8'); }
      P.rect(0, 36, 14, 6, '#3a6aa8'); Arendelle.texte(P, '66', 3, 37, '#ffffff');
    });
    SP.panneauRoute = (txt) => mk(Math.max(24, Arendelle.largeurTexte(txt) + 8), 20, (P, c) => {
      const w = c.width; P.rect(0, 0, w, 11, '#2f8a5a'); P.rect(1, 1, w - 2, 9, '#2f8a5a'); P.hline(1, 1, w - 2, '#ffffff'); P.hline(1, 9, w - 2, '#ffffff');
      Arendelle.texte(P, txt, 4, 3, '#ffffff'); P.rect((w >> 1) - 1, 11, 2, 9, '#8a8a9a');
    });
    SP.entreeVille = (txt) => mk(Math.max(28, Arendelle.largeurTexte(txt) + 10), 22, (P, c) => {
      const w = c.width; P.rect(0, 0, w, 13, '#d8323a'); P.rect(2, 2, w - 4, 9, '#f4f4f8'); Arendelle.texte(P, txt, 5, 4, '#1d1626');
      P.rect(3, 13, 2, 9, '#8a8a9a'); P.rect(w - 5, 13, 2, 9, '#8a8a9a');
    });
    SP.arret = mk(30, 24, (P) => { P.rect(0, 0, 22, 4, '#2a3a5a'); P.rect(1, 4, 20, 14, 'rgba(180,220,255,0.5)'); P.rect(24, 0, 2, 24, '#5a6a8a'); P.ellipse(25, 2, 4, 4, '#f2c230'); P.rect(4, 14, 14, 3, '#6a7a9a'); });
  }

  // ------------------------------------------------------------ fonds (sol de chaque paysage, une tuile qui défile)
  const SOLS = {};
  function sol(id, w) {
    const cle = id + w;
    if (SOLS[cle]) return SOLS[cle];
    const T = 256, c = PX.canvas(w, T), P = PX.painter(c), r = PX.rng(id.length * 31);
    const base = { montagne: '#e8eef8', foret: '#3a5a3a', campagne: '#5a7a44', ville: '#e2e8f2', arrivee: '#e2e8f2' }[id];
    P.rect(0, 0, w, T, base);
    if (id === 'montagne') P.speckle(0, 0, w, T, ['#ffffff', '#d4e0f0', '#c8d6ea'], 0.12, r);
    else if (id === 'foret') { P.speckle(0, 0, w, T, ['#2f4a30', '#4a6a44', '#e8eef8'], 0.2, r); for (let k = 0; k < 40; k++) P.ellipse(r.int(w), r.int(T), 5 + r.int(12), 2 + r.int(3), 'rgba(238,243,251,0.4)'); }
    else if (id === 'campagne') { P.speckle(0, 0, w, T, ['#6a8a4e', '#4a6a3a', '#7a6a44', '#eef3fb'], 0.15, r); for (let y = 0; y < T; y += 8) P.hline(0, y, w, 'rgba(60,80,40,0.25)'); }
    else { // jardins enneigés, petites clôtures et haies
      P.speckle(0, 0, w, T, ['#f4f8ff', '#d0dae8', '#c8d4e4'], 0.12, r);
      for (let k = 0; k < 26; k++) { const x = r.int(w), y = r.int(T), l = 20 + r.int(40); for (let i = 0; i < l; i += 3) { P.rect(x + i, y, 1, 3, '#8a6a4a'); } P.hline(x, y + 1, l, '#a88a6a'); }
      for (let k = 0; k < 18; k++) { const x = r.int(w), y = r.int(T); P.ellipse(x, y, 5 + r.int(4), 3, '#3a5a3a'); P.ellipse(x - 1, y - 1, 4, 2, '#eef3fb'); }
    }
    return (SOLS[cle] = c);
  }

  // ------------------------------------------------------------ déroulement
  function lancer(J, depuis = 0) {
    init();
    E = {
      J, d: depuis * LONGUEUR, v: 0, vies: 3, cadeaux: E ? E.cadeaux : 0, voie: 1, x: 1, invul: 1.2, t: 0, phase: 'route', obstacles: [], decor: [], messages: [],
      prochain: depuis * LONGUEUR + 260, prochainDecor: depuis * LONGUEUR - 40, champs: [], sur: 1, gauche: 0, droite: 0, repete: 0, secousse: 0, finT: 0,
      evts: { mcqueen: [0.27, 0.72], martin: 0.48, station: 0.56, panneaux: [0.08, 0.3, 0.5, 0.7, 0.86] }, faits: new Set(), flash: 0,
    };
    J.vue = vue;
    document.body.classList.add('route');
    $('route').hidden = false;
    majHud();
    message(depuis ? `On repart de ${paysage(depuis).nom} !` : 'En route ! Évite les obstacles.');
    const doigt = matchMedia('(pointer: coarse)').matches;
    $('route-aide-g').textContent = doigt ? '◀ glisse le doigt' : '◀ flèche gauche';
    $('route-aide-d').textContent = doigt ? 'pour changer de file ▶' : 'flèche droite ▶';
  }
  function message(t, k = 'info') {
    const m = $('route-message');
    m.hidden = !t; if (!t) return;
    m.textContent = t; m.className = k;
    m.classList.remove('arrive'); void m.offsetWidth; m.classList.add('arrive');
    clearTimeout(message.t); message.t = setTimeout(() => { m.hidden = true; }, 2200);
  }
  function majHud() {
    if (!E) return;
    const f = Math.min(1, E.d / LONGUEUR);
    $('route-vies').textContent = '♥'.repeat(E.vies) + '♡'.repeat(3 - E.vies);
    $('route-km').textContent = `Montaigu : ${Math.max(0, Math.round(KM * (1 - f)))} km`;
    $('route-cadeaux').textContent = `🎁 ${E.cadeaux}`;
    $('route-progres').style.setProperty('--f', f.toFixed(3));
  }

  // ------------------------------------------------------------ génération des obstacles et du décor
  function geometrie(V) {
    const w = V.w, h = V.h, rx = Math.round(w / 2 - (LANE * NL) / 2);
    return { w, h, rx, rw: LANE * NL, busY: h - 54, laneX: (k) => rx + LANE * k + LANE / 2 };
  }
  function obstacleDe(f) {
    const p = paysage(f).id, r = Math.random();
    if (p === 'montagne') return r < 0.55 ? 'voiture' : r < 0.75 ? 'chasseNeige' : r < 0.9 ? 'travaux' : 'nid';
    if (p === 'foret') return r < 0.5 ? 'voiture' : r < 0.68 ? 'cerf' : r < 0.84 ? 'camion' : 'travaux';
    if (p === 'campagne') return r < 0.38 ? 'voiture' : r < 0.6 ? 'tracteur' : r < 0.76 ? 'vache' : r < 0.9 ? 'camion' : 'nid';
    return r < 0.62 ? 'voiture' : r < 0.82 ? 'travaux' : r < 0.94 ? 'camion' : 'nid';
  }
  const VITESSES = { voiture: [10, 22], camion: [8, 16], tracteur: [3, 8], chasseNeige: [4, 10], travaux: [0, 0], nid: [0, 0], cerf: [0, 0], vache: [0, 0] };
  function creerObstacle(type, voie, y) {
    const [a, b] = VITESSES[type];
    const img = type === 'voiture' ? SP.voitures[Math.floor(Math.random() * SP.voitures.length)] : SP[type];
    return { type, voie, y, vit: a + Math.random() * (b - a), img };
  }
  function generer() {
    const f = E.d / LONGUEUR;
    // les obstacles : une « file sûre » qui ne bouge que d'une file à la fois (et avec assez de place pour changer),
    // jamais d'obstacle dessus ; une ou deux autres files bloquées ; de plus en plus serré
    while (E.prochain < E.d + 420) {
      const y = E.prochain, fy = y / LONGUEUR;
      let ecart = Math.max(108, 175 - 70 * fy) + Math.random() * 45;
      if (fy < 0.94) {
        if (Math.random() < 0.45) { const n = E.sur + (Math.random() < 0.5 ? -1 : 1); if (n >= 0 && n < NL) { E.sur = n; ecart += 80; } }
        const autres = [0, 1, 2].filter((v) => v !== E.sur).sort(() => Math.random() - 0.5);
        const deux = fy > 0.12 && Math.random() < 0.26 + fy * 0.34;
        const poses = autres.slice(0, deux ? 2 : 1).map((v) => { const o = creerObstacle(obstacleDe(fy), v, y + Math.random() * 14); E.obstacles.push(o); return o; });
        // une voiture seule peut déboîter vers l'autre file bloquée (jamais vers la file sûre)
        const o = poses[0], cible = autres[1];
        if (!deux && o.type === 'voiture' && fy > 0.15 && Math.abs(cible - o.voie) === 1 && Math.random() < 0.35 + fy * 0.3) o.deboite = { vers: cible, t: 0 };
        if (Math.random() < 0.18) E.obstacles.push({ type: E.vies < 3 && Math.random() < 0.35 ? 'coeur' : 'cadeau', voie: E.sur, y: y + 6, vit: 0, img: null });
      }
      E.prochain += ecart;
    }
    // le décor des bas-côtés
    const G = geometrie(E.J.V);
    while (E.prochainDecor < E.d + 420) {
      const y = E.prochainDecor, p = paysage(y / LONGUEUR).id;
      // la campagne vendéenne : des champs bordés de haies (le bocage), sous le reste du décor
      if (p === 'campagne' && Math.random() < 0.5) for (const cote of [-1, 1]) {
        const cw = 50 + Math.random() * 70, ch = 40 + Math.random() * 50, cx0 = cote < 0 ? G.rx - 30 - cw - Math.random() * 60 : G.rx + G.rw + 30 + Math.random() * 60;
        E.champs.push({ x: cx0, y, w: cw, h: ch, col: ['#7a8a4a', '#9a8a5a', '#5a7a3e', '#8a9a5a', '#b8a868'][Math.floor(Math.random() * 5)], sillons: Math.random() < 0.5 });
      }
      // dans les petites villes : deux rangées de maisons bien alignées le long de la route, des sapins décorés entre elles
      if (p === 'ville' || p === 'arrivee') {
        for (const cote of [-1, 1]) for (const loin of [42, 104 + Math.random() * 16]) {
          if (Math.random() < 0.15) continue;
          const img = Math.random() < 0.82 ? SP.maison[Math.floor(Math.random() * 3)] : Math.random() < 0.6 ? SP.sapinNoel : SP.eglise;
          E.decor.push({ img, x: cote < 0 ? G.rx - loin : G.rx + G.rw + loin, y: y + Math.random() * 4 });
        }
        for (const cote of [-1, 1]) E.decor.push({ img: null, lampe: true, x: cote < 0 ? G.rx - 14 : G.rx + G.rw + 14, y: y + 18 });
        E.prochainDecor += 38;
        continue;
      }
      for (const cote of [-1, 1]) for (let n = 0; n < (p === 'foret' ? 2 : 1); n++) {
        const loin = (p === 'foret' ? 8 : 24) + Math.random() * (G.rx - 34);
        const x = cote < 0 ? G.rx - loin : G.rx + G.rw + loin;
        const choix = {
          montagne: () => { const q = Math.random(); return q < 0.7 ? SP.sapin[1 + (Math.random() < 0.5 ? 1 : 0)] : q < 0.82 ? SP.rocher : q < 0.94 ? SP.chalet : SP.bonhomme; },
          foret: () => (Math.random() < 0.55 ? SP.arbre[Math.random() < 0.5 ? 0 : 1] : SP.sapin[Math.random() < 0.5 ? 0 : 1]),
          campagne: () => { const q = Math.random(); return q < 0.3 ? SP.botte : q < 0.5 ? SP.vache : q < 0.62 ? SP.moulin : q < 0.78 ? SP.ferme : SP.arbre[0]; },
          ville: () => (Math.random() < 0.7 ? SP.maison[Math.floor(Math.random() * 3)] : Math.random() < 0.6 ? SP.sapinNoel : SP.eglise),
          arrivee: () => (Math.random() < 0.8 ? SP.maison[Math.floor(Math.random() * 3)] : SP.sapinNoel),
        }[p]();
        E.decor.push({ img: choix, x, y: y + Math.random() * 30, anime: choix === SP.moulin });
        if (p === 'ville' || p === 'arrivee') E.decor.push({ img: null, lampe: true, x: cote < 0 ? G.rx - 14 : G.rx + G.rw + 14, y: y + 40 });
      }
      E.prochainDecor += { montagne: 38, foret: 30, campagne: 44, ville: 46, arrivee: 46 }[p] + Math.random() * 20;
    }
    // les clins d'œil : panneaux kilométriques, la voiture de course, la dépanneuse, la station-service
    const evt = (cle, fx, faire) => { if (!E.faits.has(cle) && f >= fx) { E.faits.add(cle); faire(); } };
    E.evts.panneaux.forEach((fx, k) => evt('p' + k, fx - 0.03, () => E.decor.push({ img: SP.panneauRoute(`MONTAIGU ${Math.round(KM * (1 - fx))}`), x: G.rx + G.rw + 22, y: fx * LONGUEUR })));
    evt('sortie', -1, () => E.decor.push({ img: SP.entreeVille('ARENDELLE'), x: G.rx + G.rw + 24, y: E.d + 120, barre: true }));
    E.evts.mcqueen.forEach((fx, k) => evt('m' + k, fx, () => { E.course = { y: E.d - 80, vit: 0 }; message('Ka-chow !', 'course'); Musique.vroum(); }));
    evt('martin', E.evts.martin - 0.03, () => E.decor.push({ img: SP.martin, x: G.rx + G.rw + 16, y: E.evts.martin * LONGUEUR, martin: true }));
    evt('station', E.evts.station - 0.03, () => E.decor.push({ img: SP.station, x: G.rx - 46, y: E.evts.station * LONGUEUR }));
    evt('montaigu', 0.9, () => { E.decor.push({ img: SP.entreeVille('MONTAIGU'), x: G.rx + G.rw + 24, y: 0.93 * LONGUEUR }); E.decor.push({ img: SP.arret, x: G.rx + G.rw + 20, y: LONGUEUR + 200, arret: true }); });
  }

  // ------------------------------------------------------------ boucle
  function changerVoie(s) {
    const n = Math.max(0, Math.min(NL - 1, E.voie + s));
    if (n !== E.voie) { E.voie = n; Musique.bip(s < 0 ? 520 : 620, 0.02); }
  }
  function update(dt, J) {
    if (!E) return;
    E.t += dt;
    if (E.secousse > 0) E.secousse -= dt;
    if (E.flash > 0) E.flash -= dt;
    const f = Math.min(1, E.d / LONGUEUR);
    // le clavier (ou le joystick) : un appui = une file ; maintenu, ça recommence
    const ix = J.input.x;
    if (E.phase === 'route') {
      if (ix < -0.5 || ix > 0.5) { if (E.repete <= 0) { changerVoie(ix < 0 ? -1 : 1); E.repete = E.repete === 0 ? 0.32 : 0.16; } else E.repete -= dt; }
      else E.repete = 0;
    }
    E.x += (E.voie - E.x) * Math.min(1, dt * 14);
    // la vitesse : de plus en plus vite, puis on ralentit pour l'arrivée
    const cible = E.phase === 'route' ? 140 + 115 * f : 0;
    E.v += (cible - E.v) * Math.min(1, dt * (E.phase === 'route' ? 1.5 : 1.1));
    E.d += E.v * dt;
    if (E.invul > 0) E.invul -= dt;
    generer();
    for (const o of E.obstacles) {
      o.y += o.vit * dt;
      // la voiture qui déboîte : clignotant, puis elle change de file
      const db = o.deboite;
      if (db && db.t < 1) { const dy = o.y - E.d; if (dy < 250) db.cl = true; if (dy < 185) { db.t = Math.min(1, db.t + dt * 2.2); if (db.t >= 0.5 && o.voie !== db.vers) { db.de = o.voie; o.voie = db.vers; } } }
    }
    if (E.course) { E.course.vit = E.v + 260; E.course.y += E.course.vit * dt; if (E.course.y > E.d + 600) E.course = null; }
    // collisions
    if (E.phase === 'route') {
      for (const o of E.obstacles) {
        if (o.pris) continue;
        // l'obstacle touche le bus quand leurs deux rectangles se chevauchent (le bus fait 46 pixels de long)
        const dy = o.y - E.d, haut = o.img ? o.img.height - 2 : 10;
        if (Math.abs(o.voie - E.x) > 0.55 || dy >= -3 || dy <= -(44 + haut)) continue;
        if (o.type === 'cadeau') { o.pris = true; E.cadeaux++; Musique.trouve(); majHud(); continue; }
        if (o.type === 'coeur') { o.pris = true; E.vies = Math.min(3, E.vies + 1); Musique.trouve(); message('Une vie en plus !', 'bonus'); majHud(); continue; }
        if (E.invul > 0) continue;
        o.pris = true; o.choc = 0.01; (E.chocs || (E.chocs = [])).push(o.type);
        E.vies--; E.invul = 1.6; E.secousse = 0.4; E.flash = 0.25;
        Musique.choc(); majHud();
        if (E.vies <= 0) { E.phase = 'panne'; E.finT = 0; message('Le bus est en panne ! On repart…', 'panne'); }
        else message(['Ouille !', 'Attention !', 'Ça secoue !'][E.vies % 3], 'choc');
      }
      if (E.d >= LONGUEUR) { E.phase = 'arrivee'; E.finT = 0; message('Montaigu !', 'bonus'); Musique.victoireCourte(); }
    } else if (E.phase === 'panne') {
      E.finT += dt;
      if (E.finT > 1.6) { const p = paysage(f); const garde = E.cadeaux; lancer(J, p.debut); E.cadeaux = garde; majHud(); }
    } else if (E.phase === 'arrivee') {
      E.finT += dt;
      if (E.v < 3 && E.finT > 2.2) { fermer(); return; }
    }
    E.obstacles = E.obstacles.filter((o) => o.y > E.d - 120 && !(o.pris && (o.type === 'cadeau' || o.type === 'coeur')));
    E.decor = E.decor.filter((o) => o.y > E.d - 160);
    E.champs = E.champs.filter((o) => o.y > E.d - 200);
    majHudLeger(f);
  }
  let dernierKm = -1;
  function majHudLeger(f) { const km = Math.round(KM * (1 - f)); if (km !== dernierKm) { dernierKm = km; majHud(); } }

  // ------------------------------------------------------------ dessin
  function draw(g, V, t) {
    if (!E) return;
    const G = geometrie(V), { w, h, rx, rw, busY } = G, f = E.d / LONGUEUR;
    const sy = (yMonde) => Math.round(busY - (yMonde - E.d)); // position à l'écran d'un point de la route
    const dx = E.secousse > 0 ? Math.round((Math.random() - 0.5) * 4) : 0;
    g.save(); g.translate(dx, 0);
    // le sol, par bandes : chaque bande prend le paysage de son endroit du trajet
    for (let y = -8; y < h + 8; y += 8) {
      const ym = E.d + (busY - y), p = paysage(Math.max(0, ym) / LONGUEUR).id, tuile = sol(p, w);
      const ty = ((Math.floor(ym) % 256) + 256) % 256;
      g.drawImage(tuile, 0, Math.max(0, 255 - ty - 7), w, 8, 0, y, w, 8);
    }
    // les champs du bocage
    for (const c of E.champs) {
      const y = sy(c.y);
      if (y < -10 || y - c.h > h + 10) continue;
      g.fillStyle = '#3a5a2e'; g.fillRect(Math.round(c.x) - 2, y - c.h - 2, Math.round(c.w) + 4, c.h + 4);
      g.fillStyle = c.col; g.fillRect(Math.round(c.x), y - c.h, Math.round(c.w), c.h);
      g.fillStyle = 'rgba(40,30,20,0.18)'; if (c.sillons) for (let yy = y - c.h + 2; yy < y; yy += 4) g.fillRect(Math.round(c.x), yy, Math.round(c.w), 1);
      g.fillStyle = 'rgba(238,243,251,0.45)'; for (let k = 0; k < 6; k++) g.fillRect(Math.round(c.x + (k * 37) % c.w), y - c.h + ((k * 23) % c.h), 6, 2);
      g.fillStyle = '#2f4a26'; for (let x = c.x; x < c.x + c.w; x += 5) { g.fillRect(Math.round(x), y - c.h - 3, 3, 3); g.fillRect(Math.round(x), y, 3, 2); }
    }
    // la route : bas-côtés, bitume, lignes
    const pAct = paysage(f).id, neigeuse = pAct === 'montagne' || pAct === 'foret';
    g.fillStyle = pAct === 'ville' || pAct === 'arrivee' ? '#9a9eac' : neigeuse ? '#dfe6f2' : '#8a8a74'; g.fillRect(rx - 10, 0, 10, h); g.fillRect(rx + rw, 0, 10, h);
    g.fillStyle = '#4a4a58'; g.fillRect(rx, 0, rw, h);
    g.fillStyle = '#545464'; for (let k = 0; k < 40; k++) g.fillRect(rx + ((k * 37) % rw), ((k * 53 + Math.floor(E.d)) % h), 2, 1);
    g.fillStyle = '#f4f4f8'; g.fillRect(rx + 1, 0, 1, h); g.fillRect(rx + rw - 2, 0, 1, h);
    for (let k = 1; k < NL; k++) for (let y = -24 + (Math.floor(E.d) % 24); y < h; y += 24) g.fillRect(rx + k * LANE, y, 1, 12);
    if (neigeuse) { g.fillStyle = '#eef3fb'; for (let y = -16 + (Math.floor(E.d) % 16); y < h; y += 16) { g.fillRect(rx, y, 3, 6); g.fillRect(rx + rw - 3, y + 8, 3, 5); } }
    const defile = (pas) => -pas + (Math.floor(E.d) % pas);
    if (pAct === 'montagne') { // jalons à neige rouges et blancs
      for (let y = defile(48); y < h + 48; y += 48) for (const x of [rx - 8, rx + rw + 6]) { g.fillStyle = '#1d1626'; g.fillRect(x - 1, y - 13, 4, 14); for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#f4f4f8' : '#d8323a'; g.fillRect(x, y - 12 + k * 3, 2, 3); } }
    }
    if (pAct === 'montagne' || pAct === 'foret') { // la glissière de sécurité
      g.fillStyle = '#8a92a4'; g.fillRect(rx + rw + 11, 0, 2, h); g.fillStyle = '#c8d0dc'; g.fillRect(rx + rw + 11, 0, 1, h);
      g.fillStyle = '#5a6278'; for (let y = defile(20); y < h + 20; y += 20) g.fillRect(rx + rw + 12, y, 2, 4);
    }
    if (pAct === 'campagne') { // poteaux télégraphiques et leurs fils
      const xs = rx - 22;
      g.fillStyle = 'rgba(30,30,40,0.6)'; g.fillRect(xs + 1, 0, 1, h); g.fillRect(xs + 5, 0, 1, h);
      for (let y = defile(90); y < h + 90; y += 90) { g.fillStyle = '#5a3a22'; g.fillRect(xs, y - 20, 3, 20); g.fillRect(xs - 2, y - 18, 9, 2); g.fillStyle = 'rgba(20,10,40,0.25)'; g.fillRect(xs + 3, y - 2, 8, 2); }
    }
    if (pAct === 'ville' || pAct === 'arrivee') { // trottoirs, bordures, passages piétons
      g.fillStyle = '#b8bcc8'; g.fillRect(rx - 22, 0, 12, h); g.fillRect(rx + rw + 10, 0, 12, h);
      g.fillStyle = '#e8ecf4'; g.fillRect(rx - 11, 0, 1, h); g.fillRect(rx + rw + 10, 0, 1, h);
      g.fillStyle = '#a4a8b4'; for (let y = defile(12); y < h + 12; y += 12) { g.fillRect(rx - 22, y, 12, 1); g.fillRect(rx + rw + 10, y, 12, 1); }
      g.fillStyle = '#f4f4f8'; for (let y = defile(420); y < h + 420; y += 420) for (let x = rx + 3; x < rx + rw - 3; x += 7) g.fillRect(x, y, 4, 14);
    }
    // le décor des bas-côtés (du plus loin au plus proche)
    const decor = E.decor.slice().sort((a, b) => b.y - a.y);
    for (const o of decor) {
      const y = sy(o.y);
      if (y < -70 || y > h + 40) continue;
      if (o.lampe) { g.fillStyle = '#2a2632'; g.fillRect(o.x, y - 14, 2, 14); g.fillStyle = '#ffd27a'; g.fillRect(o.x - 1, y - 17, 4, 3); g.globalAlpha = 0.25; g.fillStyle = '#ffd27a'; g.fillRect(o.x - 5, y - 21, 12, 10); g.globalAlpha = 1; continue; }
      const img = o.anime ? SP.moulin[Math.floor(t * 4) % 4] : o.img;
      g.fillStyle = 'rgba(30,20,60,0.22)'; g.fillRect(Math.round(o.x - img.width / 2 + 3), y - 2, img.width - 2, 3);
      g.drawImage(img, Math.round(o.x - img.width / 2), y - img.height);
      if (o.martin && y > 20 && y < h - 20) { g.fillStyle = '#fff8e8'; g.fillRect(Math.round(o.x - 10), y - img.height - 12, 46, 9); g.fillStyle = '#1d1626'; Arendelle.texte(PX.painter(g.canvas), 'SALUT POTE', Math.round(o.x - 8), y - img.height - 10, '#1d1626'); }
    }
    // les obstacles et les bonus
    for (const o of E.obstacles) {
      const y = sy(o.y);
      if (y < -60 || y > h + 40) continue;
      let x = G.laneX(o.voie);
      const db = o.deboite;
      if (db && db.t > 0 && db.t < 1) x = db.de === undefined ? x + (G.laneX(db.vers) - x) * db.t : x + (G.laneX(db.de) - x) * (1 - db.t); // en train de déboîter
      if (o.type === 'cadeau' || o.type === 'coeur') {
        if (o.pris) continue;
        const img = o.type === 'cadeau' ? SP.cadeau : SP.coeur, b = Math.round(Math.sin(t * 6 + o.y) * 1.5);
        g.drawImage(img, Math.round(x - img.width / 2), y - img.height + b);
        continue;
      }
      if (o.choc) { o.choc += 1 / 60; g.globalAlpha = Math.max(0, 1 - o.choc * 1.5); }
      g.drawImage(o.img, Math.round(x - o.img.width / 2 + (o.choc ? o.choc * 30 * (o.voie === 0 ? -1 : 1) : 0)), y - o.img.height);
      g.globalAlpha = 1;
      if (db && db.cl && db.t < 1 && Math.floor(t * 6) % 2) { // le clignotant orange, du côté où elle va
        const cote = db.vers > (db.de ?? o.voie) ? 1 : -1;
        g.fillStyle = '#ffa020'; g.fillRect(Math.round(x + cote * 7) - 1, y - o.img.height + 2, 2, 2); g.fillRect(Math.round(x + cote * 7) - 1, y - 4, 2, 2);
      }
    }
    // la voiture de course rouge qui double sur le bas-côté gauche
    if (E.course) { const y = sy(E.course.y); g.drawImage(SP.mcqueen, rx - 12, y - 28); g.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = 1; k < 4; k++) g.fillRect(rx - 8 + k, y + k * 5, 1, 4); }
    // le bus
    const bx = Math.round(G.laneX(0) + LANE * E.x - SP.bus.width / 2);
    if (!(E.invul > 0 && E.phase === 'route' && Math.floor(E.t * 12) % 2)) g.drawImage(SP.bus, bx, busY);
    if (E.v > 150) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(bx + 3, busY + 47, 1, 4); g.fillRect(bx + 16, busY + 47, 1, 4); }
    // guirlandes lumineuses au-dessus des rues des petites villes
    if (pAct === 'ville' || pAct === 'arrivee') for (let y = -40 + (Math.floor(E.d) % 120); y < h; y += 120) {
      for (let x = rx - 12; x < rx + rw + 12; x += 2) { const yy = y + Math.round(Math.sin((x - rx + 12) / (rw + 24) * Math.PI) * 6); g.fillStyle = '#2a2632'; g.fillRect(x, yy, 2, 1); if ((x >> 1) % 3 === 0) { g.fillStyle = ['#ff6a5a', '#ffd24a', '#7ad0ff', '#7aff9a'][(x >> 1) % 4]; g.fillRect(x, yy + 1, 2, 2); } }
    }
    // la neige qui tombe (plus fort dans les montagnes)
    const n = pAct === 'montagne' ? 70 : pAct === 'campagne' ? 25 : 45;
    g.fillStyle = '#f4f6ff';
    for (let k = 0; k < n; k++) { const x = Math.round((k * 97.3 + Math.sin(t + k) * 6) % w), y = Math.round((k * 53.7 + t * (30 + (k % 4) * 10) + E.d * 0.6) % h); g.fillRect(x, y, k % 4 ? 1 : 2, k % 4 ? 1 : 2); }
    if (E.flash > 0) { g.fillStyle = `rgba(255,80,80,${(E.flash * 1.2).toFixed(2)})`; g.fillRect(0, 0, w, h); }
    g.restore();
  }

  // ------------------------------------------------------------ commandes tactiles : on glisse le doigt
  // vers la gauche → une file à gauche ; vers la droite → une file à droite ; sans glisser, on reste.
  // (un glissement = une file ; il faut glisser franchement plus loin pour en changer une deuxième,
  //  et revenir un peu en arrière suffit pour revenir dans sa file) — les distances sont en pixels de l'écran
  function pointeur(type, pos, e) {
    if (!E) return;
    const x = e ? e.clientX : pos.x;
    if (type === 'down') { E.glisse = { x, bout: x, sens: 0 }; return; }
    if (type === 'up') { E.glisse = null; return; }
    const g = E.glisse;
    if (!g || E.phase !== 'route') return;
    const bouger = (s) => { changerVoie(s); g.x = g.bout = x; g.sens = s; };
    if (g.sens && (x - g.bout) * g.sens > 0) g.bout = x;
    const dx = x - g.x;
    if (!g.sens) { if (Math.abs(dx) >= 16) bouger(Math.sign(dx)); }
    else if ((x - g.bout) * g.sens <= -16) bouger(-g.sens);
    else if (dx * g.sens >= 80) bouger(g.sens);
  }
  function fermer() {
    const { J } = E;
    J.vue = null; E = null;
    document.body.classList.remove('route');
    $('route').hidden = true;
    victoire(J);
  }
  const vue = { update, draw, pointeur };

  // ------------------------------------------------------------ les scènes : le départ à Arendelle
  // le bus vu de côté, pour les scènes dans les rues
  let busCote = null;
  function dessinBusCote() {
    if (busCote) return busCote;
    const c = PX.canvas(70, 34), P = PX.painter(c);
    P.rect(2, 4, 66, 22, '#f2f2f6'); P.rect(2, 2, 62, 3, '#e2e2e8'); P.rect(64, 6, 4, 18, '#d8d8e0');
    P.rect(2, 18, 66, 3, '#2f8a5a'); P.hline(2, 4, 66, '#ffffff');
    for (let x = 6; x < 54; x += 10) { P.rect(x, 7, 8, 8, '#3a4a6a'); P.px(x + 1, 8, '#8ab0d8'); }
    P.rect(56, 7, 10, 10, '#3a4a6a'); P.px(57, 8, '#8ab0d8'); P.rect(58, 2, 8, 3, '#1d1a22'); Arendelle.texte(P, 'MONTAIGU', 26, -1 + 3 - 2, '#f2c230');
    P.rect(46, 7, 6, 17, '#2a3a5a'); P.vline(49, 7, 17, '#4a5a7a');
    for (const x of [14, 56]) { P.ellipse(x, 26, 5, 5, '#1d1a22'); P.ellipse(x, 26, 2, 2, '#8a8a9a'); }
    P.rect(66, 18, 2, 2, '#fff6c0'); P.px(2, 18, '#d8323a');
    return (busCote = PX.outline(c, '#1d1626'));
  }
  function objetBus(C, x, y) {
    const b = { x, y, porte: 0, visible: true, get sortY() { return this.y; },
      update() {}, draw(g) {
        if (!this.visible) return;
        Entites.ombre(g, this.x, this.y, 34);
        const img = dessinBusCote(); g.drawImage(img, Math.round(this.x - 35), Math.round(this.y - 32));
        if (this.porte > 0) { g.fillStyle = '#ffcf72'; g.fillRect(Math.round(this.x + 12), Math.round(this.y - 24), 5, 17); }
      } };
    C.dynamiques.push(b);
    return b;
  }

  function depart(J) {
    if (Q.bus !== 'aVenir' && Q.bus !== 'depart') return;
    Q.bus = 'depart';
    const p = J.joueur, G = J.georges, C = J.carte, B = CONFIG.route;
    const bus = objetBus(C, 1720, 1186);
    J.cinematique = true;
    J.jouerScript([
      { dire: B.attente },
      { faire: () => { Musique.klaxon(); } },
      { jusqua: (j) => { bus.x -= 70 * j.dt; return bus.x <= 1548; } },
      { faire: () => { bus.porte = 1; Musique.porte(); } },
      { attendre: 0.4 },
      { dire: B.chauffeur },
      { faire: () => { p.allerVers([{ x: 1556, y: 1188 }], 50); G.allerVers([{ x: 1556, y: 1190 }], 50); } },
      { jusqua: () => !p.chemin },
      { faire: () => { p.visible = false; G.visible = false; Musique.miaou(1.1, 0.06); } },
      { attendre: 0.5 },
      { faire: () => { bus.porte = 0; Musique.klaxon(); } },
      { jusqua: (j) => { bus.x += 90 * j.dt; return bus.x > 1660; } },
      { attendre: 0.2 },
    ], () => {
      p.visible = true; G.visible = true;
      Q.bus = 'route';
      Musique.morceau('route');
      lancer(J, 0);
    });
  }

  // ------------------------------------------------------------ la victoire, puis Montaigu
  function victoire(J) {
    Q.bus = 'victoire';
    Musique.victoire();
    Indices.gagner(3, () => {
      Q.bus = 'gagne';
      J.cinematique = false;
      J.allerA('montaigu', 'bus');
    });
  }
  function arriveeMontaigu(J) {
    const C = J.carte, p = J.joueur, G = J.georges, B = CONFIG.route;
    Musique.morceau('jazz');
    if (C.busFait) return;
    C.busFait = true;
    const S = C.montaigu, bus = objetBus(C, S.bus.x, S.bus.y);
    bus.porte = 1;
    p.visible = false; G.visible = false; G.mode = 'script';
    J.cinematique = true;
    J.jouerScript([
      { attendre: 0.6 },
      { faire: () => { p.visible = true; G.visible = true; p.x = S.descente.x; p.y = S.descente.y; G.x = p.x + 6; G.y = p.y + 4; p.allerVers([{ x: p.x - 10, y: p.y + 18 }], 40); G.allerVers([{ x: p.x + 8, y: p.y + 22 }], 40); } },
      { jusqua: () => !p.chemin },
      { faire: () => { G.reprendreSuivi(J); bus.porte = 0; Musique.klaxon(); p.dir = 'up'; } },
      { jusqua: (j) => { bus.x += 80 * j.dt; return bus.x > S.bus.x + 260; } },
      { faire: () => { bus.visible = false; p.dir = 'down'; } },
      { dire: B.arrivee },
    ], () => {
      J.cinematique = false;
      Indices.suite({ haut: 'À suivre…', titre: 'ÉPREUVE 5/6', lieu: 'Montaigu', texte: 'Bientôt disponible. En attendant, Georges découvre les odeurs de la ville.', bouton: 'Se promener à Montaigu' });
    });
  }

  function init_(J) { void J; }

  return { init: init_, depart, arriveeMontaigu, lancer, en: () => !!E, etat: () => E, LONGUEUR, PAYSAGES };
})();
