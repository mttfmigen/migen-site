#!/usr/bin/env node
/**
 * LE SUJET DOMINANT D'UNE PHOTO EST-IL DE L'INDUSTRIE ?
 *
 *   node scripts/verifie-photo-sujet.mjs
 *   node scripts/verifie-photo-sujet.mjs --controle     preuve d'échec
 *
 * POURQUOI ELLE EXISTE. Mehdi, le 12/10, devant /offres/ : « changer les
 * photos c'est que des photos avec des avions, je vois pas le rapport on doit
 * voir du technicien ». Mesure du même jour : sur les 17 photos de contenu de
 * /offres/, 5 étaient de l'aéronautique et 2 de la menuiserie.
 *
 * POURQUOI AUCUNE PORTE EXISTANTE NE L'AVAIT VU. Ces sept photos portent
 * TOUTES le thème « technicien » au registre, et c'est juste : un mécanicien
 * penché sur un moteur d'avion EST un technicien. L'étiquette ne discrimine
 * pas. Ce n'est pas non plus une pénurie : 291 des 385 photos du registre
 * portent « technicien », contre 20 pour « aeronautique ».
 *
 * UNE PREMIÈRE RÈGLE A ÉTÉ ESSAYÉE ET ELLE ÉTAIT FAUSSE. « Toute photo portant
 * un thème de secteur est hors sujet » sortait 1039 manquements, en accusant
 * par exemple un technicien devant un poste électrique parce que la photo
 * porte le thème « energie ». Un poste électrique se lit encore comme de
 * l'industrie. Un avion non.
 *
 * CE QU'ELLE MESURE. Aucune page commerciale ne sert une photo dont le SUJET
 * DOMINANT, ce qu'un visiteur voit en une seconde, n'est pas de l'industrie.
 * La liste des photos concernées est écrite en dur plus bas, avec le sujet de
 * chacune : elle a été établie en ouvrant les images une par une, par sept
 * classeurs, puis confirmée par trois sceptiques. Elle ne se déduit d'aucune
 * étiquette, et c'est tout l'intérêt.
 *
 * L'EXCEPTION, explicite. Une page /secteurs/<marché>/ parle d'un MARCHÉ et a
 * le droit de montrer ce marché : l'avion est chez lui sur
 * /secteurs/aeronautique/, le bois sur /secteurs/menuiserie-industrielle/, la
 * salle blanche sur /secteurs/pharmaceutique/. Les pages commerciales, elles,
 * vendent un SERVICE, le déploiement de techniciens de maintenance, et pas un
 * marché.
 *
 * CE QU'ELLE NE MESURE PAS, et il faut le dire : elle ne juge que les 44
 * photos de la liste. Une 45e photo hors sujet passerait. La liste s'allonge à
 * la main, après avoir ouvert l'image, jamais par déduction d'un thème.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const CONTROLE = process.argv.includes("--controle");
const FICHES = "supabase/import/gabarits-maquette";
const REGISTRE = "public/assets/photos/registre.json";
const DOSSIER_PHOTOS = "public/assets/photos";

/**
 * LES PHOTOS DONT LE SUJET DOMINANT N'EST PAS DE L'INDUSTRIE.
 *
 * `litComme` est ce que le visiteur conclut en une seconde, et c'est la seule
 * chose qui compte ici. `sujet` est ce qu'on voit à l'image, vérifié en
 * l'ouvrant. Le commentaire dit pourquoi, pour qu'un relecteur puisse
 * contester une ligne sans avoir à refaire tout le travail.
 */
