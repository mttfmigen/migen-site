"use client";

import { useEffect } from "react";

import type { Choix } from "@/lib/consentement";

import { useConsentement } from "./etat";

/**
 * Google Tag Manager, chargé DÈS L'ARRIVÉE, en mode consentement « avancé ».
 *
 * Demande de l'agence Ads (25/11), comme sur l'ancien site go.migengroup.com :
 * le conteneur part sur chaque page avant tout choix. Consent Mode
 * (ConsentMode.tsx) a posé avant lui `default` à `denied` : GA4 et Google Ads
 * n'écrivent aucun cookie et n'envoient que des signaux sans cookie, ce qui
 * permet à Google de modéliser les conversions des visiteurs qui ignorent ou
 * refusent le bandeau. Chaque choix pousse ensuite un `update`.
 *
 * LES BALISES NON GOOGLE RESTENT DERRIÈRE LE CONSENTEMENT, et c'est le site qui
 * le garantit, pas le conteneur. Relevé dans le gtm.js publié (version 28,
 * 25/11) : LinkedIn Insight (deux fois), Microsoft Ads (UET), le script de suivi
 * HubSpot, le pixel OpenAI et le chat Wonderchat y partent sur toutes les pages
 * SANS AUCUNE condition de consentement. Tant que le visiteur n'a pas accordé
 * `FINALITES_TIERS`, le conteneur est chargé avec une liste de blocage
 * (`gtm.blocklist`) qui écarte toute balise non Google, présente ou future.
 *
 * Tag Manager lit cette liste UNE FOIS, au chargement du conteneur, et ne la
 * relit plus. Un accord donné ensuite ne peut donc pas débloquer ces balises
 * dans le même document : la page est rechargée, comme pour un retrait
 * (etat.ts). C'est le prix d'une garantie qui ne dépend pas du réglage de
 * chaque balise dans le conteneur.
 *
 * PAS D'IFRAME GTM EN NOSCRIPT : sans JavaScript, ni Consent Mode ni liste de
 * blocage, et le conteneur partirait sans aucune garde.
 */

const FORMAT = /^GTM-[A-Z0-9]+$/;

/**
 * Ce qu'exigent les balises non Google du conteneur : LinkedIn, Microsoft Ads
 * et OpenAI relèvent de la publicité, HubSpot du suivi commercial. Elles
 * partagent les mêmes classes de blocage, d'où l'exigence des deux.
 */
const FINALITES_TIERS = [
  "publicite",
  "suivi_commercial",
] as const satisfies readonly (keyof Choix)[];

/**
 * Les classes de Tag Manager qui couvrent toute balise non Google : HTML
 * personnalisé, modèles tiers (LinkedIn, Microsoft) et pixels. Les balises
 * Google (GA4, Google Ads, l'association de conversions) n'en font pas partie.
 */
export const BALISES_TIERS = [
  "customScripts",
  "customPixels",
  "nonGoogleScripts",
  "nonGooglePixels",
  "nonGoogleIframes",
] as const;

/** L'identifiant s'il est utilisable, `null` sinon. Un format faux est signalé. */
export function identifiantConteneur(brut: string | undefined): string | null {
  if (!brut) return null;
  if (!FORMAT.test(brut)) {
    console.error(
      `NEXT_PUBLIC_GTM_ID ignorée, format attendu GTM-XXXXXXX : « ${brut} ». Aucun conteneur chargé.`,
    );
    return null;
  }
  return brut;
}

/** Les balises non Google peuvent partir : toutes leurs finalités sont accordées. */
export function tiersAutorises(choix: Choix | null): boolean {
  return choix !== null && FINALITES_TIERS.every((finalite) => choix[finalite]);
}

/** Lu une fois : Tags.tsx s'en sert pour ne pas charger deux fois GA4, Ads et LinkedIn. */
export const CONTENEUR = identifiantConteneur(process.env.NEXT_PUBLIC_GTM_ID);

/**
 * Comment le conteneur a été chargé dans ce document. Un état de module et non
 * de composant : le conteneur ne se charge qu'une fois par document, et sa
 * liste de blocage est figée à ce moment-là.
 */
let chargement: "aucun" | "complet" | "sans-tiers" = "aucun";

function chargeConteneur(identifiant: string, choix: Choix | null): void {
  const couche = (window.dataLayer = window.dataLayer ?? []);
  // Avant l'événement gtm.js : c'est à son chargement que Tag Manager la lit.
  if (!tiersAutorises(choix)) couche.push({ "gtm.blocklist": [...BALISES_TIERS] });
  couche.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${identifiant}`;
  document.head.appendChild(script);
}

export default function TagManager() {
  const { choix, pret } = useConsentement();

  useEffect(() => {
    // `pret` : le cookie de choix est lu. Au même rendu, ConsentMode (monté
    // avant) pousse l'`update` d'un visiteur qui revient : il précède gtm.js.
    if (!pret || !CONTENEUR) return;
    const actuel = choix?.choix ?? null;
    if (chargement === "aucun") {
      chargement = tiersAutorises(actuel) ? "complet" : "sans-tiers";
      chargeConteneur(CONTENEUR, actuel);
      return;
    }
    if (chargement === "sans-tiers" && tiersAutorises(actuel)) location.reload();
  }, [pret, choix]);

  return null;
}
