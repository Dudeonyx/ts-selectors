import {
  makeSelectors,
  reMapSelectors,
  makeReMapableSelectors,
  createGetter,
  makeTypeSafeSelector,
  get,
  // bindComputedSelectors
} from '..';
/* eslint-disable no-console */

describe('makeGetter/makeTypeSafeSelector', () => {
  const property = ['property', 'fdf'] as const;
  const deepState = {
    some: {
      very: {
        really: {
          deeply: {
            nested: {
              value: 'actual value',
              value1: 1,
            },
          },
        },
      },
      yoink: 'actual',
    },
    another: {
      yoink: 'actual',
      deeply: {
        nested: {
          property,
        },
      },
    },
  };

  const getter0 = createGetter('some', 'very', 'really', 'deeply', 'nested', 'value');
  const getter1 = createGetter('another', 'deeply', 'nested', 'property');
  const getter1A = makeTypeSafeSelector('another', 'deeply', 'nested', 'property')<
    typeof property
  >();
  const getter1B = createGetter('another', 'deeply', 'nested', 'property', '0');
  const getter1C = makeTypeSafeSelector('another', 'deeply', 'nested', 'property', '0')<string>();
  const getter1D = makeTypeSafeSelector('another', 'deeply', 'nested', 'property', '0').bindToInput<
    typeof deepState
  >();
  const getter2 = createGetter('anotherdf', 'deeplyf', 'nestefdfdd', 'propfdferty');
  const getter2B = createGetter('another', 'deeply', 'nestedd', 'property');
  const getter3 = makeTypeSafeSelector(
    'some',
    'very',
    'really',
    'deeply',
    'nested',
    'value1',
  )<number>();

  it('should make working selectors', () => {
    expect(getter0(deepState)).toEqual('actual value');
    expect(getter1(deepState)).toEqual(['property', 'fdf']);
    expect(getter1A(deepState)).toEqual(['property', 'fdf']);
    expect(getter1B(deepState)).toEqual('property');
    expect(getter1C(deepState)).toEqual('property');
    expect(getter1D(deepState)).toEqual('property');
    expect(getter3(deepState)).toEqual(1);
  });

  it('should not throw but return `undefined` for bad paths', () => {
    expect(getter2(deepState as any)).toEqual(undefined);
  });
  beforeEach(() => {
    console.warn = jest.fn();
  });
  it('should warn for bad paths', () => {
    expect(getter2B(deepState as any)).toEqual(undefined);
    expect(console.warn).toHaveBeenCalledTimes(1);
    const [message, badPath, paths] = (console.warn as any).mock.calls[0];
    expect(message).toContain('There is a possible mis-match between the "paths" and "object"');
    expect(badPath).toBe("['nestedd']");
    expect(paths).toBe("['another']['deeply']['nestedd']");
  });
  test('`get` works', () => {
    expect(get(deepState, 'some', 'very', 'really', 'deeply', 'nested', 'value1')).toBe(1);
  });
  it('should warn when called with a null or undefined value', () => {
    expect(get(null as any, 'a', 'path')).toBe(null);
    expect(console.warn).toHaveBeenCalledTimes(1);
    const [message] = (console.warn as any).mock.calls[0];
    expect(message).toContain('A getter was called on an undefined or null value');
  });
  it('should warn when called with non-object value', () => {
    expect(get(5 as any, 'a', 'path', 'to', 'nowhere')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(2);
    const [message, object, path] = (console.warn as any).mock.calls[0];
    expect(message).toContain(
      'Warning: You attempted to call a getter on a Non-Object value, The value is',
    );
    expect(object).toBe(5);
    expect(path).toBe('');
  });
  it('should warn when encountered non-object value along the paths', () => {
    expect(get({ a: { path: 5 } as any }, 'a', 'path', 'to', 'nowhere')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(2);
    const [message, object, path] = (console.warn as any).mock.calls[0];
    expect(message).toContain(
      'Warning: You attempted to call a getter on a Non-Object value, The value is',
    );
    expect(object).toBe(5);
    expect(path).toBe("['a']['path']");
  });
});

describe('makeTypeSafeSelector when first path argument is bad', () => {
  const state = {
    path: {
      suddenly: {
        appears: true,
      },
    },
  };
  it('should ignore the first arg if it is a blank string', () => {
    const selector1 = makeTypeSafeSelector('', 'path', 'suddenly', 'appears')<boolean>();
    const selector2 = makeTypeSafeSelector('', 'path', 'suddenly', 'appears').bindToInput<
      typeof state
    >();
    expect(selector1(state)).toBe(true);
    expect(selector2(state)).toBe(true);
  });
});
describe('makeTypeSafeSelector when final path argument is bad', () => {
  const state = {
    path: {
      suddenly: {
        appears: true,
      },
    },
  };
  beforeEach(() => {
    console.warn = jest.fn();
  });
  it('should warn if the last path is not valid', () => {
    const selector1 = makeTypeSafeSelector('', 'path', 'suddenly', 'appearssss')<boolean>();
    const selector2 = makeTypeSafeSelector('', 'path', 'suddenly', 'appearssss').bindToInput<any>();
    expect(selector1(state as any)).not.toBeDefined();
    expect(selector2(state as any)).not.toBeDefined();
    expect(console.warn).toHaveBeenCalledTimes(2);
    const [message0, path0, paths0] = (console.warn as any).mock.calls[0];
    const [message1, path1, paths1] = (console.warn as any).mock.calls[1];
    expect(message0).toContain(
      'There is a possible mis-match between the final "path" argument and "object"',
    );
    expect(message1).toContain(
      'There is a possible mis-match between the final "path" argument and "object"',
    );
    expect(path0).toBe("['appearssss']");
    expect(path1).toBe("['appearssss']");
    expect(paths0).toBe("['path']['suddenly']['appearssss']");
    expect(paths1).toBe("['path']['suddenly']['appearssss']");
  });
});

describe('makeSelectors', () => {
  describe('with slice', () => {
    describe('initialState is not an object', () => {
      const initialState = ['Foo'];
      const state = { list: ['Foo', 'Bar', 'Baz'] };
      const selectors = makeSelectors(initialState, 'list');
      it('only creates a `selectSlice` selector', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'length')).toBe(false);
        expect(Object.keys(selectors).length).toBe(1);
      });

      it('creates a working `selectSlice` selector', () => {
        expect(selectors.selectSlice(state)).toEqual(['Foo', 'Bar', 'Baz']);
      });
    });
    describe('initialState is an object', () => {
      const initialState = {
        name: '',
        middlename: '',
        surname: '',
      };
      const state = {
        form: {
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        },
      };

      const selectors = makeSelectors(initialState, 'form');

      it('creates a `selectSlice` selector and additional selectors', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'name')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'middlename')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'surname')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'lastname')).toBe(false);
        expect(Object.keys(selectors).length).toBe(4);
      });

      it('creates working selectors', () => {
        expect(selectors.selectSlice(state)).toEqual({
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        });
        expect(selectors.name(state)).toEqual('Foo');
        expect(selectors.middlename(state)).toEqual('Bar');
        expect(selectors.surname(state)).toEqual('Baz');
      });
    });
  });
  describe('without slice', () => {
    describe('state is not an object', () => {
      const state = ['Foo', 'Bar', 'Baz'];
      const selectors = makeSelectors(state, '');
      it('only creates a `selectSlice` selector', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'length')).toBe(false);
        expect(Object.keys(selectors).length).toBe(1);
      });

      it('creates a working `selectSlice` selector', () => {
        expect(selectors.selectSlice(state)).toEqual(['Foo', 'Bar', 'Baz']);
      });
    });
    describe('state is an object', () => {
      const state = {
        name: 'Foo',
        middlename: 'Bar',
        surname: 'Baz',
      };

      const selectors = makeSelectors(state, '');

      it('creates a `selectSlice` selector and additional selectors', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'name')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'middlename')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'surname')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'lastname')).toBe(false);
        expect(Object.keys(selectors).length).toBe(4);
      });

      it('creates working selectors', () => {
        expect(selectors.selectSlice(state)).toEqual({
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        });
        expect(selectors.name(state)).toEqual('Foo');
        expect(selectors.middlename(state)).toEqual('Bar');
        expect(selectors.surname(state)).toEqual('Baz');
      });
    });
  });
});

