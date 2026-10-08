/**
 * Les quatre étapes de la méthode, en données.
 *
 * Source : `STEPS` de « Migen - Site final.dc.html » (4 entrées). L'apparence
 * des boutons dépend de l'étape choisie, donc d'un état local : elle vit dans
 * `MethodeQuatreEtapes.module.css` et n'a rien à faire ici.
 *
 * ÉCARTS DÉCLARÉS PAR RAPPORT À LA MAQUETTE (règles de copie du 08/10 : une
 * phrase interdite est RETIRÉE, jamais reformulée) :
 *
 * 1. `quand` des étapes 01 et 02 : la maquette écrit « 2 à 5 jours » et
 *    « 1 à 2 semaines », délais chiffrés interdits. Retirés, rien à la place.
 * 2. `corps` de l'étape 02 : la phrase « Vous les rencontrez avant toute mise
 *    à disposition. » est retirée entière (« mise à disposition » interdit).
 * 3. Tirets cadratins des étapes 02 et 04, remplacés par deux-points : c'est
 *    une correction typographique (contrat de projet, « virgule, parenthèses
 *    ou deux-points »), pas une reformulation. À trancher si la règle de
 *    retrait doit aussi s'y appliquer.
 */

import type { EtapeMethode } from "./MethodeQuatreEtapes";

export const ETAPES_METHODE: readonly EtapeMethode[] = [
  {
    cle: "qualification",
    numero: "01",
    titre: "Qualification",
    corps:
      "Un chargé d’affaires vient sur site. Il relève les technologies en présence, les contraintes d’accès et d’horaires, le niveau d’habilitation exigé et ce que coûte une heure d’arrêt.",
    votreCote: "Vous montrez l’installation et dites ce qui vous bloque.",
    resultat:
      "Une proposition chiffrée, avec le périmètre écrit noir sur blanc.",
  },
  {
    cle: "selection",
    numero: "02",
    titre: "Sélection",
    corps:
      "Nous présentons les techniciens retenus à l’issue de notre process : parcours, habilitations, sites comparables déjà tenus.",
    votreCote:
      "Vous validez ou écartez chaque profil, sans avoir à vous justifier.",
    resultat: "Une équipe que vous avez choisie, pas subie.",
  },
  {
    cle: "integration",
    numero: "03",
    titre: "Intégration",
    quand: "Première semaine",
    corps:
      "Accueil sécurité, plan de prévention, prise en main des installations avec vos équipes. Le technicien travaille en binôme les premiers jours pour absorber vos usages.",
    votreCote: "Vous désignez le référent interne qui l’accompagne.",
    resultat: "Un technicien autonome dès la deuxième semaine.",
  },
  {
    cle: "suivi",
    numero: "04",
    titre: "Suivi",
    quand: "Tous les mois",
    corps:
      "Point mensuel sur les heures consommées, les pannes traitées, les gammes tenues. L’équipe s’ajuste : on renforce, on réduit, on change un profil si ça ne va pas.",
    votreCote: "Vous arbitrez sur des chiffres, pas sur une impression.",
    resultat: "Un interlocuteur unique pour tous vos sites.",
  },
];
