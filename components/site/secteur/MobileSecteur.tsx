import Image from "next/image";
import type { ReactNode } from "react";

import { ligneDuCorpus, resumeDe } from "@/components/site/blocs/resume-de-section";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import TexteRiche, { enTexteNu, estCheminInterne } from "@/components/site/blocs/TexteRiche";
import { continueLeTitre } from "@/components/site/blocs/TitreEtSuite";
import { logoClient } from "@/components/site/casclients/vues-preuves";
import { nomClient } from "@/components/site/preuve/noms-clients";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import { IconeFleche } from "@/components/site/mobile/BarreCollanteMobile";
import {
  CIBLE_CONTACT,
  rappelFinalVisible,
  varianteDe,
  type LibelleCible,
} from "@/components/site/mobile/conversion-donnees";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import {
  coupePunchline,
  etiquetteEtude,
  majusculeInitiale,
  numerote,
} from "@/components/site/offre/texte-offre";
import { accrocheDuDeroule } from "@/components/site/offre/DerouleOffre";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { appliqueDecisions } from "@/lib/decisions-copie";
import { altPhoto } from "@/lib/descriptions-photos";
import type { Preuve, PrestationBenefice, Section, TypeSection } from "@/types/contenu";
import type { ContenuSecteurOffre } from "@/types/secteur";

import { CORPUS_OFFRE } from "./corpus-offre";
import s from "./MobileSecteur.module.css";

/**
 * LE GABARIT « 08 SECTEUR » AU TÉLÉPHONE, TEL QUE LA MAQUETTE MOBILE V2 LE REND
 * (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`, `renderVals()`,
 * blocs `isDetails`/`isH`, `isKv`, `isOl`, `isTitle`, `isQ`).
 *
 * POURQUOI UN RENDU À PART, ET PAS LES ÉCRANS DE BUREAU RESTYLÉS. Les six écrans
 * de contenu de la page (problème, offre, déroulé, garanties, références,
 * questions) sont des composants d'AUTRES gabarits (offre, domaine, hub
 * d'offres) : les redessiner de l'extérieur, c'était battre leurs styles en
 * ligne un par un, et casser à leur prochaine retouche. Ici, la même donnée
 * (`contenu.sections`) est rendue une seconde fois, au dessin de la maquette,
 * sous `data-mobile-seulement` ; les écrans de bureau quittent l'écran sous
 * 881 px (`PageSecteur.module.css`, `.bureauSeulement`). Au-dessus de 880 px,
 * rien de ce fichier n'existe à l'écran.
 *
 * MAQUETTE V3 (16/10) : ce que la V3 ne dessine pas n'est plus repris ici,
 * et reste servi par l'écran de bureau : sur-titres (« Votre problématique »,
 * « Notre méthode », « Notre parti pris »), phrases clés de « L'offre » et du
 * « Déroulé », compteurs (« 7 points », « 6 étapes », retirés à la demande de
 * Mehdi), bouton « Démarrer par l'audit ». La question de la bande « 07
 * Appel » passe dans « Ce que nous garantissons », comme dans la V3.
 *
 * Les références ont leur rail à elles (`RailReferences`, dc.html
 * `isRefList`) ; `ReferencesOffre` reste servi par l'écran de bureau.
 *
 * Les cartes sont des `SectionPliableMobile` : servies OUVERTES (Google lit
 * tout), refermées au montage sous 881 px, sauf la première et les références,
 * que la maquette ouvre (dc.html, `dI++ < nOpen` et `isRef`).
 */

function sectionDeType<T extends TypeSection>(
  sections: readonly Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((x) => x.type === type) as Extract<Section, { type: T }> | undefined;
}

/**
 * La photo de tête de la maquette V3, là où c'est une photo de la répartition
 * (`lib/photos-autorisees.ts`, photos de l'équipe Migen). Relevé le 16/10 sur
 * les octets du fond de la V3 (égalité sha256, sinon empreinte 32x32) : les
 * neuf autres pages y portent `x-robotique` ou une `mq-*` (logistique et ses
 * deux filles : `mq-29ebb1b81ced`, la même image que `x-logistique-entrepot`),
 * toutes hors de la répartition ; elles gardent la photo du site.
 */
