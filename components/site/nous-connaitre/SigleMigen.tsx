import type { CSSProperties } from "react";

/**
 * Le panneau sombre qui épelle M, I, G, EN.
 *
 * Maquette, lignes 5296 à 5310. Extrait de `OrigineDuNom` pour tenir sous les
 * 400 lignes par fichier du contrat de portage : la section de la maquette en
 * compte quatre blocs, celui-ci est le plus autonome.
 */

const LETTRE: CSSProperties = {
  font: "700 calc(clamp(56px,7vw,96px) * var(--ts))/.9 var(--ft)",
  letterSpacing: "-.06em",
  color: "var(--acc)",
  width: ".9em",
  flex: "none",
};

const SUITE: CSSProperties = {
  font: "500 calc(clamp(18px,1.8vw,22px) * var(--ts)) var(--fb)",
  color: "rgba(255,255,255,.72)",
};

const RANGEE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 14,
};

/**
 * LE SIGLE SE DÉCOUPE EN M, I ET GEN, pas en M, I, G puis EN.
 *
 * Correction de Mehdi, le 13/10 : « Il fallait remplacer G énéral par GEN de
 * général. » Le nom se lit « migen », et ce sont bien les trois PREMIÈRES
 * lettres de « général » qui le ferment, pas son initiale seule suivie d'un
 * « EN » venu d'ailleurs. L'ancien découpage faisait de « EN » une quatrième
 * ligne sans origine, alors qu'il est dans le mot.
 */
const SIGLE: readonly [string, string][] = [
  ["M", "aintenance"],
  ["I", "ndustrielle"],
  ["GEN", "éral"],
];

export default function SigleMigen() {
  return (
  <div
    data-reveal=""
    style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 36,
      background: "var(--panel)",
      padding: "52px 56px",
      marginBottom: 14,
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 520,
        height: 520,
        right: -180,
        top: -240,
        background:
          "radial-gradient(circle,rgba(255,124,60,.3),transparent 68%)",
        pointerEvents: "none",
      }}
    />
    <div
      className="mg-r2"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1.1fr .9fr",
        gap: 48,
        alignItems: "center",
      }}
    >
      <div>
        <div
          aria-hidden="true"
          style={{
            font: "600 64px/.6 var(--ft)",
            color: "var(--acc)",
            marginBottom: 18,
          }}
        >
          &ldquo;
        </div>
        <div
          style={{
            font: "600 calc(clamp(24px,2.6vw,36px) * var(--ts))/1.25 var(--ft)",
            letterSpacing: "-.035em",
            color: "#fff",
            marginBottom: 18,
            maxWidth: "18ch",
          }}
        >
          C&rsquo;est quoi le nom de la société&nbsp;?
        </div>
        <p
          style={{
            font: "400 15.5px/1.7 var(--fb)",
            color: "rgba(255,255,255,.66)",
            margin: 0,
            maxWidth: "46ch",
          }}
        >
          Devant lui, sur la table, un livre. Sur la couverture&nbsp;:{" "}
          <em style={{ fontStyle: "normal", color: "#fff" }}>
            Maintenance industrielle générale
          </em>
          . Trois mots, et de chacun ce qu’il faut pour que ça se prononce, réponse
          immédiate.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6 }}>
        {SIGLE.map(([lettre, suite]) => (
          <div key={lettre} style={RANGEE}>
            <span style={LETTRE}>{lettre}</span>
            <span style={SUITE}>{suite}</span>
          </div>
        ))}
        {/* LA QUATRIÈME RANGÉE EST RETIRÉE. Elle épelait « EN, pour que ça se
            dise », comme si ces deux lettres venaient d'ailleurs. Elles sont
            dans « général », et le sigle le montre maintenant : GEN-éral. */}
      </div>
    </div>
  </div>
  );
}
