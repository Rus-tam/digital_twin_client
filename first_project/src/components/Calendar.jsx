import React, { useState, useEffect, useRef } from 'react';
import '../styles/calendar.css';

const Calendar = ({ value, onChange, placeholder = "Выберите дату" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const calendarRef = useRef(null);

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Закрытие календаря при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Получение дней месяца
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];

    // Дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - startingDay + i + 1),
        isCurrentMonth: false,
      });
    }

    // Дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
      });
    }

    // Дни следующего месяца
    const totalCells = 42; // 6 недель * 7 дней
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsOpen(false);
    if (onChange) {
      onChange(date);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    if (onChange) {
      onChange(today);
    }
  };

  const handleQuickSelect = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setCurrentDate(date);
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return placeholder;
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const days = getDaysInMonth();
  const today = new Date();
  const currentMonth = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className="calendar-container" ref={calendarRef}>
      <button
        className="calendar-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{formatDate(selectedDate)}</span>
        <span className="icon">📅</span>
      </button>

      {isOpen && (
        <div className="calendar-dropdown">
          <div className="date-quick-select">
            <button
              className="quick-date-btn"
              onClick={() => handleQuickSelect(-1)}
            >
              Вчера
            </button>
            <button
              className="quick-date-btn"
              onClick={handleToday}
            >
              Сегодня
            </button>
            <button
              className="quick-date-btn"
              onClick={() => handleQuickSelect(7)}
            >
              Неделя
            </button>
            <button
              className="quick-date-btn"
              onClick={() => handleQuickSelect(30)}
            >
              Месяц
            </button>
          </div>

          <div className="calendar-header">
            <button
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
              type="button"
            >
              ←
            </button>
            <div className="calendar-month">{currentMonth}</div>
            <button
              className="calendar-nav-btn"
              onClick={handleNextMonth}
              type="button"
            >
              →
            </button>
          </div>

          <div className="calendar-weekdays">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="calendar-days">
            {days.map((day, index) => {
              const isToday = day.date.toDateString() === today.toDateString();
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
              const isCurrentMonth = day.isCurrentMonth;

              return (
                <button
                  key={index}
                  className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                  onClick={() => isCurrentMonth && handleDateSelect(day.date)}
                  disabled={!isCurrentMonth}
                  type="button"
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="calendar-footer">
            <div className="selected-date-display">
              Выбрано:
              <span className="selected-date-value">
                {selectedDate ? formatDate(selectedDate) : '—'}
              </span>
            </div>
            <div className="calendar-actions">
              <button
                className="btn btn-outline"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={handleToday}
                type="button"
              >
                Сегодня
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;