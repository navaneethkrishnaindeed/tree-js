import {
  CrossAxisAlignment,
  CustomPaint,
  Offset,
  Row,
  Transform,
  type CustomPainter,
  type UIComponent,
} from "../../../src";
import { go } from "../../app/navigation";
import type { Show } from "../../modules/browse/domain/show";
import { MediaRail } from "./media_rail";
import { Poster } from "./poster";

function rankPainter(rank: number): CustomPainter {
  return (canvas, size) => {
    canvas.clearRect(0, 0, size.width, size.height);
    const fontSize = rank === 10 ? 140 : 180;
    canvas.font = `900 ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    canvas.textAlign = "right";
    canvas.textBaseline = "alphabetic";
    canvas.lineJoin = "round";
    canvas.miterLimit = 2;
    canvas.strokeStyle = "#8b8b8b";
    canvas.lineWidth = 6;
    canvas.strokeText(String(rank), size.width - 4, size.height - 8);
    canvas.fillStyle = "#141414";
    canvas.fillText(String(rank), size.width - 4, size.height - 8);
  };
}

function topTenItem(rank: number, show: Show): UIComponent {
  return Row({
    crossAxisAlignment: CrossAxisAlignment.end,
    children: [
      CustomPaint({
        width: rank === 10 ? 110 : 86,
        height: 176,
        painter: rankPainter(rank),
      }),
      Transform.translate({
        offset: Offset(-18, 0),
        child: Poster({
          id: show.id,
          name: show.name,
          image: show.poster,
          width: 122,
          height: 172,
          onTap: () => go(`/title/${show.id}`),
        }),
      }),
    ],
  });
}

export function TopTenRail(props: { title: string; shows: Show[] }): UIComponent {
  const items = props.shows.slice(0, 10).map((show, index) => topTenItem(index + 1, show));
  return MediaRail({
    title: props.title,
    height: 250,
    children: items,
  });
}
