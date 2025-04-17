import { createCategory } from "../../../domain/entities/category";

describe("Category", () => {
  it("正常系: 正しいIDとカテゴリ名で生成できる", () => {
    const result = createCategory({ id: "cat1", name: "category_1" });
    expect(result.tag).toBe("ok");
    expect(result.val?.name).toBe("category_1");
  });
  it("異常系: 空IDはエラー", () => {
    const result = createCategory({ id: "", name: "category_1" });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("InvalidCategoryId");
  });
  it("異常系: 不正なカテゴリ名はエラー", () => {
    const result = createCategory({ id: "cat1", name: "カテゴリ" });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("InvalidCategoryName");
  });
});
