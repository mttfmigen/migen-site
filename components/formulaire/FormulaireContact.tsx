"use client";

import Link from "next/link";
import { useId, useState, type ChangeEvent, type FormEvent } from "react";

import { attributionCourante } from "@/lib/utm";
import { signaleConversion } from "./conversion";
import {
  CHAMP_PIEGE,
  CONTACT_VIDE,
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
  /** Promesse tenue à l'envoi, affichée sous le bouton. */
  engagement?: string;
}

interface Champ {
  nom: ChampContact;
  libelle: string;
  type: "text" | "email" | "tel" | "zone";
  /** Valeur de `autocomplete`, pour que le navigateur remplisse sans se tromper. */
  remplissage: string;
  obligatoire: boolean;
}

const CHAMPS: readonly Champ[] = [
  { nom: "entreprise", libelle: "Entreprise", type: "text", remplissage: "organization", obligatoire: true },
  { nom: "prenom", libelle: "Prénom", type: "text", remplissage: "given-name", obligatoire: true },
  { nom: "nom", libelle: "Nom", type: "text", remplissage: "family-name", obligatoire: true },
  { nom: "email", libelle: "Adresse e-mail", type: "email", remplissage: "email", obligatoire: true },
  { nom: "telephone", libelle: "Téléphone", type: "tel", remplissage: "tel", obligatoire: true },
  { nom: "message", libelle: "Votre besoin", type: "zone", remplissage: "off", obligatoire: false },
];

const ECHEC_RESEAU =
  "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.";

export function FormulaireContact({ formulaire, titre, engagement }: Proprietes) {
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
    <form onSubmit={envoie} noValidate className="flex flex-col gap-5">
      {titre ? <h2 className="text-xl font-semibold">{titre}</h2> : null}

      {/* Le type de formulaire est aussi dans le document, pour que la balise
          HubSpot qui lit le DOM retrouve l'origine de la demande. Le serveur,
          lui, revalide ce qu'il reçoit : ce champ n'est pas une autorité. */}
      <input type="hidden" name="formulaire" value={formulaire} readOnly />

      {/* Champ piège. Pas `type="hidden"` ni `display:none` : les robots les
          plus simples sautent l'un et l'autre. Il est sorti du cadre visible,
          retiré du parcours clavier, masqué aux technologies d'assistance et
          exclu du remplissage automatique du navigateur, donc invisible pour
          une personne et bien présent pour un automate. Le serveur jette la
          demande s'il revient rempli. */}
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
        const commun = {
          id: identifiant,
          name: champ.nom,
          value: contact[champ.nom],
          required: champ.obligatoire,
          autoComplete: champ.remplissage,
          "aria-invalid": erreur ? true : undefined,
          "aria-describedby": erreur ? identifiantErreur : undefined,
          disabled: enCours,
          className:
            "rounded-md border border-current/20 bg-transparent px-3 py-2 " +
            "outline-none focus:border-current/60 disabled:opacity-60",
          onChange: (
            evenement: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => saisit(champ.nom, evenement.target.value),
        };

        return (
          <div key={champ.nom} className="flex flex-col gap-1.5">
            <label htmlFor={identifiant} className="text-sm font-medium">
              {champ.libelle}
              {champ.obligatoire ? null : (
                <span className="font-normal opacity-60"> (facultatif)</span>
              )}
            </label>

            {champ.type === "zone" ? (
              <textarea {...commun} rows={5} />
            ) : (
              <input {...commun} type={champ.type} />
            )}

            {erreur ? (
              <p id={identifiantErreur} className="text-sm text-red-700">
                {erreur}
              </p>
            ) : null}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-foreground px-4 py-2.5 font-medium text-background disabled:opacity-60"
      >
        {enCours ? "Envoi en cours..." : "Envoyer ma demande"}
      </button>

      {engagement ? <p className="text-sm opacity-70">{engagement}</p> : null}

      {/* Information au point de collecte, exigée par le RGPD (articles 13 et
          14) : qui traite, pour quoi, qui reçoit, où lire le reste. Elle est
          fixe et non paramétrable, car une page qui pose ce formulaire ne doit
          pas pouvoir l'oublier en omettant une propriété. */}
      <p className="text-xs leading-relaxed opacity-70">
        Les informations saisies sont traitées par Migen, responsable du
        traitement, dans le seul but de répondre à votre demande. Elles sont
        enregistrées dans HubSpot, notre outil de gestion de la relation client.
        Vos droits et les durées de conservation sont détaillés dans notre{" "}
        <Link href="/politique-de-confidentialite/" className="underline">
          politique de confidentialité
        </Link>
        .
      </p>

      {/* Une seule zone d'annonce, toujours présente dans le document : un
          lecteur d'écran n'annonce pas le contenu d'un élément qui vient
          d'apparaître. `polite` n'interrompt pas la saisie en cours. */}
      <p
        role="status"
        aria-live="polite"
        className={
          etat === "erreur" ? "text-sm text-red-700" : "text-sm text-green-800"
        }
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
