import { useEffect, useMemo, useState } from 'react'
import { ArrowIcon, FlowerMark, PinIcon } from './components/LineArt'
import { invitation } from './data/invitation'

type Countdown = {
  days: string
  hours: string
  minutes: string
  seconds: string
}

const navigation = [
  { label: '초대', id: 'invitation' },
  { label: '예식일', id: 'calendar' },
  { label: '갤러리', id: 'gallery' },
  { label: '오시는 길', id: 'location' },
  { label: '마음 전하기', id: 'accounts' },
]

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function getCountdown(): Countdown {
  const remaining = Math.max(
    0,
    new Date(invitation.weddingDate).getTime() - Date.now(),
  )
  const seconds = Math.floor(remaining / 1000)

  return {
    days: String(Math.floor(seconds / 86400)),
    hours: pad(Math.floor((seconds % 86400) / 3600)),
    minutes: pad(Math.floor((seconds % 3600) / 60)),
    seconds: pad(seconds % 60),
  }
}

function createCalendar() {
  const date = new Date(invitation.weddingDate)
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const weddingDay = date.getDate()

  return {
    label: year + '. ' + String(month + 1).padStart(2, '0'),
    cells: Array.from({ length: firstDay + lastDate }, (_, index) => {
      if (index < firstDay) return null
      const day = index - firstDay + 1
      return { day, isWeddingDay: day === weddingDay }
    }),
  }
}

