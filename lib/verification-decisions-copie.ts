// bun lib/verification-decisions-copie.ts
// bun lib/verification-decisions-copie.ts --controle   (mode témoin)
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { appliqueDecisions, clePage, copieConforme } from "./decisions-copie";

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
];
/* 09/10 : le siège est revenu à Limonest, donc le texte de la maquette ne doit
   plus être touché du tout. Ces six phrases étaient réécrites jusqu'au 08/10 ;
   elles doivent désormais passer intactes, et c'est ce qui le prouve. */
const SIEGE_INTACT = [
  "Migen est née ici en 2021, siège à Limonest et bureaux à Écully, et nos techniciens",
  "Quatre agences, Lyon (siège, à Limonest et Écully), Montréal",
  "Le siège est à Lyon, sur Limonest et Écully, et le groupe",
  "Notre siège est à Lyon (Limonest, bureaux à Écully), et nos hubs",
  "l’entreprise pilote son activité depuis Limonest, avec des bureaux à Écully.",
  "Lyon Siège · Limonest et Écully Montréal",
  "Maintenance industrielle Lyon : siège Migen à Limonest, dépannage.",
];
for (const texte of SIEGE_INTACT) assert.equal(appliqueDecisions(texte), texte);

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

/* 09/10 AU SOIR : LE RENOMMAGE D'ORTHUS DOIT RESTER DU FRANÇAIS.
   Trois phrases servies étaient fautives, trouvées en lisant le HTML des pages
   et non la règle : « sous le pilotage d'Migen Travaux » et « confie à Migen
   Travaux, la construction complète ». Remplacer un nom par un autre n'est pas
   une substitution de chaîne : le français élide devant une voyelle, et une
   apposition emporte UNE virgule ou LES DEUX selon ce qu'elle sépare.
   Les dix phrases ci-dessous sont celles du corpus, relevées une par une. */
const ORTHUS_FRANCAIS: [string, string][] = [
  ["Le chantier est mené sous le pilotage d'Orthus, filiale du groupe Migen.", "Le chantier est mené sous le pilotage de Migen Travaux."],
  ["Ecocem confie à Orthus, filiale du groupe Migen, la construction complète.", "Ecocem confie à Migen Travaux la construction complète."],
  ["Elle a confié à Orthus, filiale du groupe Migen, la construction complète.", "Elle a confié à Migen Travaux la construction complète."],
  ["WashTec confie à Orthus, filiale du groupe Migen, le montage complet.", "WashTec confie à Migen Travaux le montage complet."],
  ["Chantier piloté de bout en bout par Orthus, filiale du groupe, coordination multi-métiers.", "Chantier piloté de bout en bout par Migen Travaux, coordination multi-métiers."],
  ["Chantier piloté de bout en bout par Orthus, filiale du groupe, jalons critiques suivis.", "Chantier piloté de bout en bout par Migen Travaux, jalons critiques suivis."],
  ["Ces chantiers sont portés par Orthus, marque sœur créée en 2024 par le groupe, qui partage nos équipes.", "Ces chantiers sont portés par Migen Travaux, qui partage nos équipes."],
  ["Ecocem confie à Orthus la conception et la réalisation.", "Ecocem confie à Migen Travaux la conception et la réalisation."],
  ["Le montage est porté par Orthus.", "Le montage est porté par Migen Travaux."],
  ["L'équipe Orthus réceptionne le portique.", "L'équipe Migen Travaux réceptionne le portique."],
];

/* 08/10 : les photos de ville sous licence, et le téléphone rendu à ses phrases.
   Ces deux règles s'appliquent à la CAPTURE avant comparaison au rendu, donc une
   règle trop large ferait passer un vrai défaut sans que rien ne le dise. Les
   contre-exemples comptent ici autant que les exemples. */
