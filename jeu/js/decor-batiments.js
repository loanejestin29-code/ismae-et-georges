// =====================================================================
//  decor-batiments.js — génère les immeubles anciens (façades en
//  pierre, balcons en fer forgé, toits en zinc, lucarnes, cheminées)
//  et les devantures de boutiques. Tout est dessiné au pixel près.
// =====================================================================
'use strict';

const Batiments = (() => {
  const S = PX.shade, M = PX.mix;

  const STONE = {};
  const BASES = {
    creme: '#e2cfaa', ocre: '#e3be82', rose: '#e0b7a5', gris: '#d4ccbd', blanc: '#e6dfcf', vert: '#c9cfa8',
  };
  for (const k in BASES) {
    const b = BASES[k];
    STONE[k] = { hi: S(b, 0.35), base: b, joint: S(b, -0.1), mid: S(b, -0.2), lo: S(b, -0.38), deep: S(b, -0.6) };
  }
  const GLASS = { dark: '#262c47', mid: '#303b60', refl: '#6683b2', refl2: '#a3bbdc' };
  const LIT = { a: '#ffd47c', b: '#eea24c', c: '#fff1bb', cur: '#f4e5c6', curS: '#d6bd96' };
  const IRON = { a: '#1f1d2b', b: '#3a374f', hi: '#646080' };
  const FRAME = { a: '#ece3d2', b: '#c4b9a6' };
  const ZINC = { hi: '#b3bed0', a: '#8e9ab2', b: '#76829c', c: '#5f6b86', d: '#48516b', e: '#323952' };
  const TUILE = { hi: '#d98a62', a: '#b9654a', b: '#9a4d3b', c: '#7a3a31', d: '#55272a' };

  // ------------------------------------------------------------ éléments
  function stoneWall(P, x, y, w, h, pal, r, plaster) {
    P.rect(x, y, w, h, pal.base);
    if (plaster) {
      P.speckle(x, y, w, h, [pal.hi, pal.joint, pal.joint], 0.06, r);
      for (let k = 0; k < (w * h) / 500; k++) {
        const px = x + r.int(w - 8), py = y + r.int(h - 5);
        P.dither(px, py, 6 + r.int(6), 3 + r.int(3), pal.joint, 6);
      }
      return;
    }
    let row = 0;
    for (let yy = y + 5; yy < y + h; yy += 6, row++) {
      P.hline(x, yy, w, pal.joint);
      const off = row % 2 ? 4 : 13;
      for (let xx = x + off; xx < x + w; xx += 18) P.vline(xx, yy - 5, 5, pal.joint);
    }
    P.speckle(x, y, w, h, [pal.hi, pal.joint], 0.025, r);
  }

  function windowFr(P, x, y, w, h, lit) {
    P.rect(x, y, w, h, FRAME.a);
    P.vline(x + w - 1, y, h, FRAME.b);
    const gx = x + 1, gy = y + 1, gw = w - 2, gh = h - 2;
    if (lit) {
      P.rect(gx, gy, gw, gh, LIT.b);
      P.rect(gx + 1, gy + 1, gw - 2, gh - 2, LIT.a);
      P.dither(gx + 1, gy + 2, gw - 2, gh - 5, LIT.c, 5);
      P.vline(gx, gy, gh, LIT.cur);
      P.vline(gx + gw - 1, gy, gh, LIT.cur);
      P.hline(gx, gy, gw, LIT.curS);
    } else {
      P.rect(gx, gy, gw, gh, GLASS.dark);
      P.dither(gx, gy, gw, Math.ceil(gh / 2), GLASS.mid, 9);
      P.px(gx + gw - 2, gy + 1, GLASS.refl2);
      P.px(gx + gw - 3, gy + 2, GLASS.refl);
      P.px(gx + 1, gy + gh - 3, GLASS.refl);
    }
    if (w >= 7) P.vline(x + Math.floor(w / 2), gy, gh, FRAME.a);
    P.hline(gx, gy + Math.floor(gh * 0.3), gw, FRAME.a);
  }

  function railing(P, x, y, w, h = 5) {
    P.hline(x, y, w, IRON.a);
    P.hline(x, y + h - 1, w, IRON.a);
    for (let i = 0; i < w; i++) {
      const m = (x + i) % 4;
      if (m === 0) P.vline(x + i, y + 1, h - 2, IRON.a);
      else if (m === 2) { P.px(x + i, y + 2, IRON.a); if (h > 4) P.px(x + i, y + h - 3, IRON.b); }
      if ((x + i) % 3 === 0) P.px(x + i, y, IRON.hi);
    }
  }

  function flowerBox(P, x, y, w, r) {
    P.hline(x, y, w, '#6a3b2c');
    P.hline(x, y - 1, w, '#3f6b3a');
    for (let i = 0; i < w; i++) {
      if (r.chance(0.55)) P.px(x + i, y - 2, r.pick(['#d8434b', '#f06a6a', '#f2a3b8', '#ffd2dc']));
      if (r.chance(0.4)) P.px(x + i, y - 1, '#5d9449');
    }
  }

  function shutters(P, x, y, h, col) {
    const d = S(col, -0.3), l = S(col, 0.2);
    P.rect(x, y, 3, h, col);
    for (let j = 1; j < h; j += 2) P.hline(x, y + j, 3, d);
    P.vline(x, y, h, l);
  }

  function chimney(P, x, y, w, h, brick, r) {
    const a = brick ? '#a65b46' : '#d6c3a3', b = brick ? '#7a3e33' : '#ad987a', hi = brick ? '#c97d5f' : '#ebdcc0';
    P.rect(x, y, w, h, a);
    P.vline(x, y, h, hi);
    P.rect(x + w - 2, y, 2, h, b);
    if (brick) for (let yy = y + 3; yy < y + h; yy += 3) P.hline(x + 1, yy, w - 3, b);
    P.rect(x - 1, y, w + 2, 2, hi);
    P.hline(x - 1, y + 2, w + 2, b);
    const n = Math.max(1, Math.floor((w - 1) / 3));
    const tops = [];
    for (let i = 0; i < n; i++) {
      const px = x + 1 + i * 3;
      const ph = 3 + r.int(2);
      P.rect(px, y - ph, 2, ph, '#d4744a');
      P.vline(px + 1, y - ph, ph, '#a24e35');
      P.hline(px, y - ph, 2, '#4a2a30');
      tops.push([px + 1, y - ph]);
    }
    return tops;
  }

  function dormer(P, cx, y, h, lit, pal) {
    const x = cx - 5, w = 11;
    P.dither(x + w, y + 4, 2, h - 4, ZINC.e, 10);
    P.rect(x, y + 4, w, h - 4, pal.hi);
    P.vline(x + w - 1, y + 4, h - 4, pal.mid);
    for (let j = 0; j < 4; j++) P.rect(cx - 1 - j - 1, y + j, 3 + j * 2 + 2 > w ? w : 3 + j * 2, 1, j === 0 ? pal.hi : pal.base);
    P.hline(x - 1, y + 4, w + 2, pal.hi);
    P.hline(x - 1, y + 5, w + 2, pal.mid);
    windowFr(P, x + 2, y + 6, 7, h - 7, lit);
  }

  // ------------------------------------------------------------ logo Carrefour
  // Flèche rouge à gauche, flèche bleue à droite, « C » blanc entre les deux.
  // Converti en pixels depuis le logo officiel (losange : petite flèche rouge, grand « C » bleu).
  const LOGO = {
    petit: ['.........BBB........', '........BBBB..B.....', '....R...BBBB...B....', '...R...BBBBB...BB...', '..RR...BBBBB..BBBB..',
      '.RRR...BBBBBBBBBBBB.', 'RRRR...BBBBBBBBBBBBB', '.RRR...BBBBBBBBBBBBB', '..RR...BBBBB..BBBB..', '...R...BBBBB...BB...',
      '....R...BBBB...B....', '........BBBB..B.....', '.........BBB........'],
    moyen: ['............BBB...........', '...........BBBBB..........', '......R...BBBBBB...B......', '.....R....BBBBB....BB.....',
      '....RR....BBBBB....BBB....', '..RRR....BBBBBB....BBBBB..', '.RRRR....BBBBBBBB.BBBBBBB.', 'RRRRR....BBBBBBBBBBBBBBBBB',
      'RRRRR....BBBBBBBBBBBBBBBBB', 'RRRRR....BBBBBBBBBBBBBBBBB', '.RRRR....BBBBBBBBBBBBBBBB.', '..RRR....BBBBBB....BBBBB..',
      '...RRR....BBBBB....BBBB...', '.....R....BBBBB....BB.....', '......R...BBBBBB...B......', '...........BBBBB..........',
      '............BBB...........'],
    grand: ['...............BBBBB..............', '.........R....BBBBBBB...B.........', '........R.....BBBBBBB....B........',
      '.......RR....BBBBBBBB....BB.......', '......RR.....BBBBBBB.....BBB......', '.....RRR.....BBBBBBB.....BBBB.....',
      '....RRR.....BBBBBBBB.....BBBBB....', '...RRRR.....BBBBBBBB.....BBBBBB...', '..RRRRR.....BBBBBBBBBB.BBBBBBBBB..',
      '.RRRRRR.....BBBBBBBBBBBBBBBBBBBBB.', 'RRRRRRR.....BBBBBBBBBBBBBBBBBBBBBB', 'RRRRRRR.....BBBBBBBBBBBBBBBBBBBBBB',
      '.RRRRRR.....BBBBBBBBBBBBBBBBBBBBB.', '..RRRRR.....BBBBBBBBBBBBBBBBBBBB..', '...RRRR.....BBBBBBBB.....BBBBBB...',
      '....RRR.....BBBBBBBB.....BBBBB....', '.....RRR.....BBBBBBB.....BBBB.....', '......RR.....BBBBBBB.....BBB......',
      '.......RR....BBBBBBBB....BB.......', '........R.....BBBBBBB....B........', '.........R....BBBBBBB...B.........',
      '...............BBBBB..............'],
  };
  function carrefourLogo(taille = 'petit', scale = 1) {
    const rows = LOGO[taille] || LOGO.petit;
    const src = PX.fromRows(rows, { R: '#e1251b', B: '#1d4f9c' });
    if (scale === 1) return src;
    const c = PX.canvas(src.width * scale, src.height * scale);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }

  // ------------------------------------------------------------ enseignes
  const ICONS = {
    pain: ['....gg.', '...gdg.', '..gdg..', '.gdg...', 'gg.....'],
    fromage: ['..ggg..', '.ggggg.', 'ggdgggg', 'ggggdgg', 'ggggggg'],
    tasse: ['.g.g...', 'ggggg..', 'ggggg.g', 'ggggggg', '.ggg...'],
    fleur: ['.g.g.g.', 'ggggggg', '.ggdgg.', '...g...', '..ggg..'],
    livre: ['gg...gg', 'gdg.gdg', 'ggggggg', 'g..g..g', 'ggggggg'],
    gateau: ['...g...', '..ggg..', '.ggggg.', 'gdgdgdg', 'ggggggg'],
    horloge: ['.ggggg.', 'gg.g.gg', 'g..gg.g', 'gg...gg', '.ggggg.'],
    palette: ['.gggg..', 'gg.gggg', 'gggg.gg', 'g.ggg..', '.gggg..'],
    lit: ['g......', 'g.ggggg', 'gggggg.', 'g....g.', 'g....g.'],
  };
  function icon(P, name, x, y, gold, dark) {
    const rows = ICONS[name];
    if (!rows) return;
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === 'g') P.px(x + i, y + j, gold);
      else if (ch === 'd') P.px(x + i, y + j, dark);
    }));
  }

  // ------------------------------------------------------------ vitrines
  function display(P, type, x, y, w, h, r) {
    // fond chaud éclairé
    P.rect(x, y, w, h, '#e9a85a');
    P.rect(x, y, w, Math.floor(h * 0.55), '#f4c47a');
    P.dither(x, y, w, 4, '#ffe3a3', 7);
    const shelf = (yy) => { P.hline(x, yy, w, '#8a5634'); P.hline(x, yy + 1, w, '#5e3727'); };
    if (type === 'pain') {
      shelf(y + 6); shelf(y + h - 3);
      for (let i = 1; i < w - 2; i += 3) { P.rect(x + i, y + 1, 1, 5, '#c98a3e'); P.px(x + i, y + 1, '#e8b56a'); }
      for (let i = 1; i < w - 3; i += 4) { P.ellipse(x + i + 1, y + h - 5, 1, 1, '#b8743a'); P.px(x + i, y + h - 6, '#e3a964'); }
    } else if (type === 'fromage') {
      shelf(y + 7); shelf(y + h - 3);
      for (let i = 1; i < w - 3; i += 4) { P.rect(x + i, y + 3, 3, 4, '#f2d36b'); P.hline(x + i, y + 3, 3, '#fff0a0'); P.vline(x + i + 2, y + 3, 4, '#c9a240'); }
      for (let i = 2; i < w - 3; i += 5) { P.rect(x + i, y + h - 7, 4, 4, '#e8c050'); P.hline(x + i, y + h - 7, 4, '#d9934a'); }
    } else if (type === 'fleur') {
      for (let i = 0; i < w; i += 4) {
        P.rect(x + i, y + h - 5, 3, 5, '#7a8090');
        for (let k = 0; k < 6; k++) P.px(x + i + r.int(4) - 1, y + h - 6 - r.int(6), r.pick(['#e8434b', '#ff8fb0', '#ffd34e', '#f4f0f0', '#b45ad0']));
        P.px(x + i + 1, y + h - 6, '#4f8d3e');
      }
      P.dither(x, y + 2, w, 5, '#5d9449', 5);
    } else if (type === 'livre') {
      for (let s = 0; s < 3; s++) {
        const sy = y + 1 + s * Math.floor(h / 3);
        for (let i = 0; i < w; i++) if (r.chance(0.85)) P.vline(x + i, sy + r.int(2), Math.floor(h / 3) - 2, r.pick(['#8a2f34', '#2f4f7a', '#3e6a4a', '#c99a3e', '#6a3e6e', '#d8cdb4']));
        shelf(sy + Math.floor(h / 3) - 2);
      }
    } else if (type === 'gateau') {
      shelf(y + 7); shelf(y + h - 3);
      for (let i = 1; i < w - 3; i += 4) {
        P.rect(x + i, y + 3, 3, 4, r.pick(['#f6c6d6', '#7a4a32', '#fff1e0', '#9fd8b8']));
        P.px(x + i + 1, y + 2, '#d8323c');
      }
      for (let i = 2; i < w - 2; i += 3) for (let k = 0; k < 3; k++) P.px(x + i, y + h - 5 - k, r.pick(['#f5a8c8', '#b8e0a8', '#f8e08a', '#c8a8f0']));
    } else if (type === 'horloge') {
      for (let i = 2; i < w - 4; i += 7) {
        P.ellipse(x + i + 2, y + 4, 2, 2, '#d8b24a'); P.ellipse(x + i + 2, y + 4, 1, 1, '#fff4d8');
        P.px(x + i + 2, y + 3, '#2a1f2a'); P.rect(x + i + 1, y + 7, 3, h - 10, '#6a4a32');
      }
      shelf(y + h - 3);
    } else if (type === 'cafe') {
      P.rect(x, y + h - 6, w, 6, '#6e3b2a'); P.hline(x, y + h - 6, w, '#a25e3e');
      for (let i = 1; i < w - 1; i += 3) P.rect(x + i, y + 2, 1, 4, r.pick(['#3f6a4a', '#7a2e34', '#d8b05a', '#2f4f6e']));
      shelf(y + 6);
      for (let i = 2; i < w - 3; i += 6) { P.ellipse(x + i + 1, y + h - 9, 1, 1, '#3a2a36'); P.rect(x + i, y + h - 8, 3, 3, '#3a2a36'); }
    } else if (type === 'pharmacie') {
      P.rect(x, y, w, h, '#d9f0e6'); P.rect(x, y, w, 3, '#f4fff8');
      for (let s = 0; s < 3; s++) { shelf(y + 4 + s * 4); for (let i = 0; i < w; i += 2) if (r.chance(0.7)) P.rect(x + i, y + 2 + s * 4, 1, 2, r.pick(['#ffffff', '#5fbf7a', '#e8e0f8'])); }
    } else if (type === 'epicerie') {
      shelf(y + 6); shelf(y + h - 3);
      for (let i = 1; i < w - 2; i += 3) { P.rect(x + i, y + 2, 2, 4, r.pick(['#c9483b', '#3a6aa8', '#e8b54a', '#5a9a4a', '#f4ecd8'])); P.px(x + i, y + 2, '#fff4d8'); }
      for (let i = 1; i < w - 3; i += 5) {
        const f = r.pick(['#f08a24', '#d8303a', '#7cc04a', '#f2d040']);
        P.ellipse(x + i + 1, y + h - 5, 1, 1, f); P.ellipse(x + i + 3, y + h - 5, 1, 1, f); P.ellipse(x + i + 2, y + h - 7, 1, 1, f);
      }
    } else if (type === 'atelier') {
      P.rect(x, y, w, h, '#f2dcae');
      P.rect(x + 2, y + 2, 7, 6, '#4b6ea8'); P.rect(x + 3, y + 3, 5, 4, '#e9b45a'); P.px(x + 5, y + 5, '#222033');
      P.rect(x + w - 9, y + 3, 6, 7, '#8a3a4a'); P.rect(x + w - 8, y + 4, 4, 5, '#c7d6e8');
      P.vline(x + 5, y + 8, h - 9, '#6a4a32'); P.vline(x + w - 6, y + 10, h - 11, '#6a4a32');
    }
    // reflet de la vitre
    for (let k = 0; k < h; k++) if (k % 7 < 2) P.px(x + w - 2 - (k % 7) - Math.floor(k / 7) * 3, y + k, 'rgba(255,255,255,0.35)');
    P.hline(x, y, w, 'rgba(40,30,60,0.35)');
  }

  function awning(P, x, y, w, c1, c2) {
    const h = 6;
    for (let j = 0; j < h; j++) {
      const t = j / (h - 1);
      for (let i = -1; i < w + 1; i++) {
        const stripe = Math.floor((i + 2) / 3) % 2 === 0;
        let col = stripe ? c1 : c2;
        if (j === 0) col = S(col, -0.35);
        else if (t > 0.65) col = S(col, 0.1);
        P.px(x + i, y + j, col);
      }
    }
    for (let i = -1; i < w + 1; i++) {
      const stripe = Math.floor((i + 2) / 3) % 2 === 0;
      if ((i + 2) % 3 !== 1) P.px(x + i, y + h, S(stripe ? c1 : c2, -0.15));
    }
    P.dither(x, y + h + 1, w, 2, '#2a1e3a', 8);
  }

  const SHOPS = {
    boulangerie: { wood: '#7b2c36', trim: '#e2b24c', aw: ['#b8433a', '#f2e4c8'], icon: 'pain', disp: 'pain' },
    fromagerie: { wood: '#2f5b47', trim: '#e7c55c', aw: ['#2f6b4b', '#efe6cf'], icon: 'fromage', disp: 'fromage' },
    cafe: { wood: '#6e1f2b', trim: '#e6bb55', aw: ['#b3363a', '#f0e2c6'], icon: 'tasse', disp: 'cafe' },
    fleuriste: { wood: '#4a7356', trim: '#f0dca0', aw: ['#3f7a52', '#f2ecd8'], icon: 'fleur', disp: 'fleur' },
    librairie: { wood: '#26385f', trim: '#e2c25e', aw: null, icon: 'livre', disp: 'livre' },
    patisserie: { wood: '#7fbfaa', trim: '#f6e2a0', aw: ['#e48aa6', '#fbeef0'], icon: 'gateau', disp: 'gateau' },
    antiquaire: { wood: '#3b2c2b', trim: '#d7a94a', aw: null, icon: 'horloge', disp: 'horloge' },
    pharmacie: { wood: '#e6e4da', trim: '#3e9a5e', aw: null, icon: null, disp: 'pharmacie' },
    atelier: { wood: '#c9b48e', trim: '#6a4a32', aw: null, icon: 'palette', disp: 'atelier' },
  };

  function shopfront(P, type, x0, y0, w, h, pal, r, out) {
    if (type === 'porte' || type === 'hotel') return residence(P, type, x0, y0, w, h, pal, r, out);
    if (type === 'carrefour') return carrefour(P, x0, y0, w, h, pal, r, out);
    if (type === 'jazzclub') return jazzclub(P, x0, y0, w, h, pal, r, out);
    const s = SHOPS[type];
    const wood = s.wood, wd = S(wood, -0.35), wl = S(wood, 0.22);
    const fx = x0 + 3, fw = w - 6;
    P.rect(fx, y0, fw, h, wood);
    P.rect(x0, y0, 3, h, pal.mid); P.rect(x0 + w - 3, y0, 3, h, pal.mid);
    P.vline(x0, y0, h, pal.base); P.vline(x0 + w - 1, y0, h, pal.lo);
    // enseigne
    P.hline(fx, y0, fw, wl); P.hline(fx, y0 + 8, fw, wd);
    P.rect(fx + 2, y0 + 2, fw - 4, 5, wd);
    for (let i = fx + 2; i < fx + fw - 2; i += 2) { P.px(i, y0 + 1, s.trim); P.px(i, y0 + 7, s.trim); }
    if (s.icon) icon(P, s.icon, Math.round(x0 + w / 2 - 3.5), y0 + 2, s.trim, wd);
    else { // croix verte de pharmacie
      const cx = Math.round(x0 + w / 2);
      P.rect(cx - 1, y0 + 1, 3, 7, '#3fd06e'); P.rect(cx - 3, y0 + 3, 7, 3, '#3fd06e'); P.px(cx, y0 + 4, '#c8ffd8');
    }
    // porte + vitrines
    const ly = y0 + 9, lh = h - 9;
    const dw = 10, dx = Math.round(x0 + w / 2 - dw / 2) + (fw > 70 ? 0 : 0);
    const wy = ly + 3, wh = lh - 9;
    display(P, s.disp, fx + 3, wy, dx - fx - 5, wh, r);
    display(P, s.disp, dx + dw + 2, wy, fx + fw - (dx + dw + 2) - 3, wh, r);
    for (const [ax, aw] of [[fx + 2, dx - fx - 3], [dx + dw + 1, fx + fw - (dx + dw + 1) - 2]]) {
      P.rect(ax, wy - 1, aw, 1, s.trim); P.rect(ax, wy + wh, aw, 1, s.trim);
    }
    P.rect(fx + 2, ly + lh - 5, fw - 4, 4, wd);
    P.hline(fx + 2, ly + lh - 5, fw - 4, wl);
    // porte vitrée
    P.rect(dx, ly + 1, dw, lh - 1, wd);
    P.rect(dx + 2, ly + 3, dw - 4, lh - 10, LIT.a);
    P.dither(dx + 2, ly + 3, dw - 4, lh - 10, LIT.b, 6);
    P.px(dx + dw - 3, ly + Math.floor(lh / 2), s.trim);
    P.hline(dx, ly + lh - 1, dw, '#3a2a2a');
    out.lights.push({ x: x0 + w / 2, y: y0 + h + 6, r: 44, k: 'shop' });
    if (s.aw) awning(P, fx, ly, fw, s.aw[0], s.aw[1]);
  }

  function residence(P, type, x0, y0, w, h, pal, r, out) {
    // rez-de-chaussée en pierre à refends + porte d'entrée en bois
    // (jamais verte : la seule porte verte du jeu est la porte cochère de la placette)
    P.rect(x0, y0, w, h, pal.base);
    for (let yy = y0 + 4; yy < y0 + h; yy += 5) { P.hline(x0, yy, w, pal.mid); P.hline(x0, yy + 1, w, pal.hi); }
    const dw = type === 'hotel' ? 16 : 18, dx = Math.round(x0 + w / 2 - dw / 2), dy = y0 + 5;
    const bois = type === 'hotel' ? '#5a2a2e' : pal.porte || '#2c3a5e';
    P.rect(dx - 2, dy - 2, dw + 4, h - 3, pal.hi);
    P.rect(dx, dy, dw, h - 5, bois);
    P.ellipse(dx + dw / 2 - 0.5, dy + 1, dw / 2 - 1, 3, bois);
    if (type === 'hotel') {
      P.rect(dx + 2, dy + 3, dw - 4, h - 10, LIT.a); P.dither(dx + 2, dy + 3, dw - 4, h - 10, LIT.b, 5);
      P.vline(dx + dw / 2, dy + 3, h - 10, '#5a2a2e');
      // marquise (auvent de verre)
      P.rect(dx - 6, dy - 3, dw + 12, 3, IRON.a); P.hline(dx - 6, dy - 3, dw + 12, IRON.hi);
      P.dither(dx - 5, dy - 2, dw + 10, 1, '#9fc0d8', 8);
      for (const lx of [dx - 6, dx + dw + 4]) { P.rect(lx, dy + 2, 2, 4, '#d9a440'); P.px(lx, dy + 3, '#fff1b0'); out.lights.push({ x: x0 + (lx - x0) + 1, y: dy + 4, r: 16, k: 'lamp', wall: true }); }
      out.lights.push({ x: x0 + w / 2, y: y0 + h + 6, r: 36, k: 'shop' });
    } else {
      for (let j = dy + 3; j < dy + h - 6; j += 4) { P.hline(dx + 2, j, dw - 4, S(bois, 0.16)); P.hline(dx + 2, j + 2, dw - 4, S(bois, -0.3)); }
      P.vline(dx + dw / 2, dy, h - 5, S(bois, -0.42));
      P.px(dx + dw / 2 - 2, dy + 12, '#e0b04a'); P.px(dx + dw / 2 + 1, dy + 12, '#e0b04a');
    }
    for (const wx of [x0 + 5, x0 + w - 13]) {
      if (wx + 8 > dx - 2 && wx < dx + dw + 2) continue;
      windowFr(P, wx, y0 + 8, 8, 14, r.chance(0.5));
      railing(P, wx, y0 + 16, 8, 5);
    }
  }

  // petite épicerie rétro : devanture en bois peint bleu nuit, plaque émaillée avec le logo seul,
  // store rayé, vitrines chaleureuses et une enseigne suspendue visible de loin
  function carrefour(P, x0, y0, w, h, pal, r, out) {
    const BL = '#22407a', BLc = '#3a60a6', BLs = '#142a54', ROUGE = '#d8322c', CREME = '#f4ecd8';
    P.rect(x0, y0, w, h, BL);
    P.rect(x0, y0, 3, h, pal.mid); P.rect(x0 + w - 3, y0, 3, h, pal.mid);
    P.vline(x0, y0, h, pal.base); P.vline(x0 + w - 1, y0, h, pal.lo);
    // bandeau : plaque émaillée crème avec le logo (aucun texte)
    P.rect(x0 + 3, y0, w - 6, 21, BL); P.hline(x0 + 3, y0, w - 6, BLc); P.hline(x0 + 3, y0 + 20, w - 6, BLs);
    for (let i = x0 + 5; i < x0 + w - 5; i += 2) { P.px(i, y0 + 2, ROUGE); P.px(i, y0 + 18, ROUGE); }
    const pw = 34, px0 = Math.round(x0 + w / 2 - pw / 2);
    P.rect(px0, y0 + 1, pw, 19, '#1b1630'); P.rect(px0 + 1, y0 + 2, pw - 2, 17, CREME); P.hline(px0 + 2, y0 + 2, pw - 4, '#ffffff');
    P.px(px0 + 1, y0 + 2, '#1b1630'); P.px(px0 + pw - 2, y0 + 2, '#1b1630'); P.px(px0 + 1, y0 + 18, '#1b1630'); P.px(px0 + pw - 2, y0 + 18, '#1b1630');
    P.draw(carrefourLogo('moyen'), px0 + 4, y0 + 2);
    // vitrines d'épicerie (bocaux, conserves, fruits) et porte vitrée au centre
    const ly = y0 + 21, lh = h - 21;
    const dw = 20, dx = Math.round(x0 + w / 2 - dw / 2);
    const wy = ly + 3, wh = lh - 9;
    display(P, 'epicerie', x0 + 6, wy, dx - x0 - 10, wh, r);
    display(P, 'epicerie', dx + dw + 4, wy, x0 + w - (dx + dw + 4) - 6, wh, r);
    for (const [ax, aw] of [[x0 + 5, dx - x0 - 8], [dx + dw + 3, x0 + w - (dx + dw + 3) - 5]]) {
      P.rect(ax, wy - 1, aw, 1, ROUGE); P.rect(ax, wy + wh, aw, 1, ROUGE);
    }
    P.rect(x0 + 5, ly + lh - 5, w - 10, 4, BLs); P.hline(x0 + 5, ly + lh - 5, w - 10, BLc);
    // embrasure de la porte (les vantaux vitrés sont dessinés par le jeu et s'ouvrent)
    P.rect(dx - 2, ly, dw + 4, lh, BLs);
    P.rect(dx, ly + 1, dw, lh - 1, '#f6d89a');
    P.rect(dx, ly + 1, dw, 3, '#fff0c8');
    for (let i = 1; i < dw - 1; i += 3) P.rect(dx + i, ly + 7, 2, 6, r.pick(['#e1251b', '#1d4f9c', '#3fa055', '#f2c230', '#f08a2a']));
    P.hline(dx, ly + 13, dw, '#8a5634');
    out.door = { x: dx, y: ly + 1, w: dw, h: lh - 1 };
    // store rayé bleu et blanc
    awning(P, x0 + 3, ly, w - 6, '#2a52a0', '#f2ecdc');
    // enseigne suspendue (potence en fer forgé + plaque ronde avec le logo)
    const ex = x0 + 10, ey = y0 - 26;
    P.rect(x0 + 3, ey, 2, 9, IRON.a); P.rect(x0 + 3, ey, 26, 2, IRON.a); P.hline(x0 + 3, ey, 26, IRON.hi);
    P.px(x0 + 7, ey + 2, IRON.a); P.px(x0 + 8, ey + 3, IRON.a); P.px(x0 + 9, ey + 3, IRON.a);
    P.vline(ex + 2, ey + 2, 3, IRON.b); P.vline(ex + 21, ey + 2, 3, IRON.b);
    P.rect(ex - 1, ey + 4, 26, 19, '#1b1630'); P.rect(ex, ey + 5, 24, 17, CREME); P.rect(ex, ey + 5, 24, 1, '#ffffff');
    P.draw(carrefourLogo('petit'), ex + 2, ey + 7);
    out.lights.push({ x: ex + 12, y: ey + 13, r: 14, k: 'neon' });
    out.lights.push({ x: x0 + w / 2, y: y0 + h + 6, r: 50, k: 'shop' });
  }

  // club de jazz : porte rouge, marquise lumineuse, néon en forme de note, affiches
  function jazzclub(P, x0, y0, w, h, pal, r, out) {
    P.rect(x0, y0, w, h, '#2a1c26');
    P.rect(x0, y0, 3, h, pal.mid); P.rect(x0 + w - 3, y0, 3, h, pal.mid);
    const dw = 16, dx = Math.round(x0 + w / 2 - dw / 2);
    // marquise avec ampoules
    P.rect(x0 + 2, y0 + 1, w - 4, 6, '#7a1e2a'); P.hline(x0 + 2, y0 + 1, w - 4, '#b8343a'); P.hline(x0 + 2, y0 + 6, w - 4, '#3a0e16');
    for (let i = x0 + 4; i < x0 + w - 4; i += 3) out.ampoules.push([i, y0 + 3]);
    // néon : une croche rose
    const nx = dx + 4, ny = y0 + 9;
    const ne = '#ff6ab0';
    P.vline(nx + 6, ny, 9, ne); P.rect(nx + 3, ny + 7, 4, 3, ne); P.px(nx + 7, ny + 1, ne); P.px(nx + 8, ny + 2, ne); P.px(nx + 8, ny + 3, ne);
    out.lights.push({ x: nx + 6, y: ny + 5, r: 16, k: 'rose' });
    // porte capitonnée rouge
    P.rect(dx, y0 + 20, dw, h - 20, '#5a1220'); P.rect(dx + 1, y0 + 21, dw - 2, h - 22, '#8a2232');
    for (let yy = y0 + 23; yy < y0 + h - 2; yy += 4) for (let xx = dx + 3; xx < dx + dw - 2; xx += 4) P.px(xx, yy, '#c9a040');
    P.vline(dx + dw / 2, y0 + 21, h - 22, '#3a0a14');
    P.rect(dx - 2, y0 + h - 2, dw + 4, 2, '#4a3a3a');
    // affiches de concert de part et d'autre
    P.draw(affiche(r.int(1000), 'JAZZ'), x0 + 3, y0 + 14);
    P.draw(affiche(r.int(1000), 'CLUB'), x0 + w - 3 - 17, y0 + 14);
    out.lights.push({ x: x0 + w / 2, y: y0 + h + 4, r: 34, k: 'shop' });
  }

  // ------------------------------------------------------------ affiches de jazz
  // petite police 3x5 pour quelques mots
  const FONTE = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
    E: ['###', '#..', '##.', '#..', '###'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
    J: ['..#', '..#', '..#', '#.#', '.#.'], L: ['#..', '#..', '#..', '#..', '###'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
    S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'],
    W: ['#.#', '#.#', '#.#', '###', '#.#'], Z: ['###', '..#', '.#.', '#..', '###'], N: ['##.', '#.#', '#.#', '#.#', '#.#'],
    M: ['#.#', '###', '#.#', '#.#', '#.#'], ' ': ['...', '...', '...', '...', '...'],
    G: ['.##', '#..', '#.#', '#.#', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  };
  function texte(P, mot, x, y, col) {
    [...mot].forEach((ch, k) => {
      const g = FONTE[ch];
      if (g) g.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') P.px(x + k * 4 + i, y + j, col); }));
    });
  }
  const AFF = [
    { fond: '#efe2c4', bord: '#8a5a3a', txt: '#b8343a', ill: '#1d1626', acc: '#e8b54a' },
    { fond: '#b8343a', bord: '#5a1220', txt: '#f6ead2', ill: '#1d1626', acc: '#f2c230' },
    { fond: '#26365e', bord: '#141c38', txt: '#e8b54a', ill: '#f6ead2', acc: '#ff8ab0' },
    { fond: '#2f6a62', bord: '#163a36', txt: '#f6ead2', ill: '#1d1626', acc: '#e8b54a' },
    { fond: '#e8b54a', bord: '#8a5a1e', txt: '#26365e', ill: '#1d1626', acc: '#b8343a' },
  ];
  const cacheAffiches = {};
  function affiche(seed, mot = 'JAZZ') {
    const cle = seed + mot;
    if (cacheAffiches[cle]) return cacheAffiches[cle];
    const r = PX.rng(seed + 7);
    const st = AFF[seed % AFF.length];
    const W = 17, H = 23, c = PX.canvas(W, H), P = PX.painter(c);
    P.rect(0, 0, W, H, st.bord); P.rect(1, 1, W - 2, H - 2, st.fond);
    texte(P, mot, Math.round((W - (mot.length * 4 - 1)) / 2), 2, st.txt);
    const motif = seed % 4;
    if (motif === 0) {
      // chat qui joue de la trompette
      P.rect(4, 11, 5, 7, st.ill); P.rect(4, 9, 5, 3, st.ill); P.px(4, 8, st.ill); P.px(8, 8, st.ill);
      P.px(5, 10, st.acc); P.px(7, 10, st.acc); P.rect(3, 18, 7, 1, st.ill); P.px(2, 15, st.ill); P.px(2, 16, st.ill); P.px(3, 17, st.ill);
      P.hline(9, 12, 4, st.acc); P.rect(13, 11, 2, 3, st.acc);
    } else if (motif === 1) {
      // grande croche
      P.rect(9, 8, 2, 9, st.ill); P.rect(6, 15, 4, 3, st.ill); P.rect(11, 8, 3, 2, st.ill); P.px(13, 10, st.ill);
      P.px(4, 10, st.acc); P.px(13, 15, st.acc); P.px(3, 17, st.acc);
    } else if (motif === 2) {
      // lune et chat sur un toit
      P.ellipse(11, 11, 3, 3, st.acc); P.ellipse(12, 10, 2, 2, st.fond);
      P.rect(1, 17, W - 2, 3, st.ill); P.rect(4, 14, 3, 3, st.ill); P.px(4, 13, st.ill); P.px(6, 13, st.ill); P.px(8, 15, st.ill); P.px(9, 14, st.ill);
    } else {
      // saxophone
      P.vline(9, 8, 7, st.acc); P.vline(10, 8, 7, st.acc); P.rect(6, 14, 5, 3, st.acc); P.rect(5, 12, 2, 3, st.acc); P.px(8, 7, st.acc); P.px(7, 6, st.acc);
      P.px(9, 10, st.ill); P.px(9, 12, st.ill); P.px(4, 9, st.ill); P.px(13, 13, st.ill);
    }
    for (let x = 2; x < W - 2; x += 2) P.px(x, H - 3, st.txt);
    void r;
    return (cacheAffiches[cle] = c);
  }

  // ------------------------------------------------------------ immeuble
  // o = { w, etages, facade, style:'classique'|'ancien', boutique, seed, lierre, volets, cheminees }
  function building(o) {
    const r = PX.rng(o.seed || 7);
    const pal = STONE[o.facade || 'creme'];
    const W = o.w, old = o.style === 'ancien';
    const floors = o.etages || (old ? 3 : 5);
    const CH = 16, RP = old ? 0 : 13, MANS = old ? 0 : 22, TILE = old ? 26 : 0, CORN = old ? 3 : 5, GF = 46;
    const fh = [];
    for (let i = floors; i >= 1; i--) fh.push(i === 2 && !old ? 25 : 22);
    const floorsH = fh.reduce((a, b) => a + b, 0);
    const H = CH + RP + MANS + TILE + CORN + floorsH + GF;
    const c = PX.canvas(W, H);
    const P = PX.painter(c);
    const out = { lights: [], smoke: [], door: null, fenetres: [], ampoules: [] };
    const nb = Math.max(2, Math.floor((W - 6) / 19));
    const bw = (W - 6) / nb;
    const bays = Array.from({ length: nb }, (_, i) => Math.round(3 + bw * (i + 0.5)));
    const nightLit = (p) => r.chance(p);

    let y = CH;
    // ---- toit
    if (!old) {
      P.rect(0, y, W, RP, ZINC.a);
      for (let x = 0; x < W; x++) {
        if (x % 4 === 0) P.vline(x, y, RP, ZINC.hi);
        else if (x % 4 === 1) P.vline(x, y, RP, ZINC.b);
      }
      P.dither(0, y, W, 4, ZINC.hi, 5);
      P.hline(0, y, W, ZINC.e);
      for (let k = 0; k < Math.floor(W / 45); k++) {
        const sx = 6 + r.int(W - 14);
        P.rect(sx, y + 3 + r.int(4), 5, 4, FRAME.b); P.rect(sx + 1, y + 4 + 0, 3, 2, GLASS.dark);
      }
      y += RP;
      // ---- mansarde + lucarnes
      P.rect(0, y, W, MANS, ZINC.c);
      for (let x = 0; x < W; x += 3) P.vline(x, y, MANS, ZINC.d);
      P.dither(0, y + MANS - 8, W, 8, ZINC.d, 7);
      P.hline(0, y, W, ZINC.hi); P.hline(0, y + 1, W, ZINC.a);
      bays.forEach((bx, i) => { if (nb <= 4 || i % 2 === 0 || i === nb - 1) dormer(P, bx, y + 1, MANS - 1, nightLit(0.35), pal); });
      y += MANS;
    } else {
      // vieux toit en tuiles plates
      for (let j = 0; j < TILE; j++) {
        const col = j < 2 ? TUILE.hi : j % 3 === 0 ? TUILE.c : TUILE.a;
        P.hline(0, y + j, W, col);
        if (j % 3 === 1) for (let x = (j % 6 === 1 ? 0 : 2); x < W; x += 4) P.px(x, y + j, TUILE.b);
      }
      P.hline(0, y, W, TUILE.d);
      P.dither(0, y + TILE - 6, W, 6, TUILE.c, 6);
      bays.forEach((bx, i) => { if (i % 2 === 1) dormer(P, bx, y + 3, TILE - 4, nightLit(0.4), pal); });
      y += TILE;
    }
    // ---- cheminées (posées sur le toit, elles dépassent vers le haut)
    const nch = o.cheminees ?? 1 + r.int(2);
    for (let k = 0; k < nch; k++) {
      const cw = 8 + r.int(3) * 3, ch = 14 + r.int(8);
      const cx = Math.round(((k + 0.5) / nch) * (W - cw - 4) + 2 + (r() - 0.5) * 10);
      const cy = CH + (old ? 4 : 6) - ch + 6;
      const tops = chimney(P, Math.max(2, Math.min(W - cw - 2, cx)), cy, cw, ch, r.chance(0.5), r);
      P.dither(Math.max(2, Math.min(W - cw - 2, cx)) + cw, cy + ch - 5, 3, 5, ZINC.e, 9);
      if (r.chance(0.6)) out.smoke.push(tops[0]);
    }
    // ---- corniche
    P.rect(0, y, W, CORN, pal.base);
    P.hline(0, y, W, pal.hi);
    if (!old) { for (let x = 0; x < W; x += 2) P.px(x, y + 2, pal.mid); P.hline(0, y + 3, W, pal.lo); P.hline(0, y + 4, W, pal.deep); }
    else { P.hline(0, y + 1, W, TUILE.c); P.hline(0, y + 2, W, pal.deep); }
    y += CORN;
    // ---- étages
    const top = y;
    stoneWall(P, 0, top, W, floorsH, pal, r, old);
    P.dither(0, top, W, 3, '#2a1e3a', 6);
    P.dither(Math.floor(W * 0.72), top, W - Math.floor(W * 0.72), floorsH, pal.joint, 4);
    const voletCol = o.volets || null;
    for (let f = 0; f < fh.length; f++) {
      const level = floors - f;
      const h = fh[f];
      const fy = y;
      const wh = level === 2 && !old ? 16 : 13;
      const balconFilant = !old && (level === 2 || level === floors);
      bays.forEach((bx) => {
        const wx = bx - 4, wy = fy + 4;
        // linteau + clé
        P.rect(wx - 1, wy - 2, 11, 2, pal.hi);
        P.hline(wx - 1, wy - 1, 11, pal.joint);
        P.rect(bx, wy - 3, 1, 3, pal.hi);
        P.px(bx + 1, wy - 2, pal.mid);
        if (level === 2 && !old) { P.rect(wx - 2, wy - 4, 13, 1, pal.hi); P.hline(wx - 2, wy - 3, 13, pal.mid); }
        const lit = nightLit(0.3);
        windowFr(P, wx, wy, 9, wh, lit);
        out.fenetres.push({ x: bx, y: wy + wh, lit, niveau: level, balcon: balconFilant });
        if (lit) out.lights.push({ x: bx, y: wy + wh / 2 + (H - c.height), r: 12, k: 'win', yRel: wy + wh / 2 });
        if (voletCol) { shutters(P, wx - 4, wy, wh, voletCol); shutters(P, wx + 10, wy, wh, voletCol); }
        P.hline(wx - 1, wy + wh, 11, pal.hi);
        P.dither(wx - 1, wy + wh + 1, 11, 1, pal.lo, 10);
        if (!balconFilant) {
          railing(P, wx, wy + wh - 5, 9, 5);
          if (r.chance(0.18)) flowerBox(P, wx, wy + wh - 1, 9, r);
        }
      });
      if (balconFilant) {
        const by = fy + 4 + wh - 5;
        railing(P, 1, by, W - 2, 5);
        P.rect(0, by + 5, W, 2, pal.hi);
        P.hline(0, by + 6, W, pal.mid);
        P.dither(0, by + 7, W, 2, '#2a1e3a', 7);
        for (let x = 4; x < W - 2; x += 10) { P.rect(x, by + 7, 2, 2, pal.mid); P.px(x, by + 7, pal.hi); }
        if (r.chance(0.5)) for (let k = 0; k < 2; k++) flowerBox(P, 4 + r.int(W - 16), by + 4, 7, r);
      }
      y += h;
    }
    // ---- lierre
    if (o.lierre) {
      const ix = o.lierre === 'droite' ? W - 22 : 0;
      for (let k = 0; k < 120; k++) {
        const px = ix + r.int(22), py = top + floorsH - r.int(Math.floor(floorsH * 0.9));
        P.ellipse(px, py, 1 + r.int(2), 1, r.pick(['#2f5d3a', '#3f7a45', '#4e8c4a', '#2a4a33']));
      }
      for (let k = 0; k < 25; k++) P.px(ix + r.int(22), top + r.int(floorsH), '#79b85a');
    }
    // ---- rez-de-chaussée
    P.hline(0, y, W, pal.hi); P.hline(0, y + 1, W, pal.mid);
    shopfront(P, o.boutique || 'porte', 0, y + 2, W, GF - 4, o.porte ? Object.assign({}, pal, { porte: o.porte }) : pal, r, out);
    P.rect(0, H - 2, W, 2, pal.lo);
    P.hline(0, H - 1, W, pal.deep);
    // ---- arêtes du bâtiment
    P.vline(0, top, floorsH, pal.hi);
    P.vline(W - 1, CH, H - CH, S(pal.base, -0.55));
    P.vline(W - 2, top, floorsH, pal.mid);
    for (const l of out.lights) if (l.yRel !== undefined) l.y = l.yRel;
    return { img: c, w: W, h: H, roofY: CH, lights: out.lights, smoke: out.smoke, door: out.door, fenetres: out.fenetres, ampoules: out.ampoules };
  }

  return { building, carrefourLogo, affiche, texte, windowFr, railing, stoneWall, STONE, ZINC, GLASS, LIT, IRON, FRAME, TUILE, chimney, dormer, flowerBox, shutters, awning };
})();
