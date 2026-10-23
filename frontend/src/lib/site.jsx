import React, { createContext, useContext } from 'react';
import { useApi } from './api.js';

export const DEFAULT_DISCORD = 'https://discord.gg/Fx7BUvzdzT';

const FALLBACK = {
  stats: { members: 300, online: 0, membersLive: false, eventsHosted: 40, studentsHelped: 250, foundedYear: 2022 },
  discordInvite: DEFAULT_DISCORD,
};

const SiteContext = createContext(FALLBACK);

// Loads club-wide settings (stats, Discord invite) once for the whole app.
export function SiteProvider({ children }) {
  const { data } = useApi('/api/site', { initial: FALLBACK });
  return <SiteContext.Provider value={data || FALLBACK}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
