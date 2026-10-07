import { Fragment } from "react";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { LARGEUR } from "@/components/site/blocs/habillage";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import { urlAbsolue } from "@/lib/seo/url";

/**
 * Mentions légales, lignes 7754 à 7797 de `maquette/accueil-rendu.html`.
 *
 * POURQUOI UNE ROUTE STATIQUE et pas une ligne en base comme les 225 autres
 * pages : cet écran a sa mise en page propre, un sommaire collant et un corps
 * en deux colonnes qu'aucun gabarit ne réemploie. Next sert cette route avant
 * `app/[...slug]/page.tsx`. Elle est citée par le pied de page, donc par toutes
 * les pages du site, et répondait 404.
 *
 * CE QUI N'EST PAS RENSEIGNÉ RESTE VIDE. La maquette écrit ses valeurs légales
 * entre crochets, `[forme juridique]`, `[montant]`, `[numéro]`. Une mention
 * légale fausse est pire qu'absente : les crochets ne sont pas recopiés, chaque
 * valeur manquante porte « à compléter », la formule que la maquette emploie
 * elle-même pour la date de mise à jour. Le bandeau d'avertissement de la
 * maquette est conservé tant qu'il reste une valeur à renseigner.
 *
 * POURQUOI LES LIGNES SONT ÉTIQUETÉES une par une au lieu de suivre la phrase
 * de la maquette : « migen© [forme juridique] au capital de [montant] € »
 * devient illisible dès qu'on en retire les crochets. Un libellé par valeur
 * garde la correspondance exacte avec les emplacements de la maquette, et rend
 * visible ce qui manque.
 *
 * LE CRÉDIT DE CARTOGRAPHIE DE LA MAQUETTE N'EST PAS PORTÉ. Elle crédite les
 * données Natural Earth via world-atlas, pour la carte de France que
 * `components/site/implantations/PageImplantations.tsx` ne porte pas, le contrat
 * interdisant d'ajouter d3 et topojson. Créditer une source dont le site ne sert
 * rien serait faux, sur la page où c'est le plus coûteux.
 */

const CHEMIN = "/mentions-legales/";

/* Le meta title et la description viennent de `docs/urls-site-actuel.json`,
   ligne `/mentions-legales/` : ce sont ceux du site servi aujourd'hui, pas une
   rédaction de circonstance. Le titre n'est pas le H1, règle du projet. */
export const metadata: Metadata = {
  title: "Mentions légales, migen",
  description:
    "Informations légales, éditeur, hébergeur et propriété intellectuelle du site migen.",
  alternates: { canonical: urlAbsolue(CHEMIN) },
};

/** Ce que la maquette laisse entre crochets, et que personne n'a renseigné. */
const A_COMPLETER = "à compléter";

interface SectionLegale {
  /** L'ancre de la maquette, cible du sommaire. */
  id: string;
  titre: string;
  /** Une ligne par valeur, séparées par un retour comme dans la maquette. */
  lignes: readonly string[];
}

const SECTIONS: readonly SectionLegale[] = [
  {
    id: "l1",
    titre: "Éditeur du site",
    lignes: [
      "Éditeur : migen©",
      `Forme juridique : ${A_COMPLETER}`,
      `Capital social : ${A_COMPLETER}`,
      "Siège social : 129 chemin du Moulin Carron, 69130 Écully, France",
      `RCS : ${A_COMPLETER}`,
      `SIRET : ${A_COMPLETER}`,
      `TVA intracommunautaire : ${A_COMPLETER}`,
      /* Le numéro du site, jamais celui de la landing page. Il vient de la
         source unique du projet plutôt que d'être recopié ici. */
      `Téléphone : ${TELEPHONE_SITE.affichage}`,
      `Courriel : ${A_COMPLETER}`,
      `Directeur de la publication : ${A_COMPLETER}`,
    ],
  },
  {
    id: "l2",
    titre: "Hébergement",
    lignes: [
      `Hébergeur : ${A_COMPLETER}`,
      `Adresse de l’hébergeur : ${A_COMPLETER}`,
      `Téléphone de l’hébergeur : ${A_COMPLETER}`,
    ],
  },
  {
    id: "l3",
    titre: "Propriété intellectuelle",
    lignes: [
      "L’ensemble des contenus de ce site (textes, photographies, logos, charte graphique) est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation ou adaptation, totale ou partielle, sans autorisation écrite préalable est interdite. Les marques et logos de nos clients et partenaires figurant sur ce site appartiennent à leurs titulaires respectifs et sont utilisés avec leur accord.",
    ],
  },
  {
    id: "l4",
    titre: "Responsabilité",
    lignes: [
      "Les informations publiées sur ce site sont fournies à titre indicatif. Elles ne constituent ni un engagement contractuel, ni un devis. Seuls les documents contractuels signés entre migen© et son client font foi. Les liens vers des sites tiers n’engagent pas notre responsabilité quant à leur contenu.",
    ],
  },
  {
    id: "l5",
    titre: "Crédits",
    lignes: [
      `Conception et réalisation : ${A_COMPLETER}`,
      `Photographies : ${A_COMPLETER}`,
    ],
  },
];

