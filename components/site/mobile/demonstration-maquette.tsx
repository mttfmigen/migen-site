import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

/**
 * PAGE DE DÉMONSTRATION DES STYLES PARTAGÉS DE LA MAQUETTE MOBILE V2, NON
 * ROUTÉE. Elle ne vit pas sous `app/` : aucune URL ne la sert, elle n'existe
 * que pour la porte (`verification-maquette-mobile.tsx`), qui la rend dans un
 * navigateur à 390 et à 1 280 px et mesure ce que les règles de
 * `app/globals.css` (« styles partagés de la maquette mobile v2 ») en font.
 *
 * ELLE MONTRE CE QU'UN GABARIT AURA À POSER, et rien d'autre :
 *
 *   1. `SectionPliableMobile` tel qu'il est, qui pose `data-carte-numerotee`
 *      d'office, une fois avec `numero={false}` (la suite ne doit pas en être
 *      décalée), et un `<details data-carte-numerotee>` écrit à la main, comme
 *      un gabarit qui garde son propre repli.
 *   2. `data-faq-liste` sur le conteneur des questions, `data-faq-titre` et
 *      `data-faq-surtitre` sur l'en-tête, `name` commun aux questions.
 *   3. `data-tuiles-chiffres` sur la grille, `data-tuiles-titre` sur le titre.
 *
 * Tout le texte est un ÉCHAFAUDAGE ASSUMÉ, marqué `data-demo` et jamais servi :
 * ce n'est pas de la copie du site, et aucun chiffre n'y prétend à rien (« 00 »
 * tient la place d'une valeur). Les styles en ligne des questions et des
 * tuiles imitent ceux du site, qui les dessine en ligne : la porte prouve
 * ainsi que l'attribut seul les bat.
 */

export const NOM_FAQ_DEMONSTRATION = "faq-demonstration";

function Corps({ rang }: { rang: string }) {
  return (
    <div>
      <h3 style={{ marginTop: 44 }}>{`Intertitre de démonstration ${rang}`}</h3>
      <p>Texte d’échafaudage, jamais servi.</p>
    </div>
  );
}

const QUESTIONS = ["Question de démonstration A", "Question de démonstration B", "Question de démonstration C"];

const TUILES = ["Chiffre de démonstration A", "Chiffre de démonstration B", "Chiffre de démonstration C", "Chiffre de démonstration D"];

export default function DemonstrationMaquetteMobile() {
  return (
    <main data-demo="">
      <section data-demo-cartes="" style={{ padding: "0 18px" }}>
        <SectionPliableMobile
          kicker="Sur-titre de démonstration"
          titre="Carte de démonstration A"
          resume="Résumé de démonstration A, assez long pour passer sur deux lignes et montrer la coupe de la maquette à deux lignes."
          toujoursOuvert
        >
          <Corps rang="A" />
        </SectionPliableMobile>
        <SectionPliableMobile titre="Carte de démonstration B" resume="Résumé de démonstration B">
          <Corps rang="B" />
        </SectionPliableMobile>
        <SectionPliableMobile titre="Carte sans numéro" numero={false} resume="Résumé sans numéro">
          <Corps rang="S" />
        </SectionPliableMobile>
        <SectionPliableMobile titre="Carte de démonstration C" resume="Résumé de démonstration C">
          <Corps rang="C" />
        </SectionPliableMobile>
        <details data-carte-numerotee="" data-demo-gabarit="">
          <summary>
            <span>
              <span data-carte-surtitre="" style={{ color: "#ff7c3c", fontSize: 18 }}>
                Sur-titre écrit par un gabarit
              </span>
              <span data-carte-titre="" style={{ font: "600 30px/1.1 var(--ft)" }}>
                Carte écrite par un gabarit
              </span>
            </span>
            <span aria-hidden="true">&rsaquo;</span>
            <p>Résumé écrit par un gabarit</p>
          </summary>
          <Corps rang="D" />
        </details>
      </section>

      <section data-demo-faq="" style={{ padding: "0 18px" }}>
        <div data-faq-surtitre="" style={{ font: "600 13px var(--fb)", color: "#000" }}>
          Sur-titre de démonstration
        </div>
        <h2 data-faq-titre="" style={{ font: "600 34px/1 var(--ft)" }}>
          Titre de FAQ de démonstration
        </h2>
        <div data-faq-liste="" style={{ display: "flex", gap: 30 }}>
          {QUESTIONS.map((question) => (
            <details
              key={question}
              name={NOM_FAQ_DEMONSTRATION}
              style={{ background: "rgba(255,255,255,.62)", borderRadius: 28, padding: 24 }}
            >
              <summary>
                <span style={{ font: "600 18px/1.2 var(--ft)" }}>{question}</span>
                <span aria-hidden="true">+</span>
              </summary>
              <div style={{ padding: "0 24px 22px", font: "400 17px/1.7 var(--fb)" }}>
                <p>Premier paragraphe de démonstration.</p>
                <p>Second paragraphe de démonstration.</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section data-demo-tuiles="" style={{ padding: "0 18px" }}>
        <h2 data-tuiles-titre="" style={{ font: "600 34px/1 var(--ft)" }}>
          Titre de chiffres de démonstration
        </h2>
        <div data-tuiles-chiffres="" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {TUILES.map((libelle) => (
            <div key={libelle} style={{ padding: 26, borderRadius: 28, background: "rgba(255,255,255,.62)" }}>
              <div style={{ font: "600 34px/1 var(--ft)" }}>00</div>
              <div style={{ font: "600 14.5px var(--ft)", marginTop: 12 }}>{libelle}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
