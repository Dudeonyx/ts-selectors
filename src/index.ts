// import memoize from 'memoize-state';

/**
 * @author 'tsdef'
 */
export type IsAny<T, True, False = never> = True | False extends (T extends never ? True : False)
  ? True
  : False;

type IncreaseNum<N extends number> = IsAny<N, never, false> extends false
  ? number extends N
    ? never
    : N extends 0
    ? 1
    : N extends 1
    ? 2
    : N extends 2
    ? 3
    : N extends 3
    ? 4
    : N extends 4
    ? 5
    : N extends 5
    ? 6
    : N extends 6
    ? 7
    : N extends 7
    ? 8
    : N extends 8
    ? 9
    : N extends 9
    ? 10
    : N extends 10
    ? 11
    : N extends 11
    ? 12
    : N extends 12
    ? 13
    : N extends 13
    ? 14
    : N extends 14
    ? 15
    : N extends 15
    ? 16
    : N extends 16
    ? 17
    : N extends 17
    ? 18
    : N extends 18
    ? 19
    : N extends 19
    ? 20
    : N extends 20
    ? 21
    : N extends 21
    ? 22
    : N extends 22
    ? 23
    : N extends 23
    ? 24
    : N extends 24
    ? 25
    : N extends 25
    ? 26
    : N extends 26
    ? 27
    : N extends 27
    ? 28
    : N extends 28
    ? 29
    : N extends 29
    ? 30
    : N extends 30
    ? 31
    : N extends 31
    ? 32
    : N extends 32
    ? 33
    : N extends 33
    ? 34
    : never
  : never;

export type NestedObject<
  S extends string[] | ReadonlyArray<string>,
  Start extends number,
  Fin,
  Max extends number = GetArrayLength<S>,
> = number extends Start
  ? never
  : Start extends Max
  ? Fin
  : { [K in S[Start]]: NestedObject<S, IncreaseNum<Start>, Fin, Max> };

export type GetArrayLength<S extends any[] | ReadonlyArray<any>> = S extends {
  length: infer L;
}
  ? L
  : never;
export type Getter<
  P extends string[] | ReadonlyArray<string>,
  O extends { [s: string]: any },
> = GetArrayLength<P> extends 0
  ? O
  : GetArrayLength<P> extends 1
  ? O[P[0]]
  : GetArrayLength<P> extends 2
  ? O[P[0]][P[1]]
  : GetArrayLength<P> extends 3
  ? O[P[0]][P[1]][P[2]]
  : GetArrayLength<P> extends 4
  ? O[P[0]][P[1]][P[2]][P[3]]
  : GetArrayLength<P> extends 5
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]]
  : GetArrayLength<P> extends 6
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]]
  : GetArrayLength<P> extends 7
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]]
  : GetArrayLength<P> extends 8
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]]
  : GetArrayLength<P> extends 9
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]][P[8]]
  : GetArrayLength<P> extends 10
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]][P[8]][P[9]]
  : never;

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function makeTypeSafeSelector<P extends string[]>(
  slice: '',
  ...paths: P
): {
  <V>(): (object: NestedObject<P, 0, V>) => V;
  bindToInput: <O extends NestedObject<P, 0, any>>() => (object: O) => Getter<P, O>;
};
export function makeTypeSafeSelector<P extends string[]>(
  ...paths: P
): {
  <V>(): (object: NestedObject<P, 0, V>) => V;
  bindToInput: <O extends NestedObject<P, 0, any>>() => (object: O) => Getter<P, O>;
};

export function makeTypeSafeSelector<
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
>(...paths: P) {
  return paths[0] !== ''
    ? Object.assign(
        <V>() =>
          (object: NestedObject<P, 0, V>): V =>
            getter(paths, object) as any,
        {
          bindToInput:
            <O extends NestedObject<P, 0, any>>() =>
            (object: O): Getter<P, O> =>
              getter(paths, object) as any,
        },
      )
    : Object.assign(
        <V>() =>
          (object: any): V =>
            getter(paths.slice(1), object) as any,
        {
          bindToInput:
            <O extends NestedObject<P, 0, any>>() =>
            (object: O): any =>
              getter(paths.slice(1), object),
        },
      );
}

