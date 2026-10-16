"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { estLandingPage } from "@/lib/lp/adresses";

/**
 * L'en-tête et la barre basse du site, absents des landing pages (/lp/).
 *
 * Les LP ont leur propre barre (`components/lp/BarreLP.tsx`) et ne doivent
 * pas montrer la navigation du site : un visiteur venu d'une annonce ne doit
 * avoir devant lui que l'offre et le formulaire. La mise en page racine est
 * commune, et un composant serveur ne connaît pas le chemin courant : d'où
 * cette enveloppe client, qui ne rend rien sous /lp/.
 *
 * Elle n'enveloppe QUE des composants clients : leur rendu n'existe que dans
 * le navigateur, et rien d'eux ne part dans la page d'une LP. Le pied du site,
 * composant serveur, passe par l'emplacement `app/@pied` pour la même raison :
 * enveloppé ici, son contenu entier serait sérialisé dans chaque LP sans être
 * affiché.
 */
export default function HorsLandingPage({ children }: { children: ReactNode }) {
  return estLandingPage(usePathname() ?? "/") ? null : children;
}
