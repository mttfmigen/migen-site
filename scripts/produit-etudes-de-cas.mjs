/**
 * Fabrique les 28 fichiers de données des études de cas, au gabarit du client.
 *
 *   node scripts/produit-etudes-de-cas.mjs --simulation   # n'écrit rien, dit tout
 *   node scripts/produit-etudes-de-cas.mjs                # écrit les 28 fichiers
 *
 * ENTRÉE  `supabase/import/fiches-analyse.json`, ce que le parseur a tiré du
 *         corpus rédigé de `../migen-refonte/seo/CONVERSION/Preuves/`.
 * SORTIE  `supabase/import/gabarits-maquette/preuves-<client>.json`, un par
 *         page, que `scripts/importe_rest.mjs` pose par l'API REST.
 *
 * POURQUOI UN SCRIPT ET PAS 28 FICHIERS ÉCRITS À LA MAIN. La correspondance
 * corpus -> gabarit est une RÈGLE, pas 28 décisions. Écrite une fois ici, elle
 * se relit, se discute et se rejoue ; recopiée 28 fois, elle dérive, et
 * personne ne peut dire quelle page a reçu quel traitement. C'est aussi ce qui
 * rend le contrôle possible : `scripts/verifie-article-etude.tsx` relit la
 * sortie et la maquette, pas les intentions de ce fichier.
 *
 * LA CORRESPONDANCE, champ du corpus -> section de `maquette/gabarit-02-etude-de-cas.html` :
 *
 *   chapeau        ->  01 Le client et le site        un paragraphe
 *   contexte       ->  02 La situation                paragraphes, puis la liste
 *                                                     à coches des lignes « **X** : Y »
 *   intervention   ->  03 Ce que nous avons mis en place   même découpage
 *   fiche[]        ->  04 Le dispositif               le tableau « Élément / Détail »
 *   resultats[]    ->  05 Le résultat                 la liste à coches,
 *                                                     `valeur` en accroche grasse
 *
 * LES TITRES DE SECTION VIENNENT DE LA MAQUETTE, pas de nous : ce sont ceux de
 * sa page témoin, l'étude de cas VEEPEE, qui est l'une de ces 28 pages. Les
 * en-têtes de colonne « Élément » et « Détail » aussi. Ce sont des libellés de
 * dessin, au même titre que « Sommaire » ou « Questions fréquentes ».
 *
 * CE QUI RESTE VIDE, ET POURQUOI.
 *
 *   « Le déroulé », quatrième section de la maquette, une frise d'étapes
 *   numérotées. Sa page témoin y range une chronologie — reprise du contrat,
 *   transition, déploiement, exécution, poursuite — qui est une RÉÉCRITURE de
 *   `intervention` dans l'ordre du temps. Le corpus ne porte pas cette
 *   chronologie : la fabriquer, c'est décider seul de l'ordre des faits d'un
 *   chantier client. La section ne se rend pas, et la numérotation se resserre.
 *
 *   La liste d'identité de la première section (« Client : … », « Périmètre : … »)
 *   reprend les trois premières lignes de `fiche[]` sous d'autres libellés. Le
 *   tableau de « Le dispositif » les porte toutes, avec les libellés du corpus.
 *   La rendre deux fois ferait deux fois le même texte sur une même page.
 *
 *   L'encadré orange de la première section renvoie au rayon des études de cas.
 *   C'est du maillage, et la route en pose déjà un, en cartes, sous la page.
 *
 *   Le visuel du héros, et l'appel final : aucune image, aucune phrase d'appel
 *   propre au cas dans le corpus.
 *
 * AUCUN TEXTE N'EST RÉÉCRIT NI RÉSUMÉ. Les chaînes du corpus passent telles
 * quelles, Markdown en ligne compris : `TexteRiche` le rend à l'affichage.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const ENTREE = join(RACINE, "supabase", "import", "fiches-analyse.json");
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");

const SIMULATION = process.argv.includes("--simulation");

/** Les titres de section, relevés dans la page témoin de la maquette. */
const TITRES = {
  client: "Le client et le site",
  situation: "La situation",
  dispositifMis: "Ce que nous avons mis en place",
  dispositif: "Le dispositif",
  resultat: "Le résultat",
};

/** Les en-têtes du tableau, relevés dans la maquette. */
const ENTETES_DISPOSITIF = ["Élément", "Détail"];

