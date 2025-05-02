import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeable } from 'react-swipeable';

import gsap from 'gsap';

import useScrollFadeIn from '@/hooks/useScrollFadeIn';

// --- Constants ---
const sampleImages = [
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
  'src/assets/dd.jpeg',
];
const INITIAL_VISIBLE_COUNT = 9; // 처음에 보여줄 이미지 개수

// 이미지 URL로부터 미리 로딩하는 함수
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

  const sectionRef = useScrollFadeIn();

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

  const preventContextMenu = useCallback((e) => e.preventDefault(), []);

  const toggleShowAll = useCallback((event) => {
    event.preventDefault();
    setShowAll(true);
  }, []);

  const openModal = useCallback(
    (index) => {
      setSelectedImageIndex(index);
      // 다음/이전 이미지 미리 로딩
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
    },
    [images],
  );

  const closeModal = useCallback(() => {
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
  }, []);

  const animateImageChange = useCallback(
    (newIndex, direction) => {
      if (!modalImageRef.current) return;

      const xDirection = direction === 'next' ? -50 : 50;
      // 다음/이전 이미지 미리 로딩
      if (images.length > 1) {
        const nextNextIndex = newIndex === images.length - 1 ? 0 : newIndex + 1;
        const prevPrevIndex = newIndex === 0 ? images.length - 1 : newIndex - 1;
        if (direction === 'next') preloadImage(images[nextNextIndex]);
        if (direction === 'prev') preloadImage(images[prevPrevIndex]);
      }

      gsap.to(modalImageRef.current, {
        duration: 0.2,
        x: xDirection,
        opacity: 0,
        ease: 'power2.in',
        onComplete: () => {
          setSelectedImageIndex(newIndex); // 인덱스 업데이트
          gsap.fromTo(
            // 새 이미지 등장 애니메이션
            modalImageRef.current,
            { x: -xDirection, opacity: 0 },
            { duration: 0.2, x: 0, opacity: 1, ease: 'power2.out' },
          );
        },
      });
    },
    [images],
  );

  const showPrevImage = useCallback(
    (e) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      const newIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;
      animateImageChange(newIndex, 'prev');
    },
    [selectedImageIndex, images.length, animateImageChange],
  );

  const showNextImage = useCallback(
    (e) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      const newIndex = selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1;
      animateImageChange(newIndex, 'next');
    },
    [selectedImageIndex, images.length, animateImageChange],
  );

  // 스와이프 핸들러
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => showNextImage(),
    onSwipedRight: () => showPrevImage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <section className="container-wrapper photo-gallery-container" ref={sectionRef}>
      <h2 className="main-title">GALLERY</h2>
      <div ref={galleryRef} className={`photo-gallery ${showAll ? 'show-all' : ''}`}>
        {images.map((imgSrc, index) => (
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
              loading="lazy" // 지연 로딩
              onLoad={(e) => {
                e.target.style.opacity = '1';
              }}
              onError={(e) => {
                e.target.style.opacity = '0';
              }}
              style={{ opacity: 0 }}
            />
          </div>
        ))}
      </div>

      {/* 더보기/접기 버튼 */}
      {images.length > INITIAL_VISIBLE_COUNT && !showAll && (
        <button onClick={toggleShowAll} className="toggle-button">
          더보기
        </button>
      )}

      {/* 모달 */}
      {selectedImageIndex !== null &&
        createPortal(
          <div
            {...swipeHandlers}
            ref={modalRef}
            className="modal-overlay"
            onClick={closeModal}
            style={{ visibility: 'hidden' }}
            role="dialog"
            aria-modal="true"
            aria-label={`웨딩 사진 ${selectedImageIndex + 1} 상세보기`}
          >
            {/* 닫기 버튼 */}
            <button className="close-button" aria-label="닫기" onClick={closeModal}>
              ×
            </button>

            {/* 이전 버튼 (이미지가 2개 이상일 때만 표시) */}
            {images.length > 1 && (
              <button className="prev-button" aria-label="이전 사진" onClick={showPrevImage}>
                ‹
              </button>
            )}

            {/* 모달 컨텐츠 */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img
                ref={modalImageRef}
                src={
                  images[selectedImageIndex] instanceof Object
                    ? images[selectedImageIndex].src
                    : images[selectedImageIndex]
                }
                alt={`웨딩 사진 ${selectedImageIndex + 1}`}
                onContextMenu={preventContextMenu}
                className="modal-image"
              />
            </div>

            {/* 다음 버튼 (이미지가 2개 이상일 때만 표시) */}
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
