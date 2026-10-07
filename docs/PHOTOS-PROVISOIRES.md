# Photos provisoires, à remplacer

Quatre photos de la maquette manquent au dépôt. Elles vivent dans le projet
Claude Design (`assets/web/`), mais l'outil ne sait pas rapatrier un binaire,
et le déploiement Vercel de la maquette ne sert aucun asset (404 sur tous les
chemins testés le 07/10).

Mehdi a tranché le 07/10 : « n'importe quelle image, je les changerai ».
Une photo du dépôt est donc posée sous chaque nom manquant, choisie par SUJET
et pas au hasard. Le site se rend complet, et remplacer une photo revient à
déposer le vrai fichier par-dessus, sans toucher au code.

| nom attendu | photo posée en attendant | pourquoi celle-là |
|---|---|---|
| `sv-duo-impact.jpg` | `team-grind-impact.jpg` | deux techniciens à l'impact, même scène que le nom l'indique |
| `x-elec-portrait.jpg` | `team-electric.jpg` | portrait d'électricien |
| `x-faisceaux.jpg` | `x-elec-disjoncteur.jpg` | câblage électrique, sujet le plus proche |
| `x-tech-portrait.jpg` | `ph-technicien.jpg` | portrait de technicien |

## Pour les remplacer

Déposer les vrais fichiers depuis le projet Claude Design dans
`public/assets/web/`, sous le nom de la première colonne. Rien d'autre à faire.

## Les neuf autres photos manquantes

Neuf autres photos de la maquette manquent aussi, mais AUCUNE page d'offre ne
les utilise : `x-auto-caisse`, `x-cablerie`, `x-caoutchouc-atelier`,
`x-elec-cablage`, `x-logistique-cariste`, `x-logistique-convoyeurs`,
`x-mecanique-portrait`, `x-robotique`, `x-textile-filature`. Elles servent aux
gabarits Expertise et Carrière, qui ne sont pas encore portés.
