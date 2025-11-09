# 🚀 Guide de déploiement Prometrage sur Vercel

Ce guide détaille le déploiement de Prometrage sur Vercel avec base de données Neon PostgreSQL.

## 📋 Prérequis

- Compte GitHub avec le repo Prometrage
- Compte Vercel (gratuit) - https://vercel.com
- Compte Neon (gratuit) - https://neon.tech
- Clé API Anthropic (déjà utilisée en développement)

---

## 1️⃣ Configuration de la base de données Neon

### Créer le projet Neon

1. **Se connecter à Neon**: https://console.neon.tech
2. **Créer un nouveau projet**:
   - Nom: `prometrage-production`
   - Région: Europe (Germany) ou US East (selon proximité clients)
   - PostgreSQL version: 16 (dernière stable)

3. **Récupérer la `DATABASE_URL`**:
   - Dans le dashboard Neon, onglet "Connection String"
   - Copier la **Pooled connection** (recommandée pour serverless)
   - Format: `postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/prometrage?sslmode=require`

4. **Garder cette URL secrète** - tu en auras besoin pour Vercel

---

## 2️⃣ Configuration de Vercel

### Créer et connecter le projet

1. **Se connecter à Vercel**: https://vercel.com/dashboard
2. **Importer le projet**:
   - Cliquer "Add New..." → "Project"
   - Connecter GitHub si pas déjà fait
   - Sélectionner le repo `prometrage`
   - Cliquer "Import"

3. **Configuration du projet**:
   - Framework Preset: **Next.js** (détecté automatiquement)
   - Root Directory: `./` (par défaut)
   - Build Command: (laisser vide, utilise `vercel.json`)
   - Output Directory: `.next` (défaut Next.js)

### Configurer les variables d'environnement

1. **Dans Vercel, onglet "Environment Variables"**:

   | Variable | Valeur | Environment |
   |----------|--------|-------------|
   | `DATABASE_URL` | `postgresql://user:pass@...neon.tech/prometrage?sslmode=require` | Production, Preview, Development |
   | `ANTHROPIC_API_KEY` | `sk-ant-api03-xxx...` (ta clé actuelle) | Production, Preview |

2. **Variables optionnelles** (pour ajuster le parsing IA):
   ```
   AI_PARSING_MAX_RETRIES=3
   AI_PARSING_MIN_CONFIDENCE=0.7
   AI_PARSING_TIMEOUT=30000
   ```

3. **Cliquer "Save"** après chaque variable

### Déployer

1. **Cliquer "Deploy"**
2. **Attendre la compilation** (2-3 minutes)
   - Vercel va:
     - Installer les dépendances npm
     - Générer Prisma Client
     - Compiler Next.js avec Turbopack
     - Déployer sur le CDN global

3. **Une fois déployé**:
   - Vercel affiche l'URL: `https://prometrage.vercel.app` (ou similaire)
   - Cliquer "Visit" pour voir le site

---

## 3️⃣ Initialiser la base de données

### Exécuter les migrations Prisma

**Option A - Via Vercel CLI** (recommandé):
```bash
# Installer Vercel CLI si pas déjà fait
npm i -g vercel

# Se connecter
vercel login

# Exécuter les migrations en production
vercel env pull .env.production  # Télécharge les env vars
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

**Option B - Depuis Neon SQL Editor** (manuel):
```sql
-- Se connecter au SQL Editor de Neon
-- Copier/coller le schéma de prisma/migrations/xxx_init/migration.sql
-- Exécuter le script SQL
```

**Option C - Via GitHub Actions** (automatique):
- Un workflow `.github/workflows/deploy.yml` peut automatiser ça
- (Non configuré par défaut pour ce POC)

---

## 4️⃣ Protection par mot de passe (pour démo client)

### Activer Vercel Deployment Protection

1. **Dans Vercel, Settings → Deployment Protection**
2. **Activer "Password Protection"**:
   - Mode: "All Deployments"
   - Mot de passe: choisir un mot de passe simple pour tes clients
   - Exemple: `demo2025` ou `normabaie123`

3. **Partager avec clients**:
   - URL: `https://prometrage.vercel.app`
   - Mot de passe: `demo2025`

**Note**: Tous les visiteurs devront entrer ce mot de passe avant d'accéder au site.

