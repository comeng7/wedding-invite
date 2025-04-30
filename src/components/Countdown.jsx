import gsap from 'gsap';
import { useState, useEffect, useRef } from 'react';

const Countdown = ({ weddingDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(weddingDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Ref 객체 생성
  const daysRef = useRef(null);
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      // 이전 값과 현재 값이 다를 때만 애니메이션 적용
      if (timeLeft.seconds !== newTimeLeft.seconds) {
        animateValue(secondsRef, timeLeft.seconds, newTimeLeft.seconds);
      }
      if (timeLeft.minutes !== newTimeLeft.minutes) {
        animateValue(minutesRef, timeLeft.minutes, newTimeLeft.minutes);
      }
      if (timeLeft.hours !== newTimeLeft.hours) {
        animateValue(hoursRef, timeLeft.hours, newTimeLeft.hours);
      }
      if (timeLeft.days !== newTimeLeft.days) {
        animateValue(daysRef, timeLeft.days, newTimeLeft.days);
      }

      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
      }
    }, 1000);

    // 컴포넌트 언마운트 시 타이머 제거
    return () => clearInterval(timer);
  }, [weddingDate, timeLeft]); // timeLeft를 의존성 배열에 추가

  // 숫자 변경 애니메이션 함수
  const animateValue = (ref) => {
    if (!ref.current) return;

    // GSAP 애니메이션: 숫자가 아래에서 위로 올라오는 효과
    gsap.fromTo(
      ref.current,
      { y: 20, opacity: 0 }, // 시작 상태
      {
        y: 0, // 최종 상태
        opacity: 1,
        duration: 0.5, // 애니메이션 지속 시간
        ease: 'power2.out', // 애니메이션 이징 함수
      },
    );
  };

  const timeUnits = [
    { label: 'Days', value: timeLeft.days, ref: daysRef },
    { label: 'Hours', value: timeLeft.hours, ref: hoursRef },
    { label: 'Min', value: timeLeft.minutes, ref: minutesRef },
    { label: 'Sec', value: timeLeft.seconds, ref: secondsRef },
  ];

  return (
    <div className="countdown-container">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="time-unit">
          <span className="label">{unit.label}</span>
          <div className="value-container">
            <span ref={unit.ref} className="value">
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
