import Link from "next/link";

import blocs from "@/components/site/blocs/Blocs.module.css";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import type { BlocEditorial } from "@/types/editorial";
import type { Paragraphe } from "@/types/contenu";

import styles from "./Hub.module.css";
import { VERRE, numero } from "./habillage";

/**
 * Les sept motifs de bloc du gabarit 11, dans la colonne de droite d'une
 * section de sous-rubrique.
 *
 * Maquette : `maquette/gabarit-11-sous-rubrique.html`, les sept branches
 * `sc-if` de `b.isP`, `b.isH3`, `b.isUl`, `b.isCards`, `b.isOl`, `b.isTable`,
 * `b.isQuote` et `b.isCta`.
 *
 * COMMENT LA MAQUETTE CHOISIT LE MOTIF, et pourquoi le code fait pareil :
 *
 *   · une liste dont CHAQUE puce commence par un lien devient une grille de
 *     CARTES, parce que c'est un sommaire de pages filles, pas une énumération ;
 *   · une liste numérotée devient une FRISE, parce que l'ordre compte ;
 *   · toute autre liste devient une carte de verre à coches ;
 *   · une citation qui contient le NUMÉRO DE TÉLÉPHONE devient le panneau
 *     anthracite d'appel, les autres restent un encadré en lavis orange.
 *
 * CE QUE LA MAQUETTE DESSINE ET QUE LE CORPUS N'ALIMENTE PAS : la VIGNETTE de
 * chaque carte, et le BOUTON ORANGE du panneau d'appel. `pages.cta_type` vaut
 * `devis` sur toute la famille et ne fournit aucun libellé de bouton, et la
 * maquette écrit le sien en dur. Le panneau garde donc son texte et son bouton
 * d'appel téléphonique, qui a, lui, un libellé : le numéro.
 */

/** Une puce ou un paragraphe : l'accroche en gras d'attaque, puis le texte. */
function Riche({ item }: { item: Paragraphe }) {
  return (
    <>
      {item.accroche ? (
        <>
          <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
            <TexteRiche texte={item.accroche} />
          </strong>{" "}
        </>
      ) : null}
      <TexteRiche texte={item.texte} />
    </>
  );
}

/** La puce est-elle un lien seul en accroche ? Alors la liste est un sommaire. */
function estCarte(item: Paragraphe): boolean {
  return /^\[[^\]]+\]\(\/[^)]*\)$/.test((item.accroche ?? "").trim());
}

/** « [libellé](/chemin/) » donne son libellé et sa cible. */
function lienDe(item: Paragraphe): { titre: string; href: string } | null {
  const m = (item.accroche ?? "").trim().match(/^\[([^\]]+)\]\((\/[^)]*)\)$/);
  return m ? { titre: m[1], href: m[2] } : null;
}

