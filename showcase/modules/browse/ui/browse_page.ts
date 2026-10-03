import { HubProvider, Sink } from "pipe_x";
import {
  Alignment,
  BorderRadius,
  BoxDecoration,
  Clip,
  Column,
  Container,
  CrossAxisAlignment,
  EdgeInsets,
  FontWeight,
  Icons,
  Positioned,
  Row,
  Stack,
  StackFit,
  Text,
  TextOverflow,
  type UIComponent,
} from "../../../../src";
import { go } from "../../../app/navigation";
import { NfColors, nfText } from "../../../common/theme/nf_theme";
import { asyncView } from "../../../common/ui/async_view";
import { GradientScrim } from "../../../common/ui/gradient_scrim";
import { HeroImage } from "../../../common/ui/hero_image";
import { MediaRail } from "../../../common/ui/media_rail";
import { NfButton } from "../../../common/ui/nf_button";
import { NfCircleIcon } from "../../../common/ui/nf_circle_icon";
import { TitleCard } from "../../../common/ui/title_card";
import { TopTenRail } from "../../../common/ui/top_ten_rail";
import type { CatalogFeed } from "../application/catalog_hub";
import { CatalogHub } from "../application/catalog_hub";
import type { Show } from "../domain/show";

function cards(shows: Show[]): UIComponent[] {
  return shows.map((show) =>
    TitleCard({
      id: show.id,
      name: show.name,
      image: show.background && show.background !== show.poster ? show.background : show.poster,
      onTap: () => go(`/title/${show.id}`),
    }),
  );
}

function heroKind(show: Show): string {
  const kind = (show.kind ?? "Scripted").toLowerCase();
  if (kind === "scripted" || kind === "show") {
    return "Series";
  }
  return show.kind ?? "Series";
}

function heroMeta(show: Show): string {
  return [
    heroKind(show),
    show.genres[0],
    show.premiered?.slice(0, 4),
    show.rating != null ? String(show.rating) : undefined,
  ]
    .filter(Boolean)
    .join("  ·  ");
}

function pickFeatured(feed: CatalogFeed, index: number): Show {
  const pool = feed.featuredPool.length > 0 ? feed.featuredPool : [feed.featured];
  return pool[Math.abs(index) % pool.length] ?? feed.featured;
}

function hero(show: Show, onCycle: () => void): UIComponent {
  const art = show.background ?? show.poster;
  const landscape = Boolean(show.background && show.background !== show.poster);
  return Container({
    width: "100%",
    height: "calc(100vh - 100px)",
    minHeight: 380,
    overflow: "hidden",
    position: "relative",
    decoration: BoxDecoration({
      color: NfColors.card,
      borderRadius: BorderRadius.circular(18),
    }),
    child: Stack({
      fit: StackFit.expand,
      clipBehavior: Clip.hardEdge,
      children: [
        art
          ? HeroImage({
              src: art,
              alt: show.name,
              alignment: landscape ? new Alignment(0, -0.64) : new Alignment(0, -0.76),
            })
          : Container({ width: "100%", height: "100%", color: NfColors.card }),
        GradientScrim({
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: ["rgba(0,0,0,0.62)", "transparent"],
        }),
        GradientScrim({
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: ["rgba(0,0,0,0.78)", "rgba(0,0,0,0.28)", "transparent"],
        }),
        Positioned({
          left: 52,
          bottom: 44,
          width: "min(560px, 58vw)",
          child: Column({
            gap: 14,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text({
                text: show.name,
                style: nfText({ size: 56, weight: FontWeight.w900, letterSpacing: 0.4 }),
              }),
              Text({
                text: heroMeta(show),
                style: nfText({ size: 14, weight: FontWeight.w600, color: "#E5E5E5" }),
              }),
              Text({
                text: show.summary || "A title from the TVMaze catalog.",
                style: nfText({ size: 16, color: "#d2d2d2" }),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              }),
              Row({
                gap: 12,
                children: [
                  NfButton({
                    text: "▶  Play",
                    variant: "light",
                    pill: true,
                    onPressed: () => go(`/watch/${show.id}`),
                  }),
                  NfButton({
                    text: "More Info",
                    variant: "glass",
                    pill: true,
                    onPressed: () => go(`/title/${show.id}`),
                  }),
                ],
              }),
            ],
          }),
        }),
        Positioned({
          top: 18,
          right: 18,
          child: NfCircleIcon({
            icon: Icons.refresh,
            tooltip: "Next title",
            onTap: onCycle,
          }),
        }),
      ],
    }),
  });
}

function browseBody(feed: CatalogFeed, hub: CatalogHub): UIComponent {
  return Container({
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    color: "#0f0f0f",
    child: Column({
      width: "100%",
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Sink({
          pipe: hub.spotlight,
          builder: (index) =>
            Container({
              width: "100%",
              padding: EdgeInsets.only({ top: 76, left: 24, right: 24 }),
              child: hero(pickFeatured(feed, index), () => hub.cycleSpotlight()),
            }),
        }),
        Container({
          width: "100%",
          maxWidth: "100%",
          overflow: "visible",
          position: "relative",
          padding: EdgeInsets.only({ top: 20, bottom: 48 }),
          child: Column({
            width: "100%",
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              MediaRail({
                title: "Coming Next Week",
                itemExtent: 248,
                height: 190,
                children: cards(feed.comingNext),
              }),
              TopTenRail({
                title: "Top 10 Movies in India Today",
                shows: feed.topTen,
              }),
              MediaRail({
                title: "Netflix Originals",
                itemExtent: 248,
                height: 190,
                children: cards(feed.originals),
              }),
              MediaRail({
                title: "Horror",
                itemExtent: 248,
                height: 190,
                children: cards(feed.horror),
              }),
              MediaRail({
                title: "New Releases",
                itemExtent: 248,
                height: 190,
                children: cards(feed.newReleases),
              }),
              MediaRail({
                title: "Worth the Wait",
                itemExtent: 248,
                height: 190,
                children: cards(feed.worthTheWait),
              }),
            ],
          }),
        }),
      ],
    }),
  });
}

export function browsePage() {
  return HubProvider({
    create: () => new CatalogHub(),
    child: (hub) =>
      Sink({
        pipe: hub.feed,
        builder: (value) =>
          asyncView(
            value,
            (feed) => browseBody(feed, hub),
            () => void hub.feed.refresh(),
          ),
      }),
  });
}
