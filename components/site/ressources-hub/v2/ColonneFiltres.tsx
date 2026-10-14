import type { CSSProperties, ReactNode } from "react";

import { demandeDiagnostic } from "@/components/formulaire/besoin";

import { MONO } from "./Cartes";
import type { ContenuRessource } from "./donnees";
import { DUREES, deux, duFormat, FORMATS, SUJETS, TAXONOMIE } from "./filtrage";
import type { CleDuree, Espace, Filtres } from "./filtrage";
import s from "./hub.module.css";

/**
 * La colonne latérale de la maquette (`markup-indent.html`, lignes 43 à 186) :
 * bascule d'espace, format, sujet, temps de lecture, mots-clés, encart sombre.
 * Chaque filtre est un bouton à `aria-pressed`.
 */

const TETE_GROUPE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 6px 8px",
  marginBottom: 4,
  borderBottom: "1px solid var(--line)",
};
const SURTITRE: CSSProperties = {
  font: `600 10.5px ${MONO}`,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--ink3)",
};
const COMPTE: CSSProperties = { font: `500 10.5px ${MONO}`, color: "var(--ink3)" };

function Groupe({
  titre,
  compte,
  gap,
  children,
}: {
  titre: string;
  compte: string;
  gap: number;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-label={titre} style={{ display: "grid", gap }}>
      <div style={TETE_GROUPE}>
        <span style={SURTITRE}>{titre}</span>
        <span style={COMPTE}>{compte}</span>
      </div>
      {children}
    </div>
  );
}

