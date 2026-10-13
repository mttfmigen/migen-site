import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./HubsAccueil.module.css";
import replis from "./replis-accueil.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { PHOTO_DU_HUB } from "@/components/site/implantations/photos-hubs";

export interface HubAccueil {
  /** Ville, affichée dans la pastille blanche. Sert aussi de clé photo. */
  ville: string;
  titre: string;
  /** Territoires couverts, une seule ligne. */
  couverture: string;
  chemin: string;
  /**
   * Description de la photo de la ville, pour un lecteur d'écran.
   *
   * ABSENTE QUAND LE HUB N'A PAS DE PHOTO, et ce n'est pas un oubli : décrire
   * une image qui n'est pas là reviendrait à l'inventer. Les deux `alt` qui
   * vivaient ici jusqu'au 14/10, « Site industriel en Lorraine » et « Atelier
   * industriel en Bourgogne », annonçaient une localisation que RIEN ne
   * documente : la première photo est une cimenterie, la seconde un métier à
   * tisser. Deux données inventées, retirées avec leurs photos.
   */
  alt?: string;
  /**
   * LE POINT DE CADRAGE de la photo dans son cadre, au format de
   * `object-position` (« center », « 70% center », « center top »…).
   *
   * POURQUOI CE RÉGLAGE EXISTE. Mehdi, le 12/10 : « la photo de Bordeaux est
   * mal cadrée ». Le cadre fait 300 px de large pour 400 de haut, donc un
   * format PORTRAIT, alors que les photos de villes sont pour moitié en
   * PAYSAGE : `object-fit: cover` centré n'en garde qu'une bande verticale, et
   * le monument sort du cadre.
   *
   * L'AXE UTILE DÉPEND DU RAPPORT DE LA PHOTO, et c'est le piège qui a coûté
   * une correction pour rien. `cover` ne déborde que d'UN côté : une photo plus
   * large que son cadre déborde horizontalement, et sa composante VERTICALE
   * n'a alors aucun effet. La valeur posée ici jusqu'au 14/10, « center 38% »,
   * réglait l'axe vertical d'une photo dont le débordement vertical vaut
   * 0 pixel : elle ne changeait rien. `verification-photos.tsx` refuse
   * désormais tout cadrage posé sur un axe sans débordement.
   *
   * Sans valeur, le centre, qui reste le bon choix pour une composition
   * symétrique.
   */
  cadrage?: string;
}

interface Proprietes {
  hubs?: readonly HubAccueil[];
}

/**
 * Les dix hubs de la maquette autonome, dans son ordre, textes compris (relevé
 * du 08/10 ; l'ancien relevé, sur `accueil-rendu.html` du 02/10, n'en comptait
 * que six et rattachait Bordeaux à Toulouse).
 *
 * LA PHOTO N'EST PLUS ÉCRITE ICI, depuis le 14/10. Elle est lue dans
 * `components/site/implantations/photos-hubs.ts`, à la clé `ville`, qui est la
 * source unique partagée avec la mosaïque de `/implantations/`. Les deux pages
 * portaient jusqu'ici deux listes d'imports des MÊMES huit fichiers, et elles
 * avaient déjà divergé : `/implantations/` rendait Metz et Dijon en panneau
 * sombre, l'accueil leur posait une scène d'usine. Une seule vérité, donc, et
 * le jour où Mehdi dépose `hub-metz.jpg`, les deux pages l'affichent.
 *
 * Les huit photos sous licence vivent dans `./hubs/` et sont importées
 * statiquement (next/image les sert à la taille de la carte). Metz et Dijon
 * n'en ont pas : voir `photos-hubs.ts`.
 */
