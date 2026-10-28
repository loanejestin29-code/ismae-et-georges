// =====================================================================
//  carte-rue.js — ZONE 1 : la rue
//
//  Plan (coordonnées en pixels, y vers le bas) :
//    y   0-300  toits (décor) + placette des Matous (cachée, à l'ouest) + cour + jardin secret
//               · placette : les chats musiciens jouent devant la supérette ; on y entre
//                 seulement par la porte cochère verte de la rue (clé de Colette)
//    y 460-586  la rue : trottoir nord, chaussée pavée
//    y 586-704  quai haut : platanes, fontaine, kiosque, bancs
//    y 704-758  parapet et mur du quai (deux escaliers pour descendre)
//    y 758-850  quai bas, au bord de l'eau, avec la péniche
//    y 858-...  le fleuve
// =====================================================================
'use strict';

Jeu.enregistrerCarte('rue', () => {
  const W = 1600, H = 1060, BASE = 460;
  const C = new Carte('rue', W, H, { ambiance: 'soir', fond: '#151026' });
  const P = C.P, O = C.O;
  const r = PX.rng(2024);

  // ---------------------------------------------------------------- SOL
  Sol.toits(P, 0, 0, W, 300, r);
  // placette des Matous (cachée derrière les immeubles de la rue) et son passage
  const PB = 150, PX0 = 50, PX1 = 420, PSUD = 268; // façades nord, bords ouest / est, limite sud
  const GX = 280, GW = 40;                           // porte cochère sur la rue
  Sol.paves(P, PX0, PB - 2, PX1 - PX0, PSUD - PB + 6, r, { base: ['#8a7f78', '#948880', '#7f766f', '#9a8c80'], hi: '#ada196', lo: '#6c635e', joint: '#544b4a' });
  Sol.bande(P, PX0, PB, PSUD - PB, 10, 0.5, 'droite'); Sol.bande(P, PX1 - 10, PB, PSUD - PB, 10, 0.5, 'gauche');
  Sol.paves(P, GX, PSUD - 4, GW, BASE - PSUD + 9, r, { base: ['#5f5b6d', '#666176', '#58546a'], hi: '#7a768c', lo: '#47435a', joint: '#34304a' });
  Sol.bande(P, GX, PSUD, BASE - PSUD, 12, 0.6, 'droite'); Sol.bande(P, GX + 32, PSUD, BASE - PSUD, 8, 0.4, 'gauche');
  // cour intérieure
  Sol.dalles(P, 520, 160, 240, 140, r);
  Sol.bande(P, 520, 160, 140, 10, 0.5, 'droite'); Sol.bande(P, 750, 160, 140, 10, 0.5, 'gauche');
  Sol.bande(P, 520, 160, 240, 8, 0.35);
  // jardin secret : mur couvert de lierre, pelouse, allée de gravier
  Sol.herbe(P, 1100, 160, 220, 140, r);
  Sol.gravier(P, 1176, 160, 52, 140, r);
  Sol.gravier(P, 1130, 196, 160, 26, r);
  Sol.massif(P, 1108, 164, 60, 12, r); Sol.massif(P, 1240, 164, 72, 12, r);
  P.rect(1100, 100, 220, 60, '#8e8474');
  Sol.murQuai(P, 1100, 104, 220, 56, r);
  P.rect(1100, 98, 220, 6, '#cfc4b0'); P.hline(1100, 98, 220, '#e8dfcc'); P.hline(1100, 103, 220, '#7a7062');
  for (let k = 0; k < 260; k++) { const x = 1100 + r.int(220), y = 104 + r.int(40 + (x % 7)); P.ellipse(x, y, 1 + r.int(2), 1, r.pick(['#2f5d3a', '#3f7a45', '#4e8c4a', '#2a4a33'])); }
  P.rect(1196, 120, 18, 40, '#6a4a32'); for (let y = 122; y < 160; y += 4) P.hline(1197, y, 16, '#4a3222'); P.px(1210, 140, '#e0b04a');
  const arbreFond = Objets.arbreFeuillu(77, { w: 60, h: 70 });
  P.draw(arbreFond.img, 1110, 28); P.draw(Objets.arbreFeuillu(78, { w: 60, h: 70 }).img, 1250, 30);
  Sol.bande(P, 1100, 160, 140, 10, 0.5, 'droite'); Sol.bande(P, 1310, 160, 140, 10, 0.5, 'gauche');
  Sol.bande(P, 1100, 160, 220, 10, 0.45);
  // ruelles
  for (const ax of [600, 1180]) {
    Sol.paves(P, ax, 250, 40, 215, r, { base: ['#5f5b6d', '#666176', '#58546a'], hi: '#7a768c', lo: '#47435a', joint: '#34304a' });
    Sol.bande(P, ax, 250, 215, 12, 0.6, 'droite'); Sol.bande(P, ax + 32, 250, 215, 8, 0.4, 'gauche');
  }
  // trottoir nord + bordure
  Sol.trottoir(P, 0, BASE, W, 28, r);
  Sol.bordure(P, 0, 488, W);
  // chaussée pavée
  Sol.paves(P, 0, 494, W, 87, r);
  P.dither(0, 491, W, 3, '#3f3b50', 12);
  // rails de l'ancien tramway, au milieu de la chaussée
  for (const ry of [526, 547]) {
    P.hline(0, ry, W, '#4a4658'); P.hline(0, ry + 1, W, '#a9a6b8'); P.hline(0, ry + 2, W, '#36324a');
    for (let x = ry % 13; x < W; x += 37) P.rect(x, ry + 1, 3, 1, '#d4d2e2');
  }
  for (const [x, y] of [[480, 512], [1150, 566], [880, 508]]) Sol.plaque(P, x, y);
  for (const [x, y, w] of [[300, 556, 22], [820, 530, 30], [1360, 560, 18]]) {
    P.ellipse(x, y, w / 2, 3, '#3a3f5e'); P.ellipse(x - 1, y, w / 2 - 3, 2, '#454c70');
    P.hline(x - w / 4, y - 1, w / 3, '#8d9cc8'); P.px(x + 3, y + 1, '#6a7ab0');
  }
  // bordure sud + quai haut
  P.dither(0, 579, W, 3, '#2e2a40', 10);
  P.hline(0, 582, W, '#4a4658'); P.hline(0, 583, W, '#d9d1c4'); P.hline(0, 584, W, '#bdb4a5'); P.hline(0, 585, W, '#8f877a');
  Sol.trottoir(P, 0, 586, W, 14, r);
  Sol.gravier(P, 0, 600, W, 104, r);
  P.hline(0, 600, W, '#8f877a');
  // parapet, mur du quai, escaliers
  const ESC = [[360, 32], [1240, 32]];
  Sol.parapet(P, 0, 704, W);
  Sol.murQuai(P, 0, 712, W, 46, r);
  for (const [ex, ew] of ESC) Sol.escalier(P, ex, 704, ew, 56);
  C.escaliers = ESC.map(([ex, ew]) => ({ x: ex, y: 700, w: ew, h: 62 }));
  // quai bas
  Sol.paves(P, 0, 758, W, 92, r, { base: ['#857c74', '#7a726b', '#8e857b', '#766f69', '#8a7c70'], hi: '#a39a8f', lo: '#625b55', joint: '#4a4442' });
  Sol.bande(P, 0, 758, W, 10, 0.55);
  for (let k = 0; k < 160; k++) P.px(r.int(W), 760 + r.int(88), r.pick(['#5d7a4a', '#4e6e44', '#6f8a52']));
  for (const [x, y, w] of [[240, 812, 26], [760, 790, 18], [1340, 822, 22]]) {
    P.ellipse(x, y, w / 2, 3, '#3e4562'); P.ellipse(x - 1, y, w / 2 - 3, 2, '#4a5276'); P.hline(x - w / 4, y - 1, w / 3, '#9aa8d0');
  }
  // bord du quai (margelle) avec anneaux d'amarrage + fleuve
  P.rect(0, 850, W, 4, '#c8bea8'); P.hline(0, 850, W, '#e6dcc8'); P.rect(0, 854, W, 4, '#7a7062');
  for (let x = 0; x < W; x += 30) P.vline(x, 850, 4, '#a89e88');
  for (let x = 70; x < W; x += 130) { P.ellipse(x, 853, 2, 1, '#2a2632'); P.px(x, 852, '#6a6878'); }
  Sol.eau(P, 0, 858, W, H - 858);
  Sol.bande(P, 0, 858, W, 9, 0.6, 'bas', '8,14,30');
  C.eaux.push({ x: 0, y: 860, w: W, h: H - 860 });

  // ---------------------------------------------------------------- COLLISIONS DU DÉCOR
  C.solide(0, 0, PX0, 300); C.solide(PX0, 0, PX1 - PX0, 40); C.solide(PX1, 0, 520 - PX1, 300);
  C.solide(0, PSUD, GX, 50); C.solide(GX + GW, PSUD, 520 - GX - GW, 50); // dos des immeubles de la rue
  C.solide(760, 0, 340, 300); C.solide(1320, 0, 280, 300);
  C.solide(520, 0, 240, 162); C.solide(1100, 0, 220, 160);
  C.solide(0, 702, 360, 58); C.solide(392, 702, 848, 58); C.solide(1272, 702, 328, 58);
  C.solide(0, 850, W, H - 850);


  // ---------------------------------------------------------------- IMMEUBLES
  const B = (o) => Batiments.building(o);
  const bats = {};
  const poser = (cle, b, x, base) => { C.batiment(b, x, base); bats[cle] = { b, x, top: base - b.h, base }; };
  // placette des Matous : la supérette au fond, juste derrière la scène des musiciens
  poser('placeOuest', B({ w: 120, facade: 'ocre', style: 'ancien', etages: 2, boutique: 'porte', volets: '#3f6d8e', lierre: 'gauche', seed: 71, cheminees: 1 }), PX0, PB);
  poser('carrefour', B({ w: 130, facade: 'gris', etages: 2, boutique: 'carrefour', seed: 57 }), 170, PB);
  poser('placeEst', B({ w: 120, facade: 'rose', style: 'ancien', etages: 2, boutique: 'porte', volets: '#7a2a34', porte: '#5a3a28', seed: 73, cheminees: 1 }), 300, PB);
  C.zone(178, PB - 12, 114, 14, null, { dialogue: (J) => (J.quete.tom ? 'superetteVitrineTom' : 'superetteVitrine') });
  // cour
  poser('cour1', B({ w: 120, facade: 'ocre', style: 'ancien', etages: 3, boutique: 'porte', volets: '#5f7f5a', seed: 41, cheminees: 1 }), 520, 162);
  poser('cour2', B({ w: 120, facade: 'rose', style: 'ancien', etages: 3, boutique: 'porte', volets: '#8a5a5a', lierre: 'droite', seed: 43, cheminees: 1 }), 640, 162);
  // la rue (de l'ouest vers l'est). Ismae arrive par l'est ; tout au bout, à l'ouest, une porte
  // cochère verte (entre l'atelier et la maison voisine) mène à la placette cachée
  const rue = [
    ['pharmacie', 0, 150, { facade: 'creme', seed: 31 }],
    ['atelier', 150, 130, { facade: 'ocre', style: 'ancien', etages: 4, volets: '#3f6d8e', lierre: 'gauche', seed: 33 }],
    ['residence', 320, 110, { boutique: 'porte', facade: 'blanc', style: 'ancien', etages: 4, volets: '#4c6f96', porte: '#5a3a28', seed: 45 }],
    ['jazzclub', 430, 60, { facade: 'rose', style: 'ancien', etages: 4, volets: '#7a2a34', seed: 58, cheminees: 1 }],
    ['cafe', 490, 110, { facade: 'ocre', seed: 53 }],
    ['fleuriste', 640, 130, { facade: 'rose', seed: 55, etages: 4, lierre: 'droite' }],
    ['fromagerie', 770, 130, { facade: 'creme', seed: 51 }],
    ['boulangerie', 900, 140, { facade: 'creme', seed: 59 }],
    ['librairie', 1040, 140, { facade: 'ocre', style: 'ancien', etages: 4, volets: '#4c6f96', seed: 61 }],
    ['hotel', 1220, 140, { facade: 'blanc', seed: 63 }],
    ['patisserie', 1360, 120, { facade: 'rose', seed: 65, etages: 4 }],
    ['antiquaire', 1480, 120, { facade: 'vert', style: 'ancien', etages: 4, volets: '#2f5a46', seed: 67, lierre: 'gauche' }],
  ];
  for (const [type, x, w, o] of rue) {
    const b = B(Object.assign({ w, boutique: type }, o));
    poser(type, b, x, BASE);
    C.zone(x + 8, BASE - 12, w - 16, 14, type);
    b.ampoules.forEach(([bx, by]) => C.scintille.push([x + bx, BASE - b.h + by]));
    // guirlande lumineuse sous l'enseigne
    if (type !== 'jazzclub') {
      const gl = Objets.guirlande(w - 8, 4);
      C.dessusImg(gl.img, x + 4, BASE - 50);
      gl.bulbs.forEach(([bx, by]) => C.scintille.push([x + 4 + bx, BASE - 50 + by]));
    }
  }

  // ---------------------------------------------------------------- PORTE COCHÈRE VERTE (vers la placette)
  // fermée à clé : il faut d'abord la piste de Tom, puis la clé que prête Colette sur le quai
  const porche = Objets.porche();
  C.objet(porche, GX, BASE, { dy: 0.2 });
  C.solide(GX, BASE - 8, 5, 10); C.solide(GX + GW - 5, BASE - 8, 5, 10);
  const verrou = { x: GX, y: BASE - 8, w: GW, h: 10 };
  C.solides.push(verrou);
  const OX = GX - porche.ax + porche.ouv.x, OY = BASE - porche.ay + porche.ouv.y;
  C.dynamiques.push({
    ouvert: 0, sortY: BASE + 0.1,
    update(dt, J) {
      const voulu = J.quete.porteOuverte ? 1 : 0;
      this.ouvert = Math.max(0, Math.min(1, this.ouvert + (voulu ? dt * 0.8 : -dt)));
      verrou.w = this.ouvert > 0.5 ? 0 : GW;
    },
    draw(g) { Objets.vantaux(g, OX, OY, porche, this.ouvert); },
  });
  C.zone(GX + 4, BASE - 10, GW - 8, 16, null, {
    dialogue: (J) => {
      const Q = J.quete;
      if (Q.porteOuverte) return 'porcheOuvert';
      if (!Q.cle) return Q.tom ? 'porcheFermeTom' : 'porcheFerme';
      Q.porteOuverte = true; Musique.porte();
      return 'porcheOuverture';
    },
  });
  C.objet(Objets.lanterneMurale(), GX + 20, BASE - 60, { dy: 60.3 });
  C.lumiere(GX + 20, BASE - 64, 34, 'lamp'); C.lumiere(GX + 20, PSUD + 30, 46, 'xmas');

  // ---------------------------------------------------------------- SUPÉRETTE : portes vitrées qui s'ouvrent seules
  const sup = bats.carrefour, door = sup.b.door;
  const DX = sup.x + door.x, DY = sup.top + door.y, DW = door.w, DH = door.h;
  const portes = {
    ouvert: 0, sortY: PB + 0.5, son: false,
    update(dt, J) {
      const p = J.joueur;
      const pres = Math.abs(p.x - (DX + DW / 2)) < 26 && p.y < PB + 34;
      if (pres && this.ouvert === 0) Musique.porte();
      this.ouvert = Math.max(0, Math.min(1, this.ouvert + (pres ? dt * 3 : -dt * 2.2)));
    },
    draw(g) {
      g.save(); g.beginPath(); g.rect(DX, DY, DW, DH); g.clip();
      const half = DW / 2, off = Math.round(this.ouvert * (half - 1));
      for (const [x0, s] of [[DX - off, 0], [DX + half + off, 1]]) {
        g.fillStyle = 'rgba(200,226,236,0.45)'; g.fillRect(x0, DY, half, DH);
        g.fillStyle = '#142a54'; g.fillRect(x0, DY, half, 2); g.fillRect(x0, DY + DH - 3, half, 3);
        g.fillRect(s ? x0 : x0 + half - 1, DY, 1, DH);
        g.fillStyle = '#e8b54a'; g.fillRect(s ? x0 + 1 : x0 + half - 3, DY + 12, 2, 1);
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x0 + 2, DY + 4, 1, 5); g.fillRect(x0 + 3, DY + 3, 1, 3);
      }
      g.restore();
    },
  };
  C.dynamiques.push(portes);
  C.porte(DX + 2, PB - 8, DW - 4, 14, 'superette', 'entree', 'up');
  C.portes[C.portes.length - 1].condition = () => portes.ouvert > 0.6;
  C.arrivees.devantSuperette = { x: DX + DW / 2, y: PB + 16, dir: 'down' };
  P.rect(DX + 1, PB + 1, DW - 2, 6, '#7a2a2e'); P.hline(DX + 1, PB + 1, DW - 2, '#a8484a');
  for (let x = DX + 2; x < DX + DW - 2; x += 3) P.px(x, PB + 4, '#c9a040');

  // ---------------------------------------------------------------- MOBILIER
  const lampe = (x, y) => {
    C.objet(Objets.lampadaire(), x, y, { solide: [-3, -3, 6, 4], ombre: [5, 2], lumiere: false });
    C.lumiere(x, y - 6, 74, 'lamp'); C.lumiere(x, y - 50, 10, 'halo');
  };
  [342, 708, 1090, 1470].forEach((x) => lampe(x, 486));
  [64, 406].forEach((x) => lampe(x, 252));
  [140, 520, 900, 1330].forEach((x) => lampe(x, 598));
  [300, 720, 1100, 1500].forEach((x) => lampe(x, 698));
  // platanes illuminés le long du quai
  [60, 220, 440, 640, 1000, 1170, 1400, 1550].forEach((x, i) => {
    Sol.grille(P, x, 646);
    C.objet(Objets.platane(100 + i), x, 646, { solide: [-4, -3, 8, 5], ombre: [8, 3] });
    C.lumiere(x, 600, 42, 'tree');
  });

  // ---------------------------------------------------------------- LA PLACETTE : scène des chats musiciens
  // la scène est posée devant la supérette : on passe derrière les musiciens pour atteindre sa porte
  const SX = 160, SW = 150, SBASE = 222;
  C.objet(Objets.scene(SW, 30), SX, SBASE, {});
  C.solide(SX, SBASE - 34, SW, 34);
  C.objet(Objets.banderole('MATOUS SWING'), SX + 22, SBASE - 36, { dy: -1 });
  const gs = Objets.guirlande(SW, 9); C.dessusImg(gs.img, SX, SBASE - 58); gs.bulbs.forEach(([bx, by]) => C.scintille.push([SX + bx, SBASE - 58 + by]));
  C.lumiere(SX + 40, SBASE - 20, 64, 'lamp'); C.lumiere(SX + 110, SBASE - 20, 64, 'lamp'); C.lumiere(SX + 75, SBASE - 38, 30, 'xmas');
  C.sourceMusique = { x: SX + SW / 2, y: SBASE };
  const groupe = [['contrebasse', 'contrebasse', SX + 18], ['piano', 'pianiste', SX + 46], ['trompette', 'charlie', SX + 76], ['batterie', 'batteur', SX + 106], ['clarinette', 'clarinette', SX + 134]];
  groupe.forEach(([type, id, x], i) => {
    const m = new Entites.Musicien({ type, id, x, y: SBASE - 12, sortYFixe: SBASE + 1 + i * 0.01, decalage: i * 0.13 });
    m.dialogue = (J) => Scenes.repliques(id, J);
    m.zone = () => ({ x: m.x - 12, y: SBASE - 6, w: 24, h: 16, dialogue: m.dialogue });
    C.pnj.push(m);
  });
  C.zone(SX + 4, SBASE - 6, 14, 16, 'scene');
  // sapin, bancs et caisses de livraison sur la placette
  C.objet(Objets.grandSapin(9), 98, 262, { solide: [-12, -6, 24, 8], ombre: [16, 4], texte: 'sapin', zw: 36, zh: 18 });
  C.lumiere(98, 232, 80, 'tree'); C.lumiere(98, 198, 18, 'xmas');
  for (const [x, y] of [[140, 266], [372, 266]]) C.objet(Objets.banc(), x, y, { solide: [-13, -6, 26, 6], ombre: [13, 2] });
  C.objet(Objets.chevaletAffiche(3, 'JAZZ'), 396, 214, { solide: [-9, -3, 18, 4], ombre: [9, 2], texte: 'affiche', zw: 20 });
  C.objet(Objets.pot(3, 'sapin'), 160, 158, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.caisses(11), 400, 172, { solide: [-10, -6, 20, 7], ombre: [11, 2] });
  // sur la rue, une colonne d'affiches juste avant la porte verte
  C.objet(Objets.colonneAffiches(5), 252, 482, { solide: [-10, -5, 20, 6], ombre: [11, 3], texte: 'colonne', zw: 22 });

  // ---------------------------------------------------------------- DEVANTURES
  [[508, 478], [548, 476], [586, 478]].forEach(([x, y], i) => {
    C.objet(Objets.chaiseBistrot(), x - 8, y - 1, { solide: [-3, -2, 6, 3] });
    C.objet(Objets.tableCafe(), x, y, { solide: [-4, -2, 8, 3], ombre: [5, 2], texte: i === 1 ? 'terrasse' : null, zw: 18 });
    C.objet(Objets.chaiseBistrot(), x + 8, y + 1, { solide: [-3, -2, 6, 3] });
  });
  C.objet(Objets.etalFleurs(7), 700, 479, { solide: [-15, -6, 30, 7], ombre: [15, 2], texte: 'fleuriste', zw: 30 });
  C.objet(Objets.pot(8), 652, 476, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.chevaletAffiche(8, 'CLUB'), 478, 486, { solide: [-9, -3, 18, 4], ombre: [9, 2], texte: 'jazzclub', zw: 20 });
  C.objet(Objets.velo(), 1146, 480, { solide: [-11, -3, 22, 4], ombre: [11, 2], texte: 'velo', zw: 24 });
  C.objet(Objets.pot(13, 'sapin'), 1272, 474, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(14, 'sapin'), 1308, 474, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(15), 1500, 474, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.chevaletAffiche(12, 'JAZZ'), 1166, 600, { solide: [-9, -3, 18, 4], ombre: [9, 2], texte: 'affiche', zw: 20 });

  // ---------------------------------------------------------------- QUAIS
  C.objet(Objets.fontaine(), 560, 652, { solide: [-8, -5, 16, 6], ombre: [9, 3], texte: 'fontaine', zw: 22 });
  C.zones[C.zones.length - 1].action = (J) => { for (let k = 0; k < 6; k++) J.particule('goutte', 560 + Math.random() * 6 - 3, 632, { vy: -20 + Math.random() * 10, vx: Math.random() * 16 - 8, max: 0.6 }); };
  C.objet(Objets.kiosque(), 820, 640, { solide: [-16, -8, 32, 9], ombre: [17, 3], texte: 'kiosque', zw: 34 });
  [[300, 690], [680, 690], [1000, 690], [1440, 690]].forEach(([x, y], i) => C.objet(Objets.banc(), x, y, { solide: [-13, -6, 26, 6], ombre: [13, 2], texte: i === 1 ? 'banc' : null, zw: 26, zh: 14 }));
  [450, 482, 514, 1040, 1072, 1104, 1136].forEach((x, i) => C.objet(Objets.boiteBouquiniste(20 + i), x, 711, { texte: i === 2 ? 'bouquiniste' : null, zw: 30, zh: 14 }));
  for (const [x, y, w] of [[120, 664, 60], [1250, 662, 70], [940, 662, 40]]) Sol.massif(P, x, y, w, 12, r);
  for (let x = 40; x < W; x += 90) C.objet(Objets.borne(), x, 846, { solide: [-2, -2, 4, 3], ombre: [3, 1] });
  for (const x of [200, 600, 1000, 1400]) { C.objet(Objets.lanterneMurale(), x, 738, { dy: -40 }); C.lumiere(x, 740, 70, 'lamp'); C.lumiere(x, 734, 8, 'halo'); }
  [330, 1240].forEach((x) => lampe(x, 846));
  C.objet(Objets.barque(), 1330, 905, {});
  C.zone(1310, 836, 44, 14, 'barque');
  C.objet(Objets.echelle(), 1180, 853, { dy: -4 });
  C.objet(Objets.tonneau(), 1296, 778, { solide: [-5, -3, 10, 4], ombre: [6, 2] });
  C.objet(Objets.tonneau(), 1309, 781, { solide: [-5, -3, 10, 4], ombre: [6, 2] });
  C.objet(Objets.caisses(32), 1212, 776, { solide: [-10, -6, 20, 7], ombre: [11, 2] });
  C.objet(Objets.banc(), 900, 800, { solide: [-13, -6, 26, 6], ombre: [13, 2] });
  C.objet(Objets.banc(), 160, 800, { solide: [-13, -6, 26, 6], ombre: [13, 2] });
  C.objet(Objets.voiture(), 1040, 578, { solide: [-30, -9, 62, 10], ombre: [30, 3], texte: 'voiture', zw: 64, zh: 14, lumiere: false });
  const pen = Objets.peniche(5);
  C.objet(pen, 520, 922, {});
  C.zone(540, 836, 200, 14, 'peniche');
  pen.lights.forEach(([lx, ly]) => C.lumiere(520 + lx, 922 - pen.ay + ly, 34, 'boat'));
  C.objet(Objets.caisses(31), 1520, 800, { solide: [-10, -6, 20, 7], ombre: [11, 2] });
  C.zone(0, 840, W, 12, 'fleuve');
  for (const [x, y] of [[18, 520], [18, 568], [1582, 520], [1582, 568], [18, 650], [1582, 650]]) {
    C.objet(Objets.barriere(), x, y, { ombre: [16, 2], texte: 'barriere', zw: 36, zh: 20, rayon: 30 });
  }
  C.solide(0, 460, 30, 242); C.solide(1570, 460, 30, 242);

  // ---------------------------------------------------------------- COUR ET JARDIN
  C.objet(Objets.pompe(), 560, 214, { solide: [-6, -4, 12, 5], ombre: [6, 2], texte: 'puits', zw: 18 });
  C.objet(Objets.poubelles(), 728, 192, { solide: [-12, -5, 24, 6], ombre: [12, 2], texte: 'poubelles', zw: 26 });
  C.objet(Objets.pot(21), 540, 172, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.pot(22), 698, 172, { solide: [-5, -3, 10, 4], ombre: [5, 2] });
  C.objet(Objets.chevaletPeintre(), 702, 236, { solide: [-6, -3, 12, 4], ombre: [7, 2] });
  for (const [x, mot, seed] of [[586, 'JAZZ', 21], [668, 'BLUES', 22]]) C.objet({ img: Batiments.affiche(seed, mot === 'BLUES' ? 'CHAT' : mot), ax: 8, ay: 22 }, x, 150, { dy: 13, texte: 'affiche', zw: 18, zh: 30 });
  const linge1 = Objets.linge(240, 3), linge2 = Objets.linge(40, 4), linge3 = Objets.linge(40, 6);
  C.dessusImg(linge1.img, 520, 88); C.dessusImg(linge2.img, 600, 316); C.dessusImg(linge3.img, 600, 372);
  C.zone(600, 330, 40, 50, 'linge');
  const gc = Objets.guirlande(240, 10); C.dessusImg(gc.img, 520, 146); gc.bulbs.forEach(([bx, by]) => C.scintille.push([520 + bx, 146 + by]));
  C.lumiere(640, 240, 60, 'xmas'); C.lumiere(560, 200, 40, 'lamp');
  C.objet(Objets.arbreFeuillu(88, { coeur: true, w: 70, h: 80 }), 1262, 230, { solide: [-5, -4, 10, 5], ombre: [16, 4] });
  C.zone(1250, 212, 24, 20, 'coeur');
  C.objet(Objets.banc(), 1160, 206, { solide: [-13, -6, 26, 6], ombre: [13, 2] });
  const gj = Objets.guirlande(220, 14); C.dessusImg(gj.img, 1100, 150); gj.bulbs.forEach(([bx, by]) => C.scintille.push([1100 + bx, 150 + by]));
  C.lumiere(1210, 220, 70, 'xmas'); C.lumiere(1205, 140, 30, 'lamp');
  C.objet(Objets.lanterneMurale(), 1218, 130, { dy: 40 });
  for (const ax of [600, 1180]) { C.objet(Objets.lanterneMurale(), ax + 4, 330, { dy: 140 }); C.lumiere(ax + 6, 330, 40, 'lamp'); C.lumiere(ax + 4, 326, 6, 'halo'); }
  C.zoneRencontre = { x: 1100, y: 160, w: 220, h: 140 }; // le jardin secret (par la ruelle de l'hôtel)

  // ---------------------------------------------------------------- CHATS AUX FENÊTRES ET SUR LES TOITS
  const robes = ['blanc', 'roux', 'gris', 'tigre', 'siamois', 'smoking', 'matou'];
  const rc = PX.rng(31);
  const fenetres = [
    ['fromagerie', 2, 'assis'], ['cafe', 1, 'dort'], ['cafe', 6, 'assis'], ['fleuriste', 3, 'cote'], ['carrefour', 9, 'assis'],
    ['jazzclub', 2, 'assis'], ['boulangerie', 4, 'dort'], ['librairie', 5, 'assis'], ['hotel', 10, 'assis'], ['hotel', 3, 'cote'],
    ['patisserie', 1, 'assis'], ['antiquaire', 4, 'dort'], ['pharmacie', 7, 'assis'], ['atelier', 2, 'cote'], ['cour1', 4, 'assis'], ['cour2', 1, 'dort'],
    ['placeEst', 2, 'assis'], ['placeOuest', 3, 'cote'], ['residence', 4, 'dort'],
  ];
  fenetres.forEach(([cle, idx, mode], k) => {
    const bt = bats[cle], f = bt.b.fenetres[idx % bt.b.fenetres.length];
    const parle = k % 4 === 0;
    C.pnj.push(new Entites.ChatPNJ({
      nom: robes[k % robes.length], x: bt.x + f.x, y: bt.top + f.y + 1, mode, flip: rc.chance(0.5),
      sortYFixe: bt.base + 1, sansOmbre: true, texte: parle ? 'chatFenetre' : null,
      zoneFixe: parle ? [bt.x + f.x - 14, bt.base - 12, 28, 16] : null,
    }));
  });
  // promeneurs sur les toits (on les voit surtout depuis la cour, le jardin et la place)
  const toit = (cle) => bats[cle].top + 16 + (bats[cle].b.h > 200 ? 9 : 6);
  C.pnj.push(
    new Entites.ChatPNJ({ nom: 'gris', x: 540, y: toit('cafe'), mode: 'promeneur', x1: 500, x2: 590, texte: 'chatToits', sortYFixe: BASE + 1, zoneFixe: [0, 0, 0, 0] }),
    new Entites.ChatPNJ({ nom: 'roux', x: 235, y: toit('carrefour'), mode: 'promeneur', x1: 185, x2: 290, sortYFixe: PB + 1 }),
    new Entites.ChatPNJ({ nom: 'smoking', x: 1300, y: toit('hotel'), mode: 'promeneur', x1: 1230, x2: 1350, sortYFixe: BASE + 1 }),
    new Entites.ChatPNJ({ nom: 'blanc', x: 60, y: bats.pharmacie.top + 25, mode: 'cote', sortYFixe: BASE + 1 }),
    new Entites.ChatPNJ({ nom: 'tigre', x: 1010, y: toit('boulangerie'), mode: 'dort', sortYFixe: BASE + 1 }),
  );
  // chats des recoins
  C.pnj.push(
    new Entites.ChatPNJ({ nom: 'gris', x: 1236, y: 262, mode: 'joueur', texte: 'chatGris', rx: 60, ry: 26 }),
    new Entites.ChatPNJ({ nom: 'tigre', x: 1160, y: 203, mode: 'dort', texte: 'chatTigre', sortYFixe: 207, sansOmbre: true }),
    new Entites.ChatPNJ({ nom: 'roux', x: 1086, y: 846, mode: 'cote', texte: 'chatPecheur' }),
    new Entites.ChatPNJ({ nom: 'siamois', x: 1436, y: 472, mode: 'assis' }),
  );
  // canne à pêche du chat pêcheur
  C.pnj.push({
    sortY: 847,
    draw(g, J) {
      const bob = Math.round(Math.sin(J.t * 2) * 1);
      g.fillStyle = '#7a5434';
      for (let i = 0; i < 16; i++) g.fillRect(1092 + i, 836 - Math.round(i * 0.55), 1, 1);
      g.fillStyle = 'rgba(230,230,240,0.6)';
      for (let y = 828; y < 872 + bob; y += 2) g.fillRect(1108 + Math.round((y - 828) * 0.12), y, 1, 1);
      g.fillStyle = '#e8434b'; g.fillRect(1113, 872 + bob, 2, 2); g.fillStyle = '#ffffff'; g.fillRect(1113, 871 + bob, 2, 1);
    },
  });
  for (let k = 0; k < 6; k++) C.pnj.push(new Entites.Pigeon(500 + Math.random() * 120, 615 + Math.random() * 60, [480, 610, 160, 70]));
  for (let k = 0; k < 4; k++) C.pnj.push(new Entites.Pigeon(70 + Math.random() * 80, 236 + Math.random() * 20, [64, 230, 90, 30]));

  // ---------------------------------------------------------------- HABITANTS
  const habitant = (o) => { const h = new Entites.Passant(Object.assign({ dialogue: (J) => Scenes.repliques(o.id, J) }, o)); C.pnj.push(h); return h; };
  habitant({ id: 'boulangere', x: 970, y: 478, regardeDefaut: 'down',
    cfg: { peau: '#f0c4a0', cheveux: '#8a5a3a', coiffure: 'chignon', barbe: 'aucune', yeux: '#3a2a2e', veste: '#a8484a', tablier: '#f4efe6', coupe: 'robe', pantalon: '#7a3a3a', chaussures: '#3a2a2a' } });
  habitant({ id: 'livreur', x: 340, y: 498, vitesse: 26,
    chemin: [{ x: 700, y: 498, pause: 2, regard: 'up' }, { x: 1040, y: 498, pause: 1.5, regard: 'up' }, { x: 340, y: 498, pause: 2, regard: 'left' }],
    cfg: { peau: '#d8a07a', cheveux: '#2a2020', coiffure: 'court', barbe: 'aucune', yeux: '#2a1d2e', chapeau: 'casquette', couleurChapeau: '#4a5a7a', ruban: '#2a3a5a', veste: '#5a7a5a', echarpe: '#e8c84a', pantalon: '#4a4a5a', chaussures: '#3a2a22' } });
  // Colette prête la clé de la porte verte, une fois qu'Ismae cherche Tom.
  // Elle se promène en bas des quais, au bord de l'eau, entre la péniche et la barque.
  habitant({ id: 'colette', x: 620, y: 828, vitesse: 16,
    dialogue: (J) => { const l = Scenes.repliques('colette', J); if (J.quete.tom) J.quete.cle = true; return l; },
    chemin: [{ x: 760, y: 828, pause: 3.5, regard: 'down' }, { x: 1030, y: 828, pause: 2.5, regard: 'down' }, { x: 470, y: 828, pause: 3, regard: 'down' }],
    cfg: { peau: '#f2cdb0', cheveux: '#c8823a', coiffure: 'chignon', barbe: 'aucune', yeux: '#3a5a8a', chapeau: 'capeline', couleurChapeau: '#6a4a8a', ruban: '#e8b54a', fleur: '#ff9ac0', veste: '#4a5aa0', echarpe: '#f0e0d0', coupe: 'robe', pantalon: '#3a3a6a', chaussures: '#2a2026' } });
  habitant({ id: 'fernand', x: 1110, y: 514, vitesse: 11,
    chemin: [{ x: 1380, y: 514, pause: 4, regard: 'up' }, { x: 1110, y: 514, pause: 4, regard: 'up' }],
    cfg: { peau: '#e8c0a0', cheveux: '#dcd8e2', coiffure: 'court', barbe: 'pleine', couleurBarbe: '#ecebf0', lunettes: true, yeux: '#2a1d2e', chapeau: 'melon', couleurChapeau: '#2a2630', ruban: '#4a3a3a', veste: '#5e4a3a', echarpe: '#8a2a3a', pantalon: '#3a3440', chaussures: '#2a2026' } });
  habitant({ id: 'peintre', x: 718, y: 240, regardeDefaut: 'left',
    cfg: { peau: '#e0b08a', cheveux: '#3a2a24', coiffure: 'boucles', barbe: 'courte', yeux: '#2a1d2e', chapeau: 'beret', couleurChapeau: '#2a2a3a', veste: '#e8e0d0', echarpe: '#c9483b', pantalon: '#4a5a7a', chaussures: '#3a2a22' } });

  // ---------------------------------------------------------------- DUCHESSE ET LES CHATONS (cachés jusqu'à l'intro)
  const aristo = (o) => { const c = new Entites.ChatScript(Object.assign({ visible: false }, o)); C.pnj.push(c); return c; };
  C.aristochats = {
    duchesse: aristo({ nom: 'duchesse', adulte: true, x: 1205, y: 164, dir: 'down', vitesse: 30 }),
    marie: aristo({ nom: 'marie', x: 0, y: 0 }),
    toulouse: aristo({ nom: 'toulouse', x: 0, y: 0 }),
    berlioz: aristo({ nom: 'berlioz', x: 0, y: 0 }),
  };

  // ---------------------------------------------------------------- ARRIVÉES
  C.arrivees.depart = { x: 1440, y: 520, dir: 'left' };
  C.finaliser();
  return C;
});
