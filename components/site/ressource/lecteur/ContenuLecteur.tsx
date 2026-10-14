import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { CONTENUS_ENTREPRISES } from "@/components/site/ressources-hub/v2/donnees";
import { altPhoto } from "@/lib/descriptions-photos";
import type { BlocRessource, ContenuRessource } from "@/types/ressource";

import { EnLigne } from "../CorpsRessource";
import { COPIE } from "../habillage";
import s from "./lecteur.module.css";

/**
 * Le corps du lecteur latéral, maquette « Ressources v2 »
 * (`markup-indent.html` l. 1025-1265, `blk()` et `rd` de `page-dc.jsx`).
 *
 * Le TEXTE est celui de la page servie (`pages.contenu`), pas celui du relevé
 * de la maquette : le lecteur et l'URL rechargée disent les mêmes mots. Le
 * DESSIN est celui de la maquette, motif par motif :
 *   paragraphe → p · intertitre → h3 · encadré → « À retenir »
 *   puces → cartes numérotées si 60 % des entrées ont un « **titre** : », liste sinon
 *   étapes → frise numérotée · tableau → grille défilante · questions → FAQ
 * Les motifs « bar » et « stats » de la maquette ne sont pas portés : ils
 * dessinent des montants, que le site ne publie pas.
 */

const ORANGE = "#ff7c3c";
const LIEN: CSSProperties = { fontWeight: 600, color: "var(--ink)", textDecoration: "underline", textDecorationColor: "rgba(255,124,60,.55)" };
const GRAS: CSSProperties = { fontWeight: 600, color: "var(--ink)" };
const MONO = "ui-monospace,Menlo,monospace";
const PAD = "clamp(22px,5vw,60px)";
const CHIP: CSSProperties = {
  whiteSpace: "nowrap",
  flex: "none",
  padding: "7px 12px",
  borderRadius: 999,
  background: "var(--chip)",
  font: "500 12.5px var(--fb)",
  color: "var(--ink1)",
};
const BOUTON: CSSProperties = {
  border: "none",
  borderRadius: 999,
  background: ORANGE,
  color: "#fff",
  whiteSpace: "nowrap",
  textDecoration: "none",
};

const LIBELLE_RAYON: Record<string, string> = {
  articles: "Article",
  "fiches-pratiques": "Fiche pratique",
  "fiches-techniques": "Fiche technique",
  "livres-blancs": "Livre blanc",
  process: "Process",
};

const deuxChiffres = (n: number) => String(n + 1).padStart(2, "0");
const texte = (t: string) => <EnLigne texte={t} lien={LIEN} gras={GRAS} />;

/** « **Titre** : description », la forme que la maquette lit en carte. */
function titreEtTexte(item: string): { h: string; d: string } | null {
  const m = /^\*\*([^*]+)\*\*\s*:\s*([\s\S]+)$/.exec(item.trim());
  return m ? { h: m[1], d: m[2] } : null;
}

/** `bal()` de la maquette : colonnes équilibrées, la dernière carte seule s'étale. */
function equilibre(n: number, max: number): { cols: string; large: boolean } {
  let c: number;
  if (n <= 1) c = 1;
  else if (n <= max) c = n === 4 && max === 3 ? 2 : n;
  else c = [max === 4 ? 4 : 3, 3, 2].find((k) => n % k === 0) ?? (n % 3 !== 1 ? 3 : n % 2 === 0 ? 2 : 3);
  return { cols: `repeat(${c},minmax(0,1fr))`, large: n > c && n % c === 1 };
}

