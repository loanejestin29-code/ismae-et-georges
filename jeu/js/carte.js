// =====================================================================
//  carte.js — outil pour construire une carte : sol pré-dessiné,
//  objets triés en profondeur, collisions, zones d'interaction,
//  portes, lumières… (utilisé par carte-rue.js et carte-superette.js)
// =====================================================================
'use strict';

class Carte {
  constructor(id, w, h, opts = {}) {
    this.id = id; this.w = w; this.h = h;
    this.sol = PX.canvas(w, h); this.P = PX.painter(this.sol);
    this.ombre = PX.canvas(w, h); this.O = PX.painter(this.ombre);
    this.objets = [];     // dessinés triés par profondeur (sortY)
    this.dessus = [];     // dessinés au-dessus de tout (linge, guirlandes…)
    this.solides = [];    // rectangles de collision
    this.zones = [];      // zones d'interaction { x, y, w, h, texte }
    this.portes = [];     // { x, y, w, h, vers, arrivee, sens }
    this.lumieres = [];   // { x, y, r, k }
    this.scintille = [];  // ampoules qui clignotent [x, y]
    this.fumees = [];     // sorties de cheminée
    this.eaux = [];       // rectangles d'eau animée
    this.pnj = [];        // chats, pigeons… (créés par la carte)
    this.dynamiques = []; // objets animés spéciaux (portes automatiques…)
    this.ambiance = opts.ambiance || 'soir';
    this.fond = opts.fond || '#0d0a14';
    this.arrivees = opts.arrivees || {};
  }

  solide(x, y, w, h) { this.solides.push({ x, y, w, h }); }
  zone(x, y, w, h, texte, extra = {}) { this.zones.push(Object.assign({ x, y, w, h, texte }, extra)); }
  lumiere(x, y, r, k = 'lamp') { this.lumieres.push({ x, y, r, k }); }

  // pose un objet ; (x, y) = point au sol
  objet(def, x, y, o = {}) {
    const ob = { img: def.img, x: Math.round(x - def.ax), y: Math.round(y - def.ay), sortY: y + (o.dy || 0), def };
    this.objets.push(ob);
    if (o.solide) { const [dx, dy, w, h] = o.solide; this.solide(x + dx, y + dy, w, h); }
    if (o.ombre) {
      const [rx, ry] = o.ombre;
      this.O.ellipse(x + (o.ombreDx ?? 1), y - (o.ombreDy ?? 0), rx, ry, '#000');
    }
    if (o.texte) {
      const zw = o.zw || 22, zh = o.zh || 16;
      this.zone(x - zw / 2, y - zh + 4, zw, zh, o.texte);
    }
    if (def.light && o.lumiere !== false) this.lumiere(x + def.light.dx, y + def.light.dy, o.rayon || 64, o.k || 'lamp');
    if (def.twinkles) def.twinkles.forEach(([tx, ty]) => this.scintille.push([ob.x + tx, ob.y + ty]));
    return ob;
  }

  // pose un immeuble dont la façade touche le sol en baseY
  batiment(b, x, baseY, o = {}) {
    const ob = { img: b.img, x, y: baseY - b.h, sortY: baseY, b };
    this.objets.push(ob);
    const top = baseY - b.h + b.roofY + 10;
    this.solide(x, top, b.w, baseY - top);
    const y0 = baseY - b.h;
    b.lights.forEach((l) => this.lumiere(x + l.x, y0 + l.y, l.r, l.k));
    b.smoke.forEach(([sx, sy]) => this.fumees.push({ x: x + sx, y: y0 + sy, t: Math.random() * 2 }));
    // ombre de contact au pied de la façade
    if (o.ombrePied !== false) for (let k = 0; k < 4; k++) this.O.dither(x, baseY + k, b.w, 1, '#000', 14 - k * 4);
    ob.x0 = x; ob.base = baseY;
    return ob;
  }

  dessusImg(img, x, y) { this.dessus.push({ img, x: Math.round(x), y: Math.round(y) }); }

  porte(x, y, w, h, vers, arrivee, sens) { this.portes.push({ x, y, w, h, vers, arrivee, sens }); }

  // fusionne le calque d'ombres (teinte violette, semi-transparente) dans le sol
  finaliser(alpha = 0.34) {
    const tint = PX.silhouette(this.ombre, '#1b1030');
    const g = this.sol.getContext('2d');
    g.globalAlpha = alpha;
    g.drawImage(tint, 0, 0);
    g.globalAlpha = 1;
    this.ombre = null; this.O = null;
    this.objets.sort((a, b) => a.sortY - b.sortY);
  }
}
