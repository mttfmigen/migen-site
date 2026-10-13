# Rapport d'avancement, site migen.fr

Ce document dit OÙ ON EN EST, et rien d'autre. Il remplace la lecture du fil de
discussion. Il est remesuré toutes les dix minutes par
`node scripts/rapport-avancement.mjs`, qui réécrit le bloc de chiffres ci-dessous
sans toucher à la prose.

Une donnée absente s'y écrit « non calculable » avec son motif. Jamais zéro.

<!-- CHIFFRES: début, réécrit par scripts/rapport-avancement.mjs -->

```json avancement
{
  "remesureLe": "13/10/2026 à 16:40",
  "depot": {
    "branche": "phase-2-gabarits",
    "tete": "9e69526",
    "poussé": "9e69526",
    "commitsDepuisMinuit": 15,
    "fichiersNonCommites": 2
  },
  "contenu": {
    "fichesDeContenu": 246
  },
  "verification": {
    "portesDeVerification": 53,
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
à 320, 360, 390, 768 et 1280 px. Départ de la journée : 136 défauts.

**Les cartes 03 de `/implantations/`** portent à nouveau leur texte, 35 à 132 et
67 à 118 caractères. Quatre phrases rendues, rangées en trous déclarés sous
l'ancienne règle des prix, caduque depuis l'arbitrage du 09/10.

**« Sept hubs » était un faux chiffre.** La page se contredisait dans le même
fichier : son titre annonçait sept hubs, sa propre FAQ en énumérait dix, sa
donnée en porte dix, le contrat en écrit dix. Corrigé, et la porte qui le garde
RECALCULE les deux chiffres au lieu de les comparer à une valeur recopiée : les
hubs comptés dans la donnée, les bassins comptés dans l'index (66 pages ville
plus 8 pages département égale 74).

**`/nous-connaitre/` disait « Migen » là où l'arbitrage impose « Migen Travaux ».**
La maquette écrit « Orthus », la règle du 09/10 le remplace par « Migen
Travaux », mais la copie était en dur et la règle n'a jamais pu s'appliquer.
C'était la seule phrase de la page nommant la marque qui porte les deux offres
hors placement.

**Le numéro de téléphone** ne s'affiche plus dans la carte « Contact direct » de
`/carriere/`. **Les cartes de `/carriere/`** ne s'étirent plus à la hauteur de la
plus longue : la capture déclarait `align-items: start`, non porté.

**Le nom de l'offre est sur les cartes du parcours mobile**, comme la maquette.
Contraste mesuré après correction : 8,07 pour 1 en thème clair, 6,44 en sombre,
contre 2,3 avant, pour un seuil exigé de 4,5.

## LE POINT LE PLUS GRAVE, et il n'a rien à voir avec le design

**Aucun formulaire ne dépose de lead en production.** `HUBSPOT_FORM_ID` est
absent des variables du projet sur Vercel, et le code renvoie une erreur 502 au
visiteur quand il manque. C'est l'objectif numéro un du site.

Le portail 148000737 est en dur dans le code. Seul l'identifiant du formulaire
manque. Il se trouve dans HubSpot, Marketing puis Formulaires, bouton Partager.

Cinq variables seulement sont posées sur Vercel. Manquent aussi
`SUPABASE_SERVICE_ROLE_KEY`, `HUBSPOT_PRIVATE_TOKEN`, `CRON_SECRET`, les
identifiants des traceurs et `TEAMTAILOR_API_KEY`.

## Ce qui est mesuré et pas encore corrigé

**Le mobile.** L'accueil fait 28 945 px de haut à 390 px, la maquette du client
2 871. Le parcours par le problème est en ligne et fonctionne. Ce qui manque,
c'est ce qui vient après : nous déroulons les 21 sections de bureau là où la
maquette enchaîne sur une liste courte.

**La maquette mobile ne peut pas être portée telle quelle.** Mesuré dans ses
fichiers : aucune adresse web, et dans sa liste des 248 pages les adresses sont
dans des boutons, pas des liens, 266 boutons pour 3 liens. Portée littéralement,
elle donnerait 4 liens sur tout le site contre 128 sur l'accueil, et son lecteur
de page sert 465 à 586 mots là où nos pages en servent 1 981 à 2 250. Trois
consignes ont été transmises à Mehdi pour Design : une vraie page par adresse,
replier sans retirer, et dessiner les onze gabarits plutôt que cinq écrans.

**Le colis Ressources v2** est une refonte de gabarit. Le blocage n'est pas le
code mais la donnée : les 4 thèmes, les 14 étiquettes et les durées de lecture
n'existent pas dans le dépôt. Les affecter à 28 pages est une décision
éditoriale. Code estimé à 6 ou 7 demi-journées, donnée non calculable.

**Le colis Implantations n'est pas un gain partout.** Sa mosaïque de hubs fait
1 732 px contre 1 555 sur bureau et 4 292 contre 537 au téléphone, six de ses
dix photos sont des aperçus filigranés chargés depuis Internet, et ses 48 villes
passent derrière onze onglets, soit 48 liens au lieu de 88.

**22 phrases d'argent sans montant** manquent au corpus sur 40 pages, emportées
par la même purge que les cartes 03. En cours de restitution.

## Ce qui attend une réponse de Mehdi

| Sujet | Ce qu'il faut de lui | Bloque la mise en ligne |
|---|---|---|
| Identifiant du formulaire HubSpot | le GUID, à poser sur Vercel | **oui** |
| Clé de service Supabase | à poser sur Vercel | **oui** |
| Clé d'API TeamTailor | à poser sur Vercel. L'offre n'a PAS besoin d'être publiée : une offre non listée reçoit les candidatures, c'est prouvé sur 8200692 qui en porte 79 | non |
| Photos de Metz et Dijon | les versions sous licence depuis le compte Envato. Les deux pages sont choisies et inscrites | non |
| Bloc d'appel bureau d'études | dire ce qui cloche. Mesuré : rien n'est coupé | non |
| `/nous-connaitre/` | six arbitrages, dont le schéma en trois cases et « un technicien ou deux en avril 2021 » | non |
| Chapô de `/travaux-industriels/` | « techniciens de maintenance » est le nom du métier | non |
| Cas Norvège en avant | pousse JTEKT hors des trois cartes | non |
| Numéro de téléphone ailleurs | il reste dans 3 à 8 phrases de corps par page | non |
| `ChampEntreprise.tsx` | la seule erreur eslint. La corriger décale de 250 ms une liste d'autocomplétion, donc un comportement de formulaire | non |
| Trois champs légaux | mentions légales, à valider par son conseil | **oui** |

## Les deux règles qui gouvernent ce rapport

1. **Rien n'y est écrit sans mesure.** Chaque chiffre porte sa commande. Une
   mesure impossible s'écrit « non calculable » avec son motif.
2. **Une porte se répare, jamais ne s'aveugle.** Chacune doit prouver qu'elle
   sait échouer, par un témoin avec au moins un contrôle négatif. La leçon du
   13/10 : la porte du responsive annonçait « 92 blocs repliables, 92 attendus »
   alors que 160 sections ne se repliaient pas. Elle comptait ce qui existait,
   jamais ce qui manquait.
