import { useState, useRef } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import useModal from '@/hooks/useModal';
import useScrollFadeIn from '@/hooks/useScrollFadeIn';
import useToast from '@/hooks/useToast';

// 클립보드 아이콘
const ClipboardIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 4.44772 8.44772 4 9 4H15C15.5523 4 16 4.44772 16 5V7C16 7.55228 15.5523 8 15 8H9C8.44772 8 8 7.55228 8 7V5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16 11H12M16 14H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 카카오페이 아이콘
const KakaoPayIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.02944 4 3 7.13401 3 11C3 13.8336 4.77103 16.292 7.38197 17.6484L7 20L10.0798 18.1459C10.695 18.2189 11.3346 18.2632 12 18.2632C16.9706 18.2632 21 15.1292 21 11C21 7.13401 16.9706 4 12 4Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.49999 9.5C8.49999 9.22386 8.72385 9 8.99999 9H15C15.2761 9 15.5 9.22386 15.5 9.5V10C15.5 10.2761 15.2761 10.5 15 10.5H8.99999C8.72385 10.5 8.49999 10.2761 8.49999 10V9.5Z"
      fill="#3C1E1E"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.5 12C8.5 11.7239 8.72386 11.5 9 11.5H15C15.2761 11.5 15.5 11.7239 15.5 12V12.5C15.5 12.7761 15.2761 13 15 13H9C8.72386 13 8.5 12.7761 8.5 12.5V12Z"
      fill="#3C1E1E"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.5 14.5C8.5 14.2239 8.72386 14 9 14H12C12.2761 14 12.5 14.2239 12.5 14.5V15C12.5 15.2761 12.2761 15.5 12 15.5H9C8.72386 15.5 8.5 15.2761 8.5 15V14.5Z"
      fill="#3C1E1E"
    />
  </svg>
);

// 사람 모양 아이콘
const PersonIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const accountData = [
  {
    side: '신랑측',
    accounts: [
      { name: '신랑 정장오', bank: '신한은행', number: '123-456-789012', bankCode: '000' },
      { name: '아버지 정장오', bank: '신한은행', number: '098-765-432109', bankCode: '000' },
      { name: '어머니 정장오', bank: '신한은행', number: '111-222-333444', bankCode: '000' },
    ],
  },
  {
    side: '신부측',
    accounts: [
      { name: '신부 엄유경', bank: '신한은행', number: '555-666-777888', bankCode: '000' },
      { name: '아버지 엄유경', bank: '신한은행', number: '999-000-111222', bankCode: '000' },
      { name: '어머니 엄유경', bank: '신한은행', number: '333-444-555666', bankCode: '000' },
    ],
  },
];

const AccountInfo = () => {
  const [openSections, setOpenSections] = useState({});
  const listRefs = useRef({});

  const sectionRef = useScrollFadeIn();
  const { contextSafe } = useGSAP({ scope: sectionRef });
  const { openToast } = useToast();
  const { openModal } = useModal();

  // 아코디언 토글 함수 (GSAP 애니메이션 포함)
  const toggleSection = contextSafe((side) => {
    const isOpen = openSections[side];
    const listElement = listRefs.current[side];

    if (!listElement) return;

    if (isOpen) {
      gsap.to(listElement, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power1.inOut',
        overwrite: 'auto',
      });
    } else {
      gsap.set(listElement, { height: 'auto', opacity: 1 });
      gsap.from(listElement, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }

    setOpenSections((prev) => ({ ...prev, [side]: !isOpen }));
  });

  // 계좌번호 복사 함수
  const handleCopyAccount = async (accountNumber) => {
    if (!accountNumber) return;
    try {
      await navigator.clipboard.writeText(accountNumber);
      // openToast('계좌번호가 복사되었습니다.', 309900, 'success');
      openModal('계좌번호 복사');
    } catch (err) {
      console.error('계좌번호 복사 실패:', err);
      // openToast({ key: 'key', content: '계좌번호가 복사되었습니다.' });
    }
  };

  // 카카오페이 송금 링크 생성 함수
  const getKakaoPayLink = (bankCode, accountNumber) => {
    if (!bankCode || !accountNumber || bankCode === '000') {
      return '#';
    }
    const cleanedAccountNumber = accountNumber.replace(/-/g, '');
    return `kakaotalk://kakaopay/money/to/banklink?a=${cleanedAccountNumber}&b=${bankCode}`;
  };

  return (
    <>
      <section className="container-wrapper account-info elegant" ref={sectionRef}>
        <h2 className="main-title">마음 전하는 곳</h2>
        <div className="account-accordions">
          {accountData.map((section) => {
            const sideClass = section.side === '신랑측' ? 'groom-side' : 'bride-side';
            return (
              <div
                key={section.side}
                className={`accordion-item ${sideClass} ${openSections[section.side] ? 'open' : ''}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection(section.side)}
                  aria-expanded={!!openSections[section.side]}
                >
                  <span className="header-icon">
                    <PersonIcon />
                  </span>
                  <span className="header-title">{section.side} 계좌 정보</span>
                  <span className="accordion-icon"></span>
                </button>
                <div
                  className="accordion-content"
                  ref={(el) => (listRefs.current[section.side] = el)}
                  style={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <ul className="account-list">
                    {section.accounts.map((account) => (
                      <li key={account.name} className="account-item-card">
                        <div className="card-content">
                          <div className="account-holder-line">
                            <span className="holder-relation">{account.name.split(' ')[0]}</span>
                            <span className="holder-name">
                              {account.name.split(' ').slice(1).join(' ')}
                            </span>
                          </div>
                          <div className="account-info-line">
                            <span className="bank-name">{account.bank}</span>
                            <span className="account-number">{account.number}</span>
                          </div>
                        </div>
                        <div className="card-actions">
                          <a
                            href={getKakaoPayLink(account.bankCode, account.number)}
                            className={`action-button kakao-button ${!account.bankCode || account.bankCode === '000' ? 'disabled' : ''}`}
                            aria-label={`${account.name} 카카오페이 송금`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!account.bankCode || account.bankCode === '000') {
                                e.preventDefault();

                                openToast(
                                  '카카오페이 송금을 지원하지 않는 계좌입니다.',
                                  3000,
                                  'success',
                                );
                              }
                            }}
                          >
                            <KakaoPayIcon />
                            <span className="button-text">카카오페이 송금</span>
                          </a>
                          <button
                            className="action-button copy-button"
                            onClick={() => handleCopyAccount(account.number)}
                            aria-label={`${account.name} 계좌번호 복사`}
                          >
                            <ClipboardIcon />
                            <span className="button-text">계좌번호 복사</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        <p className="kakao-notice">
          * 카카오페이 송금은 앱 설치 및<br />
          본인 인증이 완료된 상태에서 가능합니다.
        </p>
      </section>
    </>
  );
};

export default AccountInfo;
