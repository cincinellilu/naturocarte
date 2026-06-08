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
- `SUPABASE_SERVICE_ROLE_KEY=...` (necessaire pour les routes serveur Supabase: dashboard praticien, avis, favoris, stats)
- `ADMIN_PROSPECTS_PASSWORD=...` (optionnel: override le mot de passe embarqué pour `/admin/prospects`)
- `RESEND_API_KEY=...` (necessaire pour les magic links et l’outil `/admin/emailing`)
- `CONTACT_FROM_EMAIL=NaturoCarte <bonjour@naturocarte.fr>` (recommande pour centraliser l’expediteur)
- `RESEND_WEBHOOK_SECRET=...` (necessaire pour verifier `/api/resend/webhook` et suivre delivered/opened/clicked/bounced)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...`
- `STRIPE_SECRET_KEY=...`
- `STRIPE_VISIBILITY_PRICE_ID=...` (Price Stripe mensuel du forfait Visibilite+)
- `STRIPE_WEBHOOK_SECRET=...` (secret du webhook Stripe vers `/api/stripe/webhook`)
- `NODE_ENV=production`
- `PORT=3000` (ou le port impose par la plateforme)

## 3) Build et demarrage
Commandes:
```bash
set -a && . ./.env.production && set +a && npm ci
set -a && . ./.env.production && set +a && npm run build
set -a && . ./.env.production && set +a && PORT=3000 npm run start:prod
```

Le script `start:prod` bind en `0.0.0.0` et utilise `PORT`.
Le script `build` nettoie `.next` avant compilation. Apres un deploiement, redemarrer le process Node pour eviter qu'un ancien serveur conserve des references vers des chunks CSS/JS qui n'existent plus.

Si ton panel impose une seule commande de build, utilise plutot:
```bash
git checkout -- package-lock.json && git pull --ff-only origin main && set -a && . ./.env.production && set +a && npm ci && npm run build
```

Si ton panel impose une seule commande de demarrage, utilise plutot:
```bash
set -a && . ./.env.production && set +a && PORT=3000 npm run start:prod
```

## 4) Verification rapide post-deploiement
- `/api/health` -> doit renvoyer `{"ok": true}`
- Stripe webhook -> doit pointer vers `https://naturocarte.fr/api/stripe/webhook`
- Resend webhook -> doit pointer vers `https://naturocarte.fr/api/resend/webhook`
- `/robots.txt` -> doit pointer vers le vrai domaine
- `/sitemap.xml` -> URLs en `https://naturocarte.fr/...` (pas localhost)
- `/naturopathe/slug-inexistant` -> HTTP 404

## 5) Pieges frequents
- `NEXT_PUBLIC_SITE_URL` oubliee ou en localhost
- token Mapbox non restreint au domaine prod
- `SUPABASE_SERVICE_ROLE_KEY` absent alors que la route API en depend
- `RESEND_WEBHOOK_SECRET` absent: les emails partent mais l’admin emailing ne voit ni ouvertures ni clics ni bounces
- tracking Resend non active sur le domaine: pas d’evenements `opened` / `clicked`
- app lancee sans `-H 0.0.0.0` donc inaccessible derriere proxy
- process Node non redemarre apres build: HTML servi avec d'anciens chemins `/_next/static/...`
- ne pas charger `.env.production` avec `env $(grep -v '^#' .env.production | xargs)`: cette forme casse des valeurs contenant des espaces, guillemets ou chevrons, comme `CONTACT_FROM_EMAIL="NaturoCarte <connexion@naturocarte.fr>"`
