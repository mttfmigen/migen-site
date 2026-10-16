"use client";

import { useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { flushSync } from "react-dom";

import {
  MentionsRgpd,
  erreursDuServeur,
  messageDuServeur,
} from "@/components/formulaire/FormulaireContact";
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
  CHAMP_DEMANDE,
  CHAMP_SOURCE,
  CLE_RENDEZ_VOUS,
  DEMANDES_LP,
  ERREUR_DEMANDE,
  FORMULAIRE_HUBSPOT_LP,
  PAGE_RENDEZ_VOUS_LP,
  SOURCE_LP,
  estDemandeLp,
  formulaireLp,
  type VarianteLP,
} from "./lead-lp";

/**
 * Le formulaire des landing pages publicitaires.
 *
 * DESSIN : `MigenLPForm` de la maquette V3 (titre, « Rappel dans l'heure »,
 * libellés au-dessus des champs, indicatif dans le cadre du numéro, bouton
 * « On me rappelle dans l'heure »). CHAMPS : ceux du formulaire HubSpot de la
 * LP en ligne, variante C, « Votre demande concerne » compris ; sans lui,
 * HubSpot refuserait chaque envoi. ENVOI : `/api/lead`, comme le site, avec
 * ses protections ; la route aiguille vers le formulaire HubSpot de la LP.
 *
 * « heros » : deux étapes comme la LP en ligne (le besoin et de quoi rappeler,
 * puis le reste). « contact », en bas de page : une seule.
 *
 * Après le succès : l'événement `hubspot_form_submit` (le nom que la LP en
 * ligne pousse, celui qu'écoutent les conversions Google Ads du conteneur Tag
 * Manager), puis la page de rendez-vous.
 */

interface Proprietes {
  variante: VarianteLP;
  /** Chemin de la page qui porte le formulaire, `/lp/...`. */
  page: string;
  titre?: string;
}

type Etat = "repos" | "envoi" | "succes" | "erreur";
type Nom = ChampContact | "demande";

/** `__LP.form.t` de la maquette. */
const TITRE_PAR_DEFAUT = "Décrivez votre besoin de maintenance";

const ETAPE_1: readonly Nom[] = ["demande", "email", "indicatif", "telephone"];
const ETAPE_2: readonly Nom[] = ["entreprise", "nom", "prenom", "message"];
const TOUS: readonly Nom[] = [...ETAPE_1, ...ETAPE_2];

/** Le temps laissé à Tag Manager pour envoyer ses balises avant de quitter la page,
    comme `trackAndGo` de la LP en ligne. */
const ATTENTE_TAG_MANAGER_MS = 1200;

const ECHEC_RESEAU = "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.";

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

/* « Votre demande concerne » : les choix de la LP en ligne (`CfChoice`). */
const GROUPE: CSSProperties = { gridColumn: "1 / -1", border: "none", margin: 0, padding: 0, minWidth: 0 };
const LISTE_CHOIX: CSSProperties = { display: "grid", gap: 8 };
const choix = (retenu: boolean, enErreur: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "13px 16px",
  borderRadius: 12,
  border: `1px solid ${retenu ? "#ff7c3c" : enErreur ? "#c2410c" : "#e5e3df"}`,
  background: retenu ? "rgba(255,124,60,.06)" : "#fff",
  font: "400 14px/1.35 var(--fb)",
  color: "#1c1b19",
  cursor: "pointer",
});

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

const RETOUR: CSSProperties = {
  minHeight: 44,
  marginTop: -8,
  border: "none",
  background: "none",
  font: "600 13px var(--fb)",
  color: "#6a6764",
  cursor: "pointer",
};

/* `#77736d` : la couleur de la mention dans la maquette, 4,8:1 sur blanc. */
const MENTION: CSSProperties = {
  margin: 0,
  textAlign: "center",
  font: "400 11.5px/1.5 var(--fb)",
  color: "#77736d",
};

const ETAPE_TEXTE: CSSProperties = {
  margin: "0 0 8px",
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#6a6764",
};

const PISTE: CSSProperties = { height: 4, borderRadius: 999, background: "#ecebe8", overflow: "hidden" };
const JAUGE: CSSProperties = { height: "100%", borderRadius: 999, background: "#ff7c3c", transformOrigin: "left center" };

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

/** Les erreurs de la saisie, limitées aux champs nommés. */
function erreursDe(contact: Contact, demande: string, noms: readonly Nom[]): Erreurs {
  const toutes: Erreurs = {
    ...valideContact(contact),
    ...(estDemandeLp(demande) ? {} : { demande: ERREUR_DEMANDE }),
  };
  return Object.fromEntries(
    Object.entries(toutes).filter(([nom]) => noms.includes(nom as Nom)),
  ) as Erreurs;
}

/** Le numéro au format E.164 que demandent les conversions améliorées de Google Ads. */
function numeroE164(contact: Contact): string {
  const chiffres = contact.telephone.replace(/\D/g, "").replace(/^0/, "");
  return `${contact.indicatif}${chiffres}`;
}

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

/** Les erreurs par champ renvoyées en 422 : celles du contact, et « demande ». */
function erreursRenvoyees(corps: unknown): Erreurs {
  const demande = (corps as { erreurs?: { demande?: unknown } } | null)?.erreurs?.demande;
  return {
    ...(erreursDuServeur(corps) ?? {}),
    ...(typeof demande === "string" && demande ? { demande } : {}),
  };
}

