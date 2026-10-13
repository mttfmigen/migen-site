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
 *
 * À suivre de `node scripts/relis-relais.mjs`, puis de la porte :
 *   node scripts/verifie-purge-des-prix.mjs
 *
 * CE QUI N'EST PAS RESTITUÉ, et pourquoi, pour que personne ne croie l'oubli :
 *
 *   · `/offres/zero-arret/`, réponse « Pourquoi pas un technicien salarié ? » :
 *     la capture finit par « , pour moins de la moitié du coût d'un salarié ».
 *     Aucun montant, mais c'est une comparaison de coût chiffrée en proportion.
 *     À ARBITRER PAR MEHDI, c'est le seul des douze qui relève vraiment de lui.
 *
 *   · `/offres/full-service/`, « Les pièces consultées au prix du marché,
 *     commandées et posées délai annoncé avant commande. » La capture ELLE-MÊME
 *     est abîmée : « posées délai annoncé » n'est pas du français, il manque un
 *     mot entre les deux. Restituer tel quel servirait une phrase cassée, et la
 *     réécrire serait réécrire sa copie. À faire corriger dans la maquette.
 *
 *   · `/guides/choisir-une-entreprise-de-maintenance/`, « Le vrai risque n'est
 *     pas le prix, c'est la personne … » : la capture s'arrête sur des points de
 *     suspension, c'est un titre tronqué à l'affichage. La phrase entière n'est
 *     nulle part dans le rendu.
 *
 *   · `/ressources/fiches-pratiques/securite-maintenance/`, « Chez Migen, seuls
 *     10 % des candidats sont retenus… » : le bloc de la capture commence par
 *     « : », c'est donc lui-même un fragment recollé derrière une amorce en
 *     gras. L'emplacement exact est à établir avant d'écrire.
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
