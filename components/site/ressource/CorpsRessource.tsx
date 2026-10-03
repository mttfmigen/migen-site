import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { Paragraphe, Tableau } from "@/types/contenu";
import type { BlocEditorial } from "@/types/editorial";

import styles from "./Ressource.module.css";
import {
  BAREME_CLE,
  BAREME_ENTETE,
  BAREME_VALEUR,
  CITATION,
  CITATION_TEXTE,
  ETAPE_TEXTE,
  ETAPE_TITRE,
  NUMERO,
  PROSE,
  PUCE,
  TITRE2,
  TITRE3,
  VERRE,
} from "./habillage";

/**
 * Le corps du gabarit ressource : chaque bloc du corpus dans le motif que la
 * maquette lui donne.
 *
 * LA CORRESPONDANCE, bloc du corpus vers motif de la maquette :
 *
 *   titre            -> le H2 de la colonne de lecture (ligne 6530)
 *   paragraphe       -> la prose de la colonne de lecture (6529)
 *   liste ordonnée   -> LA CARTE DE PROCÉDURE NUMÉROTÉE, variante pratique (6634)
 *   liste à puces    -> la liste pointée de la carte « À retenir » (6542)
 *   tableau          -> LE BARÈME, variante technique (6727)
 *   citation         -> l'encadré en barre orange (6533)
 *
 * C'est là tout le portage : les trois variantes de corps de la maquette ne
 * sont pas trois jeux de données mais trois motifs, et le corpus porte déjà les
 * formes auxquelles ils s'appliquent. Les pages de `/ressources/` ont toutes
 * une liste ordonnée ET un tableau : elles reçoivent donc la carte numérotée ET
 * le barème, à la place que leur auteur leur a donnée.
 *
 * POURQUOI PAS `PageEditoriale` : son `Bloc` rend le MÊME texte dans un AUTRE
 * dessin, H2 de 28 px, liste en puces grises, tableau à filets, encadré en
 * lavis. Le réemployer aurait fait ressembler la page à ce que le client a
 * refusé, ce qui est l'objet même de ce portage. Tout ce qui pouvait l'être est
 * réemployé : `TexteRiche` pour le Markdown en ligne du corpus, le bloc
 * `Objections` pour la foire aux questions, le formulaire et le maillage par la
 * route.
 *
 * Composants SERVEUR. Aucun état, aucun JavaScript.
 */

/** Combien de colonnes, et laquelle porte le nom. Motif de la ligne 6733. */
function grilleBareme(colonnes: number) {
  return {
    display: "grid",
    gridTemplateColumns: ["1.1fr", ...Array(Math.max(0, colonnes - 1)).fill("1fr")].join(
      " ",
    ),
    gap: 16,
  } as const;
}

/**
 * Le barème en tableau de la variante technique.
 *
 * `table` et non une grille de `div` comme la maquette : sa grille prive un
 * lecteur d'écran de l'en-tête de colonne, la troisième cellule d'une ligne ne
 * se rattachant plus à « Conduite à tenir ». Le `table` rétablit la sémantique,
 * et `Ressource.module.css` lui rend le comportement de grille attendu, si bien
 * que le dessin est le même.
 *
 * LES RÔLES SONT ÉCRITS À LA MAIN, et ce n'est pas du zèle : redéfinir
 * `display` sur un tableau lui RETIRE son rôle implicite dans Chrome comme
 * dans Safari. Sans ces attributs, le `table` aurait coûté le dessin de la
 * maquette sans rien rendre au lecteur d'écran, c'est-à-dire le pire des deux.
 *
 * LA DEUXIÈME COLONNE N'EST PAS EN CHASSE FIXE, contrairement à la maquette
 * (ligne 6740) : elle y porte un seuil chiffré, « inférieur à 2,8 mm/s ». Les
 * tableaux du corpus comparent du texte. Une chasse fixe sur une phrase se
 * lirait comme une valeur mesurée, ce qui serait un faux.
 */
