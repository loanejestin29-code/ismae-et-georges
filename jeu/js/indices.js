// =====================================================================
//  indices.js — le carnet d'indices (un indice par épreuve réussie),
//  l'écran de victoire d'une épreuve et l'annonce de la suite.
//  Les indices gagnés restent en mémoire sur le téléphone (localStorage) ;
//  ajouter #reset à la fin de l'adresse pour vider le carnet.
// =====================================================================
'use strict';

const Indices = (() => {
  const CLE = 'jeu.indices';
  const ORDINAUX = ['PREMIER', 'DEUXIÈME', 'TROISIÈME', 'QUATRIÈME', 'CINQUIÈME', 'SIXIÈME'];
  const $ = (id) => document.getElementById(id);
  let gagnes = [], ouverte = null;
  try { gagnes = JSON.parse(localStorage.getItem(CLE) || '[]').filter((i) => Number.isInteger(i)); } catch (_) { gagnes = []; }

  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(gagnes)); } catch (_) { /* navigation privée */ } }
  function majBouton() {
    $('btn-indices').hidden = !gagnes.length;
    $('nb-indices').textContent = `${gagnes.length}/${CONFIG.indices.length}`;
  }

  // une fenêtre à la fois ; le jeu est en pause tant qu'elle est ouverte
  function ouvrir(id, bouton, fin) {
    ouverte = { id, bouton, fin, t0: performance.now() };
    Jeu.overlay = true;
    if (Jeu.relacher) Jeu.relacher();
    $(id).hidden = false;
    setTimeout(() => $(bouton).focus(), 50);
  }
  function fermer() {
    // on ignore les appuis trop rapides : celui qui fait défiler les dialogues ne ferme pas la fenêtre par erreur
    if (!ouverte || performance.now() - ouverte.t0 < 900) return;
    const { id, fin } = ouverte;
    ouverte = null;
    $(id).hidden = true;
    Jeu.overlay = false;
    if (fin) fin();
  }

  // écran « ÉPREUVE n/6 TERMINÉE ! » puis l'indice rejoint le carnet
  function gagner(i, fin) {
    if (!gagnes.includes(i)) { gagnes.push(i); gagnes.sort((a, b) => a - b); sauver(); }
    const N = CONFIG.indices.length, ind = CONFIG.indices[i];
    $('vic-titre').textContent = `ÉPREUVE ${i + 1}/${N} TERMINÉE !`;
    $('vic-indice').textContent = `${ORDINAUX[i] || ''} INDICE OBTENU !`;
    $('vic-nom').textContent = `Indice n°${i + 1} · ${ind.epreuve}`;
    $('vic-texte').textContent = ind.texte;
    ouvrir('victoire', 'vic-ok', () => {
      majBouton();
      const b = $('btn-indices');
      b.classList.remove('nouveau'); void b.offsetWidth; b.classList.add('nouveau');
      if (fin) fin();
    });
  }

  function carnet() {
    const liste = $('carnet-liste');
    liste.textContent = '';
    CONFIG.indices.forEach((ind, i) => {
      const li = document.createElement('li');
      const ok = gagnes.includes(i);
      li.className = ok ? 'obtenu' : 'cache';
      const nom = document.createElement('span'); nom.className = 'carnet-nom';
      nom.textContent = ok ? `Épreuve ${i + 1} · ${ind.epreuve}` : `Épreuve ${i + 1} · ???`;
      const txt = document.createElement('p'); txt.className = 'carnet-texte';
      txt.textContent = ok ? ind.texte : 'Indice à découvrir…';
      li.append(nom, txt);
      liste.append(li);
    });
    $('carnet-titre').textContent = `Carnet d'indices · ${gagnes.length}/${CONFIG.indices.length}`;
    ouvrir('carnet', 'carnet-ok');
  }

  // fin provisoire de l'aventure : la suite (forêt de Sherwood) n'est pas encore prête
  function suite(fin) { ouvrir('suite', 'suite-ok', fin); }

  function init() {
    if (location.hash === '#reset') { gagnes = []; sauver(); history.replaceState(null, '', location.pathname); }
    majBouton();
    $('btn-indices').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (!ouverte && !Jeu.bloque()) carnet(); });
    for (const id of ['vic-ok', 'carnet-ok', 'suite-ok']) $(id).addEventListener('click', fermer);
    addEventListener('keydown', (e) => {
      if (ouverte) {
        if (['Escape', 'Enter', 'NumpadEnter', 'Space'].includes(e.code)) { e.preventDefault(); fermer(); }
        return;
      }
      if (e.code === 'KeyI' && gagnes.length && !Jeu.bloque()) carnet();
    });
  }

  return { init, gagner, carnet, suite, obtenus: () => gagnes.slice() };
})();
