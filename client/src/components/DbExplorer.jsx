import React from 'react';
import { Calendar, MapPin, Tag, Terminal, Database } from 'lucide-react';

export default function DbExplorer({ events, logs, isLoadingEvents }) {
  return (
    <section id="events" className="data-section">
      <div className="section-header">
        <div>
          <p className="section-tag">Database Persistence</p>
          <h3 className="section-title">Live Data Queried From MySQL (`uxco_events`)</h3>
        </div>
      </div>

      {isLoadingEvents ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading events from MySQL database...</p>
      ) : events.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No events found in database.</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div>
                <span className="event-tag">{event.category}</span>
                <h4 className="event-title">{event.title}</h4>
                <p className="event-desc">{event.description}</p>
              </div>

              <div className="event-footer">
                <div className="event-info-item">
                  <Calendar size={14} color="#FA9B7A" />
                  <span>{event.date}</span>
                </div>
                <div className="event-info-item">
                  <MapPin size={14} color="#E81D88" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Database Connection Logs Snippet */}
      {logs && logs.length > 0 && (
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Terminal size={18} color="#E81D88" />
            <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Database Audit Logs (`connection_logs`)</h4>
          </div>
          <div style={{
            background: '#FAFAFA',
            border: '1px solid #EBEBEB',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#333333',
            maxHeight: '180px',
            overflowY: 'auto'
          }}>
            {logs.map((log) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
                <span><strong>#{log.id} [{log.source}]</strong>: {log.message}</span>
                <span style={{ color: '#888888', marginLeft: '16px' }}>{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
