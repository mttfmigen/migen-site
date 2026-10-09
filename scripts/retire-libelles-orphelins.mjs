/**
 * Retire des fiches les blocs « Complément » réduits à une annonce sans annoncé.
 *
 *   node scripts/retire-libelles-orphelins.mjs --essai   (montre, n'écrit rien)
 *   node scripts/retire-libelles-orphelins.mjs
 *
 * Défaut signalé par Mehdi le 09/10 sur les études de cas. La raison, la preuve
 * que rien ne disparaît et la cause racine sont dans l'en-tête de
 * `scripts/verifie-libelles-orphelins.mjs`, qui est la porte de ce correctif.
 *
 * CE QUI PART, exactement : un bloc de `contenu.complement` dont le `texte` est
 * une annonce (deux-points final) et dont les `puces` sont absentes. Le bloc
 * ENTIER, titre compris, parce que ce titre est déjà un `h2` de la page :
 * « La situation », « Ce que nous avons mis en place » et « Le résultat » y
 * figurent deux fois chacun, mesuré sur le rendu de /preuves/autoliv/.
 *
 * CE QUI RESTE : tout bloc portant une vraie phrase (« Le renfort soutient
 * l'équipe maintenance existante… ») et tout bloc portant ses `puces`. Huit
 * fiches en ont, elles ne sont pas touchées.
 *
 * CHAQUE PHRASE RETIRÉE EST ÉCRITE dans le `trous` de sa fiche : la capture de
 * la maquette porte le libellé, l'écart est donc déclaré, pas subi.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const FICHES = join(RACINE, "supabase", "import", "gabarits-maquette");
const ESSAI = process.argv.includes("--essai");

const ANNONCE = /^(?=(?:\S+\s+){2,})[^:]{12,}:$/u;

const POURQUOI =
  "annonce sans annoncé : la capture de la maquette rend ce libellé puis laisse " +
  "l'emplacement de sa liste VIDE (son export a perdu les puces), si bien que le " +
  "visiteur lisait des deux-points ouverts sur rien. La liste annoncée est rendue " +
  "ailleurs sur la même page, en cartes (`objectifs`, `reponseCartes`, `resultats`), " +
  "vérifiée puce par puce contre le corpus du client : aucun contenu ne disparaît. " +
  "Le titre du bloc part avec, c'est déjà un h2 de la page. " +
  "Porte : scripts/verifie-libelles-orphelins.mjs";

let fichesTouchees = 0;
let blocsRetires = 0;

for (const entree of readdirSync(FICHES).filter((f) => f.endsWith(".json"))) {
  const chemin = join(FICHES, entree);
  const brut = readFileSync(chemin, "utf8");
  const fiche = JSON.parse(brut);
  const complement = fiche?.contenu?.complement;
  if (!Array.isArray(complement)) continue;

  const retires = [];
  const gardes = complement.filter((bloc) => {
    const texte = (bloc?.texte ?? "").trim();
    const orphelin = ANNONCE.test(texte) && !bloc?.puces?.length;
    if (orphelin) retires.push(texte);
    return !orphelin;
  });
  if (retires.length === 0) continue;

  fiche.contenu.complement = gardes;
  /* `trous` vit à la racine de la fiche, comme dans les implantations, et
     garde la forme que `verification-offres` relit : { ligne, pourquoi }. */
  fiche.trous = [...(fiche.trous ?? []), ...retires.map((ligne) => ({ ligne, pourquoi: POURQUOI }))];

  fichesTouchees++;
  blocsRetires += retires.length;
  console.log(`${entree}`);
  for (const l of retires) console.log(`   retiré : « ${l} »`);
  if (gardes.length === 0) console.log("   (le récapitulatif de cette page disparaît entièrement)");

  if (!ESSAI) writeFileSync(chemin, `${JSON.stringify(fiche, null, 2)}\n`, "utf8");
}

console.log(
  `\n${blocsRetires} bloc(s) retiré(s) sur ${fichesTouchees} fiche(s)` +
    (ESSAI ? " — essai, rien n'a été écrit." : ", et déclaré(s) dans leur « trous »."),
);
