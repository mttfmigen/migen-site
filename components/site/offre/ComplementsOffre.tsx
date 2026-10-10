import type { CSSProperties } from "react";

import { LARGEUR, VERRE } from "@/components/site/blocs/habillage";
import type { BlocComplement } from "@/types/offre";

/**
 * Écran « Complément N » de la maquette, porté le 07/10 depuis
 * `maquette/rendu/offres--residence--prestataire-ou-salarie.html`
 * (`data-screen-label="Complément 4"`, blocs 540 à 550).
 *
 * POURQUOI CE COMPOSANT N'EXISTAIT PAS. Les six offres NOMMÉES
 * (`/offres/residence/`, `/offres/zero-arret/`, …) n'ont pas cet écran : la
 * page pilote validée le 06/10 rend 17 sections, sans lui. Les SOUS-pages du
 * gabarit 03 en ont un ou deux : la maquette y verse la prose de la section du
 * corpus dont elle a déjà pris le tableau ailleurs (ici le titre H3 et les
 * deux paragraphes de « ## L'offre », dont les sept lignes de tableau sont
 * rendues par `PointsOffre`). Sans cet écran, ce texte payé disparaissait.
 *
 * MODIFICATION D'UN COMPOSANT PARTAGÉ PAR LES 22 PAGES : ajout seul, aucune
 * retouche des composants existants. Sans donnée, rien n'est rendu, donc les
 * 21 autres pages ne bougent pas.
 *
 * LA MAQUETTE N'A QU'UN EMPLACEMENT MONTÉ ICI, celui de « Complément 4 »,
 * entre la bande d'appel de l'offre et le déroulé. `/offres/residence/cahier-des-charges/`
 * en déclare un second (« Complément 5 », après le déroulé) : ce sera UNE
 * ligne de plus dans `PageOffre`, à ajouter par la page qui en a besoin, pas
 * un champ mort posé d'avance.
 */

export interface ProprietesComplementsOffre {
  blocs: readonly BlocComplement[];
}

const SECTION_COMPLEMENT: CSSProperties = { padding: "48px 0 0" };

/** Bloc 542 : la carte en verre, en colonnes qui se replient à 420 px. */
const CARTE: CSSProperties = {
  ...VERRE,
  padding: "30px 34px 14px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
  gap: "4px 44px",
};

/** Bloc 546 : le filet orange et le titre, alignés sur la ligne de base. */
const RANGEE_TITRE: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "baseline",
  marginBottom: 10,
};

const FILET: CSSProperties = {
  width: 16,
  height: 3,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "0 0 auto",
  transform: "translateY(-4px)",
};

const TITRE: CSSProperties = {
  font: "600 17px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  margin: 0,
};

const TEXTE: CSSProperties = {
  font: "400 15.5px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "66ch",
  textWrap: "pretty",
};

/* Blocs 628 à 639 : la variante À COCHES du même bloc, relevée le 07/10 sur
   `maquette/rendu/offres--residence--cahier-des-charges.html` (« Complément 5 »,
   « Les 4 erreurs qui coûtent cher »). Même carte, même titre, corps en liste. */
const LISTE: CSSProperties = { display: "grid", gap: 10 };

const PUCE: CSSProperties = {
  display: "flex",
  gap: 11,
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const COCHE: CSSProperties = {
  /* La coche porte du sens, elle n'est pas un ornement : 2,45:1 en `--acc`
     sur la carte claire, 8,57:1 en `--acc-ink`. */
  color: "var(--acc-ink)",
  flex: "0 0 auto",
  fontWeight: 600,
};

const ACCROCHE: CSSProperties = { fontWeight: 600, color: "var(--ink)" };

export default function ComplementsOffre({
  blocs,
}: ProprietesComplementsOffre) {
  const retenus = blocs.filter(
    (bloc) => !!bloc.titre || !!bloc.texte || !!bloc.puces?.length,
  );
  if (retenus.length === 0) return null;

  return (
    <section style={SECTION_COMPLEMENT}>
      <div style={LARGEUR}>
        <div style={CARTE}>
          {retenus.map((bloc, rang) => (
            <div
              key={bloc.titre ?? `${rang}`}
              style={{ minWidth: 0, paddingBottom: 18 }}
            >
              {bloc.titre ? (
                <div style={RANGEE_TITRE}>
                  <span aria-hidden="true" style={FILET} />
                  <h3 style={TITRE}>{bloc.titre}</h3>
                </div>
              ) : null}
              {bloc.texte ? <p style={TEXTE}>{bloc.texte}</p> : null}
              {bloc.puces?.length ? (
                <div style={LISTE}>
                  {bloc.puces.map((puce) => (
                    <div key={puce.accroche ?? puce.texte} style={PUCE}>
                      {/* Masquée aux technologies d'assistance : la coche est
                          un ornement de liste, elle n'énonce rien. */}
                      <span aria-hidden="true" style={COCHE}>
                        ✓
                      </span>
                      <span>
                        {puce.accroche ? (
                          <strong style={ACCROCHE}>{puce.accroche}</strong>
                        ) : null}
                        {puce.accroche ? " " : null}
                        {puce.texte}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
