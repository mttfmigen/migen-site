import Link from "next/link";
import type { CSSProperties } from "react";

import type { Lien } from "@/lib/contenu";
import styles from "./Maillage.module.css";

/**
 * Le maillage interne, habillage seul.
 *
 * Porté du bloc « Pages liées » de la maquette, `maquette/accueil-rendu.html`
 * lignes 2678 à 2691 : c'est le bloc que la maquette place elle-même en bas
 * d'une page de contenu, donc le gabarit à reprendre ici. Les valeurs sont ses
 * styles en ligne, recopiés ; les survols et l'état de focus sont dans
 * `Maillage.module.css`.
 *
 * POURQUOI CE FICHIER EXISTE À PART de `Maillage.tsx` : celui-ci lit la base,
 * donc il importe `lib/contenu`, qui porte `import "server-only"`. Un contrôle
 * lancé par `bun` sur ce module échouerait à l'import, avant la première
 * assertion. L'habillage, lui, ne prend que des liens déjà lus : il se rend
 * sans base, et c'est ce que `verification-maillage.tsx` monte.
 */

export interface GroupeLiens {
  /** Facultatif : la maquette ne nomme pas ses groupes, elle liste à plat. */
  titre?: string;
  liens: Lien[];
}

/** Cible de `aria-labelledby` : le titre de section nomme la navigation. */
const ID_TITRE = "maillage-pages-liees";

/* La maquette ouvre la section par `padding:var(--sec) 0 0` (ligne 2679). Ici
   c'est une marge et non un remplissage : l'appelant fournit déjà la section et
   ses 40 px de gouttière. `--sec` retombe à 64 px sur téléphone, réglé par
   `app/globals.css`. */
const NAV: CSSProperties = {
  display: "block",
  marginTop: "var(--sec)",
};

/* Sur-titre de section, ligne 2680. Une seule valeur change, et elle se mesure :
   la maquette écrit `color:var(--acc)`, soit #ff7c3c sur le fond crème #f1f2f4,
   donc 2,29:1 pour un texte de 11,5 px. La WCAG 2.2 en demande 4,5:1. La charte
   porte déjà l'orange lisible, `--acc-ink` (#7d3309), qui donne 7,98:1 sur ce
   même fond, et que la maquette utilise elle-même pour son orange de texte, le
   « Lire → » de la carte compris. */
const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc-ink)",
  marginBottom: "14px",
};

/* Titre de section, ligne 2681. Un seul h2 pour toute la navigation : les trois
   intitulés de groupe sont ses h3. */
const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: "0 0 26px",
  textWrap: "balance",
};

/* Entre deux groupes. La maquette ne connaît qu'un seul groupe dans ce bloc :
   30 px est son pas courant entre deux blocs de contenu suivis. */
const GROUPES: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  rowGap: "30px",
};

/* Intitulé de groupe : le petit libellé neutre que la maquette répète
   (lignes 2172, 2180, 2199). `--ink3` (#737373) y donne 4,23:1 sur le fond
   crème, sous le seuil de 4,5:1 ; `--ink2` (#6a6764) donne 5,02:1. */
const TITRE_GROUPE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink2)",
  margin: "0 0 14px",
};

/* La grille, ligne 2682. `listStyle:none` et les marges à zéro parce que la
   grille est portée par un `ul` : le maillage est une liste de liens, et un
   lecteur d'écran annonce alors leur nombre. */
const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
  gap: "12px",
  listStyle: "none",
  margin: 0,
  padding: 0,
};

/* L'élément de liste s'étire sur la hauteur de sa rangée, et la carte s'étire
   dans l'élément : deux cartes voisines finissent à la même hauteur même si un
   titre passe à la ligne. */
const ELEMENT: CSSProperties = { display: "flex" };

/* La carte, ligne 2683. `min-height:140px` est la hauteur de cible tactile :
   140 px, très au-delà des 24 px du critère 2.5.8 de la WCAG 2.2, et c'est la
   seule cible du composant. */
const CARTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  flex: 1,
  minHeight: "140px",
  padding: "22px 24px",
  borderRadius: "var(--rad-s)",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  transition: "transform var(--tr)",
};

const CARTE_TITRE: CSSProperties = {
  font: "600 calc(16px * var(--ts))/1.35 var(--ft)",
  letterSpacing: "-.024em",
  color: "var(--ink)",
};

const CARTE_LIRE: CSSProperties = {
  font: "600 12.5px var(--fb)",
  color: "var(--acc-ink)",
  marginTop: "auto",
};

export default function ListeMaillage({ groupes }: { groupes: GroupeLiens[] }) {
  const remplis = groupes.filter((groupe) => groupe.liens.length > 0);
  if (remplis.length === 0) return null;

  return (
    <nav aria-labelledby={ID_TITRE} style={NAV}>
      <div style={SURTITRE}>Pour aller plus loin</div>
      <h2 id={ID_TITRE} style={TITRE}>
        Pages liées
      </h2>
      <div style={GROUPES}>
        {remplis.map((groupe) => (
          <section key={groupe.titre ?? "liens"}>
            {groupe.titre ? (
              <h3 style={TITRE_GROUPE}>{groupe.titre}</h3>
            ) : null}
            <ul style={GRILLE}>
              {groupe.liens.map((lien) => (
                <li key={lien.path} style={ELEMENT}>
                  <Link href={lien.path} className={styles.carte} style={CARTE}>
                    <span style={CARTE_TITRE}>{lien.titre}</span>
                    {/* Masqué aux technologies d'assistance : le nom du lien est
                        le titre de la page, « Lire → » n'y ajoute rien et le
                        répéterait sur chaque carte. */}
                    <span aria-hidden="true" style={CARTE_LIRE}>
                      Lire →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
