# La maquette, en local

`accueil-rendu.html` est la maquette Claude Design validée par le client, rendue :
10 194 lignes, 8 063 attributs `style` en ligne, 209 sections (tout le site tient
dans un seul document, les pages étant commutées par des conditions `sc-if`).

Mehdi l'a fournie le 02/10 sous forme de page autonome de 24 Mo
(`Migen Site Final Autonome (1).html`), où ce HTML vit dans une chaîne JSON à
côté de 22,5 Mo d'images en base64. Extraction :

```bash
python3 - <<'PY'
import json, pathlib
t = pathlib.Path("Migen Site Final Autonome (1).html").read_text(errors="replace")
brut = t.split("\n")[381].strip()
pathlib.Path("accueil-rendu.html").write_text(json.loads(brut[:brut.rfind('"') + 1]))
PY
```

## Pourquoi ce fichier est versionné

C'est la source de vérité du portage, et les contrôles la lisent. Avant, chaque
valeur attendue était une note de lecture prise à travers le MCP, 50 lignes à la
fois : une note peut se tromper, et personne ne pouvait la rejouer.
`scripts/verifie-formulaire.tsx` compare maintenant le rendu du composant à CE
fichier, champ par champ. 1,5 Mo versionné pour un contrôle rejouable.

La page autonome de 24 Mo, elle, n'est pas versionnée : elle ne sert qu'à ouvrir
la maquette dans un navigateur, images comprises, pour mesurer des valeurs
calculées.

```bash
cd ~/Landing\ lovable/maquette && python3 -m http.server 4350 --bind 127.0.0.1
# puis http://127.0.0.1:4350/accueil-autonome.html
```

## Le dialecte

`style-hover` (588), `sc-if value="{{ x }}"` (1 760), `sc-camel-on-click`,
`sc-raw-select`, `data-reveal` (159), `data-bar` (23), `{{ }}`.
La traduction retenue est consignée dans `docs/CONTRAT-PORTAGE-MAQUETTE.md`.

## `mobile-v3/` : la vue « Site mobile » de la maquette V3 (16/10)

`Migen - Mobile V3.dc.html` est le composant mobile (9d8a3bdb) extrait tel quel
de la page autonome V3 de Mehdi du 16/10. Il est versionné pour la même raison
que `accueil-rendu.html` : des contrôles le relisent. La porte
`components/site/mobile/verification-conversion-mobile.tsx` y exige mot pour mot
les libellés de la barre collante et du photo + CTA (« Rappel dans l’heure,
jours ouvrés », « Candidature en ligne », le nom du rond téléphone), et la règle
des accroches de cartes fermées (`teaseOf`) y est relevée pour
`components/site/blocs/resume-de-section.ts`.

Sa copie N'EST PAS une référence de texte : elle porte des mots et des chiffres
retirés du site (« candidats », délais chiffrés, « 5 agences », tirets
cadratins). Seuls la mise en page et les libellés cités ci-dessus en sont repris.
