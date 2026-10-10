"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, type CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { CarteCatalogue, VueRubrique } from "@/types/editorial";

import styles from "./PageEditoriale.module.css";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * Héros et rayons d'une sous-rubrique, `MigenRessource.dc.html` (sections
 * « Ressources · héros » et « Ressources · rayons »), en un composant CLIENT
 * parce qu'ils partagent l'état de la maquette : le filtre par rayon (les
 * pastilles) et la recherche du héros, qui filtrent tout le catalogue.
 *
 * La logique de tri et de découpe est celle de la maquette (`renderVals`) :
 * les fiches les plus longues d'abord, la première à la une, les deux
 * suivantes à côté, le reste en grille ; une recherche met tout en grille.
 * Le premier rendu, celui du serveur, est celui de la capture.
 */

const rayonDe = (c: CarteCatalogue) => c.href.split("/")[2];

const ETIQUETTE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

function Filtre({
  libelle,
  nombre,
  actif,
  choisit,
}: {
  libelle: string;
  nombre: number;
  actif: boolean;
  choisit: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={choisit}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 999,
        cursor: "pointer",
        font: "600 13.5px var(--fb)",
        whiteSpace: "nowrap",
        border: `1px solid ${actif ? "var(--ink)" : "var(--line)"}`,
        background: actif ? "var(--ink)" : "#fff",
        color: actif ? "#fff" : "var(--ink1)",
      }}
    >
      {libelle}
      <span
        style={{
          font: "600 11px ui-monospace,Menlo,monospace",
          color: actif ? "var(--acc)" : "var(--ink4)",
        }}
      >
        {nombre}
      </span>
    </button>
  );
}

