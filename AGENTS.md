Lire `CLAUDE.md` à la racine : c'est le contrat de ce projet. Il prime sur les
conventions par défaut de Next.js et sur toute habitude de framework.

## Vérifier une page de gabarit : redémarrer le serveur, ou le laisser relire

Le contenu des 178 pages portées sur les gabarits de la maquette est lu sur le
DISQUE, dans `supabase/import/gabarits-maquette/` (voir le commentaire de
`lib/contenu.ts`). Ce cache était lu UNE FOIS PAR PROCESSUS, et c'est un piège
qui a déjà fait conclure à tort : un serveur de développement lancé deux jours
plus tôt servait une version antérieure aux fichiers JSON réécrits entre-temps,
et une page qui rendait très bien ses quatre sections a été mesurée « sections
absentes ».

Depuis le 05/10, `contenus()` relit les fichiers à chaque appel quand
`NODE_ENV` n'est pas `production` : le piège a disparu au lieu d'être documenté.
Mais la règle reste vraie pour toute mesure faite sur un BUILD : une page de
gabarit ne se vérifie que sur un rendu postérieur à la dernière écriture dans
`supabase/import/gabarits-maquette/`. Les portes de `GATES.md` qui lisent le
site servi (G11, G16, G17) s'appuient dessus.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
