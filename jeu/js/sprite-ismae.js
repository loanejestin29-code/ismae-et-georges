// =====================================================================
//  sprite-ismae.js — Ismae, d'après la planche de référence (face, dos,
//  profil droit, profil gauche) réduite à 52 px de haut, et son portrait
//  de dialogue (42 × 46). Une lettre = un pixel :
//   o contour   H/h/i cheveux   K/k/s peau (clair / moyen / ombre-barbe)
//   d/m/l tissu sombre / moyen / clair   L/M reflets du cuir   Z métal   W/w semelles
//  Les habitants réutilisent cette silhouette avec d'autres couleurs.
// =====================================================================
'use strict';

const PLANCHE_ISMAE = {
  palette: {
    o: '#120e18', H: '#6e5144', h: '#4e3a32', i: '#352620', K: '#e2c0a8', k: '#bf8a6c', s: '#7c6152',
    d: '#24232c', m: '#2e2d38', l: '#383744', L: '#47465a', M: '#5c5b70', Z: '#b4b2c2', W: '#eceaf2', w: '#9c9aa8',
  },
  // première ligne du pantalon pour chaque vue (au-dessus : haut du corps)
  taille: { down: 29, up: 29, right: 31, left: 31 },
  down: ['.........hHHh........', '......hHHhhhihH......', '.....iiihHHHiiHHh....', '....hhhiihihHihH.....', '....HhhhhhihhihHh....',
    '....iihhhkhhkiihh....', '.....hHkkkhkKkkih....', '.....sskKKkKkkkH.....', '....KskkKKKKkkkk.....', '....KkKKiKKKiKkko....',
    '.....kKKKKKKKKkk.....', '......sKKKkkKKo......', '.......kskkkkk.......', '.......oosHso........', '......mdokkkodl......',
    '.....LmLokkkolLL.....', '....oMMMmkkk.LMMo....', '...LLZMModd..MMMoL...', '...llmLLdddddlZmLlo..', '..LLmKMLdmddmLLKllL..',
    '..LmdlZLmddddMKllll..', '..llddLKdddddslllmmL.', '.lllllLKdd.ddZMlo.ml.', '.LLmolLo...dmZMmo.LLo', '.lLddZKo..dddKMZlomml',
    'olldsLso.dddmsLLZmmlL', 'MlldllsoodddooLLLomlM', 'oLmolMKmlldmmosLLomLl', '.llmlZMoooooooKldollo', '.oksooommmd.lmKoookk.',
    '.oKko..mmml.mml..kKk.', '..Kkommmmml.mmmm.ok..', '....odmmmmm.mmmml....', '....olmmdm.mmmmmmo...', '....ommmmd.dmmmmlo...',
    '....mmmmmdommmmmml...', '....lmmmmmommmmmll...', '...olmmmmmommmmmmmo..', '...llmmmmmoommmmmml..', '...llmmmmdo.dmmmmll..',
    '...mmmmmdmo.mmmmmml..', '...mmmmmmmo.dmmmlmm..', '..ommmmmmmo.dmmmmmmm.', '..mmmmmmm.o..mmmmmmm.', '..mllmmmm....mmmmmmmo',
    '.lllLlmmm....dmlmLLmm', '.ollmmmll....dmmmmmlm', '.omdZZmm..o..d..ooomo', '..oZZZso......oKZZZK.', '.owwwWwwoo...oLwWwMwo',
    '.WWWWWWWw....wwwWWWWW', '..WWWWo........wWWWW.'],
  up: ['.........iHH.......', '......hhhHhhHH.....', '.....hihhhhhhhh....', '....hhhiiihhhhh....', '...ohhhhhhhhHhhh...',
    '....himhhhhhimhi...', '....iii..hh..iii...', '....hhhhiiiiHHH....', '....ssHsHHHsHsH....', '....Ksssssssssso...',
    '....Kkssssssssk....', '.....okssssssk.....', '.......kkskkk......', '.......oMMLLo......', '.....omLLLllLo.....',
    '.....lLLlLLLLlo....', '....LLllmmmlllml...', '...dLmllmlllmllLo..', '...LmmmmmmmmmmlmL..', '..llllmmmmmmmmllL..',
    '..lllmmmmmmmmmmmmL.', '..LlmmmmmmmmmmommL.', '.lmlmmmmmmmmmmommL.', '.Lmmmmllmmmmmm..mll', '.mLmdlllLmlmmmo.Lmm',
    'ommldlllmdlLmll.mmm', 'Lmmmo...lLLmlmoommL', 'LLmdolLooooooomomlL', '.llmoo........oomdm', '.skoommmm.mmmm.oHko',
    '.kkkmdmmmmmmmm.kkKo', '..kommmmmmmdmmmkkK.', '....mmmmmmmmmmmo...', '....mmmd....mmmm...', '....mmmmdo.mmmmm...',
    '...mmmmmmodmmmmmo..', '...mmmmmmo.mmmmmo..', '...mmmmmmo.mmmmmm..', '...mmmmm.o.mmmmmm..', '..ommmm..oo.mmmmmo.',
    '..ommmmm....mmmmmm.', '..mmmmmm..odmmmmmm.', '.ommmmmml.ommmmmmm.', '.olmmmmm..ommmmmmm.', '.mmmmmmm..o.mmmmmml',
    '.mmmmmmm....mmmmmmm', 'ommmmmmm.oo.mmmmmmm', '..mmmmmd.o..mmmmmmd', '.o..mm....o........', '.owwwwoo....ooooMMo',
    '.WMWwwWw....wWwwWwo', '..wWWWWw....wWWWWw.'],
  right: ['.......hHH.....', '....hHhhHhHhi..', '...iiihHhhhHHi.', '..hhhihhhHhhhhh', '..hhhiiiiihhihH', '..hiiiihhiiiiiH',
    '..iiHHssHHkkkki', '..hHsssskkkkKK.', '...HssKsKKKKK..', '...HsKkKKKKiK..', '....HHkkKKKKKk.', '.....hkskKKsk..',
    '.....okkssssk..', '....MLkkkkHs...', '...omlMLko.....', '...omMMLLo.....', '...oLMdMLLo....', '...lLLMlLLlM...',
    '...lmLLlLLlL...', '...mmLldlKLM...', '..omlLmmllKmo..', '..mmmLmmmLZoL..', '..lmLLdmllKZL..', '..mmLmlomlZZd..',
    '..llLLLldZMZ.o.', '..llmmLldZlK.l.', '..lmmmmLZLLKom.', '..omlmmMZmLKol.', '..ollLMMLllooo.', '..ollLLlllKoo..',
    '...o..llomo.o..', '...ookkkKdm.o..', '.....kkKsdmlo..', '...o.oommmm.o..', '...omdmmmml.o..', '...ommdmmmmod..',
    '...mmmmmmmmoo..', '...ddlmmmmLmo..', '...ommmmmmmdd..', '..olmmmmmmmmo..', '..dmmmmmmmmmo..', '..mmmmmmmmmmo..',
    '..mmmmmmmmmmo..', '.ommmmmmmmomo..', '.mmmdmmmmmmmm..', '.mmmmmmmmmomm..', '.mmmmmLLLLdmd..', 'ommmmldmddmdo..',
    '..dm..oKMdoZK..', '.domMwwwwwWWwWW', '..wWWwWwWWWWWww', '..wWWwWWWWww...'],
  left: ['.....hHiH.....', '.oohhhhHhHh...', '.HHHHhHHhihii.', '.hhhhHhhHiihH.', 'hhihhhi..iihhi', 'Hihiihiiiihimi',
    'hikkkkHsHHhii.', '..kkkkkkssssh.', '..KkkKKkssssH.', '..KiKKKskkss..', '..KKKKKkkks...', '..kkKKkskH....',
    '...kssskko....', '...ssHkkklL...', '.....okMMlmo..', '.....oLLMMLo..', '....ollLMMLo..', '....oLKlMLdm..',
    '...ooZllMMld..', '...oLKdllmmm..', '...oKLdmmLmm..', '...oKLmmmLmmo.', '...oLlmlLllmo.', '..osMldlLlmmo.',
    '..oKKLdLLLmmo.', '..lKLKdmLmmlo.', '..oMmZLlmmmm..', '.dKMlmMlmmmo..', '..oLlmLLLmmoo.', '.ooKLmdLlmlo..',
    '...ooolmlmo...', '...dmoKKko....', '...dmkKKkk....', '...mmmdokdl...', '....mmm..dl...', '...ommmmmmmo..',
    '...ommmmmmm...', '...ommmmmmdo..', '...ommmmmmlo..', '...ommmmmmmo..', '...ommmmmmmd..', '...ommmmmmmdo.',
    '...mmmmmmmmmo.', '...mmmmmmmmmm.', '...mmmmmmdmmm.', '..omldmmmmmmmo', '..lllmlLmmmmmo', '...mo..LLmmmmd',
    '..osoooo..mm..', 'WWwWwwwwww....', 'owWWWwwWWWMMw.', '..owWWWWWWWww.'],
};

