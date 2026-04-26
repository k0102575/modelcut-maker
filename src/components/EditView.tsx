import { useEffect, useMemo, useState } from "react";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  type JobSummary,
} from "../../shared/contracts";
import { createEditJob, pollJob } from "../lib/api";
import { formatDateTime, formatModeLabel } from "../lib/format";
import { FileDropField } from "./FileDropField";
import { StatusBadge } from "./StatusBadge";

type Props = {
  onOpenHistory: () => void;
  onOpenJob: (jobId: string) => void;
  onCreditsReserved: (jobId: string, cost: number) => void;
  onJobSettled: (jobId: string, status: "completed" | "failed" | "expired") => void;
};

function validateClientFile(file: File | null, required = false): string | null {
  if (!file) {
    return required ? "원본 이미지를 올려주세요" : null;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return "지원하지 않는 파일 형식입니다";
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return "파일 크기가 너무 큽니다";
  }

  return null;
}

export function EditView({
  onOpenHistory,
  onOpenJob,
  onCreditsReserved,
  onJobSettled,
}: Props) {
  const [image, setImage] = useState<File | null>(null);
  const [imageContext, setImageContext] = useState<File | null>(null);
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentJob, setCurrentJob] = useState<JobSummary | null>(null);

  const canSubmit = useMemo(() => !loading, [loading]);

  useEffect(() => {
    if (!currentJob || (currentJob.status !== "pending" && currentJob.status !== "processing")) {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await pollJob(currentJob.id);
        setCurrentJob(response.job);
        if (
          response.job.status === "completed" ||
          response.job.status === "failed" ||
          response.job.status === "expired"
        ) {
          onJobSettled(response.job.id, response.job.status);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    }, 4000);

    return () => window.clearInterval(timer);
  }, [currentJob, onJobSettled]);

  return (
    <section className="workspace-page">
      <div className="workspace-shell">
        <div className="workspace-heading page-header">
          <p className="eyebrow">Workspace</p>
          <h2>이미지 조금 수정하기</h2>
          <p className="workspace-copy">
            이미 만든 이미지를 기준으로 포즈, 분위기, 배경, 작은 디테일을 수정하는 기능입니다.
            큰 변화보다는 한 번에 한 가지씩 짧게 요청하는 쪽이 더 안정적입니다.
          </p>
        </div>

        <FileDropField
          label="원본 이미지"
          hint="수정할 이미지를 올려주세요"
          required
          file={image}
          onChange={setImage}
          size="hero"
        />

        <div className="workspace-config-grid">
          <FileDropField
            label="참고 이미지"
            hint="배경이나 구도를 참고시킬 이미지가 있으면 함께 올려주세요"
            file={imageContext}
            onChange={setImageContext}
            size="compact"
          />

          <div className="field-card settings-card">
            <div className="field-head">
              <div>
                <p className="field-label">안내</p>
                <p className="field-hint">이 기능은 1회 생성당 1크레딧이 사용됩니다</p>
              </div>
            </div>

            <div className="settings-stack">
              <p className="field-hint">한 번에 한 가지씩 요청하면 결과가 더 안정적으로 나옵니다.</p>
              <p className="field-hint">
                큰 변경이 필요하면 두 번에 나눠서 수정하는 쪽이 더 잘 맞는 경우가 많습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="field-card">
          <div className="field-head">
            <div>
              <p className="field-label">수정할 내용</p>
              <p className="field-hint">
                포즈, 배경, 조명, 소품처럼 바꾸고 싶은 내용을 짧게 적어주세요
              </p>
            </div>
            <span className="pill pill-solid">필수</span>
          </div>
          <textarea
            className="prompt-textarea"
            placeholder="예: 모델을 살짝 왼쪽으로 돌리고, 밝은 스튜디오 배경으로 바꿔주세요"
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
            const imageValidation = validateClientFile(image, true);
            if (imageValidation) {
              setErrorMessage(imageValidation);
              return;
            }

            const imageContextValidation = validateClientFile(imageContext);
            if (imageContextValidation) {
              setErrorMessage(imageContextValidation);
              return;
            }

            if (!promptText.trim()) {
              setErrorMessage("수정할 내용을 입력해 주세요");
              return;
            }

            try {
              setLoading(true);
              setErrorMessage("");

              const summaryPrompt = [imageContext ? "참고 이미지: 사용" : null, promptText.trim()]
                .filter(Boolean)
                .join(" / ");

              const formData = new FormData();
              formData.append("image", image as File);
              if (imageContext) {
                formData.append("imageContext", imageContext);
              }
              formData.append("promptText", summaryPrompt);

              const response = await createEditJob(formData);
              onCreditsReserved(response.job.id, 1);
              setCurrentJob(response.job);
              setImage(null);
              setImageContext(null);
              setPromptText("");
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "이미지 수정 요청에 실패했습니다. 다시 시도해 주세요",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "이미지를 수정하는 중입니다" : "이미지 수정하기"}
        </button>

        <div className="workspace-footer-head section-header-row">
          <div>
            <p className="eyebrow">Result</p>
            <h2>현재 작업</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onOpenHistory}>
            최근 작업 보기
          </button>
        </div>

        {currentJob ? (
          <article className="result-card">
            <div className="result-preview">
              {currentJob.outputUrl ? (
                <img src={currentJob.outputUrl} alt="수정된 이미지" />
              ) : (
                <div className="result-placeholder">
                  {currentJob.status === "failed"
                    ? "수정에 실패했습니다"
                    : "이미지를 수정하는 중입니다"}
                </div>
              )}
            </div>

            <div className="result-summary">
              <div className="result-summary-head">
                <StatusBadge status={currentJob.status} />
                <span>{formatModeLabel(currentJob.mode)}</span>
              </div>
              <dl className="summary-list">
                <div>
                  <dt>상태</dt>
                  <dd>{currentJob.status === "completed" ? "결과 확인 가능" : "처리 중"}</dd>
                </div>
                <div>
                  <dt>생성 시각</dt>
                  <dd>{formatDateTime(currentJob.createdAt)}</dd>
                </div>
                <div>
                  <dt>요청 내용</dt>
                  <dd>{currentJob.promptText || "없음"}</dd>
                </div>
              </dl>
              <div className="result-actions">
                <button type="button" className="secondary-button" onClick={() => onOpenJob(currentJob.id)}>
                  상세 보기
                </button>
                {currentJob.outputUrl ? (
                  <a className="primary-button" href={`/api/jobs/${currentJob.id}/download`}>
                    결과 내려받기
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ) : (
          <article className="result-card empty-card empty-card-soft">
            <strong>아직 수정한 이미지가 없습니다</strong>
            <span>원본 이미지를 올리고 바꾸고 싶은 내용을 적어 보세요.</span>
          </article>
        )}
      </div>
    </section>
  );
}
