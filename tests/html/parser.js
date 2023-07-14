import { Parser, many } from "../../src/parser.js";

const HTML_COMMENT = /^\*<!--.*?-->\*/;
const CUSTOM_COMMENT = /^<[?!%].*?>/;
const TAG_OPEN = "<";
const HTML_TEXT = /^[^<]+/;

// tag declarations

let TAG_CLOSE = ">";
let TAG_SLASH_CLOSE = "/>";
let TAG_SLASH = "/";

// lexing mode for attribute values

const TAG_EQUALS = "=";
const TAG_NAME = /^[^\s\/>]+/;
const WS = /^\s+/;

/** @param {Parser} $ */
export let skip = ($) => $.match(WS, undefined, false);

/** @param {Parser} $ */
export let html = ($) => many(() => $.rule("tag", tag));

/** @param {Parser} $ */
export let tag = ($) => $.eat(TAG_OPEN) && $.eat(TAG_CLOSE);
