import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import Bandeau from "@/components/consentement/Bandeau";
import BarreCollanteParChemin from "@/components/site/mobile/BarreCollanteParChemin";
import Entete from "@/components/site/Entete";
import Moteurs from "@/components/site/Moteurs";
import PiedDePage from "@/components/site/PiedDePage";
import ConsentMode from "@/components/consentement/ConsentMode";
import LienReglages from "@/components/consentement/LienReglages";
import Tags from "@/components/consentement/Tags";
import { CaptureUtm } from "@/components/formulaire/CaptureUtm";
import { jsonLdTexte, organisation } from "@/lib/seo/jsonld";
import { siteUrl } from "@/lib/seo/url";
import { vignetteParDefaut } from "@/lib/seo/vignette";

import "./globals.css";

/*
 * La police du site : Poppins, et elle seule.
 *
 * Poppins porte tout le texte. La charte déclare une seconde famille pour les
 * accents manuscrits ; elle n'est plus chargée ici, et le bloc sous Poppins
 * dit pourquoi, chiffres à l'appui.
 *
 * `next/font` auto-héberge les fichiers et pose un `font-display: swap` :
 * aucune requête vers fonts.googleapis.com au chargement, donc rien à
 * conditionner au consentement, et pas de texte invisible pendant le
 * téléchargement. La maquette les appelait par @import, ce qui aurait coûté
 * une connexion tierce et un blocage du rendu.
 *
 * Les graisses sont déclarées explicitement : sans liste, next/font tire la
 * variable complète et alourdit le premier rendu. Celles-ci sont exactement
 * celles que la maquette utilise.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  // PAS le repli automatique de next/font, et c'est mesuré le 08/10 : il pose
  // `local(Arial)` agrandi à 112 % SANS `unicode-range`, donc il dessine aussi,
  // police chargée, tout glyphe absent de Poppins. La flèche « → » sortait
  // ainsi en Arial, 16,8 px à 15 px de corps, contre 13,7 px dans la maquette
  // qui la laisse à la police système. Le repli est redéclaré dans globals.css
  // (« Poppins Repli », mêmes métriques), borné aux plages de Poppins.
  // Les DEUX options sont nécessaires : Turbopack ignore `adjustFontFallback`
  // seul et ne retire son repli automatique que devant un `fallback` explicite.
  adjustFontFallback: false,
  fallback: ["Poppins Repli"],
});

/*
 * CAVEAT N'EST PLUS CHARGÉE, et c'est mesuré le 12/10.
 *
 * Aucune règle du site ne l'applique : elle n'était exposée que par le jeton
 * `--fs` de globals.css, et `var(--fs)` est écrit ZÉRO fois dans `app/`,
 * `components/` et `lib/` (`var(--font-caveat)` n'apparaissait qu'une seule
 * fois, dans la déclaration de `--fs` elle-même). Le rendu de la maquette ne
 * s'en sert pas davantage : `t-script`, la classe que la charte lui réserve,
 * est absente des 248 captures de `maquette/rendu/`.
 *
 * Ce qu'elle coûtait : `next/font` posait un `<link rel="preload">` sur son
 * fichier latin, qui partait donc sur CHAQUE chargement. Relevé au navigateur,
 * 74 572 octets de glyphes jamais dessinés, sur 48 pages sur 48, soit 61 % du
 * poids des polices de la page, alors que `document.fonts` ne listait jamais
 * Caveat parmi les familles chargées.
 *
 * Les six préchargements de Poppins sont intacts, et c'est vérifié et non
 * supposé : la page en annonce 6 après, contre 7 avant, et le fichier retiré
 * est bien celui de Caveat. Attention au piège de mesure sur ce point : en
 * développement, Turbopack ne pose PAS les préchargements de police en
 * `<link rel="preload" as="font">` dans le `<head>`, il les passe en indices
 * `:HL[…,"font"]` dans le flux React. Compter les `as="font"` donne 0 avant
 * comme après et fait croire à une régression qui n'existe pas ; c'est le
 * nombre d'indices qu'il faut compter. En production, ce sont bien des `<link>`
 * statiques (7 relevés sur migen-site.vercel.app avant ce retrait).
 *
 * POURQUOI LA RETIRER PLUTÔT QUE `preload: false` : les deux suffisent à
 * supprimer le téléchargement, mesuré. Le retrait fait un peu mieux, parce
 * qu'il emporte aussi les 13 `@font-face` de Caveat et de son repli, soit
 * 3 395 octets de la feuille de style GLOBALE, servie elle aussi sur chaque
 * page. Et il ne laisse pas derrière lui une famille déclarée que personne
 * n'appelle.
 *
 * Caveat était un SUBSTITUT de Bryndan, police commerciale non livrée (voir
 * `docs/SYSTEME-DE-DESIGN.md` § 5.7). Le jour où Bryndan arrive, ou si la
 * charte décide de rendre l'accent manuscrit, c'est ici que la famille se
 * redéclare, et `--fs` dans globals.css qui la reçoit.
 */

