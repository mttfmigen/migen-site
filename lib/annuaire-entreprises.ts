/**
 * LA RECHERCHE D'ENTREPRISE PAR SON NOM, CONTRE L'ANNUAIRE PUBLIC.
 *
 * POURQUOI. Le formulaire de contact de la maquette porte cinq champs cachés
 * posés pour être remplis automatiquement : `country`, `siren`, `siret`,
 * `address`, `zip`. Ils étaient restés vides, et HubSpot recevait donc la
 * seule chaîne tapée par le visiteur. « Danone » et « danone sa » faisaient
 * deux fiches, et aucun rapprochement automatique avec la base clients
 * n'était possible. Mehdi, le 12/10 : « tu l'as branché, car sur le formulaire
 * HubSpot il y a des champs masqués ».
 *
 * L'ANNUAIRE CHOISI : `recherche-entreprises.api.gouv.fr`, le service public
 * de la DINUM qui expose la base Sirene. Publique, sans clé, sans quota
 * contraignant, et c'est la source officielle : rien n'est deviné ici, tout
 * vient du registre.
 *
 * CE QUE L'ON NE FAIT PAS. On n'écrit RIEN que le visiteur n'ait choisi. La
 * recherche propose, il désigne, et seule son élection remplit les champs. Un
 * nom tapé qui ne correspond à rien reste tel quel : le formulaire n'oblige
 * personne à exister au registre.
 */

const ANNUAIRE = "https://recherche-entreprises.api.gouv.fr/search";

/** Au-delà, le visiteur tape plus vite que la liste ne s'affiche. */
const DELAI_MS = 4_000;

/** En deçà, la recherche rend tout et rien. */
export const LONGUEUR_MINIMALE = 3;

export interface Etablissement {
  /** La raison sociale officielle, telle qu'au registre. */
  nom: string;
  siren: string;
  /** Le SIRET du siège, le seul établissement que l'on retienne. */
  siret: string;
  adresse: string;
  codePostal: string;
  ville: string;
  /** Code NAF de l'activité principale, utile au ciblage. */
  codeNaf: string;
  /** Libellé de l'activité, pour que le visiteur reconnaisse SON entreprise. */
  activite: string;
}

/** Une valeur de l'annuaire, nettoyée : jamais `null`, jamais `undefined`. */
function chaine(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Les entreprises dont le nom approche `terme`, au plus `limite`.
 *
 * Rend un tableau vide quand l'annuaire ne répond pas ou répond de travers :
 * une recherche en panne ne doit jamais empêcher d'envoyer le formulaire, le
 * visiteur garde la saisie libre.
 */
export async function chercheEntreprises(terme: string, limite = 6): Promise<Etablissement[]> {
  const q = terme.trim();
  if (q.length < LONGUEUR_MINIMALE) return [];

  let donnee: unknown;
  try {
    const url = `${ANNUAIRE}?q=${encodeURIComponent(q)}&page=1&per_page=${limite}&etat_administratif=A`;
    const r = await fetch(url, { signal: AbortSignal.timeout(DELAI_MS) });
    if (!r.ok) return [];
    donnee = await r.json();
  } catch {
    return [];
  }

  const resultats = (donnee as { results?: unknown[] })?.results;
  if (!Array.isArray(resultats)) return [];

  return resultats
    .map((brut): Etablissement | null => {
      const e = brut as Record<string, unknown>;
      const siege = (e.siege ?? {}) as Record<string, unknown>;
      const siren = chaine(e.siren);
      if (!siren) return null;
      return {
        nom: chaine(e.nom_complet) || chaine(e.nom_raison_sociale),
        siren,
        siret: chaine(siege.siret),
        adresse: chaine(siege.adresse),
        codePostal: chaine(siege.code_postal),
        ville: chaine(siege.libelle_commune),
        codeNaf: chaine(e.activite_principale),
        activite: chaine(e.libelle_activite_principale),
      };
    })
    .filter((e): e is Etablissement => e !== null && e.nom !== "");
}

/**
 * LES CINQ CHAMPS CACHÉS DU FORMULAIRE HUBSPOT, ET EUX SEULS.
 *
 * Mehdi a envoyé la capture du formulaire le 12/10 : il porte « Code
 * pays/région », « SIREN », « Adresse postale », « SIRET » et « Code postal ».
 * Rien d'autre.
 *
 * C'EST UNE LISTE FERMÉE, et ce n'est pas du zèle : HubSpot refuse la
 * soumission ENTIÈRE dès qu'un champ n'est pas sur le formulaire ciblé. Une
 * première version ajoutait `city` et `code_naf`, qui existent bien comme
 * propriétés du portail mais ne sont PAS sur ce formulaire : chaque demande
 * aurait été rejetée. La ville reste donc lue par la recherche, affichée au
 * visiteur pour qu'il reconnaisse son établissement, et n'est pas transmise.
 */
export function champsCaches(e: Etablissement): Record<string, string> {
  return {
    country: "France",
    siren: e.siren,
    siret: e.siret,
    address: e.adresse,
    zip: e.codePostal,
  };
}
