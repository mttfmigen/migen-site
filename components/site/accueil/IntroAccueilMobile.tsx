import { CHAPO_HEROS, CHIFFRES_HEROS } from "./Hero";
import m from "./AccueilMobile.module.css";

/**
 * L'introduction et les chiffres clés, TÉLÉPHONE SEULEMENT, sous la bande
 * « Ils nous font confiance » : l'ordre du haut de l'accueil dans la maquette
 * V3 « Site mobile » (logos, paragraphe, tuiles « Chiffres clés »).
 *
 * Le texte et les chiffres sont ceux du héros de bureau, lus dans les mêmes
 * constantes (`Hero.tsx`), qui s'efface à cette largeur : rien n'est écrit
 * deux fois. Les tuiles prennent le motif partagé de la maquette mobile
 * (`data-tuiles-titre`, `data-tuiles-chiffres`, `app/globals.css`).
 */
export default function IntroAccueilMobile() {
  return (
    <section data-mobile-seulement="" className={m.intro} aria-labelledby="chiffres-cles-titre">
      <p className={m.introTexte}>{CHAPO_HEROS}</p>
      <h2 id="chiffres-cles-titre" data-tuiles-titre="">
        Chiffres clés
      </h2>
      <div data-tuiles-chiffres="">
        {CHIFFRES_HEROS.map((chiffre) => (
          <div key={chiffre.valeur}>
            <div>{chiffre.valeur}</div>
            <div>{chiffre.libelle}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
