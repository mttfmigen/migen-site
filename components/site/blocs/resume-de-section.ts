/**
 * LE RÉSUMÉ D'UNE SECTION REPLIÉE, dans un module que le serveur ET le
 * navigateur peuvent lire.
 *
 * POURQUOI CE FICHIER EXISTE, et c'est un défaut de build payé le 14/10.
 * Cette fonction vivait dans `SectionPliableMobile.tsx`, qui porte
 * `"use client"`. Quatre composants de `blocs/` sont rendus SUR LE SERVEUR et
 * l'appelaient pendant leur rendu : `ChiffresCles`, `Deroule`, `Objections`,
 * `Garanties`. Next refuse, et il a raison :
 *
 *   « Attempted to call resumeDe() from the server but resumeDe is on the
 *     client. It's not possible to invoke a client function from the server. »
 *
 * Le build entier tombait sur `/implantations/toulouse/bordeaux`. Et le piège
 * est qu'il ne tombait QUE là : `bunx tsc --noEmit` passait, parce que la
 * frontière serveur / client n'est pas une question de types. Un agent qui
 * s'arrête au typage croit donc avoir fini.
 *
 * Un module sans directive est lisible des deux côtés. C'est le bon endroit
 * pour une fonction qui ne fait que coudre des chaînes : elle n'a ni état, ni
 * effet, ni accès au navigateur.
 *
 * CE QU'ELLE FAIT, inchangé. La maquette mobile résume une section repliée par
 * ses propres intitulés joints par « · », jamais par une phrase écrite à la
 * main : une phrase écrite serait une donnée inventée, et l'une l'a été
 * (mesure du 11/10, « N engagements, écrits avant la signature. » absente des
 * 244 captures et présente 140 fois sur le site).
 *
 * ELLE NE LAISSE PAS TOMBER UN ÉLÉMENT SANS INTITULÉ. Le motif d'origine
 * écrivait `.map((p) => p.accroche).filter(Boolean)` : une puce sans accroche
 * disparaissait du résumé en silence, et le résumé annonçait alors moins
 * d'éléments que le bloc n'en contient. Les appelants passent donc un repli
 * (`puce.accroche ?? puce.texte`), et c'est ici que les vides sont écartés.
 */
export function resumeDe(
  morceaux: readonly (string | undefined)[],
): string | undefined {
  const propres = morceaux.map((m) => (m ?? "").trim()).filter(Boolean);
  return propres.length > 0 ? propres.join(" · ") : undefined;
}
