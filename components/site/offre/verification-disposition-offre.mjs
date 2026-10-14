/**
 * LA PORTE DE LA DISPOSITION DE LA FAMILLE OFFRE.
 *
 *   node components/site/offre/verification-disposition-offre.mjs
 *   node components/site/offre/verification-disposition-offre.mjs --controle
 *   SITE_URL=https://migen-site.vercel.app node components/site/offre/verification-disposition-offre.mjs
 *
 * POURQUOI ELLE EXISTE, alors que `verification-responsive-offre.mjs` couvre
 * déjà ces pages. Lancée le 14/10 contre la production sur les deux pages que
 * Mehdi signale, celle du responsive a rendu « 0 débordement, 0 chevauchement,
 * 0 texte tronqué ». Elle avait raison : rien ne déborde et rien ne se marche
 * dessus. Et pourtant le bloc est bien mal disposé. Ce qu'elle ne sait pas
 * voir, c'est un bloc qui a PERDU SON CADRE ou PERDU SON TEXTE : la page reste
 * géométriquement saine, elle ne ressemble simplement plus à la maquette.
 *
 * CE QU'ELLE COMPARE, et c'est tout l'écart avec la porte de texte (G17,
 * `scripts/verifie-offre-rendu.mjs`, qui compare les MOTS) : elle compare les
 * BOÎTES du site à celles de la maquette, section par section, sur les deux
 * blocs que Mehdi nomme « mal disposés » le 12/10.
 *
 *   CARTE PERDUE  une section « Complément N » que la maquette rend dans une
 *                 carte en verre (fond, bordure, rayon ≥ 16 px) et que le site
 *                 rend sans cadre. C'est le défaut du 12/10 : la règle
 *                 « ligne de clôture » de `ComplementsOffre` s'appliquait aussi
 *                 à l'emplacement qui suit la BANDE D'APPEL, où elle ne clôt
 *                 rien, et le texte venait se coller sous le bouton.
 *   BANDE CREUSE  une bande d'appel dont le bouton occupe moins du tiers de la
 *                 largeur parce que la phrase des horaires a disparu. Mesuré
 *                 sur `/travaux-industriels/` : 22 % à 1280 px, trois fois par
 *                 page, 876 px de vide à chaque fois.
 *   HAUTEUR       une section dont la hauteur s'écarte de plus de 24 px de
 *                 celle de la maquette. 24 px, parce que c'est moins d'une
 *                 ligne de texte du gabarit (15,5 px × 1,7 = 26,35 px) : en
 *                 dessous, l'écart vient du rendu des polices, au dessus il
 *                 manque ou il reste du contenu.
 *
 * LA RÉFÉRENCE EST LA MAQUETTE VIVANTE, servie sur 4352 par
 * `scripts/sers-maquette.sh`, et non la capture figée de `maquette/rendu/` :
 * la capture ne porte pas sa feuille de style, elle ne sait rien dire d'une
 * hauteur ni d'un fond. Sans la maquette servie, la porte REFUSE DE CONCLURE
 * plutôt que de conclure sur rien.
 *
 * DEUX LARGEURS : 1280 px, le bureau de la maquette, et 390 px, la largeur de
 * sa maquette mobile. Les deux, parce que le défaut de la carte se voit aux
 * deux et que celui de la bande creuse ne se chiffre bien qu'au bureau.
 *
 * TROIS PIÈGES DE MESURE DÉJÀ PAYÉS SUR CE PROJET, et traités ici :
 *   · le bandeau de consentement est REFUSÉ, sinon il couvre le bas de page ;
 *   · l'HYDRATATION est attendue : les blocs repliables sont servis ouverts
 *     par le serveur et refermés par un effet client sous 880 px ;
 *   · `decode()` sur une image différée ne se résout jamais : la promesse est
 *     mise en course avec un délai, sinon la mesure ne rend jamais la main
 *     (payé deux fois le 14/10, deux mesures tuées à 5 et 7 minutes).
 *
 * SON CONTRÔLE NÉGATIF, `--controle`. Trois témoins, et chacun doit faire
 * TOMBER la règle qu'il vise, sinon la porte s'auto-déclare inutile :
 *   1. une section sans carte contre une maquette qui en a une ;
 *   2. une bande dont le bouton n'occupe que 22 % de la largeur ;
 *   3. une hauteur de 90 px contre 191 px attendus.
 * Et un QUATRIÈME témoin, positif celui-là : un relevé conforme doit PASSER,
 * faute de quoi la porte refuserait tout et ne mesurerait rien.
 */
