/**
 * L'envoi des landing pages, rejoué contre la VRAIE route `/api/lead`, avec
 * HubSpot et Supabase remplacés par des doublures.
 *
 *   bun run verifie:lead-lp
 *
 * qui lance `bun --no-env-file --conditions=react-server` sur ce fichier :
 *   · `--no-env-file` : `.env.local` n'est jamais chargé, aucune vraie clé
 *     n'existe dans le processus ;
 *   · `--conditions=react-server` : `server-only` s'y résout en module vide,
 *     comme dans Next, et la route s'importe telle quelle.
 *
 * TOUTE requête sortante passe par la doublure de `fetch`, posée avant
 * l'import de la route. Elle ne touche jamais le réseau et refuse toute
 * adresse qu'elle ne connaît pas : aucun envoi réel n'est possible ici.
 *
 * CE QU'ELLE TIENT : une LP envoie la charge du site (`chargeUtile`) et la
 * route la dépose dans LE formulaire HubSpot du site (`HUBSPOT_FORM_ID`),
 * avec les champs du formulaire du site, le pays de l'indicatif (`country`,
 * le champ caché de la V3) et l'attribution telle que le site la transmet,
 * sans rien de l'ancien formulaire « variante C » ; les protections
 * (validation, débit, taille, origine, piège) refusent avant tout envoi ; la
 * table `leads` ne reçoit aucune donnée nominative.
 *
 * CE QU'ELLE NE TIENT PAS : ce que HubSpot GARDE de l'envoi. Relevé dans le
 * portail le 16/10, `formulaire_migen`, `utm_*` et `page_entree` n'y existent
 * pas comme propriétés : HubSpot les reçoit et les ignore. Seuls l'identité,
 * le pays et l'adresse de la page (`pageUri`) y arrivent.
 */
import assert from "node:assert/strict";

import { NextRequest } from "next/server";

import { chargeUtile, type Contact } from "@/components/formulaire/validation";
import { VERSION_BANDEAU, choixUniforme } from "@/lib/consentement";

import { formulaireLp, numeroE164, paysDeLIndicatif, prerempliDe, urlCalendly } from "./lead-lp";

const HUBSPOT = "https://api.hsforms.com/submissions/v3/integration/submit/148000737/";
const SUPABASE = "https://doublure.supabase.invalid";
const FORMULAIRE_SITE = "formulaire-du-site-doublure";
/** L'ancien formulaire « variante C » des LP : plus rien ne doit y partir. */
const FORMULAIRE_C = "00bc3a3e-d900-40fe-8995-1e5ff2b684eb";

process.env.HUBSPOT_FORM_ID = FORMULAIRE_SITE;
// L'ancienne variable de l'aiguillage des LP, posée exprès : la route doit l'ignorer.
process.env.HUBSPOT_FORM_ID_LP = "formulaire-c-doublure";
process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE;
process.env.SUPABASE_SERVICE_ROLE_KEY = "cle-doublure";

/* ------------------------------------------------------------- doublures */

interface Appel {
  url: string;
  corps: unknown;
}

let appels: Appel[] = [];
/** Les statuts que la doublure HubSpot rendra, dans l'ordre ; 200 ensuite. */
let statutsHubspot: number[] = [];

globalThis.fetch = (async (entree: RequestInfo | URL, init?: RequestInit) => {
  const url = entree instanceof Request ? entree.url : String(entree);
  const brut = init?.body ?? null;
  appels.push({ url, corps: typeof brut === "string" ? JSON.parse(brut) : brut });
  if (url.startsWith(HUBSPOT)) {
    const statut = statutsHubspot.shift() ?? 200;
    return new Response(statut === 200 ? "{}" : '{"errors":[{"message":"doublure"}]}', { status: statut });
  }
  if (url.startsWith(`${SUPABASE}/rest/v1/leads`)) return new Response(null, { status: 201 });
  throw new Error(`doublure : requête inattendue vers ${url}`);
}) as typeof fetch;

const { POST } = await import("@/app/api/lead/route");

/* ---------------------------------------------------------------- outils */

const CONTACT: Contact = {
  entreprise: "Fonderie de démonstration",
  prenom: "Camille",
  nom: "Rivière",
  email: "camille.riviere@exemple.fr",
  indicatif: "+33",
  telephone: "04 72 00 00 00",
  message: "Arrêt de ligne, besoin d'un électromécanicien.",
};

