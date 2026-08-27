import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    const bypassUrl = (() => {
      try {
        return new URL(request.url).pathname;
      } catch {
        return "";
      }
    })();
    if (bypassUrl.startsWith("/lovable/")) {
      return next();
    }

    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);

    // Les appels de fonctions serveur / API doivent recevoir une erreur JSON
    // exploitable par le client, pas une page HTML.
    const path = (() => {
      try {
        return new URL(request.url).pathname;
      } catch {
        return "";
      }
    })();
    if (path.startsWith("/_serverFn") || path.startsWith("/api/")) {
      const message =
        error instanceof Error ? error.message : "Erreur serveur inattendue";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});


export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
