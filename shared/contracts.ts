export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ACCEPT_IMAGE_FILES = ".jpg,.jpeg,.png,.webp";

export const FASHN_GENERATION_MODES = ["fast", "balanced", "quality"] as const;

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "expired";

export type JobMode = "person" | "virtual";
export type GenerationMode = (typeof FASHN_GENERATION_MODES)[number];

export function getProductToModelCreditCost(mode: GenerationMode): number {
  if (mode === "fast") {
    return 1;
  }

  if (mode === "quality") {
    return 3;
  }

  return 2;
}

export type SessionUser = {
  id: string;
  label: string;
};

export type JobSummary = {
  id: string;
  predictionId: string;
  status: JobStatus;
  mode: JobMode;
  outputUrl: string | null;
  promptText: string;
  hasModelImage: boolean;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type ApiErrorResponse = {
  message: string;
};

export type SessionResponse = {
  authenticated: boolean;
  user: SessionUser | null;
};

export type CreditsSummary = {
  total: number;
  subscription: number;
  onDemand: number;
};

export type LoginResponse = {
  user: SessionUser;
};

export type CreditsResponse = {
  credits: CreditsSummary;
};

export type JobsResponse = {
  jobs: JobSummary[];
};

export type JobResponse = {
  job: JobSummary;
};
