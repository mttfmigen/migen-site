import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { SectionHeros } from "@/types/contenu";

import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  HERO_FILET,
  HERO_FILET_PASTILLE,
  HERO_FILET_TEXTE,
  HERO_GRILLE,
  HERO_MECANISME,
  HERO_PANNEAU,
  HERO_PASTILLE,
  HERO_PASTILLE_PUCE,
  HERO_SECTION,
  lienTelephone,
  TITRE1,
} from "./habillage-prestation";

/**
 * Section 01 du gabarit : la promesse à gauche, LE FORMULAIRE À DROITE.
 *
 * C'EST L'ÉCART PRINCIPAL avec ce que le site rendait. La maquette place le
 * formulaire DANS le héros, lui donne l'id `formulaire`, et fait pointer les
 * quatre appels à l'action de la page sur cette ancre. Le site le rendait en
 * bas de page : tous les boutons renvoyaient le visiteur au pied de l'écran
 * après l'avoir fait défiler. La règle R15 du référentiel client demande les
 * deux, formulaire de héros ET formulaire de bas de page ; CE gabarit-ci ne
 * dessine que celui du héros, et c'est lui qui fait foi.
 *
 * Le formulaire n'est pas réécrit : `FormulaireContact` porte déjà les six
 * champs de la maquette dans le bon ordre, la validation, l'indicatif
 * téléphonique, le champ piège anti-spam, la mention RGPD et l'annonce
 * d'erreur au lecteur d'écran. Ce bloc ne fait que son panneau et son en-tête.
 */
export default function HerosPrestation({
  section,
  formulaire,
  etiquette,
}: {
  section: SectionHeros;
  /** Clé d'analyse des conversions, fournie par la route. */
  formulaire: string;
  etiquette?: string;
}) {
  return (
    <section style={HERO_SECTION} data-section="01-heros">
      <div className="mg-r2" style={HERO_GRILLE}>
        <div>
          {etiquette ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 26,
                flexWrap: "wrap",
              }}
            >
              <span style={HERO_PASTILLE}>
                <span style={HERO_PASTILLE_PUCE} aria-hidden="true" />
                {etiquette}
              </span>
            </div>
          ) : null}

          <h1 style={TITRE1}>{section.h1}</h1>

          <p style={HERO_MECANISME}>
            <TexteRiche texte={section.mecanisme} />
          </p>

          <div
            style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}
          >
            <a href={ANCRE_FORMULAIRE} style={BOUTON_ACTION}>
              {section.cta}
            </a>
            <a href={lienTelephone(section.telephone)} style={BOUTON_SECONDAIRE}>
              {section.telephone}
            </a>
          </div>

          <div style={HERO_FILET}>
            <span style={HERO_FILET_PASTILLE} aria-hidden="true" />
            <p style={HERO_FILET_TEXTE}>
              <TexteRiche texte={section.phraseDelai} />
            </p>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          {/* `id` et `scroll-margin-top` sur le MÊME élément que la maquette :
              c'est ce qui empêche l'en-tête collant de recouvrir le premier
              champ quand un bouton amène ici. */}
          <section
            id="formulaire"
            aria-labelledby="titre-formulaire-hero"
            style={HERO_PANNEAU}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                columnGap: 14,
                rowGap: 6,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <h2
                id="titre-formulaire-hero"
                style={{
                  font: "600 20px/1.2 var(--ft)",
                  letterSpacing: "-.03em",
                  margin: 0,
                }}
              >
                {section.cta}
              </h2>
              {/* « Rappel dans l'heure » est la seule promesse de délai que le
                  projet autorise. La maquette l'écrit ici en capitales. */}
              <span
                style={{
                  font: "500 11.5px var(--fb)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                }}
              >
                Rappel dans l’heure
              </span>
            </div>

            <FormulaireContact formulaire={formulaire} />
          </section>
        </div>
      </div>
    </section>
  );
}
