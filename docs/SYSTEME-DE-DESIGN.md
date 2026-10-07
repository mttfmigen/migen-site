# La charte du client, et ce qu'elle dit de la nôtre

Mesure du 07/10. Importé depuis le projet Claude Design
`a05a7cf5-b229-4547-bb3e-4dbe5b579983`, fichier
`_ds/migen-design-system-9ce37c32-23d6-4e4d-99b9-d1f687cedd06/colors_and_type.css`.

Copie conservée telle quelle, sans retouche, dans
`maquette/systeme-de-design.css` : 5 799 octets, la taille exacte annoncée par
le serveur de Claude Design.

> Ce document mesure, il ne corrige rien. Un jeton de charte touche toutes les
> pages : chaque divergence est en section 5, à trancher par Mehdi.

## 1. Le fait décisif : cette charte est déjà dans la référence, et elle n'y sert à rien

La référence du portage reste le rendu de `maquette/site-final-autonome.html`
(décision du 06/10, inchangée). Or ce fichier de 24 Mo **contient déjà ce
système de design**, dans une balise `<style>` à l'offset 22 604 639.

Vérifié ligne par ligne : après neutralisation de la livraison des polices, les
154 lignes du bloc embarqué et les 154 lignes du fichier source sont
**identiques, zéro ligne divergente**. Seule la livraison des polices change :
le fichier source fait deux `@import` vers Google Fonts, la version embarquée
dans l'application remplace ces deux lignes par 33 blocs `@font-face` pointant
des `.woff2` locaux (les polices ont été rapatriées dans le paquet du client).

Et voici ce qui compte. Dans les 24 Mo de l'application de référence,
**aucun des 73 jetons de la charte n'est utilisé en dehors de son propre
bloc** : zéro occurrence de `var(--accent)`, `var(--fg)`, `var(--text-3xl)`,
`var(--space-5)` et des 69 autres, hors du bloc qui les déclare. Les neuf
classes typographiques (`.t-kicker`, `.t-script`, `.t-h1` à `.t-h4`,
`.t-lead`, `.t-body`, `.t-meta`) sont posées **zéro fois** dans le balisage.

L'application déclare son propre `:root` 446 caractères après la fin du bloc de
la charte (offset 22 622 782). Même spécificité, déclaré après : c'est lui qui
gagne, et c'est lui que le visiteur voit.

**Conclusion mesurée, pas supposée** : dans la maquette comme chez nous, ce
système de design est une **déclaration d'intention** posée à côté du rendu,
pas la source du rendu. Notre `app/globals.css` reproduit la couche qui gagne,
celle du `:root` de l'application : c'est la bonne couche. Importer la charte
dans le site ne bougerait aucun pixel, à une exception près, la collision de
nom du point 5.1.

## 2. Nos 38 jetons viennent du rendu, et cela se vérifie

Nos jetons ne viennent pas de la charte, ils viennent du `:root` de
l'application de référence. Chacun des 38 a été confronté à ce `:root` :

| Verdict | Nombre | Jetons |
|---|---|---|
| Valeur identique à la référence | 31 | `--ft`, `--gl-a`, `--acc`, `--acc-d`, `--acc-w`, `--acc-ink`, `--rad`, `--rad-s`, `--sec`, `--sat`, `--ph-op`, `--ts`, `--tr`, `--bg`, `--card`, `--panel`, `--foot`, `--ink`, `--ink1`, `--ink2`, `--ink3`, `--ink4`, `--line`, `--chip`, `--gbd`, `--gsol`, `--ph`, `--sheet`, `--logo-f`, `--map-a`, `--map-b` |
| Même police, autre mécanisme | 1 | `--fb` : la référence écrit `'Poppins', var(--ft)`, nous écrivons `var(--font-poppins), var(--ft)`, police auto-hébergée par `next/font`, câblée dans `app/layout.tsx` |
| **Valeur différente de la référence** | 1 | `--gl-b` : la référence déclare `22px`, nous portons `22.5px`. Voir 5.2 |
| Absents de la référence, et justifiés en commentaire | 5 | `--err`, `--err-w`, `--ok`, `--ok-w` (la maquette ne montre jamais une erreur de saisie ni une confirmation), `--fs` (la police manuscrite n'est pas câblée dans l'application) |

## 3. Les 73 jetons de la charte, un par un

