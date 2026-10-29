// =====================================================================
//  caramel.js — le mini-jeu du caramel (épreuve 5), façon « Cooking Mama »
//
//  Trois étapes, devant le fourneau, avec Rémy à gauche qui réagit à tout :
//   1. LE SUCRE : la jauge se remplit toute seule ; on arrête de verser (toucher l'écran,
//      Espace ou clic) quand elle est dans la zone verte. Trop peu : une fourmi vient
//      chercher sa part. Trop : le sucre déborde et ensevelit Rémy.
//   2. MÉLANGER : on fait des cercles dans la casserole (au doigt ou à la souris ; au clavier,
//      les flèches gauche/droite) ; le sucre fond et blondit. Trop lent : il prend en bloc.
//   3. LA CUISSON : le caramel passe de clair à doré, puis ambré, puis brûlé ; on retire la
//      casserole du feu quand il est ambré. Trop tôt : il est tout pâle. Trop tard : fumée
//      noire, alarme, Rémy panique.
//  Après un échec, on recommence l'étape ratée, autant de fois qu'il le faut.
//  Les réglages de difficulté sont en haut (REGLAGES) ; les textes dans config.js → caramel.jeu.
// =====================================================================
'use strict';

const Caramel = (() => {
  const $ = (id) => document.getElementById(id);
  const REGLAGES = {
    sucre: { vitesse: 0.26, accel: 0.16, zone: [0.6, 0.75], deborde: 1.08 }, // jauge : de 0 à 1 en ~3 s ; zone verte
    melange: { tours: 5, temps: 14, toursClavier: 0.62 },                     // 5 tours en 14 s ; au clavier, 0,62 tour par seconde
    cuisson: { vitesse: 0.105, accel: 0.11, dore: 0.45, ambre: 0.66, brule: 0.81 }, // ambré : ~0,8 s pour réagir
  };
  // la couleur du caramel selon la cuisson (0 : sucre fondu, 1 : charbon)
  const NUANCES = [[0, '#fbf0c8'], [0.45, '#f0c264'], [0.6, '#dc962e'], [0.7, '#bd661c'], [0.8, '#8a3a12'], [0.9, '#4a1e0e'], [1, '#1d0e0a']];
  const nuance = (c) => {
    for (let k = 1; k < NUANCES.length; k++) if (c <= NUANCES[k][0]) { const [a, ca] = NUANCES[k - 1], [b, cb] = NUANCES[k]; return PX.mix(ca, cb, (c - a) / (b - a)); }
    return NUANCES[NUANCES.length - 1][1];
  };
  let E = null;
  const T = () => CONFIG.caramel.jeu;
  const doigt = () => matchMedia('(pointer: coarse)').matches;

  // ------------------------------------------------------------ démarrage, étapes, messages
  function lancer(J, o) {
    E = { J, fin: o.fin, etape: 0, phase: 'jeu', t: 0, tPhase: 0, essais: 0, grains: [], fumees: [], etincelles: [], remy: 'neutre', bulleT: 0 };
    J.vue = vue;
    document.body.classList.add('cuisine');
    $('cuisine').hidden = false;
    Musique.morceau('resto');
    etape(0);
  }
  function etape(n) {
    E.etape = n; E.phase = 'intro'; E.tPhase = 0; E.echec = null;
    E.niveau = 0; E.verse = n === 0; E.tas = 0; E.fourmi = null;   // le sucre
    E.tours = 0; E.angle = 0; E.prec = null; E.temps = 0;          // le mélange
    E.cuit = 0; E.feu = n === 2;                                    // la cuisson
    E.fumees = []; E.grains = [];
    $('cui-titre').textContent = `Le caramel · ${T().titres[n]}`;
    const c = T().consignes[n];
    aide(`${c[0]} (${doigt() ? c[1] : c[2]})`);
    remy('parle', T().remy.debut[n]);
    message(T().titres[n]);
  }
  function aide(t) { const a = $('cui-aide'); a.textContent = t; a.hidden = !t; }
  function message(t, k = '') {
    const m = $('cui-message'); m.hidden = !t; if (!t) return;
    m.textContent = t; m.className = k; m.classList.remove('arrive'); void m.offsetWidth; m.classList.add('arrive');
  }
  // Rémy prend une pose et dit sa réplique dans sa bulle
  function remy(pose, texte) {
    E.remy = pose;
    const b = $('cui-bulle');
    if (texte) { b.textContent = texte; b.hidden = false; b.classList.remove('arrive'); void b.offsetWidth; b.classList.add('arrive'); E.bulleT = 4.5; Musique.couic(); }
  }
  const choix = (liste) => liste[Math.floor(Math.random() * liste.length)];

  function reussir(texte) {
    E.phase = 'reussi'; E.tPhase = 0;
    message(texte, 'bon'); aide(null);
    Musique.trouve();
    if (E.etape < 2) remy('content', T().remy.reussi[E.etape]); else remy('joie');
    const L = mise(E.J.V);
    for (let k = 0; k < 18; k++) E.etincelles.push({ x: L.px + (Math.random() - 0.5) * L.R * 2, y: L.py - Math.random() * L.R, t: 0, a: Math.random() * 6.28 });
  }
  function rater(type) {
    E.phase = 'rate'; E.tPhase = 0; E.echec = type; E.essais++;
    message(T().echecs[type], 'rate'); aide(null);
    Musique.oh();
    const R = T().remy;
    if (type === 'peu') remy('inquiet', choix(R.peu));
    else if (type === 'trop') { remy('panique', R.trop[0]); E.verse = true; }
    else if (type === 'bloc') remy('inquiet', choix(R.bloc));
    else if (type === 'pale') remy('goute', choix(R.pale));
    else if (type === 'brule') { remy('panique', R.brule[E.essais > 2 ? 1 : 0]); Musique.alarme(); }
  }

  // ------------------------------------------------------------ actions du joueur
  function action() {
    if (!E) return;
    if (E.phase === 'rate') { if (E.tPhase > 2.2) { remy('parle', choix(T().remy.encore)); etape(E.etape); } return; }
    if (E.phase !== 'jeu') return;
    if (E.etape === 0) {
      E.verse = false;
      const [a, b] = REGLAGES.sucre.zone;
      if (E.niveau < a) rater('peu'); else if (E.niveau > b) rater('trop'); else reussir(T().remy.reussi[0]);
    } else if (E.etape === 2) {
      E.feu = false;
      const C = REGLAGES.cuisson;
      if (E.cuit < C.ambre) rater('pale'); else if (E.cuit > C.brule) rater('brule'); else reussir(T().parfait);
    }
  }
  // le mélange : on compte les tours faits autour du milieu de la casserole
  function pointeur(type, pos) {
    if (!E) return;
    if (type === 'down' && (E.phase === 'rate' || E.etape !== 1)) { action(); return; }
    if (E.etape !== 1 || E.phase !== 'jeu') return;
    if (type === 'up') { E.prec = null; return; }
    const L = mise(E.J.V), dx = pos.x - L.px, dy = (pos.y - L.py) / 0.55, d = Math.hypot(dx, dy) / L.R;
    E.cuillere = { x: pos.x, y: pos.y };
    if (d < 0.12 || d > 1.5) { E.prec = null; return; }
    const a = Math.atan2(dy, dx);
    if (E.prec !== null) {
      let da = a - E.prec; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
      if (Math.abs(da) < 1.2) { E.tours += Math.abs(da) / (Math.PI * 2); E.angle += da; }
    }
    E.prec = a;
  }

  // ------------------------------------------------------------ la boucle
  function update(dt, J) {
    if (!E) return;
    E.t += dt; E.tPhase += dt;
    if (E.bulleT > 0 && (E.bulleT -= dt) <= 0) $('cui-bulle').hidden = true;
    const L = mise(J.V);
    // les grains de sucre qui tombent du paquet
    if (E.verse && (E.phase === 'jeu' || E.echec === 'trop') && Math.random() < dt * 60) {
      E.grains.push({ x: L.sacX + 4 + Math.random() * 3, y: L.sacY + 6, vx: (Math.random() - 0.5) * 8, vy: 20 + Math.random() * 20 });
      if (Math.random() < dt * 8) Musique.sucre();
    }
    for (const g of E.grains) { g.vy += 300 * dt; g.x += g.vx * dt; g.y += g.vy * dt; }
    E.grains = E.grains.filter((g) => g.y < L.py - L.R * 0.1 * Math.min(1, E.niveau) + (E.echec === 'trop' ? 40 : 0));
    for (const s of E.etincelles) s.t += dt;
    E.etincelles = E.etincelles.filter((s) => s.t < 1.2);
    for (const f of E.fumees) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.r += dt * 9; }
    E.fumees = E.fumees.filter((f) => f.t < f.max);

    if (E.phase === 'intro' && E.tPhase > 1.6) { E.phase = 'jeu'; E.tPhase = 0; message(null); if (E.remy === 'parle') remy('neutre'); }
    if (E.phase === 'jeu') {
      if (E.etape === 0) {
        const S = REGLAGES.sucre;
        E.niveau += (S.vitesse + S.accel * E.niveau) * dt;
        if (E.niveau >= S.deborde) { E.niveau = S.deborde; rater('trop'); }
      } else if (E.etape === 1) {
        const M = REGLAGES.melange;
        E.temps += dt;
        const kx = J.input.x;
        if (Math.abs(kx) > 0.5) { const da = Math.sign(kx) * M.toursClavier * Math.PI * 2 * dt; E.angle += da; E.tours += Math.abs(da) / (Math.PI * 2); E.cuillere = null; }
        if (E.tours >= M.tours) reussir(T().remy.reussi[1]);
        else if (E.temps >= M.temps) rater('bloc');
      } else {
        const C = REGLAGES.cuisson;
        E.cuit += (C.vitesse + C.accel * E.cuit) * dt;
        if (Math.random() < dt * 4) Musique.bulle();
        if (E.cuit >= 1) { E.cuit = 1; E.feu = false; rater('brule'); }
      }
    } else if (E.phase === 'rate') {
      // les échecs, à regarder
      if (E.echec === 'trop') { E.niveau = Math.min(2.4, E.niveau + dt * 0.8); E.tas = Math.min(1, E.tas + dt * 0.45); if (E.tas > 0.55 && E.remy !== 'enseveli') remy('enseveli'); if (E.tPhase > 2.4) E.verse = false; }
      if (E.echec === 'peu' && !E.fourmi && E.tPhase > 0.6) E.fourmi = { x: L.px - L.R - 30, t: 0 };
      if (E.fourmi) E.fourmi.x += dt * 22;
      if (E.echec === 'bloc' && Math.floor(E.tPhase * 2.5) !== Math.floor((E.tPhase - dt) * 2.5) && E.tPhase < 2.4) Musique.bip(220, 0.04);
      if (E.echec === 'brule') {
        E.cuit = Math.min(1, E.cuit + dt * 0.4);
        if (Math.random() < dt * 14) E.fumees.push({ x: L.px + (Math.random() - 0.5) * L.R, y: L.py - 6, vx: (Math.random() - 0.5) * 14, vy: -18 - Math.random() * 18, r: 4 + Math.random() * 5, t: 0, max: 3 + Math.random() * 1.5 });
        if (E.tPhase > 1.6 && E.remy === 'panique') remy('tousse');
        if (Math.floor(E.tPhase * 2) !== Math.floor((E.tPhase - dt) * 2) && E.tPhase < 3) Musique.alarme();
      }
      if (E.echec === 'pale' && E.tPhase > 1.4 && E.remy === 'goute') remy('inquiet');
      if (E.tPhase > 2.2 && $('cui-aide').hidden) aide(T().reessayer[doigt() ? 0 : 1]);
    } else if (E.phase === 'reussi') {
      if (E.tPhase > 1.6) {
        if (E.etape < 2) etape(E.etape + 1);
        else if (E.tPhase > 2.8) fermer(true);
      }
    }
  }

  function fermer(gagne) {
    const fin = E.fin, J = E.J;
    E = null; J.vue = null;
    document.body.classList.remove('cuisine');
    $('cuisine').hidden = true; $('cui-bulle').hidden = true;
    if (fin) fin(gagne);
  }

  // ------------------------------------------------------------ mise en page (recalculée à chaque image)
  function mise(V) {
    const w = V.w, h = V.h, R = Math.round(Math.min(w * 0.16, h * 0.27));
    const px = Math.round(w * 0.52), py = Math.round(h * 0.66);
    return { w, h, R, px, py, sacX: px - Math.round(R * 0.55), sacY: Math.round(py - R * 1.55), rs: h >= 200 ? 2 : 1, jx: Math.round(w * 0.84) };
  }

  // ------------------------------------------------------------ dessin
  const fonds = {};
  function decor(w, h) {
    const cle = w + 'x' + h;
    if (fonds[cle]) return fonds[cle];
    const c = PX.canvas(w, h), P = PX.painter(c), comptoir = Math.round(h * 0.7);
    // la faïence blanche, la barre aux casseroles, le plan de travail en inox
    P.rect(0, 0, w, comptoir, '#eef0f4');
    for (let y = 0; y < comptoir; y += 6) P.hline(0, y, w, '#d0d4de');
    for (let y = 0, k = 0; y < comptoir; y += 6, k++) for (let x = (k % 2) * 6; x < w; x += 12) P.vline(x, y, 6, '#d0d4de');
    P.rect(0, 0, w, 5, '#5a6070');
    P.rect(Math.round(w * 0.3), 14, Math.round(w * 0.45), 2, '#5a6070');
    for (let k = 0; k < 6; k++) { const x = Math.round(w * 0.32 + k * w * 0.08), s = 5 + (k % 3) * 2; P.vline(x, 16, 4, '#3a3a46'); P.ellipse(x, 20 + s, s + 1, s + 1, '#a8582a'); P.ellipse(x, 20 + s, s, s, '#d8783a'); P.px(x - 2, 18 + s, '#f8b07a'); }
    P.rect(0, comptoir, w, h - comptoir, '#a8aebc'); P.rect(0, comptoir, w, 5, '#c8ccd8'); P.hline(0, comptoir, w, '#eef0f6'); P.hline(0, comptoir + 5, w, '#8a90a0');
    for (let x = 0; x < w; x += 22) P.vline(x, comptoir + 6, h - comptoir - 6, '#9aa0b0');
    // le livre de Gusteau et des épices sur une étagère, à droite
    const ex = Math.round(w * 0.74);
    P.rect(ex, Math.round(h * 0.2), Math.round(w * 0.22), 3, '#7a4a2a'); P.hline(ex, Math.round(h * 0.2), Math.round(w * 0.22), '#a8743e');
    for (let k = 0; k < 6; k++) P.rect(ex + 4 + k * 7, Math.round(h * 0.2) - 9, 5, 9, ['#d8323a', '#f2c230', '#3a8a4a', '#e8603a', '#8a5a3a', '#3a6aa8'][k]);
    P.rect(ex + 50, Math.round(h * 0.2) - 12, 14, 12, '#a8343a'); P.hline(ex + 52, Math.round(h * 0.2) - 7, 10, '#e8b54a');
    return (fonds[cle] = c);
  }
  // la casserole (vue en 3/4), son contenu et la cuillère
  function casserole(g, P, L, t) {
    const { px, py, R } = L, ry = Math.round(R * 0.5), haut = Math.round(R * 0.42);
    // le feu
    P.ellipse(px, py + haut + 4, R + 6, ry + 4, '#2a2a34'); P.ellipse(px, py + haut + 4, R - 4, ry - 4, '#4a4a58');
    const allume = E.feu || (E.phase === 'rate' && E.echec === 'brule' && E.tPhase < 1);
    // le corps de la casserole (inox) et le manche
    g.fillStyle = '#5a5e6c'; g.fillRect(px + R - 2, py - 3, Math.round(R * 0.9), 7); g.fillStyle = '#2a2a34'; g.fillRect(px + R - 2 + Math.round(R * 0.9) - 10, py - 2, 8, 5);
    P.ellipse(px, py + haut, R, ry, '#7a7e8c');
    P.rect(px - R, py, R * 2 + 1, haut, '#9aa0b0'); P.rect(px - R, py, 4, haut, '#c8ccd8'); P.rect(px + R - 6, py, 6, haut, '#7a7e8c');
    P.ellipse(px, py, R, ry, '#d8dce6'); P.ellipse(px, py, R - 3, ry - 2, '#3a3a46');
    // les flammes bleues du gaz, qui lèchent le fond de la casserole
    if (allume) for (let k = 0; k < 13; k++) {
      const a = (k + 0.5) / 13 * Math.PI, hh = 3 + Math.round(Math.abs(Math.sin(t * 13 + k * 1.9)) * 5);
      const fx = Math.round(px + Math.cos(a) * (R - 2)), fy = Math.round(py + haut + 3 + Math.sin(a) * (ry - 1));
      g.fillStyle = '#2a6aff'; g.fillRect(fx - 1, fy - hh, 3, hh); g.fillStyle = '#9ad8ff'; g.fillRect(fx, fy - hh + 1, 1, hh - 1);
    }
    // le contenu
    const contenu = (col, rx, ryy, dy = 0) => P.ellipse(px, py + 2 + dy, rx, ryy, col);
    if (E.etape === 0) {
      const n = Math.min(1.3, E.niveau), rx = Math.round((R - 6) * Math.min(1, 0.3 + n * 0.8)), ryy = Math.max(1, Math.round((ry - 4) * Math.min(1, 0.3 + n * 0.8)));
      if (n > 0.02) {
        contenu('#e8e4d8', rx, ryy); P.ellipse(px, py + 2 - Math.round(n * 8), Math.round(rx * 0.7), Math.max(1, Math.round(ryy * 0.7)), '#f8f6f0');
        for (let k = 0; k < rx; k += 3) g.fillStyle = '#ffffff', g.fillRect(px - rx + k * 2, py + 1 + (k % 4) - Math.round(n * 4), 1, 1);
      }
      // le sucre qui déborde de partout
      if (E.echec === 'trop') {
        const deb = Math.min(1, (E.niveau - 1) / 1.2);
        const tas = (x, y, rx, ryy) => { P.ellipse(x, y + 1, rx + 1, ryy + 1, '#b8b4a8'); P.ellipse(x, y, rx, ryy, '#e8e4d8'); P.ellipse(x - Math.round(rx * 0.15), y - Math.round(ryy * 0.2), Math.round(rx * 0.8), Math.round(ryy * 0.7), '#f8f6f0'); };
        tas(px, py + haut + 10, Math.round(R + deb * 40), Math.round(6 + deb * 8));
        for (const s of [-1, 1]) tas(px + s * (R + 4), py + haut, Math.round(6 + deb * 16), Math.round(4 + deb * 8));
        tas(px, py - 4 - Math.round(deb * 18), R + Math.round(deb * 8), ry + Math.round(deb * 10));
        for (let k = 0; k < 30; k++) { const a = k * 2.39, d = ((k * 53) % 100) / 100; if (Math.sin(t * 5 + k) > 0.6) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(px + Math.cos(a) * d * R), Math.round(py - 6 - deb * 18 + Math.sin(a) * d * ry), 1, 1); } }
      }
    } else {
      // le sirop qui fond, puis le caramel qui cuit
      const c = E.etape === 1 ? Math.min(1, E.tours / REGLAGES.melange.tours) * 0.4 : E.cuit;
      let col = E.etape === 1 ? PX.mix('#f2f0e8', '#f6e2a8', Math.min(1, E.tours / REGLAGES.melange.tours)) : nuance(c);
      if (E.echec === 'bloc') col = '#f6f6f2';
      contenu(col, R - 6, ry - 4);
      if (E.etape === 1 && E.echec !== 'bloc') {
        const fondu = Math.min(1, E.tours / REGLAGES.melange.tours);
        for (let k = 0; k < 40 * (1 - fondu); k++) { const a = k * 2.4, d = ((k * 37) % 100) / 100; g.fillStyle = '#ffffff'; g.fillRect(Math.round(px + Math.cos(a) * d * (R - 10)), Math.round(py + 2 + Math.sin(a) * d * (ry - 6)), 1, 1); }
        // les volutes qui tournent avec la cuillère
        for (let k = 0; k < 3; k++) for (let i = 0; i < 14; i++) { const a = E.angle + k * 2.1 + i * 0.12, d = 0.3 + i * 0.035; g.fillStyle = PX.shade(col, -0.12); g.fillRect(Math.round(px + Math.cos(a) * d * (R - 8)), Math.round(py + 2 + Math.sin(a) * d * (ry - 5)), 2, 1); }
      }
      if (E.echec === 'bloc') { // un gros bloc de sucre cristallisé
        P.ellipse(px, py - 4, R - 12, ry + 2, '#e8e8e4'); P.ellipse(px - 6, py - 10, R - 22, ry - 4, '#ffffff');
        for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#d0d0cc' : '#ffffff'; g.fillRect(Math.round(px - R * 0.5 + k * R * 0.12), Math.round(py - 10 + (k % 3) * 4), 3, 3); }
      }
      if (E.etape === 2 && E.phase === 'jeu') for (let k = 0; k < 7; k++) { // les bulles
        const ph = (t * 1.6 + k * 0.37) % 1, a = k * 2.2, d = 0.2 + (k % 4) * 0.18;
        const bx = Math.round(px + Math.cos(a) * d * (R - 10)), by = Math.round(py + 2 + Math.sin(a) * d * (ry - 6));
        P.ellipse(bx, by, 1 + Math.round(ph * 2), 1, PX.shade(col, 0.25));
      }
      if (E.etape === 2 && (E.phase === 'reussi')) for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(255,240,200,0.8)'; g.fillRect(Math.round(px - R * 0.5 + k * R * 0.25), py - 1, 4, 1); } // le caramel brille
    }
    // la cuillère en bois (étape 2)
    if (E.etape === 1) {
      const a = E.angle, cx = E.cuillere ? E.cuillere.x : Math.round(px + Math.cos(a) * (R * 0.55)), cy = E.cuillere ? E.cuillere.y : Math.round(py + 2 + Math.sin(a) * (ry * 0.55));
      Objets.line(P, cx, cy, cx + 18, cy - 42, '#a8743e'); Objets.line(P, cx + 1, cy, cx + 19, cy - 42, '#c89a5a');
      P.ellipse(cx, cy, 4, 2, '#c89a5a');
    }
  }
  function dessinRemy(g, L, t) {
    const pose = E.remy, im = Resto.grand(pose, Math.floor(t * 4) % 2), s = L.rs;
    const x = Math.round(L.w * 0.15 - (im.width * s) / 2), bond = pose === 'joie' ? Math.round(Math.abs(Math.sin(t * 7)) * 8) : pose === 'panique' ? Math.round(Math.sin(t * 30) * 2) : 0;
    const y = Math.round(L.h * 0.96 - im.height * s) - bond;
    g.drawImage(im, x, y, im.width * s, im.height * s);
    // enseveli sous le sucre : un gros tas devant lui
    if (E.echec === 'trop' && E.tas > 0) {
      const P = PX.painter(g.canvas), hx = Math.round(L.w * 0.15), hy = Math.round(L.h * 0.96);
      const rx = Math.round(20 * s + E.tas * 16 * s), ryy = Math.round(E.tas * 40 * s);
      P.ellipse(hx, hy + 1, rx + 1, ryy + 1, '#b8b4a8'); P.ellipse(hx, hy, rx, ryy, '#e8e4d8'); P.ellipse(hx - 3 * s, hy - 2 * s, Math.round(rx * 0.8), Math.round(ryy * 0.75), '#f8f6f0');
      for (let k = 0; k < 16; k++) if (Math.sin(t * 6 + k * 1.7) > 0.5) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(hx + Math.cos(k * 2.4) * rx * 0.7), Math.round(hy - ryy * 0.5 + Math.sin(k * 2.4) * ryy * 0.4), 1, 1); }
    }
    // il tient un torchon quand il tousse
    if (pose === 'tousse') { g.fillStyle = '#f4f2ec'; g.fillRect(x + 40 * s, y + 6 * s + Math.round(Math.sin(t * 14) * 3), 8 * s, 6 * s); g.fillStyle = '#d8323a'; g.fillRect(x + 40 * s, y + 8 * s + Math.round(Math.sin(t * 14) * 3), 8 * s, s); }
  }
  function draw(g, V, t) {
    if (!E) return;
    const L = mise(V), P = PX.painter(g.canvas), w = V.w, h = V.h;
    g.drawImage(decor(w, h), 0, 0);
    // l'alarme incendie, au mur
    const al = E.echec === 'brule' && E.phase === 'rate';
    g.fillStyle = '#f4f2ec'; g.fillRect(Math.round(w * 0.62), 8, 12, 6); g.fillStyle = al && Math.floor(t * 6) % 2 ? '#ff3a3a' : '#7a2a2a'; g.fillRect(Math.round(w * 0.62) + 4, 10, 4, 3);
    // le paquet de sucre qui verse (étape 1)
    if (E.etape === 0) {
      const sx = L.sacX, sy = L.sacY, pench = E.verse ? 0 : -6;
      g.save(); g.translate(sx + 10, sy + 10); g.rotate((E.verse ? 0.9 : 0.4)); g.translate(-(sx + 10), -(sy + 10));
      P.rect(sx, sy + pench, 22, 28, '#f4efe2'); P.rect(sx, sy + pench, 22, 3, '#ffffff'); P.rect(sx + 2, sy + 10 + pench, 18, 9, '#3a6aa8');
      Arendelle.texte(P, 'SUCRE', sx + 2, sy + 12 + pench, '#ffffff'); P.rect(sx + 20, sy + pench, 2, 28, '#d8d0c0');
      g.restore();
      g.fillStyle = '#ffffff'; for (const gr of E.grains) g.fillRect(Math.round(gr.x), Math.round(gr.y), 1, 2);
    }
    casserole(g, P, L, t);
    // la fourmi qui vient chercher sa part (trop peu de sucre)
    if (E.fourmi) {
      // une fourmi (deux fois plus grosse que nature) repart avec un grain de sucre sur le dos
      const fx = Math.round(E.fourmi.x), fy = L.py + Math.round(L.R * 0.42) + 12;
      g.fillStyle = '#1d1626'; g.fillRect(fx, fy, 4, 4); g.fillRect(fx + 5, fy - 1, 4, 5); g.fillRect(fx + 10, fy - 1, 4, 4); g.fillRect(fx + 13, fy - 4, 1, 3); g.fillRect(fx + 14, fy - 5, 2, 1);
      for (let k = 0; k < 3; k++) { const p = Math.floor(t * 12 + k) % 2; g.fillRect(fx + 4 + k * 3, fy + 4, 1, 2 + p); g.fillRect(fx + 3 + k * 3 - p, fy + 5 + p, 2, 1); }
      g.fillStyle = '#ffffff'; g.fillRect(fx + 4, fy - 5, 5, 4); g.fillStyle = '#d8d4cc'; g.fillRect(fx + 4, fy - 2, 5, 1);
    }
    // les étapes : la jauge (1), le temps (2), la couleur (3)
    if (E.etape === 0) {
      const gx = L.jx, gh = Math.round(h * 0.56), gy = Math.round(h * 0.14), gw = 12, S = REGLAGES.sucre, plein = 1.1;
      g.fillStyle = '#1d1626'; g.fillRect(gx - 2, gy - 2, gw + 4, gh + 4); g.fillStyle = '#3a3646'; g.fillRect(gx, gy, gw, gh);
      const yz = (v) => Math.round(gy + gh - (v / plein) * gh);
      g.fillStyle = '#3aa85a'; g.fillRect(gx, yz(S.zone[1]), gw, yz(S.zone[0]) - yz(S.zone[1]));
      g.fillStyle = '#c84a3a'; g.fillRect(gx, gy, gw, yz(S.zone[1]) - gy);
      const n = Math.min(plein, E.niveau);
      g.fillStyle = '#f8f6f0'; g.fillRect(gx + 3, yz(n), gw - 6, gy + gh - yz(n));
      g.fillStyle = '#ffffff'; g.fillRect(gx - 5, yz(n) - 1, gw + 10, 2);
      Arendelle.texte(P, '200G', gx - 18, yz((S.zone[0] + S.zone[1]) / 2) - 2, '#1d1626');
    } else if (E.etape === 1) {
      // à droite : la jauge du mélange (elle se remplit de sirop doré à chaque tour) et, à côté, le temps qui reste
      const M = REGLAGES.melange, gx = L.jx, gh = Math.round(h * 0.56), gy = Math.round(h * 0.14), gw = 12, f = Math.min(1, E.tours / M.tours);
      g.fillStyle = '#1d1626'; g.fillRect(gx - 2, gy - 2, gw + 4, gh + 4); g.fillStyle = '#3a3646'; g.fillRect(gx, gy, gw, gh);
      g.fillStyle = '#f2c264'; g.fillRect(gx, Math.round(gy + gh * (1 - f)), gw, Math.round(gh * f)); g.fillStyle = '#fbe6a8'; g.fillRect(gx + 2, Math.round(gy + gh * (1 - f)), 2, Math.round(gh * f));
      for (let k = 1; k < M.tours; k++) { g.fillStyle = '#1d1626'; g.fillRect(gx, Math.round(gy + gh * (1 - k / M.tours)), gw, 1); }
      const reste = Math.max(0, 1 - E.temps / M.temps), th = Math.round(gh * reste);
      g.fillStyle = '#1d1626'; g.fillRect(gx + gw + 4, gy - 2, 7, gh + 4);
      g.fillStyle = reste < 0.3 && Math.floor(t * 6) % 2 ? '#ff6a5a' : '#8ad0ff'; g.fillRect(gx + gw + 6, gy + gh - th, 3, th); // le temps qui reste
    } else {
      const C = REGLAGES.cuisson, gx = L.jx, gh = Math.round(h * 0.56), gy = Math.round(h * 0.14), gw = 12;
      g.fillStyle = '#1d1626'; g.fillRect(gx - 2, gy - 2, gw + 4, gh + 4);
      for (let j = 0; j < gh; j++) { const c = 1 - j / gh; g.fillStyle = nuance(c); g.fillRect(gx, gy + j, gw, 1); }
      for (const v of [C.ambre, C.brule]) { g.fillStyle = '#ffffff'; g.fillRect(gx - 4, Math.round(gy + gh - v * gh), gw + 8, 1); }
      // le crochet vert de la bonne couleur, à gauche de la jauge
      const y1 = Math.round(gy + gh - C.brule * gh), y0 = Math.round(gy + gh - C.ambre * gh);
      g.fillStyle = '#3aa85a'; g.fillRect(gx - 8, y1, 3, y0 - y1 + 1); g.fillRect(gx - 8, y1, 6, 2); g.fillRect(gx - 8, y0 - 1, 6, 2);
      // le curseur : un trait sombre sur la jauge et une flèche blanche à droite
      const cy = Math.round(gy + gh - E.cuit * gh);
      g.fillStyle = '#1d1626'; g.fillRect(gx - 1, cy - 1, gw + 2, 3); g.fillStyle = '#ffffff'; g.fillRect(gx, cy, gw, 1);
      for (let k = 0; k < 4; k++) { g.fillStyle = '#1d1626'; g.fillRect(gx + gw + 2 + k, cy - 4 + k, 1, 9 - k * 2); g.fillStyle = '#ffffff'; if (k > 0) g.fillRect(gx + gw + 2 + k, cy - 3 + k, 1, 7 - k * 2); }
    }
    // la fumée noire du caramel brûlé
    for (const f of E.fumees) { const a = Math.max(0, 0.7 - f.t / f.max * 0.7); g.fillStyle = `rgba(40,34,40,${a.toFixed(2)})`; P.ellipse(Math.round(f.x), Math.round(f.y), Math.round(f.r), Math.round(f.r * 0.8), `rgba(40,34,40,${a.toFixed(2)})`); }
    if (E.echec === 'brule' && E.phase === 'rate') { g.fillStyle = `rgba(30,26,34,${Math.min(0.5, E.tPhase * 0.18).toFixed(2)})`; g.fillRect(0, 0, w, h); }
    dessinRemy(g, L, t);
    // les étincelles de la réussite
    for (const s of E.etincelles) { const d = s.t * 50; g.fillStyle = s.t % 0.2 < 0.1 ? '#fff4c0' : '#ffd27a'; g.fillRect(Math.round(s.x + Math.cos(s.a) * d), Math.round(s.y + Math.sin(s.a) * d - s.t * 20), 2, 2); }
  }

  const vue = { update, draw, pointeur, action };
  return { lancer, en: () => !!E, etat: () => E, REGLAGES, nuance, dev: { etape: (n) => E && etape(n), action, rater: (k) => E && rater(k) } };
})();
