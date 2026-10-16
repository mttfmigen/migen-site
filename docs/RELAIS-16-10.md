# Relais du 16/10 (soir) : intégration de la maquette V3 sur migen.fr

À lire en entier avant de toucher au dépôt. Écrit pour la session qui reprend.

## Où travailler

- Dépôt : `~/Landing lovable/migen-site-perimetre`, branche locale `perimetre-photos-registre`.
- **Pousser = déployer en production** : `git push origin HEAD:phase-2-gabarits` (Vercel, projet `prj_1Dgu3PtR0NuTug71lYh9uj75Utxs`, équipe `team_yH3SZYMYMVcFbA0xTRR184Hu`). Toujours `git fetch origin` et vérifier `git log HEAD..origin/phase-2-gabarits` avant de pousser.
- En ligne au moment du relais : `044035a` (= HEAD local).
- Avant chaque push : `bunx tsc --noEmit -p .`, `bun run build`, `nohup bunx next start -p 4340 &`, puis `bun run verifie` (code 0). Les portes qui lisent le site ont besoin du serveur sur 4340 (ou `SITE_URL=...`).
- Ne jamais interroger migen.fr en masse (défi anti-robot de Vercel sur notre IP). Pour une vérification ponctuelle : `curl --resolve migen.fr:443:216.150.1.1 https://migen.fr/...`.
- Ne jamais faire `pkill` / `killall` sur Next : d'autres serveurs tournent (arrêter par port, `lsof -ti tcp:PORT | xargs kill`).

## Ce qui reste : trois branches à finir, vérifier, fusionner, pousser

Trois chantiers lancés par la session précédente, chacun dans son arbre (`$S` = `/private/tmp/claude-501/-Users-mehdi-Landing-lovable/5ac5b3b5-7606-4b39-a9d7-aa12e571c373/scratchpad`). Leurs agents ont pu ajouter des commits après ce relais : prendre la tête de branche.

| Branche | Arbre | Objet | État au relais |
|---|---|---|---|
| `v3-siege-limonest` | `$S/lots/siege2` | **Le siège revient à Limonest, l'agence à Écully** (Mehdi, 16/10 soir : « L'agence est à Ecully siège à Limonest »). Annule le passage du matin à Écully (fusion `15e880e`), garde la correction « 6 champs » de Panne machine. | Portage commité (`acccf3b`), relecture en cours. **Priorité 1** : le site en ligne dit encore « siège à Écully ». |
| `v3-agenda` | `$S/lots/agenda` | /lp/rendez-vous/ : agenda Calendly mieux intégré (bloc large, hauteur automatique par `calendly.page_height`, un seul titre). | Corrigé une fois (`05824ef`), seconde relecture en cours. |
| `v3-photos-villes` | `$S/lots/photosvilles` | Pages villes (site et 15 LP villes) : la photo de ville en fond (« fait agence immo ») remplacée par une photo de maintenance industrielle autorisée, liée à l'industrie locale ; vignettes des hubs inchangées. Table dans `docs/PHOTOS-VILLES.md`. | Correction en cours (`3430d9b`). |

Pour chacune :
1. `git log --oneline -3 <branche>` et lire le dernier commit.
2. Contrôle rapide dans son arbre si besoin (build, captures 1440 et 390 px).
3. `git merge --no-edit <branche>` dans le dépôt, résoudre en gardant les deux apports.
4. Build, `bun run verifie`, push, attendre le déploiement (vérifier une page en ligne).