---

## 5️⃣ Tests post-déploiement

### Checklist de validation

- [ ] **Accès au site**: `https://prometrage.vercel.app` s'affiche correctement
- [ ] **Upload PDF**: Tester avec un PDF Normabaie
- [ ] **Parsing IA**: Vérifier que les données sont extraites
- [ ] **Formulaire menuiserie**: Modifier des valeurs, enregistrer
- [ ] **Génération bon de commande**: Télécharger un PDF
- [ ] **Navigation**: Tester le workflow complet
- [ ] **Performance**: Vérifier les temps de chargement

### En cas de problème

**Logs en temps réel**:
```bash
vercel logs --follow
```

**Logs dans Vercel Dashboard**:
- Onglet "Deployments" → Dernier déploiement → "View Function Logs"

**Erreurs communes**:
- `Prisma Client not found`: Vérifier que `buildCommand` dans `vercel.json` contient `prisma generate`
- `DATABASE_URL not set`: Vérifier les variables d'environnement
- `Timeout on PDF generation`: Augmenter `maxDuration` dans `vercel.json`

---

## 6️⃣ Optimisations post-déploiement (optionnel)

### Domaine personnalisé

1. **Acheter un domaine** (ex: `prometrage.fr`)
2. **Dans Vercel, Settings → Domains**:
   - Ajouter le domaine
   - Configurer les DNS selon les instructions Vercel

### Analytics

1. **Activer Vercel Analytics** (gratuit):
   - Settings → Analytics → Enable
   - Voir les stats de trafic, performance, Core Web Vitals

### Monitoring

1. **Sentry pour error tracking** (optionnel):
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

---

## 🔄 Mises à jour futures

### Déploiement automatique (déjà configuré)

Chaque `git push` sur la branche `main` déclenchera un nouveau déploiement automatique sur Vercel.

**Workflow**:
1. Développer en local
2. Tester avec `npm run dev`
3. Commit et push sur GitHub
4. Vercel détecte le push et redéploie automatiquement
5. Nouveau site en ligne en 2-3 minutes

### Rollback en cas d'erreur

1. **Dans Vercel, onglet "Deployments"**
2. **Trouver le déploiement précédent stable**
3. **Cliquer "..." → "Promote to Production"**
4. **Retour instantané à la version stable**

---

## 📊 Limites du plan gratuit

### Vercel (Hobby)
- ✅ 100 GB bande passante/mois (largement suffisant)
- ✅ Déploiements illimités
- ✅ 1 équipe (toi uniquement)
- ⚠️ Pas de collaboration (inviter d'autres devs = plan Pro)
- ⚠️ Timeout max 60s par fonction (sauf bons-commande = 300s configuré)

### Neon (Free Tier)
- ✅ 512 MB stockage (≈ 50 000 menuiseries)
- ✅ 1 projet actif
- ✅ 10 branches (pour tests)
- ⚠️ Pas de backup automatique (faire exports manuels)
- ⚠️ Après 7 jours d'inactivité → mise en veille (réveil automatique au premier accès)

### Anthropic API
- 💰 Coût selon usage réel
- Estimation pour démo: ~0,10€ par PDF parsé (Claude Sonnet 4.5)
- Surveiller via https://console.anthropic.com/usage

---

## 🆘 Support

### Problèmes de déploiement
- Vérifier les logs Vercel: `vercel logs`
- Consulter la doc Vercel: https://vercel.com/docs

### Problèmes de base de données
- SQL Editor Neon pour debugger: https://console.neon.tech
- Doc Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

### Problèmes de PDF generation
- Vérifier que `@sparticuz/chromium` est bien installé
- Logs de la fonction: Vercel Dashboard → Function Logs

---

## ✅ Résumé des URLs importantes

| Service | URL |
|---------|-----|
| **Site de production** | https://prometrage.vercel.app |
| **Dashboard Vercel** | https://vercel.com/dashboard |
| **Console Neon** | https://console.neon.tech |
| **Anthropic Console** | https://console.anthropic.com |
| **Logs en temps réel** | `vercel logs --follow` |

---

**Prêt pour la production !** 🎉

Si tu rencontres des problèmes, vérifie d'abord les logs Vercel et Neon.
