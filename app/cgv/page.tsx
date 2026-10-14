import { Fragment } from "react";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { LARGEUR } from "@/components/site/blocs/habillage";
import { urlAbsolue } from "@/lib/seo/url";
import { vignetteDeLaPage } from "@/lib/seo/vignette";

import { ENTETE, SECTIONS, TITRE_DOCUMENT } from "./texte";

/**
 * Conditions générales de vente, route STATIQUE, sur le modèle exact de
 * `app/mentions-legales/page.tsx` : même entête, même sommaire collant, même
 * corps en deux colonnes.
 *
 * POURQUOI ELLE EXISTE : les devis de Migen renvoient à https://migen.fr/cgv.
 * Sans elle, la bascule du domaine cassait ce lien sur chaque devis envoyé.
 * Jusqu'au 14/10, `/cgv/` était redirigée à titre provisoire vers
 * `/mentions-legales/`, qui ne contient pas les CGV ; la ligne est retirée de
 * `lib/redirections-ancien-site.ts` dans le même commit que cette page.
 *
 * Le texte vit dans `./texte.ts`, copie mot pour mot de l'ancienne page : voir
 * son en-tête pour la seule modification autorisée (les tirets).
 */

const CHEMIN = "/cgv/";

/* Le titre n'est pas le h1, règle du projet : `verifie-seo.mjs` retire « | … »
   avant de comparer, « Conditions générales de vente | Migen » y serait lu
   comme le h1 recopié. « (CGV) » est l'intitulé que porte le document. */
export const metadata: Metadata = {
  title: "Conditions générales de vente (CGV) | Migen",
  description:
    "Les conditions générales de vente de Migen Service s’appliquent de plein droit à toute commande de prestations de services passée par un client professionnel.",
  alternates: { canonical: urlAbsolue(CHEMIN) },
  // Répétés comme dans les mentions légales : un `openGraph` de page remplace
  // celui de la racine en entier, Next ne fusionne pas les champs imbriqués.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    url: urlAbsolue(CHEMIN),
    images: vignetteDeLaPage(CHEMIN),
  },
};

/** « ARTICLE 4 : DURÉE, … » devient « Article 4 » dans le sommaire : les
    titres entiers, en capitales, dépasseraient la hauteur d'un écran et le
    sommaire collant ne montrerait plus sa fin. */
function etiquette(titre: string): string {
  const tete = titre.split(" : ")[0];
  return tete.charAt(0) + tete.slice(1).toLowerCase();
}

/* Valeurs de `app/mentions-legales/page.tsx`, recopiées : un fichier de page
   ne peut pas exporter autre chose que ses champs Next. */

const LARGEUR_HAUT: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "70px 40px 0",
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(32px,3.6vw,52px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "20ch",
  textWrap: "balance",
};

const MISE_A_JOUR: CSSProperties = {
  font: "400 16px/1.6 var(--fb)",
  color: "var(--ink4)",
  margin: "18px 0 0",
};

const SECTION_CORPS: CSSProperties = { padding: "48px 0 var(--sec)" };

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".32fr .68fr",
  gap: 60,
  alignItems: "start",
};

const COLONNE_SOMMAIRE: CSSProperties = { position: "sticky", top: 110 };

const ETIQUETTE_SOMMAIRE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink4)",
  marginBottom: 16,
};

const LISTE_SOMMAIRE: CSSProperties = { display: "grid", gap: 9 };

const LIEN_SOMMAIRE: CSSProperties = {
  font: "500 14px/1.5 var(--fb)",
  color: "var(--ink1)",
};

const LIEN_SOMMAIRE_PREMIER: CSSProperties = {
  ...LIEN_SOMMAIRE,
  color: "var(--acc)",
};

const SEPARATEUR: CSSProperties = {
  height: 1,
  background: "var(--line)",
  margin: "24px 0",
};

const RENVOI: CSSProperties = {
  font: "600 14px var(--fb)",
  color: "var(--acc)",
  display: "inline-block",
  padding: "3px 0",
};

const ARTICLE: CSSProperties = { maxWidth: "72ch" };

/* Plus petit que le h2 des mentions légales (24 px) : ici les titres sont en
   capitales et courent sur deux lignes. */
const TITRE2: CSSProperties = {
  font: "600 calc(18px * var(--ts))/1.35 var(--ft)",
  letterSpacing: "-.01em",
  margin: "0 0 14px",
  scrollMarginTop: 100,
};

const TITRE2_SUIVANT: CSSProperties = { ...TITRE2, marginTop: 40 };

const PARAGRAPHE: CSSProperties = {
  font: "400 16px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 22px",
};

export default function ConditionsGeneralesDeVente() {
  return (
    // `mg-site` porte les rattrapages mobiles de `app/globals.css`.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <section style={LARGEUR_HAUT}>
          <h1 style={TITRE}>{TITRE_DOCUMENT}</h1>
          <p style={MISE_A_JOUR}>{ENTETE}</p>
        </section>

        <section style={SECTION_CORPS}>
          <div style={LARGEUR}>
            {/* `mg-r2` fait tomber les deux colonnes en une sous 900px. */}
            <div className="mg-r2" style={GRILLE}>
              {/* `mg-resrail` décolle le sommaire sous 980px : en une colonne,
                  collant, il passait PAR-DESSUS le texte (mesuré à 390px). */}
              <nav
                className="mg-resrail"
                style={COLONNE_SOMMAIRE}
                aria-label="Sommaire des conditions générales de vente"
              >
                <div style={ETIQUETTE_SOMMAIRE}>Sommaire</div>
                <div style={LISTE_SOMMAIRE}>
                  {SECTIONS.map((section, rang) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      style={rang === 0 ? LIEN_SOMMAIRE_PREMIER : LIEN_SOMMAIRE}
                    >
                      {etiquette(section.titre)}
                    </a>
                  ))}
                </div>
                <div style={SEPARATEUR} />
                <Link href="/mentions-legales/" style={RENVOI} prefetch={false}>
                  Mentions légales →
                </Link>
              </nav>

              <article style={ARTICLE}>
                {SECTIONS.map((section, rang) => (
                  <Fragment key={section.id}>
                    <h2 id={section.id} style={rang === 0 ? TITRE2 : TITRE2_SUIVANT}>
                      {section.titre}
                    </h2>
                    {section.paragraphes.map((lignes, index) => (
                      <p key={`${section.id}-${index}`} style={PARAGRAPHE}>
                        {lignes.map((ligne, n) => (
                          <Fragment key={n}>
                            {n > 0 ? <br /> : null}
                            {ligne}
                          </Fragment>
                        ))}
                      </p>
                    ))}
                  </Fragment>
                ))}
              </article>
            </div>
          </div>
        </section>
        <div style={{ height: "var(--sec)" }} />
      </main>
    </div>
  );
}
