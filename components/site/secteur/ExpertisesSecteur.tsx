import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { CarteExpertiseSecteur } from "@/types/secteur";

import styles from "./PageSecteur.module.css";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * Section « Expertises du secteur » de la capture
 * (`maquette/rendu/secteurs--agroalimentaire.html`, gabarit 711 à 726) : en-tête
 * en deux colonnes .8fr/1.2fr (surtitre « Nos expertises », H2, phrase), puis
 * quatre cartes photographiques sombres qui lient chacune son domaine.
 *
 * Même dessin que « Secteurs de l'expertise » du gabarit 09 (`SecteursDomaine`),
 * à trois écarts relevés dans la source (`MigenExpertise.dc.html`, l. 435) :
 * quatre colonnes au lieu de trois, cartes de 230px au lieu de 200, voile à
 * .94 et photo à .66, et la ligne « Voir l'expertise → ». LA COPIE EST UNE
 * DONNÉE : titre, phrase et cartes changent d'un secteur à l'autre.
 *
 * LE SURVOL est l'attribut `style-hover` de la source sur la carte :
 * `transform:translateY(-3px);color:#fff`. Le repli `g3-sect6` aussi : deux
 * colonnes sous 900px, une sous 560px (`PageSecteur.module.css`).
 */

export interface ProprietesExpertisesSecteur {
  titre?: string;
  chapeau?: string;
  cartes: readonly CarteExpertiseSecteur[];
}

const ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".8fr 1.2fr",
  gap: 40,
  alignItems: "end",
  marginBottom: 26,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "20ch",
  textWrap: "balance",
};

const PHRASE: CSSProperties = {
  font: "400 15.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "56ch",
};

const CARTE: CSSProperties = {
  position: "relative",
  display: "block",
  minHeight: 230,
  borderRadius: 22,
  overflow: "hidden",
  background: "rgb(28, 27, 25)",
  color: "#fff",
  transition: "transform var(--tr)",
};

/** Le fond gris de la capture (`#3a3a3c`), sous la photo. */
const FOND: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgb(58, 58, 60)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top,rgba(18,17,16,.94),rgba(18,17,16,.25) 70%)",
};

const CORPS: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  gap: 8,
  minHeight: 230,
  padding: 20,
};

export default function ExpertisesSecteur({ titre, chapeau, cartes }: ProprietesExpertisesSecteur) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 14 }}>Nos expertises</div>
            {titre ? <h2 style={TITRE}>{titre}</h2> : null}
          </div>
          {chapeau ? <p style={PHRASE}>{chapeau}</p> : null}
        </div>
        <div
          className={styles.grilleExpertises}
          style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}
        >
          {cartes.map((carte) => (
            <Link
              key={carte.href}
              href={carte.href}
              prefetch={false}
              className={styles.carteExpertise}
              style={CARTE}
            >
              <div aria-hidden="true" style={FOND} />
              <Image
                src={carte.photo}
                alt={altPhoto(carte.photo)}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 290px"
                style={{ objectFit: "cover", filter: "saturate(var(--sat)) brightness(.66)" }}
              />
              <div aria-hidden="true" style={VOILE} />
              <div style={CORPS}>
                <span style={{ font: "600 18px/1.2 var(--ft)", letterSpacing: "-.025em" }}>{carte.titre}</span>
                <span style={{ font: "400 13px/1.5 var(--fb)", color: "rgba(255,255,255,.76)" }}>
                  {carte.texte}
                </span>
                <span style={{ marginTop: 4, font: "600 12.5px var(--fb)", color: "var(--acc)" }}>
                  Voir l’expertise →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
