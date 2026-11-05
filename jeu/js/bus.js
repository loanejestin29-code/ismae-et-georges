// =====================================================================
//  bus.js — ÉPREUVE 4 : « En route vers Montaigu »
//
//  1. À l'arrêt de bus d'Arendelle, le bus arrive ; Ismae et Georges montent.
//     Le chauffeur annonce : « Prochain arrêt : Montaigu ! »
//  2. Le trajet (vue du dessus, rétro) : le bus avance tout seul ; on change de file
//     (flèches ou A / D au clavier ; sur iPhone, glisser le doigt vers la gauche ou vers la droite :
//     sans glisser, le bus reste dans sa file). Des voitures déboîtent en clignotant.
//     Voitures, camions, tracteurs, travaux, chasse-neige, rennes, vaches… à éviter.
//     Trois vies ; la vitesse augmente peu à peu. En panne (plus de vies), on repart aussitôt du début
//     du paysage en cours. Des cadeaux à ramasser, et un cœur de temps en temps.
//     Les paysages défilent : montagnes enneigées, forêt, campagne (bocage, moulins),
//     petites villes illuminées pour Noël, puis Montaigu.
//     Clins d'œil : une voiture de course rouge n° 95 qui double à toute allure (« Ka-chow ! »),
//     une vieille dépanneuse rouillée sur le bas-côté, la station-service « Radiator Springs ».
//     Le trajet est difficile du début à la fin, et de plus en plus rapide ; les paysages, tous sous la
//     neige, se fondent les uns dans les autres (la forêt s'épaissit, puis les champs et les maisons arrivent).
//  3. Arrivée : le bus ralentit et s'arrête à Montaigu ; Ismae et Georges descendent (carte-montaigu.js).
//  4. Flash McQueen, garé un peu plus loin, remet le quatrième indice ; puis Linguini sort en courant du
//     restaurant du chef Gusteau : Loane a appelé, le chef attend Ismae pour un caramel (épreuve 5).
// =====================================================================
'use strict';

