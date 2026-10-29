// =====================================================================
//  decor-montaigu.js — les dessins de Montaigu (épreuve 5) :
//  le restaurant du chef Gusteau, l'église et son clocher, les chalets du marché
//  de Noël, le manège de chevaux de bois, les remparts du vieux château, la boîte
//  aux lettres jaune, les guirlandes de façade et celles tendues entre deux poteaux.
//  Tout est dessiné au pixel près, dans le même style que les autres quartiers.
// =====================================================================
'use strict';

const Montaigu = (() => {
  const S = PX.shade, A = Arendelle, line = Objets.line;
  const NEIGE = '#eef3fb', NEIGE2 = '#d4e0f0', OR = '#e8b54a', OR2 = '#f6d27a';
  function mk(w, h) { const c = PX.canvas(w, h); return { c, P: PX.painter(c) }; }
  const AMPOULES = ['#ff5a5a', '#ffd34e', '#5ad0ff', '#7aff8a', '#ff9af0'];

  // la petite police, en deux fois plus grand (pour les grandes enseignes)
  function texte2x(P, mot, x, y, col, ombre) {
    const tmp = mk(A.largeurTexte(mot), 5);
    A.texte(tmp.P, mot, 0, 0, '#ffffff');
    const d = tmp.c.getContext('2d').getImageData(0, 0, tmp.c.width, 5).data;
    for (let j = 0; j < 5; j++) for (let i = 0; i < tmp.c.width; i++) if (d[(j * tmp.c.width + i) * 4 + 3]) {
      if (ombre) P.rect(x + i * 2 + 1, y + j * 2 + 1, 2, 2, ombre);
      P.rect(x + i * 2, y + j * 2, 2, 2, col);
    }
  }
  const largeur2x = (mot) => A.largeurTexte(mot) * 2;

  // une guirlande lumineuse entre deux points (même à des hauteurs différentes), qui pend un peu au milieu
  // → { img, x, y, ampoules: [[x, y]] } en coordonnées de la carte
  function guirlandeEntre(x1, y1, x2, y2, pend = 6) {
    const x0 = Math.min(x1, x2), y0 = Math.min(y1, y2) - 1, w = Math.abs(x2 - x1) + 1, h = Math.abs(y2 - y1) + pend + 4;
    const { c, P } = mk(w, h), amp = [], n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1)));
    let prec = null;
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = Math.round(x1 + (x2 - x1) * t), y = Math.round(y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * pend);
      if (prec && prec[0] === x && prec[1] === y) continue;
      P.px(x - x0, y - y0, '#3a3044'); prec = [x, y];
      if (k % 6 === 3) { P.px(x - x0, y - y0 + 1, AMPOULES[(k / 6 | 0) % AMPOULES.length]); amp.push([x, y + 1]); }
    }
    return { img: c, x: x0, y: y0, ampoules: amp };
  }

  // une guirlande et une couronne sur la devanture d'un immeuble (Batiments.building) ; renvoie les ampoules (coordonnées de l'image)
  function facadeNoel(b, couronne = true) {
    const P = PX.painter(b.img), W = b.w, y = b.h - 46, amp = [];
    for (let x = 3; x < W - 3; x++) {
      const t = ((x - 3) % 30) / 30, yy = y + Math.round(Math.sin(t * Math.PI) * 3);
      P.px(x, yy, '#3a3044');
      if (x % 5 === 2) { P.px(x, yy + 1, AMPOULES[(x / 5 | 0) % AMPOULES.length]); amp.push([x, yy + 1]); }
    }
    if (couronne) {
      const cx = Math.round(W / 2), cy = b.h - 26;
      P.ellipse(cx, cy, 4, 4, '#1e4a2a'); P.ellipse(cx, cy, 3, 3, '#2f6a3a'); P.ellipse(cx, cy, 1, 1, '#2a2026');
      P.px(cx - 2, cy - 2, '#d8323a'); P.px(cx + 2, cy + 1, '#d8323a'); P.px(cx, cy + 3, '#f2c230'); P.rect(cx - 1, cy + 4, 3, 2, '#d8323a');
    }
    return amp;
  }

  // ------------------------------------------------------------ le restaurant du chef Gusteau
  // un vieil immeuble de pierre (Batiments) dont on redessine le rez-de-chaussée : devanture bleu nuit,
  // grandes lettres dorées, deux vitrines où l'on voit les tables aux chandelles, une porte vitrée au milieu
  function restaurant() {
    const b = Batiments.building({ w: 168, facade: 'creme', style: 'ancien', etages: 2, boutique: 'porte', volets: '#2f4a5a', seed: 505, cheminees: 2 });
    const P = PX.painter(b.img), W = b.w, H = b.h, y0 = H - 46;
    const BLEU = '#1c3048', BLEU2 = '#2a4464', BLEUS = '#101c2c';
    P.rect(0, y0, W, 46, BLEU);
    P.rect(0, y0, 3, 46, '#cdbf9e'); P.rect(W - 3, y0, 3, 46, '#a89a7a');
    // l'enseigne : bandeau doré, GUSTEAU en grandes lettres, une petite toque à chaque bout
    P.rect(3, y0, W - 6, 14, BLEUS); P.hline(3, y0, W - 6, OR); P.hline(3, y0 + 13, W - 6, OR);
    for (let x = 4; x < W - 4; x += 3) { P.px(x, y0 + 1, '#a8742e'); P.px(x, y0 + 12, '#a8742e'); }
    const mot = 'GUSTEAU', tx = Math.round(W / 2 - largeur2x(mot) / 2);
    texte2x(P, mot, tx, y0 + 2, OR2, '#6a4a1a');
    const toque = (x, y) => { P.rect(x, y + 4, 7, 3, '#f4f2ec'); P.ellipse(x + 3, y + 2, 4, 3, '#ffffff'); P.hline(x, y + 6, 7, '#c8c4bc'); };
    toque(tx - 14, y0 + 2); toque(tx + largeur2x(mot) + 6, y0 + 2);
    // les deux vitrines : la salle chaude, une table aux chandelles, un client de dos
    const vitrine = (vx, vw, sens) => {
      const vy = y0 + 18, vh = 22;
      P.rect(vx - 2, vy - 2, vw + 4, vh + 4, OR); P.rect(vx - 1, vy - 1, vw + 2, vh + 2, BLEUS);
      P.vgrad(vx, vy, vw, vh, '#f6c47a', '#d8803a');
      P.rect(vx, vy, vw, 6, '#8a2a2a'); for (let x = vx + 2; x < vx + vw; x += 6) P.ellipse(x, vy + 3, 1, 1, '#e8b54a'); // le papier peint et ses appliques
      for (let k = 0; k < 2; k++) {
        const cx = vx + Math.round(vw * (k ? 0.72 : 0.28));
        P.ellipse(cx, vy + 15, 6, 2, '#ffffff'); P.rect(cx - 6, vy + 15, 13, 5, '#f4f2ec'); P.hline(cx - 6, vy + 19, 13, '#d8d4cc');
        P.vline(cx, vy + 10, 4, '#e8b54a'); P.px(cx, vy + 9, '#fff4b0'); P.px(cx, vy + 8, '#ffd27a'); // la chandelle
      }
      P.ellipse(vx + (sens > 0 ? vw - 5 : 5), vy + 14, 3, 3, '#3a2a3a'); P.rect(vx + (sens > 0 ? vw - 8 : 2), vy + 16, 7, 6, '#4a2a3a'); // un client de dos
      for (let k = 0; k < vh; k++) if (k % 8 < 2) P.px(vx + vw - 2 - (k % 8) - Math.floor(k / 8) * 3, vy + k, 'rgba(255,255,255,0.35)');
      P.vline(vx + (vw >> 1), vy, vh, OR); P.hline(vx, vy + 11, vw, 'rgba(232,181,74,0.6)');
      b.lights.push({ x: vx + vw / 2, y: vy + vh / 2, r: 38, k: 'shop' });
    };
    const pw = 22, px = Math.round(W / 2 - pw / 2);
    vitrine(10, px - 22, -1); vitrine(px + pw + 12, W - (px + pw + 12) - 10, 1);
    // la porte vitrée à deux battants, sa couronne et ses deux lanternes
    P.rect(px - 2, y0 + 15, pw + 4, 31, OR); P.rect(px, y0 + 17, pw, 29, BLEU2);
    for (const dx of [2, 12]) { P.rect(px + dx, y0 + 19, 8, 20, '#ffcf72'); P.dither(px + dx, y0 + 19, 8, 20, '#fff1bb', 5); P.hline(px + dx, y0 + 28, 8, BLEU2); }
    P.vline(px + 11, y0 + 17, 29, BLEUS); P.px(px + 9, y0 + 31, OR); P.px(px + 13, y0 + 31, OR);
    P.ellipse(px + 11, y0 + 22, 4, 4, '#1e4a2a'); P.ellipse(px + 11, y0 + 22, 3, 3, '#2f6a3a'); P.ellipse(px + 11, y0 + 22, 1, 1, BLEU2);
    P.px(px + 9, y0 + 20, '#d8323a'); P.px(px + 13, y0 + 23, '#d8323a'); P.rect(px + 10, y0 + 26, 3, 2, '#d8323a');
    for (const lx of [px - 7, px + pw + 4]) { P.rect(lx, y0 + 20, 4, 6, '#2a2632'); P.rect(lx + 1, y0 + 21, 2, 4, '#ffd27a'); P.hline(lx - 1, y0 + 19, 6, '#2a2632'); b.lights.push({ x: lx + 2, y: y0 + 23, r: 26, k: 'lamp' }); }
    P.rect(px - 4, H - 3, pw + 8, 3, '#8a8478'); P.hline(px - 4, H - 3, pw + 8, '#b8b0a0'); // la marche
    // le store rouge au-dessus des vitrines, couvert de neige, et la guirlande
    Batiments.awning(P, 6, y0 + 14, px - 14, '#a8343a', '#f2e4c8'); Batiments.awning(P, px + pw + 8, y0 + 14, W - (px + pw + 8) - 6, '#a8343a', '#f2e4c8');
    P.hline(6, y0 + 14, px - 14, NEIGE); P.hline(px + pw + 8, y0 + 14, W - (px + pw + 8) - 6, NEIGE);
    b.ampoules = [];
    for (let x = 4; x < W - 4; x++) { const yy = y0 - 2 + Math.round(Math.sin(((x - 4) % 28) / 28 * Math.PI) * 2); P.px(x, yy, '#3a3044'); if (x % 4 === 1) { P.px(x, yy + 1, AMPOULES[(x >> 2) % 5]); b.ampoules.push([x, yy + 1]); } }
    // l'enseigne en potence, avec la toque du chef
    const ex = 6, ey = y0 - 30;
    P.hline(ex, ey, 12, '#2a2632'); P.px(ex + 12, ey - 1, '#2a2632');
    P.rect(ex + 1, ey + 1, 14, 14, BLEUS); P.rect(ex + 2, ey + 2, 12, 12, BLEU); P.hline(ex + 2, ey + 2, 12, OR); P.hline(ex + 2, ey + 13, 12, OR);
    toque(ex + 4, ey + 4);
    b.porte = { x: px, w: pw };
    return b;
  }

  // ------------------------------------------------------------ l'église et son clocher pointu
  function eglise() {
    const W = 120, H = 236, base = H - 1, { c, P } = mk(W, H), r = PX.rng(91);
    const PIERRE = '#ded2b6', PIERRE2 = '#c4b696', PIERRE3 = '#a8987a', ARDOISE = '#4a5068', ARDOISE2 = '#5e6682';
    const lumieres = [], ampoules = [];
    // la nef : un grand pignon de pierre
    const ny = base - 92;
    P.rect(8, ny, W - 16, 92, PIERRE); for (let y = ny + 4; y < base; y += 6) P.hline(8, y, W - 16, PIERRE2);
    for (let y = ny + 4, k = 0; y < base; y += 6, k++) for (let x = 8 + (k % 2) * 6; x < W - 8; x += 12) P.vline(x, y - 5, 5, PIERRE2);
    for (let j = 0; j < 30; j++) { const w = Math.round((W - 16) / 2 * (j / 30)); P.hline(W / 2 - w, ny - 30 + j, w * 2, ARDOISE); }
    for (let j = 0; j < 30; j += 3) { const w = Math.round((W - 16) / 2 * (j / 30)); P.hline(W / 2 - w, ny - 30 + j, w * 2, ARDOISE2); }
    for (let j = 0; j < 30; j++) { const w = Math.round((W - 16) / 2 * (j / 30)); P.px(W / 2 - w, ny - 31 + j, NEIGE); P.px(W / 2 + w - 1, ny - 31 + j, NEIGE); }
    // la rosace (vitrail éclairé) et les deux hautes fenêtres
    const rx = W / 2, ry = ny + 16;
    P.ellipse(rx, ry, 9, 9, PIERRE3); P.ellipse(rx, ry, 8, 8, '#3a2a5a');
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; P.ellipse(Math.round(rx + Math.cos(a) * 5), Math.round(ry + Math.sin(a) * 5), 2, 2, ['#e85a5a', '#5a8ae8', '#f2c230', '#5ac87a'][k % 4]); }
    P.ellipse(rx, ry, 2, 2, '#fff1bb'); lumieres.push([rx, ry, 30, 'win']);
    for (const fx of [24, W - 30]) {
      P.rect(fx, ny + 30, 7, 22, PIERRE3); P.rect(fx + 1, ny + 31, 5, 21, '#3a2a5a'); P.ellipse(fx + 3, ny + 31, 3, 2, '#3a2a5a');
      for (let y = ny + 32; y < ny + 52; y += 3) P.hline(fx + 1, y, 5, ['#e85a5a', '#5a8ae8', '#f2c230'][((y - ny) / 3 | 0) % 3]);
      lumieres.push([fx + 3, ny + 42, 22, 'win']);
    }
    // le grand portail en bois, sa voussure et sa couronne
    const dx = W / 2 - 12, dy = base - 34;
    for (let k = 0; k < 3; k++) { P.rect(dx - 3 + k, dy - 3 + k, 30 - k * 2, 37 - k, [PIERRE3, PIERRE2, PIERRE3][k]); P.ellipse(W / 2, dy + k, 15 - k, 9 - k, [PIERRE3, PIERRE2, PIERRE3][k]); }
    P.rect(dx, dy, 24, 34, '#5a3a24'); P.ellipse(W / 2, dy, 12, 7, '#5a3a24');
    for (let x = dx + 3; x < dx + 24; x += 4) P.vline(x, dy - 4, 38, '#4a2e1c');
    P.vline(W / 2, dy - 6, 40, '#3a2418'); P.rect(W / 2 - 4, dy + 16, 2, 2, OR); P.rect(W / 2 + 2, dy + 16, 2, 2, OR);
    P.ellipse(W / 2, dy - 2, 5, 5, '#1e4a2a'); P.ellipse(W / 2, dy - 2, 3, 3, '#5a3a24'); P.rect(W / 2 - 1, dy + 3, 3, 2, '#d8323a');
    P.rect(dx - 6, base - 2, 36, 3, '#a8a090'); P.hline(dx - 6, base - 2, 36, NEIGE);
    // le clocher : une tour carrée, l'horloge, les abat-sons, puis la flèche d'ardoise
    const tx = W / 2 - 14, ty = 70, tw = 28;
    P.rect(tx, ty, tw, ny - 30 - ty + 6, PIERRE); for (let y = ty + 3; y < ny - 24; y += 6) P.hline(tx, y, tw, PIERRE2);
    P.vline(tx, ty, ny - 24 - ty, '#f0e6cc'); P.vline(tx + tw - 1, ty, ny - 24 - ty, PIERRE3);
    P.ellipse(W / 2, ty + 34, 7, 7, PIERRE3); P.ellipse(W / 2, ty + 34, 6, 6, '#f4f0e0'); P.vline(W / 2, ty + 30, 4, '#1d1626'); P.hline(W / 2, ty + 34, 3, '#1d1626');
    for (const bx of [tx + 5, tx + tw - 11]) { P.rect(bx, ty + 8, 6, 14, '#2a2632'); P.ellipse(bx + 3, ty + 8, 3, 2, '#2a2632'); for (let y = ty + 10; y < ty + 22; y += 3) P.hline(bx, y, 6, '#5a5668'); }
    for (let j = 0; j < 70; j++) { const w = Math.max(1, Math.round((tw / 2 + 3) * (j / 70))); P.hline(W / 2 - w, j, w * 2, j % 4 === 0 ? ARDOISE2 : ARDOISE); P.px(W / 2 - w, j, '#7a84a0'); }
    P.rect(tx - 3, ty - 2, tw + 6, 4, PIERRE2); P.hline(tx - 3, ty - 2, tw + 6, NEIGE);
    P.vline(W / 2, 0, 6, OR); P.hline(W / 2 - 2, 2, 5, OR); // la croix dorée
    // une guirlande d'ampoules blanches le long du toit de la nef
    for (let j = 0; j < 30; j += 3) { const w = Math.round((W - 16) / 2 * (j / 30)); for (const x of [W / 2 - w, W / 2 + w - 1]) { P.px(x, ny - 29 + j, '#fff4c8'); ampoules.push([x, ny - 29 + j]); } }
    return { img: c, ax: W / 2, ay: base, lumieres, ampoules, porteY: base };
  }

  // ------------------------------------------------------------ un chalet du marché de Noël
  // type : 'chocolat' | 'marrons' | 'crepes' | 'santons' | 'jouets'
  function chalet(type, mot, couleur = '#8a5a32') {
    const W = 58, H = 56, base = H - 1, { c, P } = mk(W, H), r = PX.rng(mot.length * 7 + type.length);
    const BOIS = couleur, BOIS2 = S(couleur, -0.25), BOIS3 = S(couleur, 0.2), lumieres = [], ampoules = [];
    // les murs en planches
    P.rect(4, 18, W - 8, base - 18, BOIS); for (let x = 6; x < W - 4; x += 4) P.vline(x, 18, base - 18, BOIS2);
    // le toit à deux pans, couvert de neige
    for (let j = 0; j < 16; j++) { const w = Math.round(6 + (W / 2 - 2) * (j / 16)); P.hline(W / 2 - w, 4 + j, w * 2, j < 3 ? NEIGE : j % 3 ? '#6a3a24' : '#5a2e1c'); }
    for (let j = 0; j < 16; j++) { const w = Math.round(6 + (W / 2 - 2) * (j / 16)); P.px(W / 2 - w, 4 + j, NEIGE); P.px(W / 2 + w - 1, 4 + j, NEIGE); }
    for (let x = 2; x < W - 2; x++) P.rect(x, 19, 1, 1 + (Math.abs(Math.sin(x * 0.7)) * 2 | 0), NEIGE);
    // le comptoir ouvert, éclairé, et ses marchandises
    const cy = 26, ch = 16;
    P.rect(8, cy, W - 16, ch, '#f6c47a'); P.vgrad(8, cy, W - 16, ch, '#ffe0a0', '#e89a4a');
    for (let x = 10; x < W - 10; x += 7) {
      if (type === 'chocolat') { P.rect(x, cy + 9, 4, 5, '#f4efe6'); P.rect(x, cy + 9, 4, 1, '#6a3a24'); P.px(x + 4, cy + 11, '#f4efe6'); P.px(x + 1, cy + 7, '#ffffff'); }
      else if (type === 'marrons') { P.trap(x, 5, x + 1, 2, cy + 8, 6, '#e8dcc0'); P.ellipse(x + 2, cy + 8, 2, 1, '#6a3a24'); P.px(x + 1, cy + 7, '#8a4a2a'); }
      else if (type === 'crepes') { for (let k = 0; k < 3; k++) P.ellipse(x + 2, cy + 12 - k, 3, 1, k % 2 ? '#e8b060' : '#f2c878'); P.px(x + 2, cy + 9, '#7a3a24'); }
      else if (type === 'santons') { P.ellipse(x + 2, cy + 8, 1, 1, '#f0c8a0'); P.rect(x + 1, cy + 9, 3, 5, r.pick(['#3a6aa8', '#c8343a', '#4f8a5a', '#e8b54a'])); }
      else { P.rect(x, cy + 9, 5, 4, r.pick(['#c8343a', '#3a6aa8', '#f2c230', '#4f8a5a'])); P.px(x + 1, cy + 13, '#2a2632'); P.px(x + 3, cy + 13, '#2a2632'); }
    }
    P.rect(6, cy + ch, W - 12, 4, BOIS3); P.hline(6, cy + ch, W - 12, S(BOIS3, 0.2)); P.hline(6, cy + ch + 3, W - 12, BOIS2);
    lumieres.push([W / 2, cy + 8, 34, 'shop']);
    // l'enseigne
    const tw = A.largeurTexte(mot) + 6, tx = Math.round(W / 2 - tw / 2);
    P.rect(tx, 10, tw, 8, '#2a1e18'); P.hline(tx, 10, tw, OR); A.texte(P, mot, tx + 3, 11, OR2);
    // les ampoules sous l'avant-toit
    for (let x = 6; x < W - 6; x += 4) { const y = 21 + Math.round(Math.sin(x / W * Math.PI) * 2); P.px(x, y, AMPOULES[(x >> 2) % 5]); ampoules.push([x, y]); }
    // un petit sapin au coin
    P.trap(W - 7, 1, W - 11, 9, 32, 12, '#2f6a3a'); P.rect(W - 8, 44, 2, 3, '#5a3a24'); P.px(W - 7, 31, '#f2c230');
    return { img: c, ax: W / 2, ay: base, lumieres, ampoules };
  }

  // ------------------------------------------------------------ le manège de chevaux de bois (animé)
  function cheval(col) {
    const { c, P } = mk(12, 10);
    P.rect(2, 3, 7, 4, col); P.rect(8, 1, 3, 3, col); P.px(10, 3, S(col, -0.3)); P.rect(7, 0, 2, 2, '#e8b54a'); // le corps, la tête, la crinière
    P.vline(3, 7, 3, col); P.vline(7, 7, 3, col); P.px(1, 4, '#e8b54a'); P.px(0, 5, '#e8b54a'); // les pattes, la queue
    P.rect(4, 2, 3, 2, '#c8343a'); P.px(9, 2, '#1d1626'); // la selle, l'œil
    return PX.outline(c, '#1d1626');
  }
  let chevaux = null;
  function dessinManege(g, x, y, t) {
    if (!chevaux) { chevaux = ['#f4f2ec', '#e8b060', '#9ac8f0', '#f4f2ec', '#c8a0e0', '#e8e0a0'].map(cheval); }
    const P = PX.painter(g.canvas);
    const rx = 34, ry = 11, tour = t * 0.7;
    // la plateforme
    P.ellipse(x, y - 2, rx + 2, ry + 2, '#5a3a24'); P.ellipse(x, y - 4, rx, ry, '#c8a070'); P.ellipse(x, y - 4, rx - 4, ry - 3, '#b08858');
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + tour; P.px(Math.round(x + Math.cos(a) * (rx - 1)), Math.round(y - 4 + Math.sin(a) * (ry - 1)), '#8a6038'); }
    const haut = y - 58;
    const chevauxPoses = [0, 1, 2, 3, 4, 5].map((k) => { const a = tour + k / 6 * Math.PI * 2; return { k, a, s: Math.sin(a) }; }).sort((p, q) => p.s - q.s);
    const poser = (p) => {
      const cx = Math.round(x + Math.cos(p.a) * 25), cy = Math.round(y - 12 + p.s * 7), bob = Math.round(Math.sin(t * 3 + p.k) * 3);
      g.fillStyle = '#e8b54a'; g.fillRect(cx, haut + 14, 1, cy - haut - 14 + bob);
      const im = chevaux[p.k], img = Math.cos(p.a) > 0 ? im : null;
      if (img) g.drawImage(img, cx - 6, cy - 10 + bob); else { g.save(); g.translate(cx + 6, 0); g.scale(-1, 1); g.drawImage(im, 0, cy - 10 + bob); g.restore(); }
    };
    chevauxPoses.filter((p) => p.s < 0).forEach(poser);
    // le mât central, décoré
    g.fillStyle = '#e8b54a'; g.fillRect(x - 2, haut + 10, 4, y - haut - 14); g.fillStyle = '#c8343a'; for (let yy = haut + 12; yy < y - 6; yy += 6) g.fillRect(x - 2, yy, 4, 2);
    chevauxPoses.filter((p) => p.s >= 0).forEach(poser);
    // le toit rayé rouge et blanc, sa frange et ses ampoules
    for (let j = 0; j < 14; j++) {
      const w = Math.round(6 + (rx + 4 - 6) * (j / 13));
      for (let i = -w; i <= w; i++) { g.fillStyle = Math.floor((i + 100 + tour * 6) / 5) % 2 ? '#c8343a' : '#f4f0e6'; g.fillRect(x + i, haut + j, 1, 1); }
    }
    for (let i = -rx - 4; i <= rx + 4; i++) { g.fillStyle = (i + 100) % 6 < 3 ? '#e8b54a' : '#a8742e'; g.fillRect(x + i, haut + 14, 1, (i + 100) % 6 < 3 ? 3 : 2); }
    for (let k = 0; k < 12; k++) { const i = -rx - 2 + k * ((rx * 2 + 4) / 11); g.fillStyle = Math.floor(t * 4 + k) % 2 ? '#fff4b0' : AMPOULES[k % 5]; g.fillRect(Math.round(x + i), haut + 17, 1, 1); }
    g.fillStyle = '#e8b54a'; g.fillRect(x - 1, haut - 8, 2, 8); g.fillStyle = '#c8343a'; g.fillRect(x + 1, haut - 8, 6, 3); // le fanion
    P.ellipse(x, haut + 1, 4, 2, '#e8b54a');
  }

  // ------------------------------------------------------------ les remparts du vieux château (au fond, peints sur le sol)
  function remparts(P, W, y0, h, r) {
    // le ciel et les arbres derrière le mur
    P.vgrad(0, 0, W, y0 + 10, '#0e1430', '#2a3a6a');
    for (let k = 0; k < 120; k++) P.px(r.int(W), r.int(y0), r.chance(0.2) ? '#ffffff' : '#a8b8e8');
    P.ellipse(W - 120, 18, 9, 9, '#f4f0dc'); P.ellipse(W - 116, 16, 8, 8, '#1a2448'); // le croissant de lune
    for (let x = -10; x < W; x += 14 + r.int(10)) { const hh = 14 + r.int(16); P.ellipse(x, y0 + 4 - hh / 2, 10 + r.int(6), hh, r.pick(['#1e3a2e', '#24402e', '#1a3228'])); P.ellipse(x - 2, y0 - hh + 6, 6, 4, '#d8e0ee'); }
    // le mur, ses créneaux et une tour ronde
    const PIERRE = '#8a8070', PIERRE2 = '#a09684', PIERRE3 = '#6a6254';
    P.rect(0, y0, W, h, PIERRE);
    for (let y = y0 + 3, k = 0; y < y0 + h; y += 5, k++) { P.hline(0, y, W, PIERRE3); for (let x = (k % 2) * 6; x < W; x += 12) P.vline(x, y - 4, 4, PIERRE3); }
    for (let x = 0; x < W; x += 10) { P.rect(x, y0 - 6, 6, 6, PIERRE2); P.hline(x, y0 - 7, 6, NEIGE); P.hline(x, y0 - 6, 6, '#ffffff'); }
    P.hline(0, y0, W, NEIGE);
    for (const tx of [180, W - 260]) {
      P.rect(tx, y0 - 34, 46, h + 34, PIERRE2); P.vline(tx, y0 - 34, h + 34, '#b4aa96'); P.vline(tx + 45, y0 - 34, h + 34, PIERRE3);
      for (let y = y0 - 30; y < y0 + h; y += 5) P.hline(tx, y, 46, PIERRE);
      for (let x = tx; x < tx + 46; x += 9) { P.rect(x, y0 - 40, 6, 6, PIERRE2); P.hline(x, y0 - 41, 6, '#ffffff'); }
      P.rect(tx + 20, y0 - 18, 5, 9, '#1d1626'); P.ellipse(tx + 22, y0 - 18, 2, 2, '#1d1626'); P.rect(tx + 21, y0 - 16, 3, 6, '#ffcf72'); // une meurtrière éclairée
    }
  }

  // ------------------------------------------------------------ petits objets
  function boitePoste() { // la boîte aux lettres jaune
    const { c, P } = mk(10, 22), base = 21;
    P.rect(4, 10, 2, 12, '#3a3646'); P.rect(1, 1, 8, 10, '#e8b820'); P.ellipse(5, 1, 4, 2, '#e8b820'); P.hline(1, 1, 8, '#f8d850');
    P.hline(2, 4, 6, '#2a2632'); P.rect(3, 6, 4, 3, '#3a5aa8'); P.ellipse(5, 0, 4, 1, NEIGE);
    return { img: c, ax: 5, ay: base };
  }
  function panneauVille(nom) { // le panneau d'entrée de ville, blanc bordé de rouge
    const w = A.largeurTexte(nom) + 12, { c, P } = mk(w, 26);
    P.rect(0, 0, w, 15, '#d8323a'); P.rect(2, 2, w - 4, 11, '#f4f4f8'); A.texte(P, nom, 6, 5, '#1d1626');
    P.rect(4, 15, 2, 11, '#8a8a9a'); P.rect(w - 6, 15, 2, 11, '#8a8a9a'); P.hline(0, 0, w, NEIGE);
    return { img: c, ax: w >> 1, ay: 25 };
  }
  function chevalet(lignes) { // l'ardoise du menu, devant le restaurant
    const { c, P } = mk(22, 26), base = 25;
    line(P, 3, base, 7, 2, '#6a4428'); line(P, 18, base, 14, 2, '#6a4428');
    P.rect(4, 3, 14, 15, '#6a4428'); P.rect(5, 4, 12, 13, '#2a3a32');
    lignes.forEach((l, k) => { for (let x = 0; x < l; x++) if ((x * 7 + k) % 5) P.px(6 + x, 6 + k * 3, '#e8e4dc'); });
    P.hline(4, 3, 14, NEIGE);
    return { img: c, ax: 11, ay: base };
  }

  return { texte2x, largeur2x, guirlandeEntre, facadeNoel, restaurant, eglise, chalet, dessinManege, remparts, boitePoste, panneauVille, chevalet, AMPOULES };
})();
