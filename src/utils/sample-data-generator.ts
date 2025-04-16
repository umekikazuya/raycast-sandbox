import { Prompt, createPrompt } from "../domain/models/prompt";
import { PromptVariable, createPromptVariable } from "../domain/models/prompt-variable";
import { Result, PromptError } from "../domain/models/types";

/**
 * サンプルプロンプトのデータを生成する
 * 
 * @returns サンプルプロンプトの配列
 */
export function generateSamplePrompts(): Result<Prompt[], PromptError> {
  const samplePrompts: Result<Prompt, PromptError>[] = [
    // AI開発のためのプロンプト
    createPrompt({
      title: "コードレビュー支援",
      content: "以下のコードをレビューして、バグ、パフォーマンス問題、セキュリティリスク、リファクタリングの機会を特定してください。\n\n```\n{{code}}\n```",
      category: "開発",
      tags: ["コードレビュー", "品質改善"],
      variables: [
        createPromptVariable({ name: "code", description: "レビュー対象のコード", defaultValue: "" }).value
      ],
      createdBy: "system",
      department: "エンジニアリング",
      position: "ソフトウェアエンジニア"
    }),
    
    // マーケティングのためのプロンプト
    createPrompt({
      title: "Twitter投稿作成",
      content: "{{製品名}}について、以下のポイントを強調したTwitter投稿を280文字以内で作成してください。\n\n主要な利点：{{利点}}\nターゲットオーディエンス：{{ターゲット}}\nCTA：{{CTA}}",
      category: "マーケティング",
      tags: ["SNS", "コピーライティング"],
      variables: [
        createPromptVariable({ name: "製品名", description: "宣伝する製品またはサービスの名前", defaultValue: "" }).value,
        createPromptVariable({ name: "利点", description: "製品の主な利点や特徴", defaultValue: "" }).value,
        createPromptVariable({ name: "ターゲット", description: "ターゲットとなる顧客層", defaultValue: "" }).value,
        createPromptVariable({ name: "CTA", description: "Call to Action（行動喚起）", defaultValue: "詳細はプロフィールリンクをチェック！" }).value
      ],
      createdBy: "system",
      department: "マーケティング",
      position: "マーケティングマネージャー"
    }),
    
    // カスタマーサポートのためのプロンプト
    createPrompt({
      title: "問い合わせ対応テンプレート",
      content: "以下の顧客問い合わせに対する丁寧かつ明確な返信を作成してください。\n\n問い合わせ内容：\n{{問い合わせ内容}}\n\n製品名：{{製品名}}\n顧客タイプ：{{顧客タイプ}}",
      category: "カスタマーサポート",
      tags: ["問い合わせ対応", "テンプレート"],
      variables: [
        createPromptVariable({ name: "問い合わせ内容", description: "顧客からの問い合わせ内容", defaultValue: "" }).value,
        createPromptVariable({ name: "製品名", description: "対象となる製品名", defaultValue: "" }).value,
        createPromptVariable({ name: "顧客タイプ", description: "顧客の種類（新規、既存、VIPなど）", defaultValue: "既存" }).value
      ],
      createdBy: "system",
      department: "カスタマーサクセス",
      position: "カスタマーサポート担当"
    }),
    
    // セールスのためのプロンプト
    createPrompt({
      title: "セールスメール作成",
      content: "{{業界}}の{{役職}}向けの、{{製品名}}の価値を伝えるセールスメールを作成してください。以下の特徴と利点を含めてください：\n\n{{特徴と利点}}\n\n想定している課題：{{課題}}",
      category: "セールス",
      tags: ["メール", "アウトリーチ"],
      variables: [
        createPromptVariable({ name: "業界", description: "ターゲットとなる業界", defaultValue: "" }).value,
        createPromptVariable({ name: "役職", description: "ターゲットとなる役職", defaultValue: "" }).value,
        createPromptVariable({ name: "製品名", description: "販売する製品またはサービスの名前", defaultValue: "" }).value,
        createPromptVariable({ name: "特徴と利点", description: "製品の主な特徴と利点", defaultValue: "" }).value,
        createPromptVariable({ name: "課題", description: "顧客が直面している課題", defaultValue: "" }).value
      ],
      createdBy: "system",
      department: "セールス",
      position: "セールスマネージャー"
    }),
    
    // 経営層のためのプロンプト
    createPrompt({
      title: "プレゼンテーション概要作成",
      content: "テーマ「{{テーマ}}」について、{{時間}}分のプレゼンテーション概要を作成してください。対象者は{{対象者}}です。\n\n以下の項目を含めてください：\n- イントロダクション\n- 主要ポイント（3-5点）\n- データと証拠\n- 結論と次のステップ",
      category: "ビジネス",
      tags: ["プレゼンテーション", "エグゼクティブ"],
      variables: [
        createPromptVariable({ name: "テーマ", description: "プレゼンテーションのテーマ", defaultValue: "" }).value,
        createPromptVariable({ name: "時間", description: "プレゼンテーションの時間（分）", defaultValue: "15" }).value,
        createPromptVariable({ name: "対象者", description: "プレゼンテーションの対象者", defaultValue: "経営幹部" }).value
      ],
      createdBy: "system",
      department: "経営企画",
      position: "ディレクター"
    })
  ];
  
  // 成功したプロンプト生成のみを抽出
  const validPrompts = samplePrompts
    .filter((result): result is { ok: true; value: Prompt } => result.ok)
    .map(result => result.value);
  
  if (validPrompts.length === 0) {
    return { ok: false, error: PromptError.INVALID_CONTENT };
  }
  
  return { ok: true, value: validPrompts };
}
