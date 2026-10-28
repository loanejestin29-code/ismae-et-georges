// =====================================================================
//  moteur.js — boucle de jeu : affichage pixel, caméra, commandes
//  clavier et tactiles, collisions, interactions, dialogues, portes,
//  éclairage du soir, eau animée, fumées, particules.
// =====================================================================
'use strict';

const Jeu = (() => {
  const J = { input: { x: 0, y: 0, run: false, analog: false }, trace: [], particules: [], pnj: [] };
  const V = { w: 320, h: 200, s: 3 };
  const cam = { x: 0, y: 0 };
  const fabriques = {}; // id de carte -> fonction qui construit la carte
  const cache = {};
  let ecran, eg, buf, bg, lum, lg, vignette;
  let carte = null, dialogue = null, transition = null, cible = null, t = 0, last = 0, actif = false;
  const debug = location.hash === '#debug';
  // #test : la boucle continue même quand la page est en arrière-plan (sert aux vérifications)
  const image = location.hash === '#test' ? (f) => setTimeout(() => f(performance.now()), 16) : (f) => requestAnimationFrame(f);
  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------ écran
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cw = Math.round(innerWidth * dpr), ch = Math.round(innerHeight * dpr);
    ecran.width = cw; ecran.height = ch;
    V.s = Math.max(1, Math.round(Math.min(cw, ch) / 250));
    V.w = Math.ceil(cw / V.s); V.h = Math.ceil(ch / V.s);
    buf.width = V.w; buf.height = V.h; lum.width = V.w; lum.height = V.h;
    eg.imageSmoothingEnabled = false; bg.imageSmoothingEnabled = false;
    vignette = PX.canvas(V.w, V.h);
    const vg = vignette.getContext('2d');
    const gr = vg.createRadialGradient(V.w / 2, V.h / 2, Math.min(V.w, V.h) * 0.35, V.w / 2, V.h / 2, Math.max(V.w, V.h) * 0.75);
    gr.addColorStop(0, 'rgba(10,6,20,0)'); gr.addColorStop(1, 'rgba(10,6,20,0.45)');
    vg.fillStyle = gr; vg.fillRect(0, 0, V.w, V.h);
    if (carte) camera(true);
  }

  // ------------------------------------------------------------ commandes
  const keys = new Set();
  const KEYMAP = {
    up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
  };
  const touch = { x: 0, y: 0, run: false };
  function initCommandes() {
    addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      keys.add(e.code);
      if (['Space', 'Enter', 'KeyE', 'NumpadEnter'].includes(e.code)) action();
    });
    addEventListener('keyup', (e) => keys.delete(e.code));
    addEventListener('blur', () => keys.clear());

    // joystick flottant : on pose le pouce n'importe où sur l'écran de jeu
    // (le clavier ci-dessus ne sert qu'aux tests sur ordinateur)
    const base = $('joy'), knob = $('joy-knob');
    let jid = null, ox = 0, oy = 0;
    ecran.addEventListener('pointerdown', (e) => {
      if (dialogue) { action(); return; }
      // à l'horizontale, le pouce gauche marche et le pouce droit reste sur les boutons
      if (jid !== null || e.clientX > innerWidth * 0.62) return;
      jid = e.pointerId; ox = e.clientX; oy = e.clientY;
      base.style.left = ox + 'px'; base.style.top = oy + 'px'; base.hidden = false;
      knob.style.transform = 'translate(-50%,-50%)';
      try { ecran.setPointerCapture(jid); } catch (_) { /* rien */ }
    });
    ecran.addEventListener('pointermove', (e) => {
      if (e.pointerId !== jid) return;
      let dx = e.clientX - ox, dy = e.clientY - oy;
      const R = 46, d = Math.hypot(dx, dy);
      if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      if (d < 7) { touch.x = touch.y = 0; } else { touch.x = dx / R; touch.y = dy / R; }
    });
    const fin = (e) => { if (e.pointerId !== jid) return; jid = null; base.hidden = true; touch.x = touch.y = 0; };
    ecran.addEventListener('pointerup', fin);
    ecran.addEventListener('pointercancel', fin);
    J.relacher = () => { jid = null; base.hidden = true; touch.x = touch.y = 0; keys.clear(); };
    const btnA = $('btn-a'), btnB = $('btn-b');
    btnA.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); btnA.classList.add('appui'); action(); });
    btnA.addEventListener('pointerup', () => btnA.classList.remove('appui'));
    btnA.addEventListener('pointerleave', () => btnA.classList.remove('appui'));
    btnB.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); touch.run = !touch.run; btnB.classList.toggle('actif', touch.run); });
    $('dialogue').addEventListener('pointerdown', (e) => { e.preventDefault(); action(); });
    const son = $('btn-son');
    const majSon = () => { son.classList.toggle('coupe', !Musique.actif()); son.setAttribute('aria-label', Musique.actif() ? 'Couper la musique' : 'Remettre la musique'); };
    son.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); Musique.basculer(); majSon(); });
    majSon();
  }
  function lireCommandes() {
    const k = (n) => KEYMAP[n].some((c) => keys.has(c));
    let x = (k('right') ? 1 : 0) - (k('left') ? 1 : 0), y = (k('down') ? 1 : 0) - (k('up') ? 1 : 0);
    const i = J.input;
    if (x || y) { i.x = x; i.y = y; i.analog = false; i.run = keys.has('ShiftLeft') || keys.has('ShiftRight'); }
    else { i.x = touch.x; i.y = touch.y; i.analog = false; i.run = touch.run; }
  }

  // ------------------------------------------------------------ collisions
  function bloqueRect(x, y, w, h, ent) {
    if (x < 0 || y < 0 || x + w > carte.w || y + h > carte.h) return true;
    for (const s of carte.solides) if (x < s.x + s.w && x + w > s.x && y < s.y + s.h && y + h > s.y) return true;
    // les habitants bloquent le passage d'Ismae (pas celui de Georges)
    if (ent === J.joueur) for (const e of J.pnj) {
      if (!e.bloquant) continue;
      if (x < e.x + 5 && x + w > e.x - 5 && y < e.y + 1 && y + h > e.y - 4) return true;
    }
    return false;
  }
  const bloqueEnt = (e, x, y) => bloqueRect(x - e.hb.w / 2, y - e.hb.h + 1, e.hb.w, e.hb.h, e);
  J.deplacer = (e, dx, dy) => {
    if (dx) {
      if (!bloqueEnt(e, e.x + dx, e.y)) e.x += dx;
      else if (!dy) for (let k = 1; k <= 5; k++) { // glisse le long des coins
        if (!bloqueEnt(e, e.x + dx, e.y - k)) { e.y -= Math.min(k, Math.abs(dx)); break; }
        if (!bloqueEnt(e, e.x + dx, e.y + k)) { e.y += Math.min(k, Math.abs(dx)); break; }
      }
    }
    if (dy) {
      if (!bloqueEnt(e, e.x, e.y + dy)) e.y += dy;
      else if (!dx) for (let k = 1; k <= 6; k++) {
        if (!bloqueEnt(e, e.x - k, e.y + dy)) { e.x -= Math.min(k, Math.abs(dy)); break; }
        if (!bloqueEnt(e, e.x + k, e.y + dy)) { e.x += Math.min(k, Math.abs(dy)); break; }
      }
    }
  };
  J.bloque = () => !!dialogue || !!transition || !!script || !!J.cinematique;
  J.surEscalier = (e) => (carte.escaliers || []).some((s) => e.x > s.x && e.x < s.x + s.w && e.y > s.y && e.y < s.y + s.h);
  J.particule = (type, x, y, o = {}) => J.particules.push(Object.assign({ type, x, y, vx: 0, vy: 0, life: 0, max: 1.5 }, o));

  // ------------------------------------------------------------ dialogues
  // src : clé de CONFIG.textes, ou tableau de lignes ('texte' ou ['qui', 'texte'])
  function ouvrirDialogue(src, fin) {
    let lignes = typeof src === 'string' ? CONFIG.textes[src] : src;
    if (!lignes || !lignes.length) { if (fin) fin(); return; }
    lignes = lignes.map((l) => (Array.isArray(l) ? { qui: l[0], texte: l[1] } : { qui: null, texte: l }));
    dialogue = { lignes, i: 0, n: 0, fin };
    $('dialogue').hidden = false;
    majLigne();
  }
  function majLigne() {
    const l = dialogue.lignes[dialogue.i];
    const p = l.qui && CONFIG.personnages[l.qui];
    const nom = $('dlg-nom'), por = $('dlg-portrait');
    nom.hidden = !p;
    if (p) { nom.textContent = p.nom; nom.style.setProperty('--teinte', p.couleur); }
    const img = l.qui && Entites.portrait(l.qui);
    por.hidden = !img;
    if (img) {
      // on cadre la tête et le buste (le haut de l'image) et on remplit le cadre
      const grand = img.height > 24;
      const sy = grand ? Math.max(0, img.height - 32) : 0, h = grand ? Math.min(20, img.height - sy) : img.height;
      const marge = 2;
      por.width = img.width + marge * 2; por.height = Math.round((img.width + marge * 2) * 0.88);
      const g = por.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, por.width, por.height);
      g.drawImage(img, 0, sy, img.width, h, marge, por.height - h, img.width, h);
    }
    $('dialogue').classList.toggle('narration', !p);
    dialogue.qui = l.qui;
    majDialogue();
  }
  function majDialogue() {
    const l = dialogue.lignes[dialogue.i].texte;
    $('dlg-texte').textContent = l.slice(0, Math.floor(dialogue.n));
    $('dlg-suite').hidden = dialogue.n < l.length;
  }
  function fermerDialogue() {
    const f = dialogue.fin;
    dialogue = null;
    $('dialogue').hidden = true;
    if (f) f();
  }
  function action() {
    if (!actif || transition) return;
    if (dialogue) {
      const l = dialogue.lignes[dialogue.i].texte;
      if (dialogue.n < l.length) dialogue.n = l.length;
      else if (++dialogue.i >= dialogue.lignes.length) { fermerDialogue(); return; }
      else { dialogue.n = 0; majLigne(); return; }
      majDialogue();
      return;
    }
    if (script || J.cinematique) return;
    if (cible) {
      if (cible.chat) {
        for (let k = 0; k < 3; k++) J.particule('coeur', cible.chat.x + (k - 1) * 5, cible.chat.y - 14, { vy: -14 - k * 3, max: 1.2 });
        if (cible.chat === J.georges) J.georges.reaction = 1.5;
        Musique.miaou(cible.chat.aigu || 1);
      }
      if (cible.action) cible.action(J);
      const lignes = cible.dialogue ? cible.dialogue(J) : cible.texte;
      if (lignes) ouvrirDialogue(lignes);
    }
  }
  J.dire = ouvrirDialogue;

  // ------------------------------------------------------------ scènes scriptées
  // étapes : { dire: lignes } { attendre: secondes } { faire: fn } { jusqua: fn -> bool }
  let script = null;
  J.jouerScript = (etapes, fin) => { script = { etapes, i: 0, t: 0, fin, attente: false }; };
  function majScript(dt) {
    while (script) {
      const e = script.etapes[script.i];
      if (!e) { const f = script.fin; script = null; if (f) f(J); return; }
      if (e.dire) {
        if (!script.attente) { script.attente = true; const s = script; ouvrirDialogue(e.dire, () => { s.attente = false; s.i++; }); }
        return;
      }
      if (e.attendre !== undefined) { script.t += dt; if (script.t < e.attendre) return; script.t = 0; script.i++; continue; }
      if (e.faire) { e.faire(J); script.i++; continue; }
      if (e.jusqua) { if (!e.jusqua(J)) return; script.i++; continue; }
      script.i++;
    }
  }
  J.systemes = [];

  // ------------------------------------------------------------ cartes et portes
  J.enregistrerCarte = (id, fn) => { fabriques[id] = fn; };
  function obtenirCarte(id) { return cache[id] || (cache[id] = fabriques[id]()); }
  function placer(id, arrivee) {
    carte = obtenirCarte(id);
    J.carte = carte;
    const a = carte.arrivees[arrivee];
    const p = J.joueur;
    p.x = a.x; p.y = a.y; p.dir = a.dir;
    const back = { down: [0, -1], up: [0, 1], left: [1, 0], right: [-1, 0] }[a.dir];
    let gx = a.x + back[0] * 16, gy = a.y + back[1] * 16;
    if (bloqueEnt(J.georges, gx, gy)) { gx = a.x; gy = a.y; }
    J.georges.x = gx; J.georges.y = gy; J.georges.etat = 'marche';
    J.trace = [{ x: gx, y: gy }, { x: a.x, y: a.y }];
    J.pnj = carte.pnj;
    J.particules = [];
    Musique.etouffer(carte.ambiance === 'interieur');
    camera(true);
    if (J.onCarte) J.onCarte(carte);
    if (carte.onEntree) carte.onEntree(J);
  }
  J.allerA = (id, arrivee) => {
    if (transition) return;
    transition = { t: 0, phase: 'out', cb: () => placer(id, arrivee) };
  };
  function verifierPortes() {
    const p = J.joueur;
    for (const d of carte.portes) {
      if (p.x > d.x && p.x < d.x + d.w && p.y > d.y && p.y < d.y + d.h && p.dir === d.sens && p.moving) {
        if (d.condition && !d.condition()) continue;
        J.allerA(d.vers, d.arrivee);
        return;
      }
    }
  }

  // ------------------------------------------------------------ caméra
  function camera(snap) {
    const p = J.joueur;
    let tx = p.x - V.w / 2, ty = p.y - 24 - V.h / 2;
    tx = carte.w <= V.w ? (carte.w - V.w) / 2 : Math.max(0, Math.min(carte.w - V.w, tx));
    ty = carte.h <= V.h ? (carte.h - V.h) / 2 : Math.max(0, Math.min(carte.h - V.h, ty));
    if (snap) { cam.x = tx; cam.y = ty; return; }
    const k = Math.min(1, J.dt * 7);
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
  }

  // ------------------------------------------------------------ mise à jour
  function update(dt) {
    t += dt; J.t = t; J.dt = dt;
    lireCommandes();
    const p = J.joueur;
    const ox = p.x, oy = p.y;
    p.update(dt, J);
    const last = J.trace[J.trace.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 0.75) { J.trace.push({ x: p.x, y: p.y }); if (J.trace.length > 400) J.trace.shift(); }
    void ox; void oy;
    J.georges.update(dt, J);
    for (const e of J.pnj) e.update && e.update(dt, J);
    for (const d of carte.dynamiques) d.update && d.update(dt, J);
    for (const s of J.systemes) s(dt, J);
    majScript(dt);
    if (dialogue) {
      const l = dialogue.lignes[dialogue.i].texte;
      if (dialogue.n < l.length) {
        const avant = Math.floor(dialogue.n);
        dialogue.n = Math.min(l.length, dialogue.n + dt * 46);
        if (Math.floor(dialogue.n / 3) > Math.floor(avant / 3)) Musique.bip(dialogue.qui ? (CONFIG.personnages[dialogue.qui] || {}).bip || 620 : 480);
        majDialogue();
      }
    }
    // la musique est plus forte près de la scène des chats musiciens (on peut la suivre dans la rue)
    if (carte.sourceMusique) {
      const d = Math.hypot(p.x - carte.sourceMusique.x, p.y - carte.sourceMusique.y);
      Musique.proximite(Math.max(0, Math.min(1, 1 - (d - 60) / 640)));
    } else Musique.proximite(0);
    if (!J.bloque()) verifierPortes();
    if (transition) {
      transition.t += dt;
      if (transition.phase === 'out' && transition.t > 0.32) { transition.cb(); transition.phase = 'in'; transition.t = 0; }
      else if (transition.phase === 'in' && transition.t > 0.32) transition = null;
    }
    // cible d'interaction devant Ismae
    cible = null;
    if (!J.bloque()) {
      const f = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[p.dir];
      const pr = { x: p.x + f[0] * 9 - 7, y: p.y + f[1] * 8 - 9, w: 14, h: 14 };
      let best = 1e9;
      const zones = carte.zones.concat(J.pnj.filter((e) => (e.texte || e.dialogue) && e.zone).map((e) => e.zone()), [J.georges.zone()]).filter(Boolean);
      for (const z of zones) {
        if (pr.x < z.x + z.w && pr.x + pr.w > z.x && pr.y < z.y + z.h && pr.y + pr.h > z.y) {
          const d = Math.hypot(z.x + z.w / 2 - p.x, z.y + z.h / 2 - p.y);
          if (d < best) { best = d; cible = z; }
        }
      }
    }
    $('btn-a').classList.toggle('dispo', !!cible || !!dialogue);
    // particules
    if (carte.ambiance !== 'interieur') {
      for (const f of carte.fumees) {
        f.t -= dt;
        if (f.t < 0) { f.t = 0.5 + Math.random() * 0.4; if (Math.abs(f.x - cam.x - V.w / 2) < V.w && Math.abs(f.y - cam.y - V.h / 2) < V.h) J.particule('fumee', f.x, f.y, { vx: 5 + Math.random() * 3, vy: -9, max: 3.2 }); }
      }
      if (CONFIG.neige && Math.random() < dt * 40) J.particule('neige', cam.x + Math.random() * (V.w + 60) - 30, cam.y - 4, { vx: -4 + Math.random() * 3, vy: 14 + Math.random() * 10, max: 30 });
    }
    for (const q of J.particules) { q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.type === 'neige') q.x += Math.sin(t * 2 + q.y * 0.1) * 0.15; }
    J.particules = J.particules.filter((q) => q.life < q.max && !(q.type === 'neige' && q.y > cam.y + V.h + 4));
    camera(false);
  }

  // ------------------------------------------------------------ dessin
  const LUM = {
    lamp: '#ffc874', halo: '#ffe2a0', shop: '#ffb05a', win: '#ffc66a', neon: '#cfe6ff', tree: '#ffd58a', xmas: '#ffdf9a', boat: '#ffc870', rose: '#ff7ab8',
  };
  const lumCache = {};
  function sprLum(r, k) {
    const key = r + k;
    if (lumCache[key]) return lumCache[key];
    const c = PX.canvas(r * 2, r * 2), g = c.getContext('2d');
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    const col = LUM[k] || LUM.lamp;
    gr.addColorStop(0, PX.rgba(col, 1)); gr.addColorStop(0.45, PX.rgba(col, 0.55)); gr.addColorStop(1, PX.rgba(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
    return (lumCache[key] = c);
  }
  const AMB = { soir: '#a39fcb', jour: '#fff6ea', interieur: '#f1f3fb' };

  let eauTiles = null;
  function tuilesEau() {
    const r = PX.rng(42);
    return [0, 1].map((k) => {
      const c = PX.canvas(160, 48), P = PX.painter(c);
      for (let n = 0; n < 34; n++) {
        const x = r.int(160), y = r.int(16) * 3, l = 2 + r.int(5);
        P.rect(x, y, l, 1, k ? 'rgba(160,205,240,0.35)' : 'rgba(110,160,210,0.45)');
        if (r.chance(0.3)) P.rect(x + 1, y + 1, Math.max(1, l - 2), 1, 'rgba(40,70,120,0.5)');
      }
      return c;
    });
  }

  function render() {
    const g = bg;
    const cx = Math.round(cam.x), cy = Math.round(cam.y);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = carte.fond; g.fillRect(0, 0, V.w, V.h);
    g.setTransform(1, 0, 0, 1, -cx, -cy);
    g.drawImage(carte.sol, 0, 0);
    // eau animée
    if (!eauTiles) eauTiles = tuilesEau();
    for (const e of carte.eaux) {
      const x0 = Math.max(e.x, cx), x1 = Math.min(e.x + e.w, cx + V.w), y0 = Math.max(e.y, cy), y1 = Math.min(e.y + e.h, cy + V.h);
      if (x1 <= x0 || y1 <= y0) continue;
      g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
      eauTiles.forEach((tile, k) => {
        const off = Math.floor((t * (k ? -7 : 5)) % 160);
        for (let yy = e.y + Math.floor((y0 - e.y) / 48) * 48; yy < y1; yy += 48)
          for (let xx = e.x + off - 160 + Math.floor((x0 - e.x) / 160) * 160; xx < x1; xx += 160) g.drawImage(tile, xx, yy + k * 1);
      });
      g.restore();
    }
    // objets + personnages triés en profondeur
    const vis = carte.objets.filter((o) => o.x < cx + V.w && o.x + o.img.width > cx && o.y < cy + V.h && o.y + o.img.height > cy);
    const list = vis.concat(J.pnj, carte.dynamiques, [J.joueur, J.georges]);
    list.sort((a, b) => a.sortY - b.sortY);
    for (const o of list) { if (o.draw) o.draw(g, J); else g.drawImage(o.img, o.x, o.y); }
    // silhouettes visibles derrière les bâtiments
    g.globalAlpha = 0.32; J.georges.draw(g); J.joueur.draw(g); g.globalAlpha = 1;
    // ampoules qui scintillent
    for (let i = 0; i < carte.scintille.length; i++) {
      const [x, y] = carte.scintille[i];
      if (x < cx - 2 || x > cx + V.w + 2 || y < cy - 2 || y > cy + V.h + 2) continue;
      const on = Math.sin(t * 2.2 + i * 1.7) > -0.2;
      g.fillStyle = on ? '#fff3c0' : '#c98a3c'; g.fillRect(x, y, 1, 1);
    }
    for (const d of carte.dessus) g.drawImage(d.img, d.x, d.y);
    // particules
    for (const q of J.particules) {
      const a = 1 - q.life / q.max;
      if (q.type === 'coeur') { g.globalAlpha = Math.min(1, a * 2); Entites.poser(g, Entites.SPR.coeur, q.x, q.y); }
      else if (q.type === 'note') { g.globalAlpha = Math.min(1, a * 2.5); g.drawImage(Entites.SPR.notes[q.v || 0], Math.round(q.x + Math.sin(q.life * 4 + q.y) * 2), Math.round(q.y)); }
      else if (q.type === 'etoile') { g.globalAlpha = a; g.drawImage(Entites.SPR.etoile, Math.round(q.x + Math.cos(q.life * 9) * 6), Math.round(q.y + Math.sin(q.life * 9) * 2)); }
      else if (q.type === 'goutte') { g.globalAlpha = a; g.fillStyle = '#bfe6f4'; g.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); }
      else if (q.type === 'z') { g.globalAlpha = a; g.drawImage(Entites.SPR.z, Math.round(q.x + Math.sin(q.life * 3) * 2), Math.round(q.y - q.life * 8)); }
      else if (q.type === 'fumee') {
        g.globalAlpha = a * 0.55; g.fillStyle = '#c9c4d6';
        const r = 1 + Math.floor(q.life * 1.2);
        g.fillRect(Math.round(q.x - r), Math.round(q.y - r + 1), r * 2, r * 2 - 1); g.fillRect(Math.round(q.x - r + 1), Math.round(q.y - r), r * 2 - 2, r * 2 + 1);
      } else if (q.type === 'neige') { g.globalAlpha = 0.9; g.fillStyle = '#f4f6ff'; g.fillRect(Math.round(q.x), Math.round(q.y), q.vy > 20 ? 2 : 1, q.vy > 20 ? 2 : 1); }
      g.globalAlpha = 1;
    }
    // éclairage : on assombrit la scène puis on rallume autour des sources de lumière
    const amb = CONFIG.ambiance === 'jour' && carte.ambiance === 'soir' ? 'jour' : carte.ambiance;
    lg.setTransform(1, 0, 0, 1, 0, 0);
    lg.globalCompositeOperation = 'source-over';
    lg.fillStyle = AMB[amb]; lg.fillRect(0, 0, V.w, V.h);
    if (amb === 'soir') {
      lg.globalCompositeOperation = 'lighter';
      lg.setTransform(1, 0, 0, 1, -cx, -cy);
      for (let i = 0; i < carte.lumieres.length; i++) {
        const L = carte.lumieres[i];
        if (L.x + L.r < cx || L.x - L.r > cx + V.w || L.y + L.r < cy || L.y - L.r > cy + V.h) continue;
        const fl = L.k === 'lamp' ? Math.sin(t * 9 + i) * 0.6 : 0;
        const r = Math.round(L.r + fl);
        lg.globalAlpha = L.k === 'win' ? 0.55 : 0.8;
        lg.drawImage(sprLum(r, L.k), Math.round(L.x - r), Math.round(L.y - r));
      }
      lg.globalAlpha = 1;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'multiply';
      g.drawImage(lum, 0, 0);
      // halos et reflets dans l'eau (ajout de lumière)
      g.globalCompositeOperation = 'lighter';
      g.setTransform(1, 0, 0, 1, -cx, -cy);
      for (const L of carte.lumieres) {
        if (L.k !== 'halo' && L.k !== 'neon' && L.k !== 'xmas' && L.k !== 'rose') continue;
        if (Math.abs(L.x - cx - V.w / 2) > V.w || Math.abs(L.y - cy - V.h / 2) > V.h) continue;
        g.globalAlpha = 0.28; const r = L.k === 'halo' ? 12 : 16;
        g.drawImage(sprLum(r, L.k), Math.round(L.x - r), Math.round(L.y - r));
      }
      for (const e of carte.eaux) for (const L of carte.lumieres) {
        if (L.k !== 'halo' || L.y > e.y || L.y < e.y - 260 || L.x < cx - 10 || L.x > cx + V.w + 10) continue;
        const dist = e.y - L.y;
        for (let i = 0; i < 9; i++) {
          const yy = e.y + 4 + i * 4 + Math.floor(dist / 12);
          const xx = Math.round(L.x + Math.sin(t * 2.5 + i * 1.3) * 2);
          g.globalAlpha = 0.5 - i * 0.05; g.fillStyle = '#ffcf80';
          g.fillRect(xx - 2 + (i % 2), yy, 4 - (i % 2) * 2, 1);
        }
      }
      for (let i = 0; i < carte.scintille.length; i++) {
        const [x, y] = carte.scintille[i];
        if (x < cx || x > cx + V.w || y < cy || y > cy + V.h || Math.sin(t * 2.2 + i * 1.7) < 0.3) continue;
        g.globalAlpha = 0.5; g.drawImage(sprLum(3, 'xmas'), x - 3, y - 3);
      }
      g.globalAlpha = 1;
    } else if (amb !== 'interieur') {
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(lum, 0, 0);
    }
    g.globalCompositeOperation = 'source-over';
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (amb !== 'interieur') g.drawImage(vignette, 0, 0);
    // bulle « ! » au-dessus d'Ismae quand on peut interagir
    g.setTransform(1, 0, 0, 1, -cx, -cy);
    if (cible && !J.bloque()) Entites.poser(g, Entites.SPR.bulle, J.joueur.x, J.joueur.y - Entites.SPR.ismae.down.idle.height + 1 - Math.round(Math.abs(Math.sin(t * 4)) * 2));
    if (debug) {
      g.lineWidth = 1;
      g.strokeStyle = 'rgba(255,60,60,0.8)'; carte.solides.forEach((s) => g.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1));
      g.strokeStyle = 'rgba(60,255,120,0.8)'; carte.zones.forEach((s) => g.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1));
      g.strokeStyle = 'rgba(80,160,255,0.9)'; carte.portes.forEach((s) => g.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1));
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (transition) {
      const a = transition.phase === 'out' ? transition.t / 0.32 : 1 - transition.t / 0.32;
      g.fillStyle = `rgba(10,6,18,${Math.max(0, Math.min(1, a))})`; g.fillRect(0, 0, V.w, V.h);
    }
    eg.drawImage(buf, 0, 0, V.w * V.s, V.h * V.s);
  }

  function boucle(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (actif && !J.enPause) update(dt);
    if (!J.enPause) render();
    image(boucle);
  }

  // ------------------------------------------------------------ démarrage
  J.init = (carteId, arrivee) => {
    ecran = $('ecran'); eg = ecran.getContext('2d');
    buf = PX.canvas(10, 10); bg = buf.getContext('2d');
    lum = PX.canvas(10, 10); lg = lum.getContext('2d');
    Entites.init();
    J.joueur = new Entites.Joueur(0, 0);
    J.georges = new Entites.Georges(0, 0);
    resize();
    addEventListener('resize', resize);
    initCommandes();
    placer(carteId, arrivee);
    image((n) => { last = n; image(boucle); });
  };
  J.demarrer = () => { actif = true; ecran.focus && ecran.focus(); };
  J.enPause = false;
  J.pause = (oui) => { J.enPause = oui; if (oui && J.relacher) J.relacher(); };
  J.V = V; J.cam = cam;
  return J;
})();
