import type { LoginResponse } from "../../../shared/contracts";
import { errorResponse, json } from "../../_shared/response";
import { createSessionCookie } from "../../_shared/session";
import type { Env } from "../../_shared/jobs";

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (!env.APP_LOGIN_ID || !env.APP_LOGIN_PASSWORD) {
    return errorResponse("로그인 설정을 다시 확인해 주세요", 500);
  }

  if (!env.SESSION_SECRET) {
    return errorResponse("세션 설정을 다시 확인해 주세요", 500);
  }

  const body = (await request.json().catch(() => null)) as
    | { loginId?: string; password?: string }
    | null;

  const loginId = body?.loginId?.trim() ?? "";
  const password = body?.password ?? "";

  if (!loginId || !password) {
    return errorResponse("아이디와 비밀번호를 입력해 주세요");
  }

  if (loginId !== env.APP_LOGIN_ID || password !== env.APP_LOGIN_PASSWORD) {
    return errorResponse("아이디 또는 비밀번호가 맞지 않습니다", 401);
  }

  const user = {
    id: "internal-user",
    label: "내부 사용자",
  };

  const response = json({ user } satisfies LoginResponse);
  response.headers.set(
    "set-cookie",
    await createSessionCookie(request, env.SESSION_SECRET, user),
  );

  return response;
};
