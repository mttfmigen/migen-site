import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { BlocEditorial, ContenuEditorial } from "@/types/editorial";

import styles from "./PageEditoriale.module.css";

/**
 * Rendu des pages éditoriales : métiers, hubs de ressources, entreprise.
 *
 * L'habillage reprend celui du gabarit article de la maquette (lignes 5759 à
 * 5824) : même largeur de lecture, même échelle typographique, même sommaire
 * collant à gauche. C'est volontaire, ce sont les mêmes pages longues à lire,
 * et un second habillage n'apporterait qu'une incohérence de plus à maintenir.
 *
 * Composant SERVEUR. Le sommaire tient par `position: sticky`, les ancres sont
 * des liens : aucun JavaScript, et la page part en HTML complet.
 */

const LARGEUR = { maxWidth: 1200, margin: "0 auto" } as const;

const PARAGRAPHE = {
  font: "400 17px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 18px",
} as const;

/**
 * Rendu d'UN bloc du corpus.
 *
 * EXPORTÉ, et c'est la seule raison pour laquelle ce fichier a été touché : le
 * gabarit métier (`components/site/metier/Corps.tsx`) rend le même corpus sous
 * les quatre sections que la maquette lui dessine, et il doit le rendre
 * exactement comme ici. Recopier ces cent cinquante lignes aurait donné deux
 * rendus du même texte, qui divergent au premier ajustement de charte.
 */
