// =====================================================================
//  entites.js — Ismae, Georges (qui suit Ismae), les autres chats,
//  les pigeons et les petites particules (cœurs, fumée, neige…)
// =====================================================================
'use strict';

const Entites = (() => {
  const SPR = {};
  const shadowCache = {};

  function init() {
    SPR.ismae = Sprites.person(CONFIG.ismae);
    SPR.georges = Sprites.cat('georges');
    SPR.pigeon = Sprites.pigeon();
    SPR.chats = {};
    SPR.coeur = PX.outline(PX.fromRows(['.r.r.', 'rrrrr', 'rRrrr', '.rrr.', '..r..'], { r: '#e8435a', R: '#ff9aa8' }), '#3a1426');
    SPR.bulle = PX.outline(PX.fromRows(['.wwwww.', 'wwwkwww', 'wwwkwww', 'wwwkwww', 'wwwwwww', 'wwwkwww', '.wwwww.', '..ww...', '..w....'],
      { w: '#fff8e8', k: '#c9483b' }), '#2a1a2e');
    SPR.z = PX.fromRows(['zzz', '.z.', 'zzz'], { z: '#dfe6ff' });
    SPR.question = PX.outline(PX.fromRows(['.wwwww.', 'wwkkkww', 'wwwwkww', 'wwwkkww', 'wwwkwww', 'wwwwwww', '.wwkww.', '..ww...', '..w....'],
      { w: '#fff8e8', k: '#3a5aa0' }), '#2a1a2e');
    SPR.notes = [['..oo.', '..o.o', '..o..', '..o..', 'ooo..', 'ooo..'], ['.oooo', '.o..o', '.o..o', '.o..o', 'oo.oo', 'oo.oo']]
      .map((r) => PX.outline(PX.fromRows(r, { o: '#ffe7a0' }), '#4a2a1a'));
    SPR.etoile = PX.fromRows(['.y.', 'yYy', '.y.'], { y: '#ffd24a', Y: '#fff6c0' });
    SPR.poses = Sprites.georgesPoses();
    SPR.chatons = {};
    // épreuve du bisou : couteau, bulle cœur, gros cœur du bisou
    SPR.couteau = PX.outline(PX.fromRows(['.wwwwwkkk', 'Wwwwwwkkk'], { w: '#c9cfda', W: '#ffffff', k: '#6a4228' }), '#2a1a2e');
    SPR.couteauG = PX.flipX(SPR.couteau);
    SPR.bulles = {
      '!': SPR.bulle, '?': SPR.question,
      coeur: PX.outline(PX.fromRows(['.wwwwwww.', 'wwrwwwrww', 'wrrrwrrrw', 'wrRrrrrrw', 'wwrrrrrww', 'wwwrrrwww', '.wwwrwww.', '..ww.....', '..w......'],
        { w: '#fff8e8', r: '#ff6f9a', R: '#ffc4d6' }), '#2a1a2e'),
    };
    SPR.grosCoeur = PX.outline(PX.fromRows(['.rr...rr.', 'rRrr.rrrr', 'rRrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'],
      { r: '#ff5c8a', R: '#ffc4d6' }), '#4a1630');
  }
  // Ismae en tablier de boucher (créé au premier besoin)
  function ismaeTablier() {
    return SPR.ismaeTablier || (SPR.ismaeTablier = Sprites.person(Object.assign({}, CONFIG.ismae, { tablier: CONFIG.tom.tablier, rayures: CONFIG.tom.rayures })));
  }
  function chat(name) { return SPR.chats[name] || (SPR.chats[name] = Sprites.cat(name)); }
  function chaton(name) { return SPR.chatons[name] || (SPR.chatons[name] = Sprites.chaton(name)); }

  // portraits affichés dans la boîte de dialogue
  const portraits = {};
  function portrait(qui) {
    if (portraits[qui]) return portraits[qui];
    if (qui === 'ismae') return SPR.ismae.down.idle;
    if (qui === 'georges') return SPR.georges.sit[0];
    if (qui === 'duchesse') return chat('duchesse').sit[0];
    if (['marie', 'toulouse', 'berlioz'].includes(qui)) return chaton(qui).sit[0];
    return null;
  }

  // déplacement le long d'une liste de points (sans collision : les chemins sont tracés dans des zones libres)
  function suivreChemin(e, dt) {
    const c = e.chemin && e.chemin[0];
    if (!c) return false;
    const dx = c.x - e.x, dy = c.y - e.y, d = Math.hypot(dx, dy), pas = e.vitesse * dt;
    if (d <= pas) { e.x = c.x; e.y = c.y; e.chemin.shift(); }
    else { e.x += (dx / d) * pas; e.y += (dy / d) * pas; }
    if (d > 0.01) e.dir = dirDe(dx, dy, e.dir);
    return true;
  }

  // ombre ronde sous les personnages
  function ombre(g, x, y, rx) {
    let c = shadowCache[rx];
    if (!c) {
      c = PX.canvas(rx * 2 + 1, 5);
      PX.painter(c).ellipse(rx, 2, rx, 2, 'rgba(22,10,40,0.38)');
      shadowCache[rx] = c;
    }
    g.drawImage(c, Math.round(x - rx), Math.round(y - 2));
  }
  // dessine une image avec ses pieds en (x, y)
  function poser(g, img, x, y) { g.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height + 2)); }

  function dirDe(dx, dy, prev) {
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return prev;
    return Math.abs(dx) > Math.abs(dy) * 1.05 ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  // saut de surprise : petit bond de 3 px pendant 0,35 s
  const hauteurSaut = (t) => (t > 0 ? -Math.round(Math.sin((t / 0.35) * Math.PI) * 3) : 0);

  // ------------------------------------------------------------ Ismae
  class Joueur {
    constructor(x, y, dir = 'down') {
      this.x = x; this.y = y; this.dir = dir;
      this.anim = 0; this.moving = false; this.blinkT = 2 + Math.random() * 3; this.blink = false; this.run = false;
      this.hb = { w: 10, h: 6 };
      // scènes : chemin imposé (sans collision), tenue ('tablier'), bulle, saut, couteau en main
      this.chemin = null; this.vitesse = 62; this.surFin = null; this.tenue = null; this.bulle = null; this.saut = 0; this.couteau = 0;
    }
    allerVers(points, vitesse, surFin) { this.chemin = points.map((p) => ({ x: p.x, y: p.y })); this.vitesse = vitesse || CONFIG.vitesseMarche; this.surFin = surFin || null; }
    dire(type, duree = 1.2) { this.bulle = { type, t: duree }; }
    update(dt, jeu) {
      if (this.bulle && (this.bulle.t -= dt) < 0) this.bulle = null;
      if (this.saut > 0) this.saut = Math.max(0, this.saut - dt);
      if (this.couteau > 0) this.couteau += dt;
      if (this.chemin) {
        this.run = this.vitesse > 80;
        if (suivreChemin(this, dt)) { this.moving = true; this.anim += dt * (this.run ? 11 : 7.5); }
        else { this.chemin = null; this.moving = false; this.anim = 0; const f = this.surFin; this.surFin = null; if (f) f(this); }
        return;
      }
      const inp = jeu.input;
      let dx = inp.x, dy = inp.y;
      const len = Math.hypot(dx, dy);
      if (jeu.bloque()) { dx = dy = 0; }
      this.moving = len > 0.15 && !jeu.bloque();
      this.run = this.moving && (inp.run || len > 0.97 && inp.analog);
      if (this.moving) {
        const n = Math.min(1, len);
        dx = (dx / len) * n; dy = (dy / len) * n;
        const sp = (this.run ? CONFIG.vitesseCourse : CONFIG.vitesseMarche) * (jeu.surEscalier(this) ? 0.75 : 1);
        this.dir = dirDe(dx, dy, this.dir);
        jeu.deplacer(this, dx * sp * dt, dy * sp * dt);
        this.anim += dt * (this.run ? 11 : 7.5);
      } else this.anim = 0;
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = true; if (this.blinkT < -0.12) { this.blink = false; this.blinkT = 2.5 + Math.random() * 3; } }
    }
    get sortY() { return this.y; }
    draw(g) {
      const set = (this.tenue === 'tablier' ? ismaeTablier() : SPR.ismae)[this.dir];
      const img = this.moving ? set.walk[Math.floor(this.anim) % 4] : this.blink ? set.blink : set.idle;
      const dy = hauteurSaut(this.saut);
      ombre(g, this.x, this.y, 6);
      poser(g, img, this.x, this.y + dy);
      // le couteau monte et descend sur la planche (de profil uniquement)
      if (this.couteau > 0 && (this.dir === 'left' || this.dir === 'right')) {
        const s = this.dir === 'left' ? -1 : 1, lame = s < 0 ? SPR.couteauG : SPR.couteau;
        const leve = Math.floor(this.couteau * 7) % 2 ? 3 : 0;
        g.drawImage(lame, Math.round(this.x + (s < 0 ? -13 : 3)), Math.round(this.y - 14 - leve + dy));
      }
      if (this.bulle) poser(g, SPR.bulles[this.bulle.type], this.x, this.y - img.height - 1 + dy);
    }
  }

  // ------------------------------------------------------------ personnages des épreuves (Tom, Loane, les animaux de Sherwood…)
  // o = { id, cfg, x, y, dir, visible, vitesse, dialogue, fixe (ne se retourne pas), lance (garde) }
  // pose : nom d'une suite d'images spéciales (le roi Jean qui boude, qui pleure…)
  class Perso {
    constructor(o) {
      Object.assign(this, { dir: 'down', visible: true, vitesse: 60 }, o);
      this.spr = o.cfg.espece ? Betes.perso(o.cfg) : Sprites.person(o.cfg);
      portraits[o.id] = this.spr.down.idle;
      this.anim = 0; this.marche = false; this.blinkT = Math.random() * 3; this.blink = false;
      this.chemin = null; this.surFin = null; this.bulle = null; this.saut = 0; this.pose = null; this.poseT = 0;
    }
    get sortY() { return this.sortYFixe ?? this.y; }
    allerVers(points, vitesse, surFin) { this.chemin = points.map((p) => ({ x: p.x, y: p.y })); if (vitesse) this.vitesse = vitesse; this.surFin = surFin || null; }
    regarder(x, y) { if (!this.fixe) this.dir = dirDe(x - this.x, y - this.y, this.dir); }
    dire(type, duree = 1.2) { this.bulle = { type, t: duree }; }
    update(dt) {
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = true; if (this.blinkT < -0.15) { this.blink = false; this.blinkT = 2.5 + Math.random() * 3; } }
      if (this.bulle && (this.bulle.t -= dt) < 0) this.bulle = null;
      if (this.saut > 0) this.saut = Math.max(0, this.saut - dt);
      this.poseT += dt;
      this.marche = false;
      if (!this.chemin) return;
      if (suivreChemin(this, dt)) { this.marche = true; this.anim += dt * Math.max(7, this.vitesse / 8); }
      else { this.chemin = null; const f = this.surFin; this.surFin = null; if (f) f(this); }
    }
    zone() {
      if (!this.visible || !this.dialogue) return null;
      return { x: this.x - 9, y: this.y - 14, w: 18, h: 18, dialogue: (jeu) => { this.regarder(jeu.joueur.x, jeu.joueur.y); return this.dialogue(jeu); } };
    }
    draw(g) {
      if (!this.visible) return;
      const set = this.spr[this.dir], poses = this.pose && this.spr.poses && this.spr.poses[this.pose];
      const img = poses ? poses[Math.floor(this.poseT * 3) % poses.length]
        : this.marche ? set.walk[Math.floor(this.anim) % 4] : this.blink ? set.blink : set.idle;
      const dy = hauteurSaut(this.saut);
      ombre(g, this.x, this.y, this.ombreR || 6);
      // la lance des gardes, tenue dans la main droite (derrière lui quand il s'éloigne)
      const lance = (devant) => {
        if (!this.lance || (this.dir === 'up') === devant) return;
        const lx = Math.round(this.x + (this.dir === 'left' ? -7 : this.dir === 'right' ? 4 : this.dir === 'up' ? -7 : 7)), ly = Math.round(this.y + dy);
        g.fillStyle = '#1d1626'; g.fillRect(lx - 1, ly - 41, 3, 39);
        g.fillStyle = '#8a5a32'; g.fillRect(lx, ly - 36, 1, 33);
        g.fillStyle = '#1d1626'; g.fillRect(lx - 2, ly - 44, 5, 6);
        g.fillStyle = '#c9cfda'; g.fillRect(lx - 1, ly - 43, 3, 4); g.fillRect(lx, ly - 45, 1, 2);
        g.fillStyle = '#ffffff'; g.fillRect(lx - 1, ly - 43, 1, 2);
      };
      lance(false);
      poser(g, img, this.x, this.y + dy);
      lance(true);
      if (this.bulle) poser(g, SPR.bulles[this.bulle.type], this.x, this.y - img.height - 1 + dy);
    }
  }

  // ------------------------------------------------------------ Georges
  // mode 'suivi' : marche dans les pas d'Ismae (comportement habituel)
  // mode 'script' : suit un chemin imposé par une scène (poursuite des chatons…)
  class Georges {
    constructor(x, y) {
      this.x = x; this.y = y; this.dir = 'down'; this.etat = 'assis';
      this.anim = 0; this.repos = 0; this.blinkT = 3; this.blink = false; this.reaction = 0;
      this.hb = { w: 8, h: 5 };
      this.mode = 'suivi'; this.chemin = null; this.vitesse = 50; this.pose = null; this.bulle = null; this.attente = 0; this.opts = {};
      this.cage = 0; this.h = 0; // forêt de Sherwood : 1 = dans la cage du roi Jean, 2 = cage ouverte ; h = porté au-dessus du sol
    }
    // opts.attendre : distance au-delà de laquelle Georges s'arrête pour attendre Ismae
    allerVers(points, vitesse, opts = {}) { this.mode = 'script'; this.chemin = points.map((p) => ({ x: p.x, y: p.y })); this.vitesse = vitesse; this.opts = opts; this.pose = null; }
    reprendreSuivi(jeu) {
      this.mode = 'suivi'; this.chemin = null; this.pose = null; this.opts = {}; this.texteScript = null;
      jeu.trace = [{ x: this.x, y: this.y }, { x: jeu.joueur.x, y: jeu.joueur.y }];
    }
    surprendre(type = '!') { this.bulle = { type, t: 1.1 }; }
    majScript(dt, jeu) {
      const j = jeu.joueur;
      // marge : il s'arrête quand Ismae est trop loin, et ne repart que quand il s'est bien rapproché
      const dj = Math.hypot(j.x - this.x, j.y - this.y);
      if (this.opts.attendre) {
        if (!this.attendIsmae && dj > this.opts.attendre) this.attendIsmae = true;
        else if (this.attendIsmae && dj < this.opts.attendre - 90) this.attendIsmae = false;
      } else this.attendIsmae = false;
      if (this.attendIsmae && this.chemin && this.chemin.length) {
        // Ismae est trop loin : Georges s'assoit, se retourne et l'appelle
        this.etat = 'assis'; this.dir = dirDe(j.x - this.x, j.y - this.y, this.dir);
        this.attente += dt;
        if (this.attente > 2.2) { this.attente = 0; this.surprendre('!'); Musique.miaou(1.05, 0.08); }
        this.anim += dt * 2;
        return;
      }
      this.attente = 0;
      if (suivreChemin(this, dt)) { this.etat = 'marche'; this.anim += dt * Math.max(10, this.vitesse / 6.5); }
      else if (!this.pose) { this.etat = 'assis'; this.anim += dt * 2; }
      else this.anim += dt * 6;
    }
    // cible = point de la trace d'Ismae situé à « distanceGeorges » derrière lui
    cible(trace) {
      const D = CONFIG.distanceGeorges;
      let acc = 0;
      for (let i = trace.length - 1; i > 0; i--) {
        const a = trace[i], b = trace[i - 1];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (acc + d >= D) { const t = (D - acc) / d; return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
        acc += d;
      }
      return trace[0];
    }
    update(dt, jeu) {
      if (this.bulle && (this.bulle.t -= dt) < 0) this.bulle = null;
      if (this.reaction > 0) this.reaction -= dt;
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = true; if (this.blinkT < -0.15) { this.blink = false; this.blinkT = 2 + Math.random() * 4; } }
      if (this.mode === 'script') { this.majScript(dt, jeu); return; }
      const j = jeu.joueur, t = this.cible(jeu.trace);
      const dx = t.x - this.x, dy = t.y - this.y, d = Math.hypot(dx, dy);
      const loinJ = Math.hypot(j.x - this.x, j.y - this.y);
      if (loinJ > 320) { this.x = t.x; this.y = t.y; }
      if (d > 0.6) {
        // s'il est resté loin (après une scène), il trottine plus vite pour rattraper Ismae
        const vmax = (j.run ? CONFIG.vitesseCourse : CONFIG.vitesseMarche) * (loinJ > 70 ? 2.2 : 1.25);
        const step = Math.min(d, Math.max(vmax * 0.35, Math.min(vmax, d * 7)) * dt);
        this.x += (dx / d) * step; this.y += (dy / d) * step;
        this.dir = dirDe(dx, dy, this.dir);
        this.anim += dt * (step / dt > 70 ? 13 : 9);
        this.etat = 'marche'; this.repos = 0;
      } else {
        this.repos += dt;
        if (this.etat === 'marche') {
          this.etat = 'assis';
          // en s'asseyant, Georges se tourne vers Ismae
          this.dir = dirDe(j.x - this.x, j.y - this.y, this.dir);
        }
        if (this.repos > 9 && this.etat === 'assis') this.etat = 'couche';
        this.anim += dt * 2;
      }
      if (this.etat === 'couche' && Math.random() < dt * 0.5) jeu.particule('z', this.x + 4, this.y - 12);
    }
    get sortY() { return this.y; }
    zone() { return { x: this.x - 10, y: this.y - 12, w: 20, h: 16, texte: this.texteScript || (this.mode === 'script' ? 'georgesPoursuite' : 'georges'), chat: this }; }
    draw(g) {
      const s = SPR.georges, y0 = this.y;
      if (this.h) this.y -= this.h; // porté dans sa cage : on le dessine plus haut, l'ombre reste au sol
      let img;
      if (this.pose) {
        // poses comiques : dos rond, poils hérissés (qui tremblent), chute sur le dos
        const cote = this.dir === 'left' ? 'L' : 'R';
        img = SPR.poses[this.pose + cote];
        const tremble = this.pose === 'herisse' ? (Math.floor(this.anim * 2) % 2 ? 1 : -1) : 0;
        ombre(g, this.x, this.y, 8);
        poser(g, img, this.x + tremble, this.y);
      } else if (this.etat === 'marche' && !this.cage) { // dans sa cage, il reste assis (même porté)
        const f = Math.floor(this.anim);
        img = this.dir === 'right' ? s.walkR[f % 4] : this.dir === 'left' ? s.walkL[f % 4] : this.dir === 'up' ? s.up[f % 2] : s.down[f % 2];
      } else if (this.etat === 'couche') img = s.sleep[Math.floor(this.anim * 0.5) % 2];
      else if ((this.dir === 'left' || this.dir === 'right') && !this.cage) img = (this.dir === 'right' ? s.sitR : s.sitL)[Math.floor(this.anim) % 2];
      else img = this.blink ? s.sitBlink : s.sit[Math.floor(this.anim) % 2];
      if (!this.pose) { ombre(g, this.x, y0, this.cage ? 10 : 6); poser(g, img, this.x, this.y); }
      if (this.cage) {
        const cg = SPR.cages || (SPR.cages = [null, Betes.cage(false), Betes.cage(true)]);
        poser(g, cg[this.cage], this.x, this.y + 3);
      }
      const haut = this.cage ? 24 : img.height;
      if (this.reaction > 0) poser(g, SPR.coeur, this.x, this.y - haut - 1 - Math.round(Math.sin(this.reaction * 8)));
      if (this.bulle) poser(g, this.bulle.type === '?' ? SPR.question : SPR.bulle, this.x, this.y - haut - 1 - (this.bulle.t > 0.9 ? 2 : 0));
      this.y = y0;
    }
  }

  // ------------------------------------------------------------ Duchesse et les chatons
  // o = { nom, adulte, x, y, dir, etat:'assis'|'marche'|'dosRond'|'rire', visible, vitesse }
  class ChatScript {
    constructor(o) {
      Object.assign(this, { dir: 'right', etat: 'assis', visible: true, vitesse: 60, aigu: o.adulte ? 1 : 1.35 }, o);
      this.spr = o.adulte ? chat(o.nom) : chaton(o.nom);
      this.anim = Math.random() * 4; this.blinkT = Math.random() * 3; this.blink = false; this.chemin = null; this.surFin = null;
    }
    allerVers(points, vitesse, surFin) { this.chemin = points.map((p) => ({ x: p.x, y: p.y })); if (vitesse) this.vitesse = vitesse; this.surFin = surFin || null; this.etat = 'marche'; }
    get sortY() { return this.y; }
    update(dt) {
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = true; if (this.blinkT < -0.15) { this.blink = false; this.blinkT = 2 + Math.random() * 4; } }
      if (this.chemin) {
        if (suivreChemin(this, dt)) { this.anim += dt * Math.max(this.adulte ? 9 : 12, this.vitesse / 7); return; }
        this.chemin = null; this.etat = 'assis';
        const f = this.surFin; this.surFin = null; if (f) f(this);
      }
      this.anim += dt * (this.etat === 'rire' ? 7 : this.etat === 'dosRond' ? 3 : 1.6);
    }
    zone() { return this.dialogue && this.visible ? { x: this.x - 10, y: this.y - 12, w: 20, h: 16, dialogue: this.dialogue, chat: this } : null; }
    draw(g) {
      if (!this.visible) return;
      const s = this.spr, f = Math.floor(this.anim), gauche = this.dir === 'left';
      let img;
      if (this.etat === 'marche') {
        if (this.adulte && (this.dir === 'up' || this.dir === 'down')) img = (this.dir === 'up' ? s.up : s.down)[f % 2];
        else img = (gauche ? s.walkL : s.walkR)[f % 4];
      } else if (this.etat === 'dosRond' && s.dosRondR) img = (gauche ? s.dosRondL : s.dosRondR)[f % 2];
      else if (this.etat === 'rire' && s.rire) img = s.rire[f % 2];
      else img = this.blink ? s.sitBlink : s.sit[f % 2];
      ombre(g, this.x, this.y, this.adulte ? 6 : 5);
      poser(g, img, this.x, this.y);
    }
  }

  // ------------------------------------------------------------ chats musiciens
  class Musicien {
    constructor(o) {
      Object.assign(this, o);
      this.frames = Sprites.musicien(o.type);
      portraits[o.id] = this.frames[0];
      this.noteT = Math.random() * 2;
    }
    get sortY() { return this.sortYFixe ?? this.y; }
    update(dt, jeu) {
      this.noteT -= dt;
      if (this.noteT < 0) { this.noteT = 1.2 + Math.random() * 1.8; jeu.particule('note', this.x + (this.type === 'trompette' ? 8 : 0), this.y - 26, { vy: -12, vx: 3, max: 1.8, v: Math.random() < 0.5 ? 0 : 1 }); }
    }
    zone() { return { x: this.x - 12, y: this.y - 10, w: 24, h: 30, dialogue: this.dialogue }; }
    draw(g) {
      const tps = Musique.temps() + (this.decalage || 0);
      const f = ((Math.floor(tps * (this.type === 'batterie' ? 2 : 1)) % 4) + 4) % 4;
      poser(g, this.frames[f], this.x, this.y);
    }
  }

  // ------------------------------------------------------------ habitants
  // o = { id, cfg (apparence), x, y, chemin: [{x,y}…] (boucle) ou rien, vitesse, dialogue }
  class Passant {
    constructor(o) {
      Object.assign(this, { dir: 'down', vitesse: 20, bloquant: true }, o);
      this.spr = Sprites.person(o.cfg);
      portraits[o.id] = this.spr.down.idle;
      this.i = 0; this.pause = Math.random() * 2; this.anim = 0; this.marche = false; this.blinkT = Math.random() * 3; this.blink = false; this.parle = 0;
      this.hb = { w: 10, h: 5 };
    }
    get sortY() { return this.y; }
    regarder(x, y) { this.dir = dirDe(x - this.x, y - this.y, this.dir); this.parle = 3; }
    update(dt, jeu) {
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = true; if (this.blinkT < -0.15) { this.blink = false; this.blinkT = 2.5 + Math.random() * 3; } }
      this.marche = false;
      if (this.parle > 0) { this.parle -= dt; return; }
      if (!this.chemin) { if (this.regardeDefaut) this.dir = this.regardeDefaut; return; }
      if (this.pause > 0) { this.pause -= dt; return; }
      const c = this.chemin[this.i];
      const dx = c.x - this.x, dy = c.y - this.y, d = Math.hypot(dx, dy);
      // on ne bouscule pas Ismae : on attend qu'il passe
      const j = jeu.joueur;
      if (d > 0.5) {
        const nx = dx / d, ny = dy / d;
        const devant = (j.x - this.x) * nx + (j.y - this.y) * ny;
        if (devant > 0 && devant < 18 && Math.abs((j.x - this.x) * ny - (j.y - this.y) * nx) < 10) return;
      }
      const pas = this.vitesse * dt;
      if (d <= pas) {
        this.x = c.x; this.y = c.y; this.i = (this.i + 1) % this.chemin.length;
        if (c.pause) { this.pause = c.pause; if (c.regard) this.dir = c.regard; }
      } else {
        this.x += (dx / d) * pas; this.y += (dy / d) * pas;
        this.dir = dirDe(dx, dy, this.dir); this.marche = true; this.anim += dt * 6;
      }
    }
    zone() {
      return { x: this.x - 9, y: this.y - 14, w: 18, h: 18, dialogue: (jeu) => { this.regarder(jeu.joueur.x, jeu.joueur.y); return this.dialogue(jeu); } };
    }
    draw(g) {
      const set = this.spr[this.dir];
      const img = this.marche ? set.walk[Math.floor(this.anim) % 4] : this.blink ? set.blink : set.idle;
      ombre(g, this.x, this.y, 6);
      poser(g, img, this.x, this.y);
    }
  }

  // ------------------------------------------------------------ autres chats
  // o = { nom, x, y, mode:'assis'|'cote'|'dort'|'promeneur'|'joueur', flip, texte, sortY, x1, x2, zone:[x,y,w,h] }
  class ChatPNJ {
    constructor(o) {
      Object.assign(this, { mode: 'assis', flip: false, vitesse: 14 }, o);
      this.spr = chat(o.nom);
      this.anim = Math.random() * 4; this.t = 2 + Math.random() * 3; this.blinkT = Math.random() * 3; this.blink = false;
      this.marche = this.mode === 'promeneur'; this.vx = this.flip ? -1 : 1; this.cx = o.x; this.cy = o.y; this.dx = 0; this.dy = 0;
    }
    get sortY() { return this.sortYFixe ?? this.y; }
    update(dt, jeu) {
      this.anim += dt * (this.marche ? 8 : 1.6);
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = true; if (this.blinkT < -0.15) { this.blink = false; this.blinkT = 2 + Math.random() * 4; } }
      this.t -= dt;
      if (this.mode === 'promeneur') {
        if (this.marche) {
          this.x += this.vx * this.vitesse * dt;
          if (this.x < this.x1) { this.x = this.x1; this.vx = 1; }
          if (this.x > this.x2) { this.x = this.x2; this.vx = -1; }
          if (this.t < 0) { this.marche = false; this.t = 2 + Math.random() * 4; }
        } else if (this.t < 0) { this.marche = true; this.t = 4 + Math.random() * 6; if (Math.random() < 0.4) this.vx *= -1; }
      } else if (this.mode === 'joueur') {
        if (this.marche) {
          const ddx = this.tx - this.x, ddy = this.ty - this.y, d = Math.hypot(ddx, ddy);
          if (d < 1) { this.marche = false; this.t = 1.5 + Math.random() * 3; }
          else { this.x += (ddx / d) * 22 * dt; this.y += (ddy / d) * 22 * dt; this.dx = ddx; this.dy = ddy; }
        } else if (this.t < 0) {
          this.tx = this.cx + (Math.random() - 0.5) * (this.rx || 40); this.ty = this.cy + (Math.random() - 0.5) * (this.ry || 20); this.marche = true;
        }
      } else if (this.mode === 'dort' && Math.random() < dt * 0.4) jeu.particule('z', this.x + 4, this.y - 10);
    }
    zone() {
      if (this.zoneFixe) { const [x, y, w, h] = this.zoneFixe; return { x, y, w, h, texte: this.texte, chat: this }; }
      return { x: this.x - 11, y: this.y - 12, w: 22, h: 16, texte: this.texte, chat: this };
    }
    draw(g) {
      const s = this.spr;
      let img;
      const f = Math.floor(this.anim);
      if (this.mode === 'promeneur') img = this.marche ? (this.vx > 0 ? s.walkR : s.walkL)[f % 4] : (this.vx > 0 ? s.sitR : s.sitL)[f % 2];
      else if (this.mode === 'joueur') img = this.marche ? (Math.abs(this.dx) > Math.abs(this.dy) ? (this.dx > 0 ? s.walkR : s.walkL)[f % 4] : this.dy > 0 ? s.down[f % 2] : s.up[f % 2]) : (this.blink ? s.sitBlink : s.sit[f % 2]);
      else if (this.mode === 'dort') img = s.sleep[f % 2];
      else if (this.mode === 'cote') img = (this.flip ? s.sitL : s.sitR)[f % 2];
      else img = this.blink ? s.sitBlink : s.sit[f % 2];
      if (!this.sansOmbre) ombre(g, this.x, this.y, 6);
      poser(g, img, this.x, this.y);
    }
  }

  // ------------------------------------------------------------ pigeons
  class Pigeon {
    constructor(x, y, aire) {
      this.aire = aire; this.x = x; this.y = y; this.etat = 'sol'; this.t = Math.random() * 2;
      this.flip = Math.random() < 0.5; this.peck = false; this.alpha = 1; this.h = 0;
    }
    get sortY() { return this.etat === 'sol' ? this.y : 99999; }
    update(dt, jeu) {
      this.t -= dt;
      if (this.etat === 'sol') {
        const near = [jeu.joueur, jeu.georges].some((e) => e && Math.hypot(e.x - this.x, e.y - this.y) < 30);
        if (near) { this.etat = 'vol'; this.vx = (this.x > jeu.joueur.x ? 1 : -1) * (35 + Math.random() * 25); this.flip = this.vx < 0; this.t = 2.2; return; }
        if (this.t < 0) {
          const r = Math.random();
          if (r < 0.5) { this.peck = !this.peck; this.t = 0.25 + Math.random() * 0.6; }
          else { this.peck = false; this.tx = this.x + (Math.random() - 0.5) * 16; this.t = 0.8; this.flip = this.tx < this.x; }
        }
        if (this.tx !== undefined && Math.abs(this.tx - this.x) > 0.5 && !this.peck) this.x += Math.sign(this.tx - this.x) * 8 * dt;
      } else if (this.etat === 'vol') {
        this.x += this.vx * dt; this.h += 45 * dt; this.alpha = Math.max(0, this.t / 2.2);
        if (this.t < 0) { this.etat = 'parti'; this.t = 9 + Math.random() * 8; }
      } else if (this.t < 0) {
        const [ax, ay, aw, ah] = this.aire;
        const nx = ax + Math.random() * aw, ny = ay + Math.random() * ah;
        if (Math.hypot(jeu.joueur.x - nx, jeu.joueur.y - ny) > 90) { this.x = nx; this.y = ny; this.h = 0; this.alpha = 1; this.etat = 'sol'; this.tx = undefined; }
        else this.t = 3;
      }
    }
    draw(g) {
      if (this.etat === 'parti') return;
      const s = SPR.pigeon;
      let k = this.etat === 'vol' ? (Math.floor(this.t * 12) % 2 ? 'fly1' : 'fly2') : this.peck ? 'peck' : 'stand';
      if (this.flip) k += 'L';
      g.globalAlpha = this.alpha;
      if (this.etat === 'sol') ombre(g, this.x, this.y, 3);
      poser(g, s[k], this.x, this.y - this.h);
      g.globalAlpha = 1;
    }
  }

  return { init, SPR, Joueur, Georges, ChatPNJ, ChatScript, Musicien, Passant, Perso, Pigeon, ombre, poser, chat, chaton, portrait, portraits, suivreChemin, dirDe };
})();