/*  describe('bindComputedSelectors *could be more OCD*', () => {
    const testState = {
      a: {
        value: {
          used: {
            in: {
              calculation: 5,
            },
          },
        },
      },
      anotherValue: 9,
  
      onlyTheThirdIsUsed: ['', '', 3],
    };
  
    let calc0Called = 0;
    let calc1Called = 0;
  
    const computedSelectors = bindComputedSelectors({
      calc0: (state: typeof testState) => {
        // eslint-disable-next-line no-plusplus
        calc0Called++;
        return state.anotherValue * state.a.value.used.in.calculation;
      },
      calc1: (state: typeof testState) => {
        // eslint-disable-next-line no-plusplus
        calc1Called++;
        return (state.onlyTheThirdIsUsed[2] as number) * state.anotherValue;
      },
    });
    it('Works (calc0)', () => {
      expect(computedSelectors.calc0(testState)).toEqual(45);
      expect(calc0Called).toBe(1);
      expect(calc1Called).toBe(0);
      expect(
        computedSelectors.calc0({
          a: {
            value: {
              used: {
                in: {
                  calculation: 5,
                },
              },
            },
          },
          anotherValue: 9,
          onlyTheThirdIsUsed: [],
        }),
      ).toEqual(45);
      expect(calc0Called).toBe(1);
      expect(
        computedSelectors.calc0({
          a: {
            value: {
              used: {
                in: {
                  calculation: 10, // changed
                },
              },
            },
          },
          anotherValue: 9,
          onlyTheThirdIsUsed: [],
        }),
      ).toEqual(90);
      expect(calc0Called).toBe(2);
    });
  
    it('should work (calc1)', () => {
      expect(computedSelectors.calc1(testState)).toEqual(27);
      expect(calc1Called).toBe(1);
      expect(
        computedSelectors.calc1({
          a: {
            value: {
              used: {
                in: {
                  calculation: 5,
                },
              },
            },
          },
          anotherValue: 9,
  
          onlyTheThirdIsUsed: ['', '', 3],
        }),
      ).toEqual(27);
      expect(calc1Called).toBe(1);
      expect(
        computedSelectors.calc1({
          a: {
            value: {
              used: {
                in: {
                  calculation: 20, // changed
                },
              },
            },
          },
          anotherValue: 9,
  
          onlyTheThirdIsUsed: ['', '', 3],
        }),
      ).toEqual(27);
      expect(calc1Called).toBe(1);
      expect(
        computedSelectors.calc1({
          a: {
            value: {
              used: {
                in: {
                  calculation: 20,
                },
              },
            },
          },
          anotherValue: 10, // changed
  
          onlyTheThirdIsUsed: ['', '', 3],
        }),
      ).toEqual(30);
      expect(calc1Called).toBe(2);
      expect(
        computedSelectors.calc1({
          a: {
            value: {
              used: {
                in: {
                  calculation: 20,
                },
              },
            },
          },
          anotherValue: 10, // changed
  
          onlyTheThirdIsUsed: [5, '0', 3], // no relevant change
        }),
      ).toEqual(30);
      expect(calc1Called).toBe(2);
      expect(
        computedSelectors.calc1({
          a: {
            value: {
              used: {
                in: {
                  calculation: 20,
                },
              },
            },
          },
          anotherValue: 10, // changed
  
          onlyTheThirdIsUsed: [5, '0', 4], // relevant change
        }),
      ).toEqual(40);
      expect(calc1Called).toBe(3);
    });
  }); */

