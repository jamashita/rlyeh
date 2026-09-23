### テスト

Vitestを使用しています。
monorepoのすべてのテストを実施するには以下のコマンドを利用します。

```shell
pnpm test
```

## テストの位置

あるファイルがこのようなパスで存在するとします。

```bash
package/aaa/bbb/ccc.ts
```

このファイルのテストファイルはこの位置にあります。この位置にない場合、テストファイルがありません。

```bash
package/aaa/bbb/__tests__/ccc.spec.ts
```

## テストケース

テストケースはすべて英語で記します。

## mocking

テストである関数やメソッドをモックにする際、そのモックの使用回数を必ず数えてください

```typescript
const spy1 = vi.spyOn(object, 'method1').mockImplementation(() => {
  // ...
});
const spy2 = vi.spyOn(object, 'method2').mockImplementation(() => {
  // ...
});
const spy3 = vi.spyOn(object, 'method3').mockImplementation(() => {
  // ...
});

expect(spy1).toHaveBeenCalledOnce(); // 1回のときはコレ
expect(spy2).toHaveBeenCalledTimes(2); // 2以上回のときはコレ
expect(spy3).not.toHaveBeenCalled(); // 呼び出されないときはコレ
```

`expect(spy).toHaveBeenCalled()`では何回呼び出したかがわかりづらいため、呼び出し回数を明示的に数えることが推奨されます。

## テストカバレッジ

テストカバレッジはC1を意識しています。
