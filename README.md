
# 🐾 Pettner 베타 서비스 출시 매뉴얼

Pettner 성분 분석기 베타 서비스에 오신 것을 환영합니다!

## 📱 핸드폰에서 즉시 테스트하기 (필수)
1. **미리보기 URL 복사**: 미리보기 창 상단의 URL을 복사하세요.
2. **핸드폰 접속**: 복사한 주소를 핸드폰 브라우저(Safari/Chrome)에 입력하세요.
3. **앱으로 추가**: 브라우저 메뉴에서 **'홈 화면에 추가'**를 누르면 바탕화면에 Pettner 앱이 생깁니다!

## 1. 로그인 활성화 방법
로그인이 되지 않는다면 **Firebase 콘솔**에서 다음 설정을 확인해야 합니다.
1. **제공업체 활성화**: [Firebase Console](https://console.firebase.google.com/) > Authentication > Sign-in method에서 **Google**과 **Apple**을 '사용 설정'으로 변경하세요.
2. **승인된 도메인 등록 (중요)**: Authentication > Settings > **Authorized domains** 목록에 현재 미리보기 URL의 도메인(예: `studio-XXXX.firebase-studio.google`)을 추가해야 로그인이 작동합니다.

## 2. 주요 기능
- **AI 통합 분석:** 사진 한 장으로 식단/간식/영양제 정밀 분석
- **맞춤 급여 가이드:** 생애주기 및 몸무게별 권장 급여량 확인
- **수익화 모델:** 최저가 구매 링크 연동
- **분석 히스토리:** 과거 분석 기록 저장

---
© 2024 Pettner Team. All rights reserved.
