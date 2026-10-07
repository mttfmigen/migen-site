# Mesure complète de la maquette : 248 pages, 248 vérifiées

Relevé du 05/10 au soir. Chaque ligne sort d'une page réellement ouverte dans
l'application de la maquette (`autonome.html` + `contenu/`), arrivée vérifiée,
structure mesurée. Aucune ligne n'est supposée. Détail par page dans
`maquette/rendu/*.json`, tableau brut dans `maquette/rendu/_mesure.json`.

| Verdict | Pages |
|---|---|
| rendue, conforme à l'index | 146 |
| rendue, titre écourté à l'écran | 54 |
| **fichier de contenu absent de l'export** | **33** |
| rendue, mais titre vide | 8 |
| redirigée par la maquette elle-même | 6 |
| écran natif | 1 |
| échec | 0 |

## 1. À réclamer à Claude Design : les 33 fichiers manquants

L'index les annonce, le plan du site les liste, le fichier Markdown n'est pas
dans l'export. Sans lui la page reste vide. Toutes en famille Implantations.

- `Implantations/implantations--maintenance-industrielle-agen.md` — /implantations/maintenance-industrielle-agen/
- `Implantations/implantations--maintenance-industrielle-albi.md` — /implantations/maintenance-industrielle-albi/
- `Implantations/implantations--maintenance-industrielle-amiens.md` — /implantations/maintenance-industrielle-amiens/
- `Implantations/implantations--maintenance-industrielle-angers.md` — /implantations/maintenance-industrielle-angers/
- `Implantations/implantations--maintenance-industrielle-angouleme.md` — /implantations/maintenance-industrielle-angouleme/
- `Implantations/implantations--maintenance-industrielle-annecy.md` — /implantations/maintenance-industrielle-annecy/
- `Implantations/implantations--maintenance-industrielle-arras.md` — /implantations/maintenance-industrielle-arras/
- `Implantations/implantations--maintenance-industrielle-bayonne.md` — /implantations/maintenance-industrielle-bayonne/
- `Implantations/implantations--maintenance-industrielle-belfort-montbeliard.md` — /implantations/maintenance-industrielle-belfort-montbeliard/
- `Implantations/implantations--maintenance-industrielle-beziers.md` — /implantations/maintenance-industrielle-beziers/
- `Implantations/implantations--maintenance-industrielle-bourges.md` — /implantations/maintenance-industrielle-bourges/
- `Implantations/implantations--maintenance-industrielle-brive.md` — /implantations/maintenance-industrielle-brive/
- `Implantations/implantations--maintenance-industrielle-calais.md` — /implantations/maintenance-industrielle-calais/
- `Implantations/implantations--maintenance-industrielle-chalon-sur-saone.md` — /implantations/maintenance-industrielle-chalon-sur-saone/
- `Implantations/implantations--maintenance-industrielle-chambery.md` — /implantations/maintenance-industrielle-chambery/
- `Implantations/implantations--maintenance-industrielle-chartres.md` — /implantations/maintenance-industrielle-chartres/
- `Implantations/implantations--maintenance-industrielle-cherbourg.md` — /implantations/maintenance-industrielle-cherbourg/
- `Implantations/implantations--maintenance-industrielle-compiegne.md` — /implantations/maintenance-industrielle-compiegne/
- `Implantations/implantations--maintenance-industrielle-evreux.md` — /implantations/maintenance-industrielle-evreux/
- `Implantations/implantations--maintenance-industrielle-la-rochelle.md` — /implantations/maintenance-industrielle-la-rochelle/
- `Implantations/implantations--maintenance-industrielle-lorient.md` — /implantations/maintenance-industrielle-lorient/
- `Implantations/implantations--maintenance-industrielle-nancy.md` — /implantations/maintenance-industrielle-nancy/
- `Implantations/implantations--maintenance-industrielle-niort.md` — /implantations/maintenance-industrielle-niort/
- `Implantations/implantations--maintenance-industrielle-quimper.md` — /implantations/maintenance-industrielle-quimper/
- `Implantations/implantations--maintenance-industrielle-roanne.md` — /implantations/maintenance-industrielle-roanne/
- `Implantations/implantations--maintenance-industrielle-saint-nazaire.md` — /implantations/maintenance-industrielle-saint-nazaire/
- `Implantations/implantations--maintenance-industrielle-saint-quentin.md` — /implantations/maintenance-industrielle-saint-quentin/
- `Implantations/implantations--maintenance-industrielle-tarbes.md` — /implantations/maintenance-industrielle-tarbes/
- `Implantations/implantations--maintenance-industrielle-vesoul.md` — /implantations/maintenance-industrielle-vesoul/
- `Implantations/implantations--marseille.md` — /implantations/marseille/
- `Implantations/implantations--marseille--nimes.md` — /implantations/marseille/nimes/
- `Implantations/implantations--marseille--perpignan.md` — /implantations/marseille/perpignan/
- `Implantations/implantations--marseille--toulon.md` — /implantations/marseille/toulon/

## 2. Défaut de la maquette : 8 sous-pages d'offres au titre vide

Le contenu se rend (1 500 à 2 000 mots), mais le h1 et le premier h2 sont vides :
le gabarit 03 attend les données `of.*` des six offres nommées, et ces sous-pages
n'en font pas partie. À corriger dans la maquette, ou à trancher : quel titre ?

- /bureau-etudes/bureau-etude-electrique/ — 1230 mots rendus
- /bureau-etudes/bureau-etude-electronique/ — 1347 mots rendus
- /bureau-etudes/mise-en-conformite-machine/ — 1346 mots rendus
- /offres/depannage-industriel/astreinte/ — 1285 mots rendus
- /offres/depannage-industriel/panne-machine/ — 1210 mots rendus
- /offres/residence/cahier-des-charges/ — 1762 mots rendus
- /offres/residence/prestataire-ou-salarie/ — 1419 mots rendus
- /offres/retrofit/mise-en-conformite-machine/ — 1237 mots rendus

## 3. Pour information : 54 titres écourtés à l'écran

La page existe et se rend. Son h1 à l'écran est une accroche courte, l'index
porte la version longue (vraisemblablement le `<title>` SEO). Trois exemples :

- /preuves/aktid-centre-logistique/
  - index : Étude de cas AKTID : un centre logistique monté en six semaines
- /preuves/alstef-group/
  - index : Étude de cas ALSTEF GROUP : des chantiers automatisés contrôlés point par point
- /preuves/amazon-centre-logistique/
  - index : Étude de cas AMAZON : maintenir un centre logistique qui ne ferme jamais

Familles concernées : les 41 études de cas, les 12 secteurs, le hub secteurs.
À trancher un jour : lequel des deux titres fait foi pour le site.

## 4. Les 6 redirections déclarées par la maquette

- /bureau-etudes/ → /offres/bureau-etudes/
- /offres/audit-conseil-maintenance/ → /offres/bureau-etudes/
- /offres/chantier/ → /travaux-industriels/
- /offres/construction/ → /travaux-industriels/
- /offres/depannage-industriel/ → /offres/zero-arret/
- /offres/retrofit/ → /offres/bureau-etudes/
