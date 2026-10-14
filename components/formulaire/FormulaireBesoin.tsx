"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { flushSync } from "react-dom";

import { attributionCourante } from "@/lib/utm";
import {
  BESOINS,
  EVENEMENT_BESOIN,
  SAISIE_VIDE,
  erreursVersChamps,
  estBesoin,
  valideBesoin,
  versContact,
  type ChampBesoin,
  type ErreursBesoin,
  type Saisie,
} from "./besoin";
import ChampEntreprise from "./ChampEntreprise";
import { signaleConversion } from "./conversion";
import {
  CLE_PREREMPLISSAGE,
  EVENEMENT_PREREMPLIR,
  MentionsRgpd,
  erreursDuServeur,
  messageDuServeur,
} from "./FormulaireContact";
import styles from "./FormulaireBesoin.module.css";
import { CHAMP_PIEGE, INDICATIFS, aDesErreurs, chargeUtile } from "./validation";

/**
 * LE FORMULAIRE « DÉCRIVEZ VOTRE BESOIN » DU HUB /ressources/, repris de la
 * maquette Ressources v2 (`markup-indent.html` l. 604 à 693). Décision de
 * Mehdi du 14/10 : la maquette fait foi sur ce hub.
 *
 * Une VARIANTE, pas un second circuit : la charge part par `chargeUtile` vers
 * `/api/lead`, revalidée par `valideCharge`, avec les mêmes clés que
 * `FormulaireContact`. Le champ unique « Prénom et nom » est découpé en
 * `prenom` et `nom`, le besoin choisi passe en tête de `message` (./besoin.ts).
 * Champ piège, attribution, établissement du registre, conversion et
 * préremplissage sont ceux de `FormulaireContact`.
 *
 * Au téléphone, la maquette garde tous les champs sur une colonne (relevé
 * mobile 390 px) : pas de mode en étapes ici.
 */

/** Ordre du document : le curseur va au premier champ fautif dans cet ordre. */
const ORDRE: readonly ChampBesoin[] = ["nomComplet", "entreprise", "email", "telephone", "besoin", "message"];

const ECHEC_RESEAU = "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.";

/* Valeurs de la maquette, recopiées telles quelles. */
const FORM: CSSProperties = { display: "grid", gap: 14 };
const TITRE: CSSProperties = { font: "600 23px/1.2 var(--ft)", letterSpacing: "-.035em", margin: "0 0 4px" };
const BLOC: CSSProperties = { display: "grid", gap: 6, minWidth: 0 };
const LIBELLE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink2)",
};
const SAISIE: CSSProperties = {
  width: "100%",
  height: 50,
  padding: "0 16px",
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--ink)",
  font: "400 15px var(--fb)",
};
const LISTE: CSSProperties = { ...SAISIE, padding: "0 44px 0 16px", appearance: "none", WebkitAppearance: "none", cursor: "pointer" };
const CHEVRON: CSSProperties = {
  position: "absolute",
  right: 19,
  top: 19,
  width: 7,
  height: 7,
  borderRight: "2px solid var(--ink2)",
  borderBottom: "2px solid var(--ink2)",
  transform: "rotate(45deg)",
  pointerEvents: "none",
};
const ZONE: CSSProperties = {
  ...SAISIE,
  height: "auto",
  padding: "14px 16px",
  font: "400 15px/1.5 var(--fb)",
  resize: "vertical",
};
/* L'indicatif et le numéro dans UN cadre de 50 px, comme sur les autres
   formulaires du site : la maquette n'a pas de liste de pays, mais sans elle
   un numéro belge ou canadien partirait précédé de « +33 ». */
