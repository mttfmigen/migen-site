import type { Metadata } from "next";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import { ID_RAPPEL_FINAL } from "@/components/site/mobile/conversion-donnees";
import AppelInterlocuteur from "@/components/site/equipe/AppelInterlocuteur";
import EngagementsEquipe from "@/components/site/equipe/EngagementsEquipe";
import EnteteEquipe from "@/components/site/equipe/EnteteEquipe";
import GroupeEquipe from "@/components/site/equipe/GroupeEquipe";
import ImplantationsEquipe from "@/components/site/equipe/ImplantationsEquipe";
import NotreHistoire from "@/components/site/equipe/NotreHistoire";
import QuestionsEquipe from "@/components/site/equipe/QuestionsEquipe";
import QuiNousSommes from "@/components/site/equipe/QuiNousSommes";
import QuiVousRepond from "@/components/site/equipe/QuiVousRepond";
import SelectionEquipe from "@/components/site/equipe/SelectionEquipe";
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

export default function Equipe() {
  return (
    // `mg-site` porte les rattrapages mobiles de `app/globals.css` : marges,
    // échelle des titres, arrondis sous 760px. Sans elle, le téléphone reste au
    // gabarit desktop.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <EnteteEquipe />
        {/* LA CADENCE MOBILE de la maquette mobile v2 (gabarit 01 de
            l'index, variante « standard » sous /a-propos/) : photo + CTA après
            la 2e section, bandeau « Être rappelé » après la 5e.
            Les deux groupes de personnes comptent pour UNE section : la
            maquette n'en fait qu'une, « Nos équipes, rôle par rôle ». Ils
            restent DÉPLIÉS, à l'écart de la maquette qui replie cette section :
            leur étiquette est un `div` (pas un titre de niveau, voir
            `GroupeEquipe`), et un bloc replié sans titre de niveau est refusé
            par `scripts/verifie-blocs-pliables.mjs`.
            `AppelInterlocuteur` est un bandeau d'appel, pas une section de
            contenu (la maquette ne compte pas ses `cta`) : la cadence s'arrête
            avant lui, et `QuiVousRepond`, qui le suit, n'ajoute donc pas de
            bandeau collé au formulaire.
            Le héros n'a pas de photo : rien à écarter du tirage.
            `rappelFinal={false}` : le formulaire complet suit, la maquette n'y
            met que le mini-formulaire ; il porte l'ancre des bandeaux. */}
        <AvecConversionMobile chemin="/a-propos/equipe/" gabarit="01" rappelFinal={false}>
          <>
            <GroupeEquipe groupe={DIRECTION} paddingHaut={44} />
            <GroupeEquipe groupe={SUPPORT} paddingHaut={34} />
          </>
          <QuiNousSommes />
          <NotreHistoire />
          <SelectionEquipe />
          <ImplantationsEquipe />
          <EngagementsEquipe />
          <QuestionsEquipe />
        </AvecConversionMobile>
        <AppelInterlocuteur />
        <QuiVousRepond />
        {/* L'ancre `#etre-rappele` visée par le bandeau de la cadence : sans
            rappel final, c'est ce formulaire qui la porte. */}
        <div id={ID_RAPPEL_FINAL} style={{ scrollMarginTop: 110 }}>
        <FormulaireBasDePage
          formulaire="equipe"
          titre="Parlez directement à l’équipe."
          intro={
            "Pas de standard ni de centre d’appels : votre demande arrive chez un chargé d’affaires."
          }
        />
        </div>
      </main>
    </div>
  );
}
