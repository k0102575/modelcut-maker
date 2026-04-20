import { useEffect, useMemo, useState } from "react";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  getProductToModelCreditCost,
  MAX_IMAGE_FILE_SIZE_BYTES,
  type GenerationMode,
  type JobSummary,
} from "../../shared/contracts";
import { createJob, pollJob } from "../lib/api";
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

export function WorkspaceView({
  onOpenHistory,
  onOpenJob,
  onCreditsReserved,
  onJobSettled,
}: Props) {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [category, setCategory] = useState("상의");
  const [modelPreset, setModelPreset] = useState("여성 가상모델");
  const [cameraAngle, setCameraAngle] = useState("정면");
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
          <h2>모델컷 생성실</h2>
          <p className="workspace-copy">
            상품 사진을 올리고 필요한 설정을 고른 뒤 바로 생성해 보세요.
          </p>
        </div>

        <FileDropField
          label="상품 사진"
          hint="옷걸이 상품 사진 1장을 올려주세요"
          required
          file={productImage}
          onChange={setProductImage}
          size="hero"
        />

        <div className="workspace-config-grid">
          <FileDropField
            label="사람 사진"
            hint="원하는 사람이 있으면 함께 올려주세요"
            file={modelImage}
            onChange={setModelImage}
            size="compact"
          />

          <div className="field-card settings-card">
            <div className="field-head">
            <div>
              <p className="field-label">모델 및 카테고리 설정</p>
              <p className="field-hint">선택한 값은 생성 요청 문구에 함께 반영됩니다</p>
            </div>
          </div>

            <div className="settings-stack">
              <label className="select-group">
                <span>카테고리</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="상의">상의</option>
                  <option value="하의">하의</option>
                  <option value="원피스">원피스</option>
                </select>
              </label>

              <label className="select-group">
                <span>모델 선택</span>
                <select value={modelPreset} onChange={(event) => setModelPreset(event.target.value)}>
                  <option value="성별 자동 (가상모델)">성별 자동 (가상모델)</option>
                  <option value="남성 가상모델">남성 가상모델</option>
                  <option value="여성 가상모델">여성 가상모델</option>
                </select>
              </label>

              <label className="select-group">
                <span>모델 각도</span>
                <select value={cameraAngle} onChange={(event) => setCameraAngle(event.target.value)}>
                  <option value="정면">정면</option>
                  <option value="측면">측면</option>
                  <option value="뒷면">뒷면</option>
                </select>
              </label>

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
              <p className="field-label">추가 프롬프트</p>
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
              formData.append("generationMode", generationMode);
              const composedPrompt = [
                `카테고리: ${category}`,
                `모델 설정: ${modelPreset}`,
                `촬영 방향: ${cameraAngle}`,
                promptText.trim(),
              ]
                .filter(Boolean)
                .join(" / ");

              formData.append("promptText", composedPrompt);

              const response = await createJob(formData);
              onCreditsReserved(response.job.id, getProductToModelCreditCost(generationMode));
              setCurrentJob(response.job);
              setProductImage(null);
              setModelImage(null);
              setPromptText("");
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
          <div className="empty-card empty-card-soft">
            <strong>아직 생성한 이미지가 없습니다</strong>
            <span>상품 사진을 올리고 바로 생성해 보세요.</span>
          </div>
        )}
      </div>
    </section>
  );
}
