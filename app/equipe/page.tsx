import type { Metadata } from "next";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import AppelInterlocuteur from "@/components/site/equipe/AppelInterlocuteur";
import EngagementsEquipe from "@/components/site/equipe/EngagementsEquipe";
import GroupeEquipe from "@/components/site/equipe/GroupeEquipe";
import ImplantationsEquipe from "@/components/site/equipe/ImplantationsEquipe";
import NotreHistoire from "@/components/site/equipe/NotreHistoire";
import QuestionsEquipe from "@/components/site/equipe/QuestionsEquipe";
import QuiNousSommes from "@/components/site/equipe/QuiNousSommes";
import QuiVousRepond from "@/components/site/equipe/QuiVousRepond";
import SelectionEquipe from "@/components/site/equipe/SelectionEquipe";
import {
  DESCRIPTION_PAR_DEFAUT,
  DIRECTION,
  H1,
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
 * L'ORDRE DES SECTIONS EST CELUI DE LA MAQUETTE, lignes 5845 à 6030 de
 * `maquette/accueil-rendu.html`. Ne pas réordonner sans y revenir.
 */

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin("/equipe/");
  const base = metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: "/equipe/",
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
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}>
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: 20,
            }}
          >
            Équipe &amp; direction
          </div>
          <h1
            style={{
              font: "600 calc(clamp(38px,4.6vw,70px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              margin: 0,
              maxWidth: "19ch",
              textWrap: "balance",
            }}
          >
            {H1}
          </h1>
          <p
            style={{
              font: "400 18.5px/1.6 var(--fb)",
              color: "var(--ink2)",
              margin: "24px 0 0",
              maxWidth: "56ch",
            }}
          >
            Une direction et des responsables qui décident vite et
            s&rsquo;engagent personnellement, cent vingt techniciens sur le
            terrain. De la première visite au bilan de mission, vous avez
            toujours un nom en face de vous.
          </p>
        </section>

        <GroupeEquipe groupe={DIRECTION} paddingHaut={44} />
        <GroupeEquipe groupe={SUPPORT} paddingHaut={34} />
        <QuiNousSommes />
        <NotreHistoire />
        <SelectionEquipe />
        <ImplantationsEquipe />
        <EngagementsEquipe />
        <QuestionsEquipe />
        <AppelInterlocuteur />
        <QuiVousRepond />
        <FormulaireBasDePage
          formulaire="equipe"
          titre="Parlez directement à l’équipe."
          intro={
            "Pas de standard ni de centre d’appels : votre demande arrive chez un chargé d’affaires."
          }
        />
      </main>
    </div>
  );
}
