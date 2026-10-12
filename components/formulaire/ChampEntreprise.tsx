"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";

import {
  LONGUEUR_MINIMALE,
  champsCaches,
  chercheEntreprises,
  type Etablissement,
} from "@/lib/annuaire-entreprises";

/**
 * LE CHAMP « NOM DE L'ENTREPRISE », ADOSSÉ AU REGISTRE.
 *
 * POURQUOI. La maquette pose cinq champs cachés sur ce formulaire,
 * `country`, `siren`, `siret`, `address`, `zip`, et le portail HubSpot porte
 * les propriétés correspondantes. Ils restaient vides : HubSpot ne recevait
 * que la chaîne tapée, donc « Danone » et « danone sa » faisaient deux
 * fiches, et aucun rapprochement automatique n'était possible.
 *
 * CE QUI NE CHANGE PAS, et c'est délibéré : le champ reste un champ de texte
 * libre, au même endroit, avec le même dessin et le même libellé. Qui ne
 * trouve pas son entreprise au registre écrit son nom et envoie. La recherche
 * PROPOSE, elle n'impose pas.
 *
 * ACCESSIBILITÉ : motif combobox de l'ARIA Authoring Practices. Le champ porte
 * `role="combobox"`, la liste `role="listbox"`, les flèches parcourent,
 * Entrée choisit, Échap ferme. `aria-activedescendant` dit au lecteur d'écran
 * quelle proposition est survolée sans déplacer le focus.
 */

const LISTE: CSSProperties = {
  position: "absolute",
  zIndex: 20,
  insetInline: 0,
  top: "calc(100% + 4px)",
  margin: 0,
  padding: 4,
  listStyle: "none",
  maxHeight: 280,
  overflowY: "auto",
  background: "var(--card, #fff)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad-s, 12px)",
  boxShadow: "0 18px 40px -24px rgba(0,0,0,.45)",
};

const OPTION: CSSProperties = {
  padding: "9px 11px",
  borderRadius: 8,
  cursor: "pointer",
  display: "block",
};

const NOM: CSSProperties = {
  display: "block",
  font: "600 14px/1.3 var(--ft)",
  letterSpacing: "-.015em",
  color: "var(--ink)",
};

const DETAIL: CSSProperties = {
  display: "block",
  font: "400 12.5px/1.45 var(--fb)",
  color: "var(--ink2)",
  marginTop: 2,
};

export interface ChampEntrepriseProps {
  /** Les attributs communs que le formulaire pose sur chacun de ses champs. */
  commun: Record<string, unknown>;
  valeur: string;
  /** Remonte la saisie au formulaire, comme n'importe quel autre champ. */
  surSaisie: (valeur: string) => void;
  /** Remonte l'établissement élu, ou `{}` quand le visiteur écrit librement. */
  surElection: (champs: Record<string, string>) => void;
}

