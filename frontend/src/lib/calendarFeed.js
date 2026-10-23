/**
 * UX Collective — frontend/src/lib/calendarFeed.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
// Links for subscribing to the club's live iCal feed in common calendar apps.
// Subscribed calendars re-check the feed, so future events appear automatically.

export const feedUrl = () => `${window.location.origin}/api/calendar.ics`;
export const webcalUrl = () => feedUrl().replace(/^https?:/, 'webcal:');

export const CALENDAR_APPS = [
  {
    id: 'google',
    label: 'Google Calendar',
    href: () => `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl())}`,
    newTab: true,
  },
  { id: 'apple', label: 'Apple Calendar', href: () => webcalUrl(), newTab: false },
  {
    id: 'outlook',
    label: 'Outlook',
    href: () => `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrl())}&name=${encodeURIComponent('UX Collective Events')}`,
    newTab: true,
  },
];

export async function copyFeedUrl() {
  try {
    await navigator.clipboard.writeText(feedUrl());
    return true;
  } catch {
    window.prompt('Copy this calendar link:', feedUrl());
    return false;
  }
}
