// =====================================================================
//  decor-resto.js — les objets du restaurant du chef Gusteau (épreuve 5)
//
//  · La salle : tables rondes nappées jusqu'au sol, chaises bistrot en bois courbé,
//    banquettes de velours capitonné, cheminée de marbre, lustres, bar en zinc et
//    ses bouteilles, chariot des desserts, piano à queue, pupitre du maître d'hôtel…
//  · La cuisine : le grand piano de cuisson sous sa hotte, l'îlot de marbre de la
//    pâtisserie, le billot de Colette, la plonge, l'étagère des légumes, le passe et
//    ses lampes chauffantes, la chambre froide…
//  Comme decor-objets.js : chaque objet renvoie { img, ax, ay } ((ax, ay) = point posé au sol),
//  parfois avec des lumières ([x, y, rayon, type] dans l'image) ou des points animés.
//  Les décors muraux (papier peint, miroirs, hotte, étagères…) se peignent directement
//  sur le sol de la carte : ils prennent le pinceau P de la carte en premier argument.
//  Lumière en haut à gauche ; trois à six tons par matière, comme Arendelle et la forêt.
// =====================================================================
'use strict';

const RestoDecor = (() => {
  const line = Objets.line;
  function mk(w, h) { const c = PX.canvas(w, h); return { c, P: PX.painter(c) }; }
  // l'image détourée ; les points donnés dans le dessin sont décalés d'un pixel par le contour
  const fini = (c, ax, ay, extra = {}) => {
    const o = Object.assign({ img: PX.outline(c, '#1d1626'), ax: ax + 1, ay: ay + 1 }, extra);
    for (const k of ['lumieres', 'flammes', 'fumees', 'feux', 'bulles', 'twinkles']) if (o[k]) o[k] = o[k].map(([x, y, ...q]) => [x + 1, y + 1, ...q]);
    for (const k of ['percolateur', 'place', 'robinet', 'planche']) if (o[k]) o[k] = [o[k][0] + 1, o[k][1] + 1];
    if (o.foyer) o.foyer = Object.assign({}, o.foyer, { x: o.foyer.x + 1, y: o.foyer.y + 1 });
    return o;
  };
  // du plus sombre au plus clair
  const NOYER = ['#1e0f0a', '#341a10', '#4e2a18', '#6a3a22', '#8a5030', '#a86a40'];
  const CHENE = ['#4a3018', '#6a4a2a', '#8a6438', '#a88050', '#c49e68', '#dcbc88'];
  const VELOURS = ['#2e0a10', '#4a1018', '#6a1822', '#8a2430', '#a8343c', '#c8585a'];
  const OR = ['#4a2a0e', '#7a4e1a', '#a8782a', '#d8a83e', '#f0cc6a', '#fff0b8'];
  const LIN = ['#9a9488', '#bab4a6', '#d6d0c2', '#ece8de', '#fbf9f2'];
  const INOX = ['#262a34', '#40444f', '#5c6270', '#7c8290', '#a0a6b4', '#c4c9d4', '#e6e9f0'];
  const CUIVRE = ['#3e180a', '#6e3014', '#9e5226', '#c87236', '#e89a58', '#f8c890'];
  const MARBRE = ['#8a8a96', '#b0b0ba', '#d0d0d8', '#e6e6ec', '#f8f8fa'];
  const VERT = ['#14301e', '#1e4a2c', '#2c643a', '#3e8248', '#5aa05a'];
  const FLAMME = ['#f08a24', '#ffd27a', '#fff4b0'];
  const LEGUMES = { tomate: ['#8a1a1e', '#d8323a', '#ff8a7a'], courgette: ['#1e4a24', '#3a7a3a', '#7ab060'], aubergine: ['#2a1238', '#5a2a6a', '#9a6aaa'], poivron: ['#a87a10', '#f2c230', '#fff0a0'], carotte: ['#8a3a10', '#e8742a', '#ffb070'], oignon: ['#8a5a2a', '#d8a050', '#f8d898'] };

  // ------------------------------------------------------------ petits outils de dessin
  // un panneau mouluré : le cadre en relief (clair en haut à gauche), le fond en creux
  function panneau(P, x, y, w, h, T = NOYER) {
    P.rect(x, y, w, h, T[3]); P.hline(x, y, w, T[4]); P.vline(x, y, h, T[4]); P.hline(x, y + h - 1, w, T[1]); P.vline(x + w - 1, y, h, T[1]);
    if (w < 6 || h < 6) return;
    P.rect(x + 2, y + 2, w - 4, h - 4, T[2]); P.hline(x + 2, y + 2, w - 4, T[1]); P.vline(x + 2, y + 2, h - 4, T[1]);
    P.hline(x + 3, y + h - 3, w - 5, T[4]); P.vline(x + w - 3, y + 3, h - 5, T[4]);
  }
  // un anneau (dossier en bois courbé, anse, assiette vue de haut…)
  function anneau(P, cx, cy, rx, ry, col, ep = 1) {
    for (let y = -ry - 1; y <= ry + 1; y++) for (let x = -rx - 1; x <= rx + 1; x++) {
      const d = (x * x) / ((rx + 0.5) ** 2) + (y * y) / ((ry + 0.5) ** 2), d2 = (x * x) / (Math.max(0.5, rx - ep + 0.5) ** 2) + (y * y) / (Math.max(0.5, ry - ep + 0.5) ** 2);
      if (d <= 1 && d2 > 1) P.px(cx + x, cy + y, col);
    }
  }
  // des veines de bois ou de marbre
  function veines(P, r, x, y, w, h, col, n, long = 5) { for (let k = 0; k < n; k++) { const vx = x + r.int(w), vy = y + r.int(h), l = 2 + r.int(long); P.hline(Math.min(vx, x + w - l), vy, l, col); } }
  // une flamme de bougie (3 pixels)
  function bougie(P, x, y, h = 5) { P.rect(x, y - h, 2, h, LIN[4]); P.vline(x + 1, y - h, h, LIN[2]); P.px(x, y - h - 1, FLAMME[1]); P.px(x, y - h - 2, FLAMME[2]); P.px(x + 1, y - h - 1, FLAMME[0]); }
  // une assiette vue de 3/4, avec ou sans mets
  function assiette(P, x, y, mets) {
    P.ellipse(x, y, 3, 1, OR[3]); P.hline(x - 2, y, 5, LIN[4]); P.px(x - 2, y - 1, LIN[4]); P.px(x + 2, y + 1, LIN[2]);
    if (mets) { P.px(x - 1, y, mets[0]); P.px(x, y, mets[1]); P.px(x + 1, y, mets[0]); P.px(x, y - 1, mets[2] || mets[1]); }
  }
  // un verre à pied (eau, vin rouge, champagne)
  function verre(P, x, y, vin) { P.px(x, y - 3, '#e8f4fa'); P.px(x, y - 2, vin || '#cfe6f2'); P.px(x, y - 1, '#a8c8d8'); P.px(x, y, '#cfe6f2'); }
  const METS = [['#d8323a', '#3a7a3a', '#f2c230'], ['#7a4a2a', '#c89a5a', '#f6e2b8'], ['#e8b54a', '#f6e2b8', '#ffffff'], ['#5a2a6a', '#d8323a', '#3a7a3a'], ['#f4f2ec', '#c8d8a0', '#d8a050']];

  // ------------------------------------------------------------ LA SALLE : les objets posés au sol
  // une table ronde : la nappe tombe jusqu'au sol en plis, chemin de table rouge, bougie, couverts
  function tableRonde(seed, o = {}) {
    const r = PX.rng(seed), W = 44, { c, P } = mk(W, 42), cx = 22, cy = 15, rx = 19, ry = 8;
    let bas0 = 0;
    for (let x = cx - rx; x <= cx + rx; x++) {
      const u = (x - cx) / rx, k = (u + 1) / 2, pli = Math.floor((x + 40) / 4) % 2;
      const bas = cy + 17 + Math.round(Math.sqrt(Math.max(0, 1 - u * u)) * 6) + (pli ? 1 : 0);
      bas0 = Math.max(bas0, bas);
      const col = k < 0.22 ? LIN[pli ? 4 : 3] : k < 0.68 ? LIN[pli ? 3 : 2] : LIN[pli ? 2 : 1];
      P.vline(x, cy, bas - cy, col); P.px(x, bas, LIN[Math.max(0, (k < 0.68 ? 2 : 1) - 1)]);
    }
    if (o.chemin) { // le chemin de table, qui retombe devant
      const cc = o.chemin === true ? VELOURS : o.chemin;
      P.rect(cx - 3, cy - ry + 1, 7, ry * 2 + 14, cc[3]); P.vline(cx - 3, cy - ry + 1, ry * 2 + 14, cc[4]); P.vline(cx + 3, cy - ry + 1, ry * 2 + 14, cc[1]);
      P.hline(cx - 3, cy + ry + 14, 7, OR[3]); for (let x = cx - 3; x <= cx + 3; x += 2) P.px(x, cy + ry + 15, OR[2]);
    }
    P.ellipse(cx, cy, rx, ry, LIN[2]); P.ellipse(cx, cy - 1, rx - 1, ry - 1, LIN[3]); P.ellipse(cx - 4, cy - 2, rx - 9, ry - 4, LIN[4]);
    if (o.chemin) { const cc = o.chemin === true ? VELOURS : o.chemin; P.rect(cx - 3, cy - ry + 1, 7, ry * 2 - 1, cc[3]); P.vline(cx - 3, cy - ry + 1, ry * 2 - 1, cc[4]); P.hline(cx - 3, cy - ry + 1, 7, cc[2]); }
    // les couverts : assiettes, verres, couteaux et fourchettes
    const places = [[-12, 3], [12, 3], [-11, -4], [11, -4]].slice(0, o.couverts ?? 4);
    for (const [dx, dy] of places) {
      const x = cx + dx, y = cy + dy;
      assiette(P, x, y, o.mets ? r.pick(METS) : null);
      P.px(x - 4, y, INOX[5]); P.px(x + 4, y, INOX[5]);
      verre(P, x + (dx < 0 ? 3 : -3), y - 2, r.chance(0.6) ? '#8a1a2a' : null);
    }
    // la bougie dans son bougeoir, le houx, et parfois une rose, du pain, une bouteille
    P.ellipse(cx, cy, 2, 1, OR[3]); P.px(cx - 1, cy - 1, OR[4]); bougie(P, cx, cy - 1, 6);
    for (const [hx, hy] of [[-3, 1], [3, 1], [-2, 2], [2, 2]]) P.px(cx + hx, cy + hy, VERT[3]);
    P.px(cx - 1, cy + 2, '#d8323a'); P.px(cx + 1, cy + 2, '#d8323a');
    if (o.rose) { P.rect(cx + 5, cy - 4, 2, 3, '#bfe0ee'); P.vline(cx + 6, cy - 7, 3, VERT[3]); P.px(cx + 6, cy - 8, '#d8323a'); P.px(cx + 5, cy - 8, '#a8202a'); P.px(cx + 6, cy - 9, '#ff6a6a'); }
    if (o.pain) { P.ellipse(cx - 6, cy - 3, 3, 1, CHENE[2]); P.px(cx - 7, cy - 4, '#e8c080'); P.px(cx - 5, cy - 4, '#d8a860'); P.px(cx - 6, cy - 5, '#f0d090'); }
    if (o.vin) { P.rect(cx + 7, cy - 9, 2, 7, '#1e3a24'); P.vline(cx + 7, cy - 9, 7, '#3a6a44'); P.rect(cx + 7, cy - 11, 1, 2, '#1e3a24'); P.px(cx + 7, cy - 6, OR[4]); P.px(cx + 8, cy - 6, OR[3]); }
    return fini(c, cx, bas0, { flammes: [[cx, cy - 8]] });
  }
  // une petite table carrée, contre la banquette (deux couverts)
  function tableCarree(seed, o = {}) {
    const r = PX.rng(seed), { c, P } = mk(26, 32), x0 = 1, w = 24, top = 6, prof = 9;
    P.rect(x0, top + prof, w, 15, LIN[2]); P.rect(x0, top + prof, 5, 15, LIN[3]); P.rect(x0 + w - 6, top + prof, 6, 15, LIN[1]);
    for (let x = x0 + 3; x < x0 + w; x += 4) P.vline(x, top + prof + 2, 13, x < 10 ? LIN[4] : LIN[1]);
    P.hline(x0, top + prof + 14, w, LIN[0]);
    P.rect(x0, top, w, prof, LIN[3]); P.hline(x0, top, w, LIN[2]); P.hline(x0, top + prof - 1, w, LIN[4]); P.rect(x0 + 2, top + 1, 8, 3, LIN[4]);
    assiette(P, x0 + 6, top + 5, o.mets ? r.pick(METS) : null); assiette(P, x0 + w - 7, top + 5, o.mets ? r.pick(METS) : null);
    verre(P, x0 + 10, top + 3, '#8a1a2a'); verre(P, x0 + w - 11, top + 3, null);
    P.ellipse(x0 + 12, top + 4, 1, 1, OR[3]); bougie(P, x0 + 12, top + 3, 4);
    P.rect(x0 + 2, top + prof + 15, 2, 2, NOYER[2]); P.rect(x0 + w - 4, top + prof + 15, 2, 2, NOYER[2]);
    return fini(c, 13, top + prof + 16, { flammes: [[x0 + 12, top - 2]] });
  }
  // une chaise bistrot en bois courbé ; 'dos' : devant la table (on voit le dossier), 'face' : derrière
  function chaise(sens) {
    const { c, P } = mk(13, 24), B = NOYER, CANNE = ['#8a6a3a', '#c8a468', '#e8cc90'];
    const assise = () => { P.ellipse(6, 14, 5, 2, CANNE[1]); for (let x = 2; x < 11; x += 2) P.px(x, 14, CANNE[0]); P.px(4, 13, CANNE[2]); P.px(7, 13, CANNE[2]); anneau(P, 6, 14, 5, 2, B[3]); P.hline(3, 12, 4, B[5]); };
    const pieds = () => { for (const [x0, x1] of [[2, 1], [10, 11], [4, 4], [8, 8]]) line(P, x0, 15, x1, 22, B[2]); anneau(P, 6, 19, 3, 1, B[2]); P.px(1, 22, B[1]); P.px(11, 22, B[1]); };
    if (sens === 'face') { anneau(P, 6, 6, 5, 6, B[3], 2); anneau(P, 6, 7, 3, 3, B[2]); P.px(3, 2, B[5]); P.px(2, 4, B[5]); pieds(); assise(); }
    else { pieds(); assise(); anneau(P, 6, 7, 5, 6, B[3], 2); anneau(P, 6, 8, 3, 3, B[2]); P.vline(1, 6, 9, B[2]); P.vline(11, 6, 9, B[1]); P.px(3, 2, B[5]); P.px(2, 3, B[5]); P.px(1, 5, B[4]); }
    return fini(c, 6, 22);
  }
  // une banquette de velours capitonné, adossée au mur
  function banquette(w) {
    const H = 30, { c, P } = mk(w, H);
    P.rect(0, 0, w, 3, NOYER[3]); P.hline(0, 0, w, NOYER[5]); P.hline(0, 2, w, OR[3]);
    P.rect(1, 3, w - 2, 16, VELOURS[2]); P.dither(1, 3, w - 2, 4, VELOURS[1], 9);
    for (let y = 6, j = 0; y < 18; y += 4, j++) for (let x = 3 + (j % 2) * 3; x < w - 2; x += 6) {
      P.px(x - 1, y - 1, VELOURS[4]); P.px(x + 1, y - 1, VELOURS[3]); P.px(x - 1, y + 1, VELOURS[3]); P.px(x + 1, y + 1, VELOURS[1]); P.px(x, y, VELOURS[0]); P.px(x - 2, y, VELOURS[3]);
    }
    P.vline(1, 3, 16, VELOURS[4]); P.vline(w - 2, 3, 16, VELOURS[1]);
    P.rect(0, 19, w, 5, VELOURS[3]); P.hline(0, 19, w, VELOURS[5]); P.hline(0, 23, w, VELOURS[1]);
    for (let x = 16; x < w - 4; x += 16) { P.vline(x, 20, 3, VELOURS[1]); P.px(x + 1, 20, VELOURS[4]); }
    P.rect(0, 24, w, 6, NOYER[2]); P.hline(0, 24, w, NOYER[4]); for (let x = 4; x < w - 4; x += 12) P.rect(x, 26, 8, 2, NOYER[1]);
    return fini(c, 0, H - 1);
  }
  // la cheminée de marbre : le foyer (le feu est animé par la carte), la guirlande, les chaussettes, la pendule
  function cheminee() {
    const W = 84, H = 76, { c, P } = mk(W, H), r = PX.rng(91);
    P.rect(4, 14, W - 8, H - 14, MARBRE[2]); P.rect(4, 14, 5, H - 14, MARBRE[3]); P.rect(W - 9, 14, 5, H - 14, MARBRE[1]);
    veines(P, r, 5, 18, W - 10, H - 22, MARBRE[1], 22, 6); veines(P, r, 5, 18, W - 10, H - 22, MARBRE[4], 10, 3);
    // le foyer en arc, ses briques noircies, les chenets et les bûches
    const fx = 20, fw = 44, fy = 32;
    P.rect(fx, fy, fw, H - fy - 5, '#120a0c'); P.ellipse(fx + fw / 2, fy, fw / 2, 6, '#120a0c');
    for (let y = fy + 2, j = 0; y < H - 8; y += 4, j++) for (let x = fx + 2 + (j % 2) * 4; x < fx + fw - 4; x += 8) P.rect(x, y, 7, 3, j % 3 ? '#3a1812' : '#2e120e');
    P.dither(fx, fy - 5, fw, 12, '#120a0c', 10); P.rect(fx, fy, 4, H - fy - 5, '#1a0e0e'); P.rect(fx + fw - 4, fy, 4, H - fy - 5, '#0c0608');
    anneau(P, fx + fw / 2, fy, fw / 2, 6, MARBRE[3]);
    P.rect(fx + 6, H - 11, 32, 4, '#5a3424'); P.hline(fx + 6, H - 11, 32, '#8a5a3a'); P.rect(fx + 10, H - 14, 24, 3, '#4a2a1c'); P.px(fx + 9, H - 10, '#c8a070'); P.px(fx + 37, H - 10, '#c8a070');
    for (const x of [fx + 4, fx + fw - 6]) { P.rect(x, H - 13, 2, 8, OR[2]); P.ellipse(x + 1, H - 14, 1, 1, OR[4]); }
    P.rect(fx - 4, H - 5, fw + 8, 5, MARBRE[1]); P.hline(fx - 4, H - 5, fw + 8, MARBRE[3]);
    // le manteau et ses consoles
    P.rect(0, 10, W, 5, MARBRE[3]); P.hline(0, 10, W, MARBRE[4]); P.hline(0, 14, W, MARBRE[0]); P.dither(4, 15, W - 8, 2, MARBRE[0], 8);
    for (const x of [5, W - 11]) { P.rect(x, 15, 6, 8, MARBRE[3]); P.ellipse(x + 3, 22, 3, 2, MARBRE[2]); P.vline(x + 5, 15, 8, MARBRE[1]); }
    // sur le manteau : la pendule dorée, deux chandeliers, la guirlande de sapin, ses rubans et ses lumières
    P.rect(37, 0, 10, 10, OR[3]); P.ellipse(42, 2, 5, 3, OR[3]); P.ellipse(42, 4, 3, 3, LIN[4]); P.px(42, 3, '#1d1626'); P.px(43, 4, '#1d1626'); P.vline(37, 2, 8, OR[4]); P.vline(46, 2, 8, OR[1]); P.rect(36, 9, 12, 1, OR[2]);
    for (const x of [12, 70]) { P.rect(x, 4, 2, 6, OR[3]); P.ellipse(x + 1, 9, 2, 1, OR[2]); bougie(P, x, 4, 4); }
    const twinkles = [];
    for (let x = 0; x < W; x++) {
      const y = 11 + Math.round(Math.sin((x / W) * Math.PI * 3) * 2);
      P.rect(x, y - 1, 1, 3, x % 3 ? VERT[2] : VERT[1]); if (x % 2) P.px(x, y - 2, VERT[3]);
      if (x % 7 === 3) { P.px(x, y + 1, ['#ffd27a', '#ff7a7a', '#9ad8ff'][(x / 7 | 0) % 3]); twinkles.push([x + 1, y + 2]); }
    }
    for (const x of [2, 40, W - 6]) { P.rect(x, 9, 4, 3, '#c8283a'); P.px(x + 1, 12, '#a81a2a'); P.px(x + 2, 13, '#a81a2a'); }
    // deux chaussettes, sur les côtés
    for (const [x, col] of [[6, '#c8283a'], [W - 13, '#2c7a44']]) { P.rect(x, 17, 5, 9, col); P.rect(x, 23, 8, 4, col); P.rect(x, 16, 6, 3, LIN[4]); P.vline(x + 4, 18, 6, PX.shade(col, -0.3)); P.px(x + 2, 21, '#f2c230'); }
    return fini(c, W / 2, H - 1, { foyer: { x: fx + 9, y: H - 10, w: 26 }, twinkles, flammes: [[12, -2], [70, -2]] });
  }
  // un lustre de laiton et de cristal (accroché au plafond : posé « dessus » par la carte)
  function lustre() {
    const W = 46, H = 50, { c, P } = mk(W, H), cx = 23, cy = 34;
    for (let y = 0; y < 22; y += 2) { P.px(cx, y, OR[3]); P.px(cx, y + 1, OR[1]); }
    const bras = [];
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3; bras.push([Math.round(cx + Math.cos(a) * 18), Math.round(cy - 4 + Math.sin(a) * 5), Math.sin(a)]); }
    const branche = ([x, y]) => {
      line(P, cx, cy, x, y + 2, OR[2]); P.ellipse(x, y + 1, 2, 1, OR[3]); P.px(x - 1, y, OR[4]);
      P.rect(x, y - 4, 1, 4, LIN[4]); P.px(x, y - 5, '#fff4c0'); P.px(x, y - 6, '#ffe08a');
      P.px(x, y + 3, '#cfe8ff'); P.px(x, y + 4, '#ffffff'); P.px(x - 1, y + 3, '#9ac8e8');
    };
    bras.filter((b) => b[2] < 0).forEach(branche);
    P.rect(cx - 1, 22, 3, 12, OR[3]); P.px(cx - 1, 22, OR[5]); P.ellipse(cx, 26, 3, 2, OR[2]); P.ellipse(cx, 25, 2, 1, OR[4]);
    P.ellipse(cx, cy, 6, 3, OR[2]); P.ellipse(cx, cy - 1, 5, 2, OR[4]); P.px(cx - 2, cy - 2, OR[5]);
    for (let k = 0; k < 9; k++) { const x = cx - 8 + k * 2; P.vline(x, cy + 3, 2 + (k % 3), '#cfe8ff'); P.px(x, cy + 5 + (k % 3), '#ffffff'); }
    P.ellipse(cx, cy + 8, 2, 2, OR[3]); P.px(cx, cy + 11, OR[2]);
    bras.filter((b) => b[2] >= 0).forEach(branche);
    return fini(c, cx, 0, { lumieres: bras.map(([x, y]) => [x, y - 5, 34, 'lamp']) });
  }
  // le bar en zinc : façade en noyer, repose-pieds en laiton, caisse enregistreuse, percolateur, verres, clémentines
  function bar(w) {
    const H = 40, { c, P } = mk(w, H), r = PX.rng(31);
    P.rect(1, 14, w - 2, 22, NOYER[3]);
    const n = Math.max(2, Math.round((w - 6) / 26)), pw = Math.floor((w - 6) / n);
    for (let k = 0; k < n; k++) panneau(P, 3 + k * pw, 16, pw - 2, 15);
    P.rect(0, 35, w, 5, NOYER[1]); P.hline(0, 35, w, NOYER[2]);
    P.hline(2, 32, w - 4, OR[3]); P.hline(2, 33, w - 4, OR[1]); for (let x = 6; x < w - 4; x += 20) { P.vline(x, 30, 3, OR[2]); P.px(x, 30, OR[4]); }
    // le comptoir de zinc, qui déborde un peu
    P.rect(0, 8, w, 6, INOX[4]); P.hline(0, 8, w, INOX[6]); P.hline(0, 9, w, INOX[5]); P.hline(0, 13, w, INOX[2]); P.dither(0, 10, w, 3, INOX[5], 3);
    // la caisse enregistreuse
    P.rect(4, 0, 14, 9, OR[2]); P.rect(5, 1, 12, 4, OR[3]); P.hline(5, 1, 12, OR[5]); P.rect(7, 2, 8, 2, '#1d1626'); P.px(8, 2, '#f2c230'); P.px(10, 2, '#f2c230');
    for (let k = 0; k < 4; k++) P.px(6 + k * 3, 6, LIN[4]); P.rect(4, 7, 14, 2, OR[1]);
    // le percolateur de cuivre et son aigle
    const px = w - 22;
    P.rect(px, 0, 10, 8, CUIVRE[3]); P.ellipse(px + 5, 0, 5, 2, CUIVRE[4]); P.vline(px, 0, 8, CUIVRE[4]); P.vline(px + 9, 0, 8, CUIVRE[1]); P.px(px + 5, 0, OR[5]);
    P.rect(px - 2, 5, 2, 1, INOX[3]); P.rect(px + 10, 5, 2, 1, INOX[3]); P.px(px + 2, 3, OR[4]);
    // des verres retournés, une coupe de clémentines
    for (let k = 0; k < 5; k++) { const x = 24 + k * 3; P.rect(x, 4, 2, 3, '#cfe6f2'); P.px(x, 4, '#ffffff'); P.px(x + 1, 7, '#a8c8d8'); }
    const bx = Math.round(w / 2) + 4;
    P.ellipse(bx, 7, 5, 2, LIN[3]); for (let k = 0; k < 6; k++) P.ellipse(bx - 3 + (k % 3) * 3, 5 - (k > 2 ? 1 : 0), 1, 1, k % 2 ? '#f08a24' : '#e8742a'); P.px(bx, 3, VERT[3]);
    veines(P, r, 1, 15, w - 2, 15, NOYER[2], 6, 4);
    return fini(c, 0, H - 1, { percolateur: [px + 6, 0] });
  }
  // un tabouret de bar : assise de velours, pied de laiton
  function tabouret() {
    const { c, P } = mk(11, 20);
    P.ellipse(5, 4, 5, 2, VELOURS[3]); P.ellipse(4, 3, 3, 1, VELOURS[5]); P.hline(1, 6, 9, OR[2]);
    P.rect(4, 7, 3, 10, OR[3]); P.vline(4, 7, 10, OR[5]); anneau(P, 5, 12, 3, 1, OR[2]);
    P.ellipse(5, 18, 4, 1, OR[2]);
    return fini(c, 5, 19);
  }
  // le chariot des desserts : deux plateaux de laiton, la bûche, la tarte, un gâteau sous cloche ; une place
  // vide pour le Paris-Brest (la carte l'y pose quand l'épreuve est gagnée)
  function chariot() {
    const W = 44, H = 36, { c, P } = mk(W, H);
    for (const x of [2, W - 4]) { P.rect(x, 6, 2, 26, OR[2]); P.vline(x, 6, 26, OR[4]); }
    for (const y of [12, 26]) { P.rect(0, y, W, 3, OR[3]); P.hline(0, y, W, OR[5]); P.hline(0, y + 2, W, OR[1]); P.dither(2, y - 1, W - 4, 1, LIN[3], 6); }
    P.ellipse(4, 33, 2, 2, '#1d1626'); P.ellipse(W - 5, 33, 2, 2, '#1d1626'); P.px(4, 33, INOX[4]); P.px(W - 5, 33, INOX[4]);
    // la bûche
    P.rect(5, 6, 13, 6, '#5a3020'); P.ellipse(17, 8, 2, 3, '#7a4a2a'); P.px(17, 8, '#c89a5a'); P.hline(5, 6, 12, '#7a4a2a');
    for (let x = 6; x < 17; x += 2) P.px(x, 5, LIN[4]); P.px(9, 4, '#d8323a'); P.px(10, 4, VERT[3]); P.px(13, 4, '#f2c230');
    // la cloche de verre sur un gâteau aux fruits rouges
    P.ellipse(31, 8, 6, 3, '#f6e2c8'); P.ellipse(31, 7, 5, 2, '#e8a8b8'); P.px(29, 6, '#d8323a'); P.px(32, 6, '#d8323a');
    anneau(P, 31, 6, 7, 6, '#bfe0ee'); P.px(28, 1, '#ffffff'); P.px(27, 2, '#ffffff'); P.px(31, 0, '#9ac8e0');
    // en bas : des assiettes à dessert, une tarte
    for (let k = 0; k < 4; k++) P.ellipse(9, 24 - k, 4, 1, k % 2 ? LIN[4] : LIN[2]);
    P.ellipse(29, 23, 7, 2, '#c8843a'); P.ellipse(29, 22, 6, 1, '#f2c230'); for (let k = 0; k < 5; k++) P.px(25 + k * 2, 22, k % 2 ? '#d8323a' : '#3a7a3a');
    return fini(c, W / 2, H - 1, { place: [22, 9] });
  }
  // le petit Paris-Brest du chariot (14 × 7)
  function parisBrestMini() {
    const { c, P } = mk(16, 9);
    P.ellipse(8, 5, 7, 3, '#b8742a'); P.ellipse(8, 4, 6, 2, '#d8a050'); anneau(P, 8, 4, 6, 2, '#e8c070');
    P.ellipse(8, 5, 3, 1, '#7a4a22'); for (let k = 0; k < 7; k++) P.px(3 + k * 2, 3 + (k % 2), '#f6ead2'); P.px(5, 2, '#ffffff'); P.px(10, 2, '#ffffff');
    P.hline(2, 6, 12, '#f6dca0');
    return fini(c, 8, 8);
  }
  // le piano à queue, couvercle ouvert, avec sa partition et son chandelier
  function piano() {
    const W = 62, H = 48, { c, P } = mk(W, H), N = ['#100c14', '#1e1824', '#2e2838', '#4a4458', '#7a7490'];
    // le couvercle relevé, puis la caisse
    P.trap(14, 30, 6, 52, 0, 12, N[2]); line(P, 18, 12, 30, 2, N[1]); P.trap(16, 26, 10, 44, 1, 10, '#6a4a2a'); for (let x = 14; x < 52; x += 3) P.px(x, 9, OR[2]);
    P.trap(4, 54, 2, 58, 12, 10, N[1]); P.hline(4, 12, 54, N[4]); P.dither(6, 13, 40, 3, N[3], 6);
    P.rect(2, 22, 58, 12, N[1]); P.hline(2, 22, 58, N[3]); P.vline(2, 22, 12, N[3]);
    // le clavier
    P.rect(6, 24, 50, 5, '#f4f0e6'); for (let x = 6; x < 56; x += 3) P.vline(x, 24, 5, '#c8c0b0'); for (let x = 7; x < 55; x += 3) if ((x / 3 | 0) % 7 !== 2 && (x / 3 | 0) % 7 !== 6) P.rect(x, 24, 2, 3, '#1d1626');
    P.rect(6, 29, 50, 1, N[0]);
    P.rect(24, 15, 14, 7, '#f6f0e0'); P.vline(31, 15, 7, '#d8d0c0'); for (let y = 16; y < 21; y += 2) { P.hline(25, y, 5, '#8a8070'); P.hline(32, y, 5, '#8a8070'); }
    // les pieds
    for (const x of [6, 54]) { P.rect(x, 34, 3, 12, N[1]); P.vline(x, 34, 12, N[3]); P.rect(x - 1, 45, 5, 2, OR[2]); }
    P.rect(28, 30, 6, 4, OR[2]); for (const x of [28, 31]) P.vline(x + 1, 34, 6, OR[3]);
    // le chandelier posé sur la caisse
    P.rect(48, 6, 2, 6, OR[3]); bougie(P, 48, 6, 4);
    return fini(c, W / 2, H - 1, { flammes: [[48, 0]] });
  }
  // la banquette du pianiste (posée devant lui : elle cache ses jambes)
  function bancPiano() { const { c, P } = mk(20, 9); P.rect(0, 0, 20, 4, '#1e1824'); P.hline(0, 0, 20, '#4a4458'); P.rect(1, 4, 18, 1, '#100c14'); for (const x of [1, 17]) P.rect(x, 5, 2, 4, '#1e1824'); return fini(c, 10, 8); }
  // le pupitre du maître d'hôtel : le livre des réservations et sa lampe de banquier
  function pupitre() {
    const { c, P } = mk(24, 34);
    P.rect(2, 10, 20, 22, NOYER[3]); panneau(P, 4, 13, 16, 15); P.rect(0, 31, 24, 3, NOYER[1]);
    P.trap(0, 24, 1, 22, 6, 5, NOYER[4]); P.hline(0, 6, 24, NOYER[5]);
    P.rect(3, 4, 9, 4, LIN[4]); P.rect(12, 4, 8, 4, LIN[3]); for (let y = 5; y < 8; y++) { P.hline(4, y, 6, '#8a8a9a'); P.hline(13, y, 5, '#8a8a9a'); } P.vline(12, 4, 4, LIN[1]); P.px(16, 8, '#d8323a');
    P.rect(18, 0, 2, 5, OR[2]); P.ellipse(16, 0, 4, 2, '#2c7a44'); P.hline(13, 0, 6, '#5ac07a'); P.px(16, 2, '#fff1bb');
    return fini(c, 12, 33, { lumieres: [[16, 2, 26, 'lamp']] });
  }
  // un portemanteau de laiton : manteaux, écharpe rouge, chapeau, et le porte-parapluies
  function portemanteau() {
    const { c, P } = mk(20, 46);
    P.rect(9, 4, 2, 40, OR[2]); P.vline(9, 4, 40, OR[4]); P.ellipse(10, 44, 6, 1, OR[1]); P.ellipse(10, 3, 2, 1, OR[4]);
    for (const [x, y] of [[4, 7], [15, 7], [5, 12], [14, 12]]) { P.px(x, y, OR[3]); line(P, 10, y + 2, x, y, OR[2]); }
    P.trap(9, 6, 2, 9, 9, 20, '#a8784a'); P.vline(3, 10, 18, '#c8986a'); P.vline(7, 12, 16, '#7a5432'); P.px(5, 14, '#5a3a24'); P.px(5, 18, '#5a3a24');
    P.trap(11, 6, 11, 8, 12, 18, '#2a3050'); P.vline(17, 13, 16, '#1a2038'); P.vline(12, 13, 14, '#3a4268');
    P.rect(8, 9, 3, 16, '#c8283a'); P.vline(8, 9, 16, '#e84a5a'); for (let x = 8; x < 11; x++) P.px(x, 25, '#f2c230');
    P.ellipse(15, 5, 4, 1, '#1d1626'); P.rect(13, 1, 5, 4, '#2a2430'); P.hline(13, 3, 5, '#8a2a3a');
    P.rect(1, 34, 6, 10, '#3a5a7a'); P.hline(1, 34, 6, '#5a8aaa'); line(P, 2, 34, 0, 26, '#1d1626'); line(P, 5, 34, 6, 28, '#7a1a2a'); P.px(0, 26, OR[3]);
    return fini(c, 10, 45);
  }
  // un palmier en pot (kentia), dans une jardinière de laiton
  function palmier(seed) {
    const r = PX.rng(seed), { c, P } = mk(32, 46);
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI / 2 + (k - 4) * 0.36 + (r() - 0.5) * 0.2, L = 14 + r.int(6);
      let x = 16, y = 32;
      for (let s = 0; s < L; s++) {
        x += Math.cos(a) * 1.1; y += Math.sin(a) * 1.1 + s * 0.06;
        P.px(Math.round(x), Math.round(y), VERT[2]);
        if (s > 3 && s % 2 === 0) { const dx = Math.round(Math.cos(a + 1.3) * 3), dy = Math.round(Math.sin(a + 1.3) * 3) + 1; line(P, Math.round(x), Math.round(y), Math.round(x + dx), Math.round(y + dy), s < L / 2 ? VERT[3] : VERT[1]); line(P, Math.round(x), Math.round(y), Math.round(x - dx), Math.round(y + dy), VERT[2]); }
        if (s > 4 && s % 4 === 1) P.px(Math.round(x) - 1, Math.round(y) - 1, VERT[4]);
      }
    }
    P.trap(9, 14, 11, 10, 32, 13, OR[3]); P.hline(9, 32, 14, OR[5]); P.hline(10, 36, 12, OR[1]); P.hline(10, 40, 12, OR[1]); P.vline(10, 33, 11, OR[4]); P.vline(21, 33, 11, OR[1]);
    P.ellipse(16, 32, 6, 1, '#3a2418');
    return fini(c, 16, 45);
  }
  // l'ardoise du menu, sur son chevalet
  function ardoise(lignes) {
    const { c, P } = mk(26, 38);
    line(P, 4, 37, 9, 2, CHENE[1]); line(P, 21, 37, 16, 2, CHENE[1]); line(P, 13, 37, 13, 30, CHENE[0]);
    P.rect(1, 4, 24, 24, CHENE[2]); P.rect(2, 5, 22, 22, '#2a3430'); P.dither(2, 5, 22, 22, '#34403a', 4); P.hline(1, 4, 24, CHENE[4]);
    lignes.forEach((m, k) => Arendelle.texte(P, m, 13 - Math.floor(Arendelle.largeurTexte(m) / 2), 7 + k * 7, k ? '#e8e4d8' : '#f2c230'));
    P.px(19, 24, '#ff8a9a'); P.px(21, 24, '#ff8a9a'); P.hline(19, 25, 3, '#ff8a9a'); P.px(20, 26, '#ff8a9a');
    P.rect(1, 28, 24, 2, CHENE[1]); P.rect(3, 27, 4, 1, '#f4f2ec');
    return fini(c, 13, 37);
  }
  // un seau à champagne sur son pied
  function seauChampagne() {
    const { c, P } = mk(12, 30);
    line(P, 2, 29, 5, 12, INOX[3]); line(P, 9, 29, 6, 12, INOX[3]); anneau(P, 6, 20, 3, 1, INOX[4]);
    P.rect(1, 4, 10, 9, INOX[4]); P.vline(1, 4, 9, INOX[6]); P.vline(10, 4, 9, INOX[2]); P.ellipse(6, 4, 5, 1, INOX[1]); P.px(3, 3, '#e8f6ff'); P.px(8, 3, '#e8f6ff');
    P.rect(5, 0, 2, 5, '#1e3a24'); P.px(5, 0, OR[4]); P.rect(7, 2, 3, 6, LIN[4]);
    return fini(c, 6, 29);
  }
  // la desserte des serveurs : piles d'assiettes, serviettes pliées, carafes
  function desserte() {
    const W = 40, { c, P } = mk(W, 30);
    P.rect(1, 9, W - 2, 18, NOYER[3]); panneau(P, 3, 11, 16, 13); panneau(P, 21, 11, 16, 13); P.px(18, 17, OR[4]); P.px(22, 17, OR[4]);
    P.rect(0, 6, W, 4, NOYER[4]); P.hline(0, 6, W, NOYER[5]); P.rect(0, 27, W, 3, NOYER[1]);
    for (let k = 0; k < 6; k++) P.ellipse(8, 5 - k, 5, 1, k % 2 ? LIN[4] : LIN[2]);
    for (let k = 0; k < 3; k++) { P.rect(16 + k * 5, 1, 4, 5, LIN[4]); P.px(16 + k * 5, 1, VELOURS[4]); }
    P.rect(32, 0, 4, 6, '#cfe6f2'); P.px(32, 0, '#ffffff'); P.rect(33, 0, 2, 1, '#a8c8d8');
    return fini(c, W / 2, 29);
  }
  // un paquet cadeau (sous le sapin)
  function cadeaux(seed) {
    const r = PX.rng(seed), { c, P } = mk(34, 14);
    const box = (x, y, w, h, col, ruban) => { P.rect(x, y, w, h, col); P.rect(x, y, w, 2, PX.shade(col, 0.25)); P.vline(x + w - 1, y, h, PX.shade(col, -0.3)); P.vline(x + (w >> 1), y, h, ruban); P.hline(x, y + 1, w, ruban); P.px(x + (w >> 1) - 1, y - 1, ruban); P.px(x + (w >> 1) + 1, y - 1, ruban); };
    box(0, 5, 10, 9, '#2c6aa8', '#f2c230'); box(9, 2, 9, 12, '#c8283a', '#f4f2ec'); box(18, 7, 8, 7, '#2c7a44', '#d8323a'); box(25, 4, 9, 10, r.pick(['#e8b54a', '#8a4a8a']), '#f4f2ec');
    return fini(c, 17, 13);
  }

  // ------------------------------------------------------------ LA SALLE : le mur du fond (peint sur le sol)
  // le papier peint bordeaux à motifs dorés
  function papierPeint(P, x0, y0, w, h) {
    P.rect(x0, y0, w, h, VELOURS[1]);
    for (let y = y0 + 3, j = 0; y < y0 + h - 4; y += 9, j++) for (let x = x0 + 4 + (j % 2) * 7; x < x0 + w - 2; x += 14) {
      P.px(x, y, OR[1]); P.px(x - 1, y + 1, OR[1]); P.px(x + 1, y + 1, OR[1]); P.px(x, y + 2, VELOURS[3]); P.px(x - 2, y + 2, OR[0]); P.px(x + 2, y + 2, OR[0]); P.px(x, y + 3, OR[1]);
    }
    P.dither(x0, y0, w, 8, '#1a0608', 8);
  }
  // un pilastre de noyer cannelé, chapiteau et base dorés
  function pilastre(P, x, y0, y1) {
    P.rect(x, y0, 8, y1 - y0, NOYER[3]); P.vline(x, y0, y1 - y0, NOYER[4]); P.vline(x + 7, y0, y1 - y0, NOYER[1]);
    for (const dx of [2, 5]) { P.vline(x + dx, y0 + 6, y1 - y0 - 12, NOYER[2]); P.vline(x + dx + 1, y0 + 6, y1 - y0 - 12, NOYER[5]); }
    P.rect(x - 1, y0, 10, 4, OR[3]); P.hline(x - 1, y0, 10, OR[5]); P.hline(x - 1, y0 + 3, 10, OR[1]); P.px(x + 1, y0 + 1, OR[1]); P.px(x + 6, y0 + 1, OR[1]);
    P.rect(x - 1, y1 - 4, 10, 4, NOYER[2]); P.hline(x - 1, y1 - 4, 10, OR[3]);
  }
  // un grand miroir doré, en arc
  function miroir(P, x, y, w, h) {
    P.rect(x, y + 6, w, h - 6, OR[2]); P.ellipse(x + w / 2, y + 6, w / 2, 6, OR[2]);
    P.rect(x + 2, y + 7, w - 4, h - 9, '#2e2a44'); P.ellipse(x + w / 2, y + 7, w / 2 - 2, 5, '#2e2a44');
    P.vgrad(x + 2, y + 7, w - 4, h - 9, '#3a3654', '#2a2640');
    for (let k = 0; k < 3; k++) { const sx = x + 6 + k * 9; line(P, sx, y + h - 4, sx + 8, y + 10, k === 1 ? '#5a587a' : '#46445f'); }
    for (const [dx, dy] of [[0.3, 0.5], [0.7, 0.4], [0.5, 0.7]]) { P.px(x + Math.round(w * dx), y + Math.round(h * dy), '#ffe6a0'); P.px(x + Math.round(w * dx), y + Math.round(h * dy) - 1, '#fff4c8'); }
    P.hline(x, y + h - 1, w, OR[1]); P.vline(x, y + 6, h - 6, OR[4]); P.vline(x + w - 1, y + 6, h - 6, OR[1]);
    P.ellipse(x + w / 2, y + 1, 3, 2, OR[4]); P.px(x + w / 2, y - 1, OR[5]);
  }
  // une applique de laiton à tulipe de verre dépoli (la carte y met une lumière)
  function applique(P, x, y) {
    P.rect(x - 1, y + 4, 3, 5, OR[2]); P.px(x, y + 5, OR[4]); line(P, x, y + 6, x, y + 2, OR[3]);
    P.rect(x - 2, y - 3, 5, 4, '#f6ecd0'); P.hline(x - 2, y - 3, 5, '#fff8e8'); P.px(x + 2, y - 2, '#d8c8a0'); P.hline(x - 1, y + 1, 3, '#ffe8a0');
  }
  // les portes battantes de la cuisine, leurs hublots éclairés et leurs plaques de laiton
  function portesCuisine(P, x, y, h) {
    P.rect(x - 4, y - 6, 52, h + 6, NOYER[1]); P.rect(x - 2, y - 4, 48, h + 4, NOYER[2]);
    P.rect(x + 4, y - 14, 36, 8, OR[2]); P.rect(x + 5, y - 13, 34, 6, NOYER[1]); Arendelle.texte(P, 'CUISINE', x + 9, y - 12, OR[4]);
    for (const dx of [0, 23]) {
      P.rect(x + dx, y, 21, h, NOYER[3]); P.vline(x + dx, y, h, NOYER[4]); P.vline(x + dx + 20, y, h, NOYER[1]);
      P.ellipse(x + dx + 10, y + 12, 6, 6, OR[2]); P.ellipse(x + dx + 10, y + 12, 5, 5, '#ffe6a0'); P.ellipse(x + dx + 9, y + 11, 3, 3, '#fff4c8'); P.px(x + dx + 12, y + 14, '#f0b860');
      P.rect(x + dx + 4, y + 24, 13, 5, OR[3]); P.hline(x + dx + 4, y + 24, 13, OR[5]);
      P.rect(x + dx + 1, y + h - 8, 19, 7, OR[2]); P.hline(x + dx + 1, y + h - 8, 19, OR[4]); P.dither(x + dx + 1, y + h - 7, 19, 6, OR[1], 6);
    }
  }
  // les étagères à bouteilles du bar, devant un miroir
  function etageresBar(P, x, y, w, h, seed) {
    const r = PX.rng(seed);
    P.rect(x, y, w, h, NOYER[2]); P.rect(x + 3, y + 3, w - 6, h - 6, '#2e2a44'); P.vgrad(x + 3, y + 3, w - 6, h - 6, '#3a3654', '#262238');
    for (let k = 0; k < 4; k++) line(P, x + 8 + k * 18, y + h - 4, x + 20 + k * 18, y + 4, '#44425c');
    const rayons = [y + 18, y + 32, y + 46].filter((yy) => yy < y + h - 4);
    for (const ry of rayons) {
      P.rect(x + 2, ry, w - 4, 2, NOYER[4]); P.hline(x + 2, ry, w - 4, NOYER[5]); P.hline(x + 2, ry + 2, w - 4, NOYER[1]);
      for (let bx = x + 5; bx < x + w - 8;) {
        const t = r.int(5), col = ['#1e3a24', '#5a1a1a', '#8a5a1a', '#2a4a6a', '#c89a3a'][t], hh = 8 + r.int(4);
        if (t === 4) { P.ellipse(bx + 2, ry - 3, 3, 3, col); P.rect(bx + 1, ry - 8, 2, 3, col); P.px(bx + 1, ry - 4, '#f8e0a0'); bx += 7; continue; }
        P.rect(bx, ry - hh + 3, 3, hh - 3, col); P.rect(bx + 1, ry - hh, 1, 3, col); P.vline(bx, ry - hh + 4, hh - 5, PX.shade(col, 0.45));
        if (r.chance(0.6)) P.rect(bx, ry - 6, 3, 2, r.pick(['#f4f2ec', '#e8b54a', '#d8323a']));
        bx += 4 + r.int(2);
      }
    }
    // des verres à pied suspendus, tête en bas
    for (let gx = x + 6; gx < x + w - 6; gx += 4) { P.px(gx, y + 4, '#a8c8d8'); P.px(gx, y + 5, '#cfe6f2'); P.rect(gx - 1, y + 6, 3, 2, '#cfe6f2'); P.px(gx - 1, y + 6, '#ffffff'); }
    P.hline(x, y, w, NOYER[4]); P.rect(x - 1, y - 2, w + 2, 2, OR[2]);
  }
  // le portrait de Gusteau, dans un cadre doré sculpté, sous sa petite lampe de tableau
  function grandPortrait(P, x, y) {
    const gu = Resto.gusteau();
    P.rect(x - 6, y - 6, gu.width + 12, gu.height + 12, OR[2]); P.rect(x - 5, y - 5, gu.width + 10, gu.height + 10, OR[3]);
    P.hline(x - 6, y - 6, gu.width + 12, OR[5]); P.vline(x - 6, y - 6, gu.height + 12, OR[4]); P.hline(x - 6, y + gu.height + 5, gu.width + 12, OR[1]); P.vline(x + gu.width + 5, y - 6, gu.height + 12, OR[1]);
    for (const [cx, cy] of [[x - 4, y - 4], [x + gu.width + 3, y - 4], [x - 4, y + gu.height + 3], [x + gu.width + 3, y + gu.height + 3]]) { P.ellipse(cx, cy, 2, 2, OR[4]); P.px(cx, cy, OR[1]); }
    for (let k = 0; k < gu.width + 6; k += 4) { P.px(x - 3 + k, y - 5, OR[1]); P.px(x - 3 + k, y + gu.height + 4, OR[4]); }
    P.draw(gu, x, y);
    P.rect(x + 6, y - 12, gu.width - 12, 3, OR[3]); P.hline(x + 6, y - 12, gu.width - 12, OR[5]); P.rect(x + gu.width / 2 - 1, y - 9, 2, 3, OR[2]);
    P.dither(x, y, gu.width, 10, '#fff0c0', 3);
  }

  // ------------------------------------------------------------ LA CUISINE : les objets posés au sol
  // le grand piano de cuisson (contre le mur, sous la hotte) : six feux, une plaque, les fours
  function fourneau(w = 196) {
    const H = 66, { c, P } = mk(w, H), top = 14, prof = 20, r = PX.rng(5);
    // la façade en inox : la rangée de boutons, les portes des fours avec leur hublot, la barre à torchons
    const fy = top + prof;
    P.rect(0, fy, w, H - fy - 4, INOX[4]); P.dither(0, fy, w, H - fy - 4, INOX[3], 5); P.hline(0, fy, w, INOX[6]); P.vline(0, fy, H - fy - 4, INOX[5]);
    for (let x = 8; x < w - 6; x += 12) { P.ellipse(x, fy + 4, 2, 2, '#1d1626'); P.px(x, fy + 3, INOX[6]); P.px(x - 1, fy + 3, INOX[2]); }
    const portes = [[6, 42], [52, 42], [98, 42], [144, w - 150]];
    for (const [px, pw] of portes) {
      P.rect(px, fy + 9, pw, H - fy - 15, INOX[3]); P.hline(px, fy + 9, pw, INOX[5]); P.vline(px + pw - 1, fy + 9, H - fy - 15, INOX[1]);
      P.rect(px + 6, fy + 14, pw - 12, 8, '#2a1410'); P.vgrad(px + 6, fy + 14, pw - 12, 8, '#4a1e10', '#c8501e'); P.hline(px + 6, fy + 14, pw - 12, '#1d1626');
      P.rect(px + 3, fy + 10, pw - 6, 2, INOX[6]); P.px(px + 3, fy + 11, INOX[2]);
    }
    P.rect(0, H - 4, w, 4, INOX[0]); P.hline(0, H - 4, w, INOX[1]);
    P.hline(2, fy + 1 + 0, w - 4, OR[3]);
    for (const [tx, col] of [[30, '#f4f2ec'], [118, '#f4f2ec'], [70, LIN[3]]]) { P.rect(tx, fy + 1, 8, 12, col); P.hline(tx, fy + 4, 8, '#3a6aa8'); P.hline(tx, fy + 6, 8, '#3a6aa8'); P.vline(tx + 7, fy + 1, 12, LIN[1]); }
    // le dessus en fonte : six brûleurs en deux rangées, la plaque à droite
    P.rect(0, top, w, prof, '#24222c'); P.hline(0, top, w, '#3a3846'); P.hline(0, fy - 1, w, INOX[5]); P.hline(0, fy - 2, w, '#3a3846');
    const feux = [];
    for (let k = 0; k < 6; k++) {
      const bx = 18 + (k % 3) * 36 + (k > 2 ? 8 : 0), by = top + (k > 2 ? 14 : 6);
      anneau(P, bx, by, 7, 3, '#4a4858'); P.hline(bx - 7, by, 15, '#4a4858'); P.vline(bx, by - 3, 7, '#4a4858'); P.ellipse(bx, by, 2, 1, '#121016');
      feux.push([bx, by]);
    }
    const pl = 128; P.rect(pl, top + 3, w - pl - 6, prof - 6, INOX[2]); P.rect(pl + 1, top + 4, w - pl - 8, prof - 8, INOX[3]); P.dither(pl + 1, top + 4, w - pl - 8, prof - 8, INOX[4], 3); P.hline(pl, top + 3, w - pl - 6, INOX[5]);
    // les casseroles : la marmite du bouillon, la sauce tomate, la poêle de ratatouille, la sauteuse, la cocotte
    const fumees = [], bulles = [];
    const [m, s, f] = [feux[0], feux[1], feux[2]];
    P.rect(m[0] - 9, m[1] - 18, 19, 18, INOX[4]); P.vline(m[0] - 9, m[1] - 18, 18, INOX[6]); P.vline(m[0] + 9, m[1] - 18, 18, INOX[2]); P.dither(m[0] + 2, m[1] - 18, 7, 18, INOX[3], 8);
    P.ellipse(m[0], m[1] - 18, 9, 3, INOX[2]); P.ellipse(m[0], m[1] - 18, 8, 2, '#8a5a2a'); P.ellipse(m[0] - 2, m[1] - 19, 3, 1, '#b07a3a');
    for (const dx of [-11, 10]) P.rect(m[0] + dx, m[1] - 15, 2, 3, INOX[2]);
    P.hline(m[0] - 9, m[1] - 10, 19, INOX[5]);
    fumees.push([m[0], m[1] - 22]); bulles.push([m[0], m[1] - 18, 7, 2, '#c08a4a']);
    P.rect(s[0] - 8, s[1] - 9, 17, 9, CUIVRE[3]); P.vline(s[0] - 8, s[1] - 9, 9, CUIVRE[5]); P.vline(s[0] + 8, s[1] - 9, 9, CUIVRE[1]); P.hline(s[0] - 8, s[1] - 6, 17, CUIVRE[4]);
    P.ellipse(s[0], s[1] - 9, 8, 2, CUIVRE[2]); P.ellipse(s[0], s[1] - 9, 7, 1, '#b8281e'); P.px(s[0] - 3, s[1] - 10, '#e84a3a'); P.rect(s[0] + 9, s[1] - 7, 10, 2, NOYER[2]);
    fumees.push([s[0] - 2, s[1] - 12]); bulles.push([s[0], s[1] - 9, 6, 1, '#e84a3a']);
    P.rect(f[0] - 9, f[1] - 18, 19, 14, '#2a2a36'); P.vline(f[0] - 9, f[1] - 18, 14, '#4a4a5c'); P.ellipse(f[0], f[1] - 18, 9, 3, '#1e1e28'); P.ellipse(f[0], f[1] - 21, 7, 2, '#3a3a4c'); P.rect(f[0] - 1, f[1] - 24, 3, 2, '#5a5a6c');
    fumees.push([f[0] + 6, f[1] - 22]);
    const [a, b, d] = [feux[3], feux[4], feux[5]];
    P.ellipse(a[0], a[1] - 3, 10, 3, CUIVRE[2]); P.ellipse(a[0], a[1] - 4, 9, 2, CUIVRE[1]); anneau(P, a[0], a[1] - 4, 10, 3, CUIVRE[4]); P.rect(a[0] - 22, a[1] - 4, 12, 2, CUIVRE[2]);
    for (let k = 0; k < 16; k++) P.px(a[0] - 7 + r.int(15), a[1] - 5 + r.int(3), r.pick([...LEGUMES.tomate.slice(1), ...LEGUMES.courgette.slice(1), LEGUMES.aubergine[1], LEGUMES.poivron[1]]));
    fumees.push([a[0], a[1] - 8]);
    P.ellipse(d[0], d[1] - 3, 9, 3, '#1e1e26'); P.ellipse(d[0], d[1] - 4, 8, 2, '#34343e'); P.rect(d[0] + 9, d[1] - 4, 12, 2, '#1e1e26');
    P.ellipse(d[0] - 3, d[1] - 4, 2, 1, '#f4e8c8'); P.ellipse(d[0] + 3, d[1] - 4, 2, 1, '#f4e8c8'); P.px(d[0] - 3, d[1] - 4, '#f2b230'); P.px(d[0] + 3, d[1] - 4, '#f2b230');
    // sur la plaque : une sauteuse et une louche
    P.ellipse(pl + 22, top + 9, 9, 3, INOX[1]); P.ellipse(pl + 22, top + 8, 8, 2, '#d8a050'); P.px(pl + 19, top + 8, '#f0c870'); P.px(pl + 25, top + 7, '#8a5a2a'); fumees.push([pl + 22, top + 4]);
    P.rect(pl + 40, top + 6, 2, 8, INOX[5]); P.ellipse(pl + 41, top + 14, 3, 1, INOX[4]);
    return fini(c, 0, H - 1, { feux: [b, ...feux.slice(0, 3), a, d].map(([x, y]) => [x, y]), fumees, bulles, devant: fy });
  }
  // l'îlot de la pâtisserie : plan de marbre, tiroirs de chêne clair, couronnes de pâte à choux, poches à douille, robot
  function ilotPatisserie() {
    const W = 108, H = 50, { c, P } = mk(W, H), r = PX.rng(77), top = 6, prof = 18, fy = top + prof;
    P.rect(1, fy, W - 2, H - fy - 3, CHENE[3]); P.vline(1, fy, H - fy - 3, CHENE[4]); P.vline(W - 2, fy, H - fy - 3, CHENE[1]);
    for (let k = 0; k < 4; k++) { const dx = 4 + k * 26; panneau(P, dx, fy + 3, 23, 8, CHENE); panneau(P, dx, fy + 12, 23, H - fy - 18, CHENE); P.rect(dx + 9, fy + 6, 5, 2, OR[3]); P.px(dx + 9, fy + 6, OR[5]); }
    P.rect(0, H - 3, W, 3, CHENE[0]);
    // le marbre veiné, son chant arrondi
    P.rect(0, top, W, prof, MARBRE[3]); P.dither(0, top, W, prof, MARBRE[2], 4); veines(P, r, 1, top + 1, W - 2, prof - 3, MARBRE[1], 16, 8); veines(P, r, 1, top + 1, W - 2, prof - 3, MARBRE[4], 12, 4);
    P.hline(0, top, W, MARBRE[2]); P.rect(0, fy - 2, W, 2, MARBRE[4]); P.hline(0, fy, W, MARBRE[1]); P.dither(0, top, W, prof, '#ffffff', 1);
    // de la farine sur le marbre
    P.dither(60, top + 4, 22, 9, '#ffffff', 6);
    // la plaque de cuisson : trois couronnes de pâte à choux dorées
    P.rect(4, top + 2, 40, 14, INOX[1]); P.rect(5, top + 3, 38, 12, INOX[2]); P.hline(4, top + 2, 40, INOX[4]);
    for (const [cx, cy] of [[12, top + 8], [24, top + 10], [36, top + 8]]) { anneau(P, cx, cy, 5, 3, '#a8641e', 2); anneau(P, cx, cy - 1, 5, 2, '#d89a48'); P.px(cx - 3, cy - 3, '#f0c070'); P.px(cx + 2, cy - 3, '#f6d8a0'); }
    // les poches à douille, le saladier de crème pralinée et son fouet, la boîte d'œufs, le pot d'amandes
    for (const [x, y] of [[48, top + 5], [54, top + 7]]) { P.trap(x, 6, x + 2, 2, y, 6, LIN[4]); P.px(x + 2, y + 6, INOX[4]); P.px(x + 1, y, LIN[2]); }
    P.ellipse(70, top + 9, 9, 4, CUIVRE[2]); P.ellipse(70, top + 7, 8, 3, CUIVRE[4]); P.ellipse(70, top + 7, 7, 2, '#d8b088'); P.ellipse(68, top + 6, 3, 1, '#ecd0a8');
    line(P, 72, top + 6, 79, top - 3, INOX[5]); anneau(P, 72, top + 5, 2, 2, INOX[5]);
    P.rect(84, top + 9, 12, 6, '#c8b090'); for (let k = 0; k < 4; k++) P.ellipse(85 + k * 3, top + 9, 1, 1, k % 2 ? '#f4ecd8' : '#d8a878');
    P.rect(98, top + 2, 7, 9, '#cfe6f2'); P.rect(99, top + 5, 5, 6, '#e8d0a0'); P.px(100, top + 6, '#c89a5a'); P.hline(98, top + 2, 7, '#ffffff'); P.rect(98, top + 1, 7, 2, CHENE[2]);
    // le robot pâtissier rouge
    P.rect(86, top - 6, 6, 14, '#a81a2a'); P.vline(86, top - 6, 14, '#e84a4a'); P.rect(84, top - 8, 14, 5, '#c8283a'); P.hline(84, top - 8, 14, '#f05a5a'); P.ellipse(91, top + 1, 4, 2, INOX[5]); P.px(97, top - 6, INOX[6]);
    return fini(c, W / 2, H - 1);
  }
  // le billot de Colette : bois de bout en damier, légumes de la ratatouille coupés, couteau, basilic
  function billot() {
    const W = 80, H = 46, { c, P } = mk(W, H), r = PX.rng(12), top = 4, prof = 16, fy = top + prof;
    for (const x of [3, W - 9]) { P.rect(x, fy, 6, H - fy - 2, NOYER[3]); P.vline(x, fy, H - fy - 2, NOYER[4]); }
    P.rect(3, H - 14, W - 6, 3, NOYER[2]); P.hline(3, H - 14, W - 6, NOYER[4]);
    for (let k = 0; k < 4; k++) { P.ellipse(16 + k * 15, H - 16, 6, 3, LEGUMES.oignon[k % 2]); P.px(14 + k * 15, H - 18, LEGUMES.oignon[2]); }
    for (let k = 0; k < 3; k++) { P.ellipse(22 + k * 16, H - 7, 5, 3, '#a8784a'); P.px(20 + k * 16, H - 8, '#c89a6a'); }
    P.rect(0, top, W, prof, CHENE[3]);
    for (let y = top; y < fy; y += 4) for (let x = (y / 4 % 2) * 5; x < W; x += 10) { P.rect(x, y, 5, 4, CHENE[4]); P.px(x + 1, y + 1, CHENE[5]); P.px(x + 3, y + 2, CHENE[2]); }
    P.rect(0, fy, W, 4, CHENE[2]); for (let x = 0; x < W; x += 5) P.vline(x, fy, 4, CHENE[1]); P.hline(0, fy, W, CHENE[5]); P.hline(0, top, W, CHENE[2]);
    // les légumes coupés : rondelles de courgette, de tomate, dés d'aubergine, lanières de poivron
    for (let k = 0; k < 6; k++) { const x = 6 + k * 4, y = top + 4 + (k % 2) * 3; P.ellipse(x, y, 2, 1, LEGUMES.courgette[2]); P.px(x, y, '#d8f0b0'); P.px(x + 2, y, LEGUMES.courgette[0]); }
    for (let k = 0; k < 5; k++) { const x = 8 + k * 4, y = top + 11; P.ellipse(x, y, 2, 1, LEGUMES.tomate[1]); P.px(x, y, '#ffb0a0'); }
    for (let k = 0; k < 7; k++) P.rect(34 + (k % 4) * 3, top + 9 + (k >> 2) * 3, 2, 2, k % 2 ? LEGUMES.aubergine[2] : '#e8e0c8');
    for (let k = 0; k < 4; k++) P.hline(50, top + 3 + k * 2, 6, k % 2 ? LEGUMES.poivron[1] : '#e8603a');
    // le couteau du chef
    P.rect(46, top + 12, 14, 2, INOX[5]); P.hline(46, top + 12, 14, INOX[6]); P.rect(60, top + 12, 7, 2, '#1d1626');
    // le basilic dans un pot, un tomate entière, une tête d'ail
    P.rect(68, top - 2, 7, 6, '#c86a3a'); P.hline(68, top - 2, 7, '#e88a5a'); for (let k = 0; k < 8; k++) P.px(68 + r.int(7), top - 6 + r.int(5), k % 2 ? VERT[3] : VERT[4]);
    P.ellipse(62, top + 4, 3, 3, LEGUMES.tomate[1]); P.px(61, top + 2, LEGUMES.tomate[2]); P.px(62, top + 1, VERT[3]);
    P.ellipse(70, top + 10, 3, 2, '#f4ecd8'); P.px(70, top + 8, '#d8c8a8');
    return fini(c, W / 2, H - 1, { planche: [28, top + 10] });
  }
  // la plonge : deux bacs profonds, le grand robinet, l'égouttoir, la pile de casseroles sales
  function plonge(w = 92) {
    const H = 46, { c, P } = mk(w, H), top = 14, prof = 14, fy = top + prof;
    P.rect(0, fy, w, H - fy - 3, INOX[4]); P.dither(0, fy, w, H - fy - 3, INOX[3], 6); P.hline(0, fy, w, INOX[6]);
    for (let x = 4; x < w - 20; x += 22) { P.rect(x, fy + 4, 18, H - fy - 10, INOX[3]); P.hline(x, fy + 4, 18, INOX[5]); P.rect(x + 7, fy + 7, 4, 1, INOX[6]); }
    P.rect(0, H - 3, w, 3, INOX[1]);
    P.rect(0, top, w, prof, INOX[5]); P.hline(0, top, w, INOX[6]);
    for (const bx of [4, 30]) { P.rect(bx, top + 2, 22, prof - 4, INOX[1]); P.rect(bx + 1, top + 3, 20, prof - 6, '#6a8aa0'); P.dither(bx + 1, top + 3, 20, prof - 6, '#8ab0c8', 6); P.hline(bx, top + 2, 22, INOX[0]); }
    for (let k = 0; k < 6; k++) P.ellipse(8 + k * 6, top + 5 + (k % 2) * 3, 1, 1, '#ffffff');
    // le grand robinet col de cygne
    P.rect(27, top - 1, 3, 4, INOX[4]); P.vline(28, top - 14, 13, INOX[5]); P.hline(28, top - 14, 8, INOX[5]); P.vline(35, top - 14, 6, INOX[5]); P.px(35, top - 8, INOX[3]); P.px(28, top - 15, INOX[6]);
    // l'égouttoir et ses assiettes debout, les casseroles empilées
    const ex = 58; P.rect(ex, top - 2, 30, 3, INOX[3]); for (let k = 0; k < 7; k++) { P.rect(ex + 2 + k * 4, top - 11, 2, 10, k % 2 ? LIN[4] : LIN[3]); P.px(ex + 2 + k * 4, top - 11, '#ffffff'); }
    P.ellipse(ex + 14, top + 8, 9, 3, INOX[2]); P.ellipse(ex + 14, top + 5, 8, 3, CUIVRE[3]); P.ellipse(ex + 13, top + 2, 6, 2, INOX[3]); P.rect(ex + 22, top + 4, 8, 2, CUIVRE[2]);
    P.rect(bx2(w), top + 4, 4, 6, '#3a8ac8'); P.hline(bx2(w), top + 4, 4, '#7ac8f8'); P.rect(bx2(w) + 5, top + 6, 5, 3, '#f2d020');
    return fini(c, w / 2, H - 1, { robinet: [35, top - 7] });
  }
  const bx2 = (w) => w - 12;
  // une étagère métallique : cagettes de légumes, sacs de farine et de sucre
  function etagere(seed) {
    const r = PX.rng(seed), W = 42, H = 60, { c, P } = mk(W, H);
    for (const x of [1, W - 3]) { P.rect(x, 0, 2, H, INOX[4]); P.vline(x, 0, H, INOX[6]); }
    const caisse = (x, y, leg) => {
      P.rect(x, y - 6, 16, 6, CHENE[3]); P.hline(x, y - 6, 16, CHENE[5]); P.hline(x, y - 3, 16, CHENE[1]); P.vline(x, y - 6, 6, CHENE[4]); P.vline(x + 15, y - 6, 6, CHENE[1]);
      const L = LEGUMES[leg]; for (let k = 0; k < 7; k++) P.ellipse(x + 2 + k * 2, y - 7 - (k % 2), 1 + (k % 2), 1, L[k % 2 ? 1 : 2]);
      if (leg === 'carotte') for (let k = 0; k < 4; k++) P.vline(x + 3 + k * 3, y - 10, 3, VERT[3]);
    };
    for (const [y, a, b] of [[16, 'tomate', 'courgette'], [34, 'carotte', 'oignon'], [52, 'aubergine', 'poivron']]) {
      P.rect(1, y, W - 2, 2, INOX[5]); for (let x = 2; x < W - 2; x += 2) P.px(x, y + 1, INOX[3]);
      if (y < 52) { caisse(4, y, a); caisse(22, y, b); }
      else { for (const [x, mot, col] of [[4, 'FARINE', '#f4efe2'], [22, 'SUCRE', '#f4efe2']]) { P.rect(x, y - 13, 16, 13, col); P.trap(x + 2, 12, x, 16, y - 15, 3, col); P.hline(x, y - 13, 16, '#ffffff'); P.vline(x + 15, y - 13, 13, LIN[1]); P.rect(x + 1, y - 8, 14, 5, mot === 'SUCRE' ? '#3a6aa8' : '#c8283a'); } P.px(9, 47, '#ffffff'); P.px(27, 47, '#ffffff'); }
    }
    P.rect(1, H - 2, W - 2, 2, INOX[2]);
    void r;
    return fini(c, W / 2, H - 1);
  }
  // le passe, au premier plan : comptoir d'inox, assiettes prêtes à partir, lampes chauffantes, rail à bons, la cloche
  function passe(w, seed, cloche) {
    const r = PX.rng(seed), H = 54, { c, P } = mk(w, H), top = 30, prof = 8, fy = top + prof;
    // les montants et la tablette des lampes chauffantes
    for (const x of [2, w - 5]) { P.rect(x, 4, 3, top, INOX[4]); P.vline(x, 4, top, INOX[6]); }
    P.rect(0, 2, w, 4, INOX[4]); P.hline(0, 2, w, INOX[6]); P.hline(0, 5, w, INOX[2]);
    // le rail à bons de commande, et ses tickets
    P.rect(4, 7, w - 8, 2, INOX[5]); for (let x = 10; x < w - 14; x += 16 + r.int(10)) { P.rect(x, 9, 8, 10, '#fbf8ee'); P.hline(x, 9, 8, '#ffffff'); for (let y = 11; y < 18; y += 2) P.hline(x + 1, y, 3 + r.int(5), '#8a8a9a'); P.px(x + 6, 17, '#d8323a'); }
    const lampes = [];
    for (let x = 18; x < w - 12; x += 34) { P.rect(x - 4, 6, 9, 3, '#8a2a1e'); P.hline(x - 4, 6, 9, '#c84a2a'); P.hline(x - 3, 9, 7, '#ffb070'); lampes.push([x, 12, 26, 'feu']); }
    // le comptoir
    P.rect(0, fy, w, H - fy - 2, INOX[4]); P.dither(0, fy, w, H - fy - 2, INOX[3], 5); P.hline(0, fy, w, INOX[6]);
    for (let x = 6; x < w - 6; x += 30) { P.rect(x, fy + 3, 24, H - fy - 7, INOX[2]); for (let k = 0; k < 5; k++) P.ellipse(x + 12, fy + H - fy - 6 - k * 2, 9, 1, k % 2 ? LIN[4] : LIN[2]); }
    P.rect(0, H - 2, w, 2, INOX[1]);
    P.rect(0, top, w, prof, INOX[5]); P.hline(0, top, w, INOX[6]); P.hline(0, fy - 1, w, INOX[3]);
    // les assiettes qui attendent sous les lampes
    for (let x = 14; x < w - 14; x += 22 + r.int(8)) { P.ellipse(x, top + 4, 7, 2, LIN[4]); P.ellipse(x, top + 4, 7, 2, LIN[3]); P.ellipse(x - 1, top + 3, 5, 1, LIN[4]); const m = r.pick(METS); P.ellipse(x, top + 3, 3, 1, m[0]); P.px(x - 1, top + 2, m[1]); P.px(x + 1, top + 3, m[2]); }
    if (cloche) { const x = w - 22; P.ellipse(x, top + 3, 4, 2, OR[2]); P.ellipse(x, top + 1, 3, 2, OR[4]); P.px(x - 1, top, OR[5]); P.px(x, top - 2, OR[3]); }
    return fini(c, 0, H - 1, { lumieres: lampes });
  }
  // la table de dressage, au milieu de la cuisine : assiettes qu'on dresse, biberons de sauce, herbes, pinces
  function tableDressage() {
    const W = 96, H = 44, { c, P } = mk(W, H), r = PX.rng(44), top = 6, prof = 14, fy = top + prof;
    for (const x of [2, W - 5]) { P.rect(x, fy, 3, H - fy - 1, INOX[3]); P.vline(x, fy, H - fy - 1, INOX[5]); }
    P.rect(2, H - 12, W - 4, 2, INOX[4]); P.hline(2, H - 12, W - 4, INOX[6]);
    for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) P.ellipse(16 + k * 30, H - 14 - j * 2, 9, 1, j % 2 ? LIN[4] : LIN[2]);
    for (let k = 0; k < 4; k++) { P.ellipse(12 + k * 22, H - 4, 6, 2, INOX[4]); P.ellipse(12 + k * 22, H - 5, 5, 1, INOX[6]); }
    P.rect(0, fy, W, 4, INOX[4]); P.hline(0, fy, W, INOX[6]); P.hline(0, fy + 3, W, INOX[2]);
    P.rect(0, top, W, prof, INOX[5]); P.dither(0, top, W, prof, INOX[4], 3); P.hline(0, top, W, INOX[4]); P.hline(0, fy - 1, W, INOX[6]);
    for (let k = 0; k < 4; k++) {
      const x = 12 + k * 20, y = top + 7; P.ellipse(x, y, 7, 3, LIN[2]); P.ellipse(x, y - 1, 7, 2, LIN[4]); P.ellipse(x - 1, y - 1, 4, 1, LIN[3]);
      const m = METS[(k + 1) % METS.length]; P.ellipse(x, y - 1, 3, 1, m[0]); P.px(x - 1, y - 2, m[1]); P.px(x + 1, y - 2, m[2]); if (k % 2) { P.px(x - 4, y, '#b8281e'); P.px(x + 4, y - 1, '#b8281e'); }
    }
    for (const [bx, col] of [[88, '#d8323a'], [92, '#f2c230']]) { P.rect(bx, top - 2, 3, 7, col); P.px(bx + 1, top - 3, LIN[4]); P.vline(bx, top - 1, 5, PX.shade(col, 0.4)); }
    P.rect(84, top + 8, 9, 4, CHENE[2]); for (let k = 0; k < 6; k++) P.px(85 + r.int(7), top + 7 + r.int(3), r.pick([VERT[3], VERT[4], VERT[2]]));
    line(P, 70, top + 11, 78, top + 9, INOX[6]); line(P, 70, top + 12, 78, top + 11, INOX[4]);
    return fini(c, W / 2, H - 1, { assiettes: [12, 32, 52, 72].map((x) => [x + 1, top + 7]) });
  }
  // l'échelle pâtissière : un chariot à grilles, plein de plaques de choux et de croissants
  function echelle() {
    const W = 30, H = 58, { c, P } = mk(W, H);
    for (const x of [1, W - 3]) { P.rect(x, 0, 2, H - 4, INOX[4]); P.vline(x, 0, H - 4, INOX[6]); }
    for (let k = 0; k < 6; k++) {
      const y = 6 + k * 8; P.rect(1, y, W - 2, 2, INOX[2]); P.hline(1, y, W - 2, INOX[5]);
      for (let j = 0; j < 4; j++) { const x = 5 + j * 6; if (k % 2) { P.ellipse(x, y - 1, 2, 1, '#d89a48'); P.px(x - 1, y - 2, '#f0c070'); } else { P.rect(x - 2, y - 2, 5, 2, '#c8843a'); P.px(x - 1, y - 2, '#f0b860'); } }
    }
    P.rect(0, H - 6, W, 3, INOX[3]); for (const x of [2, W - 4]) { P.ellipse(x + 1, H - 2, 2, 2, '#1d1626'); P.px(x + 1, H - 2, INOX[4]); }
    return fini(c, W / 2, H - 1);
  }
  // une poubelle, un seau à serpillière, une pile de cagettes vides
  function poubelle() { const { c, P } = mk(14, 20); P.rect(1, 4, 12, 15, INOX[3]); for (let x = 3; x < 12; x += 3) P.vline(x, 6, 12, INOX[2]); P.vline(1, 4, 15, INOX[5]); P.ellipse(7, 4, 6, 2, INOX[4]); P.ellipse(7, 3, 5, 1, INOX[5]); P.rect(6, 1, 3, 2, INOX[2]); return fini(c, 7, 19); }
  function seau() {
    const { c, P } = mk(16, 30);
    P.trap(2, 12, 3, 10, 18, 11, '#e8c020'); P.hline(2, 18, 12, '#ffe060'); P.ellipse(8, 18, 6, 1, '#6a8aa0'); P.vline(2, 18, 11, '#ffe060'); P.vline(13, 18, 11, '#a88010');
    line(P, 10, 18, 14, 0, CHENE[3]); for (let k = 0; k < 6; k++) line(P, 9, 18, 6 + k, 22, '#d8d0c0');
    return fini(c, 8, 29);
  }
  function cagettes() {
    const { c, P } = mk(22, 22);
    for (let k = 0; k < 3; k++) { const y = 15 - k * 7, x = k === 2 ? 3 : 1; P.rect(x, y, 18, 7, CHENE[3]); P.hline(x, y, 18, CHENE[5]); P.hline(x, y + 3, 18, CHENE[1]); P.vline(x, y, 7, CHENE[4]); P.vline(x + 17, y, 7, CHENE[1]); P.rect(x + 7, y + 1, 4, 1, CHENE[0]); }
    return fini(c, 11, 21);
  }
  // un sac de farine debout, ouvert
  function sacFarine() { const { c, P } = mk(14, 18); P.rect(1, 4, 12, 13, '#f4efe2'); P.ellipse(7, 4, 6, 2, '#ffffff'); P.ellipse(7, 4, 4, 1, '#e8e0cc'); P.vline(12, 4, 13, LIN[1]); P.rect(2, 9, 10, 4, '#c8283a'); Arendelle.texte(P, 'T45', 3, 9 - 0, '#ffffff'); P.dither(0, 15, 14, 3, '#ffffff', 5); return fini(c, 7, 17); }

  // ------------------------------------------------------------ LA CUISINE : le mur du fond (peint sur le sol)
  // la faïence blanche en briquettes, et sa frise bleue
  function faience(P, x0, y0, w, h) {
    P.rect(x0, y0, w, h, '#c4c8d2');
    for (let y = y0, j = 0; y < y0 + h; y += 4, j++) for (let x = x0 - (j % 2) * 4; x < x0 + w; x += 8) {
      const xa = Math.max(x0, x), wa = Math.min(x + 7, x0 + w) - xa; if (wa <= 0) continue;
      P.rect(xa, y, wa, 3, '#eceef4'); P.hline(xa, y, wa, '#f8f9fc'); if (x > x0) P.px(xa, y + 2, '#dadde6');
    }
    const fz = y0 + Math.round(h * 0.35);
    P.rect(x0, fz, w, 4, '#2c5a9a'); for (let x = x0; x < x0 + w; x += 4) { P.px(x + 1, fz + 1, '#eceef4'); P.px(x + 2, fz + 2, '#eceef4'); P.px(x + 3, fz + 1, '#7aa8d8'); }
    P.hline(x0, fz - 1, w, '#1e3a6a'); P.hline(x0, fz + 4, w, '#1e3a6a');
    P.dither(x0, y0 + h - 14, w, 14, '#a8a098', 4);
  }
  // la grande hotte en inox, rivetée, ses lampes, et le rail aux casseroles de cuivre et aux ustensiles
  function hotte(P, x, y, w) {
    P.trap(x + 10, w - 20, x, w, y, 26, INOX[4]); P.dither(x, y, w, 26, INOX[3], 4);
    for (let k = 0; k < 4; k++) P.hline(x + 10 - Math.round(k * 2.5), y + 6 + k * 6, w - 20 + k * 5, INOX[5]);
    for (let xx = x + 16; xx < x + w - 14; xx += 12) for (let k = 0; k < 4; k++) P.px(xx - k * 2 + 4, y + 3 + k * 6, INOX[2]);
    P.rect(x - 2, y + 26, w + 4, 6, INOX[5]); P.hline(x - 2, y + 26, w + 4, INOX[6]); P.hline(x - 2, y + 31, w + 4, INOX[1]);
    for (let xx = x + 6; xx < x + w; xx += 10) P.px(xx, y + 28, INOX[2]);
    for (let xx = x + 16; xx < x + w - 10; xx += 44) { P.rect(xx, y + 32, 10, 2, '#fff0c0'); P.hline(xx, y + 34, 10, '#ffe08a'); }
    P.rect(x + w / 2 - 14, y + 10, 28, 7, INOX[2]); Arendelle.texte(P, 'GUSTEAU', x + w / 2 - 13, y + 11, OR[4]);
    // le rail, les casseroles en cuivre, les louches, les fouets, l'écumoire
    const ry = y + 40; P.rect(x + 4, ry, w - 8, 2, INOX[5]); P.hline(x + 4, ry, w - 8, INOX[6]);
    let k = 0;
    for (let xx = x + 10; xx < x + w - 10; xx += 13, k++) {
      P.vline(xx, ry + 2, 3, INOX[1]);
      const t = k % 5;
      if (t === 0 || t === 3) { const s = t === 0 ? 5 : 4; P.vline(xx, ry + 4, 6, CUIVRE[2]); P.ellipse(xx, ry + 10 + s, s + 1, s + 1, CUIVRE[2]); P.ellipse(xx, ry + 10 + s, s, s, CUIVRE[3]); P.ellipse(xx - 1, ry + 9 + s, s - 2, s - 2, CUIVRE[4]); P.px(xx - 2, ry + 8 + s, CUIVRE[5]); }
      else if (t === 1) { P.vline(xx, ry + 4, 12, INOX[5]); P.ellipse(xx, ry + 17, 3, 2, INOX[4]); P.ellipse(xx, ry + 16, 2, 1, INOX[2]); }
      else if (t === 2) { P.vline(xx, ry + 4, 8, NOYER[3]); for (const dx of [-2, 0, 2]) line(P, xx, ry + 12, xx + dx, ry + 19, INOX[5]); anneau(P, xx, ry + 17, 2, 2, INOX[5]); }
      else { P.vline(xx, ry + 4, 10, INOX[5]); P.ellipse(xx, ry + 16, 3, 3, INOX[4]); for (let d = -2; d <= 2; d += 2) P.px(xx + d, ry + 16, INOX[1]); }
    }
  }
  // des étagères murales : bocaux, bouteilles d'huile, pots d'épices, piles de bols ; parfois des herbes qui sèchent
  function etageresMur(P, x, y, w, rangs, seed, o = {}) {
    const r = PX.rng(seed);
    rangs.forEach((ry, j) => {
      P.rect(x, y + ry, w, 3, CHENE[3]); P.hline(x, y + ry, w, CHENE[5]); P.hline(x, y + ry + 3, w, '#9a9aa4');
      for (const bx of [x + 3, x + w - 5]) P.rect(bx, y + ry + 3, 2, 3, CHENE[1]);
      for (let bx = x + 3; bx < x + w - 6;) {
        const t = r.int(o.patisserie ? 3 : 5);
        if (t === 0) { const col = r.pick(o.patisserie ? ['#f4efe2', '#e8d0a0', '#c89a5a', '#a8641e'] : ['#d8323a', '#f2c230', '#3a8a4a', '#e8603a', '#8a5a3a']); P.rect(bx, y + ry - 7, 6, 7, '#cfe6f2'); P.rect(bx + 1, y + ry - 5, 4, 5, col); P.rect(bx, y + ry - 9, 6, 2, r.pick(['#c8283a', CHENE[2], INOX[4]])); P.px(bx, y + ry - 6, '#ffffff'); bx += 8; }
        else if (t === 1) { const col = r.pick(['#c8a020', '#5a7a1a', '#7a2a1a']); P.rect(bx, y + ry - 9, 3, 9, col); P.rect(bx + 1, y + ry - 12, 1, 3, col); P.vline(bx, y + ry - 8, 7, PX.shade(col, 0.5)); P.px(bx + 1, y + ry - 13, CHENE[1]); bx += 5; }
        else if (t === 2) { for (let k = 0; k < 4; k++) P.ellipse(bx + 4, y + ry - 1 - k * 2, 4, 1, k % 2 ? LIN[4] : LIN[2]); bx += 10; }
        else if (t === 3) { for (let k = 0; k < 3; k++) { P.rect(bx + k * 3, y + ry - 5, 2, 5, r.pick(['#d8323a', '#f2c230', '#3a8a4a', '#c86a3a'])); P.hline(bx + k * 3, y + ry - 6, 2, INOX[5]); } bx += 10; }
        else { P.rect(bx, y + ry - 8, 8, 8, CUIVRE[3]); P.vline(bx, y + ry - 8, 8, CUIVRE[5]); P.ellipse(bx + 4, y + ry - 8, 4, 1, CUIVRE[2]); bx += 10; }
      }
    });
    if (o.herbes) for (let k = 0; k < o.herbes; k++) { const hx = x + 6 + k * Math.floor((w - 10) / o.herbes), hy = y + rangs[rangs.length - 1] + 4; P.vline(hx, hy, 3, '#8a7a5a'); for (let j = 0; j < 7; j++) P.px(hx - 2 + r.int(5), hy + 3 + r.int(6), r.pick([VERT[2], VERT[3], '#6a8a3a', '#8aa04a'])); }
  }
  // la porte de la chambre froide : inox, joint, grosse poignée, givre, thermomètre
  function chambreFroide(P, x, y, w, h) {
    P.rect(x - 3, y - 3, w + 6, h + 3, INOX[2]); P.rect(x, y, w, h, INOX[4]); P.dither(x, y, w, h, INOX[5], 4);
    for (let yy = y + 8; yy < y + h - 4; yy += 12) P.hline(x + 2, yy, w - 4, INOX[3]);
    P.rect(x + w - 12, y + h / 2 - 6, 8, 14, INOX[2]); P.rect(x + w - 10, y + h / 2 - 4, 4, 10, INOX[6]); P.rect(x + w - 16, y + h / 2, 8, 3, INOX[5]);
    for (const yy of [y + 10, y + h - 14]) { P.rect(x - 2, yy, 5, 6, INOX[1]); P.vline(x, yy, 6, INOX[5]); }
    P.dither(x, y, w, 10, '#f0f8ff', 7); P.dither(x, y, 6, h, '#f0f8ff', 5); for (let k = 0; k < 9; k++) P.px(x + 3 + ((k * 7) % (w - 6)), y + 2 + ((k * 5) % 9), '#ffffff');
    P.rect(x + 6, y + 14, 20, 8, '#3a6aa8'); Arendelle.texte(P, 'FROID', x + 7, y + 16, '#ffffff');
    P.ellipse(x + 16, y + 34, 5, 5, INOX[1]); P.ellipse(x + 16, y + 34, 4, 4, '#f4f2ec'); P.vline(x + 16, y + 31, 3, '#d8323a'); P.px(x + 16, y + 34, '#1d1626');
  }
  // une petite fenêtre haute : la nuit enneigée de Montaigu, du givre, un rideau bistrot
  function fenetre(P, x, y, w, h) {
    P.rect(x - 2, y - 2, w + 4, h + 4, CHENE[2]); P.rect(x, y, w, h, '#1e2a4a'); P.vgrad(x, y, w, h, '#16203c', '#2e3e66');
    for (let k = 0; k < 10; k++) P.px(x + 1 + ((k * 11) % (w - 2)), y + 1 + ((k * 7) % (h - 6)), '#e8eeff');
    P.rect(x, y + h - 5, w, 5, '#dce6f4'); P.hline(x, y + h - 5, w, '#ffffff'); P.rect(x + 4, y + h - 9, 2, 4, '#f6d070'); P.rect(x + w - 8, y + h - 10, 3, 5, '#f6d070');
    P.vline(x + w / 2, y, h, CHENE[3]); P.hline(x, y + h / 2, w, CHENE[3]);
    P.dither(x, y, w, h, '#ffffff', 2); P.dither(x, y + h - 8, w, 8, '#ffffff', 5);
    P.rect(x - 2, y + h / 2, w + 4, h / 2 + 2, '#f4f2ec'); for (let xx = x - 2; xx < x + w + 2; xx += 4) { P.px(xx, y + h + 1, '#d8323a'); P.vline(xx + 2, y + h / 2 + 1, h / 2, '#e0dcd0'); } P.hline(x - 2, y + h / 2, w + 4, '#d8323a');
    P.rect(x - 3, y + h + 2, w + 6, 2, CHENE[3]);
  }
  // l'affiche de Gusteau : « Tout le monde peut cuisiner »
  function afficheGusteau(P, x, y) {
    P.rect(x, y, 56, 46, '#f2e2b8'); P.rect(x + 1, y + 1, 54, 44, '#e8cf98'); P.dither(x + 1, y + 1, 54, 44, '#f6e8c4', 4);
    P.rect(x + 3, y + 2, 50, 7, '#a81a2a'); P.hline(x + 3, y + 8, 50, '#7a1020'); Arendelle.texte(P, 'GUSTEAU', x + 28 - Math.ceil(Arendelle.largeurTexte('GUSTEAU') / 2), y + 3, '#f6e8c4');
    const gu = Resto.gusteau(); P.g.drawImage(gu, 4, 7, 26, 23, x + 15, y + 10, 26, 23);
    P.rect(x + 3, y + 33, 50, 12, '#e8cf98');
    Arendelle.texte(P, 'TOUT LE MONDE', x + 3 + Math.floor((50 - Arendelle.largeurTexte('TOUT LE MONDE')) / 2), y + 34, '#3a2a24');
    Arendelle.texte(P, 'PEUT CUISINER', x + 3 + Math.floor((50 - Arendelle.largeurTexte('PEUT CUISINER')) / 2), y + 40, '#a81a2a');
    for (const [cx, cy] of [[x + 1, y + 1], [x + 54, y + 1]]) P.px(cx, cy, '#d8323a');
    P.px(x + 55, y + 45, '#c8b088'); P.px(x + 54, y + 45, '#c8b088');
  }
  // une horloge de cuisine ronde (les aiguilles sont animées par la carte)
  function horloge(P, x, y) { P.ellipse(x, y, 7, 7, '#1d1626'); P.ellipse(x, y, 6, 6, INOX[5]); P.ellipse(x, y, 5, 5, '#fbf8ee'); for (let k = 0; k < 12; k++) P.px(Math.round(x + Math.cos(k / 6 * Math.PI) * 4), Math.round(y + Math.sin(k / 6 * Math.PI) * 4), '#5a5a6a'); }
  // le tableau des menus de la semaine, des recettes punaisées
  function tableauRecettes(P, x, y) {
    P.rect(x, y, 34, 24, CHENE[2]); P.rect(x + 1, y + 1, 32, 22, '#c8a878'); P.dither(x + 1, y + 1, 32, 22, '#b89868', 6);
    for (const [px, py, col] of [[3, 3, '#fbf8ee'], [14, 2, '#fff0a0'], [24, 4, '#fbf8ee'], [6, 13, '#f8d0d8'], [19, 12, '#fbf8ee']]) { P.rect(x + px, y + py, 9, 9, col); for (let k = 0; k < 3; k++) P.hline(x + px + 1, y + py + 3 + k * 2, 6, '#8a8a9a'); P.px(x + px + 4, y + py, '#d8323a'); }
  }

  return {
    tableRonde, tableCarree, chaise, banquette, cheminee, lustre, bar, tabouret, chariot, parisBrestMini, piano, bancPiano, pupitre, portemanteau,
    palmier, ardoise, seauChampagne, desserte, cadeaux,
    papierPeint, pilastre, miroir, applique, portesCuisine, etageresBar, grandPortrait, panneau, veines, anneau,
    fourneau, ilotPatisserie, billot, plonge, etagere, passe, tableDressage, echelle, poubelle, seau, cagettes, sacFarine,
    faience, hotte, etageresMur, chambreFroide, fenetre, afficheGusteau, horloge, tableauRecettes,
    NOYER, CHENE, VELOURS, OR, LIN, INOX, CUIVRE, MARBRE, VERT, LEGUMES,
  };
})();