import { chromium } from "playwright";

const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const MAQUETTE = process.env.MAQUETTE_URL ?? "http://localhost:4352";
const CONTROLE = process.argv.includes("--controle");
const JOURNAL = process.argv.includes("--journal");

/** Les deux pages que Mehdi signale le 12/10, et leur gabarit. */
const PAGES = (process.env.DISPOSITION_PAGES ?? "/offres/bureau-etudes/,/travaux-industriels/")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const LARGEURS = (process.env.DISPOSITION_LARGEURS ?? "1280,390")
  .split(",")
  .map((n) => Number(n.trim()))
  .filter(Boolean);

/** Moins d'une ligne de texte du gabarit (15,5 px × 1,7 = 26,35 px). */
const TOLERANCE_HAUTEUR = 24;

/**
 * LES ARBITRAGES DE MEHDI CONTRE SA PROPRE MAQUETTE, encodés ici parce qu'une
 * porte qui les compte pour des défauts crie à chaque passage et finit par
 * n'être plus lue, et qu'une porte qui les excuse en silence ne verra jamais
 * qu'ils ont été défaits.
 *
 * ELLE EST À DEUX FACES, comme celle de `/nous-connaitre/` et celle des
 * expertises : elle tombe si le SITE reperd l'arbitrage (la carte revient),
 * et elle tombe si la MAQUETTE cesse d'écrire la carte (l'arbitrage n'aurait
 * alors plus d'objet et serait à revoir, pas à reconduire en silence).
 *
 * UN SEUL, à ce jour : le 12/10, sur `/offres/bureau-etudes/`, « Ni celui ci
 * ou il y a juste une phrase : Chaque étape a un livrable défini et un point
 * de validation. Vous restez maître des choix. » Le texte reste servi mot pour
 * mot, seule la carte tombe.
 *
 * « La confidentialité par défaut… » N'EST PAS ARBITRÉ et reste donc compté
 * comme un écart : il a perdu sa carte par ricochet de la règle posée pour la
 * phrase ci-dessus, sans que Mehdi l'ait demandé. Le signaler est le seul
 * moyen qu'il puisse trancher.
 */
const ARBITRAGES_SANS_CARTE = ["Chaque étape a un livrable défini"];

/* Un bouton seul dans une bande de 1120 px occupe 22 %. Avec sa phrase, la
   bande est pleine : 21 % pour le bouton, le reste pour le texte, et les deux
   fentes sont occupées. Le seuil ne mesure donc PAS le bouton, il mesure si la
   bande porte autre chose que lui. */
const PART_MINIMALE_DU_TEXTE = 0.25;

/**
 * Le relevé d'une page, identique des deux côtés : c'est la même fonction qui
 * lit le site et la maquette, sinon l'écart mesuré serait celui des deux
 * lecteurs et non celui des deux pages.
 */
