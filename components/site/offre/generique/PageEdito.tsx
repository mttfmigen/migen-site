import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { porteSonNumero } from "@/components/site/blocs/resume-de-section";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";

import CadenceOffre, { AncreRappel } from "../CadenceOffre";
import EtiquettePli from "../EtiquettePli";
import offre from "../PageOffre.module.css";
import TelephoneHeros from "../TelephoneHeros";
import { BlocsLecture, GRAS, LIEN } from "./BlocsLecture";
import { Besoin, Fil, Liees } from "./CommunGenerique";
import { css } from "./css";
import Segs from "./Segs";
import type { Section, Vue } from "./types";
import h from "./Generique.module.css";

/**
 * La page « édito » du gabarit générique de la maquette (écran `cEdito` de
 * « Migen - Site final.dc.html ») : `/offres/residence/cahier-des-charges/` et
 * `/offres/residence/prestataire-ou-salarie/` la reçoivent de la maquette
 * elle-même (`cxKind`). Héros de lecture, sommaire collant à gauche, sections
 * numérotées, « Lire la suite », pages liées, « Décrire mon besoin ». Balisage
 * et styles recopiés de son gabarit ; la vue est calculée par son code.
 */

function SectionLecture({
  sec,
  ouverte,
  accroche,
}: {
  sec: Section;
  ouverte: boolean;
  /** L'accroche V3 de la carte fermée (`vue.ts`, `accrochesDe`). */
  accroche?: string;
}) {
  return (
    <section
      id={sec.id}
      className={[sec.faqCls, offre.blocPliablePartage].filter(Boolean).join(" ")}
      style={css("scroll-margin-top:100px;padding-bottom:56px")}
    >
      {/* REPLIÉE SUR TÉLÉPHONE, sauf la première (dc.html L451, `nOpen = 1`) :
          motif « Blocs communs (pliables) » de la maquette mobile. Le `<h2>`
          reste à sa place ; l'étiquette le répète sous 880 px. Au-dessus, la
          bascule n'existe pas (`.blocPliablePartage`). */}
      <SectionPliableMobile
        toujoursOuvert={ouverte}
        numero={!porteSonNumero(sec.num)}
        enTete={<EtiquettePli surtitre={sec.num} titre={sec.title} />}
        resume={accroche}
      >
      <div style={css("display:flex;align-items:baseline;gap:14px;margin-bottom:20px")}>
        <span style={css("font:600 12px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:var(--acc);flex:none")}><span>{sec.num}</span></span>
        <h2 style={css("font:600 calc(clamp(23px,2.5vw,34px) * var(--ts))/1.14 var(--ft);letter-spacing:-.036em;color:var(--ink);margin:0;max-width:28ch;text-wrap:balance")}><span>{sec.title}</span></h2>
      </div>
      {sec.hasFig ? (
        <div style={css("position:relative;border-radius:var(--rad);overflow:hidden;aspect-ratio:16/7;background:var(--ph);margin:6px 0 26px")}>
          <div style={css(sec.figCss ?? "")}></div>
        </div>
      ) : null}
      <BlocsLecture blocs={sec.head} groupe={sec.id} />
      {sec.hasMore ? (
        <details className="cx-more" style={css("margin-top:2px")}>
          <summary style={css("list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--card);border:1px solid var(--line);font:600 14px var(--fb);color:var(--ink);margin:4px 0 12px")}>
            <span className="cx-l1">Lire la suite</span>
            <span className="cx-l2">Réduire</span>
            <span style={css("color:var(--acc);font-weight:600")}>+</span>
          </summary>
          <div style={css("padding-top:10px")}>
            <BlocsLecture blocs={sec.more} groupe={sec.id} />
          </div>
        </details>
      ) : null}
      {sec.afterCtaEdito ? (
        <div style={css("margin:36px 0;border-radius:var(--rad);background:var(--panel);padding:28px 30px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap")}>
          <div style={css("position:absolute;width:420px;height:420px;right:-170px;top:-190px;background:radial-gradient(circle,rgba(255,124,60,.26),transparent 68%);pointer-events:none")}></div>
          {/* `min-width:min(240px,100%)` et non `240px` : la bande porte
              30 px de remplissage de chaque côté, donc à 320 px elle n'offre
              que 180 px à cette phrase, qui en réclamait 240 et sortait du
              cadre de 30 px, rognée par l'`overflow:hidden` de la bande.
              Mesuré au navigateur le 13/10 sur
              `/offres/residence/cahier-des-charges/`. Au-dessus, le plancher
              de 240 px tient comme avant. */}
          <div style={css("position:relative;flex:1;min-width:min(240px,100%);font:600 calc(18px * var(--ts))/1.35 var(--ft);letter-spacing:-.028em;color:#fff;max-width:32ch")}>Vous préférez qu’on s’en occupe&nbsp;? Rappel dans l’heure.</div>
          <a className={h.bouton} href="#cx-form" style={css("position:relative;display:inline-flex;align-items:center;gap:9px;padding:15px 26px;border-radius:999px;background:var(--acc);color:#fff;font:600 15px var(--fb);white-space:nowrap;box-shadow:0 12px 30px -12px rgba(255,124,60,.9);transition:filter var(--tr),transform var(--tr);flex:none")}>Décrire mon besoin</a>
        </div>
      ) : null}
      </SectionPliableMobile>
    </section>
  );
}

