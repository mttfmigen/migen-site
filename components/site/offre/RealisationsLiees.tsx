import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import { estCheminInterne } from "@/components/site/blocs/TexteRiche";

import styles from "./PageOffre.module.css";

/**
 * Section « Réalisations liées » de la capture
 * (`maquette/rendu/offres--residence.html`) : surtitre « Nos réalisations »,
 * H2 « Ils nous ont confié une mission comparable », lien « Toutes les études
 * de cas → », puis les cartes des cas liés à la page : photo, client, phrase,
 * « Lire l'étude de cas → ».
 *
 * LA DONNÉE vient du relais JSON de la page (`casLies`), qui reprend la liste
 * de `maquette/contenu/site/cas-lies.json` pour cette URL : rien ne s'invente,
 * une page sans cas liés ne rend pas la section.
 */

export interface CasLie {
  url: string;
  client: string;
  titre: string;
  /**
   * La photo de la carte, dans `public/assets/web/`. OBLIGATOIRE : associer
   * une photo générique à une étude de cas qui n'en déclare pas serait une
   * association inventée. Un cas sans photo est une erreur de donnée, et elle
   * se voit au build plutôt qu'en silence.
   */
  photo: string;
}

export interface ProprietesRealisationsLiees {
  cas: CasLie[];
}

const ENTETE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 26,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "24ch",
  textWrap: "balance",
};

const LIEN_TOUTES: CSSProperties = {
  font: "600 14.5px var(--fb)",
  color: "var(--acc)",
  whiteSpace: "nowrap",
};

const CARTE: CSSProperties = {
  ...VERRE,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

const CADRE_PHOTO: CSSProperties = {
  height: 150,
  background: "var(--ph)",
  overflow: "hidden",
  position: "relative",
};

const PIED: CSSProperties = {
  marginTop: "auto",
  paddingTop: 12,
  borderTop: "1px solid var(--line)",
  font: "600 13px var(--fb)",
  color: "var(--ink)",
};

export default function RealisationsLiees({ cas }: ProprietesRealisationsLiees) {
  const retenus = cas.filter((c) => estCheminInterne(c.url));
  if (retenus.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 14 }}>
              Nos réalisations
            </div>
            <h2 style={TITRE}>Ils nous ont confié une mission comparable</h2>
          </div>
          <Link href="/preuves/" prefetch={false} style={LIEN_TOUTES}>
            Toutes les études de cas →
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
            gap: 12,
          }}
        >
          {retenus.map((casLie) => (
            <Link
              key={casLie.url}
              href={casLie.url}
              prefetch={false}
              className={styles.carteReference}
              style={CARTE}
            >
              <div style={CADRE_PHOTO}>
                <Image
                  src={casLie.photo}
                  alt=""
                  fill
                  sizes="(max-width: 620px) 100vw, 300px"
                  style={{
                    objectFit: "cover",
                    filter: "saturate(var(--sat)) contrast(1.05)",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "18px 20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: "1 1 0%",
                }}
              >
                <span style={{ font: "600 13px var(--fb)", color: "var(--acc)" }}>
                  {casLie.client}
                </span>
                <span
                  style={{
                    font: "600 16px/1.35 var(--ft)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                  }}
                >
                  {casLie.titre}
                </span>
                <span style={PIED}>
                  Lire l’étude de cas{" "}
                  <span aria-hidden="true" style={{ color: "var(--acc)" }}>
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
