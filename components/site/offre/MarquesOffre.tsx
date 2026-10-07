"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import { FAMILLES } from "@/components/site/marques/marques-donnees";
import type { Marque } from "@/components/site/marques/marques-donnees";

/**
 * Section « Marques maintenues » du gabarit 03, relevée dans
 * `maquette/rendu/offres--depannage-industriel--panne-machine.html`
 * (section 12) : surtitre « Marques et constructeurs », H2 « Les équipements
 * que nous maintenons déjà », une phrase à droite, puis UNE famille de
 * constructeurs en tuiles blanches dans un panneau en verre.
 *
 * UNE SEULE FAMILLE, ET ELLE DÉPEND DE LA PAGE. Mesuré le 07/10 sur les
 * captures : `/offres/depannage-industriel/panne-machine/` et
 * `/expertises/mecanique/machine-outil/` rendent les treize machines-outils
 * (DMG Mori … Schuler), `/expertises/robotique/fanuc/` rend la robotique.
 * La famille est donc une DONNÉE de la page (`ContenuOffre.marquesFamille`,
 * la clé courte de `marques-donnees.ts`), pas une constante du composant.
 * Sans ce champ, rien n'est rendu : les 27 autres pages d'offre ne bougent pas.
 *
 * LES NOMS, L'ORDRE ET LES LOGOS ne sont pas réécrits ici : ils viennent de
 * `components/site/marques/marques-donnees.ts`, que `verification-marques.tsx`
 * relit dans la maquette à chaque exécution. Un constructeur dont le fichier
 * de logo manque du dépôt rend son nom en texte, comme sur `/marques/` : rien
 * n'est remplacé par le logo d'un autre.
 *
 * 38 des 210 captures du dépôt portent cette section : elle servira aux autres
 * pages le jour où leur donnée la déclare.
 */

/**
 * MODIFICATION D'UN COMPOSANT PARTAGÉ, déclarée ici : le 07/10, en portant
 * `/bureau-etudes/bureau-etude-electrique/`, dont la capture rend un RAIL
 * D'ONGLETS de deux familles au-dessus des tuiles (blocs 924 à 927, « Automatisme
 * & électricité 10 » actif, « Air comprimé, pompes & fluides 8 »). Celle de
 * `/offres/depannage-industriel/panne-machine/` n'en porte aucun.
 *
 * AJOUT SEUL : sans `familles`, le rendu est celui d'avant, tuile pour tuile,
 * donc les pages déjà portées ne bougent pas. Le composant est devenu CLIENT
 * pour cette seule raison : la maquette dessine des `<button>`, et des onglets
 * qui ne commutent rien seraient un faux bouton. Le HTML servi au premier rendu
 * est inchangé.
 */
export interface ProprietesMarquesOffre {
  /** La clé courte de la famille : `auto`, `robot`, `mo`, `plast`, `agro`, `logi`, `fluide`. */
  famille: string;
  /**
   * Les familles du rail d'onglets, par leurs clés courtes. Absent, aucun rail
   * n'est rendu et la section tient à `famille` seule, comme avant le 07/10.
   */
  familles?: readonly string[];
}

const ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 48,
  alignItems: "end",
  marginBottom: 24,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "22ch",
  textWrap: "balance",
};

const PHRASE: CSSProperties = {
  font: "400 15.5px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "46ch",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
  gap: 10,
};

/* Blocs 924 à 927 de `maquette/rendu/bureau-etudes--bureau-etude-electrique.html` :
   le rail d'onglets, qui défile horizontalement quand il déborde. */
const RAIL: CSSProperties = {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  scrollbarWidth: "none",
  paddingBottom: 18,
  marginBottom: 18,
  borderBottom: "1px solid var(--line)",
};

function pastille(active: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 999,
    border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
    background: active ? "var(--ink)" : "#fff",
    color: active ? "#fff" : "var(--ink1)",
    font: "600 13.5px var(--fb)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background var(--tr),color var(--tr)",
  };
}

/* La capture écrit `color:var(--ink4)` sur le compte de l'onglet inactif, soit
   2,4:1 sur blanc en 11px, très loin du 4,5:1 de la WCAG 1.4.3. `--ink2` donne
   5,4:1 : même arbitrage que `PagesLiees`, et il ne change aucun mot. */
const COMPTE: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
};

const TUILE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 72,
  padding: "0 18px",
  borderRadius: 16,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.07)",
  minWidth: 0,
};

/** Nom en texte quand le fichier du logo manque, même règle que `/marques/`. */
const NOM_SANS_LOGO: CSSProperties = {
  font: "600 13px/1.3 var(--fb)",
  color: "var(--ink1)",
  textAlign: "center",
  overflowWrap: "anywhere",
};

function Tuile({ marque }: { marque: Marque }) {
  return (
    <span title={marque.nom} style={TUILE}>
      {marque.logo ? (
        // `img` et non `next/image` : les dimensions intrinsèques de ces
        // fichiers ne sont pas connues du dépôt (voir `marques/Familles.tsx`).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={marque.logo}
          alt={marque.nom}
          loading="lazy"
          style={{
            maxHeight: 34,
            maxWidth: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <span style={NOM_SANS_LOGO}>{marque.nom}</span>
      )}
    </span>
  );
}

export default function MarquesOffre({
  famille,
  familles,
}: ProprietesMarquesOffre) {
  const [active, setActive] = useState(famille);
  /* Une clé inconnue du rail est ignorée plutôt que rendue vide, même règle que
     `famille` plus bas : le rail ne nomme que des familles qui existent. */
  const rail = (familles ?? []).flatMap(
    (cle) => FAMILLES.find((f) => f.cle === cle) ?? [],
  );
  const retenue =
    FAMILLES.find((f) => f.cle === active) ??
    FAMILLES.find((f) => f.cle === famille);
  // Une clé inconnue ne rend rien et n'invente aucune famille de repli :
  // afficher les machines-outils sur une page de robotique serait une donnée
  // fausse. Le champ se corrige dans le JSON de la page.
  if (!retenue) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={SURTITRE}>Marques et constructeurs</div>
            <h2 style={TITRE}>Les équipements que nous maintenons déjà</h2>
          </div>
          <p style={PHRASE}>
            Vos machines sont dans la liste&nbsp;? Le technicien qui les
            connaît fait déjà partie de nos équipes.
          </p>
        </div>
        <div style={{ ...VERRE, padding: "22px 24px 24px" }}>
          {rail.length > 0 ? (
            <div className="mg-autorail" style={RAIL}>
              {rail.map((f) => (
                <button
                  key={f.cle}
                  type="button"
                  aria-pressed={f.cle === retenue.cle}
                  onClick={() => setActive(f.cle)}
                  style={pastille(f.cle === retenue.cle)}
                >
                  <span>{f.titre}</span>
                  <span
                    style={{
                      ...COMPTE,
                      color: f.cle === retenue.cle ? "var(--acc)" : "var(--ink2)",
                    }}
                  >
                    {f.marques.length}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          <div style={GRILLE}>
            {retenue.marques.map((marque) => (
              <Tuile key={marque.nom} marque={marque} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