function Cartes({ items }: { items: Paragraphe[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
        gap: 12,
        margin: "6px 0 24px",
      }}
    >
      {items.map((item) => {
        const lien = lienDe(item);
        if (!lien) return null;
        return (
          <Link
            key={lien.href}
            href={lien.href}
            prefetch={false}
            className={styles.carteReference}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 22,
              overflow: "hidden",
              background: "var(--card)",
              border: "1px solid var(--line)",
              transition: "transform var(--tr),box-shadow var(--tr)",
            }}
          >
            <div
              style={{
                padding: "18px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    font: "600 16px/1.3 var(--ft)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                  }}
                >
                  {lien.titre}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    background: "var(--acc)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    font: "600 13px var(--fb)",
                  }}
                >
                  &rarr;
                </span>
              </div>
              <span
                style={{
                  font: "400 13.5px/1.55 var(--fb)",
                  color: "var(--ink2)",
                }}
              >
                {item.texte}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Frise({ items }: { items: Paragraphe[] }) {
  return (
    <div style={{ position: "relative", margin: "6px 0 24px" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 19,
          top: 20,
          bottom: 20,
          width: 2,
          background: "var(--line)",
        }}
      />
      {items.map((item, i) => (
        <div
          key={item.accroche ?? item.texte}
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "40px minmax(0,1fr)",
            gap: 18,
            padding: "0 0 18px",
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "var(--acc)",
              color: "#fff",
              font: "600 13px/40px var(--fb)",
              textAlign: "center",
              boxShadow: "0 0 0 6px var(--bg)",
            }}
          >
            {numero(i)}
          </span>
          <div
            style={{
              font: "400 15.5px/1.65 var(--fb)",
              color: "var(--ink1)",
              paddingTop: 8,
            }}
          >
            <Riche item={item} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Coches({ items }: { items: Paragraphe[] }) {
  return (
    <div
      style={{
        ...VERRE,
        borderRadius: "var(--rad-s)",
        display: "grid",
        gap: 10,
        margin: "4px 0 22px",
        padding: "22px 24px",
      }}
    >
      {items.map((item) => (
        <div
          key={item.accroche ?? item.texte}
          style={{
            display: "flex",
            gap: 12,
            font: "400 15.5px/1.6 var(--fb)",
            color: "var(--ink1)",
          }}
        >
          <span
            aria-hidden="true"
            style={{ color: "var(--acc)", flex: "none", fontWeight: 600 }}
          >
            &check;
          </span>
          <span>
            <Riche item={item} />
          </span>
        </div>
      ))}
    </div>
  );
}

function Grille({
  entetes,
  lignes,
}: {
  entetes: string[];
  lignes: string[][];
}) {
  return (
    <div
      style={{
        ...VERRE,
        borderRadius: "var(--rad-s)",
        overflowX: "auto",
        margin: "6px 0 26px",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}
      >
        <thead>
          <tr>
            {entetes.map((entete) => (
              <th
                key={entete}
                style={{
                  textAlign: "left",
                  padding: "14px 18px",
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne, i) => (
            <tr key={ligne.join("|") + i}>
              {ligne.map((cellule, j) => (
                <td
                  key={`${j}-${cellule}`}
                  className={blocs.corpus}
                  style={{
                    padding: "13px 18px",
                    verticalAlign: "top",
                    borderTop: "1px solid var(--line)",
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink1)",
                  }}
                >
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

/** Un bloc du corpus, rendu avec le motif que la maquette lui donne. */
export function BlocSuivi({ bloc }: { bloc: BlocEditorial }) {
  switch (bloc.type) {
    case "titre":
      /* Toujours un H3 : le H2 de la section est son titre, et le H1 est celui
         de la page. Un titre de niveau 2 dans le corps d'une section
         n'existerait que si le producteur avait laissé passer un délimiteur. */
      return (
        <h3
          id={bloc.id}
          style={{
            font: "600 calc(21px * var(--ts))/1.3 var(--ft)",
            letterSpacing: "-.025em",
            margin: "30px 0 12px",
            display: "flex",
            gap: 12,
            alignItems: "baseline",
            scrollMarginTop: 110,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 18,
              height: 3,
              borderRadius: 999,
              background: "var(--acc)",
              flex: "none",
              transform: "translateY(-5px)",
            }}
          />
          {bloc.texte}
        </h3>
      );

    case "paragraphe":
      return (
        <p
          className={`${blocs.corpus} ${styles.corpsSuivi}`}
          style={{
            font: "400 16.5px/1.75 var(--fb)",
            color: "var(--ink1)",
            margin: "0 0 18px",
            maxWidth: "68ch",
            textWrap: "pretty",
          }}
        >
          <Riche item={bloc} />
        </p>
      );

    case "liste": {
      const classe = `${blocs.corpus} ${styles.corpsSuivi}`;
      if (bloc.ordonnee)
        return (
          <div className={classe}>
            <Frise items={bloc.items} />
          </div>
        );
      if (bloc.items.length > 0 && bloc.items.every(estCarte))
        return <Cartes items={bloc.items} />;
      return (
        <div className={classe}>
          <Coches items={bloc.items} />
        </div>
      );
    }

    case "tableau":
      return (
        <div className={styles.corpsSuivi}>
          <Grille entetes={bloc.entetes} lignes={bloc.lignes} />
        </div>
      );

    case "citation": {
      /* La citation qui porte le numéro est l'appel à l'action de la maquette :
         panneau anthracite, texte à gauche, bouton d'appel à droite. */
      if (bloc.texte.includes(TELEPHONE_SITE.affichage))
        return (
          <div
            style={{
              margin: "14px 0 30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              padding: "24px 26px",
              borderRadius: 24,
              background: "var(--panel)",
            }}
          >
            <div
              className={`${blocs.corpusClair} ${styles.corpsSuivi}`}
              style={{
                font: "500 15.5px/1.6 var(--fb)",
                color: "rgba(255,255,255,.8)",
                flex: 1,
                minWidth: 240,
              }}
            >
              <TexteRiche texte={bloc.texte} />
            </div>
            <a
              href={TELEPHONE_SITE.href}
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,.1)",
                border: "1px solid rgba(255,255,255,.2)",
                color: "#fff",
                font: "600 14px var(--fb)",
                whiteSpace: "nowrap",
              }}
            >
              {TELEPHONE_SITE.affichage}
            </a>
          </div>
        );

      return (
        <div
          className={`${blocs.corpus} ${styles.corpsSuivi}`}
          style={{
            margin: "8px 0 24px",
            padding: "20px 24px",
            borderRadius: "var(--rad-s)",
            background: "var(--acc-w)",
            border: "1px solid rgba(255,124,60,.28)",
            font: "500 15.5px/1.65 var(--fb)",
            color: "var(--ink)",
          }}
        >
          <TexteRiche texte={bloc.texte} />
        </div>
      );
    }

    default:
      return null;
  }
}

/** Les blocs d'une section, dans l'ordre où le client les a écrits. */
export default function BlocsSuivis({ liste }: { liste: BlocEditorial[] }) {
  return (
    <>
      {liste.map((bloc, i) => (
        // L'index suffit comme clé : l'ordre du tableau EST celui du corpus, il
        // ne se réarrange pas.
        <BlocSuivi key={`${bloc.type}-${i}`} bloc={bloc} />
      ))}
    </>
  );
}
