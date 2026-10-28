// =====================================================================
//  tir-arc.js — le mini-jeu du tournoi de Sherwood (épreuve 2)
//
//  La cible est vue depuis le pas de tir. Chaque flèche se tire en deux temps, avec A
//  (ou en touchant l'écran, ou avec Espace), pour ne regarder qu'une chose à la fois :
//   1. VISER : le viseur bouge tout seul (la main qui tremble) ; on appuie quand il est au centre.
//   2. LA FORCE : une jauge apparaît à côté de la cible et monte, puis redescend ; on appuie dans le rouge.
//      Dans le rouge, la flèche part exactement là où l'on a visé ; trop fort, elle part trop haut ;
//      pas assez, trop bas (plus on est loin du rouge, plus ça dévie).
//  Points : 10 (centre jaune), 8 (rouge), 6 (bleu), 4 (noir), 2 (blanc), 0 (raté).
//  Cinq flèches ; à chaque tir, la cible s'éloigne un peu, le viseur bouge plus et la zone rouge
//  rétrécit. Il faut battre le score du shérif (CONFIG.tournoi). Après un échec, c'est un peu plus facile.
// =====================================================================
'use strict';

const TirArc = (() => {
  const $ = (id) => document.getElementById(id);
  const line = (...a) => Objets.line(...a);
  // difficulté de chaque flèche : taille de la cible, ampleur et vitesse du viseur,
  // durée d'un aller-retour de la jauge (s), demi-largeur de la zone rouge (part de la jauge)
  const NIVEAUX = [
    { taille: 1.00, amp: 0.58, vit: 0.85, periode: 1.90, rouge: 0.12 },
    { taille: 1.00, amp: 0.67, vit: 0.95, periode: 1.75, rouge: 0.11 },
    { taille: 0.90, amp: 0.77, vit: 1.05, periode: 1.60, rouge: 0.10 },
    { taille: 0.90, amp: 0.86, vit: 1.15, periode: 1.50, rouge: 0.09 },
    { taille: 0.80, amp: 0.96, vit: 1.25, periode: 1.40, rouge: 0.08 },
  ];
  const MARGE = 0.09; // zone orange de part et d'autre du rouge
  let E = null;

  // ------------------------------------------------------------ déroulement
  function lancer(J, o) {
    E = { J, fin: o.fin, aide: o.aide || 0, n: CONFIG.tournoi.fleches, i: -1, score: 0, impacts: [], phase: 'pret', tv: 0, foule: 0, msgT: 0 };
    suivante();
    J.vue = vue;
    document.body.classList.add('tir');
    $('tir').hidden = false;
    message(E.aide ? 'Deuxième chance ! Le vent s\'est calmé.' : null);
    majHud();
  }
  function niveau() {
    const N = NIVEAUX[Math.min(E.i, NIVEAUX.length - 1)], a = Math.min(3, E.aide);
    return { taille: N.taille, amp: Math.max(0.3, N.amp * (1 - 0.14 * a)), vit: N.vit * (1 - 0.1 * a), periode: N.periode * (1 + 0.12 * a), rouge: Math.min(0.2, N.rouge * (1 + 0.3 * a)) };
  }
  function suivante() {
    E.i++; E.phase = 'pret'; E.tv = 0;
    E.N = niveau();
    E.zc = 0.5 + Math.random() * 0.3;
    E.ph = [0, 1, 2, 3].map(() => Math.random() * 6.28);
    E.vise = { x: 0, y: 0 }; E.jauge = 0; E.tir = null;
    majHud(); majAide();
  }
  // la consigne en bas de l'écran change à chaque étape
  function majAide() {
    const doigt = matchMedia('(pointer: coarse)').matches, a = $('tir-aide');
    const etape = E.phase === 'force' || E.phase === 'pause' ? 2 : 1;
    a.hidden = !['pret', 'vise', 'pause', 'force'].includes(E.phase);
    a.textContent = etape === 1
      ? `1. Vise : ${doigt ? 'touche l\'écran' : 'Espace'} quand le viseur est au centre`
      : `2. La force : ${doigt ? 'touche l\'écran' : 'Espace'} quand la jauge est dans le rouge`;
    a.classList.toggle('etape2', etape === 2);
  }
  const points = (x, y) => { const d = Math.hypot(x, y); return d <= 0.2 ? 10 : d <= 0.4 ? 8 : d <= 0.6 ? 6 : d <= 0.8 ? 4 : d <= 1 ? 2 : 0; };

  function action() {
    if (!E) return;
    // 1. on bloque le viseur là où il est ; la jauge de force apparaît
    if (E.phase === 'vise') { E.phase = 'pause'; E.tv = 0; Musique.bip(880, 0.03); majAide(); return; }
    if (E.phase !== 'force') return;
    // 2. on tire
    const d = E.jauge - E.zc, ad = Math.abs(d), hw = E.N.rouge;
    let ex = (Math.random() * 2 - 1) * 0.04, ey = (Math.random() * 2 - 1) * 0.04;
    // trop fort : trop haut ; pas assez : trop bas
    if (ad > hw) { const k = ad - hw; ey += -Math.sign(d) * k * 3; ex += (Math.random() * 2 - 1) * k * 0.9; }
    E.tir = { x: E.vise.x + ex, y: E.vise.y + ey, force: ad <= hw ? 0 : Math.sign(d) };
    E.phase = 'vol'; E.tv = 0;
    Musique.arc();
    $('tir-aide').hidden = true;
  }
  function impact() {
    const pts = points(E.tir.x, E.tir.y);
    E.score += pts;
    E.impacts.push({ x: E.tir.x, y: E.tir.y, pts });
    E.dernier = { pts, x: E.tir.x, y: E.tir.y };
    E.phase = 'impact'; E.tv = 0;
    Musique.impact(pts);
    if (pts >= 8) { Musique.foule(pts === 10 ? 0.9 : 0.55); E.foule = 1.4; } else if (pts === 0) Musique.oh();
    const bravo = { 10: 'En plein dans le mille !', 8: 'Superbe !', 6: 'Pas mal !', 4: 'Un peu à côté…', 2: 'Tout juste dans la cible.', 0: 'Raté !' }[pts];
    const force = E.tir.force > 0 ? ' Trop fort : la flèche est partie trop haut.' : E.tir.force < 0 ? ' Pas assez fort : la flèche est tombée trop bas.' : '';
    message(bravo + (pts < 8 ? force : ''));
    majHud();
  }
  function terminer() {
    E.phase = 'fin'; E.tv = 0;
    const record = CONFIG.tournoi.scoreSherif, gagne = E.score > record;
    message(gagne ? `${E.score} points ! Le shérif est battu !` : `${E.score} points… Il en fallait plus de ${record}.`, true);
    if (gagne) { Musique.foule(1); E.foule = 2.6; } else Musique.oh();
  }
  function fermer() {
    const { J, fin, score } = E;
    J.vue = null; E = null;
    document.body.classList.remove('tir');
    $('tir').hidden = true;
    message(null);
    fin(score);
  }

  function update(dt) {
    if (!E) return;
    E.tv += dt;
    if (E.foule > 0) E.foule -= dt;
    if (E.phase === 'pret' || E.phase === 'vise') {
      // pendant une demi-seconde on ne peut pas viser (l'appui qui ferme un dialogue ne compte pas)
      if (E.phase === 'pret' && E.tv > 0.55) E.phase = 'vise';
      const N = E.N, tau = E.tv * N.vit, [a1, a2, a3, a4] = E.ph;
      E.vise.x = N.amp * (0.65 * Math.sin(1.3 * tau + a1) + 0.35 * Math.sin(2.9 * tau + a2));
      E.vise.y = N.amp * (0.6 * Math.sin(1.7 * tau + a3) + 0.4 * Math.sin(2.3 * tau + a4));
    } else if (E.phase === 'pause') { if (E.tv > 0.3) { E.phase = 'force'; E.tv = 0; } }
    else if (E.phase === 'force') {
      // la jauge part du bas, monte, redescend…
      const f = (E.tv / E.N.periode) % 1;
      E.jauge = f < 0.5 ? f * 2 : 2 - f * 2;
    } else if (E.phase === 'vol') { if (E.tv >= 0.3) impact(); }
    else if (E.phase === 'impact') { if (E.tv > 1.4) { if (E.i + 1 >= E.n) terminer(); else suivante(); } }
    else if (E.phase === 'fin' && E.tv > 2.8) fermer();
  }

  // ------------------------------------------------------------ texte en surimpression (HTML)
  function majHud() {
    if (!E) return;
    $('tir-fleche').textContent = `Flèche ${Math.min(E.i + 1, E.n)}/${E.n}`;
    $('tir-score').textContent = `Score : ${E.score}`;
    $('tir-record').textContent = `Shérif : ${CONFIG.tournoi.scoreSherif}`;
  }
  function message(txt, grand) {
    const m = $('tir-message');
    m.hidden = !txt;
    if (!txt) return;
    m.textContent = txt;
    m.classList.toggle('grand', !!grand);
    m.classList.remove('arrive'); void m.offsetWidth; m.classList.add('arrive');
  }

  // ------------------------------------------------------------ dessin
  // petite police 3 × 5 pour les points (+10…) et le mot FORCE
  const LETTRES = {
    0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['###', '..#', '###', '#..', '###'], 3: ['###', '..#', '.##', '..#', '###'],
    4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '###', '..#', '###'], 6: ['###', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
    8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '###'], '+': ['...', '.#.', '###', '.#.', '...'],
    F: ['###', '#..', '##.', '#..', '#..'], O: ['###', '#.#', '#.#', '#.#', '###'], R: ['##.', '#.#', '##.', '#.#', '#.#'], C: ['###', '#..', '#..', '#..', '###'], E: ['###', '#..', '##.', '#..', '###'],
  };
  function ecrire(P, txt, x, y, col, s = 1, ombre = '#1d1626') {
    const chars = [...String(txt)];
    for (const pass of ombre ? [ombre, col] : [col]) chars.forEach((ch, k) => {
      const g = LETTRES[ch]; if (!g) return;
      g.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') P.rect(x + (k * 4 + i) * s + (pass === ombre ? 1 : 0), y + j * s + (pass === ombre ? 1 : 0), s, s, pass); }));
    });
  }

  // le décor (ciel, forêt au loin, tentes, public, pelouse) ne change pas : on le garde en cache
  const fonds = {};
  function decor(w, h) {
    const cle = w + 'x' + h;
    if (fonds[cle]) return fonds[cle];
    const c = PX.canvas(w, h), P = PX.painter(c), r = PX.rng(31), hz = Math.round(h * 0.42);
    // ciel de fin de journée (comme le soir dans la rue), soleil couchant, premières étoiles
    P.vgrad(0, 0, w, hz, '#3a3a78', '#f2a46e');
    for (let k = 0; k < 6; k++) P.px(r.int(w), 2 + r.int(Math.max(1, hz / 4)), '#fff4d0');
    P.ellipse(Math.round(w * 0.8), hz - 10, 20, 20, '#ffb46e'); P.ellipse(Math.round(w * 0.8), hz - 10, 13, 13, '#ffd8a0');
    for (let k = 0; k < 5; k++) { const x = r.int(w), y = 8 + r.int(Math.max(1, hz / 2)); P.ellipse(x, y, 14 + r.int(10), 2, 'rgba(255,170,190,0.45)'); P.ellipse(x + 6, y - 2, 8, 2, 'rgba(255,200,210,0.45)'); }
    // forêt au loin, en deux rangées
    for (let x = -4; x < w + 8; x += 5) { const hh = 16 + Math.round(Math.sin(x * 0.045) * 5) + r.int(6); P.ellipse(x, hz - hh / 2, 5, hh / 2 + 2, '#5a5a78'); }
    for (let x = -4; x < w + 8; x += 6) { const hh = 10 + Math.round(Math.sin(x * 0.07 + 1) * 4) + r.int(5); P.ellipse(x, hz - hh / 2 + 3, 6, hh / 2 + 2, '#2e4a40'); }
    // pelouse : bandes tondues qui filent vers l'horizon
    P.vgrad(0, hz, w, h - hz, '#6a8e4c', '#3c6232');
    for (let y = hz; y < h; y++) {
      const k = (y - hz) / (h - hz), larg = 6 + k * 70;
      for (let b = -8; b <= 8; b += 2) { const x0 = Math.round(w / 2 + b * larg - larg / 2); P.rect(x0, y, Math.round(larg), 1, 'rgba(255,250,210,0.06)'); }
    }
    // tentes et fanions au loin, de part et d'autre de la cible
    const tente = (x, c1, c2, s) => {
      const y = hz + 2;
      for (let j = 0; j < 8 * s; j++) { const ww = Math.round(1 + j * 1.2); for (let i = -ww; i <= ww; i++) P.px(x + i, y - 16 * s + j, Math.floor((i + 40) / (2 * s)) % 2 ? c1 : c2); }
      P.rect(x - 9 * s, y - 8 * s, 18 * s, 8 * s, c1); for (let i = 0; i < 18 * s; i += 4 * s) P.rect(x - 9 * s + i, y - 8 * s, 2 * s, 8 * s, c2);
      P.rect(x - s, y - 5 * s, 2 * s, 5 * s, '#2a1e2e'); P.vline(x, y - 20 * s, 4 * s, '#3a2618'); P.rect(x + 1, y - 20 * s, 4 * s, 2, c2);
    };
    tente(Math.round(w * 0.2), '#f4efe6', '#c8343a', 1); tente(Math.round(w * 0.82), '#f2c230', '#3a5aa8', 1); tente(Math.round(w * 0.32), '#a8d0f0', '#f4efe6', 1);
    // torches au bord du terrain
    for (const x of [0.26, 0.4, 0.6, 0.74]) { const tx = Math.round(w * x); P.vline(tx, hz - 6, 8, '#3a2618'); P.rect(tx - 1, hz - 9, 3, 3, '#ffb040'); P.px(tx, hz - 10, '#ffe28a'); P.ellipse(tx, hz - 8, 5, 4, 'rgba(255,170,80,0.25)'); }
    // le public dans les gradins, au loin
    for (const [x0, x1] of [[0, Math.round(w * 0.14)], [Math.round(w * 0.88), w]]) {
      P.rect(x0, hz - 6, x1 - x0, 10, '#8a6a46'); P.hline(x0, hz - 6, x1 - x0, '#b08c60');
      for (let x = x0 + 2; x < x1 - 1; x += 3) { P.rect(x, hz - 9 - r.int(2), 2, 3, r.pick(['#c8484a', '#4a7ab8', '#e8b54a', '#f4efe6', '#6aa84a', '#8a5ac8'])); P.px(x, hz - 11, r.pick(['#d8b8a0', '#9a8070', '#e0b060', '#8a5a34'])); }
    }
    // la terre battue du couloir de tir, la ligne de craie
    for (let y = hz; y < h; y++) { const k = (y - hz) / (h - hz), larg = 10 + k * w * 0.42; P.rect(Math.round(w / 2 - larg / 2), y, Math.round(larg), 1, 'rgba(170,130,80,0.22)'); }
    P.rect(0, h - Math.round(h * 0.1), w, 2, 'rgba(255,255,255,0.75)');
    return (fonds[cle] = c);
  }

  // silhouettes du public au premier plan (elles sautent de joie)
  function publicDevant(P, w, h, t) {
    const saute = (k) => (E.foule > 0 ? Math.round(Math.abs(Math.sin(t * 11 + k * 1.3)) * 4) : Math.round(Math.sin(t * 2 + k) * 0.6));
    const ombre = '#21162e', bord = '#3a2a4a';
    const tete = (x, y, type) => {
      if (type === 'lapin') { P.rect(x - 4, y - 16, 2, 9, ombre); P.rect(x + 2, y - 16, 2, 9, ombre); }
      if (type === 'ours') { P.ellipse(x - 5, y - 9, 2, 2, ombre); P.ellipse(x + 5, y - 9, 2, 2, ombre); }
      if (type === 'poule') { P.rect(x - 1, y - 12, 3, 3, '#5a1e2a'); }
      P.ellipse(x, y - 4, 7, 6, ombre); P.ellipse(x, y + 8, 11, 8, ombre); P.hline(x - 5, y - 10, 10, bord);
    };
    [['lapin', 14], ['ours', 34], ['poule', 54]].forEach(([type, x], k) => tete(x, h - 4 - saute(k), type));
    [['lapin', w - 16], ['lapin', w - 38]].forEach(([type, x], k) => tete(x, h - 4 - saute(k + 3), type));
  }

  function draw(g, V, t) {
    if (!E) return;
    const w = V.w, h = V.h, P = PX.painter(g.canvas);
    g.drawImage(decor(w, h), 0, 0);
    const N = E.N, R = Math.round(Math.min(w * 0.5, h) * 0.2 * N.taille), tx = w >> 1, ty = Math.round(h * 0.42);
    const sol = ty + R + Math.round(h * 0.1 * N.taille);
    // la cible sur son trépied
    P.ellipse(tx, sol, Math.round(R * 0.9), 3, 'rgba(20,30,10,0.35)');
    line(P, tx - R * 0.45, ty + R * 0.6, tx - R * 0.85, sol, '#3a2618', 3); line(P, tx + R * 0.45, ty + R * 0.6, tx + R * 0.85, sol, '#3a2618', 3);
    line(P, tx, ty, tx, sol - 2, '#5e4230', 3);
    Foret.anneaux(P, tx, ty, R);
    for (let k = 1; k < 5; k++) { // fines lignes entre les anneaux
      const rr = R * (1 - k / 5);
      for (let a = 0; a < 64; a++) P.px(Math.round(tx + Math.cos(a / 64 * Math.PI * 2) * rr), Math.round(ty + Math.sin(a / 64 * Math.PI * 2) * rr), 'rgba(30,20,40,0.35)');
    }
    // les flèches déjà plantées (on voit leur empennage)
    for (const im of E.impacts) {
      if (Math.hypot(im.x, im.y) > 1.2) continue;
      const ax = Math.round(tx + im.x * R), ay = Math.round(ty + im.y * R);
      P.rect(ax - 1, ay - 1, 3, 3, '#1d1626'); P.px(ax, ay, '#c8a070'); P.px(ax - 2, ay, '#d8323a'); P.px(ax + 2, ay, '#f6f2ea'); P.px(ax, ay - 2, '#d8323a'); P.px(ax, ay + 2, '#f6f2ea');
    }
    const bas = { x: tx + 4, y: h + 6 };
    // le viseur : il clignote pendant la préparation, devient doré une fois bloqué
    const bloque = E.phase === 'pause' || E.phase === 'force';
    if ((E.phase === 'pret' && Math.floor(E.tv * 8) % 2 === 0) || E.phase === 'vise' || bloque) {
      const cx = Math.round(tx + E.vise.x * R), cy = Math.round(ty + E.vise.y * R), clair = bloque ? '#ffd24a' : '#ffffff';
      // la flèche encochée, qui pointe vers le viseur
      line(P, bas.x, bas.y, bas.x + (cx - bas.x) * 0.22, bas.y + (cy - bas.y) * 0.22, '#1d1626', 3);
      line(P, bas.x, bas.y, bas.x + (cx - bas.x) * 0.22, bas.y + (cy - bas.y) * 0.22, '#c8a070', 1);
      P.rect(Math.round(bas.x + (cx - bas.x) * 0.22) - 1, Math.round(bas.y + (cy - bas.y) * 0.22) - 1, 3, 3, '#c9cfda');
      for (let a = 0; a < 40; a++) {
        const c = Math.cos(a / 40 * Math.PI * 2), s = Math.sin(a / 40 * Math.PI * 2);
        P.px(Math.round(cx + c * 7), Math.round(cy + s * 7), '#1d1626'); P.px(Math.round(cx + c * 6), Math.round(cy + s * 6), clair);
      }
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let k = 3; k <= 10; k++) { P.rect(cx + dx * k - (dy ? 1 : 0), cy + dy * k - (dx ? 1 : 0), dy ? 3 : 1, dx ? 3 : 1, '#1d1626'); }
        for (let k = 3; k <= 9; k++) P.px(cx + dx * k, cy + dy * k, clair);
      }
      P.rect(cx - 1, cy - 1, 3, 3, '#1d1626'); P.px(cx, cy, '#ff4a4a');
    }
    // l'arc, tenu à la verticale, et sa corde tirée jusqu'à l'encoche de la flèche
    const haut = h - 74, xh = tx - 16;
    line(P, xh, haut, bas.x, bas.y, 'rgba(246,242,234,0.8)');
    for (let y = haut; y <= h + 6; y++) {
      const k = (y - (h - 32)) / 42, x = Math.round(tx - 16 - 13 * (1 - k * k));
      P.rect(x - 1, y, 5, 1, '#2a1a12'); P.rect(x, y, 2, 1, '#8a5a32'); P.px(x + 2, y, '#b07a44');
    }
    P.rect(tx - 31, h - 38, 6, 12, '#7a1e2a'); P.vline(tx - 31, h - 38, 12, '#a8343a');
    // la flèche en vol, qui rapetisse en s'éloignant
    if (E.phase === 'vol' && E.tir) {
      const p = Math.min(1, E.tv / 0.3), q = 1 - (1 - p) * (1 - p);
      const ex = tx + E.tir.x * R, ey = ty + E.tir.y * R, x = bas.x + (ex - bas.x) * q, y = bas.y + (ey - bas.y) * q;
      const l = 30 * (1 - q) + 3, d = Math.hypot(ex - bas.x, ey - bas.y) || 1, ux = (ex - bas.x) / d, uy = (ey - bas.y) / d;
      line(P, x - ux * l, y - uy * l, x, y, '#1d1626', p < 0.5 ? 3 : 1); line(P, x - ux * l, y - uy * l, x, y, '#c8a070', 1);
      P.px(Math.round(x - ux * l), Math.round(y - uy * l), '#d8323a');
    }
    // les points gagnés, qui s'envolent
    if (E.phase === 'impact' && E.dernier && E.dernier.pts > 0) {
      const d = E.dernier, px = Math.round(tx + d.x * R) + 6, py = Math.round(ty + d.y * R) - 10 - Math.round(E.tv * 10);
      ecrire(P, '+' + d.pts, px, py, d.pts === 10 ? '#ffd24a' : d.pts >= 8 ? '#ff8a7a' : '#ffffff', 2);
    }
    publicDevant(P, w, h, t);
    // la jauge de force (étape 2), juste à droite de la cible : on garde les yeux au même endroit
    if (!bloque) return;
    const gw = 10, gh = Math.max(2 * R + 8, Math.round(h * 0.4)), gx = tx + R + 16, gy = ty - (gh >> 1);
    const yDe = (v) => gy + Math.round((1 - v) * gh);
    P.rect(gx - 3, gy - 3, gw + 6, gh + 6, '#1d1626'); P.rect(gx - 2, gy - 2, gw + 4, gh + 4, '#c8a070'); P.rect(gx, gy, gw, gh, '#3a3050');
    const hw = N.rouge;
    const zone = (a, b, col) => { const y0 = yDe(Math.min(1, b)), y1 = yDe(Math.max(0, a)); P.rect(gx, y0, gw, y1 - y0, col); };
    zone(E.zc - hw - MARGE, E.zc + hw + MARGE, '#e8a03a');
    zone(E.zc - hw, E.zc + hw, '#d8323a');
    P.hline(gx, yDe(E.zc), gw, '#ff9a8a');
    for (let k = 1; k < 10; k++) P.hline(gx, gy + Math.round(gh * k / 10), 2, 'rgba(255,255,255,0.25)');
    const cy = yDe(E.jauge);
    P.rect(gx - 5, cy - 1, gw + 10, 3, '#1d1626'); P.rect(gx - 4, cy, gw + 8, 1, '#ffffff');
    for (let k = 0; k < 4; k++) P.vline(gx + gw + 5 + k, cy - 3 + k, 7 - k * 2, '#ffffff');
    P.rect(gx - 4, gy - 13, 22, 8, '#1d1626'); ecrire(P, 'FORCE', gx - 3, gy - 12, '#f6ead2', 1, null);
  }

  const vue = { update, draw, action };
  return { lancer, NIVEAUX, points, en: () => !!E, etat: () => E };
})();
