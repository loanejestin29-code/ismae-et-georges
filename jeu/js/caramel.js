// =====================================================================
//  caramel.js — le mini-jeu du CARAMEL AU BEURRE SALÉ (épreuve 5), façon « Cooking Mama »
//
//  Cinq étapes, devant le fourneau, avec Rémy à gauche qui réagit à tout :
//   1. LE SUCRE : on maintient (doigt, clic ou Espace) pour pencher le paquet ; il faut
//      200 g à 8 g près. Le sucre continue de tomber un instant quand on relâche.
//   2. FAIRE FONDRE : on règle le feu (curseur à droite, ou ↑↓) et on remue en rond
//      (doigt, souris, ou ←→). Le feu chauffe plus fort d'un côté : sans remuer, ça noircit
//      par endroits ; trop fort, tout brûle ; trop doux, le sucre cristallise.
//   3. LE BEURRE DEMI-SEL : on coupe la motte sur les pointillés (glisser vers le bas, ou
//      ←→ et Espace), puis on ajoute les morceaux un par un en surveillant la température :
//      chaque morceau la fait baisser, le feu la fait remonter.
//   4. LA CRÈME : on maintient pour verser, en remuant en même temps ; trop vite, ça mousse
//      et ça déborde ; trop lent, le caramel durcit.
//   5. LA TEXTURE : tout à la fois. Garder la bonne température (le feu a de l'inertie et
//      il varie), remuer sans arrêt pour que ça n'attache pas, et retirer du feu quand le
//      caramel nappe la cuillère.
//  Après un échec, on recommence l'étape ratée, autant de fois qu'il le faut.
//  Les réglages de difficulté sont en haut (REGLAGES) ; les textes dans config.js → caramel.jeu.
// =====================================================================
'use strict';