const HORS_INDUSTRIE = [
  /* ---- L'AVIATION. Le défaut nommé par Mehdi : « que des photos avec des avions ». ---- */
  // Verrière, tableau de bord, fuselage blanc, hangar clair. Le sujet est l'avion, pas l'intervention.
  { fichier: "aero-cockpit-inspection-hangar.jpg", sujet: "Homme inspectant le cockpit d'un avion", litComme: "aviation" },
  // Deux fuselages, deux réacteurs, échafaudages de piste, charpente de hangar. Aucun humain.
  { fichier: "env-avion-en-maintenance.jpg", sujet: "Deux avions de ligne ouverts en hangar", litComme: "aviation" },
  // Alignement de fuselages, ailes sur tréteaux oranges, verrière d'atelier. Aucun humain.
  { fichier: "env-usine-aeronautique-22-sept-2026.jpg", sujet: "Halle d'assemblage de fuselages d'avions", litComme: "aviation" },
  // Le panneau riveté d'aluminium occupe les trois quarts du cadre : une carlingue.
  { fichier: "aero-fuselage-serrage-lampe.jpg", sujet: "Serrage sur un fuselage d'avion riveté", litComme: "aviation" },
  // Fuselage, hublots, réacteur et train d'atterrissage remplissent le cadre. Photo nommée par le client.
  { fichier: "env-entretien-avion-22-sept-2026.jpg", sujet: "Deux mécaniciens sous un avion en hangar", litComme: "aviation" },
  // Fuselage blanc et rouge, hublots, nacelle de réacteur ouverte sur toute l'image.
  { fichier: "env-reparation-moteur-aeronautique.jpg", sujet: "Deux mécaniciens devant un réacteur capot ouvert", litComme: "aviation" },
  // Capot de nacelle poli en bas du cadre, pale d'hélice floue derrière. L'avion se voit avant le technicien.
  { fichier: "aero-nacelle-moteur-technicien.jpg", sujet: "Technicien au marteau sur une nacelle d'avion", litComme: "aviation" },
  // Réacteur ouvert au premier plan, fuselage d'avion de ligne en hangar. Photo nommée par le client.
  { fichier: "env-mecanicien-aeronautique.jpg", sujet: "Mécanicien sous le fuselage d'un avion de ligne", litComme: "aviation" },
  // Vue large de hangar : un avion complet, deux mécaniciens de part et d'autre d'un réacteur.
  { fichier: "env-reparation-moteur-avion.jpg", sujet: "Réacteur ouvert et fuselage dans un hangar", litComme: "aviation" },
  // Fuselage, hublots et extrados d'avion de ligne sur tout le cadre.
  { fichier: "aero-percage-aile-avion.jpg", sujet: "Technicien perçant une aile d'avion", litComme: "aviation" },
  // Soufflante, nacelle et étiquette LEAP-1A au premier plan. Rien d'autre à lire.
  { fichier: "env-moteur-d-avion-en-maintenance.jpg", sujet: "Réacteur d'avion LEAP sur son berceau", litComme: "aviation" },
  // Intrados d'aile, hublots, hangar de maintenance avion. Photo nommée par le client.
  { fichier: "env-professionnels-maintenance-aeronautique.jpg", sujet: "Mécaniciens sous la voilure d'un avion de ligne", litComme: "aviation" },
  // Nez de l'appareil, train d'atterrissage, soufflante du réacteur déposé.
  { fichier: "env-reparation-moteur-jet-hangar.jpg", sujet: "Réacteur déposé et avion de ligne en hangar", litComme: "aviation" },
  // Capot de nacelle ouvert, aube de soufflante et hangar sur plus de la moitié du cadre.
  { fichier: "aero-reacteur-capot-combinaison.jpg", sujet: "Technicien devant un réacteur d'avion ouvert", litComme: "aviation" },
  // Fuselage, voilure, train d'atterrissage et soufflante plein cadre. Le défaut exact signalé.
  { fichier: "env-photos-industrie-aeronautique.jpg", sujet: "Mécaniciens sur un avion, réacteur au premier plan", litComme: "aviation" },
  // Nacelle ouverte, accessoires de réacteur, hangar en arrière plan.
  { fichier: "env-technician-maintenance-jet-engine.jpg", sujet: "Mécanicien sur un réacteur d'avion capot ouvert", litComme: "aviation" },

  /* ---- LE BOIS. Le second défaut nommé par Mehdi, sur la même page. ---- */
  // Atelier de bois, toupie ancienne, sciure au sol, planches empilées, tablier de menuisier.
  { fichier: "env-menuisier-avec-masque-sept-2026.jpg", sujet: "Menuisier façonnant une pièce de bois", litComme: "bois" },
  // Deux hommes manipulent des planches de sapin devant des piles de bois scié. Le bois tient tout le cadre.
  { fichier: "env-photos-menuiserie-2.jpg", sujet: "Deux hommes triant des planches de bois", litComme: "bois" },
  // Serre-joints, tasseaux, planches empilées, menuisier en tablier au fond. Tout est en bois clair.
  { fichier: "env-menuisier-dans-l-atelier.jpg", sujet: "Serre-joints et bois sur un établi de menuisier", litComme: "bois" },
  // Scie à onglet au premier plan, halle de planches et de sciure, plusieurs ouvriers du bois.
  { fichier: "env-photos-industrie-menuiserie-2.jpg", sujet: "Atelier de menuiserie, scie à onglet et planches", litComme: "bois" },
  // Homme casqué bridant un tasseau sous une scie circulaire, sciure partout, collègue portant des planches.
  { fichier: "env-photos-menuiserie.jpg", sujet: "Menuisier bridant une planche à la scie", litComme: "bois" },
  // Scie à onglet, copeaux en suspension, montants d'ossature bois, ciel gris. Chantier de charpente.
  { fichier: "env-menuisier-utilisant-des-outils.jpg", sujet: "Charpentier sciant une planche en extérieur", litComme: "bois" },
  // Paquet de lattes en main, table de machine à bois, gaines d'aspiration de copeaux.
  { fichier: "env-homme-inspectant-le-bois.jpg", sujet: "Opérateur manipulant des lattes de bois", litComme: "bois" },
  // Le bois tient le sol du premier plan jusqu'au fond : piles de madriers et palonnier. Une scierie.
  { fichier: "env-photos-industrie-menuiserie.jpg", sujet: "Hall de stockage de madriers et bastaings", litComme: "bois" },
  // Planche, copeaux, dégauchisseuse verte, modules de construction emballés derrière.
  { fichier: "env-menuiserie-24-sept-2026.jpg", sujet: "Menuisier sur dégauchisseuse, modules de bâtiment", litComme: "bois" },
  // Piles de tasseaux, panneaux de contreplaqué, machine à bois sous aspiration.
  { fichier: "env-professionnels-sur-machine-a-bois.jpg", sujet: "Deux opératrices sur machine à bois", litComme: "bois" },
  // Panneau de contreplaqué en main, scie à panneaux, aspiration à copeaux.
  { fichier: "menuiserie-scie-panneaux-epi.jpg", sujet: "Opérateur sur une scie à panneaux de bois", litComme: "bois" },
  // Atelier bois complet : scie radiale, tasseaux, chutes au sol, meubles en fond.
  { fichier: "env-deux-hommes-au-travail-en-menuiserie.jpg", sujet: "Deux menuisiers devant une scie à bois", litComme: "bois" },
  // Les planches tiennent la moitié basse du cadre, le fond est empilé de bois. Filière bois.
  { fichier: "env-inspection-de-bois-24-sept-2026.jpg", sujet: "Planches de bois dans une halle de sciage", litComme: "bois" },
  // Opérateur sciant du bois, tasseaux empilés à droite, poussière de bois sur l'établi.
  { fichier: "env-menuiserie-circular-saw.jpg", sujet: "Sciage d'une planche à la scie circulaire", litComme: "bois" },
  // Scie égoïne, planches, établi bois, un collègue au rabot.
  { fichier: "env-deux-hommes-menuiserie.jpg", sujet: "Menuisier sciant une planche à l'établi", litComme: "bois" },
  // Madrier de sapin, visseuse, atelier bois. Menuiserie ou charpente.
  { fichier: "env-menuiserie-industrie.jpg", sujet: "Charpentier perçant un madrier à la visseuse", litComme: "bois" },
  // Sciure au sol, piles de planches et de palettes, charpente bois. La machine est industrielle, la scène est une scierie.
  { fichier: "env-scie-a-ruban-industrielle.jpg", sujet: "Scie à ruban dans une scierie", litComme: "bois" },

  /* ---- LE LABORATOIRE ET LA SALLE BLANCHE. Un autre métier, pas un site à maintenir. ---- */
  // Pièce blanche, sol résine, blouse turquoise, charlotte, masque, gants bleus, machine inox à comprimés.
  { fichier: "pharma-technicienne-machine-comprimes.jpg", sujet: "Opératrice stérile sur une machine à comprimés", litComme: "laboratoire" },
  // Blouses blanches, charlottes, gants, ballon en verre, presse-papiers. Un laboratoire d'analyse.
  { fichier: "env-photos-industrie-pharmaceutique.jpg", sujet: "Laborantins et verrerie d'évaporateur rotatif", litComme: "laboratoire" },
  // Combinaison bleue intégrale, masque, parois vitrées, éclairage bleuté. Salle blanche.
  { fichier: "env-techniciens-semiconducteurs.jpg", sujet: "Opérateur en combinaison de salle blanche", litComme: "laboratoire" },
  // Combinaison à cagoule, gants d'isolateur pendus en file. Le pupitre à arrêt d'urgence ne renverse pas la lecture.
  { fichier: "pharma-isolateur-salle-propre.jpg", sujet: "Opérateur devant un isolateur à gants", litComme: "laboratoire" },

  /* ---- LE GARAGE ET LES RÉSEAUX. Un autre métier, moins criant que l'avion mais hors sujet. ---- */
  // Pneu tout-terrain et châssis levé en haut du cadre, bras de pont élévateur, clé à chocs. Un garage.
  { fichier: "il-technicien-maintenance-jan-9-2026-1-1600.jpg", sujet: "Mécanicien auto sous un 4x4 sur pont élévateur", litComme: "autre" },
  // Capot ouvert au premier plan, colonne de pont élévateur jaune et noir, mur carrelé d'atelier auto.
  { fichier: "il-technicien-maintenance-photo-4-1600.jpg", sujet: "Mécanicienne sur un moteur de voiture", litComme: "autre" },
  // Capot ouvert, pièces détachées suspendues partout, homme en débardeur. Un garage de quartier.
  { fichier: "env-inspection-auto-avec-equipe.jpg", sujet: "Échange sous le capot dans un garage auto", litComme: "autre" },
  // Cadre rempli de jarretières optiques jaunes et de baies de brassage. Réseaux ou salle serveur.
  { fichier: "il-technicien-maintenance-photo-1-1600.jpg", sujet: "Technicienne sur des baies de brassage fibre", litComme: "autre" },
  // Baie informatique, switchs, jarretières optiques. Technicien réseau, pas maintenance industrielle.
  { fichier: "env-technician-inspecting-fiber-optics.jpg", sujet: "Baie de brassage réseau et jarretières", litComme: "autre" },
  // Cabine de poids lourd basculée, radiateur et durites, scène de garage en extérieur.
  { fichier: "il-technicien-maintenance-camion-1600.jpg", sujet: "Mécanicien sous la cabine basculée d'un camion", litComme: "autre" },

  /* ---- LE PORTRAIT DE BUREAU. Aucun technicien, aucun geste, aucun équipement net. ---- */
  // Portrait corporate en veste de tailleur, index levé ; le robot n'est qu'une tache blanche floue derrière.
  { fichier: "il-femme-en-tenue-professionnelle-pres-d-un-bras-.jpg", sujet: "Femme en tailleur posant près d'un robot flou", litComme: "bureau" },
];

