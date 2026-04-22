export function HelpView() {
  return (
    <section className="panel-stack help-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Guide</p>
          <h2>도움말</h2>
          <p className="section-copy">
            각 기능이 언제 필요한지와 크레딧 사용 방식을 간단히 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="help-grid">
        <article className="detail-card help-card">
          <div className="help-card-head">
            <span className="pill">기능 설명</span>
            <h3>옷으로 바로 모델컷 만들기</h3>
          </div>
          <p className="section-copy">
            상품 사진만으로 새 모델컷을 만드는 기능입니다. 사람 사진이 없어도 사용할 수 있고, 필요하면 배경 사진과 추가 프롬프트를 함께 넣을 수 있습니다.
          </p>
          <ul className="help-list">
            <li>상품 사진은 꼭 올려주세요.</li>
            <li>의류, 신발, 모자, 가방, 액세서리 같은 착용 상품에 잘 맞습니다.</li>
            <li>배경 사진을 넣으면 비슷한 장소 느낌을 유지하는 데 도움이 됩니다.</li>
            <li>추가 프롬프트로 사람 분위기, 배경, 연출 방향을 짧게 적을 수 있습니다.</li>
            <li>처리 시간은 보통 20초에서 120초 정도 걸릴 수 있습니다.</li>
          </ul>
        </article>

        <article className="detail-card help-card">
          <div className="help-card-head">
            <span className="pill">기능 설명</span>
            <h3>사람 사진에 옷 입히기</h3>
          </div>
          <p className="section-copy">
            사람 사진을 기준으로 상품을 입힌 이미지를 만드는 기능입니다. 기존 사람의 얼굴, 자세, 전체 느낌을 최대한 유지하면서 옷을 자연스럽게 입히는 데 맞춰져 있습니다.
          </p>
          <ul className="help-list">
            <li>상품 사진과 사람 사진이 모두 필요합니다.</li>
            <li>의류, 신발, 모자, 가방, 액세서리 같은 착용 상품에 사용할 수 있습니다.</li>
            <li>이 기능은 옷을 자연스럽게 입히는 데 집중합니다.</li>
            <li>추가 프롬프트는 소매 걷기, 넣어 입기 같은 작은 착용 방식 수정에만 일부 도움될 수 있습니다.</li>
            <li>포즈, 기장, 구도처럼 큰 변화는 잘 반영되지 않을 수 있습니다.</li>
            <li>이 기능은 `균형`, `고품질`만 사용할 수 있습니다.</li>
          </ul>
        </article>

        <article className="detail-card help-card">
          <div className="help-card-head">
            <span className="pill">기능 설명</span>
            <h3>모델 이미지 먼저 만들기</h3>
          </div>
          <p className="section-copy">
            설명만으로 새 모델 이미지를 만드는 기능입니다. 참고 사진을 함께 넣으면 포즈나 구도를 비슷하게 맞추는 데 도움이 됩니다.
          </p>
          <ul className="help-list">
            <li>상품 사진 없이도 사용할 수 있습니다.</li>
            <li>모델 분위기, 의상, 장면, 포즈를 설명으로 적어주세요.</li>
            <li>참고 사진은 구도와 자세를 잡는 데 도움을 주지만 그대로 복사되지는 않습니다.</li>
            <li>만들어진 이미지는 이후 다른 작업의 참고 이미지로 다시 사용할 수 있습니다.</li>
            <li>빠르게 1, 균형 2, 고품질 3 크레딧이 사용됩니다.</li>
          </ul>
        </article>

        <article className="detail-card help-card">
          <div className="help-card-head">
            <span className="pill">크레딧 안내</span>
            <h3>크레딧은 이렇게 사용됩니다</h3>
          </div>
          <p className="section-copy">
            FASHN API 온디맨드 기준으로 1크레딧은 `0.075달러`입니다. 2026년 4월 22일 기준 달러 환율을 단순 적용하면 1크레딧은 대략 `110원 안팎`으로 보면 됩니다.
          </p>
          <ul className="help-list">
            <li>옷으로 바로 모델컷 만들기: 빠르게 1, 균형 2, 고품질 3</li>
            <li>사람 사진에 옷 입히기: 균형 2, 고품질 3</li>
            <li>모델 이미지 먼저 만들기: 빠르게 1, 균형 2, 고품질 3</li>
            <li>성공한 결과에만 크레딧이 차감됩니다.</li>
            <li>생성에 실패하면 차감된 크레딧은 다시 돌아옵니다.</li>
            <li>여러 장을 한 번에 만들면 장수만큼 크레딧이 더 사용됩니다.</li>
            <li>API 크레딧 최소 충전은 100크레딧 단위입니다.</li>
            <li>화면 위 크레딧 숫자는 로그인 후 자동으로 불러옵니다.</li>
          </ul>
        </article>

        <article className="detail-card help-card">
          <div className="help-card-head">
            <span className="pill">작업 안내</span>
            <h3>결과 확인과 최근 작업</h3>
          </div>
          <ul className="help-list">
            <li>완료된 이미지는 바로 내려받아 주세요.</li>
            <li>최근 작업은 3일 동안만 표시됩니다.</li>
            <li>최근 작업에서 프롬프트를 눌러 복사할 수 있습니다.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
