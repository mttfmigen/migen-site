import Link from "next/link";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { cibleSure } from "@/components/site/offre/LiensOffre";
import type {
  SectionCta,
  SectionCtaFinal,
  SectionObjections,
  SectionPreuves,
} from "@/types/contenu";
import type { LienPrestation } from "@/types/prestation";

import {
  ANCRE_FORMULAIRE,
  APPEL_BANDE,
  APPEL_RAPPEL,
  APPEL_TITRE,
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  colonnes,
  ENTETE,
  FINAL_BOUTON_SECONDAIRE,
  FINAL_HALO,
  FINAL_PANNEAU,
  FINAL_SECTION,
  FINAL_TEXTE,
  FINAL_TITRE,
  LARGEUR,
  lienTelephone,
  QUESTION_CARTE,
  QUESTION_INTITULE,
  QUESTION_REPONSE,
  REFERENCE_CARTE,
  REFERENCE_CORPS,
  REFERENCE_LIEN,
  REFERENCE_TEXTE,
  SECTION,
  SURTITRE,
  TITRE2,
  VERRE,
} from "./habillage-prestation";
import styles from "./PagePrestation.module.css";
import { avecTelephone, insecable, phrase, soigne } from "./texte-prestation";

/**
 * Sections 08 à 12 du gabarit PRESTATION.
 *
 * LES TITRES DES BANDES D'APPEL SONT DES H2, là où la maquette met un `div`.
 * C'est le seul écart assumé, et il relève de l'accessibilité que le contrat du
 * projet ajoute à la maquette : une section sans titre de niveau est invisible
 * dans la liste des titres d'un lecteur d'écran. Les valeurs visuelles, elles,
 * sont celles de la maquette au pixel.
 */

