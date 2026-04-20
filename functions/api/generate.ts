import { FASHN_GENERATION_MODES, type GenerationMode, type JobResponse } from "../../shared/contracts";
import { requireAuth } from "../_shared/auth";
import { createPrediction, fileToDataUrl, validateImageFile } from "../_shared/fashn";
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
    const productImageFile = validateImageFile(
      formData.get("productImage"),
      "상품 사진",
      true,
    );
    const modelImageFile = validateImageFile(formData.get("modelImage"), "사람 사진");
    const promptText = String(formData.get("promptText") ?? "").trim();
    const generationModeValue = String(formData.get("generationMode") ?? "balanced");
    const generationMode: GenerationMode = FASHN_GENERATION_MODES.includes(
      generationModeValue as GenerationMode,
    )
      ? (generationModeValue as GenerationMode)
      : "balanced";

    const predictionId = await createPrediction(env.FASHN_API_KEY, {
      productImage: await fileToDataUrl(productImageFile as File),
      modelImage: modelImageFile ? await fileToDataUrl(modelImageFile) : undefined,
      prompt: promptText,
      generationMode,
    });

    const job = await insertJob(env, {
      predictionId,
      mode: modelImageFile ? "person" : "virtual",
      promptText,
      hasModelImage: Boolean(modelImageFile),
    });

    return json({ job } satisfies JobResponse, { status: 201 });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "이미지 생성 요청에 실패했습니다. 다시 시도해 주세요",
      400,
    );
  }
};
