import type { Section } from "./contenu";

/**
 * Forme du contenu des pages de la branche `/expertises/`.
 *
 * LE FICHIER QUI FAIT FOI, et c'est tout l'objet de ce type :
 *
 *   `maquette/gabarit-09-domaine.html`   (« Migen - Gabarit 09 Domaine.dc.html »)
 *   `maquette/gabarit-05-specialite.html` (« Migen - Gabarit 05 Specialite.dc.html »)
 *
 * PAS « Migen - Site final.dc.html ». Le portage précédent a travaillé depuis ce
 * dernier, qui ne consacre au domaine que trois sections (un héros, une mosaïque
 * « Ce que nous traitons », une carte de fin). Le client a conçu ONZE GABARITS
 * DÉDIÉS dans le même projet Claude Design, personne ne les a listés, et les
 * pages ont été portées depuis le mauvais document. Les deux gabarits ci-dessus
 * en dessinent DOUZE sections chacun. C'est la cause du « les pages ne
 * ressemblent toujours pas ».
 *
 * CE QUE CES DEUX GABARITS SÉPARENT, et donc pourquoi un seul type suffit : ils
 * portent les mêmes douze sections, la même matière, le même parseur (leur
 * propre commentaire le dit : « dérivé du gabarit 03, mêmes blocs, même
 * parseur »). Ils ne divergent que sur quatre points, tous d'habillage :
 *
 *   1. la pastille du héros, « Expertises » contre « Spécialité » ;
 *   2. la place du maillage, juste après l'offre contre tout en bas ;
 *   3. le surtitre de ce maillage, « La famille technique » contre
 *      « Pour aller plus loin », et son H2 présent contre absent ;
 *   4. deux visuels permutés, et la densité par défaut.
 *
 * Deux types jumeaux auraient dérivé l'un de l'autre au premier ajustement.
 * `gabarit` discrimine, exactement comme `ContenuEditorial` et `ContenuOffre`.
 *
 * QUI REÇOIT QUOI :
 *
 *   `gabarit: "domaine"`    les 9 racines de domaine, `/expertises/<domaine>/`
 *   `gabarit: "specialite"` les 10 sous-pages, `/expertises/<domaine>/<page>/`
 *
 * POURQUOI AUCUN CHAMP PROPRE, et pourquoi c'est la bonne nouvelle. Le corpus
 * rédigé porte DÉJÀ les dix sections nommées de `types/contenu.ts`, et les douze
 * cases de la maquette se remplissent toutes depuis ces dix sections : le héros
 * et sa carte « En bref » depuis `heros` et `chiffres`, le problème depuis
 * `probleme`, le tableau de l'offre depuis `offre`, et ainsi de suite jusqu'à
 * l'appel final. Rien ne manquait au corpus : c'est le PLACEMENT qui était faux.
 * Déclarer ici une forme à plat aurait obligé à recopier le corpus dans d'autres
 * noms, donc à le réécrire, donc à le trahir. `sections` est repris TEL QUEL, et
 * l'import ne fait qu'y ajouter le discriminant.
 *
 * Les quelques valeurs que la maquette calcule (le découpage de la punchline en
 * titre et paragraphe, la numérotation des lignes de l'offre, les cartes de
 * maillage déduites des liens du texte) sont des dérivations d'AFFICHAGE : elles
 * vivent dans `components/site/domaine/PageDomaine.tsx`, pas en base, parce
 * qu'elles ne portent aucune information que le corpus n'ait déjà.
 */
export interface ContenuDomaine {
  gabarit: "domaine" | "specialite";
  /** Les dix sections du corpus, dans leur ordre d'écriture. Jamais réarrangées. */
  sections: Section[];
}

/**
 * Le contenu est-il une page de domaine ou de spécialité technique ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on regarde ce qu'il y a, pas ce
 * qu'un type déclare. `sections` est exigé, et pas seulement le discriminant :
 * c'est ce qui empêche un `{gabarit:"domaine"}` resté d'un import antérieur, à
 * l'ancienne forme en mosaïque, d'entrer dans ce gabarit et d'y rendre douze
 * sections vides.
 */
export function estDomaineOuSpecialite(
  contenu: unknown,
): contenu is ContenuDomaine {
  if (!contenu || typeof contenu !== "object") return false;
  const { gabarit, sections } = contenu as {
    gabarit?: unknown;
    sections?: unknown;
  };
  return (
    (gabarit === "domaine" || gabarit === "specialite") &&
    Array.isArray(sections)
  );
}
