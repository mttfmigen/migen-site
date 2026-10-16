/**
 * Le formulaire des landing pages publicitaires (/lp/) : ce que le navigateur
 * en partage avec la page de rendez-vous et la vérification.
 *
 * L'ENVOI EST CELUI DU SITE. Une LP poste à `/api/lead` la charge de
 * `FormulaireContact` (`chargeUtile`), avec ses protections, et la route la
 * dépose dans le formulaire HubSpot du site (`HUBSPOT_FORM_ID`), dont les
 * champs sont ceux de `MigenLPForm` de la V3. Rien ici ne parle à HubSpot :
 * la LP n'a ni formulaire HubSpot ni champ à elle. Dans HubSpot, une demande
 * de LP se reconnaît à son adresse (`pageUri`) ; son identifiant d'analyse
 * (`formulaireLp`) et l'attribution sont dans la table `leads`.
 *
 * Ce qui touche à la LP en ligne (l'événement de conversion, l'agenda) est
 * RELEVÉ sur go.migengroup.com, jamais supposé :
 * `migen-forge-nucleus/src/components/form-slot.tsx`, `lib/lead-redirect.ts`
 * et `routes/fr.rendez-vous.tsx`, lus le 16/10.
 */

import { INDICATIFS } from "@/components/formulaire/validation";

/**
 * Le `form_id` de l'événement `hubspot_form_submit`, TEL QUE LA LP EN LIGNE
 * LE POUSSE (`FORM_IDS.C`). Ce n'est plus le formulaire qui reçoit la
 * demande (celui du site, voir plus haut) : c'est la valeur que le conteneur
 * Tag Manager reçoit depuis toujours, gardée telle quelle pour qu'aucun
 * déclencheur des conversions Google Ads qui la lirait ne se taise.
 */
export const FORM_ID_CONVERSION_LP = "00bc3a3e-d900-40fe-8995-1e5ff2b684eb";

export type VarianteLP = "heros" | "contact";

/** L'identifiant d'analyse du formulaire, en slug : `lp-maintenance-ind-electrique-heros`.
    C'est lui, avec l'attribution, que reçoit la table `leads`. La route
    l'envoie aussi à HubSpot dans `formulaire_migen`, propriété absente du
    portail au 16/10 : HubSpot l'ignore tant qu'elle n'y est pas créée. */
export function formulaireLp(page: string, variante: VarianteLP): string {
  const chemin = page
    .toLowerCase()
    .replace(/^\/?lp\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ["lp", chemin, variante].filter(Boolean).join("-");
}

/**
 * Le pays de l'indicatif choisi, en code à deux lettres : le champ caché
 * `country` de `MigenLPForm` (« +33 » donne « FR »). Le code est le début du
 * libellé de la liste fermée des indicatifs (« FR +33 »).
 */
export function paysDeLIndicatif(indicatif: string): string {
  return INDICATIFS.find((i) => i.code === indicatif)?.libelle.split(" ")[0] ?? "";
}

/**
 * Le numéro au format E.164 que demandent les conversions améliorées de Google
 * Ads. Un numéro saisi avec son indicatif (« +33 6… », « 0033 6… ») le garde ;
 * sinon l'indicatif choisi remplace le 0 national.
 */
export function numeroE164(contact: { indicatif: string; telephone: string }): string {
  const saisi = contact.telephone.trim();
  const chiffres = saisi.replace(/\D/g, "");
  if (saisi.startsWith("+")) return `+${chiffres}`;
  if (chiffres.startsWith("00")) return `+${chiffres.slice(2)}`;
  return `${contact.indicatif}${chiffres.replace(/^0/, "")}`;
}

/* ------------------------------------------------ après l'envoi : le rendez-vous */

export const PAGE_RENDEZ_VOUS_LP = "/lp/rendez-vous/";

/** L'agenda de la LP en ligne (`routes/fr.rendez-vous.tsx`, CAL_BASE). */
const CALENDLY_LP = "https://calendly.com/thomas-puthod-migen/30min";

/**
 * Où le formulaire laisse le nom et le courriel pour préremplir l'agenda.
 * `sessionStorage` : la donnée sert la réservation que le visiteur est en
 * train de faire, elle meurt avec l'onglet, et elle ne voyage jamais dans
 * l'adresse d'une page de migen.fr.
 */
export const CLE_RENDEZ_VOUS = "migen.lp.rendez-vous";

interface Prerempli {
  nom: string;
  email: string;
}

/**
 * L'adresse de l'agenda, avec les couleurs Migen et le préremplissage, comme
 * la LP en ligne. `integre` : l'adresse du cadre de /lp/rendez-vous/
 * (demande de Mehdi le 16/10, « la LP rendez-vous doit intégrer l'iframe
 * Calendly ») ; `embed_type=Inline` fait aussi annoncer à Calendly la hauteur
 * de sa page. `hide_gdpr_banner` n'est pas repris : le bandeau de Calendly
 * reste le leur, dans leur cadre.
 *
 * Couleurs du site : l'encre `#1c1b19` des LP, et pour la couleur principale
 * l'orange des TEXTES du site (`#b4490f`, celui des surtitres), pas l'orange
 * des boutons : Calendly l'écrit en lettres (jours libres, horaires, liens),
 * et `#ff7c3c` sur blanc ne fait que 2,6:1. `#b4490f` passe 4,5:1 partout,
 * y compris en fond du jour choisi, que Calendly écrit alors en blanc.
 */
export function urlCalendly(prerempli: Prerempli | null, integre = false): string {
  const parametres = new URLSearchParams({
    ...(integre ? { embed_type: "Inline", embed_domain: "migen.fr" } : {}),
    hide_event_type_details: "1",
    background_color: "ffffff",
    text_color: "1c1b19",
    primary_color: "b4490f",
  });
  if (prerempli?.nom) parametres.set("name", prerempli.nom);
  if (prerempli?.email) parametres.set("email", prerempli.email);
  return `${CALENDLY_LP}?${parametres.toString()}`;
}

/** Relit ce que le formulaire a laissé. Illisible ou absent : `null`, l'agenda s'ouvre vide. */
export function prerempliDe(brut: string | null): Prerempli | null {
  if (!brut) return null;
  try {
    const lu: unknown = JSON.parse(brut);
    if (typeof lu !== "object" || lu === null) return null;
    const { nom, email } = lu as Record<string, unknown>;
    return {
      nom: typeof nom === "string" ? nom.slice(0, 120) : "",
      email: typeof email === "string" ? email.slice(0, 180) : "",
    };
  } catch {
    return null;
  }
}
