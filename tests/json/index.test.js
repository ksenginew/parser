import test from 'ava';
import { JsonParser } from './parser.js';
import { sample } from './sample.js';



/**
 * @param {import("../../src/types.js").Node} node
 * @param {import("../../src/types.js").Node[]} nodes
 */
function buildtree(node,nodes) {
  if (node.nodes)
    // @ts-ignore
    node.nodes = node.nodes.map(n => buildtree(nodes[n],nodes))
  return node
}

test('JSON', t => {

  JsonParser.init(JSON.stringify({
    name: "ks",
    age: 19
  }))

  let nodes = JsonParser.parse("json")?.nodes
  if (!nodes) throw Error("parse error")

  t.snapshot(buildtree(nodes[nodes.length - 1],nodes));
})

test('JSON2', t => {
   JsonParser.init(sample)

   let nodes = JsonParser.parse("json")?.nodes
   if (!nodes) throw Error("parse error")

   t.snapshot(buildtree(nodes[nodes.length - 1],nodes));

});