import { useRef } from 'react';

const Modal = ({ isVisible, onClose, children }) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const handleClose = () => {
    onClose();
  };

  if (!isVisible && !children) return null;

  return (
    <div
      className={`modalOverlayContainer ${isVisible ? 'visible' : ''}`}
      ref={overlayRef}
      onClick={handleClose}
    >
      <div className="modalContent" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" onClick={handleClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
