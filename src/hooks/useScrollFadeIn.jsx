import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 스크롤 시 아래에서 위로 나타나는 페이드인 애니메이션을 적용하는 커스텀 훅
 * @param {object} options - 애니메이션 옵션 (duration, y, start 등)
 * @param {number} [options.duration=1] - 애니메이션 지속 시간 (초)
 * @param {number} [options.y=50] - 시작 시 Y축 오프셋 (px)
 * @param {string} [options.start='top 85%'] - ScrollTrigger 시작 지점
 * @returns {React.RefObject} - 애니메이션을 적용할 요소에 연결할 ref 객체
 */
const useScrollFadeIn = (options = {}) => {
  const elementRef = useRef(null); // ref 생성

  // 기본 옵션과 사용자 옵션 병합
  const { duration = 1, y = 50, start = 'top 85%' } = options;

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return; // 요소가 없으면 중단

    const ctx = gsap.context(() => {
      gsap.from(element, {
        y: y,
        opacity: 0,
        duration: duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: start,
          toggleActions: 'play none none reverse',
          // markers: process.env.NODE_ENV === 'development', // 개발 모드에서만 마커 표시 (선택 사항)
        },
      });
    }, elementRef); // scope 지정

    // 클린업 함수: 컴포넌트 언마운트 시 ScrollTrigger 인스턴스 제거
    return () => ctx.revert();
  }, [duration, y, start]); // 옵션 값이 변경될 경우 effect 재실행

  return elementRef; // 생성된 ref 반환
};

export default useScrollFadeIn;
