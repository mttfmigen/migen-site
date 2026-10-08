import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type { SectionPreuves } from "@/types/contenu";

import { etiquetteEtude, phraseDate } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * Section « 08 Références » de la capture (`maquette/rendu/offres--residence.html`) :
 * surtitre « Nos réalisations », H2 « Nos références », lien « Toutes nos
 * études de cas → », puis un rail horizontal de cartes client : photo,
 * étiquette (le client, tiré du libellé long du corpus), titre, date,
 * « Lire l'étude de cas → ».
 *
 * `blocs/Preuves.tsx` n'est pas touché : il sert le gabarit de vente.
 *
 * LES PHOTOS. Les sept prises de la maquette, identifiées le 06/10 en
 * extrayant les octets des cartes du rail de la maquette vivante puis en les
 * rapprochant de la photothèque du site (vignettes 16×16 en niveaux de gris) :
 * cinq existaient déjà dans `public/assets/web/`, deux (SUEZ, MERSEN) ont été
 * rapatriées telles quelles sous `x-technicienne-gilet.jpg` et
 * `x-tableau-ceinture.jpg`. Plus aucun remplacement « au plus proche ».
 */

export interface ProprietesReferencesOffre {
  section: SectionPreuves;
  /** La page Ville de la maquette garde la date telle qu'écrite (« d'un site… »). */
  dateBrute?: boolean;
}

/** Une photo par carte, dans l'ordre des preuves du corpus. */
/**
 * Le logo du client, posé en pastille blanche sur la photo de sa carte.
 *
 * REMESURÉ LE 07/10 (la maquette a avancé, l'ancien relevé « 87x22 » ne
 * correspond plus) : pastille blanche de 42px de haut, min-width 84px,
 * padding 0 14px, coins 12px, ombre rgba(0,0,0,0.45) 0 10px 24px -12px,
 * collée à 14px du bord bas gauche de la photo (relevé tpl 960-961 et scan
 * blanc pur 337-378 sur ref-12.png). Le logo y est CONTENU, max-height 22px :
 * sans borne de largeur il s'étirait (Stellantis rendu 266px de large sur le
 * site contre ~139px sur la maquette, GLS débordait de sa pastille).
 *
 * LA CLÉ EST LE NOM DU CLIENT, normalisé : accents retirés, espaces en tirets.
 * Le dictionnaire ne liste QUE les logos réellement présents dans le dépôt :
 * un client sans logo n'affiche pas de pastille, il n'en reçoit pas une
 * fausse. Les manques sont donc visibles plutôt que masqués.
 */
const LOGOS: Readonly<Record<string, string>> = {
  "aktid": "/assets/clients/aktid.png",
  "alstef-group": "/assets/clients/alstef-group.webp",
  "alstef": "/assets/clients/alstef.webp",
  "amazon": "/assets/clients/amazon.svg",
  "atena": "/assets/clients/atena.png",
  "autoliv": "/assets/clients/autoliv.svg",
  "bamesa": "/assets/clients/bamesa.png",
  "bledina": "/assets/clients/bledina.svg",
  "ciuch": "/assets/clients/ciuch.svg",
  "danone-bledina": "/assets/clients/danone-bledina.png",
  "danone": "/assets/clients/danone.png",
  "dimomaint": "/assets/clients/dimomaint.svg",
  "eaton": "/assets/clients/eaton.svg",
  "ecocem": "/assets/clients/ecocem.png",
  "eiffage": "/assets/clients/eiffage.svg",
  "eriks": "/assets/clients/eriks.svg",
  "gls": "/assets/clients/gls.svg",
  "groupe-atlantic": "/assets/clients/groupe-atlantic.png",
  "jacquet-brossard": "/assets/clients/jacquet-brossard.png",
  "jeld-wen": "/assets/clients/jeld-wen.png",
  "joint-lyonnais": "/assets/clients/joint-lyonnais.png",
  "jtekt": "/assets/clients/jtekt.svg",
  "la-panetiere": "/assets/clients/la-panetiere.svg",
  "mccain": "/assets/clients/mccain.svg",
  "mersen": "/assets/clients/mersen.svg",
  "motherson": "/assets/clients/motherson.svg",
  "ogf": "/assets/clients/ogf.png",
  "orthus-x-ecocem": "/assets/clients/orthus-x-ecocem.png",
  "orthus-x-washtec": "/assets/clients/orthus-x-washtec.svg",
  "rector-lesage": "/assets/clients/rector-lesage.png",
  "salaison-du-maconnais": "/assets/clients/salaison-du-maconnais.png",
  "savoye": "/assets/clients/savoye.png",
  "soprema": "/assets/clients/soprema.svg",
  "stellantis": "/assets/clients/stellantis.png",
  "suez": "/assets/clients/suez.svg",
  "timescope": "/assets/clients/timescope.png",
  "tournaire": "/assets/clients/tournaire.png",
  "valeo": "/assets/clients/valeo.svg",
  "veepee": "/assets/clients/veepee.svg",
  "vignal-systems": "/assets/clients/vignal-systems.svg",
  "voit": "/assets/clients/voit.svg",
  "washtec": "/assets/clients/washtec.svg",
};

