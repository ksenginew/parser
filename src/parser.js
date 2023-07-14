export class Parser {

  /** @type {import("./types").State[]} */
  stack = [{ buffer: "", tree: [], nodes: [], index: 0, id: 0 }];

  /**
   * @param {Partial<import("./types").Options>} options
   */
  constructor(options = {}) {
    this.options = options;
    this.skip = options.skip || (() => false);
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
   * @param {string} name
   * @param {(this: this, $: this) => boolean | undefined } fn
   */
  parse(name, fn) {
    debugger;
    let result = this.rule(name, fn);
    if (result) return this.current();
  }

  /**
   * @param {string} name
   * @param {(this: this, $: this) => boolean | undefined} fn
   * @param {{
   *   tag?: string | boolean
   * }} [options]
   */
  rule(name, fn, { tag } = {}) {
    return this.group(function () {
      let state = this.current();
      let start = state.index;
      let result = fn.call(this, this);
      if (!result) return false;
      /** @type {import("./types").Node} */
      let node = {
        name,
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
    })
  }


  /**
   * @param {(this:this, $: this) => boolean | undefined} fn
   */
  group(fn) {
    let state = this.pushState();
    let result = fn.call(this, this);
    if (state !== this.popState()) {
      console.error(this.stack);
      throw Error("bad state");
    }
    if (!result) return false;
    this.mergeState(state);
    return true;
  }

  /**
     * @param {(this: this, $: this) => boolean | undefined} fn
     * @param {{ name?: string, times?: number }} [options]
     */
  many(fn, { name, times } = {}) {
    let count = 0
    while (name ? this.rule(name, fn) : this.group(fn)) { count++ }
    return !times || count === times
  }

  /**
     * @param {(this: this, $: this) => boolean | undefined} fn
     * @param {{ name?: string }} [options]
     */
  optional(fn, { name } = {}) {
    return (name ? this.rule(name, fn) : this.group(fn))
  }
  
  /**
     * @param {((this: this, $: this) => boolean | undefined)[]} fns
     * @param {{ name?: string }} [options]
     */
  or(fns, { name } = {}) {
    return fns.some(fn=>(name ? this.rule(name, fn) : this.group(fn)))
  }

  /**
   * @param {RegExp | string} re
   * @returns {RegExpMatchArray | null | undefined}
   */
  match(
    re,
    skip = true,
  ) {
    if (skip) this.rule("skip", this.skip);
    let state = this.current();
    let m;
    if (typeof re === 'object') {
      if (re.source[0] !== '^')
        re = new RegExp(`^(?:${re.source})`)
      return state.buffer.match(re);
    }
    else if (state.buffer.startsWith(re)) {
      return [re]
    }
  }

  /**
   * @param {string | RegExp} re
   */
  eat(re,
    matcher = (
      /** @type {RegExpMatchArray} */ m,
      /** @type {import("./types").State} */ state,
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
    skip = true) {
    let state = this.current();
    let m = this.match(re, skip)
    if (m) {
      state.buffer = state.buffer.slice(m[0].length);
      state.tree.push(state.nodes.push(matcher(m, state)) - 1);
      return true;
    }
    return false
  }
}

/**
 * @this {Parser}
 * @param {RegExp} re
 */
export function TOKEN(re) {
  return this.match(re);
}

/**
 * @param {() => boolean | undefined} fn
 * @param {{gate?: () => boolean | undefined}} [options]
 */
export function many(fn, { gate } = {}) {
  while ((!gate || gate()) && fn()) { }
  return true;
}
