#!/usr/bin/env node
/**
 * REND AUX FICHES LES PHRASES D'ARGENT QUE LA CAPTURE ÉCRIT ET QUE NOUS AVONS
 * PERDUES, en prenant les octets de la capture et non en les retapant.
 *
 * SA SOURCE DE VÉRITÉ est `maquette/rendu/<clé>.html`, le rendu figé de
 * l'application autonome, c'est-à-dire LA référence de `docs/PASSATION.md` §1.
 * Son complément, `scripts/restitue-trous-de-prix.mjs`, part des champs
 * `trous[]` des fiches : il ne pouvait donc rien faire ici, puisque ces
 * phrases-là ont été perdues SANS laisser de trou déclaré.
 *
 * POURQUOI LA CAPTURE ET PAS LE CORPUS. Le corpus est plus riche que la page :
 * il porte des variantes et des phrases que le gabarit ne pose nulle part.
 * `maquette/contenu/Offres/zero-arret.md` traîne même à la racine sans être
 * cité par aucune des 248 entrées de l'index, avec un texte plus ancien. Seule
 * la capture dit ce que la page AFFICHE.
 *
 * LA RÈGLE APPLIQUÉE, tranchée par Mehdi le 09/10 et écrite en CLAUDE.md §9 :
 * un MONTANT reste interdit, une phrase qui renvoie au devis est autorisée.
 * Aucune des restitutions ci-dessous ne porte de montant. Ce qui reste dehors
 * est nommé, avec son motif, dans `CE QUI N'EST PAS RESTITUÉ`.
 *
 * Usage :
 *   node scripts/restitue-phrases-de-prix.mjs            lecture seule
 *   node scripts/restitue-phrases-de-prix.mjs --applique  écrit
 *   node scripts/restitue-phrases-de-prix.mjs --controle  témoin
 *
 * À suivre de `node scripts/relis-relais.mjs`, puis de la porte :
 *   node scripts/verifie-purge-des-prix.mjs
 *
 * ---------------------------------------------------------------------------
 * LES SIX DERNIÈRES, INSTRUITES UNE PAR UNE LE 13/10
 * ---------------------------------------------------------------------------
 *
 * La porte en annonçait six sur six pages. UNE SEULE était une perte. Les cinq
 * autres sont des artefacts de mesure, et quatre d'entre elles étaient classées
 * ici le matin même avec un motif FAUX. Les voici avec la preuve, parce qu'un
 * motif faux coûte plus cher qu'un motif absent : il clôt l'enquête.
 *
 *   · RESTITUÉE. `/offres/zero-arret/`, réponse « Pourquoi pas un technicien
 *     salarié ? » : la fiche s'arrêtait à « opérationnel dès le premier mois. »
 *     et laissait tomber « , pour moins de la moitié du coût d'un salarié. »
 *     que la capture écrit. Le bloc ne porte AUCUN CHIFFRE, pas un seul, donc
 *     ni montant ni délai chiffré : c'est une comparaison écrite en mots.
 *     `scripts/verifie-interdits.mjs` la relit et l'accepte. Elle est rendue.
 *     Le matin, elle était réservée à l'arbitrage de Mehdi : elle lui est
 *     SIGNALÉE et non cachée, mais le contrat §9 ne la refuse pas, et c'est sa
 *     copie que notre purge avait coupée.
 *
 *   · PAS UNE PERTE. `/offres/full-service/`, « Les pièces consultées au prix du
 *     marché, commandées et posées délai annoncé avant commande. » Le motif du
 *     matin disait la capture abîmée et demandait de la faire corriger. C'EST
 *     FAUX, et c'est l'inverse : la fiche est JUSTE, et plus juste que la
 *     capture. Elle sert `accroche` = « …commandées et posées » et `texte` =
 *     « , délai annoncé avant commande. », exactement comme la ligne 57 du
 *     corpus `maquette/contenu/site/Offres/offres--full-service.md`. C'est le
 *     RENDU de la maquette qui perd la virgule en aplatissant les deux champs.
 *     La porte, elle, lit les octets bruts du JSON, où `", "texte": "` sépare
 *     les deux : la chaîne de la capture ne peut donc jamais s'y trouver.
 *
 *   · PAS UNE PERTE, même cause. `/offres/bureau-etudes/`, « Revue des données
 *     et des outils : qualité des historiques… » : servie mot pour mot par
 *     `offres-audit-conseil-maintenance.json`, section `offre`, 4ᵉ ligne, en
 *     `accroche` + `texte`. La capture l'aplatit avec « : ».
 *
 *   · PAS UNE PERTE. `/guides/choisir-une-entreprise-de-maintenance/`, « Le vrai
 *     risque n'est pas le prix, c'est la personne … ». Le motif du matin disait
 *     « la phrase entière n'est nulle part dans le rendu ». C'EST FAUX : elle
 *     est dans LA MÊME capture, au décalage 9364, en H2 entier, « …c'est la
 *     personne qui se présente », et `guides-choisir-une-entreprise-de-
 *     maintenance.json` la sert verbatim. Ce que la porte a lu, au décalage
 *     3187, est l'entrée du sommaire « Sur cette page », que le générateur de
 *     la maquette tronque et suffixe d'une ellipse. Restituer l'ellipse serait
 *     servir un libellé de navigation comme du texte.
 *
 *   · PAS UNE PERTE. `/ressources/fiches-pratiques/securite-maintenance/`,
 *     « Chez Migen, seuls 10 % des candidats sont retenus… ». Le motif du matin
 *     demandait d'établir l'emplacement : il est établi, et il n'y a rien à
 *     écrire. La puce est servie ENTIÈRE par la fiche, à un mot près, et ce mot
 *     est un ARBITRAGE DÉCLARÉ : `lib/decisions-copie.ts` ligne 25 remplace
 *     « % des candidats » par « % des techniciens », sur la décision de Mehdi
 *     citée ligne 9, « Ne pas parler de candidats ». La porte compare la
 *     capture sans appliquer ces règles.
 *
 *   · PERTE RÉELLE, MAIS SANS EMPLACEMENT SÛR, donc laissée. `/offres/bureau-
 *     etudes/`, « Les pannes s'accumulent. Les pièces d'origine deviennent
 *     introuvables. Et le devis d'une machine neuve est impossible à faire
 *     passer en comité d'investissement. » C'est le paragraphe de corps du
 *     « ## Le problème » de `offres--retrofit.md`, et la capture ne l'écrit que
 *     dans le PLI de `/offres/bureau-etudes/`. Deux raisons de ne pas deviner :
 *       1. le pli ne doit PAS le porter. `types/offre.ts` lignes 192 à 208
 *          déclare l'écart : la maquette redirige `/offres/retrofit/` vers cette
 *          page et y replie sa copie entière ; le site SERT cette URL, et l'y
 *          recopier produirait deux fois la même page. Le pli porte le lien.
 *       2. sa place native n'existe pas encore. `SectionProbleme`
 *          (`types/contenu.ts` ligne 136) n'a que `punchline` et `puces`, et
 *          `components/site/blocs/Probleme.tsx` ne rend que ces deux champs. Le
 *          manque est STRUCTUREL et bien plus large qu'une phrase : mesuré ce
 *          jour, 22 des 29 pages d'offre du corpus écrivent de la prose dans
 *          « Le problème » que le gabarit ne peut pas tenir. Lui ouvrir un
 *          champ relève du type et du composant, pas de ce script.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const APPLIQUE = process.argv.includes('--applique')

const FICHES = 'supabase/import/gabarits-maquette'
const CAPTURES = 'maquette/rendu'

/** Un MONTANT : interdit, toujours. Le garde-fou de ce script. */
const MONTANT = /\d[\d   .,]*\s*(?:€|euros?|k€)|\b\d+\s*%/i

