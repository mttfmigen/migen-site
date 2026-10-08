// `appliqueDecisions` de lib/decisions-copie.ts pour les portes lancées par
// Node (.mjs) : Node 20 ne lit pas le TypeScript, le module est transpilé à
// la volée par le compilateur du dépôt. Une seule source pour les décisions.
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/decisions-copie.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const transpile = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

/** @type {(texte: string) => string} */
export const appliqueDecisions = transpile.appliqueDecisions;
