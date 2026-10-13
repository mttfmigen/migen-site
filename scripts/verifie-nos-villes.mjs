#!/usr/bin/env node
/**
 * Porte : les deux blocs de « Nos villes » restent COMPACTS, DENSES et PLEINS.
 *
 *   node scripts/verifie-nos-villes.mjs [adresse]     (défaut : localhost:4340)
 *   node scripts/verifie-nos-villes.mjs --controle    (preuve d'échec)
 *
 * POURQUOI ELLE EXISTE. Le 12/10, Mehdi a tranché contre sa propre maquette
 * sur `/implantations/` : « le bloc est pas jolie mal agencé trop gros. Ca
 * pourrait etre un peu plus visuels. Pareil pour le bloc au dela des hubs ».
 * Mesuré en production ce jour-là, à 1440 px : la section pesait 1 965 px, les
 * hubs 964 px, « Au-delà des hubs » 828 px, et au téléphone la section faisait
 * 2 258 px, soit 2,7 écrans. La refonte les ramène à 1 383, 654, 575 et 399.
 *
 * Rien ne protège un gain de densité. Une ligne de style remise, un composant
 * repris d'une autre page, un repli mobile défait, et le pâté revient sans que
 * personne ne le voie : c'est exactement ce qui s'était passé entre le dessin
 * d'origine et le signalement du client. Cette porte mesure donc ce que l'oeil
 * du client mesurait, et rien d'autre.
 *
 * CE QU'ELLE VÉRIFIE, sur le rendu réel d'un navigateur et non sur la source :
 *  1. LA SECTION EXISTE, avec son titre et son sous-titre.
 *  2. LES COMPTES SONT INTACTS : 10 hubs, 30 bassins, 11 régions, 48 villes,
 *     88 liens. Compacter en perdant des liens serait une tricherie.
 *  3. LA HAUTEUR tient sous ses plafonds, à 1440, 1024 et 390 px.
 *  4. LA DENSITÉ : au moins 55 liens pour 1 000 px de hauteur de section à
 *     1440 px, 45 à 1024 px (44,8 et 40,7 avant la refonte).
 *  5. L'ARRANGEMENT : aucune rangée de hubs incomplète, aucune colonne vide
 *     dans l'annuaire des villes. C'était ça, le « mal agencé ».
 *  6. LE REPLI MOBILE tient : les deux blocs sont SERVIS OUVERTS par le
 *     serveur, et refermés par l'effet client sous 880 px.
 *  7. AUCUN ÉLÉMENT DE LA SECTION ne sort de la fenêtre.
 *
 * PIÈGES DE MESURE RESPECTÉS, chacun déjà payé par ce dépôt : on mesure
 * l'ÉLÉMENT et non le document (`.mg-site` est en `overflow-x: clip`), on
 * attend l'hydratation (les repliables sont servis ouverts puis fermés par un
 * effet client), on neutralise le bandeau de consentement et la pastille Next
 * (jusqu'à 57 % de faux pixels), et le texte est extrait avec un SÉPARATEUR DE
 * BLOC, sans quoi les libellés se collent entre eux.
 *
 * ELLE PROUVE QU'ELLE SAIT ÉCHOUER : huit régressions injectées dans le DOM,
 * chacune doit être vue.
 */
import { chromium } from "playwright";

const CONTROLE = process.argv.includes("--controle");
const BASE = process.argv.find((a) => a.startsWith("http")) ?? process.env.SITE_URL ?? "http://localhost:4340";
const URL = `${BASE.replace(/\/$/, "")}/implantations/`;

/* ------------------------------------------------------------- les seuils */

/**
 * Les plafonds sont posés ENTRE la mesure d'après et la mesure d'avant : assez
 * haut pour qu'une police ou un navigateur un peu différent ne les fasse pas
 * tomber, assez bas pour qu'un retour au dessin d'avant soit refusé.
 */