const PHOTOS: [string, string][] = [
  ["Aperçu Envato · Lyon city in France · RossHelen", ""],
  ["Aperçu Envato · Bordeaux city in France · RossHelen", ""],
  ["Aperçu Envato · Port à conteneurs · nikonlamp", ""],
  ["Aperçu Envato · Vannes · Unai82", ""],
];
const TEL: [string, string][] = [
  ["Pour nous joindre : , du lundi au vendredi de 8h00 à 18h30.", "Pour nous joindre : 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30."],
  ["Un chargé d'affaires vous rappelle dans l'heure, du lundi au vendredi de 8h00 à 18h30 : .", "Un chargé d'affaires vous rappelle dans l'heure, du lundi au vendredi de 8h00 à 18h30 : 04 78 33 72 05."],
  ["Un premier contact suffit : , nous vous rappelons dans l'heure.", "Un premier contact suffit : 04 78 33 72 05, nous vous rappelons dans l'heure."],
];
/* Ce que la règle du téléphone ne doit SURTOUT pas toucher : un deux-points
   suivi d'un mot, d'un chiffre ou d'une majuscule est une phrase normale, et le
   corpus en est plein. */
const TEL_INCHANGE = [
  "Habilitations, travail en hauteur, espace confiné : les autorisations sont à jour.",
  "Pour nous joindre : 04 78 33 72 05, du lundi au vendredi.",
  "Trois sites, deux équipes ; un seul référent.",
  "Le constat est simple : moderniser coûte moins cher que remplacer.",
  "Nos agences : Lyon, Montréal, Dubaï, Madrid.",
  "Rappel dans l'heure. Astreinte la nuit, le week-end et les jours fériés.",
];

for (const [avant, apres] of PHOTOS) assert.equal(appliqueDecisions(avant).trim(), apres);
for (const [avant, apres] of TEL) assert.equal(appliqueDecisions(avant), apres);
for (const texte of TEL_INCHANGE) assert.equal(appliqueDecisions(texte), texte);

for (const [avant, apres] of CHANGE) assert.equal(appliqueDecisions(avant), apres);
for (const texte of INCHANGE) assert.equal(appliqueDecisions(texte), texte);
assert.equal(
  copieConforme("Techniciens évalués, 10 % des candidats retenus. Astreinte 24/24 et 7/7 en option. Rappel dans l'heure."),
  "Techniciens évalués, 10 % des techniciens retenus. Rappel dans l'heure.",
);
assert.equal(copieConforme("Pas au hasard. 10 % des candidats retenus, 4 agences en France."), "Pas au hasard.");
/* Le renommage d'Orthus, phrase par phrase : la forme compte autant que le nom. */
for (const [avant, apres] of ORTHUS_FRANCAIS) {
  assert.equal(appliqueDecisions(avant), apres, `renommage d'Orthus : « ${avant} »`);
}

console.log(
  `décisions de copie : ${CHANGE.length} réécritures, ${PHOTOS.length} crédits de photo retirés, ` +
    `${TEL.length} téléphones rendus, ${INCHANGE.length + TEL_INCHANGE.length + SIEGE_INTACT.length} phrases laissées intactes, conformes`,
);

/* ======================================================================== */
/* 12/10, « EXPERT TECHNIQUE » SUR BUREAU D'ÉTUDES ET TRAVAUX INDUSTRIELS.   */
/*                                                                          */
/* CETTE PORTE VÉRIFIE LES DEUX CÔTÉS, et c'est tout son intérêt : la        */
/* donnée des dix fiches doit déjà porter la décision, et la CAPTURE, passée */
/* par `appliqueDecisions` avec la clé de sa page, doit la porter aussi.     */
/* Sans le second point, la comparaison mot pour mot refuserait la donnée    */
/* au lieu de refuser un vrai défaut.                                       */
/*                                                                          */
/* ELLE VÉRIFIE AUSSI QUE LA DÉCISION NE FUIT PAS : « 10 % des techniciens   */
/* retenus » vit dans 146 des 246 fiches, et une règle devenue globale       */
/* renommerait tout le site sans que rien ne le dise. D'où le contrôle       */
/* négatif sur les 236 autres fiches, et celui sur la même phrase passée     */
/* sans clé de page.                                                        */
/*                                                                          */
/* MODE TÉMOIN : `--controle` remet les fautes une à une et exige que chaque */
/* contrôle les voie, puis repasse les exclusions légitimes pour exiger      */
/* qu'il NE les voie PAS. Une porte qui ne sait pas échouer ne protège rien. */
/* ======================================================================== */

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const FICHES = join(RACINE, "supabase/import/gabarits-maquette");
const RENDU = join(RACINE, "maquette/rendu");

