/**
 * Les métadonnées des pages publiées tiennent-elles les règles du projet ?
 *
 *   node scripts/verifie-seo.mjs
 *
 * Lu DANS LA BASE, avec la clé anonyme, donc exactement ce que les visiteurs et
 * les robots reçoivent : une page en brouillon n'est pas jugée, et une page
 * publiée ne peut pas échapper au contrôle.
 *
 * LES RÈGLES, et pourquoi chacune est là :
 *   · le titre n'est JAMAIS identique au h1. Règle explicite du projet. Deux
 *     formulations valent deux occasions d'être trouvé ; la même deux fois en
 *     gâche une. 47 pages l'enfreignaient, toutes avec un titre fabriqué en
 *     collant « | Migen » derrière le h1.
 *   · un titre unique par page. Deux pages au même titre se cannibalisent dans
 *     la SERP, et le cocon perd la hiérarchie qu'il est censé exprimer.
 *   · une description présente et de longueur utilisable.
 *   · un mot clé principal par page, pour que la page sache ce qu'elle vise.
 *
 * CE QUI N'EST PAS JUGÉ ICI : la qualité de la formulation. Aucun contrôle ne
 * sait la mesurer. Il mesure ce qui est mesurable, et il le mesure sur toutes
 * les pages publiées.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));

/* Les variables sont lues dans `.env.local`, jamais écrites ici. Seule la clé
   ANONYME est utilisée : ce contrôle n'a aucun besoin d'écrire, et la clé de
   service n'a rien à faire dans un script lancé à la main. */
function environnement() {
  const brut = readFileSync(`${RACINE}.env.local`, "utf8");
  const valeurs = {};
  for (const ligne of brut.split("\n")) {
    const trouve = ligne.match(/^([A-Z_]+)=(.*)$/);
    if (trouve) valeurs[trouve[1]] = trouve[2].trim().replace(/^["']|["']$/g, "");
  }
  return valeurs;
}

const env = environnement();
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL_BASE || !CLE) {
  console.error("  NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY absente de .env.local");
  process.exit(1);
}

const reponse = await fetch(
  `${URL_BASE}/rest/v1/pages?select=path,titre_h1,mot_cle_principal,statut,contenu,seo(meta_title,meta_description,noindex)&statut=eq.published&order=path`,
  { headers: { apikey: CLE, Authorization: `Bearer ${CLE}` } },
);
if (!reponse.ok) {
  console.error(`  la base répond ${reponse.status} : ${(await reponse.text()).slice(0, 200)}`);
  process.exit(1);
}

const pages = await reponse.json();
if (!Array.isArray(pages) || pages.length === 0) {
  console.error("  aucune page publiée n'est lisible : contrôle sans objet, donc en échec");
  process.exit(1);
}

const LONGUEUR_TITRE = [20, 75];
const LONGUEUR_DESCRIPTION = [60, 175];

const nu = (texte) =>
  (texte ?? "").replace(/\s*\|.*$/, "").trim().toLowerCase().replace(/\s+/g, " ");

const problemes = [];
const parTitre = new Map();

for (const page of pages) {
  const seo = Array.isArray(page.seo) ? page.seo[0] : page.seo;
  if (!seo) {
    problemes.push(`${page.path} : aucune ligne seo`);
    continue;
  }
  if (seo.noindex) continue;

  const titre = seo.meta_title ?? "";
  const description = seo.meta_description ?? "";

  if (nu(titre) === nu(page.titre_h1)) {
    problemes.push(
      `${page.path} : le titre répète le h1 (« ${page.titre_h1} »). ` +
        `Le titre se lit dans la SERP, le h1 sur la page : deux formulations, deux occasions.`,
    );
  }
  if (titre.length < LONGUEUR_TITRE[0] || titre.length > LONGUEUR_TITRE[1]) {
    problemes.push(`${page.path} : titre de ${titre.length} caractères, attendu entre ${LONGUEUR_TITRE.join(" et ")}`);
  }
  if (description.length < LONGUEUR_DESCRIPTION[0] || description.length > LONGUEUR_DESCRIPTION[1]) {
    problemes.push(
      `${page.path} : description de ${description.length} caractères, attendu entre ${LONGUEUR_DESCRIPTION.join(" et ")}`,
    );
  }
  /* Une étude de cas ne vise pas un mot clé, et c'est voulu : elle raconte un
     chantier chez un client nommé. Lui en coller un reviendrait à l'écrire pour
     une requête qu'elle ne sert pas. Les hubs de la maquette (expertises,
     casclients, implantations) sont dans le même cas : ils orientent, ils ne
     ciblent pas. L'exception est donc portée par le GABARIT, pas par une liste
     de chemins qui dériverait à chaque page ajoutée. */
  const gabarit = page.contenu?.gabarit;
  const viseUnMotCle = !["fiche", "casclients", "expertises", "implantations"].includes(gabarit);
  if (viseUnMotCle && !page.mot_cle_principal) {
    problemes.push(`${page.path} : aucun mot clé principal`);
  }

  const deja = parTitre.get(nu(titre));
  if (deja) problemes.push(`${page.path} : même titre que ${deja}`);
  else parTitre.set(nu(titre), page.path);
}

console.log(`${pages.length} pages publiées contrôlées, ${problemes.length} problème(s).`);
if (problemes.length > 0) {
  for (const p of problemes.slice(0, 60)) console.error(`  ${p}`);
  if (problemes.length > 60) console.error(`  ... et ${problemes.length - 60} autre(s)`);
  process.exit(1);
}
console.log("métadonnées conformes");
