import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { SessionUser } from "../shared/contracts";
import { fetchSession, login, logout } from "./lib/api";
import { getRouteFromLocation, navigateTo, type AppRoute } from "./lib/router";
import { HistoryView } from "./components/HistoryView";
import { JobDetailView } from "./components/JobDetailView";
import { LoginView } from "./components/LoginView";
import { WorkspaceView } from "./components/WorkspaceView";

function AppLayout({
  user,
  route,
  onNavigate,
  onLogout,
  children,
}: {
  user: SessionUser;
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => Promise<void>;
  children: ReactNode;
}) {
  const activeTab = route.name === "history" ? "history" : "workspace";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Model Cut Maker</p>
          <h1>모델컷 메이커</h1>
        </div>
        <div className="topbar-actions">
          <div className="user-chip">{user.label}</div>
          <button type="button" className="secondary-button" onClick={() => void onLogout()}>
            로그아웃
          </button>
        </div>
      </header>

      <div className="shell-body">
        <aside className="sidebar">
          <button
            type="button"
            className={`nav-item ${activeTab === "workspace" ? "active" : ""}`}
            onClick={() => onNavigate({ name: "workspace" })}
          >
            이미지 생성
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => onNavigate({ name: "history" })}
          >
            최근 작업
          </button>
          <div className="sidebar-note">
            최근 작업은 3일 동안만 표시됩니다.
          </div>
        </aside>

        <main className="content-panel">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromLocation());
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromLocation());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetchSession();
        if (!cancelled) {
          setSession(response.user);
          if (!response.user) {
            navigateTo({ name: "login" });
          } else if (route.name === "login") {
            navigateTo({ name: "workspace" });
          }
        }
      } finally {
        if (!cancelled) {
          setSessionLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const screen = useMemo(() => {
    if (!session) {
      return null;
    }

    if (route.name === "history") {
      return <HistoryView onOpenJob={(jobId) => navigateTo({ name: "job", jobId })} />;
    }

    if (route.name === "job") {
      return (
        <JobDetailView
          jobId={route.jobId}
          onBack={() => navigateTo({ name: "workspace" })}
        />
      );
    }

    return (
      <WorkspaceView
        onOpenHistory={() => navigateTo({ name: "history" })}
        onOpenJob={(jobId) => navigateTo({ name: "job", jobId })}
      />
    );
  }, [route, session]);

  if (sessionLoading) {
    return (
      <main className="login-page">
        <section className="login-card">
          <h1>불러오는 중입니다</h1>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <LoginView
        loading={authLoading}
        errorMessage={authError}
        onSubmit={async ({ loginId, password }) => {
          try {
            setAuthLoading(true);
            setAuthError("");
            const response = await login(loginId, password);
            setSession(response.user);
            navigateTo({ name: "workspace" });
          } catch (error) {
            setAuthError(
              error instanceof Error ? error.message : "로그인에 실패했습니다. 다시 시도해 주세요",
            );
          } finally {
            setAuthLoading(false);
          }
        }}
      />
    );
  }

  return (
    <AppLayout
      user={session}
      route={route}
      onNavigate={(nextRoute) => {
        setRoute(nextRoute);
        navigateTo(nextRoute);
      }}
      onLogout={async () => {
        await logout();
        setSession(null);
        navigateTo({ name: "login" });
      }}
    >
      {screen}
    </AppLayout>
  );
}
