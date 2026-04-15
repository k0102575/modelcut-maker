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
      <section className="login-card">
        <div className="brand-mark">MC</div>
        <p className="eyebrow">Internal AI Tool</p>
        <h1>모델컷 메이커</h1>
        <p className="login-description">
          상품 사진으로 모델컷 이미지를 빠르게 만드는 내부용 작업 화면입니다.
        </p>

        <form
          className="login-form"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({ loginId, password });
          }}
        >
          <label className="input-group">
            <span>아이디</span>
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="아이디를 입력해 주세요"
              autoComplete="username"
            />
          </label>

          <label className="input-group">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="current-password"
            />
          </label>

          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "로그인 중입니다" : "작업 시작하기"}
          </button>
        </form>

        <p className="login-note">내부 계정만 사용할 수 있습니다.</p>
      </section>
    </main>
  );
}
