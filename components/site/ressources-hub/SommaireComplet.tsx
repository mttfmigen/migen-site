import Link from "next/link";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

import styles from "./Bibliotheque.module.css";
import type { Bibliotheque } from "./catalogue";

/**
 * LE SOMMAIRE DES 48 PAGES, jamais filtré, sans un octet de JavaScript.
 *
 * POURQUOI IL EXISTE, et la maquette n'a pas d'équivalent : sa bibliothèque
 * est pilotée par l'état d'un composant. Dès qu'un visiteur coche un filtre,
 * ou qu'un robot n'exécute pas le script, une partie des URL n'est plus dans
 * la page. Chez elle ce n'était pas grave, ses articles n'étaient que des
 * tiroirs ; chez nous ce sont 48 pages référencées, et le principe 1 du
 * contrat dit « Google reçoit du HTML complet ».
 *
 * Ce bloc est la réponse : les 48 liens, rangés par format, dans le HTML rendu
 * par le serveur, quoi que fassent les filtres au-dessus. Il porte AUSSI les
 * 14 pages de l'espace Techniciens, que la grille ne montre que si l'on change
 * d'espace. Sans lui, basculer d'espace serait le seul chemin vers ces 14 URL
 * depuis cette page, et ce chemin passe par le JavaScript.
 *
 * MESURE QUI LE JUSTIFIE, prise le 13/10 sur `/ressources/` : le hub servait
 * 18 liens internes pour une bibliothèque de 35 ressources, et aucun ne menait
 * à une ressource. Le maillage du cocon s'arrêtait aux cinq rayons.
 *
 * AU TÉLÉPHONE IL SE REPLIE, il ne part pas. La maquette mobile v2 n'a pas
 * de sommaire : déplié, il coûtait 1 889 px à 390 px (mesuré le 14/10), plus
 * de deux écrans de liens sous une grille qui les porte déjà. Il passe donc
 * dans `SectionPliableMobile` : rendu ouvert par le serveur, les 48 liens
 * restent dans le HTML que Google reçoit, et seul le téléphone le referme
 * après hydratation. Son résumé est la liste de ses rubriques, fabriqué comme
 * la maquette fabrique les siens (intitulés joints par « · »).
 *
 * Aucun JavaScript de plus : son seul parent est le cadre client de la
 * bibliothèque, il partait déjà dans le paquet.
 */

const SURTITRE = {
  font: "600 10.5px ui-monospace,Menlo,monospace",
  letterSpacing: ".14em",
  textTransform: "uppercase" as const,
  color: "var(--ink3)",
};

export default function SommaireComplet({
  bibliotheque,
}: {
  bibliotheque: Bibliotheque;
}) {
  const espaces = [bibliotheque.entreprises, bibliotheque.techniciens];
  const total = espaces.reduce((n, e) => n + e.cartes.length, 0);
  if (total === 0) return null;

  /* Les rubriques qui portent au moins une page, dans l'ordre du sommaire. */
  const rubriques = espaces
    .flatMap((e) =>
      e.categories.filter(
        (c) => c.cle !== "all" && e.cartes.some((x) => x.format === c.cle),
      ),
    )
    .map((c) => c.libelle)
    .join(" · ");

  const sommaire = (
    <nav
      className={`${styles.sommaire} ${styles.navSommaire}`}
      aria-labelledby="sommaire-bibliotheque"
    >
      {/* UN `<h2>` ET NON PLUS UN `<h3>`, sans un pixel de différence : le
          dessin est tout entier en ligne. Tout bloc repliable du gabarit
          guide porte exactement UN `<h2>` dans son corps, et l'étiquette de
          sa bascule le reprend mot pour mot (`controleEtiquettes`,
          `editorial/verification-editorial.tsx`). Le sommaire est un bloc
          frère de la grille, pas une de ses parties : le niveau 2 lui va. */}
      <h2
        id="sommaire-bibliotheque"
        className={styles.titreSommaire}
        style={{
          font: "600 calc(20px * var(--ts))/1.3 var(--ft)",
          letterSpacing: "-.028em",
          margin: "0 0 6px",
        }}
      >
        Le sommaire complet
      </h2>
      <p style={{ font: "400 14px/1.6 var(--fb)", color: "var(--ink2)", margin: "0 0 26px" }}>
        Les {total} pages de la bibliothèque, filtres ou pas.
      </p>

      {espaces.map((espace) => (
        <div key={espace.id} style={{ marginBottom: 30 }}>
          <div style={{ ...SURTITRE, marginBottom: 14 }}>{espace.libelle}</div>
          {espace.categories
            .filter((c) => c.cle !== "all")
            .map((categorie) => {
              const pages = espace.cartes.filter((x) => x.format === categorie.cle);
              if (pages.length === 0) return null;
              return (
                <div key={categorie.cle} style={{ margin: "0 0 18px" }}>
                  <p
                    style={{
                      font: "600 13px var(--fb)",
                      color: "var(--ink1)",
                      margin: "0 0 8px",
                    }}
                  >
                    {categorie.libelle}{" "}
                    <span style={{ color: "var(--ink4)", font: "500 12px var(--fb)" }}>
                      ({pages.length})
                    </span>
                  </p>
                  <ul
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                      gap: "6px 24px",
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                    }}
                  >
                    {pages.map((page) => (
                      <li key={page.url} style={{ font: "400 14px/1.55 var(--fb)" }}>
                        <Link href={page.url} prefetch={false}>
                          {page.titre}
                        </Link>{" "}
                        <span
                          style={{
                            font: "500 11px ui-monospace,Menlo,monospace",
                            color: "var(--ink4)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {page.minutes} min
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className={styles.plieSommaire}>
      {/* SANS NUMÉRO : une grille de liens n'est pas une section de contenu,
          la maquette ne numérote pas ces blocs-là, et la suite des sections
          du guide garde sa numérotation. */}
      <SectionPliableMobile
        numero={false}
        enTete={
          <span data-mobile-seulement="" data-carte-titre="">
            Le sommaire complet
          </span>
        }
        resume={rubriques}
      >
        {sommaire}
      </SectionPliableMobile>
    </div>
  );
}
