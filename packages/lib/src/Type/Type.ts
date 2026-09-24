export type JSONPrimitive = boolean | number | string | null | undefined;
export type Primitive = JSONPrimitive | bigint | symbol;
export type Nullable<T> = T | null;
export type Undefinable<T> = T | undefined;
export type Freeze<T extends object> = {
  readonly [P in keyof T]: T[P] extends object ? Freeze<T[P]> : T[P];
};
export type Vague<T extends object = object> = {
  readonly [P in keyof T]: unknown;
};
export type PlainObject = {
  readonly [key: string]: PlainObjectItem;
};
export type ObjectLiteral = PlainObject | ReadonlyArray<PlainObjectItem>;
export type PlainObjectItem = ObjectLiteral | Primitive;
export type AnyFunction = (...args: Array<unknown>) => unknown;
export type UnaryFunction<in A, out R> = (arg: A) => R;
export type BinaryFunction<in A1, in A2, out R> = (arg1: A1, arg2: A2) => R;
export type TernaryFunction<in A1, in A2, in A3, out R> = (arg1: A1, arg2: A2, arg3: A3) => R;
export type Predicate<in A> = (arg: A) => boolean;
export type BinaryPredicate<in A1, in A2> = (arg1: A1, args2: A2) => boolean;
export type Consumer<in A> = (arg: A) => unknown;
export type BinaryConsumer<in A1, in A2> = (arg1: A1, args2: A2) => unknown;
export type Supplier<out R> = () => R;
export type Peek = () => unknown;
export type ForEach<in K, in V> = (value: V, key: K) => unknown;
export type Mapping<in V, out R> = (value: V, index: number) => R;

export const Type = {
  isBigInt(value: unknown): value is bigint {
    return typeof value === 'bigint';
  },

  isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  },

  isFunction(value: unknown): value is Function {
    return typeof value === 'function';
  },

  isInteger(value: unknown): value is number {
    if (!Type.isNumber(value)) {
      return false;
    }

    return value % 1 === 0;
  },

  isNone(value: unknown): value is null | undefined | void {
    return value == null;
  },

  isNull(value: unknown): value is null {
    return value === null;
  },

  isNumber(value: unknown): value is number {
    return typeof value === 'number';
  },

  isObject<T extends object = object>(value: unknown): value is Vague<T> {
    if (typeof value !== 'object') {
      return false;
    }

    return !Type.isNull(value);
  },

  isPrimitive(value: unknown): value is Primitive {
    if (Type.isNull(value)) {
      return true;
    }
    switch (typeof value) {
      case 'undefined':
      case 'boolean':
      case 'number':
      case 'string':
      case 'symbol':
      case 'bigint': {
        return true;
      }
      default: {
        return false;
      }
    }
  },

  isString(value: unknown): value is string {
    return typeof value === 'string';
  },

  isSymbol(value: unknown): value is symbol {
    return typeof value === 'symbol';
  },

  isUndefined(value: unknown): value is undefined {
    return typeof value === 'undefined';
  }
};
