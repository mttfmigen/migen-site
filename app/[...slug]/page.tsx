import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FilAriane from "@/components/cocon/FilAriane";
import Maillage from "@/components/cocon/Maillage";
import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import Article from "@/components/site/article/Article";
import Bloc from "@/components/site/blocs/Bloc";
import PageCasClients from "@/components/site/casclients/PageCasClients";
import PageEditoriale from "@/components/site/editorial/PageEditoriale";
import PageDomaine from "@/components/site/domaine/PageDomaine";
import PageDepartement from "@/components/site/implantation/PageDepartement";
import PageVille from "@/components/site/implantation/PageVille";
import PageImplantations from "@/components/site/implantations/PageImplantations";
import PageExpertises from "@/components/site/expertises/PageExpertises";
import PageFiche from "@/components/site/fiche/PageFiche";
import PageHub from "@/components/site/hub/PageHub";
import PageSousRubrique from "@/components/site/hub/PageSousRubrique";
import PageMetier from "@/components/site/metier/PageMetier";
import PageOffres from "@/components/site/offres/PageOffres";
import PageOffre from "@/components/site/offre/PageOffre";
import PageRessource from "@/components/site/ressource/PageRessource";
import PageSecteur from "@/components/site/secteur/PageSecteur";
import {
  articleParChemin,
  cheminCanonique,
  cheminsArticles,
  cheminsPublies,
  pageParChemin,
} from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";
import type { ContenuArticle } from "@/types/article";
import { estCasClients } from "@/types/casclients";
import type { ContenuPage, Section } from "@/types/contenu";
import { estDomaineOuSpecialite } from "@/types/domaine";
import { estEditorial } from "@/types/editorial";
import { estDepartement, estVille } from "@/types/implantation";
import { estImplantations } from "@/types/implantations";
import { estExpertises } from "@/types/expertises";
import { estFiche } from "@/types/fiche";
import { estHub, estSousRubrique } from "@/types/hub";
import { estMetierOuDomaine } from "@/types/metier";
import { estOffres } from "@/types/offres";
import { estOffre } from "@/types/offre";
import { estRessource } from "@/types/ressource";
import { estSecteur } from "@/types/secteur";

/**
 * Route attrape-tout du cocon : toute URL hiérarchique passe par ici.
 *
 * Elle rend le gabarit de vente en dix sections, porté de la maquette dans
 * `components/site/blocs/`. Les 126 pages du corpus suivent ce gabarit, et
 * l'ordre des sections est celui du tableau `contenu.sections`, écrit par
 * l'import. Le gabarit interdit de le réarranger à l'affichage.
 *
 * `params` est une promesse depuis Next 15, il faut l'attendre.
 */

/** ISR : une heure. Une publication urgente passe par la revalidation à la demande. */
export const revalidate = 3600;

/** Les dix types de section connus. Sert de garde à la lecture du jsonb. */
const TYPES_CONNUS: ReadonlySet<string> = new Set<Section["type"]>([
  "heros",
  "chiffres",
  "probleme",
  "offre",
  "deroule",
  "garanties",
  "cta",
  "preuves",
  "objections",
  "ctaFinal",
]);

/**
 * Lit le jsonb en se méfiant de lui.
 *
 * POURQUOI une validation ici plutôt qu'un simple transtypage : `pages.contenu`
 * est un `jsonb`, Postgres n'en garantit que la syntaxe. Une section écrite par
 * un import plus ancien, ou un type ajouté sans son bloc, ferait planter le
 * rendu de la page entière à la recherche d'un composant inexistant. On écarte
 * donc la section fautive et on sert le reste : une page amputée vaut mieux
 * qu'une erreur 500 sur une URL référencée.
 */
function sectionsValides(contenu: unknown): Section[] {
  if (!contenu || typeof contenu !== "object") return [];
  const sections = (contenu as Partial<ContenuPage>).sections;
  if (!Array.isArray(sections)) return [];
  return sections.filter(
    (s): s is Section =>
      !!s &&
      typeof s === "object" &&
      typeof (s as Section).type === "string" &&
      TYPES_CONNUS.has((s as Section).type),
  );
}

