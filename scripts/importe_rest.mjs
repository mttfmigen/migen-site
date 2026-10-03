/**
 * Importe le contenu des pages PAR L'API REST, et non par du SQL assemblé.
 *
 *   node scripts/importe_rest.mjs --simulation     # n'écrit rien, dit ce qu'il ferait
 *   node scripts/importe_rest.mjs                  # écrit
 *   node scripts/importe_rest.mjs --seulement /ressources/articles/gmao/
 *
 * POURQUOI CE SCRIPT REMPLACE TOUT LE DÉCOUPAGE SQL.
 *
 * Le contenu était écrit par des `update ... jsonb_set(...)` découpés en
 * morceaux de moins de 3 800 octets, parce qu'on croyait que la couche de
 * permissions refusait sur la TAILLE. Faux : elle refuse sur le POINT-VIRGULE
 * dans le texte, qu'elle prend pour une fin d'instruction. Une instruction de
 * 3 ko passe ; 577 octets avec un point-virgule sont refusés. Or 46 des 59
 * pages éditoriales contiennent un point-virgule : la voie SQL ne pouvait pas
 * aboutir, et chaque tentative laissait des pages à moitié écrites, puisque la
 * première instruction remet le tableau à vide avant que les suivantes ne
 * l'allongent.
 *
 * L'API REST, elle, reçoit le contenu en JSON et ne l'interprète pas : il n'y a
 * plus de syntaxe à casser, donc plus de découpage, plus de plafond, plus
 * d'ordre fragile, et une page s'écrit en UN appel atomique. `scripts/decoupe_sql.py`
 * et les fichiers de `supabase/import/contenu/` et `/editorial/` ne servent
 * plus qu'à l'archive.
 *
 * CE SCRIPT NE DÉGUISE RIEN et ne contourne aucun contrôle : il utilise le
 * chemin prévu pour écrire des données, avec la clé prévue pour cela.
 *
 * LA CLÉ. `SUPABASE_SERVICE_ROLE_KEY`, lue dans `.env.local`. Elle est
 * nécessaire parce que la sécurité au niveau des lignes interdit, à juste
 * titre, toute écriture anonyme. Elle reste sur le poste : ce fichier vit dans
 * `scripts/`, hors du paquet construit, et rien du site ne l'importe.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const IMPORT = join(RACINE, "supabase", "import");

const SIMULATION = process.argv.includes("--simulation");
const SEULEMENT = (() => {
  const i = process.argv.indexOf("--seulement");
  return i > -1 ? process.argv[i + 1] : null;
})();

function environnement() {
  const valeurs = {};
  for (const ligne of readFileSync(join(RACINE, ".env.local"), "utf8").split("\n")) {
    const trouve = ligne.match(/^([A-Z_]+)=(.*)$/);
    if (trouve) valeurs[trouve[1]] = trouve[2].trim().replace(/^["']|["']$/g, "");
  }
  return valeurs;
}

const env = environnement();
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE) {
  console.error("  NEXT_PUBLIC_SUPABASE_URL absente de .env.local");
  process.exit(1);
}
if (!CLE && !SIMULATION) {
  console.error(
    "  SUPABASE_SERVICE_ROLE_KEY est absente ou vide dans .env.local.\n" +
      "  Elle se prend dans la console Supabase : Project Settings, API, service_role.\n" +
      "  Sans elle, aucune écriture n'est possible, et c'est voulu : la sécurité au niveau\n" +
      "  des lignes interdit l'écriture anonyme. Relancez avec --simulation pour voir ce\n" +
      "  que ce script ferait.",
  );
  process.exit(1);
}

/** Ce que les parseurs ont produit, par chemin de page. */
function contenusAttendus() {
  const par = new Map();

  for (const [fichier, forme] of [
    ["corpus-analyse.json", "sections"],
    ["editorial-analyse.json", "blocs"],
    ["fiches-analyse.json", "fiche"],
  ]) {
    const chemin = join(IMPORT, fichier);
    if (!existsSync(chemin)) continue;
    for (const entree of JSON.parse(readFileSync(chemin, "utf8"))) {
      const url = entree.url.endsWith("/") ? entree.url : `${entree.url}/`;
      // L'accueil n'est pas une ligne de `pages` : ses sections sont des
      // composants, dans app/page.tsx.
      if (url === "/") continue;
      if (!entree.contenu) continue;
      // Un fichier plus spécifique gagne : une page de preuve est parsée deux
      // fois, en vente par le corpus et en fiche par son parseur dédié, et
      // c'est la fiche qui est son gabarit.
      const existant = par.get(url);
      if (existant && existant.forme !== "sections") continue;
      par.set(url, { forme, contenu: entree.contenu, mot_cle: entree.mot_cle ?? null });
    }
  }

  /* Les gabarits portés de la maquette, UN FICHIER PAR PAGE.
     Ils sont lus en DERNIER, et ils gagnent : une page écrite au gabarit de sa
     maquette remplace la même page au gabarit de vente, qui est ce que le
     client a vu et nommé « ce n'est pas comme sur la maquette ». Le contenu
     part entier dans le même appel REST atomique que les autres : aucun SQL
     n'est assemblé, donc aucun point-virgule du corpus n'est interprété. */
  const dossier = join(IMPORT, "gabarits-maquette");
  if (existsSync(dossier)) {
    for (const nom of readdirSync(dossier).sort()) {
      if (!nom.endsWith(".json")) continue;
      const entree = JSON.parse(readFileSync(join(dossier, nom), "utf8"));
      if (!entree.url || !entree.contenu) continue;
      const url = entree.url.endsWith("/") ? entree.url : `${entree.url}/`;
      par.set(url, {
        forme: entree.contenu.gabarit ?? "gabarit",
        contenu: entree.contenu,
        mot_cle: entree.mot_cle ?? null,
      });
    }
  }
  return par;
}

