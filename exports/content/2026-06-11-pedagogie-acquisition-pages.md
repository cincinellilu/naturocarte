# Export contenus pédagogie / acquisition

Date d'export : 2026-06-11

Périmètre retenu :
- `/methode`
- `/guides`
- sous-pages de guides :
  - `/guides/comment-choisir-un-naturopathe-a-paris`
  - `/guides/naturopathe-ou-dieteticien-quelles-differences`
  - `/guides/trouver-un-naturopathe-autour-de-moi-en-ile-de-france`

## Vue d'ensemble

Nombre total de pages exportées : 5

Angle éditorial actuel constaté :
- contenu utile mais souvent orienté vers la navigation produit
- renvois fréquents vers la carte, l'annuaire, Paris ou l'espace praticien
- pédagogie présente, mais rarement développée en profondeur
- structure très homogène sur les guides, ce qui facilite une réécriture globale

Pages internes citées depuis ces contenus :
- `/carte`
- `/annuaire-naturopathes`
- `/naturopathe-paris`
- `/praticiens`
- `/a-propos`

## Structure commune des pages guide détail

Source template : `app/guides/[slug]/page.tsx`

Blocs visibles sur chaque guide :
1. Hero
   - breadcrumb
   - eyebrow `Guide NaturoCarte`
   - `h1`
   - intro
   - CTA `Ouvrir la carte`
   - CTA secondaire `Tous les guides`
2. Bloc `En bref`
   - titre fixe `Les gestes utiles`
   - intro fixe : `Gardez la recherche simple: un secteur clair, quelques fiches comparées et un regard factuel sur les informations visibles.`
   - 3 cartes
3. Corps éditorial
   - sections texte
   - listes à puces éventuelles
4. FAQ
5. Bloc `Aller plus loin`
   - liens internes

Cette structure peut être conservée si tu veux seulement refaire les contenus, ou retravaillée si tu veux une pédagogie moins "entonnoir produit".

---

## Page 1

### URL
`/methode`

### Rôle actuel
Page de réassurance sur le fonctionnement du site, la qualité des fiches et la modération.

### Métadonnées
- Title : `Méthode et fiabilité`
- Meta description : `Découvrez comment NaturoCarte structure ses fiches, modère les avis et organise les corrections pour proposer un annuaire clair et fiable.`
- Canonical : `/methode`

### Hero
- Eyebrow : `NaturoCarte`
- H1 : `Méthode et fiabilité`
- Lead : `NaturoCarte organise les fiches pour que l’utilisateur comprenne rapidement ce qu’il regarde, d’où viennent les informations et comment elles peuvent être corrigées ou complétées.`

### Sections visibles

#### Ce que le site affiche
`Le service présente des fiches professionnelles avec les informations utiles pour décider rapidement: nom, localisation, adresse, moyens de contact, site web et, lorsque c'est disponible, prise de rendez-vous, tarifs et avis clients.`

`La logique éditoriale reste volontairement simple: carte, annuaire, pages locales et fiche détaillée. Pas de comparaison artificielle, pas de classement caché.`

#### Comment les fiches sont mises à jour
`Les fiches peuvent évoluer dans le temps. Lorsqu'un praticien crée ou retrouve son espace, les informations de contact et de présentation peuvent être ajustées pour rester exactes.`

`Les modifications sont traitées de manière structurée afin d'éviter les doublons, les imprécisions et les changements incohérents.`

Lien interne affiché :
- `/praticiens` : `Accéder à l’espace praticien`

#### Avis clients
`Les avis déposés via la fiche praticien demandent un email et peuvent contenir un commentaire facultatif. Les avis sont conservés avec une note, une date et un statut de publication avant d'apparaître publiquement.`

`L'objectif est d'offrir un espace lisible et modéré, sans affichage d'informations personnelles inutiles.`

#### Ce que NaturoCarte n’est pas
`NaturoCarte n'est pas un comparateur, n'attribue pas de promesse de résultat et ne remplace pas un avis médical. Le site sert de point d'entrée pour trouver plus vite une fiche claire et utile.`

`Cette approche permet de rester sobre, transparent et cohérent dans le temps.`

