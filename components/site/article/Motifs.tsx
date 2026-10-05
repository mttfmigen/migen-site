import type { CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { BlocArticle } from "@/types/article";

import styles from "./Article.module.css";

/**
 * Les motifs de corps, relevés dans `maquette/gabarit-01-article.html` et
 * `maquette/gabarit-02-etude-de-cas.html`.
 *
 * LES DEUX FICHIERS PORTENT LE MÊME BLOC DE MOTIFS, déclaration par
 * déclaration : c'est vérifiable, et `scripts/verifie-article-etude.tsx` le
 * vérifie. Ils sont donc écrits UNE fois, et les deux coques les appellent :
 * `Article.tsx` dans sa colonne de lecture, `fiche/PageFiche.tsx` dans la
 * colonne droite de chacune de ses sections.
 *
 * CE QUI EST PORTÉ, ET CE QUI ATTEND SA DONNÉE. La maquette dessine huit
 * motifs : paragraphe, titre de niveau 3, liste à coches, cartes, étapes
 * numérotées, tableau, encadré orange, appel sombre. Le corpus en alimente
 * CINQ, et les cinq sont ici. Les trois autres — titre de niveau 3, grille de
 * cartes, variante d'appel — ne sont pas écrits : un motif sans donnée est du
 * code mort, et du code mort finit par être branché sur une donnée inventée.
 * Le détail est dans `RESERVES-CONTENU.md`.
 *
 * Composants SERVEUR : aucun état, aucun écouteur.
 */

/** Paragraphe. 68ch : la maquette borne la ligne, pas la colonne. */
const PARAGRAPHE: CSSProperties = {
  font: "400 16.5px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 18px",
  maxWidth: "68ch",
  textWrap: "pretty",
};

/** La carte de verre qui porte une liste à coches. */
const CARTE_LISTE: CSSProperties = {
  display: "grid",
  gap: 10,
  margin: "4px 0 22px",
  padding: "22px 24px",
  borderRadius: "var(--rad-s)",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
};

const ITEM_LISTE: CSSProperties = {
  display: "flex",
  gap: 12,
  font: "400 15.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const COCHE: CSSProperties = { color: "var(--acc)", flex: "none", fontWeight: 600 };

/** L'encadré orange. La maquette l'appelle « isQuote ». */
const ENCADRE: CSSProperties = {
  margin: "8px 0 24px",
  padding: "20px 24px",
  borderRadius: "var(--rad-s)",
  background: "var(--acc-w)",
  border: "1px solid rgba(255,124,60,.28)",
  font: "500 15.5px/1.65 var(--fb)",
  color: "var(--ink)",
};

/** L'enveloppe du tableau : une carte de verre qui défile horizontalement. */
const CARTE_TABLEAU: CSSProperties = {
  overflowX: "auto",
  margin: "6px 0 26px",
  borderRadius: "var(--rad-s)",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
};

const TABLEAU: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 520,
};

/** L'en-tête de colonne : orange, en capitales par la charte. */
const ENTETE_COLONNE: CSSProperties = {
  textAlign: "left",
  padding: "14px 18px",
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
  borderBottom: "1px solid var(--line)",
};

const CELLULE: CSSProperties = {
  padding: "13px 18px",
  verticalAlign: "top",
  borderTop: "1px solid var(--line)",
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

/** La frise d'étapes, « isOl ». Le filet vertical est posé en absolu. */
const FRISE: CSSProperties = { position: "relative", margin: "6px 0 24px" };

const FILET_FRISE: CSSProperties = {
  position: "absolute",
  left: 19,
  top: 20,
  bottom: 20,
  width: 2,
  background: "var(--line)",
};

const ETAPE: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "40px minmax(0,1fr)",
  gap: 18,
  padding: "0 0 18px",
};

/** La pastille numérotée. Son halo masque le filet, d'où l'ombre au fond. */
const NUMERO_ETAPE: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 13px/40px var(--fb)",
  textAlign: "center",
  boxShadow: "0 0 0 6px var(--bg)",
};

const TEXTE_ETAPE: CSSProperties = {
  font: "400 15.5px/1.65 var(--fb)",
  color: "var(--ink1)",
  paddingTop: 8,
};

/** L'appel sombre posé dans le fil du corps. */
const APPEL: CSSProperties = {
  margin: "14px 0 30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  padding: "24px 26px",
  borderRadius: 24,
  background: "var(--panel)",
};

const APPEL_TEXTE: CSSProperties = {
  font: "500 15.5px/1.6 var(--fb)",
  color: "rgba(255,255,255,.8)",
  flex: 1,
  minWidth: 240,
};

const APPEL_BOUTONS: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };

const APPEL_PRINCIPAL: CSSProperties = {
  padding: "12px 20px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 14px var(--fb)",
  whiteSpace: "nowrap",
};

const APPEL_SECONDAIRE: CSSProperties = {
  padding: "12px 18px",
  borderRadius: 999,
  background: "rgba(255,255,255,.1)",
  border: "1px solid rgba(255,255,255,.2)",
  color: "#fff",
  font: "600 14px var(--fb)",
  whiteSpace: "nowrap",
};

