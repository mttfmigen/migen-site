import Image from "next/image";

import styles from "./Equipe.module.css";
import type { GroupePersonnes } from "./equipe-donnees";
import { VERRE_COURT } from "./habillage-equipe";

/**
 * Un groupe de personnes : son surtitre barré d'un filet, puis la grille de
 * cartes. Maquette lignes 5854 à 5930, deux fois le même bloc.
 *
 * Le portrait repose sur le fond orange de la maquette (`--acc`). Une personne
 * sans portrait garde un cadre `--ph` : jamais un visage emprunté.
 */

interface Proprietes {
  groupe: GroupePersonnes;
  /** La maquette espace le premier groupe de 44px et le second de 34px. */
  paddingHaut: number;
}

export default function GroupeEquipe({ groupe, paddingHaut }: Proprietes) {
  return (
    // Le groupe est nommé par `aria-label` et non par un titre de niveau : sous
    // 760px, `app/globals.css` impose `font-size:clamp(26px,7.4vw,34px)` à TOUT
    // h2 de `.mg-site`, en `!important`. Un surtitre de 11,5px promu en h2 y
    // passait à 26px, trois fois sa taille. La maquette écrit un `div`, elle a
    // raison : c'est une étiquette de groupe, pas un titre de section.
    <section
      aria-label={groupe.titre}
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: `${paddingHaut}px 40px 0`,
      }}
    >
      <div data-reveal="">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
              color: "var(--acc-ink)",
            }}
          >
            {groupe.titre}
          </div>
          <span
            aria-hidden="true"
            style={{
              flex: 1,
              height: 1,
              background: "var(--line)",
              minWidth: 20,
            }}
          />
        </div>
        <ul
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,minmax(0,1fr))",
            gap: 14,
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          {groupe.personnes.map((personne) => (
            <li
              key={personne.nom}
              className={styles.cartePersonne}
              style={{
                ...VERRE_COURT,
                overflow: "hidden",
                transition: "transform var(--tr),box-shadow var(--tr)",
              }}
            >
              <div
                style={{
                  aspectRatio: "1/1",
                  overflow: "hidden",
                  background: personne.photo ? "var(--acc)" : "var(--ph)",
                  position: "relative",
                }}
              >
                {personne.photo ? (
                  <Image
                    src={personne.photo}
                    alt={`${personne.nom}, ${personne.fonction} chez migen`}
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
              </div>
              <div style={{ padding: "20px 22px 22px" }}>
                <div
                  style={{
                    font: "600 calc(17px * var(--ts)) var(--ft)",
                    letterSpacing: "-.028em",
                    color: "var(--ink)",
                  }}
                >
                  {personne.nom}
                </div>
                <div
                  style={{
                    font: "500 13px var(--fb)",
                    color: "var(--acc-ink)",
                    marginTop: 4,
                  }}
                >
                  {personne.fonction}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