/** Les dix pages, dans les trois écritures de leur identité. */
const PORTEE: { fiche: string; capture: string; url: string }[] = [
  { fiche: "offres-bureau-etudes.json", capture: "offres--bureau-etudes.html", url: "/offres/bureau-etudes/" },
  { fiche: "bureau-etudes.json", capture: "bureau-etudes.html", url: "/bureau-etudes/" },
  { fiche: "bureau-etudes-bureau-etude-electrique.json", capture: "bureau-etudes--bureau-etude-electrique.html", url: "/bureau-etudes/bureau-etude-electrique/" },
  { fiche: "bureau-etudes-bureau-etude-electronique.json", capture: "bureau-etudes--bureau-etude-electronique.html", url: "/bureau-etudes/bureau-etude-electronique/" },
  { fiche: "bureau-etudes-mise-en-conformite-machine.json", capture: "bureau-etudes--mise-en-conformite-machine.html", url: "/bureau-etudes/mise-en-conformite-machine/" },
  { fiche: "travaux-industriels.json", capture: "travaux-industriels.html", url: "/travaux-industriels/" },
  { fiche: "travaux-industriels-demantelement-industriel.json", capture: "travaux-industriels--demantelement-industriel.html", url: "/travaux-industriels/demantelement-industriel/" },
  { fiche: "travaux-industriels-levage-manutention.json", capture: "travaux-industriels--levage-manutention.html", url: "/travaux-industriels/levage-manutention/" },
  { fiche: "travaux-industriels-montage-industriel.json", capture: "travaux-industriels--montage-industriel.html", url: "/travaux-industriels/montage-industriel/" },
  { fiche: "travaux-industriels-transfert-industriel.json", capture: "travaux-industriels--transfert-industriel.html", url: "/travaux-industriels/transfert-industriel/" },
];

const EXPERT = /experts? techniques?/i;
/* L'élision manquée, la faute que le renommage d'Orthus a déjà coûtée une fois. */
const ELISION_RATEE = /\bde experts? techniques?/i;

/* 1. LES TROIS ÉCRITURES DONNENT LA MÊME CLÉ, sans quoi une porte passerait
      le chemin de sa capture et n'obtiendrait aucune règle, silencieusement. */
for (const { fiche, capture, url } of PORTEE) {
  const attendue = clePage(url);
  assert.equal(clePage(fiche), attendue, `clePage : la fiche ${fiche} ne donne pas la clé de ${url}`);
  assert.equal(clePage(capture), attendue, `clePage : la capture ${capture} ne donne pas la clé de ${url}`);
  assert.equal(clePage(join(RENDU, capture)), attendue, `clePage : le chemin de ${capture} ne donne pas la clé de ${url}`);
}

/* 2. LES RÉÉCRITURES, phrase par phrase, relevées dans les fiches et dans les
      captures du 12/10. Chacune porte la page pour laquelle elle vaut. */
