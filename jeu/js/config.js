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
  //  TOM (le meilleur ami, boucher) et LOANE — même style qu'Ismae
  // ------------------------------------------------------------------
  tom: {
    modele: 'tom',             // calot de boucher, veste blanche, tablier rayé
    peau: '#d9a07a',
    cheveux: '#2e2222',
    couleurChapeau: '#f4f2ec', // le calot
    veste: '#efede6', reflets: '#ffffff', zips: '#b8b4c4',
    tablier: '#fbfaf6', rayures: '#3a4a7e',
    pantalon: '#2c2b38', chaussures: '#3a3846', semelles: '#d8d6e0',
  },
  loane: {
    modele: 'loane',           // cheveux longs, manteau rouge, jupe, collants, bottines
    peau: '#f0c4a4',
    cheveux: '#5a3424',
    veste: '#b8323c', reflets: '#d0505a', zips: '#e0646c', // manteau
    tshirt: '#f2e6d0',         // pull crème
    pantalon: '#2e2a3e',       // jupe
    collants: '#3a2c3c',
    chaussures: '#5a3a2a', semelles: '#2e2026',
  },

  // ------------------------------------------------------------------
  //  LES ANIMAUX DE SHERWOOD (épreuve 2) — dessins dans betes.js
  //  peau = pelage, cheveux = crinière / oreilles, couleurBarbe = museau,
  //  couleurLunettes = nez (ou corne), couleurChapeau = chapeau, couronne ou casque
  // ------------------------------------------------------------------
  animaux: {
    roi: { espece: 'roi', peau: '#e0b060', cheveux: '#c8642a', couleurBarbe: '#f6dcb0', couleurLunettes: '#5a2a1a', couleurChapeau: '#f2c230', ruban: '#d8323a', fleur: '#3a6ad8',
      yeux: '#8fd0f4', veste: '#a8283a', reflets: '#c8404e', zips: '#e8b54a', tablier: '#f6f2ea', rayures: '#1d1626', pantalon: '#a8283a', chaussures: '#c89048' },
    garde: { espece: 'garde', peau: '#8a8a98', cheveux: '#6a6a78', couleurBarbe: '#a8a8b6', couleurLunettes: '#efe6cc', couleurChapeau: '#a2aabb', veste: '#6a6e80', reflets: '#8a90a4',
      tshirt: '#a8323a', zips: '#e8b54a', pantalon: '#4a4a5a', chaussures: '#2e2a36', semelles: '#1d1a24' },
    robin: { espece: 'robin', peau: '#d8782e', cheveux: '#4a2414', couleurBarbe: '#f6ead6', couleurLunettes: '#1d1626', couleurChapeau: '#4f8a3a', ruban: '#d8323a',
      veste: '#4f8a3a', reflets: '#6aa84a', zips: '#3a6a2a', ceinture: '#6a4428', pantalon: '#a85a24', chaussures: '#5a3a24', semelles: '#3a2418' },
    marianne: { espece: 'marianne', peau: '#e08a3e', cheveux: '#5a2a14', couleurBarbe: '#fbf0e0', couleurLunettes: '#1d1626', couleurChapeau: '#f4e2a0', fleur: '#ff8ab0',
      veste: '#8a5ac8', reflets: '#a87ae0', zips: '#6a3aa8', pantalon: '#8a5ac8', chaussures: '#5a3a8a' },
    sherif: { espece: 'sherif', peau: '#8a8494', cheveux: '#5a5462', couleurBarbe: '#c8c2cc', couleurLunettes: '#1d1626', couleurChapeau: '#6a4428', ruban: '#e8b54a',
      veste: '#5a4a3a', reflets: '#7a6a54', zips: '#3a2e24', pantalon: '#3a3440', chaussures: '#2a2026', semelles: '#1d1626' },
    petitJean: { espece: 'petitJean', peau: '#8a5a34', cheveux: '#5a3a22', couleurBarbe: '#d8b088', couleurLunettes: '#1d1626', veste: '#5a6a3a', reflets: '#6a7a4a',
      zips: '#4a5a2a', tshirt: '#d8c8a0', pantalon: '#6a4a2e', chaussures: '#4a3020' },
    tuck: { espece: 'tuck', peau: '#9a8c78', cheveux: '#5a4a42', couleurBarbe: '#f4f0e8', couleurLunettes: '#1d1626', veste: '#7a5a3a', reflets: '#94704a', zips: '#5a4028',
      ceinture: '#e8d8a8', pantalon: '#7a5a3a', chaussures: '#4a3020' },
  },
  // petits figurants : pelage, habit, chapeau, bec, crête…
  figurants: {
    lapin1: { pelage: '#c8b8a8', habit: '#c8484a' },
    lapin2: { pelage: '#9a8070', habit: '#4a7ab8' },
    lapin3: { pelage: '#ece6dc', habit: '#e8b54a' },
    lapereau: { pelage: '#b89a80', habit: '#6aa84a', chapeau: '#4f8a3a', bec: '#d8323a', bois: '#a8743e' },
    gertrude: { pelage: '#f4efe6', habit: '#5a7ac8', chapeau: '#f6f2ea', bec: '#e8a83a', crete: '#d8323a' },
    tortue: { pelage: '#b8c87a', habit: '#6a8a3a', motif: '#94b05a' },
    adam: { pelage: '#e8a83a', habit: '#4f8a3a', bec: '#f2c230', crete: '#d8323a', bois: '#8a5a2e', bois2: '#d8a058' },
  },

  // ------------------------------------------------------------------
  //  CARNET D'INDICES — un indice par épreuve réussie (6 en tout)
  //  Ne jamais y écrire la destination !
  // ------------------------------------------------------------------
  indices: [
    { epreuve: 'Le bisou magique', texte: '(Premier indice à écrire ici)' },
    { epreuve: 'Le tournoi de Sherwood', texte: '(Deuxième indice à écrire ici)' },
    { epreuve: 'Le bonhomme de neige', texte: '' },
    { epreuve: '???', texte: '' },
    { epreuve: '???', texte: '' },
    { epreuve: '???', texte: '' },
  ],

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
  vitesseLoane: 96,           // course-poursuite au Carrefour : Ismae court à 104, Loane un peu moins vite
  // tournoi de tir à l'arc (épreuve 2) : nombre de flèches et score du shérif à battre (il faut faire plus)
  tournoi: { fleches: 5, scoreSherif: 29 },

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
    caissiere: { nom: 'La caissière', couleur: '#9ad0a0' },
    client: { nom: 'Un client', couleur: '#c8b8a0' },
    tom: { nom: 'Tom', couleur: '#e8906a', bip: 540 },
    loane: { nom: 'Loane', couleur: '#ff8fb8', bip: 780 },
    // forêt de Sherwood
    roi: { nom: 'Le roi Jean', couleur: '#e8b54a', bip: 720 },
    sire: { nom: 'Triste Sire', couleur: '#9ad070', bip: 860 },
    garde: { nom: 'Un garde', couleur: '#a2aabb', bip: 240 },
    robin: { nom: 'Robin des Bois', couleur: '#7ac85a', bip: 600 },
    sherif: { nom: 'Le shérif', couleur: '#c8a070', bip: 300 },
    petitJean: { nom: 'Petit Jean', couleur: '#c8905a', bip: 220 },
    tuck: { nom: 'Frère Tuck', couleur: '#c8b090', bip: 320 },
    adam: { nom: 'Adam de la Halle', couleur: '#f2c230', bip: 920 },
    lapereau: { nom: 'Un lapereau', couleur: '#d8b8a0', bip: 1040 },
    marianne: { nom: 'Marianne', couleur: '#c8a0f0', bip: 760 },
    gertrude: { nom: 'Dame Gertrude', couleur: '#9ab0f0', bip: 840 },
    tortue: { nom: 'Une tortue', couleur: '#b8c87a', bip: 180 },
    lapin: { nom: 'Un lapin', couleur: '#e0c8b8', bip: 980 },
  },

  // ------------------------------------------------------------------
  //  ÉPREUVE 1 — LE BISOU MAGIQUE (au Carrefour, voir epreuve-bisou.js)
  // ------------------------------------------------------------------
  bisou: {
    retrouvailles: [
      ['tom', 'Ismae ?! Qu\'est-ce que tu fais là ?'],
      ['ismae', 'My besto friendo ! Je te cherche depuis une heure.'],
      ['tom', 'Une heure ? C\'est juste derrière la porte verte.'],
      ['ismae', 'Fermée à clé. J\'ai dû retrouver Colette.'],
      ['tom', 'Colette ? Elle t\'a raconté toute sa vie, j\'imagine.'],
      ['ismae', 'Deux fois.'],
      ['tom', 'Bon, tu tombes bien, collègue : j\'ai dix rôtis à ficeler. Passe derrière !'],
    ],
    tablier: ['Ismae enfile un tablier et attrape un couteau.'],
    travail: [['tom', 'Doucement, hein. Rien ne presse.']],
    aie: [['ismae', 'Aïe, je me suis coupé le doigt !']],
    appel: [['ismae', 'Loane ! Viens me faire un bisou magique !']],
    reponse: [['loane', 'Viens le chercher ! 😏']],
    victoire: [
      ['loane', 'Bon, t\'as réussi à m\'attraper !'],
      ['loane', 'Tu viens de réussir ta première épreuve !'],
      ['loane', 'Pour découvrir ton cadeau de Noël, tu vas devoir réussir six épreuves. À chaque victoire, tu gagneras un indice.'],
    ],
    apres: [['ismae', 'Bon. Allons retrouver Georges, près de l\'entrée.']],
    georges: ['Georges renifle le doigt d\'Ismae.', 'Le bisou magique a l\'air d\'avoir marché.'],
  },

  // ------------------------------------------------------------------
  //  ÉPREUVE 2 — LE TOURNOI DE SHERWOOD (voir epreuve-sherwood.js et tir-arc.js)
  // ------------------------------------------------------------------
  sherwood: {
    arrivee: [
      ['ismae', 'Euh… depuis quand il y a une forêt derrière le Carrefour ?'],
      'Georges renifle l\'air. Ça sent la mousse, le feu de bois… et l\'aventure.',
      ['ismae', 'Bon. Deuxième épreuve, j\'imagine. On y va, Georges.'],
    ],
    fanfare: ['Taratata ! Des trompettes résonnent entre les arbres.'],
    capture: [
      ['sire', 'Place ! Place à Sa Majesssté le roi Jean !'],
      ['roi', 'Tiens, tiens… Un promeneur dans MA forêt ?'],
      ['roi', 'Et qu\'est-ce que c\'est que ce petit… Oh ! Un chat noir !'],
      ['roi', 'Qu\'il est mignon ! Il ira divinement bien à côté de mon trône.'],
      ['ismae', 'Il s\'appelle Georges. Et il reste avec moi.'],
      ['roi', 'Un roi ne demande pas. Un roi PREND. Gardes !'],
    ],
    enCage: [
      ['ismae', 'Hé ! Rendez-le-moi !'],
      ['roi', 'Tu veux ton chat ? Gagne mon grand tournoi de tir à l\'arc !'],
      ['roi', 'Il a lieu dans la grande clairière, au nord. Mais je te préviens…'],
      ['roi', '…personne ne bat jamais mon champion. Ha ! Ha ! Ha !'],
      ['sire', 'Ssssi drôle, Sire. Ssssi drôle.'],
    ],
    depart: [
      ['ismae', 'Tiens bon, Georges. J\'arrive.'],
      'Le tournoi a lieu dans la grande clairière, tout au nord de la forêt.',
    ],
    tournoi: [
      ['sire', 'Messsieurs, mesdames ! Le grand tournoi de Sherwood va commencer !'],
      ['roi', 'Ah, te voilà. Mon champion, le shérif de Nottingham, a fait 29 points.'],
      ['sherif', 'Vingt-neuf ! Un record. Personne ne fait mieux.'],
      ['roi', 'Cinq flèches. Fais plus de 29 points et ton chat est libre.'],
      ['ismae', 'Et si je perds ?'],
      ['roi', 'Alors il deviendra le chat officiel du royaume. Avec une petite couronne. Plus petite que la mienne.'],
      ['sire', 'Le viseur bouge tout seul. Tire quand la jauge passe dans le rouge… et quand le viseur est bien au centre !'],
    ],
    rate: [
      ['roi', 'Ha ! Ha ! Raté ! Le chat est à moi !'],
      ['sire', 'Sire… le public gronde. Vous devriez lui laisser une autre chance.'],
      ['roi', 'Bon, bon. Je suis un roi généreux. Recommence !'],
    ],
    gagne: [['sire', 'Ssss… sssensationnel ! Il a battu le shérif !']],
    colere: [['roi', 'QUOI ?! C\'est impossible ! Il a triché ! Shérif, faites quelque chose !'], ['sherif', 'Euh… bravo ?']],
    boude: [['roi', 'Pff. Puisque c\'est comme ça, je boude.']],
    pouce: ['Le roi Jean se met à sucer son pouce…'],
    pleure: [['roi', 'Mamaaaaan ! 😭'], ['roi', 'Personne ne m\'aime ! Même pas le chat !'], ['sire', 'Allons, allons, Sire… Ce n\'était qu\'un chat.'], ['roi', 'Snif… Gardes ! Rendez-lui son… snif… son chat.']],
    retrouvailles: [['ismae', 'Georges ! Tu m\'as manqué, mon vieux.'], 'Georges se frotte contre ses jambes en ronronnant très fort.'],
    robin: [
      ['robin', 'Joli tir, l\'ami ! Même moi, j\'aurais eu du mal à faire mieux.'],
      ['robin', 'Enfin… un tout petit peu de mal.'],
      ['ismae', 'Robin des Bois ?!'],
      ['robin', 'En personne. Merci d\'avoir donné une leçon au roi Jean.'],
      ['robin', 'Une demoiselle en manteau rouge m\'a demandé de te remettre ceci.'],
    ],
    apres: [
      ['robin', 'Ta prochaine épreuve t\'attend au-delà des montagnes enneigées.'],
      ['robin', 'Prends le chemin du nord-ouest, derrière les tentes. Et prends soin de ton chat !'],
    ],
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
      apres: [['livreur', 'La supérette de la placette ? J\'y livre tous les matins !'], ['livreur', 'Mais le soir, la porte verte est fermée à clé. C\'est Colette qui a la clé.'], ['livreur', 'Elle se promène en bas des quais, au bord de l\'eau, près des bateaux. Grand chapeau violet.']],
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
      apres: [['peintre', 'La placette des Matous ? Je la peins souvent, avec ses musiciens.'], ['peintre', 'Mais on n\'y entre pas comme ça : il faut la clé de Colette. Elle se promène au bord de l\'eau.']],
    },
    // au Carrefour : avant = avant l'épreuve, apres = une fois Loane attrapée
    caissier: {
      avant: [['caissier', 'Bonsoir ! Tom ? À la boucherie, tout au fond.'], ['caissier', 'Avec tous ces rayons, on s\'y perd vite. Suis l\'odeur du saucisson.']],
      apres: [['caissier', 'C\'était quoi, cette course dans les rayons ?'], ['caissier', 'Ici, d\'habitude, on ne court qu\'après les promos.']],
    },
    caissiere: {
      avant: [['caissiere', 'Ma caisse est ouverte ! Enfin… dès que j\'aurai fini mon café.']],
      apres: [['caissiere', 'Elle court vite, ton amie. Tu devrais faire du sport.']],
    },
    cliente: {
      avant: [['cliente', 'Beurre doux ou demi-sel… Quelle décision, à mon âge.']],
      apres: [['cliente', 'Ah, l\'amour ! De mon temps, on se courait après dans les bals. Pas entre les yaourts.']],
    },
    client: {
      avant: [['client', 'Je cherche des marrons pour la dinde. Rayon introuvable.']],
      apres: [['client', 'Vous avez renversé trois paquets de pâtes. Je dis ça, je dis rien.']],
    },
    tom: {
      avant: [['tom', 'Viens, passe derrière le comptoir !']],
      apres: [['tom', 'Alors, ce doigt ? Il a l\'air d\'aller beaucoup mieux.'], ['tom', 'File ! Je finis les rôtis. Sans toi, ça ira plus vite.']],
    },
    loane: {
      apres: [['loane', 'Georges et moi, on t\'attendait.'], ['loane', 'Ta deuxième épreuve t\'attend dehors. Bonne chance !']],
    },
    // forêt de Sherwood : avant = en arrivant, pendant = Georges est prisonnier, apres = tournoi gagné
    petitJean: {
      avant: [['petitJean', 'Salut, l\'étranger ! Une petite soupe aux carottes ? Non ? Tant pis, plus pour moi.']],
      pendant: [['petitJean', 'Le roi Jean a pris ton chat ? Ce vieux lion vole vraiment tout ce qui bouge.'], ['petitJean', 'Gagne son tournoi, petit. Ça lui fera les pieds.']],
      apres: [['petitJean', 'Il paraît que le roi pleure encore en appelant sa maman. Ha ! Ha !']],
    },
    tuck: {
      avant: [['tuck', 'Chut… Les poissons sont timides, aujourd\'hui.']],
      pendant: [['tuck', 'Le roi Jean a encore frappé… Que le ciel protège ton petit chat.'], ['tuck', 'Le tournoi a lieu dans la grande clairière, au nord. Je prierai pour tes flèches.']],
      apres: [['tuck', 'Un poisson ! Enfin ! Oh… c\'est une botte.']],
    },
    adam: {
      avant: [['adam', 'Bienvenue à Sherwood, voyageur ! Adam de la Halle, ménestrel, pour vous servir.'], ['adam', 'Je chante les exploits de Robin des Bois. Un jour, je chanterai peut-être les tiens !']],
      pendant: [['adam', 'Quelle histoire ! Un chat enlevé par le roi en personne…'], ['adam', 'Voilà de quoi écrire une belle chanson. Encore faut-il qu\'elle finisse bien.']],
      apres: [['adam', 'J\'ai déjà le refrain : « Ismae l\'archer, le roi a pleuré… »'], ['adam', 'Ça rime presque.']],
    },
    lapereau: {
      avant: [['lapereau', 'Regarde, j\'ai un arc comme Robin des Bois !'], ['lapereau', 'Bon, c\'est un bâton avec une ficelle.']],
      pendant: [['lapereau', 'Tu vas faire le tournoi ? Je te donne mon secret !'], ['lapereau', 'Attends que le viseur passe au milieu de la cible… et tire quand la jauge est dans le rouge !']],
      apres: [['lapereau', 'T\'as battu le shérif ! Quand je serai grand, je serai comme toi.'], ['lapereau', 'Ou comme Robin. Je sais pas encore.']],
    },
    tortue: {
      avant: [['tortue', 'Bon… jour… Je… vais… au… tournoi…'], 'Elle est partie il y a trois jours.'],
      apres: [['tortue', 'Le… tournoi… est… déjà… fini… ?'], ['tortue', 'Zut.']],
    },
    marianne: {
      avant: [['marianne', 'Le tournoi va bientôt commencer. Le roi Jean a encore choisi le shérif comme champion…']],
      pendant: [['marianne', 'Bonne chance ! Robin dit qu\'un bon archer tire avec le cœur.']],
      apres: [['marianne', 'Robin avait raison : tu tires avec le cœur.'], ['marianne', 'Et ton chat a bien de la chance de t\'avoir.']],
    },
    gertrude: {
      avant: [['gertrude', 'On attend le roi. Comme d\'habitude, il est en retard.']],
      pendant: [['gertrude', 'Allez, jeune homme ! Montre à ce vieux lion de quel bois tu te chauffes !']],
      apres: [['gertrude', 'Quel tir ! J\'en ai perdu trois plumes d\'émotion.']],
    },
    lapin: {
      avant: [['lapin', 'Il paraît que le roi Jean arrive bientôt. On a apporté des carottes.']],
      pendant: [['lapin', 'Le shérif a triché, j\'en suis sûr. Il a tiré à deux pas de la cible.']],
      apres: [['lapin', 'Hourra pour l\'archer au chat noir !']],
    },
    roi: {
      pendant: [['roi', 'Le tournoi, c\'est là-bas, sur le pas de tir. Dépêche-toi, mon nouveau chat s\'impatiente.']],
      apres: [['roi', 'Snif… Va-t\'en. Je boude.']],
    },
    sire: {
      pendant: [['sire', 'Avancez-vous sssur le pas de tir, jeune homme. Le roi n\'aime pas attendre.']],
      apres: [['sire', 'Ne vous inquiétez pas, il ssse remettra. Il ssse remet toujours.']],
    },
    sherif: {
      avant: [['sherif', 'Vingt-neuf points ! Personne ne battra jamais mon record.']],
      pendant: [['sherif', 'Vingt-neuf points. Bonne chance pour faire mieux, mon garçon.']],
      apres: [['sherif', 'Vingt-neuf points, c\'était quand même un record. Avant toi.']],
    },
    garde: {
      pendant: [['garde', 'Circulez ! Le chat est sous la garde du roi.']],
      apres: [['garde', 'Pas de rancune, hein. On obéit aux ordres.']],
    },
    robin: {
      apres: [['robin', 'Les montagnes enneigées, c\'est par le chemin du nord-ouest, derrière les tentes. Bonne route !']],
    },
  },

  // ------------------------------------------------------------------
  //  TEXTES DES OBJETS (facultatifs : ils récompensent l'exploration)
  // ------------------------------------------------------------------
  textes: {
    georges: ['Georges ronronne.', 'Il a sûrement faim. Comme toujours.'],
    georgesPoursuite: ['Georges est bien trop occupé à suivre les chatons.'],
    entreeSuperette: [['ismae', 'Georges, tu m\'attends ici. Pas de chats à la boucherie.'], 'Georges s\'assoit près de l\'entrée, l\'air profondément vexé.', ['ismae', 'Tom doit être à la boucherie, tout au fond.']],
    georgesAttend: ['Georges monte la garde près de l\'entrée.', 'Il boude encore un peu.'],
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
    rayons: ['Des pâtes, du riz, des conserves… et des croquettes.'],
    frigos: ['Yaourts, fromages, beurre… Les frigos ronronnent presque aussi fort que Georges.'],
    surgeles: ['Des glaces en plein hiver. Courageux.'],
    fruits: ['Des clémentines bien orange. C\'est bientôt Noël.'],
    promo: ['Une montagne de chocolats de Noël autour du sapin.', 'Tout en haut, une boîte en forme de cœur.'],
    paniers: ['Des paniers rouges. Juste la bonne taille pour un chat.'],
    boucherie: ['Côtes de bœuf, saucisses, rôtis ficelés… La vitrine de Tom est impeccable.'],
    caisseFermee: ['« Caisse fermée ». Sauf pour les câlins, visiblement.'],
    sortie: ['La sortie donne sur la placette.'],
    sortieBloquee: ['Pas question de partir : Loane court encore quelque part dans les rayons !'],
    // forêt de Sherwood
    georgesCage: ['Georges miaule à travers les barreaux.', 'Il a l\'air plus vexé qu\'effrayé.'],
    panneauForet: ['« Forêt de Sherwood »', 'Quelqu\'un a ajouté au couteau : « Le roi Jean est un voleur ».'],
    retourImpossible: ['Le chemin du retour a disparu derrière les arbres.', ['ismae', 'Bon. Pas de demi-tour, alors.']],
    coeurRM: ['Un cœur gravé dans l\'écorce : « R + M ».'],
    avisRecherche: ['« RECHERCHÉ : Robin des Bois. Récompense : un sac d\'or. Signé : le roi Jean. »', 'Le portrait ne lui ressemble pas du tout. Exprès, sans doute.'],
    feuDeCamp: ['Un feu de camp qui crépite. Dans la marmite, une soupe aux carottes.'],
    troncCreux: ['Un tronc creux. Parfait pour une cachette… ou pour une sieste.'],
    champignons: ['Un cercle de champignons. On dit qu\'il ne faut jamais marcher dedans.'],
    ruche: ['Une ruche bourdonnante.', 'Quelqu\'un s\'est déjà servi en miel : il reste des traces de grosses pattes.'],
    terrier: ['Un terrier. Quelqu\'un ronfle à l\'intérieur.'],
    flecheArbre: ['Une flèche plantée dans un chêne, avec un petit mot :', '« Rendez-vous au tournoi. — R. »'],
    coffre: ['Un vieux coffre, vide. Il ne reste qu\'une pièce et une plume verte.', 'Robin est passé par là.'],
    ruisseau: ['L\'eau est claire et glacée. Des petits poissons se cachent sous les pierres.'],
    pontBois: ['Un petit pont de bois. Le ruisseau chante en dessous.'],
    fleursSauvages: ['Des fleurs sauvages. Elles sentent le printemps, même en plein hiver.'],
    poteau: ['↑ Tournoi   ← Nottingham   → Les champs', 'Au dos, à la craie : « Robin était là ».'],
    miniCible: ['Une toute petite cible. Les flèches sont plantées… un peu partout autour.'],
    cible: ['Une cible en paille. Elle en a vu passer, des flèches.'],
    tribune: ['La tribune royale. Le trône est trop grand pour le roi. Comme sa couronne.'],
    tente: ['Une tente rayée. Ça sent la tarte aux pommes.'],
    gradins: ['Les gradins. Le public a apporté des carottes pour l\'entracte.'],
    montagnes: ['« Montagnes enneigées »', 'Il fait déjà plus froid par ici.'],
    sansGeorges: [['ismae', 'Pas sans Georges.']],
    tirFini: ['Le tournoi est terminé. Les cibles se reposent.'],
  },
};
CONFIG.personnages.cliente = { nom: 'Une cliente', couleur: '#e7a0c8' };
