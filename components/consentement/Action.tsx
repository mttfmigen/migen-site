"use client";

import styles from "./Action.module.css";

/**
 * Bouton du bandeau, unique pour toutes les actions.
 *
 * AUCUNE VARIANTE, ET C'EST VOLONTAIRE. Le composant n'accepte ni `variante`,
 * ni `className`, ni `style` : un seul chemin de style, donc un seul poids
 * visuel. C'est la garantie mécanique de l'égalité exigée par la CNIL, celle
 * qui ne dépend pas de la vigilance de l'appelant. Une retouche s'applique
 * forcément aux quatre libellés à la fois, et aucun appel ne peut rendre
 * « Tout refuser » plus discret que « Tout accepter ».
 *
 * L'habillage vit dans `Action.module.css`, qui explique chaque valeur et ses
 * deux écarts mesurés par rapport à la maquette.
 */
export default function Action({
  libelle,
  onClick,
}: {
  libelle: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={styles.action}>
      {libelle}
    </button>
  );
}
