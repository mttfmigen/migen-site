import "server-only";

import { randomUUID } from "node:crypto";

import { ecritureServeur } from "@/lib/supabase";

/**
 * LE CV D'UN CANDIDAT, LE TEMPS QUE TEAMTAILOR LE RÉCUPÈRE (14/10, Mehdi :
 * « j'ai pas le CV joint »).
 *
 * L'API TeamTailor ne prend pas de fichier : elle prend un LIEN vers le
 * fichier et le télécharge elle-même. Le CV est donc déposé dans un espace
 * PRIVÉ de la base du site (seau `cv-candidatures`, migration 0006), un lien
 * signé de courte durée est remis à TeamTailor, et la copie du site est
 * supprimée dès que TeamTailor l'a (voir `app/api/candidature/route.ts`).
 * Le seau n'est lisible par personne d'autre que le serveur.
 */
export const SEAU_CV = "cv-candidatures";

/** Limite d'un CV : la fonction Vercel refuse un corps de plus de 4,5 Mo. */
export const CV_MAX_OCTETS = 4 * 1024 * 1024;

/** Lien signé : assez long pour que TeamTailor télécharge, court pour le reste. */
const VALIDITE_LIEN_S = 60 * 60;

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** L'extension acceptée du fichier, ou null s'il n'est ni PDF ni Word. */
export function extensionCv(nom: string): string | null {
  const ext = nom.toLowerCase().split(".").pop() ?? "";
  return ext in TYPES ? ext : null;
}

export async function deposeCv(
  fichier: File,
): Promise<{ chemin: string; url: string } | null> {
  const ext = extensionCv(fichier.name);
  if (!ext) return null;
  const chemin = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;
  const seau = ecritureServeur().storage.from(SEAU_CV);
  const envoi = await seau.upload(chemin, fichier, { contentType: TYPES[ext], upsert: false });
  if (envoi.error) {
    console.error("[cv] dépôt refusé par le stockage :", envoi.error.message);
    return null;
  }
  const lien = await seau.createSignedUrl(chemin, VALIDITE_LIEN_S);
  if (lien.error || !lien.data?.signedUrl) {
    console.error("[cv] lien signé impossible :", lien.error?.message);
    await seau.remove([chemin]);
    return null;
  }
  return { chemin, url: lien.data.signedUrl };
}

export async function supprimeCv(chemin: string): Promise<void> {
  const { error } = await ecritureServeur().storage.from(SEAU_CV).remove([chemin]);
  if (error) console.error("[cv] suppression impossible :", chemin, error.message);
}
