// =====================================================================
//  persos-resto.js — Rémy et les dessins du restaurant (épreuve 5).
//
//  · Rémy, le petit rat cuisinier : une grille faite main pour la carte (de face
//    et de profil), et le même Rémy en plus grand pour le mini-jeu du caramel,
//    avec toutes ses expressions (content, inquiet, panique, joie, goûte, pleure…).
//  · Le portrait du grand chef Gusteau, accroché dans la salle.
//  Linguini, Colette et les clients utilisent le corps des passants (characters.js) :
//  leurs couleurs sont dans config.js → caramel.persos.
// =====================================================================
'use strict';

const Resto = (() => {
  // pelage gris-bleu, ventre clair, oreilles, truffe, pattes et queue roses
  const PAL = { G: '#8a94ac', g: '#5f6880', L: '#b8c0d0', W: '#d6dae4', P: '#eaa2aa', p: '#c47680', E: '#1d1626', e: '#ffffff', T: '#d8949c' };
  const grille = (rows) => PX.outline(PX.fromRows(rows, PAL), '#1d1626');

  // ------------------------------------------------------------ Rémy sur la carte (13 × 15 de face, 16 × 13 de profil)
  const FACE = ['.gg.......gg.', 'gPPg.....gPPg', 'gPPGg...gGPPg', '.gGGGGGGGGGg.', '.GGLGGGGGGGG.', 'gGEeGGGGGEeGg', 'gGEEGGGGGEEGg',
    '.gGGGGPGGGGg.', '..gGGWWWGGg..', '...gGGGGGg...', '..gGWWWWWGg..', '.PgGWWWWWGgP.', '..gGWWWWWGg..', '..gGGg.gGGg..', '..PP.....PP..'];
  const FACE_YEUX_FERMES = FACE.map((r, j) => (j === 5 || j === 6 ? r.replace(/[Ee]/g, 'G') : r)).map((r, j) => (j === 6 ? 'gGggGGGGGggGg' : r));
  // les pattes levées (il parle avec les mains) et les bras en l'air (joie)
  const FACE_PARLE = FACE.map((r, j) => (j === 10 ? 'P.gGWWWWWGg..' : j === 11 ? '.ggGWWWWWGgP.' : r));
  const FACE_JOIE = FACE.map((r, j) => (j === 9 ? 'P..gGGGGGg..P' : j === 10 ? 'g.gGWWWWWGg.g' : j === 11 ? '.ggGWWWWWGgg.' : r));
  const PROFIL = ['......gg........', '.....gPPg.......', '.....gPPGgg.....', '....gGGGGGGGg...', '....GGGGGGEeGg..', '....GGGGGGGGGGgP',
    '....gGGGGGGGGGg.', '.....gGWWWGgg...', '....gGWWWWGPg...', '....gGWWWWGg....', '....gGWWWWGg....', '.TT.gGGgGGg.....', 'T..TPP..PP......'];
  let petit = null;
  function sprites() {
    if (petit) return petit;
    const droite = { idle: grille(PROFIL), saut: grille(PROFIL) };
    petit = {
      face: grille(FACE), cligne: grille(FACE_YEUX_FERMES), parle: grille(FACE_PARLE), joie: grille(FACE_JOIE),
      droite: droite.idle, gauche: PX.flipX(droite.idle),
    };
    return petit;
  }

  // Rémy posé sur la carte (souvent sur un plan de travail : h = hauteur du meuble)
  class Remy {
    constructor(o) { Object.assign(this, { dir: 'down', h: 0, visible: true, pose: null, t: 0, saut: 0, renifle: 0 }, o); }
    get sortY() { return this.y + 0.5; }
    regarder(x) { this.dir = Math.abs(x - this.x) < 10 ? 'down' : x < this.x ? 'left' : 'right'; }
    update(dt) {
      this.t += dt;
      if (this.saut > 0) this.saut = Math.max(0, this.saut - dt);
      if (this.chemin) {
        const c = this.chemin[0], dx = c.x - this.x, dy = c.y - this.y, d = Math.hypot(dx, dy), v = (this.vitesse || 50) * dt;
        if (d <= v) { this.x = c.x; this.y = c.y; this.chemin.shift(); if (!this.chemin.length) { this.chemin = null; this.dir = 'down'; } }
        else { this.x += (dx / d) * v; this.y += (dy / d) * v; this.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : 'down'; }
      }
    }
    allerVers(points, vitesse) { this.chemin = points.map((p) => ({ x: p.x, y: p.y })); if (vitesse) this.vitesse = vitesse; }
    zone() { return this.visible && this.dialogue ? { x: this.x - 12, y: this.y - 8, w: 24, h: 18, dialogue: (J) => { this.regarder(J.joueur.x); return this.dialogue(J); } } : null; }
    draw(g) {
      if (!this.visible) return;
      const s = sprites(), marche = !!this.chemin;
      let img = this.dir === 'left' ? s.gauche : this.dir === 'right' ? s.droite : this.pose === 'joie' ? s.joie : this.pose === 'parle' && Math.floor(this.t * 4) % 2 ? s.parle : (this.t % 3.2 < 0.15 ? s.cligne : s.face);
      const bond = this.saut > 0 ? Math.round(Math.sin((this.saut / 0.35) * Math.PI) * 4) : marche ? Math.round(Math.abs(Math.sin(this.t * 14))) : 0;
      // il renifle : le museau monte et descend un peu
      const nez = !marche && this.dir === 'down' && this.t % 4 > 3.4 ? Math.round(Math.sin(this.t * 30) * 0.6) : 0;
      Entites.ombre(g, this.x, this.y - this.h, 4);
      g.drawImage(img, Math.round(this.x - img.width / 2), Math.round(this.y - this.h - img.height + 1 - bond + nez));
    }
  }

  // ------------------------------------------------------------ le grand Rémy du mini-jeu (28 × 36, affiché en ×2 ou ×3)
  // Le même dessin que le petit Rémy de la carte, en plus grand : grosse tête ronde, grandes oreilles roses,
  // grands yeux noirs avec leur reflet, truffe rose, tout gris (comme dans le film), petit corps rond, queue rose.
  // Il est construit forme par forme sur une grille de lettres, puis on pose les yeux, la bouche et les bras.
  // pose : 'neutre' | 'parle' | 'content' | 'inquiet' | 'panique' | 'joie' | 'goute' | 'tousse' | 'enseveli'
  //        | 'dort' | 'desespoir' (les pattes sur les yeux) | 'pleure' | 'tire' (il tire de toutes ses forces)
  const GPAL = Object.assign({}, PAL, { h: '#737d96', b: '#f2a8b8', t: '#7ac8ff', m: '#7a3a4a', K: '#a8743e', k: '#d8dce6' });
  const GW = 28, GH = 36;
  const TETE = [[8, 9, 18], [9, 7, 20], [10, 5, 22], [11, 4, 23], [12, 3, 24], [13, 3, 24], [14, 3, 24], [15, 3, 24], [16, 3, 24], [17, 4, 23], [18, 5, 22], [19, 6, 21], [20, 8, 19]];
  const CORPS = [[21, 10, 17], [22, 8, 19], [23, 7, 20], [24, 7, 20], [25, 7, 20], [26, 7, 20], [27, 7, 20], [28, 8, 19], [29, 9, 18]];
  const OEIL = { g: [7, 12], d: [18, 12] }, BOUCHE = [12, 18];
  const YEUX = {
    ouvert: ['EEe', 'EEE', 'EEE', '.E.'], bas: ['...', 'EEe', 'EEE', '.E.'],
    heureux: ['...', '.E.', 'E.E', '...'], ferme: ['...', '...', 'EEE', '...'], rond: ['eee', 'eEe', 'eee', '...'],
    plisseG: ['E..', '.EE', 'E..', '...'], plisseD: ['..E', 'EE.', '..E', '...'], pleure: ['...', '...', 'EEE', '.t.'],
  };
  const BOUCHES = { ferme: ['m..m', '.mm.'], parle: ['.mm.', 'mmmm'], sourire: ['m..m', '.mm.'], grand: ['mmmm', '.mm.'], o: ['.mm.', '.mm.'], triste: ['.mm.', 'm..m'], dents: ['meem', '.mm.'], petit: ['....', '.mm.'] };
  // un bras : une suite de points (plus sombre quand il passe devant le corps), la patte rose au bout
  const BRAS = {
    bas: [[[7, 23], [6, 24], [5, 25], [5, 26]], [[19, 23], [20, 24], [21, 25], [21, 26]]],
    parle: [[[7, 23], [6, 22], [5, 21], [4, 20], [3, 19]], [[19, 23], [20, 24], [21, 25], [21, 26]]],
    joie: [[[7, 22], [6, 21], [5, 20], [4, 19], [3, 18], [2, 17]], [[19, 22], [20, 21], [21, 20], [22, 19], [23, 18], [24, 17]]],
    tete: [[[7, 22], [5, 21], [3, 20], [2, 18], [2, 16], [2, 14]], [[19, 22], [21, 21], [23, 20], [24, 18], [24, 16], [24, 14]]],
    ventre: [[[7, 23], [8, 23], [9, 24], [10, 24], [12, 24]], [[19, 23], [18, 23], [17, 24], [16, 24], [14, 24]]],
    yeux: [[[7, 22], [6, 20], [6, 18], [6, 16], [7, 13]], [[19, 22], [20, 20], [20, 18], [20, 16], [18, 13]]],
    bouche: [[[7, 23], [8, 22], [9, 21], [10, 20], [12, 19]], [[19, 23], [20, 24], [21, 25], [21, 26]]],
    tire: [[[19, 23], [21, 22], [23, 21], [25, 20]], [[18, 24], [20, 23], [22, 22], [24, 21], [25, 21]]],
  };
  const POSES = {
    neutre: ['ouvert', 'ferme', 'bas'], parle: ['ouvert', 'parle', 'parle'], content: ['heureux', 'sourire', 'bas'],
    inquiet: ['bas', 'triste', 'ventre'], panique: ['rond', 'o', 'tete'], joie: ['heureux', 'grand', 'joie'], goute: ['ferme', 'petit', 'bouche'],
    tousse: ['ferme', 'o', 'bouche'], enseveli: ['rond', 'o', null], dort: ['ferme', 'petit', 'bas'], desespoir: ['ferme', 'triste', 'yeux'],
    pleure: ['pleure', 'triste', 'ventre'], tire: ['plisse', 'dents', 'tire'],
  };
  const cacheGrand = {};
  function grand(pose = 'neutre', anim = 0) {
    const cle = pose + ':' + anim;
    if (cacheGrand[cle]) return cacheGrand[cle];
    const gr = Array.from({ length: GH }, () => Array(GW).fill('.'));
    const met = (x, y, c) => { if (y >= 0 && y < GH && x >= 0 && x < GW) gr[y][x] = c; };
    const ligne = (y, a, b, c) => { for (let x = a; x <= b; x++) met(x, y, c); };
    const disque = (cx, cy, r, c) => { for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) met(x, y, c); };
    const tampon = (rows, x, y) => rows.forEach((r, j) => [...r].forEach((c, i) => { if (c !== '.') met(x + i, y + j, c); }));
    // les oreilles (derrière la tête), la tête, le corps
    for (const cx of [6.5, 20.5]) { disque(cx, 8, 4.2, 'G'); disque(cx, 8, 2.9, 'P'); disque(cx + (cx < 13 ? -0.6 : 0.6), 8.6, 1.4, 'p'); }
    for (const [y, a, b] of TETE) ligne(y, a, b, 'G');
    for (const [y, a, b] of CORPS) ligne(y, a, b, 'G');
    // le reflet sur le haut de la tête, l'ombre sous le menton, la truffe rose
    ligne(9, 9, 11, 'L'); ligne(10, 7, 9, 'L'); met(6, 11, 'L'); ligne(21, 10, 17, 'h');
    ligne(16, 13, 14, 'P'); ligne(17, 13, 14, 'p');
    // les pieds
    ligne(30, 8, 12, 'P'); ligne(30, 15, 19, 'P'); ligne(31, 8, 12, 'p'); ligne(31, 15, 19, 'p');
    // les yeux, la bouche, les joues, les sourcils, les larmes
    const [yeux, bouche0, b] = POSES[pose] || POSES.neutre;
    const bouche = pose === 'parle' && !anim ? 'ferme' : bouche0;
    tampon(YEUX[yeux === 'plisse' ? 'plisseG' : yeux], OEIL.g[0], OEIL.g[1]);
    tampon(YEUX[yeux === 'plisse' ? 'plisseD' : yeux], OEIL.d[0], OEIL.d[1]);
    tampon(BOUCHES[bouche], BOUCHE[0], BOUCHE[1]);
    if (pose === 'content' || pose === 'joie') { ligne(16, 5, 6, 'b'); ligne(16, 21, 22, 'b'); }
    if (pose === 'inquiet' || pose === 'pleure') { met(7, 11, 'g'); met(8, 10, 'g'); met(20, 11, 'g'); met(19, 10, 'g'); }
    if (pose === 'tire') { ligne(11, 7, 9, 'g'); ligne(11, 18, 20, 'g'); }
    if (pose === 'pleure') for (const x of [8, 19]) for (let y = 16; y < 19 + anim; y++) met(x, y, 't');
    // les bras
    if (b) for (const pts of BRAS[b]) {
      for (let k = 0; k < pts.length - 1; k++) { const [x, y] = pts[k]; for (const dx of [0, 1]) met(x + dx, y, gr[y] && gr[y][x + dx] === '.' ? 'G' : 'h'); }
      const [px, py] = pts[pts.length - 1]; for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) met(px + dx, py + dy, 'P');
    }
    // la cuillère qu'il goûte
    if (pose === 'goute') { for (let k = 0; k < 7; k++) met(11 - k, 21 + k, 'K'); ligne(19, 11, 13, 'k'); }
    // la queue rose qui ondule, derrière
    const q = anim ? [[18, 29], [19, 30], [20, 30], [21, 30], [22, 29], [23, 28], [24, 27], [24, 26], [25, 25]] : [[18, 29], [19, 30], [20, 31], [21, 31], [22, 31], [23, 30], [24, 29], [25, 28], [25, 27]];
    for (const [x, y] of q) if (gr[y][x] === '.') gr[y][x] = 'T';
    return (cacheGrand[cle] = PX.outline(PX.fromRows(gr.map((r) => r.join('')), GPAL), '#1d1626'));
  }

  // ------------------------------------------------------------ le portrait de Gusteau (un grand chef tout rond, toque et moustache)
  let portrait = null;
  function gusteau() {
    if (portrait) return portrait;
    const c = PX.canvas(34, 40), P = PX.painter(c);
    P.rect(0, 0, 34, 40, '#a8742e'); P.rect(1, 1, 32, 38, '#e8b54a'); P.rect(3, 3, 28, 34, '#7a4a22'); P.rect(4, 4, 26, 32, '#3a5a6a');
    P.vgrad(4, 4, 26, 32, '#4a6a7a', '#2a3a4a');
    // la veste blanche
    P.ellipse(17, 37, 12, 9, '#f2f0ea'); P.vline(17, 30, 6, '#c8c4bc'); P.px(15, 32, '#c8c4bc'); P.px(19, 32, '#c8c4bc');
    // la grosse tête ronde, souriante
    P.ellipse(17, 22, 8, 8, '#f0c8a0'); P.ellipse(13, 24, 2, 1, '#f0a090'); P.ellipse(21, 24, 2, 1, '#f0a090');
    P.px(14, 20, '#1d1626'); P.px(20, 20, '#1d1626'); P.ellipse(17, 23, 2, 1, '#e8a080');
    P.rect(12, 25, 4, 2, '#3a2a24'); P.rect(18, 25, 4, 2, '#3a2a24'); P.px(11, 24, '#3a2a24'); P.px(22, 24, '#3a2a24'); // la moustache
    P.hline(15, 27, 4, '#8a3a3a');
    // la grande toque
    P.rect(11, 12, 12, 4, '#f4f2ec'); P.ellipse(17, 9, 8, 5, '#ffffff'); P.ellipse(12, 10, 3, 3, '#ffffff'); P.ellipse(22, 10, 3, 3, '#ffffff'); P.hline(11, 15, 12, '#c8c4bc');
    // la petite plaque dorée
    P.rect(11, 35, 12, 3, '#e8b54a'); P.hline(12, 36, 10, '#a8742e');
    return (portrait = c);
  }

  // le portrait de la boîte de dialogue : la tête du grand Rémy (oreilles, museau)
  let tete = null;
  function portraitRemy() {
    if (tete) return tete;
    tete = PX.canvas(28, 26); tete.getContext('2d').drawImage(grand('neutre'), 1, 3, 28, 26, 0, 0, 28, 26);
    return tete;
  }

  return { Remy, sprites, grand, gusteau, portraitRemy, PAL };
})();
