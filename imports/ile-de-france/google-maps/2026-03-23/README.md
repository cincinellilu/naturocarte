# Ile-de-France Google Maps 2026-03-23

Preparation de campagne Google Maps pour l'Ile-de-France, en excluant Paris deja traite.

## Perimetre

- Region officielle: Ile-de-France (code 11)
- Departements inclus: 77, 78, 91, 92, 93, 94, 95
- Paris (75) exclu volontairement

## Synthese

- Communes hors Paris couvertes par le plan: 1265
- Requetes Google Maps preparees: 1265
- Fiches actuellement en prod: 243
- Fiches actuellement en prod hors Paris: 1
- Candidats recuperables depuis les exclusions du lot Paris: 0

## Communes par departement

- 77 Seine-et-Marne: 507 communes
- 78 Yvelines: 259 communes
- 91 Essonne: 194 communes
- 92 Hauts-de-Seine: 36 communes
- 93 Seine-Saint-Denis: 39 communes
- 94 Val-de-Marne: 47 communes
- 95 Val-d'Oise: 183 communes

## Fichiers

- `idf-search-plan.tsv`: plan de recherche Google Maps par commune, trie par population au sein de chaque departement.
- `idf-live-non-paris.tsv`: snapshot des fiches deja presentes en prod hors Paris.
- `idf-seed-from-paris-leftovers.tsv`: candidats Ile-de-France recuperes des exclusions du lot Paris et absents de la prod.
- `idf-seed-from-paris-leftovers.json`: meme contenu avec metadonnees source Google Maps.

## Existant hors Paris deja en prod

- adeline-labarre-montrouge | Adeline LABARRE | 22 bis Rue Auber, 92120 Montrouge

## Reliquats utilises depuis le lot Paris

- Aucun candidat exploitable a recuperer depuis les exclusions Paris

## Prochaine etape conseillee

1. Parcourir `idf-search-plan.tsv` par departement.
2. Extraire les resultats Google Maps bruts par communes ou par lots de communes.
3. Rejouer le meme filtrage/dedoublonnage avant import Supabase.