const segment = (on: boolean): CSSProperties => ({
  background: on ? "var(--card)" : "transparent",
  color: on ? "var(--ink)" : "var(--ink2)",
  boxShadow: on ? "0 6px 16px -10px rgba(0,0,0,.35)" : "none",
});

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
  const ent = espace === "ent";
  const inCat = duFormat(live, filtres.cat);
  const effectifs = new Map<string, number>();
  inCat.forEach((x) => x.etiquettes.forEach((t) => effectifs.set(t, (effectifs.get(t) ?? 0) + 1)));
  const etiquettes = TAXONOMIE[espace].filter((t) => effectifs.get(t));
  const bascule = (on: boolean): CSSProperties => ({
    position: "relative",
    zIndex: 1,
    border: "none",
    background: "none",
    padding: "10px 6px",
    borderRadius: 12,
    cursor: "pointer",
    font: "600 13px var(--fb)",
    transition: "color .3s",
    color: on ? "var(--ink)" : "var(--ink3)",
  });

  return (
    <aside className={s.side} aria-label="Filtrer les ressources" style={{ position: "sticky", top: 92, alignSelf: "start", zIndex: 6 }}>
      <div
        className={`${s.sc} ${s.scroll}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          maxHeight: "calc(100vh - 108px)",
          overflowY: "auto",
          padding: 14,
          borderRadius: 28,
          background: "var(--glass)",
          backdropFilter: "blur(26px) saturate(170%)",
          WebkitBackdropFilter: "blur(26px) saturate(170%)",
          border: "1px solid var(--gbd)",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          role="tablist"
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
          <button type="button" role="tab" aria-selected={ent} onClick={() => onEspace("ent")} style={bascule(ent)}>
            Entreprises
          </button>
          <button type="button" role="tab" aria-selected={!ent} onClick={() => onEspace("tech")} style={bascule(!ent)}>
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
          style={{ display: "flex", flexDirection: "column", gap: 22 }}
        >
          <Groupe titre="Format" compte={deux(live.length)} gap={2}>
            {FORMATS[espace].map(([k, l]) => {
              const enPause = ent && k !== "all" && k !== "Article";
              const on = filtres.cat === k;
              const n = k === "all" ? live.length : live.filter((x) => x.format === k).length;
              return (
                <button
                  key={k}
                  type="button"
                  disabled={enPause}
                  aria-pressed={enPause ? undefined : on}
                  onClick={() => onFiltres({ cat: k })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    width: "100%",
                    padding: 10,
                    border: "none",
                    borderRadius: 12,
                    textAlign: "left",
                    cursor: enPause ? "default" : "pointer",
                    font: `${on ? 600 : 500} 14px var(--fb)`,
                    transition: "background-color .2s,color .2s,box-shadow .2s",
                    backgroundColor: on ? "var(--card)" : "transparent",
                    color: enPause ? "var(--ink3)" : on ? "var(--ink)" : "var(--ink1)",
                    boxShadow: on ? "0 8px 20px -14px rgba(0,0,0,.4)" : "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span
                      style={{
                        flex: "none",
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        transition: "all .25s",
                        backgroundColor: on ? "#ff7c3c" : "var(--line)",
                        boxShadow: on ? "0 0 0 3px rgba(255,124,60,.18),0 0 12px rgba(255,124,60,.7)" : "none",
                      }}
                    />
                    {l}
                  </span>
                  <span style={{ font: `500 11px ${MONO}`, color: on ? "#ff7c3c" : "var(--ink3)" }}>
                    {enPause ? "Bientôt" : deux(n)}
                  </span>
                </button>
              );
            })}
          </Groupe>
          {ent ? (
            <Groupe titre="Sujet" compte={filtres.ths.length ? `${filtres.ths.length} sél.` : ""} gap={2}>
              {SUJETS.map((t) => {
                const on = filtres.ths.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    className={s.chipHover}
                    onClick={() =>
                      onFiltres({ ths: on ? filtres.ths.filter((x) => x !== t) : [...filtres.ths, t] })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      width: "100%",
                      padding: "9px 10px",
                      border: "none",
                      borderRadius: 12,
                      background: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      font: "500 13.5px var(--fb)",
                      color: "var(--ink1)",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span
                        aria-hidden="true"
                        style={{
                          flex: "none",
                          width: 16,
                          height: 16,
                          borderRadius: 5,
                          display: "grid",
                          placeItems: "center",
                          transition: "all .2s",
                          border: `1.5px solid ${on ? "#ff7c3c" : "var(--ink3)"}`,
                          backgroundColor: on ? "#ff7c3c" : "transparent",
                        }}
                      >
                        <span
                          style={{
                            width: 4,
                            height: 7,
                            borderRight: "2px solid #fff",
                            borderBottom: "2px solid #fff",
                            transform: "translateY(-1px) rotate(45deg)",
                            opacity: on ? 1 : 0,
                          }}
                        />
                      </span>
                      {t}
                    </span>
                    <span style={{ font: `500 11px ${MONO}`, color: "var(--ink3)" }}>
                      {deux(inCat.filter((x) => x.sujet === t).length)}
                    </span>
                  </button>
                );
              })}
            </Groupe>
          ) : null}
          <Groupe titre="Temps de lecture" compte="" gap={8}>
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
                    padding: "8px 2px",
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
          <Groupe
            titre={ent ? "Mots-clés" : "Compétences"}
            compte={filtres.tags.length ? `${filtres.tags.length} sél.` : ""}
            gap={8}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {etiquettes.map((t) => {
                const on = filtres.tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      onFiltres({ tags: on ? filtres.tags.filter((x) => x !== t) : [...filtres.tags, t] })
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: 999,
                      cursor: "pointer",
                      font: "500 12px var(--fb)",
                      transition: "all .2s",
                      border: `1px solid ${on ? "#ff7c3c" : "var(--line)"}`,
                      backgroundColor: on ? "var(--accw)" : "var(--card)",
                      color: on ? "var(--acci)" : "var(--ink1)",
                    }}
                  >
                    <span aria-hidden="true" style={{ font: `600 11px ${MONO}`, opacity: 0.55 }}>
                      #
                    </span>
                    {t}
                    <span style={{ font: `500 10.5px ${MONO}`, opacity: 0.55 }}>{effectifs.get(t)}</span>
                  </button>
                );
              })}
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
      style={{ position: "relative", overflow: "hidden", padding: 18, borderRadius: 20, background: "#1c1b19", color: "#fff" }}
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
      <div style={{ position: "relative", font: "600 15px/1.3 var(--ft)", letterSpacing: "-.02em", margin: "8px 0 14px" }}>
        {ent ? "Combien vous coûtent vraiment vos arrêts ?" : "Votre niveau technique, mesuré en quelques questions."}
      </div>
      <a
        href={ent ? "#rs-form" : "/test-technicien/"}
        onClick={ent ? demandeDiagnostic : undefined}
        className={s.dim}
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          padding: "11px 14px",
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
