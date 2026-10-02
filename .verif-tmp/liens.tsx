import { renderToStaticMarkup } from "react-dom/server";
import GrilleOffres from "@/components/site/accueil/GrilleOffres";
import FocusResidence from "@/components/site/accueil/FocusResidence";
import BentoBesoins from "@/components/site/accueil/BentoBesoins";
import SecteursAccueil from "@/components/site/accueil/SecteursAccueil";
import HubsAccueil from "@/components/site/accueil/HubsAccueil";
import DernieresRealisations from "@/components/site/accueil/DernieresRealisations";
import MethodeQuatreEtapes from "@/components/site/accueil/MethodeQuatreEtapes";
import FriseHistoire from "@/components/site/accueil/FriseHistoire";
import PourquoiExternaliser from "@/components/site/accueil/PourquoiExternaliser";
import TemoignagesClients from "@/components/site/accueil/TemoignagesClients";
import LogosTechnologies from "@/components/site/accueil/LogosTechnologies";

const parts: [string, string][] = [
  ["GrilleOffres", renderToStaticMarkup(<GrilleOffres />)],
  ["FocusResidence", renderToStaticMarkup(<FocusResidence />)],
  ["BentoBesoins", renderToStaticMarkup(<BentoBesoins />)],
  ["SecteursAccueil", renderToStaticMarkup(<SecteursAccueil />)],
  ["HubsAccueil", renderToStaticMarkup(<HubsAccueil />)],
  ["DernieresRealisations", renderToStaticMarkup(<DernieresRealisations />)],
  ["MethodeQuatreEtapes", renderToStaticMarkup(<MethodeQuatreEtapes />)],
  ["FriseHistoire", renderToStaticMarkup(<FriseHistoire />)],
  ["PourquoiExternaliser", renderToStaticMarkup(<PourquoiExternaliser />)],
  ["TemoignagesClients", renderToStaticMarkup(<TemoignagesClients />)],
  ["LogosTechnologies", renderToStaticMarkup(<LogosTechnologies />)],
];
for (const [nom, html] of parts) {
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  const morts = hrefs.filter((h) => h === "#" || h === "" );
  console.log(`${nom}: ${hrefs.length} liens, ${morts.length} morts -> ${[...new Set(hrefs)].join(" | ")}`);
}
