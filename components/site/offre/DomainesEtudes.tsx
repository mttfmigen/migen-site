import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { resumeDe } from "@/components/site/blocs/resume-de-section";
import { altPhoto } from "@/lib/descriptions-photos";

import EtiquettePli from "./EtiquettePli";
import { numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * « Nos domaines d’études », section `data-screen-label="Domaines d’études"`
 * de la MAQUETTE V3 (16/10) : surtitre « Bureau d’études », H2, une phrase,
 * puis cinq tuiles photo cliquables, la première sur deux rangées.
 *
 * OÙ : sur `/offres/bureau-etudes/` (les cinq domaines, « Nos domaines
 * d’études ») et sur les pages `/bureau-etudes/…` (« Nos autres domaines
 * d’études », sans la tuile de la page elle-même), comme le calcule la V3.
 * Ailleurs, rien n’est rendu.
 *
 * LE TEXTE EST CELUI DE LA V3, mot pour mot. LES PHOTOS NE LE SONT PAS : la V3
 * sert des images de la maquette (`assets/web/x-…`), hors de la répartition
 * de `lib/photos-autorisees.ts`. Chaque tuile porte donc une photo du registre
 * sous licence, du même sujet, absente des cinq pages du bureau d’études au
 * 16/10. Porte : `verification-domaines-etudes.tsx`.
 *
 * Au téléphone, la maquette mobile ne porte pas ce bloc : il passe replié
 * après ses sections (`data-mobile-apres-sections`), comme « Les prestations
 * liées à cette offre ».
 */

export interface DomaineEtudes {
  href: string;
  titre: string;
  phrase: string;
  photo: string;
}

export const DOMAINES_ETUDES: readonly DomaineEtudes[] = [
  {
    href: "/bureau-etudes/",
    titre: "Mécanique",
    phrase: "Structures et châssis, mécano-soudé, transmissions, outillages, implantation sur site.",
    photo: "/assets/photos/meca-pied-a-coulisse-fraiseuse.jpg",
  },
  {
    href: "/bureau-etudes/bureau-etude-electrique/",
    titre: "Électrique",
    phrase: "Du schéma à l’armoire qui tourne.",
    photo: "/assets/photos/elec-mains-bornier-relais.jpg",
  },
  {
    href: "/bureau-etudes/bureau-etude-electronique/",
    titre: "Électronique",
    phrase: "Une carte pensée pour être réparée.",
    photo: "/assets/photos/automatisme-coffret-cartes-portable.jpg",
  },
  {
    href: "/expertises/automatisme/",
    titre: "Automatisme",
    phrase: "Quand l’automate se tait, toute la ligne s’arrête.",
    photo: "/assets/photos/env-inspection-bras-robotiques.jpg",
  },
  {
    href: "/bureau-etudes/mise-en-conformite-machine/",
    titre: "Mise en conformité machine",
    phrase: "Fixez le calendrier avant l’inspection.",
    photo: "/assets/photos/robot-cellules-grillagees.jpg",
  },
];

/** Les tuiles d’une page, selon la règle de la V3 ; vide hors bureau d’études. */
export function domainesPour(chemin: string | undefined): readonly DomaineEtudes[] {
  if (!chemin || !/^\/(offres\/)?bureau-etudes\//.test(chemin)) return [];
  return DOMAINES_ETUDES.filter((domaine) => domaine.href !== chemin);
}

const ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 24,
  flexWrap: "wrap",
  marginBottom: 22,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "22ch",
  textWrap: "balance",
};

const PHRASE: CSSProperties = {
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "44ch",
  textWrap: "pretty",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gridAutoRows: "minmax(232px,auto)",
  gap: 12,
};

const TUILE: CSSProperties = {
  position: "relative",
  display: "block",
  minHeight: 232,
  overflow: "hidden",
  borderRadius: "var(--rad-s)",
  background: "#2a2927",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg,rgba(28,27,25,.04) 22%,rgba(28,27,25,.88) 100%)",
};

const FLECHE: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "rgba(255,255,255,.92)",
  color: "#1c1b19",
  display: "grid",
  placeItems: "center",
  font: "600 15px var(--fb)",
};

const TEXTE: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  padding: "22px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 7,
};

const NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "#ff7c3c",
};

const TUILE_PHRASE: CSSProperties = {
  font: "400 14px/1.5 var(--fb)",
  color: "rgba(255,255,255,.86)",
  maxWidth: "40ch",
  textWrap: "pretty",
};

export default function DomainesEtudes({ chemin }: { chemin?: string }) {
  const domaines = domainesPour(chemin);
  if (domaines.length === 0) return null;

  const titre =
    chemin === "/offres/bureau-etudes/" ? "Nos domaines d’études" : "Nos autres domaines d’études";
  const n = domaines.length;

  return (
    <section
      data-mobile-apres-sections=""
      className={styles.apresSectionsMobile}
      style={SECTION}
    >
      <div style={LARGEUR}>
        <SectionPliableMobile
          numero={false}
          enTete={<EtiquettePli surtitre="Bureau d’études" titre={titre} />}
          resume={resumeDe(domaines.map((domaine) => domaine.titre))}
        >
          <div style={ENTETE}>
            <div data-doublon-mobile="">
              <div style={{ ...SURTITRE, marginBottom: 10 }}>Bureau d’études</div>
              <h2 style={TITRE}>{titre}</h2>
            </div>
            <p style={PHRASE}>
              Nos ingénieurs conçoivent aux côtés de techniciens qui réparent des machines
              toute l’année. Le montage et la mise en service restent chez nous.
            </p>
          </div>

          <div className={styles.domainesEtudes} style={GRILLE}>
            {domaines.map((domaine, rang) => (
              <Link
                key={domaine.href}
                href={domaine.href}
                prefetch={false}
                className={styles.tuileDomaine}
                style={{
                  ...TUILE,
                  gridRow: rang === 0 ? "span 2" : "auto",
                  gridColumn: n === 4 && rang === 3 ? "span 2" : "auto",
                }}
              >
                <Image
                  src={domaine.photo}
                  alt={altPhoto(domaine.photo)}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
                  style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
                />
                <span aria-hidden="true" style={VOILE} />
                <span aria-hidden="true" style={FLECHE}>
                  →
                </span>
                <span style={TEXTE}>
                  <span style={NUMERO}>{numerote(rang)}</span>
                  <span
                    style={{
                      font: `600 ${rang === 0 ? 30 : 21}px/1.15 var(--ft)`,
                      letterSpacing: "-.03em",
                      color: "#fff",
                      textWrap: "balance",
                    }}
                  >
                    {domaine.titre}
                  </span>
                  <span style={TUILE_PHRASE}>{domaine.phrase}</span>
                </span>
              </Link>
            ))}
          </div>
        </SectionPliableMobile>
      </div>
    </section>
  );
}