/**
 * Les chemins publiés sont rendus statiquement au build.
 *
 * L'accueil est exclue : son chemin `/` donne zéro segment, et c'est
 * `app/page.tsx` qui la sert. `dynamicParams` reste à sa valeur par défaut, si
 * bien qu'une page publiée après le build est rendue à la première visite au
 * lieu de renvoyer une 404.
 */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const [pages, articles] = await Promise.all([
    cheminsPublies(),
    cheminsArticles(),
  ]);
  return [...pages, ...articles]
    .map((chemin) => ({ slug: chemin.path.split("/").filter(Boolean) }))
    .filter(({ slug }) => slug.length > 0);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chemin = cheminCanonique(slug);
  const complete = await pageParChemin(chemin);
  if (complete) {
    return metadonneesSeo({
      seo: complete.seo,
      chemin,
      titreRepli: complete.page.titre_h1,
    });
  }

  const article = await articleParChemin(chemin);
  if (article) {
    return metadonneesSeo({
      seo: article.seo,
      chemin,
      titreRepli: article.article.titre,
    });
  }

  // Ni page ni article : `notFound()` est appelé par le rendu juste après. On
  // évite seulement de servir le titre du gabarit à une URL qui n'existe pas.
  return { title: "Page introuvable" };
}

export default async function PageDuCocon({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const chemin = cheminCanonique(slug);
  const complete = await pageParChemin(chemin);

  // Une URL du blog ne correspond à aucune ligne de `pages` : elle est servie
  // par la table `articles`, sous le seul préfixe /ressources/articles/.
  if (!complete) {
    const trouve = await articleParChemin(chemin);
    if (!trouve) notFound();
    const { article } = trouve;
    return (
      <Article
        titre={article.titre}
        contenu={article.contenu as unknown as ContenuArticle}
        publieLe={article.published_at}
        auteur={article.auteur}
      />
    );
  }

  const { page } = complete;

  // Trois gabarits cohabitent dans `pages.contenu` : celui de vente, en dix
  // sections, l'éditorial, en blocs suivis, et celui de secteur, juste en
  // dessous. On tranche sur ce que le jsonb porte réellement, pas sur ce qu'un
  // type déclare : il sort de la base en `unknown`.

  // Les gabarits de RUBRIQUE, pour `/offres/`, `/secteurs/`,
  // `/travaux-industriels/`, `/bureau-etudes/`, `/ressources/` et ses cinq
  // rayons, `/carriere/`, et les sous-pages de `/offres/residence/`. Deux
  // dessins, deux fichiers de maquette dédiés (gabarit 10 et gabarit 11), et
  // c'est la forme du corpus qui tranche : dix sections nommées d'un côté, un
  // corps suivi de l'autre. Ils passent AVANT l'éditorial, qui ne regarde que la
  // présence d'un tableau `blocs` et servirait une sous-rubrique en colonne de
  // lecture avec un sommaire que la maquette ne dessine pas.
  if (estHub(page.contenu)) {
    return (
      <PageHub
        titre={page.titre_h1}
        contenu={page.contenu}
        formulaire={`cocon${page.path.replace(/\//g, "-")}`}
        filAriane={<FilAriane path={page.path} />}
        maillage={<Maillage page={page} />}
      />
    );
  }

  if (estSousRubrique(page.contenu)) {
    return (
      <PageSousRubrique
        titre={page.titre_h1}
        contenu={page.contenu}
        formulaire={`cocon${page.path.replace(/\//g, "-")}`}
        filAriane={<FilAriane path={page.path} />}
        maillage={<Maillage page={page} />}
      />
    );
  }

  // Le gabarit RESSOURCE, pour les 35 pages feuilles de `/ressources/` :
  // en-tête de document avec sa pastille de format, carte de procédure
  // numérotée, barème en tableau, cartes collantes, appel de fin. Il passe
  // AVANT l'éditorial, qui servait ces pages jusqu'ici en colonne de lecture
  // avec un sommaire : la maquette n'en dessine aucun, et c'est ce que le
  // client a vu. Les six rayons de `/ressources/` restent éditoriaux, ce sont
  // des pages de liste.
  if (estRessource(page.contenu)) {
    return (
      <PageRessource
        titre={page.titre_h1}
        contenu={page.contenu}
        filAriane={<FilAriane path={page.path} />}
        maillage={
          <>
            <FormulaireBasDePage
              formulaire={`cocon${page.path.replace(/\//g, "-")}`}
            />
            <div
              style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
            >
              <Maillage page={page} />
            </div>
          </>
        }
      />
    );
  }

  if (estEditorial(page.contenu)) {
    return (
      <PageEditoriale
        titre={page.titre_h1}
        contenu={page.contenu}
        filAriane={<FilAriane path={page.path} />}
        maillage={
          <>
            <FormulaireBasDePage
              formulaire={`cocon${page.path.replace(/\//g, "-")}`}
            />
            <Maillage page={page} />
          </>
        }
      />
    );
  }

  // Le gabarit secteur, pour `/secteurs/<secteur>/` et
  // `/implantations/<ville>/<departement>/` : hero avec ses repères, enjeux du
  // terrain, territoire couvert, pages sœurs, appel. Ces pages ancrent, elles
  // ne vendent pas une offre : le gabarit de vente y annonçait une prestation
  // là où le visiteur cherche un secteur ou un département.
  if (estSecteur(page.contenu)) {
    return (
      <PageSecteur
        titre={page.titre_h1}
        contenu={page.contenu}
        filAriane={<FilAriane path={page.path} />}
        maillage={
          <>
            <FormulaireBasDePage
              formulaire={`cocon${page.path.replace(/\//g, "-")}`}
            />
            <div
              style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
            >
              <Maillage page={page} />
            </div>
          </>
        }
      />
    );
  }

  // Les gabarits VILLE et DÉPARTEMENT, pour les 42 pages filles de
  // `/implantations/`. La maquette leur donne DEUX dessins distincts, cinq
  // sections pour une ville, trois pour un département : une ville vend une
  // intervention sur un bassin industriel, un département couvre un territoire
  // et distribue vers ses voisins. Le gabarit de vente leur imposait ses dix
  // sections à toutes les deux. `PageDepartement` est une enveloppe au-dessus
  // de `PageSecteur`, qui porte déjà ces trois sections au pixel.
  if (estVille(page.contenu) || estDepartement(page.contenu)) {
    const Gabarit = estVille(page.contenu) ? PageVille : PageDepartement;
    return (
      <Gabarit
        titre={page.titre_h1}
        // Le garde a tranché juste au-dessus ; TypeScript ne relie pas le
        // composant choisi à la branche qui l'a choisi.
        contenu={page.contenu as never}
        filAriane={<FilAriane path={page.path} />}
        maillage={
          <>
            <FormulaireBasDePage
              formulaire={`cocon${page.path.replace(/\//g, "-")}`}
            />
            <div
              style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
            >
              <Maillage page={page} />
            </div>
          </>
        }
      />
    );
  }

  // Les gabarits 09 DOMAINE et 05 SPÉCIALITÉ, pour les 19 pages de
  // `/expertises/<domaine>/` et de ses sous-pages. Ils viennent de leurs
  // PROPRES fichiers Claude Design, « Migen - Gabarit 09 Domaine.dc.html » et
  // « Migen - Gabarit 05 Specialite.dc.html », versionnés en `maquette/`. Ces
  // pages passaient par le gabarit de vente parce que le portage précédent
  // n'avait lu que « Migen - Site final.dc.html », où le domaine ne tient qu'en
  // trois sections. Voir `types/domaine.ts`.
  //
  // CE GABARIT PORTE SON PROPRE FORMULAIRE, dans le panneau sombre de sa
  // dernière section, comme la maquette le dessine. La route ne doit donc PAS
  // lui ajouter `FormulaireBasDePage` : il y aurait deux `id="formulaire"` sur
  // la page, et l'ancre de ses six appels à l'action viserait le premier venu.
  if (estDomaineOuSpecialite(page.contenu)) {
    return (
      <PageDomaine
        titre={page.titre_h1}
        contenu={page.contenu}
        formulaire={`cocon${page.path.replace(/\//g, "-")}`}
        filAriane={<FilAriane path={page.path} />}
        maillageCocon={
          <div
            style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
          >
            <Maillage page={page} />
          </div>
        }
      />
    );
  }

  // Le gabarit MÉTIER, pour `/carriere/<metier>/`. Une fiche métier n'a ni
  // punchline, ni duo prestation-bénéfice, ni garanties : pliée au gabarit de
  // vente, elle annonçait une offre là où le visiteur cherche un poste ou une
  // compétence.
  if (estMetierOuDomaine(page.contenu)) {
    return (
      <PageMetier
        titre={page.titre_h1}
        contenu={page.contenu}
        filAriane={<FilAriane path={page.path} />}
        maillage={
          <>
            <FormulaireBasDePage
              formulaire={`cocon${page.path.replace(/\//g, "-")}`}
            />
            <div
              style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
            >
              <Maillage page={page} />
            </div>
          </>
        }
      />
    );
  }

  // Troisième gabarit : la fiche de cas client, les 28 pages /preuves/<client>/.
  // Elle porte son champ discriminant `gabarit: "fiche"`, contrairement au
  // gabarit de vente qui n'en a pas : c'est donc à elle de se reconnaître,
  // avant que le repli ne s'applique.
  if (estFiche(page.contenu)) {
    return (
      <PageFiche
        titre={page.titre_h1}
        contenu={page.contenu}
        filAriane={<FilAriane path={page.path} />}
        maillage={
          <>
            <FormulaireBasDePage
              formulaire={`cocon${page.path.replace(/\//g, "-")}`}
            />
            <div
              style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
            >
              <Maillage page={page} />
            </div>
          </>
        }
      />
    );
  }

  // Gabarit EXPERTISES, pour le hub `/expertises/` : héros à deux colonnes,
  // six natures d'intervention, répartition des heures en barres, neuf
  // domaines, spécialisations constructeur, secteurs, habilitations. Le gabarit
  // de vente ne sait rendre aucune de ces sections. On tranche sur le champ
  // `gabarit` du jsonb, jamais sur le chemin : une page se déclare par son
  // contenu, et une page fille de la branche peut très bien être une fiche de
  // domaine rendue par `PageMetier` juste au-dessus.
  if (estExpertises(page.contenu)) {
    return (
      <PageExpertises
        titre={page.titre_h1}
        contenu={page.contenu}
        formulaire={`cocon${page.path.replace(/\//g, "-")}`}
        filAriane={<FilAriane path={page.path} />}
        maillage={<Maillage page={page} />}
      />
    );
  }

  // Gabarit OFFRES, pour le hub `/offres/` : bandeau d'ouverture dont le visuel
  // porte les repères en incrustation, entrée par besoin en mosaïque, offres en
  // cartes numérotées dont une en panneau sombre, bloc de fin. Le gabarit de
  // vente empilait ici ses dix sections là où la maquette en dessine quatre, et
  // c'est ce que le client a vu : « les pages offres ne sont pas comme sur la
  // maquette ». Les sections du corpus que ce dessin ne prévoit pas (déroulé,
  // engagements, réalisations, questions fréquentes) ne sont pas perdues : le
  // gabarit les rend sous les siennes, par les mêmes blocs qu'avant.
  if (estOffres(page.contenu)) {
    return (
      <PageOffres
        titre={page.titre_h1}
        contenu={page.contenu}
        formulaire={`cocon${page.path.replace(/\//g, "-")}`}
        filAriane={<FilAriane path={page.path} />}
        maillage={<Maillage page={page} />}
      />
    );
  }

  // Le gabarit IMPLANTATIONS, pour `/implantations/` et celles de ses 42 pages
  // filles dont le corpus écrit ce discriminant : hero avec sa carte, cartes
  // d'agences, panneau international, maillage de villes et de départements.
  // Ces pages répondent à « depuis où intervenez-vous », elles ne vendent pas
  // une offre : le gabarit de vente leur imposait punchline et garanties.
  if (estImplantations(page.contenu)) {
    return (
      <PageImplantations
        titre={page.titre_h1}
        contenu={page.contenu}
        formulaire={`cocon${page.path.replace(/\//g, "-")}`}
        filAriane={<FilAriane path={page.path} />}
        maillage={<Maillage page={page} />}
      />
    );
  }

  // Troisième gabarit : la page de preuve. Elle porte ses chantiers, ses
  // chiffres et ses avis, et son propre formulaire en bas, si bien que la route
  // ne lui ajoute ni appel à l'action ni section de contact.
  if (estCasClients(page.contenu)) {
    return (
      <PageCasClients
        titre={page.titre_h1}
        contenu={page.contenu}
        formulaire={`cocon${page.path.replace(/\//g, "-")}`}
        filAriane={<FilAriane path={page.path} />}
        maillage={<Maillage page={page} />}
      />
    );
  }

  // Le gabarit OFFRE, pour les 18 pages de la branche `/offres/` : héros à
  // deux colonnes avec son propre formulaire, bande de quatre chiffres,
  // bascule avant / après, prestation, méthode, sélection, réalisations,
  // questions, autres offres. La maquette en dessine quatorze sections
  // (`sc-if value="{{ isOfferPage }}"`, l. 4706 à 5198) là où le gabarit de
  // vente n'en connaît que dix, dans un autre ordre : c'est ce que le client a
  // vu quand il a dit « les pages offres ne sont pas comme sur la maquette ».
  // On tranche sur le champ `gabarit` du jsonb, jamais sur le chemin : le hub
  // `/offres/` porte son propre gabarit, et une page fille peut être
  // éditoriale.
  if (estOffre(page.contenu)) {
    return (
      <PageOffre
        titre={page.titre_h1}
        contenu={page.contenu}
        formulaire={`cocon${page.path.replace(/\//g, "-")}`}
        filAriane={<FilAriane path={page.path} />}
        maillage={<Maillage page={page} />}
      />
    );
  }

  const sections = sectionsValides(page.contenu);

  return (
    // `mg-site` porte les règles d'adaptation mobile de la charte, toutes
    // préfixées par cette classe dans `app/globals.css`.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px 0" }}
        >
          <FilAriane path={page.path} />
        </div>

        {sections.length > 0 ? (
          sections.map((section, i) => (
            // L'index suffit comme clé : l'ordre du tableau EST le gabarit, il
            // ne se réarrange pas, et deux sections de même type ne se
            // distinguent par rien d'autre.
            <Bloc key={`${section.type}-${i}`} section={section} />
          ))
        ) : (
          // Une page de l'arborescence sans contenu importé n'affiche que son
          // titre et son maillage : pas de bloc vide, pas de texte inventé.
          <section
            style={{ maxWidth: 1200, margin: "0 auto", padding: "40px" }}
          >
            <h1
              style={{
                font: "700 clamp(34px,4.4vw,54px)/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: 0,
              }}
            >
              {page.titre_h1}
            </h1>
          </section>
        )}

        {/*
          Le formulaire de bas de page, sur TOUTES les pages du cocon.

          Il n'est pas décoratif : la constante `ANCRE_FORMULAIRE` de
          `components/site/blocs/habillage.ts` vaut `#formulaire`, et c'est la
          cible du bouton principal des dix sections du gabarit de vente. Sans
          cette section, les 126 pages portaient un appel à l'action qui ne
          menait nulle part, et `/contact/` affichait son titre sans un champ à
          remplir. C'est aussi ce que fait la maquette, qui termine chaque page
          par ce bloc.
        */}
        <FormulaireBasDePage formulaire={`cocon${page.path.replace(/\//g, "-")}`} />

        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
        >
          <Maillage page={page} />
        </div>
      </main>
    </div>
  );
}
