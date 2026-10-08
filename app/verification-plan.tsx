/**
 * Le plan du site déclare-t-il TOUTES les routes statiques ?
 *
 *   bun app/verification-plan.tsx
 *
 * POURQUOI CE CONTRÔLE. Le plan du site se construit depuis la table `pages`.
 * Or onze écrans uniques, plus l'accueil, vivent dans le code et pas en base :
 * un plan qui lit seulement la base les oublie tous, et personne ne le voit,
 * parce qu'un plan incomplet s'affiche très bien. C'est ce qui est arrivé.
 *
 * La liste `ROUTES_STATIQUES` (dans `lib/routes-statiques.ts`) est tenue à la main. Ce contrôle la compare aux
 * dossiers réellement présents sous `app/` : ajouter un écran sans l'inscrire
 * au plan fait échouer le build.
 */
import assert from "node:assert/strict";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { ROUTES_STATIQUES } from "@/lib/routes-statiques";

const APP = fileURLToPath(new URL(".", import.meta.url));

/* Un dossier de `app/` est une page publique s'il porte un `page.tsx` et que
   son nom n'est ni un segment dynamique, ni un groupe, ni une route d'API.
   Les dossiers sont parcourus en profondeur : `/a-propos/equipe/` en est un. */
function routesSous(dossier: string, prefixe: string): string[] {
  return readdirSync(dossier, { withFileTypes: true })
    .filter((entree) => entree.isDirectory())
    .map((entree) => entree.name)
    .filter((nom) => !nom.startsWith("[") && !nom.startsWith("(") && nom !== "api")
    .flatMap((nom) => {
      const route = `${prefixe}${nom}/`;
      const sous = routesSous(join(dossier, nom), route);
      return existsSync(join(dossier, nom, "page.tsx")) ? [route, ...sous] : sous;
    });
}
const routesSurDisque = routesSous(APP, "/");

if (existsSync(join(APP, "page.tsx"))) routesSurDisque.unshift("/");

const declarees = new Set<string>(ROUTES_STATIQUES);

for (const route of routesSurDisque) {
  assert.ok(
    declarees.has(route),
    `${route} est servie mais absente de ROUTES_STATIQUES dans lib/routes-statiques.ts : ` +
      `elle n'entrerait pas dans le plan du site, donc Google ne la verrait pas.`,
  );
}

for (const route of declarees) {
  assert.ok(
    routesSurDisque.includes(route),
    `${route} est déclarée au plan du site mais n'a pas de route sous app/ : ` +
      `le plan annoncerait une page qui répond 404.`,
  );
}

console.log(
  `plan du site : ${routesSurDisque.length} routes statiques, toutes déclarées`,
);
