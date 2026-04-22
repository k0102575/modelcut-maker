import { FASHN_GENERATION_MODES, type GenerationMode, type JobResponse } from "../../shared/contracts";
import { requireAuth } from "../_shared/auth";
import { createModelPrediction, fileToDataUrl, validateImageFile } from "../_shared/fashn";
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
    const imageReferenceFile = validateImageFile(formData.get("imageReference"), "참고 사진");
    const promptText = String(formData.get("promptText") ?? "").trim();
    const generationModeValue = String(formData.get("generationMode") ?? "balanced");
    const generationMode: GenerationMode = FASHN_GENERATION_MODES.includes(
      generationModeValue as GenerationMode,
    )
      ? (generationModeValue as GenerationMode)
      : "balanced";

    if (!promptText) {
      return errorResponse("모델 설명을 입력해 주세요", 400);
    }

    const predictionId = await createModelPrediction(env.FASHN_API_KEY, {
      prompt: promptText,
      imageReference: imageReferenceFile ? await fileToDataUrl(imageReferenceFile) : undefined,
      generationMode,
    });

    const job = await insertJob(env, {
      predictionId,
      mode: "model",
      promptText,
      hasModelImage: false,
    });

    return json({ job } satisfies JobResponse, { status: 201 });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "모델 생성 요청에 실패했습니다. 다시 시도해 주세요",
      400,
    );
  }
};
