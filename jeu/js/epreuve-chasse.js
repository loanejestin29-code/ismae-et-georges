// =====================================================================
//  epreuve-chasse.js — ÉPREUVE 6 : « La grande chasse » (le grenier de l'antiquaire, à Montaigu)
//
//  État (Scenes.quete.chasse) : 'aVenir' → 'quete' (dans le grenier) → 'final' → 'gagne'
//  1. Après le caramel, l'antiquaire attend Ismae devant sa boutique (une flèche le montre) et le fait
//     monter au grenier. En entrant, Georges file après une souris et disparaît dans le bazar ; un mot
//     de Loane, épinglé à une poutre, explique la chasse.
//  2. On fouille (bouton A) : l'armoire, la malle, les cartons, les draps… Cinq objets-souvenirs et
//     Georges sont cachés. Tout près d'une bonne cachette, une petite étincelle brille ; dans le coin
//     sombre, deux yeux jaunes clignent, et on entend miauler.
//  3. Un objet trouvé : le jeu s'arrête, l'objet apparaît en grand, se retourne comme une carte et
//     montre au dos un symbole d'une langue inconnue ; il rejoint la collection (en haut à gauche, un
//     toucher l'ouvre) et le présentoir, au milieu du grenier. Georges, lui, n'a pas de symbole.
//  4. Les six retrouvés : les objets se rangent sur le présentoir, se retournent, et leurs cinq symboles
//     forment une phrase… illisible. Il faut un traducteur, qui ne s'obtient qu'en répondant à des
//     questions sur Loane : le quiz final (annoncé).
//  Les trouvailles et les endroits fouillés restent sur le téléphone (localStorage « jeu.chasse »).
//  Tous les textes sont dans config.js → chasse.
// =====================================================================
'use strict';

