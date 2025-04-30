import { Result, ok } from "../../shared/kernel/result";
import { ValidationErr } from "../../shared/kernel/types";
import { PromptBody, createPromptBody } from "../valueObjects/prompt/PromptBody";
import { PromptType } from "../../shared/kernel/PromptType";
import { createPromptKeyword, PromptKeyword } from "../valueObjects/prompt/PromptKeyword";
import { createPromptId, PromptId } from "../valueObjects/prompt/PromptId";
import { createPromptCategory, PromptCategory } from "../valueObjects/prompt/PromptCategory";

export interface Prompt {
  id: PromptId;
  keyword: PromptKeyword;
  body: PromptBody;
  category: PromptCategory;
  type: PromptType;
  createdAt: Date;
  updatedAt: Date;
}

interface CreatePromptArgs {
  id: string;
  keyword: string;
  body: string;
  category: string;
  type: PromptType;
}

export const createPrompt = ({
  id,
  keyword,
  body,
  category,
  type,
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

  const categoryResult = createPromptCategory({ raw: category });
  if (categoryResult.tag === "err") {
    return categoryResult;
  }

  const now = new Date();

  return ok({
    id: idResult.val,
    keyword: keywordResult.val,
    body: bodyResult.val,
    category: categoryResult.val,
    type: type,
    createdAt: now,
    updatedAt: now,
  });
};
