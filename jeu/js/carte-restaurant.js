// =====================================================================
//  carte-restaurant.js — le restaurant du chef Gusteau, à Montaigu (épreuve 5)
//
//  · 'restaurant' : la salle. Parquet, papier peint bordeaux et doré, la cheminée,
//    le portrait de Gusteau, le sapin, les tables dressées aux chandelles, Anton Ego
//    qui attend son dessert, Linguini qui sert… en patins à roulettes.
//    Au fond à droite, les portes battantes de la cuisine.
//  · 'cuisine' : carrelage noir et blanc, faïence blanche, casseroles en cuivre,
//    le grand fourneau qui fume, les légumes de la ratatouille, les sacs de sucre,
//    Colette… et Rémy, debout sur son plan de travail.
// =====================================================================
'use strict';

const RestoDecor = (() => {
  function mk(w, h) { const c = PX.canvas(w, h); return { c, P: PX.painter(c) }; }
  const OR = '#e8b54a';
  // une table ronde dressée : nappe blanche, chemin de table rouge, chandelier, assiettes dorées
  function table(seed) {
    const r = PX.rng(seed), { c, P } = mk(36, 34), base = 33;
    P.ellipse(18, 22, 16, 6, '#d8d4cc'); P.rect(2, 22, 33, 9, '#e8e4dc'); for (let x = 4; x < 34; x += 5) P.vline(x, 23, 8, '#d0ccc4'); P.hline(2, 30, 33, '#c8c4bc');
    P.ellipse(18, 21, 16, 6, '#f6f4ee'); P.ellipse(18, 21, 14, 4, '#ffffff');
    P.rect(16, 15, 4, 13, '#a8343a'); P.hline(16, 27, 4, '#7a2a2a');
    for (const [px, py] of [[8, 20], [28, 20], [12, 24], [24, 24]]) { P.ellipse(px, py, 3, 1, OR); P.ellipse(px, py, 2, 1, '#ffffff'); }
    for (const [gx, gy] of [[5, 18], [31, 18]]) { P.rect(gx, gy - 3, 2, 3, '#bfe0f0'); P.px(gx, gy - 3, '#ffffff'); }
    // le chandelier à trois branches et ses grosses bougies
    P.rect(17, 12, 2, 9, OR); P.ellipse(18, 20, 3, 1, OR); P.hline(12, 12, 12, OR); P.px(12, 11, OR); P.px(23, 11, OR);
    for (const [x, y] of [[12, 6], [17, 3], [22, 6]]) { P.rect(x, y, 2, 6, '#f6f2e6'); P.vline(x + 1, y, 6, '#d8d0c0'); P.px(x, y - 1, '#ffd27a'); P.px(x, y - 2, '#fff4b0'); P.px(x + 1, y - 1, '#f08a24'); }
    P.rect(4, 31, 2, 3, '#5a3a24'); P.rect(30, 31, 2, 3, '#5a3a24');
    return { img: PX.outline(c, 'auto'), ax: 18, ay: base, flammes: [[12, 4], [17, 1], [22, 4]] };
  }
  function chaise(face) {
    const { c, P } = mk(10, 16), base = 15;
    if (face) { P.rect(1, 0, 8, 9, '#5a3424'); P.rect(2, 1, 6, 6, '#8a2a2a'); P.rect(1, 9, 8, 3, '#6a4428'); }
    else { P.rect(1, 8, 8, 3, '#8a2a2a'); P.hline(1, 8, 8, '#a8343a'); }
    P.vline(1, 11, 5, '#4a2a1c'); P.vline(8, 11, 5, '#4a2a1c');
    return { img: PX.outline(c, 'auto'), ax: 5, ay: base };
  }
  // un plan de travail en inox ; contenu : 'legumes' | 'fromages' | 'planche' | 'sucre' | 'vide'
  function plan(w, contenu, seed = 1) {
    const r = PX.rng(seed), H = 30, { c, P } = mk(w, H), base = H - 1, top = 10;
    P.rect(0, top, w, 6, '#c8ccd8'); P.hline(0, top, w, '#eef0f6'); P.hline(0, top + 5, w, '#8a90a0');
    P.rect(1, top + 6, w - 2, H - top - 9, '#a8aebc'); for (let x = 3; x < w - 2; x += 8) P.vline(x, top + 7, H - top - 10, '#9aa0b0');
    P.rect(2, H - 3, 3, 3, '#5a6070'); P.rect(w - 5, H - 3, 3, 3, '#5a6070');
    const L = [];
    if (contenu === 'legumes') {
      for (let x = 4; x < w - 6; x += 9) {
        const k = (x / 9 | 0) % 4;
        if (k === 0) { P.ellipse(x + 3, top - 1, 3, 3, '#d8323a'); P.px(x + 3, top - 4, '#3a8a3a'); P.px(x + 2, top - 2, '#ff8a8a'); } // tomate
        else if (k === 1) { P.rect(x, top - 3, 8, 3, '#3a7a3a'); P.hline(x, top - 3, 8, '#5aa05a'); } // courgette
        else if (k === 2) { P.ellipse(x + 3, top - 2, 3, 2, '#5a2a6a'); P.px(x, top - 3, '#3a8a3a'); P.px(x + 2, top - 3, '#8a5a9a'); } // aubergine
        else { P.rect(x + 1, top - 4, 5, 4, ['#f2c230', '#e8603a'][r.int(2)]); P.px(x + 3, top - 5, '#3a8a3a'); } // poivron
      }
    } else if (contenu === 'fromages') {
      for (let x = 3; x < w - 8; x += 12) { P.ellipse(x + 5, top - 2, 5, 3, '#f2d36b'); P.ellipse(x + 5, top - 3, 5, 2, '#fff0a0'); P.rect(x + 5, top - 4, 4, 3, '#e8c050'); }
    } else if (contenu === 'planche') {
      P.rect(4, top - 2, 18, 4, '#c89a5a'); P.hline(4, top - 2, 18, '#e0b878'); P.rect(8, top - 3, 8, 1, '#c8ccd8'); P.rect(16, top - 3, 4, 1, '#3a2a24');
      for (let k = 0; k < 6; k++) P.ellipse(26 + k * 3, top - 1, 1, 1, ['#3a7a3a', '#d8323a', '#f2c230'][k % 3]);
      P.ellipse(w - 10, top - 3, 6, 3, '#e8e4dc'); P.ellipse(w - 10, top - 4, 5, 2, '#ffffff'); // un saladier
    } else if (contenu === 'sucre') {
      for (const x of [3, 15, 27]) { if (x + 12 > w) break; P.rect(x, top - 10, 11, 11, '#f4efe2'); P.hline(x, top - 10, 11, '#ffffff'); P.rect(x + 1, top - 6, 9, 4, '#3a6aa8'); P.rect(x + 4, top - 5, 3, 2, '#ffffff'); }
    } else if (contenu === 'casserole') {
      P.rect(w - 30, top - 6, 12, 6, '#c8ccd8'); P.ellipse(w - 24, top - 6, 6, 2, '#8a90a0'); P.hline(w - 30, top - 4, 12, '#eef0f6'); P.rect(w - 18, top - 5, 9, 2, '#3a3a46');
      P.rect(w - 44, top - 2, 10, 2, '#c89a5a'); P.ellipse(w - 46, top - 1, 2, 1, '#c89a5a'); // la cuillère en bois
      P.rect(6, top - 4, 6, 4, '#f4efe2'); P.rect(7, top - 3, 4, 2, '#3a6aa8'); // un petit sac de sucre
    }
    return { img: PX.outline(c, 'auto'), ax: 0, ay: base, top };
  }
  // le grand fourneau (piano de cuisson) : 6 feux, des casseroles et une marmite
  function fourneau() {
    const W = 104, H = 44, { c, P } = mk(W, H), base = H - 1;
    P.rect(0, 14, W, H - 14, '#3a3e4c'); P.rect(0, 14, W, 12, '#5a6070'); P.hline(0, 14, W, '#8a90a0');
    for (let x = 4; x < W - 4; x += 16) { P.rect(x, 30, 12, 9, '#2a2e3a'); P.hline(x, 30, 12, '#6a7080'); P.rect(x + 4, 33, 4, 1, '#c8ccd8'); } // les portes du four
    P.rect(0, base - 2, W, 3, '#2a2e3a');
    const feux = [];
    for (let k = 0; k < 6; k++) { const x = 9 + k * 17, y = 20; P.ellipse(x, y, 6, 3, '#2a2a34'); P.ellipse(x, y, 4, 2, '#4a4a58'); feux.push([x, y]); }
    // une marmite, une casserole, une poêle
    P.rect(5, 2, 14, 16, '#c8ccd8'); P.ellipse(12, 2, 7, 2, '#8a90a0'); P.hline(5, 6, 14, '#eef0f6'); P.rect(3, 6, 2, 2, '#8a90a0'); P.rect(19, 6, 2, 2, '#8a90a0');
    P.rect(39, 9, 12, 9, '#c86a3a'); P.ellipse(45, 9, 6, 2, '#e8903a'); P.hline(39, 11, 12, '#e8a06a'); P.rect(51, 11, 9, 2, '#5a3a24');
    P.ellipse(80, 16, 8, 2, '#3a3a46'); P.ellipse(80, 15, 7, 2, '#5a5a6a'); P.rect(88, 15, 10, 2, '#2a2a34');
    return { img: PX.outline(c, '#1d1626'), ax: W / 2, ay: base, feux };
  }
  function frigo() {
    const { c, P } = mk(30, 56), base = 55;
    P.rect(0, 0, 30, 56, '#b8bcc8'); P.rect(2, 2, 26, 52, '#d8dce6'); P.vline(15, 2, 52, '#9aa0b0');
    P.rect(11, 20, 2, 12, '#6a7080'); P.rect(17, 20, 2, 12, '#6a7080'); P.vline(3, 2, 52, '#eef0f6');
    return { img: PX.outline(c, '#1d1626'), ax: 15, ay: base };
  }
  function evier() {
    const { c, P } = mk(42, 30), base = 29;
    P.rect(0, 8, 42, 22, '#a8aebc'); P.rect(0, 8, 42, 6, '#c8ccd8'); P.hline(0, 8, 42, '#eef0f6');
    P.rect(4, 9, 16, 4, '#6a7080'); P.rect(22, 9, 16, 4, '#6a7080');
    for (let k = 0; k < 6; k++) P.ellipse(10 + k, 6 - k, 5, 1, k % 2 ? '#f4f2ec' : '#d8d4cc'); // la pile d'assiettes
    P.rect(28, 2, 2, 7, '#8a90a0'); P.hline(28, 2, 6, '#8a90a0');
    return { img: PX.outline(c, '#1d1626'), ax: 21, ay: base };
  }
  return { table, chaise, plan, fourneau, frigo, evier };
})();