Vérifications propres à chacune après fusion :
- **Siège** : 0 phrase « siège à Écully » / « Siège, Écully » sur les pages du plan du site et les 39 LP ; siège à Limonest dans le pied de page, les mentions légales et le JSON-LD ; agence d'Écully citée là où elle l'était le 09/10 ; la LP Lyon redit « Agence à Écully » (règle retirée de `scripts/genere-lp.mjs`, `lib/lp/pages.json` régénéré) ; Contact : liste et carte (`components/site/contact/Agences.tsx`) sans « Siège, Écully ».
- **Photos** : aucune `/assets/villes/ville-*.jpg` en fond de héros ni dans le panneau « Votre hub local » des pages villes et des LP villes. Si `v3-siege-limonest` et `v3-photos-villes` régénèrent tous deux `lib/lp/pages.json`, relancer `bun scripts/genere-lp.mjs` après la seconde fusion.
- **Agenda** : /lp/rendez-vous/ montre le cadre Calendly prérempli (clé `sessionStorage` `migen.lp.rendez-vous`), sans défilement interne ; `verifie-lp` vert.

Quand les trois sont en ligne : c'est terminé, ne rien lancer d'autre sans demande de Mehdi.

## Ce qui est en ligne (16/10)

- Accueil mobile V3, rond téléphone dans l'en-tête mobile, toutes les familles de pages au téléphone à la V3.
- Formulaire de bas de page au téléphone : carte blanche « Décrire mon besoin », 6 champs **visibles en 3 étapes** (décision de Mehdi), plus de formulaire replié en double.
- 8 sous-pages d'offre en page d'offre complète (bureau d'études électrique, électronique, mise en conformité ; astreinte ; panne machine ; cahier des charges ; prestataire ou salarié ; retrofit mise en conformité).
- 39 landing pages sous **/lp/** (noindex en meta et X-Robots-Tag, hors plans du site, aucun lien du site, robots.txt ne les bloque pas), formulaire V3 sur un écran envoyé au formulaire HubSpot du site, conversion `hubspot_form_submit` puis /lp/rendez-vous/ avec Calendly intégré. Correspondance des adresses : `~/Landing lovable/lp-adresses-migen.csv`. Nettoyage page par page : `docs/LP-NETTOYAGE.md`.
- Compléments d'offre en cartes numérotées au bureau ; carte de France des agences sur /contact/ (10 hubs).
- « prix mensuel fixe » retiré partout et refusé par `scripts/verifie-interdits.mjs`.
- Grille des hubs remontée sous les chiffres de /implantations/.

## Décisions de Mehdi à respecter

- Siège à **Limonest**, agence à **Écully** (16/10 soir, conforme au registre ; ne plus changer sans le registre sous les yeux).
- Le 04 11 78 95 97 reste sur les LP seulement ; le site garde le 04 78 33 72 05.
- LP : garder « opérationnels dès le premier jour » et les durées en lettres (« monté en six semaines »).
- Garder les cartes repliées sous le formulaire au téléphone ; garder « Le prix mensuel est le prix réel de votre maintenance. » sur Zéro arrêt.
- Pas de carte de France autre que celle de Contact ; aucun compteur du type « 6 points ».
- Règles permanentes : aucun tiret cadratin, aucun mot interdit (intérim, notamment, sur mesure, clé en main, régie, levier, mise à disposition, sans engagement, concrètement, incontournable, découvrez, en savoir plus), aucune donnée inventée, aucun délai chiffré sauf « rappel dans l'heure », « 10 % des techniciens », 4 agences et 10 hubs, aucun envoi réel de formulaire en test, aucune écriture HubSpot ou Supabase sans accord.

## Reporté à plus tard (Mehdi : « on fera les utm plus tard »)

HubSpot ignore `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `page_entree`, `formulaire_migen` : ces propriétés n'existent pas dans le portail 148000737. Le connecteur HubSpot ne sait ni créer une propriété ni modifier un formulaire. Le jour venu : créer ces 8 propriétés de contact (texte sur une ligne), les poser en champs masqués du formulaire du site, puis envoyer `gclid` depuis `app/api/lead/route.ts` (avec l'accord « publicité », comme les UTM).

## Points connus, non bloquants

- Logo EcoVadis « tronqué » signalé par Mehdi : non reproduit (15 pages, 360 à 414 px, en local et en ligne). Demander la page ou une capture s'il revient dessus.
- Dans le formulaire du site comme celui des LP, bouton blanc sur orange à 2,56:1 (charte commune) : non changé.