const Chasse = (() => {
  const Q = Scenes.quete, K = () => CONFIG.chasse, CLE = 'jeu.chasse';
  const $ = (id) => document.getElementById(id);
  const ORDRE = ['pansement', 'couronne', 'echarpe', 'ticket', 'chou']; // l'ordre des épreuves : celui de la phrase
  const TOUS = [...ORDRE, 'georges'];
  // ce que cache chaque cachette (les autres ne cachent que du bric-à-brac)
  const CONTENU = { couture: 'pansement', malle: 'couronne', armoire: 'echarpe', valises: 'ticket', chapeaux: 'chou', drapGeorges: 'georges' };
  let S = { trouves: [], fouilles: [], commencee: false };
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || 'null');
    if (v && Array.isArray(v.trouves)) S = { trouves: v.trouves.filter((k) => TOUS.includes(k)), fouilles: Array.isArray(v.fouilles) ? v.fouilles : [], commencee: !!v.commencee };
  } catch (_) { /* rien */ }
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (_) { /* navigation privée */ } }
  const trouve = (k) => Q.chasse === 'gagne' || S.trouves.includes(k);
  const nb = () => TOUS.filter(trouve).length;
  const doigt = () => matchMedia('(pointer: coarse)').matches;
  const ease = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3;

  function init(J) {
    if (!Q.chasse) Q.chasse = 'aVenir';
    if (location.hash === '#reset') effacer();
    $('chasse-btn').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (ouverte === null && !J.bloque()) collection(); });
    $('col-ok').addEventListener('click', fermerCollection);
    addEventListener('keydown', (e) => {
      if (ouverte !== null) { if (['Escape', 'Enter', 'NumpadEnter', 'Space'].includes(e.code)) { e.preventDefault(); fermerCollection(); } return; }
      if (e.code === 'KeyC' && !$('chasse').hidden && !J.bloque() && !J.overlay) collection();
    });
    J.systemes.push(majGrenier);
  }
  // nouvelle partie, ou l'épreuve rejouée depuis le carnet : la chasse repart de zéro
  function effacer() { S = { trouves: [], fouilles: [], commencee: false }; sauver(); }
  // une chasse commencée : on reprend directement dans le grenier
  const enCours = () => S.commencee;

  // ------------------------------------------------------------ Montaigu : l'antiquaire, devant sa boutique
  function montaigu(J) {
    const a = J.carte.antiquaire;
    if (!a) return;
    a.visible = Q.caramel === 'gagne';
    if (Q.caramel === 'gagne' && Q.chasse !== 'gagne' && !J.reperes.length) J.reperes = [a];
    if (Q.chasse === 'quete' && !trouve('georges')) cacherGeorges(J);
  }
  function antiquaire(J) {
    const A2 = K().antiquaire;
    if (Q.chasse === 'gagne') return A2.apres;
    J.jouerScript([{ dire: Q.chasse === 'aVenir' ? A2.avant : A2.pendant }, { faire: () => { Musique.porte(); J.allerA('grenier', 'entree'); } }]);
    return null;
  }

  // ------------------------------------------------------------ le grenier
  function cacherGeorges(J) { const G = J.georges; G.visible = false; G.mode = 'script'; G.chemin = null; G.x = -200; G.y = -200; }
  function entree(J) {
    Musique.morceau('grenier');
    if (Q.chasse === 'aVenir') { if (S.commencee) Q.chasse = 'quete'; else return intro(J); }
    if (!trouve('georges')) cacherGeorges(J);
  }
  // la première fois : une souris détale, Georges file derrière elle et disparaît ; puis le mot de Loane
  function intro(J) {
    const C = J.carte, G = J.georges;
    J.cinematique = true;
    const img = Grenier.souris(false);
    const souris = { x: 296, y: 404, visible: false, chemin: [[400, 408], [520, 362], [618, 300], [690, 240], [672, 172]], get sortY() { return this.y; }, update() {},
      draw(g) { if (this.visible) g.drawImage(img, Math.round(this.x - 5), Math.round(this.y - 6)); } };
    C.dynamiques.push(souris);
    const chemin = souris.chemin.map(([x, y]) => ({ x, y }));
    J.jouerScript([
      { attendre: 0.5 },
      { dire: K().arrivee },
      { faire: () => { souris.visible = true; Musique.couic(); } },
      { jusqua: (j) => { // la souris file vers le coin sombre
        const c = souris.chemin[0]; if (!c) return true;
        const dx = c[0] - souris.x, dy = c[1] - souris.y, d = Math.hypot(dx, dy), pas = 150 * j.dt;
        if (d <= pas) { souris.x = c[0]; souris.y = c[1]; souris.chemin.shift(); } else { souris.x += dx / d * pas; souris.y += dy / d * pas; }
        if (!G.chemin && souris.chemin.length < 4) { G.surprendre('!'); Musique.miaou(1.2, 0.1); G.allerVers(chemin, 135); }
        return !souris.chemin.length;
      } },
      { faire: () => { souris.visible = false; } },
      { jusqua: () => !G.chemin || !G.chemin.length },
      { faire: () => { cacherGeorges(J); J.joueur.dir = 'right'; } },
      { attendre: 0.3 },
      { dire: K().georgesFile },
      { faire: () => { J.joueur.dir = 'up'; } },
      { dire: K().mot },
    ], () => {
      J.cinematique = false;
      Q.chasse = 'quete'; S.commencee = true; sauver();
      majHud();
      const h = $('chasse'); h.hidden = false; h.classList.remove('arrive'); void h.offsetWidth; h.classList.add('arrive');
    });
  }
  // à chaque image, dans le grenier : la collection en haut à gauche ; Georges qui miaule sous son drap
  let hudVu = null, miaouT = 2;
  function majGrenier(dt, J) {
    const ici = J.carte.id === 'grenier' && Q.chasse !== 'aVenir';
    if (ici !== hudVu) { hudVu = ici; $('chasse').hidden = !ici; if (ici) { majHud(); $('aide').hidden = true; } } // l'aide du début laisse la place à la collection
    if (!ici || Q.chasse !== 'quete' || trouve('georges')) return;
    const ca = J.carte.cachettes.drapGeorges, p = J.joueur, d = Math.hypot(p.x - ca.x, p.y - ca.y);
    if (!J.bloque() && d < 160 && (miaouT -= dt) < 0) { miaouT = 3.5 + Math.random() * 3; Musique.miaou(1.15, d < 80 ? 0.07 : 0.035); ca.secoue = 0.45; }
    if (ca.secoue > 0) { ca.secoue -= dt; ca.ob.x = ca.x0 + (ca.secoue > 0 && Math.floor(ca.secoue * 20) % 2 ? 1 : 0); }
  }

  // ------------------------------------------------------------ fouiller
  function fouiller(id, J) {
    const ca = J.carte.cachettes[id], k = CONTENU[id];
    if (Q.chasse !== 'quete') return k ? K().vide : K().fouilles[id] || K().rien; // après la chasse, on regarde seulement
    if (k && !trouve(k)) { secouer(J, ca, () => (k === 'georges' ? trouverGeorges(J, ca) : decouvrir(k, J, ca))); return null; }
    if (k) return K().vide;
    if (S.fouilles.includes(id)) return K().deja;
    secouer(J, ca, () => { S.fouilles.push(id); sauver(); J.dire(K().fouilles[id] || K().rien); });
    return null;
  }
  // Ismae fouille : le meuble tremble, la poussière vole
  function secouer(J, ca, fin) {
    let t = 0;
    Musique.porte();
    J.jouerScript([{ jusqua: (j) => {
      t += j.dt;
      ca.ob.x = ca.x0 + (t < 0.55 ? (Math.floor(t * 24) % 2 ? 1 : -1) : 0);
      if (Math.random() < j.dt * 18) j.particule('fumee', ca.x + (Math.random() - 0.5) * ca.w * 0.8, ca.y - 4 - Math.random() * ca.h * 0.6, { vx: (Math.random() - 0.5) * 14, vy: -5 - Math.random() * 8, max: 1.3 });
      return t > 0.7;
    } }], () => { ca.ob.x = ca.x0; fin(); });
  }

  // ------------------------------------------------------------ l'animation par-dessus le jeu (découverte, Georges, la phrase)
  let A = null;
  const vue = {
    update(dt, J) { if (A) majAnim(dt, J); },
    draw(g, V, t) { if (A) dessinAnim(g, V, t); },
    pointeur(type) { if (type === 'down') suite(); },
    action() { suite(); },
  };
  function ouvrir(J, a) {
    J.cinematique = true;
    A = Object.assign({ t: 0, parts: [], J }, a);
    J.vue = vue;
    document.body.classList.add('trouvaille');
  }
  function fermer() {
    const J = A.J, f = A.fin;
    A = null; J.vue = null;
    document.body.classList.remove('trouvaille');
    legende(null);
    if (f) f();
  }
  function phase(p) { A.phase = p; A.t = 0; }
  const aideSuite = () => K().continuer[doigt() ? 0 : 1];
  // la légende (nom, texte, aide), en lettres du jeu par-dessus l'image ; null pour tout cacher
  function legende(o) {
    const L = $('trouvaille');
    if (!o) { L.hidden = true; return; }
    L.hidden = false;
    for (const [k, id] of [['nom', 'trv-nom'], ['texte', 'trv-texte'], ['aide', 'trv-aide']]) if (o[k] !== undefined) { $(id).textContent = o[k]; $(id).hidden = !o[k]; }
    if (o.bas !== undefined) L.className = o.bas ? 'bas' : '';
  }
  function suite() {
    if (!A) return;
    if (A.phase === 'symbole') { phase('range'); legende({ aide: '' }); Musique.bip(880, 0.03); }
    else if (A.phase === 'coeurs') { phase('saute'); legende({ aide: '' }); }
    else if (A.phase === 'phrase') fermer();
  }

  // un objet : il arrive du meuble, grossit, se retourne (le symbole), puis file dans la collection
  function decouvrir(k, J, ca) {
    const cam = J.cam, o = K().objets[k];
    ouvrir(J, { type: 'objet', k, phase: 'arrive', de: { x: ca.x - Math.round(cam.x), y: ca.y - ca.h / 2 - Math.round(cam.y) } });
    legende({ nom: o.nom, texte: o.texte, aide: '', bas: false });
    Musique.trouve();
    A.fin = () => {
      if (!S.trouves.includes(k)) S.trouves.push(k);
      sauver(); majHud(k);
      J.dire(o.trouve, () => { J.cinematique = false; verifierFin(J); });
    };
  }
  // Georges : il surgit, secoue sa poussière, éternue… puis saute rejoindre Ismae
  function trouverGeorges(J, ca) {
    ouvrir(J, { type: 'georges', phase: 'arrive', ca });
    legende({ nom: K().objets.georges.nom, texte: '', aide: '', bas: false });
    Musique.miaou(1.3, 0.12);
    A.fin = () => {
      if (!S.trouves.includes('georges')) S.trouves.push('georges');
      sauver(); majHud('georges');
      const p = J.joueur, G = J.georges;
      G.visible = true; G.x = p.x + (p.dir === 'left' ? 14 : -14); G.y = p.y + 3; G.reprendreSuivi(J); G.reaction = 1.6;
      J.dire(K().objets.georges.trouve, () => { J.cinematique = false; verifierFin(J); });
    };
  }
  // la phrase : les cinq objets sur le présentoir, qui se retournent ; les symboles montent et s'alignent
  function phrase(J, anime, fin) {
    ouvrir(J, { type: 'phrase', phase: anime ? 'pose' : 'phrase', fin });
    legende(anime ? { nom: '', texte: '', aide: '', bas: true } : { nom: '', texte: K().finale.legende, aide: aideSuite(), bas: true });
  }

  function majAnim(dt, J) {
    A.t += dt;
    for (const q of A.parts) { q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.g || 0) * dt; }
    A.parts = A.parts.filter((q) => q.t < q.max);
    const t = A.t;
    if (A.type === 'objet') {
      if (A.phase === 'arrive' && t > 0.55) phase('montre');
      else if (A.phase === 'montre' && t > 0.9) phase('retourne');
      else if (A.phase === 'retourne') {
        if (!A.son && t > 0.4) { A.son = true; Musique.magie(); A.eclat = 1; }
        if (t > 0.9) { phase('symbole'); legende({ texte: K().symbole, aide: aideSuite() }); }
      } else if (A.phase === 'range' && t > 0.65) fermer();
      if (A && A.eclat > 0) A.eclat = Math.max(0, A.eclat - dt * 1.6);
      if (A && (A.phase === 'montre' || A.phase === 'symbole') && Math.random() < dt * 12) etincelle(J.V);
    } else if (A.type === 'georges') {
      if (A.phase === 'arrive' && t > 0.5) { phase('secoue'); Musique.porte(); }
      else if (A.phase === 'secoue') {
        if (Math.random() < dt * 30) { const V = J.V; A.parts.push({ type: 'poussiere', x: V.w / 2 + (Math.random() - 0.5) * 70, y: V.h * 0.5 + (Math.random() - 0.5) * 40, vx: (Math.random() - 0.5) * 90, vy: -20 - Math.random() * 40, g: 60, t: 0, max: 0.9 }); }
        if (t > 1) { phase('atchoum'); Musique.miaou(1.5, 0.12); }
      } else if (A.phase === 'atchoum' && t > 0.8) { phase('coeurs'); legende({ texte: K().objets.georges.texte, aide: aideSuite() }); Musique.miaou(1.05, 0.1); }
      else if (A.phase === 'coeurs' && Math.random() < dt * 4) { const V = J.V, c = Math.random() < 0.5 ? -1 : 1; A.parts.push({ type: 'coeur', x: V.w / 2 + c * (40 + Math.random() * 40), y: V.h * 0.42, vx: c * 8, vy: -28, t: 0, max: 1.6 }); }
      else if (A.phase === 'saute' && t > 0.5) fermer();
    } else if (A.type === 'phrase') {
      if (A.phase === 'pose') { if (Math.floor(t / 0.35) !== Math.floor((t - dt) / 0.35) && t < 1.75) Musique.bip(520 + Math.floor(t / 0.35) * 90, 0.03); if (t > 1.9) phase('retourne'); }
      else if (A.phase === 'retourne') { if (Math.floor(t / 0.45) !== Math.floor((t - dt) / 0.45) && t < 2.25) Musique.magie(); if (t > 2.5) phase('monte'); }
      else if (A.phase === 'monte' && t > 1.5) { phase('phrase'); Musique.trouve(); legende({ texte: K().finale.legende, aide: aideSuite() }); }
      if (A && A.phase === 'phrase' && Math.random() < dt * 6) etincelle(J.V, true);
    }
  }
  function etincelle(V, haut) {
    const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * Math.min(V.w, V.h) * 0.3;
    A.parts.push({ type: 'etincelle', x: V.w / 2 + Math.cos(a) * d * 1.4, y: (haut ? V.h * 0.24 : V.h * 0.47) + Math.sin(a) * d * (haut ? 0.3 : 0.7), vx: 0, vy: -6, t: 0, max: 0.7 });
  }

  // ------------------------------------------------------------ dessin de l'animation
  let halo = null;
  function lueur(g, x, y, r, a) { // un halo doré, ajouté à l'image
    if (!halo) { halo = PX.canvas(64, 64); const hg = halo.getContext('2d'), gr = hg.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,120,0.9)'); gr.addColorStop(0.5, 'rgba(255,190,90,0.35)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); hg.fillStyle = gr; hg.fillRect(0, 0, 64, 64); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.drawImage(halo, Math.round(x - r), Math.round(y - r), r * 2, r * 2); g.restore();
  }
  function rayons(g, cx, cy, R, t, a = 0.14) {
    g.save(); g.translate(cx, cy); g.rotate(t * 0.35); g.globalAlpha = a; g.fillStyle = '#ffd27a';
    for (let k = 0; k < 12; k++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(R, -R * 0.1); g.lineTo(R, R * 0.1); g.closePath(); g.fill(); }
    g.restore();
  }
  // une image posée en (x, y) (son centre), à l'échelle s, aplatie horizontalement (sx : -1 à 1, le signe choisit la face)
  function carte(g, recto, verso, x, y, s, sx) {
    const im = sx >= 0 ? recto : verso;
    g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(Math.max(0.03, Math.abs(sx)) * s, s); g.drawImage(im, -im.width / 2, -im.height / 2); g.restore();
  }
  // le symbole d'un objet, centré en (x, y), avec son ombre et une lueur qui pulse
  function dessinSymbole(g, k, x, y, gs, sx = 1, eclat = 0.5) {
    const sym = Grenier.symbole(k), ombre = Grenier.symbole(k, '#120a20', '#120a20');
    lueur(g, x, y, Math.round(gs * 9), eclat);
    for (const [im, d] of [[ombre, Math.max(1, Math.round(gs / 2))], [sym, 0]]) {
      g.save(); g.translate(Math.round(x) + d, Math.round(y) + d); g.scale(Math.max(0.03, Math.abs(sx)) * gs, gs); g.drawImage(im, -sym.width / 2, -sym.height / 2); g.restore();
    }
  }
  function dessinAnim(g, V, t) {
    const w = V.w, h = V.h;
    let voile = 0.8;
    if (A.phase === 'arrive') voile *= ease(A.t / 0.4);
    if (A.phase === 'range' || A.phase === 'saute') voile *= 1 - ease(A.t / 0.6);
    g.fillStyle = `rgba(10,6,22,${voile.toFixed(3)})`; g.fillRect(0, 0, w, h);
    if (A.type === 'objet') dessinObjet(g, V, t);
    else if (A.type === 'georges') dessinGeorges(g, V, t);
    else dessinPhrase(g, V, t);
    for (const q of A.parts) {
      const a = Math.max(0, 1 - q.t / q.max);
      if (q.type === 'etincelle') { g.globalAlpha = Math.sin(a * Math.PI); g.fillStyle = '#fff6c0'; g.fillRect(Math.round(q.x), Math.round(q.y) - 2, 1, 5); g.fillRect(Math.round(q.x) - 2, Math.round(q.y), 5, 1); }
      else if (q.type === 'poussiere') { g.globalAlpha = a * 0.8; g.fillStyle = '#b8b0a8'; g.fillRect(Math.round(q.x), Math.round(q.y), 3, 3); }
      else if (q.type === 'coeur') { g.globalAlpha = Math.min(1, a * 2); const c = Entites.SPR.grosCoeur; g.drawImage(c, Math.round(q.x - c.width), Math.round(q.y - c.height), c.width * 2, c.height * 2); }
      g.globalAlpha = 1;
    }
  }
  function dessinObjet(g, V, t) {
    const k = A.k, img = Grenier.objet(k), dos = Grenier.verso(k), w = V.w, h = V.h;
    const S = Math.max(3, Math.floor(Math.min(w * 0.3 / img.width, h * 0.42 / img.height)));
    const cx = Math.round(w / 2), cy = Math.round(h * 0.47);
    let x = cx, y = cy, s = S, angle = 0;
    if (A.phase === 'arrive') { const p = ease(A.t / 0.55); x = A.de.x + (cx - A.de.x) * p; y = A.de.y + (cy - A.de.y) * p; s = 1 + (S - 1) * p; }
    else if (A.phase === 'montre') y = cy + Math.round(Math.sin(A.t * 5) * 2);
    else if (A.phase === 'retourne') { const p = Math.min(1, A.t / 0.9); angle = Math.PI * (p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) ** 2); }
    else angle = Math.PI;
    if (A.phase === 'symbole') y = cy + Math.round(Math.sin(A.t * 3) * 2);
    if (A.phase === 'range') { const p = ease(A.t / 0.6), c = cibleHud(k); x = cx + (c.x - cx) * p; y = cy + (c.y - cy) * p; s = S + (1 - S) * p; }
    const sx = Math.cos(angle);
    if (A.phase !== 'range') { rayons(g, cx, cy, Math.max(img.width, img.height) * S, t); lueur(g, cx, cy, Math.round(Math.max(img.width, img.height) * S * 0.75), 0.35 + (A.eclat || 0) * 0.6); }
    carte(g, img, dos, x, y, s, sx);
    if (sx < 0) dessinSymbole(g, k, x, y, Math.max(1, Math.round(s * 0.8)), sx, A.phase === 'symbole' ? 0.45 + Math.sin(A.t * 4) * 0.2 : 0.3);
  }
  function dessinGeorges(g, V, t) {
    const sp = Entites.SPR.georges, w = V.w, h = V.h, cx = Math.round(w / 2), base = Math.round(h * 0.68);
    const img = A.phase === 'coeurs' && Math.floor(A.t * 1.5) % 4 === 3 ? sp.sitBlink : sp.sit[Math.floor(t * 2) % 2];
    const S = Math.max(4, Math.floor(h * 0.42 / img.height));
    let x = cx, y = base, sxs = 1, sys = 1, tremble = 0;
    if (A.phase === 'arrive') { const p = Math.min(1, A.t / 0.5); y = h + img.height * S - (h + img.height * S - base) * ease(p) - Math.round(Math.sin(p * Math.PI) * 18); }
    else if (A.phase === 'secoue') tremble = Math.floor(A.t * 30) % 2 ? 2 : -2;
    else if (A.phase === 'atchoum') { const p = A.t / 0.8; if (p < 0.4) { sxs = 1 + p * 0.3; sys = 1 - p * 0.3; } else if (p < 0.6) { sxs = 0.85; sys = 1.2; } }
    else if (A.phase === 'saute') { const p = ease(A.t / 0.5), J = A.J, cam = J.cam, px = J.joueur.x - Math.round(cam.x), py = J.joueur.y - Math.round(cam.y); x = cx + (px - cx) * p; y = base + (py - base) * p - Math.round(Math.sin(p * Math.PI) * 30); sxs = sys = 1 - p * (1 - 1 / S); }
    if (A.phase !== 'saute') { // un rond de lumière derrière lui : un chat tout noir, ça se voit mal dans le noir
      const my = base - img.height * S / 2;
      rayons(g, cx, my, img.height * S * 1.1, t, 0.12);
      g.fillStyle = 'rgba(90,70,140,0.55)'; g.beginPath(); g.ellipse(cx, my, img.width * S * 0.62, img.height * S * 0.58, 0, 0, Math.PI * 2); g.fill();
      lueur(g, cx, my, img.height * S * 0.75, 0.5);
    }
    const s = S, bord = contour(img);
    g.save(); g.translate(Math.round(x + tremble), Math.round(y)); g.scale(s * sxs, s * sys); g.drawImage(bord, -bord.width / 2, -bord.height + 1); g.drawImage(img, -img.width / 2, -img.height); g.restore();
    // une toile d'araignée sur l'oreille, jusqu'à ce qu'il se secoue
    if (A.phase === 'arrive' || (A.phase === 'secoue' && A.t < 0.6)) { g.fillStyle = 'rgba(230,230,240,0.85)'; const ox = Math.round(x + tremble - img.width * s * 0.3), oy = Math.round(y - img.height * s * 0.95); for (let k = 0; k < 5; k++) { g.fillRect(ox + k * 3, oy + k, 1, 6); g.fillRect(ox, oy + k * 2, 12, 1); } }
    if (A.phase === 'atchoum' || (A.phase === 'coeurs' && A.t < 0.6)) {
      const mot = motPixel('ATCHOUM !'), ms = 3, p = Math.min(1, (A.phase === 'atchoum' ? A.t : 0.8) / 0.25);
      g.save(); g.translate(cx, Math.round(base - img.height * S - 22)); g.scale(ms * p, ms * p); g.drawImage(mot, -mot.width / 2, -mot.height / 2); g.restore();
    }
  }
  const contours = new Map(); // Georges, avec un bord clair tout autour
  function contour(im) { if (!contours.has(im)) contours.set(im, PX.outline(PX.silhouette(im, '#d8c8ff'), '#d8c8ff')); return contours.get(im); }
  const mots = {};
  function motPixel(m) {
    if (mots[m]) return mots[m];
    const c = PX.canvas(Arendelle.largeurTexte(m) + 2, 7), P = PX.painter(c);
    Arendelle.texte(P, m, 1, 1, '#fff6dc');
    return (mots[m] = PX.outline(c, '#1d1626'));
  }
  // les cinq objets sur le velours, qui se retournent ; les symboles qui montent et forment la phrase
  function dessinPhrase(g, V, t) {
    const w = V.w, h = V.h, imgs = ORDRE.map((k) => Grenier.objet(k)), gap = 10;
    const S = Math.max(2, Math.min(3, Math.floor((w - 24 - gap * 4) / imgs.reduce((a, im) => a + im.width, 0))));
    const total = imgs.reduce((a, im) => a + im.width * S, 0) + gap * 4, by = Math.round(h * 0.74);
    let x = Math.round(w / 2 - total / 2);
    // le présentoir : une bande de velours rouge, frangée d'or
    g.fillStyle = '#1d1626'; g.fillRect(x - 18, by - 2, total + 36, 18); g.fillStyle = '#6a1a2a'; g.fillRect(x - 16, by, total + 32, 14); g.fillStyle = '#9a2a3a'; g.fillRect(x - 16, by, total + 32, 3);
    g.fillStyle = '#e8b54a'; for (let fx = x - 16; fx < x + total + 16; fx += 3) g.fillRect(fx, by + 14, 1, 3);
    // la ligne des symboles (la phrase)
    const gs = Math.max(2, Math.min(4, Math.floor(h * 0.2 / 11))), pas = 9 * gs + Math.round(gs * 3), ligneY = Math.round(h * 0.25);
    const ligneX = (i) => Math.round(w / 2 - (pas * 4) / 2 + i * pas);
    if (A.phase === 'phrase') { // le bandeau d'encre derrière la phrase, souligné d'or
      g.fillStyle = 'rgba(30,18,50,0.85)'; g.fillRect(ligneX(0) - 9 * gs, ligneY - 8 * gs, pas * 4 + 18 * gs, 16 * gs);
      g.fillStyle = '#e8b54a'; g.fillRect(ligneX(0) - 7 * gs, ligneY + 7 * gs, pas * 4 + 14 * gs, 1); g.fillRect(ligneX(0) - 7 * gs, ligneY - 7 * gs, pas * 4 + 14 * gs, 1);
    }
    ORDRE.forEach((k, i) => {
      const im = imgs[i], iw = im.width * S, cx = x + iw / 2, cy = by - im.height * S / 2;
      x += iw + gap;
      let s = S, angle = Math.PI;
      if (A.phase === 'pose') { const p = (A.t - i * 0.35) / 0.3; if (p <= 0) return; s = S * (p < 1 ? 0.5 + 0.5 * ease(p) + Math.sin(Math.min(1, p) * Math.PI) * 0.15 : 1); angle = 0; }
      else if (A.phase === 'retourne') { const p = Math.min(1, Math.max(0, (A.t - i * 0.45) / 0.4)); angle = Math.PI * p; }
      const sx = Math.cos(angle);
      carte(g, im, Grenier.verso(k), cx, cy, s, sx);
      // le symbole : d'abord sur le dos de l'objet, puis il monte prendre sa place dans la phrase
      if (A.phase === 'pose' || (A.phase === 'retourne' && sx >= 0)) return;
      if (A.phase === 'retourne') { dessinSymbole(g, k, cx, cy, Math.max(1, S - 1), sx, 0.3); return; }
      const p = A.phase === 'monte' ? ease((A.t - i * 0.12) / 0.9) : 1, sg = Math.max(1, S - 1) + (gs - Math.max(1, S - 1)) * p;
      const gx = cx + (ligneX(i) - cx) * p, gy = cy + (ligneY - cy) * p - Math.round(Math.sin(p * Math.PI) * 16);
      dessinSymbole(g, k, gx, gy + (A.phase === 'phrase' ? Math.round(Math.sin(t * 2.2 + i) * 1.5) : 0), Math.round(sg), 1, A.phase === 'phrase' ? 0.4 + Math.sin(t * 3 + i) * 0.15 : 0.35);
    });
  }

  // ------------------------------------------------------------ le présentoir, au milieu du grenier
  function dessinTable(g, J, T) {
    ORDRE.forEach((k, i) => {
      if (!trouve(k)) return;
      const [dx, dy] = T.places[i], im = Grenier.objet(k);
      g.drawImage(im, Math.round(T.x + dx - im.width / 2), Math.round(T.y + dy - im.height + 3));
    });
  }
  function presentoir(J) {
    if (Q.chasse === 'gagne') { phrase(J, false, () => J.dire(K().relire, () => { J.cinematique = false; })); return null; }
    const n = ORDRE.filter(trouve).length;
    return n ? [K().presentoir[1].replace('{n}', n)] : [K().presentoir[0]];
  }
  // les petites lueurs, par-dessus l'éclairage : l'étincelle près des bonnes cachettes, les yeux de Georges, la phrase
  function lueurs(g, J, sprLum) {
    const C = J.carte, p = J.joueur;
    if (Q.chasse === 'quete' && !trouve('georges')) { // le coin où Georges s'est caché reste dans le noir
      const ca = C.cachettes.drapGeorges, gr = g.createRadialGradient(ca.x - 4, ca.y - 14, 8, ca.x - 4, ca.y - 14, 96);
      gr.addColorStop(0, 'rgba(8,4,18,0.62)'); gr.addColorStop(0.6, 'rgba(8,4,18,0.4)'); gr.addColorStop(1, 'rgba(8,4,18,0)');
      g.fillStyle = gr; g.fillRect(ca.x - 100, ca.y - 110, 200, 200);
    }
    if (Q.chasse === 'quete') {
      for (const [id, k] of Object.entries(CONTENU)) {
        if (k === 'georges' || trouve(k)) continue;
        const ca = C.cachettes[id];
        if (!ca || Math.hypot(p.x - ca.x, p.y - ca.y) > 80) continue;
        const ph = (J.t * 0.7 + ca.x * 0.013) % 1;
        if (ph > 0.22) continue;
        const a = Math.sin(ph / 0.22 * Math.PI), [ex, ey] = ca.etincelle;
        g.globalAlpha = a * 0.6; g.drawImage(sprLum(7, 'xmas'), ex - 7, ey - 7);
        g.globalAlpha = a; g.fillStyle = '#fff6c0'; g.fillRect(ex, ey - 3, 1, 7); g.fillRect(ex - 3, ey, 7, 1); g.fillStyle = '#ffffff'; g.fillRect(ex, ey, 1, 1);
        g.globalAlpha = 1;
      }
      if (!trouve('georges')) { // deux yeux jaunes, sous le drap, qui clignent
        const ca = C.cachettes.drapGeorges, x = ca.x - 10, y = ca.y - 3;
        if ((J.t % 3.2) < 2.95) { g.globalAlpha = 0.45; g.drawImage(sprLum(4, 'xmas'), x - 1, y - 3); g.drawImage(sprLum(4, 'xmas'), x + 5, y - 3); g.globalAlpha = 1; g.fillStyle = '#f2c230'; g.fillRect(x, y, 2, 2); g.fillRect(x + 6, y, 2, 2); g.fillStyle = '#1d1626'; g.fillRect(x + 1, y, 1, 2); g.fillRect(x + 7, y, 1, 2); }
      }
    }
    if (Q.chasse === 'gagne') { // la phrase flotte au-dessus du présentoir
      const T = C.table;
      ORDRE.forEach((k, i) => {
        const sym = Grenier.symbole(k), x = T.x - 34 + i * 17, y = T.y - 66 + Math.round(Math.sin(J.t * 2 + i) * 1.5);
        g.globalAlpha = 0.55; g.drawImage(sprLum(9, 'xmas'), x - 5, y - 4); g.globalAlpha = 1;
        g.drawImage(sym, x - 4, y - 5);
      });
    }
  }

  // ------------------------------------------------------------ la fin : la phrase, le traducteur, le quiz final
  function verifierFin(J) {
    if (Q.chasse !== 'quete' || !TOUS.every(trouve)) return;
    Q.chasse = 'final';
    J.cinematique = true;
    J.jouerScript([{ attendre: 0.3 }, { dire: K().finale.debut }], () => {
      phrase(J, true, () => J.jouerScript([{ attendre: 0.2 }, { dire: K().finale.apres }], () => {
        Musique.victoire();
        Indices.gagner(5, () => { Q.chasse = 'gagne'; J.cinematique = false; majHud(); Indices.suite(K().suite); });
      }));
    });
  }

  // ------------------------------------------------------------ la collection : en haut à gauche, et sa fenêtre
  const icone = (k) => (k === 'georges' ? Entites.SPR.georges.sit[0] : Grenier.objet(k));
  function toile(im, cls) { const cv = document.createElement('canvas'); cv.className = 'pixel ' + cls; cv.width = im.width; cv.height = im.height; cv.getContext('2d').drawImage(im, 0, 0); return cv; }
  function majHud(nouveau) {
    const boite = $('chasse-cases');
    if (!boite.childElementCount) for (const k of TOUS) { const s = document.createElement('span'); s.className = 'inv-case'; s.dataset.k = k; s.append(toile(icone(k), '')); boite.append(s); }
    for (const s of boite.children) s.classList.toggle('ok', trouve(s.dataset.k));
    $('chasse-nb').textContent = `${nb()}/${TOUS.length}`;
    if (nouveau) { const s = boite.querySelector(`[data-k="${nouveau}"]`); if (s) { s.classList.remove('nouveau'); void s.offsetWidth; s.classList.add('nouveau'); } }
  }
  function cibleHud(k) {
    const el = document.querySelector(`#chasse-cases [data-k="${k}"]`);
    if (!el || $('chasse').hidden) return { x: 24, y: 18 };
    const r = el.getBoundingClientRect();
    return Jeu.versJeu({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
  }
  // la phrase en petit (pour la fenêtre de la collection)
  function toilePhrase() {
    const c = PX.canvas(5 * 9 + 4 * 4, 11), g = c.getContext('2d');
    ORDRE.forEach((k, i) => g.drawImage(Grenier.symbole(k), i * 13, 0));
    c.className = 'pixel col-phrase-cv';
    return c;
  }
  let ouverte = null;
  function collection() {
    const liste = $('col-liste');
    liste.textContent = '';
    for (const k of TOUS) {
      const ok = trouve(k), li = document.createElement('li'), o = K().objets[k];
      li.className = ok ? 'obtenu' : 'cache';
      const nom = document.createElement('span'); nom.className = 'col-nom'; nom.textContent = ok ? o.nom : '???';
      const fig = document.createElement('span'); fig.className = 'col-figure';
      fig.append(toile(ok ? icone(k) : PX.silhouette(icone(k), '#4a3f6e'), 'col-objet'));
      if (k !== 'georges') fig.append(ok ? toile(Grenier.symbole(k), 'col-symbole') : Object.assign(document.createElement('b'), { className: 'col-inconnu', textContent: '?' }));
      li.append(fig, nom);
      liste.append(li);
    }
    const tous = ORDRE.every(trouve), ph = $('col-phrase');
    ph.hidden = !tous;
    if (tous) { const ancien = ph.querySelector('canvas'); if (ancien) ancien.remove(); ph.append(toilePhrase()); }
    $('col-titre').textContent = `Objets retrouvés · ${nb()}/${TOUS.length}`;
    ouverte = performance.now();
    Jeu.overlay = true;
    if (Jeu.relacher) Jeu.relacher();
    $('collection').hidden = false;
    setTimeout(() => $('col-ok').focus(), 50);
  }
  function fermerCollection() {
    if (ouverte === null || performance.now() - ouverte < 500) return;
    ouverte = null;
    $('collection').hidden = true;
    Jeu.overlay = false;
  }

  return {
    init, effacer, enCours, montaigu, antiquaire, entree, fouiller, presentoir, dessinTable, lueurs,
    dev: { trouver: (k) => { if (!S.trouves.includes(k)) S.trouves.push(k); sauver(); majHud(k); }, etat: () => S, decouvrir: (k) => decouvrir(k, Jeu, Jeu.carte.cachettes[Object.keys(CONTENU).find((c) => CONTENU[c] === k)]), finale: () => verifierFin(Jeu) },
  };
})();
