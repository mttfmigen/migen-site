import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";
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
 * ────────────────────────────────────────────────────────────────────────────
 * RÉÉCRITE LE 09/10, SUR L'AUDIT DE NATHAN JOREZ. La page portait TREIZE
 * « à compléter » et un bandeau « Gabarit juridique » visibles par le visiteur :
 * une page publiée qui s'annonce elle-même comme un modèle vide. Trois choses
 * ont été faites, et rien de plus :
 *
 *   1. CE QUI EST CONNU EST RENSEIGNÉ, et seulement s'il est vérifiable :
 *      l'identité légale complète (`docs/IDENTITE-LEGALE.md`, extrait Pappers
 *      transmis par Mehdi, recoupé pièce par pièce avec l'annuaire des
 *      entreprises de l'État, voir le bloc de constantes plus bas), le siège
 *      (la maquette et CLAUDE.md), le téléphone (source unique
 *      `components/site/entete-donnees.ts`), l'hébergeur (décision actée en
 *      § 2 de CLAUDE.md, `.vercel/` et `.vercelignore` au dépôt) et sa raison
 *      sociale avec son adresse (relues le 09/10 sur les deux pages que Vercel
 *      publie elle-même, vercel.com/legal/privacy-policy et /legal/terms, qui
 *      portent le même texte : « Vercel Inc., 440 N Barranca Ave #4133, Covina,
 *      CA 91723 », et aucune des deux ne donne de numéro de téléphone).
 *
 *   2. CE QUI N'EST PAS CONNU N'EST PAS INVENTÉ, et ne porte plus d'étiquette de
 *      gabarit. Une seule phrase NOMME les deux mentions qui manquent encore, à
 *      l'intention du visiteur. Dire « le directeur de la publication n'est pas
 *      désigné » est vrai ; nommer d'office le représentant légal à sa place
 *      serait faux, et une mention légale fausse est opposable là où une mention
 *      absente est seulement incomplète.
 *
 *   3. LE BANDEAU « GABARIT JURIDIQUE » EST RETIRÉ. Il était adressé au conseil
 *      du client (« doivent être complétées et validées par votre conseil »),
 *      pas au visiteur : une note de chantier n'a rien à faire en copie
 *      publique. La maquette le porte encore, le contrôle le vérifie des deux
 *      côtés, et le dira le jour où elle le perd.
 *
 * LES LOGOS CLIENTS NE SONT PLUS DITS « UTILISÉS AVEC LEUR ACCORD ». 09/10,
 * audit de Nathan : la maquette l'affirme, le site affiche 38 logos clients, et
 * AUCUNE preuve de cet accord n'est versée au dépôt. Affirmer un accord non
 * documenté sur la page qui engage le plus est exactement ce qu'on ne peut pas
 * faire. La phrase dit maintenant le vrai (les marques appartiennent à leurs
 * titulaires, elles sont citées à titre de référence) et ouvre une voie de
 * retrait. Écart à la maquette ASSUMÉ et vérifié des deux côtés par
 * `verification-mentions-legales.tsx`.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * POURQUOI LES LIGNES SONT ÉTIQUETÉES une par une au lieu de suivre la phrase
 * de la maquette : « migen© [forme juridique] au capital de [montant] € »
 * devient illisible dès qu'on en retire les crochets. Un libellé par valeur
 * garde la correspondance exacte avec les emplacements de la maquette.
 *
 * LE CRÉDIT DE CARTOGRAPHIE DE LA MAQUETTE N'EST PAS PORTÉ. Elle crédite les
 * données Natural Earth via world-atlas, pour la carte de France que
 * `components/site/implantations/PageImplantations.tsx` ne porte pas, le contrat
 * interdisant d'ajouter d3 et topojson. Créditer une source dont le site ne sert
 * rien serait faux, sur la page où c'est le plus coûteux.
 *
 * LE CRÉDIT DE CONCEPTION DE LA MAQUETTE N'EST PAS PORTÉ NON PLUS (09/10). Elle
 * écrit « Conception et réalisation : [agence] » ; aucun nom d'agence ne figure
 * nulle part dans le dépôt. Même raison que la cartographie : un crédit est
 * facultatif, un crédit faux ne l'est pas.
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

