import { forwardRef, useEffect } from 'react';

import { gsap } from 'gsap';

const Toast = forwardRef(({ message, isVisible }, ref) => {
  useEffect(() => {
    if (ref && ref.current) {
      if (isVisible) {
        gsap.killTweensOf(ref.current); // 이전 애니메이션 중지
        gsap.fromTo(
          ref.current,
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' },
        );
      }
    }
  }, [isVisible, ref]);

  if (!isVisible && !message) return null;

  return (
    <div ref={ref} className={`toastContainer ${isVisible ? 'visible' : ''}`}>
      <p className="message">{message}</p>
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;
