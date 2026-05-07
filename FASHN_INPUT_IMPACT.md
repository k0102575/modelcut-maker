# FASHN 입력 영향도 정리

작성일: 2026-05-07

이 문서는 현재 프로젝트에서 사용 중인 입력값이 FASHN API 결과에 얼마나 직접적으로 영향을 주는지 정리한 참고 문서다.

기준:
- FASHN 공식 문서
- 현재 프로젝트 코드 기준 실제 payload 전달 방식

## 기준

### 강한 정보

- FASHN API 전용 파라미터로 직접 들어가는 값
- 입력 구조 자체를 바꾸는 값
- 결과에 비교적 직접적인 영향을 주는 값

예:
- `product_image`
- `model_image`
- `background_reference`
- `image_reference`
- `face_reference`
- `aspect_ratio`
- `generation_mode`

### 약한 정보

- 자연어 `prompt` 문장 안에 들어가는 값
- 모델이 해석해서 반영해야 하는 값
- 무시되거나 약하게 반영될 가능성이 있는 값

예:
- `카테고리`
- `배경 느낌`
- `사람 느낌`
- `보이는 범위`
- `촬영 방향`
- 자유 입력 추가 요청

## 1. 옷으로 바로 모델컷 만들기

사용 모델:
- `product-to-model`

관련 코드:
- [src/components/WorkspaceView.tsx](src/components/WorkspaceView.tsx)
- [functions/api/generate.ts](functions/api/generate.ts)
- [functions/_shared/fashn.ts](functions/_shared/fashn.ts)

### 강한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 상품 사진 | `product_image` | 강함 | 필수 |
| 배경 사진 | `background_reference` | 강함 | 배경 사진이 있으면 이 값이 우선 |
| 생성 품질 | `generation_mode` | 강함 | `fast / balanced / quality` |
| 사진 비율 | `aspect_ratio` | 강함 | `1:1 / 3:4 / 4:5` |

### 약한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 카테고리 | `prompt` 문장 안 `카테고리: ...` | 약함 | 전용 파라미터 아님 |
| 모델 성별 | `prompt` 문장 안 `모델 성별: ...` | 약함 | 문장 해석 의존 |
| 배경 느낌 | `prompt` 문장 안 텍스트 | 약함~중간 | 배경 사진이 없을 때만 사용 |
| 촬영 방향 | `prompt` 문장 안 `촬영 방향: ...` | 약함 | 정면/측면/뒷면 유도용 |
| 추가 요청 | `prompt` | 약함~중간 | 문장 품질에 따라 차이 큼 |

### 주의

- 배경 사진을 올리면 `배경 느낌`은 UI에서 비활성화된다.
- `카테고리`는 프롬프트에 들어가지만 전용 제어값은 아니다.

## 2. 사람 사진에 옷 입히기

사용 모델:
- `tryon-max`

관련 코드:
- [src/components/WorkspaceView.tsx](src/components/WorkspaceView.tsx)
- [functions/api/generate.ts](functions/api/generate.ts)
- [functions/_shared/fashn.ts](functions/_shared/fashn.ts)

### 강한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 상품 사진 | `product_image` | 강함 | 필수 |
| 기준 인물 사진 | `model_image` | 강함 | 필수 |
| 생성 품질 | `generation_mode` | 강함 | 현재 `balanced / quality`만 사용 |

### 약한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 카테고리 | `prompt`에 `topwear styling`, `bottomwear styling`, `dress styling`, `women's two-piece set styling` 식으로 변환 | 약함~중간 | 전용 파라미터 아님 |
| 촬영 방향 | `prompt`에 `front view`, `side view`, `back view` 식으로 변환 | 약함~중간 | 방향 유도용 |
| 추가 요청 | `prompt` | 약함 | 실사용 테스트 기준으로 반영이 약한 편 |

### 주의

- 이 기능은 현재 `apiPromptText`에 `카테고리 + 촬영 방향 + 추가 요청`이 함께 들어간다.
- 다만 `tryon-max`는 문서상도 기존 인물 유지 중심이라, 자연어 프롬프트 영향은 큰 편이 아니다.

## 3. 모델 이미지 먼저 만들기

사용 모델:
- `model-create`

관련 코드:
- [src/components/ModelCreateView.tsx](src/components/ModelCreateView.tsx)
- [functions/api/model-create.ts](functions/api/model-create.ts)
- [functions/_shared/fashn.ts](functions/_shared/fashn.ts)

