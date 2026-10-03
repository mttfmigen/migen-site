/**
 * Traduit le corpus rédigé des 13 pages de /secteurs/ vers le gabarit SECTEUR
 * de la maquette.
 *
 *   node scripts/produit-secteurs.mjs
 *
 * CE QUE CE SCRIPT EST, ET CE QU'IL N'EST PAS. Il ne rédige rien. Il prend le
 * texte DÉJÀ ÉCRIT par le client, sous la forme « vente » en dix sections
 * (`types/contenu.ts`), et le range dans les quatre sections que la maquette
 * dessine pour une page de secteur (`types/secteur.ts`). Aucune phrase n'est
 * composée, raccourcie ni reformulée : chaque chaîne écrite ici sort du corpus
 * telle quelle. Les seules chaînes qui ne viennent pas du corpus sont les
 * quatre SURTITRES, qui sont le chrome du gabarit, relevés dans la maquette et
 * revérifiés à chaque exécution par `components/site/secteur/verification-secteur.tsx`.
 *
 * POURQUOI UN SCRIPT PLUTÔT QUE 13 FICHIERS ÉCRITS À LA MAIN. La correspondance
 * section par section EST le travail. Écrite ici une fois, elle se relit, se
 * discute et se rejoue ; recopiée treize fois, elle dérive au premier
 * ajustement et personne ne peut vérifier qu'une page n'a pas été traitée
 * autrement que ses voisines.
 *
 * LA CORRESPONDANCE, relevée dans la maquette lignes 6278 à 6364 :
 *
 *   maquette                                corpus
 *   ───────────────────────────────────────────────────────────────────────────
 *   surtitre du héros                        « Secteur d'activité » (maquette)
 *   H1                                       `pages.titre_h1`, soit `heros.h1`
 *   chapeau du héros                         `heros.mecanisme`
 *   bouton orange du héros                   `heros.cta`, vers #formulaire
 *   bouton en verre du héros                 RIEN : le corpus n'écrit qu'un CTA
 *   surtitre du panneau                      « Nos repères dans le secteur »
 *   les quatre repères chiffrés              `chiffres.chiffres`, 3 fournis
 *   surtitre des enjeux                      « Les enjeux du secteur »
 *   H2 des enjeux                            `probleme.punchline`
 *   les quatre cartes d'enjeux               `probleme.puces` (accroche, texte)
 *   « Les autres secteurs »                  les 10 pages secteur, libellés et
 *                                            cibles pris dans la prose du hub
 *   H2 de l'appel final                      `ctaFinal.question`
 *   paragraphe de l'appel final              `ctaFinal.rappel`
 *   bouton de l'appel final                  `ctaFinal.bouton`, vers #formulaire
 *
 * CE QUE LA MAQUETTE NE DESSINE PAS ET QUE LE CORPUS PORTE : `offre`,
 * `deroule`, `garanties`, `cta`, `preuves`, `objections`. Six sections de texte
 * rédigé, payé, et qui porte le référencement de ces pages. Elles ne sont pas
 * supprimées : elles partent dans `contenu.complement` et sont rendues SOUS les
 * sections de la maquette par les blocs de `components/site/blocs/`, qui sont
 * eux-mêmes portés de la maquette et en gardent les surtitres (« Ce qui est
 * inclus », « Le déroulé », « Nos engagements », « Prochaine étape »,
 * « Nos dernières réalisations », « Questions fréquentes »).
 *
 * RESTENT DEHORS, et c'est dit dans le rapport : `heros.telephone` et
 * `heros.phraseDelai`. Le héros de la maquette n'a pas de ligne pour eux. Le
 * numéro et le rappel dans l'heure restent lisibles sur la page, portés par
 * `cta.rappel` et par le paragraphe de l'appel final.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");
const SOURCE_CORPUS = join(RACINE, "supabase", "import", "corpus-analyse.json");

/**
 * L'ancre du formulaire de bas de page, posée sur toutes les pages du cocon.
 *
 * Même valeur que `ANCRE_FORMULAIRE` de `components/site/blocs/habillage.ts`.
 * `verification-secteur.tsx` vérifie qu'elles ne divergent pas : une ancre
 * fautive passerait tous les contrôles de sûreté des liens, et donnerait un
 * bouton qui ne mène nulle part sur les treize pages.
 */
const ANCRE = "#formulaire";

/**
 * Les surtitres du gabarit, relevés dans la maquette.
 *
 * Ils ne viennent pas du corpus parce qu'ils ne sont pas de la copie : ce sont
 * les étiquettes du gabarit, au même titre que « Questions fréquentes » dans
 * les blocs déjà portés. `verification-secteur.tsx` les relit dans
 * `maquette/accueil-rendu.html` à chaque exécution et refuse une dérive.
 */
const SURTITRES = {
  page: "Secteur d'activité",
  reperes: "Nos repères dans le secteur",
  enjeux: "Les enjeux du secteur",
  autres: "Les autres secteurs",
};

/** Les six sections que la maquette ne dessine pas, dans l'ordre du corpus. */
const COMPLEMENT = new Set([
  "offre",
  "deroule",
  "garanties",
  "cta",
  "preuves",
  "objections",
]);

const corpus = JSON.parse(readFileSync(SOURCE_CORPUS, "utf8"));

/** Les 13 pages de la branche, dans l'ordre du corpus. */
const pages = corpus.filter((entree) => entree.url.includes("/secteurs/"));

