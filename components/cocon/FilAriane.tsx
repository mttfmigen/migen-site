import Link from "next/link";

import styles from "./FilAriane.module.css";

/*
 * Fil d'Ariane du cocon, composant serveur.
 *
 * PORTÉ, et non composé : `maquette/accueil-rendu.html` porte bien un fil
 * d'Ariane, trois fois, mais son séparateur est « / » et non « › », ce qui le
 * fait manquer à qui cherche le chevron. Les trois « › » du fichier (1073,
 * 1077, 1081) sont des puces de mega-menu. Le fil, lui, est aux lignes :
 *
 *   2460 et 2717  le gabarit de vente, alimenté par `sc-for list="cCrumbs"`,
 *                 avec `c.link` pour un niveau cliquable et `c.last` pour la
 *                 page courante. C'est exactement notre cas : des niveaux qui
 *                 viennent d'une donnée, pas d'une liste écrite à la main.
 *   2880          l'écran « Marques maintenues », la même rangée en dur.
 *
 * Le conteneur de la maquette :
 *   display:flex;align-items:center;gap:8px;font:400 13px var(--fb);
 *   color:var(--ink4);flex-wrap:wrap
 * Les niveaux cliquables : color:var(--ink4), style-hover color:var(--acc).
 * La page courante : color:var(--ink1).
 *
 * CE QUI CHANGE, et pourquoi. Sur le fond réel du site (--bg, #f1f2f4, la
 * rangée est posée dans un `<main>` sans carte), --ink4 donne 2,21:1 et --acc
 * 2,29:1. Le critère 1.4.3 de la WCAG en demande 4,5. Un fil d'Ariane est de la
 * navigation : il se lit. Les niveaux passent donc à --ink2 (5,02:1) et le
 * survol à --acc-ink (7,98:1), l'orange sombre que la maquette emploie
 * elle-même pour un lien sur fond clair (ligne 1081). Le séparateur « / »,
 * décoratif et masqué aux lecteurs d'écran, garde le --ink4 de la maquette :
 * il ne porte aucune information, et la fidélité y est gratuite.
 * `verification-fil-ariane.tsx` recalcule ces rapports, il ne les croit pas.
 *
 * POURQUOI les couleurs des niveaux vivent dans le module CSS et non en style
 * en ligne, contrairement au conteneur : un style en ligne React gagne contre
 * TOUTE règle CSS, le `:hover` du module serait resté lettre morte. Même raison
 * que dans `PiedDePage.tsx`. Aucun `!important` n'a donc été nécessaire : les
 * feuilles ne portent aucun style en ligne à battre.
 *
 * POURQUOI pas le `margin-bottom:24px` de la maquette : là-bas, le fil et le h1
 * partagent une même `<section>`. Ici, chaque gabarit pose déjà le fil dans sa
 * propre section (`padding: 24px 40px 0`) suivie d'une autre qui porte son
 * écart haut. Le reprendre ajouterait 24 px à un espacement déjà réglé.
 */

interface Etape {
  readonly titre: string;
  readonly path: string | null;
}

/* La rangée, telle que la maquette la déclare (2880). `listStyle`, `margin` et
   `padding` sont remis à zéro parce que la maquette emploie un `<div>` là où
   nous employons un `<ol>` : la liste ordonnée dit la hiérarchie aux lecteurs
   d'écran, et ne doit pas pour autant sortir des puces sur chaque page. */
const RANGEE = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
  font: "400 13px var(--fb)",
  color: "var(--ink4)",
  listStyle: "none",
  margin: 0,
  padding: 0,
} as const;

/** Un niveau et son séparateur : même écart de 8 px que la rangée. */
const NIVEAU = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
} as const;

/**
 * La rangée seule, sans lecture en base, pour que le contrôle puisse la rendre.
 *
 * Un niveau arrive avec `path: null` quand aucune page n'est publiée à ce
 * chemin : il s'affiche en texte. Le visiteur voit la hiérarchie complète sans
 * pouvoir cliquer vers une 404.
 */
export function FilArianeVue({ etapes }: { etapes: readonly Etape[] }) {
  if (etapes.length === 0) return null;

  return (
    <nav aria-label="Fil d'Ariane">
      <ol style={RANGEE}>
        <li>
          <Link href="/" className={styles.niveau}>
            Accueil
          </Link>
        </li>
        {etapes.map((etape, i) => {
          const dernier = i === etapes.length - 1;
          return (
            <li key={etape.path ?? `niveau-${i}`} style={NIVEAU}>
              {/* Séparateur décoratif : masqué aux lecteurs d'écran, qui
                  annoncent déjà la structure de la liste. */}
              <span aria-hidden="true">/</span>
              {etape.path && !dernier ? (
                <Link href={etape.path} className={styles.niveau}>
                  {etape.titre}
                </Link>
              ) : (
                <span
                  aria-current={dernier ? "page" : undefined}
                  className={dernier ? styles.courant : styles.niveau}
                >
                  {etape.titre}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default async function FilAriane({ path }: { path: string }) {
  /* `@/lib/contenu` porte `import "server-only"`, qui lève à la seule
     résolution du module hors d'un rendu serveur. Importé en tête de fichier, il
     rendait `FilArianeVue` irrécupérable pour un contrôle en ligne de commande,
     et donc le composant invérifiable sans base. L'import est ici, dans la seule
     branche qui lit la base. Le garde-fou du bundler, lui, est intact : Next
     refuse toujours ce module à un composant client, statique ou dynamique. */
  const { filAriane } = await import("@/lib/contenu");
  return <FilArianeVue etapes={await filAriane(path)} />;
}
