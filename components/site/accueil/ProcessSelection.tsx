import Image from "next/image";
import Link from "next/link";

import CarteEtapes from "./CarteEtapes";
import styles from "./ProcessSelection.module.css";

/**
 * « Notre sélection » : seuls 10 % des techniciens réussissent le process.
 *
 * SOURCE : `design_handoff_migen_site/maquette/MigenSelection.dc.html`, refait
 * par Mehdi sur Claude Design le 08/10. Gabarit, styles en ligne et textes
 * repris tels quels ; ses deux `@media` et ses `style-hover` vivent dans le
 * module CSS. Composant serveur : seule la carte des étapes, qui défile toute
 * seule, est un composant client (`CarteEtapes.tsx`).
 *
 * Deux écarts voulus avec la source :
 *   · le bouton vise `#formulaire`, l'ancre du formulaire de bas de page sur le
 *     site (`#form-bas` est celle de la maquette, elle n'existe pas ici) ;
 *   · la photo passe par next/image, qui pose lui-même la position absolue et
 *     l'occupation pleine du cadre que la source écrit en ligne.
 */

const CRITERES = ["Sécurité", "Diagnostic", "Autonomie", "Compte rendu", "Relation client", "Habilitations"] as const;

export default function ProcessSelection() {
  return (
    <section style={{ padding: "var(--sec,120px) 0 0" }}>
      <div className={styles.wrap} style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          className={styles.tete}
          style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,.95fr)", gap: "24px 64px", alignItems: "end", marginBottom: "34px" }}
        >
          <div>
            <div style={{ font: "600 11.5px var(--fb)", letterSpacing: ".14em", textTransform: "uppercase", color: "#ff7c3c", marginBottom: "16px" }}>
              Notre sélection
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.4vw,48px) * var(--ts,1))/1.06 var(--ft)",
                letterSpacing: "-.045em",
                color: "var(--ink)",
                margin: 0,
                maxWidth: "17ch",
                textWrap: "balance",
              }}
            >
              {"Seuls 10 % des techniciens réussissent notre process."}
            </h2>
          </div>
          <div>
            <p style={{ font: "400 16.5px/1.7 var(--fb)", color: "var(--ink2)", margin: "0 0 22px", maxWidth: "48ch", textWrap: "pretty" }}>
              Six étapes, menées par des techniciens de terrain, pas par un algorithme. C’est ce qui nous permet de vous envoyer quelqu’un qu’on peut laisser seul devant votre machine.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 24px" }}>
              <a
                href="#formulaire"
                className={styles.cta}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "14px 24px",
                  borderRadius: "999px",
                  background: "#ff7c3c",
                  color: "#fff",
                  font: "600 14.5px var(--fb)",
                  whiteSpace: "nowrap",
                  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
                  transition: "filter .2s ease,transform .2s ease",
                }}
              >
                Constituer mon équipe →
              </a>
              <Link
                href="/offres/residence/"
                className={styles.lien}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", font: "600 14.5px var(--fb)", color: "var(--ink)", whiteSpace: "nowrap", transition: "color .2s ease" }}
              >
                Découvrir migen© Résidence →
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.bento} style={{ display: "grid", gridTemplateColumns: "minmax(0,5fr) minmax(0,7fr)", gap: "14px", alignItems: "stretch" }}>
          <div
            className={styles.photo}
            style={{ position: "relative", minHeight: "520px", borderRadius: "var(--rad,28px)", overflow: "hidden", background: "#2a2927", boxShadow: "0 30px 70px -40px rgba(0,0,0,.5)" }}
          >
            <Image
              src="/assets/web/sv-portrait.jpg"
              alt="Technicien migen en intervention sur une ligne d’intralogistique"
              fill
              sizes="(max-width: 980px) 100vw, 470px"
              style={{ objectFit: "cover", objectPosition: "56% 28%", filter: "saturate(var(--sat,.55)) contrast(1.05)" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(20,19,18,0) 26%,rgba(20,19,18,.5) 56%,rgba(20,19,18,.93) 100%)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "30px 30px 28px" }}>
              <div style={{ display: "flex", alignItems: "baseline", font: "600 calc(clamp(84px,8.4vw,124px) * var(--ts,1))/.86 var(--ft)", letterSpacing: "-.06em", color: "#fff" }}>
                <span>10</span>
                <span style={{ fontSize: ".46em", letterSpacing: "-.02em", marginLeft: ".12em" }}>%</span>
              </div>
              <div style={{ font: "500 16px/1.45 var(--fb)", color: "rgba(255,255,255,.9)", marginTop: "14px", maxWidth: "30ch", textWrap: "pretty" }}>
                des techniciens rencontrés vont jusqu’au bout des six étapes.
              </div>
              <div style={{ height: "1px", background: "rgba(255,255,255,.2)", margin: "22px 0 16px" }} />
              <div style={{ font: "600 10.5px var(--fb)", letterSpacing: ".13em", textTransform: "uppercase", color: "rgba(255,255,255,.72)", marginBottom: "11px" }}>
                Un même référentiel, de la sélection au suivi en mission
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {CRITERES.map((critere) => (
                  <span
                    key={critere}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,.14)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,.2)",
                      font: "500 12.5px var(--fb)",
                      color: "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {critere}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <CarteEtapes />
        </div>
      </div>
    </section>
  );
}
