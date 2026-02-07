AIzaSyBG9g4T0WiOimSyhozOkrP-NC5M8A3K-es
# 🐾 Pettner 베타 서비스 출시 매뉴얼

Pettner 성분 분석기 베타 서비스에 오신 것을 환영합니다!

## 1. 로그인 활성화 방법 (필수)
로그인이 되지 않는다면 **Firebase 콘솔**에서 다음 설정을 확인해야 합니다.

1.  **제공업체 활성화**: [Firebase Console](https://console.firebase.google.com/) > Authentication > Sign-in method에서 **Google**과 **Apple**을 '사용 설정'으로 변경하세요.
2.  **승인된 도메인 등록 (중요)**: Authentication > Settings > **Authorized domains** 목록에 현재 미리보기 URL의 도메인(예: `studio-XXXX.firebase-studio.google`)을 추가해야 팝업 로그인이 작동합니다.

## 2. 베타 테스터 초대 방법
현재 개발 환경의 **미리보기 URL**을 복사하여 전달하면 즉시 이용이 가능합니다.
- **접속 링크:** [미리보기 창 상단의 URL을 복사하세요]
- **테스터 대상:** `ooa0517@gmail.com` 등 초대하고 싶은 모든 분

## 3. 주요 기능
- **AI 성분 분석:** 사진 한 장으로 식단/간식/영양제 정밀 분석
- **맞춤 급여 가이드:** 생애주기 및 몸무게별 권장 급여량 확인
- **수익화 모델:** 분석 결과 하단 쿠팡/아마존 파트너스 링크 연동
- **분석 히스토리:** 과거 분석 기록 저장 및 확인

## 4. 정식 배포 가이드
1. Firebase App Hosting 메뉴에서 본 저장소 연결
2. 환경 변수(.env 내용) 설정 후 배포
3. 생성된 고유 도메인을 테스터들에게 공유

---
© 2024 Pettner Team. All rights reserved.
