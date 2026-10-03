import { Hub } from "pipe_x";
import { loadMyList, saveMyList } from "../infrastructure/my_list_store";

export class MyListHub extends Hub {
  readonly ids = this.pipe<number[]>(loadMyList().ids, { key: "ids" });
  readonly continueId = this.pipe<number | null>(loadMyList().continueId, {
    key: "continueId",
  });

  constructor() {
    super();
    const persist = (): void => {
      saveMyList({ ids: this.ids.value, continueId: this.continueId.value });
    };
    this.ids.addListener(persist);
    this.continueId.addListener(persist);
  }

  contains(id: number): boolean {
    return this.ids.value.includes(id);
  }

  toggle(id: number): void {
    if (this.contains(id)) {
      this.ids.value = this.ids.value.filter((item) => item !== id);
      return;
    }
    this.ids.value = [id, ...this.ids.value];
  }

  markWatched(id: number): void {
    this.continueId.value = id;
  }
}
