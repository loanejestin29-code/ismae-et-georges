// =====================================================================
//  config.js — TOUT CE QUI SE PERSONNALISE FACILEMENT EST ICI
//  Les couleurs sont au format '#rrggbb' (ex. '#3a2a22').
//
//  Dialogues : une ligne simple = une bulle de narration ;
//  ['qui', 'texte'] = une réplique dite par un personnage (voir PERSONNAGES).
//  Ne jamais écrire le nom de la ville de destination : c'est une surprise !
// =====================================================================
'use strict';

const CONFIG = {
  // ------------------------------------------------------------------
  //  ISMAE — apparence
  // ------------------------------------------------------------------
  ismae: {
    modele: 'inspire',        // petits yeux, pas de bouche, silhouette fine (dessin dans characters.js)
    peau: '#e6b08a',          // teint
    cheveux: '#6b4631',       // brun, en bataille
    tenue: 'blouson',         // perfecto ouvert sur un t-shirt
    veste: '#2b2a33',         // cuir noir
    reflets: '#46455a',       // reflets sur le cuir
    zips: '#a9a8b8',          // zips argentés
    tshirt: '#1c1b22',
    pantalon: '#2a2931',      // pantalon large
    chaussures: '#8e8c9c',    // baskets grises…
    semelles: '#eeedf4',      // …à semelle blanche
  },

  // ------------------------------------------------------------------
  //  GEORGES — chat entièrement noir (pas de tache blanche)
  // ------------------------------------------------------------------
  georges: {
    pelage: '#25212f',
    reflet: '#4a4563',
    yeux: '#d8e35c',
  },

  // ------------------------------------------------------------------
  //  AMBIANCE ET RÉGLAGES
  // ------------------------------------------------------------------
  ambiance: 'soir',           // 'soir' (lampadaires allumés) ou 'jour'
  neige: true,                // petits flocons de Noël
  musique: true,              // musique jazz (le bouton ♪ en jeu la coupe aussi)
  volumeMusique: 0.55,
  vitesseMarche: 62,          // pixels par seconde
  vitesseCourse: 104,
  distanceGeorges: 17,        // distance à laquelle Georges suit Ismae
  vitesseChatons: 120,        // vitesse de Georges pendant la poursuite (plus rapide qu'Ismae qui court ; les chatons encore plus)

  // ------------------------------------------------------------------
  //  PERSONNAGES QUI PARLENT (nom affiché + couleur de l'étiquette)
  // ------------------------------------------------------------------
  personnages: {
    ismae: { nom: 'Ismae', couleur: '#7fa6e0' },
    georges: { nom: 'Georges', couleur: '#d8e35c' },
    duchesse: { nom: 'Duchesse', couleur: '#f4b8c8' },
    marie: { nom: 'Marie', couleur: '#ff9cc2' },
    toulouse: { nom: 'Toulouse', couleur: '#f2a24e' },
    berlioz: { nom: 'Berlioz', couleur: '#9fb0e8' },
    charlie: { nom: 'Charlie', couleur: '#e8b54a' },
    pianiste: { nom: 'Mimi', couleur: '#f0dcb0' },
    contrebasse: { nom: 'Gros Léon', couleur: '#f09a50' },
    batteur: { nom: 'Petit Pois', couleur: '#b8bcd0' },
    clarinette: { nom: 'Monsieur Noé', couleur: '#e8e8f0' },
    boulangere: { nom: 'Mme Brioche', couleur: '#f2c88a' },
    livreur: { nom: 'Gaston', couleur: '#9ad0a0' },
    colette: { nom: 'Colette', couleur: '#e7a0c8' },
    fernand: { nom: 'M. Fernand', couleur: '#c8b8a0' },
    peintre: { nom: 'Le peintre', couleur: '#e0a070' },
    caissier: { nom: 'Le caissier', couleur: '#7fa6e0' },
  },

  // ------------------------------------------------------------------
  //  INTRODUCTION — rencontre avec Duchesse et les chatons
  //  (les animations se déclenchent entre les répliques, voir scenes.js)
  // ------------------------------------------------------------------
  rencontre: {
    accueil: [
      ['duchesse', 'Oh ! Je vois que nous avons un nouvel ami !'],
      ['marie', 'Il est plutôt mignon, ce petit chat noir !'],
      ['toulouse', 'Attendez, je vais lui apprendre quelque chose !'],
    ],
    apresToulouse: [['toulouse', 'Le dos rond ! À toi, le nouveau.']],
    apresGeorges: [
      ['berlioz', 'Ha ha ha ! Il a fait le dos… plat !'],
      ['marie', 'Berlioz ! Sois gentil.'],
      ['ismae', 'Il débute. Dites… vous n\'auriez pas vu Tom, par hasard ?'],
      ['duchesse', 'Tom ? Il me semble l\'avoir vu partir travailler ce matin.'],
      ['toulouse', 'Je l\'ai vu entrer dans une petite boutique au logo bleu et rouge, sur une placette cachée… là où les chats jouent du jazz !'],
      ['berlioz', 'Cachée où, d\'abord ? Moi, j\'ai jamais trouvé.'],
      ['duchesse', 'Allons, les enfants. Laissons ce jeune homme à ses recherches.'],
    ],
  },

  // ------------------------------------------------------------------
  //  RÉPLIQUES DES PERSONNAGES
  //  avant = avant la rencontre avec Duchesse, apres = une fois la piste de Tom connue
  // ------------------------------------------------------------------
  repliques: {
    duchesse: { apres: [['duchesse', 'La placette des musiciens ? Elle est bien cachée, mon grand.'], ['duchesse', 'Demande aux gens du quartier : ils y passent tous les jours.']] },
    marie: { apres: [['marie', 'Georges, reviens jouer quand tu veux !']] },
    toulouse: { apres: [['toulouse', 'Je m\'entraîne encore. Fffft !']] },
    berlioz: { apres: [['berlioz', 'Le dos plat… Je la ressortirai, celle-là.']] },
    charlie: {
      avant: [['charlie', 'Yeah ! Ce soir, la rue swingue, mon pote !'], ['charlie', 'Approche, les matous ne mordent pas. Enfin, pas trop.']],
      apres: [['charlie', 'Tom ? Le gars qui fredonne faux en allant bosser ?'], ['charlie', 'Sa boutique, c\'est juste derrière notre scène. Le logo bleu et rouge. Yeah !']],
    },
    pianiste: { avant: [['pianiste', 'Do, mi, sol… et un petit miaou pour finir.']] },
    contrebasse: { avant: [['contrebasse', 'Moi, je tiens le rythme. Le reste, c\'est du détail.']] },
    batteur: { avant: [['batteur', 'Tchiki-tchiki-boum ! Pardon, je m\'emporte.']] },
    clarinette: { avant: [['clarinette', 'Chut… mon solo arrive dans huit mesures.']] },
    boulangere: {
      avant: [['boulangere', 'Bonsoir mon grand ! Il est tard pour les croissants, hein.']],
      apres: [['boulangere', 'Tom ? Il passe chaque matin prendre un croissant…'], ['boulangere', '…puis il disparaît derrière la grande porte verte, tout au bout de la rue, à côté du club de jazz.']],
    },
    livreur: {
      avant: [['livreur', 'Attention, ça passe ! Livraison urgente de baguettes !']],
      apres: [['livreur', 'La supérette de la placette ? J\'y livre tous les matins !'], ['livreur', 'Mais le soir, la porte verte est fermée à clé. C\'est Colette qui a la clé.'], ['livreur', 'Elle se promène sur le quai, avec son grand chapeau violet.']],
    },
    colette: {
      avant: [['colette', 'Quel joli chat noir ! Il s\'appelle comment ?'], ['ismae', 'Georges.'], ['colette', 'Georges ! Ça lui va à merveille.']],
      apres: [['colette', 'Tom ? Le garçon qui fredonne faux ? Il travaille sur la placette des Matous.'], ['colette', 'On y entre par la grande porte verte, au bout de la rue. Le soir, elle est fermée…'], ['colette', '…mais c\'est moi qui ai la clé ! Tiens, je te la prête.'], 'Colette te tend une vieille clé en fer.', ['ismae', 'Merci, Colette !']],
      cle: [['colette', 'La porte verte, mon grand : tout au bout de la rue, à côté du club de jazz.']],
    },
    fernand: {
      avant: [['fernand', 'Trois chatons viennent de filer vers la ruelle de l\'hôtel.'], ['fernand', 'À mon âge, je ne cours plus après personne.']],
      apres: [['fernand', 'Tom ? Connais pas.'], ['fernand', 'Mais ce jazz… il vient de derrière les toits, tout au bout de la rue. Suis la musique.']],
    },
    peintre: {
      avant: [['peintre', 'Je peins des chats depuis vingt ans.'], ['peintre', 'Le tien a de l\'allure… mais il ne tient pas la pose.']],
      apres: [['peintre', 'La placette des Matous ? Je la peins souvent, avec ses musiciens.'], ['peintre', 'Mais on n\'y entre pas comme ça : il faut la clé de Colette.']],
    },
    caissier: { avant: [['caissier', 'Bonsoir ! Tom ? Il était là il y a deux minutes…'], ['caissier', 'Avec tous ces rayons, on se perd vite, ici.']] },
  },

  // ------------------------------------------------------------------
  //  TEXTES DES OBJETS (facultatifs : ils récompensent l'exploration)
  // ------------------------------------------------------------------
  textes: {
    georges: ['Georges ronronne.', 'Il a sûrement faim. Comme toujours.'],
    georgesPoursuite: ['Georges est bien trop occupé à suivre les chatons.'],
    entreeSuperette: [['ismae', 'Tom doit être quelque part dans les rayons…']],
    fontaine: ['Georges boit une gorgée… puis secoue la patte, vexé. L\'eau est glacée.'],
    colonne: ['« Grand concert de jazz — Les Matous Swing — ce soir ! »', 'En bas, quelqu\'un a ajouté au crayon : « placette des Matous, derrière la porte verte ».'],
    porcheFerme: ['Une grande porte cochère verte, fermée à clé.', 'De l\'autre côté… on dirait du jazz.'],
    porcheFermeTom: [['ismae', 'Le jazz vient de derrière cette porte…'], 'Elle est fermée à clé. Quelqu\'un dans le quartier doit bien avoir la clé.'],
    porcheOuverture: ['Ismae tourne la vieille clé de Colette dans la serrure…', 'Clac ! La porte verte s\'ouvre en grinçant.'],
    porcheOuvert: ['La porte verte est grande ouverte. Le jazz résonne dans le passage.'],
    residence: ['Un vieil immeuble aux volets verts.', 'Au premier, quelqu\'un tape du pied en rythme.'],
    affiche: ['Une affiche de concert. « Jazz — ce soir — entrée libre pour les chats ».'],
    sapin: ['Un sapin couvert de guirlandes.', 'Georges fixe une boule dorée. Il prépare quelque chose.'],
    scene: ['Une petite scène, des guirlandes, cinq musiciens à moustaches.', 'Le public : quatre pigeons et un sapin.'],
    superetteVitrine: ['Des fruits, des pâtes… et des croquettes en promo. Georges approuve.'],
    superetteVitrineTom: [['ismae', 'Le logo bleu et rouge… C\'est sûrement ici que travaille Tom !']],
    jazzclub: ['Le club de jazz. « Fermé ce soir. »', 'Les musiciens jouent dehors, quelque part derrière les toits.'],
    cafe: ['Ça sent le café et le chocolat chaud.', 'Quelqu\'un fredonne à l\'intérieur. Faux.'],
    terrasse: ['Une table libre en terrasse. Plus tard, avec un chocolat chaud.'],
    fleuriste: ['Des roses, du houx, du gui…', 'Georges éternue. Allergique au gui, visiblement.'],
    boulangerie: ['Odeur de croissants chauds. Georges colle sa truffe à la vitrine.'],
    fromagerie: ['Georges renifle la vitrine avec un intérêt très suspect.'],
    librairie: ['En vitrine : « Comment éduquer son chat ». Georges détourne le regard.'],
    hotel: ['Un hôtel chic. Le portier fait semblant de dormir.'],
    patisserie: ['Des éclairs, des macarons, une bûche de Noël…', 'Résister est inutile. Heureusement, c\'est fermé.'],
    antiquaire: ['Toutes les pendules indiquent une heure différente. Ambiance.'],
    pharmacie: ['La croix verte clignote. Rien de cassé ce soir, espérons.'],
    atelier: ['Sur une toile : un chat noir qui ressemble beaucoup à Georges.'],
    velo: ['Un vélo avec un panier. Georges y grimpe… et en redescend aussitôt.'],
    voiture: ['Une vieille voiture bordeaux.', 'Des traces de pattes sur le capot. Georges regarde ailleurs.'],
    kiosque: ['Gros titre du soir : « Mystérieux concert de chats dans le quartier ! »'],
    bouquiniste: ['Des cartes postales, des vieux romans… et une gravure de chats sur les toits.'],
    banc: ['Un banc. Georges s\'y installerait bien pour la nuit.'],
    peniche: ['Une péniche couverte de plantes.', 'Un chat orange dort dans un pot de géraniums. Le rêve.'],
    barque: ['Une petite barque qui tangue. Georges refuse catégoriquement de monter.'],
    fleuve: ['L\'eau scintille sous les lampadaires.'],
    linge: ['Une chaussette rouge sèche toute seule au milieu des draps. Mystère.'],
    poubelles: ['Georges fait semblant de ne pas être intéressé.'],
    puits: ['Une vieille pompe. Elle grince comme un chat de mauvaise humeur.'],
    coeur: ['Un cœur est gravé dans l\'écorce : « I + ♥ ».'],
    barriere: ['La rue est barrée par des travaux. On reviendra plus tard.'],
    chatFenetre: ['Un chat te regarde depuis sa fenêtre. Il a l\'air de te juger.'],
    chatToits: ['Là-haut, un chat se promène sur les toits comme un funambule.'],
    chatPecheur: ['Un chat pêche avec beaucoup de patience. Il n\'a encore rien attrapé.'],
    chatTigre: ['Un chat tigré ronfle sur le banc. Chut.'],
    chatGris: ['Un chaton gris se bat contre une feuille morte. Il perd.'],
    // supérette
    rayons: ['Des pâtes, du riz, des conserves… et des croquettes. Georges insiste.'],
    frigos: ['Les frigos ronronnent presque aussi fort que Georges.'],
    fruits: ['Des clémentines bien orange. C\'est bientôt Noël.'],
    promo: ['Un îlot de chocolats de Noël. Georges tente l\'escalade.'],
    paniers: ['Des paniers rouges. Juste la bonne taille pour un chat.'],
    cliente: [['cliente', 'Votre chat est très élégant, jeune homme.']],
    sortie: ['La sortie donne sur la rue.'],
  },
};
CONFIG.personnages.cliente = { nom: 'Une cliente', couleur: '#e7a0c8' };
