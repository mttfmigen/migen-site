/**
 * Contrôle du contenu de gabarit EXPERTISES composé depuis la maquette, contre
 * le contrat de `types/expertises.ts`, l'inventaire des URL et le SQL découpé.
 *
 *   bun scripts/verifie-contenu-expertises.ts
 *
 * POURQUOI, comme `verifie-contenu.ts` : le contenu part dans un `jsonb`, et
 * rien entre le JSON composé et les composants qui le lisent ne vérifie que les
 * deux parlent de la même forme. Ici s'ajoutent trois risques propres à une
 * recopie de maquette : un interdit de copie recopié tel quel, un lien vers une
 * page qui n'existe pas, et un découpage SQL qui ne reconstruirait pas le même
 * contenu. Les trois sont vérifiés, et le contrôle des interdits est éprouvé
 * contre un contrôle positif (les phrases d'origine de la maquette doivent le
 * faire tomber) : une absence qu'on n'a pas vue échouer ne prouve rien.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { CONTENU_EXPERTISES } from "@/components/site/expertises/expertises-donnees";
import type { ContenuExpertises } from "@/types/expertises";
import { estExpertises } from "@/types/expertises";

const SOURCE = "supabase/import/gabarits-maquette.json";
const DOSSIER = "supabase/import/gabarits";
const INVENTAIRE = "docs/urls-site-actuel.json";
/** Octets par ligne, saut de ligne compris, comme `wc -c`. Voir decoupe_sql.py. */
const PLAFOND = 3800;

/** Ancres que le gabarit pose lui-même : la seule cible autorisée hors inventaire. */
const ANCRES = new Set(["#formulaire", "#types", "#domaines"]);

/** Interdits de copie du contrat, à chercher sur un texte en minuscules. */
const INTERDITS = [
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "levier",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "5 agences",
  "cinq agences",
  // « +200 clients », sans jamais préciser « réguliers » : règle validée par le
  // client (design_handoff_migen_site/README.md). « +200 » est exigé plus bas
  // là où la capture le porte.
  "clients réguliers",
  "80 réguliers",
];

/**
 * « +200 » EST EXIGÉ LÀ OÙ LA CAPTURE LE PORTE (`maquette/rendu/<clé>.html`, en
 * texte visible), SAUF exception nommée et vérifiée des deux côtés.
 *
 * `/expertises/` : la capture pose « +200 » dans la bande de trois chiffres
 * sous le formulaire du héros (« + 120 », « +200 », « 10 % »). Le contenu ne
 * porte PAS CETTE BANDE DU TOUT, ses deux autres chiffres compris : le hub est
 * resté sur un dessin antérieur à la capture. Ce n'est pas l'ancienne règle,
 * c'est un portage à reprendre. L'exception tombe, et le dit, le jour où la
 * bande est portée.
 */
const BANDE_NON_PORTEE = new Map([["/expertises/", "Collaborateurs, depuis 4 agences"]]);
/** Un délai chiffré : « 24 h », « 2 h », « 48 heures », « 3 jours ». */
const DELAI_CHIFFRE = /\b\d+\s?(?:h|heures?|min(?:utes?)?|jours?)\b/u;

type Dict = Record<string, unknown>;

const estObjet = (v: unknown): v is Dict =>
  !!v && typeof v === "object" && !Array.isArray(v);
const chaine = (v: unknown, ou: string): void =>
  assert.ok(typeof v === "string" && v.length > 0, `${ou} : chaîne non vide attendue`);
