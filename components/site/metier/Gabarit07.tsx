import Link from "next/link";
import type { ReactNode } from "react";

import { LARGEUR } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { ContenuMetier } from "@/types/metier";

import Bloc07, {
  CTA_CIBLE,
  CTA_LIBELLE,
  NUMERO07,
  SURTITRE07,
  TELEPHONE,
  TEL_HREF,
  TITRE07,
  VERRE07,
} from "./blocs07";
import styles from "./Gabarit07.module.css";

/**
 * GABARIT 07 MÉTIER ET CARRIÈRE, porté de « Migen - Gabarit 07 Metier.dc.html »,
 * copié dans `maquette/gabarit-07-metier.html`.
 *
 * Il sert les 13 pages de `/carriere/<metier>/`.
 *
 * CE FICHIER EXISTE PARCE QUE LE PORTAGE PRÉCÉDENT A LU LE MAUVAIS FICHIER.
 * Tout avait été porté depuis « Migen - Site final.dc.html », qui dessine une
 * fiche métier en quatre sections et 155 mots : un héros, une rangée de
 * missions, deux rangées de pastilles, une carte de fin. Le projet contient
 * ONZE fichiers de gabarits dédiés, bien plus riches, et celui-ci fait foi pour
 * cette famille. Personne ne les avait listés.
 *
 * LES CINQ SECTIONS DE LA MAQUETTE, dans son ordre, par leurs `data-screen-label` :
 *
 *   Héros       fil d'Ariane, pastille « Métier », H1, chapeau, deux boutons, photo
 *   Corps       sommaire collant à gauche, sections NUMÉROTÉES 01 à NN à droite
 *   Questions   surtitre et H2 collants à gauche, une carte de verre par question
 *   Maillage    « Pour aller plus loin », cartes vers les pages liées
 *   Candidater  panneau anthracite « Rejoindre Migen », H1 repris, deux boutons
 *
 * CE QU'ELLE N'A PAS, et que le site rendait : aucune section « Missions »,
 * « Compétences attendues » ni « Habilitations utiles », et aucune carte
 * « Ce métier vous manque sur votre site ? » — un message d'employeur sur une
 * page que lit un candidat.
 *
 * LA RÈGLE DE CONTENU : le dessin vient de la maquette, le texte vient du
 * corpus, rien ne s'invente. Une section que le corpus n'alimente pas ne se rend
 * PAS DU TOUT, titre compris.
 *
 * Composant SERVEUR. Aucun état, aucun écouteur : les survols sont dans le
 * module CSS, le sommaire tient par `position: sticky` et ses entrées sont des
 * liens. Aucun JavaScript.
 */

/**
 * La rotation de photos de la maquette, et son ordre exact.
 *
 * La maquette pose `PHOTOS[links.length % PHOTOS.length]` sur les cartes du
 * maillage : c'est une rotation DÉCORATIVE sur la banque d'images du projet,
 * donc du dessin, pas de la donnée. Les images sont en `alt=""` : annoncées,
 * elles répéteraient le titre de la carte juste à côté.
 */
const PHOTOS = [
  "team-grind-front",
  "team-duo",
  "ph-tuyaux",
  "ph-robots-solaire",
  "team-grind-close",
  "team-grind-impact",
  "ph-hero-raffinerie",
  "ph-technicien",
  "team-electric",
];

/** Le visuel du héros, écrit en dur dans la maquette, identique sur les 13 pages. */
const PHOTO_HERO = "/assets/web/team-grind-front.jpg";
const ALT_HERO = "Technicien migen au travail";

/** La ligne d'horaires du panneau de fin, telle que la maquette l'écrit. */
const HORAIRES = `${TELEPHONE}, du lundi au vendredi de 8h00 à 18h30.`;

type Metier = Extract<ContenuMetier, { gabarit: "metier" }>;

export interface ProprietesGabarit07 {
  titre: string;
  contenu: Metier;
  /**
   * Fil d'Ariane et maillage de bas de page, fournis par la route.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce fichier asynchrone pour
   * deux éléments de chrome, et il ne serait plus montable hors base.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

/** Le bouton de candidature, le même dans le héros et dans le panneau de fin. */
function BoutonCandidater({ grand }: { grand?: boolean }) {
  return (
    <a
      href={CTA_CIBLE}
      className={styles.boutonAccent}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: grand ? "16px 30px" : "15px 26px",
        borderRadius: 999,
        background: "var(--acc)",
        color: "#fff",
        font: `600 ${grand ? 16 : 15}px var(--fb)`,
        whiteSpace: "nowrap",
        boxShadow: grand ? undefined : "0 12px 30px -12px rgba(255,124,60,.9)",
      }}
    >
      {CTA_LIBELLE}
    </a>
  );
}

