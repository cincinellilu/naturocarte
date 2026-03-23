# Paris Google Maps 2026-03-20

Ce dossier rattache au repo NaturoCarte les fichiers de travail produits dans l'ancien workspace:

- `/Users/lucas/Sites/dev.charlotteBayard/imports/naturocarte-paris-google-maps-2026-03-20.tsv`
- `/Users/lucas/Sites/dev.charlotteBayard/imports/naturocarte-paris-google-maps-2026-03-20.json`
- `/Users/lucas/Sites/dev.charlotteBayard/imports/naturocarte-paris-google-maps-2026-03-20-exclusions-recovered.tsv`
- `/Users/lucas/Sites/dev.charlotteBayard/imports/naturocarte-paris-google-maps-2026-03-20-manual-keeps.tsv`

Les noms d'origine ont ete conserves ici pour garder une tracabilite directe avec le lot initial.

## Contenu

- `naturocarte-paris-google-maps-2026-03-20.tsv`: lot principal, `203` lignes de praticiens.
- `naturocarte-paris-google-maps-2026-03-20.json`: export JSON du meme lot principal, `203` objets.
- `naturocarte-paris-google-maps-2026-03-20-exclusions-recovered.tsv`: `27` fiches sorties des exclusions puis recuperees.
- `naturocarte-paris-google-maps-2026-03-20-manual-keeps.tsv`: `3` fiches conservees manuellement.
- Les artefacts de revue utilises pour la suite du travail sont aussi archives ici:
  - `...-raw.json`
  - `...-review.json`
  - `...-exclusions-remaining.tsv`
  - `...-exclusions-remaining-import-view.tsv`
  - leurs variantes `.json` associees

Total des slugs uniques archives: `233`.

## Etat de rapprochement au 2026-03-23

Rapprochement effectue avec la table Supabase `practitioners` du bon projet, sur les fiches `status = 'published'`.

- Fiches publiees en prod: `243`
- Lignes du lot principal retrouvees en prod: `202 / 203`
- `exclusions_recovered` retrouvees en prod: `27 / 27`
- `manual_keeps` retrouvees en prod: `3 / 3`
- Fiches prod absentes des fichiers archives: `11`
- Lignes archivees absentes de la prod par slug: `1`

Conclusion actuelle:

- Le lot de mars a deja ete largement integre en prod.
- Les `manual_keeps` et `exclusions_recovered` ne doivent pas etre reimportes aveuglement: ils sont deja presents.
- Les `11` fiches prod absentes des fichiers archives sont surtout de l'historique preexistant a ce lot.
- Le seul ecart cote lot archive ressemble a un renommage ou enrichissement de slug.

## Points identifies

Probable renommage/enrichissement:

- `a-legrand-paris-14` (archive) -> `adeline-legrand-paris-14` (prod)

Fiches publiees en prod mais absentes des fichiers archives:

- `anne-guillerme-paris-17` (`created_at=2026-02-09T21:34:47.377803`)
- `christophe-etienne-paris-17` (`created_at=2026-02-09T21:46:58.304664`)
- `vanessa-lopez-paris-17` (`created_at=2026-02-09T21:48:23.229104`)
- `marine-merle-paris-17` (`created_at=2026-02-09T21:50:40.947642`)
- `houda-dafir-paris-17` (`created_at=2026-02-09T21:52:55.345860`)
- `loic-ternisien-paris-9` (`created_at=2026-02-09T21:54:33.054144`)
- `stephanie-carez-duriez-paris-17` (`created_at=2026-02-09T21:56:05.307623`)
- `sarah-zipper-paris-17` (`created_at=2026-02-09T21:57:50.602284`)
- `pauline-moulin-paris-8` (`created_at=2026-02-09T21:59:53.041839`)
- `julien-lei-wang-paris-17` (`created_at=2026-02-09T22:01:47.306632`)
- `adeline-legrand-paris-14` (`created_at=2026-03-20T12:58:25.858782`)

## Workflow conseille

1. Utiliser ces fichiers comme archive locale et reference de lot, pas comme source a reimporter en bloc.
2. Lancer `npm run imports:reconcile:paris` pour revalider l'ecart entre l'archive et Supabase.
3. Pour une reprise de travail, cibler uniquement les deltas ou corrections encore ouvertes dans la base courante.
