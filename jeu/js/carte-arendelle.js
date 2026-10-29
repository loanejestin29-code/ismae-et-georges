// =====================================================================
//  carte-arendelle.js — ZONE 4 : Arendelle sous la neige (épreuve 3)
//
//  Plan (en pixels, y vers le bas) :
//    y    0-200  le ciel d'aurore boréale, les montagnes et le palais de glace d'Elsa (décor)
//    y  200-440  le château aux toits de cuivre vert, sa cour et la fontaine gelée,
//                le mur d'enceinte et ses grandes portes
//    y  456-504  le canal gelé, traversé par le pont du château
//    y  504-930  le village : maisons colorées, la grande place (sapin, marché de Noël, puits)
//    ouest        le fjord gelé (on y glisse), les bateaux pris dans la glace, les patineuses
//    est          la forêt de sapins, la clairière des trolls, le comptoir d'Oaken (et sauna)
//    sud-est      l'écurie de Kristoff et Sven, puis l'arrêt de bus à la sortie d'Arendelle
//    sud          l'arrivée depuis la forêt de Sherwood, la colline aux luges
// =====================================================================
'use strict';

Jeu.enregistrerCarte('arendelle', () => {
  const W = 1600, H = 1200, HAUT = 200;
  const C = new Carte('arendelle', W, H, { ambiance: 'soir', fond: '#0e1430' });
  const P = C.P, O = C.O, r = PX.rng(1225), A = Arendelle;
  const N = A.NEIGE, N2 = A.NEIGE2, N3 = A.NEIGE3;
  C.neige = 1.6;

  // ---------------------------------------------------------------- sol : neige partout
  P.rect(0, 0, W, H, '#e6edf7');
  P.speckle(0, HAUT, W, H - HAUT, ['#f4f8ff', '#d8e2f0', '#eef3fb', '#cfdaea'], 0.12, r);
  for (let k = 0; k < 220; k++) P.ellipse(r.int(W), HAUT + r.int(H - HAUT), 8 + r.int(26), 3 + r.int(8), r.chance(0.5) ? 'rgba(255,255,255,0.35)' : 'rgba(150,170,210,0.10)');
  // le fond : ciel, aurore boréale, montagnes, palais de glace
  A.fond(P, W, 186, r);
  A.palais(P, 1210, 96);
  C.lumiere(1210, 70, 70, 'neon');
  C.solide(0, 0, W, HAUT);

  // ---------------------------------------------------------------- le fjord et le canal, gelés
  const LAC = { x: 0, y: 206, w: 418, h: 914 }, CANAL = { x: 0, y: 456, w: 1180, h: 48 };
  const glace = (z) => {
    P.rect(z.x, z.y, z.w, z.h, '#b8d8ee');
    P.speckle(z.x, z.y, z.w, z.h, ['#c8e4f6', '#a8cce6', '#d8eefa'], 0.08, r);
    for (let k = 0; k < z.w * z.h / 3000; k++) { const x = z.x + r.int(z.w), y = z.y + r.int(z.h); P.rect(x, y, 10 + r.int(30), 1, 'rgba(255,255,255,0.55)'); }
    for (let k = 0; k < z.w * z.h / 9000; k++) { // fissures
      let x = z.x + r.int(z.w), y = z.y + r.int(z.h);
      for (let s = 0; s < 6; s++) { const nx = x + r.int(15) - 7, ny = y + r.int(9) - 4; Objets.line(P, x, y, nx, ny, '#e8f6ff'); x = nx; y = ny; }
    }
  };
  glace(LAC); glace(CANAL);
  // berges enneigées, irrégulières
  for (let y = LAC.y; y < LAC.y + LAC.h; y++) { const b = 3 + Math.round(Math.abs(Math.sin(y * 0.05)) * 6 + Math.sin(y * 0.19) * 2); P.rect(LAC.x + LAC.w - b, y, b + 4, 1, N); P.px(LAC.x + LAC.w - b, y, N3); }
  for (let x = LAC.x; x < LAC.x + LAC.w; x++) { const b = 3 + Math.round(Math.abs(Math.sin(x * 0.07)) * 5); P.rect(x, LAC.y + LAC.h - b, 1, b + 6, N); P.px(x, LAC.y + LAC.h - b, N3); P.rect(x, LAC.y - 2, 1, 3 + (x % 3), N); }
  for (let x = CANAL.x + LAC.w; x < CANAL.w; x++) { P.px(x, CANAL.y, N3); P.rect(x, CANAL.y - 2, 1, 2, N); P.px(x, CANAL.y + CANAL.h, N3); P.rect(x, CANAL.y + CANAL.h + 1, 1, 2, N); }
  C.glaces = [LAC, CANAL];
  C.solide(CANAL.w, CANAL.y - 2, 8, CANAL.h + 4);
  C.zone(398, 600, 24, 40, 'lacGele');
  // les bateaux pris dans la glace
  C.objet(A.bateauGele(3), 170, 380, { solide: [-44, -14, 88, 12], texte: 'bateauGele', zw: 60 });
  C.objet(A.bateauGele(9), 270, 720, { solide: [-44, -14, 88, 12], texte: 'bateauGele', zw: 60 });
  // le trou du pêcheur
  P.ellipse(230, 962, 7, 3, '#2a4a6a'); P.ellipse(230, 962, 5, 2, '#1a2a4a'); P.ellipse(230, 960, 9, 2, '#e8f6ff');
  C.zone(222, 954, 16, 12, 'trouPeche');
  C.objet(A.pancarte(['ATTENTION', 'GLACE']), 436, 552, { solide: [-2, -2, 4, 3] });
  C.objet(A.transat(), 452, 930, { solide: [-12, -6, 24, 6], texte: 'transat', zw: 24 });
  // la longue-vue, au bord du fjord
  C.dynamiques.push({ sortY: 760, draw(g) { g.fillStyle = '#2a2632'; g.fillRect(429, 744, 2, 16); g.fillRect(426, 758, 8, 2); g.fillStyle = '#c89a4a'; g.fillRect(427, 740, 9, 3); g.fillStyle = '#e8c070'; g.fillRect(428, 740, 4, 1); } });
  C.solide(426, 756, 8, 4); C.zone(420, 748, 20, 14, 'longueVue');

  // ---------------------------------------------------------------- rues et place pavées sous la neige
  // rue pavée déneigée au milieu (vieux pavés, traces de traîneau), poudrée de neige, congères sur les bords
  const pavesNeige = (x, y, w, h, place = false) => {
    Sol.paves(P, x, y, w, h, r, { base: ['#7c7c90', '#86869c', '#74748a', '#8c8698'], hi: '#a4a4b8', lo: '#606076', joint: '#525268' });
    const horiz = w >= h, L = horiz ? h : w;
    const img = P.g.getImageData(x, y, w, h), d = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      // t : 0 au milieu de la rue (déneigé), 1 sur les bords ; sur la place, on part du centre
      const t = place ? Math.hypot((i / w - 0.5) * 2, (j / h - 0.5) * 2) / 1.2 : Math.abs(((horiz ? j : i) + 0.5) / L - 0.5) * 2;
      const traces = !place && Math.abs(t - 0.42) < 0.07; // les ornières des traîneaux, plus sombres
      let a = traces ? 0.12 : Math.min(0.92, Math.max(0.3, (t - 0.15) * 1.25));
      a += ((PX.bayer(x + i, y + j) / 16) - 0.5) * 0.12; // un grain très léger
      const k = (j * w + i) * 4;
      d[k] = d[k] * (1 - a) + 0xe6 * a; d[k + 1] = d[k + 1] * (1 - a) + 0xec * a; d[k + 2] = d[k + 2] * (1 - a) + 0xf6 * a;
    }
    P.g.putImageData(img, x, y);
    if (place) return;
    // congères le long des bords
    for (let k = 0; k < (horiz ? w : h); k += 2) {
      const a = 2 + Math.round(Math.abs(Math.sin(k * 0.13 + x)) * 3);
      if (horiz) { P.rect(x + k, y, 2, a, N); P.rect(x + k, y + h - a, 2, a, N); P.px(x + k, y + a, N3); P.px(x + k, y + h - a - 1, N3); }
      else { P.rect(x, y + k, a, 2, N); P.rect(x + w - a, y + k, a, 2, N); P.px(x + a, y + k, N3); P.px(x + w - a - 1, y + k, N3); }
    }
    for (let k = 0; k < (w * h) / 700; k++) { const px = x + r.int(w), py = y + r.int(h); P.rect(px, py, 2, 1, '#9aa4bc'); P.rect(px + 2, py + 4, 2, 1, '#9aa4bc'); }
  };
  pavesNeige(590, 330, 420, 112);           // cour du château
  pavesNeige(776, 440, 48, 70);             // pont
  pavesNeige(450, 600, 730, 44);            // rue du nord, devant les maisons
  pavesNeige(640, 640, 320, 170, true);     // la grande place
  pavesNeige(760, 810, 80, 380);            // la grand-rue jusqu'à l'arrivée
  pavesNeige(450, 830, 730, 40);            // rue du sud
  // sentiers tassés dans la neige
  const sentier = (pts, larg) => {
    for (let s = 0; s < pts.length - 1; s++) {
      const [x0, y0] = pts[s], [x1, y1] = pts[s + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3);
      for (let k = 0; k <= n; k++) { const t = k / n; P.ellipse(x0 + (x1 - x0) * t + r.int(3) - 1, y0 + (y1 - y0) * t, larg / 2, larg / 3, '#d0dae8'); }
    }
    for (let s = 0; s < pts.length - 1; s++) {
      const [x0, y0] = pts[s], [x1, y1] = pts[s + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6);
      for (let k = 0; k <= n; k++) { const t = k / n; P.px(x0 + (x1 - x0) * t + r.int(larg) - larg / 2, y0 + (y1 - y0) * t + r.int(5) - 2, '#b8c6da'); }
    }
  };
  const SENTIERS = [
    [[1180, 620], [1230, 560], [1262, 450], [1290, 340]],                 // vers le comptoir d'Oaken
    [[1180, 850], [1260, 900], [1300, 1030], [1420, 1080], [1540, 1150], [1600, 1160]], // vers l'écurie et l'arrêt de bus
    [[1180, 620], [1300, 600], [1400, 560]],                              // vers la clairière
    [[450, 850], [470, 980], [560, 1060]],                                // vers la colline aux luges
  ];
  SENTIERS.forEach((s) => sentier(s, 22));
  // la cour, le pont et ses parapets
  C.solide(570, 330, 20, 112); C.solide(1010, 330, 20, 112);
  for (const x of [772, 824]) { C.solide(x, 452, 4, 56); P.rect(x, 452, 4, 56, '#c4b698'); P.vline(x, 452, 56, '#e2d6bc'); for (let y = 454; y < 506; y += 8) P.rect(x - 1, y, 6, 3, N); }

  // ---------------------------------------------------------------- le château d'Arendelle et son enceinte
  const chateau = A.chateau();
  C.objet(chateau, 800, 330, { solide: [-226, -96, 452, 96] });
  chateau.lumieres.forEach(([x, y, rr, k]) => C.lumiere(800 - chateau.ax + x, 330 - chateau.ay + y, rr, k));
  C.zone(782, 324, 36, 10, 'porteChateau');
  const fontaine = A.fontaineGelee();
  C.objet(fontaine, 800, 404, { solide: [-24, -10, 48, 12], ombre: [26, 6] });
  fontaine.lumieres.forEach(([x, y, rr, k]) => C.lumiere(800 - fontaine.ax + x, 404 - fontaine.ay + y, rr, k));
  C.zone(774, 396, 52, 14, null, { dialogue: (J) => EpreuveNeige.fontaine(J) });
  C.objet(A.muraille(174), 590, 452, { solide: [0, -12, 174, 12] });
  C.objet(A.muraille(174), 836, 452, { solide: [0, -12, 174, 12] });
  C.objet(A.portail(), 800, 452, { dy: 1 });
  C.solide(764, 440, 12, 12); C.solide(824, 440, 12, 12);
  // les grandes portes : elles s'ouvrent quand Ismae approche
  const portes = { ouvert: 0, voulu: 0, sortY: 452.5, solide: { x: 776, y: 440, w: 48, h: 12 },
    update(dt, J) {
      if (!this.voulu && Math.hypot(J.joueur.x - 800, J.joueur.y - 460) < 70) { this.voulu = 1; Musique.porte(); }
      this.ouvert = Math.min(1, this.ouvert + (this.voulu ? dt * 0.8 : 0));
      if (this.ouvert > 0.8 && C.solides.includes(this.solide)) C.solides.splice(C.solides.indexOf(this.solide), 1);
    },
    draw(g) {
      const w = Math.round(24 * (1 - this.ouvert * 0.85));
      for (const s of [-1, 1]) {
        const x = s < 0 ? 776 : 824 - w;
        g.fillStyle = '#4a2e1c'; g.fillRect(x, 410, w, 42);
        g.fillStyle = '#6a4428'; for (let k = 1; k < w; k += 4) g.fillRect(x + k, 411, 2, 40);
        g.fillStyle = '#e8b54a'; g.fillRect(x, 420, w, 1); g.fillRect(x, 440, w, 1);
      }
    } };
  C.solides.push(portes.solide);
  C.dynamiques.push(portes);
  C.zone(776, 440, 48, 14, 'portesChateau');
  // bannières sur le pont
  C.dessusImg(Foret.fanions(120, 10, ['#6a3a8a', '#4f9a7a', '#e8b54a']), 740, 444);

  // ---------------------------------------------------------------- les maisons du village
  const maisons = [];
  const rangee = (x0, base, defs) => {
    let x = x0;
    for (const d of defs) {
      if (d.saut) { x += d.saut; continue; }
      const m = A.maison(d.seed, d), cx = x + m.largeur / 2;
      C.objet(m, cx, base, {});
      C.solide(cx - m.mur / 2, d.fond ?? base - 26, m.mur, base - (d.fond ?? base - 26));
      m.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(cx - m.ax + lx, base - m.ay + ly, rr, k));
      m.ampoules.forEach(([bx, by]) => C.scintille.push([cx - m.ax + bx, base - m.ay + by]));
      if (m.fumee) C.fumees.push({ x: cx - m.ax + m.fumee[0], y: base - m.ay + m.fumee[1], t: r() * 2 });
      C.zone(cx - 8, base - 6, 16, 10, 'maisonArendelle');
      maisons.push({ x: cx, y: base });
      x += m.largeur + 4;
    }
  };
  rangee(452, 600, [
    { seed: 11, w: 62, style: 'long', couleur: '#a8343a', fond: 508 }, { seed: 12, w: 56, style: 'pignon', couleur: '#d8a838', fond: 508, boutique: 'bageri' },
    { seed: 13, w: 64, style: 'long', couleur: '#3a6aa8', fond: 508 }, { seed: 14, w: 50, style: 'pignon', couleur: '#4f8a5a', fond: 508 },
    { saut: 72 },
    { seed: 15, w: 56, style: 'pignon', couleur: '#c86a3a', fond: 508, boutique: 'sjokolade' }, { seed: 16, w: 62, style: 'long', couleur: '#8a4a8a', fond: 508 },
    { seed: 17, w: 54, style: 'pignon', couleur: '#2f7a8a', fond: 508, boutique: 'strikk' }, { seed: 18, w: 60, style: 'long', couleur: '#e8d8b8', fond: 508 },
  ]);
  rangee(452, 830, [{ seed: 21, w: 66, style: 'pignon', couleur: '#3a6aa8', etages: 3, boutique: 'leker' }, { seed: 22, w: 66, style: 'long', couleur: '#d8a838', etages: 3 }]);
  rangee(986, 830, [{ seed: 23, w: 66, style: 'long', couleur: '#4f8a5a', etages: 3, boutique: 'kafe' }, { seed: 24, w: 56, style: 'pignon', couleur: '#a8343a', etages: 3 }]);
  rangee(452, 1000, [{ seed: 25, w: 60, style: 'long', couleur: '#8a4a8a' }]);
  rangee(1000, 1000, [{ seed: 26, w: 64, style: 'pignon', couleur: '#c86a3a' }]);
  rangee(646, 960, [{ seed: 27, w: 60, style: 'pignon', couleur: '#e8d8b8', boutique: 'bageri' }]);
  rangee(856, 960, [{ seed: 28, w: 62, style: 'long', couleur: '#2f7a8a' }]);
  // le petit mobilier : bancs, bûches, tonneaux, boîte aux lettres, bannières, statue
  const mobilier = [
    [A.banc(), 560, 640, [-13, -3, 26, 4], 'banc'], [A.banc(), 1040, 640, [-13, -3, 26, 4], 'banc'], [A.banc(), 612, 880, [-13, -3, 26, 4], 'banc'],
    [A.buches(), 540, 612, [-12, -3, 24, 4], 'buches'], [A.buches(), 1100, 842, [-12, -3, 24, 4], 'buches'], [A.buches(), 620, 972, [-12, -3, 24, 4], 'buches'],
    [A.tonneaux(), 1150, 612, [-12, -3, 24, 4], null], [A.tonneaux(), 960, 840, [-12, -3, 24, 4], null],
    [A.boiteLettres(), 902, 614, [-3, -2, 6, 3], 'boiteLettres'], [A.boiteLettres(), 728, 974, [-3, -2, 6, 3], 'boiteLettres'],
    [A.banniere(), 642, 646, [-1, -2, 4, 3], null], [A.banniere(), 958, 646, [-1, -2, 4, 3], null], [A.banniere(), 642, 806, [-1, -2, 4, 3], null], [A.banniere(), 958, 806, [-1, -2, 4, 3], null],
    [A.statue(), 1000, 780, [-12, -10, 24, 11], 'statue'],
  ];
  for (const [obj, x, y, sol, texte] of mobilier) C.objet(obj, x, y, { solide: sol, ombre: [Math.max(4, obj.img.width / 2 - 2), 3], texte, zw: Math.max(16, obj.img.width) });
  // guirlandes lumineuses au-dessus des rues
  for (const [x, y, w] of [[640, 606, 120], [840, 606, 120], [640, 812, 110], [850, 812, 110]]) {
    const gl = Objets.guirlande(w, 6); C.dessusImg(gl.img, x, y); gl.bulbs.forEach(([bx, by]) => C.scintille.push([x + bx, y + by]));
  }

  // ---------------------------------------------------------------- la grande place : sapin, marché de Noël, puits
  const sapin = Objets.grandSapin(12);
  C.objet(sapin, 800, 700, { solide: [-8, -4, 16, 5], ombre: [18, 5], lumiere: true, rayon: 80, k: 'xmas' });
  C.zone(786, 694, 28, 12, 'sapinPlace');
  const etal = (type, x, y, c1, c2, texte) => {
    const e = A.etal(type, c1, c2);
    C.objet(e, x, y, { solide: [-22, -14, 44, 14] });
    e.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(x - e.ax + lx, y - e.ay + ly, rr, k));
    C.zone(x - 18, y - 4, 36, 10, texte);
  };
  etal('chocolat', 690, 650, '#c8343a', '#f4efe6', 'etalChocolat');
  etal('tricots', 910, 650, '#3a6aa8', '#f4efe6', 'etalTricots');
  etal('legumes', 690, 800, '#4f8a5a', '#f4efe6', 'etalLegumes');
  etal('pains', 910, 800, '#d8a838', '#7a2a2a', 'etalPains');
  etal('poisson', 660, 724, '#2f7a8a', '#f4efe6', 'etalPoisson');
  C.objet(A.puits(), 1000, 716, { solide: [-12, -8, 24, 9], texte: 'puitsGele', zw: 24 });
  for (const [x, y] of [[652, 618], [948, 618], [652, 818], [948, 818], [744, 900], [856, 900], [744, 1060], [856, 1060], [520, 618], [1080, 618], [1180, 880], [1260, 920]])
    C.objet(A.lampadaire(), x, y, { solide: [-2, -3, 5, 4], rayon: 58 });
  C.objet(A.tasNeige(34), 1110, 962, { solide: [-14, -6, 28, 6] });
  C.objet(A.tasNeige(26), 560, 760, { solide: [-10, -4, 20, 5] });

  // ---------------------------------------------------------------- la colline aux luges (sud-ouest)
  C.objet(A.bonhommeEnfants(), 600, 1030, { solide: [-6, -3, 12, 4], ombre: [7, 2], texte: 'bonhommeEnfants', zw: 18 });
  C.objet(A.luge(), 640, 1080, { solide: [-9, -3, 18, 4], texte: 'lugeRouge', zw: 20 });
  for (let k = 0; k < 4; k++) Objets.line(P, 520 + k * 30, 1000 + k * 8, 600 + k * 30, 1120, '#c8d4e6'); // traces de luges

  // ---------------------------------------------------------------- la forêt de sapins, la clairière des trolls (est)
  const SAPINS = [0, 1, 2, 3].map((k) => Foret.sapin(500 + k, 2 + (k % 2)));
  const clair = (x, y, rx, ry) => ((x - 1400) / rx) ** 2 + ((y - 560) / ry) ** 2 < 1;
  const distSentier = (x, y) => Math.min(...SENTIERS.map((s) => Math.min(...s.slice(1).map(([x1, y1], k) => {
    const [x0, y0] = s[k], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(x - x0 - dx * t, y - y0 - dy * t);
  }))));
  const places = [];
  const planter = (x, y, rayon = 30) => {
    if (places.some(([a, b]) => Math.hypot(a - x, b - y) < rayon)) return;
    places.push([x, y]);
    C.objet(r.pick(SAPINS), x, y, { solide: [-4, -4, 8, 5] });
    O.ellipse(x + 4, y - 3, 16, 5, '#000');
  };
  for (let k = 0; k < 900 && places.length < 80; k++) {
    const x = 1190 + r.int(400), y = 230 + r.int(640);
    if (clair(x, y, 120, 90) || distSentier(x, y) < 30) continue;
    if (x < 1380 && y < 360) continue; // le comptoir d'Oaken
    planter(x, y, 36);
  }
  // une rangée de sapins au pied des montagnes et quelques-uns au bord du lac
  for (let x = 450; x < W; x += 34 + r.int(16)) { if (x > 560 && x < 1040) continue; planter(x, 212 + r.int(14), 30); }
  for (const [x, y] of [[460, 260], [470, 380], [460, 470], [430, 1112], [520, 1150], [690, 1150], [930, 1140], [1060, 1120], [1180, 1160], [430, 1150], [1150, 1060]]) planter(x, y, 24);
  for (let k = 0; k < 40; k++) { const a = r() * 6.28, d = 60 + r.int(40); P.px(1400 + Math.cos(a) * d * 1.3, 560 + Math.sin(a) * d * 0.9, '#6a8a6a'); }
  C.solide(W - 8, HAUT, 8, H - HAUT - 70);

  // ---------------------------------------------------------------- le comptoir d'Oaken
  const oaken = A.comptoirOaken();
  C.objet(oaken, 1290, 330, { solide: [-62, -58, 124, 58] });
  oaken.lumieres.forEach(([x, y, rr, k]) => C.lumiere(1290 - oaken.ax + x, 330 - oaken.ay + y, rr, k));
  C.fumees.push({ x: 1290 - oaken.ax + oaken.fumee[0], y: 330 - oaken.ay + oaken.fumee[1], t: 0 });
  C.zone(1250, 324, 30, 10, 'comptoirOaken');
  C.porte(1282, 322, 16, 14, 'oaken', 'entree', 'up');
  C.arrivees.devantOaken = { x: 1290, y: 348, dir: 'down' };

  // ---------------------------------------------------------------- l'écurie de Kristoff et Sven (sud-est)
  const ec = A.ecurie();
  C.objet(ec, 1360, 1010, { solide: [-71, -50, 142, 50] });
  ec.lumieres.forEach(([x, y, rr, k]) => C.lumiere(1360 - ec.ax + x, 1010 - ec.ay + y, rr, k));
  C.zone(1338, 1004, 44, 10, 'ecurie');
  C.objet(A.traineau(), 1520, 1000, { solide: [-24, -8, 50, 9], texte: 'traineau', zw: 44 });
  C.objet(A.blocsGlace(), 1222, 1000, { solide: [-18, -8, 36, 9], texte: 'blocsGlace', zw: 34 });
  for (let k = 0; k < 60; k++) P.px(1300 + r.int(160), 1012 + r.int(50), r.pick(['#d8b860', '#b89a48']));

  // ---------------------------------------------------------------- l'arrêt de bus, à la sortie d'Arendelle
  const bus = A.arretBus();
  C.objet(bus, 1520, 1150, { solide: [-20, -8, 52, 9] });
  bus.lumieres.forEach(([x, y, rr, k]) => C.lumiere(1520 - bus.ax + x, 1150 - bus.ay + y, rr, k));
  sentier([[1500, 1160], [1600, 1170]], 30);

  // ---------------------------------------------------------------- l'arrivée (sud)
  C.objet(A.pancarte(['ARENDELLE', 'BIENVENUE']), 852, 1140, { solide: [-2, -2, 4, 3], texte: 'bienvenue', zw: 20 });
  C.arrivees.entree = { x: 800, y: 1150, dir: 'up' };
  C.arrivees.arret = { x: 1486, y: 1162, dir: 'right' };
  C.porte(770, 1188, 60, 12, 'arendelle', 'entree', 'down');
  C.portes[C.portes.length - 1].condition = () => { Jeu.dire('sortieArendelle'); Jeu.joueur.y -= 8; return false; };
  // secret : le gant d'Elsa, au bord du canal
  C.dynamiques.push({ sortY: 520, draw(g) { g.fillStyle = '#9ad0f0'; g.fillRect(742, 516, 4, 3); g.fillRect(746, 517, 2, 1); g.fillStyle = '#ffffff'; g.fillRect(742, 516, 1, 1); } });
  C.zone(736, 510, 16, 12, 'gantElsa');

  // ---------------------------------------------------------------- les traces de pas dans la neige
  const pas = [];
  let dernier = null;
  C.dynamiques.push({
    sortY: -1e9,
    update(dt, J) {
      const p = J.joueur;
      for (const q of pas) q.t += dt;
      while (pas.length && pas[0].t > 9) pas.shift();
      if (J.carte !== C || J.surGlace(p) || !p.moving) return;
      if (!dernier || Math.hypot(p.x - dernier.x, p.y - dernier.y) > 6) { dernier = { x: p.x, y: p.y }; pas.push({ x: Math.round(p.x) + (pas.length % 2 ? 2 : -2), y: Math.round(p.y), t: 0 }); }
    },
    draw(g) {
      for (const q of pas) { g.globalAlpha = Math.max(0, 0.55 - q.t / 16); g.fillStyle = '#9aaac8'; g.fillRect(q.x, q.y - 1, 2, 2); }
      g.globalAlpha = 1;
    },
  });

  // ---------------------------------------------------------------- les habitants
  const AP = CONFIG.arendelle.persos, NA = Neige;
  const rep = (id) => (J) => EpreuveNeige.repliques(id, J);
  const perso = (id, o) => { const p = new Entites.Perso(Object.assign({ id, dialogue: rep(o.repliques || id) }, o)); C.pnj.push(p); return p; };
  const passant = (id, o) => { const p = new Entites.Passant(Object.assign({ id, dialogue: rep(o.repliques || id) }, o)); C.pnj.push(p); return p; };
  const figurant = (id, o) => { const f = new Betes.Figurant(Object.assign({ id, dialogue: rep(o.repliques || id) }, o)); C.pnj.push(f); return f; };
  const humain = (nom) => Object.assign({}, AP[nom], { modele: NA.MODELES[nom] });
  // Olaf (il arrive pendant la scène d'accueil), Elsa (à la fin), Anna qui se promène
  const olaf = perso('olaf', { spr: NA.olaf(), x: -60, y: -60, visible: false, vitesse: 50, dialogue: (J) => EpreuveNeige.parlerOlaf(J) });
  const elsa = perso('elsa', { cfg: humain('elsa'), x: -60, y: -60, visible: false });
  const anna = passant('anna', { cfg: humain('anna'), x: 760, y: 860, vitesse: 22, dialogue: (J) => EpreuveNeige.parlerAnna(J),
    chemin: [{ x: 760, y: 860, pause: 2, regard: 'down' }, { x: 640, y: 862 }, { x: 560, y: 862, pause: 2.5, regard: 'up' }, { x: 640, y: 862 },
      { x: 760, y: 862 }, { x: 760, y: 760 }, { x: 740, y: 700, pause: 3, regard: 'right' }, { x: 760, y: 760 }, { x: 860, y: 862 }, { x: 1000, y: 862, pause: 2 }, { x: 860, y: 862 }] });
  // Kristoff et Sven, à l'écurie
  const kristoff = perso('kristoff', { cfg: humain('kristoff'), x: 1268, y: 1046, dir: 'right' });
  const sven = perso('sven', { spr: NA.sven(), x: 1452, y: 1052, dir: 'left', fixe: true, ombreR: 10, dialogue: (J) => EpreuveNeige.parlerSven(J) });
  // les gardes du château, le duc de Weselton
  perso('garde1', { cfg: humain('garde'), x: 786, y: 470, dir: 'down', fixe: true, repliques: 'gardeA' });
  perso('garde2', { cfg: humain('garde'), x: 814, y: 470, dir: 'down', fixe: true, repliques: 'gardeA' });
  Entites.portraits.gardeA = C.pnj[C.pnj.length - 1].spr.down.idle;
  passant('duc', { cfg: { peau: '#f0c8b0', cheveux: '#c8c4cc', coiffure: 'rase', barbe: 'courte', couleurBarbe: '#d8d4dc', lunettes: true, yeux: '#2a1d2e', veste: '#8a8494', echarpe: '#c8343a', pantalon: '#3a3440', chaussures: '#1d1a24' },
    x: 500, y: 622, vitesse: 18, chemin: [{ x: 500, y: 622, pause: 2 }, { x: 740, y: 622 }, { x: 740, y: 622, pause: 3, regard: 'down' }, { x: 520, y: 622 }] });
  // au marché, au bord du lac, sur la colline
  passant('marchand', { cfg: { peau: '#d8a07a', cheveux: '#8a5a3a', coiffure: 'court', barbe: 'pleine', couleurBarbe: '#8a5a3a', yeux: '#2a1d2e', chapeau: 'bonnet', couleurChapeau: '#c8343a', ruban: '#f4efe6', fleur: '#ffffff', veste: '#4f6a8a', echarpe: '#f2c230', pantalon: '#3a3440', chaussures: '#2a2026' },
    x: 690, y: 666, regardeDefaut: 'down' });
  passant('villageois', { cfg: { peau: '#f2cdb0', cheveux: '#e8c870', coiffure: 'chignon', barbe: 'aucune', yeux: '#3a5a8a', chapeau: 'bonnet', couleurChapeau: '#3a6aa8', ruban: '#ffffff', fleur: '#ffffff', veste: '#a8343a', echarpe: '#f4efe6', coupe: 'robe', pantalon: '#3a3a6a', chaussures: '#2a2026' },
    x: 900, y: 760, vitesse: 16, chemin: [{ x: 900, y: 760, pause: 3 }, { x: 1040, y: 760 }, { x: 1080, y: 640, pause: 2 }, { x: 960, y: 640 }] });
  passant('patineuse1', { cfg: { peau: '#f0c4a4', cheveux: '#5a3424', coiffure: 'chignon', barbe: 'aucune', yeux: '#2a1d2e', chapeau: 'bonnet', couleurChapeau: '#e86a9a', ruban: '#ffffff', fleur: '#ffffff', veste: '#f4efe6', echarpe: '#e86a9a', coupe: 'robe', pantalon: '#3a6aa8', chaussures: '#f4efe6' },
    x: 200, y: 560, vitesse: 34, repliques: 'patineuse', bloquant: false, chemin: [{ x: 120, y: 520 }, { x: 260, y: 470 }, { x: 360, y: 560 }, { x: 260, y: 640 }, { x: 120, y: 600 }] });
  passant('patineuse2', { cfg: { peau: '#c48d6c', cheveux: '#2a1e1a', coiffure: 'boucles', barbe: 'aucune', yeux: '#2a1d2e', chapeau: 'bonnet', couleurChapeau: '#4f8a5a', ruban: '#f2c230', fleur: '#f2c230', veste: '#2f7a8a', echarpe: '#f2c230', pantalon: '#2a2a3a', chaussures: '#f4efe6' },
    x: 300, y: 860, vitesse: 30, repliques: 'patineuse', bloquant: false, chemin: [{ x: 300, y: 860 }, { x: 160, y: 800 }, { x: 90, y: 880 }, { x: 200, y: 940 }, { x: 330, y: 920 }] });
  Entites.portraits.patineuse = C.pnj[C.pnj.length - 1].spr.down.idle;
  passant('pecheur', { cfg: { peau: '#d8a07a', cheveux: '#6a6a74', coiffure: 'court', barbe: 'pleine', couleurBarbe: '#c8c4cc', yeux: '#2a1d2e', chapeau: 'bonnet', couleurChapeau: '#5a4a3a', ruban: '#c8343a', fleur: '#5a4a3a', veste: '#5a6a4a', echarpe: '#c9483b', pantalon: '#3a3440', chaussures: '#2a2026' },
    x: 246, y: 958, regardeDefaut: 'left' });
  CONFIG.arendelle.enfants.forEach((e, k) => figurant('enfant' + k, { spr: NA.enfant(e), x: [560, 620, 680][k], y: [1006, 1090, 1040][k], repliques: 'enfant' }));
  Entites.portraits.enfant = C.pnj[C.pnj.length - 1].spr.idle;
  // les trolls de la clairière : des rochers… qui se réveillent quand on s'approche
  const trolls = [[1478, 502], [1500, 566], [1452, 632]].map(([x, y], k) => {
    const rocher = A.rocher(40 + k, 18), t = NA.troll(k + 3);
    const f = figurant('troll' + k, { spr: { idle: rocher.img, blink: rocher.img, joie: rocher.img }, x, y, repliques: 'troll', sansOmbre: true });
    f.troll = t; f.endormi = true;
    const parler = f.dialogue;
    f.dialogue = (J) => { if (f.endormi) { f.endormi = false; f.spr = t; f.joie = 1.2; Musique.miaou(0.6, 0.06); return 'rocherTroll'; } return parler(J); };
    return f;
  });
  Entites.portraits.troll = trolls[0].troll.idle;

  C.neige3 = {
    olaf, elsa, anna, kristoff, sven, trolls,
    accueil: { x: 800, y: 1080 },               // Olaf rencontre Ismae ici, en arrivant
    olafPlace: { x: 880, y: 726 },              // puis il attend sur la grande place
    jack: { x: 846, y: 724 },                   // là où Jack Snow sera construit
    elsaDepart: { x: 800, y: 520 },
    bouleLac: { x: 446, y: 1062 }, bouleClairiere: { x: 1360, y: 600 },
    branches: { x: 1430, y: 1066 },
    cailloux: [{ x: 1018, y: 724 }, { x: 530, y: 846 }, { x: 1118, y: 972 }],
    fontaine: { x: 800, y: 404 },
    bus: { x: 1520, y: 1160 },
  };
  C.zone(1500, 1146, 44, 16, null, { dialogue: (J) => EpreuveNeige.arretBus(J) });

  C.onEntree = (J) => EpreuveNeige.entree(J);
  C.finaliser(0.22);
  return C;
});