export function FormulaireLP({ variante, page, titre = TITRE_PAR_DEFAUT }: Proprietes) {
  const enEtapes = variante === "heros";
  const [contact, setContact] = useState<Contact>(CONTACT_VIDE);
  const [demande, setDemande] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [etape, setEtape] = useState<1 | 2>(1);
  const [etat, setEtat] = useState<Etat>("repos");
  const [annonce, setAnnonce] = useState("");
  const formulaireRef = useRef<HTMLFormElement>(null);
  const prefixe = useId();
  const formulaire = formulaireLp(page, variante);

  const visibles: readonly Nom[] = !enEtapes ? TOUS : etape === 1 ? ETAPE_1 : ETAPE_2;
  const enCours = etat === "envoi";

  /** Le curseur au premier de ces champs, dans l'ordre du document. */
  function focalise(noms: readonly string[]) {
    const champs = [...(formulaireRef.current?.elements ?? [])] as HTMLInputElement[];
    champs.find((champ) => noms.includes(champ.name))?.focus();
  }

  function montreErreurs(fautives: Erreurs, message: string) {
    const noms = Object.keys(fautives);
    // Une erreur de la première étape ramène à la première étape.
    const retour = enEtapes && noms.some((nom) => ETAPE_1.includes(nom as Nom));
    flushSync(() => {
      setErreurs(fautives);
      setEtat("erreur");
      setAnnonce(message);
      if (retour) setEtape(1);
    });
    // Les boutons de « Votre demande concerne » portent le nom CHAMP_DEMANDE, « demande ».
    focalise(noms);
  }

  function suivant() {
    const fautives = erreursDe(contact, demande, ETAPE_1);
    if (aDesErreurs(fautives)) {
      montreErreurs(fautives, "Quelques champs demandent une correction.");
      return;
    }
    flushSync(() => {
      setErreurs({});
      setEtat("repos");
      setAnnonce("");
      setEtape(2);
    });
    focalise(ETAPE_2);
  }

  function precedent() {
    flushSync(() => setEtape(1));
    focalise([CHAMP_DEMANDE]);
  }

  function saisit(nom: ChampContact, valeur: string) {
    setContact((precedent) => ({ ...precedent, [nom]: valeur }));
    setErreurs((precedentes) => (precedentes[nom] ? { ...precedentes, [nom]: undefined } : precedentes));
  }

  function choisit(valeur: string) {
    setDemande(valeur);
    setErreurs((precedentes) => (precedentes.demande ? { ...precedentes, demande: undefined } : precedentes));
  }

  async function envoie(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    // Lu avant tout `await` : le champ piège n'existe pas dans l'état React.
    const piege = new FormData(evenement.currentTarget).get(CHAMP_PIEGE);

    // Entrée sur la première étape : « Continuer », pas un envoi.
    if (enEtapes && etape === 1) {
      suivant();
      return;
    }

    const trouvees = erreursDe(contact, demande, TOUS);
    if (aDesErreurs(trouvees)) {
      montreErreurs(trouvees, "Quelques champs demandent une correction.");
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
          ...chargeUtile({
            contact,
            formulaire,
            piege: typeof piege === "string" ? piege : "",
            etablissement: {},
            attribution: attributionCourante(window.location.pathname),
            page: { url: window.location.href, titre: document.title },
          }),
          [CHAMP_SOURCE]: SOURCE_LP,
          [CHAMP_DEMANDE]: demande,
        }),
      });
      const corps: unknown = await reponse.json().catch(() => null);

      if (!reponse.ok) {
        const refusees = erreursRenvoyees(corps);
        montreErreurs(refusees, messageDuServeur(corps) ?? ECHEC_RESEAU);
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
        form_id: FORMULAIRE_HUBSPOT_LP,
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

  const idDemande = `${prefixe}-demande`;

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

      {enEtapes ? (
        <div>
          <p aria-live="polite" aria-atomic="true" style={ETAPE_TEXTE}>
            Étape {etape} sur 2
          </p>
          <div aria-hidden="true" style={PISTE}>
            <div className={styles.jauge} style={{ ...JAUGE, transform: `scaleX(${etape / 2})` }} />
          </div>
        </div>
      ) : null}

      <div style={GRILLE}>
        {visibles.includes("demande") ? (
          <fieldset
            style={GROUPE}
            aria-describedby={erreurs.demande ? `${idDemande}-erreur` : undefined}
            disabled={enCours}
          >
            <legend style={{ ...ETIQUETTE, padding: 0 }}>
              Votre demande concerne<span aria-hidden="true" style={ASTERISQUE}>&nbsp;*</span>
            </legend>
            <div style={LISTE_CHOIX}>
              {DEMANDES_LP.map((option) => (
                <label key={option} className={styles.choix} style={choix(demande === option, Boolean(erreurs.demande))}>
                  <input
                    type="radio"
                    name={CHAMP_DEMANDE}
                    value={option}
                    checked={demande === option}
                    required
                    onChange={() => choisit(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {erreurs.demande ? (
              <p id={`${idDemande}-erreur`} style={ERREUR}>
                {erreurs.demande}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {CHAMPS.filter((champ) => visibles.includes(champ.nom)).map((champ) => {
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

      {enEtapes && etape === 1 ? (
        <button type="submit" className={styles.envoi} style={BOUTON}>
          Continuer
        </button>
      ) : (
        <button type="submit" disabled={enCours} className={styles.envoi} style={BOUTON}>
          {enCours ? "Envoi en cours…" : "On me rappelle dans l’heure"}
        </button>
      )}

      {enEtapes && etape === 2 ? (
        <button type="button" onClick={precedent} disabled={enCours} className={styles.retour} style={RETOUR}>
          <span aria-hidden="true">← </span>Retour
        </button>
      ) : null}

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
