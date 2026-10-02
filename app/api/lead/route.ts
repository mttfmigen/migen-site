import type { NextRequest } from "next/server";

import { COOKIE_NOM, analyseCookie } from "@/lib/consentement";
import {
  CHAMP_PIEGE,
  valideCharge,
  type Contact,
  type Erreurs,
  numeroComplet,
} from "@/components/formulaire/validation";
import { empreinteIp, tropDeDepots } from "@/components/formulaire/debit";
import { enregistreCopieLead } from "@/lib/leads";
import { attributionNettoyee, type Attribution } from "@/lib/utm";

/**
 * Dépôt d'un lead : HubSpot reçoit l'identité, Supabase reçoit l'attribution.
 *
 * Le partage est volontaire et il est le point important de ce fichier :
 *   · HubSpot est le registre des personnes, lui seul porte nom, e-mail,
 *     téléphone et message ;
 *   · la table `leads` ne porte aucune de ces données, seulement la page et la
 *     campagne qui ont produit la demande (voir lib/leads.ts).
 *
 * La route est publique et chacun de ses appels écrit chez un tiers et en base.
 * Elle est donc filtrée avant tout travail, dans l'ordre du moins cher au plus
 * cher : en-têtes, taille, débit, puis lecture du corps.
 */

/** Portail HubSpot de Migen. Le formulaire cible, lui, change selon la page. */
const PORTAIL_HUBSPOT = "148000737";

/** Au-delà, le visiteur attend devant un écran figé : mieux vaut lui répondre. */
const DELAI_HUBSPOT_MS = 8_000;

const LONGUEUR_MAX_URL = 1000;
const LONGUEUR_MAX_TITRE = 200;

/**
 * Plafond de charge utile. Le formulaire le plus rempli pèse environ deux
 * kilo-octets (le message est borné à 2000 caractères par la validation) :
 * seize mille octets laissent de la marge et coupent court à un corps gonflé
 * pour épuiser le serveur.
 */
const CHARGE_MAX_OCTETS = 16_000;

const CONFIRMATION =
  "Votre demande est bien arrivée. Un technicien vous rappelle pour en parler.";

const ECHEC_DEPOT =
  "Nous n'avons pas pu enregistrer votre demande. Réessayez dans un instant.";

const TROP_DE_DEPOTS =
  "Votre demande nous est déjà parvenue. Laissez-nous un instant pour la traiter.";

interface Page {
  url: string | null;
  titre: string | null;
}

export async function POST(requete: NextRequest): Promise<Response> {
  // Le navigateur étiquette lui-même l'origine de la requête. « cross-site »
  // signifie qu'un autre domaine a posté ce formulaire : jamais le nôtre.
  if (requete.headers.get("sec-fetch-site") === "cross-site") {
    return reponse(403, "Requête refusée.");
  }

  // Le formulaire envoie du JSON. Tout autre type indique un client qui n'est
  // pas le nôtre, et évite d'engager la lecture du corps pour rien.
  const typeContenu = requete.headers.get("content-type") ?? "";
  if (!typeContenu.toLowerCase().includes("application/json")) {
    return reponse(415, "Format de requête non accepté.");
  }

  const annonceTaille = Number(requete.headers.get("content-length") ?? "0");
  if (Number.isFinite(annonceTaille) && annonceTaille > CHARGE_MAX_OCTETS) {
    return reponse(413, "Demande trop volumineuse.");
  }

  if (tropDeDepots(empreinteIp(requete.headers), Date.now())) {
    return reponse(429, TROP_DE_DEPOTS);
  }

  const brut: unknown = await requete.json().catch(() => null);
  if (brut === null) {
    return reponse(400, "Requête illisible.");
  }

  const source = brut as Record<string, unknown>;

  // Champ piège : invisible pour une personne, irrésistible pour un robot qui
  // remplit tout ce qu'il trouve. Rempli, la demande est jetée et la réponse
  // reste un succès : annoncer la détection apprendrait au robot à l'éviter.
  if (typeof source[CHAMP_PIEGE] === "string" && source[CHAMP_PIEGE].trim()) {
    return reponse(200, CONFIRMATION);
  }

  const { contact, formulaire, erreurs } = valideCharge(brut);
  if (Object.keys(erreurs).length > 0) {
    return reponse(422, "Quelques champs demandent une correction.", erreurs);
  }

  const attribution = attributionNettoyee(source.attribution);
  const page = pageNettoyee(source.page);

  // Le choix du visiteur est lu ici, dans son cookie de première partie, et non
  // déduit de ce que le navigateur a bien voulu envoyer. Sans cookie lisible, il
  // n'y a pas de consentement, donc rien n'est accordé.
  const choix = analyseCookie(requete.cookies.get(COOKIE_NOM)?.value)?.choix;

  // Jeton d'analyse HubSpot, posé par leur balise : il rattache la soumission à
  // une fiche de contact, donc il relève du « suivi commercial » et non de la
  // mesure d'audience. C'est la finalité sous laquelle le bandeau annonce
  // HubSpot (LIBELLES.suivi_commercial) et sous laquelle Tags.tsx charge son
  // script : le serveur doit lire la même, sinon il transmet un jeton que le
  // visiteur croyait avoir refusé. Sans cette finalité, le jeton ne repart pas,
  // même si la balise d'une visite antérieure a laissé le cookie en place.
  const hutk = choix?.suivi_commercial
    ? (requete.cookies.get("hubspotutk")?.value ?? undefined)
    : undefined;

  const depot = await deposeChezHubspot({
    contact,
    formulaire,
    attribution,
    page,
    hutk,
    publicite: choix?.publicite === true,
  });

  // La copie d'attribution est écrite dans les deux cas : un échec HubSpot ne
  // doit pas faire disparaître aussi la trace de la campagne qui a converti.
  try {
    await enregistreCopieLead({ ...attribution, formulaire });
  } catch (erreur) {
    // Journalisé sans être remonté : si HubSpot a bien reçu la demande, le lead
    // est en sécurité et le visiteur n'a rien à faire de cette panne.
    console.error("[lead] copie d'attribution perdue :", erreur);
  }

  if (!depot.ok) {
    // Trace sans donnée nominative : de quel formulaire et de quelle campagne
    // il s'agit suffit à retrouver la demande et à relancer la personne.
    console.error(
      `[lead] dépôt HubSpot en échec · formulaire=${formulaire} ` +
        `source=${attribution.utm_source ?? "direct"} ` +
        `page=${attribution.page_conversion ?? "inconnue"} · ${depot.detail}`,
    );
    return reponse(502, ECHEC_DEPOT);
  }

  return reponse(200, CONFIRMATION);
}

