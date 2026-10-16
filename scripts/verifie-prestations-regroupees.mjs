/**
 * « Les prestations regroupées ici » liste-t-il TOUTES les prestations de
 * l'offre ?
 *
 *   node scripts/verifie-prestations-regroupees.mjs
 *   node scripts/verifie-prestations-regroupees.mjs --controle   (témoin)
 *   SITE_URL=http://localhost:4341 node scripts/verifie-prestations-regroupees.mjs
 *
 * CE QU'ELLE DÉFEND. Mehdi a signalé ce bloc QUATRE FOIS, c'est le défaut le
 * plus rapporté du site : « pas assez complet », « ce bloc il y a pas toutes
 * les prestations » (`/offres/bureau-etudes/`), « sa sert a rien ce bloc »
 * (`/offres/zero-arret/`), « il manque des prestations sur ce bloc »
 * (`/travaux-industriels/`). Sa décision : un bloc intitulé « Les prestations
 * regroupées ici » porte TOUTES les prestations regroupées sous l'offre, ou il
 * n'existe pas. Un bloc qui annonce « les prestations » et en liste une ment
 * sur son propre intitulé.
 *
 * C'EST UN ARBITRAGE CONTRE SA MAQUETTE, pas un défaut de portage, et la porte
 * ne prétend donc pas mesurer contre la capture : mesuré le 12/10, les quatre
 * captures qui portent la section en listaient exactement autant que le site
 * (2, 1, 2, 2). La maquette n'y range que les offres que son routeur REDIRIGE
 * (`remapOffer`). Mehdi élargit la règle aux pages filles de l'offre, qui
 * existent vraiment et n'étaient listées nulle part ailleurs sur la page.
 *
 * LE COMPTE ATTENDU N'EST PAS ÉCRIT ICI, IL EST RECALCULÉ. Le groupe d'une
 * offre, c'est sa classe d'équivalence sous le `remapOffer` DE LA MAQUETTE
 * (lu dans `maquette/site-final-autonome.html`, donc impossible à faire
 * dériver en silence) : la page cible, les offres qu'elle absorbe, et toutes
 * leurs pages filles d'après `maquette/contenu/site/index.json`. Ajouter une
 * page fille à une offre arme automatiquement la porte contre son oubli.
 *
 * QUATRE FAÇONS DE MENTIR, et elle les refuse toutes les quatre :
 *
 *  1. UNE PRESTATION DU GROUPE MANQUE au bloc. C'est le défaut signalé.
 *  2. LE BLOC NE LISTE QU'UNE CARTE. Son intitulé est au pluriel ; une seule
 *     prestation ne se « regroupe » pas. Le bloc n'a alors pas lieu d'être.
 *  3. UNE CARTE NE CORRESPOND À AUCUNE PAGE RÉELLE. Une prestation inventée,
 *     ou un lien vers une adresse que l'index ne connaît pas.
 *  4. LE RENDU SERVI PERD DES CARTES que la fiche déclare. Le composant filtre
 *     les liens (`cibleSure`) et ne monte rien sans donnée : une régression du
 *     composant viderait le bloc sans toucher une seule fiche.
 *
 * DEPUIS LA MAQUETTE V3 (16/10), LE BLOC EST EN CARTES-LIENS (« Voir la
 * prestation → ») et non plus en accordéons recopiés : une carte est un `<a
 * data-carte-prestation>` dans la section `data-prestations-regroupees`. Deux
 * refus s'ajoutent : DEUX CARTES VERS LA MÊME PAGE (le doublon que Mehdi a
 * relevé sur /offres/bureau-etudes/), et une carte dont le lien servi n'est pas
 * celui de la fiche.
 *
 * UN SEUL DOUBLON DE PAGE EST DÉCLARÉ, `DOUBLONS` plus bas : deux adresses qui
 * servent la même prestation (même titre, même accroche). Le groupe réclame
 * l'une OU l'autre, jamais les deux. Une adresse déclarée qui quitterait
 * l'index ferait échouer la porte : l'exception ne survit pas à sa raison.
 *
 * CE QU'ELLE NE FAIT PAS, volontairement : elle n'exige le bloc sur aucune
 * page. Les offres qui regroupent plusieurs prestations SANS porter le bloc
 * sont seulement listées en fin de passage, pour arbitrage. Imposer le bloc
 * serait trancher à la place de Mehdi sur des pages dont la capture n'en a pas.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = process.env.SITE_URL ?? "https://migen-site.vercel.app";
const CONTROLE = process.argv.includes("--controle");
const SEP = String.fromCharCode(1);

/**
 * Texte comparable : insécables en espace, apostrophes et entités unifiées.
 * Piège déjà payé (PASSATION §8.3) : la maquette mélange les apostrophes
 * droites et typographiques, l'index et le rendu ne les écrivent pas pareil.
 */