const PHOTO_TETE_V3: Readonly<Record<string, string>> = {
  "/secteurs/agroalimentaire/": "/assets/web/sv-convoyeur.jpg",
  "/secteurs/industrie-metallique/": "/assets/web/team-grind-sparks.jpg",
  "/secteurs/pharmaceutique/": "/assets/web/sv-armoire.jpg",
};

/** La photo du haut de page : celle de la V3, sinon une photo que la page porte déjà sur bureau. */
export function photoDeTete(contenu: ContenuSecteurOffre, chemin?: string): string | undefined {
  const preuves = sectionDeType(contenu.sections, "preuves");
  return (
    (chemin ? PHOTO_TETE_V3[chemin] : undefined) ??
    contenu.problemePhoto ??
    contenu.expertises?.[0]?.photo ??
    preuves?.preuves.find((p) => p.photo)?.photo ??
    undefined
  );
}

/** La photo 16/10 du haut de page (dc.html, `hero.hasImg`). */
export function PhotoTeteMobile({ photo }: { photo?: string }) {
  if (!photo) return null;
  return (
    <div data-mobile-seulement="" className={s.photoTete}>
      {/* `sizes` : au-dessus de 880 px le cadre n'est pas affiché. « 1vw » et
          non « 1px » : Next ne garde dans le srcset que les largeurs >= 640 x
          le plus petit vw cité ; avec « 1px » le bureau chargeait le 640 px,
          que Chrome resservait à la première carte « Expertises » de même
          photo (bureau différent de la référence). Avec « 1vw », 16 px. */}
      <Image
        src={photo}
        alt={altPhoto(photo)}
        fill
        priority
        sizes="(max-width: 880px) 100vw, 1vw"
        style={{ objectFit: "cover", objectPosition: cadragePhoto(photo, 16 / 10) }}
      />
    </div>
  );
}

/** Le bouton téléphone à côté de l'appel à l'action (dc.html, `hero.tel`). */
export function TelephoneMobile() {
  return (
    <a data-mobile-seulement="" href={TELEPHONE_SITE.href} className={s.telephone}>
      {TELEPHONE_SITE.affichage}
    </a>
  );
}

/* ------------------------------------------------------------- les blocs */

interface Ligne {
  cle: string;
  h?: ReactNode;
  d?: ReactNode;
}

