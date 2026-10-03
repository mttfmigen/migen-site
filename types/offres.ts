import type { Section } from "./contenu";

/**
 * Forme du contenu du HUB `/offres/`, tel que la maquette le dessine.
 *
 * POURQUOI UN GABARIT DE PLUS. La maquette donne à `/offres/` quatre sections
 * qui n'existent dans aucun autre gabarit : un bandeau d'ouverture dont le
 * visuel porte les repères en incrustation, une entrée PAR BESOIN en mosaïque,
 * les offres en cartes numérotées dont une en panneau sombre, et un bloc de fin
 * en grande carte de verre. Servie par le gabarit de vente, la page rendait dix
 * sections empilées là où la maquette en dessine quatre : c'est ce que le client
 * a vu quand il a dit « les pages offres ne sont pas comme sur la maquette ».
 *
 * LE TEXTE VIENT DU CORPUS, LE DESSIN DE LA MAQUETTE. Aucun champ de ce type
 * n'existe pour une raison d'habillage : chacun reçoit une valeur que le corpus
 * de la page fournit réellement. Les parties de la maquette que le corpus
 * n'alimente pas sont absentes de ce type, volontairement, et listées dans
 * `scripts/verifie-offres.tsx` :
 *
 *   · le dépliant de chaque carte de besoin (détail, puces, tableau
 *     Cadre / Délai / Durée, bouton par besoin) ;
 *   · l'étiquette d'offre portée par une carte de besoin, qui est pourtant la
 *     raison d'être de la section ;
 *   · le chiffre d'appui en pied de carte d'offre (« 6 mois », « J−90 ») et la
 *     pastille « Abonnement », que la maquette écrit en dur.
 *
 * Rien n'y est comblé au jugé : le client a une règle, vide plutôt que faux.
 *
 * LE H1 N'EST PAS ICI. Il vient de `pages.titre_h1`, comme pour tous les autres
 * gabarits : un seul endroit pour le titre, donc jamais deux H1 sur une page.
 */

/** Un bouton du bandeau d'ouverture. Sans cible connue, il ne se rend pas. */
export interface ActionOffres {
  libelle: string;
  /** Chemin interne ou ancre. Jamais `#` seul. */
  href: string;
}

/**
 * Un repère en incrustation sur le visuel du bandeau.
 *
 * C'est la section `chiffres` du corpus, rendue à l'emplacement que la maquette
 * lui donne. La maquette en dessine deux, écrits en dur, dont « +200 clients
 * industriels » : le compte tenu est « plus de 120 clients, dont plus de 80
 * réguliers », et c'est le corpus qui le porte.
 */
export interface Repere {
  /** « + 120 », « 10 % ». Tel que le corpus l'écrit, espace comprise. */
  valeur: string;
  libelle: string;
}

/** Surtitre en capitales orange, puis le H2. La note de droite est optionnelle. */
export interface EnTeteOffres {
  surtitre: string;
  titre: string;
  /** La phrase en petit, à droite du titre. Absente, rien ne s'affiche. */
  note?: string;
}

/**
 * Une carte de la mosaïque « Par besoin » : la situation, ce qu'elle produit.
 *
 * `besoin` est l'accroche de la puce du corpus, `reponse` son texte. Le
 * dépliant de la maquette n'est pas porté : le corpus ne dit pas quelle offre
 * répond à quel besoin, et une carte qui s'ouvre sur du vide vaut moins qu'une
 * carte qui ne s'ouvre pas.
 */
export interface CarteBesoin {
  besoin: string;
  reponse: string;
}

/**
 * Une carte d'offre.
 *
 * `texte` et `benefice` sont les deux phrases du corpus, dans cet ordre, et
 * elles portent leur Markdown en ligne : le maillage du cocon y vit, et c'est
 * `TexteRiche` qui le rend.
 */
export interface CarteOffre {
  titre: string;
  texte: string;
  /** Ce que l'offre change. Rendu sous le texte, même colonne. */
  benefice?: string;
  /** La page de l'offre. Absente, la carte se rend sans son bouton. */
  href?: string;
  /** Carte en panneau anthracite. La maquette la réserve à la deuxième. */
  accent?: boolean;
}

export interface ContenuOffres {
  gabarit: "offres";
  /** Capitales orange au-dessus du H1. */
  surtitre?: string;
  /** Le paragraphe sous le H1. */
  chapeau?: string;
  actions?: ActionOffres[];
  /** Le téléphone du corpus, rendu en second bouton du bandeau. */
  telephone?: string;
  /** La phrase d'horaires et de rappel, sous un filet. */
  phraseDelai?: string;
  /** Les repères en incrustation sur le visuel. */
  reperes?: Repere[];
  /**
   * Le visuel du bandeau, servi depuis `public/`.
   *
   * Absent, le cadre se rend sur le fond `--ph` avec son dégradé : les repères
   * restent lisibles, et aucune photo n'est choisie à la place du client.
   */
  visuel?: { src: string; alt: string };
  besoins?: { entete: EnTeteOffres; cartes: CarteBesoin[] };
  offres?: { entete: EnTeteOffres; cartes: CarteOffre[]; lienLibelle?: string };
  /** Le bloc de fin, en grande carte de verre. */
  fin?: {
    surtitre: string;
    question: string;
    rappel?: string;
    bouton: string;
    href?: string;
  };
  /**
   * Ce que le corpus porte et que la maquette ne dessine pas.
   *
   * POURQUOI CE CHAMP EXISTE. La maquette du hub dessine quatre sections ; le
   * corpus de `/offres/` en écrit dix. Le déroulé en six étapes, les quatre
   * engagements, l'appel à l'action de milieu de page, les six réalisations et
   * les six questions fréquentes n'ont aucun emplacement dans le dessin. C'est
   * du texte rédigé, payé, et c'est la substance du référencement de la page :
   * il ne se supprime pas parce qu'un écran ne l'a pas prévu.
   *
   * Les sections sont donc gardées TELLES QUELLES, dans leur forme de vente, et
   * rendues par les blocs de `components/site/blocs/`, eux-mêmes portés de la
   * maquette. La page garde le dessin de la maquette ET tout son texte, sans
   * qu'un seul motif de section soit inventé pour l'occasion.
   */
  complement?: Section[];
}

/**
 * Le contenu est-il celui du hub des offres ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on se fie au champ discriminant
 * et à rien d'autre. Les autres gardes du routeur regardent d'autres valeurs de
 * `gabarit`, ou la clé `blocs` : aucune ne peut se marcher dessus.
 */
export function estOffres(contenu: unknown): contenu is ContenuOffres {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuOffres).gabarit === "offres"
  );
}
