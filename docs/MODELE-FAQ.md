# Modèle FAQ de référence du site

> Consigne de Mehdi, 06/10 : « Les FAQ n'ont pas toutes le même modèle. Le
> modèle de référence est celui de /offres/residence/. » La section « Vos
> questions avant de nous appeler » de cette page est donc LE modèle de FAQ du
> site entier. Toute page qui porte une FAQ reprend ce modèle-là, pas un autre.

## Où il vit

- **Référence rendue** : `maquette/rendu/offres--residence.html`, section
  `data-screen-label="09 Questions"` (vers la ligne 360). Chaque propriété CSS
  y est lisible en ligne : c'est la source des valeurs exactes.
- **Composant qui la reproduit** : `components/site/offre/QuestionsOffre.tsx`,
  états survol/ouvert dans `components/site/offre/PageOffre.module.css`
  (`.pliQuestion`, `.pliPlus`), responsive dans `app/globals.css` (`.mg-r2`).
- **Habillage partagé** : `components/site/blocs/habillage.ts`
  (`SECTION`, `LARGEUR`, `SURTITRE`, `VERRE`).
- **Preuve de conformité** : section 13/14 du diff visuel à 1,6 % de pixels
  divergents (oracle `scripts/diff-visuel-offre.mjs`, passage du 06/10).

## Structure, de haut en bas

```
<section>  padding: var(--sec) 0 0           (120px, 64px sous 760px)
  <div>    max-width: 1200px; margin: 0 auto; padding: 0 40px
    EN-TÊTE  grille 2 colonnes égales minmax(0,1fr), gap 24px 56px,
             align-items: end, margin-bottom: 30px
      colonne gauche :
        surtitre  « Questions fréquentes »
        h2        « Vos questions avant de nous appeler » (titre fixe du gabarit)
      colonne droite :
        chapeau   fixe : « Délais, sécurité, qui intervient, comment on
                  démarre : les réponses aux questions que nos clients posent
                  avant de signer. »
    CORPS    grille 2 colonnes égales minmax(0,1fr), gap 12px, align-items: start
      colonne gauche  : questions 01, 03, 05   (chaque colonne : display grid,
      colonne droite  : questions 02, 04, 06    gap 12px, align-content start)
```

Deux points qui distinguent CE modèle des autres FAQ possibles :

1. **Numérotation en zigzag** : 01/03/05 à gauche, 02/04/06 à droite. L'ordre
   du corpus reste l'ordre de lecture visuel (gauche-droite, ligne par ligne).
   Dans le composant : `questions.filter((_, i) => i % 2 === 0)` à gauche,
   `i % 2 === 1` à droite, numéro `rang + 1` sur deux chiffres (`01`, `02`...).
2. **Pli natif `<details>/<summary>`** : pas de JavaScript, le `+` pivote à 45
   degrés et passe en orange à l'ouverture.

## Styles clés, valeurs exactes de la maquette

### En-tête de section

| Élément | Valeur |
|---|---|
| Surtitre | `font: 600 11.5px var(--fb)`, `letter-spacing: .14em`, `text-transform: uppercase`, `color: var(--acc)`, `margin-bottom: 16px` |
| H2 | `font: 600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)`, `letter-spacing: -.04em`, `max-width: 18ch` |
| Chapeau | `font: 400 16px/1.65 var(--fb)`, `color: var(--ink2)`, `max-width: 46ch` |

Attention : le H2 de cette section est PLUS PETIT que le `TITRE2` standard des
autres sections (clamp 28/42 contre clamp 30/48, interligne 1.08 contre 1.06,
max-width 18ch contre 22ch). Le chapeau aussi (16px/1.65 contre 16.5px/1.7).
Ne pas reprendre `TITRE2`/`CHAPEAU` de `habillage.ts` pour la FAQ : ce sont les
constantes locales de `QuestionsOffre.tsx` qui portent les bonnes valeurs.

### La carte pliante (`<details>`)

Carte en verre (constante `VERRE` de `habillage.ts`) avec un rayon propre :

```
border-radius: 22px                     (PAS var(--rad) : 22px, spécifique FAQ)
background: rgba(255,255,255,var(--gl-a))
backdrop-filter: blur(var(--gl-b)) saturate(150%)
border: 1px solid var(--gbd)
box-shadow: 0 1px 1px rgba(0,0,0,.04), 0 22px 50px -32px rgba(0,0,0,.3)
```

### Le `<summary>` (ligne question)

```
list-style: none            (plus ::-webkit-details-marker masqué)
cursor: pointer
display: flex; align-items: center; gap: 14px
padding: 20px 22px
```

Trois enfants, dans l'ordre :

| Enfant | Valeur |
|---|---|
| Numéro | `font: 600 11px ui-monospace,Menlo,monospace`, `color: var(--acc)`, `flex: 0 0 auto` |
| Question | `flex: 1 1 0%`, `font: 600 16px/1.4 var(--ft)`, `letter-spacing: -.02em`, `color: var(--ink)` |
| Pastille « + » | `width/height: 30px`, `border-radius: 999px`, `background: var(--chip)`, `color: var(--ink1)`, flex centré, `font: 400 19px/1 var(--fb)`, `transition: transform var(--tr), background var(--tr)` |

### La réponse (`<p>` dans le `<details>`)

```
font: 400 14.5px/1.7 var(--fb)
color: var(--ink2)
margin: 0
padding: 0 22px 22px 51px      (51px à gauche = aligné sous le texte de la question)
```

### État ouvert

```css
.pliQuestion[open] .pliPlus {
  transform: rotate(45deg);    /* le + devient un x */
  background: var(--acc);      /* pastille orange */
  color: #fff;
}
```

### Responsive

Les deux grilles (en-tête et corps) portent la classe `mg-r2` :

```css
@media (max-width: 900px) {
  .mg-r2 { grid-template-columns: minmax(0, 1fr) !important; gap: 36px !important; }
}
```

Sous 900px tout passe en une colonne ; le zigzag redevient alors simplement
l'ordre 01, 03, 05, 02, 04, 06 empilé (gauche puis droite), conforme au rendu
de la maquette au même point de rupture.

## Ce que les autres pages doivent reprendre, et ce qui varie

Reprennent À L'IDENTIQUE : la structure en-tête 2 colonnes + corps 2 colonnes,
le zigzag, le `<details>` en verre rayon 22px, les trois enfants du summary et
toutes les valeurs ci-dessus, l'état ouvert, le point de rupture 900px.

Varient par page : les questions et réponses (elles viennent du corpus de la
page, `section.questions`, jamais inventées), et éventuellement le nombre de
questions (le zigzag se généralise : pairs à gauche, impairs à droite).

À arbitrer par Mehdi si une page d'un autre gabarit a son propre surtitre, H2
ou chapeau dans son corpus : le modèle visuel reste celui-ci, seul le texte de
l'en-tête pourrait changer. Par défaut, reprendre les trois textes fixes du
gabarit offre tels quels n'est PAS correct hors gabarit offre si le corpus de
la page dit autre chose : le corpus fait foi pour le texte, ce modèle fait foi
pour le dessin.

`blocs/Objections.tsx` (gabarit de vente) n'est PAS ce modèle : il ne doit plus
servir de référence FAQ nulle part où ce modèle est attendu.
