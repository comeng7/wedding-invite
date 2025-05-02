import { useRef } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Intro = () => {
  const introRef = useRef(null); // 컴포넌트 루트 요소 ref
  const textRef = useRef(null);
  const clickRef = useRef(null);

  useGSAP(
    () => {
      document.body.classList.add('prevent-scroll');
      gsap.set(clickRef.current, { opacity: 0 });

      const letters = textRef.current?.querySelectorAll('.letter');
      if (!letters || letters.length === 0) {
        // 글자가 없으면 스크롤 방지 해제 및 화살표 표시
        document.body.classList.remove('prevent-scroll');
        gsap.to(clickRef.current, { opacity: 1, duration: 0.5 });
        gsap.to(clickRef.current, {
          y: -10,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          duration: 0.8,
        });
        return;
      }

      // 텍스트 등장 애니메이션
      gsap.fromTo(
        letters,
        { opacity: 0, scale: 0.8, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.07,
          duration: 0.6,
          ease: 'back.out(1.7)',
          onComplete: () => {
            // 애니메이션 완료 후 스크롤 방지 해제 및 화살표 표시/애니메이션
            document.body.classList.remove('prevent-scroll');
            gsap.to(clickRef.current, { opacity: 1, duration: 0.5 });
            gsap.to(clickRef.current, {
              y: -10,
              repeat: -1,
              yoyo: true,
              ease: 'power1.inOut',
              duration: 0.8,
            });
          },
        },
      );
    },
    { scope: introRef },
  ); // scope를 introRef로 설정

  // 텍스트를 span 태그로 분리하는 함수
  const splitText = (text) =>
    text.split('').map((char, i) => (
      <span className="letter" key={i}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));

  return (
    <div ref={introRef} className="intro" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/dd.jpeg)` }}>
      <div className="dim">
        <div className="intro-text" ref={textRef}>
          <p>{splitText('2025.09.06')}</p>
          <p>{splitText('우리 결혼합니다')}</p>
        </div>
        <div className="click-indicator" ref={clickRef}>
          <span>Scroll</span>
          <div className="arrow">↓</div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
