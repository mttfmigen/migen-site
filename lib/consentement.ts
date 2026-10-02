/**
 * Modèle du consentement : les finalités, le choix du visiteur, son transport
 * dans un cookie de première partie, et le nettoyage des cookies au retrait.
 *
 * À TRANCHER AVANT LA MISE EN LIGNE : la durée de conservation du choix
 * (CONSERVATION_JOURS ci-dessous) et celle de la preuve en base doivent être
 * arbitrées au regard des recommandations CNIL en vigueur à ce moment-là. La
 * valeur posée ici est un point de départ documenté, pas une décision prise.
 *
 * Ce fichier est volontairement isomorphe (pas de `server-only`) : le cookie
 * doit être lisible par le serveur, qui n'a donc pas besoin d'une seconde
 * implémentation, et par le navigateur, qui pose le choix.
 */

export const FINALITES = [
  "mesure_audience",
  "publicite",
  "personnalisation",
  "suivi_commercial",
] as const;

export type Finalite = (typeof FINALITES)[number];

/** Un booléen par finalité : aucune finalité n'est implicite. */
export type Choix = Record<Finalite, boolean>;

/**
 * Version du bandeau. La changer invalide les choix déjà posés et redemande
 * son accord au visiteur : c'est le seul moyen honnête d'ajouter une finalité
 * ou un destinataire.
 *
 * Passée au 2026-10-02 : la finalité « suivi_commercial » a été détachée de la
 * mesure d'audience. Un visiteur qui avait accordé la mesure n'avait pas
 * consenti au rattachement de sa visite à une fiche de contact, son choix
 * précédent ne peut donc pas être reconduit.
 */
export const VERSION_BANDEAU = "2026-10-02";

export const COOKIE_NOM = "migen_consentement";

/** Point de départ : 6 mois, à confirmer (voir l'avertissement en tête). */
export const CONSERVATION_JOURS = 180;

/** Page d'information, nommée dans le bandeau comme l'exige l'article 13 du RGPD. */
export const LIEN_CONFIDENTIALITE = "/politique-de-confidentialite/";

/**
 * Ce que chaque finalité autorise, dit au visiteur sans jargon, et QUI reçoit
 * les données. Nommer les destinataires est une obligation, pas une politesse :
 * un visiteur ne peut pas consentir à un transfert dont il ignore la cible.
 *
 * Les destinataires listés sont exactement les scripts que Tags.tsx est capable
 * de charger pour la finalité. Ajouter un tag sans l'ajouter ici rendrait cette
 * liste mensongère.
 */
export const LIBELLES: Record<
  Finalite,
  { titre: string; texte: string; destinataires: readonly string[] }
> = {
  mesure_audience: {
    titre: "Mesure d'audience",
    texte:
      "Compter les visites et voir quelles pages sont lues, pour améliorer le site. Les statistiques sont agrégées, elles ne servent pas à vous contacter.",
    destinataires: ["Google (Google Analytics 4)"],
  },
  publicite: {
    titre: "Publicité",
    texte:
      "Savoir quelle annonce vous a amené ici, pour arrêter de payer celles qui n'intéressent personne. Rien n'est revendu.",
    destinataires: ["Google (Google Ads)", "LinkedIn", "OpenAI"],
  },
  personnalisation: {
    titre: "Personnalisation des annonces",
    texte:
      "Adapter les annonces que nous diffusons ailleurs à ce que vous avez consulté sur migen.fr. Refuser n'enlève rien au site.",
    destinataires: ["Google (Google Ads)", "LinkedIn"],
  },
  suivi_commercial: {
    titre: "Suivi commercial",
    texte:
      "Rattacher votre visite à une fiche de contact dans notre outil commercial, pour que la personne qui vous répond sache ce que vous avez consulté. Refuser n'empêche pas d'envoyer un formulaire ni d'obtenir une réponse.",
    destinataires: ["HubSpot"],
  },
};

/**
 * Préfixes des cookies de PREMIÈRE PARTIE que chaque finalité fait apparaître.
 * Servent au nettoyage lors d'un retrait (voir `supprimeCookies`).
 *
 * Les pixels LinkedIn et OpenAI écrivent sur leurs propres domaines : ces
 * cookies sont hors de portée d'un script de migen.fr. C'est précisément
 * pourquoi le retrait recharge la page et pourquoi Consent Mode reste la
 * seconde ceinture, au lieu de compter sur ce nettoyage seul.
 */
