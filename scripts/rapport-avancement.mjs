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
 * Usage :
 *   node scripts/rapport-avancement.mjs             remesure et réécrit
 *   node scripts/rapport-avancement.mjs --montre     affiche sans écrire
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const MONTRE = process.argv.includes('--montre')
const DOC = 'docs/AVANCEMENT.md'
const DEBUT = '<!-- CHIFFRES: début, réécrit par scripts/rapport-avancement.mjs -->'
const FIN = '<!-- CHIFFRES: fin -->'

/** Une commande qui échoue rend sa raison, jamais un zéro silencieux. */
function mesure(commande) {
  try {
    return execSync(commande, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }).trim()
  } catch (e) {
    return `non calculable : ${(e.stderr || e.stdout || e.message || '').toString().split('\n')[0].slice(0, 90)}`
  }
}

const horodatage = mesure('TZ=Europe/Paris date "+%d/%m/%Y à %H:%M"')
const tete = mesure('git rev-parse --short HEAD')
const branche = mesure('git branch --show-current')
const pousse = mesure('git rev-parse --short "@{u}" 2>/dev/null || echo "pas de suivi"')
const commitsDuJour = mesure('git log --since="today 00:00" --oneline | wc -l | tr -d " "')
const arbreSale = mesure('git status --porcelain | wc -l | tr -d " "')
const fiches = mesure('ls supabase/import/gabarits-maquette/*.json | wc -l | tr -d " "')
const portes = mesure('ls scripts/verifie*.mjs scripts/verifie*.ts 2>/dev/null | wc -l | tr -d " "')
const entreesRegistre = mesure('grep -c "^### G" GATES.md')
const promesses = mesure('grep -c "^ *CHECK:" GATES.md')
const ouverts = mesure('grep -c "^- \\[ \\]" GATES.md')

const bloc = [
  DEBUT,
  '',
  '```json avancement',
  JSON.stringify(
    {
      remesureLe: horodatage,
      depot: { branche, tete, poussé: pousse, commitsDepuisMinuit: Number(commitsDuJour) || commitsDuJour, fichiersNonCommites: Number(arbreSale) || arbreSale },
      contenu: { fichesDeContenu: Number(fiches) || fiches },
      verification: {
        portesDeVerification: Number(portes) || portes,
        entreesAuRegistre: Number(entreesRegistre) || entreesRegistre,
        promessesAvecCommande: Number(promesses) || promesses,
        retoursEncoreOuverts: Number(ouverts) || ouverts,
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
console.log(`${DOC} remesuré le ${horodatage} (tête ${tete})`)
