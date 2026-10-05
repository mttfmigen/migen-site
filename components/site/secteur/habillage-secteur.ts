import type { CSSProperties } from "react";

import { BOUTON_ACTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";

/**
 * Valeurs d'habillage du gabarit secteur, relevées dans la maquette Claude
 * Design (« Migen - Site final.dc.html », gabarits SECTEUR et DÉPARTEMENT,
 * lignes 5602 à 5757).
 *
 * POURQUOI un fichier à part : même raison que `blocs/habillage.ts`, la maquette
 * pilote tout par styles en ligne et les mêmes déclarations y reviennent. Ce qui
 * est commun au reste du site est IMPORTÉ de `blocs/habillage.ts`, pas recopié :
 * une seule charte, un seul endroit. Seuls les écarts de ce gabarit sont ici,
 * chacun avec la valeur exacte de la maquette.
 *
 * Les survols ne sont pas ici : ils vivent dans `PageSecteur.module.css`, un
 * style en ligne ne pouvant pas porter d'état.
 */

export const HERO: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "70px 40px 0",
};

/** Le surtitre du hero respire 20px, celui des sections 16px. */
export const SURTITRE_HERO: CSSProperties = { ...SURTITRE, marginBottom: 20 };

export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 var(--ft)",
  letterSpacing: "-.045em",
  margin: 0,
  maxWidth: "18ch",
  textWrap: "balance",
};

export const CHAPEAU_HERO: CSSProperties = {
  font: "400 17.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "24px 0 0",
  maxWidth: "48ch",
};

/** Ombre plus portante que celle de `VERRE` : c'est la carte du hero. */
export const PANNEAU_HERO: CSSProperties = {
  ...VERRE,
  padding: "32px 34px 34px",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
};

/** Les cartes d'enjeux ne portent AUCUNE ombre dans la maquette. */
export const CARTE_ENJEU: CSSProperties = {
  ...VERRE,
  padding: "30px 28px 32px",
  boxShadow: "none",
};

/** Le bouton du hero ne force pas `nowrap` : un libellé long doit pouvoir
    passer à la ligne plutôt que déborder sur un écran de 320px. */
export const BOUTON_HERO: CSSProperties = {
  ...BOUTON_ACTION,
  whiteSpace: "normal",
};

export const BOUTON_HERO_2: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--gsol)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  transition: "background var(--tr)",
};

/** La pastille, pleine (une commune) ou cliquable (une page sœur). */
export const PUCE: CSSProperties = {
  font: "500 14px var(--fb)",
  padding: "10px 18px",
  borderRadius: 999,
  background: "var(--gsol)",
  border: "1px solid var(--line)",
  color: "var(--ink1)",
};

export const RANGEE_PUCES: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

export const PANNEAU_APPEL: CSSProperties = {
  ...VERRE,
  borderRadius: 36,
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 30px 70px -40px rgba(0,0,0,.4)",
  padding: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 44,
  flexWrap: "wrap",
};

