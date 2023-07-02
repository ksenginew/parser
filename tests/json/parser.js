// @ts-nocheck
import { Parser } from "../../src/parser.js";

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
  constructor() {
    super({});
  }
  skip = ($) => $.MATCH(WhiteSpace, undefined, false);

  json = ($) => $.RULE("object") || $.RULE("array");

  object = ($) =>
    $.MATCH(LCurly) &&
    ($.RULE("objectItem") && MANY(() => $.MATCH(Comma) && $.RULE("objectItem")),
    true) &&
    $.MATCH(RCurly);

  objectItem = ($) =>
    $.MATCH(StringLiteral) && $.MATCH(Colon) && $.RULE("value");

  array = ($) =>
    $.MATCH(LSquare) &&
    ($.RULE("value") && MANY(() => $.MATCH(Comma) && $.RULE("value")), true) &&
    $.MATCH(RSquare);

  value = ($) =>
    $.MATCH(StringLiteral) ||
    $.MATCH(NumberLiteral) ||
    $.RULE("object") ||
    $.RULE("array") ||
    $.MATCH(True) ||
    $.MATCH(False) ||
    $.MATCH(Null);
}

let parser = new JsonParser();
parser.init(
  JSON.stringify({
    name: "ks",
    age: 19,
  })
);

let nodes = parser.parse("json")?.nodes;
if (!nodes) throw Error("parse error");
