import { storageKeys } from "../../../infrastructure/config";
import { readJson, writeJson } from "../../../infrastructure/storage";
import type { MyListState } from "../domain/my_list";

const empty: MyListState = { ids: [], continueId: null };

export function loadMyList(): MyListState {
  return readJson<MyListState>(storageKeys.myList) ?? empty;
}

export function saveMyList(state: MyListState): void {
  writeJson(storageKeys.myList, state);
}
