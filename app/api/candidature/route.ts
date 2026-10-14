import { after, type NextRequest } from "next/server";

import { CHAMP_PIEGE } from "@/components/formulaire/validation";
import { empreinteIp, tropDeDepots } from "@/components/formulaire/debit";
import { CV_MAX_OCTETS, deposeCv, extensionCv, supprimeCv } from "@/lib/cv-stockage";
import { deposeCandidature, teamtailorAUnCv, teamtailorConfigure } from "@/lib/teamtailor";

/**
 * Dépôt d'une candidature dans TeamTailor.
 *
 * POURQUOI CETTE ROUTE EXISTE. Sur les quatorze pages carrière, le formulaire
 * portait `method="post"` sans action ni gestionnaire : le candidat
 * remplissait tout, cliquait, et la page se rechargeait vide. Rien n'arrivait
 * nulle part et personne ne le savait.
 *
 * POURQUOI PAS /api/lead. Cette route-là dépose chez HubSpot, qui est le
 * registre des PROSPECTS. Une candidature n'y a rien à faire : elle va dans
 * l'ATS, décision de Mehdi du 11/10.
 *
 * LE MODE DÉGRADÉ EST VOLONTAIRE ET IL EST LE POINT IMPORTANT. Tant que
 * `TEAMTAILOR_API_KEY` et `TEAMTAILOR_JOB_ID` manquent, la route répond 503 et
 * dit franchement que l'envoi n'a pas abouti, avec l'adresse de secours. Elle
 * ne répond JAMAIS « c'est envoyé » sans l'avoir été : c'est exactement le
 * défaut qu'elle corrige.
 *
 * Mêmes filtres que /api/lead, dans le même ordre du moins cher au plus cher :
 * en-têtes, taille, débit, puis lecture du corps.
 */

const CHARGE_MAX_OCTETS = 16_000;

const CONFIRMATION = "Votre candidature est bien arrivée. Nous revenons vers vous.";

const NON_BRANCHE =
  "Nous ne pouvons pas enregistrer votre candidature pour le moment. " +
  "Écrivez-nous à recrutement@migen.fr, nous la traiterons de la même façon.";

const ECHEC_DEPOT =
  "Nous n'avons pas pu enregistrer votre candidature. Réessayez dans un instant, " +
  "ou écrivez-nous à recrutement@migen.fr.";

const TROP_DE_DEPOTS =
  "Votre candidature nous est déjà parvenue. Laissez-nous un instant pour la traiter.";

function reponse(statut: number, message: string, champs?: Record<string, string>): Response {
  return Response.json({ message, ...(champs ? { champs } : {}) }, { status: statut });
}

