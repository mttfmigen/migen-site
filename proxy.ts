import { NextResponse, type NextRequest } from "next/server";

import { cibleFilet, PARAMETRES_WORDPRESS } from "@/lib/filet-ancien-site";
import {
  cheminNormalise,
  REDIRECTIONS_CODE,
  type TableRedirections as Table,
} from "@/lib/redirections";

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
 *
 * LA LISTE DES SOURCES, LE TYPE ET LA FORME CANONIQUE VIVENT DANS
 * `lib/redirections.ts` depuis le 13/10, et non plus ici. Le plan du site en a
 * besoin lui aussi : il déclarait quatre adresses qui répondent 301, parce que
 * rien ne lui disait qu'un chemin peut être la source d'une redirection et pas
 * une page. Deux copies de cette liste auraient divergé au premier ajout.
 * Ce fichier garde ce qui lui est propre : le cache, la lecture de la table et
 * la décision.
 */

/** Durée de vie du cache des redirections. */
const DUREE_CACHE_MS = 60_000;

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
  cible.search = analysee.search || parametresReportes(request);
  cible.hash = analysee.hash;
  return cible;
}

/**
 * Les paramètres de la requête, reportés sur la cible d'une redirection.
 *
 * POURQUOI : un ancien lien de campagne (`?utm_source=…`, `?gclid=…`) qui
 * passait par une 301 arrivait sans ses paramètres, et le formulaire perdait
 * l'attribution (`lib/utm.ts` les lit sur la page d'arrivée). Les paramètres de
 * WordPress (`?p=`, `?page_id=`, `?cat=`, `?s=`) sont retirés : reportés sur
 * l'accueil, ils relanceraient le filet, soit une chaîne de deux sauts.
 */
function parametresReportes(request: NextRequest): string {
  const params = new URLSearchParams(request.nextUrl.search);
  for (const p of PARAMETRES_WORDPRESS) params.delete(p);
  const texte = params.toString();
  return texte ? `?${texte}` : "";
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
  // la forme canonique avant de conclure. Les lignes versionnées dans le code
  // (ancien site WordPress et refonte) ne viennent qu'après la table, et
  // s'appliquent même si la table est injoignable.
  const connue = (...chemins: string[]) => {
    const regle =
      chemins.map((c) => table?.get(c)).find(Boolean) ??
      REDIRECTIONS_CODE.get(chemins[chemins.length - 1]);
    if (!regle) return undefined;
    // Une ligne de la base qui vise une source versionnée dans le code (une
    // adresse retirée par la refonte, par exemple) saute directement à la page
    // finale : un seul saut, jamais une chaîne de deux. Les lignes du code
    // visent déjà la page finale, `tableVersionnee` l'impose.
    const destination =
      REDIRECTIONS_CODE.get(cheminNormalise(regle.destination))
        ?.destination ?? regle.destination;
    return { source: regle.source, destination, code: regle.code };
  };

  // Puis le filet de l'ancien WordPress (`lib/filet-ancien-site.ts`) : une
  // adresse à son format, sans page ni redirection connue, part sur l'accueil
  // ou sur le parent évident. Aucun de ses motifs ne vise une page du site.
  // Évalué seulement sans redirection connue : une page du site ne paie que
  // trois expressions régulières sur un chemin court.
  const regleFilet = () => {
    const filet = cibleFilet(
      canonique,
      request.nextUrl.searchParams,
      (c) => connue(c)?.destination,
    );
    return filet === null
      ? undefined
      : { source: canonique, destination: filet, code: 301 };
  };
  const regle = connue(chemin, canonique) ?? regleFilet();
  if (regle) {
    const cible = cibleInterne(regle.destination, request);
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
 *
 * Repris pour le filet de l'ancien WordPress : `/wp-…` (images de
 * `/wp-content/uploads/`, `/wp-login.php`), tout `.php` (`/xmlrpc.php`), en
 * toute casse, les plans de site de Yoast (`/sitemap_index.xml`,
 * `/page-sitemap.xml`), en toute casse aussi, et les débris du thème à
 * extension apparente (une virgule, `/.svg`). Le site n'a aucun fichier sous
 * ces formes : son plan est `/sitemap.xml`, que ces motifs ne voient pas.
 */
export const config = {
  matcher: [
    "/((?!api/|_next/|.*\\.[a-zA-Z0-9]+$).*)",
    "/([wW][pP]-.*)",
    "/(.*\\.[pP][hH][pP])",
    "/([sS][iI][tT][eE][mM][aA][pP]_[iI][nN][dD][eE][xX]\\.[xX][mM][lL])",
    "/([a-zA-Z0-9_-]+-[sS][iI][tT][eE][mM][aA][pP][0-9]*\\.[xX][mM][lL])",
    // Débris du thème Avada à extension apparente (`/0,0,0,0.3`, `/.svg`).
    "/(.*,.*)",
    "/(\\.[sS][vV][gG]|\\.[pP][nN][gG])",
  ],
};
