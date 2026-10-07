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
# HORS DU DÉPÔT, et c'est payé : ce dossier n'est fait que de liens
# symboliques, et l'archive de déploiement Vercel ne sait pas les suivre,
# deux déploiements sont partis en erreur avant que la cause soit trouvée.
dossier="${TMPDIR:-/tmp}/migen-maquette-servie"
mkdir -p "$dossier"
ln -sfn "$ici/maquette/site-final-autonome.html" "$dossier/autonome.html"
ln -sfn "$ici/maquette/contenu" "$dossier/contenu"
ln -sfn "$ici/public/assets" "$dossier/assets"
# Le harnais de mesure visuelle, versionné : il avait disparu avec un
# dossier temporaire et faisait tomber diff-visuel-offre.mjs en timeout.
ln -sfn "$ici/maquette/outils/voir.html" "$dossier/voir.html"
echo "maquette : http://localhost:4352/autonome.html"
exec python3 -m http.server 4352 -d "$dossier"
