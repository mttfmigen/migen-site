import Image from "next/image";
import type { ReactNode } from "react";

import { TELEPHONE_LP } from "@/components/site/entete-donnees";
import type { SectionLP } from "@/lib/lp/pages";

import { BOUTON_ORANGE, CADRE, Chapo, Coche, type Contexte, Photo, SurTitre, Titre2, numero, sectionStyle } from "./atomes-lp";
import { CarrouselLP } from "./CarrouselLP";
import styles from "./PageLP.module.css";

/**
 * Les sections « à en-tête » de `MigenLP` (maquette V3) : sur-titre, titre et
 * bouton au-dessus d'une grille de cartes (expertises, savoir-faire, offres,
 * méthode, témoignages).
 */

/* ------------------------------------------------------------ en-tête */

function EnteteSection({ s, cta }: { s: SectionLP; cta: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "18px 40px",
        marginBottom: 36,
      }}
    >
      <div style={{ maxWidth: 740 }}>
        {s.kick ? <SurTitre>{s.kick}</SurTitre> : null}
        <Titre2 taille={40}>{s.h2}</Titre2>
        {s.lead ? <Chapo marge={14} style={{ fontSize: 16.5 }}>{s.lead}</Chapo> : null}
      </div>
      {cta && s.cta ? (
        <a href="#lp-contact" className={styles.orange} style={{ ...BOUTON_ORANGE, whiteSpace: "nowrap" }}>
          {s.cta} →
        </a>
      ) : null}
    </div>
  );
}

