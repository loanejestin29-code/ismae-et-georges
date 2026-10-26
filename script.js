// Georges, assis, qui cligne des yeux et remue la queue (dessiné pixel par pixel)
'use strict';

(() => {
  const PALETTE = {
    B: '#25212f', // pelage noir
    b: '#0f0c16', // contour
    L: '#4a4563', // reflet
    E: '#d8e35c', // yeux
    n: '#3a2a3e', // nez
    I: '#3e3550', // oreilles
  };
  const CORPS = [
    '................',
    '....B......B....',
    '....BB....BB....',
    '....BIBBBBIB....',
    '...BLLBBBBLLB...',
    '...BBEBBBBEBB...',
    '...BBEBBBBEBB...',
    '...BBBBnnBBBB...',
    '....BBBBBBBB....',
    '.....BLLLBB.....',
    '....BBBBBBBBB...',
    '....BBBBBBBBB...',
    '...BBBBBBBBBBB..',
    '...BBBBBBBBBBB..',
    '...bbbbbbbbbbb..',
    '................',
  ];
  // deux positions de queue, en alternance
  const QUEUES = [
    [[14, 12], [15, 12], [15, 11], [15, 10]],
    [[14, 13], [15, 13], [15, 12], [14, 11]],
  ];

  const canvas = document.getElementById('georges');
  const g = canvas.getContext('2d');
  let queue = 0;
  let cligne = false;

  function dessiner() {
    g.clearRect(0, 0, 16, 16);
    CORPS.forEach((ligne, y) => {
      [...ligne].forEach((lettre, x) => {
        if (lettre === '.') return;
        const yeuxFermes = cligne && lettre === 'E';
        g.fillStyle = yeuxFermes ? PALETTE.b : PALETTE[lettre];
        g.fillRect(x, y, 1, 1);
      });
    });
    g.fillStyle = PALETTE.B;
    QUEUES[queue].forEach(([x, y]) => g.fillRect(x, y, 1, 1));
  }

  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  dessiner();
  if (calme) return;

  setInterval(() => { queue = 1 - queue; dessiner(); }, 700);
  (function clignement() {
    setTimeout(() => {
      cligne = true; dessiner();
      setTimeout(() => { cligne = false; dessiner(); clignement(); }, 160);
    }, 2200 + Math.random() * 2600);
  })();
})();