const Bus = (() => {
  const Q = Scenes.quete;
  Q.bus = 'aVenir'; // 'aVenir' → 'depart' → 'route' → 'arrive' (à Montaigu, avant l'indice) → 'gagne'
  const $ = (id) => document.getElementById(id);
  const LONGUEUR = 18000, KM = 128; // longueur du trajet (pixels) et distance affichée (km)
  const PAYSAGES = [
    { id: 'montagne', debut: 0, nom: 'les montagnes' }, { id: 'foret', debut: 0.18, nom: 'la forêt' },
    { id: 'campagne', debut: 0.38, nom: 'la campagne' }, { id: 'ville', debut: 0.65, nom: 'les petites villes' },
    { id: 'arrivee', debut: 0.9, nom: 'Montaigu' },
  ];
  const paysage = (f) => { let p = PAYSAGES[0]; for (const q of PAYSAGES) if (f >= q.debut) p = q; return p; };
  // entre deux paysages, un fondu sur « FONDU » du trajet : la neige fond par plaques, les arbres changent peu à peu…
  // renvoie le paysage d'avant (a), celui d'après (b) et le mélange m (0 : tout a, 1 : tout b)
  const FONDU = 0.06;
  function melange(f) {
    for (let k = 1; k < PAYSAGES.length; k++) {
      const d = PAYSAGES[k].debut;
      if (f < d - FONDU / 2) return { a: PAYSAGES[k - 1], b: PAYSAGES[k - 1], m: 0 };
      if (f < d + FONDU / 2) return { a: PAYSAGES[k - 1], b: PAYSAGES[k], m: (f - (d - FONDU / 2)) / FONDU };
    }
    const fin = PAYSAGES[PAYSAGES.length - 1];
    return { a: fin, b: fin, m: 0 };
  }
  // le paysage qui « gagne » à cet endroit (pour les bords de route), et un tirage au sort pour le décor
  const dominant = (f) => { const x = melange(f); return x.m < 0.5 ? x.a : x.b; };
  const tirage = (f) => { const x = melange(f); return Math.random() < x.m ? x.b : x.a; };
  // la difficulté, du début à la fin du trajet : la vitesse du bus (pixels/s) et le temps qu'on a pour réagir entre deux
  // rangées d'obstacles (s) ; « deux » : la part des rangées où deux files sur trois sont bouchées ; la file libre change
  // souvent (« bouge ») et jamais plus de « resteMax » rangées de suite au même endroit : impossible de rester dans sa file
  const DIFF = { vitesse: [125, 240], reaction: [1.0, 0.66], decale: 0.3, deux: [0.3, 0.62], bouge: 0.55, resteMax: 2 };
  const LANE = 26, NL = 3;
  let E = null;

  // ------------------------------------------------------------ les sprites (vue du dessus, l'avant vers le haut)
  const SP = {};
  function mk(w, h, f, contour = '#1d1626') { const c = PX.canvas(w, h); f(PX.painter(c), c); return PX.outline(c, contour); }
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
    // le décor des bas-côtés (voir plus bas : sapinNeige, arbreNu, rocherNeige…)
    SP.sapins = [[20, 0.6], [24, 0.7], [28, 0.85], [32, 1], [22, 0.35], [30, 0.5], [26, 0.9]].map(([h, n], k) => sapinNeige(h, n, 300 + k));
    // ceux du cœur de la forêt : deux tailles proches, un contour vert sombre (de loin, les cimes se fondent en une seule masse)
    SP.sapinsForet = [[28, 0.75], [30, 0.5], [29, 0.95], [31, 0.7], [27, 0.35], [33, 0.85]].map(([h, n], k) => sapinNeige(h, n, 700 + k, '#0f2418'));
    SP.arbresNus = [22, 26, 30].map((h, k) => arbreNu(h, 400 + k));
    SP.rochers = [[36, 22], [26, 17], [44, 26]].map(([w, h], k) => rocherNeige(w, h, 500 + k));
    SP.lac = lacGele(64, 26);
    SP.haies = [0, 1, 2].map((k) => haie(600 + k));
    SP.vaches = [0, 1, 2].map((k) => vacheChamp(700 + k));
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

  // ------------------------------------------------------------ le sol : de la neige partout (c'est l'hiver tout le long du
  // trajet), avec des congères douces ; ce qui change d'un paysage à l'autre, c'est ce qui pousse au bord de la route
  const SOLS = {};
  function sol(w) {
    if (SOLS[w]) return SOLS[w];
    const T = 256, c = PX.canvas(w, T), P = PX.painter(c), r = PX.rng(31);
    P.rect(0, 0, w, T, '#e6edf7');
    P.speckle(0, 0, w, T, ['#f4f8ff', '#d8e2f0', '#eef3fb'], 0.1, r);
    for (let k = 0; k < Math.round(w / 6); k++) {
      const x = r.int(w), y = r.int(T), rx = 10 + r.int(26), ry = 3 + r.int(5);
      for (const dy of [-T, 0, T]) { P.ellipse(x, y + dy + 2, rx, ry, 'rgba(150,170,210,0.16)'); P.ellipse(x - 2, y + dy, rx - 3, ry - 1, 'rgba(255,255,255,0.35)'); }
    }
    return (SOLS[w] = c);
  }

  // ------------------------------------------------------------ le décor des bords de route : sapins enneigés, arbres nus,
  // rochers, lacs gelés, champs bordés de haies (le bocage), maisons. Il est tiré au sort par tranches de route (toujours le
  // même pour une tranche donnée), dessiné une fois dans une image, puis simplement recopié à l'écran. Au passage d'un
  // paysage à l'autre, chaque élément tire au sort son paysage, de plus en plus souvent le suivant : la forêt s'épaissit
  // peu à peu, puis s'éclaircit, les champs puis les maisons arrivent petit à petit.
  function sapinNeige(h, neige, seed, contour) {
    const w = (Math.round(h * 0.36) * 2) + 1, n = h >= 26 ? 4 : 3, base = h - 3, th = base / n, cx = (w - 1) / 2, r = PX.rng(seed);
    return mk(w, h, (P) => {
      P.rect(cx - 1, base, 3, 3, '#5a3a26'); P.px(cx - 1, base, '#7a5236');
      for (let t = 0; t < n; t++) {
        const y0 = Math.round(t * th), y1 = Math.round((t + 1) * th) + 1, hw0 = (t + 0.5) / n * cx * 0.55, hw1 = (t + 1) / n * cx;
        for (let y = y0; y < Math.min(y1 + 1, base); y++) {
          const hw = Math.round(hw0 + (hw1 - hw0) * (y - y0) / (y1 - y0));
          P.hline(cx - hw, y, hw * 2 + 1, '#1f4a36'); P.hline(cx - hw, y, Math.max(1, hw - 1), '#2a5c42');
          P.px(cx + hw, y, '#14301f'); P.px(cx + hw - 1, y, '#173826');
          if (y >= y1 - 1) P.hline(cx - hw, y, hw * 2 + 1, '#173826'); // le dessous de l'étage, dans l'ombre
        }
        // la neige posée sur l'étage, bleutée sur sa droite
        const yn = y0 + Math.round((y1 - y0) * 0.3), hwn = Math.round(hw0 + (hw1 - hw0) * 0.3);
        for (let x = -hwn; x <= hwn; x++) {
          if (r() > neige + 0.25) continue;
          const col = x > hwn * 0.4 ? '#c8d6ea' : '#f4f8ff';
          P.px(cx + x, yn - (Math.abs(x) < hwn * 0.6 ? 1 : 0), col); P.px(cx + x, yn, col);
          if (r() < neige * 0.5) P.px(cx + x, yn + 1, '#dfe8f4');
        }
      }
      P.px(cx, 0, '#f4f8ff');
    }, contour);
  }
  function arbreNu(h, seed) { // un arbre sans feuilles (sans contour : les branches restent fines), la neige sur les branches
    const w = Math.round(h * 0.9) | 1, r = PX.rng(seed), c = PX.canvas(w, h), P = PX.painter(c), cx = (w - 1) / 2, segs = [];
    const branche = (x, y, a, l, ep, prof) => {
      const x2 = x + Math.cos(a) * l, y2 = y - Math.sin(a) * l;
      segs.push([x, y, x2, y2, ep]);
      if (prof <= 0) return;
      branche(x2, y2, a + 0.35 + r() * 0.3, l * (0.62 + r() * 0.12), Math.max(1, ep - 1), prof - 1);
      branche(x2, y2, a - 0.35 - r() * 0.3, l * (0.62 + r() * 0.12), Math.max(1, ep - 1), prof - 1);
    };
    branche(cx, h - 1, Math.PI / 2, h * 0.38, 3, 4);
    for (const [x1, y1, x2, y2, ep] of segs) Objets.line(P, x1, y1, x2, y2, ep > 2 ? '#3e2a1e' : ep > 1 ? '#4e3626' : '#6a4c38', ep);
    for (const [x1, y1, x2, y2] of segs) if (r() < 0.5) { const t = 0.3 + r() * 0.5; P.px(Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t) - 1, '#f4f8ff'); }
    return c;
  }
  function rocherNeige(w, h, seed) {
    const r = PX.rng(seed);
    return mk(w, h, (P) => {
      const cx = w / 2;
      P.ellipse(cx, h * 0.62, w / 2 - 1, h * 0.38, '#5e6272'); P.ellipse(cx - w * 0.12, h * 0.55, w * 0.34, h * 0.32, '#7a7e8e'); P.ellipse(cx - w * 0.2, h * 0.5, w * 0.2, h * 0.22, '#959aa8');
      for (let k = 0; k < 4; k++) { const x = Math.round(cx + (r() - 0.3) * w * 0.6), y = Math.round(h * (0.5 + r() * 0.3)); Objets.line(P, x, y, x + 2 + r() * 3, y + 2, '#4a4e5c'); }
      for (let x = 2; x < w - 2; x++) {
        const top = Math.round(h * 0.62 - Math.sqrt(Math.max(0, 1 - ((x - cx) / (w / 2 - 1)) ** 2)) * h * 0.38), e = 2 + Math.round(Math.abs(Math.sin(x * 0.7 + seed)) * 2);
        P.rect(x, top, 1, e, x > cx + w * 0.15 ? '#c8d6ea' : '#f4f8ff'); P.px(x, top, '#ffffff');
      }
    });
  }
  function lacGele(w, h) {
    return mk(w, h, (P) => {
      P.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, '#a8c8e0'); P.ellipse(w / 2 - 2, h / 2 - 1, w / 2 - 4, h / 2 - 3, '#c4dcee');
      for (let k = 0; k < 5; k++) P.hline(Math.round(w * (0.2 + k * 0.12)), Math.round(h * (0.3 + (k % 3) * 0.15)), Math.round(w * 0.12), '#e8f4fc');
      Objets.line(P, w * 0.3, h * 0.6, w * 0.55, h * 0.45, '#8ab0cc'); Objets.line(P, w * 0.55, h * 0.45, w * 0.7, h * 0.58, '#8ab0cc');
    });
  }
  function haie(seed) { const r = PX.rng(seed); return mk(7, 6, (P) => { P.ellipse(3, 3, 3, 2, '#2a4a2a'); P.ellipse(2, 2, 2, 1, '#3a5e34'); for (let x = 1; x < 6; x++) if (r() < 0.6) P.px(x, 1, '#eef3fb'); }); }
  function vacheChamp(seed) { // une vache normande vue de côté, dans son champ
    const r = PX.rng(seed);
    return mk(18, 12, (P) => {
      for (const x of [4, 6, 12, 14]) P.rect(x, 8, 1, 4, '#3a3236');
      P.ellipse(9, 6, 6, 3, '#f4f2ec'); P.rect(4, 4, 11, 4, '#f4f2ec');
      for (let k = 0; k < 3; k++) P.ellipse(6 + r.int(7), 5 + r.int(2), 1 + r.int(2), 1, '#6a4a3a');
      P.rect(0, 3, 4, 4, '#f4f2ec'); P.rect(0, 5, 2, 2, '#e8a0a8'); P.px(1, 3, '#6a4a3a'); P.px(2, 2, '#d8d0b8'); P.px(3, 2, '#d8d0b8');
      P.vline(16, 4, 4, '#6a4a3a'); P.hline(4, 3, 11, '#ffffff');
    });
  }

  const TR = 128, OBJETS = new Map(), TRANCHES = new Map();
  let largeurTr = 0;
  function objetsTranche(k, G) {
    if (OBJETS.has(k)) return OBJETS.get(k);
    const r = PX.rng(9001 + k * 7919), out = [], y0 = k * TR, dyn = [];
    const ici = (y) => { const m = melange(Math.max(0, y) / LONGUEUR); return r() < m.m ? m.b.id : m.a.id; };
    const pose = (img, x, y, o) => out.push(Object.assign({ img, x: Math.round(x), y: Math.round(y) }, o));
    const pick = (l) => l[Math.floor(r() * l.length)];
    for (const c of [-1, 1]) {
      const bord = c < 0 ? G.rx - 12 : G.rx + G.rw + 12, large = c < 0 ? bord : G.w - bord, X = (d) => bord + c * d;
      // les réverbères des villes, au bord du trottoir
      for (let y = y0 + 6; y < y0 + TR; y += 42) if (['ville', 'arrivee'].includes(ici(y))) out.push({ lampe: true, x: c < 0 ? G.rx - 14 : G.rx + G.rw + 14, y });
      // des parcelles côte à côte, du bord de la route vers l'extérieur ; chacune prend son paysage
      for (let d0 = 16; d0 < large; ) {
        const lw = 70 + Math.floor(r() * 44), d1 = Math.min(large + 20, d0 + lw), deux = r() < 0.5;
        for (const [py0, py1] of deux ? [[y0, y0 + TR / 2], [y0 + TR / 2, y0 + TR]] : [[y0, y0 + TR]]) {
          const p = ici((py0 + py1) / 2), xa = Math.min(X(d0), X(d1)), xb = Math.max(X(d0), X(d1));
          if (p === 'campagne') {
            // un champ sous la neige, entouré de haies ; dedans, des vaches, des bottes de foin, parfois une ferme ou un moulin
            const champ = { champ: true, x: xa + 3, y: py0 + 3, w: xb - xa - 6, h: py1 - py0 - 6, col: pick(['#eef2f8', '#e6ebf3', '#f0eee8', '#e9eef6']), sillons: r() < 0.55 };
            out.push(champ);
            const q = r(), cx = (xa + xb) / 2, cy = py0 + 10 + r() * (py1 - py0 - 30);
            if (q < 0.14 && d0 > 20) pose(SP.ferme, cx, cy);
            else if (q < 0.22 && d0 > 20) dyn.push({ img: SP.moulin[0], anime: true, x: Math.round(cx), y: Math.round(cy) });
            else if (q < 0.5) for (let n = 1 + Math.floor(r() * 3); n > 0; n--) pose(pick(SP.vaches), xa + 12 + r() * (xb - xa - 24), py0 + 10 + r() * (py1 - py0 - 26));
            else if (q < 0.75) for (let n = 2 + Math.floor(r() * 3); n > 0; n--) pose(SP.botte, xa + 10 + r() * (xb - xa - 20), py0 + 8 + r() * (py1 - py0 - 20));
          } else if (p === 'ville' || p === 'arrivee') {
            // deux rangées de maisons bien alignées le long de la route, des sapins décorés et des jardins entre elles
            for (let y = py0 + 4; y < py1 - 8; y += 38) for (const d of [30, 92]) {
              if (d < d0 || d >= d1 || r() < 0.12) continue;
              pose(r() < 0.84 ? pick(SP.maison) : r() < 0.86 ? SP.sapinNoel : SP.eglise, X(d), y + r() * 3);
            }
            if (d0 > 120) for (let n = 0; n < 3; n++) pose(pick(SP.sapins), xa + r() * (xb - xa), py0 + r() * (py1 - py0));
          } else if (p === 'foret') {
            // une forêt dense, vue d'en haut : des rangées de sapins en quinconce, alignées sur toute la forêt (pas de
            // couture entre deux parcelles) ; parfois une clairière, un cerf ; en lisière, côté route, la forêt s'effiloche :
            // des trous, de jeunes sapins et des arbres nus devant
            const clair = r() < 0.3 ? { x: xa + 18 + r() * Math.max(0, xb - xa - 36), y: py0 + 18 + r() * (py1 - py0 - 36), r: 12 + r() * 9 } : null;
            const dist = (x) => (x - bord) * c; // distance à la route
            // entre deux paysages, les bords des bouts de forêt s'effilochent aussi (sinon : des rectangles de sapins)
            const mel = melange((py0 + py1) / 2 / LONGUEUR), doux = mel.a.id !== mel.b.id;
            const auBord = (x, y) => Math.min(x - xa, xb - x, y - py0, py1 - y);
            for (let y = Math.ceil(py0 / 10) * 10; y < py1; y += 10) {
              const dec = (y / 10) % 2 ? 7 : 0;
              for (let x = Math.ceil((xa - dec) / 14) * 14 + dec; x < xb; x += 14) {
                const px = x + Math.floor(r() * 5) - 2, py = y + Math.floor(r() * 3) - 1;
                if (clair && Math.hypot((px - clair.x) / 1.4, py - clair.y) < clair.r) continue;
                if (dist(px) < 34 && r() < (34 - dist(px)) / 24) continue;
                if (doux && auBord(px, py) < 20 && r() < (20 - auBord(px, py)) / 16) continue;
                pose(pick(SP.sapinsForet), px, py);
              }
            }
            if (clair && r() < 0.5) pose(SP.cerf, clair.x, clair.y + 5);
            if (d0 < 20) for (let y = py0 + r() * 12; y < py1; y += 10 + r() * 16) {
              const d = 10 + r() * 18;
              pose(r() < 0.45 ? pick(SP.arbresNus) : SP.sapins[r() < 0.5 ? 0 : 4], X(d), y);
            }
          } else {
            // la montagne : de grandes étendues de neige, des bosquets de sapins serrés, des rochers, parfois un chalet,
            // un lac gelé ou un bonhomme de neige ; les sapins ne passent jamais devant ce qui est déjà posé, et rien ne
            // déborde sur la parcelle d'à côté (y : le long de la route, vers le haut de l'écran ; une image monte de y à y + h)
            const pris = [];
            const boite = (img, x, y) => ({ x0: x - img.width / 2 - 2, x1: x + img.width / 2 + 2, y0: y - 3, y1: y + img.height + 2 });
            const libre = (b) => b.x0 > xa && b.x1 < xb && b.y0 > py0 - 4 && b.y1 < py1 + 6 && !pris.some((q) => b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0);
            const poseSi = (img, x, y, garder) => { const b = boite(img, x, y); if (!libre(b)) return false; if (garder) pris.push(b); pose(img, x, y); return true; };
            const hy = py1 - py0;
            // (au-dessus des 24 premiers pixels : une forêt juste en dessous pourrait les cacher)
            const ou = (img) => py0 + 24 + r() * Math.max(0, hy - 28 - img.height);
            if (r() < 0.14 && d0 > 30) poseSi(SP.lac, (xa + xb) / 2, ou(SP.lac), true);
            const maison = r() < 0.8 ? SP.chalet : SP.bonhomme;
            if (r() < 0.3 && d0 > 30) poseSi(maison, xa + 20 + r() * (xb - xa - 40), ou(maison), true);
            for (let n = Math.floor(r() * 2.4); n > 0; n--) { const ro = SP.rochers[r() < 0.6 ? 1 : Math.floor(r() * 3)]; poseSi(ro, xa + 12 + r() * (xb - xa - 24), ou(ro), true); }
            // les bosquets : des sapins serrés autour d'un centre, les plus grands au milieu
            for (let n = (Math.sin(k * 1.7 + d0 * 0.05 + c) > -0.3 ? 1 : 0) + (r() < 0.5 ? 1 : 0); n > 0; n--) {
              const rx = 14 + r() * 14, ry = Math.min(9 + r() * 8, (hy - 36) / 2), gx = xa + 16 + r() * (xb - xa - 32), gy = py0 + ry + 2 + r() * Math.max(0, hy - 2 * ry - 34);
              for (let y = Math.ceil((gy - ry) / 8) * 8; y <= gy + ry; y += 8) {
                const dec = (y / 8) % 2 ? 5 : 0;
                for (let x = Math.ceil((gx - rx - dec) / 10) * 10 + dec; x <= gx + rx; x += 10) {
                  const e = ((x - gx) / rx) ** 2 + ((y - gy) / ry) ** 2;
                  if (e > 1 || (e > 0.6 && r() < 0.5)) continue;
                  poseSi(SP.sapins[e < 0.3 ? (r() < 0.5 ? 3 : 5) : e < 0.65 ? (r() < 0.5 ? 2 : 6) : (r() < 0.5 ? 0 : 4)], x + Math.floor(r() * 3) - 1, y);
                }
              }
            }
            // et quelques sapins isolés
            for (let n = 1 + Math.floor(r() * 3); n > 0; n--) poseSi(SP.sapins[r() < 0.5 ? 0 : 4], xa + 10 + r() * (xb - xa - 20), py0 + 2 + r() * (hy - 26));
          }
        }
        d0 = d1;
      }
    }
    out.dyn = dyn;
    OBJETS.set(k, out);
    return out;
  }
  function dessinChamp(g, o, haut) {
    const bas = haut - o.y, top = bas - o.h, x = Math.round(o.x);
    if (bas < -10 || top > TR + 10) return;
    g.fillStyle = o.col; g.fillRect(x, top, o.w, o.h);
    if (o.sillons) { g.fillStyle = 'rgba(130,110,90,0.22)'; for (let y = top + 3; y < bas - 2; y += 4) g.fillRect(x + 3, y, o.w - 6, 1); }
    // les haies du bocage, avec des trous et, de loin en loin, un vieil arbre
    const r = PX.rng(o.x * 31 + o.y);
    for (let k = 0, xx = x; xx < x + o.w; xx += 7, k++) {
      if (r() > 0.22) g.drawImage(SP.haies[k % 3], xx - 3, top - 4);
      if (r() > 0.22) g.drawImage(SP.haies[(k + 1) % 3], xx - 3, bas - 4);
    }
    for (let k = 0, yy = top + 3; yy < bas - 3; yy += 7, k++) {
      if (r() > 0.22) g.drawImage(SP.haies[(k + 2) % 3], x - 3, yy - 3);
      if (r() > 0.22) g.drawImage(SP.haies[k % 3], x + o.w - 4, yy - 3);
    }
    for (let xx = x + 10 + r() * 20; xx < x + o.w - 8; xx += 34 + r() * 26) { const a = SP.arbresNus[Math.floor(r() * 3)]; g.drawImage(a, Math.round(xx - a.width / 2), top - a.height + 2); }
  }
  function tranche(k, G) {
    if (largeurTr !== G.w) { OBJETS.clear(); TRANCHES.clear(); largeurTr = G.w; }
    if (TRANCHES.has(k)) return TRANCHES.get(k);
    const c = PX.canvas(G.w, TR), g = c.getContext('2d'), haut = (k + 1) * TR;
    const objs = [k - 1, k].flatMap((n) => objetsTranche(n, G));
    for (const o of objs) if (o.champ) dessinChamp(g, o, haut);
    for (const o of objs.filter((q) => !q.champ).sort((a, b) => b.y - a.y)) {
      const y = haut - o.y;
      if (o.lampe) {
        g.fillStyle = '#2a2632'; g.fillRect(o.x, y - 14, 2, 14); g.fillStyle = '#ffd27a'; g.fillRect(o.x - 1, y - 17, 4, 3);
        g.globalAlpha = 0.25; g.fillRect(o.x - 5, y - 21, 12, 10); g.globalAlpha = 1;
        continue;
      }
      const w = o.img.width;
      g.fillStyle = 'rgba(70,90,140,0.18)'; g.fillRect(o.x - (w >> 1) + 2, y - 2, w - 2, 3); // l'ombre
      g.drawImage(o.img, o.x - (w >> 1), y - o.img.height);
    }
    TRANCHES.set(k, c);
    for (const n of [...TRANCHES.keys()]) if (n < k - 5 || n > k + 6) TRANCHES.delete(n);
    for (const n of [...OBJETS.keys()]) if (n < k - 7 || n > k + 8) OBJETS.delete(n);
    return c;
  }

  // ------------------------------------------------------------ déroulement
  function lancer(J, depuis = 0) {
    init();
    E = {
      J, d: depuis * LONGUEUR, v: 0, vies: 3, cadeaux: E ? E.cadeaux : 0, voie: 1, x: 1, invul: 1.2, t: 0, phase: 'route', obstacles: [], decor: [], messages: [],
      prochain: depuis * LONGUEUR + 260, tranchesVues: new Set(), sur: 1, reste: 0, gauche: 0, droite: 0, repete: 0, secousse: 0, finT: 0,
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
    const p = tirage(f).id, r = Math.random();
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
    // jamais d'obstacle dessus ; quand elle bouge, l'ancienne file sûre est bouchée en premier (il faut suivre) ;
    // une ou deux files bloquées ; l'écart entre deux rangées suit la vitesse, pour un temps de réaction qui baisse doucement
    while (E.prochain < E.d + 420) {
      const y = E.prochain, fy = y / LONGUEUR, v = DIFF.vitesse[0] + (DIFF.vitesse[1] - DIFF.vitesse[0]) * fy;
      let ecart = v * (DIFF.reaction[0] + (DIFF.reaction[1] - DIFF.reaction[0]) * fy) * (0.92 + Math.random() * 0.22);
      if (fy < 0.94) {
        const avant = E.sur;
        E.reste++;
        if (E.reste > DIFF.resteMax || Math.random() < DIFF.bouge) {
          E.sur = E.sur === 1 ? (Math.random() < 0.5 ? 0 : 2) : 1;
          E.reste = 0; ecart += v * DIFF.decale;
        }
        const autres = [0, 1, 2].filter((k) => k !== E.sur).sort(() => Math.random() - 0.5).sort((p, q) => (q === avant) - (p === avant));
        const deux = Math.random() < DIFF.deux[0] + (DIFF.deux[1] - DIFF.deux[0]) * fy;
        const poses = autres.slice(0, deux ? 2 : 1).map((v) => { const o = creerObstacle(obstacleDe(fy), v, y + Math.random() * 14); E.obstacles.push(o); return o; });
        // une voiture seule peut déboîter vers l'autre file bloquée (jamais vers la file sûre)
        const o = poses[0], cible = autres[1];
        if (!deux && o.type === 'voiture' && Math.abs(cible - o.voie) === 1 && Math.random() < 0.3 + fy * 0.35) o.deboite = { vers: cible, t: 0 };
        if (Math.random() < 0.18) E.obstacles.push({ type: E.vies < 3 && Math.random() < 0.35 ? 'coeur' : 'cadeau', voie: E.sur, y: y + 6, vit: 0, img: null });
      }
      E.prochain += ecart;
    }
    // le décor des bas-côtés est dessiné par tranches (voir tranche) ; seuls les moulins, qui tournent, sont à part
    const G = geometrie(E.J.V);
    for (let k = Math.max(0, Math.floor((E.d - 200) / TR)); k <= Math.floor((E.d + 420) / TR); k++) {
      if (E.tranchesVues.has(k)) continue;
      E.tranchesVues.add(k);
      for (const o of objetsTranche(k, G).dyn) E.decor.push(Object.assign({}, o));
    }
    // les clins d'œil : panneaux kilométriques, la voiture de course, la dépanneuse, la station-service
    const evt = (cle, fx, faire) => { if (!E.faits.has(cle) && f >= fx) { E.faits.add(cle); faire(); } };
    E.evts.panneaux.forEach((fx, k) => evt('p' + k, fx - 0.03, () => E.decor.push({ img: SP.panneauRoute(`MONTAIGU ${Math.round(KM * (1 - fx))}`), x: G.rx + G.rw + 22, y: fx * LONGUEUR })));
    if (E.d < 300) evt('sortie', -1, () => E.decor.push({ img: SP.entreeVille('ARENDELLE'), x: G.rx + G.rw + 24, y: E.d + 120, barre: true }));
    E.evts.mcqueen.forEach((fx, k) => f < fx + 0.02 && evt('m' + k, fx, () => { E.course = { y: E.d - 80, vit: 0 }; message('Ka-chow !', 'course'); Musique.vroum(); }));
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
    const cible = E.phase === 'route' ? DIFF.vitesse[0] + (DIFF.vitesse[1] - DIFF.vitesse[0]) * f : 0;
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
    // le sol enneigé (le décor des bas-côtés vient après la route et ses trottoirs)
    const ici = (y) => dominant(Math.max(0, E.d + (busY - y)) / LONGUEUR).id; // le paysage à cette hauteur de l'écran
    for (let y = -8; y < h + 8; y += 8) {
      const ym = E.d + (busY - y);
      g.drawImage(sol(w), 0, Math.max(0, 255 - (((Math.floor(ym) % 256) + 256) % 256) - 7), w, 8, 0, y, w, 8);
    }
    // la route : bas-côtés (leur couleur suit le paysage, en fondu), bitume, lignes
    const BAS_COTE = { montagne: '#dfe6f2', foret: '#dfe6f2', campagne: '#d2d8e4', ville: '#9a9eac', arrivee: '#9a9eac' };
    for (let y = -8; y < h + 8; y += 8) {
      const x = melange(Math.max(0, E.d + (busY - y)) / LONGUEUR);
      g.fillStyle = PX.mix(BAS_COTE[x.a.id], BAS_COTE[x.b.id], x.m); g.fillRect(rx - 10, y, 10, 8); g.fillRect(rx + rw, y, 10, 8);
    }
    g.fillStyle = '#4a4a58'; g.fillRect(rx, 0, rw, h);
    g.fillStyle = '#545464'; for (let k = 0; k < 40; k++) g.fillRect(rx + ((k * 37) % rw), ((k * 53 + Math.floor(E.d)) % h), 2, 1);
    g.fillStyle = '#f4f4f8'; g.fillRect(rx + 1, 0, 1, h); g.fillRect(rx + rw - 2, 0, 1, h);
    for (let k = 1; k < NL; k++) for (let y = -24 + (Math.floor(E.d) % 24); y < h; y += 24) g.fillRect(rx + k * LANE, y, 1, 12);
    // ce qui borde la route dépend de l'endroit du trajet (et pas de l'endroit où est le bus) : ça arrive et ça s'en va avec le paysage
    const defile = (pas) => -pas + (Math.floor(E.d) % pas);
    const enNeige = (p) => p === 'montagne' || p === 'foret', enVille = (p) => p === 'ville' || p === 'arrivee';
    g.fillStyle = '#eef3fb';
    for (let y = defile(16); y < h; y += 16) if (enNeige(ici(y))) { g.fillRect(rx, y, 3, 6); g.fillRect(rx + rw - 3, y + 8, 3, 5); } // la neige sur les bords
    for (let y = defile(48); y < h + 48; y += 48) if (ici(y) === 'montagne') { // jalons à neige rouges et blancs
      for (const x of [rx - 8, rx + rw + 6]) { g.fillStyle = '#1d1626'; g.fillRect(x - 1, y - 13, 4, 14); for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#f4f4f8' : '#d8323a'; g.fillRect(x, y - 12 + k * 3, 2, 3); } }
    }
    for (let y = -8; y < h + 8; y += 8) if (enNeige(ici(y))) { // la glissière de sécurité
      g.fillStyle = '#8a92a4'; g.fillRect(rx + rw + 11, y, 2, 8); g.fillStyle = '#c8d0dc'; g.fillRect(rx + rw + 11, y, 1, 8);
    }
    g.fillStyle = '#5a6278'; for (let y = defile(20); y < h + 20; y += 20) if (enNeige(ici(y))) g.fillRect(rx + rw + 12, y, 2, 4);
    const xs = rx - 22; // les poteaux télégraphiques de la campagne et leurs fils
    g.fillStyle = 'rgba(30,30,40,0.6)'; for (let y = -8; y < h + 8; y += 8) if (ici(y) === 'campagne') { g.fillRect(xs + 1, y, 1, 8); g.fillRect(xs + 5, y, 1, 8); }
    for (let y = defile(90); y < h + 90; y += 90) if (ici(y - 10) === 'campagne') { g.fillStyle = '#5a3a22'; g.fillRect(xs, y - 20, 3, 20); g.fillRect(xs - 2, y - 18, 9, 2); g.fillStyle = 'rgba(20,10,40,0.25)'; g.fillRect(xs + 3, y - 2, 8, 2); }
    for (let y = -8; y < h + 8; y += 8) if (enVille(ici(y))) { // trottoirs et bordures des villes
      g.fillStyle = '#b8bcc8'; g.fillRect(rx - 22, y, 12, 8); g.fillRect(rx + rw + 10, y, 12, 8);
      g.fillStyle = '#e8ecf4'; g.fillRect(rx - 11, y, 1, 8); g.fillRect(rx + rw + 10, y, 1, 8);
    }
    g.fillStyle = '#a4a8b4'; for (let y = defile(12); y < h + 12; y += 12) if (enVille(ici(y))) { g.fillRect(rx - 22, y, 12, 1); g.fillRect(rx + rw + 10, y, 12, 1); }
    g.fillStyle = '#f4f4f8'; for (let y = defile(420); y < h + 420; y += 420) if (enVille(ici(y))) for (let x = rx + 3; x < rx + rw - 3; x += 7) g.fillRect(x, y, 4, 14); // passages piétons
    // le décor des bas-côtés, tranche par tranche (rien ne déborde sur la route), puis les panneaux, la station…
    for (let k = Math.floor((E.d - (h - busY) - 40) / TR); k <= Math.floor((E.d + busY + 40) / TR); k++) if (k >= 0) g.drawImage(tranche(k, G), 0, Math.round(busY - ((k + 1) * TR - E.d)));
    // les éléments à part (du plus loin au plus proche)
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
    for (let y = -40 + (Math.floor(E.d) % 120); y < h; y += 120) if (enVille(ici(y))) {
      for (let x = rx - 12; x < rx + rw + 12; x += 2) { const yy = y + Math.round(Math.sin((x - rx + 12) / (rw + 24) * Math.PI) * 6); g.fillStyle = '#2a2632'; g.fillRect(x, yy, 2, 1); if ((x >> 1) % 3 === 0) { g.fillStyle = ['#ff6a5a', '#ffd24a', '#7ad0ff', '#7aff9a'][(x >> 1) % 4]; g.fillRect(x, yy + 1, 2, 2); } }
    }
    // la neige qui tombe (plus fort dans les montagnes ; ça change doucement d'un paysage à l'autre)
    const FLOCONS = { montagne: 70, foret: 45, campagne: 25, ville: 45, arrivee: 45 }, ml = melange(f);
    const n = Math.round(FLOCONS[ml.a.id] * (1 - ml.m) + FLOCONS[ml.b.id] * ml.m);
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
  // le car vu de côté, pour les scènes dans les rues : à la taille d'un vrai car à côté d'Ismae (deux fois plus
  // haut qu'elle). L'avant est à droite (sens 1) ou à gauche (sens -1) ; la porte est juste derrière le chauffeur.
  const busCote = {};
  const PORTE_BUS = 54; // le milieu de la porte, depuis le milieu du car, vers l'avant
  function dessinBusCote(sens = 1) {
    if (busCote[sens]) return busCote[sens];
    const c = PX.canvas(147, 63), P = PX.painter(c), rr = PX.rng(66);
    // la caisse : blanche, le bas un peu plus gris, le toit arrondi couvert de neige
    P.rect(6, 4, 134, 3, '#e4e4ec'); P.rect(4, 6, 139, 2, '#ececf2');
    P.rect(2, 8, 141, 46, '#f2f2f6'); P.rect(143, 10, 2, 44, '#ececf2'); P.rect(145, 13, 1, 41, '#e2e2ea');
    P.rect(2, 44, 144, 10, '#dcdce6'); P.hline(2, 44, 144, '#c8c8d4');
    for (let x = 6; x < 140; x++) { const h = 1 + Math.round(Math.abs(Math.sin(x * 0.21)) * 2); P.rect(x, 4 - h, 1, h, '#eef3fb'); P.px(x, 4 - h, '#ffffff'); }
    // la bande verte et le filet jaune
    P.rect(2, 35, 144, 5, '#2f8a5a'); P.hline(2, 35, 144, '#4faa7a'); P.hline(2, 40, 144, '#f2c230');
    // les vitres : un long bandeau teinté, les sièges éclairés de l'intérieur
    P.rect(6, 12, 113, 21, '#2a2632');
    for (let k = 0; k < 7; k++) {
      const x = 7 + k * 16;
      P.rect(x, 13, 14, 19, '#f2d48a'); P.rect(x, 13, 14, 3, '#d8b468');
      for (const s of [2, 8]) { P.rect(x + s, 25, 4, 7, '#8a5a3a'); P.hline(x + s, 25, 4, '#a8744a'); }
      for (let j = 0; j < 7; j++) P.px(x + 12 - j, 14 + j * 2, 'rgba(255,255,255,0.45)');
    }
    // la porte (deux battants vitrés) puis la vitre du chauffeur, avec le chauffeur
    P.rect(119, 12, 16, 42, '#2a2632');
    for (const x of [120, 127]) { P.rect(x, 13, 6, 30, '#3a4a6a'); P.rect(x, 44, 6, 9, '#c8c8d2'); P.px(x + 1, 14, '#8ab0d8'); P.px(x + 1, 15, '#8ab0d8'); }
    P.rect(136, 12, 9, 22, '#2a2632'); P.rect(137, 13, 8, 20, '#3a4a6a');
    P.rect(139, 23, 5, 10, '#1d1a22'); P.ellipse(141, 20, 2, 2, '#1d1a22'); P.rect(139, 17, 5, 2, '#2f5a8a'); // la casquette
    for (let j = 0; j < 5; j++) P.px(144 - j, 14 + j * 2, '#8ab0d8');
    // le panneau de destination (le texte est écrit après le retournement)
    P.rect(110, 4, 36, 8, '#1d1a22');
    // les passages de roues, les roues, les soutes à bagages
    for (const x of [30, 104]) { P.ellipse(x, 55, 11, 10, '#2a2a34'); P.ellipse(x, 54, 8, 8, '#1d1a22'); P.ellipse(x, 54, 4, 4, '#8a8a9a'); P.px(x, 54, '#c8c8d0'); P.px(x - 2, 52, '#b8b8c6'); }
    for (const x of [48, 64, 80]) P.vline(x, 45, 8, '#b8b8c6');
    for (const x of [56, 72]) P.rect(x, 50, 3, 1, '#8a8a9a');
    // les feux, les pare-chocs, le rétroviseur, les feux de gabarit orange
    P.rect(144, 45, 2, 3, '#fff6c0'); P.px(145, 49, '#f2a030');
    P.rect(2, 37, 2, 8, '#d8323a');
    P.rect(1, 50, 4, 4, '#3a3a46'); P.rect(141, 50, 5, 4, '#3a3a46');
    P.rect(145, 14, 2, 1, '#1d1a22'); P.rect(146, 15, 1, 6, '#1d1a22');
    for (const x of [18, 42, 66, 90]) P.px(x, 46, '#f2a030');
    // un peu de neige fondue projetée sur le bas de caisse
    for (let x = 3; x < 144; x++) if (rr() < 0.35 && Math.abs(x - 30) > 11 && Math.abs(x - 104) > 11) P.px(x, 52 + rr.int(2), '#eef3fb');
    const img = sens > 0 ? c : PX.flipX(c);
    img.getContext('2d').setTransform(1, 0, 0, 1, 0, 0); // flipX laisse le miroir actif : on écrit le panneau à l'endroit
    Arendelle.texte(PX.painter(img), 'MONTAIGU', sens > 0 ? 112 : 3, 6, '#f2c230');
    return (busCote[sens] = PX.outline(img, '#1d1626'));
  }
  function objetBus(C, x, y, sens = 1) {
    const b = { x, y, sens, porte: 0, visible: true, get sortY() { return this.y; },
      get xPorte() { return this.x + PORTE_BUS * this.sens; },
      update() {}, draw(g) {
        if (!this.visible) return;
        Entites.ombre(g, this.x, this.y, 72);
        const gx = Math.round(this.x - 74), gy = Math.round(this.y - 64);
        g.drawImage(dessinBusCote(this.sens), gx, gy);
        if (this.porte > 0) { const dx = this.sens > 0 ? 121 : 14; g.fillStyle = '#ffcf72'; g.fillRect(gx + dx, gy + 14, 14, 40); g.fillStyle = '#b8864a'; g.fillRect(gx + dx, gy + 50, 14, 2); }
      } };
    C.dynamiques.push(b);
    return b;
  }

  function depart(J) {
    if (Q.bus !== 'aVenir' && Q.bus !== 'depart') return;
    Q.bus = 'depart';
    const p = J.joueur, G = J.georges, C = J.carte, B = CONFIG.route;
    const bus = objetBus(C, 1740, 1186, -1);
    J.cinematique = true;
    J.jouerScript([
      { dire: B.attente },
      { faire: () => { Musique.klaxon(); } },
      { jusqua: (j) => { bus.x -= 70 * j.dt; return bus.x <= 1500; } },
      { faire: () => { bus.porte = 1; Musique.porte(); } },
      { attendre: 0.4 },
      { dire: B.chauffeur },
      { faire: () => { p.allerVers([{ x: bus.xPorte, y: 1190 }], 50); G.allerVers([{ x: bus.xPorte + 3, y: 1192 }], 50); } },
      { jusqua: () => !p.chemin },
      { faire: () => { p.visible = false; G.visible = false; Musique.miaou(1.1, 0.06); } },
      { attendre: 0.5 },
      { faire: () => { bus.porte = 0; bus.sens = 1; Musique.klaxon(); } }, // demi-tour : il repart par la route d'où il vient
      { jusqua: (j) => { bus.x += 90 * j.dt; return bus.x > 1720; } },
      { attendre: 0.2 },
    ], () => {
      p.visible = true; G.visible = true;
      Q.bus = 'route';
      Musique.morceau('route');
      lancer(J, 0);
    });
  }

  // ------------------------------------------------------------ l'arrivée à Montaigu
  // au bout du trajet, on descend du car ; Flash McQueen (la voiture de course rouge de la route) est garé
  // un peu plus loin : c'est lui qui remet le quatrième indice. Puis Linguini sort en courant du restaurant :
  // Loane a appelé, il faut un caramel au beurre salé, le chef attend Ismae en cuisine ; et il y rentre aussitôt.
  function victoire(J) {
    Q.bus = 'arrive';
    Musique.victoireCourte();
    J.allerA('montaigu', 'bus');
  }
  function voitureFlash(C, x, y) {
    const imgs = { [-1]: Montaigu.flash(-1), 1: Montaigu.flash(1) };
    const f = { x, y, sens: -1, phares: 0, visible: true, get sortY() { return this.y; },
      update() {}, draw(g, J) {
        if (!this.visible) return;
        const s = imgs[this.sens], dy = this.roule ? Math.round(Math.sin((J.t || 0) * 30) * 0.6) : 0;
        Entites.ombre(g, this.x, this.y, 20);
        g.drawImage(s.img, Math.round(this.x - s.ax), Math.round(this.y - s.ay + dy));
        if (this.phares > 0 && Math.floor(this.phares * 6) % 2) { // l'appel de phares
          const px = Math.round(this.x + (this.sens < 0 ? -s.ax - 4 : s.ax + 1));
          g.fillStyle = 'rgba(255,246,192,0.75)'; g.fillRect(px, Math.round(this.y - 12), 4, 3);
        }
      } };
    C.dynamiques.push(f);
    return f;
  }
  function arriveeMontaigu(J) {
    const C = J.carte, p = J.joueur, G = J.georges, B = CONFIG.route, S = C.montaigu, lin = C.linguini;
    Musique.morceau('montaigu');
    // Linguini est rentré au restaurant : une flèche montre la porte (quand elle sort de l'écran), jusqu'à ce qu'Ismae entre
    const porte = { visible: true, x: S.porteResto.x, y: S.porteResto.y };
    const attend = () => { lin.visible = false; J.reperes = Q.caramel === 'aVenir' && Q.linguini === 'attend' ? [porte] : []; };
    attend();
    const parBus = Math.hypot(p.x - C.arrivees.bus.x, p.y - C.arrivees.bus.y) < 2;
    if (!parBus || Q.caramel !== 'aVenir' || (Q.bus === 'gagne' && Q.linguini === 'attend')) return;
    const bus = objetBus(C, S.bus.x, S.bus.y), flash = Q.bus !== 'gagne' ? voitureFlash(C, S.flash.x, S.flash.y) : null;
    Entites.portraits.mcqueen = Montaigu.portraitFlash();
    bus.porte = 1;
    p.visible = false; G.visible = false; G.mode = 'script';
    J.cinematique = true;
    let indice = false;
    const etapes = [
      { attendre: 0.6 },
      { faire: () => { p.visible = true; G.visible = true; p.x = bus.xPorte; p.y = bus.y + 4; G.x = p.x + 6; G.y = p.y + 4; p.allerVers([{ x: p.x - 10, y: p.y + 18 }], 40); G.allerVers([{ x: p.x + 8, y: p.y + 22 }], 40); } },
      { jusqua: () => !p.chemin },
      { faire: () => { G.reprendreSuivi(J); bus.porte = 0; Musique.klaxon(); p.dir = 'up'; } },
      { jusqua: (j) => { bus.x += 80 * j.dt; return bus.x > S.bus.x + 440; } },
      { faire: () => { bus.visible = false; p.dir = 'down'; } },
      { dire: B.arrivee },
    ];
    if (flash) etapes.push(
      { faire: () => { Musique.klaxon(); flash.phares = 1.4; p.dir = 'right'; } },
      { jusqua: (j) => (flash.phares -= j.dt) <= 0 },
      { dire: B.flash },
      { faire: () => { Musique.victoire(); Indices.gagner(3, () => { indice = true; }); } },
      { jusqua: () => indice },
      { faire: () => { Q.bus = 'gagne'; } },
      { dire: B.flashFin },
      { faire: () => { flash.sens = 1; flash.roule = true; Musique.vroum(); } },
      { jusqua: (j) => { flash.x += 220 * j.dt; return flash.x > S.flash.x + 640; } },
      { faire: () => { flash.visible = false; } },
    );
    // Linguini sort du restaurant et vient en courant
    etapes.push(
      { faire: () => { lin.visible = true; lin.x = S.porteResto.x; lin.y = S.porteResto.y; lin.allerVers([{ x: S.porteResto.x, y: 262 }, { x: p.x + 28, y: 262 }, { x: p.x + 26, y: p.y - 2 }], 110); lin.dire('!', 1.5); } },
      { attendre: 0.4 },
      { faire: () => { p.dir = 'right'; } },
      { jusqua: () => !lin.chemin },
      { faire: () => { lin.dir = 'left'; } },
      { dire: B.linguini },
      // … et il rentre dans le restaurant (c'est là qu'Ismae le retrouvera)
      { faire: () => { lin.allerVers([{ x: p.x + 28, y: 262 }, { x: S.porteResto.x, y: 262 }, { x: S.porteResto.x, y: S.porteResto.y }, { x: S.porteResto.x, y: S.porteResto.y - 8 }], 110, () => { lin.visible = false; }); } },
      { attendre: 0.6 },
    );
    J.jouerScript(etapes, () => {
      J.cinematique = false;
      Q.linguini = 'attend';
      J.reperes = [porte];
      Indices.suite(CONFIG.caramel.annonce);
    });
  }

  function init_(J) { void J; }

  return { init: init_, depart, arriveeMontaigu, lancer, en: () => !!E, etat: () => E, LONGUEUR, PAYSAGES };
})();
