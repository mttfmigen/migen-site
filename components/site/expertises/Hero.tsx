import Link from "next/link";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  LARGEUR,
  SURTITRE,
} from "@/components/site/blocs/habillage";
import type { ContenuExpertises } from "@/types/expertises";

import { Separateur, VERRE_CARTE } from "./commun";
import styles from "./PageExpertises.module.css";

/**
 * Héros de la page expertises : la promesse à gauche, la carte de cumul à droite.
 *
 * Maquette, lignes 6213 à 6238. Le H1 vient de `pages.titre_h1` : il arrive en
 * prop, il n'est pas dans le contenu, et c'est le seul de la page.
 */

interface Proprietes {
  titre: string;
  surtitre?: string;
  chapeau?: string;
  actions?: ContenuExpertises["actions"];
  cumul?: ContenuExpertises["cumul"];
}

export default function Hero({
  titre,
  surtitre,
  chapeau,
  actions = [],
  cumul,
}: Proprietes) {
  return (
    <section style={{ ...LARGEUR, padding: "70px 40px 0" }}>
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: 52,
          alignItems: "start",
        }}
      >
        <div>
          {surtitre ? (
            <div style={SURTITRE}>
              <TexteRiche texte={surtitre} />
            </div>
          ) : null}
          <h1
            style={{
              font: "600 calc(clamp(36px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              margin: 0,
              maxWidth: "17ch",
              textWrap: "balance",
            }}
          >
            {titre}
          </h1>
          {chapeau ? (
            <p
              style={{
                font: "400 18.5px/1.6 var(--fb)",
                color: "var(--ink2)",
                margin: "24px 0 0",
                maxWidth: "52ch",
              }}
            >
              <TexteRiche texte={chapeau} />
            </p>
          ) : null}
          {actions.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 28,
                flexWrap: "wrap",
              }}
            >
              {actions.map((action) => (
                <Link
                  key={action.href + action.libelle}
                  href={action.href}
                  prefetch={false}
                  className={
                    action.principale
                      ? styles.boutonAction
                      : styles.boutonSecondaire
                  }
                  style={action.principale ? BOUTON_ACTION : BOUTON_SECONDAIRE}
                >
                  {action.libelle}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {cumul ? (
          <div style={{ ...VERRE_CARTE, padding: "30px 32px 32px" }}>
            <div style={SURTITRE}>
              <TexteRiche texte={cumul.titre} />
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {cumul.lignes.map((ligne, i) => (
                <div
                  key={ligne.valeur + ligne.texte}
                  style={{ display: "grid", gap: 16 }}
                >
                  {i > 0 ? <Separateur /> : null}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 14,
                    }}
                  >
                    <span
                      style={{
                        font: "600 calc(28px * var(--ts)) var(--ft)",
                        letterSpacing: "-.045em",
                        color: "var(--acc)",
                        flex: "none",
                        minWidth: 56,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <TexteRiche texte={ligne.valeur} />
                    </span>
                    <span
                      style={{
                        font: "400 14.5px/1.55 var(--fb)",
                        color: "var(--ink1)",
                      }}
                    >
                      <TexteRiche texte={ligne.texte} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
