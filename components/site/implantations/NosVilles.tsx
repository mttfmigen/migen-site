import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { NosVilles as DonneesNosVilles } from "@/types/implantations";

import styles from "./PageImplantations.module.css";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { PHOTO_DU_HUB } from "./photos-hubs";

/**
 * L'écran « Nos villes » du hub `/implantations/` : les dix cartes de hub et
 * leurs zones, puis « Au-delà des hubs », les villes des techniciens
 * itinérants par région.
 *
 * ARBITRAGE DE MEHDI DU 12/10, CONTRE SA PROPRE MAQUETTE, et il est déclaré
 * ici parce qu'une porte du dépôt relève encore le dessin de la capture.
 * Verbatim : « le bloc est pas jolie mal agencé trop gros. Ca pourrait etre un
 * peu plus visuels. Pareil pour le bloc au dela des hubs ».
 *
 * CE QUI A ÉTÉ MESURÉ AVANT DE TOUCHER À QUOI QUE CE SOIT, en production, à
 * 1440 px : la section pesait 1 965 px, dont 964 px pour les hubs et 828 px
 * pour « Au-delà des hubs ». Sa capture, `maquette/rendu/implantations.html`
 * section 13, en pèse 1 948 px avec les deux MÊMES grilles
 * (`minmax(340px,1fr)` et `minmax(260px,1fr)`), les mêmes 88 liens et aucune
 * image. LE PORTAGE ÉTAIT DONC CONFORME : ce qui suit n'est pas une
 * réparation, c'est une décision du client contre son dessin, comme celle
 * qu'il a prise le même jour sur `/contact/`.
 *
 * CE QUI CHANGE, ET RIEN D'AUTRE : la composition, la densité et la
 * hiérarchie. Aucune phrase n'est réécrite, aucun chiffre, aucune ville,
 * aucun hub n'est ajouté ni retiré, les 88 liens sont tous là, et les atomes
 * de la maquette sont gardés tels quels (la surface de verre, le panneau
 * anthracite du hub, la pastille de 36 px, la puce orange de 5 px).
 *
 *  1. LES HUBS passent de quatre rangées de trois cartes hautes à un tableau
 *     unique de cinq rangées sur deux colonnes. La raison du « mal agencé »
 *     était arithmétique : dix cartes dans une grille de trois colonnes
 *     laissent une dernière rangée à un seul élément. Deux colonnes et dix
 *     hubs tombent juste, et le hub est sur la même ligne que ses bassins au
 *     lieu d'être empilé au-dessus. Les dix cartes en verre deviennent UNE
 *     surface : un cadre à moitié vide se lisait comme une boîte inachevée dès
 *     qu'un hub avait peu de bassins, un rang clair dans un tableau se lit
 *     comme de la respiration.
 *  2. « AU-DELÀ DES HUBS » perd ses onze cartes bordées, qui coûtaient leur
 *     cadre, leur gouttière et surtout trois rangées calées sur la carte la
 *     plus haute (neuf villes en Nouvelle-Aquitaine, deux en Bretagne). Le
 *     même contenu coule dans un annuaire en cinq colonnes : plus de cadre,
 *     plus de rangée calée sur la plus fournie, et le flux se répartit seul.
 *  3. LE SECOND BLOC SE REPLIE AUSSI AU TÉLÉPHONE. Le premier le faisait
 *     depuis le 11/10 ; le second restait déplié et pesait à lui seul 1 977 px
 *     à 390 px de large, soit 2,3 écrans. C'est lui qui faisait encore le
 *     « gros pâté » que Mehdi signalait le matin.
 *
 * TROIS CORRECTIONS D'ACCESSIBILITÉ AU PASSAGE, toutes calculées sur le VRAI
 * fond, `--bg` #f1f2f4, et non sur du blanc pur :
 *   - le compte « 7 villes » était en `--ink4` (#a8a49d), soit 2,22:1, sous le
 *     plancher de 4,5:1 de la WCAG pour un texte de 11 px ; il passe en
 *     `--ink2` (#6a6764), 5,02:1 ;
 *   - l'anneau de focus clavier restait orange (`--acc` sur le jeton global),
 *     soit 2,29:1 sur le crème et 2,56:1 sur une pastille blanche, sous le
 *     plancher de 3:1 du critère 1.4.11 ; il est reteinté en `--ink` dans le
 *     module CSS, 15,36:1, sans toucher au jeton partagé ;
 *   - les cibles tactiles restent au-dessus de 24 px (pastille 36 px, lien de
 *     ville 26 px, panneau de hub 168 x 65 px), critère 2.5.8.
 *
 * CE QUI RESTE SOUS LE PLANCHER ET N'EST PAS À MOI : le surtitre orange sur
 * fond crème, 2,29:1, vient de `SURTITRE` dans `components/site/blocs/habillage.ts`,
 * sert sur toutes les pages, et `docs/PASSATION.md` le déclare comme un
 * arbitrage ouvert du client (« contrastes sous AA dans la maquette, fidélité
 * maintenue, correction à passer par la maquette d'abord »). Signalé, pas
 * corrigé. Le remède mesuré serait `--acc-ink` (#7d3309), 8,0:1.
 *
 * CE QUE JE N'AI PAS FAIT, ET POURQUOI : aucune photo n'est posée ici. La
 * capture n'en montre aucune sur cet écran, les deux écrans voisins en portent
 * déjà douze, et les photos des pages de ville sont des scènes d'industrie
 * réparties par `scripts/repartit-photos.ts` : aucune ne documente la ville
 * qu'elle illustrerait. Coller l'une d'elles sous le nom d'un hub ferait dire
 * à l'image ce qu'elle ne dit pas.
 *
 * Porte : `scripts/verifie-nos-villes.mjs` (hauteur et densité des deux
 * blocs). Les survols (`style-hover` de la maquette) vivent dans le module
 * CSS, sinon le style en ligne les écraserait.
 */

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 10px",
  maxWidth: "24ch",
  textWrap: "balance",
};