#### Aller plus loin
`Si vous voulez comprendre la présentation de l’annuaire, vous pouvez aussi consulter la page À propos ou passer directement à la carte.`

Liens internes affichés :
- `/a-propos`
- `/carte`

### CTA de fin de page
- `/carte` : `Consulter la carte des naturopathes`

### Lecture éditoriale
- page très centrée sur NaturoCarte lui-même
- peu de pédagogie "métier" ou "comment chercher"
- forte logique de réassurance produit

---

## Page 2

### URL
`/guides`

### Rôle actuel
Hub éditorial qui regroupe les guides et redirige rapidement vers les entrées produit principales.

### Métadonnées
- Title : `Guides pratiques`
- Meta description : `Des pages simples pour mieux choisir un naturopathe, comprendre les différences avec la diététique et trouver plus vite une fiche utile.`
- Canonical : `/guides`

### Hero
- Eyebrow : `NaturoCarte`
- H1 : `Guides pratiques`
- Lead : `Des pages utiles pour choisir plus vite, comprendre les différences de positionnement et aller directement vers la carte ou les fiches locales.`

### Sections visibles

#### À lire
- Eyebrow : `À lire`
- Titre : `Trois guides pour mieux chercher`
- Intro : `Chaque guide répond à un besoin concret et renvoie vers la carte, l’annuaire ou les pages locales quand c’est plus utile.`

Guides listés :
1. `Comment choisir un naturopathe à Paris ?`
   - description : `Des repères concrets pour choisir un naturopathe à Paris selon votre besoin, votre secteur et les informations disponibles.`
   - lien : `/guides/comment-choisir-un-naturopathe-a-paris`
2. `Naturopathe ou diététicien : quelles différences ?`
   - description : `Une explication simple pour ne pas confondre accompagnement en hygiène de vie et suivi alimentaire encadré.`
   - lien : `/guides/naturopathe-ou-dieteticien-quelles-differences`
3. `Trouver un naturopathe autour de moi en Île-de-France`
   - description : `Conseils pratiques pour chercher un naturopathe proche de chez soi en Île-de-France sans perdre de temps dans des listes trop larges.`
   - lien : `/guides/trouver-un-naturopathe-autour-de-moi-en-ile-de-france`

#### Pages locales
- Eyebrow : `Pages locales`
- Titre : `Des points d’entrée simples`
- Intro : `Commencez par la carte si vous partez d’une adresse, ou par les pages Paris et Île-de-France si vous voulez filtrer plus vite.`

Blocs listés :
1. `Carte`
   - texte : `La meilleure porte d’entrée quand vous cherchez autour d’une adresse précise.`
   - lien : `/carte`
2. `Paris par arrondissement`
   - texte : `Une vue locale pour comparer rapidement les fiches d’un secteur précis.`
   - lien : `/naturopathe-paris`
3. `Annuaire Île-de-France`
   - texte : `Une vue plus large si vous voulez repartir d’un ensemble de départements.`
   - lien : `/annuaire-naturopathes`

### Lecture éditoriale
- page de hub claire, mais très tournée vers l’orientation vers les outils du site
- pédagogie assez courte
- peu de matière éditoriale autonome

---

## Page 3

### URL
`/guides/comment-choisir-un-naturopathe-a-paris`

### Rôle actuel
Guide de sélection local centré sur Paris.

### Métadonnées
- Title : `Comment choisir un naturopathe à Paris ?`
- Meta description : `Des repères concrets pour choisir un naturopathe à Paris selon votre besoin, votre secteur et les informations disponibles.`
- Canonical : `/guides/comment-choisir-un-naturopathe-a-paris`

### Hero
- H1 : `Comment choisir un naturopathe à Paris ?`
- Intro : `À Paris, l’offre peut vite sembler difficile à comparer. Le plus simple est de partir de votre besoin réel, de limiter la recherche à un secteur pratique, puis de vérifier quelques critères factuels avant de prendre contact.`
- CTA principal : `/carte`
- CTA secondaire : `/guides`

### Bloc En bref
1. `1. Clarifier votre besoin`
   - `Avant de chercher, notez ce que vous attendez: hygiène de vie, alimentation, stress, sommeil ou accompagnement global.`
