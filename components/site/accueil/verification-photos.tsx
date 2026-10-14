/**
 * LES PHOTOS DE L'ACCUEIL : répétitions, cadrage, sujet, tuiles sans photo.
 *
 *   bun components/site/accueil/verification-photos.tsx
 *   bun components/site/accueil/verification-photos.tsx --controle
 *
 * POURQUOI CETTE PORTE EXISTE. Trois retours de Mehdi, le 12/10, tous sur les
 * photos de l'accueil, aucun couvert par une porte du dépôt :
 *
 *   « Bloc PARTEZ DE VOTRE BESOIN : il faut changer les photos des cases
 *     ça va pas du tout »
 *   « NOS HUBS : la photo de Metz ne correspond pas, la photo de Bordeaux
 *     est mal cadrée »
 *   « les Bento offres et secteur ne changent pas d'image »
 *
 * CE QU'ELLE MESURE, et pourquoi chaque mesure plutôt qu'une autre.
 *
 *  1. RÉPÉTITION DANS UN MÊME BENTO. Les sept cases du pavage « Partez de votre
 *     besoin » doivent servir sept fichiers différents, et les hubs qui ont une
 *     photo autant de fichiers que de hubs. C'est la forme la plus directe de
 *     « ne change pas d'image ».
 *
 *  2. RÉPÉTITION D'UN BLOC À L'AUTRE. Mesurée au 14/10 en production :
 *     `/assets/web/sv-convoyeur.jpg` servait le focus Résidence ET le bento des
 *     secteurs. `scripts/verifie-photos-du-bloc.mjs` le voit sur la page SERVIE,
 *     celle-ci le voit à la SOURCE, avant le déploiement, et elle voit en plus
 *     les photos posées en fond CSS, que l'autre ne lit pas.
 *
 *  3. CADRAGE POSÉ SUR UN AXE QUI NE DÉBORDE PAS. C'est le piège qui a coûté
 *     une correction pour rien : `cover` n'agrandit l'image que jusqu'à couvrir
 *     le cadre, donc elle ne déborde que d'UN côté. La carte de Bordeaux portait
 *     `object-position: center 38%` alors que son débordement vertical vaut
 *     0 pixel. Le réglage ne changeait rien, et il avait l'air d'une réparation.
 *     Le calcul se fait sur les dimensions RÉELLES du fichier, lues dans son
 *     en-tête JPEG, jamais sur une valeur recopiée.
 *
 *  4. SUJET D'UNE PHOTO DE HUB COUPÉ PAR LE BORD. Mesuré en pixels une fois,
 *     déclaré ici avec sa méthode, vérifié par le calcul à chaque passage.
 *
 *  5. TUILE SANS PHOTO : Metz et Dijon n'ont aucune photo de ville sous licence
 *     au dépôt. La porte exige qu'ils n'en portent AUCUNE, et aucun texte
 *     alternatif : une scène d'usine sous le nom de Metz est exactement ce que
 *     Mehdi a refusé, et « Site industriel en Lorraine » sous une photo de
 *     cimenterie était une donnée inventée.
 *
 *  6. SUJET D'UNE CASE DU BENTO BESOINS. Une photo du registre qui ne porte que
 *     des thèmes de SECTEUR (metallurgie, agro, chimie…) montre une industrie,
 *     pas un geste de maintenance. `metal-fonderie-coulee.jpg`, « Fondeur en
 *     tenue aluminisée face à une coulée de métal », illustrait l'offre
 *     Résidence : c'est un opérateur de production, pas une équipe de
 *     maintenance.
 *
 *  7. TEXTE ALTERNATIF D'UNE PHOTO DU REGISTRE : celui du registre, mot pour
 *     mot. Une description retapée à la main finit par dériver de sa photo.
 *
 *  8. UNE PHOTO DE HUB OU DE RÉALISATION N'EST JAMAIS MUETTE. Mesuré le 14/10
 *     en production : le second passage du rail des hubs (huit villes) et les
 *     trois cartes « Nos dernières réalisations » sortaient avec `alt=""`. La
 *     règle 7 ne le voyait pas, elle saute un texte vide. Celle-ci exige un
 *     texte sur CHAQUE image de ces deux blocs, doublon décoratif compris : il
 *     est `aria-hidden` pour un lecteur d'écran, pas pour un moteur d'images.
 *
 * ELLE SAIT ÉCHOUER, et elle le prouve : `--controle` rejoue chaque règle sur un
 * jeu fabriqué qui la viole et refuse de conclure si la règle l'accepte, puis
 * sur un jeu conforme et refuse de conclure si la règle le rejette. Une porte
 * qui ne tombe jamais ne vaut rien.
 */

