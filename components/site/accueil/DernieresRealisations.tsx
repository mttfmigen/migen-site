import Image from "next/image";
import replis from "./replis-accueil.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import styles from "./DernieresRealisations.module.css";

import { altPhoto } from "@/lib/descriptions-photos";
import { photoDeLaPage } from "@/lib/photo-par-page";

export interface Realisation {
  /** Lien vers la fiche de la réalisation. */
  href: string;
  /** Visuel de couverture : chemin public (« /assets/web/… ») ou URL. */
  image: string;
  /**
   * Forçage seulement. Sans valeur, la description du registre de la photo
   * servie (`altPhoto`) : décorative sur la maquette, la vignette était servie
   * avec `alt=""` jusqu'au 14/10, alors que la photo vient du registre et y a
   * sa description.
   */
  alt?: string;
  /** Client et offre, en une ligne : « SUEZ IWT · migen© Résidence ». */
  client: string;
  titre: string;
  /** Mois et année, déjà formatés : « Février 2026 ». */
  date: string;
}

interface Proprietes {
  realisations?: Realisation[];
  hrefToutes?: string;
}

/**
 * Les trois fiches de la maquette, reprises mot pour mot. La maquette les fait
 * pointer sur « # » : chacune mène ici à son étude de cas.
 */
const REALISATIONS_DECLAREES: Realisation[] = [
  {
    href: "/preuves/suez-remise-en-etat/",
    image: "/assets/web/ph-tuyaux.jpg",
    client: "SUEZ IWT · migen© Résidence",
    titre: "Remise en état complète d'un site industriel",
    date: "Février 2026",
  },
  {
    href: "/preuves/danone-lignes-de-production/",
    image: "/assets/web/sv-armoire.jpg",
    client: "DANONE · migen© Résidence",
    titre: "Maintenance en continu des lignes de production",
    date: "Février 2026",
  },
  {
    href: "/preuves/jtekt/",
    image: "/assets/web/x-cimenterie.jpg",
    client: "JTEKT · migen© Résidence",
    titre: "Sécuriser la maintenance de ses installations",
    date: "Janvier 2026",
  },
];

/*
 * CHAQUE CARTE MONTRE LA PHOTO DE LA PAGE QU'ELLE OUVRE, depuis le 12/10.
 *
 * Mehdi : « les photos ne correspondent pas aux photos du cas », « les bento
 * ne changent pas d'image ». Mesure du même jour : 46 images venaient de
 * `/assets/web/`, écrites en dur, et quatre d'entre elles couvraient quatre
 * des six pages de hub. La répartition du registre ne les voyait pas, elle ne
 * travaille que sur les fiches.
 *
 * `photoDeLaPage` rend la première photo du registre que la page cible sert
 * elle-même. L'image déclarée reste le repli : une page sans photo du
 * registre garde celle de la maquette plutôt qu'un trou.
 */
const REALISATIONS_MAQUETTE: Realisation[] = REALISATIONS_DECLAREES.map((r) => ({
  ...r,
  image: photoDeLaPage(r.href) ?? r.image,
}));

/* Le sur-titre et le titre, écrits une seule fois : l'en-tête d'origine tient
   le dessin de bureau, la bascule de repli porte le titre sur téléphone, et
   `replis-accueil.module.css` n'en montre jamais qu'un des deux. */
const SURTITRE_TEXTE = "Nos dernières réalisations";
const TITRE_TEXTE = "Ce que nous avons fait, chez qui, et comment";

export default function DernieresRealisations({
  realisations = REALISATIONS_MAQUETTE,
  hrefToutes = "/preuves/",
}: Proprietes) {
  return (
    <section className={replis.repli} style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <SectionPliableMobile kicker={SURTITRE_TEXTE} titre={TITRE_TEXTE}>
        <div data-reveal=""
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
            marginBottom: 38,
            flexWrap: "wrap",
          }}
        >
            {/* L'en-tête d'origine, masqué sur téléphone : la bascule porte
                le titre, et jamais les deux à la fois. Le `display: none` tombe
                sur CE conteneur et non sur ses deux enfants, pour qu'il ne
                laisse derrière lui ni boîte vide ni gouttière de flex. */}
          <div className={replis.enTeteBureau}>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 16,
              }}
            >
              {SURTITRE_TEXTE}
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: 0,
                maxWidth: "24ch",
                textWrap: "balance",
              }}
            >
              {TITRE_TEXTE}
            </h2>
          </div>
          <a
            href={hrefToutes}
            style={{
              font: "600 15px var(--fb)",
              color: "var(--acc)",
              flex: "none",
              paddingBottom: 6,
            }}
          >
            Voir toutes nos réalisations →
          </a>
        </div>

        <div
          data-reveal="" className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          {realisations.map((r) => (
            <a
              key={r.href + r.titre}
              href={r.href}
              className={styles.carte}
              style={{
                display: "block",
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: "var(--rad)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 210,
                  background: "var(--ph)",
                  overflow: "hidden",
                }}
              >
                {/* `fill` plutôt que des dimensions : la vignette occupe toute
                    la carte, sa taille rendue dépend de la colonne. `sizes`
                    évite de servir une image pleine largeur dans une carte de
                    380px. Le parent porte `position: relative`, sans quoi
                    l'image se placerait par rapport à la page. */}
                <Image
                  src={r.image}
                  alt={r.alt ?? altPhoto(r.image)}
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 380px"
                  style={{
                    objectFit: "cover",
                    filter: "saturate(var(--sat)) contrast(1.05)",
                    opacity: "var(--ph-op)",
                  }}
                />
              </div>
              <div style={{ padding: "24px 26px 28px" }}>
                <div
                  style={{
                    font: "600 11.5px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                  }}
                >
                  {r.client}
                </div>
                <div
                  style={{
                    font: "600 19px/1.3 var(--ft)",
                    letterSpacing: "-.025em",
                    marginTop: 12,
                  }}
                >
                  {r.titre}
                </div>
                <div
                  style={{
                    font: "400 13.5px var(--fb)",
                    color: "var(--ink4)",
                    marginTop: 14,
                  }}
                >
                  {r.date}
                </div>
              </div>
            </a>
          ))}
        </div>
        </SectionPliableMobile>
      </div>
    </section>
  );
}
