// =====================================================================
//  persos-resto.js — Rémy et les dessins du restaurant (épreuve 5).
//
//  · Rémy, le petit rat cuisinier : une grille faite main pour la carte (de face
//    et de profil), et un grand Rémy dessiné à la volée pour le mini-jeu du caramel,
//    avec ses expressions (content, inquiet, panique, joie, goûte, tousse…).
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

  // ------------------------------------------------------------ le grand Rémy du mini-jeu (dessiné à la volée, ~44 px de haut)
  // pose : 'neutre' | 'parle' | 'content' | 'inquiet' | 'panique' | 'joie' | 'goute' | 'tousse' | 'enseveli'
  const cacheGrand = {};
  function grand(pose = 'neutre', anim = 0) {
    const cle = pose + ':' + anim;
    if (cacheGrand[cle]) return cacheGrand[cle];
    const W = 56, H = 54, c = PX.canvas(W, H), P = PX.painter(c), cx = 28, base = 52;
    const line = Objets.line;
    // la queue, derrière
    for (let k = 0; k < 18; k++) { const a = k / 17; P.rect(Math.round(cx + 10 + a * 14), Math.round(base - 4 - Math.sin(a * 3.4 + anim) * 4 - a * 6), 2, 2, PAL.T); }
    // les pieds, le corps, le ventre
    P.ellipse(cx - 6, base - 1, 4, 2, PAL.P); P.ellipse(cx + 6, base - 1, 4, 2, PAL.P);
    P.ellipse(cx, base - 12, 10, 11, PAL.g); P.ellipse(cx - 1, base - 13, 9, 10, PAL.G); P.ellipse(cx, base - 11, 6, 8, PAL.W);
    // les bras (selon la pose), puis la tête par-dessus
    const bras = (x0, y0, x1, y1) => { line(P, x0, y0, x1, y1, PAL.g); line(P, x0 + 1, y0, x1 + 1, y1, PAL.G); P.ellipse(x1, y1, 2, 2, PAL.P); };
    const hy = pose === 'enseveli' ? base - 26 : base - 30; // le centre de la tête
    if (pose === 'panique') { /* les pattes sur la tête : dessinées après la tête */ }
    else if (pose === 'joie') { bras(cx - 8, base - 18, cx - 16, base - 34 - anim); bras(cx + 7, base - 18, cx + 15, base - 34 - anim); }
    else if (pose === 'parle') { bras(cx - 8, base - 17, cx - 15, base - 18 - anim * 3); bras(cx + 7, base - 17, cx + 10, base - 10); }
    else if (pose === 'inquiet') { bras(cx - 8, base - 17, cx - 4, base - 11); bras(cx + 7, base - 17, cx + 3, base - 11); }
    else if (pose === 'goute') { bras(cx - 8, base - 17, cx - 3, hy + 9); bras(cx + 7, base - 17, cx + 9, base - 10); }
    else if (pose === 'tousse') { bras(cx - 8, base - 17, cx - 2, hy + 8); bras(cx + 7, base - 17, cx + 15, base - 22 - anim * 3); }
    else if (pose !== 'enseveli') { bras(cx - 8, base - 17, cx - 11, base - 8); bras(cx + 7, base - 17, cx + 11, base - 8); }
    // les grandes oreilles roses
    for (const s of [-1, 1]) { P.ellipse(cx + s * 10, hy - 9, 6, 6, PAL.g); P.ellipse(cx + s * 10, hy - 9, 5, 5, PAL.G); P.ellipse(cx + s * 10, hy - 8, 3, 3, PAL.P); P.px(cx + s * 10 - 1, hy - 10, '#f6c8cc'); }
    P.ellipse(cx, hy - 2, 11, 7, PAL.g); P.ellipse(cx, hy - 3, 10, 6, PAL.G); P.ellipse(cx - 3, hy - 6, 4, 2, PAL.L);
    // le museau pointu, la grosse truffe rose au bout, les moustaches
    for (let j = 0; j < 9; j++) { const w = Math.round(9 - j * 0.85); P.hline(cx - w, hy + j, w * 2 + 1, j < 2 ? PAL.G : PAL.L); P.px(cx - w, hy + j, PAL.g); P.px(cx + w, hy + j, PAL.g); }
    P.ellipse(cx, hy + 5, 3, 2, PAL.W);
    P.ellipse(cx, hy + 8, 2, 2, PAL.P); P.px(cx - 1, hy + 7, '#ffd0d4');
    // les yeux
    const oeil = (x) => {
      if (pose === 'content' || pose === 'joie') { P.px(x - 1, hy - 2, PAL.E); P.px(x, hy - 3, PAL.E); P.px(x + 1, hy - 2, PAL.E); return; } // yeux plissés de bonheur
      if (pose === 'tousse' || pose === 'goute') { P.hline(x - 1, hy - 2, 3, PAL.E); return; } // yeux fermés
      if (pose === 'panique' || pose === 'enseveli') { P.ellipse(x, hy - 2, 2, 2, '#ffffff'); P.px(x, hy - 2, PAL.E); return; } // yeux ronds
      P.rect(x - 1, hy - 6, 3, 5, PAL.E); P.rect(x, hy - 6, 1, 2, '#ffffff');
      if (pose === 'inquiet') { P.px(x - 2 * Math.sign(x - cx), hy - 6, PAL.g); P.px(x - Math.sign(x - cx), hy - 6, PAL.g); P.px(x, hy - 7, PAL.g); }
    };
    oeil(cx - 5); oeil(cx + 5);
    // la bouche
    if (pose === 'parle') { if (anim % 2) P.ellipse(cx, hy + 10, 2, 1, '#7a3a4a'); else P.hline(cx - 1, hy + 10, 3, '#7a3a4a'); }
    else if (pose === 'panique' || pose === 'enseveli') P.ellipse(cx, hy + 11, 2, 2, '#7a3a4a');
    else if (pose === 'content' || pose === 'joie') { P.hline(cx - 2, hy + 11, 5, '#7a3a4a'); P.px(cx - 3, hy + 10, '#7a3a4a'); P.px(cx + 3, hy + 10, '#7a3a4a'); }
    else if (pose === 'tousse') P.ellipse(cx, hy + 11, 1, 1, '#7a3a4a');
    else P.hline(cx - 1, hy + 10, 3, '#7a3a4a');
    if (pose === 'panique') { bras(cx - 8, base - 18, cx - 9, hy - 5); bras(cx + 7, base - 18, cx + 9, hy - 5); }
    // la cuillère qu'il goûte
    if (pose === 'goute') { line(P, cx - 3, hy + 9, cx - 12, hy + 20, '#a8743e'); P.ellipse(cx - 2, hy + 8, 2, 1, '#c8ccd8'); }
    // les joues roses de joie
    if (pose === 'content' || pose === 'joie') { P.px(cx - 7, hy + 2, '#f0a8b8'); P.px(cx + 7, hy + 2, '#f0a8b8'); }
    // les moustaches, fines, par-dessus le contour
    const o = PX.outline(c, '#1d1626'), Q = PX.painter(o);
    for (const s of [-1, 1]) { line(Q, cx + 1 + s * 4, hy + 7, cx + 1 + s * 14, hy + 4, '#eceef4'); line(Q, cx + 1 + s * 4, hy + 8, cx + 1 + s * 14, hy + 9, '#eceef4'); }
    return (cacheGrand[cle] = o);
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

  // le portrait de la boîte de dialogue : la tête du grand Rémy (oreilles, museau, moustaches)
  let tete = null;
  function portraitRemy() {
    if (tete) return tete;
    tete = PX.canvas(34, 30); tete.getContext('2d').drawImage(grand('neutre'), 11, 4, 34, 30, 0, 0, 34, 30);
    return tete;
  }

  return { Remy, sprites, grand, gusteau, portraitRemy, PAL };
})();
