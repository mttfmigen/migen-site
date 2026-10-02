import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  BOUTON_SECONDAIRE,
  LARGEUR,
  SECTION,
  SURTITRE,
  TITRE2,
  VERRE,
} from "@/components/site/blocs/habillage";

import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page introuvable",
  // Une 404 ne doit pas entrer dans l'index.
  robots: { index: false, follow: true },
};

/**
 * Les grandes portes du site, vers lesquelles rattraper le visiteur.
 *
 * POURQUOI cette page compte : le projet porte 21 redirections depuis l'ancien
 * site WordPress et 225 chemins. Un visiteur ou un robot atterrit ici, et son
 * seul recours est cette liste.
 *
 * Les chemins sont vérifiés un par un dans `docs/urls-site-actuel.json` par
 * `app/verification-introuvable.tsx` : une 404 qui pointe vers une 404 serait
 * une faute. Le slash final fait partie de la forme canonique du projet, sans
 * lui chaque clic partirait en redirection.
 *
 * Les résumés reprennent la description de la page visée dans l'inventaire,
 * raccourcie. Aucun texte inventé, et la liste n'est pas lue en base : une page
 * introuvable doit rester servie même quand la base est injoignable.
 */
const PORTES: readonly { href: string; titre: string; resume: string }[] = [
  {
    href: "/offres/",
    titre: "Offres",
    resume: "Cinq façons de nous confier votre maintenance.",
  },
  {
    href: "/expertises/",
    titre: "Expertises",
    resume: "Dix domaines techniques, des techniciens évalués.",
  },
  {
    href: "/implantations/",
    titre: "Implantations",
    resume: "Un siège à Lyon, dix hubs de techniciens, des interventions partout en France.",
  },
  {
    href: "/contact/",
    titre: "Contact",
    resume: "Décrivez votre besoin, un chargé d’affaires vous rappelle dans l’heure.",
  },
];

/**
 * Sur-titre de section, en `--acc-ink` là où la maquette écrit `--acc`.
 *
 * POURQUOI cet écart, le seul de la page : l'orange de marque (#ff7c3c) ne vaut
 * que 2,6:1 sur le fond crème du site, pour un texte de 11,5 px. Le plancher est
 * de 4,5:1 (WCAG 1.4.3). `--acc-ink` (#7d3309) en vaut 8:1 sur le même fond :
 * c'est le remède déjà retenu par `components/site/blocs/Blocs.module.css` pour
 * les liens du corpus, et il garde l'orange de la charte. Les deux rapports sont
 * calculés, pas supposés, dans `app/verification-introuvable.tsx`.
 */
const SURTITRE_LISIBLE: CSSProperties = {
  ...SURTITRE,
  color: "var(--acc-ink)",
};

/**
 * La carte de lien de la maquette (`maquette/accueil-rendu.html`, ligne 2583) :
 * un `<a>` qui EST la carte, en verre, soulevé de 3 px au survol. Ses 160 px de
 * hauteur minimale portent aussi la cible tactile du critère 2.5.8.
 */
const CARTE: CSSProperties = {
  ...VERRE,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minHeight: 160,
  padding: "24px 24px 22px",
  transition: "transform var(--tr)",
};

/** Mêmes valeurs que la maquette, ligne 2583, pour les trois lignes de la carte. */
const CARTE_TITRE: CSSProperties = {
  font: "600 calc(22px * var(--ts)) var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
};

const CARTE_RESUME: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "var(--ink2)",
};

const CARTE_ACTION: CSSProperties = {
  font: "600 12.5px var(--fb)",
  color: "var(--acc-ink)",
  marginTop: "auto",
};

export default function PageIntrouvable() {
  return (
    // `mg-site` n'est pas décoratif : les règles de `app/globals.css` qui
    // rattrapent les marges, l'échelle du H1 et les arrondis sous 760px sont
    // toutes préfixées par cette classe, et c'est elle qui pose le fond crème.
    <div className="mg-site">
      {/* La barre de navigation est en position fixe, d'où ce dégagement, celui
          de la maquette et de l'accueil. */}
      <main style={{ paddingTop: 96 }}>
        {/* Géométrie du héros de la maquette, ligne 2952. Le `max-width` reste
            écrit en pixels : les marges mobiles de `app/globals.css` visent
            `section[style*="max-width:1200px"]`. */}
        <section
          style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}
        >
          <div style={SURTITRE_LISIBLE}>Page introuvable</div>
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
            Cette page n&apos;existe pas
          </h1>
          <p
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "26px 0 0",
              maxWidth: "48ch",
            }}
          >
            L&apos;adresse demandée ne correspond à aucune page du site. Le lien
            suivi est peut-être incomplet, ou la page a changé d&apos;adresse.
          </p>
          <div
            style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}
          >
            {/*
              Le bouton de verre, et pas le bouton orange plein de la charte :
              celui-ci porte du blanc sur #ff7c3c, soit 2,6:1, très au-dessous du
              plancher de 4,5:1. Le verre tient 16:1 sur le même fond, et c'est
              le motif que la maquette emploie elle-même pour le seul bouton du
              héros de la page contact (ligne 2965).
            */}
            <Link
              href="/"
              className={styles.boutonVerre}
              style={BOUTON_SECONDAIRE}
            >
              Revenir à l&apos;accueil
            </Link>
          </div>
        </section>

        <section style={SECTION}>
          <div style={LARGEUR}>
            <h2 style={{ ...TITRE2, marginBottom: 36 }}>
              Les grandes portes du site
            </h2>
            {/* La grille de cartes de la maquette (ligne 2582), qui se replie
                d'elle-même du quatre colonnes au téléphone, sans point de
                bascule à maintenir.

                `auto-fit` là où la maquette écrit `auto-fill`, et c'est la même
                intention : la maquette aligne six cartes, qui remplissent la
                rangée. Ici il y en a quatre pour cinq pistes possibles, et
                `auto-fill` garderait la cinquième, vide, en laissant la rangée
                s'arrêter aux trois quarts de la page. `auto-fit` la retire et
                les quatre cartes occupent la largeur. */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
                gap: 12,
              }}
            >
              {PORTES.map((porte) => (
                <Link
                  key={porte.href}
                  href={porte.href}
                  className={styles.carteLien}
                  style={CARTE}
                >
                  <span style={CARTE_TITRE}>{porte.titre}</span>
                  <span style={CARTE_RESUME}>{porte.resume}</span>
                  {/* Hors du nom accessible du lien : le titre et le résumé le
                      disent déjà, « Y aller » n'ajoute qu'une répétition dans
                      un lecteur d'écran. */}
                  <span style={CARTE_ACTION} aria-hidden="true">
                    Y aller →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
