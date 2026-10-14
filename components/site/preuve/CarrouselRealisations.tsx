import Image from "next/image";
import type { CSSProperties } from "react";

import { altPhoto } from "@/lib/descriptions-photos";

import type { CarteRealisation } from "./donnees-mobiles";
import styles from "./PagePreuve.module.css";

/**
 * « D’AUTRES RÉALISATIONS », LE CARROUSEL DE LA MAQUETTE MOBILE V2.
 *
 * Relevé dans `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` :
 *   L457  `refsSec(t)` : une section claire (`isPlain`, `C_LIGHT`, marge
 *         `14px 18px 0`, rembourrage 18 px, rayon 22 px) qui porte le titre
 *         et le bloc `hasRefs` ;
 *   L469, L482  le titre, « D’autres réalisations » sur le gabarit 02, posé
 *         après les sections du corpus quand la page n'a pas de FAQ ;
 *   L131  le bloc `hasRefs`, recopié ci-dessous valeur pour valeur : une
 *         rangée de logos (seulement s'il y en a plus d'un, `hasRefLogos`),
 *         puis les cartes photo + logo client, 236 px de large, défilant à
 *         l'horizontale avec aimantation (`scroll-snap-type: x mandatory`).
 *
 * TROIS ÉCARTS, déclarés :
 *   1. La photo est un `next/image` et non un fond CSS : formats modernes et
 *      chargement différé, sans rien changer au dessin. Elle vient du site
 *      (`donnees-mobiles.ts`), pas du tirage par empreinte de la maquette.
 *   2. Le logo reste un fond CSS sous `role="img"`, comme la maquette : il
 *      n'est téléchargé que s'il est peint, donc jamais sur bureau.
 *   3. La barre de défilement est masquée par la règle déjà posée dans
 *      `app/globals.css` sur tout `overflow-x:auto` (l'équivalent de la
 *      classe `mv-scroll` de la maquette, L25).
 *
 * MOBILE SEULEMENT : `data-mobile-seulement`, masqué au-dessus de 880 px par
 * `app/globals.css`. Les captures de bureau de ce gabarit n'ont pas ce bloc.
 *
 * COMPOSANT SERVEUR : ni état, ni événement, le défilement est natif.
 */

/** dc.html L469 : le titre de la section sur le gabarit 02. */
export const TITRE_REALISATIONS = "D’autres réalisations";
/** dc.html L131 : le lien de chaque carte. */
export const LIRE_LE_CAS = "Lire le cas →";

/* dc.html L415 (`base`) et L457 : section claire de la maquette. */
const SECTION: CSSProperties = {
  margin: "14px 18px 0",
  padding: 18,
  borderRadius: 22,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.08)",
};

/* dc.html L131 : le `<h2>` d'une section claire. */
const TITRE: CSSProperties = {
  margin: "0 0 12px",
  font: "600 20px/1.2 var(--ft)",
  letterSpacing: "-.03em",
  color: "#1c1b19",
  textWrap: "balance",
};

const BLOC: CSSProperties = { margin: "4px 0 12px" };

/* La rangée de logos. Les marges négatives de 16 px font courir la rangée
   jusqu'au bord de la carte, comme dans la maquette. */
const RANGEE_LOGOS: CSSProperties = {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  margin: "0 -16px 12px",
  padding: "0 16px 2px",
};

const CASE_LOGO: CSSProperties = {
  flex: "none",
  width: 96,
  height: 46,
  borderRadius: 12,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.08)",
  display: "grid",
  placeItems: "center",
};

const RANGEE_CARTES: CSSProperties = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  margin: "0 -16px",
  padding: "0 16px 4px",
};

const CARTE: CSSProperties = {
  flex: "none",
  width: 236,
  scrollSnapAlign: "start",
  display: "flex",
  flexDirection: "column",
  borderRadius: 18,
  overflow: "hidden",
  background: "#fff",
  border: "1px solid rgba(28,27,25,.08)",
  textDecoration: "none",
};

const CADRE: CSSProperties = {
  position: "relative",
  display: "block",
  height: 132,
  background: "#dcdde0",
};

const PASTILLE_LOGO: CSSProperties = {
  position: "absolute",
  left: 10,
  bottom: 10,
  height: 30,
  padding: "0 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,.95)",
  display: "flex",
  alignItems: "center",
};

const CLIENT_SANS_LOGO: CSSProperties = {
  font: "600 11px var(--fb)",
  color: "#1c1b19",
  whiteSpace: "nowrap",
};

const CORPS: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "12px 13px 14px",
};

const CLIENT: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#77736d",
};

const TITRE_CARTE: CSSProperties = {
  font: "600 14px/1.35 var(--ft)",
  letterSpacing: "-.015em",
  color: "#1c1b19",
};

const LIEN: CSSProperties = {
  font: "600 12.5px var(--fb)",
  color: "#b4490f",
};

function logoEnFond(
  logo: string,
  inverse: boolean,
  largeur: number,
  hauteur: number,
): CSSProperties {
  return {
    display: "block",
    width: largeur,
    height: hauteur,
    background: `center/contain no-repeat url("${logo}")`,
    filter: inverse ? "invert(1) hue-rotate(180deg)" : "none",
  };
}

export default function CarrouselRealisations({
  cartes,
}: {
  cartes: readonly CarteRealisation[];
}) {
  if (cartes.length === 0) return null;
  /* dc.html L429-430 : un logo par client, sans doublon ; la rangée ne se
     montre qu'au-delà d'un logo (`hasRefLogos: refLogos.length > 1`). */
  const logos = cartes.filter(
    (c, i) => c.logo && cartes.findIndex((d) => d.logo === c.logo) === i,
  );

  return (
    <section
      data-mobile-seulement=""
      data-realisations-mobiles=""
      aria-label={TITRE_REALISATIONS}
      style={SECTION}
    >
      <h2 className={styles.titreCarrousel} style={TITRE}>
        {TITRE_REALISATIONS}
      </h2>
      <div style={BLOC}>
        {logos.length > 1 ? (
          <div style={RANGEE_LOGOS}>
            {logos.map((c) => (
              <span key={c.logo} style={CASE_LOGO}>
                <span
                  role="img"
                  aria-label={c.client}
                  style={logoEnFond(c.logo, c.logoInverse, 66, 24)}
                />
              </span>
            ))}
          </div>
        ) : null}
        <div style={RANGEE_CARTES}>
          {cartes.map((c) => (
            <a key={c.url} href={c.url} style={CARTE}>
              <span style={CADRE}>
                {c.photo ? (
                  <Image
                    src={c.photo}
                    alt={altPhoto(c.photo)}
                    fill
                    sizes="236px"
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
                <span style={PASTILLE_LOGO}>
                  {c.logo ? (
                    <span
                      role="img"
                      aria-label={c.client}
                      style={logoEnFond(c.logo, c.logoInverse, 64, 16)}
                    />
                  ) : (
                    <span style={CLIENT_SANS_LOGO}>{c.client}</span>
                  )}
                </span>
              </span>
              <span style={CORPS}>
                <span style={CLIENT}>{c.client}</span>
                <span style={TITRE_CARTE}>{c.titre}</span>
                <span style={LIEN}>{LIRE_LE_CAS}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
