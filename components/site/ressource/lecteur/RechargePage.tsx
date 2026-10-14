"use client";

import { useEffect } from "react";

/** Repli du lecteur : l'adresse n'est pas une page ressource, on charge la vraie page. */
export default function RechargePage() {
  useEffect(() => {
    window.location.reload();
  }, []);
  return null;
}
