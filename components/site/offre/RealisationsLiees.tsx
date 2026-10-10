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
   * Le surtitre de la carte MISE EN AVANT, à la place du nom du client :
   * « À la une · Savoye, Norvège ». AJOUTÉ LE 07/10, et trois captures le
   * demandent : `/travaux-industriels/` (bloc « Réalisations liées », carte
   * SAVOYE), `/travaux-industriels/demantelement-industriel/` (carte large,
   * bloc 1261) et `/offres/chantier/demenagement-machines/`. Absent, la carte
   * reste une carte de grille et aucune page déjà portée ne bouge.
   */
  aLaUne?: string;
  /** Le paragraphe de la carte mise en avant, sous son titre. */
  resume?: string;
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
  /* Sur le fond crème de la section : 2,29:1 en `--acc`, 7,98:1 en `--acc-ink`. */
  color: "var(--acc-ink)",
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

/* La carte mise en avant, relevée sur le bloc 1261 de
   `maquette/rendu/offres--chantier--demenagement-machines.html`. */
const CARTE_UNE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
  marginBottom: 14,
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "#1c1b19",
  color: "#fff",
  boxShadow: "0 30px 60px -36px rgba(0,0,0,.5)",
};

const ETIQUETTE_UNE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  alignSelf: "flex-start",
  padding: "6px 12px",
  borderRadius: 999,
  background: "rgba(255,124,60,.16)",
  color: "#ff7c3c",
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
};

const TITRE_UNE: CSSProperties = {
  font: "600 clamp(22px,2.4vw,32px)/1.12 var(--ft)",
  letterSpacing: "-.035em",
  textWrap: "balance",
};

export default function RealisationsLiees({ cas }: ProprietesRealisationsLiees) {
  const retenus = cas.filter((c) => estCheminInterne(c.url));
  if (retenus.length === 0) return null;

  /* La capture met en avant le PREMIER cas quand il porte son surtitre.
     Sans ce champ, la section reste la grille seule des pages déjà portées. */
  const une = retenus[0].aLaUne ? retenus[0] : undefined;
  const grille = une ? retenus.slice(1) : retenus;

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
        {une ? (
          <Link
            href={une.url}
            prefetch={false}
            className={`mg-r2 ${styles.carteMaillage}`}
            style={CARTE_UNE}
          >
            <div
              style={{
                padding: "36px 40px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <span style={ETIQUETTE_UNE}>{une.aLaUne}</span>
              <div style={TITRE_UNE}>{une.titre}</div>
              {une.resume ? (
                <p
                  style={{
                    margin: 0,
                    font: "400 15.5px/1.6 var(--fb)",
                    color: "rgba(255,255,255,.72)",
                    maxWidth: "52ch",
                  }}
                >
                  {une.resume}
                </p>
              ) : null}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                  font: "600 14.5px var(--fb)",
                  color: "#ff7c3c",
                }}
              >
                Lire l’étude de cas <span aria-hidden="true">→</span>
              </span>
            </div>
            <div style={{ position: "relative", minHeight: 260 }}>
              <Image
                src={une.photo}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 520px"
                style={{ objectFit: "cover", filter: "saturate(var(--sat))" }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg,#1c1b19 0%,rgba(28,27,25,0) 40%)",
                }}
              />
            </div>
          </Link>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
            gap: 12,
          }}
        >
          {grille.map((casLie) => (
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
                {/* Nom du client sur la carte en verre : 2,45:1 en `--acc`,
                    8,57:1 en `--acc-ink`. */}
                <span
                  style={{ font: "600 13px var(--fb)", color: "var(--acc-ink)" }}
                >
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
                  {/* 2,45:1 en `--acc` sur le verre de la carte, 8,57:1 en
                      `--acc-ink`. */}
                  <span aria-hidden="true" style={{ color: "var(--acc-ink)" }}>
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
