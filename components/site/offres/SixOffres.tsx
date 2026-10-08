import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import { cibleSure } from "@/components/site/offre/LiensOffre";
import type { CarteMaillageOffres } from "@/types/offres";

import styles from "./PageOffres.module.css";

/**
 * « Maillage · offres » de la capture `maquette/rendu/offres.html` (blocs 1127
 * à 1140) : « Nos offres », « Six offres, un seul interlocuteur. », six cartes
 * à photo en bento 3 x 2 (`g3-bento5`).
 *
 * Même dessin que `offre/MaillageOffres` et `implantation/MaillageVille`, mais
 * aucun des deux ne se paramètre : le premier écrit en dur « Un autre besoin ?
 * Il a son offre. » et pose ses titres à 18px (la capture : 20px), le second
 * écrit en dur « Les six offres, dans chaque bassin. ». Les cartes, elles,
 * viennent de la donnée de la page, copiées de la capture.
 */

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 26px",
  maxWidth: "24ch",
  textWrap: "balance",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gridTemplateRows: "repeat(2,minmax(210px,auto))",
  gap: 12,
};

const CARTE: CSSProperties = {
  position: "relative",
  display: "block",
  overflow: "hidden",
  borderRadius: 24,
  color: "#fff",
  minHeight: 210,
  background: "rgb(58,58,60)",
  transition: "transform var(--tr)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top,rgba(18,17,16,.92) 0%,rgba(18,17,16,.35) 60%,rgba(18,17,16,.1))",
};

const CONTENU: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  gap: 8,
  height: "100%",
  padding: 22,
};

export interface ProprietesSixOffres {
  surtitre?: string;
  titre: string;
  cartes: CarteMaillageOffres[];
}

export default function SixOffres({ surtitre, titre, cartes }: ProprietesSixOffres) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        {surtitre ? (
          <div style={{ ...SURTITRE, marginBottom: 14 }}>{surtitre}</div>
        ) : null}
        <h2 style={TITRE}>{titre}</h2>
        <div className={styles.bento} style={GRILLE}>
          {cartes.filter((carte) => cibleSure(carte.href)).map((carte) => (
            <Link
              key={carte.href}
              href={carte.href}
              prefetch={false}
              className={styles.carte}
              style={CARTE}
            >
              <Image
                src={carte.photo}
                alt=""
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) brightness(.72)",
                }}
              />
              <div aria-hidden="true" style={VOILE} />
              <div style={CONTENU}>
                <span
                  style={{
                    font: "600 10.5px var(--fb)",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                  }}
                >
                  {carte.etiquette}
                </span>
                <span
                  style={{
                    font: "600 20px/1.2 var(--ft)",
                    letterSpacing: "-.03em",
                    color: "#fff",
                  }}
                >
                  {carte.titre}
                </span>
                <span
                  style={{
                    font: "400 13.5px/1.5 var(--fb)",
                    color: "rgba(255,255,255,.74)",
                    maxWidth: "44ch",
                  }}
                >
                  {carte.phrase}
                </span>
                <span style={{ marginTop: 6, font: "600 13px var(--fb)", color: "#fff" }}>
                  Voir l’offre →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
