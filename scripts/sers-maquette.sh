#!/bin/sh
# Sert la maquette du client en local, prête à naviguer.
#
# L'application (`maquette/site-final-autonome.html`) a besoin, À CÔTÉ d'elle :
#   - de son contenu rédigé (`contenu/`), sinon « Chargement de la page… »,
#   - des images du dépôt (`assets/`), sinon 149 visuels manquent.
# Ce script assemble un dossier de service stable et lance un serveur sur 4352,
# le port que tous les outils de mesure attendent (MAQUETTE_URL).
set -e
ici="$(cd "$(dirname "$0")/.." && pwd)"
dossier="$ici/.maquette-servie"
mkdir -p "$dossier"
ln -sfn "$ici/maquette/site-final-autonome.html" "$dossier/autonome.html"
ln -sfn "$ici/maquette/contenu" "$dossier/contenu"
ln -sfn "$ici/public/assets" "$dossier/assets"
echo "maquette : http://localhost:4352/autonome.html"
exec python3 -m http.server 4352 -d "$dossier"
