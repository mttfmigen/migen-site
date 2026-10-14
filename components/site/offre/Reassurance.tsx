import Image from "next/image";
import type { CSSProperties } from "react";

import { appliqueDecisions } from "@/lib/decisions-copie";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import {
  LARGEUR,
  PANNEAU,
  SECTION,
  SURTITRE,
  VERRE,
} from "@/components/site/blocs/habillage";
import type { RepereOffre } from "@/types/offre";

import styles from "./PliSansTitre.module.css";

/**
 * Section « Réassurance » de la capture (`maquette/rendu/offres--residence.html`) :
 * deux cartes côte à côte, « Certifications » en verre (MASE, EcoVadis) et
 * « Qui intervient chez vous » en panneau anthracite (trois repères, les dix
 * hubs, la ligne des quatre agences).
 *
 * Le texte est celui du gabarit, copié mot pour mot de la capture. Les dix
 * hubs et les quatre agences sont la liste mandatée par le contrat du projet
 * (CLAUDE.md §9).
 *
 * REPLIÉE AU TÉLÉPHONE (décision de Mehdi du 14/10) : 981 px de moins à
 * 390 px, mesuré, pour un bloc sans titre de section. Le titre du repli est
 * celui que Mehdi lui a donné, « Certifications et équipe », mot pour mot ;
 * au-dessus de 880 px il ne se voit pas (`PliSansTitre.module.css`) et rien
 * ne change.
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

/**
 * Les trois repères du panneau, DÉFAUT du gabarit : celui de la capture de la
 * page pilote `/offres/residence/`.
 *
 * ILS NE SONT PAS LES MÊMES PARTOUT, et c'est mesuré le 07/10 sur les
 * captures : `/travaux-industriels/` et ses sous-pages (dont
 * `/travaux-industriels/levage-manutention/`) écrivent les métiers du chantier
 * (« Chefs de chantier », « Monteurs et levageurs », « Un interlocuteur »),
 * `/offres/bureau-etudes/` écrit ceux de l'étude (« Ingénieurs »,
 * « Projeteurs », « Chefs de projet »). La page les fournit donc par
 * `ContenuOffre.reperesReassurance`. Sans ce champ, le défaut ci-dessous est
 * servi et aucune page déjà portée ne bouge.
 */
const REPERES = [
  { valeur: "10 %", libelle: "des techniciens retenus" },
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

export interface ProprietesReassurance {
  /** Les trois repères de « Qui intervient chez vous ». À défaut, ceux de la capture pilote. */
  reperes?: readonly RepereOffre[];
  /**
   * Le chemin de la page, pour les décisions de copie à portée limitée
   * (`lib/decisions-copie.ts`). Absent, les libellés passent tels quels.
   *
   * CE QUE ÇA CHANGE AUJOURD'HUI : rien de servi. Les dix pages de la décision
   * du 12/10 fournissent toutes leur `reperes`, et ces fiches portent déjà
   * « experts techniques ». Le passage par `appliqueDecisions` garde le DÉFAUT
   * ci-dessus, « 10 % · des techniciens retenus », qui redeviendrait servi le
   * jour où une de ces dix fiches perdrait son champ.
   */
  chemin?: string;
}

export default function Reassurance({
  reperes = REPERES,
  chemin,
}: ProprietesReassurance) {
  return (
    /* Même règle que `LogosClients` : après les sections de la maquette au
       téléphone (`data-mobile-apres-sections`), carte sans numéro. */
    <section data-mobile-apres-sections="" style={SECTION}>
      <div style={LARGEUR}>
        <SectionPliableMobile
          numero={false}
          enTete={
            <h2 className={styles.titre} data-carte-titre="">
              Certifications et équipe
            </h2>
          }
        >
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: ".9fr 1.1fr",
              gap: 20,
              alignItems: "stretch",
            }}
          >
            <div className={styles.sousCarte} style={CARTE_CERTIFICATIONS}>
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

            <div className={`${styles.sousCarte} ${styles.sousCarteSombre}`} style={PANNEAU_EQUIPE}>
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
                  {reperes.map((repere) => (
                    <div key={repere.valeur}>
                      <div className={styles.repereValeur} style={REPERE_VALEUR}>{repere.valeur}</div>
                      <div style={REPERE_LIBELLE}>{appliqueDecisions(repere.libelle, chemin)}</div>
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
        </SectionPliableMobile>
      </div>
    </section>
  );
}
