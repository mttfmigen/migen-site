import Image from "next/image";

import { TELEPHONE_LP } from "@/components/site/entete-donnees";
import { CHEMINS_LP, type SectionLP } from "@/lib/lp/pages";

import {
  BOUTON_NOIR,
  BOUTON_ORANGE,
  CADRE,
  Certifications,
  Chapo,
  type Contexte,
  Flottants,
  Photo,
  SurTitre,
  Titre2,
  numero,
  sectionStyle,
} from "./atomes-lp";
import { FormulaireLP } from "./FormulaireLP";
import styles from "./PageLP.module.css";

/**
 * Les blocs à deux colonnes de `MigenLP` (maquette V3) : hubs, texte et
 * photo, sécurité, cas client, questions fréquentes, contact.
 */

function hubDe(nom: string) {
  const ville = nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const page = `/lp/maintenance-industrielle-${ville}/`;
  return CHEMINS_LP.includes(page)
    ? { href: page, etiquette: "Voir la page du hub" }
    : { href: "#lp-contact", etiquette: "Nous contacter" };
}

export function Hubs({ s, id, ctx }: { s: SectionLP; id: string; ctx: Contexte }) {
  return (
    <section id={id} className={styles.sec} style={sectionStyle(ctx.fond)}>
      <div className={styles.pad} style={CADRE}>
        <div className={styles.g2} style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 56, alignItems: "center" }}>
          <div>
            {s.kick ? <SurTitre>{s.kick}</SurTitre> : null}
            <Titre2>{s.h2}</Titre2>
            {s.lead ? <Chapo>{s.lead}</Chapo> : null}
            <a
              href="#lp-contact"
              className={styles.orange}
              style={{ ...BOUTON_ORANGE, marginTop: 26, boxShadow: "0 12px 28px -14px rgba(255,124,60,.9)" }}
            >
              Contacter le hub le plus proche →
            </a>
          </div>
          <Photo
            src={s.img}
            tailles="(max-width: 760px) 100vw, 560px"
            className={styles.m2}
            style={{ minHeight: 360, alignSelf: "stretch", borderRadius: 28 }}
          >
            <Flottants flottants={s.floats} style={{ left: 16, bottom: 16 }} />
          </Photo>
        </div>
        <div className={styles.hubs} style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 12 }}>
          {s.chips.map((nom, j) => {
            const hub = hubDe(nom);
            const photo = s.hubImg?.[j];
            return (
              <a
                key={nom}
                href={hub.href}
                className={styles.hub}
                style={{ position: "relative", display: "block", height: 156, borderRadius: 20, overflow: "hidden", background: "#8a857e" }}
              >
                {photo ? <Image src={photo} alt="" fill sizes="(max-width: 1080px) 50vw, 230px" style={{ objectFit: "cover" }} /> : null}
                <span
                  aria-hidden="true"
                  style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(18,17,16,.04) 25%,rgba(18,17,16,.8))" }}
                />
                <span
                  aria-hidden="true"
                  style={{ position: "absolute", top: 12, left: 14, font: "600 11px ui-monospace,Menlo,monospace", color: "rgba(255,255,255,.88)" }}
                >
                  {numero(j)}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background: "rgba(255,255,255,.92)",
                    color: "#1c1b19",
                    display: "grid",
                    placeItems: "center",
                    font: "600 14px var(--fb)",
                  }}
                >
                  →
                </span>
                <span style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
                  <span style={{ display: "block", font: "700 19px/1.1 var(--ft)", letterSpacing: "-.025em", color: "#fff" }}>{nom}</span>
                  <span style={{ display: "block", marginTop: 4, font: "500 12px var(--fb)", color: "rgba(255,255,255,.85)" }}>
                    {hub.etiquette}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TexteEtPhoto({ s, id, ctx }: { s: SectionLP; id: string; ctx: Contexte }) {
  return (
    <section id={id} className={styles.sec} style={sectionStyle(ctx.fond)}>
      <div
        className={`${styles.pad} ${styles.g2}`}
        style={{ ...CADRE, display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 56, alignItems: "center" }}
      >
        <div style={{ order: ctx.aGauche ? 2 : 1 }}>
          {s.kick ? <SurTitre>{s.kick}</SurTitre> : null}
          <Titre2>{s.h2}</Titre2>
          {s.lead ? <Chapo>{s.lead}</Chapo> : null}
          {s.paras.map((paragraphe) => (
            <p key={paragraphe} style={{ margin: "12px 0 0", font: "400 15.5px/1.7 var(--fb)", color: "#4a4845", textWrap: "pretty" }}>
              {paragraphe}
            </p>
          ))}
          {s.checks.length ? (
            <ul style={{ listStyle: "none", margin: "20px 0 0", padding: 0, display: "grid", gap: 8 }}>
              {s.checks.map((point) => (
                <li
                  key={point}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "12px 16px",
                    borderRadius: 14,
                    background: ctx.carte,
                    font: "500 14.5px/1.5 var(--fb)",
                    color: "#1c1b19",
                  }}
                >
                  <span aria-hidden="true" style={{ flex: "none", width: 8, height: 8, marginTop: 7, borderRadius: 2, background: "#ff7c3c" }} />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          {s.items.length ? (
            <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
              {s.items.map((item) => (
                <div
                  key={item.h}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px minmax(0,1fr)",
                    gap: 12,
                    padding: "16px 18px",
                    borderRadius: 18,
                    background: ctx.carte,
                    border: "1px solid #ecebe8",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: "rgba(255,124,60,.12)",
                      color: "#b4490f",
                      display: "grid",
                      placeItems: "center",
                      font: "700 13px var(--fb)",
                    }}
                  >
                    ✓
                  </span>
                  <div>
                    <p style={{ margin: 0, font: "600 15.5px/1.35 var(--ft)", color: "#1c1b19" }}>{item.h}</p>
                    <p style={{ margin: "3px 0 0", font: "400 14px/1.55 var(--fb)", color: "#4a4845" }}>{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {s.chips.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
              {s.chips.map((puce) => (
                <span
                  key={puce}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: ctx.carte,
                    border: "1px solid #e5e3df",
                    font: "500 13.5px var(--fb)",
                    color: "#1c1b19",
                  }}
                >
                  {puce}
                </span>
              ))}
            </div>
          ) : null}
          {s.cta ? (
            <a href="#lp-contact" className={styles.orange} style={{ ...BOUTON_ORANGE, marginTop: 24 }}>
              {s.cta} →
            </a>
          ) : null}
        </div>
        <Photo
          src={s.img}
          tailles="(max-width: 760px) 100vw, 560px"
          className={styles.m2}
          style={{ order: ctx.aGauche ? 1 : 2, minHeight: 440, alignSelf: "stretch", borderRadius: 28 }}
        >
          <Flottants flottants={s.floats} style={{ left: 16, right: 16, bottom: 16 }} />
        </Photo>
      </div>
    </section>
  );
}

export function Securite({ s, id, ctx }: { s: SectionLP; id: string; ctx: Contexte }) {
  return (
    <section id={id} className={styles.sec} style={sectionStyle(ctx.fond)}>
      <div
        className={`${styles.pad} ${styles.g2}`}
        style={{ ...CADRE, display: "grid", gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)", gap: 48, alignItems: "center" }}
      >
        <div>
          {s.kick ? <SurTitre>{s.kick}</SurTitre> : null}
          <Titre2>{s.h2}</Titre2>
          {s.lead ? <Chapo style={{ textWrap: "wrap" }}>{s.lead}</Chapo> : null}
          <Certifications certs={ctx.meta.certs} />
          {s.floats.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 24 }}>
              {s.floats.map((flottant) => (
                <div key={flottant.l}>
                  <div style={{ font: "700 34px/1 var(--ft)", letterSpacing: "-.04em", color: "#1c1b19" }}>{flottant.v}</div>
                  <div style={{ marginTop: 6, font: "400 13.5px var(--fb)", color: "#6a6764" }}>{flottant.l}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
          {s.badges.map((badge) => (
            <div key={badge.v} style={{ padding: 24, borderRadius: 22, background: ctx.carte, border: "1px solid #ecebe8" }}>
              <div style={{ font: "700 26px/1 var(--ft)", letterSpacing: "-.03em", color: "#b4490f", overflowWrap: "anywhere" }}>
                {badge.v}
              </div>
              <div style={{ marginTop: 10, font: "500 14px/1.45 var(--fb)", color: "#4a4845" }}>{badge.l}</div>
            </div>
          ))}
        </div>
      </div>
      {ctx.avecSelection ? (
        <div className={styles.pad} style={{ ...CADRE, margin: "28px auto 0" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "14px 22px",
              padding: "22px 24px",
              borderRadius: 22,
              background: "#fff4ee",
              border: "1px solid rgba(255,124,60,.28)",
            }}
          >
            <p style={{ flex: "1 1 260px", margin: 0, font: "600 17px/1.4 var(--ft)", letterSpacing: "-.015em", color: "#1c1b19" }}>
              <span style={{ color: "#b4490f" }}>Seuls 10&nbsp;%</span> des techniciens réussissent notre process de sélection.
            </p>
            <ol style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: "1 1 100%", margin: 0, padding: 0, listStyle: "none" }}>
              {ctx.meta.sel.map((etape) => (
                <li
                  key={etape.n}
                  style={{
                    flex: "none",
                    whiteSpace: "nowrap",
                    padding: "7px 11px",
                    borderRadius: 999,
                    background: "#fff",
                    border: "1px solid #f3d9cb",
                    font: "500 12px var(--fb)",
                    color: "#4a4845",
                  }}
                >
                  {etape.n} · {etape.h}
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function CasClient({ s, id, ctx }: { s: SectionLP; id: string; ctx: Contexte }) {
  return (
    <section id={id} className={styles.sec} style={sectionStyle(ctx.fond)}>
      <div className={styles.pad} style={CADRE}>
        <div
          className={styles.g2}
          style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", borderRadius: 28, overflow: "hidden", background: "#1c1b19" }}
        >
          <Photo src={s.img} tailles="(max-width: 760px) 100vw, 560px" style={{ minHeight: 320 }} />
          <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
            {s.kick ? <SurTitre style={{ margin: 0, color: "#ff9a66" }}>{s.kick}</SurTitre> : null}
            <Titre2 taille={32} style={{ lineHeight: 1.12, letterSpacing: "-.03em", color: "#fff", textWrap: "wrap" }}>
              {s.h2}
            </Titre2>
            {s.lead ? <p style={{ margin: 0, font: "400 16px/1.65 var(--fb)", color: "rgba(255,255,255,.78)" }}>{s.lead}</p> : null}
            {s.checks[0] ? (
              <span
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(255,124,60,.18)",
                  color: "#ffb08a",
                  font: "600 13px var(--fb)",
                }}
              >
                {s.checks[0]}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Questions({ s, id, ctx }: { s: SectionLP; id: string; ctx: Contexte }) {
  return (
    <section id={id} className={styles.sec} style={sectionStyle(ctx.fond)}>
      <div
        className={`${styles.pad} ${styles.g2}`}
        style={{ ...CADRE, display: "grid", gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)", gap: 48, alignItems: "start" }}
      >
        <div className={styles.statique} style={{ position: "sticky", top: 100 }}>
          {s.kick ? <SurTitre>{s.kick}</SurTitre> : null}
          <Titre2 style={{ textWrap: "wrap" }}>{s.h2}</Titre2>
          {s.lead ? <Chapo marge={14} style={{ font: "400 16px/1.6 var(--fb)" }}>{s.lead}</Chapo> : null}
          <a href={TELEPHONE_LP.href} className={styles.noir} style={{ ...BOUTON_NOIR, marginTop: 22 }}>
            Appeler le {TELEPHONE_LP.affichage}
          </a>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {s.faq.map((question) => (
            <details key={question.q} name="lpfaq" style={{ borderRadius: 18, background: ctx.carte, border: "1px solid #ecebe8", overflow: "hidden" }}>
              <summary
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  cursor: "pointer",
                  font: "600 16px/1.4 var(--ft)",
                  letterSpacing: "-.015em",
                  color: "#1c1b19",
                }}
              >
                {question.q}
                <span
                  aria-hidden="true"
                  className={styles.plus}
                  style={{
                    flex: "none",
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "rgba(28,27,25,.06)",
                    display: "grid",
                    placeItems: "center",
                    font: "400 18px/1 var(--fb)",
                    color: "#1c1b19",
                    transition: "transform .2s ease",
                  }}
                >
                  +
                </span>
              </summary>
              <p style={{ margin: 0, padding: "0 20px 18px", font: "400 15px/1.65 var(--fb)", color: "#4a4845" }}>{question.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact({ s, ctx }: { s: SectionLP; ctx: Contexte }) {
  return (
    <section id="lp-contact" className={styles.sec} style={{ position: "relative", overflow: "hidden", padding: "96px 0", background: "#f1f2f4" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -220,
          top: -260,
          width: 680,
          height: 680,
          borderRadius: 999,
          background: "radial-gradient(circle,rgba(255,124,60,.2),rgba(255,124,60,0) 65%)",
        }}
      />
      <div
        className={`${styles.pad} ${styles.g2}`}
        style={{ ...CADRE, position: "relative", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 56, alignItems: "center" }}
      >
        <div>
          {s.kick ? <SurTitre>{s.kick}</SurTitre> : null}
          <Titre2 taille={42} style={{ lineHeight: 1.08, letterSpacing: "-.04em" }}>
            {s.h2}
          </Titre2>
          {s.lead ? <Chapo style={{ textWrap: "wrap" }}>{s.lead}</Chapo> : null}
          <a
            href={TELEPHONE_LP.href}
            style={{ display: "inline-block", marginTop: 26, font: "700 30px/1 var(--ft)", letterSpacing: "-.03em", color: "#1c1b19" }}
          >
            {TELEPHONE_LP.affichage}
          </a>
          {s.details?.length ? (
            <ul style={{ display: "grid", gap: 10, margin: "26px 0 0", padding: 0, listStyle: "none" }}>
              {s.details.map((detail) => (
                <li key={detail.h} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "none",
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: "rgba(255,124,60,.14)",
                      color: "#b4490f",
                      display: "grid",
                      placeItems: "center",
                      font: "700 12px var(--fb)",
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ font: "400 14.5px/1.5 var(--fb)", color: "#4a4845" }}>
                    <strong style={{ fontWeight: 600, color: "#1c1b19" }}>{detail.h}</strong> {detail.d}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <Certifications certs={ctx.meta.certs} />
        </div>
        <div>
          <FormulaireLP variante="contact" page={ctx.chemin} titre={ctx.titreFormulaire} />
        </div>
      </div>
    </section>
  );
}
