import { Fragment, type CSSProperties, type ReactNode } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import MarqueeClients from "@/components/site/accueil/MarqueeClients";
import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";
import {
  estHubPreuves,
  type ChiffresCasClients,
  type ContenuCasClients,
  type ContenuHubPreuves,
} from "@/types/casclients";

import AvisCasClients from "./AvisCasClients";
import ChantiersCasClients from "./ChantiersCasClients";
import { BOUTON_ACTION, LARGEUR, SURTITRE, VERRE } from "./habillage";
import styles from "./PageCasClients.module.css";
import PreuvesHub from "./PreuvesHub";
import ProcessCasClients from "./ProcessCasClients";

/**
 * Gabarit « Cas clients », porté de « Migen - Site final.dc.html », lignes 6646
 * à 6931 : la page sur mesure /realisations/.
 *
 * LE HUB /preuves/ N'EST PAS CE DESSIN. Sa capture (`maquette/rendu/preuves.html`)
 * est celle de `MigenPreuves.dc.html` : un contenu qui porte `vue: "hub"` est
 * rendu par `PreuvesHub`, sans rien de ce qui suit.
 *
 * Sept sections, dans l'ordre de la maquette : hero, bento de chiffres, bandeau
 * de logos, chantiers livrés, process de sélection, avis Google, formulaire.
 *
 * COMPOSANT SERVEUR. Seul le formulaire est client, et il l'était déjà. Les
 * animations ne sont pas écrites ici : `data-reveal` est posé tel quel, et
 * `components/site/Moteurs.tsx`, monté une fois dans la mise en page racine,
 * les anime. Le bandeau de logos défile en CSS.
 *
 * CE QUI VIENT DU CONTENU : le H1 (colonne `pages.titre_h1`), le chapeau, les
 * chiffres, les chantiers et les avis. Chaque section dont la donnée manque ne
 * se rend pas du tout, plutôt qu'avec des cases vides.
 */

const HERO_TITRE: CSSProperties = {
  font: "600 calc(clamp(36px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
  letterSpacing: "-.045em",
  margin: 0,
  maxWidth: "18ch",
  textWrap: "balance",
};

const BOUTON_SECONDAIRE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--gsol)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  transition: "background var(--tr)",
};

const NOMBRE: CSSProperties = {
  font: "600 calc(44px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.05em",
};

const LEGENDE: CSSProperties = {
  font: "400 14.5px/1.5 var(--fb)",
  color: "var(--ink2)",
  marginTop: 10,
};

/** Le voile de formulaire : rayon et ombre propres à cette carte. */
const VERRE_FORMULAIRE: CSSProperties = {
  ...VERRE,
  borderRadius: 36,
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 30px 70px -40px rgba(0,0,0,.4)",
  padding: "44px 46px 46px",
};

