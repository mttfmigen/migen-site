import { Fragment } from "react";

import { css } from "./css";
import Segs from "./Segs";
import type { Bloc } from "./types";
import h from "./Generique.module.css";

/**
 * Les blocs de LECTURE des gabarits génériques de la maquette : ceux de la page
 * « édito » (chapô, sections numérotées, « Lire la suite ») et ceux des
 * réponses de la FAQ de la page « vente ». Même balisage aux deux endroits dans
 * la maquette, recopié de son gabarit (écran `cEdito`, boucle `cIntro`) ; seuls
 * les types de bloc que nos pages produisent sont portés, la porte
 * `verification-offre.tsx` refuse une fiche qui en demanderait un autre.
 */

export const GRAS = css("font-weight:600;color:var(--ink)");
export const LIEN = css("color:var(--acc-ink);text-decoration:underline;text-decoration-color:rgba(255,124,60,.4);text-underline-offset:3px");
const VERRE =
  "background:rgba(255,255,255,var(--gl-a));backdrop-filter:blur(var(--gl-b)) saturate(150%);-webkit-backdrop-filter:blur(var(--gl-b)) saturate(150%);border:1px solid var(--gbd);box-shadow:0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)";

/** Les types de bloc que ce fichier sait rendre. */
export const BLOCS_LECTURE = ["isP", "isH3", "isCards", "isOlRows", "isQuote", "isCta", "isLinkCard", "isDuo", "isTable", "isBento", "isFaqItem"] as const;

