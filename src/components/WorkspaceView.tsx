import { useEffect, useMemo, useState } from "react";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  type JobSummary,
} from "../../shared/contracts";
import { createJob, fetchJobs, pollJob } from "../lib/api";
import { formatDateTime, formatModeLabel } from "../lib/format";
import { FileDropField } from "./FileDropField";
import { StatusBadge } from "./StatusBadge";

type Props = {
  onOpenHistory: () => void;
  onOpenJob: (jobId: string) => void;
};

function validateClientFile(file: File | null, required = false): string | null {
  if (!file) {
    return required ? "상품 사진을 올려주세요" : null;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return "지원하지 않는 파일 형식입니다";
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return "파일 크기가 너무 큽니다";
  }

  return null;
}

export function WorkspaceView({ onOpenHistory, onOpenJob }: Props) {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentJob, setCurrentJob] = useState<JobSummary | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobSummary[]>([]);

  const canSubmit = useMemo(() => !loading, [loading]);

  async function refreshRecentJobs() {
    try {
      const response = await fetchJobs();
      setRecentJobs(response.jobs);
    } catch (error) {
      if (error instanceof Error && error.message === "로그인이 필요합니다") {
        setErrorMessage("세션이 끝났습니다. 다시 로그인해 주세요");
      }
    }
  }

  useEffect(() => {
    void refreshRecentJobs();
  }, []);

  useEffect(() => {
    if (!currentJob || (currentJob.status !== "pending" && currentJob.status !== "processing")) {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await pollJob(currentJob.id);
        setCurrentJob(response.job);
        await refreshRecentJobs();
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    }, 4000);

    return () => window.clearInterval(timer);
  }, [currentJob]);

  return (
    <section className="workspace-grid">
      <div className="panel-stack">
        <div className="section-title">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>이미지 생성 워크스페이스</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onOpenHistory}>
            최근 작업 보기
          </button>
        </div>

        <FileDropField
          label="상품 사진"
          hint="옷걸이 상품 사진 1장을 올려주세요"
          required
          file={productImage}
          onChange={setProductImage}
        />

        <FileDropField
          label="사람 사진"
          hint="원하는 사람이 있으면 함께 올려주세요"
          file={modelImage}
          onChange={setModelImage}
        />

        <div className="field-card">
          <div className="field-head">
            <div>
              <p className="field-label">추가 요청</p>
              <p className="field-hint">배경이나 분위기를 짧게 적어주세요</p>
            </div>
            <span className="pill">선택</span>
          </div>
          <textarea
            className="prompt-textarea"
            placeholder="예: 밝은 스튜디오 배경, 자연스러운 햇살 느낌"
            value={promptText}
            onChange={(event) => setPromptText(event.target.value)}
          />
        </div>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <button
          type="button"
          className="primary-button large"
          disabled={!canSubmit}
          onClick={async () => {
            const productValidation = validateClientFile(productImage, true);
            const modelValidation = validateClientFile(modelImage);

            if (productValidation || modelValidation) {
              setErrorMessage(productValidation ?? modelValidation ?? "");
              return;
            }

            if (!productImage) {
              setErrorMessage("상품 사진을 올려주세요");
              return;
            }

            try {
              setLoading(true);
              setErrorMessage("");

              const formData = new FormData();
              formData.append("productImage", productImage);
              if (modelImage) {
                formData.append("modelImage", modelImage);
              }
              formData.append("promptText", promptText.trim());

              const response = await createJob(formData);
              setCurrentJob(response.job);
              setProductImage(null);
              setModelImage(null);
              setPromptText("");
              await refreshRecentJobs();
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "이미지 생성 요청에 실패했습니다. 다시 시도해 주세요",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "이미지를 요청하는 중입니다" : "이미지 생성하기"}
        </button>
      </div>

      <div className="panel-stack">
        <div className="section-title">
          <div>
            <p className="eyebrow">Result</p>
            <h2>현재 작업</h2>
          </div>
        </div>

        {currentJob ? (
          <article className="result-card">
            <div className="result-preview">
              {currentJob.outputUrl ? (
                <img src={currentJob.outputUrl} alt="생성 결과" />
              ) : (
                <div className="result-placeholder">
                  {currentJob.status === "failed"
                    ? "생성에 실패했습니다"
                    : "이미지를 만드는 중입니다"}
                </div>
              )}
            </div>

            <div className="result-summary">
              <div className="result-head">
                <StatusBadge status={currentJob.status} />
                <button
                  type="button"
                  className="text-button"
                  onClick={() => onOpenJob(currentJob.id)}
                >
                  자세히 보기
                </button>
              </div>

              <dl className="summary-list">
                <div>
                  <dt>생성 방식</dt>
                  <dd>{formatModeLabel(currentJob.mode)}</dd>
                </div>
                <div>
                  <dt>생성 시각</dt>
                  <dd>{formatDateTime(currentJob.createdAt)}</dd>
                </div>
                <div>
                  <dt>추가 요청</dt>
                  <dd>{currentJob.promptText || "없음"}</dd>
                </div>
              </dl>

              {currentJob.outputUrl ? (
                <div className="action-row">
                  <a className="primary-button" href={currentJob.outputUrl} download>
                    결과 내려받기
                  </a>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onOpenJob(currentJob.id)}
                  >
                    상세 확인
                  </button>
                </div>
              ) : null}

              {currentJob.errorMessage ? (
                <p className="error-text">{currentJob.errorMessage}</p>
              ) : null}
            </div>
          </article>
        ) : (
          <div className="empty-card">
            <strong>아직 생성한 이미지가 없습니다</strong>
            <span>상품 사진을 올리고 바로 생성해 보세요.</span>
          </div>
        )}

        <div className="section-title">
          <div>
            <p className="eyebrow">Recent</p>
            <h2>최근 작업 요약</h2>
          </div>
        </div>

        {recentJobs.length > 0 ? (
          <div className="job-list compact">
            {recentJobs.slice(0, 4).map((job) => (
              <button
                type="button"
                key={job.id}
                className="job-card compact"
                onClick={() => onOpenJob(job.id)}
              >
                <div className="job-thumb">
                  {job.outputUrl ? <img src={job.outputUrl} alt="작업 결과" /> : <span>대기</span>}
                </div>
                <div className="job-meta">
                  <div className="job-topline">
                    <StatusBadge status={job.status} />
                    <span>{formatDateTime(job.createdAt)}</span>
                  </div>
                  <strong>{formatModeLabel(job.mode)}</strong>
                  <p>{job.promptText || "추가 요청 없음"}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-card">
            <strong>최근 작업이 없습니다</strong>
            <span>최근 작업은 3일 동안만 표시됩니다.</span>
          </div>
        )}
      </div>
    </section>
  );
}
