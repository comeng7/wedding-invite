import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeable } from 'react-swipeable';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import useScrollFadeIn from '@/hooks/useScrollFadeIn';

// 기본 이미지 배열 (환경 변수를 사용하여 BASE_URL 접근)
const sampleImages = [
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
  `${import.meta.env.BASE_URL}images/album/1.webp`,
  `${import.meta.env.BASE_URL}images/album/2.webp`,
];
const INITIAL_VISIBLE_COUNT = 9; // 처음에 보여줄 이미지 개수

// 이미지 미리 로딩 함수
const preloadImage = (src) => {
  const img = new Image();
  img.src = src;
};

const PhotoGallery = ({ images = sampleImages }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // 선택된 이미지 인덱스
  const [showAll, setShowAll] = useState(false); // 모든 이미지 표시 여부
  const modalRef = useRef(null); // 모달 오버레이 ref
  const modalImageRef = useRef(null); // 모달 이미지 ref
  const galleryRef = useRef(null); // 갤러리 컨테이너 ref
  const imgRef = useRef(null); // 첫 번째 썸네일 이미지 ref (높이 계산용)
  const containerRef = useRef(null); // 전체 섹션 컨테이너 ref (GSAP 스코프용)

  const sectionRef = useScrollFadeIn(); // 스크롤 페이드인 효과 훅

  // GSAP 컨텍스트 설정 (애니메이션 관리 용이)
  const { contextSafe } = useGSAP({ scope: containerRef });

  // 첫 이미지 로드 시 갤러리 높이 계산 (초기 3줄 높이 설정)
  useEffect(() => {
    if (!imgRef.current) return;
    const handleLoad = () => {
      const h = imgRef.current?.getBoundingClientRect().height;
      if (galleryRef.current && h) {
        // 3줄 높이 + gap(7.5px * 2) = 15px
        galleryRef.current.style.maxHeight = `${h * 3 + 15}px`;
      }
    };
    const img = imgRef.current;
    if (img.complete) {
      // 이미지가 캐시되어 바로 로드 완료된 경우
      handleLoad();
    } else {
      // 이미지가 로드될 때까지 기다림
      img.addEventListener('load', handleLoad);
      return () => img.removeEventListener('load', handleLoad); // 클린업
    }
  }, []);

  // 이미지 우클릭 메뉴 방지 콜백
  const preventContextMenu = useCallback((e) => e.preventDefault(), []);

  // 더보기/접기 토글 콜백
  const toggleShowAll = useCallback((event) => {
    event.preventDefault();
    setShowAll(true); // 항상 true로 설정 (접기 기능 없음)
  }, []);

  // 모달 열기 (GSAP 애니메이션 포함, 다음/이전 이미지 미리 로딩)
  const openModal = contextSafe((index) => {
    setSelectedImageIndex(index);
    // 다음/이전 이미지 미리 로딩 (개선된 성능)
    if (images.length > 1) {
      const nextIndex = index === images.length - 1 ? 0 : index + 1;
      const prevIndex = index === 0 ? images.length - 1 : index - 1;
      preloadImage(images[nextIndex]);
      preloadImage(images[prevIndex]);
    }

    // requestAnimationFrame으로 다음 렌더링 프레임에서 애니메이션 실행 보장
    requestAnimationFrame(() => {
      if (modalRef.current) {
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        gsap
          .timeline()
          .set(modalRef.current, { visibility: 'visible' }) // 즉시 보이도록 설정
          // 오버레이 페이드인 및 스케일업 애니메이션
          .to(modalRef.current, { duration: 0.1, autoAlpha: 1, scale: 1 }, 0)
          // 이미지 스케일업 및 페이드인 애니메이션 (약간의 딜레이)
          .fromTo(
            modalImageRef.current,
            { scale: 0.9, opacity: 0 },
            { duration: 0.4, scale: 1, opacity: 1, delay: 0.1, ease: 'power2.out' },
            0, // 타임라인 시작과 동시에 시작 (오버레이 애니메이션과 함께)
          );
      }
    });
  });

  // 모달 닫기 (GSAP 애니메이션 포함)
  const closeModal = contextSafe(() => {
    gsap.to(modalRef.current, {
      duration: 0.3,
      autoAlpha: 0, // opacity: 0, visibility: 'hidden' 동시 적용
      scale: 0.9, // 약간 축소되는 효과
      ease: 'power2.in',
      onComplete: () => {
        setSelectedImageIndex(null); // 선택된 이미지 상태 초기화
        document.body.style.overflow = ''; // 배경 스크롤 허용
      },
    });
  });

  // 이미지 변경 애니메이션 (좌우 슬라이드 효과, 새 이미지 미리 로딩)
  const animateImageChange = contextSafe((newIndex, direction) => {
    if (!modalImageRef.current) return;

    gsap.killTweensOf(modalImageRef.current); // 진행 중인 이미지 애니메이션 즉시 중지 (빠른 전환 시 중요)

    // 다음/이전 이미지 미리 로딩 (더 나은 사용자 경험)
    if (images.length > 1) {
      const nextNextIndex = newIndex === images.length - 1 ? 0 : newIndex + 1;
      const prevPrevIndex = newIndex === 0 ? images.length - 1 : newIndex - 1;
      if (direction === 'next') preloadImage(images[nextNextIndex]);
      if (direction === 'prev') preloadImage(images[prevPrevIndex]);
    }

    const xDirection = direction === 'next' ? -50 : 50; // 이동 방향 및 거리
    gsap.to(modalImageRef.current, {
      duration: 0.2,
      x: xDirection, // 현재 이미지 옆으로 이동
      opacity: 0, // 페이드 아웃
      ease: 'power2.in',
      onComplete: () => {
        setSelectedImageIndex(newIndex); // 이미지 인덱스 업데이트 (src 변경 트리거)
        // 새 이미지가 로드된 후 애니메이션 시작 (반대 방향에서 중앙으로)
        gsap.fromTo(
          modalImageRef.current,
          { x: -xDirection, opacity: 0 }, // 시작 상태 (반대편, 투명)
          { duration: 0.2, x: 0, opacity: 1, ease: 'power2.out' }, // 최종 상태 (중앙, 불투명)
        );
      },
    });
  });

  // 이전 이미지 보기 콜백 (클릭/스와이프 공용)
  const showPrevImage = useCallback(
    (e) => {
      e?.stopPropagation(); // 이벤트 버블링 방지 (모달 닫힘 방지 등)
      if (images.length <= 1 || selectedImageIndex === null) return; // 예외 처리
      const newIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1; // 순환 인덱스 계산
      animateImageChange(newIndex, 'prev'); // 애니메이션 실행
    },
    [selectedImageIndex, images.length, animateImageChange],
  );

  // 다음 이미지 보기 콜백 (클릭/스와이프 공용)
  const showNextImage = useCallback(
    (e) => {
      e?.stopPropagation(); // 이벤트 버블링 방지
      if (images.length <= 1 || selectedImageIndex === null) return; // 예외 처리
      const newIndex = selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1; // 순환 인덱스 계산
      animateImageChange(newIndex, 'next'); // 애니메이션 실행
    },
    [selectedImageIndex, images.length, animateImageChange],
  );

  // react-swipeable 훅 설정
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => showNextImage(), // 왼쪽 스와이프 시 다음 이미지
    onSwipedRight: () => showPrevImage(), // 오른쪽 스와이프 시 이전 이미지
    preventScrollOnSwipe: true, // 스와이프 중 페이지 스크롤 방지
    trackMouse: true, // 마우스 드래그로도 스와이프 가능 (데스크탑 테스트용)
  });

  return (
    <section ref={containerRef} className="container-wrapper photo-gallery-container">
      {/* 스크롤 페이드인 효과 적용 대상 div */}
      <div ref={sectionRef}>
        <h2 className="main-title">GALLERY</h2>
        {/* 갤러리 그리드 */}
        <div ref={galleryRef} className={`photo-gallery ${showAll ? 'show-all' : ''}`}>
          {/* 보이는 이미지 렌더링 (초기 개수 또는 전체) */}
          {images.slice(0, showAll ? images.length : INITIAL_VISIBLE_COUNT).map((imgSrc, index) => (
            <div
              key={`${imgSrc}-${index}`} // 고유 key
              className="gallery-thumbnail"
              onClick={() => openModal(index)} // 클릭 시 모달 열기
              onContextMenu={preventContextMenu} // 우클릭 방지
              role="button" // 접근성
            >
              <img
                ref={index === 0 ? imgRef : undefined} // 첫 번째 이미지에만 ref 할당
                src={imgSrc}
                alt={`웨딩 사진 ${index + 1}`}
                loading="lazy" // 지연 로딩
                style={{ opacity: 1 }} // 초기 투명도 (필요시 수정)
              />
            </div>
          ))}
        </div>

        {/* 더보기 버튼 (INITIAL_VISIBLE_COUNT보다 많고, showAll이 아닐 때) */}
        {images.length > INITIAL_VISIBLE_COUNT && !showAll && (
          <button onClick={toggleShowAll} className="toggle-button">
            더보기
          </button>
        )}
      </div>

      {/* 모달 (선택된 이미지가 있을 때만 Portal로 body에 렌더링) */}
      {selectedImageIndex !== null &&
        createPortal(
          <div
            ref={modalRef}
            className="modal-overlay"
            onClick={closeModal} // 오버레이 클릭 시 모달 닫기
            style={{ visibility: 'hidden', opacity: 0 }} // 초기 상태 (GSAP 제어)
            role="dialog" // 접근성
            aria-modal="true" // 접근성
          >
            {/* 닫기 버튼 */}
            <button className="close-button" aria-label="닫기" onClick={closeModal}>
              ×
            </button>
            {/* 이전 버튼 (이미지가 2개 이상일 때) */}
            {images.length > 1 && (
              <button className="prev-button" aria-label="이전 사진" onClick={showPrevImage}>
                ‹
              </button>
            )}
            {/* 모달 콘텐츠 영역 (스와이프 핸들러 적용) */}
            <div
              {...swipeHandlers} // 여기에 swipeHandlers 적용!
              className="modal-content"
              onClick={(e) => e.stopPropagation()} // 콘텐츠 클릭 시 모달 닫힘 방지
            >
              {/* 모달 이미지 */}
              <img
                ref={modalImageRef}
                src={images[selectedImageIndex]}
                alt={`웨딩 사진 ${selectedImageIndex + 1}`}
                onContextMenu={preventContextMenu} // 우클릭 방지
                className="modal-image"
              />
            </div>
            {/* 다음 버튼 (이미지가 2개 이상일 때) */}
            {images.length > 1 && (
              <button className="next-button" aria-label="다음 사진" onClick={showNextImage}>
                ›
              </button>
            )}
          </div>,
          document.body, // Portal 대상
        )}
    </section>
  );
};

export default PhotoGallery;
