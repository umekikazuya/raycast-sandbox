export type Result<T, E> = { tag: "ok"; val: T } | { tag: "err"; err: E };

export const ok = <T>(val: T): Result<T, never> => ({ tag: "ok", val });
export const err = <E>(err: E): Result<never, E> => ({ tag: "err", err });

export const isOk = <T, E>(r: Result<T, E>): r is { tag: "ok"; val: T } => r.tag === "ok";
export const isErr = <T, E>(r: Result<T, E>): r is { tag: "err"; err: E } => r.tag === "err";

export const map = <T, E, U>(r: Result<T, E>, fn: (val: T) => U): Result<U, E> => (isOk(r) ? ok(fn(r.val)) : r);

export const flatMap = <T, E, U>(r: Result<T, E>, fn: (val: T) => Result<U, E>): Result<U, E> =>
  isOk(r) ? fn(r.val) : r;

export const chain =
  <T, U, E>(f: (t: T) => Result<U, E>) =>
  (r: Result<T, E>): Result<U, E> =>
    r.tag === "ok" ? f(r.val) : (r as unknown as Result<U, E>);

// 複数の関数をチェーンする汎用的なパイプライン関数
export const pipe =
  <T, E>(...fns: Array<(a: T) => Result<T, E>>) =>
  (a: T): Result<T, E> =>
    fns.reduce((acc, fn) => (acc.tag === "ok" ? fn(acc.val) : acc), ok(a) as Result<T, E>);
