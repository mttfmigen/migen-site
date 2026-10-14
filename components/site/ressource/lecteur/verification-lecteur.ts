/**
 * Porte du lecteur latéral, côté Techniciens : chaque fiche du hub se lit
 * dans le lecteur, et chaque texte rédigé de ses sections (intros, cartes,
 * étapes, lignes, bandes, questions) y arrive. Lecture seule de la base.
 *
 *   bun --conditions react-server components/site/ressource/lecteur/verification-lecteur.ts
 */
import { CONTENUS_TECHNICIENS } from "@/components/site/ressources-hub/v2/donnees";
import { pageParChemin } from "@/lib/contenu";
import { estMetier } from "@/types/metier";

import { ficheVersLecteur } from "./fiche-vers-lecteur";

const ecarts: string[] = [];
for (const x of CONTENUS_TECHNICIENS) {
  const c = await pageParChemin(x.url);
  if (!c || !estMetier(c.page.contenu)) {
    ecarts.push(`${x.url} : pas une fiche métier`);
    continue;
  }
  const fiche = c.page.contenu;
  const lu = JSON.stringify(ficheVersLecteur(fiche));
  const attendus = [fiche.heros.chapeau, ...(fiche.heros.paragraphes ?? [])];
  for (const s of fiche.sections) {
    if ("intros" in s) attendus.push(...(s.intros ?? []));
    if ("bande" in s && s.bande) attendus.push(s.bande.texte);
    if ("cartes" in s) attendus.push(...s.cartes.flatMap((k) => [k.titre, k.texte]));
    if (s.type === "etapes") attendus.push(...s.etapes.flatMap((k) => [k.titre, k.texte]));
    if (s.type === "tableau") attendus.push(...s.lignes.flatMap((l) => [l.gauche, l.droite]));
    if (s.type === "grille") attendus.push(...s.lignes.flat());
    if (s.type === "encart") attendus.push(...s.textes);
    if (s.type === "faq") attendus.push(...s.questions.flatMap((q) => [q.question, q.reponse]));
  }
  for (const t of attendus) if (!lu.includes(JSON.stringify(t).slice(1, -1))) ecarts.push(`${x.url} : absent du lecteur « ${t.slice(0, 60)} »`);
}
if (ecarts.length) {
  console.error(ecarts.join("\n"));
  process.exit(1);
}
console.log(`VERT : ${CONTENUS_TECHNICIENS.length} fiches, tout le texte des sections arrive dans le lecteur.`);
