import { useEffect, useRef } from 'react';

import useScrollFadeIn from '@/hooks/useScrollFadeIn';
import useToast from '@/hooks/useToast';

const KAKAO_LOGO_PATH = `${import.meta.env.BASE_URL}images/kakao.png`;
const NAVER_LOGO_PATH = `${import.meta.env.BASE_URL}images/naver.png`;
const GOOGLE_LOGO_PATH = `${import.meta.env.BASE_URL}images/google.png`;
const TMAP_LOGO_PATH = `${import.meta.env.BASE_URL}images/tmap.png`;

const HOTEL_COORDS = { lat: 37.505603818492, lon: 126.88387163888 };
const KAKAO_MAP_SCRIPT =
  'https://dapi.kakao.com/v2/maps/sdk.js?appkey=caa1f990ddac03a515947f427d7256d6&autoload=false';
const HOTEL_NAME = '더링크호텔';

const MapContainer = () => {
  const mapRef = useRef(null);
  const addressRef = useRef(null);

  const sectionRef = useScrollFadeIn();
  const { openToast } = useToast();

  console.log(navigator.userAgent);

  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = () => /android/i.test(navigator.userAgent);

  const openNaverMapForAndroid = () => {
    const placeId = '1070501110';
    const webFallbackUrl = `https://map.naver.com/p/entry/place/${placeId}`;
    const intentUrl = `intent://place?id=${placeId}#Intent;scheme=nmap;package=com.nhn.android.nmap;S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)};end`;
    window.location.href = intentUrl;
  };

  const openKakaoMapForAndroid = () => {
    const placeId = '801090941';
    const webFallbackUrl = `https://place.map.kakao.com/${placeId}`;
    // 카카오맵은 목적지 정보(ep)와 앱 이름(appname)을 포함하는 경우가 많습니다.
    // kakaomap://place?id= 로도 동작하지만, 경로안내 등은 다른 파라미터 사용
    const intentUrl = `intent://place?id=${placeId}#Intent;scheme=kakaomap;package=net.daum.android.map;S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)};end`;
    window.location.href = intentUrl;
  };

  const openGoogleMapForAndroid = () => {
    const query = '더링크호텔';
    const webFallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    // geo URI가 더 일반적일 수 있으나, comgooglemaps 스킴도 사용 가능
    const intentUrl = `intent://?q=${encodeURIComponent(query)}#Intent;scheme=comgooglemaps;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)};end`;
    // 또는 geo 스킴: `intent://#Intent;action=android.intent.action.VIEW;data=geo:0,0?q=${encodeURIComponent(query)};package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)};end`;
    window.location.href = intentUrl;
  };

  const openTmapForAndroid = () => {
    const name = '더링크호텔서울웨딩';
    const lon = '126.88387163888';
    const lat = '37.505603818492';
    const webFallbackUrl =
      'https://poi.tmobiweb.com/app/share/position?contents=dHlwZT0yJnBrZXk9MTE0NjQzMzEwMSZwb2lJZD0xMTQ2NDMzMSZuYXZTZXE9MSZwb2lOYW1lPeuNlOunge2BrO2YuO2FlOyEnOyauOybqOuUqSZjZW50ZXJYPTAmY2VudGVyWT0wJnRpbWU9MjAyNeuFhCA17JuUIDIy7J28IDExOjU0JnRlbD0wMi04NTItNTAwMCZhZGRyPeyEnOyauCDqtazroZzqtawg6rK97J2466GcIDYxMA==&tailParam=%7B%7D';
    const appSchemeData = `tmap://route?referrer=com.skt.Tmap&goalx=${lon}&goaly=${lat}&goalname=${name}`;

    const intentUrl = `intent://${appSchemeData}#Intent;scheme=tmap;package=com.skt.tmap.ku;S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)};end`; // package 이름 확인 필요 (com.skt.Tmap.ACTIVE 일 수도 있음)
    window.location.href = intentUrl;
  };

  function tryOpenAppiOS(appScheme, webFallbackUrl) {
    let appOpened = false;
    const timeout = 2500; // 앱 응답 대기 시간

    // 페이지가 숨겨지면 앱이 열린 것으로 간주
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        // 이벤트 리스너 정리
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('pagehide', handlePageHide); // iOS에서 pagehide도 유용
      }
    };
    const handlePageHide = () => {
      // 페이지가 unload 되려고 할 때
      appOpened = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('pagehide', handlePageHide);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('pagehide', handlePageHide);

    // 1. 앱 스킴 실행
    window.location.href = appScheme;

    // 2. 일정 시간 후, 앱이 열리지 않았다고 판단되면 fallback 실행
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('pagehide', handlePageHide);

      if (!appOpened && !document.hidden) {
        window.open(webFallbackUrl, '_blank');
      }
    }, timeout);
  }

  // iOS에서 네이버 지도 열기
  const openNaverMapForIOS = () => {
    const placeId = '1070501110';
    const appScheme = `nmap://place?id=${placeId}`;
    const webFallbackUrl = `https://map.naver.com/p/entry/place/${placeId}`;
    tryOpenAppiOS(appScheme, webFallbackUrl);
  };

  // 카카오맵, 구글맵, T맵도 유사하게 적용
  const openKakaoMapForIOS = () => {
    const placeId = '801090941';
    const appScheme = `kakaomap://place?id=${placeId}`;
    const webFallbackUrl = `https://place.map.kakao.com/${placeId}`;
    tryOpenAppiOS(appScheme, webFallbackUrl);
  };

  const openGoogleMapForIOS = () => {
    const query = '더링크호텔';
    const universalLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(universalLink, '_blank');

    // 또는 커스텀 스킴 시도
    // const appScheme = `comgooglemaps://?q=${encodeURIComponent(query)}`;
    // const webFallbackUrl = universalLink;
    // tryOpenAppiOS(appScheme, webFallbackUrl);
  };

  const openTmapForIOS = () => {
    const name = '더링크호텔서울웨딩';
    const lon = '126.88387163888';
    const lat = '37.505603818492';
    const appScheme = `tmap://route?rGoName=${encodeURIComponent(name)}&rGoX=${lon}&rGoY=${lat}`;
    const webFallbackUrl =
      'https://poi.tmobiweb.com/app/share/position?contents=dHlwZT0yJnBrZXk9MTE0NjQzMzEwMSZwb2lJZD0xMTQ2NDMzMSZuYXZTZXE9MSZwb2lOYW1lPeuNlOunge2BrO2YuO2FlOyEnOyauOybqOuUqSZjZW50ZXJYPTAmY2VudGVyWT0wJnRpbWU9MjAyNeuFhCA17JuUIDIy7J28IDExOjU0JnRlbD0wMi04NTItNTAwMCZhZGRyPeyEnOyauCDqtazroZzqtawg6rK97J2466GcIDYxMA==&tailParam=%7B%7D';
    tryOpenAppiOS(appScheme, webFallbackUrl);
  };

  const openMapLink = (mapType) => {
    if (isAndroid()) {
      if (mapType === 'naver') openNaverMapForAndroid();
      else if (mapType === 'kakao') openKakaoMapForAndroid();
      else if (mapType === 'google') openGoogleMapForAndroid();
      else if (mapType === 'tmap') openTmapForAndroid();
    } else if (isIOS()) {
      if (mapType === 'naver') openNaverMapForIOS();
      else if (mapType === 'kakao') openKakaoMapForIOS();
      else if (mapType === 'google')
        openGoogleMapForIOS(); // 또는 구글맵 Universal Link 직접 사용
      else if (mapType === 'tmap') openTmapForIOS();
    } else {
      // 기타 OS (PC 등)의 경우 웹 URL로 바로 연결
      if (mapType === 'naver')
        window.open(`https://map.naver.com/p/entry/place/1070501110`, '_blank');
      else if (mapType === 'kakao') window.open(`https://place.map.kakao.com/801090941`, '_blank');
      else if (mapType === 'google')
        window.open(`https://www.google.com/maps/search/?api=1&query=${HOTEL_NAME}`, '_blank');
      else if (mapType === 'tmap')
        window.open(
          `https://poi.tmobiweb.com/app/share/position?contents=dHlwZT0yJnBrZXk9MTE0NjQzMzEwMSZwb2lJZD0xMTQ2NDMzMSZuYXZTZXE9MSZwb2lOYW1lPeuNlOunge2BrO2YuO2FlOyEnOyauOybqOuUqSZjZW50ZXJYPTAmY2VudGVyWT0wJnRpbWU9MjAyNeuFhCA17JuUIDIy7J28IDExOjU0JnRlbD0wMi04NTItNTAwMCZhZGRyPeyEnOyauCDqtazroZzqtawg6rK97J2466GcIDYxMA==&tailParam=%7B%7D`,
          '_blank',
        );
    }
  };

  const loadKakaoMap = () => {
    if (window.kakao && window.kakao.maps) {
      const container = mapRef.current;
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(HOTEL_COORDS.lat, HOTEL_COORDS.lon),
        level: 3,
      };

      const map = new window.kakao.maps.Map(container, options);

      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(HOTEL_COORDS.lat, HOTEL_COORDS.lon),
        title: HOTEL_NAME,
      });

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    }
  };

  const loadKakaoMapScript = () => {
    const script = document.createElement('script');
    script.src = KAKAO_MAP_SCRIPT;
    script.onload = () => window.kakao.maps.load(loadKakaoMap);
    script.onerror = () => {
      console.error('Kakao Maps SDK load failed.');
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      loadKakaoMapScript();
    } else {
      loadKakaoMap();
    }
  }, []);

  const handleCopyAddress = async () => {
    const address = addressRef.current?.innerText;
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        openToast('주소가 클립보드에 복사되었습니다.');
      } catch (err) {
        console.error('주소 복사 실패:', err);
        openToast('주소 복사에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const ClipboardIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '1em', height: '1em' }}
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      <line x1="8" y1="12" x2="16" y2="12"></line>
      <line x1="8" y1="16" x2="16" y2="16"></line>
      <line x1="8" y1="8" x2="12" y2="8"></line>
    </svg>
  );

  return (
    <>
      <section className="container-wrapper map-section" ref={sectionRef}>
        <h2 className="main-title">LOCATION</h2>
        <div className="address-container">
          <p className="venue-name">더 링크 서울, 트리뷰트 포트폴리오 호텔</p>
          <a href="tel:02-852-5000" className="venue-phone" aria-label="전화하기">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </a>
        </div>

        <div className="address-container">
          <p className="venue-address-kr" ref={addressRef}>
            서울특별시 구로구 경인로 610 (지번) 신도림동 413-9
          </p>
          <button
            className="copy-address-button"
            onClick={handleCopyAddress}
            aria-label="주소 복사"
          >
            <ClipboardIcon />
          </button>
        </div>
        <div className="map-wrapper">
          <div ref={mapRef} className="kakao-map" />
        </div>
        <div className="map-buttons">
          {/* 카카오맵 버튼: kakaomap:// scheme 사용하여 길찾기 바로 실행 */}
          <button className="map-button kakao" onClick={() => openMapLink('kakao')}>
            <img src={KAKAO_LOGO_PATH} alt="카카오맵 로고" className="map-logo" />
            <span>카카오맵</span>
          </button>

          {/* 네이버 지도 버튼: nmap:// scheme 사용 (기존과 동일, dname 인코딩 추가) */}
          <button className="map-button naver" onClick={() => openMapLink('naver')}>
            <img src={NAVER_LOGO_PATH} alt="네이버 지도 로고" className="map-logo" />
            <span>네이버 지도</span>
          </button>

          {/* 구글맵 버튼: 범용 웹 링크 사용 (앱 설치 시 앱으로 연결 시도) */}
          <button className="map-button google" onClick={() => openMapLink('google')}>
            <img src={GOOGLE_LOGO_PATH} alt="구글맵 로고" className="map-logo" />
            <span>구글맵</span>
          </button>

          {/* 티맵 버튼: tmap:// scheme 사용 (기존과 동일, goalname 인코딩 추가) */}
          <button className="map-button tmap" onClick={() => openMapLink('tmap')}>
            <img src={TMAP_LOGO_PATH} alt="티맵 로고" className="map-logo t-map" />
            <span>티맵</span>
          </button>
        </div>
      </section>
    </>
  );
};

export default MapContainer;
