import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SURTITRE } from "@/components/site/blocs/habillage";
import type { PrestationsRegroupees as Donnees } from "@/types/offre";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { resumeDe } from "@/components/site/blocs/resume-de-section";
import EtiquettePli from "./EtiquettePli";
import { cibleSure } from "./LiensOffre";
import { numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * Section « Offres regroupées » de la MAQUETTE V3 (16/10, nouvelle référence
 * de Mehdi), `data-screen-label="Offres regroupées"` du gabarit Expertise :
 * surtitre « Nos prestations », H2 « Les prestations liées à cette offre »
 * (sur `/travaux-industriels/` : « Nos travaux industriels », « Une page par
 * prestation »), lien « Décrire mon besoin → » vers `#besoin`, puis UNE
 * CARTE-LIEN PAR PRESTATION : numéro, intitulé, accroche, « Voir la
 * prestation → ».
 *
 * CE QUI A CHANGÉ LE 16/10. Jusque-là, chaque carte était un accordéon qui
 * RECOPIAIT le contenu de la page de la prestation (blocs, tableau, FAQ). La
 * V3 renvoie vers la page elle-même : le visiteur lit la vraie page, et le
 * site ne sert plus deux fois le même texte à deux adresses.
 *
 * CE QUE CE BLOC DOIT LISTER, tranché par Mehdi le 12/10 et inchangé : TOUTES
 * les prestations regroupées sous l'offre (offres absorbées par le
 * `remapOffer` de la maquette et leurs pages filles), une seule fois chacune.
 * La porte `scripts/verifie-prestations-regroupees.mjs` recalcule le compte.
 * Une carte sans lien sûr n'est pas rendue : une carte-lien qui n'ouvre rien
 * mentirait.
 *
 * Au téléphone, le bloc reste replié après les sections de la maquette mobile
 * (`data-mobile-apres-sections`), comme avant.
 */

export interface ProprietesPrestationsRegroupees {
  donnees: Donnees;
}

const ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 18,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(22px,2.2vw,28px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.03em",
  margin: 0,
};

const LIEN: CSSProperties = {
  font: "600 14.5px var(--fb)",
  color: "var(--acc)",
  whiteSpace: "nowrap",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,270px),1fr))",
  gap: 12,
};

const CARTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  height: "100%",
  boxSizing: "border-box",
  padding: "22px 22px 20px",
  borderRadius: "var(--rad-s)",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

const NUMERO: CSSProperties = {
  alignSelf: "flex-start",
  padding: "5px 9px",
  borderRadius: 999,
  background: "var(--acc-w)",
  color: "var(--acc)",
  font: "600 11.5px ui-monospace,Menlo,monospace",
};

const INTITULE: CSSProperties = {
  font: "600 17px/1.3 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
  textWrap: "balance",
};

const ACCROCHE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
  textWrap: "pretty",
};

const VOIR: CSSProperties = {
  marginTop: "auto",
  paddingTop: 6,
  font: "600 14px var(--fb)",
  color: "var(--acc)",
};

export default function PrestationsRegroupees({
  donnees,
}: ProprietesPrestationsRegroupees) {
  const prestations = (donnees.prestations ?? []).filter((prestation) =>
    cibleSure(prestation.href),
  );
  if (prestations.length === 0) return null;

  const surtitre = donnees.surtitre ?? "Nos prestations";
  const titre = donnees.titre ?? "Les prestations liées à cette offre";
  const lien =
    donnees.lien && cibleSure(donnees.lien.href) ? donnees.lien : undefined;

  return (
    <section
      data-mobile-apres-sections=""
      data-prestations-regroupees=""
      className={styles.apresSectionsMobile}
      style={{ padding: "64px 0 0" }}
    >
      <div style={LARGEUR}>
        <SectionPliableMobile
          numero={false}
          enTete={<EtiquettePli surtitre={surtitre} titre={titre} />}
          resume={resumeDe(prestations.map((prestation) => prestation.titre))}
        >
          <div style={ENTETE}>
            <div data-doublon-mobile="">
              <div style={{ ...SURTITRE, marginBottom: 10 }}>{surtitre}</div>
              <h2 style={TITRE}>{titre}</h2>
            </div>
            {lien ? (
              <a href={lien.href} style={LIEN}>
                {lien.libelle} →
              </a>
            ) : null}
          </div>

          <div style={GRILLE}>
            {prestations.map((prestation, rang) => (
              <Link
                key={prestation.href}
                href={prestation.href}
                prefetch={false}
                data-carte-prestation=""
                className={styles.cartePrestation}
                style={CARTE}
              >
                <span style={NUMERO}>{numerote(rang)}</span>
                <span style={INTITULE}>{prestation.titre}</span>
                {prestation.resume ? (
                  <span style={ACCROCHE}>{prestation.resume}</span>
                ) : null}
                <span style={VOIR}>Voir la prestation →</span>
              </Link>
            ))}
          </div>
        </SectionPliableMobile>
      </div>
    </section>
  );
}
