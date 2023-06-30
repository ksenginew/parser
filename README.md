# Experimental parser

This parser is based on concept of state. Here let's see an example of parser

this parser has two paths
    - boolean
        - true
        - false
    - name

1. parser creates a state. then start parsing boolean on that scope.
2. when we fails. then it should be a name. so delete the state.
3. create a new state and start parsing name.
4. success. so this scope is merged to parent scope
5. return the results (LOL)

A simple JSON parser looks like,
```js
import { Parser } from "../../src/parser.js"

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

export let JsonParser = new Parser({
  skip: $ => $.match(WhiteSpace, undefined, false),
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

}, { tracking: true })
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/github/ksenginew/parser/tests/json/parser.js)

Just run `npm test`