const EXPERT_CHANGE: [string, string, string][] = [
  ["Des techniciens retenus · entretien technique et entretien comportemental, résultats partagés avec vous.", "Des experts techniques retenus · entretien technique et entretien comportemental, résultats partagés avec vous.", "/travaux-industriels/"],
  ["10 % des techniciens retenus", "10 % des experts techniques retenus", "/offres/bureau-etudes/"],
  ["Seuls 10 % des techniciens sont retenus.", "Seuls 10 % des experts techniques sont retenus.", "/travaux-industriels/levage-manutention/"],
  ["seuls 10 % des techniciens passent cette sélection.", "seuls 10 % des experts techniques passent cette sélection.", "/travaux-industriels/"],
  ["Qui sont les techniciens qui interviennent ?", "Qui sont les experts techniques qui interviennent ?", "/travaux-industriels/montage-industriel/"],
  ["Collaborateurs · techniciens salariés Migen, pas de chaîne d'intermédiaires.", "Collaborateurs · experts techniques salariés Migen, pas de chaîne d'intermédiaires.", "/travaux-industriels/"],
  ["chaque technicien qui touche à vos protections", "chaque expert technique qui touche à vos protections", "/bureau-etudes/mise-en-conformite-machine/"],
  ["Un ingénieur ou un technicien confirmé examine chaque équipement", "Un ingénieur ou un expert technique confirmé examine chaque équipement", "/bureau-etudes/mise-en-conformite-machine/"],
  ["Techniciens et ingénieurs salariés, l'audit et les travaux", "Experts techniques et ingénieurs salariés, l'audit et les travaux", "/bureau-etudes/mise-en-conformite-machine/"],
  ["techniciens et ingénieurs salariés Migen, pas de chaîne", "experts techniques et ingénieurs salariés Migen, pas de chaîne", "/bureau-etudes/bureau-etude-electronique/"],
  ["Des techniciens et des ingénieurs salariés Migen, évalués", "Des experts techniques et des ingénieurs salariés Migen, évalués", "/bureau-etudes/bureau-etude-electronique/"],
  ["travaux exécutés par nos techniciens", "travaux exécutés par nos experts techniques", "/bureau-etudes/mise-en-conformite-machine/"],
  ["Chaudronnerie et soudure par nos propres techniciens", "Chaudronnerie et soudure par nos propres experts techniques", "/travaux-industriels/"],
  ["Nos techniciens exécutent, en coordination avec votre production", "Nos experts techniques exécutent, en coordination avec votre production", "/bureau-etudes/mise-en-conformite-machine/"],
  ["Nos techniciens interviennent sur l'électronique de commande", "Nos experts techniques interviennent sur l'électronique de commande", "/bureau-etudes/bureau-etude-electronique/"],
  ["déplacés par des techniciens qui savent ce qu'ils démontent", "déplacés par des experts techniques qui savent ce qu'ils démontent", "/travaux-industriels/transfert-industriel/"],
  ["adossé à des techniciens qui dépannent de l'électronique", "adossé à des experts techniques qui dépannent de l'électronique", "/bureau-etudes/bureau-etude-electronique/"],
  ["Les habilitations des techniciens affectés à votre chantier", "Les habilitations des experts techniques affectés à votre chantier", "/travaux-industriels/"],
  ["Des techniciens intégrés à votre équipe projet, encadrés par Migen", "Des experts techniques intégrés à votre équipe projet, encadrés par Migen", "/travaux-industriels/montage-industriel/"],
  ["Comme nos techniciens, les membres de l'équipe d'études", "Comme nos experts techniques, les membres de l'équipe d'études", "/bureau-etudes/"],
  /* L'ÉLISION ET LE FRANÇAIS, les deux pièges déjà payés sur le renommage
     d'Orthus : « de techniciens » ne devient pas « de experts techniques ». */
  ["Des équipes complètes de techniciens salariés Migen", "Des équipes complètes d'experts techniques salariés Migen", "/travaux-industriels/"],
  ["nos ingénieurs conçoivent aux côtés de techniciens qui réparent", "nos ingénieurs conçoivent aux côtés d'experts techniques qui réparent", "/offres/bureau-etudes/"],
];

/* 3. CE QUE LA DÉCISION NE TOUCHE PAS, MÊME SUR CES DIX PAGES, et chaque
      ligne dit pourquoi dans le bloc EXPERT_TECHNIQUE de decisions-copie.ts.
      Ces contre-exemples comptent ici autant que les exemples : une règle
      trop large renommerait le réseau, le métier ou la carte du cocon. */
