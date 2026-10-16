import { supabase } from "@/integrations/supabase/client";

/**
 * Where a user lands right after authenticating (email/password or Google).
 * Shared by `/login` and `/auth/callback` so both flows route identically.
 */

const ONBOARDING_PATHS = [
  "/onboarding/prenoms",
  "/onboarding/evenement",
  "/onboarding/dates",
  "/onboarding/theme",
] as const;

export type PostAuthPath = (typeof ONBOARDING_PATHS)[number] | "/dashboard" | "/dashboard/events";

/**
 * Resolves the destination from the user's weddings:
 *   - 2+ weddings  → the event picker
 *   - 1 wedding    → the onboarding step it stopped at, else the dashboard
 *   - 0 weddings   → the onboarding wizard (the store bootstraps a wedding)
 */
export async function resolvePostAuthPath(userId: string): Promise<PostAuthPath> {
  const { data } = await supabase
    .from("weddings")
    .select("id, onboarding_step, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  const weddings = data ?? [];
  if (weddings.length >= 2) return "/dashboard/events";
  if (weddings.length === 0) return "/onboarding/prenoms";

  const rawStep = weddings[0].onboarding_step as number | null;
  const step =
    Number.isInteger(rawStep) && rawStep !== null && rawStep >= 0 && rawStep <= 4 ? rawStep : 0;
  if (step < 4) return ONBOARDING_PATHS[step as 0 | 1 | 2 | 3];
  return "/dashboard";
}
