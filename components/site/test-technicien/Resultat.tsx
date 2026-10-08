import Link from "next/link";
import type { Ref } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import { VERRE } from "@/components/site/blocs/habillage";

import Corrige from "./Corrige";
import { PALIERS, QUESTIONS, type PalierTest } from "./donnees-test";
import styles from "./TestTechnicien.module.css";

/* Le résultat du test (`tDone`), porté du gabarit `isTest` de la maquette.
   Le score se calcule ici, dans le navigateur, et n'en sort pas : la maquette
   le promet (« Votre score ne quitte pas cette page »). Le formulaire ne
   reçoit ni le score ni les réponses. */

/** Nombre de bonnes réponses, comme `tScore` dans la maquette. */
export function scoreDe(reponses: readonly (number | undefined)[]): number {
  return QUESTIONS.reduce((n, q, i) => n + (reponses[i] === q.bonne ? 1 : 0), 0);
}

/** Le premier palier atteint, du plus haut au plus bas, comme `tBand`. */
export function palierDe(score: number): PalierTest {
  const palier = PALIERS.find((p) => score >= p.seuil);
  if (!palier) throw new Error(`aucun palier pour le score ${score}`);
  return palier;
}

/** À partir de ce score, la maquette ouvre « Ce score nous intéresse » (`tTop`). */
const SEUIL_RECRUTEMENT = 7;

interface Proprietes {
  reponses: readonly (number | undefined)[];
  onRecommence: () => void;
  /** Reçoit le focus à l'arrivée sur le résultat. */
  refScore: Ref<HTMLDivElement>;
}

export default function Resultat({ reponses, onRecommence, refScore }: Proprietes) {
  const score = scoreDe(reponses);
  const palier = palierDe(score);

  return (
    <div>
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: ".8fr 1.2fr",
          gap: 44,
          alignItems: "start",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            borderRadius: "var(--rad)",
            background: "var(--panel)",
            padding: "38px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 420,
              height: 420,
              left: -170,
              bottom: -190,
              background: "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              ref={refScore}
              tabIndex={-1}
              style={{
                font: "600 10.5px var(--fb)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 18,
              }}
            >
              Votre score
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
              <span
                style={{
                  font: "600 calc(clamp(56px,7vw,96px) * var(--ts))/1 var(--ft)",
                  letterSpacing: "-.055em",
                  color: palier.couleur,
                }}
              >
                {score}
              </span>
              <span style={{ font: "400 20px var(--fb)", color: "rgba(255,255,255,.44)" }}>
                / {QUESTIONS.length}
              </span>
            </div>
            <div
              style={{
                font: "600 calc(20px * var(--ts))/1.25 var(--ft)",
                letterSpacing: "-.035em",
                color: "#fff",
                marginBottom: 12,
                maxWidth: "20ch",
              }}
            >
              {palier.titre}
            </div>
            <p style={{ font: "400 15px/1.7 var(--fb)", color: "rgba(255,255,255,.66)", margin: "0 0 24px" }}>
              {palier.verdict}
            </p>
            <button
              type="button"
              onClick={onRecommence}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: 999,
                padding: "11px 20px",
                font: "600 13px var(--fb)",
                color: "rgba(255,255,255,.8)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Refaire le test
            </button>
          </div>
        </div>
        <div>
          {score >= SEUIL_RECRUTEMENT && <CarteRecrutement />}
          <CarteCorrige />
        </div>
      </div>
      <Corrige reponses={reponses} />
    </div>
  );
}

function CarteRecrutement() {
  return (
    <div
      style={{
        borderRadius: "var(--rad)",
        background: "var(--acc-w)",
        border: "1.5px solid rgba(255,124,60,.32)",
        padding: "28px 30px",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          font: "600 10.5px var(--fb)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--acc-ink)",
          marginBottom: 10,
        }}
      >
        Ce score nous intéresse
      </div>
      <div
        style={{
          font: "600 calc(19px * var(--ts))/1.3 var(--ft)",
          letterSpacing: "-.03em",
          color: "var(--ink)",
          marginBottom: 8,
        }}
      >
        Vous avez le niveau que nous déployons chez nos clients.
      </div>
      <p style={{ font: "400 14.5px/1.6 var(--fb)", color: "var(--ink1)", margin: "0 0 18px", maxWidth: "56ch" }}>
        Nous recrutons en CDI, mobilité régionale ou France entière, avec habilitations prises en
        charge et missions chez des industriels de premier rang.
      </p>
      <Link
        href="/carriere/"
        className={styles.lienPostes}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "13px 24px",
          borderRadius: 999,
          background: "var(--acc)",
          color: "#fff",
          font: "600 14.5px var(--fb)",
          whiteSpace: "nowrap",
          transition: "filter var(--tr)",
        }}
      >
        Voir les postes ouverts →
      </Link>
    </div>
  );
}

/* La maquette promet l'envoi du corrigé et des fiches métier, que rien ne fait.
   Décision de Mehdi du 08/10 : le formulaire est celui du reste du site, ses
   champs et sa mention RGPD, sous l'identifiant « test-technicien », et le
   recrutement recontacte la personne. Le titre, repris sur le bouton, est une
   copie nouvelle, déclarée dans la vérification. */
const TITRE_CARTE = "Être recontacté par notre recrutement";

function CarteCorrige() {
  return (
    <div style={{ ...VERRE, padding: "28px 30px" }}>
      <div
        style={{
          font: "600 calc(17px * var(--ts)) var(--ft)",
          letterSpacing: "-.028em",
          color: "var(--ink)",
          marginBottom: 16,
        }}
      >
        {TITRE_CARTE}
      </div>
      <FormulaireContact formulaire="test-technicien" libelleEnvoi={TITRE_CARTE} />
      <div style={{ font: "400 11.5px var(--fb)", color: "var(--ink4)", marginTop: 14 }}>
        Votre score ne quitte pas cette page.
      </div>
    </div>
  );
}
