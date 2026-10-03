import { storageKeys } from "../../../infrastructure/config";
import { readJson, removeItem, writeJson } from "../../../infrastructure/storage";
import type { UserSession } from "../domain/session";

export function loadSession(): UserSession | null {
  return readJson<UserSession>(storageKeys.session) ?? null;
}

export function saveSession(session: UserSession): void {
  writeJson(storageKeys.session, session);
}

export function clearSession(): void {
  removeItem(storageKeys.session);
}