const PAGE = "/lp/maintenance-industrielle-lyon/";
const FORMULAIRE = formulaireLp(PAGE, "heros");
const URL_PAGE = `https://migen.fr${PAGE}?utm_source=google&gclid=Cj0doublure_BwE`;

/** Exactement ce que FormulaireLP poste : la charge du site, rien de plus. */
function chargeLp(modifs: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...chargeUtile({
      contact: CONTACT,
      formulaire: FORMULAIRE,
      piege: "",
      etablissement: { country: paysDeLIndicatif(CONTACT.indicatif) },
      attribution: {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "lyon",
        page_entree: PAGE,
        page_conversion: PAGE,
      },
      page: { url: URL_PAGE, titre: "LP Lyon" },
    }),
    ...modifs,
  };
}

const COOKIE_PUBLICITE = `migen_consentement=${encodeURIComponent(
  JSON.stringify({ version: VERSION_BANDEAU, visiteur: "doublure-0001", choix: choixUniforme(true), le: new Date().toISOString() }),
)}`;

let reseau = 0;
/** Chaque envoi vient d'un /24 différent, sauf demande : le plafond de débit ne s'en mêle pas. */
async function poste(charge: unknown, entetes: Record<string, string> = {}) {
  reseau += 1;
  appels = [];
  const reponse = await POST(
    new NextRequest("http://localhost/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.${reseau}.7`, ...entetes },
      body: typeof charge === "string" ? charge : JSON.stringify(charge),
    }),
  );
  return { statut: reponse.status, json: (await reponse.json()) as { erreurs?: Record<string, string> } };
}

type Champ = { name: string; value: string; objectTypeId?: string };
const envoisHubspot = () => appels.filter((a) => a.url.startsWith(HUBSPOT));
const copiesLeads = () => appels.filter((a) => a.url.startsWith(`${SUPABASE}/rest/v1/leads`));
const champsDe = (appel: Appel) => (appel.corps as { fields: Champ[] }).fields;
const nomsDe = (appel: Appel) => champsDe(appel).map((c) => (c.objectTypeId ? `${c.objectTypeId}/${c.name}` : c.name)).sort();
const valeurDe = (appel: Appel, nom: string) => champsDe(appel).find((c) => c.name === nom)?.value;
const contexteDe = (appel: Appel) => (appel.corps as { context: { pageUri?: string; pageName?: string } }).context;

/** Les champs du formulaire HubSpot du site, identité comprise, sans consentement publicitaire. */
const CHAMPS_DU_SITE = ["0-2/name", "email", "firstname", "formulaire_migen", "lastname", "message", "phone"];
/** Et ceux d'une LP : le pays de l'indicatif en plus, comme le champ caché `country` de la V3. */
const CHAMPS_LP = [...CHAMPS_DU_SITE, "country"];
/** Et ceux que la finalité publicitaire y ajoute : l'attribution de `lib/utm.ts`. */
const CHAMPS_DE_CAMPAGNE = ["page_entree", "utm_campaign", "utm_medium", "utm_source"];

/** Ce qui ne va pas dans l'envoi d'une LP à HubSpot ; vide quand il est celui du site. */
function defautsEnvoi(appel: Appel | undefined, attendus: readonly string[]): string[] {
  if (!appel) return ["aucun envoi HubSpot"];
  const defauts: string[] = [];
  if (appel.url !== `${HUBSPOT}${FORMULAIRE_SITE}`) defauts.push(`envoyé à ${appel.url.slice(HUBSPOT.length)}, pas au formulaire du site`);
  const noms = nomsDe(appel);
  const voulus = [...attendus].sort();
  if (noms.join() !== voulus.join()) defauts.push(`champs ${noms.join(", ")} au lieu de ${voulus.join(", ")}`);
  if (valeurDe(appel, "formulaire_migen") !== FORMULAIRE) defauts.push("formulaire_migen ne nomme pas la LP");
  return defauts;
}

