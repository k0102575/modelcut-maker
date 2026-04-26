import { useEffect, useMemo, useState } from "react";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  getGenerationCreditCost,
  MAX_IMAGE_FILE_SIZE_BYTES,
  type GenerationMode,
  type JobSummary,
} from "../../shared/contracts";
import { createModelSwapJob, pollJob } from "../lib/api";
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

export function ModelSwapView({
  onOpenHistory,
  onOpenJob,
  onCreditsReserved,
  onJobSettled,
}: Props) {
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [faceReference, setFaceReference] = useState<File | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("balanced");
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
          <h2>모델만 바꾸기</h2>
          <p className="workspace-copy">
            원본 이미지의 옷과 구도는 최대한 유지하면서 사람만 다른 느낌으로 바꾸는 기능입니다.
            참고 얼굴 사진이 있으면 더 원하는 방향으로 맞추기 쉽습니다.
          </p>
        </div>

        <FileDropField
          label="원본 이미지"
          hint="옷과 구도를 유지할 이미지를 올려주세요"
          required
          file={modelImage}
          onChange={setModelImage}
          size="hero"
        />

        <div className="workspace-config-grid">
          <FileDropField
            label="참고 얼굴 사진"
            hint="원하는 얼굴 느낌이 있으면 함께 올려주세요"
            file={faceReference}
            onChange={setFaceReference}
            size="compact"
          />

          <div className="field-card settings-card">
            <div className="field-head">
              <div>
                <p className="field-label">출력 설정</p>
                <p className="field-hint">생성 품질을 고르고, 바꾸고 싶은 사람 느낌을 짧게 적어주세요</p>
              </div>
            </div>

            <div className="settings-stack">
              <label className="select-group">
                <span>생성 품질</span>
                <select
                  value={generationMode}
                  onChange={(event) => setGenerationMode(event.target.value as GenerationMode)}
                >
                  <option value="fast">빠르게 (1 크레딧)</option>
                  <option value="balanced">균형 (2 크레딧)</option>
                  <option value="quality">고품질 (3 크레딧)</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="field-card">
          <div className="field-head">
            <div>
              <p className="field-label">바꾸고 싶은 사람 설명</p>
              <p className="field-hint">
                성별, 나이대, 분위기를 짧게 적어주세요. 참고 얼굴 사진이 있으면 비워도 됩니다.
              </p>
            </div>
            <span className="pill">선택</span>
          </div>
          <textarea
            className="prompt-textarea"
            placeholder="예: 30대 여성 느낌, 자연스러운 헤어, 깔끔한 쇼핑몰 모델"
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
            const modelValidation = validateClientFile(modelImage, true);
            if (modelValidation) {
              setErrorMessage(modelValidation);
              return;
            }

            const faceValidation = validateClientFile(faceReference);
            if (faceValidation) {
              setErrorMessage(faceValidation);
              return;
            }

            if (!promptText.trim() && !faceReference) {
              setErrorMessage("사람 설명이나 참고 얼굴 사진을 함께 넣어주세요");
              return;
            }

            try {
              setLoading(true);
              setErrorMessage("");

              const summaryPrompt = [
                faceReference ? "참고 얼굴 사진: 사용" : null,
                promptText.trim(),
              ]
                .filter(Boolean)
                .join(" / ");

              const formData = new FormData();
              formData.append("modelImage", modelImage as File);
              if (faceReference) {
                formData.append("faceReference", faceReference);
              }
              formData.append("generationMode", generationMode);
              formData.append("promptText", summaryPrompt);

              const response = await createModelSwapJob(formData);
              const reservedCost =
                getGenerationCreditCost("swap", generationMode) + (faceReference ? 3 : 0);
              onCreditsReserved(response.job.id, reservedCost);
              setCurrentJob(response.job);
              setModelImage(null);
              setFaceReference(null);
              setPromptText("");
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "모델 변경 요청에 실패했습니다. 다시 시도해 주세요",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "모델을 바꾸는 중입니다" : "모델만 바꾸기"}
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
                <img src={currentJob.outputUrl} alt="변경된 모델 이미지" />
              ) : (
                <div className="result-placeholder">
                  {currentJob.status === "failed"
                    ? "생성에 실패했습니다"
                    : "모델을 바꾸는 중입니다"}
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
            <strong>아직 변경한 이미지가 없습니다</strong>
            <span>원본 이미지를 올리고 원하는 사람 느낌으로 바꿔 보세요.</span>
          </article>
        )}
      </div>
    </section>
  );
}
