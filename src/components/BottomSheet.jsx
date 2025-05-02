import { createPortal } from 'react-dom';

const BottomSheet = ({ isOpen, isAnimatingOut, content, animationDuration }) => {
  if (!isOpen && !isAnimatingOut) {
    return null;
  }

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
