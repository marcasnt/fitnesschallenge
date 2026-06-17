import { getCurrentUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ authenticated: false });
    return ok({
      authenticated: true,
      userId: user.userId,
      email: user.email,
      role: user.role,
      athlete: user.athlete,
    });
  } catch (e) {
    return handleError(e);
  }
}
