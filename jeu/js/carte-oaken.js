// =====================================================================
//  carte-oaken.js — l'intérieur du comptoir d'Oaken (et sauna), à Arendelle
//  Oaken derrière son comptoir, les cuillères sur l'étagère, la caisse de carottes,
//  le poêle, les maillots de bain en promo… et la porte du sauna.
// =====================================================================
'use strict';

Jeu.enregistrerCarte('oaken', () => {
  const W = 288, H = 208, FOND = 70;
  const C = new Carte('oaken', W, H, { ambiance: 'interieur', fond: '#1a120c' });
  const P = C.P, r = PX.rng(808), A = Arendelle;
  // plancher
  for (let y = FOND; y < H; y += 6) { P.rect(0, y, W, 6, r.pick(['#8a5a32', '#946238', '#82542e'])); P.hline(0, y, W, '#a8743e'); for (let x = r.int(40); x < W; x += 40 + r.int(30)) P.vline(x, y, 6, '#5a3a22'); }
  P.ellipse(144, 150, 70, 26, '#7a2a2a'); P.ellipse(144, 150, 64, 22, '#a8343a'); for (let k = 0; k < 7; k++) P.ellipse(144, 150, 56 - k * 8, 18 - k * 2.6, k % 2 ? '#c8a050' : '#a8343a');
  // mur de rondins
  for (let y = 0; y < FOND; y += 7) { P.rect(0, y, W, 7, '#7a4a2a'); P.hline(0, y, W, '#9a6a3a'); P.hline(0, y + 6, W, '#4a2e1c'); }
  P.dither(0, FOND - 8, W, 8, '#1a120c', 6);
  C.solide(0, 0, W, FOND + 6); C.solide(0, 0, 10, H); C.solide(W - 10, 0, 10, H);
  P.rect(0, FOND, 10, H - FOND, '#4a2e1c'); P.rect(W - 10, FOND, 10, H - FOND, '#4a2e1c');
  // banderole « grande liquidation d'hiver »
  P.rect(84, 6, 120, 13, '#d8323a'); P.hline(84, 6, 120, '#ff6a5a'); A.texte(P, 'GRANDE LIQUIDATION', 108, 8, '#ffffff');
  // étagères : bonnets, moufles, patins, maillots de bain, et les cuillères
  const etagere = (x, y, w) => { P.rect(x, y, w, 3, '#5a3a22'); P.hline(x, y, w, '#a8743e'); };
  for (const y of [26, 44]) etagere(14, y, 66);
  for (let k = 0; k < 6; k++) { const x = 18 + k * 10, col = ['#c8343a', '#3a6aa8', '#f2c230', '#4f8a5a', '#e86a9a', '#f4efe6'][k]; P.rect(x, 19, 7, 7, col); P.rect(x, 19, 7, 2, '#ffffff'); }
  for (let k = 0; k < 4; k++) { const x = 18 + k * 15; P.rect(x, 36, 4, 8, '#c8c4cc'); P.rect(x + 6, 36, 4, 8, '#c8c4cc'); P.hline(x, 43, 10, '#5a5668'); }
  for (const y of [26, 44]) etagere(208, y, 66);
  for (let k = 0; k < 5; k++) { const x = 212 + k * 12, col = ['#3a8ad8', '#f2c230', '#e86a9a', '#4f8a5a', '#f08a24'][k]; P.rect(x, 17, 9, 9, col); for (let y = 19; y < 26; y += 3) P.hline(x, y, 9, '#ffffff'); }
  P.rect(212, 33, 58, 11, '#2a1e18');
  C.zone(14, FOND, 66, 12, 'rayonsOaken'); C.zone(208, FOND, 66, 12, 'rayonsOaken');
  // l'étagère aux ustensiles, avec les deux cuillères qui brillent
  const cuilleres = { sortY: FOND + 1, pris: false,
    draw(g, J) {
      if (this.pris) return;
      for (const x of [104, 112]) { g.fillStyle = '#5a5668'; g.fillRect(x, 32, 1, 9); g.fillStyle = '#c8ccd8'; g.fillRect(x - 1, 28, 3, 5); g.fillStyle = '#ffffff'; g.fillRect(x - 1, 28, 1, 2); }
      if (Scenes.quete.neige === 'quete') A.paillettes(J, 108, 32, 40, 4, 7, 5);
    } };
  P.rect(96, 40, 26, 3, '#5a3a22'); P.hline(96, 40, 26, '#a8743e');
  C.dynamiques.push(cuilleres);
  // le comptoir
  const comptoir = { img: (() => { const c = PX.canvas(112, 24), Q = PX.painter(c); Q.rect(0, 0, 112, 6, '#a8743e'); Q.hline(0, 0, 112, '#c89058'); Q.rect(0, 6, 112, 18, '#7a4a2a'); for (let x = 4; x < 112; x += 12) Q.vline(x, 7, 17, '#5a3a22');
    Q.rect(8, 1, 10, 4, '#e8e0d0'); Q.rect(30, -1, 6, 6, '#3a6aa8'); Q.rect(80, 1, 14, 4, '#c8a050'); A.texte(Q, 'OAKEN', 42, 12, '#f2c230'); return c; })(), ax: 56, ay: 23 };
  C.objet(comptoir, 144, 112, { solide: [-56, -12, 112, 12] });
  // la caisse de carottes
  const carottes = { sortY: 118, pris: false,
    draw(g, J) {
      g.fillStyle = '#6a4428'; g.fillRect(212, 104, 22, 14); g.fillStyle = '#8a5a32'; g.fillRect(212, 104, 22, 2); g.fillRect(212, 110, 22, 1);
      for (let k = 0; k < 6; k++) { g.fillStyle = '#f08a24'; g.fillRect(214 + k * 3, 99 + (k % 2), 2, 6); g.fillStyle = '#4f8a3a'; g.fillRect(214 + k * 3, 97 + (k % 2), 2, 2); }
      if (EpreuveNeige.veutCarotte()) A.paillettes(J, 223, 102, 50, 5, 10, 5);
    } };
  C.dynamiques.push(carottes); C.solide(212, 108, 22, 10);
  // le poêle et sa lueur
  P.rect(24, 100, 26, 30, '#2a2632'); P.rect(27, 112, 20, 12, '#1a1620'); P.rect(29, 114, 16, 8, '#f08a24'); P.rect(31, 116, 12, 4, '#ffd27a'); P.rect(35, 60, 4, 40, '#3a3646');
  C.solide(24, 116, 26, 14); C.zone(22, 124, 30, 10, 'poeleOaken');
  C.lumiere(37, 118, 50, 'feu');
  // la porte du sauna, et la buée qui s'en échappe
  P.rect(246, FOND - 4, 28, 30, '#5a3a22'); P.rect(249, FOND - 1, 22, 26, '#8a5a32'); P.rect(255, FOND + 4, 10, 6, '#cfe8ff'); A.texte(P, 'SAUNA', 250, FOND - 12, '#f4efe6');
  C.solide(246, FOND, 28, 22);
  C.dynamiques.push({ sortY: FOND + 26, draw(g, J) {
    const t = J.t || 0;
    for (let k = 0; k < 5; k++) { const p = (t * 0.4 + k / 5) % 1; g.globalAlpha = 0.35 * (1 - p); g.fillStyle = '#f4f8ff'; g.fillRect(Math.round(252 + k * 4 + Math.sin(t * 2 + k) * 2), Math.round(FOND + 20 - p * 26), 3, 3); }
    g.globalAlpha = 1;
  } });
  C.zone(244, FOND + 20, 32, 10, 'sauna');
  // Oaken derrière son comptoir
  const oaken = new Entites.Perso({ id: 'oaken', cfg: Object.assign({}, CONFIG.arendelle.persos.oaken, { modele: Neige.MODELES.oaken }), x: 144, y: 96, dir: 'down', fixe: true,
    dialogue: (J) => EpreuveNeige.repliques('oaken', J) });
  oaken.zone = () => ({ x: 100, y: 96, w: 88, h: 24, dialogue: oaken.dialogue });
  C.pnj.push(oaken);
  C.zone(96, FOND, 30, 12, null, { dialogue: (J) => EpreuveNeige.prendreCuilleres(J, cuilleres) });
  C.zone(208, 112, 30, 12, null, { dialogue: (J) => EpreuveNeige.prendreCarotte(J, carottes) });
  C.oaken = { oaken, cuilleres, carottes };
  // porte de sortie
  P.rect(124, H - 6, 40, 6, '#3a2618'); P.rect(130, H - 10, 28, 4, '#7a2a2a');
  C.porte(126, H - 12, 36, 12, 'arendelle', 'devantOaken', 'down');
  C.arrivees.entree = { x: 144, y: H - 18, dir: 'up' };
  C.onEntree = (J) => EpreuveNeige.entreeOaken(J);
  C.apresLumiere = (g, J) => A.dessinerPaillettes(g, J); // les paillettes sur les cuillères et les carottes
  C.finaliser(0.2);
  return C;
});
