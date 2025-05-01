# Raycast Prompt Manager Architecture Guide
_React × TypeScript • FP • DDD • SOLID • Immutable‑First_

## 0. Purpose and Priorities

- **Purpose**: Guidelines for building a robust application implementable in individual development
- **Priorities**: 
  1. **Quality** - Ensuring type safety and maintainability
  2. **Learning** - Gradually learning better architectural patterns
  3. **Speed** - Delivering value in a timely manner without excessive complexity

## 1. Core Principles

### 1.1 Pragmatic Functional Approach
| Rule | Rationale |
|------|-----------|
| **Pure‑Functions‑First** | Deterministic code is easier to test and reason about. |
| **Immutable Data** | Prevents hidden state mutation across React renders and async tasks. |
| **Side‑Effect Isolation** | All I/O lives in the _Infrastructure Layer_ and is deferred via async/await. |
| **Type Safety** | Branded types + exhaustive unions prevent illegal states. |

### 1.2 Practical DDD
- **Value Objects vs. Entities** — VOs are immutable & compared by value; Entities by identity. 
- **Aggregates** — Enforce invariants via a single root, but keep them simple.
- **Repositories** — Pure interfaces; no framework types leak in/out.
- **Event Sourcing** — Apply where it adds value; start simply and evolve.

### 1.3 Phased Development Approach
- **Phase 0**: Basic functionality and minimal event sourcing (single aggregate)
- **Phase 1**: More robust domain model and application of CQRS pattern
- **Phase 2**: Complete event sourcing + snapshot functionality

## 2. Core Type Toolkit

```ts
// Brand helper
type Brand<T, B> = T & { readonly _brand: B };
// Samples
type PromptId = Brand<string, "PromptId">;
type PromptKeyword = Brand<string, "PromptKeyword">;

// Result + helpers (Either monad–light)
export type Result<T, E> = { tag: "ok"; val: T } | { tag: "err"; err: E };
export const ok  = <T>(val: T): Result<T, never> => ({ tag: "ok", val });
export const err = <E>(err: E): Result<never, E> => ({ tag: "err", err });
export const map   = <T,U,E>(f:(t:T)=>U)=>(r:Result<T,E>):Result<U,E> =>
  r.tag==="ok" ? ok(f(r.val)) : r;
export const chain = <T,U,E>(f:(t:T)=>Result<U,E>)=>(r:Result<T,E>):Result<U,E> =>
  r.tag==="ok" ? f(r.val) : r;
```

## 3. Immutable-First Principles

| Guideline | Implementation |
|-----------|----------------|
| No Runtime Mutation | Return new objects via spread/Object.assign |
| Structural Sharing | Only spread/object rest; never .push, .splice. |
| Entity Updates | Return a new object via pure functions; never mutate in place. |
| React Components | Use useState/useReducer with proper state updates |

## 4. Domain Layer

### 4.1 ValueObjects (RORO)
```ts
// Safe ValueObject using TypeScript's type system
export const createPromptKeyword = ({ raw }: { raw: string }): Result<PromptKeyword, ValidationErr> => {
  if (!raw || raw.trim().length === 0) {
    return err({ kind: "EmptyKeyword" });
  }
  
  if (raw.length > 100) {
    return err({ kind: "KeywordTooLong", max: 100, actual: raw.length });
  }
  
  return ok(raw as PromptKeyword);
};
```

### 4.2 Event-Sourced Aggregate (Phase 0 Implementation)
```ts
// PromptEvent definition
export type PromptEvent =
  | { type: "PromptCreated"; id: PromptId; keyword: PromptKeyword; body: string; category: string; timestamp: Date }
  | { type: "PromptKeywordChanged"; id: PromptId; oldKeyword: PromptKeyword; newKeyword: PromptKeyword; timestamp: Date };

// State reconstruction function
export const replayPrompt = (events: PromptEvent[]): Prompt | null => {
  if (events.length === 0) return null;
  
  const initialEvent = events[0];
  if (initialEvent.type !== "PromptCreated") {
    throw new Error("First event must be PromptCreated");
  }
  
  // Reconstruct state from events
  return events.reduce((prompt, event) => {
    switch (event.type) {
      case "PromptCreated":
        return {
          id: event.id,
          keyword: event.keyword,
          body: event.body,
          category: event.category,
          createdAt: event.timestamp,
          updatedAt: event.timestamp
        };
      case "PromptKeywordChanged":
        return {
          ...prompt!,
          keyword: event.newKeyword,
          updatedAt: event.timestamp
        };
      default:
        return prompt;
    }
  }, null as Prompt | null);
};

// Command function (generates new events)
export const changePromptKeyword = (
  prompt: Prompt,
  newKeyword: string
): Result<PromptEvent, ValidationErr> => {
  const keywordResult = createPromptKeyword({ raw: newKeyword });
  if (keywordResult.tag === "err") {
    return keywordResult;
  }
  
  if (prompt.keyword === keywordResult.val) {
    return err({ kind: "NoChangeDetected" });
  }
  
  return ok({
    type: "PromptKeywordChanged",
    id: prompt.id,
    oldKeyword: prompt.keyword,
    newKeyword: keywordResult.val,
    timestamp: new Date()
  });
};
```

