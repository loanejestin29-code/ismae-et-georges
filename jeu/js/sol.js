// =====================================================================
//  sol.js — textures du sol dessinées une fois au chargement :
//  pavés, trottoirs, bordures, quais, escaliers, eau, toits de fond…
// =====================================================================
'use strict';

const Sol = (() => {
  const S = PX.shade;

  // vieux pavés en rangées décalées
  function paves(P, x, y, w, h, r, tons) {
    const T = tons || { base: ['#6f6b7d', '#77728a', '#686478', '#7a727c', '#716d84'], hi: '#928ea2', lo: '#55516a', joint: '#3f3b50' };
    P.rect(x, y, w, h, T.joint);
    const sw = 6, sh = 4;
    for (let row = 0, yy = y; yy < y + h; row++, yy += sh + 1) {
      const off = (row % 2) * 3 - 3;
      for (let xx = x + off; xx < x + w; xx += sw + 1) {
        const ww = sw + (r.chance(0.2) ? -1 : 0);
        const x0 = Math.max(x, xx), x1 = Math.min(x + w, xx + ww);
        const y1 = Math.min(y + h, yy + sh);
        if (x1 <= x0 || y1 <= yy) continue;
        P.rect(x0, yy, x1 - x0, y1 - yy, r.pick(T.base));
        P.hline(x0 + 1, yy, Math.max(0, x1 - x0 - 2), T.hi);
        P.hline(x0, y1 - 1, x1 - x0, T.lo);
        if (r.chance(0.08)) P.px(x0 + 2, yy + 1, T.hi);
        if (r.chance(0.04)) P.rect(x0, yy, x1 - x0, y1 - yy, T.lo); // pavé enfoncé
      }
    }
    // usure : taches plus claires ou plus sombres, pour casser la répétition
    for (let k = 0; k < (w * h) / 2600; k++) {
      const cx = x + r.int(w), cy = y + r.int(h);
      P.ellipse(cx, cy, 6 + r.int(14), 2 + r.int(5), r.chance(0.5) ? 'rgba(255,240,220,0.06)' : 'rgba(20,10,40,0.09)');
    }
  }

  // bande d'ombre douce (sans trame) : alpha décroissant sur h pixels
  function bande(P, x, y, w, h, a = 0.45, vers = 'bas', col = '27,16,48') {
    for (let j = 0; j < h; j++) {
      const t = 1 - j / h;
      if (vers === 'bas') P.rect(x, y + j, w, 1, `rgba(${col},${(a * t).toFixed(3)})`);
      else if (vers === 'haut') P.rect(x, y + h - 1 - j, w, 1, `rgba(${col},${(a * t).toFixed(3)})`);
      else if (vers === 'droite') P.rect(x + j, y, 1, w, `rgba(${col},${(a * t).toFixed(3)})`);
      else P.rect(x + h - 1 - j, y, 1, w, `rgba(${col},${(a * t).toFixed(3)})`);
    }
  }

  function trottoir(P, x, y, w, h, r) {
    P.rect(x, y, w, h, '#a3988c');
    P.speckle(x, y, w, h, ['#b2a89b', '#958a7f', '#8c8276'], 0.08, r);
    for (let yy = y + 9; yy < y + h; yy += 10) P.hline(x, yy, w, '#8c8276');
    for (let row = 0, yy = y; yy < y + h; yy += 10, row++)
      for (let xx = x + (row % 2) * 8; xx < x + w; xx += 16) P.vline(xx, yy, Math.min(9, y + h - yy), '#8f857a');
  }

  // bordure de trottoir (granit) + caniveau
  function bordure(P, x, y, w, dessous = true) {
    P.hline(x, y, w, '#d9d1c4');
    P.hline(x, y + 1, w, '#bdb4a5');
    P.hline(x, y + 2, w, '#7d7568');
    for (let xx = x; xx < x + w; xx += 24) P.vline(xx, y, 3, '#8f877a');
    if (dessous) { P.hline(x, y + 3, w, '#4a4658'); P.dither(x, y + 4, w, 2, '#4a4658', 6); }
  }

  function gravier(P, x, y, w, h, r) {
    P.rect(x, y, w, h, '#bca988');
    P.speckle(x, y, w, h, ['#cdbb98', '#a99674', '#d8c8a8', '#9c8a6a'], 0.18, r);
  }

  function dalles(P, x, y, w, h, r, base = '#9a917f') {
    P.rect(x, y, w, h, S(base, -0.3));
    for (let row = 0, yy = y; yy < y + h; row++) {
      const sh = 7 + r.int(4);
      for (let xx = x - r.int(8); xx < x + w;) {
        const sw = 9 + r.int(8);
        const x0 = Math.max(x, xx), x1 = Math.min(x + w, xx + sw - 1), y1 = Math.min(y + h, yy + sh - 1);
        if (x1 > x0 && y1 > yy) {
          const c = PX.mix(base, r.pick(['#a8a08c', '#8e8676', '#a49478', '#8c8a7c']), 0.5);
          P.rect(x0, yy, x1 - x0, y1 - yy, c);
          P.hline(x0, yy, x1 - x0, S(c, 0.15));
          if (r.chance(0.25)) P.px(x0 + r.int(Math.max(1, x1 - x0)), y1 - 1, '#5d7a4a');
        }
        xx += sw;
      }
      yy += sh;
    }
  }

  function herbe(P, x, y, w, h, r) {
    P.rect(x, y, w, h, '#3f6a3e');
    P.speckle(x, y, w, h, ['#4f7e48', '#355a36', '#5c8f50', '#2f5232'], 0.25, r);
    for (let k = 0; k < (w * h) / 60; k++) {
      const px = x + r.int(w), py = y + 1 + r.int(h - 1);
      P.px(px, py, '#6fa05a'); P.px(px, py - 1, '#5c8f50');
    }
  }

  // massif de fleurs
  function massif(P, x, y, w, h, r) {
    P.rect(x, y, w, h, '#4a3426');
    P.speckle(x, y, w, h, ['#5a4030', '#3a281e'], 0.3, r);
    for (let k = 0; k < (w * h) / 6; k++) {
      const px = x + r.int(w), py = y + r.int(h);
      P.px(px, py, r.chance(0.6) ? r.pick(['#3f7a45', '#2f5d3a', '#5c9a4f']) : r.pick(['#e8434b', '#f2a3b8', '#f4f0f0', '#ffd34e', '#b45ad0']));
    }
    P.hline(x, y, w, '#8a8478'); P.hline(x, y + h - 1, w, '#6a6458');
  }

  // toits de fond vus d'en haut (zones inaccessibles au nord)
  function toits(P, x, y, w, h, r) {
    P.rect(x, y, w, h, '#4b5470');
    for (let yy = y; yy < y + h; yy += 30 + r.int(10)) {
      for (let xx = x - r.int(40); xx < x + w;) {
        const bw = 50 + r.int(90), bh = 26 + r.int(8);
        const tuile = r.chance(0.22);
        const base = tuile ? '#a85a44' : r.pick(['#7c88a2', '#8692aa', '#72809a']);
        const x0 = Math.max(x, xx), x1 = Math.min(x + w, xx + bw);
        if (x1 > x0) {
          P.rect(x0, yy, x1 - x0, bh, base);
          for (let sx = x0; sx < x1; sx++) {
            if (!tuile && sx % 4 === 0) P.vline(sx, yy, bh, S(base, 0.18));
            if (tuile && sx % 3 === 0) for (let sy = yy + 2; sy < yy + bh; sy += 3) P.px(sx, sy, S(base, -0.25));
          }
          P.hline(x0, yy, x1 - x0, S(base, 0.3));
          P.dither(x0, yy + bh - 6, x1 - x0, 6, S(base, -0.25), 7);
          P.hline(x0, yy + bh - 1, x1 - x0, '#2a2a3e');
          if (x1 - x0 > 30 && r.chance(0.7)) {
            const cx = x0 + 6 + r.int(x1 - x0 - 16), cw = 7 + r.int(6);
            P.rect(cx, yy + 4, cw, 9, r.chance(0.5) ? '#d6c3a3' : '#a65b46');
            P.hline(cx - 1, yy + 4, cw + 2, '#ebdcc0'); P.rect(cx + cw - 2, yy + 5, 2, 8, '#7a3e33');
            for (let p = cx + 1; p < cx + cw - 1; p += 3) P.rect(p, yy + 1, 2, 3, '#d4744a');
            P.dither(cx + cw, yy + 8, 3, 6, '#2a2a3e', 8);
          }
          if (r.chance(0.5)) { const sx = x0 + 4 + r.int(Math.max(1, x1 - x0 - 10)); P.rect(sx, yy + 10, 5, 4, '#c4b9a6'); P.rect(sx + 1, yy + 11, 3, 2, '#262c47'); }
        }
        xx += bw + 1;
      }
    }
  }

  // mur de soutènement du quai (gros blocs de pierre)
  function murQuai(P, x, y, w, h, r) {
    const b = '#9b9081';
    P.rect(x, y, w, h, S(b, -0.35));
    for (let row = 0, yy = y; yy < y + h; row++, yy += 8) {
      for (let xx = x + (row % 2 ? -10 : 0); xx < x + w; xx += 20) {
        const x0 = Math.max(x, xx), x1 = Math.min(x + w, xx + 19), y1 = Math.min(y + h, yy + 7);
        if (x1 <= x0) continue;
        const c = PX.mix(b, r.pick(['#a69a88', '#8e8474', '#958c80', '#a29684']), 0.5);
        P.rect(x0, yy, x1 - x0, y1 - yy, c);
        P.hline(x0, yy, x1 - x0, S(c, 0.2));
        P.hline(x0, y1 - 1, x1 - x0, S(c, -0.2));
      }
    }
    bande(P, x, y, w, 7, 0.55);
    for (let k = 0; k < w / 6; k++) { const px = x + r.int(w); P.vline(px, y + h - 4 - r.int(10), 3 + r.int(6), r.pick(['#4e6e44', '#3e5a3a', '#5d7a4a'])); }
    for (let k = 0; k < w / 40; k++) { // traînées d'humidité
      const px = x + r.int(w); P.rect(px, y + 6, 2, h - 12 - r.int(10), 'rgba(40,50,60,0.18)');
    }
    bande(P, x, y + h - 6, w, 6, 0.4, 'haut', '46,58,46');
  }

  function parapet(P, x, y, w) {
    P.rect(x, y, w, 3, '#e2d8c6'); P.hline(x, y, w, '#f2eadc');
    P.rect(x, y + 3, w, 5, '#b7ab98');
    for (let xx = x; xx < x + w; xx += 22) P.vline(xx, y, 8, '#9a8e7c');
    P.hline(x, y + 7, w, '#6e6456');
  }

  // escalier qui descend vers le sud
  function escalier(P, x, y, w, h) {
    P.rect(x, y, w, h, '#8e8474');
    for (let yy = y; yy < y + h; yy += 5) {
      P.hline(x, yy, w, '#d2c8b6'); P.hline(x, yy + 1, w, '#b6ab98'); P.rect(x, yy + 2, w, 3, '#8a8070');
      P.hline(x, yy + 4, w, '#6a6254');
    }
    P.rect(x - 4, y - 2, 4, h + 2, '#b7ab98'); P.rect(x + w, y - 2, 4, h + 2, '#b7ab98');
    P.vline(x - 4, y - 2, h + 2, '#e2d8c6'); P.vline(x + w + 3, y - 2, h + 2, '#6e6456');
    P.dither(x, y, 4, h, '#2a2238', 8);
  }

  function eau(P, x, y, w, h) {
    P.vgrad(x, y, w, h, '#24426a', '#152a48');
    P.dither(x, y, w, 10, '#0f1f36', 9);
  }

  function grille(P, cx, cy) {
    P.ellipse(cx, cy, 9, 4, '#2a2632');
    P.ellipse(cx, cy, 7, 3, '#4a4458');
    for (let a = 0; a < 12; a++) { const t = (a / 12) * Math.PI * 2; P.px(cx + Math.round(Math.cos(t) * 6), cy + Math.round(Math.sin(t) * 2.5), '#2a2632'); }
    P.ellipse(cx, cy, 3, 1, '#5a4636');
  }

  function plaque(P, cx, cy) {
    P.ellipse(cx, cy, 5, 2, '#3a3646'); P.ellipse(cx, cy, 4, 1, '#58546a');
    for (let i = -3; i <= 3; i += 2) P.px(cx + i, cy, '#3a3646');
  }

  // ombre douce (tramée) déposée sur un calque d'ombres
  function ombre(P, cx, cy, rx, ry, col = '#000') { P.ellipse(cx, cy, rx, ry, col); }

  return { paves, bande, trottoir, bordure, gravier, dalles, herbe, massif, toits, murQuai, parapet, escalier, eau, grille, plaque, ombre };
})();
