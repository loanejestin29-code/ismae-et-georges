# Juste un indice… — zone 1 : la rue des chats

Petit jeu d'aventure en pixel art, vue de dessus en trois quarts, à jouer sur iPhone, à
l'horizontale. Tout le décor, les personnages et la musique sont générés par le code : aucune
image ni aucun son externe.

> Règle d'or : ne jamais écrire le nom de la ville de destination, nulle part. C'est une surprise.

## Ce que contient la zone 1

- **L'ambiance du dessin animé** : façades anciennes avec balcons en fer forgé, mansardes et
  cheminées qui fument, des chats aux fenêtres, sur les balcons et sur les toits, des affiches de
  concerts de jazz, un club de jazz, la neige, des pigeons qui s'envolent, des réverbères.
- **Les chats musiciens** sur la petite place : contrebasse, piano, trompette (Charlie, le chef),
  batterie et clarinette. Ils bougent en rythme et on peut parler à chacun d'eux.
- **La musique** : un morceau de jazz original joué en direct (piano, contrebasse, trompette,
  clarinette, batterie aux balais). Il est plus fort près de la scène et étouffé dans la supérette.
  Le bouton ♪ en haut à droite coupe le son.
- **Des habitants** qui se promènent ou travaillent : Mme Brioche (boulangère), Gaston (livreur),
  Colette, M. Fernand, un peintre dans la cour. Ils s'arrêtent quand Ismae est sur leur chemin.
- **Les personnages** : Ismae est redessiné d'après la planche de référence (4 vues, coiffure,
  doudoune noire, baskets blanches) et son portrait de dialogue d'après les photos en gros plan.
  Les habitants sont dessinés dans le même style.
- **L'introduction** :
  1. Ismae et Georges arrivent tout en haut de la rue (côté est) ; on explore librement.
  2. Quand on se promène dans la rue, Marie, Toulouse et Berlioz passent en courant. Georges les voit
     (bulle « ! ») et part à leur poursuite.
  3. Les chatons et Georges courent plus vite qu'Ismae (même quand il court) : Georges reste bien
     devant et les guide par la ruelle à côté du café. S'il est vraiment trop loin d'Ismae, il
     l'attend un instant. Si on part ailleurs, il revient vers Ismae et les chatons attendent dans
     la cour.
  4. Dans la cour intérieure, Duchesse arrive. Toulouse fait le dos rond, Georges essaie… et tombe
     sur le dos. Berlioz rit.
  5. Ismae parle de Tom : Toulouse l'a vu entrer dans la boutique au logo bleu et rouge, tout au
     bout de la rue, là où les chats jouent du jazz.
- **La quête de Tom** : après la rencontre, la boulangère, le livreur, Charlie et Duchesse donnent
  des indices. Il faut traverser toute la rue pour trouver la supérette. On peut aussi y entrer
  directement sans avoir parlé à personne.
- **La supérette** : tout au bout de la rue, juste à côté de la place du concert. Petite épicerie
  rétro (logo seul, aucun texte), enseigne suspendue visible de loin. À l'intérieur, les rayons
  forment un labyrinthe façon Pac-Man, sans aucune impasse, prêt pour la future course-poursuite.

## Tester sur l'iPhone

Le jeu est en ligne sur **https://ismae-et-georges.vercel.app/jeu/** (ou la page d'accueil, bouton
« Jouer »). Pour l'avoir comme une appli : Safari → Partager → « Sur l'écran d'accueil ».

| Action | Geste |
| --- | --- |
| Marcher | pouce gauche : le poser sur la partie gauche de l'écran et le faire glisser |
| Courir | bouton **Courir** (appuyer une fois pour activer ou désactiver) |
| Regarder, parler | bouton **A** |
| Faire défiler un dialogue | bouton **A**, ou toucher la bulle |
| Couper la musique | bouton **♪** en haut à droite |

À la verticale, un écran demande de tourner le téléphone et le jeu se met en pause.

## Modifier le jeu

Le plus simple : demande-moi la modification, je l'applique et je la pousse sur GitHub. Le site
se met à jour tout seul en moins d'une minute.

### `js/config.js` — ce qui se change facilement

- `ismae` : `modele: 'planche'` utilise le sprite tiré de la planche de référence
  (`js/sprite-ismae.js`) ; les autres réglages ne servent qu'aux anciens modèles.
- `musique`, `volumeMusique`, `neige`, `ambiance`.
- `vitesseChatons` : vitesse de Georges pendant la poursuite (Ismae court à 104). La vitesse des
  chatons eux-mêmes est `VITESSE_CHATONS` dans `js/scenes.js`.
- `personnages` : noms et couleurs des étiquettes dans les bulles.
- `rencontre` : toutes les répliques de la scène avec Duchesse.
- `repliques` : ce que dit chaque personnage, avant (`avant`) et après (`apres`) la piste de Tom.
- `textes` : les objets qu'on peut regarder, dont le cœur gravé (`coeur`), à personnaliser.

### Où se trouve quoi

| Fichier | Contenu |
| --- | --- |
| `js/scenes.js` | l'introduction (chatons, poursuite, Duchesse) et la quête de Tom |
| `js/carte-rue.js` | le plan de la rue, les immeubles, la scène, les habitants, les chats |
| `js/carte-superette.js` | l'intérieur ; le labyrinthe se règle avec les tableaux `H` et `V` |
| `js/musique.js` | l'orchestre de jazz et les bruitages |
| `js/titre.js` | le décor animé de l'écran d'accueil (le titre lui-même est dans `index.html`) |
| `js/sprite-ismae.js` | Ismae (4 vues) et son portrait, tirés des images de référence |
| `js/characters.js` | tous les sprites (grilles de lettres : une lettre = un pixel), la marche, les accessoires des habitants |
| `js/entites.js` | Ismae, Georges, les chats, les musiciens, les habitants |
| `js/moteur.js` | boucle de jeu, caméra, collisions, éclairage, commandes, dialogues |

### Vérifier

- `#debug` à la fin de l'adresse : collisions en rouge, zones à regarder en vert, portes en bleu.
- `apercu.html` : tous les personnages en grand (non publié sur le site).

## Pas encore fait

- L'histoire dans la supérette (la coupure au doigt, Loane) et le mini-jeu de poursuite.
- Les autres zones.
