# Rapport d'avancement, site migen.fr

Ce document dit OÙ ON EN EST, et rien d'autre. Il remplace la lecture du fil de
discussion. Il est remesuré toutes les dix minutes par
`node scripts/rapport-avancement.mjs`, qui réécrit le bloc de chiffres ci-dessous
sans toucher à la prose.

Une donnée absente s'y écrit « non calculable » avec son motif. Jamais zéro.

<!-- CHIFFRES: début, réécrit par scripts/rapport-avancement.mjs -->

```json avancement
{
  "remesureLe": "13/10/2026 à 15:34",
  "depot": {
    "branche": "phase-2-gabarits",
    "tete": "fcbb36d",
    "poussé": "fcbb36d",
    "commitsDepuisMinuit": 11,
    "fichiersNonCommites": "0"
  },
  "contenu": {
    "fichesDeContenu": 246
  },
  "verification": {
    "portesDeVerification": 52,
    "entreesAuRegistre": 67,
    "promessesAvecCommande": 35,
    "retoursEncoreOuverts": 9
  }
}
```

<!-- CHIFFRES: fin -->

## Les mesures lentes, et quand elles ont été prises

Ces quatre portes tournent contre la production et prennent huit minutes. Elles
ne sont pas relancées à chaque passage du rapport : leur horodatage fait foi.

| Mesure | Résultat | Prise le |
|---|---|---|
| Registre des retours client | 33 promesses, **33 tenues**, 0 rompue | 13/10 15:10 |
| Interdits du contrat éditorial | conforme, code et 246 fiches | 13/10 15:10 |
| Responsive, 5 largeurs, 22 pages | **0 défaut** sur les six règles | 13/10 15:10 |
| Repli mobile des sections | **160 sections sans repli sur 206** | 13/10 15:10 |

Commandes, dans l'ordre :

    node scripts/verifie-le-registre.mjs
    node scripts/verifie-interdits.mjs
    SITE_URL=https://migen-site.vercel.app node scripts/verifie-responsive.mjs
    node scripts/verifie-repli-mobile.mjs https://migen-site.vercel.app

## Ce qui est en ligne et vérifié aujourd'hui

**Le responsive est à zéro défaut.** 110 relevés sur 22 pages des onze gabarits,
à 320, 360, 390, 768 et 1280 px. Aucun débordement, aucun texte coupé, aucune
cible tactile sous 24 px, aucun chevauchement. Départ de la journée : 136
défauts. Huit causes racines, dont la gouttière de page à 40 px qui coûtait un
quart de l'écran à 320 px, et 72 grilles dont la piste unique était plus large
que son conteneur.

**Les cartes 03 de `/implantations/`** portent à nouveau leur texte. Problématiques
03 passe de 35 à 132 caractères, l'offre 03 de 67 à 118. Cause : quatre phrases
étaient rangées en trous déclarés sous l'ancienne règle des prix, caduque depuis
l'arbitrage du 09/10. Ce qui porte un montant ou un délai chiffré n'est pas rendu,
et le script refuse de le faire.

**Le numéro de téléphone** ne s'affiche plus dans la carte « Contact direct » du
bloc « Nos informations pratiques » de `/carriere/`. Il reste dans l'en-tête, là
où la maquette le met.

**Les cartes de `/carriere/` ne s'étirent plus** à la hauteur de la plus longue.
La capture déclarait `align-items: start`, nous ne l'avions pas porté.

**Le parcours mobile par le problème est en ligne.** Vérifié à 390 px :
« Qu'est-ce qui vous bloque ? » s'affiche, et il est masqué à 1280 px.

## Ce qui est mesuré et pas encore corrigé

**Le mobile.** 160 sections sur 206 sont servies déroulées sur téléphone. Sept
pages n'ont aucun repli, dont l'accueil : 21 sections, 28 937 px de haut. Mais
le repli n'est PAS la cible : la maquette mobile livrée le 13/10 est une autre
architecture, « un parcours guidé par le problème, pas par le menu ». Deux
fichiers ont été livrés dans la journée, le second couvrant les 248 pages.
Cartographie en cours.

**`/nous-connaitre/` se lit comme une page d'offre unique.** Retour de Nathan
Jorez : « ultra spé résidence comme si c'était la seule offre ». Mesuré : la page
ne porte aucun lien vers une offre, et sa section « Notre modèle » oppose Migen
aux prestataires qui « entretiennent vos machines avec leurs propres équipes »,
ce qui exclut cinq des six offres. La page n'est pas dans l'index des 248 pages
du client. Analyse en cours.

**Le colis du 13/10**, Ressources v2 et Implantations. Analyse en cours.

## Ce qui attend une réponse de Mehdi

| Sujet | Ce qu'il faut de lui |
|---|---|
| Photos de ville Metz, Dijon, Bordeaux | Les trois fichiers. Celui de Dijon envoyé est une vignette avec filigrane |
| Bloc d'appel bureau d'études et travaux | Dire ce qui cloche. Mesuré : rien n'est coupé, le rendu est propre |
| Cas Norvège en avant | Le mettre en avant pousse JTEKT hors des trois cartes |
| Chapô de `/travaux-industriels/` | « Des techniciens de maintenance » est le nom du métier, pas le mot proscrit |
| Numéro de téléphone ailleurs | Il reste dans 3 à 8 phrases de corps par page sur une grande partie du site |
| `ChampEntreprise.tsx` | La seule erreur eslint du dépôt. La corriger décale de 250 ms l'effacement d'une liste d'autocomplétion, donc un comportement de formulaire |
| Offre TeamTailor 8528454 | La publier, et poser `TEAMTAILOR_JOB_ID` et `TEAMTAILOR_API_KEY` sur Vercel |
| Clé de service Supabase | Présente mais vide dans `.env.local` |
| Trois champs légaux | Mentions légales |

## Les deux règles qui gouvernent ce rapport

1. **Rien n'y est écrit sans mesure.** Chaque chiffre porte sa commande. Une
   mesure impossible s'écrit « non calculable » avec son motif.
2. **Une porte se répare, jamais ne s'aveugle.** Chacune doit prouver qu'elle
   sait échouer, par un témoin avec au moins un contrôle négatif. La leçon du
   13/10 : la porte du responsive annonçait « 92 blocs repliables, 92 attendus »
   alors que 160 sections ne se repliaient pas. Elle comptait ce qui existait,
   jamais ce qui manquait.
