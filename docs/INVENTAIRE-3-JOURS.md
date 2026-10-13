# Inventaire des demandes de Mehdi, 11 au 14 octobre

> Demandé le 14/10 : « reprends tout depuis le début depuis 3 jours et fais un
> inventaire de tout ce que je t'ai demandé et si ça a été traité ou non ».

**Source.** Les 17 fichiers de session de ce projet, filtrés sur la date du
message (et non sur la date du fichier, piège payé : des sessions récentes
portent des messages de juin). 550 messages bruts, 447 après retrait des
briefs d'agents que j'ai moi-même écrits, **77 sur les trois jours**, dont
**24 demandes réelles** et 53 relances ou accusés.

**Méthode.** Chaque ligne porte une mesure prise sur la **production**
(`migen-site.vercel.app`), pas sur l'arbre de travail, pas sur une impression.
La commande qui décide est nommée. Un état sans commande est marqué
« à arbitrer » : c'est une décision, pas une tâche.

---

## Ce qui est fait, et mesuré

| # | Demande, mot pour mot | Mesure du 14/10 |
|---|---|---|
| 1 | « trouve le secteur d'activité du cas client et mets en fonction la photo » (11/10) | `/expertises/soudure/` : 0 rail, 3 liens vers les cas. 120 citations hors sujet retirées sur 331, 34 pages |
| 2 | « les cas clients cités ne correspondent pas à l'expertise » | Porte `verifie-cas-par-offre.mjs` verte, témoin 5 fautes injectées sur 5 vues |
| 3 | « c'est que des photos avec des avions » sur `/offres/` (12/10) | `/offres/` : aucune photo d'avion, d'aviation ni de menuiserie |
| 4 | « les Bento offres et secteurs ne changent pas d'image » (12/10) | `/offres/` 19 photos dont 15 distinctes, `/secteurs/` 18 dont 14, accueil 9 dont 8 |
| 5 | « il manque une offre, Maintenance tuyauterie n'en est pas une » (12/10) | Les six offres sont listées, la tuyauterie n'y figure plus comme offre |
| 6 | Nathan : « ultra spé résidence comme si c'était la seule offre » (13/10) | Description lue par Google : **3 métiers sur 3** nommés. Six portes vers les offres posées |
| 7 | « il manque la partie consentement à cocher », puis « pas besoin » (13/10) | Case à cocher 0, ta phrase servie, mention RGPD conservée |
| 8 | La page implantations et les bassins (13/10) | Mosaïque de tuiles photo, panneau des 11 régions, 48 villes |
| 9 | « CA DOIT ÊTRE SUR TOUTES LES PAGES » (repli mobile, 13/10) | `/carriere/` 13 sections repliables, `/offres/residence/` 9. **Partiel, voir plus bas** |
| 10 | Le formulaire doit déposer un lead (12 au 13/10) | Deux blocages trouvés et levés : `HUBSPOT_FORM_ID` absent, et `company` qui doit partir sur l'objet Société. Les six champs obligatoires et les cinq d'enrichissement sont acceptés, vérifié contre le portail |
| 11 | TeamTailor : « je peux pas la publier, elle va être publiée sur les jobboards » | Une offre `unlisted` accepte les candidatures sans partir sur les jobboards. Prouvé sur l'offre 8200692, 79 candidats actifs |
| 12 | « donne-moi le lien pour Supabase » | Fourni |
| 13 | « les traceurs, tu parles de quoi exactement » | Expliqué |

---

## Ce qui n'est pas fait, et pourquoi

