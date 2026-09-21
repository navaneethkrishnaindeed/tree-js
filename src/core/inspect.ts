export function omitUndefined(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );
}

export function formatProp(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "function") {
    return "Function";
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "inspect" in value &&
    typeof (value as { inspect: unknown }).inspect === "function"
  ) {
    return (value as { inspect: () => string }).inspect();
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatProp).join(", ")}]`;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function toTreeValue(value: unknown): unknown {
  if (
    typeof value === "object" &&
    value !== null &&
    "toTreeValue" in value &&
    typeof (value as { toTreeValue: unknown }).toTreeValue === "function"
  ) {
    return (value as { toTreeValue: () => unknown }).toTreeValue();
  }
  if (typeof value === "function") {
    return "[Function]";
  }
  return value;
}
