import Link from "next/link";
import type { CSSProperties } from "react";

import PortesOffres from "./PortesOffres";
import styles from "./PortesValeursRse.module.css";
import type { EntreeSommaire } from "./HautMobile";
import mobile from "./mobile-apropos.module.css";
import ouvertes from "./mobile-cartes-ouvertes.module.css";
import SectionRepliee from "./SectionRepliee";

/**
 * Les portes de sortie de l'écran : les six offres, les valeurs, la RSE.
 *
 * Maquette, lignes 5484 à 5501, pour les deux cartes valeurs et RSE.
 *
 * `/valeurs/` et `/rse/` ont été vérifiées en 200 sur le serveur local avant
 * d'être posées : une carte qui se soulève sous le curseur et mène à une 404 est
 * exactement le défaut qu'on répare sur cet écran.
 *
 * POURQUOI LES SIX OFFRES SONT MONTÉES ICI : c'est la dernière sortie avant le
 * formulaire, à l'endroit où le site place son maillage d'offres sur les pages
 * d'offre.
 *
 * AU TÉLÉPHONE, UNE SEULE CARTE, LA 09 DE LA MAQUETTE MOBILE V2 : sur-titre
 * « Nos valeurs », titre « Cinq règles, vérifiables », résumé « Pas des mots
 * sur un mur… » (`mobile-native-data.js`, page /a-propos/nous-connaitre/). Les
 * six offres, ajout du client absent de la maquette, sont rangées DANS cette
 * carte, sous les deux portes : elles ne font plus une dixième carte, le
 * sommaire compte les neuf parties de la maquette, et rien n'est retiré. Au
 * bureau, le `<details>` est transparent : les deux sections s'enchaînent au
 * pixel près comme avant.
 *
 * CARTE OUVERTE DU TÉLÉPHONE (maquette V3 du 16/10) : du texte sur le blanc de
 * la carte, sans cartes de verre (`.aplat`). La porte « Nos valeurs » ne
 * redit pas le sur-titre et le titre que la bascule porte déjà
 * (`data-doublon-mobile`) : son texte ouvre la carte (`.leadV3`), son lien
 * suit. La porte RSE garde son sur-titre, son titre et son texte.
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

/* La carte 09 de la maquette : la porte « Nos valeurs », mot pour mot. */
const VALEURS = PORTES[0];

/** La carte 09 de la maquette mobile v2 (« Nos valeurs »). */
export const SOMMAIRE_PORTES: EntreeSommaire = {
  id: "nos-valeurs",
  titre: VALEURS.titre,
};

export default function PortesValeursRse() {
  return (
      <SectionRepliee
        id={SOMMAIRE_PORTES.id}
        kicker={VALEURS.surtitre}
        titre={VALEURS.titre}
        resume={VALEURS.texte}
      >
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
            {PORTES.map((p) => {
              const redite = p === VALEURS;
              return (
                <Link
                  key={p.surtitre}
                  href={p.href}
                  className={`${styles.carteLien} ${mobile.aplat} ${redite ? "" : ouvertes.blocSuivant}`}
                  style={CARTE}
                >
                  <div
                    data-doublon-mobile={redite ? "" : undefined}
                    data-mm-surtitre={redite ? undefined : ""}
                    style={SURTITRE}
                  >
                    {p.surtitre}
                  </div>
                  <div
                    data-doublon-mobile={redite ? "" : undefined}
                    data-mm-lead={redite ? undefined : ""}
                    style={TITRE}
                  >
                    {p.titre}
                  </div>
                  <p
                    className={redite ? mobile.leadV3 : undefined}
                    data-mm-texte={redite ? undefined : ""}
                    style={TEXTE}
                  >
                    {p.texte}
                  </p>
                  <span className={ouvertes.lienPorte} style={PIED}>
                    {p.action}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <PortesOffres />
      </SectionRepliee>
  );
}