/** 08. La bande d'appel de milieu de page, en verre, rayon 36px. */
export function Appel({
  section,
  telephone,
}: {
  section: SectionCta;
  telephone: string;
}) {
  const cible = section.href && cibleSure(section.href) ? section.href : ANCRE_FORMULAIRE;
  return (
    <section style={SECTION} data-section="08-appel">
      <div style={LARGEUR}>
        <div style={APPEL_BANDE}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2 style={APPEL_TITRE}>{insecable(section.question)}</h2>
            {section.rappel ? (
              <div style={APPEL_RAPPEL}>
                {avecTelephone(section.rappel, telephone)}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={cible} className={styles.boutonAction} style={BOUTON_ACTION}>
              {section.bouton}
            </a>
            <a
              href={lienTelephone(telephone)}
              className={styles.boutonSecondaire}
              style={BOUTON_SECONDAIRE}
            >
              {telephone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 09. Les réalisations, en cartes.
 *
 * LE BANDEAU PHOTO DE CHAQUE CARTE N'EST PAS RENDU : le corpus ne porte aucune
 * image, et la maquette donne 330px de haut à la première, 150px aux autres. Un
 * aplat gris de 330px serait pire qu'absent. La maquette fait aussi tenir la
 * première carte sur deux rangées, ce qui n'a de sens qu'avec sa grande photo :
 * sans images, toutes les cartes sont égales.
 *
 * LE NOM DU CLIENT EN SUR-TITRE N'EST PAS RENDU non plus : le corpus ne le
 * porte pas dans un champ à lui. Le déduire du chemin donnerait « GLS
 * MAINTENANCE CURATIVE » pour `/preuves/gls-maintenance-curative/`. Vide plutôt
 * que faux. Les deux manques sont dans `docs/RESERVES-CONTENU.md`.
 */
export function Preuves({ section }: { section: SectionPreuves }) {
  if (!section.preuves?.length) return null;
  return (
    <section style={SECTION} data-section="09-references">
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={SURTITRE}>Nos réalisations</div>
            <h2 style={TITRE2}>Des chantiers réels, datés.</h2>
          </div>
        </div>

        <div className="mg-rmulti" style={colonnes(3, 16)}>
          {section.preuves.map((preuve, i) => {
            const lie = !!preuve.lienHref && cibleSure(preuve.lienHref);
            const corps = (
              <div style={REFERENCE_CORPS}>
                <span
                  style={{
                    font: "600 19px/1.35 var(--ft)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                  }}
                >
                  {insecable(preuve.titre)}
                </span>
                {preuve.texte ? (
                  <span style={REFERENCE_TEXTE}>{phrase(insecable(preuve.texte))}</span>
                ) : null}
                {lie && preuve.lienLibelle ? (
                  <span style={REFERENCE_LIEN}>
                    {insecable(preuve.lienLibelle)}{" "}
                    <span style={{ color: "var(--acc)" }} aria-hidden="true">
                      →
                    </span>
                  </span>
                ) : null}
              </div>
            );

            return lie ? (
              <Link
                key={`preuve-${i}`}
                href={preuve.lienHref as string}
                className={styles.carteReference}
                style={REFERENCE_CARTE}
              >
                {corps}
              </Link>
            ) : (
              <div key={`preuve-${i}`} style={REFERENCE_CARTE}>
                {corps}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * 10. Les objections, en cartes ouvertes sur deux colonnes.
 *
 * RIEN N'EST REPLIÉ, et c'est le choix du client : le script de son propre
 * gabarit le dit (« rien n'est replié ni masqué »), alors que sa règle R11
 * demande un accordéon dès cinq entrées. Entre deux documents du client, c'est
 * le gabarit qui fait foi : il est postérieur et il porte CETTE page.
 *
 * Les questions sont réparties en deux colonnes comme la maquette, la première
 * moitié à gauche : une grille à deux colonnes en flux de rangées donnerait
 * l'ordre visuel 1-2 / 3-4 / 5-6 au lieu de 1-2-3 | 4-5-6.
 */
export function Objections({
  section,
  telephone,
}: {
  section: SectionObjections;
  telephone: string;
}) {
  if (!section.questions?.length) return null;
  const milieu = Math.ceil(section.questions.length / 2);
  const groupes = [
    section.questions.slice(0, milieu),
    section.questions.slice(milieu),
  ].filter((groupe) => groupe.length > 0);

  return (
    <section style={SECTION} data-section="10-questions">
      <div style={LARGEUR}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 30,
          }}
        >
          <div>
            <div style={SURTITRE}>Questions fréquentes</div>
            <h2 style={{ ...TITRE2, margin: 0 }}>Vos objections, nos réponses.</h2>
          </div>
          <div style={{ font: "400 14.5px var(--fb)", color: "var(--ink2)" }}>
            {avecTelephone(`Une autre question ? ${telephone}`, telephone)}
          </div>
        </div>

        <div className="mg-r2" style={{ ...colonnes(groupes.length), alignItems: "start" }}>
          {groupes.map((groupe, c) => (
            <div key={`colonne-${c}`} style={{ display: "grid", gap: 12 }}>
              {groupe.map((q, i) => (
                <div key={`question-${c}-${i}`} style={QUESTION_CARTE}>
                  <h3 style={QUESTION_INTITULE}>{insecable(q.question)}</h3>
                  <p style={QUESTION_REPONSE}>
                    <TexteRiche texte={insecable(q.reponse)} />
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 11. « Pour aller plus loin ».
 *
 * Les vignettes photo de la maquette (120px) ne sont pas rendues, même raison
 * qu'en 09 : le corpus ne porte pas d'image.
 */
export function Maillage({ liens }: { liens?: readonly LienPrestation[] }) {
  const surs = (liens ?? []).filter((l) => l.libelle && cibleSure(l.href));
  if (!surs.length) return null;
  return (
    <section style={SECTION} data-section="11-maillage">
      <div style={LARGEUR}>
        <h2 style={{ ...SURTITRE, margin: "0 0 18px" }}>Pour aller plus loin</h2>
        <div className="mg-rmulti" style={colonnes(3)}>
          {surs.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className={styles.carteMaillage}
              style={{ ...VERRE, borderRadius: 24, overflow: "hidden", display: "flex" }}
            >
              <div
                style={{
                  padding: "18px 20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      font: "600 16px/1.3 var(--ft)",
                      letterSpacing: "-.02em",
                      color: "var(--ink)",
                    }}
                  >
                    {insecable(lien.libelle)}
                  </span>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: "var(--acc)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                      font: "600 13px var(--fb)",
                    }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
                {lien.phrase ? (
                  <span style={{ font: "400 13.5px/1.5 var(--fb)", color: "var(--ink2)" }}>
                    {soigne(lien.phrase)}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 12. L'appel final, panneau anthracite centré à halo. */
export function AppelFinal({
  section,
  telephone,
}: {
  section: SectionCtaFinal;
  telephone: string;
}) {
  const cible = section.href && cibleSure(section.href) ? section.href : ANCRE_FORMULAIRE;
  return (
    <section style={FINAL_SECTION} data-section="12-appel-final">
      <div style={FINAL_PANNEAU}>
        <div style={FINAL_HALO} aria-hidden="true" />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <h2 style={FINAL_TITRE}>{insecable(section.question)}</h2>
          {section.rappel ? (
            <p style={FINAL_TEXTE}>{insecable(section.rappel)}</p>
          ) : null}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <a href={cible} className={styles.boutonAction} style={BOUTON_ACTION}>
              {section.bouton}
            </a>
            <a
              href={lienTelephone(telephone)}
              className={styles.boutonSombre}
              style={FINAL_BOUTON_SECONDAIRE}
            >
              {telephone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
