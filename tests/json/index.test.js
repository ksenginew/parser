import test from "ava";
import { Parser } from "../../src/parser.js";
import { sample } from "./sample.js";
import { json, skip } from "./parser.js";

/**
 * @param {import("../../src/types.js").Node} node
 * @param {import("../../src/types.js").Node[]} nodes
 */
function buildtree(node, nodes) {
  if (node.nodes)
    // @ts-ignore
    node.nodes = node.nodes.map((n) => buildtree(nodes[n], nodes));
  return node;
}

test("JSON", (t) => {
  let parser = new Parser({ tracking: true, skip });
  parser.init(
    JSON.stringify({
      name: "ks",
      age: 19,
    }),
  );

  let nodes = parser.parse("json", json)?.nodes;
  if (!nodes) throw Error("parse error");

  t.snapshot(buildtree(nodes[nodes.length - 1], nodes));
});

test("JSON2", (t) => {
  let parser = new Parser({ tracking: true, skip });

  parser.init(sample);

  let result = parser.parse("json", json);
  let nodes = result?.nodes;
  if (!nodes) throw Error(result?.buffer);

  t.snapshot(buildtree(nodes[nodes.length - 1], nodes));
});
