/**
 * Copie de l'écran « Nos valeurs », relevée dans `maquette/accueil-rendu.html`,
 * lignes 5531 à 5669.
 *
 * Les textes vivent ici et non dans le JSX pour une raison de contrôle :
 * `verification-valeurs.tsx` relit la maquette à chaque exécution et compare
 * ces chaînes au fichier. Dispersées dans trois composants, elles seraient
 * comparables une par une mais pas énumérables.
 *
 * L'espace insécable est écrit ` ` : la maquette écrit `&nbsp;`, et un
 * caractère invisible dans une source se perd au premier copier-coller.
 *
 * TROIS ÉCARTS À LA MAQUETTE, imposés par les interdits de copie du contrat
 * (`docs/CONTRAT-PORTAGE-MAQUETTE.md`) :
 *   - l'introduction et la valeur 01 portaient un tiret cadratin, remplacé par
 *     deux-points ;
 *   - l'appel final annonçait un délai de réponse chiffré, retiré : seul le
 *     rappel dans l'heure est autorisé.
 */

export interface Valeur {
  /** Numéro affiché, deux chiffres comme dans la maquette. */
  numero: string;
  titre: string;
  texte: string;
  /** La preuve que le client peut demander. Une valeur sans preuve ne sort pas. */
  preuve: string;
}

/** Les trois mots du slogan, dépliés dans le panneau du héros. */
export const SLOGAN: readonly { mot: string; glose: string }[] = [
  {
    mot: "Innovation",
    glose:
      "Retrofit plutôt que remplacement, bureau d’études intégré. On cherche d’abord à prolonger ce qui existe.",
  },
  {
    mot: "Performance",
    glose:
      "Mesurée chez vous : taux de disponibilité des lignes, pas nombre d’heures facturées.",
  },
  {
    mot: "Impact",
    glose:
      "Un site qui ne s’arrête plus, une équipe qui reste. Le reste est de la communication.",
  },
];

export const VALEURS: readonly Valeur[] = [
  {
    numero: "01",
    titre: "On dit non",
    texte:
      "Nous refusons une mission que nous ne savons pas tenir : technologie inconnue, délai irréaliste, périmètre flou. Un « oui » commercial se paie toujours sur site.",
    preuve:
      "Demandez-nous une référence sur votre technologie exacte. Si nous n’en avons pas, nous le disons avant le devis.",
  },
  {
    numero: "02",
    titre: "Vous validez chaque technicien",
    texte:
      "Aucun intervenant n’arrive sur votre site sans que vous ayez vu son parcours, ses habilitations et, si vous le souhaitez, sa tête. Vous pouvez écarter un profil sans justification.",
    preuve: "Le droit de refus est écrit au contrat, pas sous-entendu.",
  },
  {
    numero: "03",
    titre: "La sécurité passe avant la production",
    texte:
      "Un technicien migen a l’autorisation explicite d’arrêter une intervention qu’il juge dangereuse, même si la ligne attend. Aucune sanction interne pour un arrêt de ce type.",
    preuve:
      "2 accidents avec arrêt, 3 sans arrêt et 1 accident de trajet en 2025, sur plus de 90 000 heures d’intervention.",
  },
  {
    numero: "04",
    titre: "On publie nos procédures",
    texte:
      "Nos process de sélection et d’intervention sont en ligne, étape par étape, taux de passage compris. Publier engage : vous pouvez nous demander des comptes sur chacune.",
    preuve: "Les trois process sont dans la bibliothèque, librement consultables.",
  },
  {
    numero: "05",
    titre: "On forme plutôt qu’on remplace",
    texte:
      "Un technicien qui décroche sur une technologie est formé, pas écarté. 18 heures de formation par collaborateur et par an, habilitations prises en charge intégralement.",
    preuve: "Notre taux de turnover est communiqué sur demande, chiffre brut.",
  },
];

export const HERO = {
  surtitre: "Nos valeurs",
  titre: "Cinq règles, et la preuve qui va avec.",
  intro:
    "Une valeur qu’on ne peut pas vérifier est une affiche de couloir. Chacune des cinq ci-dessous se traduit par une chose concrète que vous pouvez nous demander de prouver : avant de signer, pas après.",
  action: "Nous mettre à l’épreuve",
  /** Rendu en texte, pas en lien : la page RSE n'existe pas encore. */
  secondaire: "Nos engagements RSE",
  panneau: "Le slogan, en clair",
} as const;

export const CORRECTION = {
  surtitre: "Une valeur qui ne tient pas ?",
  titre: "Dites-le nous. On corrige ou on assume.",
  texte:
    "Si une intervention n’a pas respecté l’une de ces cinq règles, écrivez au chargé d’affaires. Nous répondons avec ce qui s’est passé, et ce qui change.",
  action: "Nous écrire",
} as const;

export const FORMULAIRE = {
  titre: "Voyez ces valeurs à l’œuvre sur votre site.",
  intro:
    "Cinq lignes suffisent. Un chargé d’affaires vous rappelle dans l’heure.",
} as const;
