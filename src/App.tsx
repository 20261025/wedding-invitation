import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowIcon, FlowerMark, PinIcon } from './components/LineArt'
import { KakaoMap } from './components/KakaoMap'
import { invitation } from './data/invitation'

type Countdown = {
  days: string
  hours: string
  minutes: string
  seconds: string
}

type Rsvp = {
  name: string
  attendance: 'attend' | 'absent'
  guests: string
  meal: string
  message: string
}

type KakaoShareSdk = {
  init: (javascriptKey: string) => void
  isInitialized: () => boolean
  Share: {
    sendCustom: (options: {
      templateId: number
      templateArgs?: Record<string, string>
    }) => void
  }
}

declare global {
  interface Window {
    Kakao?: KakaoShareSdk
  }
}

const navigation = [
  { label: '초대', id: 'invitation' },
  { label: '예식일', id: 'calendar' },
  { label: '갤러리', id: 'gallery' },
  { label: '오시는 길', id: 'location' },
  { label: '마음 전하기', id: 'accounts' },
]

const kakaoShareSdkUrl = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.0/kakao.min.js'

function loadKakaoShareSdk(javascriptKey: string) {
  return new Promise<KakaoShareSdk>((resolve, reject) => {
    const initialize = () => {
      if (!window.Kakao) {
        reject(new Error('카카오톡 공유 SDK를 불러오지 못했습니다.'))
        return
      }

      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(javascriptKey)
      }
      resolve(window.Kakao)
    }

    if (window.Kakao) {
      initialize()
      return
    }

    const scriptId = 'kakao-share-sdk'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', initialize, { once: true })
      existingScript.addEventListener('error', () => reject(new Error('카카오톡 공유 SDK를 불러오지 못했습니다.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.async = true
    script.src = kakaoShareSdkUrl
    script.addEventListener('load', initialize, { once: true })
    script.addEventListener('error', () => reject(new Error('카카오톡 공유 SDK를 불러오지 못했습니다.')), { once: true })
    document.head.appendChild(script)
  })
}

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

function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 17.5A2.5 2.5 0 1 1 6.5 15A2.5 2.5 0 0 1 9 17.5ZM9 17.5V7.2L18 5V14.5" />
      <path d="M18 14.5A2.5 2.5 0 1 1 15.5 12A2.5 2.5 0 0 1 18 14.5Z" />
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
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [openAccount, setOpenAccount] = useState<'groom' | 'bride' | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [isRsvpOpen, setIsRsvpOpen] = useState(invitation.rsvp.enabled)
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false)
  const [rsvpError, setRsvpError] = useState<string | null>(null)
  const [rsvp, setRsvp] = useState<Rsvp>({
    name: '',
    attendance: 'attend',
    guests: '1',
    meal: '식사 예정',
    message: '',
  })
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const bgmRef = useRef<HTMLAudioElement>(null)
  const galleryTrackRef = useRef<HTMLDivElement>(null)
  const galleryLoopTimerRef = useRef<number | null>(null)
  const galleryIsReadyRef = useRef(false)
  const hasStartedMusicRef = useRef(false)
  const calendar = useMemo(createCalendar, [])
  const heroImageUrl = import.meta.env.BASE_URL + invitation.heroImage
  const bgmUrl = import.meta.env.BASE_URL + 'sounds/bgm.mp3'
  const gallerySlides = [
    { image: invitation.gallery[invitation.gallery.length - 1], index: invitation.gallery.length - 1, isClone: true },
    ...invitation.gallery.map((image, index) => ({ image, index, isClone: false })),
    { image: invitation.gallery[0], index: 0, isClone: true },
  ]
  const themeStyle: CSSProperties & Record<`--${string}`, string> = {
    '--paper-texture': `url("${import.meta.env.BASE_URL + invitation.theme.paperTexture}")`,
    '--font-body': invitation.theme.fonts.body,
    '--font-display': invitation.theme.fonts.display,
    '--font-accent': invitation.theme.fonts.accent,
  }

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const updateScrollTopVisibility = () => setShowScrollTop(window.scrollY > 560)
    updateScrollTopVisibility()
    window.addEventListener('scroll', updateScrollTopVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollTopVisibility)
  }, [])

  useEffect(() => {
    const music = bgmRef.current
    if (!music) return

    music.volume = 0.42
    const syncMusicState = () => setIsMusicPlaying(!music.paused)
    music.addEventListener('play', syncMusicState)
    music.addEventListener('pause', syncMusicState)

    const playBackgroundMusic = async () => {
      try {
        await music.play()
        hasStartedMusicRef.current = true
      } catch {
        setIsMusicPlaying(false)
      }
    }

    const playOnFirstInteraction = () => {
      if (!hasStartedMusicRef.current) void playBackgroundMusic()
    }

    void playBackgroundMusic()
    window.addEventListener('pointerdown', playOnFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('pointerdown', playOnFirstInteraction)
      music.removeEventListener('play', syncMusicState)
      music.removeEventListener('pause', syncMusicState)
      music.pause()
    }
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

  useEffect(() => {
    let readyTimer: number | null = null
    const initialPositionTimer = window.setTimeout(() => {
      scrollToGallerySlide(1, 'auto')
      readyTimer = window.setTimeout(() => {
        galleryIsReadyRef.current = true
      }, 220)
    }, 80)
    return () => {
      window.clearTimeout(initialPositionTimer)
      if (readyTimer !== null) window.clearTimeout(readyTimer)
      if (galleryLoopTimerRef.current !== null) window.clearTimeout(galleryLoopTimerRef.current)
    }
  }, [])

  function scrollToGallerySlide(trackIndex: number, behavior: ScrollBehavior = 'smooth') {
    const track = galleryTrackRef.current
    const slide = track?.querySelector<HTMLButtonElement>(`[data-track-index="${trackIndex}"]`)
    if (!track || !slide) return

    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior,
    })
  }

  function moveGallery(offset: number) {
    const isFirstToLast = galleryIndex === 0 && offset < 0
    const isLastToFirst = galleryIndex === invitation.gallery.length - 1 && offset > 0
    const nextIndex = (galleryIndex + offset + invitation.gallery.length) % invitation.gallery.length
    const nextTrackIndex = isFirstToLast ? 0 : isLastToFirst ? invitation.gallery.length + 1 : nextIndex + 1

    scrollToGallerySlide(nextTrackIndex)
    setGalleryIndex(nextIndex)
  }

  function syncGalleryIndex() {
    const track = galleryTrackRef.current
    if (!track || !galleryIsReadyRef.current) return

    const trackCenter = track.scrollLeft + track.clientWidth / 2
    const slides = Array.from(track.querySelectorAll<HTMLButtonElement>('[data-gallery-index]'))
    const closestSlide = slides.reduce<HTMLButtonElement | null>((closest, slide) => {
      const currentDistance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - trackCenter)
      if (closest === null) return slide
      const closestDistance = Math.abs(closest.offsetLeft + closest.offsetWidth / 2 - trackCenter)
      return currentDistance < closestDistance ? slide : closest
    }, null)

    if (closestSlide === null) return

    const nextIndex = Number(closestSlide.dataset.galleryIndex)
    setGalleryIndex(nextIndex)

    if (closestSlide.dataset.galleryClone !== 'true') return
    if (galleryLoopTimerRef.current !== null) window.clearTimeout(galleryLoopTimerRef.current)
    galleryLoopTimerRef.current = window.setTimeout(() => scrollToGallerySlide(nextIndex + 1, 'auto'), 140)
  }

  useEffect(() => {
    if (!isRsvpOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsRsvpOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isRsvpOpen])

  async function copyText(value: string, label: string, successMessage = label + '가 복사되었습니다.') {
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
      setCopied(successMessage)
      window.setTimeout(() => setCopied(null), 2200)
    } catch {
      window.prompt('아래 내용을 복사해 주세요.', value)
    }
  }

  async function shareInvitation() {
    const { javascriptKey, templateId, templateArgs } = invitation.kakaoShare
    // 카카오 템플릿은 로컬 개발 환경에서만 시험합니다.
    // 배포된 청첩장은 아래의 기본 링크 공유를 계속 사용합니다.
    if (import.meta.env.DEV && javascriptKey && templateId) {
      try {
        const Kakao = await loadKakaoShareSdk(javascriptKey)
        Kakao.Share.sendCustom({
          templateId,
          ...(Object.keys(templateArgs).length > 0 ? { templateArgs } : {}),
        })
        return
      } catch {
        setCopied('카카오톡 공유를 열지 못했습니다. 카카오 설정을 확인해 주세요.')
        window.setTimeout(() => setCopied(null), 3000)
        return
      }
    }

    const shareData = {
      title: invitation.social.title,
      text: invitation.social.description,
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

  async function toggleBackgroundMusic() {
    const music = bgmRef.current
    if (!music) return

    if (music.paused) {
      try {
        await music.play()
      } catch {
        setIsMusicPlaying(false)
      }
      return
    }

    music.pause()
  }

  function closeRsvp() {
    setIsRsvpOpen(false)
    setRsvpError(null)
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!invitation.rsvp.googleScriptUrl) {
      setRsvpError('Google Sheets 연결 주소를 설정한 뒤 이용할 수 있어요.')
      return
    }

    const attendance = rsvp.attendance === 'attend' ? '참석' : '불참'
    const payload = {
      name: rsvp.name.trim(),
      attendance,
      guests: rsvp.attendance === 'attend' ? rsvp.guests : '',
      meal: rsvp.attendance === 'attend' ? rsvp.meal : '',
      message: rsvp.message.trim(),
      submittedAt: new Date().toISOString(),
      pageUrl: window.location.href,
    }

    setIsRsvpSubmitting(true)
    setRsvpError(null)
    try {
      // Apps Script는 다른 도메인에서 동작하므로, 요청을 전송만 하고 응답은 읽지 않습니다.
      await fetch(invitation.rsvp.googleScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
      setCopied('RSVP 응답을 전송했습니다.')
      window.setTimeout(() => setCopied(null), 2200)
      closeRsvp()
    } catch {
      setRsvpError('전송하지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.')
    } finally {
      setIsRsvpSubmitting(false)
    }
  }

  function mapLink(provider: 'kakao' | 'naver' | 'tmap') {
    const query = encodeURIComponent(invitation.venue.name + ' ' + invitation.venue.address)
    if (provider === 'kakao') return invitation.venue.kakaoMapUrl
    return 'tmap://route?goalx=' + invitation.venue.longitude + '&goaly=' + invitation.venue.latitude + '&goalname=' + encodeURIComponent(invitation.venue.name)
  }

  return (
    <div className="app-shell" style={themeStyle}>
      <audio ref={bgmRef} src={bgmUrl} loop preload="metadata" autoPlay />
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
            <p className="hero-draft-notice">현재 제작 중인 청첩장입니다.</p>
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

          <div className="hero-event" aria-label="예식 일시와 장소">
            <p className="hero-event-date">{invitation.displayDate}</p>
            <p className="hero-event-venue">
              <span>{invitation.venue.name}</span>
              <span>{invitation.venue.hall}</span>
            </p>
          </div>
          <div className="scroll-hint" aria-hidden="true">
            <span />
            SCROLL TO BEGIN
          </div>
        </section>

        <section className="story section-space reveal-section" data-reveal aria-labelledby="story-heading">
          <FlowerMark />
          <p className="section-eyebrow">OUR PROMISE</p>
          <h1 id="story-heading" className="story-heading">가장 기쁜 계절이 되어</h1>
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
          <p className="section-body invitation-copy">
            {invitation.invitationText.map((line, index) => <span key={index + line}>{line}</span>)}
          </p>

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
          <div className="gallery-carousel reveal-item" role="region" aria-roledescription="carousel" aria-label="우리의 장면들">
            <div className="gallery-grid" ref={galleryTrackRef} onScroll={syncGalleryIndex}>
            {gallerySlides.map(({ image, index, isClone }, trackIndex) => (
              <button
                className={'gallery-tile' + (galleryIndex === index && !isClone ? ' is-current' : '')}
                key={image.title + trackIndex}
                data-gallery-index={index}
                data-gallery-clone={isClone}
                data-track-index={trackIndex}
                onClick={() => {
                  if (galleryIndex === index && !isClone) {
                    setActiveGallery(index)
                    return
                  }
                  scrollToGallerySlide(index + 1)
                  setGalleryIndex(index)
                }}
                aria-label={image.title + ' 크게 보기'}
              >
                <img src={import.meta.env.BASE_URL + image.src} alt={image.title} loading="lazy" />
              </button>
            ))}
            </div>
            <div className="gallery-controls">
              <button className="gallery-control" type="button" onClick={() => moveGallery(-1)} aria-label="이전 사진 보기">‹</button>
              <p aria-live="polite">{galleryIndex + 1} / {invitation.gallery.length}</p>
              <button className="gallery-control" type="button" onClick={() => moveGallery(1)} aria-label="다음 사진 보기">›</button>
            </div>
          </div>
        </section>

        <section className="location-section section-space reveal-section" data-reveal id="location" aria-labelledby="location-heading">
          <p className="section-eyebrow">LOCATION</p>
          <h2 id="location-heading">{invitation.venue.name}</h2>
          <p className="location-hall">{invitation.venue.hall}</p>
          <div className="reveal-item">
            <KakaoMap
              appKey={invitation.venue.kakaoMapAppKey}
              latitude={invitation.venue.latitude}
              longitude={invitation.venue.longitude}
              title={invitation.venue.name}
              openUrl={mapLink('kakao')}
            />
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
            <p><strong>지하철</strong><span>2호선 신도림역 1번 출구 (신도림역 광장 도보 5분)</span></p>
            <p><strong>셔틀버스 타는 곳</strong><span>신도림역 1번 출구 앞</span></p>
            <p><strong>주차</strong><span>호텔 내 주차장 이용 (예식 당일 1시간 30분 무료 주차)</span></p>
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
          {import.meta.env.DEV && (
            <button className="kakao-share-button" onClick={shareInvitation}>
              <MessageIcon />
              카카오톡으로 공유하기
            </button>
          )}
          <button
            className="invitation-link-button"
            onClick={() => copyText(invitation.social.siteUrl, '청첩장 주소')}
          >
            청첩장 주소 복사하기
          </button>
        </footer>
      </main>

      <div className="fixed-actions" aria-label="청첩장 빠른 메뉴">
        <button
          className={'round-control hero-music' + (isMusicPlaying ? ' is-playing' : '')}
          onClick={toggleBackgroundMusic}
          aria-label={isMusicPlaying ? '배경음악 일시정지' : '배경음악 재생'}
          aria-pressed={isMusicPlaying}
        >
          <MusicIcon />
        </button>
        <button
          className="round-control hero-menu"
          onClick={() => setMenuOpen(true)}
          aria-label="목차 열기"
        >
          <MenuIcon />
        </button>
      </div>

      {showScrollTop && (
        <button className="scroll-top-control" onClick={() => scrollToSection('top')} aria-label="맨 위로 이동">
          <span aria-hidden="true">↑</span>
        </button>
      )}

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
          </div>
        </div>
      )}

      {invitation.rsvp.enabled && isRsvpOpen && (
        <div
          className="rsvp-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-modal-heading"
          onClick={closeRsvp}
        >
          <form className="rsvp-panel" onSubmit={submitRsvp} onClick={(event) => event.stopPropagation()}>
            <button className="rsvp-close" type="button" onClick={closeRsvp} aria-label="참석 여부 전달 닫기">
              <CloseIcon />
            </button>
            <p className="section-eyebrow">RSVP</p>
            <h2 id="rsvp-modal-heading">참석 여부 전달</h2>
            <p className="rsvp-description">소중한 날, 함께해 주실 수 있는지 미리 알려주세요.</p>

            <label className="rsvp-field">
              <span>성함</span>
              <input
                required
                value={rsvp.name}
                onChange={(event) => setRsvp({ ...rsvp, name: event.target.value })}
                placeholder="성함을 입력해 주세요"
                autoComplete="name"
              />
            </label>

            <fieldset className="rsvp-choice">
              <legend>참석 여부</legend>
              <label>
                <input
                  type="radio"
                  name="attendance"
                  checked={rsvp.attendance === 'attend'}
                  onChange={() => setRsvp({ ...rsvp, attendance: 'attend' })}
                />
                <span>참석할게요</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="attendance"
                  checked={rsvp.attendance === 'absent'}
                  onChange={() => setRsvp({ ...rsvp, attendance: 'absent' })}
                />
                <span>아쉽지만 불참할게요</span>
              </label>
            </fieldset>

            {rsvp.attendance === 'attend' && (
              <div className="rsvp-selects">
                <label className="rsvp-field">
                  <span>참석 인원</span>
                  <select value={rsvp.guests} onChange={(event) => setRsvp({ ...rsvp, guests: event.target.value })}>
                    {[1, 2, 3, 4, 5].map((guest) => <option value={guest} key={guest}>{guest}명</option>)}
                    <option value="6명 이상">6명 이상</option>
                  </select>
                </label>
                <label className="rsvp-field">
                  <span>식사 여부</span>
                  <select value={rsvp.meal} onChange={(event) => setRsvp({ ...rsvp, meal: event.target.value })}>
                    <option>식사 예정</option>
                    <option>식사하지 않음</option>
                  </select>
                </label>
              </div>
            )}

            <label className="rsvp-field rsvp-message">
              <span>전하고 싶은 말 <em>선택</em></span>
              <textarea
                value={rsvp.message}
                onChange={(event) => setRsvp({ ...rsvp, message: event.target.value })}
                placeholder="축하의 말을 남겨 주세요"
                rows={3}
              />
            </label>

            {rsvpError && <p className="rsvp-error" role="alert">{rsvpError}</p>}
            <button className="rsvp-submit" type="submit" disabled={isRsvpSubmitting}>
              <MessageIcon />
              {isRsvpSubmitting ? '응답 전송 중...' : '참석 여부 전달하기'}
            </button>
            <p className="rsvp-help">
              {invitation.rsvp.googleScriptUrl
                ? '응답은 Google Sheets에 저장됩니다.'
                : 'Google Sheets 연결 주소를 설정하면 응답이 저장됩니다.'}
            </p>
          </form>
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
          <div className="lightbox-art" onClick={(event) => event.stopPropagation()}>
            <img
              src={import.meta.env.BASE_URL + invitation.gallery[activeGallery].src}
              alt={invitation.gallery[activeGallery].title}
            />
          </div>
        </div>
      )}

      {copied && <div className="toast" role="status">{copied}</div>}
    </div>
  )
}

export default App
