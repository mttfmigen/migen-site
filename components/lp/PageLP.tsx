import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import LienReglages from "@/components/consentement/LienReglages";
import { META_LP, type PageLP as DonneesPageLP } from "@/lib/lp/pages";

import { CADRE, TEL, type Contexte } from "./atomes-lp";
import { BarreLP, type AncreLP } from "./BarreLP";
import { FormulaireLP } from "./FormulaireLP";
import { HerosServiceLP } from "./HerosServiceLP";
import { MerciLP } from "./MerciLP";
import styles from "./PageLP.module.css";
import { RendezVousLP } from "./RendezVousLP";
import { SECTIONS_BANDEAU, SectionLPRendue } from "./SectionsLP";

/**
 * Une landing page publicitaire, portage de `MigenLP` (maquette V3, onglets
 * « Landing page PC » et « Landing page mobile ») : barre flottante, héros
 * sombre et formulaire, sections de `__LP`, pied réduit, barre collante au
 * téléphone. Le téléphone n'a pas de gabarit à part : c'est le même, replié
 * par requêtes de conteneur sous 760 px, comme dans la maquette.
 *
 * L'en-tête, le pied et la barre basse DU SITE n'y paraissent pas (voir
 * `HorsLandingPage` et `app/@pied`) ; le bandeau de consentement et Tag
 * Manager, posés par la mise en page racine, si.
 */

/** Les ancres de la barre, dans l'ordre de `anchors` (`ids` de la maquette). */
const CIBLES = ["lp-solutions", "lp-methode", "lp-temoignages", "lp-contact"] as const;

/** Où mène le bouton de la barre d'une page sans formulaire (merci, rendez-vous). */
const PAGE_DEVIS = "/lp/devis/";

const LIEN_PIED = { color: "inherit" } as const;

function PiedLP() {
  // Calculée et non figée à 2026 comme la maquette, comme le pied du site.
  const annee = new Date().getFullYear();
  return (
    <footer style={{ background: "#121110" }}>
      <div
        className={styles.pad}
        style={{
          ...CADRE,
          padding: "40px 40px 96px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src={META_LP.logo} alt="" width={22} height={22} />
          <span style={{ font: "600 16px var(--ft)", color: "#fff" }}>migen</span>
          <span style={{ font: "400 13px var(--fb)", color: "rgba(255,255,255,.6)" }}>Innovation, performance, impact.</span>
        </div>
        {/* Les pages légales sont celles du site, pas une copie. */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, font: "400 13px var(--fb)", color: "rgba(255,255,255,.6)" }}>
          <Link href="/confidentialite/" prefetch={false} style={LIEN_PIED}>
            Politique de confidentialité
          </Link>
          <Link href="/mentions-legales/" prefetch={false} style={LIEN_PIED}>
            Mentions légales
          </Link>
          <LienReglages
            libelle="Préférences cookies"
            style={{ padding: 0, border: "none", background: "none", font: "inherit", color: "inherit", cursor: "pointer" }}
          />
          <span>© {annee} Migen</span>
        </div>
      </div>
    </footer>
  );
}

function BarreCollanteLP({ libelle }: { libelle: string }) {
  return (
    <div
      className={styles.seulM}
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 40,
        padding: "12px 12px 14px",
        background: "linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.96) 40%)",
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <a
          href="#lp-contact"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 52,
            borderRadius: 999,
            background: "#ff7c3c",
            color: "#fff",
            font: "600 15px var(--fb)",
          }}
        >
          {libelle}
        </a>
        <a
          href={TEL.href}
          aria-label={`Appeler le ${TEL.affichage}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 52,
            padding: "0 18px",
            borderRadius: 999,
            background: "#1c1b19",
            color: "#fff",
            font: "600 14px var(--fb)",
          }}
        >
          Appeler
        </a>
      </div>
    </div>
  );
}

/** Le héros d'une page à formulaire : texte à gauche, formulaire en deux étapes à droite. */
function HerosLP({ page }: { page: DonneesPageLP }) {
  return (
    <HerosServiceLP
      photo={page.img}
      surtitre={page.kick}
      titre={
        <>
          {page.h1a ? <span style={{ color: "#ff7c3c" }}>{page.h1a} </span> : null}
          {page.h1b}
        </>
      }
      chapo={page.chapo}
      pastilles={page.badges}
      points={page.more}
      chiffres={page.hs}
      carte={
        <div style={{ position: "relative", width: "100%", maxWidth: 460, marginLeft: "auto" }}>
          <FormulaireLP variante="heros" page={page.path} titre={page.form?.t} />
        </div>
      }
    />
  );
}

/** Les sections de `__LP`, avec l'alternance des fonds et des photos de la maquette. */
function Sections({ page }: { page: DonneesPageLP }) {
  let alternance = 0;
  let textesEtPhotos = 0;
  let selectionPosee = false;
  return page.secs.map((s, index) => {
    const bandeau = SECTIONS_BANDEAU.has(s.kind);
    const fond = bandeau ? "#fff" : alternance++ % 2 ? "#f6f6f7" : "#fff";
    const aGauche = s.kind === "split" && textesEtPhotos++ % 2 === 1;
    const avecSelection = s.kind === "trust" && !selectionPosee;
    if (avecSelection) selectionPosee = true;
    const ctx: Contexte = {
      fond,
      carte: fond === "#fff" ? "#f6f6f7" : "#fff",
      aGauche,
      avecSelection,
      meta: META_LP,
      chemin: page.path,
      titreFormulaire: page.form?.t,
    };
    return <SectionLPRendue key={`${s.kind}-${index}`} s={s} index={index} ctx={ctx} />;
  });
}

function contenu(page: DonneesPageLP) {
  if (page.isRdv) return <RendezVousLP />;
  if (!page.hasForm) return <MerciLP />;
  return (
    <>
      <HerosLP page={page} />
      <Sections page={page} />
    </>
  );
}

/**
 * Le cadre commun : barre flottante, contenu, pied réduit et, au téléphone, la
 * barre collante. Sans formulaire dans la page, le bouton de la barre mène à
 * la LP devis plutôt qu'à une ancre absente.
 */
export function CadreLP({
  ancres = [],
  libelleCta,
  avecContact = false,
  collante,
  children,
}: {
  ancres?: readonly AncreLP[];
  libelleCta: string;
  /** La page porte la section `#lp-contact` et son formulaire. */
  avecContact?: boolean;
  /** Le libellé de la barre collante du téléphone (`sticky.cta`). */
  collante?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.racine}>
      <BarreLP logo={META_LP.logo} ancres={ancres} libelleCta={libelleCta} hrefCta={avecContact ? "#lp-contact" : PAGE_DEVIS} />
      <main className={styles.principal}>{children}</main>
      <PiedLP />
      {avecContact && collante ? <BarreCollanteLP libelle={collante} /> : null}
    </div>
  );
}

export function PageLP({ page }: { page: DonneesPageLP }) {
  const ids = new Set(page.secs.map((s) => s.id).filter(Boolean));
  const ancres: AncreLP[] = page.anchors
    .slice(0, CIBLES.length)
    .map((libelle, i) => ({ libelle, href: `#${CIBLES[i]}` }))
    .filter((ancre) => ids.has(ancre.href.slice(1)));

  return (
    <CadreLP ancres={ancres} libelleCta={page.ctaNav} avecContact={ids.has("lp-contact")} collante={page.sticky?.cta}>
      {contenu(page)}
    </CadreLP>
  );
}
