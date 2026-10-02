"use client";

import Script from "next/script";
import { useEffect } from "react";

import { useConsentement } from "./etat";

declare global {
  interface Window {
    /**
     * Posée par le script ci-dessous, donc optionnelle : si un bloqueur
     * empêche son exécution, l'appel de mise à jour doit simplement ne rien
     * faire plutôt que casser la page.
     */
    gtag?: (...arguments_: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google Consent Mode v2.
 *
 * L'ordre de chargement est tout l'enjeu : si l'état par défaut n'est pas posé
 * AVANT le premier script Google, ce dernier démarre sans consigne et dépose
 * ses cookies. D'où `strategy="beforeInteractive"` : Next injecte ce script
 * dans le HTML initial, exécuté avant tout code de l'application et donc avant
 * les balises de Tags.tsx, qui se chargent en `afterInteractive`. Les deux
 * autres stratégies (`afterInteractive`, `lazyOnload`) ne garantissent aucun
 * ordre vis-à-vis des autres scripts, elles sont inutilisables ici.
 *
 * `beforeInteractive` exige que le composant soit rendu depuis la mise en page
 * racine (app/layout.tsx) : c'est là qu'il faut le monter, en premier.
 *
 * Tout est `denied` au départ, y compris `analytics_storage`. La mise à jour
 * part ensuite du choix du visiteur, à chaque fois qu'il change.
 */
export default function ConsentMode() {
  const { choix } = useConsentement();

  useEffect(() => {
    if (!choix) return;
    window.gtag?.("consent", "update", {
      analytics_storage: autorise(choix.choix.mesure_audience),
      ad_storage: autorise(choix.choix.publicite),
      ad_user_data: autorise(choix.choix.publicite),
      ad_personalization: autorise(choix.choix.personnalisation),
    });
  }, [choix]);

  return (
    /* Faux positif hérité du Pages Router : la règle exige `pages/_document.js`,
       qui n'existe pas en App Router. La documentation de Next 16 dit l'inverse
       pour ce routeur (docs/01-app/03-api-reference/02-components/script.md,
       ligne 75) : « Scripts with the beforeInteractive strategy must be placed
       inside a root layout ». C'est le cas, ConsentMode est monté depuis
       app/layout.tsx. La stratégie est ici une obligation de conformité et non
       une optimisation : l'état « denied » doit être posé avant le démarrage du
       moindre script Google, sinon un tag part avant le choix du visiteur. */
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="consent-mode-defaut" strategy="beforeInteractive">
      {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}
    </Script>
  );
}

function autorise(accorde: boolean): "granted" | "denied" {
  return accorde ? "granted" : "denied";
}
