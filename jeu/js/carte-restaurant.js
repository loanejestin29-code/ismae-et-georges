// =====================================================================
//  carte-restaurant.js — le restaurant du chef Gusteau, à Montaigu (épreuve 5)
//
//  · 'restaurant' : la salle, à la lueur des bougies. Parquet à chevrons, grand tapis,
//    papier peint bordeaux et doré, pilastres de noyer, miroirs, lustres de cristal,
//    la cheminée, le portrait de Gusteau, le bar en zinc, le chariot des desserts, le
//    piano et son pianiste, les tables nappées, Anton Ego qui attend son dessert,
//    Linguini qui sert… en patins à roulettes. Au fond à droite, les portes de la cuisine.
//  · 'cuisine' : tomettes, faïence blanche et frise bleue, la grande hotte et ses
//    casseroles de cuivre, le piano de cuisson qui fume, la chambre froide, la plonge,
//    l'îlot de marbre de la pâtisserie (le poste de Rémy), le billot de Colette, et
//    au premier plan le passe, sous ses lampes chauffantes. Horst touille sa sauce,
//    Colette coupe ses légumes, Lalo fait la vaisselle.
//  Les objets sont dessinés dans decor-resto.js ; le mini-jeu du service dans service.js.
// =====================================================================
'use strict';

// pose un objet avec ses lumières et ses flammes de bougie
function poserResto(C, def, x, y, o = {}) {
  const ob = C.objet(def, x, y, o);
  (def.lumieres || []).forEach(([lx, ly, rr, k]) => C.lumiere(ob.x + lx, ob.y + ly, rr, k));
  (def.flammes || []).forEach(([fx, fy]) => C.lumiere(ob.x + fx, ob.y + fy, o.rayonFlamme || 18, 'feu'));
  (def.twinkles || []).forEach(([tx, ty]) => C.scintille.push([ob.x + tx, ob.y + ty]));
  return ob;
}

