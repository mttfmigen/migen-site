# Portes : porter les gabarits 02 Étude de cas et 07 Métier-carrière

Chaque porte prouve son résultat par une commande, pas par une affirmation.
Règles héritées du dépôt : maquette au mot pour mot, zéro donnée inventée,
jamais de prix ni de tiret cadratin, trous déclarés avec leur raison.

- [ ] G1 Les captures des 54 pages (41 + 13) sont fraîches contre l'export du 07/10
  CHECK: node -e "const m=require('./maquette/rendu/_mesure.json');const n=m.resultats.filter(r=>/02 |07 /.test(r.gabarit||'')).length;console.log(n>=54?'OK '+n:'KO '+n);process.exit(n>=54?0:1)"
  EXPECT: OK

- [ ] G2 Chaque page a son fichier de données relais, nommé par sa route
  CHECK: node -e "const fs=require('fs');const idx=JSON.parse(fs.readFileSync('maquette/contenu/site/index.json'));const c=idx.filter(p=>/^0[27] /.test(p.gabarit||''));const manq=c.filter(p=>!fs.existsSync('supabase/import/gabarits-maquette/'+(p.url.replace(/^\/|\/$/g,'').replace(/\//g,'-'))+'.json'));console.log(manq.length?'KO '+manq.map(x=>x.url).join(' '):'OK');process.exit(manq.length?1:0)"
  EXPECT: OK

- [ ] G3 Le texte servi est conforme mot pour mot, zéro anomalie G17 sur les 54 pages
  CHECK: sh scripts/porte-texte-gabarits.sh 02 07
  EXPECT: 0 anomalie

- [ ] G4 Aucun interdit du contrat dans le rendu des 54 pages
  CHECK: node scripts/verifie-interdits.mjs
  EXPECT: conforme

- [ ] G5 La chaîne complète passe, build de production compris
  CHECK: bun run verifie
  EXPECT: Compiled successfully

- [ ] G6 Les 54 pages sont servies en 200 et présentes au plan du site
  CHECK: sh scripts/porte-servies.sh 02 07
  EXPECT: 54 / 54
