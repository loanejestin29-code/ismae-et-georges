// =====================================================================
//  decor-grenier.js — ZONE 6 : le grenier de l'antiquaire (épreuve 6)
//  Les meubles et le bric-à-brac entassés (armoire, malle, cartons, cheval à bascule, draps…),
//  les cinq objets-souvenirs, leur verso, et les symboles de la langue inconnue.
// =====================================================================
'use strict';

const Grenier = (() => {
  const mk = (w, h) => { const c = PX.canvas(w, h); return { c, P: PX.painter(c) }; };
  // (ax, ay) : le point au sol, au milieu du bas de l'image (le contour ajoute un pixel tout autour)
  const fini = (c, base, ax = Math.floor(c.width / 2)) => ({ img: PX.outline(c, '#1d1626'), ax: ax + 1, ay: base + 1 });
  const BOIS = { n: '#2e1e14', d: '#4a3020', m: '#6a4428', c: '#83573a', l: '#a06c44', h: '#bc8a58' };
  const OR = '#e8b54a', OR2 = '#fff1a0', OR3 = '#a8742e';
  const LIVRES = ['#8a2a2a', '#2a4a7a', '#3a6a3a', '#c8a050', '#6a3a6a', '#a8582a', '#2a2a3a', '#d8c8a0', '#4a6a8a'];
  const POUSSIERE = '#c8b8a0';
  // un peu de poussière sur les bords du haut d'un meuble
  const poussiere = (P, x, y, w, r) => { for (let i = 0; i < w; i++) if (r() < 0.45) P.px(x + i, y, POUSSIERE); };

  // ------------------------------------------------------------ les grands meubles, contre le mur du fond
  function armoire() {
    const { c, P } = mk(44, 68), r = PX.rng(11);
    P.rect(0, 5, 44, 58, BOIS.m);
    P.rect(0, 0, 44, 6, BOIS.c); P.hline(0, 0, 44, BOIS.h); P.hline(0, 5, 44, BOIS.d); poussiere(P, 0, 0, 44, r);
    for (const x of [2, 23]) { // les deux portes, à panneaux moulurés
      P.rect(x, 8, 19, 50, BOIS.c); P.vline(x, 8, 50, BOIS.l); P.vline(x + 18, 8, 50, BOIS.d);
      for (const [y, h] of [[11, 20], [35, 20]]) { P.rect(x + 3, y, 13, h, BOIS.m); P.hline(x + 3, y, 13, BOIS.d); P.vline(x + 3, y, h, BOIS.d); P.hline(x + 3, y + h - 1, 13, BOIS.l); P.vline(x + 15, y, h, BOIS.l); }
    }
    P.rect(20, 29, 1, 5, OR); P.rect(23, 29, 1, 5, OR); P.px(21, 33, '#1d1626'); P.px(22, 33, '#1d1626');
    P.rect(0, 58, 44, 6, BOIS.d); P.hline(0, 58, 44, BOIS.c); P.rect(19, 60, 6, 2, '#c89a40');
    P.rect(1, 64, 4, 4, BOIS.d); P.rect(39, 64, 4, 4, BOIS.d);
    return fini(c, 67);
  }
  function bibliotheque() {
    const { c, P } = mk(50, 62), r = PX.rng(61);
    P.rect(0, 0, 50, 62, BOIS.d); P.rect(2, 2, 46, 56, '#24160e');
    for (const y of [2, 20, 38]) { // trois étagères pleines de vieux livres
      let x = 3;
      while (x < 46) {
        if (r.chance(0.1) && x < 38) { const col = r.pick(LIVRES); P.rect(x, y + 13, 8, 3, col); P.hline(x, y + 13, 8, PX.shade(col, 0.25)); x += 9; continue; } // un livre couché
        const w = 2 + r.int(3), h = 10 + r.int(6); if (x + w > 47) break;
        const col = r.pick(LIVRES); P.rect(x, y + 16 - h, w, h, col); P.vline(x, y + 16 - h, h, PX.shade(col, 0.25));
        if (h > 12 && r.chance(0.6)) P.hline(x, y + 19 - h, w, OR);
        x += w + (r.chance(0.15) ? 1 : 0);
      }
      P.rect(0, y + 16, 50, 2, BOIS.c); P.hline(0, y + 16, 50, BOIS.l);
    }
    P.rect(0, 0, 50, 2, BOIS.c); P.hline(0, 0, 50, BOIS.h); poussiere(P, 0, 0, 50, r);
    P.rect(2, 56, 46, 4, BOIS.m); P.rect(0, 60, 4, 2, BOIS.d); P.rect(46, 60, 4, 2, BOIS.d);
    return fini(c, 61);
  }
  function horloge() { // une horloge comtoise, arrêtée à minuit
    const { c, P } = mk(22, 66);
    P.rect(4, 20, 14, 42, BOIS.c); P.vline(4, 20, 42, BOIS.l); P.vline(17, 20, 42, BOIS.d);
    P.rect(7, 28, 8, 24, '#24160e'); P.vline(11, 28, 15, '#c8a040'); P.ellipse(11, 45, 3, 3, OR); P.px(10, 44, OR2);
    P.ellipse(11, 11, 10, 11, BOIS.c); P.ellipse(11, 11, 9, 10, BOIS.l); P.ellipse(11, 11, 7, 7, '#f4ecd8'); P.ellipse(11, 11, 6, 6, '#fbf6e8');
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; P.px(Math.round(11 + Math.sin(a) * 5), Math.round(11 - Math.cos(a) * 5), '#3a2a2a'); }
    P.vline(11, 6, 5, '#1d1626'); P.vline(12, 7, 4, '#1d1626'); P.px(11, 11, OR3);
    P.rect(9, 0, 4, 2, OR); P.rect(2, 60, 18, 6, BOIS.d); P.hline(2, 60, 18, BOIS.c);
    return fini(c, 65);
  }
  function sapinVieux() { // un vieux sapin en plastique, trois boules et beaucoup de poussière
    const { c, P } = mk(30, 46), r = PX.rng(23);
    for (let k = 0; k < 4; k++) {
      const y = 3 + k * 8, hw = 4 + k * 3;
      P.trap(14, 2, 15 - hw, hw * 2, y, 10, '#4a6a4a');
      P.hline(15 - hw, y + 9, hw * 2, '#34503a');
      for (let i = 0; i < hw * 2; i += 2) if (r.chance(0.5)) P.px(15 - hw + i, y + 8 + (i % 4 ? 0 : 1), '#3e5c42');
      for (let i = 0; i < hw * 2; i++) if (r.chance(0.3)) P.px(15 - hw + i, y + 9, POUSSIERE);
    }
    for (let x = 6; x < 25; x++) P.px(x, Math.round(24 + Math.sin(x * 0.7) * 1.5 + (x - 6) * 0.4), x % 2 ? '#c8ccd8' : '#8a90a0'); // la guirlande, de travers
    P.ellipse(10, 18, 2, 2, '#c8343a'); P.px(9, 17, '#ff9aa8'); P.ellipse(20, 29, 2, 2, '#3a6ad8'); P.px(19, 28, '#9ac8ff'); P.ellipse(12, 33, 2, 2, OR); P.px(11, 32, OR2);
    P.px(15, 1, OR); P.px(14, 2, OR); P.px(16, 2, OR); P.px(15, 0, OR2);
    P.rect(13, 37, 4, 3, BOIS.m); P.trap(9, 12, 8, 14, 39, 7, '#8a2a2a'); P.hline(8, 39, 14, '#b84040');
    return fini(c, 45);
  }
  function bureau() { // le bureau sous la fenêtre : lampe de banquier, papiers, encrier
    const { c, P } = mk(58, 40);
    P.rect(0, 14, 58, 6, BOIS.c); P.hline(0, 14, 58, BOIS.h); P.hline(0, 19, 58, BOIS.d);
    for (const x of [2, 40]) { P.rect(x, 20, 16, 16, BOIS.m); for (const y of [22, 29]) { P.rect(x + 2, y, 12, 5, BOIS.c); P.hline(x + 2, y + 4, 12, BOIS.d); P.px(x + 8, y + 2, OR); } }
    P.rect(18, 20, 22, 5, BOIS.d); P.rect(26, 21, 6, 2, BOIS.c);
    P.rect(2, 36, 4, 4, BOIS.d); P.rect(52, 36, 4, 4, BOIS.d);
    P.rect(8, 9, 2, 5, '#c8a040'); P.rect(6, 13, 6, 1, OR3); P.ellipse(9, 7, 6, 3, '#2a6a4a'); P.hline(4, 6, 10, '#4a9a6a'); P.hline(3, 9, 12, '#1a4a3a');
    P.rect(22, 11, 13, 3, '#f4ecd8'); P.rect(24, 10, 11, 2, '#e8dcc0'); P.hline(25, 12, 7, '#a89880');
    P.rect(44, 10, 5, 4, '#2a2a3a'); P.px(45, 10, '#5a5a7a'); for (let k = 0; k < 6; k++) P.px(48 + Math.floor(k / 2), 9 - k, '#f4f2ec');
    return Object.assign(fini(c, 39), { lampe: [9, 8] });
  }
  function tableaux() { // des tableaux de famille, posés contre le mur
    const { c, P } = mk(44, 40);
    const cadre = (x, y, w, h, f) => { P.rect(x, y, w, h, OR3); P.rect(x + 1, y + 1, w - 2, h - 2, OR); P.rect(x + 2, y + 2, w - 4, h - 4, OR3); f(x + 3, y + 3, w - 6, h - 6); };
    cadre(0, 6, 24, 30, (x, y, w, h) => { // un monsieur moustachu, l'air sévère
      P.rect(x, y, w, h, '#3a3428'); P.ellipse(x + w / 2, y + h - 3, 7, 6, '#2a2a3a'); P.ellipse(x + w / 2, y + 9, 5, 6, '#e0b090');
      P.hline(x + w / 2 - 3, y + 11, 7, '#3a2418'); P.px(x + w / 2 - 2, y + 8, '#1d1626'); P.px(x + w / 2 + 2, y + 8, '#1d1626'); P.rect(x + w / 2 - 4, y + 2, 9, 3, '#3a2418');
    });
    cadre(20, 0, 24, 18, (x, y, w, h) => { P.rect(x, y, w, h, '#8ab0d8'); P.rect(x, y + h - 5, w, 5, '#4a7a4a'); P.trap(x + 7, 1, x + 2, 12, y + 3, h - 7, '#f4f8ff'); }); // une montagne
    cadre(24, 20, 18, 18, (x, y, w, h) => { P.rect(x, y, w, h, '#2a2440'); P.ellipse(x + 6, y + 4, 2, 2, '#f4ecd0'); for (let k = 0; k < 6; k++) P.px(x + 2 + k * 2, y + 8 + (k % 3), '#ffd27a'); });
    return fini(c, 39);
  }
  function miroir() {
    const { c, P } = mk(24, 58);
    P.ellipse(12, 20, 11, 19, OR3); P.ellipse(12, 20, 10, 18, OR); P.ellipse(12, 20, 8, 16, '#7a92a8'); P.ellipse(11, 19, 6, 14, '#9ab4c8');
    for (let k = 0; k < 10; k++) P.px(7 + Math.floor(k / 2), 10 + k, '#d8e8f4'); // le reflet
    P.rect(11, 39, 2, 14, BOIS.m); P.rect(4, 53, 16, 2, BOIS.d); P.rect(4, 55, 2, 3, BOIS.d); P.rect(18, 55, 2, 3, BOIS.d);
    return fini(c, 57);
  }
  function chaises() { // deux chaises empilées, l'une à l'envers sur l'autre
    const { c, P } = mk(26, 52);
    P.rect(4, 30, 3, 22, BOIS.d); P.rect(19, 36, 3, 16, BOIS.d); P.rect(4, 14, 3, 18, BOIS.m); P.rect(6, 16, 2, 14, BOIS.l);
    P.rect(2, 32, 22, 4, '#8a2a2a'); P.hline(2, 32, 22, '#b84040'); P.rect(4, 36, 18, 2, BOIS.d);
    for (const y of [17, 23]) P.rect(4, y, 18, 2, BOIS.c);
    P.rect(2, 10, 22, 4, '#8a2a2a'); P.hline(2, 13, 22, '#5a1a1a'); // la deuxième, à l'envers
    for (const x of [3, 20]) P.rect(x, 0, 3, 10, BOIS.m);
    return fini(c, 51);
  }
  function luge() { // une vieille luge en bois et une paire de skis, contre le mur
    const { c, P } = mk(36, 48);
    for (const x of [24, 30]) { P.rect(x, 0, 3, 48, '#c8343a'); P.vline(x, 0, 48, '#e86a5a'); P.rect(x, 0, 3, 3, '#f4f2ec'); P.rect(x, 22, 3, 3, '#2a2a3a'); }
    P.rect(2, 18, 20, 4, BOIS.l); P.hline(2, 18, 20, BOIS.h); for (const x of [4, 10, 16]) P.rect(x, 22, 3, 18, BOIS.c);
    P.rect(1, 40, 22, 2, '#8a90a0'); P.ellipse(1, 37, 2, 4, '#8a90a0'); P.rect(1, 22, 2, 18, BOIS.m); P.rect(19, 22, 2, 18, BOIS.m);
    P.hline(2, 30, 20, '#c8a060');
    return fini(c, 47);
  }
  // des meubles sous des draps blancs (le coin sombre)
  function drap(w, h, seed) {
    const { c, P } = mk(w, h), r = PX.rng(seed);
    const bosses = [[w * 0.3, h * 0.35, w * 0.28, h * 0.32], [w * 0.68, h * 0.25, w * 0.3, h * 0.25], [w * 0.5, h * 0.62, w * 0.48, h * 0.38]];
    for (const [x, y, rx, ry] of bosses) P.ellipse(x, y, rx, ry, '#c8c2b8');
    for (const [x, y, rx, ry] of bosses) P.ellipse(x - 1, y - 1, rx - 1, ry - 1, '#e4e0d8');
    P.rect(1, Math.round(h * 0.6), w - 2, Math.round(h * 0.4) - 1, '#e4e0d8');
    for (let k = 0; k < 5; k++) { const x = 3 + Math.round((w - 6) * (k + 0.5) / 5); P.vline(x, Math.round(h * 0.5) + r.int(4), Math.round(h * 0.45), '#c8c2b8'); } // les plis
    for (let x = 1; x < w - 1; x += 2) P.px(x, h - 2 - (x % 4 ? 0 : 1), '#b8b2a8');
    for (let k = 0; k < w / 3; k++) P.px(2 + r.int(w - 4), 2 + r.int(h - 6), POUSSIERE);
    return fini(c, h - 1);
  }

  // ------------------------------------------------------------ les meubles et bibelots au milieu de la pièce
  function malle() { // une grosse malle bombée : cuir, lattes de bois, coins de laiton, serrure
    const { c, P } = mk(40, 32), r = PX.rng(31);
    P.rect(0, 12, 40, 20, '#6a3a2a'); P.ellipse(20, 12, 20, 8, '#7a4a32'); P.rect(0, 12, 40, 3, '#7a4a32');
    P.ellipse(20, 11, 18, 6, '#8a5a3a'); poussiere(P, 4, 4, 32, r);
    for (const x of [8, 30]) { P.rect(x, 4, 3, 28, BOIS.l); P.vline(x, 4, 28, BOIS.h); }
    P.rect(0, 15, 40, 2, BOIS.c); P.hline(0, 15, 40, BOIS.h);
    for (const [x, y] of [[0, 28], [36, 28], [0, 12], [36, 12]]) { P.rect(x, y, 4, 4, '#8a90a0'); P.px(x + 1, y + 1, '#c8ccd8'); }
    P.rect(17, 14, 6, 7, OR); P.rect(18, 15, 4, 2, OR2); P.px(20, 18, '#1d1626'); P.px(20, 19, '#1d1626');
    return fini(c, 31);
  }
  function chevalBascule() {
    const { c, P } = mk(38, 32);
    for (let x = 0; x < 38; x++) { const y = Math.round(27 + ((x - 19) / 19) ** 2 * -5 + 2); P.rect(x, y, 1, 3, BOIS.m); P.px(x, y, BOIS.l); } // les patins
    for (const x of [9, 26]) { P.rect(x, 17, 3, 11, BOIS.c); }
    P.ellipse(19, 15, 11, 5, '#f4f2ec'); for (const [x, y] of [[13, 14], [18, 16], [24, 13], [21, 17]]) P.ellipse(x, y, 1, 1, '#a8a8b8'); // la robe pommelée
    P.rect(16, 10, 8, 4, '#c8343a'); P.hline(16, 10, 8, '#e86a5a'); // la selle
    P.rect(27, 4, 6, 10, '#f4f2ec'); P.rect(30, 2, 7, 6, '#f4f2ec'); P.px(35, 4, '#1d1626'); P.px(36, 7, '#c8a0a0'); // la tête
    for (let k = 0; k < 7; k++) P.px(27 - (k % 2), 2 + k, '#7a5a3a'); P.rect(27, 1, 3, 2, '#7a5a3a'); // la crinière
    for (let k = 0; k < 6; k++) P.px(7 - Math.floor(k / 2), 13 + k, '#7a5a3a'); // la queue
    P.hline(30, 8, 6, '#c8343a'); P.px(31, 9, OR);
    return fini(c, 31);
  }
  function globe() {
    const { c, P } = mk(18, 32);
    P.ellipse(9, 9, 8, 8, '#3a6aa8'); P.ellipse(8, 8, 6, 6, '#4a7ab8');
    for (const [x, y, w] of [[5, 5, 4], [6, 6, 3], [11, 9, 4], [10, 10, 5], [12, 11, 3], [4, 12, 3]]) P.hline(x, y, w, '#c8a868');
    P.px(6, 4, '#9ac8ff'); P.px(5, 5, '#9ac8ff');
    for (let a = 0; a < 20; a++) { const t = a / 20 * Math.PI * 1.3 - 0.4; P.px(Math.round(9 + Math.cos(t) * 9), Math.round(9 - Math.sin(t) * 9), OR3); }
    P.rect(8, 17, 2, 10, BOIS.m); P.rect(4, 27, 10, 2, BOIS.c); P.rect(3, 29, 2, 3, BOIS.d); P.rect(13, 29, 2, 3, BOIS.d);
    return fini(c, 31);
  }
  function cage() { // une cage à oiseau dorée, vide, sur son pied
    const { c, P } = mk(18, 46);
    P.ellipse(9, 6, 8, 6, OR3);
    for (let x = 2; x <= 16; x += 2) P.vline(x, 5, 15, OR); P.hline(1, 20, 17, OR3); P.hline(2, 5, 15, OR);
    for (let k = 0; k < 6; k++) { P.px(9 - 3 + k, 1 + Math.abs(2.5 - k) * 0.8, OR); }
    P.px(9, 0, OR2); P.hline(5, 14, 9, BOIS.c); // le perchoir
    P.rect(8, 21, 2, 20, BOIS.m); P.rect(3, 41, 12, 2, BOIS.d); P.rect(3, 43, 2, 3, BOIS.d); P.rect(13, 43, 2, 3, BOIS.d);
    return fini(c, 45);
  }
  function mannequin() { // un mannequin de couturière, un gilet à épingles
    const { c, P } = mk(20, 48);
    P.ellipse(10, 9, 8, 6, '#d8c0a0'); P.rect(3, 9, 14, 14, '#d8c0a0'); P.ellipse(10, 22, 7, 4, '#d8c0a0'); P.ellipse(9, 8, 5, 3, '#ecd8bc');
    P.rect(4, 11, 12, 10, '#4a5a7a'); P.vline(10, 11, 10, '#2a3a5a'); for (const y of [13, 16, 19]) P.px(11, y, OR); // le gilet
    for (let x = 3; x < 17; x++) P.px(x, 10 + (x % 3 === 0 ? 1 : 0), '#f2c230'); P.vline(15, 10, 9, '#f2c230'); // le mètre ruban
    for (const [x, y] of [[6, 5], [8, 4], [13, 6]]) { P.px(x, y, '#c8ccd8'); P.px(x, y - 1, '#e8435a'); } // les épingles
    P.rect(9, 0, 2, 3, BOIS.m); P.rect(9, 25, 2, 16, BOIS.d); P.rect(3, 41, 14, 2, BOIS.c); for (const x of [3, 9, 15]) P.rect(x, 43, 2, 5, BOIS.d);
    return fini(c, 47);
  }
  function valises() { // des valises empilées, couvertes d'étiquettes de voyage
    const { c, P } = mk(38, 40);
    const valise = (x, y, w, h, col, cuir) => { P.rect(x, y, w, h, col); P.hline(x, y, w, PX.shade(col, 0.2)); P.hline(x, y + h - 1, w, PX.shade(col, -0.25)); for (const sx of [x + 3, x + w - 5]) P.rect(sx, y, 2, h, cuir); P.rect(x + w / 2 - 3, y - 2, 6, 2, cuir); };
    valise(0, 26, 38, 14, '#6a4a3a', '#3a2418'); valise(3, 14, 32, 12, '#3a5a7a', '#c8a060'); valise(7, 4, 24, 10, '#8a2a2a', '#3a2418');
    for (const [x, y, col] of [[10, 29, '#f2c230'], [24, 31, '#f4f2ec'], [12, 17, '#e86a5a'], [22, 19, '#f4ecd8'], [14, 6, '#9ac8e8']]) { P.rect(x, y, 6, 4, col); P.hline(x + 1, y + 2, 4, '#5a4a3a'); }
    return fini(c, 39);
  }
  function chapeaux() { // des boîtes à chapeaux rondes, empilées
    const { c, P } = mk(32, 36);
    const boite = (x, y, rx, h, a, b, ruban) => {
      P.rect(x - rx, y - h, rx * 2 + 1, h, a); for (let i = -rx; i <= rx; i += 4) P.vline(x + i, y - h, h, b);
      P.ellipse(x, y, rx, 3, a); P.ellipse(x, y - h, rx, 3, PX.shade(a, 0.2)); P.ellipse(x, y - h - 1, rx + 1, 3, PX.shade(a, 0.1)); P.ellipse(x, y - h - 2, rx - 1, 2, PX.shade(a, 0.3));
      P.vline(x, y - h - 2, h + 4, ruban); P.px(x - 1, y - h - 3, ruban); P.px(x + 1, y - h - 3, ruban);
    };
    boite(16, 33, 14, 12, '#e8b8c8', '#d898b0', '#c8343a'); boite(15, 18, 11, 9, '#a8c8e8', '#88a8d0', '#f4f2ec'); boite(17, 6, 7, 4, '#f4ecd8', '#e0d4b8', '#3a6aa8');
    return fini(c, 35);
  }
  function cartons(seed, etages = 2, mot) { // une pile de cartons, scotch, étiquettes
    const r = PX.rng(seed), W = 40, H = 14 + etages * 13, { c, P } = mk(W, H);
    let y = H - 1, w = W - r.int(6);
    for (let e = 0; e < etages; e++) {
      const x = Math.floor((W - w) / 2) + r.int(3) - 1, hb = 12 + r.int(3), col = r.pick(['#c89a5a', '#b88a4e', '#d0a462']);
      P.rect(x, y - hb, w, hb, col); P.rect(x, y - hb, w, 4, PX.shade(col, 0.18)); P.hline(x, y - hb + 4, w, PX.shade(col, -0.2)); P.vline(x + w - 1, y - hb, hb, PX.shade(col, -0.15));
      P.rect(x + Math.floor(w / 2) - 2, y - hb, 4, hb, '#e8d8a8'); // le scotch
      if (r.chance(0.6)) { P.rect(x + 3, y - hb + 6, 10, 4, '#f4ecd8'); P.hline(x + 4, y - hb + 8, 7, '#7a6a5a'); }
      if (r.chance(0.4)) { const tx = x + w - 4 - r.int(8); P.vline(tx, y - hb + 1, 3, PX.shade(col, -0.3)); }
      poussiere(P, x, y - hb, w, r);
      y -= hb; w = Math.max(18, w - 4 - r.int(8));
    }
    if (mot) { const lx = 4, ly = H - 9; P.rect(lx - 1, ly - 1, Arendelle.largeurTexte(mot) + 2, 7, '#f4ecd8'); Arendelle.texte(P, mot, lx, ly, '#8a2a2a'); }
    return fini(c, H - 1);
  }
  function gramophone() {
    const { c, P } = mk(28, 40);
    P.rect(4, 26, 20, 12, BOIS.c); P.hline(4, 26, 20, BOIS.h); P.rect(6, 29, 16, 6, BOIS.m); P.px(25, 30, '#c8ccd8'); P.rect(24, 30, 3, 1, '#c8ccd8'); P.rect(26, 31, 1, 3, BOIS.d);
    P.ellipse(14, 26, 9, 2, '#1d1626'); P.ellipse(14, 26, 3, 1, '#c8343a'); // le disque
    P.rect(16, 16, 2, 10, OR3); // le bras
    for (let k = 0; k < 9; k++) { const rr = 2 + k * 1.3; P.ellipse(18 + k * 0.6, 14 - k * 1.2, rr * 0.7, rr, k % 2 ? OR : '#f2c860'); } // le pavillon en fleur
    P.ellipse(24, 4, 6, 4, '#2a2018'); P.ellipse(24, 4, 5, 3, '#4a3420');
    P.rect(4, 38, 3, 2, BOIS.d); P.rect(21, 38, 3, 2, BOIS.d);
    return fini(c, 39);
  }
  function berceau() { // un berceau en osier ; un ours en peluche dort dedans
    const { c, P } = mk(36, 30);
    P.ellipse(18, 14, 17, 9, '#a8803a'); P.ellipse(18, 13, 15, 7, '#c8a060'); P.ellipse(18, 12, 13, 5, '#5a4030');
    for (let x = 4; x < 32; x += 3) for (let y = 15; y < 22; y += 2) P.px(x + (y % 4 ? 1 : 0), y, '#987030');
    P.ellipse(13, 10, 4, 4, '#a8783a'); P.px(10, 7, '#a8783a'); P.px(16, 7, '#a8783a'); P.px(12, 10, '#1d1626'); P.px(14, 10, '#1d1626'); P.px(13, 12, '#3a2418'); // l'ours
    P.rect(16, 10, 14, 4, '#f4ecd8'); P.hline(16, 10, 14, '#ffffff'); // la couverture
    P.trap(2, 32, 4, 28, 22, 4, '#8a6030'); for (const x of [2, 32]) { P.rect(x, 4, 2, 10, '#a8803a'); }
    P.ellipse(4, 3, 3, 2, '#a8803a'); // le haut du berceau, côté tête
    return fini(c, 29);
  }
  function cartonNoel() { // un carton ouvert : guirlandes emmêlées, boules de Noël
    const { c, P } = mk(38, 30), r = PX.rng(77);
    P.rect(2, 10, 34, 20, '#c89a5a'); P.hline(2, 10, 34, '#d8b070'); P.vline(35, 10, 20, '#a87a42');
    P.trap(0, 8, 2, 8, 4, 7, '#d0a462'); P.trap(30, 8, 28, 8, 4, 7, '#d0a462'); // les rabats
    for (let k = 0; k < 40; k++) P.px(4 + r.int(30), 6 + r.int(7), r.pick(['#2a6a3a', '#3a8a4a', '#c8ccd8', '#e8b54a']));
    for (const [x, y, col] of [[9, 8, '#c8343a'], [18, 6, '#3a6ad8'], [26, 9, OR], [14, 11, '#8a3aa8']]) { P.ellipse(x, y, 3, 3, col); P.px(x - 1, y - 1, '#ffffff'); P.rect(x - 1, y - 4, 2, 1, '#c8ccd8'); }
    for (let x = 30; x < 38; x++) P.px(x, 22 + Math.round(Math.sin(x) * 1.5), x % 2 ? '#e8b54a' : '#c8343a'); // une guirlande qui pend
    P.rect(5, 17, 18, 7, '#f4ecd8'); Arendelle.texte(P, 'NOEL', 7, 18, '#c8343a');
    return fini(c, 29);
  }
  function pileLivres(seed) {
    const { c, P } = mk(22, 26), r = PX.rng(seed);
    let y = 25;
    for (let k = 0; k < 6; k++) { const h = 3 + r.int(2), w = 14 + r.int(6), x = Math.floor((22 - w) / 2) + r.int(3) - 1, col = r.pick(LIVRES); P.rect(x, y - h, w, h, col); P.hline(x, y - h, w, PX.shade(col, 0.25)); P.vline(x + w - 1, y - h + 1, h - 1, '#f4ecd8'); y -= h; if (y < 4) break; }
    return fini(c, 25);
  }
  function tapisRoule() { // un tapis roulé, couché par terre
    const { c, P } = mk(54, 14);
    P.rect(5, 2, 44, 10, '#7a2a2a'); for (let x = 7; x < 48; x += 6) { P.vline(x, 2, 10, '#c8a050'); P.vline(x + 3, 3, 8, '#2a3a6a'); } P.hline(5, 2, 44, '#9a3a3a'); P.hline(5, 11, 44, '#5a1a1a');
    P.ellipse(5, 7, 5, 6, '#9a3a3a'); P.ellipse(5, 7, 4, 5, '#c8a050'); P.ellipse(5, 7, 3, 3, '#7a2a2a'); P.ellipse(5, 7, 1, 1, '#c8a050');
    for (let k = 0; k < 6; k++) P.px(49 + (k % 2), 3 + k, '#e8d8a8'); // les franges
    return fini(c, 13);
  }
  function couture() { // la machine à coudre noire et dorée sur sa petite table, une boîte à couture
    const { c, P } = mk(34, 38);
    P.rect(2, 20, 30, 4, BOIS.c); P.hline(2, 20, 30, BOIS.h); P.rect(4, 24, 2, 14, BOIS.d); P.rect(28, 24, 2, 14, BOIS.d); P.rect(4, 32, 26, 2, BOIS.m);
    P.rect(6, 14, 18, 6, '#1d1a22'); P.rect(6, 6, 6, 9, '#1d1a22'); P.rect(6, 4, 18, 4, '#1d1a22'); P.rect(21, 8, 3, 6, '#1d1a22'); P.vline(22, 14, 3, '#c8ccd8');
    P.hline(7, 5, 14, OR); P.hline(8, 15, 10, OR); P.px(9, 10, OR); P.px(10, 9, OR); P.ellipse(6, 9, 2, 3, '#3a3a46'); // les décors dorés, le volant
    P.rect(25, 15, 7, 5, '#e8b8c8'); P.hline(25, 15, 7, '#f4d8e0'); for (const [x, col] of [[26, '#c8343a'], [28, '#3a6ad8'], [30, '#f2c230']]) { P.rect(x, 13, 2, 2, col); }
    return fini(c, 37);
  }
  function coffreJouets() { // le coffre à jouets, couvercle ouvert : un tambour, un soldat de bois, des cubes
    const { c, P } = mk(34, 32);
    P.rect(1, 6, 32, 6, BOIS.c); P.hline(1, 6, 32, BOIS.h); // le couvercle, relevé
    P.rect(0, 16, 34, 16, BOIS.m); P.hline(0, 16, 34, BOIS.l); for (const x of [6, 16, 26]) P.vline(x, 18, 12, BOIS.d);
    P.rect(4, 11, 8, 6, '#c8343a'); P.hline(4, 11, 8, '#f4f2ec'); P.hline(4, 16, 8, '#f4f2ec'); for (let k = 0; k < 4; k++) P.px(5 + k * 2, 13 + (k % 2), OR); // le tambour
    P.rect(15, 6, 3, 10, '#3a5aa8'); P.rect(15, 3, 3, 3, '#f0c8a8'); P.rect(14, 1, 5, 3, '#1d1a22'); P.px(16, 9, OR); // le soldat
    P.rect(21, 12, 4, 4, '#f2c230'); P.rect(25, 13, 4, 3, '#3a8a4a'); P.px(22, 13, '#1d1626'); P.px(26, 14, '#ffffff');
    P.rect(14, 22, 6, 4, OR); P.px(16, 23, '#1d1626');
    return fini(c, 31);
  }
  function maisonPoupee() {
    const { c, P } = mk(30, 36);
    P.trap(14, 2, 0, 30, 0, 10, '#8a2a2a'); P.hline(0, 9, 30, '#5a1a1a');
    P.rect(2, 10, 26, 26, '#f4ecd8'); P.vline(15, 10, 26, '#c8b898'); P.hline(2, 22, 26, '#c8b898');
    for (const [x, y] of [[4, 12], [17, 12], [4, 24], [17, 24]]) { P.rect(x, y, 9, 8, '#e8d0a8'); P.rect(x + 1, y + 5, 7, 3, '#a8582a'); }
    P.rect(7, 26, 3, 6, '#3a6aa8'); P.rect(20, 14, 4, 3, '#3a8a4a'); P.rect(6, 14, 3, 5, '#c8343a');
    return fini(c, 35);
  }
  function lampePied() { // un lampadaire à abat-jour à franges
    const { c, P } = mk(16, 54);
    P.trap(5, 6, 1, 14, 0, 10, '#c88a6a'); P.hline(1, 9, 14, '#a86a4a'); for (let x = 1; x < 15; x += 2) P.vline(x, 10, 2, OR);
    P.rect(7, 12, 2, 38, OR3); P.vline(7, 12, 38, OR); P.ellipse(8, 51, 5, 2, OR3);
    return Object.assign(fini(c, 52), { lampe: [8, 8] });
  }
  function tabouret() { const { c, P } = mk(14, 16); P.ellipse(7, 3, 6, 2, BOIS.l); P.hline(1, 3, 13, BOIS.c); for (const x of [2, 6, 11]) P.rect(x, 4, 2, 12, BOIS.m); P.hline(2, 11, 11, BOIS.d); return fini(c, 15); }
  function parapluies() {
    const { c, P } = mk(14, 34);
    P.rect(2, 20, 10, 14, '#4a5a6a'); P.hline(2, 20, 10, '#6a7a8a'); for (const x of [3, 6, 9]) P.vline(x, 22, 10, '#3a4a5a');
    for (const [x, col] of [[4, '#c8343a'], [8, '#2a2a3a'], [10, '#3a7a5a']]) { P.vline(x, 4 + (x % 3), 17, col); P.px(x - 1, 3 + (x % 3), col); P.px(x - 2, 4 + (x % 3), col); }
    P.vline(6, 2, 18, BOIS.c); P.px(5, 1, BOIS.c); P.px(4, 2, BOIS.c);
    return fini(c, 33);
  }
  function vase() { const { c, P } = mk(12, 18); P.ellipse(6, 11, 5, 6, '#3a6aa8'); P.rect(4, 2, 4, 6, '#3a6aa8'); P.hline(3, 2, 6, '#5a8ac8'); for (const y of [9, 13]) P.hline(2, y, 9, '#f4f2ec'); P.px(4, 10, '#9ac8ff'); return fini(c, 17); }
  function commode() { // une commode à trois tiroirs ; dessus, un bougeoir et un bol
    const { c, P } = mk(40, 34), r = PX.rng(91);
    P.rect(0, 8, 40, 4, BOIS.c); P.hline(0, 8, 40, BOIS.h); poussiere(P, 0, 8, 40, r);
    P.rect(1, 12, 38, 19, BOIS.m);
    for (const y of [13, 19, 25]) { P.rect(3, y, 34, 5, BOIS.c); P.hline(3, y + 4, 34, BOIS.d); for (const x of [10, 29]) { P.px(x, y + 2, OR); P.px(x + 1, y + 2, OR3); } }
    P.rect(2, 31, 4, 3, BOIS.d); P.rect(34, 31, 4, 3, BOIS.d);
    P.rect(7, 3, 2, 5, '#f6f2e6'); P.ellipse(8, 8, 3, 1, OR3); P.px(8, 2, '#ffd27a'); // le bougeoir
    P.ellipse(28, 6, 6, 2, '#e8e4dc'); P.ellipse(28, 5, 5, 1, '#3a6aa8'); P.hline(23, 7, 11, '#c8c4bc'); // le bol
    return fini(c, 33);
  }
  function fauteuil() { // un vieux fauteuil de velours vert, un napperon au crochet
    const { c, P } = mk(32, 32);
    P.rect(4, 0, 24, 18, '#2e5a4a'); P.ellipse(16, 2, 12, 3, '#3a6a5a'); for (let x = 6; x < 27; x += 4) P.vline(x, 4, 12, '#28503f');
    P.rect(11, 2, 10, 7, '#f4f2ec'); for (let x = 11; x < 21; x += 2) P.px(x, 9, '#f4f2ec'); P.px(13, 4, '#d8d4cc'); P.px(17, 6, '#d8d4cc');
    P.rect(0, 10, 7, 14, '#3a6a5a'); P.rect(25, 10, 7, 14, '#3a6a5a'); P.ellipse(3, 10, 4, 2, '#4a7a6a'); P.ellipse(28, 10, 4, 2, '#4a7a6a');
    P.rect(5, 17, 22, 7, '#4a7a6a'); P.hline(5, 17, 22, '#5a8a7a');
    P.rect(2, 24, 28, 4, '#2e5a4a'); for (const x of [2, 27]) P.rect(x, 28, 3, 4, BOIS.d);
    return fini(c, 31);
  }
  function portemanteau() { // un portemanteau : un manteau, une écharpe rouge, un chapeau
    const { c, P } = mk(24, 60);
    P.rect(11, 6, 2, 50, BOIS.m); P.vline(11, 6, 50, BOIS.l); for (const [x, y] of [[5, 8], [17, 8], [7, 12], [16, 12]]) P.rect(x, y, 3, 2, BOIS.c);
    P.rect(4, 54, 16, 2, BOIS.d); P.rect(4, 56, 2, 4, BOIS.d); P.rect(18, 56, 2, 4, BOIS.d);
    P.rect(3, 12, 10, 26, '#5a4a6a'); P.trap(3, 10, 1, 13, 30, 10, '#5a4a6a'); P.vline(8, 14, 24, '#4a3a5a'); for (const y of [18, 24, 30]) P.px(9, y, OR); // le manteau
    P.rect(14, 10, 3, 22, '#c8343a'); for (let y = 12; y < 32; y += 3) P.hline(14, y, 3, '#e86a5a'); for (const x of [14, 16]) P.vline(x, 32, 3, '#c8343a'); // l'écharpe
    P.ellipse(12, 4, 7, 2, '#3a3040'); P.rect(8, 0, 8, 4, '#3a3040'); P.hline(8, 3, 8, '#8a2a2a'); // le chapeau
    return fini(c, 59);
  }
  function caissePommes() {
    const { c, P } = mk(26, 20);
    P.rect(0, 6, 26, 14, BOIS.l); for (const y of [6, 11, 16]) P.hline(0, y, 26, BOIS.c); P.vline(0, 6, 14, BOIS.m); P.vline(25, 6, 14, BOIS.m);
    for (const [x, y] of [[4, 5], [9, 4], [14, 5], [19, 4], [7, 2], [16, 2], [12, 1]]) { P.ellipse(x, y, 3, 3, '#c8343a'); P.px(x - 1, y - 1, '#ff8a8a'); P.px(x, y - 3, '#5a3a24'); }
    P.ellipse(22, 2, 2, 2, '#8ab84a');
    return fini(c, 19);
  }
  function radio() { // une vieille radio en bois, posée sur un tabouret
    const { c, P } = mk(24, 32);
    P.rect(1, 0, 22, 16, BOIS.c); P.ellipse(12, 2, 11, 3, BOIS.c); P.rect(3, 3, 10, 10, '#c8a878'); for (let y = 4; y < 13; y += 2) P.hline(3, y, 10, '#a88858');
    P.rect(15, 4, 6, 3, '#f4ecd8'); P.px(17, 5, '#c8343a'); P.ellipse(16, 11, 2, 2, BOIS.d); P.ellipse(20, 11, 2, 2, BOIS.d);
    P.ellipse(12, 17, 9, 2, BOIS.l); P.hline(3, 17, 19, BOIS.c); for (const x of [5, 12, 18]) P.rect(x, 18, 2, 14, BOIS.m);
    return fini(c, 31);
  }
  function machineEcrire() { // une machine à écrire sur une caisse en bois
    const { c, P } = mk(28, 30);
    P.rect(0, 12, 28, 18, BOIS.l); P.hline(0, 12, 28, BOIS.h); for (const y of [17, 23]) P.hline(0, y, 28, BOIS.c); P.vline(0, 12, 18, BOIS.m); P.vline(27, 12, 18, BOIS.m);
    Arendelle.texte(P, 'THE', 9, 20, BOIS.d);
    P.rect(4, 4, 20, 8, '#2a2a34'); P.rect(2, 2, 24, 3, '#3a3a46'); P.hline(2, 2, 24, '#6a6a7a'); P.rect(9, 0, 10, 3, '#f4f2ec');
    for (let x = 6; x < 22; x += 2) { P.px(x, 7, '#c8ccd8'); P.px(x + 1, 9, '#c8ccd8'); }
    return fini(c, 29);
  }
  function guitare() {
    const { c, P } = mk(16, 42);
    P.rect(7, 0, 3, 18, BOIS.d); P.rect(6, 0, 5, 4, BOIS.n); for (const y of [1, 3]) { P.px(5, y, '#c8ccd8'); P.px(11, y, '#c8ccd8'); }
    P.ellipse(8, 24, 6, 5, '#c8843a'); P.ellipse(8, 34, 8, 7, '#c8843a'); P.ellipse(8, 28, 2, 2, '#2a1a10'); P.rect(5, 37, 6, 2, BOIS.d);
    for (let y = 4; y < 37; y += 1) if (y % 2) P.px(8, y, '#e8e4dc');
    P.ellipse(6, 33, 3, 3, '#d89a4a');
    return fini(c, 41);
  }
  function seauBalai() {
    const { c, P } = mk(18, 44);
    P.rect(11, 0, 2, 32, BOIS.l); P.trap(9, 6, 7, 10, 32, 10, '#c8a050'); for (let x = 8; x < 17; x += 2) P.vline(x, 34, 8, '#a88030');
    P.trap(1, 10, 0, 12, 30, 12, '#8a90a0'); P.hline(0, 30, 12, '#c8ccd8'); P.ellipse(6, 30, 6, 2, '#5a5e6c'); P.hline(1, 36, 10, '#6a7080');
    return fini(c, 43);
  }
  function panierLaine() { // un panier de pelotes de laine et ses aiguilles
    const { c, P } = mk(22, 16);
    P.ellipse(11, 11, 10, 5, '#a8803a'); for (let x = 2; x < 21; x += 3) P.vline(x, 9, 6, '#987030'); P.ellipse(11, 8, 9, 2, '#8a6a2a');
    for (const [x, y, col] of [[6, 6, '#c8343a'], [12, 5, '#3a6ad8'], [17, 7, '#f2c230']]) { P.ellipse(x, y, 3, 3, col); P.px(x - 1, y - 1, PX.shade(col, 0.4)); P.px(x + 1, y, PX.shade(col, -0.2)); }
    Objets.line(P, 13, 4, 20, -1 + 3, '#c8ccd8'); Objets.line(P, 14, 5, 21, 1, '#c8ccd8');
    return fini(c, 15);
  }
  function ventilateur() {
    const { c, P } = mk(18, 28);
    P.ellipse(9, 8, 8, 8, '#5a6a6a'); P.ellipse(9, 8, 7, 7, '#2a3434'); for (let a = 0; a < 3; a++) { const t = a / 3 * Math.PI * 2; P.ellipse(Math.round(9 + Math.cos(t) * 4), Math.round(8 + Math.sin(t) * 4), 2, 2, '#8a9a9a'); }
    for (let k = -7; k <= 7; k += 2) P.vline(9 + k, 1 + Math.abs(k) / 2, 15 - Math.abs(k), '#7a8a8a');
    P.px(9, 8, '#c8ccd8'); P.rect(8, 16, 2, 8, '#4a5a5a'); P.ellipse(9, 25, 6, 2, '#4a5a5a');
    return fini(c, 27);
  }
  function assiettes() { // une pile d'assiettes et une théière
    const { c, P } = mk(22, 18);
    for (let k = 0; k < 5; k++) { P.ellipse(7, 15 - k * 2, 7, 2, k % 2 ? '#e8e4dc' : '#f4f2ec'); P.hline(1, 15 - k * 2, 13, '#3a6aa8'); }
    P.ellipse(17, 12, 5, 5, '#f4f2ec'); P.ellipse(17, 7, 3, 1, '#e8e4dc'); P.px(17, 6, '#3a6aa8'); P.rect(21, 10, 2, 2, '#f4f2ec'); P.hline(12, 11, 2, '#f4f2ec');
    for (const x of [15, 18]) P.px(x, 12, '#3a6aa8');
    return fini(c, 17);
  }
  function cadresSol() { // des cadres couchés par terre, l'un sur l'autre
    const { c, P } = mk(34, 14);
    P.rect(0, 6, 30, 8, OR3); P.rect(1, 7, 28, 6, '#3a5a3a'); P.rect(4, 2, 28, 8, '#5a3a24'); P.rect(5, 3, 26, 6, '#8ab0d8'); P.rect(5, 7, 26, 2, '#4a7a4a');
    P.hline(4, 2, 28, '#7a5034');
    return fini(c, 13);
  }
  function ours() { const c = PX.fromRows(['.bb...bb.', 'bBBbbbBBb', '.bbbbbbb.', '.bkbbbkb.', '.bbbnbbb.', '..bbbbb..', '.bbcccbb.', 'bbbcccbbb', 'bb.bbb.bb', '.bb...bb.'], { b: '#a8783a', B: '#c8986a', k: '#1d1626', n: '#3a2418', c: '#d8b88a' }); return fini(c, 9); }
  function ballon() { const c = PX.fromRows(['..rrr..', '.rwwrr.', 'rwwrrrr', 'rrrrwwr', 'rrrwwwr', '.rrrwr.', '..rrr..'], { r: '#c8343a', w: '#f4f2ec' }); return fini(c, 6); }
  function toupie() { const c = PX.fromRows(['...k...', '..yyy..', '.rrrrr.', 'yyyyyyy', '.rrrrr.', '..yyy..', '...k...'], { k: '#5a3a24', y: '#f2c230', r: '#3a6ad8' }); return fini(c, 6); }
  // un gros poteau de charpente, avec sa jambe de force
  function poteau() {
    const { c, P } = mk(30, 130);
    P.rect(11, 0, 9, 130, BOIS.m); P.vline(11, 0, 130, BOIS.l); P.vline(19, 0, 130, BOIS.d);
    for (let y = 8; y < 126; y += 17) P.px(14 + (y % 3), y, BOIS.d);
    for (let k = 0; k < 22; k++) { P.rect(19 + Math.floor(k / 2), 4 + k, 3, 3, BOIS.c); P.rect(11 - Math.floor(k / 2) - 2, 4 + k, 3, 3, BOIS.c); }
    return fini(c, 129);
  }
  // une ampoule nue au bout de son fil (dessinée au-dessus de tout)
  function ampoule(fil) {
    const c = PX.canvas(7, fil + 9), P = PX.painter(c);
    P.vline(3, 0, fil, '#1d1626'); P.rect(2, fil, 3, 2, '#5a5a6a'); P.ellipse(3, fil + 4, 3, 3, '#ffe9a0'); P.ellipse(3, fil + 4, 1, 2, '#fffbe0');
    return c;
  }
  // la souris qui détale (et que Georges poursuit)
  function souris(gauche) {
    const c = PX.fromRows(['....pp..', '.gggggpg', 'ggggggkg', '.gggggg.', '..t..t..'], { g: '#9a96a6', p: '#e8a8b8', k: '#1d1626', t: '#6a6676' });
    const tete = gauche ? PX.flipX(c) : c;
    return PX.outline(tete, '#1d1626');
  }

  // ------------------------------------------------------------ les cinq objets-souvenirs (dessinés petits, montrés en grand)
  function brut(w, h, f) { const { c, P } = mk(w, h); f(P, c); return c; }
  const OBJETS = {
    // le pansement du doigt coupé chez le boucher, avec un petit cœur : le bisou magique
    pansement: () => brut(24, 10, (P) => {
      const T = '#e8b48c', T2 = '#c8906a';
      P.rect(4, 0, 16, 10, T); P.ellipse(4, 5, 4, 5, T); P.ellipse(19, 5, 4, 5, T);
      for (const x of [2, 5, 18, 21]) for (const y of [3, 6]) P.px(x, y, T2);
      P.rect(8, 1, 8, 8, '#f8efe2'); P.hline(8, 1, 8, '#ffffff'); P.vline(15, 2, 7, '#e8dccc');
      for (const [x, y] of [[9, 3], [10, 3], [13, 3], [14, 3], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4], [10, 5], [11, 5], [12, 5], [13, 5], [11, 6], [12, 6]]) P.px(x, y, '#e8435a');
      P.px(9, 3, '#ff9aa8'); P.hline(5, 0, 14, '#f4c8a4');
    }),
    // la couronne du Prince Jean, en modèle réduit… et toujours trop grande
    couronne: () => brut(22, 16, (P) => {
      P.rect(2, 6, 18, 4, '#a8283a');
      for (let k = 0; k < 5; k++) { const x = 2 + k * 4; P.trap(x + 1, 1, x, 3, 2, 8, OR); P.px(x + 1, 1, OR2); P.ellipse(x + 1, 1, 1, 1, OR2); }
      P.rect(1, 9, 20, 6, OR); P.hline(1, 9, 20, OR2); P.hline(1, 14, 20, OR3); P.vline(1, 9, 6, OR2);
      P.ellipse(11, 12, 2, 1, '#d8323a'); P.px(10, 11, '#ff9a9a'); P.ellipse(5, 12, 1, 1, '#3a6ad8'); P.ellipse(17, 12, 1, 1, '#3a8a4a'); P.px(5, 11, '#9ac8ff'); P.px(17, 11, '#9ae8b0');
    }),
    // l'écharpe de Loane, prêtée à Jack Snow : noire, en grosse maille, pliée ; elle sent encore son parfum
    echarpe: () => brut(22, 18, (P) => {
      const N = '#1d1a22', N2 = '#3a3644', N3 = '#4e4a5a';
      P.rect(1, 2, 20, 8, N); P.rect(4, 9, 7, 7, N); P.rect(12, 8, 7, 8, N);
      for (let y = 3; y < 10; y += 2) for (let x = 2 + (y % 4 === 1 ? 1 : 0); x < 20; x += 3) { P.px(x, y, N2); P.px(x + 1, y + 1, N2); }
      for (let y = 10; y < 16; y += 2) { for (const x of [5, 8, 13, 16]) { P.px(x, y, N2); P.px(x + 1, y + 1, N2); } }
      P.hline(1, 2, 20, N3); P.hline(1, 9, 20, '#121016');
      for (let x = 4; x < 11; x += 2) P.vline(x, 16, 2, N2); for (let x = 12; x < 19; x += 2) P.vline(x, 16, 2, N2); // les franges
    }),
    // un ticket de car pour Montaigu
    ticket: () => brut(44, 15, (P, c) => {
      P.rect(0, 0, 44, 15, '#f4ecd8'); P.rect(0, 0, 44, 5, '#3a6aa8'); P.hline(0, 5, 44, '#2a4a7a');
      Arendelle.texte(P, 'ALLER', 2, 0, '#ffffff'); Arendelle.texte(P, 'MONTAIGU', 2, 7, '#2a3a6a');
      for (let y = 0; y < 15; y += 2) P.px(35, y, '#c8b898'); P.rect(37, 8, 4, 4, '#d8323a'); P.px(38, 9, '#f4ecd8'); P.px(39, 10, '#f4ecd8');
      const g = c.getContext('2d'); g.clearRect(41, 1, 2, 2); g.clearRect(0, 6, 1, 3); g.clearRect(43, 6, 1, 3); // le trou du composteur, les encoches
      P.hline(2, 13, 30, '#d8ccb0');
    }),
    // le dessert du soir, un mini Paris-Brest : une couronne de pâte à choux, crème pralinée, amandes effilées
    chou: () => brut(24, 16, (P) => {
      P.ellipse(12, 11, 11, 4, '#b8742e'); P.ellipse(12, 10, 11, 4, '#c8843a');
      P.ellipse(12, 8, 10, 3, '#e8c890'); for (let x = 2; x < 23; x += 3) P.ellipse(x, 8, 1, 1, '#f4dca8'); // la crème pralinée
      P.ellipse(12, 5, 11, 4, '#d89a4a'); P.ellipse(11, 4, 9, 3, '#e8b060'); P.ellipse(12, 6, 4, 1, '#8a5a2a');
      for (const [x, y] of [[4, 4], [8, 2], [14, 2], [18, 4], [11, 3], [16, 6], [6, 6]]) { P.px(x, y, '#f4e4c0'); P.px(x + 1, y, '#e8d0a0'); }
      for (const [x, y] of [[5, 3], [9, 4], [13, 3], [17, 3], [20, 5], [3, 5], [12, 1]]) P.px(x, y, '#ffffff'); // le sucre glace
    }),
  };

  // ------------------------------------------------------------ la langue inconnue : un symbole par objet
  // (9 × 11, « X » : le trait ; « o » : un point plus clair)
  const SYMBOLES = {
    pansement: ['X.XXXXX.X', 'X.......X', '.XX...XX.', '...X.X...', '....X....', '.XXXXXXX.', '....X....', '...X.X...', '..X...X..', '.X.....X.', 'o.......o'],
    couronne: ['X.......X', 'XX.....XX', 'X.X...X.X', 'X..X.X..X', 'X...X...X', 'X.......X', 'X..XXX..X', 'X.X...X.X', 'X..XXX..X', 'X.......X', '....o....'],
    echarpe: ['....X....', '...X.X...', '..X...X..', '.X..o..X.', 'X.......X', '.X.....X.', '..X...X..', '.X.....X.', 'X.......X', '.X.....X.', '..XXXXX..'],
    ticket: ['XXXXXXXXX', '....X....', '...XXX...', '..X.X.X..', '.X..X..X.', '....X....', '.XXXXXXX.', '....X....', '..X...X..', '..X...X..', '.o.....o.'],
    chou: ['..XXXXX..', '.X.....X.', 'X..XXX..X', 'X.X...X.X', 'X.X.o.X.X', 'X.X...X.X', 'X..XXX..X', '.X.....X.', '..XXXXX..', '....X....', '...XXX...'],
  };
  const cache = {};
  function objet(id) { return cache['o' + id] || (cache['o' + id] = PX.outline(OBJETS[id](), '#1d1626')); }
  // le verso : la même forme, encre violette et liseré d'or (le symbole est dessiné par-dessus, à part)
  function verso(id) { return cache['v' + id] || (cache['v' + id] = PX.outline(PX.silhouette(OBJETS[id](), '#3a2560'), OR)); }
  // le symbole : col = couleur du trait ; ombre : une version sombre pour le relief
  function symbole(id, col = '#f6d27a', point = '#fff6c8') {
    const k = 's' + id + col;
    return cache[k] || (cache[k] = PX.fromRows(SYMBOLES[id], { X: col, o: point }));
  }

  return {
    armoire, bibliotheque, horloge, sapinVieux, bureau, tableaux, miroir, chaises, luge, drap, malle, chevalBascule, globe, cage, mannequin,
    valises, chapeaux, cartons, gramophone, berceau, cartonNoel, pileLivres, tapisRoule, couture, coffreJouets, maisonPoupee, lampePied,
    tabouret, parapluies, vase, poteau, ampoule, souris, commode, fauteuil, portemanteau, caissePommes, radio, machineEcrire, guitare, seauBalai,
    panierLaine, ventilateur, assiettes, cadresSol, ours, ballon, toupie, objet, verso, symbole, BOIS,
  };
})();
