// Lance le contrôle de CHAQUE gabarit, l'un après l'autre, et ne dit « conformes »
// que si tous passent. Chaque gabarit porte son propre contrôle à côté de son
// composant ; ce fichier est la porte unique qui les enchaîne.
import { spawnSync } from "node:child_process";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const racine = "components/site";
const controles = [join(racine, "verification-gabarits.tsx")];
for (const d of readdirSync(racine)) {
  const dossier = join(racine, d);
  if (!statSync(dossier).isDirectory()) continue;
  for (const f of readdirSync(dossier)) {
    if (/^verification-.*\.tsx$/.test(f)) controles.push(join(dossier, f));
  }
}
let echecs = 0;
for (const c of controles.sort()) {
  if (!existsSync(c)) continue;
  const r = spawnSync("bun", [c], { encoding: "utf8" });
  const ok = r.status === 0;
  if (!ok) echecs += 1;
  console.log(`${ok ? "ok " : "KO "} ${c}${ok ? "" : `\n${(r.stdout + r.stderr).trim().split("\n").slice(-6).join("\n")}`}`);
}
console.log(`${controles.length} contrôles, ${echecs} en échec`);
if (echecs > 0 || controles.length < 7) process.exit(1);
console.log("gabarits conformes");