const chaineOuAbsente = (v: unknown, ou: string): void => {
  if (v !== undefined) chaine(v, ou);
};
const booleenOuAbsent = (v: unknown, ou: string): void => {
  if (v !== undefined) assert.equal(typeof v, "boolean", `${ou} : booléen attendu`);
};
function liste(v: unknown, ou: string, element: (x: Dict, ou: string) => void): void {
  assert.ok(Array.isArray(v) && v.length > 0, `${ou} : tableau non vide attendu`);
  v.forEach((x, i) => {
    assert.ok(estObjet(x), `${ou}[${i}] : objet attendu`);
    element(x, `${ou}[${i}]`);
  });
}
function listeDeChaines(v: unknown, ou: string): void {
  assert.ok(Array.isArray(v) && v.length > 0, `${ou} : tableau non vide attendu`);
  v.forEach((x, i) => chaine(x, `${ou}[${i}]`));
}
function entete(v: unknown, ou: string): void {
  assert.ok(estObjet(v), `${ou} : objet EnTeteSection attendu`);
  chaine(v.surtitre, `${ou}.surtitre`);
  chaine(v.titre, `${ou}.titre`);
  chaineOuAbsente(v.note, `${ou}.note`);
}

// ------------------------------------------------------- la forme, champ par champ
// Chaque champ du type est vérifié ; un champ inconnu est refusé, parce que le
// gabarit l'ignorerait en silence et que c'est le signe d'une faute de frappe.
function clesConnues(v: Dict, ou: string, connues: string[]): void {
  for (const k of Object.keys(v)) {
    assert.ok(connues.includes(k), `${ou}.${k} : champ inconnu du type`);
  }
}

