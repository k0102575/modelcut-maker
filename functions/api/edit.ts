import type { JobResponse } from "../../shared/contracts";
import { requireAuth } from "../_shared/auth";
import {
  createEditPrediction,
  fileToDataUrl,
  validateImageFile,
} from "../_shared/fashn";
import { insertJob, type Env } from "../_shared/jobs";
import { errorResponse, json } from "../_shared/response";

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (auth.response) {
    return auth.response;
  }

  if (!env.FASHN_API_KEY) {
    return errorResponse("FASHN API 설정을 다시 확인해 주세요", 500);
  }

  if (!env.DB) {
    return errorResponse("D1 설정을 다시 확인해 주세요", 500);
  }

  try {
    const formData = await request.formData();
    const imageFile = validateImageFile(formData.get("image"), "원본 이미지", true);
    const imageContextFile = validateImageFile(formData.get("imageContext"), "참고 이미지");
    const promptText = String(formData.get("promptText") ?? "").trim();

    if (!promptText) {
      return errorResponse("수정할 내용을 입력해 주세요", 400);
    }

    const predictionId = await createEditPrediction(env.FASHN_API_KEY, {
      image: await fileToDataUrl(imageFile as File),
      imageContext: imageContextFile ? await fileToDataUrl(imageContextFile) : undefined,
      prompt: promptText,
    });

    const job = await insertJob(env, {
      predictionId,
      mode: "edit",
      promptText: [imageContextFile ? "참고 이미지: 사용" : null, promptText]
        .filter(Boolean)
        .join(" / "),
      hasModelImage: false,
    });

    return json({ job } satisfies JobResponse, { status: 201 });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "이미지 수정 요청에 실패했습니다. 다시 시도해 주세요",
      400,
    );
  }
};
