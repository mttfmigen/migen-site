import type { Metadata } from "next";
import type { CSSProperties } from "react";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import AppelInterlocuteur from "@/components/site/equipe/AppelInterlocuteur";
import EngagementsEquipe, { SOMMAIRE_ENGAGEMENTS } from "@/components/site/equipe/EngagementsEquipe";
import EnteteEquipe from "@/components/site/equipe/EnteteEquipe";
import GroupeEquipe from "@/components/site/equipe/GroupeEquipe";
import ImplantationsEquipe, {
  SOMMAIRE_IMPLANTATIONS,
} from "@/components/site/equipe/ImplantationsEquipe";
import NotreHistoire, { SOMMAIRE_HISTOIRE_EQUIPE } from "@/components/site/equipe/NotreHistoire";
import QuestionsEquipe, { SOMMAIRE_QUESTIONS } from "@/components/site/equipe/QuestionsEquipe";
import QuiNousSommes, { SOMMAIRE_QUI } from "@/components/site/equipe/QuiNousSommes";
import QuiVousRepond from "@/components/site/equipe/QuiVousRepond";
import SelectionEquipe, { SOMMAIRE_SELECTION } from "@/components/site/equipe/SelectionEquipe";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";
import FinDePageMobile from "@/components/site/nous-connaitre/FinDePageMobile";
import SectionRepliee from "@/components/site/nous-connaitre/SectionRepliee";
import {
  CHEMIN,
  DESCRIPTION_PAR_DEFAUT,
  DIRECTION,
  SUPPORT,
  TITRE_PAR_DEFAUT,
} from "@/components/site/equipe/equipe-donnees";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * Page « Équipe et direction ».
 *
 * POURQUOI UNE ROUTE STATIQUE et non `app/[...slug]` comme les ~200 pages à
 * gabarit : cet écran est unique. Sa mise en page, ses sections et ses cartes de
 * personnes ne se répètent sur aucune autre page, il n'y a donc rien à piloter
 * en base. Même raison que `app/page.tsx`. Next sert cette route avant la route
 * attrape-tout.
 *
 * Elle lit tout de même sa ligne `pages` pour son SEO, quand elle existe : le
 * meta title et la description restent pilotables depuis la base, comme partout
 * ailleurs sur le site.
 *
 * L'ORDRE DES SECTIONS EST CELUI DE LA CAPTURE,
 * `maquette/rendu/a-propos--equipe.html`. Ne pas réordonner sans y revenir.
 *
 * L'adresse canonique est `/a-propos/equipe/` (`routes.csv`, menu du site),
 * d'où `CHEMIN` pour le SEO, quel que soit le dossier qui sert la route.
 */

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin(CHEMIN);
  const base = metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: CHEMIN,
    titreRepli: TITRE_PAR_DEFAUT,
  });
  return { ...base, description: base.description ?? DESCRIPTION_PAR_DEFAUT };
}

/* La carte 03 du téléphone, « Nos équipes, rôle par rôle » : repliée comme
   les cartes 04 à 07, son résumé est la phrase de la maquette mobile v2
   (`mobile-v2-data.js`, page /a-propos/equipe/), mot pour mot. Dedans, les
   deux groupes de portraits. */
const TITRE_EQUIPES = "Nos équipes, rôle par rôle";
const RESUME_EQUIPES =
  "Pas d’organigramme décoratif : quatre rôles, quatre responsabilités, et un principe : vous savez toujours qui porte quoi.";
/* La photo de tête du téléphone, celle de la maquette (dc.html L225,
   `FIMG["a-propos"]`). Hors du tirage `PEOPLE`, elle n'en écarte rien : le
   photo + CTA tire x-tech-portrait, comme la maquette. */
const PHOTO_TETE = "/assets/web/team-grind-front.jpg";
const SOMMAIRE_EQUIPES = { id: "nos-equipes", titre: TITRE_EQUIPES };

