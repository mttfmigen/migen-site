import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { diagnostic } from "./BlocsBas";
import { MONO } from "./Cartes";
import type { ContenuRessource } from "./donnees";
import { DUREES, deux, duFormat, FORMATS, SUJETS, TAXONOMIE } from "./filtrage";
import type { CleDuree, Espace, Filtres } from "./filtrage";
import s from "./hub.module.css";

/**
 * La colonne latérale compacte du colis du 14/10 (« Migen - Ressources v2 »,
 * `aside.rs-side2`) : bascule d'espace, Format en grille de deux colonnes,
 * Sujet en pastilles, Temps de lecture en segment, Mots-clés en pastilles
 * (8 visibles + « +N », les autres restent dans le DOM), encart sombre.
 * Collante SANS défilement interne : son décalage s'ajuste à sa hauteur réelle
 * (`fitSide` de la maquette). Chaque filtre est un bouton à `aria-pressed`.
 */

/** Libellés courts de la grille Format (`KINDS` de la maquette) ; ailleurs, `FORMATS`. */
const COURT: Record<string, string> = { "Fiche pratique": "Pratiques", "Fiche technique": "Techniques" };
const MOTS_VISIBLES = 8;
const HAUT_MAX = 92;

const TETE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 4px 6px",
  borderBottom: "1px solid var(--line)",
};
const SURTITRE: CSSProperties = {
  font: `600 10.5px ${MONO}`,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--ink3)",
};
const COMPTE: CSSProperties = { font: `500 10.5px ${MONO}`, color: "var(--ink3)" };

function Tete({ titre, compte, style }: { titre: string; compte: string; style: CSSProperties }) {
  return (
    <div style={{ ...TETE, ...style }}>
      <span style={SURTITRE}>{titre}</span>
      <span style={COMPTE}>{compte}</span>
    </div>
  );
}

function Groupe({
  titre,
  style,
  className,
  children,
}: {
  titre: string;
  style: CSSProperties;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-label={titre} className={className} style={style}>
      {children}
    </div>
  );
}

const segment = (on: boolean): CSSProperties => ({
  background: on ? "var(--card)" : "transparent",
  color: on ? "var(--ink)" : "var(--ink2)",
  boxShadow: on ? "0 6px 16px -10px rgba(0,0,0,.35)" : "none",
});

const bascule = (on: boolean): CSSProperties => ({
  position: "relative",
  zIndex: 1,
  border: "none",
  background: "none",
  padding: "8px 6px",
  borderRadius: 12,
  cursor: "pointer",
  font: "600 13px var(--fb)",
  transition: "color .3s",
  color: on ? "var(--ink)" : "var(--ink3)",
});

/** Le décalage collant : 92 px, ou moins si la colonne est plus haute que la fenêtre. */
function useDecalage() {
  const ref = useRef<HTMLElement>(null);
  const [haut, setHaut] = useState(HAUT_MAX);
  useEffect(() => {
    const carte = ref.current?.firstElementChild;
    if (!carte) return;
    const ajuste = () => setHaut(Math.min(HAUT_MAX, window.innerHeight - carte.getBoundingClientRect().height - 16));
    const ro = new ResizeObserver(ajuste);
    ro.observe(carte);
    window.addEventListener("resize", ajuste);
    ajuste();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", ajuste);
    };
  }, []);
  return { ref, haut };
}

interface Proprietes {
  espace: Espace;
  live: readonly ContenuRessource[];
  filtres: Filtres;
  nbActifs: number;
  ouvert: boolean;
  onEspace: (e: Espace) => void;
  onBascule: () => void;
  onFiltres: (f: Partial<Filtres>) => void;
  onReinitialise: () => void;
}

