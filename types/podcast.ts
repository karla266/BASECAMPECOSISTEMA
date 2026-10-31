export interface PodcastChapter {
  time: number;
  title: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  slug: string;
  season: number;
  episodeNumber: number;
  publishedAt: string;
  summary: string;
  description: string;
  audioUrl: string;
  audioSizeBytes: number;
  durationSeconds: number;
  coverImageUrl: string;
  tags: string[];
  hosts: string[];
  chapters?: PodcastChapter[];
  spotifyUrl?: string;
  youtubeUrl?: string;
  status: "draft" | "published";
}

export type VozPodcast = "mujer" | "hombre" | "institucional";