const EXPERT_INTACT: [string, string][] = [
  ["Hubs de techniciens, Paris, Lille, Marseille, Toulouse, Lyon, Metz, Strasbourg, Bordeaux, Dijon, Nantes.", "/offres/bureau-etudes/"],
  ["10 hubs de techniciens", "/bureau-etudes/mise-en-conformite-machine/"],
  ["dix hubs de techniciens à Paris, Lille, Marseille", "/offres/bureau-etudes/"],
  ["des hubs de techniciens dans les grandes villes de France", "/bureau-etudes/bureau-etude-electrique/"],
  ["Le hub de techniciens proche du site de départ", "/travaux-industriels/transfert-industriel/"],
  ["Des techniciens de maintenance qui démontent, lèvent, remontent et rebranchent", "/travaux-industriels/"],
  ["essayé par des techniciens de maintenance.", "/travaux-industriels/"],
  ["Technicien en résidence", "/travaux-industriels/montage-industriel/"],
  ["Des techniciens intégrés à votre équipe, sur votre site.", "/travaux-industriels/levage-manutention/"],
  ["Des techniciens en résidence sur votre site, intégrés à votre équipe, validés par vous.", "/travaux-industriels/"],
  ["Vos meilleurs techniciens détournés de la production.", "/travaux-industriels/montage-industriel/"],
  ["Besoin de monter une ligne sans vider votre atelier de ses techniciens ?", "/travaux-industriels/montage-industriel/"],
  ["La dépendance à un technicien", "/offres/bureau-etudes/"],
  ["Six techniciens multidisciplinaires pour l'installation", "/offres/bureau-etudes/"],
  ["Un technicien électromécanicien mobilisé six mois", "/bureau-etudes/mise-en-conformite-machine/"],
  ["Trois techniciens en maintenance préventive", "/bureau-etudes/bureau-etude-electrique/"],
  ["Nos techniciens interviennent en coordination avec vos équipes de maintenance", "/offres/bureau-etudes/"],
  ["visite des installations, entretiens techniciens et encadrement", "/offres/bureau-etudes/"],
  ["avec un technicien intégré sur site", "/offres/bureau-etudes/"],
  ["Le technicien qui les connaît fait déjà partie de nos équipes.", "/travaux-industriels/levage-manutention/"],
  ["des techniciens réussissent notre double évaluation", "/bureau-etudes/bureau-etude-electrique/"],
  ["vous présente les techniciens adaptés.", "/travaux-industriels/"],
  ["Jours ouvrés · technicien depuis le hub le plus proche · partout en France", "/bureau-etudes/bureau-etude-electronique/"],
  ["Test technicien", "/travaux-industriels/"],
];

/* 4. LA PORTÉE EST CLOSE : la même phrase, sans clé de page ou sur une page
      hors portée, ne bouge pas. C'est ce qui garde les 236 autres fiches et
      toutes les portes existantes à l'identique. */
const HORS_PORTEE = [
  "Des techniciens retenus · entretien technique et entretien comportemental, résultats partagés avec vous.",
  "Seuls 10 % des techniciens sont retenus.",
  "Qui sont les techniciens qui interviennent ?",
  "Collaborateurs · techniciens salariés Migen, pas de chaîne d'intermédiaires.",
  "Des équipes complètes de techniciens salariés Migen",
];

/* --------------------------------- les contrôles, en fonctions nommées, pour
   que le mode témoin puisse les nourrir de données fautives. */

const CITATIONS = new Set(["trous", "phrases_retirees", "retraits"]);

/** Les chaînes de copie d'une fiche : ni notes de portage, ni citations, ni chemins de photo. */
function chainesDe(valeur: unknown, cle = ""): string[] {
  if (typeof valeur === "string") return cle === "photo" ? [] : [valeur];
  if (Array.isArray(valeur)) return valeur.flatMap((v) => chainesDe(v, cle));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) =>
      k.startsWith("_") || CITATIONS.has(k) ? [] : chainesDe(v, k),
    );
  }
  return [];
}

type Lot = { nom: string; chaines: string[] };

