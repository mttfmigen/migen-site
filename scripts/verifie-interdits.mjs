/**
 * Les interdits de copie du contrat, cherchés dans TOUTE la copie du site.
 *
 *   node scripts/verifie-interdits.mjs
 *
 * POURQUOI CE CONTRÔLE EXISTE. Chaque gabarit porte déjà sa propre liste
 * d'interdits, appliquée au HTML qu'il rend. Ces listes cherchaient des mots,
 * jamais un CHIFFRE, et un compte de clients faux est passé dans l'en-tête, le
 * héros, la bande de logos, la frise et la bande de chiffres. Le compte validé
 * par le client est « +200 clients », sans jamais préciser « réguliers » : ce
 * sont donc « clients réguliers » et « dont plus de 80 réguliers » qui sont
 * cherchés ici.
 *
 * Ce contrôle-ci ne rend rien : il lit la SOURCE. C'est ce qui lui permet de
 * voir la copie des composants qu'aucun contrôle de rendu ne monte, et c'est
 * pour cela qu'il complète les autres au lieu de les remplacer.
 *
 * IL LIT AUSSI LES FICHES DE CONTENU, et c'est une correction du 08/10 : il ne
 * lisait que `components/`, `app/` et `lib/`, c'est-à-dire le code. Or la copie
 * du site ne vit pas dans le code, elle vit dans
 * `supabase/import/gabarits-maquette/*.json`. « 24/24 et 7/7 » était donc
 * VISIBLE sur huit pages d'offre pendant que ce contrôle annonçait « copie
 * conforme » : les motifs étaient justes, ils ne regardaient simplement pas au
 * bon endroit. Les fiches sont du contenu rédigé, pas du code : leurs champs
 * `_reference` portent la provenance du portage et citent donc parfois la
 * formulation écartée, exactement comme les commentaires du code. Ils sont
 * ignorés pour la même raison.
 *
 * Il vérifie enfin la FORME des mentions. `copieConforme` retire d'un texte
 * toute phrase portant un interdit ; appliquée à la main pendant le portage,
 * elle a laissé quatre mentions estropiées (« , du lundi au vendredi… », sans
 * sa proposition initiale, rendue telle quelle dans quatre blocs par page).
 * Une phrase qui commence par une virgule est le reste d'un retrait, pas une
 * phrase : le contrôle la refuse.
 *
 * LES COMMENTAIRES SONT RETIRÉS AVANT LA RECHERCHE, et c'est nécessaire : le
 * code explique en commentaire pourquoi il s'écarte de la maquette, donc il
 * cite les formulations interdites. Un contrôle qui ne saurait pas distinguer
 * l'explication de la copie forcerait à effacer les explications.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));

/** Chaque interdit, avec ce qu'il faut écrire à la place. */
const INTERDITS = [
  // Chiffres faux ou interdits.
  // Règle validée par le client (passation, README) : « +200 clients, sans
  // jamais préciser « réguliers » ». « +200 » est donc juste ; c'est l'ancien
  // compte, « dont plus de 80 réguliers », qui est faux deux fois.
  [/\bclients\s+r[ée]guliers\b/u, "« +200 clients », sans jamais préciser « réguliers »"],
  [/\b80\s+r[ée]guliers\b/u, "« +200 clients », sans jamais préciser « réguliers »"],
  /* Les deux formulations que la maquette écrit RÉELLEMENT, et que le motif
     ci-dessus ne couvrait pas : « dont plus de 80 en contrat régulier » et
     « dont plus de 80 de manière régulière ». Le trou se voyait dès qu'on
     cherchait dans la maquette plutôt que dans le site. Il n'y a rien à
     corriger aujourd'hui, c'est un garde-fou contre un re-portage. */
  [/\b80\s+(?:en\s+contrat|de\s+mani[èe]re)\s+r[ée]guli[èe]re?\b/u, "« +200 clients », sans jamais préciser « réguliers »"],
  ["5 agences", "quatre agences : Lyon siège, Montréal, Dubaï, Madrid"],
  ["Cinq agences", "quatre agences"],
  ["cinq agences", "quatre agences"],
  // Délais chiffrés d'intervention : seul « rappel dans l'heure » est autorisé.
  ["sous 24 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["sous 48 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["sous 2 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["sous 4 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["sous 72 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["h de route", "aucun délai ni distance chiffrés"],
  ["heures de route", "aucun délai ni distance chiffrés"],
  // Passation, règles validées par le client : « Aucune mention 24h/24, 7j/7
  // ou « 24h », nulle part ». Motifs et non chaînes : l'espace varie (aucune,
  // ordinaire, insécable U+00A0 ou fine U+202F, toutes couvertes par \s), et
  // la lettre aussi (« 24/24 et 7/7 » dit la même chose que « 24h/24, 7j/7 »).
  [/\b24\s*h?\s*\/\s*(?:24|7)\b/u, "aucune mention de disponibilité 24h/24, à retirer"],
  [/\b7\s*j?\s*\/\s*7\b/u, "aucune mention 7j/7, à retirer"],
  // « 24h » ou « 24 h » comme mot isolé : pas « 24 heures », pas « 24h/24 »
  // (déjà signalé ci-dessus), pas « 124 h ».
  [/\b24\s*h(?![\p{L}\d]|\s*\/)/u, "aucune mention « 24h », à retirer"],
  // Vocabulaire proscrit.
  ["régie", "« résidence » ou « technicien sur site »"],
  ["intérim", "nommer la prestation, jamais le statut"],
  ["mise à disposition", "« intervention » ou « mission »"],
  ["sans engagement", "dire la durée réelle, ou ne rien dire"],
  ["clé en main", "dire ce qui est fait"],
  ["sur mesure", "dire ce qui s'adapte, et à quoi"],
  ["levier", "dire l'effet obtenu"],
  ["concrètement", "à supprimer, le paragraphe suivant le dit déjà"],
  ["notamment", "à supprimer, ou « dont »"],
  ["incontournable", "à supprimer"],
  ["découvrez", "un verbe qui dit ce que la page fait"],
  ["Découvrez", "un verbe qui dit ce que la page fait"],
  // Mehdi, 16/10, question 5 : « prix mensuel fixe », « Tu ne mets pas ».
  ["prix mensuel fixe", "ne rien annoncer du prix : le chiffrage se remet avec le devis"],
  /* Mehdi, 16/10 au soir : « L'agence est à Ecully, siège à Limonest » (la
     décision du 09/10, rétablie après celle du matin). Une phrase qui place le
     siège à Écully est fausse ; « siège à Limonest et bureaux à Écully » passe.
     Même motif que SIEGE_A_ECULLY de lib/decisions-copie.ts, recopié parce que
     ce contrôle tourne sous node, qui ne lit pas le TypeScript. */
  [/[Ss]i[èe]ge(?:(?!Limonest)[^.;!?<>]){0,60}?(?:[ÉE]cully|Moulin Carron)/u, "le siège est à Limonest, 1 rue des Vergers, 69760 Limonest ; Écully est l'agence"],
  // Typographie.
  ["—", "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
];

/* LA COPIE JURIDIQUE DU CLIENT, reprise MOT POUR MOT (14/10) : les CGV de
   Migen Service, auxquelles renvoient les devis. Un contrat ne se réécrit pas
   pour la charte : « notamment », « sur mesure », « mise à disposition » et
   les montants y sont le texte signé. Seule la typographie s'y applique, et
   plus strictement qu'ailleurs : ni cadratin ni demi-cadratin. */
const COPIE_JURIDIQUE = new Set(["app/cgv/texte.ts"]);
const TYPOGRAPHIE = [
  ...INTERDITS.filter(([motif]) => motif === "—"),
  ["–", "virgule ou deux-points, jamais de tiret demi-cadratin dans le texte juridique"],
];

/* `/assets/...—...` n'existe pas, mais une URL ou un nom de fichier pourrait
   contenir une suite interdite sans être de la copie. Les lignes d'import et
   les chemins sont donc ignorés. */
const IGNOREES = [/^\s*import\s/, /^\s*\/\/\//];

function fichiers(dossier) {
  const trouves = [];
  for (const entree of readdirSync(dossier)) {
    if (entree === "node_modules" || entree.startsWith(".")) continue;
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) {
      trouves.push(...fichiers(chemin));
    } else if (/\.(tsx?|mdx?)$/.test(entree) && !/verif|verifie/.test(entree)) {
      trouves.push(chemin);
    }
  }
  return trouves;
}

/** Retire les commentaires, en gardant les numéros de ligne. */
function sansCommentaires(source) {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, (bloc) => bloc.replace(/[^\n]/g, " "))
    .replace(/\/\*[\s\S]*?\*\//g, (bloc) => bloc.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, (ligne, avant) => avant);
}

/* LES LITTÉRAUX D'EXPRESSION RÉGULIÈRE NE SONT PAS DE LA COPIE (14/10).
   `lib/decisions-copie.ts` porte des règles qui RETIRENT un interdit du texte
   servi : leur motif cite donc le mot, `/(conçues) sur mesure/gi`, exactement
   comme un commentaire l'explique. Le chercher là retournait le contrôle contre
   la règle qui fait le travail. Le corps du motif est blanchi, rien d'autre :
   le texte de REMPLACEMENT, lui, est une chaîne servie et reste contrôlé.
   Un `/` ne commence un motif qu'après un signe qui interdit la division
   (`=`, `(`, `,`, `[`, `:`, `!`, `&`, `|`, `?`, `;`, ou `return`).
   Relecture adverse du 14/10 : ces signes se lisent aussi dans du TEXTE
   (« Tarif : / sur mesure / jour », « Accès (/ sur mesure /) »), et le mot y
   était blanchi. Un motif n'est donc reconnu que s'il porte un drapeau
   (`/…/gi`) ou un signe d'expression régulière (`(`, `\`, `[`, `^`, `$`, `|`,
   `?`, `*`, `+`, `{`). Un motif nu comme `/sur mesure/` reste contrôlé : faux
   positif possible, jamais un faux négatif. */
const LITTERAL_REGEX =
  /(^|[=(,[:!&|?;]|\breturn)(\s*)\/(?![/*])((?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+)\/([dgimsuyv]*)/g;
const SIGNE_DE_MOTIF = /[()\\[\]^$|?*+{}]/;
function sansMotifs(ligne) {
  return ligne.replace(LITTERAL_REGEX, (tout, avant, blanc, corps, drapeaux) =>
    drapeaux || SIGNE_DE_MOTIF.test(corps)
      ? `${avant}${blanc}/${" ".repeat(corps.length)}/${drapeaux}`
      : tout,
  );
}

/** Les interdits que porte une ligne de code, une fois motifs blanchis. */
function interditsDeLaLigne(ligne, regles) {
  const lue = sansMotifs(ligne);
  return regles.flatMap(([motif, remede]) => {
    // Une chaîne se cherche telle quelle, un motif rend le fragment trouvé.
    const interdit = typeof motif === "string" ? lue.includes(motif) && motif : lue.match(motif)?.[0];
    return interdit ? [{ interdit, remede }] : [];
  });
}

/* TÉMOIN : la porte attrape TOUJOURS « sur mesure » dans une chaîne, y compris
   le texte de remplacement d'une règle, et l'ignore dans le seul motif. */
const temoin = (ligne) => interditsDeLaLigne(ligne, INTERDITS).map((t) => t.interdit);
const attendus = [
  [`const titre = "Des pièces conçues sur mesure";`, ["sur mesure"]],
  [`const R = [[/(conçues) sur mesure/gi, (_m, c) => \`\${c} en interne\`]];`, []],
  [`const R = [[/(conçues) en interne/gi, () => "conçues sur mesure"]];`, ["sur mesure"]],
  [`<p>Une offre sur mesure</p>`, ["sur mesure"]],
  [`const x = a / b; const y = "sur mesure";`, ["sur mesure"]],
  // Du texte qui ressemble à un motif après « : » ou « ( » reste contrôlé.
  [`<p>Tarif : / sur mesure / jour</p>`, ["sur mesure"]],
  [`const t = "Accès (/ sur mesure /)";`, ["sur mesure"]],
  [`<p>Options : /sur mesure/ ou standard</p>`, ["sur mesure"]],
  // Le siège : à Écully dans une chaîne, il tombe ; la phrase de la maquette passe.
  [`const SIEGE = "Siège, Écully";`, ["Siège, Écully"]],
  [`<p>Notre siège est à Lyon (Écully), et nos hubs</p>`, ["siège est à Lyon (Écully"]],
  [`<p>Lyon, siège à Limonest et bureaux à Écully</p>`, []],
];
for (const [ligne, attendu] of attendus) {
  const lu = temoin(ligne);
  if (JSON.stringify(lu) !== JSON.stringify(attendu)) {
    console.error(`TÉMOIN ROUGE : ${ligne}\n  attendu ${JSON.stringify(attendu)}, lu ${JSON.stringify(lu)}`);
    process.exit(2);
  }
}

const trouvailles = [];
for (const chemin of [
  ...fichiers(join(RACINE, "components")),
  ...fichiers(join(RACINE, "app")),
  ...fichiers(join(RACINE, "lib")),
]) {
  const lignes = sansCommentaires(readFileSync(chemin, "utf8")).split("\n");
  const regles = COPIE_JURIDIQUE.has(relative(RACINE, chemin)) ? TYPOGRAPHIE : INTERDITS;
  lignes.forEach((ligne, i) => {
    if (IGNOREES.some((motif) => motif.test(ligne))) return;
    for (const { interdit, remede } of interditsDeLaLigne(ligne, regles)) {
      trouvailles.push({
        ou: `${relative(RACINE, chemin)}:${i + 1}`,
        interdit,
        remede,
        ligne: ligne.trim().slice(0, 100),
      });
    }
  });
}

/* LA COPIE RÉDIGÉE. Une fiche par page, et c'est elle que le visiteur lit.
   `blog-repris` : les billets de l'ancien blog, servis par le même relais
   disque (`lib/contenu.ts`, DOSSIERS_DU_RELAIS). */
const FICHES = ["gabarits-maquette", "blog-repris"].flatMap((dossier) =>
  readdirSync(join(RACINE, "supabase", "import", dossier))
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(RACINE, "supabase", "import", dossier, f)),
);

/* Les champs qui DÉCLARENT un écart au lieu de le rendre. Ils doivent citer
   la formulation écartée, c'est leur raison d'être : `verification-ressource`
   et `verification-editorial` relisent ces listes pour vérifier l'ABSENCE de
   ces phrases du rendu. Les chercher ici retournerait le contrôle contre les
   contrôles, comme le ferait une recherche dans les commentaires du code. */
const DECLARATIFS = new Set(["_reference", "retraits", "phrases_retirees", "trous"]);

/** Chaque chaîne de la fiche, avec son chemin, les déclaratifs écartés. */
function chaines(valeur, chemin = "") {
  if (typeof valeur === "string") return [[chemin, valeur]];
  if (Array.isArray(valeur)) return valeur.flatMap((v, i) => chaines(v, `${chemin}[${i}]`));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([cle, v]) =>
      DECLARATIFS.has(cle) ? [] : chaines(v, chemin ? `${chemin}.${cle}` : cle),
    );
  }
  return [];
}

for (const cheminFiche of FICHES) {
  const fiche = JSON.parse(readFileSync(cheminFiche, "utf8"));
  for (const [chemin, texte] of chaines(fiche)) {
    for (const [motif, remede] of INTERDITS) {
      const interdit =
        typeof motif === "string" ? texte.includes(motif) && motif : texte.match(motif)?.[0];
      if (interdit) {
        trouvailles.push({
          ou: `${relative(RACINE, cheminFiche)} → ${chemin}`,
          interdit,
          remede,
          ligne: texte.trim().slice(0, 100),
        });
      }
    }
  }

  /* La mention se rend seule, dans son propre paragraphe : elle doit donc être
     une phrase entière. Vérifié le 08/10 sur le HTML servi, quatre fois par
     page (`<p style="font:400 13.5px/1.6 …">`). */
  const mention = fiche?.contenu?.mention;
  if (typeof mention === "string" && mention.trim()) {
    const defaut = /^\s*[,.;:]/.test(mention)
      ? "commence par une ponctuation : reste d'une phrase retirée"
      : !/[.!?]\s*$/.test(mention)
        ? "sans point final"
        : undefined;
    if (defaut) {
      trouvailles.push({
        ou: `${relative(RACINE, cheminFiche)} → contenu.mention`,
        interdit: defaut,
        remede: "la phrase entière du corpus, proposition initiale et point final compris",
        ligne: mention.trim().slice(0, 100),
      });
    }
  }
}

if (trouvailles.length > 0) {
  for (const t of trouvailles) {
    console.error(`${t.ou}\n  interdit : « ${t.interdit} »\n  à la place : ${t.remede}\n  ${t.ligne}\n`);
  }
  console.error(`${trouvailles.length} formulation(s) interdite(s) dans la copie.`);
  process.exit(1);
}

/* LES FICHIERS D'IMPORT SQL, POUR LE SEUL SIÈGE (16/10). Le site ne les rend
   pas : la fiche du relais l'emporte. Rejoués, ils remettraient en base un
   siège à Écully. Seul le siège y est cherché : ces fichiers sont l'ancien
   corpus, que ce contrôle n'a jamais lu pour les autres interdits. */
const SIEGE_SQL = INTERDITS.filter(([motif]) => motif instanceof RegExp && motif.source.includes("Limonest"));
const IMPORT = join(RACINE, "supabase", "import");
const FICHIERS_SQL = readdirSync(IMPORT, { recursive: true }).filter((f) => f.endsWith(".sql"));
for (const f of FICHIERS_SQL) {
  readFileSync(join(IMPORT, f), "utf8")
    .split("\n")
    .forEach((ligne, i) => {
      for (const [motif, remede] of SIEGE_SQL) {
        const interdit = ligne.match(motif)?.[0];
        if (interdit) {
          trouvailles.push({ ou: `supabase/import/${f}:${i + 1}`, interdit, remede, ligne: interdit.slice(0, 100) });
        }
      }
    });
}

if (trouvailles.length > 0) {
  for (const t of trouvailles) {
    console.error(`${t.ou}\n  interdit : « ${t.interdit} »\n  à la place : ${t.remede}\n  ${t.ligne}\n`);
  }
  console.error(`${trouvailles.length} formulation(s) interdite(s) dans la copie.`);
  process.exit(1);
}

const nbFiches = FICHES.length;
console.log(
  `copie conforme aux interdits du contrat (code + ${nbFiches} fiches de contenu, siège dans ${FICHIERS_SQL.length} fichiers SQL d'import)`,
);
