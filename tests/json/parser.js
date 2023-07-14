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
export let skip = ($) => $.match(WhiteSpace, undefined, false);

/** @param {Parser} $ */
export let json = ($) => $.rule("object", object) || $.rule("array", array);

/** @param {Parser} $ */
export let object = ($) =>
  $.match(LCurly) &&
  ($.rule("objectItem", objectItem) &&
    many(() => $.match(Comma) && $.rule("objectItem", objectItem)),
  true) &&
  $.match(RCurly);

/** @param {Parser} $ */
export let objectItem = ($) =>
  $.match(StringLiteral) && $.match(Colon) && $.rule("value", value);

/** @param {Parser} $ */
export let array = ($) =>
  $.match(LSquare) &&
  ($.rule("value", value) &&
    many(() => $.match(Comma) && $.rule("value", value)),
  true) &&
  $.match(RSquare);

/** @param {Parser} $ */
export let value = ($) =>
  $.match(StringLiteral) ||
  $.match(NumberLiteral) ||
  $.rule("object", object) ||
  $.rule("array", array) ||
  $.match(True) ||
  $.match(False) ||
  $.match(Null);
