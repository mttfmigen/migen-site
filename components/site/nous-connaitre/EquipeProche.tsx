import Link from "next/link";

import styles from "./EquipeProche.module.css";

/**
 * L'équipe proche du client : trois rôles, trois cartes.
 *
 * Maquette, lignes 5458 à 5483.
 *
 * Les trois cibles, `/implantations/`, `/contact/` et `/equipe/`, ont été
 * vérifiées en 200 sur le serveur local avant d'être posées.
 *
 * CORRECTION SUR LA COPIE : « Il part de l'agence la plus proche » laissait
 * entendre un réseau d'agences françaises. Le contrat n'en reconnaît qu'une en
 * France (Lyon, siège) et dix hubs de techniciens, d'où « du hub le plus
 * proche ».
 */

const CARTE = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
  padding: "28px 28px 30px",
  display: "flex",
  flexDirection: "column",
} as const;

const TITRE = {
  font: "600 calc(19px * var(--ts)) var(--ft)",
  letterSpacing: "-.03em",
  color: "var(--ink)",
  marginBottom: 10,
} as const;

const TEXTE = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 20px",
} as const;

const PIED = {
  font: "600 13.5px var(--fb)",
  marginTop: "auto",
  whiteSpace: "nowrap",
} as const;

interface Role {
  titre: string;
  texte: string;
  /** Libellé du pied de carte, tel que la maquette l'écrit. */
  action: string;
  /** Cible vérifiée en 200. */
  href: string;
}

const ROLES: readonly Role[] = [
  {
    titre: "Le technicien sur votre ligne",
    texte:
      "Celui que vous voyez tous les matins. Il part du hub le plus proche, connaît vos machines au bout de trois semaines, et reste : notre turnover est de 20 % quand le secteur est à 60 %.",
    action: "Nos implantations →",
    href: "/implantations/",
  },
  {
    titre: "Votre chargé d’affaires",
    texte:
      "Un nom, un portable, une visite de votre site avant la première mission. C’est lui qui décroche quand vous appelez, pas un standard, pas un ticket.",
    action: "Le joindre →",
    href: "/contact/",
  },
  {
    titre: "Le recruteur qui cherche pour vous",
    texte:
      "Quand il faut renforcer l’équipe, c’est lui qui source, teste et vous présente les profils. Vous validez chaque intervenant avant son arrivée, sans avoir à vous justifier.",
    action: "Voir l’équipe →",
    href: "/a-propos/equipe/",
  },
];

export default function EquipeProche() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: 18,
            }}
          >
            L&rsquo;équipe proche de vous au quotidien
          </div>
          <h2
            style={{
              font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
              letterSpacing: "-.04em",
              color: "var(--ink)",
              margin: "0 0 30px",
              textWrap: "balance",
              maxWidth: "24ch",
            }}
          >
            Trois personnes, et vous les connaissez par leur nom
          </h2>
          <div
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 12,
            }}
          >
            {ROLES.map((r) => (
              <div key={r.titre} style={CARTE}>
                <div style={TITRE}>{r.titre}</div>
                <p style={TEXTE}>{r.texte}</p>
                <Link
                  href={r.href}
                  className={styles.lienCarte}
                  style={{ ...PIED, color: "var(--acc-ink)" }}
                >
                  {r.action}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