export const createGetter =
  <P extends string[]>(...paths: P) =>
  <O extends NestedObject<P, 0, any>>(object: O) =>
    getter(paths, object);
/**
 * Alias for `getter`, The argument order is simply switched, `object` before `paths`;
 *
 * @template O
 * @template P
 * @param {O} object
 * @param {...P} paths
 */
export const get = <O extends NestedObject<P, 0, any>, P extends string[] | ReadonlyArray<string>>(
  object: O,
  ...paths: P
) => getter(paths, object);

function getter<
  P extends string[] | ReadonlyArray<string>,
  O extends NestedObject<P, 0, any, GetArrayLength<P>>,
>(paths: P, targetObject: O): Getter<P, O> {
  if (paths.length === 0) {
    return targetObject as any;
  }
  let result: Getter<P, O> = targetObject as any;
  const { length } = paths;
  for (let i = 0; i < length; i += 1) {
    const key: P[number] = paths[i];
    if (result == null) {
      if (i !== 0) {
        // tslint:disable-next-line: no-unused-expression
        IS_PRODUCTION ||
          // eslint-disable-next-line no-console
          console.warn(
            'There is a possible mis-match between the "paths" and "object" in a getter resulting in an undefined value before the last path, The potentially bad path is "%s". The combined path leading up to here is "%s"',
            `['${paths[i - 1]}']`,
            `['${paths.slice(0, i).join("']['")}']`,
          );
      } else {
        // tslint:disable-next-line: no-unused-expression
        IS_PRODUCTION ||
          // eslint-disable-next-line no-console
          console.warn('A getter was called on an undefined or null value');
      }

      return result;
    }

    if (typeof result !== 'object') {
      // tslint:disable-next-line: no-unused-expression
      IS_PRODUCTION ||
        // eslint-disable-next-line no-console
        console.warn(
          'Warning: You attempted to call a getter on a Non-Object value, The value is "%s", and the path to the value is "%s"',
          result,
          i === 0 ? '' : `['${paths.slice(0, i).join("']['")}']`,
        );
    }
    result = (result as any)[key];
    if (length === i + 1 && result == null) {
      // tslint:disable-next-line: no-unused-expression
      IS_PRODUCTION ||
        // eslint-disable-next-line no-console
        console.warn(
          'There is a possible mis-match between the final "path" argument and "object" in a getter resulting in an undefined value, The potentially bad final path is "%s". The combined path leading up to here is "%s"',
          `['${key}']`,
          `['${paths.join("']['")}']`,
        );
    }
  }
  return result;
}

type ArgOf<Fn> = Fn extends (o: infer O, ...g: any) => any ? O : never;

export function reMapSelectors<
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  SelectorMap extends { [s: string]: (s: any) => any },
  State extends any,
  Obj extends NestedObject<P, 0, any>,
>(selectors: SelectorMap, ...paths: P): ReMappedSelectors<P, SelectorMap>;

export function reMapSelectors<
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  Selector extends (s: any) => any,
  State extends any,
  Obj extends NestedObject<P, 0, any>,
>(selector: Selector, ...paths: P): ReMappedSelector<P, Selector>;

export function reMapSelectors<
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  SelectorMap extends { [s: string]: (s: State) => any },
  Selector extends (s: State) => any,
  State,
>(selectors: SelectorMap | Selector, ...paths: P) {
  const mapFn = makeTypeSafeSelector<P>(...paths)<State>();

  if (typeof selectors == 'function') {
    return (state: NestedObject<P, 0, State>) =>
      selectors(mapFn(state)) as ReMappedSelector<P, Selector>;
  }
  return (Object.keys(selectors) as Array<keyof SelectorMap>).reduce<
    ReMappedSelectors<P, SelectorMap>
  >((map, key) => {
    const selector = selectors[key];
    return {
      ...map,
      [key]: (state: NestedObject<P, 0, State>) => selector(mapFn(state)),
    };
  }, {} as any);
}

