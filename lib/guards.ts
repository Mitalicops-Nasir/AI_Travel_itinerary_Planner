import { currentUser } from "@/lib/auth";
import { ExtendedUser } from "@/next-auth";

export type AuthenticatedUser = ExtendedUser & { id: string };

export type GuardResult =
  | { user: AuthenticatedUser; error: null }
  | { user: null; error: string };

export async function requireUser(
  message = "You must be logged in."
): Promise<GuardResult> {
  const user = await currentUser();

  if (!user?.id) {
    return { user: null, error: message };
  }

  return { user: user as AuthenticatedUser, error: null };
}

export async function requireAdmin(
  message = "Admin access required."
): Promise<GuardResult> {
  const result = await requireUser(message);

  if (!result.user) {
    return result;
  }

  if (result.user.role !== "ADMIN") {
    return { user: null, error: message };
  }

  return result;
}
