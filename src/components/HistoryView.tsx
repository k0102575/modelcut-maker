import { useEffect, useState } from "react";
import type { JobSummary } from "../../shared/contracts";
import { fetchJobs } from "../lib/api";
import { formatDateTime, formatModeLabel } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

type Props = {
  onOpenJob: (jobId: string) => void;
};

export function HistoryView({ onOpenJob }: Props) {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadJobs() {
    try {
      setLoading(true);
      const response = await fetchJobs();
      setJobs(response.jobs);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "최근 작업을 불러오지 못했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  return (
    <section className="panel-stack">
      <div className="section-title">
        <div>
          <p className="eyebrow">History</p>
          <h2>최근 작업 목록</h2>
          <p className="section-copy">최근 작업은 3일 동안만 표시됩니다.</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadJobs()}>
          새로고침
        </button>
      </div>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      {loading ? (
        <div className="empty-card">
          <strong>최근 작업을 불러오는 중입니다</strong>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-card">
          <strong>최근 작업이 없습니다</strong>
          <span>워크스페이스에서 이미지를 먼저 만들어 주세요.</span>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <article className="job-card" key={job.id}>
              <button type="button" className="job-thumb large" onClick={() => onOpenJob(job.id)}>
                {job.outputUrl ? <img src={job.outputUrl} alt="작업 결과" /> : <span>대기</span>}
              </button>
              <div className="job-meta">
                <div className="job-topline">
                  <StatusBadge status={job.status} />
                  <span>{formatDateTime(job.createdAt)}</span>
                </div>
                <strong>{formatModeLabel(job.mode)}</strong>
                <p>{job.promptText || "추가 요청 없음"}</p>
                <div className="job-actions">
                  <button type="button" className="secondary-button" onClick={() => onOpenJob(job.id)}>
                    상세 보기
                  </button>
                  {job.outputUrl ? (
                    <a className="primary-button" href={job.outputUrl} download>
                      내려받기
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
