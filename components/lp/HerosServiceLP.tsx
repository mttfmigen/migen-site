import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import styles from "./conversion-lp.module.css";

/**
 * Le héros sombre des landing pages : la section `#lp-top` de `MigenLP`
 * (maquette V3), style « sombre », photo en fond sous le dégradé de la
 * maquette. Le même pour toutes les pages, celles à formulaire (la carte du
 * formulaire en colonne de droite) comme celles de service (/lp/merci/,
 * /lp/rendez-vous/). Sans directive : il sert aussi bien une page rendue au
 * serveur qu'un composant client.
 */

interface Proprietes {
  /** Photo déjà servie par le site, sous `public/`. */
  photo: string;
  surtitre: string;
  titre: ReactNode;
  chapo?: string;
  /** Les pastilles cochées sous le chapô (`badges`). */
  pastilles?: readonly string[];
  /** Les lignes cochées sous le chapô (`more` dans les données de la maquette). */
  points?: readonly string[];
  /** Les chiffres sous un filet (`hs`). */
  chiffres?: readonly { v: string; l: string }[];
  /** Sous le texte, dans la colonne de gauche : les boutons. */
  actions?: ReactNode;
  /** La colonne de droite, quand la page en a une. */
  carte?: ReactNode;
}

const SECTION: CSSProperties = { position: "relative", overflow: "hidden", background: "#1c1b19" };

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(90deg,rgba(18,17,16,.92) 0%,rgba(18,17,16,.76) 50%,rgba(18,17,16,.52) 100%)",
};

const grille = (deuxColonnes: boolean): CSSProperties => ({
  position: "relative",
  maxWidth: 1200,
  margin: "0 auto",
  padding: "124px 40px 64px",
  display: "grid",
  gridTemplateColumns: deuxColonnes ? "minmax(0,1.08fr) minmax(0,.92fr)" : "minmax(0,1fr)",
  gap: 48,
  alignItems: "center",
});

const SURTITRE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 13px",
  borderRadius: 999,
  background: "rgba(255,255,255,.1)",
  border: "1px solid rgba(255,255,255,.22)",
  font: "600 12.5px var(--fb)",
  color: "#fff",
  marginBottom: 20,
};

const PASTILLE: CSSProperties = { width: 7, height: 7, borderRadius: 999, background: "#ff7c3c", flex: "none" };

const TITRE: CSSProperties = {
  margin: 0,
  font: "700 50px/1.05 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
  textWrap: "balance",
};

const CHAPO: CSSProperties = {
  margin: "20px 0 0",
  maxWidth: 600,
  font: "400 17px/1.65 var(--fb)",
  color: "rgba(255,255,255,.8)",
  textWrap: "pretty",
};

const PASTILLES: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, margin: "22px 0 0", padding: 0, listStyle: "none" };
const PASTILLE_COCHEE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "8px 13px",
  borderRadius: 999,
  background: "rgba(255,255,255,.1)",
  border: "1px solid rgba(255,255,255,.22)",
  font: "500 13px var(--fb)",
  color: "#fff",
};

const CHIFFRES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
  gap: 14,
  margin: "30px 0 0",
  paddingTop: 22,
  borderTop: "1px solid rgba(255,255,255,.16)",
};
const VALEUR: CSSProperties = { font: "700 24px/1 var(--ft)", letterSpacing: "-.03em", color: "#fff" };
const LIBELLE: CSSProperties = { margin: "6px 0 0", font: "400 12.5px/1.4 var(--fb)", color: "rgba(255,255,255,.8)" };

const POINTS: CSSProperties = { display: "grid", gap: 8, margin: "22px 0 0", padding: 0, listStyle: "none", maxWidth: 560 };
const POINT: CSSProperties = { display: "flex", gap: 10, font: "500 15px/1.5 var(--fb)", color: "#fff" };
const COCHE: CSSProperties = { color: "#ff7c3c", fontWeight: 700 };

export function HerosServiceLP({
  photo,
  surtitre,
  titre,
  chapo,
  pastilles = [],
  points = [],
  chiffres = [],
  actions,
  carte,
}: Proprietes) {
  return (
    <section id="lp-top" style={SECTION}>
      <Image src={photo} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
      <div aria-hidden="true" className={styles.voile} style={VOILE} />
      <div className={styles.grilleHeros} style={grille(Boolean(carte))}>
        <div>
          <p style={SURTITRE}>
            <span aria-hidden="true" style={PASTILLE} />
            {surtitre}
          </p>
          <h1 className={styles.titreHeros} style={TITRE}>
            {titre}
          </h1>
          {chapo ? <p style={CHAPO}>{chapo}</p> : null}
          {pastilles.length ? (
            <ul style={PASTILLES}>
              {pastilles.map((pastille) => (
                <li key={pastille} style={PASTILLE_COCHEE}>
                  <span aria-hidden="true" style={COCHE}>
                    ✓
                  </span>
                  {pastille}
                </li>
              ))}
            </ul>
          ) : null}
          {points.length ? (
            <ul style={POINTS}>
              {points.map((point) => (
                <li key={point} style={POINT}>
                  <span aria-hidden="true" style={COCHE}>
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          {chiffres.length ? (
            <div className={styles.chiffresHeros} style={CHIFFRES}>
              {chiffres.map((chiffre) => (
                <div key={chiffre.l}>
                  <div style={VALEUR}>{chiffre.v}</div>
                  <div style={LIBELLE}>{chiffre.l}</div>
                </div>
              ))}
            </div>
          ) : null}
          {actions}
        </div>
        {carte}
      </div>
    </section>
  );
}

/* Les deux boutons de la maquette, orange plein et verre sur fond sombre. */
export const BOUTON_HEROS: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "14px 22px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 15px var(--fb)",
};

export const BOUTON_VERRE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "14px 22px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.22)",
  background: "rgba(255,255,255,.1)",
  color: "#fff",
  font: "600 15px var(--fb)",
};
