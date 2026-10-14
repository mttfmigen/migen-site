/**
 * Le TEXTE des conditions générales de vente de Migen Service, version du
 * 24/02/2026, repris de l'ancien site (migen.fr/cgv/, page WordPress 152) le
 * 14/10/2026. Les devis de Migen renvoient à https://migen.fr/cgv.
 *
 * C'EST LA COPIE JURIDIQUE DU CLIENT, MOT POUR MOT. Aucune reformulation,
 * aucun ajout, aucune coupe : un contrat ne se réécrit pas pour la charte.
 * Les interdits de rédaction du contrat de projet (« notamment », « sur
 * mesure », « mise à disposition », les montants) ne s'y appliquent donc pas,
 * et `scripts/verifie-interdits.mjs` exempte ce fichier de son vocabulaire.
 *
 * UNE SEULE MODIFICATION, la règle typographique du site : les 50 tirets
 * demi-cadratins de l'original sont remplacés, par deux-points après
 * « ARTICLE n » ou « PRÉAMBULE », par une virgule partout ailleurs (titres,
 * intertitres, ligne d'en-tête). Aucun autre caractère ne change, coquilles de
 * l'original comprises (« prestations.En cas », article 14.5).
 *
 * Structure de l'original conservée : un titre par article, puis ses
 * paragraphes, chaque paragraphe étant une liste de lignes séparées par un
 * retour à la ligne, comme les <br> de la page WordPress.
 *
 * GÉNÉRÉ par script depuis le HTML de l'ancienne page, pas recopié à la main.
 * Pour une nouvelle version des CGV : remplacer ce texte en entier, et mettre à
 * jour la date d'en-tête.
 */

export interface SectionCgv {
  /** L'ancre du sommaire. */
  id: string;
  titre: string;
  paragraphes: readonly (readonly string[])[];
}

export const TITRE_DOCUMENT = "Conditions générales de vente";

export const ENTETE = "CONDITIONS GÉNÉRALES DE VENTE (CGV), MIGEN SERVICE, contact@migen.fr, www.migen.fr, Version du : 24/02/2026";

