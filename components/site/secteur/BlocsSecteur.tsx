import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  ANCRE_FORMULAIRE,
  LARGEUR,
  SECTION,
  SURTITRE,
  lienTelephone,
} from "@/components/site/blocs/habillage";
import type {
  Paragraphe,
  SectionChiffres,
  SectionDeroule,
  SectionGaranties,
  SectionHeros,
  SectionOffre,
} from "@/types/contenu";

import {
  CHROME,
  LOGO_BLANC,
  PHOTO_BANDEAU,
  PHOTO_DEROULE,
  PHOTO_HERO,
  rang,
  sansDisponibiliteChiffree,
} from "./contenu-maquette";
import * as H from "./habillage-gabarit08";
import styles from "./PageSecteur.module.css";

/**
 * Les DOUZE sections du gabarit 08 SECTEUR, une fonction par section.
 *
 * Fichier de DESSIN. Il ne décide pas ce qui se rend : c'est `PageSecteur.tsx`
 * qui ordonne et qui écarte une section que le corpus n'alimente pas. Chaque
 * export porte le `data-screen-label` de la maquette d'où il sort, et lit ses
 * valeurs dans `habillage-secteur.ts` (jeu `G8_`), relevées dans
 * `maquette/gabarit-08-secteur.html`.
 *
 * Composants SERVEUR, sauf le formulaire qui est déjà un composant client
 * autonome. Aucun état ici. Les révélations au défilement sont posées en
 * `data-reveal` et animées par `components/site/Moteurs.tsx`, monté une fois
 * dans la mise en page racine.
 */

/** Le surtitre orange, motif commun à huit sections du gabarit. */
function Surtitre({ children }: { children: string }) {
  return <div style={SURTITRE}>{children}</div>;
}

/* ------------------------------------------------------------- 01 Héros */