/** CÔTÉ DONNÉE : la fiche porte déjà la décision de sa page, et en bon français. */
function verifieDonnee(lots: Lot[]): void {
  for (const { nom, chaines } of lots)
    for (const s of chaines) {
      assert.equal(
        appliqueDecisions(s, nom),
        s,
        `${nom} : la décision du 12/10 n'est pas portée par « ${s.slice(0, 140)} »`,
      );
      assert.ok(!ELISION_RATEE.test(s), `${nom} : élision manquée dans « ${s.slice(0, 140)} »`);
    }
}

/** CÔTÉ CAPTURE : la décision s'y applique, et seulement avec la clé de la page. */
function verifieCapture(lots: { nom: string; html: string }[]): void {
  for (const { nom, html } of lots) {
    const decidee = appliqueDecisions(html, nom);
    assert.ok(EXPERT.test(decidee), `${nom} : la capture décidée ne porte aucun « expert technique »`);
    assert.ok(!ELISION_RATEE.test(decidee), `${nom} : élision manquée dans la capture décidée`);
    assert.equal(appliqueDecisions(decidee, nom), decidee, `${nom} : la décision n'est pas idempotente sur la capture`);
    assert.ok(!EXPERT.test(appliqueDecisions(html)), `${nom} : la décision fuit hors de sa portée nommée`);
  }
}

/** LA DÉCISION NE FUIT PAS : aucune autre fiche ne dit « expert technique ». */
function verifieHorsPortee(lots: Lot[]): void {
  for (const { nom, chaines } of lots)
    for (const s of chaines)
      assert.ok(
        !EXPERT.test(s),
        `${nom} est hors portée et porte pourtant « expert technique » : « ${s.slice(0, 140)} »`,
      );
}

const lotsPortee: Lot[] = PORTEE.map(({ fiche }) => ({
  nom: fiche,
  chaines: chainesDe(JSON.parse(readFileSync(join(FICHES, fiche), "utf8"))),
}));
const lotsCaptures = PORTEE.map(({ capture }) => ({
  nom: capture,
  html: readFileSync(join(RENDU, capture), "utf8"),
}));
const nomsPortee = new Set(PORTEE.map(({ fiche }) => fiche));
const lotsAutres: Lot[] = readdirSync(FICHES)
  .filter((n) => n.endsWith(".json") && !nomsPortee.has(n))
  .map((nom) => ({ nom, chaines: chainesDe(JSON.parse(readFileSync(join(FICHES, nom), "utf8"))) }));

for (const [avant, apres, url] of EXPERT_CHANGE)
  assert.equal(appliqueDecisions(avant, url), apres, `« expert technique » sur ${url} : « ${avant} »`);
for (const [texte, url] of EXPERT_INTACT)
  assert.equal(appliqueDecisions(texte, url), texte, `laissé intact sur ${url} : « ${texte} »`);
for (const texte of HORS_PORTEE) {
  assert.equal(appliqueDecisions(texte), texte, `sans clé de page, rien ne change : « ${texte} »`);
  assert.equal(appliqueDecisions(texte, "offres-zero-arret.json"), texte, `hors portée, rien ne change : « ${texte} »`);
  assert.equal(appliqueDecisions(texte, "/offres/residence/"), texte, `hors portée, rien ne change : « ${texte} »`);
}
verifieDonnee(lotsPortee);
verifieCapture(lotsCaptures);
verifieHorsPortee(lotsAutres);

const chainesPortee = lotsPortee.reduce((n, l) => n + l.chaines.length, 0);
console.log(
  `« expert technique » : ${PORTEE.length} pages dans la portée, ${EXPERT_CHANGE.length} réécritures, ` +
    `${EXPERT_INTACT.length} exclusions tenues, ${HORS_PORTEE.length * 3} refus hors portée, ` +
    `${chainesPortee} chaînes de fiche et ${lotsCaptures.length} captures vérifiées des deux côtés, ` +
    `${lotsAutres.length} autres fiches indemnes.`,
);

/* ------------------------------------------------------- le mode témoin */

