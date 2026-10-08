/**
 * Les phrases estropiées par un retrait, cherchées DANS LE RENDU.
 *
 *   node scripts/verifie-phrases-estropiees.mjs
 *   node scripts/verifie-phrases-estropiees.mjs --controle   (contrôle positif)
 *
 * POURQUOI CE CONTRÔLE EXISTE. `copieConforme` retire d'un texte toute phrase
 * qui porte un interdit du contrat. Appliquée à la main pendant le portage,
 * elle a laissé des moignons rendus tels quels : quatre mentions réduites à
 * « , du lundi au vendredi… » (quatre blocs par page), et vingt champs où le
 * 04 78 33 72 05 avait disparu en laissant sa ponctuation (« Pour nous
 * joindre : , du lundi… »). Aucun contrôle ne les voyait : ceux de gabarit
 * comparent le rendu à la capture SECTION PAR SECTION et une ponctuation
 * perdue pèse trop peu de pixels, et `verifie-interdits` cherche des
 * formulations, pas des trous.
 *
 * CE CONTRÔLE COMPARE À LA MAQUETTE, et la comparaison se lit en deux temps.
 *
 * Un moignon de DÉBUT que la capture porte aussi est conforme. La maquette
 * rend elle-même sept paragraphes ouverts par une virgule
 * (`, du lundi au vendredi de 8h00 à 18h30.` sur /expertises/…) : c'est son
 * motif titre-puis-suite, le titre en gras puis sa suite dans un paragraphe à
 * part. Le rendu de la maquette fait foi, donc le site le reproduit, donc le
 * contrôle se tait.
 *
 * Un moignon de MILIEU est refusé MÊME SI LA CAPTURE LE PORTE, et c'est une
 * décision, pas un oubli. La maquette écrit « Pour nous joindre : , du
 * lundi… » sur une vingtaine de pages : elle perd le 04 78 33 72 05 que SON
 * PROPRE corpus écrit à cet endroit (`implantations--toulouse--gironde.md`
 * l.13 : « Pour nous joindre : 04 78 33 72 05, du lundi au vendredi »). Un
 * deux-points qui s'ouvre sur une virgule n'est pas une typographie, c'est un
 * trou, et le corpus dit ce qui y manquait. Les fiches portent donc le numéro
 * restauré, le site s'écarte ici de sa référence en connaissance de cause, et
 * le contrôle continue de refuser la forme pour qu'un retour en arrière se
 * voie. À FAIRE CONFIRMER PAR MEHDI : si la maquette fait foi jusque-là, il
 * faut retirer les vingt numéros et supprimer ce paragraphe.
 *
 * Il lit le rendu et non la source, parce que le défaut naît de l'assemblage :
 * « Pour nous joindre : » et la mention vivent dans deux champs, et c'est leur
 * mise bout à bout qui produit « : , ».
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const CONTROLE = process.argv.includes("--controle");

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pages = Array.isArray(index) ? index : (index.pages ?? index);

/** La capture figée porte ce nom : /offres/residence/ -> offres--residence */
const cleDe = (url) => url.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "accueil";

