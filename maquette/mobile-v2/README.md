# Migen — maquette mobile v2, passation Claude Code

Ouvrir d'abord `Migen - Mobile v2 (autonome).html` (fonctionne hors ligne) : c'est la référence visuelle. Le dossier `maquette/` contient la source.

## Trois règles à respecter
1. **Un écran = une vraie page.** Chaque écran a son URL (`/offres/residence/`), chaque lien est un `<a href>` vers ce chemin. Pas de navigation interne qui remplace les pages. (Dans la maquette, l'adresse passe par `#` pour qu'un seul fichier serve tout ; en production, chemins normaux.)
2. **Replier, jamais retirer.** Les sections sont des `<details>` natifs : tout le texte reste dans le DOM, même replié. FAQ : `<details name="faq">` (une question ouverte à la fois).
3. **Onze gabarits.** Chaque page prend le gabarit du champ `gabarit` de `contenu/site/index.json` : 01 Article, 02 Étude de cas, 03 Offre, 04 Ville, 05 Spécialité, 06 Département, 07 Métier, 08 Secteur, 09 Domaine, 10 Hub, 11 Sous-rubrique. Accueil, Ressources et Contact ont un haut de page sur mesure.

## Fichiers
- `maquette/Migen - Mobile v2.dc.html` : composant (gabarit + logique). Tout le rendu est dans `renderVals()`.
- `maquette/migen-mobile-parse.js` : lit un fichier markdown du corpus et renvoie le modèle de page (sections, blocs, FAQ, chiffres). Écarte les lignes de travail (URL, Title, Meta, Gabarit, notes de visuel).
- `maquette/mobile-v2-data.js` : corpus complet embarqué (index + 248 pages + réalisations liées + photos de villes).
- `maquette/mobile-home-data.js` : données de l'accueil reprises de la version ordinateur (besoins, méthode, avant/après, offres, régions).
- `maquette/mobile-native-data.js` : pages À propos sans fichier de contenu (Nous connaître, Valeurs, RSE, Partenaires).
- `maquette/ressources-data.js` : articles, fiches métiers, guides, étapes de sélection.

## Blocs du rendu (texte du corpus → composant)
- Paragraphe : 1er paragraphe de section en « chapô » ; ligne entièrement en gras = phrase clé.
- Liste « **Libellé** : texte » → cartes numérotées. Liste de liens vers `/preuves/` → cartes photo + logo client (carrousel).
- Liste numérotée → frise d'étapes. Tableau → une carte par ligne. Chiffres clés → tuiles.
- `> À lire aussi : …` → pastilles de liens. Encadré qui ne contient qu'un lien → bouton orange (+ téléphone).
- Liens vers une page absente de l'index → affichés en texte.

## Conversion (CTA)
Bouton d'action en haut de page, photo + CTA après la 2ᵉ section, bandeau « Être rappelé » toutes les 3 sections, mini-formulaire de rappel en bas, barre collante « Décrire mon besoin / Appeler ». Pages carrière : « Postuler ».

## Redirections à reprendre en production (déjà appliquées dans la maquette)
`/offres/chantier/` et `/offres/construction/` → `/travaux-industriels/` ; `/offres/retrofit/`, `/offres/audit-conseil-maintenance/`, `/bureau-etudes/` → `/offres/bureau-etudes/` ; `/offres/depannage-industriel/` → `/offres/zero-arret/`. Doublons à rediriger : les deux « Mise en conformité machine », « Montage industriel », « Transfert industriel ».

## Reste à faire
- Diagnostic gratuit et Test technicien n'ont pas de version mobile (pas de texte dans le corpus).
- Formulaires de la maquette non branchés (HubSpot / Teamtailor à connecter).
- Photos des cartes de réalisations : choisies par secteur dans la photothèque, à remplacer par les vraies photos de chantier.