export default function PageEdito({
  v,
  formulaire,
  chemin,
}: {
  v: Vue;
  formulaire: string;
  /** Le chemin de la page : sans lui, ni cadence ni pastilles mobiles. */
  chemin?: string;
}) {
  return (
    <div className={`mg-site ${h.racineMobile}`}>
      <main style={css("padding-top:96px")}>
        <section style={css("max-width:1200px;margin:0 auto;padding:56px 40px 0")}>
          <Fil v={v} />
          <div style={css("max-width:860px")}>
            <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap")}>
              <span style={css("font:600 10.5px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:#fff;background:var(--acc);padding:5px 12px;border-radius:999px;white-space:nowrap")}><span>{v.cFormat}</span></span>
              <span style={css("font:600 10.5px var(--fb);letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);background:var(--chip);padding:5px 12px;border-radius:999px;white-space:nowrap")}><span>{v.cRead}</span></span>
            </div>
            <h1 style={css("font:600 calc(clamp(32px,3.9vw,56px) * var(--ts))/1.05 var(--ft);letter-spacing:-.045em;color:var(--ink);margin:0;max-width:20ch;text-wrap:balance")}><span>{v.cH1}</span></h1>
            <p style={css("font:400 18px/1.7 var(--fb);color:var(--ink1);margin:22px 0 0;max-width:60ch;text-wrap:pretty")}>
              <Segs segs={v.cLeadSegs} gras={GRAS} lien={LIEN} survol={h.acc} />
            </p>
            {/* Le téléphone du héros mobile (`offre/TelephoneHeros`). Ce héros
                de lecture n'a pas de bouton : la rangée n'existe que sous
                881 px, le bureau reste celui de la capture. */}
            <div data-mobile-seulement="" style={css("display:flex;gap:12px;margin-top:22px;flex-wrap:wrap")}>
              <TelephoneHeros />
            </div>
          </div>
        </section>
        <section style={css("max-width:1200px;margin:0 auto;padding:64px 40px 0")}>
          <div className="cx-lay" style={css("display:grid;grid-template-columns:230px minmax(0,1fr);gap:60px;align-items:start")}>
            <aside className="cx-toc" style={css("position:sticky;top:112px")}>
              <div style={css("font:600 10.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--ink4);margin-bottom:14px")}>Sur cette page</div>
              <div style={css("display:grid;gap:2px;border-left:1px solid var(--line)")}>
                {v.cToc.map((t) => (
                  <a key={t.go} className={h.toc} href={t.go} style={css("display:flex;gap:10px;padding:8px 0 8px 16px;margin-left:-1px;border-left:1px solid transparent;font:500 13px/1.45 var(--fb);color:var(--ink2)")}>
                    <span style={css("font:600 10.5px ui-monospace,Menlo,monospace;color:var(--acc);flex:none;padding-top:2px")}><span>{t.num}</span></span>
                    <span><span>{t.title}</span></span>
                  </a>
                ))}
              </div>
              <a className={h.boutonPlat} href="#cx-form" style={css("display:flex;justify-content:center;margin-top:24px;padding:13px;border-radius:999px;background:var(--acc);color:#fff;font:600 13.5px var(--fb)")}>Décrire mon besoin</a>
            </aside>
            <article style={css("min-width:0")}>
              {v.cHasIntro ? (
                <div style={css("margin-bottom:48px")}>
                  <BlocsLecture blocs={v.cIntro} groupe="intro" />
                </div>
              ) : null}
              {/* La cadence de conversion mobile entre les sections (voir
                  `offre/CadenceOffre`), bouton « Décrire mon besoin » vers le
                  formulaire de bas de page, comme celui du sommaire. */}
              <CadenceOffre
                chemin={chemin}
                actions={[{ libelle: "Décrire mon besoin", href: "#cx-form" }]}
              >
                {v.cSections.map((sec, rang) => (
                  <SectionLecture
                    key={sec.id}
                    sec={sec}
                    ouverte={rang === 0}
                    accroche={v.accroches[sec.title]}
                  />
                ))}
              </CadenceOffre>
            </article>
          </div>
        </section>
        <Liees v={v} />
        {/* Les pastilles du maillage mobile, puis la cible du bandeau
            « Être rappelé » : mêmes raisons que dans `PageOffre`. */}
        {chemin ? <PastillesCocon chemin={chemin} /> : null}
        <AncreRappel chemin={chemin} />
        <Besoin formulaire={formulaire} />
      </main>
    </div>
  );
}
