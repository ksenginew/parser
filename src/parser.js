export class Parser {
  /** @type {import("./types").State[]} */
  stack = [{ buffer: "", tree: [], nodes: [], index: 0, id: 0 }];

  /**
   * @param {Partial<import("./types").Options>} options
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * @param {string} input
   */
  init(input) {
    return (this.stack = [
      {
        index: 0,
        id: 0,
        buffer: input,
        nodes: [],
        tree: [],
      },
    ]);
  }

  pushState() {
    /** @type {import("./types").State} */
    let state = {
      ...this.current(),
      tree: [],
    };
    this.stack.unshift(state);
    return state;
  }

  current() {
    return this.stack[0];
  }

  popState() {
    return this.stack.shift();
  }

  /**
   *
   * @param {import("./types").State} state
   */
  mergeState(state) {
    let prev = this.current();
    Object.assign(prev, {
      ...state,
      tree: [...prev.tree, ...state.tree],
    });
  }

  /**
   * @param {string | number} name
   */
  parse(name) {
    // @ts-ignore
    let result = this[name].call(this, this);
    if (result) return this.current();
  }

  /**
   * @param {keyof this} rule
   * @param {{
   *   tag?: string | boolean
   *   name?: string
   * }} [options]
   */
  RULE(rule, { tag, name } = {}) {
    if (typeof rule !== "string") return false;
    return this.GROUP(function () {
      let state = this.pushState();
      let start = state.index;
      let result = /** @type {?} */ (this[rule]).call(this, this);
      if (!result) return false;
      /** @type {import("./types").Node} */
      let node = {
        name: name || rule,
        nodes: state.tree,
        location: this.options.tracking
          ? {
              start,
              end: state.index,
            }
          : undefined,
      };
      // @ts-ignore
      if (typeof result == "object") node = { ...node, ...result };
      state.tree = [state.nodes.push(node) - 1];
      return true;
    });
  }

  /**
   * @param {(this:this, $: Parser) => boolean} fn
   */
  GROUP(fn) {
    let state = this.pushState();
    let result = fn.call(this, this);
    if (state !== this.popState()) {
      throw Error();
    }
    if (!result) return false;
    this.mergeState(state);
    return true;
  }

  /**
   * @param {RegExp} re
   */
  MATCH(
    re,
    matcher = (
      /** @type {RegExpMatchArray} */ m,
      /** @type {import("./types").State} */ state
    ) => ({
      name: "token",
      image: m[0],
      list: [...m],
      location: this.options.tracking
        ? {
            start: state.index,
            end: (state.index += m[0].length),
          }
        : undefined,
      // @ts-ignore
      groups: m.groups,
    }),
    skip = true
  ) {
    if (skip) this.skip();
    let state = this.current();
    let m = state.buffer.match(re);
    if (m) {
      state.buffer = state.buffer.slice(m[0].length);
      state.tree.push(state.nodes.push(matcher(m, state)) - 1);
      return true;
    }
  }

  skip() {}
}

/**
 * @this {Parser}
 * @param {RegExp} re
 */
export function TOKEN(re) {
  return this.MATCH(re);
}

/**
 * @param {() => boolean} fn
 * @param {{gate?: () => boolean}} [options]
 */
export function MANY(fn, { gate } = {}) {
  while ((!gate || gate()) && fn()) {}
  return true;
}
