// ── Club Domain Types ──

/** Semantic tag that describes a line of interest */
export interface ClubTag {
  label: string;
  slug: string;
}

/** Showcase item — evidence of what the club produces */
export interface ShowcaseItem {
  title: string;
  description: string;
  /** Relative path to image asset */
  image?: string;
}

/** Who this club is for and what it requires */
export interface Participation {
  /** Target member profile description */
  memberProfile: string;
  /** Estimated time commitment */
  commitment: string;
  /** Entry requirements (can be "none") */
  requirements: string;
}

/** Reference contacts and physical location */
export interface References {
  /** Physical place to find the club */
  location: string;
  /** Named contacts with optional role */
  contacts: Array<{
    name: string;
    role?: string;
  }>;
}

export interface ClubProfile {
  name: string;
  slug: string;
  tagline: string;
  /** Core identity: what we do and why */
  manifesto: string;
  /** Semantic categories of focus */
  tags: ClubTag[];
  /** Evidence of output — projects, builds, events */
  gallery: ShowcaseItem[];
  /** What joining means */
  participation: Participation;
  /** Human connection points */
  references: References;
  social: Record<string, string>;
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
