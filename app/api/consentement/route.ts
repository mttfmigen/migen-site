import {
  FINALITES,
  type Choix,
  etiquetteUserAgent,
} from "@/lib/consentement";
import { ecritureServeur } from "@/lib/supabase";
import type { BaseDeDonnees } from "@/types/base";

/**
 * Preuve de consentement.
 *
 * Ce que la route écrit : l'identifiant visiteur (un aléa non nominatif), le
 * choix par finalité, la version du bandeau affichée, et une ÉTIQUETTE dérivée
 * du user agent (« chrome/android », « robot »), calculée ici, bornée à 32
 * caractères. Ce qu'elle n'écrit jamais : l'adresse IP, le user agent brut, ni
 * rien qui permette de remonter à une personne. La preuve atteste d'un choix,
 * elle ne décrit pas un visiteur.
 *
 * Le corps vient du navigateur, donc rien n'est pris sur parole : chaque champ
 * est validé avant l'écriture, et la table porte les mêmes contraintes en
 * seconde ligne (voir 0002_consentement.sql).
 */

/** La ligne à écrire, telle que la base l'attend. */
type Preuve = BaseDeDonnees["public"]["Tables"]["consent_logs"]["Insert"];

interface Corps {
  visitor_id: string;
  choix: Choix;
  version_bandeau: string;
}

function valide(brut: unknown): Corps | null {
  if (typeof brut !== "object" || brut === null) return null;
  const { visitor_id, choix, version_bandeau } = brut as Record<
    string,
    unknown
  >;

  // Les bornes reprennent celles de la contrainte en base : un refus ici donne
  // un 400 lisible plutôt qu'une erreur Postgres.
  if (
    typeof visitor_id !== "string" ||
    visitor_id.length < 8 ||
    visitor_id.length > 64
  ) {
    return null;
  }
  if (
    typeof version_bandeau !== "string" ||
    version_bandeau.length === 0 ||
    version_bandeau.length > 64
  ) {
    return null;
  }
  if (typeof choix !== "object" || choix === null) return null;

  const valeurs = choix as Record<string, unknown>;
  const retenu: Record<string, boolean> = {};
  for (const finalite of FINALITES) {
    if (typeof valeurs[finalite] !== "boolean") return null;
    retenu[finalite] = valeurs[finalite];
  }

  return {
    visitor_id,
    // Reconstruit depuis FINALITES : une finalité inventée par l'appelant est
    // écartée au lieu d'être stockée.
    choix: retenu as Choix,
    version_bandeau,
  };
}

export async function POST(requete: Request): Promise<Response> {
  let brut: unknown;
  try {
    brut = await requete.json();
  } catch {
    return Response.json({ erreur: "Corps illisible." }, { status: 400 });
  }

  const corps = valide(brut);
  if (!corps) {
    return Response.json({ erreur: "Preuve incomplète." }, { status: 400 });
  }

  const ligne: Preuve = {
    visitor_id: corps.visitor_id,
    choix: corps.choix,
    version_bandeau: corps.version_bandeau,
    user_agent: etiquetteUserAgent(requete.headers.get("user-agent")),
  };

  const { error } = await ecritureServeur()
    .from("consent_logs")
    // `as never` : le paramètre de `insert` est dégradé en `never[]` parce que
    // types/base.ts décrit ses lignes avec `interface`, et une interface n'a pas
    // de signature d'index implicite, donc ne satisfait pas la contrainte
    // `Record<string, unknown>` de postgrest-js. Le remède est dans
    // types/base.ts (`interface LigneX` -> `type LigneX = { ... }`), hors du
    // périmètre de ce lot ; lib/leads.ts porte la même erreur. Le cast ne
    // contourne aucune vérification de champ : `ligne` est typée juste au-dessus
    // par `Preuve`, c'est-à-dire par la table elle-même.
    .insert(ligne as never);

  if (error) {
    // Détail côté serveur seulement : la réponse ne décrit pas la base.
    console.error("Écriture de la preuve de consentement refusée.", error);
    return Response.json({ erreur: "Preuve non enregistrée." }, { status: 500 });
  }

  // Rien à rendre au navigateur : le cookie fait déjà foi de son côté.
  return new Response(null, { status: 204 });
}
