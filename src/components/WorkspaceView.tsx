import { useEffect, useMemo, useState } from "react";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  getGenerationCreditCost,
  MAX_IMAGE_FILE_SIZE_BYTES,
  type GenerationMode,
  type JobMode,
  type JobSummary,
} from "../../shared/contracts";
import { createJob, pollJob } from "../lib/api";
import { formatDateTime, formatModeLabel } from "../lib/format";
import { FileDropField } from "./FileDropField";
import { StatusBadge } from "./StatusBadge";

type Props = {
  workspaceMode: JobMode;
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
  workspaceMode,
  onOpenHistory,
  onOpenJob,
  onCreditsReserved,
  onJobSettled,
}: Props) {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [category, setCategory] = useState("상의");
  const [modelPreset, setModelPreset] = useState("여성 가상모델");
  const [cameraAngle, setCameraAngle] = useState("정면");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("balanced");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentJob, setCurrentJob] = useState<JobSummary | null>(null);

  const canSubmit = useMemo(() => !loading, [loading]);
  const isVirtualMode = workspaceMode === "virtual";
  const generationModeOptions = isVirtualMode
    ? [
        { value: "fast" as GenerationMode, label: "빠르게 (1 크레딧)" },
        { value: "balanced" as GenerationMode, label: "균형 (2 크레딧)" },
        { value: "quality" as GenerationMode, label: "고품질 (3 크레딧)" },
      ]
    : [
        { value: "balanced" as GenerationMode, label: "균형 (2 크레딧)" },
        { value: "quality" as GenerationMode, label: "고품질 (3 크레딧)" },
      ];

  useEffect(() => {
    setProductImage(null);
    setModelImage(null);
    setBackgroundImage(null);
    setCategory("상의");
    setModelPreset("여성 가상모델");
    setCameraAngle("정면");
    setGenerationMode("balanced");
    setPromptText("");
    setLoading(false);
    setErrorMessage("");
    setCurrentJob(null);
  }, [workspaceMode]);

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
          <h2>{isVirtualMode ? "옷으로 바로 모델컷 만들기" : "사람 사진에 옷 입히기"}</h2>
          <p className="workspace-copy">
            {isVirtualMode
              ? "상품 사진으로 새 모델컷을 만들고, 필요하면 배경 사진과 추가 프롬프트를 함께 넣어 주세요."
              : "사람 사진을 기준으로 상품을 입힌 이미지를 만듭니다. 착용 방식은 조금 조정할 수 있지만 큰 연출 변경은 제한될 수 있습니다."}
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
          {isVirtualMode ? (
            <FileDropField
              label="배경 사진"
              hint="원하는 배경이 있으면 함께 올려주세요"
              file={backgroundImage}
              onChange={setBackgroundImage}
              size="compact"
            />
          ) : (
            <FileDropField
              label="기준 인물 사진"
              hint="옷을 입힐 사람 사진을 올려주세요"
              required
              file={modelImage}
              onChange={setModelImage}
              size="compact"
            />
          )}

          <div className="field-card settings-card">
            <div className="field-head">
              <div>
                <p className="field-label">{isVirtualMode ? "가상 모델 설정" : "출력 설정"}</p>
                <p className="field-hint">
                  {isVirtualMode
                    ? "가상 모델 생성에 필요한 옵션을 고를 수 있습니다"
                    : "기준 인물 사진에서는 배경 사진 없이 결과를 생성합니다"}
                </p>
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

              {isVirtualMode ? (
                <label className="select-group">
                  <span>모델 선택</span>
                  <select value={modelPreset} onChange={(event) => setModelPreset(event.target.value)}>
                    <option value="성별 자동 (가상모델)">성별 자동 (가상모델)</option>
                    <option value="남성 가상모델">남성 가상모델</option>
                    <option value="여성 가상모델">여성 가상모델</option>
                  </select>
                </label>
              ) : null}

              <label className="select-group">
                <span>촬영 방향</span>
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
                  onChange={(event) => {
                    const nextMode = event.target.value as GenerationMode;
                    if (!isVirtualMode && nextMode !== "balanced" && nextMode !== "quality") {
                      setGenerationMode("balanced");
                      return;
                    }

                    setGenerationMode(nextMode);
                  }}
                >
                  {generationModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="field-card">
          <div className="field-head">
            <div>
              <p className="field-label">추가 프롬프트</p>
              <p className="field-hint">
                {isVirtualMode
                  ? "분위기나 연출을 짧게 적어주세요"
                  : "소매 접기나 넣어 입기처럼 작은 착용 방식만 짧게 적어주세요"}
              </p>
            </div>
            <span className="pill">선택</span>
          </div>
          <textarea
            className="prompt-textarea"
            placeholder={
              isVirtualMode
                ? "예: 동양인 여자 30대, 배경은 없이, 자연스러운 쇼핑몰 촬영 느낌"
                : "예: 셔츠를 넣어 입기, 소매를 살짝 걷기"
            }
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
            const modelValidation = validateClientFile(modelImage, !isVirtualMode);
            const backgroundValidation = isVirtualMode
              ? validateClientFile(backgroundImage)
              : null;

            if (productValidation || modelValidation || backgroundValidation) {
              setErrorMessage(productValidation ?? modelValidation ?? backgroundValidation ?? "");
              return;
            }

            if (!productImage) {
              setErrorMessage("상품 사진을 올려주세요");
              return;
            }

            if (!isVirtualMode && !modelImage) {
              setErrorMessage("기준 인물 사진을 올려주세요");
              return;
            }

            try {
              setLoading(true);
              setErrorMessage("");

              const formData = new FormData();
              formData.append("productImage", productImage);
              if (!isVirtualMode && modelImage) {
                formData.append("modelImage", modelImage);
              }
              if (isVirtualMode && backgroundImage) {
                formData.append("backgroundImage", backgroundImage);
              }
              formData.append("generationMode", generationMode);

              const summaryPrompt = [
                `카테고리: ${category}`,
                isVirtualMode ? `모델 설정: ${modelPreset}` : null,
                `촬영 방향: ${cameraAngle}`,
                isVirtualMode && backgroundImage ? "배경 참고: 사용" : null,
                promptText.trim(),
              ]
                .filter(Boolean)
                .join(" / ");

              formData.append("promptText", summaryPrompt);
              formData.append("apiPromptText", isVirtualMode ? summaryPrompt : promptText.trim());

              const response = await createJob(formData);
              onCreditsReserved(response.job.id, getGenerationCreditCost(workspaceMode, generationMode));
              setCurrentJob(response.job);
              setProductImage(null);
              setModelImage(null);
              setBackgroundImage(null);
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
                  <dt>요청 내용</dt>
                  <dd>{currentJob.promptText || "없음"}</dd>
                </div>
              </dl>

              {currentJob.outputUrl ? (
                <div className="action-row">
                  <a className="primary-button" href={`/api/jobs/${currentJob.id}/download`}>
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
