import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  type JobStatus,
  type CreditsSummary,
  type GenerationMode,
  type JobMode,
} from "../../shared/contracts";

const FASHN_BASE_URL = "https://api.fashn.ai/v1";

type FashnCreateResponse = {
  id?: string;
  error?: string | { message?: string };
  message?: string;
};

type FashnStatusResponse = {
  id: string;
  status: "starting" | "in_queue" | "processing" | "completed" | "failed";
  output?: string[];
  error?: {
    message?: string;
    name?: string;
  } | null;
};

type FashnCreditsPayload = {
  credits?: {
    total?: number;
    subscription?: number;
    on_demand?: number;
  };
  error?: string | { message?: string };
  message?: string;
};

function readApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return null;
}

function encodeArrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 32 * 1024;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    let chunkBinary = "";

    chunk.forEach((value) => {
      chunkBinary += String.fromCharCode(value);
    });

    binary += chunkBinary;
  }

  return btoa(binary);
}

export async function fileToDataUrl(file: File): Promise<string> {
  const base64 = encodeArrayBufferToBase64(await file.arrayBuffer());
  return `data:${file.type};base64,${base64}`;
}

export function validateImageFile(
  file: FormDataEntryValue | null,
  label: string,
  required = false,
): File | null {
  if (!file) {
    if (required) {
      throw new Error(`${label}을 올려주세요`);
    }

    return null;
  }

  if (!(file instanceof File)) {
    throw new Error(`${label} 파일을 다시 확인해 주세요`);
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    throw new Error("지원하지 않는 파일 형식입니다");
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error("파일 크기가 너무 큽니다");
  }

  return file;
}

export async function createPrediction(
  apiKey: string,
  input: {
    mode: JobMode;
    productImage: string;
    modelImage?: string;
    backgroundImage?: string;
    prompt: string;
    generationMode: GenerationMode;
  },
): Promise<string> {
  const isPersonMode = input.mode === "person";
  const payload = {
    model_name: isPersonMode ? "tryon-max" : "product-to-model",
    inputs: {
      product_image: input.productImage,
      ...(input.modelImage ? { model_image: input.modelImage } : {}),
      ...(!isPersonMode && input.backgroundImage
        ? { background_reference: input.backgroundImage }
        : {}),
      ...(input.prompt ? { prompt: input.prompt } : {}),
      resolution: "1k",
      aspect_ratio: "3:4",
      generation_mode:
        isPersonMode && input.generationMode === "fast" ? "balanced" : input.generationMode,
      output_format: "png",
      return_base64: false,
    },
  };

  const response = await fetch(`${FASHN_BASE_URL}/run`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as FashnCreateResponse;
  if (!response.ok || !data.id) {
    throw new Error(readApiErrorMessage(data) ?? "이미지 생성 요청에 실패했습니다. 다시 시도해 주세요");
  }

  return data.id;
}

export async function getPredictionStatus(
  apiKey: string,
  predictionId: string,
): Promise<{
  status: JobStatus;
  outputUrl: string | null;
  errorMessage: string | null;
}> {
  const response = await fetch(`${FASHN_BASE_URL}/status/${predictionId}`, {
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  });

  const data = (await response.json()) as FashnStatusResponse | Record<string, unknown>;
  if (!response.ok) {
    throw new Error(readApiErrorMessage(data) ?? "생성 상태를 확인하지 못했습니다. 다시 시도해 주세요");
  }

  const fashnStatus = (data as FashnStatusResponse).status;

  if (fashnStatus === "completed") {
    const output = Array.isArray((data as FashnStatusResponse).output)
      ? (data as FashnStatusResponse).output?.[0] ?? null
      : null;

    return {
      status: "completed",
      outputUrl: output,
      errorMessage: null,
    };
  }

  if (fashnStatus === "failed") {
    return {
      status: "failed",
      outputUrl: null,
      errorMessage:
        (data as FashnStatusResponse).error?.message ??
        "생성에 실패했습니다. 다시 시도해 주세요",
    };
  }

  return {
    status: "processing",
    outputUrl: null,
    errorMessage: null,
  };
}

export async function getCreditsBalance(apiKey: string): Promise<CreditsSummary> {
  const response = await fetch(`${FASHN_BASE_URL}/credits`, {
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  });

  const data = (await response.json()) as FashnCreditsPayload;
  if (!response.ok || !data.credits) {
    throw new Error(readApiErrorMessage(data) ?? "크레딧 정보를 불러오지 못했습니다");
  }

  return {
    total: Number(data.credits.total ?? 0),
    subscription: Number(data.credits.subscription ?? 0),
    onDemand: Number(data.credits.on_demand ?? 0),
  };
}