## 5. Application Layer

```ts
// Simple use case implementation
export const updatePromptKeywordUseCase = ({
  eventStore,
  promptRepository
}: {
  eventStore: EventStore;
  promptRepository: PromptRepository;
}) => async ({
  id,
  newKeyword
}: {
  id: PromptId;
  newKeyword: string;
}): Promise<Result<Prompt, AppErr>> => {
  // 1. Get events
  const eventsResult = await eventStore.getEvents({ promptId: id });
  if (eventsResult.tag === "err") {
    return err({ kind: "StorageError", cause: eventsResult.err });
  }
  
  if (eventsResult.val.length === 0) {
    return err({ kind: "NotFoundError", id });
  }
  
  // 2. Reconstruct state
  const prompt = replayPrompt(eventsResult.val);
  if (!prompt) {
    return err({ kind: "CorruptedStateError", id });
  }
  
  // 3. Generate new event
  const changeEvent = changePromptKeyword(prompt, newKeyword);
  if (changeEvent.tag === "err") {
    return err({ kind: "ValidationError", cause: changeEvent.err });
  }
  
  // 4. Save event
  const saveResult = await eventStore.appendEvent({
    promptId: id,
    event: changeEvent.val
  });
  
  if (saveResult.tag === "err") {
    return err({ kind: "StorageError", cause: saveResult.err });
  }
  
  // 5. Return updated state
  const updatedPrompt = replayPrompt([...eventsResult.val, changeEvent.val]);
  return ok(updatedPrompt!);
};
```

## 6. Infrastructure

### 6.1 Event Store Interface
```ts
export interface EventStore {
  getEvents({ promptId }: { promptId: PromptId }): Promise<Result<PromptEvent[], StorageErr>>;
  appendEvent({ promptId, event }: { promptId: PromptId; event: PromptEvent }): Promise<Result<void, StorageErr>>;
}
```

### 6.2 In-Memory Implementation (Phase 0)
```ts
export class InMemoryEventStore implements EventStore {
  private events: Record<string, PromptEvent[]> = {};

  async getEvents({ promptId }: { promptId: PromptId }): Promise<Result<PromptEvent[], StorageErr>> {
    return ok(this.events[promptId as string] || []);
  }

  async appendEvent({ promptId, event }: { promptId: PromptId; event: PromptEvent }): Promise<Result<void, StorageErr>> {
    const existingEvents = this.events[promptId as string] || [];
    this.events[promptId as string] = [...existingEvents, event];
    return ok(undefined);
  }
}
```

### 6.3 Dependency Provision
```tsx
// React Context Provider
export const AppContext = createContext<{
  eventStore: EventStore;
  promptRepository: PromptRepository;
}>({} as any);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create instances as singletons
  const eventStore = useMemo(() => new InMemoryEventStore(), []);
  const promptRepository = useMemo(() => new LocalStoragePromptRepository(), []);
  
  return (
    <AppContext.Provider value={{ eventStore, promptRepository }}>
      {children}
    </AppContext.Provider>
  );
};
```

## 7. UI Layer

### 7.1 Container/Presentation Separation
```tsx
// Presentational Component (display only)
const PromptListView: React.FC<{
  prompts: Prompt[];
  onSelect: (prompt: Prompt) => void;
  isLoading: boolean;
}> = ({ prompts, onSelect, isLoading }) => {
  if (isLoading) {
    return <List isLoading />;
  }
  
  return (
    <List>
      {prompts.map(prompt => (
        <List.Item
          key={prompt.id}
          title={prompt.keyword}
          subtitle={prompt.category}
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => onSelect(prompt)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

// Container Component (logic and data retrieval)
export const PromptListContainer: React.FC = () => {
  const { eventStore } = useContext(AppContext);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useNavigation();
  
  useEffect(() => {
    const loadPrompts = async () => {
      // Logic to fetch all data from event store
      // ...
      setIsLoading(false);
    };
    
    loadPrompts();
  }, [eventStore]);
  
  const handleSelect = (prompt: Prompt) => {
    push(<DetailScreen prompt={prompt} />);
  };
  
  return (
    <PromptListView
      prompts={prompts}
      onSelect={handleSelect}
      isLoading={isLoading}
    />
  );
};
```

