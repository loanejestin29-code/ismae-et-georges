// =====================================================================
//  musique.js — un petit orchestre de jazz joué en direct (Web Audio).
//  Morceau original en si bémol, forme AABA de 32 mesures, swing :
//  piano (accords), contrebasse (walking bass), trompette (thème A),
//  clarinette (pont B), batterie légère (cymbale ride, charleston, balais).
//  + quelques bruitages (miaous, petits bips de dialogue, portes).
// =====================================================================
'use strict';

const Musique = (() => {
  const BPM = 132;
  const NOIRE = 60 / BPM;
  let ctx = null, master, bus, sfx, filtre, reverb, wet, debut = 0, prochaine = 0, pas = 0, timer = null;
  let coupe = false, volumeVoulu = CONFIG.volumeMusique ?? 0.55, proximite = 0, etouffe = false;
  try { coupe = localStorage.getItem('jeu.son') === 'off'; } catch (_) { /* rien */ }
  if (CONFIG.musique === false) coupe = true;

  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // durée d'une croche swing : celle du temps (2/3) puis celle du contretemps (1/3)
  const dureeCroche = (i) => (i % 2 === 0 ? (2 / 3) : (1 / 3)) * NOIRE;
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
  function planifier() {
    while (prochaine < ctx.currentTime + 0.15) {
      jouerPas(pas, prochaine);
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
    const v = volumeVoulu * (0.45 + 0.55 * proximite) * (etouffe ? 0.55 : 1);
    bus.gain.setTargetAtTime(v, ctx.currentTime, 0.3);
    filtre.frequency.setTargetAtTime(etouffe ? 650 : 18000, ctx.currentTime, 0.2);
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
    miaou, bip, porte,
  };
})();
