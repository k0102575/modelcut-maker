import type { JobMode, JobStatus, JobSummary } from "../../shared/contracts";

export type Env = {
  DB: any;
  APP_LOGIN_ID: string;
  APP_LOGIN_PASSWORD: string;
  SESSION_SECRET: string;
  FASHN_API_KEY: string;
};

type JobRow = {
  id: string;
  prediction_id: string;
  status: JobStatus;
  mode: JobMode;
  output_url: string | null;
  prompt_text: string | null;
  has_model_image: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

export function toJobSummary(row: JobRow): JobSummary {
  return {
    id: row.id,
    predictionId: row.prediction_id,
    status: row.status,
    mode: row.mode,
    outputUrl: row.output_url,
    promptText: row.prompt_text ?? "",
    hasModelImage: Boolean(row.has_model_image),
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  };
}

export async function markExpiredJobs(env: Env): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `
      UPDATE generation_jobs
      SET status = 'expired', updated_at = ?
      WHERE expires_at <= ? AND status != 'expired'
    `,
  )
    .bind(now, now)
    .run();
}

export async function insertJob(
  env: Env,
  input: {
    predictionId: string;
    mode: JobMode;
    promptText: string;
    hasModelImage: boolean;
  },
): Promise<JobSummary> {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `
      INSERT INTO generation_jobs (
        id,
        prediction_id,
        status,
        mode,
        output_url,
        prompt_text,
        has_model_image,
        error_message,
        created_at,
        updated_at,
        expires_at
      )
      VALUES (?, ?, 'pending', ?, NULL, ?, ?, NULL, ?, ?, ?)
    `,
  )
    .bind(
      id,
      input.predictionId,
      input.mode,
      input.promptText,
      input.hasModelImage ? 1 : 0,
      now,
      now,
      expiresAt,
    )
    .run();

  return {
    id,
    predictionId: input.predictionId,
    status: "pending",
    mode: input.mode,
    outputUrl: null,
    promptText: input.promptText,
    hasModelImage: input.hasModelImage,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
    expiresAt,
  };
}

export async function updateJob(
  env: Env,
  jobId: string,
  input: {
    status: JobStatus;
    outputUrl?: string | null;
    errorMessage?: string | null;
  },
): Promise<JobSummary | null> {
  const now = new Date().toISOString();

  await env.DB.prepare(
    `
      UPDATE generation_jobs
      SET status = ?,
          output_url = ?,
          error_message = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      input.status,
      input.outputUrl ?? null,
      input.errorMessage ?? null,
      now,
      jobId,
    )
    .run();

  return getJobById(env, jobId);
}

export async function getJobById(env: Env, jobId: string): Promise<JobSummary | null> {
  const row = await env.DB.prepare(
    `
      SELECT
        id,
        prediction_id,
        status,
        mode,
        output_url,
        prompt_text,
        has_model_image,
        error_message,
        created_at,
        updated_at,
        expires_at
      FROM generation_jobs
      WHERE id = ?
      LIMIT 1
    `,
  )
    .bind(jobId)
    .first<JobRow>();

  return row ? toJobSummary(row) : null;
}

export async function listRecentJobs(env: Env): Promise<JobSummary[]> {
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `
      SELECT
        id,
        prediction_id,
        status,
        mode,
        output_url,
        prompt_text,
        has_model_image,
        error_message,
        created_at,
        updated_at,
        expires_at
      FROM generation_jobs
      WHERE expires_at > ?
      ORDER BY created_at DESC
      LIMIT 30
    `,
  )
    .bind(now)
    .all<JobRow>();

  return (result.results ?? []).map(toJobSummary);
}
