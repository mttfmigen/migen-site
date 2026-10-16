import Image from "next/image";

import { LOGOS_MAQUETTE } from "@/components/site/accueil/MarqueeClients";
import type { MetaLP, SectionLP } from "@/lib/lp/pages";

import { BOUTON_NOIR, CADRE, type Contexte, TEL } from "./atomes-lp";
import styles from "./PageLP.module.css";

/**
 * Les bandeaux de `MigenLP` (maquette V3), hors alternance des fonds : logos
 * clients qui défilent, chiffres, appel d'urgence.
 */

/** Le nom lu par les lecteurs d'écran : celui du bandeau du site (« McCain »,
    « GLS »), la maquette V3 le dérivait du nom de fichier (« Mccain », « Gls »). */
const nomDuClient = (client: MetaLP["clients"][number]) =>
  LOGOS_MAQUETTE.find((logo) => logo.src === client.src)?.alt ?? client.n;

export function Logos({ s, ctx }: { s: SectionLP; ctx: Contexte }) {
  const tuile = (client: MetaLP["clients"][number], copie: boolean) => (
    <span
      key={`${client.src}${copie ? "-copie" : ""}`}
      style={{ flex: "none", width: 148, height: 64, borderRadius: 14, background: "#f6f6f7", display: "grid", placeItems: "center" }}
    >
      <span style={{ position: "relative", width: 100, height: 30 }}>
        <Image src={client.src} alt={copie ? "" : nomDuClient(client)} fill sizes="100px" style={{ objectFit: "contain" }} />
      </span>
    </span>
  );
  return (
    <div style={{ padding: "34px 0", background: "#fff", borderBottom: "1px solid #ecebe8" }}>
      <p
        style={{
          margin: "0 0 18px",
          padding: "0 18px",
          textAlign: "center",
          font: "600 11.5px var(--fb)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#77736d",
        }}
      >
        {s.t}
      </p>
      <div
        style={{
          overflow: "hidden",
          WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
          maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
        }}
      >
        {/* La liste passe deux fois pour boucler sans saut ; la seconde est
            muette pour les lecteurs d'écran. */}
        <div className={styles.piste}>
          {ctx.meta.clients.map((client) => tuile(client, false))}
          {ctx.meta.clients.map((client) => tuile(client, true))}
        </div>
      </div>
    </div>
  );
}

export function Chiffres({ s }: { s: SectionLP }) {
  return (
    <div style={{ background: "#fff" }}>
      <div className={styles.pad} style={{ ...CADRE, padding: "8px 40px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          {s.stats.map((chiffre) => (
            <div
              key={chiffre.l}
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "26px 24px",
                borderRadius: 24,
                background: "linear-gradient(160deg,#fff,#f3f3f5)",
                border: "1px solid #ecebe8",
                boxShadow: "0 20px 44px -34px rgba(0,0,0,.4)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: -34,
                  top: -34,
                  width: 120,
                  height: 120,
                  borderRadius: 999,
                  background: "radial-gradient(circle,rgba(255,124,60,.22),rgba(255,124,60,0) 70%)",
                }}
              />
              <div style={{ position: "relative", font: "700 44px/1 var(--ft)", letterSpacing: "-.045em", color: "#1c1b19" }}>
                {chiffre.v}
              </div>
              <div style={{ position: "relative", marginTop: 10, font: "500 14px/1.45 var(--fb)", color: "#6a6764" }}>{chiffre.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Urgence({ s }: { s: SectionLP }) {
  return (
    <div style={{ background: "#fff" }}>
      <div className={styles.pad} style={{ ...CADRE, padding: "12px 40px 40px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px 24px",
            padding: "20px 24px",
            borderRadius: 22,
            background: "#fff4ee",
            border: "1px solid rgba(255,124,60,.3)",
          }}
        >
          <p style={{ margin: 0, font: "600 18px/1.35 var(--ft)", letterSpacing: "-.02em", color: "#1c1b19" }}>
            {s.t}{" "}
            <a href={TEL.href} style={{ color: "#b4490f", whiteSpace: "nowrap" }}>
              {TEL.affichage}
            </a>
          </p>
          <a href="#lp-contact" className={styles.noir} style={{ ...BOUTON_NOIR, padding: "12px 18px", font: "600 14px var(--fb)", whiteSpace: "nowrap" }}>
            {s.cta} →
          </a>
        </div>
      </div>
    </div>
  );
}

/** La vignette d'un hub : la LP de sa ville quand elle existe, le contact sinon (Dijon). */
