class Parser {
    /** @type {import("./types").State[]} */
    stack = [{ buffer: "", nodes: [] }]

    /**
     * @param {import("./types").Rules} rules
     */
    constructor(rules) {
        for (let key in rules) {
            let fn = rules[key]
            // @ts-ignore
            this[key] = ($) => this.group(key, fn)
        }
    }

    /**
     * @param {string} input
     */
    init(input){
        return this.stack=[{
            buffer:input,
            nodes: [],
        }]
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
        let prev = this.current()
        prev.buffer = state.buffer
        prev.nodes.push(...state.nodes)
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
     * @param {($: BaseParser) => boolean} fn
     */
    group(name, fn) {
        this.pushState()
        let result = fn.call(this, this)
        let state =/** @type {import("./types").State} */ (this.popState())
        if (!result) return false
        /** @type {import("./types").Node} */
        let node = {
            name,
            nodes: state.nodes,
        }
        // @ts-ignore
        if (typeof result == "object") node = { ...node, ...result }
        state.nodes = [node]
        this.mergeState(state)
        return true
    }

     /**
     * @param {{ [Symbol.match](string: string): RegExpMatchArray | null; }} re
     */
     match (
        re,
        matcher=(/** @type {any[]} */ m)=>(m[0]),
        // matcher = (/** @type {RegExpMatchArray[]} */ m) => ({
        //     name: "any",
        //     value: m[0],
        //     list: [...m],
        //     // @ts-ignore
        //     index: m.index,
        //     // @ts-ignore
        //     groups: m.groups,
        // }),
        skip = true
    ) {
        if (skip) this.skip()
        let state = this.current()
        let m = state.buffer.match(re)
        if (m) {
            state.buffer = state.buffer.slice(m[0].length)
            state.nodes.push(matcher(m))
            return true
        }
        if(!skip) return true
    }

    skip(){}
}


const True = /^true/
const False = /^false/
const Null = /^null/
const LCurly = /^{/
const RCurly = /^}/
const LSquare = /^\[/
const RSquare = /^]/
const Comma = /^,/
const Colon = /^:/
const StringLiteral = /^"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
const NumberLiteral = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
const WhiteSpace = /^[ \t\n\r]+/
let many = (fn) => {
  while (fn()) { }
  return true
}
let JsonParser = new Parser({
  skip:$=> $.match(WhiteSpace,undefined,false),
  json: $ => $.object() || $.array(),

  object: $ =>
    $.match(LCurly) &&
    ($.objectItem() &&
      many(() => 
        $.match(Comma) &&
        $.objectItem()
      ), true) &&
    $.match(RCurly),

  objectItem: $ =>
    $.match(StringLiteral) &&
    $.match(Colon) &&
    $.value(),

  array: $ =>
    $.match(LSquare) &&
    ($.value() &&
      many(() =>
        $.match(Comma) &&
        $.value()
      ), true)
    && $.match(RSquare),

  value: $ =>
    $.match(StringLiteral) ||
    $.match(NumberLiteral) ||
    $.object() ||
    $.array() ||
    $.match(True) ||
    $.match(False) ||
    $.match(Null)

})

console.log(33)
function parse(text) {
    JsonParser.init(text)
    return {
        value: JsonParser.parse("json"), 
        lexErrors: [],
        parseErrors: []
    };
}

parse("{}")

