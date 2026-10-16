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
 */
import assert from "node:assert/strict";

import { NextRequest } from "next/server";

import { chargeUtile, type Contact } from "@/components/formulaire/validation";
import { VERSION_BANDEAU, choixUniforme } from "@/lib/consentement";

import { DEMANDES_LP, FORMULAIRE_HUBSPOT_LP, formulaireLp, numeroE164, urlCalendly, prerempliDe } from "./lead-lp";

const HUBSPOT = "https://api.hsforms.com/submissions/v3/integration/submit/148000737/";
const SUPABASE = "https://doublure.supabase.invalid";

process.env.HUBSPOT_FORM_ID = "formulaire-du-site-doublure";
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

function chargeLp(modifs: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...chargeUtile({
      contact: CONTACT,
      formulaire: formulaireLp(PAGE, "heros"),
      piege: "",
      etablissement: {},
      attribution: {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "lyon",
        page_entree: PAGE,
        page_conversion: PAGE,
      },
      page: { url: `https://migen.fr${PAGE}?utm_source=google&gclid=Cj0doublure_BwE`, titre: "LP Lyon" },
    }),
    source: "lp",
    demande: DEMANDES_LP[0],
    ...modifs,
  };
}

const COOKIE_PUBLICITE = `migen_consentement=${encodeURIComponent(
  JSON.stringify({ version: VERSION_BANDEAU, visiteur: "doublure-0001", choix: choixUniforme(true), le: new Date().toISOString() }),
)}`;

let reseau = 0;
/** Chaque envoi vient d'un /24 différent : le plafond de débit ne s'en mêle pas. */
async function poste(charge: unknown, entetes: Record<string, string> = {}) {
  reseau += 1;
  appels = [];
  const corps = JSON.stringify(charge);
  const reponse = await POST(
    new NextRequest("http://localhost/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.${reseau}.7`, ...entetes },
      body: corps,
    }),
  );
  return { statut: reponse.status, json: (await reponse.json()) as { erreurs?: Record<string, string> } };
}

type Champ = { name: string; value: string; objectTypeId?: string };
const envoisHubspot = () => appels.filter((a) => a.url.startsWith(HUBSPOT));
const champsDe = (appel: Appel) => (appel.corps as { fields: Champ[] }).fields;
const nomsDe = (appel: Appel) => champsDe(appel).map((c) => (c.objectTypeId ? `${c.objectTypeId}/${c.name}` : c.name)).sort();
const valeurDe = (appel: Appel, nom: string) => champsDe(appel).find((c) => c.name === nom)?.value;

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
// Témoin : la vérification sait refuser une ligne nominative.
assert.throws(() => sansIdentite({ formulaire: "x", email: CONTACT.email }));

/* --------------------------------------------------------------- refus */

// Champ manquant : 422, le champ nommé, et rien ne sort du serveur.
{
  const { statut, json } = await poste(chargeLp({ prenom: "" }));
  assert.equal(statut, 422);
  assert.ok(json.erreurs?.prenom, "le prénom manquant est nommé");
  assert.equal(appels.length, 0, "aucune requête sortante sur un refus");
}

// « Votre demande concerne » absent, puis hors de la liste HubSpot.
for (const demande of [undefined, "Autre chose"]) {
  const { statut, json } = await poste(chargeLp({ demande }));
  assert.equal(statut, 422, `demande ${demande} refusée`);
  assert.ok(json.erreurs?.demande, "la demande est nommée");
  assert.equal(appels.length, 0);
}

// Courriel invalide.
{
  const { statut, json } = await poste(chargeLp({ email: "camille@exemple" }));
  assert.equal(statut, 422);
  assert.ok(json.erreurs?.email);
  assert.equal(appels.length, 0);
}

// Téléphone trop court.
{
  const { statut, json } = await poste(chargeLp({ telephone: "0472" }));
  assert.equal(statut, 422);
  assert.ok(json.erreurs?.telephone);
  assert.equal(appels.length, 0);
}

// Origine étrangère : un autre site poste le formulaire.
{
  const { statut } = await poste(chargeLp(), { "sec-fetch-site": "cross-site" });
  assert.equal(statut, 403);
  assert.equal(appels.length, 0);
}

// Corps d'un autre type que JSON.
{
  const { statut } = await poste(chargeLp(), { "content-type": "text/plain" });
  assert.equal(statut, 415);
  assert.equal(appels.length, 0);
}

// Champ piège rempli : succès annoncé au robot, rien ne part.
{
  const { statut } = await poste(chargeLp({ site_web: "https://robot.invalid" }));
  assert.equal(statut, 200);
  assert.equal(appels.length, 0);
}

/* -------------------------------------------------------------- succès */

