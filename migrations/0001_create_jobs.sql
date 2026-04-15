CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  prediction_id TEXT NOT NULL,
  status TEXT NOT NULL,
  mode TEXT NOT NULL,
  output_url TEXT,
  prompt_text TEXT,
  has_model_image INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_at
  ON generation_jobs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_expires_at
  ON generation_jobs (expires_at DESC);
