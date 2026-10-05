/**
 * Produit la donnée des 13 fiches MÉTIER au gabarit de la maquette.
 *
 *   node scripts/produit-metier-maquette.mjs
 *
 * CE QUE CE SCRIPT RÉSOUT. Les pages de `/carriere/` sont servies par le
 * gabarit ÉDITORIAL : une colonne de texte, un sommaire, rien de la fiche
 * métier que la maquette dessine. Le composant, lui, existe depuis le début
 * (`components/site/metier/PageMetier.tsx`) : il ne manquait que la donnée au
 * bon format, parce que `app/[...slug]/page.tsx` tranche sur la forme de
 * `pages.contenu` et que ces pages portent encore `blocs`.
 *
 * LA RÈGLE QU'IL APPLIQUE, et il n'en applique pas d'autre :
 *   le DESSIN vient de la maquette, le TEXTE vient du corpus, rien ne s'invente.
 *
 * D'OÙ VIENT CHAQUE CHOSE.
 *
 *   · Le mobilier du gabarit (le libellé des deux boutons du héros, la question
 *     et le rappel de la carte de fin) est RELU dans `maquette/accueil-rendu.html`
 *     à chaque exécution, jamais écrit de mémoire. Si la maquette change, la
 *     donnée change avec elle.
 *   · Tout le texte éditorial vient de `supabase/import/editorial-analyse.json`,
 *     c'est-à-dire des fichiers Markdown rédigés du client
 *     (`../migen-refonte/seo/contenus/07-metiers/*.md`).
 *   · Les pastilles « Autres métiers » listent les huit fiches qui existent
 *     réellement, avec leur `titre_h1` de la base. Aucun libellé inventé.
 *
 * CE QUI EST CONSOMMÉ ET CE QUI RESTE. Les sections de la maquette prennent des
 * LIBELLÉS COURTS : c'est ce qu'elle dessine, une liste cochée et deux rangées
 * de pastilles. Elles reprennent donc l'accroche des listes du corpus, et le
 * corpus RESTE ENTIER dans `corps`, rendu sous elles. Deux blocs seulement sont
 * déplacés, pas dupliqués : le premier paragraphe devient le chapeau du héros
 * (c'est sa fonction), et la dernière citation, qui n'est qu'un lien d'appel à
 * l'action, devient le second bouton du héros.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");

/* ------------------------------------------- le mobilier, relu dans la maquette */

/** Le gabarit métier de la maquette : de `sc-if isMetier` au `</sc-if>` suivant. */
export function blocMaquette() {
  const html = readFileSync(join(RACINE, "maquette", "accueil-rendu.html"), "utf8");
  const debut = html.indexOf('<sc-if value="{{ isMetier }}"');
  if (debut < 0) throw new Error("maquette : le gabarit isMetier est introuvable");
  const fin = html.indexOf("</sc-if>", debut);
  return html.slice(debut, fin);
}

/**
 * Les entités HTML de la maquette, rendues en caractères.
 *
 * `&nbsp;` devient une VRAIE espace insécable, pas une espace ordinaire : la
 * maquette écrit « votre site&nbsp;? », et c'est de la typographie française,
 * pas un détail d'encodage. Les suites d'espaces sont donc resserrées sur
 * `[ \t\n\r]` seulement et jamais sur `\s`, qui en JavaScript avale aussi
 * l'insécable et effacerait ce qu'on vient de poser.
 */
export function decode(texte) {
  return texte
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t\n\r]+/g, " ")
    .trim();
}

