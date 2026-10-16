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
 * PLUS AUCUNE ROUGE depuis le 09/10 au soir. `scripts/verifie-implantations.tsx`
 * l'a été toute la journée, pour trois raisons qui lui étaient propres et que
 * la correction a traitées une par une :
 *  - elle INTERDISAIT « Limonest » au motif que le siège serait à Écully, soit
 *    l'inverse de la décision du 09/10, et l'inverse de sa propre capture.
 *    L'interdit a été retourné : c'est « siège à Écully » qui est refusé ;
 *  - elle réclamait la réponse « chiffré sur devis » comme absente du rendu
 *    alors que le site la sert mot pour mot. La capture, elle, affiche du
 *    MARKDOWN BRUT (« **Nous avons déjà un prestataire…** »), l'un des
 *    bloquants de l'audit, corrigé sur le site : la comparaison exigeait donc
 *    la faute. Les marqueurs sont désormais retirés des deux côtés ;
 *  - elle exigeait les octets de photo de son relevé là où la répartition du
 *    09/10 a posé des photos du registre. Elle accepte les deux, et continue
 *    de refuser une photo devinée, ni au relevé ni au registre.
 * Ses onze preuves d'échec passent toujours : la porte n'a pas été édentée.
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
  ["implantations", ["bun", ["scripts/verifie-implantations.tsx"]], "verte"],
];

if (LISTE_SEULE) {
  for (const [nom, [bin, args], attendu] of PORTES) {
    console.log(`${attendu.padEnd(6)} ${nom.padEnd(26)} ${bin} ${args.join(" ")}`);
  }
  process.exit(0);
}

const derives = [];
const nonConcluantes = [];
for (const [nom, [bin, args], attendu] of PORTES) {
  let obtenu;
  try {
    await execution(bin, args, { cwd: RACINE, timeout: 180000, maxBuffer: 32 * 1024 * 1024 });
    obtenu = "verte";
  } catch (erreur) {
    /* UN DÉLAI DÉPASSÉ N'EST PAS UN ÉCHEC, et les confondre coûte cher : le
       09/10, cette suite a tourné pendant que quatre agents interrogeaient le
       serveur de développement, et elle a déclaré TROIS RÉGRESSIONS sur des
       portes que la même commande rendait vertes une minute plus tard, seule.
       Une porte qui lit le rendu des 248 pages dépasse les trois minutes dès
       que le serveur est chargé. Un verdict rendu dans ces conditions n'en est
       pas un : il est annoncé comme non concluant, et la suite le dit. */
    obtenu = erreur.killed || erreur.signal === "SIGTERM" || erreur.code === "ETIMEDOUT" ? "non concluante" : "rouge";
  }
  if (obtenu === "non concluante") {
    console.log(`  ?     ${nom.padEnd(26)} attendue ${attendu}, délai dépassé : à relancer seule`);
    nonConcluantes.push(nom);
    continue;
  }
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

if (nonConcluantes.length > 0) {
  console.log(
    `\n${nonConcluantes.length} porte(s) non concluante(s), delai depasse : ${nonConcluantes.join(", ")}.` +
      `\nLes relancer une par une, serveur de developpement au repos. Rien n'est conclu sur elles.`,
  );
  process.exit(1);
}

const vertes = PORTES.filter(([, , a]) => a === "verte").length;
console.log(
  `\nportes de gabarit conformes a l'etat publie (${vertes} verte(s), ${PORTES.length - vertes} rouge(s))`,
);
