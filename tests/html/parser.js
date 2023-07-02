import { Parser, MANY } from "../../src/parser.js";

export let HtmlParser = new Parser(
  {
    html: ($) => $.element(),
    element: ($) =>
      $.TAG_OPEN() &&
      $.tagname() &&
      $.TAG_OPEN() &&
      $.TAG_SLASH() &&
      $.TAG_NAME() &&
      $.TAG_CLOSE(),
  },
  { tracking: true }
);

HtmlParser.init("<html></html>");
console.log(HtmlParser.parse("html")?.nodes);