/** Les quatre libellés que la maquette fixe et que le corpus ne fournit pas. */
export function mobilier(bloc) {
  const boutons = [...bloc.matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map((m) => decode(m[1]));
  const h2 = bloc.match(/<h2\b[^>]*>([^<]+)<\/h2>/);
  // Le paragraphe de la carte de fin : celui qui suit ce H2.
  const apres = h2 ? bloc.slice(bloc.indexOf(h2[0]) + h2[0].length) : "";
  const p = apres.match(/<p\b[^>]*>([^<]+)<\/p>/);

  if (boutons.length < 2 || !h2 || !p) {
    throw new Error("maquette : mobilier du gabarit métier incomplet");
  }
  return {
    // Le premier bouton du héros. Le second de la maquette part vers un domaine
    // externe, que `cible()` refuse : il est remplacé par l'appel à l'action
    // interne que le corpus écrit lui-même en fin de page.
    heros: boutons[0],
    question: decode(h2[1]),
    rappel: decode(p[1]),
    // Le dernier `<a>` du bloc est celui de la carte de fin.
    action: boutons[boutons.length - 1],
  };
}

/* ------------------------------------------------------------------- le corpus */

/** Les 13 fiches servies par ce gabarit, dans l'ordre de l'arborescence. */
const FICHES = [
  "/carriere/agent-de-maintenance/",
  "/carriere/alternance/",
  "/carriere/automaticien/",
  "/carriere/automaticien/salaire/",
  "/carriere/electromecanicien/",
  "/carriere/electromecanicien/competences/",
  "/carriere/electromecanicien/salaire/",
  "/carriere/responsable-maintenance/",
  "/carriere/roboticien/",
  "/carriere/technicien-de-maintenance/",
  "/carriere/technicien-de-maintenance/formation/",
  "/carriere/technicien-de-maintenance/salaire/",
  "/carriere/technicien-itinerant/",
];

/** Les huit fiches de métier, pour les pastilles « Autres métiers ». */
const METIERS = [
  ["/carriere/technicien-de-maintenance/", "Technicien de maintenance"],
  ["/carriere/electromecanicien/", "Électromécanicien"],
  ["/carriere/automaticien/", "Automaticien"],
  ["/carriere/roboticien/", "Roboticien"],
  ["/carriere/responsable-maintenance/", "Responsable maintenance"],
  ["/carriere/agent-de-maintenance/", "Agent de maintenance industrielle"],
  ["/carriere/technicien-itinerant/", "Technicien de maintenance itinérant"],
  ["/carriere/alternance/", "Alternance maintenance industrielle"],
];

/**
 * Le titre de niveau 2 qui ouvre les missions.
 *
 * Trois formulations dans le corpus : « Ce que fait un X au quotidien » sur les
 * fiches de métier, « Le métier et ses missions » sur la page de compétences,
 * « Le métier auquel prépare la formation » et « Le métier derrière le salaire »
 * sur les sous-pages.
 */
const H2_MISSIONS = /^(ce que fait|le métier\b)/i;

/** Le premier tableau ou la première liste qui suit l'indice donné. */
function matiere(blocs, depuis) {
  for (let i = depuis + 1; i < blocs.length; i += 1) {
    const b = blocs[i];
    if (b.type === "titre") return null; // section suivante, rien trouvé
    if (b.type === "liste") return b.items.map((it) => it.accroche ?? it.texte);
    // La première colonne d'un tableau porte l'entrée de lecture : ce sont
    // exactement les libellés courts que la maquette met en pastilles.
    if (b.type === "tableau") return b.lignes.map((l) => l[0]);
  }
  return null;
}

/** La matière de la première section dont le H2 satisfait `predicat`. */
function section(blocs, predicat) {
  for (let i = 0; i < blocs.length; i += 1) {
    const b = blocs[i];
    if (b.type !== "titre" || b.niveau !== 2) continue;
    if (!predicat(b.texte)) continue;
    const trouve = matiere(blocs, i);
    if (trouve && trouve.length > 0) return trouve;
  }
  return undefined;
}

/**
 * Les formulations du corpus que le contrat interdit, et ce qui les remplace.
 *
 * LES INTERDITS GAGNENT, même contre le corpus rédigé : ce sont des règles de
 * marque, pas des préférences de style. Les corrections sont DÉCLARÉES ici,
 * avec l'avant et l'après, et rejouées à chaque exécution : rien n'est corrigé
 * à la main dans un fichier, où la correction serait invisible et se perdrait à
 * la prochaine analyse du corpus.
 *
 * Une seule occurrence dans les 13 fiches : l'en-tête d'un tableau de la page
 * « salaire électromécanicien ». La colonne liste des secteurs, des bassins et
 * des tailles d'entreprise ; « Ce qui fait la différence » les couvre tous, et
 * c'est le vocabulaire des deux autres tableaux de la même page.
 */
const CORRECTIONS = [["Levier", "Ce qui fait la différence"]];

/** Les corrections, appliquées à toute chaîne du corpus. */
function corrige(valeur, journal) {
  if (typeof valeur === "string") {
    let texte = valeur;
    for (const [avant, apres] of CORRECTIONS) {
      if (texte === avant || texte.includes(avant)) {
        journal.push(`« ${avant} » → « ${apres} »`);
        texte = texte.split(avant).join(apres);
      }
    }
    return texte;
  }
  if (Array.isArray(valeur)) return valeur.map((x) => corrige(x, journal));
  if (valeur && typeof valeur === "object") {
    return Object.fromEntries(
      Object.entries(valeur).map(([k, v]) => [k, corrige(v, journal)]),
    );
  }
  return valeur;
}

/** `[libellé](/chemin/)` seul, et rien d'autre, dans un bloc de citation. */
function lienSeul(bloc) {
  if (!bloc || bloc.type !== "citation") return null;
  const m = /^\[([^\]]+)\]\((\/[^)]*)\)$/.exec(bloc.texte.trim());
  return m ? { libelle: m[1], href: m[2] } : null;
}

