import { css } from "./css";
import { Bento, Duo, GRAS, LIEN } from "./BlocsLecture";
import Segs from "./Segs";
import type { Bloc, Interne } from "./types";
import h from "./Generique.module.css";

/**
 * Les blocs des sections numérotées de la page « vente » de la maquette
 * (écran `cVente`, boucle `sec.head`). Recopiés de son gabarit ; seuls les
 * types que nos pages produisent sont portés (voir `BLOCS_VENTE`).
 */

const VERRE =
  "background:rgba(255,255,255,var(--gl-a));backdrop-filter:blur(var(--gl-b)) saturate(150%);-webkit-backdrop-filter:blur(var(--gl-b)) saturate(150%);border:1px solid var(--gbd);box-shadow:0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)";
const VERRE_SOUS =
  "background:rgba(255,255,255,var(--gl-a));backdrop-filter:blur(var(--gl-b)) saturate(150%);-webkit-backdrop-filter:blur(var(--gl-b)) saturate(150%);border:1px solid var(--gbd);box-shadow:0 1px 1px rgba(0,0,0,.04),0 20px 46px -32px rgba(0,0,0,.3)";

export const BLOCS_VENTE = ["isP", "isCards", "isRows", "isCta", "isDuo", "isBento", "isSub", "isSubGrid"] as const;
export const INTERNES_VENTE = ["p", "ult", "tb", "lk"] as const;

