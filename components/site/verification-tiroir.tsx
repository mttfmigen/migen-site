/**
 * Contrôle du tiroir tactile contre la maquette mobile v2, sans navigateur.
 *
 *   bun components/site/verification-tiroir.tsx
 *   bun components/site/verification-tiroir.tsx --controle   (témoins d'échec)
 *
 * LA RÉFÉRENCE est le bloc `menuG` de
 * `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`, RELU À CHAQUE
 * EXÉCUTION, jamais recopié : ses groupes écrits en clair (`L_`, `HD_`) sont
 * extraits du source, et ses groupes CALCULÉS (« Ressources », « Carrière »)
 * sont recalculés ici depuis `maquette/contenu/site/index.json` avec le même
 * algorithme (`ofG`, `short`). Si la maquette est ré-exportée ou si l'index
 * change, le contrôle se met à jour tout seul et refuse l'écart.
 *
 * CE QU'IL TIENT :
 * 1. Les six groupes de `TIROIR` : libellés, cibles, descriptions, sous-têtes
 *    orange, ordre, mot pour mot ceux de la maquette, après les TROIS
 *    adaptations déclarées (`/a-propos/nous-connaitre/` → `/nous-connaitre/`,
 *    etc., pages servies sur les routes statiques de `app/`). Chaque
 *    adaptation est elle-même revérifiée : la cible doit être une route
 *    réelle, la source NE DOIT PAS en être une, sinon l'adaptation ment.
 * 2. ZÉRO LIEN MORT : chaque cible du tiroir est dans l'index des pages, dans
 *    les routes statiques lues sur le disque, ou dans les réécritures de
 *    `next.config.ts` (`/diagnostic-zero-arret/`).
 * 3. REPLIER, JAMAIS RETIRER : le tiroir rendu porte les 61 liens dans le DOM
 *    alors que ses six groupes sont des `<details>` fermés. L'ancien tiroir ne
 *    rendait un groupe qu'une fois déplié.
 * 4. Les compteurs affichés valent le nombre de liens de leur groupe, et les
 *    sous-têtes et descriptions de la maquette sont rendues.
 *
 * `--controle` prouve que chaque règle sait échouer, reconnue à son message :
 * un lien vers une page hors index, un lien retiré du DOM rendu, un compteur
 * faussé, un libellé qui dérive de la maquette.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import TiroirMobile from "@/components/site/TiroirMobile";
import {
  type EntreeTiroir,
  type SectionTiroir,
  TELEPHONE_SITE,
  TIROIR,
  TIROIR_ACCUEIL,
} from "@/components/site/entete-donnees";
import {
  CONTENUS_ENTREPRISES,
  CONTENUS_TECHNICIENS,
} from "@/components/site/ressources-hub/v2/donnees";
import { type Espace, FORMATS } from "@/components/site/ressources-hub/v2/filtrage";

const CONTROLE = process.argv.includes("--controle");

/* ------------------------------------------------------------ l'inventaire */

const index: { url: string; h1?: string; title?: string; gabarit?: string }[] =
  JSON.parse(readFileSync("maquette/contenu/site/index.json", "utf8"));

/** Les routes statiques de `app/`, lues sur le disque, jamais écrites à la
 *  main (même lecture que `verification-entete.tsx`). */
function routesStatiques(dossier = "app", prefixe = "/"): string[] {
  const trouvees: string[] = [];
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    if (!entree.isDirectory()) continue;
    if (entree.name === "api") continue;
    if (entree.name.startsWith("[")) continue;
    if (entree.name.startsWith("(")) {
      trouvees.push(...routesStatiques(`${dossier}/${entree.name}`, prefixe));
      continue;
    }
    const chemin = `${dossier}/${entree.name}`;
    const url = `${prefixe}${entree.name}/`;
    if (existsSync(`${chemin}/page.tsx`)) trouvees.push(url);
    trouvees.push(...routesStatiques(chemin, url));
  }
  return trouvees;
}

/** Les chemins servis par réécriture (`/diagnostic-zero-arret/`), lus dans
 *  `next.config.ts` : une page servie sous le domaine sans dossier `app/`. */
function sourcesReecrites(): string[] {
  const config = readFileSync("next.config.ts", "utf8");
  return [...config.matchAll(/source:\s*"(\/[^":]+)\/:[^"]*"/g)].map(
    (m) => `${m[1]}/`,
  );
}

