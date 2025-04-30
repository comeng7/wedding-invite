import { useState, useCallback, useRef, useEffect } from 'react';

import BottomSheet from '@/components/BottomSheet';

const useBottomSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); // 닫힘 애니메이션 상태
  const timerRef = useRef(null);
  const animationDuration = 300; // CSS 애니메이션 시간과 일치 (ms)

  const openBottomSheet = useCallback((newContent, duration = 3000) => {
    clearTimeout(timerRef.current); // 이전 타이머 제거
    setContent(newContent);
    setIsOpen(true);
    setIsAnimatingOut(false); // 열릴 때는 닫힘 애니메이션 상태 해제

    // 지정된 시간 후 자동으로 닫기
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        closeBottomSheet();
      }, duration);
    }
  }, []);

  const closeBottomSheet = useCallback(() => {
    setIsAnimatingOut(true); // 닫힘 애니메이션 시작
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false); // 애니메이션 끝나면 상태 완전 초기화
      setContent(null);
    }, animationDuration); // 애니메이션 시간만큼 기다린 후 상태 변경
  }, []);

  // 컴포넌트 언마운트 시 타이머 클린업
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  // 훅이 렌더링할 BottomSheet 컴포넌트 반환
  const BottomSheetComponent = useCallback(
    () => (
      <BottomSheet
        isOpen={isOpen || isAnimatingOut} // 열려있거나 닫히는 중일 때 렌더링
        isAnimatingOut={isAnimatingOut} // 닫힘 애니메이션 상태 전달
        content={content}
        onClose={closeBottomSheet}
        animationDuration={animationDuration}
      />
    ),
    [isOpen, isAnimatingOut, content, closeBottomSheet, animationDuration],
  );

  return { openBottomSheet, closeBottomSheet, BottomSheetComponent };
};

export default useBottomSheet;
