import { useRef, useEffect } from 'react';

import gsap from 'gsap';

import bgImage from '../assets/dd.jpeg';

const Intro = () => {
  const textRef = useRef(null);
  const clickRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('prevent-scroll');
    clickRef.current.style.opacity = '0';

    const letters = textRef.current?.querySelectorAll('.letter');

    gsap.fromTo(
      letters,
      {
        opacity: 0,
        scale: 0.8,
        y: 30,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: 'back.out(1.7)',
        onComplete: () => {
          document.body.classList.remove('prevent-scroll');
          gsap.to(clickRef.current, {
            opacity: 1,
            duration: 0.5,
          });
        },
      },
    );

    gsap.to(clickRef.current, {
      y: -10,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      duration: 0.8,
    });
  }, []);

  const splitText = (text) =>
    text.split('').map((char, i) => (
      <span className="letter" key={i}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));

  return (
    <div className="intro" style={{ backgroundImage: `url(${bgImage})` }}>
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
