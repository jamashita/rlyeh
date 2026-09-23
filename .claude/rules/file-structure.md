## Monorepo構成

このプロジェクトはbun workspacesとTurboを使用したmonorepo構成です:

- **apps/frontend**: Next.jsアプリケーション。フロントエンドとバックエンドが統合されています (
  2026年現在、分離されていません)
- **packages/domains**: ドメインモデルとリポジトリインターフェース。DDDのドメイン層
- **packages/application**: DTO、アプリケーションサービス、ユースケース関連のロジック
- **packages/lib**: 共通ライブラリとユーティリティ

## 型のチェックについて

bun checkを行うと内部的にbiome check --write --unsafe src/*が動き、ファイルが更新されます。

ファイルの型だけを確認したい場合はbun biome check <変更ファイルのパス> で実施し、必要以上にファイル差分を生まないようにしてください。