/**
 * L'appel sombre du corps.
 *
 * Il ne vient pas d'un bloc du corpus mais du champ `cta` de l'article, que le
 * pipeline éditorial produit déjà. Le second bouton est le téléphone, comme
 * dans la maquette.
 */
export function AppelSombre({
  texte,
  bouton,
  href,
  telephone,
}: {
  texte: string;
  bouton: string;
  href: string;
  telephone: string;
}) {
  return (
    <div style={APPEL}>
      <div style={APPEL_TEXTE}>
        <TexteRiche texte={texte} />
      </div>
      <div style={APPEL_BOUTONS}>
        <a href={href} className={styles.boutonAppel} style={APPEL_PRINCIPAL}>
          {bouton}
        </a>
        <a
          href={`tel:${telephone.replace(/[^+\d]/g, "")}`}
          style={APPEL_SECONDAIRE}
        >
          {telephone}
        </a>
      </div>
    </div>
  );
}

/**
 * Un bloc du corpus dans le motif que la maquette lui donne.
 *
 * `null` quand le bloc est vide : une carte de verre sans item, un tableau sans
 * ligne, c'est le cadre d'une section que le corpus n'alimente pas. Il ne se
 * rend pas.
 *
 * LE TABLEAU EST UN `table`, et non la grille de `div` que la maquette emploie
 * ailleurs : ici la maquette écrit déjà `table`, `thead`, `th`, `td`. Rien à
 * rétablir, les en-têtes de colonne sont annoncés au lecteur d'écran.
 */
export function Motif({ bloc }: { bloc: BlocArticle }) {
  if (bloc.type === "paragraphe") {
    if (!bloc.texte) return null;
    return (
      <p style={PARAGRAPHE}>
        <TexteRiche texte={bloc.texte} />
      </p>
    );
  }

  if (bloc.type === "encadre") {
    if (!bloc.texte) return null;
    return (
      <div style={ENCADRE}>
        <TexteRiche texte={bloc.texte} />
      </div>
    );
  }

  if (bloc.type === "tableau") {
    if (bloc.entetes.length === 0 || bloc.lignes.length === 0) return null;
    return (
      <div style={CARTE_TABLEAU}>
        <table style={TABLEAU}>
          <thead>
            <tr>
              {bloc.entetes.map((entete, i) => (
                <th key={`e${i}`} scope="col" style={ENTETE_COLONNE}>
                  <TexteRiche texte={entete} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloc.lignes.map((ligne, i) => (
              <tr key={`l${i}`}>
                {ligne.map((cellule, j) => (
                  <td key={`c${j}`} style={CELLULE}>
                    <TexteRiche texte={cellule} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (bloc.items.length === 0) return null;

  if (bloc.type === "etapes") {
    return (
      <ol style={{ ...FRISE, listStyle: "none", margin: "6px 0 24px", padding: 0 }}>
        {/* Le filet qui relie les étapes. Décoratif : l'ordre est porté par
            l'`ol` et par les numéros. */}
        <li aria-hidden="true" style={FILET_FRISE} />
        {bloc.items.map((item, i) => (
          <li key={`e${i}`} style={ETAPE}>
            <span style={NUMERO_ETAPE}>{String(i + 1).padStart(2, "0")}</span>
            <div style={TEXTE_ETAPE}>
              <TexteRiche texte={item} />
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul style={{ ...CARTE_LISTE, listStyle: "none", padding: "22px 24px" }}>
      {bloc.items.map((item, i) => (
        <li key={`i${i}`} style={ITEM_LISTE}>
          {/* La coche est décorative : la liste porte déjà le sens. Lue, elle
              annoncerait « coche » devant chaque item. */}
          <span aria-hidden="true" style={COCHE}>
            {"✓"}
          </span>
          <span>
            <TexteRiche texte={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Tous les blocs d'une section, dans l'ordre. */
export function Motifs({ blocs }: { blocs: BlocArticle[] }) {
  return (
    <>
      {blocs.map((bloc, i) => (
        <Motif key={`b${i}`} bloc={bloc} />
      ))}
    </>
  );
}

/**
 * La section porte-t-elle quelque chose à rendre ?
 *
 * C'est la règle du projet, mise en fonction pour qu'elle ne soit pas réécrite
 * deux fois : une section de la maquette que le corpus n'alimente pas NE SE
 * REND PAS DU TOUT, son titre compris. Un titre seul au-dessus du vide est ce
 * que le client a vu et refusé.
 */
export function sectionAlimentee(blocs: BlocArticle[]): boolean {
  return blocs.some((bloc) => {
    if (bloc.type === "paragraphe" || bloc.type === "encadre") return !!bloc.texte;
    if (bloc.type === "tableau") {
      return bloc.entetes.length > 0 && bloc.lignes.length > 0;
    }
    return bloc.items.length > 0;
  });
}
