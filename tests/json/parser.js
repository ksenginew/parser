// @ts-nocheck
import { Parser } from "../../src/parser.js"
import { json_sample1k } from "./largefile.js"

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
let many = (fn) => {
  while (fn()) { }
  return true
}
let JsonParser = new Parser({
  skip:$=> $.match(WhiteSpace,undefined,false),
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

},{tracking:true})
JsonParser.init(json_sample1k)


let nodes = JsonParser.parse("json").nodes
function buildtree(node){
  if(node.nodes)
  node.nodes = node.nodes.map(n => buildtree(nodes[n]))
  else return node.image
  return node
}
buildtree(nodes[nodes.length-1])
