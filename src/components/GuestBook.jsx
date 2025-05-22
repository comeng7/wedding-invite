import { useState, useEffect, useMemo, useCallback } from 'react';

import { collection, addDoc, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

import { db, serverTimestamp } from '@/firebaseConfig';

const MESSAGES_PER_PAGE = 5;
const messagesCollectionRef = collection(db, 'guestbook_messages');

const Guestbook = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });

  const [allMessages, setAllMessages] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const showFeedback = useCallback((text, type = 'error', duration = 3000) => {
    setFeedbackMessage({ text, type });
    if (duration > 0) {
      setTimeout(() => setFeedbackMessage({ text: '', type: '' }), duration);
    }
  }, []);

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
      showFeedback(`메시지를 불러오는 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    fetchAllMessages();
  }, [fetchAllMessages]);

  const totalPages = useMemo(() => {
    return Math.ceil(allMessages.length / MESSAGES_PER_PAGE);
  }, [allMessages]);

  const currentMessages = useMemo(() => {
    const startIndex = (currentPageNumber - 1) * MESSAGES_PER_PAGE;
    const endIndex = startIndex + MESSAGES_PER_PAGE;
    return allMessages.slice(startIndex, endIndex);
  }, [allMessages, currentPageNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    showFeedback('', '', 0);

    if (!name.trim() || !message.trim()) {
      showFeedback('이름과 축하 메시지를 모두 입력해주세요.');
      return;
    }
    if (message.length > 200) {
      showFeedback('메시지는 200자 이내로 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newDoc = {
        name: name.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      };
      await addDoc(messagesCollectionRef, newDoc);

      setName('');
      setMessage('');
      showFeedback('축하 메시지가 성공적으로 등록되었습니다! 🎉', 'success');

      fetchAllMessages();
      setCurrentPageNumber(1);
    } catch (err) {
      console.error('Error adding document: ', err);
      showFeedback(`메시지 등록 실패: ${err.message || '다시 시도해주세요.'}`);
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPageNumber(page);
    }
  };

  const getPaginationNumbers = () => {
    const MAX_VISIBLE_PAGES = 5;
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, currentPageNumber - Math.floor(MAX_VISIBLE_PAGES / 2));
    let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

    if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);
      } else {
        startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
      }
    }

    const pages = [];
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
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
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="따뜻한 축하 메시지를 남겨주세요. (최대 200자)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            maxLength="200"
            aria-label="메시지"
            disabled={isSubmitting || isDataLoading}
          ></textarea>
        </div>
        {feedbackMessage.text && (
          <p className={`form-feedback ${feedbackMessage.type}`}>{feedbackMessage.text}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isDataLoading || !name.trim() || !message.trim()}
          className="submit-button"
        >
          {isSubmitting ? '등록 중...' : '메시지 남기기'}
        </button>
      </form>

      <div className="guestbook-messages">
        <h3>💌 남겨주신 축하 메시지</h3>

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

        {!isDataLoading &&
          allMessages.length > 0 &&
          currentMessages.length === 0 &&
          currentPageNumber > 1 && <p className="no-messages">이 페이지에는 메시지가 없습니다.</p>}

        {!isDataLoading && currentMessages.length > 0 && (
          <ul>
            {currentMessages.map((msg) => (
              <li key={msg.id} className="message-item">
                <div className="message-header">
                  <strong className="message-name">{msg.name}</strong>
                  <span className="message-timestamp">{formatTimestamp(msg.createdAt)}</span>
                </div>
                <p className="message-text">{msg.message}</p>
              </li>
            ))}
          </ul>
        )}

        {!isDataLoading && totalPages > 1 && (
          <div className="pagination-controls new-pagination">
            <button
              onClick={() => handlePageChange(currentPageNumber - 1)}
              disabled={currentPageNumber === 1 || isDataLoading}
              className="prev-button"
            >
              &lt;
            </button>
            {getPaginationNumbers().map((page, index) =>
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => handlePageChange(page)}
                  disabled={currentPageNumber === page || isDataLoading}
                  className={`page-button ${currentPageNumber === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="ellipsis">
                  {page}
                </span>
              ),
            )}
            <button
              onClick={() => handlePageChange(currentPageNumber + 1)}
              disabled={currentPageNumber === totalPages || isDataLoading}
              className="next-button"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guestbook;
