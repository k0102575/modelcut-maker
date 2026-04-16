import { useEffect, useState, type ReactNode } from "react";
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { SessionUser } from "../shared/contracts";
import { fetchSession, login, logout } from "./lib/api";
import { HistoryView } from "./components/HistoryView";
import { JobDetailView } from "./components/JobDetailView";
import { LoginView } from "./components/LoginView";
import { WorkspaceView } from "./components/WorkspaceView";

function AppLayout({
  user,
  pathname,
  onLogout,
  children,
}: {
  user: SessionUser;
  pathname: string;
  onLogout: () => Promise<void>;
  children: ReactNode;
}) {
  const activeTab = pathname === "/history" ? "history" : "workspace";

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
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${(isActive || activeTab === "workspace") ? "active" : ""}`
            }
          >
            이미지 생성
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            최근 작업
          </NavLink>
          <div className="sidebar-note">
            최근 작업은 3일 동안만 표시됩니다.
          </div>
        </aside>

        <main className="content-panel">{children}</main>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="login-page">
      <section className="login-card">
        <h1>불러오는 중입니다</h1>
      </section>
    </main>
  );
}

function ProtectedLayout({
  session,
  sessionLoading,
  onLogout,
}: {
  session: SessionUser | null;
  sessionLoading: boolean;
  onLogout: () => Promise<void>;
}) {
  const location = useLocation();

  if (sessionLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <AppLayout
      user={session}
      pathname={location.pathname}
      onLogout={onLogout}
    >
      <Outlet />
    </AppLayout>
  );
}

function JobDetailRoute() {
  const navigate = useNavigate();
  const params = useParams<{ jobId: string }>();

  if (!params.jobId) {
    return <Navigate to="/" replace />;
  }

  return <JobDetailView jobId={params.jobId} onBack={() => navigate("/")} />;
}

export default function App() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetchSession();
        if (!cancelled) {
          setSession(response.user);
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

  return (
    <Routes>
      <Route
        path="/login"
        element={
          sessionLoading ? (
            <LoadingScreen />
          ) : session ? (
            <Navigate to="/" replace />
          ) : (
            <LoginView
              loading={authLoading}
              errorMessage={authError}
              onSubmit={async ({ loginId, password }) => {
                try {
                  setAuthLoading(true);
                  setAuthError("");
                  const response = await login(loginId, password);
                  setSession(response.user);
                  const nextPath =
                    typeof location.state === "object" &&
                    location.state &&
                    "from" in location.state &&
                    typeof location.state.from === "string"
                      ? location.state.from
                      : "/";
                  navigate(nextPath, { replace: true });
                } catch (error) {
                  setAuthError(
                    error instanceof Error
                      ? error.message
                      : "로그인에 실패했습니다. 다시 시도해 주세요",
                  );
                } finally {
                  setAuthLoading(false);
                }
              }}
            />
          )
        }
      />

      <Route
        element={
          <ProtectedLayout
            session={session}
            sessionLoading={sessionLoading}
            onLogout={async () => {
              await logout();
              setSession(null);
              navigate("/login", { replace: true });
            }}
          />
        }
      >
        <Route
          path="/"
          element={
            <WorkspaceView
              onOpenHistory={() => navigate("/history")}
              onOpenJob={(jobId) => navigate(`/jobs/${jobId}`)}
            />
          }
        />
        <Route
          path="/history"
          element={<HistoryView onOpenJob={(jobId) => navigate(`/jobs/${jobId}`)} />}
        />
        <Route path="/jobs/:jobId" element={<JobDetailRoute />} />
      </Route>

      <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
    </Routes>
  );
}
