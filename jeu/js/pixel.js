// =====================================================================
//  pixel.js — petits outils pour dessiner du pixel art dans des canvas
//  (aucune image externe : tout est dessiné pixel par pixel ici)
// =====================================================================
'use strict';

const PX = (() => {
  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, w | 0);
    c.height = Math.max(1, h | 0);
    c.getContext('2d').imageSmoothingEnabled = false;
    return c;
  }

  // Générateur pseudo-aléatoire reproductible (la carte est identique à chaque partie)
  function rng(seed) {
    let a = seed >>> 0;
    const f = () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = (n) => Math.floor(f() * n);
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    f.chance = (p) => f() < p;
    return f;
  }

  // ---------- couleurs ----------
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb2hex(r, g, b) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
  }
  function mix(a, b, t) {
    const A = hex2rgb(a), B = hex2rgb(b);
    return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  // Ombre / lumière « teintée » comme en pixel art : on assombrit vers le violet
  // et on éclaircit vers un blanc chaud plutôt que vers le noir/blanc purs.
  function shade(c, amt) {
    return amt < 0 ? mix(c, '#24183a', -amt) : mix(c, '#fff3d6', amt);
  }
  function rgba(hex, a) {
    const [r, g, b] = hex2rgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

  // ---------- pinceau ----------
  function painter(c) {
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const P = {
      c, g,
      rect(x, y, w, h, col) {
        if (w <= 0 || h <= 0 || !col) return;
        g.fillStyle = col;
        g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
      },
      px(x, y, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); },
      hline(x, y, w, col) { P.rect(x, y, w, 1, col); },
      vline(x, y, h, col) { P.rect(x, y, 1, h, col); },
      // ellipse pleine, tracée ligne par ligne (bords nets, sans anti-crénelage)
      ellipse(cx, cy, rx, ry, col) {
        g.fillStyle = col;
        for (let dy = -ry; dy <= ry; dy++) {
          const t = 1 - (dy * dy) / ((ry + 0.5) * (ry + 0.5));
          if (t < 0) continue;
          const w = Math.round(rx * Math.sqrt(t) + 0.3);
          g.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
        }
      },
      // remplissage tramé : niveau 0 (rien) à 16 (plein)
      dither(x, y, w, h, col, level) {
        g.fillStyle = col;
        for (let j = 0; j < h; j++)
          for (let i = 0; i < w; i++)
            if (bayer(x + i, y + j) < level) g.fillRect(x + i, y + j, 1, 1);
      },
      // dégradé vertical tramé entre deux couleurs
      vgrad(x, y, w, h, c1, c2, bands = 4) {
        P.rect(x, y, w, h, c1);
        for (let j = 0; j < h; j++) {
          const t = h <= 1 ? 1 : j / (h - 1);
          const lvl = Math.round(t * 16);
          g.fillStyle = c2;
          for (let i = 0; i < w; i++) if (bayer(x + i, y + j) < lvl) g.fillRect(x + i, y + j, 1, 1);
        }
      },
      // petites taches aléatoires (textures de pierre, gravier, feuillage…)
      speckle(x, y, w, h, cols, density, r) {
        const n = Math.round(w * h * density);
        for (let k = 0; k < n; k++) {
          g.fillStyle = cols[Math.floor(r() * cols.length)];
          g.fillRect(x + Math.floor(r() * w), y + Math.floor(r() * h), 1, 1);
        }
      },
      // trapèze rempli ligne par ligne (auvents, toits…)
      trap(xTop, wTop, xBot, wBot, y, h, col) {
        g.fillStyle = col;
        for (let j = 0; j < h; j++) {
          const t = h <= 1 ? 0 : j / (h - 1);
          const x = Math.round(xTop + (xBot - xTop) * t);
          const w = Math.round(wTop + (wBot - wTop) * t);
          g.fillRect(x, y + j, w, 1);
        }
      },
      draw(img, x, y, flip = false) {
        if (!flip) g.drawImage(img, Math.round(x), Math.round(y));
        else {
          g.save();
          g.translate(Math.round(x) + img.width, Math.round(y));
          g.scale(-1, 1);
          g.drawImage(img, 0, 0);
          g.restore();
        }
      },
    };
    return P;
  }

  // ---------- sprites à partir de « grilles » de caractères ----------
  // rows : tableau de chaînes ; pal : { caractère: couleur }  ('.' = transparent)
  function fromRows(rows, pal, w, h) {
    w = w || Math.max(...rows.map((r) => r.length));
    h = h || rows.length;
    const c = canvas(w, h);
    const g = c.getContext('2d');
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const col = pal[row[x]];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  // Ajoute un contour d'1 pixel autour d'un sprite (col = couleur fixe,
  // ou 'auto' pour une version très sombre de la couleur voisine)
  function outline(src, col = '#1d1626', diag = false) {
    const w = src.width, h = src.height;
    const out = canvas(w + 2, h + 2);
    const g = out.getContext('2d');
    const sd = src.getContext('2d').getImageData(0, 0, w, h).data;
    const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : sd[(y * w + x) * 4 + 3]);
    const fixed = col !== 'auto' ? col : null;
    for (let y = -1; y <= h; y++) {
      for (let x = -1; x <= w; x++) {
        if (A(x, y) > 0) continue;
        let nx = -1, ny = -1;
        const nb = diag
          ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
          : [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dx, dy] of nb) if (A(x + dx, y + dy) > 0) { nx = x + dx; ny = y + dy; break; }
        if (nx < 0) continue;
        if (fixed) g.fillStyle = fixed;
        else {
          const i = (ny * w + nx) * 4;
          g.fillStyle = shade(rgb2hex(sd[i], sd[i + 1], sd[i + 2]), -0.72);
        }
        g.fillRect(x + 1, y + 1, 1, 1);
      }
    }
    g.drawImage(src, 1, 1);
    return out;
  }

  function flipX(src) {
    const c = canvas(src.width, src.height);
    const g = c.getContext('2d');
    g.translate(src.width, 0);
    g.scale(-1, 1);
    g.drawImage(src, 0, 0);
    return c;
  }

  // silhouette d'une couleur unie (ombres portées, fantôme derrière les murs)
  function silhouette(src, col) {
    const c = canvas(src.width, src.height);
    const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = col;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  return { canvas, rng, hex2rgb, rgb2hex, mix, shade, rgba, bayer, painter, fromRows, outline, flipX, silhouette };
})();