// ---------------------------------------------------------------- LA SALLE
Jeu.enregistrerCarte('restaurant', () => {
  const W = 576, H = 336, FOND = 104, D = RestoDecor, M = Montaigu, Q = Scenes.quete;
  const C = new Carte('restaurant', W, H, { ambiance: 'chaud', fond: '#1a0e10' });
  C.neige = 0;
  const P = C.P, r = PX.rng(707), OR = D.OR, N = D.NOYER, V = D.VELOURS;
  const poser = (def, x, y, o) => poserResto(C, def, x, y, o);

  // ---- le parquet à chevrons, usé au milieu, plus sombre le long des murs
  for (let y = FOND, j = 0; y < H; y += 4, j++) for (let x = -((j * 3) % 12); x < W; x += 12) {
    const a = r.pick(['#6e4024', '#7a4a28', '#84522c', '#704226']), b = r.pick(['#8e5a32', '#9a6640', '#8a5834', '#94603a']);
    P.rect(x, y, 6, 4, a); P.rect(x + 6, y, 6, 4, b);
    P.hline(x, y, 6, PX.shade(a, 0.14)); P.hline(x + 6, y, 6, PX.shade(b, 0.16));
    P.vline(x + 6, y, 4, '#3e2214'); P.px(x + 1 + r.int(4), y + 2, PX.shade(a, -0.18)); if (r.chance(0.3)) P.px(x + 7 + r.int(4), y + 1 + r.int(2), PX.shade(b, 0.25));
  }
  P.dither(0, FOND, W, 12, '#1a0a06', 9); P.dither(0, FOND + 12, W, 10, '#1a0a06', 4);
  P.dither(0, FOND, 16, H - FOND, '#1a0a06', 6); P.dither(W - 16, FOND, 16, H - FOND, '#1a0a06', 6);
  // ---- le grand tapis d'Orient au milieu, et le chemin de l'entrée
  const tapis = (x, y, w, h) => {
    P.rect(x - 2, y, w + 4, h, '#efe6d0'); for (let xx = x - 2; xx < x + w + 2; xx += 2) { P.vline(xx, y - 3, 3, '#e0d4b8'); P.vline(xx, y + h, 3, '#e0d4b8'); }
    P.rect(x, y, w, h, '#22183a'); P.rect(x + 3, y + 3, w - 6, h - 6, OR[2]); P.rect(x + 5, y + 5, w - 10, h - 10, '#22183a');
    for (let xx = x + 9; xx < x + w - 6; xx += 8) for (const yy of [y + 8, y + h - 9]) { P.px(xx, yy - 1, OR[3]); P.hline(xx - 1, yy, 3, V[4]); P.px(xx, yy + 1, OR[3]); }
    for (let yy = y + 12; yy < y + h - 8; yy += 8) for (const xx of [x + 8, x + w - 9]) { P.px(xx, yy - 1, OR[3]); P.hline(xx - 1, yy, 3, V[4]); P.px(xx, yy + 1, OR[3]); }
    P.rect(x + 12, y + 12, w - 24, h - 24, V[2]); P.rect(x + 13, y + 13, w - 26, 1, OR[1]); P.rect(x + 13, y + h - 14, w - 26, 1, OR[1]);
    for (let yy = y + 16; yy < y + h - 16; yy += 6) for (let xx = x + 16 + ((yy / 6) % 2) * 6; xx < x + w - 16; xx += 12) { P.px(xx, yy, V[4]); P.px(xx - 1, yy + 1, V[1]); P.px(xx + 1, yy + 1, V[1]); }
    const cx = x + w / 2, cy = y + h / 2;
    P.ellipse(cx, cy, 34, 16, '#22183a'); P.ellipse(cx, cy, 31, 14, OR[2]); P.ellipse(cx, cy, 28, 12, V[3]); P.ellipse(cx, cy, 16, 7, '#22183a'); P.ellipse(cx, cy, 9, 4, OR[3]); P.ellipse(cx, cy, 4, 2, V[4]);
    P.dither(x, y, w, h, '#000000', 2);
  };
  tapis(150, 158, 276, 136);
  P.rect(262, 294, 52, H - 294, V[2]); P.vline(263, 294, H - 294, OR[2]); P.vline(312, 294, H - 294, OR[2]); P.dither(262, 294, 52, H - 294, V[1], 4);
  // le seuil de l'entrée : damier de marbre noir et blanc, paillasson, porte vitrée
  for (let y = H - 22, j = 0; y < H; y += 6, j++) for (let x = 232 + (j % 2) * 6, k = 0; x < 344; x += 6, k++) if (x < 262 || x > 312) P.rect(x, y, 6, 6, k % 2 ? '#e8e4dc' : '#2a2430');
  P.rect(266, H - 12, 44, 8, '#4a2a1a'); P.dither(266, H - 12, 44, 8, '#6a3a24', 6); P.rect(258, H - 3, 60, 3, '#120a0c');

  // ---- le mur du fond : corniche, papier peint, cimaise, lambris
  D.papierPeint(P, 0, 6, W, 56);
  P.rect(0, 0, W, 6, N[1]); P.hline(0, 5, W, OR[3]); P.hline(0, 4, W, N[3]);
  P.rect(0, 60, W, 5, N[3]); P.hline(0, 60, W, N[5]); P.hline(0, 62, W, OR[3]); P.hline(0, 64, W, N[1]);
  P.rect(0, 65, W, FOND - 65, N[2]); for (let x = 2; x < W - 20; x += 24) D.panneau(P, x, 68, 22, FOND - 76);
  P.rect(0, FOND - 6, W, 6, N[1]); P.hline(0, FOND - 6, W, N[4]); P.hline(0, FOND - 5, W, OR[2]);
  // la guirlande lumineuse le long de la corniche
  for (let x = 0; x < W; x++) { const y = 8 + Math.round(Math.sin(((x % 48) / 48) * Math.PI) * 4); P.px(x, y, D.VERT[1]); P.px(x, y - 1, D.VERT[2]); if (x % 6 === 0) { P.px(x, y + 1, M.AMPOULES[(x / 6 | 0) % 5]); C.scintille.push([x, y + 1]); } }
  // la cheminée et son miroir ; le miroir de la banquette ; le portrait de Gusteau entre deux miroirs ; le bar ; les portes de la cuisine
  D.miroir(P, 28, 8, 56, 24);
  D.miroir(P, 120, 12, 72, 46);
  D.miroir(P, 214, 14, 34, 44); D.miroir(P, 328, 14, 34, 44);
  D.grandPortrait(P, 271, 16);
  P.rect(268, 66, 40, 9, OR[2]); P.rect(269, 67, 38, 7, N[1]); for (let k = 0; k < 5; k++) { const sx = 274 + k * 7; P.px(sx, 69, OR[4]); P.hline(sx - 1, 70, 3, OR[4]); P.px(sx, 71, OR[4]); }
  D.etageresBar(P, 380, 10, 84, 52);
  D.portesCuisine(P, 500, 36, FOND - 36);
  for (const px of [104, 200, 368, 468]) D.pilastre(P, px, 6, FOND - 6);
  P.rect(0, 0, 8, FOND, N[1]); P.rect(W - 8, 0, 8, FOND, N[1]);
  for (const [ax, ay] of [[108, 34], [204, 34], [260, 30], [316, 30], [372, 34], [472, 34]]) { D.applique(P, ax, ay); C.lumiere(ax, ay - 1, 34, 'lamp'); }
  C.lumiere(288, 22, 30, 'halo');
  for (const [hx, hy] of [[511, 48], [534, 48]]) C.lumiere(hx, hy, 22, 'win');
  P.rect(0, FOND, 6, H - FOND, N[1]); P.rect(W - 6, FOND, 6, H - FOND, N[1]); P.vline(5, FOND, H - FOND, N[3]); P.vline(W - 6, FOND, H - FOND, N[3]);
  C.solide(0, 0, W, FOND + 4); C.solide(0, 0, 8, H); C.solide(W - 8, 0, 8, H);
  C.porte(504, FOND - 2, 36, 14, 'cuisine', 'entree', 'up');
  C.arrivees.devantCuisine = { x: 522, y: FOND + 16, dir: 'down' };
  C.zone(502, FOND, 40, 10, 'portesCuisine');

  // ---- la cheminée, son feu, la pendule
  const ch = poser(D.cheminee(), 56, FOND + 4, { solide: [-40, -8, 80, 8], rayonFlamme: 14 });
  C.lumiere(ch.x + ch.def.foyer.x + 13, ch.y + ch.def.foyer.y - 4, 60, 'feu');
  C.zone(26, FOND + 2, 60, 10, 'cheminee');
  C.dynamiques.push({ sortY: FOND + 4.5, draw(g, J) {
    const t = J.t || 0, f = ch.def.foyer, x0 = ch.x + f.x, y0 = ch.y + f.y;
    for (let k = 0; k < 9; k++) { const h = 5 + Math.round(Math.abs(Math.sin(t * 7 + k * 1.7)) * 9 + Math.sin(t * 3 + k) * 2); g.fillStyle = k % 3 === 1 ? '#ffd27a' : k % 3 ? '#f08a24' : '#e8501e'; g.fillRect(x0 + k * 3, y0 - h, 3, h); if (h > 9) { g.fillStyle = '#fff4b0'; g.fillRect(x0 + k * 3 + 1, y0 - h + 2, 1, 3); } }
    if (Math.sin(t * 5.3) > 0.7) { g.fillStyle = '#ffd27a'; g.fillRect(x0 + 6 + Math.round(Math.sin(t * 9) * 8), y0 - 16 - Math.round((t * 30) % 12), 1, 1); }
  } });
  // ---- le sapin et ses cadeaux, dans le coin
  poser(Objets.grandSapin(41), 30, 238, { solide: [-10, -4, 20, 5], lumiere: true, rayon: 52, k: 'xmas' });
  poser(D.cadeaux(4), 34, 246, { solide: [-16, -6, 32, 6] });
  C.zone(14, 236, 34, 12, 'sapinResto');
  // ---- les lustres, accrochés au plafond (au premier plan)
  for (const lx of [176, 404]) { C.lumiere(lx, 196, 96, 'lamp'); const l = D.lustre(); C.dessusImg(l.img, lx - l.ax, -6); l.lumieres.forEach(([x, y, rr, k]) => C.lumiere(lx - l.ax + x, y - 6, rr, k)); for (let k = 0; k < 4; k++) C.scintille.push([lx - 8 + k * 5, 36]); }
  // ---- la banquette de velours et ses deux petites tables
  poser(D.banquette(78), 118, FOND + 12, { solide: [0, -10, 78, 10] });
  for (const tx of [138, 178]) { const t = poser(D.tableCarree(tx), tx, FOND + 38, { solide: [-12, -8, 24, 8], texte: 'tableResto', zw: 24 }); void t; poser(D.chaise('dos'), tx, FOND + 46, { solide: [-4, -3, 8, 3] }); }
  // ---- le portrait de Gusteau et le chariot des desserts
  C.zone(266, FOND, 44, 10, 'portraitGusteau');
  const chariot = poser(D.chariot(), 288, FOND + 26, { solide: [-22, -8, 44, 8], texte: 'chariotDesserts', zw: 40 });
  const pb = D.parisBrestMini();
  C.dynamiques.push({ sortY: FOND + 26.5, draw(g) { if (Q.caramel === 'gagne') g.drawImage(pb.img, chariot.x + chariot.def.place[0] - pb.ax, chariot.y + chariot.def.place[1] - pb.ay + 2); } });
  // ---- le bar en zinc, ses tabourets, le percolateur qui fume
  const bar = poser(D.bar(88), 378, FOND + 26, { solide: [0, -16, 88, 16] });
  C.zone(380, FOND + 10, 84, 18, 'barResto');
  for (const sx of [390, 412, 434, 456]) poser(D.tabouret(), sx, FOND + 40, { solide: [-3, -2, 6, 2] });
  C.fumees.push({ x: bar.x + bar.def.percolateur[0], y: bar.y + bar.def.percolateur[1] - 2, t: 0, vx: 0.5, vy: -7 });
  // ---- l'ardoise du menu, la desserte, les palmiers, le portemanteau, le pupitre du maître d'hôtel
  poser(D.ardoise(['MENU', 'NOEL']), 486, FOND + 26, { solide: [-8, -4, 16, 4], texte: 'menuResto', zw: 20 });
  poser(D.desserte(), 548, 168, { solide: [-20, -8, 40, 8], texte: 'desserte', zw: 36 });
  poser(D.palmier(3), 22, 330, { solide: [-6, -4, 12, 4] });
  poser(D.palmier(8), 556, 330, { solide: [-6, -4, 12, 4] });
  poser(D.portemanteau(), 226, 326, { solide: [-5, -3, 10, 3], texte: 'portemanteauResto', zw: 18 });
  poser(D.pupitre(), 352, 326, { solide: [-12, -6, 24, 6], texte: 'pupitre', zw: 24 });
  // ---- le piano à queue et son pianiste
  const pi = poser(D.piano(), 506, 292, { solide: [-30, -20, 60, 20], dy: -24, texte: 'piano', zw: 40 });
  void pi;
  // ---- les tables rondes : [x, y, options] ; les chaises autour
  const TABLES = [
    [110, 196, { couverts: 4, mets: true, pain: true }], [290, 190, { couverts: 2, mets: false, chemin: true, rose: true, vin: true }],
    [432, 198, { couverts: 2, mets: true, vin: true }], [168, 262, { couverts: 4, mets: false, rose: true }],
    [300, 272, { couverts: 4, mets: true, pain: true }], [430, 268, { couverts: 3, mets: false, chemin: true }],
  ];
  const PLEINES = { 0: [-9, 9], 1: [0], 2: [0] };
  TABLES.forEach(([tx, ty, o], k) => {
    const t = D.tableRonde(30 + k, o);
    for (const dx of PLEINES[k] || [-9, 9]) poser(D.chaise('face'), tx + dx, ty - 22, { solide: [-4, -3, 8, 3] });
    poser(t, tx, ty, { solide: [-18, -9, 36, 9], texte: k === 3 ? null : 'tableResto', zw: 32 });
    for (const dx of [-12, 12]) poser(D.chaise('dos'), tx + dx, ty + 6, { solide: [-4, -3, 8, 3] });
  });
  C.zone(152, 254, 34, 12, null, { dialogue: () => ['Une table dressée, mais vide. Les serviettes sont pliées en forme de cygne.', 'Un petit carton dit : « Réservé — Loane ».'] });
  poser(D.seauChampagne(), 316, 196, { solide: [-3, -2, 6, 2] });

  // ---- les clients
  const P5 = CONFIG.caramel.persos;
  const assis = (id, x, y, dir = 'down') => { const p = new Entites.Perso({ id, cfg: P5[id], x, y, dir, fixe: true, dialogue: (J) => EpreuveCaramel.repliques(id, J) }); p.zone = () => ({ x: x - 12, y: y + 6, w: 24, h: 18, dialogue: p.dialogue }); C.pnj.push(p); return p; };
  assis('ego', 290, 170);
  assis('clienteResto', 138, FOND + 22); assis('clientResto', 178, FOND + 22);
  assis('dameResto', 101, 176); assis('enfantResto', 119, 176);
  assis('papiResto', 432, 178);
  // le pianiste, de dos ; ses notes s'envolent
  const pia = new Entites.Perso({ id: 'pianiste', cfg: P5.pianiste, x: 494, y: 280, dir: 'up', fixe: true, dialogue: (J) => EpreuveCaramel.repliques('pianiste', J) });
  pia.zone = () => ({ x: 480, y: 280, w: 28, h: 16, dialogue: pia.dialogue });
  C.pnj.push(pia);
  poser(D.bancPiano(), 494, 287, { solide: [-10, -3, 20, 3] });
  let noteT = 0;
  C.dynamiques.push({ sortY: 0, update(dt, J) { if ((noteT -= dt) < 0) { noteT = 0.7 + Math.random() * 0.6; J.particule('note', 486 + Math.random() * 24, 250, { vy: -10 - Math.random() * 6, vx: -3 + Math.random() * 6, max: 2.2, v: Math.random() < 0.5 ? 0 : 1 }); } }, draw() {} });
  // le maître d'hôtel, derrière son pupitre
  const mus = new Entites.Perso({ id: 'mustafa', cfg: P5.mustafa, x: 352, y: 302, dir: 'down', fixe: true, dialogue: (J) => EpreuveCaramel.repliques('mustafa', J) });
  mus.zone = () => ({ x: 338, y: 316, w: 28, h: 14, dialogue: mus.dialogue });
  C.pnj.push(mus);
  // Linguini, en patins à roulettes, qui fait le tour de la salle à toute allure
  const lin = new Entites.Perso({ id: 'linguini', cfg: P5.linguini, x: 240, y: 230, dir: 'right', vitesse: 72, dialogue: (J) => EpreuveCaramel.repliques('linguini', J) });
  const tour = [{ x: 370, y: 230 }, { x: 372, y: 300 }, { x: 236, y: 304 }, { x: 70, y: 300 }, { x: 64, y: 230 }, { x: 150, y: 228 }, { x: 240, y: 230 }];
  const rouler = () => lin.allerVers(tour.map((p) => ({ x: p.x, y: p.y })), 72, () => { lin.pauseT = 1.4; });
  lin.update = ((orig) => function (dt, J) { if (this.pauseT > 0) { this.pauseT -= dt; if (this.pauseT <= 0) rouler(); } orig.call(this, dt, J); })(lin.update);
  rouler();
  C.pnj.push(lin); C.linguini = lin;

  // ---- la sortie vers la grande rue
  C.porte(W / 2 - 20, H - 10, 40, 10, 'montaigu', 'devantResto', 'down');
  C.arrivees.entree = { x: W / 2, y: H - 22, dir: 'up' };
  C.onEntree = (J) => EpreuveCaramel.entreeSalle(J);
  C.finaliser(0.3);
  return C;
});

