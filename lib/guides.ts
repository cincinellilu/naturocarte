export type GuideCard = {
  title: string;
  text: string;
};

export type GuideSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideFaqItem = {
  question: string;
  answer: string;
};

export type GuidePage = {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  keywords?: string[];
  intro: string;
  cards: GuideCard[];
  sections: GuideSection[];
  faq: GuideFaqItem[];
  howToSteps?: string[];
  relatedLinks: Array<{
    href: string;
    label: string;
  }>;
};

export const GUIDE_PAGES: GuidePage[] = [
  {
    slug: "comment-choisir-un-naturopathe-a-paris",
    title: "Comment choisir un naturopathe à Paris ?",
    seoTitle: "Comment choisir un naturopathe à Paris : critères et questions",
    description:
      "Critères concrets pour choisir un naturopathe à Paris : formation, spécialisation, questions à poser et signaux d'alerte avant un premier rendez-vous.",
    keywords: [
      "comment choisir un naturopathe",
      "choisir un naturopathe à Paris",
      "critères choix naturopathe",
      "naturopathe sérieux",
      "questions à poser naturopathe"
    ],
    intro:
      "À Paris, l'offre est abondante et les approches sont très variées. Pour choisir un naturopathe sans vous laisser guider uniquement par la proximité ou par un discours séduisant, il faut regarder le parcours, le cadre d'accompagnement, les limites annoncées et la qualité du premier échange.",
    cards: [
      {
        title: "Vérifier la formation",
        text: "Le sérieux d'un praticien se lit d'abord dans la clarté avec laquelle il présente sa formation, son expérience et ses domaines d'accompagnement."
      },
      {
        title: "Comprendre l'accompagnement",
        text: "Avant de prendre rendez-vous, il faut comprendre ce que le praticien propose réellement, pour quel type de besoin et dans quelles limites."
      },
      {
        title: "Préparer les bonnes questions",
        text: "Quelques questions simples suffisent souvent à distinguer un discours précis et responsable d'un discours vague ou trop prometteur."
      }
    ],
    howToSteps: [
      "Clarifier votre besoin principal avant de comparer plusieurs praticiens.",
      "Vérifier la formation, l'expérience et les sujets réellement accompagnés.",
      "Poser des questions concrètes sur le déroulé des séances et les limites du praticien.",
      "Écarter les profils qui promettent trop ou qui poussent rapidement à l'achat.",
      "Mettre en balance la proximité, la praticité et la confiance inspirée."
    ],
    sections: [
      {
        title: "Quels critères regarder pour choisir un naturopathe ?",
        paragraphs: [
          "Le bon choix ne dépend pas seulement de la réputation du praticien ou du quartier du cabinet. Il dépend surtout de la raison pour laquelle vous consultez : fatigue persistante, stress, sommeil, digestion, alimentation, prévention ou besoin d'un accompagnement plus global.",
          "Plus votre besoin est clair, plus il devient facile de savoir si le praticien semble adapté. Un naturopathe sérieux doit pouvoir expliquer ce qu'il accompagne, ce qu'il ne prend pas en charge et à quel moment un avis médical ou paramédical est nécessaire."
        ],
        bullets: [
          "Quel est mon objectif principal dans les prochaines semaines ?",
          "Ai-je besoin d'un accompagnement centré sur l'alimentation, le mode de vie ou plusieurs sujets à la fois ?",
          "Ma situation comporte-t-elle un suivi médical, un traitement ou une pathologie à prendre en compte ?"
        ]
      },
      {
        title: "Formation, spécialisation et expérience : que vérifier ?",
        paragraphs: [
          "Les parcours en naturopathie sont très hétérogènes. C'est précisément pour cela qu'il faut regarder de près l'école suivie, la durée de formation, la place donnée à l'anatomie, à la physiologie, à la nutrition et à l'étude de cas.",
          "L'expérience compte aussi, mais seulement si elle est expliquée clairement. Un praticien qui précise son ancienneté, les publics qu'il accompagne et la manière dont il continue à se former inspire généralement davantage confiance qu'un profil qui reste flou."
        ],
        bullets: [
          "Quelle formation a été suivie, pendant combien de temps et dans quel cadre ?",
          "Depuis quand le praticien reçoit-il en consultation ?",
          "Accompagne-t-il surtout des adultes, des enfants, des sportifs, des femmes ou un public particulier ?",
          "Suit-il des formations continues ou travaille-t-il avec d'autres professionnels ?"
        ]
      },
      {
        title: "Quelles questions poser avant un premier rendez-vous ?",
        paragraphs: [
          "Le premier contact, par téléphone, par email ou en rendez-vous, donne souvent des indices très utiles. Un praticien sérieux écoute, pose des questions, reformule votre demande et explique sa méthode sans chercher à impressionner.",
          "Vous devez comprendre comment se déroule une séance, ce qui peut être attendu de l'accompagnement, le rythme proposé et le coût. Quand le cadre est clair dès le départ, la relation est généralement plus saine."
        ],
        bullets: [
          "Comment se déroule un premier rendez-vous ?",
          "Quelle place prennent l'alimentation, le sommeil, le stress ou l'activité physique dans l'accompagnement ?",
          "Quelles limites le praticien pose-t-il clairement ?",
          "Que conseille-t-il si la situation sort de son champ d'accompagnement ?"
        ]
      },
      {
        title: "Quels signaux d'alerte doivent faire reculer ?",
        paragraphs: [
          "Certains indices doivent vous rendre prudent : promesse de guérison, discours qui prétend tout expliquer, dénigrement des médecins, demande d'arrêter un traitement ou pression pour acheter de nombreux compléments dès le départ.",
          "La prudence s'impose aussi lorsqu'un praticien donne peu d'informations sur sa formation, évite les questions précises ou transforme rapidement la consultation en vente de produits ou de programmes coûteux."
        ]
      },
      {
        title: "À Paris, faut-il privilégier la proximité ?",
        paragraphs: [
          "Dans une ville dense comme Paris, le temps de trajet reste un critère important. Un cabinet trop éloigné ou mal desservi peut vite rendre le suivi irrégulier, même si le praticien vous semble intéressant.",
          "Pour autant, la proximité ne doit pas devenir le seul critère. Entre un cabinet tout proche mais peu clair sur son cadre de travail et un praticien légèrement plus éloigné mais plus transparent, le second est souvent un meilleur choix sur le long terme."
        ]
      }
    ],
    faq: [
      {
        question: "Faut-il choisir un naturopathe spécialisé ?",
        answer:
          "Pas systématiquement, mais une spécialisation claire peut être utile si votre besoin est précis. Le plus important est surtout que le praticien explique honnêtement ce qu'il accompagne et avec quelle expérience."
      },
      {
        question: "Comment savoir si un naturopathe est sérieux ?",
        answer:
          "Le sérieux se juge surtout sur la transparence du parcours, la clarté des limites, la qualité du premier échange et l'absence de promesses excessives. Une présentation soignée ne suffit pas à elle seule."
      },
      {
        question: "Que préparer avant le premier rendez-vous ?",
        answer:
          "Préparez votre objectif principal, les éléments importants de votre contexte de santé, vos contraintes de rythme ou de budget et les questions qui vous aideront à comprendre le cadre proposé."
      }
    ],
    relatedLinks: [
      { href: "/carte", label: "Voir les naturopathes autour de vous sur la carte" }
    ]
  },
  {
    slug: "naturopathe-ou-dieteticien-quelles-differences",
    title: "Naturopathe ou diététicien : quelles différences ?",
    seoTitle: "Naturopathe ou diététicien : différences, rôles et consultation",
    description:
      "Comprendre les différences de formation, de rôle et de situations de consultation entre naturopathe et diététicien.",
    keywords: [
      "naturopathe ou diététicien",
      "différence naturopathe diététicien",
      "quand consulter un diététicien",
      "quand consulter un naturopathe",
      "nutritionniste naturopathe différence"
    ],
    intro:
      "Ces deux professionnels peuvent être consultés pour des questions liées à l'alimentation, à l'hygiène de vie ou au bien-être, mais ils n'interviennent pas dans le même cadre ni avec les mêmes objectifs. Comprendre leurs différences aide à choisir le bon interlocuteur au bon moment.",
    cards: [
      {
        title: "Formation et cadre",
        text: "La première différence tient au parcours de formation et au niveau d'encadrement du métier."
      },
      {
        title: "Rôle et objectifs",
        text: "Le diététicien intervient d'abord sur la nutrition ; le naturopathe adopte plus souvent une approche globale d'hygiène de vie."
      },
      {
        title: "Quand les associer",
        text: "Dans certaines situations, les deux peuvent se compléter, à condition que les rôles restent clairs."
      }
    ],
    sections: [
      {
        title: "Naturopathe ou diététicien : quelle différence de rôle ?",
        paragraphs: [
          "Le diététicien intervient sur l'alimentation, l'équilibre nutritionnel et l'adaptation des habitudes alimentaires à une situation donnée. Son travail peut concerner aussi bien la prévention que l'accompagnement de problématiques de santé pour lesquelles l'alimentation joue un rôle important.",
          "Le naturopathe est davantage sollicité pour un accompagnement plus large autour de l'hygiène de vie : rythme de vie, sommeil, stress, organisation quotidienne, alimentation, activité physique ou habitudes de récupération. L'enjeu n'est donc pas seulement ce que l'on mange, mais la manière d'organiser son équilibre global."
        ],
        bullets: [
          "Besoin centré sur la nutrition : diététicien",
          "Besoin plus large autour du mode de vie : naturopathe",
          "Situation médicale complexe : médecin en premier recours, avec orientation éventuelle"
        ]
      },
      {
        title: "Quelle différence de formation et de cadre d'exercice ?",
        paragraphs: [
          "Le cadre du diététicien est plus structuré et davantage identifié par le public. Cela peut être rassurant lorsque vous avez besoin d'un accompagnement nutritionnel précis, notamment en présence d'antécédents, de pathologies ou de contraintes alimentaires fortes.",
          "En naturopathie, les formations varient fortement d'une école à l'autre. Il faut donc regarder le détail du parcours suivi, la transparence sur les compétences revendiquées et la capacité du praticien à dire clairement ce qui relève de son accompagnement et ce qui nécessite un autre professionnel."
        ]
      },
      {
        title: "Dans quels cas consulter un diététicien ?",
        paragraphs: [
          "Le diététicien est souvent le plus pertinent lorsque votre question porte principalement sur l'alimentation ou lorsqu'un cadre nutritionnel précis est nécessaire."
        ],
        bullets: [
          "Troubles ou objectifs nutritionnels clairement identifiés",
          "Allergies, intolérances ou contraintes alimentaires documentées",
          "Maladies métaboliques, digestives ou cardiovasculaires suivies médicalement",
          "Besoin d'un bilan nutritionnel, d'un plan alimentaire précis ou d'un suivi régulier"
        ]
      },
      {
        title: "Dans quels cas consulter un naturopathe ?",
        paragraphs: [
          "Le naturopathe peut être pertinent si vous cherchez surtout à revoir vos habitudes de vie dans leur ensemble, avec un angle préventif ou éducatif, et non un traitement médical.",
          "Il peut aussi convenir si votre demande mélange plusieurs dimensions du quotidien, par exemple sommeil, stress, alimentation et rythme de travail, à condition que le praticien reste clair sur ses limites."
        ],
        bullets: [
          "Fatigue liée au rythme de vie",
          "Stress, récupération, sommeil, organisation quotidienne",
          "Envie de revoir ses habitudes d'hygiène de vie de manière globale",
          "Accompagnement complémentaire, sans se substituer à un suivi de santé"
        ]
      },
      {
        title: "Quand consulter les deux ?",
        paragraphs: [
          "Dans certaines situations, les deux approches peuvent être complémentaires. C'est souvent le cas lorsque vous avez à la fois besoin d'un cadre nutritionnel précis et d'un travail plus large sur le mode de vie.",
          "La complémentarité n'a de sens que si les rôles restent distincts. Dès qu'il existe une pathologie, un traitement ou une fragilité particulière, mieux vaut partir d'un avis médical et d'un professionnel dont le cadre d'intervention est clairement identifié."
        ]
      }
    ],
    faq: [
      {
        question: "Qui consulter pour perdre du poids ?",
        answer:
          "Tout dépend du contexte. Si la question est surtout nutritionnelle ou liée à une situation de santé, le diététicien est souvent le plus pertinent. Si vous cherchez en plus un travail plus global sur vos habitudes de vie, un naturopathe peut parfois intervenir en complément."
      },
      {
        question: "Le terme “nutritionniste” suffit-il à savoir à qui l'on a affaire ?",
        answer:
          "Non. Le mot “nutritionniste” décrit surtout un domaine d'activité. Il faut toujours vérifier la profession réelle, la formation suivie et le cadre d'intervention du professionnel."
      },
      {
        question: "Le naturopathe peut-il remplacer un diététicien ?",
        answer:
          "Non, pas lorsque le besoin principal relève d'un accompagnement nutritionnel structuré ou d'une situation médicale. Les deux approches peuvent se compléter, mais elles n'ont pas le même rôle."
      }
    ],
    relatedLinks: [
      {
        href: "/carte",
        label: "Chercher un praticien près de chez vous sur la carte"
      }
    ]
  },
  {
    slug: "trouver-un-naturopathe-autour-de-moi-en-ile-de-france",
    title: "Trouver un naturopathe autour de moi en Île-de-France",
    seoTitle: "Trouver un naturopathe autour de moi : critères utiles en Île-de-France",
    description:
      "Repères concrets pour trouver un naturopathe proche de chez soi, définir un bon périmètre de recherche et comparer plusieurs praticiens.",
    keywords: [
      "trouver un naturopathe autour de moi",
      "trouver un naturopathe près de chez moi",
      "comment trouver un naturopathe",
      "choisir un naturopathe proche",
      "naturopathe Ile-de-France"
    ],
    intro:
      "Chercher un naturopathe “autour de moi” paraît simple, mais la proximité n'est pas qu'une affaire de kilomètres. Pour faire un choix utile, il faut définir un périmètre réaliste, comparer plusieurs praticiens avec les bons critères et ne pas confondre accessibilité et qualité d'accompagnement.",
    cards: [
      {
        title: "Définir une zone réaliste",
        text: "Le bon périmètre de recherche dépend surtout de votre temps de trajet, de votre rythme et de la fréquence des rendez-vous."
      },
      {
        title: "Comparer sur des critères stables",
        text: "La distance compte, mais elle doit être mise en balance avec la formation, l'approche, la clarté du cadre et la qualité du premier échange."
      },
      {
        title: "Éviter le faux bon choix",
        text: "Le praticien le plus proche n'est pas toujours le plus pertinent, surtout si son cadre de travail reste flou ou peu rassurant."
      }
    ],
    howToSteps: [
      "Définir un temps de trajet réaliste selon votre rythme de vie.",
      "Comparer plusieurs praticiens sur la formation, le cadre et l'adéquation au besoin.",
      "Ne pas choisir uniquement sur la proximité ou la disponibilité immédiate.",
      "Construire une short list courte avec des critères identiques pour chaque option.",
      "Élargir progressivement la zone de recherche si les résultats locaux ne sont pas convaincants."
    ],
    sections: [
      {
        title: "Comment définir un bon périmètre de recherche ?",
        paragraphs: [
          "Le premier réflexe consiste souvent à chercher le cabinet le plus proche. Pourtant, ce qui compte le plus est la facilité réelle avec laquelle vous pourrez honorer vos rendez-vous : temps de trajet, horaires, transports, stationnement, contraintes professionnelles ou familiales.",
          "Un praticien situé légèrement plus loin mais facile à rejoindre peut être un meilleur choix qu'un cabinet proche en kilomètres mais compliqué à intégrer dans votre semaine."
        ],
        bullets: [
          "Combien de temps suis-je prêt à consacrer à un aller-retour ?",
          "Ai-je besoin d'un cabinet proche de chez moi, de mon travail ou d'un axe de transport fréquent ?",
          "À quelle fréquence pourrais-je raisonnablement me déplacer si un suivi est proposé ?"
        ]
      },
      {
        title: "Quels critères comparer entre plusieurs naturopathes ?",
        paragraphs: [
          "Une recherche locale devient vraiment utile lorsqu'elle permet de comparer plusieurs praticiens sur des critères de fond. La proximité reste un filtre pratique, mais elle ne dit rien sur la qualité de l'écoute, la cohérence du parcours, la clarté des limites ou la pertinence de l'approche pour votre besoin.",
          "Pour éviter un choix trop rapide, mieux vaut observer quelques éléments stables : la formation, l'expérience, les sujets accompagnés, la manière d'expliquer une consultation et le ton employé dans les échanges."
        ],
        bullets: [
          "Formation et expérience",
          "Type de besoins accompagnés",
          "Clarté sur le déroulé des séances",
          "Transparence sur les tarifs et le rythme éventuel du suivi",
          "Capacité à répondre précisément à vos questions"
        ]
      },
      {
        title: "Pourquoi la proximité n'est pas toujours le meilleur critère",
        paragraphs: [
          "Choisir uniquement le cabinet le plus proche peut conduire à négliger des points plus importants : qualité du cadre, sérieux du discours, compatibilité avec votre besoin ou confiance inspirée par le premier échange.",
          "À l'inverse, un praticien très pertinent mais trop éloigné peut rendre le suivi difficile dans la durée. Le bon choix se situe souvent dans un équilibre entre accessibilité, clarté et adéquation avec votre situation."
        ]
      },
      {
        title: "Comment faire une short list utile ?",
        paragraphs: [
          "Il est rarement utile de multiplier les options pendant des heures. Une liste courte de deux à quatre praticiens permet au contraire de comparer calmement les informations importantes et de repérer plus vite les différences réelles.",
          "Pour chaque option, notez les mêmes critères. Cette méthode simple évite de se laisser convaincre uniquement par une promesse attractive ou une impression visuelle."
        ],
        bullets: [
          "Quel besoin ce praticien semble-t-il comprendre ?",
          "Son parcours est-il expliqué clairement ?",
          "Le cadre d'accompagnement est-il compréhensible ?",
          "Le temps de trajet reste-t-il réaliste ?",
          "Le premier échange inspire-t-il confiance ?"
        ]
      },
      {
        title: "Quand élargir sa zone de recherche ?",
        paragraphs: [
          "Si les praticiens proches ne correspondent pas à votre besoin, il peut être pertinent d'élargir progressivement la zone de recherche. En Île-de-France, une ville limitrophe ou un secteur mieux desservi peut parfois être plus pratique qu'une adresse théoriquement plus proche.",
          "L'objectif n'est pas d'aller le plus loin possible, mais d'ouvrir le champ juste assez pour trouver un praticien dont le cadre vous paraît plus sérieux, plus clair et plus compatible avec votre quotidien."
        ]
      }
    ],
    faq: [
      {
        question: "Comment trouver un naturopathe près de chez moi ?",
        answer:
          "Le plus utile est de partir d'un temps de trajet réaliste, puis de comparer plusieurs praticiens sur des critères de fond : formation, approche, clarté du cadre et confiance inspirée. Chercher “près de chez moi” n'a de sens que si la proximité reste compatible avec la qualité du choix."
      },
      {
        question: "Quelle distance est raisonnable pour consulter ?",
        answer:
          "La bonne mesure n'est pas seulement la distance, mais le temps de trajet que vous pourrez vraiment répéter sans fatigue excessive ni contrainte ingérable. Un suivi n'est utile que s'il reste compatible avec votre quotidien."
      },
      {
        question: "Combien de praticiens faut-il comparer ?",
        answer:
          "Comparer deux à quatre praticiens suffit souvent pour faire ressortir les différences utiles sans se disperser. Au-delà, la comparaison devient souvent moins lisible."
      }
    ],
    relatedLinks: [
      {
        href: "/carte",
        label: "Consulter la carte pour repérer des praticiens autour de vous"
      }
    ]
  }
];

export const GUIDE_INDEX_ENTRIES = GUIDE_PAGES.map(({ slug, title, description }) => ({
  slug,
  title,
  description,
  href: `/guides/${slug}`
}));

export function getGuidePage(slug: string): GuidePage | null {
  return GUIDE_PAGES.find((guide) => guide.slug === slug) ?? null;
}
