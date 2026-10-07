import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { LienPageLiee } from "@/types/offre";

import { cibleSure } from "./LiensOffre";

import styles from "./PageOffre.module.css";

/**
 * Section « Maillage » du gabarit 03, relevée dans
 * `maquette/rendu/offres--depannage-industriel--panne-machine.html`
 * (section 16) : surtitre « Pour aller plus loin », H2 « Les pages qui
 * complètent celle-ci », le compte des pages à droite, puis une grande carte
 * photo (surtitre « À lire ensuite », titre, phrase, « Ouvrir la page → ») et,
 * dans la colonne de droite, les autres pages en rangées à vignette.
 *
 * CE N'EST PAS `MaillageOffres`. Les deux sont le bloc de maillage du gabarit,
 * mais la maquette en rend DEUX modèles et jamais les deux ensemble : le bento
 * « Un autre besoin ? Il a son offre. » sur les 6 offres nommées, celui-ci sur
 * les pages de second niveau. Relevé le 07/10 sur les 210 captures du dépôt :
 * 6 portent le bento, 19 portent celui-ci. `PageOffre` choisit par la donnée,
 * `pagesLiees` ici et `autres` pour le bento, et une page qui ne déclare ni
 * l'un ni l'autre ne rend aucun des deux.
 *
 * UNE CIBLE REFUSÉE FAIT DISPARAÎTRE LA CARTE, même règle que `LiensOffre` :
 * un chemin lu dans un `jsonb` est une chaîne comme une autre.
 */

export interface ProprietesPagesLiees {
  pages: LienPageLiee[];
}

const ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 24,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "24ch",
  textWrap: "balance",
};

/* La capture écrit `color:var(--ink3)`, soit 4,23:1 sur le fond crème, sous le
   seuil de 4,5:1 de la WCAG 1.4.3. `--ink2` donne 5,02:1 et c'est l'encre
   grise que la charte porte déjà, même arbitrage que `cocon/ListeMaillage`. */
const COMPTE: CSSProperties = {
  font: "500 13.5px var(--fb)",
  color: "var(--ink2)",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
  gap: 14,
  alignItems: "stretch",
};

const CARTE_PHARE: CSSProperties = {
  position: "relative",
  display: "block",
  minHeight: 380,
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "#1c1b19",
  color: "#fff",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.45)",
  transition: "transform var(--tr)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top,rgba(18,17,16,.94) 0%,rgba(18,17,16,.4) 55%,rgba(18,17,16,.1) 100%)",
};

const PHARE_CONTENU: CSSProperties = {
  position: "absolute",
  left: 28,
  right: 28,
  bottom: 26,
};

const PHARE_SURTITRE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".13em",
  textTransform: "uppercase",
  color: "#ff7c3c",
  marginBottom: 10,
};

const PHARE_TITRE: CSSProperties = {
  font: "600 calc(clamp(22px,2.2vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.03em",
  marginBottom: 10,
};

const PHARE_PHRASE: CSSProperties = {
  font: "400 14.5px/1.55 var(--fb)",
  color: "rgba(255,255,255,.76)",
  marginBottom: 14,
  maxWidth: "48ch",
};

const RANGEE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "64px minmax(0,1fr) 34px",
  gap: 16,
  alignItems: "center",
  padding: "12px 14px 12px 12px",
  borderRadius: 18,
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  color: "var(--ink)",
  transition: "transform var(--tr),border-color var(--tr)",
};

const VIGNETTE: CSSProperties = {
  position: "relative",
  width: 64,
  height: 64,
  borderRadius: 12,
  overflow: "hidden",
  background: "var(--ph)",
  flex: "0 0 auto",
};

const RANGEE_TITRE: CSSProperties = {
  font: "600 16px/1.3 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

const RANGEE_PHRASE: CSSProperties = {
  font: "400 13.5px/1.45 var(--fb)",
  color: "var(--ink2)",
  marginTop: 3,
};

const FLECHE: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "var(--acc-w)",
  color: "var(--acc)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  font: "600 15px var(--fb)",
};

export default function PagesLiees({ pages }: ProprietesPagesLiees) {
  const retenues = pages.filter((page) => cibleSure(page.href));
  if (retenues.length === 0) return null;

  const [phare, ...suite] = retenues;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 14 }}>
              Pour aller plus loin
            </div>
            <h2 style={TITRE}>Les pages qui complètent celle-ci</h2>
          </div>
          <span style={COMPTE}>{retenues.length} pages liées</span>
        </div>

        <div className="mg-r2" style={GRILLE}>
          <Link
            href={phare.href}
            prefetch={false}
            className={styles.carteMaillage}
            style={CARTE_PHARE}
          >
            {/* SANS PHOTO, LE CADRE RESTE NU, et c'est la capture qui le dit :
                sur `/travaux-industriels/levage-manutention/` la maquette rend
                ici un `<div role="img" aria-label="Illustration">` vide, pas
                une image. Coller une photo de la photothèque sous le titre
                d'une autre page serait une association inventée (CLAUDE.md
                §13). Les pages dont la capture nomme une photo la déclarent et
                rendent comme avant. */}
            {phare.photo ? (
              <Image
                src={phare.photo}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 580px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) brightness(.7)",
                }}
              />
            ) : null}
            <div aria-hidden="true" style={VOILE} />
            <div style={PHARE_CONTENU}>
              <div style={PHARE_SURTITRE}>À lire ensuite</div>
              <div style={PHARE_TITRE}>{phare.titre}</div>
              <div style={PHARE_PHRASE}>{phare.phrase}</div>
              <span style={{ font: "600 14px var(--fb)", color: "#ff7c3c" }}>
                Ouvrir la page →
              </span>
            </div>
          </Link>

          <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
            {suite.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                prefetch={false}
                className={styles.carteMaillage}
                style={RANGEE}
              >
                <span style={VIGNETTE}>
                  {page.photo ? (
                    <Image
                      src={page.photo}
                      alt=""
                      fill
                      sizes="64px"
                      style={{
                        objectFit: "cover",
                        filter: "saturate(var(--sat))",
                      }}
                    />
                  ) : null}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ ...RANGEE_TITRE, display: "block" }}>
                    {page.titre}
                  </span>
                  <span style={{ ...RANGEE_PHRASE, display: "block" }}>
                    {page.phrase}
                  </span>
                </span>
                {/* Masquée aux technologies d'assistance : le nom du lien est
                    le titre de la page, la flèche n'y ajoute rien. */}
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
