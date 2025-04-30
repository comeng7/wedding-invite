import { useEffect, useRef } from 'react';

import useBottomSheet from '@/hooks/useBottomSheet';
import useScrollFadeIn from '@/hooks/useScrollFadeIn';

// --- 로고 이미지 경로 (실제 경로로 수정해주세요) ---
const KAKAO_LOGO_PATH = '/src/assets/kakao.png'; // 예: '/images/logos/kakao.png'
const NAVER_LOGO_PATH = '/src/assets/naver.png';
const GOOGLE_LOGO_PATH = '/src/assets/google.jpg';
const TMAP_LOGO_PATH = '/src/assets/tmap.png';
// ------------------------------------------

const HOTEL_COORDS = { lat: 37.505603818492, lon: 126.88387163888 };
const KAKAO_MAP_SCRIPT =
  'https://dapi.kakao.com/v2/maps/sdk.js?appkey=caa1f990ddac03a515947f427d7256d6&autoload=false';

const MapContainer = () => {
  const mapRef = useRef(null);
  const addressRef = useRef(null);

  const sectionRef = useScrollFadeIn();
  const { openBottomSheet, BottomSheetComponent } = useBottomSheet();

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
        title: '더링크호텔 서울 웨딩',
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
        openBottomSheet('주소가 클립보드에 복사되었습니다.', 3000); // 바텀 시트 열기 (3초)
      } catch (err) {
        console.error('주소 복사 실패:', err);
        openBottomSheet('주소 복사에 실패했습니다. 다시 시도해주세요.', 3000); // 에러 메시지도 표시 가능
      }
      // setTimeout 제거
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
        <p className="venue-name">더 링크 서울, 트리뷰트 포트폴리오 호텔</p>
        <div className="address-container">
          <p className="venue-address-kr" ref={addressRef}>
            서울특별시 구로구 경인로 610 (지번) 신도림동 413-9
          </p>
          <button
            className="copy-address-button icon-button" // icon-button 클래스 추가 (스타일링용)
            onClick={handleCopyAddress}
            aria-label="주소 복사" // 접근성을 위한 레이블
          >
            <ClipboardIcon />
          </button>
        </div>
        <div className="map-wrapper">
          <div ref={mapRef} className="kakao-map" />
        </div>
        <div className="map-buttons">
          {/* 카카오맵 버튼 */}
          <a
            href={`https://map.kakao.com/link/to/더링크호텔,${HOTEL_COORDS.lat},${HOTEL_COORDS.lon}`}
            className="map-button kakao"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={KAKAO_LOGO_PATH} alt="카카오맵 로고" className="map-logo" />
            <span>카카오맵</span> {/* 텍스트를 span으로 감싸기 (선택 사항) */}
          </a>
          {/* 네이버 지도 버튼 */}
          <a
            href={`nmap://navigation?dlat=${HOTEL_COORDS.lat}&dlon=${HOTEL_COORDS.lon}&dname=더링크호텔&appname=MyWeddingCard`}
            className="map-button naver"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={NAVER_LOGO_PATH} alt="네이버 지도 로고" className="map-logo" />
            <span>네이버 지도</span>
          </a>
          {/* 구글맵 버튼 */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${HOTEL_COORDS.lat},${HOTEL_COORDS.lon}&destination_place_id=&travelmode=driving`}
            className="map-button google"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={GOOGLE_LOGO_PATH} alt="구글맵 로고" className="map-logo" />
            <span>구글맵</span>
          </a>
          {/* 티맵 버튼 */}
          <a
            href={`tmap://route?goalname=더링크호텔&goalx=${HOTEL_COORDS.lon}&goaly=${HOTEL_COORDS.lat}`}
            className="map-button tmap"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={TMAP_LOGO_PATH} alt="티맵 로고" className="map-logo" />
            <span>티맵</span>
          </a>
        </div>
      </section>

      <BottomSheetComponent />
    </>
  );
};

export default MapContainer;
