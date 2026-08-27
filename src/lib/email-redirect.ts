/**
 * All auth links must land on the canonical production domain.
 * Supabase builds confirmation URLs using the project Site URL, which can be
 * a *.lovable.app host. We rewrite the `redirect_to` parameter so every email
 * link (reset password, magic link, signup confirmation…) comes back to
 * moninvit.com and nowhere else.
 */
export const CANONICAL_SITE_URL = "https://moninvit.com";

const DEFAULT_PATHS: Record<string, string> = {
  signup: "/verify-email",
  invite: "/reset-password",
  magiclink: "/dashboard",
  recovery: "/reset-password",
  email_change: "/app/profile",
  reauthentication: "/dashboard",
};

export function canonicalizeAuthUrl(rawUrl: string, actionType: string): string {
  const fallbackPath = DEFAULT_PATHS[actionType] ?? "/";
  try {
    const url = new URL(rawUrl);
    const current = url.searchParams.get("redirect_to");
    let path = fallbackPath;
    if (current) {
      try {
        const parsed = new URL(current, CANONICAL_SITE_URL);
        path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        if (!path || path === "/") path = fallbackPath;
      } catch {
        path = fallbackPath;
      }
    }
    url.searchParams.set("redirect_to", `${CANONICAL_SITE_URL}${path}`);
    return url.toString();
  } catch {
    return `${CANONICAL_SITE_URL}${fallbackPath}`;
  }
}
