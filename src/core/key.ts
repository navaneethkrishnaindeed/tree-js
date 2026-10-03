export type Key = string | number | symbol;

export function ValueKey(value: string | number): Key {
  return value;
}

let uniqueSerial = 0;

export function UniqueKey(): Key {
  uniqueSerial += 1;
  return Symbol(`UniqueKey(${uniqueSerial})`);
}

const objectKeys = new WeakMap<object, Key>();

export function ObjectKey(value: object): Key {
  const existing = objectKeys.get(value);
  if (existing !== undefined) {
    return existing;
  }
  const key = Symbol("ObjectKey");
  objectKeys.set(value, key);
  return key;
}

export function readKey(node: { key?: Key; props?: { key?: Key } }): Key | undefined {
  if (node.key !== undefined) {
    return node.key;
  }
  return node.props?.key;
}
