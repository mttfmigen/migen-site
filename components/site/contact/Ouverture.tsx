import Link from "next/link";
import type { CSSProperties } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";

import styles from "./Contact.module.css";

/**
 * Ouverture de la page contact, portée de `maquette/accueil-rendu.html`,
 * lignes 2951 à 3000.
 *
 * Composant serveur : le seul élément interactif est le formulaire, qui est
 * déjà un composant client autonome et porte sa validation, son champ piège et
 * sa mention RGPD. La maquette dessinait ses deux états (`sc-if sent` /
 * `notSent`) à la main, ils sont dans le composant.
 */

/** Identifiant d'analyse des conversions de ce formulaire. */
export const FORMULAIRE_CONTACT = "contact-besoin";

const VALEUR: CSSProperties = {
  font: "600 22px var(--ft)",
  letterSpacing: "-.04em",
};

const LIBELLE: CSSProperties = {
  font: "400 12.5px var(--fb)",
  color: "var(--ink4)",
  marginTop: 2,
};

const TRAIT: CSSProperties = {
  width: 1,
  height: 34,
  background: "var(--line)",
};

/* Capsule de verre des deux appels à l'action, valeurs de la maquette. */
const CAPSULE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--gsol)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
};

/* Trois repères sous le titre. La maquette écrivait « 5 agences en France »,
   que le contrat de projet corrige en quatre agences : voir le détail dans
   `app/contact/page.tsx`. « +200 clients industriels » est rendu mot pour mot. */
const REPERES: readonly { valeur: string; libelle: string }[] = [
  { valeur: "4", libelle: "agences" },
  { valeur: "10 %", libelle: "des techniciens retenus" },
  { valeur: "+200", libelle: "clients industriels" },
];

export default function Ouverture() {
  return (
    <section
      id="form-page"
      style={{
        scrollMarginTop: 96,
        maxWidth: 1200,
        margin: "0 auto",
        padding: "70px 40px 0",
      }}
    >
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.12fr .88fr",
          gap: 52,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 26,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,var(--gl-a))",
                backdropFilter: "blur(var(--gl-b))",
                WebkitBackdropFilter: "blur(var(--gl-b))",
                border: "1px solid var(--gbd)",
                font: "600 12px var(--fb)",
                letterSpacing: ".02em",
                color: "var(--ink1)",
                boxShadow: "0 2px 10px rgba(0,0,0,.05)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--acc)",
                }}
              />
              Rappel dans l’heure
            </span>
            <span style={{ font: "400 12.5px var(--fb)", color: "var(--ink4)" }}>
              Astreinte
            </span>
          </div>

          <h1
            style={{
              font: "600 calc(clamp(38px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "16ch",
              textWrap: "balance",
            }}
          >
            Dites-nous ce qu’il faut tenir.{" "}
            <span style={{ color: "var(--ink4)" }}>
              On vous rappelle dans l’heure.
            </span>
          </h1>

          <p
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "26px 0 0",
              maxWidth: "48ch",
            }}
          >
            Un chargé d’affaires étudie votre demande, sélectionne les
            techniciens adaptés et vous les présente pour validation avant toute
            intervention. Ligne à l’arrêt&nbsp;? Appelez directement
            l’astreinte.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 26,
              flexWrap: "wrap",
            }}
          >
            <Link href="/offres/" className={styles.capsuleVerre} style={CAPSULE}>
              Les cinq offres
            </Link>
            {/* La maquette laissait ici une seconde capsule vide. Le paragraphe
                au-dessus dit « appelez directement l'astreinte » : sans numéro
                visible, la phrase n'a pas de suite. Le numéro vient de
                `entete-donnees.ts`, source unique du site. */}
            <a
              href={TELEPHONE_SITE.href}
              className={styles.capsuleVerre}
              style={CAPSULE}
            >
              Astreinte&nbsp;: {TELEPHONE_SITE.affichage}
            </a>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              marginTop: 34,
              paddingTop: 26,
              borderTop: "1px solid var(--line)",
              flexWrap: "wrap",
            }}
          >
            {REPERES.map((repere, rang) => (
              <div
                key={repere.libelle}
                style={{ display: "flex", alignItems: "center", gap: 26 }}
              >
                {rang > 0 ? <div style={TRAIT} /> : null}
                <div>
                  <div style={VALEUR}>{repere.valeur}</div>
                  <div style={LIBELLE}>{repere.libelle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            id="besoin"
            style={{
              position: "relative",
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              borderRadius: "var(--rad)",
              padding: "30px 30px 32px",
              boxShadow:
                "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                columnGap: 14,
                rowGap: 6,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  font: "600 20px/1.2 var(--ft)",
                  letterSpacing: "-.03em",
                  whiteSpace: "nowrap",
                }}
              >
                Décrire mon besoin
              </div>
              <div
                style={{
                  font: "500 11.5px var(--fb)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                }}
              >
                Rappel dans l’heure
              </div>
            </div>

            <FormulaireContact formulaire={FORMULAIRE_CONTACT} />
          </div>
        </div>
      </div>
    </section>
  );
}
