export const FloatingActionButtonLocation = {
  endFloat: "endFloat",
  centerFloat: "centerFloat",
  startFloat: "startFloat",
  endDocked: "endDocked",
  centerDocked: "centerDocked",
} as const;

export type FloatingActionButtonLocation =
  (typeof FloatingActionButtonLocation)[keyof typeof FloatingActionButtonLocation];
