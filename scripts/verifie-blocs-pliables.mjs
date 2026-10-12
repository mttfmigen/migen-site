/**
 * Les blocs repliés sur téléphone gardent-ils leur texte dans le HTML ?
 *
 *   node scripts/verifie-blocs-pliables.mjs
 *   node scripts/verifie-blocs-pliables.mjs --controle   (contrôle positif)
 *
 * CE QU'IL DÉFEND, et c'est la promesse du README du colis de passation :
 * « les blocs se déplient pour rester courts SANS PERDRE LE TEXTE UTILE AU
 * RÉFÉRENCEMENT ». La maquette mobile, elle, retire le contenu replié du DOM
 * (`sc-if`) : elle contredit son propre README. Le site garde le texte et le
 * replie par la feuille de style.
 *
 * Trois choses peuvent casser cette promesse sans bruit, et ce sont les trois
 * que ce contrôle mesure sur le rendu réel :
 *
 *  1. LE TEXTE SORT DU HTML. Si quelqu'un remplace le repli CSS par un rendu
 *     conditionnel, Google ne voit plus rien et la moitié des portes du projet
 *     tombent avec lui. Le contrôle exige que le corps du bloc soit SERVI.
 *  2. LE BLOC ARRIVE FERMÉ DU SERVEUR. Le HTML doit porter `open` : le repli
 *     est un effet client, sous 880 px seulement. Un bloc rendu fermé par le
 *     serveur serait replié AUSSI sur grand écran, où la maquette le montre.
 *  3. LE TITRE DISPARAÎT. Un bloc replié dont l'en-tête ne se lit plus n'est
 *     pas un bloc replié, c'est un bloc perdu : le visiteur ne sait pas qu'il
 *     y a quelque chose dessous.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const CONTROLE = process.argv.includes("--controle");

/** Les `<details data-pliable-mobile>` d'un HTML, avec leur contenu. */
export function blocsPliables(html) {
  const trouves = [];
  for (const m of html.matchAll(/<details\b([^>]*\bdata-pliable-mobile\b[^>]*)>([\s\S]*?)<\/details>/g)) {
    const [, attributs, dedans] = m;
    trouves.push({
      ouvertAuServeur: /\bopen(?:=""|=\s*"open"|\s|$)/.test(attributs),
      aUnEnTete: /<summary\b/.test(dedans),
      /* Le corps est tout ce qui suit la fermeture du `<summary>`. */
      corps: dedans.replace(/[\s\S]*?<\/summary>/, ""),
      titre: (dedans.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/) ?? [, ""])[1].replace(/<[^>]+>/g, "").trim(),
    });
  }
  return trouves;
}