/** Un bloc d'une sous-partie (H3) : paragraphe, liste titrée, tableau, lien. */
function Interne({ x }: { x: Interne }) {
  if (x.p)
    return (
      <p style={css("font:400 14.5px/1.7 var(--fb);color:var(--ink2);margin:0 0 12px;text-wrap:pretty")}>
        <Segs segs={x.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
      </p>
    );
  if (x.ult)
    return (
      <div style={css("display:grid;gap:0;margin:2px 0 14px")}>
        {(x.items ?? []).map((it, i) => (
          <div key={i} style={css("padding:11px 0;border-top:1px solid var(--line)")}>
            <div style={css("font:600 14px/1.4 var(--ft);letter-spacing:-.015em;color:var(--ink);margin-bottom:3px")}><span>{it.title}</span></div>
            <div style={css("font:400 13.5px/1.6 var(--fb);color:var(--ink2)")}>
              <Segs segs={it.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
            </div>
          </div>
        ))}
      </div>
    );
  if (x.tb)
    return (
      <div style={css("overflow-x:auto;margin:4px 0 14px;border-radius:var(--rad-s);border:1px solid var(--line)")}>
        <table style={css("width:100%;border-collapse:collapse;font:400 13.5px/1.55 var(--fb);color:var(--ink2)")}>
          <thead>
            <tr>
              {(x.head ?? []).map((c, i) => (
                <th key={i} style={css("text-align:left;padding:10px 12px;font:600 10px var(--fb);letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);border-bottom:1px solid var(--line)")}><span>{c.t}</span></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(x.rows ?? []).map((r, i) => (
              <tr key={i}>
                {r.cells.map((c, j) => (
                  <td key={j} style={css("padding:10px 12px;vertical-align:top;border-bottom:1px solid var(--line)")}>
                    <Segs segs={c.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if (x.lk)
    return (
      <a className={h.acc} href={x.go ?? "#"} style={css("display:inline-flex;font:600 13.5px var(--fb);color:var(--acc-ink);margin:2px 0 12px")}><span>{x.title}</span> →</a>
    );
  return null;
}

export function BlocVente({ b }: { b: Bloc }) {
  if (b.isP)
    return (
      <p style={css("font:400 16px/1.75 var(--fb);color:var(--ink1);margin:0 0 16px;max-width:66ch;text-wrap:pretty")}>
        <Segs segs={b.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
      </p>
    );
  if (b.isCards)
    return (
      <div className="mg-rmulti" style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:6px 0 24px")}>
        {(b.items ?? []).map((it, i) => (
          <div key={i} style={css(`${VERRE};border-radius:var(--rad);padding:24px 24px 26px`)}>
            <div style={css("display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px")}>
              <span style={css("width:34px;height:34px;border-radius:10px;background:var(--acc-w);color:var(--acc-ink);display:flex;align-items:center;justify-content:center;font:600 13px var(--fb)")}><span>{it.n}</span></span>
            </div>
            <div style={css("font:600 calc(17px * var(--ts))/1.3 var(--ft);letter-spacing:-.025em;color:var(--ink);margin-bottom:8px")}><span>{it.title}</span></div>
            <div style={css("font:400 14.5px/1.6 var(--fb);color:var(--ink2)")}>
              <Segs segs={it.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
            </div>
          </div>
        ))}
      </div>
    );
  if (b.isRows)
    return (
      <div className="mg-r2" style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0 24px")}>
        {(b.items ?? []).map((it, i) => (
          <div key={i} style={css(`${VERRE};border-radius:var(--rad-s);padding:20px 22px;display:flex;gap:14px`)}>
            <span style={css("width:8px;height:8px;border-radius:999px;background:var(--acc);flex:none;margin-top:7px")}></span>
            <div>
              <div style={css("font:600 15.5px/1.35 var(--ft);letter-spacing:-.02em;color:var(--ink);margin-bottom:6px")}><span>{it.title}</span></div>
              <div style={css("font:400 14px/1.6 var(--fb);color:var(--ink2)")}>
                <Segs segs={it.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  if (b.isCta)
    return (
      <div style={css("margin:26px 0;border-radius:var(--rad);background:#1c1b19;padding:24px 26px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;position:relative;overflow:hidden")}>
        <div style={css("position:absolute;width:300px;height:300px;right:-120px;top:-150px;background:radial-gradient(circle,rgba(255,124,60,.3),transparent 68%);pointer-events:none")}></div>
        <p style={css("position:relative;font:500 16px/1.55 var(--fb);color:rgba(255,255,255,.86);margin:0;max-width:52ch")}>
          <Segs segs={b.segs} gras={GRAS} lien={LIEN} survol={h.acc} />
        </p>
        <div style={css("position:relative;display:flex;gap:10px;flex-wrap:wrap")}>
          <a className={h.boutonPlat} href="#cx-form" style={css("padding:12px 20px;border-radius:999px;background:var(--acc);color:#fff;font:600 14px var(--fb);white-space:nowrap")}>Décrire mon besoin</a>
        </div>
      </div>
    );
  if (b.isDuo) return <Duo b={b} />;
  if (b.isBento) return <Bento b={b} />;
  if (b.isSub && b.unit)
    return (
      <div className="mg-r2" style={css(`display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:28px;margin:10px 0 26px;padding:28px 30px;border-radius:var(--rad);${VERRE_SOUS}`)}>
        <div>
          <div style={css("width:28px;height:3px;border-radius:999px;background:var(--acc);margin-bottom:14px")}></div>
          <h3 style={css("font:600 calc(20px * var(--ts))/1.25 var(--ft);letter-spacing:-.03em;color:var(--ink);margin:0;text-wrap:balance")}><span>{b.unit.title}</span></h3>
        </div>
        <div>
          {b.unit.blocks.map((x, i) => (
            <Interne key={i} x={x} />
          ))}
        </div>
      </div>
    );
  if (b.isSubGrid)
    return (
      <div className="mg-rmulti" style={css(b.gridCss ?? "")}>
        {(b.units ?? []).map((u, i) => (
          <div key={i} style={css(`border-radius:var(--rad);padding:24px 24px 14px;${VERRE_SOUS}`)}>
            <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:14px")}>
              <span style={css("font:600 11px ui-monospace,Menlo,monospace;color:var(--acc)")}><span>{u.n}</span></span>
              <span style={css("flex:1;height:1px;background:var(--line)")}></span>
            </div>
            <h3 style={css("font:600 calc(18px * var(--ts))/1.3 var(--ft);letter-spacing:-.025em;color:var(--ink);margin:0 0 12px;text-wrap:balance")}><span>{u.title}</span></h3>
            {u.blocks.map((x, j) => (
              <Interne key={j} x={x} />
            ))}
          </div>
        ))}
      </div>
    );
  return null;
}
