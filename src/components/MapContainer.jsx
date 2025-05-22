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

  const openNaverMap = () => {
    const start = Date.now();
    window.open('nmap://place?id=1070501110');
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.open('https://map.naver.com/p/entry/place/1070501110', '_blank');
      }
    }, 1500);
  };

  const openKakaoMap = () => {
    const start = Date.now();
    window.open('kakaomap://place?id=801090941');
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.open('https://place.map.kakao.com/801090941', '_blank');
      }
    }, 1500);
  };

  const openGoogleMap = () => {
    const start = Date.now();
    window.open('comgooglemaps://?q=더링크호텔');
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.open('https://maps.app.goo.gl/ibURi4PEvgjxe6Pn8', '_blank');
      }
    }, 1500);
  };

  const openTmap = () => {
    const start = Date.now();
    window.open('tmap://search?name=더링크호텔');
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        openToast('티맵 앱이 설치되어 있지 않습니다.');
      }
    }, 1500);
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
          <button className="map-button kakao" onClick={openKakaoMap}>
            <img src={KAKAO_LOGO_PATH} alt="카카오맵 로고" className="map-logo" />
            <span>카카오맵</span>
          </button>

          {/* 네이버 지도 버튼: nmap:// scheme 사용 (기존과 동일, dname 인코딩 추가) */}
          <button className="map-button naver" onClick={openNaverMap}>
            <img src={NAVER_LOGO_PATH} alt="네이버 지도 로고" className="map-logo" />
            <span>네이버 지도</span>
          </button>

          {/* 구글맵 버튼: 범용 웹 링크 사용 (앱 설치 시 앱으로 연결 시도) */}
          <button className="map-button google" onClick={openGoogleMap}>
            <img src={GOOGLE_LOGO_PATH} alt="구글맵 로고" className="map-logo" />
            <span>구글맵</span>
          </button>

          {/* 티맵 버튼: tmap:// scheme 사용 (기존과 동일, goalname 인코딩 추가) */}
          <button className="map-button tmap" onClick={openTmap}>
            <img src={TMAP_LOGO_PATH} alt="티맵 로고" className="map-logo t-map" />
            <span>티맵</span>
          </button>
        </div>
      </section>
    </>
  );
};

export default MapContainer;