function Chiffres({ chiffres }: { chiffres: ChiffresCasClients }) {
  const cartes = chiffres.cartes ?? [];
  const duo = chiffres.duo ?? [];

  return (
    <section style={{ padding: "56px 0 0" }}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr",
            gridTemplateRows: "auto auto",
            gap: 16,
          }}
        >
          <div
            className={styles.bentoHaut}
            style={{
              ...VERRE,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 420,
                height: 420,
                right: -170,
                top: -190,
                background:
                  "radial-gradient(circle,rgba(255,124,60,.16),transparent 68%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ ...SURTITRE, position: "relative" }}>Croissance</div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  font: "600 calc(clamp(52px,6.6vw,96px) * var(--ts))/.9 var(--ft)",
                  letterSpacing: "-.055em",
                  color: "var(--acc)",
                }}
              >
                {chiffres.principal.valeur}
              </div>
              <div
                style={{
                  font: "400 16px/1.6 var(--fb)",
                  color: "var(--ink2)",
                  marginTop: 14,
                  maxWidth: "30ch",
                }}
              >
                {chiffres.principal.libelle}
              </div>
            </div>
          </div>

          {cartes.map((chiffre) => (
            <div key={chiffre.libelle} style={{ ...VERRE, padding: 30 }}>
              <div style={NOMBRE}>{chiffre.valeur}</div>
              <div style={LEGENDE}>{chiffre.libelle}</div>
            </div>
          ))}

          {duo.length > 0 ? (
            <div
              className={styles.bentoLarge}
              style={{
                ...VERRE,
                padding: 30,
                display: "flex",
                alignItems: "center",
                gap: 46,
                flexWrap: "wrap",
              }}
            >
              {/* Le filet est un FRÈRE des chiffres, pas leur parent : dans un
                  conteneur flexible, l'imbriquer ajouterait sa propre gouttière
                  à celle du conteneur et doublerait l'écart. */}
              {duo.map((chiffre, i) => (
                <Fragment key={chiffre.libelle}>
                  {i > 0 ? (
                    // Le filet sépare, il ne dit rien : décoratif.
                    <div
                      aria-hidden="true"
                      style={{
                        width: 1,
                        height: 56,
                        background: "var(--line)",
                      }}
                    />
                  ) : null}
                  <div>
                    <div style={NOMBRE}>{chiffre.valeur}</div>
                    <div style={LEGENDE}>{chiffre.libelle}</div>
                  </div>
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export interface ProprietesPageCasClients {
  /** Le H1, porté par `pages.titre_h1`. */
  titre: string;
  contenu: ContenuCasClients | ContenuHubPreuves;
  /** Identifiant d'analyse de la soumission, repris par HubSpot. */
  formulaire?: string;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES, qui
   * interrogent la base. Les appeler ici rendrait tout le gabarit asynchrone
   * pour deux éléments de chrome.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageCasClients({
  titre,
  contenu,
  formulaire = "casclients",
  filAriane,
  maillage,
}: ProprietesPageCasClients) {
  // Le hub n'a ni fil d'Ariane, ni formulaire, ni maillage : sa capture non plus.
  if (estHubPreuves(contenu)) return <PreuvesHub titre={titre} contenu={contenu} />;

  const surtitre = contenu.surtitre ?? "Cas clients";
  const chantiers = contenu.chantiers ?? [];

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {filAriane}

        <section style={{ ...LARGEUR, padding: "70px 40px 0" }}>
          {/* Surtitre de la maquette par défaut. Une chaîne vide le retire,
              sans quoi une page ne pourrait pas s'en passer. */}
          {surtitre ? <div style={SURTITRE}>{surtitre}</div> : null}
          <h1 style={HERO_TITRE}>{titre}</h1>
          {contenu.chapeau ? (
            <p
              style={{
                font: "400 18.5px/1.6 var(--fb)",
                color: "var(--ink2)",
                margin: "24px 0 0",
                maxWidth: "56ch",
              }}
            >
              {contenu.chapeau}
            </p>
          ) : null}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {/* Le premier bouton ne mène quelque part que si la section des
                chantiers est rendue : sans chantier, pas d'ancre `#cas`. */}
            {chantiers.length > 0 ? (
              <a
                href="#cas"
                className={styles.boutonAction}
                style={BOUTON_ACTION}
              >
                Six chantiers livrés
              </a>
            ) : null}
            <a
              href={ANCRE_FORMULAIRE}
              className={styles.boutonSecondaire}
              style={BOUTON_SECONDAIRE}
            >
              Parler à un de nos clients
            </a>
          </div>
        </section>

        {contenu.chiffres ? <Chiffres chiffres={contenu.chiffres} /> : null}

        {/* Le bandeau de logos est celui de l'accueil, au logo près et au
            libellé près. Il porte sa propre marge haute de 64px, le calage
            complète jusqu'au rythme de section de la maquette, `--sec`. */}
        <div style={{ paddingTop: "calc(var(--sec) - 64px)" }}>
          <MarqueeClients />
        </div>

        <ChantiersCasClients
          chantiers={chantiers}
          titre={contenu.titreChantiers}
          libelleLien={contenu.libelleLienChantiers}
          hrefChantiers={contenu.hrefChantiers}
        />

        <ProcessCasClients />

        <AvisCasClients avis={contenu.avis} />

        <section
          id="formulaire"
          style={{ padding: "var(--sec) 0 var(--sec)", scrollMarginTop: 110 }}
        >
          <div style={LARGEUR}>
            <div data-reveal="" style={VERRE_FORMULAIRE}>
              <div
                className="mg-r2"
                style={{
                  display: "grid",
                  gridTemplateColumns: ".82fr 1.18fr",
                  gap: 48,
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={SURTITRE}>Décrire mon besoin</div>
                  <h2
                    style={{
                      font: "600 calc(clamp(24px,2.6vw,36px) * var(--ts))/1.1 var(--ft)",
                      letterSpacing: "-.04em",
                      margin: "0 0 14px",
                      maxWidth: "20ch",
                      textWrap: "balance",
                    }}
                  >
                    Parlez à un industriel qui nous a déjà confié un site.
                  </h2>
                  <p
                    style={{
                      font: "400 16px/1.65 var(--fb)",
                      color: "var(--ink2)",
                      margin: "0 0 22px",
                      maxWidth: "38ch",
                    }}
                  >
                    {
                      "Dites-nous votre secteur et votre type d’installation, nous vous mettons en relation."
                    }
                  </p>
                </div>
                <div style={{ minWidth: 0 }}>
                  <FormulaireContact
                    formulaire={formulaire}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {maillage ? (
          <section style={{ ...LARGEUR, padding: "0 40px 80px" }}>
            {maillage}
          </section>
        ) : null}
      </main>
    </div>
  );
}
