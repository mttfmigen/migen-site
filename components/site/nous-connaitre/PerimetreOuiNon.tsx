/**
 * Ce que nous faisons, ce que nous ne faisons pas.
 *
 * Maquette, lignes 5429 à 5457.
 *
 * CORRECTION SUR LA COPIE : la première ligne de la colonne de gauche écrivait
 * « Mettre à disposition des techniciens », formulation proscrite par le
 * contrat. Reformulée en « Affecter des techniciens de maintenance sur votre
 * site », même sens, même longueur.
 *
 * SECONDE RETOUCHE, DÉCLARÉE LE 13/10 : elle ne l'était nulle part. La deuxième
 * ligne de la colonne de droite écrit, dans la maquette, « nous le refusons dès
 * qu'il sort de la maintenance ». La page rend « nous refusons ce qui sort de la
 * maintenance ». Aucun interdit du contrat ne l'imposait, contrairement à la
 * retouche ci-dessus : ce sont nos mots. Les deux portent maintenant leur ligne
 * dans `CORRECTIONS` de `verification-nous-connaitre.tsx`.
 *
 * CE QUE CETTE LIGNE DIT, ET QUI ATTEND NATHAN. La colonne de gauche énumère
 * les cinq activités, travaux industriels et bureau d'études compris ; celle de
 * droite refuse « ce qui sort de la maintenance ». Lues ensemble, les deux
 * colonnes se contredisent dès que « la maintenance » désigne le seul entretien
 * des machines. C'est son positionnement, pas notre portage : la phrase reste
 * telle quelle et le constat est porté en B7 de
 * `docs/NOUS-CONNAITRE-ARBITRAGES.md`. Ne pas la réécrire sans son arbitrage.
 *
 * AU TÉLÉPHONE (maquette V3 du 16/10), les deux listes s'écrivent l'une sous
 * l'autre sur le blanc de la carte : la carte de verre et le panneau sombre
 * s'effacent (`.aplat`, `.decor`), « Ce que nous ne faisons pas » devient la
 * phrase clé qui ouvre la seconde liste (`.panneauTitre`), ses lignes passent
 * à l'encre de la page (`.listeClaire`). Les coches et les croix restent : elles disent oui
 * et non.
 */

import type { EntreeSommaire } from "./HautMobile";
import mobile from "./mobile-apropos.module.css";
import ouvertes from "./mobile-cartes-ouvertes.module.css";
import SectionRepliee from "./SectionRepliee";

/* Les deux étiquettes, écrites une fois : chaque carte porte la sienne. La
   bascule du téléphone porte la première seule, comme la maquette V3 du 16/10
   (« Ce que nous faisons ») ; l'étiquette de bureau qu'elle redit s'efface
   alors sous 880 px (`data-doublon-mobile`), la seconde reste dans la carte. */
const FAIT_TITRE = "Ce que nous faisons";
const PAS_FAIT_TITRE = "Ce que nous ne faisons pas";

const FAIT: readonly string[] = [
  "Affecter des techniciens de maintenance sur votre site, en résidence ou ponctuellement",
  "Tenir un contrat de maintenance préventive avec engagement de délai",
  "Préparer et conduire un arrêt technique, du chiffrage au redémarrage",
  "Transférer, monter et mettre en service une installation complète",
  "Concevoir en bureau d’études ce que nos équipes maintiendront ensuite",
];

const PAS_FAIT: readonly string[] = [
  "Du placement de CV : nos techniciens sont nos salariés, pas des profils revendus",
  "Tous les métiers : nous n’en avons qu’un, et nous refusons ce qui sort de la maintenance",
  "Accepter une mission faute de technicien disponible, nous avons déjà dit non à des groupes du CAC 40",
  "De la sous-traitance en cascade sur nos périmètres contractuels",
];

const TITRE_CARTE = FAIT_TITRE;

/** La carte 07 : la maquette la résume par la première ligne de la liste. */
export const SOMMAIRE_PERIMETRE: EntreeSommaire = {
  id: "ce-que-nous-faisons",
  titre: TITRE_CARTE,
};

export default function PerimetreOuiNon() {
  return (
    <SectionRepliee
      id={SOMMAIRE_PERIMETRE.id}
      titre={TITRE_CARTE}
      resume={FAIT[0]}
    >
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          <div
            className={mobile.aplat}
            style={{
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              boxShadow:
                "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
              borderRadius: "var(--rad)",
              padding: "34px 36px 36px",
            }}
          >
            <div
              data-doublon-mobile=""
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 18,
              }}
            >
              {FAIT_TITRE}
            </div>
            <ul
              style={{
                display: "grid", gridTemplateColumns: "minmax(0,1fr)",
                gap: 9,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {FAIT.map((ligne) => (
                <li
                  key={ligne}
                  style={{
                    display: "flex",
                    gap: 11,
                    font: "400 15px/1.55 var(--fb)",
                    color: "var(--ink1)",
                  }}
                >
                  <span aria-hidden="true" style={{ color: "var(--acc)", flex: "none" }}>
                    ✓
                  </span>
                  {ligne}
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`${mobile.aplat} ${ouvertes.blocSuivant}`}
            style={{
              borderRadius: "var(--rad)",
              background: "var(--panel)",
              padding: "34px 36px 36px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className={mobile.decor}
              style={{
                position: "absolute",
                width: 420,
                height: 420,
                right: -170,
                top: -190,
                background:
                  "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                className={mobile.panneauTitre}
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 18,
                }}
              >
                {PAS_FAIT_TITRE}
              </div>
              <ul
                className={ouvertes.listeClaire}
                style={{
                  display: "grid", gridTemplateColumns: "minmax(0,1fr)",
                  gap: 9,
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {PAS_FAIT.map((ligne) => (
                  <li
                    key={ligne}
                    style={{
                      display: "flex",
                      gap: 11,
                      font: "400 15px/1.55 var(--fb)",
                      color: "rgba(255,255,255,.72)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{ color: "var(--acc)", flex: "none" }}
                    >
                      ×
                    </span>
                    {ligne}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
