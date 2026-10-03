import { HubProvider, Sink } from "pipe_x";
import {
  Column,
  CrossAxisAlignment,
  EdgeInsets,
  FontWeight,
  Padding,
  Text,
  type UIComponent,
} from "../../../../src";
import { go } from "../../../app/navigation";
import { nfText } from "../../../common/theme/nf_theme";
import { asyncView } from "../../../common/ui/async_view";
import { MediaRail } from "../../../common/ui/media_rail";
import { NfEmpty } from "../../../common/ui/nf_status";
import { TitleCard } from "../../../common/ui/title_card";
import type { Show } from "../../browse/domain/show";
import { MyListPageHub } from "../application/my_list_page_hub";

function cards(shows: Show[]): UIComponent[] {
  return shows.map((show) =>
    TitleCard({
      id: show.id,
      name: show.name,
      image: show.poster,
      onTap: () => go(`/title/${show.id}`),
    }),
  );
}

export function myListPage() {
  return HubProvider({
    create: () => new MyListPageHub(),
    child: (hub) =>
      Column({
        gap: 8,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding({
            padding: EdgeInsets.only({ left: 60, right: 24, top: 84, bottom: 8 }),
            child: Text({
              text: "My List",
              style: nfText({ size: 28, weight: FontWeight.w700 }),
            }),
          }),
          Sink({
            pipe: hub.continueWatching,
            builder: (value) =>
              asyncView(
                value,
                (show) =>
                  show
                    ? MediaRail({
                        title: "Continue Watching",
                        itemExtent: 248,
                        height: 190,
                        children: cards([show]),
                      })
                    : Column({ children: [] }),
                () => void hub.continueWatching.refresh(),
              ),
          }),
          Sink({
            pipe: hub.items,
            builder: (value) =>
              asyncView(
                value,
                (shows) =>
                  shows.length === 0
                    ? NfEmpty("Titles you add will show up here.")
                    : MediaRail({ title: "My List", itemExtent: 248, height: 190, children: cards(shows) }),
                () => void hub.items.refresh(),
              ),
          }),
        ],
      }),
  });
}
