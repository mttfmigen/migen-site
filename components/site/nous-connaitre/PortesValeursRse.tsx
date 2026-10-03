import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./PortesValeursRse.module.css";

/**
 * Deux portes de sortie : les valeurs, les engagements RSE.
 *
 * Maquette, lignes 5484 à 5501.
 *
 * `/valeurs/` et `/rse/` ont été vérifiées en 200 sur le serveur local avant
 * d'être posées : une carte qui se soulève sous le curseur et mène à une 404 est
 * exactement le défaut qu'on répare sur cet écran.
 */

const CARTE: CSSProperties = {
  display: "block",
  transition: "transform var(--tr)",
  borderRadius: "var(--rad)",
  padding: "34px 36px",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
};

const SURTITRE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 12,
};

const TITRE: CSSProperties = {
  font: "600 calc(22px * var(--ts)) var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
  marginBottom: 8,
};

const TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 18px",
  maxWidth: "42ch",
};

const PIED: CSSProperties = {
  font: "600 13.5px var(--fb)",
  color: "var(--acc-ink)",
};

const PORTES: readonly {
  surtitre: string;
  titre: string;
  texte: string;
  action: string;
  href: string;
}[] = [
  {
    href: "/valeurs/",
    surtitre: "Nos valeurs",
    titre: "Cinq règles, vérifiables",
    texte:
      "Pas des mots sur un mur : chaque valeur se traduit par une chose que vous pouvez nous demander de prouver.",
    action: "Les lire →",
  },
  {
    href: "/rse/",
    surtitre: "Engagements RSE",
    titre: "Sécurité, social, environnement",
    texte:
      "Démarche MASE, évaluation EcoVadis, et un suivi publié de nos accidents du travail : 2 avec arrêt en 2025.",
    action: "Voir nos engagements →",
  },
];

export default function PortesValeursRse() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {PORTES.map((p) => (
            <Link
              key={p.surtitre}
              href={p.href}
              className={styles.carteLien}
              style={CARTE}
            >
              <div style={SURTITRE}>{p.surtitre}</div>
              <div style={TITRE}>{p.titre}</div>
              <p style={TEXTE}>{p.texte}</p>
              <span style={PIED}>{p.action}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
