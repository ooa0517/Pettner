# 🐾 Pettner 정식 배포 및 GitHub 연결 매뉴얼

지정하신 저장소(`https://github.com/ooa0517/Pettner`)와 연결하여 정식 서비스를 시작하는 가이드입니다.

## 🚀 1단계: GitHub 저장소에 코드 올리기

1.  **Firebase Studio 상단 툴바**에서 **'GitHub'** 아이콘 또는 **'Share'** 버튼을 클릭합니다.
2.  저장소 선택 또는 연결 팝업이 뜨면 `ooa0517/Pettner` 저장소를 선택합니다.
3.  **Push** 또는 **Commit**을 눌러 현재 코드를 GitHub로 전송합니다.

## 🌐 2단계: Firebase App Hosting 연결 (진짜 URL 생성)

현재 미리보기 주소는 본인만 접근 가능하므로, 누구나 접속 가능한 주소를 만들려면 다음 과정을 거치세요.

1.  [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2.  왼쪽 메뉴에서 **Build > App Hosting**을 선택합니다.
3.  **시작하기**를 누르고 GitHub 계정을 연동한 후, `ooa0517/Pettner` 저장소를 선택합니다.
4.  배포 설정은 기본값을 권장하며, 완료되면 `https://pettner-xxxx.web.app`과 같은 **정식 도메인**이 생성됩니다.

## 🔐 3단계: 도메인 승인 (필수 설정)

정식 URL에서 로그인이 작동하려면 다음 설정이 반드시 필요합니다.

1.  **Authentication 설정**: `Authentication > Settings > Authorized domains`에 접속합니다.
2.  **도메인 추가** 버튼을 누르고 위에서 생성된 **정식 도메인 주소**를 입력합니다.
3.  이 과정을 거쳐야만 정식 URL에서 구글 로그인 등이 정상 작동합니다.

## 💳 4단계: 결제 키 교체 (오픈 시)

현재 테스트용 토스페이먼츠 키가 연결되어 있습니다. 실제 서비스 오픈 시에는 토스페이먼츠 관리자 페이지에서 발급받은 **라이브 키**로 `src/components/payment-modal.tsx`를 수정하세요.

---
© 2024 Pettner Team. All rights reserved.
