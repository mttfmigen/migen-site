/**
 * Les redirections, et la seule liste de ce qui N'EST PLUS UNE PAGE.
 *
 * POURQUOI CE MODULE EXISTE. Trois endroits ont besoin de savoir qu'un chemin
 * est la SOURCE d'une redirection et non une page :
 *   · `proxy.ts`, pour renvoyer le visiteur ;
 *   · `app/sitemap.ts`, pour ne pas déclarer à Google une adresse qui redirige ;
 *   · `app/plan-du-site/page.tsx`, pour ne pas en poser le lien.
 *
 * MESURÉ LE 13/10, et c'est ce qui a fait écrire ce fichier : le plan du site
 * publiait 162 URL dont QUATRE répondaient 301, jamais 200. Deux étaient les
 * fiches inventées retirées du corpus (G56), `/implantations/maintenance-
 * industrielle-marseille/` et `/implantations/toulouse/bordeaux/`, deux autres
 * étaient des sources de redirection de la refonte, `/offres/maintenance-
 * externalisee/` et `/realisations/`. Les quatre gardent une ligne `published`
 * dans la table `pages`, que le plan lit sans rien savoir des redirections.
 *
 * LA CAUSE N'EST PAS LE PLAN, C'EST L'INDEX : quatre lignes de `pages`
 * décrivent des chemins qui ne servent plus de page. Le remède de fond est de
 * les retirer de la table. Il n'est pas applicable depuis ce dépôt : la clé de
 * service est absente de `.env.local` (voir B2 dans GATES.md), la base n'est
 * donc lisible qu'avec la clé anonyme. En attendant, le plan croise l'index des
 * pages avec l'INDEX DES REDIRECTIONS, qui est l'autre moitié de la vérité, et
 * non avec une liste d'exclusions écrite à la main. Le jour où les quatre
 * lignes quittent `pages`, rien ici ne change et le croisement devient vide de
 * conséquence.
 *
 * AUCUN SECRET : la clé anonyme suffit, la policy RLS « redirections actives,
 * lecture publique » ne laisse remonter que les lignes `actif`. Ce module
 * n'importe PAS `lib/supabase.ts` : il est lu par le proxy, qui tourne avant
 * chaque rendu, et dont c'est le code le plus chaud du site. Une requête HTTP
 * nue suffit à lire trois colonnes.
 */

export interface Redirection {
  source: string;
  destination: string;
  code: number;
}

export type TableRedirections = Map<string, Redirection>;

/**
 * La forme canonique d'un chemin : minuscules et slash final.
 *
 * POURQUOI les minuscules : Postgres compare `path` au caractère près, donc
 * « /Depannage/ » et « /depannage/ » servent le même contenu sous deux URL, ce
 * que Google compte comme du contenu dupliqué. La même règle est appliquée côté
 * rendu par `cheminCanonique()` dans `lib/contenu.ts`.
 *
 * POURQUOI on épargne un dernier segment contenant un point : une destination
 * de redirection peut viser un fichier (« /plaquette.pdf »), et lui coller un
 * slash final le rendrait introuvable. Le `config.matcher` du proxy écarte déjà
 * ces chemins côté requête, cette fonction fait la même chose côté destination.
 */
export function cheminNormalise(chemin: string): string {
  const minuscule = chemin.toLowerCase();
  if (minuscule.endsWith("/")) return minuscule;

  const dernier = minuscule.slice(minuscule.lastIndexOf("/") + 1);
  return dernier.includes(".") ? minuscule : `${minuscule}/`;
}

