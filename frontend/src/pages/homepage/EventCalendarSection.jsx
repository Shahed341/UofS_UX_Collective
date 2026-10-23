import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  CalendarPlus
} from 'lucide-react';

import { MONTHS as MONTH_NAMES, parseDateTime, formatDate, formatTimeRange, googleCalendarUrl, saskatoonToday } from '../../lib/dates.js';
import { Reveal } from '../../lib/motion.jsx';
import SubscribeMenu from '../../components/events/SubscribeMenu.jsx';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Compact start time for calendar chips, e.g. "5:30p" (Google Calendar style)
function formatChipTime(startAt) {
  const p = parseDateTime(startAt);
  if (!p) return '';
  const h = p.hour % 12 || 12;
  return `${h}${p.minute ? `:${String(p.minute).padStart(2, '0')}` : ''}${p.hour < 12 ? 'a' : 'p'}`;
}

const toDay = (p) => (p ? { year: p.year, month: p.month, day: p.day } : null);

export default function EventCalendarSection({ events = [], isLoadingEvents }) {
  const navigate = useNavigate();
  const today = saskatoonToday();
  const todayYear = today.year;
  const todayMonth = today.month;
  const todayDay = today.day;

  // Calendar opens on today; once events load it jumps to the next upcoming one
  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [selectedDate, setSelectedDate] = useState(today);

  const parsedEvents = useMemo(
    () => events.map((event) => ({ ...event, parsedDate: toDay(parseDateTime(event.start_at)) })),
    [events]
  );

  useEffect(() => {
    const next = parsedEvents.find((e) => !e.is_past && e.parsedDate);
    if (next) {
      setViewYear(next.parsedDate.year);
      setViewMonth(next.parsedDate.month);
      setSelectedDate(next.parsedDate);
    }
  }, [parsedEvents]);

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

  // Events strictly BEFORE the currently selected date (max 2 nearest prior events)
  const priorActiveEvents = useMemo(() => {
    if (!selectedDateTimestamp) return [];
    const allPrior = sortedEvents.filter((e) => {
      const t = new Date(e.parsedDate.year, e.parsedDate.month, e.parsedDate.day).getTime();
      return t < selectedDateTimestamp;
    });
    return allPrior.slice(-2); // Stack max 2 nearest prior events on top
  }, [sortedEvents, selectedDateTimestamp]);

  // Events strictly AFTER the currently selected date (max 3 upcoming events)
  const nextActiveEvents = useMemo(() => {
    if (!selectedDateTimestamp) return sortedEvents.slice(0, 3);
    const allNext = sortedEvents.filter((e) => {
      const t = new Date(e.parsedDate.year, e.parsedDate.month, e.parsedDate.day).getTime();
      return t > selectedDateTimestamp;
    });
    return allNext.slice(0, 3); // Keep max 3 next events at bottom
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

  const handleJumpToToday = () => {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
    setSelectedDate({ year: todayYear, month: todayMonth, day: todayDay });
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
      <div className="cal-section-head">
        <div className="cal-section-title">
          <span className="section-eyebrow">Interactive Schedule</span>
          <h2 className="section-heading">Club calendar</h2>
        </div>
        <SubscribeMenu />
      </div>

      {isLoadingEvents ? (
        <div className="cal-loading-box">
          <p style={{ color: 'var(--text-muted)' }}>Loading events…</p>
        </div>
      ) : (
        <Reveal variant="up" className="cal-layout-container">
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
                        {cell.events.map((ev) => (
                          <div
                            key={ev.id}
                            className={`cal-event-chip ${ev.is_past ? 'is-past' : ''}`}
                            title={`${formatTimeRange(ev.start_at, ev.end_at)} · ${ev.title}`}
                          >
                            <span className="cal-event-chip-time">{formatChipTime(ev.start_at)}</span>
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
              <button type="button" className="cal-all-events-link" onClick={() => navigate('/events')}>
                All upcoming events <ArrowRight size={14} />
              </button>
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
                      <span className="inspector-event-date">{formatDate(event.start_at, { short: true })}</span>

                      <h5 className="inspector-event-title">
                        <Link to={`/events/${event.slug}`}>{event.title}</Link>
                      </h5>

                      {(event.summary || event.description) && (
                        <p className="inspector-event-desc-2line">{event.summary || event.description}</p>
                      )}

                      <div className="event-details">
                        <div className="detail-row">
                          <Clock size={15} color="#FA9B7A" />
                          <span>{formatTimeRange(event.start_at, event.end_at)}</span>
                        </div>
                        <div className="detail-row">
                          <MapPin size={15} color="#E81D88" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      {event.is_past ? (
                        <Link to={`/events/${event.slug}`} className="inspector-recap-link">
                          View recap <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="inspector-add-cal">
                          <CalendarPlus size={16} /> Add to calendar
                        </a>
                      )}
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
        </Reveal>
      )}
    </section>
  );
}