| # | Demande | État mesuré | Ce qui bloque |
|---|---|---|---|
| 14 | « le bloc est clairement mal disposé » sur `/offres/bureau-etudes/` (12/10) | **Signalé deux fois, jamais traité** | Rien. En cours de mesure au navigateur |
| 15 | Le même sur `/travaux-industriels/` (12/10) | **Jamais traité** | Rien. En cours |
| 16 | « Les prestations regroupées ici : pas assez complet » (12/10) | **Jamais traité** | À mesurer : la page affiche-t-elle tout ce que le corpus contient, ou manque-t-il de la matière ? |
| 17 | « la page `/contact/` ne respecte pas la maquette » (12/10) | **Traité en partie** : la carte candidature qui coupait le parcours a été retirée. Jamais comparé bloc par bloc | Rien. En cours |
| 18 | Une photo d'avion sur `/expertises/mecanique/lubrification/` | **DÉFAUT EN PRODUCTION**, trouvé le 14/10 | Rien. En cours |
| 19 | « la photo de Bordeaux est mal cadrée » (12/10) | Aucune photo nommée Bordeaux n'est servie sur l'accueil aujourd'hui | À remesurer au navigateur |
| 20 | « la photo de Metz ne correspond pas » (12/10) | Metz est servi **sans photo**, délibérément | **Toi** : Metz et Dijon n'ont aucune photo sous licence. Choix assumé plutôt qu'une photo fausse |
| 21 | Porter la maquette mobile v2 (13/10) | **Non fait** | Rien, sinon le volume : onze gabarits et trois hauts de page sur mesure |
| 22 | Le h1 de `/nous-connaitre/` nomme un métier sur trois | **À arbitrer** | Si ce titre vient de la maquette, c'est ta copie et je ne la réécris pas |
| 23 | « un fichier avec le texte de toutes les LP sur go.migengroup.com » (12/10) | **Non fait** | Autre projet que ce site |
| 24 | Six pages d'expertise n'ont plus aucune étude de cas | **À arbitrer** | Commander les études manquantes, ou accepter la bande sans carte |

---

---

## Le défaut que la repasse a trouvé, et pourquoi il avait survécu

Tu redemandes aujourd'hui « les images bien placées ». La porte qui surveille
le sujet des photos, `scripts/verifie-photo-sujet.mjs`, rendait **11
signalements** sur la production. **Dix étaient faux.**

Elle reprochait à la page JELD-WEN de montrer de la menuiserie. Or JELD-WEN
**est** un menuisier. Même chose pour Autoliv, Stellantis et Eaton avec
l'automobile, Tournaire avec la pharmacie, VPK avec le bois.

La cause est une contradiction entre deux règles posées le même jour :

1. « Aucune photo de menuiserie, d'aviation ou de salle blanche sur une page
   commerciale », parce qu'un avion fait croire à un autre métier.
2. « La photo d'une page de cas montre le secteur du cas. »

Tant que `/preuves/` figurait dans la liste des pages commerciales, la
règle 1 battait la règle 2, et la porte criait au loup dix fois sur onze.
**Une porte qu'on n'écoute plus ne protège plus rien** : le onzième
signalement, le vrai, se cachait dans le bruit. C'est une photo d'avion sur
`/expertises/mecanique/lubrification/`, qui est bien une page commerciale, et
c'est exactement ta plainte du 12/10.

Ce qui ne devient pas aveugle pour autant : qu'une page de cas montre **le
sien** de secteur et pas celui d'un autre reste vérifié par
`verifie-photos-du-secteur.mjs`, écrite pour ça. Deux portes, un métier
chacune.

Témoin après correction : **4 fautes injectées sur 4 détectées, 2 exceptions
sur 2 respectées, 1 hors contrôle assumé sur 1**. Une épreuve verrouille la
décision : si quelqu'un remet `/preuves/` dans les pages commerciales en
croyant durcir la porte, le témoin tombe et dit pourquoi.

---

## Les commandes qui décident

Chacune a prouvé qu'elle sait échouer, contrôle négatif à l'appui.

```bash
node /private/tmp/claude-501/-Users-mehdi-Landing-lovable/b8d3f2ba-96ef-42e6-8360-412cd367d62f/scratchpad/inventaire/mesure-prod.mjs
```

```bash
cd ~/"Landing lovable/migen-site" && node scripts/verifie-le-registre.mjs
```

```bash
cd ~/"Landing lovable/migen-site" && node scripts/verifie-cas-par-offre.mjs --controle
```

```bash
cd ~/"Landing lovable/migen-site" && bun run verifie
```

---

## Ce que j'attends de toi, et rien d'autre

1. **Metz et Dijon** : deux photos sous licence, ou la confirmation que les
   tuiles restent sombres.
2. **Les six pages sans étude de cas** (soudure, robotique et ses deux filles,
   tuyauterie et sa fille) : commander les études, ou accepter la bande sans
   carte.
3. **Le h1 de `/nous-connaitre/`** : si « Un seul métier : technicien de
   maintenance » est ta formule, elle reste et je l'écris nulle part ailleurs.
   Si tu veux qu'il nomme les trois métiers, dis-le et je le change.
4. **La société « Z »** que j'ai créée par erreur dans HubSpot le 13/10 à
   18h30 : je ne peux pas supprimer de donnée CRM, il faut la retirer.
