import { useEffect, useRef } from 'react';

import gsap from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import ScrollTrigger from 'gsap/ScrollTrigger';

import BrideGroomIntro from './components/BrideGroomIntro';
import Calendar from './components/Calendar';
import Intro from './components/Intro';
import MapContainer from './components/MapContainer';
import PhotoGallery from './components/PhotoGallery';
import './styles/main.scss';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const App = () => {
  const mainRef = useRef();
  const smootherRef = useRef();

  useEffect(() => {
    const handleBeforeUnload = () => window.scrollTo(0, 0);
    window.addEventListener('beforeunload', handleBeforeUnload);

    smootherRef.current = ScrollSmoother.create({
      wrapper: mainRef.current,
      content: '#smooth-content',
      smooth: 1.2,
      effects: true,
      smoothTouch: 0.1,
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreference = () => {
      if (smootherRef.current) {
        smootherRef.current.paused(prefersReducedMotion.matches);
      }
    };
    handleMotionPreference();
    prefersReducedMotion.addEventListener('change', handleMotionPreference);

    let sakuraInstance = null;
    if (window.Sakura) {
      try {
        sakuraInstance = new window.Sakura('body', {
          fallSpeed: 2,
          delay: 1000,
        });
      } catch (error) {
        console.error('Sakura initialization failed:', error);
      }
    }

    const handleAnimationEnd = (event) => {
      if (event.animationName === 'fall' && event.target.classList.contains('sakura')) {
        event.target.remove();
      }
    };
    document.addEventListener('animationend', handleAnimationEnd, true);

    // 클린업 함수
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      prefersReducedMotion.removeEventListener('change', handleMotionPreference);
      document.removeEventListener('animationend', handleAnimationEnd, true);
      // ScrollSmoother 인스턴스 제거
      if (smootherRef.current) {
        smootherRef.current.kill();
      }
      if (sakuraInstance) {
        try {
          sakuraInstance.stop(true);
        } catch (error) {
          console.error('Sakura stop failed:', error);
        }
      }
      document.querySelectorAll('.sakura').forEach((el) => el.remove());
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={mainRef}>
      <div id="smooth-content">
        <Intro />
        <BrideGroomIntro />
        <Calendar />
        <PhotoGallery />
        <MapContainer />
      </div>
    </div>
  );
};

export default App;