const SEUILS = {
  bureau: { largeur: 1440, hauteur: 900, section: 1600, hubs: 760, audela: 720, densite: 55, avant: { section: 1965, hubs: 964, audela: 828 } },
  /* La bande 881-1024 px est le pire cas : le bloc n'y est pas encore replié et
     les colonnes y sont déjà serrées. Mesuré le 12/10 : 2 161 px avant,
     1 646 px après. La hauteur des deux blocs n'était pas séparable dans
     l'ancien dessin (il n'avait qu'un seul bloc repliable), d'où le « n.c. ». */
  portable: { largeur: 1024, hauteur: 800, section: 1800, hubs: 900, audela: 820, densite: 45, avant: { section: 2161 } },
  telephone: { largeur: 390, hauteur: 844, section: 844, hubs: 260, audela: 300, densite: null, avant: { section: 2258, hubs: 108, audela: 1977 } },
};
const COMPTES = { hubs: 10, bassins: 30, regions: 11, villes: 48, liens: 88 };

/* -------------------------------------------------------------- la mesure */

/**
 * Relève les faits dans la page. `retouche` est le nom d'une régression à
 * injecter dans le DOM avant de mesurer : c'est le mode témoin.
 */
async function releve(page, retouche) {
  return page.evaluate((retouche) => {
    /* SÉPARATEUR DE BLOC : sans lui, `textContent` recolle « Lyon » et
       « Grenoble » en « LyonGrenoble » et tout comptage de mots ment. */
    const SEP = String.fromCharCode(1);
    const texte = (e) => {
      const parts = [];
      const marche = (n) => {
        if (n.nodeType === 3) parts.push(n.nodeValue);
        else if (n.nodeType === 1) {
          parts.push(SEP);
          for (const f of n.childNodes) marche(f);
          parts.push(SEP);
        }
      };
      marche(e);
      return parts.join(" ").split(SEP).join(" ").replace(/\s+/g, " ").trim();
    };
    const haut = (e) => Math.round(e.getBoundingClientRect().height);
    /** Regroupe des éléments par leur bord (gauche ou haut) : une colonne, une rangée. */
    const groupes = (elements, bord) => {
      const m = new Map();
      for (const e of elements) {
        const k = Math.round(e.getBoundingClientRect()[bord] / 4) * 4;
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([, n]) => n);
    };

    const section = [...document.querySelectorAll("main > section")].find((s) =>
      (s.textContent ?? "").includes("bassins couverts"),
    );
    if (!section) return { absente: true };

    const plis = [...section.querySelectorAll("details[data-pliable-mobile]")];
    /* LES SÉLECTEURS SUIVENT LA MOSAÏQUE DU 13/10, et c'est une réparation de
       porte, pas un assouplissement.

       Jusqu'au 13/10 les hubs étaient des RANGÉES de texte : `.panneauHubs`
       contenait des `.rangHub`, chacune portant un `a.hub` et ses `a.zone`.
       Le colis du 13/10 (`feat(implantations): la mosaique de tuiles photo`)
       les a remplacés par `.mosaique` et dix `article.tuileHub`, dont le nom
       du hub est un `a.tuileLien` et les bassins des `a.tuileZone`.

       LA PORTE N'AVAIT PAS SUIVI, et le prix était exactement celui du
       précédent du 13/10 sur `verification-pied-de-page.tsx` : elle annonçait
       « 0 hubs au lieu de 10 » et « 0 bassins au lieu de 30 » alors que les
       dix et les trente étaient servis et comptables dans le HTML. Vérifié sur
       le HTML de production : `rangHub` et `panneauHubs` y ont zéro
       occurrence, `groupeRegion` onze et `ville` quarante-huit.

       `a[class*='tuileZone']` ET NON `[class*='tuileZone']` : le `<span>` qui
       enveloppe les pastilles s'appelle `tuileZones`, au pluriel, et contient
       donc la même sous-chaîne. Seules les ancres comptent. */
    const panneau = section.querySelector("[class*='mosaique']");
    /* L'ANNUAIRE DES VILLES A CHANGÉ DE FORME LE 13/10 AU SOIR, commit
       `41f4400 feat(implantations): la repartition exacte du colis, et le
       panneau des bassins`. La liste en colonnes (`.annuaire` et ses
       `.groupeRegion`) est devenue un panneau à onglets, `.panneauBassins`,
       onze `.bassinsPanneau` pilotés par des boutons radio.

       LA PORTE SUIT LES DEUX FORMES, et c'est pour cela que les deux sélecteurs
       restent : le relevé de 21 h 06 portait la première, celui de 21 h 38 la
       seconde, et une porte qui ne connaît que la dernière ne sait plus dire si
       un retour en arrière a eu lieu. Sans cette reprise, elle annonçait
       « 0 regions au lieu de 11 » et « 0 villes au lieu de 48 » alors que les
       onze régions et les quarante-huit villes sont servies, comptables dans le
       HTML : exactement le défaut du 13/10 sur le pied de page. */
    const annuaire =
      section.querySelector("[class*='annuaire']") ?? section.querySelector("[class*='panneauBassins']");
    const rangs = panneau ? [...panneau.querySelectorAll(":scope > [class*='tuileHub']")] : [];
    /* `bassinsNomRegion` ET NON `bassinsPanneau` : les panneaux sont douze pour
       onze régions, le dernier servant de repli. Le nom de région, lui, est
       écrit une fois par région. Et `bassinsOnglet` compte aussi douze. */
    const regions = annuaire
      ? (() => {
          const anciens = [...annuaire.querySelectorAll(":scope > [class*='groupeRegion']")];
          if (anciens.length > 0) return anciens;
          /* `closest` ET NON `querySelectorAll('[class*=bassinsPanneau]')` : le
             conteneur s'appelle `bassinsPanneaux`, AU PLURIEL, il porte donc la
             même sous-chaîne et contient tous les noms de région. Compté
             naïvement, il faisait un douzième panneau et la porte annonçait
             « 12 regions au lieu de 11 ». Même piège que `tuileZones`. */
          return [
            ...new Set(
              [...annuaire.querySelectorAll("[class*='bassinsNomRegion']")].map(
                (n) => n.closest("[class*='bassinsPanneau']") ?? n,
              ),
            ),
          ];
        })()
      : [];

    /* LES RÉGRESSIONS DU MODE TÉMOIN, injectées ici pour que la mesure qui suit
       les voie exactement comme elle verrait une vraie dérive. */
    if (retouche === "bloc double" && panneau) for (const r of rangs) r.style.paddingBlock = "58px";
    if (retouche === "colonne vide" && annuaire) annuaire.style.columns = String(regions.length + 4);
    if (retouche === "titre absent") section.querySelector("h2")?.remove();
    if (retouche === "liens perdus") for (const [i, a] of [...section.querySelectorAll("a")].entries()) if (i % 2) a.remove();
    /* CE TÉMOIN ÉTAIT MUET, et deux fois. Il posait
       `gridTemplateColumns = "repeat(3, minmax(0,1fr))"` sur un panneau qui
       porte DÉJÀ trois colonnes : il n'injectait donc rien. Et il le posait sur
       `panneauHubs`, disparu avec la mosaïque du 13/10, donc sur `null`.
       Il RÉTRÉCIT maintenant la deuxième tuile à 40 px : elle n'occupe plus sa
       cellule, et le vide qu'elle laisse est exactement le trou que la règle
       doit voir, au milieu de la rangée ou à son extrémité droite.
       Forcer une colonne ne suffisait pas : Lyon en prend déjà deux, et la
       tuile déplacée retombait sur un emplacement libre sans rien creuser. */
    if (retouche === "trou dans la mosaique" && rangs[1]) rangs[1].style.width = "40px";
    /* Le marqueur vient du HTML du serveur : c'est lui qu'on fausse, pas le DOM. */
    /* « servi ferme » NE S'INJECTE PLUS DANS LE DOM : il se fausse sur le HTML
       DU SERVEUR, voir `compteServisOuverts`. L'ancienne version posait
       `data-servi-ouvert="0"`, un attribut QUE RIEN NE POSE dans tout le dépôt
       (`grep -rn "servi-ouvert" components lib` : aucune occurrence). La règle
       était donc TOUJOURS fausse, la porte annonçait « n'est pas SERVI ouvert »
       sur les deux blocs à chaque largeur, et son témoin passait sans rien
       prouver : la règle tombait que l'on injecte ou non. */
    if (retouche === "repli defait") for (const d of plis) d.open = true;
    if (retouche === "deborde") section.style.width = "140vw";

    const colonnesDe = (e) => (e ? Number(getComputedStyle(e).columnCount) || 0 : 0);
    const grilleColonnes = (e) => (e ? getComputedStyle(e).gridTemplateColumns.split(" ").filter(Boolean).length : 0);

    /**
     * LES RANGÉES DE LA MOSAÏQUE, MESURÉES COMME UN PAVAGE, et c'est ce que
     * l'ancien comptage ne pouvait plus faire.
     *
     * LA RÈGLE À TENIR N'A PAS CHANGÉ : pas de TROU dans la mosaïque. C'est sa
     * mesure qui devait changer. L'ancienne comparait le nombre de tuiles d'une
     * rangée au nombre de colonnes de la grille, ce qui n'a plus de sens depuis
     * que Lyon occupe DEUX colonnes : onze emplacements pour dix tuiles sur
     * trois colonnes, la rangée qui porte Lyon n'aura jamais trois tuiles, et
     * la dernière n'en a que deux. Portée telle quelle, elle aurait rendu trois
     * faux défauts par largeur.
     *
     * CE QUI EST MESURÉ ICI, géométriquement, et qui vaut quel que soit le
     * nombre de colonnes qu'une tuile occupe : chaque rangée commence au bord
     * gauche du panneau, ses tuiles se suivent sans écart plus grand que le
     * `gap` de la grille, et elle finit au bord droit. LA DERNIÈRE RANGÉE EST
     * DISPENSÉE DE FINIR AU BORD : une grille dont le compte ne tombe pas juste
     * laisse toujours sa dernière rangée courte, c'est le cas aujourd'hui, et
     * l'exiger serait exiger un nombre de hubs multiple du nombre de colonnes.
     *
     * UN TROU AU MILIEU D'UNE RANGÉE, lui, n'est jamais dispensé : c'est
     * précisément ce que l'ancien comptage ne voyait pas, même avant la
     * mosaïque, quand le compte de tuiles tombait juste par hasard.
     */
    function rangeesDeLaMosaique() {
      if (!panneau || rangs.length === 0) return [];
      const style = getComputedStyle(panneau);
      const cadre = panneau.getBoundingClientRect();
      const bordGauche = cadre.left + (Number.parseFloat(style.paddingLeft) || 0);
      const bordDroit = cadre.right - (Number.parseFloat(style.paddingRight) || 0);
      const ecart = Number.parseFloat(style.columnGap) || 0;

      const parHaut = new Map();
      for (const tuile of rangs) {
        const r = tuile.getBoundingClientRect();
        const cle = Math.round(r.top / 4) * 4;
        if (!parHaut.has(cle)) parHaut.set(cle, []);
        parHaut.get(cle).push(r);
      }
      return [...parHaut.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, rects]) => {
          const tries = rects.sort((a, b) => a.left - b.left);
          let trou = 0;
          for (let i = 1; i < tries.length; i += 1) {
            trou = Math.max(trou, tries[i].left - tries[i - 1].right - ecart);
          }
          return {
            tuiles: tries.length,
            debut: Math.round(tries[0].left - bordGauche),
            trou: Math.round(trou),
            fin: Math.round(bordDroit - tries[tries.length - 1].right),
          };
        });
    }

    return {
      absente: false,
      section: { hauteur: haut(section), titre: texte(section.querySelector("h2") ?? document.createElement("i")), sousTitre: texte(section.querySelector("h3") ?? document.createElement("i")) },
      plis: plis.map((d) => ({
        hauteur: haut(d),
        ouvert: d.open,
        titre: texte(d.querySelector("summary h2, summary h3") ?? document.createElement("i")),
      })),
      hubs: { nombre: rangs.length, colonnes: grilleColonnes(panneau), parRangee: groupes(rangs, "top"), rangees: rangeesDeLaMosaique() },
      annuaire: { colonnesDeclarees: colonnesDe(annuaire), colonnesRemplies: groupes(regions, "left").length, regions: regions.length },
      comptes: {
        hubs: section.querySelectorAll("[class*='tuileHub'] a[class*='tuileLien']").length,
        bassins: section.querySelectorAll("[class*='tuileHub'] a[class*='tuileZone']").length,
        regions: regions.length,
        /* `a[class*=...]` DANS LES DEUX FORMES : `bassinsVilles` au pluriel est
           le conteneur et porte la même sous-chaîne que `bassinsVille`. Seules
           les ancres comptent, comme pour `tuileZone` plus haut. */
        villes:
          section.querySelectorAll("[class*='groupeRegion'] a[class*='ville']").length ||
          section.querySelectorAll("a[class*='bassinsVille']").length,
        liens: section.querySelectorAll("a").length,
      },
      /* LE DÉBORDEMENT SE MESURE SUR L'ÉLÉMENT, PAS SUR LE DOCUMENT, et c'est
         le témoin « deborde » qui l'a prouvé : `.mg-site` est en
         `overflow-x: clip`, donc `documentElement.scrollWidth` reste égal à la
         fenêtre même avec une section large de 140 vw. La question posée est
         donc : un élément de la section sort-il de la fenêtre ? */
      deborde: (() => {
        const bord = document.documentElement.clientWidth;
        const fautif = [section, ...section.querySelectorAll("*")].find((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && (r.right > bord + 1 || r.left < -1);
        });
        if (!fautif) return null;
        const r = fautif.getBoundingClientRect();
        return `${fautif.tagName.toLowerCase()} « ${texte(fautif).slice(0, 30)} » de ${Math.round(r.left)} à ${Math.round(r.right)} px pour ${bord} px de fenêtre`;
      })(),
    };
  }, retouche ?? null);
}

