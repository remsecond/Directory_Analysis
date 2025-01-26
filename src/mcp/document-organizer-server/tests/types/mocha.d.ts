declare module 'mocha' {
  export interface Context {
    [key: string]: any;
  }

  global {
    function describe(name: string, fn: () => void): void;
    function describe(name: string, fn: (this: Context) => Promise<void>): void;
    
    function before(fn: () => void): void;
    function before(fn: () => Promise<void>): void;
    
    function after(fn: () => void): void;
    function after(fn: () => Promise<void>): void;
    
    function beforeEach(fn: () => void): void;
    function beforeEach(fn: () => Promise<void>): void;
    
    function afterEach(fn: () => void): void;
    function afterEach(fn: () => Promise<void>): void;
    
    function it(name: string, fn: () => void): void;
    function it(name: string, fn: () => Promise<void>): void;
  }
}

declare module 'chai' {
  interface Assertion {
    (target: any, message?: string): Assertion;
    to: Assertion;
    be: Assertion;
    been: Assertion;
    is: Assertion;
    that: Assertion;
    which: Assertion;
    and: Assertion;
    has: Assertion;
    have: Assertion;
    with: Assertion;
    at: Assertion;
    of: Assertion;
    same: Assertion;
    not: Assertion;
    deep: Assertion;
    any: Assertion;
    all: Assertion;
    length: Assertion;
    lengthOf: Assertion;
    equal: Assertion;
    equals: Assertion;
    eq: Assertion;
    above: Assertion;
    gt: Assertion;
    greaterThan: Assertion;
    least: Assertion;
    gte: Assertion;
    below: Assertion;
    lt: Assertion;
    lessThan: Assertion;
    most: Assertion;
    lte: Assertion;
    within: Assertion;
    instanceof: Assertion;
    instanceOf: Assertion;
    property: Assertion;
    ownProperty: Assertion;
    haveOwnProperty: Assertion;
    true: Assertion;
    false: Assertion;
    null: Assertion;
    undefined: Assertion;
    exist: Assertion;
    empty: Assertion;
    arguments: Assertion;
    Arguments: Assertion;
    include: Assertion;
    includes: Assertion;
    contain: Assertion;
    contains: Assertion;
    throw: Assertion;
    Throw: Assertion;
    respondTo: Assertion;
    itself: Assertion;
    satisfy: Assertion;
    closeTo: Assertion;
    members: Assertion;
    oneOf: Assertion;
    change: Assertion;
    increase: Assertion;
    decrease: Assertion;
    by: Assertion;
    ordered: Assertion;
    keys: Assertion;
    key: Assertion;
    match: Assertion;
    string: Assertion;
    rejectedWith: Assertion;
    fulfilled: Assertion;
    rejected: Assertion;
    notify: Assertion;
  }

  export const expect: {
    (target: any, message?: string): Assertion;
    fail(actual?: any, expected?: any, msg?: string, operator?: string): void;
  };
}
