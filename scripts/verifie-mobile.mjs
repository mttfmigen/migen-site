/**
 * Le site tient-il sur un téléphone ?
 *
 *   node scripts/verifie-mobile.mjs
 *   SITE_URL=http://localhost:4341/ node scripts/verifie-mobile.mjs
 *
 * Trois largeurs, et elles sont choisies : 320 px (le plus petit écran encore
 * en service), 375 px (la largeur la plus répandue), 768 px (la bascule tablette,
 * là où les règles `mg-*` changent de colonnes). Un défaut de mise en page sur
 * téléphone ne se voit pas sur un écran de développeur, et plus de la moitié des
 * visites d'un site industriel arrivent du mobile.
 *
 * CE QUI EST MESURÉ, et pourquoi chaque chose compte :
 *   · AUCUN débordement horizontal. Une page plus large que l'écran se fait
 *     balayer de côté par accident à chaque défilement, et Google le signale.
 *     Le contrôle nomme l'élément coupable, sinon il est introuvable.
 *   · Les cibles tactiles font au moins 24 px. C'est le seuil EXACT du critère
 *     2.5.8 de la WCAG 2.2, niveau AA. Les 44 px souvent cités sont la
 *     recommandation d'Apple, pas une obligation, et l'imposer ici ferait
 *     échouer la quasi-totalité des liens de pied de page sans que personne ne
 *     les rate vraiment. Mieux vaut un seuil juste et tenu qu'un seuil flatteur
 *     et ignoré.
 *   · Le tiroir de navigation s'ouvre VRAIMENT. Le menu du bureau est caché
 *     sous 1000 px : si le bouton du tiroir ne répond pas, le site n'a plus de
 *     navigation du tout sur téléphone.
 *   · Les champs de SAISIE font au moins 16 px. En dessous, iOS zoome tout seul
 *     au premier appui et le visiteur se retrouve avec une page agrandie qu'il
 *     doit repincer. La règle ne vaut que pour les champs : les sur-titres de la
 *     maquette sont à 10,5 et 11,5 px, c'est son échelle typographique, pas un
 *     défaut à corriger.
 */
import { chromium } from "playwright";

const SITE = process.env.SITE_URL ?? "http://localhost:4340/";
const LARGEURS = [320, 375, 768];
const CIBLE_MINIMALE = 24;
const SAISIE_MINIMALE = 16;

/* Les pages à éprouver : l'accueil, une page de vente, un gabarit maquette et
   une page éditoriale. Les quatre mises en page du site. */
const PAGES = ["/", "/offres/residence/", "/expertises/", "/ressources/fiches-pratiques/"];