Les valeurs se comparent **normalisées** : `#FFF` et `#ffffff` sont la même,
`rgba(28,27,25,.09)` et `rgba(28, 27, 25, 0.09)` aussi, et les chaînes
`var(--x)` sont résolues jusqu'à leur valeur littérale.

| Jeton de la charte | Valeur déclarée | Valeur résolue | Chez nous | Verdict |
|---|---|---|---|---|
| `--orange` | `#ff7c3c` | `#ff7c3c` | `--acc` | même valeur, autre nom |
| `--gris-souris` | `#fafafa` | `#fafafa` | rien | **absent** |
| `--gris-profond` | `#737373` | `#737373` | `--ink3` | même valeur, autre nom |
| `--gris-marrone` | `#363430` | `#363430` | rien | **absent** |
| `--noir` | `#000000` | `#000000` | rien | **absent** |
| `--orange-600` | `#f4641f` | `#f4641f` | `--acc-d` | même valeur, autre nom |
| `--orange-700` | `#d9520f` | `#d9520f` | rien | **absent** |
| `--orange-100` | `#ffe7d9` | `#ffe7d9` | rien | **absent** |
| `--orange-050` | `#fff4ee` | `#fff4ee` | rien | **absent** |
| `--gris-000` | `#ffffff` | `#ffffff` | `--card` | même valeur, autre nom |
| `--gris-050` | `#fafafa` | `#fafafa` | rien | **absent** |
| `--gris-100` | `#f2f1ef` | `#f2f1ef` | rien | **absent** |
| `--gris-200` | `#e5e3df` | `#e5e3df` | rien | **absent** |
| `--gris-300` | `#d2cfc9` | `#d2cfc9` | rien | **absent** |
| `--gris-400` | `#a8a49d` | `#a8a49d` | `--ink4` | même valeur, autre nom |
| `--gris-500` | `#737373` | `#737373` | `--ink3` | même valeur, autre nom |
| `--gris-700` | `#4a4845` | `#4a4845` | `--ink1` | même valeur, autre nom |
| `--gris-900` | `#363430` | `#363430` | rien | **absent** |
| `--gris-950` | `#1c1b19` | `#1c1b19` | `--panel`, `--ink` | même valeur, autre nom |
| `--bg` | `var(--gris-000)` | `#ffffff` | `--bg` = `#f1f2f4` | **collision de nom, valeur différente** |
| `--bg-alt` | `var(--gris-050)` | `#fafafa` | rien | **absent** |
| `--bg-inverse` | `var(--gris-950)` | `#1c1b19` | `--panel`, `--ink` | même valeur, autre nom |
| `--surface` | `#ffffff` | `#ffffff` | `--card` | même valeur, autre nom |
| `--fg` | `var(--gris-900)` | `#363430` | rien | **absent** |
| `--fg-muted` | `var(--gris-500)` | `#737373` | `--ink3` | même valeur, autre nom |
| `--fg-faint` | `var(--gris-400)` | `#a8a49d` | `--ink4` | même valeur, autre nom |
| `--fg-inverse` | `#ffffff` | `#ffffff` | `--card` | même valeur, autre nom |
| `--accent` | `var(--orange)` | `#ff7c3c` | `--acc` | même valeur, autre nom |
| `--accent-hover` | `var(--orange-600)` | `#f4641f` | `--acc-d` | même valeur, autre nom |
| `--accent-press` | `var(--orange-700)` | `#d9520f` | rien | **absent** |
| `--on-accent` | `#ffffff` | `#ffffff` | `--card` | même valeur, autre nom |
| `--border` | `var(--gris-200)` | `#e5e3df` | rien | **absent** |
| `--border-strong` | `var(--gris-300)` | `#d2cfc9` | rien | **absent** |
| `--ring` | `color-mix(in oklch, var(--orange) 45%, transparent)` | `color-mix(in oklch,var(--orange) 45%,transparent)` | rien | **absent** |
| `--font-title` | `'Poppins', system-ui, sans-serif` | `'poppins',system-ui,sans-serif` | rien | **absent** |
| `--font-body` | `'Poppins', system-ui, sans-serif` | `'poppins',system-ui,sans-serif` | rien | **absent** |
| `--font-script` | `'Caveat', 'Poppins', cursive` | `'caveat','poppins',cursive` | rien | **absent** |
| `--font-mono` | `ui-monospace, 'SFMono-Regular', 'Menlo', monospace` | `ui-monospace,'sfmono-regular','menlo',monospace` | rien | **absent** |
| `--text-xs` | `0.75rem` | `0.75rem` | rien | **absent** |
| `--text-sm` | `0.875rem` | `0.875rem` | rien | **absent** |
| `--text-base` | `1rem` | `1rem` | rien | **absent** |
| `--text-lg` | `1.25rem` | `1.25rem` | rien | **absent** |
| `--text-xl` | `1.563rem` | `1.563rem` | rien | **absent** |
| `--text-2xl` | `1.953rem` | `1.953rem` | rien | **absent** |
| `--text-3xl` | `2.441rem` | `2.441rem` | rien | **absent** |
| `--text-4xl` | `3.052rem` | `3.052rem` | rien | **absent** |
| `--text-5xl` | `3.815rem` | `3.815rem` | rien | **absent** |
| `--text-6xl` | `4.768rem` | `4.768rem` | rien | **absent** |
| `--leading-tight` | `1.05` | `1.05` | rien | **absent** |
| `--leading-snug` | `1.2` | `1.2` | rien | **absent** |
| `--leading-normal` | `1.6` | `1.6` | rien | **absent** |
| `--tracking-tight` | `-0.02em` | `-0.02em` | rien | **absent** |
| `--tracking-wide` | `0.08em` | `0.08em` | rien | **absent** |
| `--space-1` | `4px` | `4px` | rien | **absent** |
| `--space-2` | `8px` | `8px` | rien | **absent** |
| `--space-3` | `12px` | `12px` | rien | **absent** |
| `--space-4` | `16px` | `16px` | rien | **absent** |
| `--space-5` | `24px` | `24px` | rien | **absent** |
| `--space-6` | `32px` | `32px` | rien | **absent** |
| `--space-7` | `48px` | `48px` | rien | **absent** |
| `--space-8` | `64px` | `64px` | rien | **absent** |
| `--space-9` | `96px` | `96px` | rien | **absent** |
| `--space-10` | `128px` | `128px` | rien | **absent** |
| `--radius-xs` | `4px` | `4px` | rien | **absent** |
| `--radius-sm` | `8px` | `8px` | rien | **absent** |
| `--radius-md` | `12px` | `12px` | rien | **absent** |
| `--radius-lg` | `18px` | `18px` | `--rad-s` | même valeur, autre nom |
| `--radius-xl` | `28px` | `28px` | `--rad` | même valeur, autre nom |
| `--radius-pill` | `999px` | `999px` | rien | **absent** |
| `--shadow-sm` | `0 1px 2px rgba(28,27,25,.06), 0 1px 1px rgba(28,27,25,.04)` | `0 1px 2px rgb(28,27,25,0.06),0 1px 1px rgb(28,27,25,0.04)` | rien | **absent** |
| `--shadow-md` | `0 4px 14px rgba(28,27,25,.08)` | `0 4px 14px rgb(28,27,25,0.08)` | rien | **absent** |
| `--shadow-lg` | `0 18px 48px rgba(28,27,25,.14)` | `0 18px 48px rgb(28,27,25,0.14)` | rien | **absent** |
| `--shadow-accent` | `0 10px 30px rgba(255,124,60,.32)` | `0 10px 30px rgb(255,124,60,0.32)` | rien | **absent** |

