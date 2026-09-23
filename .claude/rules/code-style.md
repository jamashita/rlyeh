## 設計原則

**重要**: このプロジェクトはDDD (Domain-Driven Design) とClean Architectureを採用しています。実装がこれらの原則に反していると感じた場合は指摘してください。

DDD, Clean Architectureといえばバックエンドのコンテキストで語られることが多いですが、このプロジェクトではフロントエンドでも同様に扱われます。

## 依存性の方向

- **usecases** → **domain interfaces** ← **adapters** (依存性逆転の原則)
- フロントエンドコンポーネントはドメインロジックに直接依存しない
- hooksやactionsを通じてusecasesを呼び出す

## 型安全性

- 型アサーション（`as`）は最小限に
- `any`は使用禁止
- Brand型を活用してドメイン型を表現（例: `DeliveryAddressId`）

## 関数型プログラミング

- fp-tsを使用してエラーハンドリング（`Either`, `Option`, `TaskEither`）
    - `Task<T>` はfp-tsで使われる `() => Promise<T>` の型エイリアス
    - `TaskEither<E, T>` は `() => Promise<Either<E, T>>` の型エイリアス
    - `Task`はfp-ts独自の型定義のため、privateメソッド内で戻り値として使用する分には問題ないが、publicメソッドの戻り値としては使用せず
      `Promise<Either<E, T>>` を使用するように
- 副作用は明示的に分離
- Immutabilityを重視

## コーディングスタイル

- Biomeによる自動フォーマット/Lint
- コミット前に`pnpm check`を実行
- TODOコメントには必ず`TODO TEST`のように内容を明記
- ternary operatorを使わない
- メソッド・関数の内部で「その処理を実行するかどうか」を判断させない
    - 呼び出し側（オーケストレーション層）が判断し、実行が必要な場合にのみそのメソッド・関数を呼び出す
    - そのメソッド・関数自身は、呼ばれたら常に本来の処理を無条件に実行する（内部で早期returnして何もしない、というコードを書かない）
    - これはif/ternaryそのものを禁止するものではない。呼び出し側での単純な条件分岐（例:
      値のnullチェックやboolean分岐に応じて、そのメソッドを呼ぶか呼ばないかを選ぶ）は問題ない

