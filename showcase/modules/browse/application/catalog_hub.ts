import { Hub } from "pipe_x";
import { tvmaze } from "../infrastructure/tvmaze_client";
import type { Show } from "../domain/show";

export interface CatalogFeed {
  featured: Show;
  featuredPool: Show[];
  comingNext: Show[];
  topTen: Show[];
  originals: Show[];
  horror: Show[];
  newReleases: Show[];
  worthTheWait: Show[];
}

function withPoster(shows: Show[]): Show[] {
  return shows.filter((show) => Boolean(show.poster));
}

function hasGenre(show: Show, genre: string): boolean {
  return show.genres.some((entry) => entry.toLowerCase() === genre.toLowerCase());
}

async function withBackdrop(show: Show): Promise<Show> {
  try {
    const art = await tvmaze.art(show.id);
    return {
      ...show,
      poster: art.poster ?? show.poster,
      background: art.background ?? show.background,
    };
  } catch {
    return show;
  }
}

async function featuredPool(popular: Show[]): Promise<Show[]> {
  const ranked = withPoster(popular);
  const pool: Show[] = [];
  for (const candidate of ranked.slice(0, 5)) {
    pool.push(await withBackdrop(candidate));
  }
  if (pool.length === 0) {
    const fallback = ranked[0] ?? popular[0];
    if (!fallback) {
      throw new Error("No titles in catalog");
    }
    pool.push(await withBackdrop(fallback));
  }
  const preferred = pool.find(
    (show) => show.background && show.background !== show.poster,
  );
  if (!preferred) {
    return pool;
  }
  return [preferred, ...pool.filter((show) => show.id !== preferred.id)];
}

function sliceUnique(shows: Show[], count: number, used: Set<number>): Show[] {
  const out: Show[] = [];
  for (const show of shows) {
    if (used.has(show.id) || !show.poster) {
      continue;
    }
    used.add(show.id);
    out.push(show);
    if (out.length >= count) {
      break;
    }
  }
  return out;
}

export class CatalogHub extends Hub {
  readonly spotlight = this.pipe(0, { key: "spotlight" });

  cycleSpotlight(): void {
    this.spotlight.value += 1;
  }

  readonly feed = this.asyncPipe(async (): Promise<CatalogFeed> => {
    const [popular, tonight, streaming] = await Promise.all([
      tvmaze.popular(),
      tvmaze.tonight(),
      tvmaze.streaming(),
    ]);
    const pool = await featuredPool(popular);
    const featured = pool[0]!;
    const used = new Set<number>([featured.id]);
    const topTen = sliceUnique(popular, 10, used);
    const comingNext = sliceUnique(withPoster(tonight), 18, new Set());
    const originals = sliceUnique(withPoster(streaming), 18, new Set());
    const horrorPool = popular.filter(
      (show) => hasGenre(show, "Horror") || hasGenre(show, "Thriller") || hasGenre(show, "Supernatural"),
    );
    const horror = sliceUnique(horrorPool.length > 4 ? horrorPool : popular, 18, new Set());
    const newest = [...popular].sort((a, b) =>
      (b.premiered ?? "").localeCompare(a.premiered ?? ""),
    );
    const newReleases = sliceUnique(newest, 18, new Set());
    const worthPool = popular.filter(
      (show) => show.weight >= 90 || (show.rating ?? 0) >= 8.3,
    );
    const worthTheWait = sliceUnique(worthPool.length > 4 ? worthPool : popular.slice(12), 18, new Set());
    return {
      featured,
      featuredPool: pool,
      comingNext: comingNext.length > 0 ? comingNext : sliceUnique(popular.slice(8), 18, new Set()),
      topTen,
      originals: originals.length > 0 ? originals : sliceUnique(popular.slice(16), 18, new Set()),
      horror,
      newReleases,
      worthTheWait,
    };
  }, { key: "feed" });
}
