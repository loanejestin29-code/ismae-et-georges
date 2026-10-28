// =====================================================================
//  assemblage.js — le mini-jeu d'assemblage de Jack Snow (épreuve 3)
//
//  À gauche, les éléments trouvés dans Arendelle ; à droite, la place du bonhomme de neige.
//  On fait glisser chaque élément à sa place, avec la souris ou le doigt. Les places
//  disponibles sont dessinées en pointillés (on pose d'abord la grosse boule, puis le ventre,
//  puis la tête, puis le reste). Un élément lâché trop loin retourne à sa place.
//  Le dessin de Jack Snow est dans persos-neige.js (Neige.jack).
// =====================================================================
'use strict';

const Assemblage = (() => {
  const $ = (id) => document.getElementById(id);
  const ORDRE = ['base', 'corps', 'tete', 'yeux', 'nez', 'echarpe', 'brasG', 'brasD', 'boutons'];
  const AVANT = { corps: 'base', tete: 'corps', yeux: 'tete', nez: 'tete', echarpe: 'tete', brasG: 'corps', brasD: 'corps', boutons: 'corps' };
  const NOMS = {
    base: 'la grosse boule', corps: 'la boule du ventre', tete: 'la tête', yeux: 'les yeux', nez: 'le nez et le sourire', echarpe: 'l\'écharpe',
    brasG: 'le bras gauche', brasD: 'le bras droit', boutons: 'les boutons',
  };
  let E = null;

  // découpe un élément : la plus petite image qui le contient, et sa position dans le dessin de Jack
  function decouper(nom) {
    const src = Neige.morceau(nom).img, w = src.width, h = src.height;
    const d = src.getContext('2d').getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const c = PX.canvas(x1 - x0 + 1, y1 - y0 + 1);
    c.getContext('2d').drawImage(src, -x0, -y0);
    return { nom, img: c, bx: x0, by: y0, w: c.width, h: c.height, pose: false };
  }

  function lancer(J, o) {
    E = { J, fin: o.fin, pieces: ORDRE.map(decouper), prise: null, t: 0, saut: 0, fini: 0, msg: null, etincelles: [] };
    J.vue = vue;
    document.body.classList.add('assemblage');
    $('assemblage').hidden = false;
    message(matchMedia('(pointer: coarse)').matches ? 'Fais glisser chaque élément à sa place, avec le doigt.' : 'Fais glisser chaque élément à sa place, avec la souris.');
    majTitre();
  }
  function majTitre() { $('asm-titre').textContent = `Jack Snow · ${E.pieces.filter((p) => p.pose).length}/${E.pieces.length}`; }
  function message(t) { const m = $('asm-message'); m.textContent = t; m.classList.remove('arrive'); void m.offsetWidth; m.classList.add('arrive'); }
  const posees = () => Object.fromEntries(E.pieces.filter((p) => p.pose).map((p) => [p.nom, 1]));
  const disponible = (nom) => !AVANT[nom] || E.pieces.find((p) => p.nom === AVANT[nom]).pose;

  // ------------------------------------------------------------ mise en page (recalculée à chaque image : l'écran peut tourner)
  function mise(V) {
    const w = V.w, h = V.h;
    const s = Math.max(2, Math.min(5, Math.floor((h * 0.8) / Neige.JACK.H)));
    const ox = Math.round(w * 0.64 - (Neige.JACK.W * s) / 2), oy = Math.round(h - 8 - Neige.JACK.H * s);
    // le plateau, à gauche : on range les éléments par rangées
    const st = Math.max(2, s - 1), x0 = 10, y0 = 34, largeur = Math.round(w * 0.42) - 14;
    let x = x0, y = y0, hRang = 0;
    for (const p of E.pieces) {
      const pw = p.w * st, ph = p.h * st;
      if (x + pw > x0 + largeur && x > x0) { x = x0; y += hRang + 8; hRang = 0; }
      p.tx = x; p.ty = y; p.st = st;
      x += pw + 10; hRang = Math.max(hRang, ph);
    }
    return { s, ox, oy, st, plateau: { x: 4, y: 26, w: largeur + 12, h: Math.min(h - 32, y + hRang + 10 - 26) } };
  }

  // ------------------------------------------------------------ les gestes
  function pointeur(type, pos) {
    if (!E || E.fini) return;
    const L = mise(E.J.V);
    if (type === 'down') {
      for (const p of [...E.pieces].reverse()) {
        if (p.pose) continue;
        if (pos.x >= p.tx && pos.x < p.tx + p.w * p.st && pos.y >= p.ty && pos.y < p.ty + p.h * p.st) {
          E.prise = { p, fx: (pos.x - p.tx) / (p.w * p.st), fy: (pos.y - p.ty) / (p.h * p.st), x: pos.x, y: pos.y };
          Musique.bip(700, 0.03);
          return;
        }
      }
    } else if (type === 'move' && E.prise) { E.prise.x = pos.x; E.prise.y = pos.y; }
    else if (type === 'up' && E.prise) {
      const { p, fx, fy } = E.prise;
      E.prise = null;
      const x = pos.x - fx * p.w * L.s, y = pos.y - fy * p.h * L.s;
      const cx = L.ox + p.bx * L.s, cy = L.oy + p.by * L.s, d = Math.hypot(x - cx, y - cy);
      const dedans = pos.x > L.ox - 20 && pos.x < L.ox + Neige.JACK.W * L.s + 20 && pos.y > L.oy - 20;
      if (d < Math.max(16, L.s * 7) && disponible(p.nom)) { poser(p, L); return; }
      if (!dedans) return;
      if (!disponible(p.nom)) message(`D'abord, il faut poser ${NOMS[AVANT[p.nom]]}.`);
      else message(`Presque ! ${NOMS[p.nom][0].toUpperCase() + NOMS[p.nom].slice(1)} : regarde les pointillés.`);
      Musique.bip(300, 0.03);
    }
  }
  function poser(p, L) {
    p.pose = true;
    E.saut = 0.4;
    Musique.trouve();
    for (let k = 0; k < 8; k++) E.etincelles.push({ x: L.ox + (p.bx + p.w / 2) * L.s, y: L.oy + (p.by + p.h / 2) * L.s, a: (k / 8) * 6.28, t: 0 });
    majTitre();
    if (E.pieces.every((q) => q.pose)) { E.fini = 0.01; message('Jack Snow est terminé !'); Musique.victoireCourte(); }
    else message(['Parfait !', 'Bravo !', 'Exactement là !', 'Olaf applaudit !'][Math.floor(Math.random() * 4)]);
  }
  function fermer() {
    const { J, fin } = E;
    J.vue = null; E = null;
    document.body.classList.remove('assemblage');
    $('assemblage').hidden = true;
    fin();
  }

  function update(dt) {
    if (!E) return;
    E.t += dt;
    if (E.saut > 0) E.saut -= dt;
    for (const s of E.etincelles) s.t += dt;
    E.etincelles = E.etincelles.filter((s) => s.t < 0.8);
    if (E.fini) { E.fini += dt; if (E.fini > 2.6) fermer(); }
  }

  // ------------------------------------------------------------ dessin
  const fonds = {};
  function decor(w, h) {
    const cle = w + 'x' + h;
    if (fonds[cle]) return fonds[cle];
    const c = PX.canvas(w, h), P = PX.painter(c), r = PX.rng(17);
    Arendelle.fond(P, w, Math.round(h * 0.55), r);
    // la place enneigée, les maisons au loin
    const hz = Math.round(h * 0.55);
    for (let x = -10, k = 0; x < w; x += 46 + r.int(10), k++) {
      const col = Arendelle.MURS[k % Arendelle.MURS.length], hh = 22 + r.int(10);
      P.rect(x, hz - hh, 40, hh, col); P.trap(x + 6, 28, x - 3, 46, hz - hh - 12, 12, '#eef3fb');
      for (const fx of [x + 8, x + 26]) { P.rect(fx, hz - hh + 6, 6, 7, '#ffcf72'); }
    }
    P.vgrad(0, hz, w, h - hz, '#c8d4e8', '#e8eef8');
    for (let k = 0; k < 80; k++) P.px(r.int(w), hz + r.int(h - hz), '#ffffff');
    // le grand sapin de la place, derrière
    const sapin = Objets.grandSapin(12).img; P.draw(sapin, Math.round(w * 0.86) - 20, hz - sapin.height + 10);
    return (fonds[cle] = c);
  }
  function draw(g, V, t) {
    if (!E) return;
    const w = V.w, h = V.h, P = PX.painter(g.canvas), L = mise(V);
    g.drawImage(decor(w, h), 0, 0);
    // le plateau des éléments
    g.fillStyle = 'rgba(18,13,34,0.9)'; g.fillRect(L.plateau.x, L.plateau.y, L.plateau.w, L.plateau.h);
    g.fillStyle = 'rgba(80,100,160,0.25)'; for (let y = L.plateau.y + 3; y < L.plateau.y + L.plateau.h; y += 6) g.fillRect(L.plateau.x + 2, y, L.plateau.w - 4, 1);
    g.fillStyle = '#e8b54a'; g.fillRect(L.plateau.x, L.plateau.y, L.plateau.w, 1); g.fillRect(L.plateau.x, L.plateau.y + L.plateau.h - 1, L.plateau.w, 1);
    for (const p of E.pieces) {
      if (p.pose || (E.prise && E.prise.p === p)) continue;
      g.drawImage(p.img, p.tx, p.ty, p.w * p.st, p.h * p.st);
    }
    // le bonhomme en construction, avec les places libres en pointillés
    const libres = E.pieces.filter((p) => !p.pose && disponible(p.nom)).map((p) => p.nom);
    const img = Neige.jack(posees(), { contour: E.fini ? [] : libres, vie: E.fini ? E.fini : 0 });
    P.ellipse(L.ox + (Neige.JACK.cx) * L.s, L.oy + Neige.JACK.sol * L.s, 14 * L.s, 2 * L.s, 'rgba(60,80,130,0.25)');
    g.drawImage(img, L.ox, L.oy, img.width * L.s, img.height * L.s);
    // la place de l'élément qu'on tient brille doucement
    if (E.prise && disponible(E.prise.p.nom)) {
      const p = E.prise.p, a = 0.25 + Math.abs(Math.sin(t * 5)) * 0.3;
      g.fillStyle = `rgba(255,236,150,${a.toFixed(2)})`; g.fillRect(L.ox + p.bx * L.s - 2, L.oy + p.by * L.s - 2, p.w * L.s + 4, p.h * L.s + 4);
    }
    // Olaf qui encourage, à droite
    const olaf = (E.olaf || (E.olaf = Neige.olaf())).down;
    const oimg = Math.floor(t * 2) % 7 === 0 ? olaf.blink : olaf.idle, os = Math.max(2, L.s - 1);
    const sx = Math.min(w - oimg.width * os - 6, L.ox + Neige.JACK.W * L.s + 10), sy = h - 6 - oimg.height * os - (E.saut > 0 ? Math.round(Math.sin(E.saut / 0.4 * Math.PI) * 6) : 0);
    g.drawImage(oimg, sx, sy, oimg.width * os, oimg.height * os);
    // l'élément tenu, à la taille réelle, sous le doigt
    if (E.prise) { const p = E.prise.p; g.drawImage(p.img, Math.round(E.prise.x - E.prise.fx * p.w * L.s), Math.round(E.prise.y - E.prise.fy * p.h * L.s), p.w * L.s, p.h * L.s); }
    // étincelles
    for (const s of E.etincelles) { const d = s.t * 40; g.fillStyle = '#fff4c0'; g.fillRect(Math.round(s.x + Math.cos(s.a) * d), Math.round(s.y + Math.sin(s.a) * d), 2, 2); }
    if (E.fini) for (let k = 0; k < 12; k++) { const a = k / 12 * 6.28 + t * 2, d = 20 + E.fini * 30; g.fillStyle = k % 2 ? '#ffffff' : '#bfe8ff'; g.fillRect(Math.round(L.ox + 15 * L.s + Math.cos(a) * d), Math.round(L.oy + 20 * L.s + Math.sin(a) * d * 0.7), 2, 2); }
  }

  const vue = { update, draw, pointeur };
  return { lancer, en: () => !!E, etat: () => E, mise: (V) => (E ? mise(V) : null), poserDev: (nom) => { const L = mise(E.J.V); const p = E.pieces.find((q) => q.nom === nom); if (p && !p.pose) poser(p, L); } };
})();
