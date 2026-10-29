// =====================================================================
//  carte-arendelle.js — ZONE 4 : Arendelle sous la neige (épreuve 3)
//
//  Plan (en pixels, y vers le bas) :
//    y    0-200  le ciel d'aurore boréale, les montagnes et le palais de glace d'Elsa (décor)
//    y  200-440  le château aux toits de cuivre vert, sa cour et la fontaine gelée,
//                le mur d'enceinte et ses grandes portes
//    y  456-504  le canal gelé, traversé par le pont du château
//    y  504-930  le village : maisons colorées, la grande place (sapin, marché de Noël, puits)
//    ouest        le fjord gelé (on y glisse), les bateaux pris dans la glace, les patineuses
//    est          la forêt de sapins, la clairière des trolls, le comptoir d'Oaken (et sauna)
//    sud-est      l'écurie de Kristoff et Sven, puis l'arrêt de bus à la sortie d'Arendelle
//    sud          l'arrivée depuis la forêt de Sherwood, la colline aux luges
// =====================================================================
'use strict';

Jeu.enregistrerCarte('arendelle', () => {
  const W = 1600, H = 1200, HAUT = 200;
  const C = new Carte('arendelle', W, H, { ambiance: 'soir', fond: '#0e1430' });
  const P = C.P, O = C.O, r = PX.rng(1225), A = Arendelle;
  const N = A.NEIGE, N2 = A.NEIGE2, N3 = A.NEIGE3;
  C.neige = 1.6;

  // ---------------------------------------------------------------- sol : neige partout
  P.rect(0, 0, W, H, '#e6edf7');
  P.speckle(0, HAUT, W, H - HAUT, ['#f4f8ff', '#d8e2f0', '#eef3fb', '#cfdaea'], 0.12, r);
  // la neige n'est pas plate : de grandes congères (ombre bleutée en bas, reflet en haut), des vagues de vent,
  // des brins d'herbe et des brindilles qui dépassent
  for (let k = 0; k < 420; k++) {
    const x = r.int(W), y = HAUT + r.int(H - HAUT), rx = 14 + r.int(40), ry = 4 + r.int(10);
    P.ellipse(x, y + 2, rx, ry, 'rgba(140,165,210,0.13)'); P.ellipse(x - 2, y - 1, rx - 3, Math.max(2, ry - 3), 'rgba(255,255,255,0.32)');
  }
  for (let k = 0; k < 900; k++) { const x = r.int(W), y = HAUT + r.int(H - HAUT), l = 3 + r.int(9); P.rect(x, y, l, 1, 'rgba(160,180,215,0.35)'); P.rect(x + 1, y - 1, l - 2, 1, 'rgba(255,255,255,0.6)'); }
  for (let k = 0; k < 260; k++) { const x = r.int(W), y = HAUT + r.int(H - HAUT); P.px(x, y, r.pick(['#6a7a5a', '#5a4a3a', '#8a7a5a'])); if (r.chance(0.5)) P.px(x + 1, y - 1, '#7a8a5a'); }
  // le fond : ciel, aurore boréale, montagnes, palais de glace
  A.fond(P, W, 186, r);
  A.palais(P, 1210, 96);
  C.lumiere(1210, 70, 70, 'neon');
  C.solide(0, 0, W, HAUT);

  // ---------------------------------------------------------------- le fjord et le canal, gelés
  const LAC = { x: 0, y: 206, w: 418, h: 914 }, CANAL = { x: 0, y: 456, w: 1180, h: 48 };
  const glace = (z) => {
    P.rect(z.x, z.y, z.w, z.h, '#b8d8ee');
    P.speckle(z.x, z.y, z.w, z.h, ['#c8e4f6', '#a8cce6', '#d8eefa'], 0.08, r);
    for (let k = 0; k < z.w * z.h / 3000; k++) { const x = z.x + r.int(z.w), y = z.y + r.int(z.h); P.rect(x, y, 10 + r.int(30), 1, 'rgba(255,255,255,0.55)'); }
    for (let k = 0; k < z.w * z.h / 9000; k++) { // fissures
      let x = z.x + r.int(z.w), y = z.y + r.int(z.h);
      for (let s = 0; s < 6; s++) { const nx = x + r.int(15) - 7, ny = y + r.int(9) - 4; Objets.line(P, x, y, nx, ny, '#e8f6ff'); x = nx; y = ny; }
    }
  };
  glace(LAC); glace(CANAL);
  // berges enneigées, irrégulières
  for (let y = LAC.y; y < LAC.y + LAC.h; y++) { const b = 3 + Math.round(Math.abs(Math.sin(y * 0.05)) * 6 + Math.sin(y * 0.19) * 2); P.rect(LAC.x + LAC.w - b, y, b + 4, 1, N); P.px(LAC.x + LAC.w - b, y, N3); }
  // le quai de pierre le long du fjord, devant le village (comme les quais de la rue des chats)
  const QX = LAC.x + LAC.w - 8;
  for (let y = 508; y < 1100; y += 6) for (let j = 0; j < 2; j++) {
    const bx = QX + j * 6 - (((y / 6) | 0) % 2) * 3, col = r.pick(['#9a96aa', '#8a8698', '#a4a0b4']);
    P.rect(bx, y, 6, 5, col); P.hline(bx, y, 6, PX.shade(col, 0.2)); P.hline(bx, y + 5, 6, '#5a566a');
  }
  P.rect(QX - 1, 508, 2, 592, '#4a4658'); P.rect(QX + 12, 508, 3, 592, N); for (let y = 508; y < 1100; y += 3) P.px(QX + 11, y, N3);
  for (let y = 520; y < 1100; y += 64) { P.ellipse(QX + 1, y, 2, 2, '#3a3646'); P.px(QX + 1, y, '#9a96aa'); } // anneaux d'amarrage
  for (let x = LAC.x; x < LAC.x + LAC.w; x++) { const b = 3 + Math.round(Math.abs(Math.sin(x * 0.07)) * 5); P.rect(x, LAC.y + LAC.h - b, 1, b + 6, N); P.px(x, LAC.y + LAC.h - b, N3); P.rect(x, LAC.y - 2, 1, 3 + (x % 3), N); }
  for (let x = CANAL.x + LAC.w; x < CANAL.w; x++) { P.px(x, CANAL.y, N3); P.rect(x, CANAL.y - 2, 1, 2, N); P.px(x, CANAL.y + CANAL.h, N3); P.rect(x, CANAL.y + CANAL.h + 1, 1, 2, N); }
  C.glaces = [LAC, CANAL];
  C.solide(CANAL.w, CANAL.y - 2, 8, CANAL.h + 4);
  C.zone(398, 600, 24, 40, 'lacGele');
  // les bateaux pris dans la glace
  C.objet(A.bateauGele(3), 170, 380, { solide: [-44, -14, 88, 12], texte: 'bateauGele', zw: 60 });
  C.objet(A.bateauGele(9), 270, 720, { solide: [-44, -14, 88, 12], texte: 'bateauGele', zw: 60 });
  // le trou du pêcheur
  P.ellipse(230, 962, 7, 3, '#2a4a6a'); P.ellipse(230, 962, 5, 2, '#1a2a4a'); P.ellipse(230, 960, 9, 2, '#e8f6ff');
  C.zone(222, 954, 16, 12, 'trouPeche');
  C.objet(A.pancarte(['ATTENTION', 'GLACE']), 436, 552, { solide: [-2, -2, 4, 3] });
  C.objet(A.transat(), 452, 930, { solide: [-12, -6, 24, 6], texte: 'transat', zw: 24 });
  // la longue-vue, au bord du fjord
  C.dynamiques.push({ sortY: 760, draw(g) { g.fillStyle = '#2a2632'; g.fillRect(429, 744, 2, 16); g.fillRect(426, 758, 8, 2); g.fillStyle = '#c89a4a'; g.fillRect(427, 740, 9, 3); g.fillStyle = '#e8c070'; g.fillRect(428, 740, 4, 1); } });
  C.solide(426, 756, 8, 4); C.zone(420, 748, 20, 14, 'longueVue');

  // ---------------------------------------------------------------- sentiers tassés dans la neige
  // une courbe douce ; le creux un peu plus sombre, l'ombre du bord de neige en haut, le rebord éclairé en bas,
  // et au milieu des traces : des pas, ou un traîneau et les sabots de Sven.
  // Tous les sentiers sont dessinés couche par couche, pour qu'ils se rejoignent sans rebord entre eux.
  // Ceux qui partent d'une rue commencent cachés sous ses pavés, aussi larges qu'elle (debut), puis se resserrent
  // une fois sortis (après « sortie » pixels) : avec les pavés qui s'effacent, on passe de l'un à l'autre en douceur.
  const SENTIERS = [
    { pts: [[1100, 622], [1180, 622], [1224, 592], [1252, 500], [1268, 420], [1290, 344]], larg: 16, debut: 62, sortie: 80, traces: 'pas' }, // vers le comptoir d'Oaken
    { pts: [[1100, 850], [1180, 850], [1236, 878], [1278, 930], [1272, 990], [1302, 1036], [1370, 1048], [1450, 1086], [1530, 1150], [1600, 1164]],
      larg: 18, debut: 57, sortie: 80, traces: 'traineau' },                                                                               // vers l'écurie et l'arrêt de bus
    // vers la clairière : pas de sentier dessiné (il ne faut pas montrer où est la boule), mais le passage reste sans arbres
    { pts: [[1100, 622], [1180, 622], [1290, 610], [1400, 566]], larg: 14, invisible: true },
    { pts: [[1470, 1166], [1600, 1176]], larg: 26, traces: null },                     // l'arrêt de bus
  ];
  const courbe = (pts) => { // Catmull-Rom, un point tous les deux pixels environ
    const out = [];
    for (let s = 0; s < pts.length - 1; s++) {
      const a = pts[Math.max(0, s - 1)], b = pts[s], c = pts[s + 1], d = pts[Math.min(pts.length - 1, s + 2)];
      const n = Math.max(2, Math.ceil(Math.hypot(c[0] - b[0], c[1] - b[1]) / 2));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (p0, p1, p2, p3) => 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3);
        out.push([f(a[0], b[0], c[0], d[0]), f(a[1], b[1], c[1], d[1])]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  const traces = SENTIERS.filter((s) => !s.invisible).map((s) => {
    const c = courbe(s.pts), R = [];
    for (let k = 0, d = 0; k < c.length; k++) {
      if (k) d += Math.hypot(c[k][0] - c[k - 1][0], c[k][1] - c[k - 1][1]);
      const t = s.debut ? Math.min(1, Math.max(0, (d - s.sortie) / 60)) : 1;
      R.push((s.larg + (s.debut ? (s.debut - s.larg) * (1 - t * t * (3 - 2 * t)) : 0)) / 2);
    }
    return Object.assign({ c, R }, s);
  });
  const couche = (dy, dr, col) => { for (const s of traces) s.c.forEach(([x, y], k) => { const R = Math.round(s.R[k] + dr); P.ellipse(Math.round(x), Math.round(y + dy), R, Math.round(R * 0.7), col); }); };
  couche(1, 1, '#fbfdff');   // le rebord de neige, éclairé
  couche(0, 0, '#b2c0d8');   // l'ombre du bord
  couche(1, -1, '#cfd9e8');  // le creux tassé
  for (const s of traces) {
    if (!s.traces) continue;
    let dist = 0, n = 0;
    for (let k = 1; k < s.c.length; k++) {
      const [x0, y0] = s.c[k - 1], [x1, y1] = s.c[k], l = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / l, ny = (x1 - x0) / l;
      dist += l;
      if (s.traces !== 'pas') { for (const e of [-4, 4]) P.px(Math.round(x1 + nx * e), Math.round(y1 + ny * e * 0.7), '#b4c2d8'); } // les patins
      if (dist < 7) continue;
      dist = 0; n++;
      const e = s.traces === 'pas' ? (n % 2 ? -2 : 2) : (n % 2 ? -1 : 1), px = Math.round(x1 + nx * e), py = Math.round(y1 + ny * e * 0.7);
      if (s.traces === 'pas') { P.rect(px, py, 2, 1, '#a6b4cc'); P.px(px, py - 1, '#bac6da'); } // les pas
      else { P.px(px - 1, py, '#a8b6ce'); P.px(px + 1, py, '#a8b6ce'); P.px(px, py + 1, '#b4c2d8'); } // les sabots de Sven
    }
  }

  // ---------------------------------------------------------------- rues et place pavées sous la neige
  // La cour du château, le pont, la rue du nord, la grande place, la rue du sud et la grand-rue forment un seul
  // réseau : on réunit leurs rectangles, on arrondit les coins des croisements, puis la neige dépend de la distance
  // au bord : congère le long des façades, poudrée sur les côtés, balayée au milieu.
  const RUES = [
    [590, 330, 420, 112],   // la cour du château
    [776, 440, 48, 70],     // le pont
    [770, 500, 60, 104],    // la montée du pont jusqu'à la rue du nord
    [450, 600, 730, 44],    // la rue du nord, devant les maisons
    [640, 640, 320, 194],   // la grande place, jusqu'à la rue du sud
    [450, 830, 730, 40],    // la rue du sud
    [760, 866, 80, 334],    // la grand-rue, jusqu'à l'arrivée
  ];
  // là où partent les sentiers : au bout d'une rue, les pavés s'effacent sur ses 44 derniers pixels et les congères
  // s'amincissent jusqu'aux bords du sentier
  const BOUTS = [{ x: 1180, y0: 600, y1: 644, sens: 1 }, { x: 1180, y0: 830, y1: 870, sens: 1 }];
  {
    const M = 24, bx = 450 - M, by = 330 - M, w = 1180 - 450 + 2 * M, h = 1200 - 330 + M, n = w * h;
    // distance (en pixels) de chaque case « dedans » à la case « dehors » la plus proche (chanfrein 3-4, deux passes)
    const distances = (dedans) => {
      const D = new Float32Array(n);
      for (let i = 0; i < n; i++) D[i] = dedans(i) ? 1e9 : 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (!D[i]) continue;
        let v = D[i];
        if (x > 0) v = Math.min(v, D[i - 1] + 3);
        if (y > 0) { v = Math.min(v, D[i - w] + 3); if (x > 0) v = Math.min(v, D[i - w - 1] + 4); if (x < w - 1) v = Math.min(v, D[i - w + 1] + 4); }
        D[i] = v;
      }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x; if (!D[i]) continue;
        let v = D[i];
        if (x < w - 1) v = Math.min(v, D[i + 1] + 3);
        if (y < h - 1) { v = Math.min(v, D[i + w] + 3); if (x < w - 1) v = Math.min(v, D[i + w + 1] + 4); if (x > 0) v = Math.min(v, D[i + w - 1] + 4); }
        D[i] = v;
      }
      for (let i = 0; i < n; i++) D[i] /= 3;
      return D;
    };
    const dans = (i, [x, y, rw, rh]) => { const gx = bx + (i % w), gy = by + ((i / w) | 0); return gx >= x && gx < x + rw && gy >= y && gy < y + rh; };
    const R0 = new Uint8Array(n);
    for (let i = 0; i < n; i++) R0[i] = RUES.some((q) => dans(i, q)) ? 1 : 0;
    // les coins rentrants arrondis (fermeture), puis les coins saillants un peu adoucis (ouverture)
    const ext = distances((i) => !R0[i]);
    const R1 = distances((i) => R0[i] || ext[i] <= 14);
    const R2 = distances((i) => R1[i] > 14);
    const ext2 = distances((i) => !(R2[i] > 5));
    const D = distances((i) => R2[i] > 5 || ext2[i] <= 5);
    // les pavés, sur une toile à part, puis le mélange avec la neige déjà peinte
    const tp = PX.canvas(w, h), TP = PX.painter(tp);
    Sol.paves(TP, 0, 0, w, h, r, { base: ['#7c7c90', '#86869c', '#74748a', '#8c8698'], hi: '#a4a4b8', lo: '#606076', joint: '#525268' });
    const pv = TP.g.getImageData(0, 0, w, h).data, img = P.g.getImageData(bx, by, w, h), d = img.data;
    const neige = [0xee, 0xf3, 0xfb], ombre = [0xb4, 0xc8, 0xe2], blanc = [0xe6, 0xec, 0xf6];
    for (let i = 0; i < n; i++) {
      const dd = D[i]; if (!dd) continue;
      const gx = bx + (i % w), gy = by + ((i / w) | 0), k = i * 4;
      let f = 0; // de 0 (pavés) à 1 (le sentier qui part de là)
      for (const b of BOUTS) { const u = (b.x - gx) * b.sens; if (gy >= b.y0 - 6 && gy <= b.y1 + 6 && u < 44) f = Math.max(f, 1 - Math.max(0, u) / 44); }
      f = f * f * (3 - 2 * f);
      const conge = (2 + Math.round(Math.abs(Math.sin(gx * 0.13 + gy * 0.09)) * 3)) * (1 - f); // la congère le long du bord
      let col = null;
      if (conge >= 1 && dd <= conge - 0.5) col = neige;
      else if (conge >= 1 && dd <= conge + 0.5) col = ombre;
      if (col) { d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; continue; }
      // des plaques de neige irrégulières, plus nombreuses loin du milieu des passages
      const plaque = Math.max(0, Math.sin(gx * 0.045 + Math.sin(gy * 0.031) * 2.2) * Math.sin(gy * 0.058 + Math.sin(gx * 0.017) * 1.7)) * 0.45;
      let a = Math.min(1, Math.max(0.4 + plaque, 1.05 - dd * 0.042, f));
      a = Math.min(1, Math.max(0, a + ((PX.bayer(gx, gy) / 16) - 0.5) * 0.12)); // un grain très léger
      const fond = gy >= CANAL.y - 2 && gy < CANAL.y + CANAL.h + 2 ? blanc : [d[k], d[k + 1], d[k + 2]]; // sur le pont : de la neige, pas la glace
      d[k] = pv[k] * (1 - a) + fond[0] * a; d[k + 1] = pv[k + 1] * (1 - a) + fond[1] * a; d[k + 2] = pv[k + 2] * (1 - a) + fond[2] * a;
    }
    P.g.putImageData(img, bx, by);
    // quelques traces de pas sur les pavés poudrés
    for (let k = 0; k < 520; k++) { const i = r.int(n); if (D[i] < 7) continue; const px = bx + (i % w), py = by + ((i / w) | 0); P.rect(px, py, 2, 1, '#9aa4bc'); }
  }
  // la cour, le pont et ses parapets
  C.solide(570, 330, 20, 112); C.solide(1010, 330, 20, 112);
  for (const x of [772, 824]) { C.solide(x, 452, 4, 56); P.rect(x, 452, 4, 56, '#c4b698'); P.vline(x, 452, 56, '#e2d6bc'); for (let y = 454; y < 506; y += 8) P.rect(x - 1, y, 6, 3, N); }

  // ---------------------------------------------------------------- le château d'Arendelle et son enceinte
  const chateau = A.chateau();
  C.objet(chateau, 800, 330, { solide: [-226, -96, 452, 96] });
  chateau.lumieres.forEach(([x, y, rr, k]) => C.lumiere(800 - chateau.ax + x, 330 - chateau.ay + y, rr, k));
  C.zone(782, 324, 36, 10, 'porteChateau');
  const fontaine = A.fontaineGelee();
  C.objet(fontaine, 800, 404, { solide: [-24, -10, 48, 12], ombre: [26, 6] });
  fontaine.lumieres.forEach(([x, y, rr, k]) => C.lumiere(800 - fontaine.ax + x, 404 - fontaine.ay + y, rr, k));
  C.zone(774, 396, 52, 14, null, { dialogue: (J) => EpreuveNeige.fontaine(J) });
  C.objet(A.muraille(174), 590, 452, { solide: [0, -12, 174, 12] });
  C.objet(A.muraille(174), 836, 452, { solide: [0, -12, 174, 12] });
  C.objet(A.portail(), 800, 452, { dy: 1 });
  C.solide(764, 440, 12, 12); C.solide(824, 440, 12, 12);
  // les grandes portes : elles s'ouvrent quand Ismae approche
  const portes = { ouvert: 0, voulu: 0, sortY: 452.5, solide: { x: 776, y: 440, w: 48, h: 12 },
    update(dt, J) {
      if (!this.voulu && Math.hypot(J.joueur.x - 800, J.joueur.y - 460) < 70) { this.voulu = 1; Musique.porte(); }
      this.ouvert = Math.min(1, this.ouvert + (this.voulu ? dt * 0.8 : 0));
      if (this.ouvert > 0.8 && C.solides.includes(this.solide)) C.solides.splice(C.solides.indexOf(this.solide), 1);
    },
    draw(g) {
      const w = Math.round(24 * (1 - this.ouvert * 0.85));
      for (const s of [-1, 1]) {
        const x = s < 0 ? 776 : 824 - w;
        g.fillStyle = '#4a2e1c'; g.fillRect(x, 410, w, 42);
        g.fillStyle = '#6a4428'; for (let k = 1; k < w; k += 4) g.fillRect(x + k, 411, 2, 40);
        g.fillStyle = '#e8b54a'; g.fillRect(x, 420, w, 1); g.fillRect(x, 440, w, 1);
      }
    } };
  C.solides.push(portes.solide);
  C.dynamiques.push(portes);
  C.zone(776, 440, 48, 14, 'portesChateau');
  // bannières sur le pont
  C.dessusImg(Foret.fanions(120, 10, ['#6a3a8a', '#4f9a7a', '#e8b54a']), 740, 444);

  // ---------------------------------------------------------------- les maisons du village
  const maisons = [];
  const rangee = (x0, base, defs) => {
    let x = x0;
    for (const d of defs) {
      if (d.saut) { x += d.saut; continue; }
      const m = A.maison(d.seed, d), cx = x + m.largeur / 2;
      C.objet(m, cx, base, {});
      C.solide(cx - m.mur / 2, d.fond ?? base - 26, m.mur, base - (d.fond ?? base - 26));
      m.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(cx - m.ax + lx, base - m.ay + ly, rr, k));
      m.ampoules.forEach(([bx, by]) => C.scintille.push([cx - m.ax + bx, base - m.ay + by]));
      if (m.fumee) C.fumees.push({ x: cx - m.ax + m.fumee[0], y: base - m.ay + m.fumee[1], t: r() * 2 });
      C.zone(cx - 8, base - 6, 16, 10, 'maisonArendelle');
      for (let k = 0; k < 4; k++) O.rect(cx - m.mur / 2 - 2, base + k, m.mur + 4, 1, '#000'); // ombre au pied de la façade
      maisons.push({ x: cx, y: base });
      x += m.largeur + 4;
    }
  };
  rangee(452, 600, [
    { seed: 11, w: 62, style: 'long', couleur: '#a8343a', fond: 508 }, { seed: 12, w: 56, style: 'pignon', couleur: '#d8a838', fond: 508, boutique: 'bageri' },
    { seed: 13, w: 64, style: 'long', couleur: '#3a6aa8', fond: 508 }, { seed: 14, w: 50, style: 'pignon', couleur: '#4f8a5a', fond: 508 },
    { saut: 72 },
    { seed: 15, w: 56, style: 'pignon', couleur: '#c86a3a', fond: 508, boutique: 'sjokolade' }, { seed: 16, w: 62, style: 'long', couleur: '#8a4a8a', fond: 508 },
    { seed: 17, w: 54, style: 'pignon', couleur: '#2f7a8a', fond: 508, boutique: 'strikk' }, { seed: 18, w: 60, style: 'long', couleur: '#e8d8b8', fond: 508 },
  ]);
  rangee(452, 830, [{ seed: 21, w: 66, style: 'pignon', couleur: '#3a6aa8', etages: 3, boutique: 'leker' }, { seed: 22, w: 66, style: 'long', couleur: '#d8a838', etages: 3 }]);
  rangee(986, 830, [{ seed: 23, w: 66, style: 'long', couleur: '#4f8a5a', etages: 3, boutique: 'kafe' }, { seed: 24, w: 56, style: 'pignon', couleur: '#a8343a', etages: 3 }]);
  rangee(452, 1000, [{ seed: 25, w: 60, style: 'long', couleur: '#8a4a8a' }]);
  rangee(646, 960, [{ seed: 27, w: 60, style: 'pignon', couleur: '#e8d8b8', boutique: 'bageri' }]);
  rangee(852, 960, [{ seed: 28, w: 62, style: 'long', couleur: '#2f7a8a' }, { seed: 26, w: 64, style: 'pignon', couleur: '#c86a3a', etages: 3 }, { seed: 29, w: 56, style: 'long', couleur: '#d8a838' }]);
  // la grand-rue jusqu'à l'entrée de la ville : maisons des deux côtés
  rangee(650, 1110, [{ seed: 31, w: 58, style: 'long', couleur: '#4f8a5a' }]);
  rangee(852, 1110, [{ seed: 32, w: 60, style: 'pignon', couleur: '#8a4a8a', boutique: 'sjokolade' }, { seed: 33, w: 54, style: 'long', couleur: '#3a6aa8' }]);
  for (const [x, y] of [[742, 1016], [846, 1020], [742, 1150], [858, 1150]]) C.objet(Objets.pot(x, 'sapin'), x, y, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  // le petit mobilier : bancs, bûches, tonneaux, boîte aux lettres, bannières, statue
  const mobilier = [
    [A.banc(), 560, 640, [-13, -3, 26, 4], 'banc'], [A.banc(), 1040, 640, [-13, -3, 26, 4], 'banc'], [A.banc(), 612, 880, [-13, -3, 26, 4], 'banc'],
    [A.buches(), 540, 612, [-12, -3, 24, 4], 'buches'], [A.buches(), 1100, 842, [-12, -3, 24, 4], 'buches'], [A.buches(), 620, 972, [-12, -3, 24, 4], 'buches'],
    [A.tonneaux(), 1150, 612, [-12, -3, 24, 4], null], [A.tonneaux(), 960, 840, [-12, -3, 24, 4], null],
    [A.boiteLettres(), 902, 614, [-3, -2, 6, 3], 'boiteLettres'], [A.boiteLettres(), 728, 974, [-3, -2, 6, 3], 'boiteLettres'],
    [A.statue(), 1000, 780, [-12, -10, 24, 11], 'statue'],
  ];
  for (const [obj, x, y, sol, texte] of mobilier) C.objet(obj, x, y, { solide: sol, ombre: [Math.max(4, obj.img.width / 2 - 2), 3], texte, zw: Math.max(16, obj.img.width) });
  // la grande place : un grand réverbère à chaque coin, symétriques autour du sapin, bannière vers l'extérieur
  for (const [x, y, cote] of [[648, 652, -1], [952, 652, 1], [648, 822, -1], [952, 822, 1]]) C.objet(A.lampadaireBanniere(cote), x, y, { solide: [-2, -3, 5, 4], rayon: 66 });
  // guirlandes lumineuses en travers de la grand-rue, tendues entre deux réverbères et accrochées sous la lanterne
  // ([x du premier réverbère, pied, x du second])
  for (const [x1, base, x2] of [[744, 990, 856], [744, 1060, 856]]) {
    const x = x1 + 1, y = base - 34, gl = Objets.guirlande(x2 - x1 - 2, 7);
    C.dessusImg(gl.img, x, y); gl.bulbs.forEach(([bx, by]) => C.scintille.push([x + bx, y + by]));
  }

  // ---------------------------------------------------------------- la grande place : sapin, marché de Noël, puits
  const sapin = Objets.grandSapin(12);
  C.objet(sapin, 800, 700, { solide: [-8, -4, 16, 5], ombre: [18, 5], lumiere: true, rayon: 80, k: 'xmas' });
  C.zone(786, 694, 28, 12, 'sapinPlace');
  const etal = (type, x, y, c1, c2, texte) => {
    const e = A.etal(type, c1, c2);
    C.objet(e, x, y, { solide: [-22, -14, 44, 14] });
    e.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(x - e.ax + lx, y - e.ay + ly, rr, k));
    C.zone(x - 18, y - 4, 36, 10, texte);
  };
  etal('chocolat', 690, 650, '#c8343a', '#f4efe6', 'etalChocolat');
  etal('tricots', 910, 650, '#3a6aa8', '#f4efe6', 'etalTricots');
  etal('legumes', 690, 800, '#4f8a5a', '#f4efe6', 'etalLegumes');
  etal('pains', 910, 800, '#d8a838', '#7a2a2a', 'etalPains');
  etal('poisson', 660, 724, '#2f7a8a', '#f4efe6', 'etalPoisson');
  C.objet(A.puits(), 1000, 716, { solide: [-12, -8, 24, 9], texte: 'puitsGele', zw: 24 });
  for (const [x, y] of [[520, 618], [1080, 618], [744, 990], [856, 990], [744, 1060], [856, 1060], [1180, 880], [1260, 920]])
    C.objet(A.lampadaire(), x, y, { solide: [-2, -3, 5, 4], rayon: 58 });
  C.objet(A.tasNeige(34), 1150, 1030, { solide: [-14, -6, 28, 6] });
  C.objet(A.tasNeige(26), 560, 760, { solide: [-10, -4, 20, 5] });

  // ---------------------------------------------------------------- la colline aux luges (sud-ouest)
  C.objet(A.bonhommeEnfants(), 548, 1034, { solide: [-6, -3, 12, 4], ombre: [7, 2], texte: 'bonhommeEnfants', zw: 18 });
  C.objet(A.luge(), 598, 1084, { solide: [-9, -3, 18, 4], texte: 'lugeRouge', zw: 20 });
  for (let k = 0; k < 4; k++) Objets.line(P, 470 + k * 30, 1010 + k * 8, 520 + k * 30, 1120, '#c8d4e6'); // traces de luges
  C.objet(A.palissade(140), 470, 1132, { solide: [0, -3, 140, 3] });
  // le ponton sur le fjord, sa lanterne et sa barque prise dans la glace
  for (let x = 330; x < QX; x += 4) { P.rect(x, 768, 3, 22, r.pick(['#8a5a32', '#7a4a2a', '#9a6a3a'])); P.hline(x, 768, 3, '#a8743e'); P.px(x + 1, 768 + r.int(20), '#eef3fb'); }
  P.hline(330, 790, QX - 330, '#3a2618'); for (const x of [332, 360, 390]) { P.rect(x, 790, 3, 6, '#4a3020'); }
  C.objet(A.lampadaire(), 336, 772, { solide: [-2, -3, 5, 4], rayon: 50 });
  C.objet(Objets.barque(), 370, 812, { solide: [-18, -4, 36, 6] });
  for (const y of [560, 680, 880, 1000]) C.objet(A.bitte(), QX + 18, y, { solide: [-3, -2, 6, 3] });

  // ---------------------------------------------------------------- la forêt de sapins, la clairière des trolls (est)
  const SAPINS = [0, 1, 2, 3].map((k) => Foret.sapin(500 + k, 2 + (k % 2)));
  const clair = (x, y, rx, ry) => ((x - 1400) / rx) ** 2 + ((y - 560) / ry) ** 2 < 1;
  const distSentier = (x, y) => Math.min(...SENTIERS.map((s) => Math.min(...s.pts.slice(1).map(([x1, y1], k) => {
    const [x0, y0] = s.pts[k], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(x - x0 - dx * t, y - y0 - dy * t);
  }))));
  const places = [];
  const planter = (x, y, rayon = 30) => {
    if (places.some(([a, b]) => Math.hypot(a - x, b - y) < rayon)) return;
    places.push([x, y]);
    C.objet(r.pick(SAPINS), x, y, { solide: [-4, -4, 8, 5] });
    O.ellipse(x + 4, y - 3, 16, 5, '#000');
  };
  for (let k = 0; k < 900 && places.length < 80; k++) {
    const x = 1190 + r.int(400), y = 230 + r.int(640);
    if (clair(x, y, 120, 90) || distSentier(x, y) < 30) continue;
    if (x < 1380 && y < 360) continue; // le comptoir d'Oaken
    planter(x, y, 36);
  }
  // une rangée de sapins au pied des montagnes et quelques-uns au bord du lac
  for (let x = 450; x < W; x += 34 + r.int(16)) { if (x > 560 && x < 1040) continue; planter(x, 212 + r.int(14), 30); }
  for (const [x, y] of [[460, 260], [470, 380], [460, 470], [430, 1112], [520, 1150], [1060, 1120], [1180, 1160], [430, 1150]]) planter(x, y, 24);
  for (let k = 0; k < 40; k++) { const a = r() * 6.28, d = 60 + r.int(40); P.px(1400 + Math.cos(a) * d * 1.3, 560 + Math.sin(a) * d * 0.9, '#6a8a6a'); }
  C.solide(W - 8, HAUT, 8, H - HAUT - 70);

  // ---------------------------------------------------------------- le comptoir d'Oaken
  const oaken = A.comptoirOaken();
  C.objet(oaken, 1290, 330, { solide: [-62, -58, 124, 58] });
  oaken.lumieres.forEach(([x, y, rr, k]) => C.lumiere(1290 - oaken.ax + x, 330 - oaken.ay + y, rr, k));
  C.fumees.push({ x: 1290 - oaken.ax + oaken.fumee[0], y: 330 - oaken.ay + oaken.fumee[1], t: 0 });
  C.zone(1250, 324, 30, 10, 'comptoirOaken');
  C.porte(1282, 322, 16, 14, 'oaken', 'entree', 'up');
  C.arrivees.devantOaken = { x: 1290, y: 348, dir: 'down' };

  // ---------------------------------------------------------------- l'écurie de Kristoff et Sven (sud-est)
  const ec = A.ecurie();
  C.objet(ec, 1360, 1010, { solide: [-71, -50, 142, 50] });
  ec.lumieres.forEach(([x, y, rr, k]) => C.lumiere(1360 - ec.ax + x, 1010 - ec.ay + y, rr, k));
  C.zone(1338, 1004, 44, 10, 'ecurie');
  C.objet(A.traineau(), 1520, 1000, { solide: [-24, -8, 50, 9], texte: 'traineau', zw: 44 });
  C.objet(A.blocsGlace(), 1222, 1000, { solide: [-18, -8, 36, 9], texte: 'blocsGlace', zw: 34 });
  for (let k = 0; k < 60; k++) P.px(1300 + r.int(160), 1012 + r.int(50), r.pick(['#d8b860', '#b89a48']));

  // ---------------------------------------------------------------- l'arrêt de bus, à la sortie d'Arendelle
  const bus = A.arretBus();
  C.objet(bus, 1520, 1150, { solide: [-20, -8, 52, 9] });
  bus.lumieres.forEach(([x, y, rr, k]) => C.lumiere(1520 - bus.ax + x, 1150 - bus.ay + y, rr, k));

  // ---------------------------------------------------------------- l'arrivée (sud)
  C.objet(A.pancarte(['ARENDELLE', 'BIENVENUE']), 852, 1140, { solide: [-2, -2, 4, 3], texte: 'bienvenue', zw: 20 });
  C.arrivees.entree = { x: 800, y: 1150, dir: 'up' };
  C.arrivees.arret = { x: 1486, y: 1162, dir: 'right' };
  C.porte(770, 1188, 60, 12, 'arendelle', 'entree', 'down');
  C.portes[C.portes.length - 1].condition = () => { Jeu.dire('sortieArendelle'); Jeu.joueur.y -= 8; return false; };
  // secret : le gant d'Elsa, au bord du canal
  C.dynamiques.push({ sortY: 520, draw(g) { g.fillStyle = '#9ad0f0'; g.fillRect(742, 516, 4, 3); g.fillRect(746, 517, 2, 1); g.fillStyle = '#ffffff'; g.fillRect(742, 516, 1, 1); } });
  C.zone(736, 510, 16, 12, 'gantElsa');

  // ---------------------------------------------------------------- les traces de pas dans la neige
  const pas = [];
  let dernier = null;
  C.dynamiques.push({
    sortY: -1e9,
    update(dt, J) {
      const p = J.joueur;
      for (const q of pas) q.t += dt;
      while (pas.length && pas[0].t > 9) pas.shift();
      if (J.carte !== C || J.surGlace(p) || !p.moving) return;
      if (!dernier || Math.hypot(p.x - dernier.x, p.y - dernier.y) > 6) { dernier = { x: p.x, y: p.y }; pas.push({ x: Math.round(p.x) + (pas.length % 2 ? 2 : -2), y: Math.round(p.y), t: 0 }); }
    },
    draw(g) {
      for (const q of pas) { g.globalAlpha = Math.max(0, 0.55 - q.t / 16); g.fillStyle = '#9aaac8'; g.fillRect(q.x, q.y - 1, 2, 2); }
      g.globalAlpha = 1;
    },
  });

  // ---------------------------------------------------------------- les habitants
  const AP = CONFIG.arendelle.persos, NA = Neige;
  const rep = (id) => (J) => EpreuveNeige.repliques(id, J);
  const perso = (id, o) => { const p = new Entites.Perso(Object.assign({ id, dialogue: rep(o.repliques || id) }, o)); C.pnj.push(p); return p; };
  const passant = (id, o) => { const p = new Entites.Passant(Object.assign({ id, dialogue: rep(o.repliques || id) }, o)); C.pnj.push(p); return p; };
  const figurant = (id, o) => { const f = new Betes.Figurant(Object.assign({ id, dialogue: rep(o.repliques || id) }, o)); C.pnj.push(f); return f; };
  const humain = (nom) => Object.assign({}, AP[nom], { modele: NA.MODELES[nom] });
  // Olaf (il arrive pendant la scène d'accueil), Elsa (à la fin), Anna qui se promène
  const olaf = perso('olaf', { spr: NA.olaf(), x: -60, y: -60, visible: false, vitesse: 50, dialogue: (J) => EpreuveNeige.parlerOlaf(J) });
  const elsa = perso('elsa', { cfg: humain('elsa'), x: -60, y: -60, visible: false });
  const anna = passant('anna', { cfg: humain('anna'), x: 760, y: 860, vitesse: 22, dialogue: (J) => EpreuveNeige.parlerAnna(J),
    chemin: [{ x: 760, y: 860, pause: 2, regard: 'down' }, { x: 640, y: 862 }, { x: 560, y: 862, pause: 2.5, regard: 'up' }, { x: 640, y: 862 },
      { x: 760, y: 862 }, { x: 760, y: 760 }, { x: 740, y: 700, pause: 3, regard: 'right' }, { x: 760, y: 760 }, { x: 860, y: 862 }, { x: 1000, y: 862, pause: 2 }, { x: 860, y: 862 }] });
  // Kristoff et Sven, à l'écurie
  const kristoff = perso('kristoff', { cfg: humain('kristoff'), x: 1268, y: 1046, dir: 'right' });
  const sven = perso('sven', { spr: NA.sven(), x: 1452, y: 1052, dir: 'left', fixe: true, ombreR: 10, dialogue: (J) => EpreuveNeige.parlerSven(J) });
  // les gardes du château, le duc de Weselton
  perso('garde1', { cfg: humain('garde'), x: 786, y: 470, dir: 'down', fixe: true, repliques: 'gardeA' });
  perso('garde2', { cfg: humain('garde'), x: 814, y: 470, dir: 'down', fixe: true, repliques: 'gardeA' });
  Entites.portraits.gardeA = C.pnj[C.pnj.length - 1].spr.down.idle;
  passant('duc', { cfg: { peau: '#f0c8b0', cheveux: '#c8c4cc', coiffure: 'rase', barbe: 'courte', couleurBarbe: '#d8d4dc', lunettes: true, yeux: '#2a1d2e', veste: '#8a8494', echarpe: '#c8343a', pantalon: '#3a3440', chaussures: '#1d1a24' },
    x: 500, y: 622, vitesse: 18, chemin: [{ x: 500, y: 622, pause: 2 }, { x: 740, y: 622 }, { x: 740, y: 622, pause: 3, regard: 'down' }, { x: 520, y: 622 }] });
  // au marché, au bord du lac, sur la colline
  passant('marchand', { cfg: { peau: '#d8a07a', cheveux: '#8a5a3a', coiffure: 'court', barbe: 'pleine', couleurBarbe: '#8a5a3a', yeux: '#2a1d2e', chapeau: 'bonnet', couleurChapeau: '#c8343a', ruban: '#f4efe6', fleur: '#ffffff', veste: '#4f6a8a', echarpe: '#f2c230', pantalon: '#3a3440', chaussures: '#2a2026' },
    x: 690, y: 666, regardeDefaut: 'down' });
  passant('villageois', { cfg: { peau: '#f2cdb0', cheveux: '#e8c870', coiffure: 'chignon', barbe: 'aucune', yeux: '#3a5a8a', chapeau: 'bonnet', couleurChapeau: '#3a6aa8', ruban: '#ffffff', fleur: '#ffffff', veste: '#a8343a', echarpe: '#f4efe6', coupe: 'robe', pantalon: '#3a3a6a', chaussures: '#2a2026' },
    x: 900, y: 760, vitesse: 16, chemin: [{ x: 900, y: 760, pause: 3 }, { x: 1040, y: 760 }, { x: 1080, y: 640, pause: 2 }, { x: 960, y: 640 }] });
  passant('patineuse1', { cfg: { peau: '#f0c4a4', cheveux: '#5a3424', coiffure: 'chignon', barbe: 'aucune', yeux: '#2a1d2e', chapeau: 'bonnet', couleurChapeau: '#e86a9a', ruban: '#ffffff', fleur: '#ffffff', veste: '#f4efe6', echarpe: '#e86a9a', coupe: 'robe', pantalon: '#3a6aa8', chaussures: '#f4efe6' },
    x: 200, y: 560, vitesse: 34, repliques: 'patineuse', bloquant: false, chemin: [{ x: 120, y: 520 }, { x: 260, y: 470 }, { x: 360, y: 560 }, { x: 260, y: 640 }, { x: 120, y: 600 }] });
  passant('patineuse2', { cfg: { peau: '#c48d6c', cheveux: '#2a1e1a', coiffure: 'boucles', barbe: 'aucune', yeux: '#2a1d2e', chapeau: 'bonnet', couleurChapeau: '#4f8a5a', ruban: '#f2c230', fleur: '#f2c230', veste: '#2f7a8a', echarpe: '#f2c230', pantalon: '#2a2a3a', chaussures: '#f4efe6' },
    x: 300, y: 860, vitesse: 30, repliques: 'patineuse', bloquant: false, chemin: [{ x: 300, y: 860 }, { x: 160, y: 800 }, { x: 90, y: 880 }, { x: 200, y: 940 }, { x: 330, y: 920 }] });
  Entites.portraits.patineuse = C.pnj[C.pnj.length - 1].spr.down.idle;
  passant('pecheur', { cfg: { peau: '#d8a07a', cheveux: '#6a6a74', coiffure: 'court', barbe: 'pleine', couleurBarbe: '#c8c4cc', yeux: '#2a1d2e', chapeau: 'bonnet', couleurChapeau: '#5a4a3a', ruban: '#c8343a', fleur: '#5a4a3a', veste: '#5a6a4a', echarpe: '#c9483b', pantalon: '#3a3440', chaussures: '#2a2026' },
    x: 246, y: 958, regardeDefaut: 'left' });
  CONFIG.arendelle.enfants.forEach((e, k) => figurant('enfant' + k, { spr: NA.enfant(e), x: [508, 568, 612][k], y: [1010, 1100, 1046][k], repliques: 'enfant' }));
  Entites.portraits.enfant = C.pnj[C.pnj.length - 1].spr.idle;
  // les trolls de la clairière : des rochers… qui se réveillent quand on s'approche
  const trolls = [[1478, 502], [1500, 566], [1452, 632]].map(([x, y], k) => {
    const rocher = A.rocher(40 + k, 18), t = NA.troll(k + 3);
    const f = figurant('troll' + k, { spr: { idle: rocher.img, blink: rocher.img, joie: rocher.img }, x, y, repliques: 'troll', sansOmbre: true });
    f.troll = t; f.endormi = true;
    const parler = f.dialogue;
    f.dialogue = (J) => { if (f.endormi) { f.endormi = false; f.spr = t; f.joie = 1.2; Musique.miaou(0.6, 0.06); return 'rocherTroll'; } return parler(J); };
    return f;
  });
  Entites.portraits.troll = trolls[0].troll.idle;

  C.neige3 = {
    olaf, elsa, anna, kristoff, sven, trolls,
    accueil: { x: 800, y: 1080 },               // Olaf rencontre Ismae ici, en arrivant
    olafPlace: { x: 880, y: 726 },              // puis il attend sur la grande place
    jack: { x: 846, y: 724 },                   // là où Jack Snow sera construit
    elsaDepart: { x: 800, y: 520 },
    bouleLac: { x: 446, y: 1062 }, bouleClairiere: { x: 1360, y: 600 },
    branches: { x: 1430, y: 1066 },
    // les trois cailloux (et où Olaf dit qu'ils sont)
    cailloux: [{ x: 968, y: 712, ou: 'un à côté du puits, sur la grande place' }, { x: 492, y: 858, ou: 'un dans la rue du sud, devant le magasin de jouets bleu' },
      { x: 1122, y: 1012, ou: 'un sur le chemin de l\'écurie, près du gros tas de neige' }],
    fontaine: { x: 800, y: 404 },
    bus: { x: 1520, y: 1160 },
  };
  C.zone(1500, 1146, 44, 16, null, { dialogue: (J) => EpreuveNeige.arretBus(J) });

  C.onEntree = (J) => EpreuveNeige.entree(J);
  C.apresLumiere = (g, J) => A.dessinerPaillettes(g, J); // les paillettes sur les objets à trouver
  C.finaliser(0.22);
  return C;
});
