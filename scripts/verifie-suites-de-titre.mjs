/**
 * Un titre et sa suite doivent se lire D'UN TRAIT, jamais sur deux lignes dont
 * la seconde s'ouvre par une virgule.
 *
 *   node scripts/verifie-suites-de-titre.mjs
 *   node scripts/verifie-suites-de-titre.mjs --controle   (contrôle positif)
 *
 * LE DÉFAUT, signalé par Mehdi le 09/10 sur les études de cas. Le corpus écrit
 * une puce en UNE phrase, son début en gras :
 *
 *     - **Disposer d'un profil opérationnel tout de suite**, pas d'un renfort à former.
 *
 * Le portage a mis le gras dans `titre`, la suite dans `texte`, et les cartes
 * rendaient deux BLOCS. Le visiteur lisait « , pas d'un renfort à former. »
 * comme une ligne à elle seule.
 *
 * POURQUOI AUCUNE PORTE NE LE VOYAIT. La maquette porte le même défaut
 * (`preuves--autoliv.html`, `data-dc-tpl="64"` puis `"66"`), donc les contrôles
 * de gabarit trouvaient les deux lignes DES DEUX CÔTÉS, et
 * `verifie-phrases-estropiees` absout exprès les moignons de début que la
 * capture porte aussi — cette absolution est juste pour les 7 paragraphes de
 * /expertises/, dont l'accroche est rendue EN LIGNE, et elle couvrait par
 * ricochet ce défaut-ci, où rien ne raccommode la phrase.
 *
 * CE QUE CE CONTRÔLE VÉRIFIE, et il part des FICHES pour ne pas dépendre de la
 * mise en page : tout bloc qui porte À LA FOIS un `titre` et un `texte`
 * commençant par une virgule ou un point-virgule doit se retrouver dans le
 * rendu SOUS LA FORME JOINTE, « titre, suite », d'un seul tenant. Les blocs
 * sans titre ne sont pas concernés : leur suite continue une accroche rendue
 * en ligne, c'est le motif légitime de la maquette.
 *
 * Remède : components/site/blocs/TitreEtSuite.tsx.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const FICHES = join(RACINE, "supabase", "import", "gabarits-maquette");
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const CONTROLE = process.argv.includes("--controle");

const SUITE = /^\s*[,;]/;

const normalise = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    /* Next.js échappe l'apostrophe en HEXADÉCIMAL (`&#x27;`), pas en décimal :
       ne décoder que `&#39;` faisait échouer la comparaison sur toute phrase
       qui en porte une, soit un faux défaut sur 11 études de cas déjà
       corrigées. Les deux formes sont décodées. */
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    /* UNE FRONTIÈRE À CHAQUE BLOC, et c'est tout le contrôle. Retirer les
       balises sans rien mettre à leur place rendait
       `<div>titre</div><div>, suite</div>` IDENTIQUE à la phrase jointe
       `titre, suite` : la porte ne pouvait pas distinguer le défaut de son
       remède, et elle ne l'a PAS vu quand il a été réinjecté exprès dans
       `TitreEtSuite`. Les balises de bloc laissent donc une barre, qu'aucune
       phrase jointe ne peut contenir. Les balises EN LIGNE (span, strong, em,
       a…) s'effacent sans frontière : elles ne coupent pas la lecture, et
       c'est exactement ainsi que le remède rend le titre. */
    .replace(
      /<\/?(?:div|p|section|article|li|ul|ol|tr|td|th|h[1-6]|dd|dt|figure|figcaption|blockquote|br|header|footer|nav|main|aside|table|tbody|thead)\b[^>]*>/gi,
      "│",
    )
    .replace(/<[^>]+>/g, "")
    .replace(/[  ]/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s*│[│\s]*/g, "│")
    .replace(/\s+/g, " ")
    .trim();

