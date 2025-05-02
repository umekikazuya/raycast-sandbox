import { Result, chain, ok, pipe } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";
import { PromptBody, createPromptBody } from "../../valueObjects/prompt/PromptBody";
import { PromptType } from "../../../shared/kernel/PromptType";
import { createPromptKeyword, PromptKeyword } from "../../valueObjects/prompt/PromptKeyword";
import { PromptId } from "../../valueObjects/prompt/PromptId";
import { createPromptCategory, PromptCategory } from "../../valueObjects/prompt/PromptCategory";
import {
  PromptBodyChanged,
  PromptCategoryChanged,
  PromptCreated,
  PromptEvent,
  PromptKeywordChanged,
} from "./events/promptEvents";

export type PromptProps = Readonly<{
  id: PromptId;
  keyword: PromptKeyword;
  body: PromptBody;
  category: PromptCategory;
  type: PromptType;
  createdAt: Date;
  updatedAt: Date;
}>;

// Aggregate with its events (separating data and behavior)
export type PromptAggregate = Readonly<{
  props: PromptProps;
  events: ReadonlyArray<PromptEvent>;
}>;

export const createPromptAggregate = ({
  id,
  keyword,
  body,
  category,
  type,
}: Readonly<{
  id: PromptId;
  keyword: PromptKeyword;
  body: PromptBody;
  category: PromptCategory;
  type: PromptType;
}>): Result<PromptAggregate, ValidationErr> => {
  const now = new Date();

  const props: PromptProps = {
    id,
    keyword,
    body,
    category,
    type,
    createdAt: now,
    updatedAt: now,
  };

  const createdEvent: PromptCreated = {
    type: "PromptCreated",
    aggregateId: id,
    keyword,
    body,
    category,
    promptType: type,
    occurredAt: now,
  };

  return ok({
    props,
    events: [createdEvent],
  });
};

// Factory function to reconstruct from events (RORO)
export const rehydratePromptAggregate = ({
  events,
}: Readonly<{
  events: ReadonlyArray<PromptEvent>;
}>): Result<PromptAggregate, ValidationErr> => {
  if (events.length === 0) {
    return err({ kind: "EmptyEventStream" });
  }

  const firstEvent = events[0];
  if (firstEvent.type !== "PromptCreated") {
    return err({ kind: "InvalidEventStream", message: "First event must be PromptCreated" });
  }

  // Apply events through fold/reduce operation (functional approach)
  const props = events.reduce(applyEventToProps, {
    id: firstEvent.aggregateId,
    keyword: firstEvent.keyword,
    body: firstEvent.body,
    category: firstEvent.category,
    type: firstEvent.promptType,
    createdAt: firstEvent.occurredAt,
    updatedAt: firstEvent.occurredAt,
  });

  // Return a new aggregate with the reconstructed props and empty events list
  return ok({
    props,
    events: [],
  });
};

// ===== COMMAND FUNCTIONS =====

// Change keyword command (RORO, pure function)
export const changePromptKeyword = ({
  prompt,
  newKeyword,
}: Readonly<{
  prompt: PromptAggregate;
  newKeyword: string;
}>): Result<PromptAggregate, ValidationErr> => {
  // Use monadic composition with chain
  return chain((validKeyword: PromptKeyword) => {
    // Check if the keyword is actually different
    if (prompt.props.keyword === validKeyword) {
      return ok(prompt); // Return unchanged prompt if no change
    }

    // Create the event
    const event: PromptKeywordChanged = {
      type: "PromptKeywordChanged",
      aggregateId: prompt.props.id,
      oldKeyword: prompt.props.keyword,
      newKeyword: validKeyword,
      occurredAt: new Date(),
    };

    // Return new aggregate with updated props and appended event
    return ok({
      props: {
        ...prompt.props,
        keyword: validKeyword,
        updatedAt: event.occurredAt,
      },
      events: [...prompt.events, event],
    });
  })(createPromptKeyword({ raw: newKeyword }));
};