## 8. Error Handling

```ts
// Error type definitions
export type ValidationErr =
  | { kind: "EmptyKeyword" }
  | { kind: "KeywordTooLong"; max: number; actual: number }
  | { kind: "NoChangeDetected" };

export type StorageErr =
  | { kind: "NotFound" }
  | { kind: "NetworkError"; cause?: Error };

export type AppErr =
  | { kind: "ValidationError"; cause: ValidationErr }
  | { kind: "StorageError"; cause: StorageErr }
  | { kind: "NotFoundError"; id: PromptId }
  | { kind: "CorruptedStateError"; id: PromptId };

// Error message mapping
export const getErrorMessage = (error: AppErr): string => {
  switch (error.kind) {
    case "ValidationError":
      switch (error.cause.kind) {
        case "EmptyKeyword":
          return "Please enter a keyword";
        case "KeywordTooLong":
          return `Keyword must be less than ${error.cause.max} characters (current: ${error.cause.actual} characters)`;
        case "NoChangeDetected":
          return "No changes detected";
      }
      break;
    case "NotFoundError":
      return `Prompt not found (ID: ${error.id})`;
    case "CorruptedStateError":
      return "The prompt state is corrupted";
    case "StorageError":
      return "Error occurred during data save or retrieval";
  }
};
```

## 9. Testing Strategy

### 9.1 Domain Layer Tests
```ts
describe('changePromptKeyword', () => {
  it('changes keyword successfully', () => {
    const prompt = {
      id: 'test-id' as PromptId,
      keyword: 'old-keyword' as PromptKeyword,
      body: 'test body',
      category: 'test',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = changePromptKeyword(prompt, 'new-keyword');
    expect(result.tag).toBe('ok');
    if (result.tag === 'ok') {
      expect(result.val.type).toBe('PromptKeywordChanged');
      expect(result.val.newKeyword).toBe('new-keyword');
      expect(result.val.oldKeyword).toBe('old-keyword');
    }
  });
  
  it('returns error for empty keyword', () => {
    const prompt = {
      id: 'test-id' as PromptId,
      keyword: 'old-keyword' as PromptKeyword,
      body: 'test body',
      category: 'test',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = changePromptKeyword(prompt, '');
    expect(result.tag).toBe('err');
    if (result.tag === 'err') {
      expect(result.err.kind).toBe('EmptyKeyword');
    }
  });
});
```

### 9.2 Event Sourcing Tests
```ts
describe('replayPrompt', () => {
  it('correctly reconstructs state from events', () => {
    const events: PromptEvent[] = [
      {
        type: 'PromptCreated',
        id: 'test-id' as PromptId,
        keyword: 'initial-keyword' as PromptKeyword,
        body: 'test body',
        category: 'test',
        timestamp: new Date(2023, 1, 1)
      },
      {
        type: 'PromptKeywordChanged',
        id: 'test-id' as PromptId,
        oldKeyword: 'initial-keyword' as PromptKeyword,
        newKeyword: 'updated-keyword' as PromptKeyword,
        timestamp: new Date(2023, 1, 2)
      }
    ];
    
    const prompt = replayPrompt(events);
    expect(prompt).not.toBeNull();
    expect(prompt?.keyword).toBe('updated-keyword');
    expect(prompt?.updatedAt).toEqual(new Date(2023, 1, 2));
  });
  
  it('returns null for empty events', () => {
    const prompt = replayPrompt([]);
    expect(prompt).toBeNull();
  });
});
```

## 10. Implementation Plan

### Phase 0: Minimal Implementation (Current)
- Combined use of InMemoryEventStore and LocalStoragePromptRepository
- Basic event types (PromptCreated, PromptKeywordChanged)
- Simple CQRS pattern (event sourcing for command side only)

### Phase 1: CQRS Extension
- Complete separation of read models
- Event-based approach for all commands
- Enhanced error handling

### Phase 2: Full Event Sourcing
- Introduction of snapshots
- Gradual migration to LocalStorage implementation
- Performance optimization

## 11. Definition of Done ✅
- Value Objects are type-safe and immutable (Readonly<T> or explicit immutable implementation)
- Domain layer contains no side effects (pure functions only)
- All commands generate events
- Safety ensured through unit tests
