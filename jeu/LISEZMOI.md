# Ismae et Georges — prototype (zone 1 : la rue parisienne)

Un petit jeu d'aventure en pixel art, vue de dessus en trois quarts, pensé pour se jouer sur
iPhone. Aucune image externe : tout le décor et les personnages sont dessinés pixel par pixel par
le code au chargement.

## Ce que contient le prototype

- **La rue** : façades haussmanniennes (balcons en fer forgé, mansardes en zinc, lucarnes,
  cheminées qui fument), boutiques (fromagerie, café avec terrasse, fleuriste, supérette,
  boulangerie, librairie, hôtel, pâtisserie, antiquaire), réverbères allumés, rails de tramway,
  une voiture ancienne.
- **Plusieurs chemins et recoins** : la petite place avec le grand sapin, une ruelle vers une
  cour intérieure (linge qui sèche, pompe, chaton), une ruelle vers un jardin secret (arbre avec
  un cœur gravé), le quai haut (platanes illuminés, fontaine Wallace, kiosque, bouquinistes), deux
  escaliers vers le quai bas (péniche, barque, chat qui pêche).
- **Des chats partout** : sur un balcon, sur un auvent, sur les toits, dans la cour, au jardin,
  au bord de l'eau… et des pigeons qui s'envolent quand on s'approche.
- **Georges** suit Ismae en marchant exactement dans ses pas, s'assoit quand il s'arrête,
  puis finit par se coucher et dormir s'il attend trop longtemps.
- **La supérette** (logo seul, sans texte) : les portes s'ouvrent quand Ismae approche ; en
  avançant dedans, on passe à la **zone 2 (intérieur)**. On ressort par la porte du bas.

## Tester sur l'iPhone

Le jeu est en ligne sur **https://ismae-et-georges.vercel.app** (bouton « Jouer »), ou
directement sur **https://ismae-et-georges.vercel.app/jeu/**. Pas besoin de compte pour l'ouvrir.

Pour l'avoir comme une appli : ouvre `…/jeu/` dans Safari, touche le bouton Partager, puis
« Sur l'écran d'accueil ». L'icône de Georges apparaît, et le jeu s'ouvre en plein écran.

À chaque modification, je pousse sur GitHub et Vercel met le site à jour tout seul, en général
en moins d'une minute : il suffit de relancer le jeu sur le téléphone.

Le jeu se joue **à l'horizontale**. À la verticale, un écran « Tourne ton téléphone » s'affiche
et le jeu se met en pause ; il reprend dès qu'on remet le téléphone à l'horizontale.

| Action | Geste |
| --- | --- |
| Marcher | pouce gauche : le poser sur la partie gauche de l'écran et le faire glisser |
| Courir | bouton **Courir** (appuyer une fois pour activer ou désactiver) |
| Regarder, parler, caresser un chat | bouton **A** |
| Faire défiler un dialogue | bouton **A**, ou toucher la boîte de texte |

Une bulle « ! » apparaît au-dessus d'Ismae quand il y a quelque chose à regarder devant lui.
La partie droite de l'écran est réservée aux boutons, pour le pouce droit.

## Modifier le jeu

Le plus simple : demande-moi la modification, je l'applique et je la pousse sur GitHub. Si tu
modifies un fichier toi-même, dis-le-moi pour que je la pousse.

### Ce qui se change facilement : `js/config.js`

- `ismae` : teint, yeux, couleur et coupe de cheveux (`degrade`, `court`, `boucles`, `meche`,
  `rase`), barbe (`aucune`, `courte`, `pleine`), lunettes, tenue (`blouson` : cuir ouvert, t-shirt,
  ceinture à boucle ; ou `manteau` avec écharpe), coupe du pantalon (`large` ou `droit`) et couleurs
  de chaque vêtement, jusqu'aux semelles des baskets. Les réglages actuels reprennent ton modèle
  (dégradé brun, barbe de quelques jours, blouson de cuir noir, pantalon noir large).
- `georges` : nuances du pelage noir et couleur des yeux.
- `ambiance` : `'soir'` (réverbères allumés) ou `'jour'` ; `neige: true` pour des flocons.
- `textes` : toutes les phrases du jeu, y compris le message du cœur gravé dans l'arbre
  (`coeur`), à personnaliser pour ton copain.

Ouvre `apercu.html` pour voir Ismae, Georges et les autres chats en grand, dans toutes les
directions, sans lancer le jeu.

### Adapter Ismae à ton modèle

Les couleurs et la coiffure se règlent dans `config.js`. Pour aller plus loin (forme du visage,
coiffure précise, vêtements), les dessins sont des grilles de lettres dans `js/characters.js` :
chaque lettre est un pixel (`H` cheveux, `K` peau, `E` yeux, `T` veste, `P` pantalon…).
Le plus simple : envoie-moi ton modèle et je redessine ces grilles.

### Où se trouve quoi

| Fichier | Contenu |
| --- | --- |
| `js/carte-rue.js` | le plan de la rue : position des immeubles, objets, chats, zones à regarder |
| `js/carte-superette.js` | l'intérieur de la supérette |
| `js/decor-batiments.js` | le générateur de façades et de devantures, le logo |
| `js/decor-objets.js` | réverbères, arbres, bancs, fontaine, péniche, voiture… |
| `js/sol.js` | pavés, trottoirs, quais, eau, toits |
| `js/characters.js` | sprites d'Ismae, des chats et des pigeons |
| `js/entites.js` | déplacements d'Ismae, suivi de Georges, comportement des chats |
| `js/moteur.js` | boucle de jeu, caméra, collisions, éclairage, commandes, dialogues |

Exemple, dans `carte-rue.js`, pour ajouter un banc qu'on peut regarder :

```js
C.objet(Objets.banc(), 500, 640, { solide: [-13, -6, 26, 6], ombre: [13, 2], texte: 'banc' });
```

`500, 640` est la position au sol (en pixels), `solide` le rectangle de collision autour de ce
point, `texte` la clé de la phrase dans `config.js`.

### Mode débogage

Ajoute `#debug` à la fin de l'adresse (par exemple `index.html#debug`) puis recharge :
les collisions apparaissent en rouge, les zones d'interaction en vert et les portes en bleu.

## Pas encore fait (prévu pour la suite)

- les mini-jeux (le caissier de la supérette en parle déjà) ;
- les autres zones (les barrières de travaux aux deux bouts de la rue les annoncent) ;
- la musique et les sons.
