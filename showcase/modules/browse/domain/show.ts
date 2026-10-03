export interface Show {
  id: number;
  name: string;
  summary: string;
  poster?: string;
  background?: string;
  rating?: number;
  genres: string[];
  weight: number;
  premiered?: string;
  network?: string;
  status?: string;
  kind?: string;
}

export interface CastMember {
  name: string;
  character: string;
  photo?: string;
}

export interface Season {
  id: number;
  number: number;
  episodeCount?: number;
}

export interface Episode {
  id: number;
  name: string;
  season: number;
  number: number;
  summary: string;
  airdate?: string;
}

export interface ShowDetails extends Show {
  cast: CastMember[];
  seasons: Season[];
  episodes: Episode[];
}
