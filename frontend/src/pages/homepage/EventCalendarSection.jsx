import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  CalendarPlus, 
  ExternalLink, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
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
function parseEventDate(dateStr) {
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

// Helper to format clean event time (stripping redundant date & utf8 artifacts)
function formatEventTime(dateStr) {
  if (!dateStr) return '';
  const cleanStr = dateStr.replace(/â€¢/g, '•');
  if (cleanStr.includes('•')) {
    return cleanStr.split('•')[1]?.trim() || cleanStr;
  }
  return cleanStr;
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

  // All parsed events sorted chronologically
  const sortedEvents = useMemo(() => {
    return [...parsedEvents]
      .filter((e) => e.parsedDate)
      .sort((a, b) => {
        const dateA = new Date(a.parsedDate.year, a.parsedDate.month, a.parsedDate.day).getTime();
        const dateB = new Date(b.parsedDate.year, b.parsedDate.month, b.parsedDate.day).getTime();
        return dateA - dateB;
      });
  }, [parsedEvents]);

  // Selected date timestamp for chronological comparison
  const selectedDateTimestamp = useMemo(() => {
    if (!selectedDate) return 0;
    return new Date(selectedDate.year, selectedDate.month, selectedDate.day).getTime();
  }, [selectedDate]);

  // Events strictly BEFORE the currently selected date
  const priorActiveEvents = useMemo(() => {
    if (!selectedDateTimestamp) return [];
    return sortedEvents.filter((e) => {
      const t = new Date(e.parsedDate.year, e.parsedDate.month, e.parsedDate.day).getTime();
      return t < selectedDateTimestamp;
    });
  }, [sortedEvents, selectedDateTimestamp]);

  // Events strictly AFTER the currently selected date
  const nextActiveEvents = useMemo(() => {
    if (!selectedDateTimestamp) return sortedEvents;
    return sortedEvents.filter((e) => {
      const t = new Date(e.parsedDate.year, e.parsedDate.month, e.parsedDate.day).getTime();
      return t > selectedDateTimestamp;
    });
  }, [sortedEvents, selectedDateTimestamp]);

  const handleSelectEvent = (ev) => {
    if (ev && ev.parsedDate) {
      setSelectedDate(ev.parsedDate);
      if (ev.parsedDate.month !== viewMonth || ev.parsedDate.year !== viewYear) {
        setViewMonth(ev.parsedDate.month);
        setViewYear(ev.parsedDate.year);
      }
    }
  };

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
            {/* Unified Clean Calendar Month & Controls Header */}
            <div className="cal-header-bar">
              <div className="cal-header-left">
                <h4 className="cal-month-title">
                  {MONTH_NAMES[viewMonth]} <span className="gradient-text">{viewYear}</span>
                </h4>
                <div className="cal-nav-arrows">
                  <button 
                    className="cal-nav-btn" 
                    onClick={handlePrevMonth} 
                    title="Previous Month"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    className="cal-nav-btn" 
                    onClick={handleNextMonth} 
                    title="Next Month"
                    aria-label="Next Month"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="cal-header-right">
                <button className="cal-today-btn" onClick={handleJumpToToday}>
                  Today
                </button>
                <span className="cal-month-events-badge">
                  {eventsInCurrentMonth.length} Event{eventsInCurrentMonth.length === 1 ? '' : 's'}
                </span>
              </div>
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

          {/* Right Column: Separate Cards for Prior, Main, and Next Events */}
          <div className="cal-inspector-sidebar">
            {/* Box 1: Prior Active Events (Event Date & Title) */}
            {priorActiveEvents.length > 0 && (
              <div className="inspector-prior-card">
                {priorActiveEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className="prior-chip-btn"
                    onClick={() => handleSelectEvent(ev)}
                    title={`Jump to ${ev.title}`}
                  >
                    <span className="prior-chip-date">
                      {MONTH_NAMES[ev.parsedDate.month].slice(0, 3)} {ev.parsedDate.day}
                    </span>
                    <span className="prior-chip-title">{ev.title}</span>
                    <ArrowRight size={13} className="prior-chip-arrow" />
                  </button>
                ))}
              </div>
            )}

            {/* Box 2: Current Selected Day Event Details (Separate Main Card) */}
            <div className="inspector-main-card">
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

              {selectedDateEvents.length > 0 ? (
                <div className="inspector-events-list">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="inspector-event-card">
                      <div className="inspector-card-top">
                        <span className="event-tag">{event.category}</span>
                      </div>

                      <h5 className="inspector-event-title">{event.title}</h5>

                      {event.description && (
                        <div className="inspector-desc-wrap">
                          <p className="inspector-event-desc-2line">
                            {event.description}
                          </p>
                          <button
                            type="button"
                            className="btn-readmore-inline"
                            onClick={() => setActivePage && setActivePage('events')}
                            title="Read full event details on Events page"
                          >
                            Read More <ArrowRight size={12} />
                          </button>
                        </div>
                      )}

                      <div className="event-details">
                        <div className="detail-row">
                          <Clock size={15} color="#FA9B7A" />
                          <span>{formatEventTime(event.date)}</span>
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
                        className="btn-cal-colorful"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
                      >
                        <CalendarPlus size={15} />
                        Add to Google Calendar
                        <ExternalLink size={12} style={{ opacity: 0.8 }} />
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
                  </p>
                </div>
              )}
            </div>

            {/* Box 3: Next Events (Separate Bottom Box) */}
            {nextActiveEvents.length > 0 && (
              <div className="inspector-next-card">
                <div className="next-box-header">
                  <span className="next-box-title">Next Events</span>
                  <span className="next-box-count">{nextActiveEvents.length} upcoming</span>
                </div>
                <div className="next-events-list">
                  {nextActiveEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      className="next-event-row"
                      onClick={() => handleSelectEvent(ev)}
                    >
                      <span className="next-event-date">
                        {MONTH_NAMES[ev.parsedDate.month].slice(0, 3)} {ev.parsedDate.day}
                      </span>
                      <span className="next-event-title">{ev.title}</span>
                      <ArrowRight size={13} className="next-event-arrow" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

