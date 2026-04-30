export interface ClubProfile {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  purpose: string;
  impact: string;
  social: Record<string, string>;
  leaders: string[];
}

export interface ClubMeeting {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}

export interface ClubData {
  profile: ClubProfile;
  meetings: ClubMeeting[];
}
