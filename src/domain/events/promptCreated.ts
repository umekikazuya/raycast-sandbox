import { DomainEvent } from "./domainEvent";

export const EVENT_TYPE = "prompt.created" as const;

export interface PromptCreated extends DomainEvent {
  type: typeof EVENT_TYPE;
  keyword: string;
  body: string;
  category: string;
}

export const makePromptCreated = (payload: Omit<PromptCreated, "type">): PromptCreated => {
  return {
    type: EVENT_TYPE,
    ...payload,
  };
};