const MESURE = ({ cible, saisie }) => {
  const document_ = document.documentElement;
  const debordements = [];

  /* Deux sorties d'écran sont VOULUES et ne doivent pas être signalées, sinon
     le vrai défaut se noie dans le bruit :
       · ce qui est posé très loin à gauche est le motif « masqué visuellement »
         (le champ piège anti-robot du formulaire vit à -9999 px) ;
       · ce qui dépasse DANS un conteneur qui ROGNE (overflow-x autre que
         `visible`) ne peut pas être atteint par un balayage : soit le conteneur
         défile exprès, et c'est son rôle (les tableaux des pages éditoriales
         défilent plutôt que de casser leurs colonnes), soit il masque, et
         l'élément est décoratif (les bandeaux défilants écrivent leur liste
         deux fois, les halos orangés sortent du cadre par construction).
         Seul un débordement qui atteint la PAGE se fait balayer par accident,
         et la largeur du document le dit déjà. */
  const rogne = (element) => {
    for (let n = element.parentElement; n && n !== document.body; n = n.parentElement) {
      const debordementX = getComputedStyle(n).overflowX;
      if (debordementX !== "visible") return true;
    }
    return false;
  };

  for (const element of document.querySelectorAll("body *")) {
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    if (boite.left < -1000) continue;
    if (rogne(element)) continue;
    const sort = boite.right > window.innerWidth + 1 || boite.left < -1;
    if (!sort) continue;
    if (debordements.some((d) => d.noeud.contains(element))) continue;
    debordements.push({
      noeud: element,
      description:
        element.tagName.toLowerCase() +
        (element.className && typeof element.className === "string"
          ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}`
          : "") +
        ` [${Math.round(boite.left)} → ${Math.round(boite.right)} px]` +
        ` « ${(element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30)} »`,
    });
  }

  const petitesCibles = [];
  for (const element of document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"]',
  )) {
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.opacity === "0") continue;
    // Un lien DANS un paragraphe n'a pas à faire 44 px : la WCAG exempte le
    // texte en ligne, et l'agrandir casserait l'interligne.
    const enLigne = style.display === "inline" && element.closest("p, li, td");
    if (enLigne) continue;
    /* Un lien séparé de ses voisins d'au moins 24 px satisfait le critère par
       l'ESPACEMENT et non par la taille : la WCAG l'admet explicitement. Le
       séparateur peut être une marge OU l'écart de la grille ou de la flexbox
       parente, et c'est le cas ici : les listes du site sont des grilles à
       `gap`, donc des marges nulles. Ne regarder que les marges condamnerait
       cinquante liens parfaitement atteignables. */
    const parent = element.parentElement;
    const styleParent = parent ? getComputedStyle(parent) : null;
    const ecartParent = styleParent && /grid|flex/.test(styleParent.display)
      ? Number.parseFloat(styleParent.rowGap) || 0
      : 0;
    const marge = Number.parseFloat(style.marginTop) + Number.parseFloat(style.marginBottom);
    const espaceSuffisant = boite.height + Math.max(marge, ecartParent) >= cible && boite.width >= cible;
    if (!espaceSuffisant && (boite.height < cible || boite.width < cible)) {
      petitesCibles.push(
        `${element.tagName.toLowerCase()} ${Math.round(boite.width)}×${Math.round(boite.height)} ` +
          `« ${(element.textContent || element.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 26)} »`,
      );
    }
  }

  const saisiesTropPetites = [];
  for (const element of document.querySelectorAll('input:not([type="hidden"]), textarea, select')) {
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    const taille = Number.parseFloat(getComputedStyle(element).fontSize);
    if (taille && taille < saisie) {
      saisiesTropPetites.push(
        `${element.tagName.toLowerCase()}[name=${element.getAttribute("name") ?? "?"}] à ${taille}px`,
      );
    }
  }

  return {
    largeurDocument: document_.scrollWidth,
    largeurFenetre: window.innerWidth,
    debordements: debordements.map((d) => d.description),
    petitesCibles,
    saisiesTropPetites,
  };
};

const navigateur = await chromium.launch({ channel: "chrome" });
const problemes = [];

try {
  for (const largeur of LARGEURS) {
    const contexte = await navigateur.newContext({
      viewport: { width: largeur, height: 780 },
      // Le préréglage téléphone de la maquette suppose un écran tactile : sans
      // cela, les règles de survol s'appliquent et la mesure est fausse.
      hasTouch: largeur < 768,
      isMobile: largeur < 768,
    });

    for (const chemin of PAGES) {
      const page = await contexte.newPage();
      const reponse = await page.goto(new URL(chemin, SITE).href, {
        waitUntil: "load",
        timeout: 60_000,
      });
      if (!reponse?.ok()) {
        problemes.push(`${chemin} à ${largeur} px : répond ${reponse?.status()}`);
        await page.close();
        continue;
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);

      const releve = await page.evaluate(MESURE, {
        cible: CIBLE_MINIMALE,
        saisie: SAISIE_MINIMALE,
      });

      if (releve.largeurDocument > largeur + 1) {
        problemes.push(
          `${chemin} à ${largeur} px : le document fait ${releve.largeurDocument} px, ` +
            `donc il se balaye de côté` +
            (releve.debordements.length
              ? `\n      coupable : ${releve.debordements.slice(0, 3).join("\n      ")}`
              : ""),
        );
      } else if (releve.debordements.length > 0) {
        problemes.push(
          `${chemin} à ${largeur} px : ${releve.debordements.length} élément(s) sortent de l'écran` +
            ` (rognés, donc invisibles mais présents)\n      ${releve.debordements.slice(0, 3).join("\n      ")}`,
        );
      }
      if (releve.petitesCibles.length > 0) {
        problemes.push(
          `${chemin} à ${largeur} px : ${releve.petitesCibles.length} cible(s) tactile(s) sous ${CIBLE_MINIMALE} px` +
            `\n      ${releve.petitesCibles.slice(0, 4).join("\n      ")}`,
        );
      }
      if (releve.saisiesTropPetites.length > 0) {
        problemes.push(
          `${chemin} à ${largeur} px : champ(s) de saisie sous ${SAISIE_MINIMALE} px, iOS zoomera à l'appui` +
            `\n      ${releve.saisiesTropPetites.slice(0, 4).join("\n      ")}`,
        );
      }

      console.log(
        `${chemin.padEnd(32)} ${String(largeur).padStart(4)} px  ` +
          `document ${releve.largeurDocument} px, ${releve.debordements.length} débordement(s), ` +
          `${releve.petitesCibles.length} cible(s) trop petite(s)`,
      );
      await page.close();
    }

    // Le tiroir : sans lui, plus de navigation du tout sur téléphone.
    if (largeur < 1000) {
      const page = await contexte.newPage();
      await page.goto(SITE, { waitUntil: "load" });
      await page.waitForTimeout(700);
      const bouton = page
        .locator('header button[aria-expanded], header [aria-label*="enu" i]')
        .first();
      if ((await bouton.count()) === 0) {
        problemes.push(`à ${largeur} px : aucun bouton de menu dans l'en-tête`);
      } else {
        await bouton.click();
        await page.waitForTimeout(500);
        const liens = await page.locator('[role="dialog"] a, nav a:visible').count();
        if (liens < 5) {
          problemes.push(
            `à ${largeur} px : le tiroir ne s'ouvre pas ou ne propose que ${liens} lien(s)`,
          );
        } else {
          console.log(`tiroir à ${largeur} px : ${liens} liens atteignables`);
        }
      }
      await page.close();
    }

    await contexte.close();
  }
} catch (erreur) {
  problemes.push(`contrôle impossible : ${erreur.message.split("\n")[0]}`);
} finally {
  await navigateur.close();
}

if (problemes.length > 0) {
  for (const p of problemes) console.error(`  ${p}`);
  console.error(`${problemes.length} problème(s) sur téléphone.`);
  process.exit(1);
}
console.log("mise en page mobile conforme");