/** « Libellé : texte » en petites cartes numérotées (dc.html, `isKv`). */
function ListeKv({ lignes }: { lignes: readonly Ligne[] }) {
  return (
    <div className={s.kv}>
      {lignes.map((ligne, rang) => (
        <div key={ligne.cle} className={s.kvCarte}>
          <span className={s.kvNumero}>{numerote(rang)}</span>
          <div className={s.kvCorps}>
            {ligne.h ? <div className={s.kvTitre}>{ligne.h}</div> : null}
            {ligne.d ? <div className={ligne.h ? s.kvTexte : s.kvTitre}>{ligne.d}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Le bouton plein de la V3 (`isBtnQ`) : pilule orange, pastille flèche à droite. */
function BoutonFleche({ href, libelle }: { href: string; libelle: string }) {
  return (
    <a href={href} className={s.boutonFleche}>
      <span>{libelle}</span>
      <span className={s.pastilleFleche}>
        <IconeFleche />
      </span>
    </a>
  );
}

/** Une carte blanche numérotée, son titre DANS la carte (dc.html, `isH`). */
function Carte({
  titre,
  resume,
  ouverte = false,
  children,
}: {
  titre: string;
  resume?: string;
  ouverte?: boolean;
  children: ReactNode;
}) {
  return (
    <SectionPliableMobile
      toujoursOuvert={ouverte}
      resume={resume}
      enTete={
        <h2 data-carte-titre="">{titre}</h2>
      }
    >
      {children}
    </SectionPliableMobile>
  );
}

/**
 * Le paragraphe d'ouverture de « Nos références » que le corpus de la maquette
 * porte et que la fiche n'a pas (`secteurs--pharmaceutique.md`, mot pour mot).
 * ponytail: table par chemin, à descendre dans `SectionPreuves` (champ
 * `chapeau`) le jour où une deuxième page en a un.
 */
const INTRO_REFERENCES: Readonly<Record<string, string>> = {
  "/secteurs/pharmaceutique/":
    "Nous ne publions pas de cas client pharmaceutique : nos clients du secteur ne nous y autorisent pas. Voici des environnements qui partagent vos exigences, hygiène, traçabilité et discipline documentaire, sur des cas réellement documentés.",
};

/* ------------------------------------------------------------ L'offre */

/** Les en-têtes du tableau de la V3, quand le corpus n'en porte pas. */
const ENTETES_OFFRE = ["Ce que nous faisons", "Ce que ça change pour vous"];

/** Le phrasé de la carte « Ce que nous garantissons » de la V3 sous son bouton (corpus, 12 pages sur 12). */
const APPEL_TELEPHONE = `Ou appelez le ${TELEPHONE_SITE.affichage}, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.`;

interface LigneTableau {
  faisons: string;
  change: string;
}

interface TableauRendu {
  entetes: readonly string[];
  lignes: LigneTableau[];
}

/**
 * Le texte nu, sans casse ni ponctuation : ce qui compare le corpus à la fiche.
 * « Astreinte la nuit, le week-end et les jours fériés » vaut « Astreinte » :
 * la fiche porte le renommage global que `lib/decisions-copie.ts` (12/10)
 * décrit, le corpus V3 la forme d'avant. Sans cela, deux lignes (logistique,
 * peak-season) gardaient le texte de la fiche, tout en gras et sans virgule.
 */
const cle = (texte: string) =>
  enTexteNu(texte)
    .replace(/(astreinte)\s+la nuit,\s*le week-end et les jours f[eé]ri[eé]s/giu, "$1")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");

/** Une ligne telle que la fiche la porte, l'accroche en gras. */
function faisonsDeLaFiche(ligne: PrestationBenefice): string {
  const { accroche, texte } = ligne.prestation;
  return [accroche ? `**${accroche}**` : "", texte ?? ""].filter(Boolean).join(" : ");
}

/**
 * LES TABLEAUX DE « L'OFFRE » AU DESSIN DE LA V3 (`isTb`) : en-têtes, puis
 * une petite carte par ligne. La fiche a perdu à l'import la virgule et le
 * gras de la première cellule (« … marche en avant tenues dédiées… ») et a
 * pris l'en-tête du second tableau pour une ligne : le corpus V3
 * (`corpus-offre.ts`) les rend, MAIS SEULEMENT là où son texte nu est celui de
 * la fiche, décisions de copie appliquées. Une ligne qui diffère garde le
 * texte de la fiche ; une page dont le décompte diffère, la fiche entière.
 * « Ce que ça change pour vous » vient toujours de la fiche.
 */
export function tableauxDeLOffre(lignes: readonly PrestationBenefice[], chemin: string): TableauRendu[] {
  const site = lignes.map((l) => ({ faisons: faisonsDeLaFiche(l), change: l.benefice }));
  const repli = [{ entetes: ENTETES_OFFRE, lignes: site }];
  const corpus = CORPUS_OFFRE[chemin];
  if (!corpus) return repli;
  let i = 0;
  const tableaux = corpus.tableaux.map((tableau, rang) => {
    if (rang > 0 && site[i] && cle(site[i].faisons) === cle(tableau.entetes[0] ?? "")) i += 1;
    return {
      entetes: tableau.entetes,
      lignes: tableau.faisons.map((brut) => {
        const ligne = site[i++];
        const v3 = appliqueDecisions(brut, chemin);
        return ligne && brut && cle(v3) === cle(ligne.faisons) ? { ...ligne, faisons: v3 } : ligne;
      }),
    };
  });
  const complet = i === site.length && tableaux.every((t) => t.lignes.every(Boolean));
  return complet ? tableaux : repli;
}

function TableauxOffre({ tableaux }: { tableaux: readonly TableauRendu[] }) {
  return tableaux.map((tableau, rang) => (
    <div key={tableau.entetes.join() || rang} className={s.tableau}>
      <div className={s.enteteListe}>{tableau.entetes.join(" · ")}</div>
      {tableau.lignes.map((ligne) => (
        <div key={ligne.faisons} className={s.ligneTableau}>
          <div className={s.faisons}>
            <TexteRiche texte={ligne.faisons} />
          </div>
          {ligne.change ? (
            <div>
              {tableau.entetes[1] ? <div className={s.enteteCellule}>{tableau.entetes[1]}</div> : null}
              <div className={s.change}>
                <TexteRiche texte={ligne.change} />
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  ));
}

/** Les logos clairs que la maquette inverse (dc.html `logoOf`, `lg.inv`). */
const LOGOS_INVERSES = /groupe-atlantic|ogf|orthus/;

/**
 * Le rail des références tel que la maquette le dessine (dc.html `isRefList`) :
 * photo et pastille du logo, titre, suite en minuscule, puis le lien « Lire le
 * cas → » de la V3 (`linkT`), le client étant nommé par sa pastille. Aucun
 * texte neuf : titre et suite sont les champs de la fiche. La photo
 * est celle de la fiche ; sans elle, le fond gris de la maquette, jamais une
 * photo d'un autre chantier.
 */
function RailReferences({ preuves }: { preuves: readonly Preuve[] }) {
  const cartes = preuves.filter((p) => !!p.lienHref && estCheminInterne(p.lienHref));
  return (
    <div className={s.rail}>
      {cartes.map((preuve) => {
        const client = etiquetteEtude(preuve);
        const logo = client ? logoClient(client) : "";
        const nom = client ? nomClient(client) : undefined;
        // La suite du corpus, sans sa ponctuation d'attache, point final
        // compris comme dans la maquette (« site de Steenvoorde. »).
        const nue = preuve.texte?.replace(/^\s*[:.,–—-]\s*/u, "").trim();
        const suite = nue && !/[.!?]$/.test(nue) ? `${nue}.` : nue;
        return (
          <div key={preuve.lienHref} className={s.carteRef}>
            <div className={s.carteRefPhoto}>
              {preuve.photo ? (
                <Image
                  src={preuve.photo}
                  alt={altPhoto(preuve.photo)}
                  fill
                  sizes="252px"
                  style={{ objectFit: "cover", objectPosition: cadragePhoto(preuve.photo, 252 / 118) }}
                />
              ) : null}
              {client ? (
                <span className={s.carteRefLogo}>
                  {logo ? (
                    <Image
                      src={logo}
                      alt={nom ?? ""}
                      width={64}
                      height={16}
                      unoptimized
                      style={LOGOS_INVERSES.test(logo) ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
                    />
                  ) : (
                    client
                  )}
                </span>
              ) : null}
            </div>
            <div className={s.carteRefCorps}>
              <div className={s.carteRefTitre}>
                <TexteRiche texte={preuve.titre} />
              </div>
              {suite ? (
                <div className={s.carteRefSuite}>
                  <TexteRiche texte={suite} />
                </div>
              ) : null}
              {/* Huit liens « Lire le cas » vers huit études : le nom lu
                  nomme le client, et commence par le texte vu. */}
              <a href={preuve.lienHref} className={s.carteRefLien} aria-label={nom ? `Lire le cas ${nom}` : undefined}>
                Lire le cas <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ la page */

export interface ProprietesSectionsMobilesSecteur {
  contenu: ContenuSecteurOffre;
  chemin: string;
  photoHeros?: string;
  bouton?: LibelleCible;
}

/**
 * Les cinq cartes numérotées et leur cadence de conversion, la FAQ en liste,
 * puis l'appel « 07 » en bandeau. Ordre de la maquette : 01 Le problème,
 * 02 L'offre, photo + CTA, 03 Le déroulé, 04 Ce que nous garantissons,
 * 05 Nos références, bandeau « Une question sur votre site ? », Questions
 * fréquentes.
 */
export default function SectionsMobilesSecteur({ contenu, chemin, photoHeros, bouton }: ProprietesSectionsMobilesSecteur) {
  const { sections } = contenu;
  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");
  const tableaux = offre ? tableauxDeLOffre(offre.lignes, chemin) : [];
  /* La prose sous le tableau : celle du corpus V3 (liens compris), sinon celle de la fiche. */
  const proseCorpus = (CORPUS_OFFRE[chemin]?.prose ?? []).map((p) => appliqueDecisions(p, chemin));
  const prose = proseCorpus.length
    ? proseCorpus
    : (offre?.prose ?? []).map((p) => [p.accroche && `**${p.accroche}**`, p.texte].filter(Boolean).join(" "));
  /* Un complément de la fiche que la prose du corpus contient déjà n'est pas répété. */
  const complements = (contenu.complementOffre ?? [])
    .filter((b) => b.titre || b.texte || b.puces?.length)
    .filter((b) => b.titre || b.puces?.length || !prose.some((p) => cle(p).includes(cle(b.texte ?? ""))));
  const bref = contenu.brefBande;

  const cartes: ReactNode[] = [
    probleme ? (
      <Carte
        key="probleme"
        titre="Le problème"
        ouverte
        resume={probleme.punchline || resumeDe(probleme.puces.map((p) => p.accroche ?? p.texte))}
      >
        <p className={s.phraseCle}>
          {[coupePunchline(probleme.punchline).titre, coupePunchline(probleme.punchline).suite].filter(Boolean).join(" ")}
        </p>
        <ListeKv
          lignes={probleme.puces.map((p) => ({
            cle: p.accroche ?? p.texte,
            h: p.accroche ? <TexteRiche texte={p.accroche} /> : undefined,
            d: <TexteRiche texte={p.texte} />,
          }))}
        />
      </Carte>
    ) : null,

    offre ? (
      /* L'accroche de la V3 (`teaseOf`) : la première cellule du premier
         tableau, en texte nu. */
      <Carte
        key="offre"
        titre="L’offre"
        resume={enTexteNu(tableaux[0]?.lignes[0]?.faisons ?? prose[0] ?? "") || undefined}
      >
        {/* Sans compteur « N points » : retiré à la demande de Mehdi le 15/10. */}
        <TableauxOffre tableaux={tableaux} />
        {prose.map((texte) => (
          <p key={texte} className={s.texte}>
            <TexteRiche texte={texte} />
          </p>
        ))}
        {complements.map((bloc, rang) => (
          <div key={bloc.titre ?? `complement-${rang}`}>
            {bloc.titre ? <h3 className={s.intertitre}>{bloc.titre}</h3> : null}
            {bloc.texte ? <p className={s.texte}>{bloc.texte}</p> : null}
            {bloc.puces?.length ? (
              <ul className={s.puces}>
                {bloc.puces.map((puce) => (
                  <li key={puce.accroche ?? puce.texte}>
                    {puce.accroche ? <strong>{puce.accroche} </strong> : null}
                    {puce.texte}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </Carte>
    ) : null,

    deroule ? (
      <Carte key="deroule" titre="Le déroulé" resume={accrocheDuDeroule(deroule)}>
        {/* La frise de la V3 (`isTl`) : pastilles orangées reliées d'un filet,
            ni phrase clé, ni compteur « N étapes » (retiré à la demande de
            Mehdi), ni bouton : la V3 n'en dessine aucun, et la phrase comme
            le bouton restent servis par l'écran de bureau. */}
        <ol className={s.frise}>
          {deroule.etapes.map((etape, rang) => (
            <li key={etape.titre}>
              <span className={s.friseNumero}>{numerote(rang)}</span>
              <span className={s.friseTexte}>
                {etape.texte && continueLeTitre(etape.texte) ? (
                  <span className={s.friseSuite}>
                    <strong>{etape.titre}</strong>
                    <TexteRiche texte={etape.texte} />
                  </span>
                ) : (
                  <>
                    <strong className={s.friseTitre}>{etape.titre}</strong>
                    {etape.texte ? (
                      <span className={s.friseSuite}>
                        <TexteRiche texte={majusculeInitiale(etape.texte)} />
                      </span>
                    ) : null}
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
      </Carte>
    ) : null,

    garanties ? (
      <Carte
        key="garanties"
        titre="Ce que nous garantissons"
        resume={garanties.puces[0] ? ligneDuCorpus(garanties.puces[0]) : undefined}
      >
        <ListeKv
          lignes={garanties.puces.map((p) => ({
            cle: p.accroche ?? p.texte,
            h: p.accroche,
            d: p.suitAccroche ? p.texte : majusculeInitiale(p.texte),
          }))}
        />
        {/* La V3 ferme la carte sur l'appel du corpus (`isBtnQ`) : la question
            de la bande « 07 Appel » du bureau, son bouton vers /contact/,
            puis la ligne du téléphone. */}
        {bref ? (
          <>
            <p className={s.phraseCle}>
              <TexteRiche texte={bref} />
            </p>
            {contenu.brefBouton?.libelle ? (
              <BoutonFleche href={CIBLE_CONTACT} libelle={contenu.brefBouton.libelle} />
            ) : null}
            <p className={s.texte}>{APPEL_TELEPHONE}</p>
          </>
        ) : null}
      </Carte>
    ) : null,

    preuves?.preuves.length ? (
      <Carte key="references" titre="Nos références" ouverte>
        {INTRO_REFERENCES[chemin] ? <p className={s.chapeau}>{INTRO_REFERENCES[chemin]}</p> : null}
        <RailReferences preuves={preuves.preuves} />
      </Carte>
    ) : null,
  ].filter(Boolean);

  return (
    <div data-mobile-seulement="" className={s.racine}>
      <AvecConversionMobile chemin={chemin} gabarit="08" photoHeros={photoHeros} bouton={bouton} rappelFinal={false}>
        {cartes}
      </AvecConversionMobile>

      {objections?.questions.length ? (
        <section className={s.faq}>
          {/* dc.html `isTitle` : le seul titre « Questions fréquentes ». Le
              titre et le lien de bureau restent servis par `QuestionsPhoto`. */}
          <h2 data-faq-titre="">Questions fréquentes</h2>
          <div data-faq-liste="">
            {objections.questions.map((q) => (
              <details key={q.question} name="faq-secteur">
                <summary>
                  <h3>
                    <TexteRiche texte={q.question} />
                  </h3>
                  <span aria-hidden="true">+</span>
                </summary>
                <div>
                  <p>
                    <TexteRiche texte={q.reponse ?? ""} />
                  </p>
                </div>
              </details>
            ))}
            {/* La 7e question de la maquette : la question de clôture du
                corpus, sa réponse est le bouton à flèche de la V3 (`isBtnQ`),
                puis la ligne d'appel du corpus (dc.html, `x.faq`, dernier
                élément). */}
            {ctaFinal?.question ? (
              <details name="faq-secteur">
                <summary>
                  <h3>
                    <TexteRiche texte={ctaFinal.question} />
                  </h3>
                  <span aria-hidden="true">+</span>
                </summary>
                <div>
                  <BoutonFleche href={ctaFinal.href ?? CIBLE_CONTACT} libelle={ctaFinal.bouton} />
                  <p>{ctaFinal.rappel ?? APPEL_TELEPHONE}</p>
                </div>
              </details>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* dc.html L134 puis L138 : « Dans la même rubrique », puis le rappel
          final « Être rappelé ». Les écrans de bureau sans dessin mobile
          (`annexe` de `PageSecteur`) viennent APRÈS, repliés. */}
      <PastillesCocon chemin={chemin} />
      {rappelFinalVisible(chemin) ? <RappelFinalMobile variante={varianteDe(chemin, "08")} /> : null}
    </div>
  );
}
