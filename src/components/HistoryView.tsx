import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { JobSummary } from "../../shared/contracts";
import { fetchJobs } from "../lib/api";
import { formatDateTime, formatModeLabel, parsePromptSummary } from "../lib/format";
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
    <section className="panel-stack history-page">
      <div className="history-header page-header">
        <div>
          <p className="eyebrow">History</p>
          <h2>최근 작업</h2>
          <p className="section-copy">
            생성된 이미지를 확인하고 내려받아 주세요. 최근 작업은 3일 동안만 표시됩니다.
          </p>
        </div>
        <div className="history-toolbar">
          <button type="button" className="secondary-button" onClick={() => void loadJobs()}>
            새로고침
          </button>
          <button type="button" className="ghost-chip" disabled>
            최신순
          </button>
        </div>
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
        <div className="history-grid">
          {jobs.map((job) => {
            const promptSummary = parsePromptSummary(job.promptText);

            return (
              <article className="history-card" key={job.id}>
                <button type="button" className="history-card-thumb" onClick={() => onOpenJob(job.id)}>
                  {job.outputUrl ? <img src={job.outputUrl} alt="작업 결과" /> : <span>대기</span>}
                </button>
                <div className="history-card-body">
                  <div className="history-card-head">
                    <StatusBadge status={job.status} />
                    <span>{formatDateTime(job.createdAt)}</span>
                  </div>
                  <strong className="history-card-title">{formatModeLabel(job.mode)}</strong>
                  <div className="history-prompt-panel">
                    {promptSummary.metadata.length > 0 ? (
                      <div className="history-prompt-tags">
                        {promptSummary.metadata.map((item) => (
                          <span key={`${job.id}-${item}`}>{item}</span>
                        ))}
                      </div>
                    ) : null}

                    {promptSummary.prompt ? (
                      <button
                        type="button"
                        className="history-prompt-button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(promptSummary.prompt);
                            toast.success("프롬프트를 복사했습니다");
                          } catch {
                            toast.error("프롬프트를 복사하지 못했습니다");
                          }
                        }}
                      >
                        <span className="history-prompt-label">추가 프롬프트</span>
                        <span className="history-prompt-copy">클릭해서 복사</span>
                        <span className="history-prompt-text">{promptSummary.prompt}</span>
                      </button>
                    ) : (
                      <div className="history-prompt-empty">추가 프롬프트 없음</div>
                    )}
                  </div>
                  <div className="history-card-actions">
                    {job.outputUrl ? (
                      <a className="primary-button" href={`/api/jobs/${job.id}/download`}>
                        내려받기
                      </a>
                    ) : null}
                    <button type="button" className="icon-button" onClick={() => onOpenJob(job.id)}>
                      보기
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
