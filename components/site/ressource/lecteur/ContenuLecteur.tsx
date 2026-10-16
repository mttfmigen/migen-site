import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { BlocMaquette } from "@/lib/ressources-maquette";

import { EnLigne } from "../CorpsRessource";
import type { BlocLecteur, Lecture } from "./lecture";
import s from "./lecteur.module.css";

/**
 * Le corps du lecteur latéral, gabarit EXACT de la maquette « Ressources v2 »
 * (aside `rs-sheet`, `rd` et `blk()` de son rendu), dans cet ordre :
 *   fil « Ressources / kind / theme » · H1 · chapeau · pastilles (minutes,
 *   parties, « Écrit par nos équipes terrain ») · photo 16/8 · sections
 *   numérotées 01… et leurs blocs (p, h, call, ul en cartes ou en liste,
 *   steps, stats, bar, tb, faq) · appel du milieu à la fin de la section 03
 *   · bloc sombre de fin · « À lire ensuite ».
 * Le texte vient de `Lecture` (`lecture.ts`) : la donnée de la maquette, ou
 * la page pour les billets repris qu'elle n'a pas. Rien n'est ajouté ici
 * que la maquette n'écrive elle-même.
 */

const ORANGE = "#ff7c3c";
const MONO = "ui-monospace,Menlo,monospace";
const PAD = "clamp(22px,5vw,60px)";
const LIEN: CSSProperties = { fontWeight: 600, color: "var(--ink)", textDecoration: "underline", textDecorationColor: "rgba(255,124,60,.55)" };
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
  cursor: "pointer",
};
const CARTE: CSSProperties = { borderRadius: 20, background: "var(--bg)", border: "1px solid var(--line)" };

/** Les appels de la maquette, mot pour mot (`midT`, `ctaK`, `ctaT`, `ctaL`), par espace. */
const APPELS = {
  ent: {
    milieu: "Besoin de bras pour appliquer cette méthode sur votre site ?",
    surtitre: "Passer à l’action",
    titre: "Un chargé d’affaires vous rappelle dans l’heure.",
    bouton: "Décrire mon besoin →",
    href: "/ressources/#rs-form",
  },
  tech: {
    milieu: "Ce métier vous ressemble ?",
    surtitre: "Ce métier vous ressemble ?",
    titre: "Rejoignez les 120 collaborateurs de migen.",
    bouton: "Postuler →",
    href: "/ressources/#postuler",
  },
} as const;

const deuxChiffres = (n: number) => String(n + 1).padStart(2, "0");
const texte = (t: string) => <EnLigne texte={t} lien={LIEN} />;

/** `bal()` de la maquette : colonnes équilibrées, la dernière carte seule s'étale. */
function equilibre(n: number, max: number): { cols: string; large: boolean } {
  let c: number;
  if (n <= 1) c = 1;
  else if (n <= max) c = n === 4 && max === 3 ? 2 : n;
  else c = [max === 4 ? 4 : 3, 3, 2].find((k) => n % k === 0) ?? (n % 3 !== 1 ? 3 : n % 2 === 0 ? 2 : 3);
  return { cols: `repeat(${c},minmax(0,1fr))`, large: n > c && n % c === 1 };
}

type Items = { h?: string; d: string }[];

