/**
 * Le contenu importé est-il COMPLET en base, page par page ?
 *
 *   node scripts/verifie-base.mjs
 *
 * CE QUE CE CONTRÔLE EMPÊCHE, et ce n'est pas théorique : la couche de
 * permissions qui sert à écrire refuse en silence toute instruction de plus de
 * 3 800 octets environ. Or le découpage pose d'abord le contenu avec ses
 * tableaux VIDES, puis les allonge. Une instruction refusée au milieu laisse
 * donc une page qui EXISTE, qui a son gabarit, et qui ne porte rien. Trente et
 * une pages se sont retrouvées dans cet état sans que rien ne le signale.
 *
 * La référence n'est pas une liste écrite à la main : ce sont les fichiers
 * d'analyse produits par les parseurs (`supabase/import/*-analyse.json`) et les
 * SQL de gabarits. Le contrôle compare donc CE QUI DEVAIT ÊTRE ÉCRIT à CE QUI
 * EST EN BASE.
 *
 * CLÉ DE SERVICE : ce script la lit dans `.env.local` parce qu'il doit voir les
 * pages en BROUILLON, invisibles à la clé anonyme, et que ce sont justement
 * elles qui sont vides. Il tourne à la main, sur le poste, et ne fait que LIRE.
 * Rien de ce fichier n'est importé par le site : il vit dans `scripts/`, hors
 * du paquet construit. La clé ne doit jamais remonter ailleurs.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const IMPORT = join(RACINE, "supabase", "import");

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

/* La clé de SERVICE voit les brouillons ; la clé ANONYME ne voit que le publié.
   Or les pages vidées par une instruction refusée sont justement en brouillon.
   Sans clé de service, ce contrôle ne peut donc pas répondre à la question
   qu'il pose, et il le DIT au lieu de passer sur un sous-ensemble : un contrôle
   qui réussit en n'ayant rien regardé est pire que pas de contrôle. */
const CLE = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TOUT_VU = Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
if (!URL_BASE || !CLE) {
  console.error("  NEXT_PUBLIC_SUPABASE_URL ou une clé Supabase absente de .env.local");
  process.exit(1);
}

/** Ce que les parseurs ont produit : chemin vers nombre d'éléments attendus. */
const attendu = new Map();

for (const [fichier, forme] of [
  ["corpus-analyse.json", "sections"],
  ["editorial-analyse.json", "blocs"],
  ["fiches-analyse.json", "fiche"],
]) {
  const chemin = join(IMPORT, fichier);
  if (!existsSync(chemin)) {
    console.error(`  ${fichier} absent : le contrôle ne peut pas savoir ce qui était attendu`);
    process.exit(1);
  }
  for (const entree of JSON.parse(readFileSync(chemin, "utf8"))) {
    const url = entree.url.endsWith("/") ? entree.url : `${entree.url}/`;
    /* L'accueil n'est pas une ligne de `pages` : ses vingt sections sont des
       composants, dans app/page.tsx, parce qu'aucune autre page ne les réemploie.
       Le parseur le voit quand même dans le corpus, d'où ce retrait. */
    if (url === "/") continue;
    const contenu = entree.contenu ?? {};
    // Les fiches de cas n'ont pas de tableau de premier niveau à compter : on
    // vérifie seulement que leur gabarit est posé et que le chapeau est là.
    attendu.set(url, {
      forme,
      elements: forme === "fiche" ? null : (contenu[forme] ?? []).length,
    });
  }
}

const dossierGabarits = join(IMPORT, "gabarits");
if (existsSync(dossierGabarits)) {
  for (const nom of readdirSync(dossierGabarits).filter((f) => f.endsWith(".sql"))) {
    const sql = readFileSync(join(dossierGabarits, nom), "utf8");
    const gabarit = sql.match(/"gabarit":"([a-z]+)"/)?.[1] ?? "gabarit";
    for (const chemin of new Set([...sql.matchAll(/where path = '([^']+)'/g)].map((m) => m[1]))) {
      attendu.set(chemin, { forme: gabarit, elements: null });
    }
  }
}

const reponse = await fetch(
  `${URL_BASE}/rest/v1/pages?select=path,statut,contenu&order=path`,
  { headers: { apikey: CLE, Authorization: `Bearer ${CLE}` } },
);
if (!reponse.ok) {
  console.error(`  la base répond ${reponse.status} : ${(await reponse.text()).slice(0, 200)}`);
  process.exit(1);
}
const enBase = new Map(
  (await reponse.json()).map((p) => [p.path, p]),
);

const problemes = [];
let completes = 0;

for (const [chemin, cible] of attendu) {
  const page = enBase.get(chemin);
  if (!page) {
    problemes.push(`${chemin} : attendue par l'import, absente de la base`);
    continue;
  }
  const contenu = page.contenu ?? {};
  const vide = Object.keys(contenu).length === 0;

  if (vide) {
    problemes.push(`${chemin} : contenu vide, l'import attendait du ${cible.forme}`);
    continue;
  }

  if (cible.elements !== null) {
    const reel = Array.isArray(contenu[cible.forme]) ? contenu[cible.forme].length : -1;
    if (reel !== cible.elements) {
      problemes.push(
        `${chemin} : ${reel} ${cible.forme} en base, ${cible.elements} attendus` +
          (reel === 0 ? " (page remise à vide par une instruction refusée)" : ""),
      );
      continue;
    }
  } else if (!contenu.gabarit) {
    problemes.push(`${chemin} : aucun gabarit posé, l'import attendait ${cible.forme}`);
    continue;
  }

  completes += 1;
}

// Une note de travail de la maquette ou un commentaire HTML servi au visiteur.
for (const [chemin, page] of enBase) {
  const texte = JSON.stringify(page.contenu ?? {});
  if (texte.includes("<!--")) problemes.push(`${chemin} : un commentaire HTML est resté dans le contenu`);
  if (/à confirmer|à valider/.test(texte)) {
    problemes.push(`${chemin} : une note de travail (« à confirmer », « à valider ») est servie aux visiteurs`);
  }
}

console.log(
  `${attendu.size} pages attendues par l'import, ${completes} complètes, ${problemes.length} problème(s). ` +
    `Base : ${enBase.size} pages lues avec la clé ${TOUT_VU ? "de service" : "anonyme"}.`,
);

/* Ce qui a été vu est dit, même quand le contrôle ne peut pas conclure : un
   problème trouvé sur le publié est un problème réel, et le taire parce que le
   reste manque ne sert personne. */
for (const probleme of problemes.slice(0, 40)) console.error(`  ${probleme}`);
if (problemes.length > 40) console.error(`  ... et ${problemes.length - 40} autre(s)`);

if (!TOUT_VU) {
  const invisibles = attendu.size - enBase.size;
  console.error(
    `  SUPABASE_SERVICE_ROLE_KEY est absente ou vide dans .env.local, donc ${Math.max(0, invisibles)} ` +
      `page(s) en brouillon n'ont PAS été auditées. Ce sont précisément celles qu'une instruction ` +
      `refusée laisse vides. Le contrôle ne peut pas conclure : posez la clé de service (console ` +
      `Supabase, Project Settings, API) et relancez.`,
  );
  process.exit(1);
}

if (problemes.length > 0) process.exit(1);
console.log("contenu complet en base");
