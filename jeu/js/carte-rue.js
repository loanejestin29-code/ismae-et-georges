// =====================================================================
//  carte-rue.js — ZONE 1 : la rue parisienne
//
//  Plan (coordonnées en pixels, y vers le bas) :
//    y   0-300  toits de Paris (décor) + cour intérieure + jardin secret
//    y 290-460  petite place avec le grand sapin (à l'ouest)
//    y 460-586  la rue : trottoir nord, chaussée pavée
//    y 586-704  quai haut : platanes, fontaine, kiosque, bancs
//    y 704-758  parapet et mur du quai (deux escaliers pour descendre)
//    y 758-850  quai bas, au bord de l'eau, avec la péniche
//    y 858-...  la Seine
// =====================================================================
'use strict';

Jeu.enregistrerCarte('rue', () => {
  const W = 1600, H = 1060, BASE = 460;
  const C = new Carte('rue', W, H, { ambiance: 'soir', fond: '#151026' });
  const P = C.P, O = C.O;
  const r = PX.rng(2024);

  // ---------------------------------------------------------------- SOL
  Sol.toits(P, 0, 0, W, 300, r);
  // place (ouest)
  Sol.paves(P, 0, 290, 300, 175, r, { base: ['#8a7f78', '#948880', '#7f766f', '#9a8c80'], hi: '#ada196', lo: '#6c635e', joint: '#544b4a' });
  P.ellipse(150, 392, 46, 20, '#b4a894'); P.ellipse(150, 392, 43, 18, '#a2967f');
  for (let a = 0; a < 64; a++) { const t = (a / 64) * Math.PI * 2; P.px(150 + Math.round(Math.cos(t) * 44), 392 + Math.round(Math.sin(t) * 19), '#d6ccb8'); }
  // cour intérieure
  Sol.dalles(P, 520, 160, 240, 140, r);
  Sol.bande(P, 520, 160, 140, 10, 0.5, 'droite'); Sol.bande(P, 750, 160, 140, 10, 0.5, 'gauche');
  Sol.bande(P, 520, 160, 240, 8, 0.35);
  // jardin secret : mur couvert de lierre, pelouse, allée de gravier
  Sol.herbe(P, 1100, 160, 220, 140, r);
  Sol.gravier(P, 1176, 160, 52, 140, r);
  Sol.gravier(P, 1130, 196, 160, 26, r);
  Sol.massif(P, 1108, 164, 60, 12, r); Sol.massif(P, 1240, 164, 72, 12, r);
  P.rect(1100, 100, 220, 60, '#8e8474');
  Sol.murQuai(P, 1100, 104, 220, 56, r);
  P.rect(1100, 98, 220, 6, '#cfc4b0'); P.hline(1100, 98, 220, '#e8dfcc'); P.hline(1100, 103, 220, '#7a7062');
  for (let k = 0; k < 260; k++) { const x = 1100 + r.int(220), y = 104 + r.int(40 + (x % 7)); P.ellipse(x, y, 1 + r.int(2), 1, r.pick(['#2f5d3a', '#3f7a45', '#4e8c4a', '#2a4a33'])); }
  P.rect(1196, 120, 18, 40, '#6a4a32'); for (let y = 122; y < 160; y += 4) P.hline(1197, y, 16, '#4a3222'); P.px(1210, 140, '#e0b04a');
  const arbreFond = Objets.arbreFeuillu(77, { w: 60, h: 70 });
  P.draw(arbreFond.img, 1110, 28); P.draw(Objets.arbreFeuillu(78, { w: 60, h: 70 }).img, 1250, 30);
  Sol.bande(P, 1100, 160, 140, 10, 0.5, 'droite'); Sol.bande(P, 1310, 160, 140, 10, 0.5, 'gauche');
  Sol.bande(P, 1100, 160, 220, 10, 0.45);
  // ruelles
  for (const ax of [600, 1180]) {
    Sol.paves(P, ax, 250, 40, 215, r, { base: ['#5f5b6d', '#666176', '#58546a'], hi: '#7a768c', lo: '#47435a', joint: '#34304a' });
    Sol.bande(P, ax, 250, 215, 12, 0.6, 'droite'); Sol.bande(P, ax + 32, 250, 215, 8, 0.4, 'gauche');
  }
  // trottoir nord + bordure
  Sol.trottoir(P, 0, BASE, W, 28, r);
  Sol.bordure(P, 0, 488, W);
  // chaussée pavée
  Sol.paves(P, 0, 494, W, 87, r);
  P.dither(0, 491, W, 3, '#3f3b50', 12);
  // rails de l'ancien tramway, au milieu de la chaussée
  for (const ry of [526, 547]) {
    P.hline(0, ry, W, '#4a4658'); P.hline(0, ry + 1, W, '#a9a6b8'); P.hline(0, ry + 2, W, '#36324a');
    for (let x = ry % 13; x < W; x += 37) P.rect(x, ry + 1, 3, 1, '#d4d2e2');
  }
  for (const [x, y] of [[480, 512], [1150, 566], [880, 508]]) Sol.plaque(P, x, y);
  for (const [x, y, w] of [[300, 556, 22], [820, 530, 30], [1360, 560, 18]]) {
    P.ellipse(x, y, w / 2, 3, '#3a3f5e'); P.ellipse(x - 1, y, w / 2 - 3, 2, '#454c70');
    P.hline(x - w / 4, y - 1, w / 3, '#8d9cc8'); P.px(x + 3, y + 1, '#6a7ab0');
  }
  // bordure sud + quai haut
  P.dither(0, 579, W, 3, '#2e2a40', 10);
  P.hline(0, 582, W, '#4a4658'); P.hline(0, 583, W, '#d9d1c4'); P.hline(0, 584, W, '#bdb4a5'); P.hline(0, 585, W, '#8f877a');
  Sol.trottoir(P, 0, 586, W, 14, r);
  Sol.gravier(P, 0, 600, W, 104, r);
  P.hline(0, 600, W, '#8f877a');
  // parapet, mur du quai, escaliers
  const ESC = [[360, 32], [1240, 32]];
  Sol.parapet(P, 0, 704, W);
  Sol.murQuai(P, 0, 712, W, 46, r);
  for (const [ex, ew] of ESC) Sol.escalier(P, ex, 704, ew, 56);
  C.escaliers = ESC.map(([ex, ew]) => ({ x: ex, y: 700, w: ew, h: 62 }));
  // quai bas
  Sol.paves(P, 0, 758, W, 92, r, { base: ['#857c74', '#7a726b', '#8e857b', '#766f69', '#8a7c70'], hi: '#a39a8f', lo: '#625b55', joint: '#4a4442' });
  Sol.bande(P, 0, 758, W, 10, 0.55);
  for (let k = 0; k < 160; k++) P.px(r.int(W), 760 + r.int(88), r.pick(['#5d7a4a', '#4e6e44', '#6f8a52']));
  for (const [x, y, w] of [[240, 812, 26], [760, 790, 18], [1340, 822, 22]]) {
    P.ellipse(x, y, w / 2, 3, '#3e4562'); P.ellipse(x - 1, y, w / 2 - 3, 2, '#4a5276'); P.hline(x - w / 4, y - 1, w / 3, '#9aa8d0');
  }
  // bord du quai (margelle) avec anneaux d'amarrage + Seine
  P.rect(0, 850, W, 4, '#c8bea8'); P.hline(0, 850, W, '#e6dcc8'); P.rect(0, 854, W, 4, '#7a7062');
  for (let x = 0; x < W; x += 30) P.vline(x, 850, 4, '#a89e88');
  for (let x = 70; x < W; x += 130) { P.ellipse(x, 853, 2, 1, '#2a2632'); P.px(x, 852, '#6a6878'); }
  Sol.eau(P, 0, 858, W, H - 858);
  Sol.bande(P, 0, 858, W, 9, 0.6, 'bas', '8,14,30');
  C.eaux.push({ x: 0, y: 860, w: W, h: H - 860 });

  // ---------------------------------------------------------------- COLLISIONS DU DÉCOR
  C.solide(0, 0, 300, 290);
  C.solide(300, 0, 220, 300); C.solide(760, 0, 340, 300); C.solide(1320, 0, 280, 300);
  C.solide(520, 0, 240, 162); C.solide(1100, 0, 220, 160);
  C.solide(0, 702, 360, 58); C.solide(392, 702, 848, 58); C.solide(1272, 702, 328, 58);
  C.solide(0, 850, W, H - 850);

  // ---------------------------------------------------------------- IMMEUBLES
  const B = (o) => Batiments.building(o);
  // place
  const pharmacie = B({ w: 150, facade: 'creme', boutique: 'pharmacie', seed: 31 });
  C.batiment(pharmacie, 0, 290);
  const atelier = B({ w: 150, facade: 'ocre', style: 'ancien', etages: 4, boutique: 'atelier', volets: '#3f6d8e', lierre: 'gauche', seed: 33 });
  C.batiment(atelier, 150, 290);
  // cour
  C.batiment(B({ w: 120, facade: 'ocre', style: 'ancien', etages: 3, boutique: 'porte', volets: '#5f7f5a', seed: 41, cheminees: 1 }), 520, 162);
  C.batiment(B({ w: 120, facade: 'rose', style: 'ancien', etages: 3, boutique: 'porte', volets: '#8a5a5a', lierre: 'droite', seed: 43, cheminees: 1 }), 640, 162);
  // la rue (de l'ouest vers l'est)
  const rue = [
    ['fromagerie', 300, 120, { facade: 'creme', seed: 51 }],
    ['cafe', 420, 180, { facade: 'ocre', seed: 53 }],
    ['fleuriste', 640, 130, { facade: 'rose', seed: 55, etages: 4, lierre: 'droite' }],
    ['carrefour', 770, 190, { facade: 'gris', seed: 57 }],
    ['boulangerie', 960, 120, { facade: 'creme', seed: 59 }],
    ['librairie', 1080, 100, { facade: 'ocre', style: 'ancien', etages: 4, volets: '#4c6f96', seed: 61 }],
    ['hotel', 1220, 140, { facade: 'blanc', seed: 63 }],
    ['patisserie', 1360, 120, { facade: 'rose', seed: 65, etages: 4 }],
    ['antiquaire', 1480, 120, { facade: 'vert', style: 'ancien', etages: 4, volets: '#2f5a46', seed: 67, lierre: 'gauche' }],
  ];
  const textes = { fromagerie: 'fromagerie', cafe: 'cafe', fleuriste: 'fleuriste', carrefour: 'superetteVitrine', boulangerie: 'boulangerie', librairie: 'librairie', hotel: 'hotel', patisserie: 'patisserie', antiquaire: 'antiquaire' };
  const bats = {};
  for (const [type, x, w, o] of rue) {
    const b = B(Object.assign({ w, boutique: type }, o));
    bats[type] = { b, x, top: BASE - b.h };
    C.batiment(b, x, BASE);
    C.zone(x + 8, BASE - 12, w - 16, 14, textes[type]);
    // guirlande lumineuse sous l'enseigne
    const gl = Objets.guirlande(w - 8, 4);
    C.dessusImg(gl.img, x + 4, BASE - 50);
    gl.bulbs.forEach(([bx, by]) => C.scintille.push([x + 4 + bx, BASE - 50 + by]));
  }
  C.zone(10, 278, 130, 14, 'pharmacie'); C.zone(160, 278, 130, 14, 'atelier');

  // ---------------------------------------------------------------- SUPÉRETTE : portes automatiques
  const sup = bats.carrefour, door = sup.b.door;
  const DX = sup.x + door.x, DY = sup.top + door.y, DW = door.w, DH = door.h;
  const portes = {
    ouvert: 0, sortY: BASE + 0.5,
    update(dt, J) {
      const p = J.joueur;
      const pres = Math.abs(p.x - (DX + DW / 2)) < 26 && p.y < BASE + 34;
      this.ouvert = Math.max(0, Math.min(1, this.ouvert + (pres ? dt * 3 : -dt * 2.2)));
    },
    draw(g) {
      g.save(); g.beginPath(); g.rect(DX, DY, DW, DH); g.clip();
      const half = DW / 2, off = Math.round(this.ouvert * (half - 1));
      for (const [x0, s] of [[DX - off, 0], [DX + half + off, 1]]) {
        g.fillStyle = 'rgba(190,228,242,0.55)'; g.fillRect(x0, DY, half, DH);
        g.fillStyle = '#8b909b'; g.fillRect(x0, DY, half, 1); g.fillRect(x0, DY + DH - 1, half, 1);
        g.fillRect(s ? x0 : x0 + half - 1, DY, 1, DH);
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x0 + 2, DY + 3, 1, 5); g.fillRect(x0 + 3, DY + 2, 1, 3);
      }
      g.restore();
    },
  };
  C.dynamiques.push(portes);
  C.porte(DX + 3, BASE - 8, DW - 6, 14, 'superette', 'entree', 'up');
  C.portes[C.portes.length - 1].condition = () => portes.ouvert > 0.6;
  C.arrivees.devantSuperette = { x: DX + DW / 2, y: BASE + 16, dir: 'down' };
  // tapis devant l'entrée
  P.rect(DX + 1, BASE + 1, DW - 2, 6, '#3d4458'); P.hline(DX + 1, BASE + 1, DW - 2, '#5a6380');

  // ---------------------------------------------------------------- MOBILIER
  const lampe = (x, y) => {
    const l = Objets.lampadaire();
    C.objet(l, x, y, { solide: [-3, -3, 6, 4], ombre: [5, 2], texte: 'lampadaire', zw: 14, zh: 12, lumiere: false });
    C.lumiere(x, y - 6, 74, 'lamp'); C.lumiere(x, y - 50, 10, 'halo');
  };
  [312, 708, 1090, 1470].forEach((x) => lampe(x, 486));
  [40, 262].forEach((x) => lampe(x, 452));
  [140, 520, 900, 1330].forEach((x) => lampe(x, 598));
  [300, 720, 1100, 1500].forEach((x) => lampe(x, 698));
  // platanes illuminés le long du quai
  [60, 220, 440, 640, 1000, 1170, 1400, 1550].forEach((x, i) => {
    Sol.grille(P, x, 646);
    const a = Objets.platane(100 + i);
    C.objet(a, x, 646, { solide: [-4, -3, 8, 5], ombre: [8, 3] });
    C.lumiere(x, 600, 42, 'tree');
  });
  // place : grand sapin, bancs, colonne Morris
  const sapin = Objets.grandSapin(9);
  C.objet(sapin, 150, 395, { solide: [-12, -6, 24, 8], ombre: [16, 4], texte: 'sapin', zw: 36, zh: 18 });
  C.lumiere(150, 365, 80, 'tree'); C.lumiere(150, 330, 18, 'xmas');
  for (const [x, y] of [[66, 360], [234, 360], [80, 445], [220, 445]]) {
    C.objet(Objets.banc(), x, y, { solide: [-13, -6, 26, 6], ombre: [13, 2], texte: 'banc', zw: 26, zh: 14 });
  }
  C.objet(Objets.colonneMorris(5), 286, 482, { solide: [-9, -5, 18, 6], ombre: [10, 3], texte: 'colonne', zw: 22 });
  C.objet(Objets.pot(3, 'sapin'), 46, 300, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(4, 'sapin'), 104, 300, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  // terrasse du café
  [[440, 478], [482, 476], [528, 478], [570, 476]].forEach(([x, y]) => {
    C.objet(Objets.chaiseBistrot(), x - 8, y - 1, { solide: [-3, -2, 6, 3] });
    C.objet(Objets.tableCafe(), x, y, { solide: [-4, -2, 8, 3], ombre: [5, 2], texte: 'terrasse', zw: 18 });
    C.objet(Objets.chaiseBistrot(), x + 8, y + 1, { solide: [-3, -2, 6, 3] });
  });
  // devantures
  C.objet(Objets.etalFleurs(7), 700, 479, { solide: [-15, -6, 30, 7], ombre: [15, 2], texte: 'fleuriste', zw: 30 });
  C.objet(Objets.pot(8), 652, 476, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.caisses(11), 792, 480, { solide: [-10, -6, 20, 7], ombre: [11, 2], texte: 'caisses', zw: 22 });
  C.objet(Objets.caisses(12), 936, 480, { solide: [-10, -6, 20, 7], ombre: [11, 2], texte: 'caisses', zw: 22 });
  C.objet(Objets.velo(), 1146, 480, { solide: [-11, -3, 22, 4], ombre: [11, 2], texte: 'velo', zw: 24 });
  C.objet(Objets.pot(13, 'sapin'), 1272, 474, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(14, 'sapin'), 1308, 474, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(15), 1500, 474, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  // quai haut
  C.objet(Objets.fontaineWallace(), 560, 652, { solide: [-8, -5, 16, 6], ombre: [9, 3], texte: 'fontaine', zw: 22 });
  C.objet(Objets.kiosque(), 820, 640, { solide: [-16, -8, 32, 9], ombre: [17, 3], texte: 'kiosque', zw: 34 });
  [[300, 690], [680, 690], [1000, 690], [1440, 690]].forEach(([x, y]) => C.objet(Objets.banc(), x, y, { solide: [-13, -6, 26, 6], ombre: [13, 2], texte: 'banc', zw: 26, zh: 14 }));
  [450, 482, 514, 1040, 1072, 1104, 1136].forEach((x, i) => C.objet(Objets.boiteBouquiniste(20 + i), x, 711, { texte: 'bouquiniste', zw: 30, zh: 14 }));
  for (const [x, y, w] of [[120, 664, 60], [1250, 662, 70], [940, 662, 40]]) Sol.massif(P, x, y, w, 12, r);
  // quai bas
  for (let x = 40; x < W; x += 90) C.objet(Objets.borne(), x, 846, { solide: [-2, -2, 4, 3], ombre: [3, 1] });
  for (const x of [200, 600, 1000, 1400]) { const l = Objets.lanterneMurale(); C.objet(l, x, 738, { dy: -40 }); C.lumiere(x, 740, 70, 'lamp'); C.lumiere(x, 734, 8, 'halo'); }
  [330, 1240].forEach((x) => lampe(x, 846));
  C.objet(Objets.barque(), 1330, 905, { texte: null });
  C.zone(1310, 836, 44, 14, 'barque');
  C.objet(Objets.echelle(), 1180, 853, { dy: -4 });
  C.objet(Objets.tonneau(), 1296, 778, { solide: [-5, -3, 10, 4], ombre: [6, 2], texte: 'caisses' });
  C.objet(Objets.tonneau(), 1309, 781, { solide: [-5, -3, 10, 4], ombre: [6, 2] });
  C.objet(Objets.caisses(32), 1212, 776, { solide: [-10, -6, 20, 7], ombre: [11, 2], texte: 'caisses', zw: 22 });
  C.objet(Objets.banc(), 900, 800, { solide: [-13, -6, 26, 6], ombre: [13, 2], texte: 'banc', zw: 26, zh: 14 });
  C.objet(Objets.banc(), 160, 800, { solide: [-13, -6, 26, 6], ombre: [13, 2], texte: 'banc', zw: 26, zh: 14 });
  // vieille voiture garée le long du trottoir
  C.objet(Objets.voiture(), 1210, 578, { solide: [-30, -9, 62, 10], ombre: [30, 3], texte: 'voiture', zw: 64, zh: 14, lumiere: false });
  const pen = Objets.peniche(5);
  C.objet(pen, 520, 922, { texte: null });
  C.zone(540, 836, 200, 14, 'peniche');
  pen.lights.forEach(([lx, ly]) => C.lumiere(520 + lx, 922 - pen.ay + ly, 34, 'boat'));
  C.objet(Objets.caisses(31), 1520, 800, { solide: [-10, -6, 20, 7], ombre: [11, 2], texte: 'caisses', zw: 22 });
  C.zone(0, 840, W, 12, 'seine');
  for (const [ex] of ESC) C.zone(ex, 690, 32, 12, 'escalier');
  // barrières de travaux aux extrémités
  for (const [x, y, k] of [[18, 520, 'barriereOuest'], [18, 568, 'barriereOuest'], [1582, 520, 'barriereEst'], [1582, 568, 'barriereEst'], [18, 650, 'barriereOuest'], [1582, 650, 'barriereEst']]) {
    C.objet(Objets.barriere(), x, y, { ombre: [16, 2], texte: k, zw: 36, zh: 20, rayon: 30 });
  }
  C.solide(0, 460, 30, 242); C.solide(1570, 460, 30, 242);
  // cour : pompe, poubelles, vélo, linge, table
  C.objet(Objets.pompe(), 560, 214, { solide: [-6, -4, 12, 5], ombre: [6, 2], texte: 'puits', zw: 18 });
  C.objet(Objets.poubelles(), 728, 192, { solide: [-12, -5, 24, 6], ombre: [12, 2], texte: 'poubelles', zw: 26 });
  C.objet(Objets.pot(21), 540, 172, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(22), 698, 172, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.tableCafe(), 690, 252, { solide: [-4, -2, 8, 3], ombre: [5, 2], texte: 'terrasse' });
  C.objet(Objets.chaiseBistrot(), 682, 251, { solide: [-3, -2, 6, 3] });
  C.objet(Objets.chaiseBistrot(), 698, 253, { solide: [-3, -2, 6, 3] });
  const linge1 = Objets.linge(240, 3), linge2 = Objets.linge(40, 4), linge3 = Objets.linge(40, 6);
  C.dessusImg(linge1.img, 520, 88); C.dessusImg(linge2.img, 600, 316); C.dessusImg(linge3.img, 600, 372);
  C.zone(600, 330, 40, 50, 'linge');
  const gc = Objets.guirlande(240, 10); C.dessusImg(gc.img, 520, 146); gc.bulbs.forEach(([bx, by]) => C.scintille.push([520 + bx, 146 + by]));
  C.lumiere(640, 240, 60, 'xmas'); C.lumiere(560, 200, 40, 'lamp');
  // jardin secret
  const coeur = Objets.arbreFeuillu(88, { coeur: true, w: 70, h: 80 });
  C.objet(coeur, 1262, 230, { solide: [-5, -4, 10, 5], ombre: [16, 4] });
  C.zone(1250, 212, 24, 20, 'coeur');
  C.objet(Objets.banc(), 1160, 206, { solide: [-13, -6, 26, 6], ombre: [13, 2], texte: 'banc', zw: 26, zh: 14 });
  const gj = Objets.guirlande(220, 14); C.dessusImg(gj.img, 1100, 150); gj.bulbs.forEach(([bx, by]) => C.scintille.push([1100 + bx, 150 + by]));
  C.lumiere(1210, 220, 70, 'xmas'); C.lumiere(1205, 140, 30, 'lamp');
  const l2 = Objets.lanterneMurale(); C.objet(l2, 1218, 130, { dy: 40 });
  // lanternes dans les ruelles
  for (const ax of [600, 1180]) { const l = Objets.lanterneMurale(); C.objet(l, ax + 4, 330, { dy: 140 }); C.lumiere(ax + 6, 330, 40, 'lamp'); C.lumiere(ax + 4, 326, 6, 'halo'); }

  // ---------------------------------------------------------------- CHATS ET PIGEONS
  const top = (k) => bats[k].top;
  C.pnj.push(
    new Entites.ChatPNJ({ nom: 'blanc', x: 1290, y: top('hotel') + 142, mode: 'assis', texte: 'chatBlanc', sortYFixe: BASE + 1, sansOmbre: true, zoneFixe: [1272, BASE - 12, 36, 16] }),
    new Entites.ChatPNJ({ nom: 'roux', x: 486, y: top('cafe') + 182, mode: 'dort', texte: 'chatRoux', sortYFixe: BASE + 1, sansOmbre: true, zoneFixe: [466, BASE - 12, 40, 16] }),
    new Entites.ChatPNJ({ nom: 'siamois', x: 1436, y: 472, mode: 'assis', texte: 'chatSiamois' }),
    new Entites.ChatPNJ({ nom: 'gris', x: 620, y: 230, mode: 'joueur', texte: 'chatGris', rx: 70, ry: 40 }),
    new Entites.ChatPNJ({ nom: 'tigre', x: 1160, y: 203, mode: 'dort', texte: 'chatTigre', sortYFixe: 207, sansOmbre: true }),
    new Entites.ChatPNJ({ nom: 'roux', x: 1086, y: 846, mode: 'cote', texte: 'chatPecheur' }),
    new Entites.ChatPNJ({ nom: 'gris', x: 900, y: top('carrefour') + 26, mode: 'promeneur', x1: 790, x2: 1065, texte: 'chatToits', sortYFixe: BASE + 1, zoneFixe: [0, 0, 0, 0] }),
  );
  // canne à pêche du chat pêcheur
  C.pnj.push({
    sortY: 847,
    draw(g, J) {
      const bob = Math.round(Math.sin(J.t * 2) * 1);
      g.fillStyle = '#7a5434';
      for (let i = 0; i < 16; i++) g.fillRect(1092 + i, 836 - Math.round(i * 0.55), 1, 1);
      g.fillStyle = 'rgba(230,230,240,0.6)';
      for (let y = 828; y < 872 + bob; y += 2) g.fillRect(1108 + Math.round((y - 828) * 0.12), y, 1, 1);
      g.fillStyle = '#e8434b'; g.fillRect(1113, 872 + bob, 2, 2); g.fillStyle = '#ffffff'; g.fillRect(1113, 871 + bob, 2, 1);
    },
  });
  for (let k = 0; k < 6; k++) C.pnj.push(new Entites.Pigeon(500 + Math.random() * 120, 615 + Math.random() * 60, [480, 610, 160, 70]));
  for (let k = 0; k < 4; k++) C.pnj.push(new Entites.Pigeon(60 + Math.random() * 180, 420 + Math.random() * 30, [40, 410, 200, 40]));

  // ---------------------------------------------------------------- ARRIVÉES
  C.arrivees.depart = { x: 200, y: 520, dir: 'right' };
  C.finaliser();
  return C;
});