/**
 * Un texte du corpus devient des blocs.
 *
 * Le corpus écrit un bloc de texte en lignes séparées par `\n`. Deux formes y
 * cohabitent, et la maquette leur donne deux motifs :
 *
 *   « Une phrase. »                 ->  un paragraphe
 *   « **Une accroche** : la suite. » ->  un item de la liste à coches
 *
 * Les items CONSÉCUTIFS forment UNE SEULE liste, comme dans la maquette : une
 * carte de verre par groupe, pas une carte par item. Un paragraphe qui revient
 * après la liste ouvre un nouveau paragraphe, et un groupe d'items suivant
 * ouvrirait une seconde carte.
 */
function enBlocs(texte) {
  if (!texte) return [];
  const blocs = [];
  let liste = null;

  for (const ligne of texte.split("\n").map((l) => l.trim())) {
    if (!ligne) continue;
    // Une accroche grasse suivie de deux-points : c'est un item de liste. Le
    // `**` est conservé, `TexteRiche` le rend en gras comme la maquette.
    const estItem = /^\*\*[^*]+\*\*\s*:/.test(ligne);
    if (estItem) {
      if (!liste) {
        liste = { type: "liste", items: [] };
        blocs.push(liste);
      }
      liste.items.push(ligne);
      continue;
    }
    liste = null;
    blocs.push({ type: "paragraphe", texte: ligne });
  }

  return blocs;
}

/** `/preuves/veepee-sites-lyon/` devient `preuves-veepee-sites-lyon`. */
function nomFichier(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
}

/** « Le client et le site » devient « le-client-et-le-site ». */
function ancre(titre) {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Une section, ou `null` si le corpus ne l'alimente pas. */
function section(titre, blocs) {
  const utiles = blocs.filter((b) =>
    b.type === "liste"
      ? b.items.length > 0
      : b.type === "tableau"
        ? b.entetes.length > 0 && b.lignes.length > 0
        : !!b.texte,
  );
  if (utiles.length === 0) return null;
  return { id: ancre(titre), titre, blocs: utiles };
}

const corpus = JSON.parse(readFileSync(ENTREE, "utf8"));
if (!existsSync(SORTIE)) mkdirSync(SORTIE, { recursive: true });

let ecrits = 0;
const vides = [];

for (const entree of corpus) {
  const source = entree.contenu ?? {};
  if (source.gabarit !== "fiche") continue;

  const sections = [
    section(TITRES.client, enBlocs(source.chapeau)),
    section(TITRES.situation, enBlocs(source.contexte)),
    section(TITRES.dispositifMis, enBlocs(source.intervention)),
    section(TITRES.dispositif, [
      {
        type: "tableau",
        entetes: ENTETES_DISPOSITIF,
        lignes: (source.fiche ?? []).map((l) => [l.libelle, l.valeur]),
      },
    ]),
    /* `valeur` porte l'accroche, `libelle` la phrase qui l'explique : c'est
       l'inverse de ce que les noms suggèrent, et c'est ce que le corpus écrit.
       Rendus dans le motif de la liste à coches, accroche en gras. */
    section(
      TITRES.resultat,
      [
        {
          type: "liste",
          items: (source.resultats ?? []).map((r) =>
            r.libelle ? `**${r.valeur}** : ${r.libelle}` : `**${r.valeur}**`,
          ),
        },
      ],
    ),
  ].filter((s) => s !== null);

  const absentes = [
    TITRES.client,
    TITRES.situation,
    TITRES.dispositifMis,
    TITRES.dispositif,
    TITRES.resultat,
  ].filter((t) => !sections.some((s) => s.titre === t));
  if (absentes.length > 0) vides.push(`${entree.url} : ${absentes.join(", ")}`);

  const fichier = join(SORTIE, `${nomFichier(entree.url)}.json`);
  const charge = {
    url: entree.url,
    h1: entree.h1,
    contenu: { gabarit: "fiche", sections },
  };

  if (SIMULATION) {
    console.log(
      `${entree.url.padEnd(40)} ${String(sections.length).padStart(2)} sections, ` +
        `${sections.reduce((n, s) => n + s.blocs.length, 0)} blocs`,
    );
    continue;
  }

  writeFileSync(fichier, `${JSON.stringify(charge, null, 2)}\n`, "utf8");
  ecrits += 1;
}

if (SIMULATION) {
  console.log(`\n${corpus.length} études lues. Rien écrit.`);
} else {
  console.log(`${ecrits} fichier(s) écrit(s) dans supabase/import/gabarits-maquette/.`);
}

if (vides.length > 0) {
  console.log(`\nSections que le corpus n'alimente pas, et qui ne se rendront pas :`);
  for (const v of vides) console.log(`  ${v}`);
}
console.log(
  `\n« Le déroulé » n'est alimenté sur AUCUNE page : le corpus ne porte pas de ` +
    `chronologie, et elle ne s'invente pas. Voir l'en-tête de ce fichier.`,
);
