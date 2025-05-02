import { useState, useEffect, useRef, useCallback } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Countdown = ({ weddingDate }) => {
  // 남은 시간을 계산하는 함수
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(weddingDate) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [weddingDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const containerRef = useRef(null);
  const timeUnitRefs = useRef({});

  const { contextSafe } = useGSAP({ scope: containerRef });

  const animateValue = contextSafe((ref) => {
    if (!ref) return;
    gsap.fromTo(
      ref,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
    );
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();

      // 변경된 값에 대해서만 애니메이션 적용
      if (timeLeft.seconds !== newTimeLeft.seconds) {
        animateValue(timeUnitRefs.current.seconds);
      }
      if (timeLeft.minutes !== newTimeLeft.minutes) {
        animateValue(timeUnitRefs.current.minutes);
      }
      if (timeLeft.hours !== newTimeLeft.hours) {
        animateValue(timeUnitRefs.current.hours);
      }
      if (timeLeft.days !== newTimeLeft.days) {
        animateValue(timeUnitRefs.current.days);
      }

      setTimeLeft(newTimeLeft);

      // 시간이 다 되면 타이머 중지
      if (difference <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, calculateTimeLeft, animateValue]);

  const timeUnits = [
    { label: 'Days', key: 'days', value: timeLeft.days },
    { label: 'Hours', key: 'hours', value: timeLeft.hours },
    { label: 'Min', key: 'minutes', value: timeLeft.minutes },
    { label: 'Sec', key: 'seconds', value: timeLeft.seconds },
  ];

  // 남은 시간 계산
  const difference = +new Date(weddingDate) - +new Date();
  if (difference <= 0) {
    return null; // 시간이 지났으면 카운트다운 숨김
  }

  return (
    <div ref={containerRef} className="countdown-container">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="time-unit">
          <span className="label">{unit.label}</span>
          <div className="value-container">
            <span
              ref={(el) => (timeUnitRefs.current[unit.key] = el)} // ref를 객체에 저장
              className="value"
            >
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          {index < timeUnits.length - 1 && <span className="separator">:</span>}
        </div>
      ))}
    </div>
  );
};

export default Countdown;
