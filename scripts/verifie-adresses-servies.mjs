/**
 * Les adresses de l'index sortent-elles toutes en 200 ?
 *
 *   node scripts/verifie-adresses-servies.mjs
 *   SITE_URL=https://migen-site.vercel.app node scripts/verifie-adresses-servies.mjs
 *
 * Le balayage que le relais décrit à la main (« un balayage des 249 URL en 200
 * sur le serveur de dev ») n'avait pas d'outil : il se refaisait de mémoire
 * avant chaque mise en ligne. Celui-ci le rend reproductible et comparable
 * entre le local et la production.
 *
 * Il suit les redirections mais le DIT : une adresse de l'index qui ne répond
 * 200 qu'après un détour n'est pas servie, elle est renvoyée ailleurs, et c'est
 * exactement ce que le projet appelle « une page perdue ».
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const LOT = Number(process.env.LOT ?? 12);

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pages = Array.isArray(index) ? index : (index.pages ?? index);
const urls = [...new Set(pages.map((p) => p?.url).filter(Boolean))];

const fautes = [];
let servies = 0;

for (let i = 0; i < urls.length; i += LOT) {
  await Promise.all(
    urls.slice(i, i + LOT).map(async (url) => {
      try {
        const r = await fetch(SITE + url, { redirect: "manual", signal: AbortSignal.timeout(30000) });
        if (r.status === 200) {
          servies++;
          return;
        }
        fautes.push({
          url,
          quoi:
            r.status >= 300 && r.status < 400
              ? `${r.status} vers ${r.headers.get("location") ?? "?"}`
              : String(r.status),
        });
      } catch (e) {
        fautes.push({ url, quoi: e.name === "TimeoutError" ? "délai dépassé" : e.message });
      }
    }),
  );
}

if (fautes.length > 0) {
  for (const f of fautes.sort((a, b) => a.url.localeCompare(b.url))) {
    console.log(`  ${f.quoi.padEnd(34)} ${f.url}`);
  }
  console.log(`\n${servies}/${urls.length} adresses en 200 sur ${SITE}, ${fautes.length} en faute.`);
  process.exit(1);
}

console.log(`${servies}/${urls.length} adresses de l'index en 200 sur ${SITE}`);
