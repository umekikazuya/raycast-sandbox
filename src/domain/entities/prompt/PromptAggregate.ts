import { Result, err, ok } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";
import { makePromptBody, PromptBody, unwrapPromptBody } from "../../valueObjects/prompt/PromptBody";
import { makePromptCategory, PromptCategory, unwrapPromptCategory } from "../../valueObjects/prompt/PromptCategory";
import { makePromptId, PromptId, unwrapPromptId } from "../../valueObjects/prompt/PromptId";
import { makePromptKeyword, PromptKeyword, unwrapPromptKeyword } from "../../valueObjects/prompt/PromptKeyword";
import { EVENT_TYPE, makePromptCreated, PromptCreated } from "../../events/promptCreated";
import { DomainEvent } from "../../events/domainEvent";

export type PromptAggregate = Readonly<{
  id: PromptId;
  keyword: PromptKeyword;
  body: PromptBody;
  category: PromptCategory;
  createdAt: Date;
  updatedAt: Date;
}>;

export type CreatePromptInput = {
  id: string;
  keyword: string;
  body: string;
  category: string;
};

export function createPromptAggregate(
  input: CreatePromptInput,
): Result<{ aggregate: PromptAggregate; event: PromptCreated }, ValidationErr> {
  const idResult = makePromptId(input.id);
  const keywordResult = makePromptKeyword(input.keyword);
  const bodyResult = makePromptBody(input.body);
  const categoryResult = makePromptCategory(input.category);

  if (idResult.tag === "err") return err({ kind: "InvalidPromptId", raw: input.id });
  if (keywordResult.tag === "err") return err({ kind: "InvalidPromptKeyword", raw: input.keyword });
  if (bodyResult.tag === "err") return err({ kind: "InvalidPromptBody", raw: input.body });
  if (categoryResult.tag === "err") return err({ kind: "InvalidCategoryFormat", raw: input.category });

  const now = new Date();
  const aggregate: PromptAggregate = {
    id: idResult.val,
    keyword: keywordResult.val,
    body: bodyResult.val,
    category: categoryResult.val,
    createdAt: now,
    updatedAt: now,
  };

  const event = makePromptCreated({
    aggregateId: unwrapPromptId(aggregate.id),
    keyword: unwrapPromptKeyword(aggregate.keyword),
    body: unwrapPromptBody(aggregate.body),
    category: unwrapPromptCategory(aggregate.category),
    occurredAt: now.toISOString(),
  });
  return ok({ aggregate, event });
}

export const replayPrompt = (events: readonly DomainEvent[]): PromptAggregate | null => {
  let agg: PromptAggregate | null = null;

  for (const ev of events) {
    switch (ev.type) {
      case EVENT_TYPE:
        agg = applyPromptCreated(ev as PromptCreated);
        break;
      // @todo Implement other event types when needed
      // case "prompt.updated":
      //   if (agg) agg = applyPromptUpdated(agg, ev);
      //   break;
      // case "prompt.deleted":
      //   agg = null;
      //   break;
      default:
        console.warn(`Unexpected event type: ${ev.type}`);
        break;
    }
  }
  return agg;
};

const applyPromptCreated = (ev: PromptCreated): PromptAggregate => {
  const idResult = makePromptId(ev.aggregateId);
  const keywordResult = makePromptKeyword(ev.keyword);
  const bodyResult = makePromptBody(ev.body);
  const categoryResult = makePromptCategory(ev.category);

  if (idResult.tag === "err") throw new Error(`Invalid PromptId in event: ${ev.aggregateId}`);
  if (keywordResult.tag === "err") throw new Error(`Invalid PromptKeyword in event: ${ev.keyword}`);
  if (bodyResult.tag === "err") throw new Error(`Invalid PromptBody in event: ${ev.body}`);
  if (categoryResult.tag === "err") throw new Error(`Invalid PromptCategory in event: ${ev.category}`);

  return {
    id: idResult.val,
    keyword: keywordResult.val,
    body: bodyResult.val,
    category: categoryResult.val,
    createdAt: new Date(ev.occurredAt),
    updatedAt: new Date(ev.occurredAt),
  };
};

// const applyPromptUpdated = (agg: PromptAggregate, ev: PromptUpdated): PromptAggregate => ({
//   ...agg,
//   keyword: ev.keyword ?? agg.keyword,
//   body: ev.body ?? agg.body,
//   category: ev.category ?? agg.category,
//   updatedAt: ev.occurredAt
// });