export type ReMappedSelectors<
  P extends string[],
  Selects extends { [s: string]: (state: any) => any },
> = { [K in keyof Selects]: ReMappedSelector<P, Selects[K]> };

export type ReMappedSelector<P extends string[], Select extends (state: any) => any> = P extends [
  '',
]
  ? (state: ArgOf<Select>) => ReturnType<Select>
  : (state: NestedObject<P, 0, ArgOf<Select>>) => ReturnType<Select>;

export interface AnyState {
  [slice: string]: any;
}

/** Type alias for generated selectors */
export type Selectors<SS> = {
  selectSlice: (state: SS) => SS;
} & (SS extends any[] | ReadonlyArray<any>
  ? {}
  : SS extends AnyState
  ? { [key in keyof SS]: (state: SS) => SS[key] }
  : {});

export const bindComputedSelectors = <ComputedMap extends { [s: string]: (s: any) => any }>(
  selectors: ComputedMap,
) => {
  const temp = {} as ComputedMap;
  (Object.keys(selectors) as Array<keyof ComputedMap>).forEach((key) => {
    temp[key] = selectors[key].bind(temp) as ComputedMap[keyof ComputedMap];
  });
  return temp;
};
export interface MapSelectorsTo<SelectorMap extends { [s: string]: (state: any) => any }> {
  <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    },
  >(
    p0: '',
    ...paths: P
  ): ReMappedSelectors<P, SelectorMap>;
  <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    },
  >(
    ...paths: P
  ): ReMappedSelectors<P, SelectorMap>;
}
export function makeReMapableSelectors<SelectorMap extends { [s: string]: (s: any) => any }>(
  selectors: SelectorMap,
): MapSelectorsTo<SelectorMap>;

export function makeReMapableSelectors<
  SelectorMap extends { [s: string]: (s: any) => any },
  ComputedMap extends { [s: string]: (s: any) => any },
  S,
>(selectors: SelectorMap, computed: ComputedMap): MapSelectorsTo<SelectorMap & ComputedMap>;

export function makeReMapableSelectors<
  SelectorMap extends { [s: string]: (s: any) => any },
  ComputedMap extends { [s: string]: (s: any) => any },
>(
  selectors: SelectorMap,
  computed: ComputedMap = {} as any,
): MapSelectorsTo<SelectorMap & ComputedMap> {
  return <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    },
  >(
    ...paths: P
  ) => reMapSelectors({ ...selectors, ...bindComputedSelectors(computed) }, ...paths);
}

export interface MakeSelectors {
  <SliceState>(initialState: SliceState, paths?: ''): Selectors<SliceState>;
  <SliceState, P extends string[]>(initialState: SliceState, ...paths: P): ReMappedSelectors<
    P,
    Selectors<SliceState>
  >;
}
export const makeSelectors: MakeSelectors = <SliceState, P extends string[]>(
  initialState: SliceState,
  ...paths: P
) => {
  const initialStateKeys: Array<Extract<keyof SliceState, string>> =
    typeof initialState === 'object' && initialState !== null && !Array.isArray(initialState)
      ? (Object.keys(initialState) as Array<Extract<keyof SliceState, string>>)
      : [];
  const otherSelectors = initialStateKeys.reduce<{
    [key in Extract<keyof SliceState, string>]: (state: SliceState) => SliceState[key];
  }>(
    (map, key) => ({
      ...map,
      [key]: makeTypeSafeSelector(...paths, key)<SliceState[typeof key]>(),
    }),
    {} as any,
  );
  return {
    selectSlice: makeTypeSafeSelector(...paths)<SliceState>(),
    ...otherSelectors,
  };
};
