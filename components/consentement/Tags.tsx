"use client";

import Script from "next/script";

import { useConsentement } from "./etat";

/**
 * Les traceurs, montés uniquement si la finalité correspondante est accordée.
 *
 * Deux gardes se cumulent, et c'est volontaire :
 *   · l'identifiant vient d'une variable d'environnement. Absente, le tag ne
 *     se charge pas, et ce n'est pas une erreur : un environnement de
 *     préproduction n'a aucune raison d'alimenter les comptes de production.
 *   · la finalité doit être accordée. Tant qu'elle ne l'est pas, le composant
 *     ne rend rien, donc aucun script n'est téléchargé. Démonter un tag ne
 *     suffirait pas à le désactiver : il faut ne jamais le charger.
 *
 * Consent Mode (ConsentMode.tsx) reste la seconde ceinture : il borne ce que
 * les scripts Google peuvent écrire même quand ils sont chargés.
 */

const GA4 = process.env.NEXT_PUBLIC_GA4_ID;
const GOOGLE_ADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const LINKEDIN = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
const HUBSPOT = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
/**
 * URL complète du pixel OpenAI, et non un simple identifiant : l'adresse
 * exacte du script reste à confirmer auprès de la plateforme publicitaire. La mettre en
 * environnement évite d'inscrire une URL devinée dans le code.
 */
const PIXEL_OPENAI = process.env.NEXT_PUBLIC_OPENAI_PIXEL_SRC;

export default function Tags() {
  const { choix } = useConsentement();
  if (!choix) return null;

  const mesure = choix.choix.mesure_audience;
  const publicite = choix.choix.publicite;
  const suiviCommercial = choix.choix.suivi_commercial;

  // Un seul chargement de gtag.js pour GA4 et Google Ads : le script est le
  // même, seules les commandes `config` diffèrent.
  const identifiantsGoogle = [
    mesure && GA4 ? GA4 : null,
    publicite && GOOGLE_ADS ? GOOGLE_ADS : null,
  ].filter((identifiant): identifiant is string => identifiant !== null);

  return (
    <>
      {identifiantsGoogle.length > 0 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${identifiantsGoogle[0]}`}
            strategy="afterInteractive"
          />
          <Script id="google-config" strategy="afterInteractive">
            {`gtag('js', new Date());
${identifiantsGoogle.map((identifiant) => `gtag('config','${identifiant}');`).join("\n")}`}
          </Script>
        </>
      )}

      {publicite && LINKEDIN && (
        <>
          <Script id="linkedin-partenaire" strategy="afterInteractive">
            {`window._linkedin_partner_id='${LINKEDIN}';
window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];
window._linkedin_data_partner_ids.push('${LINKEDIN}');`}
          </Script>
          <Script
            src="https://snap.licdn.com/li.lms-analytics/insight.min.js"
            strategy="afterInteractive"
          />
        </>
      )}

      {publicite && PIXEL_OPENAI && (
        <Script src={PIXEL_OPENAI} strategy="afterInteractive" />
      )}

      {/* HubSpot relève de « suivi_commercial », PAS de la mesure d'audience.
          Le tracker pose le cookie `hubspotutk`, qui rattache la visite à une
          fiche de contact nominative : ce n'est pas une statistique agrégée, et
          le faire passer sous le libellé de la mesure d'audience ferait mentir
          ce libellé. Sans accord sur le suivi commercial, le lead part sans
          attribution, et c'est correct. */}
      {suiviCommercial && HUBSPOT && (
        <Script
          id="hubspot"
          // Domaine par défaut. Un portail hébergé en Europe se charge depuis
          // js-eu1.hs-scripts.com : à vérifier pour le portail 148000737.
          src={`https://js.hs-scripts.com/${HUBSPOT}.js`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