export function norme(texte) {
  return String(texte ?? "")
    .replace(/&nbsp;|&#xa0;|&#160;|\u00a0|\u202f|\u2009/g, " ")
    .replace(/&#x27;|&#39;|&apos;|\u2019|\u2018|\u02bc/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** La table `remapOffer` de la maquette, lue dans la maquette elle-même. */
export function litRemap(sourceMaquette) {
  const m = /remapOffer\(u\)\s*\{\\n\s*const M = \{([^}]*)\}/.exec(sourceMaquette);
  if (!m) return null;
  const table = {};
  for (const paire of m[1].matchAll(/\\"(\/[^"\\]*)\\"\s*:\s*\\"(\/[^"\\]*)\\"/g)) {
    table[paire[1]] = paire[2];
  }
  return Object.keys(table).length > 0 ? table : null;
}

/**
 * Le groupe d'une offre : la page, les pages qui lui sont rabattues, et toutes
 * leurs filles. `pages` est l'index (url + h1), `remap` la table ci-dessus.
 */
export function groupeOffre(url, pages, remap) {
  const cible = remap[url] ?? url;
  const membres = new Set([cible, ...Object.keys(remap).filter((s) => remap[s] === cible)]);
  const h1DeSoi = norme(pages.find((p) => p.url === url)?.h1 ?? "");
  const attendues = new Map();
  for (const membre of membres) {
    /* Le membre lui-même est une prestation du bloc, sauf la page qui le rend
       et sauf un doublon d'adresse qui porte le MÊME h1 qu'elle : /bureau-etudes/
       et /offres/bureau-etudes/ sont la même page à deux adresses. */
    const fiche = pages.find((p) => p.url === membre);
    if (fiche && membre !== url && norme(fiche.h1) !== h1DeSoi) {
      attendues.set(membre, { url: membre, h1: fiche.h1, role: "offre absorbée" });
    }
    for (const fille of pages.filter((p) => p.url.startsWith(membre) && p.url !== membre)) {
      attendues.set(fille.url, { url: fille.url, h1: fille.h1, role: `page fille de ${membre}` });
    }
  }
  attendues.delete(url);
  return [...attendues.values()].sort((a, b) => a.url.localeCompare(b.url));
}

/**
 * Les adresses qui servent la MÊME prestation qu'une autre : la clé est le
 * doublon, la valeur la page que le bloc liste. « Mise en conformité des
 * machines » (/offres/retrofit/…) et « Mise en conformité machine »
 * (/bureau-etudes/…) ont le même titre à un mot près et la même accroche ; la
 * V3 et Mehdi n'en veulent qu'une sur /offres/bureau-etudes/ (16/10). Celle du
 * bureau d'études est gardée : c'est aussi la tuile « Mise en conformité
 * machine » de « Nos domaines d'études ».
 */
export const DOUBLONS = {
  "/offres/retrofit/mise-en-conformite-machine/": "/bureau-etudes/mise-en-conformite-machine/",
};

/** Les cartes-liens du bloc, dans le HTML servi. */
export function cartesServies(html) {
  const i = html.indexOf("data-prestations-regroupees");
  if (i < 0) return null;
  const debut = html.lastIndexOf("<section", i);
  const re = /<section\b|<\/section>/g;
  re.lastIndex = debut;
  let prof = 0;
  let fin = html.length;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === "</section>") {
      prof -= 1;
      if (prof === 0) {
        fin = m.index;
        break;
      }
    } else prof += 1;
  }
  const bloc = html.slice(debut, fin);
  const cartes = [];
  for (const m2 of bloc.matchAll(/<a\b([^>]*\bdata-carte-prestation\b[^>]*)>([\s\S]*?)<\/a>/g)) {
    /* Le deuxième segment de texte est l'intitulé : le premier est le numéro
       de la pastille. */
    const morceaux = m2[2]
      .replace(/<[^>]+>/g, SEP)
      .split(SEP)
      .map((x) => norme(x))
      .filter(Boolean);
    cartes.push({
      intitule: morceaux[1] ?? "",
      liens: [...m2[1].matchAll(/href="(\/[^"#?]*\/)"/g)].map((x) => x[1]),
    });
  }
  return cartes;
}

/**
 * Le verdict d'une page : les manques, les cartes orphelines, le pluriel.
 * `urlsConnues` est l'ensemble des adresses que l'index décrit.
 */
export function juge({ url, attendues, cartesFiche, cartesRendu, urlsConnues }) {
  const fautes = [];
  const titresFiche = cartesFiche.map((c) => norme(c.titre));
  for (const a of attendues) {
    const parTitre = titresFiche.includes(norme(a.h1));
    const parLien = cartesFiche.some((c) => c.href === a.url);
    /* Un doublon déclaré est couvert par la page qu'il double. */
    const parJumelle = !!DOUBLONS[a.url] && cartesFiche.some((c) => c.href === DOUBLONS[a.url]);
    if (!parTitre && !parLien && !parJumelle) {
      fautes.push(`${url} : « ${a.h1} » (${a.url}, ${a.role}) n'est pas dans le bloc`);
    }
  }
  const h1Connus = new Set([...urlsConnues.values()].map((h) => norme(h)));
  for (const c of cartesFiche) {
    /* UNE CARTE DOIT OUVRIR QUELQUE CHOSE, et c'est le point que cette porte
       ratait. Elle acceptait une carte dont le TITRE correspondait à un h1
       connu, même sans aucun lien : « parTitre OU parLien » suffisait. Trois
       cartes passaient ainsi, « Dépannage industriel », « Transfert
       industriel » et « Montage industriel », pendant que la porte imprimait
       « chacune rattachée à une page réelle ». Le visiteur pouvait les déplier
       et lire, sans jamais pouvoir atteindre la page.

       Un relecteur adverse l'a trouvé avec son propre témoin, pas la porte. */
    if (!c.href) {
      fautes.push(
        `${url} : la carte « ${c.titre} » n'ouvre AUCUN lien. Le visiteur la ` +
          `déplie et ne peut pas atteindre la page qu'elle nomme.`,
      );
    }
    if (!h1Connus.has(norme(c.titre)) && !(c.href && urlsConnues.has(c.href))) {
      fautes.push(`${url} : la carte « ${c.titre} » ne correspond à aucune page réelle du site`);
    }
    if (c.href && !urlsConnues.has(c.href)) {
      fautes.push(`${url} : la carte « ${c.titre} » renvoie vers ${c.href}, inconnue de l'index`);
    }
  }
  const vus = new Set();
  for (const c of cartesFiche) {
    const cle = DOUBLONS[c.href] ?? c.href;
    if (c.href && vus.has(cle)) {
      fautes.push(`${url} : « ${c.titre} » mène à une page déjà listée (${cle}). Une prestation, une carte.`);
    }
    vus.add(cle);
  }
  if (cartesRendu !== null) {
    cartesRendu.forEach((servie, rang) => {
      const attendu = cartesFiche[rang]?.href;
      if (attendu && !servie.liens.includes(attendu)) {
        fautes.push(`${url} : la carte servie n° ${rang + 1} ne mène pas à ${attendu}, le lien de la fiche.`);
      }
    });
  }
  if (cartesFiche.length < 2) {
    fautes.push(
      `${url} : le bloc est au pluriel et ne liste que ${cartesFiche.length} prestation(s). ` +
        `Une seule prestation ne se regroupe pas : le bloc n'a pas lieu d'être sur cette page.`,
    );
  }
  if (cartesRendu !== null && cartesRendu.length !== cartesFiche.length) {
    fautes.push(
      `${url} : la fiche déclare ${cartesFiche.length} prestation(s), le rendu servi en montre ` +
        `${cartesRendu.length}. Le composant en perd en route.`,
    );
  }
  if (cartesRendu !== null && cartesRendu.length === 0) {
    fautes.push(`${url} : le bloc est servi vide`);
  }
  return fautes;
}

/* -------------------------------------------------------------- le témoin */

if (CONTROLE) {
  const pages = [
    { url: "/offres/truc/", h1: "Truc" },
    { url: "/offres/truc/fille-a/", h1: "La fille A" },
    { url: "/offres/truc/fille-b/", h1: "La fille B" },
    { url: "/offres/machin/", h1: "Machin absorbé" },
    { url: "/offres/machin/fille-c/", h1: "La fille C" },
    { url: "/truc/", h1: "Truc" },
    { url: "/truc/fille-d/", h1: "L’apostrophe de la fille D" },
  ];
  const remap = { "/offres/machin/": "/offres/truc/", "/truc/": "/offres/truc/" };
  const urlsConnues = new Map(pages.map((p) => [p.url, p.h1]));
  const attendues = groupeOffre("/offres/truc/", pages, remap);
  const complet = [
    { titre: "Machin absorbé", href: "/offres/machin/" },
    { titre: "La fille A", href: "/offres/truc/fille-a/" },
    { titre: "La fille B", href: "/offres/truc/fille-b/" },
    { titre: "La fille C", href: "/offres/machin/fille-c/" },
    { titre: "L'apostrophe de la fille D", href: "/truc/fille-d/" },
  ];
  const sansFilleB = complet.filter((c) => c.titre !== "La fille B");
  const uneSeule = [complet[0]];
  const inventee = [...complet, { titre: "Prestation qui n'existe pas", href: "/offres/truc/nulle-part/" }];
  const rendu = (n) => Array.from({ length: n }, (_, k) => ({ intitule: `c${k}`, liens: [] }));
  const servi = (cartes) => cartes.map((c) => ({ intitule: c.titre, liens: [c.href] }));
  const cas = (cartesFiche, cartesRendu = servi(cartesFiche)) =>
    juge({ url: "/offres/truc/", attendues, cartesFiche, cartesRendu, urlsConnues });

  const htmlBloc =
    '<section data-prestations-regroupees=""><div><div>Nos prestations</div><h2>Les prestations liées à cette offre</h2></div>' +
    '<div><a data-carte-prestation="" href="/offres/machin/"><span>01</span><span>Machin absorbé</span><span>Son accroche.</span><span>Voir la prestation →</span></a>' +
    '<a href="/offres/truc/fille-a/" data-carte-prestation=""><span>02</span><span>La fille A</span><span>Voir la prestation →</span></a>' +
    '<a href="#besoin">Décrire mon besoin →</a></div></section>' +
    "<section>La suite de la page</section>";
  const doublonDeLien = [...complet, { titre: "Machin absorbé, encore", href: "/offres/machin/" }];
  const renduQuiDevie = complet.map((c, k) => ({ intitule: c.titre, liens: [k === 1 ? "/ailleurs/" : c.href] }));

  const servies = cartesServies(htmlBloc);
  const remapLu = litRemap(
    'remapOffer(u) {\\n    const M = { \\"/offres/chantier/\\": \\"/travaux-industriels/\\", \\"/truc/\\": \\"/offres/truc/\\" };\\n',
  );

  const verdicts = [
    /* --- contrôles NÉGATIFS : la porte doit laisser passer --- */
    ["NÉGATIF un bloc complet passe", cas(complet).length === 0],
    [
      "NÉGATIF l'apostrophe typographique de l'index est reconnue dans une carte à apostrophe droite",
      cas(complet).every((f) => !f.includes("fille D")),
    ],
    ["NÉGATIF une page sans bloc n'est pas jugée", cartesServies("<section>Rien ici</section>") === null],
    [
      "NÉGATIF le doublon d'adresse au même h1 (/truc/) n'est pas réclamé comme prestation",
      !attendues.some((a) => a.url === "/truc/"),
    ],
    /* --- contrôles POSITIFS : la porte doit refuser --- */
    [
      "POSITIF une prestation manquante est vue",
      cas(sansFilleB).some((f) => f.includes("La fille B") && f.includes("n'est pas dans le bloc")),
    ],
    [
      "POSITIF un bloc à une seule carte est refusé",
      cas(uneSeule).some((f) => f.includes("ne liste que 1 prestation")),
    ],
    [
      "POSITIF une prestation inventée est vue",
      cas(inventee).some((f) => f.includes("ne correspond à aucune page réelle")),
    ],
    [
      "POSITIF un rendu qui perd une carte est vu",
      cas(complet, rendu(complet.length - 1)).some((f) => f.includes("en perd en route")),
    ],
    ["POSITIF un bloc servi vide est vu", cas(complet, []).some((f) => f.includes("servi vide"))],
    [
      "POSITIF deux cartes vers la même page sont vues",
      cas(doublonDeLien).some((f) => f.includes("déjà listée")),
    ],
    [
      "POSITIF une carte servie qui ne mène pas au lien de la fiche est vue",
      cas(complet, renduQuiDevie).some((f) => f.includes("ne mène pas à /offres/truc/fille-a/")),
    ],
    /* --- la lecture du rendu et de la table de la maquette --- */
    ["le rendu est découpé en cartes de premier niveau", servies?.length === 2],
    ["l'intitulé de la première carte est lu", norme(servies?.[0]?.intitule) === "Machin absorbé"],
    ["le lien de chaque carte servie est lu", servies?.[1]?.liens?.[0] === "/offres/truc/fille-a/"],
    ["le lien « Décrire mon besoin » n'est pas compté comme carte", servies?.length === 2],
    ["le groupe attendu est bien de 5 prestations", attendues.length === 5],
    ["la table remapOffer de la maquette est lue", remapLu?.["/offres/chantier/"] === "/travaux-industriels/"],
  ];
  for (const [quoi, ok] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
  if (!verdicts.every(([, ok]) => ok)) process.exit(1);
  console.log(`\ntémoin conforme (${verdicts.length}/${verdicts.length}), la porte sait échouer`);
}

/* -------------------------------------------------------------- la mesure */

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pages = (Array.isArray(index) ? index : (index.pages ?? index)).filter((p) => p?.url);
const urlsConnues = new Map(pages.map((p) => [p.url, p.h1 ?? ""]));

for (const [doublon, gardee] of Object.entries(DOUBLONS)) {
  if (!urlsConnues.has(doublon) || !urlsConnues.has(gardee)) {
    console.log(`DOUBLON DÉCLARÉ CADUC : ${doublon} ou ${gardee} n'est plus dans l'index. Retirer l'exception.`);
    process.exit(1);
  }
}

const remap = litRemap(readFileSync(join(RACINE, "maquette/site-final-autonome.html"), "utf8"));
if (!remap) {
  console.log("MESURE NON CONCLUANTE : la table remapOffer n'a pas pu être lue dans la maquette.");
  console.log("Sans elle, le groupe d'une offre ne se calcule pas, et le compte attendu serait faux.");
  process.exit(1);
}

const dossier = join(RACINE, "supabase/import/gabarits-maquette");
const fiches = [];
for (const nom of readdirSync(dossier).filter((f) => f.endsWith(".json"))) {
  const fiche = JSON.parse(readFileSync(join(dossier, nom), "utf8"));
  const bloc = fiche?.contenu?.prestationsRegroupees;
  if (bloc?.prestations) fiches.push({ nom, url: fiche.url, prestations: bloc.prestations });
}

if (fiches.length === 0) {
  console.log("aucune fiche ne porte « Les prestations liées à cette offre » : rien à mesurer.");
  process.exit(1);
}

const fautes = [];
const injoignables = [];
let prestationsVues = 0;

await Promise.all(
  fiches.map(async (fiche) => {
    let cartesRendu = null;
    try {
      const r = await fetch(SITE + fiche.url, { signal: AbortSignal.timeout(30000) });
      if (!r.ok) {
        injoignables.push(`${fiche.url} : HTTP ${r.status}`);
        return;
      }
      const servies = cartesServies(await r.text());
      if (servies === null) {
        fautes.push(`${fiche.url} : la fiche déclare le bloc, le rendu servi ne le porte pas du tout`);
        return;
      }
      cartesRendu = servies;
    } catch (erreur) {
      injoignables.push(`${fiche.url} : ${erreur?.cause?.code ?? erreur?.name ?? "injoignable"}`);
      return;
    }
    prestationsVues += fiche.prestations.length;
    fautes.push(
      ...juge({
        url: fiche.url,
        attendues: groupeOffre(fiche.url, pages, remap),
        cartesFiche: fiche.prestations,
        cartesRendu,
        urlsConnues,
      }),
    );
  }),
);

/* Le verdict de couverture passe avant tout autre : conclure sur un
   échantillon muet est la pire faute qu'une porte puisse commettre. Une porte
   réseau peut avaler un fetch raté (PASSATION, pièges de mesure). */
if (injoignables.length > 0) {
  console.log(`MESURE NON CONCLUANTE : ${injoignables.length} page(s) sur ${fiches.length} n'ont pas répondu.`);
  for (const i of injoignables) console.log(`  ${i}`);
  console.log(`\nRelancer avant de croire une chute de chiffres : ${SITE}`);
  process.exit(1);
}

/* Information, pas verdict : les pages du gabarit « 03 Offre et prestation »
   qui regroupent plusieurs prestations sans porter le bloc. Le poser serait
   trancher à la place de Mehdi sur des pages dont la capture n'en a pas. Les
   hubs et les autres gabarits sont hors sujet : leur maillage a ses propres
   blocs, et les lister ici noierait le signal. */
const sansBloc = [];
for (const p of pages.filter((x) => x.gabarit === "03 Offre et prestation")) {
  if (fiches.some((f) => f.url === p.url)) continue;
  if ((remap[p.url] ?? p.url) !== p.url) continue;
  const groupe = groupeOffre(p.url, pages, remap);
  if (groupe.length >= 2) {
    sansBloc.push(`${p.url} : ${groupe.length} prestations rattachées, pas de bloc`);
  }
}

if (fautes.length > 0) {
  for (const f of fautes) console.log(`  ${f}`);
  console.log(`\n${fautes.length} défaut(s) sur ${fiches.length} bloc(s), ${prestationsVues} prestation(s) listées.`);
  process.exit(1);
}

console.log(
  /* LE COMPTE SE DIT PAR PAGE, pas en somme. « 25 prestations » est un total
     sur quatre adresses dont DEUX servent la même page : aucune page n'en
     affiche 25, la plus fournie en montre 8. Mehdi se plaint page par page, le
     verdict doit donc se lire page par page. Un relecteur adverse a relevé que
     la somme laissait croire a une richesse qu'aucune page ne porte. */
  `blocs « Les prestations liées à cette offre » conformes : ${fiches.length} bloc(s) ` +
    `(${new Set(fiches.map((f) => f.prestations.map((x) => x.titre).join("|"))).size} page(s) distincte(s)), de ` +
    `${Math.min(...fiches.map((f) => f.prestations.length))} à ${Math.max(...fiches.map((f) => f.prestations.length))} prestations par page, ` +
    `${prestationsVues} prestation(s) listées, chacune rattachée à une page réelle, ` +
    `aucune prestation du groupe oubliée, rendu servi au même compte que la fiche`,
);
if (sansBloc.length > 0) {
  console.log(`\nPour arbitrage, SANS verdict : ${sansBloc.length} offre(s) regroupent plusieurs prestations sans ce bloc.`);
  for (const s of sansBloc) console.log(`  ${s}`);
}
