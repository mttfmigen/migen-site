// Fait relire les fiches JSON au serveur de développement : lib/contenu.ts les
// charge une seule fois par processus, seul un octet changé dans le module le
// recharge. Ne touche que la ligne repère « // relais relu : ».
import { readFileSync, writeFileSync } from "node:fs";

const chemin = new URL("../lib/contenu.ts", import.meta.url);
const source = readFileSync(chemin, "utf8");
const repere = /^\/\/ relais relu : .*$/m;
if (!repere.test(source)) {
  console.error("ligne repère « // relais relu : » introuvable dans lib/contenu.ts");
  process.exit(1);
}
writeFileSync(chemin, source.replace(repere, `// relais relu : ${new Date().toISOString()}`));
console.log("relais relu");
