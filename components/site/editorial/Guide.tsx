import Link from "next/link";
import { Fragment, type CSSProperties } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { VueGuide } from "@/types/editorial";

import BlocsGuide from "./BlocsGuide";
import styles from "./PageEditoriale.module.css";

/**
 * La vue « GUIDE » : le gabarit générique édito de la maquette
 * (`Migen - Site final.dc.html`, `cEdito`), qui sert `/ressources/` et les
 * deux guides de `/guides/`. Références : `maquette/rendu/ressources.html`,
 * `guides--choisir-une-entreprise-de-maintenance.html`,
 * `guides--reussir-un-transfert-industriel.html`.
 *
 * Quatre sections, dans l'ordre de la capture : héros, corps (sommaire
 * collant et sections numérotées), « Pages liées », formulaire `#cx-form`.
 * Les pages liées sont celles de la capture, portées par la donnée : le
 * maillage calculé en base n'y est pas monté (voir `Maillage.tsx`).
 *
 * Composant SERVEUR ; seul le formulaire partagé est client.
 */

const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
};
const PASTILLE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "#fff",
  background: "var(--acc)",
  padding: "5px 12px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};
const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
};
const TITRE2: CSSProperties = {
  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  textWrap: "balance",
};

const numero = (i: number) => String(i + 1).padStart(2, "0");
/** Le sommaire coupe les titres longs, règle de la maquette (`cxVals`). */
const court = (t: string) => (t.length > 54 ? `${t.slice(0, 52)}…` : t);

