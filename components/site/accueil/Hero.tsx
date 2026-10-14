import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

import replis from "./replis-accueil.module.css";

/* Section d'ouverture de la page d'accueil, portée de « Migen - Site final »
   (lignes 483 à 533). Composant serveur : le seul élément interactif est le
   formulaire, qui est déjà un composant client autonome.

   LE HÉROS COMPACT DU TÉLÉPHONE (G2), sous 881 px seulement. La maquette
   mobile v2 (m-00) ouvre l'accueil sur la pastille, le titre et le parcours
   « Qu'est-ce qui vous bloque ? » : aucun formulaire en tête. Le nôtre faisait
   1 620 px de haut à 390 px, dont 900 de champs, et repoussait le parcours à
   deux écrans. Le formulaire est donc REPLIÉ derrière sa propre rangée
   « Rappel dans l'heure · Décrire mon besoin », jamais retiré : ses champs, sa
   validation et son envoi sont ceux d'avant, au caractère près. Sur bureau la
   bascule n'existe pas et le panneau est celui de la capture. */

/* Le titre du panneau, écrit une fois et servi aux deux endroits (en-tête de
   bureau, bascule du téléphone), comme les sections repliées de l'accueil. */
const TITRE_PANNEAU = "Décrire mon besoin";
const MENTION_PANNEAU = "Rappel dans l’heure";

const VALEUR = {
  font: "600 22px var(--ft)",
  letterSpacing: "-.04em",
} as const;

const LIBELLE = {
  font: "400 12.5px var(--fb)",
  color: "var(--ink4)",
  marginTop: "2px",
} as const;

const TRAIT = {
  width: "1px",
  height: "34px",
  background: "var(--line)",
} as const;

export default function Hero() {
  return (
    <section
      className={replis.herosCompact}
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "70px 40px 0",
      }}
    >
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.12fr .88fr",
          gap: "52px",
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "26px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,var(--gl-a))",
                backdropFilter: "blur(var(--gl-b))",
                WebkitBackdropFilter: "blur(var(--gl-b))",
                border: "1px solid var(--gbd)",
                font: "600 12px var(--fb)",
                letterSpacing: ".02em",
                color: "var(--ink1)",
                boxShadow: "0 2px 10px rgba(0,0,0,.05)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "999px",
                  background: "var(--acc)",
                }}
              />
              Partout en France
            </span>
            {/* « 4 agences · +120 techniciens » retiré le 12/10, sur demande
                de Mehdi : « j'ai ce texte a coté de partout en france, retire
                le ». La pastille « Partout en France » reste seule. */}
          </div>

          <h1
            style={{
              font: "600 calc(clamp(38px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "16ch",
              textWrap: "balance",
            }}
          >
            La maintenance industrielle,{" "}
            <span style={{ color: "var(--ink4)" }}>
              sans rupture de production.
            </span>
          </h1>

          <p
            className={replis.chapoHeros}
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "26px 0 0",
              maxWidth: "48ch",
            }}
          >
            En tant que responsable maintenance, trouver un prestataire
            réellement qualifié est un défi. Nous mobilisons des techniciens dont
            10&nbsp;% seulement réussissent notre process, sur vos sites, en
            continu ou en intervention ciblée.
          </p>

          <div
            className={replis.chiffresHeros}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "26px",
              marginTop: "34px",
              paddingTop: "26px",
              borderTop: "1px solid var(--line)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={VALEUR}>+120</div>
              <div style={LIBELLE}>techniciens</div>
            </div>
            <div style={TRAIT} />
            <div>
              <div style={VALEUR}>+10&nbsp;M€</div>
              <div style={LIBELLE}>de chiffre d’affaires</div>
            </div>
            <div style={TRAIT} />
            <div>
              <div style={VALEUR}>+200</div>
              <div style={LIBELLE}>clients</div>
            </div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            id="besoin"
            style={{
              position: "relative",
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              borderRadius: "var(--rad)",
              padding: "30px 30px 32px",
              boxShadow:
                "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
            }}
          >
            {/* LA BASCULE PASSE AVANT L'EN-TÊTE, ET C'EST UNE MESURE QUI L'A
                DÉCIDÉ. Le texte du `<main>` est lu d'un bloc
                (`scripts/instantane-texte-main.mjs`) : deux blocs voisins y
                collent leurs mots, « +200clientsDécrire »,
                « l'heureSite web ». Posée entre l'en-tête et le formulaire, la
                bascule cassait ces collages, et la porte « aucun mot perdu »
                les comptait comme perdus. Posée AVANT, avec le titre en tête et
                la mention en résumé, elle ne fait qu'insérer son propre texte :
                tout ce qui était là se relit à l'identique.
                La mention « Rappel dans l'heure » passe en résumé et non en
                sur-titre pour la même raison (un sur-titre la mettrait en tête
                de la bascule, collée à « clients ») ; la feuille la remonte
                au-dessus du titre, à l'écran seulement. */}
            <div className={replis.repliHeros}>
              <SectionPliableMobile titre={TITRE_PANNEAU} resume={MENTION_PANNEAU}>
                {/* L'en-tête de bureau, masqué sur téléphone où la bascule le
                    porte. L'enveloppe existe parce que l'en-tête a un
                    `display: flex` en ligne, qu'une feuille ne bat pas ; sans
                    rembourrage ni bordure, elle laisse passer sa marge basse
                    et le bureau ne bouge pas d'un pixel. */}
                <div className={replis.enTeteBureau}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      columnGap: "14px",
                      rowGap: "6px",
                      marginBottom: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        font: "600 20px/1.2 var(--ft)",
                        letterSpacing: "-.03em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {TITRE_PANNEAU}
                    </div>
                    <div
                      style={{
                        font: "500 11.5px var(--fb)",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "var(--acc)",
                      }}
                    >
                      {MENTION_PANNEAU}
                    </div>
                  </div>
                </div>

                {/* Le formulaire existant porte sa propre validation, son champ
                    piège, sa mention RGPD et son état d'envoi : la maquette
                    dessinait ces écrans (`sc-if sent` / `notSent`) à la main,
                    ils sont ici dans le composant. */}
                <FormulaireContact
                  formulaire="accueil-hero"
                />
              </SectionPliableMobile>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
