"use client";

import Link from "next/link";
import {
  useId,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from "react";

import { attributionCourante } from "@/lib/utm";
import { signaleConversion } from "./conversion";
import styles from "./FormulaireContact.module.css";
import {
  CHAMP_PIEGE,
  CONTACT_VIDE,
  INDICATIFS,
  OPTIONNELS,
  aDesErreurs,
  valideContact,
  type ChampContact,
  type Contact,
  type Erreurs,
} from "./validation";

type Etat = "repos" | "envoi" | "succes" | "erreur";

interface Proprietes {
  /** Identifiant du formulaire, en slug : il sert de clé d'analyse des conversions. */
  formulaire: string;
  titre?: string;
}

interface Champ {
  nom: ChampContact;
  libelle: string;
  type: "text" | "email" | "tel" | "zone";
  /** Valeur de `autocomplete`, pour que le navigateur remplisse sans se tromper. */
  remplissage: string;
  /** Vrai si le champ occupe les deux colonnes de la grille. */
  pleineLargeur: boolean;
}

/* Ordre, libellés et largeurs relevés dans la maquette (« Migen - Site
   final.dc.html », formulaire du héros lignes 483 à 533, formulaire de bas de
   page lignes 1171 à 1200 : les deux sont identiques). Nom et prénom sont les
   seuls champs sur une colonne, tout le reste tient les deux. */
const CHAMPS: readonly Champ[] = [
  { nom: "entreprise", libelle: "Nom de l’entreprise", type: "text", remplissage: "organization", pleineLargeur: true },
  { nom: "nom", libelle: "Nom", type: "text", remplissage: "family-name", pleineLargeur: false },
  { nom: "prenom", libelle: "Prénom", type: "text", remplissage: "given-name", pleineLargeur: false },
  { nom: "email", libelle: "Courriel", type: "email", remplissage: "email", pleineLargeur: true },
  { nom: "telephone", libelle: "Téléphone", type: "tel", remplissage: "tel", pleineLargeur: true },
  { nom: "message", libelle: "Message", type: "zone", remplissage: "off", pleineLargeur: true },
];

const ECHEC_RESEAU =
  "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.";

/* Valeurs de la maquette, recopiées telles quelles. Déclarées au niveau du
   module : un objet de style reconstruit à chaque rendu casse la mémoïsation
   et alloue pour rien. */

const TITRE: CSSProperties = {
  font: "600 20px/1.2 var(--ft)",
  letterSpacing: "-.03em",
  gridColumn: "span 2",
  margin: 0,
};

/* Posée en ligne comme dans la maquette ; le repli mobile est dans le module. */
const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const ETIQUETTE: CSSProperties = {
  display: "block",
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink3)",
  marginBottom: 6,
};

const SAISIE: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "var(--card)",
  font: "400 14.5px var(--fb)",
  color: "var(--ink)",
};

const ZONE: CSSProperties = { ...SAISIE, lineHeight: 1.5, resize: "vertical" };

/* Téléphone : la maquette met l'indicatif et le numéro dans UN SEUL cadre, la
   bordure portée par l'enveloppe et retirée des deux champs. Le focus visible
   est donc posé sur l'enveloppe par le module CSS (`:focus-within`), sinon le
   visiteur au clavier ne verrait plus où il est. */
const ENVELOPPE_TEL: CSSProperties = {
  display: "flex",
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "var(--card)",
  overflow: "hidden",
};

const INDICATIF_CHOIX: CSSProperties = {
  flex: "none",
  width: 84,
  border: "none",
  borderRight: "1px solid var(--line)",
  background: "var(--bg)",
  padding: "0 4px 0 10px",
  font: "500 12.5px var(--fb)",
  color: "var(--ink)",
};

const SAISIE_TEL: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  padding: 12,
  background: "transparent",
  font: "400 14.5px var(--fb)",
  color: "var(--ink)",
};

/* La maquette met cette rangée en `var(--ink4)` (#a8a49d), mais elle ne
   contenait aucun texte : 2,4:1 sur blanc, sous le plancher WCAG. La mention
   RGPD est du texte à lire, donc `var(--ink2)` (5,4:1), l'encre des
   paragraphes de la maquette. */
const RANGEE_ENVOI: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 4,
  gridColumn: "span 2",
  font: "400 11.5px/1.5 var(--fb)",
  color: "var(--ink2)",
  textAlign: "center",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 24px",
  borderRadius: 999,
  border: "none",
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

