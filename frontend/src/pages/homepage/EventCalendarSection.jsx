import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  CalendarPlus, 
  ExternalLink, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Clock, 
  Sparkles,
  CalendarDays,
  Info
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to parse event date strings from MySQL
export function parseEventDate(dateStr) {
  if (!dateStr) return null;

  const monthMap = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
  };

  const regex = /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})/i;
  const match = dateStr.match(regex);
  if (match) {
    const monthKey = match[1].toLowerCase();
    const month = monthMap[monthKey];
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    return { year, month, day };
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth(),
      day: parsed.getDate()
    };
  }

  return null;
}

export default function EventCalendarSection({ events = [], isLoadingEvents, setActivePage }) {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  // Find initial month & year from events or today
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(8); // Default to September 2026 (first events in DB)
  const [selectedDate, setSelectedDate] = useState({ year: 2026, month: 8, day: 16 });

  // Map parsed events
  const parsedEvents = useMemo(() => {
    return events.map((event) => {
      const parsed = parseEventDate(event.date);
      return {
        ...event,
        parsedDate: parsed
      };
    });
  }, [events]);

  // Set initial selected date to the first event once events load
  useEffect(() => {
    if (parsedEvents.length > 0) {
      const firstValid = parsedEvents.find(e => e.parsedDate);
      if (firstValid && firstValid.parsedDate) {
        setViewYear(firstValid.parsedDate.year);
        setViewMonth(firstValid.parsedDate.month);
        setSelectedDate(firstValid.parsedDate);
      }
    }
  }, [events.length]);

  // Group events by "YYYY-M-D"
  const eventsByDateKey = useMemo(() => {
    const map = {};
    parsedEvents.forEach((ev) => {
      if (ev.parsedDate) {
        const key = `${ev.parsedDate.year}-${ev.parsedDate.month}-${ev.parsedDate.day}`;
        if (!map[key]) {
          map[key] = [];
        }
        map[key].push(ev);
      }
    });
    return map;
  }, [parsedEvents]);

  // Events in the currently viewed month
  const eventsInCurrentMonth = useMemo(() => {
    return parsedEvents.filter(
      (e) => e.parsedDate && e.parsedDate.year === viewYear && e.parsedDate.month === viewMonth
    );
  }, [parsedEvents, viewYear, viewMonth]);

  // Events on the currently selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
    return eventsByDateKey[key] || [];
  }, [selectedDate, eventsByDateKey]);

  // Calendar navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handlePrevYear = () => {
    setViewYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear((prev) => prev + 1);
  };

  const handleMonthChange = (e) => {
    setViewMonth(parseInt(e.target.value, 10));
  };

  const handleYearChange = (e) => {
    setViewYear(parseInt(e.target.value, 10));
  };

  const handleJumpToToday = () => {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
    setSelectedDate({ year: todayYear, month: todayMonth, day: todayDay });
  };

  const handleJumpToUpcoming = () => {
    if (parsedEvents.length > 0 && parsedEvents[0].parsedDate) {
      const target = parsedEvents[0].parsedDate;
      setViewYear(target.year);
      setViewMonth(target.month);
      setSelectedDate(target);
    }
  };

  // Google Calendar Link generator
  const getGoogleCalendarUrl = (event) => {
    if (event.calendar_link && event.calendar_link.startsWith('http')) {
      return event.calendar_link;
    }
    const text = encodeURIComponent(`UXCO: ${event.title}`);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  // Generate calendar days grid
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYearVal = viewMonth === 0 ? viewYear - 1 : viewYear;
      const key = `${prevYearVal}-${prevMonthIdx}-${dayNum}`;
      const dayEvents = eventsByDateKey[key] || [];

      cells.push({
        day: dayNum,
        month: prevMonthIdx,
        year: prevYearVal,
        isCurrentMonth: false,
        isPrevMonth: true,
        events: dayEvents,
        key: `prev-${dayNum}`
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const key = `${viewYear}-${viewMonth}-${dayNum}`;
      const dayEvents = eventsByDateKey[key] || [];
      const isCurrentDay = viewYear === todayYear && viewMonth === todayMonth && dayNum === todayDay;

      cells.push({
        day: dayNum,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        isToday: isCurrentDay,
        events: dayEvents,
        key: `curr-${dayNum}`
      });
    }

    // Next month padding days to complete standard grid
    const totalRendered = cells.length;
    const remaining = totalRendered % 7 === 0 ? 0 : 7 - (totalRendered % 7);
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYearVal = viewMonth === 11 ? viewYear + 1 : viewYear;
      const key = `${nextYearVal}-${nextMonthIdx}-${dayNum}`;
      const dayEvents = eventsByDateKey[key] || [];

      cells.push({
        day: dayNum,
        month: nextMonthIdx,
        year: nextYearVal,
        isCurrentMonth: false,
        isNextMonth: true,
        events: dayEvents,
        key: `next-${dayNum}`
      });
    }

    return cells;
  }, [viewYear, viewMonth, eventsByDateKey, todayYear, todayMonth, todayDay]);

  // Format selected date string
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDate) return '';
    const dateObj = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDate]);

  return (
    <section className="home-events-section" id="events-calendar">
      {/* Section Top Header */}
      <div className="section-header">
        <div>
          <span className="section-tag">Interactive Schedule</span>
          <h3 className="section-title">Club Calendar & Event Highlights</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary"
            onClick={handleJumpToUpcoming}
            title="Browse months with active club events"
          >
            <Sparkles size={14} color="#E81D88" />
            Jump to Active Events
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setActivePage('events')}
          >
            View All Events List <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {isLoadingEvents ? (
        <div className="cal-loading-box">
          <p style={{ color: 'var(--text-muted)' }}>Querying events from MySQL database...</p>
        </div>
      ) : (
        <div className="cal-layout-container">
          {/* Left Column: Full Month Calendar */}
          <div className="cal-main-card">
            {/* Calendar Controls & Month/Year Browse Bar */}
            <div className="cal-nav-bar">
              <div className="cal-browse-left">
                <button 
                  className="cal-nav-btn" 
                  onClick={handlePrevYear} 
                  title="Previous Year"
                  aria-label="Previous Year"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button 
                  className="cal-nav-btn" 
                  onClick={handlePrevMonth} 
                  title="Previous Month"
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="cal-picker-group">
                  <select 
                    value={viewMonth} 
                    onChange={handleMonthChange}
                    className="cal-select cal-month-select"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select 
                    value={viewYear} 
                    onChange={handleYearChange}
                    className="cal-select cal-year-select"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  className="cal-nav-btn" 
                  onClick={handleNextMonth} 
                  title="Next Month"
                  aria-label="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
                <button 
                  className="cal-nav-btn" 
                  onClick={handleNextYear} 
                  title="Next Year"
                  aria-label="Next Year"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>

              <div className="cal-browse-right">
                <button className="cal-today-btn" onClick={handleJumpToToday}>
                  Today
                </button>
                <span className="cal-month-events-badge">
                  {eventsInCurrentMonth.length} Event{eventsInCurrentMonth.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Calendar Month & Year Big Header */}
            <div className="cal-month-display">
              <h4 className="cal-month-title">
                {MONTH_NAMES[viewMonth]} <span className="gradient-text">{viewYear}</span>
              </h4>
              <p className="cal-month-subtitle">
                Click any highlighted date below to view session details, locations, and Google Calendar sync.
              </p>
            </div>

            {/* 7-Day Calendar Grid Header */}
            <div className="cal-weekdays-row">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="cal-weekday-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* Full Month Calendar Grid Cells */}
            <div className="cal-days-grid">
              {calendarGrid.map((cell) => {
                const isSelected = 
                  selectedDate && 
                  selectedDate.year === cell.year && 
                  selectedDate.month === cell.month && 
                  selectedDate.day === cell.day;
                const hasEvents = cell.events.length > 0;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    className={`cal-day-cell ${
                      !cell.isCurrentMonth ? 'cal-day-padding' : ''
                    } ${cell.isToday ? 'cal-day-today' : ''} ${
                      isSelected ? 'cal-day-selected' : ''
                    } ${hasEvents ? 'cal-day-has-events' : ''}`}
                    onClick={() => {
                      setSelectedDate({
                        year: cell.year,
                        month: cell.month,
                        day: cell.day
                      });
                      if (cell.month !== viewMonth || cell.year !== viewYear) {
                        setViewMonth(cell.month);
                        setViewYear(cell.year);
                      }
                    }}
                  >
                    <div className="cal-day-number-row">
                      <span className="cal-day-number">{cell.day}</span>
                      {cell.isToday && <span className="cal-today-pill">Today</span>}
                    </div>

                    {/* Event indicators on the day cell */}
                    {hasEvents && (
                      <div className="cal-day-event-indicators">
                        {cell.events.map((ev, i) => (
                          <div 
                            key={ev.id || i} 
                            className="cal-event-dot-item"
                            title={`${ev.title} (${ev.category})`}
                          >
                            <span className="cal-event-dot" />
                            <span className="cal-event-mini-title">{ev.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Footer Legend */}
            <div className="cal-legend-bar">
              <div className="cal-legend-item">
                <span className="legend-dot legend-event" />
                <span>Club Event / Workshop</span>
              </div>
              <div className="cal-legend-item">
                <span className="legend-dot legend-today" />
                <span>Today</span>
              </div>
              <div className="cal-legend-item">
                <span className="legend-dot legend-selected" />
                <span>Selected Date</span>
              </div>
            </div>
          </div>

          {/* Right Column: Day Detail Inspector & Upcoming Month Agenda */}
          <div className="cal-inspector-sidebar">
            <div className="inspector-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} color="#E81D88" />
                <h4 className="inspector-title">
                  {selectedDateFormatted || 'Select a Date'}
                </h4>
              </div>
              {selectedDateEvents.length > 0 && (
                <span className="event-tag" style={{ margin: 0 }}>
                  {selectedDateEvents.length} Event{selectedDateEvents.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Selected Day Event Cards */}
            {selectedDateEvents.length > 0 ? (
              <div className="inspector-events-list">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="inspector-event-card">
                    <div className="inspector-card-top">
                      <span className="event-tag">{event.category}</span>
                      <span className="event-db-pill">DB #{event.id}</span>
                    </div>

                    <h5 className="inspector-event-title">{event.title}</h5>
                    <p className="inspector-event-desc">{event.description}</p>

                    <div className="event-details">
                      <div className="detail-row">
                        <Clock size={15} color="#FA9B7A" />
                        <span>{event.date}</span>
                      </div>
                      <div className="detail-row">
                        <MapPin size={15} color="#E81D88" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <a 
                      href={getGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cal"
                      style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}
                    >
                      <CalendarPlus size={15} />
                      Add to Google Calendar
                      <ExternalLink size={12} style={{ opacity: 0.6 }} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inspector-empty-state">
                <div className="empty-icon-circle">
                  <CalendarIcon size={24} color="#999" />
                </div>
                <h5 className="empty-title">No Events on this Date</h5>
                <p className="empty-desc">
                  There are no club sessions scheduled for {selectedDateFormatted}. 
                  Browse other highlighted dates in this month below:
                </p>

                {/* Quick list of other events in current month */}
                {eventsInCurrentMonth.length > 0 && (
                  <div className="month-quick-events">
                    <span className="quick-events-title">
                      Scheduled in {MONTH_NAMES[viewMonth]} {viewYear}:
                    </span>
                    <div className="quick-events-list">
                      {eventsInCurrentMonth.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          className="quick-event-item"
                          onClick={() => {
                            if (ev.parsedDate) {
                              setSelectedDate(ev.parsedDate);
                            }
                          }}
                        >
                          <span className="quick-event-date">
                            {ev.parsedDate ? `${MONTH_NAMES[ev.parsedDate.month].slice(0, 3)} ${ev.parsedDate.day}` : 'Event'}
                          </span>
                          <span className="quick-event-name">{ev.title}</span>
                          <ArrowRight size={13} color="#E81D88" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