export default function RayonsRubrique({ titre, vue }: { titre: string; vue: VueRubrique }) {
  const [rayon, setRayon] = useState(vue.rayon);
  const [recherche, setRecherche] = useState("");

  const q = recherche.toLowerCase().trim();
  const parRayon =
    rayon === "tout" ? vue.catalogue : vue.catalogue.filter((c) => rayonDe(c) === rayon);
  const liste = q
    ? parRayon.filter((c) => `${c.titre} ${c.recherche}`.toLowerCase().includes(q))
    : parRayon;
  const tri = [...liste].sort((a, b) => b.mots - a.mots);
  const une = q ? undefined : tri[0];
  const cote = q ? [] : tri.slice(1, 3);
  const grille = q ? tri : tri.slice(3);

  return (
    <>
      <section
        data-screen-label="Ressources · héros"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 0" }}
      >
        <nav
          aria-label="Fil d'Ariane"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            font: "400 13px var(--fb)",
            color: "var(--ink4)",
            flexWrap: "wrap",
            marginBottom: 26,
          }}
        >
          {vue.ariane.map((maillon) => (
            <Fragment key={maillon.href}>
              <Link href={maillon.href} prefetch={false} style={{ color: "var(--ink4)" }}>
                {maillon.label}
              </Link>
              <span aria-hidden="true">/</span>
            </Fragment>
          ))}
          <span aria-current="page" style={{ color: "var(--ink1)" }}>
            {vue.court}
          </span>
        </nav>
        <div
          className={styles.grille2}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
            gap: 52,
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid var(--line)",
                font: "600 12px var(--fb)",
                color: "var(--ink1)",
                marginBottom: 22,
              }}
            >
              <span
                aria-hidden="true"
                style={{ width: 6, height: 6, borderRadius: 999, background: "var(--acc)" }}
              />
              {vue.court}
            </span>
            <h1
              style={{
                font: "600 clamp(36px,4.4vw,60px)/1.04 var(--ft)",
                letterSpacing: "-.045em",
                margin: "0 0 20px",
                maxWidth: "18ch",
                textWrap: "balance",
              }}
            >
              {titre}
            </h1>
            {vue.chapo.map((paragraphe) => (
              <p
                key={paragraphe.slice(0, 24)}
                className={styles.chapo}
                style={{
                  font: "400 18px/1.62 var(--fb)",
                  color: "var(--ink1)",
                  margin: "0 0 14px",
                  maxWidth: "56ch",
                  textWrap: "pretty",
                }}
              >
                <TexteRiche texte={paragraphe} />
              </p>
            ))}
            <div
              className={styles.recherche}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 22,
                padding: "6px 6px 6px 20px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid var(--line)",
                maxWidth: 520,
              }}
            >
              <span aria-hidden="true" style={{ color: "var(--ink4)", font: "400 15px var(--fb)" }}>
                ⚲
              </span>
              <input
                type="search"
                aria-label="Rechercher dans les ressources"
                placeholder="Rechercher un article, une fiche…"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                /* 16 px sous 880 px, sinon Safari iOS zoome : voir
                   `.champRecherche` dans PageEditoriale.module.css. */
                className={styles.champRecherche}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  /* La police vit dans `.champRecherche` et non ici : un
                     raccourci `font` en ligne bat la classe, et la règle qui
                     passe le champ à 16 px sous 880 px ne mordrait sur rien. */
                  color: "var(--ink)",
                  padding: "10px 0",
                }}
              />
              <span
                aria-live="polite"
                style={{
                  font: "600 12px var(--fb)",
                  color: "var(--ink4)",
                  paddingRight: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {liste.length} ressources
              </span>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              borderRadius: 32,
              overflow: "hidden",
              height: 380,
              background: "var(--ph)",
            }}
          >
            <Image
              src={vue.image}
              alt={altPhoto(vue.image)}
              fill
              priority
              sizes="(max-width: 980px) 100vw, 500px"
              style={{ objectFit: "cover", filter: "saturate(var(--sat,.55)) contrast(1.05)" }}
            />
            <div
              style={{
                position: "absolute",
                left: 18,
                right: 18,
                bottom: 18,
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 8,
              }}
            >
              {vue.chiffres.map((c) => (
                <div
                  key={c.libelle}
                  style={{
                    background: "rgba(255,255,255,.88)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div style={{ font: "600 22px var(--ft)", letterSpacing: "-.04em" }}>{c.valeur}</div>
                  <div style={{ font: "400 12px var(--fb)", color: "var(--ink2)", marginTop: 3 }}>
                    {c.libelle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-screen-label="Ressources · rayons"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 40px 0" }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
          {vue.categories.map((c) => (
            <Filtre
              key={c.rayon}
              libelle={c.libelle}
              nombre={
                c.rayon === "tout"
                  ? vue.catalogue.length
                  : vue.catalogue.filter((x) => rayonDe(x) === c.rayon).length
              }
              actif={rayon === c.rayon}
              choisit={() => setRayon(c.rayon)}
            />
          ))}
        </div>
        {une ? (
          <div
            className={styles.une}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <Link
              href={une.href}
              prefetch={false}
              style={{
                position: "relative",
                display: "block",
                borderRadius: "var(--rad)",
                overflow: "hidden",
                minHeight: 400,
                background: "var(--panel)",
              }}
            >
              <Image
                src={une.image}
                alt={altPhoto(une.image)}
                fill
                sizes="(max-width: 980px) 100vw, 640px"
                style={{
                  objectFit: "cover",
                  /* La une, cadre 635x400, ratio 1,59. */
                  objectPosition: cadragePhoto(une.image, 635 / 400),
                  filter: "saturate(var(--sat,.55)) brightness(.62)",
                }}
              />
              <div style={{ position: "absolute", left: 30, right: 30, bottom: 28 }}>
                <span
                  style={{
                    ...ETIQUETTE,
                    display: "inline-block",
                    color: "#fff",
                    background: "var(--acc)",
                    padding: "5px 11px",
                    borderRadius: 999,
                    marginBottom: 14,
                  }}
                >
                  {une.format} · {une.minutes} min
                </span>
                <div
                  style={{
                    font: "600 clamp(22px,2.4vw,32px)/1.15 var(--ft)",
                    letterSpacing: "-.035em",
                    color: "#fff",
                    maxWidth: "22ch",
                  }}
                >
                  {une.titre}
                </div>
              </div>
            </Link>
            <div style={{ display: "grid", gap: 14 }}>
              {cote.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  prefetch={false}
                  className={styles.carteCote}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px minmax(0,1fr)",
                    gap: 16,
                    alignItems: "center",
                    borderRadius: "var(--rad)",
                    background: "#fff",
                    border: "1px solid var(--line)",
                    padding: 12,
                    transition: "transform .2s",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: 120,
                      borderRadius: 18,
                      overflow: "hidden",
                      background: "var(--ph)",
                    }}
                  >
                    <Image
                      src={c.image}
                      alt={altPhoto(c.image)}
                      fill
                      sizes="140px"
                      style={{ objectFit: "cover", filter: "saturate(var(--sat,.55))" }}
                    />
                  </div>
                  <div>
                    <div style={{ ...ETIQUETTE, marginBottom: 8 }}>
                      {c.format} · {c.minutes} min
                    </div>
                    <div style={{ font: "600 17px/1.3 var(--ft)", letterSpacing: "-.02em" }}>{c.titre}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
            gap: 14,
          }}
        >
          {grille.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              prefetch={false}
              className={styles.carteGrille}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "var(--rad)",
                overflow: "hidden",
                background: "#fff",
                border: "1px solid var(--line)",
                transition: "transform .2s,box-shadow .2s",
              }}
            >
              <div style={{ position: "relative", height: 160, background: "var(--ph)", overflow: "hidden" }}>
                <Image
                  src={c.image}
                  alt={altPhoto(c.image)}
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  style={{
                    objectFit: "cover",
                    /* Cadre 364x160, ratio 2,27. */
                    objectPosition: cadragePhoto(c.image, 364 / 160),
                    filter: "saturate(var(--sat,.55))",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "18px 20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: 1,
                }}
              >
                <span style={ETIQUETTE}>{c.format}</span>
                <span style={{ font: "600 16.5px/1.3 var(--ft)", letterSpacing: "-.02em" }}>{c.titre}</span>
                <span
                  style={{
                    marginTop: "auto",
                    paddingTop: 12,
                    borderTop: "1px solid var(--line)",
                    font: "500 12.5px var(--fb)",
                    color: "var(--ink3)",
                  }}
                >
                  {c.minutes} min de lecture
                </span>
              </div>
            </Link>
          ))}
        </div>
        {liste.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", font: "400 15px var(--fb)", color: "var(--ink3)" }}>
            Aucune ressource ne correspond à votre recherche.
          </div>
        ) : null}
      </section>
    </>
  );
}
