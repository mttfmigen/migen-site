import { NextResponse, type NextRequest } from "next/server";

/**
 * Redirections éditoriales et slash final.
 *
 * Deux raisons de passer par `fetch` sur l'API REST de Supabase plutôt que par
 * le client `@supabase/supabase-js` :
 *   · le middleware est le code le plus chaud du site, il s'exécute avant chaque
 *     rendu ; une requête HTTP nue suffit à lire trois colonnes, embarquer un
 *     client complet (realtime, auth, storage) y serait du poids mort ;
 *   · ce fichier est bundlé à part et peut être déployé au plus près du
 *     visiteur ; `fetch` est la seule primitive garantie dans tous les cas, quel
 *     que soit le runtime qui l'exécute.
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
      // middleware n'a pas accès au cache de rendu.
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
  const cible = request.nextUrl.clone();
  // Le slash final de la destination suit la même règle que celui de la
  // requête : sans cela, une destination « /offres » déclencherait aussitôt la
  // redirection de slash, soit une chaîne de deux sauts là où un seul suffit.
  cible.pathname = cheminNormalise(analysee.pathname);
  cible.search = analysee.search;
  cible.hash = analysee.hash;
  return cible;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const chemin = request.nextUrl.pathname;
  const canonique = cheminNormalise(chemin);

  let table: Table | null = null;
  try {
    table = await redirections();
  } catch (erreur) {
    // Une base injoignable ne doit pas rendre le site inaccessible : on laisse
    // passer la requête, en gardant la trace du problème côté serveur.
    console.error("Middleware, redirections indisponibles :", erreur);
  }

  if (table) {
    // Les anciennes URL sont stockées telles qu'elles existaient, avec ou sans
    // slash final, et parfois avec des majuscules. On tente la forme reçue puis
    // la forme canonique avant de conclure.
    const regle = table.get(chemin) ?? table.get(canonique);
    if (regle) {
      const cible = cibleInterne(regle.destination, request);
      if (cible) return NextResponse.redirect(cible, regle.code);

      // Une destination externe est une erreur de donnée, pas une redirection à
      // honorer : on la journalise et on laisse la requête suivre son cours.
      console.error(
        `Middleware, destination non interne ignorée pour « ${regle.source} ».`,
      );
    }
  }

  // Casse et slash final, en un seul saut : deux redirections enchaînées
  // coûteraient un aller-retour de plus au visiteur et à Google.
  //
  // `next.config.ts` porte `skipTrailingSlashRedirect: true`, ce qui rend ce
  // bloc seul maître du slash final. Sans ce réglage, Next retirerait le slash
  // que l'on ajoute ici et les deux redirections se renverraient la requête
  // sans fin, sur toutes les URL du site.
  if (chemin !== canonique) {
    const cible = request.nextUrl.clone();
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
