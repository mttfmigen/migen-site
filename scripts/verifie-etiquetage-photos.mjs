/**
 * Le registre des photos dit-il la vérité sur ses photos ?
 *
 *   node scripts/verifie-etiquetage-photos.mjs
 *
 * LA CAUSE RACINE DU DÉFAUT SIGNALÉ PAR MEHDI LE 09/10 (« tu les as mal
 * intégré »), mesurée et non supposée. `scripts/repartit-photos.ts` choisit la
 * photo d'un emplacement sur les THÈMES du registre : il ne peut donc pas faire
 * mieux que ce que le registre lui dit. Or les 149 photos qu'il a téléchargées
 * sur Envato y ont été versées avec un étiquetage bâclé :
 *   - leur `description` était le TITRE ENVATO RECOPIÉ TEL QUEL, 149 fois sur
 *     149, et 12 d'entre elles en anglais ;
 *   - elles portaient 1,38 thème en moyenne contre 3,50 pour le premier lot,
 *     113 n'en avaient qu'un seul ou aucun ;
 *   - au moins un thème était FAUX : `env-projet-menuiserie-pere-et-enfant.jpg`,
 *     une photo de menuiserie, portait le thème `aeronautique`, ce qui l'a
 *     posée sur /secteurs/aeronautique/.
 * Une photo à un seul thème ne peut servir qu'une poignée de pages, et un thème
 * faux pose une photo absurde : les deux défauts se voient à l'écran.
 *
 * CE QUE CE CONTRÔLE EXIGE, et rien de plus :
 *  1. tout thème appartient au vocabulaire des 27, orthographe exacte ;
 *  2. aucune `description` n'est la recopie de son `titre` Envato ;
 *  3. aucune `description` n'est en anglais ;
 *  4. chaque photo porte au moins deux thèmes, parce qu'une photo à un seul
 *     thème est inservable ailleurs que sur deux ou trois pages ;
 *  5. l'`orientation` déclarée est celle du fichier.
 * Il ne juge PAS si un thème est juste : cela demande de regarder la photo, et
 * c'est le travail qui alimente le registre, pas celui qui le contrôle.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const PHOTOS = join(RACINE, "public/assets/photos");
const registre = JSON.parse(readFileSync(join(PHOTOS, "registre.json"), "utf8"));
const entrees = Array.isArray(registre) ? registre : (registre.photos ?? Object.values(registre));

const VOCABULAIRE = new Set([
  "technicien", "site-industriel", "automatisme", "mecanique", "robotique", "electricite",
  "depannage", "auto", "tuyauterie", "chimie", "metallurgie", "soudure", "energie",
  "menuiserie", "aeronautique", "cimenterie", "chaudronnerie", "equipe", "agro", "levage",
  "hydraulique", "logistique", "pharma", "arret-technique", "pneumatique", "nucleaire",
  "bureau-etudes",
]);

/* Des mots qui n'existent QU'EN ANGLAIS. Deux pièges évités ici, le second
   payé : « maintenance », « inspection » et « industrial » sont français ou
   quasi, ils ne prouvent rien ; et surtout « on », « at », « in », « of »,
   « for » sont des mots FRANÇAIS ou des fragments fréquents, ce qui faisait
   déclarer anglaise la description française « Technicien manœuvrant un jeu de
   vannes rouges… ». Ne restent que des mots sans ambiguïté. */
const ANGLAIS = /\b(?:the|with|and|worker|workers|engineer|engineers|factory|working|checking|repairing|wearing|using|inspecting|holding|standing|woman|women|male|female|room|plant|equipment|heavy|modern|smart|frames?|welding|warehouse|appliance|vats)\b/i;

/** Les dimensions d'un JPEG, lues dans ses marqueurs. */
function dimensionsJpeg(chemin) {
  const octets = readFileSync(chemin);
  if (octets[0] !== 0xff || octets[1] !== 0xd8) return null;
  let i = 2;
  while (i < octets.length - 9) {
    if (octets[i] !== 0xff) {
      i++;
      continue;
    }
    const marqueur = octets[i + 1];
    /* SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15 portent la taille. */
    if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
      return { hauteur: octets.readUInt16BE(i + 5), largeur: octets.readUInt16BE(i + 7) };
    }
    i += 2 + octets.readUInt16BE(i + 2);
  }
  return null;
}

const fautes = [];
for (const e of entrees) {
  const ou = e.fichier;
  for (const t of e.themes ?? []) {
    if (!VOCABULAIRE.has(t)) fautes.push({ ou, quoi: `thème « ${t} » hors vocabulaire` });
  }
  if ((e.themes ?? []).length < 2) {
    fautes.push({ ou, quoi: `${(e.themes ?? []).length} thème(s) : inservable au delà de deux ou trois pages` });
  }
  const description = (e.description ?? "").trim();
  const titre = (e.titre ?? "").trim();
  if (!description) fautes.push({ ou, quoi: "description vide" });
  else if (description.toLowerCase() === titre.toLowerCase()) {
    fautes.push({ ou, quoi: "description = titre Envato recopié" });
  } else if (ANGLAIS.test(description)) {
    fautes.push({ ou, quoi: `description en anglais : « ${description.slice(0, 48)} »` });
  }
  const taille = dimensionsJpeg(join(PHOTOS, ou));
  if (taille) {
    const reelle = taille.largeur >= taille.hauteur ? "paysage" : "portrait";
    if (e.orientation !== reelle) {
      fautes.push({ ou, quoi: `orientation « ${e.orientation} » alors que le fichier est ${reelle} (${taille.largeur}x${taille.hauteur})` });
    }
  }
}

if (fautes.length > 0) {
  const parQuoi = {};
  for (const f of fautes) {
    const classe = f.quoi.replace(/« [^»]* »/g, "…").replace(/\d+/g, "N").replace(/\(.*\)/, "");
    parQuoi[classe] = (parQuoi[classe] ?? 0) + 1;
  }
  for (const f of fautes.slice(0, 10)) console.log(`  ${f.ou.padEnd(50)} ${f.quoi}`);
  if (fautes.length > 10) console.log(`  … et ${fautes.length - 10} autres`);
  console.log(`\n${fautes.length} faute(s) d'étiquetage sur ${entrees.length} entrées du registre.`);
  for (const [classe, n] of Object.entries(parQuoi).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${classe}`);
  }
  process.exit(1);
}

console.log(`registre des photos correctement etiquete (${entrees.length} entrees, 27 themes au vocabulaire)`);
