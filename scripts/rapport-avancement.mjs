#!/usr/bin/env node
/**
 * REMESURE LE RAPPORT D'AVANCEMENT, et le réécrit.
 *
 * POURQUOI. Mehdi, le 13/10 : « Refais moi le doc rapport d'avancement et mets
 * le à jour toutes les 10 minutes ». Un rapport qui se recopie ment en deux
 * heures : `docs/RELAIS-08-10.md` a été trouvé périmé de six commits, huit de
 * ses points étaient faits et il annonçait le contraire.
 *
 * CE SCRIPT NE RÉDIGE PAS, IL MESURE. Il remplace le bloc des chiffres de
 * `docs/AVANCEMENT.md` entre ses deux balises, et laisse la prose intacte. Les
 * mesures lentes (les portes contre la production, qui prennent huit minutes)
 * ne sont PAS relancées à chaque passage : elles portent leur propre horodatage
 * et le rapport dit quand elles ont été prises.
 *
 * IL MESURE LA BRANCHE DÉPLOYÉE, PAS L'ARBRE OÙ IL TOURNE. Corrigé le 14/10 :
 * il lisait la tête locale, si bien que lancé dans un arbre resté en arrière
 * (l'arbre principal est resté à 93da90c le 14/10) il aurait publié les
 * chiffres d'un état que personne ne voit, sans rien en dire. Il récupère donc
 * `origin/phase-2-gabarits` et compte dans CE commit-là ; l'état de l'arbre
 * local est rendu à part, pour ce qu'il est.
 *
 * UNE MESURE IMPOSSIBLE S'ÉCRIT « non calculable » AVEC SON MOTIF, jamais zéro.
 * Les comptes se font ici, en JavaScript, et non par `grep -c` : `grep -c` sort
 * en erreur quand il compte zéro, et `|| true` aurait changé une lecture ratée
 * (référence absente, fichier illisible) en un zéro qui ressemble à une mesure.
 *
 * Usage :
 *   node scripts/rapport-avancement.mjs             remesure et réécrit
 *   node scripts/rapport-avancement.mjs --montre     affiche sans écrire
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const MONTRE = process.argv.includes('--montre')
const DOC = 'docs/AVANCEMENT.md'
const BRANCHE_DEPLOYEE = 'phase-2-gabarits'
const REF = `origin/${BRANCHE_DEPLOYEE}`
const DEBUT = '<!-- CHIFFRES: début, réécrit par scripts/rapport-avancement.mjs -->'
const FIN = '<!-- CHIFFRES: fin -->'

/** Lance une commande : `{ texte }` si elle réussit, `{ motif }` sinon. */
function lis(commande) {
  try {
    return { texte: execSync(commande, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }) }
  } catch (e) {
    const brut = (e.stderr || e.stdout || e.message || '').toString().trim().split('\n')[0]
    return { motif: `non calculable : ${brut.slice(0, 90) || `code ${e.status ?? '?'}`}` }
  }
}

/** Le texte d'une commande, sur une ligne, ou son motif d'échec. */
const valeur = (commande) => {
  const r = lis(commande)
  return r.motif ?? r.texte.trim()
}

/** Le nombre de lignes qui satisfont `motif`, ou le motif d'échec de la lecture. */
const compte = (commande, motif) => {
  const r = lis(commande)
  return r.motif ?? r.texte.split('\n').filter((ligne) => motif.test(ligne)).length
}

const recuperation = lis(`git fetch -q origin ${BRANCHE_DEPLOYEE}`)
const horodatage = valeur('TZ=Europe/Paris date "+%d/%m/%Y à %H:%M"')
const deploye = valeur(`git rev-parse --short ${REF}`)
const registre = `git show ${REF}:GATES.md`

const bloc = [
  DEBUT,
  '',
  '```json avancement',
  JSON.stringify(
    {
      remesureLe: horodatage,
      brancheDeployee: {
        reference: REF,
        recuperee: recuperation.motif ?? 'oui, à l’instant',
        tete: deploye,
        commitsDepuisMinuit: compte(`git log ${REF} --since="today 00:00" --format=%h`, /\S/),
      },
      arbreOuTourneLeScript: {
        branche: valeur('git branch --show-current') || 'tête détachée',
        tete: valeur('git rev-parse --short HEAD'),
        fichiersNonCommites: compte('git status --porcelain', /\S/),
      },
      contenu: {
        fichesDeContenu: compte(`git ls-tree --name-only ${REF} supabase/import/gabarits-maquette/`, /\.json$/),
      },
      verification: {
        portesDeVerification: compte(`git ls-tree --name-only ${REF} scripts/`, /^scripts\/verifie.*\.(mjs|ts)$/),
        entreesAuRegistre: compte(registre, /^### [GDB]\d+ /),
        promessesAvecCommande: compte(registre, /^\s*CHECK:/),
        retoursEncoreOuverts: compte(registre, /^- \[ \]/),
      },
    },
    null,
    2,
  ),
  '```',
  '',
  FIN,
].join('\n')

if (MONTRE) {
  console.log(bloc)
  process.exit(0)
}

const texte = readFileSync(DOC, 'utf8')
const i = texte.indexOf(DEBUT)
const j = texte.indexOf(FIN)
if (i < 0 || j < 0) {
  console.error(`balises introuvables dans ${DOC} : le bloc des chiffres n'a pas été réécrit`)
  process.exit(1)
}
writeFileSync(DOC, texte.slice(0, i) + bloc + texte.slice(j + FIN.length), 'utf8')
console.log(`${DOC} remesuré le ${horodatage} (branche déployée à ${deploye})`)
