export type Result<T, E> = { tag: "ok"; val: T } | { tag: "err"; err: E };

export const ok = <T>(val: T): Result<T, never> => ({ tag: "ok", val });
export const err = <E>(err: E): Result<never, E> => ({ tag: "err", err });
