# 🐾 Pettner V24.0: 앱 시스템 청사진 (App Blueprint)

## 1. 서비스 미션 (Core Mission)
"사료 한 알의 과학적 진실을 파헤쳐, 모든 반려동물에게 개인화된 최적의 영양 솔루션을 제공한다."

---

## 2. 시스템 아키텍처 (System Architecture)

### 2.1 분리된 분석 룸 (Strictly Decoupled Rooms)
Pettner는 사용자의 목적에 따라 두 가지 독립된 분석 경로를 제공하며, 각 경로는 코드와 데이터를 공유하지 않습니다.

- **Analyzer_A (제품 객관적 분석)**
  - **목적**: 제품 자체의 품질, 성분 안전성, 원산지 리스크 감사.
  - **입력**: 제품 카테고리, 제품명, 성분표 사진.
  - **특화 지표**: AAFCO 육각형 차트, 원산지 리스크 지도, 가공 공법 분석.
- **Analyzer_B (우리 아이 맞춤 분석)**
  - **목적**: 아이의 메디컬 데이터와 제품의 1:1 상성 매칭 및 급여 처방.
  - **입력**: 종별 정밀 설문(증상, 알러지, 고민), 제품 데이터.
  - **특화 지표**: 1:1 매칭 점수, 기호성 예측 지수, 7일 교체 스케줄, 필수 강제 음수량.

### 2.2 결정론적 AI 엔진 (Deterministic Genkit Engine)
사용자의 신뢰도를 위해 Google Genkit(Gemini 2.5 Flash)을 활용한 '결정론적 분석'을 수행합니다.
- **프롬프트 가이드**: 창의적 답변을 배제하고 AAFCO/NRC 가이드라인과 텍스트 데이터를 기반으로 한 수치 계산 강제.
- **일관성**: 동일 제품/동일 프로필 입력 시 99% 이상의 확률로 동일한 스코어 산출.

---

## 3. 데이터 자산화 전략 (Data Capitalization)

Analyzer_B를 통해 수집되는 모든 데이터는 향후 **'Pettner 자체 제조 공장'** 설계를 위한 핵심 통계로 활용됩니다.

- **수집 항목**:
  - 품종별 주로 겪는 질환 통계 (슬개골, 헤어볼 등).
  - 품종별/성분별 기호성(Palatability) 데이터.
  - 보호자의 최대 고민 사항 및 미충족 영양소 데이터.
- **DB 구조**: Firestore `/users/{userId}/analysisHistory` 경로에 JSON 형태로 정밀 적재.

---

## 4. 비즈니스 모델 및 수익화

- **Freemium 모델**: 일일 5회 무료 분석 제공.
- **Premium Pass**: 4,990원 평생권 (토스페이먼츠 연동).
  - 광고 제거 (AdSense Off).
  - 무제한 정밀 리포트 생성 및 저장.
  - 수의 영양학 우선 순위 알고리즘 적용.

---

## 5. 기술 스택 (Tech Stack)

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, ShadCN UI.
- **Backend/DB**: Firebase Authentication, Cloud Firestore.
- **AI**: Google Genkit, Gemini 1.5/2.5 Flash.
- **Payment**: Toss Payments SDK.
- **Hosting**: Firebase App Hosting (GitHub CI/CD).

---

© 2024 Pettner Team. 모든 데이터와 로직은 수의학적 근거를 바탕으로 설계되었습니다.