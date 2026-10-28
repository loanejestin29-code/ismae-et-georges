// =====================================================================
//  persos-neige.js — les personnages d'Arendelle (épreuve 3) et Jack Snow.
//
//  · Olaf, Sven, les trolls et les enfants : grilles de lettres faites main.
//  · Anna, Elsa, Kristoff, Oaken, les gardes : même corps qu'Ismae (characters.js),
//    avec leur coiffure et leur tenue (couleurs dans config.js → arendelle.persos).
//  · JACK SNOW, le bonhomme de neige construit par Loane et Ismae : dessin en
//    pièces détachées (grosse boule, ventre, tête, yeux en cuillères, nez et sourire
//    en brindilles, bras en branches, boutons, écharpe noire), utilisé à la fois dans
//    le mini-jeu d'assemblage (agrandi) et dans la rue. Pour changer son apparence,
//    il suffit de modifier la fonction jack() ci-dessous.
// =====================================================================
'use strict';

const Neige = (() => {
  const S = PX.shade, line = Objets.line;
  const sansYeux = (rows) => rows.map((r) => r.replace(/E/g, 'w'));
  const grille = (rows, pal) => PX.outline(PX.fromRows(rows, pal), 'auto');
  // un jeu d'images comme Sprites.person : { down, up, left, right } → { idle, blink, walk[4] }
  function jeu(dirs, pal, jambes) {
    const out = {};
    const frames = (rows, dir) => {
      const vide = '.'.repeat(rows[0].length);
      const avec = (legs) => (legs ? rows.slice(0, rows.length - legs.length).concat(legs) : rows);
      const bas = (r) => [vide].concat(r), haut = (r) => r.concat([vide]); // le petit rebond de la marche
      const L = jambes && jambes[dir];
      return {
        idle: grille(bas(rows), pal), blink: grille(bas(sansYeux(rows)), pal),
        walk: [grille(bas(avec(L && L[0])), pal), grille(haut(rows), pal), grille(bas(avec(L && L[1])), pal), grille(haut(rows), pal)],
      };
    };
    out.down = frames(dirs.down, 'down'); out.up = frames(dirs.up, 'up');
    out.right = frames(dirs.side, 'side');
    out.left = { idle: PX.flipX(out.right.idle), blink: PX.flipX(out.right.blink), walk: out.right.walk.map(PX.flipX) };
    return out;
  }

  // ------------------------------------------------------------ OLAF
  // W neige, w ombre bleutée, E yeux, O carotte, m bouche, T dent, B charbon, l brindilles
  const OLAF = {
    down: ['........l.........', '......l.l.l.......', '.......lll........', '.....WWWWWWW......', '....WWWWWWWWw.....', '...WWWWWWWWWWw....',
      '...WWEWWWWEWWw....', '...WWEWWWWEWWw....', '...WWWWWOOWWWw....', '...WWWWWOOOOWw....', '...WWmmmmmmWWw....', '....WWmTTmWWw.....',
      '.....WWWWWWw......', '......WWWWw.......', 'll...WWWWWWw...ll.', '.lll.WWWBWWw.ll...', '...llWWWWWWwll....', '.....WWWBWWw......',
      '......WWWWw.......', '....WWWWWWWWw.....', '...WWWWWWWWWWw....', '...WWWWWWWWWWw....', '...WWWWWWWWWWw....', '....wWWWWWWWw.....', '....WW.....WW.....'],
    side: ['.......l..........', '.....l.l.l........', '......lll.........', '.....WWWWWW.......', '....WWWWWWWW......', '...wWWWWWWWWW.....',
      '...wWWWWWWEWW.....', '...wWWWWWWEWW.....', '...wWWWWWWWWOOOO..', '...wWWWWWWWWOOo...', '...wWWWWWmmmmW....', '....wWWWWmTmW.....',
      '.....wWWWWWW......', '......wWWWW.......', '.....wWWWWWW..ll..', '..llwWWWBWWWll....', '...lwWWWWWWW......', '.....wWWBWWW......',
      '......wWWWW.......', '....wWWWWWWWW.....', '...wWWWWWWWWWW....', '...wWWWWWWWWWW....', '...wWWWWWWWWWW....', '....wWWWWWWWW.....', '.....WW...WW......'],
  };
  OLAF.up = OLAF.down.map((r) => r.replace(/[EOmTB]/g, 'W'));
  const OLAF_JAMBES = {
    down: [['...WW......WW.....'], ['....WW......WW....']], up: [['...WW......WW.....'], ['....WW......WW....']],
    side: [['....WW.....WW.....'], ['......WW.WW.......']],
  };
  const OLAF_PAL = { W: '#f4f8ff', w: '#c8d6ea', E: '#1d1626', O: '#f08a24', o: '#c8641a', m: '#5a3a4a', T: '#ffffff', B: '#2a2632', l: '#6a4428' };
  const olaf = () => jeu(OLAF, OLAF_PAL, OLAF_JAMBES);

  // ------------------------------------------------------------ SVEN (le renne)
  // F pelage, f ombre, D clair (museau, ventre), a bois, E œil, N truffe, h sabots, t queue
  const SVEN = {
    side: ['..................a...a.....', '.................aa..aa.....', '..................aaaa......', '..................FFFF......', '.................FFFFFF.....',
      '.................FFEFFDD....', '.................FFFFDDDN...', '................FFFF.DD.....', '..FFFFFFFFFFFFFFFFF.........', '.FFFFFFFFFFFFFFFFFFF........',
      't.FFFFFFFFFFFFFFFFF.........', 'tFFFFFFFFFFFFFFFFFF.........', '..fDDDDDDDDDDDDDff..........', '...FF..FF.....FF..FF........', '...FF..FF.....FF..FF........',
      '...Ff..Ff.....Ff..Ff........', '...hh..hh.....hh..hh........'],
    down: ['..a..........a..', '..aa........aa..', '...aa.FFFF.aa...', '....aFFFFFFa....', '..ff.FFFFFF.ff..', '.....FEFFEF.....', '.....FFFFFF.....',
      '.....FDDDDF.....', '......DNND......', '......DDDD......', '....FFFFFFFF....', '...FFFFFFFFFF...', '...FDDDDDDDDF...', '...FF......FF...',
      '...FF......FF...', '...Ff......Ff...', '...hh......hh...'],
  };
  SVEN.up = SVEN.down.map((r) => r.replace(/[EDN]/g, 'F'));
  const SVEN_JAMBES = {
    side: [['....FF..FF...FF..FF........', '....FF..FF...FF..FF........', '....Ff..Ff...Ff..Ff........', '....hh..hh...hh..hh........'].map((r) => r + '.'),
      [['..FF....FF..FF....FF.......', '..FF....FF..FF....FF.......', '..Ff....Ff..Ff....Ff.......', '..hh....hh..hh....hh.......'].map((r) => r + '.')][0]],
    down: [['...FF.......FF..', '...Ff.......Ff..', '...hh.......hh..'].map((r) => r.slice(0, 16)), ['....FF....FF....', '....Ff....Ff....', '....hh....hh....']],
  };
  SVEN_JAMBES.up = SVEN_JAMBES.down;
  const SVEN_PAL = { F: '#8a6a4a', f: '#6a4a32', D: '#e0c8a8', a: '#d0b890', E: '#1d1626', N: '#2a1a14', h: '#3a2a20', t: '#e0c8a8', w: '#6a4a32' };
  const sven = () => jeu(SVEN, SVEN_PAL, SVEN_JAMBES);

  // ------------------------------------------------------------ petits figurants : trolls et enfants
  // trolls : pierre (R), mousse (G/g), oreilles (o), nez (N), collier de cristaux (C/c)
  const TROLL = {
    idle: ['.....gGGg.....', '...gGGGGGGg...', '..gRRRRRRRRg..', '.RRRERRRRERRR.', 'oRRRRRRRRRRRRo', '.RRRRRNNRRRRR.', '.RRRRmmmmRRRR.', '..RRRRRRRRRR..',
      '..RcCcCcCcRR..', '..RRRRRRRRRR..', '...RR....RR...', '...rr....rr...'],
    joie: ['.....gGGg.....', '...gGGGGGGg...', 'R.gRRRRRRRRg.R', 'RRRREERRREERRR', 'oRRRRRRRRRRRRo', '.RRRRRNNRRRRR.', '.RRRmmmmmmRRR.', '..RRRmmmmRRR..',
      '..RcCcCcCcRR..', '..RRRRRRRRRR..', '...RR....RR...', '...rr....rr...'],
  };
  function troll(seed) {
    const r = PX.rng(seed), mousse = r.pick(['#4e7a4a', '#6a9a5a', '#3a6a4a']);
    const pal = { R: '#7a7a8a', r: '#5a5a6a', g: S(mousse, -0.25), G: mousse, o: '#8a8a9a', E: '#1d1626', N: '#6a6a7a', m: '#3a2a3a', c: '#8adcf0', C: '#f2c230', w: '#7a7a8a' };
    return { idle: grille(TROLL.idle, pal), blink: grille(sansYeux(TROLL.idle), pal), joie: grille(TROLL.joie, pal) };
  }
  // enfants en combinaison de ski : V pompon, A/a bonnet, Y bande, K peau, E yeux, m bouche, X écharpe, T manteau, M moufles, P pantalon, B bottes
  const ENFANT = {
    idle: ['.....VV.....', '....AAAA....', '...AAAAAA...', '..aYaYaYaY..', '..KKKKKKKK..', '..KEKKKKEK..', '..KKKmmKKK..', '...KKKKKK...', '..XXXXXXXX..',
      '.TTTTTTTTTT.', '.MTTTTTTTTM.', '..TTTTTTTT..', '..TTTTTTTT..', '..PPP..PPP..', '..BBB..BBB..'],
    joie: ['.....VV.....', '....AAAA....', '...AAAAAA...', '..aYaYaYaY..', 'M.KKKKKKKK.M', 'TKKEKKKKEKKT', 'T.KKmmmmKK.T', '.T.KKKKKK.T.', '.TXXXXXXXXT.',
      '..TTTTTTTT..', '..TTTTTTTT..', '..TTTTTTTT..', '..TTTTTTTT..', '..PPP..PPP..', '..BBB..BBB..'],
  };
  function enfant(cfg) {
    const pal = {
      V: cfg.pompon || '#ffffff', A: cfg.bonnet, a: S(cfg.bonnet, -0.3), Y: cfg.bande || '#ffffff', K: cfg.peau || '#f0c8a8', E: '#1d1626', m: '#c0506a',
      X: cfg.echarpe, T: cfg.manteau, M: cfg.moufles || cfg.echarpe, P: cfg.pantalon || '#2a3a5a', B: cfg.bottes || '#3a2a2a', w: cfg.peau || '#f0c8a8',
    };
    return { idle: grille(ENFANT.idle, pal), blink: grille(sansYeux(ENFANT.idle), pal), joie: grille(ENFANT.joie, pal) };
  }

  // ------------------------------------------------------------ Anna, Elsa, Kristoff, Oaken, les gardes
  const ST = Sprites.ISMAE_STYLE, LO = Sprites.LOANE_STYLE, TO = Sprites.TOM_STYLE, JU = Sprites.JUPE;
  const ferme = (rows) => rows.map((r) => r.replace(/I/g, 'T').replace(/i/g, 't'));
  // longue robe (Elsa)
  const ROBE = {
    down: [0, 1, 2].map((k) => ['.....pPPPPp.....', '....pPOPPPPp....', '....pPOPPPPp....', '...pPOPPPPPPp...', '...pPOPPPPPPp...', '..pPOPPPPPPPPp..', '..pPPPPPPPPPPp..',
      ['...BBB....BBB...', '..BBB......BB...', '...BB......BBB..'][k]]),
    side: [0, 1, 2].map((k) => ['......PPPPP.....', '.....pPPOPPp....', '.....pPPOPPp....', '....pPPPOPPPp...', '....pPPPOPPPp...', '...pPPPPOPPPPp..', '...pPPPPPPPPPp..',
      ['....BBB..BBBB...', '..BBB......BBBB.', '.....BBBBBB.....'][k]]),
  };
  const modele = (tete, torse, jambes, meches, dec = 0) => ({
    largeur: 16, hauteur: 30 + dec, decalage: dec,
    down: { tete: tete.down, torse: torse.down, jambes: jambes.down, meches: meches && meches.down },
    up: { tete: tete.up, torse: torse.up, jambes: jambes.up || jambes.down, meches: meches && meches.up },
    side: { tete: tete.side, torse: torse.side, jambes: jambes.side, meches: meches && meches.side },
  });
  const TORSE_OUVERT = { down: ST.down.torse, up: ST.up.torse, side: ST.side.torse };
  const TORSE_FERME = { down: ST.down.torse.map(ferme), up: ST.up.torse.map(ferme), side: ST.side.torse.map(ferme) };
  const TETE_LONGS = { down: LO.down.tete, up: LO.up.tete, side: LO.side.tete };
  // Anna : deux tresses qui tombent devant les épaules
  const TRESSES = {
    down: ['..hH........Hh..', '..HL........LH..', '..hH........Hh..', '..HL........LH..', '..hH........Hh..', '...h........h...'],
    up: ['.hHHHHHHHHHHHHh.', '..hHHHHHHHHHHh..', '...hH......Hh...', '...HL......LH...', '...hH......Hh...', '....h......h....'],
    side: ['.hHHh...........', '.hHLh...........', '..hH............', '..HL............', '..hH............', '...h............'],
  };
  // Elsa : une grosse tresse sur l'épaule
  const TRESSE = {
    down: ['...........HHh..', '..........HLHh..', '...........HHh..', '..........HLH...', '...........HH...', '...........Hh...', '...........h....'],
    up: ['.hHHHHHHHHHHHHh.', '..hHHHHHHHHHHh..', '...hHHHHHHHHh...', '.....hHHHHh.....', '......hHHh......'],
    side: ['.hHHHh..........', '.hHLHh..........', '..hHHh..........', '..hHL...........', '...hH...........', '...h............'],
  };
  // Kristoff : bonnet de laine sur des cheveux blonds en bataille
  const TETE_KRISTOFF = {
    down: ['................', '.....aAAAAa.....', '....aAAAAAAa....', '...aAAAAAAAAa...', '..hHaaaaaaaaHh..', '..hHHHLHHLHHHh..', '..hFHKhKKhKHFh..', '..kFKKKKKKKKFk..',
      '...KKEKKKKEKK...', '...KKEKKKKEKK...', '...kKKKKKKKKk...', '....kkKKKKkk....'],
    up: ['................', '.....aAAAAa.....', '....aAAAAAAa....', '...aAAAAAAAAa...', '..hHaaaaaaaaHh..', '..hHHHHHHHHHHh..', '..hHHHLHHHHHHh..', '..kFHHHHHHHHFk..',
      '...FHHHHHHHHF...', '...FFHHHHHHFF...', '...kFFFFFFFFk...', '....kkKKKKkk....'],
    side: ['................', '.....aAAAAa.....', '....aAAAAAAa....', '...aAAAAAAAAa...', '..hHaaaaaaaahK..', '..hHHHHHHhKKKh..', '..FFHHHhKKKKK...', '..FFFkKKKKEKK...',
      '..FFFkKKKKEKKK..', '..hFFKKKKKKKK...', '...hFkKKKKKKk...', '.....kkKKKkk....'],
  };
  // Oaken : grosse tête blonde, joues roses
  const TETE_OAKEN = {
    down: ['................', '....hHHHHHHh....', '...hHHLLHHHHh...', '..hHHHHHHHHHHh..', '..hHHHHHHHHHHh..', '..HKKKKKKKKKKH..', '..KKKKKKKKKKKK..', '..KKEKKKKKKEKK..',
      '..KmKKKKKKKKmK..', '..KKKKKKKKKKKK..', '...KKKkkkkKKK...', '....kKKKKKKk....'],
    up: ['................', '....hHHHHHHh....', '...hHHLLHHHHh...', '..hHHHHHHHHHHh..', '..hHHHHHHHHHHh..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..kHHHHHHHHHHk..',
      '..kHHHHHHHHHHk..', '..kKKKKKKKKKKk..', '...kKKKKKKKKk...', '....kKKKKKKk....'],
    side: ['................', '....hHHHHHh.....', '...hHHLLHHHh....', '..hHHHHHHHHHh...', '..hHHHHHHHKKh...', '..HHHHHHKKKKKK..', '..HHHHKKKKKKKK..', '..HHHKKKKKKEKK..',
      '..HHHKKKKKmKKKK.', '..hHHKKKKKKKKK..', '...hHkKKKKKKk...', '....kKKKKKKk....'],
  };
  const TETE_GARDE = { down: TO.down.tete, up: TO.up.tete, side: TO.side.tete };
  const JAMBES_PANTALON = { down: ST.down.jambes, up: ST.down.jambes, side: ST.side.jambes };
  const MODELES = {
    anna: modele(TETE_LONGS, TORSE_OUVERT, { down: JU.down, up: JU.down, side: JU.side }, TRESSES),
    elsa: modele(TETE_LONGS, TORSE_FERME, ROBE, TRESSE),
    kristoff: modele(TETE_KRISTOFF, TORSE_OUVERT, JAMBES_PANTALON),
    oaken: modele(TETE_OAKEN, TORSE_FERME, JAMBES_PANTALON),
    garde: modele(TETE_GARDE, TORSE_OUVERT, JAMBES_PANTALON),
  };
  const humain = (nom, cfg) => Sprites.person(Object.assign({}, cfg, { modele: MODELES[nom] }));

  // ------------------------------------------------------------ JACK SNOW
  // dessin à la taille du jeu (28 × 44) ; morceaux = { base, corps, tete, yeux, nez, brasG, brasD, boutons, echarpe }
  // o.vie : 0 (immobile) ou le temps de l'animation quand il prend vie ; o.contour : silhouettes des places vides
  const JACK = { W: 30, H: 46, cx: 15, sol: 44 };
  const N1 = '#f4f8ff', N2 = '#d8e4f4', N3 = '#aec2dc', N4 = '#8aa0c0';
  function boule(P, cx, cy, rx, ry) {
    P.ellipse(cx, cy, rx + 1, ry + 1, N4); P.ellipse(cx, cy, rx, ry, N3); P.ellipse(cx - 1, cy - 1, rx - 1, ry - 1, N2);
    P.ellipse(cx - 2, cy - 2, Math.max(1, rx - 3), Math.max(1, ry - 3), N1); P.px(cx - Math.round(rx * 0.5), cy - Math.round(ry * 0.5), '#ffffff');
  }
  // où va chaque morceau (aussi utilisé par le mini-jeu pour les places à remplir)
  const PLACES = {
    base: { x: 15, y: 36, rx: 11, ry: 7 }, corps: { x: 15, y: 23, rx: 9, ry: 7 }, tete: { x: 15, y: 9, rx: 7, ry: 7 },
    yeux: { x: 15, y: 7, rx: 5, ry: 2 }, nez: { x: 15, y: 11, rx: 5, ry: 2 }, brasG: { x: 4, y: 19, rx: 4, ry: 3 }, brasD: { x: 26, y: 17, rx: 4, ry: 4 },
    boutons: { x: 15, y: 24, rx: 2, ry: 5 }, echarpe: { x: 15, y: 16, rx: 8, ry: 4 },
  };
  function jack(m, o = {}) {
    const { c, P } = (() => { const cc = PX.canvas(JACK.W, JACK.H); return { c: cc, P: PX.painter(cc) }; })();
    const vie = o.vie || 0, bouge = vie > 0;
    const leve = bouge ? Math.round(Math.abs(Math.sin(vie * 6)) * 3) : 0;
    const B = '#6a4428', B2 = '#3a2618';
    if (m.brasG) { const a = bouge ? Math.sin(vie * 8) * 3 : 0; line(P, 8, 21, 1, 17 - a, B); line(P, 4, 19 - a / 2, 2, 15 - a, B); line(P, 3, 18 - a / 2, 0, 19 - a, B2); }
    if (m.brasD) { const a = bouge ? Math.sin(vie * 8 + 1.5) * 4 : 0; line(P, 22, 20, 28, 13 - a, B); line(P, 25, 16 - a / 2, 29, 17 - a, B); line(P, 27, 14 - a, 28, 10 - a, B2); }
    if (m.base) { boule(P, 15, 36, 11, 7); P.ellipse(15, 42, 13, 2, N3); P.ellipse(15, 41, 12, 1, N2); }
    if (m.corps) { boule(P, 15, 25, 9, 6); boule(P, 15, 18, 7, 4); }
    if (m.boutons) for (const y of [21, 25, 29]) { P.rect(14, y, 2, 2, '#2a2632'); P.px(14, y, '#5a5668'); }
    if (m.tete) boule(P, 15, 9 - leve * 0, 7, 7);
    if (m.yeux) {
      const cligne = bouge && Math.floor(vie * 3) % 4 === 3;
      // deux cuillères ovales, argentées et brillantes
      for (const ex of [12, 18]) {
        if (cligne) { P.hline(ex - 1, 7, 3, '#4a4658'); continue; }
        P.rect(ex - 1, 5, 3, 4, '#6a6678'); P.px(ex - 1, 5, N1); P.px(ex + 1, 5, N1); P.px(ex - 1, 8, N2); P.px(ex + 1, 8, N2);
        P.rect(ex - 1, 6, 2, 2, '#c8ccd8'); P.px(ex, 5, '#e8eaf2'); P.px(ex - 1, 6, '#ffffff');
      }
    }
    if (m.nez) {
      P.hline(14, 10, 3, B2); P.px(17, 9, B2);
      const ouvert = bouge && Math.floor(vie * 4) % 2;
      for (const [x, y] of [[10, 12], [11, 13], [12, 13], [13, 14], [14, 14], [15, 14], [16, 14], [17, 13], [18, 13], [19, 12]]) P.px(x, y, B);
      if (ouvert) { P.hline(13, 15, 4, '#5a3a4a'); }
    }
    if (m.echarpe) {
      const k = '#1d1a22', h = '#3a3644';
      P.rect(8, 14, 15, 3, k); P.hline(8, 14, 15, h);
      P.rect(18, 16, 3, 13, k); P.vline(18, 16, 13, h); for (let x = 18; x < 21; x++) P.px(x, 29 + (x % 2), k);
      P.rect(10, 16, 2, 5, k); P.px(10, 21, k); P.px(11, 22, k);
    }
    // les places encore libres : une ombre bleutée et des pointillés foncés (bien visibles sur la neige)
    if (o.contour) for (const [nom, p] of Object.entries(PLACES)) {
      if (m[nom] || !o.contour.includes(nom)) continue;
      P.ellipse(p.x, p.y, p.rx, p.ry, 'rgba(70,90,150,0.18)');
      for (let a = 0; a < 28; a++) if (a % 2 === 0) P.px(Math.round(p.x + Math.cos(a / 28 * 6.283) * p.rx), Math.round(p.y + Math.sin(a / 28 * 6.283) * p.ry), o.couleurContour || '#3a4a8a');
    }
    return c;
  }
  // le dessin d'un morceau seul (pour les pièces du mini-jeu)
  function morceau(nom) {
    const c = jack({ [nom]: true });
    const p = PLACES[nom];
    return { img: c, x: p.x, y: p.y };
  }

  return { olaf, sven, troll, enfant, humain, MODELES, jack, morceau, PLACES, JACK };
})();
