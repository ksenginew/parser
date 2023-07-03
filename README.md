# Experimental parser

This parser is based on concept of state. Here let's see an example of parser

this parser has two paths - boolean - true - false - name

1. parser creates a state. then start parsing boolean on that scope.
2. when we fails. then it should be a name. so delete the state.
3. create a new state and start parsing name.
4. success. so this scope is merged to parent scope
5. return the results (LOL)

A simple JSON parser looks like,

```js
import { Parser,MANY } from "parser.js";

const True = /^true/;
const False = /^false/;
const Null = /^null/;
const LCurly = /^{/;
const RCurly = /^}/;
const LSquare = /^\[/;
const RSquare = /^]/;
const Comma = /^,/;
const Colon = /^:/;
const StringLiteral = /^"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/;
const NumberLiteral = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;
const WhiteSpace = /^[ \t\n\r]+/;

export class JsonParser extends Parser {
  // @ts-ignore
  skip = ($) => $.MATCH(WhiteSpace, undefined, false);

  // @ts-ignore
  json = ($) => 
     $.RULE("object") || $.RULE("array");

  // @ts-ignore
  object = ($) =>
    $.MATCH(LCurly) &&
    ($.RULE("objectItem") && MANY(() => $.MATCH(Comma) && $.RULE("objectItem")),
    true) &&
    $.MATCH(RCurly);

  // @ts-ignore
  objectItem = ($) =>
    $.MATCH(StringLiteral) && $.MATCH(Colon) && $.RULE("value");

  // @ts-ignore
  array = ($) =>
    $.MATCH(LSquare) &&
    ($.RULE("value") && MANY(() => $.MATCH(Comma) && $.RULE("value")), true) &&
    $.MATCH(RSquare);

  // @ts-ignore
  value = ($) =>
    $.MATCH(StringLiteral) ||
    $.MATCH(NumberLiteral) ||
    $.RULE("object") ||
    $.RULE("array") ||
    $.MATCH(True) ||
    $.MATCH(False) ||
    $.MATCH(Null);
}
```

then use it,
```js
let parser = new JsonParser({tracking:true});

parser.init(sample);
let nodes = parser.parse("json")?.nodes;
console.log(nodes)
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/github/ksenginew/parser?file=tests%2Fjson%2Fparser.js)

Just run `npm test`
