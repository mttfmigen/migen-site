/**
 * Porte : aucune adresse de l'ancien migen.fr ne se perd sur le nouveau site.
 *
 *   node scripts/verifie-redirections.mjs                         # https://migen-site.vercel.app
 *   node scripts/verifie-redirections.mjs http://localhost:4410
 *   node scripts/verifie-redirections.mjs https://migen.fr        # juste après la bascule DNS
 *   node scripts/verifie-redirections.mjs --controle              # prouve qu'elle sait échouer
 *
 * LA LISTE : `docs/redirections/anciennes-adresses.json`, l'inventaire de
 * l'ancien site mesuré le 14/10/2026 (Yoast, Semrush, archives, dépôt), avec
 * les variantes relevées de chaque adresse.
 *
 * LA RÈGLE, adresse par adresse, sans suivre les redirections du navigateur :
 *   · adresse de contenu : 200 au même chemin, ou UNE 301 vers une page qui
 *     répond 200. Une chaîne, une boucle, une 404, une 302, 307 ou 308, une
 *     cible hors du site ou en erreur sont des pertes ;
 *   · adresse technique (flux, auteur, pagination, thème, `?p=`) : UNE 301 vers
 *     une page en 200, l'accueil ou le parent évident. Une 404 ou un 200 sur
 *     place (l'accueil servi sous `/?page_id=8`) sont des pertes. RÈGLE DE
 *     MEHDI, 14/10 : « toute URL de l'ancien site doit renvoyer vers une
 *     page » ;
 *   · un exemple de chaque motif du filet (`lib/filet-ancien-site.ts`) : UNE
 *     301 vers une page en 200 ;
 *   · les témoins : une adresse qui n'a jamais existé et ne ressemble pas à
 *     WordPress garde sa 404, les fichiers du site (plan, robots, icône, image,
 *     script de Next) et l'API répondent sans redirection ;
 *   · puis chaque adresse du plan du site : 200, sans redirection. C'est ce qui
 *     voit une redirection qui masquerait une page republiée (`/cgv/`), ou un
 *     filet trop large.
 *
 * Dernière ligne : `REDIRECTIONS_SANS_PERTE` si tout passe, sinon le compte des
 * pertes et un code de sortie 1.
 */
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const LISTE = join(RACINE, "docs/redirections/anciennes-adresses.json");
const BASE_PAR_DEFAUT = "https://migen-site.vercel.app";
/** Requêtes simultanées : au-delà, Vercel coupe des connexions (mesuré le 08/10). */
const LOT = 8;
/** Assez pour distinguer une chaîne d'une boucle, sans suivre sans fin. */
const SAUTS_MAX = 5;

async function reponse(url) {
  const r = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
  });
  await r.body?.cancel();
  return { url, code: r.status, location: r.headers.get("location") };
}

/** Les sauts d'une adresse jusqu'à une réponse qui n'est pas une redirection. */
async function parcours(url) {
  const sauts = [];
  const vues = new Set([url]);
  let courante = url;
  for (let i = 0; i < SAUTS_MAX; i++) {
    const saut = await reponse(courante);
    sauts.push(saut);
    const redirige = saut.code >= 300 && saut.code < 400 && saut.location;
    if (!redirige) return { sauts, boucle: false };
    courante = new URL(saut.location, courante).href;
    if (vues.has(courante)) return { sauts, boucle: true };
    vues.add(courante);
  }
  return { sauts, boucle: false };
}

const estRedirection = (code) => code >= 300 && code < 400;

/** null si l'adresse de contenu est conservée ou redirigée sans perte. */
function perteContenu({ sauts, boucle }, origine) {
  const [premier, second] = sauts;
  if (premier.code === 200) return null;
  if (boucle) return `boucle : ${sauts.map((s) => s.code).join(" > ")}`;
  if (!estRedirection(premier.code)) return `${premier.code} sur une adresse de contenu`;
  if (premier.code !== 301) return `${premier.code} au lieu d'une 301`;
  if (!premier.location) return "301 sans en-tête Location";
  const cible = new URL(premier.location, premier.url);
  if (cible.origin !== origine) return `301 hors du site, vers ${cible.href}`;
  if (estRedirection(second.code)) {
    return `chaîne : 301 vers ${cible.pathname}, puis ${second.code} vers ${second.location}`;
  }
  if (second.code !== 200) return `cible ${cible.pathname} en ${second.code}`;
  return null;
}

/** null si l'adresse technique part en UNE 301 vers une page en 200. */
function perteTechnique(p, origine) {
  if (p.sauts[0].code === 200) return "200 sur place, une 301 vers une page attendue";
  return perteContenu(p, origine);
}

