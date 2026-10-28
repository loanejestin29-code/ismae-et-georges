// =====================================================================
//  decor-arendelle.js — les objets d'Arendelle (épreuve 3) : maisons
//  scandinaves colorées, château aux toits de cuivre vert, fontaine gelée,
//  marché de Noël, écurie, comptoir d'Oaken, bateaux pris dans la glace,
//  arrêt de bus… et les montagnes avec le palais de glace, peintes au fond.
//  Comme decor-objets.js : chaque objet renvoie { img, ax, ay } ((ax, ay) = point posé au sol),
//  avec parfois des lumières (lumieres : [[x, y, rayon, type]] dans l'image).
// =====================================================================
'use strict';

const Arendelle = (() => {
  const S = PX.shade, line = Objets.line;
  function mk(w, h) { const c = PX.canvas(w, h); return { c, P: PX.painter(c) }; }
  const NEIGE = '#eef3fb', NEIGE2 = '#d4e0f0', NEIGE3 = '#b4c8e2', GLACE = '#cfe8ff', BOIS = '#4a3428', BOIS2 = '#6a4a38';
  const MURS = ['#a8343a', '#d8a838', '#3a6aa8', '#4f8a5a', '#c86a3a', '#8a4a8a', '#e8d8b8', '#2f7a8a'];

  // ------------------------------------------------------------ petite police 3 × 5 pour les enseignes
  const L = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
    E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'], G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
    I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
    M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
    Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'], S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
    U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'], W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'], "'": ['.#.', '.#.', '...', '...', '...'], ' ': ['...', '...', '...', '...', '...'],
    '-': ['...', '...', '###', '...', '...'], '!': ['.#.', '.#.', '.#.', '...', '.#.'], '.': ['...', '...', '...', '...', '.#.'], 4: ['#.#', '#.#', '###', '..#', '..#'],
  };
  function texte(P, mot, x, y, col) { [...mot].forEach((ch, k) => { const g = L[ch]; if (g) g.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') P.px(x + k * 4 + i, y + j, col); })); }); }
  const largeurTexte = (mot) => mot.length * 4 - 1;

  // stalactites sous un bord de toit
  function glacons(P, r, x0, x1, y, max = 4) { for (let x = x0; x < x1; x += 2 + r.int(3)) { const l = 1 + r.int(max); P.vline(x, y, l, GLACE); P.px(x, y + l - 1, '#ffffff'); } }
  // neige bosselée posée sur un rebord
  function bourrelet(P, x0, x1, y) { for (let x = x0; x < x1; x++) { P.px(x, y, NEIGE); if ((x * 7) % 5 < 2) P.px(x, y - 1, '#ffffff'); } P.hline(x0, y + 1, x1 - x0, NEIGE3); }

  // ------------------------------------------------------------ maison scandinave
  // o : w (largeur du mur), couleur, style ('long' : toit vu d'en haut / 'pignon' : pignon en façade), volets, porte
  function maison(seed, o = {}) {
    const r = PX.rng(seed);
    const w = o.w || 80, style = o.style || (r.chance(0.5) ? 'pignon' : 'long');
    const mur = o.couleur || r.pick(MURS), murS = S(mur, -0.22), murC = S(mur, 0.2);
    const volet = o.volets || r.pick(['#f4efe6', '#2a4a6a', '#3a6a3a', '#7a2a2a', '#e8c040']);
    const porteC = o.porte || r.pick(['#3a4a8a', '#7a2a2a', '#2f5a3a', '#5a3a2a']);
    const hMur = o.hMur || 44, hToit = style === 'long' ? 36 : 34;
    const W = w + 12, H = hMur + hToit + 16, x0 = 6, x1 = 6 + w, base = H - 1, yMur = base - hMur, cx = Math.round(W / 2);
    const { c, P } = mk(W, H);
    const lumieres = [];
    // mur en planches verticales, soubassement de pierre
    P.rect(x0, yMur, w, hMur, mur);
    for (let x = x0 + 3; x < x1; x += 4) P.vline(x, yMur + 3, hMur - 3, murS);
    P.vline(x0, yMur, hMur, murC); P.vline(x1 - 1, yMur, hMur, S(mur, -0.4));
    P.rect(x0, base - 5, w, 5, '#77738a'); for (let x = x0; x < x1; x += 7) P.vline(x + (x % 2), base - 5, 5, '#5a566a'); P.hline(x0, base - 5, w, '#9a96aa');
    // bandeau blanc et frise de fleurs peintes
    P.rect(x0, yMur, w, 3, '#f4efe6');
    for (let x = x0 + 5; x < x1 - 3; x += 9) { P.px(x, yMur + 5, '#d8323a'); P.px(x - 1, yMur + 5, '#f2c230'); P.px(x + 1, yMur + 5, '#f2c230'); P.px(x, yMur + 4, '#3a8a4a'); P.px(x, yMur + 6, '#3a8a4a'); }
    // porte avec couronne de Noël
    const pw = 12, ph = 21, px0 = cx - 6;
    P.rect(px0 - 1, base - ph - 1, pw + 2, ph + 1, '#f4efe6'); P.rect(px0, base - ph, pw, ph, porteC);
    P.vline(cx, base - ph, ph, S(porteC, -0.35)); P.px(cx + 3, base - 10, '#e8b54a'); P.px(cx - 3, base - 10, '#e8b54a');
    P.ellipse(cx, base - ph + 6, 4, 4, '#2f6a3a'); P.ellipse(cx, base - ph + 6, 2, 2, porteC); P.px(cx, base - ph + 9, '#d8323a'); P.px(cx - 1, base - ph + 10, '#d8323a'); P.px(cx + 1, base - ph + 10, '#d8323a');
    P.rect(px0 - 3, base - 1, pw + 6, 2, '#9a96aa'); // marche
    lumieres.push([cx, base - 8, 24, 'win']);
    // fenêtres éclairées, volets, jardinières enneigées
    const nf = Math.max(1, Math.floor((w - 20) / 26));
    const pos = [];
    for (let k = 0; k < nf; k++) { const fx = x0 + Math.round(((k + 0.5) * w) / nf); if (Math.abs(fx - cx) > 13) pos.push(fx); else { pos.push(fx - 20 > x0 + 6 ? fx - 20 : null); } }
    if (!pos.some((p) => p && p > cx)) pos.push(Math.min(x1 - 12, cx + 22));
    if (!pos.some((p) => p && p < cx)) pos.push(Math.max(x0 + 12, cx - 22));
    for (const fx of pos) {
      if (!fx) continue;
      const fy = yMur + 11;
      P.rect(fx - 6, fy - 1, 12, 15, '#f4efe6');
      const allumee = r.chance(0.8);
      P.rect(fx - 5, fy, 10, 13, allumee ? '#ffcf72' : '#3a4a6a');
      if (allumee) { P.rect(fx - 4, fy + 1, 3, 3, '#fff0b8'); lumieres.push([fx, fy + 7, 26, 'win']); }
      P.vline(fx, fy, 13, '#f4efe6'); P.hline(fx - 5, fy + 6, 10, '#f4efe6');
      P.rect(fx - 9, fy, 3, 13, volet); P.rect(fx + 6, fy, 3, 13, volet); P.vline(fx - 8, fy + 1, 11, S(volet, -0.3)); P.vline(fx + 7, fy + 1, 11, S(volet, -0.3));
      P.rect(fx - 6, fy + 13, 12, 3, '#6a4428'); P.hline(fx - 6, fy + 12, 12, NEIGE); P.px(fx - 3, fy + 12, '#d8323a'); P.px(fx + 2, fy + 12, '#d8323a');
    }
    let fumee = null;
    if (style === 'long') {
      // pente du toit vue d'en haut, toute blanche de neige
      const yT = yMur - hToit;
      for (let j = 0; j < hToit; j++) {
        const inset = Math.round((hToit - j) * 0.22);
        P.rect(x0 - 5 + inset, yT + j, w + 10 - inset * 2, 1, j % 6 === 5 ? NEIGE2 : NEIGE);
        if (j > hToit * 0.55) P.dither(x0 - 5 + inset, yT + j, w + 10 - inset * 2, 1, NEIGE2, 4);
      }
      P.hline(x0 - 5 + Math.round(hToit * 0.22), yT, w + 10 - Math.round(hToit * 0.22) * 2, '#ffffff');
      P.rect(x0 - 6, yMur - 3, w + 12, 4, BOIS); P.hline(x0 - 6, yMur - 3, w + 12, BOIS2);
      bourrelet(P, x0 - 6, x1 + 6, yMur - 4);
      glacons(P, r, x0 - 4, x1 + 4, yMur + 1);
      // cheminée de pierre
      const chx = x0 + 8 + r.int(Math.max(1, w - 28));
      P.rect(chx, yT - 8, 9, 16, '#8a7a6a'); P.vline(chx, yT - 8, 16, '#a89a8a'); P.vline(chx + 8, yT - 8, 16, '#6a5a4a');
      P.rect(chx - 1, yT - 10, 11, 3, NEIGE); P.hline(chx - 1, yT - 11, 11, '#ffffff');
      fumee = [chx + 4, yT - 11];
    } else {
      // pignon en façade : triangle de planches, petite fenêtre ronde, rives enneigées
      const apex = yMur - hToit;
      for (let j = 0; j <= hToit; j++) {
        const half = Math.round((j / hToit) * (w / 2 + 1));
        P.rect(cx - half, apex + j, half * 2, 1, j % 4 === 3 ? murS : mur);
      }
      const gy = Math.round(yMur - hToit * 0.42);
      P.ellipse(cx, gy, 5, 5, '#f4efe6'); P.ellipse(cx, gy, 4, 4, '#ffcf72'); P.vline(cx, gy - 4, 9, '#f4efe6'); P.hline(cx - 4, gy, 9, '#f4efe6');
      lumieres.push([cx, gy, 18, 'win']);
      for (const s of [-1, 1]) {
        line(P, cx, apex - 2, cx + s * (w / 2 + 6), yMur + 1, BOIS, 4);
        line(P, cx, apex - 4, cx + s * (w / 2 + 6), yMur - 1, NEIGE, 3);
        line(P, cx, apex - 5, cx + s * (w / 2 + 6), yMur - 2, '#ffffff', 1);
      }
      // têtes de dragon sculptées au sommet
      line(P, cx - 1, apex - 3, cx - 7, apex - 10, BOIS2, 2); line(P, cx + 1, apex - 3, cx + 7, apex - 10, BOIS2, 2);
      P.px(cx - 8, apex - 11, NEIGE); P.px(cx + 8, apex - 11, NEIGE);
      glacons(P, r, x0 - 2, cx - 12, yMur + 1, 3); glacons(P, r, cx + 12, x1 + 2, yMur + 1, 3);
    }
    // congère au pied du mur
    for (let x = x0 - 4; x < x1 + 4; x++) { const h = 2 + Math.round(Math.abs(Math.sin(x * 0.3 + seed)) * 2); if (Math.abs(x - cx) < 8) continue; P.rect(x, base - h + 1, 1, h, NEIGE); P.px(x, base - h + 1, '#ffffff'); }
    return { img: c, ax: cx, ay: base, lumieres, porte: { dx: 0, w: pw }, fumee, largeur: W, mur: w };
  }

  // ------------------------------------------------------------ le château d'Arendelle
  // pierre claire, grands toits de cuivre vert, tours rondes, bannières violettes au crocus doré
  function chateau() {
    const r = PX.rng(55), W = 460, H = 270, base = H - 1, { c, P } = mk(W, H);
    const PIERRE = '#ded2b8', PIERRE2 = '#c4b698', PIERRE3 = '#a8987a', CU = '#4f9a7a', CU2 = '#2f6a52', CU3 = '#7ac8a0', OR = '#e8b54a';
    const lumieres = [];
    const mur = (x, y, w, h) => {
      P.rect(x, y, w, h, PIERRE);
      for (let yy = y + 5; yy < y + h; yy += 6) P.hline(x, yy, w, PIERRE2);
      for (let yy = y, row = 0; yy < y + h; yy += 6, row++) for (let xx = x + (row % 2 ? 4 : 0); xx < x + w; xx += 9) P.vline(xx, yy, 5, PIERRE2);
      P.vline(x, y, h, '#efe6d0'); P.vline(x + w - 1, y, h, PIERRE3);
    };
    const fenetre = (x, y, grand) => {
      const h = grand ? 16 : 11;
      P.rect(x - 3, y - 1, 7, h + 1, PIERRE3); P.ellipse(x, y, 3, 2, PIERRE3);
      const on = r.chance(0.7);
      P.rect(x - 2, y, 5, h - 1, on ? '#ffcf72' : '#3a4a6a'); P.ellipse(x, y, 2, 1, on ? '#ffcf72' : '#3a4a6a');
      P.vline(x, y - 1, h, PIERRE3);
      if (on) lumieres.push([x, y + h / 2, grand ? 26 : 20, 'win']);
      P.hline(x - 3, y + h, 7, NEIGE);
    };
    const toitCuivre = (cx, yHaut, yBas, demiHaut, demiBas, fleche) => {
      const h = yBas - yHaut;
      for (let j = 0; j <= h; j++) {
        const half = Math.round(demiHaut + ((demiBas - demiHaut) * j) / h);
        for (let x = -half; x <= half; x++) P.px(cx + x, yHaut + j, (x + 200) % 6 === 0 ? CU2 : x < -half * 0.4 ? CU3 : x > half * 0.5 ? CU2 : CU);
        if (j % 9 === 8) P.hline(cx - half, yHaut + j, half * 2, '#ffffff');
      }
      P.hline(cx - demiBas - 1, yBas, demiBas * 2 + 2, NEIGE); P.hline(cx - demiBas - 1, yBas + 1, demiBas * 2 + 2, NEIGE3);
      glacons(P, r, cx - demiBas, cx + demiBas, yBas + 2, 3);
      if (fleche) { P.vline(cx, yHaut - fleche, fleche, '#2a2632'); P.ellipse(cx, yHaut - fleche, 1, 1, OR); P.rect(cx + 1, yHaut - fleche + 2, 5, 3, '#6a3a8a'); P.px(cx + 3, yHaut - fleche + 3, OR); }
    };
    // ailes basses
    mur(54, 168, 116, base - 168); mur(290, 168, 116, base - 168);
    toitCuivre(112, 122, 168, 34, 64, 0); toitCuivre(348, 122, 168, 34, 64, 0);
    for (const x of [70, 92, 114, 136, 158, 302, 324, 346, 368, 390]) { fenetre(x, 182, false); fenetre(x, 216, true); }
    // tours rondes aux coins
    for (const tx of [34, 426]) {
      P.rect(tx - 22, 150, 44, base - 150, PIERRE);
      for (let x = -22; x < 22; x++) { const k = x / 22; if (k < -0.5) P.vline(tx + x, 150, base - 150, '#ece2ca'); else if (k > 0.45) P.vline(tx + x, 150, base - 150, PIERRE2); }
      for (let yy = 156; yy < base; yy += 6) P.hline(tx - 22, yy, 44, PIERRE2);
      toitCuivre(tx, 64, 150, 1, 26, 16);
      fenetre(tx, 170, true); fenetre(tx, 214, true);
    }
    // donjon central, grand toit et flèche
    mur(170, 130, 120, base - 130);
    toitCuivre(230, 34, 130, 3, 70, 26);
    for (const x of [186, 208, 252, 274]) { fenetre(x, 146, true); fenetre(x, 178, true); }
    fenetre(230, 146, true);
    // balcon et horloge
    P.rect(206, 170, 48, 4, PIERRE3); for (let x = 208; x < 254; x += 4) P.vline(x, 163, 7, PIERRE3); P.hline(206, 162, 48, NEIGE);
    // bannières au crocus
    for (const bx of [196, 264]) {
      P.rect(bx - 5, 136, 10, 26, '#6a3a8a'); P.hline(bx - 5, 136, 10, OR);
      P.ellipse(bx, 146, 2, 3, OR); P.px(bx, 141, '#7ac85a'); P.px(bx - 2, 150, '#7ac85a'); P.px(bx + 2, 150, '#7ac85a');
      for (let k = 0; k < 5; k++) P.px(bx - 4 + k * 2, 162, '#6a3a8a');
    }
    // les grandes portes du château
    P.rect(208, 196, 44, base - 196, PIERRE3); P.ellipse(230, 200, 22, 10, PIERRE3);
    P.rect(212, 202, 36, base - 202, '#5a3a24'); P.ellipse(230, 204, 18, 7, '#5a3a24');
    for (let x = 214; x < 248; x += 5) P.vline(x, 200, base - 200, '#4a2e1c');
    P.vline(230, 198, base - 198, '#2a1a10');
    for (const y of [214, 236, 256]) P.hline(212, y, 36, OR);
    P.ellipse(226, 232, 1, 1, OR); P.ellipse(234, 232, 1, 1, OR);
    P.rect(200, base - 3, 60, 4, '#9a8c74');
    // neige au pied des murs
    for (let x = 10; x < W - 10; x++) { if (x > 204 && x < 256) continue; const h = 2 + Math.round(Math.abs(Math.sin(x * 0.21)) * 3); P.rect(x, base - h + 1, 1, h, NEIGE); }
    return { img: c, ax: 230, ay: base, lumieres, portes: { x: 212, w: 36 } };
  }

  // mur d'enceinte (crénelé) et ses grandes portes de bois (dessinées à part : elles s'ouvrent)
  function muraille(w) {
    const { c, P } = mk(w, 40), base = 39;
    P.rect(0, 10, w, 30, '#c4b698');
    for (let y = 15; y < 40; y += 6) P.hline(0, y, w, '#a8987a');
    for (let y = 10, row = 0; y < 40; y += 6, row++) for (let x = row % 2 ? 4 : 0; x < w; x += 10) P.vline(x, y, 5, '#a8987a');
    for (let x = 0; x < w; x += 10) { P.rect(x, 2, 6, 8, '#c4b698'); P.hline(x, 1, 6, NEIGE); P.hline(x, 2, 6, '#ffffff'); }
    P.hline(0, 10, w, NEIGE);
    return { img: c, ax: 0, ay: base };
  }
  function portail() { // l'arche de pierre autour des portes (l'ouverture est transparente : on voit les portes et la cour)
    const { c, P } = mk(72, 64), base = 63;
    P.rect(0, 10, 72, 54, '#c4b698'); for (let y = 15; y < 64; y += 6) P.hline(0, y, 72, '#a8987a');
    P.ellipse(36, 20, 26, 12, '#a8987a');
    P.g.save(); P.g.globalCompositeOperation = 'destination-out';
    P.rect(12, 20, 48, 44, '#000'); P.ellipse(36, 20, 24, 10, '#000');
    P.g.restore();
    for (let x = 0; x < 72; x += 12) { P.rect(x, 0, 8, 10, '#c4b698'); P.hline(x, 0, 8, '#ffffff'); }
    P.rect(30, 4, 12, 9, '#6a3a8a'); P.ellipse(36, 8, 2, 3, '#e8b54a');
    return { img: c, ax: 36, ay: base };
  }

  // ------------------------------------------------------------ la fontaine gelée par Elsa
  function fontaineGelee() {
    const r = PX.rng(8), { c, P } = mk(60, 60), cx = 30, base = 58;
    P.ellipse(cx, base - 8, 28, 9, '#8a8498'); P.ellipse(cx, base - 9, 26, 7, '#a8a4b8'); P.ellipse(cx, base - 9, 23, 5, '#bfe4f8');
    P.ellipse(cx, base - 10, 18, 3, '#e4f4ff');
    // gerbes d'eau figées en pointes de glace
    const pointe = (x, y, h, l) => { for (let j = 0; j < h; j++) { const ww = Math.max(0, Math.round(l * (1 - j / h))); P.rect(x - ww, y - j, ww * 2 + 1, 1, j % 3 ? '#cfeaff' : '#a8d8f8'); if (ww) P.px(x - ww, y - j, '#ffffff'); } };
    pointe(cx, base - 12, 40, 5); pointe(cx - 10, base - 10, 22, 3); pointe(cx + 11, base - 10, 26, 3); pointe(cx - 18, base - 8, 12, 2); pointe(cx + 19, base - 8, 14, 2);
    for (let k = 0; k < 14; k++) P.px(cx - 18 + r.int(36), base - 12 - r.int(30), '#ffffff');
    P.hline(cx - 26, base - 16, 52, NEIGE);
    return { img: c, ax: cx, ay: base, lumieres: [[cx, base - 24, 40, 'neon']] };
  }

  // ------------------------------------------------------------ marché de Noël
  // type : 'chocolat', 'poisson', 'legumes', 'tricots', 'pains'
  function etal(type, c1, c2) {
    const { c, P } = mk(46, 46), base = 45;
    P.rect(4, 14, 3, 32, BOIS2); P.rect(39, 14, 3, 32, BOIS2);
    for (let x = 0; x < 46; x++) { const rayure = Math.floor(x / 5) % 2 ? c1 : c2; P.vline(x, 8, 7, rayure); P.px(x, 15 + (x % 5 === 2 ? 1 : 0), rayure); }
    P.rect(0, 4, 46, 5, NEIGE); P.hline(0, 3, 46, '#ffffff'); P.hline(0, 9, 46, NEIGE3);
    for (let x = 2; x < 44; x += 4) P.vline(x, 16, 1 + (x % 3), GLACE);
    P.rect(2, 30, 42, 15, '#8a5a32'); P.hline(2, 30, 42, '#a8743e'); for (let x = 6; x < 44; x += 8) P.vline(x, 31, 14, '#6a4428');
    P.rect(2, 27, 42, 4, '#a8743e'); P.hline(2, 27, 42, '#c89058');
    if (type === 'chocolat') { for (let k = 0; k < 6; k++) { const x = 6 + k * 6; P.rect(x, 22, 4, 5, '#f4efe6'); P.rect(x + 1, 22, 2, 1, '#6a3a24'); P.px(x + 4, 24, '#f4efe6'); } P.rect(30, 17, 9, 10, '#3a3646'); P.hline(30, 17, 9, '#5a5668'); }
    else if (type === 'poisson') for (let k = 0; k < 5; k++) { const x = 5 + k * 8; P.ellipse(x + 3, 24, 4, 2, '#c8d0dc'); P.px(x - 1, 24, '#a8b0bc'); P.px(x + 5, 23, '#1d1626'); }
    else if (type === 'legumes') for (let k = 0; k < 7; k++) { const x = 5 + k * 5; P.rect(x, 21, 2, 6, '#f08a24'); P.px(x, 20, '#4f8a3a'); P.px(x + 1, 19, '#6aa84a'); }
    else if (type === 'tricots') for (let k = 0; k < 4; k++) { const x = 6 + k * 9, col = ['#c8343a', '#3a6aa8', '#f2c230', '#4f8a5a'][k]; P.rect(x, 16, 6, 11, col); for (let y = 18; y < 27; y += 3) P.hline(x, y, 6, '#f4efe6'); }
    else for (let k = 0; k < 6; k++) { const x = 6 + k * 6; P.ellipse(x + 1, 24, 2, 3, '#b8743e'); P.px(x + 1, 22, '#f4efe6'); P.px(x, 25, '#f4efe6'); P.px(x + 2, 25, '#f4efe6'); }
    P.rect(20, 12, 6, 7, '#2a2632'); P.rect(21, 13, 4, 5, '#ffcf72');
    return { img: c, ax: 23, ay: base, lumieres: [[23, 16, 40, 'lamp']] };
  }

  // réverbère en fer forgé, lanterne coiffée de neige
  function lampadaire() {
    const { c, P } = mk(14, 50), base = 49;
    P.rect(5, 8, 3, 42, '#2a2632'); P.vline(5, 8, 42, '#4a4658'); P.rect(3, 46, 7, 4, '#2a2632');
    P.rect(2, 4, 9, 2, '#2a2632'); P.rect(3, 6, 7, 9, '#2a2632'); P.rect(4, 7, 5, 7, '#ffd27a'); P.px(4, 7, '#fff4c8');
    P.rect(2, 2, 9, 2, NEIGE); P.hline(3, 1, 7, '#ffffff'); P.hline(2, 15, 9, '#2a2632');
    P.rect(4, 26, 5, 2, '#2f6a3a'); P.px(6, 28, '#d8323a');
    return { img: c, ax: 6, ay: base, light: { dx: 0, dy: -39 } };
  }

  // ------------------------------------------------------------ l'écurie de Kristoff et Sven
  function ecurie() {
    const r = PX.rng(31), W = 150, H = 104, base = H - 1, { c, P } = mk(W, H);
    const R1 = '#9a2e2a', R2 = '#7a2220', R3 = '#b84a40', yMur = 48;
    P.rect(8, yMur, W - 16, base - yMur, R1);
    for (let x = 10; x < W - 8; x += 4) P.vline(x, yMur + 3, base - yMur - 3, R2);
    P.vline(8, yMur, base - yMur, R3);
    // grande porte ouverte : la paille à l'intérieur
    P.rect(52, 62, 46, base - 62, '#f4efe6'); P.rect(55, 65, 40, base - 65, '#2a1c14');
    P.rect(58, base - 14, 34, 14, '#c8a050'); for (let k = 0; k < 40; k++) P.px(58 + r.int(34), base - 14 + r.int(14), r.chance(0.5) ? '#e8c870' : '#a88038');
    for (const [x0, x1] of [[40, 54], [96, 110]]) { P.rect(x0, 64, x1 - x0, base - 64, R1); line(P, x0, 64, x1 - 1, base - 1, '#f4efe6'); line(P, x1 - 1, 64, x0, base - 1, '#f4efe6'); P.rect(x0, 64, x1 - x0, 1, '#f4efe6'); P.rect(x0, base - 1, x1 - x0, 1, '#f4efe6'); }
    // lucarne à foin et tête de renne sculptée
    P.rect(66, yMur + 2, 18, 10, '#f4efe6'); P.rect(68, yMur + 4, 14, 8, '#c8a050');
    P.ellipse(75, 56 - 14, 3, 3, '#8a5a32'); line(P, 72, 40, 68, 34, '#c8a878'); line(P, 78, 40, 82, 34, '#c8a878'); P.px(67, 33, '#c8a878'); P.px(83, 33, '#c8a878'); P.px(70, 35, '#c8a878'); P.px(80, 35, '#c8a878');
    // fenêtres
    for (const fx of [24, 126]) { P.rect(fx - 6, 66, 12, 12, '#f4efe6'); P.rect(fx - 5, 67, 10, 10, '#ffcf72'); P.vline(fx, 67, 10, '#f4efe6'); P.hline(fx - 5, 72, 10, '#f4efe6'); }
    // toit enneigé vu d'en haut
    for (let j = 0; j < 40; j++) { const inset = Math.round((40 - j) * 0.2); P.rect(2 + inset, 6 + j, W - 4 - inset * 2, 1, j % 6 === 5 ? NEIGE2 : NEIGE); }
    P.hline(10, 6, W - 20, '#ffffff');
    P.rect(1, yMur - 4, W - 2, 4, BOIS); bourrelet(P, 1, W - 1, yMur - 5); glacons(P, r, 3, W - 3, yMur, 4);
    for (let x = 4; x < W - 4; x++) { if (x > 50 && x < 100) continue; const h = 2 + Math.round(Math.abs(Math.sin(x * 0.4)) * 2); P.rect(x, base - h + 1, 1, h, NEIGE); }
    return { img: c, ax: 75, ay: base, lumieres: [[75, 84, 44, 'win'], [24, 72, 20, 'win'], [126, 72, 20, 'win']] };
  }
  function traineau() {
    const { c, P } = mk(58, 32), base = 31;
    for (let x = 4; x < 52; x++) P.px(x, base - 2, '#3a2632');
    for (let k = 0; k < 6; k++) P.px(52 + Math.round(Math.sin(k / 5 * 2) * 4), base - 3 - k, '#3a2632');
    for (const x of [12, 24, 36, 46]) P.vline(x, base - 8, 6, '#3a2632');
    P.rect(8, base - 18, 42, 10, '#8a5a32'); P.hline(8, base - 18, 42, '#b07a44'); for (let x = 12; x < 50; x += 6) P.vline(x, base - 17, 9, '#6a4428');
    P.rect(8, base - 26, 12, 9, '#8a5a32'); P.hline(8, base - 26, 12, '#b07a44'); P.rect(9, base - 25, 10, 2, '#c8343a');
    P.rect(44, base - 24, 8, 7, '#6a4428'); line(P, 50, base - 24, 56, base - 30, '#6a4428', 2);
    P.rect(20, base - 22, 20, 4, NEIGE);
    // le luth de Kristoff posé dessus
    P.ellipse(30, base - 24, 4, 3, '#c89058'); line(P, 33, base - 25, 40, base - 29, '#6a4428'); P.px(30, base - 24, '#3a2618');
    return { img: c, ax: 29, ay: base };
  }
  function blocsGlace() {
    const { c, P } = mk(40, 28), base = 27;
    const bloc = (x, y) => { P.rect(x, y, 12, 9, '#a8d8f0'); P.rect(x, y, 12, 3, '#d8f0ff'); P.hline(x, y, 12, '#ffffff'); P.vline(x + 11, y, 9, '#7ab0d0'); P.px(x + 3, y + 5, '#ffffff'); };
    bloc(2, 18); bloc(14, 18); bloc(26, 18); bloc(8, 9); bloc(20, 9); bloc(14, 0);
    return { img: c, ax: 20, ay: base };
  }

  // ------------------------------------------------------------ le comptoir d'Oaken (et son sauna)
  function comptoirOaken() {
    const r = PX.rng(47), W = 132, H = 108, base = H - 1, { c, P } = mk(W, H), yMur = 50;
    for (let y = yMur; y < base - 4; y += 5) { P.rect(8, y, W - 16, 5, '#8a5a32'); P.hline(8, y, W - 16, '#a8743e'); P.hline(8, y + 4, W - 16, '#5a3a22'); P.ellipse(8, y + 2, 2, 2, '#c89058'); P.ellipse(W - 9, y + 2, 2, 2, '#c89058'); }
    P.rect(8, base - 4, W - 16, 4, '#77738a');
    // porte et fenêtres
    P.rect(58, base - 26, 16, 26, '#f4efe6'); P.rect(60, base - 24, 12, 24, '#5a2e1c'); P.px(69, base - 12, '#e8b54a');
    for (const fx of [30, 102]) { P.rect(fx - 9, 68, 18, 14, '#f4efe6'); P.rect(fx - 8, 69, 16, 12, '#ffcf72'); P.vline(fx, 69, 12, '#f4efe6'); P.hline(fx - 8, 75, 16, '#f4efe6'); P.rect(fx - 9, 82, 18, 3, NEIGE); }
    // enseigne
    P.rect(28, 40, 76, 16, '#3a2618'); P.rect(29, 41, 74, 14, '#c89058'); P.hline(29, 41, 74, '#e0b070');
    const t1 = 'COMPTOIR D\'OAKEN'; texte(P, t1, 66 - Math.floor(largeurTexte(t1) / 2), 43, '#3a1e10');
    const t2 = 'ET SAUNA'; texte(P, t2, 66 - Math.floor(largeurTexte(t2) / 2), 49, '#8a2a2a');
    // toit enneigé et petite cheminée du sauna
    for (let j = 0; j < 36; j++) { const inset = Math.round((36 - j) * 0.18); P.rect(2 + inset, 4 + j, W - 4 - inset * 2, 1, j % 6 === 5 ? NEIGE2 : NEIGE); }
    P.rect(1, 40, W - 2, 3, BOIS); bourrelet(P, 1, W - 1, 39); glacons(P, r, 3, W - 3, 43, 4);
    P.rect(100, 0, 9, 12, '#7a6a5a'); P.rect(99, -1, 11, 3, NEIGE);
    // panneau « liquidation d'hiver »
    P.rect(108, 86, 18, 14, '#f4efe6'); P.rect(109, 87, 16, 12, '#d8323a'); P.rect(116, 99, 2, 8, '#6a4428'); texte(P, '-50', 110, 90, '#ffffff');
    return { img: c, ax: 66, ay: base, lumieres: [[30, 75, 26, 'win'], [102, 75, 26, 'win'], [66, base - 12, 22, 'win']], fumee: [104, 0] };
  }

  // ------------------------------------------------------------ au bord du lac
  function bateauGele(seed) {
    const r = PX.rng(seed), { c, P } = mk(104, 84), base = 83;
    // coque prise dans la glace, un peu penchée
    for (let x = 6; x < 98; x++) { const k = (x - 52) / 46, h = Math.round(16 * Math.sqrt(1 - k * k)) + 4; const y0 = base - 10 - Math.round(k * 3); P.vline(x, y0 - h, h, (x % 6 === 0) ? '#4a2e1c' : '#6a4428'); P.px(x, y0 - h, '#8a5a32'); P.px(x, y0 - h + 4, '#c8a050'); }
    P.rect(18, base - 34, 70, 4, '#8a5a32');
    P.vline(52, 4, base - 38, '#3a2618'); P.vline(53, 4, base - 38, '#5a3a22');
    P.rect(36, 14, 34, 22, '#e8e0cc'); for (let y = 16; y < 36; y += 4) P.hline(36, y, 34, '#c8c0aa'); P.rect(36, 12, 34, 3, NEIGE);
    line(P, 52, 4, 10, base - 32, '#3a2618'); line(P, 53, 4, 96, base - 34, '#3a2618');
    P.rect(16, base - 36, 74, 3, NEIGE); P.hline(16, base - 37, 74, '#ffffff');
    for (let x = 0; x < 104; x++) { const h = 3 + Math.round(Math.abs(Math.sin(x * 0.17 + seed)) * 4); P.rect(x, base - h, 1, h, (x + r.int(3)) % 4 ? '#cfe8ff' : '#ffffff'); }
    glacons(P, r, 10, 94, base - 30, 3);
    return { img: c, ax: 52, ay: base };
  }
  function puits() {
    const { c, P } = mk(32, 40), base = 39;
    P.ellipse(16, base - 6, 13, 6, '#8a8498'); P.ellipse(16, base - 8, 11, 4, '#a8a4b8'); P.ellipse(16, base - 8, 8, 2, '#1d1626');
    P.rect(4, 8, 3, base - 14, BOIS); P.rect(25, 8, 3, base - 14, BOIS); P.hline(6, 16, 20, '#6a4428');
    P.trap(14, 4, 0, 32, 0, 10, '#7a2a2a'); P.trap(14, 4, 0, 32, -2, 8, NEIGE);
    P.rect(14, 17, 5, 5, '#6a4428'); P.vline(16, 16, 2, '#3a2618');
    return { img: c, ax: 16, ay: base };
  }
  function tasNeige(w) {
    const h = Math.round(w * 0.45), { c, P } = mk(w, h + 2);
    P.ellipse(w / 2, h, w / 2 - 1, h - 1, NEIGE3); P.ellipse(w / 2 - 1, h - 1, w / 2 - 2, h - 2, NEIGE); P.ellipse(w / 2 - 3, h - 3, w / 4, h / 3, '#ffffff');
    return { img: c, ax: w >> 1, ay: h + 1 };
  }
  function bonhommeEnfants() {
    const { c, P } = mk(20, 26), base = 25;
    P.ellipse(10, base - 5, 7, 5, NEIGE3); P.ellipse(10, base - 6, 6, 4, NEIGE); P.ellipse(10, base - 14, 5, 4, NEIGE3); P.ellipse(10, base - 15, 4, 3, NEIGE);
    P.px(8, base - 16, '#1d1626'); P.px(11, base - 16, '#1d1626'); P.rect(10, base - 15, 3, 1, '#f08a24');
    line(P, 5, base - 9, 1, base - 13, '#6a4428'); line(P, 15, base - 9, 19, base - 13, '#6a4428');
    P.rect(7, base - 19, 7, 2, '#2a2632'); P.rect(8, base - 23, 5, 4, '#2a2632');
    return { img: c, ax: 10, ay: base };
  }
  function luge() {
    const { c, P } = mk(22, 12), base = 11;
    P.rect(2, 3, 16, 5, '#c8343a'); P.hline(2, 3, 16, '#e8604a'); P.hline(1, base - 1, 18, '#3a2632'); P.vline(19, base - 4, 3, '#3a2632'); P.px(20, base - 5, '#3a2632');
    P.vline(5, 8, 2, '#3a2632'); P.vline(15, 8, 2, '#3a2632');
    return { img: c, ax: 11, ay: base };
  }
  // un rocher moussu… qui est peut-être un troll endormi
  function rocher(seed, w = 18) {
    const r = PX.rng(seed), h = Math.round(w * 0.75), { c, P } = mk(w + 2, h + 4);
    P.ellipse(w / 2 + 1, h / 2 + 2, w / 2, h / 2, '#5a5a6a'); P.ellipse(w / 2, h / 2 + 1, w / 2 - 2, h / 2 - 2, '#7a7a8a'); P.ellipse(w / 2 - 2, h / 2 - 1, w / 4, h / 4, '#9a9aaa');
    for (let k = 0; k < w; k++) P.px(2 + r.int(w - 2), 2 + r.int(Math.max(1, h / 2)), r.pick(['#4e7a4a', '#6a9a5a', '#3a5a3a']));
    P.ellipse(w / 2, 2, w / 3, 1, NEIGE);
    return { img: c, ax: (w >> 1) + 1, ay: h + 3 };
  }
  // le transat d'Olaf, qui rêve de l'été
  function transat() {
    const { c, P } = mk(30, 22), base = 21;
    line(P, 4, base, 12, 6, '#8a5a32', 2); line(P, 24, base, 18, 10, '#8a5a32', 2);
    for (let k = 0; k < 14; k++) P.rect(6 + k, 7 + Math.round(k * 0.8), 10, 1, k % 3 === 0 ? '#ffffff' : '#3a8ad8');
    P.rect(9, 9, 6, 2, '#1d1626'); P.px(11, 10, '#3a3a5a'); P.hline(8, 9, 8, '#1d1626');
    P.rect(4, 2, 1, 6, '#c8a050'); P.trap(4, 1, 0, 9, -1, 4, '#f2c230'); P.rect(0, 2, 9, 1, NEIGE);
    return { img: c, ax: 15, ay: base };
  }
  // un petit panneau de bois
  function pancarte(mots, col = '#c89058') {
    const w = Math.max(...mots.map(largeurTexte)) + 8, h = mots.length * 7 + 5, { c, P } = mk(w, h + 12), base = h + 11;
    P.rect(Math.floor(w / 2) - 1, h, 3, 12, '#6a4428');
    P.rect(0, 0, w, h, '#3a2618'); P.rect(1, 1, w - 2, h - 2, col); P.hline(1, 1, w - 2, S(col, 0.2));
    mots.forEach((m, k) => texte(P, m, Math.floor((w - largeurTexte(m)) / 2), 3 + k * 7, '#3a1e10'));
    P.hline(0, 0, w, NEIGE); P.hline(1, -1 + 1, w - 2, '#ffffff');
    return { img: c, ax: Math.floor(w / 2), ay: base };
  }

  // ------------------------------------------------------------ l'arrêt de bus, à la sortie d'Arendelle
  function arretBus() {
    const { c, P } = mk(56, 56), base = 55;
    P.rect(4, 16, 2, 38, '#3a4a6a'); P.rect(36, 16, 2, 38, '#3a4a6a');
    P.rect(6, 18, 30, 26, 'rgba(180,220,255,0.35)'); P.hline(6, 30, 30, 'rgba(255,255,255,0.4)'); for (let k = 0; k < 4; k++) P.px(10 + k * 6, 22 + k, '#ffffff');
    P.rect(2, 12, 38, 5, '#2a3a5a'); P.rect(1, 9, 40, 3, NEIGE); P.hline(2, 8, 38, '#ffffff');
    P.rect(9, base - 12, 24, 3, '#6a7a9a'); P.rect(10, base - 9, 2, 8, '#3a4a6a'); P.rect(30, base - 9, 2, 8, '#3a4a6a');
    P.rect(46, 12, 2, 43, '#5a6a8a'); P.ellipse(47, 10, 7, 7, '#1d1626'); P.ellipse(47, 10, 6, 6, '#f2c230'); texte(P, 'BUS', 42, 8, '#1d3a8a');
    P.rect(42, 22, 10, 14, '#f4f4f8'); for (let y = 24; y < 35; y += 2) P.hline(43, y, 8, '#8a9ab8');
    texte(P, '4', 45, 38, '#ffffff'); P.rect(43, 37, 9, 7, '#1d3a8a'); texte(P, '4', 46, 38, '#ffffff');
    for (let x = 0; x < 56; x++) { const h = 1 + Math.round(Math.abs(Math.sin(x * 0.35)) * 2); P.rect(x, base - h + 1, 1, h, NEIGE); }
    return { img: c, ax: 22, ay: base, lumieres: [[21, 30, 30, 'neon']] };
  }

  // ------------------------------------------------------------ le fond : ciel d'aurore boréale, montagnes et palais de glace
  function fond(P, W, H, r) {
    P.vgrad(0, 0, W, H, '#0e1430', '#2a3a6a');
    for (let k = 0; k < 160; k++) P.px(r.int(W), r.int(Math.round(H * 0.6)), r.chance(0.2) ? '#ffffff' : '#a8b8e8');
    // aurore boréale : rubans verts et violets ondulés
    for (const [y0, col, amp, ph] of [[24, 'rgba(120,255,180,0.16)', 10, 0], [36, 'rgba(160,120,255,0.13)', 8, 2], [18, 'rgba(120,230,255,0.12)', 12, 4]]) {
      for (let x = 0; x < W; x++) { const y = y0 + Math.round(Math.sin(x / 90 + ph) * amp + Math.sin(x / 37) * 3); P.rect(x, y, 1, 10 + Math.round(Math.sin(x / 50) * 4), col); }
    }
    // montagnes en trois plans
    const chaine = (yBase, hMax, col, neige, pas, seed) => {
      const rr = PX.rng(seed);
      let x = -40;
      while (x < W + 40) {
        const larg = 60 + rr.int(90), haut = hMax * (0.55 + rr() * 0.45), sx = x + larg / 2;
        for (let j = 0; j < haut; j++) {
          const half = Math.round((j / haut) * larg * 0.6), y = Math.round(yBase - haut + j);
          P.rect(sx - half, y, half * 2, 1, col);
          if (j < haut * neige) { P.rect(sx - half, y, Math.round(half * 1.1), 1, '#e8eef8'); P.rect(sx + Math.round(half * 0.1), y, Math.round(half * 0.9), 1, '#b8c4dc'); }
        }
        x += larg * pas;
      }
    };
    chaine(H - 40, 110, '#3a4470', 0.35, 0.7, 3);
    chaine(H - 18, 80, '#2c3458', 0.3, 0.6, 7);
    chaine(H + 4, 56, '#222a48', 0.25, 0.55, 11);
  }
  // le palais de glace d'Elsa, perché dans la montagne (dessiné sur le fond)
  function palais(P, cx, base) {
    const C1 = '#a8e0ff', C2 = '#6ab8f0', C3 = '#e8f8ff';
    // l'escalier de glace qui monte
    for (let k = 0; k < 18; k++) P.rect(cx - 40 + k * 2, base + 18 - k, 8, 1, k % 2 ? C2 : C1);
    const fleche = (x, y, h, l) => { for (let j = 0; j < h; j++) { const ww = Math.max(0, Math.round(l * (j / h))); P.rect(x - ww, y + j, ww * 2 + 1, 1, j % 4 === 0 ? C3 : (x + j) % 3 ? C1 : C2); if (ww > 1) P.px(x + ww, y + j, C2); } };
    fleche(cx, base - 64, 64, 12); fleche(cx - 16, base - 44, 44, 8); fleche(cx + 17, base - 40, 40, 8); fleche(cx - 28, base - 26, 26, 5); fleche(cx + 29, base - 24, 24, 5);
    P.rect(cx - 30, base, 60, 4, C2);
    for (let k = 0; k < 6; k++) { P.px(cx - 6 + k * 2, base - 30 - k * 5, '#ffffff'); }
    P.ellipse(cx, base - 26, 3, 4, '#ffffff'); P.ellipse(cx, base - 26, 2, 3, C2); // le grand flocon au balcon
  }

  return {
    texte, largeurTexte, maison, chateau, muraille, portail, fontaineGelee, etal, lampadaire, ecurie, traineau, blocsGlace, comptoirOaken,
    bateauGele, puits, tasNeige, bonhommeEnfants, luge, rocher, transat, pancarte, arretBus, fond, palais, MURS, NEIGE, NEIGE2, NEIGE3, GLACE,
  };
})();
