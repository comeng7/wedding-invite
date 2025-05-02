import { useRef } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const BrideGroomIntro = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      gsap.from('.intro-card.left', {
        x: -100,
        opacity: 0,
        duration: 1.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from('.intro-card.right', {
        x: 100,
        opacity: 0,
        duration: 1.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section className="container-wrapper bride-groom-intro" ref={sectionRef}>
      <h2 className="main-title">INTRODUCE</h2>
      <div className="cards">
        <div className="intro-card left">
          <p className="label">신랑</p>
          <p className="name">정장오</p>
          <p className="desc">따뜻하고 다정한, 늘 웃음 가득한 사람이에요.</p>
        </div>
        <div className="intro-card right">
          <p className="label">신부</p>
          <p className="name">엄유경</p>
          <p className="desc">밝고 섬세하며, 함께 있을 때 가장 행복한 사람이에요.</p>
        </div>
      </div>
    </section>
  );
};

export default BrideGroomIntro;