2. `2. Choisir une zone réaliste`
   - `Un cabinet facile d’accès réduit la friction et augmente vos chances d’aller jusqu’au rendez-vous.`
3. `3. Comparer quelques profils`
   - `Regardez la présentation, les informations pratiques et la cohérence entre votre besoin et l’approche proposée.`

### Sections

#### Commencer par votre besoin, pas par une liste de noms
Paragraphes :
- `La naturopathie peut couvrir des sujets très variés: équilibre alimentaire, énergie, stress, sommeil, digestion, habitudes quotidiennes ou accompagnement de terrain. Tous les praticiens ne mettent pas l’accent sur les mêmes sujets.`
- `Avant de comparer les profils, formulez votre besoin en une phrase simple. Cela vous évite de choisir uniquement sur la proximité ou sur une fiche visuellement plus complète.`

Puces :
- `Quel est le sujet principal de votre recherche ?`
- `Souhaitez-vous un rendez-vous proche de chez vous ou de votre travail ?`
- `Préférez-vous une approche très pratique, pédagogique ou plus globale ?`
- `Avez-vous besoin d’un contact rapide ou d’informations détaillées avant de réserver ?`

#### Vérifier les critères pratiques
Paragraphes :
- `À Paris, la localisation compte beaucoup. Un cabinet situé dans un arrondissement proche mais mal desservi peut être moins pratique qu’un praticien un peu plus éloigné mais facile d’accès.`
- `Regardez aussi la facilité de prise de contact: téléphone, email, site web ou lien de réservation. Plus l’information est claire, plus vous pouvez avancer sans perdre de temps.`

Puces :
- `Adresse et arrondissement`
- `Temps de trajet réaliste`
- `Moyen de contact disponible`
- `Lien de réservation ou site web si vous voulez en savoir plus`

#### Lire la présentation avec prudence
Paragraphes :
- `Une présentation claire aide à comprendre l’approche du praticien, mais elle ne doit pas être lue comme une garantie de résultat. Elle sert surtout à voir si le ton, la méthode et les sujets abordés correspondent à votre recherche.`
- `Méfiez-vous des promesses trop fortes ou des formulations qui ressemblent à un engagement de guérison. Pour une situation médicale, un suivi ou un avis professionnel de santé reste prioritaire.`

#### Comparer sans se disperser
Paragraphes :
- `Le bon réflexe n’est pas d’ouvrir toutes les fiches disponibles, mais d’en sélectionner trois à cinq dans une zone cohérente. Vous pouvez ensuite comparer les informations factuelles et garder les profils les plus lisibles.`
- `Si aucun profil ne vous semble adapté, élargissez progressivement: arrondissement voisin, ville limitrophe, puis département.`

### FAQ
1. `Faut-il choisir le naturopathe le plus proche ?`
   - `Pas forcément. La proximité est importante, mais elle doit être croisée avec la clarté de la présentation, les moyens de contact et l’adéquation avec votre besoin.`
2. `Combien de fiches faut-il ouvrir ?`
   - `Trois à cinq profils suffisent souvent pour comparer correctement sans se disperser. Au-delà, il devient plus difficile de garder une lecture claire.`
3. `Que regarder en premier ?`
   - `Commencez par le besoin, l’adresse, les moyens de contact et la présentation de l’accompagnement. Ce sont les repères les plus utiles avant un premier contact.`

### Aller plus loin
- `/naturopathe-paris` : `Voir les pages Paris par arrondissement`
- `/carte` : `Ouvrir la carte`
- `/annuaire-naturopathes` : `Consulter l’annuaire Île-de-France`

### Lecture éditoriale
- contenu utile et plutôt pédagogique
- angle très "recherche de fiche"
- pédagogie davantage orientée parcours utilisateur que compréhension de la naturopathie ou critères de choix approfondis

---

## Page 4

### URL
`/guides/naturopathe-ou-dieteticien-quelles-differences`

### Rôle actuel
Guide comparatif de clarification entre deux types d’accompagnement.

