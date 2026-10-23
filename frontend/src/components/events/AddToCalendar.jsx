import React from 'react';
import { CalendarPlus, Download } from 'lucide-react';
import { googleCalendarUrl, icsDataUrl } from '../../lib/dates.js';
import './events.css';

// Google Calendar link plus an .ics download for Apple Calendar / Outlook.
export default function AddToCalendar({ event, compact = false }) {
  return (
    <div className={`add-to-cal ${compact ? 'is-compact' : ''}`}>
      <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="add-to-cal-btn primary">
        <CalendarPlus size={16} />
        <span>{compact ? 'Google' : 'Add to Google Calendar'}</span>
      </a>
      <a href={icsDataUrl(event)} download={`${event.slug}.ics`} className="add-to-cal-btn" title="Apple Calendar, Outlook and others">
        <Download size={15} />
        <span>.ics</span>
      </a>
    </div>
  );
}
