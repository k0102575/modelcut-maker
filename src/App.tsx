import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { fetchCredits, fetchSession, login, logout } from "./lib/api";
import { HistoryView } from "./components/HistoryView";
import { JobDetailView } from "./components/JobDetailView";
import { LoginView } from "./components/LoginView";
import { WorkspaceView } from "./components/WorkspaceView";

function AppLayout({
  credits,
  creditsLoading,
  creditsError,
  onLogout,
  children,
}: {
  credits: number | null;
  creditsLoading: boolean;
  creditsError: boolean;
  onLogout: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <header className="topbar topbar-fixed">
        <div className="topbar-brand">
          <div className="topbar-brand-copy">
            <span className="topbar-kicker">새로본</span>
            <span className="topbar-title">모델컷 메이커</span>
          </div>
          <p className="topbar-notice">
            결과 이미지는 바로 확인하고 내려받아 주세요. 최근 작업은 3일 동안만 표시됩니다.
          </p>
        </div>
        <div className="topbar-actions">
          <div
            className={`credit-chip ${creditsLoading ? "loading" : ""} ${creditsError ? "error" : ""}`}
          >
            {creditsLoading
              ? "크레딧 불러오는 중"
              : creditsError
                ? "크레딧 확인 안됨"
                : `크레딧 ${credits ?? 0}`}
          </div>
          <button type="button" className="secondary-button" onClick={() => void onLogout()}>
            로그아웃
          </button>
        </div>
      </header>

      <div className="shell-body">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark">AI</div>
            <div>
              <strong>새로본</strong>
              <span>모델컷 메이커</span>
            </div>
          </div>
          <div className="sidebar-nav">
            <NavLink
              to="/virtual"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              옷으로 바로 모델컷 만들기
            </NavLink>
            <NavLink
              to="/person"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              사람 사진에 옷 입히기
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              최근 작업
            </NavLink>
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
  credits,
  creditsLoading,
  creditsError,
  onLogout,
}: {
  session: SessionUser | null;
  sessionLoading: boolean;
  credits: number | null;
  creditsLoading: boolean;
  creditsError: boolean;
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
      credits={credits}
      creditsLoading={creditsLoading}
      creditsError={creditsError}
      onLogout={onLogout}
    >
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsError, setCreditsError] = useState(false);
  const reservedCreditsByJobIdRef = useRef<Record<string, number>>({});
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

  useEffect(() => {
    if (!session) {
      setCredits(null);
      setCreditsLoading(false);
      setCreditsError(false);
      reservedCreditsByJobIdRef.current = {};
      return undefined;
    }

    let cancelled = false;

    async function loadCredits() {
      if (!cancelled) {
        setCreditsLoading(true);
        setCreditsError(false);
      }

      try {
        const response = await fetchCredits();
        if (!cancelled) {
          setCredits(response.credits.total);
        }
      } catch {
        if (!cancelled) {
          setCredits(null);
          setCreditsError(true);
        }
      } finally {
        if (!cancelled) {
          setCreditsLoading(false);
        }
      }
    }

    void loadCredits();

    return () => {
      cancelled = true;
    };
  }, [session]);

  function reserveCredits(jobId: string, cost: number) {
    if (reservedCreditsByJobIdRef.current[jobId]) {
      return;
    }

    reservedCreditsByJobIdRef.current = {
      ...reservedCreditsByJobIdRef.current,
      [jobId]: cost,
    };

    setCredits((current) => (current === null ? current : Math.max(current - cost, 0)));
  }

  function settleReservedCredits(jobId: string, status: "completed" | "failed" | "expired") {
    const cost = reservedCreditsByJobIdRef.current[jobId];
    if (!cost) {
      return;
    }

    const nextReservedCredits = { ...reservedCreditsByJobIdRef.current };
    delete nextReservedCredits[jobId];
    reservedCreditsByJobIdRef.current = nextReservedCredits;

    if (status === "failed" || status === "expired") {
      setCredits((current) => (current === null ? current : current + cost));
    }
  }

  function JobDetailRouteWithCredits() {
    const navigateTo = useNavigate();
    const params = useParams<{ jobId: string }>();

    if (!params.jobId) {
      return <Navigate to="/" replace />;
    }

    return (
      <JobDetailView
        jobId={params.jobId}
        onBack={() => navigateTo(-1)}
        onJobSettled={settleReservedCredits}
      />
    );
  }

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
                      : "/virtual";
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
            credits={credits}
            creditsLoading={creditsLoading}
            creditsError={creditsError}
            onLogout={async () => {
              await logout();
              reservedCreditsByJobIdRef.current = {};
              setCredits(null);
              setCreditsLoading(false);
              setCreditsError(false);
              setSession(null);
              navigate("/login", { replace: true });
            }}
          />
        }
      >
        <Route
          path="/virtual"
          element={
            <WorkspaceView
              workspaceMode="virtual"
              onOpenHistory={() => navigate("/history")}
              onOpenJob={(jobId) => navigate(`/jobs/${jobId}`)}
              onCreditsReserved={reserveCredits}
              onJobSettled={settleReservedCredits}
            />
          }
        />
        <Route
          path="/person"
          element={
            <WorkspaceView
              workspaceMode="person"
              onOpenHistory={() => navigate("/history")}
              onOpenJob={(jobId) => navigate(`/jobs/${jobId}`)}
              onCreditsReserved={reserveCredits}
              onJobSettled={settleReservedCredits}
            />
          }
        />
        <Route
          path="/history"
          element={<HistoryView onOpenJob={(jobId) => navigate(`/jobs/${jobId}`)} />}
        />
        <Route path="/jobs/:jobId" element={<JobDetailRouteWithCredits />} />
      </Route>

      <Route path="/" element={<Navigate to={session ? "/virtual" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={session ? "/virtual" : "/login"} replace />} />
    </Routes>
  );
}
