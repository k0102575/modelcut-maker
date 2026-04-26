function HelpSection({
  id,
  eyebrow,
  title,
  summary,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="help-section">
      <div className="help-section-head">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p className="section-copy">{summary}</p>
      </div>
      <div className="help-section-body">{children}</div>
    </section>
  );
}

export function HelpView() {
  return (
    <section className="panel-stack help-page">
      <div className="page-header help-header">
        <div>
          <p className="eyebrow">Guide</p>
          <h2>도움말</h2>
          <p className="section-copy">
            각 기능이 언제 필요한지, 어떤 옵션을 고르면 좋은지, 크레딧이 어떻게 쓰이는지
            차례대로 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="help-intro">
        <p>
          이 페이지는 기능별로 나누어 읽을 수 있게 정리되어 있습니다. 필요한 기능 설명부터
          먼저 읽고, 마지막에 크레딧 안내와 최근 작업 안내를 확인해 주세요.
        </p>
      </div>

      <div className="help-document">
        <HelpSection
          id="help-virtual"
          eyebrow="기능 설명"
          title="옷으로 바로 모델컷 만들기"
          summary="상품 사진만으로 새 모델컷을 만드는 기능입니다. 사람 사진이 없어도 사용할 수 있고, 필요하면 배경 사진이나 간단한 추가 요청을 함께 넣을 수 있습니다."
        >
          <div className="help-topic">
            <h4>이럴 때 사용하세요</h4>
            <ul className="help-list">
              <li>옷걸이 상품 사진만 있고 사람 사진은 없을 때</li>
              <li>쇼핑몰용 기본 모델컷을 빠르게 만들고 싶을 때</li>
              <li>앞모습, 옆모습, 뒷모습을 따로 만들어 보고 싶을 때</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>화면에서 고르는 옵션</h4>
            <ul className="help-list">
              <li>`카테고리`는 상의, 하의, 원피스처럼 상품 종류를 고르는 옵션입니다.</li>
              <li>`모델 성별`은 가상 모델의 방향을 정하는 옵션입니다. `자동 선택`은 상품에 맞게 자연스럽게 맡기는 용도입니다.</li>
              <li>`사진 비율`은 결과 이미지 모양을 정합니다. 정사각형은 썸네일, 세로형은 쇼핑몰 상세 이미지에 잘 맞습니다.</li>
              <li>`배경 느낌`은 배경 사진이 없을 때만 쓰는 간단한 분위기 선택입니다.</li>
              <li>`촬영 방향`은 정면, 측면, 뒷면 중 원하는 방향을 고르는 옵션입니다.</li>
              <li>`생성 품질`은 속도와 비용을 정하는 옵션입니다. 빠르게 1, 균형 2, 고품질 3 크레딧이 사용됩니다.</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>배경 사진과 배경 느낌은 이렇게 다릅니다</h4>
            <ul className="help-list">
              <li>배경 사진을 올리면 그 사진이 우선 적용됩니다.</li>
              <li>배경 사진을 올린 상태에서는 `배경 느낌` 선택을 잠시 사용할 수 없게 됩니다.</li>
              <li>배경 사진이 없으면 `밝은 스튜디오`, `자연광 느낌`, `쇼핑몰 촬영 느낌`처럼 원하는 분위기를 쉽게 고를 수 있습니다.</li>
              <li>배경 사진은 장소 느낌을 더 구체적으로 맞추고 싶을 때, 배경 느낌은 빠르게 분위기만 정하고 싶을 때 사용하면 좋습니다.</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>추가 요청에는 이렇게 적어 주세요</h4>
            <ul className="help-list">
              <li>사람 느낌이나 배경 분위기를 짧게 적어 주세요.</li>
              <li>예: `30대 여성 느낌`, `밝고 자연스러운 분위기`, `쇼핑몰 촬영 느낌`</li>
              <li>처리 시간은 보통 20초에서 120초 정도 걸릴 수 있습니다.</li>
            </ul>
          </div>
        </HelpSection>

        <HelpSection
          id="help-person"
          eyebrow="기능 설명"
          title="사람 사진에 옷 입히기"
          summary="사람 사진을 기준으로 상품을 입힌 이미지를 만드는 기능입니다. 기존 사람의 얼굴, 자세, 전체 느낌을 최대한 유지하면서 옷을 자연스럽게 입히는 데 맞춰져 있습니다."
        >
          <div className="help-topic">
            <h4>이럴 때 사용하세요</h4>
            <ul className="help-list">
              <li>사람 사진이 이미 있고 그 사진에 다른 옷을 입혀 보고 싶을 때</li>
              <li>모델의 얼굴과 자세를 크게 바꾸지 않고 옷만 바꾸고 싶을 때</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>필요한 사진과 옵션</h4>
            <ul className="help-list">
              <li>상품 사진과 사람 사진이 모두 필요합니다.</li>
              <li>`촬영 방향`은 정면, 측면, 뒷면 중 원하는 방향을 고르는 옵션입니다.</li>
              <li>이 기능은 `균형`, `고품질`만 사용할 수 있습니다.</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>추가 요청은 어디까지 도움이 되나요</h4>
            <ul className="help-list">
              <li>이 기능은 옷을 자연스럽게 입히는 데 집중합니다.</li>
              <li>추가 요청은 소매 걷기, 넣어 입기 같은 작은 착용 방식 수정에만 일부 도움될 수 있습니다.</li>
              <li>포즈, 기장, 구도처럼 큰 변화는 잘 반영되지 않을 수 있습니다.</li>
            </ul>
          </div>
        </HelpSection>

        <HelpSection
          id="help-model"
          eyebrow="기능 설명"
          title="모델 이미지 먼저 만들기"
          summary="설명만으로 새 모델 이미지를 만드는 기능입니다. 참고 사진을 함께 넣으면 포즈나 구도를 비슷하게 맞추는 데 도움이 됩니다."
        >
          <div className="help-topic">
            <h4>이럴 때 사용하세요</h4>
            <ul className="help-list">
              <li>상품 사진 없이 먼저 사람 이미지를 만들어 보고 싶을 때</li>
              <li>특정 분위기나 화면 구도의 모델 이미지를 먼저 준비하고 싶을 때</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>화면에서 고르는 옵션</h4>
            <ul className="help-list">
              <li>`사람 느낌`은 나이대와 성별 느낌을 빠르게 고르는 옵션입니다. 예: 여성 30대, 남성 20대</li>
              <li>`보이는 범위`는 전신, 허벅지까지, 상반신처럼 화면에 어디까지 나오게 할지 정하는 옵션입니다.</li>
              <li>`사진 비율`은 결과 이미지 모양을 정하는 옵션입니다. 기본은 세로형이며 쇼핑몰 이미지에 가장 무난합니다.</li>
              <li>`생성 품질`은 속도와 비용을 정하는 옵션입니다. 빠르게 1, 균형 2, 고품질 3 크레딧이 사용됩니다.</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>참고 사진은 이렇게 쓰세요</h4>
            <ul className="help-list">
              <li>참고 사진은 구도와 자세를 잡는 데 도움을 주지만 그대로 복사되지는 않습니다.</li>
              <li>참고 사진이 있으면 포즈나 화면 구성을 비슷하게 맞추는 데 도움이 됩니다.</li>
              <li>만들어진 이미지는 이후 다른 작업의 참고 이미지로 다시 사용할 수 있습니다.</li>
            </ul>
          </div>
        </HelpSection>

        <HelpSection
          id="help-swap"
          eyebrow="기능 설명"
          title="모델만 바꾸기"
          summary="원본 이미지의 옷과 구도는 최대한 유지하면서 사람만 다른 느낌으로 바꾸는 기능입니다. 기존 결과물에서 얼굴과 전체 인상만 바꾸고 싶을 때 사용하면 좋습니다."
        >
          <div className="help-topic">
            <h4>이럴 때 사용하세요</h4>
            <ul className="help-list">
              <li>옷과 포즈는 그대로 두고 사람만 다른 느낌으로 바꾸고 싶을 때</li>
              <li>같은 결과물을 여성 느낌, 남성 느낌처럼 다른 버전으로 보고 싶을 때</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>필요한 사진과 옵션</h4>
            <ul className="help-list">
              <li>`원본 이미지`는 꼭 필요합니다.</li>
              <li>`참고 얼굴 사진`이 있으면 원하는 사람 쪽으로 더 가깝게 맞추는 데 도움이 됩니다.</li>
              <li>`생성 품질`은 빠르게 1, 균형 2, 고품질 3 크레딧이 사용됩니다.</li>
              <li>참고 얼굴 사진을 함께 넣으면 1장당 3크레딧이 추가됩니다.</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>설명은 이렇게 적어 주세요</h4>
            <ul className="help-list">
              <li>성별, 나이대, 분위기 정도만 짧게 적는 편이 좋습니다.</li>
              <li>예: `30대 여성 느낌`, `깔끔한 남성 모델 느낌`</li>
              <li>참고 얼굴 사진이 있으면 설명을 비워도 되지만, 짧게 함께 적으면 더 안정적일 수 있습니다.</li>
            </ul>
          </div>
        </HelpSection>

        <HelpSection
          id="help-edit"
          eyebrow="기능 설명"
          title="이미지 조금 수정하기"
          summary="이미 만든 이미지를 기준으로 포즈, 분위기, 배경, 조명, 작은 디테일을 수정하는 기능입니다. 큰 변화보다는 한 번에 한 가지씩 나눠서 요청하는 쪽이 더 잘 맞습니다."
        >
          <div className="help-topic">
            <h4>이럴 때 사용하세요</h4>
            <ul className="help-list">
              <li>배경만 조금 바꾸고 싶을 때</li>
              <li>포즈를 살짝 틀거나 시선을 조금 바꾸고 싶을 때</li>
              <li>조명, 소품, 분위기 같은 작은 디테일을 손보고 싶을 때</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>필요한 사진과 옵션</h4>
            <ul className="help-list">
              <li>`원본 이미지`는 꼭 필요합니다.</li>
              <li>`참고 이미지`는 원하는 배경, 구도, 분위기를 보여주고 싶을 때만 선택해서 올리면 됩니다.</li>
              <li>이 기능은 현재 1회 생성당 1크레딧이 사용됩니다.</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>수정 요청은 이렇게 적어 주세요</h4>
            <ul className="help-list">
              <li>한 번에 한 가지씩 짧게 적는 편이 좋습니다.</li>
              <li>예: `모델을 살짝 왼쪽으로 돌려주세요`, `밝은 스튜디오 배경으로 바꿔주세요`</li>
              <li>큰 변경이 필요하면 한 번에 길게 적기보다 두 번에 나눠 수정하는 쪽이 더 안정적일 수 있습니다.</li>
            </ul>
          </div>
        </HelpSection>

        <HelpSection
          id="help-credits"
          eyebrow="크레딧 안내"
          title="크레딧은 이렇게 사용됩니다"
          summary="FASHN API 온디맨드 기준으로 1크레딧은 0.075달러입니다. 2026년 4월 22일 기준으로 단순 계산하면 1크레딧은 대략 110원 안팎으로 보면 됩니다."
        >
          <div className="help-topic">
            <h4>기능별 크레딧</h4>
            <ul className="help-list">
              <li>옷으로 바로 모델컷 만들기: 빠르게 1, 균형 2, 고품질 3</li>
              <li>사람 사진에 옷 입히기: 균형 2, 고품질 3</li>
              <li>모델 이미지 먼저 만들기: 빠르게 1, 균형 2, 고품질 3</li>
              <li>모델만 바꾸기: 빠르게 1, 균형 2, 고품질 3</li>
              <li>이미지 조금 수정하기: 1</li>
            </ul>
          </div>

          <div className="help-topic">
            <h4>알아두실 점</h4>
            <ul className="help-list">
              <li>성공한 결과에만 크레딧이 차감됩니다.</li>
              <li>생성에 실패하면 차감된 크레딧은 다시 돌아옵니다.</li>
              <li>여러 장을 한 번에 만들면 장수만큼 크레딧이 더 사용됩니다.</li>
              <li>API 크레딧 최소 충전은 100크레딧 단위입니다.</li>
              <li>화면 위 크레딧 숫자는 로그인 후 자동으로 불러옵니다.</li>
            </ul>
          </div>
        </HelpSection>

        <HelpSection
          id="help-results"
          eyebrow="작업 안내"
          title="결과 확인과 최근 작업"
          summary="생성이 끝난 뒤 바로 해야 할 일과 최근 작업이 어떻게 보이는지 정리했습니다."
        >
          <ul className="help-list">
            <li>완료된 이미지는 바로 내려받아 주세요.</li>
            <li>최근 작업은 3일 동안만 표시됩니다.</li>
            <li>최근 작업에서 요청 내용을 눌러 복사할 수 있습니다.</li>
          </ul>
        </HelpSection>
      </div>
    </section>
  );
}
