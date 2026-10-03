import { HubProvider, Sink, read } from "pipe_x";
import {
  Alignment,
  Clip,
  Column,
  Container,
  CrossAxisAlignment,
  EdgeInsets,
  FontWeight,
  Padding,
  Positioned,
  Row,
  Stack,
  StackFit,
  Text,
  TextOverflow,
  type UIComponent,
} from "../../../../src";
import { go } from "../../../app/navigation";
import { NfColors, nfHeadline, nfText } from "../../../common/theme/nf_theme";
import { asyncView } from "../../../common/ui/async_view";
import { GradientScrim } from "../../../common/ui/gradient_scrim";
import { HeroImage } from "../../../common/ui/hero_image";
import { MediaRail } from "../../../common/ui/media_rail";
import { NfButton } from "../../../common/ui/nf_button";
import { Poster } from "../../../common/ui/poster";
import type { CastMember, ShowDetails } from "../../browse/domain/show";
import { MyListHub } from "../../mylist/application/my_list_hub";
import { TitleHub } from "../application/title_hub";

function castCards(cast: CastMember[]): UIComponent[] {
  return cast.slice(0, 16).map((member) =>
    Column({
      gap: 6,
      children: [
        Poster({
          id: 0,
          name: member.name,
          image: member.photo,
          width: 90,
          height: 90,
          onTap: () => undefined,
        }),
        Text({
          text: member.name,
          style: nfText({ size: 12, weight: FontWeight.w600 }),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        }),
        Text({
          text: member.character,
          style: nfText({ size: 11, color: NfColors.muted }),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        }),
      ],
    }),
  );
}

function titleBody(details: ShowDetails): UIComponent {
  const list = read(MyListHub);
  const art = details.background ?? details.poster;
  return Column({
    children: [
      Container({
        height: 560,
        child: Stack({
          fit: StackFit.expand,
          clipBehavior: Clip.hardEdge,
          children: [
            art
              ? HeroImage({
                  src: art,
                  alt: details.name,
                })
              : Container({ color: NfColors.card, width: "100%", height: "100%" }),
            GradientScrim({
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
              colors: ["#141414", "transparent"],
            }),
            Positioned({
              left: 60,
              right: 24,
              bottom: 28,
              child: Column({
                gap: 10,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text({ text: details.name, style: nfHeadline }),
                  Text({
                    text: [details.network, details.premiered?.slice(0, 4), details.rating]
                      .filter(Boolean)
                      .join("  •  "),
                    style: nfText({ size: 14, color: NfColors.muted }),
                  }),
                  Row({
                    gap: 10,
                    children: [
                      NfButton({
                        text: "Play",
                        variant: "light",
                        onPressed: () => go(`/watch/${details.id}`),
                      }),
                      Sink({
                        pipe: list.ids,
                        builder: (ids) =>
                          NfButton({
                            text: ids.includes(details.id) ? "– My List" : "+ My List",
                            variant: "outline",
                            onPressed: () => list.toggle(details.id),
                          }),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
      Padding({
        padding: EdgeInsets.only({ left: 24, right: 24, top: 16, bottom: 8 }),
        child: Text({
          text: details.summary || "No synopsis available.",
          style: nfText({ size: 16, color: NfColors.muted }),
        }),
      }),
      Padding({
        padding: EdgeInsets.only({ left: 24, right: 24, bottom: 8 }),
        child: Text({
          text: details.genres.join("  •  "),
          style: nfText({ size: 13, color: NfColors.grey }),
        }),
      }),
      ...(details.cast.length > 0
        ? [MediaRail({ title: "Cast", children: castCards(details.cast) })]
        : []),
      Padding({
        padding: EdgeInsets.only({ left: 24, right: 24, top: 8, bottom: 32 }),
        child: Column({
          gap: 8,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text({ text: "Seasons", style: nfText({ size: 22, weight: FontWeight.w700 }) }),
            ...details.seasons.slice(0, 12).map((season) =>
              Text({
                text: `Season ${season.number}${
                  season.episodeCount ? `  •  ${season.episodeCount} episodes` : ""
                }`,
                style: nfText({ size: 15, color: NfColors.muted }),
              }),
            ),
          ],
        }),
      }),
    ],
  });
}

export function titlePage(id: string) {
  const showId = Number.parseInt(id, 10);
  return HubProvider({
    create: () => new TitleHub(showId),
    child: (hub) =>
      Sink({
        pipe: hub.details,
        builder: (value) =>
          asyncView(value, (details) => titleBody(details), () => void hub.details.refresh()),
      }),
  });
}
