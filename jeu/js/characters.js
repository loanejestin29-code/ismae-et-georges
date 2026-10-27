// =====================================================================
//  characters.js — sprites d'Ismae (personnage « poupée en papier »
//  dont chaque partie se recolore depuis config.js), de Georges et
//  des autres animaux. Chaque lettre d'une grille = une couleur :
//   K/k peau  H/h/L cheveux  E yeux  m bouche  X/x écharpe
//   T/t/U veste  P/p pantalon  B/b chaussures  G lunettes  D barbe
// =====================================================================
'use strict';

const Sprites = (() => {
  // ------------------------------------------------------------ TÊTES
  // 16 colonnes, 10 lignes. Une entrée par coiffure et par direction.
  const FACE_DOWN = [
    '..kHKKKKKKKKHk..',
    '..kKKEKKKKEKKk..',
    '...KKEKKKKEKK...',
    '...kKKKKKKKKk...',
    '....kKKmmKKk....',
    '.....kkKKkk.....',
  ];
  const FACE_SIDE = [
    '...HHHHkKKKKK...',
    '...HHHkkKKKEK...',
    '...hHHHkKKKEKK..',
    '...hHHKKKKKKK...',
    '....hkKKKKKmk...',
    '.....kkKKKKk....',
  ];
  const HEADS = {
    court: {
      down: ['....hHHHHHHh....', '...hHHLLHHHHh...', '...HHHHHHHHHH...', '...HhKhKKKKhH...', ...FACE_DOWN],
      up: ['....hHHHHHHh....', '...hHHLLHHHHh...', '...HHHHLHHHHH...', '...HHHHHHHHHH...', '..kHHHHHHHHHHk..',
        '..kHHHHHHHHHHk..', '...hHHHHHHHHh...', '...khHHHHHHhk...', '....kkhhhhkk....', '.....kKKKKk.....'],
      side: ['.....hHHHHh.....', '...hHHHLLHHh....', '...HHHHHHHHHH...', '...HHHHHHHHhK...', ...FACE_SIDE],
    },
    boucles: {
      down: ['....hHhhHhHh....', '...hHLHHhHLHh...', '..hHHHhHHHhHHh..', '..HHhKKHKKKhHH..',
        '..HHKKKKKKKKHH..', '..hKKEKKKKEKKh..', ...FACE_DOWN.slice(2)],
      up: ['....hHhhHhHh....', '...hHLHHhHLHh...', '..hHHHhHHHhHHh..', '..HHhHHHHhHHHH..', '..HHHHhHHHHhHH..',
        '..hHHHHHhHHHHh..', '...HhHHHHHHhH...', '...khHhHHhHhk...', '....kkhhhhkk....', '.....kKKKKk.....'],
      side: ['....hHhHHhH.....', '...hHLHHhHLh....', '..hHHHhHHHHHh...', '..HHhHHHHHHhK...', '..HHHHHkKKKKK...',
        '..hHHHkkKKKEK...', ...FACE_SIDE.slice(2)],
    },
    meche: {
      down: ['.....hHHHHHh....', '...hHHHLLLHHh...', '...HHHHHHHHHHh..', '...HKKKhHHHHhh..', ...FACE_DOWN],
      up: ['....hHHHHHHh....', '...hHHLLLHHHh...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '..kHHHHHHHHHHk..',
        '..kHHHHHHHHHHk..', '...hHHHHHHHHh...', '...khHHHHHHhk...', '....kkhhhhkk....', '.....kKKKKk.....'],
      side: ['.....hHHHHHh....', '...hHHHLLLHHh...', '...HHHHHHHHHHh..', '...HHHHHHHHHhh..', ...FACE_SIDE],
    },
    // dégradé court sur les côtés (F), dessus texturé, mèche vers la droite, sourcils marqués
    degrade: {
      down: ['....hHLHHLHh....', '...hHHHLHHHLh...', '...HHHHHHHHHHh..', '...FhKKKKhHHF...', '..kFKhhKKhhKFk..',
        ...FACE_DOWN.slice(1)],
      up: ['....hHLHHLHh....', '...hHHHLHHHLh...', '...HHHHHHHHHH...', '...hHHHHHHHHh...', '..kFHHHHHHHHFk..',
        '..kFFHHHHHHFFk..', '...FFFhhhhFFF...', '...kFFFFFFFFk...', '....kkFFFFkk....', '.....kKKKKk.....'],
      side: ['.....hHLHLh.....', '...hHHLHHHLHh...', '...hHHHHHHHHHH..', '...FHHHHHHHhK...', '...FFFFkKKhhK...',
        '...FFFkkKKKEK...', '...kFFFkKKKEKK..', '...kFFKKKKKKK...', '....kkKKKKKmk...', '.....kkKKKKk....'],
    },
    // chignon (habitantes)
    chignon: {
      down: ['......hHHh......', '....hHHLLHHh....', '...hHHHHHHHHh...', '...HhKKKKKKhH...', ...FACE_DOWN],
      up: ['......hHHh......', '....hHHLLHHh....', '...hHHHHHHHHh...', '...HHHHhHHHHH...', '..kHHHHHHHHHHk..',
        '..kHHHHHHHHHHk..', '...hHHHHHHHHh...', '...khHHHHHHhk...', '....kkKKKKkk....', '.....kKKKKk.....'],
      side: ['.....hHHHh......', '...hHHLLHHh.....', '...HHHHHHHHHH...', '...HHHHHHHHhK...', ...FACE_SIDE],
    },
    rase: {
      down: ['....hhHHHHhh....', '...hHHhHHhHHh...', '...hKhKhhKhKh...', '...KKKKKKKKKK...',
        '..kKKKKKKKKKKk..', ...FACE_DOWN.slice(1)],
      up: ['....hhHHHHhh....', '...hHHhHHhHHh...', '...hHhHhhHhHh...', '...hhHhHhHhHh...', '..khHhHhhHhHk..',
        '..khhHhHHhHhk...', '...khhHhHhhk....', '...kKhhKKhhKk...', '....kkKKKKkk....', '.....kKKKKk.....'],
      side: ['.....hhHHhh.....', '...hHhHHhHh.....', '...hHhHhHhhK....', '...hhHhKKKKKK...', '...hKKKkKKKKK...',
        '...KKKkkKKKEK...', '...KKKKkKKKEKK..', '...kKKKKKKKKK...', '....kkKKKKKmk...', '.....kkKKKKk....'],
    },
  };

  const GLASSES = {
    down: [[4, 4], [5, 4], [6, 4], [9, 4], [10, 4], [11, 4], [4, 5], [6, 5], [7, 5], [8, 5], [9, 5], [11, 5], [4, 6], [6, 6], [9, 6], [11, 6]],
    side: [[10, 4], [11, 4], [12, 4], [10, 5], [12, 5], [10, 6], [11, 6], [12, 6], [8, 5], [9, 5]],
  };
  const BEARDS = {
    courte: {
      down: [[3, 7], [12, 7], [4, 8], [5, 8], [10, 8], [11, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9]],
      side: [[6, 7], [6, 8], [7, 8], [8, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9]],
    },
    pleine: {
      down: [[3, 6], [12, 6], [3, 7], [4, 7], [11, 7], [12, 7], [4, 8], [5, 8], [6, 8], [9, 8], [10, 8], [11, 8],
        [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9]],
      side: [[6, 6], [6, 7], [7, 7], [8, 7], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9], [11, 9]],
    },
  };

  // ------------------------------------------------------------ CORPS
  // 8 lignes ; poses : 0 = repos, 1 = pas A, 2 = pas B
  const TORSO = {
    down: [
      ['.......kk.......', '....XXXXXXXX....', '...tTXXXXXXTt...', '...tTTTXxTTTt...', '...tUTTXxTTTt...', '...tUTTTxTTTt...', '...kTTTTTTTtk...', '....ttTTTTtt....'],
      ['.......kk.......', '....XXXXXXXX....', '...tTXXXXXXTt...', '...tTTTXxTTTt...', '...tUTTXxTTTt...', '...tUTTTxTTTk...', '...kTTTTTTTt....', '....ttTTTTtt....'],
      ['.......kk.......', '....XXXXXXXX....', '...tTXXXXXXTt...', '...tTTTXxTTTt...', '...tUTTXxTTTt...', '...kUTTTxTTTt...', '....TTTTTTTtk...', '....ttTTTTtt....'],
    ],
    up: [
      ['.......kk.......', '....XXXXXXXX....', '...tTXXXXXXTt...', '...tTTTTTTTTt...', '...tUTTTtTTTt...', '...tUTTTtTTTt...', '...kTTTTtTTtk...', '....ttTTTTtt....'],
      ['.......kk.......', '....XXXXXXXX....', '...tTXXXXXXTt...', '...tTTTTTTTTt...', '...tUTTTtTTTt...', '...tUTTTtTTTk...', '...kTTTTtTTt....', '....ttTTTTtt....'],
      ['.......kk.......', '....XXXXXXXX....', '...tTXXXXXXTt...', '...tTTTTTTTTt...', '...tUTTTtTTTt...', '...kUTTTtTTTt...', '....TTTTtTTtk...', '....ttTTTTtt....'],
    ],
    side: [
      ['......kk........', '.....XXXXX......', '.....TXXXXT.....', '.....TTUTTXx....', '.....TTUTTTx....', '.....TTUTTT.....', '.....tTkTTt.....', '......tttt......'],
      ['......kk........', '.....XXXXX......', '.....TXXXXT.....', '.....TTTUTXx....', '.....TTTTUTx....', '.....TTTTTU.....', '.....tTTTTk.....', '......tttt......'],
      ['......kk........', '.....XXXXX......', '.....TXXXXT.....', '.....TUTTTXx....', '.....UTTTTTx....', '....UTTTTTT.....', '....ktTTTTt.....', '......tttt......'],
    ],
  };
  // tenue « blouson » : cuir ouvert (T/t/U, fermeture Z), t-shirt (I/i), ceinture (C) et boucle (c)
  const TORSO_BLOUSON = {
    down: [
      ['.......kk.......', '....TUIIIIUT....', '...tTZIIIIZTt...', '...tUTIIIITTt...', '...tUTIiIITTt...', '...tTZIIIIZTt...', '...kCCCccCCCk...', '....tPPPPPPt....'],
      ['.......kk.......', '....TUIIIIUT....', '...tTZIIIIZTt...', '...tUTIIIITTt...', '...tUTIiIITTt...', '...tTZIIIIZTk...', '...kCCCccCCC....', '....tPPPPPPt....'],
      ['.......kk.......', '....TUIIIIUT....', '...tTZIIIIZTt...', '...tUTIIIITTt...', '...tUTIiIITTt...', '...kTZIIIIZTt...', '....CCCccCCCk...', '....tPPPPPPt....'],
    ],
    up: [
      ['.......kk.......', '....TTUUUUTT....', '...tTTTTTTTTt...', '...tUTTTTTTTt...', '...tUTTTtTTTt...', '...tTTTTtTTTt...', '...kCCCCCCCCk...', '....tPPPPPPt....'],
      ['.......kk.......', '....TTUUUUTT....', '...tTTTTTTTTt...', '...tUTTTTTTTt...', '...tUTTTtTTTt...', '...tTTTTtTTTk...', '...kCCCCCCCC....', '....tPPPPPPt....'],
      ['.......kk.......', '....TTUUUUTT....', '...tTTTTTTTTt...', '...tUTTTTTTTt...', '...tUTTTtTTTt...', '...kTTTTtTTTt...', '....CCCCCCCCk...', '....tPPPPPPt....'],
    ],
    side: [
      ['......kk........', '.....TTTUI......', '.....TTUTTI.....', '.....TTUTTI.....', '.....TTUTTI.....', '.....tTUTTZ.....', '.....CCkCCc.....', '......PPPP......'],
      ['......kk........', '.....TTTUI......', '.....TTUTTI.....', '.....TTTUTI.....', '.....TTTTUI.....', '.....tTTTTU.....', '.....CCCCCk.....', '......PPPP......'],
      ['......kk........', '.....TTTUI......', '.....TTUTTI.....', '.....TUTTTI.....', '.....UTTTTI.....', '....UtTTTTZ.....', '....kCCCCCc.....', '......PPPP......'],
    ],
  };
  // pantalon « large » (plis O) qui tombe sur les baskets (B) à semelle claire (W)
  const LEGS_LARGE = {
    down: [
      ['....PPPPPPPP....', '....POPpPOPp....', '...PPOPppPOPp...', '...PPOPppPOPp...', '...pBBBppBBBp...', '...WWWW..WWWW...'],
      ['....PPPPPPPP....', '....POPpPOPp....', '...PPOPppPOPp...', '...PPOPppBBBp...', '...pBBBp.WWWW...', '...WWWW.........'],
      ['....PPPPPPPP....', '....POPpPOPp....', '...PPOPppPOPp...', '...pBBBppPOPp...', '...WWWW.pBBBp...', '.........WWWW...'],
    ],
    side: [
      ['......PPPP......', '.....PPOPPp.....', '.....PPOPPPp....', '....PPPOPPPp....', '.....pBBBBBB....', '.....WWWWWWWW...'],
      ['......PPPP......', '.....ppPPPP.....', '....pppPPOPP....', '....ppp..PPOP...', '...pBBB...pBBB..', '...WWWW...WWWWW.'],
      ['......PPPP......', '.....PPPPpp.....', '....PPOPPppp....', '...PPOP..ppp....', '..pBBB...pBBB...', '..WWWW...WWWWW..'],
    ],
  };
  LEGS_LARGE.up = LEGS_LARGE.down;

  // longue jupe (habitantes) : P = tissu, O = pli clair, B = bottines
  const LEGS_ROBE = {
    down: [
      ['....PPPPPPPP....', '....POPPPPpP....', '...PPOPPPPPpP...', '...POPPPPPPPp...', '..PPOPPPPPPPpP..', '....BB....BB....'],
      ['....PPPPPPPP....', '....POPPPPpP....', '...PPOPPPPPpP...', '...POPPPPPPPp...', '..PPOPPPPPPPpP..', '...BB......BB...'],
      ['....PPPPPPPP....', '....POPPPPpP....', '...PPOPPPPPpP...', '..PPOPPPPPPPp...', '...POPPPPPPPpP..', '.....BB..BB.....'],
    ],
    side: [
      ['......PPPP......', '.....PPOPPp.....', '....PPPOPPPp....', '....PPOPPPPPp...', '...PPOPPPPPPPp..', '......BB.BB.....'],
      ['......PPPP......', '.....PPOPPp.....', '....PPPOPPPp....', '...PPPOPPPPPp...', '...PPOPPPPPPPp..', '....BB....BBB...'],
      ['......PPPP......', '.....PPOPPp.....', '....PPPOPPPp....', '....PPOPPPPPPp..', '..PPPOPPPPPPp...', '.....BBB.BB.....'],
    ],
  };
  LEGS_ROBE.up = LEGS_ROBE.down;

  // chapeaux : 5 lignes posées 3 lignes au-dessus du haut de la tête
  // A = chapeau, a = ombre, Y = ruban, V = fleur
  const HATS = {
    melon: ['......AAAA......', '.....AAAAAA.....', '....AAAAAAAA....', '....aYYYYYYa....', '..aaAAAAAAAAaa..'],
    canotier: ['................', '....AAAAAAAA....', '....aYYYYYYa....', '..AAAAAAAAAAAA..', '...aaaaaaaaaa...'],
    beret: ['................', '.......A........', '....AAAAAAAAa...', '...AAAAAAAAAAa..', '....aaaaaaaaa...'],
    capeline: ['................', '.....AAAAAA.....', '....AAAAAAVV....', '.AAAAYYYYYYAAAA.', '..aaaaaaaaaaaa..'],
    casquette: ['................', '................', '.....AAAAAA.....', '....AAAAAAAA....', '...aYYYYYYYYa...'],
  };
  // tablier blanc par-dessus le torse (vue de face / de profil)
  const APRON = {
    down: [null, null, null, '.....QQQQQQ.....', '.....QQQQQq.....', '.....QQQQQq.....', '.....QQQQQq.....', '.....qqqqqq.....'],
    side: [null, null, null, '.........Q......', '.........QQ.....', '.........QQ.....', '.........Qq.....', '.........qq.....'],
  };

  // 6 lignes de jambes
  const LEGS = {
    down: [
      ['.....PPPPPP.....', '.....PPpPPp.....', '.....PPpPPp.....', '.....PPpPPp.....', '.....BBbBBb.....', '.....bbbbbb.....'],
      ['.....PPPPPP.....', '.....PPpPPp.....', '.....PPpPPp.....', '.....PPpBBb.....', '.....BBbbbb.....', '.....bbb........'],
      ['.....PPPPPP.....', '.....PPpPPp.....', '.....PPpPPp.....', '.....BBbPPp.....', '.....bbbBBb.....', '........bbb.....'],
    ],
    side: [
      ['......PPPP......', '......PPPp......', '......PPPp......', '......PPPp......', '......BBBBb.....', '......bbbbb.....'],
      ['......PPPP......', '.....pPPPPP.....', '.....pp..PPP....', '....pp....PPP...', '....bb.....BBBb.', '....b......bbbb.'],
      ['......PPPP......', '.....PPPPpp.....', '....PPP..pp.....', '...PPP....pp....', '..BBBb.....bb....', '..bbbb......b...'],
    ],
  };
  LEGS.up = LEGS.down;

  // ------------------------------------------------------------ PERSONNAGE
  function personPalette(c) {
    const S = PX.shade;
    const scarf = c.echarpe || null;
    const beard = c.couleurBarbe || c.cheveux;
    return {
      K: c.peau, k: S(c.peau, -0.22), m: PX.mix(c.peau, '#9a3a4a', 0.45),
      H: c.cheveux, h: S(c.cheveux, -0.32), L: S(c.cheveux, 0.28),
      E: c.yeux,
      X: scarf || S(c.veste, 0.22), x: scarf ? S(scarf, -0.3) : c.veste,
      T: c.veste, t: S(c.veste, -0.3), U: S(c.veste, 0.18),
      P: c.pantalon, p: S(c.pantalon, -0.3), O: S(c.pantalon, 0.16),
      B: c.chaussures, b: S(c.chaussures, -0.35), W: c.semelles || S(c.chaussures, 0.5),
      G: c.couleurLunettes || '#2a2233', D: beard,
      F: PX.mix(c.cheveux, c.peau, 0.34),
      I: c.tshirt || S(c.veste, -0.2), i: S(c.tshirt || c.veste, -0.3),
      Z: S(c.reflets || c.veste, 0.25), C: c.ceinture || S(c.pantalon, -0.3), c: c.boucle || '#cfcdd8',
      A: c.couleurChapeau || '#2a2630', a: S(c.couleurChapeau || '#2a2630', -0.35), Y: c.ruban || '#7a2a34', V: c.fleur || '#ff9ac0',
      Q: c.tablier || '#f4efe6', q: S(c.tablier || '#f4efe6', -0.18),
      ...(c.tenue === 'blouson' && c.reflets ? { U: c.reflets } : {}),
    };
  }

  // assemble une image : dir = 'down'|'up'|'side', pose 0/1/2, raise = 0/1, blink
  // (3 lignes libres en haut pour les chapeaux)
  function composePerson(c, dir, pose, raise, blink) {
    const W = 16, Hh = 28;
    const grid = Array.from({ length: Hh }, () => Array(W).fill('.'));
    const stamp = (rows, y0) => rows.forEach((row, j) => {
      if (!row) return;
      for (let i = 0; i < row.length; i++) if (row[i] !== '.' && grid[y0 + j]) grid[y0 + j][i] = row[i];
    });
    const legs = (c.coupe === 'large' ? LEGS_LARGE : c.coupe === 'robe' ? LEGS_ROBE : LEGS)[dir][pose];
    stamp(legs, 22);
    if (raise) stamp([legs[0]], 21);
    stamp((c.tenue === 'blouson' ? TORSO_BLOUSON : TORSO)[dir][pose], 14 - raise);
    if (c.tablier && dir !== 'up') stamp(APRON[dir], 14 - raise);
    const style = HEADS[c.coiffure] ? c.coiffure : 'court';
    const head = HEADS[style][dir].map((r) => (blink ? r.replace(/E/g, 'k') : r));
    stamp(head, 4 - raise);
    const hy = 4 - raise;
    if (dir !== 'up') {
      const b = BEARDS[c.barbe];
      if (b) for (const [x, y] of b[dir]) if (grid[hy + y][x] !== '.' && grid[hy + y][x] !== 'E') grid[hy + y][x] = 'D';
      if (c.lunettes) for (const [x, y] of GLASSES[dir]) grid[hy + y][x] = 'G';
    }
    if (c.chapeau && HATS[c.chapeau]) stamp(HATS[c.chapeau], hy - 3);
    return PX.outline(PX.fromRows(grid.map((r) => r.join('')), personPalette(c)), '#1d1626');
  }

  // ------------------------------------------------------------ ISMAE (sprite détaillé, 18 × 29)
  // H/h/L cheveux, F dégradé, r sourcils, K/k peau, E/e yeux (pupille / iris bleu), m bouche, D barbe
  // T/t/U blouson cuir, Z fermeture, I t-shirt, C ceinture, c boucle, P/p/O pantalon, B baskets, W semelles
  const ISMAE = {
    down: {
      tete: ['.......hHHh.......', '.....hHLHHLHh.....', '....hHLHHHHLHHh...', '....HHHHHLHHHHH...', '....FHhKKKKhHHF...',
        '...kFKrrKKKrrKFk..', '...kKKEeKKKEeKKk..', '....KKEEKkKEEKK...', '....kKKKKkKKKKk...', '.....DKKmmmKKD....', '......DDKKKDD.....'],
      torse: [
        ['........kkk.......', '....tTTUIIIUTTt...', '...tTTUtIIItUTTt..', '...tUTTtIiItTTUt..', '...tUTZtIIItZTUt..', '...tTTZtIiItZTTt..', '...kTTTtIIItTTTk..', '....TCCCCcCCCCT...', '.....PPPPPPPPP....'],
        ['........kkk.......', '....tTTUIIIUTTt...', '...tTTUtIIItUTTt..', '...tUTTtIiItTTUt..', '...tUTZtIIItZTUk..', '...tTTZtIiItZTT...', '...kTTTtIIItTTT...', '....TCCCCcCCCCT...', '.....PPPPPPPPP....'],
        ['........kkk.......', '....tTTUIIIUTTt...', '...tTTUtIIItUTTt..', '...kUTTtIiItTTUt..', '....UTZtIIItZTUt..', '....TTZtIiItZTTt..', '....TTTtIIItTTTk..', '....TCCCCcCCCCT...', '.....PPPPPPPPP....'],
      ],
      jambes: [
        ['....PPOPPpPPOPP...', '....PPOPPpPPOPP...', '....PPOPP.PPOPP...', '....POPPp.PPOPp...', '....PPOPp.POPPp...', '....pPOPp.pPOPp...', '....pPPPp.pPPPp...', '....BBBBB.BBBBB...', '....WWWWW.WWWWW...'],
        ['....PPOPPpPPOPP...', '....PPOPPpPPOPP...', '....PPOPP.PPOPP...', '....POPPp.PPOPp...', '....PPOPp.POPPp...', '....pPOPp.BBBBB...', '....pPPPp.WWWWW...', '....BBBBB.........', '....WWWWW.........'],
        ['....PPOPPpPPOPP...', '....PPOPPpPPOPP...', '....PPOPP.PPOPP...', '....POPPp.PPOPp...', '....PPOPp.POPPp...', '....BBBBB.pPOPp...', '....WWWWW.pPPPp...', '..........BBBBB...', '..........WWWWW...'],
      ],
    },
    up: {
      tete: ['.......hHHh.......', '.....hHLHHLHh.....', '....hHLHHHHLHHh...', '....HHHHHLHHHHH...', '...kHHHHHHHHHHHk..',
        '...kFHHHHHHHHHFk..', '....FFHHHHHHHFF...', '....FFFhhhhhFFF...', '....kFFFFFFFFFk...', '.....kkFFFFFkk....', '......kKKKKKk.....'],
      torse: [
        ['........kkk.......', '....tTTUUUUUTTt...', '...tTTTTTTTTTTTt..', '...tUTTTTtTTTTUt..', '...tUTTTTtTTTTUt..', '...tTTTTTtTTTTTt..', '...kTTTTTtTTTTTk..', '....TCCCCCCCCCT...', '.....PPPPPPPPP....'],
        ['........kkk.......', '....tTTUUUUUTTt...', '...tTTTTTTTTTTTt..', '...tUTTTTtTTTTUt..', '...tUTTTTtTTTTUk..', '...tTTTTTtTTTTT...', '...kTTTTTtTTTTT...', '....TCCCCCCCCCT...', '.....PPPPPPPPP....'],
        ['........kkk.......', '....tTTUUUUUTTt...', '...tTTTTTTTTTTTt..', '...kUTTTTtTTTTUt..', '....UTTTTtTTTTUt..', '....TTTTTtTTTTTt..', '....TTTTTtTTTTTk..', '....TCCCCCCCCCT...', '.....PPPPPPPPP....'],
      ],
    },
    side: {
      tete: ['......hHHHh.......', '.....hHLHHLHh.....', '....hHHHLHHHHHh...', '....HHHHHHHHHHHh..', '....FHHHHHHhKKK...',
        '....FFFFkKKKrrK...', '....FFFkkKKKEeK...', '....FFFFkKKKEEKK..', '....hFFFKKKKKKk...', '.....DDKKKKKmK....', '......DDDDDD......'],
      torse: [
        ['.........kk.......', '......tTTUIIT.....', '......tTTUTIIT....', '......tTUUTIIT....', '......tTUTTIZT....', '......tTUTTIZT....', '......tTkTTIZT....', '......TCCCCCcT....', '.......PPPPPP.....'],
        ['.........kk.......', '......tTTUIIT.....', '......tTTTUIIT....', '......tTTTUUIT....', '......tTTTTUZT....', '......tTTTTTUk....', '......tTTTTIZT....', '......TCCCCCcT....', '.......PPPPPP.....'],
        ['.........kk.......', '......tTTUIIT.....', '......tUTTTIIT....', '.....UUTTTTIIT....', '.....kUTTTTIZT....', '......tTTTTIZT....', '......tTTTTIZT....', '......TCCCCCcT....', '.......PPPPPP.....'],
      ],
      jambes: [
        ['......PPPPPPp.....', '......PPOPPPp.....', '......POPPPPp.....', '......PPOPPPp.....', '.....PPOPPPPp.....', '.....pPOPPPPp.....', '.....pPPPPPPp.....', '.....BBBBBBBBB....', '.....WWWWWWWWWW...'],
        ['......PPPPPPp.....', '......pPPOPPp.....', '.....ppP.POPPp....', '.....pp...POPPp...', '....ppp....POPp...', '....pp.....pPPPp..', '....pp.....pPPPp..', '...BBBB....BBBBBB.', '...WWWW....WWWWWW.'],
        ['......PPPPPPp.....', '......PPOPPpp.....', '.....POP.ppPp.....', '.....PO...ppPp....', '....POP....pPpp...', '....PO.....pPPpp..', '....PO.....pppp...', '...BBBB....BBBBBB.', '...WWWW....WWWWWW.'],
      ],
    },
  };
  ISMAE.up.jambes = ISMAE.down.jambes;

  function composeIsmae(c, dir, pose, raise, blink) {
    const Wd = 18, Hh = 31;
    const grid = Array.from({ length: Hh }, () => Array(Wd).fill('.'));
    const stamp = (rows, y0) => rows.forEach((row, j) => {
      for (let i = 0; i < row.length && i < Wd; i++) if (row[i] !== '.' && grid[y0 + j]) grid[y0 + j][i] = row[i];
    });
    const T = ISMAE[dir];
    stamp(T.jambes[pose], 22);
    if (raise) stamp([T.jambes[pose][0]], 21);
    stamp(T.torse[pose], 13 - raise);
    stamp(T.tete.map((r) => (blink ? r.replace(/[Ee]/g, 'k') : r)), 2 - raise);
    const pal = Object.assign(personPalette(c), {
      E: '#1a1322', e: c.yeux, r: PX.shade(c.cheveux, -0.42), D: c.couleurBarbe || c.cheveux,
    });
    return PX.outline(PX.fromRows(grid.map((r) => r.join('')), pal), '#1d1626');
  }

  // Renvoie { down, up, left, right } -> { idle, blink, walk:[4] }
  function person(c) {
    if (c.modele === 'detaille') {
      const out = {};
      for (const dir of ['down', 'up', 'side']) {
        const walk = [composeIsmae(c, dir, 1, 0), composeIsmae(c, dir, 0, 1), composeIsmae(c, dir, 2, 0), composeIsmae(c, dir, 0, 1)];
        const set = { idle: composeIsmae(c, dir, 0, 1), blink: composeIsmae(c, dir, 0, 1, true), walk };
        if (dir === 'side') { out.right = set; out.left = { idle: PX.flipX(set.idle), blink: PX.flipX(set.blink), walk: walk.map(PX.flipX) }; }
        else out[dir] = set;
      }
      return out;
    }
    const out = {};
    for (const dir of ['down', 'up', 'side']) {
      const walk = [composePerson(c, dir, 1, 0), composePerson(c, dir, 0, 1), composePerson(c, dir, 2, 0), composePerson(c, dir, 0, 1)];
      const set = { idle: composePerson(c, dir, 0, 1), blink: composePerson(c, dir, 0, 1, true), walk };
      if (dir === 'side') {
        out.right = set;
        out.left = { idle: PX.flipX(set.idle), blink: PX.flipX(set.blink), walk: walk.map(PX.flipX) };
      } else out[dir] = set;
    }
    return out;
  }

  // ------------------------------------------------------------ CHATS
  // B pelage  b ombre  L reflet  E yeux  n nez  I oreille  T queue  F pattes
  const CAT = {
    side: [
      ['..............B...B.', '.TT...........BB.BB.', 'T.............BBBBBB', 'T.............BBBEBB', 'T....LLLLLLLLLBBBBBn',
        '.T..LBBBBBBBBBBBBBB.', '..TBBBBBBBBBBBBBBB..', '....BBBBBBBBBBBBB...', '....BbbbBBBBBbbbB...',
        '....BB.F....BB.F....', '....F..F....F..F....', '...FF.FF...FF.FF....'],
      ['..............B...B.', '..............BB.BB.', '.TT...........BBBBBB', 'T.............BBBEBB', 'T....LLLLLLLLLBBBBBn',
        'T...LBBBBBBBBBBBBBB.', '.TTBBBBBBBBBBBBBBB..', '....BBBBBBBBBBBBB...', '....BbbbBBBBBbbbB...',
        '...BB..BF..BB..BF...', '..FF....F.F.....F...', '..F.....FF......FF..'],
      ['..............B...B.', '.TT...........BB.BB.', 'T.............BBBBBB', 'T.............BBBEBB', 'T....LLLLLLLLLBBBBBn',
        '.T..LBBBBBBBBBBBBBB.', '..TBBBBBBBBBBBBBBB..', '....BBBBBBBBBBBBB...', '....BbbbBBBBBbbbB...',
        '.....BBF.....BBF....', '.....F.F.....F.F....', '.....FFF.....FFF....'],
      ['..............B...B.', '..............BB.BB.', '.TT...........BBBBBB', 'T.............BBBEBB', 'T....LLLLLLLLLBBBBBn',
        'T...LBBBBBBBBBBBBBB.', '.TTBBBBBBBBBBBBBBB..', '....BBBBBBBBBBBBB...', '....BbbbBBBBBbbbB...',
        '....BB.BF..BB.BF....', '...F....F.F....F....', '..FF....FF.....FF...'],
    ],
    down: [
      ['...B......B...', '...BB....BB...', '...BIBBBBIB...', '..BLLBBBBLLB..', '..BBEBBBBEBB..', '..BBEBBBBEBB..',
        '..BBBBnnBBBB..', '...BBBBBBBB.T.', '....BBBBBB..T.', '...BBBBBBBB.T.', '...BbBBBBbB.T.', '...F.F..F.FTT.', '...F....F.F...'],
      ['...B......B...', '...BB....BB...', '...BIBBBBIB...', '..BLLBBBBLLB..', '..BBEBBBBEBB..', '..BBEBBBBEBB..',
        '..BBBBnnBBBB..', '...BBBBBBBB..T', '....BBBBBB..T.', '...BBBBBBBB.T.', '...BbBBBBbB.T.', '...F.F..F.FT..', '.....F.F......'],
    ],
    up: [
      ['...B......B..T.', '...BB....BB..T.', '...BBBBBBBB..T.', '..BBBBBBBBBB.T.', '..BBBBBBBBBB.T.', '...BBBBBBBB.T..',
        '..BLLLLLLLLT...', '.BBBBBBBBBBT...', '.BBBBBBBBBBB...', '.BBBBBBBBBBB...', '..BbBBBBBbB....', '..F.F...F.F....', '..F.......F....'],
      ['...B......B.T..', '...BB....BB.T..', '...BBBBBBBB..T.', '..BBBBBBBBBB.T.', '..BBBBBBBBBB.T.', '...BBBBBBBB.T..',
        '..BLLLLLLLLT...', '.BBBBBBBBBBT...', '.BBBBBBBBBBB...', '.BBBBBBBBBBB...', '..BbBBBBBbB....', '..F.F...F.F....', '....F...F......'],
    ],
    sit: [
      ['...B......B...', '...BB....BB...', '...BIBBBBIB...', '..BLLBBBBLLB..', '..BBEBBBBEBB..', '..BBEBBBBEBB..',
        '..BBBBnnBBBB..', '...BBBBBBBB...', '....BLLLBB....', '...BBBBBBBBB..', '...BBBBBBBBB..', '..BBBbBBbBBBTT', '..BFFbBBbFFBBT', '..bbbbbbbbbbb.'],
      ['...B......B...', '...BB....BB...', '...BIBBBBIB...', '..BLLBBBBLLB..', '..BBEBBBBEBB..', '..BBEBBBBEBB..',
        '..BBBBnnBBBB..', '...BBBBBBBB...', '....BLLLBB....', '...BBBBBBBBB.T', '...BBBBBBBBBT.', '..BBBbBBbBBBT.', '..BFFbBBbFFBB.', '..bbbbbbbbbbb.'],
    ],
    sitSide: [
      ['........B..B.', '........BBBB.', '.......BBBBBB', '.......BBBEBB', '.......BBBBBn', '......LBBBBB.', '.....LBBBBBB.',
        '.....BBBBBBB.', '....BBBBBBBB.', '....BBBBBBBB.', 'TT..BBBbBBFB.', '.TTTBBBbBFFF.'],
      ['........B..B.', '........BBBB.', '.......BBBBBB', '.......BBBEBB', '.......BBBBBn', '......LBBBBB.', '.....LBBBBBB.',
        '.....BBBBBBB.', '....BBBBBBBB.', 'T...BBBBBBBB.', '.T..BBBbBBFB.', '..TTBBBbBFFF.'],
    ],
    sleep: [
      ['..............', '....B..B......', '....BBBB......', '...BBbbBBBBB..', '..BBBBBBBLLLB.', '..BBBBBBBBBBBB',
        '.TBBBBBBBBBBBB', '.TTbbbbbbbbbb.'],
      ['..............', '....B..B......', '....BBBB......', '...BBbbBBBBB..', '..BBBBBBBLLLB.', '..BBBBBBBBBBBB',
        'TTBBBBBBBBBBBB', '.TbbbbbbbbbbB.'],
    ],
  };

  const CAT_COLORS = {
    georges: () => {
      const g = CONFIG.georges;
      return { B: g.pelage, b: PX.shade(g.pelage, -0.4), L: g.reflet, E: g.yeux, n: '#3a2a3e', I: '#3e3550', T: g.pelage, F: g.pelage };
    },
    blanc: () => ({ B: '#f3eef3', b: '#cfc4d8', L: '#ffffff', E: '#5f9fe6', n: '#e58a9c', I: '#f2b3c3', T: '#f3eef3', F: '#f3eef3' }),
    roux: () => ({ B: '#e2893a', b: '#b25f28', L: '#f6b464', E: '#7ccf4a', n: '#b84e58', I: '#f0a383', T: '#d47830', F: '#f3d7b0', S: '#b8622a' }),
    gris: () => ({ B: '#9c9cad', b: '#707086', L: '#c6c6d8', E: '#ecc23e', n: '#d27a8a', I: '#e2a2b2', T: '#8a8a9c', F: '#b8b8c8' }),
    tigre: () => ({ B: '#a7804f', b: '#704f33', L: '#cfa874', E: '#a9d146', n: '#9a4a4a', I: '#dca08a', T: '#7b5636', F: '#d8c09a', S: '#5d412a' }),
    siamois: () => ({ B: '#efe3c9', b: '#c9b48f', L: '#fff6e2', E: '#55b2f5', n: '#4a3428', I: '#5c4232', T: '#4a3428', F: '#4a3428' }),
    // Duchesse : chatte blanche aux yeux bleus, collier rose
    duchesse: () => ({ B: '#f6f2f6', b: '#d2c8dc', L: '#ffffff', E: '#4f8fe0', n: '#ef8fa6', I: '#f6bccb', T: '#f6f2f6', F: '#f6f2f6', C: '#f07aa0' }),
    matou: () => ({ B: '#8c8174', b: '#5e554c', L: '#b4a898', E: '#e8d050', n: '#7a4a4a', I: '#c09a8a', T: '#7a6f62', F: '#a89c8c', S: '#6a6054' }),
    smoking: () => ({ B: '#2c2b36', b: '#16151c', L: '#f2f0f6', E: '#9fd85a', n: '#e88a9a', I: '#4a4458', T: '#2c2b36', F: '#f2f0f6' }),
  };

  // ------------------------------------------------------------ CHATONS (Marie, Toulouse, Berlioz)
  // R = nœud au cou, r = nœud sur la tête (Marie)
  const CHATON = {
    corps: ['.........BrrB.', '.........BBBB.', '.T......BBBBBB', 'T.......BBBEBB', 'T..LLLLLRBBBBn', '.TBBBBBBRBBBB.', '..BBBBBBBBBB..', '..BbbBBBBbb...'],
    pattes: [['..B.B...B.B...', '..F.F...F.F...'], ['.B...B.B...B..', '.F...F.F...F..'], ['...BB....BB...', '...FF....FF...'], ['.B...B..B..B..', 'F....F.F...F..']],
    assis: [
      ['..B.r..r.B..', '..BBrrrrBB..', '..BIBBBBIB..', '.BLLBBBBLLB.', '.BBEBBBBEBB.', '.BBEBBBBEBB.', '.BBBBnnBBBB.', '..BBRRRRBB..', '...BBBBBB.T.', '..BBBBBBBBT.', '..FFbBBbFF..'],
      ['..B.r..r.B..', '..BBrrrrBB..', '..BIBBBBIB..', '.BLLBBBBLLB.', '.BBEBBBBEBB.', '.BBEBBBBEBB.', '.BBBBnnBBBB.', '..BBRRRRBB..', '...BBBBBB..T', '..BBBBBBBBT.', '..FFbBBbFF..'],
    ],
    rire: [
      ['..B.r..r.B..', '..BBrrrrBB..', '..BIBBBBIB..', '.BLLBBBBLLB.', '.BbbBBBBbbB.', '.BBBBBBBBBB.', '.BBBmmmmBBB.', '..BBRRRRBB..', '...BBBBBB.T.', '..BBBBBBBBT.', '..FFbBBbFF..'],
      ['............', '..B.r..r.B..', '..BBrrrrBB..', '..BIBBBBIB..', '.BLLBBBBLLB.', '.BbbBBBBbbB.', '.BBBmmmmBBB.', '..BBRRRRBB..', '...BBBBBB..T', '..BBBBBBBBT.', '..FFbBBbFF..'],
    ],
    dosRond: [
      ['......BBB.....', '.T...BBBBB.B.B', '.TT.BBBBBBBBBB', '..TBBBBBBBRBEB', '...BBB...RBBBn', '...BB.....BB..', '...BB.....BB..', '..FF.....FF...'],
      ['.....B.B.B....', '.T...BBBBB.B.B', '.TTLBBBBBBBBBB', '..TBBBBBBBRBEB', '...BBB...RBBBn', '...BB.....BB..', '...BB.....BB..', '..FF.....FF...'],
    ],
  };
  const CHATON_COULEURS = {
    marie: { B: '#f8f4f8', b: '#d6cbe0', L: '#ffffff', E: '#4f8fe0', n: '#f08aa4', I: '#f8bccb', T: '#f8f4f8', F: '#f8f4f8', R: '#ff6a9c', r: '#ff6a9c', m: '#d0506a' },
    toulouse: { B: '#ee9a46', b: '#b8682c', L: '#fbc078', E: '#7fcf4a', n: '#b8505a', I: '#f4a88a', T: '#d9853a', F: '#f8dcb4', R: '#b8282e', m: '#9a3040', S: '#c97834' },
    berlioz: { B: '#4c4b5e', b: '#2a2a38', L: '#76758c', E: '#e8c84a', n: '#2a2232', I: '#7a6a80', T: '#4c4b5e', F: '#6a6980', R: '#4a6ae0', m: '#c0506a' },
  };
  function chaton(nom) {
    const pal = CHATON_COULEURS[nom];
    const mk = (rows) => catSprite(rows, pal);
    const walkR = CHATON.pattes.map((p) => mk(CHATON.corps.concat(p)));
    const dos = CHATON.dosRond.map(mk);
    const blink = Object.assign({}, pal, { E: pal.b });
    return {
      walkR, walkL: walkR.map(PX.flipX),
      sit: CHATON.assis.map(mk), sitBlink: catSprite(CHATON.assis[0], blink),
      rire: CHATON.rire.map(mk),
      dosRondR: dos, dosRondL: dos.map(PX.flipX),
    };
  }

  // ------------------------------------------------------------ POSES COMIQUES DE GEORGES
  const GEORGES_POSES = {
    dosRond: ['.T......LLLL........', '.T....LBBBBBBL......', '.T...BBBBBBBBBB.....', '.TT.BBBBBBBBBBBB.B.B', '..TBBBBBBBBBBBBBBBBB',
      '...BBBB......BBBBBEB', '...BBB........BBBBBn', '...BB..........BBB..', '...BB..........BB...', '...BB..........BB...', '..FFF.........FFF...'],
    herisse: ['.......B.B.B.B......', '.T....LBLBLBLL......', '.T...BBBBBBBBBB.....', 'TT..BBBBBBBBBBBB.B.B', '.TTBBBBBBBBBBBBBBBBB',
      '...BBBB......BBBBBEB', '..BBBB........BBBBBn', '..BB............BBB.', '.BB..............BB.', '.BB...............BB', 'FFF...............FF'],
    chute: ['...F.F......F.F.....', '...B.B......B.B.....', '..BBBBBBBBBBBBBBBB..', 'TBBBBBBBBBBBBBBBBBB.', 'T.BLLLLLLLLLLBBBBEB.',
      '...BBBBBBBBBBBBBBBB.', '...............B.B..'],
  };
  function georgesPoses() {
    const pal = CAT_COLORS.georges();
    const o = {};
    for (const k in GEORGES_POSES) { const r = catSprite(GEORGES_POSES[k], pal); o[k + 'R'] = r; o[k + 'L'] = PX.flipX(r); }
    return o;
  }

  // ------------------------------------------------------------ CHATS MUSICIENS
  // Un chat assis (vu de face) + un instrument dessiné par-dessus, 4 images d'animation.
  const MUSICIENS = {
    trompette: { chat: 'matou', chapeau: '#5a3a2a' },
    piano: { chat: 'siamois' },
    contrebasse: { chat: 'roux', foulard: '#c9483b' },
    batterie: { chat: 'gris' },
    clarinette: { chat: 'smoking', noeud: '#c9483b' },
  };
  function musicien(type) {
    const def = MUSICIENS[type];
    const pal = CAT_COLORS[def.chat]();
    const OR = '#e8b54a', ORc = '#fff0a0', ORs = '#a8741e', BOIS = '#7a3e22', BOISc = '#a85a30', NOIR = '#1d1626';
    const frames = [];
    for (let f = 0; f < 4; f++) {
      const c = PX.canvas(32, 32), P = PX.painter(c);
      const bob = f % 2;
      const cat = catSprite(CAT.sit[f % 2], pal);
      const cx = 8, cy = 14 + bob;
      const paw = (x, y) => { P.rect(x - 1, y - 1, 4, 4, NOIR); P.rect(x, y, 2, 2, pal.F === pal.B ? pal.L : pal.F); };
      if (type === 'piano') {
        P.rect(0, 13, 11, 18, NOIR); P.rect(1, 14, 9, 16, '#4a2a30'); P.rect(1, 14, 9, 2, '#6a3e44'); P.vline(9, 14, 16, '#2e1a20');
        P.rect(3, 18, 6, 4, '#2e1a20'); P.px(4, 19, OR);
        P.draw(cat, cx + 4, cy);
        P.rect(8, 21, 10, 3, NOIR); P.rect(9, 21, 8, 2, '#f4efe6');
        for (let k = 10; k < 17; k += 2) P.px(k, 21, NOIR);
        paw(10 + (f % 2) * 2, 20 - (f === 1 ? 1 : 0)); paw(14 - (f % 2) * 2, 20 - (f === 3 ? 1 : 0));
      } else if (type === 'contrebasse') {
        P.draw(cat, cx + 5, cy);
        P.vline(5, 1, 14, NOIR); P.vline(6, 1, 14, NOIR); P.px(5, 1, BOISc); P.rect(4, 0, 3, 3, NOIR); P.px(5, 1, BOIS);
        P.ellipse(5, 18, 5, 4, NOIR); P.ellipse(5, 25, 6, 5, NOIR);
        P.ellipse(5, 18, 4, 3, BOIS); P.ellipse(5, 25, 5, 4, BOIS); P.ellipse(4, 24, 3, 2, BOISc);
        P.vline(5, 3, 26, '#e8d8b0'); P.px(3, 21, NOIR); P.px(7, 21, NOIR);
        P.rect(4, 29, 3, 2, NOIR);
        paw(7, 7); paw(9 + (f % 2), 21 + (f % 2));
        if (f % 2) P.vline(6, 15, 10, '#fff4d0');
      } else if (type === 'batterie') {
        P.draw(cat, cx + 1, cy - 3);
        P.vline(25, 10, 18, NOIR); P.rect(21, 9, 9, 3, NOIR); P.rect(22, 9, 7, 2, f % 2 ? ORc : OR);
        P.ellipse(16, 25, 6, 5, NOIR); P.ellipse(16, 25, 5, 4, '#efe2c8'); P.ellipse(16, 25, 2, 2, '#c9483b');
        P.rect(2, 20, 8, 6, NOIR); P.rect(3, 21, 6, 4, '#b8423a'); P.rect(3, 21, 6, 1, '#efe2c8');
        const hit = f % 2;
        Objets.line(P, 9, 18, hit ? 5 : 7, hit ? 21 : 15, '#e8d0a0'); Objets.line(P, 20, 18, hit ? 23 : 25, hit ? 13 : 9, '#e8d0a0');
        paw(8, 17); paw(18, 17);
      } else if (type === 'clarinette') {
        P.draw(cat, cx + 2, cy);
        const tilt = f % 2;
        Objets.line(P, 18, 22, 23 + tilt, 29, NOIR, 3); Objets.line(P, 18, 22, 23 + tilt, 29, '#2a2632', 1);
        P.rect(21 + tilt, 28, 5, 3, NOIR); P.rect(22 + tilt, 28, 3, 2, '#3a3646');
        P.px(20, 24, '#d8d6e0'); P.px(21, 26, '#d8d6e0'); P.px(22 + tilt, 27, '#d8d6e0');
        paw(18, 23); paw(21 + tilt, 26);
        if (def.noeud) { P.rect(15, 25, 2, 2, def.noeud); P.rect(18, 25, 2, 2, def.noeud); P.px(17, 25, def.noeud); }
      } else {
        // trompette levée vers le ciel, qui monte et descend
        P.draw(cat, cx, cy);
        const up = f === 1 || f === 2 ? 1 : 0;
        const y0 = cy + 8, x0 = cx + 9;
        Objets.line(P, x0, y0, x0 + 8, y0 - 3 - up * 2, NOIR, 3); Objets.line(P, x0, y0, x0 + 8, y0 - 3 - up * 2, OR, 1);
        const bx = x0 + 8, by = y0 - 6 - up * 2;
        P.rect(bx, by, 4, 6, NOIR); P.rect(bx + 1, by + 1, 3, 4, OR); P.px(bx + 2, by + 1, ORc); P.vline(bx + 3, by + 1, 4, ORs);
        paw(x0 + 2, y0 - 2); paw(x0 + 5, y0 - 3 - up);
        P.rect(cx + 4, cy - 3, 8, 2, NOIR); P.rect(cx + 5, cy - 5, 6, 3, NOIR); P.rect(cx + 6, cy - 4, 4, 2, def.chapeau); P.rect(cx + 5, cy - 2, 6, 1, def.chapeau);
      }
      if (def.foulard) P.rect(cx + 9, cy + 8, 6, 2, def.foulard);
      frames.push(c);
    }
    return frames;
  }

  function catSprite(rows, pal) {
    // les chats tigrés reçoivent des rayures en post-traitement
    if (pal.S) rows = rows.map((r, y) => r.replace(/B/g, (m, x) => (y > 2 && x % 3 === 0 ? 'S' : 'B')));
    return PX.outline(PX.fromRows(rows, pal), 'auto');
  }

  // variante avec collier (C) pour Duchesse
  function catCollier(pal) {
    const avec = (rows, pts) => rows.map((r, y) => {
      const a = r.split('');
      for (const [x, yy] of pts) if (yy === y && a[x] && a[x] !== '.') a[x] = 'C';
      return a.join('');
    });
    const mk = (rows, p = pal) => catSprite(rows, p);
    const cou = [[5, 7], [6, 7], [7, 7], [8, 7]], couCote = [[13, 5], [14, 5], [13, 6]], couAssisCote = [[7, 5], [8, 5], [9, 5]];
    const walkR = CAT.side.map((r) => mk(avec(r, couCote)));
    const sitR = CAT.sitSide.map((r) => mk(avec(r, couAssisCote)));
    const sit = CAT.sit.map((r) => avec(r, cou));
    return {
      walkR, walkL: walkR.map(PX.flipX),
      down: CAT.down.map((r) => mk(avec(r, cou))), up: CAT.up.map((r) => mk(r)),
      sit: sit.map((r) => mk(r)), sitBlink: mk(sit[0], Object.assign({}, pal, { E: pal.b })),
      sitR, sitL: sitR.map(PX.flipX),
      sleep: CAT.sleep.map((r) => mk(r)),
    };
  }

  // Renvoie un jeu d'images pour un chat : walkR/walkL[4], down[2], up[2], sit[2], sitR/sitL[2], sleep[2]
  function cat(colorName) {
    const pal = CAT_COLORS[colorName]();
    if (pal.C) return catCollier(pal);
    const blinkPal = Object.assign({}, pal, { E: pal.b });
    const mk = (rows, p = pal) => catSprite(rows, p);
    const walkR = CAT.side.map((r) => mk(r));
    const sitR = CAT.sitSide.map((r) => mk(r));
    return {
      walkR, walkL: walkR.map(PX.flipX),
      down: CAT.down.map((r) => mk(r)), up: CAT.up.map((r) => mk(r)),
      sit: CAT.sit.map((r) => mk(r)), sitBlink: mk(CAT.sit[0], blinkPal),
      sitR, sitL: sitR.map(PX.flipX),
      sleep: CAT.sleep.map((r) => mk(r)),
    };
  }

  // ------------------------------------------------------------ PIGEONS
  const PIGEON = {
    stand: ['.....GG.', '....GGEk', '....NN..', '.BBBBNN.', 'WBBBBBB.', '..bbbb..', '...o.o..'],
    peck: ['........', '........', '.BBBBN..', 'WBBBBNG.', '..bbbNGE', '...o.oGk', '........'],
    fly1: ['.LL.....', '..LL.GG.', '...LGGEk', '.BBBBNN.', 'WBBBBBB.', '..bbbb..', '........'],
    fly2: ['........', '.....GG.', '....GGEk', '.BBBBNN.', 'WBBLLBB.', '..bLLLb.', '...LL...'],
  };
  function pigeon() {
    const pal = { G: '#8d93ab', E: '#e8a33a', k: '#3a2e3a', N: '#5f9a86', B: '#a6acc2', W: '#6e7290', b: '#7d829c', o: '#e07a5f', L: '#c4c9da' };
    const o = {};
    for (const k in PIGEON) {
      const r = PX.outline(PX.fromRows(PIGEON[k], pal), 'auto');
      o[k] = r;
      o[k + 'L'] = PX.flipX(r);
    }
    return o;
  }

  return { person, cat, pigeon, chaton, georgesPoses, musicien, MUSICIENS };
})();