/** La ligne écrite dans `leads` ne porte aucune identité (règle du projet, lib/leads.ts). */
function sansIdentite(ligne: unknown): void {
  const texte = JSON.stringify(ligne);
  for (const cle of ["entreprise", "prenom", "nom", "email", "telephone", "message", "firstname", "lastname", "phone"]) {
    assert.ok(!(cle in (ligne as Record<string, unknown>)), `colonne nominative « ${cle} » dans leads`);
  }
  for (const valeur of [CONTACT.prenom, CONTACT.nom, CONTACT.email, CONTACT.telephone, CONTACT.entreprise]) {
    assert.ok(!texte.includes(valeur), `donnée nominative « ${valeur} » dans leads`);
  }
}

/* ------------------------------------------- témoins : la porte sait voir */

assert.throws(() => sansIdentite({ formulaire: "x", email: CONTACT.email }), "témoin : ligne nominative acceptée");
{
  // L'envoi que faisait l'ancien chemin des LP (variante C) doit être vu, sur chacun de ses trois défauts.
  const varianteC: Appel = {
    url: `${HUBSPOT}${FORMULAIRE_C}`,
    corps: {
      fields: [
        { objectTypeId: "0-2", name: "name", value: CONTACT.entreprise },
        ...["email", "firstname", "lastname", "message", "phone", "hs_country_region_code", "lp_url", "votre_demande_concerne"].map((name) => ({ name, value: "x" })),
      ],
    },
  };
  assert.equal(defautsEnvoi(varianteC, CHAMPS_LP).length, 3, "témoin : l'envoi de la variante C passe pour celui du site");
  assert.deepEqual(defautsEnvoi(undefined, CHAMPS_LP), ["aucun envoi HubSpot"]);
}

/* --------------------------------------------------------------- refus */

// Chaque champ est obligatoire : vide, il est nommé en 422 et rien ne sort du serveur.
for (const champ of ["entreprise", "nom", "prenom", "email", "telephone", "message"] as const) {
  const { statut, json } = await poste(chargeLp({ [champ]: "" }));
  assert.equal(statut, 422, `${champ} vide accepté`);
  assert.ok(json.erreurs?.[champ], `${champ} vide non nommé`);
  assert.equal(appels.length, 0, `${champ} vide : une requête est sortie`);
}

// Formes refusées : courriel, téléphone, indicatif hors liste, identifiant de formulaire.
for (const [champ, valeur] of [
  ["email", "camille@exemple"],
  ["telephone", "0472"],
  ["indicatif", "+999"],
  ["formulaire", "LP Lyon !"],
] as const) {
  const { statut, json } = await poste(chargeLp({ [champ]: valeur }));
  assert.equal(statut, 422, `${champ} « ${valeur} » accepté`);
  assert.ok(json.erreurs?.[champ], `${champ} « ${valeur} » non nommé`);
  assert.equal(appels.length, 0);
}

// Origine étrangère, autre type que JSON, corps illisible, taille annoncée trop grande.
for (const [entetes, corps, attendu] of [
  [{ "sec-fetch-site": "cross-site" }, chargeLp(), 403],
  [{ "content-type": "text/plain" }, chargeLp(), 415],
  [{}, "{pas du json", 400],
  [{ "content-length": "20000" }, chargeLp(), 413],
] as const) {
  const { statut } = await poste(corps, entetes);
  assert.equal(statut, attendu, `attendu ${attendu}`);
  assert.equal(appels.length, 0);
}

// Champ piège rempli : succès annoncé au robot, rien ne part.
{
  const { statut } = await poste(chargeLp({ site_web: "https://robot.invalid" }));
  assert.equal(statut, 200);
  assert.equal(appels.length, 0);
}

// Débit : cinq dépôts par quart d'heure depuis un même /24, le sixième est freiné.
{
  const entetes = { "x-forwarded-for": "10.200.1.9" };
  for (let i = 0; i < 5; i += 1) assert.equal((await poste(chargeLp({ prenom: "" }), entetes)).statut, 422);
  const { statut } = await poste(chargeLp(), entetes);
  assert.equal(statut, 429, "le sixième dépôt n'est pas freiné");
  assert.equal(appels.length, 0);
}

