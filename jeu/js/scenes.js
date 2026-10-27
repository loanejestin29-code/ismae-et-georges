// =====================================================================
//  scenes.js — l'introduction et la quête de la zone 1
//
//  1. Ismae et Georges arrivent ; on explore librement.
//  2. Trois chatons passent en courant ; Georges les voit (« ! ») et les suit.
//  3. Georges guide Ismae jusqu'au jardin secret (il attend si on traîne).
//  4. Duchesse arrive ; Toulouse fait le dos rond ; Georges essaie… et tombe.
//  5. Premier indice : Tom est entré dans la boutique au logo bleu et rouge.
//  Ensuite, les habitants et les musiciens donnent d'autres indices.
// =====================================================================
'use strict';

const Scenes = (() => {
  const Q = { intro: 'attente', tom: false, entreeSuperette: false };
  let temps = 0, parcouru = 0, avant = null, attenteLoin = 0, appel = 0;
  // positions finales dans le jardin secret
  const FIN = {
    marie: { x: 1180, y: 210 }, toulouse: { x: 1198, y: 224 }, berlioz: { x: 1170, y: 230 },
    georges: { x: 1228, y: 226 }, duchesse: { x: 1236, y: 200 },
  };
  const ALLEE_X = 1200;

  // réplique d'un personnage selon l'avancée de la quête
  function repliques(id, J) {
    const r = CONFIG.repliques[id];
    if (!r) return null;
    return ((J || Jeu).quete.tom && r.apres) ? r.apres : (r.avant || r.apres);
  }

  // chemin des chatons : le long de la rue, puis la ruelle de l'hôtel jusqu'au jardin
  function cheminVers(depart, voie, fin, decal) {
    return [
      { x: depart.x, y: voie }, { x: ALLEE_X + decal, y: voie }, { x: ALLEE_X + decal, y: 470 },
      { x: ALLEE_X + decal, y: 300 }, { x: ALLEE_X + decal, y: 252 }, fin,
    ];
  }

  function lancerChatons(J) {
    const p = J.joueur, A = J.carte.aristochats;
    const voie = p.y < 586 ? Math.max(500, Math.min(560, p.y + 24)) : 612;
    const x0 = Math.max(40, p.x - 170);
    ['marie', 'toulouse', 'berlioz'].forEach((nom, i) => {
      const k = A[nom];
      k.visible = true; k.x = x0 - i * 16; k.y = voie + [0, -6, 6][i]; k.dir = 'right';
      k.allerVers(cheminVers({ x: k.x, y: k.y }, voie + [0, -6, 6][i], FIN[nom], [0, -8, 8][i]), 64);
    });
    Musique.miaou(1.5, 0.08);
    Q.intro = 'chatons';
    Q.voie = voie;
    Q.vu = 0;
  }

  function lancerPoursuite(J) {
    const G = J.georges;
    G.surprendre('!');
    Musique.miaou(1.1, 0.12);
    Q.intro = 'surpris';
    Q.vu = 0.9;
  }

  function abandonnerPoursuite(J) {
    // Ismae n'a pas suivi : Georges revient vers lui, les chatons filent au jardin
    J.georges.reprendreSuivi(J);
    J.georges.surprendre('?');
    const A = J.carte.aristochats;
    for (const nom of ['marie', 'toulouse', 'berlioz']) { const k = A[nom]; if (k.pause) { k.chemin = k.pause; k.pause = null; k.etat = 'marche'; } }
    Q.intro = 'chatonsPartis';
  }

  function chatonsArrives(A) { return ['marie', 'toulouse', 'berlioz'].every((n) => !A[n].chemin && !A[n].pause); }
  function dansJardin(p, J) { const z = J.carte.zoneJardin; return p.x > z.x && p.x < z.x + z.w && p.y > z.y && p.y < z.y + z.h + 6; }

  function rencontre(J) {
    const A = J.carte.aristochats, G = J.georges, D = A.duchesse;
    const lignes = CONFIG.rencontre;
    Q.intro = 'rencontre';
    J.cinematique = true;
    J.joueur.dir = 'up';
    G.allerVers([FIN.georges], 60);
    J.jouerScript([
      { jusqua: () => !G.chemin || !G.chemin.length },
      { faire: () => { G.dir = 'left'; D.visible = true; D.x = 1205; D.y = 164; D.allerVers([{ x: 1205, y: 186 }, FIN.duchesse], 32); Musique.miaou(0.9, 0.1); } },
      { jusqua: () => !D.chemin },
      { faire: () => { D.dir = 'down'; } },
      { dire: lignes.accueil },
      { faire: () => { A.toulouse.dir = 'right'; A.toulouse.etat = 'dosRond'; Musique.miaou(1.5, 0.1); } },
      { attendre: 1.3 },
      { dire: lignes.apresToulouse },
      { faire: () => { A.toulouse.etat = 'assis'; G.dir = 'left'; G.pose = 'dosRond'; } },
      { attendre: 0.7 },
      { faire: () => { G.pose = 'herisse'; Musique.miaou(0.8, 0.1); } },
      { attendre: 1.0 },
      { faire: () => { G.pose = 'chute'; for (let k = 0; k < 3; k++) J.particule('etoile', G.x, G.y - 14, { max: 1.6, life: k * 0.2 }); } },
      { attendre: 0.6 },
      { faire: () => { A.berlioz.etat = 'rire'; Musique.miaou(1.7, 0.08); } },
      { attendre: 0.5 },
      { dire: lignes.apresGeorges.slice(0, 2) },
      { faire: () => { A.berlioz.etat = 'assis'; G.pose = null; G.etat = 'assis'; } },
      { attendre: 0.4 },
      { dire: lignes.apresGeorges.slice(2) },
    ], () => {
      J.cinematique = false;
      Q.intro = 'fini';
      Q.tom = true;
      for (const nom of ['duchesse', 'marie', 'toulouse', 'berlioz']) A[nom].dialogue = (j) => repliques(nom, j);
      G.reprendreSuivi(J);
      G.reaction = 1.2;
    });
  }

  function maj(dt, J) {
    if (!J.carte || J.carte.id !== 'rue') return;
    const p = J.joueur, G = J.georges, A = J.carte.aristochats;
    temps += dt;
    if (avant) parcouru += Math.hypot(p.x - avant.x, p.y - avant.y);
    avant = { x: p.x, y: p.y };

    if (Q.intro === 'attente') {
      // les chatons passent quand on se promène dans la rue ou sur le quai
      const surLaRue = p.y > 466 && p.y < 700 && p.x > 60 && p.x < 1100;
      if (temps > 5 && parcouru > 50 && surLaRue && !J.bloque()) lancerChatons(J);
    } else if (Q.intro === 'chatons') {
      // Georges réagit quand les chatons arrivent à sa hauteur
      const k = A.marie;
      if (Math.abs(k.x - G.x) < 50 || k.x > G.x) lancerPoursuite(J);
    } else if (Q.intro === 'surpris') {
      Q.vu -= dt;
      if (Q.vu <= 0) {
        const voie = Q.voie + 10;
        G.allerVers(cheminVers({ x: G.x, y: voie }, voie, FIN.georges, 0).slice(0, -1).concat([FIN.georges]), CONFIG.vitesseChatons, { attendre: 95 });
        Q.intro = 'poursuite';
        attenteLoin = 0;
      }
    } else if (Q.intro === 'poursuite') {
      // les chatons attendent Georges s'ils ont trop d'avance (jamais s'il les a dépassés)
      const reste = (e, pts) => { let d = 0, a = e; for (const q of pts || []) { d += Math.hypot(q.x - a.x, q.y - a.y); a = q; } return d; };
      const resteG = reste(G, G.chemin);
      for (const nom of ['marie', 'toulouse', 'berlioz']) {
        const k = A[nom];
        const pts = k.chemin || k.pause;
        if (!pts) continue;
        const avance = resteG - reste(k, pts) > 90;
        if (avance && k.chemin) { k.pause = k.chemin; k.chemin = null; k.etat = 'assis'; k.dir = 'left'; }
        else if (!avance && k.pause) { k.chemin = k.pause; k.pause = null; k.etat = 'marche'; }
      }
      // si Ismae part vraiment ailleurs, Georges finit par revenir vers lui
      const d = Math.hypot(p.x - G.x, p.y - G.y);
      attenteLoin = d > 260 ? attenteLoin + dt : 0;
      if (attenteLoin > 8) abandonnerPoursuite(J);
      // arrivé au jardin, Georges appelle Ismae de temps en temps
      if (!G.chemin || !G.chemin.length) {
        appel -= dt;
        if (d > 70 && appel < 0) { appel = 3; G.surprendre('!'); Musique.miaou(1.05, 0.07); }
      }
      if (chatonsArrives(A) && (!G.chemin || !G.chemin.length) && dansJardin(p, J) && !J.bloque()) rencontre(J);
    } else if (Q.intro === 'chatonsPartis') {
      for (const nom of ['marie', 'toulouse', 'berlioz']) { const k = A[nom]; if (k.pause) { k.chemin = k.pause; k.pause = null; k.etat = 'marche'; } }
      if (chatonsArrives(A) && dansJardin(p, J) && !J.bloque()) rencontre(J);
    }
  }

  function init(J) {
    J.quete = Q;
    J.systemes.push(maj);
    J.onCarte = (carte) => {
      const G = J.georges;
      if (G.mode === 'script' && Q.intro !== 'rencontre') {
        G.reprendreSuivi(J);
        if (Q.intro === 'poursuite' || Q.intro === 'surpris') {
          Q.intro = 'chatonsPartis';
          const A = cache.aristochats;
          if (A) for (const nom of ['marie', 'toulouse', 'berlioz']) { A[nom].x = FIN[nom].x; A[nom].y = FIN[nom].y; A[nom].chemin = null; A[nom].pause = null; A[nom].visible = true; A[nom].etat = 'assis'; }
        }
      }
      if (carte.id === 'rue') cache.aristochats = carte.aristochats;
      if (carte.id === 'superette' && !Q.entreeSuperette) {
        Q.entreeSuperette = true;
        J.jouerScript([{ attendre: 0.6 }, { dire: 'entreeSuperette' }]);
      }
    };
  }
  const cache = {};

  return { init, repliques, quete: Q };
})();
