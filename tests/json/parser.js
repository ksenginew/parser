import { Parser,MANY } from "../../src/parser.js";

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
