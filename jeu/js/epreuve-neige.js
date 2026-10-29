// =====================================================================
//  epreuve-neige.js — ÉPREUVE 3 : « Le bonhomme de neige » (à Arendelle)
//
//  1. Après la forêt de Sherwood, Ismae et Georges arrivent à Arendelle. Olaf vient à leur
//     rencontre : il voudrait construire un ami, mais il lui manque tout.
//  2. Les sept éléments, à trouver en explorant et en parlant aux habitants :
//       · la grosse boule : à pousser au bord du lac (elle grossit en roulant) ;
//       · la boule moyenne : pareil, dans la clairière des sapins ;
//       · la petite boule : Anna la donne (elle se promène dans le village) ;
//       · les cuillères (les yeux) : chez Oaken ;
//       · les branches (bras et nez) : Sven les garde… il les lâche contre une carotte (chez Oaken) ;
//       · les cailloux (boutons) : trois petits cailloux noirs cachés dans le village ;
//       · l'écharpe noire : accrochée en haut de la fontaine gelée du château ; Georges grimpe la chercher.
//     Un petit inventaire, en haut de l'écran, montre ce qu'on a trouvé.
//  3. Tout trouvé : on retourne voir Olaf, et le mini-jeu d'assemblage commence (assemblage.js).
//  4. Jack Snow est fini : Olaf est ravi, Elsa lui donne vie quelques secondes, puis le troisième indice.
//  5. L'arrêt de bus, à la sortie d'Arendelle (sud-est), annonce la quatrième épreuve (pas encore faite).
// =====================================================================
'use strict';