describe('ReMapSelectors', () => {
  const initialState = {
    name: '',
    middlename: '',
    surname: '',
  };

  const altState = {
    data: {
      userA: {
        personalDetails: {
          updated: {
            form: {
              name: 'Foo',
              middlename: 'Bar',
              surname: 'Baz',
            },
          },
        },
      },
    },
  };

  const selectors = makeSelectors(initialState, 'form');
  const selectors1 = makeSelectors(initialState);

  const reMappedSelectors = reMapSelectors(
    selectors,
    'data',
    'userA',
    'personalDetails',
    'updated',
  );
  const reMappedSelectors1 = reMapSelectors(
    selectors1,
    'data',
    'userA',
    'personalDetails',
    'updated',
    'form',
  );

  const reMappedNameSelector = reMapSelectors(
    selectors1.name,
    'data',
    'userA',
    'personalDetails',
    'updated',
    'form',
  );

  it('works when called with a single selector', () => {
    expect(reMappedNameSelector(altState)).toEqual('Foo');
  });

  it('creates a reMapped `selectSlice` selector and additional selectors', () => {
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'selectSlice')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'name')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'middlename')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'surname')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'lastname')).toBe(false);
    expect(Object.keys(reMappedSelectors).length).toBe(4);
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'selectSlice')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'name')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'middlename')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'surname')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'lastname')).toBe(false);
    expect(Object.keys(reMappedSelectors1).length).toBe(4);
  });

  it('creates working reMapped selectors', () => {
    expect(reMappedSelectors.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMappedSelectors.name(altState)).toEqual('Foo');
    expect(reMappedSelectors.middlename(altState)).toEqual('Bar');
    expect(reMappedSelectors.surname(altState)).toEqual('Baz');
    expect(reMappedSelectors1.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMappedSelectors1.name(altState)).toEqual('Foo');
    expect(reMappedSelectors1.middlename(altState)).toEqual('Bar');
    expect(reMappedSelectors1.surname(altState)).toEqual('Baz');
  });
});

