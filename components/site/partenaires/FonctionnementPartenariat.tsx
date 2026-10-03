import type { CSSProperties } from "react";

import { ANCRE_FORMULAIRE_PARTENAIRES } from "./donnees";
import styles from "./FonctionnementPartenariat.module.css";

/**
 * « Plusieurs métiers, un seul responsable » : les trois temps d'un partenariat.
 *
 * Maquette `maquette/accueil-rendu.html`, lignes 6063 à 6080. Composant serveur.
 *
 * La troisième étape est sur fond anthracite dans la maquette, pas sur verre :
 * c'est la promesse que le visiteur doit retenir, et le contraste la porte.
 */

interface Etape {
  numero: string;
  titre: string;
  corps: string;
  /** Vrai pour l'étape sur fond anthracite. */
  pleine?: boolean;
}

interface Proprietes {
  /** Cible du bouton. Par défaut, le formulaire de cette page. */
  lienProjet?: string;
}

const ETAPES: readonly Etape[] = [
  {
    numero: "01",
    titre: "Un diagnostic commun",
    corps:
      "Nous visitons le site ensemble. Chaque partenaire voit ce qui relève de son métier, et nous fixons qui fait quoi avant de chiffrer.",
  },
  {
    numero: "02",
    titre: "Un périmètre écrit",
    corps:
      "L’offre précise ce que porte chaque acteur. Aucune zone grise sur les interfaces entre la GMAO, l’installation et la maintenance.",
  },
  {
    numero: "03",
    titre: "Un interlocuteur unique",
    corps:
      "migen© reste votre point d’entrée. Nous coordonnons les partenaires et vous rendons compte, sans que vous ayez à relancer trois entreprises.",
    pleine: true,
  },
];

const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 20px 46px -32px rgba(0,0,0,.3)",
};

const ANTHRACITE: CSSProperties = { background: "#1c1b19", color: "#fff" };

const CARTE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0,1fr)",
  gap: 22,
  borderRadius: "var(--rad)",
  padding: "26px 28px",
};

const NUMERO: CSSProperties = {
  font: "600 calc(30px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
};

export default function FonctionnementPartenariat({
  lienProjet = ANCRE_FORMULAIRE_PARTENAIRES,
}: Proprietes) {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)",
            gap: 56,
            alignItems: "start",
          }}
        >
          {/* `top:110px` est littéral : `app/globals.css` neutralise le
              collage sous 760px par un sélecteur d'attribut sur cette valeur. */}
          <div style={{ position: "sticky", top: 110 }}>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 16,
              }}
            >
              Comment ça fonctionne
            </div>
            <h2
              style={{
                font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 16px",
                textWrap: "balance",
              }}
            >
              Plusieurs métiers, un seul responsable.
            </h2>
            <p
              style={{
                font: "400 16px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 22px",
                maxWidth: "40ch",
              }}
            >
              Un partenariat n’a de valeur que si vous n’en voyez pas la
              complexité.
            </p>
            <a
              href={lienProjet}
              className={styles.lienAccent}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "14px 24px",
                borderRadius: 999,
                background: "var(--acc)",
                color: "#fff",
                font: "600 14.5px var(--fb)",
                whiteSpace: "nowrap",
              }}
            >
              Décrire mon projet
            </a>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {ETAPES.map((etape) => (
              <div
                key={etape.numero}
                style={
                  etape.pleine
                    ? { ...CARTE, ...ANTHRACITE }
                    : { ...CARTE, ...VERRE }
                }
              >
                <span style={NUMERO}>{etape.numero}</span>
                <div>
                  <div
                    style={{
                      font: "600 calc(18px * var(--ts))/1.3 var(--ft)",
                      letterSpacing: "-.025em",
                      marginBottom: 8,
                      color: etape.pleine ? "#fff" : "var(--ink)",
                    }}
                  >
                    {etape.titre}
                  </div>
                  <div
                    style={{
                      font: "400 15px/1.65 var(--fb)",
                      color: etape.pleine
                        ? "rgba(255,255,255,.7)"
                        : "var(--ink2)",
                    }}
                  >
                    {etape.corps}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
