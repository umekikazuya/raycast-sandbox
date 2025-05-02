import { PromptId } from "../../../valueObjects/prompt/PromptId";
import { PromptKeyword } from "../../../valueObjects/prompt/PromptKeyword";
import { PromptBody } from "../../../valueObjects/prompt/PromptBody";
import { PromptCategory } from "../../../valueObjects/prompt/PromptCategory";
import { PromptType } from "../../../../shared/kernel/PromptType";

// Base domain event interface with readonly modifiers
export interface DomainEvent {
  readonly type: string;
  readonly aggregateId: PromptId;
  readonly occurredAt: Date;
}

// Prompt creation event
export interface PromptCreated extends DomainEvent {
  readonly type: "PromptCreated";
  readonly keyword: PromptKeyword;
  readonly body: PromptBody;
  readonly category: PromptCategory;
  readonly promptType: PromptType;
}

// Prompt keyword change event
export interface PromptKeywordChanged extends DomainEvent {
  readonly type: "PromptKeywordChanged";
  readonly oldKeyword: PromptKeyword;
  readonly newKeyword: PromptKeyword;
}

// Prompt body change event
export interface PromptBodyChanged extends DomainEvent {
  readonly type: "PromptBodyChanged";
  readonly newBody: PromptBody;
}

// Prompt category change event
export interface PromptCategoryChanged extends DomainEvent {
  readonly type: "PromptCategoryChanged";
  readonly newCategory: PromptCategory;
}

// Union type of all prompt events
export type PromptEvent = PromptCreated | PromptKeywordChanged | PromptBodyChanged | PromptCategoryChanged;
