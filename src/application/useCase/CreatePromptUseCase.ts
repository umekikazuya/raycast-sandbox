import { v4 as uuid } from "uuid";
import { CategoryId } from "../../domain/entities/category";
import { createPrompt, Prompt } from "../../domain/entities/prompt";
import { PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { PromptType } from "../../shared/kernel/PromptType";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type CreatePromptParams = Readonly<{
  keyword: string;
  body: string;
  categoryId?: CategoryId;
  variables: unknown[] | null;
  type: PromptType;
  author: string;
}>;

export type CreatePromptErr = ApplicationErr | PromptRepositoryErr;

/**
 * プロンプト作成ユースケース
 */
export const createPromptUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async ({ params }: { readonly params: CreatePromptParams }): Promise<Result<Prompt, CreatePromptErr>> => {
    const promptResult = createPrompt({
      id: uuid(),
      keyword: params.keyword,
      body: params.body,
      categoryId: params.categoryId ?? "",
      variables: params.variables,
      type: params.type,
    });

    if (promptResult.tag === "err") {
      return err({
        kind: "ValidationError",
        message: "プロンプトの作成に失敗しました",
        cause: promptResult.err,
      });
    }

    // リポジトリへの保存
    const saveResult = await promptRepository.save({ prompt: promptResult.val });
    if (saveResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "プロンプトの保存に失敗しました",
        cause: saveResult.err,
      });
    }

    return ok(saveResult.val);
  };