/* ------------------------------------------------------------ le verdict */

/**
 * LES BLOCS SERVIS OUVERTS PAR LE SERVEUR, lus dans le HTML DU SERVEUR.
 *
 * C'est la seule façon honnête de poser la question. Le repli est un effet
 * CLIENT : le serveur doit envoyer `<details open>` pour que Google lise le
 * texte entier (CLAUDE.md, principe 1), et c'est l'hydratation qui referme.
 * Interroger le DOM après coup ne peut donc pas répondre, puisqu'il porte déjà
 * le résultat de l'effet.
 */
function compteServisOuverts(html) {
  return (
    html.match(/<details(?=[^>]*\bdata-pliable-mobile\b)(?=[^>]*\bopen\b)[^>]*>/g) ?? []
  ).length;
}

function controle(vue, faits, seuils, servisOuverts) {
  const e = [];
  if (faits.absente) return [`${vue} : la section « Nos villes » est introuvable`];

  if (!faits.section.titre.includes("bassins couverts")) e.push(`${vue} : le titre des hubs est absent du rendu`);
  if (!faits.section.sousTitre.includes("villes couvertes")) e.push(`${vue} : le titre de « Au-delà des hubs » est absent du rendu`);

  for (const [cle, attendu] of Object.entries(COMPTES)) {
    if (faits.comptes[cle] !== attendu) e.push(`${vue} : ${faits.comptes[cle]} ${cle} au lieu de ${attendu}`);
  }

  const [hubs, audela] = faits.plis;
  if (faits.plis.length !== 2) e.push(`${vue} : ${faits.plis.length} bloc(s) repliable(s) au lieu de 2`);
  const avant = (cle) => seuils.avant[cle] ?? "n.c.";
  if (faits.section.hauteur > seuils.section) e.push(`${vue} : la section fait ${faits.section.hauteur} px, plafond ${seuils.section} (avant la refonte : ${avant("section")})`);
  if (hubs && hubs.hauteur > seuils.hubs) e.push(`${vue} : le bloc des hubs fait ${hubs.hauteur} px, plafond ${seuils.hubs} (avant : ${avant("hubs")})`);
  if (audela && audela.hauteur > seuils.audela) e.push(`${vue} : « Au-delà des hubs » fait ${audela.hauteur} px, plafond ${seuils.audela} (avant : ${avant("audela")})`);

  for (const [i, pli] of faits.plis.entries()) {
    if (!pli.titre) e.push(`${vue} : le bloc repliable n° ${i + 1} n'a pas de titre dans son en-tête`);
  }

  if (servisOuverts !== null && servisOuverts < faits.plis.length)
    e.push(
      `${vue} : ${faits.plis.length - servisOuverts} bloc(s) repliable(s) sur ${faits.plis.length} ` +
        `ne sont PAS servis ouverts par le serveur (${servisOuverts} <details open> dans le HTML servi) : ` +
        `leur texte n'arrive pas entier à Google`,
    );

  if (faits.deborde) e.push(`${vue} : la section déborde de la fenêtre, ${faits.deborde}`);

  if (seuils.densite !== null) {
    const densite = (faits.comptes.liens * 1000) / faits.section.hauteur;
    if (densite < seuils.densite) e.push(`${vue} : densité de ${densite.toFixed(1)} liens pour 1 000 px, plancher ${seuils.densite}`);
    /* UN TROU DANS LA MOSAÏQUE, et non « une rangée dont le compte de tuiles
       diffère du nombre de colonnes » : voir `rangeesDeLaMosaique`. La dernière
       rangée est dispensée de FINIR au bord droit, jamais de commencer au bord
       gauche ni d'être continue. */
    const rangees = faits.hubs.rangees ?? [];
    for (const [i, r] of rangees.entries()) {
      if (r.trou > 2) e.push(`${vue} : trou de ${r.trou} px au milieu de la rangée de hubs n° ${i + 1} (${r.tuiles} tuile(s))`);
    }
    /* CE QUI N'EST PAS AFFIRMÉ ICI, et pourquoi, mesuré le 13/10.
       `rangeesDeLaMosaique` relève aussi `debut` et `fin`, l'écart de chaque
       rangée aux deux bords du panneau. Ils ne sont PAS jugés, et ce n'est pas
       par indulgence : avec dix tuiles dont une occupe deux colonnes sur trois,
       le placement automatique de la grille déplace légitimement une tuile à la
       rangée suivante quand il ne reste qu'une colonne, et laisse la cellule
       libre derrière elle. C'est le comportement normal de CSS Grid, pas un
       défaut de la page, et deux relevés successifs du même écran ne le placent
       pas au même endroit. En faire une faute aurait rendu la porte instable,
       ce qui est pire que muette : elle aurait réclamé un nombre de hubs
       multiple du nombre de colonnes.
       LE TROU AU MILIEU D'UNE RANGÉE, lui, n'a aucune cause légitime, ne varie
       pas d'un relevé à l'autre, et c'est le seul que le témoin injecte. */
    if (faits.annuaire.colonnesRemplies < faits.annuaire.colonnesDeclarees)
      e.push(`${vue} : ${faits.annuaire.colonnesDeclarees - faits.annuaire.colonnesRemplies} colonne(s) vide(s) dans l'annuaire (${faits.annuaire.colonnesDeclarees} déclarées, ${faits.annuaire.colonnesRemplies} remplies)`);
  } else {
    for (const [i, pli] of faits.plis.entries()) {
      if (pli.ouvert) e.push(`${vue} : le bloc repliable n° ${i + 1} reste déplié au téléphone`);
    }
  }
  return e;
}