export default function ChampEntreprise({
  commun,
  valeur,
  surSaisie,
  surElection,
}: ChampEntrepriseProps) {
  const [propositions, setPropositions] = useState<Etablissement[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const [survole, setSurvole] = useState(-1);
  const [elu, setElu] = useState<Etablissement | null>(null);
  const racine = useRef<HTMLDivElement>(null);
  const listeId = useId();
  const optionId = (i: number) => `${listeId}-${i}`;

  /* LA RECHERCHE EST DIFFÉRÉE DE 250 ms et chaque réponse en retard est
     jetée : sans cela, taper « danone » lance six requêtes et c'est la plus
     lente qui gagne, donc parfois celle de « dan ». */
  useEffect(() => {
    if (elu && elu.nom === valeur) return;
    const terme = valeur.trim();
    if (terme.length < LONGUEUR_MINIMALE) {
      setPropositions([]);
      return;
    }
    let abandonne = false;
    const minuteur = setTimeout(() => {
      void chercheEntreprises(terme).then((r) => {
        if (abandonne) return;
        setPropositions(r);
        setSurvole(-1);
        if (r.length) setOuvert(true);
      });
    }, 250);
    return () => {
      abandonne = true;
      clearTimeout(minuteur);
    };
  }, [valeur, elu]);

  /* Un clic ailleurs referme. Le `pointerdown` plutôt que le `click` : le
     second arriverait après que le champ a perdu le focus. */
  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: PointerEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener("pointerdown", dehors);
    return () => document.removeEventListener("pointerdown", dehors);
  }, [ouvert]);

  function choisit(e: Etablissement) {
    setElu(e);
    surSaisie(e.nom);
    surElection(champsCaches(e));
    setOuvert(false);
    setPropositions([]);
  }

  function auClavier(evenement: React.KeyboardEvent<HTMLInputElement>) {
    if (!ouvert || propositions.length === 0) return;
    if (evenement.key === "ArrowDown") {
      evenement.preventDefault();
      setSurvole((i) => (i + 1) % propositions.length);
    } else if (evenement.key === "ArrowUp") {
      evenement.preventDefault();
      setSurvole((i) => (i <= 0 ? propositions.length - 1 : i - 1));
    } else if (evenement.key === "Enter" && survole >= 0) {
      evenement.preventDefault();
      choisit(propositions[survole]);
    } else if (evenement.key === "Escape") {
      setOuvert(false);
    }
  }

  return (
    <div ref={racine} style={{ position: "relative" }}>
      <input
        {...commun}
        type="text"
        role="combobox"
        aria-expanded={ouvert && propositions.length > 0}
        aria-controls={listeId}
        aria-autocomplete="list"
        aria-activedescendant={survole >= 0 ? optionId(survole) : undefined}
        value={valeur}
        onChange={(evenement) => {
          /* Modifier le nom après avoir choisi, c'est renoncer au choix : on
             ne garde pas un SIREN qui ne correspond plus à ce qui est écrit. */
          if (elu) {
            setElu(null);
            surElection({});
          }
          surSaisie(evenement.target.value);
        }}
        onKeyDown={auClavier}
        onFocus={() => {
          if (propositions.length) setOuvert(true);
        }}
      />

      {ouvert && propositions.length > 0 ? (
        <ul id={listeId} role="listbox" aria-label="Entreprises trouvées au registre" style={LISTE}>
          {propositions.map((e, i) => (
            <li
              key={`${e.siren}-${i}`}
              id={optionId(i)}
              role="option"
              aria-selected={i === survole}
              onPointerDown={(evenement) => {
                /* `pointerdown` et non `click` : le `blur` du champ fermerait
                   la liste avant que le clic ne l'atteigne. */
                evenement.preventDefault();
                choisit(e);
              }}
              onPointerEnter={() => setSurvole(i)}
              style={{
                ...OPTION,
                background: i === survole ? "var(--gsol, rgba(28,27,25,.055))" : "transparent",
              }}
            >
              <span style={NOM}>{e.nom}</span>
              <span style={DETAIL}>
                {[e.codePostal, e.ville].filter(Boolean).join(" ")}
                {e.activite ? ` · ${e.activite}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* LES CHAMPS CACHÉS DE LA MAQUETTE, remplis seulement quand le visiteur
          a désigné une entreprise. Ils sont dans le DOM pour que la soumission
          native les emporte si le JavaScript du formulaire venait à manquer. */}
      {elu
        ? Object.entries(champsCaches(elu)).map(([nom, v]) => (
            <input key={nom} type="hidden" name={nom} value={v} readOnly />
          ))
        : null}

      {elu ? (
        <p
          style={{
            margin: "6px 0 0",
            font: "400 12.5px/1.5 var(--fb)",
            color: "var(--ink2)",
          }}
        >
          {`Identifiée au registre : SIREN ${elu.siren}`}
          {elu.ville ? ` · ${elu.ville}` : ""}
        </p>
      ) : null}
    </div>
  );
}
