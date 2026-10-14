import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FilArianeVue } from "@/components/cocon/FilAriane";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import {
  BOUTON_HERO,
  CHAPEAU_HERO,
  HERO,
  HERO_GRILLE,
  HERO_MENTION,
  HERO_RANGEE_BOUTONS,
  HERO_RANGEE_PASTILLE,
  PASTILLE,
  PASTILLE_PUCE,
  TITRE1,
} from "@/components/site/offre/habillage-offre";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import TelephoneHeros from "@/components/site/offre/TelephoneHeros";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";

import { etapesDe } from "./fil-ariane-mobile";
import stylesVille from "./PageVille.module.css";

/**
 * « 01 Héros » des gabarits 04 Ville, 06 Département et du hub
 * `/implantations/`, rendu de bureau inchangé (capture de chaque page) ET haut
 * de page de la maquette mobile v2 sous 881 px (dc.html L104 à L111, L125) :
 *
 *   fil d'Ariane · photo · sur-titre · H1 · [action | téléphone] ·
 *   « Départements couverts » (hubs) · chapô · mention des horaires
 *
 * L'ordre du DOM reste celui de la capture de bureau (chapô AVANT les
 * boutons) : c'est le socle partagé (`data-heros-*`, `app/globals.css`) qui
 * remet la colonne dans l'ordre de la maquette au téléphone.
 *
 * CE QUI N'EXISTE QUE SOUS 881 PX (`data-mobile-seulement`, rien ne change
 * au-dessus) : le fil d'Ariane, la photo, le téléphone, la boîte
 * « Départements couverts ». LA PHOTO EST CELLE QUE LA PAGE PORTE DÉJÀ sur
 * bureau, dans son hub local (`hubLocal.photo`, présente sur les 74 pages) :
 * c'est la photo de la ville que la maquette met en tête (`_ph`, dc.html
 * L421 : `heroSrc` des gabarits 04 et 06), jamais une nouvelle. Sans photo
 * de ville dans la maquette, celle de la rubrique : `PageVille` choisit.
 *
 * L'ACTION QUI VISE UNE ANCRE EST UN `<a>`, PAS UN `<Link>` : le routeur de
 * Next pose l'ancre par `history.pushState`, qui ne met pas à jour `:target`,
 * et le panneau `#besoin`, masqué au téléphone, ne se rouvrirait pas. Même
 * balise, même dessin : le bureau ne voit aucune différence.
 */
export interface ProprietesHerosVille {
  titre: string;
  pastille?: string;
  chapeau?: string;
  actions: readonly { libelle: string; href: string }[];
  mention?: string;
  /** Le chemin de la page : fil d'Ariane et boîte des pages filles, au téléphone. */
  chemin?: string;
  /** La photo de tête du téléphone, une photo que la page porte déjà. */
  photo?: string | null;
  /** Le panneau de formulaire de bureau, colonne droite. Absent : une colonne. */
  panneau?: ReactNode;
  /**
   * Au téléphone, le chapô SOUS le H1 et avant les boutons : le corpus le
   * déclare en sous-titre du héros (`**Sous-titre** :`, `hero.sub` de la
   * maquette, Bordeaux). Sinon il suit les boutons (`P.intro`).
   */
  chapeauHaut?: boolean;
  /**
   * Le sur-titre du gabarit dans la maquette mobile (`KICK` de dc.html :
   * « Implantation », « Département »). Présent, il remplace la pastille de
   * bureau sous 881 px ; au-dessus, rien ne change.
   */
  surtitreMobile?: string;
}

export default function HerosVille({
  titre,
  pastille,
  chapeau,
  actions,
  mention,
  chemin,
  photo,
  panneau,
  chapeauHaut,
  surtitreMobile,
}: ProprietesHerosVille) {
  const etapes = chemin ? etapesDe(chemin) : [];
  return (
    <section className={stylesVille.herosVille} style={HERO}>
      {/* Le fil d'Ariane de la maquette (dc.html L104), au-dessus de tout. */}
      {etapes.length > 0 ? (
        <div data-mobile-seulement="" className={stylesVille.filMobile}>
          <FilArianeVue etapes={etapes} />
        </div>
      ) : null}
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: panneau ? HERO_GRILLE : "minmax(0,1fr)",
          gap: 52,
          alignItems: "start",
        }}
      >
        <div data-heros-colonne="">
          {photo ? (
            <div data-heros-photo="" data-mobile-seulement="">
              <Image
                src={photo}
                alt={altPhoto(photo)}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 880px) 100vw, 1px"
                unoptimized={photo.startsWith("http")}
                style={{ objectFit: "cover", objectPosition: cadragePhoto(photo, 16 / 10) }}
              />
            </div>
          ) : null}
          {surtitreMobile ? (
            <div data-heros-pastille="" data-mobile-seulement="" style={HERO_RANGEE_PASTILLE}>
              <span style={PASTILLE}>{surtitreMobile}</span>
            </div>
          ) : null}
          {pastille ? (
            <div
              data-heros-pastille=""
              className={surtitreMobile ? stylesVille.pastilleBureau : undefined}
              style={HERO_RANGEE_PASTILLE}
            >
              <span style={PASTILLE}>
                <span aria-hidden="true" style={PASTILLE_PUCE} />
                {pastille}
              </span>
            </div>
          ) : null}
          <h1 style={TITRE1}>{titre}</h1>
          {chapeau ? (
            <p data-heros-chapeau="" className={chapeauHaut ? stylesVille.chapeauHaut : undefined} style={CHAPEAU_HERO}>
              <TexteRiche texte={chapeau} />
            </p>
          ) : null}
          {actions.length > 0 ? (
            <div data-heros-boutons="" style={HERO_RANGEE_BOUTONS}>
              {actions.map((action) =>
                action.href.startsWith("#") ? (
                  <a key={action.href} href={action.href} className={stylesOffre.boutonPrincipal} style={BOUTON_HERO}>
                    {action.libelle}
                  </a>
                ) : (
                  <Link
                    key={action.href}
                    href={action.href}
                    prefetch={false}
                    className={stylesOffre.boutonPrincipal}
                    style={BOUTON_HERO}
                  >
                    {action.libelle}
                  </Link>
                ),
              )}
              <TelephoneHeros />
            </div>
          ) : (
            <div data-heros-boutons="" data-mobile-seulement="" style={HERO_RANGEE_BOUTONS}>
              <TelephoneHeros />
            </div>
          )}
          {/* Maquette mobile, boîte HAUTE du maillage (dc.html L125, kidsTop) :
              « Départements couverts » pour les pages qui ont des enfants dans
              l'index (les hubs : Lyon en a 5). Elle porte elle-même
              `data-mobile-seulement` ; sous les boutons au téléphone. */}
          {chemin ? <PastillesCocon chemin={chemin} variante="enfants" /> : null}
          {mention ? (
            <p data-heros-mention="" style={HERO_MENTION}>
              {mention}
            </p>
          ) : null}
        </div>
        {panneau}
      </div>
    </section>
  );
}