/* --------------------------------------------------------------- la page */

/** Ouvre la page, refuse les traceurs, retire la pastille Next, attend l'hydratation. */
async function ouvre(navigateur, { largeur, hauteur }) {
  const ctx = await navigateur.newContext({ viewport: { width: largeur, height: hauteur } });
  const page = await ctx.newPage();
  /* LE HTML DU SERVEUR VIENT DE LA RÉPONSE DU NAVIGATEUR, et plus d'un `fetch`.

     C'EST LE DÉFAUT LE PLUS COÛTEUX DE CETTE PORTE, trouvé le 13/10. Elle
     lisait `await (await fetch(URL)).text()` pour savoir quels blocs le serveur
     envoie ouverts. Or `migen-site.vercel.app` RÉPOND 403 à un `fetch` de Node,
     là où il répond 200 au navigateur comme à `curl`. La porte prenait donc le
     corps du 403 pour la page, n'y trouvait aucun `<details open>`, et
     concluait « le bloc repliable n'est pas SERVI ouvert par le serveur » sur
     les deux blocs à chacune des trois largeurs. Six faux défauts par
     exécution, sur un contrôle qui touche au principe 1 de CLAUDE.md : un refus
     réseau était lu comme une perte de contenu.

     La réponse du `goto` porte le MÊME HTML, avant exécution de tout script, et
     elle vient d'une requête qui, elle, aboutit. Une lecture impossible rend
     `null`, et la règle se déclare NON MESURÉE au lieu de se tromper. */
  const reponse = await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  const html = reponse && reponse.ok() ? await reponse.text().catch(() => null) : null;
  await page.waitForLoadState("load").catch(() => {});
  const refuser = page.getByRole("button", { name: "Tout refuser" }).first();
  if (await refuser.count().catch(() => 0)) await refuser.click({ timeout: 2500 }).catch(() => {});
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((x) => x.remove()));
  /* Le repli est un effet client : il faut lui laisser le temps de passer. */
  await page.waitForTimeout(2000);
  return { ctx, page, servisOuverts: html === null ? null : compteServisOuverts(html) };
}