const Caramel = (() => {
  const $ = (id) => document.getElementById(id);
  const REGLAGES = {
    // grammes ; le sucre met « vol » secondes à tomber ; le débit monte si l'on maintient longtemps ;
    // à chaque fois qu'on penche le paquet, il peut lâcher un « paquet » de sucre (jusqu'à 10 g)
    sucre: { cible: 200, tol: 6, max: 214, vol: 0.18, debit: 55, debitMax: 90, paquet: [0.5, 4, 10], temps: 13 },
    // fonte (par seconde, à plein feu) ; au-delà de « fort », le sucre colore avant même de fondre
    // le point chaud du brûleur : chaleur de « froid » à « froid + chaud », il dérive et saute d'un coup de temps en temps
    // c'est réussi quand tout a fondu et que la couleur moyenne atteint « dore » ; brûlé à « moyenne » ou à « nbNoirs » points noirs
    fonte: { temps: 21, fonte: 0.16, cuisson: 0.1, fort: 0.7, forte: 0.25, melange: 0.6, noir: 0.85, nbNoirs: 3, dore: 0.4, moyenne: 0.7, froid: 0.3, chaud: 2.2, saut: [5, 8] },
    // la découpe (tolérances en pixels du jeu), puis la température (°C) pendant qu'on ajoute le beurre
    beurre: { lignes: [0.2, 0.4, 0.6, 0.8], tol: 4, travers: 8, ratesMax: 3, temps: 16, T0: 168, monte: [8, 11], baisse: 24, fonte: 1.4, eclabousse: 10, chaud: 192, froid: 135, vert: [150, 182] },
    // la crème : débit du pichet, mousse créée par la crème versée, cassée en remuant
    creme: { temps: 22, debit: 0.17, mousse: 7, casse: 1.0, retombe: 0.25, marbre: 0.5, marbreMax: 0.12 },
    // la texture : la consistance monte au-dessus de « seuil » °C ; ça attache au-dessus de « attache » si l'on ne remue pas
    texture: { temps: 45, fenetre: [0.62, 0.7], dur: 0.8, seuil: 104, epaissit: 0.0085, attache: 106, gratin: 0.035, brule: 128, vert: [108, 116] },
  };
  const ETAPES = ['sucre', 'fonte', 'beurre', 'creme', 'texture'];
  // la couleur du caramel selon la cuisson (0 : sucre fondu, 1 : charbon)
  const NUANCES = [[0, '#fbf0c8'], [0.3, '#f4d68a'], [0.45, '#f0c264'], [0.6, '#dc962e'], [0.7, '#bd661c'], [0.8, '#8a3a12'], [0.9, '#4a1e0e'], [1, '#1d0e0a']];
  const nuance = (c) => {
    c = Math.max(0, Math.min(1, c));
    for (let k = 1; k < NUANCES.length; k++) if (c <= NUANCES[k][0]) { const [a, ca] = NUANCES[k - 1], [b, cb] = NUANCES[k]; return PX.mix(ca, cb, (c - a) / (b - a)); }
    return NUANCES[NUANCES.length - 1][1];
  };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const choix = (l) => l[Math.floor(Math.random() * l.length)];
  const doigt = () => matchMedia('(pointer: coarse)').matches;
  const T = () => CONFIG.caramel.jeu;
  let E = null;

  // ------------------------------------------------------------ démarrage, étapes, messages
  function lancer(J, o) {
    E = { J, fin: o.fin, etape: 0, phase: 'intro', t: 0, tPhase: 0, remy: 'neutre', bulleT: 0, doigts: new Map(), touche: false,
      toursAcc: 0, remue: 0, angle: 0, cuillere: null, parts: [], fumees: [], etincelles: [], alertes: {}, flamme: 0 };
    J.vue = vue;
    addEventListener('keydown', clavier); addEventListener('keyup', clavier);
    document.body.classList.add('cuisine');
    $('cuisine').hidden = false;
    Musique.morceau('resto');
    etape(0);
  }
  function etape(n) {
    Object.assign(E, { etape: n, phase: 'intro', tPhase: 0, echec: null, temps: 0, chute: 0, debord: 0, tas: 0, flaque: 0, sous: null });
    E.doigts.clear(); E.parts = []; E.fumees = []; E.alertes = {};
    INIT[ETAPES[n]]();
    $('cui-titre').textContent = `Caramel au beurre salé · ${T().titres[n]}`;
    majAide();
    remy('parle', T().remy.debut[n]);
    message(T().titres[n]);
  }
  function majAide() {
    const c = T().consignes[E.etape === 2 ? E.sous : ETAPES[E.etape]];
    aide(doigt() ? c[0] : c[1]);
  }
  function aide(t) { const a = $('cui-aide'); a.textContent = t || ''; a.hidden = !t; }
  function message(t, k = '') {
    const m = $('cui-message'); m.hidden = !t; if (!t) return;
    m.textContent = t; m.className = k; m.classList.remove('arrive'); void m.offsetWidth; m.classList.add('arrive');
  }
  // Rémy prend une pose et dit sa réplique dans sa bulle
  function remy(pose, texte) {
    E.remy = pose;
    const b = $('cui-bulle');
    if (texte) { b.textContent = texte; b.hidden = false; b.classList.remove('arrive'); void b.offsetWidth; b.classList.add('arrive'); E.bulleT = 4.2; Musique.couic(); }
  }
  // une remarque de Rémy pendant l'étape (pas plus d'une fois toutes les quelques secondes)
  function alerte(cle, pose, delai = 3.5) {
    if ((E.alertes[cle] || -99) > E.t) return;
    E.alertes[cle] = E.t + delai;
    remy(pose, T().remy.alertes[cle]);
  }
  const limite = () => ({ sucre: REGLAGES.sucre.temps, fonte: REGLAGES.fonte.temps, beurre: E.sous === 'coupe' ? REGLAGES.beurre.temps : 0, creme: REGLAGES.creme.temps, texture: REGLAGES.texture.temps }[ETAPES[E.etape]]);

  function reussir(final) {
    E.phase = 'reussi'; E.tPhase = 0;
    aide(null);
    Musique.trouve();
    if (final) { message(T().parfait, 'bon'); remy('joie', T().remy.parfait); }
    else { message(choix(T().bravo), 'bon'); remy('content', T().remy.reussi[E.etape]); }
    const L = mise(E.J.V);
    for (let k = 0; k < (final ? 40 : 18); k++) E.etincelles.push({ x: L.px + (Math.random() - 0.5) * L.R * 2, y: L.py - Math.random() * L.R, t: 0, a: Math.random() * 6.28 });
  }
  const POSES_ECHEC = { trop: 'panique', dodo: 'dort', brule: 'panique', attache: 'panique', cristal: 'desespoir', miettes: 'desespoir', fondu: 'pleure', fige: 'tire', deborde: 'panique', durci: 'tire', liquide: 'goute', dur: 'tire' };
  function rater(type) {
    E.phase = 'rate'; E.tPhase = 0; E.echec = type;
    message(T().echecs[type], 'rate'); aide(null);
    Musique.oh();
    remy(POSES_ECHEC[type] || 'inquiet', choix(T().remy.echecs[type]));
    if (type === 'brule' || type === 'attache') Musique.alarme();
    if (type === 'miettes') { const L = mise(E.J.V); for (let k = 0; k < 46; k++) E.parts.push({ type: 'miette', x: L.bloc.x + Math.random() * L.bloc.w, y: L.bloc.y + Math.random() * L.bloc.h, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 90, t: 0, max: 9, sol: L.planche.y + L.planche.h - 6 - Math.random() * 18 }); }
  }
  function recommencer() { remy('parle', choix(T().remy.encore)); etape(E.etape); }

  // ------------------------------------------------------------ commandes
  // le clavier : Espace / Entrée maintenus (verser), et un appui (couper, ajouter le beurre, retirer du feu, réessayer)
  function clavier(e) {
    if (!E || !['Space', 'Enter', 'NumpadEnter', 'KeyE'].includes(e.code)) return;
    const bas = e.type === 'keydown';
    E.touche = bas;
    if (bas && !e.repeat) appui();
  }
  function appui() {
    if (E.phase === 'rate') { if (E.tPhase > 2) recommencer(); return; }
    if (E.phase !== 'jeu') return;
    const n = ETAPES[E.etape];
    if (n === 'beurre' && E.sous === 'coupe') couper(E.couteau);
    else if (n === 'beurre') deposer();
    else if (n === 'texture') retirer();
  }
  const dans = (p, r) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;
  function zoneDe(pos, L) {
    const n = ETAPES[E.etape];
    if ((n === 'fonte' || n === 'texture') && Math.abs(pos.x - L.feuX) < 18 && pos.y > L.feuY0 - 14 && pos.y < L.feuY1 + 14) return 'feu';
    if (n === 'texture' && dans(pos, L.bouton)) return 'bouton';
    if (n === 'beurre' && dans(pos, { x: L.planche.x - 6, y: L.planche.y - 26, w: L.planche.w + 12, h: L.planche.h + 32 })) return 'planche';
    const dx = (pos.x - L.px) / L.R, dy = (pos.y - L.py) / (L.R * 0.6);
    if (dx * dx + dy * dy < 1.7) return 'pot';
    return 'ailleurs';
  }
  function reglerFeu(y, L) { E.feu = clamp(1 - (y - L.feuY0) / (L.feuY1 - L.feuY0)); }
  function pointeur(type, pos, e) {
    if (!E) return;
    const id = e && e.pointerId !== undefined ? e.pointerId : 0, L = mise(E.J.V);
    if (type === 'down') {
      if (E.phase === 'rate') { if (E.tPhase > 2) recommencer(); return; }
      const z = zoneDe(pos, L);
      E.doigts.set(id, { zone: z, x: pos.x, y: pos.y, x0: pos.x, y0: pos.y, a: null });
      if (E.phase !== 'jeu') return;
      if (z === 'feu') reglerFeu(pos.y, L);
      if (z === 'bouton') retirer();
      if (z === 'planche' && E.sous === 'ajout' && E.morceaux > 0 && !E.tenu) E.tenu = { id, x: pos.x, y: pos.y };
      if (z === 'planche' && E.sous === 'coupe') E.couteau = pos.x;
      return;
    }
    const d = E.doigts.get(id);
    if (!d) return;
    if (type === 'up') {
      E.doigts.delete(id);
      if (E.tenu && E.tenu.id === id) {
        E.tenu = null;
        const dx = (pos.x - L.px) / L.R, dy = (pos.y - L.py) / (L.R * 0.6);
        if (E.phase === 'jeu' && dx * dx + dy * dy < 1.5) deposer();
      }
      if (E.phase === 'jeu' && d.zone === 'planche' && E.sous === 'coupe') {
        const dy = pos.y - d.y0, dx = pos.x - d.x0;
        if (dy > L.bloc.h * 0.55 && Math.abs(dx) < dy * 0.7) couper((pos.x + d.x0) / 2);
      }
      return;
    }
    d.x = pos.x; d.y = pos.y;
    if (E.phase !== 'jeu') return;
    if (d.zone === 'feu') reglerFeu(pos.y, L);
    if (E.tenu && E.tenu.id === id) { E.tenu.x = pos.x; E.tenu.y = pos.y; }
    if (d.zone === 'planche' && E.sous === 'coupe') E.couteau = pos.x;
    if (d.zone === 'pot') {
      // le mélange : on compte les tours faits autour du milieu de la casserole
      const ux = pos.x - L.px, uy = (pos.y - L.py) / 0.55, r = Math.hypot(ux, uy), a = Math.atan2(uy, ux);
      if (r > L.R * 0.12 && d.a !== null) {
        let da = a - d.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
        if (Math.abs(da) < 1.2) { E.toursAcc += Math.abs(da) / (Math.PI * 2); E.angle += da; }
      }
      d.a = r > L.R * 0.12 ? a : null;
      E.cuillere = { x: pos.x, y: pos.y, t: E.t };
    }
  }
  // on verse (sucre, crème) tant qu'on maintient : Espace, ou un doigt (pour la crème : hors de la casserole)
  const verse = () => E.touche || [...E.doigts.values()].some((d) => (E.etape === 0) || (E.etape === 3 && d.zone === 'ailleurs'));

  // ------------------------------------------------------------ 1. LE SUCRE
  const INIT = {};
  INIT.sucre = () => Object.assign(E, { poids: 0, incl: 0, tenuT: 0, vol: [], calme: 0, flamme: 0, motte: 0 });
  function majSucre(dt, L) {
    const S = REGLAGES.sucre, tient = verse();
    if (tient && E.incl === 0) E.motte = Math.random() < S.paquet[0] ? S.paquet[1] + Math.random() * (S.paquet[2] - S.paquet[1]) : 0;
    if (tient) { E.incl = Math.min(1, E.incl + dt / 0.25); E.tenuT += dt; } else { E.incl = Math.max(0, E.incl - dt / 0.3); E.tenuT = 0; }
    if (E.motte && E.incl >= 0.45) { E.vol.push({ m: E.motte, t: E.t + S.vol }); E.motte = 0; for (let k = 0; k < 8; k++) E.parts.push({ type: 'grain', x: L.sacX + Math.random() * 8, y: L.sacY + 4, vx: (Math.random() - 0.5) * 16, vy: 30 + Math.random() * 20, t: 0, max: 2, sol: L.py - 2 }); }
    const q = E.incl * (S.debit + (S.debitMax - S.debit) * Math.min(1, E.tenuT / 1.5));
    if (q > 0.3) E.vol.push({ m: q * dt, t: E.t + S.vol });
    while (E.vol.length && E.vol[0].t <= E.t) E.poids += E.vol.shift().m;
    if (Math.random() < q * dt * 0.7) E.parts.push({ type: 'grain', x: L.sacX + 2 + Math.random() * 4, y: L.sacY + 4, vx: (Math.random() - 0.5) * 10, vy: 30 + Math.random() * 20, t: 0, max: 2, sol: L.py - 2 });
    if (tient && Math.random() < dt * 9) Musique.sucre();
    if (E.poids > S.cible - 40 && tient) alerte('sucreDoucement', 'inquiet', 5);
    if (E.poids > S.max) return rater('trop');
    const repos = !tient && E.incl === 0 && !E.vol.length;
    if (repos && E.poids > S.cible + S.tol) return rater('trop');
    if (repos && E.poids >= S.cible - S.tol) { E.calme += dt; if (E.calme > 0.6) reussir(); } else E.calme = 0;
    if (E.phase === 'jeu' && E.temps > S.temps) rater('dodo');
  }

  // ------------------------------------------------------------ 2. FAIRE FONDRE
  INIT.fonte = () => {
    const cel = [{ u: 0, v: 0 }];
    for (let k = 0; k < 6; k++) cel.push({ u: Math.cos(k / 6 * Math.PI * 2) * 0.42, v: Math.sin(k / 6 * Math.PI * 2) * 0.42 });
    for (let k = 0; k < 12; k++) cel.push({ u: Math.cos((k + 0.5) / 12 * Math.PI * 2) * 0.8, v: Math.sin((k + 0.5) / 12 * Math.PI * 2) * 0.8 });
    cel.forEach((c, i) => Object.assign(c, { m: 0, c: 0, f: 1, noir: false, g: i * 2.39 }));
    Object.assign(E, { cel, chaud: { a: Math.random() * Math.PI * 2, r: 0.55, saut: 6 }, feu: 0.3, puissance: 0, flamme: 0, noirs: 0, moyC: 0, moyM: 0 });
  };
  function majFonte(dt) {
    const F = REGLAGES.fonte, n = E.cel.length;
    E.puissance += (E.feu - E.puissance) * Math.min(1, dt / 0.6); E.flamme = E.puissance;
    E.chaud.a += dt * 0.12;
    if ((E.chaud.saut -= dt) <= 0) { E.chaud.a += (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 1.2); E.chaud.saut = F.saut[0] + Math.random() * (F.saut[1] - F.saut[0]); }
    const hx = Math.cos(E.chaud.a) * E.chaud.r, hy = Math.sin(E.chaud.a) * E.chaud.r;
    let sm = 0, sc = 0;
    for (const c of E.cel) {
      c.f = F.froid + F.chaud * Math.exp(-((c.u - hx) ** 2 + (c.v - hy) ** 2) / 0.18);
      const r = E.puissance * c.f;
      if (c.m < 1) c.m = Math.min(1, c.m + r * F.fonte * dt);
      c.c += (c.m * r * F.cuisson + Math.max(0, E.puissance - F.fort) * c.f * F.forte) * dt;
      sm += c.m; sc += c.c;
    }
    sm /= n; sc /= n;
    const k = Math.min(1, E.remue * F.melange * dt);
    let mmin = 1;
    for (const c of E.cel) {
      c.m += (sm - c.m) * k; c.c += (sc - c.c) * k; mmin = Math.min(mmin, c.m);
      if (!c.noir && c.c >= F.noir) { c.noir = true; E.noirs++; alerte('noir', 'panique', 2); Musique.bip(180, 0.05); }
    }
    E.moyC = sc; E.moyM = sm;
    if (E.puissance > 0.85) alerte('tropFort', 'inquiet', 4);
    else if (E.temps > 8 && sm < 0.35) alerte('tropFaible', 'inquiet', 6);
    else if (E.remue < 0.3 && E.cel.some((c) => c.c > 0.6 && !c.noir)) alerte('attacheFonte', 'inquiet', 4);
    if (Math.random() < dt * (2 + sm * 6) * E.puissance) Musique.bulle();
    if (E.noirs >= F.nbNoirs || sc >= F.moyenne) return rater('brule');
    if (mmin >= 0.97 && sc >= F.dore) return reussir();
    if (mmin >= 0.97) alerte('fonduPale', 'parle', 6);
    if (E.temps > F.temps) rater('cristal');
  }

  // ------------------------------------------------------------ 3. LE BEURRE DEMI-SEL
  INIT.beurre = () => Object.assign(E, { sous: 'coupe', coupes: [], rates: 0, couteau: null, temp: REGLAGES.beurre.T0, morceaux: 5, fondants: [], tenu: null, flamme: 0.55, eclab: 0 });
  function couper(x) {
    if (E.sous !== 'coupe' || x === null || E.phase !== 'jeu') return;
    const B = REGLAGES.beurre, L = mise(E.J.V), ligne = L.bloc.x + L.bloc.w * B.lignes[E.coupes.length], d = Math.abs(x - ligne);
    if (d <= B.travers) {
      E.coupes.push(d <= B.tol ? ligne + (x - ligne) * 0.3 : x);
      Musique.couteau();
      for (let k = 0; k < 6; k++) E.parts.push({ type: 'miette', x, y: L.bloc.y + Math.random() * L.bloc.h, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 30, t: 0, max: 1.2, sol: L.bloc.y + L.bloc.h });
      if (d <= B.tol) alerte('coupeBien', 'content', 0.4);
      else { E.rates++; alerte('coupeTravers', 'inquiet', 0.4); }
    } else { E.rates++; Musique.bip(200, 0.04); alerte('coupeRate', 'inquiet', 0.4); }
    if (E.rates >= B.ratesMax) return rater('miettes');
    if (E.coupes.length === B.lignes.length) {
      E.sous = 'ajout'; E.temps = 0; majAide();
      remy('parle', T().remy.ajout);
    }
  }
  function deposer() {
    if (E.sous !== 'ajout' || E.morceaux <= 0 || E.phase !== 'jeu') return;
    const B = REGLAGES.beurre;
    E.morceaux--;
    if (E.fondants.some((f) => f.p < 0.6)) { E.temp -= B.eclabousse; E.eclab++; alerte('eclabousse', 'panique', 1); for (let k = 0; k < 10; k++) splash(); }
    const a = Math.random() * Math.PI * 2;
    E.fondants.push({ p: 0, u: Math.cos(a) * 0.35, v: Math.sin(a) * 0.35 });
    Musique.gresille();
  }
  function splash() {
    const L = mise(E.J.V);
    E.parts.push({ type: 'goutte', x: L.px + (Math.random() - 0.5) * L.R, y: L.py, vx: (Math.random() - 0.5) * 90, vy: -60 - Math.random() * 60, t: 0, max: 1.4, col: nuance(0.55), sol: L.py + L.R * 0.6 });
  }
  function majBeurre(dt, L) {
    const B = REGLAGES.beurre;
    if (E.sous === 'coupe') {
      if (E.couteau === null) E.couteau = L.bloc.x + L.bloc.w / 2;
      if (Math.abs(E.J.input.x) > 0.5) E.couteau = clamp(E.couteau + E.J.input.x * 55 * dt, L.bloc.x - 4, L.bloc.x + L.bloc.w + 4);
      if (E.temps > B.temps) rater('fondu');
      return;
    }
    // l'ajout : le feu fait monter la température (de plus en plus vite), chaque morceau la fait baisser en fondant
    const monte = B.monte[0] + (B.monte[1] - B.monte[0]) * (1 - E.morceaux / 5);
    E.temp += monte * dt;
    for (const f of E.fondants) { f.p += dt / B.fonte; E.temp -= (B.baisse / B.fonte) * dt; if (Math.random() < dt * 14) E.parts.push({ type: 'crepite', x: L.px + f.u * L.R + (Math.random() - 0.5) * 12, y: L.py + 2 + f.v * L.R * 0.5, vx: (Math.random() - 0.5) * 30, vy: -25 - Math.random() * 25, t: 0, max: 0.5 }); }
    if (E.fondants.length && Math.random() < dt * 6) Musique.gresille();
    E.fondants = E.fondants.filter((f) => f.p < 1);
    if (E.temp > B.chaud - 10) alerte('chaud', 'inquiet', 3);
    else if (E.temp < B.froid + 10) alerte('froid', 'inquiet', 3);
    if (E.temp >= B.chaud) return rater('brule');
    if (E.temp <= B.froid) return rater('fige');
    if (E.morceaux === 0 && !E.fondants.length) reussir();
  }

  // ------------------------------------------------------------ 4. LA CRÈME
  INIT.creme = () => Object.assign(E, { creme: 0, mousse: 0, marbre: 0, inclC: 0, flamme: 0.3 });
  function majCreme(dt) {
    const C = REGLAGES.creme, tient = verse() && E.creme < 1;
    E.inclC = tient ? Math.min(1, E.inclC + dt / 0.25) : Math.max(0, E.inclC - dt / 0.25);
    const debit = E.creme < 1 ? E.inclC * C.debit : 0;
    E.creme = Math.min(1, E.creme + debit * dt);
    E.mousse = Math.max(0, E.mousse + (debit * C.mousse - E.remue * C.casse - E.mousse * C.retombe) * dt);
    E.marbre = clamp(E.marbre + (debit * 2.2 - E.remue * C.marbre * (0.4 + E.marbre)) * dt);
    if (debit > 0 && Math.random() < dt * 8) Musique.bulle();
    if (E.mousse > 0.62) alerte('mousse', 'panique', 2.5);
    else if (E.creme >= 1 && E.marbre > C.marbreMax) alerte('marbre', 'parle', 5);
    if (E.mousse >= 1) return rater('deborde');
    if (E.creme >= 1 && E.marbre <= C.marbreMax && E.mousse < 0.7) return reussir();
    if (E.temps > C.temps) rater('durci');
  }

  // ------------------------------------------------------------ 5. LA TEXTURE
  INIT.texture = () => Object.assign(E, { feu: 0.35, puissance: 0.35, temp: 100, epais: 0, gratin: 0, rafale: 0, flamme: 0.35 });
  function majTexture(dt) {
    const X = REGLAGES.texture;
    E.puissance += (E.feu - E.puissance) * Math.min(1, dt / 0.8); E.flamme = E.puissance;
    // le feu n'est pas régulier : une petite houle et des sautes de chaleur
    E.rafale = clamp(E.rafale + (Math.random() - 0.5) * 14 * dt - E.rafale * 0.3 * dt, -6, 6);
    const cible = 96 + 38 * E.puissance + 3 * Math.sin(E.t * 0.9) + E.rafale - Math.min(1.5, E.remue) * 2;
    E.temp += (cible - E.temp) * dt / 2;
    E.epais += Math.max(0, E.temp - X.seuil) * X.epaissit * dt;
    E.gratin = Math.max(0, E.gratin + (Math.max(0, E.temp - X.attache) * X.gratin * (1 - Math.min(1, E.remue)) + Math.max(0, E.temp - X.brule) * 0.06 - Math.min(1, E.remue) * 0.02) * dt);
    if (Math.random() < dt * (3 - E.epais * 2)) Musique.bulle();
    if (E.gratin > 0.45) alerte('attache', 'panique', 3);
    else if (E.temp > X.vert[1] + 6) alerte('tropChaud', 'inquiet', 4);
    else if (E.epais > X.fenetre[0] - 0.08 && E.epais < X.fenetre[0]) alerte('presque', 'inquiet', 6);
    if (E.gratin >= 1) return rater('attache');
    if (E.epais >= X.dur) return rater('dur');
    if (E.temps > X.temps) rater('liquide');
  }
  function retirer() {
    if (ETAPES[E.etape] !== 'texture' || E.phase !== 'jeu') return;
    const [a, b] = REGLAGES.texture.fenetre;
    E.flamme = 0; E.puissance = 0; E.feu = 0;
    if (E.epais < a) rater('liquide'); else if (E.epais > b) rater('dur'); else reussir(true);
  }

  // ------------------------------------------------------------ la boucle
  const MAJ = { sucre: majSucre, fonte: majFonte, beurre: majBeurre, creme: majCreme, texture: majTexture };
  function update(dt, J) {
    if (!E) return;
    dt = Math.min(dt, 0.05);
    E.t += dt; E.tPhase += dt;
    if (E.bulleT > 0 && (E.bulleT -= dt) <= 0) $('cui-bulle').hidden = true;
    const L = mise(J.V), n = ETAPES[E.etape];
    // le mélange (tours par seconde, lissé) : au doigt, à la souris ou avec ←→
    let inst = E.toursAcc / dt; E.toursAcc = 0;
    if (Math.abs(J.input.x) > 0.5 && n !== 'beurre') { inst += 0.9; E.angle += Math.sign(J.input.x) * 0.9 * Math.PI * 2 * dt; E.cuillere = null; }
    E.remue += (Math.min(2, inst) - E.remue) * Math.min(1, dt / 0.35);
    // le feu au clavier (↑↓)
    if ((n === 'fonte' || n === 'texture') && Math.abs(J.input.y) > 0.5 && E.phase === 'jeu') E.feu = clamp(E.feu - J.input.y * 0.55 * dt);
    // les particules
    for (const p of E.parts) {
      p.t += dt; p.vy += (p.type === 'z' ? -20 : 260) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.sol !== undefined && p.y > p.sol) { p.y = p.sol; p.vy = p.type === 'miette' ? -p.vy * 0.25 : 0; p.vx *= 0.5; }
    }
    E.parts = E.parts.filter((p) => p.t < p.max && !(p.type === 'grain' && p.y >= p.sol));
    for (const s of E.etincelles) s.t += dt;
    E.etincelles = E.etincelles.filter((s) => s.t < 1.2);
    for (const f of E.fumees) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.r += dt * 9; }
    E.fumees = E.fumees.filter((f) => f.t < f.max);
    if (n === 'fonte' && E.cel) for (const c of E.cel) if (c.noir && Math.random() < dt * 1.5) E.fumees.push({ x: L.px + c.u * L.R * 0.85, y: L.py + c.v * L.R * 0.42, vx: (Math.random() - 0.5) * 6, vy: -14, r: 2, t: 0, max: 1.6 });

    if (E.phase === 'intro' && E.tPhase > 1.6) { E.phase = 'jeu'; E.tPhase = 0; message(null); if (E.remy === 'parle') remy('neutre'); }
    if (E.phase === 'jeu') { E.temps += dt; MAJ[n](dt, L); }
    else if (E.phase === 'rate') echecAnime(dt, L);
    else if (E.phase === 'reussi' && E.tPhase > (E.etape === 4 ? 3 : 1.6)) {
      if (E.etape < 4) etape(E.etape + 1); else fermer(true);
    }
  }
  // les échecs, à regarder
  function echecAnime(dt, L) {
    const k = E.echec, tp = E.tPhase;
    if (k === 'trop') {
      E.tas = Math.min(1, E.tas + dt * 0.45); E.poids = Math.min(420, E.poids + dt * 160); E.incl = tp < 2.4 ? 1 : 0;
      if (E.tas > 0.55 && E.remy !== 'enseveli') remy('enseveli');
      if (tp < 2.4 && Math.random() < dt * 40) E.parts.push({ type: 'grain', x: L.sacX + 2 + Math.random() * 4, y: L.sacY + 4, vx: (Math.random() - 0.5) * 10, vy: 40, t: 0, max: 2, sol: L.py - 2 });
    }
    if (k === 'dodo' && Math.random() < dt * 2) { E.parts.push({ type: 'z', x: L.remyX + 26, y: L.remyY - 4, vx: 8 + Math.random() * 6, vy: -6, t: 0, max: 2.4 }); if (Math.random() < 0.4) Musique.ronfle(); }
    if (k === 'brule' || k === 'attache') {
      if (Math.random() < dt * 14) E.fumees.push({ x: L.px + (Math.random() - 0.5) * L.R, y: L.py - 6, vx: (Math.random() - 0.5) * 14, vy: -18 - Math.random() * 18, r: 4 + Math.random() * 5, t: 0, max: 3 + Math.random() * 1.5 });
      if (tp > 1.6 && E.remy === 'panique') remy('tousse');
      if (Math.floor(tp * 2) !== Math.floor((tp - dt) * 2) && tp < 3) Musique.alarme();
    }
    if (k === 'fondu') E.flaque = Math.min(1, E.flaque + dt * 0.6);
    if ((k === 'fige' || k === 'durci') && tp > 1.6 && E.remy === 'tire') remy('desespoir');
    if (k === 'deborde') { E.debord = Math.min(1, E.debord + dt * 0.55); if (Math.random() < dt * 10) Musique.bulle(); if (E.debord > 0.75 && E.remy !== 'enseveli') remy('enseveli'); }
    if (k === 'liquide') { if (tp > 1 && tp < 1.8 && Math.random() < dt * 30) splash(); if (tp > 1.2 && E.remy === 'goute') remy('pleure'); }
    if (k === 'dur') { if (tp > 1.3 && !E.chute) { E.chute = 0.01; Musique.choc(); } if (E.chute) E.chute = Math.min(1, E.chute + dt * 4); }
    if (tp > 2.2 && $('cui-aide').hidden) aide(T().reessayer[doigt() ? 0 : 1]);
  }

  function fermer(gagne) {
    const fin = E.fin, J = E.J;
    removeEventListener('keydown', clavier); removeEventListener('keyup', clavier);
    E = null; J.vue = null;
    document.body.classList.remove('cuisine');
    $('cuisine').hidden = true; $('cui-bulle').hidden = true;
    if (fin) fin(gagne);
  }

  // ------------------------------------------------------------ mise en page (recalculée à chaque image)
  function mise(V) {
    const w = V.w, h = V.h, R = Math.round(Math.min(w * 0.14, h * 0.24));
    const L = { w, h, R, px: Math.round(w * 0.5), py: Math.round(h * 0.62), rs: h >= 200 ? 3 : 2 };
    L.sacX = L.px - Math.round(R * 0.55); L.sacY = Math.round(L.py - R * 1.6);
    L.feuX = w - 52; L.feuY0 = Math.round(h * 0.2); L.feuY1 = Math.round(h * 0.72);
    L.jauge = w - 24; L.gauche = Math.round(w * 0.3);
    L.bouton = { x: w - 122, y: h - 40, w: 112, h: 22 };
    L.planche = { x: Math.round(w * 0.66), y: Math.round(h * 0.42), w: Math.round(w * 0.25), h: Math.round(h * 0.26) };
    L.bloc = { x: L.planche.x + Math.round(L.planche.w * 0.12), w: Math.round(L.planche.w * 0.76), h: 24 };
    L.bloc.y = L.planche.y + Math.round(L.planche.h / 2) - 14;
    L.remyX = Math.round(w * 0.15); L.remyY = Math.round(h * 0.96 - 38 * L.rs);
    return L;
  }

  // ------------------------------------------------------------ dessin : le décor
  const fonds = {};
  function decor(w, h) {
    const cle = w + 'x' + h;
    if (fonds[cle]) return fonds[cle];
    const c = PX.canvas(w, h), P = PX.painter(c), comptoir = Math.round(h * 0.7);
    // la faïence blanche, la guirlande, la barre aux casseroles, le plan de travail en inox
    P.rect(0, 0, w, comptoir, '#eef0f4');
    for (let y = 0; y < comptoir; y += 6) P.hline(0, y, w, '#d0d4de');
    for (let y = 0, k = 0; y < comptoir; y += 6, k++) for (let x = (k % 2) * 6; x < w; x += 12) P.vline(x, y, 6, '#d0d4de');
    P.rect(0, 0, w, 5, '#5a6070');
    for (let x = 0; x < w; x++) { const y = 8 + Math.round(Math.sin(((x % 60) / 60) * Math.PI) * 4); P.px(x, y, '#2a4a2a'); if (x % 7 === 3) P.px(x, y + 1, Montaigu.AMPOULES[(x / 7 | 0) % 5]); }
    P.rect(Math.round(w * 0.3), 18, Math.round(w * 0.45), 2, '#5a6070');
    for (let k = 0; k < 6; k++) { const x = Math.round(w * 0.32 + k * w * 0.08), s = 5 + (k % 3) * 2; P.vline(x, 20, 4, '#3a3a46'); P.ellipse(x, 24 + s, s + 1, s + 1, '#a8582a'); P.ellipse(x, 24 + s, s, s, '#d8783a'); P.px(x - 2, 22 + s, '#f8b07a'); }
    P.rect(0, comptoir, w, h - comptoir, '#a8aebc'); P.rect(0, comptoir, w, 5, '#c8ccd8'); P.hline(0, comptoir, w, '#eef0f6'); P.hline(0, comptoir + 5, w, '#8a90a0');
    for (let x = 0; x < w; x += 22) P.vline(x, comptoir + 6, h - comptoir - 6, '#9aa0b0');
    // l'étagère : épices, le livre de Gusteau, un pot de fleur de sel
    const ex = Math.round(w * 0.06), ey = Math.round(h * 0.22);
    P.rect(ex, ey, Math.round(w * 0.2), 3, '#7a4a2a'); P.hline(ex, ey, Math.round(w * 0.2), '#a8743e');
    for (let k = 0; k < 5; k++) P.rect(ex + 4 + k * 7, ey - 9, 5, 9, ['#d8323a', '#f2c230', '#3a8a4a', '#e8603a', '#8a5a3a'][k]);
    P.rect(ex + 42, ey - 12, 14, 12, '#a8343a'); P.hline(ex + 44, ey - 7, 10, '#e8b54a');
    P.rect(ex + 60, ey - 10, 12, 10, '#e8e4dc'); P.rect(ex + 60, ey - 12, 12, 3, '#3a5a8a'); P.px(ex + 63, ey - 6, '#ffffff'); P.px(ex + 67, ey - 4, '#ffffff');
    return (fonds[cle] = c);
  }

  // ------------------------------------------------------------ dessin : la casserole et son contenu
  function casserole(g, P, L, t, manche = 1) {
    const { px, py, R } = L, ry = Math.round(R * 0.5), haut = Math.round(R * 0.42);
    // le brûleur
    P.ellipse(px, py + haut + 4, R + 6, ry + 4, '#2a2a34'); P.ellipse(px, py + haut + 4, R - 4, ry - 4, '#4a4a58');
    // le manche
    const mw = Math.round(R * 0.9), mx = manche > 0 ? px + R - 2 : px - R + 2 - mw;
    g.fillStyle = '#5a5e6c'; g.fillRect(mx, py - 3, mw, 7); g.fillStyle = '#2a2a34'; g.fillRect(manche > 0 ? mx + mw - 10 : mx + 2, py - 2, 8, 5);
    // le corps de la casserole (inox)
    P.ellipse(px, py + haut, R, ry, '#7a7e8c');
    P.rect(px - R, py, R * 2 + 1, haut, '#9aa0b0'); P.rect(px - R, py, 4, haut, '#c8ccd8'); P.rect(px + R - 6, py, 6, haut, '#7a7e8c');
    // les flammes bleues du gaz, selon la puissance du feu (orange quand c'est beaucoup trop fort)
    const pw = E.phase === 'rate' && E.tPhase > 1 ? 0 : E.flamme;
    if (pw > 0.03) for (let k = 0; k < 13; k++) {
      const a = (k + 0.5) / 13 * Math.PI, hh = 1 + Math.round((2 + 7 * pw) * Math.abs(Math.sin(t * 13 + k * 1.9)));
      const fx = Math.round(px + Math.cos(a) * (R - 2)), fy = Math.round(py + haut + 3 + Math.sin(a) * (ry - 1));
      g.fillStyle = pw > 0.85 ? '#ff8a3a' : '#2a6aff'; g.fillRect(fx - 1, fy - hh, 3, hh); g.fillStyle = pw > 0.85 ? '#ffd27a' : '#9ad8ff'; g.fillRect(fx, fy - hh + 1, 1, Math.max(0, hh - 1));
    }
    P.ellipse(px, py, R, ry, '#d8dce6'); P.ellipse(px, py, R - 3, ry - 2, '#3a3a46');
    CONTENU[ETAPES[E.etape]](g, P, L, t, px, py + 2, R - 6, ry - 4);
  }
  // la cuillère en bois qui tourne (ou qui suit le doigt)
  function cuillere(P, L, rx, ry) {
    const tenu = E.cuillere && E.t - E.cuillere.t < 0.4;
    const cx = tenu ? E.cuillere.x : Math.round(L.px + Math.cos(E.angle) * rx * 0.55), cy = tenu ? E.cuillere.y : Math.round(L.py + 2 + Math.sin(E.angle) * ry * 0.55);
    Objets.line(P, cx, cy, cx + 18, cy - 42, '#a8743e'); Objets.line(P, cx + 1, cy, cx + 19, cy - 42, '#c89a5a'); P.ellipse(cx, cy, 4, 2, '#c89a5a');
  }
  // la cuillère plantée toute droite dans un caramel figé
  function cuillerePlantee(P, cx, cy) { Objets.line(P, cx + 2, cy, cx + 6, cy - 40, '#a8743e'); Objets.line(P, cx + 3, cy, cx + 7, cy - 40, '#c89a5a'); }
  // une motte de beurre (dessus clair, côté plus jaune, cristaux de sel)
  function motte(P, x, y, w, h) {
    if (w < 2 || h < 2) return;
    P.rect(x, y, w, h, '#f2d050'); P.rect(x, y, w, Math.max(1, Math.round(h * 0.4)), '#fae890'); P.hline(x, y + h - 1, w, '#c8a030'); P.vline(x + w - 1, y, h, '#d8b040');
    for (let k = 0; k < w * h / 18; k++) P.px(x + ((k * 7 + y) % w), y + ((k * 3) % h), '#ffffff');
  }
  const CONTENU = {
    sucre(g, P, L, t, cx, cy, rx, ry) {
      const n = Math.min(1.3, E.poids / REGLAGES.sucre.cible), r = Math.round(rx * Math.min(1, 0.3 + n * 0.8)), r2 = Math.max(1, Math.round(ry * Math.min(1, 0.3 + n * 0.8)));
      if (n > 0.02) {
        P.ellipse(cx, cy, r, r2, '#e8e4d8'); P.ellipse(cx, cy - Math.round(Math.min(1, n) * 8), Math.round(r * 0.7), Math.max(1, Math.round(r2 * 0.7)), '#f8f6f0');
        for (let k = 0; k < r; k += 3) { g.fillStyle = '#ffffff'; g.fillRect(cx - r + k * 2, cy - 1 + (k % 4) - Math.round(Math.min(1, n) * 4), 1, 1); }
      }
      if (E.echec === 'trop') { // le sucre déborde de partout
        const deb = Math.min(1, (E.poids - 200) / 220);
        const tas = (x, y, a, b) => { P.ellipse(x, y + 1, a + 1, b + 1, '#b8b4a8'); P.ellipse(x, y, a, b, '#e8e4d8'); P.ellipse(x - Math.round(a * 0.15), y - Math.round(b * 0.2), Math.round(a * 0.8), Math.round(b * 0.7), '#f8f6f0'); };
        tas(cx, L.py + Math.round(L.R * 0.42) + 10, Math.round(L.R + deb * 40), Math.round(6 + deb * 8));
        for (const s of [-1, 1]) tas(cx + s * (L.R + 4), L.py + Math.round(L.R * 0.42), Math.round(6 + deb * 16), Math.round(4 + deb * 8));
        tas(cx, cy - 6 - Math.round(deb * 18), L.R + Math.round(deb * 8), Math.round(L.R * 0.5) + Math.round(deb * 10));
      }
    },
    fonte(g, P, L, t, cx, cy, rx, ry) {
      if (E.echec === 'cristal') { P.ellipse(cx, cy - 4, rx - 4, ry + 2, '#e8e8e4'); P.ellipse(cx - 6, cy - 9, rx - 16, ry - 4, '#ffffff'); for (let k = 0; k < 14; k++) { g.fillStyle = k % 2 ? '#d0d0cc' : '#ffffff'; g.fillRect(Math.round(cx - rx * 0.6 + k * rx * 0.09), Math.round(cy - 10 + (k % 3) * 4), 3, 3); } return; }
      P.ellipse(cx, cy, rx, ry, E.moyM > 0.6 ? nuance(0.25 + E.moyC * 0.85) : '#cfc8b4');
      const cr = Math.max(4, Math.round(rx * 0.26)), brule = E.echec === 'brule' ? Math.min(1, E.tPhase * 0.5) : 0;
      for (const c of E.cel) {
        const x = Math.round(cx + c.u * rx), y = Math.round(cy + c.v * ry);
        const fondu = nuance(0.25 + c.c * 0.85), col = c.noir ? '#1d0e0a' : PX.mix(c.m < 0.5 ? PX.mix('#ffffff', '#f4ecd4', c.m * 2) : PX.mix('#f4ecd4', fondu, (c.m - 0.5) * 2), '#1d0e0a', brule);
        P.ellipse(x, y + 1, cr, Math.max(2, Math.round(cr * 0.5)), PX.shade(col, -0.12)); P.ellipse(x, y, cr, Math.max(2, Math.round(cr * 0.5)), col);
        if (c.m < 0.5 && !c.noir) { g.fillStyle = '#d8d4cc'; for (let k = 0; k < 4; k++) g.fillRect(x - cr + 2 + k * Math.round(cr / 2), y + (k % 2), 2, 1); } // le grain du sucre
        if (c.m < 0.8 && !c.noir) for (let k = 0; k < 3; k++) if (Math.sin(t * 4 + c.g + k * 2) > 0.3) { g.fillStyle = '#ffffff'; g.fillRect(x - cr + 2 + ((k * 5 + (c.g * 3 | 0)) % (cr * 2 - 3)), y - 1 + k % 2, 1, 1); } // les cristaux
        if (c.m > 0.5 && !c.noir && Math.sin(t * 6 + c.g) > 0.6) P.ellipse(x + ((c.g * 7 | 0) % 5) - 2, y, 1, 1, PX.shade(col, 0.3)); // une bulle
      }
      // la zone qui chauffe le plus : on la devine à la lueur orange sous la casserole
      const hx = Math.round(cx + Math.cos(E.chaud.a) * E.chaud.r * rx), hy = Math.round(L.py + Math.round(L.R * 0.42) + 6 + Math.sin(E.chaud.a) * 4);
      g.globalAlpha = 0.35 * E.puissance; P.ellipse(hx, hy, 12, 3, '#ff7a2a'); g.globalAlpha = 1;
      cuillere(P, L, rx, ry);
    },
    beurre(g, P, L, t, cx, cy, rx, ry) {
      let c = 0.5 + (E.temp - 165) / 90;
      if (E.echec === 'brule') c = 0.8 + Math.min(0.2, E.tPhase * 0.1);
      P.ellipse(cx, cy, rx, ry, nuance(c));
      if (E.echec === 'fige') { P.ellipse(cx, cy, rx, ry, '#d8a868'); for (let k = 0; k < 40; k++) { g.fillStyle = k % 2 ? '#c89048' : '#ecc890'; g.fillRect(Math.round(cx + Math.cos(k * 2.4) * rx * ((k * 37) % 100) / 100), Math.round(cy + Math.sin(k * 2.4) * ry * ((k * 53) % 100) / 100), 1, 1); } }
      for (let k = 0; k < 5; k++) { const ph = (t * 1.4 + k * 0.37) % 1; P.ellipse(Math.round(cx + Math.cos(k * 2.2) * rx * 0.5), Math.round(cy + Math.sin(k * 2.2) * ry * 0.5), 1 + Math.round(ph * 2), 1, PX.shade(nuance(c), 0.25)); }
      for (const f of E.fondants || []) { // le beurre qui fond en crépitant, entouré de mousse
        const x = Math.round(cx + f.u * rx), y = Math.round(cy + f.v * ry), s = Math.round(9 * (1 - f.p)) + 1;
        P.ellipse(x, y, s + 4, Math.round((s + 4) * 0.5), '#fbf2c8'); motte(P, x - Math.round(s / 2), y - Math.round(s / 3), s, Math.max(2, Math.round(s * 0.6)));
      }
      if (E.echec === 'fige') cuillerePlantee(P, cx, cy);
    },
    creme(g, P, L, t, cx, cy, rx, ry) {
      const base = PX.mix(nuance(0.58), '#f2dcb0', E.creme * 0.55);
      P.ellipse(cx, cy, rx, ry, E.echec === 'durci' ? PX.shade(base, -0.25) : base);
      // les traînées de crème pas encore mélangée
      for (let k = 0; k < 3; k++) for (let i = 0; i < 18 * E.marbre; i++) { const a = E.angle * 0.6 + k * 2.1 + i * 0.16, d = 0.15 + i * 0.04; g.fillStyle = 'rgba(255,248,232,0.9)'; g.fillRect(Math.round(cx + Math.cos(a) * d * rx), Math.round(cy + Math.sin(a) * d * ry), 2, 1); }
      // la mousse
      const m = Math.min(1.2, E.mousse + E.debord);
      if (m > 0.05) {
        const nb = Math.round(m * 40);
        for (let k = 0; k < nb; k++) { const a = k * 2.39, d = Math.sqrt(((k * 61) % 100) / 100); P.ellipse(Math.round(cx + Math.cos(a) * d * rx * 0.95), Math.round(cy + Math.sin(a) * d * ry * 0.9), 2 + (k % 3), 1 + (k % 2), k % 3 ? '#fff8ec' : '#f2e2c4'); }
        if (m > 0.45) { // le dôme de mousse qui monte au-dessus du bord
          const hm = Math.round((m - 0.45) * L.R * 0.9);
          P.ellipse(cx, cy - hm, rx + Math.round(m * 4), Math.round(ry * 0.8) + Math.round(hm * 0.6), '#f6ead2'); P.ellipse(cx - 4, cy - hm - 3, rx - 6, Math.round(ry * 0.6) + Math.round(hm * 0.4), '#fff8ec');
          for (let k = 0; k < 14; k++) if (Math.sin(t * 5 + k) > 0) P.ellipse(Math.round(cx - rx + ((k * 37) % (rx * 2))), Math.round(cy - hm - 4 + ((k * 13) % 8)), 2, 1, '#ffffff');
        }
        if (E.debord > 0) { // ça coule sur les côtés et ça envahit le plan de travail
          const fy = L.py + Math.round(L.R * 0.42) + 6;
          for (const s of [-1, 1]) P.rect(cx + s * (rx + 2) - 3, cy - 4, 7, Math.round(fy - cy + 4), '#f6ead2');
          P.ellipse(cx, fy + 4, Math.round(rx + E.debord * L.w * 0.3), Math.round(5 + E.debord * 10), '#f6ead2'); P.ellipse(cx - 6, fy + 2, Math.round(rx * 0.8 + E.debord * L.w * 0.25), Math.round(3 + E.debord * 7), '#fff8ec');
        }
      }
      if (E.echec === 'durci') cuillerePlantee(P, cx, cy);
      else cuillere(P, L, rx, ry);
    },
    texture(g, P, L, t, cx, cy, rx, ry) {
      let c = 0.5 + E.epais * 0.22;
      if (E.echec === 'attache') c = 0.75 + Math.min(0.25, E.tPhase * 0.12);
      if (E.echec === 'liquide') c = 0.45;
      const col = nuance(c);
      P.ellipse(cx, cy, rx, ry, col);
      P.ellipse(cx - Math.round(rx * 0.3), cy - Math.round(ry * 0.35), Math.round(rx * 0.35), Math.max(1, Math.round(ry * 0.18)), PX.shade(col, 0.22)); // le reflet brillant
      // les bulles, de plus en plus lentes et grosses quand ça épaissit
      for (let k = 0; k < 6; k++) { const ph = (t * (1.8 - E.epais * 1.3) + k * 0.37) % 1; P.ellipse(Math.round(cx + Math.cos(k * 2.2) * rx * 0.55), Math.round(cy + Math.sin(k * 2.2) * ry * 0.55), 1 + Math.round(ph * (2 + E.epais * 3)), 1, PX.shade(col, 0.25)); }
      // ce qui attache au fond : des points noirs sur les bords
      for (let k = 0; k < Math.round(E.gratin * 30); k++) { const a = k * 2.39; g.fillStyle = '#2a120a'; g.fillRect(Math.round(cx + Math.cos(a) * rx * 0.88), Math.round(cy + Math.sin(a) * ry * 0.85), 2, 1); }
      if (E.echec === 'dur' && !E.chute) cuillerePlantee(P, cx, cy);
      else if (!E.chute) cuillere(P, L, rx, ry);
    },
  };

  // ------------------------------------------------------------ dessin : les jauges et les commandes
  function cadre(g, x, y, w, h) { g.fillStyle = '#1d1626'; g.fillRect(x - 2, y - 2, w + 4, h + 4); }
  // une jauge verticale : frac 0 → 1 du bas vers le haut ; bandes [{ a, b, col }]
  function jauge(g, x, y0, y1, frac, bandes, remplissage) {
    const h = y1 - y0, w = 12;
    cadre(g, x, y0, w, h); g.fillStyle = '#3a3646'; g.fillRect(x, y0, w, h);
    for (const b of bandes) { g.fillStyle = b.col; g.fillRect(x, Math.round(y1 - b.b * h), w, Math.max(1, Math.round((b.b - b.a) * h))); }
    if (remplissage) { const f = clamp(frac); g.fillStyle = remplissage; g.fillRect(x + 3, Math.round(y1 - f * h), w - 6, Math.round(f * h)); }
    // le curseur : un trait et une petite flèche blanche
    const cy = Math.round(y1 - clamp(frac) * h);
    g.fillStyle = '#1d1626'; g.fillRect(x - 1, cy - 1, w + 2, 3); g.fillStyle = '#ffffff'; g.fillRect(x, cy, w, 1);
    for (let k = 0; k < 4; k++) { g.fillStyle = '#1d1626'; g.fillRect(x + w + 2 + k, cy - 4 + k, 1, 9 - k * 2); g.fillStyle = '#ffffff'; if (k > 0) g.fillRect(x + w + 2 + k, cy - 3 + k, 1, 7 - k * 2); }
  }
  function thermometre(g, P, x, y0, y1, frac, vert, danger) {
    const h = y1 - y0;
    cadre(g, x + 3, y0, 6, h); g.fillStyle = '#f4f2ec'; g.fillRect(x + 3, y0, 6, h);
    g.fillStyle = 'rgba(58,168,90,0.55)'; g.fillRect(x + 3, Math.round(y1 - vert[1] * h), 6, Math.round((vert[1] - vert[0]) * h));
    const f = clamp(frac);
    g.fillStyle = danger && Math.floor(E.t * 6) % 2 ? '#ff6a3a' : '#d8323a'; g.fillRect(x + 5, Math.round(y1 - f * h), 2, Math.round(f * h) + 3);
    P.ellipse(x + 6, y1 + 4, 5, 5, '#1d1626'); P.ellipse(x + 6, y1 + 4, 4, 4, '#d8323a'); P.px(x + 5, y1 + 2, '#ff9a8a');
    for (const v of vert) { g.fillStyle = '#3aa85a'; g.fillRect(x - 2, Math.round(y1 - v * h), 4, 1); }
  }
  function curseurFeu(g, P, L) {
    const x = L.feuX, y0 = L.feuY0, y1 = L.feuY1, h = y1 - y0;
    cadre(g, x - 3, y0, 6, h);
    for (let j = 0; j < h; j++) { g.fillStyle = PX.mix('#3a6aff', '#ff5a2a', 1 - j / h); g.fillRect(x - 3, y0 + j, 6, 1); }
    const ky = Math.round(y1 - E.feu * h);
    P.rect(x - 9, ky - 4, 18, 8, '#1d1626'); P.rect(x - 8, ky - 3, 16, 6, '#c8ccd8'); P.hline(x - 8, ky - 3, 16, '#ffffff'); P.rect(x - 2, ky - 2, 4, 4, '#5a6070');
    // une petite flamme en haut, un flocon en bas
    P.ellipse(x, y0 - 9, 3, 4, '#ff7a2a'); P.ellipse(x, y0 - 8, 1, 2, '#ffd27a');
    P.rect(x - 2, y1 + 6, 5, 1, '#8ad0ff'); P.rect(x, y1 + 4, 1, 5, '#8ad0ff');
    Arendelle.texte(P, 'FEU', x - 5, y1 + 12, '#1d1626');
  }
  function tempsRestant(g, L) {
    const lim = limite();
    if (!lim || E.phase !== 'jeu') return;
    const f = clamp(1 - E.temps / lim), w = 96, x = Math.round(L.w / 2 - w / 2), y = 15;
    cadre(g, x, y, w, 3); g.fillStyle = '#3a3646'; g.fillRect(x, y, w, 3);
    g.fillStyle = f < 0.25 && Math.floor(E.t * 6) % 2 ? '#ff6a5a' : '#8ad0ff'; g.fillRect(x, y, Math.round(w * f), 3);
  }
  function testCuillere(g, P, x, y, t) {
    // le test de la cuillère : le caramel coule en gouttes, en filet, nappe… ou reste collé
    const e = E.epais, [a, b] = REGLAGES.texture.fenetre;
    g.fillStyle = 'rgba(29,22,38,0.75)'; g.fillRect(x - 14, y - 4, 28, 42);
    Objets.line(P, x - 10, y + 2, x + 2, y + 10, '#a8743e'); P.ellipse(x + 4, y + 12, 5, 3, '#c89a5a');
    const col = nuance(0.5 + e * 0.22), ph = (t * (1.6 - e)) % 1;
    if (e < 0.4) { for (let k = 0; k < 3; k++) { const yy = y + 15 + ((ph + k / 3) % 1) * 16; g.fillStyle = col; g.fillRect(x + 4, Math.round(yy), 1, 2); } }
    else if (e < a) { g.fillStyle = col; g.fillRect(x + 4, y + 15, 1, Math.round(8 + ph * 8)); }
    else if (e <= b) { g.fillStyle = col; g.fillRect(x + 3, y + 15, 3, 13); g.fillRect(x + 2, y + 26, 5, 3); if (Math.sin(t * 6) > 0) { g.fillStyle = '#fff4c0'; g.fillRect(x + 8, y + 10, 1, 1); } }
    else P.ellipse(x + 4, y + 15, 4, 3, PX.shade(col, -0.15));
    Arendelle.texte(P, 'NAPPE', x - 9, y + 32, '#f6d27a');
  }

  // ------------------------------------------------------------ dessin : Rémy
  function dessinRemy(g, L, t) {
    const pose = E.remy, im = Resto.grand(pose, Math.floor(t * 4) % 2), s = L.rs, u = s * 2 / 3;
    const bond = pose === 'joie' ? Math.round(Math.abs(Math.sin(t * 7)) * 8) : pose === 'panique' || pose === 'tire' ? Math.round(Math.sin(t * 30) * 2) : 0;
    const x = Math.round(L.remyX - (im.width * s) / 2), y = Math.round(L.h * 0.96 - im.height * s) - bond;
    const P = PX.painter(g.canvas);
    if (E.chute) { // il tirait sur la cuillère… qui lâche d'un coup : il tombe à la renverse
      const px = x + im.width * s / 2, py = y + im.height * s;
      g.save(); g.translate(px, py); g.rotate(E.chute * 1.35); g.drawImage(im, -im.width * s / 2, -im.height * s, im.width * s, im.height * s); g.restore();
      // des étoiles qui tournent autour de sa tête, et la cuillère qui s'envole
      const tx = px + Math.round(Math.sin(E.chute * 1.35) * 18 * s), ty = py - Math.round(Math.cos(E.chute * 1.35) * 18 * s);
      for (let k = 0; k < 5; k++) { const a = t * 5 + k * 1.26; g.fillStyle = k % 2 ? '#f2c230' : '#fff4b0'; g.fillRect(Math.round(tx + Math.cos(a) * 12), Math.round(ty - 8 + Math.sin(a) * 4), 2, 2); }
      const sx = px + 26 * u + Math.round(E.chute * 20), sy = py - 40 * u - Math.round(E.chute * 10);
      Objets.line(P, sx, sy, sx + 14, sy + 30, '#a8743e'); P.ellipse(sx, sy, 4, 2, '#c89a5a');
    } else g.drawImage(im, x, y, im.width * s, im.height * s);
    const hx = L.remyX, hy = Math.round(L.h * 0.96);
    // enseveli sous le sucre ou sous la mousse
    if ((E.echec === 'trop' && E.tas > 0) || (E.echec === 'deborde' && E.debord > 0.5)) {
      const f = E.echec === 'trop' ? E.tas : (E.debord - 0.5) * 2, rx = Math.round(20 * u + f * 16 * u), ryy = Math.round(f * 40 * u);
      const [c1, c2, c3] = E.echec === 'trop' ? ['#b8b4a8', '#e8e4d8', '#f8f6f0'] : ['#d8c8a8', '#f2e4c8', '#fff8ec'];
      P.ellipse(hx, hy + 1, rx + 1, ryy + 1, c1); P.ellipse(hx, hy, rx, ryy, c2); P.ellipse(hx - 3 * u, hy - 2 * u, Math.round(rx * 0.8), Math.round(ryy * 0.75), c3);
      for (let k = 0; k < 16; k++) if (Math.sin(t * 6 + k * 1.7) > 0.5) { const d = E.echec === 'deborde' ? 2 : 1; g.fillStyle = '#ffffff'; g.fillRect(Math.round(hx + Math.cos(k * 2.4) * rx * 0.7), Math.round(hy - ryy * 0.5 + Math.sin(k * 2.4) * ryy * 0.4), d, d); }
    }
    // le torchon qu'il agite en toussant
    if (pose === 'tousse') { const ty = y + 17 * s + Math.round(Math.sin(t * 14) * 3); g.fillStyle = '#f4f2ec'; g.fillRect(x + 15 * s, ty, 6 * s, 4 * s); g.fillStyle = '#d8323a'; g.fillRect(x + 15 * s, ty + s, 6 * s, s); }
  }

  // ------------------------------------------------------------ dessin : tout
  function draw(g, V, t) {
    if (!E) return;
    const L = mise(V), P = PX.painter(g.canvas), w = V.w, h = V.h, n = ETAPES[E.etape];
    g.drawImage(decor(w, h), 0, 0);
    // l'alarme incendie, au mur
    const al = (E.echec === 'brule' || E.echec === 'attache') && E.phase === 'rate';
    g.fillStyle = '#f4f2ec'; g.fillRect(Math.round(w * 0.62), 26, 12, 6); g.fillStyle = al && Math.floor(t * 6) % 2 ? '#ff3a3a' : '#7a2a2a'; g.fillRect(Math.round(w * 0.62) + 4, 28, 4, 3);
    // 1. le paquet de sucre, qui penche quand on verse
    if (n === 'sucre') {
      const sx = L.sacX, sy = L.sacY;
      g.save(); g.translate(sx + 10, sy + 10); g.rotate(0.35 + E.incl * 0.75); g.translate(-(sx + 10), -(sy + 10));
      P.rect(sx, sy, 22, 28, '#f4efe2'); P.rect(sx, sy, 22, 3, '#ffffff'); P.rect(sx + 2, sy + 10, 18, 9, '#3a6aa8');
      Arendelle.texte(P, 'SUCRE', sx + 2, sy + 12, '#ffffff'); P.rect(sx + 20, sy, 2, 28, '#d8d0c0');
      g.restore();
    }
    // 3. la planche, la motte de beurre demi-sel, le couteau
    if (n === 'beurre') planche(g, P, L, t);
    casserole(g, P, L, t, n === 'beurre' ? -1 : 1);
    // 4. le pichet de crème et son filet
    if (n === 'creme') pichet(g, P, L, t);
    // les particules
    for (const p of E.parts) {
      if (p.type === 'grain') { g.fillStyle = '#ffffff'; g.fillRect(Math.round(p.x), Math.round(p.y), 1, 2); }
      else if (p.type === 'miette') { g.fillStyle = '#fae890'; g.fillRect(Math.round(p.x), Math.round(p.y), 3, 2); g.fillStyle = '#c8a030'; g.fillRect(Math.round(p.x), Math.round(p.y) + 2, 3, 1); }
      else if (p.type === 'crepite') { g.fillStyle = p.t < 0.2 ? '#ffffff' : '#fae890'; g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
      else if (p.type === 'goutte') { g.fillStyle = p.col; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
      else if (p.type === 'z') { g.globalAlpha = Math.max(0, 1 - p.t / p.max); Montaigu.texte2x(P, 'Z', Math.round(p.x), Math.round(p.y), '#3a4a8a'); g.globalAlpha = 1; }
    }
    // les jauges et les commandes
    if (n === 'sucre') {
      const S = REGLAGES.sucre, y0 = Math.round(h * 0.2), y1 = Math.round(h * 0.68), max = 240;
      jauge(g, L.jauge, y0, y1, E.poids / max, [{ a: (S.cible - S.tol) / max, b: (S.cible + S.tol) / max, col: '#3aa85a' }, { a: S.max / max, b: 1, col: '#c84a3a' }], '#f8f6f0');
      // la balance : l'affichage en grammes
      const g0 = Math.round(E.poids), txt = String(Math.min(999, g0)).padStart(3, '0') + 'G', bx = L.jauge - 62, by = y1 + 10;
      cadre(g, bx, by, 58, 14); g.fillStyle = '#20302a'; g.fillRect(bx, by, 58, 14);
      Montaigu.texte2x(P, txt, bx + 4, by + 2, Math.abs(g0 - S.cible) <= S.tol ? '#7aff9a' : '#9ad8b8');
      Arendelle.texte(P, '200G', L.jauge - 22, y0 - 10, '#1d1626');
    } else if (n === 'fonte') {
      curseurFeu(g, P, L);
      const y0 = L.feuY0, y1 = L.feuY1;
      jauge(g, L.jauge, y0, y1, E.moyM, [], '#f2e6c0');
      Arendelle.texte(P, 'FONDU', L.jauge - 8, y1 + 12, '#1d1626');
      // la couleur, à gauche de la casserole (le haut de la jauge, c'est brûlé) et les points noirs
      const F = REGLAGES.fonte;
      jauge(g, L.gauche, y0, y1, E.moyC / F.moyenne, [{ a: F.dore / F.moyenne, b: 0.86, col: '#3aa85a' }, { a: 0.86, b: 1, col: '#c84a3a' }], nuance(E.moyC));
      for (let k = 0; k < REGLAGES.fonte.nbNoirs; k++) { g.fillStyle = k < E.noirs ? '#1d0e0a' : '#c8ccd8'; g.fillRect(L.gauche - 1 + k * 5, y1 + 6, 4, 4); }
      Arendelle.texte(P, 'COULEUR', L.gauche - 10, y1 + 13, '#1d1626');
    } else if (n === 'beurre' && E.sous === 'ajout') {
      const B = REGLAGES.beurre, lo = 120, hi = 205, f = (v) => (v - lo) / (hi - lo), y0 = Math.round(h * 0.18), y1 = Math.round(h * 0.7);
      thermometre(g, P, L.jauge - 4, y0, y1, f(E.temp), [f(B.vert[0]), f(B.vert[1])], E.temp > B.chaud - 10 || E.temp < B.froid + 10);
      g.fillStyle = '#c84a3a'; g.fillRect(L.jauge - 8, Math.round(y1 - f(B.chaud) * (y1 - y0)), 6, 1); g.fillStyle = '#3a6aff'; g.fillRect(L.jauge - 8, Math.round(y1 - f(B.froid) * (y1 - y0)), 6, 1);
      Arendelle.texte(P, String(Math.round(E.temp)) + 'C', L.jauge - 12, y0 - 10, '#1d1626');
    } else if (n === 'creme') {
      const y0 = Math.round(h * 0.2), y1 = Math.round(h * 0.68);
      jauge(g, L.jauge, y0, y1, E.mousse, [{ a: 0.62, b: 1, col: '#c84a3a' }], '#fff8ec');
      Arendelle.texte(P, 'MOUSSE', L.jauge - 10, y1 + 12, '#1d1626');
      jauge(g, L.gauche, y0, y1, E.creme, [], '#f2dcb0');
      Arendelle.texte(P, 'CREME', L.gauche - 8, y1 + 12, '#1d1626');
    } else if (n === 'texture') {
      const X = REGLAGES.texture, lo = 90, hi = 135, f = (v) => (v - lo) / (hi - lo), y0 = L.feuY0, y1 = L.feuY1;
      curseurFeu(g, P, L);
      thermometre(g, P, L.jauge - 4, y0, y1, f(E.temp), [f(X.vert[0]), f(X.vert[1])], E.temp > X.vert[1] + 6);
      Arendelle.texte(P, String(Math.round(E.temp)) + 'C', L.jauge - 12, y0 - 10, '#1d1626');
      // la consistance, et le test de la cuillère
      jauge(g, L.gauche, y0, y1, E.epais, [{ a: X.fenetre[0], b: X.fenetre[1], col: '#3aa85a' }, { a: X.dur, b: 1, col: '#c84a3a' }], nuance(0.5 + E.epais * 0.22));
      testCuillere(g, P, L.gauche - 36, y0 + 30, t);
      // ce qui attache au fond
      g.fillStyle = '#1d1626'; g.fillRect(L.gauche - 2, y1 + 6, 16, 4); g.fillStyle = E.gratin > 0.5 ? '#ff6a3a' : '#8a5a3a'; g.fillRect(L.gauche - 1, y1 + 7, Math.round(14 * clamp(E.gratin)), 2);
      Arendelle.texte(P, 'FOND', L.gauche - 2, y1 + 13, '#1d1626');
      // le bouton « retirer du feu »
      const B = L.bouton, appuye = E.phase !== 'jeu';
      cadre(g, B.x, B.y, B.w, B.h); g.fillStyle = appuye ? '#8a7a5a' : '#e8b54a'; g.fillRect(B.x, B.y, B.w, B.h); g.fillStyle = '#fff1bb'; g.fillRect(B.x, B.y, B.w, 2); g.fillStyle = '#a8742e'; g.fillRect(B.x, B.y + B.h - 2, B.w, 2);
      Arendelle.texte(P, T().bouton, B.x + Math.round((B.w - Arendelle.largeurTexte(T().bouton)) / 2), B.y + 9, '#2a1e18');
    }
    // la flaque de beurre fondu (échec), la fumée, l'assombrissement
    if (E.flaque > 0) { const b = L.bloc; P.ellipse(b.x + b.w / 2, b.y + b.h, Math.round(b.w / 2 + E.flaque * 20), Math.round(4 + E.flaque * 8), '#f2d050'); P.ellipse(b.x + b.w / 2 - 4, b.y + b.h - 2, Math.round(b.w / 3 + E.flaque * 10), Math.round(2 + E.flaque * 4), '#fae890'); }
    for (const f of E.fumees) { const a = Math.max(0, 0.7 - f.t / f.max * 0.7); P.ellipse(Math.round(f.x), Math.round(f.y), Math.round(f.r), Math.round(f.r * 0.8), `rgba(40,34,40,${a.toFixed(2)})`); }
    if (al) { g.fillStyle = `rgba(30,26,34,${Math.min(0.5, E.tPhase * 0.18).toFixed(2)})`; g.fillRect(0, 0, w, h); }
    dessinRemy(g, L, t);
    // le morceau de beurre qu'on tient
    if (E.tenu) motte(P, Math.round(E.tenu.x - 6), Math.round(E.tenu.y - 5), 12, 9);
    tempsRestant(g, L);
    for (const s of E.etincelles) { const d = s.t * 50; g.fillStyle = s.t % 0.2 < 0.1 ? '#fff4c0' : '#ffd27a'; g.fillRect(Math.round(s.x + Math.cos(s.a) * d), Math.round(s.y + Math.sin(s.a) * d - s.t * 20), 2, 2); }
  }
  function planche(g, P, L, t) {
    const pl = L.planche, b = L.bloc;
    P.rect(pl.x, pl.y, pl.w, pl.h, '#c89a5a'); P.hline(pl.x, pl.y, pl.w, '#e0b878'); P.rect(pl.x, pl.y + pl.h - 3, pl.w, 3, '#8a6038');
    for (let y = pl.y + 4; y < pl.y + pl.h - 3; y += 5) P.hline(pl.x + 2, y, pl.w - 4, '#b8884a');
    // le papier du beurre, avec « DEMI-SEL » et un petit Gwenn-ha-du
    P.rect(b.x - 6, b.y + b.h - 2, b.w + 12, 11, '#f4f0e4'); P.hline(b.x - 6, b.y + b.h + 8, b.w + 12, '#c8c0a8');
    const fx = b.x - 3, fy = b.y + b.h - 1;
    for (let j = 0; j < 9; j++) P.hline(fx, fy + j, 15, j % 2 ? '#ffffff' : '#1d1626');
    P.rect(fx, fy, 6, 5, '#ffffff'); for (const [ex, ey] of [[1, 1], [4, 1], [2, 3]]) { P.px(fx + ex, fy + ey, '#1d1626'); P.px(fx + ex, fy + ey + 1, '#1d1626'); }
    P.rect(fx - 1, fy - 1, 17, 1, '#c8c0a8'); P.vline(fx + 15, fy - 1, 10, '#c8c0a8');
    Arendelle.texte(P, 'DEMI-SEL', fx + 19, b.y + b.h + 1, '#2a4a8a');
    if (E.echec === 'miettes' || E.flaque > 0.6) return;
    // la motte (entière, puis coupée en morceaux ; ceux déjà mis dans la casserole disparaissent)
    const xs = [b.x, ...[...E.coupes].sort((a, c) => a - c), b.x + b.w];
    const pris = E.sous === 'ajout' ? 5 - E.morceaux : 0;
    for (let k = pris; k < xs.length - 1; k++) {
      if (E.tenu && k === pris) continue;
      const x0 = Math.round(xs[k]) + (k > 0 ? 1 : 0), x1 = Math.round(xs[k + 1]);
      motte(P, x0, b.y, x1 - x0, b.h);
    }
    if (E.sous === 'coupe' && E.phase === 'jeu') {
      // les pointillés de la prochaine coupe, puis le couteau
      const lx = Math.round(b.x + b.w * REGLAGES.beurre.lignes[E.coupes.length]);
      if (Math.floor(t * 4) % 2 === 0) for (let y = b.y - 6; y < b.y + b.h + 3; y += 3) P.px(lx, y, '#d8323a');
      const kx = Math.round(E.couteau === null ? b.x + b.w / 2 : E.couteau);
      P.rect(kx - 1, b.y - 22, 3, 16, '#c8ccd8'); P.vline(kx - 1, b.y - 22, 16, '#ffffff'); P.rect(kx - 2, b.y - 30, 5, 8, '#2a2632');
    }
  }
  function pichet(g, P, L) {
    // le pichet en faïence blanche et bleue, penché quand on verse ; un filet de crème
    const x = L.px + Math.round(L.R * 0.85), y = L.py - Math.round(L.R * 1.45), a = -0.25 - E.inclC * 0.9;
    if (E.inclC > 0.2 && E.creme < 1) { g.fillStyle = '#fff8ec'; g.fillRect(x - 10, y + 6, 3, L.py - y - 6); g.fillStyle = '#f2e2c4'; g.fillRect(x - 8, y + 6, 1, L.py - y - 6); }
    g.save(); g.translate(x, y + 10); g.rotate(a); g.translate(-x, -(y + 10));
    P.rect(x - 6, y, 16, 20, '#f4f2ec'); P.rect(x - 6, y + 8, 16, 4, '#3a6aa8'); P.rect(x - 8, y - 2, 6, 4, '#f4f2ec'); P.rect(x + 10, y + 4, 3, 10, '#e8e4dc');
    P.rect(x - 4, y + 2, 12, Math.max(1, Math.round(5 * (1 - E.creme))), '#fff8ec');
    g.restore();
  }

  const vue = { update, draw, pointeur, action() {} };
  return {
    lancer, en: () => !!E, etat: () => E, REGLAGES, nuance, mise: (V) => mise(V),
    dev: { etape: (n) => E && etape(n), rater: (k) => E && rater(k), couper: (x) => E && couper(x), deposer: () => E && deposer(), retirer: () => E && retirer() },
  };
})();