const HUBS: readonly HubAccueil[] = [
  {
    ville: "Lyon",
    titre: "Hub Lyon",
    couverture: "Siège · Grenoble, Saint-Étienne, Valence, Haute-Savoie",
    chemin: "/implantations/lyon/",
    alt: "Lyon, la basilique de Fourvière au coucher du soleil",
  },
  {
    ville: "Paris",
    titre: "Hub Paris",
    couverture: "Essonne, Rouen",
    chemin: "/implantations/paris/",
    alt: "Paris et la tour Eiffel",
  },
  {
    ville: "Lille",
    titre: "Hub Lille",
    couverture: "Hauts-de-France",
    chemin: "/implantations/lille/",
    alt: "Façades du centre de Lille",
  },
  {
    ville: "Strasbourg",
    titre: "Hub Strasbourg",
    couverture: "Alsace, Mulhouse",
    chemin: "/implantations/strasbourg/",
    alt: "Strasbourg, les Ponts couverts",
  },
  {
    ville: "Nantes",
    titre: "Hub Nantes",
    couverture: "Loire-Atlantique, Rennes, Brest",
    chemin: "/implantations/nantes/",
    alt: "Vue aérienne de Nantes",
  },
  {
    ville: "Toulouse",
    titre: "Hub Toulouse",
    couverture: "Haute-Garonne, Albi, Tarbes, Agen",
    chemin: "/implantations/toulouse/",
    alt: "Toulouse, la Garonne et la ville rose",
  },
  {
    ville: "Marseille",
    titre: "Hub Marseille",
    couverture: "Fos, Toulon, Nîmes, Perpignan",
    chemin: "/implantations/marseille/",
    alt: "Marseille, le Vieux-Port",
  },
  {
    ville: "Bordeaux",
    titre: "Hub Bordeaux",
    couverture: "Gironde, Mérignac, Charente",
    chemin: "/implantations/bordeaux/",
    alt: "Bordeaux, les quais de la Garonne",
    /* LE CADRAGE DE BORDEAUX, mesuré le 14/10 et non estimé.
       La photo fait 2000x1335, le cadre 300x400. En `cover`, elle est agrandie
       au facteur 0,2996 : 599 px de large pour 400 de haut. Le débordement est
       donc de 299 px HORIZONTALEMENT et de 0 px verticalement, ce qui rendait
       « center 38% » inopérant.
       Centrée, la fenêtre montre les colonnes 499 à 1501 de la photo, alors que
       le bloc Saint-Michel, église et flèche, occupe les colonnes 929 à 1527 :
       la flèche, seul monument de l'image, était coupée par le bord droit.
       À 70 %, la fenêtre va de 699 à 1700 et le bloc y tient entier. */
    cadrage: "70% center",
  },
  {
    ville: "Metz",
    titre: "Hub Metz",
    couverture: "Moselle, Nancy, sillon lorrain",
    chemin: "/implantations/maintenance-industrielle-metz/",
  },
  {
    ville: "Dijon",
    titre: "Hub Dijon",
    couverture: "Côte-d’Or, Besançon, Chalon",
    chemin: "/implantations/maintenance-industrielle-dijon/",
  },
];

/**
 * LE FOND D'UNE TUILE SANS PHOTO, délibérément sombre.
 *
 * Mehdi, le 12/10 : « la photo de Metz ne correspond pas ». Elle ne
 * correspondait pas parce que ce n'était pas Metz : la carte servait
 * `mq-dcd9cac6ffbf.jpg`, une cimenterie, et Dijon `x-cablerie.jpg`, un métier à
 * tisser. Aucune photo de Metz ni de Dijon n'est sous licence au dépôt : les
 * deux pages Envato sont choisies et inscrites dans
 * `docs/PHOTOS-VILLES-ENVATO.md`, il manque les fichiers.
 *
 * On ne remet donc PAS une scène d'usine en attendant, c'est exactement ce qui
 * a déclenché son retour. La tuile se rend en panneau sombre, le manque se
 * voit, et c'est le but. Même traitement que la mosaïque de `/implantations/`.
 */
const PANNEAU_SANS_PHOTO: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(160deg,#2a2825 0%,#1c1b19 52%,#141311 100%)",
};

const PANCARTE: CSSProperties = {
  position: "absolute",
  left: 12,
  right: 12,
  bottom: 12,
  padding: "16px 18px",
  borderRadius: 18,
  background: "rgba(28,27,25,.42)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
  border: "1px solid rgba(255,255,255,.18)",
};

/* Le sur-titre et le titre, écrits une seule fois : l'en-tête d'origine tient
   le dessin de bureau, la bascule de repli porte le titre sur téléphone, et
   `replis-accueil.module.css` n'en montre jamais qu'un des deux. */
const SURTITRE_TEXTE = "Nos hubs";
const TITRE_TEXTE = "Des hubs partout en France";