### Métadonnées
- Title : `Naturopathe ou diététicien : quelles différences ?`
- Meta description : `Une explication simple pour ne pas confondre accompagnement en hygiène de vie et suivi alimentaire encadré.`
- Canonical : `/guides/naturopathe-ou-dieteticien-quelles-differences`

### Hero
- H1 : `Naturopathe ou diététicien : quelles différences ?`
- Intro : `Les deux métiers peuvent parler d’alimentation, mais ils ne répondent pas au même besoin. La bonne approche dépend surtout de ce que vous cherchez: accompagnement global, conseils d’hygiène de vie ou suivi plus orienté alimentation et santé.`
- CTA principal : `/carte`
- CTA secondaire : `/guides`

### Bloc En bref
1. `Naturopathe`
   - `Accompagnement autour du bien-être, de l’hygiène de vie et des habitudes du quotidien.`
2. `Diététicien`
   - `Approche centrée sur l’alimentation et le cadre nutritionnel, avec un positionnement de santé plus structuré.`
3. `Le bon réflexe`
   - `Choisissez selon votre besoin réel, puis vérifiez toujours la fiche et le parcours du professionnel.`

### Sections

#### En pratique, ce n’est pas le même rôle
Paragraphes :
- `Un naturopathe est généralement recherché pour un accompagnement plus large autour de l’hygiène de vie, de l’organisation du quotidien et du bien-être.`
- `Un diététicien intervient dans un cadre plus orienté alimentation et suivi nutritionnel. Si votre situation est médicale ou complexe, l’avis d’un professionnel de santé reste la base.`

Puces :
- `Naturopathe: hygiène de vie, équilibre du quotidien, accompagnement global`
- `Diététicien: alimentation, besoins nutritionnels, suivi structuré`
- `Situation médicale: prioriser le bon interlocuteur de santé avant tout`

#### Comment choisir selon votre besoin
Paragraphes :
- `Si vous cherchez surtout des repères concrets pour mieux organiser votre hygiène de vie, une fiche de naturopathe peut suffire à démarrer.`
- `Si vous cherchez un suivi alimentaire plus cadré, regardez plutôt la spécialité et le positionnement du professionnel avant de prendre contact.`

#### Ce que NaturoCarte vous aide à faire
Paragraphes :
- `NaturoCarte ne tranche pas à votre place. Le site vous aide à comparer les fiches, les coordonnées et les zones de présence pour vous orienter plus vite vers le bon profil.`
- `L’important reste de garder une recherche simple, lisible et adaptée à votre besoin réel.`

### FAQ
1. `Peut-on consulter un naturopathe et un diététicien ?`
   - `Oui, si vos besoins sont différents. L’essentiel est de ne pas mélanger les rôles et de garder un interlocuteur adapté à chaque sujet.`
2. `Un naturopathe remplace-t-il un avis médical ?`
   - `Non. La naturopathie peut accompagner une démarche de bien-être et d’hygiène de vie, mais ne remplace pas un suivi médical.`
3. `Comment lire une fiche sur NaturoCarte ?`
   - `Concentrez-vous sur les informations factuelles: adresse, contact, zone de présence et manière dont le praticien présente son accompagnement.`

### Aller plus loin
- `/carte` : `Trouver un professionnel sur la carte`
- `/naturopathe-paris` : `Explorer Paris par arrondissement`
- `/annuaire-naturopathes` : `Parcourir l’Île-de-France`

### Lecture éditoriale
- c’est la page la plus pédagogique du lot sur le fond
- la fin rebascule vers l’usage du produit
- bon candidat pour être approfondi avec davantage de pédagogie métier et de cas d’usage

---

## Page 5

### URL
`/guides/trouver-un-naturopathe-autour-de-moi-en-ile-de-france`

### Rôle actuel
Guide de recherche locale à l’échelle Île-de-France.

### Métadonnées
- Title : `Trouver un naturopathe autour de moi en Île-de-France`
- Meta description : `Conseils pratiques pour chercher un naturopathe proche de chez soi en Île-de-France sans perdre de temps dans des listes trop larges.`
- Canonical : `/guides/trouver-un-naturopathe-autour-de-moi-en-ile-de-france`