export const SECTIONS: readonly SectionCgv[] = [
  {
    id: "preambule",
    titre: "PRÉAMBULE : CHAMP D’APPLICATION, OPPOSABILITÉ",
    paragraphes: [
      [
        "Les présentes Conditions Générales de Vente (ci-après « CGV ») s’appliquent de plein droit à toute commande de prestations de services passée auprès de la société Migen Service, SAS, dont les coordonnées figurent aux Mentions légales (ci-après le « Prestataire »), par tout client professionnel agissant dans le cadre de son activité (ci-après le « Client »).",
        "Les CGV prévalent sur tout autre document du Client, notamment conditions générales d’achat, conditions particulières d’achat, bons de commande comportant des stipulations contraires, ou tout document non expressément accepté par écrit par le Prestataire.",
        "Toute commande, signature d’offre, de devis, de commande, ou tout commencement d’exécution emporte acceptation pleine, entière et sans réserve des CGV, lesquelles sont réputées portées à la connaissance du Client avant tout engagement.",
        "Toute dérogation aux CGV ne peut résulter que d’un écrit signé par un représentant habilité du Prestataire.",
      ],
    ],
  },
  {
    id: "article-1",
    titre: "ARTICLE 1 : OBJET, QUALIFICATION JURIDIQUE, ABSENCE DE MISE À DISPOSITION",
    paragraphes: [
      [
        "1.1 Objet",
        "Les CGV ont pour objet de définir les conditions dans lesquelles le Prestataire réalise des prestations au bénéfice du Client, notamment : (a) Prestations de maintenance industrielle régulière : mobilisation de techniciens pour réaliser des missions de maintenance préventive, corrective, améliorative et d’optimisation sur les équipements du Client ; (b) Prestations ponctuelles : interventions spécifiques non récurrentes, commandées au cas par cas ; (c) Travaux au forfait sur mesure : projets définis par objectifs, cahier des charges et planning, facturés sur une base forfaitaire.",
      ],
      [
        "1.2 Qualification juridique : contrat de prestation de services",
        "Les prestations constituent des contrats de services autonomes et indépendants. Elles n’ont pas pour objet, ni pour effet, la mise à disposition de personnel au sens de l’article L.8241-1 du Code du travail, ni un prêt de main-d’œuvre, ni une délégation d’autorité hiérarchique au profit du Client. Le Prestataire demeure seul employeur du personnel affecté, conserve l’intégralité du pouvoir hiérarchique, disciplinaire et organisationnel, et supporte seul les obligations sociales afférentes. Le Client reconnaît expressément que les techniciens du Prestataire interviennent en toute autonomie, selon l’organisation arrêtée par le Prestataire, et qu’aucun lien de subordination hiérarchique, disciplinaire ou organisationnel n’existe entre les techniciens du Prestataire et le Client. Toute pratique du Client susceptible de caractériser un lien de subordination, un co-emploi, une intégration dans les effectifs ou une direction de fait est strictement interdite et constitue un manquement grave ouvrant droit au Prestataire de suspendre immédiatement la prestation, puis de résilier aux torts exclusifs du Client, sans préjudice de tous dommages-intérêts.",
      ],
    ],
  },
  {
    id: "article-2",
    titre: "ARTICLE 2 : NATURE DES PRESTATIONS, ORGANISATION, AUTONOMIE",
    paragraphes: [
      [
        "2.1 Maintenance industrielle régulière",
        "Le Prestataire mobilise des techniciens qualifiés pour intervenir sur les équipements industriels du Client. Les techniciens exécutent la prestation sous la supervision exclusive du Prestataire, notamment du coordinateur Migen désigné, sans lien de subordination avec le Client.",
      ],
      [
        "2.2 Prestations ponctuelles",
        "Les interventions ponctuelles sont réalisées à la demande du Client, pour des besoins spécifiques, urgents ou limités dans le temps, selon les mêmes exigences de qualité, sécurité et conformité.",
      ],
      [
        "2.3 Travaux au forfait sur mesure",
        "Pour les projets nécessitant une définition préalable des objectifs, le Prestataire établit un cahier des charges et/ou un devis détaillé, validé par les parties, précisant notamment : périmètre, livrables, hypothèses, délais, conditions financières, jalons, modalités de recette le cas échéant. Toute modification demandée par le Client fera l’objet d’un chiffrage et d’une acceptation écrite préalable.",
      ],
      [
        "2.4 Organisation des équipes de techniciens",
        "Le Prestataire mobilise deux catégories d’équipes selon les besoins :",
        "2.4.1 Techniciens sédentaires / locaux",
        "Ils interviennent dans un rayon d’environ 100 km autour de leur lieu d’affectation. Leur engagement obéit aux conditions de durée et de sortie prévues à l’article 4.",
        "2.4.2 Techniciens itinérants / grand déplacement",
        "Ils interviennent sur tout le territoire français. Ils peuvent être soumis à un forfait journalier de défraiement couvrant notamment déplacement, hébergement et repas, selon l’offre de prix. Leur mobilisation obéit aux conditions de durée et de sortie prévues à l’article 4.",
        "2.4.3 Choix des équipes",
        "Le choix (sédentaire/itinérant) est défini dans l’offre initiale selon contraintes opérationnelles, localisation, technicité, disponibilité et continuité attendue.",
        "2.4.4 Supervision",
        "Toutes les équipes sont supervisées par le service opérationnel du Prestataire (coordinateur, technicien référent le cas échéant). Le Prestataire assure notamment : planification, répartition des missions, priorisation, contrôle qualité, gestion des remplacements, gestion RH (congés, horaires, affectations), en cohérence avec les informations techniques et contraintes de site communiquées par le Client.",
      ],
      [
        "2.5 Non-intégration dans les effectifs du Client",
        "Les techniciens du Prestataire ne participent pas aux dispositifs RH du Client (primes collectives, évaluations, entretiens RH, sanction, astreintes internes Client, etc.). Le Client s’interdit d’exercer tout pouvoir hiérarchique, disciplinaire ou organisationnel. Toute instruction opérationnelle doit transiter par le coordinateur Migen ou, à défaut, par un interlocuteur habilité désigné par le Prestataire.",
      ],
      [
        "2.6 Moyens techniques et autonomie",
        "Le Prestataire détermine les moyens techniques nécessaires (outillage, équipements, matériels, EPI génériques). Le Client peut mettre à disposition des ressources complémentaires uniquement à titre d’assistance, sans transfert de responsabilité ni modification du périmètre contractuel.",
      ],
      [
        "2.7 Responsabilité hiérarchique et suivi",
        "Les techniciens sont encadrés, évalués et coordonnés exclusivement par le Prestataire. Le Client reconnaît que le Prestataire conserve la direction et la responsabilité intégrale de son personnel, y compris dans l’enceinte du Client.",
      ],
    ],
  },
  {
    id: "article-3",
    titre: "ARTICLE 3 : COMMANDES, MODIFICATIONS, VALIDATION DE LA PRESTATION",
    paragraphes: [
      [
        "3.1 Commandes pour prestations régulières",
        "Les prestations régulières font l’objet d’une offre de prix précisant au minimum : type d’équipe, nombre de techniciens, volume horaire et/ou taux journalier moyen, défraiements éventuels, site(s), conditions particulières, modalités de facturation et durée/engagement. La validation écrite de l’offre formalise l’accord.",
      ],
      [
        "3.2 Commandes pour prestations ponctuelles",
        "Toute prestation ponctuelle fait l’objet d’une commande écrite (email accepté) précisant la nature de l’intervention, le site, les délais, le tarif et, le cas échéant, les conditions d’accès/sécurité.",
      ],
      [
        "3.3 Commandes pour travaux au forfait",
        "Un devis détaillé est établi incluant le cahier des charges et les conditions financières. La validation du devis vaut acceptation des CGV et des conditions spécifiques au projet.",
      ],
      [
        "3.4 Modification de périmètre / site / moyens",
        "Toute demande du Client visant à ajouter/modifier un site d’intervention, ou à modifier les moyens (volume horaire, nombre de techniciens, organisation) doit être notifiée par écrit et acceptée par le Prestataire. L’acceptation peut intervenir par écrit sans nécessité d’avenant, sauf exigence expresse du Prestataire.",
      ],
      [
        "3.5 Validation d’exécution, absence de subordination",
        "La signature des relevés, attestations, ou toute validation mensuelle (y compris par email) vaut confirmation de la bonne exécution du service et de la réalité des prestations, sans emporter subordination du personnel du Prestataire ni pouvoir hiérarchique du Client.",
      ],
    ],
  },
  {
    id: "article-4",
    titre: "ARTICLE 4 : DURÉE, ENGAGEMENT, SORTIE, RÉSILIATION, RÈGLES SPÉCIFIQUES",
    paragraphes: [
      [
        "4.1 Principes généraux",
        "Les prestations régulières sont conclues soit pour une durée déterminée, soit pour une durée indéterminée avec reconduction mensuelle. Sauf stipulation contraire, toute résiliation doit être notifiée par écrit. Les règles spécifiques ci-dessous prévalent selon le type d’équipe et les options souscrites.",
      ],
      [
        "4.2 Prestations sédentaires (techniciens issus de l’équipe sédentaire/local)",
        "4.2.1 Durée et engagement minimum ferme",
        "Pour les techniciens issus de l’équipe sédentaire, la prestation est conclue avec un engagement minimum contractuel incompressible de six (6) mois à compter du premier jour d’intervention sur site. Cette durée minimale constitue une condition essentielle et déterminante du consentement du Prestataire (mobilisation, recrutement, allocation de capacité, coûts fixes, organisation).",
        "En conséquence, toute demande de sortie anticipée avant l’échéance minimale ouvre droit aux indemnisations prévues ci-après, sauf souscription et application de la Garantie No-Fit.",
      ],
      [
        "4.2.2 Sortie anticipée immédiate du technicien (hors Garantie No-Fit)",
        "Le Client peut demander une sortie anticipée et immédiate du technicien. Dans ce cas, le Client sera redevable d’une indemnité contractuelle forfaitaire et irréductible égale à 80% du montant minimum restant dû jusqu’au terme de la période minimale de six (6) mois, sur la base des conditions tarifaires applicables au technicien concerné. Cette indemnité est expressément acceptée par le Client comme proportionnée aux coûts engagés et au préjudice prévisible du Prestataire (coûts de recrutement, formation, mobilisation, perte de marge, désorganisation, coûts administratifs et opérationnels). Elle est exigible immédiatement à réception de facture.",
      ],
      [
        "4.2.3 Remplacement du technicien à la demande du Client (hors Garantie No-Fit, congés, maladie)",
        "Si le Client souhaite remplacer le technicien en poste (hors absences pour congés, maladie ou événements assimilés, et hors Garantie No-Fit), la demande pourra être mise en œuvre par les équipes opérationnelles du Prestataire, sous réserve de faisabilité.",
        "Un forfait de 1 200 € HT sera facturé au titre des frais de remplacement et replanification. Ce forfait est dû par remplacement, indépendamment des autres sommes éventuellement dues (TJM, indemnités, défraiements), et couvre notamment la recherche, présélection, qualification, mobilisation, replanification, et la désorganisation opérationnelle.",
      ],
      [
        "4.2.4 Remplacements à l’initiative du Prestataire",
        "Le Prestataire se réserve la possibilité d’organiser un remplacement en cas de nécessité opérationnelle, de sécurité, de conformité, d’absence, ou de performance, sans que cela n’ouvre droit à réduction de prix, sous réserve d’assurer la continuité du service dans des conditions raisonnables.",
      ],
      [
        "4.3 Prestations itinérantes (techniciens en grand déplacement)",
        "4.3.1 Durée et engagement",
        "Sur commande, les prestations itinérantes peuvent être : (a) à durée déterminée, avec un minimum contractuel (durée ou volume) défini dans l’offre/commande ; (b) à durée indéterminée, sans engagement minimum, avec préavis.",
      ],
      [
        "4.3.2 Sortie immédiate du technicien",
        "(a) Si la commande initiale prévoit un minimum (durée/volume) : toute sortie anticipée et immédiate demandée par le Client entraîne une indemnité contractuelle forfaitaire égale à 80% du montant minimum restant dû au titre de la commande initiale. (b) En durée indéterminée : le Client peut mettre fin à la prestation moyennant un préavis incompressible d’un (1) mois, facturé aux conditions contractuelles. Toute sortie immédiate sans respect du préavis entraîne la facturation de 80% du montant qui aurait été dû sur la période de préavis non effectuée, outre les sommes déjà dues.",
      ],
      [
        "4.3.3 Remplacement du technicien",
        "Si le Client souhaite remplacer le technicien en poste, la demande pourra être mise en œuvre par les équipes opérationnelles du Prestataire. Un forfait de 1 200 € HT sera facturé au titre des frais de remplacement et replanification, dû par remplacement.",
      ],
      [
        "4.4 Garantie No-Fit (option contractuelle)",
        "4.4.1 Définition, portée",
        "La Garantie No-Fit est une option contractuelle payante, souscrite par technicien, permettant au Client de bénéficier d’une flexibilité exceptionnelle et dérogatoire aux mécanismes d’engagement et d’indemnisation prévus aux articles 4.2 et 4.3, selon les conditions strictes ci-dessous.",
      ],
      [
        "4.4.2 Conditions de souscription (restriction d’accès)",
        "La Garantie No-Fit : (a) doit être souscrite exclusivement lors de la signature initiale de l’offre/devis/commande ; (b) ne peut pas être souscrite en cours de prestation, quelle qu’en soit la raison (insatisfaction, réorganisation, etc.) ; (c) est souscrite « mois par mois » par technicien, avec continuité obligatoire tant que la prestation du technicien concerné demeure active ; (d) ne produit effet que pour le technicien expressément visé à l’offre/commande et pour la prestation correspondante.",
      ],
      [
        "4.4.3 Prix",
        "Le prix de la Garantie No-Fit est fixé à 800 € HT par mois et par technicien. Tout mois commencé est dû intégralement. La Garantie est facturée mensuellement et est payable selon les modalités de l’article 5.",
      ],
      [
        "4.4.4 Fonctionnement (droits ouverts)",
        "Sous réserve d’être à jour de paiement, la Garantie No-Fit ouvre les droits suivants : (a) Un (1) remplacement à première demande, sans application du forfait de 1 200 € HT prévu aux articles 4.2.3 et 4.3.3 ; (b) Puis une (1) possibilité de sortie (résiliation) du technicien concerné, sans application des indemnités d’engagement (notamment l’indemnité 80%), la facturation des prestations s’arrêtant au jour effectif de sortie (prestations réalisées et engagées restant dues). Après exercice de la sortie, la Garantie No-Fit prend fin définitivement pour le technicien concerné.",
      ],
      [
        "4.4.5 Exclusions",
        "La Garantie No-Fit ne s’applique pas :",
        "(a) aux absences pour congés, maladie, accident, maternité/paternité, événements assimilés ; (b) aux cas de force majeure ; (c) aux situations d’insatisfaction imputables au Client (conditions de travail non conformes, refus d’accès, manquements sécurité, instruction directe et désorganisante, environnement matériel déficient, non-transmission d’informations, etc.).",
      ],
      [
        "4.5 Effets de fin de prestation",
        "En toute hypothèse, la fin d’une prestation n’emporte aucun transfert de personnel, ni continuité d’emploi au bénéfice du Client. Le Prestataire demeure seul responsable du suivi contractuel et social de ses salariés.",
      ],
    ],
  },
  {
    id: "article-5",
    titre: "ARTICLE 5 : TARIFS, MODALITÉS DE PAIEMENT, PÉNALITÉS, SUSPENSION",
    paragraphes: [
      [
        "5.1 Principes généraux",
        "Les prestations sont facturées conformément aux conditions de l’offre de prix, du devis ou de la commande validée. Les tarifs tiennent notamment compte de : la nature des prestations, la technicité, la localisation, les contraintes d’organisation, les défraiements et frais annexes.",
      ],
      [
        "5.2 Tarifs applicables",
        "5.2.1 Prestations régulières",
        "Les prestations régulières sont facturées sur la base d’un taux journalier moyen (TJM) ou tout autre mode de chiffrage indiqué dans l’offre (taux horaire, forfait, etc.). Le TJM intègre notamment technicité, expérience, localisation, contraintes d’organisation et coûts logistiques.",
        "5.2.2 Prestations ponctuelles",
        "Facturation au cas par cas selon durée, urgence, technicité, disponibilité, et contraintes de site.",
        "5.2.3 Travaux au forfait sur mesure",
        "Facturation selon devis forfaitaire validé. Toute évolution du périmètre/hypothèses entraîne un ajustement accepté par écrit.",
      ],
      [
        "5.3 Facturation",
        "5.3.1 Prestations régulières",
        "Facturation mensuelle selon l’offre validée et les moyens mobilisés. Des régularisations peuvent intervenir à M+1, notamment pour absences, heures supplémentaires, adaptations validées, ou refacturation de défraiements. Le Client atteste mensuellement la bonne exécution (email suffisant) sur la base des relevés transmis par le Prestataire. À défaut de retour dans un délai de 5 jours ouvrés suivant l’envoi, les prestations sont réputées acceptées sans réserve, sauf contestation motivée et documentée.",
        "5.3.2 Prestations ponctuelles",
        "Facturation à l’issue de l’intervention, sauf conditions particulières.",
        "5.3.3 Travaux au forfait",
        "Facturation selon échéancier (acompte, jalons, solde), tel que prévu au devis.",
      ],
      [
        "5.4 Modalités de paiement",
        "5.4.1 Délai",
        "Paiement à 30 jours date de facture, conformément à l’article L441-10 du Code de commerce.",
        "5.4.2 Moyens",
        "Virement bancaire (par défaut) ; chèque bancaire uniquement sur accord écrit préalable du Prestataire.",
        "5.4.3 Retard de paiement",
        "En cas de retard, il sera appliqué, de plein droit et sans mise en demeure préalable : (a) des intérêts de retard au taux annuel de 10% (ou, si plus élevé, le taux légal majoré applicable) calculés sur le montant TTC impayé ; (b) l’indemnité forfaitaire pour frais de recouvrement de 40 € (article L441-10 C. com.) ; (c) tous frais complémentaires de recouvrement (honoraires, frais d’huissier, contentieux) sur justificatifs. Le Prestataire pourra, après mise en demeure restée sans effet pendant 15 jours, suspendre immédiatement les prestations, sans que le Client ne puisse prétendre à indemnité, pénalité, ni résiliation aux torts du Prestataire. La suspension n’emporte pas renonciation aux sommes dues.",
        "5.4.4 Exigibilité immédiate des indemnités et frais",
        "Les indemnités de sortie anticipée (80%), les forfaits de remplacement (1 200 € HT) et la Garantie No-Fit (800 € HT/mois/technicien) sont immédiatement exigibles à facture. Ils sont cumulables avec les autres sommes dues.",
      ],
      [
        "5.5 Révision des tarifs",
        "Les tarifs peuvent être révisés annuellement entre janvier et mars, en tenant compte notamment de l’inflation, de l’évolution des coûts et des exigences de qualité. Toute modification est communiquée avec un préavis de 30 jours. La poursuite des prestations après entrée en vigueur vaut acceptation.",
      ],
      [
        "5.6 Annulation ou report de prestations",
        "5.6.1 Annulation par le Client",
        "(a) Prestations régulières : annulation/résiliation selon l’article 4 (préavis, engagement minimum, indemnités). (b) Travaux au forfait : facturation des travaux réalisés à la date d’annulation, plus indemnisation des coûts engagés et immobilisations, et, le cas échéant, des commandes fournisseurs non annulables.",
        "5.6.2 Report",
        "Tout report doit être notifié par écrit et accepté par le Prestataire. Les frais additionnels induits (notamment déplacements, replanification, surcoûts de disponibilité) seront facturés.",
      ],
    ],
  },
  {
    id: "article-6",
    titre: "ARTICLE 6 : OBLIGATIONS DU CLIENT, ACCÈS, SÉCURITÉ, COOPÉRATION",
    paragraphes: [
      [
        "6.1 Conformité et sécurité",
        "Le Client garantit un environnement conforme aux normes de sécurité et réglementations applicables. Il demeure responsable de la sécurité globale sur son site. Il fournit les EPI spécifiques imposés par ses règles internes et assure les formations sécurité obligatoires propres au site (accueil sécurité, habilitations site, permis internes). Tout refus d’accès, environnement dangereux, absence d’informations critiques, ou non-conformité sécurité autorise le Prestataire à suspendre l’intervention sans que cela ne réduise les sommes dues.",
      ],
      [
        "6.2 Mise à disposition des ressources",
        "Le Client met à disposition toutes informations, documentations et accès nécessaires : plans, schémas, consignes, procédures, accès aux infrastructures (atelier, bureau, stock, utilités, autorisations). Tout manquement ayant pour effet de retarder ou empêcher la prestation pourra donner lieu à facturation du temps immobilisé et/ou replanification.",
      ],
      [
        "6.3 Notification des changements",
        "Le Client informe le Prestataire de tout changement affectant la prestation : modification d’équipements, priorités, incidents, urgences. Toute demande d’ajustement est soumise à acceptation du Prestataire.",
      ],
      [
        "6.4 Interdiction de subordination, prévention co-emploi",
        "Le Client s’interdit toute instruction directe permanente, toute sanction, toute évaluation RH, toute intégration dans organigrammes ou dispositifs RH, toute fixation unilatérale des horaires/plannings, et plus largement tout comportement susceptible de caractériser une subordination. En cas de manquement, le Prestataire pourra : (i) exiger la cessation immédiate, (ii) suspendre la prestation, (iii) résilier aux torts exclusifs du Client, (iv) réclamer tous dommages-intérêts.",
      ],
    ],
  },
  {
    id: "article-7",
    titre: "ARTICLE 7 : RESPONSABILITÉ, ASSURANCE, LIMITATIONS",
    paragraphes: [
      [
        "7.1 Assurance",
        "Le Prestataire déclare être assuré au titre de sa responsabilité civile professionnelle pour les dommages pouvant résulter de l’exécution des prestations, dans les limites et exclusions de sa police.",
      ],
      [
        "7.2 Responsabilité du Prestataire",
        "La responsabilité du Prestataire n’est engagée qu’en cas de faute prouvée, pour des dommages directs, certains et prévisibles.",
        "Sont exclus, sans que cette liste soit limitative : pertes d’exploitation, pertes de production, pertes de chiffre d’affaires, pertes de données, pertes de contrats, préjudice commercial, préjudice d’image, dommages indirects ou immatériels, et tout coût de rappel ou de réorganisation interne du Client.",
      ],
      [
        "7.3 Plafond de responsabilité (clause de limitation)",
        "Sous réserve des dispositions d’ordre public, la responsabilité totale du Prestataire, toutes causes confondues et tous préjudices cumulés, est strictement limitée au montant hors taxes effectivement facturé au titre des douze (12) derniers mois précédant la survenance du fait générateur de responsabilité. En tout état de cause, la responsabilité totale du Prestataire ne pourra excéder un montant maximal de cinq cent mille euros (500 000 €) par sinistre. Le présent plafond s’applique à l’ensemble des dommages directs susceptibles d’être indemnisés au titre des présentes CGV, toutes causes juridiques confondues (contractuelles, délictuelles ou autres). Les parties reconnaissent expressément que ce plafond constitue une condition essentielle et déterminante du consentement du Prestataire, et qu’il a été pris en compte dans la fixation des conditions financières des prestations.",
      ],
      [
        "7.4 Responsabilité du Client",
        "Le Client est responsable : de la sécurité du site, de la conformité des installations, de l’accès, des informations transmises, des interventions de tiers, et des conséquences de ses manquements.",
      ],
      [
        "7.5 Exclusions spécifiques",
        "La responsabilité du Prestataire est exclue en cas : (a) force majeure ; (b) intervention de tiers non autorisés ou modifications non signalées ; (c) utilisation non conforme des recommandations du Prestataire ; (d) absence d’informations ou informations erronées communiquées par le Client ; (e) non-respect des règles de sécurité du site par le Client ou ses sous-traitants.",
      ],
      [
        "7.6 Spécificités des prestations de maintenance",
      ],
      [
        "7.6.1 Nature et périmètre des obligations",
        "Les prestations de maintenance, qu’elles soient préventives, correctives ou amélioratives, sont exécutées dans le cadre d’une obligation de moyens et dans la limite du périmètre contractuellement défini (commande, devis, plan de maintenance ou cahier des charges validé). Elles n’ont pas pour objet ni pour effet de garantir l’absence de panne, la continuité de production, la performance globale des installations ou la suppression définitive de tout risque de défaillance. Aucune obligation générale de surveillance exhaustive ou de modernisation des équipements ne peut être présumée.",
      ],
      [
        "7.6.2 Devoir d’information, état des équipements",
        "Le Prestataire est tenu d’un devoir d’information et de conseil limité aux constatations effectuées lors de ses interventions et aux éléments portés à sa connaissance. Il s’engage à signaler toute anomalie apparente ou risque identifié dans le périmètre contractuel. Toutefois, le Prestataire ne pourra être tenu responsable des défaillances résultant notamment de la vétusté, de l’usure, de la fin de cycle de vie des équipements, de défauts de conception ou structurels non apparents, d’interventions de tiers, d’informations incomplètes transmises par le Client, d’un usage non conforme ou de modifications non signalées.",
      ],
      [
        "7.6.3 Intervention corrective, défaillance ultérieure",
        "Dans le cadre d’une intervention corrective, la responsabilité du Prestataire ne saurait être engagée en cas de défaillance ultérieure si celle-ci trouve son origine dans une cause distincte de l’intervention réalisée. La seule circonstance que le Prestataire soit le dernier intervenant sur l’équipement concerné ne saurait suffire à caractériser sa responsabilité.",
      ],
      [
        "7.6.4 Recommandations et décisions du Client",
        "Lorsque le Prestataire formule des recommandations techniques (remplacement de pièces, immobilisation, travaux correctifs ou amélioratifs), sa responsabilité ne pourra être engagée si le Client refuse, reporte ou ne valide pas ces recommandations. Les arbitrages budgétaires, organisationnels ou liés à la production relèvent de la responsabilité du Client.",
      ],
    ],
  },
  {
    id: "article-8",
    titre: "ARTICLE 8 : CLAUSE DE NON-SOLLICITATION",
    paragraphes: [
      [
        "8.1 Engagement",
        "Pendant la durée du contrat et pendant douze (12) mois après sa cessation, le Client s’interdit de solliciter, recruter, embaucher, contracter ou faire contracter, directement ou indirectement, tout salarié du Prestataire ayant été impliqué dans les prestations, y compris via une société liée ou un intermédiaire.",
      ],
      [
        "8.2 Sanction",
        "En cas de violation, le Client sera redevable d’une indemnité forfaitaire irréductible équivalente à douze (12) mois de prestation, calculée sur la base du dernier TJM (ou tarif) applicable au technicien concerné, sans préjudice de dommages-intérêts complémentaires si le préjudice est supérieur. Cette indemnité est immédiatement exigible.",
      ],
      [
        "8.3 Exceptions",
        "Uniquement si accord écrit préalable du Prestataire.",
      ],
    ],
  },
  {
    id: "article-9",
    titre: "ARTICLE 9 : CONFIDENTIALITÉ, SÉCURITÉ DES INFORMATIONS, RÉFÉRENCES COMMERCIALES",
    paragraphes: [
      [
        "9.1 Confidentialité",
        "Toutes informations échangées dans le cadre des prestations sont confidentielles (données techniques, industrielles, méthodes, outils, savoir-faire, documents, prix). Chaque partie s’engage à ne pas divulguer et à limiter l’accès aux seules personnes ayant besoin d’en connaître.",
      ],
      [
        "9.2 Restrictions d’utilisation",
        "Les informations ne peuvent être utilisées qu’aux fins d’exécution des prestations. Toute reproduction, diffusion ou usage hors périmètre est interdite sans accord écrit.",
      ],
      [
        "9.3 Durée",
        "L’obligation de confidentialité demeure pendant cinq (5) ans après la fin des relations contractuelles.",
      ],
      [
        "9.4 Communication et références commerciales",
        "Sauf refus exprès écrit du Client, le Client autorise le Prestataire à mentionner son nom, son logo et la nature générale des prestations à titre de référence commerciale (site Internet, plaquettes, présentations, réseaux). Cette mention exclut toute information technique, confidentielle ou relevant du secret industriel. Le Client peut demander par écrit le retrait d’une mention, auquel cas le Prestataire procédera au retrait dans un délai raisonnable.",
      ],
      [
        "9.5 Données personnelles",
      ],
      [
        "Dans le cadre de l’exécution des prestations, le Prestataire peut être amené à accéder de manière accessoire à des données à caractère personnel appartenant au Client ou traitées par celui-ci.",
      ],
      [
        "Le Client demeure seul responsable de traitement au sens du Règlement (UE) 2016/679 (RGPD) et de la réglementation applicable. Le Prestataire s’engage, en sa qualité de sous-traitant au sens du RGPD lorsqu’il traite des données pour le compte du Client : (a) à traiter les données uniquement pour les besoins stricts de l’exécution des prestations ; (b) à ne pas utiliser les données à d’autres fins ; (c) à assurer la confidentialité des personnes autorisées à traiter les données ; (d) à mettre en œuvre des mesures techniques et organisationnelles appropriées pour assurer un niveau de sécurité adapté au risque ; (e) à informer le Client dans les meilleurs délais en cas de violation de données dont il aurait connaissance. Le Prestataire n’est pas responsable du contenu des données accessibles dans les systèmes du Client, ni de la conformité des traitements mis en œuvre par ce dernier.",
      ],
      [
        "Chaque partie demeure responsable des traitements qu’elle réalise pour son propre compte.",
      ],
    ],
  },
  {
    id: "article-10",
    titre: "ARTICLE 10 : FORCE MAJEURE",
    paragraphes: [
      [
        "Aucune partie ne pourra être tenue responsable en cas de force majeure au sens de l’article 1218 du Code civil. Les obligations sont suspendues pendant la durée de l’événement.",
        "Si l’événement se prolonge au-delà de trente (30) jours, chaque partie pourra résilier de plein droit par notification écrite, sans indemnité autre que les sommes dues au titre des prestations déjà réalisées et des coûts engagés non récupérables.",
      ],
    ],
  },
  {
    id: "article-11",
    titre: "ARTICLE 11 : LITIGES, DROIT APPLICABLE, JURIDICTION COMPÉTENTE",
    paragraphes: [
      [
        "11.1 Droit applicable",
        "Les CGV et les prestations sont régies par le droit français.",
      ],
      [
        "11.2 Résolution amiable préalable",
        "En cas de différend, les parties s’efforceront de trouver une solution amiable dans un délai de trente (30) jours à compter de la notification écrite du litige.",
      ],
      [
        "11.3 Compétence exclusive",
        "À défaut d’accord amiable, tout litige relèvera de la compétence exclusive des tribunaux du ressort du siège social du Prestataire, y compris en cas de pluralité de défendeurs, appel en garantie, référé ou procédure d’urgence.",
      ],
    ],
  },
  {
    id: "article-12",
    titre: "ARTICLE 12 : RÉVISION DES CGV, OPPOSABILITÉ DES NOUVELLES VERSIONS",
    paragraphes: [
      [
        "12.1 Droit de modification",
        "Le Prestataire peut modifier les CGV pour les adapter à l’évolution législative, réglementaire, jurisprudentielle, ou à ses besoins d’exploitation.",
      ],
      [
        "12.2 Notification",
        "Toute nouvelle version est communiquée au Client par écrit avec un préavis de trente (30) jours, sauf urgence légale.",
      ],
      [
        "12.3 Acceptation",
        "La poursuite des prestations après la date d’entrée en vigueur de la nouvelle version vaut acceptation pleine et entière.",
      ],
    ],
  },
  {
    id: "article-13",
    titre: "ARTICLE 13 : TRAÇABILITÉ, PREUVE, AUTONOMIE",
    paragraphes: [
      [
        "Le Prestataire conserve pour chaque mission : l’offre/commande validée, plannings, échanges opérationnels, attestations mensuelles, relevés d’activité internes, et tout élément de suivi.",
        "Ces documents font foi entre les parties, sauf preuve contraire, et constituent la preuve de la réalité, de l’autonomie, de la supervision et de l’organisation de la prestation par le Prestataire, excluant toute mise à disposition de personnel.",
      ],
    ],
  },
  {
    id: "article-14",
    titre: "ARTICLE 14 : DISPOSITIONS DIVERSES",
    paragraphes: [
      [
        "14.1 Nullité partielle",
        "Si une stipulation est déclarée nulle ou inopposable, les autres stipulations demeurent en vigueur. Les parties se rapprocheront pour la remplacer par une stipulation valide reflétant l’intention économique initiale.",
      ],
      [
        "14.2 Non-renonciation",
        "Le fait pour le Prestataire de ne pas se prévaloir d’une stipulation ne vaut pas renonciation.",
      ],
      [
        "14.3 Tolérance",
        "Toute tolérance ne saurait créer un droit acquis au profit du Client.",
      ],
      [
        "14.4 Sous-traitance",
      ],
      [
        "Le Prestataire se réserve le droit de sous-traiter tout ou partie des prestations à toute société ou intervenant de son choix, sans autorisation préalable du Client, sous sa responsabilité exclusive.",
      ],
      [
        "Le Prestataire demeure seul responsable vis-à-vis du Client de la bonne exécution des prestations sous-traitées, dans les conditions prévues aux présentes CGV. La sous-traitance ne saurait en aucun cas entraîner un transfert de responsabilité, ni créer un lien contractuel direct entre le sous-traitant et le Client, sauf accord écrit exprès des parties. Le Prestataire s’engage à faire respecter par ses sous-traitants les obligations essentielles des présentes CGV, notamment en matière de confidentialité, de sécurité et de conformité réglementaire.",
      ],
      [
        "14.5 Éthique et lutte contre la corruption",
      ],
      [
        "Les parties s’engagent à respecter l’ensemble des lois et réglementations applicables en matière de lutte contre la corruption et le trafic d’influence, notamment la loi n° 2016-1691 dite “Sapin II”. Chaque partie s’interdit de proposer, promettre, accorder ou solliciter, directement ou indirectement, tout avantage indu dans le cadre de l’exécution des prestations.En cas de manquement grave à ces obligations, l’autre partie pourra résilier de plein droit le contrat, sans préjudice des dommages-intérêts auxquels elle pourrait prétendre.",
      ],
      [
        "14.6 Imprévision",
      ],
      [
        "Conformément à l’article 1195 du Code civil, en cas de survenance d’un événement imprévisible lors de la conclusion du contrat et rendant son exécution excessivement onéreuse pour l’une des parties, celle-ci pourra demander une renégociation des conditions contractuelles. La demande devra être notifiée par écrit et motivée.",
      ],
      [
        "Pendant la durée de la renégociation, les parties s’engagent à poursuivre l’exécution du contrat aux conditions initialement convenues. À défaut d’accord dans un délai de trente (30) jours à compter de la demande de renégociation, les parties pourront convenir d’un commun accord de la résolution du contrat ou de son adaptation. À défaut d’accord amiable, le contrat pourra être résilié par l’une ou l’autre des parties moyennant un préavis raisonnable, sans intervention judiciaire.",
      ],
    ],
  },
];
