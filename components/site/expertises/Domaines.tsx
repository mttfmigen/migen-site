import Link from "next/link";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION } from "@/components/site/blocs/habillage";
import type { ContenuExpertises } from "@/types/expertises";

import { Entete, TROIS, VERRE_CARTE } from "./commun";
import styles from "./PageExpertises.module.css";

/**
 * Les neuf domaines techniques. Maquette, lignes 6355 à 6410.
 *
 * Chaque carte mène à la page du domaine. La maquette pilotait ce lien par un
 * verbe de navigation (`onClick="{{ cxL.mecanique }}"`) : sans chemin fourni, la
 * carte se rend sans son lien, jamais avec une cible morte.
 */

export default function Domaines({
  domaines,
}: {
  domaines: NonNullable<ContenuExpertises["domaines"]>;
}) {
  return (
    <section id="domaines" style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <Entete entete={domaines.entete} />
          <div className="mg-rmulti" style={TROIS}>
            {domaines.cartes.map((carte) => (
              <div
                key={carte.titre}
                className={styles.carteLevee}
                style={{
                  ...VERRE_CARTE,
                  padding: "28px 30px 30px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform var(--tr)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      font: "600 19px var(--ft)",
                      letterSpacing: "-.03em",
                    }}
                  >
                    <TexteRiche texte={carte.titre} />
                  </div>
                  <span
                    style={{
                      font: "600 10px var(--fb)",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--acc)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TexteRiche texte={carte.etiquette} />
                  </span>
                </div>
                <p
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink2)",
                    margin: "0 0 18px",
                  }}
                >
                  <TexteRiche texte={carte.texte} />
                </p>
                {carte.href ? (
                  <Link
                    href={carte.href}
                    prefetch={false}
                    style={{
                      font: "600 13.5px var(--fb)",
                      color: "var(--acc-ink)",
                      marginTop: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {domaines.lienLibelle ?? "Ce qu’on y répare"}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
