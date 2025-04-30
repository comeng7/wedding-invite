import Countdown from '@/components/Countdown';
import useScrollFadeIn from '@/hooks/useScrollFadeIn';

const Calendar = ({ weddingDate = '2025-09-06T16:00:00+0900' }) => {
  const sectionRef = useScrollFadeIn();

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentMonth = new Date(weddingDate).getMonth();
  const currentYear = new Date(weddingDate).getFullYear();
  const weddingDay = new Date(weddingDate).getDate();
  const weddingDayTimestamp = +new Date(weddingDate); // 변수명 명확화 및 '+' 사용
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= lastDateOfMonth; i++) {
    calendarDays.push(i);
  }

  const difference = weddingDayTimestamp - +new Date();

  return (
    <div className="container-wrapper calendar" ref={sectionRef}>
      <h2 className="main-title">THE WEDDING DAY</h2>
      <p className="calendar-date">
        2025년 09월 06일
        <br />
        오후 4시
      </p>
      {difference > 0 ? (
        <Countdown weddingDate={weddingDayTimestamp} />
      ) : (
        <div
          style={{
            height: '2rem',
          }}
        ></div>
      )}
      <div className="calendar-grid">
        {daysOfWeek.map((day, index) => (
          <div key={`${day}-${index}`} className="calendar-day-header">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => {
          return day === weddingDay ? (
            <div key={index} className={`calendar-day wedding-day`}>
              {day}
              <div className="heart-overlay">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16 28C15.6 28 15.2 27.9 14.9 27.6C10.1 23.3 6.4 19.8 4.1 16.6C1.6 13.1 2 9.3 4.3 6.8C6.1 4.8 8.5 4 10.9 4C12.8 4 14.6 4.8 16 6.2C17.4 4.8 19.2 4 21.1 4C23.5 4 25.9 4.8 27.7 6.8C30 9.3 30.4 13.1 27.9 16.6C25.6 19.8 21.9 23.3 17.1 27.6C16.8 27.9 16.4 28 16 28Z"
                    stroke="#FFB6C1"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div key={index} className="calendar-day">
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