/**
 * Les 301 de la refonte, versionnées ici et non en base.
 *
 * Source : dossier de passation, « Adresses modifiées par la refonte »
 * (`design_handoff_migen_site/README.md`), et G56 pour les deux fiches
 * inventées retirées du corpus.
 *
 * POURQUOI STATIQUES : leur place est la table `redirects`, mais la base n'est
 * pas inscriptible depuis ce dépôt (clé de service absente de `.env.local`).
 * Cette liste ne dépend d'aucun réseau : elle tient même quand Supabase est
 * injoignable.
 *
 * ORDRE : la table passe d'abord. Une ligne en base pour la même source
 * l'emporte, et une ligne en base qui VISE une de ces anciennes adresses est
 * renvoyée directement à la nouvelle, en un seul saut (voir `proxy`).
 *
 * POUR LA RETIRER, le jour où la base les porte : insérer ces lignes dans
 * `redirects` (code 301, `actif`), faire pointer vers `/offres/full-service/`
 * les deux lignes qui visent encore `/offres/maintenance-externalisee/`,
 * vérifier par `curl -I` que les anciennes adresses répondent 301 sur la
 * bonne `Location`, puis supprimer cette constante et ses usages.
 *
 * Clés sous forme canonique (`cheminNormalise`) : la recherche se fait sur la
 * forme canonique de la requête.
 */
export const REDIRECTIONS_REFONTE: TableRedirections = new Map(
  (
    [
      ["/implantations/toulouse/bordeaux/", "/implantations/bordeaux/"],
      ["/implantations/maintenance-industrielle-marseille/", "/implantations/marseille/"],
      ["/offres/maintenance-externalisee/", "/offres/full-service/"],
      ["/equipe/", "/a-propos/equipe/"],
      ["/realisations/", "/preuves/"],
    ] as const
  ).map(([source, destination]) => [
    source,
    { source, destination, code: 301 },
  ]),
);

/**
 * Les sources de redirection connues SANS LE RÉSEAU : celles de la refonte.
 *
 * Elle existe pour que le plan du site de `/plan-du-site/`, qui absorbe
 * volontairement ses erreurs de lecture, puisse quand même écarter les quatre
 * adresses mesurées le 13/10 quand la base est injoignable. Elle n'est PAS un
 * substitut à `sourcesRedirigees()` : une redirection posée en base par un
 * éditeur n'y figure pas.
 */
export const SOURCES_REFONTE: ReadonlySet<string> = new Set(
  REDIRECTIONS_REFONTE.keys(),
);

/**
 * Tous les chemins qui sont la SOURCE d'une redirection active : la table plus
 * la liste de la refonte, sous forme canonique.
 *
 * ELLE JETTE SI LA TABLE EST ILLISIBLE, et c'est voulu côté plan du site :
 * publier à nouveau des adresses mortes est plus coûteux qu'un build qui
 * échoue en le disant. L'appelant qui ne peut pas se permettre d'échouer
 * attrape et se replie sur `SOURCES_REFONTE`, explicitement.
 */
export async function sourcesRedirigees(): Promise<ReadonlySet<string>> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !cle) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquante : " +
        "les sources de redirection ne peuvent pas être lues.",
    );
  }

  /* UNE HEURE DE CACHE DE DONNÉES, PAS `no-store`, et c'est mesuré : la
     première version de cette fonction copiait le `cache: "no-store"` du
     proxy, qui lui est juste parce qu'il gère son propre cache de soixante
     secondes et n'a pas accès au cache de rendu de Next. Dans une route de
     RENDU, `no-store` vaut `revalidate: 0` et fait basculer la route entière
     en dynamique : au build du 13/10, `/sitemap.xml` et `/plan-du-site/` sont
     passés de « ○ 1h » à « ƒ », donc rendus à chaque requête, contre le
     principe 1 du contrat. Une heure, comme la revalidation des deux routes
     qui lisent cette fonction. */
  const reponse = await fetch(
    `${base}/rest/v1/redirects?select=source&actif=eq.true`,
    {
      headers: { apikey: cle, Authorization: `Bearer ${cle}` },
      next: { revalidate: 3600 },
    },
  );

  if (!reponse.ok) {
    throw new Error(
      `Lecture des sources de redirection : ${reponse.status} ${reponse.statusText}`,
    );
  }

  const lignes = (await reponse.json()) as { source: string }[];
  return new Set([
    ...SOURCES_REFONTE,
    ...lignes.map((ligne) => cheminNormalise(ligne.source)),
  ]);
}
