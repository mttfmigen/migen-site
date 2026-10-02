"use client";

/**
 * Bouton du bandeau, unique pour toutes les actions.
 *
 * Un seul composant, donc un seul style : c'est la garantie mécanique de
 * l'égalité de poids visuel exigée par la CNIL. Accepter, refuser et
 * personnaliser ont la même taille, le même contraste, la même bordure. Une
 * retouche de style s'applique forcément aux trois à la fois, et il n'existe
 * aucune variante « principale » dans laquelle glisser un biais.
 */
export default function Action({
  libelle,
  onClick,
}: {
  libelle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-lg border border-neutral-900 px-4 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-100"
    >
      {libelle}
    </button>
  );
}