/**
 * Date de la dernière révision du TEXTE de cette page, pas de son code.
 *
 * La maquette écrit « Dernière mise à jour : à compléter » et le site le
 * recopiait. Renseignée le 09/10 : une page légale sans date ne dit pas au
 * visiteur de quand datent les mentions qu'il lit. À REMETTRE À JOUR À CHAQUE
 * FOIS QUE LE TEXTE CHANGE, et seulement alors.
 */
const DATE_MISE_A_JOUR = "9 octobre 2026";

/**
 * Siège social. La maquette l'écrit ainsi, et Mehdi a tranché le 09/10 que le
 * siège est bien à Limonest, l'agence étant à Écully (voir le § 1 de CLAUDE.md,
 * qui renverse sa décision du 07/10). Il n'y a donc PLUS AUCUN écart entre la
 * maquette et cette page sur ce point.
 */
const SIEGE = "1 rue des Vergers, Bâtiment 3, 69760 Limonest, France";

/**
 * L'IDENTITÉ LÉGALE, RENSEIGNÉE LE 09/10 ET VÉRIFIÉE DEUX FOIS.
 *
 * SOURCE : `docs/IDENTITE-LEGALE.md`, extrait Pappers du 09/10/2026 transmis
 * par Mehdi. Rien n'est inventé, rien n'est déduit.
 *
 * RECOUPÉE, parce qu'une mention légale fausse est opposable :
 *   · l'annuaire des entreprises de l'État (annuaire-entreprises.data.gouv.fr,
 *     fiche 898436910), relu le 09/10, donne la même dénomination, la même
 *     forme, le même capital, le même SIRET de siège, la même adresse et le
 *     même code NAF ;
 *   · le SIREN et le SIRET passent la clé de Luhn ;
 *   · la clé du numéro de TVA recalculée depuis le SIREN, (12 + 3 × (SIREN mod
 *     97)) mod 97, vaut 66, exactement celle de l'extrait.
 *
 * « société par actions simplifiée » ET PAS « SASU » : l'extrait écrit SASU,
 * l'annuaire de l'État écrit SAS. Les deux sources ne disent pas la même chose
 * sur l'unipersonnalité, on retient donc la forme sur laquelle elles sont
 * d'accord. Une SASU EST une SAS, l'énoncé reste vrai dans les deux lectures.
 *
 * LES NUMÉROS SONT ESPACÉS PAR GROUPES, forme usuelle des mentions légales. Le
 * contrôle compare les chiffres, pas la typographie : réespacer ne le casse pas,
 * changer un chiffre le casse.
 */
const DENOMINATION = "MIGEN SERVICE";
const FORME_JURIDIQUE = "société par actions simplifiée";
const CAPITAL = "13 000 €";
const RCS = "898 436 910 R.C.S. Lyon";
const SIRET = "898 436 910 00027";
const TVA = "FR 66 898 436 910";

/**
 * Hébergeur du site. Vercel est une décision actée (§ 2 de CLAUDE.md), visible
 * au dépôt (`.vercel/`, `.vercelignore`, `scripts/verifie-deploiement.mjs`).
 *
 * Raison sociale et adresse relues le 09/10 sur les pages que Vercel publie
 * elle-même, et concordantes entre les deux. Le téléphone n'est PAS inventé :
 * Vercel n'en publie aucun, et c'est ce que la page dit.
 */
const HEBERGEUR =
  "Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.";

/**
 * Cible interne des deux renvois vers le formulaire : le courriel de l'éditeur
 * n'est pas connu, la page de contact l'est. Route `app/contact/page.tsx`, et
 * ligne `/contact/` de `docs/urls-site-actuel.json` : les deux sont vérifiées
 * par le contrôle, parce qu'une route hors inventaire sortirait du plan du site
 * et qu'une ligne sans route répondrait 404.
 */
const CHEMIN_CONTACT = "/contact/";

