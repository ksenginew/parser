export class Parser {
    /** @type {import("./types").State[]} */
    stack = [{ buffer: "", tree: [], index: 0 }]

    /** @type {import("./types").Node[]} */
    nodes = []

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
            buffer: input,
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
        prev.index = state.index
        prev.buffer = state.buffer
        prev.tree.push(...state.tree)
    }

    /**
     * @param {string | number} name
     */
    parse(name) {
        // @ts-ignore
        let result = this[name]()
        if (result) return this.current()
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
            nodes: state.tree.map(item => item.index),
            location: this.options.tracking ? {
                start,
                end: state.index,
            } : undefined
        }
        // @ts-ignore
        if (typeof result == "object") node = { ...node, ...result }
        state.tree = [{
            index: this.nodes.push(node),
            nodes: state.tree
        }]
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
            state.tree.push({
                index: this.nodes.push(matcher(m, state)),
            })
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
 */
export function MANY(fn, {gate}) {
    while ((!gate || gate()) && fn()) { }
    return true
}
/**
 * @param {() => boolean} fn
 */
export function OR(fns, {gate}) {
    for(let fn of fns){
        if(gate&&!gate())return false
        if(fn()) return true
    }
    return false
}
