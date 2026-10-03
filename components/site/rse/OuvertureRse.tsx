import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "@/components/site/blocs/Blocs.module.css";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  PANNEAU,
  SURTITRE,
} from "@/components/site/blocs/habillage";

/**
 * Ouverture de la page RSE : promesse à gauche, panneau du chiffre sécurité à
 * droite. Portée de `maquette/accueil-rendu.html`, lignes 5674 à 5704.
 *
 * Composant serveur : aucun état, aucune écoute.
 *
 * DEUX ÉCARTS À LA MAQUETTE.
 *
 * 1. Le chapeau écrivait « C'est notre métier (tiret cadratin) et de loin notre
 *    premier l-e-v-i-e-r environnemental ». Le mot est proscrit par le contrat,
 *    le tiret cadratin aussi. La phrase dit maintenant l'effet obtenu.
 * 2. Les deux boutons portaient `href="#"` et un verbe d'éditeur. Le premier
 *    visait l'écran de contact : il pointe l'ancre du formulaire de CETTE page,
 *    qui existe (`ANCRE_FORMULAIRE`), plutôt que d'envoyer le visiteur ailleurs
 *    alors que le formulaire est au bas de la page. Le second vise /valeurs/,
 *    vérifiée à 200 sur le serveur de développement.
 */

/* La lueur orange du panneau, aux dimensions de CET écran : 400px cadrée en
   haut à droite, là où `habillage.LUEUR` est cadrée en bas. */
const LUEUR_HAUTE: CSSProperties = {
  position: "absolute",
  width: 400,
  height: 400,
  right: -160,
  top: -180,
  background: "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
  pointerEvents: "none",
};

/* Cadre d'un logo d'organisme dans le panneau sombre. La maquette y posait un
   rectangle en pointillés portant le nom en texte, c'est-à-dire un emplacement
   d'image à venir. Les deux logos existent dans `public/assets/logos`, déjà
   servis par la section Certifications de l'accueil : on sert l'image, sur fond
   blanc puisqu'un logo en couleurs ne tient pas sur un fond anthracite. */
const CADRE_LOGO: CSSProperties = {
  width: 104,
  height: 56,
  borderRadius: 9,
  background: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "7px 10px",
  flex: "none",
};

const IMAGE_LOGO: CSSProperties = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  display: "block",
};

export default function OuvertureRse() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}>
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.08fr .92fr",
          gap: 52,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ ...SURTITRE, marginBottom: 18 }}>Nos engagements RSE</div>
          <h1
            style={{
              font: "600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "18ch",
              textWrap: "balance",
            }}
          >
            En maintenance, la RSE se mesure en machines qu’on ne jette pas.
          </h1>
          <p
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "24px 0 0",
              maxWidth: "50ch",
            }}
          >
            Prolonger la vie d’une ligne de dix ans, c’est éviter des tonnes
            d’acier neuf et un chantier complet. C’est notre métier, et de loin
            ce qui évite le plus d’impact environnemental. Le reste suit&nbsp;:
            la sécurité des équipes, l’emploi local, et des achats qui ne
            traversent pas l’Europe.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <a
              className={styles.boutonAction}
              href={ANCRE_FORMULAIRE}
              style={BOUTON_ACTION}
            >
              Demander nos attestations
            </a>
            {/* `Link` et non `<a>` : cible interne du site, préchargée, et
                `@next/next/no-html-link-for-pages` l'exige. L'appel à l'action
                voisin reste un `<a>`, son ancre ne change pas de page. */}
            <Link
              className={styles.boutonSecondaire}
              href="/valeurs/"
              style={BOUTON_SECONDAIRE}
            >
              Nos valeurs
            </Link>
          </div>
        </div>

        <div style={{ ...PANNEAU, padding: "32px 34px 34px" }}>
          <div style={LUEUR_HAUTE} />
          <div style={{ position: "relative" }}>
            <div style={{ ...SURTITRE, marginBottom: 20 }}>
              Le chiffre qui compte
            </div>
            <div
              style={{
                font: "600 calc(clamp(56px,6.4vw,88px) * var(--ts))/.9 var(--ft)",
                letterSpacing: "-.055em",
                color: "var(--acc)",
              }}
            >
              2
            </div>
            <div
              style={{
                font: "400 16px/1.6 var(--fb)",
                color: "rgba(255,255,255,.72)",
                marginTop: 14,
                maxWidth: "30ch",
              }}
            >
              accidents du travail avec arrêt en 2025, sur plus de
              90&nbsp;000 heures d’intervention. S’y ajoutent 3 accidents sans
              arrêt et 1 accident de trajet.
            </div>
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,.12)",
                margin: "22px 0",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <span style={CADRE_LOGO}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/logos/mase.png" alt="MASE" style={IMAGE_LOGO} />
              </span>
              <span style={CADRE_LOGO}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logos/ecovadis.webp"
                  alt="EcoVadis"
                  style={IMAGE_LOGO}
                />
              </span>
              <span
                style={{
                  font: "400 12.5px/1.5 var(--fb)",
                  color: "rgba(255,255,255,.5)",
                  flex: 1,
                  minWidth: 140,
                }}
              >
                Démarche MASE et évaluation EcoVadis. Attestations transmises
                avec chaque plan de prévention.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
