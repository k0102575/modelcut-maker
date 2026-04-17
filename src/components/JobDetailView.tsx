import { useEffect, useState } from "react";
import type { JobSummary } from "../../shared/contracts";
import { fetchJob, pollJob } from "../lib/api";
import { formatDateTime, formatModeLabel } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

type Props = {
  jobId: string;
  onBack: () => void;
};

export function JobDetailView({ jobId, onBack }: Props) {
  const [job, setJob] = useState<JobSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      try {
        const response = await fetchJob(jobId);
        if (!cancelled) {
          setJob(response.job);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "작업을 불러오지 못했습니다");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadJob();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  useEffect(() => {
    if (!job || (job.status !== "pending" && job.status !== "processing")) {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await pollJob(job.id);
        setJob(response.job);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    }, 4000);

    return () => window.clearInterval(timer);
  }, [job]);

  if (loading) {
    return (
      <section className="panel-stack">
        <div className="empty-card">
          <strong>작업을 불러오는 중입니다</strong>
        </div>
      </section>
    );
  }

  if (errorMessage || !job) {
    return (
      <section className="panel-stack">
        <button type="button" className="secondary-button" onClick={onBack}>
          이전으로
        </button>
        <p className="error-text">{errorMessage || "작업을 찾지 못했습니다"}</p>
      </section>
    );
  }

  return (
    <section className="detail-page">
      <div className="detail-header page-header">
        <div>
          <p className="eyebrow">Detail</p>
          <h2>작업 상세 기록</h2>
          <p className="section-copy">생성된 결과를 확인하고 바로 내려받을 수 있습니다.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onBack}>
          이전으로
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-preview">
        {job.outputUrl ? (
          <img src={job.outputUrl} alt="생성 결과 상세" />
        ) : (
          <div className="result-placeholder large">
            {job.status === "failed" ? "생성에 실패했습니다" : "이미지를 만드는 중입니다"}
          </div>
        )}
        </div>

        <div className="detail-card">
          <div className="detail-head">
            <StatusBadge status={job.status} />
            <span>작업 ID {job.id.slice(0, 8)}</span>
          </div>

          <div className="detail-summary-block">
            <h3>적용된 설정</h3>
            <div className="detail-tags">
              <span>{formatModeLabel(job.mode)}</span>
              <span>생성 {formatDateTime(job.createdAt)}</span>
              <span>만료 {formatDateTime(job.expiresAt)}</span>
            </div>
          </div>

          <dl className="summary-list detail-summary-list">
            <div>
              <dt>생성 방식</dt>
              <dd>{formatModeLabel(job.mode)}</dd>
            </div>
            <div>
              <dt>생성 시각</dt>
              <dd>{formatDateTime(job.createdAt)}</dd>
            </div>
            <div>
              <dt>만료 시각</dt>
              <dd>{formatDateTime(job.expiresAt)}</dd>
            </div>
            <div>
              <dt>추가 요청</dt>
              <dd>{job.promptText || "없음"}</dd>
            </div>
          </dl>

          <div className="detail-summary-block">
            <h3>추가 프롬프트</h3>
            <p className="detail-prompt">{job.promptText || "없음"}</p>
          </div>

          {job.errorMessage ? <p className="error-text">{job.errorMessage}</p> : null}

          <div className="action-column">
            {job.outputUrl ? (
              <a className="primary-button" href={job.outputUrl} download>
                결과 내려받기
              </a>
            ) : null}
            <button type="button" className="secondary-button" onClick={onBack}>
              다시 생성하러 가기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
