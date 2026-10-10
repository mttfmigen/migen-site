import Image from "next/image";
/* Bandeau de logos clients, porté de « Migen - Site final » (lignes 600 à 608).
   Composant serveur : le défilement et la pause au survol sont entièrement en
   CSS (`@keyframes mgMarquee`, `.mg-marquee:hover .mg-track` dans
   `app/globals.css`). La maquette doublait l'animation en JavaScript, ce JS
   n'est pas porté : il n'apporte rien que le CSS ne fasse. */

export interface Logo {
  /** Chemin servi, barre oblique initiale comprise. */
  src: string;
  /** Nom de l'entreprise, lu par les technologies d'assistance. */
  alt: string;
}

export interface ProprietesMarqueeClients {
  /** Logos affichés, dans l'ordre. Par défaut, la liste de la maquette.
      Dix-sept de ces fichiers ne sont pas encore dans `public/assets/clients/`
      (tous les PNG et le WebP) : passer une liste réduite tant que le
      rapatriement n'est pas fini. */
  logos?: readonly Logo[];
}

/** Exportée : `offre/LogosClients` affiche la MÊME liste. Un logo ajouté ou
    retiré ici suit automatiquement sur les pages d'offres, aucune recopie. */
export const LOGOS_MAQUETTE: readonly Logo[] = [
  { src: "/assets/clients/danone.png", alt: "Danone" },
  { src: "/assets/clients/stellantis.png", alt: "Stellantis" },
  { src: "/assets/clients/amazon.svg", alt: "Amazon" },
  { src: "/assets/clients/valeo.svg", alt: "Valeo" },
  { src: "/assets/clients/savoye.png", alt: "Savoye" },
  { src: "/assets/clients/mccain.svg", alt: "McCain" },
  { src: "/assets/clients/autoliv.svg", alt: "Autoliv" },
  { src: "/assets/clients/eaton.svg", alt: "Eaton" },
  { src: "/assets/clients/gls.svg", alt: "GLS" },
  { src: "/assets/clients/bledina.svg", alt: "Blédina" },
  { src: "/assets/clients/jtekt.svg", alt: "JTEKT" },
  { src: "/assets/clients/veepee.svg", alt: "Veepee" },
  { src: "/assets/clients/suez.svg", alt: "Suez" },
  { src: "/assets/clients/jacquet-brossard.png", alt: "Jacquet Brossard" },
  { src: "/assets/clients/mersen.svg", alt: "Mersen" },
  { src: "/assets/clients/alstef.webp", alt: "Alstef Group" },
  { src: "/assets/clients/eiffage.svg", alt: "Eiffage" },
  { src: "/assets/clients/motherson.svg", alt: "Motherson" },
  { src: "/assets/clients/la-panetiere.svg", alt: "La Panetière" },
  { src: "/assets/clients/eriks.svg", alt: "ERIKS" },
  { src: "/assets/clients/voit.svg", alt: "Voit" },
  { src: "/assets/clients/ecocem.png", alt: "Ecocem" },
  { src: "/assets/clients/dimomaint.svg", alt: "DimoMaint" },
  { src: "/assets/clients/groupe-atlantic.png", alt: "Groupe Atlantic" },
  { src: "/assets/clients/tournaire.png", alt: "Tournaire" },
  { src: "/assets/clients/aktid.png", alt: "Aktid" },
  { src: "/assets/clients/salaison-du-maconnais.png", alt: "Salaisons du Mâconnais" },
  { src: "/assets/clients/vignal-systems.svg", alt: "Vignal Systems" },
  { src: "/assets/clients/joint-lyonnais.png", alt: "Joint Lyonnais" },
  { src: "/assets/clients/ciuch.svg", alt: "Ciuch" },
  { src: "/assets/clients/rector-lesage.png", alt: "Rector Lesage" },
  { src: "/assets/clients/bamesa.png", alt: "Bamesa" },
  { src: "/assets/clients/jeld-wen.png", alt: "Jeld-Wen" },
  { src: "/assets/clients/atena.png", alt: "Atena" },
  { src: "/assets/clients/soprema.svg", alt: "Soprema" },
  { src: "/assets/clients/washtec.svg", alt: "WashTec" },
  { src: "/assets/clients/timescope.png", alt: "Timescope" },
  { src: "/assets/clients/ogf.png", alt: "OGF" },
];

const MASQUE = "linear-gradient(to right,transparent,#000 9%,#000 91%,transparent)";

const PASTILLE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
  height: "64px",
  minWidth: "132px",
  padding: "0 20px",
  borderRadius: "16px",
  background: "#fff",
  border: "1px solid rgba(28,27,25,.07)",
} as const;

const IMAGE = {
  maxHeight: "34px",
  maxWidth: "120px",
  width: "auto",
  height: "auto",
  objectFit: "contain",
  display: "block",
  mixBlendMode: "multiply",
} as const;

export default function MarqueeClients({
  logos = LOGOS_MAQUETTE,
}: ProprietesMarqueeClients) {
  return (
    <section style={{ padding: "64px 0 0" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 26px",
          padding: "0 40px",
          display: "flex",
          alignItems: "baseline",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            font: "600 11.5px var(--fb)",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
            color: "var(--acc-ink)",
            flex: "none",
          }}
        >
          Plus de 200 clients accompagnés
        </span>
      </div>

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
        {/* La liste est écrite deux fois : `mgMarquee` translate la piste de
            -50 %, le second exemplaire comble donc le vide pendant la boucle.
            Les deux moitiés sont des enfants de même niveau, sinon les
            espacements ne tomberaient pas juste et la boucle sauterait. Le
            doublon porte `alt=""` : décoratif, rien à annoncer deux fois. */}
        <div
          className="mg-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            width: "max-content",
            animation: "mgMarquee 60s linear infinite",
            animationPlayState: "var(--mq-play, running)",
          }}
        >
          {[0, 1].flatMap((passe) =>
            logos.map((logo) => (
              <span
                key={`${logo.src}-${passe}`}
                className="mg-logo"
                style={PASTILLE}
              >
                {/* `width` et `height` sont la BOÎTE du logo (120x34), pas le
                    fichier : next/image s'en sert pour choisir la taille servie.
                    Les PNG clients font jusqu'à 1655 px de large pour 120 px
                    affichés ; servis bruts, ils pesaient sur le premier
                    défilement. Les SVG passent tels quels, un vecteur n'a pas
                    de taille à réduire. */}
                <Image
                  src={logo.src}
                  alt={passe === 0 ? logo.alt : ""}
                  width={120}
                  height={34}
                  style={IMAGE}
                />
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
