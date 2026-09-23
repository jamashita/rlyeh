---
paths:
  - apps/frontend/src/app/**/*.{ts,tsx}
  - apps/frontend/src/components/**/*.{ts,tsx}
  - apps/frontend/src/contexts/**/*.{ts,tsx}
  - apps/frontend/src/features/**/*.{ts,tsx}
  - apps/frontend/src/hooks/**/*.{ts,tsx}
---

### アーキテクチャ構造 (apps/frontend/src)

Clean Architectureに基づいた層構造:

- **usecases/**: ユースケース実装 (e.g., `CreateRaffle.ts`, `DrawRaffle.ts`, `FindRaffle.ts`)
- **adapters/gateways/MySQL/repositories/**: リポジトリ実装 (e.g., `MySQLRaffleRepository.ts`,
  `MySQLAccountRepository.ts`)
- **app/**: Next.js App Routerのページとルーティング
- **features/**: 機能ごとにグループ化されたコンポーネント
- **components/**: 再利用可能なUIコンポーネント
- **actions/**: Server Actions
- **containers/**, **contexts/**, **hooks/**: Reactの状態管理とロジック
- **infra/**: インフラストラクチャ設定 (DB接続、DI設定など)

## 技術スタック

- React 19
- Next.js 16 (App Router)
- Tailwind CSS 4
- Shadcn UI / Radix UI
- React Hook Form + Zod
