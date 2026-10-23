/**
 * UX Collective — frontend/src/pages/admin/charts.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, Table2, BarChart3 } from 'lucide-react';

// Small, dependency-free chart pieces for the admin dashboard.
// One series per chart (brand crimson), recessive grid, hover tooltips and a table view.

const fmt = (n) => (n == null ? '–' : Number(n).toLocaleString());
const shortDay = (day) => new Date(`${day}T12:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });

// "Nice" axis maximum so gridlines land on round numbers
function niceMax(value) {
  if (value <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * pow * 4 >= value) * pow;
  return step * 4;
}

export function KpiTile({ label, value, previous, hint }) {
  // No baseline to compare against when the previous period was empty
  const isNew = previous === 0 && value > 0;
  const delta = previous == null || isNew ? null : previous === 0 ? 0 : Math.round(((value - previous) / previous) * 100);
  const Icon = delta == null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="kpi-tile">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{fmt(value)}</span>
      {isNew ? (
        <span className="kpi-delta up"><ArrowUpRight size={14} aria-hidden="true" />New this period</span>
      ) : delta != null ? (
        <span className={`kpi-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
          <Icon size={14} aria-hidden="true" />
          {delta === 0 ? 'No change' : `${Math.abs(delta)}% vs previous`}
        </span>
      ) : (
        <span className="kpi-delta">{hint}</span>
      )}
    </div>
  );
}

// Card wrapper with a chart/table toggle so every chart has an accessible table view.
export function ChartCard({ title, subtitle, table, children, className = '' }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className={`chart-card ${className}`}>
      <header className="chart-card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {table && (
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => setShowTable((v) => !v)}
            aria-label={showTable ? 'Show chart' : 'Show table'}
            title={showTable ? 'Show chart' : 'Show table'}
          >
            {showTable ? <BarChart3 size={16} /> : <Table2 size={16} />}
          </button>
        )}
      </header>
      {showTable && table ? <DataTable {...table} /> : children}
    </section>
  );
}

export function DataTable({ columns, rows }) {
  return (
    <div className="chart-table-wrap">
      <table className="chart-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} className={c.numeric ? 'num' : ''}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => <td key={c.key} className={c.numeric ? 'num' : ''}>{c.format ? c.format(row[c.key], row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Vertical bars over time. data: [{ day, value, ...extra }], tooltip(row) -> lines
export function TimeBars({ data, valueKey, tooltip }) {
  const [hover, setHover] = useState(null);
  const max = niceMax(Math.max(1, ...data.map((d) => d[valueKey])));
  const ticks = [max, max / 2, 0];
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <div className="timebars">
      <div className="chart-plot">
        {ticks.map((t) => (
          <div key={t} className="chart-gridline" style={{ bottom: `${(t / max) * 100}%` }}>
            <span>{fmt(t)}</span>
          </div>
        ))}
        <div className="timebars-bars" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => (
            <div
              key={d.day}
              className={`timebar-slot ${hover === i ? 'is-hover' : ''}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              aria-label={`${shortDay(d.day)}: ${tooltip(d).join(', ')}`}
            >
              <div className="timebar" style={{ height: `${(d[valueKey] / max) * 100}%` }} />
            </div>
          ))}
        </div>
        {hover != null && (
          <div className="chart-tooltip" style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}>
            <strong>{shortDay(data[hover].day)}</strong>
            {tooltip(data[hover]).map((line) => <span key={line}>{line}</span>)}
          </div>
        )}
      </div>
      {/* Labels are positioned under their bar; the last one is right-aligned so it never clips */}
      <div className="chart-xaxis positioned">
        {data.map((d, i) => {
          const last = i === data.length - 1;
          if (!last && (i % labelEvery !== 0 || data.length - 1 - i < labelEvery / 2)) return null;
          return (
            <span
              key={d.day}
              style={last ? { right: 0 } : { left: `${((i + 0.5) / data.length) * 100}%`, transform: i === 0 ? 'none' : 'translateX(-50%)' }}
            >
              {shortDay(d.day)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Line over time with a hover crosshair. data: [{ day, value }]
export function TimeLine({ data, valueKey, label }) {
  const [hover, setHover] = useState(null);
  if (data.length === 0) return <p className="chart-empty">No data yet.</p>;
  const values = data.map((d) => d[valueKey]);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = Math.max(1, Math.round((hi - lo) * 0.15));
  const min = Math.max(0, lo - pad);
  const max = hi + pad;
  const x = (i) => (data.length === 1 ? 50 : (i / (data.length - 1)) * 100);
  const y = (v) => 100 - ((v - min) / (max - min)) * 100;
  const points = data.map((d, i) => `${x(i)},${y(d[valueKey])}`).join(' ');

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - rect.left) / rect.width) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div className="timeline">
      <div className="chart-plot" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {[max, Math.round((max + min) / 2), min].map((t, i) => (
          <div key={i} className="chart-gridline" style={{ bottom: `${((t - min) / (max - min)) * 100}%` }}>
            <span>{fmt(t)}</span>
          </div>
        ))}
        <svg className="timeline-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={label} role="img">
          <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" className="timeline-path" />
        </svg>
        {data.length === 1 && <span className="timeline-dot" style={{ left: '50%', top: `${y(values[0])}%` }} />}
        {hover != null && (
          <>
            <span className="timeline-crosshair" style={{ left: `${x(hover)}%` }} />
            <span className="timeline-dot" style={{ left: `${x(hover)}%`, top: `${y(data[hover][valueKey])}%` }} />
            <div className="chart-tooltip" style={{ left: `${x(hover)}%` }}>
              <strong>{shortDay(data[hover].day)}</strong>
              <span>{fmt(data[hover][valueKey])} {label.toLowerCase()}</span>
            </div>
          </>
        )}
      </div>
      <div className="chart-xaxis spread">
        <span>{shortDay(data[0].day)}</span>
        {data.length > 1 && <span>{shortDay(data[data.length - 1].day)}</span>}
      </div>
    </div>
  );
}

// Ranked horizontal bars. rows: [{ label, value, note? }]
export function RankBars({ rows, empty = 'No data yet.' }) {
  if (!rows.length) return <p className="chart-empty">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ol className="rankbars">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${fmt(r.value)}${r.note ? ` · ${r.note}` : ''}`}>
          <div className="rankbar-text">
            <span className="rankbar-label">{r.label}</span>
            <span className="rankbar-value">
              {fmt(r.value)}
              {r.note && <em>{r.note}</em>}
            </span>
          </div>
          <div className="rankbar-track">
            <div className="rankbar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export { fmt, shortDay };
