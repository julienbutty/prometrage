# 🔒 Guide de Sécurité pour Déploiement POC

Ce document explique comment protéger votre application en production sans implémenter d'authentification complète.

## 🛡️ Protections Implémentées

### 1. Rate Limiting ✅ **Déjà Actif**

**Protection automatique contre le spam** - Aucune configuration requise !

#### Limites par défaut :
```typescript
// Upload PDF : 5 uploads par heure par IP
RATE_LIMITS.PDF_UPLOAD = {
  maxRequests: 5,
  windowSeconds: 3600  // 1 heure
}

// Création manuelle : 20 créations par heure par IP
RATE_LIMITS.CREATE = {
  maxRequests: 20,
  windowSeconds: 3600
}

// Lecture : 100 requêtes par minute par IP
RATE_LIMITS.READ = {
  maxRequests: 100,
  windowSeconds: 60
}
```

#### Comportement :
- Limite basée sur l'IP du client (compatible Vercel, Cloudflare)
- Réponse HTTP 429 avec headers `X-RateLimit-*`
- Message utilisateur : "Trop de requêtes. Veuillez réessayer plus tard."
- Reset automatique après la fenêtre de temps

#### Modifier les limites :
Éditer `/src/lib/rate-limit.ts` ligne 90-115

---

## 🔐 Options de Protection Supplémentaires

### Option A : Vercel Password Protection ⭐ **Recommandé pour POC**

**Avantage** : Zéro code, protection complète en 2 minutes.

#### Configuration :
1. Déployer sur Vercel
2. Aller dans **Settings** → **Deployment Protection**
3. Activer **Password Protection**
4. Définir un mot de passe
5. ✅ Toute l'application est protégée !

**Idéal pour** :
- POC interne
- Démo client
- Environnement de staging

**Limitations** :
- Tous les visiteurs doivent entrer le mot de passe
- Pas de gestion utilisateur

---

### Option B : Mot de Passe API (Implémenté)

**Protection légère par mot de passe partagé** - Requiert modification du front-end.

#### 1. Activer la protection

Ajouter dans `.env` (ou Vercel Environment Variables) :
```bash
APP_PASSWORD=votre_secret_ici
```

#### 2. Modifier le front-end pour envoyer le mot de passe

**Méthode 1 : Via FormData (upload PDF)**
```typescript
// src/app/page.tsx ou composant d'upload
const formData = new FormData();
formData.append("file", file);
formData.append("password", "votre_secret_ici"); // ⚠️ Hardcodé ou depuis env

const response = await fetch("/api/upload/pdf", {
  method: "POST",
  body: formData,
});
```

**Méthode 2 : Via Header (plus propre)**
```typescript
const response = await fetch("/api/upload/pdf", {
  method: "POST",
  headers: {
    "X-App-Password": "votre_secret_ici", // ⚠️ Hardcodé ou depuis env
  },
  body: formData,
});
```

**⚠️ Attention** : Le mot de passe sera visible dans le code source JavaScript côté client. C'est une protection légère, **pas de vraie sécurité**.

**Utilisation** :
- Obscurcir légèrement l'accès
- Bloquer les bots basiques
- Complément au rate limiting

---

### Option C : IP Whitelist (Pour usage interne)

Si vous connaissez les IPs qui accèderont à l'app :

#### 1. Créer un middleware IP whitelist
```typescript
// src/lib/ip-whitelist.ts
const ALLOWED_IPS = [
  "123.45.67.89",  // Votre IP bureau
  "98.76.54.32",   // Votre IP maison
];

export function isIPAllowed(ip: string): boolean {
  return ALLOWED_IPS.includes(ip);
}
```

#### 2. Ajouter dans l'endpoint upload
```typescript
// src/app/api/upload/pdf/route.ts
import { isIPAllowed } from "@/lib/ip-whitelist";

// Au début de POST()
if (!isIPAllowed(clientIP)) {
  return NextResponse.json(
    { success: false, error: { code: "FORBIDDEN", message: "IP not allowed" } },
    { status: 403 }
  );
}
```

**Idéal pour** : Application interne, accès depuis un bureau fixe.

---

## 🚀 Recommandations par Scénario

### POC Interne (Équipe uniquement)
```
✅ Vercel Password Protection
✅ Rate Limiting (déjà actif)
```

### Démo Client (Accès restreint)
```
✅ Vercel Password Protection
✅ Rate Limiting (déjà actif)
📧 Envoyer le mot de passe par email
```

### Bêta Publique Limitée
```
✅ Rate Limiting (déjà actif)
✅ Mot de passe API (Option B)
📊 Monitoring Vercel Analytics
```

### Production Réelle
```
❌ Solutions ci-dessus insuffisantes
✅ Authentification complète (NextAuth.js, Clerk, Auth0)
✅ Rate limiting par utilisateur (Redis/Upstash)
✅ CAPTCHA (reCAPTCHA v3)
✅ Monitoring et alertes
```

---

## 📊 Monitoring et Alertes

### Logs Vercel
Surveillez les logs pour détecter :
- Nombreuses erreurs 429 (rate limit)
- Nombreuses erreurs 401 (tentatives de mot de passe)
- Pics de trafic inhabituels

### Alerte de coûts Anthropic
Configurez des alertes dans votre compte Anthropic :
1. Dashboard → Usage
2. Set spending limit
3. Configurer des alertes email

### Variables à surveiller
```bash
# Vercel Dashboard
- Bandwidth usage
- Function invocations
- Function duration

# Anthropic Dashboard
- API calls count
- Tokens consumed
- Monthly spend
```

---

## ✅ Checklist de Déploiement Sécurisé

```markdown
- [ ] Rate limiting activé (déjà fait ✅)
- [ ] ANTHROPIC_API_KEY dans environment variables Vercel
- [ ] DATABASE_URL configuré (Vercel Postgres ou Supabase)
- [ ] Vercel Password Protection activée OU
- [ ] APP_PASSWORD défini + front-end modifié
- [ ] Spending limit défini sur Anthropic
- [ ] Alertes email configurées (Anthropic + Vercel)
- [ ] Logs Vercel vérifiés après déploiement
- [ ] Test de charge basique effectué
```

---

## 🔧 Améliorations Futures

Si le POC évolue vers une vraie application :

1. **Authentification** : NextAuth.js avec OAuth (Google, GitHub)
2. **Rate limiting persistant** : Upstash Redis ou Vercel KV
3. **CAPTCHA** : reCAPTCHA v3 invisible
4. **Quotas utilisateur** : Limites par compte
5. **Audit logs** : Traçabilité des actions
6. **CORS** : Restreindre les domaines autorisés

---

## 📞 Support

En cas de comportement suspect :
1. Vérifier les logs Vercel
2. Vérifier l'usage Anthropic
3. Augmenter temporairement les limites si légitime
4. Bloquer des IPs si nécessaire (via Vercel Edge Config)

## ⚠️ Disclaimer

Les protections implémentées sont **suffisantes pour un POC** mais **pas pour une application en production publique**. Pour une vraie application avec des utilisateurs réels, implémentez une authentification complète.
