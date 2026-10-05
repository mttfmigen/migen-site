/**
 * CE QUE LA MAQUETTE ÉCRIT ET QUE LE CORPUS N'ÉCRIT PAS, pour le gabarit 08.
 *
 * Trois sortes de choses, et aucune n'est inventée :
 *
 *   · `CHROME`  : les chaînes du fichier de maquette, identiques sur les treize
 *     pages. C'est du dessin qui comporte des mots, comme l'en-tête et le pied
 *     de page. `verification-secteur.tsx` RELIT chacune dans
 *     `maquette/gabarit-08-secteur.html` à chaque exécution : une valeur
 *     retouchée ici fait échouer le contrôle, ce qui est le seul moyen de
 *     garantir qu'elle reste celle du client.
 *   · `HUBS` et `PHOTOS` : les deux listes du script de la maquette, transcrites
 *     avec le reste dans le fichier versionné.
 *   · trois AIDES DE TEXTE, qui reproduisent ce que le script de la maquette
 *     fait du texte du corpus avant de le rendre : retirer « 24/24 et 7/7 »,
 *     couper la punchline, extraire le nom de client d'un libellé d'étude de
 *     cas. Ce ne sont pas des retouches ajoutées au passage, ce sont des
 *     fonctions de la maquette, portées.
 *
 * Pas de JSX ici : ce fichier est lisible par un script de contrôle sans monter
 * React.
 */

/* ------------------------------------------------------- le chrome du gabarit */

/**
 * CE QUE LE CORPUS N'ÉCRIT PAS, ET QUE LA MAQUETTE ÉCRIT.
 *
 * Ces chaînes sont le CHROME du gabarit : elles sont les mêmes sur les treize
 * pages, elles sont écrites en dur dans le fichier de maquette validé par le
 * client, et c'est de là qu'elles sortent. Ce n'est pas du texte inventé, et ce
 * n'est pas du texte de corpus : c'est du dessin qui comporte des mots, comme
 * l'en-tête et le pied de page.
 *
 * `verification-secteur.tsx` RELIT chacune de ces chaînes dans le fichier de
 * maquette à chaque exécution. Une valeur retouchée ici fait échouer le
 * contrôle, ce qui est le seul moyen de garantir qu'elle reste celle du client.
 */
export const CHROME = {
  pastilleHero: "Secteurs",
  brefSurtitre: "En bref",
  photoSignature: "Innovation, performance, impact.",
  logosSurtitre: "Ils nous font confiance",
  problemeSurtitre: "Vos contraintes",
  offreSurtitre: "L’offre",
  offreTitre: "Ce que nous faisons, et ce que ça change pour vous",
  offreEnteteGauche: "Ce que nous faisons",
  offreEnteteDroite: "Ce que ça change pour vous",
  derouleSurtitre: "Le déroulé",
  derouleTitre: "Comment ça se passe, étape par étape",
  garantiesSurtitre: "Notre parti pris",
  garantiesTitre: "Ce que nous garantissons",
  certificationsSurtitre: "Certifications",
  certifications: [
    { nom: "MASE", texte: "Démarche sécurité des interventions" },
    { nom: "EcoVadis", texte: "Évaluation de la performance RSE" },
  ],
  certificationsMention:
    "Les attestations sont transmises avec chaque plan de prévention.",
  quiSurtitre: "Qui intervient chez vous",
  quiChiffre: "10 %",
  quiTexte:
    "des candidats retenus. Des techniciens salariés de Migen, évalués sur la technique et le comportement.",
  quiFaits: [
    { titre: "Astreinte", texte: "nuit, week-end et jours fériés" },
    { titre: "4 agences", texte: "Lyon (siège), Montréal, Dubaï, Madrid" },
  ],
  hubsTitre: "10 hubs de techniciens",
  refsSurtitre: "Nos réalisations",
  refsTitre: "Nos références",
  questionsSurtitre: "Questions fréquentes",
  questionsTitre: "Vos questions avant de nous appeler",
  questionsRelance: "Une autre question ? Un technicien vous répond.",
  maillageSurtitre: "Pour aller plus loin",
  finalSurtitre: "Votre besoin",
  finalMention: "Rappel dans l’heure",
} as const;

/**
 * Les dix hubs, dans l'ordre de la maquette (`const HUBS` de son script).
 *
 * Ils ne sont pas repris de `components/site/accueil/HubsAccueil.tsx`, qui n'en
 * porte que six : la maquette de l'accueil en dessine six cartes, celle-ci en
 * nomme dix en pastilles. Deux dessins, deux listes, et c'est le contrat du
 * projet qui dit dix.
 */
