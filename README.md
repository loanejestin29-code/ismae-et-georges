# Ismae et Georges

Une petite aventure en pixel art dans les rues de Paris, à jouer sur iPhone, à l'horizontale.

Site statique en HTML, CSS et JavaScript, sans dépendance ni étape de build :

- `index.html`, `style.css`, `script.js` : la page d'accueil (Georges, le chat noir, dessiné pixel par pixel)
- `icone.png` : l'icône pour l'écran d'accueil de l'iPhone
- `jeu/` : le jeu (voir `jeu/LISEZMOI.md`)
- `robots.txt` : demande aux moteurs de recherche de ne pas indexer le site

## Hébergement sur Vercel

Le dépôt est relié à Vercel (préréglage **Other**, aucune commande de build, dossier de sortie :
la racine). Chaque push sur `main` met le site à jour. Les fichiers listés dans `.vercelignore`
ne sont pas publiés sur le site.

## Voir le site en local

Ouvrir `index.html` dans un navigateur.