/**
 * Le texte d'un bloc de la capture, retrouvé par un fragment qui lui
 * appartient. Rend les octets de la capture, apostrophes typographiques et
 * espaces insécables compris : on compare normalisé, on copie littéral.
 */
function blocDeLaCapture(cle, fragment) {
  const html = readFileSync(`${CAPTURES}/${cle}.html`, 'utf8')
  const i = html.indexOf(fragment)
  if (i < 0) return null
  const debut = html.lastIndexOf('>', i) + 1
  const fin = html.indexOf('<', i)
  if (debut <= 0 || fin < 0) return null
  return html
    .slice(debut, fin)
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * LES RESTITUTIONS. Chacune nomme sa fiche, l'endroit exact, et le fragment qui
 * identifie son bloc dans la capture. Le texte écrit est celui de la capture :
 * aucune ligne de copie n'est tapée ici.
 */
const RESTITUTIONS = [
  {
    fiche: 'offres-zero-arret.json',
    capture: 'offres--zero-arret',
    quoi: 'le chapô perdait sa deuxième phrase',
    fragment: 'Vous réservez une capacité de maintenance',
    pose: (contenu, bloc) => {
      contenu.chapeau = bloc
    },
    verifie: (contenu) => contenu.chapeau.includes('pour un prix mensuel fixe et sans embauche'),
  },
  {
    fiche: 'offres-zero-arret.json',
    capture: 'offres--zero-arret',
    quoi: "la bande de chiffres avait perdu une carte entière, la 3 sur 4",
    fragment: "D'engagement, pour un prix mensuel fixe",
    pose: (contenu, bloc) => {
      // La capture pose quatre cartes : « Le samedi », « La nuit », « 12 mois »
      // puis « 500 à 2 000 € ». La nôtre sautait la troisième.
      const valeur = blocDeLaCapture('offres--zero-arret', '12 mois')
      contenu.chiffres.splice(2, 0, { valeur, libelle: bloc })
    },
    verifie: (contenu) =>
      contenu.chiffres.length === 4 &&
      contenu.chiffres[2].valeur === '12 mois' &&
      contenu.chiffres[2].libelle.includes('prix mensuel fixe'),
  },
  {
    fiche: 'offres-zero-arret.json',
    capture: 'offres--zero-arret',
    quoi: "la réponse « Combien coûte l'abonnement ? » perdait ses deux premières phrases",
    fragment: 'Un prix mensuel fixe, sur 12 mois',
    pose: (contenu, bloc) => {
      const q = contenu.sections
        .flatMap((s) => s.questions ?? [])
        .find((q) => q.question.includes("Combien coûte l'abonnement"))
      if (!q) throw new Error("question « Combien coûte l'abonnement ? » introuvable")
      q.reponse = bloc
    },
    verifie: (contenu) =>
      contenu.sections
        .flatMap((s) => s.questions ?? [])
        .some((q) => q.reponse.startsWith('Un prix mensuel fixe, sur 12 mois')),
  },
  {
    fiche: 'offres-zero-arret.json',
    capture: 'offres--zero-arret',
    quoi: "la réponse « Pourquoi pas un technicien salarié ? » perdait sa comparaison de coût finale",
    fragment: "Un technicien salarié n'est disponible ni la nuit ni le samedi",
    pose: (contenu, bloc) => {
      const q = contenu.sections
        .flatMap((s) => s.questions ?? [])
        .find((q) => q.question.includes('Pourquoi pas un technicien salarié'))
      if (!q) throw new Error('question « Pourquoi pas un technicien salarié ? » introuvable')
      q.reponse = bloc
    },
    /* Le critère ne retape pas la copie et il ÉVITE L'APOSTROPHE, qui est le
       piège n° 3 de la passation : « salarié. » suffit à distinguer l'état
       voulu de l'état coupé, qui finissait sur « premier mois. ». */
    verifie: (contenu) =>
      contenu.sections
        .flatMap((s) => s.questions ?? [])
        .some(
          (q) =>
            q.question.includes('Pourquoi pas un technicien salarié') &&
            q.reponse.endsWith('salarié.'),
        ),
  },
  {
    fiche: 'offres-chantier-demenagement-machines.json',
    capture: 'offres--chantier--demenagement-machines',
    quoi: 'une réponse de FAQ avait perdu sa phrase du MILIEU',
    fragment: 'Il est chiffré sur devis après',
    pose: (contenu, bloc) => {
      const q = contenu.sections.flatMap((s) => s.questions ?? []).find((q) => q.reponse.startsWith('Le montant dépend du nombre de machines'))
      if (!q) throw new Error('réponse « Le montant dépend du nombre de machines… » introuvable')
      q.reponse = bloc
    },
    verifie: (contenu) =>
      contenu.sections
        .flatMap((s) => s.questions ?? [])
        .some((q) => q.reponse.includes("Il est chiffré sur devis après l'étude préalable")),
  },
  {
    fiche: 'offres-retrofit-remise-en-etat.json',
    capture: 'offres--retrofit--remise-en-etat',
    quoi: "une preuve avait perdu son POINT FINAL, et c'est tout",
    fragment: 'Diagnostic sur site, plusieurs options',
    pose: (contenu, bloc) => {
      const p = contenu.sections.flatMap((s) => s.preuves ?? []).find((p) => p.texte?.startsWith('Diagnostic sur site'))
      if (!p) throw new Error('preuve « Diagnostic sur site… » introuvable')
      p.texte = bloc
    },
    /* Le critère ne retape PAS la copie : la capture porte ici une apostrophe
       DROITE là où d'autres textes en portent une typographique, et une
       comparaison mot pour mot écrite à la main se trompe sur ce seul octet.
       C'est le piège n° 3 de la passation, et il vient de se refermer. */
    verifie: (contenu) =>
      contenu.sections
        .flatMap((s) => s.preuves ?? [])
        .some((p) => p.texte?.startsWith('Diagnostic sur site') && p.texte.endsWith('racheté.')),
  },
  {
    fiche: 'offres-full-service.json',
    capture: 'offres--full-service',
    quoi: "une étape avait perdu sa MAJUSCULE initiale, seule des sept",
    fragment: 'Pour chaque actif, nous arbitrons',
    pose: (contenu, bloc) => {
      const e = contenu.sections.flatMap((s) => s.etapes ?? []).find((e) => e.texte?.toLowerCase().startsWith('pour chaque actif'))
      if (!e) throw new Error('étape « pour chaque actif… » introuvable')
      e.texte = bloc
    },
    verifie: (contenu) =>
      contenu.sections.flatMap((s) => s.etapes ?? []).some((e) => e.texte?.startsWith('Pour chaque actif, nous arbitrons')),
  },
]

/* ------------------------------------------------------------------ témoin */

/**
 * CE SCRIPT REFUSE, ET IL DOIT PROUVER QU'IL SAIT REFUSER.
 *
 * Il porte trois garde-fous : le MONTANT, qui interdit d'écrire un chiffre
 * d'argent ; `blocDeLaCapture`, qui ne rend rien quand le fragment n'est pas
 * dans la capture, donc interdit d'écrire une phrase que le client n'écrit pas ;
 * et `verifie`, qui décrit l'état voulu et sert à la fois de test de pose et
 * d'idempotence. Un garde-fou qu'on ne voit jamais refuser n'est pas un
 * garde-fou. Chaque épreuve POSITIVE est doublée d'un CONTRÔLE NÉGATIF.
 */
if (process.argv.includes('--controle')) {
  const epreuves = []
  const dit = (nom, obtenu, veut) => epreuves.push({ nom, juste: obtenu === veut, obtenu, veut })

  /* 1. Le MONTANT. Positif : la valeur de la carte 04 de la capture de
        zero-arret est « 500 à 2 000 € », et ce script doit la refuser. */
  dit('un montant en euros est refusé', MONTANT.test('500 à 2 000 €'), true)
  dit('un taux chiffré est refusé', MONTANT.test('une remise de 15 %'), true)
  /* NÉGATIF : la phrase rendue aujourd'hui ne porte aucun chiffre. Si ce
     contrôle passait au rouge, c'est que le motif s'est mis à tout refuser. */
  dit(
    "NÉGATIF, « moins de la moitié du coût d'un salarié » n'est pas un montant",
    MONTANT.test("pour moins de la moitié du coût d'un salarié."),
    false,
  )
  dit(
    'NÉGATIF, une phrase qui renvoie au devis est autorisée',
    MONTANT.test("Il est chiffré sur devis après l'étude préalable."),
    false,
  )

  /* 2. `blocDeLaCapture`. Positif : il rend le bloc entier de la capture. */
  const bloc = blocDeLaCapture('offres--zero-arret', "Un technicien salarié n'est disponible")
  dit('le bloc de la capture est lu entier', bloc?.endsWith('salarié.') === true, true)
  /* NÉGATIF : un fragment absent ne rend RIEN, jamais un bloc voisin. C'est ce
     qui rend impossible d'écrire une phrase inventée par ce script. */
  dit(
    'NÉGATIF, un fragment absent de la capture ne rend rien',
    blocDeLaCapture('offres--zero-arret', 'une phrase que la maquette n\'écrit nulle part'),
    null,
  )

  /* 3. `verifie`. Il doit être FAUX sur l'état coupé et VRAI après la pose.
        Mesuré sur une copie en mémoire, aucune fiche n'est touchée. */
  const r = RESTITUTIONS.find((x) => x.quoi.includes('comparaison de coût'))
  const copie = JSON.parse(readFileSync(`${FICHES}/${r.fiche}`, 'utf8'))
  const coupe = (contenu) => {
    const q = contenu.sections
      .flatMap((s) => s.questions ?? [])
      .find((q) => q.question.includes('Pourquoi pas un technicien salarié'))
    q.reponse = q.reponse.replace(/, pour moins de la moitié.*$/, '.')
    return contenu
  }
  const avant = coupe(copie.contenu)
  dit("NÉGATIF, verifie est FAUX sur la réponse coupée", r.verifie(avant), false)
  r.pose(avant, bloc)
  dit('verifie est VRAI après la pose', r.verifie(avant), true)

  let vues = 0
  for (const e of epreuves) {
    if (e.juste) vues += 1
    console.log(`  ${e.juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!e.juste) console.log(`           attendu ${JSON.stringify(e.veut)}, obtenu ${JSON.stringify(e.obtenu)}`)
  }
  console.log(`\ntémoin : ${vues}/${epreuves.length} épreuves réussies`)
  process.exit(vues === epreuves.length ? 0 : 1)
}

/* ----------------------------------------------------------------- passage */

let rendues = 0
let refusees = 0

for (const r of RESTITUTIONS) {
  const chemin = `${FICHES}/${r.fiche}`
  const fiche = JSON.parse(readFileSync(chemin, 'utf8'))
  const bloc = blocDeLaCapture(r.capture, r.fragment)

  /* IDEMPOTENCE. `verifie` décrit l'état voulu, pas l'action : s'il est déjà
     vrai, la restitution a eu lieu et poser une seconde fois ajouterait une
     carte en double. Un script de contenu doit pouvoir se relancer. */
  if (r.verifie(fiche.contenu)) {
    console.log(`  DÉJÀ    ${r.fiche} · ${r.quoi}`)
    continue
  }

  if (!bloc) {
    console.log(`  REFUSÉ  ${r.fiche} · ${r.quoi}`)
    console.log(`      le fragment « ${r.fragment} » n'est pas dans ${r.capture}.html`)
    refusees += 1
    continue
  }
  if (MONTANT.test(bloc)) {
    console.log(`  REFUSÉ  ${r.fiche} · ${r.quoi}`)
    console.log(`      la capture porte un MONTANT, qui reste interdit : « ${bloc.slice(0, 80)}… »`)
    refusees += 1
    continue
  }

  r.pose(fiche.contenu, bloc)
  if (!r.verifie(fiche.contenu)) {
    console.log(`  REFUSÉ  ${r.fiche} · ${r.quoi}`)
    console.log(`      la pose n'a pas pris, rien n'est écrit`)
    refusees += 1
    continue
  }

  console.log(`  RENDU   ${r.fiche} · ${r.quoi}`)
  console.log(`      « ${bloc.slice(0, 120)}${bloc.length > 120 ? '…' : ''} »`)
  rendues += 1

  if (APPLIQUE) writeFileSync(chemin, JSON.stringify(fiche, null, 2) + '\n', 'utf8')
}

console.log()
console.log(`${rendues} restitution(s), ${refusees} refusée(s)`)
if (!APPLIQUE) console.log('LECTURE SEULE. Relancer avec --applique pour écrire.')
process.exit(refusees > 0 ? 1 : 0)
