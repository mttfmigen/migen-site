"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { CHAMP_PIEGE } from "@/components/formulaire/validation";

import { Coche, HALO_HAUT_GAUCHE, PANNEAU_SOMBRE, SURTITRE_ORANGE } from "./BlocsBas";
import c from "./candidature.module.css";
import s from "./hub.module.css";

/**
 * Bloc candidature de l'espace Techniciens, maquette « Ressources v2 »
 * (`#rs-cand`, `markup-indent.html` lignes 744 à 972, logique `page-dc.jsx`
 * lignes 102 à 140). Libellés, options et message d'erreur au mot près.
 *
 * Branché sur /api/candidature (TeamTailor), la route du hub carrière : aucun
 * champ nouveau, chaque champ de la maquette a déjà sa place dans la route.
 * Écarts délibérés, tous signalés à Mehdi :
 *   · « Prénom et nom » est un seul champ, la route attend prénom ET nom : le
 *     premier mot part en prénom, le reste en nom, et un seul mot est refusé ;
 *   · le CV ne part pas (la route ne prend que du JSON), son NOM part, avec la
 *     mention « non transmis » pour que le recruteur le réclame ;
 *   · « Ex. 25 000 » n'est pas écrit (aucun montant sur le site) ;
 *   · une mention RGPD sous le bouton, comme sur le formulaire Entreprises ;
 *   · l'ancre reste `#postuler`, celle que vise « Postuler → » du process.
 */

const METIERS = [
  "Technicien de maintenance",
  "Électromécanicien",
  "Automaticien",
  "Roboticien",
  "Technicien de maintenance itinérant",
  "Agent de maintenance industrielle",
  "Responsable maintenance",
  "Autre métier",
];
const REGIONS = [
  "France entière",
  "Auvergne-Rhône-Alpes",
  "Île-de-France",
  "Grand Est",
  "Hauts-de-France",
  "Normandie",
  "Bretagne",
  "Pays de la Loire",
  "Centre-Val de Loire",
  "Bourgogne-Franche-Comté",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Provence-Alpes-Côte d’Azur",
  "Corse",
];
const TRAJETS = ["30 minutes", "45 minutes", "1 heure", "1 h 30", "Plus d’1 h 30"];
const DELAIS = ["Immédiatement", "Sous 2 semaines", "Sous 1 mois", "Sous 2 mois", "3 mois ou plus"];
const AGENCES = ["Lyon", "Montréal", "Madrid", "Dubaï"];
const SECOURS = "L'envoi n'a pas abouti. Écrivez-nous à recrutement@migen.fr.";

const ETIQUETTE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink2)",
};
const CADRE: CSSProperties = {
  height: 50,
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--ink)",
  font: "400 15px var(--fb)",
  outline: "none",
};
const SAISIE: CSSProperties = { ...CADRE, padding: "0 16px", minWidth: 0 };
const DEUX: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
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

function Champ({ etiquette, children }: { etiquette: string; children: ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <span style={ETIQUETTE}>{etiquette}</span>
      {children}
    </label>
  );
}