/** Les sept cartes du téléphone, dans l'ordre de la maquette. */
const SOMMAIRE = [
  SOMMAIRE_QUI,
  SOMMAIRE_HISTOIRE_EQUIPE,
  SOMMAIRE_EQUIPES,
  SOMMAIRE_SELECTION,
  SOMMAIRE_IMPLANTATIONS,
  SOMMAIRE_ENGAGEMENTS,
  SOMMAIRE_QUESTIONS,
];

/** Le rang d'un bloc au téléphone (`.ordreMaquette`) ; sans rang, l'ordre du DOM. */
const ordre = (n: number) => ({ "--ordre": n }) as CSSProperties;

export default function Equipe() {
  return (
    // `mg-site` porte les rattrapages mobiles de `app/globals.css` : marges,
    // échelle des titres, arrondis sous 760px. Sans elle, le téléphone reste au
    // gabarit desktop.
    <div className="mg-site">
      {/* L'ORDRE DE LA MAQUETTE AU TÉLÉPHONE (`.ordreMaquette`) : héros,
          01 Qui nous sommes, 02 Notre histoire, photo + CTA, 03 Nos équipes,
          puis le reste dans l'ordre du DOM. Le DOM, donc le bureau et le texte
          servi, ne bouge pas. */}
      <main className={mobile.ordreMaquette} style={{ paddingTop: "96px" }}>
        <div style={ordre(1)}>
          <EnteteEquipe sommaire={SOMMAIRE} photo={PHOTO_TETE} />
        </div>
        {/* LA CADENCE MOBILE de la maquette mobile v2 (gabarit 01 de
            l'index, variante « standard » sous /a-propos/) : photo + CTA après
            la 2e section, bandeau « Être rappelé » après la 5e.
            Les deux groupes de personnes comptent pour UNE section : la
            maquette n'en fait qu'une, « Nos équipes, rôle par rôle ». Ils sont
            repliés comme dans la maquette ; leur étiquette est un `h3` (voir
            `GroupeEquipe`), le titre de niveau qu'exige
            `scripts/verifie-blocs-pliables.mjs`.
            `AppelInterlocuteur` est un bandeau d'appel, pas une section de
            contenu (la maquette ne compte pas ses `cta`) : la cadence s'arrête
            avant lui ; au téléphone il s'efface (la barre collante et les
            bandeaux portent l'appel), et `QuiVousRepond`, hors des sept
            parties du sommaire, y est une carte sans numéro.
            `photoHeros` : la photo de tête est écartée du tirage.
            `rappelFinal={false}` : le mini-formulaire « Être rappelé », qui
            porte l'ancre des bandeaux, est posé plus bas par
            `FinDePageMobile`, après « Nos réalisations ». */}
        <AvecConversionMobile
          chemin="/a-propos/equipe/"
          gabarit="01"
          photoHeros={PHOTO_TETE}
          rappelFinal={false}
        >
          <div className={mobile.carteEquipes} style={ordre(5)}>
            <SectionRepliee
              id={SOMMAIRE_EQUIPES.id}
              rang={3}
              titre={TITRE_EQUIPES}
              resume={RESUME_EQUIPES}
            >
              <GroupeEquipe groupe={DIRECTION} paddingHaut={44} />
              <GroupeEquipe groupe={SUPPORT} paddingHaut={34} />
            </SectionRepliee>
          </div>
          <div style={ordre(2)}>
            <QuiNousSommes />
          </div>
          <div style={ordre(3)}>
            <NotreHistoire />
          </div>
          <SelectionEquipe />
          <ImplantationsEquipe />
          <EngagementsEquipe />
          <QuestionsEquipe />
        </AvecConversionMobile>
        <AppelInterlocuteur />
        <QuiVousRepond />
        {/* Au téléphone, le formulaire complet se replie sous le rappel
            sombre de la maquette, qui porte l'ancre `#etre-rappele`. */}
        <FinDePageMobile chemin={CHEMIN}>
          <FormulaireBasDePage
            formulaire="equipe"
            titre="Parlez directement à l’équipe."
            intro={
              "Pas de standard ni de centre d’appels : votre demande arrive chez un chargé d’affaires."
            }
          />
        </FinDePageMobile>
      </main>
    </div>
  );
}
