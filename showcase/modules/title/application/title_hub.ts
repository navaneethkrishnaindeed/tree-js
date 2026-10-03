import { Hub } from "pipe_x";
import { tvmaze } from "../../browse/infrastructure/tvmaze_client";

export class TitleHub extends Hub {
  readonly details;

  constructor(readonly showId: number) {
    super();
    this.details = this.asyncPipe(() => tvmaze.showDetails(showId), { key: "details" });
  }
}
