// =====================================================================
//  main.js — démarrage : écran titre, orientation, musique, intro
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
      Titre.demarrer();
      Scenes.init(Jeu);
      Bisou.init(Jeu);
      Sherwood.init(Jeu);
      EpreuveNeige.init(Jeu);
      Indices.init();
      // #sherwood à la fin de l'adresse : on commence directement dans la forêt (épreuve 2)
      if (location.hash.includes('sherwood')) {
        Object.assign(Scenes.quete, { intro: 'fini', tom: true, cle: true, porteOuverte: true, entreeSuperette: true, bisou: 'gagne' });
        Jeu.init('foret', 'entree');
      } else if (location.hash.includes('arendelle')) { // #arendelle : directement à Arendelle (épreuve 3)
        Object.assign(Scenes.quete, { intro: 'fini', tom: true, cle: true, porteOuverte: true, entreeSuperette: true, bisou: 'gagne', sherwood: 'gagne' });
        Jeu.init('arendelle', 'entree');
      } else Jeu.init('rue', 'depart');
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
      Musique.demarrer();
      $('titre').classList.add('fini');
      setTimeout(() => { $('titre').hidden = true; Titre.arreter(); }, 650);
      Jeu.demarrer();
      $('aide').hidden = false;
      setTimeout(() => $('aide').classList.add('fini'), 6500);
    });
  }
  if (document.readyState === 'complete') lancer();
  else addEventListener('load', lancer);
})();
