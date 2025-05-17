import { EventStorePortFns, EventStoreState } from "../../application/events/eventStore";
import { err, ok } from "../../shared/kernel/result";

export const InMemoryEventStoreFns: EventStorePortFns = {
  append: (state, events) => {
    if (events.length === 0) return ok(state);

    let next: EventStoreState = state;
    for (const ev of events) {
      if (!ev.aggregateId) return err("aggregateId is empty");
      const prev = next.get(ev.aggregateId) ?? [];
      next = new Map(next).set(ev.aggregateId, [...prev, structuredClone(ev)]);
    }
    return ok(next);
  },

  load: (state, id) => ok(state.get(id) ?? []),
};
