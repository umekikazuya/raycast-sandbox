import { DomainEvent } from "../../domain/events/domainEvent";
import { Result } from "../../shared/kernel/result";

export type EventStoreState = ReadonlyMap<string, readonly DomainEvent[]>;

export interface EventStorePortFns {
  append: (state: EventStoreState, events: readonly DomainEvent[]) => Result<EventStoreState, string>;

  load: (state: EventStoreState, id: string) => Result<readonly DomainEvent[], string>;
}