// Sans consentement publicitaire : le formulaire C de la LP en ligne, ses
// champs et eux seuls, aucune mesure de campagne, une copie anonyme en base.
{
  const { statut } = await poste(chargeLp());
  assert.equal(statut, 200);
  const [hubspot, ...autres] = envoisHubspot();
  assert.equal(autres.length, 0, "un seul envoi HubSpot");
  assert.equal(hubspot.url, `${HUBSPOT}${FORMULAIRE_HUBSPOT_LP}`, "le formulaire C de la LP en ligne");
  assert.deepEqual(nomsDe(hubspot), [
    "0-2/name",
    "email",
    "firstname",
    "hs_country_region_code",
    "lastname",
    "lp_url",
    "message",
    "phone",
    "votre_demande_concerne",
  ]);
  assert.equal(valeurDe(hubspot, "votre_demande_concerne"), DEMANDES_LP[0]);
  assert.equal(valeurDe(hubspot, "lp_url"), PAGE);
  assert.equal(valeurDe(hubspot, "phone"), "+33 04 72 00 00 00");
  const contexte = (hubspot.corps as { context: { pageUri?: string } }).context;
  assert.equal(contexte.pageUri, `https://migen.fr${PAGE}`, "sans consentement, l'adresse part sans sa requête");

  const copies = appels.filter((a) => a.url.startsWith(`${SUPABASE}/rest/v1/leads`));
  assert.equal(copies.length, 1, "une copie d'attribution");
  const ligne = Array.isArray(copies[0].corps) ? copies[0].corps[0] : copies[0].corps;
  assert.equal((ligne as { formulaire: string }).formulaire, "lp-maintenance-industrielle-lyon-heros");
  sansIdentite(ligne);
}

// Avec la finalité publicitaire : les UTM, le gclid et l'adresse complète.
{
  const { statut } = await poste(chargeLp(), { cookie: COOKIE_PUBLICITE });
  assert.equal(statut, 200);
  const [hubspot] = envoisHubspot();
  assert.equal(valeurDe(hubspot, "utm_source"), "google");
  assert.equal(valeurDe(hubspot, "utm_medium"), "cpc");
  assert.equal(valeurDe(hubspot, "utm_campaign"), "lyon");
  assert.equal(valeurDe(hubspot, "gclid"), "Cj0doublure_BwE");
  assert.ok(!nomsDe(hubspot).includes("formulaire_migen"), "le formulaire C ne porte pas formulaire_migen");
  assert.match((hubspot.corps as { context: { pageUri: string } }).context.pageUri, /\?utm_source=google&gclid=/);
}

// HubSpot refuse un champ caché (400) : la demande repart sans eux, et arrive,
// avec le code pays, que la LP en ligne envoie toujours au formulaire C.
{
  statutsHubspot = [400];
  const { statut } = await poste(chargeLp(), { cookie: COOKIE_PUBLICITE });
  assert.equal(statut, 200);
  const [premier, second] = envoisHubspot();
  assert.ok(premier && second, "un second envoi");
  assert.deepEqual(nomsDe(second), [
    "0-2/name",
    "email",
    "firstname",
    "hs_country_region_code",
    "lastname",
    "message",
    "phone",
    "votre_demande_concerne",
  ]);
  assert.equal(valeurDe(second, "hs_country_region_code"), "FR");
}

// Un formulaire d'essai peut remplacer celui de production (préproduction, aperçu).
{
  process.env.HUBSPOT_FORM_ID_LP = "formulaire-essai-doublure";
  const { statut } = await poste(chargeLp());
  delete process.env.HUBSPOT_FORM_ID_LP;
  assert.equal(statut, 200);
  assert.equal(envoisHubspot()[0].url, `${HUBSPOT}formulaire-essai-doublure`);
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

// HubSpot en panne : le visiteur le sait (502), la copie d'attribution reste.
{
  statutsHubspot = [500];
  const { statut } = await poste(chargeLp());
  assert.equal(statut, 502);
  assert.equal(appels.filter((a) => a.url.startsWith(`${SUPABASE}/rest/v1/leads`)).length, 1);
}

/* -------------------------------------- le formulaire du site, inchangé */

// Sans `source: "lp"`, même avec une « demande », c'est le formulaire du site.
{
  const charge = chargeLp({ formulaire: "contact" });
  delete charge.source;
  const { statut } = await poste(charge);
  assert.equal(statut, 200);
  const [hubspot] = envoisHubspot();
  assert.equal(hubspot.url, `${HUBSPOT}formulaire-du-site-doublure`);
  assert.equal(valeurDe(hubspot, "formulaire_migen"), "contact");
  assert.ok(!nomsDe(hubspot).includes("votre_demande_concerne"));
  assert.ok(!nomsDe(hubspot).includes("lp_url"));
}

/* ----------------------------------------------- slugs et agenda (purs) */

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

console.log("envoi des landing pages : refus, succès, repli HubSpot et formulaire du site vérifiés, sans aucun envoi réel");
