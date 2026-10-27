// =====================================================================
//  decor-objets.js — mobilier urbain et objets du décor.
//  Chaque objet renvoie { img, ax, ay } : (ax, ay) est le point de
//  l'image posé au sol (sert au tri de profondeur et aux collisions).
// =====================================================================
'use strict';

const Objets = (() => {
  const S = PX.shade;
  const FONTE = { a: '#25332d', b: '#3b5146', hi: '#6a8a78', d: '#141c19' }; // fonte vert sapin parisien

  function mk(w, h) { const c = PX.canvas(w, h); return { c, P: PX.painter(c) }; }

  // trait d'un pixel entre deux points
  function line(P, x0, y0, x1, y1, col, th = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      P.rect(x0 - Math.floor(th / 2), y0, th, 1, col);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  // ------------------------------------------------------------ réverbère
  function lampadaire() {
    const { c, P } = mk(13, 56);
    // socle évasé
    P.rect(2, 52, 9, 4, FONTE.a); P.hline(2, 52, 9, FONTE.hi); P.vline(10, 52, 4, FONTE.d);
    P.rect(3, 47, 7, 5, FONTE.b); P.vline(3, 47, 5, FONTE.hi); P.vline(9, 47, 5, FONTE.d);
    P.rect(4, 44, 5, 3, FONTE.a); P.hline(3, 44, 7, FONTE.hi);
    // fût cannelé
    P.rect(5, 14, 3, 30, FONTE.a); P.vline(5, 14, 30, FONTE.hi); P.vline(7, 14, 30, FONTE.d);
    for (const y of [22, 33]) { P.rect(4, y, 5, 2, FONTE.b); P.hline(4, y, 5, FONTE.hi); }
    // chapiteau + crosse
    P.rect(4, 11, 5, 3, FONTE.b); P.hline(3, 11, 7, FONTE.hi);
    // lanterne vitrée
    P.rect(3, 1, 7, 2, FONTE.a); P.hline(4, 0, 5, FONTE.b); P.px(6, -1 + 1, FONTE.hi);
    for (let j = 0; j < 7; j++) { const w = 9 - Math.floor(j / 3); P.rect(6 - Math.floor(w / 2), 3 + j, w, 1, j < 1 ? '#fff6d0' : '#ffe08a'); }
    P.rect(5, 4, 3, 4, '#fff8e0');
    P.vline(2, 3, 5, FONTE.a); P.vline(10, 3, 5, FONTE.a); P.vline(6, 3, 7, '#d9a440');
    P.rect(3, 10, 7, 1, FONTE.a);
    return { img: c, ax: 6, ay: 55, light: { dx: 0, dy: -50 } };
  }

  // ------------------------------------------------------------ arbres
  function platane(seed) {
    const r = PX.rng(seed);
    const W = 64, H = 78;
    const { c, P } = mk(W, H);
    const cx = 32, base = 77;
    const twinkles = [];
    const bark = ['#5e5446', '#776a57', '#8f8268'];
    function branch(x, y, ang, len, th, depth) {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      line(P, x, y, x2, y2, depth < 2 ? bark[0] : bark[1], th);
      if (th > 1) line(P, x - 1, y, x2 - 1, y2, bark[2], 1);
      if (len < 4 || depth > 5) {
        if (r.chance(0.8)) twinkles.push([Math.round(x2), Math.round(y2)]);
        return;
      }
      if (r.chance(0.5)) twinkles.push([Math.round((x + x2) / 2), Math.round((y + y2) / 2)]);
      const n = depth < 2 ? 3 : 2;
      for (let k = 0; k < n; k++) {
        const a = ang + (k - (n - 1) / 2) * (0.5 + r() * 0.35) + (r() - 0.5) * 0.3;
        branch(x2, y2, a, len * (0.66 + r() * 0.12), Math.max(1, th - 1), depth + 1);
      }
    }
    // tronc de platane tacheté
    P.rect(cx - 3, base - 26, 6, 26, '#cfc5a2');
    for (let k = 0; k < 40; k++) P.rect(cx - 3 + r.int(6), base - 26 + r.int(26), 1 + r.int(2), 1 + r.int(2), r.pick(['#9c9a78', '#7f7c64', '#e4dcbc']));
    P.vline(cx + 2, base - 26, 26, '#7a755f');
    P.rect(cx - 5, base - 3, 10, 3, '#a8a080'); P.hline(cx - 5, base - 1, 10, '#6e6a56');
    branch(cx, base - 25, -Math.PI / 2, 16, 3, 0);
    // petites boules de platane accrochées
    for (let k = 0; k < 10; k++) { const t = r.pick(twinkles); if (t) P.px(t[0] + 1, t[1] + 1, '#7b5a3a'); }
    return { img: c, ax: cx, ay: base, twinkles, light: { dx: 0, dy: -45 } };
  }

  function arbreFeuillu(seed, opts = {}) {
    const r = PX.rng(seed);
    const W = opts.w || 60, H = opts.h || 74;
    const { c, P } = mk(W, H);
    const cx = Math.floor(W / 2), base = H - 1;
    const G = opts.couleurs || ['#1f3d2e', '#2f5d3a', '#3f7a45', '#5c9a4f', '#8cc063'];
    P.rect(cx - 3, base - 26, 7, 26, '#5a3e2e'); P.vline(cx - 3, base - 26, 26, '#7a5640'); P.vline(cx + 3, base - 26, 26, '#3a2a24');
    P.rect(cx - 5, base - 3, 11, 3, '#5a3e2e');
    if (opts.coeur) {
      P.px(cx - 1, base - 16, '#e8c8a8'); P.px(cx + 1, base - 16, '#e8c8a8');
      P.rect(cx - 2, base - 15, 5, 1, '#e8c8a8'); P.rect(cx - 1, base - 14, 3, 1, '#e8c8a8'); P.px(cx, base - 13, '#e8c8a8');
    }
    const blobs = [];
    for (let k = 0; k < 22; k++) {
      const a = r() * Math.PI * 2, d = r() * 16;
      blobs.push([cx + Math.cos(a) * d * 1.25, 26 + Math.sin(a) * d * 0.9, 8 + r.int(6)]);
    }
    blobs.sort((a, b) => a[1] - b[1]);
    for (const [bx, by, br] of blobs) P.ellipse(bx, by + 2, br, br - 2, G[0]);
    for (const [bx, by, br] of blobs) P.ellipse(bx, by, br - 1, br - 3, G[1]);
    for (const [bx, by, br] of blobs) P.ellipse(bx - 2, by - 2, br - 4, br - 5, G[2]);
    for (const [bx, by, br] of blobs) if (br > 9) P.ellipse(bx - 3, by - 4, br - 8, br - 9, G[3]);
    for (let k = 0; k < 60; k++) { const [bx, by] = r.pick(blobs); P.px(bx - 3 + r.int(6), by - 6 + r.int(6), G[4]); }
    for (let k = 0; k < 40; k++) { const [bx, by] = r.pick(blobs); P.px(bx + r.int(8), by + 4 + r.int(4), G[0]); }
    return { img: c, ax: cx, ay: base };
  }

  // ------------------------------------------------------------ mobilier
  function banc(vertical) {
    const { c, P } = mk(28, 16);
    const W1 = '#3e6b4f', W2 = '#2c4f3a', WH = '#5d8f6c';
    // dossier
    for (const y of [2, 5]) { P.rect(1, y, 26, 2, W1); P.hline(1, y, 26, WH); }
    // assise vue de dessus
    for (const y of [9, 11]) { P.rect(1, y, 26, 2, W1); P.hline(1, y, 26, WH); P.hline(1, y + 1, 26, W2); }
    for (const x of [2, 24]) { P.rect(x, 1, 2, 14, FONTE.a); P.vline(x, 1, 14, FONTE.hi); }
    P.rect(2, 14, 3, 2, FONTE.d); P.rect(23, 14, 3, 2, FONTE.d);
    return { img: c, ax: 14, ay: 15 };
  }

  function fontaineWallace() {
    const { c, P } = mk(22, 44);
    const A = FONTE.a, B = FONTE.b, H = FONTE.hi;
    // socle
    P.rect(2, 36, 18, 8, A); P.hline(2, 36, 18, H); P.rect(3, 38, 16, 2, B); P.vline(19, 36, 8, FONTE.d);
    P.rect(4, 32, 14, 4, B); P.hline(4, 32, 14, H);
    // cariatides (quatre silhouettes stylisées)
    for (const x of [5, 9, 12, 15]) {
      P.rect(x, 18, 2, 14, A); P.px(x, 18, H); P.rect(x, 16, 2, 2, B);
      P.px(x, 24, H); P.px(x + 1, 28, FONTE.d);
    }
    // filet d'eau au centre
    P.vline(11, 20, 12, '#9fd6e8'); P.vline(10, 26, 6, '#6fb0cc');
    // coupole
    P.rect(4, 12, 14, 4, A); P.hline(3, 15, 16, B); P.hline(4, 12, 14, H);
    P.ellipse(11, 10, 6, 3, B); P.ellipse(10, 9, 4, 2, H);
    P.rect(10, 4, 2, 4, A); P.px(10, 4, H); P.ellipse(11, 3, 1, 1, B);
    return { img: c, ax: 11, ay: 43 };
  }

  function colonneMorris(seed) {
    const r = PX.rng(seed);
    const { c, P } = mk(22, 52);
    P.rect(2, 46, 18, 6, FONTE.a); P.hline(2, 46, 18, FONTE.hi); P.vline(19, 46, 6, FONTE.d);
    P.rect(3, 12, 16, 34, '#e9dcc0');
    const cols = ['#c9483b', '#e3b44a', '#3b5f9a', '#f2e6cc', '#6a3e6e', '#2f7a5a', '#e98a5a'];
    for (let y = 13; y < 45; y += 8) for (let x = 3; x < 19; x += 5) {
      const col = r.pick(cols);
      P.rect(x, y, 5, 7, col); P.hline(x, y, 5, S(col, 0.25)); P.rect(x + 1, y + 2, 3, 1, S(col, -0.35));
      if (r.chance(0.5)) P.rect(x + 1, y + 4, 2, 2, S(col, 0.4));
    }
    P.vline(3, 12, 34, 'rgba(255,240,210,0.35)'); P.rect(16, 12, 3, 34, 'rgba(30,20,50,0.28)');
    P.rect(1, 9, 20, 3, FONTE.a); P.hline(1, 9, 20, FONTE.hi);
    P.ellipse(11, 6, 8, 3, FONTE.b); P.ellipse(10, 5, 6, 2, FONTE.hi);
    P.rect(10, 0, 2, 3, FONTE.a); P.px(10, 0, '#d9a440');
    return { img: c, ax: 11, ay: 51 };
  }

  function kiosque() {
    const { c, P } = mk(34, 46);
    P.rect(2, 16, 30, 28, FONTE.a); P.vline(2, 16, 28, FONTE.hi); P.vline(31, 16, 28, FONTE.d);
    // magazines
    const cols = ['#e04a4a', '#f2c230', '#4a7ae0', '#f4efe6', '#e88ab0', '#4ab08a'];
    for (let y = 18; y < 34; y += 5) for (let x = 4; x < 30; x += 4) { P.rect(x, y, 3, 4, cols[(x + y) % cols.length]); P.hline(x, y, 3, '#ffffff'); }
    P.rect(4, 35, 26, 7, '#1c2722'); P.rect(6, 36, 22, 4, '#f4e6c8');
    // toit en dôme
    P.rect(0, 12, 34, 4, FONTE.b); P.hline(0, 12, 34, FONTE.hi);
    P.ellipse(17, 9, 15, 4, FONTE.a); P.ellipse(16, 8, 12, 2, FONTE.hi);
    P.rect(16, 1, 2, 5, FONTE.a); P.ellipse(17, 1, 1, 1, '#d9a440');
    P.rect(2, 44, 30, 2, FONTE.d);
    return { img: c, ax: 17, ay: 45 };
  }

  function tableCafe() {
    const { c, P } = mk(12, 12);
    P.ellipse(6, 3, 5, 2, '#e8e2d6'); P.hline(2, 2, 7, '#ffffff'); P.hline(2, 5, 9, '#a39b8c');
    P.rect(5, 5, 2, 5, '#2a2630'); P.rect(3, 10, 6, 2, '#2a2630');
    P.px(4, 2, '#7a3a2a'); P.px(8, 3, '#f0e2c8');
    return { img: c, ax: 6, ay: 11 };
  }

  function chaiseBistrot() {
    const { c, P } = mk(9, 14);
    const R = '#c9934a', R2 = '#8a5a2e', R3 = '#e8c27a';
    for (let y = 0; y < 6; y++) for (let x = 1; x < 8; x++) P.px(x, y, (x + y) % 2 ? R : R2);
    P.hline(1, 0, 7, R3);
    P.rect(0, 6, 9, 3, R2); for (let x = 0; x < 9; x += 2) P.px(x, 7, R3);
    P.vline(1, 9, 5, '#3a2a24'); P.vline(7, 9, 5, '#3a2a24'); P.vline(0, 0, 9, '#3a2a24'); P.vline(8, 0, 9, '#3a2a24');
    return { img: c, ax: 4, ay: 13 };
  }

  function etalFleurs(seed) {
    const r = PX.rng(seed);
    const { c, P } = mk(30, 20);
    P.rect(0, 10, 30, 8, '#8a5a34'); P.hline(0, 10, 30, '#b07a48'); P.rect(0, 18, 30, 2, '#4a2e22');
    for (let x = 2; x < 28; x += 6) {
      P.rect(x, 6, 5, 5, '#8d93a6'); P.hline(x, 6, 5, '#c0c6d6');
      for (let k = 0; k < 9; k++) P.px(x + r.int(6) - 0, 1 + r.int(6), r.pick(['#e8434b', '#ff8fb0', '#ffd34e', '#f4f0f0', '#b45ad0', '#ff6a3a']));
      for (let k = 0; k < 4; k++) P.px(x + r.int(5), 3 + r.int(4), '#4f8d3e');
    }
    return { img: c, ax: 15, ay: 19 };
  }

  function boiteBouquiniste(seed) {
    const r = PX.rng(seed);
    const { c, P } = mk(30, 20);
    const G = '#2e5a3e', G2 = '#1f3d2b', GH = '#4c8060';
    // couvercle ouvert (vers le haut)
    P.rect(1, 0, 28, 7, G); P.hline(1, 0, 28, GH); P.rect(3, 2, 24, 4, G2);
    // gravures et livres exposés
    P.rect(1, 7, 28, 7, '#e9dfc8');
    for (let x = 2; x < 28; x += 6) { P.rect(x, 8, 5, 5, r.pick(['#d8c9a8', '#c8d8e0', '#e8d0c0'])); P.rect(x + 1, 9, 3, 2, r.pick(['#6a7a9a', '#9a5a4a', '#4a6a4a'])); }
    P.rect(1, 14, 28, 5, G); P.hline(1, 14, 28, GH); P.hline(1, 18, 28, G2);
    P.px(14, 16, '#d9a440');
    return { img: c, ax: 15, ay: 19 };
  }

  function borne() {
    const { c, P } = mk(5, 10);
    P.rect(1, 2, 3, 8, FONTE.a); P.vline(1, 2, 8, FONTE.hi); P.ellipse(2, 2, 1, 1, FONTE.b); P.px(2, 1, FONTE.hi);
    return { img: c, ax: 2, ay: 9 };
  }

  function caisses(seed) {
    const r = PX.rng(seed);
    const { c, P } = mk(22, 18);
    const box = (x, y, fruit) => {
      P.rect(x, y, 10, 8, '#b8875a'); P.hline(x, y, 10, '#d8a876'); P.hline(x, y + 4, 10, '#8a5e3a'); P.rect(x, y + 7, 10, 1, '#6a4a2e');
      P.vline(x, y, 8, '#8a5e3a'); P.vline(x + 9, y, 8, '#8a5e3a');
      if (fruit) for (let k = 0; k < 8; k++) P.ellipse(x + 2 + r.int(6), y - 1 + r.int(2), 1, 1, fruit);
    };
    box(1, 9, '#f08a24'); box(11, 9, '#d8303a'); box(6, 2, '#f08a24');
    return { img: c, ax: 11, ay: 17 };
  }

  function poubelles() {
    const { c, P } = mk(24, 18);
    for (const x of [1, 12]) {
      P.rect(x, 4, 10, 13, '#3f7a4a'); P.vline(x, 4, 13, '#5f9a64'); P.vline(x + 9, 4, 13, '#2a5232');
      P.rect(x - 1, 2, 12, 3, '#2f6a3a'); P.hline(x - 1, 2, 12, '#6aa870');
      P.rect(x + 1, 16, 2, 2, '#1a1a22'); P.rect(x + 7, 16, 2, 2, '#1a1a22');
    }
    return { img: c, ax: 12, ay: 17 };
  }

  function velo() {
    const { c, P } = mk(26, 16);
    const wheel = (cx) => { P.ellipse(cx, 10, 5, 5, '#2a2630'); P.ellipse(cx, 10, 4, 4, 'rgba(0,0,0,0)'); };
    for (const cx of [6, 19]) {
      for (let a = 0; a < 32; a++) { const t = (a / 32) * Math.PI * 2; P.px(cx + Math.round(Math.cos(t) * 5), 10 + Math.round(Math.sin(t) * 5), '#2a2630'); }
      P.px(cx, 10, '#9a9aa8');
    }
    line(P, 6, 10, 12, 10, '#b8423a'); line(P, 12, 10, 17, 4, '#b8423a'); line(P, 9, 4, 17, 4, '#b8423a');
    line(P, 6, 10, 9, 4, '#b8423a'); line(P, 17, 4, 19, 10, '#b8423a'); line(P, 9, 4, 9, 2, '#2a2630');
    P.rect(7, 1, 5, 1, '#3a2a24'); P.rect(17, 1, 3, 2, '#2a2630');
    P.rect(19, 2, 6, 4, '#b8875a'); P.hline(19, 2, 6, '#d8a876'); P.px(21, 1, '#f2c230'); P.px(23, 1, '#e8434b');
    void wheel;
    return { img: c, ax: 13, ay: 15 };
  }

  function pompe() {
    const { c, P } = mk(14, 22);
    P.rect(1, 18, 12, 4, '#8a8478'); P.hline(1, 18, 12, '#b0aa9c');
    P.rect(5, 4, 4, 14, FONTE.a); P.vline(5, 4, 14, FONTE.hi);
    P.rect(8, 9, 4, 2, FONTE.b); P.px(11, 11, '#6fb0cc');
    line(P, 6, 4, 1, 1, FONTE.b); P.ellipse(7, 3, 2, 1, FONTE.b);
    return { img: c, ax: 7, ay: 21 };
  }

  function barriere() {
    const { c, P } = mk(34, 18);
    for (let x = 0; x < 34; x++) { const col = Math.floor(x / 4) % 2 ? '#f4efe6' : '#d8323a'; P.vline(x, 4, 4, col); }
    P.hline(0, 4, 34, '#ffffff'); P.hline(0, 7, 34, '#8a2a2a');
    for (const x of [3, 29]) { P.rect(x, 4, 2, 13, '#c8c0b0'); P.vline(x + 1, 4, 13, '#8a8478'); P.rect(x - 2, 16, 6, 2, '#5a5448'); }
    P.rect(15, 0, 4, 4, '#f2a020'); P.px(16, 1, '#ffe080'); P.rect(16, 3, 2, 1, '#3a2a24');
    return { img: c, ax: 17, ay: 17, light: { dx: 0, dy: -15 } };
  }

  function pot(seed, kind) {
    const r = PX.rng(seed);
    const { c, P } = mk(14, 20);
    P.rect(2, 12, 10, 8, '#c86a44'); P.hline(1, 12, 12, '#e89068'); P.vline(11, 12, 8, '#8a4430'); P.hline(2, 19, 10, '#6a3426');
    if (kind === 'sapin') {
      for (let j = 0; j < 11; j++) { const w = 1 + Math.floor(j * 0.9); P.rect(7 - w, 1 + j, w * 2, 1, j % 3 === 2 ? '#1f4a32' : '#2f6a42'); }
      P.px(7, 0, '#ffd34e');
      for (let k = 0; k < 6; k++) P.px(4 + r.int(7), 3 + r.int(8), r.pick(['#e8434b', '#ffd34e', '#f4f0f0']));
    } else {
      for (let k = 0; k < 18; k++) P.ellipse(3 + r.int(8), 3 + r.int(8), 2, 1, r.pick(['#2f5d3a', '#3f7a45', '#5c9a4f']));
      for (let k = 0; k < 5; k++) P.px(3 + r.int(8), 3 + r.int(7), r.pick(['#e8434b', '#ff8fb0', '#f4f0f0']));
    }
    return { img: c, ax: 7, ay: 19 };
  }

  function lanterneMurale() {
    const { c, P } = mk(7, 10);
    P.rect(1, 0, 5, 2, FONTE.a); P.rect(1, 2, 5, 6, '#ffe08a'); P.rect(2, 3, 3, 3, '#fff6d0');
    P.vline(1, 2, 6, FONTE.a); P.vline(5, 2, 6, FONTE.a); P.rect(1, 8, 5, 1, FONTE.a); P.px(3, 9, FONTE.a);
    return { img: c, ax: 3, ay: 9 };
  }

  // corde à linge en surplomb (entre deux façades)
  function linge(w, seed) {
    const r = PX.rng(seed);
    const { c, P } = mk(w, 20);
    for (let x = 0; x < w; x++) P.px(x, 2 + Math.round(Math.sin((x / w) * Math.PI) * 4), '#d8d0c0');
    for (let x = 4; x < w - 6; x += 7 + r.int(4)) {
      const y = 3 + Math.round(Math.sin((x / w) * Math.PI) * 4);
      const col = r.pick(['#f4efe6', '#c9483b', '#4a7ae0', '#f2c230', '#9ad0b0', '#e8a0b8']);
      const h = 6 + r.int(6), ww = 4 + r.int(3);
      P.rect(x, y, ww, h, col); P.vline(x + ww - 1, y, h, S(col, -0.25)); P.hline(x, y, ww, S(col, 0.25));
      P.px(x, y - 1, '#8a6a4a'); P.px(x + ww - 1, y - 1, '#8a6a4a');
    }
    return { img: c, ax: 0, ay: 0 };
  }

  // guirlande lumineuse en surplomb : renvoie aussi les points d'ampoules
  function guirlande(w, sag) {
    const { c, P } = mk(w, sag + 4);
    const pts = [];
    for (let x = 0; x < w; x++) {
      const y = 1 + Math.round(Math.sin((x / w) * Math.PI) * sag);
      P.px(x, y, '#3a3044');
      if (x % 6 === 3) pts.push([x, y + 1]);
    }
    return { img: c, ax: 0, ay: 0, bulbs: pts };
  }

  // ------------------------------------------------------------ péniche
  function peniche(seed) {
    const r = PX.rng(seed);
    const W = 240, H = 66;
    const { c, P } = mk(W, H);
    const HULL = '#25283a', HULL2 = '#363a52', RED = '#a8343a', DECK = '#8a6a4c';
    // coque (vue de trois quarts : on voit le pont et le flanc)
    P.rect(8, 40, W - 16, 18, HULL); P.rect(4, 42, 4, 14, HULL); P.rect(W - 8, 42, 6, 12, HULL);
    P.hline(6, 40, W - 12, HULL2); P.rect(6, 46, W - 12, 2, RED); P.hline(6, 46, W - 12, '#d0504a');
    for (let x = 14; x < W - 14; x += 22) P.ellipse(x, 52, 1, 1, '#4a4e66');
    P.dither(8, 54, W - 16, 4, '#141624', 9);
    // pont
    P.rect(8, 30, W - 16, 10, DECK); P.hline(8, 30, W - 16, '#b08a62');
    for (let x = 10; x < W - 10; x += 5) P.vline(x, 31, 9, '#7a5a40');
    // cabine
    P.rect(120, 10, 92, 22, '#e8dcc4'); P.hline(120, 10, 92, '#fff3dc'); P.rect(120, 8, 92, 3, '#3b5f4a'); P.hline(118, 8, 96, '#5a8a6a');
    for (let x = 126; x < 206; x += 14) {
      const lit = r.chance(0.7);
      P.rect(x, 15, 9, 9, lit ? '#ffd47c' : Batiments.GLASS.dark); P.rect(x, 15, 9, 1, '#3b5f4a');
      if (lit) { P.rect(x + 1, 16, 2, 8, '#f4e5c6'); P.dither(x + 2, 17, 6, 6, '#fff1bb', 5); }
      P.vline(x + 4, 15, 9, '#3b5f4a');
    }
    P.rect(196, 0, 5, 9, '#3a3044'); P.rect(195, 0, 7, 2, '#5a4a5a');
    P.rect(120, 24, 92, 8, '#d0c2a8'); P.hline(120, 31, 92, '#8a7a62');
    // plantes et pots sur le pont
    for (let x = 14; x < 112; x += 9 + r.int(5)) {
      const ph = 6 + r.int(8);
      P.rect(x, 33, 6, 6, '#c86a44'); P.hline(x, 33, 6, '#e89068');
      for (let k = 0; k < 10; k++) P.ellipse(x + r.int(7) - 1, 33 - r.int(ph), 2, 1, r.pick(['#2f5d3a', '#3f7a45', '#5c9a4f', '#8cc063']));
      if (r.chance(0.5)) P.px(x + 2, 31 - r.int(ph - 2), r.pick(['#e8434b', '#ffd34e', '#f4f0f0']));
    }
    // vélo sur le pont + bouée
    P.ellipse(222, 34, 4, 3, '#f4efe6'); P.ellipse(222, 34, 2, 1, DECK); P.px(219, 34, '#d8323a'); P.px(225, 34, '#d8323a');
    return { img: c, ax: 0, ay: H - 8, lights: [[150, 20], [180, 20]] };
  }

  // ------------------------------------------------------------ voiture ancienne (années 30), tournée vers la gauche
  function voiture() {
    const { c, P } = mk(66, 34);
    const B = '#6a2232', BH = '#9a3a4a', BD = '#3a1018', NOIR = '#1e1c26', CHROME = '#d8d6e0';
    // toit et habitacle arrondi (on voit un peu le dessus du toit)
    P.ellipse(38, 9, 15, 7, B); P.rect(23, 9, 31, 8, B);
    P.ellipse(38, 6, 12, 3, BH); P.hline(28, 3, 20, '#c45a6a');
    // vitres
    P.rect(26, 9, 10, 7, '#3e4c6e'); P.rect(38, 9, 12, 7, '#3e4c6e');
    P.px(27, 10, '#9fb6d8'); P.px(28, 10, '#9fb6d8'); P.px(39, 10, '#9fb6d8'); P.px(40, 11, '#9fb6d8');
    P.vline(37, 9, 7, BD); P.rect(51, 10, 3, 6, '#3e4c6e');
    // caisse et long capot
    P.rect(6, 16, 56, 9, B); P.hline(6, 16, 56, BH); P.hline(6, 24, 56, BD);
    P.rect(2, 17, 22, 7, B); P.hline(2, 17, 22, BH);
    for (let x = 8; x < 22; x += 3) P.vline(x, 18, 4, BD);
    P.vline(36, 17, 7, BD); P.px(33, 20, CHROME); P.px(46, 20, CHROME);
    // ailes bombées au-dessus des roues
    for (const wx of [14, 50]) { P.ellipse(wx, 23, 9, 5, NOIR); P.ellipse(wx - 1, 21, 7, 2, '#4a4860'); }
    // roues
    for (const wx of [14, 50]) {
      P.ellipse(wx, 27, 6, 6, '#151320'); P.ellipse(wx, 27, 3, 3, '#8a8898'); P.px(wx, 27, CHROME); P.px(wx - 1, 26, '#f4f2f8');
    }
    P.rect(20, 26, 24, 2, NOIR); P.hline(20, 26, 24, '#4a4860');
    // chromes, phare, calandre, feu arrière
    P.rect(0, 22, 4, 3, CHROME); P.rect(61, 22, 4, 3, CHROME);
    P.rect(1, 16, 3, 7, '#b8b6c4'); for (let y = 17; y < 23; y += 2) P.hline(1, y, 3, '#6a6878');
    P.ellipse(6, 15, 2, 2, CHROME); P.ellipse(6, 15, 1, 1, '#ffe8a0');
    P.rect(61, 17, 2, 3, '#e8434b');
    return { img: c, ax: 32, ay: 33, light: { dx: -26, dy: -18 } };
  }

  function barque() {
    const { c, P } = mk(44, 16);
    P.ellipse(22, 8, 20, 6, '#5a3a24'); P.ellipse(22, 7, 18, 4, '#8a5e3a'); P.ellipse(22, 7, 16, 3, '#6a4630');
    for (const x of [14, 22, 30]) P.rect(x, 4, 2, 7, '#b08a5a');
    P.hline(4, 11, 36, '#3a2418'); P.rect(18, 12, 10, 1, 'rgba(160,205,240,0.4)');
    return { img: c, ax: 22, ay: 12 };
  }

  function echelle() {
    const { c, P } = mk(10, 18);
    P.vline(1, 0, 18, '#3a3646'); P.vline(8, 0, 18, '#3a3646'); P.vline(2, 0, 18, '#6a6878'); P.vline(9, 0, 18, '#6a6878');
    for (let y = 2; y < 18; y += 4) { P.hline(1, y, 8, '#3a3646'); P.hline(1, y - 1, 8, '#6a6878'); }
    return { img: c, ax: 5, ay: 3 };
  }

  function tonneau() {
    const { c, P } = mk(12, 14);
    P.rect(1, 1, 10, 12, '#8a5a34'); P.ellipse(6, 1, 4, 1, '#b07a48');
    for (const y of [3, 9]) P.hline(1, y, 10, '#3a3646');
    P.vline(1, 1, 12, '#b07a48'); P.vline(10, 1, 12, '#5a3a24');
    return { img: c, ax: 6, ay: 13 };
  }

  // ------------------------------------------------------------ sapin de Noël (place)
  function grandSapin(seed) {
    const r = PX.rng(seed);
    const { c, P } = mk(40, 66);
    P.rect(17, 56, 6, 8, '#5a3e2e');
    P.rect(12, 60, 16, 6, '#c9483b'); P.hline(12, 60, 16, '#e8705a'); P.vline(19, 60, 6, '#f2c230');
    const twinkles = [];
    for (let j = 0; j < 56; j++) {
      const tier = j % 14;
      const w = Math.floor(2 + j * 0.3 + tier * 0.55);
      P.rect(20 - w, 2 + j, w * 2, 1, tier > 10 ? '#1d4430' : j % 2 ? '#2b6040' : '#2f6a46');
      if (tier > 9) P.hline(20 - w, 2 + j, 3, '#3f8a56');
      if (r.chance(0.32)) twinkles.push([20 - w + r.int(w * 2), 2 + j]);
    }
    P.px(20, 0, '#ffe680'); P.rect(19, 1, 3, 1, '#ffd34e'); P.px(20, 2, '#ffd34e');
    for (let k = 0; k < 14; k++) { const [x, y] = r.pick(twinkles); P.ellipse(x, y, 1, 1, r.pick(['#d8323a', '#f2c230', '#4a7ae0', '#e8e8f0'])); }
    return { img: c, ax: 20, ay: 65, twinkles, light: { dx: 0, dy: -30 } };
  }

  return {
    FONTE, line, lampadaire, platane, arbreFeuillu, banc, fontaineWallace, colonneMorris, kiosque, tableCafe, chaiseBistrot,
    etalFleurs, boiteBouquiniste, borne, caisses, poubelles, velo, pompe, barriere, pot, lanterneMurale, linge, guirlande, peniche, grandSapin,
    voiture, barque, echelle, tonneau,
  };
})();
