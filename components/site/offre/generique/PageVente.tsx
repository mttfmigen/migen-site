import Link from "next/link";
import { Fragment } from "react";

import { BlocLecture, GRAS, LIEN } from "./BlocsLecture";
import { BlocVente } from "./BlocsVente";
import { Besoin, Fil, Liees } from "./CommunGenerique";
import { css } from "./css";
import { LOGOS_REFERENCES } from "./logos";
import RappelExpress from "./RappelExpress";
import Segs from "./Segs";
import type { Section, Vue } from "./types";
import h from "./Generique.module.css";

/**
 * La page « vente » du gabarit générique de la maquette (écran `cVente` de
 * « Migen - Site final.dc.html ») : six sous-pages du gabarit 03 la reçoivent
 * de la maquette elle-même (`index.json`, `sec: false`). Balisage et styles
 * recopiés de son gabarit, écran par écran ; la vue (`v`) est calculée par son
 * propre code (`maquette.js`).
 *
 *  0. Héros            fil, famille, pastille, H1, chapô, bouton, repères,
 *                      panneau « Être rappelé »
 *  1. Bandeau photo    « Sur cette page »
 *  2. Le problème      (sp-problem)
 *  3. La méthode       (sp-method)
 *  4. Références       (sp-proof) : défilement de logos, cartes d'études
 *  5+. Sections numérotées restantes (c1, c3, c5…)
 *  .  Questions        (sp-faq)
 *  .  Appel            bande sombre
 *  .  Pages liées
 *  .  Décrire mon besoin (cx-form)
 *
 * ÉCARTS À LA CAPTURE, déclarés : (1) le repère « 5 agences en France » du
 * héros est retiré (4 agences, et en France des hubs, pas des agences : règle
 * du README) ; (2) le tiret cadratin que le gabarit pose entre le titre et le
 * texte des constats devient un point, la ponctuation du markdown lui-même ;
 * (3) la mention RGPD sous « Décrire mon besoin ».
 */

const VERRE =
  "background:rgba(255,255,255,var(--gl-a));backdrop-filter:blur(var(--gl-b)) saturate(150%);-webkit-backdrop-filter:blur(var(--gl-b)) saturate(150%);border:1px solid var(--gbd);box-shadow:0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)";
const BOUTON =
  "display:inline-flex;align-items:center;gap:9px;padding:15px 26px;border-radius:999px;background:var(--acc);color:var(--sur-acc);font:600 15px var(--fb);white-space:nowrap;box-shadow:0 12px 30px -12px rgba(255,124,60,.9);transition:filter var(--tr),transform var(--tr)";
const SURTITRE = css("font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc-ink);margin-bottom:16px");
const TITRE_SECTION = "font:600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.06 var(--ft);letter-spacing:-.042em;color:var(--ink);margin:0;text-wrap:balance";
const REPERE_VALEUR = css("font:600 21px var(--ft);letter-spacing:-.04em;color:var(--ink)");
const REPERE_LIBELLE = css("font:400 11.5px var(--fb);color:var(--ink4);margin-top:2px");
const SEPARATEUR = css("width:1px;height:32px;background:var(--line)");

