/**
 * Les animations de la maquette tournent-elles, et sans faire tomber d'images ?
 *
 *   node scripts/verifie-animations.mjs
 *
 * POURQUOI CE CONTRÔLE EXISTE. La première version du portage avait remplacé la
 * révélation au défilement par du CSS. C'était plus court, et c'était faux : le
 * client l'a vu immédiatement (« y'a pas les animations »). Les trois moteurs de
 * la maquette sont maintenant portés en JavaScript, et ce contrôle vérifie leur
 * EFFET observable, pas la présence de leur code.
 *
 * TROIS CHOSES SONT VÉRIFIÉES, et la troisième est la plus importante :
 *   1. au chargement, ce qui est sous la ligne de déclenchement est bien armé ;
 *   2. deux secondes de défilement continu ne produisent aucune image longue ;
 *   3. avec `prefers-reduced-motion`, RIEN n'est masqué et les rails ne bougent
 *      pas. Sans JavaScript ou sans animation, la page doit rester entière :
 *      c'est une exigence d'accessibilité, pas un réglage de confort.
 *
 * PRÉALABLE : le site doit tourner sur http://localhost:4340/ (bun run dev).
 */
import { chromium } from "playwright";

/* Par défaut le serveur de développement. `SITE_URL=http://localhost:4341/`
   pointe la version construite, qui est celle que les visiteurs reçoivent :
   c'est là que les mesures de fluidité comptent, le développement payant la
   compilation à la demande et les images non optimisées. */
const SITE = process.env.SITE_URL ?? "http://localhost:4340/";
const LARGEUR = 1280;
const HAUTEUR = 860;

/** Au-delà, l'image est perçue comme un accroc. Seuil du contrat de performance. */
const IMAGE_LONGUE_MS = 50;

/** Durée du défilement mesuré. */
const DEFILEMENT_MS = 2000;

/** La maquette révèle ce qui est sous 92 % de la hauteur de fenêtre. */
const LIGNE = 0.92;

const navigateur = await chromium.launch({ channel: "chrome" });
const problemes = [];

