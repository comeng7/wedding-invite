import { useRef, useState, useEffect } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Intro = () => {
  const introRef = useRef(null); // 컴포넌트 루트 요소 ref
  const textRef = useRef(null);
  const clickRef = useRef(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const imageUrl = `${import.meta.env.BASE_URL}images/dd.jpeg`;

  // useEffect를 사용하여 이미지 프리로딩 및 초기 컴포넌트 숨김 처리
  useEffect(() => {
    if (introRef.current) {
      gsap.set(introRef.current, { opacity: 0, visibility: 'hidden' });
    }

    const img = new Image();
    img.src = imageUrl; // 이미지 소스 설정
    img.onload = () => {
      // 이미지 로드가 성공하면 상태를 true로 변경
      setIsImageLoaded(true);
    };
    img.onerror = () => {
      // 이미지 로드에 실패하더라도 애니메이션은 진행되도록 설정합니다.
      // 필요에 따라 오류 처리를 다르게 할 수 있습니다.
      console.error('배경 이미지 로드에 실패했습니다.');
      setIsImageLoaded(true); // 실패 시에도 일단 화면은 보여주도록 처리
    };
  }, [imageUrl]); // imageUrl이 변경될 경우에만 이 useEffect를 다시 실행합니다.

  useGSAP(
    () => {
      // isImageLoaded가 false이거나, 필요한 ref들이 아직 설정되지 않았다면 애니메이션을 실행하지 않습니다.
      if (!isImageLoaded || !introRef.current || !textRef.current || !clickRef.current) {
        return;
      }

      // GSAP 타임라인을 생성하여 애니메이션을 순차적으로 관리합니다.
      const tl = gsap.timeline();

      // 1. 이미지가 로드되면 전체 컴포넌트(introRef)를 부드럽게 나타나게 합니다.
      tl.to(introRef.current, { opacity: 1, visibility: 'visible', duration: 0.5 });

      // 2. 스크롤 방지 클래스를 body에 추가합니다.
      //    call()을 사용하여 타임라인 내에서 일반 함수를 실행할 수 있습니다.
      //    ">"는 이전 애니메이션(여기서는 introRef가 나타나는 애니메이션)이 끝난 직후를 의미합니다.
      tl.call(
        () => {
          document.body.classList.add('prevent-scroll');
        },
        [],
        '>',
      );

      // 3. 클릭 유도 문구/화살표(clickRef)의 초기 상태를 투명하게 설정합니다.
      //    타임라인의 0초 시점(또는 매우 이른 시점)에 설정합니다.
      tl.set(clickRef.current, { opacity: 0 }, 0);

      const letters = textRef.current.querySelectorAll('.letter');

      if (!letters || letters.length === 0) {
        // 텍스트(`.letter`) 요소가 없을 경우의 애니메이션 처리
        tl.call(() => {
          document.body.classList.remove('prevent-scroll');
        })
          .to(clickRef.current, { opacity: 1, duration: 0.5 }, '+=0.1') // 약간의 딜레이 후 나타남
          .to(clickRef.current, {
            y: -10, // 위로 10px 이동
            repeat: -1, // 무한 반복
            yoyo: true, // 갔다가 돌아오는 애니메이션
            ease: 'power1.inOut', // 부드러운 움직임
            duration: 0.8,
          });
      } else {
        // 텍스트(`.letter`) 요소가 있을 경우의 애니메이션 처리
        // 4. 텍스트 등장 애니메이션
        //    이전 애니메이션(introRef 나타나기) 완료 후 0.3초 뒤에 시작합니다.
        tl.fromTo(
          letters,
          { opacity: 0, scale: 0.8, y: 30 }, // 시작 상태
          {
            opacity: 1,
            scale: 1,
            y: 0,
            stagger: 0.07, // 각 글자별 순차적 애니메이션 간격
            duration: 0.6,
            ease: 'back.out(1.7)', // 통통 튀는 듯한 효과
          },
          '+=0.3', // 타임라인에서 이전 작업 완료 후 0.3초 뒤 시작
        );

        // 5. 텍스트 애니메이션이 완료된 후 스크롤 방지 클래스를 제거합니다.
        tl.call(
          () => {
            document.body.classList.remove('prevent-scroll');
          },
          [],
          '>',
        ); // letters 애니메이션(이전 작업)이 끝난 직후 실행

        // 6. 클릭 유도 문구/화살표(clickRef)를 나타나게 하고 애니메이션을 적용합니다.
        //    텍스트 애니메이션이 끝나는 시점과 비슷하게(-=0.3) 시작하여 자연스럽게 이어지도록 합니다.
        tl.to(clickRef.current, { opacity: 1, duration: 0.5 }, '-=0.3').to(clickRef.current, {
          y: -10,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          duration: 0.8,
        });
      }
    },
    { scope: introRef, dependencies: [isImageLoaded] },
  );

  const splitText = (text) =>
    text.split('').map((char, i) => (
      <span className="letter" key={i}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));

  return (
    <div
      ref={introRef}
      className="intro"
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
    >
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