export function Heros({
  titre,
  heros,
  chiffres,
}: {
  titre: string;
  heros: SectionHeros;
  chiffres?: SectionChiffres;
}) {
  const reperes = chiffres?.chiffres ?? [];
  const delai = heros.phraseDelai
    ? sansDisponibiliteChiffree(heros.phraseDelai)
    : "";

  return (
    <div
      className={styles.deuxColonnes}
      style={{
        display: "grid",
        gridTemplateColumns: H.HERO_GRILLE,
        gap: 52,
        alignItems: "start",
      }}
    >
      <div>
        <span style={H.PASTILLE}>
          <span style={H.PASTILLE_PUCE} />
          {CHROME.pastilleHero}
        </span>
        <h1 style={H.TITRE1}>{titre}</h1>
        {heros.mecanisme ? (
          <p style={H.CHAPEAU}>
            <TexteRiche texte={heros.mecanisme} />
          </p>
        ) : null}

        {heros.cta || heros.telephone ? (
          <div style={H.RANGEE_BOUTONS}>
            {heros.cta ? (
              <a
                href={ANCRE_FORMULAIRE}
                className={styles.boutonPrincipal}
                style={H.BOUTON}
              >
                {heros.cta}
              </a>
            ) : null}
            {heros.telephone ? (
              <a
                href={lienTelephone(heros.telephone)}
                className={styles.boutonSecondaire}
                style={H.BOUTON_TEL}
              >
                {heros.telephone}
              </a>
            ) : null}
          </div>
        ) : null}

        {delai ? (
          <div style={H.DELAI_RANGEE}>
            <span style={H.DELAI_PUCE} />
            <p style={H.DELAI_TEXTE}>
              <TexteRiche texte={delai} />
            </p>
          </div>
        ) : null}
      </div>

      {/* Le panneau en verre ne se rend QUE s'il a des chiffres à porter : sans
          eux il ne resterait que la photo, et une photo seule à droite du titre
          n'est pas ce que la maquette dessine. */}
      {reperes.length > 0 ? (
        <div style={H.PANNEAU_BREF}>
          <div style={{ height: 250, background: "#dedfe1", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO_HERO}
              alt="Technicien Migen en intervention"
              width={520}
              height={250}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.05)",
              }}
            />
          </div>
          <div style={{ padding: "26px 28px 28px" }}>
            <div style={{ ...SURTITRE, marginBottom: 14 }}>
              {CHROME.brefSurtitre}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {reperes.map((repere) => (
                <div
                  key={`${repere.valeur}-${repere.libelle}`}
                  style={H.BREF_RANGEE}
                >
                  <span style={H.BREF_VALEUR}>{repere.valeur}</span>
                  <span style={H.BREF_LIBELLE}>{repere.libelle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------- 02 Photo et logos */

export function PhotoEtLogos({
  punchTitre,
  clients,
}: {
  punchTitre: string;
  clients: readonly string[];
}) {
  /* La bande défile en répétant la liste deux fois : c'est ce qui rend la
     boucle continue à `translateX(-50%)`. La seconde moitié est `aria-hidden`,
     elle n'existe que pour l'œil. Sous cinq noms la maquette double la liste
     avant de la répéter, sinon le ruban aurait des trous. */
  const base = clients.length > 0 && clients.length < 5
    ? [...clients, ...clients]
    : clients;

  return (
    <section
      data-reveal=""
      style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 40px 0" }}
    >
      <div style={H.PHOTO_CADRE}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTO_BANDEAU}
          alt="Installations industrielles"
          width={1200}
          height={420}
          style={{
            width: "100%",
            height: 420,
            objectFit: "cover",
            display: "block",
            filter: "saturate(var(--sat)) contrast(1.06)",
          }}
        />
        <div style={H.PHOTO_VOILE} />
        <div style={H.PHOTO_SIGNATURE}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_BLANC}
            alt=""
            width={74}
            height={22}
            style={{ height: 22, width: "auto" }}
          />
          <span style={H.PHOTO_SIGNATURE_TEXTE}>
            {CHROME.photoSignature}
          </span>
        </div>
        {punchTitre ? (
          <div className={styles.tuiles} style={H.PHOTO_TITRE_CADRE}>
            <div style={H.PHOTO_TITRE}>{punchTitre}</div>
          </div>
        ) : null}
      </div>

      {/* La bande de logos disparaît sans noms de clients : le corpus les tire
          des études de cas, et une bande vide annoncerait une confiance qu'on
          ne saurait pas nommer. */}
      {base.length > 0 ? (
        <>
          <div style={H.LOGOS_ENTETE}>
            <span style={H.LOGOS_SURTITRE}>{CHROME.logosSurtitre}</span>
            <span style={H.LOGOS_FILET} />
          </div>
          <div className="mg-marquee" style={H.LOGOS_FENETRE}>
            <div
              className={`mg-track ${styles.ruban}`}
              style={H.LOGOS_RUBAN}
            >
              {[0, 1].map((passe) =>
                base.map((nom, i) => (
                  <span
                    key={`${passe}-${i}-${nom}`}
                    aria-hidden={passe === 1 ? "true" : undefined}
                    style={H.LOGO_NOM}
                  >
                    {nom}
                  </span>
                )),
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

/* --------------------------------------------------------- 03 Problème */

export function Probleme({
  punchTitre,
  punchTexte,
  puces,
}: {
  punchTitre: string;
  punchTexte: string;
  puces: readonly Paragraphe[];
}) {
  return (
    <section style={H.SECTION_PANNEAU}>
      <div
        className={`${styles.deuxColonnes} ${styles.panneauRembourre}`}
        data-reveal=""
        style={H.PROBLEME_PANNEAU}
      >
        <div className={styles.collant} style={H.COLLANT}>
          <Surtitre>{CHROME.problemeSurtitre}</Surtitre>
          {punchTitre ? <h2 style={H.TITRE2_CLAIR}>{punchTitre}</h2> : null}
          {punchTexte ? (
            <p style={H.PROBLEME_TEXTE}>
              <TexteRiche texte={punchTexte} />
            </p>
          ) : null}
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {puces.map((puce) => (
            <div key={puce.texte} style={H.CARTE_CONTRAINTE}>
              <span style={H.CONTRAINTE_ANNEAU} />
              <div>
                {puce.accroche ? (
                  <div style={H.CONTRAINTE_TITRE}>
                    <TexteRiche texte={puce.accroche} />
                  </div>
                ) : null}
                <div style={H.CONTRAINTE_TEXTE}>
                  <TexteRiche texte={puce.texte} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ 04 Offre */

export function Offre({ offre }: { offre: SectionOffre }) {
  const notes = offre.prose ?? [];

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <Surtitre>{CHROME.offreSurtitre}</Surtitre>
          <h2 style={H.TITRE2}>{CHROME.offreTitre}</h2>

          <div style={H.OFFRE_CADRE}>
            {/* L'en-tête de colonnes disparaît sous 900px : la grille passe sur
                une colonne et les intitulés ne surmontent plus rien. */}
            <div
              className={`${styles.rangeeOffre} ${styles.enteteOffre}`}
              style={H.OFFRE_ENTETE}
            >
              <span />
              <span style={H.OFFRE_ENTETE_GAUCHE}>
                {CHROME.offreEnteteGauche}
              </span>
              <span style={H.OFFRE_ENTETE_DROITE}>
                {CHROME.offreEnteteDroite}
              </span>
            </div>
            {offre.lignes.map((ligne, i) => (
              <div
                key={`${ligne.prestation.accroche ?? ""}-${ligne.prestation.texte}`}
                className={styles.rangeeOffre}
                style={H.OFFRE_RANGEE}
              >
                <span style={H.OFFRE_NUMERO}>{rang(i)}</span>
                <div style={H.OFFRE_PRESTATION}>
                  {ligne.prestation.accroche ? (
                    <strong style={H.OFFRE_ACCROCHE}>
                      <TexteRiche texte={ligne.prestation.accroche} />
                    </strong>
                  ) : null}
                  {/* Le corpus écrit la suite de l'accroche en commençant par
                      une virgule (« …à la marche en avant », « , tenues dédiées
                      … »). La maquette la retire, l'accroche étant passée sur sa
                      propre ligne. */}
                  <TexteRiche texte={ligne.prestation.texte.replace(/^[,.]\s*/, "")} />
                </div>
                {ligne.benefice ? (
                  <div style={H.OFFRE_BENEFICE}>
                    <span style={H.OFFRE_FLECHE} aria-hidden="true">
                      &rarr;
                    </span>
                    <span style={H.OFFRE_BENEFICE_TEXTE}>
                      <TexteRiche texte={ligne.benefice} />
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {notes.length > 0 ? (
            <div style={H.OFFRE_NOTE}>
              {notes.map((note) => (
                <p key={note.texte} style={H.OFFRE_NOTE_TEXTE}>
                  {note.accroche ? (
                    <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                      <TexteRiche texte={note.accroche} />{" "}
                    </strong>
                  ) : null}
                  <TexteRiche texte={note.texte} />
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- 05 Déroulé */

export function Deroule({ deroule }: { deroule: SectionDeroule }) {
  return (
    <section style={SECTION}>
      <div
        className={styles.deuxColonnes}
        data-reveal=""
        style={{
          ...LARGEUR,
          display: "grid",
          gridTemplateColumns: H.DEROULE_GRILLE,
          gap: 56,
          alignItems: "start",
        }}
      >
        <div className={styles.collant} style={H.COLLANT}>
          <Surtitre>{CHROME.derouleSurtitre}</Surtitre>
          <h2 style={H.DEROULE_TITRE2}>{CHROME.derouleTitre}</h2>
          <div style={H.DEROULE_PHOTO}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO_DEROULE}
              alt="Technicien Migen en intervention sur site"
              width={420}
              height={380}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.05)",
              }}
            />
          </div>
        </div>

        <div style={H.DEROULE_COLONNE}>
          <div style={H.DEROULE_FILET} />
          {deroule.etapes.map((etape, i) => (
            <div key={etape.titre} style={H.ETAPE_RANGEE}>
              <span style={H.ETAPE_PASTILLE} aria-hidden="true">
                {rang(i)}
              </span>
              <div style={{ paddingTop: 8 }}>
                <div style={H.ETAPE_TITRE}>{etape.titre}</div>
                {etape.texte ? (
                  <p style={H.ETAPE_TEXTE}>
                    <TexteRiche texte={etape.texte} />
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- 06 Garanties */

export function Garanties({ garanties }: { garanties: SectionGaranties }) {
  return (
    <section style={H.SECTION_PANNEAU}>
      <div
        className={styles.panneauRembourre}
        data-reveal=""
        style={H.GARANTIES_PANNEAU}
      >
        <div style={H.GARANTIES_LUEUR} />
        <div style={{ position: "relative" }}>
          <Surtitre>{CHROME.garantiesSurtitre}</Surtitre>
          <h2 style={H.GARANTIES_TITRE2}>{CHROME.garantiesTitre}</h2>
          <div
            className={styles.deuxColonnes}
            style={H.GARANTIES_GRILLE}
          >
            {garanties.puces.map((puce) => (
              <div key={puce.texte} style={H.GARANTIE}>
                {puce.accroche ? (
                  <div style={H.GARANTIE_TITRE}>
                    <TexteRiche texte={puce.accroche} />
                  </div>
                ) : null}
                <div style={H.GARANTIE_TEXTE}>
                  <TexteRiche texte={puce.texte} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
