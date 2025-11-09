/**
 * Rate limiting simple en mémoire pour POC
 * Pour production, utiliser Upstash Redis ou Vercel KV
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store en mémoire (réinitialisé au redémarrage du serveur)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Nettoyer les anciennes entrées toutes les 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

interface RateLimitConfig {
  /**
   * Nombre maximum de requêtes autorisées dans la fenêtre
   */
  maxRequests: number;
  /**
   * Fenêtre de temps en secondes
   */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Vérifie si une requête est autorisée selon le rate limit
 * @param identifier - Identifiant unique (IP, user ID, etc.)
 * @param config - Configuration du rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // Récupérer ou créer l'entrée
  let entry = rateLimitStore.get(identifier);

  // Si pas d'entrée ou fenêtre expirée, créer une nouvelle
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, entry);
  }

  // Incrémenter le compteur
  entry.count++;

  const success = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: Math.ceil(entry.resetAt / 1000), // Unix timestamp en secondes
  };
}

/**
 * Extrait l'IP de la requête (compatible Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  // Essayer différents headers dans l'ordre de priorité
  const headers = request.headers;

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Prendre la première IP (client réel)
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Fallback
  return "unknown";
}

/**
 * Rate limits prédéfinis pour différents endpoints
 */
export const RATE_LIMITS = {
  /**
   * Upload PDF : 5 uploads par heure par IP
   * Le plus strict car coûteux (API Claude)
   */
  PDF_UPLOAD: {
    maxRequests: 5,
    windowSeconds: 60 * 60, // 1 heure
  },

  /**
   * Création manuelle : 20 créations par heure
   */
  CREATE: {
    maxRequests: 20,
    windowSeconds: 60 * 60, // 1 heure
  },

  /**
   * Lecture : 100 requêtes par minute
   */
  READ: {
    maxRequests: 100,
    windowSeconds: 60, // 1 minute
  },
} as const;
