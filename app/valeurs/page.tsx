import type { Metadata } from "next";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import AppelCorrection from "@/components/site/valeurs/AppelCorrection";
import GrilleValeurs from "@/components/site/valeurs/GrilleValeurs";
import HeroValeurs from "@/components/site/valeurs/HeroValeurs";
import { FORMULAIRE } from "@/components/site/valeurs/valeurs-donnees";
import { urlAbsolue } from "@/lib/seo/url";

/**
 * Page « Nos valeurs », route statique.
 *
 * POURQUOI ELLE N'EST PAS SERVIE PAR `app/[...slug]`, comme les ~200 pages à
 * gabarit : son contenu n'est pas du gabarit de vente en dix sections, c'est une
 * composition propre, avec ses cartes et sa grille. Même raison que la page
 * d'accueil. Next sert cette route avant l'attrape-tout, donc elle passe devant
 * sans configuration.
 *
 * Les métadonnées sont écrites ici et non lues dans la table `seo` : aucune
 * ligne ne décrit cette page, et un repli sur le H1 produirait un meta title
 * identique au titre de la page, ce que le projet interdit.
 */

const CHEMIN = "/valeurs/";

export const metadata: Metadata = {
  title: "Valeurs de Migen, cinq règles et leurs preuves",
  description:
    "Les cinq règles que Migen applique en maintenance industrielle, chacune avec la preuve que vous pouvez nous demander avant de signer.",
  alternates: { canonical: urlAbsolue(CHEMIN) },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    title: "Valeurs de Migen, cinq règles et leurs preuves",
    description:
      "Les cinq règles que Migen applique en maintenance industrielle, chacune avec la preuve que vous pouvez nous demander avant de signer.",
    url: urlAbsolue(CHEMIN),
  },
};

export default function Valeurs() {
  return (
    // `mg-site` porte les rattrapages mobiles de `app/globals.css` : sans elle,
    // la page reste au gabarit desktop sous 760px.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <HeroValeurs />
        <GrilleValeurs />
        {/* La maquette ferme l'appel par `var(--sec)` et ouvre le formulaire à
            zéro ; le formulaire réutilisé porte déjà son `var(--sec)` haut, donc
            l'écart entre les deux est le même qu'en maquette. */}
        <AppelCorrection />
        <FormulaireBasDePage
          formulaire="valeurs"
          titre={FORMULAIRE.titre}
          intro={FORMULAIRE.intro}
        />
      </main>
    </div>
  );
}
