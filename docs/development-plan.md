# 開発計画

## Step 0: コンセプト設計

- ユビキタス言語の定義（Prompt / Variable / ExecutionLog etc.）
- ID設計ポリシーの決定（UUID / CUID）
- 削除方針（論理削除 or 物理削除）

## Step 1: ドメインモデリング

- Entity: `Prompt`, `ExecutionLog`
- ValueObject: `PromptBody`, `PromptTags`
- DomainService: `PromptFilterService`, `PromptExecutionService`

## Step 2: アプリケーション層の実装

- UseCase: `CreatePromptUseCase`, `ExecutePromptUseCase`
- DTO + Mapper / Assembler の整備

## Step 3: テストファースト

- ユースケース単位の正常系・異常系テスト
- ValueObject 不変性テスト

## Step 4: インフラストラクチャ層

- `PromptRepositoryInterface`
- `LocalPromptRepository`, `DynamoPromptRepository`
- DynamoDB SDKのラッパー

## Step 5: プレゼンテーション層

- Prompt一覧・詳細・フォーム UI
- 実行時の入力ダイアログ

## Step 6: E2E / 統合テスト

- タグによるフィルタリング → 実行確認  
- 変数入力 → プロンプト実行 → クリップボードへのコピー確認

## Step 7: デプロイ・運用・ドキュメント化

- DynamoDB テーブルの初期化
- エラーモニタリング（Sentry等）
- README / CONTRIBUTING.md 整備

## Step 8: 設計テンプレートの改善

- UseCase / Repository テンプレートの共通化
- 設計ガイドラインの明文化
