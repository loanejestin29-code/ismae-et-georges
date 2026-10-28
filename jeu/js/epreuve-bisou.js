// =====================================================================
//  epreuve-bisou.js — ÉPREUVE 1 : « Le bisou magique » (au Carrefour)
//
//  1. En entrant, Georges attend sagement près de la sortie (pas de chats à la boucherie).
//  2. Ismae rejoint Tom à la boucherie : retrouvailles, puis il passe derrière le comptoir.
//  3. Il découpe un rôti… et se coupe le doigt. Il aperçoit Loane : « Viens me faire un bisou magique ! »
//  4. Course-poursuite dans les rayons, façon Pac-Man : la caméra dézoome, la musique accélère.
//     Loane fuit par les allées mais reste toujours attrapable (Ismae court plus vite qu'elle,
//     et elle s'arrête parfois pour le narguer). Pas de chronomètre.
//  5. Attrapée : bisou magique, explications, écran de victoire et premier indice (carnet).
//  6. Ismae retrouve Georges. La sortie mènera ensuite à la forêt de Sherwood (épreuve 2).
// =====================================================================
'use strict';

const Bisou = (() => {
  const Q = Scenes.quete;
  Q.bisou = 'aFaire'; // 'aFaire' → 'scene' → 'poursuite' → 'victoire' → 'gagne'
  Q.entreeSuperette = false;
  // Loane pendant la poursuite : case de départ, case visée, case précédente, minuteries
  const L = { de: null, vers: null, prec: null, demiTour: 0, pause: 0, temps: 0 };
  let georgesRetrouve = false, suiteVue = false, coupT = 0;
  const cle = (c) => c[0] + ',' + c[1];
  const lab = () => Jeu.carte.labyrinthe;

  // ------------------------------------------------------------ outils du labyrinthe
  // case d'allée la plus proche d'un point
  function caseDe(x, y) {
    let c = Math.max(0, Math.min(8, Math.round((x - 32) / 48)));
    const r = Math.max(0, Math.min(5, Math.round((y - 112) / 48)));
    if (lab().estIlot(c, r)) c = x < 224 ? 3 : 5;
    return [c, r];
  }
  // distance (en cases) depuis une case vers toutes les autres
  function distances(depart) {
    const d = new Map([[cle(depart), 0]]), file = [depart];
    while (file.length) {
      const n = file.shift();
      for (const v of lab().voisins(n[0], n[1])) if (!d.has(cle(v))) { d.set(cle(v), d.get(cle(n)) + 1); file.push(v); }
    }
    return d;
  }
  // plus court chemin entre deux cases (liste de cases, départ exclu)
  function chemin(de, vers) {
    const prec = new Map([[cle(de), null]]), file = [de];
    while (file.length) {
      const n = file.shift();
      if (cle(n) === cle(vers)) break;
      for (const v of lab().voisins(n[0], n[1])) if (!prec.has(cle(v))) { prec.set(cle(v), n); file.push(v); }
    }
    const out = [];
    for (let n = vers; n && cle(n) !== cle(de); n = prec.get(cle(n))) out.unshift(n);
    return out;
  }
  const pos = (c) => lab().noeud(c[0], c[1]);

  // ------------------------------------------------------------ entrée dans le magasin
  function entree(J) {
    const E = J.carte.epreuve, G = J.georges;
    if (Q.bisou !== 'gagne') { G.allerVers([E.georges], 50); G.texteScript = 'georgesAttend'; }
    if (!Q.entreeSuperette) { Q.entreeSuperette = true; J.jouerScript([{ attendre: 0.6 }, { dire: 'entreeSuperette' }]); }
  }

  // ------------------------------------------------------------ la scène à la boucherie
  function retrouvailles(J) {
    const E = J.carte.epreuve, p = J.joueur, tom = E.tom, loane = E.loane, B = CONFIG.bisou;
    Q.bisou = 'scene';
    J.cinematique = true;
    tom.regarder(p.x, p.y); tom.dire('!', 1);
    J.jouerScript([
      { attendre: 0.4 },
      { faire: () => p.allerVers([{ x: 236, y: 110 }], 50) },
      { jusqua: () => !p.chemin },
      { faire: () => { p.dir = 'up'; tom.dir = 'down'; } },
      { dire: B.retrouvailles },
      // Ismae passe derrière le comptoir ; Tom lui fait de la place
      { faire: () => {
        E.portillon.voulu = 1; Musique.porte();
        tom.allerVers([{ x: 256, y: 84 }], 30, (t) => { t.dir = 'left'; });
        p.allerVers([E.devantPassage, E.passage, { x: 270, y: 70 }, { x: 214, y: 70 }, E.billot], 56);
      } },
      { jusqua: () => !p.chemin },
      { faire: () => { E.portillon.voulu = 0; p.dir = 'left'; tom.dir = 'left'; } },
      { dire: B.tablier },
      { faire: () => { p.tenue = 'tablier'; p.saut = 0.35; } },
      { attendre: 0.5 },
      { faire: () => { p.couteau = 0.001; } },
      { attendre: 1.1 },
      { dire: B.travail },
      { attendre: 0.8 },
      // aïe !
      { faire: () => {
        p.couteau = 0; p.saut = 0.35; J.secousse = 0.3; Musique.aie(); tom.dire('!', 1);
        for (let k = 0; k < 4; k++) J.particule('goutte', p.x - 9, p.y - 14, { vx: -12 + Math.random() * 18, vy: -22 + Math.random() * 10, max: 0.5, col: '#e0353a' });
      } },
      { dire: B.aie },
      { faire: () => { p.dir = 'down'; p.dire('doigt', 2.4); } },
      { attendre: 1.7 },
      // Loane, un peu plus loin dans le magasin
      { faire: () => {
        const [a, ...suite] = E.entreeLoane;
        loane.visible = true; loane.x = a.x; loane.y = a.y; loane.allerVers(suite, 70, (l) => l.regarder(p.x, p.y));
      } },
      { jusqua: () => !loane.chemin },
      { faire: () => { p.dir = Entites.dirDe(loane.x - p.x, loane.y - p.y, p.dir); p.dire('!', 0.9); p.saut = 0.35; } },
      { attendre: 0.6 },
      { dire: B.appel },
      { faire: () => { loane.dire('coeur', 1.6); loane.saut = 0.35; } },
      { attendre: 0.4 },
      { dire: B.reponse },
    ], () => demarrerPoursuite(J));
  }

  // ------------------------------------------------------------ la course-poursuite
  function demarrerPoursuite(J) {
    const E = J.carte.epreuve, p = J.joueur, loane = E.loane;
    Q.bisou = 'poursuite';
    L.de = caseDe(loane.x, loane.y); L.vers = L.de; L.prec = null; L.demiTour = 0; L.pause = 0; L.temps = 0;
    loane.allerVers([pos(L.de)], CONFIG.vitesseLoane);
    // Ismae ressort par le portillon, puis le joueur reprend la main
    E.portillon.voulu = 1;
    p.allerVers([{ x: 214, y: 70 }, { x: 270, y: 70 }, E.passage, E.devantPassage], 120, () => {
      E.portillon.voulu = 0; J.cinematique = false; J.sprint = true;
    });
    J.zoomer(1.3);
    J.reperes = [loane];
    Musique.morceau('poursuite'); Musique.partez();
    document.body.classList.add('poursuite');
    banniere(true);
  }

  // à chaque carrefour, Loane choisit l'allée qui l'éloigne le plus d'Ismae (avec un peu de hasard)
  function choisir(J, n) {
    const p = J.joueur, dI = distances(caseDe(p.x, p.y));
    let best = null, bestS = -1e9;
    for (const v of lab().voisins(n[0], n[1])) {
      const suite = lab().voisins(v[0], v[1]).filter((w) => cle(w) !== cle(n));
      let s = (dI.get(cle(v)) || 0) * 10;
      s += suite.length ? Math.max(...suite.map((w) => dI.get(cle(w)) || 0)) * 4 : -20;
      if (L.prec && cle(v) === cle(L.prec)) s -= 7;
      const q = pos(v); s += Math.hypot(q.x - p.x, q.y - p.y) * 0.05 + Math.random() * 5;
      if (s > bestS) { bestS = s; best = v; }
    }
    return best || n;
  }

  function poursuite(dt, J) {
    const E = J.carte.epreuve, p = J.joueur, loane = E.loane;
    const d = Math.hypot(p.x - loane.x, p.y - loane.y);
    if (d < 14 && !p.chemin) { victoire(J); return; }
    if (p.chemin) return; // Ismae n'est pas encore sorti de derrière le comptoir
    L.temps += dt; L.demiTour -= dt;
    // vitesse : un peu moins vite qu'Ismae ; elle trottine quand il est loin, se fatigue avec le temps
    let v = CONFIG.vitesseLoane;
    if (d > 170) v *= 0.8; else if (d < 70) v *= 1.08;
    v *= Math.max(0.8, 1 - Math.max(0, L.temps - 45) / 160);
    loane.vitesse = v;
    if (L.pause > 0) {
      L.pause -= dt; loane.regarder(p.x, p.y);
      if (d < 70) L.pause = 0;
      return;
    }
    // Ismae arrive par l'allée où elle va : demi-tour (seulement s'il est vraiment de ce côté-là)
    if (loane.chemin && L.demiTour <= 0 && d < 90 && cle(L.de) !== cle(L.vers)) {
      const dI = distances(caseDe(p.x, p.y));
      if (dI.get(cle(L.vers)) < dI.get(cle(L.de))) {
        [L.de, L.vers] = [L.vers, L.de]; L.prec = null; L.demiTour = 0.8;
        loane.allerVers([pos(L.vers)], v);
        return;
      }
    }
    if (!loane.chemin) {
      // arrivée sur une case : de loin, elle s'arrête parfois pour le narguer
      if (d > 150 && L.temps > 8 && Math.random() < 0.25) { L.pause = 0.9; loane.dire('coeur', 0.9); loane.regarder(p.x, p.y); return; }
      const suivante = choisir(J, L.vers);
      L.prec = L.vers; L.de = L.vers; L.vers = suivante;
      loane.allerVers([pos(suivante)], v);
    }
  }

  // ------------------------------------------------------------ attrapée !
  function victoire(J) {
    const E = J.carte.epreuve, p = J.joueur, loane = E.loane, B = CONFIG.bisou;
    Q.bisou = 'victoire';
    J.cinematique = true; J.sprint = false; J.reperes = [];
    loane.chemin = null; p.moving = false;
    document.body.classList.remove('poursuite');
    banniere(false);
    Musique.morceau('jazz');
    J.zoomer(1);
    // ils se placent côte à côte, face à face (du côté où il y a de la place)
    let cote = loane.x < p.x ? -1 : 1;
    if (!J.libre(p.x + cote * 13, p.y)) cote = -cote;
    const place = J.libre(p.x + cote * 13, p.y) ? { x: p.x + cote * 13, y: p.y } : { x: loane.x, y: loane.y };
    loane.allerVers([place], 50);
    J.jouerScript([
      { jusqua: () => !loane.chemin },
      { faire: () => {
        loane.regarder(p.x, p.y); p.dir = Entites.dirDe(loane.x - p.x, loane.y - p.y, p.dir);
        loane.dire('coeur', 1); loane.saut = 0.35;
      } },
      { attendre: 0.9 },
      { faire: () => p.dire('doigt', 1.4) },
      { attendre: 1.0 },
      // le bisou magique
      { faire: () => {
        const mx = (p.x + loane.x) / 2, my = Math.min(p.y, loane.y);
        loane.saut = 0.35; Musique.bisou();
        J.particule('grosCoeur', mx, my - 36, { vy: -8, max: 1.6 });
        for (let k = 0; k < 5; k++) J.particule('coeur', mx + (k - 2) * 7, my - 32, { vy: -14 - k * 2, max: 1.3 + k * 0.1, life: k * 0.08 });
      } },
      { attendre: 0.7 },
      { faire: () => {
        p.dire('gueri', 1.8);
        for (let k = 0; k < 4; k++) J.particule('etoile', p.x, p.y - 22, { max: 1.4, life: k * 0.15 });
      } },
      { attendre: 1.6 },
      { dire: B.victoire },
      { faire: () => { Musique.victoire(); Indices.gagner(0, () => apresVictoire(J)); } },
    ]);
  }

  function apresVictoire(J) {
    const E = J.carte.epreuve, loane = E.loane;
    Q.bisou = 'gagne';
    J.joueur.tenue = null;
    J.cinematique = false;
    // Loane rejoint Georges près de la sortie
    const route = chemin(caseDe(loane.x, loane.y), [4, 5]).map(pos);
    loane.allerVers(route.concat([{ x: 280, y: 420 }]), 60, (l) => { l.dir = 'left'; });
    J.dire(CONFIG.bisou.apres);
  }

  function retrouverGeorges(J) {
    georgesRetrouve = true;
    const G = J.georges;
    G.reprendreSuivi(J); G.reaction = 1.5; Musique.miaou(1.1, 0.1);
    J.dire(CONFIG.bisou.georges);
  }

  // ------------------------------------------------------------ bandeau « Attrape Loane ! »
  function banniere(oui) {
    const b = document.getElementById('banniere');
    if (!b) return;
    b.hidden = !oui;
    b.classList.remove('arrive'); void b.offsetWidth;
    if (oui) b.classList.add('arrive');
  }

  // ------------------------------------------------------------ boucle
  function maj(dt, J) {
    if (!J.carte || J.carte.id !== 'superette') return;
    const p = J.joueur, E = J.carte.epreuve;
    if (Q.bisou === 'aFaire') {
      const z = E.zoneBoucherie;
      if (!J.bloque() && p.x > z.x && p.x < z.x + z.w && p.y > z.y && p.y < z.y + z.h) retrouvailles(J);
    } else if (Q.bisou === 'scene') {
      // tchak, tchak : le bruit du couteau sur la planche
      if (p.couteau > 0) { const k = Math.floor(p.couteau * 7); if (k !== coupT && k % 2 === 0) Musique.couteau(); coupT = k; }
    } else if (Q.bisou === 'poursuite') poursuite(dt, J);
    else if (Q.bisou === 'gagne' && !georgesRetrouve && J.georges.mode === 'script' && !J.bloque()) {
      if (Math.hypot(p.x - J.georges.x, p.y - J.georges.y) < 34) retrouverGeorges(J);
    }
  }

  // la porte de sortie : fermée pendant l'épreuve ; la première fois après, on annonce la suite
  function peutSortir() {
    if (Q.bisou === 'scene' || Q.bisou === 'poursuite' || Q.bisou === 'victoire') return false;
    if (Q.bisou === 'gagne' && !suiteVue) {
      suiteVue = true; georgesRetrouve = true;
      Indices.suite(() => Jeu.allerA('rue', 'devantSuperette'));
      return false;
    }
    return true;
  }

  function init(J) { J.systemes.push(maj); }

  // (dev : relancer directement la poursuite, pour les essais)
  return { init, entree, peutSortir, dev: { poursuite: demarrerPoursuite } };
})();
