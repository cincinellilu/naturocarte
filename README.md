# NaturoCarte

Socle Next.js (TypeScript + App Router) SEO-ready pour un annuaire cartographique de naturopathes.

## Prerequis

- Node.js 18.17+ (recommande: Node.js 20 LTS)
- npm 9+

## Installation

```bash
npm install
npm i @supabase/supabase-js
npm i mapbox-gl
```

## Lancer en developpement

```bash
npm run dev
```

Le site sera disponible sur `http://localhost:3000`.

## Build de production

```bash
npm run build
```

## Lancer la version production

```bash
npm run start
```

## Variables d'environnement

Copier `.env.local.example` vers `.env.local` et adapter:

```bash
cp .env.local.example .env.local
```

Variables:

- `NEXT_PUBLIC_SITE_URL` : URL publique du site (ex: `https://www.naturocarte.fr`)
  - fallback automatique: `http://localhost:3000`
- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé anonyme du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : clé serveur Supabase (uniquement pour les routes API backend)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` : token public Mapbox (obligatoire pour afficher la carte)

## Ce qui est en place

- Projet Next.js TypeScript avec App Router
- Pages placeholders:
  - `/`
  - `/carte`
  - `/a-propos`
  - `/praticiens`
- Layout global minimal:
  - Header avec navigation
  - Footer simple
- SEO global (`app/layout.tsx`):
  - template de titre
  - description par defaut
  - OpenGraph minimal
- SEO technique:
  - `robots.txt` via `app/robots.ts`
  - `sitemap.xml` via `app/sitemap.ts`
  - base URL via `NEXT_PUBLIC_SITE_URL` (fallback localhost)
- Page pilier SEO `/carte` avec:
  - H1 cible
  - paragraphe HTML rendu serveur
  - liste UL/LI SSR issue de Supabase (table `practitioners`, `status = 'published'`)
  - fallback: `Aucun praticien referencie pour le moment.`
  - composant carte Mapbox client-only (sans pins dynamiques pour l'instant)
- Endpoint bonus: `/api/health` renvoie `{ "ok": true }`
