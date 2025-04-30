import { createPortal } from 'react-dom'; // Portal 사용

const BottomSheet = ({ isOpen, isAnimatingOut, content, animationDuration }) => {
  if (!isOpen && !isAnimatingOut) {
    return null;
  }

  // document.body에 렌더링하기 위해 Portal 사용
  return createPortal(
    <div
      className={`bottom-sheet ${isOpen && !isAnimatingOut ? 'open' : ''}`}
      style={{ transitionDuration: `${animationDuration}ms` }}
    >
      <div className="bottom-sheet-content">{content}</div>
    </div>,
    document.body, // 실제 DOM의 body에 마운트
  );
};

export default BottomSheet;