/** Les couples titre + suite d'une fiche, ceux qui doivent se lire d'un trait. */
export function couples(fiche) {
  const trouves = [];
  const parcours = (noeud) => {
    if (Array.isArray(noeud)) return noeud.forEach(parcours);
    if (!noeud || typeof noeud !== "object") return;
    const titre = noeud.titre;
    for (const cle of ["texte", "text"]) {
      const suite = noeud[cle];
      if (typeof titre === "string" && titre.trim() && typeof suite === "string" && SUITE.test(suite)) {
        trouves.push({ titre: titre.trim(), suite: suite.trim() });
      }
    }
    for (const [cle, valeur] of Object.entries(noeud)) {
      if (["_reference", "retraits", "phrases_retirees", "trous", "_source", "source", "seo"].includes(cle)) continue;
      parcours(valeur);
    }
  };
  parcours(fiche);
  return trouves;
}

if (CONTROLE) {
  const vu = couples({
    contenu: { objectifs: [{ titre: "Disposer d'un profil", texte: ", pas d'un renfort à former." }] },
  });
  const ignores = [
    // sans titre : la suite continue une accroche rendue en ligne (/expertises/)
    { contenu: { puces: [{ texte: ", du lundi au vendredi de 8h00 à 18h30." }] } },
    // une phrase entière
    { contenu: { objectifs: [{ titre: "Un titre", texte: "Une phrase entière." }] } },
    // déjà déclaré comme retiré
    { trous: [{ ligne: ", pas d'un renfort à former.", pourquoi: "essai" }] },
  ].flatMap(couples);
  const joint = (t, s) => normalise(`${t}${s}`);
  const verdicts = [
    ["un couple titre + suite est vu", vu.length === 1],
    ["la forme jointe est celle du corpus", joint(vu[0]?.titre, vu[0]?.suite) === "Disposer d'un profil, pas d'un renfort à former."],
    ["trois cas sans titre ou sans suite ne déclenchent rien", ignores.length === 0],
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
/* Fiche par fiche, on demande la page et on cherche la forme jointe. */
const aMesurer = [];
for (const entree of readdirSync(FICHES).filter((f) => f.endsWith(".json"))) {
  const fiche = JSON.parse(readFileSync(join(FICHES, entree), "utf8"));
  const c = couples(fiche);
  if (c.length && fiche.url) aMesurer.push({ entree, url: fiche.url, gabarit: fiche?.contenu?.gabarit ?? "?", couples: c });
}

const coupes = [];
let jointes = 0;
const LOT = 10;
for (let i = 0; i < aMesurer.length; i += LOT) {
  await Promise.all(
    aMesurer.slice(i, i + LOT).map(async (p) => {
      let rendu;
      try {
        const r = await fetch(SITE + p.url, { signal: AbortSignal.timeout(30000) });
        rendu = normalise(await r.text());
      } catch (e) {
        coupes.push({ ...p, titre: e.message, suite: "", cause: "page injoignable" });
        return;
      }
      for (const { titre, suite } of p.couples) {
        if (rendu.includes(normalise(`${titre}${suite}`))) jointes++;
        else coupes.push({ ...p, titre, suite });
      }
    }),
  );
}

if (coupes.length > 0) {
  const parGabarit = {};
  for (const c of coupes) parGabarit[c.gabarit] = (parGabarit[c.gabarit] ?? 0) + 1;
  for (const c of coupes.slice(0, 12)) {
    console.log(`\n${c.url}  (gabarit ${c.gabarit})`);
    console.log(`  titre : « ${c.titre.slice(0, 70)} »`);
    console.log(`  suite rendue à part : « ${c.suite.slice(0, 70)} »`);
  }
  if (coupes.length > 12) console.log(`\n… et ${coupes.length - 12} autres`);
  console.log(`\n${jointes} phrase(s) jointe(s), ${coupes.length} encore coupée(s) en deux lignes.`);
  console.log("Par gabarit :", Object.entries(parGabarit).map(([g, n]) => `${g} ${n}`).join(", "));
  console.log("Remède : brancher components/site/blocs/TitreEtSuite.tsx sur les cartes de ces gabarits.");
  process.exit(1);
}

console.log(`${jointes} phrase(s) titre + suite rendue(s) d'un trait, aucune coupée (${aMesurer.length} pages)`);
}