import assert from "node:assert/strict";
import { openSync, readSync, closeSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

import AvantApresBascule from "@/components/site/accueil/AvantApresBascule";
import BandeauVerbe from "@/components/site/accueil/BandeauVerbe";
import BentoBesoins from "@/components/site/accueil/BentoBesoins";
import ChiffresCroissance from "@/components/site/accueil/ChiffresCroissance";
import DernieresRealisations from "@/components/site/accueil/DernieresRealisations";
import FocusResidence from "@/components/site/accueil/FocusResidence";
import FriseHistoire from "@/components/site/accueil/FriseHistoire";
import GrilleOffres from "@/components/site/accueil/GrilleOffres";
import Hero from "@/components/site/accueil/Hero";
import HubsAccueil from "@/components/site/accueil/HubsAccueil";
import MethodeQuatreEtapes from "@/components/site/accueil/MethodeQuatreEtapes";
import ParcoursMobile from "@/components/site/accueil/ParcoursMobile";
import PourquoiExternaliser from "@/components/site/accueil/PourquoiExternaliser";
import ProblematiqueClient from "@/components/site/accueil/ProblematiqueClient";
import ProcessSelection from "@/components/site/accueil/ProcessSelection";
import SecteursAccueil from "@/components/site/accueil/SecteursAccueil";
import TemoignagesClients from "@/components/site/accueil/TemoignagesClients";
import { VUE_AVANT, VUE_AVEC } from "@/components/site/accueil/avant-apres-donnees";
import { BESOINS } from "@/components/site/accueil/bento-besoins-donnees";
import { ETAPES_METHODE } from "@/components/site/accueil/methode-etapes-donnees";
import { PHOTO_DU_HUB, HUBS_SANS_PHOTO } from "@/components/site/implantations/photos-hubs";
import { descriptionPhoto } from "@/lib/descriptions-photos";

const CONTROLE = process.argv.includes("--controle");

/* ===================================================================== outils
   Des fonctions PURES, parce que le témoin a besoin de les nourrir avec des
   données fabriquées. Une règle qui ne sait lire que le vrai site ne peut pas
   prouver qu'elle sait dire non. */

/** Le fichier désigné par une adresse d'image, que Next l'ait optimisée ou non. */
export function fichierDe(src: string): string | null {
  let brut = src;
  const dansUrl = brut.match(/[?&]url=([^&]+)/);
  if (dansUrl) brut = dansUrl[1]!;
  try {
    brut = decodeURIComponent(brut);
  } catch {
    /* déjà décodé */
  }
  brut = brut.split(/[?#]/)[0]!;
  return brut.includes("/") || brut.endsWith(".jpg") ? brut : null;
}

/** Un logo n'est pas une photo : il se répète d'un bout à l'autre, et c'est voulu. */
export function estUnLogo(fichier: string): boolean {
  const nom = fichier.split("/").pop() ?? "";
  return (
    fichier.includes("/assets/logos/") ||
    fichier.includes("/assets/clients/") ||
    fichier.includes("/assets/fab/") ||
    fichier.includes("/assets/team/") ||
    /^logo[-.]/i.test(nom) ||
    nom.endsWith(".svg")
  );
}

/** Les photos d'un fragment de HTML : balises `img` et fonds CSS `url(...)`. */
export function photosDuHtml(html: string): string[] {
  const brutes: string[] = [];
  for (const m of html.matchAll(/<img\b[^>]*?\bsrc="([^"]+)"/g)) brutes.push(m[1]!);
  for (const m of html.matchAll(/url\(&#x27;([^&]+)&#x27;\)/g)) brutes.push(m[1]!);
  for (const m of html.matchAll(/url\('([^']+)'\)/g)) brutes.push(m[1]!);
  const vues = new Set<string>();
  for (const b of brutes) {
    const f = fichierDe(b);
    if (f && !estUnLogo(f)) vues.add(f);
  }
  return [...vues];
}

/** Les dimensions d'un JPEG, lues dans son en-tête. Aucune dépendance. */
export function dimensionsJpeg(chemin: string): { largeur: number; hauteur: number } {
  const fd = openSync(chemin, "r");
  try {
    const tete = Buffer.alloc(2);
    readSync(fd, tete, 0, 2, 0);
    assert.equal(tete.readUInt16BE(0), 0xffd8, `${chemin} n'est pas un JPEG`);
    let pos = 2;
    const tampon = Buffer.alloc(9);
    for (;;) {
      const lus = readSync(fd, tampon, 0, 9, pos);
      assert.ok(lus >= 4, `fin de ${chemin} sans segment de dimensions`);
      assert.equal(tampon[0], 0xff, `segment JPEG invalide dans ${chemin}`);
      const marqueur = tampon[1]!;
      const taille = tampon.readUInt16BE(2);
      // SOF0..SOF15, hors marqueurs de table (C4, C8, CC)
      if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
        return { hauteur: tampon.readUInt16BE(5), largeur: tampon.readUInt16BE(7) };
      }
      pos += 2 + taille;
    }
  } finally {
    closeSync(fd);
  }
}

/** La fraction d'un terme d'`object-position` : « center », « top », « 38% ». */
export function fraction(terme: string, axe: "x" | "y"): number {
  const t = terme.trim().toLowerCase();
  if (t === "center") return 0.5;
  if (t === (axe === "x" ? "left" : "top")) return 0;
  if (t === (axe === "x" ? "right" : "bottom")) return 1;
  const pc = t.match(/^(-?\d+(?:\.\d+)?)%$/);
  assert.ok(pc, `terme de cadrage illisible : « ${terme} »`);
  return Number(pc[1]) / 100;
}

/** La fenêtre de la photo visible dans un cadre, en `object-fit: cover`. */
export function fenetreCover(
  largeur: number,
  hauteur: number,
  cadreL: number,
  cadreH: number,
  cadrage: string,
): { x0: number; x1: number; debordX: number; debordY: number } {
  /* Seul le terme HORIZONTAL sert ici : les dix cartes de hub ont un cadre plus
     haut que large, leurs photos paysage ne débordent donc que de ce côté, et
     c'est la fenêtre horizontale qui décide si un monument est coupé. Le terme
     vertical reste lu par `cadragesInoperants`, qui juge les deux axes. */
  const [tx = "center"] = cadrage.trim().split(/\s+/);
  const e = Math.max(cadreL / largeur, cadreH / hauteur);
  const debordX = largeur * e - cadreL;
  const debordY = hauteur * e - cadreH;
  const x0 = (debordX * fraction(tx, "x")) / e;
  return { x0, x1: x0 + cadreL / e, debordX, debordY };
}

/* ====================================================== les règles, en pur */

/** Deux entrées d'un même bento ne montrent jamais le même fichier. */
export function repetitionsDansLeBento(photos: readonly string[]): string[] {
  const vues = new Map<string, number>();
  for (const p of photos) vues.set(p, (vues.get(p) ?? 0) + 1);
  return [...vues]
    .filter(([, n]) => n > 1)
    .map(([p, n]) => `${p} servie ${n} fois dans le même bento`);
}

/** Un même fichier ne sert jamais deux blocs différents de l'accueil. */
export function repetitionsEntreBlocs(parBloc: ReadonlyMap<string, readonly string[]>): string[] {
  const ou = new Map<string, string[]>();
  for (const [bloc, photos] of parBloc) {
    for (const p of new Set(photos)) ou.set(p, [...(ou.get(p) ?? []), bloc]);
  }
  return [...ou]
    .filter(([, blocs]) => blocs.length > 1)
    .map(([p, blocs]) => `${p} servie par ${blocs.length} blocs : ${blocs.join(" + ")}`);
}

/**
 * Un cadrage dont le terme actif porte sur un axe SANS débordement ne change
 * rien. C'est le défaut qui se déguise en réparation.
 */
export function cadragesInoperants(
  cartes: readonly { nom: string; largeur: number; hauteur: number; cadrage?: string }[],
  cadreL: number,
  cadreH: number,
): string[] {
  const defauts: string[] = [];
  for (const c of cartes) {
    if (!c.cadrage) continue;
    const [tx = "center", ty = "center"] = c.cadrage.trim().split(/\s+/);
    const { debordX, debordY } = fenetreCover(c.largeur, c.hauteur, cadreL, cadreH, c.cadrage);
    if (debordX < 1 && fraction(tx, "x") !== 0.5) {
      defauts.push(`${c.nom} : « ${c.cadrage} » règle l'axe horizontal, qui ne déborde pas`);
    }
    if (debordY < 1 && fraction(ty, "y") !== 0.5) {
      defauts.push(`${c.nom} : « ${c.cadrage} » règle l'axe vertical, qui ne déborde pas`);
    }
  }
  return defauts;
}

/** Le sujet déclaré d'une photo doit tenir dans la fenêtre que le cadre montre. */
export function sujetsCoupes(
  cartes: readonly {
    nom: string;
    largeur: number;
    hauteur: number;
    cadrage?: string;
    sujet?: { de: number; a: number; quoi: string };
  }[],
  cadreL: number,
  cadreH: number,
): string[] {
  const defauts: string[] = [];
  for (const c of cartes) {
    if (!c.sujet) continue;
    const f = fenetreCover(c.largeur, c.hauteur, cadreL, cadreH, c.cadrage ?? "center");
    if (c.sujet.de < f.x0 - 0.5 || c.sujet.a > f.x1 + 0.5) {
      defauts.push(
        `${c.nom} : ${c.sujet.quoi} occupe les colonnes ${c.sujet.de} à ${c.sujet.a}, ` +
          `la fenêtre ne montre que ${Math.round(f.x0)} à ${Math.round(f.x1)}`,
      );
    }
  }
  return defauts;
}

/**
 * Une carte de hub déclaré SANS photo ne doit en servir aucune.
 *
 * La carte se repère par la pastille qui porte le nom de la ville ; on remonte
 * à l'ancre qui l'enveloppe et on regarde si elle contient une image.
 */
export function tuilesAvecPhotoInterdite(html: string, villes: readonly string[]): string[] {
  const defauts: string[] = [];
  for (const ville of villes) {
    const i = html.indexOf(`>${ville}<`);
    if (i === -1) {
      defauts.push(`la carte de ${ville} a disparu du rail`);
      continue;
    }
    const debut = html.lastIndexOf("<a ", i);
    const fin = html.indexOf("</a>", i);
    if (debut === -1 || fin === -1) {
      defauts.push(`la carte de ${ville} n'est plus une ancre : la mesure ne sait plus la lire`);
      continue;
    }
    if (html.slice(debut, fin).includes("<img")) {
      defauts.push(
        `${ville} sert une photo alors qu'aucune n'est sous licence : une scène ` +
          `d'usine sous le nom d'une ville est précisément le défaut du 12/10`,
      );
    }
  }
  return defauts;
}

/** Les images d'un fragment HTML sorties sans texte alternatif, absent ou vide. */
export function photosSansTexte(html: string): string[] {
  return [...html.matchAll(/<img\b[^>]*>/g)]
    .filter((m) => !(m[0].match(/\balt="([^"]*)"/)?.[1] ?? "").trim())
    .map((m) => fichierDe(m[0].match(/\bsrc="([^"]+)"/)?.[1] ?? "") ?? "image sans adresse");
}

/* Le vocabulaire du registre, partagé en trois.
   `technicien` et `site-industriel` ne décident rien : 291 photos sur 385
   portent la première, elle ne discrimine pas (même constat que
   `scripts/verifie-photo-sujet.mjs`). */
const THEMES_DE_GESTE = new Set([
  "mecanique", "automatisme", "robotique", "depannage", "electricite",
  "tuyauterie", "soudure", "chaudronnerie", "levage", "hydraulique",
  "pneumatique", "arret-technique", "bureau-etudes", "equipe",
]);
const THEMES_DE_SECTEUR = new Set([
  "metallurgie", "agro", "chimie", "pharma", "auto", "aeronautique",
  "menuiserie", "cimenterie", "logistique", "nucleaire", "energie",
]);
const THEMES_NEUTRES = new Set(["technicien", "site-industriel"]);

/**
 * Une case du bento besoins montre un GESTE de maintenance, pas une industrie.
 * Une photo hors registre (celles de la maquette) n'est pas jugée : elle vient
 * du client, et nous ne réécrivons pas ses choix.
 */
export function casesSansGeste(
  cases: readonly { id: string; img: string }[],
  themesParFichier: ReadonlyMap<string, readonly string[]>,
): string[] {
  const defauts: string[] = [];
  for (const c of cases) {
    const nom = c.img.split("/").pop() ?? "";
    const themes = themesParFichier.get(nom);
    if (!themes) continue;
    if (!themes.some((t) => THEMES_DE_GESTE.has(t))) {
      defauts.push(
        `case « ${c.id} » : ${nom} ne porte aucun geste de maintenance, ` +
          `seulement ${themes.join(", ")}`,
      );
    }
  }
  return defauts;
}

/* ============================================ les données réelles de l'accueil */

const RACINE = new URL("../../../", import.meta.url);
const registre = JSON.parse(
  readFileSync(new URL("public/assets/photos/registre.json", RACINE), "utf8"),
) as { fichier: string; themes: string[] }[];
const THEMES = new Map(registre.map((e) => [e.fichier, e.themes]));

/* Le vocabulaire doit rester COMPLET : un thème ajouté au registre et classé
   nulle part ferait silencieusement dériver la règle 6. */
const nonClasses = [...new Set(registre.flatMap((e) => e.themes))].filter(
  (t) => !THEMES_DE_GESTE.has(t) && !THEMES_DE_SECTEUR.has(t) && !THEMES_NEUTRES.has(t),
);
assert.deepEqual(
  nonClasses,
  [],
  `thème(s) du registre classé(s) nulle part : ${nonClasses.join(", ")}. ` +
    `Les ranger en geste, en secteur ou en neutre avant de croire la règle 6.`,
);

/** Le cadre d'une carte de hub, écrit dans `HubsAccueil.tsx`. */
const CADRE_HUB = { largeur: 300, hauteur: 400 };

/**
 * LES SUJETS MESURÉS, un seul à ce jour, et sa méthode est écrite.
 *
 * Bordeaux : luminance du JPEG, bande des rangées 20 % à 62 % (au-dessus de la
 * ligne de toits, détectée à 66,7 % de la hauteur), colonnes dont plus de trois
 * pixels tombent 40 niveaux sous la médiane du ciel. Le bloc Saint-Michel, la
 * nef et sa flèche, occupe les colonnes 929 à 1527 sur 2000. Centrée, la carte
 * ne montrait que 499 à 1501 : la flèche était tranchée par le bord droit.
 */
const SUJETS: Readonly<Record<string, { de: number; a: number; quoi: string }>> = {
  Bordeaux: { de: 929, a: 1527, quoi: "l'église et la flèche Saint-Michel" },
};

/** Les cadrages déclarés, relus dans le composant plutôt que recopiés. */
const sourceHubs = readFileSync(new URL("components/site/accueil/HubsAccueil.tsx", RACINE), "utf8");
function cadrageDeclare(ville: string): string | undefined {
  const i = sourceHubs.indexOf(`ville: "${ville}"`);
  if (i === -1) return undefined;
  const fin = sourceHubs.indexOf("  {", i);
  const bloc = sourceHubs.slice(i, fin === -1 ? sourceHubs.length : fin);
  return bloc.match(/cadrage:\s*"([^"]+)"/)?.[1];
}

/* Le fichier sur DISQUE d'une photo de hub. Sous `bun`, l'import d'un `.jpg`
   rend son chemin absolu ; sous Next, un objet dont `src` est une adresse
   servie. On ne garde donc que le nom de fichier, et on le rouvre dans
   `components/site/accueil/hubs/` : la porte mesure les octets, pas une URL. */
function surLeDisque(photo: string | { src: string }): string {
  const nom = (typeof photo === "string" ? photo : photo.src).split("/").pop()!;
  return fileURLToPath(new URL(`components/site/accueil/hubs/${nom}`, RACINE));
}

const CARTES_HUB = Object.entries(PHOTO_DU_HUB).map(([ville, photo]) => {
  const { largeur, hauteur } = dimensionsJpeg(surLeDisque(photo));
  return { nom: ville, largeur, hauteur, cadrage: cadrageDeclare(ville), sujet: SUJETS[ville] };
});

/* Les blocs de l'accueil qui portent une photo, dans l'ordre de `app/page.tsx`.
   La liste est COMPLÈTE et non filtrée : une photo ajoutée demain à un bloc qui
   n'en a pas aujourd'hui doit tomber dans la mesure, pas passer dessous. */
const BLOCS: readonly [string, ReactElement][] = [
  ["Hero", <Hero key="hero" />],
  ["ParcoursMobile", <ParcoursMobile key="parcours" />],
  ["GrilleOffres", <GrilleOffres key="offres" />],
  ["ProblematiqueClient", <ProblematiqueClient key="pb" />],
  ["ProcessSelection", <ProcessSelection key="sel" />],
  ["BandeauVerbe", <BandeauVerbe key="verbe" />],
  ["FocusResidence", <FocusResidence key="focus" />],
  ["ChiffresCroissance", <ChiffresCroissance key="chiffres" />],
  ["DernieresRealisations", <DernieresRealisations key="real" />],
  ["TemoignagesClients", <TemoignagesClients key="temoin" />],
  ["FriseHistoire", <FriseHistoire key="frise" />],
  ["PourquoiExternaliser", <PourquoiExternaliser key="pourquoi" />],
  ["BentoBesoins", <BentoBesoins key="besoins" besoins={BESOINS} />],
  ["AvantApresBascule", <AvantApresBascule key="aa" avant={VUE_AVANT} avec={VUE_AVEC} />],
  ["MethodeQuatreEtapes", <MethodeQuatreEtapes key="methode" etapes={ETAPES_METHODE} />],
  ["SecteursAccueil", <SecteursAccueil key="secteurs" />],
  ["HubsAccueil", <HubsAccueil key="hubs" />],
];

const htmlParBloc = new Map(BLOCS.map(([nom, el]) => [nom, renderToStaticMarkup(el)]));
const parBloc = new Map([...htmlParBloc].map(([nom, html]) => [nom, photosDuHtml(html)]));

/* Deux blocs ne montrent qu'une partie de leurs photos dans le HTML : le bento
   besoins n'en rend qu'une, celle de la case ouverte, et le rail des hubs écrit
   sa liste deux fois. On leur substitue leurs DONNÉES, qui sont la vérité. */
const PHOTOS_BESOINS = BESOINS.map((b) => b.img);
const PHOTOS_HUBS = Object.values(PHOTO_DU_HUB).map((p) =>
  (typeof p === "string" ? p : p.src).split("/").pop()!,
);
parBloc.set("BentoBesoins", PHOTOS_BESOINS);
parBloc.set("HubsAccueil", PHOTOS_HUBS);

/* ======================================================= le témoin, d'abord */

if (CONTROLE) {
  const essais: [string, boolean][] = [];
  const nie = (titre: string, defauts: string[]) => essais.push([titre, defauts.length > 0]);
  const accepte = (titre: string, defauts: string[]) =>
    essais.push([titre, defauts.length === 0]);

  // Règle 1 : répétition dans un bento.
  nie("deux cases du bento sur la même photo", repetitionsDansLeBento(["a.jpg", "b.jpg", "a.jpg"]));
  accepte("sept cases, sept photos", repetitionsDansLeBento(["a", "b", "c", "d", "e", "f", "g"]));

  // Règle 2 : répétition entre blocs.
  nie(
    "la même photo dans deux blocs",
    repetitionsEntreBlocs(
      new Map([
        ["FocusResidence", ["/assets/web/sv-convoyeur.jpg"]],
        ["SecteursAccueil", ["/assets/web/sv-convoyeur.jpg"]],
      ]),
    ),
  );
  accepte(
    "la même photo deux fois DANS un bloc",
    repetitionsEntreBlocs(new Map([["Bloc", ["/a.jpg", "/a.jpg"]]])),
  );
  accepte(
    "deux blocs, deux photos",
    repetitionsEntreBlocs(new Map([["A", ["/a.jpg"]], ["B", ["/b.jpg"]]])),
  );

  // Règle 3 : cadrage inopérant. Bordeaux réel, 2000x1335 dans un cadre 300x400.
  nie(
    "« center 38% » sur une photo qui ne déborde pas verticalement",
    cadragesInoperants(
      [{ nom: "Bordeaux", largeur: 2000, hauteur: 1335, cadrage: "center 38%" }],
      300,
      400,
    ),
  );
  accepte(
    "« 70% center » sur la même photo, axe horizontal, qui déborde",
    cadragesInoperants(
      [{ nom: "Bordeaux", largeur: 2000, hauteur: 1335, cadrage: "70% center" }],
      300,
      400,
    ),
  );
  nie(
    "« 70% center » sur une photo PORTRAIT, qui ne déborde pas horizontalement",
    cadragesInoperants(
      [{ nom: "Nantes", largeur: 1335, hauteur: 2000, cadrage: "70% center" }],
      300,
      400,
    ),
  );
  accepte(
    "aucun cadrage déclaré",
    cadragesInoperants([{ nom: "Lyon", largeur: 1396, hauteur: 2000 }], 300, 400),
  );

  // Règle 4 : sujet coupé.
  const bordeaux = { nom: "Bordeaux", largeur: 2000, hauteur: 1335, sujet: SUJETS.Bordeaux! };
  nie("le sujet tranché par le bord droit, cadrage centré", sujetsCoupes([bordeaux], 300, 400));
  accepte(
    "le même sujet entier à 70 %",
    sujetsCoupes([{ ...bordeaux, cadrage: "70% center" }], 300, 400),
  );

  // Règle 5 : une tuile déclarée sans photo qui en sert une quand même.
  const carte = (ville: string, img: string) =>
    `<a href="/x/" class="c">${img}<div><span>${ville}</span><div>Hub ${ville}</div></div></a>`;
  nie(
    "une scène d'usine posée sous le nom de Metz",
    tuilesAvecPhotoInterdite(carte("Metz", '<img src="/assets/web/mq-dcd9cac6ffbf.jpg" alt="">'), [
      "Metz",
    ]),
  );
  accepte("la même tuile en panneau sombre", tuilesAvecPhotoInterdite(carte("Metz", ""), ["Metz"]));
  nie("la tuile disparue du rail", tuilesAvecPhotoInterdite(carte("Lyon", ""), ["Metz"]));

  // Règle 8 : une photo de hub ou de réalisation sans texte.
  nie("une photo de hub servie avec alt vide", photosSansTexte('<a><img src="/hubs/lyon.jpg" alt=""></a>'));
  nie("une photo de réalisation sans attribut alt", photosSansTexte('<img src="/assets/photos/a.jpg">'));
  accepte(
    "la même photo décrite",
    photosSansTexte('<img alt="Lyon, la basilique de Fourvière" src="/hubs/lyon.jpg">'),
  );

  // Règle 6 : une case sur une photo de secteur pur.
  const themesTemoin = new Map<string, string[]>([
    ["metal-fonderie-coulee.jpg", ["metallurgie", "technicien"]],
    ["env-technician-maintenance-13.jpg", ["technicien", "equipe", "mecanique", "site-industriel"]],
  ]);
  nie(
    "une case illustrée par un fondeur à la coulée",
    casesSansGeste([{ id: "residence", img: "/assets/photos/metal-fonderie-coulee.jpg" }], themesTemoin),
  );
  accepte(
    "la même case illustrée par deux techniciens à la clé",
    casesSansGeste(
      [{ id: "residence", img: "/assets/photos/env-technician-maintenance-13.jpg" }],
      themesTemoin,
    ),
  );
  accepte(
    "une photo de la maquette, hors registre, non jugée",
    casesSansGeste([{ id: "chantier", img: "/assets/web/ph-tuyaux.jpg" }], themesTemoin),
  );

  // Les outils eux-mêmes : un logo n'est pas une photo, une adresse optimisée
  // par Next désigne le même fichier que l'adresse brute.
  essais.push(["un logo n'est pas compté comme photo", estUnLogo("/assets/clients/danone.png")]);
  essais.push(["une photo n'est pas prise pour un logo", !estUnLogo("/assets/photos/a.jpg")]);
  essais.push([
    "l'adresse optimisée désigne le même fichier que la brute",
    fichierDe("/_next/image?url=%2Fassets%2Fphotos%2Fa.jpg&w=640") ===
      fichierDe("/assets/photos/a.jpg"),
  ]);
  essais.push([
    "les dimensions sont lues dans l'en-tête JPEG, pas devinées",
    (() => {
      const d = dimensionsJpeg(surLeDisque("bordeaux.jpg"));
      return d.largeur === 2000 && d.hauteur === 1335;
    })(),
  ]);

  for (const [titre, ok] of essais) {
    console.log(`  ${ok ? "OK  " : "RATÉ"}  ${titre}`);
  }
  const rates = essais.filter(([, ok]) => !ok);
  assert.equal(
    rates.length,
    0,
    `${rates.length} témoin(s) en échec : la porte ne prouve pas qu'elle sait refuser`,
  );
  console.log(`\nCONTROLE OK : ${essais.length}/${essais.length}`);
  process.exit(0);
}

/* ================================================================ la mesure */

const rapport: string[] = [];

// 1. Répétition dans un même bento.
for (const [bento, photos] of [
  ["Partez de votre besoin", PHOTOS_BESOINS],
  ["Nos hubs", PHOTOS_HUBS],
] as const) {
  const defauts = repetitionsDansLeBento(photos);
  assert.deepEqual(defauts, [], `bento « ${bento} » : ${defauts.join(" ; ")}`);
  rapport.push(`${bento} : ${photos.length} photos, toutes distinctes`);
}

// 2. Répétition d'un bloc à l'autre.
const entreBlocs = repetitionsEntreBlocs(parBloc);
assert.deepEqual(entreBlocs, [], `accueil : ${entreBlocs.join(" ; ")}`);
const toutes = new Set([...parBloc.values()].flat());
rapport.push(
  `${[...parBloc].filter(([, p]) => p.length > 0).length} blocs à photo, ` +
    `${toutes.size} fichiers, aucun partagé`,
);

// 3. Cadrage posé sur un axe sans débordement.
const inoperants = cadragesInoperants(CARTES_HUB, CADRE_HUB.largeur, CADRE_HUB.hauteur);
assert.deepEqual(inoperants, [], `cadrage sans effet : ${inoperants.join(" ; ")}`);

// 4. Sujet coupé par le bord.
const coupes = sujetsCoupes(CARTES_HUB, CADRE_HUB.largeur, CADRE_HUB.hauteur);
assert.deepEqual(coupes, [], `sujet coupé : ${coupes.join(" ; ")}`);
rapport.push(
  `cadrages : ${CARTES_HUB.filter((c) => c.cadrage).length} déclaré(s), tous sur un axe qui déborde, ` +
    `${CARTES_HUB.filter((c) => c.sujet).length} sujet(s) mesuré(s) entier(s)`,
);

// 5. Les hubs sans photo n'en portent aucune, ni texte alternatif inventé.
const htmlHubs = htmlParBloc.get("HubsAccueil")!;
for (const ville of HUBS_SANS_PHOTO) {
  assert.ok(
    !(ville in PHOTO_DU_HUB),
    `${ville} est déclaré sans photo et en porte une : les deux listes se contredisent`,
  );
}
const tuilesFautives = tuilesAvecPhotoInterdite(htmlHubs, HUBS_SANS_PHOTO);
assert.deepEqual(tuilesFautives, [], `tuile sans photo : ${tuilesFautives.join(" ; ")}`);
rapport.push(
  `hubs sans photo : ${HUBS_SANS_PHOTO.join(" et ")}, panneau sombre, aucune image servie`,
);

// 6. Chaque case du bento besoins montre un geste de maintenance.
const sansGeste = casesSansGeste(
  BESOINS.map((b) => ({ id: b.id, img: b.img })),
  THEMES,
);
assert.deepEqual(sansGeste, [], `bento besoins : ${sansGeste.join(" ; ")}`);
const jugees = BESOINS.filter((b) => THEMES.has(b.img.split("/").pop() ?? "")).length;
rapport.push(
  `bento besoins : ${jugees} case(s) sur ${BESOINS.length} jugées au registre, ` +
    `toutes sur un geste de maintenance`,
);

/* 7. Le texte alternatif d'une photo du registre est celui du registre.
   LA COMPARAISON SE FAIT SUR TEXTE NORMALISÉ, piège n° 3 de `docs/PASSATION.md` :
   React sort l'apostrophe en `&#x27;`, le registre porte parfois la droite et
   parfois la typographique, et les espaces insécables se glissent partout. On
   compare normalisé, on recopie littéral. Sans cette normalisation la porte
   crie sur une apostrophe et laisse passer une vraie description fausse. */
const normalise = (s: string) =>
  s
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("’", "'")
    .replaceAll(" ", " ")
    .replace(/\s+/g, " ")
    .trim();

let alts = 0;
for (const [bloc, html] of htmlParBloc) {
  for (const m of html.matchAll(/<img\b[^>]*?>/g)) {
    const src = m[0].match(/\bsrc="([^"]+)"/)?.[1];
    const alt = m[0].match(/\balt="([^"]*)"/)?.[1];
    if (!src || alt === undefined) continue;
    const attendu = descriptionPhoto(fichierDe(src) ?? src);
    if (!attendu || alt === "") continue;
    assert.equal(
      normalise(alt),
      normalise(attendu),
      `${bloc} : le texte alternatif ne vient pas du registre.\n  servi    « ${normalise(alt)} »\n  registre « ${normalise(attendu)} »`,
    );
    alts += 1;
  }
}
rapport.push(`${alts} texte(s) alternatif(s) de photo du registre conformes`);

// 8. Aucune photo de hub ni de réalisation muette, doublon du rail compris.
for (const bloc of ["HubsAccueil", "DernieresRealisations"]) {
  const html = htmlParBloc.get(bloc)!;
  const muettes = photosSansTexte(html);
  assert.deepEqual(muettes, [], `${bloc} : photo(s) sans texte alternatif : ${muettes.join(", ")}`);
  rapport.push(`${bloc} : ${(html.match(/<img\b/g) ?? []).length} photo(s), toutes décrites`);
}

console.log("Photos de l'accueil, toutes les assertions passent :");
for (const ligne of rapport) console.log(`  - ${ligne}`);