// Change body command (RORO, pure function)
export const changePromptBody = ({
  prompt,
  newBody,
}: Readonly<{
  prompt: PromptAggregate;
  newBody: string;
}>): Result<PromptAggregate, ValidationErr> => {
  // Use monadic composition with chain
  return chain((validBody: PromptBody) => {
    // Check if the body is actually different
    if (prompt.props.body === validBody) {
      return ok(prompt); // Return unchanged prompt if no change
    }

    // Create the event
    const event: PromptBodyChanged = {
      type: "PromptBodyChanged",
      aggregateId: prompt.props.id,
      newBody: validBody,
      occurredAt: new Date(),
    };

    // Return new aggregate with updated props and appended event
    return ok({
      props: {
        ...prompt.props,
        body: validBody,
        updatedAt: event.occurredAt,
      },
      events: [...prompt.events, event],
    });
  })(createPromptBody({ raw: newBody }));
};

// Change category command (RORO, pure function)
export const changePromptCategory = ({
  prompt,
  newCategory,
}: Readonly<{
  prompt: PromptAggregate;
  newCategory: string;
}>): Result<PromptAggregate, ValidationErr> => {
  // Use monadic composition with chain
  return chain((validCategory: PromptCategory) => {
    // Check if the category is actually different
    if (prompt.props.category === validCategory) {
      return ok(prompt); // Return unchanged prompt if no change
    }

    // Create the event
    const event: PromptCategoryChanged = {
      type: "PromptCategoryChanged",
      aggregateId: prompt.props.id,
      newCategory: validCategory,
      occurredAt: new Date(),
    };

    // Return new aggregate with updated props and appended event
    return ok({
      props: {
        ...prompt.props,
        category: validCategory,
        updatedAt: event.occurredAt,
      },
      events: [...prompt.events, event],
    });
  })(createPromptCategory({ raw: newCategory }));
};

// ===== QUERY FUNCTIONS =====

// Get a value indicating if the prompt has been modified
export const hasBeenModified = (prompt: PromptAggregate): boolean => {
  return prompt.props.createdAt.getTime() !== prompt.props.updatedAt.getTime();
};

// Get word count of the prompt body
export const getPromptWordCount = (prompt: PromptAggregate): number => {
  return prompt.props.body.split(/\s+/).filter(Boolean).length;
};

// ===== EVENT HANDLERS =====

// Mark events as committed (returns a new aggregate with empty events)
export const markEventsAsCommitted = (prompt: PromptAggregate): PromptAggregate => {
  return { ...prompt, events: [] };
};

// Helper function to apply an event to props (used in rehydration)
const applyEventToProps = (props: PromptProps, event: PromptEvent): PromptProps => {
  switch (event.type) {
    case "PromptCreated":
      return {
        id: event.aggregateId,
        keyword: event.keyword,
        body: event.body,
        category: event.category,
        type: event.promptType,
        createdAt: event.occurredAt,
        updatedAt: event.occurredAt,
      };
    case "PromptKeywordChanged":
      return {
        ...props,
        keyword: event.newKeyword,
        updatedAt: event.occurredAt,
      };
    case "PromptBodyChanged":
      return {
        ...props,
        body: event.newBody,
        updatedAt: event.occurredAt,
      };
    case "PromptCategoryChanged":
      return {
        ...props,
        category: event.newCategory,
        updatedAt: event.occurredAt,
      };
    default:
      return props;
  }
};

// Example of composed commands
export const updatePromptDetails = ({
  prompt,
  keyword,
  body,
  category,
}: {
  prompt: PromptAggregate;
  keyword?: string;
  body?: string;
  category?: string;
}): Result<PromptAggregate, ValidationErr> => {
  // Build command pipeline based on provided updates
  const commands = [];

  if (keyword !== undefined) {
    commands.push((p: PromptAggregate) => changePromptKeyword({ prompt: p, newKeyword: keyword }));
  }

  if (body !== undefined) {
    commands.push((p: PromptAggregate) => changePromptBody({ prompt: p, newBody: body }));
  }

  if (category !== undefined) {
    commands.push((p: PromptAggregate) => changePromptCategory({ prompt: p, newCategory: category }));
  }

  // Apply commands in sequence through function composition
  return pipe(...commands)(prompt);
};
