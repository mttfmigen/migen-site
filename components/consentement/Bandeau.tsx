"use client";

import { useEffect, useRef } from "react";

import { LIEN_CONFIDENTIALITE, choixUniforme } from "@/lib/consentement";

import Action from "./Action";
import Panneau from "./Panneau";
import { enregistre, ferme, ouvrePanneau, useConsentement } from "./etat";

/**
 * Bandeau de consentement.
 *
 * Trois exigences CNIL sont tenues ici par construction :
 *
 *   · les trois actions ont le MÊME POIDS VISUEL. « Tout accepter », « Tout
 *     refuser » et « Personnaliser » passent par le même composant Action,
 *     donc le même style : même taille, même contraste, même bordure, et une
 *     largeur égale (`flex-1`). Aucun bouton grisé, aucun bouton minuscule,
 *     aucun « tout accepter » coloré face à un « refuser » en gris. Refuser
 *     coûte exactement un clic, comme accepter. Exigence CNIL, pas une
 *     préférence esthétique.
 *
 *   · PAS DE MUR DE CONSENTEMENT. La boîte est ouverte par `show()`, pas par
 *     `showModal()` : la page reste lisible, défilable et cliquable derrière.
 *     `showModal()` rendait tout le reste du site inerte jusqu'au choix, ce qui
 *     est précisément le « cookie wall » que la CNIL interdit. Contrepartie
 *     assumée : un dialogue non modal ne piège pas le focus et n'intercepte pas
 *     la touche d'échappement, le navigateur ne le fait que pour `showModal()`.
 *     D'où l'écouteur d'échappement et le bouton « Fermer » explicites
 *     ci-dessous : la boîte reste refermable au clavier comme à la souris, sans
 *     emprisonner la navigation du visiteur.
 *
 *   · fermer n'est pas consentir. Échappement et « Fermer » referment la boîte
 *     sans rien accorder, et le bandeau revient au chargement suivant.
 */
export default function Bandeau() {
  const { choix, panneau, masque, pret } = useConsentement();
  const boite = useRef<HTMLDialogElement>(null);

  const visible = pret && (panneau || (choix === null && !masque));

  useEffect(() => {
    const element = boite.current;
    if (!element) return;
    if (visible && !element.open) element.show();
    if (!visible && element.open) element.close();
  }, [visible]);

  // Un dialogue non modal ne reçoit pas l'échappement du navigateur : on le
  // branche sur le document, sinon le clavier n'aurait aucune sortie.
  useEffect(() => {
    if (!visible) return;
    function surTouche(evenement: KeyboardEvent): void {
      if (evenement.key === "Escape") ferme();
    }
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [visible]);

  // Rien dans le HTML servi : le bandeau est une décision du navigateur, pas
  // du cache. Voir le commentaire de `pret` dans etat.ts.
  if (!pret) return null;

  return (
    <dialog
      ref={boite}
      aria-labelledby="consentement-titre"
      onClose={ferme}
      className="fixed inset-x-0 bottom-0 top-auto z-50 m-0 w-full max-w-3xl rounded-t-xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-2xl sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:rounded-xl dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      <div className="flex items-start gap-4">
        <h2 id="consentement-titre" className="flex-1 text-lg font-semibold">
          Vos traceurs, votre choix
        </h2>
        {/* Sortie explicite, puisque le navigateur n'en fournit pas hors
            `showModal()`. Elle ne décide rien : voir `ferme` dans etat.ts. */}
        <button
          type="button"
          onClick={ferme}
          className="rounded-md px-2 py-1 text-sm underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Fermer
        </button>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        Nous déposons des traceurs pour mesurer l&apos;audience du site, savoir
        quelles annonces vous ont amené ici et rattacher votre visite à votre
        fiche si vous nous écrivez. Rien n&apos;est déposé avant votre accord, et vous
        pouvez revenir sur ce choix à tout moment depuis le pied de page.{" "}
        <a
          href={LIEN_CONFIDENTIALITE}
          className="underline underline-offset-4 hover:no-underline"
        >
          Politique de confidentialité
        </a>
        .
      </p>

      {panneau ? (
        <Panneau />
      ) : (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Action
            libelle="Tout accepter"
            onClick={() => enregistre(choixUniforme(true))}
          />
          <Action
            libelle="Tout refuser"
            onClick={() => enregistre(choixUniforme(false))}
          />
          <Action libelle="Personnaliser" onClick={ouvrePanneau} />
        </div>
      )}
    </dialog>
  );
}
