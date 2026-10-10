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
 *   · LA BARRE D'ACTION BASSE NE COUVRE PAS LA FIN DU PIED DE PAGE. Elle est en
 *     position fixe : elle ne pousse rien et vit au dessus du contenu. Mesuré
 *     le 10/10 en production, elle occupait les 68 derniers pixels du pied sur
 *     les 248 pages, et le réglage CNIL des traceurs y était couvert à 100 % :
 *     un appui dessus ouvrait le formulaire de contact. Ce contrôle était vert
 *     et aveugle, parce qu'il mesurait en HAUT de page, là où le pied n'est pas
 *     à l'écran. On défile donc jusqu'en bas avant de mesurer.
 */
import { chromium } from "playwright";

const SITE = process.env.SITE_URL ?? "http://localhost:4340/";
const LARGEURS = [320, 375, 768];
const CIBLE_MINIMALE = 24;
const SAISIE_MINIMALE = 16;

/* Les pages à éprouver : une par mise en page du site. Les quatre premières
   couvrent les familles servies depuis la base, les trois suivantes les écrans
   uniques portés en routes, qui ont leur propre mise en page et que personne
   n'avait regardés sur téléphone : le contact porte un formulaire, les mentions
   légales un sommaire collant, l'équipe une grille de portraits. */
const PAGES = [
  "/",
  "/offres/residence/",
  "/expertises/",
  "/ressources/fiches-pratiques/",
  "/contact/",
  "/mentions-legales/",
  "/a-propos/equipe/",
];

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

  /* LES APPELS À L'ACTION QUI SORTENT DE L'ÉCRAN, et c'est l'angle mort que
     ce contrôle avait.
     Mesuré le 09/10 au soir sur 118 des 248 pages : le bouton faisait 409 px
     dans une fenêtre de 375 et son libellé était tranché en plein mot
     (« Faire chiffrer ma maintenance agroalimenta »). Ce contrôle déclarait
     pourtant la page conforme, parce qu'il cherchait un débordement du
     DOCUMENT : `.mg-site` est en `overflow-x: clip`, le conteneur rogne, et
     `scrollWidth` reste à 375. Un contrôle qui mesure la mauvaise chose est
     pire que pas de contrôle, parce qu'il rassure.
     On mesure donc l'élément lui-même, et non le document. Ce qui vit dans un
     rail à défilement horizontal est écarté : un carrousel déborde par
     construction, c'est son objet. */
  const horsEcran = [];
  for (const element of document.querySelectorAll('a[href], button, [role="button"]')) {
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.opacity === "0") continue;
    let parent = element.parentElement;
    let dansUnRail = false;
    while (parent && parent !== document.body) {
      const debordement = getComputedStyle(parent).overflowX;
      if (debordement === "auto" || debordement === "scroll") {
        dansUnRail = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (dansUnRail) continue;
    const depasse = Math.round(boite.right - window.innerWidth);
    if (depasse > 4) {
      horsEcran.push(
        `${Math.round(boite.width)} px de large, dépasse de ${depasse} px` +
          ` « ${(element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40)} »`,
      );
    }
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
    horsEcran,
    petitesCibles,
    saisiesTropPetites,
  };
};

/**
 * La barre d'action basse laisse-t-elle lire la fin du pied de page ?
 *
 * À exécuter PAGE DÉFILÉE TOUT EN BAS : c'est la seule position où le pied et
 * la barre sont à l'écran ensemble.
 *
 * La mesure est GÉOMÉTRIQUE, croisement de rectangles, et non un test de point :
 * le bandeau de consentement est lui aussi en bas de l'écran et en z-index 50,
 * un test de point le désignerait coupable à la place de la barre. Il est fixe,
 * donc il ne déplace rien et ne fausse pas les rectangles.
 *
 * `jeu` est la distance entre la dernière ligne du pied et le haut de la barre.
 * Négatif, le pied passe SOUS la barre.
 */
