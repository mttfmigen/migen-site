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

/**
 * LES DOUZE CHAMPS DU FORMULAIRE, et ils partent TOUS.
 *
 * Mehdi, le 11/10 : « un formulaire de candidature spontanée qui doit renvoyer
 * la candidature avec toutes les infos du formulaire en commentaire ». Une
 * première version n'en transmettait que quatre et jetait le poste visé, la
 * mobilité, le trajet accepté, la disponibilité, l'expérience et les
 * prétentions : exactement ce qui sert à qualifier.
 */
export interface Candidature {
  prenom: string;
  nom: string;
  courriel: string;
  telephone?: string;
  /** Poste visé, la liste déroulante « job » du formulaire. */
  poste?: string;
  /** Mobilité géographique : « France entière » ou une liste de régions. */
  mobilite?: string;
  /** Trajet maximal accepté. */
  trajet?: string;
  /** Sous quel délai le candidat peut démarrer. */
  disponibilite?: string;
  /** Années d'expérience déclarées. */
  experience?: string;
  /** Prétentions salariales déclarées. */
  pretentions?: string;
  message?: string;
  /** La page d'où part la candidature, pour savoir quel métier l'a amenée. */
  origine?: string;
  /** Le métier de la page, quand la page en désigne un. */
  metier?: string;
  /** Le candidat a-t-il joint un fichier ? Son nom, à défaut du fichier. */
  cv?: string;
}

/**
 * Le commentaire déposé sur la fiche : la candidature telle qu'elle a été
 * saisie, champ par champ, dans l'ordre du formulaire.
 *
 * Un champ vide est ÉCRIT comme vide plutôt qu'omis : un recruteur doit voir
 * la différence entre « le candidat n'a pas répondu » et « la question ne lui
 * a pas été posée ». C'est la règle du dépôt, rien d'inventé, du vide plutôt
 * que du faux.
 */
export function commentaireDeLaCandidature(c: Candidature): string {
  const lignes: [string, string | undefined][] = [
    ["Poste visé", c.poste],
    ["Mobilité géographique", c.mobilite],
    ["Trajet maximal accepté", c.trajet],
    ["Disponibilité", c.disponibilite],
    ["Années d'expérience", c.experience],
    ["Prétentions salariales", c.pretentions],
    ["Téléphone", c.telephone],
    ["CV joint", c.cv],
  ];
  const corps = lignes.map(([l, v]) => `${l} : ${v?.trim() || "non renseigné"}`).join("\n");
  const mot = c.message?.trim();
  const provenance = [c.metier ? `Métier de la page : ${c.metier}` : null, c.origine ? `Page : ${c.origine}` : null]
    .filter(Boolean)
    .join("\n");
  return [
    "Candidature spontanée déposée depuis le site migen.fr",
    "",
    corps,
    "",
    `Message du candidat :\n${mot || "aucun"}`,
    provenance ? `\n${provenance}` : "",
  ]
    .join("\n")
    .trim();
}

export type ResultatDepot =
  | { depose: true; candidatId: number; commentaireDepose: boolean }
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

/** La raison donnée par TeamTailor (JSON:API `errors`), tronquée, pour le journal. */
function raisonApi(donnee: unknown): string {
  const erreurs = (donnee as { errors?: { title?: string; detail?: string }[] } | null)?.errors;
  if (!Array.isArray(erreurs) || erreurs.length === 0) return "";
  return erreurs
    .map((e) => [e.title, e.detail].filter(Boolean).join(" : "))
    .join(" | ")
    .slice(0, 300);
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

  const commentaire = commentaireDeLaCandidature(c);

  try {
    const profil = await appelle("/candidates", conf.cle, {
      data: {
        type: "candidates",
        attributes: {
          "first-name": c.prenom,
          "last-name": c.nom,
          email: c.courriel,
          phone: c.telephone ?? null,
          sourced: true,
          pitch: `Candidature site${c.poste ? ` · ${c.poste}` : ""}`.slice(0, 140),
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

    /* DES ATTRIBUTS, MÊME SIMPLES, SONT OBLIGATOIRES (14/10). Sans la clé
       `attributes`, l'API TeamTailor répond 400 sur /job-applications : le
       profil était créé mais jamais rattaché à l'offre (mesuré sur les deux
       premiers essais de Mehdi, profils 219826576 et 219826613). La lettre de
       motivation porte le message du candidat quand il en a écrit un. */
    const rattachement = await appelle("/job-applications", conf.cle, {
      data: {
        type: "job-applications",
        attributes: {
          sourced: false,
          ...(c.message ? { "cover-letter": c.message } : {}),
        },
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
        detail: `profil ${candidatId} créé, rattachement à l'offre refusé : ${rattachement.statut} ${raisonApi(rattachement.donnee)}`,
      };
    }

    /* LE COMMENTAIRE, ET C'EST CE QUE MEHDI A DEMANDÉ : toutes les réponses du
       formulaire sur la fiche, pas seulement les quatre champs d'identité.
       Il est posé APRÈS le rattachement, et son échec ne fait PAS échouer le
       dépôt : la candidature est arrivée, c'est l'essentiel, et perdre le
       détail est moins grave que de dire au candidat que rien n'est passé.
       Le refus est journalisé pour que le trou se voie. */
    const note = await appelle("/notes", conf.cle, {
      data: {
        type: "notes",
        attributes: { note: commentaire },
        relationships: { candidate: { data: { id: String(candidatId), type: "candidates" } } },
      },
    });
    if (!note.ok) {
      console.error(
        `[teamtailor] profil ${candidatId} créé et rattaché, commentaire refusé : ${note.statut}`,
      );
    }
    return { depose: true, candidatId, commentaireDepose: note.ok };
  } catch (erreur) {
    const detail = erreur instanceof Error ? erreur.message : "appel interrompu";
    return { depose: false, raison: "reseau", detail };
  }
}
