"use client";

import Link from "next/link";
import {
  useEffect,
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

/**
 * Événement par lequel un panneau court (« Être rappelé », héros des pages
 * génériques de la maquette) remet sa saisie à ce formulaire au lieu de la
 * perdre : `detail` porte `entreprise`, `telephone`, `email`. Seuls ces trois
 * champs sont repris, et seulement s'ils sont des chaînes non vides.
 */
export const EVENEMENT_PREREMPLIR = "migen:preremplir";
const PREREMPLISSABLES = ["entreprise", "telephone", "email"] as const;

interface Proprietes {
  /** Identifiant du formulaire, en slug : il sert de clé d'analyse des conversions. */
  formulaire: string;
  titre?: string;
  /** Le texte du bouton d'envoi. La maquette y répète le titre du panneau. */
  libelleEnvoi?: string;
  /**
   * « panneau » : le bouton du formulaire des panneaux en verre de la maquette
   * (héros et « 10 Appel final » des offres, relevé tpl 87 des captures) tient
   * toute la largeur, et la mention RGPD prend la place de la rangée centrée
   * qui le suit (tpl 88, vide dans la maquette). « compact », par défaut : le
   * bouton à gauche du formulaire « Décrire mon besoin » (tpl 3322). Sans
   * variante, le rendu des autres gabarits, inchangé (écart mobile compris).
   */
  variante?: "compact" | "panneau";
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

/* Relevé tpl 87 : le bouton est une cellule de la grille, sur deux colonnes. */
const BOUTON_PANNEAU: CSSProperties = {
  ...BOUTON,
  gridColumn: "span 2",
  gap: 9,
  padding: "15px 26px",
};

/* Relevé tpl 88 : la rangée sous le bouton, centrée, en 11,5 px. L'encre passe
   de --ink4 à --ink2 pour la même raison que `RANGEE_ENVOI`. */
const MENTION_PANNEAU: CSSProperties = {
  gridColumn: "span 2",
  font: "400 11.5px/1.5 var(--fb)",
  color: "var(--ink2)",
  textAlign: "center",
  margin: 0,
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
  // `--err`, posé dans la charte, et non `text-red-700` de Tailwind : la couleur
  // d'une alerte appartient à la charte du site, pas à la palette d'un outil.
  // Mesuré à 6,54:1 sur le fond de la carte.
  color: "var(--err)",
};

const ASTERISQUE: CSSProperties = { color: "var(--acc)" };

export function FormulaireContact({
  formulaire,
  titre,
  libelleEnvoi = "On me rappelle dans l’heure",
  variante,
}: Proprietes) {
  const [contact, setContact] = useState<Contact>(CONTACT_VIDE);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [etat, setEtat] = useState<Etat>("repos");
  const [annonce, setAnnonce] = useState("");
  const prefixe = useId();
  const panneau = variante === "panneau";

  // La saisie d'un panneau court, reprise ici (voir EVENEMENT_PREREMPLIR).
  useEffect(() => {
    function reprend(evenement: Event) {
      const detail: unknown = (evenement as CustomEvent).detail;
      if (typeof detail !== "object" || detail === null) return;
      const repris: Partial<Contact> = {};
      for (const nom of PREREMPLISSABLES) {
        const valeur = (detail as Record<string, unknown>)[nom];
        if (typeof valeur === "string" && valeur.trim()) repris[nom] = valeur.trim();
      }
      setContact((precedent) => ({ ...precedent, ...repris }));
    }
    window.addEventListener(EVENEMENT_PREREMPLIR, reprend);
    return () => window.removeEventListener(EVENEMENT_PREREMPLIR, reprend);
  }, []);

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
    <form
      onSubmit={envoie}
      noValidate
      /* L'écart de 36 px sous 900 px est celui des panneaux d'offre (voir le module). */
      className={variante ? `${styles.grille} ${styles.grilleMaquette}` : styles.grille}
      style={GRILLE}
    >
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
              <p id={identifiantErreur} style={ERREUR}>
                {erreur}
              </p>
            ) : null}
          </div>
        );
      })}

      {panneau ? (
        <button
          type="submit"
          disabled={enCours}
          className={styles.boutonEnvoi}
          style={BOUTON_PANNEAU}
        >
          {enCours ? "Envoi en cours…" : libelleEnvoi}
        </button>
      ) : (
        <div style={RANGEE_ENVOI}>
          <button
            type="submit"
            disabled={enCours}
            className={styles.boutonEnvoi}
            style={BOUTON}
          >
            {enCours ? "Envoi en cours…" : libelleEnvoi}
          </button>
        </div>
      )}


      {/* Information au point de collecte, exigée par le RGPD (articles 13 et
          14) : qui traite, pour quoi, qui reçoit, où lire le reste. Elle est
          fixe et non paramétrable, car une page qui pose ce formulaire ne doit
          pas pouvoir l'oublier en omettant une propriété. */}
      <p style={panneau ? MENTION_PANNEAU : MENTION}>
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
        style={{
          ...ANNONCE,
          // L'annonce ne dit pas son sens par la couleur SEULE : elle porte un
          // texte explicite, et le lecteur d'écran l'entend par `role="status"`.
          // La couleur n'est qu'un renfort, d'où des jetons de la charte et non
          // une palette de framework.
          color: etat === "erreur" ? "var(--err)" : "var(--ok)",
        }}
        className={styles.annonce}
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
