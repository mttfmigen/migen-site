import Image from "next/image";
import type { CSSProperties } from "react";

import {
  LARGEUR,
  PANNEAU,
  SECTION,
  SURTITRE,
  VERRE,
} from "@/components/site/blocs/habillage";

/**
 * Section « Réassurance » de la capture (`maquette/rendu/offres--residence.html`) :
 * deux cartes côte à côte, « Certifications » en verre (MASE, EcoVadis) et
 * « Qui intervient chez vous » en panneau anthracite (trois repères, les dix
 * hubs, la ligne des quatre agences).
 *
 * Le texte est celui du gabarit, copié mot pour mot de la capture. Les dix
 * hubs et les quatre agences sont la liste mandatée par le contrat du projet
 * (CLAUDE.md §9).
 */

/** Le surtitre partagé du site, à la marge de la capture près (18px, pas 16). */
const SURTITRE_CARTE: CSSProperties = { ...SURTITRE, marginBottom: 18 };

const CARTE_CERTIFICATIONS: CSSProperties = {
  ...VERRE,
  padding: "34px 36px 36px",
};

const CADRE_LOGO: CSSProperties = {
  borderRadius: 12,
  background: "#fff",
  border: "1px solid var(--line)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  flex: "0 0 auto",
};

const PANNEAU_EQUIPE: CSSProperties = {
  ...PANNEAU,
  padding: "34px 36px 36px",
};

const LUEUR: CSSProperties = {
  position: "absolute",
  width: 400,
  height: 400,
  right: -160,
  top: -180,
  background: "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
  pointerEvents: "none",
};

const REPERE_VALEUR: CSSProperties = {
  font: "600 30px/1 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
};

const REPERE_LIBELLE: CSSProperties = {
  font: "400 13px/1.45 var(--fb)",
  color: "rgba(255,255,255,.6)",
  marginTop: 8,
};

const PUCE_HUB: CSSProperties = {
  font: "500 12px var(--fb)",
  padding: "5px 11px",
  borderRadius: 999,
  background: "rgba(255,255,255,.08)",
  color: "rgba(255,255,255,.75)",
};

/** Les trois repères du panneau, texte fixe de la capture. */
const REPERES = [
  { valeur: "10 %", libelle: "des candidats retenus" },
  {
    valeur: "Salariés",
    libelle: "techniciens Migen, évalués sur la technique et le comportement",
  },
  { valeur: "10", libelle: "hubs de techniciens en France" },
] as const;

/** Les dix hubs, dans l'ordre de la capture. */
const HUBS = [
  "Paris",
  "Lille",
  "Marseille",
  "Toulouse",
  "Lyon",
  "Metz",
  "Strasbourg",
  "Bordeaux",
  "Dijon",
  "Nantes",
] as const;

export default function Reassurance() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: ".9fr 1.1fr",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          <div style={CARTE_CERTIFICATIONS}>
            <div style={SURTITRE_CARTE}>Certifications</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginBottom: 22,
              }}
            >
              <span style={{ ...CADRE_LOGO, width: 132, height: 72 }}>
                <Image
                  src="/assets/logos/mase.png"
                  alt="MASE"
                  width={108}
                  height={56}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", width: "auto", height: "auto" }}
                />
              </span>
              <span style={{ ...CADRE_LOGO, width: 72, height: 72 }}>
                <Image
                  src="/assets/logos/ecovadis.webp"
                  alt="EcoVadis Committed 2025"
                  width={56}
                  height={56}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", width: "auto", height: "auto" }}
                />
              </span>
            </div>
            <p style={{ font: "400 15px/1.65 var(--fb)", color: "var(--ink2)", margin: 0 }}>
              Démarche{" "}
              <strong style={{ fontWeight: 600, color: "var(--ink)" }}>MASE</strong>{" "}
              pour la sécurité de nos interventions et évaluation{" "}
              <strong style={{ fontWeight: 600, color: "var(--ink)" }}>EcoVadis</strong>{" "}
              sur notre performance RSE. Les attestations sont transmises avec
              chaque plan de prévention.
            </p>
          </div>

          <div style={PANNEAU_EQUIPE}>
            <div aria-hidden="true" style={LUEUR} />
            <div style={{ position: "relative" }}>
              <div style={{ ...SURTITRE_CARTE, marginBottom: 22 }}>
                Qui intervient chez vous
              </div>
              <div
                className="mg-rmulti"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                  gap: 20,
                }}
              >
                {REPERES.map((repere) => (
                  <div key={repere.valeur}>
                    <div style={REPERE_VALEUR}>{repere.valeur}</div>
                    <div style={REPERE_LIBELLE}>{repere.libelle}</div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid rgba(255,255,255,.12)",
                }}
              >
                {HUBS.map((hub) => (
                  <span key={hub} style={PUCE_HUB}>
                    {hub}
                  </span>
                ))}
              </div>
              <div
                style={{
                  font: "400 12.5px var(--fb)",
                  color: "rgba(255,255,255,.45)",
                  marginTop: 14,
                }}
              >
                4 agences : Lyon (siège), Montréal, Dubaï, Madrid.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
