// =====================================================================
//  service.js — le mini-jeu de l'épreuve 5 : LE SERVICE DE NOËL chez Gusteau,
//  façon « Papa's Pizzeria », dans la cuisine de Ratatouille.
//
//  Trois clients, l'un après l'autre (de plus en plus exigeants) : Lou, Monsieur Maurice,
//  puis Anton Ego. Chacun commande un Paris-Brest au caramel au beurre salé, avec ses
//  petites manies (couleur du caramel, crème, nombre de rosaces, nappage, garnitures…).
//  Cinq postes, en bas de l'écran ; on passe librement de l'un à l'autre :
//   1. COMMANDE : le client, à sa table, passe commande ; le ticket s'écrit. Plus tard,
//      Linguini lui apporte le dessert, il goûte et réagit.
//   2. CARAMEL : glisser le sucre dans la casserole, régler le feu, remuer en rond pour
//      éviter les points noirs ; quand la couleur est la bonne, glisser le beurre ; remuer
//      pour calmer la mousse ; maintenir le pichet pour la crème (jusqu'au trait) ; une
//      ou deux pincées de fleur de sel ; retirer du feu. Le caramel continue de cuire
//      quand on va ailleurs : gare au brûlé !
//   3. FOUR : pocher la couronne de pâte à choux en suivant le cercle, glisser la plaque
//      dans le four, la sortir quand elle est dorée (et pas avant : les choux retombent !).
//   4. GARNIR : couper la couronne en deux d'un trait, choisir la bonne crème, pocher les
//      rosaces (maintenir : elles grossissent ; relâcher à la bonne taille), reposer le chapeau.
//   5. DRESSER : napper de caramel avec la cuillère, puis les finitions demandées (amandes,
//      noisettes une à une, sucre glace au tamis, pralin)… et SERVIR.
//  La note de chaque client mêle l'attente, le caramel, les choux, le montage et le dressage.
//  Un client mécontent renvoie son assiette : on la refait. Les réglages sont en haut (REGLAGES),
//  les textes dans config.js → caramel.service.
// =====================================================================
'use strict';