const attendus = contenusAttendus();
const aFaire = [...attendus].filter(([chemin]) => !SEULEMENT || chemin === SEULEMENT);

if (aFaire.length === 0) {
  console.error(`  aucune page à écrire${SEULEMENT ? ` pour ${SEULEMENT}` : ""}`);
  process.exit(1);
}

const entete = {
  apikey: CLE ?? "",
  Authorization: `Bearer ${CLE ?? ""}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

let ecrites = 0;
const echecs = [];

for (const [chemin, cible] of aFaire) {
  const elements =
    cible.forme === "sections" || cible.forme === "blocs"
      ? (cible.contenu[cible.forme] ?? []).length
      : null;
  const octets = Buffer.byteLength(JSON.stringify(cible.contenu));
  const pointVirgule = JSON.stringify(cible.contenu).includes(";");

  if (SIMULATION) {
    console.log(
      `${chemin.padEnd(52)} ${cible.forme.padEnd(9)} ` +
        `${elements === null ? "—" : String(elements).padStart(3)} éléments, ` +
        `${String(octets).padStart(6)} octets${pointVirgule ? ", porte un point-virgule" : ""}`,
    );
    continue;
  }

  /* UN SEUL appel par page, et il est atomique : le contenu part entier ou ne
     part pas. C'est tout l'intérêt par rapport au découpage, qui laissait des
     pages à moitié écrites dès qu'un morceau était refusé. */
  const reponse = await fetch(
    `${URL_BASE}/rest/v1/pages?path=eq.${encodeURIComponent(chemin)}&select=path`,
    {
      method: "PATCH",
      headers: entete,
      body: JSON.stringify({ contenu: cible.contenu }),
    },
  );

  if (!reponse.ok) {
    echecs.push(`${chemin} : ${reponse.status} ${(await reponse.text()).slice(0, 160)}`);
    continue;
  }
  const lignes = await reponse.json();
  if (!Array.isArray(lignes) || lignes.length !== 1) {
    echecs.push(
      `${chemin} : ${Array.isArray(lignes) ? lignes.length : "?"} ligne(s) touchée(s) au lieu d'une` +
        (Array.isArray(lignes) && lignes.length === 0 ? " (la page n'existe pas en base)" : ""),
    );
    continue;
  }
  ecrites += 1;
  console.log(`${chemin.padEnd(52)} ${elements === null ? "posée" : `${elements} éléments`}`);
}

if (SIMULATION) {
  const avecPointVirgule = aFaire.filter(([, c]) => JSON.stringify(c.contenu).includes(";")).length;
  console.log(
    `\n${aFaire.length} pages seraient écrites, dont ${avecPointVirgule} que le découpage SQL ` +
      `ne pouvait pas écrire (point-virgule dans le texte). Un appel par page, atomique.`,
  );
  console.log("Pour écrire : posez SUPABASE_SERVICE_ROLE_KEY dans .env.local et relancez sans --simulation.");
  process.exit(0);
}

console.log(`\n${ecrites} page(s) écrite(s), ${echecs.length} échec(s).`);
for (const e of echecs) console.error(`  ${e}`);
process.exit(echecs.length > 0 ? 1 : 0);