Récapitulatif des 73 jetons de la charte : 0 identiques (même nom et même valeur), 18 présents sous un autre nom avec la même valeur, 1 en collision de nom avec une valeur différente, 54 absents.

## 4. Sens inverse : nos 38 jetons, lesquels viennent de la charte

| Notre jeton | Valeur | Usages `var()` dans `app/`, `components/`, `lib/` | Origine |
|---|---|---|---|
| `--ft` | `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif` | 290 | hors charte |
| `--fb` | `var(--font-poppins), var(--ft)` | 610 | hors charte |
| `--fs` | `var(--font-caveat), var(--fb)` | 0 | hors charte |
| `--gl-a` | `0.62` | 43 | hors charte |
| `--gl-b` | `22.5px` | 81 | hors charte |
| `--acc` | `#ff7c3c` | 293 | valeur de la charte sous un autre nom : `--orange`, `--accent` |
| `--acc-d` | `#f4641f` | 3 | valeur de la charte sous un autre nom : `--orange-600`, `--accent-hover` |
| `--acc-w` | `rgba(255, 124, 60, 0.11)` | 33 | hors charte |
| `--acc-ink` | `#7d3309` | 46 | hors charte |
| `--err` | `#b3261e` | 2 | hors charte |
| `--err-w` | `rgba(179, 38, 30, 0.09)` | 0 | hors charte |
| `--ok` | `#1b5e20` | 1 | hors charte |
| `--ok-w` | `rgba(27, 94, 32, 0.09)` | 0 | hors charte |
| `--rad` | `28px` | 88 | valeur de la charte sous un autre nom : `--radius-xl` |
| `--rad-s` | `18px` | 32 | valeur de la charte sous un autre nom : `--radius-lg` |
| `--sec` | `120px` | 108 | hors charte |
| `--sat` | `0.55` | 29 | hors charte |
| `--ph-op` | `1` | 16 | hors charte |
| `--ts` | `1` | 186 | hors charte |
| `--tr` | `200ms` | 133 | hors charte |
| `--bg` | `#f1f2f4` | 7 | **collision de nom** (la charte dit `#ffffff`) |
| `--card` | `#fff` | 51 | valeur de la charte sous un autre nom : `--gris-000`, `--bg`, `--surface`, `--fg-inverse`, `--on-accent` |
| `--panel` | `#1c1b19` | 32 | valeur de la charte sous un autre nom : `--gris-950`, `--bg-inverse` |
| `--foot` | `#141312` | 3 | hors charte |
| `--ink` | `#1c1b19` | 163 | valeur de la charte sous un autre nom : `--gris-950`, `--bg-inverse` |
| `--ink1` | `#4a4845` | 97 | valeur de la charte sous un autre nom : `--gris-700` |
| `--ink2` | `#6a6764` | 162 | hors charte |
| `--ink3` | `#737373` | 29 | valeur de la charte sous un autre nom : `--gris-profond`, `--gris-500`, `--fg-muted` |
| `--ink4` | `#a8a49d` | 54 | valeur de la charte sous un autre nom : `--gris-400`, `--fg-faint` |
| `--line` | `rgba(28, 27, 25, 0.09)` | 123 | hors charte |
| `--chip` | `rgba(28, 27, 25, 0.055)` | 30 | hors charte |
| `--gbd` | `rgba(255, 255, 255, 0.82)` | 48 | hors charte |
| `--gsol` | `rgba(255, 255, 255, 0.8)` | 16 | hors charte |
| `--ph` | `#dedfe1` | 26 | hors charte |
| `--sheet` | `rgba(250, 250, 251, 0.9)` | 1 | hors charte |
| `--logo-f` | `grayscale(1)` | 0 | hors charte |
| `--map-a` | `rgba(255, 255, 255, 0.95)` | 0 | hors charte |
| `--map-b` | `rgba(255, 255, 255, 0.55)` | 0 | hors charte |

