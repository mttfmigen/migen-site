# Les gabarits de page, et qui sert quoi

> **Corrigé le 05/10.** Ce document annonçait **sept** gabarits et une règle de
> contenu fausse. Il a envoyé une journée entière de portage contre le mauvais
> modèle. Le client a dû répéter six fois « ça ne ressemble pas » avant qu'on
> trouve la cause ici. Ce qui suit est mesuré sur le rendu de sa maquette.

Document de référence. Son absence est la cause d'un défaut qui a tenu plusieurs
semaines : cent vingt-six pages étaient servies par un seul gabarit, et rien ne
le signalait.

## La référence

**Le rendu de la maquette fait foi**, décision de Mehdi du 05/10. L'application
`maquette/site-final-autonome.html` servie avec son dossier `maquette/contenu/`,
figée page par page dans `maquette/rendu/` par `scripts/capture-maquette.mjs`.

`maquette/site-final.html` empile 33 écrans de démonstration et **n'est le
gabarit d'aucune page**. Ne pas porter contre lui.

## Onze gabarits, nommés par le client

`maquette/contenu/site/index.json` attribue son gabarit à chacune des 248 pages.
On le lit, on ne le devine pas.

| Gabarit | Pages |
|---|---|
| 01 Article et fiche | 38 |
| 02 Étude de cas | 41 |
| 03 Offre et prestation | 28 |
| 04 Ville | 66 |
| 05 Spécialité | 19 |
| 06 Département | 8 |
| 07 Métier et carrière | 13 |
| 08 Secteur | 12 |
| 09 Domaine | 11 |
| 10 Hub de rubrique | 7 |
| 11 Sous-rubrique ressource | 5 |

## La règle

**Le dessin vient du gabarit. Le texte vient du corpus. Rien ne s'invente.**

Ce document disait que le texte du corpus absent de la maquette était rendu
**sous** les sections de la maquette, avec ses motifs à elle. **C'est faux**, et
c'est exactement l'empilement que le client rejetait.

La maquette **consomme le corpus** : elle le charge elle-même, à l'exécution,
depuis `contenu/site/<famille>/<page>.md`. Le corpus n'est pas un supplément
qu'on pose en appendice, c'est le contenu de la page, et il se rend **à
l'intérieur** du gabarit, aux emplacements prévus par le dessin.

Mesuré sur `/offres/residence/`, gabarit « 03 Offre et prestation », 17 sections :

```
 5  Le poste de technicien de maintenance reste vacant…   corpus
 6  Ce que nous faisons, et ce que ça change pour vous     corpus
 8  Un appel. Un plan. Une ligne qui repart.               corpus
 9  Ce que nous garantissons                               corpus
11  Nos références                                         gabarit
13  Vos questions avant de nous appeler                    gabarit
14  Un autre besoin ? Il a son offre.                      gabarit
```

Entrelacé, pas empilé.

## Qui sert quoi

| Famille d'URL | Gabarit | Pages | Composant |
|---|---|---|---|
| `/` | accueil | 1 | `app/page.tsx` |
| `/offres/` | hub offres | 1 | `components/site/offres/` |
| `/offres/<offre>/` | offre | 18 | `components/site/offre/` |
| `/expertises/` | expertises | 1 | `components/site/expertises/` |
| `/expertises/<domaine>/` | domaine | 19 | `components/site/metier/` |
| `/secteurs/<secteur>/` | secteur | 13 | `components/site/secteur/` |
| `/implantations/` | implantations | 1 | `components/site/implantations/` |
| `/implantations/<ville>/` | ville | 42 | `components/site/implantation/` |
| `/implantations/<dept>/` | département | (idem) | `components/site/secteur/` |
| `/carriere/<metier>/` | métier | 13 | `components/site/metier/` |
| `/ressources/<page>/` | ressource | 35 | `components/site/ressource/` |
| `/preuves/<client>/` | fiche | 19 | `components/site/fiche/` |
| `/preuves/`, `/realisations/` | cas clients | 2 | `components/site/casclients/` |
| les 12 écrans uniques | routes | 12 | `app/<segment>/page.tsx` |
| le reste | vente | ~60 | `components/site/blocs/` |

## Comment une page choisit son gabarit

`app/[...slug]/page.tsx` lit la **forme** de `pages.contenu` :

```
contenu.gabarit === "secteur"   -> PageSecteur
contenu.gabarit === "offre"     -> PageOffre
contenu.gabarit === "editorial" -> PageEditoriale
contenu.sections                -> le gabarit de vente
```

**C'est le point à retenir** : un gabarit porté en composant ne change rien tant
que `pages.contenu` ne porte pas son discriminant. Les sept gabarits ont été
écrits en code avant que leurs données existent, et les pages sont restées sur
le gabarit de vente sans que rien ne le signale. C'est exactement ce qui s'est
produit.

## Les données

Elles vivent dans `supabase/import/gabarits-maquette/`, un fichier JSON par page,
141 fichiers. Elles se posent par l'API REST :

```bash
node scripts/importe_rest.mjs --simulation   # dit ce qu'il ferait
node scripts/importe_rest.mjs                # écrit
```

**Jamais par du SQL assemblé** : la couche de permissions refuse toute
instruction portant un point-virgule dans le texte, et le corpus en est plein.
C'est ce qui a tronqué 43 pages. Voir `CLAUDE.md` section 15.

## Les contrôles

Un par gabarit, chacun relit la maquette à chaque exécution et refuse une valeur
écrite de mémoire :

```bash
bun components/site/offre/verification-offre.tsx
bun components/site/secteur/verification-secteur.tsx
bun components/site/implantation/verification-implantation.tsx
bun components/site/offres/verification-offres.tsx
bun components/site/metier/verification-metier.tsx
bun components/site/preuve/verification-preuve.tsx
bun components/site/expertises/specialite/verification-specialite.tsx
bun components/site/expertises/domaine/verification-domaine.tsx
bun scripts/verifie-ressource.tsx
```

Chacun a prouvé qu'il échoue sur une faute injectée avant d'être cru.

## Ce qui reste vide, et pourquoi

Une section de la maquette que le corpus n'alimente pas **ne se rend pas du
tout**, titre compris. Le détail page par page est dans
`RESERVES-CONTENU.md`. En résumé :

- **page d'offre** : 4 sections sur 14 vides, dont trois que les règles du
  projet interdisent de remplir (prix, délais chiffrés).
- **ville et département** : le bandeau photo, les communes couvertes, les
  adresses d'agence. Aucune image, aucune adresse dans le corpus.
- **ressource** : la signature d'auteur, la durée de lecture, la variante métier
  entière (journée type, grille de rémunération).
- **partout** : les visuels. Le corpus ne porte aucune image.
