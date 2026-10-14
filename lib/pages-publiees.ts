import "server-only";

import { TITRE_HUB_EXPERTISES } from "@/components/site/expertises/expertises-donnees";
import { cheminsArticles, cheminsDuRelais, titresDuRelais } from "@/lib/contenu";
import { cheminNormalise } from "@/lib/redirections";
import { ROUTES_STATIQUES } from "@/lib/routes-statiques";
import datesRelevees from "@/lib/sitemap/dates.json";
import { plusRecente } from "@/lib/sitemap/xml";
import { lectureContenu } from "@/lib/supabase";

/**
 * LES PAGES PUBLIÉES, SOURCE UNIQUE du plan XML (`/sitemap_index.xml` et ses
 * sous-plans, `lib/sitemap/plan.ts`) et de `/plan-du-site/`.
 *
 * POURQUOI CE MODULE, mesuré le 14/10 vers 14h : `sitemap.xml` annonçait 259
 * adresses, toutes en 200, mais le plan du site n'en listait que 145, parce
 * qu'il ne lisait que la table `pages`. Il lui manquait l'accueil, les treize
 * routes statiques et les 101 pages du relais disque (34 villes, 13 études de
 * cas, les fiches carrière, `/offres/full-service/`, `/ressources/` et ses
 * contenus, 2 guides). Deux listes calculées chacune de son côté finissent par
 * diverger : elles lisent désormais toutes deux celle-ci.
 *
 * L'ORDRE EST CELUI DE L'ANCIEN `app/sitemap.ts`, pour que sa sortie reste
 * identique : les routes statiques, la table `pages` (par chemin), le relais
 * disque, puis les articles.
 *
 *  - la table `pages` sans les `noindex` de `seo` ;
 *  - les chemins du relais disque que la base n'a pas (décision de Mehdi du
 *    14/10 : servis en 200 et indexables, ils manquaient au plan) ;
 *  - les articles non `noindex` dont le pilier est publié ;
 *  - jamais une SOURCE DE REDIRECTION : son adresse répond 301, pas 200. Le
 *    croisement se fait avec l'index que le proxy applique, reçu en argument :
 *    une redirection ajoutée demain sort sa source des deux listes sans qu'on
 *    touche à ce fichier.
 *
 * L'ENSEMBLE DES SOURCES REDIRIGÉES EST UN ARGUMENT, et non une lecture faite
 * ici, parce que les deux appelants n'échouent pas de la même façon :
 * `sitemap.xml` préfère un build qui casse à des adresses mortes déclarées à
 * Google (`sourcesRedirigees()` jette), le plan HTML est cité par le pied de
 * page de tout le site et se replie sur les sources de la refonte. La liste,
 * elle, est la même.
 *
 * LE TITRE EST LE H1 SERVI, jamais un libellé écrit pour l'occasion : c'est le
 * texte du lien dans le plan. `scripts/verifie-plan-et-sitemap.mjs` le compare
 * page par page au H1 que l'adresse sert réellement.
 */

export interface PagePubliee {
  path: string;
  /** Le H1 que la page sert. */
  titre: string;
  /**
   * La date VRAIE de dernière modification, ou rien (règle du 14/10 : jamais
   * l'heure du build pour tout le monde). `updated_at` de la base pour ses
   * pages et ses articles ; pour les routes statiques et le relais disque, la
   * date que `scripts/releve-sitemap.mjs` relève dans l'historique git (ou la
   * date d'origine des 12 billets repris) et versionne dans
   * `lib/sitemap/dates.json`. Une page de la base que le relais remplace
   * prend la plus récente des deux.
   */
  lastModified?: Date;
}

/**
 * Le H1 RENDU par chacune des treize routes statiques. Relevé dans son
 * composant et comparé le 14/10 au H1 servi en production
 * (`https://migen-site.vercel.app`) : treize sur treize identiques.
 *
 * Écrit à la main parce qu'aucune de ces pages n'est en base, et que plusieurs
 * composent leur H1 de deux morceaux (« La maintenance industrielle, » et
 * « sans rupture de production. » sur l'accueil). Le type exige une ligne par
 * route : ajouter une route à `ROUTES_STATIQUES` sans son titre ne compile pas.
 * La porte `scripts/verifie-plan-et-sitemap.mjs` échoue si l'une d'elles change
 * de H1 sans que cette table suive.
 */
const TITRES_STATIQUES: Record<(typeof ROUTES_STATIQUES)[number], string> = {
  "/": "La maintenance industrielle, sans rupture de production.",
  "/contact/": "Dites-nous ce qu’il faut tenir. On vous rappelle dans l’heure.",
  "/nous-connaitre/": "Un seul métier : technicien de maintenance.",
  "/a-propos/equipe/": "Celles et ceux qui portent vos projets.",
  "/valeurs/": "Cinq règles, et la preuve qui va avec.",
  "/rse/": "En maintenance, la RSE se mesure en machines qu’on ne jette pas.",
  "/partenaires/": "Nos offres en partenariat, 100 % Made in France.",
  "/carriere/": "Nous rejoindre",
  "/marques/": "Les équipements que nous maintenons déjà",
  "/plan-du-site/": "Toutes nos pages, au même endroit.",
  "/mentions-legales/": "Mentions légales",
  "/confidentialite/": "Politique de confidentialité",
  // Quatorzième route, ajoutée le 14/10 : H1 de `app/cgv/page.tsx`.
  "/cgv/": "Conditions générales de vente",
  "/test-technicien/": "Huit questions. Celles qu’on pose vraiment en entretien.",
  // H1 par défaut de `HubRessources` (lecteur entreprise), relevé le 14/10 sur
  // la préproduction. La ligne `pages` de la base porte encore l'ancien H1
  // « Guide maintenance industrielle », que la page ne sert plus.
  "/ressources/": "Le terrain, mis par écrit.",
};

