/**
 * UX Collective — frontend/src/pages/admin/sections/DashboardSection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useApi } from '../../../lib/api.js';
import { saskatoonToday } from '../../../lib/dates.js';
import { ChartCard, KpiTile, RankBars, TimeBars, TimeLine, fmt, shortDay } from '../charts.jsx';
import { EmptyRow } from '../ui.jsx';

const RANGES = [7, 30, 90, 365];
const GAME_NAMES = { aim: 'Aim', pattern: 'Pattern', pixel: 'Pixel' };
const PAGE_NAMES = {
  '/': 'Home', '/about': 'About', '/events': 'Events', '/gallery': 'Gallery', '/fun': 'Fun',
  '/contact': 'Contact', '/resources': 'Resources', '/get-involved': 'Get involved',
};
const APP_NAMES = { google: 'Google Calendar', apple: 'Apple Calendar', outlook: 'Outlook', copy: 'Copied feed link' };

// Every day in the range, with zeros where nothing was tracked
function fillDays(rows, days) {
  const t = saskatoonToday();
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.UTC(t.year, t.month, t.day - (days - 1 - i)));
    const day = d.toISOString().slice(0, 10);
    return { day, views: 0, visitors: 0, ...byDay.get(day) };
  });
}

export default function DashboardSection() {
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useApi(`/api/admin/analytics?days=${days}`);

  const daily = useMemo(() => (data ? fillDays(data.daily, Math.min(days, 90)) : []), [data, days]);

  if (error) return <EmptyRow>{error.message}</EmptyRow>;

  const c = data?.totals.current;
  const p = data?.totals.previous;
  const latestMembers = data?.members.at(-1)?.members;
  const firstMembers = data?.members[0]?.members;

  return (
    <section className="admin-section dashboard">
      <header className="admin-section-head">
        <h1>Dashboard</h1>
        <div className="dashboard-filters" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r} type="button" className={days === r ? 'active' : ''} onClick={() => setDays(r)} aria-pressed={days === r}>
              {r === 365 ? '1 year' : `${r} days`}
            </button>
          ))}
          <button type="button" className="admin-icon-btn" onClick={reload} aria-label="Refresh">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </header>
      <p className="admin-section-note">Anonymous, cookie-free visit tracking. Compared with the previous {days} days.</p>

      {!data ? (
        <EmptyRow>Loading…</EmptyRow>
      ) : (
        <>
          <div className="kpi-grid">
            <KpiTile label="Visitors" value={c.visitors} previous={p.visitors} />
            <KpiTile label="Page views" value={c.pageViews} previous={p.pageViews} />
            <KpiTile label="Calendar adds" value={c.calendarAdds} previous={p.calendarAdds} />
            <KpiTile label="Game plays" value={c.gamePlays} previous={p.gamePlays} />
            <KpiTile
              label="Discord members"
              value={latestMembers}
              hint={latestMembers != null && firstMembers != null ? `${latestMembers - firstMembers >= 0 ? '+' : ''}${latestMembers - firstMembers} in range` : 'Tracked daily'}
            />
            <KpiTile label="Calendar subscribers" value={data.community.totalSubscribers} hint={`+${data.community.newSubscribers} in range`} />
          </div>

          <div className="dashboard-grid">
            <ChartCard
              className="span-2"
              title="Visitors per day"
              subtitle={days > 90 ? 'Last 90 days' : undefined}
              table={{
                columns: [
                  { key: 'day', label: 'Day', format: shortDay },
                  { key: 'visitors', label: 'Visitors', numeric: true, format: fmt },
                  { key: 'views', label: 'Page views', numeric: true, format: fmt },
                ],
                rows: [...daily].reverse(),
              }}
            >
              <TimeBars data={daily} valueKey="visitors" tooltip={(d) => [`${fmt(d.visitors)} visitors`, `${fmt(d.views)} page views`]} />
            </ChartCard>

            <ChartCard
              title="Member growth"
              subtitle="Discord members, recorded daily"
              table={{
                columns: [
                  { key: 'day', label: 'Day', format: shortDay },
                  { key: 'members', label: 'Members', numeric: true, format: fmt },
                ],
                rows: [...data.members].reverse(),
              }}
            >
              <TimeLine data={data.members} valueKey="members" label="Members" />
            </ChartCard>

            <ChartCard title="Most viewed pages">
              <RankBars rows={data.topPages.map((r) => ({ label: PAGE_NAMES[r.label] || r.label, value: r.value }))} />
            </ChartCard>

            <ChartCard
              className="span-2"
              title="Event engagement"
              subtitle="Detail-page views, with calendar adds"
              table={{
                columns: [
                  { key: 'title', label: 'Event' },
                  { key: 'views', label: 'Views', numeric: true, format: fmt },
                  { key: 'calendar_adds', label: 'Calendar adds', numeric: true, format: fmt },
                ],
                rows: data.events,
              }}
            >
              <RankBars
                rows={data.events.map((e) => ({ label: e.title, value: e.views, note: `${fmt(e.calendar_adds)} added to calendar` }))}
                empty="No event views yet."
              />
            </ChartCard>

            <ChartCard
              title="Games"
              table={{
                columns: [
                  { key: 'id', label: 'Game', format: (v) => GAME_NAMES[v] },
                  { key: 'plays', label: 'Plays', numeric: true, format: fmt },
                  { key: 'finishes', label: 'Finished', numeric: true, format: fmt },
                  { key: 'players', label: 'Players', numeric: true, format: fmt },
                  { key: 'best', label: 'Best', numeric: true, format: fmt },
                ],
                rows: data.games,
              }}
            >
              <RankBars
                rows={data.games.map((g) => ({
                  label: GAME_NAMES[g.id],
                  value: g.plays,
                  note: `${g.plays ? Math.round((g.finishes / g.plays) * 100) : 0}% finished · ${fmt(g.players)} players`,
                }))}
              />
            </ChartCard>

            <ChartCard title="Top resources" subtitle="Clicks from the hub and homepage">
              <RankBars rows={data.resources} empty="No resource clicks yet." />
            </ChartCard>

            <ChartCard title="Engagement">
              <ul className="engagement-list">
                <li><span>Discord “Join” clicks</span><strong>{fmt(c.joinClicks)}</strong></li>
                <li><span>Subscribe clicks</span><strong>{fmt(c.subscribeClicks)}</strong></li>
                <li><span>Applications</span><strong>{fmt(data.community.applications)}</strong></li>
                <li><span>Contact messages</span><strong>{fmt(data.community.messages)}</strong></li>
                <li><span>Forms submitted</span><strong>{fmt(c.formSubmits)}</strong></li>
              </ul>
              {data.subscribeApps.length > 0 && (
                <>
                  <h4 className="engagement-subhead">Subscribed via</h4>
                  <RankBars rows={data.subscribeApps.map((r) => ({ label: APP_NAMES[r.label] || r.label, value: r.value }))} />
                </>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </section>
  );
}