const RELEVE = () => {
  const norm = (s) =>
    (s || "").replace(/[  ]/g, " ").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

  const estCarte = (e) => {
    const cs = getComputedStyle(e);
    return (
      parseFloat(cs.borderTopLeftRadius) >= 16 &&
      cs.backgroundColor !== "rgba(0, 0, 0, 0)" &&
      cs.backgroundColor !== "transparent"
    );
  };

  const releve = [];
  const racine = document.querySelector("main") ?? document.body;
  for (const section of racine.querySelectorAll("section")) {
    const texte = norm(section.textContent);
    let genre = null;
    /* On reconnaît un bloc à SON TEXTE, jamais à une classe : les classes du
       site sont hachées par le build et la maquette n'en a aucune. */
    if (/^(Nous vous rappelons dans l'heure|Faire chiffrer |Parler à un chargé)/.test(texte) && texte.length < 300) {
      genre = "BANDE";
    } else if (section.querySelector(":scope > div > div > div[style]") && /^(Structures et châssis|Ce que nous ne |Chaque étape a un livrable|La confidentialité par défaut)/.test(texte)) {
      genre = "COMPLEMENT";
    } else if (/^(Structures et châssis|Ce que nous ne |Chaque étape a un livrable|La confidentialité par défaut)/.test(texte)) {
      genre = "COMPLEMENT";
    }
    if (!genre) continue;

    const r = section.getBoundingClientRect();
    const carte = [...section.querySelectorAll("div")].find(estCarte);
    const rc = carte?.getBoundingClientRect();
    const bouton = section.querySelector("a[href='#besoin'], a[href*='#besoin']");

    /* LA PART DU TEXTE, et pourquoi elle se MESURE au lieu de se déduire.
       Un premier jet la calculait par soustraction (`1 - bouton / bande`) :
       sur une bande vide il trouvait 78 % « de texte » là où il n'y en a pas
       un caractère, et le témoin négatif a refusé de tirer. On cherche donc
       l'élément de texte lui-même : une feuille (sans enfant), hors du bouton,
       portant plus de 30 caractères. Absent, la part vaut 0, pas null : une
       bande sans phrase est un fait mesuré, pas une mesure manquante. */
    const phrase = rc
      ? [...carte.querySelectorAll("span,p,div")].find(
          (e) =>
            e.children.length === 0 &&
            norm(e.textContent).length > 30 &&
            !(bouton && bouton.contains(e)),
        )
      : null;

    releve.push({
      genre,
      cle: texte.slice(0, 46),
      /* Masquée par la feuille du gabarit : voir `compare`, bandes mobiles. */
      masquee: getComputedStyle(section).display === "none",
      hauteur: Math.round(r.height),
      carte: rc ? { largeur: Math.round(rc.width), hauteur: Math.round(rc.height) } : null,
      /* Sans bouton, la règle ne s'applique pas : null, et aucun verdict. */
      partDuTexte: rc && bouton ? (phrase ? phrase.getBoundingClientRect().width / rc.width : 0) : null,
    });
  }
  return releve;
};

async function prepare(page) {
  await page.getByRole("button", { name: /Tout refuser/i }).click({ timeout: 2500 }).catch(() => {});
  /* L'hydratation : les blocs repliables sont servis ouverts et refermés par
     un effet client sous 880 px. Mesurer avant donne des hauteurs fausses. */
  await page.waitForTimeout(1500);
  /* `decode()` sur une image différée ne se résout jamais. */
  await page.evaluate(() =>
    Promise.race([
      Promise.all([...document.images].map((i) => i.decode().catch(() => {}))),
      new Promise((r) => setTimeout(r, 3000)),
    ]),
  );
  await page.waitForTimeout(300);
}

async function relevéDuSite(contexte, chemin) {
  const page = await contexte.newPage();
  try {
    const reponse = await page.goto(SITE + chemin, { waitUntil: "domcontentloaded", timeout: 45000 });
    if (!reponse?.ok()) throw new Error(`le site répond ${reponse?.status()} sur ${chemin}`);
    await prepare(page);
    return await page.evaluate(RELEVE);
  } finally {
    await page.close();
  }
}

async function relevéDeLaMaquette(contexte, chemin) {
  const page = await contexte.newPage();
  try {
    await page.goto(`${MAQUETTE}/voir.html?url=${chemin}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(
      () => document.getElementById("etat")?.textContent?.includes("page ouverte"),
      null,
      { timeout: 60000 },
    );
    await page.waitForTimeout(1500);
    const cadre = await (await page.$("#cadre")).contentFrame();
    return await cadre.evaluate(RELEVE);
  } finally {
    await page.close();
  }
}

/**
 * La comparaison de DEUX relevés. Elle est pure et sans navigateur, c'est ce
 * qui permet au contrôle négatif de la nourrir avec des relevés fabriqués.
 */
export function compare(site, maquette, etiquette) {
  const defauts = [];
  const arbitre = (cle) => ARBITRAGES_SANS_CARTE.some((a) => cle.includes(a));

  if (site.length !== maquette.length) {
    defauts.push(
      `ORDRE · ${etiquette} : ${site.length} blocs servis contre ${maquette.length} dans la maquette`,
    );
  }

  const n = Math.min(site.length, maquette.length);
  for (let i = 0; i < n; i++) {
    const s = site[i];
    const m = maquette[i];

    if (s.genre !== m.genre) {
      defauts.push(`ORDRE · ${etiquette} · bloc ${i} : « ${s.genre} » servi là où la maquette pose « ${m.genre} »`);
      continue;
    }

    /* LES BANDES D'APPEL MASQUÉES SOUS 881 PX NE SONT PAS COMPARÉES, et c'est
       la maquette MOBILE V2 qui l'impose (14/10) : elle ne porte aucune des
       trois bandes « Appel » du bureau, la cadence de conversion mobile
       (photo + CTA, bandeau « Être rappelé ») les remplace, et
       `PageOffre.module.css` les masque à cette largeur, texte gardé dans le
       document. La référence de cette porte à 390 px reste la maquette de
       BUREAU rendue étroite : sur ce seul point elle n'est plus la référence.
       Au bureau la bande n'est jamais masquée, toutes ses règles s'y
       appliquent comme avant. */
    if (s.genre === "BANDE" && s.masquee) continue;

    if (arbitre(m.cle)) {
      /* Les deux faces de l'arbitrage, et rien d'autre : ni carte, ni hauteur
         comparée, puisque c'est précisément ce que Mehdi a changé. */
      if (s.carte) {
        defauts.push(
          `ARBITRAGE DÉFAIT · ${etiquette} · « ${m.cle} » : la carte est revenue ` +
            `(${s.carte.largeur}×${s.carte.hauteur} px), alors que Mehdi l'a retirée le 12/10`,
        );
      }
      if (!m.carte) {
        defauts.push(
          `ARBITRAGE SANS OBJET · ${etiquette} · « ${m.cle} » : la maquette n'écrit plus ` +
            `de carte ici, l'arbitrage du 12/10 est à revoir avec Mehdi, pas à reconduire`,
        );
      }
      continue;
    }

    if (m.carte && !s.carte) {
      defauts.push(
        `CARTE PERDUE · ${etiquette} · « ${m.cle} » : la maquette rend une carte de ` +
          `${m.carte.largeur}×${m.carte.hauteur} px, le site n'en rend aucune`,
      );
    }

    if (Math.abs(s.hauteur - m.hauteur) > TOLERANCE_HAUTEUR) {
      defauts.push(
        `HAUTEUR · ${etiquette} · bloc ${i} · « ${m.cle} » : ${s.hauteur} px servis contre ` +
          `${m.hauteur} px dans la maquette (${s.hauteur - m.hauteur > 0 ? "+" : ""}${s.hauteur - m.hauteur})`,
      );
    }

    /* La bande n'est creuse que si la MAQUETTE, elle, y pose du texte : une
       bande que la référence laisse nue n'est pas un défaut de portage. */
    if (
      s.genre === "BANDE" &&
      s.partDuTexte !== null &&
      s.partDuTexte < PART_MINIMALE_DU_TEXTE &&
      (m.partDuTexte ?? 0) >= PART_MINIMALE_DU_TEXTE
    ) {
      const servis = s.carte ? Math.round(s.carte.largeur * s.partDuTexte) : 0;
      const attendus = m.carte ? Math.round(m.carte.largeur * m.partDuTexte) : 0;
      defauts.push(
        `BANDE CREUSE · ${etiquette} · bloc ${i} · « ${s.cle} » : la phrase des horaires occupe ` +
          `${servis} px de la bande servie, contre ${attendus} px dans la maquette ` +
          `(${Math.round(s.partDuTexte * 100)} % contre ${Math.round(m.partDuTexte * 100)} %). ` +
          `RACINE HORS DE CE LOT : le champ `.concat(
            "`contenu.mention` de `supabase/import/gabarits-maquette/<page>.json`, vidé le 12/10 pour ",
            "retirer la mention du HÉROS, alors que `PageOffre.tsx` sert ce même champ au héros ET aux trois bandes.",
          ),
      );
    }
  }
  return defauts;
}

