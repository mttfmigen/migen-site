/**
 * Les sept familles d'équipement de l'écran « Marques maintenues », et leurs
 * soixante-sept constructeurs.
 *
 * SOURCE, dans cet ordre exact : `maquette/accueil-rendu.html`, lignes 2889 à
 * 2915, une famille par rangée. Les noms et l'ordre ne se réécrivent pas à la
 * main : `verification-marques.tsx` les relit DANS la maquette à chaque
 * exécution et refuse la moindre divergence.
 *
 * LES CHEMINS DE LOGO viennent de `public/assets/fab/brands.json`, déposé avec
 * les fichiers. Deux images portent le logo d'une tout autre société (voir
 * `LOGOS_ECARTES`, et le colis du 08/10 porte les mêmes) : ces deux
 * constructeurs portent `logo: null` et la tuile rend alors leur nom en
 * texte. Rien n'est remplacé par le logo d'un autre, et rien n'est inventé.
 * Le jour où un fichier arrive, le contrôle échoue et réclame son chemin :
 * c'est voulu.
 *
 * Le 07/10, sept images ont été rapatriées de la maquette Claude Design
 * (ABB Robotics, Amada, Billion, Coperion, Davis-Standard, Haas, Hurco) :
 * octets identiques à la source, en-tête conforme à l'extension, et chacune
 * ouverte à l'œil pour vérifier qu'elle porte bien la marque annoncée.
 * Le 08/10, les six dernières (Leroy-Somer, Yaskawa, Wittmann, Sidel, TGW,
 * Seepex) ont été rapatriées du colis de passation, sous les noms que
 * `brands.json` déclare, et ouvertes à l'œil de la même façon.
 */

export interface Marque {
  /** Nom du constructeur, tel que la maquette l'écrit. */
  readonly nom: string;
  /** Chemin du logo depuis la racine publique, `null` si le fichier manque. */
  readonly logo: string | null;
}

export interface FamilleMarques {
  /** Clé courte de `brands.json`, reprise comme clé de rendu. */
  readonly cle: string;
  /** Intitulé de la famille, en première colonne de la rangée. */
  readonly titre: string;
  readonly marques: readonly Marque[];
}

/**
 * Fichiers présents dans le dépôt mais ÉCARTÉS, parce qu'ils ne portent pas le
 * logo de la marque annoncée. Ouverts dans un navigateur, l'un après l'autre :
 *
 *   assets/fab/comau.svg        rend le logo d'AUTOMHA
 *   assets/fab/salvagnini.svg   rend celui de BST Brandschutztechnik
 *
 * Afficher la marque d'une autre société sous le nom d'un constructeur est une
 * donnée fausse, et sur une page de marques c'est aussi un risque de marque
 * déposée. Les deux portent donc `logo: null` et rendent leur nom en texte, le
 * temps qu'un fichier juste arrive. Aucun fichier n'est remplacé ni supprimé.
 * `verification-marques.tsx` tient cette liste à jour : si un chemin en sort
 * sans que le fichier change, le contrôle le dit.
 */
export const LOGOS_ECARTES: readonly string[] = [
  "/assets/fab/comau.svg",
  "/assets/fab/salvagnini.svg",
];

