/**
 * LES PHOTOS QU'UNE PAGE COMMERCIALE NE DOIT PAS SERVIR.
 *
 * POURQUOI. Mehdi, le 12/10, sur `/offres/` : « changer les photos c'est que
 * des photos avec des avions, je vois pas le rapport on doit voir du
 * technicien ».
 *
 * CE QUI NE MARCHAIT PAS : filtrer sur les THÈMES du registre. Les sept photos
 * hors sujet de `/offres/` portaient toutes `technicien`, un mécanicien penché
 * sur un moteur d'avion EN ÉTANT un. Aucun sélecteur demandant « un
 * technicien » ne pouvait les écarter, et ce n'était pas une pénurie : 291 des
 * 385 photos portent ce thème contre 20 pour l'aéronautique.
 *
 * COMMENT CETTE LISTE A ÉTÉ ÉTABLIE. Les 385 photos du registre ont été
 * classées par SUJET RÉELLEMENT VISIBLE, image ouverte, sur un seul critère :
 * un responsable maintenance qui voit cette image sur une page d'offre
 * comprend-il qu'on lui parle de maintenance industrielle, ou croit-il qu'on
 * lui parle d'un autre métier ? 64 ont été disqualifiées, puis trois sceptiques
 * aux lentilles distinctes (le visuel, l'acheteur, la pénurie du stock) en ont
 * annulé 20. Les 44 qui restent sont celles qu'une majorité n'a pas pu
 * refuter.
 *
 * L'EXCEPTION : une page `/secteurs/<marche>/` a le droit de montrer son
 * marché. La page aéronautique peut servir un avion, c'est son sujet.
 *
 * CE FICHIER EST ÉCRIT À LA MAIN À PARTIR D'UN CLASSEMENT MESURÉ, pas généré :
 * y ajouter une photo demande de dire pourquoi.
 */

export const PHOTOS_HORS_INDUSTRIE: ReadonlySet<string> = new Set([
  "aero-cockpit-inspection-hangar.jpg",
  "aero-fuselage-serrage-lampe.jpg",
  "aero-nacelle-moteur-technicien.jpg",
  "aero-percage-aile-avion.jpg",
  "aero-reacteur-capot-combinaison.jpg",
  "env-avion-en-maintenance.jpg",
  "env-deux-hommes-au-travail-en-menuiserie.jpg",
  "env-deux-hommes-menuiserie.jpg",
  "env-entretien-avion-22-sept-2026.jpg",
  "env-homme-inspectant-le-bois.jpg",
  "env-inspection-auto-avec-equipe.jpg",
  "env-inspection-de-bois-24-sept-2026.jpg",
  "env-mecanicien-aeronautique.jpg",
  "env-menuiserie-24-sept-2026.jpg",
  "env-menuiserie-circular-saw.jpg",
  "env-menuiserie-industrie.jpg",
  "env-menuisier-avec-masque-sept-2026.jpg",
  "env-menuisier-dans-l-atelier.jpg",
  "env-menuisier-utilisant-des-outils.jpg",
  "env-moteur-d-avion-en-maintenance.jpg",
  "env-photos-industrie-aeronautique.jpg",
  "env-photos-industrie-menuiserie-2.jpg",
  "env-photos-industrie-menuiserie.jpg",
  "env-photos-industrie-pharmaceutique.jpg",
  "env-photos-menuiserie-2.jpg",
  "env-photos-menuiserie.jpg",
  "env-professionnels-maintenance-aeronautique.jpg",
  "env-professionnels-sur-machine-a-bois.jpg",
  "env-reparation-moteur-aeronautique.jpg",
  "env-reparation-moteur-avion.jpg",
  "env-reparation-moteur-jet-hangar.jpg",
  "env-scie-a-ruban-industrielle.jpg",
  "env-technician-inspecting-fiber-optics.jpg",
  "env-technician-maintenance-jet-engine.jpg",
  "env-techniciens-semiconducteurs.jpg",
  "env-usine-aeronautique-22-sept-2026.jpg",
  "il-femme-en-tenue-professionnelle-pres-d-un-bras-.jpg",
  "il-technicien-maintenance-camion-1600.jpg",
  "il-technicien-maintenance-jan-9-2026-1-1600.jpg",
  "il-technicien-maintenance-photo-1-1600.jpg",
  "il-technicien-maintenance-photo-4-1600.jpg",
  "menuiserie-scie-panneaux-epi.jpg",
  "pharma-isolateur-salle-propre.jpg",
  "pharma-technicienne-machine-comprimes.jpg",
]);

/** Vrai si `url` a le droit de montrer un marché identifiable : sa page. */
export function pageDeMarche(url: string): boolean {
  return url.startsWith("/secteurs/");
}