function verifieForme(c: Dict): void {
  clesConnues(c, "contenu", [
    "gabarit", "surtitre", "chapeau", "actions", "cumul", "types", "dosage",
    "domaines", "constructeurs", "secteurs", "habilitations", "formulaire",
  ]);
  assert.equal(c.gabarit, "expertises");
  chaineOuAbsente(c.surtitre, "surtitre");
  chaineOuAbsente(c.chapeau, "chapeau");

  if (c.actions !== undefined) {
    liste(c.actions, "actions", (a, ou) => {
      clesConnues(a, ou, ["libelle", "href", "principale"]);
      chaine(a.libelle, `${ou}.libelle`);
      chaine(a.href, `${ou}.href`);
      booleenOuAbsent(a.principale, `${ou}.principale`);
    });
  }
  if (c.cumul !== undefined) {
    assert.ok(estObjet(c.cumul), "cumul : objet attendu");
    clesConnues(c.cumul, "cumul", ["titre", "lignes"]);
    chaine(c.cumul.titre, "cumul.titre");
    liste(c.cumul.lignes, "cumul.lignes", (l, ou) => {
      clesConnues(l, ou, ["valeur", "texte"]);
      chaine(l.valeur, `${ou}.valeur`);
      chaine(l.texte, `${ou}.texte`);
    });
  }
  if (c.types !== undefined) {
    assert.ok(estObjet(c.types), "types : objet attendu");
    clesConnues(c.types, "types", ["entete", "cartes"]);
    entete(c.types.entete, "types.entete");
    liste(c.types.cartes, "types.cartes", (k, ou) => {
      clesConnues(k, ou, ["titre", "etiquette", "texte", "puces", "pied", "accent"]);
      chaine(k.titre, `${ou}.titre`);
      chaine(k.etiquette, `${ou}.etiquette`);
      chaine(k.texte, `${ou}.texte`);
      listeDeChaines(k.puces, `${ou}.puces`);
      chaineOuAbsente(k.pied, `${ou}.pied`);
      booleenOuAbsent(k.accent, `${ou}.accent`);
    });
  }
  if (c.dosage !== undefined) {
    assert.ok(estObjet(c.dosage), "dosage : objet attendu");
    clesConnues(c.dosage, "dosage", ["entete", "paragraphes", "repartition"]);
    entete(c.dosage.entete, "dosage.entete");
    listeDeChaines(c.dosage.paragraphes, "dosage.paragraphes");
    const r = c.dosage.repartition;
    if (r !== undefined) {
      assert.ok(estObjet(r), "dosage.repartition : objet attendu");
      clesConnues(r, "dosage.repartition", ["titre", "periode", "jeux", "note"]);
      chaine(r.titre, "dosage.repartition.titre");
      chaineOuAbsente(r.periode, "dosage.repartition.periode");
      chaineOuAbsente(r.note, "dosage.repartition.note");
      liste(r.jeux, "dosage.repartition.jeux", (j, ou) => {
        clesConnues(j, ou, ["legende", "barres", "accent"]);
        chaine(j.legende, `${ou}.legende`);
        booleenOuAbsent(j.accent, `${ou}.accent`);
        liste(j.barres, `${ou}.barres`, (b, oub) => {
          clesConnues(b, oub, ["libelle", "valeur"]);
          chaine(b.libelle, `${oub}.libelle`);
          assert.ok(
            Number.isInteger(b.valeur) && (b.valeur as number) >= 0 && (b.valeur as number) <= 100,
            `${oub}.valeur : entier de 0 à 100 attendu`,
          );
        });
      });
    }
  }
  if (c.domaines !== undefined) {
    assert.ok(estObjet(c.domaines), "domaines : objet attendu");
    clesConnues(c.domaines, "domaines", ["entete", "cartes", "lienLibelle"]);
    entete(c.domaines.entete, "domaines.entete");
    chaineOuAbsente(c.domaines.lienLibelle, "domaines.lienLibelle");
    liste(c.domaines.cartes, "domaines.cartes", (d, ou) => {
      clesConnues(d, ou, ["titre", "etiquette", "texte", "href"]);
      chaine(d.titre, `${ou}.titre`);
      chaine(d.etiquette, `${ou}.etiquette`);
      chaine(d.texte, `${ou}.texte`);
      chaineOuAbsente(d.href, `${ou}.href`);
    });
  }
  if (c.constructeurs !== undefined) {
    assert.ok(estObjet(c.constructeurs), "constructeurs : objet attendu");
    clesConnues(c.constructeurs, "constructeurs", ["entete", "texte", "lignes", "image"]);
    entete(c.constructeurs.entete, "constructeurs.entete");
    chaine(c.constructeurs.texte, "constructeurs.texte");
    liste(c.constructeurs.lignes, "constructeurs.lignes", (l, ou) => {
      clesConnues(l, ou, ["nom", "outils"]);
      chaine(l.nom, `${ou}.nom`);
      chaine(l.outils, `${ou}.outils`);
    });
    const img = c.constructeurs.image;
    if (img !== undefined) {
      assert.ok(estObjet(img), "constructeurs.image : objet attendu");
      clesConnues(img, "constructeurs.image", ["src", "alt"]);
      chaine(img.src, "constructeurs.image.src");
      chaine(img.alt, "constructeurs.image.alt");
      assert.ok(
        typeof img.src === "string" && img.src.startsWith("/") && existsSync(`public${img.src}`),
        `constructeurs.image.src : fichier attendu dans public${String(img.src)}`,
      );
    }
  }
  if (c.secteurs !== undefined) {
    assert.ok(estObjet(c.secteurs), "secteurs : objet attendu");
    clesConnues(c.secteurs, "secteurs", ["entete", "cartes"]);
    entete(c.secteurs.entete, "secteurs.entete");
    liste(c.secteurs.cartes, "secteurs.cartes", (s, ou) => {
      clesConnues(s, ou, ["titre", "texte", "href"]);
      chaine(s.titre, `${ou}.titre`);
      chaine(s.texte, `${ou}.texte`);
      chaineOuAbsente(s.href, `${ou}.href`);
    });
  }
  if (c.habilitations !== undefined) {
    assert.ok(estObjet(c.habilitations), "habilitations : objet attendu");
    clesConnues(c.habilitations, "habilitations", ["entete", "texte", "cartes"]);
    entete(c.habilitations.entete, "habilitations.entete");
    chaine(c.habilitations.texte, "habilitations.texte");
    liste(c.habilitations.cartes, "habilitations.cartes", (h, ou) => {
      clesConnues(h, ou, ["titre", "texte", "accent"]);
      chaine(h.titre, `${ou}.titre`);
      chaine(h.texte, `${ou}.texte`);
      booleenOuAbsent(h.accent, `${ou}.accent`);
    });
  }
  if (c.formulaire !== undefined) {
    assert.ok(estObjet(c.formulaire), "formulaire : objet attendu");
    clesConnues(c.formulaire, "formulaire", ["titre", "intro"]);
    chaine(c.formulaire.titre, "formulaire.titre");
    chaine(c.formulaire.intro, "formulaire.intro");
  }
}