describe('makeReMappableSelectors', () => {
  const initialState = {
    name: '',
    middlename: '',
    surname: '',
  };

  const altState = {
    data: {
      userA: {
        personalDetails: {
          updated: {
            form: {
              name: 'Foo',
              middlename: 'Bar',
              surname: 'Baz',
            },
          },
        },
      },
    },
  };

  const selectors = makeSelectors(initialState, 'form');
  const computedSelectors = {
    nameAndMiddleName: (state: { form: typeof initialState }) => {
      // eslint-disable-next-line no-plusplus
      return `${state.form.name} ${state.form.middlename}`;
    },
    fullName(state: { form: typeof initialState }) {
      return `${this.nameAndMiddleName(state)} ${state.form.surname}`;
    },
  };
  const selectors1 = makeSelectors(initialState);
  const computedSelectors1 = {
    nameAndMiddleName: (state: typeof initialState) => {
      // eslint-disable-next-line no-plusplus
      return `${state.name} ${state.middlename}`;
    },
    fullName(state: typeof initialState) {
      return `${this.nameAndMiddleName(state)} ${state.surname}`;
    },
  };
  const mapTo = makeReMapableSelectors(selectors, computedSelectors);
  const mapTo1 = makeReMapableSelectors(selectors1, computedSelectors1);
  const mapTo2 = makeReMapableSelectors(selectors1);

  it('should create a working mapTo utility', () => {
    const reMapped = mapTo('data', 'userA', 'personalDetails', 'updated');
    const reMapped1 = mapTo1('data', 'userA', 'personalDetails', 'updated', 'form');
    const reMapped2 = mapTo2('data', 'userA', 'personalDetails', 'updated', 'form');
    expect(reMapped.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMapped.name(altState)).toEqual('Foo');
    expect(reMapped.middlename(altState)).toEqual('Bar');
    expect(reMapped.surname(altState)).toEqual('Baz');
    expect(reMapped.nameAndMiddleName(altState)).toEqual('Foo Bar');
    expect(reMapped.fullName(altState)).toEqual('Foo Bar Baz');
    expect(
      reMapped.fullName({
        data: {
          userA: {
            personalDetails: {
              updated: {
                form: {
                  name: 'Foo',
                  middlename: 'Bar',
                  surname: 'Bazzy', // changed
                },
              },
            },
          },
        },
      }),
    ).toEqual('Foo Bar Bazzy');
    expect(reMapped1.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMapped1.name(altState)).toEqual('Foo');
    expect(reMapped1.middlename(altState)).toEqual('Bar');
    expect(reMapped1.surname(altState)).toEqual('Baz');
    expect(reMapped1.nameAndMiddleName(altState)).toEqual('Foo Bar');
    expect(reMapped1.fullName(altState)).toEqual('Foo Bar Baz');
    expect(
      reMapped1.fullName({
        data: {
          userA: {
            personalDetails: {
              updated: {
                form: {
                  name: 'Foo',
                  middlename: 'Bar',
                  surname: 'Bazzy', // changed
                },
              },
            },
          },
        },
      }),
    ).toEqual('Foo Bar Bazzy');

    expect(reMapped2.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMapped2.name(altState)).toEqual('Foo');
    expect(reMapped2.middlename(altState)).toEqual('Bar');
    expect(reMapped2.surname(altState)).toEqual('Baz');
  });
});
