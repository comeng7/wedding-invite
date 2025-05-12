import { createContext, useState, useCallback, useRef } from 'react';

import { gsap } from 'gsap';

import Toast from '@/components/Toast'; // Toast 컴포넌트 경로

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toastInfo, setToastInfo] = useState({
    message: '',
    isVisible: false,
  });
  const toastRef = useRef(null); // Toast 컴포넌트 DOM 참조
  const timerRef = useRef(null); // 자동 닫힘 타이머 참조

  const openToast = useCallback((message, duration = 2000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); // 이전 타이머가 있다면 초기화
    }

    setToastInfo({ message, isVisible: true });

    // GSAP 애니메이션 (Toast.jsx 내부에서 isVisible 변경 시 실행)

    timerRef.current = setTimeout(() => {
      closeToast();
    }, duration);
  }, []);

  const closeToast = useCallback(() => {
    // GSAP 퇴장 애니메이션 (Toast.jsx 내부에서 isVisible 변경 시 실행)
    // 애니메이션 완료 후 isVisible을 false로 설정
    if (toastRef.current) {
      gsap.to(toastRef.current, {
        y: '100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setToastInfo((prev) => ({ ...prev, isVisible: false, message: '' }));
        },
      });
    } else {
      setToastInfo((prev) => ({ ...prev, isVisible: false, message: '' }));
    }
  }, []);

  return (
    <ToastContext.Provider value={{ openToast }}>
      {children}
      <Toast
        ref={toastRef} // ref 전달
        message={toastInfo.message}
        isVisible={toastInfo.isVisible}
        onClose={closeToast} // Toast 컴포넌트 내부에서 닫기 버튼 등으로 활용 가능
      />
    </ToastContext.Provider>
  );
};

export default ToastContext;
