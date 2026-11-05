// =====================================================================
//  carte-grenier.js — ZONE 6 : le grenier de l'antiquaire de Montaigu (épreuve 6)
//
//  Un grand grenier sous la charpente, la nuit : le pignon et son œil-de-bœuf (la lune, la neige),
//  de vieux planchers, deux ampoules nues, un lampadaire, et partout du bric-à-brac entassé.
//  Presque tout se fouille (epreuve-chasse.js) : cinq objets-souvenirs et Georges y sont cachés.
//  Au milieu, la longue table et son chemin de velours : le présentoir où se rangent les objets.
//
//  Plan (en pixels, y vers le bas) :
//    y   0-126  le pignon (mur du fond) et le dessous du toit
//    y 126-180  les grands meubles contre le mur ; le coin sombre (à droite) et ses meubles sous des draps
//    y 180-340  le milieu de la pièce : la malle, le cheval à bascule, la table du présentoir, les valises…
//    y 340-440  le devant : le berceau, les cartons, la machine à coudre ; la trappe (on monte par là)
// =====================================================================
'use strict';

Jeu.enregistrerCarte('grenier', () => {
  const W = 720, H = 440, MUR = 126, G = Grenier, B = G.BOIS;
  const C = new Carte('grenier', W, H, { ambiance: 'soir', fond: '#120a08', arrivees: { entree: { x: 360, y: 400, dir: 'up' } } });
  const P = C.P, O = C.O, r = PX.rng(606);
  C.neige = 0;

  // ---------------------------------------------------------------- le plancher : de longues planches, le fil du bois, des clous
  for (let y = MUR; y < H; y += 7) {
    let x = -r.int(60);
    while (x < W) {
      const l = 34 + r.int(50), col = r.pick(['#6e4830', '#7a5034', '#684428', '#80553a', '#734c32']);
      P.rect(x, y, l, 7, col); P.hline(x, y, l, PX.shade(col, 0.12)); P.hline(x, y + 6, l, '#3e2818'); P.vline(x, y, 7, '#3e2818');
      P.px(x + 2, y + 3, '#2e1e14'); P.px(x + l - 3, y + 3, '#2e1e14');
      for (let k = 0; k < l / 10; k++) P.hline(x + r.int(l - 4), y + 2 + r.int(3), 2 + r.int(4), PX.shade(col, -0.08));
      x += l;
    }
  }
  // la poussière le long des murs, et des moutons çà et là
  P.dither(14, MUR, W - 28, 14, '#a08868', 5); P.dither(14, MUR + 14, W - 28, 10, '#a08868', 2);
  for (let k = 0; k < 26; k++) { const x = 20 + r.int(W - 40), y = MUR + 10 + r.int(H - MUR - 20); P.ellipse(x, y, 2 + r.int(3), 1, 'rgba(190,170,140,0.35)'); }
  // des petites choses tombées par terre : des feuilles, des billes, des plumes, une chaussette
  for (let k = 0; k < 14; k++) { const x = 30 + r.int(W - 60), y = MUR + 40 + r.int(H - MUR - 60); P.rect(x, y, 6, 4, '#e8e0cc'); P.hline(x, y, 6, '#f4ecd8'); P.hline(x + 1, y + 2, 4, '#a89880'); }
  for (let k = 0; k < 10; k++) { const x = 30 + r.int(W - 60), y = MUR + 30 + r.int(H - MUR - 50); P.px(x, y, r.pick(['#3a6ad8', '#c8343a', '#3a8a4a', '#f2c230'])); P.px(x + 1, y, '#ffffff'); }
  P.rect(612, 284, 6, 3, '#c8343a'); P.rect(616, 286, 3, 3, '#c8343a'); P.hline(612, 284, 6, '#f4f2ec'); // une chaussette orpheline
  // le grand tapis d'Orient, sous la table du présentoir
  const TX = 360, TY = 270;
  P.rect(TX - 110, TY - 34, 220, 76, '#5a1a20'); P.rect(TX - 106, TY - 30, 212, 68, '#c8a050'); P.rect(TX - 103, TY - 27, 206, 62, '#7a2228');
  for (let x = TX - 100; x < TX + 100; x += 8) { P.rect(x, TY - 24, 4, 4, '#2a3a6a'); P.rect(x + 2, TY + 29, 4, 4, '#2a3a6a'); }
  P.ellipse(TX, TY + 4, 44, 20, '#2a3a6a'); P.ellipse(TX, TY + 4, 38, 16, '#c8a050'); P.ellipse(TX, TY + 4, 34, 13, '#8a2a30');
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; P.ellipse(Math.round(TX + Math.cos(a) * 20), Math.round(TY + 4 + Math.sin(a) * 8), 3, 2, '#e8c070'); }
  for (let x = TX - 110; x < TX + 110; x += 3) { P.vline(x, TY - 37, 3, '#e8d8a8'); P.vline(x + 1, TY + 42, 3, '#e8d8a8'); } // les franges
  // le clair de lune qui tombe de l'œil-de-bœuf
  P.trap(332, 56, 296, 128, MUR, 74, 'rgba(200,220,255,0.08)'); P.trap(340, 40, 316, 88, MUR, 60, 'rgba(210,228,255,0.06)');
  P.rect(356, MUR + 6, 8, 60, 'rgba(20,14,30,0.12)'); P.rect(318, MUR + 30, 84, 6, 'rgba(20,14,30,0.12)');

  // ---------------------------------------------------------------- le pignon : des planches, l'œil-de-bœuf, la charpente
  P.rect(0, 0, W, MUR, '#1a110c');
  // le dessous du toit, de chaque côté du pignon : des chevrons dans l'ombre
  for (let k = 0; k < 14; k++) { const d = k * 30; Objets.line(P, d - 40, MUR, d + 100, -10, '#2a1c12', 3); Objets.line(P, W - d + 40, MUR, W - d - 100, -10, '#2a1c12', 3); }
  // le pignon, en planches verticales, sous les deux grandes poutres en pente
  const haut = (x) => Math.round(MUR + 2 - (Math.min(x, W - x) - 20) * (MUR + 6) / (W / 2 - 20));
  const planches = []; for (let x = 0; x < W; x += 10) planches.push(r.pick(['#4a3222', '#523826', '#46301f']));
  for (let x = 0; x < W; x++) {
    const yt = Math.max(0, haut(x)); if (yt >= MUR) continue;
    const col = planches[Math.floor(x / 10)];
    P.vline(x, yt, MUR - yt, x % 10 === 0 ? '#2a1a10' : x % 10 === 1 ? PX.shade(col, 0.1) : col);
  }
  for (let k = 0; k < 40; k++) { const x = 30 + r.int(W - 60), y = Math.max(haut(x) + 4, 4) + r.int(30); if (y < MUR - 2) P.px(x, y, '#2a1a10'); } // les nœuds du bois
  // les arbalétriers (les grosses poutres du pignon) et l'entrait
  Objets.line(P, 20, MUR + 2, W / 2, -4, B.d, 9); Objets.line(P, W - 20, MUR + 2, W / 2, -4, B.d, 9);
  Objets.line(P, 22, MUR - 2, W / 2, -8, B.c, 3); Objets.line(P, W - 22, MUR - 2, W / 2, -8, B.c, 3);
  P.rect(60, 96, W - 120, 9, B.m); P.hline(60, 96, W - 120, B.l); P.hline(60, 104, W - 120, B.n);
  for (const x of [200, W - 200]) { const y0 = haut(x) - 2; P.rect(x - 4, y0, 8, 96 - y0, B.m); P.vline(x - 4, y0, 96 - y0, B.l); } // les jambes de force
  // les toiles d'araignée dans les coins
  const toile = (cx, cy, rr, dir) => {
    for (let k = 0; k <= 4; k++) { const a = (dir + k / 4 * 0.5) * Math.PI; Objets.line(P, cx, cy, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 'rgba(200,200,215,0.35)', 1); }
    for (const f of [0.35, 0.65, 0.95]) for (let k = 0; k < 4; k++) { const a1 = (dir + k / 4 * 0.5) * Math.PI, a2 = (dir + (k + 1) / 4 * 0.5) * Math.PI; Objets.line(P, cx + Math.cos(a1) * rr * f, cy + Math.sin(a1) * rr * f, cx + Math.cos(a2) * rr * f, cy + Math.sin(a2) * rr * f, 'rgba(200,200,215,0.3)', 1); }
  };
  toile(64, 105, 22, 0); toile(W - 64, 105, 22, 0.5); toile(204, 105, 14, 0); toile(W - 204, 105, 14, 0.5); toile(W / 2 - 6, 4, 16, 0.25);
  // l'œil-de-bœuf : la nuit, les étoiles, la lune, la neige sur le rebord
  const OX = W / 2, OY = 52;
  P.ellipse(OX, OY, 27, 27, B.n); P.ellipse(OX, OY, 25, 25, B.c); P.ellipse(OX, OY, 21, 21, '#141c3a');
  P.vgrad(OX - 21, OY - 21, 42, 42, '#141c3a', '#2a3a6a');
  for (let y = -26; y <= 26; y++) for (let x = -26; x <= 26; x++) { const d = Math.hypot(x, y); if (d > 21 && d < 25) P.px(OX + x, OY + y, (x + y) % 3 ? B.c : B.l); else if (d >= 25 && d < 27.5) P.px(OX + x, OY + y, B.n); }
  for (let k = 0; k < 14; k++) { const a = r() * 6.28, d = r() * 18; P.px(Math.round(OX + Math.cos(a) * d), Math.round(OY + Math.sin(a) * d), r.chance(0.3) ? '#ffffff' : '#a8b8e8'); }
  P.ellipse(OX + 9, OY - 8, 5, 5, '#f4f0dc'); P.ellipse(OX + 11, OY - 9, 4, 4, '#1e2a52'); // le croissant de lune
  for (let x = -18; x <= 18; x++) { const yb = Math.round(Math.sqrt(Math.max(0, 21 * 21 - x * x))); P.rect(OX + x, OY + yb - 3 - (x % 3 === 0 ? 1 : 0), 1, 3, x > 6 ? '#c8d6ea' : '#f4f8ff'); }
  P.rect(OX - 1, OY - 21, 3, 42, B.m); P.rect(OX - 21, OY - 1, 42, 3, B.m); P.vline(OX - 1, OY - 21, 42, B.l); P.hline(OX - 21, OY - 1, 42, B.l);
  for (const [x, y] of [[-15, -12], [-12, -15], [13, 13], [16, 10], [-16, 11]]) P.px(OX + x, OY + y, '#dfe8f8'); // le givre
  C.lumiere(OX, OY, 34, 'neon');

  // ---------------------------------------------------------------- les murs de côté, le bas, la trappe
  P.rect(0, MUR, 14, H - MUR, '#2a1c12'); P.vline(13, MUR, H - MUR, '#4a3222'); P.rect(W - 14, MUR, 14, H - MUR, '#2a1c12'); P.vline(W - 14, MUR, H - MUR, '#4a3222');
  P.rect(0, H - 4, W, 4, '#2a1c12');
  // la trappe ouverte : l'échelle qui descend dans la boutique, la lueur d'en bas, le couvercle relevé
  P.rect(344, 414, 32, 26, '#120a08'); P.rect(346, 416, 28, 24, '#2a1a10');
  for (let y = 420; y < 440; y += 6) { P.rect(349, y, 22, 2, B.l); P.hline(349, y, 22, B.h); } P.rect(348, 416, 2, 24, B.c); P.rect(370, 416, 2, 24, B.c);
  P.rect(342, 412, 36, 2, B.n); P.rect(342, 412, 2, 28, B.n); P.rect(376, 412, 2, 28, B.n);
  C.lumiere(360, 432, 34, 'win');
  const trappe = PX.canvas(32, 22), TP = PX.painter(trappe);
  TP.rect(0, 0, 32, 22, B.m); for (let x = 0; x < 32; x += 8) { TP.vline(x, 0, 22, B.d); TP.vline(x + 1, 0, 22, B.c); } TP.rect(2, 9, 28, 3, B.d); TP.rect(14, 4, 4, 3, '#8a90a0');
  C.objet({ img: PX.outline(trappe, '#1d1626'), ax: 0, ay: 22 }, 380, 414, { solide: [0, -6, 34, 6] });
  C.porte(346, 418, 28, 22, 'montaigu', 'antiquaire', 'down');

  // ---------------------------------------------------------------- collisions des murs
  C.solide(0, 0, W, MUR + 2); C.solide(0, 0, 15, H); C.solide(W - 15, 0, 15, H);
  C.solide(0, H - 3, 344, 3); C.solide(376, H - 3, W - 376, 3);

  // ---------------------------------------------------------------- les meubles et le bric-à-brac
  // [image, x, y, solide [dx, dy, w, h], cachette, options]
  C.cachettes = {};
  const pose = (def, x, y, sol, cachette, o = {}) => {
    const ob = C.objet(def, x, y, Object.assign({ solide: sol, ombre: [Math.round(sol[2] / 2) + 2, 3] }, o));
    if (cachette) {
      C.cachettes[cachette] = { ob, x0: ob.x, x, y, w: def.img.width, h: def.img.height, etincelle: o.etincelle || [x + Math.round(sol[2] * 0.2), y - Math.round(def.img.height * 0.55)] };
      C.zone(x + sol[0] - 6, y + sol[1] - 6, sol[2] + 12, sol[3] + 12, null, { dialogue: (J) => Chasse.fouiller(cachette, J) });
    }
    return ob;
  };
  // contre le mur du fond
  pose(G.armoire(), 64, 140, [-23, -12, 46, 12], 'armoire');
  const lampadaire = G.lampePied(); pose(lampadaire, 106, 146, [-4, -3, 8, 3]);
  C.lumiere(106, 146 - lampadaire.ay + lampadaire.lampe[1] + 4, 70, 'lamp');
  pose(G.bibliotheque(), 154, 140, [-26, -12, 52, 12], 'bibliotheque');
  pose(G.horloge(), 206, 140, [-11, -8, 22, 8], 'horloge');
  pose(G.sapinVieux(), 246, 146, [-9, -5, 18, 5], 'sapin');
  pose(G.poteau(), 292, 152, [-5, -4, 10, 4]); pose(G.poteau(), 428, 152, [-5, -4, 10, 4]);
  const bureau = G.bureau(); pose(bureau, 360, 146, [-29, -10, 58, 10], 'bureau');
  C.lumiere(360 - bureau.ax + bureau.lampe[0], 146 - bureau.ay + bureau.lampe[1] + 3, 44, 'shop');
  pose(G.tableaux(), 474, 142, [-22, -8, 44, 8], 'tableaux');
  pose(G.miroir(), 520, 144, [-8, -5, 16, 5], 'miroir');
  pose(G.chaises(), 556, 146, [-12, -6, 24, 6], 'chaises');
  pose(G.luge(), 598, 144, [-17, -6, 34, 6], 'luge');
  // le coin sombre : des meubles sous des draps (Georges y a filé)
  pose(G.drap(56, 46, 3), 664, 170, [-27, -14, 54, 14], 'drapGeorges', { etincelle: [0, 0] });
  pose(G.drap(40, 30, 9), 640, 214, [-19, -10, 38, 10], 'drap');
  pose(G.parapluies(), 28, 190, [-6, -4, 12, 4]);
  // le milieu
  pose(G.malle(), 96, 222, [-20, -10, 40, 10], 'malle');
  pose(G.chevalBascule(), 196, 226, [-18, -6, 36, 6], 'cheval');
  pose(G.globe(), 272, 214, [-6, -4, 12, 4], 'globe');
  pose(G.tabouret(), 250, 266, [-6, -3, 12, 3]); C.objet(G.vase(), 250, 252, { dy: 15 });
  pose(G.cage(), 452, 214, [-7, -4, 14, 4], 'cage');
  pose(G.mannequin(), 510, 222, [-8, -4, 16, 4], 'mannequin');
  pose(G.valises(), 596, 262, [-19, -10, 38, 10], 'valises');
  pose(G.chapeaux(), 66, 300, [-16, -8, 32, 8], 'chapeaux');
  pose(G.cartons(41, 2, 'LIVRES'), 176, 304, [-20, -10, 40, 10], 'cartonA');
  pose(G.pileLivres(5), 424, 318, [-9, -4, 18, 4]);
  pose(G.gramophone(), 520, 306, [-12, -8, 24, 8], 'gramophone');
  pose(G.cartons(57, 3), 650, 332, [-20, -10, 40, 10], 'cartonB');
  // le devant
  pose(G.berceau(), 110, 370, [-17, -8, 34, 8], 'berceau');
  pose(G.cartonNoel(), 226, 376, [-18, -8, 36, 8], 'cartonNoel');
  pose(G.pileLivres(8), 290, 396, [-9, -4, 18, 4], 'livres');
  pose(G.cartons(63, 1, 'FRAGILE'), 316, 420, [-20, -8, 40, 8]);
  pose(G.tapisRoule(), 470, 388, [-26, -8, 52, 8], 'tapis');
  pose(G.couture(), 586, 384, [-16, -6, 32, 6], 'couture');
  pose(G.coffreJouets(), 664, 398, [-17, -8, 34, 8], 'jouets');
  pose(G.maisonPoupee(), 44, 410, [-14, -8, 28, 8], 'poupees');
  // et encore du bazar, partout
  pose(G.commode(), 40, 252, [-20, -8, 40, 8], 'commode');
  pose(G.fauteuil(), 150, 262, [-15, -6, 30, 6], 'fauteuil');
  pose(G.portemanteau(), 566, 316, [-8, -4, 16, 4], 'portemanteau');
  pose(G.caissePommes(), 470, 250, [-12, -5, 24, 5], 'pommes');
  pose(G.radio(), 690, 250, [-10, -4, 20, 4], 'radio');
  pose(G.machineEcrire(), 420, 360, [-13, -8, 26, 8], 'machine');
  pose(G.panierLaine(), 170, 404, [-10, -4, 20, 4], 'laine');
  pose(G.guitare(), 694, 336, [-6, -3, 12, 3]);
  pose(G.seauBalai(), 76, 330, [-7, -3, 14, 3]);
  pose(G.ventilateur(), 250, 336, [-6, -3, 12, 3]);
  pose(G.assiettes(), 124, 316, [-10, -4, 20, 4]);
  pose(G.cadresSol(), 380, 350, [-16, -6, 32, 6]);
  pose(G.cartons(71, 2), 684, 210, [-20, -10, 40, 10]);
  pose(G.cartons(83, 3), 36, 352, [-20, -10, 40, 10]);
  pose(G.cartons(97, 2), 532, 414, [-20, -10, 40, 10]);
  C.objet(G.ours(), 300, 352, { solide: [-4, -2, 8, 2] });
  C.objet(G.ballon(), 522, 352, { solide: [-3, -2, 6, 2] });
  C.objet(G.toupie(), 250, 410, { solide: [-3, -2, 6, 2] });

  // ---------------------------------------------------------------- la longue table du présentoir (les objets s'y rangent)
  const table = (() => {
    const w = 168, h = 34, c = PX.canvas(w, h), T = PX.painter(c);
    T.rect(0, 6, w, 10, B.c); T.hline(0, 6, w, B.h); T.hline(0, 15, w, B.d); T.rect(0, 16, w, 5, B.m); T.hline(0, 20, w, B.n);
    for (const x of [4, w - 10]) { T.rect(x, 21, 6, 13, B.m); T.vline(x, 21, 13, B.l); }
    T.rect(10, 4, w - 20, 10, '#6a1a2a'); T.hline(10, 4, w - 20, '#9a2a3a'); T.rect(10, 14, w - 20, 5, '#5a1424'); // le chemin de velours, qui retombe devant
    for (let x = 10; x < w - 10; x += 3) T.px(x, 19, '#e8b54a');
    for (let k = 0; k < 5; k++) { const x = 28 + k * 28; T.ellipse(x, 9 - (k % 2) * 2, 9, 3, '#8a2a3a'); T.ellipse(x, 8 - (k % 2) * 2, 8, 2, '#a83a4a'); } // les petits coussins
    for (const x of [3, w - 7]) { T.rect(x, -1 + 2, 4, 7, '#f6f2e6'); T.vline(x + 3, 1, 7, '#d8d0c0'); } // les bougies
    return { img: PX.outline(c, '#1d1626'), ax: w / 2 + 1, ay: h };
  })();
  C.objet(table, TX, TY, { solide: [-82, -10, 164, 10], ombre: [84, 4] });
  for (const x of [TX - 81, TX + 81]) C.lumiere(x, TY - 32, 26, 'feu');
  C.zone(TX - 88, TY - 18, 176, 24, null, { dialogue: (J) => Chasse.presentoir(J) });
  // les objets déjà retrouvés, posés sur leurs coussins (en quinconce)
  C.table = { x: TX, y: TY, places: [[-56, -24], [-28, -28], [0, -24], [28, -28], [56, -24]] };
  C.dynamiques.push({ sortY: TY + 1, draw(g, J) { Chasse.dessinTable(g, J, C.table); } });

  // ---------------------------------------------------------------- les ampoules nues, au bout de leur fil
  for (const [x, y, rr] of [[196, 172, 104], [494, 196, 92], [TX, 196, 104]]) { C.dessusImg(G.ampoule(y - 4), x - 3, 0); C.lumiere(x, y + 6, rr, 'lamp'); }
  C.lumiere(OX, MUR + 26, 60, 'neon'); // le clair de lune, par terre

  C.onEntree = (J) => Chasse.entree(J);
  C.apresLumiere = (g, J, sprLum) => Chasse.lueurs(g, J, sprLum);
  C.finaliser(0.28);
  return C;
});