### 강한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 모델 설명 | `prompt` | 중간~강함 | 이 기능에서는 핵심 입력 |
| 참고 사진 | `image_reference` | 강함 | 구도/포즈 참고 |
| 사진 비율 | `aspect_ratio` | 강함 | 결과 비율 직접 지정 |
| 생성 품질 | `generation_mode` | 강함 | 속도/비용/디테일 차이 큼 |

### 약한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 사람 느낌 | `prompt`에 합쳐짐 | 약함~중간 | 전용 파라미터 아님 |
| 보이는 범위 | `prompt`에 합쳐짐 | 약함~중간 | 전신/상반신 유도용 |

### 주의

- 이 기능은 `prompt` 자체가 메인 입력이라서, 다른 기능보다 자연어 영향이 상대적으로 큰 편이다.
- 그래도 `사람 느낌`, `보이는 범위`는 여전히 자연어 힌트다.

## 4. 이미지 조금 수정하기

사용 모델:
- `edit`

관련 코드:
- [src/components/EditView.tsx](src/components/EditView.tsx)
- [functions/api/edit.ts](functions/api/edit.ts)
- [functions/_shared/fashn.ts](functions/_shared/fashn.ts)

### 강한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 원본 이미지 | `image` | 강함 | 필수 |
| 참고 이미지 | `image_context` | 강함~중간 | 배경/구도 참고 |
| 수정할 내용 | `prompt` | 중간~강함 | 이 기능에서는 핵심 입력 |

### 주의

- 이 기능은 현재 별도 드롭다운 없이 `원본 이미지 + 자연어 수정 요청` 중심이다.
- 한 번에 여러 요구를 넣으면 결과가 불안정해질 수 있다.

## 5. 모델만 바꾸기

사용 모델:
- `model-swap`

현재 상태:
- 코드에는 남아 있음
- UI에서는 현재 숨김 처리됨

관련 코드:
- [src/components/ModelSwapView.tsx](src/components/ModelSwapView.tsx)
- [functions/api/model-swap.ts](functions/api/model-swap.ts)
- [functions/_shared/fashn.ts](functions/_shared/fashn.ts)

### 강한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 원본 이미지 | `model_image` | 강함 | 필수 |
| 참고 얼굴 사진 | `face_reference` | 강함 | 사람 정체성 제어에 가장 직접적 |
| 생성 품질 | `generation_mode` | 강함 | 속도/비용/디테일 차이 |

### 약한 정보

| 화면 입력 | API 전달 방식 | 영향도 | 메모 |
| --- | --- | --- | --- |
| 사람 설명 | `prompt` | 약함~중간 | 성별/나이대/분위기 힌트 |

## 6. 지금 기준으로 가장 강하게 믿어도 되는 입력

- 상품 사진
- 사람 사진
- 참고 사진
- 배경 사진
- 참고 얼굴 사진
- 생성 품질
- 사진 비율

## 7. 지금 기준으로 결과 영향이 상대적으로 약한 입력

- 카테고리
- 모델 성별
- 사람 느낌
- 보이는 범위
- 촬영 방향
- 배경 느낌
- 자유 입력 추가 요청

다만 이 중에서도 차이가 있다.

- `배경 느낌`, `사람 느낌`, `보이는 범위`, `추가 요청`
  - 자연어 프롬프트 중심이지만, 문장 품질에 따라 어느 정도 도움될 수 있다
- `카테고리`
  - 현재 가장 애매한 값
  - 프롬프트에는 들어가지만 직접 제어력은 강하지 않다

## 8. 여성세트 요청과 관련한 해석

`여성세트`는 현재 구조에서 추가되어 있다.  
다만 아래 중 어느 역할로 볼지 먼저 정해야 한다.

### 1. 분류값 + 약한 프롬프트 힌트

- 드롭다운 선택용
- 최근 작업 기록용
- 프롬프트 힌트용
- 결과 제어 기대는 낮음

### 2. 강한 제어 옵션처럼 기대

- 현재 FASHN API 구조상 권장하기 어려움
- 전용 파라미터가 아니라 프롬프트 해석 의존이기 때문

즉 `여성세트`는 추가 자체는 쉽지만, 결과를 강하게 바꾸는 옵션으로 보긴 어렵다.

## 참고 문서

- [Product to Model](https://docs.fashn.ai/api-reference/product-to-model)
- [Try-On Max](https://docs.fashn.ai/api-reference/tryon-max)
- [Model Create](https://docs.fashn.ai/api-reference/model-create)
- [Model Swap](https://docs.fashn.ai/api-reference/model-swap)
- [Edit](https://docs.fashn.ai/api-reference/edit)
- [API Fundamentals](https://docs.fashn.ai/api-overview/api-fundamentals)
