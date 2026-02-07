
# 🐾 Pettner 베타 서비스 출시 매뉴얼

Pettner 성분 분석기 베타 서비스에 오신 것을 환영합니다!

## 📱 핸드폰에서 401 오류 없이 접속하는 방법 (필수)

현재 보고 계신 **미리보기 URL**은 보안상 개발자 본인만 접근 가능합니다. 핸드폰이나 다른 사람에게 공유하려면 **Firebase App Hosting**을 통해 정식 배포를 해야 합니다.

### 1단계: 정식 배포하기 (무료)
1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. 왼쪽 메뉴에서 **Build > App Hosting**을 선택합니다.
3. **시작하기**를 누르고 현재의 GitHub 저장소를 연결합니다.
4. 배포가 완료되면 `https://pettner-xxxx.web.app`과 같은 **진짜 공용 URL**이 생성됩니다! 이 주소는 401 오류 없이 누구나 접속 가능합니다.

### 2단계: 로그인 활성화 (Firebase 콘솔 설정)
로그인이 되지 않는다면 다음 설정을 꼭 확인하세요.
1. **Authentication 활성화**: `Authentication > Sign-in method`에서 **Google**과 **Apple**을 '사용 설정'으로 변경하세요.
2. **승인된 도메인 등록**: `Authentication > Settings > Authorized domains` 목록에 생성된 **진짜 공용 URL**의 도메인을 추가해야 로그인이 작동합니다.

## 주요 기능
- **AI 통합 분석:** 사진 한 장으로 식단/간식/영양제 정밀 분석
- **맞춤 급여 가이드:** 생애주기 및 몸무게별 권장 급여량 확인
- **수익화 모델:** 최저가 구매 링크 연동
- **분석 히스토리:** 과거 분석 기록 저장 (로그인 시)

---
© 2024 Pettner Team. All rights reserved.
