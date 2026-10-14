import type { BlocRessource, ContenuRessource, PartieRessource } from "@/types/ressource";
import type { CarteFiche, ContenuFicheMetier, SectionFiche } from "@/types/metier";

/**
 * Une fiche du côté Techniciens (gabarit 07, `/carriere/...`) lue par le
 * lecteur latéral : la maquette « Ressources v2 » ouvre ces fiches dans le même
 * lecteur que les articles (parties numérotées, cartes, frise, tableau, FAQ).
 * Le TEXTE reste celui de la page servie ; seule la forme change.
 *
 * Non portés, comme dans la maquette : les chiffres du héros, le bouton
 * « Postuler » des bandes (leur phrase devient l'encadré « À retenir »), le
 * formulaire et les liens de pied de fiche (« À lire ensuite » les remplace).
 */

const enItem = (c: CarteFiche) => `**${c.titre}** : ${c.texte}`;
const paragraphes = (t: string[] = []): BlocRessource[] => t.map((texte) => ({ type: "paragraphe", texte }));

/** La bande d'une section est l'encadré « À retenir » du lecteur de la maquette. */
function partie(s: SectionFiche): PartieRessource | null {
  const p = corps(s);
  const bande = "bande" in s ? s.bande?.texte : undefined;
  return p && bande ? { ...p, blocs: [...p.blocs, { type: "encadre", texte: bande }] } : p;
}

function corps(s: SectionFiche): PartieRessource | null {
  switch (s.type) {
    case "bento":
    case "liste":
    case "duo":
      return { titre: s.titre, blocs: [...paragraphes(s.intros), { type: "puces", items: s.cartes.map(enItem) }] };
    case "etapes":
      return { titre: s.titre, blocs: [...paragraphes(s.intros), { type: "etapes", items: s.etapes.map(enItem) }] };
    case "tableau":
      return {
        titre: s.titre,
        blocs: [
          ...paragraphes(s.intros),
          {
            type: "tableau",
            entetes: s.entetes ? [s.entetes.gauche, s.entetes.droite] : [],
            lignes: s.lignes.map((l) => [l.gauche, l.droite]),
          },
        ],
      };
    case "grille":
      return { titre: s.titre, blocs: [...paragraphes(s.intros), { type: "tableau", entetes: s.colonnes, lignes: s.lignes }] };
    case "encart":
      return { titre: s.titre, blocs: paragraphes(s.textes) };
    default:
      return null;
  }
}

/** Le contenu du lecteur, plus l'introduction de la FAQ, que seules les fiches portent. */
export type ContenuLecteurFiche = ContenuRessource & { introFaq?: string[] };

export function ficheVersLecteur(fiche: ContenuFicheMetier): ContenuLecteurFiche {
  const faq = fiche.sections.find((s) => s.type === "faq");
  return {
    gabarit: "ressource",
    chapo: [fiche.heros.chapeau, ...(fiche.heros.paragraphes ?? [])],
    parties: fiche.sections.map(partie).filter((p): p is PartieRessource => p !== null),
    questions: faq?.type === "faq" ? faq.questions : [],
    introFaq: faq?.type === "faq" ? faq.intros : undefined,
  };
}
