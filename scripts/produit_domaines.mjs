/**
 * Produit la donnée des 19 pages de DOMAINE technique, au gabarit de la maquette.
 *
 *   node scripts/produit_domaines.mjs
 *
 * CE QUE CE SCRIPT FAIT, ET CE QU'IL NE FAIT PAS.
 *
 * Il ne rédige RIEN. Il relit `supabase/import/corpus-analyse.json`, c'est-à-dire
 * le corpus écrit par le client, et il le replace dans les cases que la maquette
 * dessine pour le gabarit domaine (`maquette/accueil-rendu.html`, bloc
 * `sc-if value="{{ isDomaine }}"`, lignes 6219 à 6276). Chaque chaîne posée ici
 * sort du corpus telle quelle, sans réécriture, sans troncature, sans résumé.
 *
 * LA CORRESPONDANCE, case de la maquette par case :
 *
 *   surtitre « Domaine d'activité »  le gabarit, pas la donnée
 *   h1                              `pages.titre_h1`, rendu par la route
 *   chapeau                         heros.mecanisme
 *   bouton principal                heros.cta
 *   bouton secondaire               VIDE : le corpus n'en porte pas de second
 *   visuel de la mosaïque           VIDE : le corpus ne porte aucune image
 *   « Ce que nous traitons »        offre.lignes[].prestation.accroche
 *   « Les autres domaines »         les 8 autres domaines, déduits du corpus
 *   carte de fin, titre et bouton   ctaFinal.question et ctaFinal.bouton
 *   carte de fin, phrase            VIDE : ctaFinal n'en porte pas
 *   tout le reste du corpus         `reste`, voir `types/metier.ts`
 *
 * UNE CASE SANS DONNÉE RESTE VIDE. Le composant ne rend pas une section vide :
 * pas de visuel inventé, pas de second bouton deviné, pas de phrase comblée au
 * jugé. Les cases vides sont listées en fin d'exécution.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");

/**
 * Les 9 domaines techniques, dans l'ordre du cocon. La liste est FERMÉE : elle
 * dit quelles branches de /expertises/ sont des domaines, et donc lesquelles
 * passent à ce gabarit. `/expertises/` est le hub, `types-de-maintenance` une
 * taxonomie, `specialisations-constructeur` une page de marques : aucune n'est
 * un domaine, aucune n'est touchée ici.
 */
const DOMAINES = [
  "automatisme",
  "electrique",
  "electromecanique",
  "hydraulique",
  "mecanique",
  "pneumatique",
  "robotique",
  "soudure",
  "tuyauterie",
];

const corpus = JSON.parse(
  readFileSync(join(RACINE, "supabase", "import", "corpus-analyse.json"), "utf8"),
);

/** Les entrées du corpus qui tombent dans une branche de domaine. */
const entrees = corpus
  .map((e) => ({ ...e, url: e.url.endsWith("/") ? e.url : `${e.url}/` }))
  .filter((e) => {
    const segments = e.url.split("/").filter(Boolean);
    return (
      segments[0] === "expertises" &&
      segments.length >= 2 &&
      DOMAINES.includes(segments[1]) &&
      e.contenu?.sections?.length
    );
  })
  .sort((a, b) => a.url.localeCompare(b.url));

const branche = (url) => url.split("/").filter(Boolean)[1];
const section = (e, type) => e.contenu.sections.find((s) => s.type === type);

/** Le titre de la page racine de chaque domaine, lu dans son propre héros. */
const titreDomaine = new Map(
  entrees
    .filter((e) => e.url.split("/").filter(Boolean).length === 2)
    .map((e) => [branche(e.url), section(e, "heros")?.h1]),
);

const vides = [];
mkdirSync(SORTIE, { recursive: true });

for (const e of entrees) {
  const heros = section(e, "heros");
  const offre = section(e, "offre");
  const ctaFinal = section(e, "ctaFinal");
  const mienne = branche(e.url);

  const contenu = { gabarit: "domaine" };

  if (heros?.mecanisme) contenu.chapeau = heros.mecanisme;
  else vides.push(`${e.url} chapeau : heros.mecanisme absent du corpus`);

  // Le bouton principal seul. La maquette en dessine deux ; le second y renvoie
  // vers le bureau d'études, et le corpus de la page ne dit pas vers quoi il
  // renverrait ici. Choisir pour lui serait inventer un lien.
  if (heros?.cta) contenu.boutons = [{ libelle: heros.cta }];
  else vides.push(`${e.url} boutons : heros.cta absent du corpus`);
  vides.push(`${e.url} second bouton du héros : aucune source dans le corpus`);

  // La maquette pose une photo en deux tiers de la mosaïque. Le corpus n'en
  // porte aucune, et aucun fichier n'est rattaché à un domaine : la mosaïque se
  // rend sur une seule colonne, avec la carte de verre seule.
  vides.push(`${e.url} visuel de la mosaïque : aucune image dans le corpus`);

  const traitements = (offre?.lignes ?? [])
    .map((l) => l.prestation?.accroche)
    .filter((a) => typeof a === "string" && a.length > 0);
  if (traitements.length > 0) contenu.traitements = traitements;
  else vides.push(`${e.url} « Ce que nous traitons » : aucun offre.lignes[].prestation.accroche`);

  const autres = DOMAINES.filter((d) => d !== mienne)
    .map((d) => ({ libelle: titreDomaine.get(d), href: `/expertises/${d}/` }))
    .filter((l) => typeof l.libelle === "string" && l.libelle.length > 0);
  if (autres.length > 0) contenu.autres = autres;

  if (ctaFinal?.question && ctaFinal?.bouton) {
    contenu.cta = {
      question: ctaFinal.question,
      bouton: { libelle: ctaFinal.bouton, ...(ctaFinal.href ? { href: ctaFinal.href } : {}) },
    };
    // La maquette met une phrase sous le titre de la carte. Le corpus n'en
    // donne pas pour `ctaFinal`, et celle de la maquette annonce un délai
    // chiffré, que le contrat interdit de recopier.
    vides.push(`${e.url} phrase de la carte de fin : ctaFinal ne porte pas de rappel`);
  } else {
    vides.push(`${e.url} carte de fin : ctaFinal incomplet dans le corpus`);
  }

  // Tout le texte rédigé que la maquette ne dessine pas. `heros` et `ctaFinal`
  // sont déjà rendus par le héros et la carte de fin de la maquette.
  const reste = e.contenu.sections.filter((s) => s.type !== "heros" && s.type !== "ctaFinal");
  if (reste.length > 0) contenu.reste = reste;

  const fichier = `${e.url.split("/").filter(Boolean).join("-")}.json`;
  writeFileSync(
    join(SORTIE, fichier),
    `${JSON.stringify({ url: e.url, contenu }, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `${e.url.padEnd(48)} ${String(traitements.length).padStart(2)} traitements, ` +
      `${String(autres.length).padStart(2)} autres domaines, ${reste.length} sections de corpus`,
  );
}

console.log(`\n${entrees.length} fichiers écrits dans supabase/import/gabarits-maquette/`);
console.log(`\n${vides.length} cases de la maquette laissées VIDES, faute de donnée :`);
for (const v of vides) console.log(`  ${v}`);