const Service = (() => {
  const $ = (id) => document.getElementById(id);
  const D = RestoDecor, A = Arendelle, line = Objets.line;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const choix = (l) => l[Math.floor(Math.random() * l.length)];
  const T = () => CONFIG.caramel.service;
  const REGLAGES = {
    // le caramel : fonte du sucre et coloration, par seconde, selon le feu (0 éteint, 1 doux, 2 moyen, 3 vif) ;
    // brûlé au-delà de « brule » ; les points noirs viennent quand on ne remue pas (feu moyen ou vif)
    caramel: { fonte: [0, 0.08, 0.15, 0.24], colore: [0, 0.008, 0.017, 0.03], brule: 0.9, taches: 0.07, remue: 0.45,
      // la mousse du beurre : elle monte jusqu'à « pic », retombe toute seule (plus vite si l'on remue) ; ça déborde au-delà de « deborde »
      mousse: { pic: 0.95, monte: 1.4, retombe: 0.09, remue: 0.5, deborde: 1.25 },
      // la crème : débit du pichet ; la cible est 1 (le trait) ; elle refait mousser un peu ; ça éclabousse si la mousse dépasse « eclabousse »
      creme: { debit: 0.34, mousse: 0.3, max: 1.5 }, eclabousse: 0.6 },
    // le four : durée de cuisson (s) pour chaque client ; on ne doit pas ouvrir avant « min » ; doré entre cible[0] et cible[1]
    four: { duree: [20, 17, 15], min: 0.42, brule: 1, cible: [0.55, 0.8], bins: 48 },
    // les couleurs de caramel demandées (0 : sucre blanc, 1 : charbon)
    bandes: { blond: [0.34, 0.47], ambre: [0.5, 0.62], brun: [0.65, 0.76] },
    // une rosace grossit tant qu'on maintient ; la bonne taille est 1 (± tol) ; au-delà de max, elle s'écroule
    rosace: { pousse: 0.9, tol: 0.3, max: 1.75 },
    // le nappage de caramel : la quantité demandée (un filet / bien nappé) ; au-delà de « trop », ça coule partout
    nappe: { filet: [0.2, 0.5], nappe: [0.56, 0.9], trop: 1.2, parPixel: 0.0042 },
    // la part de chaque poste dans la note du client
    poids: { attente: 0.12, caramel: 0.24, choux: 0.2, montage: 0.22, dressage: 0.22 },
  };
  const POSTES = ['commande', 'caramel', 'four', 'garnir', 'dresser'];
  // la couleur du caramel selon la cuisson
  const NUANCES = [[0, '#fbf6ea'], [0.25, '#f6e6b8'], [0.38, '#f0cc78'], [0.5, '#e4a440'], [0.62, '#c8782a'], [0.74, '#9a4a18'], [0.86, '#5a240c'], [1, '#1d0e0a']];
  const nuance = (c, N = NUANCES) => {
    c = clamp(c);
    for (let k = 1; k < N.length; k++) if (c <= N[k][0]) { const [a, ca] = N[k - 1], [b, cb] = N[k]; return PX.mix(ca, cb, (c - a) / (b - a)); }
    return N[N.length - 1][1];
  };
  // la couleur des choux selon la cuisson
  const CHOUX = [[0, '#f2e2bc'], [0.3, '#ecd098'], [0.56, '#d8a050'], [0.76, '#b8742a'], [0.9, '#7a3e14'], [1, '#2a140a']];
  const CREMES = { praline: ['#8a5a32', '#c49a6a', '#e0c098', '#f2dcbc'], caramel: ['#9a5a1a', '#d89a48', '#f0c070', '#fbe0a8'], vanille: ['#b8a888', '#e8dcc0', '#f8f0dc', '#ffffff'] };
  // une note par rapport à une bande [a, b] : 100 au milieu, 85 aux bords, puis ça chute
  function noteBande(v, [a, b], chute = 0.14) {
    const m = (a + b) / 2, d = Math.abs(v - m), demi = (b - a) / 2;
    if (d <= demi) return Math.round(100 - (d / demi) * 15);
    return Math.max(0, Math.round(85 - ((d - demi) / chute) * 85));
  }
  let E = null;

  // ------------------------------------------------------------ démarrage, clients, messages
  function lancer(J, o) {
    E = { J, fin: o.fin, n: 0, t: 0, poste: 'commande', doigts: new Map(), parts: [], alertes: {}, vus: {}, notes: [], remyPose: 'neutre', bulleT: 0, pourboires: 0, renvois: 0 };
    J.vue = vue; J.cinematique = true;
    document.body.classList.add('cuisine', 'service');
    $('cuisine').hidden = false;
    Musique.morceau('resto');
    nouveauClient(0);
  }
  function nouveauClient(n) {
    const C = T().clients[n], v = choix(C.variantes);
    Object.assign(E, { n, client: C, cmd: Object.assign({ noisettes: 0, amandes: false, sucre: false, pralin: false, sans: [], sel: 1 }, v.cmd, { guides: C.guides }), dit: v.dit,
      phase: 'arrive', tPhase: 0, ecrit: 0, attente: 0, poste: 'commande', resultat: null, mange: 0 });
    E.caramel = neufCaramel(); E.four = neufFour(); E.garni = neufGarni(); E.dress = neufDress();
    E.alertes = {};
    titre();
    aide(null);
    remy('neutre', null);
  }
  const neufCaramel = () => ({ etape: 'sucre', c: 0.04, fondu: 0, feu: 0, taches: 0, remue: 0, mousse: 0, monte: 0, creme: 0, sel: 0, deborde: 0, eclabousse: 0, cBeurre: null, verse: false, note: null, tSel: 0 });
  const neufFour = () => ({ etape: 'pocher', bins: new Array(REGLAGES.four.bins).fill(-1), points: [], hors: 0, cuisson: 0, degonfle: false, plaque: null, note: null });
  const neufGarni = () => ({ etape: 'couper', trait: null, coupe: null, poche: null, rosaces: [], pousse: null, couvercle: null, note: null });
  const neufDress = () => ({ filets: [], nappe: 0, coule: 0, salete: 0, amandes: [], pralin: [], noisettes: [], sucre: [], sucreQ: 0, outil: null });

  function titre() { $('cui-titre').textContent = E.poste === 'commande' ? (E.phase === 'arrive' || E.phase === 'parle' ? T().titres.commande : E.phase === 'attend' ? T().titres.attend : T().titres.service) : T().titres[E.poste]; }
  function aide(t) { const a = $('cui-aide'); a.textContent = t || ''; a.hidden = !t; }
  // l'aide du poste, selon l'étape où l'on en est
  function aidePoste() {
    const ca = E.caramel.etape, fo = E.four.etape, ga = E.garni.etape;
    const cle = E.phase !== 'attend' ? null : {
      commande: null, dresser: 'dresser',
      caramel: { sucre: 'caramel', cuisson: 'cuisson', mousse: 'mousse', creme: 'mousse', sel: 'mousse' }[ca],
      four: { pocher: 'four', poche: 'enfourner', cuit: 'cuisson4' }[fo],
      garnir: { couper: 'garnir', poche: 'poche', rosaces: 'rosaces', fermer: 'fermer' }[ga],
    }[E.poste];
    const c = cle && T().consignes[cle];
    aide(c ? c[doigt() ? 0 : 1] : null);
  }
  const doigt = () => matchMedia('(pointer: coarse)').matches;
  function message(t, k = '') {
    const m = $('cui-message'); m.hidden = !t; if (!t) return;
    m.textContent = t; m.className = k; m.classList.remove('arrive'); void m.offsetWidth; m.classList.add('arrive');
    E.messageT = 1.8;
  }
  // Rémy prend une pose et dit sa réplique dans sa bulle
  function remy(pose, texte, duree = 4.2) {
    E.remyPose = pose;
    const b = $('cui-bulle');
    if (texte) { b.textContent = texte; b.hidden = false; b.classList.remove('arrive'); void b.offsetWidth; b.classList.add('arrive'); E.bulleT = duree; Musique.couic(); }
  }
  // une remarque de Rémy (pas plus d'une fois toutes les quelques secondes)
  function alerte(cle, pose = 'parle', delai = 5) {
    if ((E.alertes[cle] || -99) > E.t) return;
    E.alertes[cle] = E.t + delai;
    remy(pose, T().remy[cle]);
  }
  // les petits conseils de Rémy, la première fois qu'on arrive à un poste (et à chaque étape, pour le premier client)
  function conseil(cle) {
    const k = E.n + ':' + cle;
    if (E.vus[k] || (E.n > 0 && E.vus['0:' + cle])) return;
    E.vus[k] = true;
    const t = T().conseils[cle];
    if (t) remy('parle', t, 5.5);
  }

  // ------------------------------------------------------------ mise en page (recalculée à chaque image)
  function mise(V) {
    const w = V.w, h = V.h, haut = 22, bas = h - 25, ht = bas - haut;
    const L = { w, h, haut, bas, ht };
    const ow = Math.floor((w - 6) / 5);
    L.onglets = POSTES.map((p, k) => ({ p, x: 3 + k * ow, y: h - 23, w: ow - 2, h: 22 }));
    L.ticket = { x: w - 76, y: 2, w: 74 };
    L.remy = { x: 18, y: bas - 2 };
    // CARAMEL : la casserole sur son feu, le sac de sucre à gauche, la planche des ingrédients à droite, la jauge de couleur
    L.plan = Math.round(haut + ht * 0.42);
    const R = Math.round(Math.min(w * 0.095, ht * 0.23)), ry = Math.round(R * 0.48), ph = Math.round(R * 0.45);
    L.pan = { x: Math.round(w * 0.4), y: bas - 32 - ph - ry, R, ry, haut: ph };
    L.feux = [0, 1, 2, 3].map((k) => ({ x: L.pan.x - 66 + k * 36, y: bas - 15, w: 34, h: 13 }));
    L.sucre = { x: Math.round(w * 0.15), y: L.plan - 4, w: 30, h: 42 };
    L.planche = { x: Math.round(w * 0.6), y: L.plan + 22, w: Math.round(w * 0.27), h: bas - L.plan - 38 };
    L.creme = { x: L.planche.x + 6, y: L.planche.y - 26, w: 26, h: 34 };
    L.beurre = { x: L.planche.x + 6, y: L.planche.y + L.planche.h - 22, w: 34, h: 18 };
    L.sel = { x: L.planche.x + L.planche.w - 36, y: L.planche.y + L.planche.h - 30, w: 30, h: 24 };
    L.jauge = { x: w - 16, y0: 120, y1: bas - 6 };
    L.btnHaut = { x: L.pan.x - 46, y: haut + 4, w: 92, h: 18 };
    // FOUR
    const RX = Math.round(Math.min(w * 0.11, ht * 0.29));
    L.plaque = { x: Math.round(w * 0.33), y: haut + Math.round(ht * 0.62), RX, RY: Math.round(RX * 0.52) };
    L.four = { x: Math.round(w * 0.58), y: haut + 4, w: Math.round(w * 0.25), h: ht - 6 };
    // GARNIR et DRESSER : le grand Paris-Brest
    const GX = Math.round(Math.min(w * 0.145, ht * 0.36));
    L.pb = { x: Math.round(w * 0.47), y: haut + Math.round(ht * 0.52), RX: GX, RY: Math.round(GX * 0.5) };
    L.chapeau = { x: Math.round(w * 0.82), y: haut + Math.round(ht * 0.68) };
    L.poches = ['praline', 'caramel', 'vanille'].map((c, k) => ({ c, x: 6 + k * 52, y: haut + 14, w: 48, h: 46 }));
    L.pots = [['amandes', 0], ['noisettes', 1], ['sucre', 2], ['pralin', 3]].map(([c, k]) => ({ c, x: Math.round(w * 0.2) + k * 46, y: haut + 4, w: 38, h: 36 }));
    L.casserole = { x: Math.round(w * 0.03), y: bas - 92, w: 50, h: 44 };
    L.servir = { x: Math.round(w * 0.78), y: bas - 28, w: 74, h: 22 };
    // COMMANDE (la scène de la salle, dessinée deux fois plus grosse)
    L.hw = Math.ceil(w / 2); L.hh = Math.ceil(h / 2);
    L.grandTicket = { x: Math.round(w * 0.6), y: haut + 2, w: Math.round(Math.min(150, w * 0.32)), h: ht - 30 };
    L.btnNote = { x: L.grandTicket.x + Math.round(L.grandTicket.w / 2) - 50, y: bas - 24, w: 100, h: 20 };
    L.bilan = { w: Math.round(Math.min(176, w * 0.36)) }; L.bilan.x = w - L.bilan.w - 8; L.bilan.y = haut + 2; L.bilan.h = 30 + 5 * 11 + 14;
    L.btnBilan = { x: L.bilan.x + Math.round(L.bilan.w / 2) - 50, y: Math.min(bas - 22, L.bilan.y + L.bilan.h + 6), w: 100, h: 20 };
    return L;
  }
  // la bulle de Rémy, juste au-dessus de lui (en pixels de l'écran)
  function placerBulle(L) {
    const k = E.J.V.s / Math.min(window.devicePixelRatio || 1, 3), b = $('cui-bulle');
    b.style.left = Math.round(6 * k) + 'px'; b.style.bottom = Math.round((L.h - L.remy.y + 40) * k) + 'px';
    const a = $('cui-aide'); a.style.bottom = Math.round(44 * k) + 'px'; // au-dessus des boutons du feu et des compteurs
  }

  // ------------------------------------------------------------ les postes : disponibles ? en alerte ?
  function dispo(p) {
    if (E.phase !== 'attend') return p === 'commande';
    if (p === 'garnir') return E.four.etape === 'sorti';
    if (p === 'dresser') return E.garni.etape === 'fini' && E.caramel.etape === 'pret';
    return true;
  }
  function fait(p) {
    return { commande: E.phase !== 'arrive' && E.phase !== 'parle', caramel: E.caramel.etape === 'pret', four: E.four.etape === 'sorti', garnir: E.garni.etape === 'fini', dresser: false }[p];
  }
  function alarme(p) {
    const ca = E.caramel, fo = E.four, bande = REGLAGES.bandes[E.cmd.caramel];
    if (p === 'caramel') return ca.etape === 'cuisson' && ca.fondu >= 1 ? (ca.c > bande[1] + 0.04 ? 2 : ca.c >= bande[0] ? 1 : 0) : ca.etape === 'mousse' && ca.mousse > 0.9 ? 2 : 0;
    if (p === 'four') return fo.etape === 'cuit' ? (fo.cuisson > REGLAGES.four.cible[1] + 0.04 ? 2 : fo.cuisson >= REGLAGES.four.cible[0] ? 1 : 0) : 0;
    return 0;
  }
  function aller(p) {
    if (!dispo(p) || p === E.poste) return;
    E.poste = p; E.doigts.clear(); E.tenu = null;
    titre(); aidePoste(); conseil(p);
    Musique.bip(520);
  }

  // ------------------------------------------------------------ commandes : doigts et souris
  const dans = (p, r) => r && p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;
  const dansEllipse = (p, cx, cy, rx, ry, k = 1) => ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2 <= k * k;
  function pointeur(type, pos, e) {
    if (!E) return;
    const id = e && e.pointerId !== undefined ? e.pointerId : 0, L = mise(E.J.V);
    if (type === 'down') {
      E.doigts.set(id, { x: pos.x, y: pos.y, x0: pos.x, y0: pos.y, t0: E.t });
      if (pos.y > L.h - 25) { const o = L.onglets.find((b) => dans(pos, b)); if (o) aller(o.p); return; }
      DOWN[E.poste](pos, id, L);
      return;
    }
    const d = E.doigts.get(id);
    if (!d) return;
    if (type === 'up') { E.doigts.delete(id); UP[E.poste](pos, id, L, d); return; }
    const px = d.x, py = d.y; d.x = pos.x; d.y = pos.y;
    MOVE[E.poste](pos, id, L, d, px, py);
  }
  const DOWN = {}, MOVE = {}, UP = {};

  // ============================================================ 1. COMMANDE et SERVICE
  DOWN.commande = (pos, id, L) => {
    if (E.phase === 'parle' && E.tPhase > 0.6) {
      if (E.ecrit < lignesTicket().length) { E.ecrit = lignesTicket().length; return; }
      if (dans(pos, btnNoter(L))) noter();
    } else if (E.phase === 'bilan' && E.tPhase > 1.2 && dans(pos, L.btnBilan)) suite();
  };
  MOVE.commande = () => {}; UP.commande = () => {};
  const btnNoter = (L) => Object.assign({}, L.btnNote, { y: Math.min(L.btnNote.y, L.grandTicket.y + 16 + lignesTicket().length * 12 + 6) });
  function noter() {
    E.phase = 'attend'; E.tPhase = 0;
    Musique.bip(780);
    remy('parle', E.n === 0 ? T().remy.premierTicket : choix(T().remy.ticket));
    aller('four');
  }
  // les lignes du ticket : [icône, texte, rouge ?]
  function lignesTicket() {
    const c = E.cmd, Tk = T().ticket, l = [];
    l.push(['caramel', Tk.caramel[c.caramel]]);
    l.push(['creme', Tk.creme[c.creme]]);
    l.push(['rosace', c.rosaces + ' ' + Tk.rosaces]);
    l.push(['nappe', Tk.nappe[c.nappe]]);
    if (c.sel > 1) l.push(['sel', Tk.sel2]);
    if (c.noisettes) l.push(['noisettes', Tk.noisettes + ' X' + c.noisettes]);
    for (const g of ['amandes', 'sucre', 'pralin']) if (c[g]) l.push([g, Tk[g]]);
    for (const g of c.sans) l.push([g, Tk.sans[g], true]);
    return l;
  }
  function servir() {
    E.poste = 'commande'; E.phase = 'sert'; E.tPhase = 0; E.doigts.clear(); E.tenu = null;
    titre(); aide(null);
    Musique.bip(880);
    E.resultat = noter2();
    remy('content', choix(T().remy.envoi));
  }
  // la note du client
  function noter2() {
    const c = E.cmd, R = REGLAGES, n = {}, ca = E.caramel, fo = E.four, ga = E.garni, dr = E.dress;
    const patience = E.client.patience;
    n.attente = Math.round(clamp(1 - Math.max(0, E.attente - patience * 0.55) / (patience * 0.6), 0.25, 1) * 100);
    // le caramel : la couleur au moment du beurre, les points noirs, la mousse, la crème, le sel
    const bande = R.bandes[c.caramel], serre = E.n === 2 ? 0.1 : 0.14;
    const nc = noteBande(ca.cBeurre ?? ca.c, bande, serre), nt = 100 - ca.taches * 100, nm = ca.deborde > 0 ? Math.max(20, 100 - ca.deborde * 160) : 100;
    const ncr = Math.max(0, 100 - Math.abs(ca.creme - 1) * 220) - ca.eclabousse * 40, ns = ca.sel === c.sel ? 100 : Math.abs(ca.sel - c.sel) === 1 ? 55 : 15;
    n.caramel = Math.round(clamp(nc * 0.5 + nt * 0.12 + nm * 0.12 + ncr * 0.14 + ns * 0.12, 0, 100));
    // les choux : la couronne bien ronde, la cuisson
    const cov = fo.bins.filter((b) => b >= 0), err = cov.length ? cov.reduce((a, b) => a + b, 0) / cov.length : 1;
    const np = clamp((cov.length / fo.bins.length) * 100 - err * 160 - fo.hors * 2, 0, 100), nk = fo.degonfle ? 30 : noteBande(fo.cuisson, R.four.cible, 0.16);
    n.choux = Math.round(np * 0.45 + nk * 0.55);
    // le montage : la coupe, la bonne crème, les rosaces (nombre, taille, régularité), le chapeau
    const nr = ga.rosaces.length, tailles = ga.rosaces.reduce((a, r) => a + Math.max(0, 100 - Math.abs(r.taille - 1) / R.rosace.tol * 35), 0) / Math.max(1, nr);
    const ang = ga.rosaces.map((r) => r.a).sort((a, b) => a - b), ideal = Math.PI * 2 / Math.max(1, nr);
    let ecart = 0; for (let k = 0; k < nr; k++) { const g = ((ang[(k + 1) % nr] - ang[k]) + Math.PI * 2) % (Math.PI * 2) || Math.PI * 2; ecart += Math.abs(g - ideal) / ideal; }
    const nreg = nr > 1 ? clamp(100 - (ecart / nr) * 140, 0, 100) : 0, nnb = nr === c.rosaces ? 100 : Math.max(0, 100 - Math.abs(nr - c.rosaces) * 30);
    const ncrm = ga.poche === c.creme ? 100 : 25, ncp = ga.coupe ?? 50, nch = ga.couvercle ?? 50;
    n.montage = Math.round(ncrm * 0.25 + nnb * 0.2 + tailles * 0.2 + nreg * 0.15 + ncp * 0.1 + nch * 0.1);
    // le dressage : la quantité de caramel, les garnitures demandées (et pas les autres), la propreté
    const nn = noteBande(dr.nappe, R.nappe[c.nappe], 0.2) - Math.min(40, dr.coule * 60);
    let ng = 100; const manque = [];
    if (c.noisettes) { const d = Math.abs(dr.noisettes.length - c.noisettes); ng -= d * 18; if (!dr.noisettes.length) manque.push('noisettes'); } else if (dr.noisettes.length) ng -= 20;
    for (const g of ['amandes', 'pralin']) { const q = dr[g].length; if (c[g] && q < 8) { ng -= q ? 12 : 30; if (!q) manque.push(g); } if (!c[g] && q) ng -= c.sans.includes(g) ? 40 : 15; }
    if (c.sucre && dr.sucreQ < 0.25) { ng -= dr.sucreQ ? 12 : 30; if (!dr.sucreQ) manque.push('sucre'); } if (!c.sucre && dr.sucreQ > 0.05) ng -= c.sans.includes('sucre') ? 40 : 15;
    n.dressage = Math.round(clamp(nn * 0.45 + clamp(ng, 0, 100) * 0.45 + Math.max(0, 100 - dr.salete * 4) * 0.1, 0, 100));
    const P = R.poids;
    n.total = Math.round(n.attente * P.attente + n.caramel * P.caramel + n.choux * P.choux + n.montage * P.montage + n.dressage * P.dressage);
    n.niveau = n.total >= 88 ? 'parfait' : n.total >= 72 ? 'bien' : n.total >= E.client.seuil ? 'moyen' : 'rate';
    n.manque = manque;
    n.pourboire = n.niveau === 'rate' ? 0 : Math.round(n.total / 10) + (n.niveau === 'parfait' ? 5 : 0);
    return n;
  }
  function suite() {
    const r = E.resultat;
    if (r.niveau === 'rate') { E.renvois++; const n = E.n; remy('parle', choix(T().remy.refaire)); nouveauClient(n); E.phase = 'parle'; E.tPhase = 0.7; E.ecrit = 99; return; }
    E.notes.push(r); E.pourboires += r.pourboire;
    if (E.n + 1 < T().clients.length) { nouveauClient(E.n + 1); return; }
    // fin du service
    E.phase = 'fini'; E.tPhase = 0;
    message(T().fini, 'bon'); remy('joie', T().remy.fini);
    Musique.victoireCourte && Musique.victoireCourte();
  }
  function majCommande(dt) {
    E.tPhase += dt;
    if (E.phase === 'arrive' && E.tPhase > 1.6) { E.phase = 'parle'; E.tPhase = 0; E.ecrit = 0; titre(); Musique.bip(600); }
    if (E.phase === 'parle') { const n = lignesTicket().length; if (E.tPhase > 1.4 + E.ecrit * 0.55 && E.ecrit < n) { E.ecrit++; Musique.bip(900 + E.ecrit * 40, 0.02); } }
    if (E.phase === 'sert' && E.tPhase > 2.2) { E.phase = 'mange'; E.tPhase = 0; }
    if (E.phase === 'mange') {
      E.mange = clamp(E.tPhase / 2.2);
      if (E.tPhase > 2.4) {
        E.phase = 'bilan'; E.tPhase = 0; const r = E.resultat;
        const rep = T().reactions[E.client.id][r.niveau];
        remy({ parfait: 'joie', bien: 'content', moyen: 'inquiet', rate: 'desespoir' }[r.niveau], null);
        message(T().verdicts[r.niveau], r.niveau === 'rate' ? 'rate' : 'bon');
        E.repliqueClient = rep;
        if (r.niveau === 'rate') Musique.oh(); else Musique.trouve();
        if (r.niveau === 'parfait' || r.niveau === 'bien') for (let k = 0; k < 14; k++) E.parts.push({ type: 'coeur', x: 0, y: 0, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 30, t: 0, max: 1.6 + Math.random() });
      }
    }
    if (E.phase === 'fini' && E.tPhase > 3.2 && !E.ferme) { E.ferme = true; fermer(true); }
  }

  // ============================================================ 2. LE CARAMEL
  function zoneCaramel(pos, L) {
    const ca = E.caramel, p = L.pan;
    const f = L.feux.findIndex((b) => dans(pos, b)); if (f >= 0) return 'feu' + f;
    if (ca.etape === 'sucre' && dans(pos, L.sucre)) return 'sucre';
    if (ca.etape === 'cuisson' && dans(pos, L.beurre)) return 'beurre';
    if ((ca.etape === 'mousse' || ca.etape === 'creme') && dans(pos, L.creme)) return 'creme';
    if ((ca.etape === 'creme' || ca.etape === 'sel') && dans(pos, L.sel)) return 'sel';
    if ((ca.etape === 'sel' || ca.etape === 'creme') && ca.creme > 0.5 && dans(pos, L.btnHaut)) return 'retirer';
    if (ca.brule && dans(pos, L.btnHaut)) return 'recommencer';
    if (dansEllipse(pos, p.x, p.y, p.R, p.ry, 1.5)) return 'pot';
    return null;
  }
  DOWN.caramel = (pos, id, L) => {
    const z = zoneCaramel(pos, L), ca = E.caramel, d = E.doigts.get(id);
    d.zone = z;
    if (z && z.startsWith('feu')) { ca.feu = +z[3]; Musique.bip(400 + ca.feu * 120, 0.02); }
    if (z === 'sucre' || z === 'beurre') E.tenu = { id, quoi: z, x: pos.x, y: pos.y };
    if (z === 'creme') { ca.verse = true; d.verse = true; }
    if (z === 'sel') { ca.sel++; ca.tSel = 0.5; Musique.sucre(); for (let k = 0; k < 8; k++) E.parts.push({ type: 'sel', x: L.pan.x + (Math.random() - 0.5) * 20, y: L.pan.y - 24, vx: (Math.random() - 0.5) * 10, vy: 40 + Math.random() * 30, t: 0, max: 0.5 }); if (ca.etape === 'creme') ca.etape = 'sel'; }
    if (z === 'retirer') retirerCaramel();
    if (z === 'recommencer') { E.caramel = neufCaramel(); remy('parle', choix(T().remy.encore)); }
  };
  MOVE.caramel = (pos, id, L, d, px, py) => {
    const ca = E.caramel, p = L.pan;
    if (E.tenu && E.tenu.id === id) { E.tenu.x = pos.x; E.tenu.y = pos.y; }
    if (d.zone === 'pot' || (!d.zone && !E.tenu && dansEllipse(pos, p.x, p.y, p.R, p.ry, 1.3))) {
      // on remue : on compte l'angle parcouru autour du milieu de la casserole
      const a0 = Math.atan2((py - p.y) / 0.5, px - p.x), a1 = Math.atan2((pos.y - p.y) / 0.5, pos.x - p.x);
      let da = a1 - a0; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
      if (Math.hypot(pos.x - p.x, (pos.y - p.y) / 0.5) > p.R * 0.15 && Math.abs(da) < 1.2) { ca.remue = Math.min(1.5, ca.remue + Math.abs(da) * 0.35); E.cuillere = { x: pos.x, y: pos.y, t: E.t }; }
    }
  };
  UP.caramel = (pos, id, L, d) => {
    const ca = E.caramel, p = L.pan;
    if (d.verse) ca.verse = [...E.doigts.values()].some((o) => o.verse);
    if (E.tenu && E.tenu.id === id) {
      const quoi = E.tenu.quoi; E.tenu = null;
      if (!dansEllipse(pos, p.x, p.y - 10, p.R * 1.5, p.ry * 3)) return;
      if (quoi === 'sucre') { ca.etape = 'cuisson'; Musique.sucre(); remy('content', T().remy.sucre); aide(T().consignes.cuisson[doigt() ? 0 : 1]); }
      else { // le beurre : la couleur est fixée, ça mousse !
        ca.cBeurre = ca.c; ca.etape = 'mousse'; ca.monte = 1; Musique.gresille();
        const bande = REGLAGES.bandes[E.cmd.caramel];
        if (ca.c < bande[0] - 0.02) remy('inquiet', T().remy.beurreTot); else if (ca.c > bande[1] + 0.02) remy('inquiet', T().remy.beurreTard); else remy('joie', T().remy.beurreBien);
        aide(T().consignes.mousse[doigt() ? 0 : 1]);
      }
    }
  };
  function retirerCaramel() {
    const ca = E.caramel;
    if (ca.sel === 0 && !E.alertes.selOubli) { E.alertes.selOubli = 1; remy('panique', T().remy.sel); return; }
    ca.etape = 'pret'; ca.feu = 0; Musique.trouve();
    message(T().caramelPret, 'bon'); remy('content', T().remy.caramelPret);
    aidePoste();
  }
  // le caramel cuit même quand on est à un autre poste
  function majCaramel(dt) {
    const ca = E.caramel, R = REGLAGES.caramel, enVue = E.poste === 'caramel';
    ca.remue = Math.max(0, ca.remue - dt * 1.2);
    const remue = ca.remue > 0.25;
    if (ca.tSel > 0) ca.tSel -= dt;
    if (ca.etape === 'cuisson' && !ca.brule) {
      if (ca.fondu < 1) { ca.fondu = Math.min(1, ca.fondu + R.fonte[ca.feu] * dt); ca.c = Math.min(ca.c + R.colore[ca.feu] * dt * 0.3, 0.3); }
      else ca.c += R.colore[ca.feu] * dt * (remue ? 0.92 : 1);
      if (ca.feu >= 2 && ca.fondu > 0.3) ca.taches = clamp(ca.taches + (remue ? -R.remue : R.taches * (ca.feu - 1)) * dt);
      else if (remue) ca.taches = Math.max(0, ca.taches - R.remue * dt);
      const bande = REGLAGES.bandes[E.cmd.caramel];
      if (ca.fondu >= 1 && ca.c >= bande[0] && ca.c <= bande[1]) alerte(enVue ? 'beurreMaintenant' : 'caramelPretLoin', 'parle', 9);
      if (ca.c > bande[1] + 0.06 && ca.c < R.brule) alerte('caramelFonce', 'panique', 6);
      if (ca.feu >= 2 && ca.taches > 0.35 && enVue) alerte('remue', 'inquiet', 6);
      if (ca.c >= R.brule) { ca.brule = true; ca.feu = 0; Musique.alarme(); message(T().echecs.brule, 'rate'); remy('panique', T().remy.brule); }
    }
    if (ca.etape === 'mousse' || ca.etape === 'creme' || ca.etape === 'sel') {
      const M = R.mousse;
      if (ca.monte > 0) { ca.monte -= dt; ca.mousse += M.monte * dt; if (ca.mousse > M.pic) ca.monte = 0; }
      ca.mousse = Math.max(0, ca.mousse - (M.retombe + (remue ? M.remue : 0)) * dt);
      if (ca.verse && ca.etape !== 'pret') {
        ca.creme = Math.min(R.creme.max, ca.creme + R.creme.debit * dt); ca.mousse += R.creme.mousse * dt;
        if (ca.mousse > R.eclabousse) { ca.eclabousse = Math.min(1, ca.eclabousse + dt * 0.8); alerte('eclabousse', 'panique', 3); }
        if (ca.etape === 'mousse') ca.etape = 'creme';
        if (ca.creme > 1.14) alerte('tropCreme', 'inquiet', 4);
      }
      if (ca.mousse > M.deborde) { ca.deborde += dt; ca.mousse = M.deborde; alerte('deborde', 'panique', 3); }
      else if (ca.mousse > 0.85 && enVue) alerte('mousse', 'parle', 4);
      if (ca.etape === 'mousse' && ca.mousse < 0.45 && !ca.verse) alerte('cremeMaintenant', 'parle', 12);
    }
  }

  // ============================================================ 3. LE FOUR : pocher la couronne, cuire
  DOWN.four = (pos, id, L) => {
    const fo = E.four, P = L.plaque, d = E.doigts.get(id);
    if (fo.etape === 'pocher' && dansEllipse(pos, P.x, P.y, P.RX, P.RY, 1.7)) { d.poche = true; pocher(pos, L); }
    else if (fo.etape === 'poche' && dansEllipse(pos, P.x, P.y, P.RX, P.RY, 1.6)) E.tenu = { id, quoi: 'plaque', x: pos.x, y: pos.y };
    else if (fo.etape === 'poche' && dans(pos, L.four)) enfourner();
    else if (fo.etape === 'cuit' && dans(pos, L.four)) sortir();
    else if (fo.etape === 'brule' && dans(pos, L.btnHaut)) { E.four = neufFour(); remy('parle', choix(T().remy.encore)); }
  };
  MOVE.four = (pos, id, L, d) => {
    if (d.poche) pocher(pos, L);
    if (E.tenu && E.tenu.id === id) { E.tenu.x = pos.x; E.tenu.y = pos.y; }
  };
  UP.four = (pos, id, L, d) => {
    const fo = E.four;
    if (d.poche) {
      d.poche = false;
      const cov = fo.bins.filter((b) => b >= 0).length / fo.bins.length;
      if (cov >= 0.9) { fo.etape = 'poche'; Musique.trouve(); remy('content', T().remy.couronne); aide(T().consignes.enfourner[doigt() ? 0 : 1]); }
    }
    if (E.tenu && E.tenu.id === id) { E.tenu = null; if (dans(pos, L.four)) enfourner(); }
  };
  function pocher(pos, L) {
    const fo = E.four, P = L.plaque, dx = (pos.x - P.x) / P.RX, dy = (pos.y - P.y) / P.RY, rr = Math.hypot(dx, dy);
    const last = fo.points[fo.points.length - 1];
    if (last && Math.hypot(last.u * P.RX - dx * P.RX, last.v * P.RY - dy * P.RY) < 1.5) return;
    fo.points.push({ u: dx, v: dy });
    if (rr < 0.55 || rr > 1.45) { fo.hors++; return; }
    const a = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2), b = Math.floor(a / (Math.PI * 2) * fo.bins.length);
    const err = Math.abs(rr - 1);
    fo.bins[b] = fo.bins[b] < 0 ? err : Math.min(fo.bins[b], err);
  }
  function enfourner() { const fo = E.four; fo.etape = 'cuit'; fo.cuisson = 0; Musique.porte(); remy('parle', E.n === 0 ? T().remy.fourPremier : T().remy.four); aide(T().consignes.cuisson4[doigt() ? 0 : 1]); }
  function sortir() {
    const fo = E.four, R = REGLAGES.four;
    if (fo.cuisson < R.min) { fo.degonfle = true; Musique.oh(); remy('panique', T().remy.ouvert); message(T().echecs.degonfle, 'rate'); }
    else if (fo.cuisson < R.cible[0]) remy('inquiet', T().remy.pale);
    else if (fo.cuisson > R.cible[1] + 0.05) remy('inquiet', T().remy.fonce);
    else { remy('joie', T().remy.dore); message(choix(T().bravo), 'bon'); }
    fo.etape = 'sorti'; Musique.porte(); Musique.trouve();
    aidePoste();
  }
  function majFour(dt) {
    const fo = E.four, R = REGLAGES.four;
    if (fo.etape !== 'cuit') return;
    fo.cuisson += dt / R.duree[E.n];
    if (fo.cuisson >= R.cible[0] && fo.cuisson <= R.cible[1]) alerte(E.poste === 'four' ? 'fourPret' : 'fourPretLoin', 'parle', 8);
    if (fo.cuisson > R.cible[1] + 0.06) alerte('fourFonce', 'panique', 5);
    if (fo.cuisson >= R.brule) { fo.etape = 'brule'; Musique.alarme(); message(T().echecs.chouxBrules, 'rate'); remy('panique', T().remy.chouxBrules); }
  }

  // ============================================================ 4. GARNIR : couper, la crème, les rosaces, le chapeau
  DOWN.garnir = (pos, id, L) => {
    const ga = E.garni, G = L.pb, d = E.doigts.get(id);
    if (ga.etape === 'couper' && Math.abs(pos.y - etages(G).ligne) < G.RY * 1.3 && Math.abs(pos.x - G.x) < G.RX * 1.6) { ga.trait = [{ x: pos.x, y: pos.y }]; d.coupe = true; }
    else if (ga.etape === 'poche' || (ga.etape === 'rosaces' && !ga.rosaces.length)) {
      const b = L.poches.find((p) => dans(pos, p));
      if (b) { ga.poche = b.c; ga.etape = 'rosaces'; Musique.bip(700); if (b.c !== E.cmd.creme) remy('inquiet', T().remy.mauvaisePoche); else remy('content', T().remy.bonnePoche); aide(T().consignes.rosaces[doigt() ? 0 : 1]); return; }
    }
    if (ga.etape === 'rosaces' && ga.poche && !ga.pousse) { const a = angleSurCouronne(pos, G); if (a !== null) { ga.pousse = { id, a, taille: 0 }; Musique.bulle && Musique.bulle(); } }
    if (ga.etape === 'fermer') { const c = posChapeau(L); if (Math.hypot(pos.x - c.x, (pos.y - c.y) * 1.6) < G.RX * 1.2) E.tenu = { id, quoi: 'chapeau', x: pos.x, y: pos.y, dx: c.x - pos.x, dy: c.y - pos.y }; }
  };
  MOVE.garnir = (pos, id, L, d) => {
    const ga = E.garni;
    if (d.coupe && ga.trait) ga.trait.push({ x: pos.x, y: pos.y });
    if (ga.pousse && ga.pousse.id === id) { const a = angleSurCouronne(pos, L.pb); if (a !== null) ga.pousse.a = a; }
    if (E.tenu && E.tenu.id === id) { E.tenu.x = pos.x; E.tenu.y = pos.y; }
  };
  UP.garnir = (pos, id, L, d) => {
    const ga = E.garni, G = L.pb;
    if (d.coupe && ga.trait) {
      d.coupe = false;
      const tr = ga.trait, x0 = Math.min(...tr.map((p) => p.x)), x1 = Math.max(...tr.map((p) => p.x));
      if (x1 - x0 < G.RX * 1.5) { ga.trait = null; remy('parle', T().remy.coupeCourte); return; }
      // la coupe : bien droite (on mesure l'écart à la ligne moyenne) et au bon endroit (au milieu de la hauteur)
      const ys = tr.filter((p) => Math.abs(p.x - G.x) < G.RX).map((p) => p.y), m = ys.reduce((a, b) => a + b, 0) / Math.max(1, ys.length);
      const dev = Math.max(...ys.map((y) => Math.abs(y - m)), 0), place = Math.abs(m - etages(G).ligne);
      ga.coupe = Math.round(clamp(100 - dev * 7 - place * 3, 10, 100));
      ga.etape = 'poche'; Musique.couteau();
      remy(ga.coupe > 75 ? 'content' : 'inquiet', ga.coupe > 75 ? T().remy.coupeNette : T().remy.coupeTravers);
      aide(T().consignes.poche[doigt() ? 0 : 1]);
    }
    if (ga.pousse && ga.pousse.id === id) poserRosace();
    if (E.tenu && E.tenu.id === id) E.tenu = null;
  };
  // la position d'un doigt sur la couronne → l'angle (ou null si l'on est trop loin)
  function angleSurCouronne(pos, G) {
    const dx = (pos.x - G.x) / G.RX, dy = (pos.y - etages(G).ros) / G.RY, rr = Math.hypot(dx, dy);
    if (rr < 0.4 || rr > 1.6) return null;
    return Math.atan2(dy, dx);
  }
  function poserRosace() {
    const ga = E.garni, p = ga.pousse, R = REGLAGES.rosace;
    ga.pousse = null;
    if (p.taille < 0.25) return;
    ga.rosaces.push({ a: p.a, taille: Math.min(p.taille, R.max) });
    Musique.bip(500 + ga.rosaces.length * 40, 0.02);
    if (Math.abs(p.taille - 1) > R.tol) alerte(p.taille > 1 ? 'rosaceGrosse' : 'rosacePetite', 'inquiet', 4);
    if (ga.rosaces.length >= E.cmd.rosaces) { ga.etape = 'fermer'; remy('content', T().remy.rosacesFinies); aide(T().consignes.fermer[doigt() ? 0 : 1]); }
  }
  const posChapeau = (L) => (E.tenu && E.tenu.quoi === 'chapeau' ? { x: E.tenu.x + E.tenu.dx, y: E.tenu.y + E.tenu.dy } : { x: L.chapeau.x, y: L.chapeau.y });
  function majGarnir(dt, L) {
    const ga = E.garni;
    if (ga.pousse) { ga.pousse.taille += REGLAGES.rosace.pousse * dt; if (ga.pousse.taille > REGLAGES.rosace.max) poserRosace(); }
    // le chapeau, relâché : il se pose s'il est assez près, sinon il retourne à sa place
    if (ga.etape === 'fermer' && E.lache) {
      const c = E.lache, G = L.pb, err = Math.hypot((c.x - G.x) / G.RX, (c.y - etages(G).chy) / G.RY);
      E.lache = null;
      if (err < 0.6) { ga.couvercle = Math.round(clamp(100 - err * 150, 20, 100)); ga.etape = 'fini'; Musique.trouve(); remy('joie', T().remy.ferme); message(choix(T().bravo), 'bon'); aidePoste(); }
      else remy('parle', T().remy.fermeLoin);
    }
  }

  // ============================================================ 5. DRESSER : le nappage, les finitions, SERVIR
  function surDessert(pos, L, k = 1) { const G = L.pb; return dansEllipse(pos, G.x, etages(G).chy, G.RX, G.RY, k); }
  function surAssiette(pos, L) { const G = L.pb; return dansEllipse(pos, G.x, G.y, G.RX * 1.45, G.RY * 1.6); }
  DOWN.dresser = (pos, id, L) => {
    const dr = E.dress;
    if (dans(pos, L.servir)) { servir(); return; }
    if (dans(pos, L.casserole)) { E.tenu = { id, quoi: 'cuillere', x: pos.x, y: pos.y }; return; }
    const p = L.pots.find((b) => dans(pos, b));
    if (p) { E.tenu = { id, quoi: p.c, x: pos.x, y: pos.y, acc: 0 }; Musique.bip(640); }
    void dr;
  };
  MOVE.dresser = (pos, id, L, d, px, py) => {
    const tn = E.tenu, dr = E.dress, G = L.pb;
    if (!tn || tn.id !== id) return;
    tn.x = pos.x; tn.y = pos.y;
    const chy = etages(G).chy, dist = Math.hypot(pos.x - px, pos.y - py), rel = (q) => ({ u: (q.x - G.x) / G.RX, v: (q.y - chy) / G.RY });
    if (tn.quoi === 'cuillere' && dist > 0) {
      if (surDessert(pos, L, 1.05)) { const f = dr.filets[dr.filets.length - 1]; const pt = rel(pos); if (!tn.trait) { tn.trait = [pt]; dr.filets.push(tn.trait); } else tn.trait.push(pt); dr.nappe += dist * REGLAGES.nappe.parPixel * (60 / G.RX); void f; if (dr.nappe > REGLAGES.nappe.trop) { dr.coule += dist * 0.004; alerte('tropCaramel', 'panique', 4); } }
      else { tn.trait = null; if (surAssiette(pos, L)) dr.salete += dist * 0.05; }
    }
    if ((tn.quoi === 'amandes' || tn.quoi === 'pralin') && dist > 0) {
      tn.acc += dist;
      while (tn.acc > 5) { tn.acc -= 5; const q = { x: pos.x + (Math.random() - 0.5) * 10, y: pos.y + 6 + Math.random() * 6 }; if (surDessert(q, L, 1.05)) dr[tn.quoi].push(Object.assign(rel(q), { r: Math.random() })); else if (surAssiette(q, L)) dr.salete++; }
    }
    if (tn.quoi === 'sucre' && dist > 0) {
      tn.acc += dist;
      while (tn.acc > 3) { tn.acc -= 3; for (let k = 0; k < 3; k++) { const q = { x: pos.x + (Math.random() - 0.5) * 18, y: pos.y + 8 + Math.random() * 10 }; if (surDessert(q, L, 1.1)) { dr.sucre.push(rel(q)); dr.sucreQ = Math.min(1.5, dr.sucreQ + 0.006); } } }
    }
  };
  UP.dresser = (pos, id, L) => {
    const tn = E.tenu, dr = E.dress, G = L.pb;
    if (!tn || tn.id !== id) return;
    E.tenu = null;
    if (tn.quoi === 'noisettes') {
      if (surDessert(pos, L, 1.05)) { dr.noisettes.push({ u: (pos.x - G.x) / G.RX, v: (pos.y - etages(G).chy) / G.RY }); Musique.bip(820, 0.02); }
      else if (surAssiette(pos, L)) { dr.salete += 3; E.parts.push({ type: 'noisette', x: pos.x, y: pos.y, vx: (Math.random() - 0.5) * 60, vy: -40, t: 0, max: 0.8 }); }
    }
  };

  // ------------------------------------------------------------ boucle
  function update(dt, J) {
    if (!E) return;
    E.t += dt;
    const L = mise(J.V);
    if (E.bulleT > 0 && (E.bulleT -= dt) <= 0) $('cui-bulle').hidden = true;
    if (E.messageT > 0 && (E.messageT -= dt) <= 0) $('cui-message').hidden = true;
    if (E.phase === 'attend') E.attente += dt;
    majCommande(dt);
    if (!E) return; // le service vient de se terminer
    if (E.phase === 'attend') { majCaramel(dt); majFour(dt); majGarnir(dt, L); }
    // le chapeau qu'on vient de lâcher
    if (E.poste === 'garnir' && E.tenuPrec && !E.tenu) E.lache = E.tenuPrec;
    E.tenuPrec = E.tenu && E.tenu.quoi === 'chapeau' ? { x: E.tenu.x + E.tenu.dx, y: E.tenu.y + E.tenu.dy } : null;
    for (const q of E.parts) { q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.type === 'coeur' ? -4 : 160) * dt; }
    E.parts = E.parts.filter((q) => q.t < q.max);
    placerBulle(L);
  }
  function fermer(gagne) {
    const fin = E.fin, J = E.J;
    E = null; J.vue = null; J.cinematique = false;
    document.body.classList.remove('cuisine', 'service');
    $('cuisine').hidden = true; $('cui-bulle').hidden = true; $('cui-message').hidden = true; $('cui-client').hidden = true; aideVide();
    if (fin) fin(gagne);
  }
  function aideVide() { const a = $('cui-aide'); a.textContent = ''; a.hidden = true; a.style.bottom = ''; $('cui-bulle').style.left = ''; $('cui-bulle').style.bottom = ''; }

  // ============================================================ DESSIN
  const caches = {};
  const cache = (cle, f) => caches[cle] || (caches[cle] = f());
  const mkc = (w, h) => { const c = PX.canvas(w, h); return { c, P: PX.painter(c) }; };
  // un texte 3 × 5 centré
  const texteC = (P, t, x, y, col) => A.texte(P, t, Math.round(x - A.largeurTexte(t) / 2), y, col);
  function cadre(P, x, y, w, h, fond = '#2a1a14', bord = D.OR[2]) { P.rect(x, y, w, h, '#1d1626'); P.rect(x + 1, y + 1, w - 2, h - 2, bord); P.rect(x + 2, y + 2, w - 4, h - 4, fond); }
  function bouton(P, b, txt, actif = true, col = '#3a7a3a') {
    P.rect(b.x, b.y + 2, b.w, b.h - 1, '#1d1626');
    P.rect(b.x, b.y, b.w, b.h - 2, '#1d1626'); P.rect(b.x + 1, b.y + 1, b.w - 2, b.h - 4, actif ? col : '#5a5a66');
    P.hline(b.x + 2, b.y + 1, b.w - 4, actif ? PX.shade(col, 0.35) : '#7a7a86');
    texteC(P, txt, b.x + b.w / 2, b.y + Math.round((b.h - 7) / 2), '#fff6dc');
  }

  // ---- le Paris-Brest : la couronne de choux (avec son trou), la crème, le chapeau, le caramel, les garnitures
  // la couronne de choux : une suite de boules de pâte soufflées, craquelées, dorées (mises en cache)
  function anneau(RX, RY, H, cuisson, graine, plat = 1) {
    const cle = [RX, RY, H, Math.round(cuisson * 40), graine, plat].join(':');
    return cache('anneau' + cle, () => {
      const W = RX * 2 + 10, Hc = RY * 2 + H + 10, { c, P } = mkc(W, Hc), cx = RX + 5, cy = RY + 5, r = PX.rng(graine);
      const base = nuance(cuisson, CHOUX), fonce = PX.shade(base, -0.28), tresFonce = PX.shade(base, -0.46), clair = PX.shade(base, 0.14), brillant = PX.shade(base, 0.3);
      const n = Math.max(7, Math.round(RX / 4.4)), boules = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + (r() - 0.5) * 0.18, rr = 0.73 + (r() - 0.5) * 0.06, g = 0.9 + r() * 0.24;
        boules.push({ x: cx + Math.cos(a) * RX * rr, y: cy + Math.sin(a) * RY * rr, rx: Math.max(2, RX * 0.29 * g), ry: Math.max(1, RY * 0.29 * g) });
      }
      boules.sort((a, b) => a.y - b.y);
      for (const b of boules) {
        const bx = Math.round(b.x), byy = Math.round(b.y), rx = Math.round(b.rx), ry = Math.round(b.ry);
        for (let dy = H; dy >= 1; dy--) P.ellipse(bx, byy + dy, rx, ry, dy > H * 0.55 ? tresFonce : fonce);
        P.ellipse(bx, byy, rx, ry, base);
        if (rx > 3) {
          P.ellipse(bx - Math.round(rx * 0.22), byy - Math.round(ry * 0.3), Math.round(rx * 0.62), Math.max(1, Math.round(ry * 0.5)), clair);
          P.ellipse(bx - Math.round(rx * 0.4), byy - Math.round(ry * 0.45), Math.max(1, Math.round(rx * 0.22)), Math.max(1, Math.round(ry * 0.18)), brillant);
          // le craquelin : de petites fissures plus foncées, des grains de sucre
          for (let k = 0; k < 3 + (rx >> 2); k++) { const fx = Math.round(bx + (r() - 0.5) * rx * 1.3), fy = Math.round(byy + (r() - 0.4) * ry); P.hline(fx, fy, 1 + r.int(3), fonce); if (r() < 0.5) P.px(fx + 1, fy - 1, brillant); }
          P.hline(bx - rx + 2, byy + ry, rx * 2 - 3, tresFonce);
        } else P.px(bx - 1, byy - 1, brillant);
      }
      return PX.outline(c, '#3a1a0c');
    });
  }
  // une rosace de crème poussée à la douille cannelée (trois étages striés, une pointe), taille 1 = normale
  function rosace(P, x, y, s, creme, k) {
    const C = CREMES[creme] || CREMES.praline, rx = Math.max(1, Math.round(4.2 * s)), ry = Math.max(1, Math.round(3 * s));
    if (rx < 3) { P.ellipse(x, y, rx, ry, C[1]); P.px(x - 1, y - 1, C[3]); return; }
    for (let e = 0; e < 3; e++) {
      const ex = Math.max(1, Math.round(rx * (1 - e * 0.27))), ey = Math.max(1, Math.round(ry * (1 - e * 0.27))), yy = y - Math.round(e * ry * 0.6);
      P.ellipse(x, yy + 1, ex, ey, C[0]); P.ellipse(x, yy, ex, ey, C[1]);
      for (let j = 0; j < 10; j++) { const a = (j / 10) * Math.PI * 2 + k * 0.7 + e * 0.4, sx = Math.round(x + Math.cos(a) * ex * 0.78), sy = Math.round(yy + Math.sin(a) * ey * 0.78); P.px(sx, sy, Math.cos(a) + Math.sin(a) < 0 ? C[2] : C[0]); }
      P.px(x - Math.round(ex * 0.45), yy - Math.round(ey * 0.45), C[3]);
    }
    P.px(x, y - Math.round(ry * 1.55), C[1]); P.px(x + 1, y - Math.round(ry * 1.75), C[2]); P.px(x - 1, y - Math.round(ry * 1.3), C[3]);
  }
  const RAYON = 0.84; // les rosaces sont poussées près du bord extérieur de la couronne
  // les étages de la couronne (plus bas si les choux sont retombés) : la base, la ligne de coupe, la crème, le chapeau
  function etages(G) {
    const plat = E.four.degonfle ? 0.55 : 1, H = Math.max(2, Math.round(G.RY * 0.62 * plat)), Hb = Math.max(2, Math.round(H * 0.55)), Hc = Math.max(2, H - Hb + 1);
    const top = G.y + (H - Hb), creme = Math.max(2, Math.round(G.RY * 0.34));
    return { plat, H, Hb, Hc, top, chy: top - creme - Hc, ligne: G.y + G.RY + (H - Hb), ros: top - Math.round(G.RY * 0.06) };
  }
  // le dessert entier : base, crème, chapeau, caramel, garnitures (cx, cy : milieu du dessus de la couronne entière)
  function dessinPB(g, P, cx, cy, RX, RY, o = {}) {
    const ga = E.garni, cuisson = E.four.cuisson, e = etages({ x: cx, y: cy, RX, RY });
    const coupe = o.coupe ?? (ga.etape !== 'couper');
    if (!coupe) { g.drawImage(anneau(RX, RY, e.H, cuisson, 3, e.plat), Math.round(cx - RX - 6), Math.round(cy - RY - 6)); return; }
    g.drawImage(anneau(RX, RY, e.Hb, cuisson, 3, e.plat), Math.round(cx - RX - 6), Math.round(e.top - RY - 6));
    // la crème
    const ros = (o.rosaces || ga.rosaces).slice();
    const enCours = o.pousse !== false && ga.pousse ? [{ a: ga.pousse.a, taille: ga.pousse.taille }] : [];
    const tout = ros.concat(enCours).map((r) => ({ r, x: cx + Math.cos(r.a) * RX * RAYON, y: e.ros + Math.sin(r.a) * RY * RAYON })).sort((a, b) => a.y - b.y);
    const s0 = (RX / 64) * 2.2, crem = ga.poche || E.cmd.creme;
    const dessin = (liste) => liste.forEach(({ r, x, y }, k) => rosace(P, Math.round(x), Math.round(y), r.taille * s0, crem, k));
    if (!(o.chapeau ?? (ga.etape === 'fini'))) { dessin(tout); return; }
    dessin(tout.filter((q) => q.y < e.ros));
    // le chapeau, posé sur la crème
    g.drawImage(anneau(RX - 1, RY - 1, e.Hc, Math.min(1, cuisson + 0.04), 9, e.plat), Math.round(cx - RX - 5), Math.round(e.chy - RY - 5));
    dessin(tout.filter((q) => q.y >= e.ros));
    if (o.garnitures !== false) garnitures(g, P, cx, e.chy, RX, RY);
  }
  // le caramel et les garnitures posés sur le chapeau (coordonnées enregistrées par rapport au chapeau)
  function garnitures(g, P, cx, cy, RX, RY) {
    const dr = E.dress, X = (q) => Math.round(cx + q.u * RX), Y = (q) => Math.round(cy + q.v * RY);
    const col = nuance(Math.min(0.9, (E.caramel.cBeurre ?? 0.55) + 0.16)), clair = PX.shade(col, 0.45), sombre = PX.shade(col, -0.35), gros = RX > 30;
    for (const q of dr.sucre) P.px(X(q), Y(q), '#ffffff');
    for (const f of dr.filets) for (let k = 1; k < f.length; k++) { const a = f[k - 1], b = f[k]; if (gros) { line(P, X(a), Y(a) + 1, X(b), Y(b) + 1, sombre); line(P, X(a), Y(a), X(b), Y(b), col); line(P, X(a), Y(a) - 1, X(b), Y(b) - 1, col); if (k % 3 === 0) P.px(X(b), Y(b) - 1, clair); } else line(P, X(a), Y(a), X(b), Y(b), col); }
    if (dr.coule > 0) for (let k = 0; k < Math.min(10, Math.ceil(dr.coule * 6)); k++) { const x = cx - RX + 6 + ((k * 37) % (RX * 2 - 12)); P.rect(x, cy + RY - 2, 2, 4 + (k % 3) * 2, col); }
    for (const q of dr.amandes) { P.rect(X(q), Y(q), gros ? 3 : 1, 1, '#f6ead0'); if (gros) P.px(X(q) + (q.r > 0.5 ? 2 : 0), Y(q) + 1, '#c8a878'); }
    for (const q of dr.pralin) { P.px(X(q), Y(q), q.r > 0.5 ? '#6a3a1a' : '#c8843a'); if (gros && q.r > 0.7) P.px(X(q) + 1, Y(q), '#e8b878'); }
    for (const q of dr.noisettes) { if (!gros) { P.px(X(q), Y(q), '#7a4a22'); continue; } P.ellipse(X(q), Y(q) + 1, 3, 3, '#4a2410'); P.ellipse(X(q), Y(q), 3, 3, '#8a5426'); P.ellipse(X(q) - 1, Y(q) - 1, 1, 1, '#c89a5a'); P.px(X(q) - 1, Y(q) - 2, '#f0d8a0'); P.px(X(q) + 1, Y(q) + 2, '#e4a440'); }
  }

  // ---- les petites icônes du ticket
  function icone(P, quoi, x, y) {
    const c = E.cmd;
    if (quoi === 'caramel') { P.ellipse(x + 3, y + 3, 3, 3, '#1d1626'); P.ellipse(x + 3, y + 3, 2, 2, nuance((REGLAGES.bandes[c.caramel][0] + REGLAGES.bandes[c.caramel][1]) / 2)); P.px(x + 2, y + 2, '#ffffff'); }
    else if (quoi === 'creme') { const C = CREMES[c.creme]; P.trap(x, 7, x + 3, 1, y, 6, C[1]); P.hline(x, y, 7, C[3]); }
    else if (quoi === 'rosace') { P.ellipse(x + 3, y + 3, 3, 2, CREMES[c.creme][1]); P.px(x + 3, y + 1, CREMES[c.creme][3]); }
    else if (quoi === 'nappe') { line(P, x, y + 2, x + 6, y + 4, '#c8782a'); line(P, x, y + 4, x + 6, y + 2, '#e4a440'); }
    else if (quoi === 'sel') { for (const [dx, dy] of [[1, 1], [4, 2], [2, 4], [5, 5]]) P.px(x + dx, y + dy, '#ffffff'); }
    else if (quoi === 'noisettes') { P.ellipse(x + 3, y + 3, 2, 2, '#7a4a22'); P.px(x + 2, y + 2, '#c89a5a'); }
    else if (quoi === 'amandes') { P.rect(x + 1, y + 2, 3, 1, '#f2e2c0'); P.rect(x + 3, y + 4, 3, 1, '#f2e2c0'); }
    else if (quoi === 'sucre') { P.dither(x, y, 7, 6, '#ffffff', 8); }
    else if (quoi === 'pralin') { for (const [dx, dy] of [[1, 1], [4, 1], [2, 4], [5, 4], [3, 3]]) P.px(x + dx, y + dy, dx % 2 ? '#8a5a2a' : '#c8843a'); }
  }
  // le ticket (petit, en haut à droite, ou grand, au poste COMMANDE) ; n : nombre de lignes déjà écrites
  function ticket(P, x, y, w, n, grand) {
    const lignes = lignesTicket(), lh = grand ? 12 : 8, h = 16 + lignes.length * lh;
    P.rect(x + 1, y + 1, w, h, 'rgba(0,0,0,0.35)');
    P.rect(x, y, w, h, '#fbf8ee'); for (let k = 0; k < w; k += 4) P.px(x + k + 2, y + h, '#fbf8ee');
    P.rect(x, y, w, 9, '#e8e0cc'); texteC(P, (CONFIG.personnages[E.client.id] || {}).nom ? T().ticket.table + ' ' + (E.n + 3) : 'TICKET', x + w / 2, y + 2, '#8a2a2a');
    P.px(x + w / 2, y - 1, '#d8323a'); P.rect(x + w / 2 - 1, y - 2, 3, 2, '#d8323a');
    lignes.slice(0, n).forEach(([ic, txt, rouge], k) => {
      const ly = y + 12 + k * lh;
      icone(P, ic, x + 3, ly + (grand ? 1 : -1));
      A.texte(P, txt, x + 13, ly + (grand ? 2 : 0), rouge ? '#c81a2a' : '#2a2430');
      if (rouge) line(P, x + 2, ly + 6, x + 10, ly - 1, '#c81a2a');
    });
    return h;
  }

  // ---- la scène de la salle (poste COMMANDE), dessinée à moitié de la taille puis agrandie ×2
  const salle = { c: null, k: '' };
  function sceneSalle(g, L, t) {
    const hw = L.hw, hh = L.hh, cle = hw + 'x' + hh;
    if (salle.k !== cle) {
      salle.k = cle; salle.c = PX.canvas(hw, hh); salle.fond = PX.canvas(hw, hh);
      const P = PX.painter(salle.fond), mur = Math.round(hh * 0.55);
      D.papierPeint(P, 0, 0, hw, mur);
      P.rect(0, mur - 4, hw, 4, D.NOYER[3]); P.hline(0, mur - 4, hw, D.NOYER[5]); P.hline(0, mur - 2, hw, D.OR[3]);
      P.rect(0, mur, hw, 8, D.NOYER[2]); for (let x = 2; x < hw; x += 24) D.panneau(P, x, mur + 1, 22, 6);
      D.miroir(P, Math.round(hw * 0.12), 6, 34, mur - 14); D.miroir(P, Math.round(hw * 0.62), 6, 34, mur - 14);
      D.applique(P, Math.round(hw * 0.08), 18); D.applique(P, Math.round(hw * 0.5), 18); D.applique(P, Math.round(hw * 0.92), 18);
      const r = PX.rng(5);
      for (let y = mur + 8, j = 0; y < hh; y += 4, j++) for (let x = -((j * 3) % 12); x < hw; x += 12) { const a = r.pick(['#6e4024', '#7a4a28', '#84522c']), b = r.pick(['#8e5a32', '#9a6640']); P.rect(x, y, 6, 4, a); P.rect(x + 6, y, 6, 4, b); P.vline(x + 6, y, 4, '#3e2214'); }
      P.dither(0, mur + 8, hw, 6, '#1a0a06', 8);
      // une autre table au loin, à gauche, et le sapin à droite
      const t0 = D.tableRonde(8, { couverts: 3, mets: true }), tx0 = Math.round(hw * 0.02), cx0 = tx0 + t0.ax, ty0 = mur - 6 + t0.ay;
      for (const [id, dx] of [['clienteResto', -9], ['clientResto', 9]]) { const sp = Sprites.person(CONFIG.caramel.persos[id]).down.idle; P.draw(sp, cx0 + dx - Math.round(sp.width / 2), ty0 - 20 - sp.height + 2); }
      P.draw(t0.img, tx0, mur - 6);
      P.draw(Objets.grandSapin(41).img, hw - 44, mur - 40);
      salle.table = D.tableRonde(31, { couverts: 2, mets: false, rose: true, vin: true });
      salle.chaise = D.chaise('face');
    }
    const P = PX.painter(salle.c), sg = salle.c.getContext('2d'), mur = Math.round(hh * 0.55);
    sg.drawImage(salle.fond, 0, 0);
    // le client, assis à sa table
    const tx = Math.round(hw * 0.36), ty = mur + 36, C = E.client;
    const spr = cache('spr' + C.id, () => Sprites.person(CONFIG.caramel.persos[C.id]));
    const arrive = E.phase === 'arrive' ? clamp(E.tPhase / 1.4) : 1;
    sg.drawImage(salle.chaise.img, tx - salle.chaise.ax, ty - 22 - salle.chaise.ay);
    const cxp = Math.round(tx - 40 + arrive * 40), assis = arrive >= 1;
    const im = !assis ? spr.right.walk[Math.floor(E.t * 8) % 4] : Math.floor(E.t * 0.7) % 7 === 0 && (E.t % 1.43) < 0.15 ? spr.down.blink : spr.down.idle;
    const saut = E.phase === 'bilan' && (E.resultat.niveau === 'parfait' || E.resultat.niveau === 'bien') ? Math.round(Math.abs(Math.sin(E.t * 9)) * 3) : 0;
    const trem = E.phase === 'bilan' && E.resultat.niveau === 'rate' ? Math.round(Math.sin(E.t * 30)) : 0;
    sg.drawImage(im, cxp - Math.round(im.width / 2) + trem, ty - 20 - im.height + 2 - saut);
    sg.drawImage(salle.table.img, tx - salle.table.ax, ty - salle.table.ay);
    // le dessert dans l'assiette (pendant le service), qui disparaît bouchée après bouchée
    const surTable = E.phase === 'mange' || E.phase === 'bilan' || (E.phase === 'sert' && E.tPhase > 1.6);
    if (surTable) {
      const ax = tx, ay = ty - 22;
      P.ellipse(ax, ay + 3, 13, 4, '#c8c4bc'); P.ellipse(ax, ay + 2, 12, 3, '#ffffff'); P.ellipse(ax, ay + 2, 10, 2, '#f4f2ec');
      const reste = 1 - (E.phase === 'bilan' ? 1 : E.mange) * 0.85;
      if (reste > 0.2) { sg.save(); sg.beginPath(); sg.rect(ax - 14, ay - 14, Math.round(28 * reste), 20); sg.clip(); dessinPB(sg, P, ax, ay - 1, 10, 5); sg.restore(); }
      if (E.phase !== 'sert') for (let k = 0; k < 5; k++) P.px(ax - 7 + k * 3, ay + 3, '#d8a050');
    }
    // Linguini qui arrive en patins avec l'assiette
    if (E.phase === 'sert') {
      const lspr = cache('sprLin', () => Sprites.person(CONFIG.caramel.persos.linguini)), p = clamp(E.tPhase / 1.6);
      const lx = Math.round(-20 + p * (tx + 18 + 20)), ly = ty + 4;
      const lim = p < 1 ? lspr.right.walk[Math.floor(E.t * 10) % 4] : lspr.left.idle;
      sg.drawImage(lim, lx - Math.round(lim.width / 2), ly - lim.height + 2);
      if (p < 1) { P.ellipse(lx + 6, ly - 15, 6, 2, '#ffffff'); P.ellipse(lx + 6, ly - 17, 4, 2, '#d8a050'); }
    }
    // les réactions : cœurs, étoiles, nuage d'orage
    if (E.phase === 'bilan') {
      const r = E.resultat.niveau, bx = cxp + 8, by = ty - 52;
      if (r === 'parfait' || r === 'bien') { const b = Entites.SPR.bulles.coeur; sg.drawImage(b, bx, by - Math.round(Math.abs(Math.sin(E.t * 4)) * 2)); }
      else if (r === 'moyen') { P.ellipse(bx + 5, by + 4, 6, 4, '#fff8e8'); for (let k = 0; k < 3; k++) P.px(bx + 2 + k * 3, by + 4, '#1d1626'); }
      else { P.ellipse(bx + 5, by + 3, 7, 4, '#5a5a6a'); P.ellipse(bx + 2, by + 2, 4, 3, '#6a6a7a'); if (Math.floor(E.t * 4) % 2) line(P, bx + 5, by + 7, bx + 3, by + 11, '#f2d020'); }
      // Anton Ego : quand c'est parfait, son stylo lui tombe des mains
      if (C.id === 'ego' && r === 'parfait') { const f = clamp(E.tPhase / 0.8); P.rect(cxp + 6, Math.round(ty - 26 + f * 12), 1, 4, '#1d1626'); }
    }
    // le passe, au premier plan : la tablette des lampes chauffantes, le comptoir d'inox
    const I = D.INOX;
    P.rect(0, 0, hw, 5, I[3]); P.hline(0, 4, hw, I[1]); for (let x = 16; x < hw; x += 40) { P.rect(x - 4, 5, 9, 3, '#8a2a1e'); P.hline(x - 3, 8, 7, '#ffb070'); }
    P.rect(0, hh - 24, hw, 14, I[4]); P.hline(0, hh - 24, hw, I[6]); P.hline(0, hh - 23, hw, I[5]); P.dither(0, hh - 21, hw, 11, I[3], 5); P.hline(0, hh - 11, hw, I[1]);
    for (let x = 6; x < hw * 0.5; x += 22) { P.ellipse(x + 7, hh - 24, 7, 2, '#c8c4bc'); P.ellipse(x + 7, hh - 25, 7, 2, '#f4f2ec'); P.ellipse(x + 7, hh - 26, 3, 1, ['#d8323a', '#3a7a3a', '#e8b54a'][(x / 22 | 0) % 3]); P.px(x + 6, hh - 27, '#5aa05a'); }
    g.drawImage(salle.c, 0, 0, hw * 2, hh * 2);
    // la chaleur des lampes et la lueur des bougies (par-dessus, à la taille réelle)
    g.globalAlpha = 0.18; g.fillStyle = '#ffb060'; g.fillRect(0, 0, L.w, 30); g.globalAlpha = 1;
  }
  function posteCommande(g, P, L, t) {
    sceneSalle(g, L, t);
    eclairer(g, L, 'commande');
    const C = E.client, GT = L.grandTicket;
    // ce que dit le client (dans une bulle HTML, au-dessus de lui)
    let dit = null;
    if (E.phase === 'parle') dit = E.dit[Math.min(E.dit.length - 1, Math.floor(E.tPhase / 2.4))];
    else if (E.phase === 'sert') dit = T().linguini;
    else if (E.phase === 'mange') dit = T().gouter;
    else if (E.phase === 'bilan' && E.tPhase > 0.6) dit = E.repliqueClient;
    else if (E.phase === 'attend') dit = E.client.attend[Math.floor(E.attente / 7) % E.client.attend.length];
    bulleClient(dit, L, E.phase === 'sert' ? 'linguini' : E.client.id);
    if (E.phase === 'parle' || E.phase === 'arrive') {
      const h = ticket(P, GT.x, GT.y, GT.w, E.ecrit, true);
      void h; if (E.phase === 'parle' && E.ecrit >= lignesTicket().length) bouton(P, btnNoter(L), T().boutons.noter, true, '#a8343c');
    }
    if (E.phase === 'bilan' || E.phase === 'fini') bilan(g, P, L, t);
  }
  // la bulle du client (en HTML, pour que le texte reste net) : en haut à gauche de la scène
  function bulleClient(txt, L, qui) {
    const b = $('cui-client');
    if (!txt) { if (!b.hidden) { b.hidden = true; b.dataset.t = ''; } return; }
    const cle = qui + ':' + txt;
    if (b.dataset.t !== cle) {
      b.dataset.t = cle; b.textContent = ''; b.hidden = false;
      const n = document.createElement('b'); n.textContent = (CONFIG.personnages[qui] || { nom: '' }).nom; n.style.color = (CONFIG.personnages[qui] || {}).couleur || '#8a2a2a';
      b.append(n, document.createElement('br'), txt);
      b.classList.remove('arrive'); void b.offsetWidth; b.classList.add('arrive');
    }
    // au-dessus de la tête du client (la scène est dessinée deux fois plus grosse)
    const k = E.J.V.s / Math.min(window.devicePixelRatio || 1, 3), tete = 2 * (Math.round(L.hh * 0.55) - 12);
    b.style.left = Math.round(Math.max(4, L.hw * 0.36 * 2 - 70) * k) + 'px'; b.style.bottom = Math.round((L.h - tete + 6) * k) + 'px'; b.style.top = '';
    b.style.maxWidth = Math.round(Math.min(L.w * 0.44, L.grandTicket.x - L.hw * 0.36 * 2 + 60) * k) + 'px';
  }
  // le bilan du client : une note par poste (en étoiles), la note finale, le pourboire
  function bilan(g, P, L, t) {
    if (E.phase === 'fini') { const w = 170, x = Math.round(L.w / 2 - w / 2), y = L.haut + 20; cadre(P, x, y, w, 70, '#2a1a14'); texteC(P, T().finiTitre, L.w / 2, y + 8, '#f0cc6a'); E.notes.forEach((r, k) => { A.texte(P, T().noms[k], x + 12, y + 22 + k * 12, '#f6ead2'); etoiles(P, x + w - 70, y + 21 + k * 12, r.total); }); return; }
    const r = E.resultat, { w, x, y } = L.bilan;
    const rows = [['attente', T().bilan.attente], ['caramel', T().bilan.caramel], ['choux', T().bilan.choux], ['montage', T().bilan.montage], ['dressage', T().bilan.dressage]];
    const h = L.bilan.h;
    cadre(P, x, y, w, h, '#2a1a14');
    texteC(P, T().bilan.titre, x + w / 2, y + 6, '#f0cc6a');
    const vis = Math.floor(E.tPhase / 0.25);
    rows.forEach(([k, nom], j) => { if (j >= vis) return; const ly = y + 18 + j * 11; A.texte(P, nom, x + 8, ly, '#f6ead2'); etoiles(P, x + w - 58, ly - 1, r[k]); });
    if (vis > rows.length) {
      const ly = y + 22 + rows.length * 11; P.hline(x + 6, ly - 3, w - 12, D.OR[2]);
      A.texte(P, T().bilan.total, x + 8, ly, '#f0cc6a'); texteC(P, r.total + ' / 100', x + w - 32, ly, r.niveau === 'rate' ? '#ff9a8a' : '#9ae8b0');
      if (r.pourboire) { A.texte(P, T().bilan.pourboire, x + 8, ly + 10, '#f6ead2'); for (let k = 0; k < Math.min(8, Math.ceil(r.pourboire / 2)); k++) { P.ellipse(x + w - 54 + k * 6, ly + 12, 2, 2, '#e8b54a'); P.px(x + w - 55 + k * 6, ly + 11, '#fff0b8'); } }
    }
    if (E.tPhase > 1.2) bouton(P, L.btnBilan, r.niveau === 'rate' ? T().boutons.refaire : E.n + 1 < T().clients.length ? T().boutons.suivant : T().boutons.fin, true, r.niveau === 'rate' ? '#a8343c' : '#3a7a3a');
  }
  function etoiles(P, x, y, note) {
    const n = note / 20;
    for (let k = 0; k < 5; k++) { const plein = n >= k + 0.75, demi = !plein && n >= k + 0.25, cx = x + k * 11 + 4, cy = y + 3;
      const c = plein ? '#f2c230' : '#4a3a30';
      P.px(cx, cy - 3, c); P.hline(cx - 1, cy - 2, 3, c); P.hline(cx - 4, cy - 1, 9, c); P.hline(cx - 3, cy, 7, c); P.hline(cx - 2, cy + 1, 5, c); P.hline(cx - 3, cy + 2, 2, c); P.hline(cx + 2, cy + 2, 2, c);
      if (demi) { P.px(cx - 1, cy - 2, '#f2c230'); P.hline(cx - 4, cy - 1, 4, '#f2c230'); P.hline(cx - 3, cy, 3, '#f2c230'); P.hline(cx - 2, cy + 1, 2, '#f2c230'); P.hline(cx - 3, cy + 2, 2, '#f2c230'); }
      if (plein) P.px(cx - 1, cy - 1, '#fff4c0');
    }
  }

  // ---- la lumière des postes : une lampe chaude au-dessus du plan de travail, les bords dans la pénombre
  function lumierePoste(L, quoi) {
    return cache('lum' + quoi + L.w + 'x' + L.h, () => {
      const c = PX.canvas(L.w, L.h), g = c.getContext('2d');
      g.fillStyle = '#c9b2a4'; g.fillRect(0, 0, L.w, L.h);
      g.globalCompositeOperation = 'lighter';
      const src = { commande: [[0.36, 0.62, 0.42], [0.08, 0.2, 0.2], [0.5, 0.2, 0.2], [0.92, 0.2, 0.2]], caramel: [[0.42, 0.6, 0.48], [0.74, 0.62, 0.3], [0.2, 0.35, 0.25]],
        four: [[0.32, 0.62, 0.45], [0.71, 0.5, 0.32]], garnir: [[0.47, 0.6, 0.5], [0.15, 0.3, 0.25]], dresser: [[0.47, 0.6, 0.5], [0.3, 0.2, 0.3], [0.84, 0.88, 0.22]] }[quoi];
      for (const [fx, fy, fr] of src) { const x = L.w * fx, y = L.h * fy, r = L.w * fr, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(66,54,40,1)'); gr.addColorStop(0.6, 'rgba(40,30,22,0.6)'); gr.addColorStop(1, 'rgba(40,30,22,0)'); g.fillStyle = gr; g.fillRect(0, 0, L.w, L.h); }
      return c;
    });
  }
  function ombrePoste(L) {
    return cache('vig' + L.w + 'x' + L.h, () => {
      const c = PX.canvas(L.w, L.h), g = c.getContext('2d'), gr = g.createRadialGradient(L.w / 2, L.h * 0.55, Math.min(L.w, L.h) * 0.35, L.w / 2, L.h * 0.55, Math.max(L.w, L.h) * 0.72);
      gr.addColorStop(0, 'rgba(10,6,20,0)'); gr.addColorStop(1, 'rgba(10,6,20,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, L.w, L.h);
      return c;
    });
  }
  function eclairer(g, L, quoi) {
    g.globalCompositeOperation = 'multiply'; g.drawImage(lumierePoste(L, quoi), 0, 0);
    g.globalCompositeOperation = 'source-over'; g.drawImage(ombrePoste(L), 0, 0);
  }

  // ---- des ustensiles suspendus, en gros plan (casseroles par le manche, louche, fouet, écumoire, spatule)
  function ustensiles(P, x0, x1, y, seed) {
    const r = PX.rng(seed), I = D.INOX, cu = D.CUIVRE;
    P.rect(x0 - 4, y - 1, x1 - x0 + 8, 3, I[4]); P.hline(x0 - 4, y - 1, x1 - x0 + 8, I[6]); P.hline(x0 - 4, y + 2, x1 - x0 + 8, '#9a9aa4');
    for (const x of [x0 - 2, x1 + 1]) { P.rect(x, y - 4, 2, 7, I[2]); }
    let k = 0;
    for (let x = x0 + 6; x < x1 - 6; k++) {
      const t = [0, 1, 2, 0, 3, 4][k % 6];
      P.px(x, y + 2, I[1]); P.px(x, y + 3, I[1]);
      if (t === 0) { // une casserole de cuivre, accrochée par le manche
        const s = 7 + r.int(4); P.rect(x - 1, y + 4, 2, 12, '#3a3440'); P.px(x, y + 5, I[5]);
        P.ellipse(x, y + 16 + s, s + 1, s + 1, cu[1]); P.ellipse(x, y + 16 + s, s, s, cu[3]); P.ellipse(x - 2, y + 15 + s, s - 3, s - 3, cu[4]); P.ellipse(x - 3, y + 13 + s, 2, 2, cu[5]);
        P.ellipse(x + 2, y + 18 + s, s - 4, s - 4, cu[2]); x += s * 2 + 7;
      } else if (t === 1) { // la louche
        P.vline(x, y + 4, 18, I[5]); P.vline(x + 1, y + 4, 18, I[3]); P.ellipse(x, y + 25, 5, 4, I[3]); P.ellipse(x - 1, y + 24, 3, 2, I[5]); P.px(x - 2, y + 23, I[6]); x += 13;
      } else if (t === 2) { // le fouet
        P.rect(x - 1, y + 4, 3, 9, D.NOYER[3]); P.px(x - 1, y + 5, D.NOYER[5]);
        for (const dx of [-4, -2, 0, 2, 4]) line(P, x, y + 13, x + dx, y + 24, I[5]); D.anneau(P, x, y + 24, 4, 3, I[4]); x += 13;
      } else if (t === 3) { // l'écumoire
        P.vline(x, y + 4, 14, I[5]); P.ellipse(x, y + 22, 5, 5, I[4]); for (let j = -3; j <= 3; j += 2) for (let i = -3; i <= 3; i += 2) if (i * i + j * j < 13) P.px(x + i, y + 22 + j, I[1]); x += 14;
      } else { // la spatule de bois
        P.rect(x - 1, y + 4, 2, 14, D.CHENE[3]); P.rect(x - 3, y + 18, 6, 9, D.CHENE[4]); P.vline(x - 3, y + 18, 9, D.CHENE[5]); P.hline(x - 3, y + 26, 6, D.CHENE[2]); x += 12;
      }
    }
  }
  // la fiche de recette de la grand-mère, punaisée au mur (le caramel au beurre salé)
  function ficheRecette(P, x, y, titre) {
    P.rect(x + 1, y + 1, 50, 32, 'rgba(0,0,0,0.25)');
    P.rect(x, y, 50, 32, '#f4e8c8'); P.dither(x, y, 50, 32, '#e8d8b0', 4); P.hline(x, y + 8, 50, '#d8323a');
    A.texte(P, titre, x + 25 - Math.round(A.largeurTexte(titre) / 2), y + 2, '#8a2a2a');
    for (let k = 0; k < 5; k++) P.hline(x + 4, y + 12 + k * 4, 18 + ((k * 13) % 22), '#7a7088');
    P.px(x + 42, y + 26, '#ff7a9a'); P.px(x + 44, y + 26, '#ff7a9a'); P.hline(x + 42, y + 27, 3, '#ff7a9a'); P.px(x + 43, y + 28, '#ff7a9a');
    P.ellipse(x + 3, y + 1, 2, 2, '#c8283a'); P.px(x + 2, y, '#ff8a8a'); P.ellipse(x + 47, y + 1, 2, 2, '#2c7a44'); P.px(x + 46, y, '#7ad08a');
  }

  // ---- le décor des postes de cuisine (mis en cache par taille)
  function fondCuisine(L, quoi) {
    return cache('fond' + quoi + L.w + 'x' + L.h, () => {
      const { c, P } = mkc(L.w, L.h), r = PX.rng(quoi.length * 7), w = L.w, I = D.INOX;
      const plan = quoi === 'caramel' ? L.plan : Math.round(L.haut + L.ht * 0.38);
      D.faience(P, 0, 0, w, plan);
      P.dither(0, plan - 6, w, 6, '#5a4a40', 3);
      if (quoi === 'caramel') {
        ustensiles(P, Math.round(w * 0.27), Math.round(w * 0.6), L.haut + 6, 3);
        ficheRecette(P, Math.round(w * 0.05), L.haut + 14, 'CARAMEL');
        D.etageresMur(P, Math.round(w * 0.63), L.haut + 30, Math.round(w * 0.21), [16], 21);
        // le plan de cuisson : fonte noire, chant d'inox, grilles ; à droite, le plan de travail en bois
        P.rect(0, plan, w, L.h - plan, '#1e1c24'); P.dither(0, plan, w, L.h - plan, '#26242e', 6);
        P.rect(0, plan, w, 3, I[4]); P.hline(0, plan, w, I[6]); P.hline(0, plan + 3, w, '#0e0c12');
        for (let x = 4; x < w * 0.56; x += 26) P.rect(x, plan + 5, 2, L.h - plan, '#2e2c36');
        // le plan de travail en bois clair (la planche des ingrédients)
        const B = L.planche;
        P.rect(B.x - 4, B.y - 4, B.w + 8, B.h + 10, D.CHENE[1]);
        P.rect(B.x - 3, B.y - 3, B.w + 6, B.h + 6, D.CHENE[3]); for (let yy = B.y - 3; yy < B.y + B.h + 3; yy += 5) P.hline(B.x - 3, yy, B.w + 6, D.CHENE[2]);
        D.veines(P, r, B.x - 2, B.y - 2, B.w + 4, B.h + 4, D.CHENE[4], 30, 8); P.hline(B.x - 3, B.y - 3, B.w + 6, D.CHENE[5]); P.rect(B.x - 4, B.y + B.h + 3, B.w + 8, 3, D.CHENE[0]);
        P.ellipse(B.x + B.w - 8, B.y + 4, 3, 2, D.CHENE[1]);
        // le panneau des boutons de feu, en bas
        P.rect(0, L.bas - 18, w * 0.62, 18, I[3]); P.hline(0, L.bas - 18, w * 0.62, I[6]); P.dither(0, L.bas - 17, w * 0.62, 17, I[4], 4);
      } else {
        if (quoi === 'garnir') { const y = L.haut + 50; P.rect(2, y, 160, 4, D.CHENE[3]); P.hline(2, y, 160, D.CHENE[5]); P.hline(2, y + 4, 160, '#6a5a50'); for (const x of [8, 150]) P.rect(x, y + 4, 3, 6, D.CHENE[1]); }
        else D.etageresMur(P, Math.round(w * 0.02), L.haut + 34, Math.round(w * 0.3), [16], quoi.length * 3, { patisserie: true });
        if (quoi === 'four') ustensiles(P, Math.round(w * 0.33), Math.round(w * 0.55), L.haut + 4, 9);
        if (quoi === 'garnir') { ficheRecette(P, Math.round(w * 0.34), L.haut + 8, 'PARIS-BREST'); ustensiles(P, Math.round(w * 0.5), Math.round(w * 0.8), L.haut + 4, 4); }
        if (quoi === 'dresser') { ustensiles(P, Math.round(w * 0.66), Math.round(w * 0.84), L.haut + 4, 6); D.fenetre(P, Math.round(w * 0.86), L.haut + 30, 40, 26); }
        if (quoi === 'dresser') {
          P.rect(0, plan, w, L.h - plan, D.CHENE[3]);
          for (let y = plan, j = 0; y < L.h; y += 7, j++) { P.hline(0, y, w, D.CHENE[2]); P.hline(0, y + 1, w, D.CHENE[4]); for (let x = (j * 37) % 70; x < w; x += 70 + (j % 3) * 9) { P.vline(x, y + 1, 6, D.CHENE[1]); P.px(x + 1, y + 2, D.CHENE[5]); } }
          D.veines(P, r, 0, plan, w, L.h - plan, D.CHENE[4], 90, 12); D.veines(P, r, 0, plan, w, L.h - plan, D.CHENE[2], 60, 8);
        } else {
          P.rect(0, plan, w, L.h - plan, D.MARBRE[3]); P.dither(0, plan, w, L.h - plan, D.MARBRE[2], 4);
          for (let k = 0; k < 9; k++) { let x = r.int(w), y = plan + r.int(L.h - plan); for (let s = 0; s < 40; s++) { x += r.int(3) - 1 + (k % 2 ? 1 : -1) * 0.6; y += r.int(3) - 1 + 0.4; P.px(Math.round(x), Math.round(y), s % 4 ? D.MARBRE[1] : D.MARBRE[0]); } }
          D.veines(P, r, 0, plan, w, L.h - plan, D.MARBRE[4], 40, 6);
          // de la farine renversée
          for (let k = 0; k < 160; k++) { const a = r() * 6.28, d = Math.sqrt(r()); P.px(Math.round(w * (quoi === 'four' ? 0.12 : 0.3) + Math.cos(a) * d * 40), Math.round(L.bas - 30 + Math.sin(a) * d * 8), r.pick(['#ffffff', '#f4efe2'])); }
        }
        P.hline(0, plan, w, quoi === 'dresser' ? D.CHENE[5] : '#ffffff'); P.rect(0, plan + 1, w, 2, quoi === 'dresser' ? D.CHENE[1] : D.MARBRE[1]);
        P.dither(0, plan + 3, w, 4, '#000000', 3);
      }
      return c;
    });
  }

  // ---- 2. le poste du caramel
  // une casserole de cuivre en gros plan : rebord roulé, corps poli, intérieur étamé, manche de fer riveté (à gauche)
  function casseroleCuivre(P, x, y, R, ry, h) {
    const cu = D.CUIVRE;
    for (let k = 0; k < 3; k++) line(P, x - R + 2, y + 3 + k, x - R - Math.round(R * 0.95), y - 6 + k, ['#4a4458', '#2a2632', '#1d1626'][k]);
    P.px(x - R - Math.round(R * 0.95) - 1, y - 5, '#4a4458'); P.ellipse(x - R - Math.round(R * 0.9), y - 4, 2, 2, '#1d1626');
    for (let i = -R; i <= R; i++) {
      const u = (i + R) / (2 * R), col = u < 0.08 ? cu[3] : u < 0.18 ? cu[5] : u < 0.26 ? cu[4] : u < 0.6 ? cu[3] : u < 0.86 ? cu[2] : cu[1];
      const yb = y + h + Math.round(Math.sqrt(Math.max(0, 1 - (i / R) ** 2)) * ry);
      P.vline(x + i, y, yb - y + 1, col);
    }
    P.ellipse(x, y + h, R, ry, cu[1]); for (let i = -R + 1; i < R; i++) { const yb = y + h + Math.round(Math.sqrt(Math.max(0, 1 - (i / R) ** 2)) * ry); P.px(x + i, yb - 1, cu[2]); }
    P.hline(x - R, y + Math.round(h * 0.35), R * 2 + 1, PX.shade(cu[3], 0.12));
    for (const dx of [-R + 2, -R + 5]) P.px(x + dx, y + 4, cu[5]);
    P.ellipse(x, y, R, ry, cu[5]); P.ellipse(x, y + 1, R - 2, ry - 1, cu[2]);
    P.ellipse(x, y + 2, R - 3, ry - 2, '#6a6a76'); P.ellipse(x, y + 3, R - 4, ry - 3, '#8a8a96');
  }
  function posteCaramel(g, P, L, t) {
    const ca = E.caramel, p = L.pan, bande = REGLAGES.bandes[E.cmd.caramel], I = D.INOX;
    g.drawImage(fondCuisine(L, 'caramel'), 0, 0);
    // le sac de sucre
    const S = L.sucre, tS = E.tenu && E.tenu.quoi === 'sucre';
    if (ca.etape === 'sucre' || tS) sacSucre(P, tS ? E.tenu.x - 15 : S.x, tS ? E.tenu.y - 26 : S.y, tS, t);
    else { P.trap(S.x + 6, 16, S.x + 3, 24, S.y + 28, 12, '#c89a6a'); P.trap(S.x + 8, 10, S.x + 6, 16, S.y + 22, 6, '#b88a5a'); P.hline(S.x + 4, S.y + 34, 22, '#3a6aa8'); P.px(S.x + 10, S.y + 30, '#a87a4a'); P.px(S.x + 18, S.y + 32, '#a87a4a'); }
    // la grille en fonte et le brûleur ; les flammes bleues, selon le feu
    const by = p.y + p.haut + p.ry + 2;
    P.ellipse(p.x, by + 2, p.R + 12, p.ry + 4, '#121016');
    for (const a of [0.4, 2.74, 3.54, 5.88]) { const ex = Math.round(p.x + Math.cos(a) * (p.R + 12)), ey = Math.round(by + 2 + Math.sin(a) * (p.ry + 4)); line(P, ex, ey, Math.round(p.x + Math.cos(a) * (p.R - 6)), Math.round(by + Math.sin(a) * (p.ry - 4)), '#3a3846'); P.px(ex, ey - 1, '#5a5866'); }
    D.anneau(P, p.x, by + 2, p.R + 12, p.ry + 4, '#3a3846'); D.anneau(P, p.x, by + 1, p.R + 12, p.ry + 4, '#4e4c5a');
    const fl = [0, 3, 5, 8][ca.feu];
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2, s = Math.sin(a); if (s < -0.2 || !fl) continue;
      const h = Math.round(fl * (0.6 + 0.4 * Math.abs(Math.sin(t * 11 + k * 1.7)))), x = Math.round(p.x + Math.cos(a) * (p.R - 2)), y = Math.round(by + s * (p.ry - 2));
      g.fillStyle = '#2a64c8'; g.fillRect(x, y - h, 2, h); g.fillStyle = Math.sin(t * 7 + k) > 0.6 ? '#ffb070' : '#8ad0ff'; g.fillRect(x, y - h, 1, Math.max(1, h - 2));
    }
    if (fl) { g.globalAlpha = 0.12 + ca.feu * 0.05; D.anneau(P, p.x, by, p.R + 4, p.ry + 2, '#5ab0ff', 3); g.globalAlpha = 1; }
    // la casserole et son contenu
    casseroleCuivre(P, p.x, p.y, p.R, p.ry, p.haut);
    const ix = p.x, iy = p.y + 3, irx = p.R - 5, iry = p.ry - 4;
    if (ca.etape !== 'sucre') {
      if (ca.fondu < 1 && ca.etape === 'cuisson') {
        P.ellipse(ix, iy, irx, iry, '#f4efe2'); P.ellipse(ix, iy, Math.round(irx * ca.fondu), Math.round(iry * ca.fondu), nuance(ca.c));
        for (let k = 0; k < 40; k++) { const a = k * 2.4, d = 0.25 + (k % 8) / 10; if (d > ca.fondu) P.px(Math.round(ix + Math.cos(a) * d * irx), Math.round(iy + Math.sin(a) * d * iry), k % 3 ? '#ffffff' : '#d8d4cc'); }
      } else {
        const col = ca.etape === 'cuisson' ? nuance(ca.c) : PX.mix(nuance(ca.cBeurre ?? ca.c), '#f8ecd0', clamp(ca.creme * 0.45, 0, 0.5));
        P.ellipse(ix, iy, irx, iry, PX.shade(col, -0.12)); P.ellipse(ix - 2, iy - 1, irx - 3, iry - 2, col); P.ellipse(ix - Math.round(irx * 0.35), iy - Math.round(iry * 0.35), Math.round(irx * 0.35), Math.max(1, Math.round(iry * 0.3)), PX.shade(col, 0.2));
        const a0 = t * 4; if (ca.remue > 0.25) for (let k = 0; k < 14; k++) P.px(Math.round(ix + Math.cos(a0 + k * 0.45) * irx * (0.15 + k * 0.05)), Math.round(iy + Math.sin(a0 + k * 0.45) * iry * (0.15 + k * 0.05)), PX.shade(col, 0.3));
        for (let k = 0; k < Math.floor(ca.taches * 9); k++) { const a = k * 2.1 + 0.4, d = 0.35 + (k % 4) * 0.15; P.ellipse(Math.round(ix + Math.cos(a) * d * irx), Math.round(iy + Math.sin(a) * d * iry), 2, 1, '#1d0e0a'); P.px(Math.round(ix + Math.cos(a) * d * irx) + 1, Math.round(iy + Math.sin(a) * d * iry) - 1, '#3a1a0c'); }
        // les bulles du caramel qui cuit
        if (ca.etape === 'cuisson') for (let k = 0; k < 8; k++) { const ph = (t * (0.8 + ca.feu * 0.4) + k * 0.23) % 1; if (ph > 0.7) continue; const bx = Math.round(ix + Math.cos(k * 1.7) * irx * 0.65), byy = Math.round(iy + Math.sin(k * 1.7) * iry * 0.6); P.ellipse(bx, byy, ph > 0.45 ? 2 : 1, 1, PX.shade(col, 0.35)); P.px(bx - 1, byy - 1, '#fff4d8'); }
        // la mousse du beurre (et ce qui déborde)
        if (ca.mousse > 0.05) {
          const m = ca.mousse, hm = Math.round(m * p.haut * 1.2);
          P.ellipse(ix, iy - Math.round(hm * 0.5), Math.round(irx * Math.min(1, 0.3 + m)), Math.round(iry * Math.min(1, 0.3 + m)), '#f6dca8');
          for (let k = 0; k < 46; k++) { const a = k * 0.137, rr = 0.15 + ((k * 7) % 10) / 11, bx = Math.round(ix + Math.cos(a * 7) * rr * irx), byy = Math.round(iy + Math.sin(a * 7) * rr * iry - hm * (0.4 + 0.4 * Math.abs(Math.sin(t * 5 + k)))); P.ellipse(bx, byy, 2, 1, k % 3 ? '#fff4d8' : '#f0d8a0'); if (k % 4 === 0) P.px(bx - 1, byy - 1, '#ffffff'); }
          if (ca.deborde > 0) for (let k = 0; k < 6; k++) { const x = p.x - p.R + 5 + k * Math.round(p.R / 3); P.rect(x, p.y + 1, 3, Math.round(p.haut * 0.5 + (k % 3) * 4), '#f0d8a0'); P.vline(x, p.y + 1, Math.round(p.haut * 0.5 + (k % 3) * 4), '#fff4d8'); }
        }
      }
    }
    if (ca.brule) { for (let k = 0; k < 7; k++) { const ph = (t * 0.7 + k * 0.15) % 1; g.globalAlpha = 0.75 * (1 - ph); g.fillStyle = k % 2 ? '#3a3448' : '#5a5468'; const rr = 4 + ph * 14; g.fillRect(Math.round(p.x - 24 + k * 8 - rr / 2), Math.round(p.y - 6 - ph * 56), Math.round(rr), Math.round(rr * 0.8)); } g.globalAlpha = 1; }
    // la cuillère en bois qui suit le doigt
    if (E.cuillere && E.t - E.cuillere.t < 0.3 && ca.etape !== 'sucre') { const cx = E.cuillere.x, cy = E.cuillere.y; line(P, cx + 1, cy, cx + 13, cy - 30, D.CHENE[2]); line(P, cx, cy, cx + 12, cy - 30, D.CHENE[4]); P.ellipse(cx, cy, 4, 2, D.CHENE[3]); P.px(cx - 2, cy - 1, D.CHENE[5]); }
    // le beurre demi-sel, sur son papier ; le pichet de crème ; la boîte de fleur de sel de Guérande
    const B = L.beurre, tB = E.tenu && E.tenu.quoi === 'beurre';
    P.rect(B.x - 2, B.y + 6, B.w + 4, B.h - 4, '#e8e0cc'); P.trap(B.x - 2, B.w + 4, B.x - 6, B.w + 12, B.y + B.h + 2, 4, '#f4ecd8'); P.hline(B.x - 2, B.y + 6, B.w + 4, '#ffffff');
    for (let k = 0; k < 4; k++) P.px(B.x + 4 + k * 9, B.y + B.h - 1, '#3a6aa8');
    if (ca.etape === 'sucre' || ca.etape === 'cuisson') beurre(P, tB ? E.tenu.x - 14 : B.x + 4, tB ? E.tenu.y - 8 : B.y, ca.fondu >= 1 && ca.c >= bande[0] - 0.03 && Math.sin(t * 8) > 0);
    pichet(P, L, t);
    selGuerande(P, L.sel, ca, t);
    if (ca.etape === 'creme' || ca.etape === 'sel') for (let k = 0; k < E.cmd.sel; k++) { const x = L.sel.x + 6 + k * 8, y = L.sel.y - 8; P.ellipse(x, y, 3, 3, '#1d1626'); P.ellipse(x, y, 2, 2, k < ca.sel ? '#5ad07a' : '#5a5a66'); }
    // le filet de crème
    if (ca.verse) { const x0 = L.pan.x + 10; for (let y = L.creme.y + 8; y < p.y + 2; y += 2) P.rect(x0 + Math.round(Math.sin(y * 0.3 + t * 20)), y, 2, 2, y % 4 ? '#fbf6ea' : '#ffffff'); }
    // les boutons du feu, la jauge de couleur
    commandeFeu(P, L, t);
    jaugeCouleur(P, L, t);
    if ((ca.etape === 'creme' || ca.etape === 'sel') && ca.creme > 0.5) bouton(P, L.btnHaut, T().boutons.retirer, true, '#a8343c');
    if (ca.brule) bouton(P, L.btnHaut, T().boutons.recommencer, true, '#7a5a3a');
    if (ca.etape === 'pret') { cadre(P, p.x - 44, L.haut + 4, 88, 14, '#1e3a24', '#5ad07a'); texteC(P, T().boutons.pret, p.x, L.haut + 8, '#9ae8b0'); }
    // la jauge de la crème, à côté du pichet
    if (ca.etape === 'mousse' || ca.etape === 'creme' || ca.etape === 'sel') {
      const x = L.creme.x + L.creme.w + 4, y0 = L.creme.y, hh = L.creme.h;
      P.rect(x - 1, y0 - 1, 7, hh + 2, '#1d1626'); P.rect(x, y0, 5, hh, '#3a3440');
      const f = clamp(ca.creme / 1.5), fy = y0 + hh - Math.round(f * hh); P.rect(x, fy, 5, y0 + hh - fy, '#fbf6ea'); P.vline(x, fy, y0 + hh - fy, '#ffffff');
      const ly = y0 + hh - Math.round(hh / 1.5); P.hline(x - 3, ly, 11, '#5ad07a'); P.hline(x - 3, ly + 1, 11, '#2a8a4a');
    }
    void I;
  }
  // le sac de sucre en papier kraft (il penche et verse quand on le tient)
  function sacSucre(P, x, y, penche, t) {
    P.trap(x + 3, 24, x + 1, 28, y + 8, 32, '#c89a6a'); P.vline(x + 1, y + 10, 30, '#dcb488'); P.vline(x + 28, y + 10, 30, '#a87a4a');
    for (let k = 0; k < 4; k++) P.px(x + 3 + ((k * 7) % 22), y + 12 + k * 6, '#b88a5a');
    P.rect(x + 3, y + 4, 24, 6, '#dcb488'); for (let k = 0; k < 6; k++) P.px(x + 4 + k * 4, y + 3 + (k % 2), '#dcb488'); P.hline(x + 3, y + 9, 24, '#a87a4a');
    P.rect(x + 4, y + 18, 22, 11, '#3a6aa8'); P.hline(x + 4, y + 18, 22, '#5a8ad0'); A.texte(P, 'SUCRE', x + 6, y + 21, '#ffffff');
    P.rect(x + 9, y + 31, 12, 3, '#f4efe2'); P.ellipse(x + 15, y + 6, 8, 2, '#ffffff');
    if (penche) for (let k = 0; k < 8; k++) P.px(x + 13 + ((k * 5 + Math.floor(t * 30)) % 5), y + 40 + k * 3, '#ffffff');
  }
  function beurre(P, x, y, brille) {
    P.rect(x, y + 2, 30, 13, '#e8c050'); P.rect(x, y, 30, 5, '#fff0a0'); P.hline(x, y, 30, '#fff8d0'); P.vline(x + 29, y + 2, 13, '#c8a038');
    P.rect(x + 2, y + 6, 26, 7, '#f4f2ec'); P.hline(x + 2, y + 6, 26, '#ffffff'); P.rect(x + 2, y + 9, 26, 1, '#3a6aa8'); A.texte(P, 'DEMI', x + 7, y + 7, '#3a6aa8');
    P.px(x + 24, y + 3, '#ffffff'); P.px(x + 20, y + 2, '#ffffff');
    if (brille) { P.rect(x - 2, y - 2, 34, 1, '#ffffff'); P.rect(x - 2, y + 16, 34, 1, '#ffffff'); P.rect(x - 2, y - 2, 1, 19, '#ffffff'); P.rect(x + 31, y - 2, 1, 19, '#ffffff'); }
  }
  function pichet(P, L, t) {
    const C = L.creme, v = E.caramel.verse, x = v ? L.pan.x - 8 : C.x, y = v ? C.y - 6 : C.y;
    P.rect(x + 4, y + 6, 18, 26, '#f4f2ec'); P.vline(x + 4, y + 6, 26, '#ffffff'); P.vline(x + 5, y + 8, 22, '#fbf9f4'); P.vline(x + 20, y + 6, 26, '#d8d4cc'); P.vline(x + 21, y + 6, 26, '#c8c4bc');
    P.hline(x + 4, y + 15, 18, '#2c5a9a'); P.hline(x + 4, y + 17, 18, '#2c5a9a'); for (let k = 0; k < 4; k++) P.px(x + 6 + k * 4, y + 16, '#7aa8d8');
    P.ellipse(x + 13, y + 6, 9, 2, '#e8e4dc'); P.ellipse(x + 13, y + 6, 7, 1, '#fffaf0'); P.trap(x + 1, 6, x + 3, 4, y + 3, 4, '#f4f2ec');
    D.anneau(P, x + 24, y + 18, 3, 6, '#e8e4dc'); P.ellipse(x + 13, y + 32, 9, 2, '#c8c4bc');
    if (!v) { P.rect(x + 2, y + 36, 24, 7, '#2a1a14'); A.texte(P, 'CREME', x + 4, y + 37, '#f6ead2'); }
    void t;
  }
  function selGuerande(P, S, ca, t) {
    P.ellipse(S.x + 15, S.y + 20, 15, 4, D.CHENE[1]); P.rect(S.x + 1, S.y + 6, 28, 14, D.CHENE[3]); P.ellipse(S.x + 15, S.y + 20, 14, 3, D.CHENE[2]);
    P.vline(S.x + 1, S.y + 6, 14, D.CHENE[4]); P.vline(S.x + 28, S.y + 6, 14, D.CHENE[1]);
    P.ellipse(S.x + 15, S.y + 6, 14, 4, D.CHENE[2]); P.ellipse(S.x + 15, S.y + 6, 12, 3, '#eef0f6'); P.dither(S.x + 4, S.y + 4, 22, 5, '#c8ccd8', 6); for (let k = 0; k < 6; k++) P.px(S.x + 6 + k * 3, S.y + 5 + (k % 2), '#ffffff');
    P.rect(S.x + 4, S.y + 11, 22, 7, '#2c5a9a'); A.texte(P, 'SEL', S.x + 10, S.y + 12, '#ffffff');
    if (ca.tSel > 0) { const k = ca.tSel; P.ellipse(S.x + 18, S.y - 4 - Math.round(k * 10), 3, 3, '#f0c8a8'); P.ellipse(S.x + 14, S.y - 2 - Math.round(k * 10), 3, 2, '#e8b890'); }
    void t;
  }
  function commandeFeu(P, L, t) {
    const ca = E.caramel;
    A.texte(P, T().feu, L.feux[0].x - 16, L.feux[0].y + 4, '#f0cc6a');
    L.feux.forEach((b, k) => {
      const actif = ca.feu === k;
      P.rect(b.x, b.y, b.w, b.h, '#1d1626'); P.rect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, actif ? '#7a4a28' : '#2e2c36'); P.hline(b.x + 1, b.y + 1, b.w - 2, actif ? D.OR[4] : '#4a4858');
      for (let j = 0; j < k; j++) { const fx = b.x + 4 + j * 4; P.px(fx + 1, b.y + 3, '#ffd27a'); P.rect(fx, b.y + 4, 3, 3, actif ? '#ff8a24' : '#5ab0ff'); P.px(fx + 1, b.y + 5, '#fff4b0'); }
      texteC(P, T().feux[k], b.x + b.w / 2 + (k ? 6 : 0), b.y + 4, actif ? '#fff6dc' : '#a8a0b0');
    });
    void t;
  }
  function jaugeCouleur(P, L, t) {
    const J0 = L.jauge, ca = E.caramel, bande = REGLAGES.bandes[E.cmd.caramel], hh = J0.y1 - J0.y0;
    cadre(P, J0.x - 9, J0.y0 - 13, 18, hh + 17, '#2a1a14');
    P.ellipse(J0.x, J0.y0 - 7, 3, 3, '#1d1626'); P.ellipse(J0.x, J0.y0 - 7, 2, 2, '#e4a440'); P.px(J0.x, J0.y0 - 11, '#e4a440'); P.px(J0.x - 1, J0.y0 - 8, '#fff4c0');
    for (let y = 0; y < hh; y++) P.hline(J0.x - 4, J0.y0 + y, 9, nuance(y / hh));
    const by0 = J0.y0 + Math.round(bande[0] * hh), by1 = J0.y0 + Math.round(bande[1] * hh);
    P.rect(J0.x - 7, by0, 2, by1 - by0, '#5ad07a'); P.rect(J0.x + 6, by0, 2, by1 - by0, '#5ad07a');
    const bru = J0.y0 + Math.round(REGLAGES.caramel.brule * hh); P.rect(J0.x - 7, bru, 15, 1, '#e8301e');
    const c = ca.etape === 'cuisson' ? ca.c : ca.cBeurre ?? ca.c, y = J0.y0 + Math.round(clamp(c) * hh);
    if (ca.etape !== 'sucre') { P.rect(J0.x - 15, y - 2, 9, 5, '#1d1626'); P.rect(J0.x - 14, y - 1, 7, 3, Math.sin(t * 10) > 0 && c > bande[1] ? '#ff8a7a' : '#fff6dc'); P.px(J0.x - 7, y, '#fff6dc'); }
  }

  // ---- 3. le poste du four
  function chiffres(P, n, x, y, col) { A.texte(P, String(n), x, y, col); }
  function posteFour(g, P, L, t) {
    const fo = E.four, Pl = L.plaque, F = L.four, I = D.INOX, allume = fo.etape === 'cuit';
    g.drawImage(fondCuisine(L, 'four'), 0, 0);
    // à gauche : la casserole de pâte à choux et sa spatule, la boîte d'œufs, des coquilles
    const kx = Math.round(L.w * 0.05), ky = Math.round(L.haut + L.ht * 0.42);
    casseroleCuivre(P, kx + 26, ky + 6, 18, 8, 12); P.ellipse(kx + 26, ky + 8, 14, 5, '#ecd098'); P.ellipse(kx + 23, ky + 7, 6, 2, '#f6e2b8'); line(P, kx + 30, ky + 8, kx + 40, ky - 14, D.CHENE[3]); P.rect(kx + 27, ky + 5, 5, 4, D.CHENE[4]);
    const ox = kx + 8, oy = ky + 30; P.rect(ox, oy, 30, 10, '#c8b090'); P.hline(ox, oy, 30, '#dcc8a8'); for (let k = 0; k < 5; k++) { P.ellipse(ox + 3 + k * 6, oy + 1, 2, 2, k % 2 ? '#f4ecd8' : '#e0b888'); P.px(ox + 2 + k * 6, oy, '#ffffff'); }
    P.ellipse(ox + 40, oy + 6, 3, 2, '#f4ecd8'); P.px(ox + 40, oy + 6, '#f2c230'); P.ellipse(ox + 46, oy + 8, 2, 1, '#f4ecd8');
    // le four : façade d'inox, afficheur, boutons, voyant, porte vitrée, poignée, tiroir
    P.rect(F.x - 2, F.y - 2, F.w + 4, F.h + 4, '#1d1626'); P.rect(F.x, F.y, F.w, F.h, I[4]); P.dither(F.x, F.y, F.w, F.h, I[5], 4); P.vline(F.x, F.y, F.h, I[6]); P.vline(F.x + F.w - 1, F.y, F.h, I[2]);
    P.rect(F.x + 4, F.y + 4, F.w - 8, 16, I[2]); P.rect(F.x + 6, F.y + 7, 20, 10, '#120a0c'); chiffres(P, allume ? 180 : fo.etape === 'sorti' ? 0 : 180, F.x + 9, F.y + 9, allume ? '#ff4a3a' : '#5a2a2a');
    for (const [kx2, col] of [[F.w - 30, '#2a2632'], [F.w - 16, '#2a2632']]) { P.ellipse(F.x + kx2, F.y + 12, 5, 5, '#1d1626'); P.ellipse(F.x + kx2, F.y + 12, 4, 4, col); P.px(F.x + kx2, F.y + 9, '#e6e9f0'); }
    P.ellipse(F.x + 34, F.y + 12, 2, 2, allume ? (Math.sin(t * 6) > 0 ? '#ff3a2a' : '#a81a1a') : '#4a2020');
    const vx = F.x + 8, vy = F.y + 34, vw = F.w - 16, vh = Math.round(F.h * 0.42);
    P.rect(F.x + 3, F.y + 23, F.w - 6, vh + 30, I[3]); P.hline(F.x + 3, F.y + 23, F.w - 6, I[6]);
    P.rect(F.x + 8, F.y + 26, F.w - 16, 4, I[6]); P.hline(F.x + 8, F.y + 29, F.w - 16, I[1]); P.rect(F.x + 8, F.y + 25, 3, 6, I[2]); P.rect(F.x + F.w - 11, F.y + 25, 3, 6, I[2]);
    P.rect(vx - 2, vy - 2, vw + 4, vh + 4, '#1d1626');
    if (allume) { P.vgrad(vx, vy, vw, vh, '#6a2a10', '#d0602a'); P.rect(vx, vy, vw, 3, '#ffd090'); P.hline(vx, vy + 3, vw, '#f0a060'); }
    else { P.vgrad(vx, vy, vw, vh, '#1e1a22', '#2e2834'); }
    for (let k = 1; k < 3; k++) P.hline(vx + 1, vy + Math.round(vh * k / 3) + 4, vw - 2, allume ? '#3a1408' : '#4a4456');
    P.px(vx + 3, vy + 3, allume ? '#fff4c0' : '#6a6478');
    if (allume) { const rr = Math.round(Math.min(vw * 0.34, vh * 0.66)), gonfle = 0.72 + clamp(fo.cuisson / 0.45) * 0.28; const R2 = Math.max(4, Math.round(rr * gonfle)); g.drawImage(anneau(R2, Math.round(R2 * 0.45), Math.max(2, Math.round(R2 * 0.28)), fo.cuisson, 3), Math.round(vx + vw / 2 - R2 - 5), Math.round(vy + vh * 0.62 - R2 * 0.45 - 5)); }
    line(P, vx + 4, vy + vh - 3, vx + 16, vy + 3, allume ? '#ffb080' : '#4a4458'); line(P, vx + 8, vy + vh - 3, vx + 20, vy + 3, allume ? '#f09060' : '#3a3646');
    // la jauge de cuisson et le minuteur, sous la porte
    const gx = F.x + 8, gy = vy + vh + 8, gw = F.w - 30; P.rect(gx - 1, gy - 1, gw + 2, 7, '#1d1626');
    for (let x = 0; x < gw; x++) P.vline(gx + x, gy, 5, nuance(x / gw, CHOUX));
    const c0 = gx + Math.round(REGLAGES.four.cible[0] * gw), c1 = gx + Math.round(REGLAGES.four.cible[1] * gw); P.rect(c0, gy - 3, c1 - c0, 2, '#5ad07a'); P.rect(c0, gy + 6, c1 - c0, 2, '#5ad07a');
    P.vline(gx + Math.round(REGLAGES.four.min * gw), gy - 3, 3, '#e8b54a');
    if (allume || fo.etape === 'sorti') { const cx = gx + Math.round(clamp(fo.cuisson) * gw); P.rect(cx - 1, gy - 4, 3, 13, '#1d1626'); P.vline(cx, gy - 3, 11, '#fff6dc'); }
    const mx = F.x + F.w - 12, my = gy + 2; P.ellipse(mx, my, 7, 7, '#1d1626'); P.ellipse(mx, my, 6, 6, '#fbf8ee'); const a = -Math.PI / 2 + (allume ? fo.cuisson : 0) * Math.PI * 2; line(P, mx, my, Math.round(mx + Math.cos(a) * 4), Math.round(my + Math.sin(a) * 4), '#c81a2a');
    P.rect(F.x + 4, F.y + F.h - 24, F.w - 8, 20, I[3]); P.hline(F.x + 4, F.y + F.h - 24, F.w - 8, I[5]); for (let x = F.x + 10; x < F.x + F.w - 10; x += 5) P.vline(x, F.y + F.h - 16, 8, I[1]);
    if (allume) { const b = { x: F.x + 10, y: F.y + F.h - 22, w: F.w - 20, h: 16 }; bouton(P, b, T().boutons.sortir, true, alarme('four') ? (Math.sin(t * 6) > 0 ? '#3aa04a' : '#2a7a3a') : '#7a5a3a'); }
    // la plaque de cuisson, son papier, et la couronne qu'on poche
    const tn = E.tenu && E.tenu.quoi === 'plaque', px = tn ? E.tenu.x : Pl.x, py = tn ? E.tenu.y : Pl.y;
    if (fo.etape === 'pocher' || fo.etape === 'poche') {
      const tw = Math.round(Pl.RX * 2.9), th = Math.round(Pl.RY * 3.2), tx = Math.round(px - tw / 2), ty = Math.round(py - th / 2);
      P.rect(tx + 2, ty + 4, tw, th, 'rgba(20,10,10,0.3)');
      P.trap(tx + 4, tw - 8, tx, tw, ty, th, I[1]); P.trap(tx + 5, tw - 10, tx + 2, tw - 4, ty + 1, th - 3, I[2]); P.hline(tx + 4, ty, tw - 8, I[4]);
      P.trap(tx + 9, tw - 18, tx + 6, tw - 12, ty + 4, th - 9, '#f4ecd8'); P.dither(tx + 7, ty + 4, tw - 14, th - 9, '#e8dcc0', 3);
      if (fo.etape === 'pocher') for (let k = 0; k < 48; k++) { if (fo.bins[k] >= 0 || k % 2) continue; const a2 = (k / 48) * Math.PI * 2; P.rect(Math.round(px + Math.cos(a2) * Pl.RX), Math.round(py + Math.sin(a2) * Pl.RY), 2, 1, '#b89868'); }
      for (const q of fo.points) { const x = Math.round(px + q.u * Pl.RX), y = Math.round(py + q.v * Pl.RY); P.ellipse(x, y + 1, 4, 3, '#c8a878'); }
      for (const q of fo.points) { const x = Math.round(px + q.u * Pl.RX), y = Math.round(py + q.v * Pl.RY); P.ellipse(x, y, 3, 2, '#f2e2bc'); }
      for (const q of fo.points) { const x = Math.round(px + q.u * Pl.RX), y = Math.round(py + q.v * Pl.RY); P.px(x - 1, y - 1, '#fffaf0'); }
      if (fo.etape === 'pocher') { const cov = fo.bins.filter((b) => b >= 0).length / fo.bins.length; barre(P, Pl.x - 40, L.bas - 10, 80, cov, 0.9); }
    } else if (fo.etape === 'sorti') {
      // la grille où refroidissent les choux
      const R = Pl.RX, gx2 = Pl.x - R - 14, gy2 = Pl.y - Pl.RY - 6, gw2 = R * 2 + 28, gh2 = Pl.RY * 2 + 22;
      P.rect(gx2, gy2 + 4, gw2, gh2, 'rgba(20,10,10,0.25)'); for (let x = gx2; x <= gx2 + gw2; x += 5) P.vline(x, gy2, gh2, I[4]); P.rect(gx2, gy2, gw2, 2, I[5]); P.rect(gx2, gy2 + gh2 - 2, gw2, 2, I[3]);
      dessinPB(g, P, Pl.x, Pl.y - 2, R, Pl.RY, { coupe: false });
      for (let k = 0; k < 3; k++) { const ph = (t * 0.6 + k * 0.33) % 1; g.globalAlpha = 0.5 * (1 - ph); g.fillStyle = '#ffffff'; g.fillRect(Pl.x - 10 + k * 10, Math.round(Pl.y - Pl.RY - 8 - ph * 20), 2, 3); } g.globalAlpha = 1;
    } else {
      // la grille vide qui attend les choux
      const R = Pl.RX, gx2 = Pl.x - R - 14, gy2 = Pl.y - Pl.RY - 6, gw2 = R * 2 + 28, gh2 = Pl.RY * 2 + 22;
      P.rect(gx2, gy2 + 4, gw2, gh2, 'rgba(20,10,10,0.2)'); for (let x = gx2; x <= gx2 + gw2; x += 5) P.vline(x, gy2, gh2, I[4]); P.rect(gx2, gy2, gw2, 2, I[5]); P.rect(gx2, gy2 + gh2 - 2, gw2, 2, I[3]);
      pocheCouchee(P, Pl.x + Pl.RX + 22, L.bas - 22);
    }
    // la poche à douille : posée sur le plan, ou dans la main
    const dp = [...E.doigts.values()].find((d) => d.poche);
    if (dp) poche(P, dp.x, dp.y, 'pate');
    else if (fo.etape === 'pocher') pocheCouchee(P, Pl.x + Pl.RX + 20, L.bas - 26);
    if (fo.etape === 'brule') { bouton(P, L.btnHaut, T().boutons.recommencer, true, '#7a5a3a'); for (let k = 0; k < 6; k++) { const ph = (t * 0.7 + k * 0.17) % 1; g.globalAlpha = 0.6 * (1 - ph); g.fillStyle = '#4a4458'; g.fillRect(Math.round(F.x + 20 + k * 8), Math.round(F.y + 30 - ph * 30), 8, 6); } g.globalAlpha = 1; }
  }
  function barre(P, x, y, w, f, cible) { P.rect(x - 1, y - 1, w + 2, 6, '#1d1626'); P.rect(x, y, w, 4, '#3a3440'); P.rect(x, y, Math.round(w * clamp(f)), 4, f >= cible ? '#5ad07a' : '#e8b54a'); P.vline(x + Math.round(w * cible), y - 2, 8, '#ffffff'); }
  // une poche à douille tenue (pointe en bas, au bout du doigt)
  function poche(P, x, y, quoi) {
    const C = quoi === 'pate' ? ['#c8a878', '#f2e2bc', '#fffaf0'] : CREMES[quoi].slice(1);
    P.trap(x - 9, 18, x - 2, 4, y - 26, 20, '#e8e4dc'); P.trap(x - 7, 12, x - 1, 3, y - 24, 14, C[1]); P.vline(x - 6, y - 24, 10, C[2]);
    P.rect(x - 9, y - 30, 18, 4, '#f4f2ec'); P.hline(x - 9, y - 30, 18, '#ffffff'); P.rect(x - 2, y - 6, 4, 5, D.INOX[4]); P.px(x - 1, y - 6, D.INOX[6]); P.px(x - 1, y - 1, C[0]);
  }
  function pocheCouchee(P, x, y) { P.trap(x, 4, x - 2, 26, y - 6, 12, '#e8e4dc'); P.trap(x + 1, 3, x, 22, y - 5, 9, '#f2e2bc'); P.rect(x + 26, y + 2, 5, 4, D.INOX[4]); }

  // ---- 4. le poste du montage
  function posteGarnir(g, P, L, t) {
    const ga = E.garni, G = L.pb;
    g.drawImage(fondCuisine(L, 'garnir'), 0, 0);
    // la grande planche ronde
    P.ellipse(G.x + 3, G.y + G.RY + 4, G.RX + 26, G.RY + 14, 'rgba(20,10,10,0.25)');
    P.ellipse(G.x, G.y + G.RY - 2, G.RX + 24, G.RY + 14, D.CHENE[1]); P.ellipse(G.x, G.y + G.RY - 5, G.RX + 24, G.RY + 13, D.CHENE[3]);
    for (let k = 0; k < 7; k++) D.anneau(P, G.x + 3, G.y + G.RY - 4, Math.round((G.RX + 20) * (k + 1) / 8), Math.round((G.RY + 10) * (k + 1) / 8), k % 2 ? D.CHENE[4] : D.CHENE[2]);
    P.ellipse(G.x - Math.round(G.RX * 0.5), G.y + 2, Math.round(G.RX * 0.4), Math.round(G.RY * 0.35), D.CHENE[5]);
    // les trois crèmes, chacune dans son bol, sa poche à douille devant
    for (const b of L.poches) {
      const C = CREMES[b.c], choisie = ga.poche === b.c, bx = b.x + 18, by = b.y + 20;
      if (choisie) { P.rect(b.x - 2, b.y - 2, b.w + 4, b.h + 4, '#5ad07a'); P.rect(b.x - 1, b.y - 1, b.w + 2, b.h + 2, '#1e3a24'); }
      P.ellipse(bx, by + 6, 15, 6, '#c8c4bc'); P.ellipse(bx, by, 15, 7, '#f4f2ec'); P.rect(bx - 15, by, 31, 6, '#f4f2ec'); P.ellipse(bx, by + 6, 15, 5, '#e8e4dc'); P.vline(bx - 15, by, 6, '#ffffff'); P.hline(bx - 14, by + 2, 29, '#3a6aa8');
      P.ellipse(bx, by - 1, 13, 5, C[1]); P.ellipse(bx - 2, by - 2, 8, 3, C[2]); P.px(bx - 5, by - 3, C[3]); P.px(bx + 3, by - 4, C[2]); P.px(bx + 4, by - 5, C[3]);
      P.trap(bx + 4, 6, bx + 10, 18, by - 16, 12, '#e8e4dc'); P.trap(bx + 6, 4, bx + 11, 14, by - 15, 9, C[1]); P.rect(bx + 15, by - 17, 4, 3, D.INOX[4]);
      P.rect(b.x + 2, b.y + b.h - 7, b.w - 4, 8, '#2a1a14'); texteC(P, T().cremes[b.c], b.x + b.w / 2, b.y + b.h - 6, choisie ? '#9ae8b0' : '#f6ead2');
    }
    if (ga.etape === 'couper') {
      dessinPB(g, P, G.x, G.y, G.RX, G.RY, { coupe: false, chapeau: false });
      const yl = etages(G).ligne;
      for (let x = G.x - G.RX - 12; x < G.x + G.RX + 12; x += 4) P.hline(x, yl, 2, Math.sin(t * 6) > 0 ? '#ffffff' : '#c8283a');
      // le couteau à pain
      if (ga.trait) { for (let k = 1; k < ga.trait.length; k++) line(P, Math.round(ga.trait[k - 1].x), Math.round(ga.trait[k - 1].y), Math.round(ga.trait[k].x), Math.round(ga.trait[k].y), '#ffffff'); const q = ga.trait[ga.trait.length - 1]; couteau(P, q.x, q.y); }
      else couteau(P, G.x + G.RX - 10, G.y + G.RY * 2 + 16);
    } else {
      dessinPB(g, P, G.x, G.y, G.RX, G.RY, { chapeau: ga.etape === 'fini' });
      if (ga.etape !== 'fini') {
        const c = posChapeau(L), e = etages(G);
        if (!(E.tenu && E.tenu.quoi === 'chapeau')) { for (let x = L.chapeau.x - G.RX - 6; x <= L.chapeau.x + G.RX + 6; x += 5) P.vline(x, L.chapeau.y - G.RY + 2, G.RY * 2 + 6, D.INOX[4]); P.rect(L.chapeau.x - G.RX - 6, L.chapeau.y - G.RY + 2, G.RX * 2 + 13, 2, D.INOX[5]); }
        g.drawImage(anneau(G.RX - 1, G.RY - 1, e.Hc, Math.min(1, E.four.cuisson + 0.04), 9, e.plat), Math.round(c.x - G.RX - 6), Math.round(c.y - G.RY - 6));
      }
      if (ga.etape === 'rosaces' && E.cmd.guides) for (let k = 0; k < E.cmd.rosaces; k++) { const a = -Math.PI / 2 + (k / E.cmd.rosaces) * Math.PI * 2, x = Math.round(G.x + Math.cos(a) * G.RX * RAYON), y = Math.round(etages(G).ros + Math.sin(a) * G.RY * RAYON); P.rect(x - 1, y, 3, 1, '#ffffff'); P.px(x, y - 1, '#ffffff'); P.px(x, y + 1, '#ffffff'); }
      if (ga.pousse) { const a = ga.pousse.a, x = Math.round(G.x + Math.cos(a) * G.RX * RAYON), y = Math.round(etages(G).ros + Math.sin(a) * G.RY * RAYON), s = (G.RX / 64) * 2.2; const ok = Math.abs(ga.pousse.taille - 1) <= REGLAGES.rosace.tol; for (let k = 0; k < 20; k++) { const b = (k / 20) * Math.PI * 2; P.px(Math.round(x + Math.cos(b) * (4.2 * s + 3)), Math.round(y - 3 + Math.sin(b) * (3 * s + 2)), ok ? '#5ad07a' : '#ffffff'); } poche(P, x, y - Math.round(3 * s * ga.pousse.taille) - 2, ga.poche); }
      if (ga.etape === 'rosaces' || ga.etape === 'fermer') { cadre(P, G.x - 18, L.bas - 14, 36, 12, '#2a1a14'); texteC(P, ga.rosaces.length + '/' + E.cmd.rosaces, G.x, L.bas - 11, '#f6ead2'); }
    }
  }
  function couteau(P, x, y) { P.rect(x, y - 2, 30, 4, D.INOX[5]); P.hline(x, y - 2, 30, D.INOX[6]); for (let k = 0; k < 30; k += 3) P.px(x + k, y + 1, D.INOX[3]); P.rect(x + 30, y - 2, 13, 4, D.NOYER[3]); P.hline(x + 30, y - 2, 13, D.NOYER[5]); P.px(x + 34, y, OR3); P.px(x + 39, y, OR3); }
  const OR3 = '#d8a83e';

  // ---- 5. le poste du dressage
  function posteDresser(g, P, L, t) {
    const G = L.pb, dr = E.dress, tn = E.tenu, col = nuance(E.caramel.cBeurre ?? 0.55);
    g.drawImage(fondCuisine(L, 'dresser'), 0, 0);
    // l'assiette à liseré doré, son napperon de dentelle
    P.ellipse(G.x + 3, G.y + 8, Math.round(G.RX * 1.5) + 4, Math.round(G.RY * 1.6) + 3, 'rgba(30,14,8,0.3)');
    P.ellipse(G.x, G.y + 4, Math.round(G.RX * 1.5) + 2, Math.round(G.RY * 1.6) + 2, '#b8b4ac'); P.ellipse(G.x, G.y + 2, Math.round(G.RX * 1.5), Math.round(G.RY * 1.6), '#f4f2ec');
    D.anneau(P, G.x, G.y + 2, Math.round(G.RX * 1.44), Math.round(G.RY * 1.53), D.OR[3]);
    P.ellipse(G.x, G.y + 3, Math.round(G.RX * 1.28), Math.round(G.RY * 1.34), '#e8e4dc'); P.ellipse(G.x, G.y + 2, Math.round(G.RX * 1.26), Math.round(G.RY * 1.3), '#fbf9f2');
    for (let k = 0; k < 44; k++) { const a = (k / 44) * Math.PI * 2, x = Math.round(G.x + Math.cos(a) * G.RX * 1.16), y = Math.round(G.y + 2 + Math.sin(a) * G.RY * 1.2); P.ellipse(x, y, 2, 1, '#ffffff'); P.px(x, y, '#e8e4dc'); }
    P.ellipse(G.x - Math.round(G.RX * 0.7), G.y - Math.round(G.RY * 0.6), 6, 2, '#ffffff');
    if (dr.salete > 0) for (let k = 0; k < Math.min(30, Math.round(dr.salete)); k++) { const a = k * 2.3, d = 1.05 + (k % 3) * 0.1; P.ellipse(Math.round(G.x + Math.cos(a) * G.RX * d), Math.round(G.y + 2 + Math.sin(a) * G.RY * d), 1 + (k % 2), 1, k % 2 ? col : '#c8843a'); }
    dessinPB(g, P, G.x, G.y, G.RX, G.RY, { chapeau: true });
    // la casserole de caramel, sur son dessous-de-plat
    const Cs = L.casserole;
    P.ellipse(Cs.x + 20, Cs.y + 30, 22, 6, D.CHENE[1]); P.ellipse(Cs.x + 20, Cs.y + 29, 21, 5, D.CHENE[4]); for (let k = -16; k <= 16; k += 4) P.vline(Cs.x + 20 + k, Cs.y + 26, 6, D.CHENE[2]);
    casseroleCuivre(P, Cs.x + 30, Cs.y + 10, 14, 6, 12); P.ellipse(Cs.x + 30, Cs.y + 12, 10, 4, col); P.ellipse(Cs.x + 28, Cs.y + 11, 4, 1, PX.shade(col, 0.3));
    if (!(tn && tn.quoi === 'cuillere')) { line(P, Cs.x + 33, Cs.y + 11, Cs.x + 44, Cs.y - 12, D.CHENE[2]); line(P, Cs.x + 32, Cs.y + 11, Cs.x + 43, Cs.y - 12, D.CHENE[4]); }
    cadre(P, Cs.x + 6, Cs.y + 37, 38, 9, '#2a1a14'); texteC(P, 'CARAMEL', Cs.x + 25, Cs.y + 39, '#f6ead2');
    // les bocaux de garnitures, sur l'étagère
    const ey = L.pots[0].y + L.pots[0].h; P.rect(L.pots[0].x - 8, ey, L.pots[3].x + L.pots[3].w - L.pots[0].x + 16, 4, D.CHENE[3]); P.hline(L.pots[0].x - 8, ey, L.pots[3].x + L.pots[3].w - L.pots[0].x + 16, D.CHENE[5]); P.hline(L.pots[0].x - 8, ey + 4, L.pots[3].x + L.pots[3].w - L.pots[0].x + 16, '#6a5a50');
    for (const b of L.pots) {
      const pris = tn && tn.quoi === b.c && b.c !== 'noisettes', interdit = E.cmd.sans.includes(b.c);
      if (!pris) bocal(P, b.c, b.x, b.y);
      else { P.ellipse(b.x + b.w / 2, b.y + b.h - 1, b.w / 2 - 2, 2, '#8a7060'); }
      if (interdit) { line(P, b.x, b.y + 4, b.x + b.w, b.y + b.h - 2, '#e8301e'); line(P, b.x + 1, b.y + 4, b.x + b.w + 1, b.y + b.h - 2, '#a81a1a'); }
    }
    // ce qu'on tient : la cuillère qui coule, un bocal qu'on secoue, une noisette, le tamis
    if (tn) {
      if (tn.quoi === 'cuillere') { line(P, tn.x + 1, tn.y, tn.x + 13, tn.y - 26, D.CHENE[2]); line(P, tn.x, tn.y, tn.x + 12, tn.y - 26, D.CHENE[4]); P.ellipse(tn.x, tn.y, 4, 2, col); P.rect(tn.x, tn.y + 2, 1, 4 + Math.round(Math.sin(t * 20)), col); }
      else if (tn.quoi === 'noisettes') { P.ellipse(tn.x, tn.y, 3, 3, '#6a3a1a'); P.ellipse(tn.x - 1, tn.y - 1, 2, 2, '#a8743a'); P.px(tn.x - 1, tn.y - 2, '#e8c890'); }
      else if (tn.quoi === 'sucre') { P.ellipse(tn.x, tn.y, 10, 4, D.INOX[2]); P.ellipse(tn.x, tn.y - 1, 9, 3, '#d8dce6'); P.dither(tn.x - 8, tn.y - 3, 16, 5, '#ffffff', 8); line(P, tn.x + 9, tn.y - 1, tn.x + 20, tn.y - 8, D.INOX[4]); for (let k = 0; k < 8; k++) P.px(tn.x - 7 + ((k * 5 + Math.floor(t * 30)) % 14), tn.y + 4 + ((k * 3 + Math.floor(t * 40)) % 12), '#ffffff'); }
      else { bocal(P, tn.quoi, tn.x - 17, tn.y - 34, true); for (let k = 0; k < 4; k++) P.px(tn.x - 3 + ((k * 7 + Math.floor(t * 30)) % 8), tn.y + 2 + ((k * 5 + Math.floor(t * 40)) % 10), tn.quoi === 'amandes' ? '#f2e2c0' : '#8a5a2a'); }
    }
    // la jauge du nappage
    const nx = Math.round(L.w * 0.73), ny = L.haut + 44, nh = L.bas - ny - 38, cib = REGLAGES.nappe[E.cmd.nappe];
    cadre(P, nx - 8, ny - 12, 21, nh + 16, '#2a1a14'); P.ellipse(nx + 2, ny - 6, 2, 2, nuance(E.caramel.cBeurre ?? 0.55)); P.px(nx + 2, ny - 9, nuance(E.caramel.cBeurre ?? 0.55));
    P.rect(nx - 1, ny - 1, 7, nh + 2, '#1d1626'); P.rect(nx, ny, 5, nh, '#3a3440');
    const f = clamp(dr.nappe / 1.4), fy = ny + nh - Math.round(f * nh); P.rect(nx, fy, 5, ny + nh - fy, col); P.vline(nx, fy, ny + nh - fy, PX.shade(col, 0.3));
    const c0 = ny + nh - Math.round((cib[1] / 1.4) * nh), c1 = ny + nh - Math.round((cib[0] / 1.4) * nh); P.rect(nx - 4, c0, 2, c1 - c0, '#5ad07a'); P.rect(nx + 7, c0, 2, c1 - c0, '#5ad07a');
    // la cloche de service et le bouton SERVIR
    const S2 = L.servir;
    P.ellipse(S2.x - 12, S2.y + 18, 9, 3, D.NOYER[2]); P.ellipse(S2.x - 12, S2.y + 13, 8, 6, D.OR[2]); P.ellipse(S2.x - 13, S2.y + 12, 6, 5, D.OR[3]); P.ellipse(S2.x - 15, S2.y + 10, 2, 2, D.OR[5]); P.rect(S2.x - 13, S2.y + 4, 2, 3, D.OR[2]); P.px(S2.x - 12, S2.y + 3, D.OR[4]);
    bouton(P, S2, T().boutons.servir, true, '#a8343c');
  }
  // un bocal de verre : son contenu, son couvercle, son étiquette
  function bocal(P, quoi, x, y) {
    const w = 38, h = 36, C = { amandes: ['#f2e2c0', '#d8c098', '#b89a70'], noisettes: ['#a8743a', '#6a3a1a', '#e8c890'], sucre: ['#ffffff', '#e8e8f0', '#d0d0dc'], pralin: ['#c8843a', '#8a5a2a', '#e8b878'] }[quoi];
    P.rect(x + 3, y + 7, w - 6, h - 8, '#bfd8e4'); P.rect(x + 4, y + 13, w - 8, h - 15, C[1]);
    for (let k = 0; k < 40; k++) { const px = x + 5 + ((k * 7) % (w - 10)), py = y + 14 + ((k * 5) % (h - 17)); if (quoi === 'noisettes') { if (k % 3 === 0) { P.ellipse(px, py, 2, 2, C[0]); P.px(px - 1, py - 1, C[2]); } } else if (quoi === 'amandes') { P.rect(px, py, 3, 1, k % 2 ? C[0] : C[2]); } else P.px(px, py, k % 3 ? C[0] : C[2]); }
    P.vline(x + 4, y + 9, h - 12, '#ffffff'); P.vline(x + 5, y + 10, h - 16, '#e8f6ff'); P.vline(x + w - 5, y + 9, h - 12, '#8aa8b8'); P.ellipse(x + w / 2, y + h - 1, w / 2 - 3, 2, '#8aa8b8');
    if (quoi === 'sucre') { P.ellipse(x + w / 2, y + 5, w / 2 - 2, 4, D.INOX[3]); P.ellipse(x + w / 2, y + 4, w / 2 - 3, 3, D.INOX[5]); for (let k = -10; k <= 10; k += 3) P.px(x + w / 2 + k, y + 4, D.INOX[1]); }
    else { P.rect(x + 2, y + 2, w - 4, 6, '#c8283a'); P.hline(x + 2, y + 2, w - 4, '#f05a5a'); P.hline(x + 2, y + 7, w - 4, '#7a1020'); for (let k = 4; k < w - 4; k += 4) P.px(x + k, y + 4, '#ffffff'); }
    P.rect(x + 2, y + 18, w - 4, 9, '#f4ead2'); P.hline(x + 2, y + 18, w - 4, '#fffaf0'); const nom = T().garnitures[quoi]; A.texte(P, nom, x + w / 2 - Math.round(A.largeurTexte(nom) / 2), y + 20, '#5a2a1a');
  }

  // ---- l'en-tête : le client, sa patience ; le ticket ; les onglets des postes ; Rémy
  function entete(g, P, L, t) {
    const C = E.client;
    P.rect(0, 0, L.w, 20, 'rgba(20,12,16,0.82)'); P.hline(0, 20, L.w, D.OR[2]);
    const spr = cache('spr' + C.id, () => Sprites.person(CONFIG.caramel.persos[C.id])), tete = spr.down.idle;
    g.drawImage(tete, 0, 0, tete.width, 15, 4, 3, tete.width, 15);
    A.texte(P, (CONFIG.personnages[C.id] || { nom: '' }).nom.toUpperCase().replace(/[ÉÈ]/g, 'E').replace(/[À]/g, 'A'), 24, 3, '#f6ead2');
    // la patience : cinq cœurs qui se vident
    const pat = E.phase === 'attend' ? clamp(1 - E.attente / E.client.patience) : 1;
    for (let k = 0; k < 5; k++) { const plein = pat * 5 > k + 0.5, x = 24 + k * 8, y = 11; const col = plein ? (pat < 0.3 && Math.sin(t * 8) > 0 ? '#ff9aa8' : '#e8435a') : '#4a3a40'; P.hline(x, y, 2, col); P.hline(x + 3, y, 2, col); P.hline(x, y + 1, 5, col); P.hline(x + 1, y + 2, 3, col); P.px(x + 2, y + 3, col); }
    // le client et le total des pourboires
    texteC(P, (E.n + 1) + '/3', 76, 7, '#f0cc6a');
    if (E.pourboires) { P.ellipse(L.w * 0.5 + 60, 9, 3, 3, '#e8b54a'); A.texte(P, String(E.pourboires), L.w * 0.5 + 66, 7, '#f0cc6a'); }
    if (E.poste !== 'commande' && E.phase === 'attend') ticket(P, L.ticket.x, L.ticket.y + 22, L.ticket.w, 99, false);
    // les onglets
    for (const o of L.onglets) {
      const actif = o.p === E.poste, ok = dispo(o.p), al = E.phase === 'attend' ? alarme(o.p) : 0;
      P.rect(o.x, o.y, o.w, o.h, '#1d1626');
      P.rect(o.x + 1, o.y + (actif ? 0 : 2), o.w - 2, o.h - (actif ? 1 : 3), actif ? '#7a4a28' : ok ? '#4e2a18' : '#2a2026');
      P.hline(o.x + 1, o.y + (actif ? 0 : 2), o.w - 2, actif ? D.OR[4] : ok ? D.OR[2] : '#3a3440');
      iconeOnglet(P, o.p, o.x + 5, o.y + 6, ok);
      A.texte(P, T().onglets[POSTES.indexOf(o.p)], o.x + 19, o.y + 9, ok ? '#f6ead2' : '#6a5a5a');
      if (fait(o.p) && o.p !== 'commande') { P.px(o.x + o.w - 8, o.y + 7, '#5ad07a'); P.px(o.x + o.w - 7, o.y + 8, '#5ad07a'); P.px(o.x + o.w - 6, o.y + 7, '#5ad07a'); P.px(o.x + o.w - 5, o.y + 6, '#5ad07a'); P.px(o.x + o.w - 4, o.y + 5, '#5ad07a'); }
      if (al && Math.sin(t * (al === 2 ? 14 : 7)) > 0) { P.rect(o.x + o.w - 9, o.y + 3, 7, 9, al === 2 ? '#e8301e' : '#3aa04a'); A.texte(P, '!', o.x + o.w - 7, o.y + 5, '#ffffff'); }
      if (o.p === 'caramel' && E.caramel.etape === 'cuisson' && E.caramel.fondu > 0) { P.rect(o.x + o.w - 16, o.y + 14, 5, 5, '#1d1626'); P.rect(o.x + o.w - 15, o.y + 15, 3, 3, nuance(E.caramel.c)); }
      if (o.p === 'four' && E.four.etape === 'cuit') barre(P, o.x + 19, o.y + 16, o.w - 30, E.four.cuisson, REGLAGES.four.cible[0]);
    }
    // Rémy, en bas à gauche, qui réagit à tout
    if (E.poste !== 'commande' || E.phase !== 'arrive') {
      const im = Resto.grand(E.remyPose, Math.floor(t * 4) % 2), bond = E.remyPose === 'joie' ? Math.round(Math.abs(Math.sin(t * 7)) * 4) : E.remyPose === 'panique' ? Math.round(Math.sin(t * 30)) : 0;
      g.drawImage(im, L.remy.x - Math.round(im.width / 2), L.remy.y - im.height - bond);
    }
  }
  function iconeOnglet(P, p, x, y, ok) {
    const c = ok ? 1 : 0;
    if (p === 'commande') { P.rect(x, y, 9, 11, c ? '#fbf8ee' : '#6a6a72'); for (let k = 0; k < 3; k++) P.hline(x + 2, y + 3 + k * 3, 5, '#8a8a9a'); }
    else if (p === 'caramel') { P.rect(x, y + 3, 10, 6, c ? D.CUIVRE[3] : '#6a5a5a'); P.ellipse(x + 5, y + 3, 5, 2, c ? '#e4a440' : '#7a6a6a'); P.rect(x + 10, y + 4, 4, 2, D.NOYER[3]); }
    else if (p === 'four') { P.rect(x, y, 11, 11, c ? D.INOX[4] : '#5a5a66'); P.rect(x + 2, y + 3, 7, 5, c ? '#c8501e' : '#3a3a46'); }
    else if (p === 'garnir') { P.trap(x, 9, x + 3, 3, y, 9, c ? '#e0c098' : '#6a6a72'); P.rect(x + 4, y + 9, 2, 2, D.INOX[4]); }
    else { P.ellipse(x + 5, y + 7, 6, 3, c ? '#f4f2ec' : '#6a6a72'); P.ellipse(x + 5, y + 5, 4, 2, c ? '#d8a050' : '#5a5a66'); }
  }
  function particules(g, P) {
    for (const q of E.parts) {
      const a = 1 - q.t / q.max;
      if (q.type === 'coeur') { const L = mise(E.J.V); g.globalAlpha = Math.min(1, a * 2); Entites.poser(g, Entites.SPR.coeur, Math.round(L.w * 0.36 + q.x), Math.round(L.h * 0.3 + q.y)); }
      else if (q.type === 'sel') { g.globalAlpha = a; P.px(Math.round(q.x), Math.round(q.y), '#ffffff'); }
      else if (q.type === 'noisette') { g.globalAlpha = a; P.ellipse(Math.round(q.x), Math.round(q.y), 2, 2, '#7a4a22'); }
      g.globalAlpha = 1;
    }
  }

  function draw(g, V, t) {
    if (!E) return;
    const L = mise(V), P = PX.painter(g.canvas);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#120a0c'; g.fillRect(0, 0, V.w, V.h);
    if (E.poste !== 'commande') bulleClient(null);
    if (E.poste === 'commande') posteCommande(g, P, L, t);
    else if (E.poste === 'caramel') posteCaramel(g, P, L, t);
    else if (E.poste === 'four') posteFour(g, P, L, t);
    else if (E.poste === 'garnir') posteGarnir(g, P, L, t);
    else posteDresser(g, P, L, t);
    if (E.poste !== 'commande') eclairer(g, L, E.poste);
    entete(g, P, L, t);
    particules(g, P);
    g.restore();
  }
  const vue = { update, draw, pointeur, action() {} };

  // pour les essais : un client servi d'un coup (#test)
  const dev = { etat: () => E, servir, noter: () => noter(), aller, finir: () => fermer(true) };
  return { lancer, REGLAGES, dev };
})();
