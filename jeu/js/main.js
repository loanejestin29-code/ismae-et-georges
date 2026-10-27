// =====================================================================
//  main.js — démarrage : écran titre, détection du tactile, aide
// =====================================================================
'use strict';

(() => {
  const $ = (id) => document.getElementById(id);
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  // à la verticale, le jeu se met en pause derrière l'écran « tourne ton téléphone »
  const portrait = matchMedia('(orientation: portrait) and (max-width: 900px)');
  const majOrientation = () => Jeu.pause(portrait.matches);
  if (portrait.addEventListener) portrait.addEventListener('change', majOrientation);
  else portrait.addListener(majOrientation);

  function lancer() {
    try {
      Jeu.init('rue', 'depart');
    } catch (err) {
      $('titre-erreur').hidden = false;
      $('titre-erreur').textContent = 'Le jeu n\'a pas pu démarrer : ' + err.message;
      throw err;
    }
    majOrientation();
    const jouer = $('btn-jouer');
    jouer.disabled = false;
    jouer.focus();
    jouer.addEventListener('click', () => {
      $('titre').classList.add('fini');
      setTimeout(() => { $('titre').hidden = true; }, 450);
      Jeu.demarrer();
      $('aide').hidden = false;
      setTimeout(() => $('aide').classList.add('fini'), 7000);
      setTimeout(() => Jeu.dire('intro'), 500);
    });
  }
  if (document.readyState === 'complete') lancer();
  else addEventListener('load', lancer);
})();
