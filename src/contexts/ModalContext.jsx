import { createContext, useState, useCallback, useEffect } from 'react';

import Modal from '@/components/Modal';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalInfo, setModalInfo] = useState({
    content: null,
    isVisible: false,
  });

  const openModal = useCallback((content) => {
    setModalInfo({ content, isVisible: true });
  }, []);

  const closeModal = useCallback(() => {
    // Modal.jsx 내부에서 GSAP 퇴장 애니메이션 후 isVisible을 false로 설정
    setModalInfo((prev) => ({ ...prev, isVisible: false })); // 애니메이션 콜백에서 content: null 처리
  }, []);

  // 모달이 열렸을 때 스크롤 방지
  useEffect(() => {
    if (modalInfo.isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalInfo.isVisible]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal isVisible={modalInfo.isVisible} onClose={closeModal}>
        {modalInfo.content}
      </Modal>
    </ModalContext.Provider>
  );
};

export default ModalContext;
