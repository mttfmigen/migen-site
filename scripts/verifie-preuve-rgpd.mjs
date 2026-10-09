/**
 * La preuve de consentement : elle s'écrit, ou elle échoue en le DISANT.
 *
 *   node scripts/verifie-preuve-rgpd.mjs
 *
 * CE QUE CE CONTRÔLE DÉFEND. Le défaut 1 du relais était un 500 indistinguable
 * d'une base qui casse. La cause a été nommée le 08/10 : `ecritureServeur()`
 * lève quand `SUPABASE_SERVICE_ROLE_KEY` est absente, et la migration 0004
 * réserve délibérément l'`insert` au serveur. La route rend donc désormais un
 * 503 avec la cause en journal. Le choix du visiteur a toujours été respecté,
 * il vit dans son cookie ; c'est la PREUVE qui ne s'écrit pas.
 *
 * MESURÉ LE 09/10 : la clé est présente dans `.env.local` mais SA VALEUR EST
 * VIDE (la ligne existe sous son commentaire d'explication). Attention au piège
 * qui a fait conclure l'inverse une première fois : un motif `=\s*\S` avale le
 * retour à la ligne et prend le commentaire suivant pour la valeur.
 *
 * CE CONTRÔLE ACCEPTE LES DEUX ÉTATS, parce que les deux sont corrects selon
 * que Mehdi a posé la clé ou non. Ce qu'il refuse, c'est un 500, un corps muet,
 * ou un 503 rendu alors que la clé EST posée.
 *
 * SA CAPACITÉ À ÉCHOUER EST VÉRIFIÉE À CHAQUE PASSAGE, et c'est le point : il
 * envoie d'abord un corps volontairement invalide et exige un 400 nommé. Une
 * route qui renverrait 503 à tout, ou 200 à tout, tomberait ici.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = process.env.SITE_URL ?? "http://localhost:4340";

/* `[^\S\n]` et pas `\s` : voir l'en-tête. */
const env = existsSync(join(RACINE, ".env.local")) ? readFileSync(join(RACINE, ".env.local"), "utf8") : "";
const ligne = env.match(/^[^\S\n]*SUPABASE_SERVICE_ROLE_KEY[^\S\n]*=([^\n]*)$/m);
const valeur = (ligne?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const clePosee = valeur.length > 20 && !valeur.startsWith("#");

const poste = async (corps) => {
  const r = await fetch(`${SITE}/api/consentement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
    signal: AbortSignal.timeout(30000),
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { statut: r.status, json };
};

const PREUVE = {
  visitor_id: "controle-rgpd-0000",
  choix: { mesure_audience: false, publicite: false, personnalisation: false, suivi_commercial: false },
  version_bandeau: "1",
};

/* 1 · LE CONTRÔLE NÉGATIF D'ABORD : une route qui répond pareil à tout ne
   prouve rien. `version_bandeau` doit être une CHAÎNE, pas un nombre. */
const invalide = await poste({ ...PREUVE, version_bandeau: 1 });
/* 2 · Une finalité inventée doit aussi être refusée en 400. */
const finalite = await poste({ ...PREUVE, choix: { ...PREUVE.choix, espionnage: true, publicite: undefined } });
/* 3 · Le corps valide. */
const valide = await poste(PREUVE);

const verdicts = [
  ["un corps invalide est refusé en 400 nommé", invalide.statut === 400 && typeof invalide.json?.erreur === "string"],
  ["une finalité inventée est refusée en 400", finalite.statut === 400],
  [
    clePosee
      ? "la clé de service est posée, la preuve s'écrit (2xx)"
      : "la clé de service est vide, la route rend 503 et le dit",
    clePosee
      ? valide.statut >= 200 && valide.statut < 300
      : valide.statut === 503 && /configuration du serveur incompl/i.test(valide.json?.erreur ?? ""),
  ],
  ["la réponse n'est jamais un 500 muet", valide.statut !== 500 && invalide.statut !== 500],
];

for (const [quoi, ok] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
if (!verdicts.every(([, ok]) => ok)) {
  console.log(`\nétats obtenus : invalide ${invalide.statut}, finalité ${finalite.statut}, valide ${valide.statut}`);
  process.exit(1);
}
console.log(
  `\npreuve RGPD bloquee proprement (cle de service ${clePosee ? "posee" : "VIDE"}, ` +
    `corps valide -> ${valide.statut}, corps invalide -> ${invalide.statut})`,
);
