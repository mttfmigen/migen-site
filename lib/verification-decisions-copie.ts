// bun lib/verification-decisions-copie.ts
import assert from "node:assert/strict";

import { appliqueDecisions, copieConforme } from "./decisions-copie";

const CHANGE: [string, string][] = [
  ["10 % des candidats retenus", "10 % des techniciens retenus"],
  ["Des candidats retenus, entretien technique", "Des techniciens retenus, entretien technique"],
  ["Candidats retenus · Nos techniciens", "Techniciens retenus · Nos techniciens"],
  ["Seuls 10 % des candidats sont retenus.", "Seuls 10 % des techniciens sont retenus."],
  ["Part des candidats retenus, après entretien", "Part des techniciens retenus, après entretien"],
  ["seuls 10 % des candidats passent cette sélection", "seuls 10 % des techniciens passent cette sélection"],
  ["Des candidats franchissent l'entretien technique", "Des techniciens franchissent l'entretien technique"],
  ["Chaque candidat passe une épreuve technique", "Chaque technicien passe une épreuve technique"],
  ["Chaque candidat est évalué sur des cas réels", "Chaque technicien est évalué sur des cas réels"],
  ["un candidat sur dix retenu", "un technicien sur dix retenu"],
  ["le but : un candidat retenu sur dix.", "le but : un technicien retenu sur dix."],
  ["Entretien technique et comportemental pour chaque candidat, 10 % retenus", "Entretien technique et comportemental pour chaque technicien, 10 % retenus"],
  ["Nous évaluons chaque candidat en entretien technique", "Nous évaluons chaque technicien en entretien technique"],
  ["Migen est née ici en 2021, siège à Limonest et bureaux à Écully, et nos techniciens", "Migen est née ici en 2021, siège à Écully, et nos techniciens"],
  ["Quatre agences, Lyon (siège, à Limonest et Écully), Montréal", "Quatre agences, Lyon (siège, à Écully), Montréal"],
  ["Le siège est à Lyon, sur Limonest et Écully, et le groupe", "Le siège est à Lyon, à Écully, et le groupe"],
  ["Notre siège est à Lyon (Limonest, bureaux à Écully), et nos hubs", "Notre siège est à Lyon (Écully), et nos hubs"],
  ["l’entreprise pilote son activité depuis Limonest, avec des bureaux à Écully.", "l’entreprise pilote son activité depuis son siège d’Écully."],
  ["Lyon Siège · Limonest et Écully Montréal", "Lyon Siège · Écully Montréal"],
];
const INCHANGE = [
  "Rareté des candidats, coût de la vie",
  "faute de candidats en nombre suffisant sur le marché",
  "maintenir l'équité entre candidats",
  "Un candidat qui connaît l'ordre de grandeur dimensionne sa proposition",
  "Envoyer ma candidature",
  "Comment les candidats sont évalués avant l'embauche",
  "La FAQ ci-dessous rassemble les questions que chaque candidat pose avant de signer, offre en main.",
  "Un référent pour accompagner chaque candidat recruté dès la prise de poste.",
  "Dossier envoyé aux candidats présélectionnés, visites de site organisées.",
  "Derrière ce hub, notre siège à Lyon et nos agences de Montréal, Dubaï et Madrid.",
  "S'y ajoutent notre siège lyonnais et nos agences de Montréal, Dubaï et Madrid.",
];

for (const [avant, apres] of CHANGE) assert.equal(appliqueDecisions(avant), apres);
for (const texte of INCHANGE) assert.equal(appliqueDecisions(texte), texte);
assert.equal(
  copieConforme("Techniciens évalués, 10 % des candidats retenus. Astreinte 24/24 et 7/7 en option. Rappel dans l'heure."),
  "Techniciens évalués, 10 % des techniciens retenus. Rappel dans l'heure.",
);
assert.equal(copieConforme("Maintenance industrielle Lyon : siège Migen à Limonest, dépannage."), "Maintenance industrielle Lyon : siège Migen à Écully, dépannage.");
assert.equal(copieConforme("Pas au hasard. 10 % des candidats retenus, 4 agences en France."), "Pas au hasard.");
console.log(`décisions de copie : ${CHANGE.length} réécritures et ${INCHANGE.length} phrases laissées, conformes`);