// Corps découpé (chunked), sans Content-Length, au-delà du plafond : refusé à la lecture.
{
  reseau += 1;
  appels = [];
  const gros = new TextEncoder().encode(JSON.stringify({ ...chargeLp(), message: "x".repeat(40_000) }));
  const flux = new ReadableStream<Uint8Array>({
    start(controleur) {
      for (let i = 0; i < gros.length; i += 4096) controleur.enqueue(gros.slice(i, i + 4096));
      controleur.close();
    },
  });
  const requete = new NextRequest("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.${reseau}.7` },
    body: flux,
    duplex: "half",
    // Exigé par fetch pour un corps en flux ; absent du type de Next.
  } as ConstructorParameters<typeof NextRequest>[1]);
  assert.equal(requete.headers.get("content-length"), null, "le témoin n'annonce pas sa taille");
  const reponse = await POST(requete);
  assert.equal(reponse.status, 413);
  assert.equal(appels.length, 0);
}

/* -------------------------------------------------------------- succès */

// Sans consentement publicitaire : le formulaire du site, ses champs et eux
// seuls, aucune mesure de campagne, l'adresse sans sa requête, une copie anonyme.
{
  const { statut } = await poste(chargeLp());
  assert.equal(statut, 200);
  const envois = envoisHubspot();
  assert.equal(envois.length, 1, "un seul envoi HubSpot");
  assert.deepEqual(defautsEnvoi(envois[0], CHAMPS_LP), []);
  assert.equal(valeurDe(envois[0], "phone"), "+33 04 72 00 00 00");
  assert.equal(valeurDe(envois[0], "country"), "FR", "le pays de l'indicatif n'arrive pas");
  assert.deepEqual(contexteDe(envois[0]), { pageUri: `https://migen.fr${PAGE}`, pageName: "LP Lyon" }, "sans consentement, l'adresse part sans sa requête");

  const copies = copiesLeads();
  assert.equal(copies.length, 1, "une copie d'attribution");
  const ligne = (Array.isArray(copies[0].corps) ? copies[0].corps[0] : copies[0].corps) as Record<string, unknown>;
  assert.equal(ligne.formulaire, FORMULAIRE);
  assert.equal(ligne.page_conversion, PAGE, "la LP de la conversion est dans leads");
  sansIdentite(ligne);
}

// Avec la finalité publicitaire : l'attribution du site, et l'adresse complète
// de la LP, gclid compris, comme le site la transmet.
{
  const { statut } = await poste(chargeLp(), { cookie: COOKIE_PUBLICITE });
  assert.equal(statut, 200);
  const [hubspot] = envoisHubspot();
  assert.deepEqual(defautsEnvoi(hubspot, [...CHAMPS_LP, ...CHAMPS_DE_CAMPAGNE]), []);
  assert.equal(valeurDe(hubspot, "utm_source"), "google");
  assert.equal(valeurDe(hubspot, "utm_medium"), "cpc");
  assert.equal(valeurDe(hubspot, "utm_campaign"), "lyon");
  assert.equal(valeurDe(hubspot, "page_entree"), PAGE);
  assert.equal(contexteDe(hubspot).pageUri, URL_PAGE, "l'adresse complète de la LP, gclid compris");
}

// Le même chemin que FormulaireContact : une page du site (sans fiche du
// registre) et une LP donnent les mêmes champs, le pays de la LP en plus.
{
  await poste(chargeLp(), { cookie: COOKIE_PUBLICITE });
  const [lp] = envoisHubspot();
  await poste(chargeLp({ formulaire: "contact", etablissement: {} }), { cookie: COOKIE_PUBLICITE });
  const [site] = envoisHubspot();
  assert.equal(site.url, lp.url, "la LP et le site visent deux formulaires");
  assert.deepEqual(nomsDe(lp), [...nomsDe(site), "country"].sort(), "la LP et le site n'envoient pas les mêmes champs");
}

// Le pays : celui de l'indicatif choisi ; avec la fiche du registre, le site
// envoie ses cinq champs comme avant ; une fiche bancale ne laisse que le pays.
{
  await poste(chargeLp({ indicatif: "+971", telephone: "50 123 4567", etablissement: { country: paysDeLIndicatif("+971") } }));
  assert.equal(valeurDe(envoisHubspot()[0], "country"), "AE");
  const fiche = { country: "France", siren: "123456789", siret: "12345678900012", address: "1 rue de l'Usine", zip: "69130" };
  await poste(chargeLp({ formulaire: "contact", etablissement: fiche }));
  for (const [nom, valeur] of Object.entries(fiche)) assert.equal(valeurDe(envoisHubspot()[0], nom), valeur, `fiche du registre : ${nom}`);
  await poste(chargeLp({ etablissement: { ...fiche, country: "FR", siret: "123" } }));
  assert.deepEqual(nomsDe(envoisHubspot()[0]), [...CHAMPS_LP].sort(), "fiche bancale : seul le pays doit partir");
  assert.equal(valeurDe(envoisHubspot()[0], "country"), "FR");
}

