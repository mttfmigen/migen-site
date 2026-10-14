import Image from "next/image";
import type { CSSProperties } from "react";

import { VERRE } from "@/components/site/blocs/habillage";
import type { EntreeSommaire } from "@/components/site/nous-connaitre/HautMobile";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";
import SectionRepliee from "@/components/site/nous-connaitre/SectionRepliee";

/* Écrits une fois : l'en-tête de bureau et la bascule du téléphone. */
const SURTITRE_TEXTE = "Cas concret · Retrofit";
const TITRE_TEXTE = "Une ligne de 1998 remise en service au lieu d’être remplacée";

/** Carte 02 du téléphone, ouverte comme dans la maquette mobile v2. */
export const SOMMAIRE_CAS: EntreeSommaire = { id: "cas-concret", titre: TITRE_TEXTE };

/** La photo du cas : sur téléphone, elle monte en photo de tête de la page. */
export const PHOTO_CAS = "/assets/photos/env-maintenance-automaticien-3.jpg";
export const PHOTO_CAS_ALT =
  "Technicien mesurant au multimètre dans une armoire électrique ouverte, au milieu de robots à l'arrêt";

/**
 * Cas concret de retrofit : photo légendée à gauche, deux chiffres à droite.
 * Portée de `maquette/accueil-rendu.html`, lignes 5792 à 5814.
 *
 * Composant serveur.
 *
 * UN ÉCART. La maquette écrivait « Le client avait un devis de remplacement à
 * sept chiffres ; le retrofit a coûté un dixième ». Le contrat interdit tout
 * prix affiché, et un ordre de grandeur en est un. Le rapport de coût reste dit
 * par l'indicateur du pilier 03, sans montant.
 *
 * L'IMAGE arrive en prop : la maquette pointait un identifiant d'actif Claude
 * Design (« 738c047c-… »), pas un fichier.
 *
 * LA VALEUR PAR DÉFAUT A CHANGÉ LE 12/10, À LA DEMANDE DE MEHDI : « change la
 * photo sur le cas concret sur la partie RSE ».
 *
 * Ce qu'elle était : `/assets/web/sv-armoire.jpg`. Deux raisons mesurées de la
 * retirer d'ici, et aucune des deux n'est une affaire de goût.
 *
 *  1. Elle sert DÉJÀ six autres emplacements du site, dont la page de l'offre
 *     retrofit elle-même (`gabarits-maquette/offres-retrofit-remise-en-etat.json`),
 *     l'accueil (`accueil/DernieresRealisations.tsx`) et le hub carrière. C'est
 *     exactement le défaut que `lib/photos-autorisees.ts` documente : « 130
 *     pages affichent DEUX FOIS la même photo, Mehdi le voit ».
 *  2. Elle ne montre pas ce que le cas raconte. On y voit une armoire NEUVE en
 *     cours de montage, variateurs SEW propres et étiquette « EC Declaration of
 *     partly completed machinery » : une installation. Le cas, lui, parle d'une
 *     ligne de 1998 REMISE EN SERVICE.
 *
 * CRITÈRE DE CHOIX de la nouvelle : le cas nomme trois actes, migration
 * d'automate, reprise des schémas, mise en conformité. La photo retenue montre
 * une armoire de commande ANCIENNE, ouverte sur ses cartes et son câblage, un
 * technicien qui y mesure au multimètre, et autour des robots À L'ARRÊT. C'est
 * la ligne arrêtée qu'on remet en route, pas une machine qu'on installe. Elle
 * est en paysage et également éclairée, ce que réclame le dégradé sombre posé
 * par-dessus.
 *
 * `sv-armoire.jpg` n'est pas perdue : elle reste sur la page de l'offre
 * retrofit, qui est sa place.
 *
 * ELLE PASSE EN `next/image` : ses dimensions intrinsèques sont connues
 * (2000 par 1333), ce qui n'était pas le cas du fichier de remplacement
 * d'origine. Le `<img>` brut servait 672 ko tels quels.
 */

export interface ProprietesCasRetrofit {
  image?: string;
  imageAlt?: string;
}

const CHIFFRE: CSSProperties = {
  font: "600 calc(38px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
};

const LIBELLE_CHIFFRE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
  marginTop: 10,
};

const CARTE_CHIFFRE: CSSProperties = {
  ...VERRE,
  padding: "26px 28px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const CHIFFRES: readonly { valeur: string; libelle: string }[] = [
  {
    valeur: "−30 %",
    libelle:
      "d’arrêts non planifiés chez nos clients sous contrat préventif, après un an",
  },
  {
    valeur: "+8 ans",
    libelle: "de durée de vie gagnée en moyenne sur une machine rétrofitée",
  },
];

export default function CasRetrofit({
  image = PHOTO_CAS,
  /* Description du registre, mot pour mot, apostrophe droite comprise : voir la
     note de `OrigineDuNom.tsx` sur ce que compte `verifie-alt-photos.mjs`. */
  imageAlt = PHOTO_CAS_ALT,
}: ProprietesCasRetrofit) {
  return (
    <SectionRepliee id={SOMMAIRE_CAS.id} kicker={SURTITRE_TEXTE} titre={TITRE_TEXTE} ouvert>
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.32fr .68fr",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          <div
            className={mobile.casPhoto}
            style={{
              borderRadius: "var(--rad)",
              overflow: "hidden",
              position: "relative",
              minHeight: 320,
              background: "var(--ph)",
            }}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 900px) 100vw, 740px"
              style={{
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.05)",
                opacity: "var(--ph-op)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top,rgba(18,17,16,.88) 0%,rgba(18,17,16,.18) 58%,rgba(18,17,16,.38) 100%)",
              }}
            />
            <div
              style={{
                position: "relative",
                padding: "28px 30px 30px",
                minHeight: 320,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                data-titre-bureau=""
                style={{
                  font: "600 11px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 12,
                }}
              >
                {SURTITRE_TEXTE}
              </div>
              <div
                data-titre-bureau=""
                style={{
                  font: "600 calc(clamp(20px,2.2vw,28px) * var(--ts))/1.16 var(--ft)",
                  letterSpacing: "-.035em",
                  color: "#fff",
                  marginBottom: 12,
                  maxWidth: "28ch",
                }}
              >
                {TITRE_TEXTE}
              </div>
              <p
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.76)",
                  margin: 0,
                  maxWidth: "52ch",
                }}
              >
                Migration d’automate, reprise complète des schémas, mise en
                conformité. Le client tenait un devis de remplacement complet,
                le retrofit a coûté bien moins, et la ligne tourne depuis trois
                ans.
              </p>
            </div>
          </div>
          <div
            data-tuiles-chiffres=""
            className={mobile.casChiffres}
            style={{
              display: "grid", gridTemplateColumns: "minmax(0,1fr)",
              gridTemplateRows: "repeat(2,minmax(0,1fr))",
              gap: 14,
            }}
          >
            {CHIFFRES.map((chiffre) => (
              <div key={chiffre.valeur} style={CARTE_CHIFFRE}>
                <div style={CHIFFRE}>{chiffre.valeur}</div>
                <div style={LIBELLE_CHIFFRE}>{chiffre.libelle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
