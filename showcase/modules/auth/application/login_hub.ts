import { Hub, read } from "pipe_x";
import { go } from "../../../app/navigation";
import { SessionHub } from "./session_hub";

export class LoginHub extends Hub {
  readonly email = this.pipe("", { key: "email" });
  readonly password = this.pipe("", { key: "password" });
  readonly error = this.pipe<string | null>(null, { key: "error" });

  submit(): void {
    const email = this.email.value.trim();
    const password = this.password.value;
    const demo = email === "demo" && password === "demo";
    const valid = demo || (email.length > 0 && password.length >= 4);
    if (!valid) {
      this.error.value =
        "Enter an email and a password of at least 4 characters, or use demo / demo.";
      return;
    }
    this.error.value = null;
    read(SessionHub).signIn(demo ? "demo@netflix.local" : email);
    go("/browse");
  }
}
