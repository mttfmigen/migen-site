import Link from "next/link";
import type { CSSProperties } from "react";

import {
  LARGEUR,
  SECTION,
  SURTITRE,
  VERRE,
} from "@/components/site/blocs/habillage";
import { cibleSure } from "@/components/site/offre/LiensOffre";
import type { LienOffre } from "@/types/offre";
import type { ApprocheOffres } from "@/types/offres";

import styles from "./PageOffres.module.css";

/**
 * « Offres · Deux approches » de la capture `maquette/rendu/offres.html`
 * (blocs 1050 à 1096) : surtitre, H2, puis deux colonnes égales, la première
 * en verre, la seconde en panneau anthracite à lueur orange. Chaque colonne :
 * surtitre, titre, phrase, quatre puces cochées, bouton orange fléché.
 */

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,44px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.045em",
  margin: "0 0 28px",
  color: "var(--sur-acc)",
  textWrap: "balance",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 16,
};

/** Les rangées de la colonne : le bouton descend dans la dernière, en `1fr`. */
const RANGEES: CSSProperties = {
  display: "grid",
  gridTemplateRows: "auto auto auto auto 1fr",
  alignContent: "start",
};

const CLAIRE: CSSProperties = {
  ...VERRE,
  ...RANGEES,
  padding: "34px 34px 30px",
};

const SOMBRE: CSSProperties = {
  borderRadius: "var(--rad)",
  background: "var(--panel)",
  padding: "34px 34px 30px",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
};

const LUEUR: CSSProperties = {
  position: "absolute",
  width: 380,
  height: 380,
  right: -160,
  top: -180,
  background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 68%)",
  pointerEvents: "none",
};

/* La coche est posée sur les DEUX colonnes : la claire (verre) et la sombre
   (anthracite). Sur la claire l'orange de marque donne 2,13:1, `--acc-ink`
   donne 7,2:1 ; sur la sombre l'orange donne 5,2:1 et reste donc en place.
   `DeuxApproches` choisit selon la colonne. */
const COCHE: CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "rgba(255,124,60,.16)",
  color: "var(--acc-ink)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  font: "700 12px var(--fb)",
  marginTop: 1,
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "14px 22px",
  borderRadius: 999,
  background: "rgb(255,124,60)",
  /* `#fff` donnait 2,56:1 sur l'orange, `--ink` donne 6,72:1. */
  color: "var(--ink)",
  font: "600 14.5px var(--fb)",
  boxShadow: "rgba(255,124,60,.7) 0 10px 24px -12px",
  transition: "background-color var(--tr)",
};

/** Le bouton orange fléché des deux écrans du hub (survol `scp16`). */
export function BoutonFleche({ lien }: { lien: LienOffre }) {
  // Une cible hors domaine fait disparaître le bouton (règle de `LiensOffre`).
  if (!cibleSure(lien.href)) return null;
  return (
    <Link
      href={lien.href}
      prefetch={false}
      className={styles.bouton}
      style={BOUTON}
    >
      {lien.libelle}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

function Colonne({ approche, sombre }: { approche: ApprocheOffres; sombre: boolean }) {
  const encre = sombre ? "#fff" : "var(--ink)";
  return (
    <>
      <div
        style={{
          font: "600 11px var(--fb)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: sombre ? "rgb(255,124,60)" : "var(--ink3)",
          marginBottom: 12,
        }}
      >
        {approche.surtitre}
      </div>
      <div
        style={{
          font: "600 24px/1.2 var(--ft)",
          letterSpacing: "-.03em",
          color: encre,
          marginBottom: 12,
        }}
      >
        {approche.titre}
      </div>
      <p
        style={{
          font: "500 15px/1.6 var(--fb)",
          color: sombre ? "rgba(255,255,255,.86)" : "var(--ink)",
          margin: "0 0 20px",
        }}
      >
        {approche.texte}
      </p>
      <ul
        style={{
          listStyle: "none",
          margin: "0 0 26px",
          padding: 0,
          display: "grid",
          gap: 12,
        }}
      >
        {approche.puces.map((puce) => (
          <li
            key={puce}
            style={{
              display: "grid",
              gridTemplateColumns: "22px minmax(0,1fr)",
              gap: 10,
              alignItems: "start",
              font: "400 15.5px/1.55 var(--fb)",
              color: sombre ? "rgba(255,255,255,.82)" : "var(--ink1)",
            }}
          >
            <span
              aria-hidden="true"
              style={sombre ? { ...COCHE, color: "var(--acc)" } : COCHE}
            >
              ✓
            </span>
            <span>{puce}</span>
          </li>
        ))}
      </ul>
      <div style={{ alignSelf: "end" }}>
        <BoutonFleche lien={approche.bouton} />
      </div>
    </>
  );
}

export interface ProprietesDeuxApproches {
  surtitre: string;
  titre: string;
  cartes: ApprocheOffres[];
}

export default function DeuxApproches({
  surtitre,
  titre,
  cartes,
}: ProprietesDeuxApproches) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ ...SURTITRE, marginBottom: 14 }}>{surtitre}</div>
        <h2 style={TITRE}>{titre}</h2>
        <div className="mg-r2" style={GRILLE}>
          {cartes.map((approche, rang) =>
            // La capture pose la SECONDE colonne en panneau anthracite.
            rang === 1 ? (
              <div key={approche.titre} style={SOMBRE}>
                <div aria-hidden="true" style={LUEUR} />
                <div style={{ ...RANGEES, position: "relative", height: "100%" }}>
                  <Colonne approche={approche} sombre />
                </div>
              </div>
            ) : (
              <div key={approche.titre} style={CLAIRE}>
                <Colonne approche={approche} sombre={false} />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
