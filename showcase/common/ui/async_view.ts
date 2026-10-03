import type { AsyncValue } from "pipe_x";
import type { Mountable } from "pipe_x";
import { NfError, NfLoading } from "./nf_status";

export function asyncView<T>(
  value: AsyncValue<T>,
  data: (value: T) => Mountable,
  onRetry?: () => void,
): Mountable {
  return value.when({
    loading: () => NfLoading(),
    data,
    onError: (error) =>
      NfError({
        message: error instanceof Error ? error.message : String(error),
        onRetry,
      }),
  });
}
