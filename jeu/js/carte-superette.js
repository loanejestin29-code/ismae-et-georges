// =====================================================================
//  carte-superette.js — ZONE 2 : l'intérieur de la supérette
//  Rayons, frigos, caisse et étal de fruits. La sortie est en bas.
// =====================================================================
'use strict';

Jeu.enregistrerCarte('superette', () => {
  const W = 320, H = 232;
  const C = new Carte('superette', W, H, { ambiance: 'interieur', fond: '#0d0a14' });
  const P = C.P, r = PX.rng(77);
  const BLUE = '#1d4f9c', RED = '#e1251b';
  const PROD = ['#e1251b', '#1d4f9c', '#f2c230', '#3fa055', '#f08a2a', '#ffffff', '#c04a8a', '#6a3e2e', '#8fd0e8'];

  // ---------------------------------------------------------------- sol et murs
  for (let y = 64; y < H; y += 8) for (let x = 0; x < W; x += 8) {
    const c = ((x + y) / 8) % 2 ? '#dde1e7' : '#cdd3db';
    P.rect(x, y, 8, 8, c); P.hline(x, y, 8, '#eef1f5'); P.vline(x, y, 8, '#e6e9ee');
  }
  P.dither(0, 64, W, 14, '#b9c3d0', 6);
  // mur du fond : carrelage blanc, frise bleue et rouge, grand logo
  P.rect(0, 0, W, 64, '#eef0f3');
  for (let y = 4; y < 64; y += 6) P.hline(0, y, W, '#dfe3e8');
  for (let x = 0; x < W; x += 6) P.vline(x, 0, 64, '#e4e7ec');
  P.rect(0, 0, W, 3, BLUE); P.hline(0, 3, W, RED);
  P.draw(Batiments.carrefourLogo('grand', 2), W / 2 - 21, 6);
  P.rect(0, 60, W, 4, '#9aa4b0'); P.hline(0, 60, W, '#c8d0da');
  // murs latéraux et mur de façade (vu du dessus) avec l'ouverture des portes
  P.rect(0, 0, 8, H, '#5a6070'); P.vline(7, 0, H, '#8a92a2');
  P.rect(W - 8, 0, 8, H, '#5a6070'); P.vline(W - 8, 0, H, '#8a92a2');
  P.rect(0, 222, 140, 10, '#5a6070'); P.rect(180, 222, 140, 10, '#5a6070');
  P.hline(0, 222, 140, '#8a92a2'); P.hline(180, 222, 140, '#8a92a2');
  P.rect(142, 214, 36, 18, '#3d4458'); for (let y = 216; y < 232; y += 2) P.hline(144, y, 32, '#4a5268');
  C.solide(0, 0, 8, H); C.solide(W - 8, 0, 8, H); C.solide(0, 0, W, 62);
  C.solide(0, 224, 140, 8); C.solide(180, 224, 140, 8);

  // ---------------------------------------------------------------- objets
  const frigo = (w) => {
    const c = PX.canvas(w, 38), Q = PX.painter(c);
    Q.rect(0, 0, w, 38, '#f4f6f8'); Q.hline(0, 0, w, '#ffffff'); Q.rect(0, 2, w, 3, '#bfe3f4');
    for (let x = 2; x < w - 2; x += 18) {
      Q.rect(x, 6, 16, 28, '#a8d8ea'); Q.rect(x + 1, 7, 14, 26, '#d4f0fa');
      for (let s = 0; s < 4; s++) {
        Q.hline(x + 1, 13 + s * 6, 14, '#8fb8c8');
        for (let i = 0; i < 14; i += 2) Q.rect(x + 1 + i, 9 + s * 6, 1 + (i % 4 === 0 ? 1 : 0), 4, r.pick(PROD));
      }
      Q.vline(x + 14, 14, 10, '#8a92a2');
      for (let k = 0; k < 26; k += 6) Q.px(x + 3 + (k % 5), 8 + k, 'rgba(255,255,255,0.8)');
    }
    Q.rect(0, 34, w, 4, '#8a92a2');
    return { img: c, ax: 0, ay: 37 };
  };
  const gondole = (w) => {
    const c = PX.canvas(w, 28), Q = PX.painter(c);
    Q.rect(0, 0, w, 6, '#d6dce3'); Q.hline(0, 0, w, '#f2f4f7'); Q.hline(0, 5, w, '#9aa4b0');
    Q.rect(0, 6, w, 20, '#eceff3');
    for (let s = 0; s < 3; s++) {
      const sy = 7 + s * 6;
      for (let i = 1; i < w - 1; i++) if (r.chance(0.86)) {
        const col = r.pick(PROD);
        Q.rect(i, sy, 1, 4, col); Q.px(i, sy, PX.shade(col, 0.35));
      }
      Q.hline(0, sy + 4, w, '#ffffff'); Q.hline(0, sy + 5, w, '#9aa4b0');
      for (let i = 4; i < w; i += 13) Q.px(i, sy + 4, r.chance(0.5) ? '#f2c230' : RED);
    }
    Q.rect(0, 25, w, 3, '#6a7282');
    Q.vline(0, 0, 28, '#9aa4b0'); Q.vline(w - 1, 0, 28, '#7a8292');
    return { img: c, ax: 0, ay: 27 };
  };
  const comptoir = () => {
    const c = PX.canvas(74, 26), Q = PX.painter(c);
    Q.rect(0, 0, 74, 8, '#3a3f4e'); Q.hline(0, 0, 74, '#5a6070'); Q.rect(4, 2, 44, 4, '#1c1e26');
    for (let x = 6; x < 46; x += 5) Q.vline(x, 2, 4, '#2c2f3a');
    Q.rect(54, 1, 12, 6, '#22262e'); Q.rect(56, 2, 8, 3, '#7fe0a0');
    Q.rect(0, 8, 74, 16, '#f4f6f8'); Q.rect(0, 14, 74, 3, BLUE); Q.hline(0, 17, 74, RED);
    Q.draw(Batiments.carrefourLogo('petit'), 30, 9);
    Q.rect(0, 24, 74, 2, '#8a92a2');
    return { img: c, ax: 0, ay: 25 };
  };
  const etalFruits = () => {
    const c = PX.canvas(78, 24), Q = PX.painter(c);
    const caisse = (x, fruit, f2) => {
      Q.rect(x, 8, 24, 14, '#b8875a'); Q.hline(x, 8, 24, '#d8a876'); Q.hline(x, 14, 24, '#8a5e3a'); Q.rect(x, 21, 24, 1, '#6a4a2e');
      for (let k = 0; k < 22; k++) Q.ellipse(x + 2 + r.int(20), 3 + r.int(6), 1, 1, r.chance(0.8) ? fruit : f2);
    };
    caisse(1, '#f08a24', '#ffb04a'); caisse(27, '#d8303a', '#7cc04a'); caisse(53, '#f2d040', '#c8a020');
    Q.rect(30, 0, 14, 6, '#f2c230'); Q.rect(32, 1, 10, 3, RED);
    return { img: c, ax: 0, ay: 23 };
  };

  // reflets des néons sur le carrelage
  for (let k = 0; k < 7; k++) {
    const x0 = 20 + k * 44;
    for (let j = 0; j < 30; j++) P.rect(x0 + j, 170 + j, 6, 1, 'rgba(255,255,255,0.22)');
  }
  const promo = () => {
    const c = PX.canvas(30, 26), Q = PX.painter(c);
    Q.ellipse(15, 19, 14, 5, '#a8343a'); Q.ellipse(15, 18, 13, 4, '#d8434b'); Q.hline(3, 22, 24, '#6a1e24');
    for (const [x, y, col] of [[5, 12, '#f2c230'], [12, 10, '#3fa055'], [19, 12, '#e8e8f0'], [9, 6, '#d8434b'], [16, 5, '#f2c230'], [12, 1, '#1d4f9c']]) {
      Q.rect(x, y, 7, 6, col); Q.hline(x, y, 7, PX.shade(col, 0.35)); Q.vline(x + 6, y, 6, PX.shade(col, -0.3)); Q.vline(x + 3, y, 6, '#f4e2a0');
    }
    return { img: c, ax: 15, ay: 24 };
  };
  const paniers = () => {
    const c = PX.canvas(16, 14), Q = PX.painter(c);
    for (let k = 0; k < 4; k++) { Q.rect(1, 9 - k * 3, 14, 4, '#d8303a'); Q.hline(1, 9 - k * 3, 14, '#f0606a'); for (let x = 2; x < 14; x += 3) Q.px(x, 11 - k * 3, '#8a1a22'); }
    Q.rect(3, 0, 10, 1, '#2a2a3a');
    return { img: c, ax: 8, ay: 13 };
  };
  C.objet(promo(), 160, 140, { solide: [-12, -5, 24, 6], ombre: [13, 3], texte: 'promo', zw: 30 });
  C.objet(paniers(), 116, 216, { solide: [-7, -3, 14, 4], ombre: [7, 2], texte: 'paniers', zw: 18 });
  for (const [x, y, w] of [[14, 66, 110], [196, 66, 110], [24, 112, 100], [196, 112, 100], [24, 154, 100], [196, 154, 100], [28, 196, 74], [214, 204, 78]]) {
    C.O.rect(x - 1, y, w + 2, 3, '#000'); C.O.dither(x - 1, y + 3, w + 2, 2, '#000', 8);
  }
  C.objet(frigo(110), 14, 66); C.objet(frigo(110), 196, 66);
  C.zone(14, 56, 110, 16, 'frigos'); C.zone(196, 56, 110, 16, 'frigos');
  for (const [x, y] of [[24, 112], [196, 112], [24, 154], [196, 154]]) {
    C.objet(gondole(100), x, y, { solide: [0, -12, 100, 12] });
    C.zone(x + 4, y - 4, 92, 12, 'rayons');
    C.zone(x + 4, y - 24, 92, 10, 'rayons');
  }
  C.objet(comptoir(), 28, 196, { solide: [0, -12, 74, 12] });
  C.objet(etalFruits(), 214, 204, { solide: [0, -12, 78, 12] });
  C.zone(214, 200, 78, 12, 'fruits');
  C.objet(Objets.pot(5, 'sapin'), 128, 212, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(6, 'sapin'), 192, 212, { solide: [-5, -3, 10, 4], ombre: [5, 2] });

  // panneaux suspendus avec pictogrammes (sans texte)
  const panneau = (icone) => {
    const c = PX.canvas(16, 14), Q = PX.painter(c);
    Q.vline(4, 0, 4, '#8a92a2'); Q.vline(11, 0, 4, '#8a92a2');
    Q.rect(0, 4, 16, 10, BLUE); Q.hline(0, 4, 16, '#3a6abc'); Q.hline(0, 13, 16, '#123a78');
    const ic = {
      pain: [[5, 9], [6, 8], [7, 8], [8, 7], [9, 7], [10, 6], [6, 9], [7, 9], [8, 8], [9, 8]],
      lait: [[6, 6], [7, 6], [8, 6], [6, 7], [7, 7], [8, 7], [9, 7], [6, 8], [7, 8], [8, 8], [9, 8], [6, 9], [7, 9], [8, 9], [9, 9], [6, 10], [7, 10], [8, 10], [9, 10]],
      pomme: [[7, 6], [6, 7], [7, 7], [8, 7], [9, 7], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [6, 9], [7, 9], [8, 9], [9, 9], [7, 10], [8, 10]],
      chat: [[5, 6], [9, 6], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [5, 8], [7, 8], [9, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [6, 10], [7, 10], [8, 10], [11, 9], [11, 10], [10, 10]],
    }[icone];
    ic.forEach(([x, y]) => Q.px(x, y, '#ffffff'));
    return c;
  };
  [['pain', 66, 82], ['lait', 238, 82], ['pomme', 66, 124], ['chat', 238, 124]].forEach(([ic, x, y]) => C.dessusImg(panneau(ic), x, y));

  // ---------------------------------------------------------------- caissier
  const spr = Sprites.person({
    peau: '#c48d6c', cheveux: '#2a1e1a', coiffure: 'boucles', barbe: 'courte', couleurBarbe: null, lunettes: true,
    couleurLunettes: '#2a2233', yeux: '#2a1d2e', veste: '#1d4f9c', echarpe: null, pantalon: '#2a2a3a', chaussures: '#24222a',
  });
  const caissier = {
    x: 70, y: 182, blinkT: 2, sortY: 182,
    update(dt) { this.blinkT -= dt; if (this.blinkT < -0.15) this.blinkT = 2 + Math.random() * 3; },
    draw(g) { Entites.poser(g, this.blinkT < 0 ? spr.down.blink : spr.down.idle, this.x, this.y); },
  };
  C.pnj.push(caissier);
  C.zone(28, 194, 74, 14, 'caissier');
  C.solide(28, 170, 74, 14);

  // une cliente qui hésite devant les rayons
  const dame = Sprites.person({
    peau: '#f0c8a8', cheveux: '#dcd8e2', coiffure: 'boucles', barbe: 'aucune', lunettes: true, couleurLunettes: '#6a4a3a',
    yeux: '#2a1d2e', veste: '#a83a4a', echarpe: '#e8d8a0', pantalon: '#3a3446', chaussures: '#2a2026',
  });
  const cliente = {
    x: 64, y: 136, dir: 'up', t: 3, hb: { w: 10, h: 6 }, texte: 'cliente',
    get sortY() { return this.y; },
    update(dt) { this.t -= dt; if (this.t < 0) { this.dir = ['up', 'up', 'left', 'right', 'down'][Math.floor(Math.random() * 5)]; this.t = 2 + Math.random() * 3; } },
    zone() { return { x: this.x - 9, y: this.y - 12, w: 18, h: 16, texte: 'cliente' }; },
    draw(g) { Entites.ombre(g, this.x, this.y, 6); Entites.poser(g, dame[this.dir].idle, this.x, this.y); },
  };
  C.pnj.push(cliente);
  C.solide(58, 131, 12, 6);

  // ---------------------------------------------------------------- sortie
  C.zone(142, 210, 36, 12, 'sortie');
  C.porte(140, 214, 40, 18, 'rue', 'devantSuperette', 'down');
  C.arrivees.entree = { x: 160, y: 210, dir: 'up' };
  C.finaliser(0.22);
  return C;
});