export function SectionStandard({ s, id, ctx, children }: { s: SectionLP; id: string; ctx: Contexte; children: ReactNode }) {
  return (
    <section id={id} className={styles.sec} style={sectionStyle(ctx.fond)}>
      <div className={styles.pad} style={CADRE}>
        <EnteteSection s={s} cta />
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- corps */

export function Expertises({ s, ctx }: { s: SectionLP; ctx: Contexte }) {
  const n = s.items.length % 4;
  return (
    <div
      className={styles.g4}
      style={{
        display: "grid",
        gridTemplateColumns: s.img ? "repeat(4,minmax(0,1fr))" : "repeat(auto-fit,minmax(240px,1fr))",
        gap: 12,
      }}
    >
      {s.img ? (
        <Photo
          src={s.img}
          tailles="(max-width: 760px) 100vw, 600px"
          className={styles.photo}
          style={{
            gridColumn: ["span 2", "span 3", "span 1", "span 1"][n],
            gridRow: ["span 2", "span 1", "span 2", "span 1"][n],
            minHeight: 260,
            borderRadius: 22,
          }}
        />
      ) : null}
      {s.items.map((item, j) => (
        <div
          key={item.h}
          style={{
            padding: 22,
            borderRadius: 22,
            background: ctx.carte,
            border: "1px solid #ecebe8",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(255,124,60,.12)",
              color: "#b4490f",
              display: "grid",
              placeItems: "center",
              font: "600 12.5px ui-monospace,Menlo,monospace",
            }}
          >
            {numero(j)}
          </span>
          <h3 style={{ margin: "2px 0 0", font: "600 17px/1.3 var(--ft)", letterSpacing: "-.02em", color: "#1c1b19" }}>
            {item.h}
          </h3>
          {item.d ? <p style={{ margin: 0, font: "400 14px/1.6 var(--fb)", color: "#4a4845" }}>{item.d}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function Numerotee({ s }: { s: SectionLP }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(300px,100%),1fr))", gap: "0 28px" }}>
      {s.cards.map((carte) => {
        const precision = carte.d || carte.bul[0] || "";
        return (
          <div
            key={carte.h}
            style={{
              display: "grid",
              gridTemplateColumns: "44px minmax(0,1fr)",
              gap: 14,
              padding: "20px 0",
              borderTop: "1px solid #e5e3df",
            }}
          >
            <span style={{ font: "600 13px ui-monospace,Menlo,monospace", color: "#b4490f", paddingTop: 3 }}>{carte.eb}</span>
            <div>
              <h3 style={{ margin: 0, font: "600 17px/1.35 var(--ft)", letterSpacing: "-.02em", color: "#1c1b19" }}>
                {carte.h}
              </h3>
              {precision ? (
                <p style={{ margin: "6px 0 0", font: "400 13.5px/1.5 var(--fb)", color: "#6a6764" }}>{precision}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Offres({ s, ctx }: { s: SectionLP; ctx: Contexte }) {
  return (
    <div className={styles.g2} style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
      {s.cards.map((carte) => {
        // La carte « cœur de métier » (Résidence) est sombre, comme dans la maquette.
        const sombre = /cœur|Résidence/i.test(carte.eb);
        const encre = sombre ? "#fff" : "#1c1b19";
        return (
          <div
            key={carte.h}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: 30,
              borderRadius: 26,
              background: sombre ? "#1c1b19" : ctx.carte,
              border: `1px solid ${sombre ? "#1c1b19" : "#ecebe8"}`,
            }}
          >
            {carte.eb ? (
              <span
                style={{
                  alignSelf: "flex-start",
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: sombre ? "rgba(255,124,60,.2)" : "rgba(255,124,60,.12)",
                  font: "600 12px var(--fb)",
                  color: sombre ? "#ffb08a" : "#b4490f",
                }}
              >
                {carte.eb}
              </span>
            ) : null}
            <h3 style={{ margin: 0, font: "700 25px/1.15 var(--ft)", letterSpacing: "-.03em", color: encre }}>{carte.h}</h3>
            {carte.d ? (
              <p style={{ margin: 0, font: "400 15px/1.6 var(--fb)", color: sombre ? "rgba(255,255,255,.74)" : "#4a4845" }}>
                {carte.d}
              </p>
            ) : null}
            <ul style={{ listStyle: "none", margin: "2px 0 0", padding: 0, display: "grid", gap: 9 }}>
              {carte.bul.map((puce) => (
                <li key={puce} style={{ display: "flex", gap: 10, font: "500 14.5px/1.45 var(--fb)", color: encre }}>
                  <Coche />
                  {puce}
                </li>
              ))}
            </ul>
            <a
              href="#lp-contact"
              className={styles.eclaire}
              style={{
                marginTop: "auto",
                alignSelf: "flex-start",
                display: "inline-flex",
                padding: "12px 18px",
                borderRadius: 999,
                background: sombre ? "#ff7c3c" : "#1c1b19",
                color: "#fff",
                font: "600 14px var(--fb)",
              }}
            >
              {carte.cta || "Décrire mon besoin"} →
            </a>
          </div>
        );
      })}
    </div>
  );
}

export function Etapes({ s, ctx }: { s: SectionLP; ctx: Contexte }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {s.cards.map((carte, j) => (
          <div key={carte.h} style={{ padding: "26px 24px", borderRadius: 22, background: ctx.carte, border: "1px solid #ecebe8" }}>
            <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: "#1c1b19",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  font: "600 13px var(--fb)",
                  flex: "none",
                }}
              >
                {numero(j)}
              </span>
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#d9d6d0,rgba(217,214,208,0))" }} />
            </div>
            <h3 style={{ margin: 0, font: "600 18px/1.3 var(--ft)", letterSpacing: "-.02em", color: "#1c1b19" }}>{carte.h}</h3>
            <p style={{ margin: "8px 0 0", font: "400 14.5px/1.6 var(--fb)", color: "#4a4845" }}>{carte.d}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px", marginTop: 24 }}>
        <a href="#lp-contact" className={styles.orange} style={{ ...BOUTON_ORANGE, padding: "14px 22px", font: "600 15px var(--fb)" }}>
          Décrire mon besoin →
        </a>
        <a href={TELEPHONE_LP.href} style={{ font: "600 15px var(--fb)", color: "#1c1b19" }}>
          ou appelez le {TELEPHONE_LP.affichage}
        </a>
      </div>
    </>
  );
}

export function Temoignages({ s, ctx }: { s: SectionLP; ctx: Contexte }) {
  const images = s.qimg ?? [];
  const cartes = [
    ...s.quotes.map((citation, j) => ({
      cle: citation.q,
      etiquette: "Témoignage",
      image: images[j],
      texte: <blockquote style={{ margin: 0, font: "500 16px/1.55 var(--ft)", letterSpacing: "-.01em", color: "#1c1b19" }}>« {citation.q} »</blockquote>,
      qui: citation.who,
      ou: citation.org,
      logo: undefined as string | undefined,
    })),
    ...(s.cases ?? []).map((cas, j) => ({
      cle: cas.t,
      etiquette: "Étude de cas",
      image: images[s.quotes.length + j],
      texte: <p style={{ margin: 0, font: "600 17px/1.35 var(--ft)", letterSpacing: "-.015em", color: "#1c1b19" }}>{cas.t}</p>,
      qui: cas.client,
      ou: "Étude de cas migen",
      logo: cas.logo || undefined,
    })),
  ];

  return (
    <CarrouselLP nom={s.kick || s.h2}>
      {cartes.map((carte) => (
        <article
          key={carte.cle}
          style={{
            flex: "none",
            width: "min(360px,82%)",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            borderRadius: 24,
            overflow: "hidden",
            background: ctx.carte,
            border: "1px solid #ecebe8",
          }}
        >
          <Photo src={carte.image} tailles="360px" style={{ height: 210, flex: "none" }}>
            <span
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                padding: "6px 11px",
                borderRadius: 999,
                background: "rgba(255,255,255,.92)",
                font: "600 11.5px var(--fb)",
                color: "#1c1b19",
              }}
            >
              {carte.etiquette}
            </span>
            {carte.logo ? (
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  bottom: 14,
                  width: 100,
                  height: 46,
                  borderRadius: 12,
                  background: "#fff",
                  boxShadow: "0 10px 24px -12px rgba(0,0,0,.45)",
                }}
              >
                <span style={{ position: "absolute", inset: "0 14%" }}>
                  <Image src={carte.logo} alt="" fill sizes="72px" style={{ objectFit: "contain" }} />
                </span>
              </span>
            ) : null}
          </Photo>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, padding: "22px 22px 24px" }}>
            {carte.texte}
            <p style={{ margin: "auto 0 0", font: "400 13px/1.5 var(--fb)", color: "#6a6764" }}>
              <strong style={{ display: "block", fontWeight: 600, color: "#1c1b19" }}>{carte.qui}</strong>
              {carte.ou}
            </p>
          </div>
        </article>
      ))}
    </CarrouselLP>
  );
}
