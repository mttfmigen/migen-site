import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import ProblemeCartes from "@/components/site/implantation/ProblemeCartes";
import MaillageVille from "@/components/site/implantation/MaillageVille";
import QuestionsVille from "@/components/site/implantation/QuestionsVille";
import AppelFinal from "@/components/site/offre/AppelFinal";
import AppelOffre from "@/components/site/offre/AppelOffre";
import BandeAppel from "@/components/site/offre/BandeAppel";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import {
  BOUTON_HERO,
  CARTE_CHIFFRE,
  CHAPEAU_HERO,
  CHIFFRE_LIBELLE,
  CHIFFRE_VALEUR,
  GRILLE_CHIFFRES,
  HERO,
  HERO_GRILLE,
  HERO_MENTION,
  HERO_RANGEE_BOUTONS,
  HERO_RANGEE_PASTILLE,
  PASTILLE,
  PASTILLE_PUCE,
  SECTION_CHIFFRES,
  TITRE1,
} from "@/components/site/offre/habillage-offre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import stylesOffres from "@/components/site/offres/PageOffres.module.css";
import PanneauFormulaire from "@/components/site/offre/PanneauFormulaire";
import PointsOffre from "@/components/site/offre/PointsOffre";
import Reassurance from "@/components/site/offre/Reassurance";
import ReferencesOffre from "@/components/site/offre/ReferencesOffre";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuImplantations } from "@/types/implantations";

import NosVilles from "./NosVilles";

/**
 * Le hub `/implantations/`, gabarit « 10 Hub de rubrique », contre sa capture
 * `maquette/rendu/implantations.html` (17 écrans). C'est la suite de
 * `PageVille`, écran pour écran, moins « Hub local », plus « Nos villes » entre
 * la bande d'appel des références et les questions. `PageVille` n'a pas
 * d'emplacement à cet endroit (composant d'un autre lot) : la composition est
 * reprise ici avec les MÊMES écrans importés, rien n'est redessiné.
 *
 *  0 Héros · 1 Chiffres · 2 Logos · 3 Réassurance · 4 Appel · 5 Problème en
 *  rangée · 6 Offre · 7 Appel sombre · 8 Déroulé · 9 Garanties · 10 Appel ·
 *  11 Références · 12 Appel · 13 Nos villes · 14 Questions · 15 Maillage ·
 *  16 Appel final
 */

export interface ProprietesPageImplantations {
  titre: string;
  contenu: ContenuImplantations;
  formulaire: string;
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

function sectionDeType<T extends TypeSection>(sections: readonly Section[], type: T) {
  return sections.find((s) => s.type === type) as Extract<Section, { type: T }> | undefined;
}

export default function PageImplantations({ titre, contenu, formulaire, filAriane, maillage }: ProprietesPageImplantations) {
  const c = contenu;
  const h1 = titre;

  const actions = liensSurs(c.actions ?? []);
  const chiffres = c.chiffres ?? [];
  const sections = c.sections ?? [];
  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  const bande = (variante?: "sombre") =>
    c.mention || c.appelBouton ? <BandeAppel mention={c.mention} bouton={c.appelBouton} variante={variante} /> : null;

  return (
    <div className="mg-site">
      {/* `racine` : la racine `.mgx-root` du gabarit d'offre, comme le hub `/offres/`. */}
      <main className={stylesOffres.racine} style={{ paddingTop: 62 }}>
        {filAriane}

        <section style={HERO}>
          <div
            className="mg-r2"
            style={{ display: "grid", gridTemplateColumns: HERO_GRILLE, gap: 52, alignItems: "start" }}
          >
            <div>
              {c.pastille ? (
                <div style={HERO_RANGEE_PASTILLE}>
                  <span style={PASTILLE}>
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {c.pastille}
                  </span>
                </div>
              ) : null}
              <h1 style={TITRE1}>{h1}</h1>
              {c.chapeau ? (
                <p style={CHAPEAU_HERO}>
                  <TexteRiche texte={c.chapeau} />
                </p>
              ) : null}
              {actions.length > 0 ? (
                <div style={HERO_RANGEE_BOUTONS}>
                  {actions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      prefetch={false}
                      className={stylesOffre.boutonPrincipal}
                      style={BOUTON_HERO}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}
              {c.mention ? <p style={HERO_MENTION}>{c.mention}</p> : null}
            </div>
            <div style={{ position: "relative" }}>
              <PanneauFormulaire
                id="besoin"
                formulaire={`${formulaire}-hero`}
                titre={c.formulaireHeroTitre ?? ""}
                pastille={c.formulaireHeroMention}
              />
            </div>
          </div>
        </section>

        {chiffres.length > 0 ? (
          <section style={SECTION_CHIFFRES}>
            <div
              className="mg-rmulti"
              style={{ ...GRILLE_CHIFFRES, gridTemplateColumns: `repeat(${chiffres.length},minmax(0,1fr))` }}
            >
              {chiffres.map((chiffre, rang) => (
                <div
                  key={`${chiffre.valeur}-${chiffre.libelle}`}
                  style={rang > 0 ? { ...CARTE_CHIFFRE, borderLeft: "1px solid var(--line)" } : CARTE_CHIFFRE}
                >
                  <div style={CHIFFRE_VALEUR}>{chiffre.valeur}</div>
                  <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <LogosClients />
        <Reassurance />
        {bande()}

        {probleme ? <ProblemeCartes section={probleme} /> : null}
        {offre ? <PointsOffre section={offre} /> : null}
        {bande("sombre")}
        {deroule ? <DerouleOffre section={deroule} /> : null}
        {garanties ? <GarantiesOffre section={garanties} /> : null}
        {c.brefBande ? <AppelOffre question={c.brefBande} bouton={c.brefBouton} mention={c.brefMention} /> : null}
        {preuves ? <ReferencesOffre section={preuves} dateBrute /> : null}
        {bande()}

        {c.villes ? <NosVilles villes={c.villes} /> : null}

        {objections ? <QuestionsVille section={objections} /> : null}
        <MaillageVille />

        {/* La capture pose l'ancre `#mgx-form` sur l'appel final, cible de « Poser ma question ». */}
        <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
          <AppelFinal question={ctaFinal?.question} formulaire={formulaire} bouton={c.appelBouton} />
        </div>

        {maillage ? <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>{maillage}</div> : null}
      </main>
    </div>
  );
}
