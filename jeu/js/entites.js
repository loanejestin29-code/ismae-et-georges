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
  }
  function chat(name) { return SPR.chats[name] || (SPR.chats[name] = Sprites.cat(name)); }

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

  // ------------------------------------------------------------ Ismae
  class Joueur {
    constructor(x, y, dir = 'down') {
      this.x = x; this.y = y; this.dir = dir;
      this.anim = 0; this.moving = false; this.blinkT = 2 + Math.random() * 3; this.blink = false; this.run = false;
      this.hb = { w: 10, h: 6 };
    }
    update(dt, jeu) {
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
      const set = SPR.ismae[this.dir];
      const img = this.moving ? set.walk[Math.floor(this.anim) % 4] : this.blink ? set.blink : set.idle;
      ombre(g, this.x, this.y, 6);
      poser(g, img, this.x, this.y);
    }
  }

  // ------------------------------------------------------------ Georges
  class Georges {
    constructor(x, y) {
      this.x = x; this.y = y; this.dir = 'down'; this.etat = 'assis';
      this.anim = 0; this.repos = 0; this.blinkT = 3; this.blink = false; this.reaction = 0;
      this.hb = { w: 8, h: 5 };
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
      const j = jeu.joueur, t = this.cible(jeu.trace);
      const dx = t.x - this.x, dy = t.y - this.y, d = Math.hypot(dx, dy);
      if (Math.hypot(j.x - this.x, j.y - this.y) > 90) { this.x = t.x; this.y = t.y; }
      if (d > 0.6) {
        const vmax = (j.run ? CONFIG.vitesseCourse : CONFIG.vitesseMarche) * 1.25;
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
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = true; if (this.blinkT < -0.15) { this.blink = false; this.blinkT = 2 + Math.random() * 4; } }
      if (this.reaction > 0) this.reaction -= dt;
      if (this.etat === 'couche' && Math.random() < dt * 0.5) jeu.particule('z', this.x + 4, this.y - 12);
    }
    get sortY() { return this.y; }
    zone() { return { x: this.x - 10, y: this.y - 12, w: 20, h: 16, texte: 'georges', chat: this }; }
    draw(g) {
      const s = SPR.georges;
      let img;
      if (this.etat === 'marche') {
        const f = Math.floor(this.anim);
        img = this.dir === 'right' ? s.walkR[f % 4] : this.dir === 'left' ? s.walkL[f % 4] : this.dir === 'up' ? s.up[f % 2] : s.down[f % 2];
      } else if (this.etat === 'couche') img = s.sleep[Math.floor(this.anim * 0.5) % 2];
      else if (this.dir === 'left' || this.dir === 'right') img = (this.dir === 'right' ? s.sitR : s.sitL)[Math.floor(this.anim) % 2];
      else img = this.blink ? s.sitBlink : s.sit[Math.floor(this.anim) % 2];
      ombre(g, this.x, this.y, 6);
      poser(g, img, this.x, this.y);
      if (this.reaction > 0) poser(g, SPR.coeur, this.x, this.y - img.height - 1 - Math.round(Math.sin(this.reaction * 8)));
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

  return { init, SPR, Joueur, Georges, ChatPNJ, Pigeon, ombre, poser, chat };
})();