function Heros({ v }: { v: Vue }) {
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:56px 40px 0")}>
      <Fil v={v} />
      <div className="mg-r2" style={css("display:grid;grid-template-columns:1.08fr .92fr;gap:48px;align-items:start")}>
        <div>
          <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap")}>
            <span style={css("font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc-ink)")}><span>{v.cFam}</span></span>
            <span style={css(`display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:999px;${VERRE};font:600 11.5px var(--fb);color:var(--ink1);white-space:nowrap`)}>
              <span style={css("width:5px;height:5px;border-radius:999px;background:var(--acc)")}></span>Rappel dans l’heure
            </span>
          </div>
          <h1 style={css("font:600 calc(clamp(34px,4.2vw,60px) * var(--ts))/1.04 var(--ft);letter-spacing:-.045em;color:var(--ink);margin:0;max-width:17ch;text-wrap:balance")}><span>{v.cH1}</span></h1>
          <p style={css("font:400 17.5px/1.7 var(--fb);color:var(--ink1);margin:22px 0 0;max-width:54ch;text-wrap:pretty")}>
            <Segs segs={v.cLeadSegs} gras={GRAS} lien={LIEN} survol={h.acc} />
          </p>
          {v.cHasSub ? (
            <p style={css("font:400 15.5px/1.7 var(--fb);color:var(--ink2);margin:14px 0 0;max-width:54ch")}>
              <Segs segs={v.cSubSegs} gras={GRAS} lien={LIEN} survol={h.acc} />
            </p>
          ) : null}
          <div style={css("display:flex;gap:12px;margin-top:28px;flex-wrap:wrap")}>
            <a className={h.bouton} href="#cx-form" style={css(BOUTON)}>Décrire mon besoin</a>
          </div>
          <div style={css("display:flex;align-items:center;gap:22px;margin-top:30px;padding-top:24px;border-top:1px solid var(--line);flex-wrap:wrap")}>
            <div>
              <div style={REPERE_VALEUR}>1&nbsp;h</div>
              <div style={REPERE_LIBELLE}>pour vous rappeler</div>
            </div>
            <div style={SEPARATEUR}></div>
            <div>
              <div style={REPERE_VALEUR}>10&nbsp;%</div>
              <div style={REPERE_LIBELLE}>des techniciens retenus</div>
            </div>
            <div style={SEPARATEUR}></div>
            <div>
              <div style={REPERE_VALEUR}>+200</div>
              <div style={REPERE_LIBELLE}>clients industriels</div>
            </div>
          </div>
        </div>
        <div style={css(`border-radius:var(--rad);padding:30px 32px 32px;${VERRE}`)}>
          <div style={css("display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:6px;flex-wrap:wrap")}>
            <div style={css("font:600 calc(19px * var(--ts)) var(--ft);letter-spacing:-.03em;color:var(--ink)")}>Être rappelé</div>
            <span style={css("font:600 10.5px var(--fb);letter-spacing:.1em;text-transform:uppercase;color:var(--acc-ink);white-space:nowrap")}>Sous une heure</span>
          </div>
          <p style={css("font:400 13.5px/1.55 var(--fb);color:var(--ink2);margin:0 0 18px")}>Trois champs, et nous qualifions le besoin au téléphone.</p>
          <RappelExpress />
          <div style={css("font:400 11.5px var(--fb);color:var(--ink4);margin-top:14px")}>Du lundi au vendredi, 8&nbsp;h&nbsp;00 – 18&nbsp;h&nbsp;30. Aucun démarchage.</div>
        </div>
      </div>
    </section>
  );
}