export default function ColonneFiltres({
  espace,
  live,
  filtres,
  nbActifs,
  ouvert,
  onEspace,
  onBascule,
  onFiltres,
  onReinitialise,
}: Proprietes) {
  const { ref, haut } = useDecalage();
  const [tousLesMots, setTousLesMots] = useState(false);
  const ent = espace === "ent";
  const inCat = duFormat(live, filtres.cat);
  const effectifs = new Map<string, number>();
  inCat.forEach((x) => x.etiquettes.forEach((t) => effectifs.set(t, (effectifs.get(t) ?? 0) + 1)));
  // Ordre de la maquette : les mots choisis d'abord, puis les plus fréquents (tri stable).
  const etiquettes = TAXONOMIE[espace]
    .filter((t) => effectifs.get(t))
    .sort(
      (a, b) =>
        Number(filtres.tags.includes(b)) - Number(filtres.tags.includes(a)) ||
        (effectifs.get(b) ?? 0) - (effectifs.get(a) ?? 0),
    );
  const enPlus = etiquettes.length - MOTS_VISIBLES;

  return (
    <aside
      ref={ref}
      className={s.side}
      aria-label="Filtrer les ressources"
      style={{ position: "sticky", top: haut, alignSelf: "start", zIndex: 6, lineHeight: "normal" }}
    >
      <div
        className={s.sc}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: 12,
          borderRadius: 28,
          background: "var(--glass)",
          backdropFilter: "blur(26px) saturate(170%)",
          WebkitBackdropFilter: "blur(26px) saturate(170%)",
          border: "1px solid var(--gbd)",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          role="group"
          aria-label="Espace"
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            padding: 4,
            borderRadius: 16,
            background: "var(--chip)",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 4,
              bottom: 4,
              left: 4,
              width: "calc(50% - 4px)",
              borderRadius: 12,
              background: "var(--card)",
              boxShadow: "0 6px 16px -10px rgba(0,0,0,.35)",
              transition: "transform .45s cubic-bezier(.2,.8,.2,1)",
              transform: ent ? "translateX(0)" : "translateX(100%)",
            }}
          />
          <button type="button" aria-pressed={ent} onClick={() => onEspace("ent")} style={bascule(ent)}>
            Entreprises
          </button>
          <button type="button" aria-pressed={!ent} onClick={() => onEspace("tech")} style={bascule(!ent)}>
            Techniciens
          </button>
        </div>
        <button
          type="button"
          className={s.ftoggle}
          aria-expanded={ouvert}
          aria-controls="rs-filtres"
          onClick={onBascule}
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            width: "100%",
            padding: "12px 14px",
            border: "1px solid var(--line)",
            borderRadius: 14,
            background: "var(--card)",
            cursor: "pointer",
            font: "600 13.5px var(--fb)",
            color: "var(--ink)",
          }}
        >
          Filtres
          <span style={{ font: `500 11px ${MONO}`, color: "var(--ink3)" }}>
            {nbActifs ? `${nbActifs}${nbActifs > 1 ? " actifs" : " actif"}` : "Aucun actif"}
          </span>
        </button>
        <div
          id="rs-filtres"
          className={ouvert ? undefined : s.ferme}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <Groupe titre="Format" className={s.fmt} style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 3 }}>
            <Tete titre="Format" compte={deux(live.length)} style={{ gridColumn: "1 / -1", marginBottom: 6 }} />
            {FORMATS[espace].map(([k, l]) => {
              const enPause = ent && k !== "all" && k !== "Article";
              const on = filtres.cat === k;
              const n = k === "all" ? live.length : live.filter((x) => x.format === k).length;
              const libelle = COURT[k] ?? l;
              return (
                <button
                  key={k}
                  type="button"
                  disabled={enPause}
                  aria-pressed={enPause ? undefined : on}
                  aria-label={enPause ? `${libelle}, bientôt disponible` : undefined}
                  title={enPause ? "Bientôt disponible" : undefined}
                  onClick={() => onFiltres({ cat: k })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    minWidth: 0,
                    width: "100%",
                    padding: "7px 9px",
                    border: "none",
                    borderRadius: 12,
                    textAlign: "left",
                    cursor: enPause ? "default" : "pointer",
                    font: `${on ? 600 : 500} 12.5px/1.25 var(--fb)`,
                    transition: "background-color .2s,color .2s,box-shadow .2s",
                    backgroundColor: on ? "var(--card)" : "transparent",
                    color: enPause ? "var(--ink3)" : on ? "var(--ink)" : "var(--ink1)",
                    boxShadow: on ? "0 8px 20px -14px rgba(0,0,0,.4)" : "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, maxWidth: "100%" }}>
                    <span
                      style={{
                        flex: "none",
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        transition: "all .25s",
                        backgroundColor: on ? "#ff7c3c" : "var(--line)",
                        boxShadow: on ? "0 0 0 3px rgba(255,124,60,.18),0 0 12px rgba(255,124,60,.7)" : "none",
                      }}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{libelle}</span>
                  </span>
                  <span style={{ flex: "none", font: `500 10px ${MONO}`, color: on ? "#ff7c3c" : "var(--ink3)" }}>
                    {enPause ? "-" : deux(n)}
                  </span>
                </button>
              );
            })}
          </Groupe>
          {ent ? (
            <Groupe titre="Sujet" style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <Tete
                titre="Sujet"
                compte={filtres.ths.length ? `${filtres.ths.length} sél.` : ""}
                style={{ flex: "1 1 100%", marginBottom: 3 }}
              />
              {SUJETS.map((t) => {
                const on = filtres.ths.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    className={s.bordOrange}
                    onClick={() =>
                      onFiltres({ ths: on ? filtres.ths.filter((x) => x !== t) : [...filtres.ths, t] })
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      flex: "0 1 auto",
                      maxWidth: "100%",
                      padding: "6px 11px",
                      borderRadius: 999,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      font: "500 12px var(--fb)",
                      transition: "all .2s",
                      border: `1px solid ${on ? "#ff7c3c" : "var(--line)"}`,
                      backgroundColor: on ? "var(--accw)" : "var(--card)",
                      color: on ? "var(--ink)" : "var(--ink1)",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </Groupe>
          ) : null}
          <Groupe titre="Temps de lecture" style={{ display: "grid", gap: 0 }}>
            <Tete titre="Temps de lecture" compte="" style={{ marginBottom: 8 }} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                gap: 3,
                padding: 4,
                borderRadius: 14,
                background: "var(--chip)",
              }}
            >
              {DUREES.map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filtres.dur === k}
                  onClick={() => onFiltres({ dur: k as CleDuree })}
                  style={{
                    border: "none",
                    padding: "6px 2px",
                    borderRadius: 10,
                    cursor: "pointer",
                    font: "600 11.5px var(--fb)",
                    whiteSpace: "nowrap",
                    transition: "all .2s",
                    ...segment(filtres.dur === k),
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </Groupe>
          <Groupe titre={ent ? "Mots-clés" : "Compétences"} style={{ display: "grid", gap: 0 }}>
            <Tete
              titre={ent ? "Mots-clés" : "Compétences"}
              compte={filtres.tags.length ? `${filtres.tags.length} sél.` : ""}
              style={{ marginBottom: 8 }}
            />
            <div id="rs-mots" style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {etiquettes.map((t, i) => {
                const on = filtres.tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    hidden={!tousLesMots && i >= MOTS_VISIBLES}
                    onClick={() =>
                      onFiltres({ tags: on ? filtres.tags.filter((x) => x !== t) : [...filtres.tags, t] })
                    }
                    style={{
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 9px",
                      borderRadius: 999,
                      cursor: "pointer",
                      font: "500 11.5px var(--fb)",
                      transition: "all .2s",
                      border: `1px solid ${on ? "#ff7c3c" : "var(--line)"}`,
                      backgroundColor: on ? "var(--accw)" : "var(--card)",
                      color: on ? "var(--acci)" : "var(--ink1)",
                    }}
                    className={s.motCle}
                  >
                    {t}
                  </button>
                );
              })}
              {enPlus > 0 ? (
                <button
                  type="button"
                  aria-expanded={tousLesMots}
                  aria-controls="rs-mots"
                  aria-label={tousLesMots ? "Afficher moins de mots-clés" : `Afficher ${enPlus} mots-clés de plus`}
                  onClick={() => setTousLesMots((v) => !v)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "5px 10px",
                    borderRadius: 999,
                    cursor: "pointer",
                    font: "600 11.5px var(--fb)",
                    border: "1px dashed var(--line)",
                    background: "none",
                    color: "#b4490f",
                  }}
                >
                  {tousLesMots ? "Moins" : `+${enPlus}`}
                </button>
              ) : null}
            </div>
          </Groupe>
          {nbActifs ? (
            <button
              type="button"
              className={s.dashed}
              onClick={onReinitialise}
              style={{
                border: "1px dashed var(--line)",
                background: "none",
                padding: 11,
                borderRadius: 14,
                cursor: "pointer",
                font: "600 12.5px var(--fb)",
                color: "var(--ink2)",
              }}
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>
        <EncartLateral ent={ent} />
      </div>
    </aside>
  );
}

function EncartLateral({ ent }: { ent: boolean }) {
  return (
    <div
      className={s.sideCta}
      style={{ position: "relative", overflow: "hidden", padding: "12px 14px", borderRadius: 16, background: "#1c1b19", color: "#fff" }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -80,
          top: -100,
          width: 220,
          height: 220,
          borderRadius: 999,
          background: "radial-gradient(circle,rgba(255,124,60,.5),rgba(255,124,60,0) 66%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          font: `600 10.5px ${MONO}`,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "#ffb08a",
        }}
      >
        {ent ? "Diagnostic Zéro arrêt" : "Test technicien"}
      </div>
      <div style={{ position: "relative", font: "600 13.5px/1.3 var(--ft)", letterSpacing: "-.02em", margin: "4px 0 8px" }}>
        {ent ? "Combien vous coûtent vraiment vos arrêts ?" : "Votre niveau technique, mesuré en quelques questions."}
      </div>
      <a
        href={ent ? "#rs-form" : "/test-technicien/"}
        onClick={ent ? diagnostic : undefined}
        className={s.dim}
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          padding: "8px 12px",
          borderRadius: 999,
          background: "#ff7c3c",
          color: "#fff",
          font: "600 13px var(--fb)",
        }}
      >
        {ent ? "Demander mon diagnostic" : "Passer le test"}
      </a>
    </div>
  );
}
