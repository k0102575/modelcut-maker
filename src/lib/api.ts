import type {
  CreditsResponse,
  JobResponse,
  JobsResponse,
  LoginResponse,
  SessionResponse,
} from "../../shared/contracts";

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }
  headers.set("accept", "application/json");

  const response = await fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });

  const data = (await response.json().catch(() => null)) as { message?: string } | T | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : "요청을 처리하지 못했습니다. 다시 시도해 주세요";
    throw new Error(message);
  }

  return data as T;
}

export async function fetchSession(): Promise<SessionResponse> {
  return request<SessionResponse>("/api/auth/session", {
    method: "GET",
    headers: {},
  });
}

export async function login(loginId: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId, password }),
  });
}

export async function logout(): Promise<void> {
  await request("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function createJob(formData: FormData): Promise<JobResponse> {
  return request<JobResponse>("/api/generate", {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function createModelJob(formData: FormData): Promise<JobResponse> {
  return request<JobResponse>("/api/model-create", {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function createModelSwapJob(formData: FormData): Promise<JobResponse> {
  return request<JobResponse>("/api/model-swap", {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function createEditJob(formData: FormData): Promise<JobResponse> {
  return request<JobResponse>("/api/edit", {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function fetchCredits(): Promise<CreditsResponse> {
  return request<CreditsResponse>("/api/credits", {
    method: "GET",
    headers: {},
  });
}

export async function fetchJobs(): Promise<JobsResponse> {
  return request<JobsResponse>("/api/jobs", {
    method: "GET",
    headers: {},
  });
}

export async function fetchJob(jobId: string): Promise<JobResponse> {
  return request<JobResponse>(`/api/jobs/${jobId}`, {
    method: "GET",
    headers: {},
  });
}

export async function pollJob(jobId: string): Promise<JobResponse> {
  return request<JobResponse>(`/api/jobs/${jobId}/status`, {
    method: "GET",
    headers: {},
  });
}