/** `ul` : cartes numérotées si 60 % des entrées ont un titre, sinon liste à pastilles. */
function Puces({ items }: { items: Items }) {
  const enCartes = items.length >= 2 && items.filter((i) => i.h).length >= Math.ceil(items.length * 0.6);
  if (!enCartes) {
    return (
      <div style={{ display: "grid", gap: 10, margin: "4px 0 18px" }}>
        {items.map((i, j) => (
          <div key={j} style={{ display: "flex", gap: 12, font: "400 15.5px/1.65 var(--fb)", color: "var(--ink1)" }}>
            <span style={{ flex: "none", width: 6, height: 6, borderRadius: 999, background: ORANGE, marginTop: 11 }} />
            <span>{texte(i.h ? `${i.h} : ${i.d}` : i.d)}</span>
          </div>
        ))}
      </div>
    );
  }
  const b = equilibre(items.length, 3);
  return (
    <div className={s.bal} style={{ display: "grid", gridTemplateColumns: b.cols, gap: 10, margin: "6px 0 20px" }}>
      {items.map((i, j) => (
        <div key={j} style={{ ...CARTE, gridColumn: b.large && j === items.length - 1 ? "1 / -1" : "auto", padding: "18px 20px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ flex: "none", font: `600 11px ${MONO}`, color: ORANGE }}>{deuxChiffres(j)}</span>
            <span style={{ font: "600 15px/1.3 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)" }}>{i.h ?? ""}</span>
          </div>
          <div style={{ font: "400 14px/1.6 var(--fb)", color: "var(--ink1)", marginTop: 8 }}>{texte(i.d)}</div>
        </div>
      ))}
    </div>
  );
}

function Etapes({ items }: { items: Items }) {
  return (
    <div style={{ margin: "10px 0 18px", display: "grid" }}>
      {items.map((i, j) => (
        <div key={j} style={{ position: "relative", display: "grid", gridTemplateColumns: "36px minmax(0,1fr)", gap: 16, paddingBottom: 20 }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 17,
              top: 40,
              bottom: 2,
              width: 2,
              borderRadius: 2,
              background: "var(--line)",
              display: j < items.length - 1 ? "block" : "none",
            }}
          />
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
            {i.h && <div style={{ font: "600 15.5px/1.3 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)", marginBottom: 4 }}>{i.h}</div>}
            <div style={{ font: "400 14.5px/1.6 var(--fb)", color: "var(--ink1)" }}>{texte(i.d)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Chiffres({ items }: { items: Items }) {
  const b = equilibre(items.length, 4);
  return (
    <div className={s.bal} style={{ display: "grid", gridTemplateColumns: b.cols, gap: 10, margin: "6px 0 20px" }}>
      {items.map((i, j) => (
        <div key={j} style={{ ...CARTE, gridColumn: b.large && j === items.length - 1 ? "1 / -1" : "auto", padding: 20 }}>
          <div style={{ font: "600 32px/1 var(--ft)", letterSpacing: "-.05em", color: ORANGE }}>{i.h}</div>
          <div style={{ font: "400 13.5px/1.5 var(--fb)", color: "var(--ink1)", marginTop: 10 }}>{i.d}</div>
        </div>
      ))}
    </div>
  );
}

function Barres({ bloc }: { bloc: Extract<BlocMaquette, { k: "bar" }> }) {
  return (
    <div style={{ ...CARTE, borderRadius: 22, margin: "8px 0 14px", padding: "24px 24px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <span style={{ font: "600 11px var(--fb)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink2)" }}>{bloc.title}</span>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {bloc.items.map((i, j) => (
          <div key={j} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "7px 14px", alignItems: "center" }}>
            <span style={{ font: "500 13.5px/1.35 var(--fb)", color: "var(--ink1)" }}>{i.l}</span>
            <span style={{ font: "600 13.5px var(--fb)", color: "var(--ink)", textAlign: "right" }}>{i.v}</span>
            <span style={{ gridColumn: "1 / -1", height: 10, borderRadius: 999, background: "var(--chip)", overflow: "hidden" }}>
              <span className={s.barre} style={{ display: "block", height: "100%", borderRadius: 999, background: ORANGE, width: `${i.w}%` }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tableau({ entetes, lignes }: { entetes: string[]; lignes: string[][] }) {
  const n = Math.max(entetes.length, ...lignes.map((r) => r.length));
  const colonnes = Array.from({ length: n }, (_, c) => c);
  const cellule = (t: string | undefined, entete: boolean, premiere: boolean, cle: string) => (
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
      {t ?? ""}
    </div>
  );
  return (
    <div className={s.defile} style={{ margin: "6px 0 22px", overflowX: "auto", borderRadius: 20, border: "1px solid var(--line)" }}>
      <div style={{ display: "grid", minWidth: n * 150, gridTemplateColumns: `repeat(${n},minmax(150px,1fr))` }}>
        {/* Un billet repris sans en-tête n'a pas de ligne d'en-tête vide ; la maquette en a toujours une. */}
        {entetes.some(Boolean) && colonnes.map((c) => cellule(entetes[c], true, false, `e${c}`))}
        {lignes.flatMap((r, i) => colonnes.map((c) => cellule(r[c], false, c === 0, `${i}-${c}`)))}
      </div>
    </div>
  );
}

/** FAQ : `<details>` natif ; le même `name` partout, une seule question ouverte dans tout le lecteur. */
function Questions({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div style={{ display: "grid", gap: 8, margin: "6px 0 10px" }}>
      {items.map((q, j) => (
        <details key={j} name="faq-lecteur" className={s.faq} style={{ borderRadius: 20, overflow: "hidden" }}>
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
            {q.q}
            <span
              className={s.plus}
              aria-hidden="true"
              style={{ flex: "none", width: 30, height: 30, borderRadius: 999, display: "grid", placeItems: "center", font: "400 19px/1 var(--fb)" }}
            >
              +
            </span>
          </summary>
          <div style={{ padding: "0 20px 20px", font: "400 15px/1.7 var(--fb)", color: "var(--ink1)" }}>{texte(q.a)}</div>
        </details>
      ))}
    </div>
  );
}

function Bloc({ bloc }: { bloc: BlocLecteur }): ReactNode {
  switch (bloc.k) {
    case "p":
      return <p style={{ font: "400 16.5px/1.78 var(--fb)", color: "var(--ink1)", margin: "0 0 16px", textWrap: "pretty" }}>{texte(bloc.t)}</p>;
    case "h":
      return <h3 style={{ font: "600 17px/1.35 var(--ft)", letterSpacing: "-.02em", margin: "24px 0 8px", color: "var(--ink)" }}>{bloc.t}</h3>;
    case "call":
      return (
        <div style={{ margin: "8px 0 20px", padding: "20px 22px", borderRadius: 20, background: "var(--accw)" }}>
          <div style={{ font: "600 11px var(--fb)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--acci)", marginBottom: 8 }}>
            {bloc.label}
          </div>
          <div style={{ font: "500 15.5px/1.6 var(--fb)", color: "var(--ink)" }}>{texte(bloc.t)}</div>
        </div>
      );
    case "ul":
      return <Puces items={bloc.items} />;
    case "steps":
      return <Etapes items={bloc.items} />;
    case "stats":
      return <Chiffres items={bloc.items} />;
    case "bar":
      return <Barres bloc={bloc} />;
    case "tb":
      return <Tableau entetes={bloc.h} lignes={bloc.r} />;
    case "faq":
      return <Questions items={bloc.items} />;
    case "galerie":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, margin: "8px 0 22px" }}>
          {bloc.images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.largeur}
              height={image.hauteur}
              sizes="(max-width: 900px) 50vw, 260px"
              style={{ width: "100%", height: "auto", borderRadius: 16 }}
            />
          ))}
        </div>
      );
  }
}

export default function ContenuLecteur({ lecture }: { lecture: Lecture }) {
  const appel = APPELS[lecture.tech ? "tech" : "ent"];
  const { secs } = lecture;
  return (
    <>
      <header style={{ padding: `36px ${PAD} 0` }}>
        {lecture.kind && lecture.theme && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, font: "500 12.5px var(--fb)", color: "var(--ink3)" }}>
            <span>Ressources</span>
            <span>/</span>
            <span>{lecture.kind}</span>
            <span>/</span>
            <span style={{ color: ORANGE, fontWeight: 600 }}>{lecture.theme}</span>
          </div>
        )}
        <h1 style={{ font: "600 clamp(32px,4.2vw,52px)/1.02 var(--ft)", letterSpacing: "-.055em", margin: "16px 0 18px", textWrap: "balance" }}>
          {lecture.h1}
        </h1>
        {lecture.lead.map((p, i) => (
          <p
            key={i}
            style={{ font: "400 18.5px/1.65 var(--fb)", color: "var(--ink1)", margin: i ? "12px 0 0" : 0, maxWidth: "62ch", textWrap: "pretty" }}
          >
            {texte(p)}
          </p>
        ))}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
          {lecture.min ? <span style={CHIP}>{lecture.min} min de lecture</span> : null}
          {/* Masqué au téléphone (`data-doublon-mobile`, app/globals.css) :
              plus aucun compteur de parties à cette largeur (Mehdi, 16/10).
              Le lecteur de bureau garde sa rangée telle quelle. */}
          <span data-doublon-mobile="" style={CHIP}>{secs.length} parties</span>
          <span style={CHIP}>Écrit par nos équipes terrain</span>
        </div>
      </header>
      {lecture.photo && (
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
          <Image src={lecture.photo.src} alt={lecture.photo.alt} fill sizes="(max-width: 900px) 100vw, 800px" style={{ objectFit: "cover" }} />
        </div>
      )}
      <article style={{ padding: `0 ${PAD} 56px` }}>
        {secs.map((sec, si) => (
          <section key={si} style={{ paddingTop: 46 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16 }}>
              <span style={{ flex: "none", font: `600 12px ${MONO}`, color: ORANGE }}>{deuxChiffres(si)}</span>
              <h2 style={{ font: "600 clamp(22px,2.2vw,27px)/1.2 var(--ft)", letterSpacing: "-.035em", margin: 0, textWrap: "balance" }}>{sec.t}</h2>
            </div>
            {sec.b.map((b, bi) => (
              <Bloc key={bi} bloc={b} />
            ))}
            {si === 2 && secs.length > 4 && (
              <div
                style={{
                  ...CARTE,
                  borderRadius: 22,
                  marginTop: 30,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "18px 18px 18px 22px",
                }}
              >
                <span style={{ font: "600 15.5px/1.35 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)", maxWidth: "38ch" }}>{appel.milieu}</span>
                <Link href={appel.href} style={{ ...BOUTON, padding: "12px 18px", font: "600 13.5px var(--fb)" }}>
                  {appel.bouton}
                </Link>
              </div>
            )}
          </section>
        ))}
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
            <div style={{ font: "600 11px var(--fb)", letterSpacing: ".12em", textTransform: "uppercase", color: ORANGE, marginBottom: 8 }}>
              {appel.surtitre}
            </div>
            <div style={{ font: "600 21px/1.2 var(--ft)", letterSpacing: "-.03em", maxWidth: "24ch" }}>{appel.titre}</div>
          </div>
          <Link href={appel.href} style={{ ...BOUTON, position: "relative", padding: "14px 22px", font: "600 14.5px var(--fb)" }}>
            {appel.bouton}
          </Link>
        </div>
        <Link
          href={lecture.suivante.url}
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
            <Image src={lecture.suivante.photo} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
          </span>
          <span style={{ display: "grid", gap: 4 }}>
            <span style={{ font: "600 11px var(--fb)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink3)" }}>À lire ensuite</span>
            <span style={{ font: "600 17px/1.3 var(--ft)", letterSpacing: "-.025em", color: "var(--ink)" }}>{lecture.suivante.h1}</span>
          </span>
        </Link>
      </article>
    </>
  );
}
