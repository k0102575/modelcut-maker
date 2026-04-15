import type { JobResponse } from "../../../../shared/contracts";
import { requireAuth } from "../../../_shared/auth";
import { getPredictionStatus } from "../../../_shared/fashn";
import {
  getJobById,
  markExpiredJobs,
  updateJob,
  type Env,
} from "../../../_shared/jobs";
import { errorResponse, json } from "../../../_shared/response";

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

  const existingJob = await getJobById(context.env, context.params.id);
  if (!existingJob) {
    return errorResponse("작업을 찾지 못했습니다", 404);
  }

  if (existingJob.status === "completed" || existingJob.status === "failed" || existingJob.status === "expired") {
    return json({ job: existingJob } satisfies JobResponse);
  }

  if (!context.env.FASHN_API_KEY) {
    return errorResponse("FASHN API 설정을 다시 확인해 주세요", 500);
  }

  try {
    const latest = await getPredictionStatus(context.env.FASHN_API_KEY, existingJob.predictionId);
    const updatedJob = await updateJob(context.env, existingJob.id, latest);

    if (!updatedJob) {
      return errorResponse("작업을 다시 불러오지 못했습니다", 500);
    }

    return json({ job: updatedJob } satisfies JobResponse);
  } catch (error) {
    const updatedJob = await updateJob(context.env, existingJob.id, {
      status: "failed",
      errorMessage:
        error instanceof Error
          ? error.message
          : "생성 상태를 확인하지 못했습니다. 다시 시도해 주세요",
    });

    return json({
      job:
        updatedJob ??
        ({
          ...existingJob,
          status: "failed",
          errorMessage: "생성 상태를 확인하지 못했습니다. 다시 시도해 주세요",
        } satisfies JobResponse["job"]),
    } satisfies JobResponse);
  }
};
