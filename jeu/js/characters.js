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
      ...(c.tenue === 'blouson' && c.reflets ? { U: c.reflets } : {}),
    };
  }

  // assemble une image : dir = 'down'|'up'|'side', pose 0/1/2, raise = 0/1, blink
  function composePerson(c, dir, pose, raise, blink) {
    const W = 16, Hh = 25;
    const grid = Array.from({ length: Hh }, () => Array(W).fill('.'));
    const stamp = (rows, y0) => rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row[i] !== '.' && grid[y0 + j]) grid[y0 + j][i] = row[i];
    });
    const legs = (c.coupe === 'large' ? LEGS_LARGE : LEGS)[dir][pose];
    stamp(legs, 19);
    if (raise) stamp([legs[0]], 18);
    stamp((c.tenue === 'blouson' ? TORSO_BLOUSON : TORSO)[dir][pose], 11 - raise);
    const style = HEADS[c.coiffure] ? c.coiffure : 'court';
    const head = HEADS[style][dir].map((r) => (blink ? r.replace(/E/g, 'k') : r));
    stamp(head, 1 - raise);
    const hy = 1 - raise;
    if (dir !== 'up') {
      const b = BEARDS[c.barbe];
      if (b) for (const [x, y] of b[dir]) if (grid[hy + y][x] !== '.' && grid[hy + y][x] !== 'E') grid[hy + y][x] = 'D';
      if (c.lunettes) for (const [x, y] of GLASSES[dir]) grid[hy + y][x] = 'G';
    }
    return PX.outline(PX.fromRows(grid.map((r) => r.join('')), personPalette(c)), '#1d1626');
  }

  // Renvoie { down, up, left, right } -> { idle, blink, walk:[4] }
  function person(c) {
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
  };

  function catSprite(rows, pal) {
    // les chats tigrés reçoivent des rayures en post-traitement
    if (pal.S) rows = rows.map((r, y) => r.replace(/B/g, (m, x) => (y > 2 && x % 3 === 0 ? 'S' : 'B')));
    return PX.outline(PX.fromRows(rows, pal), 'auto');
  }

  // Renvoie un jeu d'images pour un chat : walkR/walkL[4], down[2], up[2], sit[2], sitR/sitL[2], sleep[2]
  function cat(colorName) {
    const pal = CAT_COLORS[colorName]();
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

  return { person, cat, pigeon };
})();
