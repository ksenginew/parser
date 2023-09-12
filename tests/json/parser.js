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

/** @param {Parser} $ */
export let skip = ($) => $.eat(WhiteSpace, false);

/** @param {Parser} $ */
export let json = ($) => $.rule("object") || $.rule("array");

/** @param {Parser} $ */
export let object = ($) =>
  $.eat(LCurly) &&
  ($.rule("objectItem") && $.many(() => $.eat(Comma) && $.rule("objectItem")),
  true) &&
  $.eat(RCurly);

/** @param {Parser} $ */
export let objectItem = ($) =>
  $.eat(StringLiteral) && $.eat(Colon) && $.rule("value");

/** @param {Parser} $ */
export let array = ($) =>
  $.eat(LSquare) &&
  ($.rule("value") && $.many(() => $.eat(Comma) && $.rule("value")), true) &&
  $.eat(RSquare);

/** @param {Parser} $ */
export let value = ($) =>
  $.eat(StringLiteral) ||
  $.eat(NumberLiteral) ||
  $.rule("object") ||
  $.rule("array") ||
  $.eat(True) ||
  $.eat(False) ||
  $.eat(Null);

/**
 * @param {Partial<import("../../src/types.js").Options> | undefined} options
 */
export function JsonParser(options) {
  return new Parser({ json, object, objectItem, array, value, skip }, options);
}