const statiques = routesStatiques();
const reecrites = sourcesReecrites();
const connues = new Set<string>([
  "/",
  ...index.map((entree) => entree.url),
  ...statiques,
  ...reecrites,
]);
assert.ok(statiques.length >= 12, `routes statiques mal lues : ${statiques.length}`);
assert.ok(
  reecrites.includes("/diagnostic-zero-arret/"),
  "la réécriture /diagnostic-zero-arret/ n'est plus lue dans next.config.ts",
);
assert.ok(connues.size >= 248, `inventaire trop court : ${connues.size}`);

function exigeLiensConnus(sections: readonly SectionTiroir[]): string[] {
  const cibles = [
    TIROIR_ACCUEIL.href,
    ...sections.flatMap((section) =>
      section.entrees.flatMap((entree) =>
        entree.type === "lien" ? [entree.href] : [],
      ),
    ),
  ];
  for (const cible of cibles) {
    assert.ok(
      connues.has(cible),
      `lien du tiroir hors de l'index des pages : ${cible} (ni page de ` +
        "l'index, ni route statique, ni réécriture)",
    );
  }
  return cibles;
}

/* ----------------------------------------- la maquette, relue puis rejouée */

const dc = readFileSync(
  "maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html",
  "utf8",
);

/** Un objet littéral `{ "clé": "valeur", … }` du source de la maquette. */
function objetLitteral(nom: string): Record<string, string> {
  const brut = new RegExp(`${nom}\\s*=\\s*\\{([^}]*)\\}`).exec(dc)?.[1];
  assert.ok(brut, `constante ${nom} introuvable dans la maquette`);
  return Object.fromEntries(
    [...brut.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]),
  );
}

const REMAP = objetLitteral("REMAP");
const NATIVE = objetLitteral("const NATIVE");

const parUrl = new Map(index.map((entree) => [entree.url, entree]));
const ok = (href: string) =>
  href === "/contact/" || href === "/" || parUrl.has(href);

/** Le `short()` de la maquette, pour les gabarits que les groupes calculés
 *  traversent (11 sous-rubrique, 01 article, 07 métier). Les autres branches
 *  ne sont pas portées : si l'index les faisait entrer dans le menu, le
 *  contrôle tombe et demande le portage plutôt que de deviner. */
function court(entree: { url: string; h1?: string; gabarit?: string }): string {
  const gabarit = /(\d{1,2})/.exec(String(entree.gabarit ?? ""))?.[1] ?? "";
  const code = gabarit.padStart(2, "0");
  assert.ok(
    ["11", "01", "07"].includes(code),
    `gabarit ${code} dans un groupe calculé du menu : porter la branche ` +
      `short() correspondante (${entree.url})`,
  );
  const h1 = String(entree.h1 ?? "").replace(/\s+/g, " ").trim();
  const parties = h1.split(/\s*[:—–]\s+/);
  const texte =
    parties.length > 1 && code === "11" ? parties.slice(1).join(" : ") : parties[0];
  return texte.length > 54
    ? `${texte.slice(0, texte.lastIndexOf(" ", 52))}…`
    : texte;
}

/** Les pages `/famille/x/` de l'index, hors redirections, l'`ofG` de la maquette. */
function pagesDeFamille(famille: string): typeof index {
  return index.filter((entree) => {
    const segments = entree.url.split("/").filter(Boolean);
    return (
      segments[0] === famille && segments.length === 2 && !REMAP[entree.url]
    );
  });
}

/**
 * Les trois adresses de la maquette rapportées aux routes réelles du site,
 * déclarées ici et dans `entete-donnees.ts`. Chacune est revérifiée dans les
 * deux sens : la cible existe, la source n'existe pas. Le jour où le site sert
 * `/a-propos/valeurs/`, le contrôle tombe et demande de retirer l'adaptation.
 */
const ADAPTATIONS: Record<string, string> = {
  "/a-propos/nous-connaitre/": "/nous-connaitre/",
  "/a-propos/valeurs/": "/valeurs/",
  "/a-propos/rse/": "/rse/",
};
for (const [source, cible] of Object.entries(ADAPTATIONS)) {
  assert.ok(connues.has(cible), `adaptation vers une route inconnue : ${cible}`);
  assert.ok(
    !connues.has(source),
    `${source} est maintenant servie : retirer l'adaptation vers ${cible}`,
  );
}