const INTERDITES = new Map(HORS_INDUSTRIE.map((p) => [p.fichier, p]));

/* Une photo nommée ici qui n'existe pas sur le disque rendrait la porte
   bavarde pour rien, et un nom mal recopié la rendrait muette : les deux
   fautes sont silencieuses, donc contrôlées avant toute mesure. */
const fantomes = HORS_INDUSTRIE.filter((p) => !existsSync(join(DOSSIER_PHOTOS, p.fichier)));
if (fantomes.length) {
  console.error(`porte non concluante : ${fantomes.length} photo(s) de la liste absente(s) de ${DOSSIER_PHOTOS}/`);
  fantomes.forEach((p) => console.error(`  ${p.fichier}`));
  process.exit(2);
}

const brut = JSON.parse(readFileSync(REGISTRE, "utf8"));
const registre = Array.isArray(brut) ? brut : (brut.photos ?? []);
const auRegistre = new Set(registre.map((p) => p.fichier));
const horsRegistre = HORS_INDUSTRIE.filter((p) => !auRegistre.has(p.fichier));
if (horsRegistre.length) {
  console.error(`porte non concluante : ${horsRegistre.length} photo(s) de la liste absente(s) du registre`);
  horsRegistre.forEach((p) => console.error(`  ${p.fichier}`));
  process.exit(2);
}

