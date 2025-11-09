/**
 * Authentification simple par mot de passe pour POC
 * Alternative légère sans JWT/session pour protéger les endpoints sensibles
 */

/**
 * Vérifie le mot de passe d'accès simple
 * Le mot de passe est stocké en variable d'environnement
 *
 * @param password - Mot de passe fourni par le client
 * @returns true si le mot de passe est correct
 */
export function verifySimplePassword(password: string | null): boolean {
  const expectedPassword = process.env.APP_PASSWORD;

  // Si pas de mot de passe configuré, accès autorisé (développement)
  if (!expectedPassword) {
    console.warn(
      "[AUTH] APP_PASSWORD not configured - access granted by default"
    );
    return true;
  }

  // Vérifier le mot de passe
  return password === expectedPassword;
}

/**
 * Extrait le mot de passe depuis les headers ou le body
 * Supporte :
 * - Header: X-App-Password
 * - Body: { password: "..." }
 */
export async function extractPassword(request: Request): Promise<string | null> {
  // 1. Essayer le header
  const headerPassword = request.headers.get("x-app-password");
  if (headerPassword) {
    return headerPassword;
  }

  // 2. Essayer le body (si POST/PUT/PATCH)
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.method !== "DELETE"
  ) {
    try {
      // Clone pour éviter de consommer le body
      const clonedRequest = request.clone();
      const contentType = request.headers.get("content-type");

      // Seulement si JSON
      if (contentType?.includes("application/json")) {
        const body = await clonedRequest.json();
        if (body && typeof body.password === "string") {
          return body.password;
        }
      }

      // Si FormData (pour upload)
      if (contentType?.includes("multipart/form-data")) {
        const formData = await clonedRequest.formData();
        const password = formData.get("password");
        if (typeof password === "string") {
          return password;
        }
      }
    } catch (error) {
      // Ignore les erreurs de parsing
      console.error("[AUTH] Error parsing request for password:", error);
    }
  }

  return null;
}

/**
 * Middleware helper pour protéger un endpoint
 * Retourne une Response d'erreur si non autorisé, null sinon
 */
export async function requirePassword(request: Request): Promise<Response | null> {
  const password = await extractPassword(request);

  if (!verifySimplePassword(password)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Mot de passe requis ou invalide",
        },
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Password realm="Application"',
        },
      }
    );
  }

  return null; // Autorisé
}
