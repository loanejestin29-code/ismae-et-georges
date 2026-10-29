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

  // les points de reprise : après chaque épreuve réussie, on repart au début de la suivante
  const FINI1 = { intro: 'fini', tom: true, cle: true, porteOuverte: true, entreeSuperette: true, bisou: 'gagne' };
  const ETAPES = [
    null,                                                                                        // 0 : le tout début, dans la rue
    { carte: 'foret', arrivee: 'entree', quete: FINI1 },                                         // 1 : la forêt de Sherwood
    { carte: 'arendelle', arrivee: 'entree', quete: Object.assign({}, FINI1, { sherwood: 'gagne' }) }, // 2 : Arendelle
    { carte: 'arendelle', arrivee: 'arret', quete: Object.assign({}, FINI1, { sherwood: 'gagne', neige: 'gagne' }) }, // 3 : l'arrêt de bus
    { carte: 'montaigu', arrivee: 'bus', quete: Object.assign({}, FINI1, { sherwood: 'gagne', neige: 'gagne', bus: 'gagne' }) }, // 4 : Montaigu
    { carte: 'montaigu', arrivee: 'devantResto', quete: Object.assign({}, FINI1, { sherwood: 'gagne', neige: 'gagne', bus: 'gagne', caramel: 'gagne' }) }, // 5 : après le caramel
  ];
  // le début de chaque épreuve, pour la rejouer depuis le carnet (l'épreuve 1 commence en entrant au Carrefour)
  const DEBUTS = [{ carte: 'superette', arrivee: 'entree', quete: { intro: 'fini', tom: true, cle: true, porteOuverte: true } }, ...ETAPES.slice(1)];
  // raccourcis d'essai : #sherwood, #arendelle, #bus, #montaigu, #caramel (après l'épreuve 5)
  const RACCOURCIS = { sherwood: 1, arendelle: 2, bus: 3, montaigu: 4, caramel: 5 };
  function etapeDe() {
    const k = Object.keys(RACCOURCIS).find((n) => location.hash.includes(n));
    if (k) { Indices.simuler(RACCOURCIS[k]); return RACCOURCIS[k]; }
    return Math.min(Indices.progression(), ETAPES.length - 1);
  }
  function partir(E) {
    if (!E) return;
    Object.assign(Scenes.quete, E.quete);
    Jeu.teleporter(E.carte, E.arrivee);
  }

  function lancer() {
    let etape = 0, rejoue = null;
    try {
      Titre.demarrer();
      Scenes.init(Jeu);
      Bisou.init(Jeu);
      Sherwood.init(Jeu);
      EpreuveNeige.init(Jeu);
      Bus.init(Jeu);
      EpreuveCaramel.init(Jeu);
      Indices.init();
      etape = etapeDe();
      rejoue = Indices.aRejouer();
      Jeu.init('rue', 'depart');
    } catch (err) {
      $('titre-erreur').hidden = false;
      $('titre-erreur').textContent = 'Le jeu n\'a pas pu démarrer : ' + err.message;
      throw err;
    }
    majOrientation();
    const jouer = $('btn-jouer'), recommencer = $('btn-recommencer');
    jouer.disabled = false;
    jouer.focus();
    // une partie en cours : on propose de la reprendre (ou de tout recommencer, carnet vidé)
    if (etape > 0) {
      jouer.textContent = 'Reprendre l\'aventure';
      recommencer.hidden = location.hash.length > 1;
    }
    const commencer = (depuisLeDebut, depart = ETAPES[etape]) => {
      if (depuisLeDebut) Indices.effacer(); else partir(depart);
      Musique.demarrer();
      $('titre').classList.add('fini');
      setTimeout(() => { $('titre').hidden = true; Titre.arreter(); }, 650);
      Jeu.demarrer();
      $('aide').hidden = false;
      setTimeout(() => $('aide').classList.add('fini'), 6500);
    };
    jouer.addEventListener('click', () => commencer(etape === 0));
    recommencer.addEventListener('click', () => commencer(true));
    // « Rejouer l'épreuve » dans le carnet : pas d'écran titre, on repart tout de suite au début de l'épreuve ;
    // le son, lui, ne peut démarrer qu'au premier toucher
    if (rejoue !== null) {
      $('titre').hidden = true;
      commencer(false, DEBUTS[rejoue]);
      const reveil = () => Musique.demarrer();
      for (const t of ['touchend', 'pointerup', 'keydown']) addEventListener(t, reveil, { capture: true, passive: true });
    }
  }
  if (document.readyState === 'complete') lancer();
  else addEventListener('load', lancer);
})();