Récapitulatif de nos 38 jetons : 0 repris de la charte à l'identique, nom et valeur, 10 portant une valeur de la charte sous un autre nom, 1 en collision de nom, 27 sans équivalent dans la charte.

## 5. Les divergences, mesurées, à trancher par Mehdi

Aucune n'est corrigée. Chacune porte sa mesure et le périmètre que le changement
ferait bouger.

### 5.1 `--bg` : le seul nom qui collisionne, et il porte le fond de tout le site

| | Valeur | Source |
|---|---|---|
| Charte du client | `#ffffff` (`var(--gris-000)`) | `colors_and_type.css` |
| Notre `app/globals.css` | `#f1f2f4` | identique au `:root` de l'application de référence |

C'est le **seul** nom de la charte présent dans notre code : 7 usages de
`var(--bg)`, dans `app/globals.css`,
`components/formulaire/FormulaireContact.tsx`,
`components/site/TiroirMobile.tsx`,
`components/site/accueil/MethodeQuatreEtapes.module.css`,
`components/site/equipe/NotreHistoire.tsx`. S'y ajoutent les fonds de `body` et
de `.mg-site`, qui lisent le même jeton.

Ce que le changement ferait bouger : **le fond crème de toutes les pages
deviendrait blanc**, plus le fond du tiroir mobile et celui du formulaire. La
référence dit `#f1f2f4`, donc c'est la charte qui s'écarte du rendu validé, pas
nous. Conséquence pratique : si un jour quelqu'un importe
`maquette/systeme-de-design.css` dans la cascade du site, il doit l'importer
**avant** le `:root` de `globals.css`, jamais après. En l'état, le fichier est
rangé dans `maquette/`, hors de la cascade, et ne risque rien.

