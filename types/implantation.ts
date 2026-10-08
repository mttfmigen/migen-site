/**
 * Forme du contenu des pages filles de `/implantations/`, villes et
 * départements : depuis le 08/10, les 8 captures du gabarit « 06 Département »
 * ont les 17 écrans d'une ville, leurs fiches portent donc `ContenuVille`.
 *
 * LA VILLE, refaite le 07/10 contre la référence du jour : le rendu figé de
 * CHAQUE page, `maquette/rendu/implantations--<cle>.html`. Le gabarit « 04
 * Ville » est rendu par `MigenExpertise.dc.html` en mode ville (passation du
 * client, `design_handoff_migen_site/README.md`) : c'est le gabarit 03 Offre,
 * section pour section, plus UN écran propre, « Hub local », entre la bande
 * d'appel des domaines et la problématique. Trois écrans y ont un dessin de
 * ville (problème en rangée ou en panneau sombre, questions, maillage) :
 * `components/site/implantation/`. L'ancien type portait le bloc
 * `isVille` de `accueil-rendu.html`, un écran de démonstration qui n'est le
 * gabarit d'aucune page.
 *
 * D'OÙ LA FORME : les champs de `ContenuOffre` que ces sections lisent, repris
 * par `Pick` et jamais redéclarés, plus `hubLocal`. Les écrans de l'offre sont
 * rendus par les composants de `components/site/offre/`, avec la même donnée.
 *
 * AUCUNE VALEUR N'EST INVENTÉE. Tout est optionnel, et une section sans donnée
 * ne se rend pas. Une phrase de la capture que le contrat interdit n'est pas
 * reformulée : elle n'est pas écrite ici, et elle est déclarée dans le champ
 * `trous` du fichier de la page, que `verification-ville.tsx` relit.
 */

import type { Section } from "./contenu";
import type { ContenuOffre } from "./offre";
import type { ContenuSecteur } from "./secteur";

/** Une carte de la grille du hub local : un secteur du bassin, ou une offre. */
export interface CarteHubLocal {
  /** « Tissu principal », « Aussi présent », « Notre offre ». */
  surtitre: string;
  titre: string;
  texte: string;
  /** « Notre approche chimie », « Voir l’offre ». La flèche est du gabarit. */
  lien: string;
  href: string;
}

/** Une pastille de la bande des zones. */
export interface ZoneHubLocal {
  libelle: string;
  href: string;
}

/**
 * L'écran « Hub local », relevé sur `implantations--lyon.html` (un hub) et
 * `implantations--maintenance-industrielle-angers.html` (une ville sans hub).
 * Le téléphone, la flèche du bouton et le préfixe « Aperçu Envato · » sont du
 * gabarit : ils sont les mêmes sur les 66 captures.
 *
 * Trois cas, que la source (`cityVals` de `MigenExpertise.dc.html`) tire de
 * l'URL : un HUB (`/implantations/lyon/`), une ZONE d'un hub
 * (`/implantations/lyon/grenoble/`), une VILLE sans hub
 * (`/implantations/maintenance-industrielle-angers/`). Le texte se copie
 * toujours de la capture de la page.
 */
export interface HubLocal {
  /** « Votre hub local · Lyon ». */
  surtitre: string;
  /** Le H2, espace insécable avant les deux-points comme la capture. */
  titre: string;
  /**
   * La photo du panneau sombre. La capture ne la montre pas (`blob:`) : c'est
   * la RÈGLE de la source, que `verification-ville.tsx` recalcule. L'URL
   * Envato `src` de `maquette/contenu/site/photos-villes.json` pour les douze
   * pages qui y figurent, sinon `/assets/web/<repli>.jpg`, le repli étant
   * `["sv-convoyeur", "sv-armoire", "sv-duo-impact", "sv-portrait",
   * "team-grind-front", "team-electric"][h % 6]`, `h = (h * 31 + code) >>> 0`
   * sur les caractères de l'URL.
   */
  photo: string;
  /** Le `credit` de `photos-villes.json`, seulement avec une photo Envato. */
  credit?: string;
  /** Hub « Hub Migen », zone « Rattaché au hub Lyon », ville « Techniciens itinérants ». */
  badge: string;
  /** « Hub Lyon », « Grenoble, couvert par le hub Lyon », « Angers et ses environs ». */
  nom: string;
  texte: string;
  /** Le libellé du bouton vers `/contact/` : « Demander une intervention à Lyon ». */
  bouton: string;
  cartes: CarteHubLocal[];
  /**
   * « Zones couvertes par le hub », « Hub de rattachement et zones voisines »,
   * « Nos hubs ». Un hub sans zone (Lille, Metz, Dijon, Bordeaux) n'a ni titre
   * ni pastilles : la bande ne se rend pas.
   */
  zonesTitre?: string;
  zones?: ZoneHubLocal[];
}

/** Le contenu d'une page de VILLE, gabarit « 04 Ville ». */
export interface ContenuVille
  extends Pick<
    ContenuOffre,
    | "pastille"
    | "chapeau"
    | "actions"
    | "mention"
    | "appelBouton"
    | "formulaireHeroTitre"
    | "formulaireHeroMention"
    | "chiffres"
    | "problemePhoto"
    | "complementOffre"
    | "brefBande"
    | "brefBouton"
    | "brefMention"
    | "marquesFamille"
    | "marquesFamilles"
    | "sections"
  > {
  gabarit: "ville";
  hubLocal?: HubLocal;
  /**
   * Le H2 de « 03 Problème » est un TROU : la première phrase de la punchline
   * de la capture est interdite (Vesoul, « 24 h sur 24 »). La `punchline` du
   * fichier ne porte alors que la suite, rendue à sa place (le paragraphe de
   * droite), et aucun H2 n'est rendu. Honoré en rangée et en panneau sombre,
   * les deux dessins des captures concernées. `verification-ville.tsx` exige
   * que la phrase soit déclarée dans `trous`, et l'inverse.
   */
  problemeSansTitre?: boolean;
}

/**
 * MORT, en attente de suppression. Plus aucune fiche ne porte
 * `gabarit: "departement"` et la route ne le reconnaît plus (08/10). Ce type ne
 * reste que pour `components/site/implantation/PageDepartement.tsx` et
 * `verification-implantation.tsx`, eux-mêmes morts : il part avec eux.
 */
export interface ContenuDepartement extends Omit<ContenuSecteur, "gabarit"> {
  gabarit: "departement";
  reste?: Section[];
}

/** Le contenu est-il celui d'une page de ville ? Lu sur un `jsonb`, donc sur de l'`unknown`. */
export function estVille(contenu: unknown): contenu is ContenuVille {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuVille).gabarit === "ville"
  );
}