export default function HubsAccueil({ hubs = HUBS }: Proprietes) {
  return (
    /* `repliPleineLargeur` : le rail de cartes est en pleine largeur et frère
       de l'en-tête, le dépliant doit donc envelopper les DEUX, au niveau de la
       `<section>`, qui n'a aucune gouttière. La classe la rend à la bascule, et
       à elle seule. Voir `replis-accueil.module.css`. */
    <section
      className={`${replis.repli} ${replis.repliPleineLargeur}`}
      style={{ padding: "var(--sec) 0 0" }}
    >
      <SectionPliableMobile kicker={SURTITRE_TEXTE} titre={TITRE_TEXTE}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {/* L'en-tête d'origine, masqué sur téléphone : la bascule porte le
            titre, et jamais les deux à la fois. Le `display: none` tombe sur CE
            conteneur et non sur ses deux enfants, pour qu'il ne laisse derrière
            lui ni boîte vide ni gouttière de flex. */}
        <div className={replis.enTeteBureau}>
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: 14,
            }}
          >
            {SURTITRE_TEXTE}
          </div>
          <h2
            style={{
              font: "600 calc(clamp(28px,3vw,44px) * var(--ts))/1.08 var(--ft)",
              letterSpacing: "-.045em",
              margin: 0,
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            {TITRE_TEXTE}
          </h2>
        </div>
        <Link
          href="/implantations/"
          style={{ font: "600 14.5px var(--fb)", color: "#ff7c3c" }}
        >
          Toutes nos implantations &rarr;
        </Link>
      </div>

      {/* Rail à défilement horizontal. La liste est écrite DEUX FOIS, comme la
          maquette (3834 px de défilement pour 1280 px visibles) : le moteur de
          `components/site/Moteurs.tsx` revient à zéro quand il atteint la fin,
          et sans ce second exemplaire la coupure se voit. Le doublon est
          décoratif, d'où `aria-hidden` et `tabIndex={-1}` : même traitement que
          `MarqueeClients`, rien n'est annoncé ni atteint deux fois. */}
      <div
        className="mg-autorail"
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          scrollbarWidth: "none",
          padding: "0 40px",
        }}
      >
        {[0, 1].flatMap((passe) =>
          hubs.map((hub) => {
            /* La photo est lue à la clé `ville`, jamais écrite dans la carte :
               huit hubs en ont une, Metz et Dijon non. Voir `photos-hubs.ts`. */
            const photo = PHOTO_DU_HUB[hub.ville];
            return (
            <Link
              key={`${hub.chemin}-${passe}`}
              href={hub.chemin}
              className={styles.carte}
              aria-hidden={passe === 1 || undefined}
              tabIndex={passe === 1 ? -1 : undefined}
              style={{
                position: "relative",
                flex: "none",
                width: 300,
                height: 400,
                borderRadius: "var(--rad)",
                overflow: "hidden",
                background: "#1c1b19",
                transition: "transform var(--tr)",
              }}
            >
              {photo ? (
                <Image
                  src={photo}
                  alt={passe === 0 ? (hub.alt ?? "") : ""}
                  fill
                  sizes="(max-width: 760px) 86vw, 320px"
                  style={{
                    objectFit: "cover",
                    objectPosition: hub.cadrage ?? "center",
                    display: "block",
                    filter: "saturate(var(--sat)) contrast(1.04)",
                  }}
                />
              ) : (
                <span aria-hidden="true" style={PANNEAU_SANS_PHOTO} />
              )}
              <div style={PANCARTE}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: "#fff",
                    color: "#ff7c3c",
                    font: "600 12px var(--fb)",
                    marginBottom: 10,
                  }}
                >
                  {hub.ville}
                </span>
                <div
                  style={{
                    font: "600 19px/1.25 var(--ft)",
                    letterSpacing: "-.02em",
                    color: "#fff",
                  }}
                >
                  {hub.titre}
                </div>
                <div
                  style={{
                    font: "400 13px/1.45 var(--fb)",
                    color: "rgba(255,255,255,.78)",
                    marginTop: 4,
                  }}
                >
                  {hub.couverture}
                </div>
                <div
                  style={{
                    font: "600 13px var(--fb)",
                    color: "#ff7c3c",
                    marginTop: 10,
                  }}
                >
                  Voir le hub &rarr;
                </div>
              </div>
            </Link>
            );
          }),
        )}
      </div>
      </SectionPliableMobile>
    </section>
  );
}
