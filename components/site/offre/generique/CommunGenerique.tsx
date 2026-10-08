import Link from "next/link";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";

import { css } from "./css";
import type { Vue } from "./types";
import h from "./Generique.module.css";

/**
 * Ce que les deux gabarits génériques de la maquette (« vente » et « édito »)
 * partagent mot pour mot : le fil d'Ariane, « Pages liées » et le formulaire
 * « Décrire mon besoin » de bas de page (`#cx-form`).
 */

const VERRE =
  "background:rgba(255,255,255,var(--gl-a));backdrop-filter:blur(var(--gl-b)) saturate(150%);-webkit-backdrop-filter:blur(var(--gl-b)) saturate(150%);border:1px solid var(--gbd);box-shadow:0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)";

export function Fil({ v }: { v: Vue }) {
  return (
    <div role="navigation" aria-label="Fil d'Ariane" style={css("display:flex;align-items:center;gap:8px;margin-bottom:24px;font:400 13px var(--fb);color:var(--ink4);flex-wrap:wrap")}>
      {v.cCrumbs.map((c) =>
        c.link ? (
          <span key={c.go} style={css("display:contents")}>
            <Link className={h.acc} href={c.go} prefetch={false} style={css("color:var(--ink4)")}><span>{c.label}</span></Link>
            <span aria-hidden="true">/</span>
          </span>
        ) : (
          <span key={c.go} aria-current="page" style={css("color:var(--ink1)")}><span>{c.label}</span></span>
        ),
      )}
    </div>
  );
}

export function Liees({ v }: { v: Vue }) {
  if (!v.cHasRelated) return null;
  return (
    <section style={css("padding:var(--sec) 0 0")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:0 40px")}>
        <div style={css("font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc);margin-bottom:14px")}>Pour aller plus loin</div>
        <h2 style={css("font:600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft);letter-spacing:-.04em;color:var(--ink);margin:0;text-wrap:balance;margin-bottom:26px")}>Pages liées</h2>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px")}>
          {v.cRelated.map((p) => (
            <Link key={p.go} className={h.leve3} href={p.go} prefetch={false} style={css(`display:flex;flex-direction:column;gap:10px;min-height:140px;padding:22px 24px;border-radius:var(--rad-s);${VERRE};transition:transform var(--tr)`)}>
              <span style={css("font:600 10px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:var(--acc)")}><span>{p.fam}</span></span>
              <span style={css("font:600 calc(16px * var(--ts))/1.35 var(--ft);letter-spacing:-.024em;color:var(--ink)")}><span>{p.h1}</span></span>
              <span style={css("font:600 12.5px var(--fb);color:var(--acc-ink);margin-top:auto")}>Lire →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * « Décrire mon besoin » : le formulaire de la maquette (tpl 3269), mêmes six
 * champs et même bouton « On me rappelle dans l'heure » que `FormulaireContact`,
 * qui le rend. Écart assumé : la mention RGPD sous le bouton (articles 13 et 14).
 */
export function Besoin({ formulaire }: { formulaire: string }) {
  return (
    <section id="cx-form" style={css("padding:var(--sec) 0 var(--sec);scroll-margin-top:90px")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:0 40px")}>
        <div className="mg-r2" style={css("display:grid;grid-template-columns:.85fr 1.15fr;gap:56px;align-items:start")}>
          <div>
            <div style={css("font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc);margin-bottom:16px")}>Décrire mon besoin</div>
            <h2 style={css("font:600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft);letter-spacing:-.04em;color:var(--ink);margin:0;text-wrap:balance;margin-bottom:18px;max-width:17ch")}>Un chargé d’affaires vous rappelle dans l’heure.</h2>
            <p style={css("font:400 16px/1.7 var(--fb);color:var(--ink2);margin:0 0 24px;max-width:42ch")}>Du lundi au vendredi, de 8&nbsp;h&nbsp;00 à 18&nbsp;h&nbsp;30. Nous qualifions le besoin et vous annonçons un délai de démarrage réaliste.</p>
          </div>
          <div style={css(`border-radius:var(--rad);padding:32px 34px 34px;${VERRE}`)}>
            <FormulaireContact formulaire={formulaire} variante="compact" />
          </div>
        </div>
      </div>
    </section>
  );
}
