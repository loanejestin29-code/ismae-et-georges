// =====================================================================
//  betes.js — les animaux de la forêt de Sherwood (épreuve 2).
//
//  Les personnages qui marchent (le roi Jean, ses gardes rhinocéros, Robin des Bois,
//  le shérif, Petit Jean, Frère Tuck, Marianne) sont dessinés comme Ismae : même corps,
//  même taille, avec une tête d'animal (grilles de lettres ci-dessous, mêmes lettres
//  que dans characters.js : K/k pelage, H/h crinière ou oreilles, D museau, G nez ou corne,
//  A/a chapeau, couronne ou casque, Y/V plume ou bijoux, E yeux, e larmes).
//  Les petits figurants (lapins, poule, tortue, coq, serpent) ont leur propre grille.
// =====================================================================
'use strict';

const Betes = (() => {
  const S = Sprites.ISMAE_STYLE;
  // veste fermée (tunique, robe) : le t-shirt devient du tissu
  const ferme = (rows) => rows.map((r) => (r ? r.replace(/I/g, 'T').replace(/i/g, 't') : r));
  // remplace quelques pixels d'une grille : pts = [[x, y], …]
  function marquer(rows, pts, ch, seulement) {
    const g = rows.map((r) => r.split(''));
    for (const [x, y] of pts) if (g[y] && g[y][x] !== undefined && g[y][x] !== '.' && (!seulement || seulement.includes(g[y][x]))) g[y][x] = ch;
    return g.map((r) => r.join(''));
  }
  const remplacer = (rows, i, row) => rows.map((r, k) => (k === i ? row : r));

  // ------------------------------------------------------------ jambes
  // longue robe jusqu'aux pieds (roi Jean, Frère Tuck, Marianne)
  const ROBE = {
    down: [
      ['.....pPPPPp.....', '....pPOPPPPp....', '....pPOPPPPp....', '...pPOPPPPPPp...', '...pPOPPPPPPp...', '..pPOPPPPPPPPp..', '..pPPPPPPPPPPp..', '...BBB....BBB...'],
      ['.....pPPPPp.....', '....pPOPPPPp....', '....pPOPPPPp....', '...pPOPPPPPPp...', '...pPOPPPPPPp...', '..pPOPPPPPPPPp..', '..pPPPPPPPPPPp..', '..BBB......BB...'],
      ['.....pPPPPp.....', '....pPOPPPPp....', '....pPOPPPPp....', '...pPOPPPPPPp...', '...pPOPPPPPPp...', '..pPOPPPPPPPPp..', '..pPPPPPPPPPPp..', '...BB......BBB..'],
    ],
    side: [
      ['......PPPPP.....', '.....pPPOPPp....', '.....pPPOPPp....', '....pPPPOPPPp...', '....pPPPOPPPp...', '...pPPPPOPPPPp..', '...pPPPPPPPPPp..', '....BBB..BBBB...'],
      ['......PPPPP.....', '.....pPPOPPp....', '.....pPPOPPp....', '....pPPPOPPPp...', '....pPPPOPPPp...', '...pPPPPOPPPPp..', '...pPPPPPPPPPp..', '..BBB......BBBB.'],
      ['......PPPPP.....', '.....pPPOPPp....', '.....pPPOPPp....', '....pPPPOPPPp...', '....pPPPOPPPp...', '...pPPPPOPPPPp..', '...pPPPPPPPPPp..', '.....BBBBBB.....'],
    ],
  };
  ROBE.up = ROBE.down;

  // ------------------------------------------------------------ têtes (16 colonnes)
  const TETES = {
    // Robin des Bois : renard, chapeau vert pointu et plume rouge
    renard: {
      down: ['......aAAa....Y.', '..hh.aAAAAa.hhY.', '..hKhaAAAAahKhY.', '..KKaaaaaaaaKK..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..',
        '..KKKEKKKKEKKK..', '..KKKEKKKKEKKK..', '..DKKKKKKKKKKD..', '..DDKKKDDKKKDD..', '...DDDDDDDDDD...', '....DDDGGDDD....', '.....kDDDDk.....'],
      up: ['......aAAa....Y.', '..hh.aAAAAa.hhY.', '..hKhaAAAAahKhY.', '..KKaaaaaaaaKK..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..',
        '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..kKKKKKKKKKKk..', '...kKKKKKKKKk...', '...kkKKKKKKkk...', '.....kkKKkk.....', '......kKKk......'],
      side: ['.....aAAa..Y....', '....aAAAAaY.....', '..hhaAAAAAa.....', '..hKaaaaaaaa....', '..KKKKKKKKKK....', '..KKKKKKKKKKK...',
        '..KKKKKKKKEKK...', '..KKKKKKKKEKKK..', '..KKKKKKKDDDDDG.', '..kKKKKKDDDDDD..', '...kKKKDDDDD....', '....kkDDDDk.....', '......kKKk......'],
    },
    // Marianne : renarde, couronne de fleurs
    renarde: {
      down: ['..hh........hh..', '..hKh......hKh..', '..hKKVAVAVAKKh..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..',
        '..KKKEKKKKEKKK..', '..KKKEKKKKEKKK..', '..DKKKKKKKKKKD..', '..DDKKKDDKKKDD..', '...DDDDDDDDDD...', '....DDDGGDDD....', '.....kDmmDk.....'],
      up: ['..hh........hh..', '..hKh......hKh..', '..hKKVAVAVAKKh..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..',
        '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..kKKKKKKKKKKk..', '...kKKKKKKKKk...', '...kkKKKKKKkk...', '.....kkKKkk.....', '......kKKk......'],
      side: ['....hh..........', '...hKh..........', '..hKKVAVAV......', '..KKKKKKKKKK....', '..KKKKKKKKKKK...', '..KKKKKKKKKKK...',
        '..KKKKKKKKEKK...', '..KKKKKKKKEKKK..', '..KKKKKKKDDDDDG.', '..kKKKKKDDDDDD..', '...kKKKDDDDD....', '....kkDDDDk.....', '......kKKk......'],
    },
    // le roi Jean : lion maigrichon, crinière rousse, couronne bien trop grande
    lion: {
      down: ['...A...AA...A...', '...AA.AAAA.AA...', '...AAVAYYAVAA...', '..HaaaaaaaaaaH..', '.HHHKKKKKKKKHHH.', '.HHKKKKKKKKKKHH.',
        '.HHKKEKKKKEKKHH.', '.HHKKEKKKKEKKHH.', '.HHKKKDDDDKKKHH.', '.hHHKDDGGDDKHHh.', '..hHHKDDDDKHHh..', '...hHHHHHHHHh...', '....hhHHHHhh....'],
      up: ['...A...AA...A...', '...AA.AAAA.AA...', '...AAAAAAAAAA...', '..HaaaaaaaaaaH..', '.HHHHHHHHHHHHHH.', '.HHHLHHHHHHLHHH.',
        '.HHHHHHHHHHHHHH.', '.HHHHHLHHHHHHHH.', '.HHHHHHHHHHHHHH.', '.hHHHHHHHLHHHHh.', '..hHHHHHHHHHHh..', '...hHHHHHHHHh...', '....hhHHHHhh....'],
      side: ['.....A..AA..A...', '.....AA.AAA.AA..', '.....AAAAVAAAA..', '...HaaaaaaaaaaH.', '..HHHHHHKKKKKK..', '.HHHHHHKKKKKKK..',
        '.HHHHHHKKKKEKK..', '.HHHHHHKKKKEKKK.', '.HHHHHHKKKDDDDG.', '.hHHHHHKKDDDDD..', '..hHHHHHKDDDD...', '...hHHHHHkkk....', '....hhHHHh......'],
    },
    // les gardes : rhinocéros casqués
    rhino: {
      down: ['......aAAa......', '....aAAAAAAa....', '...aAAAAAAAAa...', '..aAAAAAAAAAAa..', '.kKaaaaaaaaaaKk.', '..KKKKKKKKKKKK..',
        '..KEKKKKKKKKEK..', '..KKKKKGGKKKKK..', '..KKKKKGGKKKKK..', '..KKKKGGGGKKKK..', '..kKKDDDDDDKKk..', '...kKDmDDmDKk...', '....kkKKKKkk....'],
      up: ['......aAAa......', '....aAAAAAAa....', '...aAAAAAAAAa...', '..aAAAAAAAAAAa..', '.kKaaaaaaaaaaKk.', '..KKKKKKKKKKKK..',
        '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..kKKKKKKKKKKk..', '...kKKKKKKKKk...', '....kKKKKKKk....', '....kkKKKKkk....'],
      side: ['.....aAAa.......', '...aAAAAAAa.....', '..aAAAAAAAAa....', '..aAAAAAAAAAa...', '.kaaaaaaaaaa....', '..KKKKKKKKKK..G.',
        '..KKKKKKKEKK.GG.', '..KKKKKKKKKKKGG.', '..KKKKKKKKKKKGG.', '..KKKKKKKKDDDDD.', '..kKKKKKKDDDDmD.', '...kKKKKKDDDDD..', '....kkKKKkkk....'],
    },
    // le shérif de Nottingham : loup, grand chapeau à plume
    loup: {
      down: ['......aAAAa..Y..', '.h..aAAAAAAa.Y..', '.Kh.aAAAAAAa.hK.', '.KKaaaaaaaaaaKK.', '..KKKKKKKKKKKK..', '..KKEKKKKKKEKK..',
        '..KKEKKKKKKEKK..', '..KKKKDDDDKKKK..', '..kKKDDDDDDKKk..', '...kKDDGGDDKk...', '....kDDmmDDk....', '.....kDDDDk.....', '......kKKk......'],
      up: ['......aAAAa..Y..', '.h..aAAAAAAa.Y..', '.Kh.aAAAAAAa.hK.', '.KKaaaaaaaaaaKK.', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..',
        '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..kKKKKKKKKKKk..', '...kKKKKKKKKk...', '....kKKKKKKk....', '.....kKKKKk.....', '......kKKk......'],
      side: ['.....aAAAa..Y...', '...aAAAAAAa.Y...', '..haAAAAAAa.....', '.hKaaaaaaaaa....', '..KKKKKKKKKK....', '..KKKKKKKKKKK...',
        '..KKKKKKKKEKK...', '..KKKKKKKKEKKK..', '..KKKKKKKDDDDDDG', '..kKKKKKDDDDDDm.', '...kKKKDDDDDD...', '....kkDDDDk.....', '......kKKk......'],
    },
    // Petit Jean : ours brun
    ours: {
      down: ['..hhh......hhh..', '..hLhKKKKKKhLh..', '..hhKKKKKKKKhh..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..KKKEKKKKEKKK..',
        '..KKKEKKKKEKKK..', '..KKKKDDDDKKKK..', '..kKKDDGGDDKKk..', '..kKKDDDDDDKKk..', '...kKKDmmDKKk...', '....kkKKKKkk....'],
      up: ['..hhh......hhh..', '..hhhKKKKKKhhh..', '..hhKKKKKKKKhh..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..',
        '..KKKKKKKKKKKK..', '..KKKKKKKKKKKK..', '..kKKKKKKKKKKk..', '..kKKKKKKKKKKk..', '...kKKKKKKKKk...', '....kkKKKKkk....'],
      side: ['....hhh.........', '....hLhKKKK.....', '...hhKKKKKKKK...', '..KKKKKKKKKKK...', '..KKKKKKKKKKKK..', '..KKKKKKKKEKKK..',
        '..KKKKKKKKEKKK..', '..KKKKKKKKDDDD..', '..kKKKKKKDDDDGG.', '..kKKKKKKDDDDD..', '...kKKKKKDmmk...', '....kkKKKKkk....'],
    },
    // Frère Tuck : blaireau (bande blanche, taches noires autour des yeux)
    blaireau: {
      down: ['....hhhhhhhh....', '...hKKKDDKKKh...', '..hKKKKDDKKKKh..', '..KKKKKDDKKKKK..', '..KkKKKDDKKKkK..', '..KKKEKKKKEKKK..',
        '..KKKEKKKKEKKK..', '..KKKKKDDKKKKK..', '...kKKDDDDKKk...', '....kKDGGDKk....', '.....kDmmDk.....', '......kKKk......'],
      up: ['....hhhhhhhh....', '...hKKKDDKKKh...', '..hKKKKDDKKKKh..', '..KKKKKDDKKKKK..', '..KKKKKDDKKKKK..', '..KKKKKDDKKKKK..',
        '..KKKKKKKKKKKK..', '..kKKKKKKKKKKk..', '...kKKKKKKKKk...', '....kKKKKKKk....', '.....kKKKKk.....', '......kKKk......'],
      side: ['....hhhhhhh.....', '...hKKKKDDDh....', '..hKKKKKKDDDh...', '..KKKKKKKKDDDK..', '..KKKKKKKKKKKK..', '..KKKKKKKKEKKK..',
        '..KKKKKKKKKKDDD.', '..kKKKKKKDDDDDG.', '...kKKKKDDDDD...', '....kKKKDDDk....', '.....kkKKkk.....', '......kKKk......'],
    },
  };

  // ------------------------------------------------------------ torses
  const T0 = S.down.torse, TU = S.up.torse, TS = S.side.torse;
  // baudrier en diagonale (Robin) et ceinture
  const BAUDRIER = [[5, 1], [6, 2], [7, 3], [8, 4], [9, 5], [10, 6]];
  const ceinture = (rows) => rows.map((r, y) => (y === 6 ? r.replace(/[TtZ]/g, (m, x) => (x > 4 && x < 11 ? 'C' : m)) : r));
  // col d'hermine du roi (Q blanc, J mouchetures) et bande d'hermine devant
  const hermine = (rows) => rows.map((r, y) => {
    if (y === 1) return '....QQJQQJQQ....';
    if (y === 2) return '...QJQQQQQQJQ...';
    return r.replace(/I/g, 'Q').replace(/i/g, 'J');
  });
  const TORSES = {
    tunique: { down: T0.map(ferme), up: TU.map(ferme), side: TS.map(ferme) },
    robin: { down: T0.map((r) => ceinture(marquer(ferme(r), BAUDRIER, 'C'))), up: TU.map((r) => marquer(ferme(r), BAUDRIER.map(([x, y]) => [15 - x, y]), 'C')), side: TS.map(ferme) },
    ceinture: { down: T0.map((r) => ceinture(ferme(r))), up: TU.map((r) => ceinture(ferme(r))), side: TS.map((r) => ceinture(ferme(r))) },
    roi: { down: T0.map(hermine), up: TU.map((r) => remplacer(r, 1, '....QQJQQJQQ....')), side: TS.map((rows) => rows.map((r) => r.replace(/I/g, 'Q').replace(/i/g, 'J'))) },
    veste: { down: T0, up: TU, side: TS },
  };
  // le shérif porte son étoile sur la poitrine
  TORSES.sherif = { down: TORSES.tunique.down.map((r) => marquer(r, [[5, 3], [5, 4], [4, 4], [6, 4]], 'Y')), up: TORSES.tunique.up, side: TORSES.tunique.side.map((r) => marquer(r, [[8, 3]], 'Y')) };

  const JAMBES = { pantalon: { down: S.down.jambes, up: S.down.jambes, side: S.side.jambes }, robe: ROBE };

  // modèle complet pour characters.js (composeIsmae)
  function modele(tete, torse, jambes) {
    const T = TETES[tete], tr = TORSES[torse], j = JAMBES[jambes];
    const dec = Math.max(...['down', 'up', 'side'].map((d) => T[d].length)) - 12;
    return {
      largeur: 16, hauteur: 30 + Math.max(0, dec), decalage: Math.max(0, dec),
      down: { tete: T.down, torse: tr.down, jambes: j.down },
      up: { tete: T.up, torse: tr.up, jambes: j.up || j.down },
      side: { tete: T.side, torse: tr.side, jambes: j.side },
    };
  }
  const MODELES = {
    robin: modele('renard', 'robin', 'pantalon'),
    marianne: modele('renarde', 'tunique', 'robe'),
    roi: modele('lion', 'roi', 'robe'),
    garde: modele('rhino', 'tunique', 'pantalon'),
    sherif: modele('loup', 'sherif', 'pantalon'),
    petitJean: modele('ours', 'veste', 'pantalon'),
    tuck: modele('blaireau', 'ceinture', 'robe'),
  };
  // Petit Jean : un gros ours, plus grand et plus large qu'Ismae (22 × 34), avec un petit chapeau
  // a/A chapeau, Y plume, h/L oreilles, D museau, G nez, I tee-shirt (manches courtes), T gilet, C ceinture, P pantalon
  const OURS_TORSE = ['.........kKKk.........', '....kKKTTTDDTTTKKk....', '...kKKTTTDDDDTTTKKk...', '..kKKKTTDDDDDDTTKKKk..', '..KKKTTDDDDDDDDTTKKK..',
    '.kKKKTTDDDDDDDDTTKKKk.', '.kKKTTDDDDDDDDDDTTKKk.', '.kKkTTDDDDDDDDDDTTkKk.', '..kKTTDDDDDDDDDDTTKk..', '...TTCCCCCCCCCCCCTT...', '....TPPPPPPPPPPPPT....'];
  const OURS_JAMBES = ['....pPPPPPPPPPPPPp....', '....pPPPPPPPPPPPPp....', '....pPPPPP..PPPPPp....', '....pPPPPP..PPPPPp....', '....pPPPPp..pPPPPp....',
    '....pPPPPp..pPPPPp....', '...kKKKKKK..KKKKKKk...', '...kkkkkkk..kkkkkkk...'];
  const OURS_COTE = {
    tete: ['........aAAa..........', '.......aAAAAaY........', '....hhhaaaaaaa........', '...hLLhKKKKKKKK.......', '...hLhKKKKKKKKKK......', '....KKKKKKKKKKKKK.....',
      '...KKKKKKKKKKKKKKK....', '...KKKKKKKKKKKEKKK....', '...KKKKKKKKKKKEKKKDD..', '...KKKKKKKKKKKKKDDDDG.', '...kKKKKKKKKKKKKDDDDD.', '....kKKKKKKKKKKKDmmD..',
      '.....kKKKKKKKKKKKkk...', '.......kkKKKKKKkk.....'],
    torse: ['.........kKKk.........', '.......kKKTTTTk.......', '......kKKKTTTDDD......', '.....kKKKKTTDDDDD.....', '.....KKKKKTTDDDDDD....', '....kKKKKKTTDDDDDDD...',
      '....kKKKKKTTDDDDDDD...', '....kKkKKKTTDDDDDDD...', '.....kKKKTTTDDDDDD....', '......TTCCCCCCCCCT....', '.......TPPPPPPPPT.....'],
    jambes: ['.......pPPPPPPPPp.....', '.......pPPPPPPPPp.....', '.......pPPPPPPPPp.....', '........pPPPPPPp......', '........pPPPPPPp......', '........pPPPPPPp......',
      '.......kKKKKKKKKKK....', '.......kkkkkkkkkkk....'],
  };
  // le tee-shirt : à la place du ventre, avec des manches courtes sur les épaules (lignes 1 à 3)
  const teeShirt = (rows) => rows.map((r, y) => { const t = r.replace(/D/g, 'I'); return y >= 1 && y <= 3 ? t.replace(/K/g, 'I').replace(/k/g, 'i') : t; });
  const OURS = {
    largeur: 22, hauteur: 34, decalage: 4,
    down: {
      tete: ['.........aAAa.........', '........aAAAAaY.......', '...hhh.aaaaaaaa.hhh...', '..hLLhKKKKKKKKKKhLLh..', '..hLhKKKKKKKKKKKKhLh..', '...hKKKKKKKKKKKKKKh...',
        '..KKKKKKKKKKKKKKKKKK..', '..KKKKKEKKKKKKEKKKKK..', '..KKKKKEKKKKKKEKKKKK..', '..KKKKKKKDDDDKKKKKKK..', '..kKKKKKDDGGDDKKKKKk..', '..kKKKKKDDDDDDKKKKKk..',
        '...kKKKKKDmmDKKKKKk...', '....kkKKKKKKKKKKkk....'],
      torse: [0, 1, 2].map(() => teeShirt(OURS_TORSE)), jambes: [OURS_JAMBES, OURS_JAMBES, OURS_JAMBES],
    },
    up: {
      tete: ['.........aAAa.........', '........aAAAAaY.......', '...hhh.aaaaaaaa.hhh...', '..hhhhKKKKKKKKKKhhhh..', '..hhhKKKKKKKKKKKKhhh..', '...hKKKKKKKKKKKKKKh...',
        '..KKKKKKKKKKKKKKKKKK..', '..KKKKKKKKKKKKKKKKKK..', '..KKKKKKKKKKKKKKKKKK..', '..KKKKKKKKKKKKKKKKKK..', '..kKKKKKKKKKKKKKKKKk..', '..kKKKKKKKKKKKKKKKKk..',
        '...kKKKKKKKKKKKKKKk...', '....kkKKKKKKKKKKkk....'],
      torse: [0, 1, 2].map(() => teeShirt(OURS_TORSE.map((r) => r.replace(/D/g, 'T')))), jambes: [OURS_JAMBES, OURS_JAMBES, OURS_JAMBES],
    },
    side: { tete: OURS_COTE.tete, torse: [0, 1, 2].map(() => teeShirt(OURS_COTE.torse)), jambes: [0, 1, 2].map(() => OURS_COTE.jambes) },
  };
  MODELES.petitJean = OURS;

  // la tunique des gardes : cotte de mailles (T) et tabard aux couleurs du roi (au centre)
  MODELES.garde.down.torse = T0.map((r) => r);
  MODELES.garde.up.torse = TU;

  // ------------------------------------------------------------ poses du roi Jean (vue de face)
  // boude (bras croisés), pouce (dans la bouche), pleure (2 images), colère (poings levés)
  function posesRoi(cfg) {
    const M = MODELES.roi, base = M.down.tete;
    const yeuxFermes = (t) => remplacer(remplacer(t, 6, '.HHKKKKKKKKKKHH.'), 7, '.HHKrrKKKKrrKHH.');
    const larmes = (t, bas) => (bas ? remplacer(t, 9, '.hHHeDDGGDDeHHh.') : remplacer(t, 8, '.HHKeKDDDDKeKHH.'));
    const bouche = (t) => remplacer(t, 10, '..hHHKDmmDKHHh..');
    const sourcils = (t) => remplacer(t, 5, '.HHKrrKKKKrrKHH.');
    const croises = ['.......kk.......', '....QQJQQJQQ....', '...QJQQQQQQJQ...', '...tUUUUUUUUt...', '...tkKUUUUKkt...', '...tTTZQQZTTt...', '...tTTZQJZTTt...', '....tTTTTTTt....', '......PPPP......'];
    const pouce = ['.......kKK......', '....QQJQUUQQ....', '...QJQQQUUQJQ...', '...tUTZQUUTUt...', '...UtTZQQZTt....', '...UtTZQJZTt....', '...UtTZQQZTt....', '...kK.tTTt......', '......PPPP......'];
    const leves = ['.U............U.', '.UU.QQJQQJQQ.UU.', '..UUQJQQQQQQJUU.', '...tUTZQQZTUt...', '....tTZQQZTt....', '....tTZQJZTt....', '....tTZQQZTt....', '.....tTTTTt.....', '......PPPP......'];
    const tetePouce = remplacer(remplacer(yeuxFermes(base), 10, '..hHHKDkKDKHHh..'), 9, '.hHHKDDGGDDKHHh.');
    const poings = (t) => remplacer(remplacer(t, 4, 'kHHHKKKKKKKKHHHk'), 3, 'KHaaaaaaaaaaaaHK');
    const variante = (tete, torse) => Object.assign({}, M, { down: { tete, torse: [torse, torse, torse], jambes: M.down.jambes } });
    const img = (tete, torse, blink = false) => Sprites.composeIsmae(cfg, 'down', 0, 1, blink, variante(tete, torse));
    return {
      boude: [img(sourcils(yeuxFermes(base)), croises), img(sourcils(yeuxFermes(base)), croises)],
      pouce: [img(tetePouce, pouce), img(larmes(tetePouce), pouce)],
      pleure: [img(bouche(larmes(yeuxFermes(base))), croises), img(bouche(larmes(yeuxFermes(base), true)), croises)],
      colere: [img(bouche(sourcils(poings(base))), leves), img(sourcils(poings(base)), leves)],
    };
  }

  // jeu d'images d'un animal (mêmes clés que Sprites.person) + poses spéciales
  function perso(cfg) {
    const c = Object.assign({}, cfg, { modele: MODELES[cfg.espece] });
    const spr = Sprites.person(c);
    if (cfg.espece === 'roi') spr.poses = posesRoi(c);
    return spr;
  }

  // ------------------------------------------------------------ petits figurants (une seule grille, vue de face)
  // K/k pelage, O intérieur des oreilles, D museau, E yeux, m nez, T/t vêtements, B pieds, A chapeau
  const LAPIN = {
    idle: ['..kK....Kk..', '..KO....OK..', '..KO....OK..', '..KO....OK..', '..KK....KK..', '..KKKKKKKK..', '.KKKKKKKKKK.', '.KKEKKKKEKK.',
      '.KKEKKKKEKK.', '.KKDDmmDDKK.', '..KDDDDDDK..', '...kKKKKk...', '..TTTTTTTT..', '.KTTTTTTTTK.', '.KTTTTTTTTK.', '..TTTTTTTT..', '..tKK..KKt..', '.BBB....BBB.'],
    joie: ['..kK....Kk..', '..KO....OK..', '..KO....OK..', '..KO....OK..', '..KK....KK..', '..KKKKKKKK..', '.KKKKKKKKKK.', '.KkKKKKKKkK.',
      'KKKkKKKKkKKK', 'K.KDDmmDDK.K', 'K.KDDmmDDK.K', 'KK.kKKKKk.KK', '.KTTTTTTTTK.', '..TTTTTTTT..', '..TTTTTTTT..', '..TTTTTTTT..', '..tKK..KKt..', '.BBB....BBB.'],
  };
  // petit lapin archer : chapeau vert comme Robin
  const LAPEREAU = {
    idle: ['...A........', '..aAA.......', '.aAAAaY.....', 'aaaaaaaa....', '..KO..OK....', '..KKKKKK....', '.KKEKKEKK...', '.KKDmmDKK...',
      '..kDDDDk....', '..TTTTTT.C..', '.KTTTTTTKC..', '..TTTTTT..C.', '..tK..Kt.C..', '.BB....BB...'],
    joie: ['...A........', '..aAA.......', '.aAAAaY.....', 'aaaaaaaa....', '..KO..OK....', '..KKKKKK....', '.KKkKKkKK...', '.KKDmmDKK...',
      'K.kDDDDk.K..', 'KKTTTTTTKKC.', '..TTTTTT..C.', '..TTTTTT.C..', '..tK..Kt.C..', '.BB....BB...'],
  };
  // Dame Gertrude : poule en robe bleue et bonnet
  const POULE = {
    idle: ['.....RR.......', '....RRRR......', '...AAAAAAa....', '..AKKKKKKAa...', '..aKEKKEKKa...', '...KKYYKKK....', '...KKKYKKK....', '....KKKKK.....',
      '...TTTTTTT....', '..TTTTTTTTT...', '.KTTTTTTTTTK..', '.KTTTTTTTTTK..', '..TTTTTTTTT...', '..tTTTTTTTt...', '...tttttt.....', '....Y...Y.....', '...YY..YY.....'],
    joie: ['.....RR.......', '....RRRR......', '...AAAAAAa....', '..AKKKKKKAa...', '..aKkKKkKKa...', '...KKYYKKK....', 'K..KKKYKKK..K.', 'KK..KKKKK..KK.',
      '.KKTTTTTTTKK..', '..TTTTTTTTT...', '..TTTTTTTTT...', '..TTTTTTTTT...', '..TTTTTTTTT...', '..tTTTTTTTt...', '...tttttt.....', '....Y...Y.....', '...YY..YY.....'],
  };
  // une tortue (de profil, tournée vers la droite)
  const TORTUE = {
    idle: ['....tTTTTt.....', '...tTGTTGTt....', '..tTTTTTTTTt.KK', '..TGTTGTTGTTKKE', '.tTTTTTTTTTTKKK', '.ttttttttttt.K.', '..KK....KK.....'],
    joie: ['....tTTTTt.....', '...tTGTTGTt....', '..tTTTTTTTTt.KK', '..TGTTGTTGTTKKE', '.tTTTTTTTTTTKKK', '.ttttttttttt.K.', '...KK....KK....'],
  };
  // Adam de la Halle : le coq ménestrel, assis, avec son luth
  const COQ = {
    idle: ['.....RR.........', '....RRRR........', '....KKKKK.......', '...KKKKKKK......', '...KEKKKKYY.....', '...KKKKKKYY.....', '....KRRKK.......', '....KRKKK.......',
      '...TTTTTTT......', '..TTTTTTTTT.....', '..TTCCCCCTTT....', '..TCCLLLCCTK....', '..TCLLmLLCKK....', '..TCCLLLCC.lll..', '...tCCCCCt...ll.', '...tttttt.......', '....Y..Y........', '...YY.YY........'],
    joie: ['.....RR.........', '....RRRR........', '....KKKKK.......', '...KKKKKKK......', '...KkKKKKYY.....', '...KKKKKKYY.....', '....KRRKK.......', '....KRKKK.......',
      '...TTTTTTT......', '..TTTTTTTTTK....', '..TTCCCCCTTK....', '..TCCLLLCCT.....', '..TCLLmLLC......', '..TCCLLLCC.lll..', '...tCCCCCt...ll.', '...tttttt.......', '....Y..Y........', '...YY.YY........'],
  };
  // Triste Sire : serpent enroulé ; la tête se balance
  const SERPENT = ['....gGGGGg....', '...gGGGGGGg...', '...gEGGGGEg...', '...gGGGGGGg...', '....gGmmGg....', '.....gGGg.....', '.....gYYg.....',
    '.....gYYg.....', '....gGYYGg....', '....gGYYGg....', '...gGGGGGGg...', '..gGGYYYYGGg..', '.gGGGGGGGGGGg.', '.gGGYYYYYYGGg.', 'gGGGGGGGGGGGGg', '.gggggggggggg.'];

  function grille(rows, pal) { return PX.outline(PX.fromRows(rows, pal), '#1d1626'); }
  const sansYeux = (rows) => rows.map((r) => r.replace(/E/g, 'k'));
  function figurant(type, cfg) {
    const S2 = PX.shade;
    const pal = {
      K: cfg.pelage, k: S2(cfg.pelage, -0.25), O: cfg.oreilles || '#f2a8b8', D: cfg.museau || '#f6eee2', E: '#1a1322', m: cfg.nez || '#e07a8a',
      T: cfg.habit || '#5a7ab8', t: S2(cfg.habit || '#5a7ab8', -0.3), B: cfg.pieds || S2(cfg.pelage, -0.1), A: cfg.chapeau || '#4f8a3a', a: S2(cfg.chapeau || '#4f8a3a', -0.3),
      Y: cfg.bec || '#e8b54a', R: cfg.crete || '#d8323a', G: cfg.motif || S2(cfg.habit || '#5a7ab8', 0.25), C: cfg.bois || '#a8743e', L: cfg.bois2 || '#d8a058', l: '#f4efe6',
      g: S2(cfg.pelage, -0.35),
    };
    const G = { lapin: LAPIN, lapereau: LAPEREAU, poule: POULE, tortue: TORTUE, coq: COQ }[type];
    return { idle: grille(G.idle, pal), blink: grille(sansYeux(G.idle), pal), joie: grille(G.joie, pal) };
  }
  // serpent : 4 images (la tête et le cou se balancent)
  function serpent() {
    const pal = { G: '#7aa84a', g: '#4a6a32', Y: '#e8d070', E: '#1a1322', m: '#d8323a' };
    const decale = (d) => SERPENT.map((r, y) => (y < 10 && d ? (d > 0 ? '.' + r.slice(0, -1) : r.slice(1) + '.') : r));
    const frames = [0, 1, 0, -1].map((d) => grille(decale(d), pal));
    return { frames, blink: grille(sansYeux(decale(0)), pal) };
  }

  // ------------------------------------------------------------ figurant (spectateurs, habitants)
  // o = { id, type, cfg, x, y, dialogue, flip, notes (joue de la musique), ronde: [{x, y}, …] (fait les cent pas), repliques }
  class Figurant {
    constructor(o) {
      Object.assign(this, { visible: true, joie: 0, flip: false }, o);
      this.spr = o.spr || (o.type === 'serpent' ? serpent() : figurant(o.type, o.cfg)); // o.spr : images déjà prêtes (enfants d'Arendelle, trolls…)
      this.t = Math.random() * 4; this.blinkT = Math.random() * 3; this.blink = false; this.bulle = null;
      const portrait = this.spr.idle || this.spr.frames[0];
      if (o.id) Entites.portraits[o.id] = portrait;
      const retourne = (spr) => { const o2 = {}; for (const k of Object.keys(spr)) o2[k] = Array.isArray(spr[k]) ? spr[k].map(PX.flipX) : PX.flipX(spr[k]); return o2; };
      if (this.flip) this.spr = retourne(this.spr);
      this.sprD = this.spr; this.sprG = this.ronde ? retourne(this.spr) : this.spr; // en marchant vers la gauche
      this.chemin = null; this.vitesse = o.vitesse || 20; this.iRonde = 0; this.noteT = Math.random() * 2;
    }
    get sortY() { return this.sortYFixe ?? this.y; }
    allerVers(points, vitesse, surFin) { this.chemin = points.map((p) => ({ x: p.x, y: p.y })); if (vitesse) this.vitesse = vitesse; this.surFin = surFin || null; }
    regarder() { /* toujours de face */ }
    dire(type, duree = 1.2) { this.bulle = { type, t: duree }; }
    update(dt, jeu) {
      this.t += dt;
      if (this.joie > 0) this.joie -= dt;
      if (this.notes && jeu && (this.noteT -= dt) < 0) {
        this.noteT = 1.1 + Math.random() * 1.4;
        jeu.particule('note', this.x + 6, this.y - 18, { vy: -12, vx: 4, max: 1.8, v: Math.random() < 0.5 ? 0 : 1 });
      }
      if (this.ronde && !this.chemin && this.visible) {
        this.iRonde = (this.iRonde + 1) % this.ronde.length;
        const q = this.ronde[this.iRonde];
        this.spr = q.x < this.x ? this.sprG : this.sprD;
        this.allerVers([q], this.vitesse);
      }
      if (this.bulle && (this.bulle.t -= dt) < 0) this.bulle = null;
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = true; if (this.blinkT < -0.15) { this.blink = false; this.blinkT = 2.5 + Math.random() * 3; } }
      if (this.chemin && !Entites.suivreChemin(this, dt)) { this.chemin = null; const f = this.surFin; this.surFin = null; if (f) f(this); }
    }
    zone() {
      if (!this.visible || !this.dialogue) return null;
      return { x: this.x - 10, y: this.y - 14, w: 20, h: 18, dialogue: (jeu) => { this.joie = Math.max(this.joie, 0.6); return this.dialogue(jeu); } };
    }
    draw(g) {
      if (!this.visible) return;
      const s = this.spr;
      let img, dy = 0;
      if (s.frames) img = this.blink ? s.blink : s.frames[Math.floor(this.t * 2.5) % 4];
      else if (this.joie > 0) { img = s.joie; dy = -Math.round(Math.abs(Math.sin(this.joie * 10)) * 2); }
      else img = this.blink ? s.blink : s.idle;
      if (!this.sansOmbre) Entites.ombre(g, this.x, this.y, Math.max(4, Math.round(img.width / 2.6)));
      Entites.poser(g, img, this.x, this.y + dy);
      if (this.bulle) Entites.poser(g, Entites.SPR.bulles[this.bulle.type], this.x, this.y - img.height - 1 + dy);
    }
  }

  // ------------------------------------------------------------ la cage de Georges
  function cage(ouverte) {
    const c = PX.canvas(22, 24), P = PX.painter(c);
    const F = '#4a4458', Fc = '#8a86a0', O = '#e8b54a';
    P.rect(9, 0, 4, 1, F); P.rect(8, 1, 1, 2, F); P.rect(13, 1, 1, 2, F); P.px(10, 1, O); P.px(11, 1, O);
    P.ellipse(11, 4, 9, 2, F); P.ellipse(11, 4, 8, 1, Fc); P.hline(4, 4, 14, '#c9c4d8');
    for (let x = 2; x <= 19; x += 3) { if (ouverte && x >= 8 && x <= 14) continue; P.vline(x, 5, 16, F); P.vline(x + 1, 5, 16, Fc); }
    P.rect(1, 20, 20, 3, '#6a4428'); P.hline(1, 20, 20, '#a8743e'); P.hline(1, 22, 20, '#3a2418');
    if (ouverte) { // la porte pend sur le côté
      for (let k = 0; k < 3; k++) { P.vline(15 + k * 2, 8 + k, 10, F); P.px(15 + k * 2, 8 + k, Fc); }
      P.hline(15, 8, 6, F); P.hline(15, 18, 6, F);
    } else { P.rect(10, 11, 3, 3, O); P.px(11, 12, '#6a4a1e'); }
    return c;
  }

  return { MODELES, perso, Figurant, cage, figurant, serpent };
})();
