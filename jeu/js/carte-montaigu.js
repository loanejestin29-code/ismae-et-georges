// =====================================================================
//  carte-montaigu.js — ZONE 5 : Montaigu, un soir de Noël (épreuve 5)
//
//  Une seule rue, la rue Georges-Clemenceau, avec des commerces des deux côtés, comme le vrai
//  centre de Montaigu : maisons de deux ou trois niveaux, enduit crème et blanc, chaînes d'angle
//  et encadrements de fenêtres en granit, toits d'ardoise (sous la neige), volets blancs,
//  lanternes de fer forgé, pavés de granit et bornes de pierre. L'église Saint-Jean-Baptiste et sa
//  grosse tour carrée (pas de flèche), la tour ronde des remparts du château au bout de la rue, la
//  mairie, la librairie, le bar-tabac et sa carotte rouge, l'office de tourisme… Pour « Noël à
//  Montaigu », quelques chalets et un manège dans le haut de la rue, fermée aux voitures.
//
//  Plan (en pixels, y vers le bas) :
//    y   0-196  le ciel, la rangée nord (on entre au restaurant du chef GUSTEAU)
//    y 196-222  le trottoir nord, ses bornes et ses lanternes
//    y 222-300  la rue pavée : le car s'arrête à l'ouest ; à l'est, les chalets, le manège,
//               puis la rue barrée (la sixième épreuve viendra plus tard)
//    y 300-330  le trottoir sud (l'abribus, les réverbères et leurs guirlandes)
//    y 330-452  la rangée sud, dont on voit les façades plus bas
// =====================================================================
'use strict';