/** Les familles d'adresses qui vendent un SERVICE, et non un marché. */
const PREFIXES_COMMERCIAUX = [
  "/offres/",
  "/travaux-industriels/",
  "/bureau-etudes/",
  "/expertises/",
  "/preuves/",
  "/ressources/",
];

/**
 * CE QU'UNE PAGE DE MARCHÉ A LE DROIT DE MONTRER : son marché, et lui seul.
 * La clé est le segment d'URL sous /secteurs/, la valeur la lecture que la
 * page assume. Les sept autres marchés (agro, auto, chimie, industrie lourde,
 * industrie métallique, logistique, nucléaire) n'ont aucune photo dans la
 * liste ci-dessus : rien à leur accorder.
 */
const LECTURE_DU_MARCHE = {
  aeronautique: "aviation",
  "menuiserie-industrielle": "bois",
  pharmaceutique: "laboratoire",
};

const segments = (url) => url.split("/").filter(Boolean);

/** Le marché d'une page /secteurs/<marché>/, sinon rien. */
function marcheDeLaPage(url) {
  const s = segments(url);
  return s[0] === "secteurs" && s.length >= 2 ? s[1] : null;
}

/**
 * Une page commerciale : elle vend le service, le déploiement de techniciens.
 *
 * La famille /secteurs/ en est exclue d'abord, hub compris : elle parle de
 * marchés. « La racine » est prise au sens de Mehdi : l'accueil, et les pages
 * d'un seul segment comme /entreprise-maintenance-industrielle/ ou /rse/.
 * Ce qui reste hors contrôle : /secteurs/**, /carriere/**, /implantations/<ville>/,
 * /guides/**, /a-propos/equipe/.
 */