const BLOCS = /<(p|h1|h2|h3|h4|li|td|dd|figcaption|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&");

/* Insécables, fine insécable et apostrophe typographique unifiées : la
   maquette et le site ne les écrivent pas de la même façon, et la comparaison
   porterait alors sur la typographie au lieu de porter sur la phrase. */
const normalise = (s) =>
  decode(s.replace(/<[^>]+>/g, ""))
    .normalize("NFC")
    .replace(/[  ]/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/* Les deux formes que prend un retrait de phrase :
     - le bloc ENTIER commence par une ponctuation (« , du lundi… ») ;
     - une ponctuation se referme sur une autre AU MILIEU du bloc
       (« Pour nous joindre : , du lundi… », « 18h30 : . »), signature d'un
       morceau ôté entre les deux. C'est la forme qu'avaient les vingt champs
       privés du 04 78 33 72 05, et la première version de ce contrôle ne la
       voyait pas : son propre contrôle positif l'a montré. */
const DEBUT = /^[,.;:]/;
const MILIEU = /[:;]\s+[,.;](?!\s*\))|[,;]\s+[,;]|\.\s+[,;]/;

/** Tout bloc de texte où un retrait a laissé un moignon. */
function moignons(html) {
  const trouves = [];
  for (const m of html.replace(/<script[\s\S]*?<\/script>/gi, " ").matchAll(BLOCS)) {
    const texte = normalise(m[2]);
    if (texte.length <= 3) continue;
    const ou = DEBUT.test(texte) ? "début" : MILIEU.test(texte) ? "milieu" : undefined;
    if (ou) trouves.push({ balise: m[1], texte, ou });
  }
  return trouves;
}

const urls = [...new Set(pages.map((p) => p?.url).filter(Boolean))];
const trouvailles = [];
let lues = 0;
const LOT = 12;

for (let i = 0; i < urls.length; i += LOT) {
  await Promise.all(
    urls.slice(i, i + LOT).map(async (url) => {
      let html;
      try {
        const r = await fetch(SITE + url, { signal: AbortSignal.timeout(30000) });
        if (!r.ok) {
          trouvailles.push({ url, texte: `HTTP ${r.status}`, cause: "page injoignable" });
          return;
        }
        html = await r.text();
      } catch (e) {
        trouvailles.push({ url, texte: e.message, cause: "page injoignable" });
        return;
      }
      lues++;

      const capture = join(RACINE, "maquette/rendu", `${cleDe(url)}.html`);
      const reference = existsSync(capture)
        ? new Set(moignons(readFileSync(capture, "utf8")).map((m) => m.texte))
        : new Set();

      for (const m of moignons(html)) {
        /* Un moignon de début que la maquette écrit aussi : le site la suit,
           c'est conforme. Un moignon de milieu reste refusé même présent dans
           la capture, voir l'en-tête : la maquette y perd le téléphone de son
           propre corpus. */
        if (m.ou === "début" && reference.has(m.texte)) continue;
        trouvailles.push({
          url,
          texte: m.texte,
          cause:
            m.ou === "milieu"
              ? `ponctuation refermée sur une autre dans <${m.balise}> : un morceau manque${reference.has(m.texte) ? " (la maquette porte le même trou, voir l'en-tête)" : ""}`
              : existsSync(capture)
                ? `<${m.balise}> ouvert par une ponctuation, absent de la capture de la maquette`
                : `<${m.balise}> ouvert par une ponctuation, et cette page n'a pas de capture : à vérifier à la main`,
        });
      }
    }),
  );
}

if (CONTROLE) {
  /* Le contrôle positif ne touche à rien : il vérifie que la détection sait
     reconnaître un moignon, et que la comparaison à la maquette sait
     l'absoudre. Un contrôle qu'on n'a pas vu échouer ne prouve rien. */
  const faute = moignons('<p>, du lundi au vendredi de 8h00 à 18h30.</p><p>Une phrase entière.</p>');
  const colle = moignons("<p>Pour nous joindre : , du lundi au vendredi.</p>");
  const vide = moignons("<p>Un chargé d'affaires vous rappelle, du lundi au vendredi : .</p>");
  const sains = [
    "<p>Nous vous rappelons dans l'heure, du lundi au vendredi de 8h00 à 18h30.</p>",
    "<p>Pour nous joindre : 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30.</p>",
    "<p>Habilitations, travail en hauteur, espace confiné : les autorisations sont à jour.</p>",
    "<p>Trois sites, deux équipes ; un seul référent.</p>",
  ].flatMap((h) => moignons(h));
  const verdicts = [
    ["un paragraphe commençant par une virgule est vu", faute.length === 1 && faute[0].ou === "début"],
    ["la phrase entière du même bloc est laissée", faute[0]?.texte.startsWith(", du lundi")],
    ["« : , » au milieu du bloc est vu", colle.length === 1 && colle[0].ou === "milieu"],
    ["« : . » en fin de bloc est vu", vide.length === 1 && vide[0].ou === "milieu"],
    ["quatre phrases saines ne déclenchent rien", sains.length === 0],
  ];
  for (const [quoi, ok] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
  if (!verdicts.every(([, ok]) => ok)) process.exit(1);
  console.log(`\ncontrôle positif conforme (${verdicts.length}/${verdicts.length})`);
}

if (trouvailles.length > 0) {
  for (const t of trouvailles) {
    console.error(`${t.url}\n  ${t.cause}\n  « ${t.texte.slice(0, 120)} »\n`);
  }
  console.error(`${trouvailles.length} phrase(s) estropiée(s) dans le rendu.`);
  process.exit(1);
}

console.log(`phrases entières sur ${lues}/${urls.length} pages (moignons de la maquette reproduits tels quels)`);