### Hero
- H1 : `Trouver un naturopathe autour de moi en Île-de-France`
- Intro : `En Île-de-France, la proximité ne se résume pas à une distance en kilomètres. Le temps de trajet, les transports, les horaires et la facilité de contact comptent autant que l’adresse du cabinet.`
- CTA principal : `/carte`
- CTA secondaire : `/guides`

### Bloc En bref
1. `1. Partir d’un point concret`
   - `Utilisez votre domicile, votre lieu de travail ou une gare pratique comme point de départ.`
2. `2. Raisonner en temps de trajet`
   - `Un praticien à 6 km peut être plus accessible qu’un cabinet à 2 km si les transports sont plus directs.`
3. `3. Garder une comparaison simple`
   - `Sélectionnez quelques profils proches et vérifiez les informations essentielles avant de contacter.`

### Sections

#### Définir ce que veut dire “autour de moi”
Paragraphes :
- `En Île-de-France, une recherche locale doit tenir compte de votre quotidien. Le bon périmètre n’est pas toujours la ville la plus proche, mais la zone que vous pouvez rejoindre facilement.`
- `Avant de comparer les praticiens, choisissez votre point de départ: domicile, travail, école, gare ou ligne de transport habituelle.`

Puces :
- `Domicile si vous cherchez un rendez-vous près de chez vous`
- `Lieu de travail si vous voulez consulter avant ou après la journée`
- `Gare ou ligne de transport si vous vous déplacez surtout en commun`
- `Ville voisine si votre commune offre peu de résultats`

#### Limiter la zone sans la rendre trop étroite
Paragraphes :
- `Commencer trop large rend la recherche confuse. Commencer trop étroit peut vous faire passer à côté d’un profil plus adapté. Le bon équilibre consiste à partir d’une zone proche, puis à élargir par cercles successifs.`
- `Dans Paris, raisonner par arrondissement est souvent efficace. En petite couronne, les villes limitrophes peuvent être aussi pertinentes que votre ville exacte.`

Puces :
- `Commencez par votre ville ou arrondissement`
- `Ajoutez les communes voisines si les résultats sont trop faibles`
- `Élargissez au département seulement si nécessaire`
- `Gardez en tête le temps de trajet réel`

#### Comparer les informations qui changent vraiment la décision
Paragraphes :
- `Une fois quelques profils repérés, comparez les informations qui influencent réellement votre décision: adresse, moyen de contact, possibilité de réserver, présentation de l’accompagnement et clarté générale.`
- `Ne vous arrêtez pas uniquement à la distance. Un profil mieux expliqué ou plus facile à contacter peut être plus pertinent qu’un cabinet légèrement plus proche.`

#### Quand prendre contact
Paragraphes :
- `Quand deux ou trois profils vous semblent cohérents, le premier contact permet souvent de clarifier les modalités pratiques: disponibilité, type d’accompagnement, durée du rendez-vous ou informations complémentaires.`
- `Si la situation concerne un problème de santé, gardez un cadre clair: la naturopathie ne remplace pas un avis médical ni un suivi par un professionnel de santé.`

### FAQ
1. `Quelle page utiliser si je connais seulement ma ville ?`
   - `Commencez par votre ville, puis ajoutez les communes voisines si les résultats sont trop limités. En Île-de-France, le temps de trajet est souvent plus parlant que la distance.`
2. `Faut-il chercher uniquement dans mon département ?`
   - `Pas forcément. Selon votre position, une ville d’un département voisin peut être plus accessible qu’une commune éloignée du même département.`
3. `Combien de praticiens comparer ?`
   - `Comparer trois à cinq praticiens est généralement suffisant pour garder une recherche claire et repérer les profils les plus adaptés.`

### Aller plus loin
- `/carte` : `Ouvrir la carte`
- `/naturopathe-paris` : `Voir Paris par arrondissement`
- `/annuaire-naturopathes` : `Parcourir l’annuaire Île-de-France`

### Lecture éditoriale
- guide utile et concret
- forte logique d’orientation vers les pages de recherche
- pédagogie présente, mais encore très liée au fonctionnement du site