const MESURE_BARRE_BASSE = () => {
  const lisible = (texte) =>
    (texte ?? "")
      .replace(/&nbsp;|[  ]/g, " ")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim();

  const pied = document.querySelector("footer");
  if (!pied) return { erreur: "aucun pied de page" };
  const barre = [...document.body.children].find((noeud) => {
    const style = getComputedStyle(noeud);
    return style.position === "fixed" && style.zIndex === "25" && noeud.querySelector("a[href]");
  });
  if (!barre) return { erreur: "barre d'action basse introuvable" };
  const cadreBarre = barre.getBoundingClientRect();
  if (cadreBarre.height === 0) return { barreMasquee: true };

  const couverts = [];
  let basContenu = -Infinity;
  let derniere = "";
  for (const element of pied.querySelectorAll("a[href], button, span, div, p, li")) {
    // Seules les feuilles : un conteneur hériterait du tort de ses enfants.
    if (element.querySelector("a[href], button")) continue;
    const texte = lisible(element.textContent);
    if (!texte) continue;
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.opacity === "0") continue;
    if (boite.bottom > basContenu) {
      basContenu = boite.bottom;
      derniere = texte.slice(0, 40);
    }
    const chevauchementY = Math.min(boite.bottom, cadreBarre.bottom) - Math.max(boite.top, cadreBarre.top);
    const chevauchementX = Math.min(boite.right, cadreBarre.right) - Math.max(boite.left, cadreBarre.left);
    if (chevauchementY > 1 && chevauchementX > 1) {
      couverts.push(
        `${element.tagName.toLowerCase()} « ${texte.slice(0, 34)} » couvert sur ` +
          `${Math.round(chevauchementY)} de ses ${Math.round(boite.height)} px` +
          (element.getAttribute("href") ? ` → ${element.getAttribute("href")}` : ""),
      );
    }
  }

  return {
    jeu: Math.round(cadreBarre.top - basContenu),
    derniere,
    reserve: getComputedStyle(pied).paddingBottom,
    couverts,
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
      if (releve.horsEcran.length > 0) {
        problemes.push(
          `${chemin} à ${largeur} px : ${releve.horsEcran.length} appel(s) à l'action hors de l'écran` +
            `\n      ${releve.horsEcran.slice(0, 4).join("\n      ")}`,
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

      /* LE PIED DE PAGE SOUS LA BARRE D'ACTION. Il faut défiler pour le voir :
         tous les relevés ci-dessus travaillent en haut de page, où le pied
         n'est pas à l'écran, et c'est exactement pourquoi ce contrôle était
         vert le 10/10 alors que la barre couvrait les 68 derniers pixels du
         pied sur les 248 pages. */
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(600);
      const bas = await page.evaluate(MESURE_BARRE_BASSE);
      if (bas.erreur) {
        problemes.push(`${chemin} à ${largeur} px : ${bas.erreur}`);
      } else if (!bas.barreMasquee) {
        if (bas.couverts.length > 0) {
          problemes.push(
            `${chemin} à ${largeur} px : la barre d'action basse couvre ${bas.couverts.length} ` +
              `élément(s) du pied de page (jeu de ${bas.jeu} px sous la dernière ligne, ` +
              `réserve de ${bas.reserve})\n      ${bas.couverts.slice(0, 4).join("\n      ")}`,
          );
        } else if (bas.jeu < 0) {
          problemes.push(
            `${chemin} à ${largeur} px : le pied de page passe ${-bas.jeu} px sous la barre ` +
              `d'action basse (dernière ligne « ${bas.derniere} », réserve de ${bas.reserve})`,
          );
        }
      }

      console.log(
        `${chemin.padEnd(32)} ${String(largeur).padStart(4)} px  ` +
          `document ${releve.largeurDocument} px, ${releve.debordements.length} débordement(s), ` +
          `${releve.petitesCibles.length} cible(s) trop petite(s), ` +
          `pied à ${bas.barreMasquee ? "—" : `${bas.jeu} px`} de la barre basse`,
      );
      await page.close();
    }

    // Le tiroir : sans lui, plus de navigation du tout sur téléphone.
    if (largeur < 1000) {
      const page = await contexte.newPage();
      await page.goto(SITE, { waitUntil: "load" });
      await page.waitForTimeout(700);
      /* Le bouton VISIBLE, et c'est nécessaire : les boutons des mega-menus
         portent eux aussi `aria-expanded`, et ils sont cachés à cette largeur
         (`.mg-nav` passe en `display:none`). Les prendre faisait attendre
         Playwright trente secondes sur un élément qui n'apparaîtra jamais, et
         le contrôle échouait pour une raison qui n'était pas celle annoncée. */
      const bouton = page.locator('header button[aria-controls]:visible').first();
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
