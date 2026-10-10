"use client";

import type { CSSProperties, FormEvent } from "react";

import { EVENEMENT_PREREMPLIR } from "@/components/formulaire/FormulaireContact";

import h from "./Generique.module.css";

/**
 * Le panneau « Être rappelé » du héros de la page « vente » de la maquette :
 * trois champs et un bouton. Dans la maquette, le bouton ne fait que basculer
 * un message ; ici, il ne peut pas envoyer à lui seul (la route `/api/lead`
 * exige les six champs du formulaire de contact, hors périmètre). Il PORTE donc
 * la saisie vers le formulaire « Décrire mon besoin » du bas de page, déjà
 * rempli de ces trois champs, au lieu de la perdre. La mention RGPD est sous ce
 * formulaire-là, au point où les données partent.
 */

const CHAMP: CSSProperties = {
  width: "100%",
  padding: "13px 15px",
  borderRadius: "var(--rad-s)",
  border: "1px solid var(--line)",
  background: "var(--card)",
  font: "400 14.5px var(--fb)",
  color: "var(--sur-acc)",
};

const BOUTON: CSSProperties = {
  padding: 15,
  borderRadius: 999,
  border: "none",
  backgroundColor: "#ff7c3c",
  /* `#fff` donnait 2,56:1 sur l'orange, `--ink` donne 6,72:1. */
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  cursor: "pointer",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

export default function RappelExpress() {
  function porte(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    const valeur = (nom: string) => String(donnees.get(nom) ?? "").trim();
    window.dispatchEvent(
      new CustomEvent(EVENEMENT_PREREMPLIR, {
        detail: { entreprise: valeur("entreprise"), telephone: valeur("telephone"), email: valeur("email") },
      }),
    );
    const cible = document.getElementById("cx-form");
    cible?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Le curseur va au premier champ que ce panneau ne demande pas : le nom.
    cible?.querySelector<HTMLInputElement>('[name="nom"]')?.focus({ preventScroll: true });
  }

  return (
    <form onSubmit={porte} style={{ display: "grid", gap: 12 }}>
      <input name="entreprise" type="text" placeholder="Société *" aria-label="Société" autoComplete="organization" style={CHAMP} />
      <input name="telephone" type="tel" placeholder="Téléphone *" aria-label="Téléphone" autoComplete="tel" style={CHAMP} />
      <input name="email" type="email" placeholder="Courriel professionnel *" aria-label="Courriel professionnel" autoComplete="email" style={CHAMP} />
      <button type="submit" className={h.filtre} style={BOUTON}>
        Être rappelé dans l’heure
      </button>
    </form>
  );
}