/**
 * Logos clairs, que la maquette inverse sur la pastille blanche : relevé tpl
 * 961 des captures, OGF et Groupe Atlantic en `invert(1) hue-rotate(180deg)`,
 * tous les autres en `filter: none` (même règle que `casclients/vues-preuves`).
 */
const LOGOS_INVERSES: ReadonlySet<string> = new Set(["ogf", "groupe-atlantic"]);

/** « Groupe Atlantic » → « groupe-atlantic ». */
function cleLogo(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PASTILLE_LOGO: CSSProperties = {
  position: "absolute",
  left: 14,
  bottom: 14,
  height: 42,
  minWidth: 84,
  padding: "0 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "rgba(0,0,0,.45) 0 10px 24px -12px",
};

const PHOTOS: readonly string[] = [
  "/assets/web/x-technicienne-gilet.jpg",
  "/assets/web/team-grind-front.jpg",
  "/assets/web/x-tableau-ceinture.jpg",
  "/assets/web/team-duo.jpg",
  "/assets/web/x-logistique-entrepot.jpg",
  "/assets/web/team-grind-close.jpg",
  "/assets/web/x-soudure.jpg",
];

const ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 40,
  marginBottom: 38,
  flexWrap: "wrap",
};

/**
 * Le compteur du rail, VIDE sur les 136 captures qui portent « 08 Références »
 * (tpl 953) : il ne dit rien, mais ses marges (-10px puis 12px) posent le rail
 * 2px plus bas que l'en-tête seul. Sans lui, toute la section remontait de
 * 2px, et chaque bord de texte et de photo divergeait (Lyon, 11,3 %).
 */
const COMPTEUR: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  margin: "-10px 0 12px",
  font: "500 13px var(--fb)",
  color: "var(--ink3)",
};

/** Le logo dans sa pastille, relevé tpl 961 : taille propre, bornée à 112x22. */
const LOGO: CSSProperties = {
  maxHeight: 22,
  maxWidth: 112,
  width: "auto",
  height: "auto",
  objectFit: "contain",
  display: "block",
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "24ch",
  textWrap: "balance",
};

const LIEN_TOUTES: CSSProperties = {
  font: "600 15px var(--fb)",
  color: "var(--acc)",
  flex: "0 0 auto",
  paddingBottom: 6,
};

const RAIL: CSSProperties = {
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "minmax(280px,320px)",
  gap: 14,
  overflowX: "auto",
  padding: "4px 2px 16px",
  WebkitMaskImage:
    "linear-gradient(to right,#000 calc(100% - 70px),transparent)",
  maskImage: "linear-gradient(to right,#000 calc(100% - 70px),transparent)",
};

