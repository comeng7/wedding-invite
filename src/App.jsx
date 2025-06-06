import { useEffect } from 'react';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import ZoomBlurEffect from '@/components/\bZoomBlurEffect';
import AccountInfo from '@/components/AccountInfo';
import BrideGroomIntro from '@/components/BrideGroomIntro';
import Calendar from '@/components/Calendar';
import Guestbook from '@/components/GuestBook';
import Intro from '@/components/Intro';
import MapContainer from '@/components/MapContainer';
import PhotoGallery from '@/components/PhotoGallery';
import '@/styles/main.scss';

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  useEffect(() => {
    if (!window || !window.Sakura) return;

    const sakura = new window.Sakura('body', {
      fallSpeed: 2,
      delay: 1000,
    });

    const handleAnimationEnd = (event) => {
      if (event.animationName === 'fall') {
        event.target.remove();
      }
    };

    document.addEventListener('animationend', handleAnimationEnd, true);

    return () => {
      sakura.stop(true);
      document.removeEventListener('animationend', handleAnimationEnd, true);
    };
  }, [window.Sakura]);

  return (
    <>
      <ZoomBlurEffect />
      <Intro />
      <BrideGroomIntro />
      <Calendar />
      <PhotoGallery />
      <MapContainer />
      <Guestbook />
      <AccountInfo />
    </>
  );
};

export default App;
