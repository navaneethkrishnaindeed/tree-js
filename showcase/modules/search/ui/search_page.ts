import { HubProvider, Sink } from "pipe_x";
import {
  Column,
  CrossAxisAlignment,
  EdgeInsets,
  FontWeight,
  GridView,
  Padding,
  Text,
  type UIComponent,
} from "../../../../src";
import { go } from "../../../app/navigation";
import { nfText } from "../../../common/theme/nf_theme";
import { asyncView } from "../../../common/ui/async_view";
import { NfEmpty } from "../../../common/ui/nf_status";
import { NfField } from "../../../common/ui/nf_field";
import { Poster } from "../../../common/ui/poster";
import type { Show } from "../../browse/domain/show";
import { SearchHub } from "../application/search_hub";

function resultGrid(shows: Show[]): UIComponent {
  if (shows.length === 0) {
    return NfEmpty("Search for a show to get started.");
  }
  return Padding({
    padding: EdgeInsets.symmetric({ horizontal: 24, vertical: 8 }),
    child: GridView.count({
      crossAxisCount: 6,
      childAspectRatio: 130 / 195,
      crossAxisSpacing: 12,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      children: shows.map((show) =>
        Poster({
          id: show.id,
          name: show.name,
          image: show.poster,
          onTap: () => go(`/title/${show.id}`),
        }),
      ),
    }),
  });
}

export function searchPage() {
  return HubProvider({
    create: () => new SearchHub(),
    child: (hub) =>
      Column({
        gap: 12,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding({
            padding: EdgeInsets.only({ left: 60, right: 24, top: 84 }),
            child: Text({
              text: "Search",
              style: nfText({ size: 28, weight: FontWeight.w700 }),
            }),
          }),
          Padding({
            padding: EdgeInsets.symmetric({ horizontal: 60 }),
            child: NfField({
              placeholder: "Titles, people, genres",
              onChanged: (value) => {
                hub.query.value = value;
              },
            }),
          }),
          Sink({
            pipe: hub.results,
            builder: (value) =>
              hub.query.value.trim().length === 0
                ? NfEmpty("Type a name to search the TVMaze catalog.")
                : asyncView(value, (shows) => resultGrid(shows), () => void hub.results.refresh()),
          }),
        ],
      }),
  });
}