### 5.2 `--gl-b` : 0,5 px d'écart avec la référence, sur 81 usages

Notre valeur `22.5px` ne vient pas de la référence, qui déclare `22px` une seule
fois et s'en sert 822 fois. Le commentaire au-dessus dans `app/globals.css` ne
justifie par une mesure que `--gl-a: 0.62`, pas le flou. Chez nous, 81 usages
dans 39 fichiers, le flou du verre dépoli.

Ce que le changement ferait bouger : 0,5 px de flou sur toutes les surfaces en
verre. Invisible à l'oeil, mais c'est un écart avec la référence, donc il se
signale au lieu de se corriger. Un caractère à retirer si Mehdi confirme que la
référence fait foi jusque-là.

### 5.3 `--fg` : la charte veut un texte plus clair que le nôtre

| | Valeur | Contraste sur blanc | Contraste sur le crème `#f1f2f4` |
|---|---|---|---|
| Charte, `--fg` (`--gris-900`, `--gris-marrone`) | `#363430` | 12,42:1 | 11,09:1 |
| Notre `--ink`, identique à la référence | `#1c1b19` | 17,21:1 | 15,36:1 |

`#363430` n'apparaît **0 fois** dans notre code : le presque-noir chaud de la
charte n'est nulle part sur le site. Notre encre principale est le `--gris-950`
de la charte, ce qui est cohérent avec le rendu de référence.

Ce que le changement ferait bouger : `var(--ink)`, 163 usages dans 99 fichiers,
c'est-à-dire la couleur du texte de tout le site. Les deux valeurs passent AA
très largement. Décision de charte, pas décision technique.

### 5.4 `--orange-700` : la charte annonce un orange de contraste qui ne passe pas AA

La charte déclare `--orange-700: #d9520f` avec le commentaire « texte sur fond
clair (contraste) ». Mesure :

| Couleur | Rôle déclaré | Sur blanc | Sur le crème `#f1f2f4` | Plancher AA texte courant |
|---|---|---|---|---|
| `#d9520f`, charte `--orange-700` et `--accent-press` | texte sur fond clair | **4,07:1** | **3,63:1** | 4,5:1 |
| `#7d3309`, notre `--acc-ink`, identique à la référence | encre orange | 8,94:1 | 7,98:1 | 4,5:1 |
| `#ff7c3c`, `--acc` et charte `--accent` | couleur de marque | 2,56:1 | 2,29:1 | 4,5:1 |

L'orange de contraste de la charte **échoue** au plancher AA pour du texte
courant, sur blanc comme sur notre fond. Le nôtre passe. Et les 2,56:1 de
l'orange de marque confirment, depuis la charte elle-même, la mesure déjà
inscrite à l'arbitrage ouvert n° 7 de `docs/PASSATION.md`.

Ce que le changement ferait bouger : `var(--acc-ink)`, 46 usages dans 31
fichiers. Adopter `#d9520f` ferait **perdre** la conformité AA sur ces 46
usages. À ne pas faire sans que Mehdi le décide en connaissance de cause.

### 5.5 `--border` : la charte veut une bordure opaque et chaude, le rendu une transparence

| | Valeur | Rendu sur le crème `#f1f2f4` | Rendu sur blanc |
|---|---|---|---|
| Charte, `--border` (`--gris-200`) | `#e5e3df` | `#e5e3df` | `#e5e3df` |
| Notre `--line`, identique à la référence | `rgba(28,27,25,0.09)` | `#dedfe0` | `#ebeaea` |

Deux différences, pas une : la teinte (la charte est chaude, 229/227/223, la
nôtre est neutre à froide) et la **nature** (une opacité s'adapte au fond, une
couleur opaque non). La charte propose aussi `--border-strong: #d2cfc9`, que
nous n'avons pas du tout.

Ce que le changement ferait bouger : `var(--line)`, 123 usages dans 83 fichiers,
toutes les séparations du site.

### 5.6 Tout l'étage structurel de la charte est absent, des deux côtés

