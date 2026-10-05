import {
  AGENCES,
  COPIE,
  PANNEAU_QUI,
  PANNEAU_QUI_LUEUR,
  QUI_AGENCES,
  QUI_CHIFFRES,
  QUI_HUB,
  QUI_LIBELLE,
  QUI_RANGEE_HUBS,
  QUI_VALEUR,
  HUBS,
} from "./habillage-offre";

/**
 * Le panneau sombre « Qui intervient chez vous », colonne droite de la section
 * « Réassurance » du gabarit 03.
 *
 * POURQUOI UN COMPOSANT À PART : il se monte dans la fente droite de
 * `accueil/CertificationsRse`, dont le panneau gauche (MASE, EcoVadis) est le
 * MÊME que celui de ce gabarit, au pixel. Reprendre ce composant plutôt que
 * recopier sa carte en verre évite deux versions de la même carte, qui
 * dériveraient au premier ajustement de charte.
 *
 * CE PANNEAU MANQUAIT COMPLÈTEMENT au site : la maquette le dessine entre le
 * bandeau de logos et « Votre problématique », et rien ne le rendait.
 *
 * SA COPIE N'EST PAS DU CORPUS, et c'est volontaire. Les trois chiffres, les dix
 * hubs et la ligne des agences sont des constantes du gabarit, relevées dans le
 * fichier de maquette : la même sur les dix-huit pages d'offre, et aucune page
 * du corpus ne l'écrit. Ce sont aussi, mot pour mot, les valeurs que le contrat
 * mandate (dix hubs, quatre agences) : il n'y a rien à arbitrer entre les deux.
 *
 * Composant SERVEUR.
 */
export default function PanneauQuiIntervient() {
  return (
    <div style={PANNEAU_QUI}>
      <div aria-hidden="true" style={PANNEAU_QUI_LUEUR} />
      <div style={{ position: "relative" }}>
        <div
          style={{
            font: "600 11.5px var(--fb)",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--acc)",
            marginBottom: 22,
          }}
        >
          {COPIE.quiSurtitre}
        </div>

        <div
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 20,
          }}
        >
          {QUI_CHIFFRES.map((chiffre) => (
            <div key={chiffre.libelle}>
              <div style={QUI_VALEUR}>{chiffre.valeur}</div>
              <div style={QUI_LIBELLE}>{chiffre.libelle}</div>
            </div>
          ))}
        </div>

        {/* Les dix hubs en pastilles. Du texte, pas des liens : la maquette ne
            les lie pas, et dix liens de plus en bas d'un panneau de
            réassurance diluent le maillage réel du cocon. */}
        <div style={QUI_RANGEE_HUBS}>
          {HUBS.map((hub) => (
            <span key={hub} style={QUI_HUB}>
              {hub}
            </span>
          ))}
        </div>

        <div style={QUI_AGENCES}>{AGENCES}</div>
      </div>
    </div>
  );
}
