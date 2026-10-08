"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

import styles from "./PreuvesHub.module.css";
import type { CartePreuve, VuePreuves } from "./vues-preuves";

/**
 * Deuxième écran du hub /preuves/ : onglets par type de besoin, phrase du
 * besoin, trois cartes à la une, grille. Relevé sur `maquette/rendu/preuves.html`
 * (section 1) et `MigenPreuves.dc.html`, lignes 50 à 90.
 *
 * COMPOSANT CLIENT pour une seule raison : l'onglet actif. Les vues arrivent
 * calculées du serveur (`vuesPreuves`), ce fichier ne fait que choisir.
 *
 * À L'OUVERTURE, l'onglet actif est la première catégorie, comme la maquette
 * (`state.cat = 0`) et sa capture. Les autres catégories sont rendues
 * MASQUÉES (`hidden`) plutôt qu'absentes : la page liste ainsi ses 41 fiches
 * dans le HTML servi, ce qu'un hub doit à son cocon, sans rien changer à ce
 * qui s'affiche. La vue « Tous » ne se rend qu'active : elle doublerait les
 * mêmes liens.
 */

const PILULE_FONCEE = "#1c1b19";

function styleOnglet(actif: boolean): CSSProperties {
  return {
    cursor: "pointer",
    padding: "9px 14px",
    borderRadius: 999,
    font: "600 13.5px var(--fb)",
    whiteSpace: "nowrap",
    border: `1px solid ${actif ? PILULE_FONCEE : "rgba(28,27,25,.1)"}`,
    background: actif ? PILULE_FONCEE : "rgba(255,255,255,.7)",
    color: actif ? "#fff" : "#4a4845",
  };
}

function styleNombre(actif: boolean): CSSProperties {
  return {
    font: "600 11px ui-monospace,Menlo,monospace",
    marginLeft: 4,
    color: actif ? "#ff7c3c" : "#a8a49d",
  };
}

const PASTILLE_LOGO: CSSProperties = {
  position: "absolute",
  display: "inline-flex",
  alignItems: "center",
  height: 36,
  padding: "0 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,.94)",
  boxShadow: "0 8px 20px -10px rgba(0,0,0,.4)",
};

const ETIQUETTE: CSSProperties = {
  font: "600 10px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  padding: "5px 10px",
  borderRadius: 999,
};

const RECENT: CSSProperties = { ...ETIQUETTE, background: "#ff7c3c" };

function Logo({ carte, place }: { carte: CartePreuve; place: CSSProperties }) {
  if (!carte.logo) return null;
  return (
    <span style={{ ...PASTILLE_LOGO, ...place }}>
      <Image
        src={carte.logo}
        alt={carte.client}
        width={96}
        height={18}
        style={{
          height: 18,
          width: "auto",
          maxWidth: 96,
          objectFit: "contain",
          display: "block",
          filter: carte.logoInverse ? "invert(1) hue-rotate(180deg)" : "none",
        }}
      />
    </span>
  );
}

