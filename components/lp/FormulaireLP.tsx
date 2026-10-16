"use client";

import { useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { flushSync } from "react-dom";

import { MentionsRgpd, erreursDuServeur, messageDuServeur } from "@/components/formulaire/FormulaireContact";
import {
  CHAMP_PIEGE,
  CONTACT_VIDE,
  INDICATIFS,
  aDesErreurs,
  chargeUtile,
  valideContact,
  type ChampContact,
  type Contact,
  type Erreurs,
} from "@/components/formulaire/validation";
import { litConsentement } from "@/lib/consentement";
import { attributionCourante } from "@/lib/utm";

import styles from "./conversion-lp.module.css";
import {
  CLE_RENDEZ_VOUS,
  FORM_ID_CONVERSION_LP,
  PAGE_RENDEZ_VOUS_LP,
  formulaireLp,
  numeroE164,
  type VarianteLP,
} from "./lead-lp";

/**
 * Le formulaire des landing pages publicitaires : `MigenLPForm` de la V3, au
 * héros comme au contact, sur UN SEUL ÉCRAN.
 *
 * DESSIN ET CHAMPS : ceux de la V3, dans son ordre (titre de la page,
 * « Rappel dans l'heure », Nom de l'entreprise, Nom, Prénom, Courriel,
 * Téléphone avec son indicatif, Message), tous obligatoires, libellés
 * au-dessus, bouton « On me rappelle dans l'heure ». Sous le bouton, la
 * mention RGPD du formulaire du site, et non celle de la V3 (« sans
 * engagement » est interdit).
 *
 * ENVOI : celui du site, à l'octet près. La charge est `chargeUtile`, celle de
 * `FormulaireContact` ; la route `/api/lead` la valide, la borne, la freine,
 * la dépose dans le formulaire HubSpot du site (`HUBSPOT_FORM_ID`) avec
 * l'attribution de la visite (`lib/utm.ts`), et n'écrit dans `leads` que
 * l'attribution. Seul l'identifiant d'analyse dit qu'il s'agit d'une LP.
 *
 * Après le succès : l'événement `hubspot_form_submit` (le nom que la LP en
 * ligne pousse, celui qu'écoutent les conversions Google Ads du conteneur Tag
 * Manager), puis la page de rendez-vous. En cas d'échec, la saisie reste.
 */

interface Proprietes {
  variante: VarianteLP;
  /** Chemin de la page qui porte le formulaire, `/lp/...`. */
  page: string;
  titre?: string;
}

type Etat = "repos" | "envoi" | "succes" | "erreur";

/** `__LP.form.t` de la maquette. */
const TITRE_PAR_DEFAUT = "Décrivez votre besoin de maintenance";

/** Le temps laissé à Tag Manager pour envoyer ses balises avant de quitter la page,
    comme `trackAndGo` de la LP en ligne. */
const ATTENTE_TAG_MANAGER_MS = 1200;

const ECHEC_RESEAU = "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez : votre saisie est conservée.";
const A_CORRIGER = "Quelques champs demandent une correction.";

interface Champ {
  nom: Exclude<ChampContact, "indicatif">;
  libelle: string;
  type: "text" | "email" | "tel" | "zone";
  remplissage: string;
  pleineLargeur: boolean;
}

/* Libellés, ordre et largeurs de `MigenLPForm` (DEF). */
const CHAMPS: readonly Champ[] = [
  { nom: "entreprise", libelle: "Nom de l’entreprise", type: "text", remplissage: "organization", pleineLargeur: true },
  { nom: "nom", libelle: "Nom", type: "text", remplissage: "family-name", pleineLargeur: false },
  { nom: "prenom", libelle: "Prénom", type: "text", remplissage: "given-name", pleineLargeur: false },
  { nom: "email", libelle: "Courriel", type: "email", remplissage: "email", pleineLargeur: true },
  { nom: "telephone", libelle: "Téléphone", type: "tel", remplissage: "tel", pleineLargeur: true },
  { nom: "message", libelle: "Message", type: "zone", remplissage: "off", pleineLargeur: true },
];

/* ---------------------------------------------- valeurs de MigenLPForm */

const CARTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 26,
  borderRadius: 26,
  background: "#fff",
  boxShadow: "0 30px 80px -40px rgba(0,0,0,.45)",
  border: "1px solid rgba(28,27,25,.06)",
  color: "#1c1b19",
  font: "400 14.5px var(--fb)",
  textAlign: "left",
  // La carte est blanche dans les deux thèmes, comme dans la maquette : les
  // listes natives doivent l'être aussi.
  colorScheme: "light",
};

const ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "6px 14px",
  flexWrap: "wrap",
};

const TITRE: CSSProperties = {
  margin: 0,
  font: "700 21px/1.2 var(--ft)",
  letterSpacing: "-.025em",
  color: "#1c1b19",
};

const MENTION_RAPPEL: CSSProperties = {
  paddingTop: 5,
  font: "600 11px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#b4490f",
  whiteSpace: "nowrap",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 12,
};

const ETIQUETTE: CSSProperties = {
  display: "block",
  marginBottom: 6,
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#6a6764",
};

const ASTERISQUE: CSSProperties = { color: "#b4490f" };

const bordure = (enErreur: boolean) => `1px solid ${enErreur ? "#c2410c" : "#e5e3df"}`;

const saisie = (enErreur: boolean): CSSProperties => ({
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  border: bordure(enErreur),
  background: "#fafafa",
  font: "400 14.5px/1.5 var(--fb)",
  color: "#1c1b19",
});

const enveloppeTel = (enErreur: boolean): CSSProperties => ({
  display: "flex",
  borderRadius: 12,
  border: bordure(enErreur),
  background: "#fafafa",
  overflow: "hidden",
});

const INDICATIF: CSSProperties = {
  flex: "none",
  width: 86,
  border: "none",
  borderRight: "1px solid #e5e3df",
  background: "#f1f2f4",
  padding: "0 4px 0 10px",
  font: "500 12.5px var(--fb)",
  color: "#1c1b19",
};

const SAISIE_TEL: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  padding: 12,
  background: "transparent",
  font: "400 14.5px var(--fb)",
  color: "#1c1b19",
};

const ERREUR: CSSProperties = {
  display: "block",
  margin: "5px 0 0",
  font: "500 12px var(--fb)",
  color: "#c2410c",
};

