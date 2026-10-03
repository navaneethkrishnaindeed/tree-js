import { Hub, read } from "pipe_x";
import { tvmaze } from "../../browse/infrastructure/tvmaze_client";
import { MyListHub } from "../../mylist/application/my_list_hub";

export class WatchHub extends Hub {
  readonly details;
  readonly mode = this.pipe<"trailer" | "sample">("trailer", { key: "mode" });

  constructor(readonly showId: number) {
    super();
    this.details = this.asyncPipe(() => tvmaze.showDetails(showId), { key: "details" });
    read(MyListHub).markWatched(showId);
  }
}
