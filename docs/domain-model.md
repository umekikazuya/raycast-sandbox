# ドメインモデル定義 – Raycast Prompt Manager

本ドキュメントは、Raycast Prompt Manager におけるドメインオブジェクト・ユビキタス言語を整理し、実装前の共通理解を確立することを目的とする。

## 1. ユビキタス言語（Ubiquitous Language）

| 用語 | 定義 | 備考 |
|------|------|------|
| Prompt | 実行可能なAIへの入力テンプレート。ユーザーが作成・共有する単位。| LocalStorageまたはDynamoDBに保存 |
| PromptCategory | 複数のPromptをカテゴライズするためのラベル単位。| `タグ`と混同されないよう注意 |
| PromptVariable | Prompt内に埋め込まれるカスタム変数。実行時に入力される。| `{{name}}` などの形で表現 |
| LocalPrompt | ローカル環境に保存されるPrompt。| オフライン対応・即時性重視 |
| OrgPrompt | DynamoDBで組織共有されるPrompt。| 組織フィルタ・権限制御あり |


## 2. Entity一覧

### 2.1 `Prompt`
- `id`: UUID or CUID
- `keyword`: string
- `body`: PromptBody
- `tags`: PromptTags
- `author`: UserMeta
- `type`: 'local' | 'org'
- `variables`: PromptVariable[]

<!-- v2以降に実装予定 -->
<!--
### 2.2 `ExecutionLog`
- `id`: UUID
- `promptId`: string
- `executedBy`: string (userId)
- `executedAt`: datetime
- `input`: Record<string, string>
-->


## 3. ValueObject一覧

### 3.1 `PromptBody`
- value: string
- 制約: Markdown準拠、5000文字以内

### 3.2 `PromptTags`
- value: string[]
- 制約: 最大10個、重複不可、英数字(小文字)・アンダースコア・ハイフンのみ許容

### 3.3 `UserMeta`
- id: string
- name: string
- org: string[]

### 3.4 `PromptVariable`
- key: string
- label: string
- required: boolean
- placeholder?: string


## 4. ドメインサービス候補

### 4.1 `PromptFilterService`
- タグや部署でのフィルタリング機能を提供

### 4.2 `PromptExecutionService`
- 実行時の変数バインディングとバリデーションを担う


## 5. ドメインルール・制約事項

- PromptVariable の `key` は英数字のみ許容（JS変数名として扱う）
- OrgPrompt の作成時は `UserMeta` が必須
- タグは重複不可、検索の正確性を担保する
<!-- ExecutionLog は編集不可、記録専用（v2で導入予定） -->


## 6. ｖ2 以降の拡張予定

- Prompt に対する `favorite` フラグ
- ExecutionLog への評価スコア付与（v2）
- PromptGroup による階層的なカテゴリ分類