const MENTION: CSSProperties = {
  gridColumn: "span 2",
  // 11 px : la taille des mentions de la maquette (notes de carte, légendes).
  // Sur deux lignes, 33 px : c'est le seul ajout au gabarit de la maquette, et
  // il est là parce que la loi l'exige au point de collecte, pas par goût.
  font: "400 11px/1.5 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/** Même gabarit que la mention, sans couleur : l'état la fournit. */
const ANNONCE: CSSProperties = {
  gridColumn: "span 2",
  font: "400 11.5px/1.5 var(--fb)",
  margin: 0,
};

const ERREUR: CSSProperties = {
  font: "400 11.5px/1.5 var(--fb)",
  margin: "6px 0 0",
};

const ASTERISQUE: CSSProperties = { color: "var(--acc)" };

export function FormulaireContact({ formulaire, titre }: Proprietes) {
  const [contact, setContact] = useState<Contact>(CONTACT_VIDE);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [etat, setEtat] = useState<Etat>("repos");
  const [annonce, setAnnonce] = useState("");
  const prefixe = useId();

  // La saisie efface l'erreur du champ touché, pas celle des autres : corriger
  // un champ ne doit pas faire disparaître la liste de ce qui reste à corriger.
  function saisit(nom: ChampContact, valeur: string) {
    setContact((precedent) => ({ ...precedent, [nom]: valeur }));
    setErreurs((precedent) =>
      precedent[nom] ? { ...precedent, [nom]: undefined } : precedent,
    );
  }

  async function envoie(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    // Lu dans le document et non dans l'état React : le champ piège n'a pas à
    // exister dans le modèle du formulaire. Lecture avant tout `await`, le
    // formulaire pouvant être démonté entre-temps.
    const piege = new FormData(evenement.currentTarget).get(CHAMP_PIEGE);

    const trouvees = valideContact(contact);
    if (aDesErreurs(trouvees)) {
      setErreurs(trouvees);
      setEtat("erreur");
      setAnnonce("Quelques champs demandent une correction.");
      return;
    }

    setErreurs({});
    setEtat("envoi");
    setAnnonce("");

    try {
      const reponse = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contact,
          formulaire,
          [CHAMP_PIEGE]: typeof piege === "string" ? piege : "",
          attribution: attributionCourante(window.location.pathname),
          // HubSpot range la soumission sous la page vue : l'URL complète et le
          // titre ne sont connus que du navigateur.
          page: { url: window.location.href, titre: document.title },
        }),
      });

      const corps: unknown = await reponse.json().catch(() => null);
      const message = messageDuServeur(corps);

      if (!reponse.ok) {
        setEtat("erreur");
        setAnnonce(message ?? ECHEC_RESEAU);
        return;
      }

      setEtat("succes");
      setAnnonce(message ?? "Votre demande est bien arrivée. Nous vous rappelons.");
      setContact(CONTACT_VIDE);

      // Après le succès seulement, et sans effet tant que la finalité
      // publicitaire n'est pas consentie : voir ./conversion.ts.
      signaleConversion({ formulaire, page: window.location.pathname });
    } catch (erreur) {
      // Panne réseau ou envoi interrompu : la demande n'est jamais partie, le
      // visiteur doit le savoir pour réessayer.
      console.error("Envoi du formulaire :", erreur);
      setEtat("erreur");
      setAnnonce(ECHEC_RESEAU);
    }
  }

  const enCours = etat === "envoi";

  return (
    <form onSubmit={envoie} noValidate className={styles.grille} style={GRILLE}>
      {titre ? <h2 style={TITRE}>{titre}</h2> : null}

      {/* Le type de formulaire est aussi dans le document, pour que la balise
          HubSpot qui lit le DOM retrouve l'origine de la demande. Le serveur,
          lui, revalide ce qu'il reçoit : ce champ n'est pas une autorité. */}
      <input type="hidden" name="formulaire" value={formulaire} readOnly />

      {/* Champ piège. Pas `type="hidden"` ni `display:none` : les robots les
          plus simples sautent l'un et l'autre. Il est sorti du cadre visible,
          retiré du parcours clavier, masqué aux technologies d'assistance et
          exclu du remplissage automatique du navigateur, donc invisible pour
          une personne et bien présent pour un automate. Étant positionné en
          absolu, il ne consomme aucune cellule de la grille. Le serveur jette
          la demande s'il revient rempli. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${prefixe}-${CHAMP_PIEGE}`}>Site web</label>
        <input
          id={`${prefixe}-${CHAMP_PIEGE}`}
          name={CHAMP_PIEGE}
          type="text"
          defaultValue=""
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {CHAMPS.map((champ) => {
        const identifiant = `${prefixe}-${champ.nom}`;
        const identifiantErreur = `${identifiant}-erreur`;
        const erreur = erreurs[champ.nom];
        // Déduit de la validation, jamais redit ici : c'est elle qui décide
        // quels champs sont exigés, et `required` doit dire la même chose.
        const obligatoire = !OPTIONNELS.has(champ.nom);
        const commun = {
          id: identifiant,
          name: champ.nom,
          value: contact[champ.nom],
          required: obligatoire,
          // L'astérisque est décoratif : le caractère obligatoire est porté par
          // `required` et `aria-required`, donc annoncé sans dépendre d'un signe.
          "aria-required": obligatoire ? true : undefined,
          autoComplete: champ.remplissage,
          "aria-invalid": erreur ? true : undefined,
          "aria-describedby": erreur ? identifiantErreur : undefined,
          disabled: enCours,
          className: styles.champ,
          onChange: (
            evenement: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => saisit(champ.nom, evenement.target.value),
        };

        return (
          <div
            key={champ.nom}
            style={{
              gridColumn: champ.pleineLargeur ? "span 2" : undefined,
              minWidth: 0,
            }}
          >
            <label htmlFor={identifiant} style={ETIQUETTE}>
              {champ.libelle}
              {obligatoire ? (
                <span aria-hidden="true" style={ASTERISQUE}>
                  &nbsp;*
                </span>
              ) : (
                <span> (facultatif)</span>
              )}
            </label>

            {champ.type === "zone" ? (
              <textarea {...commun} rows={3} style={ZONE} />
            ) : champ.type === "tel" ? (
              <span style={ENVELOPPE_TEL} className={styles.enveloppeTel}>
                <select
                  name="indicatif"
                  value={contact.indicatif}
                  onChange={(evenement) =>
                    saisit("indicatif", evenement.target.value)
                  }
                  disabled={enCours}
                  autoComplete="tel-country-code"
                  /* Le libellé « Téléphone » appartient au champ du numéro :
                     sans nom propre, un lecteur d'écran annoncerait cette liste
                     comme « liste déroulante », sans dire de quoi. */
                  aria-label="Indicatif téléphonique du pays"
                  style={INDICATIF_CHOIX}
                >
                  {INDICATIFS.map((indicatif) => (
                    <option key={indicatif.code} value={indicatif.code}>
                      {indicatif.libelle}
                    </option>
                  ))}
                </select>
                <input {...commun} type="tel" style={SAISIE_TEL} />
              </span>
            ) : (
              <input {...commun} type={champ.type} style={SAISIE} />
            )}

            {erreur ? (
              <p id={identifiantErreur} className="text-red-700" style={ERREUR}>
                {erreur}
              </p>
            ) : null}
          </div>
        );
      })}

      <div style={RANGEE_ENVOI}>
        <button
          type="submit"
          disabled={enCours}
          className={styles.boutonEnvoi}
          style={BOUTON}
        >
          {enCours ? "Envoi en cours…" : "On me rappelle dans l’heure"}
        </button>
      </div>


      {/* Information au point de collecte, exigée par le RGPD (articles 13 et
          14) : qui traite, pour quoi, qui reçoit, où lire le reste. Elle est
          fixe et non paramétrable, car une page qui pose ce formulaire ne doit
          pas pouvoir l'oublier en omettant une propriété. */}
      <p style={MENTION}>
        Données traitées par Migen pour répondre à votre demande, enregistrées
        dans HubSpot. Droits et durées de conservation :{" "}
        {/* `/confidentialite/`, l'URL de l'inventaire. L'ancienne,
            `/politique-de-confidentialite/`, est une 301 depuis le site
            WordPress : y lier depuis chaque formulaire du site aurait coûté
            une redirection à chaque clic, et à chaque passage de robot. */}
        <Link href="/confidentialite/" className="underline">
          politique de confidentialité
        </Link>
      </p>

      {/* Une seule zone d'annonce, toujours présente dans le document : un
          lecteur d'écran n'annonce pas le contenu d'un élément qui vient
          d'apparaître. `polite` n'interrompt pas la saisie en cours. */}
      <p
        role="status"
        aria-live="polite"
        style={ANNONCE}
        className={`${styles.annonce} ${etat === "erreur" ? "text-red-700" : "text-green-800"}`}
      >
        {annonce}
      </p>
    </form>
  );
}

/** Le serveur renvoie `{ message }` : tout autre corps est ignoré. */
function messageDuServeur(corps: unknown): string | null {
  if (typeof corps !== "object" || corps === null) return null;
  const message = (corps as { message?: unknown }).message;
  return typeof message === "string" && message ? message : null;
}