Jeu.enregistrerCarte('montaigu', () => {
  const W = 1440, H = 452, A = Arendelle, M = Montaigu;
  const NORD = 196, RUE = 222, RUE2 = 300, TROT2 = 330, SUD = 444;
  const C = new Carte('montaigu', W, H, { ambiance: 'soir', fond: '#151026' });
  const P = C.P, r = PX.rng(85);
  C.neige = 1.2;

  // ---------------------------------------------------------------- le ciel, les toits du fond
  P.vgrad(0, 0, W, NORD, '#0e1430', '#2a3a6a');
  for (let k = 0; k < 160; k++) P.px(r.int(W), r.int(NORD - 70), r.chance(0.2) ? '#ffffff' : '#a8b8e8');
  P.ellipse(W - 210, 22, 9, 9, '#f4f0dc'); P.ellipse(W - 206, 20, 8, 8, '#1a2448'); // le croissant de lune
  for (let x = -20; x < W; x += 30 + r.int(30)) { // les toits d'ardoise des rues d'à côté, sous la neige
    const w = 40 + r.int(40), y = 60 + r.int(26);
    for (let j = 0; j < 30; j++) P.hline(x + j, y + j, w - j * 2 > 0 ? w : 0, j % 3 ? '#2e3448' : '#363d54');
    P.hline(x, y, w, '#c8d4e6'); P.hline(x, y - 1, w, '#eef3fb');
  }
  P.rect(0, NORD - 40, W, 40, '#2a2f44');

  // ---------------------------------------------------------------- sol : trottoirs et rue pavée sous la neige
  // pavés sous la neige : la neige s'épaissit vers les bords et se fond dans le sol autour
  const pavesNeige = (x0, y0, w, h, tons) => {
    const t = PX.canvas(w, h), T = PX.painter(t);
    Sol.paves(T, 0, 0, w, h, r, tons || { base: ['#8a8478', '#948d80', '#7f796e', '#9a9284'], hi: '#b0a898', lo: '#6a6458', joint: '#5a5448' });
    const pv = T.g.getImageData(0, 0, w, h).data, img = P.g.getImageData(x0, y0, w, h), d = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const gx = x0 + i, gy = y0 + j, dd = Math.min(j, h - 1 - j), k = (j * w + i) * 4;
      const plaque = Math.max(0, Math.sin(gx * 0.05 + Math.sin(gy * 0.033) * 2) * Math.sin(gy * 0.06 + Math.sin(gx * 0.02) * 1.6)) * 0.4;
      let a = Math.min(1, Math.max(0.3 + plaque, 1.05 - dd * 0.07));
      a = Math.min(1, Math.max(0, a + ((PX.bayer(gx, gy) / 16) - 0.5) * 0.1));
      d[k] = pv[k] * (1 - a) + d[k] * a; d[k + 1] = pv[k + 1] * (1 - a) + d[k + 1] * a; d[k + 2] = pv[k + 2] * (1 - a) + d[k + 2] * a;
    }
    P.g.putImageData(img, x0, y0);
  };
  P.rect(0, NORD, W, H - NORD, '#e6edf7');
  P.speckle(0, NORD, W, H - NORD, ['#f4f8ff', '#d8e2f0', '#eef3fb', '#cfdaea'], 0.12, r);
  for (const [y, h] of [[NORD, RUE - NORD], [RUE2, TROT2 - RUE2]]) {
    Sol.trottoir(P, 0, y, W, h, r); P.g.globalAlpha = 0.45; P.rect(0, y, W, h, '#eef3fb'); P.g.globalAlpha = 1;
  }
  // la rue : de gros pavés de granit gris, la neige tassée sur les côtés, des traces de pneus au milieu
  pavesNeige(0, RUE, W, RUE2 - RUE, { base: ['#7c7c88', '#868692', '#74747f', '#8e8c96'], hi: '#a8a8b4', lo: '#5e5e6a', joint: '#4e4e5a' });
  for (let k = 0; k < 6; k++) { const y = RUE + 24 + k * 6; for (let x = 0; x < 900; x += 3) if (r.chance(0.16)) P.px(x, y + r.int(3), '#5a5a68'); }
  Sol.bordure(P, 0, RUE - 2, W); Sol.bordure(P, 0, RUE2, W, false);
  for (let x = 520; x < 580; x += 8) P.rect(x, RUE + 6, 5, RUE2 - RUE - 12, 'rgba(240,242,248,0.85)'); // le passage piéton devant l'église

  // ---------------------------------------------------------------- collisions du fond
  C.solide(0, 0, W, NORD - 30);
  C.solide(-10, NORD, 12, TROT2 - NORD);
  C.solide(0, TROT2, W, H - TROT2);

  // ---------------------------------------------------------------- les façades
  // un immeuble de Montaigu (dessin du premier quartier) : enduit clair, granit, ardoises enneigées, volets blancs
  const MONTAIGU = { style: 'ancien', ardoise: true, neige: true, granit: true };
  const VOLETS = ['#eceef2', '#dfe3ea', '#eceef2', '#c8ccd4'];
  const lanterneSur = (b, x, base, dx) => { // une lanterne de fer forgé peinte sur la façade
    const l = M.lanterne(); PX.painter(b.img).g.drawImage(l.img, dx, b.h - 62);
    C.lumiere(x + dx + 5, base - 55, 40, 'lamp');
  };
  const facade = (o, x, base, texte, sud) => {
    const b = Batiments.building(Object.assign({ etages: sud ? 1 : 2, cheminees: 1, volets: VOLETS[(o.seed || 0) % 4] }, MONTAIGU, o));
    if (o.lanterne !== false) lanterneSur(b, x, base, o.lanterne === 'droite' ? b.w - 9 : 1);
    C.batiment(b, x, base);
    M.facadeNoel(b, o.boutique !== 'porte').forEach(([bx, by]) => C.scintille.push([x + bx, base - b.h + by]));
    // côté nord, on lit l'enseigne devant la porte ; côté sud, depuis le trottoir d'en face
    if (texte) C.zone(x + b.w / 2 - 14, sud ? TROT2 - 8 : base - 4, 28, sud ? 8 : 10, texte);
    return { b, fin: x + b.w + 3 };
  };
  const ecrire = (b, mot, fond, col) => { // le nom, peint sur le bandeau de l'enseigne
    const y = b.h - 44;
    const P2 = PX.painter(b.img), w = A.largeurTexte(mot) + 8, x = Math.round(b.w / 2 - w / 2);
    P2.rect(x, y, w, 9, fond); P2.hline(x, y, w, PX.shade(fond, 0.3)); A.texte(P2, mot, x + 4, y + 2, col);
  };

  // la rangée nord, d'ouest en est : la tour des remparts, des boutiques, l'église, le restaurant…
  const tour = M.tourRemparts();
  C.objet(tour, 0, NORD, { solide: [0, -26, 120, 26] });
  tour.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(lx, NORD - tour.ay + ly, rr, k));
  C.zone(10, NORD - 4, 50, 10, 'rempartsMontaigu');
  let x = 122;
  x = facade({ w: 70, facade: 'blanc', boutique: 'porte', seed: 501, porte: '#2c3a5e' }, x, NORD).fin;
  x = facade({ w: 96, facade: 'creme', boutique: 'boulangerie', seed: 502 }, x, NORD, 'boulangerieMontaigu').fin;
  x = facade({ w: 84, facade: 'blanc', boutique: 'pharmacie', seed: 503, lanterne: 'droite' }, x, NORD, 'pharmacieMontaigu').fin;
  const eg = M.eglise(), egx = x + 68;
  C.objet(eg, egx, NORD, { solide: [-62, -40, 124, 40] });
  eg.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(egx - eg.ax + lx, NORD - eg.ay + ly, rr, k));
  eg.ampoules.forEach(([bx, by]) => C.scintille.push([egx - eg.ax + bx, NORD - eg.ay + by]));
  C.zone(egx - 14, NORD - 4, 28, 10, 'egliseMontaigu');
  x = egx + 70;
  const resto = M.restaurant(), rx = x;
  C.batiment(resto, rx, NORD);
  resto.ampoules.forEach(([bx, by]) => C.scintille.push([rx + bx, NORD - resto.h + by]));
  const porteResto = rx + resto.porte.x + resto.porte.w / 2;
  C.porte(porteResto - 10, NORD - 8, 20, 14, 'restaurant', 'entree', 'up');
  C.arrivees.devantResto = { x: porteResto, y: NORD + 14, dir: 'down' };
  for (const dx of [-30, 30]) C.objet(Objets.pot(dx > 0 ? 7 : 3, 'sapin'), porteResto + dx, NORD + 6, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(M.chevalet([8, 10, 6, 9]), porteResto + 46, NORD + 12, { solide: [-6, -3, 12, 4], texte: 'menuGusteau', zw: 20 });
  x = rx + resto.w + 3;
  const lib = facade({ w: 88, facade: 'creme', boutique: 'librairie', seed: 504 }, x, NORD, 'librairieMontaigu');
  ecrire(lib.b, 'LES TROIS MONDES', '#26385f', '#e2c25e'); x = lib.fin;
  const tabac = facade({ w: 96, facade: 'blanc', boutique: 'cafe', seed: 505, lanterne: false }, x, NORD, 'tabacMontaigu');
  PX.painter(tabac.b.img).g.drawImage(M.carotte().img, tabac.b.w - 10, tabac.b.h - 74);
  ecrire(tabac.b, 'BAR TABAC', '#7a1e26', '#f4e4c8'); x = tabac.fin;
  x = facade({ w: 64, facade: 'gris', boutique: 'porte', seed: 506, porte: '#5a2a2e' }, x, NORD).fin;
  const ot = facade({ w: 104, facade: 'blanc', boutique: 'porte', seed: 507, porte: '#2a4a7a' }, x, NORD, 'tourismeMontaigu');
  ecrire(ot.b, 'OFFICE DE TOURISME', '#2a5aa8', '#f4f4f8');
  PX.painter(ot.b.img).g.drawImage(M.panneauInfo().img, ot.b.w - 16, ot.b.h - 42); x = ot.fin;
  x = facade({ w: 84, facade: 'creme', boutique: 'fromagerie', seed: 508 }, x, NORD, 'fromagerieMontaigu').fin;
  x = facade({ w: 72, facade: 'blanc', boutique: 'porte', seed: 509 }, x, NORD).fin;
  const reste = () => (W - x < 110 ? Math.max(48, W - x + 6) : 80); // on finit la rangée, quitte à déborder un peu
  while (x < W) x = facade({ w: reste(), facade: r.pick(['creme', 'blanc', 'gris']), boutique: 'porte', seed: 510 + x }, x, NORD).fin;

  // la rangée sud : on voit ses façades en bas ; on les regarde depuis le trottoir d'en face
  x = 0;
  x = facade({ w: 70, facade: 'blanc', boutique: 'porte', seed: 521 }, x, SUD, null, true).fin;
  x = facade({ w: 88, facade: 'creme', boutique: 'patisserie', seed: 522 }, x, SUD, 'patisserieMontaigu', true).fin;
  x = facade({ w: 86, facade: 'blanc', boutique: 'librairie', seed: 523, lanterne: 'droite' }, x, SUD, 'presseMontaigu', true).fin;
  x = facade({ w: 82, facade: 'creme', boutique: 'fleuriste', seed: 524 }, x, SUD, 'fleuristeMontaigu', true).fin;
  const MAIRIE = x + 75;
  const mairie = facade({ w: 150, facade: 'creme', boutique: 'hotel', seed: 525, cheminees: 2 }, x, SUD, 'mairieMontaigu', true);
  ecrire(mairie.b, 'MAIRIE', '#efe6d4', '#2a3a6a'); x = mairie.fin;
  x = facade({ w: 84, facade: 'gris', boutique: 'antiquaire', seed: 526 }, x, SUD, 'antiquaireMontaigu', true).fin;
  x = facade({ w: 80, facade: 'blanc', boutique: 'atelier', seed: 527 }, x, SUD, 'atelierMontaigu', true).fin;
  x = facade({ w: 66, facade: 'creme', boutique: 'porte', seed: 528 }, x, SUD, null, true).fin;
  x = facade({ w: 96, facade: 'blanc', boutique: 'cafe', seed: 529 }, x, SUD, 'cafeMontaigu', true).fin;
  while (x < W) x = facade({ w: reste(), facade: r.pick(['creme', 'blanc']), boutique: 'porte', seed: 530 + x }, x, SUD, null, true).fin;
  // le drapeau sur la mairie
  const fy = SUD - mairie.b.h + 20;
  C.dynamiques.push({ sortY: SUD + 1, draw(g, J) {
    const t = J.t || 0; g.fillStyle = '#2a2632'; g.fillRect(MAIRIE, fy - 10, 1, 22);
    for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) { g.fillStyle = ['#3a5ab8', '#f4f4f8', '#d8323a'][k]; g.fillRect(MAIRIE + 1 + k * 4 + i, fy - 9 + Math.round(Math.sin(t * 4 + k + i * 0.5)), 1, 7); }
  } });

  // ---------------------------------------------------------------- les trottoirs : bornes de granit, réverbères et leurs guirlandes
  for (let bx = 140; bx < W - 60; bx += 44) if (Math.abs(bx - porteResto) > 26 && Math.abs(bx - egx) > 20) C.objet(M.borne(), bx, RUE - 2, { solide: [-3, -3, 6, 4] });
  const lampes = [110, 330, 560, 790, 1020, 1250];
  for (const lx of lampes) C.objet(A.lampadaire(), lx, TROT2 - 4, { solide: [-2, -3, 5, 4], rayon: 56 });
  for (let k = 0; k < lampes.length - 1; k++) {
    const gl = M.guirlandeEntre(lampes[k] + 1, TROT2 - 4 - 34, lampes[k + 1] - 1, TROT2 - 4 - 34, 8);
    C.dessusImg(gl.img, gl.x, gl.y); gl.ampoules.forEach((a) => C.scintille.push(a));
  }
  const abri = A.arretBus(), ax = 230;
  C.objet(abri, ax, TROT2 - 2, { solide: [-20, -6, 50, 7] });
  abri.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(ax - abri.ax + lx, TROT2 - 2 - abri.ay + ly, rr, k));
  C.zone(ax - 18, TROT2 - 8, 40, 8, 'abribusMontaigu');
  C.objet(M.panneauVille('MONTAIGU'), 40, TROT2 - 2, { solide: [-24, -2, 48, 3], texte: 'panneauMontaigu', zw: 40 });
  C.objet(M.boitePoste(), 400, NORD + 16, { solide: [-3, -2, 6, 3], texte: 'boitePoste', zw: 12 });

  // ---------------------------------------------------------------- Noël à Montaigu : le haut de la rue est fermé aux voitures
  const chalets = [['chocolat', 'CHOCOLAT', 1010, '#8a5a32', 'chaletChocolat'], ['marrons', 'MARRONS', 1086, '#7a4a2a', 'chaletMarrons'], ['crepes', 'CREPES', 1162, '#946238', 'chaletCrepes']];
  for (const [type, mot, cx, col, texte] of chalets) {
    const ch = M.chalet(type, mot, col), cy = 284;
    C.objet(ch, cx, cy, { solide: [-27, -14, 54, 14] });
    ch.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(cx - ch.ax + lx, cy - ch.ay + ly, rr, k));
    ch.ampoules.forEach(([bx, by]) => C.scintille.push([cx - ch.ax + bx, cy - ch.ay + by]));
    C.zone(cx - 18, cy - 4, 36, 12, texte);
  }
  const MX = 1290, MY = 262;
  C.dynamiques.push({ sortY: MY, draw(g, J) { M.dessinManege(g, MX, MY, J.t || 0); } });
  C.solide(MX - 34, MY - 14, 68, 14); C.zone(MX - 30, MY - 2, 60, 10, 'manegeMontaigu');
  C.lumiere(MX, MY - 30, 70, 'xmas');
  for (const by of [RUE + 24, RUE + 50, RUE2 - 2]) C.objet(Foret.barriere(32), W - 34, by, { solide: [0, -26, 34, 26] }); // la rue barrée, d'un trottoir à l'autre
  C.zone(W - 40, RUE, 34, 78, 'routeBarree');

  // ---------------------------------------------------------------- les habitants
  const habitant = (o) => { const h = new Entites.Passant(Object.assign({ dialogue: (J) => EpreuveCaramel.repliques(o.id, J) }, o)); C.pnj.push(h); return h; };
  const P5 = CONFIG.caramel.persos;
  habitant({ id: 'mamie', x: 300, y: NORD + 12, regardeDefaut: 'down', cfg: P5.mamie });
  habitant({ id: 'vendeuse', x: 1010, y: 298, regardeDefaut: 'down', cfg: P5.vendeuse });
  habitant({ id: 'petitGarcon', x: 1230, y: 296, vitesse: 18, chemin: [{ x: 1340, y: 296, pause: 2, regard: 'up' }, { x: 1230, y: 296, pause: 2.5, regard: 'up' }], cfg: P5.petitGarcon });
  habitant({ id: 'facteur', x: 440, y: NORD + 14, vitesse: 22, chemin: [{ x: 640, y: NORD + 14, pause: 2, regard: 'up' }, { x: 420, y: NORD + 14, pause: 2.5, regard: 'up' }], cfg: P5.facteur });
  habitant({ id: 'monsieur', x: 1370, y: 236, vitesse: 14, chemin: [{ x: 1370, y: 284, pause: 3, regard: 'right' }, { x: 1370, y: 236, pause: 3, regard: 'right' }], cfg: P5.monsieur });
  habitant({ id: 'dameChien', x: 860, y: NORD + 14, vitesse: 14, chemin: [{ x: 1180, y: NORD + 14, pause: 2, regard: 'up' }, { x: 820, y: NORD + 14, pause: 2, regard: 'up' }], cfg: P5.dameChien });

  // Linguini, qui vient chercher Ismae à la descente du car puis l'attend devant le restaurant (bus.js)
  C.linguini = new Entites.Perso({ id: 'linguini', cfg: P5.linguini, x: porteResto, y: NORD + 14, dir: 'down', visible: false, vitesse: 110, dialogue: (J) => EpreuveCaramel.repliques('linguiniRue', J) });
  C.pnj.push(C.linguini);

  // ---------------------------------------------------------------- l'arrivée du car (et Flash McQueen, garé un peu plus loin)
  C.montaigu = { bus: { x: 230, y: 292 }, flash: { x: 470, y: 296 }, porteResto: { x: porteResto, y: NORD + 14 } };
  C.arrivees.bus = { x: 284, y: 312, dir: 'down' };
  C.onEntree = (J) => Bus.arriveeMontaigu(J);
  C.finaliser(0.22);
  return C;
});
