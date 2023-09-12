import { Parser } from "../../src/parser.js";

const HTML_COMMENT = /^\*<!--.*?-->\*/;
const CUSTOM_COMMENT = /^<[?!%].*?>/;
const TAG_OPEN = "<";
const HTML_TEXT = /^[^<]+/;
const VOID_ELEMENTS =
    /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
const UNKNOWN = /^(script|style|textarea)$/
const STRING = /^("(\\"|[^"])*"|'(\\'|[^'])*')/

// tag declarations

let TAG_CLOSE = ">";
let TAG_SLASH_CLOSE = "/>";
let TAG_SLASH = "/";

// lexing mode for attribute values

const TAG_EQUALS = "=";
const TAG_NAME = /^[^\s\/>]+/;
const WS = /^\s+/;

/** @param {Parser} $ */
export let skip = ($) => $.eat(WS, false);

/** @param {Parser} $ */
export let html = ($) =>
    $.many(() =>
        $.or([
            () => $.eat(HTML_COMMENT),
            () => $.eat(CUSTOM_COMMENT),
            () => $.rule("text"),
            () => $.rule("tag"),
        ]),
    );

/** @param {Parser} $ */
export let tag = ($) => {
    /**
     * @type {string}
     */
    let tagName;
    return (
        $.eat(TAG_OPEN) &&
        $.eat(TAG_NAME, true, (token) => {
            tagName = token.image;
            return token;
        }) &&
        $.many(attr, { name: "attr" }) &&
        $.or([
            () =>
                $.eat(TAG_CLOSE) && VOID_ELEMENTS.test(tagName)
                    ? true
                    : (UNKNOWN.test(tagName) ? $.eat(new RegExp(`[^]*(?=<\\/${tagName}\\s*>)`)) : html($)) &&
                    $.eat(TAG_OPEN) &&
                    $.eat(TAG_SLASH) &&
                    $.eat(tagName) &&
                    $.eat(TAG_CLOSE),
            () => $.eat(TAG_SLASH_CLOSE),
        ])
    );
};

/** @param {Parser} $ */
export let attr = ($) =>
    $.eat(WS, false) && $.eat(TAG_NAME) && $.optional(() => $.eat(TAG_EQUALS) && $.eat(STRING));

/** @param {Parser} $ */
export let text = ($) => $.eat(HTML_TEXT);

/**
 * @param {Partial<import("../../src/types.js").Options> | undefined} options
 */
export function HtmlParser(options) {
    return new Parser({ html, tag, attr, text, skip }, options);
}