function Bandeau({ v }: { v: Vue }) {
  return (
    <section style={css("max-width:1200px;margin:0 auto;padding:44px 40px 0")}>
      <div style={css("position:relative;border-radius:36px;overflow:hidden;min-height:320px;background:var(--ph)")}>
        <div style={css(v.cBgCss)}></div>
        <div style={css("position:absolute;inset:0;background:linear-gradient(to bottom,rgba(18,17,16,.36) 0%,rgba(18,17,16,0) 40%,rgba(18,17,16,.78) 100%)")}></div>
        <div style={css("position:absolute;top:24px;left:28px;display:flex;align-items:center;gap:10px")}>
          {/* eslint-disable-next-line @next/next/no-img-element -- logo de 20 px de haut, servi tel quel comme dans la maquette */}
          <img src="/assets/logo-migen-white.png" alt="" style={css("height:20px;width:auto")} />
          <span style={css("font:500 11px var(--fb);letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)")}>Innovation, performance, impact.</span>
        </div>
        <div style={css("position:absolute;left:0;right:0;bottom:0;padding:26px 28px")}>
          <div style={css("font:600 10.5px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:12px")}>Sur cette page</div>
          <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
            {v.spNav.map((t) => (
              <a key={t.go} className={h.puce} href={t.go} style={css("white-space:nowrap;font:500 12.5px var(--fb);padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.16);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.26);color:#fff")}><span>{t.title}</span></a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Constat({ v }: { v: Vue }) {
  if (!v.spHasProblem || !v.spProblem.hasSplit) return null;
  const p = v.spProblem;
  const panneaux = [
    { cle: "avant", data: p.before, cadre: "background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)", etiquette: "rgba(255,255,255,.5)", texte: "font:400 15px/1.6 var(--fb);color:rgba(255,255,255,.72)", ligne: "rgba(255,255,255,.62)", signe: "×", signeCss: "color:rgba(255,255,255,.4);flex:none" },
    { cle: "apres", data: p.after, cadre: "background:rgba(255,124,60,.13);border:1px solid rgba(255,124,60,.34)", etiquette: "var(--acc)", texte: "font:500 15.5px/1.6 var(--fb);color:#fff", ligne: "rgba(255,255,255,.8)", signe: "✓", signeCss: "color:var(--acc);flex:none;font-weight:600" },
  ];
  return (
    <section id="sp-problem" style={css("padding:var(--sec) 0 0;scroll-margin-top:96px")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:0 40px")}>
        <div className={h.panneauSombre} style={css("border-radius:40px;background:var(--panel);padding:56px 56px 52px;position:relative;overflow:hidden")}>
          <div style={css("position:absolute;width:460px;height:460px;right:-180px;top:-200px;background:radial-gradient(circle,rgba(255,124,60,.28),transparent 68%);pointer-events:none")}></div>
          <div className="mg-r2" style={css("position:relative;display:grid;grid-template-columns:.92fr 1.08fr;gap:52px;align-items:start")}>
            <div>
              <div style={SURTITRE}>Le problème</div>
              <h2 style={css(`${TITRE_SECTION};color:#fff;max-width:18ch`)}><span>{p.title}</span></h2>
              {p.hasLead ? <p style={css("font:400 16.5px/1.7 var(--fb);color:rgba(255,255,255,.66);margin:20px 0 0;max-width:44ch")}><span>{p.lead}</span></p> : null}
              <div style={css("height:28px")}></div>
              <a className={h.bouton} href="#cx-form" style={css(BOUTON)}>Ça vous parle&nbsp;? Parlons-en</a>
            </div>
            <div>
              <div style={css("display:grid;gap:12px")}>
                {panneaux.map((x) => (
                  <div key={x.cle} style={css(`border-radius:var(--rad);${x.cadre};padding:26px 28px`)}>
                    <div style={css(`font:600 10.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:${x.etiquette};margin-bottom:12px`)}><span>{x.data.label}</span></div>
                    <div style={css(`${x.texte};margin-bottom:14px`)}><span>{x.data.text}</span></div>
                    <div style={css("display:grid;gap:9px")}>
                      {x.data.items.map((it, i) => (
                        <div key={i} style={css(`display:flex;gap:12px;font:400 14.5px/1.5 var(--fb);color:${x.ligne}`)}>
                          <span style={css(x.signeCss)}><span>{x.signe}</span></span>
                          {/* La maquette sépare titre et texte par un tiret cadratin,
                              proscrit : le point du markdown d'origine le remplace. */}
                          <span>
                            {it.hasTitle ? <><strong style={css("font-weight:600;color:#fff")}><span>{it.title}</span></strong>. </> : null}
                            <span>{it.text}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Methode({ v }: { v: Vue }) {
  if (!v.spHasMethod) return null;
  return (
    <section id="sp-method" style={css("padding:var(--sec) 0 0;scroll-margin-top:96px")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:0 40px")}>
        <div className="mg-r2" style={css("display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:end;margin-bottom:36px")}>
          <div>
            <div style={SURTITRE}>La méthode</div>
            <h2 style={css(`${TITRE_SECTION};max-width:20ch`)}><span>{v.spMethod.title}</span></h2>
          </div>
          <p style={css("font:400 16.5px/1.7 var(--fb);color:var(--ink2);margin:0;max-width:48ch")}><span>{v.spMethod.lead}</span></p>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:28px 22px")}>
          {v.spMethod.steps.map((x) => (
            <div key={x.n} style={css("position:relative;padding-top:30px;border-top:2px solid var(--line)")}>
              <span style={css("position:absolute;top:-8px;left:0;width:14px;height:14px;border-radius:999px;background:var(--acc);box-shadow:0 0 0 5px rgba(255,124,60,.16)")}></span>
              <div style={css("font:600 calc(40px * var(--ts))/1 var(--ft);letter-spacing:-.05em;color:var(--acc-ink);margin-bottom:14px")}><span>{x.n}</span></div>
              {x.hasTitle ? <div style={css("font:600 calc(17px * var(--ts))/1.3 var(--ft);letter-spacing:-.026em;color:var(--ink);margin-bottom:8px")}><span>{x.title}</span></div> : null}
              <div style={css("font:400 14px/1.65 var(--fb);color:var(--ink2)")}><span>{x.text}</span></div>
            </div>
          ))}
        </div>
        <div style={css(`display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:28px;padding:20px 24px 20px 28px;border-radius:999px;${VERRE}`)}>
          <span style={css("font:500 15.5px var(--fb);color:var(--ink1)")}>Un arrêt, un besoin, une ligne à tenir&nbsp;? On cadre ensemble.</span>
          <a className={h.bouton} href="#cx-form" style={css(`${BOUTON};padding:12px 22px;font-size:14.5px`)}>Cadrer mon besoin</a>
        </div>
      </div>
    </section>
  );
}

function References({ v }: { v: Vue }) {
  if (!v.spHasProof) return null;
  // Le rail est doublé, comme dans la maquette, pour un défilement sans couture.
  const rail = [...LOGOS_REFERENCES, ...LOGOS_REFERENCES];
  return (
    <section id="sp-proof" style={css("padding:var(--sec) 0 0;scroll-margin-top:96px")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:0 40px")}>
        <div className="mg-r2" style={css("display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:end;margin-bottom:36px")}>
          <div>
            <div style={SURTITRE}>Références</div>
            <h2 style={css(`${TITRE_SECTION};max-width:20ch`)}><span>{v.spProof.title}</span></h2>
          </div>
          <p style={css("font:400 16.5px/1.7 var(--fb);color:var(--ink2);margin:0;max-width:48ch")}><span>{v.spProof.lead}</span></p>
        </div>
        <div className="mg-marquee" style={css("position:relative;overflow:hidden;padding:10px 0 30px;-webkit-mask-image:linear-gradient(to right,transparent,#000 9%,#000 91%,transparent);mask-image:linear-gradient(to right,transparent,#000 9%,#000 91%,transparent)")}>
          <div className="mg-track" style={css("display:flex;align-items:center;gap:14px;width:max-content;animation:mgMarquee 60s linear infinite")}>
            {rail.map(([fichier, nom, inverse], i) => (
              <span key={i} className="mg-logo" aria-hidden={i >= LOGOS_REFERENCES.length || undefined} style={css("display:inline-flex;align-items:center;justify-content:center;flex:none;height:64px;min-width:132px;padding:0 20px;border-radius:16px;background:#fff;border:1px solid rgba(28,27,25,.07)")}>
                {/* eslint-disable-next-line @next/next/no-img-element -- logos du rail, tailles propres bornées comme dans la maquette */}
                <img src={`/assets/clients/${fichier}`} alt={nom} loading="lazy" style={css(`max-height:34px;max-width:120px;width:auto;height:auto;object-fit:contain;display:block;${inverse ? "filter:invert(1) hue-rotate(180deg)" : "mix-blend-mode:multiply"}`)} />
              </span>
            ))}
          </div>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px")}>
          {v.spProof.cases.map((k, i) => (
            <Link key={i} className={h.leve3} href={k.go} prefetch={false} style={css(`display:flex;flex-direction:column;gap:8px;min-height:160px;padding:24px 24px 22px;border-radius:var(--rad);${VERRE};transition:transform var(--tr)`)}>
              <span style={css("font:600 10px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:var(--acc-ink)")}>Étude de cas</span>
              <span style={css("font:600 calc(22px * var(--ts)) var(--ft);letter-spacing:-.04em;color:var(--ink)")}><span>{k.client}</span></span>
              <span style={css("font:400 13.5px/1.5 var(--fb);color:var(--ink2)")}><span>{k.sub}</span></span>
              <span style={css("font:600 12.5px var(--fb);color:var(--acc-ink);margin-top:auto")}>Lire l’étude →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const PASTILLE_NUM = css("font:600 11px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:var(--acc-ink);padding:5px 10px;border-radius:999px;background:var(--acc-w)");
const TITRE_NUM = css("font:600 calc(clamp(24px,2.6vw,36px) * var(--ts))/1.1 var(--ft);letter-spacing:-.04em;color:var(--ink);margin:0 0 22px;text-wrap:balance");
const LIEN_CHARGE = css("display:inline-flex;align-items:center;gap:8px;font:600 13.5px var(--fb);color:var(--acc-ink);margin-top:6px");
const PHOTO = "position:relative;border-radius:var(--rad);overflow:hidden;aspect-ratio:4/5;background:var(--ph);box-shadow:0 30px 70px -40px rgba(0,0,0,.5)";

function Titre({ sec }: { sec: Section }) {
  return (
    <>
      <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:16px")}>
        <span style={PASTILLE_NUM}><span>{sec.num}</span></span>
        <span style={css("height:1px;flex:1;background:var(--line)")}></span>
      </div>
      <h2 style={TITRE_NUM}><span>{sec.title}</span></h2>
    </>
  );
}

function SectionNumerotee({ sec }: { sec: Section }) {
  return (
    <section id={sec.id} style={css(sec.bandCss ?? "")}>
      <div className={`mg-r2 ${sec.faqCls ?? ""}`} style={css(sec.gridCss ?? "")}>
        <div style={css(sec.asideCss ?? "")}>
          {sec.titleAside ? <Titre sec={sec} /> : null}
          {sec.hasMedia ? (
            <div style={css("position:relative;border-radius:var(--rad);overflow:hidden;aspect-ratio:4/3;background:var(--ph);margin-bottom:18px")}>
              <div style={css(sec.mediaCss ?? "")}></div>
            </div>
          ) : null}
          {sec.mediaTall ? (
            <div style={css(PHOTO)}>
              <div style={css(sec.mediaCss ?? "")}></div>
            </div>
          ) : null}
          {sec.mediaStat ? (
            <div style={css("position:relative;padding-left:22px")}>
              <div style={css(PHOTO)}>
                <div style={css(sec.mediaCss ?? "")}></div>
              </div>
              <div style={css("position:absolute;left:0;bottom:30px;max-width:230px;padding:18px 22px;border-radius:var(--rad-s);background:rgba(255,255,255,var(--gl-a));backdrop-filter:blur(var(--gl-b)) saturate(150%);-webkit-backdrop-filter:blur(var(--gl-b)) saturate(150%);border:1px solid var(--gbd);box-shadow:0 20px 44px -26px rgba(0,0,0,.4)")}>
                <div style={css("font:600 calc(34px * var(--ts))/1 var(--ft);letter-spacing:-.05em;color:var(--acc-ink)")}><span>{sec.statN}</span></div>
                <div style={css("font:400 13px/1.45 var(--fb);color:var(--ink1);margin-top:6px")}><span>{sec.statT}</span></div>
              </div>
            </div>
          ) : null}
          {sec.titleAside && sec.hasMedia ? <a className={h.acc} href="#cx-form" style={LIEN_CHARGE}>Parler à un chargé d’affaires →</a> : null}
        </div>
        <div>
          {sec.titleMain ? <Titre sec={sec} /> : null}
          {sec.head.map((b, i) => (
            <BlocVente key={i} b={b} />
          ))}
          {sec.titleMain ? <a className={h.acc} href="#cx-form" style={LIEN_CHARGE}>Parler à un chargé d’affaires →</a> : null}
        </div>
      </div>
      {sec.hasCtaBand ? (
        <div style={css("max-width:1200px;margin:34px auto 0;padding:0 40px")}>
          <div style={css(`display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;padding:22px 26px 22px 30px;border-radius:var(--rad);${VERRE}`)}>
            <div style={css("display:flex;align-items:center;gap:16px;min-width:260px;flex:1")}>
              <span style={css("width:10px;height:10px;border-radius:999px;background:var(--acc);flex:none;box-shadow:0 0 0 6px var(--acc-w)")}></span>
              <div>
                <div style={css("font:600 calc(17px * var(--ts))/1.3 var(--ft);letter-spacing:-.022em;color:var(--ink)")}>Un besoin sur ce sujet&nbsp;? Un chargé d’affaires vous rappelle sous 1&nbsp;h.</div>
                <div style={css("font:400 13.5px var(--fb);color:var(--ink3);margin-top:3px")}>Jours ouvrés · technicien depuis le hub le plus proche · partout en France</div>
              </div>
            </div>
            <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap")}>
              <a className={h.boutonPlat} href="#cx-form" style={css("display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:999px;background:var(--acc);color:var(--sur-acc);font:600 14px var(--fb);white-space:nowrap;box-shadow:0 10px 26px -12px rgba(255,124,60,.9)")}>Décrire mon besoin →</a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Questions({ v }: { v: Vue }) {
  if (!v.spHasFaq) return null;
  return (
    <section id="sp-faq" style={css("padding:var(--sec) 0 0;scroll-margin-top:96px")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:0 40px")}>
        <div className={`mg-r2 mg-faqph ${h.faqPhoto}`} style={css("display:grid;grid-template-columns:.8fr 1.2fr;gap:52px;align-items:start")}>
          <div style={css("position:sticky;top:112px")}>
            <div style={SURTITRE}>Questions fréquentes</div>
            <h2 style={css(`${TITRE_SECTION};max-width:14ch;margin-bottom:22px`)}>Ce qu’on nous demande avant de signer</h2>
            <a className={h.bouton} href="#cx-form" style={css(BOUTON)}>Poser ma question</a>
          </div>
          <div style={css("display:grid;gap:10px")}>
            {v.spFaq.items.map((fq, i) => (
              <details key={i} name="sp-faq" className={h.question} style={css(`border-radius:var(--rad-s);${VERRE}`)}>
                <summary style={css("display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;padding:20px 24px;background:transparent;border:none;cursor:pointer;text-align:left;list-style:none")}>
                  <span style={css("font:600 calc(16px * var(--ts))/1.4 var(--ft);letter-spacing:-.022em;color:var(--ink)")}><span>{fq.q}</span></span>
                  <span className={h.plus} style={css("display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;flex:none;font:400 20px/1 var(--fb);transition:transform var(--tr),background var(--tr);background:var(--chip);color:var(--ink2)")}>+</span>
                </summary>
                <div style={css("padding:0 24px 10px")}>
                  {fq.blocks.map((b, j) => (
                    <BlocLecture key={j} b={b} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Appel({ v }: { v: Vue }) {
  return (
    <section style={css("padding:var(--sec) 0 0")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:0 40px")}>
        <div className={h.panneauSombre} style={css("border-radius:40px;background:var(--panel);padding:52px 56px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:36px;flex-wrap:wrap")}>
          <div style={css("position:absolute;width:460px;height:460px;left:-180px;bottom:-200px;background:radial-gradient(circle,rgba(255,124,60,.28),transparent 68%);pointer-events:none")}></div>
          <div style={css("position:relative;flex:1;min-width:260px")}>
            <div style={css("font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc);margin-bottom:12px")}><span>{v.spH1}</span></div>
            <div style={css("font:600 calc(clamp(24px,2.8vw,38px) * var(--ts))/1.12 var(--ft);letter-spacing:-.04em;color:#fff;max-width:22ch;text-wrap:balance")}>Décrivez votre situation, nous revenons avec un plan et un délai.</div>
          </div>
          <div style={css("position:relative;display:flex;gap:10px;flex-wrap:wrap;flex:none")}>
            <a className={h.bouton} href="#cx-form" style={css(BOUTON)}>Décrire mon besoin</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PageVente({ v, formulaire }: { v: Vue; formulaire: string }) {
  return (
    <div className="mg-site">
      <main style={css("padding-top:96px")}>
        <Heros v={v} />
        <Bandeau v={v} />
        <Constat v={v} />
        <Methode v={v} />
        <References v={v} />
        {v.spRest.map((sec) => (
          <Fragment key={sec.id}>
            <SectionNumerotee sec={sec} />
          </Fragment>
        ))}
        <Questions v={v} />
        <Appel v={v} />
        <Liees v={v} />
        <Besoin formulaire={formulaire} />
      </main>
    </div>
  );
}
