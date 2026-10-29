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
    '-': ['...', '...', '###', '...', '...'], '!': ['.#.', '.#.', '.#.', '...', '.#.'], '.': ['...', '...', '...', '...', '.#.'],
    0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['###', '..#', '###', '#..', '###'], 3: ['###', '..#', '.##', '..#', '###'],
    4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '###', '..#', '###'], 6: ['###', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
    8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '###'],
  };
  function texte(P, mot, x, y, col) { [...mot].forEach((ch, k) => { const g = L[ch]; if (g) g.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') P.px(x + k * 4 + i, y + j, col); })); }); }
  const largeurTexte = (mot) => mot.length * 4 - 1;

  // stalactites sous un bord de toit
  function glacons(P, r, x0, x1, y, max = 4) { for (let x = x0; x < x1; x += 2 + r.int(3)) { const l = 1 + r.int(max); P.vline(x, y, l, GLACE); P.px(x, y + l - 1, '#ffffff'); } }
  // neige bosselée posée sur un rebord
  function bourrelet(P, x0, x1, y) { for (let x = x0; x < x1; x++) { P.px(x, y, NEIGE); if ((x * 7) % 5 < 2) P.px(x, y - 1, '#ffffff'); } P.hline(x0, y + 1, x1 - x0, NEIGE3); }

  // ------------------------------------------------------------ maison scandinave (comme les immeubles de la rue des chats : tout au pixel près)
  // o : w (largeur du mur), couleur, style ('pignon' : pignon sur rue / 'long' : long pan de toit avec lucarne),
  //     etages (1 à 3), boutique ('bageri', 'sjokolade', 'strikk', 'leker', 'kafe' ou rien), volets, porte, tuiles (toit de tuiles rouges)
  // renvoie aussi : lumieres (fenêtres, lanterne), ampoules (guirlande du toit), fumee (cheminée)
  const ENSEIGNES = {
    bageri: { nom: 'BAGERI', fond: '#7a3a24', icone: 'bretzel' }, sjokolade: { nom: 'SJOKOLADE', fond: '#4a2a1e', icone: 'tasse' },
    strikk: { nom: 'STRIKK', fond: '#2a4a6a', icone: 'moufle' }, leker: { nom: 'LEKER', fond: '#6a2a4a', icone: 'cheval' },
    kafe: { nom: 'KAFE', fond: '#2f5a3a', icone: 'tasse' },
    boulangerie: { nom: 'BOULANGERIE', fond: '#7a3a24', icone: 'bretzel' }, // (à Montaigu)
  };
  function icone(P, nom, x, y, col) {
    if (nom === 'bretzel') { P.ellipse(x + 2, y + 2, 2, 2, col); P.ellipse(x + 6, y + 2, 2, 2, col); P.px(x + 2, y + 2, '#3a2418'); P.px(x + 6, y + 2, '#3a2418'); P.rect(x + 3, y + 4, 3, 2, col); }
    else if (nom === 'tasse') { P.rect(x + 1, y + 2, 5, 4, col); P.px(x + 6, y + 3, col); P.px(x + 7, y + 4, col); P.px(x + 2, y, '#f4f8ff'); P.px(x + 4, y + 1, '#f4f8ff'); }
    else if (nom === 'moufle') { P.rect(x + 2, y + 1, 4, 5, col); P.px(x + 1, y + 2, col); P.px(x, y + 3, col); P.hline(x + 2, y + 6, 4, '#f4efe6'); }
    else { P.rect(x + 1, y + 2, 6, 2, col); P.px(x + 6, y + 1, col); P.px(x + 7, y + 1, col); P.vline(x + 2, y + 4, 2, col); P.vline(x + 5, y + 4, 2, col); P.hline(x, y + 6, 8, col); }
  }
  // fenêtre à petits bois : cadre blanc, carreaux éclairés (rideaux) ou sombres, volets, jardinière enneigée
  function fenetreN(P, r, x, y, w, h, o, lumieres, decal) {
    const BL = '#f4eee2', BLs = '#cfc4b0';
    P.rect(x - 1, y - 1, w + 2, h + 2, BL); P.vline(x + w, y, h + 1, BLs);
    if (o.arc) { P.rect(x, y - 2, w, 1, BL); P.rect(x + 1, y - 3, w - 2, 1, BL); }
    const lit = r.chance(o.allumee ?? 0.75);
    if (lit) {
      P.rect(x, y, w, h, '#eaa24c'); P.rect(x + 1, y + 1, w - 2, h - 2, '#ffd27a'); P.dither(x + 1, y + 2, w - 2, h - 4, '#fff1bb', 5);
      P.vline(x, y, h, '#f4e5c6'); P.vline(x + w - 1, y, h, '#f4e5c6'); P.hline(x, y, w, '#d6bd96');
      if (r.chance(0.3)) { P.rect(x + 2, y + h - 4, 2, 3, '#c8343a'); P.px(x + 2, y + h - 5, '#2f6a3a'); } // une bougie, une étoile…
      else if (r.chance(0.4)) { P.px(x + (w >> 1), y + 2, '#fff8d0'); P.px(x + (w >> 1) - 1, y + 3, '#fff8d0'); P.px(x + (w >> 1) + 1, y + 3, '#fff8d0'); P.px(x + (w >> 1), y + 4, '#fff8d0'); }
      lumieres.push([x + w / 2 + decal.x, y + h / 2 + decal.y, 22, 'win']);
    } else {
      P.rect(x, y, w, h, '#283050'); P.dither(x, y, w, h >> 1, '#34406a', 9); P.px(x + w - 2, y + 1, '#8aa0d0'); P.px(x + 1, y + h - 2, '#5a6a9a');
    }
    P.vline(x + (w >> 1), y, h, BL); P.hline(x, y + Math.round(h * 0.4), w, BL);
    if (o.volets) for (const vx of [x - 4, x + w + 1]) {
      P.rect(vx, y, 3, h, o.volets); P.vline(vx, y, h, S(o.volets, 0.25)); P.vline(vx + 2, y, h, S(o.volets, -0.3));
      for (let j = 2; j < h - 1; j += 3) P.px(vx + 1, y + j, S(o.volets, -0.3));
      P.px(vx + 1, y + 3, '#2a1e2e'); // le petit cœur découpé
    }
    // rebord + jardinière avec branches de sapin, baies rouges et neige, petits glaçons
    P.rect(x - 2, y + h + 1, w + 4, 2, BL); P.hline(x - 2, y + h + 2, w + 4, BLs);
    P.rect(x - 1, y + h + 3, w + 2, 3, '#6a4428'); P.hline(x - 1, y + h + 3, w + 2, '#8a5a32');
    for (let k = 0; k < w + 2; k++) { if (r.chance(0.6)) P.px(x - 1 + k, y + h + 2, r.pick(['#2f6a3a', '#3f7a45'])); if (r.chance(0.15)) P.px(x - 1 + k, y + h + 1, '#d8323a'); }
    P.hline(x - 1, y + h, w + 2, NEIGE); for (let k = 0; k < w; k += 3) P.px(x + k, y + h + 6, GLACE);
  }
  function maison(seed, o = {}) {
    const r = PX.rng(seed);
    const w = o.w || 72, style = o.style || (r.chance(0.5) ? 'pignon' : 'long'), etages = o.etages || 2;
    const mur = o.couleur || r.pick(MURS), murS = S(mur, -0.24), murC = S(mur, 0.16), murF = S(mur, -0.45);
    const BL = '#f4eee2', BLs = '#cfc4b0';
    const volets = o.volets === undefined ? r.pick(['#f4efe6', '#2a4a6a', '#3a6a3a', '#7a2a2a', '#e8c040', null]) : o.volets;
    const porteC = o.porte || r.pick(['#3a4a8a', '#7a2a2a', '#2f5a3a', '#5a3a2a', '#2a5a6a']);
    const toit = o.tuiles ? { a: '#9a4a36', b: '#7a3a2c', c: '#b8624a' } : { a: '#3e4660', b: '#2c3248', c: '#5a6480' };
    const hRdc = 32, hEt = 24, hFrise = 5, hMur = hRdc + (etages - 1) * hEt + hFrise;
    const hToit = style === 'long' ? 36 : Math.round(w * 0.5);
    const W = w + 14, H = hMur + hToit + 22, x0 = 7, x1 = 7 + w, base = H - 1, yMur = base - hMur, cx = Math.round(W / 2);
    const { c, P } = mk(W, H);
    const lumieres = [], ampoules = [], dec = { x: 0, y: 0 }; // tout est en coordonnées de l'image
    // --- le mur en planches à clin
    P.rect(x0, yMur, w, hMur, mur);
    for (let y = yMur + hFrise; y < base - 5; y += 3) { P.hline(x0, y, w, murC); P.hline(x0, y + 2, w, murS); }
    for (let k = 0; k < w / 6; k++) P.px(x0 + r.int(w), yMur + hFrise + r.int(hMur - hFrise - 6), murS);
    P.dither(x1 - 10, yMur, 10, hMur, murF, 3);
    P.rect(x0, yMur, 2, hMur, BL); P.rect(x1 - 2, yMur, 2, hMur, BL); P.vline(x1 - 1, yMur, hMur, BLs);
    // la frise peinte sous l'avant-toit (rosemaling : fleurs rouges et jaunes, feuilles vertes)
    P.rect(x0, yMur, w, hFrise, BL); P.hline(x0, yMur + hFrise - 1, w, BLs);
    for (let x = x0 + 4; x < x1 - 3; x += 8) { P.px(x, yMur + 2, '#d8323a'); P.px(x - 1, yMur + 2, '#f2c230'); P.px(x + 1, yMur + 2, '#f2c230'); P.px(x + 3, yMur + 1, '#3a8a4a'); P.px(x + 4, yMur + 2, '#3a8a4a'); P.px(x + 3, yMur + 3, '#3a8a4a'); }
    // --- étages
    const nf = Math.max(2, Math.floor((w - 8) / 22));
    const fx = (k) => x0 + Math.round(((k + 0.5) * w) / nf) - 5;
    for (let e = 1; e < etages; e++) {
      const y = yMur + hFrise + (etages - 1 - e) * hEt + 5;
      for (let k = 0; k < nf; k++) fenetreN(P, r, fx(k), y, 10, 13, { volets, arc: style === 'pignon' }, lumieres, dec);
      P.rect(x0, y + hEt - 6, w, 2, BL); P.hline(x0, y + hEt - 5, w, BLs); // le bandeau entre deux étages
    }
    // --- rez-de-chaussée : boutique ou porte d'entrée
    const yR = base - hRdc + 2, porteX = o.boutique ? x1 - 22 : cx - 6;
    if (o.boutique) {
      const E = ENSEIGNES[o.boutique];
      // grande vitrine éclairée et ses marchandises
      const vx = x0 + 6, vw = porteX - vx - 6, vy = yR + 9, vh = 16;
      P.rect(vx - 2, vy - 2, vw + 4, vh + 4, '#3a2a22'); P.rect(vx, vy, vw, vh, '#ffcf72'); P.dither(vx, vy, vw, vh, '#fff1bb', 4);
      for (let x = vx + 2; x < vx + vw - 3; x += 6) {
        const k = (x >> 2) % 3;
        if (E.icone === 'bretzel') { P.ellipse(x + 2, vy + vh - 4, 2, 2, '#b8743e'); P.px(x + 2, vy + vh - 4, '#ffcf72'); }
        else if (E.icone === 'tasse') { P.rect(x, vy + vh - 6, 4, 4, ['#6a3a24', '#f4efe6', '#c8343a'][k]); P.hline(x, vy + vh - 6, 4, '#f4efe6'); }
        else if (E.icone === 'moufle') { P.rect(x, vy + 3, 4, 8, ['#c8343a', '#3a6aa8', '#f2c230'][k]); for (let y = vy + 5; y < vy + 11; y += 3) P.hline(x, y, 4, '#f4efe6'); }
        else { P.rect(x, vy + vh - 7, 4, 5, ['#c8343a', '#3a6aa8', '#4f8a5a'][k]); P.px(x + 1, vy + vh - 8, '#f2c230'); }
      }
      P.rect(vx, vy + vh - 2, vw, 2, '#8a5a32'); P.vline(vx + (vw >> 1), vy, vh, '#3a2a22');
      lumieres.push([vx + vw / 2 + dec.x, vy + vh / 2 + dec.y, 34, 'shop']);
      // store rayé enneigé et enseigne
      for (let x = x0 + 3; x < x1 - 3; x++) { const col = Math.floor((x - x0) / 4) % 2 ? E.fond : BL; P.vline(x, yR + 2, 5, col); if ((x - x0) % 4 < 2) P.px(x, yR + 7, col); }
      P.hline(x0 + 3, yR + 1, w - 6, NEIGE); P.hline(x0 + 3, yR, w - 6, '#ffffff');
      const tw = largeurTexte(E.nom) + 6, tx = x0 + 6 + Math.max(0, ((porteX - x0 - 12) - tw) >> 1);
      P.rect(tx, yR - 9, tw, 8, E.fond); P.hline(tx, yR - 9, tw, S(E.fond, 0.25)); texte(P, E.nom, tx + 3, yR - 8, '#f6e6c0');
      // enseigne en potence
      P.hline(x1 - 2, yR - 6, 6, '#2a2632'); P.rect(x1 + 1, yR - 5, 5, 8, E.fond); icone(P, E.icone, x1 - 1, yR - 4, '#f2c230');
    } else {
      for (const k of [0, nf - 1]) if (Math.abs(fx(k) + 5 - cx) > 12) fenetreN(P, r, fx(k), yR + 6, 10, 13, { volets }, lumieres, dec);
    }
    // la porte : encadrement blanc, imposte, couronne de Noël, lanterne, marches enneigées, sapins en pot
    const pw = 12, ph = 22, py = base - ph - 2;
    P.rect(porteX - 2, py - 4, pw + 4, ph + 4, BL); P.vline(porteX + pw + 1, py - 4, ph + 4, BLs);
    P.rect(porteX, py - 2, pw, 2, '#ffcf72');
    P.rect(porteX, py, pw, ph, porteC);
    P.rect(porteX + 2, py + 2, 3, 7, S(porteC, -0.25)); P.rect(porteX + 7, py + 2, 3, 7, S(porteC, -0.25)); P.rect(porteX + 2, py + 12, 3, 7, S(porteC, -0.25)); P.rect(porteX + 7, py + 12, 3, 7, S(porteC, -0.25));
    P.px(porteX + 9, py + 11, '#e8b54a');
    P.ellipse(porteX + 6, py + 6, 4, 4, '#2f6a3a'); P.ellipse(porteX + 6, py + 6, 2, 2, porteC);
    for (const [dx, dy] of [[-3, -1], [3, 1], [0, 3], [-2, 3]]) P.px(porteX + 6 + dx, py + 6 + dy, '#d8323a');
    P.rect(porteX + 5, py + 10, 3, 2, '#d8323a');
    lumieres.push([porteX + pw / 2 + dec.x, py - 1 + dec.y, 16, 'win']);
    const lx = porteX + pw + 5;
    if (lx < x1 - 3) { P.rect(lx, py + 4, 3, 5, '#2a2632'); P.px(lx + 1, py + 5, '#ffd27a'); P.px(lx + 1, py + 6, '#ffd27a'); P.hline(lx - 1, py + 3, 5, NEIGE); lumieres.push([lx + 1 + dec.x, py + 6 + dec.y, 26, 'lamp']); }
    P.rect(porteX - 4, base - 2, pw + 8, 2, '#9a96aa'); P.rect(porteX - 2, base - 4, pw + 4, 2, '#aeaabe'); P.hline(porteX - 4, base - 2, pw + 8, NEIGE);
    if (!o.boutique || r.chance(0.5)) for (const sx of [porteX - 7, porteX + pw + 4]) {
      if (sx < x0 + 2 || sx > x1 - 5) continue;
      P.rect(sx, base - 4, 4, 4, '#8a4a32'); for (let j = 0; j < 7; j++) P.rect(sx + 2 - Math.floor(j / 2), base - 5 - 7 + j, Math.floor(j / 2) * 2 + 1, 1, j % 2 ? '#2f6a3a' : '#3f7a45');
      P.px(sx + 2, base - 12, NEIGE); P.px(sx + 1, base - 9, '#d8323a');
    }
    // soubassement de pierre et congère
    P.rect(x0, base - 5, w, 5, '#77738a'); for (let x = x0; x < x1; x += 6) P.vline(x + (x % 2), base - 5, 5, '#5a566a'); P.hline(x0, base - 5, w, '#9a96aa');
    for (let x = x0 - 4; x < x1 + 4; x++) { if (x > porteX - 5 && x < porteX + pw + 5) continue; const h = 2 + Math.round(Math.abs(Math.sin(x * 0.3 + seed)) * 2); P.rect(x, base - h + 1, 1, h, NEIGE); P.px(x, base - h + 1, '#ffffff'); }
    // --- le toit
    let fumee = null;
    if (style === 'long') {
      const yT = yMur - hToit;
      for (let j = 0; j < hToit; j++) {
        const inset = Math.round((hToit - j) * 0.18), xa = x0 - 6 + inset, wa = w + 12 - inset * 2;
        P.rect(xa, yT + j, wa, 1, NEIGE);
        if (j % 7 === 6) P.dither(xa, yT + j, wa, 1, NEIGE2, 8);
        if (j > hToit - 5) { P.rect(xa, yT + j, wa, 1, j % 2 ? toit.a : toit.b); for (let x = xa + (j % 2) * 2; x < xa + wa; x += 4) P.px(x, yT + j, toit.c); P.dither(xa, yT + j, wa, 1, NEIGE, 16 - (hToit - j) * 3); }
      }
      P.hline(x0 - 6 + Math.round(hToit * 0.18), yT, w + 12 - Math.round(hToit * 0.18) * 2, '#ffffff');
      // lucarne
      if (w >= 56) {
        const lcx = x0 + Math.round(w * (r.chance(0.5) ? 0.3 : 0.7)), ly = yT + 10;
        P.rect(lcx - 7, ly + 6, 14, 14, mur); P.rect(lcx - 7, ly + 6, 2, 14, BL); P.rect(lcx + 5, ly + 6, 2, 14, BL);
        for (let j = 0; j < 8; j++) P.rect(lcx - j - 1, ly + j - 2, j * 2 + 2, 1, j < 3 ? '#ffffff' : NEIGE);
        P.hline(lcx - 9, ly + 6, 18, NEIGE2);
        P.rect(lcx - 3, ly + 9, 6, 8, '#ffcf72'); P.vline(lcx, ly + 9, 8, BL); P.hline(lcx - 3, ly + 12, 6, BL); lumieres.push([lcx + dec.x, ly + 13 + dec.y, 18, 'win']);
      }
      // cheminée de pierre, chapeau de neige
      const chx = x0 + 6 + r.int(Math.max(1, w - 24));
      P.rect(chx, yT - 8, 9, 16, '#8a7a6a'); P.vline(chx, yT - 8, 16, '#a89a8a'); P.vline(chx + 8, yT - 8, 16, '#6a5a4a'); for (let y = yT - 5; y < yT + 8; y += 3) P.hline(chx + 1, y, 7, '#7a6a5a');
      P.rect(chx - 1, yT - 10, 11, 3, NEIGE); P.hline(chx - 1, yT - 11, 11, '#ffffff');
      fumee = [chx + 4, yT - 11];
      // avant-toit, gouttière, glaçons, guirlande lumineuse
      P.rect(x0 - 6, yMur - 3, w + 12, 3, BOIS); P.hline(x0 - 6, yMur - 3, w + 12, BOIS2); P.hline(x0 - 6, yMur - 1, w + 12, '#2a1e18');
      bourrelet(P, x0 - 6, x1 + 6, yMur - 4); glacons(P, r, x0 - 4, x1 + 4, yMur, 4);
      for (let x = x0 - 3; x < x1 + 3; x += 4) { const y = yMur + 1 + (((x - x0) >> 2) % 2); P.px(x, y, '#2a2632'); ampoules.push([x, y + 1]); }
    } else {
      // pignon sur rue : triangle en planches, œil-de-bœuf éclairé, rives épaisses enneigées, têtes de dragon
      const apex = yMur - hToit;
      for (let j = 0; j <= hToit; j++) {
        const half = Math.round((j / hToit) * (w / 2 + 1));
        P.rect(cx - half, apex + j, half * 2, 1, j % 3 === 2 ? murS : mur);
      }
      for (let j = 4; j < hToit; j += 3) { const half = Math.round((j / hToit) * (w / 2 + 1)); P.vline(cx, apex + j, 2, murS); P.px(cx - half + 2, apex + j, murS); }
      const gy = Math.round(yMur - hToit * 0.42);
      P.ellipse(cx, gy, 6, 6, BL); P.ellipse(cx, gy, 5, 5, '#ffcf72'); P.dither(cx - 4, gy - 4, 9, 9, '#fff1bb', 4); P.vline(cx, gy - 5, 11, BL); P.hline(cx - 5, gy, 11, BL);
      lumieres.push([cx + dec.x, gy + dec.y, 20, 'win']);
      for (const sgn of [-1, 1]) {
        const xb = cx + sgn * (w / 2 + 7);
        line(P, cx, apex - 3, xb, yMur + 2, toit.b, 7);
        line(P, cx, apex - 4, xb, yMur + 1, toit.a, 5);
        line(P, cx, apex - 6, xb, yMur - 1, NEIGE, 4);
        line(P, cx, apex - 7, xb, yMur - 2, '#ffffff', 1);
        line(P, cx, apex + 1, xb, yMur + 4, BL, 1); // planche de rive blanche
        // guirlande lumineuse sous la rive
        const n = Math.round(Math.hypot(xb - cx, yMur - apex) / 5);
        for (let k = 1; k < n; k++) { const t = k / n, bx = Math.round(cx + (xb - cx) * t), by = Math.round(apex + 2 + (yMur + 5 - apex - 2) * t); P.px(bx, by, '#2a2632'); ampoules.push([bx, by + 1]); }
      }
      // têtes de dragon sculptées au sommet
      line(P, cx - 1, apex - 4, cx - 8, apex - 12, BOIS2, 2); line(P, cx + 1, apex - 4, cx + 8, apex - 12, BOIS2, 2);
      P.px(cx - 9, apex - 13, BOIS2); P.px(cx + 9, apex - 13, BOIS2); P.px(cx - 8, apex - 14, NEIGE); P.px(cx + 8, apex - 14, NEIGE);
      glacons(P, r, x0 - 2, cx - 14, yMur + 3, 3); glacons(P, r, cx + 14, x1 + 2, yMur + 3, 3);
      if (r.chance(0.6)) { const chx = cx + (r.chance(0.5) ? -1 : 1) * Math.round(w * 0.22) - 4; const chy = apex + Math.round(hToit * 0.35); P.rect(chx, chy - 12, 8, 14, '#8a7a6a'); P.vline(chx, chy - 12, 14, '#a89a8a'); P.rect(chx - 1, chy - 14, 10, 3, NEIGE); fumee = [chx + 4, chy - 15]; }
    }
    return { img: c, ax: cx, ay: base, lumieres, ampoules, porte: { dx: porteX + pw / 2 - cx, w: pw }, fumee, largeur: W, mur: w };
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
    // une couronne de sapin à nœud rouge sur le poteau
    P.ellipse(6, 27, 4, 4, '#1e4a2a'); P.ellipse(6, 27, 3, 3, '#2f6a3a'); P.ellipse(6, 27, 1, 1, '#2a2632'); P.px(4, 25, '#4f8a4a'); P.px(8, 29, '#4f8a4a');
    P.rect(5, 30, 3, 2, '#d8323a'); P.px(4, 32, '#d8323a'); P.px(8, 32, '#d8323a'); P.px(3, 27, '#f2c230'); P.px(9, 26, '#f2c230');
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
  // un tas de neige déblayée, en trois bosses bien dessinées ; les gros ont une pelle rouge plantée dedans
  function tasNeige(w) {
    const h = Math.round(w * 0.5), H = h + 14, { c, P } = mk(w + 2, H), b = H - 3, cx = w / 2 + 1;
    P.ellipse(cx, b + 1, w / 2, 2, '#8a96b8');
    const bosses = [[-w * 0.24, h * 0.34, w * 0.26], [w * 0.22, h * 0.4, w * 0.28], [0, h * 0.62, w * 0.3]];
    for (const [dx, hy, rx] of bosses) P.ellipse(cx + dx, b - hy + 1, rx + 1, hy + 1, '#7a88aa');
    for (const [dx, hy, rx] of bosses) P.ellipse(cx + dx, b - hy + 1, rx, hy, NEIGE3);
    for (const [dx, hy, rx] of bosses) P.ellipse(cx + dx - 1, b - hy, rx - 1, hy - 1, NEIGE);
    for (const [dx, hy, rx] of bosses) P.ellipse(cx + dx - rx / 3, b - hy * 1.4, rx / 3, hy / 3, '#ffffff');
    if (w >= 30) {
      line(P, cx + 5, b - h * 0.55, cx + 11, b - h - 10, '#8a5a32'); P.rect(cx + 10, b - h - 12, 3, 2, '#5a3a22');
      P.rect(cx + 3, b - h * 0.55 - 1, 5, 4, '#c8343a'); P.hline(cx + 3, b - h * 0.55 - 1, 5, '#e85a5a');
    }
    return { img: c, ax: cx | 0, ay: b };
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

  // ------------------------------------------------------------ petit mobilier des rues
  function banc() {
    const { c, P } = mk(30, 18), base = 17;
    P.rect(2, 4, 26, 3, '#6a4428'); P.hline(2, 4, 26, '#8a5a32'); P.rect(2, 9, 26, 3, '#7a4a2a'); P.hline(2, 9, 26, '#9a6a3a');
    for (const x of [4, 24]) { P.rect(x, 7, 2, 10, '#2a2632'); P.px(x, 16, '#4a4658'); }
    P.rect(1, 2, 28, 2, NEIGE); P.hline(2, 1, 26, '#ffffff'); P.rect(2, 8, 26, 1, NEIGE);
    return { img: c, ax: 15, ay: base };
  }
  function buches() {
    const { c, P } = mk(28, 18), base = 17;
    for (let row = 0; row < 3; row++) for (let k = 0; k < 6 - row; k++) {
      const x = 2 + k * 4 + row * 2, y = 12 - row * 4;
      P.ellipse(x + 1, y + 1, 2, 2, '#6a4428'); P.ellipse(x + 1, y + 1, 1, 1, '#c89058'); P.px(x + 1, y + 1, '#8a5a32');
    }
    P.rect(2, 15, 24, 2, '#4a3020');
    for (let x = 3; x < 26; x++) P.px(x, 3 + Math.round(Math.abs(Math.sin(x)) * 2) + (x > 14 ? 2 : 0), NEIGE);
    return { img: c, ax: 14, ay: base };
  }
  function tonneaux() {
    const { c, P } = mk(26, 16), base = 15;
    for (const x of [1, 13]) { P.rect(x, 2, 11, 13, '#8a5a34'); P.ellipse(x + 5, 2, 5, 1, '#b07a48'); P.hline(x, 5, 11, '#3a3646'); P.hline(x, 11, 11, '#3a3646'); P.vline(x, 2, 13, '#b07a48'); P.ellipse(x + 5, 1, 5, 1, NEIGE); }
    return { img: c, ax: 13, ay: base };
  }
  // mât à bannière violette au crocus doré (les armoiries d'Arendelle)
  function banniere() {
    const { c, P } = mk(16, 60), base = 59;
    P.rect(2, 2, 2, 58, '#4a4658'); P.vline(2, 2, 58, '#7a7690'); P.ellipse(3, 1, 2, 1, '#e8b54a');
    P.rect(4, 6, 11, 24, '#6a3a8a'); P.vline(4, 6, 24, '#8a5aaa'); P.hline(4, 6, 11, '#e8b54a');
    for (let k = 0; k < 5; k++) P.px(5 + k * 2, 30, '#6a3a8a');
    P.ellipse(9, 16, 2, 4, '#e8b54a'); P.px(9, 11, '#7ac85a'); P.px(7, 21, '#7ac85a'); P.px(11, 21, '#7ac85a'); P.px(8, 14, '#fff0a0');
    P.rect(0, 56, 6, 4, '#77738a');
    return { img: c, ax: 3, ay: base };
  }
  function boiteLettres() {
    const { c, P } = mk(10, 18), base = 17;
    P.rect(4, 8, 2, 10, '#2a2632'); P.rect(1, 1, 8, 8, '#c8343a'); P.hline(1, 1, 8, '#e85a50'); P.rect(2, 4, 6, 1, '#2a2632'); P.rect(1, 0, 8, 1, NEIGE);
    return { img: c, ax: 5, ay: base };
  }
  // statue du roi fondateur, sur la place (manteau de neige sur les épaules)
  function statue() {
    const { c, P } = mk(28, 50), base = 49;
    P.rect(2, 36, 24, 14, '#8a8498'); P.hline(2, 36, 24, '#a8a4b8'); P.rect(0, 46, 28, 4, '#77738a'); P.rect(6, 40, 16, 4, '#6a6478');
    P.rect(10, 14, 8, 22, '#7a8a8a'); P.rect(8, 18, 12, 14, '#6a7a7a'); P.ellipse(14, 10, 4, 4, '#7a8a8a'); P.rect(11, 5, 6, 2, '#e8b54a'); P.px(12, 4, '#e8b54a'); P.px(15, 4, '#e8b54a');
    Objets.line(P, 19, 18, 23, 8, '#6a7a7a', 2); P.ellipse(24, 7, 1, 1, '#e8b54a');
    P.hline(8, 17, 12, NEIGE); P.hline(10, 6, 8, NEIGE); P.hline(2, 35, 24, NEIGE); P.hline(1, 45, 26, NEIGE);
    return { img: c, ax: 14, ay: base };
  }

  // palissade blanche à chapeaux de neige
  function palissade(w) {
    const { c, P } = mk(w, 16), base = 15;
    P.rect(0, 6, w, 2, '#d8d4cc'); P.rect(0, 11, w, 2, '#d8d4cc');
    for (let x = 0; x < w; x += 4) { P.rect(x, 2, 3, 13, '#f4f0e8'); P.vline(x + 2, 3, 12, '#c8c0b4'); P.px(x + 1, 1, '#f4f0e8'); P.rect(x, 0, 3, 2, NEIGE); }
    return { img: c, ax: 0, ay: base };
  }
  // l'arche « GOD JUL » (joyeux Noël) au-dessus de la grand-rue : poteaux et linteau (dessinés à part)
  function arche(w) {
    const poteau = mk(8, 60), Pp = poteau.P;
    Pp.rect(2, 0, 4, 60, '#6a4428'); Pp.vline(2, 0, 60, '#8a5a32'); Pp.rect(0, 56, 8, 4, '#4a3020');
    for (let y = 4; y < 54; y += 6) { Pp.px(1, y, '#2f6a3a'); Pp.px(6, y + 3, '#2f6a3a'); Pp.px(1, y + 1, '#d8323a'); }
    const haut = mk(w, 26), P = haut.P;
    P.rect(0, 8, w, 12, '#6a4428'); P.hline(0, 8, w, '#8a5a32'); P.hline(0, 19, w, '#3a2618');
    P.rect(0, 5, w, 4, NEIGE); P.hline(0, 4, w, '#ffffff'); glacons(P, PX.rng(3), 2, w - 2, 20, 3);
    const t = 'GOD JUL'; texte(P, t, Math.floor((w - largeurTexte(t)) / 2), 11, '#f2c230');
    P.trap(w / 2 - 6, 12, w / 2 - 4, 8, -1, 6, '#6a4428'); P.ellipse(w / 2, 1, 2, 2, '#f2c230');
    const ampoules = [];
    for (let x = 2; x < w - 2; x += 4) { const y = 21 + Math.round(Math.sin((x / w) * Math.PI) * 3); P.px(x, y, '#2a2632'); ampoules.push([x, y + 1]); }
    return { poteau: { img: poteau.c, ax: 4, ay: 59 }, haut: haut.c, ampoules };
  }
  // ponton de bois sur le fjord gelé (posé au sol) et bitte d'amarrage
  function bitte() {
    const { c, P } = mk(8, 10), base = 9;
    P.rect(1, 2, 6, 8, '#3a3646'); P.rect(2, 2, 4, 8, '#5a5668'); P.ellipse(4, 2, 3, 1, '#7a7690'); P.ellipse(4, 1, 3, 1, NEIGE);
    return { img: c, ax: 4, ay: base };
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

  // des paillettes sur les objets à trouver : quelques petits éclats (blanc, doré, bleu glacé) qui s'allument et
  // s'éteignent un peu partout autour de l'objet, sans halo ; « n » éclats dans une ellipse rx × ry.
  // Les objets les demandent en se dessinant ; la carte les dessine ensuite par-dessus l'éclairage du soir
  // (sinon la nuit les éteint), avec C.apresLumiere = (g, J) => Arendelle.dessinerPaillettes(g, J)
  const COULEURS_PAILLETTES = ['#ffffff', '#ffe27a', '#bfeaff'];
  function paillettes(J, x, y, graine, n = 4, rx = 5, ry = 4) {
    const liste = J.carte.paillettes || (J.carte.paillettes = []);
    if (liste.length < 64) liste.push([x, y, graine, n, rx, ry]);
  }
  function dessinerPaillettes(g, J) {
    const t = J.t || 0, liste = J.carte.paillettes || [];
    for (const [x, y, graine, n, rx, ry] of liste) for (let k = 0; k < n; k++) {
      const periode = 0.9 + ((graine * 7 + k * 13) % 5) * 0.16, ph = t / periode + k / n + graine * 0.37;
      const cycle = Math.floor(ph), p = ph - cycle;
      if (p > 0.45) continue; // chaque éclat reste éteint un moment
      const h = Math.abs(Math.sin((cycle + 1) * 12.9898 + k * 78.233 + graine * 3.7) * 43758.5453), u = h % 1, v = (h * 7.13) % 1;
      const px = Math.round(x + (u * 2 - 1) * rx), py = Math.round(y + (v * 2 - 1) * ry);
      g.fillStyle = COULEURS_PAILLETTES[(cycle + k) % 3];
      g.fillRect(px, py, 1, 1);
      if (p > 0.12 && p < 0.3) { g.globalAlpha = 0.55; g.fillRect(px - 1, py, 3, 1); g.fillRect(px, py - 1, 1, 3); g.globalAlpha = 1; }
    }
    liste.length = 0;
  }

  return {
    texte, largeurTexte, maison, chateau, muraille, portail, fontaineGelee, etal, lampadaire, ecurie, traineau, blocsGlace, comptoirOaken,
    bateauGele, puits, tasNeige, bonhommeEnfants, luge, rocher, transat, pancarte, arretBus, fond, palais, MURS, NEIGE, NEIGE2, NEIGE3, GLACE,
    banc, buches, tonneaux, banniere, boiteLettres, statue, glacons, bourrelet, palissade, arche, bitte, paillettes, dessinerPaillettes,
  };
})();
