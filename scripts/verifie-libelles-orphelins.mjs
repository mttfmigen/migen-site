/**
 * Les annonces dont la liste ne vient jamais : « Le besoin posé par le site : »
 * et rien derrière les deux-points.
 *
 *   node scripts/verifie-libelles-orphelins.mjs
 *   node scripts/verifie-libelles-orphelins.mjs --controle   (contrôle positif)
 *
 * POURQUOI CE CONTRÔLE EXISTE. Signalé par Mehdi le 09/10 sur les études de
 * cas : « des phrases qui veulent rien dire ». Sur /preuves/autoliv/, le bloc
 * « La situation » du récapitulatif ne contenait qu'un paragraphe,
 * « Le besoin posé par le site : », suivi de rien.
 *
 * LA CAUSE N'EST PAS LE PORTAGE. `Complement` (components/site/preuve/
 * PagePreuve.tsx) sait rendre des `puces`, et le gabarit de la maquette a bien
 * l'emplacement : il est VIDE dans la capture (`maquette/rendu/
 * preuves--autoliv.html` : `<p>…site :</p>` puis deux lignes blanches). La
 * maquette a perdu ces listes à son propre export, et
 * `extrait-depuis-captures.py` les a recopiées telles quelles : son `assert` se
 * contentait de « texte OU puces », ce qu'un libellé seul vérifie.
 *
 * ET LE CONTENU N'EST PAS PERDU, c'est ce qui rend le remède sûr : les listes
 * annoncées sont rendues ailleurs sur la même page, en cartes (`objectifs`,
 * `reponseCartes`, `resultats`), vérifiées puce par puce contre le corpus du
 * client (`maquette/contenu/site/Preuves/*.md`).
 *
 * TROIS CRITÈRES ONT ÉTÉ PAYÉS AVANT CELUI-LÀ, et chacun est maintenant un cas
 * du contrôle positif :
 *   1. « lire le rendu, balise par balise » déclarait orphelin le libellé de
 *      /guides/choisir-une-entreprise-de-maintenance/, dont la liste EST rendue
 *      juste après, en cartes faites de <div> qu'une expression régulière ne
 *      sait pas apparier. Faux défaut sur une page conforme.
 *   2. « le texte suivant est-il un titre ? » absolvait au contraire huit
 *      défauts réels : après « Ce que la mission illustre : » vient le
 *      sur-titre « Votre besoin », qui n'est pas un titre de niveau.
 *   3. « le conteneur se referme-t-il après l'annonce ? » déclarait orphelines
 *      les annonces de /expertises/types-de-maintenance/, dont la liste vit
 *      dans le conteneur FRÈRE. Indiscernable du vrai défaut en HTML.
 *
 * LE CRITÈRE RETENU EST DONC CELUI DES FICHES, et il est simple : une annonce
 * est orpheline si ni son bloc ni le bloc SUIVANT ne porte autre chose que de
 * la prose. Une liste s'appelle `puces`, un tableau `tableau`, et la maquette
 * les met tantôt dans le bloc de l'annonce, tantôt dans le bloc d'après : les
 * deux formes sont conformes, c'est leur ABSENCE des deux qui est le défaut.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const FICHES = join(RACINE, "supabase", "import", "gabarits-maquette");
const CONTROLE = process.argv.includes("--controle");

/* Une annonce : au moins trois mots, deux-points final. Les deux-points au
   MILIEU d'une phrase (« Ce que couvre le technicien sur site : la
   participation… ») ne comptent pas, la phrase se poursuit d'elle-même. Les
   intitulés courts de tableau (« Client : ») non plus. */
const ANNONCE = /^(?=(?:\S+\s+){2,})[^:]{12,}:$/u;

/* Les champs qui DÉCLARENT un écart au lieu de le rendre : les chercher ici
   retournerait le contrôle contre les contrôles. Même liste que
   `scripts/verifie-interdits.mjs`. */
const DECLARATIFS = new Set(["_reference", "retraits", "phrases_retirees", "trous", "_source", "source", "seo"]);

/* Ce qui n'est que de la prose. Tout le reste (puces, tableau, cartes…) est la
   matière que l'annonce annonce. */
const PROSE = new Set(["titre", "texte", "text", "accroche", "prose", "_source", "source"]);

const porteLaMatiere = (bloc) =>
  Boolean(bloc) &&
  typeof bloc === "object" &&
  !Array.isArray(bloc) &&
  Object.entries(bloc).some(([cle, valeur]) => {
    if (PROSE.has(cle) || !valeur) return false;
    return Array.isArray(valeur) ? valeur.length > 0 : true;
  });

