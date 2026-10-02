import { readFileSync } from "node:fs";
const inv: { url: string }[] = JSON.parse(readFileSync("docs/urls-site-actuel.json", "utf8"));
const sansSlash = (c: string) => (c.length > 1 && c.endsWith("/") ? c.slice(0, -1) : c);
const canon = new Set(inv.map((e) => sansSlash(e.url)));
const aTester = [
  "/secteurs/agroalimentaire","/secteurs/automobile","/secteurs/logistique","/secteurs/aeronautique",
  "/secteurs/pharmaceutique","/secteurs/chimie","/secteurs/industrie-metallique",
  "/implantations","/implantations/lyon","/implantations/paris","/implantations/lille",
  "/implantations/strasbourg","/implantations/nantes","/implantations/toulouse",
  "/realisations/","/marques/",
];
for (const u of aTester) console.log((canon.has(sansSlash(u)) ? "OK   " : "404 ?") + " " + u);
console.log("total inventaire:", inv.length);
