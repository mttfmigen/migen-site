import Link from "next/link";
import type { CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { ContenuExpertises } from "@/types/expertises";

import { TITRE2, TROIS, VERRE_CARTE } from "./commun";
import styles from "./PageExpertises.module.css";

/**
 * Les neuf secteurs, en cartes entièrement cliquables. Maquette, lignes 6442 à 6487.
 *
 * Sans chemin fourni, la carte reste une carte : jamais un `div` cliquable,
 * jamais un lien vers nulle part.
 */

const CARTE: CSSProperties = {
  ...VERRE_CARTE,
  padding: "26px 28px 28px",
  display: "block",
  transition: "transform var(--tr)",
};

export default function Secteurs({
  secteurs,
}: {
  secteurs: NonNullable<ContenuExpertises["secteurs"]>;
}) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div style={SURTITRE}>
            <TexteRiche texte={secteurs.entete.surtitre} />
          </div>
          <h2 style={{ ...TITRE2, maxWidth: "24ch", marginBottom: 34 }}>
            <TexteRiche texte={secteurs.entete.titre} />
          </h2>
          <div className="mg-rmulti" style={TROIS}>
            {secteurs.cartes.map((carte) => {
              const corps = (
                <>
                  <div
                    style={{
                      font: "600 17.5px var(--ft)",
                      letterSpacing: "-.028em",
                      color: "var(--ink)",
                      marginBottom: 8,
                    }}
                  >
                    <TexteRiche texte={carte.titre} />
                  </div>
                  <p
                    style={{
                      font: "400 14px/1.6 var(--fb)",
                      color: "var(--ink2)",
                      margin: 0,
                    }}
                  >
                    <TexteRiche texte={carte.texte} />
                  </p>
                </>
              );

              return carte.href ? (
                <Link
                  key={carte.titre}
                  href={carte.href}
                  prefetch={false}
                  className={styles.carteLevee}
                  style={CARTE}
                >
                  {corps}
                </Link>
              ) : (
                <div key={carte.titre} style={CARTE}>
                  {corps}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
