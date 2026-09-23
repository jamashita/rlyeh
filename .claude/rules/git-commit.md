# コミットメッセージ

Conventional Commitsを採用しています。 基本的に英語で書いています。
普段はこれでコミットを作成しています。

```bash
npx git-cz
```

## Branches

- main ... リリース用のブランチです。直接コミットはしません。
- develop ... 開発用のブランチです。Pull Requestを作成する際は、developからブランチを切ってください。直接コミットはしません。
- feature/xxx ... 新しい機能を追加する場合に作成するブランチです。developからブランチを切ってください。
- hotfix/xxx ... バグ修正をする場合に作成するブランチです。mainからブランチを切ってください。マージはmainとdevelopの両方に行います。

## Push

Pushをする前にこちらでコードレビューをしますので、Pushはしないでください。

## PR

レビュアーにCopilotを追加してください。