# Deploiement Infomaniak (Next.js App Router SSR)

## 1) Methode a choisir dans ton panel
- Recommande (MVP fiable): `Git`
- A eviter pour un workflow propre: `SFTP` / `Importation d'une archive` (pas de versionning)
- `SSH` utile pour maintenance manuelle, pas comme methode principale de livraison

## 2) Pre-requis projet
Variables a configurer en production:
- `NEXT_PUBLIC_SITE_URL=https://naturocarte.fr`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...` (necessaire pour `app/api/lead-practitioner/route.ts`)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...`
- `NODE_ENV=production`
- `PORT=3000` (ou le port impose par la plateforme)

## 3) Build et demarrage
Commandes:
```bash
npm ci
npm run build
npm run start:prod
```

Le script `start:prod` bind en `0.0.0.0` et utilise `PORT`.

## 4) Verification rapide post-deploiement
- `/api/health` -> doit renvoyer `{"ok": true}`
- `/robots.txt` -> doit pointer vers le vrai domaine
- `/sitemap.xml` -> URLs en `https://naturocarte.fr/...` (pas localhost)
- `/naturopathe/slug-inexistant` -> HTTP 404

## 5) Pieges frequents
- `NEXT_PUBLIC_SITE_URL` oubliee ou en localhost
- token Mapbox non restreint au domaine prod
- `SUPABASE_SERVICE_ROLE_KEY` absent alors que la route API en depend
- app lancee sans `-H 0.0.0.0` donc inaccessible derriere proxy
