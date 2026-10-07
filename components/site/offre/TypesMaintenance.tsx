import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type { CarteTypeMaintenance } from "@/types/offre";

import { numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * Écran « 02 Types de maintenance » de la maquette, porté le 07/10 depuis
 * `maquette/rendu/offres--full-service.html` (bloc 346, section 6 des 21).
 *
 * POURQUOI IL N'EXISTAIT PAS. La page pilote validée le 06/10
 * (`/offres/residence/`, 17 sections) ne l'a pas. La maquette le pose entre la
 * première bande d'appel et la problématique, sur les pages dont l'offre
 * couvre plusieurs natures de maintenance : surtitre « Types de maintenance »,
 * un H2, puis quatre cartes-photos numérotées qui mènent aux pages
 * d'expertise.
 *
 * MODIFICATION D'UN COMPOSANT PARTAGÉ PAR LES 22 PAGES : ajout seul, aucune
 * retouche des composants existants. Sans `typesMaintenance`, `PageOffre` ne
 * le monte pas, donc les 21 autres pages ne bougent pas.
 *
 * LE SURTITRE EST FIXE, comme ceux de `ProblemeOffre` et de `PointsOffre`.
 * LE LIBELLÉ DU LIEN aussi : la capture écrit « Découvrir → ». C'est bien
 * l'infinitif, pas l'impératif « découvrez » que le contrat proscrit
 * (CLAUDE.md §9) ; `scripts/verifie-interdits.mjs` ne vise que « découvrez ».
 *
 * UNE CIBLE QUI N'EST PAS UN CHEMIN INTERNE FAIT DISPARAÎTRE LA CARTE, elle
 * n'est pas rafistolée vers une cible de repli : même règle que `LiensOffre`.
 */

export interface ProprietesTypesMaintenance {
  titre: string;
  cartes: readonly CarteTypeMaintenance[];
}

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "22ch",
  textWrap: "balance",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
  gap: 12,
};

const CARTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: 24,
  overflow: "hidden",
  background: "var(--card)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

const CADRE_PHOTO: CSSProperties = {
  position: "relative",
  height: 150,
  overflow: "hidden",
  background: "var(--ph)",
};

const NUMERO: CSSProperties = {
  position: "absolute",
  left: 16,
  top: 14,
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "#fff",
  background: "rgba(18,17,16,.55)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  padding: "4px 9px",
  borderRadius: 999,
};

const CORPS: CSSProperties = {
  padding: "20px 22px 22px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: "1 1 0%",
};

const TITRE_CARTE: CSSProperties = {
  font: "600 calc(20px * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.03em",
  margin: 0,
};

const PHRASE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

const LIEN: CSSProperties = {
  marginTop: "auto",
  paddingTop: 6,
  font: "600 13.5px var(--fb)",
  color: "var(--acc)",
};

export default function TypesMaintenance({
  titre,
  cartes,
}: ProprietesTypesMaintenance) {
  const retenues = cartes.filter(
    (carte) => !!carte.titre && estCheminInterne(carte.href),
  );
  if (retenues.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ marginBottom: 30 }}>
          <div style={{ ...SURTITRE, marginBottom: 16 }}>
            Types de maintenance
          </div>
          <h2 style={TITRE}>{titre}</h2>
        </div>
        <div className="mg-rmulti" style={GRILLE}>
          {retenues.map((carte, rang) => (
            <Link
              key={carte.href}
              href={carte.href}
              prefetch={false}
              className={styles.carteReference}
              style={CARTE}
            >
              <div style={CADRE_PHOTO}>
                <Image
                  src={carte.photo}
                  alt=""
                  fill
                  sizes="(max-width: 620px) 100vw, 280px"
                  style={{
                    objectFit: "cover",
                    filter: "saturate(var(--sat)) contrast(1.05)",
                  }}
                />
                <span style={NUMERO}>{numerote(rang)}</span>
              </div>
              <div style={CORPS}>
                <h3 style={TITRE_CARTE}>{carte.titre}</h3>
                {carte.phrase ? <p style={PHRASE}>{carte.phrase}</p> : null}
                <span style={LIEN}>Découvrir →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
