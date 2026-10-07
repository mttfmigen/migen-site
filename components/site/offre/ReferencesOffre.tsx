import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type { SectionPreuves } from "@/types/contenu";

import { etiquetteEtude, phraseDate } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * Section « 08 Références » de la capture (`maquette/rendu/offres--residence.html`) :
 * surtitre « Nos réalisations », H2 « Nos références », lien « Toutes nos
 * études de cas → », puis un rail horizontal de cartes client : photo,
 * étiquette (le client, tiré du libellé long du corpus), titre, date,
 * « Lire l'étude de cas → ».
 *
 * `blocs/Preuves.tsx` n'est pas touché : il sert le gabarit de vente.
 *
 * LES PHOTOS. Les sept prises de la maquette, identifiées le 06/10 en
 * extrayant les octets des cartes du rail de la maquette vivante puis en les
 * rapprochant de la photothèque du site (vignettes 16×16 en niveaux de gris) :
 * cinq existaient déjà dans `public/assets/web/`, deux (SUEZ, MERSEN) ont été
 * rapatriées telles quelles sous `x-technicienne-gilet.jpg` et
 * `x-tableau-ceinture.jpg`. Plus aucun remplacement « au plus proche ».
 */

export interface ProprietesReferencesOffre {
  section: SectionPreuves;
}

/** Une photo par carte, dans l'ordre des preuves du corpus. */
const PHOTOS: readonly string[] = [
  "/assets/web/x-technicienne-gilet.jpg",
  "/assets/web/team-grind-front.jpg",
  "/assets/web/x-tableau-ceinture.jpg",
  "/assets/web/team-duo.jpg",
  "/assets/web/x-logistique-entrepot.jpg",
  "/assets/web/team-grind-close.jpg",
  "/assets/web/x-soudure.jpg",
];

const ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 40,
  marginBottom: 38,
  flexWrap: "wrap",
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "24ch",
  textWrap: "balance",
};

const LIEN_TOUTES: CSSProperties = {
  font: "600 15px var(--fb)",
  color: "var(--acc)",
  flex: "0 0 auto",
  paddingBottom: 6,
};

const RAIL: CSSProperties = {
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "minmax(280px,320px)",
  gap: 14,
  overflowX: "auto",
  padding: "4px 2px 16px",
  WebkitMaskImage:
    "linear-gradient(to right,#000 calc(100% - 70px),transparent)",
  maskImage: "linear-gradient(to right,#000 calc(100% - 70px),transparent)",
};

const CARTE: CSSProperties = {
  scrollSnapAlign: "start",
  display: "flex",
  flexDirection: "column",
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  boxShadow: "0 1px 1px rgba(0,0,0,.04)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

const CADRE_PHOTO: CSSProperties = {
  height: 150,
  background: "var(--ph)",
  overflow: "hidden",
  flex: "0 0 auto",
  position: "relative",
};

const ETIQUETTE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

const TITRE_CARTE: CSSProperties = {
  font: "600 19px/1.3 var(--ft)",
  letterSpacing: "-.025em",
  marginTop: 12,
};

const DATE_CARTE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
  marginTop: 10,
  marginBottom: 18,
};

const PIED_CARTE: CSSProperties = {
  marginTop: "auto",
  paddingTop: 18,
  borderTop: "1px solid var(--line)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const FLECHE: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  font: "600 15px var(--fb)",
};

export default function ReferencesOffre({ section }: ProprietesReferencesOffre) {
  const preuves = section.preuves.filter(
    (preuve) => !!preuve.lienHref && estCheminInterne(preuve.lienHref),
  );

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 16 }}>
              Nos réalisations
            </div>
            <h2 style={TITRE}>Nos références</h2>
          </div>
          <Link href="/preuves/" prefetch={false} style={LIEN_TOUTES}>
            Toutes nos études de cas →
          </Link>
        </div>
        {/* La classe `g3-refrail` branche le rail sur le moteur d'auto-
            défilement de `Moteurs.tsx` (0,45 px par image), comme dans la
            maquette : sans elle, le rail du site restait immobile là où celui
            de la capture défile seul. */}
        <div className="g3-refrail" style={RAIL}>
          {preuves.map((preuve, rang) => (
            <Link
              key={preuve.lienHref}
              href={preuve.lienHref!}
              prefetch={false}
              className={styles.carteReference}
              style={CARTE}
            >
              <div style={CADRE_PHOTO}>
                <Image
                  src={PHOTOS[rang % PHOTOS.length]}
                  alt=""
                  fill
                  sizes="320px"
                  style={{
                    objectFit: "cover",
                    filter: "saturate(var(--sat)) contrast(1.05)",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "24px 26px 28px",
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 0%",
                }}
              >
                <div style={ETIQUETTE}>{etiquetteEtude(preuve)}</div>
                <div style={TITRE_CARTE}>{preuve.titre}</div>
                <div style={DATE_CARTE}>{phraseDate(preuve.texte)}</div>
                <div style={PIED_CARTE}>
                  <span style={{ font: "600 14px var(--fb)", color: "var(--ink)" }}>
                    Lire l’étude de cas
                  </span>
                  <span aria-hidden="true" style={FLECHE}>
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
