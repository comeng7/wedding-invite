import { useEffect, useRef, useState } from 'react'; // useState 추가

import useScrollFadeIn from '@/hooks/useScrollFadeIn';

// 좌표 값 상수화
const HOTEL_COORDS = { lat: 37.505603818492, lon: 126.88387163888 };
const KAKAO_MAP_SCRIPT =
  'https://dapi.kakao.com/v2/maps/sdk.js?appkey=caa1f990ddac03a515947f427d7256d6&autoload=false';

const MapContainer = () => {
  const [copyFeedback, setCopyFeedback] = useState(''); // 복사 피드백 상태
  const mapRef = useRef(null);
  const addressRef = useRef(null); // 주소 엘리먼트 참조용

  const sectionRef = useScrollFadeIn();

  const loadKakaoMap = () => {
    if (window.kakao && window.kakao.maps) {
      const container = mapRef.current;
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(HOTEL_COORDS.lat, HOTEL_COORDS.lon),
        level: 3, // 적절한 확대 레벨
      };

      const map = new window.kakao.maps.Map(container, options);

      // 마커 추가
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(HOTEL_COORDS.lat, HOTEL_COORDS.lon),
        title: '더링크호텔 서울 웨딩',
      });

      // 지도 확대/축소 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    }
  };

  const loadKakaoMapScript = () => {
    const script = document.createElement('script');
    script.src = KAKAO_MAP_SCRIPT;
    script.onload = () => window.kakao.maps.load(loadKakaoMap);
    script.onerror = () => {
      // 스크립트 로드 실패 시 에러 처리
      console.error('Kakao Maps SDK load failed.');
      // 사용자에게 에러 메시지 표시 등 추가 처리
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

  // 주소 복사 핸들러
  const handleCopyAddress = async () => {
    const address = addressRef.current?.innerText;
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopyFeedback('주소가 복사되었습니다.');
      } catch (err) {
        console.error('주소 복사 실패:', err);
        setCopyFeedback('주소 복사에 실패했습니다.');
      }
      // 3초 후에 피드백 메시지 사라지게 함
      setTimeout(() => {
        setCopyFeedback('');
      }, 3000);
    }
  };

  return (
    <section className="container-wrapper map-section" ref={sectionRef}>
      <h2 className="main-title">LOCATION</h2>
      <p className="venue-name">더 링크 서울, 트리뷰트 포트폴리오 호텔</p>
      <div className="address-container">
        {/* 주소와 복사 버튼을 감싸는 div 추가 */}
        <p className="venue-address-kr" ref={addressRef}>
          서울특별시 구로구 경인로 610 (지번) 신도림동 413-9
        </p>
        <button className="copy-address-button" onClick={handleCopyAddress}>
          주소 복사
        </button>
      </div>
      {copyFeedback && <p className="copy-feedback">{copyFeedback}</p>} {/* 복사 피드백 메시지 */}
      <div className="map-wrapper">
        <div ref={mapRef} className="kakao-map" />
      </div>
      <div className="map-buttons">
        {/* 지도 앱 버튼들 */}
        <a
          href={`https://map.kakao.com/link/to/더링크호텔,${HOTEL_COORDS.lat},${HOTEL_COORDS.lon}`}
          className="map-button kakao"
          target="_blank"
          rel="noopener noreferrer"
        >
          카카오맵 길찾기
        </a>
        {/* 네이버/티맵은 모바일 앱 Scheme URL 사용 */}
        <a
          href={`nmap://navigation?dlat=${HOTEL_COORDS.lat}&dlon=${HOTEL_COORDS.lon}&dname=더링크호텔&appname=MyWeddingCard`}
          className="map-button naver"
          target="_blank"
          rel="noopener noreferrer"
        >
          네이버 지도 길찾기
        </a>
        {/* 구글맵은 웹 URL 또는 앱 Scheme URL 사용 (웹 URL이 더 범용적) */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${HOTEL_COORDS.lat},${HOTEL_COORDS.lon}&destination_place_id=&travelmode=driving`}
          className="map-button google"
          target="_blank"
          rel="noopener noreferrer"
        >
          구글맵 길찾기
        </a>
        <a
          href={`tmap://route?goalname=더링크호텔&goalx=${HOTEL_COORDS.lon}&goaly=${HOTEL_COORDS.lat}`}
          className="map-button tmap"
          target="_blank"
          rel="noopener noreferrer"
        >
          티맵 길찾기
        </a>
      </div>
    </section>
  );
};

export default MapContainer;