interface SectionLegale {
  /** L'ancre de la maquette, cible du sommaire. */
  id: string;
  titre: string;
  /** Une ligne par valeur, séparées par un retour comme dans la maquette. */
  lignes: readonly ReactNode[];
}

const SECTIONS: readonly SectionLegale[] = [
  {
    id: "l1",
    titre: "Éditeur du site",
    lignes: [
      `Dénomination sociale : ${DENOMINATION}, qui publie ce site sous le nom migen©`,
      `Forme juridique : ${FORME_JURIDIQUE}`,
      `Capital social : ${CAPITAL}`,
      `Siège social : ${SIEGE}`,
      `RCS : ${RCS}`,
      `SIRET du siège : ${SIRET}`,
      `TVA intracommunautaire : ${TVA}`,
      /* Le numéro du site, jamais celui de la landing page. Il vient de la
         source unique du projet plutôt que d'être recopié ici. */
      `Téléphone : ${TELEPHONE_SITE.affichage}`,
      <>
        Nous écrire{" "}:{" "}
        {/* Souligné, comme la mention RGPD de `components/formulaire/FormulaireContact.tsx` :
            le style global des liens ne pose ni soulignement ni couleur distincte, un
            renvoi noyé dans un paragraphe serait invisible hors survol. */}
        <Link href={CHEMIN_CONTACT} className="underline" prefetch={false}>
          le formulaire de la page Contact
        </Link>
      </>,
      /* LA SEULE PHRASE QUI DIT CE QUI MANQUE, et elle le nomme au lieu de
         laisser des étiquettes « à compléter » dans la page.

         Elle en nommait huit le matin du 09/10 ; `docs/IDENTITE-LEGALE.md` en a
         réglé six l'après-midi. Il en reste DEUX, et aucune des deux ne se
         trouve dans un registre : le directeur de la publication est une
         DÉSIGNATION de l'entreprise, pas une donnée du greffe (le représentant
         légal est connu, cela ne suffit pas à le désigner), et aucune adresse de
         courriel n'est documentée nulle part. */
      "Ne figurent pas encore sur cette page : le directeur de la publication et une adresse de courriel.",
    ],
  },
  {
    id: "l2",
    titre: "Hébergement",
    lignes: [
      `Hébergeur : ${HEBERGEUR}`,
      "Vercel ne publie pas de numéro de téléphone. Son adresse de contact publiée pour les données personnelles est privacy@vercel.com.",
    ],
  },
  {
    id: "l3",
    titre: "Propriété intellectuelle",
    lignes: [
      <>
        L’ensemble des contenus de ce site (textes, photographies, logos, charte
        graphique) est protégé par le droit de la propriété intellectuelle. Toute
        reproduction, représentation ou adaptation, totale ou partielle, sans
        autorisation écrite préalable est interdite. Les marques et logos de nos
        clients et partenaires figurant sur ce site appartiennent à leurs
        titulaires respectifs et sont cités à titre de référence. Pour demander
        le retrait d’une marque ou d’un logo,{" "}
        <Link href={CHEMIN_CONTACT} className="underline" prefetch={false}>
          écrivez-nous depuis la page Contact
        </Link>
        .
      </>,
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
      /* Le seul crédit photo documenté au dépôt : décision de Mehdi du 08/10,
         « Photos de ville : versions sous licence Envato », consignée dans
         `lib/decisions-copie.ts` et servie depuis `public/assets/villes/`. La
         phrase ne prétend pas couvrir les autres photographies, dont la licence
         n'est écrite nulle part. */
      "Photographies : les vues de villes sont sous licence Envato.",
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
          <p style={MISE_A_JOUR}>
            Dernière mise à jour{" "}: {DATE_MISE_A_JOUR}
          </p>
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
                      {/* Clé par rang et non par contenu : une ligne peut
                          désormais porter un lien, elle n'est plus forcément
                          une chaîne utilisable comme clé. */}
                      {section.lignes.map((ligne, index) => (
                        <Fragment key={`${section.id}-${index}`}>
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
