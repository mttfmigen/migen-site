"use client";

import { useSyncExternalStore } from "react";

import s from "./BasculeTheme.module.css";

/** Clé et valeurs reprises telles quelles de la maquette (`toggleTheme`). */
const CLE = "migen-theme";
const REQUETE_SOMBRE = "(prefers-color-scheme: dark)";

/** Choix mémorisé d'abord (attribut posé par app/layout.tsx), système sinon. */
function estSombre(): boolean {
  const choix = document.documentElement.getAttribute("data-theme");
  if (choix === "sombre") return true;
  if (choix === "clair") return false;
  return window.matchMedia(REQUETE_SOMBRE).matches;
}

/** Le thème change si le système bascule ou si l'attribut de <html> change. */
function abonner(rappel: () => void): () => void {
  const systeme = window.matchMedia(REQUETE_SOMBRE);
  systeme.addEventListener("change", rappel);
  const observateur = new MutationObserver(rappel);
  observateur.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => {
    systeme.removeEventListener("change", rappel);
    observateur.disconnect();
  };
}

function basculer() {
  const suivant = estSombre() ? "Clair" : "Sombre";
  document.documentElement.setAttribute(
    "data-theme",
    suivant === "Sombre" ? "sombre" : "clair",
  );
  try {
    localStorage.setItem(CLE, suivant);
  } catch {
    // Stockage bloqué : la bascule vaut pour la page en cours, sans mémoire.
  }
}

/**
 * Bouton de bascule clair / sombre, dessin de la maquette : pastille de 34px
 * dans l'îlot de navigation, lune en clair, soleil en sombre. La maquette le
 * pose en `display:none` ; il est ici affiché, puisque le README demande un
 * choix mémorisé et qu'un choix sans bouton ne peut pas se faire.
 */
export default function BasculeTheme() {
  // Côté serveur, le thème est inconnu : la lune (clair) est rendue, puis le
  // client corrige au premier passage, sans écart d'hydratation.
  const sombre = useSyncExternalStore(abonner, estSombre, () => false);

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label="Changer de thème"
      title="Changer de thème"
      className={s.bascule}
    >
      {sombre ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
