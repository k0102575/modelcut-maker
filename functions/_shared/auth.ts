import type { SessionUser } from "../../shared/contracts";
import { errorResponse } from "./response";
import type { Env } from "./jobs";
import { readSession } from "./session";

export async function requireAuth(
  request: Request,
  env: Env,
): Promise<{ user: SessionUser | null; response: Response | null }> {
  if (!env.SESSION_SECRET) {
    return {
      user: null,
      response: errorResponse("세션 설정을 다시 확인해 주세요", 500),
    };
  }

  const user = await readSession(request, env.SESSION_SECRET);
  if (!user) {
    return {
      user: null,
      response: errorResponse("로그인이 필요합니다", 401),
    };
  }

  return { user, response: null };
}
