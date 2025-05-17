import { createPromptAggregate, CreatePromptInput, PromptAggregate, replayPrompt } from "../../domain/entities/prompt/PromptAggregate";
import { err, ok, Result } from "../../shared/kernel/result";
import { EventStorePortFns, EventStoreState } from "../events/eventStore";

export const handleCreate =
  (eventStore: EventStorePortFns) =>
  (
    state: EventStoreState,
    input: CreatePromptInput
  ): Result<{ state: EventStoreState; aggregate: PromptAggregate }, string> =>
{
  // 1) ビジネスロジック：Aggregate + Event 生成
  const aggrRes = createPromptAggregate(input);
  if (aggrRes.tag === "err") return err(aggrRes.err.kind);

  const { aggregate, event } = aggrRes.val;

  // 2) EventStore へ append（イミュータブルに次 state）
  const appended = eventStore.append(state, [event]);
  if (appended.tag === "err") return err(appended.err);

  // 3) 実際にリプレイして整合性チェック（optional）
  const loaded  = eventStore.load(appended.val, aggregate.id);
  if (loaded.tag === "err") return err(loaded.err);

  const rebuilt = replayPrompt(loaded.val);
  if (!rebuilt) return err("replay failed");

  return ok({ state: appended.val, aggregate: rebuilt });
};
