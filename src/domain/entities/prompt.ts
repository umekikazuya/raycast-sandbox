import { Result, ok, err } from "../../shared/kernel/result";
import { ValidationErr } from "../../shared/kernel/types";
import { PromptBody, createPromptBody } from "../valueObjects/prompt/PromptBody";
import { createPromptVariable, PromptVariable } from "../valueObjects/prompt/PromptVariable";
import { CategoryId } from "./category";
import { PromptType } from "../../shared/kernel/PromptType";
import { createPromptKeyword, PromptKeyword } from "../valueObjects/prompt/PromptKeyword";
import { createPromptId, PromptId } from "../valueObjects/prompt/PromptId";

export interface Prompt {
  id: PromptId;
  keyword: PromptKeyword;
  body: PromptBody;
  categoryId: CategoryId;
  type: PromptType;
  variables: PromptVariable[] | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreatePromptArgs {
  id: string;
  keyword: string;
  body: string;
  categoryId: string;
  type: PromptType;
  variables: unknown[] | null;
}

export const createPrompt = ({
  id,
  keyword,
  body,
  categoryId,
  type,
  variables,
}: CreatePromptArgs): Result<Prompt, ValidationErr> => {
  const idResult = createPromptId({ raw: id });
  if (idResult.tag === "err") {
    return idResult;
  }

  const keywordResult = createPromptKeyword({ raw: keyword });
  if (keywordResult.tag === "err") {
    return keywordResult;
  }

  const bodyResult = createPromptBody({ raw: body });
  if (bodyResult.tag === "err") {
    return bodyResult;
  }

  if (!categoryId || categoryId.trim().length === 0) {
    return err({ kind: "InvalidCategoryId", raw: categoryId });
  }
  
  const variablesResult = createPromptVariable({ variables });
  if (variablesResult.tag === "err") {
    return variablesResult;
  }

  const now = new Date();

  return ok({
    id: idResult.val,
    keyword: keywordResult.val,
    body: bodyResult.val,
    categoryId: categoryId as CategoryId,
    type: type,
    variables: variablesResult.val ?? null,
    createdAt: now,
    updatedAt: now,
  });
};
