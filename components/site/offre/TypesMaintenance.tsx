import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type { CarteTypeMaintenance } from "@/types/offre";

import { numerote } from "./texte-offre";

/**
 * Écran « 02 Types de maintenance » de la maquette, relevé le 07/10 sur
 * `maquette/rendu/offres--full-service.html` (bloc 346, rendu vivant :4352).
 *
 * LE PREMIER PORTAGE ÉTAIT FAUX : il rendait quatre cartes-photos en grille
 * avec un lien « Découvrir → », d'après un relevé erroné du bloc 346. La
 * capture rend tout autre chose : un grand panneau sombre à gauche (surtitre
 * orange et H2 blanc superposés en bas) et, à droite, quatre rangées
 * numérotées 01 à 04 séparées par des filets, chacune avec son bouton rond à
 * flèche et une barre beige sous le texte. Aucun libellé « Découvrir ».
 *
 * LA PHOTO DU PANNEAU, servie en `blob:` par la maquette (alt « Technicien
 * migen en intervention »), est identifiée le 08/10 par ses octets : lus par
 * XHR dans le cadre de la maquette vivante, leur sha256 est celui de
 * `public/assets/web/mq-17e2f3bce95f.jpg`. Ce n'est pas une association
 * choisie, c'est son fichier. Rendue comme la capture : plein cadre, `cover`,
 * `saturate(var(--sat))`, sous le voile.
 *
 * LA BARRE BEIGE de chaque rangée porte, dans la capture, une étiquette VIDE
 * (bloc 363, `sc-interp` sans texte). Elle se rend donc vide, comme relevée.
 *
 * LE SURVOL DES RANGÉES n'est pas porté : la capture déclare
 * `transition: background-color` (classe `scpz`) mais la valeur survolée
 * n'apparaît dans aucune source de la maquette. Rien n'est inventé.
 *
 * UNE CIBLE QUI N'EST PAS UN CHEMIN INTERNE FAIT DISPARAÎTRE LA RANGÉE, elle
 * n'est pas rafistolée vers une cible de repli : même règle que `LiensOffre`.
 */

export interface ProprietesTypesMaintenance {
  titre: string;
  cartes: readonly CarteTypeMaintenance[];
}

/* Bloc 348 de la capture. `mg-r2` replie en une colonne sous 900px. */
const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)",
  gap: 48,
  alignItems: "stretch",
};

/* Bloc 349 : le panneau photo, fond sombre sous l'image. */
const PANNEAU_PHOTO: CSSProperties = {
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  minHeight: 440,
  background: "rgb(28,27,25)",
};

/* Bloc 351 : le voile qui assoit le texte blanc sur la photo. */
const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top,rgba(18,17,16,.92) 0%,rgba(18,17,16,.35) 55%,rgba(18,17,16,.05) 100%)",
};

/* Bloc 352 : surtitre et H2 superposés en bas du panneau. */
const LEGENDE: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  padding: 34,
};

/* Bloc 354. */
const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  color: "#fff",
  maxWidth: "18ch",
  textWrap: "balance",
};

/* Bloc 355 : la colonne des rangées. */
const LISTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  borderTop: "1px solid var(--line)",
};

/* Bloc 357 : une rangée, lien entier. */
const RANGEE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "40px minmax(0,1fr) 36px",
  gap: 18,
  alignItems: "start",
  padding: "26px 6px",
  borderBottom: "1px solid var(--line)",
  color: "var(--ink)",
  transition: "background-color var(--tr)",
};

/* Bloc 358. */
const NUMERO: CSSProperties = {
  font: "600 12px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  paddingTop: 5,
};

/* Bloc 359. */
const COLONNE_TEXTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minWidth: 0,
};

/* Bloc 360. */
const TITRE_RANGEE: CSSProperties = {
  font: "600 calc(21px * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.03em",
  margin: 0,
};

/* Bloc 361. */
const PHRASE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  maxWidth: "56ch",
};

/* Bloc 362 : la barre beige pleine largeur sous le texte. */
const BARRE: CSSProperties = {
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  gap: 4,
  marginTop: 6,
  padding: "11px 14px",
  borderRadius: 14,
  background: "var(--acc-w)",
  font: "500 13px/1.45 var(--fb)",
  color: "var(--ink1)",
};

/* Bloc 363 : son étiquette, vide dans la capture. */
const BARRE_ETIQUETTE: CSSProperties = {
  font: "600 10px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  color: "var(--acc-ink)",
};

/* Bloc 364 : le bouton rond à flèche. */
const FLECHE: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "var(--chip)",
  color: "var(--ink)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  font: "600 15px var(--fb)",
  marginTop: 2,
};

export default function TypesMaintenance({
  titre,
  cartes,
}: ProprietesTypesMaintenance) {
  const retenues = cartes.filter(
    (carte) => !!carte.titre && estCheminInterne(carte.href),
  );
  if (retenues.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={GRILLE}>
          <div style={PANNEAU_PHOTO}>
            <Image
              src="/assets/web/mq-17e2f3bce95f.jpg"
              alt="Technicien migen en intervention"
              fill
              sizes="(max-width: 900px) 100vw, 520px"
              style={{ objectFit: "cover", filter: "saturate(var(--sat))" }}
            />
            <div style={VOILE} />
            <div style={LEGENDE}>
              <div style={{ ...SURTITRE, marginBottom: 14 }}>
                Types de maintenance
              </div>
              <h2 style={TITRE}>{titre}</h2>
            </div>
          </div>
          <div style={LISTE}>
            {retenues.map((carte, rang) => (
              <Link
                key={carte.href}
                href={carte.href}
                prefetch={false}
                style={RANGEE}
              >
                <span style={NUMERO}>{numerote(rang)}</span>
                <span style={COLONNE_TEXTE}>
                  <h3 style={TITRE_RANGEE}>{carte.titre}</h3>
                  {carte.phrase ? (
                    <span style={PHRASE}>{carte.phrase}</span>
                  ) : null}
                  <span style={BARRE}>
                    <span style={BARRE_ETIQUETTE} />
                  </span>
                </span>
                <span aria-hidden="true" style={FLECHE}>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