/** Un exemple par motif du filet de l'ancien WordPress. */
const FILET = [
  "/wp-content/uploads/2023/02/logo2r-300x68.png",
  "/wp-includes/js/jquery/jquery.min.js",
  "/wp-admin/",
  "/wp-login.php",
  "/wp-json/wp/v2/pages",
  "/xmlrpc.php",
  "/feed/",
  "/maintenance-industrielle-lyon/feed/",
  "/comments/feed/",
  "/author/inconnu/",
  "/category/inconnue/",
  "/tag/maintenance/",
  "/page/2/",
  "/category/articles/page/9/",
  "/blocks/inconnu/",
  "/element_category/inconnue/",
  "/fusion_tb_category/inconnue/",
  "/portfolio-items/inconnu/",
  "/faq-items/inconnu/",
  "/featured_item/inconnu/",
  "/shop/",
  "/product-category/inconnue/",
  "/product/inconnu/",
  "/cart/",
  "/checkout/",
  "/my-account/",
  "/2023/02/un-billet/",
  "/?p=12",
  "/?page_id=999",
  "/?cat=3",
  "/?s=robot",
  "/lost-password/?page_id=11",
];

/** Témoins : [chemin, code attendu sans redirection]. */
const TEMOINS = [
  ["/offres/nexistepas/", 404],
  ["/sitemap.xml", 200],
  ["/robots.txt", 200],
  ["/favicon.ico", 200],
  ["/assets/client-danone.png", 200],
];

async function enLots(elements, travail) {
  const resultats = [];
  for (let i = 0; i < elements.length; i += LOT) {
    resultats.push(...(await Promise.all(elements.slice(i, i + LOT).map(travail))));
  }
  return resultats;
}

async function cheminsDuPlan(base) {
  const r = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(30_000) });
  if (r.status !== 200) throw new Error(`plan du site en ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

/** Le contrôle complet d'une base. Rend les pertes et les comptes. */
async function porte(base, adresses, { filet = false } = {}) {
  const origine = new URL(base).origin;
  const pertes = [];
  const comptes = { conservees: 0, redirigees: 0, techniques: 0, formes: 0, plan: 0, filet: 0, temoins: 0 };

  const formes = adresses.flatMap((a) =>
    [...new Set([a.chemin, ...(a.variantes ?? [])])].map((forme) => ({ ...a, forme })),
  );
  comptes.formes = formes.length;

  await enLots(formes, async (a) => {
    try {
      const p = await parcours(base + a.forme);
      const technique = a.classe === "technique";
      const perte = technique ? perteTechnique(p, origine) : perteContenu(p, origine);
      if (perte) return pertes.push({ chemin: a.forme, perte });
      if (technique) comptes.techniques++;
      else if (p.sauts[0].code === 200) comptes.conservees++;
      else comptes.redirigees++;
    } catch (e) {
      pertes.push({ chemin: a.forme, perte: e.name === "TimeoutError" ? "délai dépassé" : e.message });
    }
  });

  if (filet) await porteFilet(base, origine, pertes, comptes);

  try {
    const plan = await cheminsDuPlan(base);
    if (plan.length === 0) pertes.push({ chemin: "/sitemap.xml", perte: "plan du site vide" });
    await enLots(plan, async (chemin) => {
      try {
        const { code, location } = await reponse(base + chemin);
        if (code === 200) return comptes.plan++;
        const vers = location ? ` vers ${location}` : "";
        pertes.push({ chemin, perte: `adresse du plan du site en ${code}${vers}` });
      } catch (e) {
        pertes.push({ chemin, perte: `adresse du plan du site : ${e.message}` });
      }
    });
  } catch (e) {
    pertes.push({ chemin: "/sitemap.xml", perte: e.message });
  }

  return { pertes, comptes };
}

/** Le filet attrape chaque motif, et ne touche ni l'API ni les fichiers du site. */
async function porteFilet(base, origine, pertes, comptes) {
  await enLots(FILET, async (chemin) => {
    try {
      const perte = perteTechnique(await parcours(base + chemin), origine);
      if (perte) return pertes.push({ chemin, perte: `filet : ${perte}` });
      comptes.filet++;
    } catch (e) {
      pertes.push({ chemin, perte: `filet : ${e.message}` });
    }
  });

  // Un script de Next, lu dans l'accueil, et une route d'API : jamais redirigés.
  const accueil = await fetch(base + "/", { signal: AbortSignal.timeout(30_000) }).then((r) => r.text());
  const script = accueil.match(/\/_next\/static\/[^"']+\.js/)?.[0];
  if (!script) pertes.push({ chemin: "/_next/static/", perte: "aucun script de Next dans l'accueil" });
  const temoins = [...TEMOINS, ...(script ? [[script, 200]] : [])];
  await enLots(temoins, async ([chemin, attendu]) => {
    try {
      const { code, location } = await reponse(base + chemin);
      if (code === attendu) return comptes.temoins++;
      const vers = location ? ` vers ${location}` : "";
      pertes.push({ chemin, perte: `témoin en ${code}${vers}, ${attendu} attendu` });
    } catch (e) {
      pertes.push({ chemin, perte: `témoin : ${e.message}` });
    }
  });
  try {
    const { code, location } = await reponse(base + "/api/lead");
    if (estRedirection(code)) pertes.push({ chemin: "/api/lead", perte: `API redirigée vers ${location}` });
    else comptes.temoins++;
  } catch (e) {
    pertes.push({ chemin: "/api/lead", perte: `témoin : ${e.message}` });
  }
}

function imprime(base, adresses, { pertes, comptes }) {
  for (const { chemin, perte } of pertes.sort((a, b) => a.chemin.localeCompare(b.chemin))) {
    console.log(`  PERTE  ${chemin}  ${perte}`);
  }
  console.log(
    `${base} : ${adresses.length} adresses de l'ancien site (${comptes.formes} formes), ` +
      `${comptes.conservees} conservées, ${comptes.redirigees} redirigées en une 301, ` +
      `${comptes.techniques} techniques redirigées en une 301 ; filet : ${comptes.filet}/${FILET.length} motifs en une 301, ` +
      `${comptes.temoins} témoins intacts ; ${comptes.plan} adresses du plan du site en 200.`,
  );
  if (pertes.length > 0) {
    console.log(`ECHEC : ${pertes.length} perte(s).`);
    process.exitCode = 1;
    return;
  }
  console.log("REDIRECTIONS_SANS_PERTE");
}