/* ------------------------------------------------------------------ contrôle */

/**
 * Quatre témoins. Les trois premiers DOIVENT faire tomber la règle qu'ils
 * visent, le quatrième DOIT passer. Une porte qui ne sait pas échouer ne vaut
 * rien, et une porte qui refuse tout ne mesure rien.
 */
function controle() {
  const temoins = [
    {
      nom: "carte perdue",
      site: [{ genre: "COMPLEMENT", cle: "Ce que nous ne faisons pas.", hauteur: 191, carte: null, partDuTexte: null }],
      maquette: [{ genre: "COMPLEMENT", cle: "Ce que nous ne faisons pas.", hauteur: 191, carte: { largeur: 1120, hauteur: 143 }, partDuTexte: null }],
      attendu: /^CARTE PERDUE/,
    },
    {
      nom: "bande creuse",
      /* Relevé réel du 14/10 : bande vide côté site (aucune phrase, 0 %),
         bande pleine côté maquette (815 px de phrase sur 1120, soit 73 %). */
      site: [{ genre: "BANDE", cle: "Faire chiffrer mes travaux", hauteur: 137, carte: { largeur: 1120, hauteur: 97 }, partDuTexte: 0 }],
      maquette: [{ genre: "BANDE", cle: "Faire chiffrer mes travaux", hauteur: 137, carte: { largeur: 1120, hauteur: 97 }, partDuTexte: 815 / 1120 }],
      attendu: /^BANDE CREUSE/,
    },
    {
      nom: "hauteur",
      site: [{ genre: "COMPLEMENT", cle: "Ce que nous ne faisons pas.", hauteur: 90, carte: { largeur: 1120, hauteur: 42 }, partDuTexte: null }],
      maquette: [{ genre: "COMPLEMENT", cle: "Ce que nous ne faisons pas.", hauteur: 191, carte: { largeur: 1120, hauteur: 143 }, partDuTexte: null }],
      attendu: /^HAUTEUR/,
    },
    {
      nom: "arbitrage défait",
      site: [{ genre: "COMPLEMENT", cle: "Chaque étape a un livrable défini", hauteur: 165, carte: { largeur: 1120, hauteur: 117 }, partDuTexte: null }],
      maquette: [{ genre: "COMPLEMENT", cle: "Chaque étape a un livrable défini", hauteur: 165, carte: { largeur: 1120, hauteur: 117 }, partDuTexte: null }],
      attendu: /^ARBITRAGE DÉFAIT/,
    },
    {
      nom: "arbitrage sans objet",
      site: [{ genre: "COMPLEMENT", cle: "Chaque étape a un livrable défini", hauteur: 42, carte: null, partDuTexte: null }],
      maquette: [{ genre: "COMPLEMENT", cle: "Chaque étape a un livrable défini", hauteur: 42, carte: null, partDuTexte: null }],
      attendu: /^ARBITRAGE SANS OBJET/,
    },
  ];

  let bon = true;
  for (const t of temoins) {
    const trouves = compare(t.site, t.maquette, "témoin");
    const vu = trouves.some((d) => t.attendu.test(d));
    console.log(`  ${vu ? "ok " : "RATÉ"} témoin « ${t.nom} » : ${vu ? trouves.find((d) => t.attendu.test(d)) : "la règle n'a pas tiré"}`);
    if (!vu) bon = false;
  }

  /* Le témoin POSITIF : un relevé conforme ne doit produire AUCUN défaut. */
  const conforme = [
    { genre: "BANDE", cle: "Nous vous rappelons dans l'heure,", hauteur: 135, carte: { largeur: 1120, hauteur: 95 }, partDuTexte: 815 / 1120 },
    { genre: "COMPLEMENT", cle: "Structures et châssis,", hauteur: 191, carte: { largeur: 1120, hauteur: 143 }, partDuTexte: null },
  ];
  const faux = compare(conforme, conforme, "témoin");
  console.log(`  ${faux.length === 0 ? "ok " : "RATÉ"} témoin « conforme » : ${faux.length} défaut(s) sur un relevé identique`);
  if (faux.length !== 0) bon = false;

  return bon;
}