export const HUBS = [
  "Paris",
  "Lille",
  "Marseille",
  "Toulouse",
  "Lyon",
  "Metz",
  "Strasbourg",
  "Bordeaux",
  "Dijon",
  "Nantes",
] as const;

/**
 * Les visuels que la maquette distribue en cycle (`const PHOTOS` de son script).
 *
 * Le corpus ne porte aucune image : ces chemins sont du DESSIN, nommés par la
 * maquette, et les sept fichiers existent dans `public/assets/web/`. La carte
 * numéro `i` reçoit `PHOTOS[i % PHOTOS.length]`, comme la maquette.
 */
export const PHOTOS = [
  "team-grind-front",
  "team-duo",
  "ph-tuyaux",
  "ph-robots-solaire",
  "team-grind-close",
  "team-grind-impact",
  "ph-hero-raffinerie",
] as const;

export function photoDeRang(rang: number, decalage = 0): string {
  return `/assets/web/${PHOTOS[(rang + decalage) % PHOTOS.length]}.jpg`;
}

/** Visuels fixes du gabarit, chacun à la place que la maquette lui donne. */
export const PHOTO_HERO = "/assets/web/team-grind-close.jpg";
export const PHOTO_BANDEAU = "/assets/web/ph-tuyaux.jpg";
export const PHOTO_DEROULE = "/assets/web/ph-technicien.jpg";
export const LOGO_BLANC = "/assets/logo-migen-white.png";

/**
 * « 24/24 et 7/7 » retiré du texte du corpus, comme le fait la maquette.
 *
 * CE N'EST PAS UNE CENSURE AJOUTÉE AU PASSAGE : c'est la fonction `__c247` du
 * script de la maquette, portée. Le contrat interdit tout délai chiffré hors
 * « rappel dans l'heure », et le corpus écrit encore « L'astreinte 24/24 et 7/7
 * couvre le reste du temps. ». La maquette rend « L'astreinte couvre le reste
 * du temps. », et c'est ce que le client a validé.
 *
 * Appliqué au RENDU et non à la donnée : le corpus reste intact en base, ce qui
 * laisse la correction rédactionnelle possible sans réimport.
 */
export function sansDisponibiliteChiffree(texte: string): string {
  return texte
    .replace(/,\s*24\/24 et 7\/7\s*,/g, ",")
    .replace(/\s*24\s*\/\s*24(?:\s*(?:et|·|,)\s*7\s*\/\s*7)?/g, "")
    .replace(/\s*24\s*h\s*\/\s*24(?:\s*(?:et|,)?\s*7\s*j?\s*\/\s*7)?/gi, "")
    .replace(/\s+7\s*jours\s*sur\s*7/gi, "")
    .replace(/\s+7\s*j\s*\/\s*7/gi, "")
    .replace(/\s+24\s*\/\s*7\b/g, "")
    .replace(/\s+7\s*\/\s*7\b/g, "");
}

/**
 * La punchline du corpus coupée en titre et paragraphe, comme la maquette.
 *
 * Son script fait `sentences(punch)` puis prend `ps[0]` pour le h2 et le reste
 * pour le paragraphe. Le corpus n'a qu'un champ `punchline` : la coupe est une
 * décision de DESSIN, elle vit donc ici et pas dans les données. Une punchline
 * d'une seule phrase sort un titre et pas de paragraphe, sans rien combler.
 */
export function coupePunchline(punchline: string): {
  titre: string;
  texte: string;
} {
  const phrases = punchline.split(/(?<=[.?!])\s+/).filter(Boolean);
  return {
    titre: phrases[0] ?? punchline.trim(),
    texte: phrases.slice(1).join(" "),
  };
}

/** Le numéro de rang de la maquette : « 01 », « 02 »… */
export function rang(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * Le nom de client d'une preuve, tel que la maquette l'extrait du libellé.
 *
 * Son script retire le préfixe « Étude de cas » puis coupe au premier
 * « deux-points espacé » : « Étude de cas DANONE : lignes de production » donne
 * « DANONE ». Sans libellé, il n'y a pas de nom, et la bande de logos n'en
 * invente pas.
 */
export function clientDePreuve(lienLibelle: string | undefined): string {
  if (!lienLibelle) return "";
  return lienLibelle.replace(/^Étude de cas\s*/, "").split(" : ")[0].trim();
}

