import { useEffect } from 'react';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import BrideGroomIntro from './components/BrideGroomIntro';
import Calendar from './components/Calendar';
import Intro from './components/Intro';
import MapContainer from './components/MapContainer';
import PhotoGallery from './components/PhotoGallery';
import './styles/main.scss';

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  useEffect(() => {
    const handleBeforeUnload = () => window.scrollTo(0, 0);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // useEffect(() => {
  //   if (!window || !window.Sakura) return;

  //   const sakura = new window.Sakura('body', {
  //     fallSpeed: 2,
  //     delay: 1000,
  //   });

  //   const handleAnimationEnd = (event) => {
  //     if (event.animationName === 'fall') {
  //       event.target.remove();
  //     }
  //   };

  //   document.addEventListener('animationend', handleAnimationEnd, true);

  //   return () => {
  //     sakura.stop(true);
  //     document.removeEventListener('animationend', handleAnimationEnd, true);
  //   };
  // }, [window.Sakura]);

  return (
    <>
      <Intro />
      <BrideGroomIntro />
      <Calendar />
      <PhotoGallery />
      <MapContainer />
    </>
  );
};

export default App;
