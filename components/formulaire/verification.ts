/**
 * Contrôle du formulaire et de l'attribution, sans navigateur ni serveur.
 *
 *   bun components/formulaire/verification.ts
 *
 * Volontairement sans cadre de test : les règles tiennent dans des assertions,
 * et une règle de validation qui se relâche doit faire échouer quelque chose.
 * Ce module n'est importé par aucun autre, il ne tourne jamais en production.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  attributionCourante,
  memoriseAttribution,
  attributionNettoyee,
  utmDepuisRequete,
} from "@/lib/utm";
import { brancheConversion, debrancheConversion, signaleConversion } from "./conversion";
import {
  DEPOTS_MAX_PAR_FENETRE,
  FENETRE_MS,
  empreinteIp,
  tropDeDepots,
} from "./debit";
import {
  DERNIERE_ETAPE,
  ETAPES,
  erreursDeLEtape,
  premiereEtapeEnErreur,
  premiereEtapeIncomplete,
} from "./etapes";
import {
  CHAMP_ETABLISSEMENT,
  CHAMP_PIEGE,
  CHAMPS_CONTACT,
  chargeUtile,
  CONTACT_VIDE,
  INDICATIFS,
  numeroComplet,
  OPTIONNELS,
  valideCharge,
  valideContact,
  type ChampContact,
} from "./validation";

const correct = {
  entreprise: "Fonderie de démonstration",
  prenom: "Camille",
  nom: "Rivière",
  email: "camille.riviere@exemple.fr",
  indicatif: "+33",
  telephone: "04 72 00 00 00",
  message: "Arrêt de ligne de conditionnement, besoin d'un électromécanicien.",
};

// Un contact complet passe.
assert.deepEqual(valideContact(correct), {});

// Chaque champ obligatoire vide produit une erreur, et une seule. Le message en
// fait partie depuis le portage de la maquette, qui le marque `required`.
for (const champ of [
  "entreprise",
  "prenom",
  "nom",
  "email",
  "telephone",
  "message",
] as const) {
  const erreurs = valideContact({ ...correct, [champ]: "   " });
  assert.deepEqual(Object.keys(erreurs), [champ], `champ obligatoire : ${champ}`);
}

// Le formulaire vide signale les six champs à remplir, pas le premier. L'indicatif
// n'en fait pas partie : il arrive prérempli sur « +33 », comme dans la maquette.
assert.equal(Object.keys(valideContact(CONTACT_VIDE)).length, 6);
assert.ok(!valideContact(CONTACT_VIDE).indicatif, "l'indicatif par défaut est valide");

// L'indicatif est une liste fermée : hors liste, il est refusé, et il n'est
// surtout pas concaténé au numéro pour partir dans HubSpot.
for (const faux of ["+99", "+3", "33", "", "+33;rm", "33+"]) {
  assert.ok(
    valideContact({ ...correct, indicatif: faux }).indicatif,
    `indicatif refusé : ${JSON.stringify(faux)}`,
  );
}
for (const { code } of INDICATIFS) {
  assert.ok(!valideContact({ ...correct, indicatif: code }).indicatif, `indicatif accepté : ${code}`);
}
// Un espace parasite autour d'un code connu est toléré, pas refusé : c'est le
// numéro COMPOSÉ qui doit être propre, et `numeroComplet` s'en charge.
assert.ok(!valideContact({ ...correct, indicatif: " +33 " }).indicatif);
assert.equal(numeroComplet({ ...correct, indicatif: " +33 ", telephone: " 04 72 00 00 00 " }), "+33 04 72 00 00 00");
assert.equal(numeroComplet({ ...correct, indicatif: "+971", telephone: "50 123 4567" }), "+971 50 123 4567");

// Formats refusés.
assert.ok(valideContact({ ...correct, email: "camille.riviere" }).email);
assert.ok(valideContact({ ...correct, telephone: "04 72" }).telephone);
assert.ok(valideContact({ ...correct, entreprise: "x".repeat(121) }).entreprise);

// Une charge utile sans rien ne passe pas, et le type de formulaire est exigé.
assert.ok(valideCharge(null).erreurs.formulaire);
assert.ok(valideCharge({ ...correct }).erreurs.formulaire);
assert.ok(valideCharge({ ...correct, formulaire: "Contact Général" }).erreurs.formulaire);
assert.deepEqual(valideCharge({ ...correct, formulaire: "contact" }).erreurs, {});

// L'IDENTIFIANT DE CHAQUE PAGE DOIT PASSER, et c'est le défaut du 14/10 : la
// règle plafonnait à 40 caractères, or `app/[...slug]/page.tsx` le fabrique
// depuis l'adresse (`cocon` + chemin, plus `-hero` pour le panneau du haut).
// 74 pages sur 158 dépassaient : leur formulaire répondait 422 « Quelques champs
// demandent une correction » sans qu'aucun champ visible soit en faute, et
// aucun lead n'en partait. On rejoue ici chaque adresse de l'index du client.
// Lu à l'exécution, pas importé : `maquette/` n'est pas envoyé à Vercel, et un
// import y faisait échouer la vérification des types du build (14/10).
const INDEX_PAGES: { url: string }[] = JSON.parse(
  readFileSync(new URL("../../maquette/contenu/site/index.json", import.meta.url), "utf8"),
);
for (const { url } of INDEX_PAGES) {
  for (const id of [`cocon${url.replace(/\//g, "-")}`, `cocon${url.replace(/\//g, "-")}-hero`]) {
    assert.deepEqual(
      valideCharge({ ...correct, formulaire: id }).erreurs,
      {},
      `formulaire refusé sur ${url} : ${id} (${id.length} caractères)`,
    );
  }
}
// LA CHARGE QUE LE NAVIGATEUR ENVOIE VRAIMENT, et c'est le défaut du 14/10.
// Depuis le 12/10, le formulaire posait la fiche du registre sous la clé
// `entreprise`, celle du nom tapé : la fiche écrasait le nom, le serveur
// lisait `{}` à la place d'une chaîne, et CHAQUE demande partait en 422.
// Les essais passaient par le portail HubSpot directement, jamais par cette
// charge : c'est elle qu'on rejoue ici, telle que `envoie` la fabrique.
const fiche = { siren: "552100554", siret: "55210055400013", code_naf: "29.10Z" };
for (const etablissement of [{}, fiche]) {
  const envoyee = JSON.parse(
    JSON.stringify(
      chargeUtile({
        contact: correct,
        formulaire: "cocon-expertises-automatisme--hero",
        piege: "",
        etablissement,
        attribution: { page_entree: "/" },
        page: { url: "https://migen.fr/", titre: "Migen" },
      }),
    ),
  ) as Record<string, unknown>;
  assert.deepEqual(valideCharge(envoyee).erreurs, {}, "la charge du navigateur est refusée par le serveur");
  assert.equal(valideCharge(envoyee).contact.entreprise, correct.entreprise, "le nom d'entreprise tapé est perdu");
  assert.deepEqual(envoyee[CHAMP_ETABLISSEMENT], etablissement, "la fiche du registre est perdue");
}

// Le plafond reste un plafond : un identifiant démesuré est toujours refusé.
assert.ok(valideCharge({ ...correct, formulaire: "a".repeat(121) }).erreurs.formulaire);

// Un champ d'un autre type qu'une chaîne vaut absent, il ne passe pas en force.
assert.ok(valideCharge({ ...correct, email: 42, formulaire: "contact" }).erreurs.email);

// La charge utile ne peut pas glisser de champ supplémentaire dans le contact.
const charge = valideCharge({ ...correct, formulaire: "contact", admin: "oui" });
assert.deepEqual(Object.keys(charge.contact).sort(), [
  "email",
  "entreprise",
  "indicatif",
  "message",
  "nom",
  "prenom",
  "telephone",
]);

// Les cinq UTM sont lus, le reste de la requête est ignoré.
assert.deepEqual(
  utmDepuisRequete("?utm_source=google&utm_medium=cpc&gclid=xyz&utm_term=&page=2"),
  { utm_source: "google", utm_medium: "cpc" },
);

// Une attribution reçue est réduite aux clés connues et bornée en longueur.
const nettoyee = attributionNettoyee({
  utm_source: " linkedin ",
  utm_campaign: "c".repeat(400),
  page_entree: "/maintenance-industrielle/",
  visitor_email: "fuite@exemple.fr",
});
assert.deepEqual(Object.keys(nettoyee).sort(), [
  "page_entree",
  "utm_campaign",
  "utm_source",
]);
assert.equal(nettoyee.utm_source, "linkedin");
assert.equal(nettoyee.utm_campaign?.length, 200);

// Sans consentement publicitaire, le signal de conversion ne fait rien.
let recues = 0;
signaleConversion({ formulaire: "contact", page: "/" });
assert.equal(recues, 0, "aucune conversion envoyée avant branchement");

brancheConversion(() => {
  recues += 1;
});
signaleConversion({ formulaire: "contact", page: "/" });
assert.equal(recues, 1);

debrancheConversion();
signaleConversion({ formulaire: "contact", page: "/" });
assert.equal(recues, 1, "le retrait du consentement coupe bien le signal");

// Chaque conversion publie « generate_lead » dans le dataLayer, que le
// conteneur Tag Manager lit (il ne se charge qu'après consentement).
{
  const globale = globalThis as unknown as { window?: unknown; dataLayer?: unknown[] };
  globale.window = globalThis;
  signaleConversion({ formulaire: "contact", page: "/x/" });
  assert.deepEqual(globale.dataLayer?.at(-1), { event: "generate_lead", formulaire: "contact", page: "/x/" }, "la conversion n'arrive pas au dataLayer");
  delete globale.window;
}

// Le champ piège n'est pas un champ du contact : une charge utile qui le porte
// reste valide pour la validation, c'est la route qui la jette en silence.
const avecPiege = valideCharge({
  ...correct,
  formulaire: "contact",
  [CHAMP_PIEGE]: "https://robot.exemple",
});
assert.deepEqual(avecPiege.erreurs, {});
assert.ok(!(CHAMP_PIEGE in avecPiege.contact), "le piège n'entre pas dans le contact");

// Empreinte d'IP : le dernier octet d'une IPv4 et la fin d'une IPv6 disparaissent.
assert.equal(
  empreinteIp(new Headers({ "x-forwarded-for": "82.65.14.231, 10.0.0.1" })),
  "82.65.14.0/24",
);
assert.equal(
  empreinteIp(new Headers({ "x-forwarded-for": "2a01:cb00:1234:5678:9abc:def0:1:2" })),
  "2a01:cb00:1234:5678::/64",
);
assert.equal(empreinteIp(new Headers()), "sans-adresse");
assert.equal(empreinteIp(new Headers({ "x-forwarded-for": "pas-une-ip" })), "sans-adresse");

// Fenêtre glissante : le quota est atteint au dépôt suivant le dernier autorisé.
const t0 = 1_700_000_000_000;
for (let n = 0; n < DEPOTS_MAX_PAR_FENETRE; n += 1) {
  assert.equal(tropDeDepots("essai.fenetre", t0 + n), false, `dépôt ${n + 1} autorisé`);
}
assert.equal(tropDeDepots("essai.fenetre", t0 + DEPOTS_MAX_PAR_FENETRE), true);

// Une autre empreinte n'est pas pénalisée par la première.
assert.equal(tropDeDepots("essai.voisin", t0), false);

// Et la fenêtre glisse vraiment : passé le délai, le quota se reconstitue.
assert.equal(tropDeDepots("essai.fenetre", t0 + FENETRE_MS + 1), false);

// Persistance de l'attribution : interdite sans consentement publicitaire.
//
// `document` n'existe pas dans ce contexte, donc aucun choix n'est lisible, donc
// la finalité publicitaire n'est pas accordée : rien ne doit entrer dans le
// stockage. L'attribution doit malgré tout rester utilisable, en mémoire vive,
// sinon le formulaire perdrait son attribution pour tout le monde.
//
// Un seul cas est vérifié ici, et c'est volontaire : `memoriseAttribution` ne
// s'exécute qu'une fois par document, donc une fois par processus. Vérifier le
// cas consenti demanderait soit un sous-processus, soit une remise à zéro
// ajoutée au module de production pour les seuls besoins du contrôle. Le cas
// qui protège le visiteur est celui-ci.
const ecrituresStockage: string[] = [];
Object.defineProperty(globalThis, "sessionStorage", {
  value: {
    getItem: (): string | null => null,
    setItem: (_cle: string, valeur: string): void => {
      ecrituresStockage.push(valeur);
    },
  },
  writable: true,
});

memoriseAttribution({ search: "?utm_source=google", pathname: "/" });
assert.deepEqual(ecrituresStockage, [], "aucune écriture dans le stockage sans consentement");
assert.equal(
  attributionCourante("/contact/").utm_source,
  "google",
  "l'attribution reste utilisable en mémoire vive",
);
assert.equal(attributionCourante("/contact/").page_entree, "/");

// LE FORMULAIRE EN TROIS ÉTAPES, SUR TÉLÉPHONE (./etapes.ts, décision du 14/10).
// La répartition doit porter chaque champ du contact une fois et une seule :
// un champ obligatoire oublié par les étapes ne serait jamais validé avant
// l'envoi, ni montré à corriger. Écrite en fonction pour la voir échouer.
function defautsDeRepartition(etapes: readonly (readonly ChampContact[])[]): string[] {
  const vus = etapes.flat();
  return CHAMPS_CONTACT.flatMap((champ) => {
    const fois = vus.filter((vu) => vu === champ).length;
    return fois === 1 ? [] : [`${champ} : ${fois} étape(s)`];
  });
}
assert.deepEqual(defautsDeRepartition(ETAPES), [], "répartition des champs par étape");
// Les six champs obligatoires sont bien parmi eux.
assert.equal(CHAMPS_CONTACT.filter((c) => c !== "indicatif" && !OPTIONNELS.has(c)).length, 6);
// Témoins : une étape qui perd le message, une qui double le courriel.
assert.deepEqual(defautsDeRepartition([ETAPES[0], ETAPES[1]]), ["message : 0 étape(s)"]);
assert.deepEqual(defautsDeRepartition([...ETAPES, ["email"]]), ["email : 2 étape(s)"]);

// L'ordre voulu : l'étape 1 est le « Être rappelé » de la maquette (entreprise
// et téléphone), puis l'identité, puis le message et l'envoi.
assert.deepEqual(ETAPES, [["entreprise", "indicatif", "telephone"], ["nom", "prenom", "email"], ["message"]]);
assert.equal(DERNIERE_ETAPE, 2);

// Chaque étape ne juge QUE ses champs : formulaire vide, chaque étape réclame
// les siens et rien d'autre, et la réunion des trois est la validation entière.
function verifieFiltre(filtre: typeof erreursDeLEtape) {
  const parEtape = ETAPES.map((_, n) => Object.keys(filtre(CONTACT_VIDE, n)).sort());
  assert.deepEqual(parEtape, [["entreprise", "telephone"], ["email", "nom", "prenom"], ["message"]]);
  assert.deepEqual(parEtape.flat().sort(), Object.keys(valideContact(CONTACT_VIDE)).sort());
}
verifieFiltre(erreursDeLEtape);
// Témoin : un filtre qui laisse tout passer réclamerait le message dès l'étape 1.
assert.throws(() => verifieFiltre((contact) => valideContact(contact)));
for (const n of ETAPES.keys()) assert.deepEqual(erreursDeLEtape(correct, n), {}, `étape ${n + 1} correcte`);
// Un courriel faux n'arrête pas l'étape 1, il arrête l'étape 2.
const courrielFaux = { ...correct, email: "camille.riviere" };
assert.deepEqual(erreursDeLEtape(courrielFaux, 0), {});
assert.deepEqual(Object.keys(erreursDeLEtape(courrielFaux, 1)), ["email"]);
// Un indicatif hors liste ramène à l'étape du téléphone.
assert.deepEqual(Object.keys(erreursDeLEtape({ ...correct, indicatif: "+99" }, 0)), ["indicatif"]);

// Une erreur (du navigateur ou du serveur) ramène à la première étape fautive.
assert.equal(premiereEtapeEnErreur({}), null);
assert.equal(premiereEtapeEnErreur({ message: "x" }), 2);
assert.equal(premiereEtapeEnErreur({ email: "x", message: "x" }), 1);
assert.equal(premiereEtapeEnErreur({ telephone: "x", nom: "x" }), 0);
assert.equal(premiereEtapeEnErreur({ formulaire: "x" }), null, "une erreur hors champ ne déplace pas");

// Le préremplissage du panneau court amène à la première étape incomplète.
assert.equal(premiereEtapeIncomplete(CONTACT_VIDE), 0);
assert.equal(premiereEtapeIncomplete({ ...CONTACT_VIDE, telephone: "04 72 00 00 00" }), 0);
assert.equal(
  premiereEtapeIncomplete({ ...CONTACT_VIDE, entreprise: "Fonderie", telephone: "04 72 00 00 00", email: "a@b.fr" }),
  1,
);
assert.equal(premiereEtapeIncomplete({ ...correct, message: "  " }), 2);
assert.equal(premiereEtapeIncomplete(correct), DERNIERE_ETAPE, "rien ne manque : l'étape de l'envoi");

console.log("Formulaire, attribution et garde-fous : toutes les assertions passent.");
