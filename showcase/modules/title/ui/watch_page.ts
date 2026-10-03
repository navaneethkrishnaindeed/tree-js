import { HubProvider, Sink, Well } from "pipe_x";
import {
  Column,
  CrossAxisAlignment,
  EdgeInsets,
  Expanded,
  FontWeight,
  IFrame,
  Padding,
  Row,
  Text,
  Video,
} from "../../../../src";
import { sampleVideoUrl } from "../../../infrastructure/config";
import { go } from "../../../app/navigation";
import { nfText } from "../../../common/theme/nf_theme";
import { asyncView } from "../../../common/ui/async_view";
import { NfButton } from "../../../common/ui/nf_button";
import { WatchHub } from "../application/watch_hub";

function trailerSrc(name: string): string {
  const query = encodeURIComponent(`${name} official trailer`);
  return `https://www.youtube.com/embed?listType=search&list=${query}`;
}

export function watchPage(id: string) {
  const showId = Number.parseInt(id, 10);
  return HubProvider({
    create: () => new WatchHub(showId),
    child: (hub) =>
      Column({
        width: "100%",
        height: "100vh",
        children: [
          Well({
            pipes: [hub.details, hub.mode],
            builder: () => {
              const details = hub.details.dataOrNull;
              return Padding({
                padding: EdgeInsets.only({ left: 16, right: 16, top: 76, bottom: 12 }),
                child: Row({
                  gap: 12,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    NfButton({
                      text: "Back",
                      variant: "ghost",
                      onPressed: () => go(`/title/${showId}`),
                    }),
                    Text({
                      text: details?.name ?? "Watch",
                      style: nfText({ size: 18, weight: FontWeight.w700 }),
                    }),
                    NfButton({
                      text: hub.mode.value === "trailer" ? "Fallback" : "Trailer",
                      variant: "outline",
                      onPressed: () => {
                        hub.mode.value = hub.mode.value === "trailer" ? "sample" : "trailer";
                      },
                    }),
                  ],
                }),
              });
            },
          }),
          Expanded({
            child: Sink({
              pipe: hub.details,
              builder: (value) =>
                asyncView(
                  value,
                  (details) =>
                    Sink({
                      pipe: hub.mode,
                      builder: (mode) =>
                        mode === "trailer"
                          ? IFrame({
                              src: trailerSrc(details.name),
                              title: `${details.name} trailer`,
                            })
                          : Video({
                              src: sampleVideoUrl,
                              autoplay: true,
                              controls: true,
                              fit: "contain",
                            }),
                    }),
                  () => void hub.details.refresh(),
                ),
            }),
          }),
        ],
      }),
  });
}
