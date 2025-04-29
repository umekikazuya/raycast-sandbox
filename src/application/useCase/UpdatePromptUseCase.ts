import { createPrompt, Prompt } from "../../domain/entities/prompt";
import { PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { PromptCategory } from "../../domain/valueObjects/prompt/PromptCategory";
import { PromptType } from "../../shared/kernel/PromptType";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type UpdatePromptErr = ApplicationErr | PromptRepositoryErr;

export type UpdatePromptParams = Readonly<{
  id: string;
  keyword: string;
  body: string;
  category: PromptCategory;
  type: PromptType;
}>;

/**
 * プロンプト更新ユースケース
 */
export const updatePromptUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async ({ params }: { readonly params: UpdatePromptParams }): Promise<Result<Prompt, UpdatePromptErr>> => {
    const promptResult = createPrompt({
      id: params.id,
      keyword: params.keyword,
      body: params.body,
      category: params.category,
      type: params.type,
    });
    if (promptResult.tag === "err") {
      return err({
        kind: "ValidationError",
        message: "プロンプトの更新に失敗しました",
        cause: promptResult.err,
      });
    }
    // 対象プロンプトの存在確認
    const existingPromptResult = await promptRepository.findById({ id: promptResult.val.id });

    if (existingPromptResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: `ID ${params.id} のプロンプト取得に失敗しました`,
        cause: existingPromptResult.err,
      });
    }

    if (!existingPromptResult.val) {
      return err({
        kind: "NotFoundError",
        message: `ID ${promptResult.val.id} のプロンプトが見つかりません`,
      });
    }

    // プロンプトの更新
    const updateResult = await promptRepository.update({ prompt: promptResult.val });

    if (updateResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "プロンプトの更新に失敗しました",
        cause: updateResult.err,
      });
    }

    return ok(updateResult.val);
  };
