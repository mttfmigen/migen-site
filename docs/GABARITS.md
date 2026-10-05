# Les gabarits de page, et qui sert quoi

Document de référence. Son absence est la cause d'un défaut qui a tenu
plusieurs semaines : cent vingt-six pages étaient servies par un seul gabarit
alors que la maquette en dessine sept, et rien ne le signalait.

## La règle

**Le dessin vient de la maquette. Le texte vient du corpus. Rien ne s'invente.**

Le corpus, ce sont les 185 pages rédigées dans `migen-refonte/seo/`, analysées
par les parseurs de `scripts/` et stockées dans `pages.contenu`. C'est la
substance du référencement : il ne se supprime jamais. Quand la maquette dessine
moins de sections que le corpus n'en porte, le reste est rendu **sous** les
sections de la maquette, avec ses motifs à elle.

## Qui sert quoi

| Famille d'URL | Gabarit | Pages | Composant |
|---|---|---|---|
| `/` | accueil | 1 | `app/page.tsx` |
| `/offres/` | hub offres | 1 | `components/site/offres/` |
| `/offres/<offre>/` | offre | 18 | `components/site/offre/` |
| `/expertises/` | expertises | 1 | `components/site/expertises/` |
| `/expertises/<domaine>/` | domaine (gabarit 09) | 9 | `components/site/domaine/` |
| `/expertises/<domaine>/<page>/` | specialite (gabarit 05) | 10 | `components/site/domaine/` |
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
bun scripts/verifie-offres.tsx
bun scripts/verifie-metier-maquette.tsx
bun components/site/domaine/verification-domaine.tsx
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