export function Duo({ b }: { b: Bloc }) {
  return (
    <div style={css(`margin:8px 0 26px;border-radius:var(--rad);overflow:hidden;${VERRE}`)}>
      {(b.duo ?? []).map((d, i) => (
        <div key={i} className="mg-r2" style={css("display:grid;grid-template-columns:44px minmax(0,1.05fr) minmax(0,.95fr);gap:24px;padding:20px 26px;align-items:start;border-top:1px solid var(--line)")}>
          <span style={css("font:600 11px ui-monospace,Menlo,monospace;color:var(--acc-ink);padding-top:3px")}><span>{d.n}</span></span>
          <div style={css("font:400 14.5px/1.62 var(--fb);color:var(--ink1)")}>
            <Segs segs={d.l} gras={GRAS} lien={css("font-weight:600;color:var(--ink);text-decoration:underline;text-decoration-color:rgba(255,124,60,.55);text-underline-offset:3px")} survol={h.acc} />
          </div>
          <div style={css("display:flex;gap:11px;align-items:flex-start;padding:12px 15px;border-radius:14px;background:var(--acc-w)")}>
            <span style={css("color:var(--acc-ink);font:600 14px var(--fb);flex:none")}>→</span>
            <span style={css("font:500 14px/1.55 var(--fb);color:var(--ink)")}>
              <Segs segs={d.r} gras={css("font-weight:600")} lien={css("font-weight:600;color:var(--acc-ink)")} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Bento({ b }: { b: Bloc }) {
  return (
    <div className="mg-bento2" style={css(b.gridCss ?? "")}>
      {(b.items ?? []).map((it, i) => (
        <div key={i} style={css(it.cellCss ?? "")}>
          <span style={css("font:600 11px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:var(--acc-ink)")}><span>{it.n}</span></span>
          <div>
            <div style={css(it.titleCss ?? "")}>
              {it.hasHref ? (
                <a className={h.acc} href={it.go ?? it.href} style={css("color:inherit;text-decoration:none")}><span>{it.title}</span> →</a>
              ) : (
                <span>{it.title}</span>
              )}
            </div>
            <div style={css(it.txtCss ?? "")}>
              <Segs segs={it.segs} gras={css("font-weight:600;color:inherit")} lien={css("color:var(--acc-ink);text-decoration:underline;text-underline-offset:3px")} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Question({ b, groupe }: { b: Bloc; groupe: string }) {
  return (
    <details className={`cx-faq mg-faqd ${h.question}`} name={groupe} open={b.open} style={css(`margin:0 0 10px;${VERRE};border-radius:var(--rad-s)`)}>
      <summary style={css("list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:20px 24px")}>
        <span style={css("font:600 calc(16px * var(--ts))/1.4 var(--ft);letter-spacing:-.022em;color:var(--ink)")}><span>{b.q}</span></span>
        <span className={`cx-plus mg-faqi ${h.plus}`} style={css("display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;flex:none;font:400 20px/1 var(--fb);transition:transform var(--tr),background var(--tr);background:var(--chip);color:var(--ink2)")}>+</span>
      </summary>
      <p style={css("font:400 15px/1.7 var(--fb);color:var(--ink2);margin:0;padding:0 24px 22px;max-width:68ch")}>
        <Segs segs={b.a} gras={GRAS} lien={css("font-weight:600;color:var(--ink);text-decoration:underline;text-decoration-color:rgba(255,124,60,.55)")} survol={h.acc} />
      </p>
    </details>
  );
}

/** Un bloc de lecture. `groupe` regroupe les questions : une seule ouverte à la fois (README). */
export function BlocLecture({ b, groupe = "" }: { b: Bloc; groupe?: string }) {
  if (b.isFaqItem) return <Question b={b} groupe={groupe} />;
  if (b.isP)
    return (
      <p style={css("font:400 16px/1.8 var(--fb);color:var(--ink1);margin:0 0 16px;max-width:70ch;text-wrap:pretty")}>
        <Segs segs={b.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
      </p>
    );
  if (b.isH3) return <h3 style={css("font:600 calc(18.5px * var(--ts))/1.3 var(--ft);letter-spacing:-.028em;color:var(--ink);margin:28px 0 10px")}><span>{b.text}</span></h3>;
  if (b.isCards)
    return (
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:8px 0 26px")}>
        {(b.items ?? []).map((it, i) => (
          <div key={i} style={css(`border-radius:var(--rad-s);padding:24px 24px 26px;${VERRE}`)}>
            <div style={css("font:600 10.5px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:var(--acc-ink);margin-bottom:12px")}><span>{it.n}</span></div>
            <div style={css("font:600 calc(16px * var(--ts))/1.35 var(--ft);letter-spacing:-.024em;color:var(--ink);margin-bottom:8px")}><span>{it.title}</span></div>
            <div style={css("font:400 14px/1.65 var(--fb);color:var(--ink2)")}>
              <Segs segs={it.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
            </div>
          </div>
        ))}
      </div>
    );
  if (b.isOlRows)
    return (
      <div style={css("margin:12px 0 26px;max-width:820px")}>
        {(b.items ?? []).map((it, i) => (
          <div key={i} style={css("display:grid;grid-template-columns:48px minmax(0,1fr);gap:22px")}>
            <div style={css("display:flex;flex-direction:column;align-items:center")}>
              <span style={css("display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:999px;background:var(--acc);color:var(--sur-acc);font:600 13.5px var(--fb);flex:none;box-shadow:0 8px 20px -10px rgba(255,124,60,.8)")}><span>{it.n}</span></span>
              <span style={css(it.railCss ?? "")}></span>
            </div>
            <div style={css("padding:9px 0 32px")}>
              {it.hasTitle ? (
                <div style={css("font:600 calc(17.5px * var(--ts))/1.35 var(--ft);letter-spacing:-.026em;color:var(--ink);margin-bottom:8px")}><span>{it.title}</span></div>
              ) : null}
              <div style={css("font:400 15px/1.75 var(--fb);color:var(--ink2);max-width:66ch")}>
                <Segs segs={it.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  if (b.isQuote)
    return (
      <div style={css("display:flex;gap:16px;margin:22px 0 30px;max-width:64ch")}>
        {/* Le grand guillemet est LU par un lecteur d'écran : il tient donc
            le plancher comme le reste. 2,29:1 en `--acc` sur le crème,
            7,98:1 en `--acc-ink` ; dans un panneau anthracite le même jeton
            vaut #ffb48a (voir `.panneauSombre`), soit 9,96:1. */}
        <span style={css("font:600 50px/.85 var(--ft);color:var(--acc-ink);flex:none")}>“</span>
        <p style={css("font:500 calc(18.5px * var(--ts))/1.55 var(--ft);letter-spacing:-.018em;color:var(--ink);margin:0;padding-top:4px")}>
          <Segs segs={b.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
        </p>
      </div>
    );
  if (b.isCta)
    return (
      <div style={css(`display:flex;align-items:center;justify-content:space-between;gap:22px;flex-wrap:wrap;margin:10px 0 24px;padding:24px 28px;border-radius:var(--rad);${VERRE}`)}>
        <p style={css("font:400 15px/1.65 var(--fb);color:var(--ink1);margin:0;flex:1;min-width:240px;max-width:62ch")}>
          <Segs segs={b.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
        </p>
        <div style={css("display:flex;gap:10px;flex:none;flex-wrap:wrap")}>
          <a className={h.boutonPlat} href="#cx-form" style={css("display:inline-flex;padding:12px 22px;border-radius:999px;background:var(--acc);color:var(--sur-acc);font:600 14px var(--fb);white-space:nowrap")}>Décrire mon besoin</a>
        </div>
      </div>
    );
  if (b.isLinkCard)
    return (
      <a className={h.leve2} href={b.go ?? "#"} style={css(`display:flex;align-items:center;justify-content:space-between;gap:18px;margin:8px 0 22px;padding:20px 24px;border-radius:var(--rad-s);${VERRE};transition:transform var(--tr)`)}>
        <span style={css("font:600 calc(16px * var(--ts))/1.4 var(--ft);letter-spacing:-.022em;color:var(--ink)")}><span>{b.title}</span></span>
        <span style={css("display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:var(--acc);color:var(--sur-acc);font:600 15px var(--fb);flex:none")}>→</span>
      </a>
    );
  if (b.isDuo) return <Duo b={b} />;
  if (b.isTable)
    return (
      <div style={css(`margin:8px 0 26px;border-radius:var(--rad-s);overflow:auto;${VERRE}`)}>
        <table style={css("width:100%;border-collapse:collapse;min-width:540px")}>
          <thead>
            <tr>
              {(b.head ?? []).map((c, i) => (
                <th key={i} style={css(c.css)}><span>{c.t}</span></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(b.rows ?? []).map((r, i) => (
              <tr key={i}>
                {r.cells.map((c, j) => (
                  <td key={j} style={css(c.css)}>
                    <Segs segs={c.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if (b.isBento) return <Bento b={b} />;
  return null;
}

/** Une suite de blocs de lecture. */
export function BlocsLecture({ blocs, groupe }: { blocs: Bloc[]; groupe?: string }) {
  return (
    <>
      {blocs.map((b, i) => (
        <Fragment key={i}>
          <BlocLecture b={b} groupe={groupe} />
        </Fragment>
      ))}
    </>
  );
}