const CADRE_TEL: CSSProperties = {
  display: "flex",
  height: 50,
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "var(--card)",
  overflow: "hidden",
};
const INDICATIF: CSSProperties = {
  flex: "none",
  width: 84,
  border: "none",
  borderRight: "1px solid var(--line)",
  background: "transparent",
  padding: "0 4px 0 12px",
  font: "500 13px var(--fb)",
  color: "var(--ink)",
};
const NUMERO: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  padding: "0 16px",
  background: "transparent",
  color: "var(--ink)",
  font: "400 15px var(--fb)",
};
const ALERTE: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(194,65,12,.1)",
  color: "#c2410c",
  font: "500 13.5px/1.45 var(--fb)",
  margin: 0,
};
const BOUTON: CSSProperties = {
  height: 56,
  border: "none",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 15px var(--fb)",
  cursor: "pointer",
  boxShadow: "0 14px 30px -14px rgba(255,124,60,.9)",
};
/* La phrase sous le bouton (12 px, centrée). L'encre passe de `--ink3`
   (3,5:1) à `--ink2` : c'est du texte légal à lire. */
const MENTION: CSSProperties = { font: "400 12px/1.5 var(--fb)", color: "var(--ink2)", textAlign: "center", margin: 0 };

export function FormulaireBesoin({ formulaire }: { formulaire: string }) {
  const [saisie, setSaisie] = useState<Saisie>(SAISIE_VIDE);
  const [erreurs, setErreurs] = useState<ErreursBesoin>({});
  const [entreprise, setEntreprise] = useState<Record<string, string>>({});
  const [enCours, setEnCours] = useState(false);
  const [alerte, setAlerte] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const merciRef = useRef<HTMLHeadingElement>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const prefixe = useId();

  // « Demander mon diagnostic » présélectionne le besoin (`askDiag` de la maquette).
  useEffect(() => {
    function choisit(evenement: Event) {
      const besoin: unknown = (evenement as CustomEvent).detail;
      if (!estBesoin(besoin)) return;
      setEnvoye(false);
      setSaisie((s) => ({ ...s, besoin }));
      setErreurs((e) => ({ ...e, besoin: undefined }));
      setAlerte("");
    }
    window.addEventListener(EVENEMENT_BESOIN, choisit);
    return () => window.removeEventListener(EVENEMENT_BESOIN, choisit);
  }, []);

  // Le préremplissage des panneaux courts, comme `FormulaireContact`.
  useEffect(() => {
    function reprend(evenement: Event) {
      const detail: unknown = (evenement as CustomEvent).detail;
      if (typeof detail !== "object" || detail === null) return;
      const repris: Partial<Saisie> = {};
      for (const nom of ["entreprise", "telephone", "email"] as const) {
        const valeur = (detail as Record<string, unknown>)[nom];
        if (typeof valeur === "string" && valeur.trim()) repris[nom] = valeur.trim();
      }
      flushSync(() => setSaisie((s) => ({ ...s, ...repris })));
    }
    window.addEventListener(EVENEMENT_PREREMPLIR, reprend);
    try {
      const garde = window.sessionStorage.getItem(CLE_PREREMPLISSAGE);
      if (garde) {
        window.sessionStorage.removeItem(CLE_PREREMPLISSAGE);
        reprend(new CustomEvent(EVENEMENT_PREREMPLIR, { detail: JSON.parse(garde) as unknown }));
        formRef.current?.scrollIntoView({ block: "start" });
      }
    } catch {
      // Session indisponible ou illisible : le formulaire reste vide, rien ne casse.
    }
    return () => window.removeEventListener(EVENEMENT_PREREMPLIR, reprend);
  }, []);

  useEffect(() => {
    if (envoye) merciRef.current?.focus();
  }, [envoye]);

  function saisit(nom: keyof Saisie, valeur: string) {
    setSaisie((s) => ({ ...s, [nom]: valeur }));
    setErreurs((e) => (e[nom as ChampBesoin] ? { ...e, [nom]: undefined } : e));
    setAlerte("");
  }

  /* Les champs sont réactivés DANS le même rendu que les erreurs : un champ
     encore `disabled` refuse le focus, et après un 422 le curseur tombait sur
     la page (mesuré le 14/10). Sans champ fautif (503, réseau), le curseur
     revient au bouton, que sa désactivation pendant l'envoi lui avait ôté. */
  function signale(trouvees: ErreursBesoin, texte: string) {
    flushSync(() => {
      setErreurs(trouvees);
      setAlerte(texte);
      setEnCours(false);
    });
    const premier = ORDRE.find((c) => trouvees[c]);
    (premier ? document.getElementById(`${prefixe}-${premier}`) : boutonRef.current)?.focus();
  }

  async function envoie(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const piege = new FormData(evenement.currentTarget).get(CHAMP_PIEGE);

    const trouvees = valideBesoin(saisie);
    if (aDesErreurs(trouvees)) {
      signale(trouvees, ORDRE.flatMap((c) => (trouvees[c] ? [trouvees[c]] : [])).join(" "));
      return;
    }

    setEnCours(true);
    setAlerte("");
    try {
      const reponse = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          chargeUtile({
            contact: versContact(saisie),
            formulaire,
            piege: typeof piege === "string" ? piege : "",
            etablissement: entreprise,
            attribution: attributionCourante(window.location.pathname),
            page: { url: window.location.href, titre: document.title },
          }),
        ),
      });
      const corps: unknown = await reponse.json().catch(() => null);
      if (!reponse.ok) {
        const refuses = erreursDuServeur(corps);
        signale(refuses ? erreursVersChamps(refuses, saisie) : {}, messageDuServeur(corps) ?? ECHEC_RESEAU);
        return;
      }
      setSaisie(SAISIE_VIDE);
      setEntreprise({});
      setErreurs({});
      setEnvoye(true);
      signaleConversion({ formulaire, page: window.location.pathname });
    } catch (erreur) {
      console.error("Envoi du formulaire :", erreur);
      signale({}, ECHEC_RESEAU);
    } finally {
      setEnCours(false);
    }
  }

  if (envoye) {
    return (
      <div className={styles.merci}>
        <span aria-hidden="true" className={styles.pastille}>
          <span />
        </span>
        <h2 ref={merciRef} tabIndex={-1} style={{ font: "600 28px/1.1 var(--ft)", letterSpacing: "-.04em", margin: 0 }}>
          Merci, c’est noté.
        </h2>
        <p style={{ font: "400 15.5px/1.6 var(--fb)", color: "var(--ink1)", margin: 0, maxWidth: "40ch" }}>
          Un chargé d’affaires vous rappelle dans l’heure, aux horaires ouvrés.
        </p>
        <button
          type="button"
          onClick={() => {
            // Le bouton disparaît avec l'écran de remerciement : le curseur va au premier champ.
            flushSync(() => setEnvoye(false));
            document.getElementById(`${prefixe}-nomComplet`)?.focus();
          }}
          className={styles.autre}
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  const attributs = (nom: ChampBesoin) => ({
    id: `${prefixe}-${nom}`,
    name: nom === "nomComplet" ? "nom_complet" : nom,
    "aria-invalid": erreurs[nom] ? true : undefined,
    "aria-describedby": erreurs[nom] ? `${prefixe}-${nom}-erreur` : undefined,
    disabled: enCours,
    className: styles.champ,
  });
  /* L'erreur du champ, lue avec lui par le lecteur d'écran quand le curseur s'y
     pose. Hors de la vue : la maquette ne dessine que le bandeau d'erreur. */
  const erreurDe = (nom: ChampBesoin) =>
    erreurs[nom] ? (
      <span id={`${prefixe}-${nom}-erreur`} className="sr-only">
        {erreurs[nom]}
      </span>
    ) : null;
  const obligatoire = { required: true, "aria-required": true } as const;

  return (
    <form ref={formRef} onSubmit={envoie} method="post" noValidate style={FORM}>
      <h2 style={TITRE}>Décrivez votre besoin</h2>

      <input type="hidden" name="formulaire" value={formulaire} readOnly />
      {/* Champ piège, le même que `FormulaireContact` : hors cadre, hors clavier. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${prefixe}-${CHAMP_PIEGE}`}>Site web</label>
        <input id={`${prefixe}-${CHAMP_PIEGE}`} name={CHAMP_PIEGE} type="text" defaultValue="" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.deux}>
        <div style={BLOC}>
          <label htmlFor={`${prefixe}-nomComplet`} style={LIBELLE}>Prénom et nom</label>
          <input
            {...attributs("nomComplet")}
            {...obligatoire}
            type="text"
            autoComplete="name"
            value={saisie.nomComplet}
            onChange={(e) => saisit("nomComplet", e.target.value)}
            style={SAISIE}
          />
          {erreurDe("nomComplet")}
        </div>
        <div style={BLOC}>
          <label htmlFor={`${prefixe}-entreprise`} style={LIBELLE}>Entreprise</label>
          <ChampEntreprise
            commun={{ ...attributs("entreprise"), ...obligatoire, autoComplete: "organization", style: SAISIE }}
            valeur={saisie.entreprise}
            surSaisie={(v) => saisit("entreprise", v)}
            surElection={setEntreprise}
          />
          {erreurDe("entreprise")}
        </div>
        <div style={BLOC}>
          <label htmlFor={`${prefixe}-email`} style={LIBELLE}>E-mail professionnel</label>
          <input
            {...attributs("email")}
            {...obligatoire}
            type="email"
            autoComplete="email"
            value={saisie.email}
            onChange={(e) => saisit("email", e.target.value)}
            style={SAISIE}
          />
          {erreurDe("email")}
        </div>
        <div style={BLOC}>
          <label htmlFor={`${prefixe}-telephone`} style={LIBELLE}>Téléphone</label>
          <span style={CADRE_TEL} className={styles.cadreTel}>
            <select
              name="indicatif"
              value={saisie.indicatif}
              onChange={(e) => saisit("indicatif", e.target.value)}
              disabled={enCours}
              autoComplete="tel-country-code"
              aria-label="Indicatif téléphonique du pays"
              style={INDICATIF}
            >
              {INDICATIFS.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.libelle}
                </option>
              ))}
            </select>
            <input
              {...attributs("telephone")}
              {...obligatoire}
              type="tel"
              autoComplete="tel-national"
              value={saisie.telephone}
              onChange={(e) => saisit("telephone", e.target.value)}
              style={NUMERO}
            />
          </span>
          {erreurDe("telephone")}
        </div>
      </div>

      <div style={BLOC}>
        <label htmlFor={`${prefixe}-besoin`} style={LIBELLE}>Votre besoin</label>
        <span style={{ position: "relative", display: "block" }}>
          <select
            {...attributs("besoin")}
            {...obligatoire}
            value={saisie.besoin}
            onChange={(e) => saisit("besoin", e.target.value)}
            style={LISTE}
          >
            <option value="">Choisir…</option>
            {BESOINS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span aria-hidden="true" style={CHEVRON} />
        </span>
        {erreurDe("besoin")}
      </div>

      <div style={BLOC}>
        <label htmlFor={`${prefixe}-message`} style={LIBELLE}>Votre message (facultatif)</label>
        <textarea
          {...attributs("message")}
          rows={3}
          placeholder="Site, équipements, délai…"
          value={saisie.message}
          onChange={(e) => saisit("message", e.target.value)}
          style={ZONE}
        />
        {erreurDe("message")}
      </div>

      {/* Toujours dans le document, pour que le lecteur d'écran l'annonce ;
          vide, il ne prend aucune place (module). */}
      <p role="status" aria-live="polite" className={styles.alerte} style={ALERTE}>
        {alerte}
      </p>

      <button ref={boutonRef} type="submit" disabled={enCours} className={styles.bouton} style={BOUTON}>
        {enCours ? "Envoi en cours…" : "Envoyer ma demande →"}
      </button>

      {/* La maquette écrit ici « Vos coordonnées servent uniquement à vous
          recontacter. » Phrase FAUSSE au regard de la mention du site, qui
          annonce aussi la prospection : elle n'est pas reprise, l'information
          légale prend sa place. */}
      <MentionsRgpd style={MENTION} />
    </form>
  );
}
