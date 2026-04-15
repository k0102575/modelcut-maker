import type { JobStatus } from "../../shared/contracts";

const formatter = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string): string {
  return formatter.format(new Date(value));
}

export function formatStatusLabel(status: JobStatus): string {
  switch (status) {
    case "pending":
      return "요청 완료";
    case "processing":
      return "이미지를 만드는 중";
    case "completed":
      return "완료";
    case "failed":
      return "실패";
    case "expired":
      return "만료됨";
    default:
      return status;
  }
}

export function formatModeLabel(mode: "person" | "virtual"): string {
  return mode === "person" ? "사람 사진 사용" : "가상 모델 생성";
}