/** Les annonces orphelines d'une fiche, avec le chemin de leur champ. */
export function orphelines(fiche) {
  const trouvees = [];
  const parcours = (noeud, chemin) => {
    if (Array.isArray(noeud)) {
      noeud.forEach((bloc, i) => {
        if (bloc && typeof bloc === "object" && !Array.isArray(bloc)) {
          for (const cle of ["texte", "text", "prose", "accroche"]) {
            const t = bloc[cle];
            if (typeof t !== "string" || !ANNONCE.test(t.trim())) continue;
            if (porteLaMatiere(bloc) || porteLaMatiere(noeud[i + 1])) continue;
            trouvees.push({ chemin: `${chemin}[${i}].${cle}`, texte: t.trim() });
          }
        }
        parcours(bloc, `${chemin}[${i}]`);
      });
      return;
    }
    if (noeud && typeof noeud === "object") {
      for (const [cle, valeur] of Object.entries(noeud)) {
        if (DECLARATIFS.has(cle)) continue;
        parcours(valeur, chemin ? `${chemin}.${cle}` : cle);
      }
    }
  };
  parcours(fiche, "");
  return trouvees;
}

if (CONTROLE) {
  /* Un contrôle qu'on n'a pas vu échouer ne prouve rien. Les trois cas sains
     sont les trois faux pas payés, repris tels quels des fiches réelles. */
  const defaut = orphelines({
    contenu: { complement: [{ titre: "La situation", texte: "Le besoin posé par le site :" }] },
  });
  const sains = [
    // 1. la liste vit dans le bloc de l'annonce (8 fiches preuves-*)
    { contenu: { complement: [{ texte: "Le besoin posé par le site :", puces: [{ accroche: "A", texte: "b" }] }] } },
    // 2. la liste vit dans le bloc SUIVANT (/expertises/types-de-maintenance/)
    { contenu: { complementTypes: [{ texte: "Les quatre critères qui tranchent :" }, { puces: [{ accroche: "A" }] }] } },
    // 3. c'est un TABLEAU qui suit (maintenance-prédictive, -conditionnelle, -prévisionnelle)
    { contenu: { complementTypes: [{ texte: "Le tri entre quatre mots qu'on confond :" }, { tableau: { lignes: [] } }] } },
    // deux-points au milieu d'une phrase qui se poursuit
    { contenu: { complement: [{ texte: "Ce que couvre le technicien sur site : la participation aux actions." }] } },
    // un intitulé court, pas une annonce
    { contenu: { dispositif: [{ libelle: "Client :", valeur: "AUTOLIV" }] } },
    // une phrase entière
    { contenu: { complement: [{ texte: "Le parc machines est tenu, sans création de poste." }] } },
    // la phrase déclarée comme retirée ne doit pas être relue comme un défaut
    { trous: [{ ligne: "Le besoin posé par le site :", pourquoi: "essai" }] },
  ].flatMap((f) => orphelines(f));
  const verdicts = [
    ["une annonce sans matière, ni dans son bloc ni après, est vue", defaut.length === 1],
    ["c'est bien le champ qui est nommé", defaut[0]?.chemin === "contenu.complement[0].texte"],
    ["le titre du même bloc ne déclenche rien", !defaut.some((d) => d.texte.includes("situation"))],
    ["sept fiches saines ne déclenchent rien, dont les trois faux pas payés", sains.length === 0],
  ];
  for (const [quoi, ok] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
  if (!verdicts.every(([, ok]) => ok)) process.exit(1);
  console.log(`\ncontrôle positif conforme (${verdicts.length}/${verdicts.length})`);
}

/* NE BALAYER QUE SI ON EST APPELÉ DIRECTEMENT. Sans cette garde, un outil qui
   importe la fonction de détection déclenchait le balayage entier ET son
   `process.exit(1)` : `scripts/mesure-etat-migration.mjs` l'a fait, et la
   mesure se terminait par le verdict d'une autre porte. */
const appeleDirectement =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (!appeleDirectement) {
  // importé pour sa fonction de détection : rien à balayer.
} else {
const trouvailles = [];
const fichiers = readdirSync(FICHES).filter((f) => f.endsWith(".json"));
for (const entree of fichiers) {
  const fiche = JSON.parse(readFileSync(join(FICHES, entree), "utf8"));
  for (const o of orphelines(fiche)) trouvailles.push({ fiche: entree, ...o });
}

if (trouvailles.length > 0) {
  for (const t of trouvailles) {
    console.log(`\n${t.fiche} → ${t.chemin}`);
    console.log(`  annonce : « ${t.texte} »`);
  }
  console.log(
    `\n${trouvailles.length} annonce(s) sans annoncé dans ${new Set(trouvailles.map((t) => t.fiche)).size} fiche(s).\n` +
      `Remède : node scripts/retire-libelles-orphelins.mjs (retire le bloc et le déclare\n` +
      `dans son « trous » ; la liste annoncée est rendue ailleurs, en cartes).`,
  );
  process.exit(1);
}

console.log(`aucune annonce sans annoncé (${fichiers.length} fiches lues)`);
}