// ---------------------------------------------------------------- LA CUISINE
Jeu.enregistrerCarte('cuisine', () => {
  const W = 576, H = 352, FOND = 112, D = RestoDecor, I = D.INOX;
  const C = new Carte('cuisine', W, H, { ambiance: 'cuisine', fond: '#101418' });
  C.neige = 0;
  const P = C.P, r = PX.rng(808);
  const poser = (def, x, y, o) => poserResto(C, def, x, y, o);

  // ---- les tomettes de terre cuite, un peu usées ; tapis de caoutchouc, grille d'évacuation, farine, flaque
  const TOMETTES = ['#a8482c', '#b4502e', '#9c4428', '#bc5a36', '#ac4e30', '#a44a2c'];
  P.rect(0, FOND, W, H - FOND, '#5e2c1c');
  for (let y = FOND, j = 0; y < H; y += 6, j++) for (let x = (j % 2) * 5 - 5; x < W; x += 10) {
    const col = r.pick(TOMETTES);
    P.rect(x + 1, y, 7, 5, col); P.rect(x, y + 1, 9, 3, col);
    P.hline(x + 1, y, 7, PX.shade(col, 0.16)); P.px(x, y + 1, PX.shade(col, 0.1)); P.hline(x + 1, y + 4, 7, PX.shade(col, -0.14));
    if (r.chance(0.18)) P.px(x + 2 + r.int(5), y + 1 + r.int(3), PX.shade(col, r.chance(0.5) ? -0.25 : 0.22));
  }
  P.dither(0, FOND, W, 14, '#1a0a06', 9); P.dither(0, FOND + 14, W, 10, '#1a0a06', 4);
  P.dither(0, FOND, 14, H - FOND, '#1a0a06', 6); P.dither(W - 14, FOND, 14, H - FOND, '#1a0a06', 6);
  const tapisCaoutchouc = (x, y, w, h) => { P.rect(x, y, w, h, '#26262e'); P.hline(x, y, w, '#3a3a46'); for (let yy = y + 2; yy < y + h - 1; yy += 3) for (let xx = x + 2 + ((yy / 3) % 2); xx < x + w - 1; xx += 3) P.px(xx, yy, '#141418'); };
  tapisCaoutchouc(196, FOND + 38, 190, 12); tapisCaoutchouc(478, FOND + 34, 90, 10);
  P.ellipse(300, 214, 9, 4, I[1]); P.ellipse(300, 214, 8, 3, I[3]); for (let x = 294; x < 307; x += 2) P.vline(x, 212, 5, I[0]);
  for (let k = 0; k < 260; k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); P.px(Math.round(128 + Math.cos(a) * d * 64), Math.round(262 + Math.sin(a) * d * 12), r.pick(['#f4efe2', '#ffffff', '#e8dcc8'])); }
  P.ellipse(524, 170, 16, 4, '#6a6a7a'); P.ellipse(522, 169, 13, 3, '#8a96a8'); P.px(516, 168, '#d8e8f8'); P.px(530, 170, '#d8e8f8');
  for (let k = 0; k < 12; k++) P.px(330 + r.int(140), 270 + r.int(40), r.pick(['#3a7a3a', '#d8323a', '#f2c230']));

  // ---- le mur du fond
  D.faience(P, 0, 0, W, FOND);
  P.rect(0, 0, W, 7, I[3]); P.hline(0, 6, W, I[1]); P.hline(0, 1, W, I[5]); for (let x = 20; x < W; x += 48) { P.rect(x, 0, 3, 7, I[2]); P.px(x + 1, 3, I[5]); }
  for (let x = 0; x < W; x++) { const y = 10 + Math.round(Math.sin(((x % 52) / 52) * Math.PI) * 3); P.px(x, y, D.VERT[1]); if (x % 6 === 3) { P.px(x, y + 1, Montaigu.AMPOULES[(x / 6 | 0) % 5]); C.scintille.push([x, y + 1]); } }
  // la pâtisserie : bocaux de farine, de sucre, d'amandes, de noisettes ; l'affiche de Gusteau
  D.etageresMur(P, 8, 12, 100, [22, 42], 3, { patisserie: true });
  D.afficheGusteau(P, 30, 60);
  // la chambre froide (et sa couronne de Noël)
  D.chambreFroide(P, 120, 30, 54, FOND - 30);
  P.ellipse(140, 66, 7, 7, D.VERT[1]); P.ellipse(140, 66, 6, 6, D.VERT[2]); P.ellipse(140, 66, 3, 3, I[4]); for (const [dx, dy] of [[-5, -2], [4, -4], [5, 3], [-3, 5]]) P.px(140 + dx, 66 + dy, '#d8323a'); P.rect(138, 72, 5, 3, '#d8323a');
  // la hotte et ses casseroles ; le garde-manger, sa fenêtre et ses herbes ; la plonge, son tableau et son horloge
  D.hotte(P, 186, 6, 208);
  D.fenetre(P, 412, 14, 44, 26);
  D.etageresMur(P, 402, 46, 68, [18, 38], 9, { herbes: 5 });
  D.tableauRecettes(P, 482, 20); D.horloge(P, 544, 32);
  for (const [lx, ly] of [[207, 40], [251, 40], [295, 40], [339, 40], [383, 40]]) C.lumiere(lx, ly, 48, 'lamp');
  C.lumiere(434, 28, 26, 'win');
  C.solide(0, 0, W, FOND + 4); C.solide(0, 0, 6, H); C.solide(W - 6, 0, 6, H);
  P.rect(0, FOND, 4, H - FOND, '#1a1418'); P.rect(W - 4, FOND, 4, H - FOND, '#1a1418');
  C.zone(30, FOND, 60, 10, 'afficheGusteau'); C.zone(120, FOND, 54, 10, 'frigo'); C.zone(10, FOND, 20, 10, 'bocaux');
  C.zone(404, FOND, 66, 10, 'epices'); C.zone(482, FOND, 34, 10, 'recettes');

  // ---- le piano de cuisson, sous la hotte : feux animés, bouillons, vapeur, fours rougeoyants
  const fo = D.fourneau(196), FX = 190, FY = FOND + 36;
  const four = poser(fo, FX, FY, { solide: [0, -28, 196, 28], texte: 'fourneau', zw: 120 });
  for (const [fx, fy] of fo.fumees) C.fumees.push({ x: four.x + fx, y: four.y + fy, t: Math.random(), vx: 0.6, vy: -11 });
  for (const ox of [30, 76, 122]) C.lumiere(four.x + ox, four.y + fo.devant + 19, 22, 'feu');
  C.dynamiques.push({ sortY: FY + 0.5, draw(g, J) {
    const t = J.t || 0;
    fo.feux.forEach(([fx, fy], k) => {
      const x = four.x + fx, y = four.y + fy, plein = k === 0;
      for (let i = -7; i <= 7; i++) {
        if (!plein && Math.abs(i) < 6) continue;
        const h = 1 + ((Math.sin(t * 13 + i * 1.9 + k) > 0.2) ? 1 : 0);
        g.fillStyle = Math.sin(t * 9 + i + k) > 0.6 ? '#ffb070' : '#6ab8ff'; g.fillRect(x + i, y + 1 - h, 1, h);
      }
    });
    for (const [bx, by, rx, ry, col] of fo.bulles) for (let k = 0; k < 4; k++) { const ph = (t * 1.7 + k * 0.37) % 1; if (ph > 0.75) continue; const a = k * 2.4 + Math.floor(t * 1.7 + k * 0.37) * 1.3; g.fillStyle = ph > 0.5 ? '#ffffff' : col; g.fillRect(Math.round(four.x + bx + Math.cos(a) * rx * 0.7), Math.round(four.y + by + Math.sin(a) * ry * 0.6), 1, 1); }
    // la cuillère de bois de Horst tourne dans la sauce
    const [sx, sy] = fo.feux[2], a = t * 4.5, cx = four.x + sx + Math.round(Math.cos(a) * 3), cy = four.y + sy - 9 + Math.round(Math.sin(a) * 1);
    g.fillStyle = '#c49e68'; for (let k = 0; k < 10; k++) g.fillRect(cx + Math.round(k * 0.4), cy - k, 1, 1); g.fillStyle = '#a88050'; g.fillRect(cx - 1, cy, 2, 1);
    // les fours rougeoient
    g.globalAlpha = 0.25 + Math.sin(t * 3) * 0.12; g.fillStyle = '#ff9a40';
    for (const [ox, ow] of [[6, 42], [52, 42], [98, 42]]) g.fillRect(four.x + ox + 7, four.y + fo.devant + 15, ow - 12, 8);
    g.globalAlpha = 1;
  } });
  // ---- l'îlot de marbre de la pâtisserie : le poste de Rémy
  const ilot = poser(D.ilotPatisserie(), 124, 250, { solide: [-54, -26, 108, 26], texte: 'ilotPatisserie', zw: 70 });
  void ilot;
  poser(D.sacFarine(), 196, 240, { solide: [-6, -3, 12, 3] }); poser(D.sacFarine(), 208, 246, { solide: [-6, -3, 12, 3] });
  // ---- le billot de Colette, ses légumes ; son couteau qui tape
  const bil = poser(D.billot(), 400, 258, { solide: [-40, -26, 80, 26], texte: 'legumes', zw: 60 });
  C.dynamiques.push({ sortY: 258.5, draw(g, J) {
    const t = J.t || 0, x = bil.x + bil.def.planche[0], y = bil.y + bil.def.planche[1], up = Math.max(0, Math.sin(t * 14)) * 4;
    g.fillStyle = '#e6e9f0'; g.fillRect(x, Math.round(y - 3 - up), 8, 2); g.fillStyle = '#1d1626'; g.fillRect(x + 8, Math.round(y - 3 - up), 4, 2);
    if (up < 0.6) { g.fillStyle = '#7ab060'; g.fillRect(x - 2 + Math.round(Math.sin(t * 7) * 2), y - 4, 1, 1); }
  } });
  // ---- la table de dressage au milieu, Larousse qui dresse les assiettes, l'échelle pâtissière
  const td = poser(D.tableDressage(), 292, 214, { solide: [-48, -24, 96, 24], texte: 'tableDressage', zw: 60 });
  C.dynamiques.push({ sortY: 214.5, draw(g, J) {
    const t = J.t || 0, k = Math.floor(t / 1.6) % 4, [ax, ay] = td.def.assiettes[k], x = td.x + ax, y = td.y + ay, p = (t / 1.6) % 1;
    g.fillStyle = '#e6e9f0'; g.fillRect(x + 2, Math.round(y - 9 + p * 5), 1, 6); g.fillRect(x + 4, Math.round(y - 9 + p * 5), 1, 6);
    if (p > 0.6) { g.fillStyle = '#5aa05a'; g.fillRect(x, y - 2, 2, 1); }
  } });
  C.lumiere(292, 200, 40, 'lamp');
  poser(D.echelle(), 424, 172, { solide: [-14, -4, 28, 4], texte: 'echelle', zw: 26 });
  // ---- l'étagère des légumes, les cagettes, la poubelle, le seau
  poser(D.etagere(2), 30, 206, { solide: [-20, -6, 40, 6], texte: 'etagereLegumes', zw: 36 });
  poser(D.cagettes(), 64, 208, { solide: [-10, -5, 20, 5] });
  poser(D.poubelle(), 478, 240, { solide: [-6, -4, 12, 4] });
  poser(D.seau(), 556, 222, { solide: [-6, -3, 12, 3] });
  poser(D.cagettes(), 552, 300, { solide: [-10, -5, 20, 5] });
  // ---- la plonge : le robinet goutte, la mousse déborde
  const pl = poser(D.plonge(92), 522, FOND + 32, { solide: [-46, -18, 92, 18], texte: 'evier', zw: 60 });
  C.dynamiques.push({ sortY: FOND + 32.5, draw(g, J) {
    const t = J.t || 0, [rx, ry] = pl.def.robinet, x = pl.x + rx, y = pl.y + ry, ph = (t * 1.3) % 1;
    g.fillStyle = '#bfe6f4'; g.fillRect(x, Math.round(y + 1 + ph * 12), 1, 2);
    for (let k = 0; k < 5; k++) { const p = (t * 0.6 + k * 0.21) % 1; g.fillStyle = '#ffffff'; g.fillRect(Math.round(pl.x + 10 + k * 8 + Math.sin(t * 2 + k) * 2), Math.round(pl.y + 18 - p * 8), p > 0.7 ? 1 : 2, p > 0.7 ? 1 : 2); }
  } });
  // ---- l'horloge : les aiguilles tournent (lentement)
  C.dynamiques.push({ sortY: 0, draw(g, J) {
    const t = (J.t || 0) + 20.5 * 60, a = (t / 60) * Math.PI * 2 - Math.PI / 2, b = (t / 720) * Math.PI * 2 - Math.PI / 2;
    g.fillStyle = '#1d1626'; for (let k = 1; k < 5; k++) g.fillRect(Math.round(544 + Math.cos(a) * k), Math.round(32 + Math.sin(a) * k), 1, 1);
    for (let k = 1; k < 4; k++) g.fillRect(Math.round(544 + Math.cos(b) * k), Math.round(32 + Math.sin(b) * k), 1, 1);
    g.fillStyle = '#d8323a'; g.fillRect(Math.round(544 + Math.cos(t * 6.28) * 4), Math.round(32 + Math.sin(t * 6.28) * 4), 1, 1);
  } });

  // ---- le passe, au premier plan, de part et d'autre des portes battantes
  const PW = 254;
  for (const [x, cl] of [[6, false], [W - 6 - PW, true]]) { poser(D.passe(PW, x, cl), x, H - 2, { solide: [0, -22, PW, 22] }); C.zone(x + 10, H - 30, PW - 20, 8, 'passe'); }
  P.rect(W / 2 - 22, H - 8, 44, 8, '#120a0c'); P.rect(W / 2 - 18, H - 14, 36, 6, '#4a2a1a'); P.dither(W / 2 - 18, H - 14, 36, 6, '#6a3a24', 6);
  C.porte(W / 2 - 20, H - 10, 40, 10, 'restaurant', 'devantCuisine', 'down');
  C.zone(W / 2 - 20, H - 18, 40, 8, 'sortieCuisine');
  C.arrivees.entree = { x: W / 2, y: H - 24, dir: 'up' };

  // ---- la brigade : Colette à son billot, Horst à ses sauces, Lalo à la plonge ; Rémy sur l'îlot de la pâtisserie
  const P5 = CONFIG.caramel.persos;
  const cuisinier = (id, x, y, dir) => { const p = new Entites.Perso({ id, cfg: P5[id], x, y, dir, fixe: true, dialogue: (J) => EpreuveCaramel.repliques(id, J) }); C.pnj.push(p); return p; };
  C.colette = cuisinier('coletteChef', 400, 228, 'down');
  C.colette.zone = () => ({ x: 380, y: 258, w: 40, h: 14, dialogue: C.colette.dialogue });
  cuisinier('horst', 245, FOND + 52, 'up');
  cuisinier('lalo', 512, FOND + 48, 'up');
  cuisinier('larousse', 300, 186, 'down').zone = function () { return { x: 270, y: 214, w: 44, h: 12, dialogue: this.dialogue }; };
  // un commis fait la navette entre le piano et le passe, une pile d'assiettes dans les bras
  const commis = cuisinier('commis', 456, 300, 'up');
  commis.fixe = false; commis.vitesse = 58;
  const navette = [{ x: 456, y: 300 }, { x: 456, y: 188 }, { x: 352, y: 186 }];
  const boucle = () => commis.allerVers(navette, 58, () => { commis.pauseT = 1.5; });
  commis.update = ((orig) => function (dt, J) { if (this.pauseT > 0) { this.pauseT -= dt; if (this.pauseT <= 0) { navette.reverse(); boucle(); } } orig.call(this, dt, J); })(commis.update);
  boucle();
  const remy = new Resto.Remy({ x: 150, y: 251, h: 31, dialogue: (J) => EpreuveCaramel.parlerRemy(J) });
  C.pnj.push(remy); C.remy = remy;
  const lin = new Entites.Perso({ id: 'linguini', cfg: P5.linguini, x: W / 2, y: H + 20, dir: 'up', visible: false, vitesse: 80 });
  C.pnj.push(lin); C.linguiniCuisine = lin;
  C.onEntree = (J) => EpreuveCaramel.entreeCuisine(J);
  C.finaliser(0.3);
  return C;
});