const COOKIES_PAR_FINALITE: Record<Finalite, readonly string[]> = {
  // `_ga` et `_ga_<identifiant de flux>`, posés par Google Analytics 4.
  mesure_audience: ["_ga"],
  // `_gcl_au`, `_gcl_aw`, `_gcl_dc`, `_gcl_gb`, posés par Google Ads.
  publicite: ["_gcl_"],
  personnalisation: ["_gcl_"],
  // `hubspotutk`, `__hstc`, `__hssc`, `__hssrc`, posés par le tracker HubSpot.
  suivi_commercial: ["hubspotutk", "__hs"],
};

/** Le choix du visiteur, tel qu'il voyage dans le cookie et en base. */
export interface Consentement {
  version: string;
  /**
   * Aléa non nominatif, stable le temps du cookie, ou `null` en cas de refus
   * total : conserver un identifiant stable six mois chez un visiteur qui a
   * tout refusé serait exactement le traçage auquel il vient de s'opposer.
   */
  visiteur: string | null;
  choix: Choix;
  /** Date du choix, en ISO. */
  le: string;
}

/** Le même verdict pour toutes les finalités, écrit en clair pour rester typé. */
export function choixUniforme(accorde: boolean): Choix {
  return {
    mesure_audience: accorde,
    publicite: accorde,
    personnalisation: accorde,
    suivi_commercial: accorde,
  };
}

export const TOUT_REFUSE: Choix = choixUniforme(false);

/** Aucune finalité accordée : le visiteur n'attend plus rien du site que la lecture. */
export function estToutRefuse(choix: Choix): boolean {
  return FINALITES.every((finalite) => !choix[finalite]);
}

/**
 * Les finalités qui passent d'accordée à refusée. Liste vide s'il n'y a aucun
 * retrait : un premier choix, ou un élargissement, ne déclenche aucun ménage.
 */
export function finalitesRetirees(
  avant: Choix | null,
  apres: Choix,
): readonly Finalite[] {
  if (!avant) return [];
  return FINALITES.filter((finalite) => avant[finalite] && !apres[finalite]);
}

/**
 * Efface les cookies de première partie des finalités retirées.
 *
 * Un cookie ne s'efface qu'avec le même attribut `domain` que celui de sa pose,
 * et Google Analytics écrit sur le domaine parent (`.migen.fr`) même servi
 * depuis `www`. On réémet donc l'effacement pour l'hôte exact puis pour chaque
 * domaine parent, plutôt que de deviner lequel a servi.
 */
export function supprimeCookies(finalites: readonly Finalite[]): void {
  if (typeof document === "undefined" || finalites.length === 0) return;

  const prefixes = new Set(
    finalites.flatMap((finalite) => COOKIES_PAR_FINALITE[finalite]),
  );
  const noms = document.cookie
    .split("; ")
    .map((paire) => paire.split("=")[0])
    .filter(
      (nom) =>
        nom.length > 0 &&
        [...prefixes].some((prefixe) => nom.startsWith(prefixe)),
    );

  for (const nom of noms) {
    for (const domaine of domainesDEffacement()) {
      document.cookie = `${nom}=; max-age=0; path=/${domaine}`;
    }
  }
}

/** Chaîne vide (cookie posé sur l'hôte exact), puis `; domain=...` par parent. */
function domainesDEffacement(): readonly string[] {
  const labels = location.hostname.split(".");
  const domaines = [""];
  for (let debut = 0; debut + 2 <= labels.length; debut += 1) {
    domaines.push(`; domain=${labels.slice(debut).join(".")}`);
  }
  return domaines;
}

/**
 * Étiquette dérivée du user agent, calculée côté serveur et bornée à 32
 * caractères, du type « chrome/android » ou « robot ».
 *
 * Le user agent brut n'est PAS stocké, même tronqué : une troncature à 120
 * caractères ne retire rien à un user agent courant, qui est plus court que
 * cela, et laisserait donc en base une chaîne assez discriminante pour
 * participer à une empreinte. L'étiquette répond à la seule question utile
 * quand on relit une preuve : était-ce un humain, avec quoi.
 */
