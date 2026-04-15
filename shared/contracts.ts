export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ACCEPT_IMAGE_FILES = ".jpg,.jpeg,.png,.webp";

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "expired";

export type JobMode = "person" | "virtual";

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

export type LoginResponse = {
  user: SessionUser;
};

export type JobsResponse = {
  jobs: JobSummary[];
};

export type JobResponse = {
  job: JobSummary;
};
