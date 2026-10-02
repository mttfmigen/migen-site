/**
 * Limitation de débit du dépôt de lead.
 *
 * Vit à côté de la validation, pour la même raison qu'elle : c'est une règle du
 * formulaire, partagée par le serveur qui l'applique et par le contrôle qui la
 * vérifie. Le module ne touche ni à Supabase ni à Next, il est donc exécutable
 * tel quel (voir ./verification.ts).
 *
 * GARDE-FOU, PAS PROTECTION : le compteur vit dans la mémoire de l'instance.
 * Vercel en démarre plusieurs et les recycle, donc rien n'est partagé entre
 * elles et tout est perdu à chaque démarrage à froid. Le plafond réel est de
 * cinq dépôts par instance, pas cinq en tout. Cela suffit à casser une boucle
 * bête, pas à tenir devant une campagne distribuée : le jour où ce cas se
 * présente, il faut un compteur partagé (Vercel KV, Upstash) ou un filtre en
 * amont du runtime.
 */

/** Cinq dépôts par quart d'heure : celui qui se trompe et recommence passe. */
export const FENETRE_MS = 15 * 60 * 1_000;
export const DEPOTS_MAX_PAR_FENETRE = 5;

/** Au-delà, la table est purgée : la mémoire d'une instance n'est pas un stock. */
const EMPREINTES_MAX = 5_000;

/** Horodatages des dépôts récents, par empreinte d'IP. */
const depotsRecents = new Map<string, readonly number[]>();

/**
 * Empreinte d'IP, volontairement grossière : le dernier octet d'une IPv4 et
 * tout ce qui suit le préfixe d'une IPv6 sont retirés. Assez précis pour
 * compter des dépôts, trop grossier pour désigner une personne, et aucune
 * adresse complète ne séjourne en mémoire.
 *
 * Derrière Vercel, `x-forwarded-for` commence par l'adresse du client. Sans cet
 * en-tête (appel local, sonde), tout le monde partage la même empreinte : c'est
 * volontaire, un appelant anonyme n'achète pas un quota à lui.
 */
export function empreinteIp(entetes: Headers): string {
  const premiere = (entetes.get("x-forwarded-for") ?? "").split(",")[0].trim();
  if (!premiere) return "sans-adresse";
  if (premiere.includes(":")) {
    return `${premiere.split(":").slice(0, 4).join(":")}::/64`;
  }
  const octets = premiere.split(".");
  if (octets.length !== 4) return "sans-adresse";
  return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
}

/**
 * Vrai si l'empreinte a épuisé son quota sur la fenêtre glissante. Un appel qui
 * rend `false` consomme un jeton : la fonction décide et compte en même temps.
 */
export function tropDeDepots(empreinte: string, maintenant: number): boolean {
  const recents = (depotsRecents.get(empreinte) ?? []).filter(
    (horodatage) => maintenant - horodatage < FENETRE_MS,
  );

  if (recents.length >= DEPOTS_MAX_PAR_FENETRE) {
    // Les horodatages expirés sont rangés même en cas de refus, sinon la liste
    // d'un robot acharné ne se vide jamais.
    depotsRecents.set(empreinte, recents);
    return true;
  }

  depotsRecents.set(empreinte, [...recents, maintenant]);
  if (depotsRecents.size > EMPREINTES_MAX) purgeEmpreintes(maintenant);
  return false;
}

/** Oublie les empreintes dont tous les dépôts sont sortis de la fenêtre. */
function purgeEmpreintes(maintenant: number): void {
  for (const [empreinte, horodatages] of depotsRecents) {
    const vivant = horodatages.some(
      (horodatage) => maintenant - horodatage < FENETRE_MS,
    );
    if (!vivant) depotsRecents.delete(empreinte);
  }
}
