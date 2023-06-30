export class Parser {
    /** @type {import("./types").State[]} */
    stack = [{ buffer: "", tree: [], nodes: [], index: 0, id: 0 }]

    /**
     * @param {import("./types").Rules} rules
     * @param {Partial<import("./types").Options>} options
     */
    constructor(rules, options = {}) {
        this.options = options
        for (let key in rules) {
            let fn = rules[key]
            // @ts-ignore
            if (key == "skip") this.skip = fn
            // @ts-ignore
            this[key] = ($) => this.group(key, fn)
        }
    }

    /**
     * @param {string} input
     */
    init(input) {
        return this.stack = [{
            index: 0,
            id: 0,
            buffer: input,
            nodes: [],
            tree: []
        }]
    }

    pushState() {
        /** @type {import("./types").State} */
        let state = {
            ...this.current(),
            tree: [],
        }
        this.stack.unshift(state)
        return state
    }

    current() {
        return this.stack[0]
    }

    popState() {
        return this.stack.shift()
    }

    /**
     *
     * @param {import("./types").State} state
     */
    mergeState(state) {
        let prev = this.current()
        Object.assign(prev, {
            ...state,
            tree: [...prev.tree, ...state.tree]
        })
    }

    /**
     * @param {string | number} name
     */
    parse(name) {
        // @ts-ignore
        let result = this[name]()
        if (result)
            return this.current()
    }

    /**
     * @param {string} name
     * @param {($: Parser) => boolean} fn
     */
    group(name, fn) {
        let state = this.pushState()
        let start = state.index
        let result = fn.call(this, this)
        if (state !== this.popState()) {
            throw Error()
        }
        if (!result) return false
        /** @type {import("./types").Node} */
        let node = {
            name,
            nodes: state.tree,
            location: this.options.tracking ? {
                start,
                end: state.index,
            } : undefined
        }
        // @ts-ignore
        if (typeof result == "object") node = { ...node, ...result }
        state.tree = [state.nodes.push(node) - 1]
        this.mergeState(state)
        return true
    }

    /**
    * @param {{ [Symbol.match](string: string): RegExpMatchArray | null; }} re
    */
    match(
        re,
        matcher = (/** @type {RegExpMatchArray} */ m,/** @type {import("./types").State} */ state) => ({
            name: "token",
            image: m[0],
            list: [...m],
            location: this.options.tracking ? {
                start: state.index,
                end: (state.index += m[0].length)
            } : undefined,
            // @ts-ignore
            groups: m.groups,
        }),
        skip = true
    ) {
        if (skip) this.skip()
        let state = this.current()
        let m = state.buffer.match(re)
        if (m) {
            state.buffer = state.buffer.slice(m[0].length)
            state.tree.push(state.nodes.push(matcher(m, state)) - 1)
            return true
        }
    }

    skip() { }
}

/**
 * @param {any[]} args
 */
export function OPTION(...args) {
    return true
}

/**
 * @param {() => boolean} fn
 * @param {{gate?: () => boolean}} [options]
 */
export function MANY(fn, { gate } = {}) {
    while ((!gate || gate()) && fn()) { }
    return true
}
/**
 * @param {(() => boolean)[]} fns
 * @param {{gate?: () => boolean}} [options]
 */
export function OR(fns, { gate } = {}) {
    for (let fn of fns) {
        if (gate && !gate()) return false
        if (fn()) return true
    }
    return false
}
