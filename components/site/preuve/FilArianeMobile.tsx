import { FilArianeVue } from "@/components/cocon/FilAriane";

import { etapesFilAriane } from "./donnees-mobiles";

/**
 * LA RANGÉE DE FIL D'ARIANE DE LA MAQUETTE MOBILE V2, gabarits 02 et 07.
 *
 * La maquette (`Migen - Mobile v2.dc.html` L104) dessine un fil d'Ariane en
 * tête de chaque page : « Accueil › Réalisations › <page> ». Les captures de
 * BUREAU de ces deux gabarits n'en dessinent aucun (choix du 08/10, écart
 * déclaré dans `cocon/FilAriane.tsx`) : la rangée n'existe donc que sous
 * 881 px, par `data-mobile-seulement` (`app/globals.css`), et RIEN ne change
 * à 1280 px.
 *
 * ÉCART DÉCLARÉ : la rangée est `FilArianeVue`, celle que le site dessine déjà
 * (PageRessource, Marques), séparateur « / » et contrastes mesurés par
 * `cocon/verification-fil-ariane.tsx`, plutôt qu'une recopie du dessin de la
 * maquette (séparateur « › », défilement horizontal). Un seul composant de fil
 * sur tout le site, une seule porte de contraste.
 *
 * Les niveaux viennent de `donnees-mobiles.ts` (calcul dc.html L495-497,
 * depuis l'index du corpus) : rien n'est rédigé ici. `marginBottom: 12` est le
 * `margin-bottom:12px` de la rangée de la maquette (L104).
 *
 * Composant SERVEUR, aucune directive : il ne lit ni état ni navigateur.
 */
export default function FilArianeMobile({ chemin }: { chemin: string }) {
  const etapes = etapesFilAriane(chemin);
  if (etapes.length === 0) return null;
  return (
    <div
      data-mobile-seulement=""
      data-fil-ariane-mobile=""
      style={{ marginBottom: 12 }}
    >
      <FilArianeVue etapes={etapes} />
    </div>
  );
}
