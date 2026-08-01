# 모바일 청첩장

종이 질감, 선화 커버, 달력, 갤러리, 지도 안내, 계좌번호 복사와 공유 기능을 포함한 정적 모바일 청첩장입니다. 특정 서비스의 소스나 사진을 사용하지 않은 독립 구현입니다.

## 먼저 바꿀 정보

모든 문구와 예식 정보는 src/data/invitation.ts 한 파일에 모아 두었습니다.

- 신랑·신부 이름, 부모님 성함, 연락처
- 예식 일시와 장소, 주소 및 좌표
- 인사말(한 줄씩 입력 가능), 갤러리 제목, 계좌번호
- `theme.paperTexture` 배경 이미지와 `theme.fonts`의 본문·제목·영문 글꼴
- RSVP Google Sheets 저장 주소(`rsvp.googleScriptUrl`)
- 카카오톡 사용자 정의 템플릿 ID와 사용자 인자(`kakaoShare`)

갤러리는 현재 저작권 문제 없는 추상 색면 자리표시자입니다. 실제 사진을 넣을 때는 public/images 폴더에 사진을 넣고, src/App.tsx의 gallery-tile 배경을 해당 파일로 바꾸면 됩니다. 배포 전에 실제 계좌번호와 전화번호를 다시 확인하세요.

신랑·신부 소개 사진은 public/images/groom.jpg 및 public/images/bride.jpg처럼 넣은 뒤, src/data/invitation.ts의 portrait 값에 '/images/groom.jpg', '/images/bride.jpg'를 입력하면 됩니다. profile, message, familyRole도 같은 파일에서 바꿀 수 있습니다.

## 내 컴퓨터에서 보기

    npm install
    npm run dev

표시된 로컬 주소를 휴대폰 또는 브라우저에서 열면 됩니다. 배포 전 확인은 아래 명령으로 합니다.

    npm run build
    npm run preview

## GitHub Pages 배포

1. GitHub에서 새 저장소를 만듭니다. 예: wedding
2. 이 폴더의 파일을 main 브랜치로 올립니다.
3. 저장소 Settings > Pages에서 Source를 GitHub Actions로 선택합니다.
4. main 브랜치에 push하면 Actions의 Deploy invitation to GitHub Pages 작업이 자동 실행됩니다.
5. 완료 후 Settings > Pages에 표시되는 주소가 청첩장 링크입니다.

워크플로는 저장소 이름을 자동으로 감지해 프로젝트 페이지 주소에서도 정적 파일 경로가 깨지지 않도록 설정되어 있습니다. 사용자/조직 루트 페이지나 사용자 도메인을 사용할 때에는 vite.config.ts의 base 값을 '/'로 유지하면 됩니다.

## RSVP 응답 저장

RSVP는 기본적으로 숨겨져 있습니다. `src/data/invitation.ts`의 `rsvp.enabled`를 `true`로 바꾸면 청첩장을 처음 열 때 RSVP 팝업이 표시됩니다. 응답은 `rsvp.googleScriptUrl`에 연결한 Google Apps Script 웹 앱을 통해 Google Sheets에 저장됩니다. 설정은 [google-apps-script/README.md](google-apps-script/README.md)를 따라 한 뒤, `src/data/invitation.ts`에 `/exec` 주소를 입력하면 됩니다.

## 카카오톡 사용자 정의 템플릿 공유

상단 공유 버튼은 로컬 개발 서버에서만 `kakaoShare.templateId`의 카카오톡 사용자 정의 템플릿으로 공유합니다. 배포된 청첩장에서는 기존의 일반 링크 공유를 유지합니다. `templateId`는 카카오 Developers의 **도구 > 메시지 템플릿**에서 확인한 숫자입니다. 템플릿에서 `${title}`처럼 사용자 인자를 사용했다면, `templateArgs`에 같은 이름과 값을 넣어야 합니다.

`kakaoShare.javascriptKey`는 현재 카카오맵에 사용 중인 키로 설정돼 있습니다. 메시지 템플릿을 같은 카카오 Developers 앱에서 만들었다면 그대로 사용할 수 있습니다. 다른 앱에서 만들었다면 해당 앱의 **JavaScript 키**로 바꾸세요.

카카오 Developers에서 아래 주소를 **JavaScript SDK 도메인**과 **제품 링크 관리 > 웹 도메인**에 각각 등록해야 합니다.

- 배포: `https://20261025.github.io`
- 현재 로컬 미리보기: `http://127.0.0.1:5174`

로컬 주소는 브라우저 주소와 한 글자까지 같아야 합니다. 예를 들어 `localhost:5174`로 열었다면 `http://localhost:5174`도 별도로 등록해야 합니다. 자세한 조건은 [카카오톡 공유 JavaScript 공식 문서](https://developers.kakao.com/docs/ko/kakaotalk-share/js-link)를 참고하세요.
