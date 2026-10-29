// =====================================================================
//  musique.js — un petit orchestre de jazz joué en direct (Web Audio).
//  Morceau original en si bémol, forme AABA de 32 mesures, swing :
//  piano (accords), contrebasse (walking bass), trompette (thème A),
//  clarinette (pont B), batterie légère (cymbale ride, charleston, balais).
//  + un second morceau, plus rapide, pour la course-poursuite du Carrefour
//  + un air de la forêt de Sherwood (luth, flûte, bourdon, tambourin), et sa version du tournoi
//  + une valse d'hiver pour Arendelle (clochettes, cordes, pizzicati, grelots)
//  + quelques bruitages (miaous, petits bips de dialogue, portes, couteau, bisou, arc, foule…).
// =====================================================================
'use strict';

const Musique = (() => {
  // les morceaux : le jazz de la rue (swing), la course-poursuite, la forêt (6/8) et le tournoi
  // plein : joué à ce volume partout (sinon, le jazz est plus fort près des musiciens)
  const MORCEAUX = {
    jazz: { bpm: 132, swing: true }, poursuite: { bpm: 172, swing: false, plein: 0.8 },
    foret: { bpm: 108, swing: false, plein: 0.62 }, tournoi: { bpm: 126, swing: false, plein: 0.72 },
    arendelle: { bpm: 132, swing: false, plein: 0.6 }, route: { bpm: 150, swing: false, plein: 0.7 },
    montaigu: { bpm: 112, swing: false, plein: 0.62 }, resto: { bpm: 168, swing: false, plein: 0.6 },
  };
  let morceau = 'jazz', suivant = null, NOIRE = 60 / MORCEAUX.jazz.bpm;
  let ctx = null, master, bus, sfx, filtre, reverb, wet, debut = 0, prochaine = 0, pas = 0, timer = null;
  let coupe = false, volumeVoulu = CONFIG.volumeMusique ?? 0.55, proximite = 0, etouffe = false;
  try { coupe = localStorage.getItem('jeu.son') === 'off'; } catch (_) { /* rien */ }
  if (CONFIG.musique === false) coupe = true;

  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // durée d'une croche : en swing, celle du temps (2/3) puis celle du contretemps (1/3)
  const dureeCroche = (i) => (MORCEAUX[morceau].swing ? (i % 2 === 0 ? (2 / 3) : (1 / 3)) : 0.5) * NOIRE;
  const dureeCroches = (debutPas, n) => { let t = 0; for (let k = 0; k < n; k++) t += dureeCroche(debutPas + k); return t; };

  // ------------------------------------------------------------ harmonie
  const NOTES = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
  const parse = (s) => { const m = s.match(/^([A-G]b?)(.*)$/); return { r: NOTES[m[1]], q: m[2] }; };
  const A = [['Bb6', 'G7'], ['Cm7', 'F7'], ['Dm7', 'G7'], ['Cm7', 'F7'], ['Fm7', 'Bb7'], ['Eb6', 'Ab7'], ['Bb6', 'G7'], ['Cm7', 'F7']];
  const B = [['D7', 'D7'], ['D7', 'D7'], ['G7', 'G7'], ['G7', 'G7'], ['C7', 'C7'], ['C7', 'C7'], ['F7', 'F7'], ['Cm7', 'F7']];
  const GRILLE = [...A, ...A, ...B, ...A].map((m) => m.map(parse));
  const VOICINGS = { '6': [4, 9, 14], m7: [3, 10, 14], '7': [4, 10, 14, 21] };

  // thèmes : [mesure, croche (0-7), durée en croches, note MIDI]
  const THEME_A = [
    [0, 0, 1, 77], [0, 1, 1, 79], [0, 2, 2, 82], [0, 4, 1, 79], [0, 5, 3, 77],
    [1, 0, 1, 75], [1, 1, 1, 77], [1, 2, 1, 79], [1, 3, 1, 77], [1, 4, 1, 75], [1, 5, 3, 72],
    [2, 0, 1, 74], [2, 1, 1, 77], [2, 2, 2, 81], [2, 4, 2, 79], [2, 6, 2, 77],
    [3, 0, 2, 75], [3, 2, 1, 74], [3, 3, 1, 72], [3, 4, 4, 69],
    [4, 0, 1, 80], [4, 1, 1, 79], [4, 2, 1, 77], [4, 3, 1, 75], [4, 4, 1, 74], [4, 5, 3, 77],
    [5, 0, 2, 79], [5, 2, 1, 75], [5, 3, 1, 79], [5, 4, 2, 82], [5, 6, 2, 80],
    [6, 0, 1, 77], [6, 1, 1, 73], [6, 2, 2, 74], [6, 4, 1, 70], [6, 5, 1, 74], [6, 6, 2, 77],
    [7, 0, 1, 75], [7, 1, 1, 74], [7, 2, 2, 72], [7, 4, 4, 70],
  ];
  const THEME_B = [
    [0, 0, 2, 78], [0, 2, 2, 81], [0, 4, 2, 84], [0, 6, 2, 81],
    [1, 0, 1, 78], [1, 1, 1, 79], [1, 2, 4, 81],
    [2, 0, 2, 83], [2, 2, 2, 79], [2, 4, 2, 77], [2, 6, 2, 74],
    [3, 0, 1, 77], [3, 1, 1, 76], [3, 2, 4, 74],
    [4, 0, 2, 76], [4, 2, 2, 79], [4, 4, 2, 82], [4, 6, 2, 79],
    [5, 0, 1, 76], [5, 1, 1, 77], [5, 2, 4, 79],
    [6, 0, 2, 81], [6, 2, 2, 84], [6, 4, 1, 81], [6, 5, 1, 79], [6, 6, 2, 77],
    [7, 0, 1, 75], [7, 1, 1, 74], [7, 2, 2, 72],
  ];
  const COMPS = [[0, 3], [1, 4], [2, 7], [0, 5], [3, 6]];

  // ------------------------------------------------------------ instruments
  let bruit = null;
  function bufferBruit() {
    const b = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function env(g, t, a, peak, dec, fin = 0.0001) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(fin, t + a + dec);
  }
  function osc(type, f, t, dur, dest) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    o.connect(dest); o.start(t); o.stop(t + dur + 0.05); return o;
  }
  function contrebasse(m, t, vol = 0.32) {
    const g = ctx.createGain(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    g.connect(lp); lp.connect(bus);
    env(g, t, 0.006, vol, 0.55);
    osc('triangle', hz(m), t, 0.6, g); osc('sine', hz(m), t, 0.6, g);
  }
  function piano(notes, t, dur = 0.32, vol = 0.05) {
    const g = ctx.createGain(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    g.connect(lp); lp.connect(bus); lp.connect(wet);
    env(g, t, 0.004, vol, dur + 0.5);
    for (const m of notes) { osc('triangle', hz(m), t, dur + 0.5, g); const h = ctx.createGain(); h.gain.value = 0.3; h.connect(g); osc('sine', hz(m) * 2, t, dur + 0.3, h); }
  }
  function souffle(type, m, t, dur, vol, cutA, cutB, vib) {
    const g = ctx.createGain(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.8;
    lp.frequency.setValueAtTime(cutA, t); lp.frequency.exponentialRampToValueAtTime(cutB, t + 0.06);
    g.connect(lp); lp.connect(bus); lp.connect(wet);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.setValueAtTime(vol * 0.85, t + Math.max(0.04, dur - 0.06));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    const o = osc(type, hz(m), t, dur + 0.08, g);
    if (dur > 0.25) {
      const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = 5.6; lg.gain.value = hz(m) * vib;
      lfo.connect(lg); lg.connect(o.frequency); lfo.start(t + 0.15); lfo.stop(t + dur + 0.1);
    }
  }
  const trompette = (m, t, dur) => souffle('sawtooth', m, t, dur, 0.06, 500, 2400, 0.006);
  const clarinette = (m, t, dur) => souffle('square', m - 12, t, dur, 0.05, 700, 1500, 0.004);
  function bruitFiltre(t, type, f, q, vol, dec) {
    const s = ctx.createBufferSource(); s.buffer = bruit;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ctx.createGain(); s.connect(fl); fl.connect(g); g.connect(bus);
    env(g, t, 0.002, vol, dec); s.start(t); s.stop(t + dec + 0.05);
  }
  const ride = (t, acc) => bruitFiltre(t, 'highpass', 7000, 0.7, acc ? 0.05 : 0.03, 0.35);
  const charley = (t) => bruitFiltre(t, 'highpass', 8000, 0.8, 0.035, 0.05);
  const balai = (t, v = 0.025) => bruitFiltre(t, 'bandpass', 2600, 0.6, v, 0.16);
  function grosseCaisse(t) {
    const g = ctx.createGain(); g.connect(bus); env(g, t, 0.004, 0.18, 0.18);
    const o = ctx.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
    o.connect(g); o.start(t); o.stop(t + 0.25);
  }

  // ------------------------------------------------------------ séquenceur
  let basseAvant = 46;
  function noteBasse(pc, pres) {
    let best = 40, d = 99;
    for (let m = 38; m <= 55; m++) if ((m % 12 + 12) % 12 === pc && Math.abs(m - pres) < d) { d = Math.abs(m - pres); best = m; }
    return best;
  }
  function jouerPas(i, t) {
    const mesure = Math.floor(i / 8) % 32, croche = i % 8;
    const accords = GRILLE[mesure];
    const ac = accords[croche < 4 ? 0 : 1];
    const suivant = croche < 4 ? accords[1] : GRILLE[(mesure + 1) % 32][0];
    // batterie
    if ([0, 2, 3, 4, 6, 7].includes(croche)) ride(t, croche === 0 || croche === 4);
    if (croche === 2 || croche === 6) charley(t);
    if (croche === 0 || croche === 4) grosseCaisse(t);
    if (croche % 2 === 1 && Math.random() < 0.18) balai(t, 0.015);
    if (mesure % 8 === 7 && croche >= 4) balai(t, 0.03 + (croche - 4) * 0.006);
    // contrebasse (une noire par temps)
    if (croche % 2 === 0) {
      const temps = croche / 2;
      let m;
      if (temps === 0 || temps === 2) m = noteBasse(ac.r, basseAvant);
      else if (temps === 1 || temps === 3) {
        const cible = noteBasse(suivant.r, basseAvant);
        m = Math.random() < 0.6 ? cible + (Math.random() < 0.5 ? 1 : -1) : noteBasse((ac.r + 7) % 12, basseAvant);
      }
      basseAvant = m;
      contrebasse(m, t);
    }
    // piano : accords syncopés, rythme choisi au début de chaque mesure
    if (croche === 0) jouerPas.comp = COMPS[Math.floor(Math.random() * COMPS.length)];
    if ((jouerPas.comp || COMPS[0]).includes(croche)) {
      const v = VOICINGS[ac.q] || VOICINGS['7'];
      const notes = v.map((iv) => { let m = 48 + ((ac.r + iv) % 12); while (m < 55) m += 12; while (m > 70) m -= 12; return m; });
      piano(notes, t, croche % 2 ? 0.18 : 0.3);
    }
    // thèmes
    const section = Math.floor(mesure / 8);
    const theme = section === 2 ? THEME_B : THEME_A;
    const instrument = section === 2 ? clarinette : trompette;
    const mm = mesure % 8;
    for (const [b, c, d, n] of theme) {
      if (b !== mm || c !== croche) continue;
      const dur = dureeCroches(i, d) * 0.92;
      instrument(n, t, dur);
      if (section === 3 && d >= 2) clarinette(n - 4, t, dur); // dernier A : la clarinette harmonise
    }
  }
  // ------------------------------------------------------------ course-poursuite (ré mineur, 172 à la noire)
  // A (trompette) : Dm Dm Gm A7 Dm Dm Bb7 A7 — B (clarinette, puis trompette) : Gm Gm Dm Dm Eb7 A7 Dm A7
  const GRILLE_P = [...['Dm7', 'Dm7', 'Gm7', 'A7', 'Dm7', 'Dm7', 'Bb7', 'A7'], ...['Gm7', 'Gm7', 'Dm7', 'Dm7', 'Eb7', 'A7', 'Dm7', 'A7']].map(parse);
  const RIFF_A = [
    [0, 0, 1, 74], [0, 1, 1, 77], [0, 2, 1, 81], [0, 3, 1, 77], [0, 4, 2, 74], [0, 6, 1, 72], [0, 7, 1, 74],
    [1, 0, 2, 77], [1, 2, 2, 76], [1, 4, 4, 74],
    [2, 0, 1, 79], [2, 1, 1, 82], [2, 2, 1, 86], [2, 3, 1, 82], [2, 4, 2, 79], [2, 6, 1, 77], [2, 7, 1, 79],
    [3, 0, 2, 81], [3, 2, 2, 79], [3, 4, 2, 76], [3, 6, 2, 73],
    [4, 0, 1, 74], [4, 1, 1, 77], [4, 2, 1, 81], [4, 3, 1, 86], [4, 4, 1, 84], [4, 5, 1, 81], [4, 6, 1, 77], [4, 7, 1, 81],
    [5, 0, 4, 86], [5, 4, 4, 81],
    [6, 0, 2, 80], [6, 2, 1, 77], [6, 3, 1, 74], [6, 4, 2, 70], [6, 6, 1, 74], [6, 7, 1, 77],
    [7, 0, 2, 76], [7, 2, 2, 73], [7, 4, 4, 69],
  ];
  const RIFF_B = [
    [0, 0, 1, 70], [0, 1, 1, 74], [0, 2, 2, 79], [0, 4, 1, 77], [0, 5, 1, 74], [0, 6, 2, 70],
    [1, 0, 1, 69], [1, 1, 1, 70], [1, 2, 1, 72], [1, 3, 1, 74], [1, 4, 1, 75], [1, 5, 1, 74], [1, 6, 1, 72], [1, 7, 1, 70],
    [2, 0, 1, 69], [2, 1, 1, 74], [2, 2, 2, 77], [2, 4, 1, 76], [2, 5, 1, 74], [2, 6, 2, 69],
    [3, 0, 6, 74],
    [4, 0, 2, 79], [4, 2, 2, 75], [4, 4, 2, 73], [4, 6, 2, 70],
    [5, 0, 1, 73], [5, 1, 1, 76], [5, 2, 1, 79], [5, 3, 1, 81], [5, 4, 1, 82], [5, 5, 1, 81], [5, 6, 1, 79], [5, 7, 1, 76],
    [6, 0, 1, 74], [6, 1, 1, 77], [6, 2, 1, 81], [6, 3, 5, 86],
    [7, 0, 2, 81], [7, 2, 2, 79], [7, 4, 2, 76], [7, 6, 2, 73],
  ];
  const caisseClaire = (t, v = 0.08) => {
    bruitFiltre(t, 'bandpass', 1900, 0.9, v, 0.12);
    const g = ctx.createGain(); g.connect(bus); env(g, t, 0.002, v * 0.9, 0.08); osc('triangle', 190, t, 0.1, g);
  };
  const crash = (t) => bruitFiltre(t, 'highpass', 5200, 0.5, 0.05, 1.1);
  function jouerPasPoursuite(i, t) {
    const mesure = Math.floor(i / 8) % 16, croche = i % 8, ac = GRILLE_P[mesure];
    // batterie : grosse caisse sur 1 et 3, caisse claire sur 2 et 4, charleston à chaque croche
    if (croche === 0 || croche === 4 || (croche === 7 && mesure % 2 === 1)) grosseCaisse(t);
    if (croche === 2 || croche === 6) caisseClaire(t);
    if (mesure % 4 === 3 && croche >= 6) caisseClaire(t + NOIRE / 4, 0.05);
    charley(t);
    if (mesure % 8 === 0 && croche === 0) crash(t);
    // contrebasse : croches en octaves, qui rebondissent
    const motif = [0, 12, 0, 12, 0, 12, 7, 10][croche];
    contrebasse(noteBasse(ac.r, 45) + motif, t, croche % 2 ? 0.2 : 0.3);
    // piano : accords courts sur les contretemps
    if (croche % 2 === 1) {
      const v = VOICINGS[ac.q] || VOICINGS['7'];
      piano(v.map((iv) => { let m = 48 + ((ac.r + iv) % 12); while (m < 57) m += 12; while (m > 72) m -= 12; return m; }), t, 0.08, 0.035);
    }
    // thème : A à la trompette, B à la clarinette doublée par la trompette sur la fin
    const section = Math.floor(mesure / 8), mm = mesure % 8;
    for (const [b, c, d, n] of section === 0 ? RIFF_A : RIFF_B) {
      if (b !== mm || c !== croche) continue;
      const dur = dureeCroches(i, d) * 0.85;
      if (section === 0) trompette(n, t, dur);
      else { clarinette(n + 12, t, dur); if (mm >= 4) trompette(n, t, dur); }
    }
  }

  // ------------------------------------------------------------ la forêt de Sherwood (ré dorien, 6/8)
  // A : Dm C Dm Am Dm C G Dm — B : F C Dm Am F C G A — forme A A B A
  const GRILLE_F = [...['D', 'C', 'D', 'A', 'D', 'C', 'G', 'D'], ...['D', 'C', 'D', 'A', 'D', 'C', 'G', 'D'], ...['F', 'C', 'D', 'A', 'F', 'C', 'G', 'A'], ...['D', 'C', 'D', 'A', 'D', 'C', 'G', 'D']]
    .map((n, k) => ({ r: NOTES[n], mineur: (n === 'D' || (n === 'A' && k % 8 !== 7)) }));
  // [mesure, croche (0-5), durée en croches, note MIDI]
  const AIR_A = [
    [0, 0, 2, 74], [0, 2, 1, 72], [0, 3, 2, 69], [0, 5, 1, 67], [1, 0, 2, 64], [1, 2, 1, 67], [1, 3, 3, 72],
    [2, 0, 2, 74], [2, 2, 1, 76], [2, 3, 2, 77], [2, 5, 1, 76], [3, 0, 3, 76], [3, 3, 2, 69], [3, 5, 1, 72],
    [4, 0, 1, 74], [4, 1, 1, 72], [4, 2, 1, 69], [4, 3, 2, 74], [4, 5, 1, 77], [5, 0, 2, 79], [5, 2, 1, 77], [5, 3, 2, 76], [5, 5, 1, 72],
    [6, 0, 2, 71], [6, 2, 1, 74], [6, 3, 2, 79], [6, 5, 1, 77], [7, 0, 5, 74],
  ];
  const AIR_B = [
    [0, 0, 2, 77], [0, 2, 1, 81], [0, 3, 2, 79], [0, 5, 1, 77], [1, 0, 2, 76], [1, 2, 1, 79], [1, 3, 3, 72],
    [2, 0, 1, 74], [2, 1, 1, 76], [2, 2, 1, 77], [2, 3, 2, 81], [2, 5, 1, 79], [3, 0, 3, 76], [3, 3, 3, 69],
    [4, 0, 2, 77], [4, 2, 1, 76], [4, 3, 2, 74], [4, 5, 1, 72], [5, 0, 2, 72], [5, 2, 1, 74], [5, 3, 2, 76], [5, 5, 1, 79],
    [6, 0, 2, 79], [6, 2, 1, 77], [6, 3, 2, 74], [6, 5, 1, 71], [7, 0, 3, 73], [7, 3, 3, 69],
  ];
  const flute = (m, t, dur, vol = 0.05) => { souffle('triangle', m, t, dur, vol, 1800, 3400, 0.008); bruitFiltre(t, 'bandpass', hz(m) * 2, 2, 0.008, 0.05); };
  function luth(m, t, vol = 0.045) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.3);
    g.connect(lp); lp.connect(bus); lp.connect(wet);
    env(g, t, 0.003, vol, 0.45);
    osc('triangle', hz(m), t, 0.5, g);
    const h = ctx.createGain(); h.gain.value = 0.3; h.connect(g); osc('square', hz(m) * 1.003, t, 0.22, h);
  }
  // bourdon : fondamentale et quinte tenues, très douces
  function bourdon(m, t, dur, vol = 0.022) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 480;
    g.connect(lp); lp.connect(bus);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.08);
    g.gain.setValueAtTime(vol, t + Math.max(0.1, dur - 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc('sawtooth', hz(m), t, dur, g); osc('sawtooth', hz(m + 7), t, dur, g);
  }
  function tambourin(t, acc) {
    const g = ctx.createGain(); g.connect(bus); env(g, t, 0.003, acc ? 0.15 : 0.08, 0.16);
    const o = ctx.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
    o.connect(g); o.start(t); o.stop(t + 0.2);
    bruitFiltre(t, 'lowpass', 900, 0.7, acc ? 0.045 : 0.025, 0.08);
  }
  const grelots = (t, v = 0.02) => bruitFiltre(t, 'highpass', 6500, 1.2, v, 0.09);
  function jouerPasForet(i, t) {
    const tournoi = morceau === 'tournoi';
    const mesure = Math.floor(i / 6) % 32, croche = i % 6, section = Math.floor(mesure / 8), mm = mesure % 8;
    const ac = GRILLE_F[mesure], tierce = ac.mineur ? 3 : 4;
    // percussions : tambourin sur les deux temps, grelots entre les deux ; caisse claire au tournoi
    if (croche === 0 || croche === 3) tambourin(t, croche === 0);
    if (croche === 2 || croche === 5) grelots(t);
    if (tournoi) {
      if (croche === 3) caisseClaire(t, 0.05);
      if (mm === 7 && croche >= 3) { caisseClaire(t, 0.04); caisseClaire(t + NOIRE / 4, 0.03); }
      if (mesure % 8 === 0 && croche === 0) crash(t);
    }
    if (croche === 0) bourdon(noteBasse(ac.r, 45), t, dureeCroches(i, 6) * 0.98);
    // luth : arpège de l'accord
    const m0 = 50 + ((ac.r - 2 + 12) % 12);
    luth(m0 + [0, 7, 12, 12 + tierce, 7, 12][croche], t, croche === 0 ? 0.05 : 0.035);
    // l'air : flûte (et trompette au tournoi) ; au dernier A, le luth double la flûte
    for (const [b, c, d, n] of section === 2 ? AIR_B : AIR_A) {
      if (b !== mm || c !== croche) continue;
      const dur = dureeCroches(i, d) * 0.9;
      if (tournoi) { trompette(n - 12, t, dur); flute(n, t, dur, 0.035); }
      else { flute(n, t, dur); if (section === 3) luth(n - 12, t, 0.03); }
    }
  }

  // ------------------------------------------------------------ Arendelle : une valse d'hiver (si mineur, 3/4)
  // A : Bm G D A Bm G Em F# — B : G D A Bm G D Em F# — forme A A B A
  const GRILLE_V = [['B', 'G', 'D', 'A', 'B', 'G', 'E', 'Gb'], ['G', 'D', 'A', 'B', 'G', 'D', 'E', 'Gb']];
  const VALSE_A = [
    [0, 0, 3, 78], [0, 3, 1, 76], [0, 4, 2, 74], [1, 0, 4, 71], [1, 4, 2, 74], [2, 0, 3, 81], [2, 3, 1, 79], [2, 4, 2, 78], [3, 0, 6, 76],
    [4, 0, 2, 78], [4, 2, 2, 79], [4, 4, 2, 81], [5, 0, 3, 83], [5, 3, 1, 81], [5, 4, 2, 79], [6, 0, 2, 78], [6, 2, 2, 76], [6, 4, 2, 74], [7, 0, 6, 73],
  ];
  const VALSE_B = [
    [0, 0, 2, 74], [0, 2, 2, 79], [0, 4, 2, 83], [1, 0, 4, 81], [1, 4, 2, 78], [2, 0, 2, 76], [2, 2, 2, 81], [2, 4, 2, 85], [3, 0, 6, 83],
    [4, 0, 2, 79], [4, 2, 2, 83], [4, 4, 2, 86], [5, 0, 3, 85], [5, 3, 1, 83], [5, 4, 2, 81], [6, 0, 2, 79], [6, 2, 2, 78], [6, 4, 2, 76], [7, 0, 3, 73], [7, 3, 3, 78],
  ];
  function clochette(m, t, dur, vol = 0.045) {
    const g = ctx.createGain(); g.connect(bus); g.connect(wet);
    env(g, t, 0.003, vol, Math.min(1.4, dur + 0.6));
    osc('sine', hz(m), t, dur + 0.7, g);
    const h = ctx.createGain(); h.gain.value = 0.25; h.connect(g); osc('sine', hz(m) * 2.01, t, 0.4, h);
  }
  function cordes(notes, t, dur, vol = 0.012) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    g.connect(lp); lp.connect(bus); lp.connect(wet);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.25);
    g.gain.setValueAtTime(vol, t + Math.max(0.3, dur - 0.2)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
    for (const m of notes) { osc('sawtooth', hz(m), t, dur + 0.15, g); osc('sawtooth', hz(m) * 1.004, t, dur + 0.15, g); }
  }
  const pizz = (m, t, vol = 0.03) => { const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600; g.connect(lp); lp.connect(bus); env(g, t, 0.002, vol, 0.16); osc('triangle', hz(m), t, 0.2, g); };
  function jouerPasValse(i, t) {
    const mesure = Math.floor(i / 6) % 32, croche = i % 6, section = Math.floor(mesure / 8), mm = mesure % 8;
    const nom = GRILLE_V[section === 2 ? 1 : 0][mm], r0 = NOTES[nom], mineur = nom === 'B' || nom === 'E', tierce = mineur ? 3 : 4;
    const accord = [0, tierce, 7].map((iv) => { let m = 60 + ((r0 + iv) % 12); while (m > 71) m -= 12; return m; });
    // oum-pa-pa : la basse sur le premier temps, les pizzicati et les grelots sur les deux autres
    if (croche === 0) { contrebasse(noteBasse(r0, 43), t, 0.26); cordes(accord, t, dureeCroches(i, 6)); }
    if (croche === 2 || croche === 4) { accord.forEach((m) => pizz(m, t)); grelots(t, 0.014); }
    for (const [b, c, d, n] of section === 2 ? VALSE_B : VALSE_A) {
      if (b !== mm || c !== croche) continue;
      clochette(n, t, dureeCroches(i, d));
      if (section === 3) clochette(n - 12, t, dureeCroches(i, d), 0.025);
    }
  }

  // ------------------------------------------------------------ la route vers Montaigu (sol majeur, 150 à la noire)
  const GRILLE_R = ['G', 'D', 'E', 'C', 'G', 'D', 'C', 'D'];
  const AIR_R = [
    [0, 0, 2, 74], [0, 2, 2, 79], [0, 4, 2, 83], [0, 6, 2, 81], [1, 0, 3, 78], [1, 3, 1, 76], [1, 4, 4, 74],
    [2, 0, 2, 76], [2, 2, 2, 79], [2, 4, 2, 83], [2, 6, 2, 86], [3, 0, 3, 84], [3, 3, 1, 83], [3, 4, 4, 79],
    [4, 0, 1, 83], [4, 1, 1, 81], [4, 2, 2, 79], [4, 4, 2, 74], [4, 6, 2, 79], [5, 0, 2, 81], [5, 2, 2, 78], [5, 4, 4, 81],
    [6, 0, 2, 79], [6, 2, 2, 76], [6, 4, 2, 72], [6, 6, 2, 76], [7, 0, 4, 74], [7, 4, 2, 78], [7, 6, 2, 81],
  ];
  function jouerPasRoute(i, t) {
    const mesure = Math.floor(i / 8) % 16, croche = i % 8, mm = mesure % 8, nom = GRILLE_R[mm], r0 = NOTES[nom], tierce = nom === 'E' ? 3 : 4;
    if (croche === 0 || croche === 4 || (croche === 7 && mm % 2)) grosseCaisse(t);
    if (croche === 2 || croche === 6) caisseClaire(t, 0.06);
    charley(t);
    if (mesure === 0 && croche === 0) crash(t);
    contrebasse(noteBasse(r0, 43) + [0, 12, 7, 12, 0, 12, 7, 10][croche], t, croche % 2 ? 0.18 : 0.28);
    if (croche % 2 === 1) piano([0, tierce, 7].map((iv) => { let m = 60 + ((r0 + iv) % 12); while (m > 71) m -= 12; return m; }), t, 0.09, 0.03);
    for (const [b, c, d, n] of AIR_R) {
      if (b !== mm || c !== croche) continue;
      const dur = dureeCroches(i, d) * 0.88;
      if (mesure < 8) clarinette(n + 12, t, dur); else { trompette(n, t, dur); clochette(n + 12, t, dur, 0.02); }
    }
  }

  // ------------------------------------------------------------ Montaigu, un soir de Noël (do majeur, 112 à la noire)
  const GRILLE_M = ['C', 'A', 'F', 'G', 'C', 'A', 'D', 'C'];
  const AIR_M = [
    [0, 0, 2, 76], [0, 2, 2, 79], [0, 4, 2, 84], [0, 6, 2, 83], [1, 0, 4, 81], [1, 4, 2, 76], [1, 6, 2, 79],
    [2, 0, 2, 77], [2, 2, 2, 81], [2, 4, 3, 84], [2, 7, 1, 81], [3, 0, 6, 79], [3, 6, 2, 74],
    [4, 0, 2, 76], [4, 2, 2, 79], [4, 4, 2, 84], [4, 6, 2, 88], [5, 0, 3, 86], [5, 3, 1, 84], [5, 4, 4, 81],
    [6, 0, 2, 77], [6, 2, 2, 81], [6, 4, 2, 83], [6, 6, 2, 86], [7, 0, 6, 84],
  ];
  function jouerPasMontaigu(i, t) {
    const mesure = Math.floor(i / 8) % 16, croche = i % 8, mm = mesure % 8, nom = GRILLE_M[mm], r0 = NOTES[nom], tierce = nom === 'A' || nom === 'D' ? 3 : 4;
    const accord = [0, tierce, 7].map((iv) => { let m = 60 + ((r0 + iv) % 12); while (m > 71) m -= 12; return m; });
    if (croche === 0 || croche === 4) contrebasse(noteBasse(r0, 43) + (croche === 4 ? 7 : 0), t, 0.24);
    if (croche === 2 || croche === 6) piano(accord, t, 0.2, 0.026);
    if (croche % 2 === 1) grelots(t, 0.012);
    for (const [b, c, d, n] of AIR_M) {
      if (b !== mm || c !== croche) continue;
      clochette(n, t, dureeCroches(i, d), 0.04);
      if (mesure >= 8) clochette(n - 12, t, dureeCroches(i, d), 0.02);
    }
  }

  // ------------------------------------------------------------ le restaurant : une valse musette à l'accordéon (ré mineur)
  function accordeon(notes, t, dur, vol = 0.026) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1900; lp.Q.value = 0.8;
    g.connect(lp); lp.connect(bus); lp.connect(wet);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.setValueAtTime(vol * 0.8, t + Math.max(0.05, dur - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);
    const trem = ctx.createOscillator(), tg = ctx.createGain(); trem.frequency.value = 6.2; tg.gain.value = vol * 0.25; trem.connect(tg); tg.connect(g.gain); trem.start(t); trem.stop(t + dur + 0.1);
    for (const m of notes) { osc('square', hz(m) * 0.998, t, dur + 0.08, g); osc('square', hz(m) * 1.003, t, dur + 0.08, g); }
  }
  const GRILLE_U = ['D', 'A', 'D', 'A', 'G', 'D', 'A', 'D'];
  const AIR_U = [
    [0, 0, 2, 69], [0, 2, 2, 74], [0, 4, 2, 77], [1, 0, 3, 76], [1, 3, 1, 73], [1, 4, 2, 69],
    [2, 0, 2, 74], [2, 2, 2, 77], [2, 4, 2, 81], [3, 0, 4, 79], [3, 4, 2, 76],
    [4, 0, 2, 79], [4, 2, 2, 82], [4, 4, 2, 86], [5, 0, 3, 77], [5, 3, 1, 76], [5, 4, 2, 74],
    [6, 0, 2, 73], [6, 2, 2, 76], [6, 4, 2, 79], [7, 0, 6, 74],
  ];
  function jouerPasResto(i, t) {
    const mesure = Math.floor(i / 6) % 16, croche = i % 6, mm = mesure % 8, nom = GRILLE_U[mm], r0 = NOTES[nom], tierce = nom === 'A' ? 4 : 3;
    const accord = [0, tierce, 7, nom === 'A' ? 10 : 12].map((iv) => { let m = 60 + ((r0 + iv) % 12); while (m > 70) m -= 12; return m; });
    // oum-pa-pa : la basse sur le premier temps, l'accordéon sur les deux autres
    if (croche === 0) contrebasse(noteBasse(r0, 43), t, 0.26);
    if (croche === 2 || croche === 4) accordeon(accord, t, dureeCroches(i, 1), 0.012);
    for (const [b, c, d, n] of AIR_U) {
      if (b !== mm || c !== croche) continue;
      accordeon([n + (mesure >= 8 ? 12 : 0)], t, dureeCroches(i, d) * 0.92, 0.026);
    }
  }

  function planifier() {
    if (suivant) {
      // changement de morceau : on repart du début, sans laisser de trou
      morceau = suivant; suivant = null; NOIRE = 60 / MORCEAUX[morceau].bpm;
      pas = 0; prochaine = Math.max(prochaine, ctx.currentTime + 0.05); debut = prochaine;
      majMix();
    }
    while (prochaine < ctx.currentTime + 0.15) {
      (morceau === 'poursuite' ? jouerPasPoursuite : morceau === 'foret' || morceau === 'tournoi' ? jouerPasForet : morceau === 'arendelle' ? jouerPasValse : morceau === 'route' ? jouerPasRoute : morceau === 'montaigu' ? jouerPasMontaigu : morceau === 'resto' ? jouerPasResto : jouerPas)(pas, prochaine);
      prochaine += dureeCroche(pas);
      pas++;
    }
  }

  // ------------------------------------------------------------ bruitages
  function miaou(aigu = 1, vol = 0.12) {
    if (!ctx || coupe) return;
    const t = ctx.currentTime + 0.01;
    const g = ctx.createGain(); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3;
    bp.frequency.setValueAtTime(900 * aigu, t); bp.frequency.linearRampToValueAtTime(1700 * aigu, t + 0.18); bp.frequency.linearRampToValueAtTime(800 * aigu, t + 0.45);
    g.connect(bp); bp.connect(sfx);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(480 * aigu, t); o.frequency.linearRampToValueAtTime(700 * aigu, t + 0.15); o.frequency.linearRampToValueAtTime(420 * aigu, t + 0.48);
    o.connect(g); o.start(t); o.stop(t + 0.55);
  }
  function bip(f = 660, vol = 0.025) {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    const g = ctx.createGain(); g.connect(sfx); env(g, t, 0.003, vol, 0.05);
    osc('square', f, t, 0.06, g);
  }
  function porte() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource(); s.buffer = bruit;
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.2;
    fl.frequency.setValueAtTime(600, t); fl.frequency.exponentialRampToValueAtTime(2400, t + 0.35);
    const g = ctx.createGain(); s.connect(fl); fl.connect(g); g.connect(sfx); env(g, t, 0.05, 0.05, 0.35);
    s.start(t); s.stop(t + 0.45);
  }
  // bruit court filtré, envoyé sur les bruitages
  function souffleSfx(t, type, f, q, vol, dec) {
    const s = ctx.createBufferSource(); s.buffer = bruit;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ctx.createGain(); s.connect(fl); fl.connect(g); g.connect(sfx);
    env(g, t, 0.002, vol, dec); s.start(t); s.stop(t + dec + 0.05);
  }
  function note(type, f, t, dur, vol, dest = sfx) { const g = ctx.createGain(); g.connect(dest); env(g, t, 0.005, vol, dur); osc(type, f, t, dur, g); }
  // tchak ! du couteau sur la planche
  function couteau() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    souffleSfx(t, 'bandpass', 3200, 1.4, 0.09, 0.05);
    note('triangle', 140, t, 0.06, 0.08);
  }
  function aie() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime, g = ctx.createGain(); g.connect(sfx); env(g, t, 0.005, 0.05, 0.3);
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(980, t); o.frequency.exponentialRampToValueAtTime(320, t + 0.28);
    o.connect(g); o.start(t); o.stop(t + 0.35);
  }
  // petit « smack » puis carillon magique
  function bisou() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    souffleSfx(t, 'lowpass', 1400, 0.7, 0.16, 0.06);
    souffleSfx(t + 0.03, 'bandpass', 2600, 2, 0.06, 0.04);
    [88, 91, 95, 100, 103].forEach((m, k) => note('sine', hz(m), t + 0.18 + k * 0.07, 0.6, 0.05));
  }
  // fanfare de victoire (trompette + accord de piano)
  function victoire() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime + 0.05, n = 60 / 150;
    [[72, 0, 0.5], [77, 0.5, 0.5], [81, 1, 0.5], [84, 1.5, 1.5], [81, 3, 0.5], [84, 3.5, 2.5]].forEach(([m, d, l]) => {
      const g = ctx.createGain(); g.connect(sfx);
      g.gain.setValueAtTime(0.0001, t + d * n); g.gain.exponentialRampToValueAtTime(0.07, t + d * n + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + (d + l) * n);
      osc('sawtooth', hz(m), t + d * n, l * n, g);
    });
    [[53, 65, 69, 72], [53, 65, 69, 72, 77]].forEach((acc, k) => acc.forEach((m) => note('triangle', hz(m), t + (k ? 3.5 : 1.5) * n, 1.2, 0.03)));
  }
  // ---- forêt de Sherwood
  // fanfare royale (deux trompettes)
  function fanfare() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime + 0.05, n = 60 / 170;
    [[67, 0, 0.5], [67, 0.5, 0.25], [67, 0.75, 0.25], [72, 1, 1], [67, 2, 0.5], [72, 2.5, 0.5], [76, 3, 2]].forEach(([m, d, l]) => {
      [[0, 0.06], [-12, 0.035]].forEach(([iv, v]) => {
        const g = ctx.createGain(); g.connect(sfx);
        g.gain.setValueAtTime(0.0001, t + d * n); g.gain.exponentialRampToValueAtTime(v, t + d * n + 0.025);
        g.gain.setValueAtTime(v, t + (d + l) * n - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + (d + l) * n);
        osc('sawtooth', hz(m + iv), t + d * n, l * n, g);
      });
    });
  }
  // la corde de l'arc et le sifflement de la flèche
  function arc() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime, g = ctx.createGain(); g.connect(sfx); env(g, t, 0.002, 0.08, 0.18);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.15);
    o.connect(g); o.start(t); o.stop(t + 0.22);
    const s = ctx.createBufferSource(); s.buffer = bruit;
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.5; fl.frequency.setValueAtTime(2400, t); fl.frequency.exponentialRampToValueAtTime(500, t + 0.3);
    const g2 = ctx.createGain(); s.connect(fl); fl.connect(g2); g2.connect(sfx); env(g2, t, 0.02, 0.05, 0.28); s.start(t); s.stop(t + 0.35);
  }
  // toc ! dans la paille (et un petit carillon pour le centre)
  function impact(pts) {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    souffleSfx(t, 'lowpass', 900, 0.8, 0.2, 0.08); note('triangle', 120, t, 0.12, 0.12);
    if (pts === 10) [88, 95, 100].forEach((m, k) => note('sine', hz(m), t + 0.08 + k * 0.06, 0.5, 0.04));
  }
  // la foule qui applaudit (force de 0 à 1), ou qui fait « ooh… »
  function foule(force = 1) {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    for (let k = 0; k < 12; k++) souffleSfx(t + Math.random() * 0.8, 'bandpass', 700 + Math.random() * 1500, 1.2, 0.03 * force, 0.3 + Math.random() * 0.4);
    for (let k = 0; k < 16; k++) souffleSfx(t + Math.random() * 1.1, 'highpass', 2500, 0.8, 0.025 * force, 0.04);
  }
  function oh() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = bruit;
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(700, t); fl.frequency.exponentialRampToValueAtTime(330, t + 0.8);
    const g = ctx.createGain(); s.connect(fl); fl.connect(g); g.connect(sfx);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    s.start(t); s.stop(t + 1);
  }
  // clac ! la porte de la cage
  function cage() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    [0, 0.09].forEach((d, k) => { note('square', k ? 880 : 1180, t + d, 0.08, 0.035); souffleSfx(t + d, 'highpass', 3500, 1, 0.05, 0.08); });
  }
  // le roi Jean trépigne, puis sanglote
  function colere() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime, g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    g.connect(lp); lp.connect(sfx); env(g, t, 0.02, 0.06, 0.55);
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.5);
    o.connect(g); o.start(t); o.stop(t + 0.6);
  }
  function pleurs() {
    if (!ctx || coupe) return;
    const t0 = ctx.currentTime;
    for (let k = 0; k < 3; k++) {
      const t = t0 + k * 0.5, g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
      g.connect(lp); lp.connect(sfx); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.04, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(580 - k * 30, t); o.frequency.exponentialRampToValueAtTime(400 - k * 30, t + 0.35);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 9; lg.gain.value = 25; lfo.connect(lg); lg.connect(o.frequency);
      o.connect(g); o.start(t); o.stop(t + 0.4); lfo.start(t); lfo.stop(t + 0.4);
    }
  }

  // ---- Arendelle
  // petit carillon : un élément du bonhomme de neige est trouvé (ou posé)
  function trouve() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    [84, 88, 91, 96].forEach((m, k) => note('sine', hz(m), t + k * 0.07, 0.35, 0.05));
  }
  function victoireCourte() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    [79, 83, 86, 91, 95].forEach((m, k) => { note('sine', hz(m), t + k * 0.11, 0.7, 0.05); note('triangle', hz(m - 12), t + k * 0.11, 0.4, 0.02); });
  }
  // la magie d'Elsa : une pluie de clochettes qui monte
  function magie() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    for (let k = 0; k < 16; k++) note('sine', hz(84 + k + (k % 3) * 2), t + k * 0.06, 0.6, 0.03);
    souffleSfx(t, 'highpass', 6000, 0.6, 0.03, 1.4);
  }

  // ---- la route
  function klaxon() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    [0, 0.22].forEach((d) => { const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200; g.connect(lp); lp.connect(sfx); env(g, t + d, 0.01, 0.05, 0.16); osc('sawtooth', 330, t + d, 0.18, g); osc('sawtooth', 415, t + d, 0.18, g); });
  }
  function vroum() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime, g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    g.connect(lp); lp.connect(sfx); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.5); o.frequency.exponentialRampToValueAtTime(120, t + 1.1);
    o.connect(g); o.start(t); o.stop(t + 1.2);
  }
  // la cuisine de Rémy : son petit couinement, le sucre qui coule, les bulles du caramel, l'alarme incendie
  function couic() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime, g = ctx.createGain(); g.connect(sfx); env(g, t, 0.005, 0.04, 0.12);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(2300, t + 0.08); o.frequency.exponentialRampToValueAtTime(1700, t + 0.13);
    o.connect(g); o.start(t); o.stop(t + 0.16);
  }
  function sucre() { if (!ctx || coupe) return; souffleSfx(ctx.currentTime, 'bandpass', 6000 + Math.random() * 2000, 1.5, 0.03, 0.06); }
  function bulle() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime, g = ctx.createGain(); g.connect(sfx); env(g, t, 0.003, 0.025, 0.07);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(320 + Math.random() * 200, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.06);
    o.connect(g); o.start(t); o.stop(t + 0.09);
  }
  // le beurre qui grésille dans le caramel chaud, et Rémy qui ronfle
  function gresille() { if (!ctx || coupe) return; const t = ctx.currentTime; for (let k = 0; k < 4; k++) souffleSfx(t + k * 0.03 + Math.random() * 0.02, 'highpass', 5000 + Math.random() * 3000, 0.9, 0.025, 0.04); }
  function ronfle() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime; souffleSfx(t, 'lowpass', 300, 2, 0.05, 0.6);
    const g = ctx.createGain(); g.connect(sfx); env(g, t, 0.2, 0.03, 0.5); osc('sawtooth', 70, t, 0.8, g);
  }
  function alarme() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    for (let k = 0; k < 3; k++) note('square', 3100, t + k * 0.14, 0.08, 0.02);
  }
  function choc() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    souffleSfx(t, 'lowpass', 700, 0.7, 0.25, 0.25); note('square', 110, t, 0.2, 0.05); souffleSfx(t + 0.05, 'highpass', 3000, 0.8, 0.06, 0.2);
  }

  // coup de sifflet du départ
  function partez() {
    if (!ctx || coupe) return;
    const t = ctx.currentTime;
    [0, 0.16].forEach((d) => { const g = ctx.createGain(); g.connect(sfx); env(g, t + d, 0.01, 0.04, 0.12); const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(1900, t + d); o.frequency.linearRampToValueAtTime(2300, t + d + 0.1); o.connect(g); o.start(t + d); o.stop(t + d + 0.16); });
  }

  // ------------------------------------------------------------ contrôle
  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) { /* iOS ancien */ }
    master = ctx.createGain(); master.gain.value = coupe ? 0 : 1;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    filtre = ctx.createBiquadFilter(); filtre.type = 'lowpass'; filtre.frequency.value = 18000;
    bus = ctx.createGain(); bus.gain.value = volumeVoulu * 0.6;
    bus.connect(filtre); filtre.connect(master);
    sfx = ctx.createGain(); sfx.gain.value = 1; sfx.connect(master);
    reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 1.8, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    reverb.buffer = ir; wet = ctx.createGain(); wet.gain.value = 0.22; wet.connect(reverb); reverb.connect(filtre);
    bruit = bufferBruit();
    return true;
  }
  function demarrer() {
    if (!ctx && !init()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (timer) return;
    debut = prochaine = ctx.currentTime + 0.1; pas = 0;
    timer = setInterval(planifier, 25);
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
  }
  function majMix() {
    if (!ctx) return;
    // la course-poursuite, la forêt, le tournoi : même volume partout, sans étouffer
    const plein = MORCEAUX[suivant || morceau].plein, fort = !!plein;
    // la course-poursuite se joue « dans » le magasin : jamais étouffée ; les autres morceaux le sont à l'intérieur
    const etouffeIci = etouffe && (suivant || morceau) !== 'poursuite';
    const v = fort ? volumeVoulu * plein * (etouffeIci ? 0.6 : 1) : volumeVoulu * (0.3 + 0.7 * proximite) * (etouffe ? 0.55 : 1);
    bus.gain.setTargetAtTime(v, ctx.currentTime, 0.3);
    filtre.frequency.setTargetAtTime(etouffeIci ? 650 : 18000, ctx.currentTime, 0.2);
  }
  return {
    demarrer,
    basculer() {
      coupe = !coupe;
      try { localStorage.setItem('jeu.son', coupe ? 'off' : 'on'); } catch (_) { /* rien */ }
      if (master) master.gain.setTargetAtTime(coupe ? 0 : 1, ctx.currentTime, 0.05);
      return !coupe;
    },
    actif: () => !coupe,
    // proximité de la scène des musiciens (0 = loin, 1 = juste devant)
    proximite(p) { if (Math.abs(p - proximite) > 0.02) { proximite = p; majMix(); } },
    etouffer(oui) { if (oui !== etouffe) { etouffe = oui; majMix(); } },
    // position dans la mesure, en temps (sert à faire bouger les musiciens en rythme)
    temps: () => (ctx && timer ? (ctx.currentTime - debut) / NOIRE : performance.now() / 1000 / NOIRE),
    // 'jazz', 'poursuite', 'foret' ou 'tournoi' : le changement se fait au prochain pas du séquenceur
    morceau(nom) {
      if (!MORCEAUX[nom]) return;
      if (!ctx || !timer) { morceau = nom; NOIRE = 60 / MORCEAUX[nom].bpm; return; }
      if (nom !== morceau || suivant) suivant = nom === morceau ? null : nom;
    },
    miaou, bip, porte, couteau, aie, bisou, victoire, partez, fanfare, arc, impact, foule, oh, cage, colere, pleurs, trouve, victoireCourte, magie, klaxon, vroum, choc, couic, sucre, bulle, alarme, gresille, ronfle,
  };
})();
