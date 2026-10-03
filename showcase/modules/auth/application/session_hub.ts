import { Hub } from "pipe_x";
import type { UserSession } from "../domain/session";
import { clearSession, loadSession, saveSession } from "../infrastructure/session_store";

export class SessionHub extends Hub {
  readonly user = this.pipe<UserSession | null>(loadSession(), { key: "user" });

  get isSignedIn(): boolean {
    return this.user.value !== null;
  }

  signIn(email: string): void {
    const name = email.includes("@") ? email.slice(0, email.indexOf("@")) : email;
    const session: UserSession = { email, name };
    saveSession(session);
    this.user.value = session;
  }

  signOut(): void {
    clearSession();
    this.user.value = null;
  }
}