function Liste({ nom, vide, options, requis }: { nom: string; vide: string; options: readonly string[]; requis?: boolean }) {
  return (
    <span style={{ position: "relative", display: "block" }}>
      <select
        name={nom}
        defaultValue=""
        aria-required={requis}
        className={c.saisie}
        style={{ ...CADRE, width: "100%", padding: "0 44px 0 16px", appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}
      >
        <option value="">{vide}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span aria-hidden="true" style={CHEVRON} />
    </span>
  );
}

/** Champ nombre suivi de son unité (« années », « € brut / an »). */
function AvecUnite({ nom, unite, pas, indice }: { nom: string; unite: string; pas?: number; indice?: string }) {
  return (
    <span className={c.boite} style={{ ...CADRE, display: "flex", alignItems: "center", paddingRight: 16 }}>
      <input
        type="number"
        name={nom}
        aria-required="true"
        min={0}
        step={pas}
        placeholder={indice}
        style={{ flex: 1, width: 0, minWidth: 0, height: "100%", padding: "0 16px", border: "none", background: "none", color: "var(--ink)", font: "400 15px var(--fb)", outline: "none" }}
      />
      <span style={{ font: "500 13px var(--fb)", color: "var(--ink3)", whiteSpace: "nowrap" }}>{unite}</span>
    </span>
  );
}

/** Ce qui manque, dans l'ordre et avec les mots de la maquette (`csend`). */
export function manquants(d: {
  nom: string;
  tel: string;
  mail: string;
  regions: readonly string[];
  trajet: string;
  delai: string;
  exp: string;
  sal: string;
}): string[] {
  const m: string[] = [];
  // Un seul mot ne fait pas « prénom et nom » : la route exige les deux.
  if (d.nom.trim().split(/\s+/).filter(Boolean).length < 2) m.push("nom");
  if (d.tel.replace(/\D/g, "").length < 10) m.push("téléphone");
  if (!/^\S+@\S+\.\S+$/.test(d.mail)) m.push("e-mail");
  if (!d.regions.length) m.push("mobilité");
  if (!d.trajet) m.push("temps de trajet");
  if (!d.delai) m.push("délai");
  // `min` ne bloque rien sous `noValidate` : un négatif partait tel quel.
  if (d.exp === "" || Number(d.exp) < 0) m.push("expérience");
  if (!d.sal || Number(d.sal) <= 0) m.push("prétentions salariales");
  return m;
}

/** La réponse de la route, lue sans lui faire confiance. */
async function messageDe(r: Response): Promise<string | null> {
  const corps: unknown = await r.json().catch(() => null);
  if (typeof corps !== "object" || corps === null) return null;
  const { message, champs } = corps as { message?: unknown; champs?: unknown };
  if (typeof message !== "string") return null;
  const details =
    typeof champs === "object" && champs !== null
      ? Object.values(champs).filter((v): v is string => typeof v === "string")
      : [];
  return [message, ...details].join(" ");
}

function Formulaire({ onEnvoye, retour }: { onEnvoye: () => void; retour: boolean }) {
  const [regions, setRegions] = useState<string[]>([]);
  const [cv, setCv] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const enCours = useRef(false);

  const choisit = (r: string) => {
    setErreur("");
    setRegions((a) => {
      const on = a.includes(r);
      if (r === "France entière") return on ? [] : [r];
      const sans = a.filter((x) => x !== "France entière" && x !== r);
      return on ? sans : [...sans, r];
    });
  };

  async function envoie(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /* Verrou synchrone : l'état `envoi` arrive un rendu trop tard, et le
       bouton n'est plus `disabled` (focus gardé), deux envois partaient. */
    if (enCours.current) return;
    const f = new FormData(e.currentTarget);
    const lis = (n: string) => String(f.get(n) ?? "").trim();
    const v = { nom: lis("nom"), tel: lis("tel"), mail: lis("mail"), regions, trajet: lis("trajet"), delai: lis("delai"), exp: lis("exp"), sal: lis("sal") };
    const m = manquants(v);
    if (m.length) {
      setErreur(`À compléter : ${m.join(", ")}.`);
      return;
    }
    const [prenom, ...reste] = v.nom.split(/\s+/);
    enCours.current = true;
    setEnvoi(true);
    setErreur("");
    try {
      const r = await fetch("/api/candidature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom,
          nom: reste.join(" "),
          courriel: v.mail,
          telephone: v.tel,
          poste: lis("metier"),
          mobilite: regions.join(", "),
          trajet: v.trajet,
          disponibilite: v.delai,
          experience: `${v.exp} ${Number(v.exp) > 1 ? "années" : "année"}`,
          pretentions: `${v.sal} € brut / an`,
          origine: `${window.location.pathname} (espace Techniciens)`,
          /* Le fichier ne part pas (la route ne prend que du JSON), son NOM
             part : le recruteur sait qu'un CV existe et peut le réclamer. */
          cv: cv ? `${cv} (non transmis, à réclamer au candidat)` : "",
          [CHAMP_PIEGE]: lis(CHAMP_PIEGE),
        }),
      });
      if (!r.ok) {
        setErreur((await messageDe(r)) ?? SECOURS);
        return;
      }
      onEnvoye();
    } catch {
      setErreur(SECOURS);
    } finally {
      enCours.current = false;
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={envoie} noValidate style={{ display: "grid", gap: 16 }}>
      <h3 style={{ font: "600 23px/1.2 var(--ft)", letterSpacing: "-.035em", margin: 0 }}>Votre candidature</h3>
      <div className={c.form2} style={DEUX}>
        <Champ etiquette="Prénom et nom *">
          {/* Retour après « Envoyer une autre candidature » : le focus revient
              au premier champ au lieu de tomber sur le corps de la page. */}
          <input name="nom" autoComplete="name" aria-required="true" autoFocus={retour} className={c.saisie} style={SAISIE} />
        </Champ>
        <Champ etiquette="Téléphone *">
          <input type="tel" name="tel" autoComplete="tel" aria-required="true" className={c.saisie} style={SAISIE} />
        </Champ>
        <Champ etiquette="E-mail *">
          <input type="email" name="mail" autoComplete="email" aria-required="true" className={c.saisie} style={SAISIE} />
        </Champ>
        <Champ etiquette="Métier visé">
          <Liste nom="metier" vide="Choisir…" options={METIERS} />
        </Champ>
      </div>
      <label
        className={c.depot}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          borderRadius: 16,
          border: "1.5px dashed var(--line)",
          background: "var(--card)",
          cursor: "pointer",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            flex: "none",
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--accw)",
            color: "var(--acci)",
            display: "grid",
            placeItems: "center",
            font: "600 12px var(--fb)",
          }}
        >
          CV
        </span>
        <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
          <span style={{ font: "600 14px var(--fb)", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {cv || "Ajouter mon CV"}
          </span>
          <span style={{ font: "400 12.5px var(--fb)", color: "var(--ink3)" }}>PDF ou Word</span>
        </span>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className={c.masque}
          onChange={(e) => setCv(e.target.files?.[0]?.name ?? "")}
        />
      </label>
      <div role="group" aria-labelledby="cand-mobilite" style={{ display: "grid", gap: 8 }}>
        <span id="cand-mobilite" style={ETIQUETTE}>
          Quelle est votre mobilité géographique&nbsp;? *
        </span>
        <span style={{ font: "400 13px/1.55 var(--fb)", color: "var(--ink2)" }}>
          Choisissez «&nbsp;France entière&nbsp;» uniquement si vous êtes prêt à déménager, c’est-à-dire à quitter votre
          région actuelle pour vous installer ailleurs en France. Sinon, sélectionnez la ou les régions dans lesquelles
          vous pouvez travailler sans déménager.
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {REGIONS.map((r) => {
            const on = regions.includes(r);
            return (
              <button
                key={r}
                type="button"
                aria-pressed={on}
                onClick={() => choisit(r)}
                style={{
                  padding: "8px 13px",
                  borderRadius: 999,
                  font: "500 13px var(--fb)",
                  cursor: "pointer",
                  transition: "background-color .2s,color .2s,border-color .2s",
                  border: `1px solid ${on ? "var(--knob)" : "var(--line)"}`,
                  backgroundColor: on ? "var(--knob)" : "var(--card)",
                  color: on ? "var(--knobfg)" : "var(--ink1)",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
      <div className={`${c.form2} ${c.basDeux}`} style={DEUX}>
        <Champ etiquette="Temps de trajet maximal *">
          <Liste nom="trajet" vide="Entre domicile et site" options={TRAJETS} requis />
        </Champ>
        <Champ etiquette="Délai pour démarrer *">
          <Liste nom="delai" vide="Choisir…" options={DELAIS} requis />
        </Champ>
        <Champ etiquette="Années d’expérience *">
          <AvecUnite nom="exp" unite="années" indice="Ex. 2" />
        </Champ>
        <Champ etiquette="Prétentions salariales *">
          <AvecUnite nom="sal" unite="€ brut / an" pas={500} />
        </Champ>
      </div>
      {/* Champ piège : invisible pour une personne, rempli par un automate. */}
      <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 0, height: 0, overflow: "hidden" }}>
        <input name={CHAMP_PIEGE} type="text" defaultValue="" tabIndex={-1} autoComplete="off" />
      </div>
      {/* La zone d'annonce est toujours présente : un lecteur d'écran
          n'annonce pas une zone qui vient d'apparaître. Vide, elle ne prend
          aucune place, d'où l'enveloppe sans écart. */}
      <div style={{ display: "grid" }}>
        <div aria-live="assertive" style={{ marginBottom: erreur ? 16 : 0 }}>
          {erreur ? (
            <div style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(194,65,12,.1)", color: "#c2410c", font: "500 13.5px/1.45 var(--fb)" }}>
              {erreur}
            </div>
          ) : null}
        </div>
        <button
          type="submit"
          /* `aria-disabled` et non `disabled` : un bouton désactivé perd le
             focus, qui tombait sur le corps de la page pendant l'envoi et y
             restait après une erreur. Le double envoi est bloqué par `envoi`. */
          aria-disabled={envoi}
          aria-busy={envoi}
          className={c.envoyer}
          style={{
            height: 56,
            border: "none",
            borderRadius: 999,
            background: "#ff7c3c",
            color: "#fff",
            font: "600 15px var(--fb)",
            cursor: envoi ? "progress" : "pointer",
            opacity: envoi ? 0.7 : 1,
            boxShadow: "0 14px 30px -14px rgba(255,124,60,.9)",
          }}
        >
          Envoyer ma candidature →
        </button>
      </div>
      {/* Information au point de collecte (RGPD, articles 13 et 14). */}
      <p style={{ margin: 0, font: "400 12px/1.5 var(--fb)", color: "var(--ink2)" }}>
        Données traitées par Migen pour étudier votre candidature, enregistrées dans Teamtailor. Droits et durées de conservation&nbsp;:{" "}
        <Link href="/confidentialite/" style={{ textDecoration: "underline" }}>
          politique de confidentialité
        </Link>
      </p>
    </form>
  );
}

function Envoyee({ onAutre }: { onAutre: () => void }) {
  /* Le formulaire disparaît avec le bouton qui avait le focus : on le pose sur
     le titre, ce qui le fait aussi lire (une zone `status` qui vient d'être
     montée n'est pas annoncée de façon sûre). */
  const titre = useRef<HTMLDivElement>(null);
  useEffect(() => titre.current?.focus(), []);
  return (
    <div
      role="status"
      className={s.in}
      style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 14, minHeight: 460 }}
    >
      <span aria-hidden="true" style={{ width: 60, height: 60, borderRadius: 999, background: "#ff7c3c", display: "grid", placeItems: "center" }}>
        <span style={{ width: 10, height: 20, borderRight: "3px solid #fff", borderBottom: "3px solid #fff", transform: "translateY(-2px) rotate(45deg)" }} />
      </span>
      <div ref={titre} tabIndex={-1} style={{ font: "600 28px/1.1 var(--ft)", letterSpacing: "-.04em", outline: "none" }}>
        Candidature envoyée.
      </div>
      <p style={{ font: "400 15.5px/1.6 var(--fb)", color: "var(--ink1)", margin: 0, maxWidth: "42ch" }}>
        Elle est arrivée chez notre équipe recrutement. La première étape du process, c’est un échange sur votre parcours.
      </p>
      <button
        type="button"
        onClick={onAutre}
        style={{ border: "none", background: "none", padding: 0, font: "600 14px var(--fb)", color: "#ff7c3c", cursor: "pointer" }}
      >
        Envoyer une autre candidature
      </button>
    </div>
  );
}

export default function CandidatureTechniciens() {
  const [envoyee, setEnvoyee] = useState(false);
  const [retour, setRetour] = useState(false);
  return (
    <section id="postuler" style={{ position: "relative", padding: "120px 0 0", scrollMarginTop: 96 }}>
      <div
        className={s.deuxCol}
        style={{ display: "grid", gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.15fr)", gap: 14, alignItems: "stretch" }}
      >
        <div style={PANNEAU_SOMBRE}>
          <div aria-hidden="true" style={HALO_HAUT_GAUCHE} />
          <div style={{ position: "relative" }}>
            <div style={SURTITRE_ORANGE}>Postuler chez migen</div>
            <h2 style={{ font: "600 clamp(28px,3vw,42px)/1.06 var(--ft)", letterSpacing: "-.05em", margin: "0 0 16px", textWrap: "balance" }}>
              Rejoignez les 120 collaborateurs de migen.
            </h2>
            <p style={{ font: "400 15.5px/1.65 var(--fb)", color: "rgba(255,255,255,.74)", margin: 0, maxWidth: "42ch" }}>
              Votre candidature arrive directement à notre équipe recrutement, depuis ce formulaire.
            </p>
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 14,
              borderRadius: 22,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <Image
              src="/assets/ressources/pierre-beck.webp"
              alt="Pierre Beck"
              width={56}
              height={56}
              style={{ width: 56, height: 56, borderRadius: 999, objectFit: "cover", flex: "none", background: "#ff7c3c" }}
            />
            <div>
              <div style={{ font: "600 15.5px var(--ft)", letterSpacing: "-.02em" }}>Pierre Beck</div>
              <div style={{ font: "400 13px var(--fb)", color: "rgba(255,255,255,.6)", marginTop: 2 }}>Responsable recrutement</div>
            </div>
          </div>
          <div style={{ position: "relative", display: "grid", gap: 12 }}>
            <Coche texte="Un process mené par des gens du métier" />
            <Coche texte="Vous choisissez votre zone de mobilité" />
          </div>
          <div style={{ position: "relative", marginTop: "auto", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.1)" }}>
            <div
              style={{
                font: "600 11px var(--fb)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.5)",
                marginBottom: 10,
              }}
            >
              Nos agences
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {AGENCES.map((a) => (
                <span key={a} style={{ padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,.08)", font: "500 13px var(--fb)" }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div
          className={c.carte}
          style={{
            borderRadius: 32,
            background: "var(--glass)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid var(--gbd)",
            boxShadow: "var(--shadow)",
            padding: 40,
            minWidth: 0,
          }}
        >
          {envoyee ? (
            <Envoyee
              onAutre={() => {
                setRetour(true);
                setEnvoyee(false);
              }}
            />
          ) : (
            <Formulaire retour={retour} onEnvoye={() => setEnvoyee(true)} />
          )}
        </div>
      </div>
    </section>
  );
}
