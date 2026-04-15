import type { JobsResponse } from "../../../shared/contracts";
import { requireAuth } from "../../_shared/auth";
import { listRecentJobs, markExpiredJobs, type Env } from "../../_shared/jobs";
import { json } from "../../_shared/response";

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const auth = await requireAuth(context.request, context.env);
  if (auth.response) {
    return auth.response;
  }

  if (!context.env.DB) {
    return json({ message: "D1 설정을 다시 확인해 주세요" }, { status: 500 });
  }

  await markExpiredJobs(context.env);
  const jobs = await listRecentJobs(context.env);
  return json({ jobs } satisfies JobsResponse);
};