function CarteUne({ carte, grande }: { carte: CartePreuve; grande: boolean }) {
  return (
    <Link
      href={carte.url}
      prefetch={false}
      className={styles.une}
      style={{
        position: "relative",
        display: "block",
        borderRadius: 28,
        overflow: "hidden",
        background: "#1c1b19",
        transition: "transform .2s",
        ...(grande
          ? { gridRow: "span 2", minHeight: 460 }
          : { minHeight: 223 }),
      }}
    >
      <Image
        src={carte.photo}
        alt={`Intervention migen chez ${carte.client}`}
        fill
        sizes={grande ? "(max-width: 900px) 100vw, 650px" : "(max-width: 900px) 100vw, 480px"}
        style={{
          objectFit: "cover",
          filter: "saturate(var(--sat,.55)) contrast(1.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top,rgba(18,17,16,.9) 0%,rgba(18,17,16,.15) 62%)",
        }}
      />
      <Logo carte={carte} place={{ top: 20, left: 22 }} />
      <div
        style={{
          position: "absolute",
          left: 26,
          right: 26,
          bottom: 24,
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              ...ETIQUETTE,
              background: "rgba(255,255,255,.18)",
              backdropFilter: "blur(8px)",
            }}
          >
            {carte.categorie}
          </span>
          {carte.recent ? <span style={RECENT}>Récent</span> : null}
        </div>
        <div
          style={{
            font: `700 ${grande ? "clamp(30px,3.4vw,44px)" : "24px"}/1.05 var(--ft)`,
            letterSpacing: "-.02em",
          }}
        >
          {carte.client}
        </div>
        {carte.sujet ? (
          <div
            style={{
              font: "600 15px/1.35 var(--fb)",
              color: "rgba(255,255,255,.88)",
              marginTop: 6,
            }}
          >
            {carte.sujet}
          </div>
        ) : null}
        {grande ? (
          <p
            style={{
              font: "400 14.5px/1.6 var(--fb)",
              color: "rgba(255,255,255,.72)",
              margin: "10px 0 0",
              maxWidth: "46ch",
            }}
          >
            {carte.resume}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function Carte({ carte, montreCategorie }: { carte: CartePreuve; montreCategorie: boolean }) {
  return (
    <Link
      href={carte.url}
      prefetch={false}
      className={styles.carte}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 24,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid rgba(28,27,25,.08)",
        boxShadow: "0 20px 44px -32px rgba(0,0,0,.3)",
        transition: "transform .2s,box-shadow .2s",
        color: "#1c1b19",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 170,
          background: "#dedfe1",
          overflow: "hidden",
        }}
      >
        <Image
          src={carte.photo}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 680px) 50vw, 380px"
          style={{
            objectFit: "cover",
            filter: "saturate(var(--sat,.55)) contrast(1.05)",
          }}
        />
        <Logo carte={carte} place={{ top: 12, left: 12 }} />
        {carte.recent ? (
          <span
            style={{
              ...RECENT,
              position: "absolute",
              top: 12,
              right: 12,
              color: "#fff",
            }}
          >
            Récent
          </span>
        ) : null}
      </div>
      <div
        style={{
          padding: "18px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: "1 1 0%",
        }}
      >
        {montreCategorie ? (
          <span style={{ ...ETIQUETTE, padding: 0, color: carte.couleurCategorie }}>
            {carte.categorie}
          </span>
        ) : null}
        <div
          style={{
            font: "700 18px/1.2 var(--ft)",
            letterSpacing: "-.01em",
          }}
        >
          {carte.client}
        </div>
        {carte.sujet ? (
          <div style={{ font: "600 13.5px/1.4 var(--fb)", color: "#4a4845" }}>
            {carte.sujet}
          </div>
        ) : null}
        <div style={{ font: "400 13.5px/1.55 var(--fb)", color: "#6a6764" }}>
          {carte.resume}
        </div>
        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid rgba(28,27,25,.08)",
            font: "600 13px var(--fb)",
          }}
        >
          Lire l’étude <span style={{ color: "#ff7c3c" }}>→</span>
        </div>
      </div>
    </Link>
  );
}

function Vue({ vue, cachee }: { vue: VuePreuves; cachee: boolean }) {
  return (
    <div hidden={cachee} data-vue={vue.libelle}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          margin: "22px 0 18px",
        }}
      >
        <p
          style={{
            font: "400 15px/1.6 var(--fb)",
            color: "var(--ink2,#6a6764)",
            margin: 0,
            maxWidth: "70ch",
          }}
        >
          {vue.besoin}
        </p>
        <span
          style={{
            font: "500 13px var(--fb)",
            color: "var(--ink4,#a8a49d)",
            whiteSpace: "nowrap",
          }}
        >
          {vue.compte}
        </span>
      </div>
      {vue.une.length > 0 ? (
        <div
          className={styles.lesUnes}
          style={{
            display: "grid",
            gridTemplateColumns: "1.35fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          {vue.une.map((carte, i) => (
            <CarteUne key={carte.url} carte={carte} grande={i === 0} />
          ))}
        </div>
      ) : null}
      <div
        className={styles.grille}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: 14,
        }}
      >
        {vue.grille.map((carte) => (
          <Carte key={carte.url} carte={carte} montreCategorie={vue.montreCategorie} />
        ))}
      </div>
    </div>
  );
}

export interface ProprietesFiltrePreuves {
  /** Vue 0 « Tous », puis une par catégorie : `vuesPreuves`. */
  vues: VuePreuves[];
}

export default function FiltrePreuves({ vues }: ProprietesFiltrePreuves) {
  const [actif, setActif] = useState(vues.length > 1 ? 1 : 0);

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 40px 0" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {vues.map((vue, i) => (
          <button
            key={vue.libelle}
            type="button"
            aria-pressed={i === actif}
            onClick={() => setActif(i)}
            style={styleOnglet(i === actif)}
          >
            {vue.libelle} <span style={styleNombre(i === actif)}>{vue.nombre}</span>
          </button>
        ))}
      </div>
      {vues.map((vue, i) =>
        i === actif || i > 0 ? (
          <Vue key={vue.libelle} vue={vue} cachee={i !== actif} />
        ) : null,
      )}
    </section>
  );
}