// ---------------------------------------------------------------- LA SALLE
Jeu.enregistrerCarte('restaurant', () => {
  const W = 352, H = 236, FOND = 80, D = RestoDecor, M = Montaigu;
  const C = new Carte('restaurant', W, H, { ambiance: 'interieur', fond: '#1a0e10' });
  const P = C.P, r = PX.rng(707), OR = '#e8b54a', A = Arendelle;
  // le parquet en chevrons
  for (let y = FOND; y < H; y += 4) for (let x = ((y / 4) % 2) * 6 - 6; x < W; x += 12) {
    P.rect(x, y, 6, 4, r.pick(['#8a5a32', '#946238', '#82542e'])); P.rect(x + 6, y, 6, 4, r.pick(['#a0703e', '#9a6a3a'])); P.hline(x, y, 12, '#a8743e'); P.px(x + 6, y + 1, '#5a3a22');
  }
  P.ellipse(W / 2, 150, 110, 40, 'rgba(122,26,34,0.35)'); P.ellipse(W / 2, 150, 100, 34, 'rgba(160,40,48,0.3)'); // le grand tapis
  // le mur du fond : papier peint bordeaux à motifs dorés, boiseries, corniche
  P.rect(0, 0, W, FOND, '#5a1a24');
  for (let y = 6; y < FOND - 26; y += 10) for (let x = (y / 10 % 2) * 8 + 4; x < W; x += 16) { P.px(x, y, '#a8742e'); P.px(x - 1, y + 1, '#8a5a2a'); P.px(x + 1, y + 1, '#8a5a2a'); P.px(x, y + 2, '#a8742e'); }
  P.rect(0, 0, W, 4, '#3a1018'); P.hline(0, 4, W, OR);
  P.rect(0, FOND - 26, W, 26, '#4a2a1c'); for (let x = 4; x < W; x += 24) { P.rect(x, FOND - 22, 20, 16, '#5a3424'); P.hline(x, FOND - 22, 20, '#6a4430'); }
  P.hline(0, FOND - 27, W, OR); P.dither(0, FOND - 6, W, 6, '#1a0e10', 5);
  C.solide(0, 0, W, FOND + 4); C.solide(0, 0, 8, H); C.solide(W - 8, 0, 8, H);
  P.rect(0, FOND, 8, H - FOND, '#3a1a14'); P.rect(W - 8, FOND, 8, H - FOND, '#3a1a14');
  // une guirlande lumineuse et des couronnes tout le long du mur
  for (let x = 10; x < W - 10; x++) { const y = 8 + Math.round(Math.sin(((x - 10) % 40) / 40 * Math.PI) * 4); P.px(x, y, '#2a4a2a'); if (x % 6 === 0) { P.px(x, y + 1, M.AMPOULES[(x / 6 | 0) % 5]); C.scintille.push([x, y + 1]); } }
  // la cheminée et son feu
  P.rect(22, 30, 54, FOND - 30, '#d8cdb4'); P.rect(22, 28, 54, 4, '#b8ad94'); P.hline(22, 28, 54, '#f0e6cc');
  P.rect(32, 42, 34, FOND - 42, '#1a1214'); P.ellipse(49, FOND - 6, 12, 4, '#8a3a1a');
  C.dynamiques.push({ sortY: FOND, draw(g, J) {
    const t = J.t || 0;
    for (let k = 0; k < 7; k++) { const h = 6 + Math.round(Math.abs(Math.sin(t * 7 + k * 1.7)) * 8); g.fillStyle = k % 2 ? '#f08a24' : '#ffd27a'; g.fillRect(38 + k * 3, FOND - 6 - h, 3, h); }
    g.fillStyle = '#5a3a24'; g.fillRect(38, FOND - 6, 22, 3);
  } });
  for (const [cx, col] of [[36, '#d8323a'], [49, '#3a8a4a'], [62, '#d8323a']]) { P.rect(cx - 2, 33, 5, 7, col); P.rect(cx - 2, 38, 7, 3, col); P.hline(cx - 2, 33, 5, '#ffffff'); } // les chaussettes
  C.zone(26, FOND, 46, 10, 'cheminee');
  // le portrait de Gusteau
  const gu = Resto.gusteau(); P.draw(gu, 108, 14);
  C.zone(104, FOND, 42, 10, 'portraitGusteau');
  // les appliques
  for (const ax of [96, 160, 236]) { P.rect(ax, 32, 3, 6, '#a8742e'); P.ellipse(ax + 1, 30, 3, 2, '#fff1bb'); C.lumiere(ax + 1, 30, 30, 'lamp'); }
  // les portes battantes de la cuisine, avec leurs hublots
  const KX = 270;
  P.rect(KX - 3, 22, 46, FOND - 22, '#3a1a14'); A.texte(P, 'CUISINE', KX + 6, 14, OR);
  for (const dx of [0, 21]) { P.rect(KX + dx, 26, 19, FOND - 26, '#6a4428'); P.hline(KX + dx, 26, 19, '#8a5a32'); P.ellipse(KX + dx + 9, 40, 5, 5, '#c8ccd8'); P.ellipse(KX + dx + 9, 40, 4, 4, '#ffe6a0'); P.rect(KX + dx + 3, 60, 13, 2, '#c8ccd8'); }
  C.porte(KX + 4, FOND - 2, 32, 14, 'cuisine', 'entree', 'up');
  C.arrivees.devantCuisine = { x: KX + 20, y: FOND + 14, dir: 'down' };
  // le sapin dans le coin, la vitrine des desserts, le pupitre de l'entrée
  C.objet(Objets.grandSapin(41), 24, 118, { solide: [-8, -4, 16, 5], lumiere: true, rayon: 50, k: 'xmas' });
  C.zone(12, 112, 24, 10, 'sapinResto');
  const vit = (() => { const { c, P: V } = (() => { const cc = PX.canvas(40, 34); return { c: cc, P: PX.painter(cc) }; })();
    V.rect(0, 8, 40, 26, '#5a3424'); V.rect(2, 2, 36, 18, '#bfe0f0'); V.rect(3, 3, 34, 16, '#fff4dc');
    for (let x = 5; x < 34; x += 7) { V.rect(x, 9, 5, 4, ['#f6c6d6', '#7a4a32', '#fff1e0', '#e8b54a', '#9fd8b8'][(x / 7) | 0]); V.px(x + 2, 8, '#d8323c'); }
    V.rect(6, 15, 24, 4, '#6a3a24'); V.hline(6, 15, 24, '#8a4a2a'); V.px(10, 14, '#f4f2ec'); V.px(20, 14, '#3a8a3a'); // la bûche, sans caramel
    V.hline(2, 2, 36, '#ffffff'); return { img: PX.outline(c, 'auto'), ax: 20, ay: 33 }; })();
  C.objet(vit, W - 34, 200, { solide: [-20, -8, 40, 8], texte: 'vitrineDesserts', zw: 36 });
  const pup = (() => { const cc = PX.canvas(20, 26), V = PX.painter(cc); V.rect(2, 8, 16, 18, '#5a3424'); V.rect(0, 6, 20, 4, '#7a4a2a'); V.rect(4, 4, 12, 3, '#f4f2ec'); V.vline(10, 4, 3, '#8a2a2a'); V.rect(15, 0, 2, 6, OR); V.ellipse(16, 0, 2, 1, '#fff1bb'); return { img: PX.outline(cc, 'auto'), ax: 10, ay: 25 }; })();
  C.objet(pup, 120, 214, { solide: [-10, -6, 20, 6], texte: 'pupitre', zw: 22 });
  // les tables dressées, leurs chaises et leurs chandelles
  const TABLES = [[82, 132], [176, 120], [260, 134], [108, 182], [206, 176], [292, 188]];
  const CONVIVES = { 0: [-9, 9], 1: [9], 4: [-9] }; // les places occupées (décalage par rapport au milieu de la table)
  TABLES.forEach(([tx, ty], k) => {
    const t = D.table(30 + k);
    for (const dx of CONVIVES[k] || [0]) C.objet(D.chaise(true), tx + dx, ty - 14, { solide: [-4, -3, 8, 3] });
    C.objet(t, tx, ty, { solide: [-16, -8, 32, 8], texte: 'tableResto', zw: 30 });
    t.flammes.forEach(([fx, fy]) => C.lumiere(tx - t.ax + fx, ty - t.ay + fy, 18, 'feu'));
    C.objet(D.chaise(false), tx - 20, ty + 2, { solide: [-4, -3, 8, 3] }); C.objet(D.chaise(false), tx + 20, ty + 2, { solide: [-4, -3, 8, 3] });
  });
  // les clients : Anton Ego, seul à sa table, et un couple
  const P5 = CONFIG.caramel.persos;
  const assis = (id, x, y) => { const p = new Entites.Perso({ id, cfg: P5[id], x, y, dir: 'down', fixe: true, dialogue: (J) => EpreuveCaramel.repliques(id, J) }); p.zone = () => ({ x: x - 12, y: y + 6, w: 24, h: 16, dialogue: p.dialogue }); C.pnj.push(p); return p; };
  assis('ego', 185, 108);
  assis('clienteResto', 73, 120); assis('clientResto', 91, 120);
  C.zone(188, 170, 36, 12, null, { dialogue: () => ['Une place libre. La serviette est pliée en forme de cygne.'] });
  // Linguini, en patins à roulettes, qui fait le tour de la salle à toute allure
  const lin = new Entites.Perso({ id: 'linguini', cfg: P5.linguini, x: 140, y: 150, dir: 'right', vitesse: 70, dialogue: (J) => EpreuveCaramel.repliques('linguini', J) });
  const tour = [{ x: 236, y: 150 }, { x: 236, y: 206 }, { x: 150, y: 210 }, { x: 52, y: 196 }, { x: 52, y: 150 }, { x: 140, y: 150 }];
  const rouler = () => lin.allerVers(tour.map((p) => ({ x: p.x, y: p.y })), 70, () => { lin.pauseT = 1.2; });
  lin.update = ((orig) => function (dt, J) { if (this.pauseT > 0) { this.pauseT -= dt; if (this.pauseT <= 0) rouler(); } orig.call(this, dt, J); })(lin.update);
  rouler();
  C.pnj.push(lin); C.linguini = lin;
  // la sortie vers la place
  P.rect(W / 2 - 22, H - 6, 44, 6, '#3a2618'); P.rect(W / 2 - 16, H - 10, 32, 4, '#7a2a2a');
  C.porte(W / 2 - 20, H - 10, 40, 10, 'montaigu', 'devantResto', 'down');
  C.arrivees.entree = { x: W / 2, y: H - 22, dir: 'up' };
  C.onEntree = (J) => EpreuveCaramel.entreeSalle(J);
  C.finaliser(0.2);
  return C;
});