/**
 * Métadonnées de repli de la mise en page racine.
 *
 * Elles ne servent qu'aux pages qui n'en produisent pas elles-mêmes : chaque
 * page du cocon pose les siennes depuis la table `seo` (voir
 * `lib/seo/metadonnees.ts`), et elles remplacent celles-ci.
 *
 * Volontairement pas de `title.template` : un gabarit ajouterait un suffixe aux
 * meta titles rédigés et mesurés dans le pipeline éditorial, ce qui les
 * allongerait au-delà de la longueur visée et changerait un texte validé par un
 * humain. Le nom du site est porté par `openGraph.siteName` là où il est utile.
 *
 * `metadataBase` est indispensable, et pas un confort : sans elle, Next laisse
 * le canonique, `og:url` et `og:image` en relatif, ce qui les rend inutiles pour
 * un robot comme pour un aperçu de partage. L'origine vient de `siteUrl()`,
 * source unique du projet, qui échoue franchement si la variable manque plutôt
 * que de deviner un domaine.
 *
 * L'`openGraph` ci-dessous NE COUVRE PAS les pages qui en déclarent un, et
 * c'est une propriété de Next, pas un oubli : un `openGraph` de page REMPLACE
 * celui-ci en entier au lieu de s'y ajouter. Mesuré le 12/10, c'est la raison
 * pour laquelle l'image ne pouvait pas être posée ici seulement : les 248
 * adresses du cocon seraient restées sans vignette. Elles passent par
 * `lib/seo/vignette.ts`, source unique de la vignette, et les pages statiques
 * qui écrivent leur `openGraph` en clair l'appellent aussi.
 *
 * Ce bloc est donc le FILET : il sert la 404, et toute page future qui
 * n'écrirait pas son `openGraph`. Volontairement sans `title` ni
 * `description` : Next reprend alors ceux de la page servie, alors que les
 * écrire ici collerait le titre de repli de la racine sur ces pages.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Migen, maintenance industrielle et techniciens sur site",
  description:
    "Migen déploie des techniciens électromécaniciens, automaticiens et roboticiens sur les sites industriels de ses clients. Siège à Écully et Lyon.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    images: vignetteParDefaut(),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      // Le site est francophone : la langue déclarée conditionne la
      // prononciation des lecteurs d'écran et la césure du texte. Critère RGAA.
      lang="fr"
      // PAS de `h-full` ici, et ce n'est pas un oubli : la classe vient du
      // gabarit de create-next-app, où elle sert à coller un pied de page en
      // bas d'une page courte. Elle fige `html` à la hauteur de la fenêtre,
      // ce qui contraint le bloc conteneur initial et fausse le calcul des
      // `animation-timeline: view()` des sections qui apparaissent au
      // défilement. La mise en page vient maintenant de la maquette, dont le
      // conteneur `.mg-site` porte son propre `min-height: 100vh`.
      className={poppins.variable}
      // Le script de thème ci-dessous pose `data-theme` avant l'hydratation :
      // sans cet attribut, React signalerait l'écart entre le HTML serveur et
      // la racine. Ne couvre que les attributs de <html>, pas ses enfants.
      suppressHydrationWarning
    >
      <head>
        {/* Thème mémorisé, posé AVANT le premier rendu pour éviter l'éclair
            clair chez qui a choisi « Sombre » (et l'inverse). Même clé et mêmes
            valeurs que la maquette (`localStorage["migen-theme"]`, « Clair » ou
            « Sombre »). Sans choix, aucun attribut : globals.css suit alors
            prefers-color-scheme. try/catch : stockage bloqué ou navigation
            privée, la page reste sur le réglage du système. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("migen-theme");if(t==="Sombre"||t==="Clair")document.documentElement.setAttribute("data-theme",t==="Sombre"?"sombre":"clair")}catch(e){}`,
          }}
        />
      </head>
      <body>
        {/*
          ConsentMode EN PREMIER, et ce n'est pas cosmétique : son script est en
          `beforeInteractive`, Next ne l'injecte dans le HTML initial que s'il
          est monté depuis cette mise en page, et l'état `denied` par défaut doit
          être posé avant que le moindre script Google démarre. Monté après Tags,
          le dispositif ne protègerait plus rien.
        */}
        <ConsentMode />
        {/* Attribution de la visite, mémorisée dès la page d'entrée. Pas un
            traceur : rien ne sort du navigateur avant l'envoi d'un formulaire. */}
        <CaptureUtm />
        {/* Les traceurs eux-mêmes, qui ne rendent rien tant que la finalité
            correspondante n'est pas accordée. */}
        <Tags />
        <Bandeau />

        {/* La barre de navigation flottante, portée de la maquette. Elle est en
            position fixe : elle vit hors du flux, d'où sa place avant le
            contenu plutôt que dans chaque page. */}
        {/* Les moteurs d'animation de la maquette : rails qui défilent,
            révélation au défilement, capsule qui rentre. Ils travaillent par
            sélecteur d'attribut sur le document entier, d'où un seul montage
            ici plutôt qu'un par section. Ils ne rendent rien. */}
        <Moteurs />
        <Entete />
        {/* Barre d'action basse du motif tactile de la maquette Mobile. Sa règle
            CSS la masque au-delà de 880px, le même seuil où la navigation cède
            au bouton menu. Sans elle, on ne peut pas appeler Migen depuis un
            téléphone sans ouvrir le tiroir. */}
        <BarreCollanteParChemin />

        {children}

        {/* Un seul pied de page pour tout le site. Le lien CNIL de réglage du
            consentement lui est PASSÉ au lieu d'être réécrit dedans : une seule
            implémentation du bouton, et le pied de page reste un composant
            serveur alors que le lien est un composant client. */}
        <PiedDePage reglagesConsentement={<LienReglages />} />

        {/*
          Organisation posée une seule fois pour tout le site, ici et nulle part
          ailleurs : répétée page par page, elle décrirait plusieurs entités à
          Google. Le fil d'Ariane, les services et les articles restent au niveau
          des pages.

          `jsonLdTexte` et jamais `JSON.stringify` nu : React n'échappe rien dans
          `dangerouslySetInnerHTML`, et un chevron venu du contenu refermerait la
          balise script par anticipation.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdTexte(organisation()) }}
        />
      </body>
    </html>
  );
}
