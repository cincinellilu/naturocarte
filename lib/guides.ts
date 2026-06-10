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
  description: string;
  intro: string;
  cards: GuideCard[];
  sections: GuideSection[];
  faq: GuideFaqItem[];
  relatedLinks: Array<{
    href: string;
    label: string;
  }>;
};

export const GUIDE_PAGES: GuidePage[] = [
  {
    slug: "comment-choisir-un-naturopathe-a-paris",
    title: "Comment choisir un naturopathe à Paris ?",
    description:
      "Des repères concrets pour choisir un naturopathe à Paris selon votre besoin, votre secteur et les informations disponibles.",
    intro:
      "À Paris, l’offre peut vite sembler difficile à comparer. Le plus simple est de partir de votre besoin réel, de limiter la recherche à un secteur pratique, puis de vérifier quelques critères factuels avant de prendre contact.",
    cards: [
      {
        title: "1. Clarifier votre besoin",
        text: "Avant de chercher, notez ce que vous attendez: hygiène de vie, alimentation, stress, sommeil ou accompagnement global."
      },
      {
        title: "2. Choisir une zone réaliste",
        text: "Un cabinet facile d’accès réduit la friction et augmente vos chances d’aller jusqu’au rendez-vous."
      },
      {
        title: "3. Comparer quelques profils",
        text: "Regardez la présentation, les informations pratiques et la cohérence entre votre besoin et l’approche proposée."
      }
    ],
    sections: [
      {
        title: "Commencer par votre besoin, pas par une liste de noms",
        paragraphs: [
          "La naturopathie peut couvrir des sujets très variés: équilibre alimentaire, énergie, stress, sommeil, digestion, habitudes quotidiennes ou accompagnement de terrain. Tous les praticiens ne mettent pas l’accent sur les mêmes sujets.",
          "Avant de comparer les profils, formulez votre besoin en une phrase simple. Cela vous évite de choisir uniquement sur la proximité ou sur une fiche visuellement plus complète."
        ],
        bullets: [
          "Quel est le sujet principal de votre recherche ?",
          "Souhaitez-vous un rendez-vous proche de chez vous ou de votre travail ?",
          "Préférez-vous une approche très pratique, pédagogique ou plus globale ?",
          "Avez-vous besoin d’un contact rapide ou d’informations détaillées avant de réserver ?"
        ]
      },
      {
        title: "Vérifier les critères pratiques",
        paragraphs: [
          "À Paris, la localisation compte beaucoup. Un cabinet situé dans un arrondissement proche mais mal desservi peut être moins pratique qu’un praticien un peu plus éloigné mais facile d’accès.",
          "Regardez aussi la facilité de prise de contact: téléphone, email, site web ou lien de réservation. Plus l’information est claire, plus vous pouvez avancer sans perdre de temps."
        ],
        bullets: [
          "Adresse et arrondissement",
          "Temps de trajet réaliste",
          "Moyen de contact disponible",
          "Lien de réservation ou site web si vous voulez en savoir plus"
        ]
      },
      {
        title: "Lire la présentation avec prudence",
        paragraphs: [
          "Une présentation claire aide à comprendre l’approche du praticien, mais elle ne doit pas être lue comme une garantie de résultat. Elle sert surtout à voir si le ton, la méthode et les sujets abordés correspondent à votre recherche.",
          "Méfiez-vous des promesses trop fortes ou des formulations qui ressemblent à un engagement de guérison. Pour une situation médicale, un suivi ou un avis professionnel de santé reste prioritaire."
        ]
      },
      {
        title: "Comparer sans se disperser",
        paragraphs: [
          "Le bon réflexe n’est pas d’ouvrir toutes les fiches disponibles, mais d’en sélectionner trois à cinq dans une zone cohérente. Vous pouvez ensuite comparer les informations factuelles et garder les profils les plus lisibles.",
          "Si aucun profil ne vous semble adapté, élargissez progressivement: arrondissement voisin, ville limitrophe, puis département."
        ]
      }
    ],
    faq: [
      {
        question: "Faut-il choisir le naturopathe le plus proche ?",
        answer:
          "Pas forcément. La proximité est importante, mais elle doit être croisée avec la clarté de la présentation, les moyens de contact et l’adéquation avec votre besoin."
      },
      {
        question: "Combien de fiches faut-il ouvrir ?",
        answer:
          "Trois à cinq profils suffisent souvent pour comparer correctement sans se disperser. Au-delà, il devient plus difficile de garder une lecture claire."
      },
      {
        question: "Que regarder en premier ?",
        answer:
          "Commencez par le besoin, l’adresse, les moyens de contact et la présentation de l’accompagnement. Ce sont les repères les plus utiles avant un premier contact."
      }
    ],
    relatedLinks: [
      { href: "/naturopathe-paris", label: "Voir les pages Paris par arrondissement" },
      { href: "/carte", label: "Ouvrir la carte" },
      { href: "/annuaire-naturopathes", label: "Consulter l’annuaire Île-de-France" }
    ]
  },
  {
    slug: "naturopathe-ou-dieteticien-quelles-differences",
    title: "Naturopathe ou diététicien : quelles différences ?",
    description:
      "Une explication simple pour ne pas confondre accompagnement en hygiène de vie et suivi alimentaire encadré.",
    intro:
      "Les deux métiers peuvent parler d’alimentation, mais ils ne répondent pas au même besoin. La bonne approche dépend surtout de ce que vous cherchez: accompagnement global, conseils d’hygiène de vie ou suivi plus orienté alimentation et santé.",
    cards: [
      {
        title: "Naturopathe",
        text: "Accompagnement autour du bien-être, de l’hygiène de vie et des habitudes du quotidien."
      },
      {
        title: "Diététicien",
        text: "Approche centrée sur l’alimentation et le cadre nutritionnel, avec un positionnement de santé plus structuré."
      },
      {
        title: "Le bon réflexe",
        text: "Choisissez selon votre besoin réel, puis vérifiez toujours la fiche et le parcours du professionnel."
      }
    ],
    sections: [
      {
        title: "En pratique, ce n’est pas le même rôle",
        paragraphs: [
          "Un naturopathe est généralement recherché pour un accompagnement plus large autour de l’hygiène de vie, de l’organisation du quotidien et du bien-être.",
          "Un diététicien intervient dans un cadre plus orienté alimentation et suivi nutritionnel. Si votre situation est médicale ou complexe, l’avis d’un professionnel de santé reste la base."
        ],
        bullets: [
          "Naturopathe: hygiène de vie, équilibre du quotidien, accompagnement global",
          "Diététicien: alimentation, besoins nutritionnels, suivi structuré",
          "Situation médicale: prioriser le bon interlocuteur de santé avant tout"
        ]
      },
      {
        title: "Comment choisir selon votre besoin",
        paragraphs: [
          "Si vous cherchez surtout des repères concrets pour mieux organiser votre hygiène de vie, une fiche de naturopathe peut suffire à démarrer.",
          "Si vous cherchez un suivi alimentaire plus cadré, regardez plutôt la spécialité et le positionnement du professionnel avant de prendre contact."
        ]
      },
      {
        title: "Ce que NaturoCarte vous aide à faire",
        paragraphs: [
          "NaturoCarte ne tranche pas à votre place. Le site vous aide à comparer les fiches, les coordonnées et les zones de présence pour vous orienter plus vite vers le bon profil.",
          "L’important reste de garder une recherche simple, lisible et adaptée à votre besoin réel."
        ]
      }
    ],
    faq: [
      {
        question: "Peut-on consulter un naturopathe et un diététicien ?",
        answer:
          "Oui, si vos besoins sont différents. L’essentiel est de ne pas mélanger les rôles et de garder un interlocuteur adapté à chaque sujet."
      },
      {
        question: "Un naturopathe remplace-t-il un avis médical ?",
        answer:
          "Non. La naturopathie peut accompagner une démarche de bien-être et d’hygiène de vie, mais ne remplace pas un suivi médical."
      },
      {
        question: "Comment lire une fiche sur NaturoCarte ?",
        answer:
          "Concentrez-vous sur les informations factuelles: adresse, contact, zone de présence et manière dont le praticien présente son accompagnement."
      }
    ],
    relatedLinks: [
      { href: "/carte", label: "Trouver un professionnel sur la carte" },
      { href: "/naturopathe-paris", label: "Explorer Paris par arrondissement" },
      { href: "/annuaire-naturopathes", label: "Parcourir l’Île-de-France" }
    ]
  },
  {
    slug: "trouver-un-naturopathe-autour-de-moi-en-ile-de-france",
    title: "Trouver un naturopathe autour de moi en Île-de-France",
    description:
      "Conseils pratiques pour chercher un naturopathe proche de chez soi en Île-de-France sans perdre de temps dans des listes trop larges.",
    intro:
      "En Île-de-France, la proximité ne se résume pas à une distance en kilomètres. Le temps de trajet, les transports, les horaires et la facilité de contact comptent autant que l’adresse du cabinet.",
    cards: [
      {
        title: "1. Partir d’un point concret",
        text: "Utilisez votre domicile, votre lieu de travail ou une gare pratique comme point de départ."
      },
      {
        title: "2. Raisonner en temps de trajet",
        text: "Un praticien à 6 km peut être plus accessible qu’un cabinet à 2 km si les transports sont plus directs."
      },
      {
        title: "3. Garder une comparaison simple",
        text: "Sélectionnez quelques profils proches et vérifiez les informations essentielles avant de contacter."
      }
    ],
    sections: [
      {
        title: "Définir ce que veut dire “autour de moi”",
        paragraphs: [
          "En Île-de-France, une recherche locale doit tenir compte de votre quotidien. Le bon périmètre n’est pas toujours la ville la plus proche, mais la zone que vous pouvez rejoindre facilement.",
          "Avant de comparer les praticiens, choisissez votre point de départ: domicile, travail, école, gare ou ligne de transport habituelle."
        ],
        bullets: [
          "Domicile si vous cherchez un rendez-vous près de chez vous",
          "Lieu de travail si vous voulez consulter avant ou après la journée",
          "Gare ou ligne de transport si vous vous déplacez surtout en commun",
          "Ville voisine si votre commune offre peu de résultats"
        ]
      },
      {
        title: "Limiter la zone sans la rendre trop étroite",
        paragraphs: [
          "Commencer trop large rend la recherche confuse. Commencer trop étroit peut vous faire passer à côté d’un profil plus adapté. Le bon équilibre consiste à partir d’une zone proche, puis à élargir par cercles successifs.",
          "Dans Paris, raisonner par arrondissement est souvent efficace. En petite couronne, les villes limitrophes peuvent être aussi pertinentes que votre ville exacte."
        ],
        bullets: [
          "Commencez par votre ville ou arrondissement",
          "Ajoutez les communes voisines si les résultats sont trop faibles",
          "Élargissez au département seulement si nécessaire",
          "Gardez en tête le temps de trajet réel"
        ]
      },
      {
        title: "Comparer les informations qui changent vraiment la décision",
        paragraphs: [
          "Une fois quelques profils repérés, comparez les informations qui influencent réellement votre décision: adresse, moyen de contact, possibilité de réserver, présentation de l’accompagnement et clarté générale.",
          "Ne vous arrêtez pas uniquement à la distance. Un profil mieux expliqué ou plus facile à contacter peut être plus pertinent qu’un cabinet légèrement plus proche."
        ]
      },
      {
        title: "Quand prendre contact",
        paragraphs: [
          "Quand deux ou trois profils vous semblent cohérents, le premier contact permet souvent de clarifier les modalités pratiques: disponibilité, type d’accompagnement, durée du rendez-vous ou informations complémentaires.",
          "Si la situation concerne un problème de santé, gardez un cadre clair: la naturopathie ne remplace pas un avis médical ni un suivi par un professionnel de santé."
        ]
      }
    ],
    faq: [
      {
        question: "Quelle page utiliser si je connais seulement ma ville ?",
        answer:
          "Commencez par votre ville, puis ajoutez les communes voisines si les résultats sont trop limités. En Île-de-France, le temps de trajet est souvent plus parlant que la distance."
      },
      {
        question: "Faut-il chercher uniquement dans mon département ?",
        answer:
          "Pas forcément. Selon votre position, une ville d’un département voisin peut être plus accessible qu’une commune éloignée du même département."
      },
      {
        question: "Combien de praticiens comparer ?",
        answer:
          "Comparer trois à cinq praticiens est généralement suffisant pour garder une recherche claire et repérer les profils les plus adaptés."
      }
    ],
    relatedLinks: [
      { href: "/carte", label: "Ouvrir la carte" },
      { href: "/naturopathe-paris", label: "Voir Paris par arrondissement" },
      { href: "/annuaire-naturopathes", label: "Parcourir l’annuaire Île-de-France" }
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
