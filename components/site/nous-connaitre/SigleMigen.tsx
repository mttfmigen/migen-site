import type { CSSProperties } from "react";

import mobile from "./mobile-apropos.module.css";
import ouvertes from "./mobile-cartes-ouvertes.module.css";

/**
 * Le panneau sombre qui épelle M, I, G, EN.
 *
 * Maquette, lignes 5296 à 5310. Extrait de `OrigineDuNom` pour tenir sous les
 * 400 lignes par fichier du contrat de portage : la section de la maquette en
 * compte quatre blocs, celui-ci est le plus autonome.
 *
 * AU TÉLÉPHONE (maquette V3 du 16/10), le récit est en texte clair : le
 * panneau sombre s'efface (`.aplat`, `.decor`), la question devient la phrase
 * clé et l'épellation reste, en plus petit et à l'encre de la page
 * (`.sigle`).
 */

const LETTRE: CSSProperties = {
  font: "700 calc(clamp(56px,7vw,96px) * var(--ts))/.9 var(--ft)",
  letterSpacing: "-.06em",
  color: "var(--acc)",
  /* AUCUNE LARGEUR IMPOSÉE (14/10, signalé par Mehdi : « le GEN mange le
     général », « M = aintenance »). Une largeur fixe de .9em tenait une seule
     lettre ; « GEN », sur la même rangée depuis le retrait de la rangée
     « EN », débordait de sa case et recouvrait « éral ». Chaque lettre prend
     sa largeur et sa suite la colle : M-aintenance, I-ndustrielle, GEN-éral. */
  flex: "none",
};

const SUITE: CSSProperties = {
  font: "500 calc(clamp(18px,1.8vw,22px) * var(--ts)) var(--fb)",
  color: "rgba(255,255,255,.72)",
};

const RANGEE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 8,
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
  /* « érale » et non « éral » depuis la V3 du 16/10 : le mot est celui de la
     couverture, « Maintenance industrielle générale ». */
  ["GEN", "érale"],
];

/* La quatrième rangée de la V3 (16/10) : le nom entier, sous un filet. Elle
   ne redit pas « EN » comme l'ancienne, elle donne le résultat de l'épellation. */
const RANGEE_NOM: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 14,
  marginTop: 10,
  paddingTop: 14,
  borderTop: "1px solid rgba(255,255,255,.14)",
};

const NOM: CSSProperties = {
  font: "700 calc(clamp(40px,5vw,64px) * var(--ts))/.9 var(--ft)",
  letterSpacing: "-.05em",
  color: "#fff",
};

const NOM_LEGENDE: CSSProperties = {
  font: "400 14px var(--fb)",
  color: "rgba(255,255,255,.5)",
};

export default function SigleMigen() {
  return (
  <div
    data-reveal=""
    className={mobile.aplat}
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
      className={mobile.decor}
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
          className={mobile.decor}
          style={{
            font: "600 64px/.6 var(--ft)",
            color: "var(--acc)",
            marginBottom: 18,
          }}
        >
          &ldquo;
        </div>
        <div
          data-mm-lead=""
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
          data-mm-texte=""
          className={ouvertes.texteFort}
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
          . M pour Maintenance, I pour Industrielle, GEN pour Générale&nbsp;: réponse
          immédiate.
        </p>
      </div>
      <div
        className={ouvertes.sigle}
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6 }}
      >
        {SIGLE.map(([lettre, suite]) => (
          <div key={lettre} style={RANGEE}>
            <span style={LETTRE}>{lettre}</span>
            <span style={SUITE}>{suite}</span>
          </div>
        ))}
        {/* L'ANCIENNE QUATRIÈME RANGÉE est restée retirée : elle épelait
            « EN, pour que ça se dise », comme si ces deux lettres venaient
            d'ailleurs. Celle-ci donne le nom entier, comme la V3. */}
        <div style={RANGEE_NOM}>
          <span style={NOM}>migen</span>
          <span style={NOM_LEGENDE}>le nom de la société</span>
        </div>
      </div>
    </div>
  </div>
  );
}
