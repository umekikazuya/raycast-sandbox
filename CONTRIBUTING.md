# Coding Practices – Raycast Prompt Manager  
## _React × TypeScript • FP • DDD • SOLID • Immutable‑First_

## 0. Scope & Goals
- **Audience:** Individual developer aiming to level up coding skills through this project
- **Goal:** Provide a practical learning path to advanced architectural patterns while building a functional product

## 1. Core Principles & Learning Path

### 1.1 Functional Programming (FP) - Learning Journey
| Level | Focus | Implementation |
|-------|-------|----------------|
| **Beginner** | Pure functions, basic immutability | Use `const`, avoid mutations, separate side effects |
| **Intermediate** | Composition, Result/Either pattern | Implement `map`, `chain` for Results, introduce pipe pattern |
| **Advanced** | Advanced composition, monadic approach | Full FP implementation with proper error handling chains |

### 1.2 Domain-Driven Design (DDD) - Practical Implementation
- **Start Simple**: Begin with basic Value Objects and Entities
- **Evolve Gradually**: Introduce event sourcing for one aggregate first
- **Learn by Doing**: Implement one pattern fully before moving to the next

### 1.3 Test-Driven Development (TDD) - Growth Strategy
- Start with simple unit tests for pure functions
- Gradually introduce property-based testing
- Aim for test coverage that gives confidence, not just metrics

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

## 3. Practical Implementation Strategy

| Phase | Focus | Goal |
|-------|-------|------|
| **Foundation** | Basic typed entities, value objects | Get working MVP with type safety |
| **Refinement** | Proper domain events, CQRS basics | Improve domain logic integrity |
| **Mastery** | Full event sourcing, FP patterns | Complete architectural vision |

## 4. Domain Layer - Evolutionary Approach

### 4.1 Value Objects - Start Simple and Evolve
```ts
// Phase 1: Basic validation
export const createPromptKeyword = (raw: string): Result<PromptKeyword, ValidationErr> => {
  if (!raw.trim()) return err({ kind: "EmptyKeyword" });
  return ok(raw as PromptKeyword);
};

// Phase 2: More robust implementation with RORO
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

### 4.2 Event Sourcing - Progressive Implementation
```ts
// Phase 1: Simple aggregate with basic methods
interface Prompt {
  id: PromptId;
  keyword: PromptKeyword;
  // ...other fields
  
  updateKeyword(newKeyword: string): Result<Prompt, ValidationErr>;
}

// Phase 2: Event-sourced aggregate
type PromptEvent =
  | { type: "PromptCreated"; id: PromptId; keyword: PromptKeyword; /* ... */ }
  | { type: "KeywordChanged"; id: PromptId; oldKeyword: PromptKeyword; newKeyword: PromptKeyword };

// Reconstruction function - Phase 2
export const replayPrompt = (events: PromptEvent[]): Prompt | null => {
  // Implementation details
};
```

## 5. Application Layer - Build Up Complexity

```ts
// Phase 1: Simple use case
export const updatePromptKeyword = async (
  id: PromptId,
  newKeyword: string,
  repository: PromptRepository
): Promise<Result<Prompt, AppError>> => {
  // Simple implementation
};

// Phase 2: More FP-style approach with RORO
export const updatePromptKeywordUseCase = ({
  promptRepository
}: {
  promptRepository: PromptRepository;
}) => async ({
  id,
  newKeyword
}: {
  id: PromptId;
  newKeyword: string;
}): Promise<Result<Prompt, AppErr>> => {
  // More advanced implementation
};

// Phase 3: Full event-sourcing + FP implementation
export const updatePromptKeywordUseCase = ({
  eventStore
}: {
  eventStore: EventStore;
}) => async ({
  id,
  newKeyword
}: {
  id: PromptId;
  newKeyword: string;
}): Promise<Result<Prompt, AppErr>> => {
  // Event sourcing implementation with pipe, map, chain
};
```

## 6. UI Layer - Evolving Component Design

### 6.1 Container/Presentation Separation - Step by Step
```tsx
// Phase 1: Simple component
export const PromptList: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  // Mixed concerns - data fetching and presentation
  
  return (
    <List>
      {prompts.map(prompt => (
        <List.Item key={prompt.id} title={prompt.keyword} />
      ))}
    </List>
  );
};

// Phase 2: Separated concerns
// Presentational Component
const PromptListView: React.FC<{
  prompts: Prompt[];
  onSelect: (prompt: Prompt) => void;
  isLoading: boolean;
}> = ({ prompts, onSelect, isLoading }) => {
  // Pure presentation logic
};

// Container Component
export const PromptListContainer: React.FC = () => {
  // Data fetching and state management
};
```

## 7. Testing Strategy - Progressive Approach

| Phase | Focus | Example |
|-------|-------|---------|
| 1 | Test critical functions | Value object validations, core business logic |
| 2 | Test key application flows | Complete use cases with mocked dependencies |
| 3 | Add comprehensive testing | Property-based tests, more edge cases |

```ts
// Phase 1: Basic unit test
describe('createPromptKeyword', () => {
  it('rejects empty keywords', () => {
    const result = createPromptKeyword({ raw: '' });
    expect(result.tag).toBe('err');
  });
});

// Phase 3: Property-based testing
import * as fc from 'fast-check';

describe('Prompt aggregate', () => {
  it('maintains invariants through state changes', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.length > 0 && s.length <= 100),
        fc.string().filter(s => s.length > 0 && s.length <= 100),
        (initial, updated) => {
          const prompt = createPrompt({ keyword: initial, /* other fields */ });
          const updatedPrompt = prompt.updateKeyword(updated);
          
          return updatedPrompt.tag === 'ok' && 
                 updatedPrompt.val.keyword === updated;
        }
      )
    );
  });
});
```

## 8. Personal Development Goals

Advancing through these patterns will help you:

1. **Technical Growth**: Master advanced patterns in TypeScript and functional programming
2. **Architecture Skills**: Learn DDD and CQRS practically, not just theoretically
3. **Testing Expertise**: Develop a strong testing discipline
4. **Code Quality**: Write more maintainable, robust code

## 9. Progress Tracking

Track your improvement with these milestones:

- [ ] Implement all value objects with proper validation
- [ ] Convert one aggregate to use immutable update patterns
- [ ] Add event sourcing to one aggregate root
- [ ] Implement CQRS pattern for read/write separation
- [ ] Write comprehensive tests for domain layer
- [ ] Refactor UI layer to use container/presentation pattern

## 10. Definition of Done

For each learning component:

- The code works and solves the business problem
- You understand why the pattern is beneficial
- You can explain the concept clearly
- Tests validate the implementation
