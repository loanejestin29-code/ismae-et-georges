// =====================================================================
//  carte-montaigu.js — ZONE 5 : Montaigu (l'arrivée du bus, épreuve 4)
//  Pour l'instant, seulement l'arrêt de bus et sa petite rue illuminée pour Noël :
//  la zone à explorer et la cinquième épreuve viendront ensuite (les rues sont barrées).
// =====================================================================
'use strict';

Jeu.enregistrerCarte('montaigu', () => {
  const W = 600, H = 330, A = Arendelle;
  const C = new Carte('montaigu', W, H, { ambiance: 'soir', fond: '#151026' });
  const P = C.P, r = PX.rng(85);
  C.neige = 1.2;
  // le sol enneigé, la rue et le trottoir
  P.rect(0, 0, W, H, '#e6edf7'); P.speckle(0, 0, W, H, ['#f4f8ff', '#d8e2f0'], 0.12, r);
  A.fond(P, W, 70, r);
  Sol.paves(P, 0, 210, W, 56, r, { base: ['#7c7c90', '#86869c', '#74748a'], hi: '#a4a4b8', lo: '#606076', joint: '#525268' });
  P.g.globalAlpha = 0.32; P.rect(0, 210, W, 56, '#e6ecf6'); P.g.globalAlpha = 1; // une fine couche de neige
  Sol.trottoir(P, 0, 186, W, 24, r); P.g.globalAlpha = 0.4; P.rect(0, 186, W, 24, '#eef3fb'); P.g.globalAlpha = 1;
  Sol.bordure(P, 0, 208, W);
  for (let x = 0; x < W; x += 26) P.rect(x, 237, 14, 2, '#eef3fb'); // les lignes blanches
  C.solide(0, 0, W, 112);
  // les maisons vendéennes : murs blancs, toits de tuiles rouges, volets bleus
  let x = 8;
  [[60, 'pignon'], [70, 'long'], [66, 'pignon', 'boulangerie'], [66, 'long']].forEach(([w, style, boutique], k) => {
    const m = A.maison(400 + k, { w, style, boutique, couleur: ['#efe6d4', '#f2ead8', '#e8dcc4', '#f4ecdc'][k], volets: ['#3a6aa8', '#5a8aa8', '#3a6aa8', '#2f6a5a'][k], tuiles: true });
    const cx = x + m.largeur / 2;
    C.objet(m, cx, 186);
    C.solide(cx - m.mur / 2, 112, m.mur, 74);
    m.lumieres.forEach(([lx, ly, rr, kk]) => C.lumiere(cx - m.ax + lx, 186 - m.ay + ly, rr, kk));
    m.ampoules.forEach(([bx, by]) => C.scintille.push([cx - m.ax + bx, 186 - m.ay + by]));
    if (m.fumee) C.fumees.push({ x: cx - m.ax + m.fumee[0], y: 186 - m.ay + m.fumee[1], t: r() * 2 });
    x += m.largeur + 4;
  });
  // l'église, toute illuminée
  const eg = PX.canvas(64, 120), E = PX.painter(eg);
  E.rect(6, 50, 52, 70, '#e8e0cc'); for (let y = 54; y < 120; y += 6) E.hline(6, y, 52, '#d4cab4');
  E.trap(24, 16, 4, 56, 30, 22, '#7a3a2c'); E.trap(24, 16, 4, 56, 28, 6, '#eef3fb');
  E.rect(24, 10, 16, 42, '#ddd4bc'); E.trap(28, 8, 22, 20, -2, 14, '#5a5068'); E.vline(32, 0, 6, '#e8b54a'); E.hline(30, 2, 5, '#e8b54a');
  E.rect(29, 20, 6, 10, '#ffcf72'); E.ellipse(32, 20, 3, 2, '#ffcf72'); E.rect(26, 90, 12, 30, '#5a3a24'); E.ellipse(32, 90, 6, 4, '#5a3a24');
  for (const fx of [14, 50]) { E.rect(fx - 3, 66, 6, 14, '#ffcf72'); E.ellipse(fx, 66, 3, 2, '#ffcf72'); }
  C.objet({ img: eg, ax: 32, ay: 119 }, 452, 186, { solide: [-26, -60, 52, 60] });
  for (const [lx, ly, rr] of [[452, 116, 30], [438, 132, 22], [474, 132, 22], [452, 176, 26]]) C.lumiere(lx, ly, rr, 'win');
  C.zone(440, 180, 24, 10, 'egliseMontaigu');
  // l'abribus, le panneau de la ville, le sapin, les réverbères, la guirlande
  const abri = A.arretBus();
  C.objet(abri, 300, 200, { solide: [-20, -6, 50, 7] });
  abri.lumieres.forEach(([lx, ly, rr, k]) => C.lumiere(300 - abri.ax + lx, 200 - abri.ay + ly, rr, k));
  C.zone(282, 196, 40, 10, 'abribusMontaigu');
  const panneau = PX.canvas(52, 26), Pn = PX.painter(panneau);
  Pn.rect(0, 0, 52, 15, '#d8323a'); Pn.rect(2, 2, 48, 11, '#f4f4f8'); A.texte(Pn, 'MONTAIGU', 10, 5, '#1d1626'); Pn.rect(4, 15, 2, 11, '#8a8a9a'); Pn.rect(46, 15, 2, 11, '#8a8a9a');
  C.objet({ img: panneau, ax: 26, ay: 25 }, 40, 288, { solide: [-24, -2, 48, 3], texte: 'panneauMontaigu', zw: 40 });
  C.objet(Objets.grandSapin(9), 380, 200, { solide: [-7, -4, 14, 5], ombre: [16, 4], rayon: 60, k: 'xmas' });
  for (const lx of [120, 240, 500, 580]) C.objet(A.lampadaire(), lx, 196, { solide: [-2, -3, 5, 4], rayon: 56 });
  C.objet(A.banc(), 548, 200, { solide: [-13, -3, 26, 4] });
  const gl = Objets.guirlande(W, 8); C.dessusImg(gl.img, 0, 180); gl.bulbs.forEach(([bx, by]) => C.scintille.push([bx, 180 + by]));
  // les rues barrées : la suite de l'aventure viendra plus tard
  for (const bx of [4, W - 36]) {
    C.objet(Foret.barriere(32), bx, 300, { solide: [0, -50, 32, 50] });
    C.zone(bx, 280, 32, 24, 'routeBarree');
  }
  C.solide(0, 300, W, 30);
  C.montaigu = { bus: { x: 300, y: 232 }, descente: { x: 314, y: 236 } };
  C.arrivees.bus = { x: 300, y: 254, dir: 'down' };
  C.onEntree = (J) => Bus.arriveeMontaigu(J);
  C.finaliser(0.22);
  return C;
});
