// =====================================================================
//  carte-superette.js — ZONE 2 : l'intérieur du Carrefour
//
//  Plan (en pixels, y vers le bas) :
//    y   0- 96  mur du fond : crèmerie (gauche), BOUCHERIE de Tom (centre), surgelés (droite)
//    y  96-368  les rayons : un labyrinthe façon Pac-Man (allées de 2 cases, aucune impasse),
//               avec au milieu un îlot de chocolats de Noël
//    y 368-432  l'avant du magasin : deux caisses, l'étal de fruits, la sortie ; Georges attend là
//
//  Le labyrinthe se règle avec les tableaux H (rayons horizontaux) et V (rayons verticaux) :
//  1 = rayon, 0 = passage. La course-poursuite de l'épreuve 1 s'y déroule (epreuve-bisou.js).
// =====================================================================
'use strict';

Jeu.enregistrerCarte('superette', () => {
  const T = 16, COLS = 28, ROWS = 28, W = COLS * T, H = ROWS * T;
  const C = new Carte('superette', W, H, { ambiance: 'interieur', fond: '#0d0a14' });
  const P = C.P, r = PX.rng(77);
  const BLUE = '#1d4f9c', RED = '#e1251b';
  const HAUT = 6;                 // première rangée de cases du labyrinthe (devant les frigos et la boucherie)
  const BX0 = 144, BX1 = 304;     // la boucherie, au centre du mur du fond
  const FOND = 96;                // devant des frigos et de la vitrine

  // ---------------------------------------------------------------- plan du labyrinthe
  // 9 colonnes d'allées (c = 0..8) et 6 rangées (r = 0..5). Plan vérifié : aucune impasse,
  // toutes les allées communiquent. L'îlot de Noël occupe les cases (4, 2) et (4, 3).
  // H[r][c] : rayon entre l'allée (c, r) et l'allée (c, r+1)
  const Hm = [
    [0, 1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1, 0],
  ];
  // V[r][c] : rayon entre l'allée (c, r) et l'allée (c+1, r)
  const Vm = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const ILOT = [[4, 2], [4, 3]];
  const estIlot = (c, rr) => ILOT.some(([a, b]) => a === c && b === rr);
  // 0 = sol, 1 = rayon, 2 = îlot de Noël (dessiné à part)
  const rayon = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let rr = 0; rr < 5; rr++) for (let c = 0; c < 9; c++) if (Hm[rr][c]) { const ty = HAUT + 2 + rr * 3; rayon[ty][1 + c * 3] = rayon[ty][2 + c * 3] = 1; }
  for (let rr = 0; rr < 6; rr++) for (let c = 0; c < 8; c++) if (Vm[rr][c]) { const tx = 3 + c * 3, ty = HAUT + rr * 3; rayon[ty][tx] = rayon[ty + 1][tx] = 1; }
  // jonctions : remplies quand deux rayons s'y rejoignent
  for (let rr = 0; rr < 5; rr++) for (let c = 0; c < 8; c++) {
    const n = Hm[rr][c] + Hm[rr][c + 1] + Vm[rr][c] + Vm[rr + 1][c];
    if (n >= 2) rayon[HAUT + 2 + rr * 3][3 + c * 3] = 1;
  }
  const IX = 12, IY = HAUT + 5, IW = 4, IH = 7; // l'îlot, en cases : x 12-15, y 11-17
  for (let ty = IY; ty < IY + IH; ty++) for (let tx = IX; tx < IX + IW; tx++) rayon[ty][tx] = 2;

  // graphe des allées (sert à Loane pendant la poursuite)
  const ouvert = (c, rr, dc, dr) => {
    const nc = c + dc, nr = rr + dr;
    if (nc < 0 || nc > 8 || nr < 0 || nr > 5 || estIlot(nc, nr)) return false;
    if (dr) return Hm[Math.min(rr, nr)][c] === 0;
    return Vm[rr][Math.min(c, nc)] === 0;
  };
  C.labyrinthe = {
    C: 9, R: 6, rayon, T, HAUT,
    noeud: (c, rr) => ({ x: 32 + 48 * c, y: 112 + 48 * rr }),
    voisins: (c, rr) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dc, dr]) => ouvert(c, rr, dc, dr)).map(([dc, dr]) => [c + dc, rr + dr]),
    estIlot,
  };

  // ---------------------------------------------------------------- sol
  for (let y = FOND - 16; y < H; y += 16) for (let x = 0; x < W; x += 16) {
    const c = ((x + y) / 16) % 2 ? '#dde1e7' : '#cdd3db';
    P.rect(x, y, 16, 16, c); P.hline(x, y, 16, '#eef1f5'); P.vline(x, y, 16, '#e6e9ee');
  }
  for (let k = 0; k < 10; k++) { const x0 = 10 + k * 46; for (let j = 0; j < 40; j++) P.rect(x0 + j, 330 + j * 0.6, 7, 1, 'rgba(255,255,255,0.2)'); }
  // carrelage rouge de la boucherie (derrière la vitrine)
  for (let y = 56; y < FOND; y += 8) for (let x = BX0; x < BX1; x += 8) {
    P.rect(x, y, 8, 8, ((x + y) / 8) % 2 ? '#b8543a' : '#a84a32'); P.hline(x, y, 8, '#c8705a'); P.vline(x, y, 8, '#943f2a');
  }

  // ---------------------------------------------------------------- mur du fond
  P.rect(0, 0, W, 48, '#eef0f3');
  for (let y = 4; y < 48; y += 6) P.hline(0, y, W, '#dfe3e8');
  for (let x = 0; x < W; x += 6) P.vline(x, 0, 48, '#e4e7ec');
  P.rect(0, 0, W, 3, BLUE); P.hline(0, 3, W, RED);
  // panneaux au logo au-dessus des frigos
  for (const cx of [80, 368]) {
    P.rect(cx - 22, 6, 44, 28, '#f7f8fa'); P.hline(cx - 22, 6, 44, '#ffffff'); P.hline(cx - 22, 33, 44, '#c8d0da');
    P.draw(Batiments.carrefourLogo('grand'), cx - 17, 9);
  }
  // boucherie : faïence blanche, enseigne, store rayé, crochets, aimant à couteaux, chambre froide
  P.rect(BX0, 0, BX1 - BX0, 56, '#f3f1ea');
  for (let y = 22; y < 56; y += 4) { P.hline(BX0, y, BX1 - BX0, '#d9d4c8'); for (let x = BX0 + ((y / 4) % 2) * 4; x < BX1; x += 8) P.vline(x, y, 4, '#e2ddd2'); }
  P.vline(BX0, 0, 56, '#b8b2a6'); P.vline(BX1 - 1, 0, 56, '#b8b2a6');
  P.rect(BX0, 0, BX1 - BX0, 14, '#8a1e24'); P.hline(BX0, 0, BX1 - BX0, '#b8343a'); P.hline(BX0, 13, BX1 - BX0, '#5a1218');
  Batiments.texte(P, 'BOUCHERIE', 207, 4, '#fff4e0');
  const cochon = (x, y) => {
    P.ellipse(x, y, 3, 3, '#f4a6b8'); P.px(x - 3, y - 3, '#f4a6b8'); P.px(x + 3, y - 3, '#f4a6b8');
    P.ellipse(x, y + 1, 1, 1, '#e07a92'); P.px(x - 1, y + 1, '#8a3a4a'); P.px(x + 1, y + 1, '#8a3a4a'); P.px(x - 2, y - 1, '#2a1a2e'); P.px(x + 2, y - 1, '#2a1a2e');
  };
  cochon(196, 7); cochon(252, 7);
  for (let x = BX0; x < BX1; x++) {
    const stripe = Math.floor((x - BX0) / 6) % 2 === 0;
    for (let j = 0; j < 6; j++) P.px(x, 14 + j, j === 0 ? '#5a1218' : stripe ? '#d8323a' : '#f6f0e4');
    if ((x - BX0) % 6 < 4) P.px(x, 20, stripe ? '#b8262e' : '#e0d8cc');
  }
  P.dither(BX0, 21, BX1 - BX0, 2, '#2a1e3a', 6);
  // tringle et charcuterie suspendue
  P.rect(150, 24, 96, 2, '#8a92a2'); P.hline(150, 24, 96, '#c9ced8');
  for (let k = 0; k < 9; k++) {
    const x = 156 + k * 10;
    P.vline(x, 26, 2, '#5a6070');
    if (k % 3 === 0) { P.ellipse(x, 32, 2, 4, '#c8604e'); P.ellipse(x, 34, 2, 3, '#a84a3a'); P.px(x - 1, 30, '#e88a7a'); P.px(x, 37, '#f4efe6'); }
    else if (k % 3 === 1) { P.rect(x - 1, 28, 2, 9, '#7a2a2a'); P.vline(x - 1, 29, 7, '#9a3a3a'); for (let j = 29; j < 37; j += 2) P.px(x, j, '#f2e6dc'); }
    else for (let j = 0; j < 4; j++) P.ellipse(x, 29 + j * 3, 1, 1, '#d08a72');
  }
  // aimant à couteaux
  P.rect(150, 31, 26, 2, '#3a3a44');
  for (let k = 0; k < 5; k++) { const x = 153 + k * 5; P.rect(x, 33, 1, 3, '#2a1e1a'); P.rect(x, 36, 1, 4, '#d8dde6'); P.px(x, 39, '#ffffff'); }
  // porte de la chambre froide
  P.rect(256, 22, 36, 40, '#aab0bc'); P.rect(258, 24, 32, 38, '#c9ced8'); P.hline(258, 24, 32, '#eef1f6');
  for (let y = 28; y < 60; y += 8) P.hline(260, y, 28, '#b8bec8');
  P.rect(284, 36, 3, 10, '#5a6070'); P.rect(283, 38, 5, 2, '#8a92a2');
  P.rect(262, 28, 6, 8, '#f4f6f8'); P.vline(265, 29, 6, '#e1251b'); P.px(265, 34, '#e1251b');
  P.dither(258, 50, 32, 12, '#ffffff', 3);

  C.solide(0, 0, W, FOND);         // tout le fond (on ne passe derrière le comptoir que dans les scènes)
  C.solide(0, 0, 16, H); C.solide(W - 16, 0, 16, H);
  P.rect(0, 48, 16, H - 48, '#5a6070'); P.vline(15, 48, H - 48, '#8a92a2');
  P.rect(W - 16, 48, 16, H - 48, '#5a6070'); P.vline(W - 16, 48, H - 48, '#8a92a2');

  // ---------------------------------------------------------------- frigos du fond
  const caisson = (Q, w, h) => {
    Q.rect(0, 0, w, h, '#e9edf2');
    Q.rect(0, 0, w, 6, '#4a5266'); Q.hline(0, 0, w, '#6a7488'); Q.rect(2, 3, w - 4, 2, '#cfeaf8');
    Q.rect(0, h - 6, w, 6, '#8a92a2'); Q.hline(0, h - 6, w, '#aab2c0');
    Q.vline(0, 0, h, '#9aa4b0'); Q.vline(w - 1, 0, h, '#7a8292');
  };
  // crèmerie : yaourts, lait, fromages, beurre sur trois étagères ouvertes
  const cremerie = (w) => {
    const h = 58, c = PX.canvas(w, h), Q = PX.painter(c);
    caisson(Q, w, h);
    Q.rect(2, 6, w - 4, 38, '#cfeaf6');
    for (let s = 0; s < 3; s++) {
      const sy = 7 + s * 12;
      for (let x = 3; x < w - 8;) {
        const type = r.pick(['yaourt', 'yaourt', 'lait', 'fromage', 'beurre']);
        if (type === 'yaourt') { for (let k = 0; k < 3; k++, x += 3) { const col = r.pick(['#ffffff', '#f6c8d8', '#cfe0ff', '#fff2b0']); Q.rect(x, sy + 6, 2, 3, col); Q.hline(x, sy + 6, 2, PX.shade(col, -0.25)); } x += 1; }
        else if (type === 'lait') { for (let k = 0; k < 2; k++, x += 3) { Q.rect(x, sy + 2, 2, 7, '#fbfbf6'); Q.px(x, sy + 1, '#3a7ad0'); Q.hline(x, sy + 5, 2, '#3a7ad0'); } x += 1; }
        else if (type === 'fromage') { Q.ellipse(x + 3, sy + 7, 3, 2, '#f2c84a'); Q.hline(x + 1, sy + 5, 5, '#ffe08a'); Q.px(x + 4, sy + 7, '#d8a830'); x += 8; }
        else { Q.rect(x, sy + 6, 4, 3, '#f2d860'); Q.hline(x, sy + 6, 4, '#fff0a0'); Q.px(x + 1, sy + 7, '#1d4f9c'); x += 6; }
      }
      Q.rect(2, sy + 9, w - 4, 2, '#ffffff'); Q.hline(2, sy + 11, w - 4, '#9aa4b0');
      for (let x = 6; x < w - 6; x += 14) Q.rect(x, sy + 9, 3, 1, '#f2c230');
    }
    Q.rect(0, 44, w, 8, '#f4f6f8'); Q.rect(0, 46, w, 2, BLUE); Q.hline(0, 48, w, RED);
    return { img: c, ax: 0, ay: h - 1 };
  };
  // surgelés : portes vitrées givrées
  const surgeles = (w) => {
    const h = 58, c = PX.canvas(w, h), Q = PX.painter(c);
    caisson(Q, w, h);
    for (let x = 2; x + 30 <= w - 2; x += 31) {
      Q.rect(x, 6, 30, 40, '#8a92a2');
      Q.rect(x + 2, 8, 26, 36, '#b8dcf0');
      for (let s = 0; s < 3; s++) for (let k = 0; k < 6; k++) Q.rect(x + 3 + k * 4, 10 + s * 12, 3, 8, PX.mix(r.pick(['#f2f2f8', RED, BLUE, '#f2c230', '#c04a8a', '#3fa055']), '#d8eef8', 0.45));
      for (let s = 0; s < 3; s++) Q.hline(x + 2, 19 + s * 12, 26, '#e8f6ff');
      Q.dither(x + 2, 8, 26, 36, '#ffffff', 3);
      for (let k = 0; k < 6; k++) Q.px(x + 4 + k * 4, 9 + k * 5, '#ffffff');
      Q.rect(x + 25, 20, 1, 12, '#e6e9ee');
    }
    Q.rect(0, 46, w, 6, '#f4f6f8'); Q.rect(0, 47, w, 2, BLUE); Q.hline(0, 49, w, RED);
    return { img: c, ax: 0, ay: h - 1 };
  };
  C.objet(cremerie(128), 16, FOND - 1); C.objet(surgeles(128), BX1, FOND - 1);
  C.zone(16, FOND - 6, 128, 12, 'frigos'); C.zone(BX1, FOND - 6, 128, 12, 'surgeles');

  // ---------------------------------------------------------------- la boucherie de Tom
  const planTravail = () => {
    const w = 106, h = 24, c = PX.canvas(w, h), Q = PX.painter(c);
    Q.rect(0, 0, w, 10, '#c9ced8'); Q.hline(0, 0, w, '#eef1f6'); Q.hline(0, 9, w, '#9aa0ae');
    for (let x = 4; x < w; x += 9) Q.px(x, 3, '#ffffff');
    Q.rect(6, 2, 18, 6, '#d8a868'); Q.hline(6, 2, 18, '#ecc890'); Q.ellipse(15, 5, 5, 2, '#b8584a'); for (let k = 11; k < 20; k += 3) Q.vline(k, 3, 4, '#f4efe6');
    Q.rect(32, 0, 8, 7, '#8a92a2'); Q.rect(40, 2, 5, 3, '#aab2c0'); Q.ellipse(36, 1, 3, 1, '#c9ced8'); Q.px(46, 3, '#c83a3a'); Q.px(46, 4, '#a82a30');
    Q.rect(54, 2, 14, 6, '#e8e6e0'); Q.rect(55, 3, 7, 3, '#2a2a33'); Q.rect(56, 4, 5, 1, '#ff5a4a'); Q.rect(63, 2, 5, 2, '#aab0bc');
    Q.rect(74, 2, 12, 6, '#f4f2ec'); for (let k = 0; k < 12; k++) Q.px(75 + r.int(10), 3 + r.int(4), r.pick(['#c8343a', '#e06a6a', '#a82a30']));
    Q.rect(89, 2, 13, 6, '#f4f2ec'); for (let k = 0; k < 3; k++) { Q.rect(90, 3 + k * 2, 11, 1, '#c87a62'); Q.px(90 + k * 3, 3 + k * 2, '#e8a08a'); }
    Q.rect(0, 10, w, 12, '#aab0bc'); for (let x = 0; x < w; x += 21) { Q.vline(x, 10, 12, '#8a909c'); Q.rect(x + 16, 14, 2, 4, '#e6e9ee'); }
    Q.rect(0, 22, w, 2, '#6a7282');
    return { img: c, ax: 0, ay: h - 1 };
  };
  C.objet(planTravail(), BX0 + 2, 62);
  const billot = () => {
    const c = PX.canvas(22, 20), Q = PX.painter(c);
    Q.rect(1, 0, 20, 8, '#c89a64'); Q.hline(1, 0, 20, '#e0b880');
    for (let k = 0; k < 5; k++) Q.hline(3 + r.int(14), 1 + r.int(6), 3, '#b08050');
    Q.ellipse(10, 4, 6, 2, '#b8584a'); Q.ellipse(10, 3, 4, 1, '#d87a6a'); for (let x = 6; x < 15; x += 3) Q.vline(x, 2, 4, '#f4efe6');
    Q.rect(1, 8, 20, 7, '#9a6a3e'); for (let x = 3; x < 20; x += 4) Q.vline(x, 8, 7, '#86582f'); Q.hline(1, 8, 20, '#b8844e');
    Q.rect(2, 15, 3, 5, '#6a4628'); Q.rect(17, 15, 3, 5, '#6a4628'); Q.rect(2, 17, 18, 1, '#5a3a20');
    return { img: c, ax: 11, ay: 19 };
  };
  C.objet(billot(), 176, 81);
  // vitrine réfrigérée : plateaux de viande sous une vitre bombée, façade émaillée
  const vitrine = () => {
    const w = 128, h = 26, c = PX.canvas(w, h), Q = PX.painter(c);
    Q.rect(0, 0, w, 3, '#9fd2e8'); Q.hline(0, 0, w, '#e8f8ff');
    Q.rect(0, 3, w, 11, '#e6e2d8');
    let x = 2;
    for (const [type, pw] of [['steak', 18], ['saucisses', 16], ['roti', 18], ['poulet', 18], ['pate', 14], ['jambon', 16], ['cotes', 18]]) {
      Q.rect(x, 4, pw, 9, '#fbfaf6'); Q.hline(x, 12, pw, '#d8d4cc');
      if (type === 'steak') for (let k = 0; k < 3; k++) { Q.ellipse(x + 3 + k * 5, 8, 2, 2, '#c8343a'); Q.px(x + 2 + k * 5, 7, '#f2d0c0'); Q.px(x + 4 + k * 5, 9, '#8a1e24'); }
      else if (type === 'saucisses') for (let k = 0; k < 3; k++) { Q.rect(x + 2, 6 + k * 2, 12, 1, '#c87a62'); Q.rect(x + 3, 6 + k * 2, 3, 1, '#e8a08a'); }
      else if (type === 'roti') for (let k = 0; k < 2; k++) { Q.ellipse(x + 5 + k * 8, 8, 3, 2, '#b8584a'); Q.vline(x + 4 + k * 8, 6, 4, '#f4efe6'); Q.vline(x + 6 + k * 8, 6, 4, '#f4efe6'); }
      else if (type === 'poulet') for (let k = 0; k < 2; k++) { Q.ellipse(x + 5 + k * 8, 8, 3, 2, '#e8b878'); Q.px(x + 2 + k * 8, 10, '#d89a58'); Q.px(x + 8 + k * 8, 10, '#d89a58'); Q.px(x + 5 + k * 8, 7, '#f6d8a8'); }
      else if (type === 'pate') { Q.rect(x + 2, 6, 10, 5, '#8a5a3a'); Q.hline(x + 2, 6, 10, '#d89a4a'); Q.rect(x + 9, 6, 3, 5, '#c89a7a'); }
      else if (type === 'jambon') for (let k = 0; k < 4; k++) { Q.ellipse(x + 3 + k * 3, 8, 2, 2, '#f09aa2'); Q.px(x + 2 + k * 3, 6, '#ffffff'); }
      else for (let k = 0; k < 2; k++) { Q.ellipse(x + 5 + k * 8, 8, 3, 2, '#b82e34'); Q.rect(x + 2 + k * 8, 7, 3, 1, '#f4efe6'); Q.px(x + 6 + k * 8, 8, '#f2d0c0'); }
      Q.px(x + pw - 2, 5, '#3f8a3a'); Q.px(x + pw - 3, 6, '#5aaa48');
      Q.rect(x + 1, 11, 4, 2, '#ffffff'); Q.px(x + 2, 11, '#2a2233'); Q.px(x + 3, 12, RED);
      x += pw + 1;
    }
    for (let k = 0; k < w; k += 23) { Q.vline(k + 6, 3, 9, 'rgba(255,255,255,0.4)'); Q.vline(k + 7, 4, 6, 'rgba(255,255,255,0.3)'); }
    Q.hline(0, 13, w, '#e8f6ff');
    Q.rect(0, 14, w, 9, '#f6f4ee'); Q.hline(0, 14, w, '#ffffff');
    Q.rect(0, 17, w, 2, '#c8343a'); Q.hline(0, 19, w, '#8a1e24');
    Q.rect(0, 23, w, 3, '#8a92a2'); Q.hline(0, 23, w, '#aab2c0');
    Q.vline(0, 0, h, '#9aa4b0'); Q.vline(w - 1, 0, h, '#7a8292');
    return { img: c, ax: 0, ay: h - 1 };
  };
  C.objet(vitrine(), 152, FOND - 1);
  C.objet({ img: (() => { const c = PX.canvas(8, 26), Q = PX.painter(c); Q.rect(0, 0, 8, 26, '#f6f4ee'); Q.rect(0, 17, 8, 2, '#c8343a'); Q.rect(0, 23, 8, 3, '#8a92a2'); Q.vline(7, 0, 26, '#7a8292'); return c; })(), ax: 0, ay: 25 }, 296, FOND - 1);
  // portillon (s'ouvre quand Ismae passe derrière le comptoir)
  const portillon = { ouvert: 0, voulu: 0, sortY: FOND - 0.5,
    update(dt) { this.ouvert = Math.max(0, Math.min(1, this.ouvert + (this.voulu ? dt * 5 : -dt * 3))); },
    draw(g) {
      const w = Math.round(16 * (1 - this.ouvert * 0.8));
      g.fillStyle = '#7a4a2e'; g.fillRect(280, 80, w, 15);
      g.fillStyle = '#9a6a3e'; g.fillRect(280, 80, w, 2); g.fillRect(280, 87, w, 1);
      g.fillStyle = '#5a3420'; g.fillRect(280 + w - 1, 80, 1, 15);
    } };
  C.dynamiques.push(portillon);
  C.zone(152, FOND - 6, 52, 12, 'boucherie');

  // ---------------------------------------------------------------- rayons (assemblés par tronçons horizontaux)
  const FACE = 12;
  // chaque rayon a son thème : couleurs et forme des produits sur la façade
  const SECTIONS = [
    { cols: ['#f2c230', '#e8a020', '#fff0a0', '#3a6aa8'], forme: 'boite' },        // pâtes et riz
    { cols: ['#c9483b', '#e8e0d0', '#3f8a55', '#f08a2a'], forme: 'boite' },        // conserves
    { cols: ['#3fa055', '#8fd0e8', '#e1251b', '#ffffff'], forme: 'bouteille' },    // boissons
    { cols: ['#6a3e2e', '#f2c230', '#c04a8a', '#1d4f9c'], forme: 'paquet' },       // café et chocolat
    { cols: ['#e1251b', '#f08a2a', '#ffffff', '#f2d040'], forme: 'paquet' },       // biscuits
    { cols: ['#7a4aa8', '#f2c230', '#e86a9a', '#3a6aa8'], forme: 'sac' },          // croquettes
  ];
  const estRayon = (tx, ty) => ty >= 0 && ty < ROWS && tx >= 0 && tx < COLS && rayon[ty][tx] === 1;
  const produits = (Q, x0, sy, sect) => {
    for (let x = 1; x < T - 1;) {
      const col = r.pick(sect.cols), hi = PX.shade(col, 0.35), lo = PX.shade(col, -0.3);
      if (r.chance(0.08)) { x += 1; continue; } // un trou dans le rayon
      if (sect.forme === 'bouteille') { const h = 3 + r.int(2); Q.rect(x0 + x, sy + 4 - h, 1, h, col); Q.px(x0 + x, sy + 4 - h, lo); x += 1 + r.int(2); }
      else if (sect.forme === 'sac') { Q.rect(x0 + x, sy + 1, 3, 3, col); Q.hline(x0 + x, sy, 3, hi); Q.px(x0 + x + 1, sy + 2, '#ffffff'); x += 4; }
      else if (sect.forme === 'paquet') { const w = 2 + r.int(2); Q.rect(x0 + x, sy + 2, w, 2, col); Q.hline(x0 + x, sy + 1, w, hi); x += w; }
      else { const w = 2 + r.int(2), h = 3 + r.int(2); Q.rect(x0 + x, sy + 4 - h, w, h, col); Q.hline(x0 + x, sy + 4 - h, w, hi); Q.vline(x0 + x + w - 1, sy + 5 - h, h - 1, lo); x += w; }
    }
  };
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS;) {
      if (rayon[ty][tx] !== 1) { tx++; continue; }
      let fin = tx; while (fin + 1 < COLS && rayon[ty][fin + 1] === 1) fin++;
      const n = fin - tx + 1, w = n * T;
      const c = PX.canvas(w, T + FACE), Q = PX.painter(c);
      const sect = SECTIONS[(tx + ty * 3) % SECTIONS.length];
      // dessus du rayon (vu d'en haut) : produits rangés en lignes
      Q.rect(0, 0, w, T, '#c9d0d8'); Q.rect(1, 1, w - 2, T - 2, '#e6eaef');
      for (let i = 0; i < n; i++) {
        const x0 = i * T;
        for (let yy = 3; yy < T - 2; yy += 4) for (let xx = 2; xx < T - 2; xx += 3) Q.rect(x0 + xx, yy, 2, 2, r.chance(0.85) ? r.pick(sect.cols) : '#f4f6f8');
        Q.hline(x0 + 1, 8, T - 2, '#b8c0ca');
      }
      Q.hline(0, 0, w, '#f6f8fa');
      // façade avant (seulement là où le rayon ne continue pas vers le bas) : deux étagères garnies
      for (let i = 0; i < n; i++) {
        if (estRayon(tx + i, ty + 1) || (ty + 1 < ROWS && rayon[ty + 1][tx + i] === 2)) continue;
        const x0 = i * T, y0 = T;
        Q.rect(x0, y0, T, FACE, '#eceff3');
        for (let s = 0; s < 2; s++) {
          const sy = y0 + s * 5;
          produits(Q, x0, sy, sect);
          Q.hline(x0, sy + 4, T, '#9aa4b0');
          if (i % 2 === 0) Q.px(x0 + 4, sy + 4, r.chance(0.5) ? '#f2c230' : RED);
        }
        Q.rect(x0, y0 + FACE - 2, T, 2, '#6a7282');
      }
      Q.vline(0, 0, T + FACE, '#9aa4b0'); Q.vline(w - 1, 0, T + FACE, '#7a8292');
      C.objet({ img: c, ax: 0, ay: T + FACE - 1 }, tx * T, (ty + 1) * T - 1, {});
      C.solide(tx * T, ty * T, w, T);
      for (let i = 0; i < n; i++) if (!estRayon(tx + i, ty + 1)) {
        C.O.rect(tx * T + i * T, (ty + 1) * T, T, 2, '#000');
        if (r.chance(0.3)) C.zone(tx * T + i * T, (ty + 1) * T - 4, T, 10, 'rayons');
      }
      tx = fin + 1;
    }
  }

  // ---------------------------------------------------------------- îlot de Noël (au centre du labyrinthe)
  const ilot = () => {
    const w = IW * T, h = IH * T + FACE, c = PX.canvas(w, h), Q = PX.painter(c);
    // estrade rouge vue de dessus, bordée d'or
    Q.rect(0, 0, w, h - FACE, '#a8262e'); Q.rect(2, 2, w - 4, h - FACE - 4, '#c8343a');
    Q.dither(2, 2, w - 4, h - FACE - 4, '#b82c34', 5);
    Q.rect(0, 0, w, 1, '#e8b54a'); Q.rect(0, h - FACE - 1, w, 1, '#e8b54a'); Q.vline(0, 0, h - FACE, '#e8b54a'); Q.vline(w - 1, 0, h - FACE, '#e8b54a');
    // piles de boîtes de chocolats et paquets cadeaux
    const boite = (x, y, bw, bh, col, ruban) => {
      Q.rect(x, y, bw, bh, col); Q.hline(x, y, bw, PX.shade(col, 0.35)); Q.hline(x, y + bh - 1, bw, PX.shade(col, -0.35));
      Q.vline(x + Math.floor(bw / 2), y, bh, ruban); Q.hline(x, y + Math.floor(bh / 2), bw, ruban);
    };
    const couleurs = [['#6a3e2e', '#e8b54a'], ['#1d4f9c', '#f6ead2'], ['#3f8a55', '#e1251b'], ['#f2c230', '#c04a8a'], ['#f6f0e4', '#e1251b'], ['#c04a8a', '#f2c230']];
    for (let y = 6; y < h - FACE - 10; y += 11) for (let x = 4; x < w - 10; x += 12) {
      if (y > 26 && y < 82 && x > 6 && x < 52) continue; // place du sapin
      const [col, rub] = r.pick(couleurs); boite(x + r.int(2), y + r.int(2), 9, 8, col, rub);
    }
    // grosse boîte en forme de cœur tout en haut
    Q.ellipse(28, 8, 3, 3, '#e8435a'); Q.ellipse(35, 8, 3, 3, '#e8435a'); for (let j = 0; j < 6; j++) Q.hline(25 + j, 10 + j, 14 - j * 2, '#e8435a'); Q.px(27, 7, '#ff9aa8');
    // façade de l'estrade
    Q.rect(0, h - FACE, w, FACE - 2, '#7a1a22'); Q.hline(0, h - FACE, w, '#e8b54a');
    for (let x = 3; x < w; x += 8) Q.px(x, h - FACE + 4, '#e8b54a');
    Q.rect(0, h - 2, w, 2, '#4a1016');
    return { img: c, ax: 0, ay: h - 1 };
  };
  C.objet(ilot(), IX * T, (IY + IH) * T - 1);
  C.solide(IX * T, IY * T, IW * T, IH * T);
  C.O.rect(IX * T, (IY + IH) * T, IW * T, 2, '#000');
  // le sapin, posé sur l'estrade (dessiné juste après elle)
  C.objet(Objets.grandSapin(5), IX * T + 32, IY * T + 66, { dy: (IY + IH) * T - (IY * T + 66) + 0.5 });
  C.zone(IX * T + 4, (IY + IH) * T - 4, IW * T - 8, 10, 'promo');

  // ---------------------------------------------------------------- l'avant du magasin : caisses, fruits, sortie
  const comptoir = () => {
    const c = PX.canvas(74, 22), Q = PX.painter(c);
    Q.rect(0, 0, 74, 7, '#3a3f4e'); Q.hline(0, 0, 74, '#5a6070'); Q.rect(4, 2, 44, 3, '#1c1e26');
    for (let x = 6; x < 46; x += 5) Q.vline(x, 2, 3, '#2c2f3a');
    Q.rect(54, 1, 12, 5, '#22262e'); Q.rect(56, 2, 8, 2, '#7fe0a0');
    Q.rect(0, 7, 74, 13, '#f4f6f8'); Q.rect(0, 12, 74, 3, BLUE); Q.hline(0, 15, 74, RED);
    Q.draw(Batiments.carrefourLogo('petit'), 28, 7);
    Q.rect(0, 20, 74, 2, '#8a92a2');
    return { img: c, ax: 0, ay: 21 };
  };
  const etalFruits = () => {
    const c = PX.canvas(78, 22), Q = PX.painter(c);
    const caisse = (x, fruit, f2) => {
      Q.rect(x, 8, 24, 13, '#b8875a'); Q.hline(x, 8, 24, '#d8a876'); Q.hline(x, 14, 24, '#8a5e3a'); Q.rect(x, 20, 24, 1, '#6a4a2e');
      for (let k = 0; k < 22; k++) Q.ellipse(x + 2 + r.int(20), 3 + r.int(6), 1, 1, r.chance(0.8) ? fruit : f2);
    };
    caisse(1, '#f08a24', '#ffb04a'); caisse(27, '#d8303a', '#7cc04a'); caisse(53, '#f2d040', '#c8a020');
    return { img: c, ax: 0, ay: 21 };
  };
  const paniers = () => {
    const c = PX.canvas(16, 14), Q = PX.painter(c);
    for (let k = 0; k < 4; k++) { Q.rect(1, 9 - k * 3, 14, 4, '#d8303a'); Q.hline(1, 9 - k * 3, 14, '#f0606a'); for (let x = 2; x < 14; x += 3) Q.px(x, 11 - k * 3, '#8a1a22'); }
    return { img: c, ax: 8, ay: 13 };
  };
  const CAISSE_Y = 410;
  C.objet(comptoir(), 30, CAISSE_Y, { solide: [0, -10, 74, 10] });
  C.objet(comptoir(), 116, CAISSE_Y, { solide: [0, -10, 74, 10] });
  C.objet(etalFruits(), 330, CAISSE_Y, { solide: [0, -10, 78, 10] });
  C.zone(330, CAISSE_Y - 6, 78, 12, 'fruits');
  C.objet(paniers(), 196, 426, { solide: [-7, -3, 14, 4], ombre: [7, 2], texte: 'paniers', zw: 18 });
  C.objet(Objets.pot(5, 'sapin'), 420, 426, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  // mur de devant et portes vitrées
  P.rect(0, 432, 208, 16, '#5a6070'); P.rect(240, 432, W - 240, 16, '#5a6070');
  P.hline(0, 432, 208, '#8a92a2'); P.hline(240, 432, W - 240, '#8a92a2');
  P.rect(208, 432, 32, 16, '#3d4458'); for (let y = 434; y < 448; y += 2) P.hline(210, y, 28, '#4a5268');
  P.rect(208, 424, 32, 8, '#7a2a2e'); P.hline(208, 424, 32, '#a8484a'); for (let x = 210; x < 238; x += 3) P.px(x, 428, '#c9a040');
  C.solide(0, 434, 208, 14); C.solide(240, 434, W - 240, 14);

  const gl = Objets.guirlande(W - 32, 5); C.dessusImg(gl.img, 16, 40); gl.bulbs.forEach(([bx, by]) => C.scintille.push([16 + bx, 40 + by]));

  // ---------------------------------------------------------------- personnages
  // répliques du magasin : avant l'épreuve, puis une fois Loane attrapée
  const repliques = (id) => { const rp = CONFIG.repliques[id]; return Scenes.quete.bisou === 'gagne' && rp.apres ? rp.apres : rp.avant || rp.apres; };
  const client = (o) => { const h = new Entites.Passant(Object.assign({ bloquant: false, dialogue: () => repliques(o.id) }, o)); C.pnj.push(h); return h; };
  client({ id: 'caissier', x: 67, y: CAISSE_Y - 10, regardeDefaut: 'down',
    cfg: { peau: '#c48d6c', cheveux: '#2a1e1a', coiffure: 'boucles', barbe: 'courte', lunettes: true, couleurLunettes: '#2a2233', yeux: '#2a1d2e', veste: BLUE, pantalon: '#2a2a3a', chaussures: '#24222a' } });
  client({ id: 'caissiere', x: 153, y: CAISSE_Y - 10, regardeDefaut: 'down',
    cfg: { peau: '#e8b896', cheveux: '#c8823a', coiffure: 'chignon', barbe: 'aucune', yeux: '#2a1d2e', veste: BLUE, echarpe: RED, coupe: 'robe', pantalon: '#2a2a3a', chaussures: '#24222a' } });
  client({ id: 'cliente', x: 64, y: 108, regardeDefaut: 'up',
    cfg: { peau: '#f0c8a8', cheveux: '#dcd8e2', coiffure: 'chignon', barbe: 'aucune', lunettes: true, couleurLunettes: '#6a4a3a', yeux: '#2a1d2e', veste: '#a83a4a', echarpe: '#e8d8a0', coupe: 'robe', pantalon: '#5a2a3a', chaussures: '#2a2026' } });
  client({ id: 'client', x: 372, y: 424, regardeDefaut: 'up',
    cfg: { peau: '#d8a07a', cheveux: '#6a6a74', coiffure: 'court', barbe: 'pleine', couleurBarbe: '#8a8a94', yeux: '#2a1d2e', chapeau: 'beret', couleurChapeau: '#3a3a5a', veste: '#5a6a4a', echarpe: '#c9483b', pantalon: '#3a3440', chaussures: '#2a2026' } });
  for (const z of [[30, CAISSE_Y - 4, 74, 10, 'caissier'], [116, CAISSE_Y - 4, 74, 10, 'caissiere']]) {
    const p = C.pnj.find((e) => e.id === z[4]);
    C.zone(z[0], z[1], z[2], z[3], null, { dialogue: (J) => { p.regarder(J.joueur.x, J.joueur.y); return repliques(z[4]); } });
  }
  // Tom derrière sa vitrine, et Loane (cachée jusqu'à la scène)
  const tom = new Entites.Perso({ id: 'tom', cfg: CONFIG.tom, x: 236, y: 82, dir: 'down', dialogue: () => repliques('tom') });
  tom.zone = () => ({ x: tom.x - 14, y: tom.y - 8, w: 28, h: 24, dialogue: tom.dialogue });
  const loane = new Entites.Perso({ id: 'loane', cfg: CONFIG.loane, x: -40, y: -40, visible: false, dialogue: () => repliques('loane') });
  C.pnj.push(tom, loane);
  C.epreuve = {
    tom, loane, portillon,
    billot: { x: 198, y: 80 },            // Ismae découpe ici, tourné vers la gauche
    passage: { x: 288, y: 82 },           // derrière le portillon
    devantPassage: { x: 288, y: 110 },    // dans l'allée, devant le portillon
    georges: { x: 258, y: 424 },          // Georges attend près de la sortie
    entreeLoane: [{ x: 32, y: 160 }, { x: 32, y: 112 }, { x: 120, y: 112 }],
    zoneBoucherie: { x: 140, y: FOND, w: 168, h: 30 },
  };

  // ---------------------------------------------------------------- sortie
  C.zone(210, 418, 28, 10, null, { dialogue: () => (Scenes.quete.bisou === 'poursuite' ? 'sortieBloquee' : 'sortie') });
  C.porte(206, 432, 36, 16, 'rue', 'devantSuperette', 'down');
  C.portes[C.portes.length - 1].condition = () => Bisou.peutSortir();
  C.arrivees.entree = { x: 224, y: 426, dir: 'up' };
  C.onEntree = (J) => Bisou.entree(J);
  C.finaliser(0.22);
  return C;
});
