export const EVENT_TYPE = "prompt.created" as const;

export type PromptCreated = {
  type: typeof EVENT_TYPE;
  aggregateId: string;
  keyword: string;
  body: string;
  category: string;
  occurredAt: string;
};

export const makePromptCreated = (payload: Omit<PromptCreated, "type">): PromptCreated => {
  return {
    type: EVENT_TYPE,
    ...payload,
  };
};
