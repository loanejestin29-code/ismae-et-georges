// =====================================================================
//  carte-foret.js — ZONE 3 : la forêt de Sherwood (épreuve 2)
//
//  Plan (en pixels, y vers le bas) :
//    y  70-330  la grande clairière du TOURNOI : cibles, pas de tir, tribune royale (est),
//               gradins du public (ouest), tentes ; au nord-ouest, le chemin des montagnes enneigées
//    y 330-440  le chemin du nord, entre les arbres
//    y 420-640  le carrefour (le roi Jean y capture Georges), le petit lapin archer, Adam de la Halle,
//               Frère Tuck qui pêche au bord du ruisseau
//    y 640-680  le ruisseau, deux petits ponts de bois
//    y 680-1008 le sous-bois : campement de Robin (ouest), prairie fleurie et ruche (est), arrivée (sud)
//
//  La forêt se construit avec une grille de cases de 16 px (« libre » = on peut y marcher) :
//  tout le reste devient un mur d'arbres.
// =====================================================================
'use strict';

Jeu.enregistrerCarte('foret', () => {
  const W = 1056, H = 1008, CW = 16;
  // fin de journée : la même lumière du soir que dans la rue, avec des lanternes, des torches et un feu de camp
  const C = new Carte('foret', W, H, { ambiance: 'crepuscule', fond: '#10201a' });
  const P = C.P, O = C.O, r = PX.rng(1404);
  const AUTOMNE = ['#c8802e', '#e0a83a', '#b8562a', '#d89a3a'];
  C.feuilles = 0.7;
  // il neige un peu près du chemin des montagnes (coin nord-ouest)
  // il neige doucement sur toute la forêt (c'est Noël), et beaucoup près du chemin des montagnes
  C.neige = (J) => Math.max(0.55, Math.min(1.4, 1.6 - Math.hypot(J.joueur.x - 60, J.joueur.y - 40) / 230));

  // ---------------------------------------------------------------- où l'on peut marcher
  const NC = W / CW, NR = Math.ceil(H / CW);
  const libre = Array.from({ length: NR }, () => Array(NC).fill(false));
  const ouvrir = (test) => { for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) if (test(i * CW + 8, j * CW + 8)) libre[j][i] = true; };
  const ellipse = (cx, cy, rx, ry) => ouvrir((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
  const rect = (x0, y0, w, h) => ouvrir((x, y) => x >= x0 && x < x0 + w && y >= y0 && y < y0 + h);
  ellipse(520, 830, 470, 150);      // le sous-bois du sud
  rect(496, 940, 64, 68);           // l'arrivée
  rect(64, 600, 928, 100);          // les deux rives du ruisseau
  ellipse(520, 528, 470, 124);      // le carrefour et ses alentours
  rect(488, 320, 80, 130);          // le chemin du nord
  rect(150, 74, 760, 250); ellipse(530, 200, 420, 150); // la clairière du tournoi
  rect(40, 0, 56, 200); rect(40, 160, 130, 96);         // le chemin des montagnes
  const estLibre = (x, y) => { const i = Math.floor(x / CW), j = Math.floor(y / CW); return j >= 0 && j < NR && i >= 0 && i < NC && libre[j][i]; };

  // ---------------------------------------------------------------- le ruisseau
  const yc = (x) => 652 + 18 * Math.sin(x / 150 + 0.6);
  const PONTS = [[402, 452], [810, 856]];
  const surPont = (x) => PONTS.some(([a, b]) => x >= a && x < b);

  // ---------------------------------------------------------------- sol
  P.rect(0, 0, W, H, '#3b6332');
  P.speckle(0, 0, W, H, ['#447039', '#33582c', '#4c7a3e', '#2d4f28'], 0.22, r);
  for (let k = 0; k < 160; k++) P.ellipse(r.int(W), r.int(H), 10 + r.int(30), 5 + r.int(14), r.chance(0.5) ? 'rgba(255,240,180,0.07)' : 'rgba(10,30,20,0.13)');
  // clairières : le sol s'éclaircit en trame (motif de Bayer), de plus en plus vers le centre
  const eclaircir = (cx, cy, rx, ry, col, force = 1) => {
    const x0 = Math.max(0, Math.floor(cx - rx)), y0 = Math.max(0, Math.floor(cy - ry));
    const w = Math.min(W, Math.ceil(cx + rx)) - x0, h = Math.min(H, Math.ceil(cy + ry)) - y0;
    const img = P.g.getImageData(x0, y0, w, h), d = img.data, [cr, cg, cb] = PX.hex2rgb(col);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = (x0 + x - cx) / rx, ny = (y0 + y - cy) / ry, e = nx * nx + ny * ny;
      if (e >= 1 || PX.bayer(x0 + x, y0 + y) >= Math.min(16, (1 - e) * 35 * force)) continue;
      const i = (y * w + x) * 4; d[i] = (d[i] + cr) >> 1; d[i + 1] = (d[i + 1] + cg) >> 1; d[i + 2] = (d[i + 2] + cb) >> 1;
    }
    P.g.putImageData(img, x0, y0);
  };
  eclaircir(520, 520, 150, 80, '#7aa850', 0.6);
  eclaircir(530, 200, 420, 150, '#86b45a', 0.8);
  eclaircir(820, 840, 150, 90, '#7aa850', 0.6);
  // herbe tondue du tournoi, en bandes
  for (let x = 360; x < 712; x += 22) P.rect(x, 86, 11, 214, 'rgba(255,250,200,0.07)');
  P.speckle(140, 70, 780, 260, ['#76a656', '#5a8a42', '#6c9c4e'], 0.08, r);
  // chemins de terre (deux passes : bord sombre puis terre claire)
  const CHEMINS = [
    [[528, 1008], [528, 930], [500, 860], [452, 780], [428, 700], [428, 640], [434, 600], [470, 556], [506, 516], [516, 456], [526, 400], [528, 330], [528, 290]],
    [[466, 820], [380, 846], [300, 858], [220, 862]],                              // vers le campement
    [[520, 512], [600, 512], [690, 530], [770, 570], [832, 620], [834, 690], [826, 760], [812, 830]], // vers le pont de l'est et la prairie
    [[470, 540], [380, 560], [300, 600], [250, 628]],                              // vers Frère Tuck
    [[528, 300], [420, 296], [300, 280], [180, 240], [110, 220], [70, 160], [66, 60], [66, 0]], // vers les montagnes
  ];
  const tamponner = (pts, larg, col, bruit) => {
    for (let s = 0; s < pts.length - 1; s++) {
      const [x0, y0] = pts[s], [x1, y1] = pts[s + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3);
      for (let k = 0; k <= n; k++) {
        const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        P.ellipse(x + (r() - 0.5) * bruit, y + (r() - 0.5) * bruit, larg / 2 + r.int(3), larg / 3 + r.int(2), col);
      }
    }
  };
  CHEMINS.forEach((c, k) => tamponner(c, k ? 20 : 26, '#6a4e34', 4));
  CHEMINS.forEach((c, k) => tamponner(c, k ? 14 : 20, '#8e6c48', 3));
  CHEMINS.forEach((c, k) => tamponner(c, k ? 8 : 12, '#9e7a52', 2));
  for (let k = 0; k < 900; k++) {
    const c = r.pick(CHEMINS), s = r.int(c.length - 1), t = r(), [x0, y0] = c[s], [x1, y1] = c[s + 1];
    const x = x0 + (x1 - x0) * t + (r() - 0.5) * 14, y = y0 + (y1 - y0) * t + (r() - 0.5) * 8;
    P.px(x, y, r.pick(['#b8946a', '#7a5a3c', '#a88660', '#6a4e34']));
    if (r.chance(0.08)) { P.rect(x, y, 2, 1, '#a8a8b4'); P.px(x, y + 1, '#6a6a78'); }
  }
  // tapis de feuilles mortes, touffes d'herbe, fleurs sauvages
  for (let k = 0; k < 1400; k++) P.px(r.int(W), r.int(H), r.pick(AUTOMNE));
  for (let k = 0; k < 1300; k++) { const x = r.int(W), y = r.int(H); P.px(x, y, '#6f9a48'); P.px(x - 1, y - 1, '#5a8a3a'); P.px(x + 1, y - 1, '#5a8a3a'); P.px(x, y - 2, '#7aa850'); }
  const fleurs = (cx, cy, rx, ry, n) => {
    for (let k = 0; k < n; k++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()), x = Math.round(cx + Math.cos(a) * d * rx), y = Math.round(cy + Math.sin(a) * d * ry);
      const col = r.pick(['#f4f0f0', '#ffd34e', '#e86a8a', '#b45ad0', '#7ab0f0', '#ff9a4a']);
      P.px(x, y + 1, '#3f7a35'); P.px(x, y, col); P.px(x - 1, y, col); P.px(x + 1, y, col); P.px(x, y - 1, col); P.px(x, y, '#fff6c0');
    }
  };
  fleurs(830, 850, 140, 80, 260); fleurs(640, 740, 70, 30, 40); fleurs(200, 470, 80, 40, 50); fleurs(700, 200, 40, 30, 20); fleurs(330, 200, 30, 20, 16);
  // champignons (un cercle de fées dans la prairie)
  const champi = (x, y) => { P.px(x, y, '#f4efe6'); P.rect(x - 1, y - 2, 3, 2, '#d8323a'); P.px(x - 1, y - 2, '#ff8a7a'); P.px(x + 1, y - 1, '#ffffff'); };
  for (let k = 0; k < 11; k++) { const a = (k / 11) * Math.PI * 2; champi(Math.round(918 + Math.cos(a) * 15), Math.round(898 + Math.sin(a) * 7)); }
  for (const [x, y] of [[150, 760], [356, 940], [610, 470], [960, 560], [120, 540], [700, 980]]) { champi(x, y); champi(x + 4, y + 1); }
  C.zone(898, 886, 40, 22, 'champignons');
  C.zone(770, 820, 90, 50, 'fleursSauvages');

  // le ruisseau : berges de terre, galets, eau claire, roseaux et nénuphars
  for (let x = 0; x < W; x++) {
    const y = Math.round(yc(x));
    P.rect(x, y - 19, 1, 38, '#5a4a34'); P.px(x, y - 19, '#6a5a3e'); P.px(x, y + 18, '#3a2e22');
    P.rect(x, y - 15, 1, 30, '#2a5a6a');
    P.rect(x, y - 13, 1, 26, '#3a7e8e');
    P.rect(x, y - 4, 1, 9, '#357486');
    if (x % 3 === 0) P.px(x, y - 13, '#7ac0c8');
  }
  for (let k = 0; k < 220; k++) {
    const x = r.int(W), bord = r.chance(0.5) ? -1 : 1, y = Math.round(yc(x)) + bord * (14 + r.int(4));
    P.ellipse(x, y, 1 + r.int(2), 1, r.pick(['#8a8a98', '#a8a8b4', '#6a6a78', '#b8b0a0']));
  }
  for (let k = 0; k < 90; k++) {
    const x = r.int(W); if (surPont(x)) continue;
    const y = Math.round(yc(x)) + (r.chance(0.5) ? -15 : 13);
    for (let j = 0; j < 3; j++) P.vline(x + j * 2, y - 3 - r.int(4), 4 + r.int(3), r.pick(['#3f7a35', '#5a8a3a', '#2f5d2e']));
    if (r.chance(0.3)) P.rect(x + 2, y - 7, 1, 2, '#6a4428');
  }
  for (let k = 0; k < 16; k++) {
    const x = 40 + r.int(W - 80); if (surPont(x) || Math.abs(x - 260) < 30) continue;
    const y = Math.round(yc(x)) + r.int(9) - 4;
    P.ellipse(x, y, 3, 2, '#3f8a45'); P.px(x + 1, y - 1, '#5aa850'); P.px(x + 3, y, '#2a5a6a');
    if (r.chance(0.3)) P.px(x - 1, y - 1, '#ff9ac0');
  }
  for (let x = 0; x < W; x += 16) if (!surPont(x + 8)) C.eaux.push({ x, y: Math.round(yc(x + 8)) - 11, w: 16, h: 22 });
  for (let x = 0; x < W; x += 8) if (!surPont(x) && !surPont(x + 7)) C.solide(x, Math.round(yc(x + 4)) - 13, 8, 26);
  // les ponts (planches au sol, rambardes de chaque côté)
  for (const [x0, x1] of PONTS) {
    const yh = Math.round(Math.min(yc(x0), yc(x1))) - 22, yb = Math.round(Math.max(yc(x0), yc(x1))) + 22;
    P.rect(x0, yh, x1 - x0, yb - yh, '#5e4230');
    for (let y = yh; y < yb; y += 4) { P.rect(x0 + 1, y, x1 - x0 - 2, 3, r.pick(['#9a7650', '#8e6c48', '#a8845a'])); P.hline(x0 + 1, y, x1 - x0 - 2, '#b8946a'); if (r.chance(0.5)) P.px(x0 + 3 + r.int(x1 - x0 - 6), y + 1, '#5e4230'); }
    O.rect(x0, yb, x1 - x0, 3, '#000');
    for (const x of [x0 + 1, x1 - 3]) { C.objet(Foret.rambarde(yb - yh - 10), x + 1, yb); C.solide(x - 1, yh, 4, yb - yh); }
    C.zone(x0 + 4, yh - 6, x1 - x0 - 8, 10, 'pontBois');
  }
  C.zone(560, 618, 120, 16, 'ruisseau'); C.zone(140, 618, 60, 16, 'ruisseau');

  // ---------------------------------------------------------------- la clairière du tournoi
  const TRIB = { x: 716, y: 128, w: 168, h: 108 }, GRAD = { x: 172, y: 140, w: 168, h: 104 };
  // tribune royale : plancher, tapis rouge, jupe de bois, escalier
  P.rect(TRIB.x, TRIB.y, TRIB.w, TRIB.h, '#6a4a30');
  for (let y = TRIB.y; y < TRIB.y + TRIB.h; y += 5) { P.rect(TRIB.x + 1, y, TRIB.w - 2, 4, r.pick(['#a8845a', '#9a7650', '#b08c60'])); P.hline(TRIB.x + 1, y, TRIB.w - 2, '#c8a070'); }
  P.rect(TRIB.x + 70, TRIB.y + 20, 28, TRIB.h - 20, '#a8283a'); P.vline(TRIB.x + 70, TRIB.y + 20, TRIB.h - 20, '#e8b54a'); P.vline(TRIB.x + 97, TRIB.y + 20, TRIB.h - 20, '#e8b54a');
  P.rect(TRIB.x, TRIB.y + TRIB.h, TRIB.w, 12, '#4a3020');
  for (let x = TRIB.x; x < TRIB.x + TRIB.w; x += 14) { P.rect(x, TRIB.y + TRIB.h, 7, 8, '#a8283a'); P.rect(x + 7, TRIB.y + TRIB.h, 7, 8, '#e8b54a'); P.px(x + 3, TRIB.y + TRIB.h + 8, '#a8283a'); P.px(x + 10, TRIB.y + TRIB.h + 8, '#e8b54a'); }
  for (let k = 0; k < 4; k++) { P.rect(TRIB.x + 68, TRIB.y + TRIB.h + k * 4, 32, 4, k % 2 ? '#8e6c48' : '#a8845a'); P.hline(TRIB.x + 68, TRIB.y + TRIB.h + k * 4, 32, '#c8a070'); }
  O.rect(TRIB.x, TRIB.y + TRIB.h + 12, TRIB.w, 4, '#000');
  C.solide(TRIB.x - 4, TRIB.y - 6, TRIB.w + 8, TRIB.h + 22);
  C.zone(TRIB.x, TRIB.y + TRIB.h + 12, TRIB.w, 12, 'tribune');
  C.objet(Foret.trone(), TRIB.x + 84, TRIB.y + 44, { dy: -4 });
  // le dais au-dessus du trône (toujours au premier plan) et ses poteaux
  const dais = PX.canvas(108, 30), D = PX.painter(dais);
  D.trap(10, 88, 0, 108, 0, 18, '#a8283a');
  for (let x = 0; x < 108; x += 12) D.trap(x + 2, 4, x, 8, 2, 16, '#e8b54a');
  for (let x = 0; x < 108; x += 9) { D.rect(x, 18, 9, 5, x % 18 ? '#e8b54a' : '#a8283a'); D.px(x + 4, 23, x % 18 ? '#e8b54a' : '#a8283a'); }
  D.hline(10, 0, 88, '#d8505e');
  C.dessusImg(dais, TRIB.x + 30, TRIB.y - 20);
  const poteauDais = { img: (() => { const c = PX.canvas(3, 60), Q = PX.painter(c); Q.rect(0, 0, 3, 60, '#5e4230'); Q.vline(0, 0, 60, '#9a7a52'); return c; })(), ax: 1, ay: 59 };
  C.objet(poteauDais, TRIB.x + 34, TRIB.y + 58); C.objet(poteauDais, TRIB.x + 134, TRIB.y + 58);
  // les gradins du public : trois rangs de bancs
  for (let k = 0; k < 3; k++) {
    const y = GRAD.y + k * 34;
    P.rect(GRAD.x, y, GRAD.w, 34, '#6a4a30');
    P.rect(GRAD.x + 2, y + 2, GRAD.w - 4, 18, '#8e6c48'); for (let x = GRAD.x + 2; x < GRAD.x + GRAD.w; x += 6) P.vline(x, y + 2, 18, '#7a5a3c');
    P.rect(GRAD.x, y + 20, GRAD.w, 6, '#b08c60'); P.hline(GRAD.x, y + 20, GRAD.w, '#c8a070');
    P.rect(GRAD.x, y + 26, GRAD.w, 8, '#5e4230'); for (let x = GRAD.x; x < GRAD.x + GRAD.w; x += 16) P.vline(x, y + 26, 8, '#3a2618');
  }
  O.rect(GRAD.x, GRAD.y + GRAD.h, GRAD.w, 4, '#000');
  C.solide(GRAD.x - 2, GRAD.y - 4, GRAD.w + 4, GRAD.h + 6);
  C.zone(GRAD.x, GRAD.y + GRAD.h, GRAD.w, 12, 'gradins');
  // les cibles, la ligne de tir (craie) et le carquois
  const CIBLES = [440, 530, 620];
  for (const x of CIBLES) C.objet(Foret.cible(9), x, 118, { solide: [-11, -3, 22, 4], ombre: [12, 3], texte: 'cible', zw: 26 });
  for (let x = 400; x < 662; x += 2) P.px(x, 262, x % 6 ? '#f4f0e8' : '#d8d4c8');
  C.objet(Foret.carquois(), 552, 270, { solide: [-3, -2, 6, 3] });
  // barrières au sud (passage au milieu) et sur les côtés
  const barr = (x, w) => { C.objet(Foret.barriere(w), x, 318); C.solide(x, 312, w, 7); };
  barr(160, 330); barr(566, 344);
  // tentes rayées et fanions qui flottent
  C.objet(Foret.tente('#f4efe6', '#c8343a', 3), 236, 112, { solide: [-24, -22, 48, 22], ombre: [24, 5], texte: 'tente', zw: 26 });
  C.objet(Foret.tente('#f2c230', '#3a5aa8', 5), 900, 112, { solide: [-24, -22, 48, 22], ombre: [24, 5], texte: 'tente', zw: 26 });
  const fanion = (x, y, c1, c2, ph) => C.dynamiques.push({
    sortY: y,
    draw(g, J) {
      const t = (J.t || 0) * 5 + ph;
      g.fillStyle = '#1d1626'; g.fillRect(x - 1, y - 46, 3, 46);
      g.fillStyle = '#9a7a52'; g.fillRect(x, y - 45, 1, 45);
      g.fillStyle = '#e8b54a'; g.fillRect(x - 1, y - 48, 3, 2);
      for (let i = 0; i < 14; i++) {
        const h = Math.max(1, Math.round(9 - i * 0.6)), dy = Math.round(Math.sin(t - i * 0.5) * 1.5);
        g.fillStyle = Math.floor(i / 3) % 2 ? c2 : c1; g.fillRect(x + 2 + i, y - 44 + dy + Math.round((9 - h) / 2), 1, h);
      }
    },
  });
  fanion(340, 314, '#c8343a', '#f4efe6', 0); fanion(724, 314, '#3a5aa8', '#f2c230', 1.3);
  fanion(388, 100, '#f2c230', '#3a5aa8', 2.1); fanion(672, 100, '#c8343a', '#f4efe6', 0.6);
  fanion(TRIB.x + 2, TRIB.y + 2, '#a8283a', '#e8b54a', 1.9); fanion(TRIB.x + TRIB.w - 4, TRIB.y + 2, '#a8283a', '#e8b54a', 0.2);
  // tonneaux et caisses du ravitaillement
  C.objet(Objets.tonneau(), 676, 140, { solide: [-5, -3, 10, 4] }); C.objet(Objets.tonneau(), 690, 146, { solide: [-5, -3, 10, 4] });
  C.objet(Objets.caisses(9), 380, 150, { solide: [-10, -4, 20, 5] });

  // ---------------------------------------------------------------- le chemin des montagnes (nord-ouest)
  for (let k = 0; k < 900; k++) {
    const x = r.int(200), y = r.int(300), d = Math.hypot(x - 50, y - 20);
    if (r() * 230 > 250 - d) continue;
    P.px(x, y, r.pick(['#f4f6ff', '#dfe6f4', '#ffffff']));
    if (r.chance(0.25)) P.rect(x, y, 2, 1, '#eef2fa');
  }
  eclaircir(50, 30, 170, 250, '#f2f6fc', 1.3); eclaircir(56, 0, 90, 130, '#ffffff', 1.2);
  C.objet(Foret.poteau([['^', '#c8a070'], ['>', '#a88660']]), 124, 236, { solide: [-2, -2, 4, 3], texte: 'montagnes', zw: 18 });
  C.objet(Foret.bonhomme(), 76, 236, { solide: [-8, -4, 16, 5], ombre: [9, 3], texte: 'bonhommeNeige', zw: 20 });

  // ---------------------------------------------------------------- campement de Robin (sud-ouest)
  P.ellipse(214, 866, 10, 5, '#5a5a66'); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; P.ellipse(214 + Math.round(Math.cos(a) * 10), 866 + Math.round(Math.sin(a) * 5), 2, 1, k % 2 ? '#8a8a98' : '#a8a8b4'); }
  P.ellipse(214, 866, 7, 3, '#2a1e1a');
  const feu = { sortY: 866,
    draw(g, J) {
      const t = J.t || 0;
      g.fillStyle = '#5e4230'; g.fillRect(207, 864, 14, 2); g.fillRect(210, 862, 8, 2);
      for (let k = 0; k < 5; k++) {
        const h = 5 + Math.round(Math.abs(Math.sin(t * 9 + k * 1.7)) * 5) - Math.abs(k - 2), x = 210 + k * 2;
        g.fillStyle = '#d8402a'; g.fillRect(x, 864 - h, 2, h);
        g.fillStyle = '#f2a03a'; g.fillRect(x, 864 - h + 2, 2, Math.max(1, h - 3));
        g.fillStyle = '#ffe28a'; g.fillRect(x + (k % 2), 864 - Math.max(1, h - 4), 1, Math.max(1, h - 5));
      }
      if (Math.sin(t * 13) > 0.6) { g.fillStyle = '#ffd24a'; g.fillRect(212 + Math.round(Math.sin(t * 7) * 5), 850 - Math.round((t * 20) % 10), 1, 1); }
    } };
  C.dynamiques.push(feu);
  C.fumees.push({ x: 214, y: 850, t: 0 });
  C.lumiere(214, 858, 78, 'feu');
  C.solide(204, 860, 20, 9);
  C.zone(200, 856, 28, 16, 'feuDeCamp');
  C.objet(Foret.marmite(), 230, 870, { solide: [-6, -3, 12, 4] });
  C.objet(Foret.rondin(34), 186, 840, { solide: [-16, -4, 32, 5] }); C.objet(Foret.rondin(30), 182, 892, { solide: [-14, -4, 28, 5] });
  C.objet(Foret.abri(), 128, 816, { solide: [-22, -8, 44, 8], ombre: [22, 4] });
  C.objet(Objets.tonneau(), 100, 834, { solide: [-5, -3, 10, 4] });

  // ---------------------------------------------------------------- arbres
  // quelques grands chênes particuliers (détails à découvrir)
  const arbre = (x, y, seed, o = {}, texte) => {
    C.objet(Foret.chene(seed, o), x, y, { solide: [-7, -6, 14, 7], ombre: [14, 4] });
    O.ellipse(x + 6, y - 4, 34, 11, '#000');
    if (texte) C.zone(x - 10, y - 4, 20, 12, texte);
  };
  arbre(330, 790, 41, { coeur: true }, 'coeurRM');
  arbre(330, 470, 42, { affiche: true }, 'avisRecherche');
  arbre(904, 488, 43, { fleche: true }, 'flecheArbre');
  arbre(930, 762, 44, { ruche: true }, 'ruche');
  arbre(180, 760, 45, {}); arbre(660, 712, 46, {});
  arbre(118, 470, 49, {}); arbre(770, 440, 50, {}); arbre(960, 600, 51, {}); arbre(90, 600, 52, {});
  // le tronc creux, le coffre caché, le terrier
  C.objet(Foret.rondin(52, true), 180, 520, { solide: [-24, -8, 48, 9], ombre: [24, 3], texte: 'troncCreux', zw: 46 });
  C.objet(Foret.buisson(7, 30, { baies: 6 }), 884, 936); C.objet(Foret.coffre(), 858, 928, { solide: [-8, -3, 16, 4], texte: 'coffre', zw: 18 });
  P.ellipse(700, 906, 7, 4, '#3a2a1e'); P.ellipse(700, 907, 5, 2, '#1a120c'); P.ellipse(700, 902, 9, 3, '#6a4e34');
  C.zone(690, 898, 20, 14, 'terrier');
  // buissons, souches et rochers çà et là
  const deco = [
    ['buisson', 250, 760, 26], ['buisson', 600, 900, 24], ['buisson', 880, 692, 28], ['buisson', 380, 724, 22], ['buisson', 236, 934, 28],
    ['buisson', 690, 610, 22], ['buisson', 300, 520, 24], ['buisson', 860, 560, 26], ['buisson', 460, 360, 20], ['buisson', 596, 370, 22],
    ['souche', 380, 488], ['souche', 650, 800], ['souche', 120, 880], ['rocher', 560, 760, 16], ['rocher', 980, 680, 20], ['rocher', 220, 580, 14], ['rocher', 740, 500, 12],
  ];
  deco.forEach(([type, x, y, w], k) => {
    if (type === 'buisson') C.objet(Foret.buisson(100 + k, w, { baies: k % 3 === 0 ? 5 : 0, automne: k % 2 ? 0.5 : 0 }), x, y, { solide: [-w / 2 + 3, -4, w - 6, 5] });
    else if (type === 'souche') C.objet(Foret.souche(k), x, y, { solide: [-8, -4, 16, 5] });
    else C.objet(Foret.rocher(k, w), x, y, { solide: [-w / 2 + 1, -4, w - 2, 5] });
  });
  // le poteau indicateur du carrefour et le panneau de l'entrée
  C.objet(Foret.poteau([['^', '#c8a070'], ['<', '#a88660'], ['>', '#b89a70']]), 566, 474, { solide: [-2, -2, 4, 3], texte: 'poteau', zw: 18 });
  C.objet(Foret.poteau([['^', '#c8a070']]), 572, 952, { solide: [-2, -2, 4, 3], texte: 'panneauForet', zw: 18 });
  C.objet(Foret.cible(4), 706, 444, { solide: [-6, -2, 12, 3], texte: 'miniCible', zw: 16 });

  // le mur d'arbres : chaque case où l'on ne marche pas
  for (let j = 0; j < NR; j++) {
    for (let i = 0; i < NC;) {
      if (libre[j][i]) { i++; continue; }
      let f = i; while (f + 1 < NC && !libre[j][f + 1]) f++;
      C.solide(i * CW, j * CW, (f - i + 1) * CW, CW);
      i = f + 1;
    }
  }
  // cime des arbres vue d'en haut, peinte au sol là où l'on ne va jamais
  const cimes = PX.rng(77);
  for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) {
    if (libre[j][i]) continue;
    const bord = (j + 1 < NR && libre[j + 1][i]) || (i > 0 && libre[j][i - 1]) || (i + 1 < NC && libre[j][i + 1]);
    if (bord) continue;
    Foret.feuillage(P, cimes, i * CW + 8, j * CW + 8, 10, 8, 3, { couleurs: ['#12261a', '#1c3a24', '#28502f', '#3a6a38', '#5a8a42'], automne: 0.4 });
  }
  // et de grands chênes en bordure
  const VARIANTES = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => Foret.chene(200 + s, { automne: s % 3 === 0 ? 1.4 : 0.5 }));
  const SAPINS = [2, 3, 2].map((n, s) => Foret.sapin(300 + s, n));
  const places = [];
  const loinDesAutres = (x, y, d) => places.every(([a, b]) => Math.hypot(a - x, b - y) > d);
  // distance d'un point au chemin le plus proche (pour ne pas planter d'arbre en travers)
  const distChemin = (x, y) => Math.min(...CHEMINS.map((c) => Math.min(...c.slice(1).map(([x1, y1], k) => {
    const [x0, y0] = c[k], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(x - x0 - dx * t, y - y0 - dy * t);
  }))));
  const couloirDegage = (x, y) => distChemin(x, y) > 22;
  // les endroits à ne jamais cacher sous un feuillage (personnages, détails à trouver, arrivée)
  const A_VOIR = [[214, 866], [246, 872], [128, 816], [256, 634], [380, 477], [682, 470], [706, 444], [528, 952], [470, 552], [200, 470], [76, 236],
    [918, 898], [858, 928], [700, 906], [930, 762], [180, 520], [566, 474], [572, 952], [124, 236], [830, 840]];
  const cache = (x, y) => A_VOIR.some(([a, b]) => Math.abs(a - x) < 50 && b < y - 6 && b > y - 118);
  for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) {
    if (libre[j][i]) continue;
    const dessous = j + 1 < NR && libre[j + 1][i], dessus = j > 0 && libre[j - 1][i];
    const cote = (i > 0 && libre[j][i - 1]) || (i + 1 < NC && libre[j][i + 1]);
    if (!dessous && !cote && !dessus) continue;
    // au sud d'un passage, on met des buissons et l'arbre recule pour ne pas cacher Ismae
    const sud = dessus && !dessous;
    const x = i * CW + 8 + r.int(9) - 4, y = (j + 1) * CW - 2 + (sud ? 64 : 0);
    if (sud && j * CW < H - 40 && r.chance(0.6)) C.objet(Foret.buisson(500 + i * 7 + j, 26 + r.int(10), { baies: r.chance(0.3) ? 4 : 0 }), i * CW + 8, j * CW + 14);
    if (!loinDesAutres(x, y, dessous ? 46 : 58) || !couloirDegage(x, y) || y > H + 40 || cache(x, y)) continue;
    places.push([x, y]);
    const neige = x < 190 && y < 300;
    C.objet(neige ? r.pick(SAPINS) : r.pick(VARIANTES), x, y);
    O.ellipse(x + 6, y - 4, neige ? 14 : 30, neige ? 5 : 10, '#000');
  }

  // ---------------------------------------------------------------- les lumières du soir et les petits détails
  // la chapelle de Frère Tuck, ses fenêtres éclairées
  const chap = Foret.chapelle();
  C.objet(chap, 200, 470, { solide: [-32, -36, 64, 36] });
  chap.lumieres.forEach(([lx, ly, lr]) => C.lumiere(200 - chap.ax + lx, 470 - chap.ay + ly, lr, 'win'));
  O.rect(170, 470, 62, 3, '#000');
  C.zone(188, 466, 24, 12, 'chapelle');
  // lanternes le long des chemins
  for (const [x, y] of [[556, 906], [474, 802], [464, 696], [394, 610], [478, 470], [480, 392], [576, 360], [862, 610], [362, 832], [296, 626], [140, 228], [404, 492]])
    C.objet(Foret.lanterne(), x, y, { solide: [-2, -3, 5, 3], rayon: 48 });
  // torches (flammes animées) à l'entrée du tournoi, au pied de la tribune et près des cibles
  const torche = (x, y) => {
    C.solide(x - 2, y - 3, 5, 3);
    C.lumiere(x, y - 30, 56, 'feu');
    C.dynamiques.push({ sortY: y, draw(g, J) {
      const t = J.t || 0;
      g.fillStyle = '#1d1626'; g.fillRect(x - 2, y - 28, 5, 28); g.fillStyle = '#6a4428'; g.fillRect(x - 1, y - 27, 3, 27); g.fillStyle = '#9a7a52'; g.fillRect(x - 1, y - 27, 1, 27);
      g.fillStyle = '#3a3646'; g.fillRect(x - 3, y - 31, 7, 4); g.fillStyle = '#5a5668'; g.fillRect(x - 3, y - 31, 7, 1);
      for (let k = 0; k < 3; k++) {
        const hgt = 5 + Math.round(Math.abs(Math.sin(t * 11 + k * 2.1 + x)) * 4) - (k === 1 ? 0 : 2), fx = x - 2 + k * 2;
        g.fillStyle = '#d8402a'; g.fillRect(fx, y - 31 - hgt, 2, hgt); g.fillStyle = '#f2a03a'; g.fillRect(fx, y - 30 - hgt + 2, 2, Math.max(1, hgt - 3)); g.fillStyle = '#ffe28a'; g.fillRect(fx + (k % 2), y - 31 - Math.max(1, hgt - 4), 1, Math.max(1, hgt - 5));
      }
    } });
  };
  torche(484, 322); torche(574, 322); torche(TRIB.x + 62, TRIB.y + TRIB.h + 18); torche(TRIB.x + 106, TRIB.y + TRIB.h + 18); torche(396, 150); torche(664, 150);
  C.lumiere(236, 104, 26, 'win'); C.lumiere(900, 104, 26, 'win'); // le dedans des tentes
  // sapins de Noël décorés : au campement de Robin et à l'entrée du tournoi
  for (const [x, y, seed] of [[152, 874, 3], [420, 306, 4], [650, 306, 6]]) {
    C.objet(Objets.grandSapin(seed), x, y, { solide: [-7, -4, 14, 5], ombre: [16, 4], rayon: 60, k: 'xmas' });
  }
  // guirlandes lumineuses : devant la tribune royale et au-dessus de l'entrée du tournoi
  for (const [x, y, w, creux] of [[TRIB.x + 4, TRIB.y + TRIB.h - 10, TRIB.w - 8, 6], [486, 300, 86, 7], [200, 96, 76, 6], [864, 96, 76, 6]]) {
    const gl = Objets.guirlande(w, creux); C.dessusImg(gl.img, x, y); gl.bulbs.forEach(([bx, by]) => C.scintille.push([x + bx, y + by]));
  }
  // guirlandes de fanions, au premier plan
  C.dessusImg(Foret.fanions(100, 8, ['#c8343a', '#f2c230', '#3a5aa8', '#f4efe6']), 480, 290);
  C.dessusImg(Foret.fanions(286, 16, ['#f2c230', '#c8343a', '#f4efe6', '#3a5aa8']), 388, 52);
  C.dessusImg(Foret.fanions(TRIB.w - 6, 10, ['#a8283a', '#e8b54a']), TRIB.x + 3, TRIB.y - 42);
  // au campement : le râtelier d'arcs, une cible d'entraînement ; au tournoi, la charrette de foin
  C.objet(Foret.ratelier(), 286, 820, { solide: [-12, -3, 24, 4], texte: 'ratelier', zw: 24 });
  C.objet(Foret.cible(6), 300, 900, { solide: [-7, -2, 14, 3] });
  C.objet(Foret.charrette(), 330, 104, { solide: [-22, -6, 44, 7], ombre: [22, 4], texte: 'charrette', zw: 40 });
  // fougères et hautes herbes là où l'on ne marche pas trop
  const vr = PX.rng(4321);
  for (let k = 0, n = 0; k < 900 && n < 110; k++) {
    const x = 70 + vr.int(W - 140), y = 80 + vr.int(H - 120);
    if (!estLibre(x, y) || !estLibre(x - 8, y) || !estLibre(x + 8, y) || distChemin(x, y) < 18 || A_VOIR.some(([a, b]) => Math.hypot(a - x, b - y) < 28)) continue;
    if ((x > GRAD.x - 10 && x < TRIB.x + TRIB.w + 10 && y < 330) || Math.abs(y - yc(x)) < 30) continue; // pas sur le terrain du tournoi ni dans l'eau
    if (C.solides.some((s) => x > s.x - 6 && x < s.x + s.w + 6 && y > s.y - 4 && y < s.y + s.h + 8)) continue;
    C.objet(vr.chance(0.5) ? Foret.fougere(k) : Foret.herbes(k), x, y);
    n++;
  }
  // les lucioles, au-dessus de l'eau, dans la prairie et autour du campement (elles brillent par-dessus l'éclairage)
  const lucioles = [];
  for (const [zx, zy, zw, zh, n] of [[80, 610, 900, 80, 26], [660, 760, 300, 160, 14], [90, 780, 260, 140, 10], [380, 440, 280, 140, 8]])
    for (let k = 0; k < n; k++) lucioles.push({ x: zx + vr.int(zw), y: zy + vr.int(zh), ph: vr() * 6.28, v: 0.5 + vr() });
  C.apresLumiere = (g, J, lum) => {
    const t = J.t || 0, cam = J.cam, V = J.V;
    g.globalCompositeOperation = 'lighter';
    for (const l of lucioles) {
      const x = Math.round(l.x + Math.sin(t * 0.6 * l.v + l.ph) * 14), y = Math.round(l.y + Math.cos(t * 0.8 * l.v + l.ph * 2) * 8);
      if (x < cam.x - 8 || x > cam.x + V.w + 8 || y < cam.y - 8 || y > cam.y + V.h + 8) continue;
      const a = Math.max(0, Math.sin(t * 2 * l.v + l.ph));
      if (a < 0.05) continue;
      g.globalAlpha = a * 0.55; g.drawImage(lum(5, 'luciole'), x - 5, y - 5);
      g.globalAlpha = a; g.fillStyle = '#f4ffc0'; g.fillRect(x, y, 1, 1);
    }
  };

  // ---------------------------------------------------------------- rayons de soleil entre les arbres
  const rayon = (w, h) => {
    const c = PX.canvas(w + h, h), g = c.getContext('2d');
    for (let y = 0; y < h; y++) {
      const a = 0.11 * Math.sin((y / h) * Math.PI);
      g.fillStyle = `rgba(255,206,140,${a.toFixed(3)})`; g.fillRect(Math.round(h - y), y, w, 1);
    }
    return c;
  };
  for (const [x, y, w, h] of [[360, 380, 28, 200], [620, 420, 18, 160], [180, 700, 24, 180], [700, 720, 30, 200], [420, 40, 34, 240], [600, 60, 20, 200]]) C.dessusImg(rayon(w, h), x - h, y);

  // ---------------------------------------------------------------- personnages
  const A = CONFIG.animaux, F = CONFIG.figurants;
  const rep = (id) => (J) => Sherwood.repliques(id, J);
  const bete = (id, cfg, x, y, o = {}) => { const b = new Entites.Perso(Object.assign({ id, cfg, x, y, dialogue: rep(o.repliques || id) }, o)); C.pnj.push(b); return b; };
  const figurant = (id, type, cfg, x, y, o = {}) => { const f = new Betes.Figurant(Object.assign({ id, type, cfg, x, y, dialogue: rep(o.repliques || id) }, o)); C.pnj.push(f); return f; };
  // habitants de la forêt
  bete('petitJean', A.petitJean, 250, 876, { dir: 'left', fixe: true, ombreR: 10 });
  const tuck = bete('tuck', A.tuck, 256, 634, { dir: 'down', fixe: true });
  C.dynamiques.push({ sortY: 635, draw(g, J) { // sa canne à pêche
    const b = Math.round(Math.sin((J.t || 0) * 3) * 1), x0 = tuck.x + 6, y0 = tuck.y - 13, x1 = tuck.x + 22, y1 = tuck.y - 20;
    g.fillStyle = '#6a4428'; for (let k = 0; k <= 8; k++) g.fillRect(Math.round(x0 + (x1 - x0) * k / 8), Math.round(y0 + (y1 - y0) * k / 8), 1, 1);
    g.fillStyle = 'rgba(240,240,240,0.6)'; for (let y = y1; y < tuck.y + 22; y += 2) g.fillRect(x1, y, 1, 1);
    g.fillStyle = '#d8323a'; g.fillRect(x1 - 1, tuck.y + 22 + b, 3, 2); g.fillStyle = '#ffffff'; g.fillRect(x1, tuck.y + 22 + b, 1, 1);
  } });
  figurant('adam', 'coq', F.adam, 380, 477, { notes: true, sortYFixe: 489, sansOmbre: true }); // assis sur sa souche
  figurant('lapereau', 'lapereau', F.lapereau, 682, 470);
  figurant('tortue', 'tortue', F.tortue, 700, 820, { ronde: [{ x: 700, y: 820 }, { x: 880, y: 800 }], vitesse: 4 });
  // le public du tournoi
  const marianne = bete('marianne', A.marianne, 222, 168, { fixe: true });
  const spectateurs = [
    marianne,
    figurant('gertrude', 'poule', F.gertrude, 256, 170),
    figurant('lapin1', 'lapin', F.lapin1, 200, 204, { repliques: 'lapin' }),
    figurant('lapin2', 'lapin', F.lapin2, 286, 204, { repliques: 'lapin' }),
    figurant('lapin3', 'lapin', F.lapin3, 316, 236, { repliques: 'lapin' }),
  ];
  const sherif = bete('sherif', A.sherif, 488, 278, { dir: 'right' });
  // le roi Jean, ses gardes et Triste Sire (ils arrivent pendant la capture)
  const roi = bete('roi', A.roi, -60, -60, { visible: false, dir: 'down' });
  const gardes = [bete('garde1', A.garde, -60, -60, { visible: false, lance: true, repliques: 'garde' }), bete('garde2', A.garde, -60, -60, { visible: false, lance: true, repliques: 'garde' })];
  Entites.portraits.garde = gardes[0].spr.down.idle; // les répliques des gardes et des lapins sont signées « garde » et « lapin »
  Entites.portraits.lapin = spectateurs[2].spr.idle;
  const sire = figurant('sire', 'serpent', null, -60, -60, { visible: false });
  // Robin des Bois (arrive après la victoire)
  const robin = bete('robin', A.robin, -60, -60, { visible: false });
  // la cage vide, laissée sur la tribune une fois Georges libéré
  const cageVide = { visible: false, x: TRIB.x + 46, y: TRIB.y + 70, get sortY() { return this.y; },
    draw(g) { if (this.visible) Entites.poser(g, Betes.cage(true), this.x, this.y + 3); } };
  C.dynamiques.push(cageVide);

  C.sherwood = {
    roi, gardes, sire, sherif, robin, tuck, spectateurs, cageVide,
    capture: { x: 470, y: 552 },                        // Ismae s'arrête ici quand le cortège arrive
    zoneCapture: { x: 330, y: 420, w: 380, h: 196 },    // au nord du ruisseau, au milieu
    zoneTournoi: { x: 380, y: 232, w: 300, h: 84 },     // devant le pas de tir
    pasDeTir: { x: 530, y: 278 },
    // places au tournoi
    trone: { x: TRIB.x + 84, y: TRIB.y + 66 },
    cage: { x: TRIB.x + 46, y: TRIB.y + 70 },
    sireTrone: { x: TRIB.x + 122, y: TRIB.y + 70 },
    gardesTribune: [{ x: TRIB.x + 14, y: TRIB.y + TRIB.h + 26 }, { x: TRIB.x + TRIB.w - 14, y: TRIB.y + TRIB.h + 26 }],
    escalier: { x: TRIB.x + 84, y: TRIB.y + TRIB.h + 22 },
    robinDepart: { x: 236, y: 290 },
  };

  // ---------------------------------------------------------------- entrées et sorties
  C.arrivees.entree = { x: 528, y: 952, dir: 'up' };
  C.porte(496, 994, 64, 14, 'foret', 'entree', 'down');
  C.portes[C.portes.length - 1].condition = () => Sherwood.retour();
  C.porte(40, 0, 56, 14, 'foret', 'entree', 'up');
  C.portes[C.portes.length - 1].condition = () => Sherwood.montagnes();
  C.onEntree = (J) => Sherwood.entree(J);
  C.estLibre = estLibre;
  C.finaliser(0.28);
  return C;
});
