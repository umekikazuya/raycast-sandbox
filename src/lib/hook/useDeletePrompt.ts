import { useCallback, useMemo } from "react";
import { deletePromptUseCase } from "../../application/useCase/DeletePromptUseCase";
import { showToast, Toast } from "@raycast/api";
import { PromptId } from "../../domain/valueObjects/prompt/PromptId";
import { LocalStoragePromptRepository } from "../../infrastructure/repositories/localStoragePromptRepository";

/**
 * Prompt deletion hook.
 */
export function useDeletePrompt(onSuccess: () => void) {
  const repository = useMemo(() => new LocalStoragePromptRepository(), []);
  const deleteUseCase = useMemo(() => deletePromptUseCase({ promptRepository: repository }), [repository]);

  const deletePrompt = useCallback(
    async (promptId: PromptId) => {
      const result = await deleteUseCase({ id: promptId });

      if (result.tag === "err") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to delete prompt",
          message: result.err.kind,
        });
        return;
      }

      await showToast({
        style: Toast.Style.Success,
        title: "Deleted",
      });

      // When the prompt is successfully deleted, call the onSuccess callback
      onSuccess();
    },
    [deleteUseCase, onSuccess],
  );

  return { deletePrompt };
}
