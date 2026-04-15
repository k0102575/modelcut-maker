import type { JobResponse } from "../../../shared/contracts";
import { requireAuth } from "../../_shared/auth";
import { getJobById, markExpiredJobs, type Env } from "../../_shared/jobs";
import { errorResponse, json } from "../../_shared/response";

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> => {
  const auth = await requireAuth(context.request, context.env);
  if (auth.response) {
    return auth.response;
  }

  if (!context.env.DB) {
    return errorResponse("D1 설정을 다시 확인해 주세요", 500);
  }

  await markExpiredJobs(context.env);
  const job = await getJobById(context.env, context.params.id);
  if (!job) {
    return errorResponse("작업을 찾지 못했습니다", 404);
  }

  return json({ job } satisfies JobResponse);
};
