# pipe_x

Fine-grained reactive state for constructor + DOM UIs. Same architecture as the Flutter [pipe_x](https://pub.dev/packages/pipe_x) package: **Pipe**, **Hub**, **Sink**, **Well**.

This package does not depend on tree-js. `Sink` / `Well` take any `Mountable` (`mount` / `unmount`). tree-js `UIComponent` matches that shape.

```ts
import { Hub, HubProvider, Sink, Well, read } from "pipe_x";

class CounterHub extends Hub {
  readonly count = this.pipe(0, { key: "count" });
  increment() {
    this.count.value++;
  }
}

HubProvider({
  create: () => new CounterHub(),
  child: (hub) =>
    Column({
      children: [
        Sink({
          pipe: hub.count,
          builder: (value) => Text({ text: `${value}` }),
        }),
        Button({ text: "+", onPressed: () => hub.increment() }),
        Button({ text: "Reset", onPressed: () => read(CounterHub).reset() }),
      ],
    }),
});
```

**Pipe** holds a value. **Sink** remounts one slot when that pipe changes. **Well** remounts one slot when any of several pipes change. The rest of the page keeps its DOM nodes.

```ts
Well({
  pipes: [hub.firstName, hub.lastName, hub.age],
  builder: () =>
    Text({
      text: `${hub.firstName.value} ${hub.lastName.value}, ${hub.age.value}`,
    }),
});
```

`HubProvider.child` is a factory. JavaScript evaluates arguments immediately, so `child: CounterPage()` cannot see the hub yet.

Hubs are **local** by default: the last `Sink` / `Well` detaches, the provider unmounts, and the hub (and its pipes) dispose. The next visit creates a new hub at its initial values.

```ts
HubProvider({
  create: () => new CounterHub(),
  scope: "local", // default
  child: (hub) => CounterPage(hub),
});
```

A **global** hub survives route changes. Create it once on `Router` and reuse it with `scope: "global"`:

```ts
Router({
  hubs: { global: [() => new AuthHub()] },
  routes: [/* ... */],
});

HubProvider({
  create: () => new AuthHub(),
  scope: "global",
  child: (hub) => AccountPage(hub),
});
```

Globals dispose when the Router unmounts. `HubRuntime.obtain` / `release` is the same store `pipe_x` uses if you are not using tree-js.

Development graph (not part of the main export):

```bash
npm run dev:graph
```

```ts
import { inspect, PipeXDevOverlay } from "pipe_x/dev";

inspect(hub);
PipeXDevOverlay.mount(document.body);
```

`pipe.toGraph()` / `hub.toGraph()` and `debugDump()` are always available.
