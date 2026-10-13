import styles from "./LogosTechnologies.module.css";
import replis from "./replis-accueil.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

/**
 * Les marques maîtrisées par les techniciens, en grille de six tuiles.
 *
 * Ce n'est pas le bandeau défilant du site : la maquette pose ici une grille
 * statique (`mg-rmulti`), sans `mg-marquee` ni `mg-track`. Composant serveur,
 * aucune animation.
 */
export interface Marque {
  /** Nom affiché en texte alternatif et en infobulle. */
  nom: string;
  /** Chemin du logo, depuis la racine publique. */
  fichier: string;
}

export interface ProprietesLogosTechnologies {
  /**
   * Les six marques mises en avant. La valeur par défaut est celle de la
   * maquette ; quatre de ces fichiers ne sont pas encore dans `public/assets`,
   * d'où la prop.
   */
  marques?: readonly Marque[];
  /** Destination du lien « Voir toutes les marques ». */
  hrefToutesMarques?: string;
}

/* Le sur-titre et le titre, écrits une seule fois : l'en-tête d'origine tient
   le dessin de bureau, la bascule de repli porte le titre sur téléphone, et
   `replis-accueil.module.css` n'en montre jamais qu'un des deux. */
const SURTITRE_TEXTE = "Technologies & partenaires";
const TITRE_TEXTE = "Les marques que nos techniciens maîtrisent au quotidien";

const MARQUES: readonly Marque[] = [
  { nom: "Siemens", fichier: "/assets/fab/siemens.png" },
  { nom: "Schneider Electric", fichier: "/assets/fab/schneider-electric.png" },
  { nom: "Fanuc", fichier: "/assets/fab/fanuc.png" },
  { nom: "ABB", fichier: "/assets/fab/abb.svg" },
  { nom: "DimoMaint", fichier: "/assets/logos/dimomaint.png" },
  { nom: "Savoye", fichier: "/assets/fab/savoye.jpg" },
];

/** Tuile blanche qui accueille un logo. */
const TUILE: React.CSSProperties = {
  width: "100%",
  height: "72px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 22px",
  borderRadius: "12px",
  background: "#fff",
  border: "1px solid rgba(28,27,25,.07)",
  boxSizing: "border-box",
};

export default function LogosTechnologies({
  marques = MARQUES,
  hrefToutesMarques = "/marques/",
}: ProprietesLogosTechnologies) {
  return (
    <section className={replis.repli} style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <SectionPliableMobile kicker={SURTITRE_TEXTE} titre={TITRE_TEXTE}>
        <div
          data-reveal=""
          style={{
            borderRadius: "36px",
            background: "rgba(255,255,255,var(--gl-a))",
            backdropFilter: "blur(var(--gl-b)) saturate(150%)",
            WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
            padding: "44px 48px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "36px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            {/* L'en-tête d'origine, masqué sur téléphone : la bascule porte
                le titre, et jamais les deux à la fois. Le `display: none` tombe
                sur CE conteneur et non sur ses deux enfants, pour qu'il ne
                laisse derrière lui ni boîte vide ni gouttière de flex. */}
            <div className={replis.enTeteBureau}>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: "14px",
                }}
              >
                {SURTITRE_TEXTE}
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(24px,2.4vw,34px) * var(--ts))/1.1 var(--ft)",
                  letterSpacing: "-.035em",
                  margin: 0,
                  maxWidth: "26ch",
                  textWrap: "balance",
                }}
              >
                {TITRE_TEXTE}
              </h2>
            </div>
            <a
              href={hrefToutesMarques}
              className={styles.lienMarques}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "999px",
                background: "#fff",
                border: "1px solid var(--line)",
                font: "600 14.5px var(--fb)",
                color: "var(--ink)",
                flex: "none",
                whiteSpace: "nowrap",
              }}
            >
              Voir toutes les marques →
            </a>
          </div>
          <div
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6,minmax(0,1fr))",
              gap: "14px",
            }}
          >
            {marques.map((marque) => (
              <span key={marque.nom} title={marque.nom} style={TUILE}>
                {/* `img` et non `next/image` : dimensions intrinsèques
                    inconnues, plusieurs fichiers restent à rapatrier. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={marque.fichier}
                  alt={marque.nom}
                  loading="lazy"
                  style={{
                    maxHeight: "42px",
                    maxWidth: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </span>
            ))}
          </div>
        </div>
        </SectionPliableMobile>
      </div>
    </section>
  );
}
