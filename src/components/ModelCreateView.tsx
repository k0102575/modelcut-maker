import { useEffect, useMemo, useState } from "react";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AspectRatio,
  getGenerationCreditCost,
  MAX_IMAGE_FILE_SIZE_BYTES,
  type GenerationMode,
  type JobSummary,
} from "../../shared/contracts";
import { createModelJob, pollJob } from "../lib/api";
import { formatDateTime, formatModeLabel } from "../lib/format";
import { FileDropField } from "./FileDropField";
import { StatusBadge } from "./StatusBadge";

type Props = {
  onOpenHistory: () => void;
  onOpenJob: (jobId: string) => void;
  onCreditsReserved: (jobId: string, cost: number) => void;
  onJobSettled: (jobId: string, status: "completed" | "failed" | "expired") => void;
};

function validateClientFile(file: File | null): string | null {
  if (!file) {
    return null;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return "지원하지 않는 파일 형식입니다";
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return "파일 크기가 너무 큽니다";
  }

  return null;
}

export function ModelCreateView({
  onOpenHistory,
  onOpenJob,
  onCreditsReserved,
  onJobSettled,
}: Props) {
  const [imageReference, setImageReference] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3:4");
  const [modelProfile, setModelProfile] = useState("여성 30대");
  const [shotFrame, setShotFrame] = useState("전신이 보이게");
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
          <h2>모델 이미지 먼저 만들기</h2>
          <p className="workspace-copy">
            설명을 입력해서 새 모델 이미지를 먼저 만들 수 있습니다. 참고 사진이 있으면 포즈나 구도를 비슷하게 맞추는 데 도움이 됩니다.
          </p>
        </div>

        <div className="workspace-config-grid">
          <FileDropField
            label="참고 사진"
            hint="원하는 포즈나 구도가 있으면 함께 올려주세요"
            file={imageReference}
            onChange={setImageReference}
            size="compact"
          />

          <div className="field-card settings-card">
            <div className="field-head">
              <div>
                <p className="field-label">출력 설정</p>
                <p className="field-hint">원하는 사람 느낌과 사진 모양을 쉽게 고를 수 있습니다</p>
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

              <label className="select-group">
                <span>사진 비율</span>
                <select
                  value={aspectRatio}
                  onChange={(event) => setAspectRatio(event.target.value as AspectRatio)}
                >
                  <option value="1:1">정사각형 (1:1)</option>
                  <option value="3:4">세로형 (기본, 3:4)</option>
                  <option value="4:5">세로형 길게 (4:5)</option>
                </select>
              </label>

              <label className="select-group">
                <span>사람 느낌</span>
                <select value={modelProfile} onChange={(event) => setModelProfile(event.target.value)}>
                  <option value="여성 20대">여성 20대</option>
                  <option value="여성 30대">여성 30대</option>
                  <option value="남성 20대">남성 20대</option>
                  <option value="남성 30대">남성 30대</option>
                  <option value="자동 선택">자동 선택</option>
                </select>
              </label>

              <label className="select-group">
                <span>보이는 범위</span>
                <select value={shotFrame} onChange={(event) => setShotFrame(event.target.value)}>
                  <option value="전신이 보이게">전신이 보이게</option>
                  <option value="허벅지까지 보이게">허벅지까지 보이게</option>
                  <option value="상반신만 보이게">상반신만 보이게</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="field-card">
          <div className="field-head">
            <div>
              <p className="field-label">모델 설명</p>
              <p className="field-hint">원하는 사람 느낌, 의상, 장면을 자세히 적어주세요</p>
            </div>
            <span className="pill pill-solid">필수</span>
          </div>
          <textarea
            className="prompt-textarea"
            placeholder="예: 전신 사진, 동양인 여성 30대, 흰 티셔츠와 네이비 바이커 쇼츠, 자연스러운 스튜디오 조명, 쇼핑몰 모델컷"
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
            const imageValidation = validateClientFile(imageReference);
            if (imageValidation) {
              setErrorMessage(imageValidation);
              return;
            }

            if (!promptText.trim()) {
              setErrorMessage("모델 설명을 입력해 주세요");
              return;
            }

            try {
              setLoading(true);
              setErrorMessage("");

              const summaryPrompt = [
                `사람 느낌: ${modelProfile}`,
                `보이는 범위: ${shotFrame}`,
                `사진 비율: ${aspectRatio}`,
                imageReference ? "참고 사진: 사용" : null,
                promptText.trim(),
              ]
                .filter(Boolean)
                .join(" / ");
              const apiPrompt = [shotFrame, modelProfile, promptText.trim()]
                .filter(Boolean)
                .join(", ");

              const formData = new FormData();
              if (imageReference) {
                formData.append("imageReference", imageReference);
              }
              formData.append("generationMode", generationMode);
              formData.append("aspectRatio", aspectRatio);
              formData.append("promptText", summaryPrompt);
              formData.append("apiPromptText", apiPrompt);

              const response = await createModelJob(formData);
              onCreditsReserved(response.job.id, getGenerationCreditCost("model", generationMode));
              setCurrentJob(response.job);
              setImageReference(null);
              setPromptText("");
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "모델 생성 요청에 실패했습니다. 다시 시도해 주세요",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "모델 이미지를 요청하는 중입니다" : "모델 이미지 만들기"}
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
                <img src={currentJob.outputUrl} alt="생성된 모델 이미지" />
              ) : (
                <div className="result-placeholder">
                  {currentJob.status === "failed"
                    ? "생성에 실패했습니다"
                    : "모델 이미지를 만드는 중입니다"}
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
                  <dt>모델 설명</dt>
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
            <strong>아직 생성한 모델 이미지가 없습니다</strong>
            <span>설명을 입력하고 새 모델 이미지를 먼저 만들어 보세요.</span>
          </div>
        )}
      </div>
    </section>
  );
}
