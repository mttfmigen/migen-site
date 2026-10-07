import { NextResponse, type NextRequest } from "next/server";

/**
 * Redirections éditoriales et slash final.
 *
 * Ce fichier s'appelait `middleware.ts` : Next 16 a renommé la convention en
 * `proxy`, et l'export `middleware` en `proxy`. Le nom dit mieux ce que fait ce
 * code, qui décide d'une route avant le rendu et rien d'autre. Son exécution a
 * lieu sur le runtime Node, qui n'est pas configurable : contrairement à
 * l'ancien middleware, il ne part PAS en périphérie.
 *
 * Pourquoi `fetch` sur l'API REST de Supabase plutôt que le client
 * `@supabase/supabase-js` : c'est le code le plus chaud du site, il s'exécute
 * avant chaque rendu. Une requête HTTP nue suffit à lire trois colonnes,
 * embarquer un client complet (temps réel, auth, stockage) y serait du poids
 * mort.
 *
 * Aucun secret ici : la clé anonyme suffit, la policy RLS « redirections
 * actives, lecture publique » ne laisse remonter que les lignes `actif`.
 */

/** Durée de vie du cache des redirections. */
const DUREE_CACHE_MS = 60_000;

interface Redirection {
  source: string;
  destination: string;
  code: number;
}

type Table = Map<string, Redirection>;

/**
 * Cache en mémoire, soixante secondes.
 *
 * Sans lui, chaque visite ferait un aller-retour vers Supabase avant le premier
 * octet de la page. Soixante secondes est le compromis assumé : une redirection
 * ajoutée par un éditeur est active au bout d'une minute au pire, et le trafic
 * d'une minute ne produit qu'une seule requête.
 *
 * Le cache garde la *promesse* et non la table : dix requêtes simultanées sur un
 * cache froid partagent le même aller-retour au lieu d'en déclencher dix. Il est
 * propre à chaque instance d'exécution, c'est un cache de meilleur effort et non
 * une source de vérité.
 */
let cache: { expireLe: number; table: Promise<Table> } | null = null;

function variable(nom: string): string | null {
  return process.env[nom] ?? null;
}

async function chargeRedirections(): Promise<Table> {
  const base = variable("NEXT_PUBLIC_SUPABASE_URL");
  const cle = variable("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!base || !cle) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquante : " +
        "les redirections ne peuvent pas être lues.",
    );
  }

  const reponse = await fetch(
    `${base}/rest/v1/redirects?select=source,destination,code&actif=eq.true`,
    {
      headers: { apikey: cle, Authorization: `Bearer ${cle}` },
      // Le cache est géré ici, pas par la couche de données de Next : le
      // proxy n'a pas accès au cache de rendu.
      cache: "no-store",
    },
  );

  if (!reponse.ok) {
    throw new Error(
      `Lecture des redirections : ${reponse.status} ${reponse.statusText}`,
    );
  }

  const lignes = (await reponse.json()) as {
    source: string;
    destination: string;
    code: number;
  }[];

  return new Map(
    lignes.map((ligne) => [
      ligne.source,
      {
        source: ligne.source,
        destination: ligne.destination,
        code: ligne.code,
      },
    ]),
  );
}

/**
 * Les trois 301 de la refonte, versionnées ici et non en base.
 *
 * Source : dossier de passation, « Adresses modifiées par la refonte »
 * (`design_handoff_migen_site/README.md`).
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
 * POUR LA RETIRER, le jour où la base les porte : insérer les trois lignes dans
 * `redirects` (code 301, `actif`), faire pointer vers `/offres/full-service/`
 * les deux lignes qui visent encore `/offres/maintenance-externalisee/`,
 * vérifier par `curl -I` que les trois anciennes adresses répondent 301 sur la
 * bonne `Location`, puis supprimer cette constante et ses deux usages.
 *
 * Clés sous forme canonique (`cheminNormalise`) : la recherche se fait sur la
 * forme canonique de la requête.
 */
const REDIRECTIONS_REFONTE: Table = new Map(
  (
    [
      // EN ATTENTE, à décommenter quand le gabarit 04 Ville sert leurs cibles :
      // aujourd'hui /implantations/bordeaux/ et /implantations/marseille/ sont
      // des 404, et ces deux anciennes adresses répondent 200. Les rediriger
      // maintenant transformerait deux pages vivantes en pages mortes.
      //   ["/implantations/toulouse/bordeaux/", "/implantations/bordeaux/"],
      //   ["/implantations/maintenance-industrielle-marseille/", "/implantations/marseille/"],
      ["/offres/maintenance-externalisee/", "/offres/full-service/"],
    ] as const
  ).map(([source, destination]) => [
    source,
    { source, destination, code: 301 },
  ]),
);

function redirections(): Promise<Table> {
  const maintenant = Date.now();
  if (cache && cache.expireLe > maintenant) return cache.table;

  const table = chargeRedirections();
  cache = { expireLe: maintenant + DUREE_CACHE_MS, table };

  // Un échec ne doit pas être figé une minute : on vide le cache pour que la
  // requête suivante réessaie.
  table.catch(() => {
    if (cache?.table === table) cache = null;
  });

  return table;
}

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
 * slash final le rendrait introuvable. Le `config.matcher` écarte déjà ces
 * chemins côté requête, cette fonction fait la même chose côté destination.
 */