/* -------------------------------------------------------------------- marche */

if (CONTROLE) {
  console.log("\nCONTRÔLE DE LA PORTE DE DISPOSITION\n");
  const bon = controle();
  console.log(bon ? "\nLa porte sait échouer, et sait aussi passer.\n" : "\nPORTE INUTILISABLE.\n");
  process.exit(bon ? 0 : 1);
}

const navigateur = await chromium.launch();
const defauts = [];
const releves = [];
let refus = null;

try {
  for (const largeur of LARGEURS) {
    const contexte = await navigateur.newContext({ viewport: { width: largeur, height: 900 } });
    try {
      for (const chemin of PAGES) {
        const etiquette = `${chemin} à ${largeur} px`;
        const site = await relevéDuSite(contexte, chemin);
        const maquette = await relevéDeLaMaquette(contexte, chemin);
        releves.push({ etiquette, site, maquette });
        if (maquette.length === 0) {
          refus = `la maquette n'a rendu AUCUN bloc sur ${etiquette} : sans référence, la porte ne conclut pas`;
          break;
        }
        defauts.push(...compare(site, maquette, etiquette));
      }
    } finally {
      await contexte.close();
    }
    if (refus) break;
  }
} finally {
  await navigateur.close();
}

if (JOURNAL) {
  for (const r of releves) {
    console.log(`\n${r.etiquette}`);
    for (let i = 0; i < Math.max(r.site.length, r.maquette.length); i++) {
      const s = r.site[i];
      const m = r.maquette[i];
      const d = (o) =>
        o
          ? `${o.genre} h=${o.hauteur} carte=${o.carte ? `${o.carte.largeur}×${o.carte.hauteur}` : "AUCUNE"}` +
            `${o.partDuTexte === null ? "" : ` texte=${Math.round(o.partDuTexte * 100)}%`}`
          : "absent";
      console.log(`  [${i}] site ${d(s)}`);
      console.log(`      maq  ${d(m)}   « ${(m ?? s)?.cle} »`);
    }
  }
}

if (refus) {
  console.log(`\nLA PORTE REFUSE DE CONCLURE : ${refus}`);
  console.log(`Servir la maquette d'abord : ./scripts/sers-maquette.sh\n`);
  process.exit(2);
}

console.log(
  `\nDISPOSITION, famille offre : ${PAGES.length} page(s) × ${LARGEURS.length} largeur(s), ` +
    `référence ${MAQUETTE}\n`,
);

if (defauts.length === 0) {
  console.log("Aucun écart de disposition contre la maquette.\n");
  process.exit(0);
}

console.log(`${defauts.length} écart(s) de disposition :\n`);
for (const d of defauts) console.log(`  ${d}`);
console.log("");
process.exit(1);