export function Bareme({ tableau }: { tableau: Tableau }) {
  const colonnes = tableau.entetes.length;
  if (colonnes === 0 || tableau.lignes.length === 0) return null;
  const grille = grilleBareme(colonnes);

  return (
    <div style={{ ...VERRE, overflow: "hidden", margin: "0 0 26px" }}>
      <table role="table" className={styles.bareme}>
        <thead role="rowgroup">
          <tr
            role="row"
            className="mg-rq3"
            style={{
              ...grille,
              padding: "14px 30px",
              borderBottom: "1px solid var(--line)",
              background: "var(--chip)",
            }}
          >
            {tableau.entetes.map((entete, i) => (
              <th key={`e${i}`} role="columnheader" scope="col" style={BAREME_ENTETE}>
                <TexteRiche texte={entete} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {tableau.lignes.map((ligne, i) => (
            <tr
              key={`l${i}`}
              role="row"
              className="mg-rq3"
              style={{
                ...grille,
                alignItems: "center",
                padding: "16px 30px",
                // La dernière ligne ne porte pas de filet : la carte se ferme
                // sur son propre bord (ligne 6748 de la maquette).
                borderBottom:
                  i === tableau.lignes.length - 1 ? undefined : "1px solid var(--line)",
              }}
            >
              {ligne.map((cellule, j) => (
                <td key={`c${j}`} role="cell" style={j === 0 ? BAREME_CLE : BAREME_VALEUR}>
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

/**
 * La carte de procédure numérotée de la variante pratique.
 *
 * `ol` et non une suite de `div` comme la maquette (ligne 6636) : les pastilles
 * orange de la maquette portent le numéro en texte, qu'un lecteur d'écran lit
 * donc comme un caractère isolé avant chaque étape. En liste ordonnée, le
 * numéro est porté par la structure, la pastille n'est plus que du dessin, et
 * l'ordre, qui est tout le propos d'une procédure, est annoncé.
 *
 * `role="list"` parce que `list-style:none`, qu'impose le dessin en cartes,
 * retire le rôle de liste dans Safari : le rang ne serait alors annoncé nulle
 * part, la pastille qui le porte à l'écran étant masquée au lecteur.
 */
export function Procedure({ etapes }: { etapes: Paragraphe[] }) {
  if (etapes.length === 0) return null;

  return (
    <div style={{ ...VERRE, padding: "30px 34px 32px", margin: "0 0 26px" }}>
      <ol role="list" style={{ display: "grid", gap: 2, margin: 0, padding: 0, listStyle: "none" }}>
        {etapes.map((etape, i) => (
          <li
            key={`${i}-${etape.texte.slice(0, 24)}`}
            style={{
              display: "flex",
              gap: 18,
              padding: "20px 0",
              borderBottom:
                i === etapes.length - 1 ? undefined : "1px solid var(--line)",
            }}
          >
            {/* Décorative : la liste ordonnée porte déjà le rang. */}
            <span aria-hidden="true" style={NUMERO}>
              {i + 1}
            </span>
            <div>
              {etape.accroche ? (
                <div style={ETAPE_TITRE}>
                  <TexteRiche texte={etape.accroche} />
                </div>
              ) : null}
              <p style={ETAPE_TEXTE}>
                <TexteRiche texte={etape.texte} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Bloc({ bloc }: { bloc: BlocEditorial }) {
  switch (bloc.type) {
    case "titre":
      return bloc.niveau === 2 ? (
        <h2 id={bloc.id} style={TITRE2}>
          {bloc.texte}
        </h2>
      ) : (
        <h3 id={bloc.id} style={TITRE3}>
          {bloc.texte}
        </h3>
      );

    case "paragraphe":
      return (
        <p style={PROSE}>
          {bloc.accroche ? (
            <strong style={{ color: "var(--ink)" }}>
              <TexteRiche texte={bloc.accroche} />{" "}
            </strong>
          ) : null}
          <TexteRiche texte={bloc.texte} />
        </p>
      );

    case "liste":
      if (bloc.ordonnee) return <Procedure etapes={bloc.items} />;
      return (
        <ul role="list" style={{ display: "grid", gap: 10, margin: "0 0 22px", padding: 0, listStyle: "none" }}>
          {bloc.items.map((item, i) => (
            <li
              key={`${i}-${item.texte.slice(0, 24)}`}
              style={{
                display: "flex",
                gap: 10,
                font: "400 16px/1.65 var(--fb)",
                color: "var(--ink1)",
              }}
            >
              {/* Décorative : la liste porte déjà le sens. Annoncée, elle
                  ferait dire « puce » au lecteur d'écran avant chaque entrée. */}
              <span aria-hidden="true" style={{ color: "var(--acc)", flex: "none" }}>
                {PUCE}
              </span>
              <span>
                {item.accroche ? (
                  <strong style={{ color: "var(--ink)" }}>
                    <TexteRiche texte={item.accroche} />{" "}
                  </strong>
                ) : null}
                <TexteRiche texte={item.texte} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "tableau":
      return <Bareme tableau={bloc} />;

    case "citation":
      return (
        <blockquote style={CITATION}>
          <p style={CITATION_TEXTE}>
            <TexteRiche texte={bloc.texte} />
          </p>
        </blockquote>
      );
  }
}

export default function CorpsRessource({ blocs }: { blocs: BlocEditorial[] }) {
  if (blocs.length === 0) return null;
  return (
    <article className={styles.corps}>
      {blocs.map((bloc, i) => (
        <Bloc key={`${bloc.type}-${i}`} bloc={bloc} />
      ))}
    </article>
  );
}
