import { useContext } from 'react';

import ModalContext from '@/contexts/ModalContext';

const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal은 ModalProvider 내부에서 사용해야 합니다.');
  }
  return context;
};

export default useModal;
