/**
 * Le formulaire des landing pages publicitaires (/lp/), partagé par le
 * navigateur et par la route `/api/lead`.
 *
 * Pur, sans `"use client"` ni `server-only`, comme `formulaire/validation.ts` :
 * la route revalide avec les mêmes listes fermées que celles que la page
 * affiche. La validation du contact (nom, courriel, téléphone...) reste celle
 * du site, `formulaire/validation.ts` : une seule règle pour tous les
 * formulaires.
 *
 * Tout ce qui touche à HubSpot est RELEVÉ sur la LP en ligne, jamais supposé :
 * `migen-forge-nucleus/src/components/form-slot.tsx` (variante C, forcée par
 * `hooks/use-ab.ts` depuis le test A/B/C clos), `lib/lead-redirect.ts` et
 * `routes/fr.rendez-vous.tsx`, lus le 16/10.
 */

import type { Attribution } from "@/lib/utm";

/** Identifiant du formulaire HubSpot « variante C » de la LP en ligne
    (`FORM_IDS.C`), sur le portail 148000737. Écrit en dur là-bas aussi, et
    public : il part dans le code servi au navigateur (l'événement de
    conversion le porte). Les demandes des LP de migen.fr arrivent ainsi au
    même endroit que celles de go.migengroup.com. La route le remplace par
    `HUBSPOT_FORM_ID_LP` quand cette variable est posée : une préproduction
    ou un aperçu peut viser un formulaire d'essai sans redéploiement. */
export const FORMULAIRE_HUBSPOT_LP = "00bc3a3e-d900-40fe-8995-1e5ff2b684eb";

/** Clé et valeur qui, dans la charge envoyée à `/api/lead`, désignent une LP. */
export const CHAMP_SOURCE = "source";
export const SOURCE_LP = "lp";

/** Clé de la réponse à « Votre demande concerne » dans la charge envoyée. */
export const CHAMP_DEMANDE = "demande";

/**
 * Les deux réponses de « Votre demande concerne », AU CARACTÈRE PRÈS : c'est
 * une énumération HubSpot (`votre_demande_concerne`), et une valeur qui n'en
 * fait pas partie fait refuser la soumission entière. Identiques dans
 * `form-slot.tsx` (TYPE_OPTIONS) et dans `__LP.form.q[0].o` de la maquette V3.
 */
export const DEMANDES_LP = [
  "Une présence quotidienne de nos techniciens de maintenance sur votre site",
  "Une réponse à vos besoins ponctuels : arrêts techniques, shutdowns, etc.",
] as const;

export const ERREUR_DEMANDE = "Votre demande concerne : choisissez une réponse.";

export function estDemandeLp(valeur: unknown): valeur is (typeof DEMANDES_LP)[number] {
  return typeof valeur === "string" && (DEMANDES_LP as readonly string[]).includes(valeur);
}

export type VarianteLP = "heros" | "contact";

/** L'identifiant d'analyse du formulaire, en slug : `lp-maintenance-ind-electrique-heros`.
    Il est écrit dans la table `leads`, qui ne reçoit que lui et l'attribution. */
export function formulaireLp(page: string, variante: VarianteLP): string {
  const chemin = page
    .toLowerCase()
    .replace(/^\/?lp\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ["lp", chemin, variante].filter(Boolean).join("-");
}

/**
 * Les champs propres à la LP, ajoutés à l'identité (entreprise, prénom, nom,
 * courriel, téléphone, message) que la route envoie pour tous les formulaires.
 *
 *   · `requis` : ce que la LP en ligne envoie au formulaire C, donc ce qu'il
 *     accepte à coup sûr : « Votre demande concerne » et le code pays « FR »
 *     (`hidden = { hs_country_region_code: "FR" }` de `landing-city.tsx` et
 *     `landing-sector.tsx`). HubSpot refuse la soumission ENTIÈRE dès qu'un
 *     champ n'est pas sur le formulaire, d'où l'absence de `formulaire_migen`.
 *   · `facultatifs` : les champs cachés de la maquette (`lp_url`, UTM,
 *     `gclid`), que la LP en ligne n'envoie pas. Personne n'a pu vérifier que
 *     le formulaire C les porte : la route les envoie, et si HubSpot répond
 *     400 elle renvoie la demande sans eux, code pays compris toujours. Un
 *     lead ne se perd pas pour un champ d'attribution.
 *
 * Les UTM et le `gclid` mesurent la campagne : ils ne partent qu'avec la
 * finalité publicitaire accordée, comme les UTM du site. `lp_url` est le
 * chemin seul, sans chaîne de requête, donc sans rien de la campagne.
 */
export function champsHubspotLp(entrees: {
  demande: string;
  attribution: Attribution;
  /** URL complète de la page, telle que le navigateur l'a envoyée. */
  urlPage: string | null;
  publicite: boolean;
}): { requis: Record<string, string>; facultatifs: Record<string, string> } {
  const { attribution, publicite } = entrees;
  const campagne = publicite
    ? {
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        gclid: gclidDe(entrees.urlPage),
      }
    : {};
  const facultatifs = Object.fromEntries(
    Object.entries({
      lp_url: attribution.page_conversion,
      ...campagne,
    }).filter((paire): paire is [string, string] => Boolean(paire[1])),
  );
  return { requis: { votre_demande_concerne: entrees.demande, hs_country_region_code: "FR" }, facultatifs };
}

/** Le `gclid` de l'adresse de la page, borné : Google en émet d'une centaine de caractères. */
function gclidDe(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const valeur = new URL(url).searchParams.get("gclid")?.trim();
    return valeur && /^[\w-]{1,200}$/.test(valeur) ? valeur : undefined;
  } catch {
    return undefined;
  }
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
 * la LP en ligne. `hide_gdpr_banner` n'est pas repris : il masquait le bandeau
 * de Calendly dans un cadre intégré ; ici le visiteur ouvre Calendly chez
 * Calendly, et ce bandeau-là est le leur.
 */
export function urlCalendly(prerempli: Prerempli | null): string {
  const parametres = new URLSearchParams({
    hide_event_type_details: "1",
    background_color: "ffffff",
    text_color: "1a1a1a",
    primary_color: "ff7c3c",
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