function phoneHref(phone: string) {
  return 'tel:' + phone.replaceAll('-', '')
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function MenuIcon() {
  return (
    <span className="menu-icon" aria-hidden="true">
      <i />
      <i />
    </span>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.9L15.8 6.1" />
      <path d="M8.2 13.1L15.8 17.9" />
    </svg>
  )
}

function CallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.2 3.7L10.8 7.1L9.4 9.4C10.4 11.4 12.1 13.1 14.1 14.1L16.4 12.7L19.8 15.3L19.1 19C19 19.8 18.3 20.4 17.5 20.4C9.8 20 4 14.2 3.6 6.5C3.6 5.7 4.2 5 5 4.9L8.2 3.7Z" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H18.5C19.3 4 20 4.7 20 5.5V14.5C20 15.3 19.3 16 18.5 16H10L6 20V16H5.5C4.7 16 4 15.3 4 14.5V5.5Z" />
      <path d="M8 8.5H16" />
      <path d="M8 11.5H13.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5L19 19" />
      <path d="M19 5L5 19" />
    </svg>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [countdown, setCountdown] = useState(getCountdown)
  const [activeGallery, setActiveGallery] = useState<number | null>(null)
  const [openAccount, setOpenAccount] = useState<'groom' | 'bride' | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const calendar = useMemo(createCalendar, [])
  const weddingDate = new Date(invitation.weddingDate)
  const heroImageUrl = import.meta.env.BASE_URL + invitation.heroImage

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -42px' },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (activeGallery === null) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveGallery(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [activeGallery])

  async function copyText(value: string, label: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
      } else {
        const field = document.createElement('textarea')
        field.value = value
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.appendChild(field)
        field.select()
        document.execCommand('copy')
        field.remove()
      }
      setCopied(label)
      window.setTimeout(() => setCopied(null), 2200)
    } catch {
      window.prompt('아래 내용을 복사해 주세요.', value)
    }
  }

  async function shareInvitation() {
    const shareData = {
      title: invitation.siteTitle,
      text: invitation.couple.groom.name + ' · ' + invitation.couple.bride.name + '의 결혼식에 초대합니다.',
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
      await copyText(window.location.href, '초대장 링크')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      await copyText(window.location.href, '초대장 링크')
    }
  }

  function mapLink(provider: 'kakao' | 'naver' | 'tmap') {
    const query = encodeURIComponent(invitation.venue.name + ' ' + invitation.venue.address)
    if (provider === 'kakao') return 'https://map.kakao.com/?q=' + query
    if (provider === 'naver') return 'https://map.naver.com/p/search/' + query
    return 'tmap://route?goalx=' + invitation.venue.longitude + '&goaly=' + invitation.venue.latitude + '&goalname=' + encodeURIComponent(invitation.venue.name)
  }

  return (
    <div className="app-shell">
      <main className="invitation">
        <section className="hero" id="top" aria-label="청첩장 표지">
          <span className="falling-leaf leaf-one" aria-hidden="true" />
          <span className="falling-leaf leaf-two" aria-hidden="true" />
          <span className="falling-leaf leaf-three" aria-hidden="true" />
          <span className="falling-leaf leaf-four" aria-hidden="true" />
          <span className="falling-leaf leaf-five" aria-hidden="true" />
          <span className="falling-leaf leaf-six" aria-hidden="true" />

          <div className="hero-copy">
            <p className="hero-kicker">WEDDING INVITATION</p>
            <p className="hero-names">
              {invitation.couple.groom.name}
              <span> 그리고 </span>
              {invitation.couple.bride.name}
            </p>
            <p className="hero-date">
              {String(weddingDate.getFullYear())}. {String(weddingDate.getMonth() + 1).padStart(2, '0')}. {String(weddingDate.getDate()).padStart(2, '0')}
            </p>
          </div>

          <div className="hero-photo">
            <img src={heroImageUrl} alt={invitation.heroImageAlt} />
            <svg
              className="hero-wave hero-wave--top waves"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 24 150 28"
              preserveAspectRatio="none"
              shapeRendering="auto"
              aria-hidden="true"
            >
              <defs>
                <path id="hero-gentle-wave-top" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
              </defs>
              <g className="parallax">
                <use xlinkHref="#hero-gentle-wave-top" x="48" y="0" />
                <use xlinkHref="#hero-gentle-wave-top" x="48" y="3" />
                <use xlinkHref="#hero-gentle-wave-top" x="48" y="5" />
                <use xlinkHref="#hero-gentle-wave-top" x="48" y="7" />
              </g>
            </svg>
            <svg
              className="hero-wave waves"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 24 150 28"
              preserveAspectRatio="none"
              shapeRendering="auto"
              aria-hidden="true"
            >
              <defs>
                <path id="hero-gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
              </defs>
              <g className="parallax">
                <use xlinkHref="#hero-gentle-wave" x="48" y="0" />
                <use xlinkHref="#hero-gentle-wave" x="48" y="3" />
                <use xlinkHref="#hero-gentle-wave" x="48" y="5" />
                <use xlinkHref="#hero-gentle-wave" x="48" y="7" />
              </g>
            </svg>
          </div>

          <div className="hero-venue">
            <span>{invitation.venue.name}</span>
            <i />
            <span>{invitation.venue.hall}</span>
          </div>
          <div className="scroll-hint" aria-hidden="true">
            <span />
            SCROLL TO BEGIN
          </div>
        </section>

        <section className="story section-space reveal-section" data-reveal aria-labelledby="story-heading">
          <FlowerMark />
          <p className="section-eyebrow">OUR PROMISE</p>
          <h1 id="story-heading">가장 기쁜 계절이 되어</h1>
          <blockquote>
            {invitation.poem.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </blockquote>
          <p className="story-source">두 사람의 새로운 사계를 시작하며</p>
        </section>

        <section className="intro section-space reveal-section" data-reveal id="invitation" aria-labelledby="invite-heading">
          <p className="section-eyebrow">INVITATION</p>
          <h2 id="invite-heading">소중한 분들을 초대합니다</h2>
          <p className="section-body">{invitation.invitationText}</p>

          <div className="couple-grid reveal-item">
            <article className="person-card groom-card">
              <div className="portrait-frame">
                {invitation.couple.groom.portrait ? (
                  <img src={invitation.couple.groom.portrait} alt={invitation.couple.groom.name + ' 사진'} />
                ) : (
                  <div className="portrait-placeholder groom-placeholder" aria-label="신랑 사진 자리">
                    <span>GROOM PHOTO</span>
                  </div>
                )}
              </div>
              <div className="person-heading">
                <span>신랑</span>
                <h3>{invitation.couple.groom.name}</h3>
                <a href={phoneHref(invitation.couple.groom.phone)} aria-label="신랑에게 전화">
                  <CallIcon />
                </a>
              </div>
              <p className="person-profile">
                {invitation.couple.groom.profile.map((item) => <span key={item}>{item}</span>)}
              </p>
              <p className="person-message">{invitation.couple.groom.message}</p>
              <p className="person-family">
                {invitation.couple.groom.father} · {invitation.couple.groom.mother} 의 {invitation.couple.groom.familyRole}
              </p>
            </article>
            <article className="person-card bride-card">
              <div className="portrait-frame">
                {invitation.couple.bride.portrait ? (
                  <img src={invitation.couple.bride.portrait} alt={invitation.couple.bride.name + ' 사진'} />
                ) : (
                  <div className="portrait-placeholder bride-placeholder" aria-label="신부 사진 자리">
                    <span>BRIDE PHOTO</span>
                  </div>
                )}
              </div>
              <div className="person-heading">
                <span>신부</span>
                <h3>{invitation.couple.bride.name}</h3>
                <a href={phoneHref(invitation.couple.bride.phone)} aria-label="신부에게 전화">
                  <CallIcon />
                </a>
              </div>
              <p className="person-profile">
                {invitation.couple.bride.profile.map((item) => <span key={item}>{item}</span>)}
              </p>
              <p className="person-message">{invitation.couple.bride.message}</p>
              <p className="person-family">
                {invitation.couple.bride.father} · {invitation.couple.bride.mother} 의 {invitation.couple.bride.familyRole}
              </p>
            </article>
          </div>
        </section>

        <section className="calendar-section section-space reveal-section" data-reveal id="calendar" aria-labelledby="calendar-heading">
          <p className="section-eyebrow">SAVE THE DATE</p>
          <h2 id="calendar-heading">{invitation.displayDate}</h2>
          <div className="calendar-paper reveal-item">
            <div className="calendar-title">{calendar.label}</div>
            <div className="calendar-weekdays">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-days">
              {calendar.cells.map((cell, index) =>
                cell ? (
                  <span className={cell.isWeddingDay ? 'wedding-day' : ''} key={cell.day}>
                    {cell.day}
                  </span>
                ) : (
                  <span key={'empty-' + index} />
                ),
              )}
            </div>
          </div>
          <div className="countdown reveal-item" aria-label="예식까지 남은 시간">
            {([
              ['Days', countdown.days],
              ['Hours', countdown.hours],
              ['Minutes', countdown.minutes],
              ['Seconds', countdown.seconds],
            ] as const).map(([label, value]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="gallery-section section-space reveal-section" data-reveal id="gallery" aria-labelledby="gallery-heading">
          <p className="section-eyebrow">MOMENTS</p>
          <h2 id="gallery-heading">우리의 장면들</h2>
          <p className="section-caption">사진을 누르면 크게 볼 수 있어요.</p>
          <div className="gallery-grid reveal-item">
            {invitation.gallery.map((image, index) => (
              <button
                className={'gallery-tile gallery-' + image.tone}
                key={image.title}
                onClick={() => setActiveGallery(index)}
                aria-label={image.title + ' 크게 보기'}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <i>{image.title}</i>
              </button>
            ))}
          </div>
        </section>

        <section className="location-section section-space reveal-section" data-reveal id="location" aria-labelledby="location-heading">
          <p className="section-eyebrow">LOCATION</p>
          <h2 id="location-heading">{invitation.venue.name}</h2>
          <p className="location-hall">{invitation.venue.hall}</p>
          <div className="map-card reveal-item" aria-label={invitation.venue.address + ' 지도 위치'}>
            <span className="road road-one" />
            <span className="road road-two" />
            <span className="road road-three" />
            <span className="block block-one" />
            <span className="block block-two" />
            <span className="block block-three" />
            <div className="map-pin">
              <PinIcon />
              <span>{invitation.venue.name}</span>
            </div>
            <p>MAP</p>
          </div>
          <div className="address-card reveal-item">
            <PinIcon />
            <div>
              <strong>{invitation.venue.address}</strong>
              <span>{invitation.venue.detail}</span>
            </div>
            <button onClick={() => copyText(invitation.venue.address, '주소')} aria-label="주소 복사">
              복사
            </button>
          </div>
          <div className="map-actions reveal-item">
            <a href={mapLink('tmap')} target="_blank" rel="noreferrer">티맵</a>
            <a href={mapLink('kakao')} target="_blank" rel="noreferrer">카카오맵</a>
            <a href={mapLink('naver')} target="_blank" rel="noreferrer">네이버지도</a>
          </div>
          <div className="transport-note reveal-item">
            <p><strong>지하철</strong> 신도림역 1번 출구에서 도보 5분</p>
            <p><strong>주차</strong> 예식 당일 3시간 무료 주차</p>
          </div>
        </section>

        <section className="accounts-section section-space reveal-section" data-reveal id="accounts" aria-labelledby="accounts-heading">
          <FlowerMark />
          <p className="section-eyebrow">WITH LOVE</p>
          <h2 id="accounts-heading">마음 전하실 곳</h2>
          <p className="section-body compact">
            참석이 어려우신 분들을 위해<br />
            계좌번호를 함께 안내드립니다.
          </p>
          {([
            ['groom', '신랑측 계좌번호', invitation.accounts.groom],
            ['bride', '신부측 계좌번호', invitation.accounts.bride],
          ] as const).map(([side, title, accounts]) => {
            const isOpen = openAccount === side
            return (
              <div className="account-group reveal-item" key={side}>
                <button
                  className="account-toggle"
                  onClick={() => setOpenAccount(isOpen ? null : side)}
                  aria-expanded={isOpen}
                >
                  <span>{title}</span>
                  <ArrowIcon />
                </button>
                {isOpen && (
                  <div className="account-list">
                    {accounts.map((account) => (
                      <div className="account-row" key={account.bank + account.number}>
                        <div>
                          <strong>{account.owner}</strong>
                          <span>{account.bank} {account.number}</span>
                        </div>
                        <button onClick={() => copyText(account.bank + ' ' + account.number, account.owner + ' 계좌')}>
                          복사
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        <footer className="footer reveal-section" data-reveal>
          <FlowerMark />
          <p>{invitation.couple.groom.name} <span>and</span> {invitation.couple.bride.name}</p>
          <small>함께해 주시는 모든 마음을 오래 기억하겠습니다.</small>
          <button onClick={() => scrollToSection('top')}>맨 위로</button>
        </footer>
      </main>

      <div className="fixed-actions" aria-label="청첩장 빠른 메뉴">
        <button className="round-control hero-share" onClick={shareInvitation} aria-label="청첩장 공유">
          <ShareIcon />
        </button>
        <button
          className="round-control hero-menu"
          onClick={() => setMenuOpen(true)}
          aria-label="목차 열기"
        >
          <MenuIcon />
        </button>
      </div>

      {menuOpen && (
        <div className="menu-layer" role="dialog" aria-modal="true" aria-label="청첩장 메뉴">
          <div className="menu-panel">
            <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">
              <CloseIcon />
            </button>
            <FlowerMark />
            <p>WEDDING MENU</p>
            <strong>{invitation.couple.groom.name} <span>&amp;</span> {invitation.couple.bride.name}</strong>
            <nav>
              {navigation.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMenuOpen(false)
                    window.setTimeout(() => scrollToSection(item.id), 90)
                  }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <button className="menu-share" onClick={shareInvitation}>
              <ShareIcon />
              청첩장 공유하기
            </button>
          </div>
        </div>
      )}

      {activeGallery !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={invitation.gallery[activeGallery].title}
          onClick={() => setActiveGallery(null)}
        >
          <button className="lightbox-close" onClick={() => setActiveGallery(null)} aria-label="사진 닫기">
            <CloseIcon />
          </button>
          <div
            className={'lightbox-art gallery-' + invitation.gallery[activeGallery].tone}
            onClick={(event) => event.stopPropagation()}
          >
            <span>{String(activeGallery + 1).padStart(2, '0')}</span>
            <p>{invitation.gallery[activeGallery].title}</p>
            <small>이 영역을 두 분의 사진으로 바꿔 주세요.</small>
          </div>
        </div>
      )}

      {copied && <div className="toast" role="status">{copied}가 복사되었습니다.</div>}
    </div>
  )
}

export default App
