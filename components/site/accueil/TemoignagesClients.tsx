import Carrousel from "./mobile-v3/Carrousel";
import NoteGoogle from "./mobile-v3/NoteGoogle";
import v3 from "./mobile-v3/accueil-v3.module.css";
import replis from "./replis-accueil.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

/* Le sur-titre et le titre, écrits une seule fois : l'en-tête d'origine tient
   le dessin de bureau, la bascule de repli porte le titre sur téléphone, et
   `replis-accueil.module.css` n'en montre jamais qu'un des deux. */
/* L'apostrophe est DROITE, exactement ce que rendait `&apos;` : changer de
   caractère ici changerait la copie affichée, ce qui ne nous appartient pas. */
const SURTITRE_TEXTE = "Ce qu'en disent nos clients";
const TITRE_TEXTE = "Notre plus grande fierté";

export interface Temoignage {
  /** Le verbatim, sans guillemets : la maquette dessine le guillemet à part. */
  verbatim: string;
  /** Fonction de la personne citée : « Responsable maintenance ». */
  fonction: string;
  /** Secteur, département et offre : « Agroalimentaire · Nord · migen© Résidence ». */
  contexte: string;
}

interface Proprietes {
  temoignages?: Temoignage[];
  /** Note Google, telle qu'elle doit s'afficher : « 4,6 / 5 ». */
  noteGoogle?: string;
}

/** Les trois verbatims de la maquette, repris mot pour mot. */
const TEMOIGNAGES_MAQUETTE: Temoignage[] = [
  {
    verbatim:
      "Deux techniciens en 3x8 sur nos lignes liquides et poudre, intégrés à l’équipe dès la première semaine. Le préventif a retrouvé sa place.",
    fonction: "Responsable maintenance",
    contexte: "Agroalimentaire · Nord · migen© Résidence",
  },
  {
    verbatim:
      "Plusieurs dizaines de techniciens, une semaine sur deux, sur un site qui ne s’arrête jamais. Pour la première fois, le préventif tient son planning.",
    fonction: "Responsable maintenance site",
    contexte: "Logistique · Moselle · migen© Zéro arrêt",
  },
  {
    verbatim:
      "Douze monteurs et huit engins de levage pendant six semaines : le centre a été monté sans mobiliser une seule personne de notre maintenance.",
    fonction: "Directeur de projet",
    contexte: "Logistique · Puy-de-Dôme · migen© Travaux industriels",
  },
];

export default function TemoignagesClients({
  temoignages = TEMOIGNAGES_MAQUETTE,
  noteGoogle = "4,6 / 5",
}: Proprietes) {
  return (
    <section className={replis.repli} data-accueil-v3="" style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <SectionPliableMobile kicker={SURTITRE_TEXTE} titre={TITRE_TEXTE}>
        <div data-reveal=""
          className={v3.enteteAvis}
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
            marginBottom: 38,
            flexWrap: "wrap",
          }}
        >
          {/* L'en-tête d'origine, masqué sur téléphone : la bascule porte le
              titre, et jamais les deux à la fois. Le `display: none` tombe sur
              CE conteneur et non sur ses deux enfants, pour qu'il ne laisse
              derrière lui ni boîte vide ni gouttière. */}
          <div className={replis.enTeteBureau}>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 16,
              }}
            >
              {SURTITRE_TEXTE}
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: 0,
                maxWidth: "24ch",
                textWrap: "balance",
              }}
            >
              {TITRE_TEXTE}
            </h2>
          </div>
          <div
            data-doublon-mobile=""
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flex: "none",
              padding: "14px 20px",
              borderRadius: "var(--rad-s)",
              background: "var(--gsol)",
              border: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                font: "600 12.5px var(--fb)",
                letterSpacing: ".02em",
                color: "var(--ink1)",
              }}
            >
              Avis Google
            </div>
            <div
              aria-hidden="true"
              style={{ width: 1, height: 28, background: "var(--line)" }}
            />
            <div>
              <div
                style={{
                  font: "600 17px var(--ft)",
                  letterSpacing: "-.03em",
                }}
              >
                {noteGoogle}
              </div>
              <div
                style={{
                  font: "400 11.5px var(--fb)",
                  color: "var(--ink4)",
                }}
              >
                sur Google
              </div>
            </div>
          </div>
          {/* Au téléphone, la note de la V3 (chiffre et étoiles) remplace la
              pastille ci-dessus, et seulement si une note est portée. */}
          <NoteGoogle note={noteGoogle} />
        </div>

        <Carrousel
          etiquette={SURTITRE_TEXTE}
          data-reveal="" className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 16,
          }}
        >
          {temoignages.map((t) => (
            <figure
              key={t.verbatim}
              className={v3.avis}
              style={{
                margin: 0,
                background: "rgba(255,255,255,var(--gl-a))",
                backdropFilter: "blur(var(--gl-b)) saturate(150%)",
                WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
                border: "1px solid var(--gbd)",
                borderRadius: "var(--rad)",
                padding: "32px 34px 34px",
                boxShadow:
                  "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
              }}
            >
              <div
                aria-hidden="true"
                className={v3.guillemet}
                style={{
                  font: "600 26px var(--ft)",
                  color: "var(--acc)",
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                &ldquo;
              </div>
              <blockquote style={{ margin: 0 }}>
                <p
                  className={v3.citation}
                  style={{
                    font: "400 16px/1.7 var(--fb)",
                    color: "var(--ink1)",
                    margin: "0 0 22px",
                  }}
                >
                  {t.verbatim}
                </p>
              </blockquote>
              <figcaption className={v3.signature}>
                {/* L'initiale en pastille de la V3, décorative. */}
                <span aria-hidden="true" data-mobile-seulement="" className={v3.initiale}>
                  {t.fonction.charAt(0)}
                </span>
                <div
                  className={v3.qui}
                  style={{
                    font: "600 14.5px var(--ft)",
                    letterSpacing: "-.02em",
                  }}
                >
                  {t.fonction}
                </div>
                <div
                  className={v3.contexte}
                  style={{
                    font: "400 13px var(--fb)",
                    color: "var(--ink4)",
                    marginTop: 2,
                  }}
                >
                  {t.contexte}
                </div>
              </figcaption>
            </figure>
          ))}
        </Carrousel>

        {/* La maquette portait ici une note de travail, rendue en texte
            visible : « Verbatims reformulés à partir de retours clients · à valider avec les… ». Elle ne
            part pas en production, un visiteur n'a pas à lire les réserves
            internes sur les chiffres qu'on lui montre. La réserve elle-même
            reste ouverte et suivie dans docs/RESERVES-CONTENU.md. */}
        </SectionPliableMobile>
      </div>
    </section>
  );
}
