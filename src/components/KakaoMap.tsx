import { useEffect, useRef, useState } from 'react'

type KakaoMapProps = {
  appKey: string
  latitude: string
  longitude: string
  title: string
  openUrl: string
}

declare global {
  interface Window {
    kakao?: any
  }
}

function loadKakaoMap(appKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve)
      return
    }

    const scriptId = 'kakao-map-sdk'
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null

    const loadMap = () => {
      if (!window.kakao?.maps) {
        reject(new Error('카카오맵을 불러오지 못했습니다.'))
        return
      }
      window.kakao.maps.load(resolve)
    }

    if (existing) {
      existing.addEventListener('load', loadMap, { once: true })
      existing.addEventListener('error', () => reject(new Error('카카오맵을 불러오지 못했습니다.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.async = true
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=' + encodeURIComponent(appKey)
    script.addEventListener('load', loadMap, { once: true })
    script.addEventListener('error', () => reject(new Error('카카오맵을 불러오지 못했습니다.')), { once: true })
    document.head.appendChild(script)
  })
}

export function KakaoMap({ appKey, latitude, longitude, title, openUrl }: KakaoMapProps) {
  const mapElement = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    let marker: { setMap: (map: null) => void } | undefined

    async function initializeMap() {
      try {
        await loadKakaoMap(appKey)
        if (cancelled || !mapElement.current) return

        const position = new window.kakao.maps.LatLng(Number(latitude), Number(longitude))
        const map = new window.kakao.maps.Map(mapElement.current, {
          center: position,
          level: 3,
        })

        marker = new window.kakao.maps.Marker({
          map,
          position,
          title,
        })
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    void initializeMap()
    return () => {
      cancelled = true
      marker?.setMap(null)
    }
  }, [appKey, latitude, longitude, title])

  return (
    <div className="map-card" aria-label={title + ' 카카오 지도'}>
      <div className="kakao-map-canvas" ref={mapElement} />
      {status === 'loading' && <p className="map-loading">지도를 불러오는 중입니다.</p>}
      {status === 'error' && (
        <a className="map-error" href={openUrl} target="_blank" rel="noreferrer">
          지도를 불러오지 못했습니다. 카카오맵에서 보기
        </a>
      )}
      <a className="map-open-link" href={openUrl} target="_blank" rel="noreferrer">
        카카오맵에서 크게 보기
      </a>
    </div>
  )
}
