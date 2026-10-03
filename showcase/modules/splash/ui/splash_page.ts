import { HubListener, HubProvider, Sink, read } from "pipe_x";
import { Column, CrossAxisAlignment } from "../../../../src";
import { replace } from "../../../app/navigation";
import { IntroStage } from "../../../common/ui/intro_stage";
import { SessionHub } from "../../auth/application/session_hub";
import { SplashHub } from "../application/splash_hub";

export function splashPage() {
  return HubProvider({
    create: () => new SplashHub(),
    child: (hub) =>
      HubListener({
        hub,
        listenWhen: (current) => current.phase.value === "done",
        onConditionMet: () => {
          replace(read(SessionHub).isSignedIn ? "/browse" : "/login");
        },
        child: Column({
          height: "100%",
          width: "100%",
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Sink({
              pipe: hub.phase,
              builder: (phase) =>
                IntroStage({
                  phase,
                  onSkip: () => hub.skip(),
                }),
            }),
          ],
        }),
      }),
  });
}
