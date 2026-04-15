export type AppRoute =
  | { name: "login" }
  | { name: "workspace" }
  | { name: "history" }
  | { name: "job"; jobId: string };

function parseHash(hash: string): AppRoute {
  const cleaned = hash.replace(/^#/, "") || "/";
  const segments = cleaned.split("/").filter(Boolean);

  if (segments[0] === "login") {
    return { name: "login" };
  }

  if (segments[0] === "history") {
    return { name: "history" };
  }

  if (segments[0] === "jobs" && segments[1]) {
    return { name: "job", jobId: decodeURIComponent(segments[1]) };
  }

  return { name: "workspace" };
}

export function getRouteFromLocation(): AppRoute {
  return parseHash(window.location.hash);
}

export function navigateTo(route: AppRoute): void {
  if (route.name === "login") {
    window.location.hash = "/login";
    return;
  }

  if (route.name === "history") {
    window.location.hash = "/history";
    return;
  }

  if (route.name === "job") {
    window.location.hash = `/jobs/${encodeURIComponent(route.jobId)}`;
    return;
  }

  window.location.hash = "/";
}
