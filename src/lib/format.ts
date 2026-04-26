import type { JobMode, JobStatus } from "../../shared/contracts";

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

export function formatModeLabel(mode: JobMode): string {
  if (mode === "person") {
    return "사람 사진에 옷 입히기";
  }

  if (mode === "swap") {
    return "모델만 바꾸기";
  }

  if (mode === "edit") {
    return "이미지 조금 수정하기";
  }

  if (mode === "model") {
    return "모델 이미지 먼저 만들기";
  }

  return "옷으로 바로 모델컷 만들기";
}

export function parsePromptSummary(promptText: string): {
  metadata: string[];
  prompt: string;
} {
  const metadataPrefixes = [
    "카테고리:",
    "모델 성별:",
    "모델 설정:",
    "촬영 방향:",
    "배경 참고:",
    "사진 비율:",
    "이미지 비율:",
    "배경 느낌:",
    "배경 스타일:",
    "모델 느낌:",
    "촬영 구도:",
    "사람 느낌:",
    "보이는 범위:",
    "참고 사진:",
    "참고 얼굴 사진:",
    "참고 이미지:",
  ];
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
