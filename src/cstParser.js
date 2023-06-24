export class BaseParser {
    /** @type {import("./types").State[]} */
    stack = [{ buffer: "", nodes: []}]

    constructor(rules) {
this.ruleset = rules
    }

    pushState() {
        return this.stack.unshift({
            ...this.current(),
            nodes: [],
        })
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
        let prev = this.getState()
        prev.input = state.input
        prev.nodes.push(...state.nodes)
    }

    /**
     * @param {string} name
     * @param {(parser: this) => boolean} fn
     * @param {{
     *   tag?: string
     * }} [options]
     */
    GROUP(name, fn, { tag } = {}) {
        this.pushState()
        let result = fn.call(this, this)
        let state = this.popState()
        if (!state?.nodes.length) return 
        /** @type {import("./types").Node} */
        let node = {
             name,
            nodes: state.nodes,
            tag: tag,
        }
        state.nodes.forEach((n) => {
            // @ts-ignore
            if (n.tag) node[n.tag] = n
        })
        // @ts-ignore
        if (typeof result == "object") node = { ...node, ...result }
        state.nodes = [node]
        this.mergeState(state)
        return true
    }

    /**
     * @param {RegExp|string} re
     * @param {(match:RegExpMatchArray) => import("./types").Token} matcher
     */
    MATCH(
        re,
        matcher = (m) => ({
            token: "any",
            value: m[0],
            list: [...m],
            index: m.index,
            groups: m.groups,
        }),
        skip = true
    ) {
        if (skip) this.SKIP()
        let state = this.getState()
        // @ts-ignore
        let m = state.input.match(new RegExp(`^(?:${re.source || re})`))
        if (m) {
            state.input = state.input.slice(m[0].length)
            return matcher(m)
        }
    }

    SKIP() {
        return true
    }
}