// =====================================================================
//  titre.js — écran d'accueil animé : ciel d'hiver, lune, toits aux
//  fenêtres allumées, neige, et Georges assis sur un toit.
//  (le titre « Juste un indice… » est du texte, voir index.html)
// =====================================================================
'use strict';

const Titre = (() => {
  let ecran, eg, buf, bg, W = 240, H = 135, S = 4, raf = 0, actif = false;
  let fond = null, flocons = [], georges = null, fenetres = [], etoiles = [];

  function dimensionner() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cw = Math.round(innerWidth * dpr), ch = Math.round(innerHeight * dpr);
    ecran.width = cw; ecran.height = ch;
    S = Math.max(1, Math.round(ch / 108));
    W = Math.ceil(cw / S); H = Math.ceil(ch / S);
    buf.width = W; buf.height = H;
    eg.imageSmoothingEnabled = false; bg.imageSmoothingEnabled = false;
    construireFond();
  }

  // décor fixe : ciel tramé, lune, silhouettes de toits, toit au premier plan
  function construireFond() {
    const r = PX.rng(12);
    fond = PX.canvas(W, H);
    const P = PX.painter(fond);
    P.vgrad(0, 0, W, Math.round(H * 0.75), '#0d0920', '#2c2152');
    P.rect(0, Math.round(H * 0.75), W, H, '#2c2152');
    etoiles = [];
    for (let k = 0; k < W * H / 220; k++) etoiles.push([r.int(W), r.int(Math.round(H * 0.55)), r()]);
    // lune et halo (assez basse pour ne pas gêner le titre : elle se lève derrière les toits)
    const lx = Math.round(W * 0.9), ly = Math.round(H * 0.4);
    for (const [rr, c] of [[22, 'rgba(255,230,180,0.05)'], [16, 'rgba(255,230,180,0.08)']]) P.ellipse(lx, ly, rr, rr, c);
    P.ellipse(lx, ly, 10, 10, '#f4e6c4'); P.ellipse(lx - 2, ly - 2, 8, 8, '#fff6dc');
    P.ellipse(lx + 3, ly + 2, 2, 2, '#e2d0a8'); P.ellipse(lx - 3, ly + 4, 1, 1, '#e2d0a8'); P.px(lx + 1, ly - 4, '#e2d0a8');
    // nuages fins devant la lune
    P.rect(lx - 26, ly + 6, 30, 2, 'rgba(60,48,100,0.85)'); P.rect(lx - 18, ly + 8, 22, 1, 'rgba(60,48,100,0.85)');
    // silhouettes lointaines (toits, cheminées, lucarnes allumées)
    fenetres = [];
    const plan = (base, couleur, hMin, hMax, densite) => {
      for (let x = -10; x < W;) {
        const w = 18 + r.int(28), h = hMin + r.int(hMax - hMin);
        const y = base - h;
        P.rect(x, y, w, h + 40, couleur);
        P.trap(x, w, x - 2, w + 4, y - 6, 6, couleur);
        if (r.chance(0.7)) { const cx = x + 3 + r.int(Math.max(1, w - 8)); P.rect(cx, y - 11, 4, 6, couleur); P.rect(cx - 1, y - 12, 6, 1, couleur); }
        for (let fy = y + 4; fy < base - 2; fy += 7) for (let fx = x + 3; fx < x + w - 3; fx += 6) {
          if (r.chance(densite)) fenetres.push([fx, fy, r.chance(0.5) ? '#ffcf70' : '#f2a54a', r()]);
        }
        x += w + r.int(3);
      }
    };
    plan(Math.round(H * 0.68), '#1c1636', 18, 34, 0.12);
    plan(Math.round(H * 0.8), '#151027', 14, 26, 0.18);
    // toit en zinc au premier plan, avec une lucarne allumée
    const ty = Math.round(H * 0.8);
    P.rect(0, ty, W, H - ty, '#3e4766');
    for (let x = 0; x < W; x += 4) { P.vline(x, ty, H - ty, '#4f5a7c'); P.vline(x + 1, ty, H - ty, '#343c58'); }
    P.hline(0, ty, W, '#8a96b4'); P.hline(0, ty + 1, W, '#5c6888');
    P.dither(0, ty + 2, W, 6, '#262b42', 6);
    const lux = Math.round(W * 0.22);
    P.rect(lux, ty - 14, 16, 18, '#e6dcc6'); P.trap(lux + 8, 1, lux - 1, 18, ty - 20, 6, '#e6dcc6');
    P.rect(lux + 3, ty - 11, 10, 13, '#ffcf70'); P.rect(lux + 4, ty - 10, 3, 11, '#f4e5c6'); P.vline(lux + 8, ty - 11, 13, '#c4b9a6');
    const chx = Math.round(W * 0.6);
    P.rect(chx, ty - 16, 12, 18, '#a65b46'); P.rect(chx - 1, ty - 16, 14, 2, '#c97d5f');
    for (let k = 0; k < 3; k++) P.rect(chx + 1 + k * 4, ty - 20, 2, 4, '#d4744a');
    fond.cheminee = { x: chx + 6, y: ty - 21 };
    fond.toit = ty;
    flocons = Array.from({ length: Math.round(W / 4) }, () => ({ x: r() * W, y: r() * H, v: 6 + r() * 10, d: r() * 6 }));
  }

  function dessiner(t) {
    if (!actif) return;
    bg.drawImage(fond, 0, 0);
    // étoiles qui scintillent
    for (const [x, y, p] of etoiles) {
      const on = Math.sin(t / 700 + p * 40) > 0.2;
      bg.fillStyle = on ? '#f6ead2' : '#6a5f9a';
      bg.fillRect(x, y, 1, 1);
    }
    // fenêtres qui s'allument et s'éteignent doucement
    for (const [x, y, c, p] of fenetres) {
      if (Math.sin(t / 3000 + p * 50) < -0.85) continue;
      bg.fillStyle = c; bg.fillRect(x, y, 2, 2);
    }
    // fumée de la cheminée
    const ch = fond.cheminee;
    for (let k = 0; k < 5; k++) {
      const a = ((t / 1600 + k / 5) % 1);
      bg.globalAlpha = 0.5 * (1 - a);
      bg.fillStyle = '#b8b0d0';
      const rr = 1 + Math.floor(a * 3);
      bg.fillRect(Math.round(ch.x + a * 14 + Math.sin(a * 6) * 2 - rr), Math.round(ch.y - a * 26 - rr), rr * 2, rr * 2);
    }
    bg.globalAlpha = 1;
    // Georges, assis sur le toit au clair de lune : il remue la queue, cligne des yeux,
    // et se tourne parfois vers la lune
    const gx = Math.round(W * 0.78), gy = fond.toit + 1;
    const s = georges, cligne = (t % 4200) < 160;
    const img = Math.floor(t / 4000) % 3 === 2 ? s.sitR[Math.floor(t / 600) % 2] : cligne ? s.sitBlink : s.sit[Math.floor(t / 700) % 2];
    if (!img.lune) img.lune = PX.silhouette(img, '#a8a2e0');
    const ix = gx - (img.width >> 1), iy = gy - img.height + 2;
    bg.drawImage(img.lune, ix + 1, iy - 1);
    bg.drawImage(img, ix, iy);
    // neige
    bg.fillStyle = '#f4f2ff';
    for (const f of flocons) {
      f.y += f.v / 60; f.x += Math.sin((t / 900) + f.d) * 0.15;
      if (f.y > H) { f.y = -2; f.x = Math.random() * W; }
      bg.fillRect(Math.round(f.x), Math.round(f.y), f.v > 12 ? 2 : 1, f.v > 12 ? 2 : 1);
    }
    eg.drawImage(buf, 0, 0, W * S, H * S);
    raf = requestAnimationFrame(dessiner);
  }

  function demarrer() {
    ecran = document.getElementById('titre-scene'); eg = ecran.getContext('2d');
    buf = PX.canvas(10, 10); bg = buf.getContext('2d');
    georges = Sprites.cat('georges');
    dimensionner();
    addEventListener('resize', dimensionner);
    actif = true;
    raf = requestAnimationFrame(dessiner);
  }
  function arreter() { actif = false; cancelAnimationFrame(raf); removeEventListener('resize', dimensionner); }
  return { demarrer, arreter };
})();