if (CONTROLE) {
  const bon = blocsPliables(
    '<details open data-pliable-mobile=""><summary><h2>Ce que nous garantissons</h2></summary>' +
      "<p>Le résumé.</p><div>Le corps entier, servi.</div></details>",
  );
  const ferme = blocsPliables(
    '<details data-pliable-mobile=""><summary><h2>Titre</h2></summary><div>Corps</div></details>',
  );
  const vide = blocsPliables('<details open data-pliable-mobile=""><summary><h2>Titre</h2></summary></details>');
  const verdicts = [
    ["un bloc conforme est reconnu", bon.length === 1 && bon[0].ouvertAuServeur && bon[0].aUnEnTete],
    ["son titre est lu", bon[0]?.titre === "Ce que nous garantissons"],
    ["son corps est vu comme servi", bon[0]?.corps.includes("Le corps entier, servi.")],
    ["un bloc rendu FERMÉ par le serveur est vu", ferme.length === 1 && !ferme[0].ouvertAuServeur],
    ["un bloc au corps VIDE est vu", vide[0]?.corps.replace(/\s/g, "") === ""],
  ];
  for (const [quoi, ok] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
  if (!verdicts.every(([, ok]) => ok)) process.exit(1);
  console.log(`\ncontrôle positif conforme (${verdicts.length}/${verdicts.length})`);
}

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
const urls = [...new Set(pagesIndex.map((p) => p?.url).filter(Boolean))];

const fautes = [];
/**
 * LES PAGES QUI N'ONT PAS RÉPONDU.
 *
 * LE TROU QU'ELLES BOUCHENT, signalé le 12/10 : la boucle avalait chaque page
 * injoignable par un `catch { return }`, au motif que « une page injoignable est
 * signalée par les autres portes ». Conséquence : si 240 des 248 pages tombaient
 * et que les 8 restantes portaient des blocs sains, la porte annonçait
 * tranquillement « 8 pages, tant de blocs, vert ». Une porte qui conclut sur
 * des données partielles ne protège plus rien, et c'est la faute la plus grave
 * qu'une porte puisse commettre sur ce projet.
 *
 * Désormais : une seule page muette suffit à rendre la mesure NON CONCLUANTE.
 * La porte ne dit pas « c'est faux », elle dit « je n'ai pas pu mesurer », ce
 * qui est la vérité et se répare autrement.
 */
const injoignables = [];
let blocs = 0;
let pages = 0;
const LOT = 10;

for (let i = 0; i < urls.length; i += LOT) {
  await Promise.all(
    urls.slice(i, i + LOT).map(async (url) => {
      let html;
      try {
        const r = await fetch(SITE + url, { signal: AbortSignal.timeout(30000) });
        if (!r.ok) {
          injoignables.push(`${url} : HTTP ${r.status}`);
          return;
        }
        html = await r.text();
      } catch (erreur) {
        injoignables.push(`${url} : ${erreur?.cause?.code ?? erreur?.name ?? "injoignable"}`);
        return;
      }
      const trouves = blocsPliables(html);
      if (trouves.length === 0) return;
      pages++;
      for (const bloc of trouves) {
        blocs++;
        if (!bloc.ouvertAuServeur) {
          fautes.push(`${url} : « ${bloc.titre} » est rendu FERMÉ par le serveur, il le serait aussi sur grand écran`);
        }
        if (!bloc.aUnEnTete) fautes.push(`${url} : un bloc repliable sans en-tête, le visiteur ne sait pas qu'il existe`);
        if (!bloc.titre) fautes.push(`${url} : un bloc repliable sans titre lisible`);
        if (bloc.corps.replace(/<[^>]+>|\s/g, "").length < 40) {
          fautes.push(`${url} : « ${bloc.titre} » n'a quasiment pas de corps dans le HTML servi, le texte a quitté le document`);
        }
      }
    }),
  );
}

/* LE VERDICT DE COUVERTURE PASSE AVANT TOUT AUTRE. Compter des blocs sur un
   echantillon muet n'a pas de sens, et un vert obtenu ainsi est un mensonge. */
if (injoignables.length > 0) {
  console.log(`MESURE NON CONCLUANTE : ${injoignables.length} page(s) sur ${urls.length} n'ont pas repondu.`);
  for (const i of injoignables.slice(0, 10)) console.log(`  ${i}`);
  if (injoignables.length > 10) console.log(`  … et ${injoignables.length - 10} autres`);
  console.log(`\nLe serveur doit repondre sur les ${urls.length} adresses pour que le compte vaille quelque chose.`);
  process.exit(1);
}

if (blocs === 0) {
  console.log("aucun bloc repliable sur le site : rien a mesurer.");
  process.exit(1);
}
if (fautes.length > 0) {
  for (const f of fautes.slice(0, 12)) console.log(`  ${f}`);
  if (fautes.length > 12) console.log(`  … et ${fautes.length - 12} autres`);
  console.log(`\n${fautes.length} defaut(s) sur ${blocs} bloc(s) repliable(s).`);
  process.exit(1);
}

console.log(
  `blocs repliables conformes : ${blocs} bloc(s) sur ${pages} page(s), ` +
    `tous servis ouverts, avec leur titre et leur texte entier dans le HTML`,
);