/**
 * La preuve que la porte sait échouer : un faux site local, où sont fabriquées
 * une chaîne, une boucle, une 404, une cible en 404, une adresse technique en
 * 404 (le témoin de la règle du 14/10), une adresse technique servie sur place
 * et une adresse du plan masquée par une redirection. La porte doit voir ces
 * sept pertes, et elles seules ; l'adresse technique redirigée en une 301
 * passe.
 */
async function controle() {
  const PLAN = "<urlset><url><loc>https://migen.fr/page/</loc></url><url><loc>https://migen.fr/redirigee/</loc></url></urlset>";
  const ROUTES = {
    "/page/": [200],
    "/redirigee/": [301, "/page/"],
    "/chaine/": [301, "/etape/"],
    "/etape/": [301, "/page/"],
    "/boucle/": [301, "/boucle-b/"],
    "/boucle-b/": [301, "/boucle/"],
    "/cible-morte/": [301, "/nulle-part/"],
    "/technique-redirigee/": [301, "/page/"],
    "/technique-sur-place/": [200],
    "/sitemap.xml": [200],
  };
  const serveur = createServer((req, res) => {
    const [code, location] = ROUTES[req.url] ?? [404];
    if (location) res.setHeader("location", location);
    res.writeHead(code).end(req.url === "/sitemap.xml" ? PLAN : "");
  });
  await new Promise((ok) => serveur.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${serveur.address().port}`;

  const adresses = [
    { chemin: "/page/", classe: "conservee" },
    { chemin: "/redirigee/", classe: "a_rediriger" },
    { chemin: "/chaine/", classe: "a_rediriger" },
    { chemin: "/boucle/", classe: "a_rediriger" },
    { chemin: "/perdue/", classe: "a_rediriger" },
    { chemin: "/cible-morte/", classe: "a_rediriger" },
    { chemin: "/technique/", classe: "technique" },
    { chemin: "/technique-redirigee/", classe: "technique" },
    { chemin: "/technique-sur-place/", classe: "technique" },
  ];
  const { pertes } = await porte(base, adresses);
  serveur.close();

  const attendues = {
    "/chaine/": /^chaîne/,
    "/boucle/": /^boucle/,
    "/perdue/": /^404 sur une adresse de contenu/,
    "/cible-morte/": /^cible \/nulle-part\/ en 404/,
    "/technique/": /^404 sur une adresse de contenu/,
    "/technique-sur-place/": /^200 sur place/,
    "/redirigee/": /^adresse du plan du site en 301/,
  };
  const vues = Object.fromEntries(pertes.map((p) => [p.chemin, p.perte]));
  const manquees = Object.entries(attendues).filter(([c, motif]) => !motif.test(vues[c] ?? ""));
  const fausses = pertes.filter((p) => !(p.chemin in attendues));
  for (const [c, perte] of Object.entries(vues)) console.log(`  vue    ${c}  ${perte}`);
  if (manquees.length > 0 || fausses.length > 0) {
    for (const [c] of manquees) console.log(`  MANQUÉE ${c}`);
    for (const p of fausses) console.log(`  FAUSSE ALERTE ${p.chemin}  ${p.perte}`);
    console.log("CONTROLE_ECHOUE");
    process.exitCode = 1;
    return;
  }
  console.log(
    "CONTROLE_OK : la porte voit la chaîne, la boucle, la 404, la cible en 404, " +
      "l'adresse technique en 404 ou servie sur place et la page du plan masquée, sans fausse alerte.",
  );
}

if (process.argv.includes("--controle")) {
  await controle();
} else {
  const base = (process.argv.slice(2).find((a) => !a.startsWith("--")) ?? BASE_PAR_DEFAUT).replace(/\/+$/, "");
  const adresses = JSON.parse(readFileSync(LISTE, "utf8"));
  imprime(base, adresses, await porte(base, adresses, { filet: true }));
}
