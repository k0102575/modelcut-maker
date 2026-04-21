import { requireAuth } from "../../../_shared/auth";
import { getJobById, markExpiredJobs, type Env } from "../../../_shared/jobs";
import { errorResponse } from "../../../_shared/response";

function getFileExtension(contentType: string | null, outputUrl: string): string {
  if (contentType?.includes("png")) {
    return "png";
  }

  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) {
    return "jpg";
  }

  if (contentType?.includes("webp")) {
    return "webp";
  }

  try {
    const pathname = new URL(outputUrl).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    if (match?.[1]) {
      return match[1].toLowerCase();
    }
  } catch {
    return "png";
  }

  return "png";
}

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

  if (!job.outputUrl) {
    return errorResponse("내려받을 결과 이미지가 없습니다", 400);
  }

  if (job.status === "expired") {
    return errorResponse("결과 보관 기간이 지나서 내려받을 수 없습니다", 410);
  }

  const upstream = await fetch(job.outputUrl);
  if (!upstream.ok) {
    return errorResponse("결과 이미지를 내려받지 못했습니다", 502);
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const extension = getFileExtension(contentType, job.outputUrl);
  headers.set("content-type", contentType);
  headers.set(
    "content-disposition",
    `attachment; filename="modelcut-${job.id.slice(0, 8)}.${extension}"`,
  );

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
};