/**
 * Les H1 que le relais disque fait servir, par chemin. MÊME RÈGLE que
 * `pageParChemin()` (`lib/contenu.ts`) : quand le relais porte un `titre_h1`,
 * il l'emporte sur celui de la base. Lus dans `lib/contenu.ts`, qui connaît
 * tous les dossiers du relais (dont `blog-repris`, 14/10).
 */
const TITRES_DU_RELAIS: ReadonlyMap<string, string> = titresDuRelais();

/**
 * Les pages dont le COMPOSANT remplace le H1 de la base.
 *
 * `PageExpertises` sert `TITRE_HUB_EXPERTISES` tant que la base porte l'ancien
 * contenu de `/expertises/` (voir `estHubExpertises`). Mesuré le 14/10 : c'est
 * le seul des 246 chemins de la base et du relais dont le H1 servi n'est pas
 * celui de la règle base puis relais.
 */
const TITRES_DU_COMPOSANT: ReadonlyMap<string, string> = new Map([
  ["/expertises/", TITRE_HUB_EXPERTISES],
]);

const DATES_RELEVEES: Readonly<Record<string, string>> = datesRelevees;

/** La date relevée d'un chemin, ou rien. */
function dateRelevee(path: string): Date | undefined {
  const iso = DATES_RELEVEES[path];
  return iso ? new Date(iso) : undefined;
}

/** « /offres/residence/ » donne « residence » : le slug d'une page ou d'un article. */
function dernierSegment(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? "";
}

/** Le repli de `pageDeRelais` quand le relais n'écrit pas de titre. */
function humanise(path: string): string {
  const mot = dernierSegment(path).replace(/-/g, " ");
  return mot.charAt(0).toUpperCase() + mot.slice(1);
}

export async function pagesPubliees(
  redirigees: ReadonlySet<string>,
): Promise<PagePubliee[]> {
  const client = lectureContenu();

  // Requêtes plates plutôt qu'une jointure : l'`id` des pages sert à écarter
  // celles que `seo` marque `noindex`, et les titres d'articles se rattachent
  // par leur slug, dernier segment de leur chemin.
  const [pages, exclusions, titresArticles, articles] = await Promise.all([
    client.from("pages").select("id, path, titre_h1, updated_at").order("path"),
    client.from("seo").select("page_id").eq("noindex", true),
    client.from("articles").select("slug, titre"),
    cheminsArticles(),
  ]);

  const erreur = pages.error ?? exclusions.error ?? titresArticles.error;
  if (erreur) throw new Error(`Pages publiées : ${erreur.message}`);

  const listePages = pages.data ?? [];
  const exclus = new Set(
    (exclusions.data ?? [])
      .map((ligne) => ligne.page_id)
      .filter((id): id is string => id !== null),
  );
  const cheminsDeBase = new Set(listePages.map((page) => page.path));
  const statiques: readonly string[] = ROUTES_STATIQUES;
  const titreArticle = new Map(
    (titresArticles.data ?? []).map((a) => [a.slug, a.titre]),
  );
  const estRedirigee = (path: string) => redirigees.has(cheminNormalise(path));

  return [
    ...ROUTES_STATIQUES.map((path) => ({
      path,
      titre: TITRES_STATIQUES[path],
      lastModified: dateRelevee(path),
    })),
    ...listePages
      // Une route statique qui a aussi sa ligne en base (`/ressources/`) n'est
      // listée qu'une fois, avec le H1 que son composant sert.
      .filter((page) => !statiques.includes(page.path))
      .filter((page) => !exclus.has(page.id))
      .filter((page) => !estRedirigee(page.path))
      .map((page) => ({
        path: page.path,
        titre:
          TITRES_DU_COMPOSANT.get(page.path) ??
          TITRES_DU_RELAIS.get(page.path) ??
          page.titre_h1,
        lastModified: plusRecente([new Date(page.updated_at), dateRelevee(page.path)]),
      })),
    // La date relevée de son fichier, jamais celle de `pageDeRelais` : c'est
    // une date fixe de synthèse, et une fausse date vaut moins qu'aucune.
    ...cheminsDuRelais()
      .filter((path) => !cheminsDeBase.has(path))
      .filter((path) => !statiques.includes(path))
      .filter((path) => !estRedirigee(path))
      .map((path) => ({
        path,
        titre: TITRES_DU_RELAIS.get(path) ?? humanise(path),
        lastModified: dateRelevee(path),
      })),
    ...articles
      .filter((article) => !article.noindex)
      .map((article) => ({
        path: article.path,
        // Le H1 d'un article est son `titre` (`app/[...slug]/page.tsx`).
        titre: titreArticle.get(dernierSegment(article.path)) ?? humanise(article.path),
        lastModified: new Date(article.updated_at),
      })),
  ];
}
