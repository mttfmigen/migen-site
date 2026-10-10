import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import { numerote } from "@/components/site/offre/texte-offre";
import type { RangeeTypeHub } from "@/types/expertises";

import styles from "./PageExpertises.module.css";

/**
 * Écran « 02 Types de maintenance » du hub, relevé sur
 * `maquette/rendu/expertises.html` (blocs 346 à 364) : panneau photo sombre à
 * gauche, surtitre et H2 posés en bas ; à droite, quatre rangées numérotées,
 * chacune avec sa barre beige « Quand l'utiliser » et son bouton à flèche.
 *
 * POURQUOI PAS `offre/TypesMaintenance`. Même dessin, mais le composant du
 * gabarit 03 rend la barre beige VIDE et le panneau SANS photo, comme la
 * capture de `/offres/full-service/`. Celle du hub remplit les deux : la photo
 * est servie en `blob:`, et ses octets sont ceux de `mq-17e2f3bce95f.jpg`
 * (empreinte relevée sur la maquette vivante le 08/10) ; la barre porte son
 * étiquette puis un texte. Le composant partagé n'est pas touché.
 *
 * Le surtitre et l'alt de la photo sont écrits en dur dans le gabarit de la
 * maquette (`MigenExpertise.dc.html`, l. 209 et 211) : ils vivent ici.
 */

export interface ProprietesTypesMaintenance {
  titre: string;
  photo: string;
  etiquette: string;
  rangees: readonly RangeeTypeHub[];
}

/* Bloc 348. `mg-r2` replie en une colonne sous 900px. */
const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)",
  gap: 48,
  alignItems: "stretch",
};

/* Bloc 349. */
const PANNEAU: CSSProperties = {
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  minHeight: 440,
  background: "rgb(28,27,25)",
};

/* Bloc 351. */
const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top,rgba(18,17,16,.92) 0%,rgba(18,17,16,.35) 55%,rgba(18,17,16,.05) 100%)",
};

/* Bloc 352. */
const LEGENDE: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  padding: 34,
};

/* Bloc 354. */
const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  color: "#fff",
  maxWidth: "18ch",
  textWrap: "balance",
};

/* Bloc 355. */
const LISTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  borderTop: "1px solid var(--line)",
};

/* Bloc 357. */
const RANGEE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "40px minmax(0,1fr) 36px",
  gap: 18,
  alignItems: "start",
  padding: "26px 6px",
  borderBottom: "1px solid var(--line)",
  color: "var(--ink)",
  transition: "background-color var(--tr)",
};

/* Blocs 358 à 364. */
const NUMERO: CSSProperties = {
  font: "600 12px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  paddingTop: 5,
};
const COLONNE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minWidth: 0,
};
const TITRE_RANGEE: CSSProperties = {
  font: "600 calc(21px * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.03em",
  margin: 0,
};
const PHRASE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  maxWidth: "56ch",
};
const BARRE: CSSProperties = {
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  gap: 4,
  marginTop: 6,
  padding: "11px 14px",
  borderRadius: 14,
  background: "var(--acc-w)",
  font: "500 13px/1.45 var(--fb)",
  color: "var(--ink1)",
};
const ETIQUETTE: CSSProperties = {
  font: "600 10px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  color: "var(--acc-ink)",
};
const FLECHE: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "var(--chip)",
  color: "var(--ink)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  font: "600 15px var(--fb)",
  marginTop: 2,
};

export default function TypesMaintenance({
  titre,
  photo,
  etiquette,
  rangees,
}: ProprietesTypesMaintenance) {
  const retenues = rangees.filter((rangee) => estCheminInterne(rangee.href));
  if (retenues.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={GRILLE}>
          <div style={PANNEAU}>
            <Image
              src={photo}
              alt="Technicien migen en intervention"
              fill
              sizes="(max-width: 900px) 100vw, 520px"
              style={{ objectFit: "cover", filter: "saturate(var(--sat))" }}
            />
            <div aria-hidden="true" style={VOILE} />
            <div style={LEGENDE}>
              <div style={{ ...SURTITRE, marginBottom: 14 }}>
                Types de maintenance
              </div>
              <h2 style={TITRE}>{titre}</h2>
            </div>
          </div>
          <div style={LISTE}>
            {retenues.map((rangee, rang) => (
              <Link
                key={rangee.href}
                href={rangee.href}
                prefetch={false}
                className={styles.rangeeType}
                style={RANGEE}
              >
                <span style={NUMERO}>{numerote(rang)}</span>
                <span style={COLONNE}>
                  <h3 style={TITRE_RANGEE}>{rangee.titre}</h3>
                  <span style={PHRASE}>{rangee.phrase}</span>
                  <span style={BARRE}>
                    <span style={ETIQUETTE}>{etiquette}</span>
                    {rangee.quand}
                  </span>
                </span>
                <span aria-hidden="true" style={FLECHE}>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
