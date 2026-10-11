/**
 * LE DÉPÔT D'UNE CANDIDATURE DANS TEAMTAILOR.
 *
 * POURQUOI CE FICHIER EXISTE. Balayage du 11/10 : sur les quatorze pages
 * carrière, le formulaire portait `method="post"` SANS action et SANS
 * gestionnaire. Le candidat remplissait onze champs, joignait son CV,
 * cliquait, et la page se rechargeait vide. Aucun message, aucune trace, rien.
 * Il ne pouvait même pas s'en apercevoir avant d'avoir tout saisi, puisque la
 * validation du navigateur l'empêche d'envoyer à vide.
 *
 * Mehdi, le 11/10 : « sur TeamTailor, créer une offre d'emploi candidature
 * site ». TeamTailor est son ATS ; les candidatures y vont, pas dans HubSpot
 * qui est le registre des prospects.
 *
 * CE QUE L'ON NE PEUT PAS FAIRE, et il faut le dire : l'API TeamTailor
 * n'expose pas de création d'offre. L'offre doit donc exister, et son
 * identifiant est lu dans `TEAMTAILOR_JOB_ID`. Une offre faite pour cela
 * existe déjà dans le compte : « Technicien de maintenance - À qualifier
 * F/H », identifiant 8200692, non listée, qui est précisément un fourre-tout
 * de qualification.
 *
 * LE MODE DÉGRADÉ EST LA PARTIE IMPORTANTE. Tant que la clé ou l'offre
 * manquent, la route ne fait pas semblant : elle répond franchement que
 * l'envoi n'a pas abouti et donne l'adresse de secours. Une candidature
 * perdue en silence est pire qu'un formulaire qui refuse.
 */

/** L'API TeamTailor, version figée : une montée de version ne doit pas surprendre. */
const API = "https://api.teamtailor.com/v1";
const VERSION_API = "20240404";

/** Au-delà, le candidat attend devant un écran figé. */
const DELAI_MS = 10_000;

export interface Candidature {
  prenom: string;
  nom: string;
  courriel: string;
  telephone?: string;
  ville?: string;
  message?: string;
  /** La page d'où part la candidature, pour savoir quel métier l'a amenée. */
  origine?: string;
  /** Le métier de la page, quand la page en désigne un. */
  metier?: string;
}

export type ResultatDepot =
  | { depose: true; candidatId: number }
  | { depose: false; raison: "non-configure" | "refus-api" | "reseau"; detail: string };

function config(): { cle: string; offre: string } | null {
  const cle = process.env.TEAMTAILOR_API_KEY;
  const offre = process.env.TEAMTAILOR_JOB_ID;
  if (!cle || !offre) return null;
  return { cle, offre };
}

/** Vrai quand la route peut réellement déposer. Sert à la page et aux portes. */
export function teamtailorConfigure(): boolean {
  return config() !== null;
}

async function appelle(
  chemin: string,
  cle: string,
  corps: unknown,
): Promise<{ ok: boolean; statut: number; donnee: unknown }> {
  const signal = AbortSignal.timeout(DELAI_MS);
  const r = await fetch(`${API}${chemin}`, {
    method: "POST",
    headers: {
      Authorization: `Token token=${cle}`,
      "X-Api-Version": VERSION_API,
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify(corps),
    signal,
  });
  const donnee: unknown = await r.json().catch(() => null);
  return { ok: r.ok, statut: r.status, donnee };
}

/** L'identifiant numérique rendu par TeamTailor, ou null si la forme surprend. */
function identifiant(donnee: unknown): number | null {
  if (typeof donnee !== "object" || donnee === null) return null;
  const d = (donnee as { data?: { id?: unknown } }).data;
  const brut = d?.id;
  const n = typeof brut === "string" ? Number.parseInt(brut, 10) : typeof brut === "number" ? brut : NaN;
  return Number.isFinite(n) ? n : null;
}

/**
 * Dépose une candidature : crée le profil, puis l'attache à l'offre.
 *
 * Le CV n'est pas transmis ici. Le téléverser demande une URL publique ou un
 * envoi en plusieurs parties, ce que cette route ne fait pas encore ; le
 * formulaire le dit au candidat plutôt que de laisser croire que le fichier
 * est parti.
 */
export async function deposeCandidature(c: Candidature): Promise<ResultatDepot> {
  const conf = config();
  if (!conf) {
    return {
      depose: false,
      raison: "non-configure",
      detail: "TEAMTAILOR_API_KEY ou TEAMTAILOR_JOB_ID manquant",
    };
  }

  const contexte = [c.metier ? `Métier visé : ${c.metier}` : null, c.origine ? `Page : ${c.origine}` : null, c.message?.trim() || null]
    .filter(Boolean)
    .join("\n");

  try {
    const profil = await appelle("/candidates", conf.cle, {
      data: {
        type: "candidates",
        attributes: {
          "first-name": c.prenom,
          "last-name": c.nom,
          email: c.courriel,
          phone: c.telephone ?? null,
          "sourced": true,
          ...(contexte ? { pitch: contexte.slice(0, 140), "internal-comment": contexte } : {}),
        },
      },
    });
    if (!profil.ok) {
      return { depose: false, raison: "refus-api", detail: `création du profil : ${profil.statut}` };
    }
    const candidatId = identifiant(profil.donnee);
    if (candidatId === null) {
      return { depose: false, raison: "refus-api", detail: "TeamTailor n'a pas rendu d'identifiant" };
    }

    const rattachement = await appelle("/job-applications", conf.cle, {
      data: {
        type: "job-applications",
        relationships: {
          candidate: { data: { id: String(candidatId), type: "candidates" } },
          job: { data: { id: conf.offre, type: "jobs" } },
        },
      },
    });
    if (!rattachement.ok) {
      /* Le profil EXISTE : la candidature n'est pas perdue, elle n'est
         simplement pas rangée dans l'offre. On le dit tel quel. */
      return {
        depose: false,
        raison: "refus-api",
        detail: `profil ${candidatId} créé, rattachement à l'offre refusé : ${rattachement.statut}`,
      };
    }
    return { depose: true, candidatId };
  } catch (erreur) {
    const detail = erreur instanceof Error ? erreur.message : "appel interrompu";
    return { depose: false, raison: "reseau", detail };
  }
}
