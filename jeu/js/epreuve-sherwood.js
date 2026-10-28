// =====================================================================
//  epreuve-sherwood.js — ÉPREUVE 2 : « Le tournoi de Sherwood »
//
//  1. En sortant du Carrefour, Ismae et Georges arrivent dans la forêt ; on explore.
//  2. Au carrefour (au nord du ruisseau), le roi Jean arrive avec ses gardes et Triste Sire.
//     Il veut Georges pour son trône : les gardes l'enferment dans une cage et l'emportent.
//     Pour le récupérer, il faut gagner le tournoi de tir à l'arc, dans la clairière du nord.
//  3. Au pas de tir : le mini-jeu (tir-arc.js). Il faut battre le shérif (29 points).
//     En cas d'échec, le roi laisse recommencer (et le tir devient un peu plus facile).
//  4. Victoire : le roi trépigne, boude, suce son pouce et pleure en appelant sa maman.
//     Les gardes libèrent Georges, Robin des Bois félicite Ismae et lui remet le deuxième indice.
//  5. Ensuite, le chemin du nord-ouest mène aux montagnes enneigées, et à Arendelle (épreuve 3, epreuve-neige.js).
// =====================================================================
'use strict';

const Sherwood = (() => {
  const Q = Scenes.quete;
  Q.sherwood = 'aVenir'; // 'aVenir' → 'arrivee' → 'capture' → 'tournoi' → 'tir' → 'victoire' → 'gagne'
  let echecs = 0, rappel = 0, larmes = false;
  const B = () => CONFIG.sherwood;
  const F = () => Jeu.carte.sherwood;

  // répliques des habitants : avant la capture, pendant (Georges prisonnier), après la victoire
  function repliques(id) {
    const r = CONFIG.repliques[id];
    if (!r) return null;
    const moment = ['tournoi', 'tir'].includes(Q.sherwood) ? 'pendant' : ['victoire', 'gagne'].includes(Q.sherwood) ? 'apres' : 'avant';
    return r[moment] || (moment === 'apres' ? r.pendant : r.avant) || r.avant || r.pendant || r.apres;
  }

  // ------------------------------------------------------------ arrivée dans la forêt
  function entree(J) {
    Musique.morceau(Q.sherwood === 'tir' ? 'tournoi' : 'foret');
    if (Q.sherwood === 'aVenir') {
      Q.sherwood = 'arrivee';
      J.jouerScript([{ attendre: 0.7 }, { dire: B().arrivee }]);
    }
  }

  // ------------------------------------------------------------ le roi Jean emporte Georges
  function capture(J) {
    const S = F(), p = J.joueur, G = J.georges, { roi, gardes: [g1, g2], sire } = S;
    Q.sherwood = 'capture';
    J.cinematique = true;
    p.allerVers([S.capture], 62);
    J.jouerScript([
      { jusqua: () => !p.chemin },
      { faire: () => {
        p.dir = 'up'; Musique.fanfare(); p.dire('!', 1); G.surprendre('!'); J.regard = { x: p.x + 20, y: p.y - 40 };
        G.allerVers([{ x: p.x + 30, y: p.y + 4 }], 60); // Georges se met à côté d'Ismae
      } },
      { attendre: 0.6 },
      { dire: B().fanfare },
      // le cortège descend le chemin du nord
      { faire: () => {
        const arrive = (e, x, y, pts) => { e.visible = true; e.x = x; e.y = y; e.allerVers(pts, 42, (q) => { q.dir = 'down'; }); };
        arrive(roi, 520, 410, [{ x: 520, y: 450 }, { x: 494, y: 494 }]);
        arrive(g1, 500, 386, [{ x: 500, y: 450 }, { x: 466, y: 486 }]);
        arrive(g2, 540, 386, [{ x: 540, y: 450 }, { x: 522, y: 484 }]);
        arrive(sire, 528, 380, [{ x: 534, y: 450 }, { x: 540, y: 506 }]);
      } },
      { jusqua: () => !roi.chemin && !g1.chemin && !g2.chemin && !sire.chemin },
      { faire: () => { roi.regarder(p.x, p.y); } },
      { dire: B().capture.slice(0, 2) },
      { faire: () => { roi.regarder(G.x, G.y); roi.dire('coeur', 1.4); roi.saut = 0.35; } },
      { attendre: 0.8 },
      { dire: B().capture.slice(2) },
      // les gardes encerclent Georges, qui fait le gros dos… et se retrouve en cage
      { faire: () => {
        G.mode = 'script'; G.chemin = null; G.dir = 'up'; G.pose = 'herisse'; Musique.miaou(0.8, 0.12);
        g1.allerVers([{ x: G.x - 13, y: G.y - 3 }], 56, (q) => { q.dir = 'right'; });
        g2.allerVers([{ x: G.x + 13, y: G.y - 3 }], 56, (q) => { q.dir = 'left'; });
      } },
      { jusqua: () => !g1.chemin && !g2.chemin },
      { attendre: 0.3 },
      { faire: () => {
        G.pose = null; G.etat = 'assis'; G.dir = 'down'; G.cage = 1; G.texteScript = 'georgesCage';
        Musique.cage(); J.secousse = 0.25;
        for (let k = 0; k < 3; k++) J.particule('etoile', G.x, G.y - 16, { max: 1.2, life: k * 0.2 });
      } },
      { attendre: 0.7 },
      { faire: () => { G.h = 7; Musique.miaou(0.9, 0.1); } },
      { attendre: 0.4 },
      { dire: B().enCage },
      // tout le monde repart vers la clairière du tournoi
      { faire: () => {
        roi.allerVers([{ x: 520, y: 450 }, { x: 526, y: 330 }], 46); sire.allerVers([{ x: 534, y: 450 }, { x: 534, y: 320 }], 46);
        const route = [{ x: G.x, y: 450 }, { x: 528, y: 400 }, { x: 528, y: 300 }];
        G.allerVers(route, 42);
        g1.allerVers(route.map((q) => ({ x: q.x - 13, y: q.y - 3 })), 42); g2.allerVers(route.map((q) => ({ x: q.x + 13, y: q.y - 3 })), 42);
      } },
      { attendre: 1.2 },
      { faire: () => { p.dire('!', 0.8); p.saut = 0.35; } },
      { attendre: 2.2 },
      { faire: () => { installerTournoi(J); J.regard = null; } },
      { dire: B().depart },
    ], () => {
      J.cinematique = false;
      Q.sherwood = 'tournoi';
      banniere('Gagne le tournoi !');
    });
  }

  // le roi sur son trône, Georges en cage à côté, les gardes au pied de la tribune
  function installerTournoi(J) {
    const S = F(), G = J.georges, { roi, gardes, sire } = S;
    const poser = (e, q, dir) => { e.visible = true; e.chemin = null; e.x = q.x; e.y = q.y; if (dir) e.dir = dir; };
    poser(roi, S.trone, 'down'); roi.fixe = true;
    poser(sire, S.sireTrone);
    gardes.forEach((g, k) => { poser(g, S.gardesTribune[k], 'down'); g.fixe = true; });
    G.mode = 'script'; G.chemin = null; G.x = S.cage.x; G.y = S.cage.y; G.h = 0; G.cage = 1; G.etat = 'assis'; G.dir = 'down'; G.texteScript = 'georgesCage';
  }

  // ------------------------------------------------------------ le tournoi
  function debutTournoi(J) {
    const S = F(), p = J.joueur;
    Q.sherwood = 'tir';
    J.cinematique = true;
    banniere(null);
    p.allerVers([S.pasDeTir], 62);
    Musique.morceau('tournoi');
    J.jouerScript([
      { jusqua: () => !p.chemin },
      { faire: () => { p.dir = 'up'; S.sherif.regarder(p.x, p.y); } },
      { dire: B().tournoi },
      { faire: () => { Musique.miaou(1.05, 0.1); J.georges.surprendre('!'); } },
      { attendre: 0.5 },
    ], () => tirer(J));
  }
  function tirer(J) {
    TirArc.lancer(J, { aide: echecs, fin: (score) => finTir(J, score) });
  }
  function finTir(J, score) {
    if (score > CONFIG.tournoi.scoreSherif) { victoire(J); return; }
    echecs++;
    F().roi.saut = 0.35;
    J.jouerScript([{ attendre: 0.3 }, { dire: B().rate }, { attendre: 0.3 }], () => tirer(J));
  }

  // ------------------------------------------------------------ victoire : le roi pleure, Georges est libre
  function victoire(J) {
    const S = F(), p = J.joueur, G = J.georges, { roi, gardes: [g1], robin, spectateurs, sherif } = S;
    Q.sherwood = 'victoire';
    Musique.morceau('foret');
    const hourra = (d) => spectateurs.forEach((s, k) => { if (s.joie !== undefined) s.joie = d + k * 0.1; else s.saut = 0.35; });
    J.jouerScript([
      { faire: () => { hourra(2.4); Musique.foule(1); } },
      { attendre: 0.8 },
      { dire: B().gagne },
      // la caméra se tourne vers la tribune, pour bien voir le roi
      { faire: () => { J.regard = { x: (p.x + roi.x) / 2 + 20, y: p.y - 30 }; } },
      { attendre: 0.6 },
      // colère : il trépigne
      { faire: () => { roi.pose = 'colere'; roi.poseT = 0; roi.saut = 0.35; J.secousse = 0.4; Musique.colere(); } },
      { attendre: 0.35 }, { faire: () => { roi.saut = 0.35; } }, { attendre: 0.4 }, { faire: () => { roi.saut = 0.35; } },
      { dire: B().colere },
      { faire: () => { roi.pose = 'boude'; } },
      { dire: B().boude },
      { faire: () => { roi.pose = 'pouce'; roi.poseT = 0; larmes = true; } },
      { attendre: 1.2 },
      { dire: B().pouce },
      { faire: () => { roi.pose = 'pleure'; Musique.pleurs(); sherif.allerVers([{ x: S.gardesTribune[0].x - 30, y: S.gardesTribune[0].y + 6 }], 40, (q) => { q.dir = 'up'; }); } },
      { dire: B().pleure },
      // un garde ouvre la cage, Georges file retrouver Ismae
      { faire: () => { g1.fixe = false; g1.allerVers([{ x: S.cage.x, y: S.gardesTribune[0].y }], 50, (q) => { q.dir = 'up'; }); } },
      { jusqua: () => !g1.chemin },
      { faire: () => {
        Musique.cage(); G.cage = 0; S.cageVide.visible = true; G.texteScript = null;
        G.allerVers([{ x: S.cage.x + 12, y: S.cage.y + 10 }, { x: S.escalier.x, y: S.escalier.y - 14 }, S.escalier, { x: S.escalier.x - 40, y: p.y + 4 }, { x: p.x + 14, y: p.y + 4 }], 120);
        G.surprendre('!');
      } },
      { jusqua: () => !G.chemin || !G.chemin.length },
      { faire: () => {
        J.regard = null;
        G.reprendreSuivi(J); G.dir = 'left'; G.reaction = 2.2; p.dir = 'right'; Musique.miaou(1.1, 0.12);
        for (let k = 0; k < 4; k++) J.particule('coeur', G.x + (k - 1.5) * 5, G.y - 14, { vy: -14 - k * 3, max: 1.3 });
        hourra(1.6); Musique.foule(0.7);
      } },
      { dire: B().retrouvailles },
      // Robin des Bois sort des arbres
      { faire: () => {
        robin.visible = true; robin.x = S.robinDepart.x; robin.y = S.robinDepart.y;
        robin.allerVers([{ x: p.x - 60, y: p.y + 6 }, { x: p.x - 22, y: p.y + 2 }], 70, (q) => q.regarder(p.x, p.y));
      } },
      { attendre: 0.6 },
      { faire: () => { p.dir = 'left'; p.dire('!', 0.9); } },
      { jusqua: () => !robin.chemin },
      { dire: B().robin },
      { faire: () => { Musique.victoire(); Indices.gagner(1, () => apresVictoire(J)); } },
    ]);
  }
  function apresVictoire(J) {
    const S = F();
    Q.sherwood = 'gagne';
    S.roi.pose = 'boude'; larmes = false;
    S.gardes[0].allerVers([S.gardesTribune[0]], 40, (q) => { q.dir = 'down'; q.fixe = true; });
    J.cinematique = false;
    J.dire(B().apres);
  }

  // ------------------------------------------------------------ bandeau « Gagne le tournoi ! »
  let bTimer = null;
  function banniere(texte) {
    const b = document.getElementById('banniere');
    if (!b) return;
    clearTimeout(bTimer);
    b.hidden = !texte;
    if (!texte) return;
    b.textContent = texte;
    b.classList.remove('arrive'); void b.offsetWidth; b.classList.add('arrive');
    bTimer = setTimeout(() => { b.hidden = true; }, 5200);
  }

  // ------------------------------------------------------------ boucle
  function dans(p, z) { return p.x > z.x && p.x < z.x + z.w && p.y > z.y && p.y < z.y + z.h; }
  function maj(dt, J) {
    if (!J.carte || J.carte.id !== 'foret') return;
    const p = J.joueur, S = F();
    // les larmes du roi Jean
    if (larmes && Math.random() < dt * 9) {
      const cote = Math.random() < 0.5 ? -4 : 4;
      J.particule('goutte', S.roi.x + cote, S.roi.y - 21, { vx: cote * 4, vy: 10 + Math.random() * 8, max: 0.7, col: '#8fd0f4' });
    }
    if (J.bloque()) return;
    if (Q.sherwood === 'arrivee' && dans(p, S.zoneCapture)) capture(J);
    else if (Q.sherwood === 'tournoi' && dans(p, S.zoneTournoi)) debutTournoi(J);
    else if (Q.sherwood === 'tournoi') {
      // de temps en temps, Georges miaule depuis sa cage
      rappel -= dt;
      if (rappel < 0) { rappel = 7 + Math.random() * 5; if (Math.hypot(p.x - J.georges.x, p.y - J.georges.y) < 260) { J.georges.surprendre('!'); Musique.miaou(0.95, 0.06); } }
    }
  }

  // sorties : pas de retour vers le Carrefour ; les montagnes seulement avec Georges
  function retour() {
    Jeu.dire('retourImpossible');
    Jeu.joueur.y -= 8;
    return false;
  }
  function montagnes() {
    const p = Jeu.joueur;
    if (Q.sherwood !== 'gagne') { Jeu.dire('sansGeorges'); p.y += 10; return false; }
    Indices.suite({ haut: 'Épreuve suivante', titre: 'ÉPREUVE 3/6', lieu: 'Le bonhomme de neige', texte: 'Le chemin grimpe dans la neige… En bas, de l\'autre côté, les lumières d\'un village et d\'un château.', bouton: 'Aller à Arendelle' },
      () => Jeu.allerA('arendelle', 'entree'));
    return false;
  }

  function init(J) { J.systemes.push(maj); }

  // (dev : se placer directement à une étape, pour les essais)
  function dev(etape) {
    const J = Jeu, S = F();
    if (etape === 'tournoi' || etape === 'tir') { installerTournoi(J); Q.sherwood = 'tournoi'; J.joueur.x = 528; J.joueur.y = 340; J.joueur.dir = 'up'; }
    if (etape === 'tir') { J.joueur.x = 528; J.joueur.y = 300; }
    if (etape === 'victoire') { installerTournoi(J); Q.sherwood = 'tir'; J.joueur.x = S.pasDeTir.x; J.joueur.y = S.pasDeTir.y; J.joueur.dir = 'up'; J.cinematique = true; victoire(J); }
  }

  return { init, entree, repliques, retour, montagnes, dev };
})();
