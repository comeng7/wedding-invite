import { useRef } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

/**
 * 스크롤 시 아래에서 위로 나타나는 페이드인 애니메이션을 적용하는 커스텀 훅
 */
const useScrollFadeIn = (options = {}) => {
  const elementRef = useRef(null);
  const { duration = 1, y = 50, start = 'top 85%' } = options;

  useGSAP(
    () => {
      const element = elementRef.current;
      if (!element) return;

      gsap.from(element, {
        y: y,
        opacity: 0,
        duration: duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: start,
          toggleActions: 'play none none reverse',
        },
      });
    },
    { scope: elementRef, dependencies: [duration, y, start] },
  );

  return elementRef;
};

export default useScrollFadeIn;
