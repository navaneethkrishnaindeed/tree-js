import { Hub, read } from "pipe_x";
import { tvmaze } from "../../browse/infrastructure/tvmaze_client";
import { MyListHub } from "./my_list_hub";

export class MyListPageHub extends Hub {
  readonly items;
  readonly continueWatching;
  private readonly onIds = (): void => {
    void this.items.refresh();
  };
  private readonly onContinue = (): void => {
    void this.continueWatching.refresh();
  };

  constructor() {
    super();
    const list = read(MyListHub);
    this.items = this.asyncPipe(() => tvmaze.showsByIds(list.ids.value), { key: "items" });
    this.continueWatching = this.asyncPipe(async () => {
      const id = list.continueId.value;
      if (id == null) {
        return null;
      }
      try {
        return await tvmaze.show(id);
      } catch {
        return null;
      }
    }, { key: "continueWatching" });
    list.ids.addListener(this.onIds);
    list.continueId.addListener(this.onContinue);
  }

  protected override onDispose(): void {
    const list = read(MyListHub);
    list.ids.removeListener(this.onIds);
    list.continueId.removeListener(this.onContinue);
  }
}
