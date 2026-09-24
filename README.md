# R'lyeh

Turborepo monorepo. TypeScript only, Bun as the package manager.

## 構成

```
apps/
  frontend      React + Vite + TanStack Router。API を叩くだけで、ドメイン知識は持たない
  backend       Hono on Bun。ルーティングと永続化の実装
packages/
  applications  ユースケース。domains のインターフェースに依存する
  domains       エンティティ、値オブジェクト、リポジトリのインターフェース
  lib           どのレイヤーからも使える汎用ユーティリティ。ドメイン知識を持たない
```

依存の向きは一方向で、内側が外側を知らない。

```
apps/*  ->  applications  ->  domains  ->  lib
```

- `domains` はリポジトリの**インターフェース**だけを持ち、実装は `apps/backend` に置く。
- `applications` の公開境界は `Either` を返す。`TaskEither` は private メソッドの内側に閉じる。
- ドメインの失敗は `kind` 判別子を持たせ、`switch` + `ExhaustiveError` で網羅性をコンパイラに守らせる。

## セットアップ

```sh
mise install
bun install
```

## コマンド

| コマンド | 内容 |
| --- | --- |
| `bun run dev` | frontend（:3000）と backend（:3001）を同時に起動 |
| `bun run test` | 全ワークスペースの Vitest |
| `bun run typecheck` | 全ワークスペースの `tsc --noEmit` |
| `bun run build` | frontend のビルド |
| `bun run check` | Biome の format + lint + import 整列 |
| `bun run clean` | 生成物の削除 |

frontend の `/api` は `http://localhost:3001` にプロキシされる。

## 動作確認

```sh
curl http://localhost:3001/health
```