const PORTRAIT_ISMAE = {
  palette: {
    A: '#281f1c', B: '#4f3a30', C: '#45322b', D: '#332622', E: '#3f2e28', F: '#372924', G: '#2e231f', H: '#3a2b25', I: '#c39175',
    J: '#7e5b49', K: '#d3cbca', L: '#d89e78', M: '#dda57e', N: '#ba8161', O: '#80716d', P: '#60463a', Q: '#2b2c34', R: '#050406',
    S: '#a26d52', T: '#36373f', U: '#494f5b', V: '#24252c',
  },
  rows: ['................DHGEBBBAA.................', '.............RRHHCCCEBAGGREBBR............', '...........RRFHBCEGDDFECBBBBCHR...........',
    '............DECCDGEBBBBBCEDGFEERR.........', '.........RG..HHGFCCBEEHDGBECBBPBBR........', '........FEFFFG.FFCDFACBBCBBHHFHHBBRC......',
    '.......DCEEEHHHFA..FFHHDAAAHEBBCBBBR......', '......RHHGBBHCFFFHHA....GHEBBBEECHR.......', '.......CGGEHHFFFHFFFFFDDECCEAEEHDCCR......',
    '......RCEHGGFHFFDFHCHHHCBEG.AB.FCCCB......', '......CHHHHAAFGFFFHHGHBCGJPJAB..CB.C......', '......EHHGGFDGFDHHGADECSSSSSGSNP.BBRC.....',
    '......FAAGFFFDDHHAANDENSNIINDNNNRBBR......', '......FAFFCBBPPHENNNSNLMMMIINMLNRGBR......', '......AAFCCJJJPPHNNINMMMMMLLLLLNA.G.......',
    '.......FEBJJJJJPNLMARRAJMMMLLMMSR.........', '.......EBPPPJJJSLLNSSJAAALLLLDARR.........', '.......BPNNNJJJILLLLLNSJEMMMMRNR..........',
    '.......RCMMMMJOLLLLRRRRRSMMMMRRR..........', '........MMJJLJOMMLMKKTRKLMLLKKR...........', '........RLSJLMOMMMMLKUUKMMMLKKR...........',
    '........RMMNMMLMLLLLLLLMMLMMLLR...........', '.........MMMMIILMMMMMLLLLMMMLNR...........', '..........RRRSIIMMMMLMMMMMLSMNR...........',
    '............RSSIIMMMMMMMMISSLR............', '............RSPJINMMMMMJJILLSR............', '..........RRRSRBJNSMMLJISSSSM.............',
    '.........R..RSSRBPSNMSJLLIILJ.............', '........RV.RRNNSSSPJJJSLJJPS..............', '.......VQQRRSNNSSSJRRPJNPPP...............',
    '......TQQTQRSNNNSSSJJRRRRR................', '.....TQQVTQRRNNNNSSSJRR...R...............', '....RTVVVTTQRSNNNNSSSRR..V.R..............',
    '..RVRTTQQQTQRRNNNNSSSSR..V.QR.............', '.RQRTQTTQQTTQRJSNNNSSSSR..QQQR............', 'RVQRTUTTTVTTTRRRSNNSSNNRRVQQQQR...........',
    'QQQOOKIQTVVTTT...NNNNN..R.QQVVOR..........', 'VVROOQVQQTTTQQR....R.....RVQTTQURR........', 'VVRKKVOOORRQTTRR.........RVTRRRRRR........',
    'V..RRRRR...RRTQR.........RVVRR...VR.......', 'VV.........RRTTR..........RQTR..VVV.......', 'VV...VVVV..RUQTVR.........RQQORVV..R......',
    'VV..VVVVV.ROTQTTR.........RQQQO.....R.....'],
};