function Puces({ items }: { items: string[] }) {
  const lus = items.map(titreEtTexte);
  const enCartes = items.length >= 2 && lus.filter(Boolean).length >= Math.ceil(items.length * 0.6);
  if (!enCartes) {
    return (
      <div style={{ display: "grid", gap: 10, margin: "4px 0 18px" }}>
        {items.map((it) => (
          <div key={it} style={{ display: "flex", gap: 12, font: "400 15.5px/1.65 var(--fb)", color: "var(--ink1)" }}>
            <span style={{ flex: "none", width: 6, height: 6, borderRadius: 999, background: ORANGE, marginTop: 11 }} />
            <span>{texte(it)}</span>
          </div>
        ))}
      </div>
    );
  }
  const b = equilibre(items.length, 3);
  return (
    <div className={s.bal} style={{ display: "grid", gridTemplateColumns: b.cols, gap: 10, margin: "6px 0 20px" }}>
      {items.map((it, j) => {
        const l = lus[j];
        return (
          <div
            key={it}
            style={{
              gridColumn: b.large && j === items.length - 1 ? "1 / -1" : "auto",
              padding: "18px 20px",
              borderRadius: 20,
              background: "var(--bg)",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{ flex: "none", font: `600 11px ${MONO}`, color: ORANGE }}>{deuxChiffres(j)}</span>
              <span style={{ font: "600 15px/1.3 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)" }}>
                {l ? l.h : texte(it)}
              </span>
            </div>
            {l && <div style={{ font: "400 14px/1.6 var(--fb)", color: "var(--ink1)", marginTop: 8 }}>{texte(l.d)}</div>}
          </div>
        );
      })}
    </div>
  );
}

function Etapes({ items }: { items: string[] }) {
  return (
    <div style={{ margin: "10px 0 18px", display: "grid" }}>
      {items.map((it, j) => {
        const l = titreEtTexte(it);
        return (
          <div
            key={it}
            style={{ position: "relative", display: "grid", gridTemplateColumns: "36px minmax(0,1fr)", gap: 16, paddingBottom: 20 }}
          >
            {j < items.length - 1 && (
              <span
                aria-hidden="true"
                style={{ position: "absolute", left: 17, top: 40, bottom: 2, width: 2, borderRadius: 2, background: "var(--line)" }}
              />
            )}
            <span
              style={{
                position: "relative",
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "var(--knob)",
                color: "var(--knobfg)",
                display: "grid",
                placeItems: "center",
                font: "600 12px var(--fb)",
              }}
            >
              {deuxChiffres(j)}
            </span>
            <div style={{ paddingTop: 6 }}>
              {l && (
                <div style={{ font: "600 15.5px/1.3 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)", marginBottom: 4 }}>{l.h}</div>
              )}
              <div style={{ font: "400 14.5px/1.6 var(--fb)", color: "var(--ink1)" }}>{texte(l ? l.d : it)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Tableau({ entetes, lignes }: { entetes: string[]; lignes: string[][] }) {
  const n = Math.max(entetes.length, ...lignes.map((r) => r.length));
  const cellule = (t: string, entete: boolean, premiere: boolean, cle: string) => (
    <div
      key={cle}
      style={{
        padding: "13px 16px",
        borderBottom: "1px solid var(--line)",
        font: entete ? "600 12.5px/1.45 var(--fb)" : premiere ? "600 14px/1.5 var(--fb)" : "400 14px/1.55 var(--fb)",
        color: entete ? "var(--ink2)" : premiere ? "var(--ink)" : "var(--ink1)",
        backgroundColor: entete ? "var(--bg)" : "var(--card)",
      }}
    >
      {t}
    </div>
  );
  const colonnes = Array.from({ length: n }, (_, c) => c);
  return (
    <div className={s.defile} style={{ margin: "6px 0 22px", overflowX: "auto", borderRadius: 20, border: "1px solid var(--line)" }}>
      <div style={{ display: "grid", minWidth: n * 150, gridTemplateColumns: `repeat(${n},minmax(150px,1fr))` }}>
        {colonnes.map((c) => cellule(entetes[c] ?? "", true, false, `e${c}`))}
        {lignes.flatMap((r, i) => colonnes.map((c) => cellule(r[c] ?? "", false, c === 0, `${i}-${c}`)))}
      </div>
    </div>
  );
}

function Bloc({ bloc }: { bloc: BlocRessource }): ReactNode {
  switch (bloc.type) {
    case "paragraphe":
      return (
        <p style={{ font: "400 16.5px/1.78 var(--fb)", color: "var(--ink1)", margin: "0 0 16px", textWrap: "pretty" }}>
          {texte(bloc.texte)}
        </p>
      );
    case "intertitre":
      return (
        <h3 style={{ font: "600 17px/1.35 var(--ft)", letterSpacing: "-.02em", margin: "24px 0 8px", color: "var(--ink)" }}>
          {bloc.texte}
        </h3>
      );
    case "encadre":
      return (
        <div style={{ margin: "8px 0 20px", padding: "20px 22px", borderRadius: 20, background: "var(--accw)" }}>
          <div
            style={{
              font: "600 11px var(--fb)",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--acci)",
              marginBottom: 8,
            }}
          >
            À retenir
          </div>
          <div style={{ font: "500 15.5px/1.6 var(--fb)", color: "var(--ink)" }}>{texte(bloc.texte)}</div>
        </div>
      );
    case "puces":
      return <Puces items={bloc.items} />;
    case "etapes":
      return <Etapes items={bloc.items} />;
    case "tableau":
      return <Tableau entetes={bloc.entetes} lignes={bloc.lignes} />;
  }
}

function Partie({ n, titre, children }: { n: number; titre: string; children: ReactNode }) {
  return (
    <section style={{ paddingTop: 46 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16 }}>
        <span style={{ flex: "none", font: `600 12px ${MONO}`, color: ORANGE }}>{deuxChiffres(n)}</span>
        <h2
          style={{
            font: "600 clamp(22px,2.2vw,27px)/1.2 var(--ft)",
            letterSpacing: "-.035em",
            margin: 0,
            textWrap: "balance",
          }}
        >
          {titre}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Appel({ surtitre, titre }: { surtitre: string; titre: string }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: 48,
        padding: 30,
        borderRadius: 26,
        background: "#1c1b19",
        color: "#fff",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -120,
          top: -160,
          width: 380,
          height: 380,
          borderRadius: 999,
          background: "radial-gradient(circle,rgba(255,124,60,.42),rgba(255,124,60,0) 66%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            font: "600 11px var(--fb)",
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: ORANGE,
            marginBottom: 8,
          }}
        >
          {surtitre}
        </div>
        <div style={{ font: "600 21px/1.2 var(--ft)", letterSpacing: "-.03em", maxWidth: "24ch" }}>{titre}</div>
      </div>
      <Link href="/ressources/#rs-form" style={{ ...BOUTON, position: "relative", padding: "14px 22px", font: "600 14.5px var(--fb)" }}>
        Décrire mon besoin →
      </Link>
    </div>
  );
}

export default function ContenuLecteur({
  url,
  titre,
  contenu,
}: {
  url: string;
  titre: string;
  contenu: ContenuRessource;
}) {
  const ordre = CONTENUS_ENTREPRISES.findIndex((x) => x.url === url);
  const carte = ordre >= 0 ? CONTENUS_ENTREPRISES[ordre] : undefined;
  const suivant =
    ordre >= 0 && CONTENUS_ENTREPRISES.length > 1 ? CONTENUS_ENTREPRISES[(ordre + 1) % CONTENUS_ENTREPRISES.length] : undefined;
  const parties = contenu.parties ?? [];
  const questions = contenu.questions ?? [];
  const nbParties = parties.length + (questions.length ? 1 : 0);
  const photo = carte?.photo ?? contenu.image;
  const minutes = contenu.minutes ?? carte?.minutes;
  const fil = [
    "Ressources",
    contenu.rayon ? LIBELLE_RAYON[contenu.rayon] : carte?.format,
    carte?.sujet,
  ].filter((x): x is string => !!x);

  return (
    <>
      <header style={{ padding: `36px ${PAD} 0` }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, font: "500 12.5px var(--fb)", color: "var(--ink3)" }}>
          {fil.map((f, i) => (
            <span key={f} style={{ display: "contents" }}>
              {i > 0 && <span>/</span>}
              <span style={i === fil.length - 1 && i > 1 ? { color: ORANGE, fontWeight: 600 } : undefined}>{f}</span>
            </span>
          ))}
        </div>
        <h1
          style={{
            font: "600 clamp(32px,4.2vw,52px)/1.02 var(--ft)",
            letterSpacing: "-.055em",
            margin: "16px 0 18px",
            textWrap: "balance",
          }}
        >
          {titre}
        </h1>
        {(contenu.chapo ?? []).map((p) => (
          <p
            key={p}
            style={{ font: "400 18.5px/1.65 var(--fb)", color: "var(--ink1)", margin: "0 0 12px", maxWidth: "62ch", textWrap: "pretty" }}
          >
            {texte(p)}
          </p>
        ))}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
          {minutes ? <span style={CHIP}>{minutes} min de lecture</span> : null}
          {nbParties ? <span style={CHIP}>{nbParties} parties</span> : null}
          <span style={CHIP}>Écrit par nos équipes terrain</span>
        </div>
      </header>
      {photo && (
        <div
          style={{
            position: "relative",
            margin: "30px clamp(14px,3vw,30px) 0",
            aspectRatio: "16/8",
            borderRadius: 24,
            overflow: "hidden",
            background: "var(--bg2)",
          }}
        >
          <Image src={photo} alt={altPhoto(photo)} fill sizes="(max-width: 900px) 100vw, 800px" style={{ objectFit: "cover" }} />
        </div>
      )}
      <article style={{ padding: `0 ${PAD} 56px` }}>
        {(contenu.avant ?? []).length > 0 && (
          <div style={{ paddingTop: 30 }}>
            {(contenu.avant ?? []).map((b, i) => (
              <Bloc key={`a${i}`} bloc={b} />
            ))}
          </div>
        )}
        {parties.map((p, si) => (
          <Partie key={p.titre} n={si} titre={p.titre}>
            {p.blocs.map((b, bi) => (
              <Bloc key={bi} bloc={b} />
            ))}
            {si === 2 && nbParties > 4 && (
              <div
                style={{
                  marginTop: 30,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "18px 18px 18px 22px",
                  borderRadius: 22,
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                }}
              >
                <span style={{ font: "600 15.5px/1.35 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)", maxWidth: "38ch" }}>
                  Besoin de bras pour appliquer cette méthode sur votre site ?
                </span>
                <Link href="/ressources/#rs-form" style={{ ...BOUTON, padding: "12px 18px", font: "600 13.5px var(--fb)" }}>
                  Décrire mon besoin →
                </Link>
              </div>
            )}
          </Partie>
        ))}
        {questions.length > 0 && (
          <Partie n={parties.length} titre={COPIE.faqSurtitre}>
            <div style={{ display: "grid", gap: 8, margin: "6px 0 10px" }}>
              {questions.map((q) => (
                <details key={q.question} name="faq-lecteur" className={s.faq} style={{ borderRadius: 20, overflow: "hidden" }}>
                  <summary
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 20px",
                      cursor: "pointer",
                      font: "600 15.5px/1.4 var(--ft)",
                      letterSpacing: "-.02em",
                      color: "var(--ink)",
                    }}
                  >
                    <span>{q.question}</span>
                    <span
                      className={s.plus}
                      aria-hidden="true"
                      style={{
                        flex: "none",
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        font: "400 19px/1 var(--fb)",
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <div style={{ padding: "0 20px 20px", font: "400 15px/1.7 var(--fb)", color: "var(--ink1)" }}>{texte(q.reponse)}</div>
                </details>
              ))}
            </div>
          </Partie>
        )}
        <Appel surtitre="Passer à l’action" titre="Un chargé d’affaires vous rappelle dans l’heure." />
        {suivant && (
          <Link
            href={suivant.url}
            scroll={false}
            className={s.suivant}
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "120px minmax(0,1fr)",
              gap: 18,
              alignItems: "center",
              padding: 12,
              borderRadius: 24,
              background: "var(--bg)",
              border: "1px solid var(--line)",
              textDecoration: "none",
            }}
          >
            <span style={{ position: "relative", display: "block", aspectRatio: "4/3", borderRadius: 16, overflow: "hidden", background: "var(--bg2)" }}>
              <Image src={suivant.photo} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
            </span>
            <span style={{ display: "grid", gap: 4 }}>
              <span
                style={{
                  font: "600 11px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--ink3)",
                }}
              >
                À lire ensuite
              </span>
              <span style={{ font: "600 17px/1.3 var(--ft)", letterSpacing: "-.025em", color: "var(--ink)" }}>{suivant.titre}</span>
            </span>
          </Link>
        )}
      </article>
    </>
  );
}