const BOUTON: CSSProperties = {
  height: 54,
  border: "none",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 15px var(--fb)",
  cursor: "pointer",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

/* `#77736d` : la couleur de la mention dans la maquette, 4,8:1 sur blanc. */
const MENTION: CSSProperties = {
  margin: 0,
  textAlign: "center",
  font: "400 11.5px/1.5 var(--fb)",
  color: "#77736d",
};

const ANNONCE: CSSProperties = { margin: 0, textAlign: "center", font: "500 12.5px/1.5 var(--fb)" };

/* L'écran « envoyé » de la maquette. */
const ENVOYE: CSSProperties = { display: "grid", gap: 12, textAlign: "center", padding: "30px 4px" };
const COCHE: CSSProperties = {
  width: 56,
  height: 56,
  margin: "0 auto",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  font: "700 24px var(--fb)",
};

/* ---------------------------------------------------------------- logique */

/**
 * Pousse l'événement de conversion puis quitte la page, en laissant à Tag
 * Manager le temps d'envoyer ses balises (`eventCallback`), comme `trackAndGo`
 * de la LP en ligne. Sans Tag Manager chargé (consentement refusé), il n'y a
 * rien à attendre : l'événement reste dans la page et la page part.
 */
function pousseEtQuitte(evenement: Record<string, unknown>, adresse: string): void {
  const fenetre = window as unknown as { dataLayer?: unknown[]; google_tag_manager?: unknown };
  fenetre.dataLayer = fenetre.dataLayer ?? [];
  let parti = false;
  const quitte = () => {
    if (parti) return;
    parti = true;
    window.location.assign(adresse);
  };
  if (!fenetre.google_tag_manager) {
    fenetre.dataLayer.push(evenement);
    quitte();
    return;
  }
  fenetre.dataLayer.push({ ...evenement, eventCallback: quitte, eventTimeout: ATTENTE_TAG_MANAGER_MS });
  window.setTimeout(quitte, ATTENTE_TAG_MANAGER_MS + 100);
}

export function FormulaireLP({ variante, page, titre = TITRE_PAR_DEFAUT }: Proprietes) {
  const [contact, setContact] = useState<Contact>(CONTACT_VIDE);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [etat, setEtat] = useState<Etat>("repos");
  const [annonce, setAnnonce] = useState("");
  const formulaireRef = useRef<HTMLFormElement>(null);
  const prefixe = useId();
  const formulaire = formulaireLp(page, variante);
  const enCours = etat === "envoi";

  /** Les erreurs à l'écran, puis le curseur au premier champ fautif, dans l'ordre du document. */
  function montreErreurs(fautives: Erreurs, message: string) {
    // `flushSync` : les champs doivent être réactivés avant de recevoir le curseur.
    flushSync(() => {
      setErreurs(fautives);
      setEtat("erreur");
      setAnnonce(message);
    });
    const champs = [...(formulaireRef.current?.elements ?? [])] as HTMLInputElement[];
    champs.find((champ) => champ.name in fautives)?.focus();
  }

  function saisit(nom: ChampContact, valeur: string) {
    setContact((precedent) => ({ ...precedent, [nom]: valeur }));
    setErreurs((precedentes) => (precedentes[nom] ? { ...precedentes, [nom]: undefined } : precedentes));
  }

  async function envoie(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    // Lu avant tout `await` : le champ piège n'existe pas dans l'état React.
    const piege = new FormData(evenement.currentTarget).get(CHAMP_PIEGE);

    const trouvees = valideContact(contact);
    if (aDesErreurs(trouvees)) {
      montreErreurs(trouvees, A_CORRIGER);
      return;
    }

    setErreurs({});
    setEtat("envoi");
    setAnnonce("");

    try {
      const reponse = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          chargeUtile({
            contact,
            formulaire,
            piege: typeof piege === "string" ? piege : "",
            etablissement: {},
            attribution: attributionCourante(window.location.pathname),
            // L'adresse complète de la LP (UTM et gclid compris) : la route
            // n'en garde la requête qu'avec la finalité publicitaire accordée.
            page: { url: window.location.href, titre: document.title },
          }),
        ),
      });
      const corps: unknown = await reponse.json().catch(() => null);

      if (!reponse.ok) {
        // Le serveur nomme le champ qu'il refuse ; la saisie reste en place.
        montreErreurs(erreursDuServeur(corps) ?? {}, messageDuServeur(corps) ?? ECHEC_RESEAU);
        return;
      }

      setEtat("succes");
      convertit();
    } catch (erreur) {
      // La demande n'est jamais partie : le visiteur doit le savoir pour réessayer.
      console.error("Envoi du formulaire de la landing page :", erreur);
      setEtat("erreur");
      setAnnonce(ECHEC_RESEAU);
    }
  }

  /** Après le succès seulement : la conversion, puis le rendez-vous. */
  function convertit() {
    // Le nom et le courriel attendent la page de rendez-vous, pour préremplir
    // l'agenda. Jamais dans l'adresse.
    try {
      window.sessionStorage.setItem(
        CLE_RENDEZ_VOUS,
        JSON.stringify({ nom: `${contact.prenom} ${contact.nom}`.trim(), email: contact.email }),
      );
    } catch {
      // Stockage bloqué : l'agenda s'ouvrira vide, rien de plus.
    }
    // Les données des conversions améliorées ne vont au dataLayer qu'avec la
    // finalité publicitaire accordée.
    const publicite = litConsentement()?.choix.publicite === true;
    pousseEtQuitte(
      {
        event: "hubspot_form_submit",
        form_id: FORM_ID_CONVERSION_LP,
        page_path: window.location.pathname,
        ...(publicite
          ? { enhanced_conversion_data: { email: contact.email, phone_number: numeroE164(contact) } }
          : {}),
      },
      PAGE_RENDEZ_VOUS_LP,
    );
  }

  if (etat === "succes") {
    return (
      <div style={CARTE} role="status">
        <div style={ENVOYE}>
          <div aria-hidden="true" style={COCHE}>✓</div>
          <p style={{ ...TITRE, fontSize: 21, lineHeight: 1.25 }}>Demande envoyée.</p>
          <p style={{ margin: 0, font: "400 14px/1.6 var(--fb)", color: "#4a4845" }}>
            Un chargé d’affaires vous rappelle dans l’heure. Choisissez maintenant votre créneau…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formulaireRef}
      onSubmit={envoie}
      /* `post` : sans JavaScript, la soumission native ne met jamais la saisie
         dans l'adresse (voir FormulaireContact). */
      method="post"
      noValidate
      style={CARTE}
    >
      <div style={ENTETE}>
        <h2 style={TITRE}>{titre}</h2>
        <span style={MENTION_RAPPEL}>Rappel dans l’heure</span>
      </div>

      {/* Champ piège, comme le formulaire du site : invisible pour une
          personne, rempli par un robot, jeté par la route. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${prefixe}-${CHAMP_PIEGE}`}>Site web</label>
        <input id={`${prefixe}-${CHAMP_PIEGE}`} name={CHAMP_PIEGE} type="text" defaultValue="" tabIndex={-1} autoComplete="off" />
      </div>

      <div style={GRILLE}>
        {CHAMPS.map((champ) => {
          const identifiant = `${prefixe}-${champ.nom}`;
          const erreur = erreurs[champ.nom] ?? (champ.nom === "telephone" ? erreurs.indicatif : undefined);
          const commun = {
            id: identifiant,
            name: champ.nom,
            value: contact[champ.nom],
            required: true,
            "aria-required": true,
            autoComplete: champ.remplissage,
            "aria-invalid": erreur ? true : undefined,
            "aria-describedby": erreur ? `${identifiant}-erreur` : undefined,
            disabled: enCours,
            onChange: (e: { target: { value: string } }) => saisit(champ.nom, e.target.value),
          };
          return (
            <div key={champ.nom} style={{ gridColumn: champ.pleineLargeur ? "1 / -1" : "auto", minWidth: 0 }}>
              <label htmlFor={identifiant} style={ETIQUETTE}>
                {champ.libelle}
                <span aria-hidden="true" style={ASTERISQUE}>&nbsp;*</span>
              </label>
              {champ.type === "zone" ? (
                <textarea {...commun} rows={3} className={styles.champ} style={{ ...saisie(Boolean(erreur)), resize: "vertical" }} />
              ) : champ.type === "tel" ? (
                <span className={styles.enveloppeTel} style={enveloppeTel(Boolean(erreur))}>
                  <select
                    name="indicatif"
                    value={contact.indicatif}
                    onChange={(e) => saisit("indicatif", e.target.value)}
                    disabled={enCours}
                    autoComplete="tel-country-code"
                    aria-label="Indicatif téléphonique du pays"
                    style={INDICATIF}
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
                <input {...commun} type={champ.type} className={styles.champ} style={saisie(Boolean(erreur))} />
              )}
              {erreur ? (
                <p id={`${identifiant}-erreur`} style={ERREUR}>
                  {erreur}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <button type="submit" disabled={enCours} className={styles.envoi} style={BOUTON}>
        {enCours ? "Envoi en cours…" : "On me rappelle dans l’heure"}
      </button>

      {/* La mention du site, mot pour mot : qui traite, pour quoi, où lire le reste. */}
      <MentionsRgpd style={MENTION} />

      {/* Une seule zone d'annonce, toujours présente : un lecteur d'écran
          n'annonce pas un élément qui vient d'apparaître. */}
      <p role="status" aria-live="polite" style={{ ...ANNONCE, color: etat === "erreur" ? "#c2410c" : "#1b5e20" }}>
        {annonce}
      </p>
    </form>
  );
}