async function ouvre(mouvementReduit) {
  const contexte = await navigateur.newContext({
    viewport: { width: LARGEUR, height: HAUTEUR },
    reducedMotion: mouvementReduit ? "reduce" : "no-preference",
  });
  const page = await contexte.newPage();
  const reponse = await page.goto(SITE, { waitUntil: "load", timeout: 60_000 });
  if (!reponse?.ok()) throw new Error(`${SITE} répond ${reponse?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  return { contexte, page };
}

try {
  // ------------------------------------------------- 1. l'armement au chargement
  {
    const { contexte, page } = await ouvre(false);
    const etat = await page.evaluate((ligne) => {
      const blocs = [...document.querySelectorAll("[data-reveal]")];
      const seuil = window.innerHeight * ligne;
      return {
        total: blocs.length,
        masques: blocs.filter((b) => b.style.opacity === "0").length,
        armes: blocs.filter((b) => b.hasAttribute("data-armed")).length,
        sousLaLigne: blocs.filter((b) => b.getBoundingClientRect().top > seuil).length,
        visiblesEnHaut: blocs.filter(
          (b) => b.getBoundingClientRect().top <= seuil && b.style.opacity === "0",
        ).length,
      };
    }, LIGNE);

    if (etat.total === 0) problemes.push("aucun bloc [data-reveal] : la page n'a plus de révélations");
    if (etat.armes !== etat.sousLaLigne) {
      problemes.push(
        `armement : ${etat.armes} blocs armés pour ${etat.sousLaLigne} sous la ligne de déclenchement`,
      );
    }
    if (etat.visiblesEnHaut > 0) {
      problemes.push(
        `${etat.visiblesEnHaut} bloc(s) au-dessus de la ligne restent à opacity 0 : ils ne seront jamais révélés`,
      );
    }
    console.log(
      `armement : ${etat.total} blocs, ${etat.armes} armés, ${etat.masques} masqués, ` +
        `${etat.sousLaLigne} sous la ligne`,
    );

    // --------------------------------------------- 2. le défilement, deux passes
    //
    // DEUX passes, et seule la seconde est jugée : la première paie le décodage
    // des images, qui n'arrive qu'une fois et ne dépend pas du code mesuré.
    const passe = async () =>
      page.evaluate(async (duree) => {
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 500));
        const images = [];
        let precedente = performance.now();
        const depart = precedente;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        await new Promise((fini) => {
          const pas = (maintenant) => {
            images.push(maintenant - precedente);
            precedente = maintenant;
            const avancement = Math.min(1, (maintenant - depart) / duree);
            window.scrollTo(0, avancement * total);
            if (avancement < 1) requestAnimationFrame(pas);
            else fini();
          };
          requestAnimationFrame(pas);
        });
        // La première mesure part du temps écoulé avant le premier rappel : elle
        // ne décrit pas une image rendue, elle est écartée.
        const utiles = images.slice(1);
        return {
          images: utiles.length,
          max: Math.round(Math.max(...utiles)),
          moyenne: utiles.reduce((a, b) => a + b, 0) / utiles.length,
          longues: utiles.filter((d) => d > 50).map(Math.round),
        };
      }, DEFILEMENT_MS);

    const premiere = await passe();
    const seconde = await passe();
    const ips = Math.round(1000 / seconde.moyenne);
    console.log(
      `défilement : ${seconde.images} images à ${ips} i/s, ` +
        `${seconde.longues.length} au-delà de ${IMAGE_LONGUE_MS} ms, max ${seconde.max} ms ` +
        `(première passe : ${premiere.longues.length} longue(s), max ${premiere.max} ms)`,
    );
    if (seconde.longues.length > 0) {
      problemes.push(
        `défilement : ${seconde.longues.length} image(s) au-delà de ${IMAGE_LONGUE_MS} ms ` +
          `(${seconde.longues.join(", ")} ms)`,
      );
    }
    await contexte.close();
  }

  // ------------------------------------------- 3. prefers-reduced-motion : tout visible
  {
    const { contexte, page } = await ouvre(true);
    const etat = await page.evaluate(async () => {
      const rails = [...document.querySelectorAll(".mg-autorail, .g3-offrail, .g3-refrail")];
      const avant = rails.map((r) => r.scrollLeft);
      await new Promise((r) => setTimeout(r, 1500));
      const apres = rails.map((r) => r.scrollLeft);
      return {
        reduit: matchMedia("(prefers-reduced-motion: reduce)").matches,
        masques: [...document.querySelectorAll("[data-reveal]")].filter(
          (b) => b.style.opacity === "0",
        ).length,
        armes: document.querySelectorAll("[data-armed]").length,
        rails: rails.length,
        railsQuiBougent: avant.filter((x, i) => x !== apres[i]).length,
        barresAZero: [...document.querySelectorAll("[data-bar]")].filter(
          (b) => b.style.width === "0%",
        ).length,
      };
    });

    if (!etat.reduit) problemes.push("mouvement réduit : la préférence n'a pas été appliquée, mesure invalide");
    if (etat.masques > 0) problemes.push(`mouvement réduit : ${etat.masques} bloc(s) masqués, la page doit rester entière`);
    if (etat.armes > 0) problemes.push(`mouvement réduit : ${etat.armes} élément(s) armés, aucune animation ne doit être préparée`);
    if (etat.railsQuiBougent > 0) problemes.push(`mouvement réduit : ${etat.railsQuiBougent} rail(s) défilent encore`);
    if (etat.barresAZero > 0) problemes.push(`mouvement réduit : ${etat.barresAZero} barre(s) laissées à 0 %`);
    console.log(
      `mouvement réduit : ${etat.masques} masqué(s), ${etat.armes} armé(s), ` +
        `${etat.railsQuiBougent}/${etat.rails} rail(s) en mouvement`,
    );
    await contexte.close();
  }
} catch (erreur) {
  problemes.push(`contrôle impossible : ${erreur.message}`);
  console.error("Le site doit tourner sur http://localhost:4340/ (bun run dev).");
} finally {
  await navigateur.close();
}

if (problemes.length > 0) {
  for (const p of problemes) console.error(`  ${p}`);
  process.exit(1);
}
console.log("animations conformes");