// Le pays refusé par le formulaire HubSpot (400) : la demande repart sans lui
// et arrive, comme l'enrichissement du site.
{
  statutsHubspot = [400];
  const { statut } = await poste(chargeLp());
  assert.equal(statut, 200, "un pays refusé coûte la demande");
  const [premier, second] = envoisHubspot();
  assert.ok(nomsDe(premier).includes("country") && second && !nomsDe(second).includes("country"), "second essai sans le pays absent");
}

// Une page encore ouverte avec l'ancien formulaire (variante C) poste `source`
// et `demande` : la demande arrive quand même au formulaire du site, sans eux.
for (const reliquat of [{ source: "lp", demande: "Une réponse à vos besoins ponctuels : arrêts techniques, shutdowns, etc." }, { source: "lp" }]) {
  const { statut } = await poste(chargeLp(reliquat));
  assert.equal(statut, 200, "une charge de l'ancien formulaire est refusée");
  assert.deepEqual(defautsEnvoi(envoisHubspot()[0], CHAMPS_LP), []);
}

// HubSpot en panne : le visiteur le sait (502), la copie d'attribution reste.
{
  statutsHubspot = [500];
  const { statut } = await poste(chargeLp());
  assert.equal(statut, 502);
  assert.equal(copiesLeads().length, 1);
}

// Formulaire du site absent de l'environnement : 502, rien vers HubSpot, et
// jamais de repli vers un autre formulaire.
{
  delete process.env.HUBSPOT_FORM_ID;
  const { statut } = await poste(chargeLp());
  process.env.HUBSPOT_FORM_ID = FORMULAIRE_SITE;
  assert.equal(statut, 502);
  assert.equal(envoisHubspot().length, 0);
  assert.equal(copiesLeads().length, 1);
}

/* ------------------------------------------- slugs, téléphone et agenda */

assert.deepEqual(["+33", "+32", "+41", "+34", "+1", "+971", "+999"].map(paysDeLIndicatif), ["FR", "BE", "CH", "ES", "CA", "AE", ""]);

assert.equal(numeroE164({ indicatif: "+33", telephone: "06 12 34 56 78" }), "+33612345678");
assert.equal(numeroE164({ indicatif: "+33", telephone: "+33 6 12 34 56 78" }), "+33612345678", "indicatif saisi gardé");
assert.equal(numeroE164({ indicatif: "+33", telephone: "0033 6 12 34 56 78" }), "+33612345678", "00 lu comme +");
assert.equal(numeroE164({ indicatif: "+32", telephone: "0470 12 34 56" }), "+32470123456");

assert.equal(formulaireLp("/lp/maintenance-ind/electrique/", "contact"), "lp-maintenance-ind-electrique-contact");
assert.equal(formulaireLp("/lp/", "heros"), "lp-heros");
assert.match(formulaireLp("/lp/secteurs/chimie/", "heros"), /^[a-z0-9-]{2,120}$/);

const agenda = new URL(urlCalendly(prerempliDe(JSON.stringify({ nom: "Camille Rivière", email: CONTACT.email }))));
assert.equal(`${agenda.origin}${agenda.pathname}`, "https://calendly.com/thomas-puthod-migen/30min");
assert.equal(agenda.searchParams.get("name"), "Camille Rivière");
assert.equal(agenda.searchParams.get("email"), CONTACT.email);
assert.equal(new URL(urlCalendly(prerempliDe("illisible"))).searchParams.get("name"), null, "rien de lisible : agenda vide");

console.log(
  "envoi des landing pages : formulaire HubSpot du site, champs et attribution du site, pays de l'indicatif, " +
    "protections (validation, débit, taille, origine, piège) et leads sans identité vérifiés, sans aucun envoi réel",
);
