import { useEffect, useRef } from 'react';

function ZoomBlurEffect() {
  // visualViewport API 지원 여부 및 초기 scale 값은 한 번만 확인하도록 useRef 사용
  const visualViewportRef = useRef(typeof window !== 'undefined' ? window.visualViewport : null);
  const initialScaleCheckedRef = useRef(false); // 초기 스케일 확인 여부

  useEffect(() => {
    const vv = visualViewportRef.current;

    if (!vv) {
      console.warn(
        'ZoomBlurEffect: visualViewport API is not supported in this browser or not available yet.',
      );
      return;
    }

    const handleZoom = () => {
      console.log('scale', vv.scale);

      // "조금이라도 확대" -> scale이 1.0보다 큰 경우
      // 부동 소수점 오차를 고려하여 작은 임계값을 사용할 수도 있습니다.
      // 예: if (vv.scale > 1.001)
      if (vv.scale > 1.0) {
        document.body.classList.add('screen-zoomed');
      } else {
        document.body.classList.remove('screen-zoomed');
      }
    };

    if (!initialScaleCheckedRef.current) {
      handleZoom();
      initialScaleCheckedRef.current = true;
    }

    vv.addEventListener('resize', handleZoom);

    return () => {
      vv.removeEventListener('resize', handleZoom);

      document.body.classList.remove('screen-zoomed');
    };
  }, []);

  return null;
}

export default ZoomBlurEffect;