/* ----------------------------------------------------------------- course */

const navigateur = await chromium.launch();
let rouge = false;

if (CONTROLE) {
  /* Chaque régression est injectée dans le DOM, puis la mesure doit la voir.
     Une porte qui ne sait pas échouer ne protège rien. */
  const TEMOINS = [
    ["bureau", "bloc double", /le bloc des hubs fait \d+ px, plafond/],
    ["bureau", "colonne vide", /colonne\(s\) vide\(s\) dans l'annuaire/],
    ["bureau", "titre absent", /le titre des hubs est absent du rendu/],
    ["bureau", "liens perdus", /\d+ liens au lieu de 88/],
    ["bureau", "trou dans la mosaique", /trou de \d+ px au milieu de la rangée de hubs|rangée de hubs n° \d+ s'arrête \d+ px avant le bord droit/],
    ["bureau", "deborde", /la section déborde de la fenêtre/],
    ["bureau", "servi ferme", /ne sont PAS servis ouverts par le serveur/],
    ["telephone", "repli defait", /reste déplié au téléphone/],
  ];
  let aveugle = false;
  for (const [vue, retouche, attendu] of TEMOINS) {
    const seuils = SEUILS[vue];
    const { ctx, page, servisOuverts } = await ouvre(navigateur, seuils);
    /* Le témoin « servi ferme » fausse le COMPTE LU DANS LE HTML SERVI, et non
       le DOM : c'est là que la question se pose, puisque le repli est un effet
       client. Les autres témoins reçoivent le vrai compte. */
    const servis = retouche === "servi ferme" ? 0 : servisOuverts;
    const ecarts = controle(vue, await releve(page, retouche), seuils, servis);
    await ctx.close();
    const vue2 = ecarts.some((x) => attendu.test(x));
    console.log(`  ${vue2 ? "OK  " : "RATE"}  ${vue} : « ${retouche} » est vue`);
    if (!vue2) {
      aveugle = true;
      console.log(`        écarts relevés : ${ecarts.length ? ecarts.join(" | ") : "aucun"}`);
    }
  }
  if (aveugle) {
    await navigateur.close();
    console.log("\nCONTRÔLE AVEUGLE : la porte ne sait pas échouer.");
    process.exit(1);
  }
  console.log(`\ncontrôle positif conforme (${TEMOINS.length}/${TEMOINS.length})`);
}

const tous = [];
for (const [vue, seuils] of Object.entries(SEUILS)) {
  const { ctx, page, servisOuverts } = await ouvre(navigateur, seuils);
  const faits = await releve(page);
  await ctx.close();
  if (servisOuverts === null)
    console.log(`  ! ${vue} : HTML servi illisible, le contrôle « servi ouvert » est NON MESURÉ`);
  tous.push(...controle(vue, faits, seuils, servisOuverts));
  if (!faits.absente) {
    const densite = ((faits.comptes.liens * 1000) / faits.section.hauteur).toFixed(1);
    console.log(
      `  ${vue.padEnd(9)} ${seuils.largeur}px  section ${faits.section.hauteur} px (avant ${seuils.avant.section ?? "n.c."})` +
        `  hubs ${faits.plis[0]?.hauteur ?? "?"} (avant ${seuils.avant.hubs ?? "n.c."})` +
        `  au-delà ${faits.plis[1]?.hauteur ?? "?"} (avant ${seuils.avant.audela ?? "n.c."})` +
        `  ${faits.comptes.liens} liens, densité ${densite}/1000px`,
    );
  }
}
await navigateur.close();

if (tous.length) {
  rouge = true;
  console.log(`\nKO  « Nos villes »  ${tous.length} écart(s)`);
  for (const x of tous) console.log(`      ${x}`);
}
if (rouge) process.exit(1);
console.log("\nOK  « Nos villes » : compact, dense, plein, replié au téléphone.");
