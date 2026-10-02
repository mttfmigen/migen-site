import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { BaseDeDonnees } from "@/types/lignes";

/**
 * Accès à Supabase, côté serveur exclusivement.
 *
 * `import "server-only"` fait échouer le build si un composant client importe
 * ce fichier. C'est la garantie mécanique de deux règles du projet :
 *   · le contenu éditorial est lu au build ou à la revalidation, jamais par le
 *     navigateur, pour que Google reçoive du HTML complet ;
 *   · la clé `service_role` ne quitte pas le serveur.
 */

function variable(nom: string): string {
  const valeur = process.env[nom];
  if (!valeur) {
    throw new Error(
      `Variable d'environnement manquante : ${nom}. Voir .env.example.`,
    );
  }
  return valeur;
}

type Client = SupabaseClient<BaseDeDonnees>;

let lecteur: Client | null = null;
let ecrivain: Client | null = null;

/**
 * Lecture du contenu publié, avec la clé anonyme.
 *
 * La RLS ne laisse remonter que `statut = 'published'` : même en cas d'erreur
 * de requête, un brouillon ne peut pas fuir. La clé anonyme est utilisée ici
 * côté serveur par choix, pas par contrainte : elle borne ce que la requête
 * peut atteindre.
 */
export function lectureContenu(): Client {
  if (!lecteur) {
    lecteur = createClient<BaseDeDonnees>(
      variable("NEXT_PUBLIC_SUPABASE_URL"),
      variable("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      { auth: { persistSession: false } },
    );
  }
  return lecteur;
}

/**
 * Écriture serveur, avec la clé `service_role` : dépôt d'un lead, ingestion
 * des métriques, preuve de consentement.
 *
 * Contourne la RLS par construction. Ne jamais appeler depuis un composant
 * rendu côté client, ni depuis une route exposée sans contrôle.
 */
export function ecritureServeur(): Client {
  if (!ecrivain) {
    ecrivain = createClient<BaseDeDonnees>(
      variable("NEXT_PUBLIC_SUPABASE_URL"),
      variable("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return ecrivain;
}
