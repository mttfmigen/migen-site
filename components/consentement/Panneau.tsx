"use client";

import { useState } from "react";

import {
  FINALITES,
  type Finalite,
  LIBELLES,
  LIEN_CONFIDENTIALITE,
  TOUT_REFUSE,
  choixUniforme,
} from "@/lib/consentement";

import Action from "./Action";
import { enregistre, useConsentement } from "./etat";

/**
 * Détail par finalité : un interrupteur et une phrase par finalité, dans le
 * langage du visiteur. Rien n'est accordé par défaut, y compris la mesure
 * d'audience : le site ne dépose aucun traceur avant un clic explicite.
 */
export default function Panneau() {
  const { choix } = useConsentement();
  const [brouillon, setBrouillon] = useState(choix?.choix ?? TOUT_REFUSE);

  function bascule(finalite: Finalite, accorde: boolean): void {
    setBrouillon({ ...brouillon, [finalite]: accorde });
  }

  return (
    <div className="mt-5">
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {FINALITES.map((finalite) => (
          <li key={finalite} className="flex items-start gap-4 py-4">
            <div className="flex-1">
              <label
                htmlFor={`finalite-${finalite}`}
                className="text-sm font-medium"
              >
                {LIBELLES[finalite].titre}
              </label>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {LIBELLES[finalite].texte}
              </p>
              {/* Les destinataires sont nommés finalité par finalité : accorder
                  sans savoir à qui les données partent n'est pas un choix
                  éclairé. La liste vient de LIBELLES, qui suit les scripts que
                  Tags.tsx peut charger. */}
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Destinataires : {LIBELLES[finalite].destinataires.join(", ")}
              </p>
            </div>
            {/* Case à cocher native portant role="switch" : l'interrupteur est
                celui du navigateur, donc utilisable au clavier et annoncé
                correctement par un lecteur d'écran. */}
            <input
              type="checkbox"
              role="switch"
              id={`finalite-${finalite}`}
              checked={brouillon[finalite]}
              onChange={(evenement) =>
                bascule(finalite, evenement.currentTarget.checked)
              }
              className="mt-1 h-5 w-9 shrink-0 cursor-pointer accent-neutral-900 dark:accent-neutral-100"
            />
          </li>
        ))}
      </ul>

      {/* Deux sorties de poids égal : refuser reste à un seul clic, même ici. */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Action
          libelle="Tout refuser"
          onClick={() => enregistre(choixUniforme(false))}
        />
        <Action
          libelle="Enregistrer mes choix"
          onClick={() => enregistre(brouillon)}
        />
      </div>

      <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
        Durées de conservation, droits d&apos;accès et de suppression :{" "}
        <a
          href={LIEN_CONFIDENTIALITE}
          className="underline underline-offset-4 hover:no-underline"
        >
          politique de confidentialité
        </a>
        .
      </p>
    </div>
  );
}
