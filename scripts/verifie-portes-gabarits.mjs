/**
 * L'état des portes du projet, comparé à l'état PUBLIÉ dans docs/ETAT-MIGRATION.md.
 *
 *   node scripts/verifie-portes-gabarits.mjs
 *   node scripts/verifie-portes-gabarits.mjs --liste   (n'exécute rien)
 *
 * POURQUOI CE CONTRÔLE N'EST PAS « LANCER LES PORTES ». Un rapport qui dit
 * « neuf portes vertes, une rouge » se périme en silence : c'est exactement ce
 * qui est arrivé au relais, trouvé faux de six commits. Ce contrôle refuse donc
 * les DEUX dérives. Une porte verte qui tombe est une régression. Une porte
 * déclarée rouge qui passe au vert est un rapport périmé, et c'est une faute
 * aussi : elle signifie que le document continue d'annoncer un problème résolu.
 *
 * LA SEULE ROUGE ATTENDUE est `scripts/verifie-implantations.tsx`, périmée sur
 * trois points mesurés le 09/10, tous antérieurs aux corrections du jour :
 * elle attend « siège à Écully » là où la décision du 09/10 remet le siège à
 * Limonest ; elle réclame la phrase « chiffré sur devis » que la décision du
 * 09/10 au soir autorise justement à rendre ; elle exige les octets de photo de
 * son relevé là où la répartition du 09/10 a posé des photos du registre.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const execution = promisify(execFile);
const LISTE_SEULE = process.argv.includes("--liste");

/** La porte, la commande, et l'état ATTENDU : « verte » ou « rouge ». */
const PORTES = [
  ["interdits du contrat", ["node", ["scripts/verifie-interdits.mjs"]], "verte"],
  ["décisions de copie", ["bun", ["lib/verification-decisions-copie.ts"]], "verte"],
  ["annonces orphelines", ["node", ["scripts/verifie-libelles-orphelins.mjs"]], "verte"],
  ["suites de titre", ["node", ["scripts/verifie-suites-de-titre.mjs"]], "verte"],
  ["phrases estropiées", ["node", ["scripts/verifie-phrases-estropiees.mjs"]], "verte"],
  ["gabarit étude de cas", ["bun", ["components/site/preuve/verification-preuve.tsx"]], "verte"],
  ["gabarit spécialité", ["bun", ["components/site/expertises/specialite/verification-specialite.tsx"]], "verte"],
  ["gabarit domaine", ["bun", ["components/site/expertises/domaine/verification-domaine.tsx"]], "verte"],
  ["hub offres", ["bun", ["components/site/offres/verification-offres.tsx"]], "verte"],
  ["implantations", ["bun", ["scripts/verifie-implantations.tsx"]], "rouge"],
];

if (LISTE_SEULE) {
  for (const [nom, [bin, args], attendu] of PORTES) {
    console.log(`${attendu.padEnd(6)} ${nom.padEnd(26)} ${bin} ${args.join(" ")}`);
  }
  process.exit(0);
}

const derives = [];
for (const [nom, [bin, args], attendu] of PORTES) {
  let verte = false;
  try {
    await execution(bin, args, { cwd: RACINE, timeout: 180000, maxBuffer: 32 * 1024 * 1024 });
    verte = true;
  } catch {
    verte = false;
  }
  const obtenu = verte ? "verte" : "rouge";
  const conforme = obtenu === attendu;
  console.log(`  ${conforme ? "OK  " : "DÉRIVE"}  ${nom.padEnd(26)} attendue ${attendu}, obtenue ${obtenu}`);
  if (!conforme) derives.push({ nom, attendu, obtenu });
}

if (derives.length > 0) {
  for (const d of derives) {
    console.log(
      d.obtenu === "rouge"
        ? `\nRÉGRESSION : « ${d.nom} » était verte et tombe.`
        : `\nRAPPORT PÉRIMÉ : « ${d.nom} » est annoncée rouge et elle passe. Mettre docs/ETAT-MIGRATION.md à jour.`,
    );
  }
  process.exit(1);
}

const vertes = PORTES.filter(([, , a]) => a === "verte").length;
console.log(`\nportes de gabarit conformes a l'etat publie (${vertes} vertes, ${PORTES.length - vertes} rouge)`);
