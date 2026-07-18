# 모바일 청첩장

종이 질감, 선화 커버, 달력, 갤러리, 지도 안내, 계좌번호 복사와 공유 기능을 포함한 정적 모바일 청첩장입니다. 특정 서비스의 소스나 사진을 사용하지 않은 독립 구현입니다.

## 먼저 바꿀 정보

모든 문구와 예식 정보는 src/data/invitation.ts 한 파일에 모아 두었습니다.

- 신랑·신부 이름, 부모님 성함, 연락처
- 예식 일시와 장소, 주소 및 좌표
- 인사말, 갤러리 제목, 계좌번호

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

## 알아둘 점

GitHub Pages는 정적 호스팅이라 방명록이나 RSVP 응답을 저장할 수 없습니다. 그런 기능이 필요하면 Google Forms, Typeform, Notion Form 등의 외부 폼 링크를 추가하면 됩니다.
