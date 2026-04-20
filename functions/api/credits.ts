import type { CreditsResponse } from "../../shared/contracts";
import { requireAuth } from "../_shared/auth";
import { getCreditsBalance } from "../_shared/fashn";
import type { Env } from "../_shared/jobs";
import { errorResponse, json } from "../_shared/response";

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const auth = await requireAuth(context.request, context.env);
  if (auth.response) {
    return auth.response;
  }

  if (!context.env.FASHN_API_KEY) {
    return errorResponse("FASHN API 설정을 다시 확인해 주세요", 500);
  }

  try {
    const credits = await getCreditsBalance(context.env.FASHN_API_KEY);
    return json({ credits } satisfies CreditsResponse);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "크레딧 정보를 불러오지 못했습니다",
      500,
    );
  }
};
