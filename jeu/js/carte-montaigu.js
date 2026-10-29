// =====================================================================
//  carte-montaigu.js — ZONE 5 : Montaigu, un soir de Noël (épreuve 5)
//
//  Plan (en pixels, y vers le bas) :
//    y   0-136  le ciel, les remparts du vieux château et ses deux tours (décor)
//    y 136-270  la rangée nord : maisons, boulangerie, pharmacie, l'ÉGLISE,
//               le restaurant du chef GUSTEAU (on y entre), fleuriste, librairie, fromagerie
//    y 270-462  la place de l'église (grand sapin, manège), le jardin et sa fontaine (ouest),
//               le marché de Noël et ses chalets (est)
//    y 462-556  la Grande Rue : c'est là que le car s'arrête (abribus à l'ouest) ;
//               à l'est, la route est barrée (la sixième épreuve viendra plus tard)
//    y 556-690  la rangée sud (café, pâtisserie, mairie…), percée de deux ruelles
//    y 690-744  la petite rue du bas, le long du mur et de sa haie
// =====================================================================
'use strict';

Jeu.enregistrerCarte('montaigu', () => {
  const W = 1200, H = 760, A = Arendelle, M = Montaigu;
  const NORD = 270, RUE = 480, RUE2 = 540, SUD = 690;
  const C = new Carte('montaigu', W, H, { ambiance: 'soir', fond: '#151026' });
  const P = C.P, O = C.O, r = PX.rng(85);
  C.neige = 1.2;

  // ---------------------------------------------------------------- sol : la neige, le ciel et les remparts au fond
  P.rect(0, 0, W, H, '#e6edf7');
  P.speckle(0, 136, W, H - 136, ['#f4f8ff', '#d8e2f0', '#eef3fb', '#cfdaea'], 0.12, r);
  for (let k = 0; k < 220; k++) {
    const x = r.int(W), y = 280 + r.int(H - 280), rx = 12 + r.int(30), ry = 3 + r.int(7);
    P.ellipse(x, y + 2, rx, ry, 'rgba(140,165,210,0.12)'); P.ellipse(x - 2, y - 1, rx - 3, Math.max(2, ry - 2), 'rgba(255,255,255,0.3)');
  }
  M.remparts(P, W, 96, 40, r);

  // pavés sous la neige : la neige s'épaissit vers les bords et se fond dans le sol autour
  const pavesNeige = (x0, y0, w, h, tons) => {
    const t = PX.canvas(w, h), T = PX.painter(t);
    Sol.paves(T, 0, 0, w, h, r, tons || { base: ['#8a8478', '#948d80', '#7f796e', '#9a9284'], hi: '#b0a898', lo: '#6a6458', joint: '#5a5448' });
    const pv = T.g.getImageData(0, 0, w, h).data, img = P.g.getImageData(x0, y0, w, h), d = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const gx = x0 + i, gy = y0 + j, dd = Math.min(i, w - 1 - i, j, h - 1 - j), k = (j * w + i) * 4;
      const plaque = Math.max(0, Math.sin(gx * 0.05 + Math.sin(gy * 0.033) * 2) * Math.sin(gy * 0.06 + Math.sin(gx * 0.02) * 1.6)) * 0.4;
      let a = Math.min(1, Math.max(0.36 + plaque, 1.05 - dd * 0.05));
      a = Math.min(1, Math.max(0, a + ((PX.bayer(gx, gy) / 16) - 0.5) * 0.1));
      d[k] = pv[k] * (1 - a) + d[k] * a; d[k + 1] = pv[k + 1] * (1 - a) + d[k + 1] * a; d[k + 2] = pv[k + 2] * (1 - a) + d[k + 2] * a;
    }
    P.g.putImageData(img, x0, y0);
  };
  // les trottoirs devant les deux rangées et le long de la Grande Rue
  for (const [y, h] of [[NORD, 18], [RUE - 18, 18], [RUE2, 16], [SUD, 16]]) {
    Sol.trottoir(P, 0, y, W, h, r); P.g.globalAlpha = 0.45; P.rect(0, y, W, h, '#eef3fb'); P.g.globalAlpha = 1;
  }
  Sol.bordure(P, 0, RUE - 2, W); Sol.bordure(P, 0, RUE2, W, false); Sol.bordure(P, 0, SUD + 14, W);
  // la place de l'église, pavée
  pavesNeige(330, NORD + 18, 552, RUE - 18 - NORD - 18);
  // la Grande Rue : chaussée sombre, neige tassée sur les bords, ligne blanche, passage piéton devant la place
  P.rect(0, RUE, W, RUE2 - RUE, '#56566a'); P.speckle(0, RUE, W, RUE2 - RUE, ['#4c4c60', '#626276', '#5a5a70'], 0.3, r);
  for (let x = 0; x < W; x++) { const a = 2 + Math.round(Math.abs(Math.sin(x * 0.09)) * 3), b = 2 + Math.round(Math.abs(Math.sin(x * 0.07 + 2)) * 3); P.rect(x, RUE, 1, a, '#dfe6f2'); P.rect(x, RUE2 - b, 1, b, '#dfe6f2'); }
  for (let x = 0; x < W; x += 28) P.rect(x, (RUE + RUE2) / 2 - 1, 14, 2, '#eef0f6');
  for (let x = 572; x < 640; x += 8) P.rect(x, RUE + 5, 5, RUE2 - RUE - 10, '#eef0f6');
  for (let k = 0; k < 6; k++) { const y = RUE + 14 + k * 6; for (let x = 0; x < W; x += 3) if (r.chance(0.18)) P.px(x, y + r.int(3), '#6e6e84'); } // les traces de pneus
  // les deux ruelles et la petite rue du bas, pavées
  for (const ax of [300, 860]) pavesNeige(ax, RUE2 + 16, 36, SUD - RUE2 - 16);
  pavesNeige(0, SUD + 16, W, 40, { base: ['#7c7c90', '#86869c', '#74748a'], hi: '#a4a4b8', lo: '#606076', joint: '#525268' });
  // le mur du bas et sa haie enneigée
  P.rect(0, H - 16, W, 16, '#8a8070'); for (let x = 0; x < W; x += 9) P.vline(x, H - 16, 16, '#6a6254');
  for (let x = 0; x < W; x += 6) { P.ellipse(x, H - 18, 5, 4, '#2f5a3a'); P.ellipse(x - 1, H - 20, 4, 2, '#eef3fb'); }
  C.solide(0, H - 18, W, 18);

  // ---------------------------------------------------------------- collisions du fond
  C.solide(0, 0, W, NORD - 30);

  // ---------------------------------------------------------------- les deux rangées de maisons et de boutiques
  // une maison vendéenne : murs crème, toit de tuiles, volets bleus, guirlandes (dessin d'Arendelle)
  const maison = (seed, x, base, o, sud) => {
    const m = A.maison(seed, Object.assign({ tuiles: true, couleur: ['#efe6d4', '#f2ead8', '#e8dcc4', '#f4ecdc'][seed % 4], volets: ['#3a6aa8', '#5a8aa8', '#2f6a5a', '#3a6aa8'][seed % 4] }, o));
    const cx = x + m.largeur / 2;
    C.objet(m, cx, base);
    C.solide(cx - m.mur / 2, sud ? RUE2 + 16 : base - 30, m.mur, sud ? base - RUE2 - 16 : 30);
    m.lumieres.forEach(([lx, ly, rr, kk]) => C.lumiere(cx - m.ax + lx, base - m.ay + ly, rr, kk));
    m.ampoules.forEach(([bx, by]) => C.scintille.push([cx - m.ax + bx, base - m.ay + by]));
    if (m.fumee) C.fumees.push({ x: cx - m.ax + m.fumee[0], y: base - m.ay + m.fumee[1], t: r() * 2 });
    for (let k = 0; k < 4; k++) O.rect(cx - m.mur / 2 - 2, base + k, m.mur + 4, 1, '#000');
    return x + m.largeur + 4;
  };
  // un vieil immeuble de pierre avec sa boutique (dessin du premier quartier), décoré pour Noël
  const boutique = (o, x, base, texte, sud) => {
    const b = Batiments.building(Object.assign({ style: 'ancien', etages: 2, cheminees: 1 }, o));
    C.batiment(b, x, base);
    if (sud) C.solide(x, RUE2 + 16, b.w, base - b.h + b.roofY + 10 - RUE2 - 16);
    M.facadeNoel(b, o.boutique === 'porte' || o.boutique === 'hotel').forEach(([bx, by]) => C.scintille.push([x + bx, base - b.h + by]));
    if (texte) C.zone(x + b.w / 2 - 14, base - 4, 28, 10, texte);
    return x + b.w + 4;
  };
  let x = 6;
  x = maison(401, x, NORD, { w: 64, style: 'pignon' });
  x = boutique({ w: 96, facade: 'creme', boutique: 'boulangerie', volets: '#3a6aa8', seed: 411 }, x, NORD, 'boulangerieMontaigu');
  x = boutique({ w: 84, facade: 'blanc', boutique: 'pharmacie', volets: '#2f6a5a', seed: 412 }, x, NORD, 'pharmacieMontaigu');
  x = maison(402, x, NORD, { w: 66, style: 'long' });
  // l'église, au milieu, et le restaurant juste à côté
  const eg = M.eglise(), egx = 560;
  C.objet(eg, egx, NORD, { solide: [-52, -40, 104, 40] });
  eg.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(egx - eg.ax + lx, NORD - eg.ay + ly, rr, k));
  eg.ampoules.forEach(([bx, by]) => C.scintille.push([egx - eg.ax + bx, NORD - eg.ay + by]));
  C.zone(egx - 14, NORD - 4, 28, 10, 'egliseMontaigu');
  const resto = M.restaurant(), rx = 628;
  C.batiment(resto, rx, NORD);
  resto.ampoules.forEach(([bx, by]) => C.scintille.push([rx + bx, NORD - resto.h + by]));
  const porteResto = rx + resto.porte.x + resto.porte.w / 2;
  C.porte(porteResto - 10, NORD - 8, 20, 14, 'restaurant', 'entree', 'up');
  C.arrivees.devantResto = { x: porteResto, y: NORD + 14, dir: 'down' };
  for (const dx of [-30, 30]) C.objet(Objets.pot(dx > 0 ? 7 : 3, 'sapin'), porteResto + dx, NORD + 6, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(M.chevalet([8, 10, 6, 9]), porteResto + 46, NORD + 12, { solide: [-6, -3, 12, 4], texte: 'menuGusteau', zw: 20 });
  x = rx + resto.w + 6;
  x = boutique({ w: 82, facade: 'rose', boutique: 'fleuriste', volets: '#5a7a4a', seed: 421 }, x, NORD, 'fleuristeMontaigu');
  x = boutique({ w: 84, facade: 'creme', boutique: 'librairie', volets: '#3a5a8a', seed: 422 }, x, NORD, 'librairieMontaigu');
  x = maison(403, x, NORD, { w: 64, style: 'pignon' });
  x = boutique({ w: 84, facade: 'blanc', boutique: 'fromagerie', volets: '#2f6a5a', seed: 423 }, x, NORD, 'fromagerieMontaigu');
  maison(404, x, NORD, { w: 56, style: 'long' });

  // la rangée sud, qui donne sur la petite rue du bas (deux ruelles pour y passer)
  x = 6;
  x = maison(405, x, SUD, { w: 66, style: 'long' }, true);
  x = boutique({ w: 96, facade: 'ocre', boutique: 'cafe', volets: '#7a2a34', seed: 431 }, x, SUD, 'cafeMontaigu', true);
  x = boutique({ w: 88, facade: 'creme', boutique: 'patisserie', volets: '#3a6aa8', seed: 432 }, x, SUD, 'patisserieMontaigu', true);
  C.solide(x, RUE2 + 16, 300 - x, SUD - RUE2 - 16);
  x = 336;
  x = boutique({ w: 84, facade: 'gris', boutique: 'antiquaire', volets: '#5a4a3a', seed: 433 }, x, SUD, 'antiquaireMontaigu', true);
  x = maison(406, x, SUD, { w: 64, style: 'pignon' }, true);
  x = boutique({ w: 80, facade: 'creme', boutique: 'atelier', volets: '#3a6aa8', seed: 434 }, x, SUD, 'atelierMontaigu', true);
  x = maison(407, x, SUD, { w: 66, style: 'long' }, true);
  const MAIRIE = x + 64;
  x = boutique({ w: 128, facade: 'blanc', boutique: 'hotel', volets: '#2a4a7a', seed: 435, cheminees: 2 }, x, SUD, 'mairieMontaigu', true);
  C.solide(x, RUE2 + 16, 860 - x, SUD - RUE2 - 16);
  x = 896;
  x = maison(408, x, SUD, { w: 64, style: 'pignon' }, true);
  x = boutique({ w: 86, facade: 'rose', boutique: 'librairie', volets: '#5a7a4a', seed: 436 }, x, SUD, 'presseMontaigu', true);
  x = maison(409, x, SUD, { w: 62, style: 'long' }, true);
  C.solide(x, RUE2 + 16, W - x, SUD - RUE2 - 16);
  // le drapeau sur la mairie
  C.dynamiques.push({ sortY: SUD - 100, draw(g, J) {
    const t = J.t || 0; g.fillStyle = '#2a2632'; g.fillRect(MAIRIE, SUD - 128, 1, 22);
    for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) { g.fillStyle = ['#3a5ab8', '#f4f4f8', '#d8323a'][k]; g.fillRect(MAIRIE + 1 + k * 4 + i, SUD - 127 + Math.round(Math.sin(t * 4 + k + i * 0.5)), 1, 7); }
  } });

  // ---------------------------------------------------------------- la place de l'église : le grand sapin, le manège, les lampadaires
  C.objet(Objets.grandSapin(25), 606, 392, { solide: [-8, -4, 16, 5], ombre: [18, 5], lumiere: true, rayon: 84, k: 'xmas' });
  C.zone(592, 386, 28, 12, 'sapinMontaigu');
  const MX = 440, MY = 420;
  C.dynamiques.push({ sortY: MY, draw(g, J) { M.dessinManege(g, MX, MY, J.t || 0); } });
  C.solide(MX - 34, MY - 14, 68, 14); C.zone(MX - 30, MY - 2, 60, 10, 'manegeMontaigu');
  C.lumiere(MX, MY - 30, 70, 'xmas');
  for (const [lx, ly] of [[342, 300], [870, 300], [342, 458], [870, 458]]) C.objet(A.lampadaire(), lx, ly, { solide: [-2, -3, 5, 4], rayon: 60 });
  for (const [bx, by] of [[520, 452], [692, 452]]) C.objet(Objets.banc(), bx, by, { solide: [-13, -6, 26, 6], ombre: [13, 2], texte: 'bancMontaigu', zw: 26, zh: 14 });
  C.objet(Objets.pot(11, 'sapin'), 760, 330, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(12, 'sapin'), 452, 330, { solide: [-5, -3, 10, 4], ombre: [5, 2] });

  // ---------------------------------------------------------------- le jardin (ouest) : sapins, fontaine, bonhomme de neige, abribus
  const sapins = [0, 1, 2].map((k) => Foret.sapin(520 + k, 2 + (k % 2)));
  for (const [sx, sy] of [[30, 330], [96, 312], [262, 318], [312, 372], [22, 430]]) { C.objet(r.pick(sapins), sx, sy, { solide: [-4, -4, 8, 5] }); O.ellipse(sx + 4, sy - 3, 14, 5, '#000'); }
  C.objet(Objets.fontaine(), 170, 380, { solide: [-8, -5, 16, 6], ombre: [9, 3], texte: 'fontaineMontaigu', zw: 22 });
  C.objet(Objets.banc(), 120, 420, { solide: [-13, -6, 26, 6], ombre: [13, 2] });
  C.objet(A.bonhommeEnfants(), 248, 412, { solide: [-6, -3, 12, 4], ombre: [7, 2], texte: 'bonhommeMontaigu', zw: 18 });
  const abri = A.arretBus();
  C.objet(abri, 200, RUE - 6, { solide: [-20, -6, 50, 7] });
  abri.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(200 - abri.ax + lx, RUE - 6 - abri.ay + ly, rr, k));
  C.zone(182, RUE - 10, 40, 10, 'abribusMontaigu');
  C.objet(M.boitePoste(), 300, NORD + 16, { solide: [-3, -2, 6, 3], texte: 'boitePoste', zw: 12 });
  C.objet(M.panneauVille('MONTAIGU'), 40, RUE - 4, { solide: [-24, -2, 48, 3], texte: 'panneauMontaigu', zw: 40 });

  // ---------------------------------------------------------------- le marché de Noël (est)
  const chalets = [['chocolat', 'CHOCOLAT', 936, '#8a5a32', 'chaletChocolat'], ['marrons', 'MARRONS', 1012, '#7a4a2a', 'chaletMarrons'], ['crepes', 'CREPES', 1088, '#946238', 'chaletCrepes'], ['santons', 'SANTONS', 1164, '#6a4428', 'chaletSantons']];
  for (const [type, mot, cx, col, texte] of chalets) {
    const ch = M.chalet(type, mot, col), cy = 360;
    C.objet(ch, cx, cy, { solide: [-27, -14, 54, 14] });
    ch.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(cx - ch.ax + lx, cy - ch.ay + ly, rr, k));
    ch.ampoules.forEach(([bx, by]) => C.scintille.push([cx - ch.ax + bx, cy - ch.ay + by]));
    C.zone(cx - 18, cy - 4, 36, 12, texte);
  }
  C.objet(Objets.grandSapin(31), 1040, 448, { solide: [-8, -4, 16, 5], ombre: [18, 5], lumiere: true, rayon: 60, k: 'xmas' });
  for (const [bx, by] of [[960, 430], [1120, 430]]) C.objet(A.tonneaux(), bx, by, { solide: [-12, -3, 24, 4] });

  // ---------------------------------------------------------------- la Grande Rue : réverbères et guirlandes, les deux bouts barrés
  const lampes = [80, 240, 420, 600, 780, 960, 1120];
  for (const lx of lampes) C.objet(A.lampadaire(), lx, RUE2 + 12, { solide: [-2, -3, 5, 4], rayon: 56 });
  for (let k = 0; k < lampes.length - 1; k++) {
    const gl = M.guirlandeEntre(lampes[k] + 1, RUE2 + 12 - 34, lampes[k + 1] - 1, RUE2 + 12 - 34, 8);
    C.dessusImg(gl.img, gl.x, gl.y); gl.ampoules.forEach((a) => C.scintille.push(a));
  }
  for (const lx of [150, 460, 1000]) C.objet(A.lampadaire(), lx, SUD + 30, { solide: [-2, -3, 5, 4], rayon: 50 });
  C.objet(Foret.barriere(32), W - 34, RUE2 - 2, { solide: [0, -60, 34, 60] });
  C.zone(W - 40, RUE, 34, 60, 'routeBarree');
  C.solide(-10, RUE - 20, 12, 100);
  C.objet(Foret.barriere(32), W - 34, SUD + 52, { solide: [0, -40, 34, 40] });
  C.zone(W - 40, SUD + 12, 34, 40, 'routeBarree');
  C.solide(-10, SUD, 12, 60);

  // ---------------------------------------------------------------- les habitants
  const habitant = (o) => { const h = new Entites.Passant(Object.assign({ dialogue: (J) => EpreuveCaramel.repliques(o.id, J) }, o)); C.pnj.push(h); return h; };
  const P5 = CONFIG.caramel.persos;
  habitant({ id: 'mamie', x: 148, y: 422, regardeDefaut: 'down', cfg: P5.mamie });
  habitant({ id: 'vendeuse', x: 936, y: 374, regardeDefaut: 'down', cfg: P5.vendeuse });
  habitant({ id: 'petitGarcon', x: 500, y: 440, vitesse: 18, chemin: [{ x: 380, y: 446, pause: 2, regard: 'up' }, { x: 500, y: 440, pause: 2.5, regard: 'up' }], cfg: P5.petitGarcon });
  habitant({ id: 'facteur', x: 330, y: NORD + 26, vitesse: 22, chemin: [{ x: 520, y: NORD + 24, pause: 2, regard: 'up' }, { x: 300, y: NORD + 26, pause: 2.5, regard: 'up' }], cfg: P5.facteur });
  habitant({ id: 'monsieur', x: 760, y: RUE2 + 22, vitesse: 16, chemin: [{ x: 1080, y: RUE2 + 22, pause: 3, regard: 'up' }, { x: 640, y: RUE2 + 22, pause: 3, regard: 'up' }], cfg: P5.monsieur });
  habitant({ id: 'dameChien', x: 520, y: SUD + 30, vitesse: 14, chemin: [{ x: 820, y: SUD + 30, pause: 2, regard: 'up' }, { x: 380, y: SUD + 30, pause: 2, regard: 'up' }], cfg: P5.dameChien });

  // ---------------------------------------------------------------- l'arrivée du car
  C.montaigu = { bus: { x: 200, y: 522 } };
  C.arrivees.bus = { x: 200, y: 526, dir: 'down' };
  C.onEntree = (J) => Bus.arriveeMontaigu(J);
  C.finaliser(0.22);
  return C;
});