const CARTE: CSSProperties = {
  scrollSnapAlign: "start",
  display: "flex",
  flexDirection: "column",
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  boxShadow: "0 1px 1px rgba(0,0,0,.04)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

const CADRE_PHOTO: CSSProperties = {
  height: 150,
  background: "var(--ph)",
  overflow: "hidden",
  flex: "0 0 auto",
  position: "relative",
};

const ETIQUETTE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

const TITRE_CARTE: CSSProperties = {
  font: "600 19px/1.3 var(--ft)",
  letterSpacing: "-.025em",
  marginTop: 12,
};

const DATE_CARTE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
  marginTop: 10,
  marginBottom: 18,
};

const PIED_CARTE: CSSProperties = {
  marginTop: "auto",
  paddingTop: 18,
  borderTop: "1px solid var(--line)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const FLECHE: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  font: "600 15px var(--fb)",
};

export default function ReferencesOffre({ section, dateBrute = false }: ProprietesReferencesOffre) {
  const preuves = section.preuves.filter(
    (preuve) => !!preuve.lienHref && estCheminInterne(preuve.lienHref),
  );

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 16 }}>
              Nos réalisations
            </div>
            <h2 style={TITRE}>Nos références</h2>
          </div>
          <Link href="/preuves/" prefetch={false} style={LIEN_TOUTES}>
            Toutes nos études de cas →
          </Link>
        </div>
        <div style={COMPTEUR} />
        {/* La classe `g3-refrail` branche le rail sur le moteur d'auto-
            défilement de `Moteurs.tsx` (0,45 px par image), comme dans la
            maquette : sans elle, le rail du site restait immobile là où celui
            de la capture défile seul. */}
        <div className="g3-refrail" style={RAIL}>
          {preuves.map((preuve, rang) => (
            <Link
              key={preuve.lienHref}
              href={preuve.lienHref!}
              prefetch={false}
              className={styles.carteReference}
              style={CARTE}
            >
              <div style={CADRE_PHOTO}>
                <Image
                  src={preuve.photo ?? PHOTOS[rang % PHOTOS.length]}
                  alt=""
                  fill
                  sizes="320px"
                  style={{
                    objectFit: "cover",
                    filter: "saturate(var(--sat)) contrast(1.05)",
                  }}
                />
                {(() => {
                  // Le client peut manquer (le corpus n'a pas toujours de
                  // libellé long), et son logo peut manquer aussi : dans les
                  // deux cas, pas de pastille plutôt qu'une fausse.
                  const client = etiquetteEtude(preuve);
                  const cle = client ? cleLogo(client) : "";
                  // La fiche peut nommer le fichier exact de la capture
                  // (identifié par ses octets) : il prime sur le dictionnaire.
                  const logo = (preuve as { logo?: string }).logo ?? LOGOS[cle];
                  if (!client || !logo) return null;
                  return (
                    <div style={PASTILLE_LOGO}>
                      {/* Comme la capture : le logo garde ses proportions,
                          borné à 112x22, servi tel quel pour que sa taille
                          propre soit celle du fichier. */}
                      <Image
                        src={logo}
                        alt={client}
                        width={112}
                        height={22}
                        unoptimized
                        style={{ ...LOGO, filter: LOGOS_INVERSES.has(cle) ? "invert(1) hue-rotate(180deg)" : "none" }}
                      />
                    </div>
                  );
                })()}
              </div>
              <div
                style={{
                  padding: "24px 26px 28px",
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 0%",
                }}
              >
                <div style={ETIQUETTE}>{etiquetteEtude(preuve)}</div>
                <div style={TITRE_CARTE}>{preuve.titre}</div>
                <div style={DATE_CARTE}>{dateBrute ? preuve.texte : phraseDate(preuve.texte)}</div>
                <div style={PIED_CARTE}>
                  <span style={{ font: "600 14px var(--fb)", color: "var(--ink)" }}>
                    Lire l’étude de cas
                  </span>
                  <span aria-hidden="true" style={FLECHE}>
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
