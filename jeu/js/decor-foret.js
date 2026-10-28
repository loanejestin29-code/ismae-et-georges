// =====================================================================
//  decor-foret.js — les objets de la forêt de Sherwood : chênes, sapins
//  enneigés, buissons, souches, tentes du tournoi, cibles, trône…
//  Comme decor-objets.js : chaque objet renvoie { img, ax, ay }, (ax, ay) = point posé au sol.
// =====================================================================
'use strict';

const Foret = (() => {
  const S = PX.shade, line = Objets.line;
  function mk(w, h) { const c = PX.canvas(w, h); return { c, P: PX.painter(c) }; }
  const VERTS = ['#1a3326', '#28502f', '#3a6e38', '#5a8f42', '#8cbc58'];
  const AUTOMNE = ['#c8802e', '#e0a83a', '#b8562a'];
  const BOIS = { fonce: '#3a2618', moyen: '#5e4230', clair: '#7e5e40', reflet: '#9a7a52' };

  // feuillage : un amas de boules éclairées par le haut et la gauche
  function feuillage(P, r, cx, cy, rx, ry, n, o = {}) {
    const G = o.couleurs || VERTS, bmin = o.bmin || 7, bvar = o.bvar || 6;
    const blobs = [];
    for (let k = 0; k < n; k++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r());
      blobs.push([cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, bmin + r.int(bvar)]);
    }
    blobs.sort((a, b) => a[1] - b[1]);
    for (const [x, y, b] of blobs) P.ellipse(x, y + 3, b, b - 2, G[0]);
    for (const [x, y, b] of blobs) P.ellipse(x, y, b - 1, b - 3, G[1]);
    for (const [x, y, b] of blobs) P.ellipse(x - 2, y - 2, b - 4, Math.max(1, b - 5), G[2]);
    for (const [x, y, b] of blobs) if (b > 9) P.ellipse(x - 3, y - 4, b - 8, b - 9, G[3]);
    for (let k = 0; k < n * 4; k++) { const [x, y] = r.pick(blobs); P.px(x - 4 + r.int(6), y - 6 + r.int(5), G[4]); }
    for (let k = 0; k < n * 2; k++) { const [x, y, b] = r.pick(blobs); P.px(x + r.int(8) - 2, y + b - 4 - r.int(3), G[0]); }
    if (o.automne) for (let k = 0; k < n * o.automne; k++) { const [x, y] = r.pick(blobs); P.px(x - 5 + r.int(10), y - 5 + r.int(9), r.pick(AUTOMNE)); }
    if (o.baies) for (let k = 0; k < o.baies; k++) { const [x, y, b] = r.pick(blobs); const bx = x - 3 + r.int(7), by = y - 2 + r.int(b); P.px(bx, by, '#d8323a'); P.px(bx, by - 1, '#ff7a6a'); }
    return blobs;
  }

  // ------------------------------------------------------------ grand chêne
  // o : w, h, automne, coeur (« R + M » gravé), affiche (avis de recherche), fleche, trou, ruche
  function chene(seed, o = {}) {
    const r = PX.rng(seed);
    const W = o.w || 96, H = o.h || 118;
    const { c, P } = mk(W, H);
    const cx = W >> 1, base = H - 1, haut = base - 50;
    // racines qui s'étalent
    for (const [dx, l] of [[-1, 12], [1, 12], [-1, 7], [1, 8]]) {
      line(P, cx + dx * 4, base - 6, cx + dx * (4 + l), base - 1, BOIS.fonce, 3);
      line(P, cx + dx * 4, base - 7, cx + dx * (4 + l), base - 2, BOIS.moyen, 1);
    }
    P.trap(cx - 7, 14, cx - 10, 20, base - 14, 12, BOIS.moyen);
    // tronc et écorce
    P.rect(cx - 7, haut, 14, base - 12 - haut, BOIS.moyen);
    for (let x = cx - 6; x < cx + 7; x += 3) for (let y = haut; y < base - 4; y += 2 + r.int(3)) P.vline(x + r.int(2), y, 1 + r.int(3), r.chance(0.6) ? BOIS.fonce : BOIS.clair);
    P.vline(cx - 7, haut, base - 4 - haut, BOIS.reflet); P.vline(cx - 6, haut, base - 6 - haut, BOIS.clair);
    P.vline(cx + 6, haut, base - 4 - haut, BOIS.fonce);
    for (let k = 0; k < 6; k++) P.px(cx - 8 + r.int(4), haut + 10 + r.int(30), '#5a8a3a'); // mousse
    // grosses branches
    line(P, cx - 2, haut + 8, cx - 22, haut - 10, BOIS.moyen, 4); line(P, cx + 2, haut + 6, cx + 24, haut - 12, BOIS.moyen, 4);
    line(P, cx, haut + 4, cx + 2, haut - 20, BOIS.moyen, 4);
    // feuillage
    const blobs = feuillage(P, r, cx, 40, W / 2 - 14, 30, Math.round(W / 3), { automne: o.automne ?? 0.6 });
    // détails sur le tronc
    if (o.trou) { P.ellipse(cx, base - 26, 3, 5, '#1d1410'); P.ellipse(cx, base - 27, 2, 3, '#0e0a08'); P.hline(cx - 3, base - 21, 7, BOIS.clair); }
    if (o.coeur) {
      const hx = cx - 3, hy = base - 30;
      [[1, 0], [2, 0], [4, 0], [5, 0], [0, 1], [3, 1], [6, 1], [0, 2], [6, 2], [1, 3], [5, 3], [2, 4], [4, 4], [3, 5]].forEach(([x, y]) => P.px(hx + x, hy + y, '#d8b890'));
      P.px(hx + 2, hy + 2, '#e8c8a0'); P.px(hx + 4, hy + 2, '#e8c8a0');
    }
    if (o.affiche) {
      const ax = cx - 5, ay = base - 36;
      P.rect(ax, ay, 11, 13, '#e8d8b0'); P.hline(ax, ay, 11, '#f6ead2'); P.rect(ax, ay + 12, 11, 1, '#b8a070');
      P.rect(ax + 1, ay + 1, 9, 2, '#8a3a2a'); P.ellipse(ax + 5, ay + 6, 2, 2, '#d8782e'); P.px(ax + 3, ay + 4, '#d8782e'); P.px(ax + 7, ay + 4, '#d8782e');
      P.px(ax + 4, ay + 6, '#1d1626'); P.px(ax + 6, ay + 6, '#1d1626'); P.hline(ax + 2, ay + 10, 7, '#8a7a5a');
      P.px(ax + 5, ay - 1, '#9aa2b4');
    }
    if (o.fleche) {
      const fx = cx + 2, fy = base - 30;
      line(P, fx, fy, fx + 12, fy - 3, '#c8a070'); P.px(fx + 12, fy - 3, '#d8323a'); P.px(fx + 13, fy - 4, '#d8323a'); P.px(fx + 13, fy - 2, '#ffffff');
      P.rect(fx - 4, fy + 1, 6, 5, '#f6ead2'); P.hline(fx - 3, fy + 3, 4, '#8a7a5a');
    }
    if (o.ruche) {
      const [bx, by] = blobs.reduce((a, b) => (b[0] > a[0] ? b : a));
      const rx = Math.min(W - 8, Math.round(bx)), ry = Math.round(by) + 10;
      P.vline(rx, ry - 6, 6, BOIS.fonce);
      for (let k = 0; k < 4; k++) P.rect(rx - 4 + (k % 2 ? 1 : 0), ry + k * 3, 9 - (k % 2) * 2 - (k > 2 ? 2 : 0), 3, k % 2 ? '#c8902e' : '#e8b54a');
      P.ellipse(rx, ry + 8, 1, 1, '#3a2418');
    }
    return { img: c, ax: cx, ay: base };
  }

  // sapin des montagnes : six étages de branches qui se recouvrent ; la neige se pose
  // sur le dessus de chaque étage (neige : 0 = sans neige, 1 à 3 = de plus en plus)
  function sapin(seed, neige = 0) {
    const r = PX.rng(seed), W = 46, H = 86, { c, P } = mk(W, H), cx = 23, base = H - 1;
    const V = ['#0e2620', '#16382c', '#1e4834', '#2a5a40', '#3c7452'];
    P.rect(cx - 2, base - 13, 5, 13, '#4a3020'); P.vline(cx - 2, base - 13, 13, '#6a4a30'); P.vline(cx + 2, base - 13, 13, '#2e1e14');
    for (let e = 5; e >= 0; e--) {
      const y0 = 3 + e * 11, hh = 14 + e, demi = 4 + e * 3.3;
      const largeur = (j) => Math.round(1 + (j / (hh - 1)) * demi);
      for (let j = 0; j < hh; j++) {
        const hw = largeur(j), jag = r.int(2);
        for (let x = -hw - jag; x <= hw + jag; x++) {
          const cote = x / (hw + 1);
          P.px(cx + x, y0 + j, j > hh - 3 ? V[0] : cote < -0.35 ? V[3] : cote > 0.45 ? V[1] : V[2]);
        }
      }
      for (let x = -Math.round(demi); x <= Math.round(demi); x += 3) P.px(cx + x, y0 + hh, V[0]); // pointes
      for (let k = 0; k < 6 + e * 2; k++) { const j = 2 + r.int(hh - 4), hw = largeur(j); P.px(cx - hw + 1 + r.int(Math.max(1, hw)), y0 + j, V[4]); }
    }
    // la neige : une bande blanche sur le dessus de chaque étage, juste sous l'étage d'au-dessus
    if (neige) for (let e = 0; e < 6; e++) {
      const y0 = 3 + e * 11, hh = 14 + e, demi = 4 + e * 3.3;
      const debut = e ? 5 + 12 * e - y0 : 0, ns = e ? 2 + neige : 3 + neige;
      for (let j = debut; j < Math.min(hh - 2, debut + ns); j++) {
        const hw = Math.round(1 + (j / (hh - 1)) * demi);
        for (let x = -hw; x <= hw; x++) {
          const bord = debut + ns - 1 - Math.round(Math.abs(Math.sin((x + e * 5) * 0.8)) * 1.6);
          if (j > bord) continue;
          P.px(cx + x, y0 + j, j === bord ? '#b4c8e2' : x > hw * 0.45 ? '#d8e4f4' : '#ffffff');
        }
      }
      for (let k = 0; k < 2 + e; k++) { const x = Math.round((r() * 2 - 1) * demi * 0.85), yy = y0 + hh - 2 - r.int(2); P.px(cx + x, yy, '#ffffff'); P.px(cx + x + 1, yy, '#d8e4f4'); }
    }
    if (neige) { P.rect(cx - 1, 1, 3, 3, '#ffffff'); P.px(cx + 1, 3, '#d8e4f4'); }
    return { img: c, ax: cx, ay: base };
  }

  // un bonhomme de neige à moitié fini (près du chemin des montagnes)
  function bonhomme() {
    const { c, P } = mk(24, 30);
    P.ellipse(12, 23, 9, 6, '#b4c8e2'); P.ellipse(12, 22, 8, 5, '#f2f6fc'); P.ellipse(10, 21, 4, 2, '#ffffff');
    P.ellipse(12, 12, 6, 5, '#b4c8e2'); P.ellipse(12, 11, 5, 4, '#f2f6fc'); P.ellipse(11, 10, 2, 2, '#ffffff');
    P.px(10, 10, '#1d1626'); P.px(14, 10, '#1d1626');
    for (const y of [19, 22, 25]) P.px(12, y, '#2a2632');
    line(P, 6, 15, 1, 11, '#5e4230'); line(P, 18, 15, 22, 10, '#5e4230'); P.px(1, 10, '#5e4230'); P.px(23, 9, '#5e4230');
    P.rect(7, 15, 10, 2, '#c8343a'); P.rect(14, 16, 2, 4, '#a82a30');
    return { img: c, ax: 12, ay: 28 };
  }

  function buisson(seed, w = 28, o = {}) {
    const r = PX.rng(seed), h = Math.round(w * 0.66), { c, P } = mk(w + 4, h + 4);
    feuillage(P, r, (w + 4) / 2, h / 2 + 2, w / 2 - 6, h / 2 - 5, Math.max(4, Math.round(w / 4)), { bmin: 5, bvar: 3, baies: o.baies, automne: o.automne });
    return { img: c, ax: (w + 4) >> 1, ay: h + 2 };
  }

  function souche(seed) {
    const r = PX.rng(seed), { c, P } = mk(22, 16);
    P.rect(3, 4, 16, 10, BOIS.moyen); P.vline(3, 4, 10, BOIS.clair); P.vline(18, 4, 10, BOIS.fonce);
    for (let x = 5; x < 18; x += 3) P.vline(x, 6 + r.int(2), 5, BOIS.fonce);
    P.trap(3, 16, 1, 20, 13, 3, BOIS.moyen);
    P.ellipse(11, 4, 8, 3, '#c89a64'); P.ellipse(11, 4, 5, 2, '#b8844e'); P.ellipse(11, 4, 2, 1, '#c89a64'); P.px(11, 4, '#8a5a32');
    P.px(4, 9, '#5a8a3a'); P.px(5, 10, '#5a8a3a');
    return { img: c, ax: 11, ay: 15 };
  }

  // rondin couché (banc du campement) ; creux : un gros tronc creux
  function rondin(w = 34, creux = false) {
    const h = creux ? 20 : 12, { c, P } = mk(w, h);
    P.rect(2, 2, w - 6, h - 3, BOIS.moyen); P.hline(2, 2, w - 6, BOIS.reflet); P.hline(2, 3, w - 6, BOIS.clair); P.hline(2, h - 2, w - 6, BOIS.fonce);
    for (let x = 6; x < w - 6; x += 5) P.hline(x, 5 + (x % 3), 3, BOIS.fonce);
    P.ellipse(w - 4, (h - 1) / 2 + 1, 3, (h - 3) / 2, '#c89a64'); P.ellipse(w - 4, (h - 1) / 2 + 1, 1, (h - 7) / 2, '#b8844e');
    if (creux) { P.ellipse(4, h / 2 + 1, 4, h / 2 - 2, '#2a1c14'); P.ellipse(4, h / 2 + 1, 2, h / 2 - 4, '#0e0a08'); for (let x = 10; x < w - 8; x += 4) P.px(x, 2, '#5a8a3a'); }
    return { img: c, ax: w >> 1, ay: h - 1 };
  }

  function rocher(seed, w = 18) {
    const r = PX.rng(seed), h = Math.round(w * 0.7), { c, P } = mk(w + 2, h + 2);
    P.ellipse(w / 2 + 1, h / 2 + 1, w / 2, h / 2, '#6a6a78'); P.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, '#8a8a98');
    P.ellipse(w / 2 - 2, h / 2 - 2, w / 4, h / 4, '#a8a8b4');
    for (let k = 0; k < w / 2; k++) P.px(2 + r.int(w - 2), 1 + r.int(Math.max(1, h / 2)), r.pick(['#5a8a3a', '#6f9a48']));
    return { img: c, ax: (w >> 1) + 1, ay: h };
  }

  // ------------------------------------------------------------ campement de Robin
  function abri() { // auvent de toile tendu entre deux piquets
    const { c, P } = mk(46, 30);
    line(P, 3, 29, 3, 6, BOIS.fonce, 2); line(P, 42, 29, 42, 6, BOIS.fonce, 2); line(P, 3, 6, 42, 6, BOIS.moyen, 2);
    P.trap(4, 38, 0, 46, 7, 20, '#c8b88a'); P.trap(5, 36, 2, 42, 7, 4, '#e0d4a8');
    for (let x = 6; x < 42; x += 8) line(P, x, 8, x - 3, 26, '#a8986a');
    P.trap(10, 26, 8, 30, 20, 8, '#3a2e22');
    P.rect(12, 24, 10, 4, '#6a4a8a'); P.hline(12, 24, 10, '#8a6aaa'); // une couverture
    return { img: c, ax: 23, ay: 29 };
  }
  function marmite() {
    const { c, P } = mk(22, 26);
    line(P, 3, 25, 11, 2, BOIS.fonce); line(P, 19, 25, 11, 2, BOIS.fonce); line(P, 11, 2, 11, 25, BOIS.moyen);
    P.vline(11, 3, 9, '#3a3646');
    P.ellipse(11, 16, 6, 5, '#2a2632'); P.ellipse(11, 13, 6, 2, '#3a3646'); P.ellipse(11, 13, 5, 1, '#e8a03a'); P.px(9, 13, '#f2c87a');
    return { img: c, ax: 11, ay: 25 };
  }
  function coffre() {
    const { c, P } = mk(18, 14);
    P.rect(1, 4, 16, 9, '#7a4a2a'); P.rect(1, 1, 16, 4, '#8a5a32'); P.hline(1, 1, 16, '#a8743e');
    P.vline(4, 1, 12, '#c9a040'); P.vline(13, 1, 12, '#c9a040'); P.hline(1, 5, 16, '#3a2418');
    P.rect(8, 5, 2, 3, '#e8b54a');
    return { img: c, ax: 9, ay: 13 };
  }

  // ------------------------------------------------------------ le tournoi
  // tente à rayures, toit pointu, festons et fanion
  function tente(c1, c2, seed = 1) {
    const r = PX.rng(seed), W = 54, H = 64, { c, P } = mk(W, H), cx = 27;
    line(P, cx, 0, cx, 12, BOIS.fonce); P.rect(cx + 1, 1, 7, 2, c2); P.rect(cx + 1, 3, 4, 1, c2);
    for (let j = 0; j < 22; j++) {
      const w = Math.round(2 + j * 1.15), y = 10 + j;
      for (let x = cx - w; x <= cx + w; x++) P.px(x, y, (Math.floor((x - cx + 60) / 5) % 2 ? c1 : c2));
    }
    for (let x = cx - 25; x <= cx + 25; x++) { const f = (x - cx + 25) % 6; P.vline(x, 32, f < 4 ? 4 : 3, f < 3 ? c2 : S(c2, -0.2)); }
    P.rect(cx - 23, 35, 46, 25, c1);
    for (let x = cx - 23; x < cx + 23; x += 8) P.rect(x, 35, 4, 25, c2);
    P.dither(cx - 23, 35, 46, 6, '#24183a', 5);
    P.trap(cx - 2, 4, cx - 8, 16, 42, 18, '#2a1e2e'); P.trap(cx - 1, 2, cx - 6, 12, 44, 16, '#3a2a3a');
    line(P, cx - 2, 42, cx - 10, 59, S(c1, -0.3)); line(P, cx + 2, 42, cx + 10, 59, S(c1, -0.3));
    P.hline(cx - 23, 59, 46, S(c1, -0.4));
    void r;
    return { img: c, ax: cx, ay: H - 4 };
  }

  // cible de paille sur son trépied, vue de face ; rayon r
  function anneaux(P, cx, cy, rr) {
    const cols = ['#f6f2ea', '#2a2632', '#3a6ad8', '#d8323a', '#f2c230'];
    P.ellipse(cx, cy, rr + 2, rr + 2, '#c8a060'); P.ellipse(cx, cy, rr + 1, rr + 1, '#e0bc78');
    cols.forEach((col, k) => P.ellipse(cx, cy, Math.max(0, Math.round(rr * (1 - k / 5))), Math.max(0, Math.round(rr * (1 - k / 5))), col));
    P.px(cx, cy, '#fff6c0');
  }
  function cible(rr = 9) {
    const W = rr * 2 + 10, H = rr * 2 + 22, { c, P } = mk(W, H), cx = W >> 1, cy = rr + 3;
    line(P, cx - rr + 2, cy + 4, cx - rr - 2, H - 1, BOIS.fonce, 2); line(P, cx + rr - 2, cy + 4, cx + rr + 2, H - 1, BOIS.fonce, 2);
    line(P, cx, cy, cx, H - 3, BOIS.moyen, 2);
    anneaux(P, cx, cy, rr);
    return { img: c, ax: cx, ay: H - 1 };
  }
  function trone() {
    const { c, P } = mk(24, 32), O = '#e8b54a', R = '#a8283a';
    P.rect(3, 4, 18, 22, '#8a5a1e'); P.rect(5, 6, 14, 18, R); P.dither(5, 6, 14, 18, '#c8404e', 3);
    P.rect(2, 2, 20, 3, O); P.px(12, 0, O); P.rect(11, 1, 3, 1, O); P.px(4, 1, O); P.px(19, 1, O);
    P.vline(3, 4, 24, O); P.vline(20, 4, 24, O);
    P.rect(1, 22, 22, 5, R); P.hline(1, 22, 22, '#d8505e'); P.hline(1, 26, 22, O);
    P.rect(2, 27, 3, 5, '#8a5a1e'); P.rect(19, 27, 3, 5, '#8a5a1e');
    P.ellipse(12, 12, 3, 3, O); P.px(12, 12, R);
    return { img: c, ax: 12, ay: 31 };
  }
  // carquois planté au pas de tir
  function carquois() {
    const { c, P } = mk(12, 22);
    P.rect(4, 6, 5, 15, '#7a4a2a'); P.vline(4, 6, 15, '#a8743e'); P.hline(4, 9, 5, '#c9a040'); P.hline(4, 17, 5, '#c9a040');
    for (let k = 0; k < 4; k++) { P.vline(4 + k, 1 + (k % 2), 5, '#d8c8a0'); P.px(4 + k, 0 + (k % 2), k % 2 ? '#d8323a' : '#f6f2ea'); }
    P.rect(3, 20, 7, 2, '#3a2618');
    return { img: c, ax: 6, ay: 21 };
  }
  // barrière de bois (poteaux tous les 16 px, deux traverses)
  function barriere(w) {
    const { c, P } = mk(w, 15);
    for (const y of [3, 8]) { P.rect(0, y, w, 2, BOIS.clair); P.hline(0, y, w, BOIS.reflet); P.hline(0, y + 2, w, BOIS.fonce); }
    for (let x = 0; x < w; x += 16) { P.rect(x, 0, 3, 15, BOIS.moyen); P.vline(x, 0, 15, BOIS.reflet); P.hline(x, 0, 3, BOIS.reflet); }
    P.rect(w - 3, 0, 3, 15, BOIS.moyen);
    return { img: c, ax: 0, ay: 14 };
  }
  // poteau indicateur ; planches = [['>', '#c8a070'], ['<', …], ['^', …]]
  function poteau(planches) {
    const { c, P } = mk(32, 34), cx = 16;
    P.rect(cx - 1, 6, 3, 28, BOIS.moyen); P.vline(cx - 1, 6, 28, BOIS.clair);
    planches.forEach(([sens, col], k) => {
      const y = 4 + k * 7;
      if (sens === '^') { P.rect(cx - 3, y - 4, 7, 6, col); P.px(cx, y - 5, col); P.hline(cx - 2, y - 2, 5, S(col, -0.4)); return; }
      const x0 = sens === '>' ? cx - 3 : cx - 12;
      P.rect(x0, y, 15, 5, col); P.hline(x0, y, 15, S(col, 0.2)); P.hline(x0, y + 4, 15, S(col, -0.35));
      if (sens === '>') { P.px(x0 + 15, y + 1, col); P.px(x0 + 15, y + 2, col); P.px(x0 + 15, y + 3, col); P.px(x0 + 16, y + 2, col); }
      else { P.px(x0 - 1, y + 1, col); P.px(x0 - 1, y + 2, col); P.px(x0 - 1, y + 3, col); P.px(x0 - 2, y + 2, col); }
      for (let x = x0 + 3; x < x0 + 12; x += 2) P.px(x, y + 2, S(col, -0.45));
    });
    return { img: c, ax: cx, ay: 33 };
  }
  // petit pont : rambarde (dessinée au-dessus du sol, devant ou derrière le personnage)
  function rambarde(h) {
    const { c, P } = mk(4, h + 10);
    P.rect(1, 0, 2, h + 10, BOIS.moyen); P.vline(1, 0, h + 10, BOIS.reflet);
    for (let y = 0; y < h + 6; y += 12) { P.rect(0, y, 4, 4, BOIS.fonce); P.rect(0, y, 3, 3, BOIS.clair); }
    return { img: c, ax: 2, ay: h + 9 };
  }

  // ------------------------------------------------------------ lumières et petits décors (comme les réverbères de la rue)
  // lanterne accrochée à un poteau de bois
  function lanterne() {
    const { c, P } = mk(16, 38);
    P.rect(5, 6, 3, 32, BOIS.moyen); P.vline(5, 6, 32, BOIS.reflet); P.vline(7, 6, 32, BOIS.fonce);
    P.rect(4, 4, 10, 2, BOIS.fonce); P.hline(4, 4, 10, BOIS.clair); P.vline(12, 6, 2, '#2a2632');
    P.rect(9, 8, 7, 2, '#2a2632'); P.rect(10, 10, 5, 7, '#2a2632'); P.rect(11, 11, 3, 5, '#ffd27a'); P.px(11, 11, '#fff4c8'); P.rect(9, 17, 7, 1, '#2a2632');
    P.rect(3, 35, 7, 3, BOIS.fonce);
    return { img: c, ax: 6, ay: 37, light: { dx: 6, dy: -24 } };
  }
  // la petite chapelle de Frère Tuck : murs de pierre, toit d'ardoise, clocher, rosace éclairée
  function chapelle() {
    const r = PX.rng(12), W = 80, H = 96, { c, P } = mk(W, H), base = H - 1, x0 = 10, x1 = 70, yMur = 40;
    // toit
    for (let j = 0; j < 26; j++) { const ww = Math.round(18 + j * 1.75); P.rect(40 - ww, 16 + j, ww * 2, 1, j % 4 === 3 ? '#3a3e54' : '#4c5270'); }
    for (let j = 0; j < 26; j += 4) for (let x = 40 - 18 - j * 1.75; x < 40 + 18 + j * 1.75; x += 6) P.px(Math.round(x + (j % 8 ? 3 : 0)), 16 + j, '#5e6688');
    P.hline(22, 15, 36, '#6a7294');
    // murs
    P.rect(x0, yMur, x1 - x0, base - yMur, '#8e8478');
    for (let row = 0, y = yMur; y < base; row++, y += 6) for (let x = x0 + (row % 2 ? -6 : 0); x < x1; x += 12) {
      const a = Math.max(x0, x), b = Math.min(x1, x + 11), col = r.pick(['#9a9084', '#8a8074', '#a49a8c', '#948a7e']);
      P.rect(a, y, b - a, 5, col); P.hline(a, y, b - a, PX.shade(col, 0.15)); P.hline(a, y + 5, b - a, '#5e564c');
    }
    P.dither(x0, yMur, x1 - x0, 6, '#2a2238', 7);
    // porte en bois, arrondie
    P.rect(32, 70, 16, 25, '#3a2618'); P.ellipse(40, 70, 8, 5, '#3a2618'); P.rect(33, 70, 14, 25, '#6a4428'); P.ellipse(40, 70, 7, 4, '#6a4428');
    P.vline(40, 66, 29, '#3a2618'); for (let y = 72; y < 95; y += 5) P.hline(33, y, 14, '#5a3a22'); P.px(44, 82, '#e8b54a'); P.px(36, 82, '#e8b54a');
    // rosace et fenêtres éclairées
    P.ellipse(40, 54, 6, 6, '#3a3446'); P.ellipse(40, 54, 5, 5, '#ffcf72'); P.vline(40, 49, 11, '#8a5a2e'); P.hline(35, 54, 11, '#8a5a2e'); P.px(38, 52, '#fff4c8');
    for (const fx of [18, 58]) { P.rect(fx - 3, 58, 7, 12, '#3a3446'); P.rect(fx - 2, 59, 5, 10, '#ffc66a'); P.ellipse(fx, 58, 3, 2, '#3a3446'); P.ellipse(fx, 59, 2, 1, '#ffc66a'); P.hline(fx - 2, 64, 5, '#8a5a2e'); }
    // clocher et sa cloche
    P.rect(32, 4, 16, 14, '#8e8478'); P.rect(35, 7, 10, 10, '#2a2238'); P.ellipse(40, 12, 3, 3, '#e8b54a'); P.rect(37, 14, 7, 2, '#c8902e'); P.px(39, 10, '#fff0a0');
    for (let j = 0; j < 6; j++) P.rect(40 - j - 2, j - 2, j * 2 + 4, 1, '#4c5270');
    P.vline(40, -3, 4, '#3a2618'); P.hline(38, -1, 5, '#3a2618');
    // lierre et marches
    for (let k = 0; k < 90; k++) { const x = r.chance(0.5) ? x0 + r.int(10) : x1 - 1 - r.int(10), y = yMur + r.int(base - yMur); P.px(x, y, r.pick(['#2f5d2e', '#3f7a35', '#4e8c4a'])); }
    P.rect(28, 93, 24, 3, '#a49a8c'); P.hline(28, 93, 24, '#c0b6a8');
    return { img: c, ax: 40, ay: base, lumieres: [[40, 54, 34], [18, 64, 22], [58, 64, 22], [40, 88, 20]] };
  }
  function fougere(seed) {
    const r = PX.rng(seed), { c, P } = mk(24, 15);
    for (let k = 0; k < 7; k++) {
      const a = Math.PI * (1.08 + k * 0.14), l = 7 + r.int(4), x2 = 12 + Math.cos(a) * l * 1.3, y2 = 14 + Math.sin(a) * l * 0.9;
      line(P, 12, 14, x2, y2, '#2a5e30');
      for (let t = 0.3; t < 1; t += 0.18) { const x = 12 + (x2 - 12) * t, y = 14 + (y2 - 14) * t; P.px(x, y - 1, '#4f8a3e'); P.px(x + 1, y, '#3a7436'); }
      P.px(x2, y2, '#7ab454');
    }
    return { img: c, ax: 12, ay: 14 };
  }
  function herbes(seed) {
    const r = PX.rng(seed), { c, P } = mk(14, 14);
    for (let k = 0; k < 9; k++) {
      const x = 2 + r.int(10), h = 5 + r.int(8), pen = r.int(3) - 1;
      line(P, x, 13, x + pen, 13 - h, r.pick(['#3f7a35', '#4e8c42', '#5a9a48']));
      P.px(x + pen, 13 - h, r.chance(0.3) ? '#d8c070' : '#7ab454');
    }
    return { img: c, ax: 7, ay: 13 };
  }
  // charrette de foin et râtelier d'arcs
  function charrette() {
    const { c, P } = mk(48, 32);
    P.ellipse(24, 12, 20, 9, '#d8b860'); for (let k = 0; k < 40; k++) P.px(6 + (k * 37) % 36, 5 + (k * 13) % 14, k % 2 ? '#f0d488' : '#b89a48');
    P.rect(4, 14, 40, 9, '#8a5a32'); P.hline(4, 14, 40, '#a8743e'); for (let x = 8; x < 44; x += 7) P.vline(x, 15, 8, '#6a4428');
    line(P, 44, 20, 48, 26, BOIS.fonce, 2);
    for (const wx of [12, 36]) { P.ellipse(wx, 26, 5, 5, '#3a2618'); P.ellipse(wx, 26, 3, 3, '#8a5a32'); P.px(wx, 26, '#3a2618'); }
    return { img: c, ax: 24, ay: 31 };
  }
  function ratelier() {
    const { c, P } = mk(28, 26);
    P.rect(2, 4, 3, 22, BOIS.moyen); P.rect(23, 4, 3, 22, BOIS.moyen); P.rect(1, 6, 26, 2, BOIS.clair); P.rect(1, 18, 26, 2, BOIS.clair);
    for (const x of [8, 14, 20]) { for (let y = 2; y < 24; y++) P.px(x - Math.round(3 * Math.sin((y - 2) / 22 * Math.PI)), y, '#8a5a32'); P.vline(x, 2, 22, 'rgba(246,242,234,0.8)'); }
    return { img: c, ax: 14, ay: 25 };
  }
  // guirlande de petits fanions triangulaires, tendue entre deux points (dessinée au premier plan)
  function fanions(w, creux, couleurs) {
    const c = PX.canvas(w, creux + 10), P = PX.painter(c), yDe = (x) => Math.round(creux * 4 * (x / w) * (1 - x / w));
    for (let x = 0; x < w; x++) P.px(x, yDe(x), '#3a2618');
    for (let x = 4, k = 0; x < w - 6; x += 9, k++) {
      const y = yDe(x + 3) + 1, col = couleurs[k % couleurs.length];
      for (let j = 0; j < 6; j++) P.rect(x + Math.floor(j / 2), y + j, 7 - j - Math.floor(j / 2), 1, j === 0 ? PX.shade(col, 0.2) : col);
    }
    return c;
  }

  return { VERTS, feuillage, chene, sapin, bonhomme, lanterne, chapelle, fougere, herbes, charrette, ratelier, fanions, buisson, souche, rondin, rocher, abri, marmite, coffre, tente, anneaux, cible, trone, carquois, barriere, poteau, rambarde, BOIS };
})();