/* Valeurs de la maquette, recopiées telles quelles. Aucun survol n'y est
   déclaré : pas de module CSS, il n'aurait rien à porter. */

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

/** La première entrée du sommaire porte l'orange de marque dans la maquette. */
const LIEN_SOMMAIRE_PREMIER: CSSProperties = {
  ...LIEN_SOMMAIRE,
  color: "var(--acc)",
};

const SEPARATEUR: CSSProperties = {
  height: 1,
  background: "var(--line)",
  margin: "24px 0",
};

const RENVOI_CONFIDENTIALITE: CSSProperties = {
  font: "600 14px var(--fb)",
  color: "var(--acc)",
  // Seul sous le sommaire, donc une cible tactile à lui : mesuré à 20 px de
  // haut sur téléphone, sous les 24 px du critère 2.5.8 de la WCAG 2.2.
  display: "inline-block",
  padding: "3px 0",
};

/**
 * Le renvoi de la maquette vers la politique de confidentialité.
 *
 * `/confidentialite/` et NON `/politique-de-confidentialite/`, qui est une 301
 * depuis le site WordPress : viser l'ancienne coûterait une redirection à chaque
 * clic et à chaque passage de robot. Même raison que dans
 * `components/formulaire/FormulaireContact.tsx`.
 */
const CHEMIN_CONFIDENTIALITE = "/confidentialite/";

const ARTICLE: CSSProperties = { maxWidth: "72ch" };

const BANDEAU: CSSProperties = {
  borderRadius: "var(--rad-s)",
  background: "var(--acc-w)",
  border: "1px solid rgba(255,124,60,.28)",
  padding: "20px 24px",
  margin: "0 0 32px",
};

const BANDEAU_TEXTE: CSSProperties = {
  font: "500 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
};

const TITRE2: CSSProperties = {
  font: "600 calc(24px * var(--ts))/1.25 var(--ft)",
  letterSpacing: "-.03em",
  margin: "0 0 14px",
  scrollMarginTop: 100,
};

const PARAGRAPHE: CSSProperties = {
  font: "400 16px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 22px",
};

const PARAGRAPHE_FINAL: CSSProperties = { ...PARAGRAPHE, margin: 0 };

export default function MentionsLegales() {
  return (
    // `mg-site` n'est pas décoratif : les rattrapages de marges, d'échelle de
    // titres et d'arrondis sous 760px de `app/globals.css` en dépendent tous.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <section style={LARGEUR_HAUT}>
          <h1 style={TITRE}>Mentions légales</h1>
          <p style={MISE_A_JOUR}>Dernière mise à jour{" "}: {A_COMPLETER}</p>
        </section>

        <section style={SECTION_CORPS}>
          <div style={LARGEUR}>
            {/* `mg-r2` fait tomber les deux colonnes en une sous 900px. */}
            <div className="mg-r2" style={GRILLE}>
              <nav style={COLONNE_SOMMAIRE} aria-label="Sommaire des mentions légales">
                <div style={ETIQUETTE_SOMMAIRE}>Sommaire</div>
                <div style={LISTE_SOMMAIRE}>
                  {SECTIONS.map((section, rang) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      style={rang === 0 ? LIEN_SOMMAIRE_PREMIER : LIEN_SOMMAIRE}
                    >
                      {section.titre}
                    </a>
                  ))}
                </div>
                <div style={SEPARATEUR} />
                <Link
                  href={CHEMIN_CONFIDENTIALITE}
                  style={RENVOI_CONFIDENTIALITE}
                  prefetch={false}
                >
                  Politique de confidentialité →
                </Link>
              </nav>

              <article style={ARTICLE}>
                <div style={BANDEAU}>
                  <p style={BANDEAU_TEXTE}>
                    Gabarit juridique{" "}: les mentions ci-dessous doivent être
                    complétées et validées par votre conseil. Les valeurs marquées
                    « {A_COMPLETER} » sont à renseigner.
                  </p>
                </div>
                {SECTIONS.map((section, rang) => (
                  <Fragment key={section.id}>
                    <h2 id={section.id} style={TITRE2}>
                      {section.titre}
                    </h2>
                    <p
                      style={
                        rang === SECTIONS.length - 1 ? PARAGRAPHE_FINAL : PARAGRAPHE
                      }
                    >
                      {section.lignes.map((ligne, index) => (
                        <Fragment key={ligne}>
                          {index > 0 ? <br /> : null}
                          {ligne}
                        </Fragment>
                      ))}
                    </p>
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
