// =====================================================================
//  config.js — TOUT CE QUI SE PERSONNALISE FACILEMENT EST ICI
//  Modifie les valeurs, enregistre, puis recharge la page du jeu.
//  Les couleurs sont au format '#rrggbb' (ex. '#3a2a22').
// =====================================================================
'use strict';

const CONFIG = {
  // ------------------------------------------------------------------
  //  ISMAE — apparence (à ajuster d'après ton modèle)
  // ------------------------------------------------------------------
  ismae: {
    peau: '#ecb994',          // teint
    cheveux: '#6e4a31',       // brun
    coiffure: 'degrade',      // 'degrade' | 'court' | 'boucles' | 'meche' | 'rase'
    barbe: 'courte',          // 'aucune' | 'courte' | 'pleine'
    couleurBarbe: '#a57859',  // barbe de quelques jours (null = couleur des cheveux)
    lunettes: false,          // true pour ajouter des lunettes
    couleurLunettes: '#2a2233',
    yeux: '#3a62a0',          // bleus
    tenue: 'blouson',         // 'blouson' (cuir ouvert + t-shirt + ceinture) | 'manteau' (avec écharpe)
    veste: '#3b3946',         // blouson en cuir noir
    reflets: '#7c7a92',       // reflets gris sur le cuir
    tshirt: '#24222b',        // t-shirt noir
    ceinture: '#17161d',
    boucle: '#d2d0dc',        // boucle de ceinture argentée
    echarpe: null,            // une couleur (ex. '#c9483b') pour ajouter une écharpe avec la tenue 'manteau'
    pantalon: '#302e39',      // noir
    coupe: 'large',           // 'large' (pantalon ample) | 'droit'
    chaussures: '#25232c',    // baskets noires
    semelles: '#d9d7e2',      // semelles claires
  },

  // ------------------------------------------------------------------
  //  GEORGES — chat entièrement noir (pas de tache blanche)
  // ------------------------------------------------------------------
  georges: {
    pelage: '#25212f',        // noir légèrement bleuté pour rester lisible
    reflet: '#4a4563',        // liseré de lumière sur le dos
    yeux: '#d8e35c',
  },

  // ------------------------------------------------------------------
  //  AMBIANCE
  // ------------------------------------------------------------------
  ambiance: 'soir',           // 'soir' (lampadaires allumés) ou 'jour'
  neige: false,               // true = petits flocons de Noël
  vitesseMarche: 62,          // pixels par seconde
  vitesseCourse: 104,
  distanceGeorges: 17,        // distance à laquelle Georges suit Ismae

  // ------------------------------------------------------------------
  //  TEXTES DES INTERACTIONS (une ligne = une bulle)
  // ------------------------------------------------------------------
  textes: {
    intro: ["Paris, un soir d'hiver.", "Georges a l'air d'avoir envie de se promener…"],
    georges: ["Georges ronronne et se frotte contre ta jambe.", "Il a sans doute faim. Comme toujours."],
    fontaine: ["Une fontaine Wallace. L'eau est glacée,", "mais Georges y trempe quand même une patte."],
    colonne: ["Une colonne Morris couverte d'affiches de spectacles.", "Une affiche annonce un concert de jazz… avec des chats."],
    boulangerie: ["Ça sent le pain chaud et la brioche.", "La boulangère a mis une baguette de côté. Comme d'habitude."],
    fromagerie: ["Une fromagerie. Georges renifle la vitrine avec beaucoup trop d'intérêt."],
    cafe: ["Le café du coin. On entend un accordéon à l'intérieur.", "Une table est libre en terrasse… plus tard, peut-être."],
    terrasse: ["Une chaise de bistrot. Elle est encore tiède."],
    fleuriste: ["Des roses, des anémones et du houx pour Noël.", "Le fleuriste fait un clin d'œil."],
    librairie: ["Une vieille librairie. Les livres sont rangés… à peu près."],
    patisserie: ["Des éclairs, des macarons, une bûche de Noël en vitrine.", "Résister est inutile."],
    antiquaire: ["Un horloger-antiquaire. Toutes les pendules indiquent une heure différente."],
    pharmacie: ["La croix verte de la pharmacie clignote doucement."],
    atelier: ["L'atelier d'un peintre. Une toile inachevée représente… un chat noir ?"],
    superetteVitrine: ["La supérette du quartier. Les portes s'ouvrent toutes seules.", "Avance vers la porte pour entrer."],
    hotel: ["L'Hôtel du Chat Noir. Le portier fait semblant de dormir.", "Georges, lui, semble connaître la maison."],
    sapin: ["Le grand sapin de la place, couvert de guirlandes.", "Georges regarde les boules dorées avec un air très sérieux."],
    porteImmeuble: ["Une lourde porte cochère vert sapin. Elle est fermée."],
    bouquiniste: ["Une boîte de bouquiniste : cartes postales, vieux romans", "et une gravure de chats sur les toits de Paris."],
    banc: ["Un banc public. Georges s'y installerait bien pour la nuit."],
    lampadaire: ["Un réverbère en fonte. Sa lumière est toute dorée."],
    peniche: ["Une péniche amarrée. Il y a des plantes partout sur le pont", "et un chat orange qui dort dans un pot de fleurs."],
    velo: ["Un vieux vélo avec un panier. Parfait pour transporter un chat."],
    linge: ["Du linge qui sèche entre deux fenêtres."],
    poubelles: ["Les poubelles de la cour. Georges fait semblant de ne pas être intéressé."],
    puits: ["Une vieille pompe à eau. Elle grince quand on la touche."],
    boiteLettres: ["Une boîte aux lettres. Quelqu'un attend sûrement une carte de Noël."],
    kiosque: ["Un kiosque à journaux. Les gros titres parlent de neige pour Noël."],
    escalier: ["Un escalier qui descend vers les quais de la Seine."],
    seine: ["La Seine brille sous les lumières de la ville."],
    caisses: ["Des caisses de pommes et de clémentines."],
    voiture: ["Une vieille voiture bordeaux, bien astiquée.", "Il y a des traces de pattes de chat sur le capot. Georges regarde ailleurs."],
    barque: ["Une petite barque amarrée au quai. Elle tangue doucement."],
    coeur: ["Un cœur est gravé dans l'écorce du vieil arbre.", "On peut y lire : « I + ♥ ».", "(Ce message se change dans config.js)"],
    barriereOuest: ["La rue continue au-delà des barrières…", "Ce quartier sera exploré plus tard."],
    barriereEst: ["Des travaux bloquent la rue.", "Une autre aventure attend de ce côté… plus tard."],
    // chats
    chatBlanc: ["Une chatte blanche très distinguée t'observe depuis son balcon.", "Georges fait le beau. Sans succès."],
    chatRoux: ["Un matou roux se prélasse, l'air de régner sur le quartier."],
    chatGris: ["Un chaton gris joue avec une feuille morte."],
    chatTigre: ["Un chat tigré dort profondément. Il ronfle un peu."],
    chatPecheur: ["Un chat pêche dans la Seine avec beaucoup de patience.", "Il n'a encore rien attrapé."],
    chatSiamois: ["Un chat siamois surveille la vitrine. Ou les gâteaux."],
    chatToits: ["Un chat se promène sur les toits, comme un funambule."],
    // supérette
    caissier: ["« Bonsoir ! Les courses, ce sera pour une prochaine fois ? »", "(Les mini-jeux arriveront plus tard.)"],
    rayons: ["Des pâtes, du riz, des conserves… et des croquettes pour chat."],
    frigos: ["Les frigos ronronnent presque aussi fort que Georges."],
    fruits: ["Des clémentines bien orange. C'est bientôt Noël."],
    sortie: ["La sortie donne sur la rue."],
    cliente: ["Une vieille dame compare deux boîtes de sardines depuis dix minutes.", "« Votre chat est très élégant, jeune homme. »"],
    promo: ["Un îlot de chocolats de Noël. Georges essaie de grimper dessus."],
    paniers: ["Une pile de paniers rouges. Juste la bonne taille pour un chat."],
  },
};