// ---------------------------------------------------------------- LA CUISINE
Jeu.enregistrerCarte('cuisine', () => {
  const W = 352, H = 244, FOND = 80, D = RestoDecor, A = Arendelle;
  const C = new Carte('cuisine', W, H, { ambiance: 'interieur', fond: '#101418' });
  const P = C.P, r = PX.rng(808);
  // le carrelage noir et blanc
  for (let y = FOND; y < H; y += 7) for (let x = 0; x < W; x += 9) { const n = ((x / 9) + (y - FOND) / 7) % 2; P.rect(x, y, 9, 7, n ? '#e8e8ee' : '#3a3a46'); if (!n) P.px(x + 1, y + 1, '#4a4a58'); else P.hline(x, y, 9, '#f6f6fa'); }
  // la faïence blanche du mur, la barre aux casseroles en cuivre
  P.rect(0, 0, W, FOND, '#eef0f4'); for (let y = 0; y < FOND; y += 5) P.hline(0, y, W, '#c8ccd8'); for (let y = 0, k = 0; y < FOND; y += 5, k++) for (let x = (k % 2) * 5; x < W; x += 10) P.vline(x, y, 5, '#c8ccd8');
  P.rect(0, 0, W, 6, '#5a6070'); P.dither(0, FOND - 8, W, 8, '#101418', 5);
  for (let x = 8; x < W - 8; x++) { const y = 8 + Math.round(Math.sin(((x - 8) % 44) / 44 * Math.PI) * 3); P.px(x, y, '#2a4a2a'); if (x % 6 === 3) { P.px(x, y + 1, Montaigu.AMPOULES[(x / 6 | 0) % 5]); C.scintille.push([x, y + 1]); } }
  P.ellipse(178, 30, 7, 7, '#1e4a2a'); P.ellipse(178, 30, 5, 5, '#2f6a3a'); P.ellipse(178, 30, 3, 3, '#eef0f4'); P.rect(176, 36, 5, 3, '#d8323a'); P.px(173, 27, '#d8323a'); P.px(183, 32, '#d8323a');
  P.rect(20, 12, 150, 2, '#5a6070');
  for (let k = 0; k < 9; k++) { const x = 26 + k * 16, s = 3 + (k % 3); P.vline(x, 14, 4, '#3a3a46'); P.ellipse(x, 18 + s, s + 1, s + 1, '#a8582a'); P.ellipse(x, 18 + s, s, s, '#d8783a'); P.px(x - 1, 17 + s, '#f8b07a'); P.rect(x - 1, 18, 2, 3, '#7a3a1a'); }
  C.zone(20, FOND, 150, 10, 'casseroles');
  // les étagères à épices et le vieux livre de Gusteau
  for (const y of [34, 52]) { P.rect(186, y, 70, 3, '#7a4a2a'); P.hline(186, y, 70, '#a8743e'); }
  for (let k = 0; k < 9; k++) { const x = 190 + k * 7; P.rect(x, 26, 5, 8, r.pick(['#d8323a', '#f2c230', '#3a8a4a', '#e8603a', '#8a5a3a'])); P.rect(x, 25, 5, 2, '#c8ccd8'); }
  P.rect(190, 42, 16, 10, '#7a2a2a'); P.rect(191, 43, 14, 8, '#a8343a'); P.hline(192, 46, 12, '#e8b54a'); P.rect(209, 44, 4, 8, '#2a4a6a'); P.rect(214, 43, 5, 9, '#3a6a3a');
  for (let k = 0; k < 4; k++) P.ellipse(228 + k * 7, 49, 3, 3, ['#f2d36b', '#e8e4dc', '#c89a5a', '#f2d36b'][k]);
  C.zone(186, FOND, 30, 10, 'livreGusteau'); C.zone(216, FOND, 40, 10, 'epices');
  // le passe-plat et ses lampes chauffantes
  P.rect(270, 30, 70, 30, '#8a90a0'); P.rect(272, 32, 66, 26, '#2a2e3a'); P.rect(270, 56, 70, 4, '#c8ccd8');
  for (const x of [282, 304, 326]) { P.rect(x, 32, 6, 4, '#c84a2a'); P.px(x + 2, 36, '#ffb070'); C.lumiere(x + 3, 38, 24, 'feu'); }
  for (let k = 0; k < 4; k++) P.rect(276 + k * 15, 40, 8, 10, '#f4f2ec');
  C.zone(270, FOND, 70, 10, 'passe');
  C.solide(0, 0, W, FOND + 4); C.solide(0, 0, 6, H); C.solide(W - 6, 0, 6, H);
  // le grand fourneau au milieu, ses feux et sa vapeur
  const fo = D.fourneau(), FX = 150, FY = 150;
  C.objet(fo, FX, FY, { solide: [-52, -26, 104, 26], texte: 'fourneau', zw: 60 });
  C.dynamiques.push({ sortY: FY + 0.5, draw(g, J) {
    const t = J.t || 0;
    for (const [fx, fy] of fo.feux) for (let k = 0; k < 4; k++) { if (Math.sin(t * 9 + k * 2 + fx) < -0.3) continue; g.fillStyle = k % 2 ? '#5ab0ff' : '#a8e0ff'; g.fillRect(FX - fo.ax + fx - 3 + k * 2, FY - fo.ay + fy - 1, 1, 1); }
  } });
  for (const [vx, vy] of [[FX - 40, FY - 44], [FX - 5, FY - 36]]) C.fumees.push({ x: vx, y: vy, t: r() });
  C.lumiere(FX, FY - 20, 40, 'feu');
  // les plans de travail : légumes de la ratatouille, fromages, planche de Colette, sucre près de Rémy
  const plans = [[22, 132, 72, 'legumes', 'legumes'], [22, 196, 64, 'fromages', 'fromages'], [104, 214, 80, 'planche', null], [236, 150, 70, 'casserole', null], [236, 214, 42, 'sucre', 'sacsSucre']];
  for (const [px, py, pw, contenu, texte] of plans) { const pl = D.plan(pw, contenu, px + py); C.objet(pl, px, py, { solide: [0, -16, pw, 16] }); if (texte) C.zone(px + 4, py - 2, pw - 8, 10, texte); }
  // le plan de travail de Rémy, à droite du fourneau, avec sa petite casserole
  const RX = 271, RY = 150;
  // le frigo, l'évier
  C.objet(D.frigo(), 326, 120, { solide: [-15, -12, 30, 12], texte: 'frigo', zw: 26 });
  C.objet(D.evier(), 34, 100, { solide: [-21, -12, 42, 12], texte: 'evier', zw: 34 });
  // Colette, à sa planche, et Rémy
  const P5 = CONFIG.caramel.persos;
  const col = new Entites.Perso({ id: 'coletteChef', cfg: P5.coletteChef, x: 128, y: 204, dir: 'down', fixe: true, dialogue: (J) => EpreuveCaramel.repliques('coletteChef', J) });
  C.pnj.push(col); C.colette = col;
  const remy = new Resto.Remy({ x: RX, y: RY + 1, h: 19, dialogue: (J) => EpreuveCaramel.parlerRemy(J) });
  C.pnj.push(remy); C.remy = remy;
  const lin = new Entites.Perso({ id: 'linguini', cfg: P5.linguini, x: 176, y: 250, dir: 'up', visible: false, vitesse: 80 });
  C.pnj.push(lin); C.linguiniCuisine = lin;
  // les portes battantes vers la salle, en bas
  P.rect(W / 2 - 24, H - 6, 48, 6, '#3a2618'); P.rect(W / 2 - 18, H - 10, 36, 4, '#6a4428');
  C.porte(W / 2 - 20, H - 10, 40, 10, 'restaurant', 'devantCuisine', 'down');
  C.zone(W / 2 - 20, H - 18, 40, 8, 'sortieCuisine');
  C.arrivees.entree = { x: W / 2, y: H - 24, dir: 'up' };
  C.onEntree = (J) => EpreuveCaramel.entreeCuisine(J);
  C.finaliser(0.2);
  return C;
});
