/**
 * Notre histoire : la frise des six exercices.
 *
 * Maquette, lignes 5376 à 5397.
 *
 * POURQUOI CE N'EST PAS `accueil/FriseHistoire` : ce composant-là porte en dur
 * son titre (« D'un atelier lyonnais à quatre agences »), six jalons d'un autre
 * texte et un appel à l'action « Décrire ma ligne » qui ne figure pas sur cet
 * écran. Le réemployer imposerait trois contenus que la maquette n'écrit pas
 * ici. Seuls les jalons sont des données, le reste du gabarit diffère.
 *
 * UNE CORRECTION SUR LA COPIE DE LA MAQUETTE, détaillée dans le rapport de
 * portage : « le modèle en régie » (mot proscrit). « Plus de 200 clients » est
 * rendu mot pour mot, règle validée par le client.
 *
 * AU TÉLÉPHONE, les six jalons en tuiles 2 x 3 de la maquette V3 du 16/10
 * (l'année en orange, le texte dessous : `.tuilesV3`), la pastille de bureau
 * effacée (`.decor`), le chapô en phrase d'ouverture (`.leadV3`).
 */


import type { EntreeSommaire } from "./HautMobile";
import mobile from "./mobile-apropos.module.css";
import SectionRepliee from "./SectionRepliee";

/* Écrits une fois : l'en-tête de bureau et la bascule du téléphone. */
const SURTITRE_TEXTE = "Notre histoire";
const TITRE_TEXTE = "Cinq ans, de zéro à cent";
/* Le chapô de la section, et la phrase sous le titre de la carte repliée
   (`mobile-native-data.js` : la maquette résume la carte par ce paragraphe). */
const CHAPO =
  "Aucune levée de fonds. La croissance a suivi les sites clients\u00a0: un technicien, puis deux, puis une équipe.";

/** La carte 05 de la maquette mobile v2. */
export const SOMMAIRE_HISTOIRE: EntreeSommaire = {
  id: "notre-histoire",
  titre: TITRE_TEXTE,
};

interface Jalon {
  annee: string;
  texte: string;
  /** Pastille orange : premier et dernier jalon. */
  accentue?: true;
}

const JALONS: readonly Jalon[] = [
  {
    annee: "2021",
    texte:
      "Avril : création à Lyon. Un technicien de 23 ans, ses premiers clients, et ses amis recrutés un par un.",
    accentue: true,
  },
  {
    annee: "2022",
    texte:
      "Le modèle du technicien en résidence se structure. Les grands comptes appellent d’eux-mêmes pour des missions longues.",
  },
  {
    annee: "2023",
    texte:
      "Première équipe support dédiée. Le turnover passe sous la barre des 25 %, contre 60 % dans le secteur.",
  },
  {
    annee: "2024",
    texte:
      "Couverture nationale. Plus de 200 clients, missions de quelques semaines à plusieurs années.",
  },
  {
    annee: "2025",
    texte:
      /* « Migen Travaux », PAS « Migen », et c'est une faute réparée le 13/10.
         La maquette écrit « Orthus lance les travaux industriels et le bureau
         d'études » (`maquette/accueil-rendu.html:5390`). L'arbitrage de Mehdi du
         09/10, posé dans `lib/decisions-copie.ts`, remplace « Orthus » par
         « Migen Travaux ». Aucun composant de ce dossier n'importe ce fichier :
         la copie est en dur, la règle n'a donc jamais pu s'appliquer, et
         quelqu'un a écrit « Migen » à la main en perdant « Travaux ».

         CE QUE CETTE PERTE FAISAIT, et c'est exactement le retour de Nathan
         Jorez du 13/10, « cette page est ultra spé résidence comme si c'était
         la seule offre » : la seule phrase de la page qui nommait la marque
         portant les deux offres hors placement nommait l'entreprise entière,
         ce qui aplatissait ces deux offres en épisode de l'histoire du
         placement. */
      "Dubaï et Montréal ouvrent. Migen Travaux lance les travaux industriels et le bureau d’études.",
  },
  {
    annee: "2026",
    texte:
      "Le groupe s’unifie sous migen©. Quatre agences, cap sur 1 000 collaborateurs.",
    accentue: true,
  },
];

export default function FriseCinqAns() {
  return (
    <SectionRepliee
      id={SOMMAIRE_HISTOIRE.id}
      kicker={SURTITRE_TEXTE}
      titre={TITRE_TEXTE}
      resume={CHAPO}
    >
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 34,
            }}
          >
            <div data-titre-bureau="">
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 18,
                }}
              >
                {SURTITRE_TEXTE}
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "var(--ink)",
                  margin: 0,
                  textWrap: "balance",
                  maxWidth: "22ch",
                }}
              >
                {TITRE_TEXTE}
              </h2>
            </div>
            <p
              className={mobile.leadV3}
              style={{
                font: "400 15.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "42ch",
              }}
            >
              {CHAPO}
            </p>
          </div>
          <div style={{ position: "relative", paddingTop: 8 }}>
            {/* Le rail horizontal, masqué sous 1000px par `.mg-rail`. */}
            <div
              aria-hidden="true"
              className="mg-rail"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 14,
                height: 1,
                background: "var(--line)",
              }}
            />
            <ol
              className={`mg-rmulti mg-tl ${mobile.tuilesV3}`}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6,minmax(0,1fr))",
                gap: 14,
                position: "relative",
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {JALONS.map((j) => (
                <li key={j.annee}>
                  <div
                    aria-hidden="true"
                    className={mobile.decor}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 999,
                      background: j.accentue ? "var(--acc)" : "var(--ink4)",
                      marginBottom: 22,
                      boxShadow: j.accentue
                        ? "0 0 0 4px rgba(255,124,60,.16)"
                        : "none",
                    }}
                  />
                  <div
                    className={mobile.tuileValeur}
                    style={{
                      font: "600 calc(20px * var(--ts)) var(--ft)",
                      letterSpacing: "-.035em",
                      color: "var(--ink)",
                    }}
                  >
                    {j.annee}
                  </div>
                  <div
                    style={{
                      font: "400 13.5px/1.55 var(--fb)",
                      color: "var(--ink2)",
                      marginTop: 8,
                    }}
                  >
                    {j.texte}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
