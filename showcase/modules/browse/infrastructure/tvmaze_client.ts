import { tvmazeBaseUrl } from "../../../infrastructure/config";
import { HttpClient } from "../../../infrastructure/http_client";
import type { CastMember, Episode, Season, Show, ShowDetails } from "../domain/show";

interface TvImage {
  medium?: string;
  original?: string;
}

interface TvShow {
  id: number;
  name: string;
  summary?: string | null;
  image?: TvImage | null;
  rating?: { average?: number | null };
  genres?: string[];
  weight?: number;
  premiered?: string | null;
  status?: string;
  type?: string | null;
  network?: { name: string } | null;
  webChannel?: { name: string } | null;
  _embedded?: {
    cast?: Array<{
      person: { name: string; image?: TvImage | null };
      character: { name: string };
    }>;
    seasons?: Array<{ id: number; number: number; episodeOrder?: number | null }>;
    episodes?: Array<{
      id: number;
      name: string;
      season: number;
      number: number;
      summary?: string | null;
      airdate?: string | null;
    }>;
  };
}

interface TvSearchHit {
  show: TvShow;
}

interface TvScheduleItem {
  show?: TvShow;
  _embedded?: { show?: TvShow };
}

interface TvArtEntry {
  type?: string;
  resolutions?: {
    original?: { url?: string };
    medium?: { url?: string };
  };
}

function stripHtml(html?: string | null): string {
  if (!html) {
    return "";
  }
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pickImage(image?: TvImage | null): string | undefined {
  return image?.original ?? image?.medium;
}

function mapShow(raw: TvShow): Show {
  const poster = pickImage(raw.image);
  return {
    id: raw.id,
    name: raw.name,
    summary: stripHtml(raw.summary),
    poster,
    background: poster,
    rating: raw.rating?.average ?? undefined,
    genres: raw.genres ?? [],
    weight: raw.weight ?? 0,
    premiered: raw.premiered ?? undefined,
    network: raw.network?.name ?? raw.webChannel?.name,
    status: raw.status,
    kind: raw.type ?? "Scripted",
  };
}

function uniqueShows(shows: Show[]): Show[] {
  const seen = new Set<number>();
  const out: Show[] = [];
  for (const show of shows) {
    if (seen.has(show.id)) {
      continue;
    }
    seen.add(show.id);
    out.push(show);
  }
  return out;
}

function sortPopular(shows: Show[]): Show[] {
  return [...shows].sort((a, b) => {
    const weight = b.weight - a.weight;
    if (weight !== 0) {
      return weight;
    }
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}

export class TvMazeClient {
  private readonly http = new HttpClient(tvmazeBaseUrl);

  async popular(): Promise<Show[]> {
    const page = await this.http.getJson<TvShow[]>("/shows?page=0");
    return sortPopular(page.map(mapShow));
  }

  async tonight(): Promise<Show[]> {
    const items = await this.http.getJson<TvScheduleItem[]>("/schedule?country=US");
    return uniqueShows(items.map((item) => item.show).filter(Boolean).map((show) => mapShow(show!)));
  }

  async streaming(): Promise<Show[]> {
    const items = await this.http.getJson<TvScheduleItem[]>("/schedule/web");
    return uniqueShows(
      items
        .map((item) => item.show ?? item._embedded?.show)
        .filter(Boolean)
        .map((show) => mapShow(show!)),
    );
  }

  async search(query: string): Promise<Show[]> {
    const hits = await this.http.getJson<TvSearchHit[]>(
      `/search/shows?q=${encodeURIComponent(query)}`,
    );
    return hits.map((hit) => mapShow(hit.show));
  }

  async show(id: number): Promise<Show> {
    const raw = await this.http.getJson<TvShow>(`/shows/${id}`);
    return mapShow(raw);
  }

  async showDetails(id: number): Promise<ShowDetails> {
    const raw = await this.http.getJson<TvShow>(
      `/shows/${id}?embed[]=cast&embed[]=seasons&embed[]=episodes`,
    );
    const base = mapShow(raw);
    const art = await this.art(id);
    const cast: CastMember[] = (raw._embedded?.cast ?? []).map((entry) => ({
      name: entry.person.name,
      character: entry.character.name,
      photo: pickImage(entry.person.image),
    }));
    const seasons: Season[] = (raw._embedded?.seasons ?? []).map((season) => ({
      id: season.id,
      number: season.number,
      episodeCount: season.episodeOrder ?? undefined,
    }));
    const episodes: Episode[] = (raw._embedded?.episodes ?? []).map((episode) => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
      summary: stripHtml(episode.summary),
      airdate: episode.airdate ?? undefined,
    }));
    return {
      ...base,
      poster: art.poster ?? base.poster,
      background: art.background ?? base.background,
      cast,
      seasons,
      episodes,
    };
  }

  async showsByIds(ids: number[]): Promise<Show[]> {
    const shows: Show[] = [];
    for (const id of ids) {
      try {
        shows.push(await this.show(id));
      } catch {
        // skip missing titles
      }
    }
    return shows;
  }

  async art(id: number): Promise<{ poster?: string; background?: string }> {
    try {
      const entries = await this.http.getJson<TvArtEntry[]>(`/shows/${id}/images`);
      const urlFor = (type: string): string | undefined => {
        const match = entries.find((entry) => entry.type === type);
        return match?.resolutions?.original?.url ?? match?.resolutions?.medium?.url;
      };
      return {
        poster: urlFor("poster"),
        background: urlFor("background") ?? urlFor("banner"),
      };
    } catch {
      return {};
    }
  }
}

export const tvmaze = new TvMazeClient();