function cheminNormalise(chemin: string): string {
  const minuscule = chemin.toLowerCase();
  if (minuscule.endsWith("/")) return minuscule;

  const dernier = minuscule.slice(minuscule.lastIndexOf("/") + 1);
  return dernier.includes(".") ? minuscule : `${minuscule}/`;
}

/**
 * L'URL demandée, en `URL` standard et non en `NextURL`.
 *
 * POURQUOI : un `NextURL` (donc `request.nextUrl.clone()`) mémorise si la
 * requête REÇUE finissait par un slash, et réécrit le chemin selon cette
 * mémoire au moment de produire l'en-tête `Location`. Sur « /offres », le slash
 * posé ici était aussitôt retiré : `Location: /offres`, une 308 vers elle-même,
 * en boucle, sur toute URL du site demandée sans slash final. Mesuré le 07/10
 * au `curl -I`. Un `URL` standard écrit le chemin tel qu'on le pose.
 */
function urlSansNextUrl(request: NextRequest): URL {
  return new URL(request.nextUrl.href);
}

/**
 * La cible d'une redirection, reconstruite comme chemin interne et rien d'autre.
 *
 * POURQUOI ne pas poser `new URL(destination, request.url)` directement : la
 * colonne `destination` est éditoriale. Une valeur du type
 * « https://exemple.invalid/ », « //exemple.invalid » ou même
 * « /\exemple.invalid » fait basculer l'hôte au moment de l'analyse, et le site
 * se met à expédier ses visiteurs ailleurs sous l'autorité de son propre
 * domaine. On ne retient donc que le chemin, la requête et le fragment, reposés
 * sur l'URL demandée : l'origine ne peut pas changer, puisqu'elle n'est jamais
 * relue de la destination.
 *
 * La contrainte `redirects_destination_interne` (0001) refuse déjà ces lignes à
 * l'écriture. Ce filtre est la seconde ligne de défense, pour le cas où une
 * ligne serait entrée avant la contrainte ou par un autre chemin.
 */
function cibleInterne(destination: string, request: NextRequest): URL | null {
  if (!destination.startsWith("/")) return null;
  if (destination.startsWith("//")) return null;
  if (destination.includes("\\")) return null;

  const analysee = new URL(destination, request.nextUrl.origin);
  // Le slash final de la destination suit la même règle que celui de la
  // requête : sans cela, une destination « /offres » déclencherait aussitôt la
  // redirection de slash, soit une chaîne de deux sauts là où un seul suffit.
  // Un `URL` nu, pas un clone de `request.nextUrl` : voir `urlSansNextUrl`.
  const cible = urlSansNextUrl(request);
  cible.pathname = cheminNormalise(analysee.pathname);
  cible.search = analysee.search;
  cible.hash = analysee.hash;
  return cible;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const chemin = request.nextUrl.pathname;
  const canonique = cheminNormalise(chemin);

  let table: Table | null = null;
  try {
    table = await redirections();
  } catch (erreur) {
    // Une base injoignable ne doit pas rendre le site inaccessible : on laisse
    // passer la requête, en gardant la trace du problème côté serveur.
    console.error("Proxy, redirections indisponibles :", erreur);
  }

  // Les anciennes URL sont stockées telles qu'elles existaient, avec ou sans
  // slash final, et parfois avec des majuscules. On tente la forme reçue puis
  // la forme canonique avant de conclure. La liste statique de la refonte ne
  // vient qu'après la table, et s'applique même si la table est injoignable.
  const regle =
    table?.get(chemin) ??
    table?.get(canonique) ??
    REDIRECTIONS_REFONTE.get(canonique);
  if (regle) {
    // Une ligne de la base qui vise une adresse retirée par la refonte saute
    // directement à la nouvelle : un seul saut, jamais une chaîne de deux.
    const destination =
      REDIRECTIONS_REFONTE.get(cheminNormalise(regle.destination))
        ?.destination ?? regle.destination;
    const cible = cibleInterne(destination, request);
    if (cible) return NextResponse.redirect(cible, regle.code);

    // Une destination externe est une erreur de donnée, pas une redirection à
    // honorer : on la journalise et on laisse la requête suivre son cours.
    console.error(
      `Proxy, destination non interne ignorée pour « ${regle.source} ».`,
    );
  }

  // Casse et slash final, en un seul saut : deux redirections enchaînées
  // coûteraient un aller-retour de plus au visiteur et à Google.
  //
  // `next.config.ts` porte `skipTrailingSlashRedirect: true`, ce qui rend ce
  // bloc seul maître du slash final. Sans ce réglage, Next retirerait le slash
  // que l'on ajoute ici et les deux redirections se renverraient la requête
  // sans fin, sur toutes les URL du site.
  if (chemin !== canonique) {
    const cible = urlSansNextUrl(request);
    cible.pathname = canonique;
    return NextResponse.redirect(cible, 308);
  }

  return NextResponse.next();
}

/**
 * Ne rien interroger pour un actif statique : sans ce filtre, chaque image et
 * chaque feuille de style déclencherait la logique ci-dessus.
 *
 * Écartés : les routes d'API, les fichiers internes de Next, et tout chemin dont
 * le dernier segment porte une extension, ce qui couvre `public/`.
 */
export const config = {
  matcher: ["/((?!api/|_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
