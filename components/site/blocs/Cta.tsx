import type { SectionCta, SectionCtaFinal } from "@/types/contenu";
import styles from "./Blocs.module.css";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  LARGEUR,
  LUEUR,
  PANNEAU,
  SECTION,
  SURTITRE,
  VERRE,
} from "./habillage";
import SectionPliableMobile from "./SectionPliableMobile";
import TexteRiche from "./TexteRiche";

/**
 * Sections 7 et 10 du gabarit : l'appel à l'action, introduit par une question
 * de besoin, avec le téléphone visible.
 *
 * Un seul fichier pour les deux : même matière, seul l'habillage change. Le CTA
 * de milieu de page est en verre, le final sur le panneau anthracite, pour que
 * la fin de page pèse plus que son milieu. Deux composants jumeaux auraient
 * dérivé l'un de l'autre au premier ajustement.
 */
export default function Cta({
  section,
}: {
  section: SectionCta | SectionCtaFinal;
}) {
  const final = section.type === "ctaFinal";

  return (
    <section
      style={final ? { padding: "var(--sec) 0 var(--sec)" } : SECTION}
      data-bloc={final ? "ctaFinal" : "cta"}
    >
      <div style={LARGEUR}>
        <div
          style={{
            ...(final ? PANNEAU : VERRE),
            borderRadius: 36,
            padding: "40px 44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 36,
            flexWrap: "wrap",
            ...(final ? { position: "relative", overflow: "hidden" } : null),
          }}
        >
          {final ? <div style={LUEUR} /> : null}

          <div
            className={final ? styles.corpusClair : styles.corpus}
            style={{ flex: 1, minWidth: 280, position: "relative" }}
          >
            {/* LE BOUTON NE PART PAS SOUS LE PLI, ET C'EST LE SEUL BLOC OÙ
                QUELQUE CHOSE RESTE DEHORS.

                Le pli ne couvre que ce bloc de texte. Le `<a>` est son FRÈRE
                dans le panneau, quinze lignes plus bas, hors du
                `<SectionPliableMobile>` : il reste donc visible et cliquable,
                replié ou non. Sur un site dont l'objectif numéro un est le
                lead, mettre la conversion derrière un geste de plus serait un
                mauvais calcul, et la règle « replier, jamais retirer » ne
                demande que de garder le TEXTE dans le DOM.

                CE QUI SE REPLIE : le rappel, la phrase la plus longue de la
                section. Le `<h2>` reste dans la bascule, comme dans les sept
                autres blocs : il porte la question de besoin, c'est le titre
                de la section, et une bascule doit annoncer ce qu'elle ouvre.

                UN LIEN NE PEUT PAS ALLER DANS LE `<summary>` : il ouvrirait le
                pli en même temps qu'il navigue, et les deux gestes se
                disputeraient le clic. */}
            <SectionPliableMobile
              enTete={
                <span>
                  <span style={{ ...SURTITRE, marginBottom: 10, display: "block" }}>
                    Prochaine étape
                  </span>
                  <h2
                    style={{
                      font: "600 calc(clamp(22px,2.4vw,32px) * var(--ts))/1.14 var(--ft)",
                      letterSpacing: "-.04em",
                      color: final ? "#fff" : "var(--ink)",
                      margin: "0 0 10px",
                      maxWidth: "26ch",
                      textWrap: "balance",
                    }}
                  >
                    <TexteRiche texte={section.question} />
                  </h2>
                </span>
              }
            >
            {section.rappel ? (
              <p
                style={{
                  font: "400 15px/1.65 var(--fb)",
                  color: final ? "rgba(255,255,255,.72)" : "var(--ink2)",
                  margin: 0,
                  maxWidth: "56ch",
                }}
              >
                <TexteRiche texte={section.rappel} />
              </p>
            ) : null}
            </SectionPliableMobile>
          </div>

          <a
            href={section.href ?? ANCRE_FORMULAIRE}
            className={styles.boutonAction}
            style={{
              ...BOUTON_ACTION,
              padding: "16px 28px",
              flex: "none",
              position: "relative",
            }}
          >
            {section.bouton}
          </a>
        </div>
      </div>
    </section>
  );
}
