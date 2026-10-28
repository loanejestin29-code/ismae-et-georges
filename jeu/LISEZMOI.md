# Juste un indice… — zone 1 : la rue des chats

Petit jeu d'aventure en pixel art, vue de dessus en trois quarts, à jouer sur iPhone, à
l'horizontale. Tout le décor, les personnages et la musique sont générés par le code : aucune
image ni aucun son externe.

> Règle d'or : ne jamais écrire le nom de la ville de destination, nulle part. C'est une surprise.

## Ce que contient la zone 1

- **L'ambiance du dessin animé** : façades anciennes avec balcons en fer forgé, mansardes et
  cheminées qui fument, des chats aux fenêtres, sur les balcons et sur les toits, des affiches de
  concerts de jazz, un club de jazz, la neige, des pigeons qui s'envolent, des réverbères.
- **Les chats musiciens** sur la placette des Matous, cachée derrière les immeubles : contrebasse,
  piano, trompette (Charlie, le chef), batterie et clarinette. Ils bougent en rythme et on peut
  parler à chacun d'eux.
- **La musique** : un morceau de jazz original joué en direct (piano, contrebasse, trompette,
  clarinette, batterie aux balais). On l'entend à peine en arrivant, de plus en plus fort en
  approchant de la placette : on peut la suivre. Étouffée dans la supérette. Le bouton ♪ coupe le son.
- **Des habitants** qui se promènent ou travaillent : Mme Brioche (boulangère), Gaston (livreur),
  Colette, M. Fernand, un peintre dans la cour. Ils s'arrêtent quand Ismae est sur leur chemin.
- **Ismae** : petits yeux, pas de bouche, silhouette fine (grosse tête ronde, bras et jambes
  détachés). Le style s'inspire des photos : cheveux en bataille, perfecto noir à zips argentés,
  pantalon large, baskets grises. Son portrait dans les bulles, c'est le haut de son sprite.
- **L'introduction** :
  1. Ismae et Georges arrivent tout en haut de la rue (côté est) ; on explore librement.
  2. Quand on se promène dans la rue, Marie, Toulouse et Berlioz passent en courant. Georges les voit
     (bulle « ! ») et part à leur poursuite.
  3. Les chatons et Georges courent plus vite qu'Ismae (même quand il court) : Georges reste bien
     devant et les guide par la première ruelle, celle de l'hôtel. S'il est vraiment trop loin
     d'Ismae, il l'attend un instant. Si on part ailleurs, il revient vers Ismae et les chatons
     attendent au jardin.
  4. Dans le jardin secret, Duchesse arrive. Toulouse fait le dos rond, Georges essaie… et tombe
     sur le dos. Berlioz rit.
  5. Ismae parle de Tom : Toulouse l'a vu entrer dans une boutique au logo bleu et rouge, sur une
     placette cachée où les chats jouent du jazz.
- **La quête de Tom** (sans flèche : il faut parler aux gens) :
  - Duchesse conseille de demander aux habitants ; M. Fernand dit de suivre la musique.
  - La boulangère : Tom disparaît derrière la grande porte verte, au bout de la rue (à côté du
    club de jazz). La colonne d'affiches juste à côté le confirme.
  - La porte est fermée à clé. Le livreur et le peintre (dans la cour, par la deuxième ruelle)
    disent que c'est Colette qui a la clé ; elle se promène sur le quai.
  - Colette prête la clé (seulement une fois la piste de Tom connue) ; on ouvre la porte verte.
- **La placette des Matous** : derrière la porte verte, un passage mène à une petite place cachée.
  Les musiciens jouent sur une scène posée juste devant la supérette : il faut passer derrière eux
  pour atteindre sa porte.
- **La supérette** : petite épicerie rétro (logo seul, aucun texte). À l'intérieur, les rayons
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

- `ismae` : `modele: 'inspire'` et les couleurs (peau, cheveux, veste, zips, pantalon, baskets).
  Le dessin lui-même est la grille `ISMAE_STYLE` de `js/characters.js`.
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
| `js/characters.js` | tous les sprites, dont Ismae (grilles de lettres : une lettre = un pixel) |
| `js/entites.js` | Ismae, Georges, les chats, les musiciens, les habitants |
| `js/moteur.js` | boucle de jeu, caméra, collisions, éclairage, commandes, dialogues |

### Vérifier

- `#debug` à la fin de l'adresse : collisions en rouge, zones à regarder en vert, portes en bleu.
- `apercu.html` : tous les personnages en grand (non publié sur le site).

## Pas encore fait

- L'histoire dans la supérette (la coupure au doigt, Loane) et le mini-jeu de poursuite.
- Les autres zones.
