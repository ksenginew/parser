import { Parser, many } from "../../src/parser.js";

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

/** @param {Parser} $ */
export let skip = ($) => $.eat(WhiteSpace, undefined, false);

/** @param {Parser} $ */
export let json = ($) => $.rule("object", object) || $.rule("array", array);

/** @param {Parser} $ */
export let object = ($) =>
  $.eat(LCurly) &&
  ($.rule("objectItem", objectItem) &&
    many(() => $.eat(Comma) && $.rule("objectItem", objectItem)),
  true) &&
  $.eat(RCurly);

/** @param {Parser} $ */
export let objectItem = ($) =>
  $.eat(StringLiteral) && $.eat(Colon) && $.rule("value", value);

/** @param {Parser} $ */
export let array = ($) =>
  $.eat(LSquare) &&
  ($.rule("value", value) &&
    many(() => $.eat(Comma) && $.rule("value", value)),
  true) &&
  $.eat(RSquare);

/** @param {Parser} $ */
export let value = ($) =>
  $.eat(StringLiteral) ||
  $.eat(NumberLiteral) ||
  $.rule("object", object) ||
  $.rule("array", array) ||
  $.eat(True) ||
  $.eat(False) ||
  $.eat(Null);