function estCommerciale(url) {
  if (segments(url)[0] === "secteurs") return false;
  if (url === "/") return true;
  if (PREFIXES_COMMERCIAUX.some((p) => url.startsWith(p))) return true;
  return segments(url).length === 1;
}

/** Une page à contrôler : son adresse, ce qu'elle est, et d'où on la lit. */
function page(url, photos, source) {
  return { url, photos, source, commerciale: estCommerciale(url), marche: marcheDeLaPage(url) };
}

/**
 * LE JUGEMENT, en un seul endroit, pour que le témoin passe par lui.
 *
 * L'exception de marché est examinée AVANT le périmètre : une photo d'avion
 * sur /secteurs/aeronautique/ doit être acceptée PARCE QUE c'est son marché,
 * et non parce qu'elle serait tombée hors du périmètre par accident.
 */
function jugement(p, fichier) {
  const photo = INTERDITES.get(fichier);
  if (!photo) return { etat: "dans-le-sujet" };
  if (p.marche && LECTURE_DU_MARCHE[p.marche] === photo.litComme) {
    return { etat: "exception-marche", photo, marche: p.marche };
  }
  if (!p.commerciale) return { etat: "hors-controle", photo };
  return { etat: "manquement", photo };
}

/** Tous les manquements d'un jeu de pages, dans l'ordre de lecture. */
function manquements(pages) {
  const sortie = [];
  for (const p of pages) {
    for (const fichier of p.photos) {
      const j = jugement(p, fichier);
      if (j.etat === "manquement") sortie.push({ url: p.url, fichier, photo: j.photo, source: p.source });
    }
  }
  return sortie;
}

/** Les photos du registre citées par un texte, les deux formes d'adresse. */
function photosCitees(texte) {
  const trouvees = [...texte.matchAll(/assets(?:\/|%2F)photos(?:\/|%2F)([A-Za-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi)];
  return [...new Set(trouvees.map((m) => m[1]))].filter((f) => auRegistre.has(f));
}

/* ------------------------------------------------------------------ */
/* PREMIÈRE SOURCE : les fiches de la maquette, une par page du cocon */
/* ------------------------------------------------------------------ */

function pagesDesFiches() {
  return readdirSync(FICHES)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ f, o: JSON.parse(readFileSync(join(FICHES, f), "utf8")) }))
    .filter(({ o }) => typeof o.url === "string")
    .map(({ f, o }) => page(o.url, photosCitees(JSON.stringify(o)), `la fiche ${f}`));
}

