import type { ClubProfile, ClubMeeting, ClubData } from './types';

// ── Data Adapter ──
// Abstracts the data source. Today reads from JSON files via static imports at build time.
// Tomorrow can be replaced with API calls, Google Sheets, etc.
// without changing any component.

const clubs: Record<string, ClubData> = {
  programming: {
    profile: (await import('../../data/clubs/programming/profile.json')).default,
    meetings: (await import('../../data/clubs/programming/meetings.json')).default,
  },
  electronics: {
    profile: (await import('../../data/clubs/electronics/profile.json')).default,
    meetings: (await import('../../data/clubs/electronics/meetings.json')).default,
  },
};

export function getClubProfile(slug: string): ClubProfile {
  return clubs[slug].profile;
}

export function getClubMeetings(slug: string): ClubMeeting[] {
  return clubs[slug].meetings;
}

export function getClub(slug: string): ClubData {
  const data = clubs[slug];
  if (!data) {
    throw new Error(`Club not found: ${slug}`);
  }
  return data;
}

export function getAllClubSlugs(): string[] {
  return Object.keys(clubs);
}

export function getAllClubs(): ClubData[] {
  return Object.values(clubs);
}