// ----------------------------------------------------- les textes et les liens
/** Toutes les chaînes du contenu, avec le chemin de chacune. */
function chaines(v: unknown, chemin = "contenu"): [string, string][] {
  if (typeof v === "string") return [[chemin, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => chaines(x, `${chemin}[${i}]`));
  if (estObjet(v)) return Object.entries(v).flatMap(([k, x]) => chaines(x, `${chemin}.${k}`));
  return [];
}

function verifieTextes(c: Dict): void {
  for (const [ou, texte] of chaines(c)) {
    if (ou.endsWith(".href") || ou.endsWith(".src")) continue;
    assert.ok(!texte.includes("—"), `${ou} : tiret cadratin interdit`);
    const bas = texte.toLowerCase();
    for (const interdit of INTERDITS) {
      assert.ok(!bas.includes(interdit), `${ou} : « ${interdit} » est un interdit de copie`);
    }
    const delai = DELAI_CHIFFRE.exec(texte);
    assert.ok(!delai, `${ou} : délai chiffré « ${delai?.[0]} », seul « rappel dans l’heure » est autorisé`);
  }
}

function verifieLiens(c: Dict, inventaire: Set<string>): number {
  let n = 0;
  for (const [ou, texte] of chaines(c)) {
    const cibles: string[] = [];
    if (ou.endsWith(".href")) cibles.push(texte);
    // Les liens Markdown écrits dans le texte, « [libellé](/chemin/) ».
    for (const m of texte.matchAll(/\[[^\]]+\]\(([^)]*)\)/g)) cibles.push(m[1]);
    for (const cible of cibles) {
      n += 1;
      if (cible.startsWith("#")) {
        assert.ok(ANCRES.has(cible), `${ou} : ancre « ${cible} » que le gabarit ne pose pas`);
        continue;
      }
      assert.ok(inventaire.has(cible), `${ou} : « ${cible} » absent de ${INVENTAIRE}`);
    }
  }
  return n;
}