/**
 * Les 10 secteurs, NOMMÉS PAR LE CLIENT.
 *
 * Le libellé d'une pastille doit être court, et `pages.titre_h1` ne l'est pas
 * (« Maintenance dans l'industrie métallique »). La liste est donc lue dans la
 * prose du hub, où le client écrit lui-même le nom de chaque secteur avec son
 * lien : aucune étiquette n'est dérivée d'un slug ni raccourcie à la main.
 */
function secteurs() {
  const hub = pages.find((entree) => entree.url === "/secteurs/");
  if (!hub) throw new Error("le hub /secteurs/ est absent du corpus");
  const prose = (hub.contenu.sections.find((s) => s.type === "offre")?.prose ?? [])
    .map((p) => p.texte)
    .join(" ");
  const liens = [...prose.matchAll(/\[([^\]]+)\]\((\/secteurs\/[^)]+)\)/g)].map(
    ([, libelle, href]) => ({
      // Seule retouche : la capitale d'attaque, parce que le mot est tiré d'une
      // phrase et devient une étiquette. Le mot lui-même n'est pas touché.
      libelle: libelle.charAt(0).toLocaleUpperCase("fr") + libelle.slice(1),
      href,
    }),
  );
  if (liens.length < 10) {
    throw new Error(`la prose du hub ne nomme que ${liens.length} secteurs`);
  }
  return liens;
}

const TOUS_LES_SECTEURS = secteurs();

/** Le contenu secteur d'une page, à partir de ses sections de vente. */
function contenuSecteur(entree) {
  const par = new Map(entree.contenu.sections.map((s) => [s.type, s]));
  const heros = par.get("heros");
  const chiffres = par.get("chiffres");
  const probleme = par.get("probleme");
  const final = par.get("ctaFinal");

  const contenu = { gabarit: "secteur", surtitre: SURTITRES.page };

  /* LE HÉROS. Le H1 n'est pas ici : il vient de `pages.titre_h1`, et le gabarit
     le reçoit en propriété. Le chapeau est le mécanisme du corpus, c'est-à-dire
     le paragraphe que le corpus place déjà sous le H1. */
  if (heros?.mecanisme) contenu.chapeau = heros.mecanisme;
  if (heros?.cta) contenu.actions = [{ libelle: heros.cta, href: ANCRE }];

  /* LES REPÈRES. La maquette en dessine quatre, le corpus en fournit trois : on
     en pose trois. La quatrième case reste vide, elle ne se comble pas. */
  const reperes = (chiffres?.chiffres ?? [])
    .filter((c) => c.valeur && c.libelle)
    .map((c) => ({ valeur: c.valeur, libelle: c.libelle }));
  if (reperes.length > 0) {
    contenu.reperesSurtitre = SURTITRES.reperes;
    contenu.reperes = reperes;
  }

  /* LES ENJEUX. La punchline du corpus EST le titre de sa section « problème » :
     elle prend la place du H2. Les puces deviennent les cartes en verre,
     l'accroche en titre, le texte en corps. */
  const enjeux = (probleme?.puces ?? [])
    .filter((p) => p.accroche && p.texte)
    .map((p) => ({ titre: p.accroche, texte: p.texte }));
  if (enjeux.length > 0) {
    contenu.enjeuxSurtitre = SURTITRES.enjeux;
    if (probleme?.punchline) contenu.enjeuxTitre = probleme.punchline;
    contenu.enjeux = enjeux;
  }

  /* LES PAGES SŒURS. Tous les secteurs sauf celui de la page. Une page fille,
     qui n'est pas elle-même un secteur, les garde tous. */
  const autres = TOUS_LES_SECTEURS.filter((lien) => lien.href !== entree.url);
  if (autres.length > 0) {
    contenu.autresSurtitre = SURTITRES.autres;
    contenu.autres = autres;
  }

  /* L'APPEL FINAL. Les trois éléments du panneau de la maquette, les trois
     champs de `ctaFinal` : la question, le rappel, le bouton. */
  if (final?.question) contenu.appelTitre = final.question;
  if (final?.rappel) contenu.appelTexte = final.rappel;
  if (final?.bouton) contenu.appelBouton = { libelle: final.bouton, href: ANCRE };

  /* LE TEXTE QUE LA MAQUETTE NE MONTRE PAS, dans l'ordre où le corpus l'écrit. */
  const complement = entree.contenu.sections.filter((s) => COMPLEMENT.has(s.type));
  if (complement.length > 0) contenu.complement = complement;

  return contenu;
}

/** `/secteurs/logistique/peak-season/` devient `secteurs-logistique-peak-season`. */
function nomFichier(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
}

mkdirSync(SORTIE, { recursive: true });

let ecrits = 0;
for (const entree of pages) {
  const contenu = contenuSecteur(entree);
  const fichier = join(SORTIE, `${nomFichier(entree.url)}.json`);
  writeFileSync(
    fichier,
    `${JSON.stringify(
      {
        url: entree.url,
        source:
          "dessin : maquette/accueil-rendu.html, gabarit isSecteur, lignes 6278 à 6364. " +
          "texte : supabase/import/corpus-analyse.json, produit par scripts/produit-secteurs.mjs.",
        contenu,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  ecrits += 1;
  console.log(
    `${entree.url.padEnd(44)} ${String(contenu.reperes?.length ?? 0)} repères, ` +
      `${String(contenu.enjeux?.length ?? 0)} enjeux, ` +
      `${String(contenu.autres?.length ?? 0)} pages sœurs, ` +
      `${String(contenu.complement?.length ?? 0)} sections sous la maquette`,
  );
}

console.log(`\n${ecrits} fichier(s) écrit(s) dans supabase/import/gabarits-maquette/.`);
console.log("Pour les poser en base : node scripts/importe_rest.mjs --simulation");