/** Une chaîne bornée, ou undefined. Rien n'entre sans longueur maximale. */
function texte(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

export async function POST(requete: NextRequest): Promise<Response> {
  if (requete.headers.get("sec-fetch-site") === "cross-site") {
    return reponse(403, "Requête refusée.");
  }
  const typeContenu = (requete.headers.get("content-type") ?? "").toLowerCase();
  /* DEUX FORMATS (14/10) : du JSON comme avant, ou un formulaire en
     plusieurs parties quand le candidat joint son CV (« donnees » en JSON,
     « cv » le fichier). Le plafond suit : 16 ko sans fichier, 4,5 Mo avec. */
  const avecFichier = typeContenu.includes("multipart/form-data");
  if (!avecFichier && !typeContenu.includes("application/json")) {
    return reponse(415, "Format de requête non accepté.");
  }
  const annonceTaille = Number(requete.headers.get("content-length") ?? "0");
  const plafond = avecFichier ? CV_MAX_OCTETS + 300_000 : CHARGE_MAX_OCTETS;
  if (Number.isFinite(annonceTaille) && annonceTaille > plafond) {
    return reponse(413, "Votre CV dépasse 4 Mo. Envoyez une version plus légère, ou écrivez-nous à recrutement@migen.fr.");
  }

  let brut: unknown = null;
  let fichier: File | null = null;
  if (avecFichier) {
    const formulaire = await requete.formData().catch(() => null);
    if (!formulaire) return reponse(400, "Requête illisible.");
    const donnees = formulaire.get("donnees");
    try {
      brut = typeof donnees === "string" ? JSON.parse(donnees) : null;
    } catch {
      brut = null;
    }
    const f = formulaire.get("cv");
    if (f instanceof File && f.size > 0) fichier = f;
  } else {
    brut = await requete.json().catch(() => null);
  }
  if (brut === null || typeof brut !== "object") return reponse(400, "Requête illisible.");
  const source = brut as Record<string, unknown>;

  /* Champ piège : rempli, la candidature est jetée et la réponse reste un
     succès. Annoncer la détection apprendrait au robot à l'éviter. */
  if (typeof source[CHAMP_PIEGE] === "string" && source[CHAMP_PIEGE].trim()) {
    return reponse(200, CONFIRMATION);
  }

  const prenom = texte(source.prenom, 80);
  const nom = texte(source.nom, 80);
  const courriel = texte(source.courriel, 160);

  const champs: Record<string, string> = {};
  if (!prenom) champs.prenom = "Votre prénom nous manque.";
  if (!nom) champs.nom = "Votre nom nous manque.";
  if (!courriel) champs.courriel = "Votre adresse électronique nous manque.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(courriel)) {
    champs.courriel = "Cette adresse ne semble pas valide.";
  }
  if (fichier) {
    if (fichier.size > CV_MAX_OCTETS) champs.cv = "Votre CV dépasse 4 Mo.";
    else if (!extensionCv(fichier.name)) champs.cv = "Le CV doit être un PDF ou un document Word.";
  }
  if (Object.keys(champs).length > 0) {
    return reponse(422, "Quelques champs demandent une correction.", champs);
  }

  /* LE DÉBIT EST CONSOMMÉ APRÈS LA VALIDATION, et c'est un défaut corrigé au
     passage : sur /api/lead, une saisie REFUSÉE consommait quand même un des
     cinq dépôts de la fenêtre. Un candidat qui se trompe trois fois de
     courriel se retrouvait bloqué sans l'avoir mérité. */
  if (tropDeDepots(empreinteIp(requete.headers), Date.now())) {
    return reponse(429, TROP_DE_DEPOTS);
  }

  if (!teamtailorConfigure()) {
    return reponse(503, NON_BRANCHE);
  }

  /* LES DOUZE CHAMPS DU FORMULAIRE, et ils partent tous. Mehdi : « toutes les
     infos du formulaire en commentaire ». Une première version n'en
     transmettait que quatre et jetait le poste visé, la mobilité, le trajet,
     la disponibilité, l'expérience et les prétentions, c'est-à-dire
     précisément ce qui sert à qualifier un candidat. */
  /* LE CV, DÉPOSÉ DANS LE STOCKAGE PRIVÉ PUIS REMIS À TEAMTAILOR PAR UN LIEN
     SIGNÉ. Si le dépôt échoue, la candidature part quand même, sans CV, et
     le commentaire le dit : rien n'est perdu en silence. */
  const cvDepose = fichier ? await deposeCv(fichier).catch(() => null) : null;
  const nomCv = fichier?.name.slice(0, 160);
  const mentionCv = cvDepose
    ? `${nomCv} (joint au profil)`
    : nomCv
      ? `${nomCv} (non transmis, à réclamer au candidat)`
      : texte(source.cv, 200);

  const resultat = await deposeCandidature({
    prenom: prenom!,
    nom: nom!,
    courriel: courriel!,
    telephone: texte(source.telephone, 40),
    poste: texte(source.poste, 120),
    mobilite: texte(source.mobilite, 400),
    trajet: texte(source.trajet, 60),
    disponibilite: texte(source.disponibilite, 60),
    experience: texte(source.experience, 40),
    pretentions: texte(source.pretentions, 60),
    message: texte(source.message, 2000),
    origine: texte(source.origine, 200),
    metier: texte(source.metier, 120),
    cv: mentionCv,
    cvUrl: cvDepose?.url,
  });

  if (!resultat.depose) {
    console.error("[candidature] dépôt refusé :", resultat.raison, resultat.detail);
    if (cvDepose) after(() => supprimeCv(cvDepose.chemin));
    return reponse(resultat.raison === "non-configure" ? 503 : 502, ECHEC_DEPOT);
  }

  /* LA COPIE DU SITE NE SERT PLUS DÈS QUE TEAMTAILOR A LE CV : on vérifie,
     après la réponse au candidat, puis on la supprime. Si TeamTailor ne l'a
     pas encore pris au bout de 8 s, la copie est gardée et le journal le dit
     (le lien signé, lui, expire au bout d'une heure). */
  if (cvDepose) {
    const candidatId = resultat.candidatId;
    after(async () => {
      for (let essai = 0; essai < 4; essai++) {
        await new Promise((fin) => setTimeout(fin, 2000));
        if (await teamtailorAUnCv(candidatId).catch(() => false)) {
          await supprimeCv(cvDepose.chemin);
          return;
        }
      }
      console.error(`[cv] TeamTailor n'a pas encore le CV du profil ${candidatId}, copie gardée : ${cvDepose.chemin}`);
    });
  }

  return reponse(200, CONFIRMATION);
}
