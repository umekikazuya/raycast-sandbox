# Coding Practices Meta Prompt – Raycast Prompt Manager  
## _React × TypeScript • FP • DDD • SOLID • Immutable‑First_

## 0. Scope & Goals
- **Audience**  Front‑end & full‑stack engineers working on the Raycast Prompt Manager.  
- **Goal**  Provide an opinionated, copy‑paste‑ready guideline that stands up to GoF, SOLID, DDD, and Immutable critiques while remaining pragmatic for a modern React codebase.

## 1. Fundamental Principles

### 1.1 Functional Programming (FP)
| Rule | Rationale |
|------|-----------|
| **Pure‑Functions‑First** | Deterministic code is easier to test and reason about. |
| **Immutable Data** | Prevents hidden state mutation across React renders and async tasks. |
| **Side‑Effect Isolation** | All I/O lives in the _Infrastructure Layer_ and is deferred via Tasks. |
| **Type Safety** | Branded types + exhaustive unions prevent illegal states. |

### 1.2 Domain‑Driven Design (DDD)
- **Value Objects vs. Entities** — VOs are immutable & compared by value; Entities by identity.  
- **Aggregates** — Enforce invariants via a single root.  
- **Repositories** — Pure interfaces; no framework types leak in/out.  
- **Bounded Contexts** — Each `/context/*` folder may depend **inward only**; enforced by Arch tests.

### 1.3 Test‑Driven Development (TDD)
- _Red → Green → Refactor_ for every public function / hook.  
- Pyramidal coverage: **Unit > Integration > E2E**.  
- **Assert‑First** — Define expected `Result` early; drives design.

## 2. Core Type Toolkit

```ts
// Brand helper
type Brand<T, B> = T & { readonly _brand: B };
// Samples
type Money = Brand<number, "Money">;
type Email = Brand<string, "Email">;

// Result + helpers (Either monad–light)
export type Result<T, E> = { tag: "ok"; val: T } | { tag: "err"; err: E };
export const ok  = <T>(val: T): Result<T, never> => ({ tag: "ok", val });
export const err = <E>(err: E): Result<never, E> => ({ tag: "err", err });
export const map   = <T,U,E>(f:(t:T)=>U)=>(r:Result<T,E>):Result<U,E> =>
  r.tag==="ok" ? ok(f(r.val)) : r;
export const chain = <T,U,E>(f:(t:T)=>Result<U,E>)=>(r:Result<T,E>):Result<U,E> =>
  r.tag==="ok" ? f(r.val) : r;
```

## 3. Immutable‑First Doctrine

| Guideline | Enforcement |
|-----------|-------------|
| No Runtime Mutation | ts-immutable-readonly plugin + Object.freeze in dev builds. |
| Structural Sharing | Only spread/object rest; never .push, .splice. |
| Entity Updates | Return a new object via builder or event reducer; never mutate in place. |
| Third‑Party Guards | Wrap UI libs that mutate props; clone inputs before usage. |


## 4. Domain Layer

### 4.1 Value Objects (RORO)
```ts
export const createEmail = ({ raw }: { raw: string }): Result<Email, ValidationErr> =>
  raw.match(/.+@.+\..+/) ? ok(raw as Email) : err({ kind: "InvalidEmail", raw });
```

### 4.2 Event‑Sourced Aggregate (excerpt)
```ts
type PromptEvent =
  | { type: "Created"; id: PromptId; title: string }
  | { type: "TitleChanged"; id: PromptId; title: string };

const evolve = (s: Prompt | undefined, e: PromptEvent): Prompt =>
  e.type === "Created"
    ? { id: e.id, title: e.title, history: [] }
    : { ...s!, title: e.title, history: [...s!.history, e] };

export const replay = (events: PromptEvent[]) => events.reduce(evolve, undefined!);
```

## 5. Application Services (Use‑Cases)
```ts
export const executePrompt = ({
  aggregateRepo,
  executor,
}: {
  aggregateRepo: PromptRepository;          // DIP
  executor: PromptStrategy;
}) => async ({
  id,
  input,
}: {
  id: PromptId;
  input: string;
}): Task<Result<PromptOutput, DomainErr>> =>
  pipe(
    await aggregateRepo.findById({ id }),
    chain(executor.run(input)),
    map(output => ({ ...output, executedAt: new Date() }))
  );
```

- Receives an Object, Returns a Task`<Result<…>>` (RORO + async FP).
- Publishes PromptExecuted event to Outbox on success

## 6. Infrastructure & DI

| Layer | Contract | Notes |
|-------|----------|-------|
| Adapters | PromptRepository, PromptQueryService, HttpClient | Provide in‑memory & DynamoDB impls. |
| Provider | `<InfraProvider value={{ promptRepo, http }}>` | Inject at React root; tests swap with stubs. |
| HttpClient | get<T>(url, opts) / post<T> returns Task<Result<T, InfraErr>>. | |


## 7. React Integration

| Concern | Practice |
|---------|----------|
| RSC Split | Mark server‑only modules /** @server */; browser stubs throw. |
| Suspense + ErrorBoundary | Wrap each Container: `<Suspense fallback={<Loader/>}><PromptContainer/></Suspense>` plus `<PromptErrorBoundary>`. |
| Hooks | RORO signature; return { state, retry }. |
| Presentation‑Container | Containers only call Application Services & manage side‑effects; Presentations are pure JSX. |


## 8. Error Taxonomy

```ts
export type ValidationErr =
  | { kind: "NegativeAmount"; amount: number }
  | { kind: "InvalidEmail"; raw: string };

export type ConflictErr = { kind: "DuplicateTitle"; title: string };
export type InfraErr    = { kind: "Network"; reason: string };

export type DomainErr = ValidationErr | ConflictErr;
```

Map to: Domain ➜ HTTP ➜ UI message via a central errorMapper

## 9. Testing Strategy

| Level | Tooling | Focus |
|-------|---------|-------|
| Unit | vitest + fast‑check | Pure functions, aggregates. |
| Integration | dynamo‑local + msw | Repositories & adapters. |
| E2E | Playwright | Full browser flow; use stubbed infra for CI. |
| Arch Tests | ts‑query / ArchUnitTS | Enforce bounded‑context imports. |
| Mutation Tests | StrykerJS | Ensure branch coverage is meaningful. |


## 10. CI / Quality Gates
1. ESLint & Prettier with Immutable and Functional rule sets.
2. Type‑coverage ≥ 98% (typescript --noUncheckedIndexedAccess).
3. Arch Tests fail build on cross‑context import.
4. Mutation Testing score ≥ 70% lines survived.
5. Deep‑Freeze Guard in test env to catch accidental mutations.

## 11. Operational & Release Strategy

| Stage | Action |
|-------|--------|
| Alpha | Internal devs only; in‑memory repo. |
| Beta | Select org tenants; DynamoDB backend; feature flags. |
| GA | Global rollout; blue‑green deploy; canary metrics. |
| Maintenance | Weekly dependency updates; monthly audit + perf budget check. |


## 12. Definition of Done ✅
- All public APIs follow RORO and return Result/Task<Result>.
- ESLint passes with no @ts‑expect‑error in domain layer.
- At least one event‑sourced aggregate in production code.
- Error mapping table present & wired to <PromptErrorBoundary>.
- CI pipeline enforces all quality gates.

Ready for cynical review:
Every section above explicitly counters common criticisms from GoF, SOLID, DDD, and Immutable viewpoints while remaining implementable in a real‑world React × TypeScript repo.
