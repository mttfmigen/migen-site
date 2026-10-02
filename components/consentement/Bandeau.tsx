"use client";

import { useEffect, useRef } from "react";

import { LIEN_CONFIDENTIALITE, choixUniforme } from "@/lib/consentement";

import Action from "./Action";
import s from "./Bandeau.module.css";
import Panneau from "./Panneau";
import { enregistre, ferme, ouvrePanneau, useConsentement } from "./etat";

/**
 * Bandeau de consentement.
 *
 * Trois exigences CNIL sont tenues ici par construction :
 *
 *   · les trois actions ont le MÊME POIDS VISUEL. « Tout accepter », « Tout
 *     refuser » et « Personnaliser » passent par le même composant Action,
 *     donc le même style : même taille, même contraste, même bordure. La
 *     largeur égale est tenue ici, par trois colonnes `1fr` (`.actions` du
 *     module CSS), et non par un `flex: 1` posé dans Action : l'égalité de
 *     surface ne doit pas dépendre d'un fichier voisin. Aucun bouton grisé,
 *     aucun bouton minuscule, aucun « tout accepter » coloré face à un
 *     « refuser » en gris. Refuser coûte exactement un clic, comme accepter.
 *     Exigence CNIL, pas une préférence esthétique.
 *
 *   · PAS DE MUR DE CONSENTEMENT. La boîte est ouverte par `show()`, pas par
 *     `showModal()` : la page reste lisible, défilable et cliquable derrière.
 *     `showModal()` rendait tout le reste du site inerte jusqu'au choix, ce qui
 *     est précisément le « cookie wall » que la CNIL interdit. Aucun voile non
 *     plus : le module CSS ne déclare pas de `::backdrop`, et la carte est une
 *     bande basse, pas une surface pleine page. Contrepartie assumée : un
 *     dialogue non modal ne piège pas le focus et n'intercepte pas la touche
 *     d'échappement, le navigateur ne le fait que pour `showModal()`. D'où
 *     l'écouteur d'échappement et le bouton « Fermer » explicites ci-dessous :
 *     la boîte reste refermable au clavier comme à la souris, sans emprisonner
 *     la navigation du visiteur.
 *
 *   · fermer n'est pas consentir. Échappement et « Fermer » referment la boîte
 *     sans rien accorder, et le bandeau revient au chargement suivant.
 *
 * L'habillage vient de `Bandeau.module.css`, qui justifie chaque valeur par un
 * motif de la maquette validée. Les classes Tailwind qui restent ne portent que
 * de la mise en page : aucune couleur, aucun thème.
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
      className={`${s.bandeau} fixed inset-x-0 bottom-0 top-auto z-50 m-0 w-full max-w-3xl sm:inset-x-4 sm:bottom-4 sm:mx-auto`}
    >
      <div className="flex items-start gap-4">
        <h2 id="consentement-titre" className={`${s.titre} flex-1`}>
          Vos traceurs, votre choix
        </h2>
        {/* Sortie explicite, puisque le navigateur n'en fournit pas hors
            `showModal()`. Elle ne décide rien : voir `ferme` dans etat.ts. */}
        <button type="button" onClick={ferme} className={s.fermer}>
          Fermer
        </button>
      </div>

      <p className={s.texte}>
        Nous déposons des traceurs pour mesurer l&apos;audience du site, savoir
        quelles annonces vous ont amené ici et rattacher votre visite à votre
        fiche si vous nous écrivez. Rien n&apos;est déposé avant votre accord, et vous
        pouvez revenir sur ce choix à tout moment depuis le pied de page.{" "}
        <a href={LIEN_CONFIDENTIALITE} className={s.lien}>
          Politique de confidentialité
        </a>
        .
      </p>

      {panneau ? (
        <Panneau />
      ) : (
        /* `gap-3` vaut les 12px d'écart des grilles de la maquette (ligne 1194).
           Trois colonnes égales au-delà de 640px, empilées en dessous. */
        <div className={`${s.actions} grid gap-3 sm:grid-cols-3`}>
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