const CHAPEAU: CSSProperties = {
  font: "400 16px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 20px",
  /* 76ch au lieu de 62 : la phrase tenait sur trois lignes pour 131
     caractères, elle en tient deux sans sortir de la plage de lecture. */
  maxWidth: "76ch",
};

/** Le panneau anthracite du hub, valeurs de la capture, en pastille compacte. */
const LIEN_HUB: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "11px 13px",
  minWidth: 168,
  flex: "none",
  borderRadius: "calc(var(--rad) - 6px)",
  background: "var(--panel)",
  color: "#fff",
  transition: "filter var(--tr)",
};

const HUB_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 10px var(--fb)",
  letterSpacing: ".13em",
  textTransform: "uppercase",
  /* Orange sur l'anthracite du panneau : 6,72:1, bien au-dessus du plancher. */
  color: "#ff7c3c",
  marginBottom: 3,
};

const HUB_NOM: CSSProperties = { font: "600 18px/1.1 var(--ft)", letterSpacing: "-.025em" };

const FLECHE: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: "#ff7c3c",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  font: "400 15px var(--fb)",
  flex: "none",
};

/** La pastille de bassin, hauteur et gouttière de la capture, inchangées. */
const ZONE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 36,
  padding: "0 13px",
  borderRadius: 999,
  background: "#fff",
  font: "500 13.5px var(--fb)",
  whiteSpace: "nowrap",
  transition: "border-color var(--tr),color var(--tr)",
};

/** L'en-tête d'une région de l'annuaire : un tiret orange, le nom, le compte. */
const REGION_TIRET: CSSProperties = {
  width: 14,
  height: 2,
  borderRadius: 2,
  background: "#ff7c3c",
  flex: "none",
};

/**
 * L'EMPAN DE CHAQUE TUILE DE HUB, EN COLONNES D'UNE GRILLE DE DOUZE.
 *
 * Mesuré dans `maquette/colis-13-10/Migen - Implantations.html` le 13/10, à
 * 1440 px, enfant par enfant : la grille déclare douze colonnes de 82,3 px, des
 * rangées de 236 px et un écart de 12 px. Les dix tuiles y occupent
 * successivement 6, 3, 3, 3, 3, 4, 4, 4, 6 et 6 colonnes, la première tenant en
 * plus deux rangées.
 *
 * L'ordre suit celui de la donnée, `contenu.villes.hubs` : Lyon, Paris, Lille,
 * Marseille, Strasbourg, Nantes, Toulouse, Bordeaux, Metz, Dijon.
 */
const EMPAN: readonly number[] = [6, 3, 3, 3, 3, 4, 4, 4, 6, 6];

const TITRE_ANNUAIRE: CSSProperties = {
  font: "600 calc(clamp(22px,2.3vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  margin: 0,
  maxWidth: "26ch",
  textWrap: "balance",
};

const CHAPEAU_ANNUAIRE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 18px",
  maxWidth: "62ch",
};

/** La ligne d'en-tête d'une région : tiret orange, nom, compte, filet dessous. */
const ENTETE_REGION: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  paddingBottom: 6,
  marginBottom: 6,
  borderBottom: "1px solid var(--line)",
};

const REGION_NOM: CSSProperties = {
  font: "600 14.5px var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

const REGION_COMPTE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  /* Mesuré sur le VRAI fond, `--bg` #f1f2f4 et non du blanc pur : `--ink4`
     y donnait 2,22:1, sous le plancher WCAG de 4,5:1 ; `--ink2` donne 5,02:1. */
  color: "var(--ink2)",
  whiteSpace: "nowrap",
};

const VILLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "3px 0",
  /* 26 px : au-dessus des 24 px de cible tactile du critère 2.5.8. */
  minHeight: 26,
  font: "400 14px/1.45 var(--fb)",
  transition: "color var(--tr)",
};

const PUCE_VILLE: CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: 999,
  background: "#ff7c3c",
  flex: "none",
  opacity: 0.75,
};

export default function NosVilles({ villes }: { villes: DonneesNosVilles }) {
  return (
    <section style={SECTION}>
      <div className={styles.nosVilles} style={LARGEUR}>
        {/* LE TITRE EXISTANT SERT D'EN-TÊTE, il n'en est pas ajouté un second :
            une tentative du 11/10 avait posé des titres neufs et doublé
            « Au-delà des hubs » dans la page. Le motif correct est celui de
            GarantiesOffre, qui passe le titre déjà là dans `enTete`.
            Le résumé suit la règle de la maquette mobile (« Blocs communs
            (pliables) » de MigenMobile.dc.html) : les intitulés joints par
            « · ». Sur ordinateur rien ne se replie, le repli n'a lieu qu'en
            dessous de 880 px. */}
        <SectionPliableMobile
          enTete={
            /* UN `<div>` ET NON UN `<span>` : un `span` est du contenu de
               phrase, il ne peut pas porter un `h2`. `<summary>` accepte du
               contenu de flux, le `div` y est valide. */
            <div>
              <span style={{ ...SURTITRE, display: "block" }}>Nos implantations</span>
              <h2 style={TITRE}>{villes.titre}</h2>
            </div>
          }
          resume={villes.hubs.map((hub) => hub.hub).join(" · ")}
        >
          <p style={CHAPEAU}>{villes.chapeau}</p>

          {/* LA MOSAÏQUE DE TUILES PHOTO, portée du colis du 13/10.
              Mehdi, le 12/10 : « le bloc est pas jolie mal agencé trop gros.
              Ca pourrait etre un peu plus visuels. » Le colis est la réponse
              dessinée : chaque hub devient une tuile avec la photo de sa
              ville, son nom en grand, le compte de ses bassins et leurs
              pastilles.

              TROIS CHOSES QUE LE COLIS FAIT ET QUE L'ON NE FAIT PAS.

              1. Il charge six de ses dix photos depuis Internet, filigranées.
                 Nous servons les HUIT qui sont sous licence au dépôt, et les
                 deux qui manquent se rendent en panneau sombre. Le manque se
                 voit, et c'est le but : une scène d'usine à la place de Metz
                 est exactement ce qui a déclenché son retour du 12/10.

              2. Il perd le texte d'ancre des cartes, qui ne portent plus qu'un
                 `aria-label`. Ici le nom du hub est dans le lien, lisible et
                 indexable.

              3. Il fait 4 292 px de haut au téléphone contre 537 aujourd'hui.
                 La mosaïque passe donc à une colonne sous 880 px, et le bloc
                 reste replié par `SectionPliableMobile`. */}
          <div className={styles.mosaique}>
            {villes.hubs.map((hub, rang) => {
              const photo = PHOTO_DU_HUB[hub.hub];
              const bassins = hub.zones?.length ?? 0;
              return (
                <article
                  key={hub.href}
                  className={`${styles.tuileHub} ${photo ? "" : styles.tuileSansPhoto}`}
                  /* L'EMPAN DE CHAQUE TUILE, MESURÉ DANS LE COLIS et non deviné.
                     Sa grille fait DOUZE colonnes de 82,3 px, des rangées de
                     236 px et un écart de 12 px. Relevé enfant par enfant :
                     Lyon « span 6 » sur « span 2 » rangées, les quatre suivants
                     « span 3 », les trois d'après « span 4 », les deux derniers
                     « span 6 ». C'est ce qui donne sa respiration au bloc, et
                     c'est ce que Mehdi appelait « la répartition ». */
                  data-empan={EMPAN[rang] ?? 4}
                  data-haut={rang === 0 ? "" : undefined}
                >
                  {photo ? (
                    <Image
                      src={photo}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 880px) 100vw, 480px"
                      className={styles.tuilePhoto}
                    />
                  ) : null}
                  <span aria-hidden="true" className={styles.tuileVoile} />

                  <span aria-hidden="true" className={styles.tuilePastille}>
                    Hub
                  </span>
                  <span aria-hidden="true" className={styles.tuileFleche}>
                    →
                  </span>

                  <div className={styles.tuileCorps}>
                    {/* Le lien du hub couvre toute la tuile par son `::after`,
                        et les pastilles de bassin repassent au-dessus : une
                        ancre dans une ancre serait du HTML invalide. */}
                    <Link href={hub.href} prefetch={false} className={styles.tuileLien}>
                      {hub.hub}
                    </Link>
                    <span className={styles.tuileCompte}>
                      {bassins > 0
                        ? `${bassins} bassin${bassins > 1 ? "s" : ""} rattaché${bassins > 1 ? "s" : ""}`
                        : "Interventions sur tout le bassin"}
                    </span>
                    {bassins > 0 ? (
                      <span className={styles.tuileZones}>
                        {(hub.zones ?? []).map((zone) => (
                          <Link
                            key={zone.href}
                            href={zone.href}
                            prefetch={false}
                            className={styles.tuileZone}
                          >
                            {zone.libelle}
                          </Link>
                        ))}
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </SectionPliableMobile>

        {/* LE PANNEAU « AU-DELÀ DES HUBS », porté du colis du 13/10.

            Mehdi, le 13/10 : « Les bassins, tu n'y as pas touché, ça devrait
            ressembler à ça », capture à l'appui. Le colis en fait un panneau
            sombre : à gauche le nombre en très grand, le titre, la phrase et un
            appel ; à droite les onze régions en onglets, et les villes de celle
            qui est choisie, en pastilles.

            LES 48 LIENS RESTENT TOUS DANS LA PAGE, et c'est le point qui
            décide du montage. Le colis ne rend que la région ouverte : 48 liens
            chez lui contre 88 ici, donc 41 adresses de ville qui quittent le
            HTML. Le contrat dit « aucune page perdue » et Google indexe le
            mobile en premier. Les onze panneaux sont donc TOUS rendus, et dix
            sont masqués par la feuille de style : le visiteur voit la même
            chose, le robot voit tout.

            AUCUN JAVASCRIPT. Onze boutons radio partagent un nom, chaque
            étiquette en est la commande, et une règle par région révèle son
            panneau. Le clavier, le lecteur d'écran et le bouton « précédent »
            fonctionnent sans une ligne d'état. */}
        <div style={{ marginTop: 40 }}>
          <SectionPliableMobile
            enTete={
              <div>
                <span style={{ ...SURTITRE, display: "block", marginBottom: 10 }}>Au-delà des hubs</span>
                <h3 style={TITRE_ANNUAIRE}>{villes.itinerantsTitre}</h3>
              </div>
            }
            resume={villes.regions.map((region) => region.region).join(" · ")}
          >
            <div className={styles.panneauBassins}>
              <div className={styles.bassinsGauche}>
                <span aria-hidden="true" className={styles.bassinsNombre}>
                  {villes.regions.reduce((n, r) => n + r.villes.length, 0)}
                </span>
                <h4 className={styles.bassinsTitre}>
                  {/* Le nombre est déjà écrit en grand juste au-dessus : le
                      titre de la donnée le porte en tête, on ne le dit pas deux
                      fois. Le reste de sa phrase, mot pour mot. */}
                  {villes.itinerantsTitre.replace(/^\d+\s+/, "")}
                </h4>
                <p className={styles.bassinsTexte}>{villes.itinerantsTexte}</p>
                <Link href="#mgx-form" className={styles.bassinsAppel}>
                  Demander une intervention
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>

              <div className={styles.bassinsDroite}>
                <div className={styles.bassinsOnglets} role="radiogroup" aria-label="Choisir une région">
                  {villes.regions.map((region, rang) => (
                    <span key={region.region} className={styles.bassinsOnglet}>
                      <input
                        type="radio"
                        name="region-itinerante"
                        id={`region-${rang}`}
                        data-region={rang}
                        defaultChecked={rang === 0}
                        className={styles.bassinsRadio}
                      />
                      <label htmlFor={`region-${rang}`} className={styles.bassinsEtiquette}>
                        {region.region}
                        <span aria-hidden="true" className={styles.bassinsCompte}>
                          {region.villes.length}
                        </span>
                      </label>
                    </span>
                  ))}
                </div>

                <div className={styles.bassinsPanneaux}>
                  {villes.regions.map((region, rang) => (
                    <div key={region.region} className={styles.bassinsPanneau} data-region={rang}>
                      <div className={styles.bassinsEnteteRegion}>
                        <span className={styles.bassinsNomRegion}>{region.region}</span>
                        <span className={styles.bassinsVillesCompte}>
                          {`${region.villes.length} ville${region.villes.length > 1 ? "s" : ""}`}
                        </span>
                      </div>
                      <div className={styles.bassinsVilles}>
                        {region.villes.map((ville) => (
                          <Link
                            key={ville.href}
                            href={ville.href}
                            prefetch={false}
                            className={styles.bassinsVille}
                          >
                            <span aria-hidden="true" className={styles.bassinsPuce} />
                            {ville.libelle}
                            <span aria-hidden="true" className={styles.bassinsFleche}>
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionPliableMobile>
        </div>
      </div>
    </section>
  );
}