Absents de notre `globals.css`, et utilisés **zéro fois** dans l'application de
référence : l'échelle typographique (`--text-xs` à `--text-6xl`, 10 pas, tierce
majeure 1,250), l'espacement (`--space-1` à `--space-10`, base 4 px), les
interlignes (`--leading-tight`, `--leading-snug`, `--leading-normal`), les
interlettrages (`--tracking-tight`, `--tracking-wide`), les quatre ombres,
quatre des six rayons (`--radius-xs`, `--radius-sm`, `--radius-md`,
`--radius-pill` ; seuls `--radius-lg` 18 px et `--radius-xl` 28 px existent chez
nous, sous les noms `--rad-s` et `--rad`), `--ring`, `--font-mono`, et les neuf
classes `.t-*`.

Ce n'est pas un défaut : c'est un étage que personne n'a jamais branché, ni le
client dans sa maquette, ni nous. La question pour Mehdi n'est donc pas
« pourquoi manque-t-il », c'est : **est-ce qu'on l'adopte** pour les mises en
page neuves, aujourd'hui couvertes par Tailwind, ou est-ce que
`maquette/systeme-de-design.css` reste une pièce d'archive de la charte ?

### 5.7 La police manuscrite de la charte est chargée et jamais affichée

La charte déclare `--font-script: 'Caveat', 'Poppins', cursive`, avec la mention
explicite que **Caveat est un SUBSTITUT de « Bryndan », police commerciale non
fournie, à remplacer par les vrais `.woff2` dès réception**.

Chez nous, Caveat est bien chargée (`app/layout.tsx`, `next/font/google`,
variable `--font-caveat`) et exposée en `--fs`, mais `var(--fs)` est utilisé
**0 fois** dans `app/`, `components/` et `lib/`, et le mot « caveat »
n'apparaît nulle part ailleurs. Dans l'application de référence, `var(--fs)`
est aussi utilisé 0 fois : le jeton n'y est même pas déclaré.

Deux décisions pour Mehdi : réclamer les fichiers Bryndan au client, et décider
si la police manuscrite doit servir quelque part (la charte lui réserve
`.t-script`) ou cesser d'être chargée, puisqu'elle coûte une requête et des
octets pour rien.

## 6. Ce que je n'ai pas touché, et pourquoi

- **Aucune ligne de `app/globals.css`**, aucun composant, aucun jeton. Les sept
  points de la section 5 sont des décisions de charte : ils touchent de 7 à 163
  usages chacun, sur toutes les pages.
- **La règle de référence est inchangée** : le rendu de
  `maquette/site-final-autonome.html` fait foi. Ce document ne fait que
  constater que la charte du client y est présente, inerte, et que notre
  `globals.css` reproduit la couche qui gagne.
- **`maquette/systeme-de-design.css` est hors de la cascade du site** : il n'est
  importé par rien. C'est voulu, à cause de la collision `--bg` du point 5.1.
- Les deux `@import` Google Fonts du fichier du client sont conservés **tels
  quels** dans la copie, bien que notre site auto-héberge ses polices par
  `next/font` : la consigne était d'importer sans retouche.
- `--logo-f`, `--map-a` et `--map-b` sont déclarés chez nous et utilisés 0 fois.
  Mesure : ils sont aussi utilisés 0 fois dans l'application de référence. Poids
  mort hérité fidèlement, rien à corriger.

## 7. Comment refaire la mesure

```bash
# 1. l'import est exact : la copie pèse les 5 799 octets annoncés par le serveur
wc -c maquette/systeme-de-design.css

# 2. la charte est bien dans la référence, et identique à la copie
python3 - <<'EOF'
import re
s=open('maquette/site-final-autonome.html',encoding='utf-8').read()
blk=s[22604639:22622336][len('<style>'):]
out=(blk.replace('\\u002F','/').replace('\\n','\n')
        .replace('\\"','"').replace("\\'","'").replace('\\\\','\\'))
def clean(t):
    t=re.sub(r'@font-face \{[^}]*\}\n?','',t)
    t=re.sub(r'/\* [a-z-]+ \*/\n','',t)
    t=re.sub(r"@import url\([^)]*\);\n?",'',t)
    return [l for l in t.splitlines() if l.strip()]
a=clean(out); b=clean(open('maquette/systeme-de-design.css',encoding='utf-8').read())
print(len(a),'/',len(b),'lignes, divergentes :',sum(1 for x,y in zip(a,b) if x!=y))
EOF

# 3. aucun jeton de la charte n'est utilisé hors de son bloc, dans la référence
#    ni dans notre code (sauf --bg, point 5.1)
grep -rohE "var\(--(accent|fg|text-3xl|space-5|radius-md|shadow-md)[,)]" app components lib | wc -l
```