export default function Gabarit07({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesGabarit07) {
  const sections = contenu.corps ?? [];
  // Le sommaire se déduit des sections TITRÉES, jamais saisi deux fois. La
  // section d'ouverture n'en a pas : la maquette la numérote mais ne la liste
  // pas, faute de libellé.
  const sommaire = sections.filter((s) => s.titre);
  const questions = contenu.faq?.questions ?? [];
  const liens = contenu.liens ?? [];

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {/* ------------------------------------------------------------ héros */}
        <section style={{ ...LARGEUR, padding: "44px 40px 0" }}>
          {filAriane ? <div style={{ marginBottom: 30 }}>{filAriane}</div> : null}
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: 48,
              alignItems: "end",
            }}
          >
            <div>
              <span
                style={{
                  ...VERRE07,
                  backdropFilter: undefined,
                  WebkitBackdropFilter: undefined,
                  boxShadow: undefined,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 999,
                  font: "600 12px var(--fb)",
                  color: "var(--ink1)",
                  marginBottom: 22,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "var(--acc)",
                  }}
                />
                Métier
              </span>
              <h1
                style={{
                  font: "600 calc(clamp(36px,4.4vw,62px) * var(--ts))/1.04 var(--ft)",
                  letterSpacing: "-.045em",
                  margin: "0 0 22px",
                  maxWidth: "18ch",
                  textWrap: "balance",
                }}
              >
                {titre}
              </h1>
              {contenu.chapo?.map((paragraphe, i) => (
                // L'index suffit comme clé : l'ordre du tableau EST le texte.
                <p
                  key={`${i}-${paragraphe.slice(0, 24)}`}
                  className={styles.corpus}
                  style={{
                    font: "400 18.5px/1.6 var(--fb)",
                    color: "var(--ink)",
                    margin: "0 0 14px",
                    maxWidth: "56ch",
                    textWrap: "pretty",
                  }}
                >
                  <TexteRiche texte={paragraphe} />
                </p>
              ))}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 12,
                }}
              >
                <BoutonCandidater />
                <a
                  href={TEL_HREF}
                  className={styles.boutonVerre}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "15px 26px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.8)",
                    border: "1px solid var(--line)",
                    font: "600 15px var(--fb)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {TELEPHONE}
                </a>
              </div>
            </div>
            <div
              style={{
                borderRadius: "var(--rad)",
                overflow: "hidden",
                height: 400,
                background: "#dedfe1",
              }}
            >
              {/* `img` et non `next/image` : le reste du site fait de même, et
                  la balise optimisée réécrit l'URL en passant par un service de
                  redimensionnement que ce projet n'a pas configuré. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PHOTO_HERO}
                alt={ALT_HERO}
                width={620}
                height={400}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) contrast(1.05)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ corps */}
        {sections.length > 0 ? (
          <section style={{ padding: "var(--sec) 0 0" }}>
            <div
              className="mg-r2"
              style={{
                ...LARGEUR,
                display: "grid",
                gridTemplateColumns: "240px minmax(0,1fr)",
                gap: 56,
                alignItems: "start",
              }}
            >
              {sommaire.length > 0 ? (
                <nav
                  aria-label="Sommaire de la fiche"
                  className={styles.collant}
                  style={{
                    ...VERRE07,
                    position: "sticky",
                    top: 110,
                    borderRadius: "var(--rad)",
                    padding: "22px 22px 24px",
                  }}
                >
                  <p
                    style={{
                      font: "600 10.5px var(--fb)",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "var(--ink4)",
                      margin: "0 0 12px",
                    }}
                  >
                    Sommaire
                  </p>
                  <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {sommaire.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className={styles.lienSommaire}
                          style={{
                            display: "flex",
                            gap: 10,
                            padding: "8px 0",
                            font: "500 13.5px/1.4 var(--fb)",
                            color: "var(--ink1)",
                            borderTop: "1px solid var(--line)",
                          }}
                        >
                          <span style={{ ...NUMERO07, flex: "none" }}>
                            {section.numero}
                          </span>
                          {section.titre}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
              <div style={{ minWidth: 0 }}>
                {sections.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    style={{
                      scrollMarginTop: 110,
                      paddingBottom: 40,
                      marginBottom: 40,
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <div style={{ ...NUMERO07, marginBottom: 12 }}>
                      {section.numero}
                    </div>
                    {/* Pas de H2 sans libellé : la maquette laisse un `<h2>`
                        vide sur la section d'ouverture, et un titre vide est
                        annoncé comme tel par les lecteurs d'écran. */}
                    {section.titre ? (
                      <h2
                        style={{
                          font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
                          letterSpacing: "-.04em",
                          margin: "0 0 22px",
                          maxWidth: "26ch",
                          textWrap: "balance",
                        }}
                      >
                        {section.titre}
                      </h2>
                    ) : null}
                    {section.blocs.map((bloc, i) => (
                      <Bloc07 key={`${bloc.type}-${i}`} bloc={bloc} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* -------------------------------------------------------- questions */}
        {questions.length > 0 && contenu.faq ? (
          <section id="faq" style={{ padding: "var(--sec) 0 0" }}>
            <div
              className="mg-r2"
              style={{
                ...LARGEUR,
                display: "grid",
                gridTemplateColumns: ".75fr 1.25fr",
                gap: 56,
                alignItems: "start",
              }}
            >
              <div
                className={styles.collant}
                style={{ position: "sticky", top: 110 }}
              >
                <p style={{ ...SURTITRE07, margin: "0 0 14px" }}>
                  Questions fréquentes
                </p>
                <h2 style={{ ...TITRE07, margin: "0 0 18px", maxWidth: "14ch" }}>
                  {contenu.faq.titre}
                </h2>
                {contenu.faq.intro?.map((bloc, i) => (
                  <Bloc07 key={`${bloc.type}-${i}`} bloc={bloc} />
                ))}
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {questions.map((item) => (
                  <div
                    key={item.question}
                    style={{
                      ...VERRE07,
                      borderRadius: 22,
                      padding: "22px 26px",
                    }}
                  >
                    {/* H3 et non `div` : ce sont les sous-titres de la section,
                        et le gabarit de la maquette n'en a pas d'autre ici. */}
                    <h3
                      style={{
                        font: "600 17px/1.4 var(--ft)",
                        letterSpacing: "-.02em",
                        margin: "0 0 10px",
                      }}
                    >
                      {item.question}
                    </h3>
                    {item.reponse.map((bloc, i) => (
                      <Bloc07 key={`${bloc.type}-${i}`} bloc={bloc} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* --------------------------------------------------------- maillage */}
        {liens.length > 0 ? (
          <section style={{ padding: "var(--sec) 0 0" }}>
            <div style={LARGEUR}>
              <p style={{ ...SURTITRE07, margin: "0 0 14px" }}>
                Pour aller plus loin
              </p>
              <h2 style={{ ...TITRE07, margin: "0 0 26px" }}>
                Métiers et ressources liés
              </h2>
              <ul
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
                  gap: 12,
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {liens.map((lien, i) => (
                  <li key={lien.url} style={{ display: "flex" }}>
                    <Link
                      href={lien.url}
                      prefetch={false}
                      className={styles.carteLien}
                      style={{
                        ...VERRE07,
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        borderRadius: 24,
                        overflow: "hidden",
                        transition: "transform var(--tr)",
                      }}
                    >
                      <span
                        style={{
                          height: 140,
                          background: "#dedfe1",
                          overflow: "hidden",
                          display: "block",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/assets/web/${PHOTOS[i % PHOTOS.length]}.jpg`}
                          alt=""
                          width={250}
                          height={140}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: "saturate(var(--sat))",
                          }}
                        />
                      </span>
                      <span
                        style={{
                          padding: "18px 20px 20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            font: "600 10.5px var(--fb)",
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            color: "var(--acc)",
                          }}
                        >
                          {lien.nature}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "flex-start",
                          }}
                        >
                          <span
                            style={{
                              font: "600 16.5px/1.3 var(--ft)",
                              letterSpacing: "-.02em",
                            }}
                          >
                            {lien.libelle}
                          </span>
                          <span
                            aria-hidden="true"
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
                            }}
                          >
                            →
                          </span>
                        </span>
                        <span
                          style={{
                            marginTop: "auto",
                            font: "500 12px ui-monospace,Menlo,monospace",
                            color: "var(--ink4)",
                          }}
                        >
                          {lien.url}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* ------------------------------------------------------- candidater */}
        <section style={{ padding: "var(--sec) 24px var(--sec)" }}>
          <div
            className="mg-pad"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              borderRadius: 40,
              background: "var(--panel)",
              padding: "60px 56px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 560,
                height: 560,
                left: -200,
                bottom: -280,
                background:
                  "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
                pointerEvents: "none",
              }}
            />
            <div
              className="mg-r2"
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1.1fr .9fr",
                gap: 40,
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ ...SURTITRE07, margin: "0 0 16px" }}>
                  Rejoindre Migen
                </p>
                {/* `div` et non un titre : le H1 de la page est au héros, et la
                    maquette reprend ici le même texte. Deux fois le même titre
                    dans l'arbre, c'est un H1 en double ou un H2 qui mentit. */}
                <div
                  style={{
                    font: "600 calc(clamp(28px,3.2vw,44px) * var(--ts))/1.08 var(--ft)",
                    letterSpacing: "-.045em",
                    color: "#fff",
                    marginBottom: 14,
                  }}
                >
                  {titre}
                </div>
                <p
                  style={{
                    font: "400 15.5px/1.6 var(--fb)",
                    color: "rgba(255,255,255,.64)",
                    margin: 0,
                  }}
                >
                  {HORAIRES}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <BoutonCandidater grand />
                <a
                  href={TEL_HREF}
                  className={styles.boutonSombre}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "16px 26px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.1)",
                    border: "1px solid rgba(255,255,255,.2)",
                    color: "#fff",
                    font: "600 16px var(--fb)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {TELEPHONE}
                </a>
              </div>
            </div>
          </div>
        </section>

        {maillage}
      </main>
    </div>
  );
}
