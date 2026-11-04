// =====================================================================
//  decor-montaigu.js — les dessins de Montaigu (épreuve 5) :
//  le restaurant du chef Gusteau, l'église Saint-Jean-Baptiste et sa tour carrée, la tour
//  ronde des remparts du château, les chalets du marché de Noël, le manège de chevaux de bois,
//  les lanternes, les bornes de granit, la « carotte » du tabac, Flash McQueen, la boîte
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
    const b = Batiments.building({ w: 168, facade: 'blanc', style: 'ancien', etages: 2, boutique: 'porte', volets: '#e8eaee', seed: 505, cheminees: 2, ardoise: true, neige: true, granit: true });
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

  // ------------------------------------------------------------ l'église Saint-Jean-Baptiste de Montaigu
  // néogothique, en granit gris-beige : pas de flèche, une grosse tour carrée sur la façade, en deux étages
  // (une galerie à balustrade et ses gargouilles à mi-hauteur, puis l'étage des cloches avec l'horloge),
  // de petits pinacles aux angles et un toit très bas ; de chaque côté, les bas-côtés et leurs contreforts
  function eglise() {
    const W = 132, H = 182, base = H - 1, { c, P } = mk(W, H);
    const G = '#b8ae98', G2 = '#a0967f', G3 = '#857b66', CLAIR = '#d8cfba', ARD = '#4a5068', ARD2 = '#5e6682';
    const lumieres = [], ampoules = [];
    const appareil = (x, y, w, h) => { // un mur de granit en assises régulières
      P.rect(x, y, w, h, G);
      for (let yy = y + 5, k = 0; yy < y + h; yy += 6, k++) { P.hline(x, yy, w, G2); for (let xx = x + (k % 2) * 5; xx < x + w; xx += 10) P.vline(xx, yy - 5, 5, G2); }
    };
    const ogive = (x, y, w, h, col) => { P.rect(x, y + Math.ceil(w / 2), w, h - Math.ceil(w / 2), col); for (let j = 0; j < Math.ceil(w / 2) + 1; j++) { const d = Math.round(Math.sqrt(Math.max(0, (w / 2) ** 2 - (w / 2 - j) ** 2)) * 0.9); P.hline(Math.round(x + w / 2 - d), y + j, d * 2, col); } };
    const vitrail = (x, y, w, h) => {
      ogive(x - 1, y - 1, w + 2, h + 1, CLAIR); ogive(x, y, w, h, '#3a2a5a');
      for (let yy = y + 3; yy < y + h; yy += 3) P.hline(x + 1, yy, w - 2, ['#e85a5a', '#5a8ae8', '#f2c230', '#5ac87a'][((yy - y) / 3 | 0) % 4]);
      P.vline(x + (w >> 1), y + 2, h - 2, '#2a1e44'); lumieres.push([x + w / 2, y + h / 2, 22, 'win']);
    };
    // les bas-côtés, de part et d'autre de la tour : murs, toits d'ardoise en appentis, contreforts et pinacles
    for (const [x0, sens] of [[4, 1], [W - 46, -1]]) {
      const w = 42, hmur = 58, y0 = base - hmur;
      appareil(x0, y0, w, hmur);
      for (let j = 0; j < 22; j++) { const yy = y0 - 22 + j, l = Math.round(w * (j + 1) / 22); P.hline(sens > 0 ? x0 + w - l : x0, yy, l, j % 3 ? ARD : ARD2); }
      for (let j = 0; j < 22; j++) { const l = Math.round(w * (j + 1) / 22); P.px(sens > 0 ? x0 + w - l : x0 + l - 1, y0 - 22 + j, NEIGE); }
      vitrail(x0 + 15, y0 + 12, 12, 26);
      for (const bx of [x0, x0 + w - 5]) { // les contreforts et leur pinacle
        P.rect(bx, y0 - 6, 5, hmur + 6, G2); P.vline(bx, y0 - 6, hmur + 6, CLAIR); P.vline(bx + 4, y0 - 6, hmur + 6, G3);
        for (let j = 0; j < 8; j++) P.hline(bx + Math.floor(j / 3), y0 - 14 + j, 5 - 2 * Math.floor(j / 3), G2);
        P.px(bx + 2, y0 - 15, NEIGE);
      }
    }
    // la tour : l'étage du bas (le portail), la galerie, puis l'étage des cloches, plus étroit
    const tx = 44, tw = 44, galY = 74, hautY = 22;
    appareil(tx, galY, tw, base - galY);
    P.vline(tx, galY, base - galY, CLAIR); P.vline(tx + tw - 1, galY, base - galY, G3);
    for (const bx of [tx - 3, tx + tw - 2]) { P.rect(bx, galY + 4, 5, base - galY - 4, G2); P.vline(bx, galY + 4, base - galY - 4, CLAIR); }
    // le portail : voussures en ogive, portes rouges, un petit tympan
    const px0 = W / 2 - 11, py0 = base - 40;
    for (let k = 0; k < 3; k++) ogive(px0 - 4 + k * 2, py0 - 6 + k * 2, 30 - k * 4, 46 - k * 2, [G3, CLAIR, G2][k]);
    ogive(px0, py0, 22, 40, '#8a2a2e');
    P.vline(W / 2, py0 + 12, 28, '#5a1a1e'); for (let y = py0 + 16; y < base; y += 6) { P.hline(px0 + 2, y, 8, '#a8343a'); P.hline(W / 2 + 2, y, 8, '#a8343a'); }
    P.rect(W / 2 - 4, py0 + 24, 2, 2, OR); P.rect(W / 2 + 2, py0 + 24, 2, 2, OR);
    P.ellipse(W / 2, py0 + 6, 5, 4, '#3a2a5a'); P.ellipse(W / 2, py0 + 6, 2, 2, '#f2c230'); lumieres.push([W / 2, py0 + 6, 14, 'win']);
    P.rect(px0 - 8, base - 2, 38, 3, '#a8a090'); P.hline(px0 - 8, base - 2, 38, NEIGE);
    vitrail(W / 2 - 6, galY + 14, 12, 34); // la grande verrière au-dessus du portail
    // la galerie à balustrade, qui déborde un peu, et ses gargouilles aux angles
    P.rect(tx - 5, galY - 4, tw + 10, 5, CLAIR); P.hline(tx - 5, galY, tw + 10, G3);
    P.rect(tx - 5, galY - 12, tw + 10, 8, G2); for (let x = tx - 3; x < tx + tw + 4; x += 3) P.rect(x, galY - 11, 2, 6, CLAIR);
    P.hline(tx - 5, galY - 13, tw + 10, CLAIR); P.hline(tx - 5, galY - 14, tw + 10, NEIGE);
    for (const gx of [tx - 9, tx + tw + 5]) { P.rect(gx, galY - 3, 4, 2, G3); P.px(gx + (gx < tx ? 0 : 3), galY - 1, G3); }
    // l'étage des cloches : deux longues baies à abat-sons, l'horloge au-dessus
    const ux = tx + 6, uw = tw - 12;
    appareil(ux, hautY, uw, galY - 12 - hautY);
    P.vline(ux, hautY, galY - 12 - hautY, CLAIR); P.vline(ux + uw - 1, hautY, galY - 12 - hautY, G3);
    for (const bx of [ux + 6, ux + uw - 12]) { ogive(bx, hautY + 22, 6, 26, '#2a2632'); for (let y = hautY + 28; y < hautY + 47; y += 3) P.hline(bx, y, 6, '#5a5668'); }
    P.ellipse(W / 2, hautY + 12, 7, 7, G3); P.ellipse(W / 2, hautY + 12, 6, 6, '#f4f0e0');
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; P.px(Math.round(W / 2 + Math.cos(a) * 5), Math.round(hautY + 12 + Math.sin(a) * 5), '#8a8270'); }
    P.vline(W / 2, hautY + 8, 4, '#1d1626'); P.hline(W / 2, hautY + 12, 4, '#1d1626'); lumieres.push([W / 2, hautY + 12, 18, 'win']);
    // la corniche, le toit très bas et les quatre petits pinacles des angles
    P.rect(ux - 3, hautY - 4, uw + 6, 4, CLAIR); P.hline(ux - 3, hautY - 1, uw + 6, G3);
    for (let j = 0; j < 7; j++) P.hline(ux + j * 2, hautY - 5 - j, uw - j * 4, j % 2 ? ARD2 : ARD);
    for (let j = 0; j < 7; j++) { P.px(ux + j * 2, hautY - 5 - j, NEIGE); P.px(ux + uw - 1 - j * 2, hautY - 5 - j, NEIGE); }
    for (const px of [ux - 3, ux + uw]) { P.rect(px, hautY - 12, 3, 8, G2); P.vline(px, hautY - 12, 8, CLAIR); P.px(px + 1, hautY - 14, G2); P.px(px + 1, hautY - 15, NEIGE); }
    P.vline(W / 2, hautY - 20, 8, OR); P.hline(W / 2 - 2, hautY - 18, 5, OR); // la croix
    // une guirlande d'ampoules blanches sur la galerie
    for (let x = tx - 4; x < tx + tw + 5; x += 3) { P.px(x, galY - 3, '#fff4c8'); ampoules.push([x, galY - 3]); }
    return { img: c, ax: W / 2, ay: base, lumieres, ampoules, porteY: base };
  }

  // ------------------------------------------------------------ les restes des remparts du château : une tour ronde et trapue,
  // sans toit (de l'herbe et de la neige dessus), en moellons de granit gris, et un bout de courtine
  function tourRemparts() {
    const W = 120, H = 112, base = H - 1, { c, P } = mk(W, H), r = PX.rng(1215);
    const M1 = '#8a8478', M2 = '#9c9688', M3 = '#6c675d', M4 = '#b2ac9e';
    const moellons = (x, y, w, h) => { P.rect(x, y, w, h, M1); for (let k = 0; k < w * h / 14; k++) { const mx = x + r.int(w - 3), my = y + r.int(h - 2); P.rect(mx, my, 3 + r.int(3), 2, r.pick([M2, M3, M4, M1])); } };
    // la courtine, à droite de la tour
    moellons(56, base - 62, 64, 62); P.hline(56, base - 62, 64, M4);
    for (let x = 56; x < W; x++) { const e = 2 + Math.round(Math.abs(Math.sin(x * 0.3)) * 2); P.rect(x, base - 63 - e, 1, e, '#4a6a3a'); P.px(x, base - 64 - e, NEIGE); }
    // la tour ronde : on l'ombre comme un cylindre
    const cx = 34, rw = 30, ty = base - 84;
    moellons(cx - rw, ty, rw * 2, 84);
    for (let x = -rw; x < rw; x++) { const t = (x + rw) / (rw * 2), ombre = t > 0.62 ? (t - 0.62) * 0.9 : t < 0.12 ? (0.12 - t) * 1.5 : 0; if (ombre) { P.g.globalAlpha = ombre; P.vline(cx + x, ty, 84, '#2a2632'); P.g.globalAlpha = 1; } }
    for (let x = -rw; x < rw; x++) P.px(cx + x, base - Math.round(Math.sqrt(rw * rw - x * x) / rw * 3), M3); // le pied arrondi
    P.ellipse(cx, ty, rw, 6, '#3f6a3a'); P.ellipse(cx, ty - 1, rw - 2, 4, '#4f7a44'); P.ellipse(cx - 2, ty - 2, rw - 6, 3, NEIGE);
    for (let k = 0; k < 10; k++) P.px(cx - rw + 2 + r.int(rw * 2 - 4), ty + 1 + r.int(2), '#2f5a3a');
    // deux meurtrières, dont une éclairée
    P.rect(cx - 2, ty + 26, 3, 12, '#1d1626'); P.rect(cx + 12, ty + 44, 3, 10, '#1d1626'); P.rect(cx + 13, ty + 46, 1, 6, '#ffcf72');
    // du lierre sur la courtine
    for (let k = 0; k < 60; k++) P.ellipse(60 + r.int(26), base - 10 - r.int(46), 1 + r.int(2), 1, r.pick(['#2f5d3a', '#3f7a45', '#2a4a33']));
    return { img: c, ax: 0, ay: base, lumieres: [[cx + 13, ty + 49, 16, 'win']] };
  }

  // ------------------------------------------------------------ les petits détails de la rue
  function lanterne() { // une lanterne de fer forgé noire, accrochée au mur
    const { c, P } = mk(9, 14), base = 13;
    P.hline(0, 1, 5, '#1f1d2b'); P.vline(4, 0, 3, '#1f1d2b');
    P.rect(3, 3, 5, 1, '#1f1d2b'); P.rect(3, 4, 5, 7, '#1f1d2b'); P.rect(4, 5, 3, 5, '#ffd47c'); P.px(5, 6, '#fff1bb');
    P.hline(4, 11, 3, '#1f1d2b'); P.px(5, 12, '#1f1d2b'); P.hline(3, 2, 5, NEIGE);
    return { img: c, ax: 1, ay: base };
  }
  function borne() { // une borne de granit au bord du trottoir, son chapeau de neige
    const { c, P } = mk(6, 10), base = 9;
    P.rect(0, 3, 6, 7, '#a8a294'); P.vline(0, 3, 7, '#c4beb0'); P.vline(5, 3, 7, '#7e786c'); P.ellipse(3, 3, 3, 2, '#a8a294'); P.ellipse(3, 2, 3, 1, NEIGE);
    return { img: c, ax: 3, ay: base };
  }
  // la « carotte » rouge du bar-tabac, en drapeau sur la façade
  function carotte() {
    const { c, P } = mk(9, 26), base = 25;
    P.hline(0, 2, 5, '#1f1d2b'); P.vline(4, 2, 3, '#1f1d2b');
    for (let j = 0; j < 20; j++) { const l = Math.max(1, Math.round(4 - Math.abs(j - 9.5) * 0.35)); P.hline(5 - l, 4 + j, l * 2, j < 1 || j > 18 ? '#a8242a' : '#d8323a'); }
    for (const y of [8, 12, 16]) P.hline(4, y, 3, '#f4f4f8'); // « TABAC », en tout petit
    P.px(3, 4, NEIGE); P.px(4, 4, NEIGE);
    return { img: c, ax: 0, ay: base };
  }
  function panneauInfo() { // le panneau bleu de l'office de tourisme, un grand « i »
    const { c, P } = mk(12, 14), base = 13;
    P.rect(0, 0, 12, 12, '#2a5aa8'); P.rect(1, 1, 10, 10, '#3a6ac8'); P.rect(5, 2, 2, 2, '#f4f4f8'); P.rect(5, 5, 2, 5, '#f4f4f8'); P.hline(4, 9, 4, '#f4f4f8');
    P.hline(0, 0, 12, NEIGE);
    return { img: c, ax: 6, ay: base };
  }

  // ------------------------------------------------------------ Flash McQueen, garé au bord de la rue (vu de côté, l'avant à gauche)
  // une voiture de course rouge, basse et allongée : long capot, pare-brise incliné où l'on voit son œil,
  // aileron à l'arrière, le n° 95 sur la portière et l'éclair jaune-orange, jantes rouges, son sourire sur le pare-chocs
  function poly(P, pts, col) { // remplit un polygone, ligne par ligne (sans anticrénelage)
    const ys = pts.map((p) => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let y = y0; y <= y1; y++) {
      const xs = [];
      for (let k = 0; k < pts.length; k++) {
        const [ax, ay] = pts[k], [bx, by] = pts[(k + 1) % pts.length];
        if ((ay <= y + 0.5 && by > y + 0.5) || (by <= y + 0.5 && ay > y + 0.5)) xs.push(ax + (y + 0.5 - ay) * (bx - ax) / (by - ay));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) P.hline(Math.round(xs[k]), y, Math.round(xs[k + 1]) - Math.round(xs[k]), col);
    }
  }
  function flash(sens = -1) {
    const W = 60, H = 23, { c, P } = mk(W, H);
    const R = '#d8262c', R2 = '#a3141c', R3 = '#ff5f4f', VITRE = '#2a3348';
    // la caisse, le bas de caisse plus sombre, les reflets
    poly(P, [[2, 17], [1, 14], [2, 12], [6, 10], [18, 9], [20, 9], [26, 3], [35, 2], [43, 7], [50, 8], [55, 9], [57, 11], [57, 17], [54, 18], [6, 18]], R);
    poly(P, [[2, 15], [57, 15], [57, 17], [54, 18], [6, 18], [2, 17]], R2);
    P.hline(7, 10, 11, R3); P.hline(3, 11, 4, R3); P.hline(44, 8, 10, R3); P.hline(27, 3, 8, R3);
    // les vitres, et son œil sur le pare-brise (il regarde devant, l'air sûr de lui)
    poly(P, [[21, 9], [27, 4], [35, 4], [41, 8]], VITRE); P.vline(31, 4, 5, R);
    P.ellipse(26, 6, 2, 1, '#f4f6fa'); P.rect(24, 5, 2, 2, '#3a7ad8'); P.px(24, 6, '#1d1626'); P.px(25, 5, '#ffffff'); P.hline(24, 4, 4, R2);
    // l'aileron
    P.rect(49, 4, 2, 4, '#1d1626'); P.rect(46, 3, 12, 2, R); P.hline(46, 3, 12, R3); P.rect(56, 1, 2, 4, R);
    // l'éclair jaune-orange sur le côté
    poly(P, [[15, 13], [26, 11], [25, 12], [38, 10], [36, 12], [47, 11], [35, 15], [36, 13], [25, 15], [26, 14]], '#f6c02a');
    for (let x = 34; x < 48; x++) for (let y = 10; y < 16; y++) if ((x + y) % 3 === 0 && P.g.getImageData(x, y, 1, 1).data[1] > 150) P.px(x, y, '#f08a24');
    // le phare autocollant et le sourire sur le pare-chocs
    P.rect(4, 11, 2, 2, '#f6d23a');
    for (const [x, y] of [[2, 14], [3, 15], [4, 15], [5, 15], [6, 14]]) P.px(x, y, '#1d1626');
    P.hline(3, 14, 3, '#ffffff');
    // les roues : pneus noirs, jantes rouges
    for (const wx of [12, 47]) { P.ellipse(wx, 18, 5, 4, '#1d1626'); P.ellipse(wx, 18, 4, 3, '#2a2632'); P.ellipse(wx, 18, 2, 2, '#c8202a'); P.px(wx, 18, '#c8ccd8'); }
    const img = sens < 0 ? c : PX.flipX(c);
    if (sens > 0) img.getContext('2d').setTransform(1, 0, 0, 1, 0, 0); // flipX laisse le miroir actif : le 95 s'écrit à l'endroit
    const P2 = PX.painter(img), tx = sens < 0 ? 28 : W - 28 - A.largeurTexte('95');
    A.texte(P2, '95', tx + 1, 11, '#1d1626'); A.texte(P2, '95', tx, 10, '#fff4d0');
    return { img: PX.outline(img, '#1d1626'), ax: W / 2, ay: H - 1 };
  }
  // son portrait pour les dialogues, vu de face : les deux grands yeux sur le pare-brise, le capot, le grand sourire
  function portraitFlash() {
    const { c, P } = mk(28, 26);
    const R = '#d8262c', R2 = '#a3141c', R3 = '#ff5f4f';
    poly(P, [[6, 2], [22, 2], [26, 10], [27, 20], [25, 24], [3, 24], [1, 20], [2, 10]], R);
    P.hline(7, 2, 14, R3);
    poly(P, [[7, 4], [21, 4], [24, 11], [4, 11]], '#2a3348');                       // le pare-brise
    for (const ex of [5, 15]) {                                                       // les yeux
      P.rect(ex + 1, 5, 7, 5, '#f4f6fa'); P.rect(ex + 3, 6, 3, 4, '#3a7ad8'); P.rect(ex + 4, 7, 1, 2, '#1d1626'); P.px(ex + 3, 6, '#ffffff');
      P.hline(ex + 1, 5, 7, R2);                                                      // les paupières, un peu baissées
    }
    P.hline(4, 12, 20, R3); P.ellipse(14, 14, 3, 1, '#c87a2a');                       // le capot et son autocollant
    P.rect(2, 13, 4, 2, '#f6d23a'); P.rect(22, 13, 4, 2, '#f6d23a');                  // les phares autocollants
    poly(P, [[4, 17], [24, 17], [21, 22], [7, 22]], '#1d1626');                      // le grand sourire
    P.hline(6, 18, 16, '#ffffff'); P.hline(5, 17, 18, R2);
    P.rect(1, 21, 4, 4, '#1d1a22'); P.rect(23, 21, 4, 4, '#1d1a22'); P.hline(3, 24, 22, R2);
    return PX.outline(c, '#1d1626');
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

  return { texte2x, largeur2x, guirlandeEntre, facadeNoel, restaurant, eglise, tourRemparts, lanterne, borne, carotte, panneauInfo, flash, portraitFlash, chalet, dessinManege, remparts, boitePoste, panneauVille, chevalet, AMPOULES };
})();
