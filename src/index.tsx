import { useCallback, useEffect, useMemo, useState } from "react";
import { Prompt } from "./domain/entities/prompt";
import { LocalStoragePromptRepository } from "./infrastructure/repositories/localStoragePromptRepository";
import { PromptFilter } from "./domain/repositories/promptRepository";
import { filterPromptsUseCase } from "./application/useCase/FilterPromptsUseCase";
import { createPromptCategory } from "./domain/valueObjects/prompt/PromptCategory";
import { LocalPromptList } from "./ui/command/localPromptList";

/**
 * Local Prompt List Command
 */
export default function Command() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filter, setFilter] = useState<PromptFilter>({ category: undefined, keyword: undefined });

  const repository = useMemo(() => new LocalStoragePromptRepository(), []);
  const filterUseCase = useMemo(() => filterPromptsUseCase({ promptRepository: repository }), [repository]);

  // Get prompts.
  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    const result = await filterUseCase({ filter });
    if (result.tag === "ok") {
      setPrompts(result.val);
    }
    setIsLoading(false);
  }, [filter]);

  // Filter prompts when the component mounts or when the filter changes.
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Change search text.
  function handleSearchTextChange(text: string | undefined) {
    setFilter({ ...filter, keyword: text ?? undefined });
  }

  // Change search category.
  function handleSearchCategoryChange(raw: string | undefined) {
    if (!raw) {
      setFilter({ ...filter, category: undefined });
      return;
    }
    const category = createPromptCategory({ raw });
    if (category.tag === "err") {
      setFilter({ ...filter, category: undefined });
      return;
    }
    setFilter({ ...filter, category: category.val });
  }

  return (
    <LocalPromptList
      isLoading={isLoading}
      prompts={prompts}
      filter={filter}
      handleSearchTextChange={handleSearchTextChange}
      handleSearchCategoryChange={handleSearchCategoryChange}
      fetchPrompts={fetchPrompts}
    />
  );
}
