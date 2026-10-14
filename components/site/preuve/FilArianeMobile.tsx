import { FilArianeVue } from "@/components/cocon/FilAriane";

import { etapesFilAriane } from "./donnees-mobiles";
import styles from "./PagePreuve.module.css";

/**
 * LA RANGÉE DE FIL D'ARIANE DE LA MAQUETTE MOBILE V2, gabarit 02 et hub
 * /preuves/.
 *
 * La maquette (`Migen - Mobile v2.dc.html` L104) dessine un fil d'Ariane en
 * tête de chaque page : « Accueil › Réalisations › <page> ». Les captures de
 * BUREAU de ces pages n'en dessinent aucun (choix du 08/10, écart déclaré
 * dans `cocon/FilAriane.tsx`) : la rangée n'existe donc que sous 881 px, par
 * `data-mobile-seulement` (`app/globals.css`), et RIEN ne change à 1280 px.
 *
 * ÉCART DÉCLARÉ : la rangée est `FilArianeVue`, celle que le site dessine déjà
 * (PageRessource, Marques), séparateur « / » et contrastes mesurés par
 * `cocon/verification-fil-ariane.tsx`, plutôt qu'une recopie du dessin de la
 * maquette (séparateur « › »). Un seul composant de fil sur tout le site, une
 * seule porte de contraste. Le défilement sur UNE ligne, lui, est celui de la
 * maquette (`.filMobile`, module du gabarit).
 *
 * Les niveaux viennent de `donnees-mobiles.ts` (calcul dc.html L495-497,
 * depuis l'index du corpus) : rien n'est rédigé ici. `marginBottom: 12` est le
 * `margin-bottom:12px` de la rangée de la maquette (L104).
 *
 * Composant SERVEUR, aucune directive : il ne lit ni état ni navigateur.
 */
export default function FilArianeMobile({
  chemin,
  titre,
}: {
  chemin: string;
  /** Le H1 servi, pour nommer la page courante (voir `etapesFilAriane`). */
  titre?: string;
}) {
  const etapes = etapesFilAriane(chemin, titre);
  if (etapes.length === 0) return null;
  return (
    <div
      data-mobile-seulement=""
      data-fil-ariane-mobile=""
      className={styles.filMobile}
      style={{ marginBottom: 12 }}
    >
      <FilArianeVue etapes={etapes} />
      {/* L'espace finale sépare le dernier niveau du mot qui suit dans le
          `textContent` du `<main>` : sans elle, « semaines » se collait au
          premier mot de la page (porte « aucun mot perdu », 14/10). */}{" "}
    </div>
  );
}
