"use client";

import Script from "next/script";

import type { Choix } from "@/lib/consentement";

import { useConsentement } from "./etat";

/**
 * Google Tag Manager, chargé seulement après un accord.
 *
 * Trois gardes, dans cet ordre :
 *   · l'identifiant du conteneur vient de NEXT_PUBLIC_GTM_ID. Vide, rien ne se
 *     charge et ce n'est pas une erreur : tant que Mehdi n'a pas donné le
 *     conteneur, le site part sans lui. Mal formé, rien ne se charge non plus,
 *     et la console le dit (une faute de frappe ne doit pas passer en silence).
 *   · un choix doit exister. Sans réponse au bandeau, aucun script.
 *   · une des trois finalités que le conteneur sert doit être accordée. Le
 *     suivi commercial seul ne suffit pas : HubSpot reste chargé par Tags.tsx.
 *
 * PAS D'IFRAME GTM EN NOSCRIPT, et ce n'est pas un oubli : l'iframe part
 * sans JavaScript, donc sans bandeau ni choix, et chargerait le conteneur
 * avant tout consentement.
 *
 * Consent Mode (ConsentMode.tsx) reste la seconde ceinture : son `default`
 * à `denied` est posé avant ce script, et chaque choix pousse un `update` puis
 * l'événement `migen_consentement` auquel les déclencheurs du conteneur
 * s'accrochent.
 */

const FORMAT = /^GTM-[A-Z0-9]+$/;

/** Les finalités que le conteneur sert : GA4, Google Ads, LinkedIn. */
const FINALITES_CONTENEUR = [
  "mesure_audience",
  "publicite",
  "personnalisation",
] as const satisfies readonly (keyof Choix)[];

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

/** L'adresse du conteneur à charger pour ce choix, ou `null` : rien ne part. */
export function sourceConteneur(
  identifiant: string | null,
  choix: Choix | null,
): string | null {
  if (!identifiant || !choix) return null;
  if (!FINALITES_CONTENEUR.some((finalite) => choix[finalite])) return null;
  return `https://www.googletagmanager.com/gtm.js?id=${identifiant}`;
}

/** Lu une fois : Tags.tsx s'en sert pour ne pas charger deux fois GA4, Ads et LinkedIn. */
export const CONTENEUR = identifiantConteneur(process.env.NEXT_PUBLIC_GTM_ID);

export default function TagManager() {
  const { choix } = useConsentement();
  const source = sourceConteneur(CONTENEUR, choix?.choix ?? null);
  if (!source) return null;

  return (
    <>
      <Script id="gtm-debut" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});`}
      </Script>
      <Script id="gtm" src={source} strategy="afterInteractive" />
    </>
  );
}
