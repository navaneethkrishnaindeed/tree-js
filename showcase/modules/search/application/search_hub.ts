import { Hub } from "pipe_x";
import { tvmaze } from "../../browse/infrastructure/tvmaze_client";

export class SearchHub extends Hub {
  readonly query = this.pipe("", { key: "query" });
  readonly results;
  private debounce?: number;

  constructor() {
    super();
    this.results = this.asyncPipe(
      async () => {
        const q = this.query.value.trim();
        if (!q) {
          return [];
        }
        return tvmaze.search(q);
      },
      { key: "results", immediate: false },
    );
    this.query.addListener(() => {
      window.clearTimeout(this.debounce);
      this.debounce = window.setTimeout(() => {
        if (!this.disposed) {
          void this.results.refresh();
        }
      }, 350);
    });
  }

  protected override onDispose(): void {
    window.clearTimeout(this.debounce);
  }
}
