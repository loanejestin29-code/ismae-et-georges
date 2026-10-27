// =====================================================================
//  carte-superette.js — ZONE 2 : l'intérieur de la petite supérette
//
//  Les rayons forment un labyrinthe façon Pac-Man (allées de 2 cases,
//  rayons d'1 case, aucune impasse, symétrique) : il servira plus tard à
//  la course-poursuite. Frigos au fond, caisse et sortie en bas.
//
//  Le labyrinthe se règle avec les tableaux H (rayons horizontaux) et
//  V (rayons verticaux) ci-dessous : 1 = rayon, 0 = passage.
// =====================================================================
'use strict';

Jeu.enregistrerCarte('superette', () => {
  const T = 16, COLS = 28, ROWS = 23, W = COLS * T, H = ROWS * T;
  const C = new Carte('superette', W, H, { ambiance: 'interieur', fond: '#0d0a14' });
  const P = C.P, r = PX.rng(77);
  const BLUE = '#1d4f9c', RED = '#e1251b';
  const HAUT = 3; // première rangée de cases du labyrinthe (sous les frigos)

  // ---------------------------------------------------------------- plan du labyrinthe
  // 9 colonnes d'allées (c = 0..8) et 6 rangées (r = 0..5)
  // H[r][c] : rayon entre l'allée (c, r) et l'allée (c, r+1)
  // (plan vérifié : aucune impasse, toutes les allées communiquent)
  const Hm = [
    [0, 1, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
  ];
  // V[r][c] : rayon entre l'allée (c, r) et l'allée (c+1, r)
  const Vm = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const rayon = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (let rr = 0; rr < 5; rr++) for (let c = 0; c < 9; c++) if (Hm[rr][c]) { const ty = HAUT + 2 + rr * 3; rayon[ty][1 + c * 3] = rayon[ty][2 + c * 3] = true; }
  for (let rr = 0; rr < 6; rr++) for (let c = 0; c < 8; c++) if (Vm[rr][c]) { const tx = 3 + c * 3, ty = HAUT + rr * 3; rayon[ty][tx] = rayon[ty + 1][tx] = true; }
  // jonctions : remplies quand deux rayons s'y rejoignent
  for (let rr = 0; rr < 5; rr++) for (let c = 0; c < 8; c++) {
    const n = Hm[rr][c] + Hm[rr][c + 1] + Vm[rr][c] + Vm[rr + 1][c];
    if (n >= 2) rayon[HAUT + 2 + rr * 3][3 + c * 3] = true;
  }
  C.labyrinthe = { rayon, T, HAUT, Hm, Vm };

  // ---------------------------------------------------------------- sol et murs
  for (let y = 48; y < H; y += 16) for (let x = 0; x < W; x += 16) {
    const c = ((x + y) / 16) % 2 ? '#dde1e7' : '#cdd3db';
    P.rect(x, y, 16, 16, c); P.hline(x, y, 16, '#eef1f5'); P.vline(x, y, 16, '#e6e9ee');
  }
  for (let k = 0; k < 10; k++) { const x0 = 10 + k * 46; for (let j = 0; j < 40; j++) P.rect(x0 + j, 300 + j * 0.6, 7, 1, 'rgba(255,255,255,0.2)'); }
  P.rect(0, 0, W, 48, '#eef0f3');
  for (let y = 4; y < 48; y += 6) P.hline(0, y, W, '#dfe3e8');
  for (let x = 0; x < W; x += 6) P.vline(x, 0, 48, '#e4e7ec');
  P.rect(0, 0, W, 3, BLUE); P.hline(0, 3, W, RED);
  P.rect(W / 2 - 22, 5, 44, 28, '#f7f8fa'); P.rect(W / 2 - 22, 5, 44, 1, '#ffffff'); P.rect(W / 2 - 22, 32, 44, 1, '#c8d0da');
  P.draw(Batiments.carrefourLogo('grand'), W / 2 - 17, 8);
  P.rect(0, 44, W, 4, '#9aa4b0'); P.hline(0, 44, W, '#c8d0da');
  P.rect(0, 0, 16, H, '#5a6070'); P.vline(15, 0, H, '#8a92a2');
  P.rect(W - 16, 0, 16, H, '#5a6070'); P.vline(W - 16, 0, H, '#8a92a2');
  P.rect(0, 360, 208, 8, '#5a6070'); P.rect(240, 360, W - 240, 8, '#5a6070');
  P.hline(0, 360, 208, '#8a92a2'); P.hline(240, 360, W - 240, '#8a92a2');
  P.rect(208, 344, 32, 24, '#3d4458'); for (let y = 346; y < 368; y += 2) P.hline(210, y, 28, '#4a5268');
  C.solide(0, 0, 16, H); C.solide(W - 16, 0, 16, H); C.solide(0, 0, W, 46);
  C.solide(0, 362, 208, 6); C.solide(240, 362, W - 240, 6);

  // ---------------------------------------------------------------- frigos le long du mur du fond
  const PROD = ['#e1251b', '#1d4f9c', '#f2c230', '#3fa055', '#f08a2a', '#ffffff', '#c04a8a', '#6a3e2e', '#8fd0e8'];
  const frigo = (w) => {
    const c = PX.canvas(w, 34), Q = PX.painter(c);
    Q.rect(0, 0, w, 34, '#f4f6f8'); Q.hline(0, 0, w, '#ffffff'); Q.rect(0, 2, w, 3, '#bfe3f4');
    for (let x = 2; x < w - 2; x += 18) {
      Q.rect(x, 6, 16, 24, '#a8d8ea'); Q.rect(x + 1, 7, 14, 22, '#d4f0fa');
      for (let s = 0; s < 3; s++) {
        Q.hline(x + 1, 13 + s * 6, 14, '#8fb8c8');
        for (let i = 0; i < 14; i += 2) Q.rect(x + 1 + i, 9 + s * 6, 1 + (i % 4 === 0 ? 1 : 0), 4, r.pick(PROD));
      }
      Q.vline(x + 14, 12, 10, '#8a92a2');
    }
    Q.rect(0, 30, w, 4, '#8a92a2');
    return { img: c, ax: 0, ay: 33 };
  };
  C.objet(frigo(176), 16, 47); C.objet(frigo(176), W - 192, 47);
  C.zone(16, 40, 176, 14, 'frigos'); C.zone(W - 192, 40, 176, 14, 'frigos');

  // ---------------------------------------------------------------- rayons (assemblés par tronçons horizontaux)
  const FACE = 12;
  const SECTIONS = [['#f2c230', '#e8a020', '#fff0a0'], ['#e1251b', '#f08a2a', '#ffffff'], ['#3fa055', '#8fd0e8', '#ffffff'], ['#1d4f9c', '#8fd0e8', '#c04a8a'], ['#6a3e2e', '#f2c230', '#c04a8a']];
  const estRayon = (tx, ty) => ty >= 0 && ty < ROWS && tx >= 0 && tx < COLS && rayon[ty][tx];
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS;) {
      if (!rayon[ty][tx]) { tx++; continue; }
      let fin = tx; while (fin + 1 < COLS && rayon[ty][fin + 1]) fin++;
      const n = fin - tx + 1, w = n * T;
      const c = PX.canvas(w, T + FACE), Q = PX.painter(c);
      const sect = SECTIONS[(tx + ty * 3) % SECTIONS.length];
      // dessus du rayon (vu d'en haut) : produits rangés en lignes
      Q.rect(0, 0, w, T, '#c9d0d8'); Q.rect(1, 1, w - 2, T - 2, '#e6eaef');
      for (let i = 0; i < n; i++) {
        const x0 = i * T;
        for (let yy = 3; yy < T - 2; yy += 4) for (let xx = 2; xx < T - 2; xx += 3) Q.rect(x0 + xx, yy, 2, 2, r.chance(0.85) ? r.pick(sect) : '#f4f6f8');
        Q.hline(x0 + 1, 8, T - 2, '#b8c0ca');
      }
      Q.hline(0, 0, w, '#f6f8fa');
      // façade avant (seulement là où le rayon ne continue pas vers le bas)
      for (let i = 0; i < n; i++) {
        if (estRayon(tx + i, ty + 1)) continue;
        const x0 = i * T, y0 = T;
        Q.rect(x0, y0, T, FACE, '#eceff3');
        for (let s = 0; s < 2; s++) {
          const sy = y0 + 1 + s * 5;
          for (let k = 1; k < T - 1; k++) if (r.chance(0.86)) { const col = r.pick(sect); Q.rect(x0 + k, sy, 1, 3, col); Q.px(x0 + k, sy, PX.shade(col, 0.35)); }
          Q.hline(x0, sy + 3, T, '#ffffff'); Q.hline(x0, sy + 4, T, '#9aa4b0');
          if (i % 2 === 0) Q.px(x0 + 4, sy + 3, r.chance(0.5) ? '#f2c230' : RED);
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

  // ---------------------------------------------------------------- avant du magasin : caisse, fruits, paniers
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
  C.objet(comptoir(), 36, 344, { solide: [0, -10, 74, 10] });
  C.zone(36, 340, 74, 14, 'caissier');
  C.objet(etalFruits(), 336, 344, { solide: [0, -10, 78, 10] });
  C.zone(336, 338, 78, 12, 'fruits');
  C.objet(paniers(), 190, 354, { solide: [-7, -3, 14, 4], ombre: [7, 2], texte: 'paniers', zw: 18 });
  C.objet(Objets.pot(5, 'sapin'), 258, 352, { solide: [-5, -3, 10, 4], ombre: [5, 2] });

  // panneaux suspendus au-dessus de quelques allées
  const panneau = (couleur) => {
    const c = PX.canvas(16, 12), Q = PX.painter(c);
    Q.vline(4, 0, 3, '#8a92a2'); Q.vline(11, 0, 3, '#8a92a2');
    Q.rect(0, 3, 16, 9, couleur); Q.hline(0, 3, 16, PX.shade(couleur, 0.3)); Q.hline(0, 11, 16, PX.shade(couleur, -0.3));
    Q.rect(6, 6, 4, 3, '#ffffff');
    return c;
  };
  [[72, 52, BLUE], [360, 52, RED], [216, 148, '#3fa055'], [72, 244, '#f2a020'], [360, 244, BLUE]].forEach(([x, y, col]) => C.dessusImg(panneau(col), x, y));

  // ---------------------------------------------------------------- personnages
  const spr = Sprites.person({
    peau: '#c48d6c', cheveux: '#2a1e1a', coiffure: 'boucles', barbe: 'courte', lunettes: true,
    couleurLunettes: '#2a2233', yeux: '#2a1d2e', veste: '#1d4f9c', pantalon: '#2a2a3a', chaussures: '#24222a',
  });
  Entites.portraits.caissier = spr.down.idle;
  C.pnj.push({
    x: 72, y: 334, blinkT: 2, sortY: 334,
    update(dt) { this.blinkT -= dt; if (this.blinkT < -0.15) this.blinkT = 2 + Math.random() * 3; },
    draw(g) { Entites.poser(g, this.blinkT < 0 ? spr.down.blink : spr.down.idle, this.x, this.y); },
  });
  C.zones[C.zones.findIndex((z) => z.texte === 'caissier')].dialogue = (J) => Scenes.repliques('caissier', J);
  const dame = Sprites.person({
    peau: '#f0c8a8', cheveux: '#dcd8e2', coiffure: 'chignon', barbe: 'aucune', lunettes: true, couleurLunettes: '#6a4a3a',
    yeux: '#2a1d2e', veste: '#a83a4a', echarpe: '#e8d8a0', coupe: 'robe', pantalon: '#5a2a3a', chaussures: '#2a2026',
  });
  Entites.portraits.cliente = dame.down.idle;
  C.pnj.push({
    x: 120, y: 70, dir: 'up', t: 3, bloquant: true, texte: 'cliente',
    get sortY() { return this.y; },
    update(dt) { this.t -= dt; if (this.t < 0) { this.dir = ['up', 'up', 'left', 'right', 'down'][Math.floor(Math.random() * 5)]; this.t = 2 + Math.random() * 3; } },
    zone() { return { x: this.x - 9, y: this.y - 12, w: 18, h: 16, texte: 'cliente' }; },
    draw(g) { Entites.ombre(g, this.x, this.y, 6); Entites.poser(g, dame[this.dir].idle, this.x, this.y); },
  });

  // ---------------------------------------------------------------- sortie
  C.zone(210, 340, 28, 10, 'sortie');
  C.porte(206, 352, 36, 16, 'rue', 'devantSuperette', 'down');
  C.arrivees.entree = { x: 224, y: 350, dir: 'up' };
  C.finaliser(0.22);
  return C;
});
