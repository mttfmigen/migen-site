import Image from "next/image";
import type { CSSProperties } from "react";

import { LOGOS_MAQUETTE as LOGOS } from "@/components/site/accueil/MarqueeClients";
import { SURTITRE } from "@/components/site/blocs/habillage";
import type { LogoSecteur } from "@/types/secteur";

/**
 * « 02 Logos » d'une page de secteur : celui de `offre/LogosClients`, plus la
 * GRILLE DES CLIENTS DU SECTEUR que la source n'affiche que sur ces pages
 * (`MigenExpertise.dc.html` l. 131, `sc-if hasSecLogos`, gabarits 100 à 105 de
 * la capture) entre le surtitre et le défilement : un titre (« Ils nous
 * confient leurs lignes agroalimentaires »), puis une tuile blanche par client.
 *
 * POURQUOI PAS `LogosClients` : la grille s'insère AU MILIEU de sa section, et
 * la capture n'en porte qu'une. Ce composant reprend donc son en-tête et son
 * défilement au caractère près (même liste importée, mêmes classes
 * `mg-marquee` / `mg-track` / `mg-logo` d'`app/globals.css`, même pause et même
 * loupe au survol) et pose la grille entre les deux. Sans `logos`, il rend
 * exactement `LogosClients`.
 *
 * LES LOGOS DE LA GRILLE sont servis TELS QUELS (`unoptimized`) : ce sont les
 * fichiers aux mêmes octets que ceux de la maquette vivante, relevés par
 * empreinte, et leur taille propre est celle que la capture borne à 120×40.
 *
 * ÉCART DÉCLARÉ À LA MAQUETTE, 09/10 : QUAND LA GRILLE EST LÀ, LE BANDEAU
 * DÉFILANT NE L'EST PLUS. Demande de Mehdi, « la bande de logo il y en avait
 * deux… il ne doit y en avoir qu'une ».
 *
 * CE QUI A ÉTÉ MESURÉ, et qui décide. La capture empile bien les deux
 * (`maquette/rendu/secteurs--logistique.html` : `data-dc-tpl` 105, dix tuiles
 * de 40 px, puis 109 à 259, trente-huit marques écrites deux fois), donc le
 * portage était fidèle : c'est la maquette elle-même que cette demande corrige.
 * Mais les deux bandes se suivent à 216 px dans LA MÊME section, en tuiles
 * blanches de même dessin, et sur les douze fiches de secteur du dépôt 115 des
 * 115 tuiles de grille portent une marque que le bandeau rejoue juste en
 * dessous : 100 % de recouvrement, nom à nom.
 *
 * POURQUOI PAS « DÉDOUBLONNER » PLUTÔT QUE RETIRER. Retirer du bandeau les
 * marques de la grille laisse deux bandes empilées, donc le doublon que Mehdi
 * voit ; retirer de la grille celles du bandeau la VIDE (115 sur 115). Il n'y
 * avait pas de troisième voie : l'une des deux bandes devait partir.
 *
 * CELLE QUI RESTE EST LA GRILLE, parce qu'elle est celle de la page : elle
 * porte son titre (« Ils nous confient leurs sites logistiques ») et les dix
 * clients du secteur, là où le bandeau sert les mêmes trente-huit marques sur
 * cent trente-huit pages. Sans `logos`, rien ne change : le bandeau est alors
 * la seule bande de la page, et ce composant rend exactement `LogosClients`.
 */

const MASQUE = "linear-gradient(to right,transparent,#000 9%,#000 91%,transparent)";

const SURTITRE_LIGNE: CSSProperties = { ...SURTITRE, marginBottom: 0, flex: "none" };

const TITRE_GRILLE: CSSProperties = {
  font: "600 clamp(22px,2.2vw,28px)/1.2 var(--ft)",
  letterSpacing: "-.03em",
  marginBottom: 18,
};

const TUILE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 84,
  padding: "0 18px",
  borderRadius: 18,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.07)",
};

const LOGO_TUILE: CSSProperties = {
  maxHeight: 40,
  maxWidth: 120,
  width: "auto",
  height: "auto",
  objectFit: "contain",
  display: "block",
};

const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
  height: 64,
  minWidth: 132,
  padding: "0 20px",
  borderRadius: 16,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.07)",
};

const IMAGE: CSSProperties = {
  maxHeight: 34,
  maxWidth: 120,
  width: "auto",
  height: "auto",
  objectFit: "contain",
  display: "block",
  mixBlendMode: "multiply",
};

export interface ProprietesLogosSecteur {
  titre?: string;
  logos?: readonly LogoSecteur[];
}

export default function LogosSecteur({ titre, logos = [] }: ProprietesLogosSecteur) {
  /* TOUJOURS LA BARRE QUI DÉFILE, décision de Mehdi du 09/10 : « il faut que la
     barre qui défile ». La grille statique est retirée, elle faisait doublon
     avec le bloc « Nos références » plus bas dans la page, que Mehdi garde.
     Quand la page a ses propres logos de secteur, c'est la BARRE qui les porte,
     au lieu de la liste partagée : une seule bande, et elle dit quelque chose
     de la page. */
  const grille = false;
  const defilants = logos.length > 0 ? logos.map((l) => ({ src: l.src, nom: l.nom, filtre: l.filtre })) : null;

  return (
    <section style={{ padding: "64px 0 0" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 26px",
          padding: "0 40px",
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={SURTITRE_LIGNE}>Ils nous font confiance</span>
      </div>

      {grille ? (
        <div style={{ maxWidth: 1200, margin: "0 auto 22px", padding: "0 40px" }}>
          {titre ? <div style={TITRE_GRILLE}>{titre}</div> : null}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
              gap: 10,
            }}
          >
            {logos.map((logo) => (
              <span key={logo.nom} style={TUILE}>
                <Image
                  src={logo.src}
                  alt={logo.nom}
                  width={120}
                  height={40}
                  unoptimized
                  style={{ ...LOGO_TUILE, filter: logo.filtre ?? "none" }}
                />
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* LE DÉFILEMENT NE SORT QUE SI LA GRILLE N'EST PAS LÀ : une seule bande
          de logos par page, écart déclaré du 09/10 en tête de fichier. */}
      {grille ? null : (
        <div
          className="mg-marquee"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "16px 0",
            WebkitMaskImage: MASQUE,
            maskImage: MASQUE,
          }}
        >
          {/* Écrite deux fois, comme `LogosClients` : la piste translate de
              -50 %, le second exemplaire, décoratif, comble la boucle. */}
          <div
            className="mg-track"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              width: "max-content",
              animation: "mgMarquee 40s linear infinite",
              animationPlayState: "var(--mq-play, running)",
            }}
          >
            {[0, 1].flatMap((passe) =>
              /* Les logos du secteur quand la page en a, la liste partagée
                 sinon : la bande dit alors quelque chose de la page au lieu de
                 rejouer la même suite sur les 138 pages. */
              (defilants ?? LOGOS).map((logo) => {
                const nom = "alt" in logo ? logo.alt : logo.nom;
                return (
                  <span key={`${logo.src}-${passe}`} className="mg-logo" style={PASTILLE}>
                    <Image
                      src={logo.src}
                      alt={passe === 0 ? nom : ""}
                      width={120}
                      height={34}
                      unoptimized={!("alt" in logo)}
                      style={{ ...IMAGE, filter: ("filtre" in logo && logo.filtre) || undefined }}
                    />
                  </span>
                );
              }),
            )}
          </div>
        </div>
      )}
    </section>
  );
}
