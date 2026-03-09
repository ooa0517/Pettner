
# 🐾 Pettner 정식 배포 및 GitHub 연결 매뉴얼

Pettner 베타 서비스의 정식 출시를 위한 가이드입니다. GitHub와 연결하면 코드가 수정될 때마다 자동으로 배포되어 누구나 접속 가능한 전용 URL이 생성됩니다.

## 🚀 1단계: GitHub 저장소 만들기 및 코드 올리기

1.  **GitHub 저장소 생성**: [GitHub](https://github.com/new)에서 새로운 저장소(Repository)를 만듭니다. (이름 예: `pettner-analyzer`)
2.  **코드 내보내기**: Firebase Studio 우측 상단의 **'Share'** 또는 **'GitHub'** 아이콘을 클릭하여 생성한 저장소로 코드를 푸시(Push)합니다.
    *   *참고: 직접 Git CLI를 사용한다면 `git remote add origin [저장소주소]` 후 `git push -u origin main`을 수행합니다.*

## 🌐 2단계: Firebase App Hosting 연결 (정식 URL 생성)

현재 보고 계신 미리보기 주소는 본인만 접근 가능하며 401 오류가 발생할 수 있습니다. 누구나 접속 가능한 주소를 만들려면 다음 과정을 거치세요.

1.  [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2.  왼쪽 메뉴에서 **Build > App Hosting**을 선택합니다.
3.  **시작하기**를 누르고 위에서 만든 GitHub 저장소를 선택합니다.
4.  배포 설정(기본값 권장)을 완료하면 `https://pettner-xxxx.web.app`과 같은 **진짜 공용 URL**이 생성됩니다!

## 🔐 3단계: 로그인 기능 활성화 (필수 설정)

정식 URL에서 로그인이 작동하려면 다음 설정이 반드시 필요합니다.

1.  **Authentication 설정**: `Authentication > Sign-in method`에서 **Google**과 **이메일/비밀번호**가 '사용 설정'인지 확인합니다.
2.  **승인된 도메인 등록**: `Authentication > Settings > Authorized domains`에 생성된 **진짜 공용 URL의 도메인**을 추가해야 로그인이 작동합니다.

## 💳 4단계: 토스페이먼츠 연동 확인

현재 제공해주신 테스트 키(`test_ck_...`)가 연결되어 있습니다. 
*   **테스트**: 실제 결제창이 뜨며, 테스트 카드로 결제 시 가상으로 성공 처리가 됩니다.
*   **실제 서비스**: 정식 오픈 시에는 토스페이먼츠에서 발급받은 **실제 라이브 키**로 교체해야 합니다 (`src/components/payment-modal.tsx`).

---
© 2024 Pettner Team. All rights reserved.