export function Bloc({ bloc }: { bloc: BlocEditorial }) {
  switch (bloc.type) {
    case "titre":
      return bloc.niveau === 2 ? (
        <h2
          id={bloc.id}
          style={{
            font: "600 calc(28px * var(--ts))/1.2 var(--ft)",
            letterSpacing: "-.035em",
            margin: "36px 0 16px",
            // Sans cette marge, l'ancre amène le titre sous la barre fixe.
            scrollMarginTop: 100,
          }}
        >
          {bloc.texte}
        </h2>
      ) : (
        <h3
          id={bloc.id}
          style={{
            font: "600 calc(20px * var(--ts))/1.3 var(--ft)",
            letterSpacing: "-.028em",
            margin: "28px 0 12px",
            scrollMarginTop: 100,
          }}
        >
          {bloc.texte}
        </h3>
      );

    case "paragraphe":
      return (
        <p style={PARAGRAPHE}>
          {bloc.accroche ? (
            <strong>
              <TexteRiche texte={bloc.accroche} />{" "}
            </strong>
          ) : null}
          <TexteRiche texte={bloc.texte} />
        </p>
      );

    case "liste": {
      const Balise = bloc.ordonnee ? "ol" : "ul";
      return (
        <Balise
          style={{
            display: "grid",
            gap: 10,
            margin: "0 0 22px",
            paddingLeft: bloc.ordonnee ? 22 : 0,
            listStyle: bloc.ordonnee ? "decimal" : "none",
          }}
        >
          {bloc.items.map((item, i) => (
            <li
              key={`${i}-${item.texte.slice(0, 24)}`}
              style={{
                display: bloc.ordonnee ? "list-item" : "flex",
                gap: 11,
                font: "400 16.5px/1.65 var(--fb)",
                color: "var(--ink1)",
              }}
            >
              {bloc.ordonnee ? null : (
                // Décorative : la liste porte déjà le sens. Annoncée, elle
                // ferait dire « puce » au lecteur d'écran avant chaque entrée.
                <span
                  aria-hidden="true"
                  style={{ color: "var(--acc)", flex: "none" }}
                >
                  ·
                </span>
              )}
              <span>
                {item.accroche ? (
                  <strong>
                    <TexteRiche texte={item.accroche} />{" "}
                  </strong>
                ) : null}
                <TexteRiche texte={item.texte} />
              </span>
            </li>
          ))}
        </Balise>
      );
    }

    case "tableau":
      return (
        // Le conteneur défile horizontalement sur petit écran plutôt que de
        // casser le tableau : une donnée comparée perd son sens si ses colonnes
        // s'empilent. `tabIndex` le rend atteignable au clavier, sans quoi un
        // visiteur qui n'utilise pas la souris ne pourrait pas le faire défiler.
        <div
          className={styles.cadreTableau}
          tabIndex={0}
          role="region"
          aria-label="Tableau, défilement horizontal possible"
        >
          <table className={styles.tableau}>
            <thead>
              <tr>
                {bloc.entetes.map((entete, i) => (
                  <th key={`${i}-${entete}`} scope="col">
                    <TexteRiche texte={entete} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloc.lignes.map((ligne, i) => (
                <tr key={`l${i}`}>
                  {ligne.map((cellule, j) => (
                    <td key={`c${j}`}>
                      <TexteRiche texte={cellule} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "citation":
      return (
        <aside
          style={{
            borderRadius: "var(--rad-s)",
            background: "var(--acc-w)",
            border: "1px solid rgba(255,124,60,.28)",
            padding: "22px 26px",
            margin: "0 0 26px",
          }}
        >
          <p
            style={{
              font: "500 16.5px/1.7 var(--fb)",
              color: "var(--ink1)",
              margin: 0,
            }}
          >
            <TexteRiche texte={bloc.texte} />
          </p>
        </aside>
      );
  }
}

export interface ProprietesPageEditoriale {
  titre: string;
  contenu: ContenuEditorial;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS et non lus ici : ce sont des composants SERVEUR
   * ASYNCHRONES, qui interrogent la base. Les appeler depuis ce fichier le
   * rendrait asynchrone à son tour pour deux éléments de chrome, et il ne
   * serait plus montable depuis un contrôle hors base.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageEditoriale({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageEditoriale) {
  // Le sommaire se déduit des titres de niveau 2 : jamais saisi deux fois, donc
  // jamais désynchronisé du corps. Sous trois entrées, il n'aide personne et
  // ne s'affiche pas.
  const sommaire = contenu.blocs.filter(
    (b): b is Extract<BlocEditorial, { type: "titre" }> =>
      b.type === "titre" && b.niveau === 2,
  );

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <section style={{ ...LARGEUR, padding: "24px 40px 0" }}>
          {filAriane}
        </section>

        <section style={{ ...LARGEUR, padding: "36px 40px 0" }}>
          <div style={{ maxWidth: 820 }}>
            <h1
              style={{
                font: "600 calc(clamp(32px,3.8vw,52px) * var(--ts))/1.08 var(--ft)",
                letterSpacing: "-.04em",
                margin: 0,
                textWrap: "balance",
              }}
            >
              {titre}
            </h1>
            {contenu.chapeau ? (
              <p
                style={{
                  font: "400 19px/1.6 var(--fb)",
                  color: "var(--ink2)",
                  margin: "22px 0 0",
                }}
              >
                <TexteRiche texte={contenu.chapeau} />
              </p>
            ) : null}
          </div>
        </section>

        <section style={{ padding: "48px 0 var(--sec)" }}>
          <div style={{ ...LARGEUR, padding: "0 40px" }}>
            <div
              className="mg-r2"
              style={{
                display: "grid",
                gridTemplateColumns:
                  sommaire.length >= 3 ? ".32fr .68fr" : "minmax(0,1fr)",
                gap: 60,
                alignItems: "start",
              }}
            >
              {sommaire.length >= 3 ? (
                <nav
                  aria-label="Sommaire de la page"
                  style={{ position: "sticky", top: 110 }}
                >
                  <p
                    style={{
                      font: "600 11px var(--fb)",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "var(--ink4)",
                      margin: "0 0 16px",
                    }}
                  >
                    Sur cette page
                  </p>
                  <ol
                    style={{
                      display: "grid",
                      gap: 9,
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                    }}
                  >
                    {sommaire.map((t) => (
                      <li key={t.id}>
                        <a
                          href={`#${t.id}`}
                          className={styles.lienSommaire}
                          style={{ font: "500 14px/1.5 var(--fb)" }}
                        >
                          {t.texte}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}

              <article className={styles.corps} style={{ maxWidth: "74ch" }}>
                {contenu.blocs.map((bloc, i) => (
                  <Bloc key={`${bloc.type}-${i}`} bloc={bloc} />
                ))}
              </article>
            </div>
          </div>
        </section>

        {maillage ? (
          <section style={{ ...LARGEUR, padding: "0 40px 80px" }}>
            {maillage}
          </section>
        ) : null}
      </main>
    </div>
  );
}
