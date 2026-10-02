"use client";

import { useSyncExternalStore } from "react";

import {
  type Choix,
  type Consentement,
  VERSION_BANDEAU,
  ecritConsentement,
  finalitesRetirees,
  litConsentement,
  supprimeCookies,
} from "@/lib/consentement";

/**
 * État partagé du consentement.
 *
 * Un petit magasin de module plutôt qu'un contexte React : le bandeau, les
 * tags, Consent Mode et le lien de réglages vivent à des endroits différents
 * de l'arbre, et aucun n'a besoin d'être enfant des autres. `useSyncExternalStore`
 * suffit, sans fournisseur à insérer dans la mise en page.
 */

export interface Etat {
  /** `null` tant que le visiteur n'a pas choisi. */
  choix: Consentement | null;
  /** Le détail par finalité est ouvert. */
  panneau: boolean;
  /**
   * Le visiteur a fermé la boîte sans répondre (touche d'échappement ou bouton
   * de fermeture). Rien n'est accordé, et le bandeau reviendra au prochain
   * chargement : fermer n'est pas consentir, mais insister sur la même page
   * serait du harcèlement.
   */
  masque: boolean;
  /**
   * Le cookie a été lu. Faux pendant le rendu serveur : le bandeau ne doit pas
   * apparaître dans le HTML, sinon il clignoterait chez un visiteur qui a déjà
   * répondu, et il serait figé dans les pages mises en cache.
   */
  pret: boolean;
}

const ETAT_SERVEUR: Etat = {
  choix: null,
  panneau: false,
  masque: false,
  pret: false,
};

let etat: Etat =
  typeof document === "undefined"
    ? ETAT_SERVEUR
    : { choix: litConsentement(), panneau: false, masque: false, pret: true };

const abonnes = new Set<() => void>();

function pose(suivant: Etat): void {
  etat = suivant;
  for (const prevenir of abonnes) prevenir();
}

function abonne(prevenir: () => void): () => void {
  abonnes.add(prevenir);
  return () => {
    abonnes.delete(prevenir);
  };
}

export function useConsentement(): Etat {
  return useSyncExternalStore(
    abonne,
    () => etat,
    () => ETAT_SERVEUR,
  );
}

export function ouvrePanneau(): void {
  pose({ ...etat, panneau: true });
}

/** Ferme sans rien décider : aucun traceur, le bandeau revient au prochain chargement. */
export function ferme(): void {
  pose({ ...etat, panneau: false, masque: true });
}

export function enregistre(choix: Choix): void {
  const retirees = finalitesRetirees(etat.choix?.choix ?? null, choix);
  const trace = ecritConsentement(choix);
  deposePreuve(trace, choix);

  if (retirees.length > 0) {
    /*
     * Retrait d'une finalité : effacer ses cookies, puis RECHARGER.
     *
     * Le rechargement n'est pas une facilité, c'est la seule sortie honnête.
     * Démonter le `<Script>` de Tags.tsx retire la balise du document, pas le
     * code déjà exécuté : le traceur a installé ses fonctions globales, ses
     * écouteurs d'événements et ses minuteurs, et il continue d'émettre. Il
     * n'existe aucune API pour désinstaller un script tiers déjà évalué. Seul
     * un document neuf, chargé sans la balise, garantit que plus rien n'émet.
     * Consent Mode borne ce que les scripts Google écrivent dans l'intervalle,
     * mais LinkedIn, le pixel OpenAI et HubSpot ne le lisent pas : sans
     * rechargement, un refus resterait décoratif jusqu'à la navigation suivante.
     *
     * Le cookie de choix est déjà écrit et la preuve déjà partie (`keepalive`),
     * donc rien n'est perdu. Pas de `pose()` ici : la page s'en va.
     */
    supprimeCookies(retirees);
    location.reload();
    return;
  }

  pose({ choix: trace, panneau: false, masque: false, pret: true });
}

/**
 * Dépose la preuve côté serveur. Volontairement sans attente : le visiteur a
 * fait son choix, l'interface doit répondre tout de suite. Le cookie fait
 * déjà foi dans le navigateur, cet appel ne sert qu'à conserver la trace.
 */
function deposePreuve(trace: Consentement, choix: Choix): void {
  void fetch("/api/consentement", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      // En cas de refus total, la trace ne porte aucun identifiant persistant.
      // La preuve en exige un : un aléa jetable, qui ne sert qu'à cette ligne
      // et n'est écrit nulle part dans le navigateur.
      visitor_id: trace.visiteur ?? crypto.randomUUID(),
      choix,
      version_bandeau: VERSION_BANDEAU,
    }),
    keepalive: true,
  }).then(
    (reponse) => {
      if (!reponse.ok) {
        console.error(
          `Preuve de consentement refusée par le serveur (${reponse.status}).`,
        );
      }
    },
    (erreur: unknown) => {
      console.error("Preuve de consentement non transmise.", erreur);
    },
  );
}
