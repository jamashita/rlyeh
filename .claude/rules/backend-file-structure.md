---
paths:
  - apps/frontend/src/actions/**/*.ts
  - apps/frontend/src/adapters/**/*.ts
  - apps/frontend/src/containers/**/*.ts
  - apps/frontend/src/infra/**/*.ts
  - apps/frontend/src/usecases/**/*.ts
  - packages/domains/**/*.ts
  - packages/application/**/*.ts
---

### リポジトリパターン

- ドメインリポジトリインターフェース: `packages/domains/src/*/I*Repository.ts`
- 実装: `apps/frontend/src/adapters/gateways/MySQL/repositories/MySQL*Repository.ts`
- 依存性の方向: usecases → domain interfaces ← adapters (依存性逆転の原則)

## 技術スタック

- Next.js Server Actions
- Drizzle ORM
- NextAuth.js 5
- Inversify (DI container)

### データベース

- MySQL 8.0 (開発環境、本番はAWS Aurora)
- DynamoDB (分散ロック用)
