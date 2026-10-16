
/**
 * Bento des chiffres de croissance : un grand panneau sombre, trois cartes de
 * verre.
 *
 * Composant serveur. Les chiffres arrivent en props, avec les valeurs de la
 * maquette par défaut, pour deux raisons :
 *
 * 1. la maquette annonce « 5 agences réparties sur le territoire français »,
 *    ce que les interdits de copie du projet contredisent (quatre agences,
 *    Lyon siège, Montréal, Dubaï, Madrid, aucune autre en France) : la valeur
 *    par défaut est corrigée ici ;
 * 2. la maquette affiche « +120 collaborateurs » DEUX fois, dans la carte de
 *    droite et dans la carte large. Au bureau, la structure est reproduite
 *    telle quelle (la V3 du 16/10 la garde). Au téléphone, la grille passe
 *    sur une colonne et les deux « +120 » se suivaient : la carte de droite
 *    y est masquée, ce qui donne les quatre chiffres de la V3 mobile
 *    (+10 M€, 4 agences, +120 collaborateurs, +200 clients industriels).
 *
 * Les compteurs animés de `support.js` ne sont pas portés : les valeurs sont
 * dans le HTML, lisibles sans JavaScript.
 */

import styles from "./ChiffresCroissance.module.css";
import v3 from "./mobile-v3/accueil-v3.module.css";
import replis from "./replis-accueil.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

/*
 * LE TITRE DE LA BASCULE DE REPLI, ET IL EST COURT PARCE QUE LA SECTION L'EST.
 *
 * CETTE SECTION N'A PAS DE `<h2>` : son seul intitulé, dans la maquette de
 * bureau, est l'étiquette « Croissance » posée en haut du panneau sombre. C'est
 * elle que porte la bascule, telle quelle.
 *
 * La maquette MOBILE intitule cette rangée « CROISSANCE · Une structure qui
 * tient l'échelle nationale ». Cette seconde phrase existe bien dans notre
 * copie, mais au milieu de `principal.libelle`, qui est une PROP : la découper
 * pour en extraire un titre reviendrait à réécrire la copie de Mehdi et à
 * casser l'appelant qui passerait ses propres chiffres. Le titre reste donc
 * « Croissance », et l'écart est déclaré.
 */
const TITRE_TEXTE = "Croissance";

export interface Chiffre {
  /** La valeur, mise en forme, par exemple « +120 ». */
  valeur: string;
  /** Ce que la valeur compte, en une ligne. */
  libelle: string;
}

export interface ProprietesChiffresCroissance {
  /** Le panneau sombre : chiffre d'affaires et commentaire. */
  principal?: Chiffre;
  /** Carte haut droite. */
  secondaire?: Chiffre;
  /** Carte haut extrême droite. */
  tertiaire?: Chiffre;
  /** Les deux chiffres de la carte large du bas. */
  bas?: readonly [Chiffre, Chiffre];
}

const PRINCIPAL: Chiffre = {
  valeur: "+10 M€",
  libelle:
    "de chiffre d'affaires, en croissance de +40 % année sur année. Une structure qui tient l'échelle nationale.",
};

// Corrigé par rapport à la maquette : quatre agences, une seule en France.
const SECONDAIRE: Chiffre = {
  valeur: "4",
  libelle: "agences : Lyon, Montréal, Dubaï, Madrid",
};

const TERTIAIRE: Chiffre = { valeur: "+120", libelle: "collaborateurs" };

const BAS: readonly [Chiffre, Chiffre] = [
  { valeur: "+120", libelle: "collaborateurs" },
  { valeur: "+200", libelle: "clients industriels" },
];

/** Carte de verre, identique sur les trois. */
const CARTE: React.CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  borderRadius: "var(--rad)",
  padding: "30px",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -30px rgba(0,0,0,.3)",
};

const NOMBRE: React.CSSProperties = {
  font: "600 calc(46px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.05em",
};

const LEGENDE: React.CSSProperties = {
  font: "400 14.5px/1.5 var(--fb)",
  color: "var(--ink2)",
  marginTop: "10px",
};

export default function ChiffresCroissance({
  principal = PRINCIPAL,
  secondaire = SECONDAIRE,
  tertiaire = TERTIAIRE,
  bas = BAS,
}: ProprietesChiffresCroissance) {
  return (
    <section className={replis.repli} data-accueil-v3="" style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <SectionPliableMobile titre={TITRE_TEXTE}>
        <div
          className={`mg-r2 ${v3.tuiles}`} data-reveal=""
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr",
            gridTemplateRows: "auto auto",
            gap: "16px",
          }}
        >
          <div
            className={`${styles.panneau} ${v3.tuile}`}
            style={{
              gridRow: "span 2",
              background: "var(--panel)",
              borderRadius: "var(--rad)",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              className={v3.masque}
              style={{
                position: "absolute",
                width: "420px",
                height: "420px",
                right: "-160px",
                top: "-160px",
                background:
                  "radial-gradient(circle,rgba(255,124,60,.32),transparent 68%)",
                pointerEvents: "none",
              }}
            />
            <div
              className={replis.enTeteBureau}
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                position: "relative",
              }}
            >
              {TITRE_TEXTE}
            </div>
            <div style={{ position: "relative" }}>
              <div
                className={v3.tuileValeur}
                style={{
                  font: "600 calc(clamp(56px,7vw,104px) * var(--ts))/.9 var(--ft)",
                  letterSpacing: "-.055em",
                  color: "#fff",
                }}
              >
                <span>{principal.valeur}</span>
              </div>
              <div
                className={v3.tuileTexte}
                style={{
                  font: "400 16px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.6)",
                  marginTop: "14px",
                  maxWidth: "30ch",
                }}
              >
                {principal.libelle}
              </div>
            </div>
          </div>

          <div className={v3.tuile} style={CARTE}>
            <div className={v3.tuileValeur} style={NOMBRE}>
              <span>{secondaire.valeur}</span>
            </div>
            <div className={v3.tuileTexte} style={LEGENDE}>{secondaire.libelle}</div>
          </div>

          <div className={styles.doublonMobile} style={CARTE}>
            <div style={NOMBRE}>
              <span>{tertiaire.valeur}</span>
            </div>
            <div style={LEGENDE}>{tertiaire.libelle}</div>
          </div>

          <div
            className={`${styles.basLarge} ${v3.fondu}`}
            style={{
              ...CARTE,
              gridColumn: "span 2",
              display: "flex",
              alignItems: "center",
              gap: "46px",
            }}
          >
            <div className={v3.tuile}>
              <div className={v3.tuileValeur} style={NOMBRE}>
                <span>{bas[0].valeur}</span>
              </div>
              <div className={v3.tuileTexte} style={LEGENDE}>{bas[0].libelle}</div>
            </div>
            <div
              className={v3.masque}
              style={{ width: "1px", height: "56px", background: "var(--line)" }}
            />
            <div className={v3.tuile}>
              <div className={v3.tuileValeur} style={NOMBRE}>
                <span>{bas[1].valeur}</span>
              </div>
              <div className={v3.tuileTexte} style={LEGENDE}>{bas[1].libelle}</div>
            </div>
          </div>
        </div>
        </SectionPliableMobile>
      </div>
    </section>
  );
}