const EpreuveNeige = (() => {
  const Q = Scenes.quete;
  Q.neige = 'aVenir'; // 'aVenir' → 'arrivee' → 'quete' → 'assemblage' → 'victoire' → 'gagne'
  const inv = { grosse: false, moyenne: false, petite: false, cuilleres: false, branches: false, cailloux: 0, echarpe: false };
  let carotte = false, oakenVu = false, toutAnnonce = false, annonce = false;
  const B = () => CONFIG.arendelle;
  const F = () => Jeu.carte.neige3;
  const $ = (id) => document.getElementById(id);
  const ORDRE = ['grosse', 'moyenne', 'petite', 'cuilleres', 'branches', 'cailloux', 'echarpe'];
  const OU = {
    grosse: 'la grosse boule, à rouler au bord du lac', moyenne: 'la boule moyenne, dans la clairière des sapins', petite: 'la petite boule, demande à Anna',
    cuilleres: 'les cuillères, chez Oaken', branches: 'les branches de Sven, près de l\'écurie', cailloux: 'des petits cailloux noirs, dans le village', echarpe: 'l\'écharpe noire, vers le château',
  };
  const complet = (k) => (k === 'cailloux' ? inv.cailloux >= 3 : inv[k]);
  const toutTrouve = () => ORDRE.every(complet);

  // répliques : avant (Olaf pas encore rencontré), pendant (la quête), après (Jack Snow construit)
  function repliques(id) {
    const r = CONFIG.repliques[id];
    if (!r) return null;
    const moment = ['quete', 'assemblage'].includes(Q.neige) ? 'pendant' : ['victoire', 'gagne'].includes(Q.neige) ? 'apres' : 'avant';
    return r[moment] || (moment === 'apres' ? r.pendant : r.avant) || r.avant || r.pendant || r.apres;
  }

  // ------------------------------------------------------------ le petit inventaire (en haut à gauche)
  const ICONES = {};
  function icone(k) {
    if (ICONES[k]) return ICONES[k];
    const c = PX.canvas(16, 16), P = PX.painter(c), N1 = '#f4f8ff', N2 = '#c8d6ea', N3 = '#8aa0c0';
    const boule = (r) => { P.ellipse(8, 9, r + 1, r + 1, N3); P.ellipse(8, 9, r, r, N2); P.ellipse(7, 8, r - 1, r - 1, N1); P.px(7 - Math.round(r / 2), 8 - Math.round(r / 2), '#ffffff'); };
    if (k === 'grosse') boule(6); else if (k === 'moyenne') boule(4); else if (k === 'petite') boule(3);
    else if (k === 'cuilleres') for (const x of [5, 10]) { P.rect(x - 1, 3, 3, 5, '#c8ccd8'); P.px(x - 1, 3, '#ffffff'); P.vline(x, 8, 6, '#8a8a9a'); }
    else if (k === 'branches') { Objets.line(P, 2, 13, 13, 3, '#6a4428'); Objets.line(P, 7, 8, 4, 4, '#6a4428'); Objets.line(P, 10, 6, 14, 8, '#6a4428'); }
    else if (k === 'cailloux') for (const [x, y] of [[5, 6], [10, 8], [6, 11]]) { P.rect(x - 1, y - 1, 3, 3, '#2a2632'); P.px(x - 1, y - 1, '#5a5668'); }
    else { P.rect(2, 4, 12, 3, '#1d1a22'); P.hline(2, 4, 12, '#4a4658'); P.rect(9, 7, 3, 7, '#1d1a22'); for (let x = 9; x < 12; x++) P.px(x, 14 + (x % 2), '#1d1a22'); }
    return (ICONES[k] = c);
  }
  function majInventaire() {
    const boite = $('inventaire');
    if (!boite) return;
    boite.hidden = Q.neige !== 'quete';
    if (!boite.hidden && $('aide')) $('aide').hidden = true; // l'aide du début laisse la place à l'inventaire
    if (!boite.childElementCount) {
      for (const k of ORDRE) {
        const s = document.createElement('span'); s.className = 'inv-case'; s.dataset.k = k; s.title = B().elements[k];
        const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; cv.className = 'pixel'; cv.getContext('2d').drawImage(icone(k), 0, 0);
        const n = document.createElement('b'); n.className = 'inv-nb';
        s.append(cv, n); boite.append(s);
      }
    }
    for (const s of boite.children) {
      const k = s.dataset.k;
      s.classList.toggle('ok', complet(k));
      s.querySelector('.inv-nb').textContent = k === 'cailloux' && inv.cailloux > 0 && inv.cailloux < 3 ? `${inv.cailloux}/3` : '';
    }
  }
  let tToast = null;
  function toast(k, texte) {
    const t = $('toast');
    if (!t) return;
    t.textContent = texte;
    t.hidden = false; t.classList.remove('arrive'); void t.offsetWidth; t.classList.add('arrive');
    clearTimeout(tToast); tToast = setTimeout(() => { t.hidden = true; }, 2600);
    const s = document.querySelector(`.inv-case[data-k="${k}"]`);
    if (s) { s.classList.remove('nouveau'); void s.offsetWidth; s.classList.add('nouveau'); }
  }
  function obtenir(k, J) {
    if (k === 'cailloux') inv.cailloux = Math.min(3, inv.cailloux + 1); else inv[k] = true;
    Musique.trouve();
    majInventaire();
    toast(k, k === 'cailloux' ? `Caillou ${inv.cailloux}/3 !` : `Trouvé : ${B().elements[k].toLowerCase()} !`);
    if (toutTrouve() && !toutAnnonce) { toutAnnonce = true; annonce = true; } // annoncé dès que la scène en cours est finie
  }

  // ------------------------------------------------------------ les boules de neige à pousser
  // elles grossissent en roulant sur la neige (pas sur la glace) ; une fois assez grosses, elles partent vers la place
  class Boule {
    constructor(id, x, y, cible) { Object.assign(this, { id, x, y, cible, r: 4, rMax: id === 'grosse' ? 13 : 10, parcouru: 0, fini: false, alpha: 1, coince: 0, trace: [], bloquant: true }); }
    get sortY() { return this.y + 4; } // devant Ismae quand il la pousse de côté
    update(dt, J) {
      for (const q of this.trace) q.t += dt;
      while (this.trace.length && this.trace[0].t > 14) this.trace.shift();
      if (this.fini) { this.bloquant = false; this.alpha = Math.max(0, this.alpha - dt * 1.5); return; }
      if (Q.neige !== 'quete' || J.bloque() || inv[this.id]) return;
      const p = J.joueur, inp = J.input, l = Math.hypot(inp.x, inp.y);
      if (l < 0.15) { this.coince = 0; return; }
      const ux = inp.x / l, uy = inp.y / l, dx = this.x - p.x, dy = this.y - 2 - p.y, d = Math.hypot(dx, dy);
      if (d > this.r + 13 || (dx * ux + dy * uy) / (d || 1) < 0.5) return;
      // la boule roule juste devant Ismae, à sa vitesse
      const ecart = this.r + 8, tx = p.x + ux * ecart, ty = p.y + 2 + uy * ecart, mx = tx - this.x, my = ty - this.y, md = Math.hypot(mx, my);
      if (md < 0.3) return;
      const pas = Math.min(md, 200 * dt), nx = this.x + (mx / md) * pas, ny = this.y + (my / md) * pas;
      if (!J.libre(nx, ny) || !J.libre(nx + ux * this.r, ny + uy * this.r * 0.5)) {
        this.coince += dt;
        if (this.coince > 1.2) { this.coince = -3; J.dire(B().bouleCoincee); }
        return;
      }
      this.coince = Math.min(this.coince, 0);
      const m = Math.hypot(nx - this.x, ny - this.y);
      this.x = nx; this.y = ny;
      if (!J.surGlace(this)) {
        this.parcouru += m;
        this.r = Math.round(4 + (this.rMax - 4) * Math.min(1, this.parcouru / this.cible));
        if (!this.trace.length || Math.hypot(this.x - this.trace[this.trace.length - 1].x, this.y - this.trace[this.trace.length - 1].y) > 3) this.trace.push({ x: this.x, y: this.y, r: this.r, t: 0 });
      }
      if (this.parcouru >= this.cible) {
        this.fini = true;
        obtenir(this.id, J);
        J.dire(B()[this.id === 'grosse' ? 'bouleGrosse' : 'bouleMoyenne']);
      }
    }
    zone() {
      if (this.fini || inv[this.id]) return null;
      return { x: this.x - this.r - 4, y: this.y - this.r * 2 - 2, w: this.r * 2 + 8, h: this.r * 2 + 6, dialogue: () => (Q.neige === 'quete' ? B().bouleDebut : ['Une petite boule de neige.']) };
    }
    draw(g) {
      for (const q of this.trace) { g.globalAlpha = Math.max(0, 0.35 - q.t / 40); g.fillStyle = '#b8c6da'; g.fillRect(Math.round(q.x - q.r * 0.6), Math.round(q.y), Math.max(2, Math.round(q.r * 1.2)), 2); }
      if (this.alpha <= 0) { g.globalAlpha = 1; return; }
      g.globalAlpha = this.alpha;
      const r = this.r, x = Math.round(this.x), y = Math.round(this.y - r);
      Entites.ombre(g, this.x, this.y, Math.max(3, r));
      const cercle = (rr, col, ox = 0, oy = 0) => { g.fillStyle = col; for (let j = -rr; j <= rr; j++) { const w = Math.round(Math.sqrt(rr * rr - j * j)); g.fillRect(x + ox - w, y + oy + j, w * 2 + 1, 1); } };
      cercle(r + 1, '#8aa0c0'); cercle(r, '#c8d6ea'); cercle(Math.max(1, r - 1), '#f4f8ff', -1, -1); g.fillStyle = '#ffffff'; g.fillRect(x - Math.round(r / 2), y - Math.round(r / 2), 2, 1);
      g.globalAlpha = 1;
    }
  }

  // ------------------------------------------------------------ arrivée à Arendelle, rencontre avec Olaf
  function entree(J) {
    Musique.morceau('arendelle');
    const S = F();
    if (!S.boules) {
      S.boules = [new Boule('grosse', S.bouleLac.x, S.bouleLac.y, 190), new Boule('moyenne', S.bouleClairiere.x, S.bouleClairiere.y, 150)];
      J.carte.pnj.push(...S.boules);
      installerObjets(J);
    }
    majInventaire();
    // reprise d'une partie après l'épreuve : Jack Snow est sur la place, Olaf à côté de lui
    if (Q.neige === 'gagne' && !S.jackObj) {
      installerJack(J);
      Object.assign(S.olaf, { visible: true, x: S.jack.x + 24, y: S.jack.y + 6, dir: 'left', chemin: null });
    }
    if (Q.neige !== 'aVenir') return;
    Q.neige = 'arrivee';
    const p = J.joueur, o = S.olaf;
    J.cinematique = true;
    J.jouerScript([
      { attendre: 0.6 },
      { dire: B().arrivee },
      { faire: () => { o.visible = true; o.x = p.x + 130; o.y = p.y - 50; o.allerVers([{ x: p.x + 60, y: p.y - 30 }, { x: p.x + 22, y: p.y - 6 }], 56, (q) => q.regarder(p.x, p.y)); Musique.miaou(1.6, 0.05); } },
      { attendre: 0.8 },
      { faire: () => { p.dir = 'right'; p.dire('!', 1); J.georges.surprendre('!'); } },
      { jusqua: () => !o.chemin },
      { dire: B().rencontre.slice(0, 1) },
      { faire: () => { o.allerVers([{ x: J.georges.x + 10, y: J.georges.y }], 40); } },
      { jusqua: () => !o.chemin },
      { faire: () => { J.georges.reaction = 2; for (let k = 0; k < 4; k++) J.particule('coeur', J.georges.x + (k - 1.5) * 5, J.georges.y - 14, { vy: -14 - k * 3, max: 1.3 }); Musique.miaou(1.1, 0.1); } },
      { dire: B().rencontre.slice(1, 2) },
      { faire: () => { o.allerVers([{ x: p.x + 22, y: p.y - 6 }], 40, (q) => q.regarder(p.x, p.y)); } },
      { jusqua: () => !o.chemin },
      { dire: B().rencontre.slice(2, -1) },
      { faire: () => { Q.neige = 'quete'; majInventaire(); const s = document.querySelector('#inventaire'); if (s) { s.classList.remove('arrive'); void s.offsetWidth; s.classList.add('arrive'); } } },
      { dire: B().rencontre.slice(-1) },
      { faire: () => { const P0 = F().olafPlace; o.allerVers([{ x: 820, y: o.y - 60 }, { x: 820, y: 880 }, { x: 860, y: 820 }, P0], 46, (q) => { q.dir = 'down'; }); } },
    ], () => { J.cinematique = false; });
  }
  function entreeOaken(J) {
    if (oakenVu) return;
    oakenVu = true;
    J.jouerScript([{ attendre: 0.4 }, { dire: B().oakenEntree }]);
  }

  // les cailloux qui brillent, l'écharpe sur la fontaine, le tas de branches de Sven
  function installerObjets(J) {
    const S = F(), C = J.carte;
    S.cailloux.forEach((c, k) => {
      const obj = { pris: false, sortY: c.y,
        draw(g, j) {
          if (this.pris) return;
          g.fillStyle = '#2a2632'; g.fillRect(c.x - 1, c.y - 2, 3, 2); g.fillStyle = '#5a5668'; g.fillRect(c.x - 1, c.y - 2, 1, 1);
          g.fillStyle = '#eef3fb'; g.fillRect(c.x - 2, c.y, 5, 1);
          if (Math.sin((j.t || 0) * 2.4 + k * 2) > 0.85) { g.fillStyle = '#ffffff'; g.fillRect(c.x, c.y - 5, 1, 1); g.fillRect(c.x - 1, c.y - 4, 3, 1); g.fillRect(c.x, c.y - 3, 1, 1); }
        } };
      C.dynamiques.push(obj);
      C.zone(c.x - 7, c.y - 6, 14, 10, null, { dialogue: () => {
        if (obj.pris) return null;
        if (Q.neige !== 'quete') return ['Un petit caillou noir, tout lisse.'];
        obj.pris = true; obtenir('cailloux', J); return B().caillou;
      } });
    });
    S.echarpeObj = { pris: false, sortY: S.fontaine.y + 1,
      draw(g, j) {
        if (this.pris) return;
        // une grande écharpe noire accrochée à la pointe de glace, qui flotte au vent (liseré clair pour la voir de loin)
        const t = j.t || 0, x = S.fontaine.x + 1, y = S.fontaine.y - 54;
        const pts = [];
        for (let k = 0; k < 16; k++) pts.push([x - 3 + k, y + 1 + Math.round(Math.sin(t * 5 - k * 0.6) * (k / 6))]);
        for (let k = 0; k < 9; k++) pts.push([x + 1 + Math.round(Math.sin(t * 4 - k * 0.7) * (k / 4)), y + 2 + k]);
        g.fillStyle = '#e8f2ff'; for (const [px, py] of pts) g.fillRect(px - 1, py - 1, 4, 4);
        g.fillStyle = '#121016'; for (const [px, py] of pts) g.fillRect(px, py, 2, 2);
        g.fillStyle = '#4a4660'; for (const [px, py] of pts.slice(0, 16)) g.fillRect(px, py, 1, 1);
        for (let k = 0; k < 3; k++) { const [fx, fy] = pts[15]; g.fillStyle = '#121016'; g.fillRect(fx + 1 + k, fy + 1 + (k % 2), 1, 2); }
        if (Math.sin(t * 3) > 0.4) { const sx = x + 8 + Math.round(Math.sin(t) * 6), sy = y - 4; g.fillStyle = '#ffffff'; g.fillRect(sx, sy - 1, 1, 3); g.fillRect(sx - 1, sy, 3, 1); }
      } };
    C.dynamiques.push(S.echarpeObj);
    S.branchesObj = { pris: false, sortY: S.branches.y,
      draw(g) {
        if (this.pris) return;
        const { x, y } = S.branches;
        g.fillStyle = '#6a4428';
        for (const [a, b, l] of [[0, 0, 12], [2, -2, 10], [-2, -4, 11]]) for (let k = 0; k < l; k++) g.fillRect(x - 6 + a + k, y + b - Math.round(k * 0.3), 1, 1);
        g.fillRect(x + 1, y - 6, 1, 3); g.fillRect(x - 3, y - 5, 1, 2);
      } };
    C.dynamiques.push(S.branchesObj);
  }

  // ------------------------------------------------------------ les personnages qui aident
  function parlerOlaf(J) {
    const o = F().olaf;
    o.regarder(J.joueur.x, J.joueur.y);
    if (Q.neige === 'quete') {
      if (toutTrouve()) { assembler(J); return null; }
      const manque = ORDRE.filter((k) => !complet(k)).map((k) => OU[k]);
      const lignes = [['olaf', `Il nous manque encore : ${manque.join(' ; ')}.`]];
      if (carotte && !inv.branches) return B().olafCarotte.concat(lignes);
      return lignes;
    }
    if (Q.neige === 'gagne') return B().apres;
    return [['olaf', 'Salut ! Moi, c\'est Olaf !']];
  }
  function parlerAnna(J) {
    if (Q.neige === 'quete' && !inv.petite) {
      J.jouerScript([{ dire: B().annaBoule }, { faire: () => obtenir('petite', J) }]);
      return null;
    }
    return repliques('anna');
  }
  function parlerSven(J) {
    const S = F();
    S.sven.regarder(J.joueur.x, J.joueur.y);
    if (Q.neige === 'quete' && !inv.branches) {
      if (!carotte) return B().svenSans;
      carotte = false;
      J.jouerScript([{ dire: B().svenCarotte }, { faire: () => { S.branchesObj.pris = true; obtenir('branches', J); S.sven.saut = 0.35; } }]);
      return null;
    }
    return ['Sven remue la queue et te renifle les poches. Au cas où.'];
  }
  function prendreCuilleres(J, obj) {
    if (obj.pris) return ['Il ne reste que des louches. Trop grandes pour des yeux.'];
    if (Q.neige !== 'quete') return ['Deux cuillères bien brillantes.'];
    J.jouerScript([{ dire: B().cuilleres }, { faire: () => { obj.pris = true; obtenir('cuilleres', J); } }]);
    return null;
  }
  function prendreCarotte(J, obj) {
    if (carotte || inv.branches || Q.neige !== 'quete') return ['Des carottes bien croquantes.'];
    J.jouerScript([{ dire: B().carotte }, { faire: () => { carotte = true; Musique.trouve(); toast('branches', 'Une carotte, pour Sven !'); } }]);
    return null;
  }
  // la fontaine gelée : Georges grimpe chercher l'écharpe
  function fontaine(J) {
    const S = F(), G = J.georges, p = J.joueur;
    if (Q.neige !== 'quete' || inv.echarpe) return CONFIG.textes.fontaineGelee;
    J.cinematique = true;
    const pied = { x: S.fontaine.x + 14, y: S.fontaine.y + 6 };
    J.jouerScript([
      { dire: B().echarpe },
      { faire: () => { G.allerVers([pied], 80); G.surprendre('!'); } },
      { jusqua: () => !G.chemin || !G.chemin.length },
      { faire: () => { G.dir = 'up'; } },
      ...[6, 12, 18, 24, 30, 36].map((h) => [{ faire: () => { G.h = h; G.x = pied.x - h / 6; } }, { attendre: 0.12 }]).flat(),
      { faire: () => { S.echarpeObj.pris = true; Musique.miaou(1.2, 0.08); } },
      { attendre: 0.4 },
      ...[30, 22, 14, 6, 0].map((h) => [{ faire: () => { G.h = h; } }, { attendre: 0.1 }]).flat(),
      { faire: () => { G.allerVers([{ x: p.x + 12, y: p.y + 4 }], 80); } },
      { jusqua: () => !G.chemin || !G.chemin.length },
      { faire: () => { G.reprendreSuivi(J); G.reaction = 1.5; } },
      { dire: B().echarpeGeorges },
      { faire: () => obtenir('echarpe', J) },
    ], () => { J.cinematique = false; });
    return null;
  }

  // ------------------------------------------------------------ l'assemblage, puis la victoire
  function assembler(J) {
    Q.neige = 'assemblage';
    majInventaire();
    J.cinematique = true;
    J.jouerScript([{ dire: B().olafPret }, { attendre: 0.2 }], () => Assemblage.lancer(J, { fin: () => victoire(J) }));
  }
  function victoire(J) {
    const S = F(), p = J.joueur, o = S.olaf, e = S.elsa;
    Q.neige = 'victoire';
    const jack = installerJack(J), tout = TOUT;
    p.x = S.jack.x - 26; p.y = S.jack.y + 10; p.dir = 'right'; p.chemin = null;
    o.x = S.jack.x + 24; o.y = S.jack.y + 6; o.chemin = null; o.dir = 'left';
    J.georges.x = p.x - 14; J.georges.y = p.y + 4; J.trace = [{ x: J.georges.x, y: J.georges.y }, { x: p.x, y: p.y }];
    J.regard = { x: S.jack.x, y: S.jack.y - 10 };
    J.jouerScript([
      { attendre: 0.6 },
      { faire: () => { o.saut = 0.35; for (let k = 0; k < 6; k++) J.particule('coeur', jack.x + (k - 2.5) * 5, jack.y - 40, { vy: -16 - k * 2, max: 1.4 }); Musique.victoireCourte(); } },
      { dire: B().fini },
      // Elsa arrive du château
      { faire: () => { e.visible = true; e.x = 800; e.y = 600; e.allerVers([{ x: 880, y: 640 }, { x: jack.x + 50, y: jack.y - 20 }, { x: jack.x + 48, y: jack.y - 2 }], 44, (q) => { q.dir = 'left'; }); } },
      { jusqua: () => !e.chemin },
      { dire: B().elsa },
      // la magie : des flocons qui tourbillonnent, Jack Snow prend vie
      { faire: () => { Musique.magie(); for (let k = 0; k < 14; k++) J.particule('etoile', jack.x, jack.y - 20, { max: 1.8, life: k * 0.06 }); jack.vie = 0.01; } },
      { attendre: 1.4 },
      { dire: B().vivant },
      { faire: () => { o.saut = 0.35; for (let k = 0; k < 5; k++) J.particule('coeur', (jack.x + o.x) / 2 + (k - 2) * 5, jack.y - 30, { vy: -14 - k * 2, max: 1.3 }); } },
      { attendre: 1.2 },
      { faire: () => { jack.vie = 0; jack.img = Neige.jack(tout); for (let k = 0; k < 6; k++) J.particule('etoile', jack.x, jack.y - 22, { max: 1.2, life: k * 0.1 }); } },
      { dire: B().magieFinie },
      { dire: B().indice },
      { faire: () => { Musique.victoire(); Indices.gagner(2, () => apresVictoire(J)); } },
    ]);
  }
  // Jack Snow, dans la rue, à côté du sapin
  const TOUT = { base: 1, corps: 1, tete: 1, yeux: 1, nez: 1, brasG: 1, brasD: 1, boutons: 1, echarpe: 1 };
  function installerJack(J) {
    const S = F(), tout = TOUT;
    const jack = { x: S.jack.x, y: S.jack.y, vie: 0, saut: 0, get sortY() { return this.y; }, img: Neige.jack(tout),
      update(dt) { if (this.vie > 0) { this.vie += dt; this.img = Neige.jack(tout, { vie: this.vie }); } },
      draw(g) { Entites.ombre(g, this.x, this.y, 12); const dy = this.vie > 0 ? -Math.round(Math.abs(Math.sin(this.vie * 5)) * 3) : 0; Entites.poser(g, this.img, this.x, this.y + 1 + dy); },
      zone() { return { x: this.x - 12, y: this.y - 20, w: 24, h: 22, dialogue: () => (Q.neige === 'gagne' ? ['Jack Snow. Il a l\'air très fier de son écharpe.', 'Ismae et Loane l\'ont construit ensemble, un soir de neige.'] : null) }; } };
    J.carte.pnj.push(jack);
    S.jackObj = jack;
    Entites.portraits.jack = jack.img;
    return jack;
  }

  function apresVictoire(J) {
    Q.neige = 'gagne';
    J.cinematique = false;
    J.regard = null;
    majInventaire();
    J.dire(B().apres);
  }

  // l'arrêt de bus : le départ de l'épreuve 4 (bus.js)
  function arretBus(J) {
    if (Q.neige !== 'gagne') return B().busAvant;
    Bus.depart(J);
    return null;
  }

  function init(J) {
    J.systemes.push((dt, j) => {
      if (!j.carte) return;
      if (annonce && !j.bloque() && Q.neige === 'quete') { annonce = false; j.dire(B().toutTrouve); }
      const vue = j.carte.id === 'arendelle' && Q.neige === 'quete';
      const boite = $('inventaire');
      if (boite && boite.hidden === vue) boite.hidden = !vue;
    });
  }

  // (dev : se placer directement à une étape, pour les essais)
  function dev(etape) {
    if (etape === 'tout') { for (const k of ORDRE) { if (k === 'cailloux') inv.cailloux = 3; else inv[k] = true; } Q.neige = 'quete'; toutAnnonce = true; majInventaire(); }
    if (etape === 'quete') { Q.neige = 'quete'; majInventaire(); }
  }

  return { init, entree, entreeOaken, repliques, parlerOlaf, parlerAnna, parlerSven, prendreCuilleres, prendreCarotte, fontaine, arretBus, dev, inv, Boule };
})();
