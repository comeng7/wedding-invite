import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';

import { collection, addDoc, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

import { db, serverTimestamp } from '@/firebaseConfig';
import useToast from '@/hooks/useToast';

const MESSAGES_PER_PAGE = 3; // 변경: 페이지당 메시지 3개
const messagesCollectionRef = collection(db, 'guestbook_messages');

const Guestbook = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allMessages, setAllMessages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [slideDirection, setSlideDirection] = useState('');

  const listRef = useRef(null);

  const { openToast } = useToast();

  const fetchAllMessages = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
      const documentSnapshots = await getDocs(q);
      const fetchedMessages = documentSnapshots.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setAllMessages(fetchedMessages);
    } catch (err) {
      console.error('Error fetching all messages: ', err);
      openToast(`메시지를 불러오는 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMessages();
  }, [fetchAllMessages]);

  const totalPages = useMemo(() => {
    if (allMessages.length === 0) return 1; // 메시지 없어도 1페이지는 있도록
    return Math.ceil(allMessages.length / MESSAGES_PER_PAGE);
  }, [allMessages]);

  const currentMessages = useMemo(() => {
    if (allMessages.length === 0) return [];
    const startIndex = currentPageIndex * MESSAGES_PER_PAGE;
    return allMessages.slice(startIndex, startIndex + MESSAGES_PER_PAGE);
  }, [allMessages, currentPageIndex]);

  const handlePageChange = useCallback(
    (newIndex, direction) => {
      if (allMessages.length === 0 && newIndex !== 0) return;
      if (allMessages.length > 0 && (newIndex < 0 || newIndex >= totalPages)) return;

      setSlideDirection(direction);

      const animationDuration = 300;
      if (listRef.current) {
        listRef.current.classList.remove(
          'slide-in-left',
          'slide-in-right',
          'slide-out-left',
          'slide-out-right',
        );
        if (direction === 'next') {
          listRef.current.classList.add('slide-out-left');
        } else if (direction === 'prev') {
          listRef.current.classList.add('slide-out-right');
        }
      }

      setTimeout(
        () => {
          setCurrentPageIndex(newIndex);
          if (listRef.current) {
            listRef.current.classList.remove('slide-out-left', 'slide-out-right');
            if (direction === 'next') {
              listRef.current.classList.add('slide-in-right');
            } else if (direction === 'prev') {
              listRef.current.classList.add('slide-in-left');
            }
          }
          setTimeout(() => {
            if (listRef.current) {
              listRef.current.classList.remove('slide-in-left', 'slide-in-right');
            }
            setSlideDirection('');
          }, animationDuration);
        },
        listRef.current && direction !== '' ? animationDuration : 0,
      );
    },
    [allMessages.length, totalPages],
  );

  const goToNextPage = useCallback(() => {
    if (allMessages.length === 0) return;
    const newIndex = (currentPageIndex + 1) % totalPages;
    handlePageChange(newIndex, 'next');
  }, [currentPageIndex, totalPages, allMessages.length, handlePageChange]);

  const goToPrevPage = useCallback(() => {
    if (allMessages.length === 0) return;
    const newIndex = (currentPageIndex - 1 + totalPages) % totalPages;
    handlePageChange(newIndex, 'prev');
  }, [currentPageIndex, totalPages, allMessages.length, handlePageChange]);

  const goToPage = useCallback(
    (index) => {
      if (index === currentPageIndex || allMessages.length === 0) return;
      if (index < 0 || index >= totalPages) return;
      const direction = index > currentPageIndex ? 'next' : 'prev';
      handlePageChange(index, direction);
    },
    [currentPageIndex, totalPages, allMessages.length, handlePageChange],
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextPage(),
    onSwipedRight: () => goToPrevPage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      openToast('이름과 축하 메시지를 모두 입력해주세요.');
      return;
    }
    if (message.length > 100) {
      openToast('메시지는 100자 이내로 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newDocData = {
        name: name.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      };
      await addDoc(messagesCollectionRef, newDocData);

      setName('');
      setMessage('');
      openToast('메시지가 등록되었습니다.');

      await fetchAllMessages();
      setCurrentPageIndex(0);
      if (listRef.current) {
        listRef.current.classList.remove(
          'slide-in-left',
          'slide-in-right',
          'slide-out-left',
          'slide-out-right',
        );
      }
    } catch (err) {
      console.error('Error adding document: ', err);
      openToast(`메시지 등록 실패: ${err.message || '다시 시도해주세요.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
      const now = new Date();
      return (
        now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      );
    }
    const date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessagePlaceholders = () => {
    const placeholders = [];
    const remainingSlots = MESSAGES_PER_PAGE - currentMessages.length;
    if (remainingSlots > 0 && currentMessages.length > 0) {
      // 현재 메시지가 있을 때만 빈 공간 채움
      for (let i = 0; i < remainingSlots; i++) {
        placeholders.push(
          <li key={`placeholder-${i}`} className="message-item placeholder-item"></li>,
        );
      }
    }
    return placeholders;
  };

  return (
    <div className="container-wrapper guestbook-container">
      <h2 className="main-title">GUEST BOOK</h2>

      <form onSubmit={handleSubmit} className="guestbook-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="이름"
            disabled={isSubmitting || isDataLoading}
            maxLength="10"
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="따뜻한 축하 메시지를 남겨주세요. (최대 100자)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            maxLength="100"
            aria-label="메시지"
            disabled={isSubmitting || isDataLoading}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isDataLoading || !name.trim() || !message.trim()}
          className="submit-button"
        >
          {isSubmitting ? '등록 중...' : '메시지 남기기'}
        </button>
      </form>

      <div className="guestbook-messages">
        <h3>➰ 남겨주신 축하 메시지 ➰</h3>

        {isDataLoading && (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>메시지를 불러오는 중...</p>
          </div>
        )}

        {!isDataLoading && allMessages.length === 0 && (
          <p className="no-messages">
            아직 등록된 메시지가 없습니다. 첫 번째 축하 메시지를 남겨주세요!
          </p>
        )}

        <div className="messages-carousel-window" {...swipeHandlers}>
          {!isDataLoading && allMessages.length > 0 && (
            <ul ref={listRef} className="messages-list">
              {currentMessages.map((msg) => (
                <li key={msg.id} className="message-item">
                  <div className="message-header">
                    <strong className="message-name">{msg.name}</strong>
                    <span className="message-timestamp">{formatTimestamp(msg.createdAt)}</span>
                  </div>
                  <p className="message-text">{msg.message}</p>
                </li>
              ))}
              {renderMessagePlaceholders()}
            </ul>
          )}
        </div>

        {!isDataLoading && totalPages > 1 && (
          <div className="carousel-controls">
            <div className="dots-indicator">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`dot ${currentPageIndex === i ? 'active' : ''}`}
                  onClick={() => goToPage(i)}
                  aria-label={`${i + 1}번째 페이지로 이동`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guestbook;
