import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import type { LienOffre, RealisationOffre } from "@/types/offre";

import styles from "./DernieresRealisations.module.css";

/**
 * « Nos dernières réalisations », bloc de la maquette (`site-final.html`,
 * l. 4429 à 4465) : un en-tête à deux pôles (surtitre, H2, lien à droite) puis
 * trois cartes à photo de 210 px.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * UN SEUL COMPOSANT POUR L'ACCUEIL ET POUR LES PAGES D'OFFRE.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Il y avait un second composant, `components/site/offre/Realisations.tsx`, qui
 * réécrivait ce bloc de bout en bout : même section de maquette, mêmes chaînes de
 * style au caractère, même H2, même lien d'en-tête, mêmes trois clients. Et il
 * était le plus faible des deux : carte en `<div>` portant un `display:block`
 * inopérant, survol de la maquette (translation et ombre portée) abandonné.
 * Il est supprimé. Les pages d'offre montent celui-ci, avec leur propre jeu de
 * cartes.
 *
 * L'ITEM EST `RealisationOffre` (`types/offre.ts`), le contrat du `jsonb` : une
 * seule forme pour la donnée de la maquette et pour celle de la base. `image` et
 * `href` y sont FACULTATIFS, et ce n'est pas un confort :
 *
 *   · `image` manque quand le fichier n'est pas au dépôt. `x-faisceaux.jpg`, que
 *     la maquette met sur la première carte, n'y est pas. La carte rend alors son
 *     texte SANS le cadre de 210 px : un aplat gris entre deux cartes
 *     photographiées se lit comme une image cassée, pas comme un parti pris.
 *   · `href` manque sur les pages d'offre : la maquette y navigue par
 *     `onClick="{{ goFiche }}"` et ne nomme AUCUNE URL d'étude de cas pour ces
 *     trois clients. Un `href="#"` serait un bouton mort, et pointer sur l'étude
 *     d'un autre client serait une association fausse. La carte devient alors un
 *     `<article>`, et le survol ne s'applique pas : il n'a de sens que sur un
 *     élément cliquable. La navigation passe par le lien d'en-tête, qui a bien
 *     une cible.
 *
 * LES CIBLES NE SONT PAS FILTRÉES ICI. Sur l'accueil elles sont écrites dans ce
 * fichier ; sur une page d'offre elles viennent du `jsonb`, et `PageOffre` les
 * passe par `lienSur` / `cibleSure` avant de les confier à ce composant, comme
 * pour tous ses autres liens.
 */
interface Proprietes {
  realisations?: readonly RealisationOffre[];
  /** Surtitre orange en capitales. Par défaut celui de la maquette. */
  surtitre?: string;
  titre?: string;
  /** Le lien d'en-tête, à droite du H2. Absent : rien n'est rendu à sa place. */
  lien?: LienOffre | null;
}

/** Les trois fiches de la maquette, reprises mot pour mot. */
const REALISATIONS_MAQUETTE: readonly RealisationOffre[] = [
  {
    href: "/realisations/",
    image: "/assets/web/ph-tuyaux.jpg",
    surtitre: "SUEZ IWT · migen© Résidence",
    titre: "Remise en état complète d'un site industriel",
    date: "Février 2026",
  },
  {
    href: "/realisations/",
    image: "/assets/web/sv-armoire.jpg",
    surtitre: "DANONE · migen© Résidence",
    titre: "Maintenance en continu des lignes de production",
    date: "Février 2026",
  },
  {
    href: "/realisations/",
    image: "/assets/web/x-cimenterie.jpg",
    surtitre: "JTEKT · migen© Résidence",
    titre: "Sécuriser la maintenance de ses installations",
    date: "Janvier 2026",
  },
];

/** l. 4436, le lien d'en-tête. */
const LIEN_ENTETE = {
  libelle: "Voir toutes nos réalisations →",
  href: "/realisations/",
};

/** l. 4439, la carte : fond plein et bordé, pas en verre. */
const CARTE: CSSProperties = {
  display: "block",
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
};

/**
 * La carte, cliquable ou non selon qu'elle a une cible.
 *
 * L'ombre de repos est la même des deux côtés, mais elle vient de la feuille de
 * style et non d'un style en ligne : un style en ligne l'emporterait sur la
 * règle de survol, qui ne pourrait plus la remplacer.
 */
function Carte({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <article className={styles.carteFixe} style={CARTE}>
        {children}
      </article>
    );
  }
  return (
    <a href={href} className={styles.carte} style={CARTE}>
      {children}
    </a>
  );
}

export default function DernieresRealisations({
  realisations = REALISATIONS_MAQUETTE,
  surtitre = "Nos dernières réalisations",
  titre = "Ce que nous avons fait, chez qui, et comment",
  lien = LIEN_ENTETE,
}: Proprietes) {
  if (realisations.length === 0) return null;

  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
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
          <div>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 16,
              }}
            >
              {surtitre}
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
              {titre}
            </h2>
          </div>
          {lien ? (
            <a
              href={lien.href}
              style={{
                font: "600 15px var(--fb)",
                color: "var(--acc)",
                flex: "none",
                paddingBottom: 6,
              }}
            >
              {lien.libelle}
            </a>
          ) : null}
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
            <Carte key={`${r.surtitre}-${r.titre}`} href={r.href}>
              {/* Le cadre de la photo n'existe que s'il y a une photo : voir
                  l'en-tête de ce fichier. */}
              {r.image ? (
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
                      l'image se placerait par rapport à la page.
                      `alt=""` parce que la photo est décorative : le texte juste
                      dessous nomme déjà le client et la réalisation. */}
                  <Image
                    src={r.image}
                    alt=""
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 380px"
                    style={{
                      objectFit: "cover",
                      filter: "saturate(var(--sat)) contrast(1.05)",
                      opacity: "var(--ph-op)",
                    }}
                  />
                </div>
              ) : null}
              <div style={{ padding: "24px 26px 28px" }}>
                <div
                  style={{
                    font: "600 11.5px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                  }}
                >
                  {r.surtitre}
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
            </Carte>
          ))}
        </div>
      </div>
    </section>
  );
}
