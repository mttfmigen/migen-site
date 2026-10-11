import type { NextRequest } from "next/server";

import { CHAMP_PIEGE } from "@/components/formulaire/validation";
import { empreinteIp, tropDeDepots } from "@/components/formulaire/debit";
import { deposeCandidature, teamtailorConfigure } from "@/lib/teamtailor";

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
  const typeContenu = requete.headers.get("content-type") ?? "";
  if (!typeContenu.toLowerCase().includes("application/json")) {
    return reponse(415, "Format de requête non accepté.");
  }
  const annonceTaille = Number(requete.headers.get("content-length") ?? "0");
  if (Number.isFinite(annonceTaille) && annonceTaille > CHARGE_MAX_OCTETS) {
    return reponse(413, "Candidature trop volumineuse.");
  }

  const brut: unknown = await requete.json().catch(() => null);
  if (brut === null) return reponse(400, "Requête illisible.");
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

  const resultat = await deposeCandidature({
    prenom: prenom!,
    nom: nom!,
    courriel: courriel!,
    telephone: texte(source.telephone, 40),
    ville: texte(source.ville, 80),
    message: texte(source.message, 2000),
    origine: texte(source.origine, 200),
    metier: texte(source.metier, 120),
  });

  if (!resultat.depose) {
    console.error("[candidature] dépôt refusé :", resultat.raison, resultat.detail);
    return reponse(resultat.raison === "non-configure" ? 503 : 502, ECHEC_DEPOT);
  }

  return reponse(200, CONFIRMATION);
}
