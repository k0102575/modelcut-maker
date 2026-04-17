import { useState } from "react";

type Props = {
  loading: boolean;
  errorMessage: string;
  onSubmit: (input: { loginId: string; password: string }) => Promise<void>;
};

export function LoginView({ loading, errorMessage, onSubmit }: Props) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-branding page-header page-header-login">
          <div className="brand-mark">AI</div>
          <p className="eyebrow">Internal Studio</p>
          <h1>모델컷 메이커</h1>
          <p className="login-description">내부 계정으로 로그인하고 바로 작업을 시작해 주세요.</p>
        </div>

        <section className="login-card">
          <form
            className="login-form"
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmit({ loginId, password });
            }}
          >
            <label className="input-group">
              <span>아이디</span>
              <div className="input-with-icon">
                <span className="input-icon">＠</span>
                <input
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  placeholder="아이디를 입력해 주세요"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="input-group">
              <span>비밀번호</span>
              <div className="input-with-icon">
                <span className="input-icon">●</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호를 입력해 주세요"
                  autoComplete="current-password"
                />
              </div>
            </label>

            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

            <button className="primary-button login-submit" type="submit" disabled={loading}>
              {loading ? "로그인 중입니다" : "작업 시작하기"}
            </button>
          </form>

          <div className="login-divider" />
          <p className="login-note">내부 계정만 사용할 수 있습니다.</p>
        </section>

        <div className="login-status">
          <span className="status-dot" />
          <span>내부 작업 시스템 연결 준비 완료</span>
        </div>
      </section>
    </main>
  );
}
