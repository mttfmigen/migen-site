import type { Section } from "@/types/contenu";
import { BLOCS, type RenduBloc } from "./index";

/**
 * Rend une section, quelle qu'elle soit. C'est ce qu'une page appelle en
 * parcourant `contenu.sections`, dans l'ordre du gabarit.
 *
 * La conversion de type est inévitable : TypeScript ne relie pas la clé lue
 * dans `section.type` à la valeur extraite de la table. Elle est sûre parce que
 * `BLOCS` est vérifiée, clé par clé, contre l'union des sections.
 */
export default function Bloc<S extends Section>({ section }: { section: S }) {
  const Composant = BLOCS[section.type] as RenduBloc<S>;
  return <Composant section={section} />;
}