export function fiche(entree, meubles) {
  const interdits = [];
  // Les interdits de copie sont levés AVANT toute extraction : sans quoi une
  // formulation corrigée dans le corps resterait fautive dans la pastille qui
  // en reprend l'accroche.
  const blocs = corrige([...entree.contenu.blocs], interdits);
  const manques = [];

  // Le chapeau du héros : le premier paragraphe, qui dit ce que la page couvre.
  // DÉPLACÉ, pas copié : il sort de `corps`.
  let chapeau;
  if (blocs[0]?.type === "paragraphe" && !blocs[0].accroche) {
    chapeau = blocs.shift().texte;
  } else {
    manques.push("chapeau : le premier bloc du corpus n'est pas un paragraphe");
  }

  // Le second bouton du héros : l'appel à l'action que le corpus écrit en
  // dernier, « [Candidater chez Migen](/contact/) ». DÉPLACÉ aussi.
  const candidature = lienSeul(blocs[blocs.length - 1]);
  if (candidature) blocs.pop();
  else manques.push("second bouton : le corpus ne finit pas par un lien seul");

  const missions = section(blocs, (t) => H2_MISSIONS.test(t.trim()));
  const competences = section(blocs, (t) => /compétence/i.test(t));
  const habilitations = section(
    blocs,
    (t) => /habilitation/i.test(t) && !/compétence/i.test(t),
  );

  if (!missions) manques.push("missions : aucun H2 « ce que fait… » ni « le métier… »");
  if (!competences) manques.push("compétences : aucun H2 qui porte « compétence »");
  if (!habilitations) manques.push("habilitations : aucun H2 qui porte « habilitation »");

  const contenu = {
    gabarit: "metier",
    ...(chapeau ? { chapeau } : {}),
    boutons: [
      // Sans `href` : `cible()` vise l'ancre du formulaire de bas de page.
      { libelle: meubles.heros },
      ...(candidature ? [candidature] : []),
    ],
    ...(missions ? { missions } : {}),
    ...(competences ? { competences } : {}),
    ...(habilitations ? { habilitations } : {}),
    autres: METIERS.filter(([href]) => href !== entree.url).map(([href, libelle]) => ({
      libelle,
      href,
    })),
    cta: {
      question: meubles.question,
      rappel: meubles.rappel,
      bouton: { libelle: meubles.action },
    },
    corps: blocs,
  };

  return { contenu, manques, interdits };
}

/* ----------------------------------------------------------------- exécution */

/* `fileURLToPath` et non une comparaison de chaînes : le projet vit sous un
   chemin qui contient une espace, que `import.meta.url` encode en `%20`. */
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const meubles = mobilier(blocMaquette());
  const corpus = new Map(
    JSON.parse(
      readFileSync(join(RACINE, "supabase", "import", "editorial-analyse.json"), "utf8"),
    ).map((e) => [e.url.endsWith("/") ? e.url : `${e.url}/`, e]),
  );

  console.log("Mobilier relu dans la maquette :");
  for (const [k, v] of Object.entries(meubles)) console.log(`  ${k.padEnd(10)} ${v}`);
  console.log();

  for (const url of FICHES) {
    const entree = corpus.get(url);
    if (!entree) {
      console.error(`  ${url} : absente de editorial-analyse.json`);
      continue;
    }
    const { contenu, manques, interdits } = fiche(entree, meubles);
    const nom = `${url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`;
    writeFileSync(
      join(SORTIE, nom),
      `${JSON.stringify({ url, h1: entree.h1, mot_cle: entree.mot_cle ?? null, contenu }, null, 1)}\n`,
    );
    console.log(
      `${url.padEnd(48)} ${String(contenu.corps.length).padStart(2)} blocs de corps, ` +
        `${contenu.missions?.length ?? 0} missions, ${contenu.competences?.length ?? 0} compétences, ` +
        `${contenu.habilitations?.length ?? 0} habilitations` +
        (manques.length ? `\n   vide : ${manques.join(" ; ")}` : "") +
        (interdits.length ? `\n   interdit corrigé : ${[...new Set(interdits)].join(" ; ")}` : ""),
    );
  }
  console.log(`\n${FICHES.length} fichiers dans supabase/import/gabarits-maquette/`);
}