export const FAMILLES: readonly FamilleMarques[] = [
  {
    cle: "auto",
    titre: "Automatisme & électricité",
    marques: [
      { nom: "Siemens", logo: "/assets/fab/siemens.png" },
      { nom: "Schneider Electric", logo: "/assets/fab/schneider-electric.png" },
      { nom: "Rockwell Automation", logo: "/assets/fab/rockwell-automation.svg" },
      { nom: "Mitsubishi Electric", logo: "/assets/fab/mitsubishi-electric.svg" },
      { nom: "Omron", logo: "/assets/fab/omron.svg" },
      { nom: "B&R", logo: "/assets/fab/bandr.svg" },
      { nom: "ABB", logo: "/assets/fab/abb.svg" },
      { nom: "Leroy-Somer", logo: "/assets/fab/leroy-somer.png" },
      { nom: "SEW-Eurodrive", logo: "/assets/fab/sew-eurodrive.svg" },
      { nom: "NORD", logo: "/assets/fab/nord.svg" },
    ],
  },
  {
    cle: "robot",
    titre: "Robotique",
    marques: [
      { nom: "Fanuc", logo: "/assets/fab/fanuc.png" },
      { nom: "KUKA", logo: "/assets/fab/kuka.svg" },
      { nom: "ABB Robotics", logo: "/assets/fab/abb-robotics.webp" },
      { nom: "Yaskawa", logo: "/assets/fab/yaskawa.png" },
      { nom: "Kawasaki Robotics", logo: "/assets/fab/kawasaki-robotics.svg" },
      { nom: "Stäubli", logo: "/assets/fab/staubli.svg" },
      { nom: "Universal Robots", logo: "/assets/fab/universal-robots.svg" },
      { nom: "Comau", logo: null },
    ],
  },
  {
    cle: "mo",
    titre: "Machines-outils & tôlerie",
    marques: [
      { nom: "DMG Mori", logo: "/assets/fab/dmg-mori.svg" },
      { nom: "Okuma", logo: "/assets/fab/okuma.svg" },
      { nom: "Makino", logo: "/assets/fab/makino.svg" },
      { nom: "Haas", logo: "/assets/fab/haas.png" },
      { nom: "Hermle", logo: "/assets/fab/hermle.svg" },
      { nom: "DN Solutions", logo: "/assets/fab/dn-solutions.svg" },
      { nom: "Hyundai Wia", logo: "/assets/fab/hyundai-wia.svg" },
      { nom: "Hurco", logo: "/assets/fab/hurco.png" },
      { nom: "Amada", logo: "/assets/fab/amada.png" },
      { nom: "Trumpf", logo: "/assets/fab/trumpf.svg" },
      { nom: "Salvagnini", logo: null },
      { nom: "LVD", logo: "/assets/fab/lvd.svg" },
      { nom: "Schuler", logo: "/assets/fab/schuler.svg" },
    ],
  },
  {
    cle: "plast",
    titre: "Plasturgie & extrusion",
    marques: [
      { nom: "KraussMaffei", logo: "/assets/fab/kraussmaffei.svg" },
      { nom: "Sumitomo Demag", logo: "/assets/fab/sumitomo-demag.svg" },
      { nom: "Haitian", logo: "/assets/fab/haitian.svg" },
      { nom: "Wittmann", logo: "/assets/fab/wittmann.png" },
      { nom: "Billion", logo: "/assets/fab/billion.png" },
      { nom: "Reifenhäuser", logo: "/assets/fab/reifenhauser.svg" },
      { nom: "Davis-Standard", logo: "/assets/fab/davis-standard.png" },
      { nom: "Coperion", logo: "/assets/fab/coperion.png" },
      { nom: "Clextral", logo: "/assets/fab/clextral.svg" },
    ],
  },
  {
    cle: "agro",
    titre: "Agroalimentaire & emballage",
    marques: [
      { nom: "Tetra Pak", logo: "/assets/fab/tetra-pak.svg" },
      { nom: "Krones", logo: "/assets/fab/krones.svg" },
      { nom: "KHS", logo: "/assets/fab/khs.svg" },
      { nom: "Sidel", logo: "/assets/fab/sidel.png" },
      { nom: "Serac", logo: "/assets/fab/serac.svg" },
      { nom: "GEA", logo: "/assets/fab/gea.svg" },
      { nom: "Alfa Laval", logo: "/assets/fab/alfa-laval.svg" },
      { nom: "JBT Marel", logo: "/assets/fab/jbt.svg" },
      { nom: "Multivac", logo: "/assets/fab/multivac.svg" },
      { nom: "Syntegon", logo: "/assets/fab/syntegon.svg" },
      { nom: "Cama", logo: "/assets/fab/cama.svg" },
    ],
  },
  {
    cle: "logi",
    titre: "Intralogistique & manutention",
    marques: [
      { nom: "Savoye", logo: "/assets/fab/savoye.jpg" },
      { nom: "Vanderlande", logo: "/assets/fab/vanderlande.svg" },
      { nom: "KNAPP", logo: "/assets/fab/knapp.svg" },
      { nom: "TGW", logo: "/assets/fab/tgw.png" },
      { nom: "SSI Schäfer", logo: "/assets/fab/ssi-schafer.svg" },
      { nom: "Mecalux", logo: "/assets/fab/mecalux.svg" },
      { nom: "STILL", logo: "/assets/fab/still.svg" },
      { nom: "Toyota Material Handling", logo: "/assets/fab/toyota-material-handling.svg" },
    ],
  },
  {
    cle: "fluide",
    titre: "Air comprimé, pompes & fluides",
    marques: [
      { nom: "Atlas Copco", logo: "/assets/fab/atlas-copco.svg" },
      { nom: "Ingersoll Rand", logo: "/assets/fab/ingersoll-rand.svg" },
      { nom: "Gardner Denver", logo: "/assets/fab/gardner-denver.svg" },
      { nom: "BOGE", logo: "/assets/fab/boge.svg" },
      { nom: "KSB", logo: "/assets/fab/ksb.svg" },
      { nom: "Flowserve", logo: "/assets/fab/flowserve.svg" },
      { nom: "Sulzer", logo: "/assets/fab/sulzer.svg" },
      { nom: "Seepex", logo: "/assets/fab/seepex.png" },
    ],
  },
];