interface Depot {
  contact: Contact;
  formulaire: string;
  attribution: Attribution;
  page: Page;
  hutk: string | undefined;
  /** Finalité publicitaire accordée : conditionne tout ce qui mesure la campagne. */
  publicite: boolean;
}

type Resultat = { ok: true } | { ok: false; detail: string };

/**
 * Soumission au formulaire HubSpot cible.
 *
 * L'identifiant du formulaire vient de l'environnement : la page de contact et
 * une page de campagne n'alimentent pas le même formulaire, et une constante en
 * dur obligerait à redéployer pour en changer.
 */
async function deposeChezHubspot(depot: Depot): Promise<Resultat> {
  const formulaireHubspot = process.env.HUBSPOT_FORM_ID;
  if (!formulaireHubspot) {
    return { ok: false, detail: "HUBSPOT_FORM_ID absent de l'environnement" };
  }

  const champs: Record<string, string | undefined> = {
    company: depot.contact.entreprise,
    firstname: depot.contact.prenom,
    lastname: depot.contact.nom,
    email: depot.contact.email,
    phone: numeroComplet(depot.contact),
    message: depot.contact.message,
    formulaire_migen: depot.formulaire,

    // Les UTM et la page d'entrée ne décrivent pas la demande, ils décrivent la
    // campagne qui a amené la personne : c'est de la mesure publicitaire. Sans
    // cette finalité accordée, ils ne quittent pas notre serveur. La copie dans
    // la table `leads` reste écrite, elle est non nominative et sert
    // l'attribution interne.
    ...(depot.publicite
      ? {
          utm_source: depot.attribution.utm_source,
          utm_medium: depot.attribution.utm_medium,
          utm_campaign: depot.attribution.utm_campaign,
          utm_term: depot.attribution.utm_term,
          utm_content: depot.attribution.utm_content,
          page_entree: depot.attribution.page_entree,
        }
      : {}),
  };

  // L'URL de la page porte souvent les UTM dans sa chaîne de requête : la
  // laisser entière reviendrait à renvoyer par la fenêtre ce que l'on vient de
  // retirer par la porte. HubSpot n'a besoin que du chemin pour classer la
  // soumission.
  const urlPage =
    depot.page.url && !depot.publicite
      ? depot.page.url.split("?")[0].split("#")[0]
      : depot.page.url;

  const corps = {
    // HubSpot refuse un champ vide sur une propriété obligatoire : on ne
    // transmet que ce qui est renseigné.
    fields: Object.entries(champs)
      .filter(([, valeur]) => Boolean(valeur))
      .map(([name, value]) => ({ name, value })),
    context: {
      ...(depot.hutk ? { hutk: depot.hutk } : {}),
      ...(urlPage ? { pageUri: urlPage } : {}),
      ...(depot.page.titre ? { pageName: depot.page.titre } : {}),
    },
  };

  try {
    const reponseHubspot = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAIL_HUBSPOT}/${formulaireHubspot}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
        signal: AbortSignal.timeout(DELAI_HUBSPOT_MS),
      },
    );

    if (!reponseHubspot.ok) {
      // Le corps d'erreur HubSpot nomme la propriété fautive : c'est la seule
      // façon de diagnostiquer une propriété absente du portail.
      const detail = await reponseHubspot.text().catch(() => "");
      return {
        ok: false,
        detail: `HTTP ${reponseHubspot.status} ${detail.slice(0, 500)}`,
      };
    }

    return { ok: true };
  } catch (erreur) {
    return { ok: false, detail: String(erreur) };
  }
}

function pageNettoyee(brut: unknown): Page {
  const source =
    typeof brut === "object" && brut !== null
      ? (brut as Record<string, unknown>)
      : {};
  return {
    url: borne(source.url, LONGUEUR_MAX_URL),
    titre: borne(source.titre, LONGUEUR_MAX_TITRE),
  };
}

function borne(valeur: unknown, maximum: number): string | null {
  if (typeof valeur !== "string") return null;
  const propre = valeur.trim().slice(0, maximum);
  return propre || null;
}

function reponse(statut: number, message: string, erreurs?: Erreurs): Response {
  return Response.json(
    { ok: statut < 400, message, ...(erreurs ? { erreurs } : {}) },
    { status: statut },
  );
}
