import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeable } from 'react-swipeable';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import useScrollFadeIn from '@/hooks/useScrollFadeIn';

const sampleImages = [
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
  'public//images/dd.jpeg',
];
const INITIAL_VISIBLE_COUNT = 9;

// 이미지 미리 로딩 함수
const preloadImage = (src) => {
  const img = new Image();
  img.src = src;
};

const PhotoGallery = ({ images = sampleImages }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const modalRef = useRef(null);
  const modalImageRef = useRef(null);
  const galleryRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const sectionRef = useScrollFadeIn();

  // GSAP 컨텍스트 설정
  const { contextSafe } = useGSAP({ scope: containerRef });

  useEffect(() => {
    if (!imgRef.current) return;
    const handleLoad = () => {
      const h = imgRef.current?.getBoundingClientRect().height;
      if (galleryRef.current && h) {
        galleryRef.current.style.maxHeight = `${h * 3 + 15}px`;
      }
    };
    const img = imgRef.current;
    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      return () => img.removeEventListener('load', handleLoad);
    }
  }, []);

  // 우클릭 메뉴 방지
  const preventContextMenu = useCallback((e) => e.preventDefault(), []);

  // 더보기/접기 토글
  const toggleShowAll = useCallback((event) => {
    event.preventDefault();
    setShowAll(true);
  }, []);

  // 모달 열기 (contextSafe 적용)
  const openModal = contextSafe((index) => {
    setSelectedImageIndex(index);
    if (images.length > 1) {
      const nextIndex = index === images.length - 1 ? 0 : index + 1;
      const prevIndex = index === 0 ? images.length - 1 : index - 1;
      preloadImage(images[nextIndex]);
      preloadImage(images[prevIndex]);
    }

    requestAnimationFrame(() => {
      if (modalRef.current) {
        document.body.style.overflow = 'hidden';
        gsap
          .timeline()
          .set(modalRef.current, { visibility: 'visible' })
          .to(modalRef.current, { duration: 0.3, autoAlpha: 1, scale: 1, ease: 'power2.out' }, 0)
          .fromTo(
            modalImageRef.current,
            { scale: 0.8, opacity: 0 },
            { duration: 0.4, scale: 1, opacity: 1, delay: 0.1, ease: 'power2.out' },
            0,
          );
      }
    });
  });

  // 모달 닫기 (contextSafe 적용)
  const closeModal = contextSafe(() => {
    gsap.to(modalRef.current, {
      duration: 0.3,
      autoAlpha: 0,
      scale: 0.9,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedImageIndex(null);
        document.body.style.overflow = '';
      },
    });
  });

  // 이미지 변경 애니메이션 (contextSafe 및 killTweensOf 적용)
  const animateImageChange = contextSafe((newIndex, direction) => {
    if (!modalImageRef.current) return;

    gsap.killTweensOf(modalImageRef.current); // 진행중인 이미지 애니메이션 즉시 중지

    if (images.length > 1) {
      const nextNextIndex = newIndex === images.length - 1 ? 0 : newIndex + 1;
      const prevPrevIndex = newIndex === 0 ? images.length - 1 : newIndex - 1;
      if (direction === 'next') preloadImage(images[nextNextIndex]);
      if (direction === 'prev') preloadImage(images[prevPrevIndex]);
    }

    const xDirection = direction === 'next' ? -50 : 50;
    gsap.to(modalImageRef.current, {
      duration: 0.2,
      x: xDirection,
      opacity: 0,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedImageIndex(newIndex);
        gsap.fromTo(
          modalImageRef.current,
          { x: -xDirection, opacity: 0 },
          { duration: 0.2, x: 0, opacity: 1, ease: 'power2.out' },
        );
      },
    });
  });

  // 이전 이미지 보기
  const showPrevImage = useCallback(
    (e) => {
      e?.stopPropagation();
      if (images.length <= 1 || selectedImageIndex === null) return;
      const newIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;
      animateImageChange(newIndex, 'prev');
    },
    [selectedImageIndex, images.length, animateImageChange],
  );

  // 다음 이미지 보기
  const showNextImage = useCallback(
    (e) => {
      e?.stopPropagation();
      if (images.length <= 1 || selectedImageIndex === null) return;
      const newIndex = selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1;
      animateImageChange(newIndex, 'next');
    },
    [selectedImageIndex, images.length, animateImageChange],
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => showNextImage(),
    onSwipedRight: () => showPrevImage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <section ref={containerRef} className="container-wrapper photo-gallery-container">
      <div ref={sectionRef}>
        <h2 className="main-title">GALLERY</h2>
        <div ref={galleryRef} className={`photo-gallery ${showAll ? 'show-all' : ''}`}>
          {images.slice(0, showAll ? images.length : INITIAL_VISIBLE_COUNT).map((imgSrc, index) => (
            <div
              key={`${imgSrc}-${index}`}
              className="gallery-thumbnail"
              onClick={() => openModal(index)}
              onContextMenu={preventContextMenu}
              role="button"
            >
              <img
                ref={index === 0 ? imgRef : undefined}
                src={imgSrc}
                alt={`웨딩 사진 ${index + 1}`}
                loading="lazy"
                style={{ opacity: 1 }}
              />
            </div>
          ))}
        </div>

        {images.length > INITIAL_VISIBLE_COUNT && !showAll && (
          <button onClick={toggleShowAll} className="toggle-button">
            더보기
          </button>
        )}
      </div>

      {selectedImageIndex !== null &&
        createPortal(
          <div
            {...swipeHandlers}
            ref={modalRef}
            className="modal-overlay"
            onClick={closeModal}
            style={{ visibility: 'hidden', opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <button className="close-button" aria-label="닫기" onClick={closeModal}>
              ×
            </button>
            {images.length > 1 && (
              <button className="prev-button" aria-label="이전 사진" onClick={showPrevImage}>
                ‹
              </button>
            )}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img
                ref={modalImageRef}
                src={images[selectedImageIndex]}
                alt={`웨딩 사진 ${selectedImageIndex + 1}`}
                onContextMenu={preventContextMenu}
                className="modal-image"
              />
            </div>
            {images.length > 1 && (
              <button className="next-button" aria-label="다음 사진" onClick={showNextImage}>
                ›
              </button>
            )}
          </div>,
          document.body,
        )}
    </section>
  );
};

export default PhotoGallery;
