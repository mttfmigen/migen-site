"use client";

import { useEffect } from "react";

/* Les colonnes repliables du pied, marquées par `PiedDePage`. NON EXPORTÉ, et
   c'est voulu : une constante importée d'un module « use client » par un
   composant serveur y arrive en référence client, pas en chaîne (piège du
   14/10, que les types ne voient pas). L'attribut est donc écrit des deux
   côtés, et `verification-pied-de-page.tsx` vérifie qu'ils concordent. */
const SELECTEUR_PLIABLES_PIED = "details[data-pied-pliable]";
const TELEPHONE = "(max-width: 880px)";

/**
 * Replie les colonnes du pied de page AU CHARGEMENT, sur téléphone seulement.
 *
 * Le pied reste un composant serveur : il sert ses sept `<details>` OUVERTS,
 * donc le HTML porte tout le texte et le bureau le reçoit tel qu'avant. Ce
 * composant ne rend RIEN (pas un caractère de plus dans le `textContent` du
 * pied, à aucune largeur) : il ferme les dépliants sous 881 px, et les rouvre
 * si l'écran repasse au-dessus, où rien ne doit être replié.
 *
 * POURQUOI PAS `SectionPliableMobile` : il ajoute dans le DOM un chevron « › »
 * et une ligne de résumé, masqués sur bureau mais présents dans le
 * `textContent`. Le pied est sur les 158 pages : au bureau, son texte doit
 * rester identique au caractère près. Ici le chevron est dessiné en CSS.
 *
 * Sur bureau, la bascule sort aussi du parcours clavier (`tabIndex = -1`) : un
 * titre de colonne n'y ouvre rien et ne doit pas devenir un arrêt de
 * tabulation muet. Sous 881 px, elle redevient le seul moyen d'ouvrir la
 * colonne et reprend sa place au clavier.
 */
export default function RepliPiedMobile(): null {
  useEffect(() => {
    const telephone = window.matchMedia(TELEPHONE);
    const applique = (auChargement: boolean) => {
      for (const bloc of document.querySelectorAll<HTMLDetailsElement>(
        SELECTEUR_PLIABLES_PIED,
      )) {
        /* Au chargement on replie ; ensuite on ne referme jamais au nez du
           visiteur ce qu'il a ouvert, on rouvre seulement en passant au bureau. */
        if (!telephone.matches) bloc.open = true;
        else if (auChargement) bloc.open = false;
        const bascule = bloc.querySelector("summary");
        if (bascule) bascule.tabIndex = telephone.matches ? 0 : -1;
        // Monté : le contenu, masqué au premier affichage (globals.css), peut paraître.
        bloc.setAttribute("data-monte", "");
      }
    };
    applique(true);
    const surChangement = () => applique(false);
    telephone.addEventListener("change", surChangement);
    return () => telephone.removeEventListener("change", surChangement);
  }, []);

  return null;
}
