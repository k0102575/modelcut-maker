# modelcut-maker

상품 사진으로 쇼핑몰용 모델컷 이미지를 만드는 내부용 웹 도구입니다.  
2명이 빠르게 작업할 수 있도록, 로그인부터 업로드, 생성, 결과 확인, 다운로드, 최근 3일 작업 확인까지 한 흐름으로 묶은 MVP를 목표로 합니다.

## 기술 스택

- Frontend: Vite + React + TypeScript
- Server: Cloudflare Pages Functions
- Database: Cloudflare D1
- AI: FASHN API
- Package manager: pnpm

## 현재 포함된 기능

- 고정 계정 로그인
- 상품 사진 업로드
- 사람 사진 선택 업로드
- 추가 요청 문구 입력
- FASHN 서버 요청 생성
- 생성 상태 조회
- 결과 상세 확인
- 결과 다운로드
- 최근 3일 작업 목록 조회

## 로컬 실행 방법

### 1. 패키지 설치

```bash
pnpm install
```

### 2. 환경변수 준비

```bash
cp .dev.vars.example .dev.vars
```

아래 값을 채워 주세요.

- `APP_LOGIN_ID`
- `APP_LOGIN_PASSWORD`
- `SESSION_SECRET`
- `FASHN_API_KEY`

이 프로젝트는 현재 `.env`를 사용하지 않습니다.

### 3. 프론트 화면만 빠르게 확인

```bash
pnpm dev
```

브라우저에서 `http://localhost:5173` 로 확인합니다.  
이 모드에서는 디자인과 화면 흐름만 확인할 수 있고, `/api/*` 호출은 동작하지 않습니다.

### 4. 로컬 통합 테스트 준비

Cloudflare Pages Functions와 D1까지 같이 확인하려면 D1 바인딩용 `database_id`가 한 번은 필요합니다.  
이 단계는 Pages를 먼저 배포하라는 뜻이 아니라, D1 데이터베이스를 한 번 생성해서 식별자만 받아오면 된다는 뜻입니다.

```bash
pnpm exec wrangler d1 create modelcut-maker
```

위 명령으로 나온 `database_id`를 따로 메모해 두세요.  
이 값은 공개 저장소에 커밋하지 말고, 로컬 설정 파일과 실행 명령에만 사용하면 됩니다.

### 5. 로컬 D1 설정 파일 준비

`wrangler d1 migrations apply` 는 D1 바인딩 정보가 들어 있는 설정 파일을 읽습니다.  
그래서 로컬 전용 설정 파일을 하나 따로 둡니다.

```bash
cp wrangler.local.example.toml wrangler.local.toml
```

그 다음 `wrangler.local.toml` 안의 `database_id`를 방금 받은 실제 값으로 바꿔 주세요.

### 6. D1 로컬 스키마 적용

```bash
pnpm migrate:local
```

### 7. Cloudflare Functions 포함 전체 확인

```bash
pnpm build
pnpm exec wrangler pages dev dist --d1 DB=여기에_DATABASE_ID
```

브라우저에서 Wrangler가 안내하는 주소로 접속합니다.  
이 모드에서 로그인, 생성 API, D1 조회까지 함께 확인할 수 있습니다.

정리하면 로컬 통합 테스트에서는 두 가지를 함께 씁니다.

- `wrangler.local.toml`: 로컬 D1 마이그레이션용
- `--d1 DB=...`: `wrangler pages dev` 실행용

## Cloudflare Pages 배포 방법

### 1. D1 생성

```bash
pnpm exec wrangler d1 create modelcut-maker
```

생성 후 나온 `database_id` 는 공개 저장소 파일에 넣지 말고 Cloudflare Pages 대시보드 바인딩 설정에만 넣어 주세요.

### 2. 마이그레이션 적용

```bash
pnpm exec wrangler d1 migrations apply modelcut-maker
```

### 3. Pages 프로젝트 설정

- Build command: `pnpm build`
- Build output directory: `dist`
- Functions directory: `functions`

### 4. Pages 환경변수 등록

- `APP_LOGIN_ID`
- `APP_LOGIN_PASSWORD`
- `SESSION_SECRET`
- `FASHN_API_KEY`

### 5. D1 바인딩 연결

공개 저장소의 기본 [wrangler.toml](wrangler.toml) 에는 실제 D1 식별자를 넣지 않습니다.

- 로컬 마이그레이션: `wrangler.local.toml` 사용
- 로컬 통합 테스트: `pnpm exec wrangler pages dev dist --d1 DB=실제_DATABASE_ID`
- 배포 환경: Cloudflare Pages 대시보드에서 `DB` 바인딩으로 연결

### 6. 브라우저 라우팅 처리

앱 라우팅은 React Router의 브라우저 라우팅을 사용합니다.

- `/login`
- `/`
- `/history`
- `/jobs/:jobId`

Cloudflare Pages에서는 top-level `404.html`을 두지 않으면 SPA fallback이 기본 동작합니다.  
현재 `_routes.json`은 `/api/*`만 Functions로 보내고 있으므로, 브라우저 라우트 새로고침도 함께 처리됩니다.

## 로그인 방식

- 회원가입은 없습니다.
- 내부용 고정 계정만 사용합니다.
- 로그인 성공 시 세션 쿠키로 인증을 유지합니다.
- 로그아웃 버튼으로 세션을 종료할 수 있습니다.

## 최근 작업 3일 정책

- 최근 작업 메타데이터만 D1에 저장합니다.
- 결과 이미지는 장기 저장하지 않습니다.
- 최근 작업 목록은 `expires_at` 기준으로 최근 3일만 보여줍니다.
- 3일이 지나면 목록에서 자동으로 숨겨집니다.

## FASHN 설정 방식

- FASHN API는 브라우저에서 직접 호출하지 않습니다.
- 모든 요청은 Pages Functions에서 처리합니다.
- 상품 사진은 필수입니다.
- 사람 사진이 있으면 `person` 모드, 없으면 `virtual` 모드로 저장합니다.
- 생성 후 prediction id를 저장하고 상태 조회로 완료 여부를 갱신합니다.

## 공개 저장소 올리기 전 체크

- `.dev.vars`, `wrangler.local.toml`, `.wrangler/` 가 Git에 포함되지 않는지 확인
- `FASHN_API_KEY`, `SESSION_SECRET`, 실제 로그인 비밀번호를 예시 파일이 아닌 실제 환경에만 넣었는지 확인
- 실제 `database_id` 를 `wrangler.toml` 에 넣지 않았는지 확인
- 내부용 문서인 `AGENTS.md` 가 커밋 대상에 없는지 확인
- 필요 없으면 `stitch_ai/` 시안 파일도 공개 여부를 한 번 더 확인
- 커밋 전 `pnpm check` 와 `pnpm build` 를 다시 실행

## 주요 파일

- [src/App.tsx](src/App.tsx)
- [src/components/WorkspaceView.tsx](src/components/WorkspaceView.tsx)
- [src/components/JobDetailView.tsx](src/components/JobDetailView.tsx)
- [functions/api/generate.ts](functions/api/generate.ts)
- [functions/api/jobs/[id]/status.ts](functions/api/jobs/[id]/status.ts)
- [functions/_shared/fashn.ts](functions/_shared/fashn.ts)
- [migrations/0001_create_jobs.sql](migrations/0001_create_jobs.sql)

## TODO

- 실제 시안과 1:1로 맞추는 세부 간격 보정
- 운영 계정 정보와 D1 바인딩값 실제 배포 환경에 연결
- 필요하면 실패 사유 문구를 더 세분화