export function etiquetteUserAgent(brut: string | null): string | null {
  if (!brut) return null;
  const ua = brut.toLowerCase();

  // Les robots d'abord : ils annoncent souvent aussi un navigateur.
  const robots = ["bot", "crawl", "spider", "headless", "preview", "monitor"];
  if (robots.some((marqueur) => ua.includes(marqueur))) return "robot";

  return `${familleNavigateur(ua)}/${plateforme(ua)}`.slice(0, 32);
}

/** Ordre important : les dérivés de Chromium s'annoncent tous comme Chrome. */
function familleNavigateur(ua: string): string {
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "opera";
  if (ua.includes("samsungbrowser")) return "samsung";
  if (ua.includes("firefox") || ua.includes("fxios")) return "firefox";
  if (ua.includes("chrome") || ua.includes("crios")) return "chrome";
  if (ua.includes("safari")) return "safari";
  return "autre";
}

function plateforme(ua: string): string {
  if (ua.includes("android")) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac os")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "autre";
}

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === "object" && valeur !== null;
}

function analyseChoix(valeur: unknown): Choix | null {
  if (!estObjet(valeur)) return null;
  // Une finalité absente ou non booléenne rend tout le cookie suspect : on
  // préfère redemander son accord au visiteur plutôt que deviner à sa place.
  for (const finalite of FINALITES) {
    if (typeof valeur[finalite] !== "boolean") return null;
  }
  return {
    mesure_audience: valeur.mesure_audience as boolean,
    publicite: valeur.publicite as boolean,
    personnalisation: valeur.personnalisation as boolean,
    suivi_commercial: valeur.suivi_commercial as boolean,
  };
}

/**
 * Lit la valeur brute du cookie. Utilisable côté serveur :
 * `analyseCookie(cookieStore.get(COOKIE_NOM)?.value)`.
 *
 * Rend `null` dès que le contenu est illisible, incomplet, ou issu d'une
 * version antérieure du bandeau : dans ces trois cas il n'y a pas de choix
 * valable, donc pas de traceur.
 */
export function analyseCookie(
  valeur: string | null | undefined,
): Consentement | null {
  if (!valeur) return null;
  try {
    const brut: unknown = JSON.parse(decodeURIComponent(valeur));
    if (!estObjet(brut)) return null;
    if (brut.version !== VERSION_BANDEAU) return null;
    // `visiteur` absent ou nul est légitime : c'est la forme d'un refus total.
    // Présent, il doit rester un aléa plausible.
    const visiteur = brut.visiteur ?? null;
    if (visiteur !== null && (typeof visiteur !== "string" || visiteur.length < 8)) {
      return null;
    }
    if (typeof brut.le !== "string") return null;
    const choix = analyseChoix(brut.choix);
    if (!choix) return null;
    return {
      version: brut.version,
      visiteur,
      choix,
      le: brut.le,
    };
  } catch {
    // Cookie tronqué ou trafiqué : pas de choix valable, on redemande.
    return null;
  }
}

function cookieDuNavigateur(nom: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((paire) => paire.startsWith(`${nom}=`))
    ?.slice(nom.length + 1);
}

/** Le choix en vigueur dans ce navigateur, ou `null` s'il n'y en a pas. */
export function litConsentement(): Consentement | null {
  if (typeof document === "undefined") return null;
  return analyseCookie(cookieDuNavigateur(COOKIE_NOM));
}

/** Pose le choix dans le cookie et rend la trace écrite. */
export function ecritConsentement(choix: Choix): Consentement {
  const precedent = litConsentement();
  const trace: Consentement = {
    version: VERSION_BANDEAU,
    // Un refus total n'ouvre droit à aucun identifiant persistant, et efface
    // celui qui aurait été posé par un accord antérieur.
    visiteur: estToutRefuse(choix)
      ? null
      : (precedent?.visiteur ?? crypto.randomUUID()),
    choix,
    le: new Date().toISOString(),
  };
  const attributs = [
    `${COOKIE_NOM}=${encodeURIComponent(JSON.stringify(trace))}`,
    "path=/",
    `max-age=${CONSERVATION_JOURS * 24 * 60 * 60}`,
    // Lax et non Strict : le visiteur qui arrive depuis une annonce doit
    // retrouver son choix dès la première page.
    "samesite=lax",
  ];
  // Pas de HttpOnly : le navigateur doit relire ce cookie pour décider des
  // tags. Secure seulement hors développement local, sinon le cookie serait
  // refusé en http.
  if (location.protocol === "https:") attributs.push("secure");
  document.cookie = attributs.join("; ");
  return trace;
}
