import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FilAriane from "@/components/cocon/FilAriane";
import Maillage from "@/components/cocon/Maillage";
import Bloc from "@/components/site/blocs/Bloc";
import { cheminCanonique, cheminsPublies, pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";
import type { ContenuPage, Section } from "@/types/contenu";

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
  const chemins = await cheminsPublies();
  return chemins
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

  // Pas de page : `notFound()` est appelé par le rendu juste après. On évite
  // seulement de servir le titre du gabarit à une URL qui n'existe pas.
  if (!complete) return { title: "Page introuvable" };

  return metadonneesSeo({
    seo: complete.seo,
    chemin,
    titreRepli: complete.page.titre_h1,
  });
}

export default async function PageDuCocon({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const chemin = cheminCanonique(slug);
  const complete = await pageParChemin(chemin);
  if (!complete) notFound();

  const { page } = complete;
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

        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
        >
          <Maillage page={page} />
        </div>
      </main>
    </div>
  );
}