/* ------------------------------------------------------------------------- */
/* SECONDE SOURCE : les photos écrites en dur dans un composant React        */
/* ------------------------------------------------------------------------- */

/** Les fichiers source d'un dossier, en profondeur, portes de vérification exclues. */
function fichiersSources(dossier) {
  const sortie = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) sortie.push(...fichiersSources(chemin));
    else if (/\.tsx?$/.test(nom) && !basename(nom).startsWith("verification-")) sortie.push(chemin);
  }
  return sortie;
}

/** Les fichiers qu'un fichier importe, résolus sur le disque. */
function importes(chemin) {
  const src = readFileSync(chemin, "utf8");
  const cibles = [];
  for (const m of src.matchAll(/from\s+"(@\/[^"]+|\.{1,2}\/[^"]+)"/g)) {
    const brute = m[1].startsWith("@/") ? m[1].slice(2) : join(dirname(chemin), m[1]);
    for (const suffixe of [".tsx", ".ts", "/index.tsx", "/index.ts", ""]) {
      const essai = `${brute}${suffixe}`;
      if (existsSync(essai) && statSync(essai).isFile()) {
        cibles.push(essai);
        break;
      }
    }
  }
  return cibles;
}

/** L'adresse servie par une route de l'App Router, ou COCON pour l'attrape-tout. */
const COCON = Symbol("cocon");
function urlDeLaRoute(chemin) {
  const segs = chemin
    .split("/")
    .slice(1, -1)
    .filter((s) => !s.startsWith("("));
  if (segs.some((s) => s.startsWith("["))) return COCON;
  return segs.length ? `/${segs.join("/")}/` : "/";
}

/**
 * Les pages servies par les composants qui écrivent une photo en dur.
 *
 * On remonte des routes de `app/` vers les composants, de proche en proche :
 * un composant est servi par toute page dont la route l'atteint. Les `layout`
 * sont des racines comme les `page`, puisqu'ils s'affichent partout.
 *
 * L'ATTRAPE-TOUT `app/[...slug]/` sert les 246 pages du cocon, dont /offres/
 * et /expertises/ : un composant qu'il atteint est donc servi sur des pages
 * commerciales. Exception, et c'est la même que pour les adresses : les
 * gabarits de marché `components/site/secteur/` et `components/site/secteurs-hub/`
 * ne s'affichent que sous /secteurs/, la route les réservant au contenu que
 * `estSecteur()` reconnaît.
 */
const GABARITS_DE_MARCHE = ["components/site/secteur/", "components/site/secteurs-hub/"];

function pagesDesComposants() {
  const racines = fichiersSources("app").filter((f) => /\/(page|layout)\.tsx$/.test(f));
  const atteints = new Map(); // composant -> Set d'adresses (ou COCON)
  for (const racine of racines) {
    const url = urlDeLaRoute(racine);
    const vus = new Set([racine]);
    const pile = [racine];
    while (pile.length) {
      for (const suivant of importes(pile.pop())) {
        if (vus.has(suivant) || !suivant.startsWith("components/")) continue;
        vus.add(suivant);
        pile.push(suivant);
        if (!atteints.has(suivant)) atteints.set(suivant, new Set());
        atteints.get(suivant).add(url);
      }
    }
  }

  const sortie = [];
  for (const [composant, urls] of atteints) {
    const photos = photosCitees(readFileSync(composant, "utf8"));
    if (!photos.length) continue;
    const source = `écrit en dur dans ${composant}`;
    const deMarche = GABARITS_DE_MARCHE.some((d) => composant.startsWith(d));
    for (const url of urls) {
      if (url !== COCON) sortie.push(page(url, photos, source));
      else if (!deMarche) sortie.push({ ...page("/offres/", photos, source), url: "toutes les pages du cocon" });
      else sortie.push({ ...page("/secteurs/", photos, source), url: "les pages de marché du cocon" });
    }
  }
  return sortie;
}

/* ------------------------------------------------------- */
/* LE TÉMOIN : la porte sait-elle encore crier, et se taire ? */
/* ------------------------------------------------------- */