/** Le `menuG` de la maquette, groupes écrits extraits du source, groupes
 *  calculés rejoués sur l'index, adaptations appliquées, filtre `okM` compris. */
function menuAttendu(): SectionTiroir[] {
  const debut = dc.indexOf("const menuG = [");
  const fin = dc.indexOf("].map(m => {", debut);
  assert.ok(debut > 0 && fin > debut, "bloc menuG introuvable dans la maquette");
  const bloc = dc.slice(debut, fin);

  const groupes: SectionTiroir[] = [];
  const morceaux = bloc.split(/\{ l: "/).slice(1);
  assert.equal(morceaux.length, 6, "la maquette ne déclare plus six groupes");
  for (const morceau of morceaux) {
    const libelle = morceau.slice(0, morceau.indexOf('"'));
    const entrees: EntreeTiroir[] = [];
    for (const famille of morceau.matchAll(/ofG\("([a-z-]+)", 2\)/g)) {
      for (const page of pagesDeFamille(famille[1])) {
        entrees.push({ type: "lien", libelle: court(page), href: page.url });
      }
    }
    for (const appel of morceau.matchAll(
      /(L_|HD_)\("([^"]+)"(?:, "([^"]+)")?(?:, "([^"]+)")?\)/g,
    )) {
      if (appel[1] === "HD_") {
        entrees.push({ type: "sous-tete", libelle: appel[2] });
      } else {
        entrees.push({
          type: "lien",
          libelle: appel[2],
          href: ADAPTATIONS[appel[3] ?? ""] ?? appel[3] ?? "",
          ...(appel[4] ? { description: appel[4] } : {}),
        });
      }
    }
    /* Le filtre `okM` de la maquette : une cible hors index n'entre que si
       elle est une page « native » de son prototype. Ici, les natives sont
       déjà rapportées aux routes réelles, donc connues. */
    const gardees = entrees.filter(
      (entree) =>
        entree.type === "sous-tete" ||
        ok(entree.href) ||
        Boolean(NATIVE[entree.href]) ||
        connues.has(entree.href),
    );
    if (gardees.some((entree) => entree.type === "lien")) {
      groupes.push({ libelle, entrees: gardees });
    }
  }
  return groupes;
}

/**
 * LE SEUL ÉCART À LA MAQUETTE MOBILE, déclaré le 14/10 et demandé par Mehdi :
 * le groupe « Ressources » ne mène plus qu'à la maquette Ressources v2. Ses
 * entrées calculées par la maquette mobile (sous-rubriques de l'ancienne
 * maquette, guides) sont REMPLACÉES par la sous-tête « À la une », les trois
 * articles que le hub /ressources/ met à la une, et « Toutes les ressources »
 * avec les vrais comptes des deux espaces du hub. Recalculé ici depuis le hub
 * lui-même : la liste `UNE` de `HubRessources.tsx`, `donnees.ts` et `FORMATS`.
 * Que le hub change, et le tiroir doit suivre.
 */
function resumeDuHub(): string {
  const espaces: [Espace, string][] = [["ent", "Entreprises"], ["tech", "Techniciens"]];
  const contenus = { ent: CONTENUS_ENTREPRISES, tech: CONTENUS_TECHNICIENS };
  return espaces
    .map(([cle, nom]) => {
      const comptes = FORMATS[cle]
        .filter(([format]) => format !== "all")
        .map(([format, libelle]) => [contenus[cle].filter((x) => x.format === format).length, libelle] as const)
        .filter(([nombre]) => nombre > 0)
        .map(([nombre, libelle]) => `${nombre} ${libelle.toLowerCase()}`);
      return `${nom} : ${comptes.join(", ")}.`;
    })
    .join(" ");
}

function avecLaUneDuHub(groupes: SectionTiroir[]): SectionTiroir[] {
  const source = readFileSync(
    "components/site/ressources-hub/v2/HubRessources.tsx",
    "utf8",
  );
  const bloc = source.match(/const UNE = \[([\s\S]*?)\]/)?.[1] ?? "";
  const urls = [...bloc.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(urls.length, 3, "la liste UNE du hub /ressources/ est introuvable");
  const une: EntreeTiroir[] = urls.map((url) => {
    const article = CONTENUS_ENTREPRISES.find((x) => x.url === url);
    assert.ok(article, `article à la une inconnu des données du hub : ${url}`);
    return {
      type: "lien",
      libelle: article.titre,
      href: article.url,
      description: `${article.format} · ${article.minutes} min de lecture`,
    };
  });
  return groupes.map((groupe) => {
    if (groupe.libelle !== "Ressources") return groupe;
    const tout = groupe.entrees.find(
      (e) => e.type === "lien" && e.href === "/ressources/",
    );
    assert.ok(tout, "la maquette mobile ne mène plus au hub /ressources/");
    return {
      ...groupe,
      entrees: [
        { type: "sous-tete", libelle: "À la une" },
        ...une,
        { ...tout, description: resumeDuHub() },
      ],
    };
  });
}

const attendu = avecLaUneDuHub(menuAttendu());

/* -------------------------------------------------- 1 · les données, mot à mot */

function exigeConformeALaMaquette(sections: readonly SectionTiroir[]): void {
  assert.deepEqual(
    sections,
    attendu,
    "TIROIR dérive du menuG de la maquette mobile v2 (libellé, cible, " +
      "description, sous-tête ou ordre)",
  );
}

exigeConformeALaMaquette(TIROIR);
assert.deepEqual(
  TIROIR_ACCUEIL,
  { libelle: "Accueil", href: "/" },
  "le lien Accueil du tiroir n'est plus celui de la maquette",
);

/* ------------------------------------------------------- 2 · zéro lien mort */

const cibles = exigeLiensConnus(TIROIR);
for (const cible of cibles) {
  assert.ok(cible.endsWith("/"), `cible du tiroir sans slash final : ${cible}`);
}

/* ------------------------------------- 3 et 4 · le rendu, replié mais entier */

// Le menu FERMÉ : c'est l'état de la page servie, celui que Google lit. Ses
// liens doivent y être, sous un `hidden` qui les cache aux yeux et au clavier.
const rendu = renderToStaticMarkup(
  <TiroirMobile
    ouvert={false}
    landingPage={false}
    onFermer={() => {}}
    telephone={TELEPHONE_SITE}
    hrefCta="/contact/"
    libelleCta="Décrire mon besoin"
  />,
);
assert.ok(/^<div hidden="">/.test(rendu), "le menu fermé doit porter hidden, sinon il s'affiche");

const sansSlash = (chemin: string) =>
  chemin.length > 1 && chemin.endsWith("/") ? chemin.slice(0, -1) : chemin;

/** REPLIER, JAMAIS RETIRER : chaque cible est dans le DOM rendu, groupes
 *  fermés compris, et chaque groupe est bien un `<details>`. */
function exigeToutDansLeDom(html: string): void {
  const dansLeDom = new Set(
    [...html.matchAll(/href="([^"#]*)"/g)].map((m) => sansSlash(m[1])),
  );
  for (const cible of cibles) {
    assert.ok(
      dansLeDom.has(sansSlash(cible)),
      `lien du tiroir absent du DOM rendu : ${cible}. La règle de la ` +
        "maquette mobile est « replier, jamais retirer ».",
    );
  }
  const groupes = html.match(/<details\b[^>]*>/g) ?? [];
  assert.equal(
    groupes.length,
    TIROIR.length,
    "chaque groupe du tiroir doit être un <details> natif",
  );
  for (const groupe of groupes) {
    assert.ok(
      groupe.includes('name="mg-tiroir-groupes"'),
      "un groupe du tiroir a perdu son name : l'accordéon exclusif de la maquette",
    );
  }
}

exigeToutDansLeDom(rendu);

/** Les compteurs rendus : le nombre affiché à droite d'un groupe vaut le
 *  nombre de liens de ce groupe, comme le `mg.n` de la maquette. */
function exigeCompteursJustes(html: string): void {
  const bascules = [...html.matchAll(/<summary[\s\S]*?<\/summary>/g)];
  assert.equal(bascules.length, TIROIR.length, "une bascule de groupe manque");
  bascules.forEach((bascule, rang) => {
    const section = TIROIR[rang];
    const nombre = section.entrees.filter((e) => e.type === "lien").length;
    const textes = [...bascule[0].matchAll(/>([^<>]+)</g)].map((m) => m[1].trim());
    assert.ok(
      textes.includes(section.libelle),
      `la bascule ${rang} ne porte plus « ${section.libelle} »`,
    );
    assert.ok(
      textes.includes(String(nombre)),
      `compteur du groupe « ${section.libelle} » : ${nombre} attendu dans la ` +
        `bascule, trouvé « ${textes.join(" / ")} »`,
    );
  });
}

exigeCompteursJustes(rendu);

// Les sous-têtes orange et les descriptions de la maquette sont rendues.
for (const section of TIROIR) {
  for (const entree of section.entrees) {
    if (entree.type === "sous-tete") {
      assert.ok(
        rendu.includes(`text-transform:uppercase;color:var(--acc)">${entree.libelle}<`),
        `sous-tête absente ou sans son dessin orange : « ${entree.libelle} »`,
      );
    } else if (entree.description) {
      assert.ok(
        rendu.includes(entree.description),
        `description absente du rendu : « ${entree.description} »`,
      );
    }
  }
}

// « Accueil » en tête, avant le premier groupe.
assert.ok(
  rendu.indexOf(">Accueil<") > -1 &&
    rendu.indexOf(">Accueil<") < rendu.indexOf("<details"),
  "le lien Accueil doit précéder les groupes du tiroir",
);

/* ------------------------------------------------------------- les témoins */

if (CONTROLE) {
  // 1 · un lien vers une page absente de l'index doit tomber.
  const falsifie: SectionTiroir[] = TIROIR.map((section, rang) =>
    rang === 0
      ? {
          ...section,
          entrees: section.entrees.map((entree, i) =>
            i === 0 && entree.type === "lien"
              ? { ...entree, href: "/page-inventee/" }
              : entree,
          ),
        }
      : section,
  );
  assert.throws(
    () => exigeLiensConnus(falsifie),
    /hors de l'index des pages : \/page-inventee\//,
    "le contrôle des liens laisse passer une page hors index",
  );

  // 2 · un lien retiré du DOM rendu (texte disparu) doit tomber.
  const sansPartenaires = rendu.replace(
    /<a[^>]*href="\/partenaires[^>]*>[\s\S]*?<\/a>/,
    "",
  );
  assert.notEqual(sansPartenaires, rendu, "témoin mal construit : rien retiré");
  assert.throws(
    () => exigeToutDansLeDom(sansPartenaires),
    /absent du DOM rendu : \/partenaires\//,
    "le contrôle du DOM laisse passer un lien retiré d'un groupe replié",
  );

  // 3 · un compteur faussé doit tomber.
  const compteurFausse = rendu.replace(">23<", ">22<");
  assert.notEqual(compteurFausse, rendu, "témoin mal construit : compteur intact");
  assert.throws(
    () => exigeCompteursJustes(compteurFausse),
    /compteur du groupe/,
    "le contrôle des compteurs laisse passer un nombre faux",
  );

  // 4 · un libellé qui dérive de la maquette doit tomber.
  const libelleDerive: SectionTiroir[] = TIROIR.map((section, rang) =>
    rang === 2
      ? {
          ...section,
          entrees: section.entrees.map((entree, i) =>
            i === 0 && entree.type === "lien"
              ? { ...entree, libelle: "DANONE, lignes de production" }
              : entree,
          ),
        }
      : section,
  );
  assert.throws(
    () => exigeConformeALaMaquette(libelleDerive),
    /dérive du menuG/,
    "le contrôle de conformité laisse passer un libellé réécrit",
  );
}

const nombreDeLiens = cibles.length;
console.log(
  `tiroir vérifié contre la maquette mobile v2 : ${TIROIR.length} groupes, ` +
    `${nombreDeLiens} liens (Accueil compris), tous dans l'inventaire ` +
    `(${connues.size} adresses) ; groupe Carrière recalculé depuis l'index, ` +
    `groupe Ressources depuis le hub /ressources/ ; les ${TIROIR.length} groupes sont des <details> et les ` +
    `${nombreDeLiens} liens restent dans le DOM replié ; compteurs, ` +
    `sous-têtes et descriptions rendus` +
    (CONTROLE ? " ; 4 témoins d'échec tombés." : "."),
);
