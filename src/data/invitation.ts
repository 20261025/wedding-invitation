const kakaoJavaScriptKey = 'bf737c0f633d3d0ce522d13dd8a7db30'

export const invitation = {
  siteTitle: '민준과 희선의 결혼식',
  heroImage: 'images/main.jpeg',
  heroImageAlt: '두 사람의 웨딩 사진',
  social: {
    title: '김민준 ♥ 정희선 결혼합니다',
    description: '2026년 10월 25일 일요일 오후 12시 30분, 라마다 서울 신도림 호텔 2층 그랜드볼룸',
    siteUrl: 'https://20261025.github.io/wedding-invitation/',
    image: 'images/main.jpeg',
    imageAlt: '민준과 희선의 웨딩 사진',
  },
  kakaoShare: {
    javascriptKey: kakaoJavaScriptKey,
    templateId: 135872,
    templateArgs: {} as Record<string, string>,
  },
  theme: {
    paperTexture: 'images/paper-texture.png',
    fonts: {
      body: '"Gowun Dodum", sans-serif',
      display: '"Gowun Dodum", sans-serif',
      accent: '"Gowun Dodum", sans-serif',
    },
  },
  couple: {
    groom: {
      name: '김민준',
      englishName: 'MINJUN',
      portrait: '', // 예: '/images/groom.jpg'
      profile: ['95년 6월 21일', 'IT 개발자 👨🏻‍💻'],
      message: '저희 행복하게',
      phone: '010-7176-4662',
      father: '김용덕',
      mother: '진향미',
      familyRole: '장남',
    },
    bride: {
      name: '정희선',
      englishName: 'HEESUN',
      portrait: '', // 예: '/images/bride.jpg'
      profile: ['91년 7월 9일', 'IT 개발자 👩🏻‍💻'],
      message: '잘 살겠습니다 :)',
      phone: '010-6676-3058',
      father: '정훈채',
      mother: '하순심',
      familyRole: '장녀',
    },
  },
  weddingDate: '2026-10-25T12:30:00+09:00',
  displayDate: '2026년 10월 25일 일요일 오후 12시 30분',
  rsvp: {
    // true로 바꾸면 청첩장 최초 진입 시 RSVP 팝업이 표시됩니다.
    enabled: false,
    // Google Apps Script 웹 앱의 /exec 주소를 넣어 주세요. 설정 방법은 google-apps-script/README.md를 참고하세요.
    googleScriptUrl: '',
  },
  venue: {
    name: '라마다 서울 신도림 호텔',
    hall: '2층 그랜드볼룸',
    address: '서울시 구로구 경인로 624',
    detail: '',
    latitude: '37.50623951983282',
    longitude: '126.88539450791446',
    kakaoMapAppKey: kakaoJavaScriptKey,
    kakaoMapUrl: 'https://place.map.kakao.com/1212235250',
  },
  poem: [
    '“봄의 그대는 벚꽃이었고',
    '여름의 그대는 바람이었으며',
    '가을의 그대는 하늘이었고',
    '겨울의 그대는 하얀 눈이었다.',
    '',
    '그대는 언제나',
    '행복 그 자체였다.”',
    '',
    '\– 강현욱 \<사계\> 중'
  ],
  invitationText: [
    '두 사람이 만나 미래를 함께하고자 합니다.',
    '서로 모르고 살아온 어제보다',
    '함께할 내일이 많다는 사실에 감사합니다.',
    '부부라는 이름으로 새로이 시작하는 오늘,',
    '가까이에서 축복해 주시면 감사하겠습니다.',
  ],
  gallery: [
    { title: '첫 번째 장면', tone: 'peach' },
    { title: '두 번째 장면', tone: 'sage' },
    { title: '세 번째 장면', tone: 'sand' },
    { title: '네 번째 장면', tone: 'rose' },
    { title: '다섯 번째 장면', tone: 'sky' },
    { title: '여섯 번째 장면', tone: 'ink' },
  ],
  accounts: {
    groom: [
      { owner: '김민준', bank: '국민은행', number: '000000-00-000000' },
      /*{ owner: '김아버지', bank: '신한은행', number: '000-000-000000' },*/
    ],
    bride: [
      { owner: '정희선', bank: '카카오뱅크', number: '0000-000-000000' },
      /*{ owner: '이아버지', bank: '하나은행', number: '000-000000-00000' },*/
    ],
  },
}