if (process.argv.includes("--controle")) {
  let vues = 0;
  let manques = 0;
  const doitEchouer = (quoi: string, fautif: () => void) => {
    try {
      fautif();
    } catch {
      vues += 1;
      console.log(`  vue        : ${quoi}`);
      return;
    }
    manques += 1;
    console.error(`  MANQUÉE    : ${quoi}`);
  };
  const doitPasser = (quoi: string, licite: () => void) => {
    try {
      licite();
      console.log(`  acceptée   : ${quoi}`);
    } catch (e) {
      manques += 1;
      console.error(`  FAUX DÉFAUT : ${quoi} (${(e as Error).message})`);
    }
  };

  console.log("\ntémoin : les fautes remises une à une");
  doitEchouer("une fiche de la portée revenue à « Des techniciens retenus »", () =>
    verifieDonnee([
      { nom: "travaux-industriels.json", chaines: ["Des techniciens retenus · entretien technique et entretien comportemental, résultats partagés avec vous."] },
    ]),
  );
  doitEchouer("une fiche de la portée revenue à « Seuls 10 % des techniciens sont retenus »", () =>
    verifieDonnee([{ nom: "travaux-industriels-levage-manutention.json", chaines: ["Seuls 10 % des techniciens sont retenus."] }]),
  );
  doitEchouer("une fiche de la portée revenue à « Qui sont les techniciens qui interviennent ? »", () =>
    verifieDonnee([{ nom: "travaux-industriels-montage-industriel.json", chaines: ["Qui sont les techniciens qui interviennent ?"] }]),
  );
  doitEchouer("l'élision manquée, « de experts techniques salariés Migen »", () =>
    verifieDonnee([{ nom: "travaux-industriels.json", chaines: ["Des équipes complètes de experts techniques salariés Migen"] }]),
  );
  doitEchouer("une capture dont plus rien ne déclenche la décision", () =>
    verifieCapture([{ nom: "travaux-industriels.html", html: "<p>Des salariés Migen, évalués en entretien.</p>" }]),
  );
  doitEchouer("une page hors portée qui porterait « experts techniques »", () =>
    verifieHorsPortee([{ nom: "offres-zero-arret.json", chaines: ["Des experts techniques retenus · entretien technique."] }]),
  );
  doitEchouer("la portée élargie par erreur à une page qui n'en fait pas partie", () =>
    assert.equal(
      appliqueDecisions("Des techniciens retenus · entretien technique.", "offres-zero-arret.json"),
      "Des experts techniques retenus · entretien technique.",
    ),
  );

  console.log("\ntémoin : les exclusions légitimes, qui ne doivent PAS être vues");
  doitPasser("le réseau, « Hubs de techniciens, Paris »", () =>
    verifieDonnee([{ nom: "travaux-industriels.json", chaines: ["Hubs de techniciens, Paris, Lille, Marseille."] }]),
  );
  doitPasser("le métier, « Des techniciens de maintenance qui démontent »", () =>
    verifieDonnee([{ nom: "travaux-industriels.json", chaines: ["Des techniciens de maintenance qui démontent, lèvent, remontent."] }]),
  );
  doitPasser("la carte du cocon, « Technicien en résidence »", () =>
    verifieDonnee([{ nom: "travaux-industriels-montage-industriel.json", chaines: ["Technicien en résidence", "Des techniciens intégrés à votre équipe, sur votre site."] }]),
  );
  doitPasser("les techniciens du client, « Vos meilleurs techniciens détournés »", () =>
    verifieDonnee([{ nom: "travaux-industriels-montage-industriel.json", chaines: ["Vos meilleurs techniciens détournés de la production."] }]),
  );
  doitPasser("une page hors portée qui garde « techniciens »", () =>
    verifieHorsPortee([{ nom: "offres-zero-arret.json", chaines: ["Des techniciens retenus · entretien technique."] }]),
  );

  console.log(`\ntémoin : ${vues} fautes vues, ${manques} manquées.`);
  if (manques > 0) {
    console.error("la porte ne sait pas échouer sur tout ce qu'elle prétend tenir.");
    process.exit(1);
  }
}