if (CONTROLE) {
  /* Copie en mémoire : aucun fichier du dépôt n'est touché, cinq autres
     agents travaillent dessus en même temps. */
  const copie = [...pagesDesFiches(), ...pagesDesComposants()].map((p) => ({ ...p, photos: [...p.photos] }));
  const trouver = (url) => copie.find((p) => p.url === url);

  /** Injecte une photo dans la copie d'une page RÉELLE, et refuse de tricher. */
  function injecte(url, fichier) {
    const p = trouver(url);
    if (!p) {
      console.error(`témoin non concluant : aucune page ${url} dans les données lues`);
      process.exit(2);
    }
    if (p.photos.includes(fichier)) {
      console.error(`témoin non concluant : ${url} sert déjà ${fichier}, l'injection ne prouverait rien`);
      process.exit(2);
    }
    p.photos.push(fichier);
    return p;
  }

  const FAUTES = [
    ["avion sur une page d'offre", injecte("/offres/", "aero-cockpit-inspection-hangar.jpg")],
    ["bois sur une page d'expertise", injecte("/expertises/mecanique/", "env-menuiserie-industrie.jpg")],
    ["avion en dur dans un composant", injecte("/rse/", "env-avion-en-maintenance.jpg")],
    [
      "salle blanche sur la racine",
      injecte("/entreprise-maintenance-industrielle/", "pharma-isolateur-salle-propre.jpg"),
    ],
  ];
  const EXCEPTIONS = [
    ["avion sur son marché", injecte("/secteurs/aeronautique/", "env-entretien-avion-22-sept-2026.jpg")],
    ["bois sur son marché", injecte("/secteurs/menuiserie-industrielle/", "env-menuiserie-industrie.jpg")],
  ];

  const releves = manquements(copie);
  const injectee = (p) => p.photos[p.photos.length - 1];
  const estRelevee = (p) => releves.some((d) => d.url === p.url && d.fichier === injectee(p));

  let detectees = 0;
  for (const [nom, p] of FAUTES) {
    const vu = estRelevee(p);
    console.log(`  ${vu ? "OK  " : "RATÉ"}  ${nom.padEnd(34)} ${p.url} ${injectee(p)} ${vu ? "refusée" : "ACCEPTÉE"}`);
    if (vu) detectees++;
  }

  let respectees = 0;
  for (const [nom, p] of EXCEPTIONS) {
    const j = jugement(p, injectee(p));
    const ok = !estRelevee(p) && j.etat === "exception-marche";
    console.log(`  ${ok ? "OK  " : "RATÉ"}  ${nom.padEnd(34)} ${p.url} ${injectee(p)} ${j.etat}`);
    if (ok) respectees++;
  }

  const total = FAUTES.length + EXCEPTIONS.length;
  const bons = detectees + respectees;
  console.log(
    `\ntémoin : ${detectees}/${FAUTES.length} fautes détectées, ` +
      `${respectees}/${EXCEPTIONS.length} exceptions respectées` +
      (bons === total ? "" : `  CONTRÔLE ÉCHOUÉ`),
  );
  process.exit(bons === total ? 0 : 1);
}

/* ------------------- */
/* LA MESURE, en clair */
/* ------------------- */

const desFiches = pagesDesFiches();
const desComposants = pagesDesComposants();
const pages = [...desFiches, ...desComposants];
const adresses = new Set(pages.map((p) => p.url));
const sousControle = pages.filter((p) => p.commerciale);
const adressesControlees = new Set(sousControle.map((p) => p.url));
const releves = manquements(pages);

const lues =
  `${adresses.size} page(s) lue(s) : ${desFiches.length} fiche(s) de la maquette, ` +
  `${desComposants.length} page(s) servie(s) par un composant à photo en dur ; ` +
  `${adressesControlees.size} adresse(s) commerciale(s) sous contrôle`;

if (releves.length) {
  console.error(`${lues}\n`);
  console.error(`${releves.length} photo(s) hors de l'industrie sur une page commerciale :\n`);
  for (const d of releves.slice(0, 25)) {
    console.error(`  ${d.url}`);
    console.error(`      ${d.fichier}  se lit comme : ${d.photo.litComme}`);
    console.error(`      ${d.photo.sujet}, d'après ${d.source}`);
  }
  if (releves.length > 25) console.error(`  ... et ${releves.length - 25} autre(s)`);
  process.exit(1);
}

console.log(`PHOTOS_DU_SUJET_INDUSTRIEL  ${lues} ; aucun manquement`);
