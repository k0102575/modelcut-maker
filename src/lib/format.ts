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
  return mode === "person" ? "기준 인물에 입히기" : "가상 모델 생성";
}

export function parsePromptSummary(promptText: string): {
  metadata: string[];
  prompt: string;
} {
  const metadataPrefixes = ["카테고리:", "모델 설정:", "촬영 방향:", "배경 참고:"];
  const items = promptText
    .split(" / ")
    .map((item) => item.trim())
    .filter(Boolean);

  const metadata = items.filter((item) =>
    metadataPrefixes.some((prefix) => item.startsWith(prefix)),
  );
  const prompt = items
    .filter((item) => !metadataPrefixes.some((prefix) => item.startsWith(prefix)))
    .join(" / ");

  return {
    metadata,
    prompt,
  };
}