export default function Guide({ titre, vue }: { titre: string; vue: VueGuide }) {
  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 40px 0" }}>
          <nav
            aria-label="Fil d'Ariane"
            className={styles.ariane}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              font: "400 13px var(--fb)",
              color: "var(--ink4)",
              flexWrap: "wrap",
            }}
          >
            {vue.ariane.map((maillon) =>
              maillon.href ? (
                <Fragment key={maillon.label}>
                  <Link href={maillon.href} prefetch={false} style={{ color: "var(--ink4)" }}>
                    {maillon.label}
                  </Link>
                  <span aria-hidden="true">/</span>
                </Fragment>
              ) : (
                <span key={maillon.label} aria-current="page" style={{ color: "var(--ink1)" }}>
                  {maillon.label}
                </span>
              ),
            )}
          </nav>
          <div style={{ maxWidth: 860 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={PASTILLE}>{vue.format}</span>
              <span
                style={{
                  ...PASTILLE,
                  letterSpacing: ".1em",
                  color: "var(--ink3)",
                  background: "var(--chip)",
                }}
              >
                {vue.lecture}
              </span>
            </div>
            <h1
              style={{
                font: "600 calc(clamp(32px,3.9vw,56px) * var(--ts))/1.05 var(--ft)",
                letterSpacing: "-.045em",
                color: "var(--ink)",
                margin: 0,
                maxWidth: "20ch",
                textWrap: "balance",
              }}
            >
              {titre}
            </h1>
            <p
              className={styles.riche}
              style={{
                font: "400 18px/1.7 var(--fb)",
                color: "var(--ink1)",
                margin: "22px 0 0",
                maxWidth: "60ch",
                textWrap: "pretty",
              }}
            >
              <TexteRiche texte={vue.chapeau} />
            </p>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 40px 0" }}>
          <div
            className="cx-lay"
            style={{ display: "grid", gridTemplateColumns: "230px minmax(0,1fr)", gap: 60, alignItems: "start" }}
          >
            <aside className="cx-toc" style={{ position: "sticky", top: 112 }}>
              <div
                style={{
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  marginBottom: 14,
                }}
              >
                Sur cette page
              </div>
              <nav
                aria-label="Sur cette page"
                style={{ display: "grid", gap: 2, borderLeft: "1px solid var(--line)" }}
              >
                {vue.sections.map((s, i) => (
                  <a
                    key={s.titre}
                    href={`#c${i + 1}`}
                    className={styles.entreeSommaire}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "8px 0 8px 16px",
                      marginLeft: -1,
                      borderLeft: "1px solid transparent",
                      font: "500 13px/1.45 var(--fb)",
                      color: "var(--ink2)",
                    }}
                  >
                    <span
                      style={{
                        font: "600 10.5px ui-monospace,Menlo,monospace",
                        color: "var(--acc)",
                        flex: "none",
                        paddingTop: 2,
                      }}
                    >
                      {numero(i)}
                    </span>
                    <span>{court(s.titre)}</span>
                  </a>
                ))}
              </nav>
              <a
                href="#cx-form"
                className={styles.boutonPlein}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 24,
                  padding: 13,
                  borderRadius: 999,
                  background: "var(--acc)",
                  color: "#fff",
                  font: "600 13.5px var(--fb)",
                }}
              >
                Décrire mon besoin
              </a>
            </aside>
            <article style={{ minWidth: 0 }}>
              {vue.intro.length > 0 ? (
                <div style={{ marginBottom: 48 }}>
                  <BlocsGuide blocs={vue.intro} groupe="intro" />
                </div>
              ) : null}
              {vue.sections.map((s, i) => (
                <section key={s.titre} id={`c${i + 1}`} style={{ scrollMarginTop: 100, paddingBottom: 56 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 20 }}>
                    <span
                      style={{
                        font: "600 12px ui-monospace,Menlo,monospace",
                        letterSpacing: ".06em",
                        color: "var(--acc)",
                        flex: "none",
                      }}
                    >
                      {numero(i)}
                    </span>
                    <h2
                      style={{
                        font: "600 calc(clamp(23px,2.5vw,34px) * var(--ts))/1.14 var(--ft)",
                        letterSpacing: "-.036em",
                        color: "var(--ink)",
                        margin: 0,
                        maxWidth: "28ch",
                        textWrap: "balance",
                      }}
                    >
                      {s.titre}
                    </h2>
                  </div>
                  <BlocsGuide blocs={s.blocs} groupe={`faq-c${i + 1}`} />
                </section>
              ))}
            </article>
          </div>
        </section>

        {vue.liees.length > 0 ? (
          <section style={{ padding: "var(--sec) 0 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
              <div style={{ ...SURTITRE, marginBottom: 14 }}>Pour aller plus loin</div>
              <h2 style={{ ...TITRE2, margin: "0 0 26px" }}>Pages liées</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 12 }}>
                {vue.liees.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    prefetch={false}
                    className={styles.carteLiee}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      minHeight: 140,
                      padding: "22px 24px",
                      borderRadius: "var(--rad-s)",
                      ...VERRE,
                      transition: "transform var(--tr)",
                    }}
                  >
                    <span
                      style={{
                        font: "600 10px var(--fb)",
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        color: "var(--acc)",
                      }}
                    >
                      {page.famille}
                    </span>
                    <span
                      style={{
                        font: "600 calc(16px * var(--ts))/1.35 var(--ft)",
                        letterSpacing: "-.024em",
                        color: "var(--ink)",
                      }}
                    >
                      {page.titre}
                    </span>
                    <span style={{ font: "600 12.5px var(--fb)", color: "var(--acc-ink)", marginTop: "auto" }}>
                      Lire →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="cx-form" style={{ padding: "var(--sec) 0 var(--sec)", scrollMarginTop: 90 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
            <div
              className="mg-r2"
              style={{ display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: 56, alignItems: "start" }}
            >
              <div>
                <div style={{ ...SURTITRE, marginBottom: 16 }}>Décrire mon besoin</div>
                <h2 style={{ ...TITRE2, margin: "0 0 18px", maxWidth: "17ch" }}>
                  Un chargé d’affaires vous rappelle dans l’heure.
                </h2>
                <p
                  style={{
                    font: "400 16px/1.7 var(--fb)",
                    color: "var(--ink2)",
                    margin: "0 0 24px",
                    maxWidth: "42ch",
                  }}
                >
                  Du lundi au vendredi, de 8&nbsp;h&nbsp;00 à 18&nbsp;h&nbsp;30. Nous qualifions le besoin et vous
                  annonçons un délai de démarrage réaliste.
                </p>
              </div>
              <div style={{ borderRadius: "var(--rad)", padding: "32px 34px 34px", ...VERRE }}>
                <FormulaireContact formulaire={vue.formulaire} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
