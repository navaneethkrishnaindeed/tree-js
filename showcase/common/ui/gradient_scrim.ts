import {
  Alignment,
  BoxDecoration,
  Container,
  IgnorePointer,
  LinearGradient,
  type UIComponent,
} from "../../../src";

export function GradientScrim(props: {
  begin?: Alignment;
  end?: Alignment;
  colors?: string[];
} = {}): UIComponent {
  return IgnorePointer({
    child: Container({
      width: "100%",
      height: "100%",
      decoration: BoxDecoration({
        gradient: LinearGradient({
          begin: props.begin ?? Alignment.bottomCenter,
          end: props.end ?? Alignment.topCenter,
          colors: props.colors ?? ["rgba(0,0,0,0.72)", "transparent"],
        }),
      }),
    }),
  });
}
