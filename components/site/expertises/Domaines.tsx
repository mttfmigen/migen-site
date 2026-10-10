import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, TITRE2 } from "@/components/site/blocs/habillage";
import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import { numerote } from "@/components/site/offre/texte-offre";
import type { CarteDomaineHub } from "@/types/expertises";

import styles from "./PageExpertises.module.css";

/**
 * Écran « 02 Domaines » du hub, relevé sur `maquette/rendu/expertises.html`
 * (blocs 319 à 335) : surtitre « Nos domaines », H2 de la page, puis un bento
 * de cartes sombres à photo, la première sur deux colonnes et deux rangées
 * (la seule qui montre son paragraphe), la huitième sur deux colonnes. Les
 * rangs viennent de `.mgx-dom`, recopié dans `PageExpertises.module.css`.
 *
 * Le surtitre et « Voir l'expertise » sont écrits EN DUR dans le gabarit de la
 * maquette (`MigenExpertise.dc.html`, l. 183 et 194) : ils vivent ici. Le titre,
 * les cartes et leurs photos viennent de la donnée.
 *
 * UNE CIBLE QUI N'EST PAS UN CHEMIN INTERNE FAIT DISPARAÎTRE LA CARTE.
 */

export interface ProprietesDomaines {
  titre: string;
  cartes: readonly CarteDomaineHub[];
}

/* Bloc 324. */
const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
  gridAutoRows: "minmax(230px,auto)",
  gap: 14,
};

/* Bloc 326. */
const CARTE: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  minHeight: 230,
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "rgb(28,27,25)",
  color: "#fff",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

/* Bloc 328. */
const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top,rgba(18,17,16,.94) 0%,rgba(18,17,16,.5) 55%,rgba(18,17,16,.1) 100%)",
};

/* Bloc 329. */
const CORPS: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "22px 24px",
};

/* Blocs 330 à 335. */
const NUMERO: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "rgb(255,124,60)",
};
const TITRE_CARTE: CSSProperties = {
  font: "600 calc(20px * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.03em",
  color: "#fff",
};
const ACCROCHE: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "rgba(255,255,255,.8)",
  maxWidth: "46ch",
};
const TEXTE: CSSProperties = {
  display: "none",
  font: "400 14.5px/1.6 var(--fb)",
  color: "rgba(255,255,255,.72)",
  maxWidth: "52ch",
};
const LIEN: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  marginTop: 6,
  font: "600 13px var(--fb)",
  color: "#fff",
};
const FLECHE: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 999,
  background: "rgb(255,124,60)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
};

export default function Domaines({ titre, cartes }: ProprietesDomaines) {
  const retenues = cartes.filter((carte) => estCheminInterne(carte.href));
  if (retenues.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ marginBottom: 30 }}>
          <div style={SURTITRE}>Nos domaines</div>
          <h2 style={TITRE2}>{titre}</h2>
        </div>
        <div className={styles.bento} style={GRILLE}>
          {retenues.map((carte, rang) => (
            <Link
              key={carte.href}
              href={carte.href}
              prefetch={false}
              className={styles.carteDomaine}
              style={CARTE}
            >
              <Image
                src={carte.photo}
                alt={carte.titre}
                fill
                sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 600px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) brightness(.8)",
                }}
              />
              <div aria-hidden="true" style={VOILE} />
              <div style={CORPS}>
                <span style={NUMERO}>{numerote(rang)}</span>
                <span className={styles.titreDomaine} style={TITRE_CARTE}>
                  {carte.titre}
                </span>
                <span style={ACCROCHE}>{carte.accroche}</span>
                <span className={styles.texteDomaine} style={TEXTE}>
                  {carte.texte}
                </span>
                <span style={LIEN}>
                  Voir l’expertise
                  <span aria-hidden="true" style={FLECHE}>
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