// --------------------------------------------- le SQL découpé rejoue le contenu
const MOTIF_BASE = /^update pages set contenu = '((?:[^']|'')*)'::jsonb where path = '((?:[^']|'')*)';$/u;
const MOTIF_AJOUT =
  /^update pages set contenu = jsonb_set\(contenu, '\{([A-Za-z0-9_,]+)\}', \(contenu((?:->'[A-Za-z0-9_]+')+)\) \|\| '((?:[^']|'')*)'::jsonb\) where path = '((?:[^']|'')*)';$/u;
const desEchappe = (s: string): string => s.replace(/''/g, "'");

function rejoue(url: string, lignes: string[]): { contenu: unknown; plusLongue: number } {
  assert.ok(lignes.length > 0, `${url} : aucune instruction`);
  let plusLongue = 0;
  for (const l of lignes) {
    const o = Buffer.byteLength(l, "utf8") + 1;
    plusLongue = Math.max(plusLongue, o);
    assert.ok(o <= PLAFOND, `${url} : une instruction pèse ${o} o, plafond ${PLAFOND}`);
  }
  const base = MOTIF_BASE.exec(lignes[0]);
  assert.ok(base, `${url} : la première instruction doit poser le contenu de base`);
  assert.equal(desEchappe(base[2]), url);
  const contenu = JSON.parse(desEchappe(base[1])) as Dict;

  for (const l of lignes.slice(1)) {
    const m = MOTIF_AJOUT.exec(l);
    assert.ok(m, `${url} : instruction d'ajout mal formée :\n${l.slice(0, 120)}`);
    const chemin = m[1].split(",");
    const acces = [...m[2].matchAll(/->'([A-Za-z0-9_]+)'/g)].map((x) => x[1]);
    assert.deepEqual(acces, chemin, `${url} : le chemin jsonb_set et l'accès -> divergent`);
    assert.equal(desEchappe(m[4]), url);
    const morceau = JSON.parse(desEchappe(m[3])) as unknown;
    assert.ok(Array.isArray(morceau), `${url} : morceau non tableau sur ${chemin.join(".")}`);

    let noeud: Dict = contenu;
    for (const k of chemin.slice(0, -1)) {
      assert.ok(estObjet(noeud[k]), `${url} : ${chemin.join(".")} introuvable dans la base`);
      noeud = noeud[k];
    }
    const dernier = chemin[chemin.length - 1];
    assert.ok(Array.isArray(noeud[dernier]), `${url} : ${chemin.join(".")} n'est pas un tableau`);
    noeud[dernier] = [...(noeud[dernier] as unknown[]), ...morceau];
  }
  return { contenu, plusLongue };
}

// ------------------------------------------------------------------------ main
interface Page {
  url: string;
  contenu: unknown;
}

const pages = JSON.parse(readFileSync(SOURCE, "utf8")) as Page[];
assert.ok(Array.isArray(pages) && pages.length > 0, `${SOURCE} : liste non vide attendue`);
const inventaire = new Set(
  (JSON.parse(readFileSync(INVENTAIRE, "utf8")) as { url: string }[]).map((r) => r.url),
);

// Contrôle positif : les phrases d'origine de la maquette doivent faire tomber
// le contrôle des interdits. Sans cela, une absence ne prouve rien.
for (const original of [
  "des habilitations à jour, vérifiées avant chaque mise à disposition.",
  "Mobilisation sous 24 h, 2 h sous abonnement",
  "Gammes exécutées à échéance fixe — heures de marche, cycles, calendrier.",
]) {
  assert.throws(
    () => verifieTextes({ gabarit: "expertises", chapeau: original }),
    `le contrôle des interdits laisse passer « ${original} »`,
  );
}

let instructions = 0;
let plusLongue = 0;
let liens = 0;
for (const page of pages) {
  assert.ok(inventaire.has(page.url), `${page.url} : URL absente de ${INVENTAIRE}`);
  assert.ok(estExpertises(page.contenu), `${page.url} : gabarit « expertises » attendu`);
  const c = page.contenu as unknown as Dict;
  verifieForme(c);
  verifieTextes(c);
  liens += verifieLiens(c, inventaire);

  const capture = readFileSync(`maquette/rendu/${page.url.slice(1, -1).replaceAll("/", "--")}.html`, "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]*>/g, "");
  if (capture.includes("+200")) {
    const textes = chaines(c).map(([, t]) => t);
    const bande = BANDE_NON_PORTEE.get(page.url);
    if (bande) {
      assert.ok(capture.includes(bande), `${page.url} : la capture ne porte plus « ${bande} », l'exception est à relire`);
      assert.ok(
        !textes.some((t) => t.includes("+200") || t.includes(bande)),
        `${page.url} : la bande de chiffres est portée, retirer l'exception et exiger « +200 »`,
      );
    } else {
      assert.ok(textes.some((t) => t.includes("+200")), `${page.url} : « +200 » est dans la capture, pas dans le contenu`);
    }
  }

  // Deux transcriptions indépendantes de la maquette doivent dire la même chose.
  if (page.url === "/expertises/") {
    assert.deepStrictEqual(
      page.contenu,
      CONTENU_EXPERTISES as ContenuExpertises,
      "/expertises/ : le JSON diverge de components/site/expertises/expertises-donnees.ts",
    );
  }

  const nom = page.url.replace(/^\/|\/$/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const fichier = `${DOSSIER}/${nom}.sql`;
  assert.ok(existsSync(fichier), `${fichier} manquant : lancer scripts/decoupe_gabarits.py`);
  const lignes = readFileSync(fichier, "utf8").split("\n").filter((l) => l.trim());
  const r = rejoue(page.url, lignes);
  assert.deepStrictEqual(r.contenu, page.contenu, `${fichier} rejoué ne redonne pas le JSON`);
  instructions += lignes.length;
  plusLongue = Math.max(plusLongue, r.plusLongue);
}

console.log(
  `Contenu expertises conforme : ${pages.length} page(s), ${liens} liens vérifiés, ` +
    `${instructions} instructions SQL rejouées, la plus longue ${plusLongue} o (plafond ${PLAFOND}).`,
);
