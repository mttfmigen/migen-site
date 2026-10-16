/**
 * Les quatre piliers RSE, portés de la maquette (`maquette/accueil-rendu.html`,
 * lignes 5672 à 5843, écran « Engagements RSE »).
 *
 * Données hors composant pour une seule raison : la carte est un gabarit répété
 * quatre fois, et la copie se relit mieux ici qu'au milieu du balisage.
 *
 * TROIS ÉCARTS À LA MAQUETTE, imposés par les interdits de copie du contrat
 * (`docs/CONTRAT-PORTAGE-MAQUETTE.md`) qui l'emportent sur elle :
 *
 *  1. Pilier 04, chapeau : la maquette écrit « Cinq agences ». Le compte tenu
 *     est de quatre agences (Lyon siège à Limonest, Montréal, Dubaï, Madrid) et
 *     dix hubs de techniciens.
 *  2. Pilier 04, premier indicateur : « moins de 45 min de trajet moyen depuis
 *     l'agence jusqu'au site » est un délai chiffré d'intervention. Seul
 *     « rappel dans l'heure » est autorisé, la ligne tombe.
 *  3. Pilier 04, troisième indicateur : « 5 bassins d'emploi » reprenait le
 *     compte d'agences erroné. Le compte retenu est celui des dix hubs.
 *
 * Tous les chiffres restants sont ceux de la maquette, non confirmés : ils sont
 * remontés dans le rapport de portage pour validation par Mehdi.
 */

export interface Indicateur {
  /** La valeur mise en avant, en orange. */
  valeur: React.ReactNode;
  /** Ce que la valeur mesure. */
  libelle: string;
}

export interface Pilier {
  rang: string;
  titre: string;
  chapeau: string;
  indicateurs: readonly Indicateur[];
  /** Note de bas de carte, au-dessus du filet. */
  note: string;
}

export const PILIERS: readonly Pilier[] = [
  {
    rang: "01",
    titre: "Sécurité des personnes",
    chapeau:
      "Le premier engagement d’une entreprise dont les équipes travaillent sur des installations sous tension, en hauteur ou en atmosphère à risque.",
    indicateurs: [
      { valeur: "2", libelle: "accidents avec arrêt sur l’exercice 2025, 3 sans arrêt" },
      { valeur: "100 %", libelle: "des habilitations vérifiées avant mise sur site" },
      { valeur: "48 h", libelle: "délai maximal d’analyse après un presque-accident" },
    ],
    note:
      "Un technicien peut arrêter une intervention qu’il juge dangereuse, sans sanction interne. C’est écrit dans son contrat.",
  },
  {
    rang: "02",
    titre: "Emploi et compétences",
    chapeau:
      "Le métier manque de bras. Former et garder coûte moins cher que remplacer, pour nous comme pour vos lignes.",
    indicateurs: [
      { valeur: "18 h", libelle: "de formation par collaborateur et par an" },
      { valeur: "6", libelle: "alternants et apprentis accueillis en 2025" },
      { valeur: "100 %", libelle: "des habilitations financées par migen" },
    ],
    note:
      "Fourchettes de rémunération publiées sur chaque fiche métier. Taux de turnover communiqué sur demande.",
  },
  {
    rang: "03",
    titre: "Prolonger plutôt que remplacer",
    chapeau:
      "Notre premier poste d’impact environnemental. Un retrofit d’automate évite le remplacement complet d’une ligne, et tout ce que cela suppose en acier, en transport et en déchets.",
    indicateurs: [
      { valeur: "10 ×", libelle: "moins coûteux qu’un remplacement de ligne, en moyenne" },
      { valeur: "+8 ans", libelle: "de durée de vie gagnée sur une machine rétrofitée" },
      { valeur: "100 %", libelle: "des déchets de maintenance triés et tracés" },
    ],
    note:
      "Nous chiffrons systématiquement l’option retrofit avant de proposer un remplacement, même quand elle nous rapporte moins.",
  },
  {
    rang: "04",
    titre: "Proximité et achats",
    chapeau:
      "Quatre agences et dix hubs de techniciens, ce n’est pas qu’un argument de réactivité : c’est aussi moins de kilomètres par intervention.",
    indicateurs: [
      { valeur: "72 %", libelle: "de nos achats auprès de fournisseurs français" },
      { valeur: "10", libelle: "hubs de techniciens où nous recrutons localement" },
    ],
    note:
      "Un technicien part de l’agence la plus proche, jamais du siège. Les véhicules de service sont renouvelés par tranches, vers l’hybride puis l’électrique.",
  },
];
